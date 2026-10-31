#!/usr/bin/env python3
"""Hermes Agent entrypoint: downloads the pinned sources on the first start (SHA-256 checked), builds the dashboard, then runs Caddy (the only
public port and login), the gateway, the dashboard and, optionally, the WebUI. State lives in /app/.hermes."""
import hashlib
import os
import platform
import shutil
import signal
import subprocess
import sys
import tarfile
import threading
import time
import urllib.request
from pathlib import Path

# Hermes is tag v0.22.5; to upgrade, change the pins together with requirements.txt.
HERMES = {"repo": "NousResearch/hermes-agent", "commit": "bf0203a794a07aac3ff764972ab9087baa4e4f4e", "sha256": "0dc2cca54657d162845a77f634e107c61c3fb0bd6c8505212aa2e200591b7cc9"}
WEBUI = {"repo": "nesquena/hermes-webui", "commit": "687d80333870c3797d6858738621fca13d1bf27a", "sha256": "bde1ee26c90da3988164874c623fde293a9d1b1e7104544f2cbae25753ded341"}
HERMES_SKIP = {"tests", "evals", ".github", "nix", "contributors", "assets", "website"}
WEBUI_SKIP = {"tests", "docs", ".github"}
NODE = {"version": "24.22.2", "sha256": {"x64": "48cc0e21e048790e54c0cf5749c2725005313d652651c40b7a21feb9697aaf75", "arm64": "eb187837a2230d4047161ac0be008584e16b46f726e9c9490ee35dc6b17d9ba8"}}

APP = Path("/app")
HERMES_HOME = Path(os.environ.get("HERMES_HOME") or APP / ".hermes")
HERMES_DIR = APP / "hermes-agent"
WEBUI_DIR = APP / "hermes-webui"
STATE_DIR = HERMES_HOME / "webui"
NODE_DIR = APP / ".local" / "node"
CADDY_DIR = APP / ".local" / "caddy"
WEB_DIST = APP / "hermes-web"
TUI_DIR = APP / "hermes-tui"
WA_SESSION = HERMES_HOME / "platforms" / "whatsapp" / "session"
PORT = int(os.environ.get("PORT") or 80)
PASSWORD_VAR = "HERMES_ADMIN_PASSWORD"
HASH_VAR = "VERTRA_CADDY_HASH"
# SHA-256 of the release .tar.gz (the release itself lists SHA-512).
CADDY = {"version": "2.11.7", "sha256": {"amd64": "727b91701a392de6ebc5027509f548bf39979e5216340d0faed8fa5e69c84f8b", "arm64": "d8fc6d179a5d283028a472a5618564f6ad8a86fed513e64f032b3b0b7cc45e42"}}


def log(msg):
    print(f"[vertra] {msg}", flush=True)


def truthy(value):
    return str(value or "").strip().lower() in {"1", "true", "yes", "on"}


def write_private(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        f.write(text)
    os.replace(tmp, path)


def fetch(label, url, sha256, dest, keep, strip=True):
    """Downloads, checks the SHA-256 and unpacks into dest (only paths `keep` accepts); the pin marker makes later starts a no-op."""
    marker = dest / ".vertra-pin"
    want = f"{url} {sha256}"
    try:
        if marker.read_text() == want:
            return
    except OSError:
        pass
    work = APP / ".cache" / "vertra" / "sources"
    shutil.rmtree(work, ignore_errors=True)
    work.mkdir(parents=True)
    archive = work / "source.tar"
    for attempt in (1, 2, 3):
        log(f"downloading {label} (attempt {attempt})")
        digest = hashlib.sha256()
        try:
            with urllib.request.urlopen(url, timeout=60) as resp, open(archive, "wb") as out:
                for chunk in iter(lambda: resp.read(1 << 20), b""):
                    digest.update(chunk)
                    out.write(chunk)
        except OSError as exc:
            log(f"download failed: {exc}")
            time.sleep(5 * attempt)
            continue
        if digest.hexdigest() == sha256:
            break
        log("the download does not match the pinned SHA-256; refusing it")
        time.sleep(5 * attempt)
    else:
        log(f"could not get a verified copy of {label}")
        sys.exit(70)

    def accept(member, path):
        parts = member.name.split("/", 1) if strip else ["", member.name]
        if len(parts) < 2 or not keep(parts[1]):
            return None
        return tarfile.data_filter(member, path)

    staging = work / "tree"
    with tarfile.open(archive) as tar:
        tar.extractall(staging, filter=accept)
    (root,) = [p for p in staging.iterdir() if p.is_dir()] if strip else [staging]
    (root / ".vertra-pin").write_text(want)
    shutil.rmtree(dest, ignore_errors=True)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(root), str(dest))
    shutil.rmtree(work, ignore_errors=True)
    log(f"{label} ready in {dest}")


