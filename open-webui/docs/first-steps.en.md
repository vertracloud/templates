# First steps

1. **Sign in.** Open the address and use the administrator email and password from the wizard. `WEBUI_ADMIN_PASSWORD` only creates the account while no user exists; afterwards change the password in *Profile > Password*.
2. **Chat.** The provider's models show up in the selector at the top of the chat.
3. **Invite the team.** *Admin panel > Users > Add*. Open sign-up is off (`ENABLE_SIGNUP=false`).
4. **Switch or add providers.** *Admin settings > Connections*: any OpenAI-compatible API (OpenRouter, Anthropic and Gemini through their compatible routes, or your own server).
5. **Attachments.** With no local embeddings the whole attached file goes into the context: use small files or long-context models.

## Data and backup
With SQLite, the database is `/app/data/webui.db` and is part of the app's snapshots. With managed Postgres, data lives in the stack's database. A rollback goes back with the data.
