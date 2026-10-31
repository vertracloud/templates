# Primeros pasos

1. **Espera el primer inicio.** Instala las dependencias, descarga Hermes y el WebUI (por commit, con SHA-256 verificado) y sincroniza las skills. Síguelo en el log de la app.
2. **Inicia sesión.** Abre la dirección de la app; la página pide la contraseña mostrada **una vez** en las salidas (solo la contraseña, sin usuario). ¿La perdiste? Cambia `HERMES_ADMIN_PASSWORD` en las variables de la app y reinicia.
3. **Conversa.** El chat del navegador está en `<dirección>/` (si lo desactivaste, la página muestra solo una nota y el agente responde por los canales).
4. **Conecta un canal:**
   - *Telegram:* crea el bot con @BotFather; indica el token y tu id numérico (@userinfobot).
   - *Discord:* Portal de Desarrolladores > Bot > Reset Token, con **Message Content Intent**; indica tu id de usuario.
   - *Slack:* app con Socket Mode; `xoxb-` (bot), `xapp-` (app, alcance `connections:write`) y el id de miembro.
   - *WhatsApp:* activa la opción e indica los números permitidos (con código de país, solo dígitos). Tras el deploy, abre el **log de la app**, localiza "Scan this QR code with WhatsApp on your phone" y escanea el QR (fuente monoespaciada) en WhatsApp > Dispositivos vinculados > Vincular un dispositivo. Expira en ~1 min; reinicia la app para uno nuevo. Al emparejar, el agente se reinicia solo. La primera vez descarga Node.js (~30 MB) e instala el puente.
   - *Correo:* dirección, contraseña (de app, en Gmail), servidores IMAP y SMTP, la lista de remitentes permitidos y el `authserv-id` de tu servidor (Gmail: `mx.google.com`). El agente solo actúa sobre remitentes que el servidor autenticó.
5. **Skills y programaciones.** Hermes sincroniza las skills en el primer inicio. Las programaciones (cron) te hablan por el canal.
6. **Cambiar de modelo.** Edita `HERMES_MODEL_PROVIDER` y `HERMES_MODEL_CUSTOM` (o `HERMES_MODEL`) y reinicia: la variable es la fuente de verdad y sobrescribe `config.yaml` en el próximo inicio.

## Actualizar y volver
La plataforma toma un snapshot antes de actualizar. El estado (`/app/.hermes`: memorias, sesiones, skills, configuración) vuelve junto en el rollback.
