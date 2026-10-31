# OpenMausBot

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

A chat app where every contact is a **Claude Code** or **Codex** agent, with its own personality, memory, scheduled routines and a web UI. OpenMausBot 0.1.134 as a code project on Vertra's Node 24 runtime; `openmausbot`, Claude Code (2.1.316) and Codex (0.166.0) are npm packages pinned in `package-lock.json`. You sign in with your own Claude and/or ChatGPT account: Vertra does not host a model.

## What the wizard asks

Nothing. The Claude and Codex accounts are connected inside the app, and access is through a pairing code printed in the log.

## What you get

- The app **address** (the web UI).
- How to sign in (pairing) and how to connect Claude and Codex, in the app outputs.

## First steps

1. After the deploy, open the **app log** and copy the code on the `pairing code` line (12 characters, single use, valid for 5 minutes). The `open or scan` line has the link with the code already filled in.
2. Open `<app address>/pair`, type the code and confirm. The browser session lasts 30 days and is renewed on use.
3. In *Settings > AI > Engines*, sign in to **Claude** (paste back the code Anthropic shows) and/or **Codex** (ChatGPT login with a device code). The logins live in `/app/.claude` and `/app/.codex`.
4. Create bots and chat. Another device: restart the app to get a new code, or use *Phone apps* in the app settings.

## Known limits

- **A paired session is the same as administrator access to the app**: bots run commands inside the container. Do not pair devices you do not know.
- Whoever has the app files (snapshots included) has the Claude and Codex logins.
- The first deploy takes about 2 minutes to install the packages (1.2 GB on disk); later starts take a few seconds.
- RAM: 2 GB minimum (3 GB recommended). Idle, the app uses about 0.2 GB; each active bot runs its own Claude or Codex process.
- Only port 80 is exposed: OpenMausBot's webhook receiver (a separate port) is not reachable. The bots' browser is not installed.
- Zero-downtime deploy is off (the server does not accept two copies on the same data folder). The packages change only with a new template version.
- The web UI sends anonymous usage statistics (PostHog) until you turn it off in *Settings > General > Usage analytics*.
- Not tested with a real Claude or Codex login.

## License

OpenMausBot is distributed under Apache-2.0: <https://github.com/milind-soni/OpenMausBot/blob/main/LICENSE>. The npm package also ships an `enterprise/` folder under its own source-available license; the template keeps it off (open-source edition). Codex (`@openai/codex`) is Apache-2.0; Claude Code (`@anthropic-ai/claude-code`) follows Anthropic's terms. The names OpenMausBot and MausBot and the mascot are trademarks of Supamaus Software Private Limited; this template is a Vertra Cloud packaging, not affiliated with the project, and the icon is the project's official one, used only to identify what the template packages (`ICONS.md`).

More details: [docs/first-steps.en.md](docs/first-steps.en.md) · [docs/reference.en.md](docs/reference.en.md)
