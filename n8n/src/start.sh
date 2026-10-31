#!/bin/sh
# Starts n8n. N8N_ROLE picks the process: main (default: editor + webhooks) or worker (queue mode, no web).
set -eu

ROLE="${N8N_ROLE:-main}"
cd "$(dirname "$0")"
SELF="$PWD/$(basename "$0")"

# Defaults the platform does not set; each one can be overridden in the app variables.
export N8N_USER_FOLDER="${N8N_USER_FOLDER:-$PWD}"   # data in .n8n, on the persistent disk
export N8N_RUNNERS_MODE="${N8N_RUNNERS_MODE:-internal}"   # JavaScript Code node: a runner process next to n8n, no extra container
export N8N_COMMUNITY_PACKAGES_ENABLED="${N8N_COMMUNITY_PACKAGES_ENABLED:-true}"
export N8N_UNVERIFIED_PACKAGES_ENABLED="${N8N_UNVERIFIED_PACKAGES_ENABLED:-true}"
export N8N_REINSTALL_MISSING_PACKAGES="${N8N_REINSTALL_MISSING_PACKAGES:-true}"
export N8N_BLOCK_ENV_ACCESS_IN_NODE="${N8N_BLOCK_ENV_ACCESS_IN_NODE:-true}"
export N8N_COMPRESSION_NODE_MAX_DECOMPRESSED_SIZE_BYTES="${N8N_COMPRESSION_NODE_MAX_DECOMPRESSED_SIZE_BYTES:-268435456}"
export N8N_COMPRESSION_NODE_MAX_ZIP_ENTRIES="${N8N_COMPRESSION_NODE_MAX_ZIP_ENTRIES:-1000}"

# Modules the Code node may require (VERTRA_CODE_MODULES=safe | all). `safe` leaves out fs, child_process, net, http and the like.
if [ "${VERTRA_CODE_MODULES:-safe}" = "all" ]; then
  export NODE_FUNCTION_ALLOW_BUILTIN="*"
else
  export NODE_FUNCTION_ALLOW_BUILTIN="crypto,url,path,util,zlib,buffer,querystring,string_decoder,events,stream,assert"
fi
export NODE_FUNCTION_ALLOW_EXTERNAL="${VERTRA_JS_EXTERNAL_ALLOW:-moment}"

mkdir -p "$N8N_USER_FOLDER/.n8n"

# n8n only takes the owner as a bcrypt hash. Without the password the editor refuses to start, or the first visitor would become admin.
if [ "$ROLE" = "main" ] && [ -z "${VERTRA_BOOTED:-}" ]; then
  if [ -z "${VERTRA_OWNER_PASSWORD:-}" ] || [ "${N8N_INSTANCE_OWNER_MANAGED_BY_ENV:-}" != "true" ] || [ -z "${N8N_INSTANCE_OWNER_EMAIL:-}" ]; then
    echo "[vertra] owner not configured (N8N_INSTANCE_OWNER_*, VERTRA_OWNER_PASSWORD); refusing to start without an administrator" >&2
    exit 64
  fi
  HASH="$(node -e 'process.stdout.write(require("bcryptjs").hashSync(process.env.VERTRA_OWNER_PASSWORD, 10))')" || { echo "[vertra] could not hash the owner password" >&2; exit 70; }
  case "$HASH" in '$2'*) ;; *) echo "[vertra] invalid owner password hash" >&2; exit 70 ;; esac
  # Re-exec without the password: unsetting it in this shell would leave it in /proc/<pid>/environ.
  exec env -u VERTRA_OWNER_PASSWORD VERTRA_BOOTED=1 N8N_INSTANCE_OWNER_PASSWORD_HASH="$HASH" sh "$SELF"
fi
unset VERTRA_BOOTED

# Queue Redis with a client certificate: see redis-tls-client.cjs. A node flag, not NODE_OPTIONS, so child processes do not inherit it.
if [ -n "${VERTRA_TLS_CLIENT_HOST:-}" ]; then
  set -- --require "$PWD/redis-tls-client.cjs"
else
  set --
fi

case "$ROLE" in
  main) exec node "$@" node_modules/n8n/bin/n8n ;;
  worker) exec node "$@" node_modules/n8n/bin/n8n worker --concurrency="${N8N_WORKER_CONCURRENCY:-5}" ;;
  *) echo "[vertra] invalid N8N_ROLE: $ROLE" >&2; exit 64 ;;
esac
