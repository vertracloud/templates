# Reference

## App variables

| Variable | Value | What it does |
|---|---|---|
| `SERVER_URL` | `{{app.url}}` | Public address of the app (links and webhooks). |
| `AUTHENTICATION_API_KEY` | generated secret | Global API key. The official image ships a public default key; the template always replaces it. |
| `DATABASE_CONNECTION_URI` | the stack's Postgres | URL with client certificate (PKCS#12) and `schema=evolution_api`. |
| `CACHE_REDIS_ENABLED` / `CACHE_LOCAL_ENABLED` | `false`/`true` | Local cache (default). With managed Redis they are `true`/`false`. |
| `TELEMETRY_ENABLED` | `false` | The project's telemetry is off. |
| `SERVER_PORT` | `8080` | App port (from the image). |

## Resources

- RAM: app 512 MB (minimum) / 1024 MB (recommended); Postgres 1024 MB; Redis 512 MB (only with the Redis cache). Minimum total: 1536 MB (2048 MB with Redis).
- Port 8080; healthcheck at `/` (200 with the welcome message), up to 120 s.
- App disk: `/app/instances` and `/app/store` (linked from `/evolution`).

## Common problems

- **The QR code does not show up.** Check that the instance uses the `WHATSAPP-BAILEYS` integration and look at the app log.
- **401 on calls.** The `apikey` header has to be the global key or the instance's key.
- **Very verbose log.** Lower it with the `LOG_LEVEL` variable (for example `ERROR,WARN`) in the app variables.
