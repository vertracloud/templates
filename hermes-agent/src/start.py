#!/usr/bin/env python3
"""Hermes Agent entrypoint.

On the first start the pinned sources (Hermes Agent and, optionally, the Hermes WebUI) are downloaded from GitHub by commit, checked against
a SHA-256 and unpacked under /app; the dependencies come from requirements.txt. State lives in /app/.hermes. It then runs the gateway and
the WebUI, whose own login is the only door. With WhatsApp on it also downloads Node.js (SHA-256 checked) for the bridge and prints the pairing QR
in the app log. The Hermes dashboard is not started: its frontend needs Node to build and it has no login of its own.
"""
import hashlib
import http.server
import json
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

# Pinned sources (Hermes is tag v0.22.5). To upgrade, change commit and sha256 together, and requirements.txt.
HERMES = {"repo": "NousResearch/hermes-agent", "commit": "bf0203a794a07aac3ff764972ab9087baa4e4f4e", "sha256": "0dc2cca54657d162845a77f634e107c61c3fb0bd6c8505212aa2e200591b7cc9"}
WEBUI = {"repo": "nesquena/hermes-webui", "commit": "687d80333870c3797d6858738621fca13d1bf27a", "sha256": "bde1ee26c90da3988164874c623fde293a9d1b1e7104544f2cbae25753ded341"}
# Top-level folders left out of the unpacked tree (tests, desktop apps, frontends, docs site).
HERMES_SKIP = {"tests", "apps", "ui-tui", "web", "evals", ".github", "nix", "contributors", "assets", "website"}
WEBUI_SKIP = {"tests", "docs", ".github"}
# Official Node.js build from nodejs.org (SHASUMS256.txt), downloaded only when WhatsApp is on.
NODE = {"version": "24.22.2", "sha256": {"x64": "48cc0e21e048790e54c0cf5749c2725005313d652651c40b7a21feb9697aaf75", "arm64": "eb187837a2230d4047161ac0be008584e16b46f726e9c9490ee35dc6b17d9ba8"}}

APP = Path("/app")
HERMES_HOME = Path(os.environ.get("HERMES_HOME") or APP / ".hermes")
HERMES_DIR = APP / "hermes-agent"
WEBUI_DIR = APP / "hermes-webui"
STATE_DIR = HERMES_HOME / "webui"
NODE_DIR = APP / ".local" / "node"
WA_SESSION = HERMES_HOME / "platforms" / "whatsapp" / "session"
PORT = int(os.environ.get("PORT") or 80)
PASSWORD_VAR = "HERMES_ADMIN_PASSWORD"


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


