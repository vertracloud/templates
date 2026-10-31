# OpenClaw

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

A personal AI assistant with a browser, a control panel and messaging channels. OpenClaw 2026.10.7 as a code project on Vertra's Node 24 runtime (the `openclaw` npm package, pinned in `package-lock.json`; Chromium comes from the runtime). You bring the model key: Vertra does not host a model.

## What it is

- **Control UI** at the app address, protected by the gateway token.
- **Agent browser** (optional, on by default): headless Chromium inside the container, so the assistant can open, read and fill in pages.
- **Panel terminal** on (a shell in the container itself, no extra privilege).
- **Providers**: OpenAI, Anthropic, Google Gemini, OpenRouter and a compatible endpoint; dozens more from the panel (Settings > Models).
- **Channels**: Telegram, Discord and Slack wired on first boot; WhatsApp by QR in the panel.
- Scheduling (cron), skills and voice are part of OpenClaw; voice needs your browser's microphone and a speech provider.

## What the wizard asks

| Question | What it does |
|---|---|
| Model provider | OpenAI, Anthropic, Google Gemini, OpenRouter or an OpenAI-compatible endpoint. |
| Provider API key | Kept only in the app's encrypted variables. OpenClaw starts even with an invalid key; it is only used when the assistant answers. |
| Endpoint base URL | Only with a compatible endpoint: ends in `/v1`. |
| Model (optional) | Empty = the provider's default. Required with a compatible endpoint. On OpenRouter any id works (also `:free`). |
| Can the assistant use a browser? | Yes (default): Chromium inside the app, 3 GB RAM minimum. No: text only, 2 GB. It applies on the first start. |
| Telegram, Discord, Slack | Each channel asks for the token and **who may talk to the bot**. Without an allowlist the channel is not enabled. |

## What you get

- The app **address** (the panel).
- The **gateway token**, shown **once**: it is the credential for the panel.
- The next step (paste the token and wait for the first browser to pair) and the WhatsApp instruction.

## First steps

1. After the deploy open the address and paste the **gateway token** in *Settings > Gateway*. Wait up to 15 s: the first browser is paired automatically.
2. Talk to the assistant in the panel. Ask for something that needs the web ("open site X and summarize"): in *Chat > + > Browser* you see what it sees.
3. To connect **WhatsApp**: *Settings > Channels > WhatsApp* and scan the QR as soon as it appears (it expires). One WhatsApp session per app.
4. To change provider or model later: *Settings > Models* in the panel.

## Known limits

- First boot takes 30-45 s without channels and **1 to 3 min with Discord or Slack** (OpenClaw installs the channel plugins from npm and runs the doctor; it needs outbound access to the npm registry). After that, 15-50 s.
- RAM: **3 GB minimum with the browser** (4 GB recommended); without the browser, 2 GB (3 GB recommended). The gateway uses about 1 GiB; the browser with several heavy tabs reaches ~1.9 GiB.
- `/app/.openclaw/openclaw.json` is generated **once**; after that it is yours and the panel rewrites it. The gateway token, public origin and model follow the app variables (by reference).
- Automatic pairing of the first browser lowers "token + approval" to "token" **for that first device**. `OPENCLAW_BOOTSTRAP_PAIRING=off` turns it off.
- The agent browser blocks private/local network (OpenClaw's SSRF policy) and runs without Chromium's own sandbox (the container is the isolation).
- **Local testing (dev):** the gateway only accepts a public origin that is HTTPS or `http://localhost` / `http://127.0.0.1`. In production `{{app.url}}` is always HTTPS, so nothing changes. In a local environment the app address is `http://<name>.localhost:8080` and the gateway refuses to boot (the deploy ends `unhealthy`); to test locally, publish the app with a copy of the template whose `PUBLIC_ORIGIN` is `http://localhost:8080`. The manifest is not changed for this.
- Zero-downtime deploy is off (two copies on the same disk cannot coexist); rolling back brings the data along.
- The default models of each provider come from OpenClaw's documentation; enter the model if you want another. Not exercised with a real provider key.

## License

OpenClaw is distributed under the MIT license (OpenClaw Foundation): <https://github.com/openclaw/openclaw/blob/main/LICENSE>. The runtime's Chromium follows the Chromium project's license. This template is a Vertra Cloud packaging and is not affiliated with the project; the icon is the official logo, unmodified (`ICONS.md`).

More details: [docs/first-steps.en.md](docs/first-steps.en.md) · [docs/reference.en.md](docs/reference.en.md)
