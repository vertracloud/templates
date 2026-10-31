# Discord bot (Python)

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

A minimal Discord bot in Python, with discord.py 2.7.1 and a `/ping` command. This is a **code template**: the code is yours, open and editable; Vertra runs what is in `src/`.

## What it is

- It logs in with the bot token, registers the `/ping` slash command on every start and answers with the gateway latency.
- Only the `Guilds` intent (no privileged intent to turn on in the Developer Portal).
- With no token or a wrong token the process exits with code 1 and a clear message in the app log.
- Source in `src/main.py`; dependencies in `src/requirements.txt`.

## What the wizard asks

| Question | What it does |
|---|---|
| Bot token | Becomes the `DISCORD_TOKEN` variable (encrypted). See step 1 below to get it. |

## What you get

- The app (no web address: the bot only makes outgoing connections).
- Next step: invite the bot to your server and use `/ping`.

## First steps

1. In the [Discord Developer Portal](https://discord.com/developers/applications), create an application, open **Bot** and use **Reset Token**; copy the token.
2. Paste the token when the wizard asks for it.
3. Invite the bot to your server: **OAuth2 > URL Generator**, scopes `bot` and `applications.commands`.
4. Type `/ping`. The global command can take a few minutes to show up the first time.
5. To change the bot, edit `src/main.py` (in the app's editor/files or by deploy) and restart.

## Known limits

- There is no web page: the healthcheck is only the ready-gate (the process has to stay up).
- Two copies with the same token would answer twice: zero-downtime deploy is off.
- The minimum is 100 MB, and 256 MB (the recommended size) is enough for a simple bot; bots on many servers or with a large cache need more (RAM can be raised).
- The token lives in an encrypted variable; never put it in the code.
- Discord global commands are slow to propagate; for tests use guild commands in your code.

## License

This template's code is by Vertra Cloud, under the MIT license (see the repository `LICENSE`). discord.py 2.7.1 is distributed under the MIT license: <https://github.com/Rapptz/discord.py/blob/master/LICENSE>.

More details: [docs/first-steps.en.md](docs/first-steps.en.md) · [docs/reference.en.md](docs/reference.en.md)
