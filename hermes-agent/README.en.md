# Hermes Agent

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

An AI agent that learns from use, with a web panel, an optional browser chat and messaging channels. Hermes Agent v0.22.5 as a Python 3.14 code app (no Docker image): the dependencies are the project's official lock, with hashes; the Hermes code, Node.js and Caddy are downloaded on the first start, by version and with a SHA-256 check, and the panel is built from the source. You bring the model key.

## What it is

- **Panel** at `/admin/`: configuration, keys, sessions, files, logs, cron, skills, plugins, MCP, channels (including WhatsApp pairing), webhooks and a terminal chat at `/admin/chat`.
- Optional **browser chat** (Hermes WebUI) at `/`, with sessions, files and settings. Without it, `/` goes to the panel.
- **Single login**: Caddy listens on the public port and asks for a user (`admin`) and a (generated) password once and keeps a session cookie, so the panel chat and the browser chat never ask for the password again. The panel, the chat and the agent listen on `127.0.0.1` only, inside the container.
- **Cross-origin protection**: before the login, Caddy refuses (403) any request whose `Origin` is not the app's own address, and any request from another site that is not a navigation (a link to your app still opens). This stops a page hosted on another app under `*.vertraweb.app` from using your login, still open in the browser, to open the panel terminal or change data.
- **No framing**: the panel and the chat do not open inside another page (`X-Frame-Options: DENY` and `frame-ancestors 'none'`), so the Vertra panel preview shows the "open in a new tab" card for this app.
- **Providers** and **channels** as described below. Provider and model apply **on every start** (the variable wins).

## What the wizard asks

| Question | What it does |
|---|---|
| Model provider | OpenRouter (default), Anthropic, OpenAI, Google Gemini or an OpenAI-compatible endpoint. |
| Provider API key | Only in the app's encrypted variables. |
| Base URL and model | The URL only with a compatible endpoint (ends in `/v1`). Empty model = the provider's default; required with a compatible endpoint. |
| Browser chat (Hermes WebUI) | Optional; costs ~150 MB of RAM. It lives at `/`, and the panel at `/admin/`. |
| Telegram, Discord, Slack, WhatsApp, email | Each asks for credentials and the **list of who may talk to the agent** (required). WhatsApp is paired by QR in the panel (or in the app log). For email, also give the server identifier (`authserv-id`; Gmail: `mx.google.com`): the agent only acts on senders your mail server authenticated. |

## What you get

- The **panel** (`<address>/admin/`) and the `admin` user.
- The login **password**, shown **once**.
- The next step and the WhatsApp instruction.

## First steps

1. Wait for the first start: it installs the dependencies, downloads Hermes, Node.js and Caddy and builds the panel (about 2 minutes on a good network, up to ~10 when GitHub is slow: installs ~130 packages in ~30-50 s, downloads ~150 MB and builds the panel in ~1 min). Follow it in the app log; the panel opens when the build ends.
2. Open `<address>/admin/` with `admin` and the password from the outputs.
3. Talk to the agent in the panel's terminal chat (`/admin/chat`), in the browser chat (`/`, if you turned it on) or in the channel you connected.
4. **WhatsApp:** see the section below.
5. To change provider or model, edit `HERMES_MODEL_PROVIDER` / `HERMES_MODEL_CUSTOM` in the app variables and restart.

## WhatsApp

Optional, through the unofficial Baileys bridge (the one Hermes ships). The Node.js it needs already comes with the app; the first time the app installs the bridge dependencies (npm).

**Pairing:**
- **In the panel:** at `/admin/channels` > WhatsApp, scan the QR (it expires) in WhatsApp > Linked devices > Link a device.
- **In the log:** open the **app log**, look for "Scan this QR code with WhatsApp on your phone" and scan the QR, which comes out as text blocks: view it in a monospaced font (wrapped lines will not scan). It expires in ~1 min; restart the app for a new one. Use one of the two at a time.
- Once paired from the log, the app restarts the agent by itself and the bridge comes up. The default is the "message yourself" mode (WhatsApp > your own chat); `WHATSAPP_ALLOWED_USERS` limits who may talk to the agent.