def fetch_github(pin, dest, skip):
    fetch(f"{pin['repo']}@{pin['commit'][:12]}", f"https://github.com/{pin['repo']}/archive/{pin['commit']}.tar.gz", pin["sha256"], dest,
          lambda rel: rel.split("/", 1)[0] not in skip and (not rel.startswith("apps/") or rel.startswith("apps/shared")))


def fetch_node():
    arch = {"x86_64": "x64", "aarch64": "arm64"}.get(platform.machine())
    if arch is None:
        log(f"no Node.js build pinned for {platform.machine()}")
        sys.exit(70)
    name = f"node-v{NODE['version']}-linux-{arch}"
    fetch(f"Node.js v{NODE['version']} ({arch})", f"https://nodejs.org/dist/v{NODE['version']}/{name}.tar.xz", NODE["sha256"][arch], NODE_DIR,
          lambda rel: rel in ("bin/node", "bin/npm", "bin/npx", "LICENSE") or rel.startswith("lib/node_modules/npm/"))


def fetch_caddy():
    arch = {"x86_64": "amd64", "aarch64": "arm64"}.get(platform.machine())
    if arch is None:
        log(f"no Caddy build pinned for {platform.machine()}")
        sys.exit(70)
    v = CADDY["version"]
    fetch(f"Caddy v{v} ({arch})", f"https://github.com/caddyserver/caddy/releases/download/v{v}/caddy_{v}_linux_{arch}.tar.gz", CADDY["sha256"][arch],
          CADDY_DIR, lambda rel: rel == "caddy", strip=False)


def build_frontends(env):
    """Builds the dashboard and its terminal chat once per Hermes/Node pin, then drops the sources and node_modules."""
    stamp = f"{HERMES['commit']} node{NODE['version']}"
    done = WEB_DIST / ".vertra-build"
    try:
        if done.read_text() == stamp and (WEB_DIST / "index.html").is_file() and (TUI_DIR / "dist" / "entry.js").is_file():
            return True
    except OSError:
        pass
    if not (HERMES_DIR / "web" / "package.json").is_file():
        log("the dashboard sources are gone and its build is missing; delete /app/hermes-agent and restart")
        return False
    log("building the dashboard (first start only)")
    benv = dict(env, CI="1", npm_config_cache=str(APP / ".cache" / "npm"), HERMES_PYTHON=sys.executable, HERMES_WEB_BUILD_LIGHT="1", NODE_OPTIONS="--max-old-space-size=1024")
    node = str(NODE_DIR / "bin" / "node")
    steps = (
        ("dependencies", ["scripts/build/node-deps.mjs", "--source", str(HERMES_DIR), "--workspace", "ui-tui", "--workspace", "web"]),
        ("terminal chat", ["scripts/build/tui.mjs", "--source", str(HERMES_DIR), "--out", str(TUI_DIR)]),
        ("dashboard", ["scripts/build/web.mjs", "--source", str(HERMES_DIR), "--icons", str(HERMES_DIR), "--out", str(WEB_DIST)]),
    )
    shutil.rmtree(TUI_DIR, ignore_errors=True)
    shutil.rmtree(WEB_DIST, ignore_errors=True)
    for what, args in steps:
        started = time.time()
        if subprocess.run([node, *args], cwd=HERMES_DIR, env=benv).returncode != 0:
            log(f"building the dashboard failed at: {what}; it stays off until the next start")
            return False
        log(f"dashboard build: {what} done in {round(time.time() - started)}s")
    for sub in ("node_modules", "web", "ui-tui", "apps"):
        shutil.rmtree(HERMES_DIR / sub, ignore_errors=True)
    shutil.rmtree(APP / ".cache" / "npm", ignore_errors=True)
    done.write_text(stamp)
    return True