def seed_webui_password(password):
    """Stores the login as the hash the WebUI's Settings would write (PBKDF2-SHA256, 600k rounds, salted with .pbkdf2_key), so the
    password never stays in the environment of the agent's processes."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    key_file = STATE_DIR / ".pbkdf2_key"
    key = key_file.read_bytes()[:32] if key_file.exists() else b""
    if len(key) < 32:
        key = os.urandom(32)
        key_file.write_bytes(key)
        key_file.chmod(0o600)
    settings_file = STATE_DIR / "settings.json"
    try:
        settings = json.loads(settings_file.read_text())
        if not isinstance(settings, dict):
            settings = {}
    except (OSError, ValueError):
        settings = {}
    settings["password_hash"] = hashlib.pbkdf2_hmac("sha256", password.encode(), key, 600_000).hex()
    # Any other key in settings.json makes the WebUI hide channel sessions by default; keep the first-run default.
    settings.setdefault("show_cli_sessions", True)
    write_private(settings_file, json.dumps(settings))


def has_webui_password():
    try:
        return bool(json.loads((STATE_DIR / "settings.json").read_text()).get("password_hash"))
    except (OSError, ValueError, AttributeError):
        return False


def fetch(label, url, sha256, dest, keep):
    """Downloads an archive, checks the SHA-256 and unpacks it into dest, dropping the first path component and every path `keep` refuses.
    Done once: a marker with the pin tells the next start there is nothing to do."""
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
        parts = member.name.split("/", 1)
        if len(parts) < 2 or not keep(parts[1]):
            return None
        return tarfile.data_filter(member, path)

    staging = work / "tree"
    with tarfile.open(archive) as tar:
        tar.extractall(staging, filter=accept)
    (root,) = [p for p in staging.iterdir() if p.is_dir()]
    (root / ".vertra-pin").write_text(want)
    shutil.rmtree(dest, ignore_errors=True)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(root), str(dest))
    shutil.rmtree(work, ignore_errors=True)
    log(f"{label} ready in {dest}")


def fetch_github(pin, dest, skip):
    fetch(f"{pin['repo']}@{pin['commit'][:12]}", f"https://github.com/{pin['repo']}/archive/{pin['commit']}.tar.gz", pin["sha256"], dest,
          lambda rel: rel.split("/", 1)[0] not in skip)


def fetch_node():
    """Node.js (only for the WhatsApp bridge): official build, only what the bridge needs (node, npm, npx)."""
    arch = {"x86_64": "x64", "aarch64": "arm64"}.get(platform.machine())
    if arch is None:
        log(f"no Node.js build pinned for {platform.machine()}")
        sys.exit(70)
    name = f"node-v{NODE['version']}-linux-{arch}"
    fetch(f"Node.js v{NODE['version']} ({arch})", f"https://nodejs.org/dist/v{NODE['version']}/{name}.tar.xz", NODE["sha256"][arch], NODE_DIR,
          lambda rel: rel in ("bin/node", "bin/npm", "bin/npx", "LICENSE") or rel.startswith("lib/node_modules/npm/"))


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

    # Provider and model are applied on every boot, so the variables win over edits to these keys in config.yaml.
    provider = env.get("HERMES_MODEL_PROVIDER", "")
    model = env.get("HERMES_MODEL_CUSTOM") or env.get("HERMES_MODEL", "")
    if provider:
        config_set("model.provider", provider)
        if model:
            config_set("model.default", model)
        if provider == "openrouter":
            config_set("model.base_url", "https://openrouter.ai/api/v1")
        elif provider == "custom":
            # The key is referenced by variable name, never written to the config.
            if env.get("HERMES_BASE_URL"):
                config_set("model.base_url", env["HERMES_BASE_URL"])
            config_set("model.key_env", "OPENAI_COMPAT_API_KEY")
        else:
            # The seed config points base_url at OpenRouter.
            config_set("model.base_url", "")

    # Loopback api_server key (schedules), kept in the volume .env.
    env_file = HERMES_HOME / ".env"
    lines = env_file.read_text().splitlines() if env_file.exists() else []
    if not env.get("API_SERVER_KEY") and not any(line.startswith("API_SERVER_KEY=") and len(line) > len("API_SERVER_KEY=") for line in lines):
        lines = [line for line in lines if line != "API_SERVER_KEY="]
        lines.append("API_SERVER_KEY=" + os.urandom(32).hex())
        write_private(env_file, "\n".join(lines) + "\n")

    if (HERMES_HOME / "config.yaml").exists():
        run_quiet([sys.executable, str(HERMES_DIR / "scripts/docker_config_migrate.py")], env, "docker_config_migrate")
    # Opts out of shared metrics only while the panel question is unanswered.
    consent = (
        "from hermes_cli.config import read_raw_config\n"
        "from hermes_cli.observability.shared_metrics_consent import consent_state, save_consent\n"
        "if not consent_state(read_raw_config())['decided']:\n    save_consent(False, False)\n"
    )
    run_quiet([sys.executable, "-c", consent], env, "shared-metrics default")
    if (HERMES_DIR / "skills").is_dir():
        run_quiet([sys.executable, str(HERMES_DIR / "tools/skills_sync.py")], env, "skills_sync")


def pair_whatsapp(env, children, paired):
    """Pairing by QR: the bridge prints it to stdout, so it shows in the app log. The session is saved in /app/.hermes, then the gateway restarts."""
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


class Placeholder(http.server.BaseHTTPRequestHandler):
    """Public port when the WebUI is off: a health check and a note, nothing else."""

    def do_GET(self):
        ok = self.path.split("?")[0] == "/health"
        body = b'{"status":"ok"}' if ok else b"Hermes Agent is running. The browser chat is off (webui=false); talk to it through its channels.\n"
        self.send_response(200 if ok else 404)
        self.send_header("Content-Type", "application/json" if ok else "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


def main():
    # The password becomes a hash and the process is replaced by a copy without it (unsetting would leave it in /proc/<pid>/environ).
    password = os.environ.get(PASSWORD_VAR)
    if password is not None:
        if truthy(os.environ.get("HERMES_WEBUI")):
            if not password:
                log(f"{PASSWORD_VAR} is empty")
                sys.exit(64)
            seed_webui_password(password)
        env = {k: v for k, v in os.environ.items() if k != PASSWORD_VAR}
        os.execve(sys.executable, [sys.executable, "-u", os.path.abspath(__file__)], env)

    env = dict(os.environ)
    # PIP_NO_DEPS only serves the template's install; packages the agent installs later need their dependencies.
    env.pop("PIP_NO_DEPS", None)
    webui = truthy(env.get("HERMES_WEBUI"))
    if webui and not has_webui_password():
        log(f"{PASSWORD_VAR} is required for the browser chat")
        sys.exit(64)

    HERMES_HOME.mkdir(parents=True, exist_ok=True)
    fetch_github(HERMES, HERMES_DIR, HERMES_SKIP)
    if webui:
        fetch_github(WEBUI, WEBUI_DIR, WEBUI_SKIP)
    whatsapp = truthy(env.get("WHATSAPP_ENABLED"))
    if whatsapp:
        fetch_node()
    shutil.rmtree(APP / ".cache" / "vertra" / "sources", ignore_errors=True)
    os.umask(0o077)
    env["PYTHONPATH"] = os.pathsep.join(p for p in (str(HERMES_DIR), env.get("PYTHONPATH")) if p)
    env.update({"HERMES_HOME": str(HERMES_HOME), "HERMES_WRITE_SAFE_ROOT": str(APP), "HERMES_GATEWAY_NO_SUPERVISE": "1", "PYTHONDONTWRITEBYTECODE": "1"})
    seed_home(env)

    # If one process exits, all stop and the app restarts.
    procs, children = [], []   # children: the pairing bridge, whose exit is not a failure

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

    # Node reaches only the Hermes processes, and only with WhatsApp on.
    node_env = dict(env)
    if whatsapp:
        node_env["VERTRA_NODE_BIN"] = str(NODE_DIR / "bin")
        node_env["PATH"] = f"{NODE_DIR / 'bin'}{os.pathsep}{env.get('PATH', '')}"

    def start_gateway():
        # Exits with code 1 if another gateway already runs on the same /app.
        return subprocess.Popen([sys.executable, str(Path(__file__).with_name("hermes_run.py")), "gateway", "run"], env=node_env, cwd=HERMES_HOME)

    gateway = start_gateway()
    procs.append(gateway)
    paired = threading.Event()
    if whatsapp and not (WA_SESSION / "creds.json").exists():
        threading.Thread(target=pair_whatsapp, args=(node_env, children, paired), daemon=True).start()
    if webui:
        web_env = dict(env)
        web_env.update({
            "HERMES_WEBUI_HOST": "0.0.0.0", "HERMES_WEBUI_PORT": str(PORT), "HERMES_WEBUI_AGENT_DIR": str(HERMES_DIR), "HERMES_WEBUI_PYTHON": sys.executable,
            "HERMES_WEBUI_STATE_DIR": str(STATE_DIR), "HERMES_WEBUI_DEFAULT_WORKSPACE": str(HERMES_HOME / "workspace"), "HERMES_WEBUI_SKIP_ONBOARDING": "1",
            "HERMES_WEBUI_TRUST_FORWARDED_HOST": "1", "HERMES_WEBUI_TRUST_FORWARDED_PROTO": "1",
        })
        web_env.pop("HERMES_WEBUI_PASSWORD", None)  # would override the stored hash
        if env.get("PUBLIC_ORIGIN"):
            web_env["HERMES_WEBUI_ALLOWED_ORIGINS"] = env["PUBLIC_ORIGIN"]
            if env["PUBLIC_ORIGIN"].startswith("https://"):
                web_env["HERMES_WEBUI_SECURE"] = "1"  # the session cookie carries Secure
        procs.append(subprocess.Popen([sys.executable, "server.py"], env=web_env, cwd=WEBUI_DIR))
    else:
        server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), Placeholder)
        threading.Thread(target=server.serve_forever, daemon=True).start()

    while True:
        if paired.is_set():
            # The gateway only starts the WhatsApp bridge when it finds the session at its own start.
            paired.clear()
            log("WhatsApp paired; restarting the gateway")
            gateway.terminate()
            try:
                gateway.wait(15)
            except subprocess.TimeoutExpired:
                gateway.kill()
            procs.remove(gateway)
            gateway = start_gateway()
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
