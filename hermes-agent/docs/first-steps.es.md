# Primeros pasos

1. **Espera el primer inicio.** Instala las dependencias, descarga Hermes, Node.js y Caddy (por versión, con SHA-256 verificado) y compila el panel (unos 2 minutos con buena red, hasta ~10 con GitHub lento: instala ~130 paquetes en ~30-50 s, descarga ~150 MB y compila el panel en ~1 min). Síguelo en el log de la app; el panel abre cuando termina la compilación.
2. **Inicia sesión.** Abre `<dirección>/admin/`; el navegador pide usuario y contraseña. Usa `admin` y la contraseña mostrada **una vez** en las salidas. ¿La perdiste? Cambia `HERMES_ADMIN_PASSWORD` en las variables de la app y reinicia.
3. **Conversa.** En el panel usa *Chat* (`/admin/chat`, la terminal de Hermes). Si activaste el chat en el navegador, está en `<dirección>/` con el mismo login.
4. **Conecta un canal** (o usa *Canales* en `/admin/channels`):
   - *Telegram:* crea el bot con @BotFather; indica el token y tu id numérico (@userinfobot).
   - *Discord:* Portal de Desarrolladores > Bot > Reset Token, con **Message Content Intent**; indica tu id de usuario.
   - *Slack:* app con Socket Mode; `xoxb-` (bot), `xapp-` (app, alcance `connections:write`) y el id de miembro.
   - *WhatsApp:* activa la opción e indica los números permitidos (con código de país, solo dígitos). Escanea el QR en *Canales > WhatsApp* (expira) o en el **log de la app** (busca "Scan this QR code with WhatsApp on your phone", en fuente monoespaciada; reinicia la app para uno nuevo). Usa uno de los dos a la vez.
   - *Correo:* dirección, contraseña (de app, en Gmail), servidores IMAP y SMTP, la lista de remitentes permitidos y el `authserv-id` de tu servidor (Gmail: `mx.google.com`). El agente solo actúa sobre remitentes que el servidor autenticó.
5. **Skills y programaciones.** Hermes sincroniza las skills en el primer inicio. *Cron* crea tareas recurrentes que te hablan por el canal.
6. **Cambiar de modelo.** Edita `HERMES_MODEL_PROVIDER` y `HERMES_MODEL_CUSTOM` (o `HERMES_MODEL`) y reinicia: la variable es la fuente de verdad y sobrescribe `config.yaml` en el próximo inicio.

## Actualizar y volver
La plataforma toma un snapshot antes de actualizar. El estado (`/app/.hermes`: memorias, sesiones, skills, configuración) vuelve junto en el rollback.