def write_caddyfile(webui):
    """Basic once, then a session cookie (browsers send no Basic on WebSocket or EventSource), for /admin (9119) and the chat at / (8787)."""
    root = "reverse_proxy 127.0.0.1:8787" if webui else "redir * /admin/ 302"
    text = """{
  admin off
  auto_https off
  persist_config off
}
# The dashboard only accepts its own loopback Host and Origin.
(dash) {
  reverse_proxy 127.0.0.1:9119 {
    header_up Host 127.0.0.1:9119
    header_up Origin http://127.0.0.1:9119
  }
}
:%(port)s {
  # Own-origin frames stay allowed for the chat's sandboxed HTML preview.
  @ownframe expression "({http.request.header.Sec-Fetch-Dest} == 'iframe' || {http.request.header.Sec-Fetch-Dest} == 'frame') && {http.request.header.Sec-Fetch-Site} == 'same-origin'"
  @otherframe expression "!(({http.request.header.Sec-Fetch-Dest} == 'iframe' || {http.request.header.Sec-Fetch-Dest} == 'frame') && {http.request.header.Sec-Fetch-Site} == 'same-origin')"
  header @ownframe {
    defer
    X-Frame-Options SAMEORIGIN
    +Content-Security-Policy "frame-ancestors 'self'"
  }
  header @otherframe {
    defer
    X-Frame-Options DENY
    +Content-Security-Policy "frame-ancestors 'none'"
  }
  handle /healthz {
    respond "ok" 200
  }
  handle {
    route {
      # Sibling apps share a registrable domain, so SameSite alone does not stop them from framing this one.
      @framed expression "({http.request.header.Sec-Fetch-Dest} == 'iframe' || {http.request.header.Sec-Fetch-Dest} == 'frame' || {http.request.header.Sec-Fetch-Dest} == 'embed' || {http.request.header.Sec-Fetch-Dest} == 'object') && {http.request.header.Sec-Fetch-Site} != 'same-origin'"
      respond @framed 403
      @badorigin {
        header Origin *
        expression "{http.request.header.Origin} != 'https://' + {http.request.hostport} && {http.request.header.Origin} != 'http://' + {http.request.hostport}"
      }
      respond @badorigin 403
      @xsite_nonget {
        header Sec-Fetch-Site cross-site
        header Sec-Fetch-Site same-site
        not method GET
      }
      respond @xsite_nonget 403
      @xsite_nonnav {
        header Sec-Fetch-Site cross-site
        header Sec-Fetch-Site same-site
        not header Sec-Fetch-Mode navigate
      }
      respond @xsite_nonnav 403
      # Only page navigation gets the password prompt.
      @anon {
        not header Authorization *
        not header Cookie *vertra_hermes={env.SESSION_TOKEN}*
        header Sec-Fetch-Mode *
        not header Sec-Fetch-Mode navigate
      }
      respond @anon 401
      @nocookie not header Cookie *vertra_hermes={env.SESSION_TOKEN}*
      basic_auth @nocookie {
        {env.ADMIN_USER} {env.HASH}
      }
      header @nocookie +Set-Cookie "vertra_hermes={env.SESSION_TOKEN}; {env.COOKIE_ATTRS}"
      redir /admin /admin/ 308
      handle_path /admin/* {
        request_header X-Forwarded-Prefix /admin
        import dash
      }
      @dashassets path /assets/* /fonts/* /fonts-terminal/* /shared/*
      handle @dashassets {
        import dash
      }
      handle {
        %(root)s
      }
    }
  }
}
""" % {"port": PORT, "root": root}
    path = APP / ".cache" / "vertra" / "Caddyfile"
    write_private(path, text)
    return path


