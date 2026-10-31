# Reference

## App variables

| Variable | Value | What it does |
|---|---|---|
| `HERMES_HOME` | `/app/.hermes` | The agent's state, on the app disk. |
| `HERMES_ADMIN_PASSWORD` | generated secret | Chat password. It becomes a hash on every start and the variable is removed from the processes' environment. |
| `HERMES_WEBUI` | `true` / `false` | Turns the browser chat on. |
| `PIP_NO_DEPS` | `1` | The install uses only `requirements.txt` (a complete, hashed lock). |
| `HERMES_MODEL_PROVIDER`, `HERMES_MODEL`, `HERMES_MODEL_CUSTOM`, `HERMES_BASE_URL` | from the wizard | Provider, the option's default model, the typed model (wins) and the compatible endpoint's base URL; applied on every start. |
| `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENAI_COMPAT_API_KEY` | from the wizard | The chosen provider's key. |
| `TELEGRAM_*`, `DISCORD_*`, `SLACK_*`, `WHATSAPP_*`, `EMAIL_*` | from the wizard | Credentials and allowlists of each channel. `GATEWAY_ALLOW_ALL_USERS` stays `false`. For email, `EMAIL_AUTHSERV_ID` is required and `EMAIL_TRUST_FROM_HEADER` stays `false`: do not turn it on, or anyone could pose as someone on the list. |
| `PUBLIC_ORIGIN` | the app address | Public origin (the chat's allowed origins; `Secure` cookie on https). |

## Resources

- RAM: 1536 MB (minimum) / 2048 MB (recommended); ~0.6 GiB idle, measured without WhatsApp.
- One public port (80) for the chat. No other port is open outside the container; the Hermes `/admin` dashboard is not started.
- Disk: Python dependencies in `/app/.local` (~380 MB), the Hermes code in `/app/hermes-agent` (~90 MB) and the WebUI in `/app/hermes-webui` (~18 MB); with WhatsApp, Node.js in `/app/.local/node` (~136 MB) and the bridge (npm) in `/app/hermes-agent/scripts/whatsapp-bridge`; state in `/app/.hermes`.
- Network at runtime: GitHub (first start), PyPI (install), nodejs.org and the npm registry (WhatsApp only), the providers' and channels' APIs.
- Pinned versions: Hermes `bf0203a794a0` (tag v0.22.5), WebUI `687d80333870` and Node.js `v24.22.2`, each with its SHA-256 in `src/start.py`; hashed dependencies in `src/requirements.txt` (Hermes' official lock for Python 3.14). To update, change them together.

## Common problems

- **The chat asks for a password and refuses it.** Use the password from the outputs. Lost it? Change the `HERMES_ADMIN_PASSWORD` secret and restart: the password is rewritten on every start. After several wrong attempts the login waits a minute.
- **403 on a request of yours.** It is the chat's cross-origin protection: the request's `Origin` is not the app's address. Open the app straight at its address; script calls without `Origin` (curl) are not affected.
- **The app dies right after starting.** Check the RAM (1.5 GB minimum) and the log: `HERMES_ADMIN_PASSWORD is required` means the secret is missing; `could not get a verified copy` means the download from GitHub or of Node.js failed (or its SHA-256 differs from the pinned one; the app exits with code 70).
- **A channel does not answer.** Check the app log (rejected token) and whether your id is on the allowlist. For email, "authserv-id" in the log means `EMAIL_AUTHSERV_ID` does not match the topmost `Authentication-Results` header of your messages.
- **I edited `config.yaml` and it came back.** Provider and model are reapplied on every start from the variables; change the variables.
- **The WhatsApp QR does not show, or does not scan.** Look for "Scan this QR code" in the log (it is printed only while there is no session). If the lines look broken, use a monospaced font. If it expired, restart. To pair again, delete `/app/.hermes/platforms/whatsapp/session` and restart.
- **I need the `/admin` dashboard.** It stays off in this template (no password of its own; its frontend needs Node to build).
