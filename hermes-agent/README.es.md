# Hermes Agent

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Un agente de IA que aprende con el uso, con panel web, chat opcional en el navegador y canales de mensajería. Hermes Agent v0.22.5 como app de código Python 3.14 (sin imagen Docker): las dependencias son el lock oficial del proyecto, con hashes; el código de Hermes, Node.js y Caddy se descargan en el primer inicio, por versión y con SHA-256 verificado, y el panel se compila desde el código fuente. Tú traes la clave del modelo.

## Qué es

- **Panel** en `/admin/`: configuración, claves, sesiones, archivos, logs, cron, skills, plugins, MCP, canales (incluye el emparejamiento de WhatsApp), webhooks y un chat de terminal en `/admin/chat`.
- **Chat en el navegador** opcional (Hermes WebUI) en `/`, con sesiones, archivos y ajustes. Sin él, `/` lleva al panel.
- **Login único**: Caddy escucha el puerto público y pide usuario (`admin`) y contraseña (generada) una vez y guarda una sesión en cookie, para que el chat del panel y el del navegador no pidan la contraseña de nuevo. El panel, el chat y el agente escuchan solo en `127.0.0.1`, dentro del contenedor.
- **Protección contra origen cruzado**: antes del login, Caddy rechaza (403) cualquier pedido cuyo `Origin` no sea la dirección propia de la app y cualquier pedido de otro sitio que no sea una navegación (un enlace a tu app sigue abriendo). Así una página alojada en otra app de `*.vertraweb.app` no puede usar tu login, aún abierto en el navegador, para abrir la terminal del panel ni cambiar datos.
- **Sin marco**: el panel y el chat no se abren dentro de otra página (`X-Frame-Options: DENY` y `frame-ancestors 'none'`), así que la vista previa del panel de Vertra muestra la tarjeta "abrir en nueva pestaña" para esta app.
- **Proveedores** y **canales** como se describe abajo. Proveedor y modelo valen **en cada inicio** (manda la variable).

## Qué pregunta el asistente

| Pregunta | Para qué sirve |
|---|---|
| Proveedor de modelo | OpenRouter (predeterminado), Anthropic, OpenAI, Google Gemini o un endpoint compatible con OpenAI. |
| Clave de API del proveedor | Solo en las variables cifradas de la app. |
| URL base y modelo | La URL solo con endpoint compatible (termina en `/v1`). Modelo vacío = el predeterminado del proveedor; obligatorio con endpoint compatible. |
| Chat en el navegador (Hermes WebUI) | Opcional; cuesta ~150 MB de RAM. Queda en `/`, y el panel en `/admin/`. |
| Telegram, Discord, Slack, WhatsApp, correo | Cada uno pide credenciales y la **lista de quién puede hablar con el agente** (obligatoria). WhatsApp se empareja por QR en el panel (o en el log de la app). En el correo, indica también el identificador del servidor (`authserv-id`; Gmail: `mx.google.com`): el agente solo actúa sobre remitentes que tu servidor autenticó. |

## Qué recibes

- El **panel** (`<dirección>/admin/`) y el usuario `admin`.
- La **contraseña** del login, mostrada **una vez**.
- El siguiente paso y la instrucción de WhatsApp.

## Primeros pasos

1. Espera el primer inicio: instala las dependencias, descarga Hermes, Node.js y Caddy y compila el panel (unos 2 minutos con buena red, hasta ~10 con GitHub lento: instala ~130 paquetes en ~30-50 s, descarga ~150 MB y compila el panel en ~1 min). Síguelo en el log de la app; el panel abre cuando termina la compilación.
2. Abre `<dirección>/admin/` con `admin` y la contraseña de las salidas.
3. Habla con el agente en el chat de terminal del panel (`/admin/chat`), en el chat del navegador (`/`, si lo activaste) o en el canal que conectaste.
4. **WhatsApp:** mira la sección de abajo.
5. Para cambiar de proveedor o modelo, edita `HERMES_MODEL_PROVIDER` / `HERMES_MODEL_CUSTOM` en las variables de la app y reinicia.

## WhatsApp

Opcional, por el puente no oficial Baileys (el que trae Hermes). El Node.js que necesita ya viene con la app; la primera vez la app instala las dependencias del puente (npm).

**Emparejar:**
- **Por el panel:** en `/admin/channels` > WhatsApp, escanea el QR (expira) en WhatsApp > Dispositivos vinculados > Vincular un dispositivo.
- **Por el log:** abre el **log de la app**, busca "Scan this QR code with WhatsApp on your phone" y escanea el QR, que sale como bloques de texto: míralo en una fuente monoespaciada (las líneas partidas no se escanean). Expira en ~1 min; reinicia la app para uno nuevo. Usa uno de los dos a la vez.
- Al emparejar por el log, la app reinicia el agente sola y el puente sube. El modo predeterminado es "escribirte a ti mismo" (WhatsApp > tu propio chat); `WHATSAPP_ALLOWED_USERS` limita quién habla con el agente.

