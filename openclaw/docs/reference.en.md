# Reference

## App variables

| Variable | Value | What it does |
|---|---|---|
| `OPENCLAW_HOME` | `/app` | State goes to `/app/.openclaw` (the app's disk). |
| `OPENCLAW_GATEWAY_TOKEN` | generated secret | Gateway token (environment SecretRef: never plain text in `openclaw.json`). |
| `PUBLIC_ORIGIN` | `{{app.url}}` | Public origin (becomes `gateway.publicOrigin` and the panel's allowed origin). |
| `OPENCLAW_PROVIDER`, `OPENCLAW_MODEL`, `OPENCLAW_MODEL_ID` | from the wizard | Provider and model, recomputed **on every start** (a typed `OPENCLAW_MODEL_ID` wins over the option default). |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_COMPAT_API_KEY` | from the wizard | The chosen provider's key; `OPENAI_COMPAT_BASE_URL` carries the compatible endpoint URL. |
| `OPENCLAW_BROWSER` | `on` / `off` | Agent browser on the first start. |
| `TELEGRAM_*`, `DISCORD_*`, `SLACK_*` | from the wizard | Each channel's token and allowlist (environment SecretRef). |
| `OPENCLAW_BOOTSTRAP_PAIRING` | `off` | Optional: turns off the automatic pairing of the first browser. |

## Resources

- RAM: 2048 MB (minimum) / 3072 MB (recommended) **plus 1024 MB** with the browser (default): 3072 / 4096.
- Node 24.22.1 runtime (OpenClaw needs Node 24.22.1 or newer on the 24 line); the browser's Chromium comes from the runtime. Port 80; healthcheck at `/healthz` up to 420 s.
- Disk: the program (the `openclaw` npm package, pinned in `package-lock.json`) sits in `/app/node_modules`; the state in `/app/.openclaw`. Channel plugins from npm add ~240 MB.
- The first dependency install takes a few minutes; afterwards it only repeats if `package.json` or the lockfile change.

## Common problems

- **The panel does not connect.** Check the token in *Settings > Gateway* and that the address you opened is the app's (`PUBLIC_ORIGIN`).
- **Timeouts in the browser tools.** Not enough RAM: with several tabs Chromium goes past 2 GB. Raise the RAM or use fewer tabs.
- **Discord/Slack are slow to come up.** Normal on the first boot (npm plugins). If it fails, check the token and the npm access in the log.
- **`OPENCLAW_MODEL_ID is required`.** With a compatible endpoint the model is required.
