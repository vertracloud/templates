# Hermes Agent

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Un agente de IA que aprende con el uso, con chat en el navegador y canales de mensajería. Hermes Agent v0.22.5 como app de código Python 3.14 (sin imagen Docker): las dependencias son el lock oficial del proyecto, con hashes, y el código de Hermes se descarga del repositorio oficial, por commit y con verificación de SHA-256, en el primer inicio. Tú traes la clave del modelo.

## Qué es

- **Chat en el navegador** (Hermes WebUI) en `/`, con sesiones, archivos, ajustes y proveedores. Tiene login propio: pide solo la contraseña generada.
- **Canales**: Telegram, Discord, Slack, WhatsApp y correo, cada uno con una lista de quién puede hablar con el agente.
- **Proveedores** como se describe abajo. Proveedor y modelo valen **en cada inicio** (manda la variable).
- La contraseña no queda en el entorno de los procesos del agente: la app guarda solo su hash y quita la variable antes de iniciar el agente.
- **Sin marco**: el chat no se abre dentro de otra página (`X-Frame-Options: DENY`), así que la vista previa del panel de Vertra muestra la tarjeta "abrir en nueva pestaña" para esta app.
- El **panel de Hermes** (`/admin`) queda **desactivado**: no tiene contraseña propia y su frontend necesita Node para compilarse. Los ajustes están en el chat; los canales, en variables de la app.

## Qué pregunta el asistente

| Pregunta | Para qué sirve |
|---|---|
| Proveedor de modelo | OpenRouter (predeterminado), Anthropic, OpenAI, Google Gemini o un endpoint compatible con OpenAI. |
| Clave de API del proveedor | Solo en las variables cifradas de la app. |
| URL base y modelo | La URL solo con endpoint compatible (termina en `/v1`). Modelo vacío = el predeterminado del proveedor; obligatorio con endpoint compatible. |
| Chat en el navegador (Hermes WebUI) | Activado por defecto; cuesta ~150 MB de RAM. Desactivado, la página devuelve solo una nota y el agente responde por sus canales. |
| Telegram, Discord, Slack, WhatsApp, correo | Cada uno pide credenciales y la **lista de quién puede hablar con el agente** (obligatoria). WhatsApp se empareja por QR en el log de la app. En el correo, indica también el identificador del servidor (`authserv-id`; Gmail: `mx.google.com`): el agente solo actúa sobre remitentes que tu servidor autenticó. |

## Qué recibes

- La dirección del **chat** y la **contraseña** del login, mostrada **una vez** (solo contraseña, sin usuario).
- El siguiente paso y la instrucción de WhatsApp.

## Primeros pasos

1. Espera el primer inicio (instala las dependencias, descarga Hermes y el WebUI y sincroniza las skills).
2. Abre la dirección e inicia sesión con la contraseña de las salidas.
3. Habla con el agente en el chat o en el canal que conectaste.
4. **WhatsApp:** mira la sección de abajo.
5. Para cambiar de proveedor o modelo, edita `HERMES_MODEL_PROVIDER` / `HERMES_MODEL_CUSTOM` en las variables de la app y reinicia.

## WhatsApp

Opcional, por el puente no oficial Baileys (el que trae Hermes). Al activar la opción, la app descarga el Node.js oficial (`v24.22.2`, de nodejs.org, con SHA-256 verificado; ~136 MB en `/app/.local/node`, solo la primera vez) e instala el puente; Node es visible solo para Hermes.

**Emparejar mirando el log:**
1. Tras el deploy, abre el **log de la app** y busca "Scan this QR code with WhatsApp on your phone".
2. El QR sale como bloques de texto: mira el log en una fuente monoespaciada. Si tu visor parte o comprime las líneas, el QR no se escanea; usa una ventana ancha o copia el texto a un editor monoespaciado.
3. En el celular: WhatsApp > Dispositivos vinculados > Vincular un dispositivo, y escanea. El QR expira en ~1 min; si expira, reinicia la app para uno nuevo.
4. Al emparejar, la app reinicia el agente sola y el puente sube. El modo predeterminado es "escribirte a ti mismo" (WhatsApp > tu propio chat); `WHATSAPP_ALLOWED_USERS` limita quién habla con el agente.

