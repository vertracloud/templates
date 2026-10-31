# Referência

## Variáveis do app

| Variável | Valor | Para que serve |
|---|---|---|
| `SERVER_URL` | `{{app.url}}` | Endereço público do app (links e webhooks). |
| `AUTHENTICATION_API_KEY` | segredo gerado | API key global. A imagem oficial traz uma chave padrão pública; o template sempre a substitui. |
| `DATABASE_CONNECTION_URI` | Postgres da stack | URL com certificado de cliente (PKCS#12) e `schema=evolution_api`. |
| `CACHE_REDIS_ENABLED` / `CACHE_LOCAL_ENABLED` | `false`/`true` | Cache local (padrão). Com Redis gerenciado ficam `true`/`false`. |
| `TELEMETRY_ENABLED` | `false` | Telemetria do projeto desligada. |
| `SERVER_PORT` | `8080` | Porta do app (vem da imagem). |

## Recursos

- RAM: app 512 MB (mínimo) / 1024 MB (recomendado); Postgres 1024 MB; Redis 512 MB (só com cache Redis). Total mínimo: 1536 MB (2048 MB com Redis).
- Porta 8080; healthcheck em `/` (200 com a mensagem de boas-vindas), até 120 s.
- Disco do app: `/app/instances` e `/app/store` (links a partir de `/evolution`).

## Problemas comuns

- **O QR code não aparece.** Confirme que a instância usa a integração `WHATSAPP-BAILEYS` e veja o log do app.
- **401 nas chamadas.** O cabeçalho `apikey` precisa ser a chave global ou a da instância.
- **Log muito verboso.** Reduza com a variável `LOG_LEVEL` (por exemplo `ERROR,WARN`) nas variáveis do app.
