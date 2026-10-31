# Hermes Agent

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

An AI agent that learns from use, with a browser chat and messaging channels. Hermes Agent v0.22.5 as a Python 3.14 code app (no Docker image): the dependencies are the project's official lock, with hashes, and the Hermes code is downloaded from the official repository, by commit and with a SHA-256 check, on the first start. You bring the model key.

## What it is

- **Browser chat** (Hermes WebUI) at `/`, with sessions, files, settings and providers. It has its own login: it asks only for the generated password.
- **Channels**: Telegram, Discord, Slack, WhatsApp and email, each with a list of who may talk to the agent.
- **Providers** as described below. Provider and model apply **on every start** (the variable wins).
- The password is not in the environment of the agent's processes: the app stores only its hash and removes the variable before starting the agent.
- **No framing**: the chat does not open inside another page (`X-Frame-Options: DENY`), so the Vertra panel preview shows the "open in a new tab" card for this app.
- The **Hermes dashboard** (`/admin`) stays **off**: it has no password of its own and its frontend needs Node to be built. Settings are in the chat; channels are set by app variables.

## What the wizard asks

| Question | What it does |
|---|---|
| Model provider | OpenRouter (default), Anthropic, OpenAI, Google Gemini or an OpenAI-compatible endpoint. |
| Provider API key | Only in the app's encrypted variables. |
| Base URL and model | The URL only with a compatible endpoint (ends in `/v1`). Empty model = the provider's default; required with a compatible endpoint. |
| Browser chat (Hermes WebUI) | On by default; costs ~150 MB of RAM. Off, the page returns just a note and the agent answers through its channels. |
| Telegram, Discord, Slack, WhatsApp, email | Each asks for credentials and the **list of who may talk to the agent** (required). WhatsApp is paired by QR in the app log. For email, also give the server identifier (`authserv-id`; Gmail: `mx.google.com`): the agent only acts on senders your mail server authenticated. |

## What you get

- The **chat** address and the login **password**, shown **once** (password only, no user).
- The next step and the WhatsApp instruction.

## First steps

1. Wait for the first start (it installs the dependencies, downloads Hermes and the WebUI and syncs the skills).
2. Open the address and sign in with the password from the outputs.
3. Talk to the agent in the chat or in the channel you connected.
4. **WhatsApp:** see the section below.
5. To change provider or model, edit `HERMES_MODEL_PROVIDER` / `HERMES_MODEL_CUSTOM` in the app variables and restart.

## WhatsApp

Optional, through the unofficial Baileys bridge (the one Hermes ships). When you turn the option on, the app downloads the official Node.js (`v24.22.2`, from nodejs.org, SHA-256 checked; ~136 MB in `/app/.local/node`, first time only) and installs the bridge; Node is visible only to Hermes.

**Pairing by looking at the log:**
1. After the deploy, open the **app log** and look for "Scan this QR code with WhatsApp on your phone".
2. The QR comes out as text blocks: view the log in a monospaced font. If your viewer wraps or squeezes the lines the QR will not scan; use a wide window or copy the text into a monospaced editor.
3. On the phone: WhatsApp > Linked devices > Link a device, and scan. The QR expires in ~1 min; if it does, restart the app for a new one.
4. Once paired, the app restarts the agent by itself and the bridge comes up. The default is the "message yourself" mode (WhatsApp > your own chat); `WHATSAPP_ALLOWED_USERS` limits who may talk to the agent.

The session lives in `/app/.hermes/platforms/whatsapp/session`. To pair again, delete that folder (file manager) and restart. One WhatsApp session per app.

**Official alternative: WhatsApp Cloud API (Meta).** Hermes also speaks Meta's official API (variables `WHATSAPP_CLOUD_PHONE_NUMBER_ID`, `WHATSAPP_CLOUD_ACCESS_TOKEN`, `WHATSAPP_CLOUD_APP_SECRET`, `WHATSAPP_CLOUD_VERIFY_TOKEN`, `WHATSAPP_CLOUD_ALLOWED_USERS`; see the Hermes documentation). It uses no QR and no bridge, but Meta must reach an HTTPS webhook (`/whatsapp/webhook`, port `WHATSAPP_CLOUD_WEBHOOK_PORT`, default 8090). This template only exposes the chat's public port, so the webhook is not reachable without a proxy of your own in front; the wizard does not set this option up.

## Known limits

- RAM: **1.5 GB minimum**, 2 GB recommended (~0.6 GiB idle, measured without WhatsApp).
- First start: about 1.5 minutes (installs ~130 hashed packages in ~40 s, downloads ~120 MB from GitHub and syncs the skills); with WhatsApp, plus Node.js and the bridge. Restarts: ~10 s. The app does not answer while it installs and downloads; the healthcheck is `/health` (counters only).
- The dependencies are the official lock of Hermes v0.22.5 for Python 3.14 (extras `all`, `messaging` and `anthropic`), installed with `PIP_NO_DEPS=1`: the lock is already the complete set, and pip would refuse the Pillow replacement the project itself makes. Matrix, Bedrock, Azure, Google Chat, OTLP and voice/TTS are left out.
- The platform's Python ships a SQLite with the WAL-mode corruption bug; Hermes detects it and uses `journal_mode=DELETE` (one warning in the log), slightly slower on writes.
- An invalid channel token **shows in the app log** ("token ... was rejected"): do not share the log. The app stays up with the channel parked.
- Signal, Matrix, Mattermost and others are not in the wizard. Signal needs an external `signal-cli` daemon.
- The chat login limits attempts per address, and the generated password is long. Forgot the password? Change the `HERMES_ADMIN_PASSWORD` secret and restart.
- Sharing usage metrics with the Hermes project is **off by default**; if you turn it on later, your choice is kept.
- Zero-downtime deploy is off (a second copy on the same disk exits with an error).
- The email channel and each provider's default models were not exercised with a real account or key.

## License

Hermes Agent is distributed under the MIT license (Nous Research): <https://github.com/NousResearch/hermes-agent/blob/main/LICENSE>. The chat is Hermes WebUI (MIT): <https://github.com/nesquena/hermes-webui/blob/687d80333870c3797d6858738621fca13d1bf27a/LICENSE>. With WhatsApp on, the downloaded Node.js is MIT-licensed (<https://github.com/nodejs/node/blob/main/LICENSE>) and the bridge uses Baileys (MIT). The icon is the official logo, unmodified (`ICONS.md`). This template is a Vertra Cloud packaging and is not affiliated with the project.

More details: [docs/first-steps.en.md](docs/first-steps.en.md) · [docs/reference.en.md](docs/reference.en.md)
