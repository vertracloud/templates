# Referencia

## Variables de la app

| Variable | Valor | Para qué sirve |
|---|---|---|
| `N8N_ROLE` | `main` / `worker` | Qué proceso inicia `start.sh` (editor o worker). |
| `N8N_PORT` | `80` | Puerto que la plataforma usa para el tráfico web (solo el editor). |
| `N8N_ENCRYPTION_KEY` | secreto generado | Cifra las credenciales; la misma en el editor y el worker. Cambiarla rompe el arranque. |
| `DB_TYPE`, `DB_POSTGRESDB_*` | de la opción `mode` | SQLite o Postgres de la stack, con certificado de cliente (`..._SSL_*_FILE`). |
| `EXECUTIONS_MODE`, `QUEUE_BULL_REDIS_*`, `VERTRA_TLS_CLIENT_*` | solo en el modo con workers | Cola por Redis; un pequeño precargado (`redis-tls-client.cjs`) inyecta el certificado de cliente solo en las conexiones al host del Redis. |
| `N8N_WEBHOOK_URL`, `N8N_EDITOR_BASE_URL`, `N8N_HOST` | `{{app.url}}` | Dirección pública. |
| `VERTRA_CODE_MODULES` | `safe` / `all` | Módulos permitidos en Code (JavaScript). `VERTRA_JS_EXTERNAL_ALLOW` lista los paquetes externos (por defecto `moment`). |
| `GENERIC_TIMEZONE`, `TZ` | del asistente | Zona horaria de las programaciones. |
| `EXECUTIONS_DATA_MAX_AGE` / `EXECUTIONS_DATA_PRUNE_MAX_COUNT` | `168` / `5000` | Retención del historial (horas / ejecuciones). |
| `N8N_SMTP_*`, `N8N_EMAIL_MODE` | del asistente (SMTP) | Correo de invitaciones y restablecimiento. |

## Recursos

- RAM: editor 1024 MB (mínimo) / 2048 MB (recomendado); worker 1024 MB; Postgres 1024 MB; Redis 512 MB. Totales mínimos: SQLite 1 GB, Postgres 2 GB, workers 3,5 GB.
- Healthcheck en `/healthz/readiness` (espera la base), hasta 240 s.
- Instalación: `npm ci` en el deploy y en cada actualización (cerca de 2,5 minutos); las dependencias ocupan cerca de 2,7 GB de `/app` en cada app.
- Disco: el código y el `node_modules` quedan en `/app`; los datos en `/app/.n8n` (nodos de la comunidad en `/app/.n8n/nodes`; archivos binarios en `/app/.n8n/binaryData` en modo simple).

## Problemas comunes

- **`Module 'fs' is disallowed` (u otro módulo).** El módulo no está en la lista segura: elige **Todos** o ajusta `VERTRA_CODE_MODULES`.
- **El nodo Code en Python no corre.** No hay runner de Python en este template; usa JavaScript.
- **El arranque no termina.** Comprueba que la `N8N_ENCRYPTION_KEY` de la app sea la guardada en `/app/.n8n/config`.
- **El deploy falla en la instalación.** Revisa el log del deploy: falta de espacio en `/app` o sin salida al registro npm.
- **Un nodo de la comunidad no se instala.** Falta salida al registro npm o espacio en `/app`.
