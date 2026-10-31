# Referencia

## Variables de la app

| Variable | Valor | Para qué sirve |
|---|---|---|
| `HERMES_HOME` | `/app/.hermes` | Estado del agente, en el disco de la app. |
| `HERMES_ADMIN_PASSWORD` | secreto generado | Contraseña del chat. Se convierte en hash en cada inicio y la variable se quita del entorno de los procesos. |
| `HERMES_WEBUI` | `true` / `false` | Activa el chat en el navegador. |
| `PIP_NO_DEPS` | `1` | La instalación usa solo `requirements.txt` (lock completo, con hashes). |
| `HERMES_MODEL_PROVIDER`, `HERMES_MODEL`, `HERMES_MODEL_CUSTOM`, `HERMES_BASE_URL` | del asistente | Proveedor, modelo predeterminado de la opción, modelo escrito (gana) y URL base del endpoint compatible; se aplican en cada inicio. |
| `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENAI_COMPAT_API_KEY` | del asistente | La clave del proveedor elegido. |
| `TELEGRAM_*`, `DISCORD_*`, `SLACK_*`, `WHATSAPP_*`, `EMAIL_*` | del asistente | Credenciales y listas de permitidos de cada canal. `GATEWAY_ALLOW_ALL_USERS` queda en `false`. En el correo, `EMAIL_AUTHSERV_ID` es obligatorio y `EMAIL_TRUST_FROM_HEADER` queda en `false`: no lo actives, o cualquiera podría hacerse pasar por alguien de la lista. |
| `PUBLIC_ORIGIN` | dirección de la app | Origen público (orígenes permitidos del chat; cookie `Secure` en https). |

## Recursos

- RAM: 1536 MB (mínimo) / 2048 MB (recomendado); ~0,6 GiB en reposo, medido sin WhatsApp.
- Un puerto público (80) para el chat. Ningún otro puerto queda abierto fuera del contenedor; el panel `/admin` de Hermes no se inicia.
- Disco: dependencias Python en `/app/.local` (~380 MB), código de Hermes en `/app/hermes-agent` (~90 MB) y del WebUI en `/app/hermes-webui` (~18 MB); con WhatsApp, Node.js en `/app/.local/node` (~136 MB) y el puente (npm) en `/app/hermes-agent/scripts/whatsapp-bridge`; estado en `/app/.hermes`.
- Red en el runtime: GitHub (primer inicio), PyPI (instalación), nodejs.org y el registro npm (solo con WhatsApp), APIs de los proveedores y de los canales.
- Versiones fijas: Hermes `bf0203a794a0` (tag v0.22.5), WebUI `687d80333870` y Node.js `v24.22.2`, cada uno con su SHA-256 en `src/start.py`; dependencias con hashes en `src/requirements.txt` (lock oficial de Hermes para Python 3.14). Para actualizar, cámbialos juntos.

## Problemas comunes

- **El chat pide contraseña y no la acepta.** Usa la contraseña de las salidas. ¿La perdiste? Cambia el secreto `HERMES_ADMIN_PASSWORD` y reinicia: la contraseña se reescribe en cada inicio. Tras varios intentos errados el login espera un minuto.
- **403 en un pedido tuyo.** Es la protección de origen cruzado del chat: el `Origin` del pedido no es la dirección de la app. Abre la app directo por su dirección; las llamadas de script sin `Origin` (curl) no se ven afectadas.
- **La app cae al subir.** Revisa la RAM (mínimo 1,5 GB) y el log: `HERMES_ADMIN_PASSWORD is required` indica el secreto ausente; `could not get a verified copy` indica fallo al descargar de GitHub o Node.js (o un SHA-256 distinto del fijado; la app sale con código 70).
- **Un canal no responde.** Mira el log de la app (token rechazado) y si tu id está en la lista de permitidos. En el correo, "authserv-id" en el log significa que `EMAIL_AUTHSERV_ID` no coincide con el encabezado `Authentication-Results` más arriba de tus mensajes.
- **Cambié `config.yaml` y volvió.** Proveedor y modelo se reaplican en cada inicio desde las variables; cambia las variables.
- **El QR de WhatsApp no aparece, o no se escanea.** Busca "Scan this QR code" en el log (solo sale mientras no hay sesión). Si las líneas se ven rotas, usa una fuente monoespaciada. Si expiró, reinicia. Para emparejar de nuevo, borra `/app/.hermes/platforms/whatsapp/session` y reinicia.
- **Necesito el panel `/admin`.** Queda desactivado en este template (sin contraseña propia; su frontend necesita Node para compilarse).
