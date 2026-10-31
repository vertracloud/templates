# Referencia

## Variables de la app

| Variable | Valor | Para qué sirve |
|---|---|---|
| `OPENCLAW_HOME` | `/app` | El estado va a `/app/.openclaw` (disco de la app). |
| `OPENCLAW_GATEWAY_TOKEN` | secreto generado | Token del gateway (SecretRef de entorno: nunca en texto plano en `openclaw.json`). |
| `PUBLIC_ORIGIN` | `{{app.url}}` | Origen público (se vuelve `gateway.publicOrigin` y el origen permitido del panel). |
| `OPENCLAW_PROVIDER`, `OPENCLAW_MODEL`, `OPENCLAW_MODEL_ID` | del asistente | Proveedor y modelo, recalculados **en cada arranque** (un `OPENCLAW_MODEL_ID` escrito vence el predeterminado de la opción). |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_COMPAT_API_KEY` | del asistente | La clave del proveedor elegido; `OPENAI_COMPAT_BASE_URL` lleva la URL del endpoint compatible. |
| `OPENCLAW_BROWSER` | `on` / `off` | Navegador del agente en el primer arranque. |
| `TELEGRAM_*`, `DISCORD_*`, `SLACK_*` | del asistente | Token y lista de permitidos de cada canal (SecretRef de entorno). |
| `OPENCLAW_BOOTSTRAP_PAIRING` | `off` | Opcional: desactiva el emparejamiento automático del primer navegador. |

## Recursos

- RAM: 2048 MB (mínimo) / 3072 MB (recomendado) **más 1024 MB** con el navegador (por defecto): 3072 / 4096.
- Runtime Node 24.22.1 (OpenClaw exige Node 24.22.1 o más nuevo en la línea 24); el Chromium del navegador viene del runtime. Puerto 80; healthcheck en `/healthz` hasta 420 s.
- Disco: el programa (el paquete `openclaw` de npm, fijado en `package-lock.json`) queda en `/app/node_modules`; el estado en `/app/.openclaw`. Los plugins de canal de npm suman ~240 MB.
- La primera instalación de las dependencias tarda unos minutos; después solo se repite si cambian `package.json` o el lockfile.

## Problemas comunes

- **El panel no conecta.** Revisa el token en *Configuración > Gateway* y que la dirección abierta sea la de la app (`PUBLIC_ORIGIN`).
- **Timeouts en las herramientas de navegador.** Falta RAM: con varias pestañas Chromium pasa de 2 GB. Sube la RAM o usa menos pestañas.
- **Discord/Slack tardan en subir.** Normal en el primer arranque (plugins de npm). Si falla, revisa el token y la salida a npm en el log.
- **`OPENCLAW_MODEL_ID is required`.** Con endpoint compatible el modelo es obligatorio.
