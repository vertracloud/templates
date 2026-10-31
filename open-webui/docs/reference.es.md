# Referencia

## Variables de la app

| Variable | Valor | Para qué sirve |
|---|---|---|
| `WEBUI_SECRET_KEY` | secreto generado | Firma los logins; cambiarla desconecta a todos. |
| `WEBUI_ADMIN_EMAIL` / `WEBUI_ADMIN_PASSWORD` | del asistente | Crea la cuenta de administrador si aún no existe ningún usuario. |
| `ENABLE_SIGNUP` | `false` | Registro abierto desactivado. |
| `OPENAI_API_BASE_URL` / `OPENAI_API_KEY` | del asistente | Dirección compatible con OpenAI del proveedor y la clave. |
| `DATABASE_URL` | solo con Postgres | URL con `sslmode=verify-full` y certificado de cliente (la clave de cliente necesita permiso `0400`). |
| `BYPASS_EMBEDDING_AND_RETRIEVAL` | `true` | La imagen `slim` no tiene modelo de embeddings; sin esto subir documentos intentaría descargar uno. |
| `ENABLE_OLLAMA_API`, `ENABLE_VERSION_UPDATE_CHECK` | `false` | Vertra no aloja un modelo local; la versión es la del template. |
| `WEBUI_URL`, `CORS_ALLOW_ORIGIN`, `WEBUI_SESSION_COOKIE_SECURE` | dirección de la app / `true` | Origen público, CORS restringido y cookie segura (la app se sirve por https). |
| `DATA_DIR` | `/app/data` | Datos, cachés y estáticos en el disco de la app. |

## Recursos

- RAM: 512 MB (mínimo) / 1024 MB (recomendado); Postgres 1024 MB cuando se elige.
- Puerto 8080; healthcheck en `/health` (200 `{"status":true}`), hasta 180 s.
- Disco: el programa queda en `/opt/open-webui` (solo lectura); datos en `/app/data`.

## Problemas comunes

- **No aparece ningún modelo.** La clave o la dirección de la API están mal: revisa *Conexiones* y las variables `OPENAI_API_*`.
- **No puedo crear una cuenta.** El registro abierto está desactivado a propósito; pídelo al administrador.
- **Postgres rechaza la conexión.** El certificado de cliente debe estar en `/app/.vertra/certs/...` y la clave con permiso `0400` (la plataforma se encarga).