The session lives in `/app/.hermes/platforms/whatsapp/session`. To pair again, delete that folder (file manager) and restart. One WhatsApp session per app.

**Official alternative: WhatsApp Cloud API (Meta).** Hermes also speaks Meta's official API (variables `WHATSAPP_CLOUD_PHONE_NUMBER_ID`, `WHATSAPP_CLOUD_ACCESS_TOKEN`, `WHATSAPP_CLOUD_APP_SECRET`, `WHATSAPP_CLOUD_VERIFY_TOKEN`, `WHATSAPP_CLOUD_ALLOWED_USERS`; see the Hermes documentation). It uses no QR and no bridge, but Meta must reach an HTTPS webhook (`/whatsapp/webhook`, port `WHATSAPP_CLOUD_WEBHOOK_PORT`, default 8090). This template only exposes Caddy's public port, so the webhook is not reachable without a proxy of your own in front; the wizard does not set this option up.

## Known limits

- RAM: **2 GB minimum**, 3 GB recommended (~1.1 GiB idle with the panel, the chat and one terminal session open; the first build reaches ~1.4 GiB).
- First start: about 2 minutes on a good network, up to ~10 when GitHub is slow: installs ~130 packages in ~30-50 s, downloads ~150 MB and builds the panel in ~1 min. Restarts: about 20 s, with nothing downloaded or rebuilt. `/healthz` (answered by Caddy itself, no password, no data) answers before the build ends; until then `/admin` does not answer.
- Disk: ~770 MB (Python dependencies ~380 MB, Node.js ~136 MB, Caddy ~45 MB, Hermes code ~90 MB, panel and terminal chat ~8 MB); with WhatsApp, ~50 MB more for the bridge; state lives in `/app/.hermes`.
- The dependencies are the official lock of Hermes v0.22.5 for Python 3.14 (extras `all`, `messaging` and `anthropic`), installed with `PIP_NO_DEPS=1`: the lock is already the complete set, and pip would refuse the Pillow replacement the project itself makes. Matrix, Bedrock, Azure, Google Chat, OTLP and voice/TTS are left out.
- The platform's Python ships a SQLite with the WAL-mode corruption bug; Hermes detects it and uses `journal_mode=DELETE` (one warning in the log), slightly slower on writes.
- An invalid channel token **shows in the app log** ("token ... was rejected"): do not share the log. The app stays up with the channel parked.
- Signal, Matrix, Mattermost and others are not in the wizard: use `/admin/channels` or app variables. Signal needs an external `signal-cli` daemon and does not run in this container.
- Caddy is the only gate (no attempt limit): the generated password is long. For more protection add a rate-limit rule on your domain.
- Sharing usage metrics with the Hermes project is **off by default**: at the first start the template answers the panel's "Help improve Hermes?" question with "No thanks"; if you turn it on later, your choice is kept.
- Zero-downtime deploy is off (a second copy on the same disk exits with an error). Forgot the password? Change the `HERMES_ADMIN_PASSWORD` secret and restart.
- The email channel and each provider's default models were not exercised with a real account or key.

## License

Hermes Agent is distributed under the MIT license (Nous Research): <https://github.com/NousResearch/hermes-agent/blob/main/LICENSE>. The optional chat is Hermes WebUI (MIT): <https://github.com/nesquena/hermes-webui/blob/687d80333870c3797d6858738621fca13d1bf27a/LICENSE>. The Caddy that guards access is Apache-2.0 and Node.js is MIT; the WhatsApp bridge uses Baileys (MIT). The icon is the official logo, unmodified (`ICONS.md`). This template is a Vertra Cloud packaging and is not affiliated with the project.

More details: [docs/first-steps.en.md](docs/first-steps.en.md) · [docs/reference.en.md](docs/reference.en.md)
