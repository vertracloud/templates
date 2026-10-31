# Reference

## App variables

| Variable | Value | What it does |
|---|---|---|
| `HERMES_HOME` | `/app/.hermes` | The agent's state, on the app disk. |
| `HERMES_ADMIN_USER` / `HERMES_ADMIN_PASSWORD` | `admin` / generated secret | Caddy's login (the password becomes a bcrypt hash on every start and the variable is removed from the processes' environment). |
| `HERMES_WEBUI` | `true` / `false` | Turns the browser chat on. |
| `PIP_NO_DEPS` | `1` | The install uses only `requirements.txt` (a complete, hashed lock). |
| `HERMES_MODEL_PROVIDER`, `HERMES_MODEL`, `HERMES_MODEL_CUSTOM`, `HERMES_BASE_URL` | from the wizard | Provider, the option's default model, the typed model (wins) and the compatible endpoint's base URL; applied on every start. |
| `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENAI_COMPAT_API_KEY` | from the wizard | The chosen provider's key. |
| `TELEGRAM_*`, `DISCORD_*`, `SLACK_*`, `WHATSAPP_*`, `EMAIL_*` | from the wizard | Credentials and allowlists of each channel. `GATEWAY_ALLOW_ALL_USERS` stays `false`. For email, `EMAIL_AUTHSERV_ID` is required and `EMAIL_TRUST_FROM_HEADER` stays `false`: do not turn it on, or anyone could pose as someone on the list. |
| `PUBLIC_ORIGIN` | the app address | Public origin (the chat's allowed origins; `Secure` cookie on https). |

## Resources

- RAM: 2048 MB (minimum) / 3072 MB (recommended); ~1.1 GiB idle with the panel, the chat and one terminal session open; the first build reaches ~1.4 GiB.
- Public port 80, held by Caddy. The panel (`127.0.0.1:9119`), the chat (`127.0.0.1:8787`) and the agent listen only inside the container.
- Disk: ~770 MB (Python dependencies ~380 MB, Node.js ~136 MB, Caddy ~45 MB, Hermes code ~90 MB, panel and terminal chat ~8 MB); with WhatsApp, ~50 MB more for the bridge; state lives in `/app/.hermes`.
- Network at runtime: GitHub (first start), PyPI (install), nodejs.org and the npm registry (panel build and WhatsApp bridge), the providers' and channels' APIs.
- Pinned versions: Hermes `bf0203a794a0` (tag v0.22.5), WebUI `687d80333870`, Node.js `v24.22.2` and Caddy `v2.11.7`, each with its SHA-256 in `src/start.py`; hashed dependencies in `src/requirements.txt` (Hermes' official lock for Python 3.14). To update, change them together.

## Common problems

- **401 on everything.** It is Caddy's login: use `admin` and the password from the outputs.
- **403 on a request of yours.** It is the cross-origin protection: the request's `Origin` is not the app's address (a script or proxy of yours sending another site's `Origin`) or the browser marked the request as from another site. Open the app straight at its address; script calls without `Origin` (curl) are not affected.
- **502 or no answer on `/admin` right after the deploy.** The first start is still building the panel (`/healthz` already answers). Follow the log: "dashboard build: ... done".
- **The panel build failed.** The log shows "building the dashboard failed at: ..."; the agent and the channels stay up without the panel and the build is tried again on the next start. Check the network (nodejs.org, npm registry) and the RAM.
- **The app dies right after starting.** Check the RAM (2 GB minimum) and the log: `HERMES_ADMIN_PASSWORD is required` means the secret is missing; `could not get a verified copy` means the download from GitHub or nodejs.org failed (or its SHA-256 differs from the pinned one; the app exits with code 70).
- **The WhatsApp QR does not show, or does not scan.** At `/admin/channels` or in the log ("Scan this QR code", only while there is no session). If the log lines look broken, use a monospaced font. If it expired, restart. To pair again, delete `/app/.hermes/platforms/whatsapp/session` and restart.
- **A channel does not answer.** Check the app log (rejected token) and whether your id is on the allowlist. For email, "authserv-id" in the log means `EMAIL_AUTHSERV_ID` does not match the topmost `Authentication-Results` header of your messages.
- **I edited `config.yaml` and it came back.** Provider and model are reapplied on every start from the variables; change the variables.
