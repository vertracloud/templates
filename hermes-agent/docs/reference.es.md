# Referencia

## Variables de la app

| Variable | Valor | Para qué sirve |
|---|---|---|
| `HERMES_HOME` | `/app/.hermes` | Estado del agente, en el disco de la app. |
| `HERMES_ADMIN_USER` / `HERMES_ADMIN_PASSWORD` | `admin` / secreto generado | Login de Caddy (la contraseña se convierte en hash bcrypt en cada inicio y la variable se quita del entorno de los procesos). |
| `HERMES_WEBUI` | `true` / `false` | Activa el chat en el navegador. |
| `PIP_NO_DEPS` | `1` | La instalación usa solo `requirements.txt` (lock completo, con hashes). |
| `HERMES_MODEL_PROVIDER`, `HERMES_MODEL`, `HERMES_MODEL_CUSTOM`, `HERMES_BASE_URL` | del asistente | Proveedor, modelo predeterminado de la opción, modelo escrito (gana) y URL base del endpoint compatible; se aplican en cada inicio. |
| `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENAI_COMPAT_API_KEY` | del asistente | La clave del proveedor elegido. |
| `TELEGRAM_*`, `DISCORD_*`, `SLACK_*`, `WHATSAPP_*`, `EMAIL_*` | del asistente | Credenciales y listas de permitidos de cada canal. `GATEWAY_ALLOW_ALL_USERS` queda en `false`. En el correo, `EMAIL_AUTHSERV_ID` es obligatorio y `EMAIL_TRUST_FROM_HEADER` queda en `false`: no lo actives, o cualquiera podría hacerse pasar por alguien de la lista. |
| `PUBLIC_ORIGIN` | dirección de la app | Origen público (orígenes permitidos del chat; cookie `Secure` en https). |

## Recursos

- RAM: 2048 MB (mínimo) / 3072 MB (recomendado); ~1,1 GiB en reposo con el panel, el chat y una sesión de terminal abiertos; la primera compilación llega a ~1,4 GiB.
- Puerto público 80, de Caddy. El panel (`127.0.0.1:9119`), el chat (`127.0.0.1:8787`) y el agente solo escuchan dentro del contenedor.
- Disco: ~770 MB (dependencias Python ~380 MB, Node.js ~136 MB, Caddy ~45 MB, código de Hermes ~90 MB, panel y chat de terminal ~8 MB); con WhatsApp, ~50 MB más del puente; el estado queda en `/app/.hermes`.
- Red en el runtime: GitHub (primer inicio), PyPI (instalación), nodejs.org y el registro npm (compilación del panel y puente de WhatsApp), APIs de los proveedores y de los canales.
- Versiones fijas: Hermes `bf0203a794a0` (tag v0.22.5), WebUI `687d80333870`, Node.js `v24.22.2` y Caddy `v2.11.7`, cada uno con su SHA-256 en `src/start.py`; dependencias con hashes en `src/requirements.txt` (lock oficial de Hermes para Python 3.14). Para actualizar, cámbialos juntos.

## Problemas comunes

- **401 en todo.** Es el login de Caddy: usa `admin` y la contraseña de las salidas.
- **403 en un pedido tuyo.** Es la protección de origen cruzado: el `Origin` del pedido no es la dirección de la app (un script o proxy tuyo enviando el `Origin` de otro sitio) o el navegador marcó el pedido como de otro sitio. Abre la app directo por su dirección; las llamadas de script sin `Origin` (curl) no se ven afectadas.
- **502 o sin respuesta en `/admin` justo tras el deploy.** El primer inicio aún compila el panel (`/healthz` ya responde). Síguelo en el log: "dashboard build: ... done".
- **Falló la compilación del panel.** El log muestra "building the dashboard failed at: ..."; el agente y los canales siguen en pie sin panel y la compilación se intenta de nuevo en el próximo inicio. Revisa la red (nodejs.org, registro npm) y la RAM.
- **La app cae al subir.** Revisa la RAM (mínimo 2 GB) y el log: `HERMES_ADMIN_PASSWORD is required` indica el secreto ausente; `could not get a verified copy` indica fallo al descargar de GitHub o nodejs.org (o un SHA-256 distinto del fijado; la app sale con código 70).
- **El QR de WhatsApp no aparece, o no se escanea.** En `/admin/channels` o en el log ("Scan this QR code", solo mientras no hay sesión). Si las líneas del log se ven rotas, usa una fuente monoespaciada. Si expiró, reinicia. Para emparejar de nuevo, borra `/app/.hermes/platforms/whatsapp/session` y reinicia.
- **Un canal no responde.** Mira el log de la app (token rechazado) y si tu id está en la lista de permitidos. En el correo, "authserv-id" en el log significa que `EMAIL_AUTHSERV_ID` no coincide con el encabezado `Authentication-Results` más arriba de tus mensajes.
- **Cambié `config.yaml` y volvió.** Proveedor y modelo se reaplican en cada inicio desde las variables; cambia las variables.
