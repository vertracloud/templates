# Reference

## App variables

| Variable | Value | What it does |
|---|---|---|
| `WEBUI_SECRET_KEY` | generated secret | Signs the logins; changing it signs everyone out. |
| `WEBUI_ADMIN_EMAIL` / `WEBUI_ADMIN_PASSWORD` | from the wizard | Creates the administrator account if no user exists yet. |
| `ENABLE_SIGNUP` | `false` | Open sign-up off. |
| `OPENAI_API_BASE_URL` / `OPENAI_API_KEY` | from the wizard | The provider's OpenAI-compatible address and key. |
| `DATABASE_URL` | Postgres only | URL with `sslmode=verify-full` and a client certificate (the client key needs mode `0400`). |
| `BYPASS_EMBEDDING_AND_RETRIEVAL` | `true` | The `slim` image has no embeddings model; without it uploading documents would try to download one. |
| `ENABLE_OLLAMA_API`, `ENABLE_VERSION_UPDATE_CHECK` | `false` | Vertra does not host a local model; the version is the template's. |
| `WEBUI_URL`, `CORS_ALLOW_ORIGIN`, `WEBUI_SESSION_COOKIE_SECURE` | app address / `true` | Public origin, restricted CORS and secure cookie (the app is served over https). |
| `DATA_DIR` | `/app/data` | Data, caches and static files on the app's disk. |

## Resources

- RAM: 512 MB (minimum) / 1024 MB (recommended); Postgres 1024 MB when chosen.
- Port 8080; healthcheck at `/health` (200 `{"status":true}`), up to 180 s.
- Disk: the program lives in `/opt/open-webui` (read-only); data in `/app/data`.

## Common problems

- **No model shows up.** The API key or address is wrong: check *Connections* and the `OPENAI_API_*` variables.
- **I cannot create an account.** Open sign-up is off on purpose; ask the administrator.
- **Postgres refuses the connection.** The client certificate has to be under `/app/.vertra/certs/...` and the key mode `0400` (the platform takes care of it).
