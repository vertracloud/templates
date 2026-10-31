# Reference

## App variables

| Variable | Value | What it does |
|---|---|---|
| `N8N_ROLE` | `main` / `worker` | Which process `start.sh` starts (editor or worker). |
| `N8N_PORT` | `80` | The port the platform uses for web traffic (editor only). |
| `N8N_ENCRYPTION_KEY` | generated secret | Encrypts credentials; the same on the editor and the worker. Changing it breaks the boot. |
| `DB_TYPE`, `DB_POSTGRESDB_*` | from the `mode` option | SQLite or the stack's Postgres, with a client certificate (`..._SSL_*_FILE`). |
| `EXECUTIONS_MODE`, `QUEUE_BULL_REDIS_*`, `VERTRA_TLS_CLIENT_*` | workers mode only | Redis queue; a small preload (`redis-tls-client.cjs`) injects the client certificate only into connections to the Redis host. |
| `N8N_WEBHOOK_URL`, `N8N_EDITOR_BASE_URL`, `N8N_HOST` | `{{app.url}}` | Public address. |
| `VERTRA_CODE_MODULES` | `safe` / `all` | Modules allowed in Code (JavaScript). `VERTRA_JS_EXTERNAL_ALLOW` lists the external packages (default `moment`). |
| `GENERIC_TIMEZONE`, `TZ` | from the wizard | Schedule time zone. |
| `EXECUTIONS_DATA_MAX_AGE` / `EXECUTIONS_DATA_PRUNE_MAX_COUNT` | `168` / `5000` | History retention (hours / executions). |
| `N8N_SMTP_*`, `N8N_EMAIL_MODE` | from the wizard (SMTP) | Invitation and reset emails. |

## Resources

- RAM: editor 1024 MB (minimum) / 2048 MB (recommended); worker 1024 MB; Postgres 1024 MB; Redis 512 MB. Minimum totals: SQLite 1 GB, Postgres 2 GB, workers 3.5 GB.
- Healthcheck at `/healthz/readiness` (waits for the database), up to 240 s.
- Install: `npm ci` at deploy and at every update (about 2.5 minutes); the dependencies take about 2.7 GB of `/app` in each app.
- Disk: the code and `node_modules` live in `/app`; data in `/app/.n8n` (community nodes in `/app/.n8n/nodes`; binary files in `/app/.n8n/binaryData` in simple mode).

## Common problems

- **`Module 'fs' is disallowed` (or another module).** The module is not on the safe list: choose **All** or adjust `VERTRA_CODE_MODULES`.
- **The Python Code node does not run.** There is no Python runner in this template; use JavaScript.
- **The boot never finishes.** Check that the app's `N8N_ENCRYPTION_KEY` is the one stored in `/app/.n8n/config`.
- **The deploy fails during the install.** Check the deploy log: no room in `/app` or no outbound access to the npm registry.
- **A community node does not install.** No outbound access to the npm registry or no room in `/app`.
