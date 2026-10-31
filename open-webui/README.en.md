# Open WebUI

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

A chat interface with AI for your team. Open WebUI v0.12.4 (`slim` variant) in a Vertra image that keeps the program outside `/app` and the data in `/app/data`. **You bring the model key**: Vertra does not host a model.

## What it is

- Chat with your provider's models, history, folders, prompts and tools.
- User accounts with an administrator created at deploy and **open sign-up off**.
- `slim` variant: no embedded embeddings model, speech model or Ollama. Attached files go whole into the context (embedding search is off).
- Data in SQLite on the app's disk or in managed Postgres (with a client certificate).
- It does not open inside another page (`X-Frame-Options: DENY` and `frame-ancestors 'none'`): the Vertra panel preview shows the "open in a new tab" card.

## What the wizard asks

| Question | What it does |
|---|---|
| Model provider | OpenAI, OpenRouter, Anthropic, Google Gemini (all through the OpenAI-compatible API) or another address. |
| API address | Only with "Other": ends in `/v1`. |
| Provider API key | Only in the app's encrypted variables. |
| Administrator email and password | The administrator account is created for you; open sign-up is off. |
| Where does Open WebUI store its data? | **SQLite** on the app's disk (default, for personal use or a small team) or **managed Postgres** (+1 GB RAM). |

## What you get

- The app **address**.
- The next step: sign in with the administrator email and password you entered.

## First steps

1. Open the address and sign in with the administrator email and password from the wizard.
2. The provider's models show up in the selector by themselves. Chat.
3. To create more accounts: *Admin panel > Users* (open sign-up is off).
4. To switch provider or add another: *Admin settings > Connections*.

## Known limits

- RAM: 512 MB is the minimum (~300 MiB in use; boot 10-30 s); 1 GB is headroom for attachments and several people.
- There are no local embeddings: semantic-search *RAG* is not available; attachments go whole into the model's context.
- Zero-downtime deploy is off (the new copy migrates the database while the old one still serves). A rollback goes back **with the data**.
- The Open WebUI branding must not be altered (see License).
- `WEBUI_SECRET_KEY` signs the logins: changing it signs everyone out.
- Provider calls were not exercised with a real key; only the wiring against a local compatible server.

## License

Open WebUI is distributed under the BSD-3 license **with a branding clause** (copy in `docker/LICENSE`): <https://github.com/open-webui/open-webui/blob/main/LICENSE>. The "Open WebUI" branding (name, logo and visual identifiers) **must not be altered, removed or obscured**, except in deployments with up to 50 end users in 30 days, with the holder's written permission or an enterprise license. This template does not change the branding. The icon is the project's, unmodified (`ICONS.md`). A Vertra Cloud packaging, not affiliated with the project.

More details: [docs/first-steps.en.md](docs/first-steps.en.md) · [docs/reference.en.md](docs/reference.en.md)