def run_quiet(args, env, what):
    """Setup command: a failure is logged and the boot goes on."""
    result = subprocess.run(args, env=env, cwd=HERMES_HOME, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if result.returncode:
        log(f"{what} failed; going on")
    return result.returncode == 0


def seed_home(env):
    for sub in ("backups", "cron", "sessions", "logs/gateways", "hooks", "memories", "skills", "skins", "plans", "workspace", "home", "pairing", "platforms/pairing"):
        (HERMES_HOME / sub).mkdir(parents=True, exist_ok=True)
    for name, source in ((".env", ".env.example"), ("config.yaml", "cli-config.yaml.example"), ("SOUL.md", "docker/SOUL.md")):
        target = HERMES_HOME / name
        if not target.exists() and (HERMES_DIR / source).is_file():
            shutil.copy(HERMES_DIR / source, target)
    try:
        (HERMES_HOME / ".env").chmod(0o600)
    except OSError:
        pass

    def config_set(key, value):
        run_quiet([sys.executable, "-m", "hermes_cli.main", "config", "set", key, value], env, f"config set {key}")

    # The variables win over edits to these keys in config.yaml.
    provider = env.get("HERMES_MODEL_PROVIDER", "")
    model = env.get("HERMES_MODEL_CUSTOM") or env.get("HERMES_MODEL", "")
    if provider:
        config_set("model.provider", provider)
        if model:
            config_set("model.default", model)
        if provider == "openrouter":
            config_set("model.base_url", "https://openrouter.ai/api/v1")
        elif provider == "custom":
            # The key is referenced by variable name, not written to the config.
            if env.get("HERMES_BASE_URL"):
                config_set("model.base_url", env["HERMES_BASE_URL"])
            config_set("model.key_env", "OPENAI_COMPAT_API_KEY")
        else:
            config_set("model.base_url", "")

    # Loopback api_server key for schedules.
    env_file = HERMES_HOME / ".env"
    lines = env_file.read_text().splitlines() if env_file.exists() else []
    if not env.get("API_SERVER_KEY") and not any(line.startswith("API_SERVER_KEY=") and len(line) > len("API_SERVER_KEY=") for line in lines):
        lines = [line for line in lines if line != "API_SERVER_KEY="]
        lines.append("API_SERVER_KEY=" + os.urandom(32).hex())
        write_private(env_file, "\n".join(lines) + "\n")

    if (HERMES_HOME / "config.yaml").exists():
        run_quiet([sys.executable, str(HERMES_DIR / "scripts/docker_config_migrate.py")], env, "docker_config_migrate")
    # Shared metrics stay off until the panel question is answered.
    consent = (
        "from hermes_cli.config import read_raw_config\n"
        "from hermes_cli.observability.shared_metrics_consent import consent_state, save_consent\n"
        "if not consent_state(read_raw_config())['decided']:\n    save_consent(False, False)\n"
    )
    run_quiet([sys.executable, "-c", consent], env, "shared-metrics default")
    if (HERMES_DIR / "skills").is_dir():
        run_quiet([sys.executable, str(HERMES_DIR / "tools/skills_sync.py")], env, "skills_sync")


def pair_whatsapp(env, children, paired):
    """Pairs by QR printed to stdout (the app log); the gateway restarts when the session is saved."""
    bridge = HERMES_DIR / "scripts" / "whatsapp-bridge"
    npm_env = dict(env, npm_config_cache=str(APP / ".cache" / "npm"))
    for attempt in (1, 2, 3):
        log(f"installing the WhatsApp bridge dependencies (attempt {attempt})")
        if subprocess.run([str(NODE_DIR / "bin" / "npm"), "install", "--silent", "--no-audit", "--no-fund"], cwd=bridge, env=npm_env).returncode == 0:
            break
        time.sleep(15)
    else:
        log("the WhatsApp bridge could not be installed; the other channels keep running")
        return
    log("WhatsApp: scan the QR below with the phone (Settings > Linked Devices > Link a Device); it expires, restart the app for a new one")
    WA_SESSION.mkdir(parents=True, exist_ok=True)
    proc = subprocess.Popen([str(NODE_DIR / "bin" / "node"), "bridge.js", "--pair-only", "--session", str(WA_SESSION)], cwd=bridge, env=env)
    children.append(proc)
    code = proc.wait()
    children.remove(proc)
    if code == 0 and (WA_SESSION / "creds.json").exists():
        paired.set()
    else:
        log("WhatsApp was not paired (QR expired or closed); restart the app to get a new QR")


def main():
    # The password becomes Caddy's bcrypt hash and the process is re-executed without it (unsetting would leave it in /proc/<pid>/environ).
    password = os.environ.get(PASSWORD_VAR)
    if password is not None:
        if not password:
            log(f"{PASSWORD_VAR} is empty")
            sys.exit(64)
        fetch_caddy()
        hashed = subprocess.run([str(CADDY_DIR / "caddy"), "hash-password"], input=f"{password}\n{password}\n", capture_output=True, text=True)
        if hashed.returncode != 0 or not hashed.stdout.strip():
            log("caddy hash-password failed")
            sys.exit(70)
        env = {k: v for k, v in os.environ.items() if k != PASSWORD_VAR}
        env[HASH_VAR] = hashed.stdout.strip()
        os.execve(sys.executable, [sys.executable, "-u", os.path.abspath(__file__)], env)

    env = dict(os.environ)
    caddy_hash = env.pop(HASH_VAR, "")
    if not caddy_hash:
        log(f"{PASSWORD_VAR} is required")
        sys.exit(64)
    webui = truthy(env.get("HERMES_WEBUI"))
    whatsapp = truthy(env.get("WHATSAPP_ENABLED"))

    os.umask(0o077)

    procs, children = [], []   # if a proc exits all stop; children (the pairing bridge) may exit

    def stop_all(*_):
        everyone = procs + children
        for p in everyone:
            if p.poll() is None:
                p.terminate()
        deadline = time.time() + 10
        for p in everyone:
            try:
                p.wait(max(0.1, deadline - time.time()))
            except subprocess.TimeoutExpired:
                p.kill()

    def on_signal(signum, _frame):
        stop_all()
        sys.exit(128 + signum)

    signal.signal(signal.SIGTERM, on_signal)
    signal.signal(signal.SIGINT, on_signal)

    # Caddy first, so /healthz answers during the downloads and the dashboard build.
    cookie = "Path=/; HttpOnly; SameSite=Strict" + ("; Secure" if env.get("PUBLIC_ORIGIN", "").startswith("https://") else "")
    caddy_env = {"PATH": env.get("PATH", ""), "ADMIN_USER": env.get("HERMES_ADMIN_USER") or "admin", "HASH": caddy_hash, "SESSION_TOKEN": os.urandom(32).hex(),
                 "COOKIE_ATTRS": cookie, "XDG_DATA_HOME": str(APP / ".cache" / "caddy-data"), "XDG_CONFIG_HOME": str(APP / ".cache" / "caddy-config")}
    procs.append(subprocess.Popen([str(CADDY_DIR / "caddy"), "run", "--config", str(write_caddyfile(webui)), "--adapter", "caddyfile"], env=caddy_env))

    HERMES_HOME.mkdir(parents=True, exist_ok=True)
    fetch_github(HERMES, HERMES_DIR, HERMES_SKIP)
    if webui:
        fetch_github(WEBUI, WEBUI_DIR, WEBUI_SKIP)
    fetch_node()

    env["PYTHONPATH"] = os.pathsep.join(p for p in (str(HERMES_DIR), env.get("PYTHONPATH")) if p)
    env.update({"HERMES_HOME": str(HERMES_HOME), "HERMES_WRITE_SAFE_ROOT": str(APP), "HERMES_GATEWAY_NO_SUPERVISE": "1", "PYTHONDONTWRITEBYTECODE": "1"})
    # Node only for the gateway and the dashboard.
    node_env = dict(env, VERTRA_NODE_BIN=str(NODE_DIR / "bin"), PATH=f"{NODE_DIR / 'bin'}{os.pathsep}{env.get('PATH', '')}")

    built = build_frontends(node_env)
    seed_home(env)

    def start_hermes(*args, extra=None):
        return subprocess.Popen([sys.executable, str(Path(__file__).with_name("hermes_run.py")), *args], env=dict(node_env, **(extra or {})), cwd=HERMES_HOME)

    gateway = start_hermes("gateway", "run")
    procs.append(gateway)
    if built:
        procs.append(start_hermes("dashboard", "--host", "127.0.0.1", "--port", "9119", "--no-open", "--skip-build",
                                  extra={"HERMES_WEB_DIST": str(WEB_DIST), "HERMES_TUI_DIR": str(TUI_DIR)}))
    paired = threading.Event()
    if whatsapp and not (WA_SESSION / "creds.json").exists():
        threading.Thread(target=pair_whatsapp, args=(node_env, children, paired), daemon=True).start()
    if webui:
        web_env = dict(env)
        web_env.update({
            "HERMES_WEBUI_HOST": "127.0.0.1", "HERMES_WEBUI_PORT": "8787", "HERMES_WEBUI_AGENT_DIR": str(HERMES_DIR), "HERMES_WEBUI_PYTHON": sys.executable,
            "HERMES_WEBUI_STATE_DIR": str(STATE_DIR), "HERMES_WEBUI_DEFAULT_WORKSPACE": str(HERMES_HOME / "workspace"), "HERMES_WEBUI_SKIP_ONBOARDING": "1",
            "HERMES_WEBUI_TRUST_FORWARDED_HOST": "1", "HERMES_WEBUI_TRUST_FORWARDED_PROTO": "1", "HERMES_WEBUI_TRUST_FORWARDED_FOR": "1",
        })
        web_env.pop("HERMES_WEBUI_PASSWORD", None)
        if env.get("PUBLIC_ORIGIN"):
            web_env["HERMES_WEBUI_ALLOWED_ORIGINS"] = env["PUBLIC_ORIGIN"]
        procs.append(subprocess.Popen([sys.executable, "server.py"], env=web_env, cwd=WEBUI_DIR))

    while True:
        if paired.is_set():
            # The gateway starts the bridge only if the session exists when it starts.
            paired.clear()
            log("WhatsApp paired; restarting the gateway")
            gateway.terminate()
            try:
                gateway.wait(15)
            except subprocess.TimeoutExpired:
                gateway.kill()
            procs.remove(gateway)
            gateway = start_hermes("gateway", "run")
            procs.insert(0, gateway)
        for p in procs:
            code = p.poll()
            if code is not None:
                log(f"a process exited (code {code}); stopping")
                stop_all()
                sys.exit(code or 1)
        time.sleep(1)


if __name__ == "__main__":
    main()