La sesión queda en `/app/.hermes/platforms/whatsapp/session`. Para emparejar de nuevo, borra esa carpeta (gestor de archivos) y reinicia. Una sesión de WhatsApp por app.

**Alternativa oficial: WhatsApp Cloud API (Meta).** Hermes también habla con la API oficial de Meta (variables `WHATSAPP_CLOUD_PHONE_NUMBER_ID`, `WHATSAPP_CLOUD_ACCESS_TOKEN`, `WHATSAPP_CLOUD_APP_SECRET`, `WHATSAPP_CLOUD_VERIFY_TOKEN`, `WHATSAPP_CLOUD_ALLOWED_USERS`; mira la documentación de Hermes). No usa QR ni el puente, pero Meta debe alcanzar un webhook HTTPS (`/whatsapp/webhook`, puerto `WHATSAPP_CLOUD_WEBHOOK_PORT`, por defecto 8090). Este template solo expone el puerto público del chat, así que el webhook no es accesible sin un proxy tuyo delante; el asistente no configura esta opción.

## Límites conocidos

- RAM: mínimo **1,5 GB**, recomendado 2 GB (~0,6 GiB en reposo, medido sin WhatsApp).
- Primer inicio: unos 1,5 minutos (instala ~130 paquetes con hash en ~40 s, descarga ~120 MB de GitHub y sincroniza las skills); con WhatsApp, además Node.js y el puente. Reinicios: ~10 s. La app no responde mientras instala y descarga; el healthcheck es `/health` (solo contadores).
- Las dependencias son el lock oficial de Hermes v0.22.5 para Python 3.14 (extras `all`, `messaging` y `anthropic`), instaladas con `PIP_NO_DEPS=1`: el lock ya es el conjunto completo, y pip rechazaría el reemplazo de Pillow que hace el propio proyecto. Quedan fuera Matrix, Bedrock, Azure, Google Chat, OTLP y voz/TTS.
- El Python de la plataforma trae un SQLite con el bug de corrupción del modo WAL; Hermes lo detecta y usa `journal_mode=DELETE` (un aviso en el log), algo más lento al escribir.
- Un token de canal inválido **aparece en el log de la app** ("token ... was rejected"): no compartas el log. La app sigue en pie con el canal detenido.
- Signal, Matrix, Mattermost y otros no están en el asistente. Signal necesita un daemon `signal-cli` externo.
- El login del chat limita los intentos por dirección y la contraseña generada es larga. ¿Olvidaste la contraseña? Cambia el secreto `HERMES_ADMIN_PASSWORD` y reinicia.
- El envío de métricas de uso al proyecto Hermes viene **desactivado por defecto**; si lo activas después, tu elección se mantiene.
- El deploy sin downtime queda desactivado (la segunda copia en el mismo disco sale con error).
- El canal de correo y los modelos predeterminados de cada proveedor no se ejercitaron con una cuenta o clave reales.

## Licencia

Hermes Agent se distribuye bajo la licencia MIT (Nous Research): <https://github.com/NousResearch/hermes-agent/blob/main/LICENSE>. El chat es Hermes WebUI (MIT): <https://github.com/nesquena/hermes-webui/blob/687d80333870c3797d6858738621fca13d1bf27a/LICENSE>. Con WhatsApp activado, el Node.js descargado se distribuye bajo licencia MIT (<https://github.com/nodejs/node/blob/main/LICENSE>) y el puente usa Baileys (MIT). El icono es el logo oficial, sin cambios (`ICONS.md`). Este template es un empaquetado de Vertra Cloud y no está afiliado al proyecto.

Más detalles: [docs/first-steps.es.md](docs/first-steps.es.md) · [docs/reference.es.md](docs/reference.es.md)