La sesión queda en `/app/.hermes/platforms/whatsapp/session`. Para emparejar de nuevo, borra esa carpeta (gestor de archivos) y reinicia. Una sesión de WhatsApp por app.

**Alternativa oficial: WhatsApp Cloud API (Meta).** Hermes también habla con la API oficial de Meta (variables `WHATSAPP_CLOUD_PHONE_NUMBER_ID`, `WHATSAPP_CLOUD_ACCESS_TOKEN`, `WHATSAPP_CLOUD_APP_SECRET`, `WHATSAPP_CLOUD_VERIFY_TOKEN`, `WHATSAPP_CLOUD_ALLOWED_USERS`; mira la documentación de Hermes). No usa QR ni el puente, pero Meta debe alcanzar un webhook HTTPS (`/whatsapp/webhook`, puerto `WHATSAPP_CLOUD_WEBHOOK_PORT`, por defecto 8090). Este template solo expone el puerto público de Caddy, así que el webhook no es accesible sin un proxy tuyo delante; el asistente no configura esta opción.

## Límites conocidos

- RAM: mínimo **2 GB**, recomendado 3 GB (~1,1 GiB en reposo con el panel, el chat y una sesión de terminal abiertos; la primera compilación llega a ~1,4 GiB).
- Primer inicio: unos 2 minutos con buena red, hasta ~10 con GitHub lento: instala ~130 paquetes en ~30-50 s, descarga ~150 MB y compila el panel en ~1 min. Reinicios: unos 20 s, sin descargar ni compilar nada. El `/healthz` (lo responde Caddy mismo, sin contraseña y sin datos) responde antes de que termine la compilación; hasta entonces `/admin` no responde.
- Disco: ~770 MB (dependencias Python ~380 MB, Node.js ~136 MB, Caddy ~45 MB, código de Hermes ~90 MB, panel y chat de terminal ~8 MB); con WhatsApp, ~50 MB más del puente; el estado queda en `/app/.hermes`.
- Las dependencias son el lock oficial de Hermes v0.22.5 para Python 3.14 (extras `all`, `messaging` y `anthropic`), instaladas con `PIP_NO_DEPS=1`: el lock ya es el conjunto completo, y pip rechazaría el reemplazo de Pillow que hace el propio proyecto. Quedan fuera Matrix, Bedrock, Azure, Google Chat, OTLP y voz/TTS.
- El Python de la plataforma trae un SQLite con el bug de corrupción del modo WAL; Hermes lo detecta y usa `journal_mode=DELETE` (un aviso en el log), algo más lento al escribir.
- Un token de canal inválido **aparece en el log de la app** ("token ... was rejected"): no compartas el log. La app sigue en pie con el canal detenido.
- Signal, Matrix, Mattermost y otros no están en el asistente: usa `/admin/channels` o variables de la app. Signal necesita un daemon `signal-cli` externo y no corre en este contenedor.
- Caddy es el único portón (sin límite de intentos): la contraseña generada es larga. Si quieres más protección, pon una regla de límite de tasa en tu dominio.
- El envío de métricas de uso al proyecto Hermes viene **desactivado por defecto**: en el primer inicio el template responde "No thanks" a la pregunta "Help improve Hermes?" del panel; si lo activas después, tu elección se mantiene.
- El deploy sin downtime queda desactivado (la segunda copia en el mismo disco sale con error). ¿Olvidaste la contraseña? Cambia el secreto `HERMES_ADMIN_PASSWORD` y reinicia.
- El canal de correo y los modelos predeterminados de cada proveedor no se ejercitaron con una cuenta o clave reales.

## Licencia

Hermes Agent se distribuye bajo la licencia MIT (Nous Research): <https://github.com/NousResearch/hermes-agent/blob/main/LICENSE>. El chat opcional es Hermes WebUI (MIT): <https://github.com/nesquena/hermes-webui/blob/687d80333870c3797d6858738621fca13d1bf27a/LICENSE>. El Caddy que protege el acceso es Apache-2.0 y Node.js es MIT; el puente de WhatsApp usa Baileys (MIT). El icono es el logo oficial, sin cambios (`ICONS.md`). Este template es un empaquetado de Vertra Cloud y no está afiliado al proyecto.

Más detalles: [docs/first-steps.es.md](docs/first-steps.es.md) · [docs/reference.es.md](docs/reference.es.md)
