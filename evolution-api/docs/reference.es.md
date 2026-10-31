# Referencia

## Variables de la app

| Variable | Valor | Para qué sirve |
|---|---|---|
| `SERVER_URL` | `{{app.url}}` | Dirección pública de la app (enlaces y webhooks). |
| `AUTHENTICATION_API_KEY` | secreto generado | API key global. La imagen oficial trae una clave predeterminada pública; el template siempre la reemplaza. |
| `DATABASE_CONNECTION_URI` | Postgres de la stack | URL con certificado de cliente (PKCS#12) y `schema=evolution_api`. |
| `CACHE_REDIS_ENABLED` / `CACHE_LOCAL_ENABLED` | `false`/`true` | Caché local (por defecto). Con Redis administrado quedan `true`/`false`. |
| `TELEMETRY_ENABLED` | `false` | La telemetría del proyecto está desactivada. |
| `SERVER_PORT` | `8080` | Puerto de la app (viene de la imagen). |

## Recursos

- RAM: app 512 MB (mínimo) / 1024 MB (recomendado); Postgres 1024 MB; Redis 512 MB (solo con caché Redis). Total mínimo: 1536 MB (2048 MB con Redis).
- Puerto 8080; healthcheck en `/` (200 con el mensaje de bienvenida), hasta 120 s.
- Disco de la app: `/app/instances` y `/app/store` (enlaces desde `/evolution`).

## Problemas comunes

- **El código QR no aparece.** Comprueba que la instancia usa la integración `WHATSAPP-BAILEYS` y mira el log de la app.
- **401 en las llamadas.** El encabezado `apikey` debe ser la clave global o la de la instancia.
- **Log muy verboso.** Redúcelo con la variable `LOG_LEVEL` (por ejemplo `ERROR,WARN`) en las variables de la app.
