#!/bin/sh
# OpenClaw entrypoint. The program is the `openclaw` npm package in /app/node_modules (installed by the platform from package-lock.json);
# all state is in /app/.openclaw (HOME=/app). openclaw.json is generated once and then belongs to the user; only gateway.trustedProxies
# is refreshed on every boot.
set -eu

cd "$(dirname "$0")"
OC="node node_modules/openclaw/openclaw.mjs"
STATE="$HOME/.openclaw"
CONFIG="$STATE/openclaw.json"

# Code apps listen on port 80.
export OPENCLAW_GATEWAY_PORT="${PORT:-80}"
export NODE_ENV=production OPENCLAW_BROWSER_HEADLESS=1
# npm cache of the plugin installs (doctor, channels): .cache stays out of snapshots and downloads.
export npm_config_cache="$HOME/.cache/npm"

if [ -z "${OPENCLAW_GATEWAY_TOKEN:-}" ]; then
  echo "OPENCLAW_GATEWAY_TOKEN is required" >&2
  exit 64
fi

# Agent model on every boot: OPENCLAW_MODEL is the provider option's default (full id); OPENCLAW_MODEL_ID is what the user
# typed and wins over it. The config only stores the ${OPENCLAW_MODEL_REF} reference.
P="${OPENCLAW_PROVIDER:-}"
M="${OPENCLAW_MODEL_ID:-}"
if [ -n "$M" ] && [ -n "$P" ]; then
  case "$M" in "$P"/*) export OPENCLAW_MODEL_REF="$M" ;; *) export OPENCLAW_MODEL_REF="$P/$M" ;; esac
elif [ "$P" = "custom" ]; then
  echo "OPENCLAW_MODEL_ID is required with an OpenAI-compatible endpoint" >&2
  exit 64
elif [ -n "${OPENCLAW_MODEL:-}" ]; then
  export OPENCLAW_MODEL_REF="$OPENCLAW_MODEL"
fi

if [ ! -f "$CONFIG" ]; then
  node bootstrap.mjs "$CONFIG"
else
  # The container subnet can change between recreations.
  node bootstrap.mjs --refresh-proxies "$CONFIG" || true
fi

# OpenClaw requires approval for each new device, and only the CLI can do it. While no device is paired, the first request
# from someone holding the gateway token is approved here; the loop ends after that or after
# OPENCLAW_BOOTSTRAP_PAIRING_MINUTES (default 120). OPENCLAW_BOOTSTRAP_PAIRING=off disables it.
if [ "${OPENCLAW_BOOTSTRAP_PAIRING:-on}" != "off" ]; then
  (
    deadline=$(( $(date +%s) + ${OPENCLAW_BOOTSTRAP_PAIRING_MINUTES:-120} * 60 ))
    sleep 20
    while [ "$(date +%s)" -lt "$deadline" ]; do
      out=$($OC devices list --json 2>/dev/null || true)
      verdict=$(printf '%s' "$out" | node -e '
        let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
          try{const j=JSON.parse(s.slice(s.indexOf("{")));
            if((j.paired||[]).length){console.log("done");return}
            const p=(j.pending||[]).find(r=>r.role==="operator"&&!r.isRepair);
            console.log(p?p.requestId:"wait")}catch{console.log("wait")}})' 2>/dev/null || echo wait)
      case "$verdict" in
        done) break ;;
        wait|"") ;;
        *) $OC devices approve "$verdict" >/dev/null 2>&1 || true ;;
      esac
      sleep 15
    done
  ) &
fi

# The doctor (state migrations, channel plugins) runs only when the OpenClaw version differs from the one that wrote the state.
VERSION=$(node -p "require('./node_modules/openclaw/package.json').version")
if [ "$(cat "$STATE/.vertra-version" 2>/dev/null || true)" = "$VERSION" ]; then
  exec $OC gateway
fi
printf '%s' "$VERSION" > "$STATE/.vertra-version.next"
$OC doctor --fix --non-interactive || echo "[vertra] doctor exited with $?; starting the gateway anyway" >&2
(
  # record the version only after the gateway answered
  i=0
  while [ "$i" -lt 120 ]; do
    sleep 5; i=$((i + 1))
    if node -e "fetch('http://127.0.0.1:${OPENCLAW_GATEWAY_PORT}/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))" 2>/dev/null; then
      mv "$STATE/.vertra-version.next" "$STATE/.vertra-version"; break
    fi
  done
) &
exec $OC gateway
