# First steps

1. **Wait for the first start.** It installs the dependencies, downloads Hermes, Node.js and Caddy (by version, SHA-256 checked) and builds the panel (about 2 minutes on a good network, up to ~10 when GitHub is slow: installs ~130 packages in ~30-50 s, downloads ~150 MB and builds the panel in ~1 min). Follow it in the app log; the panel opens when the build ends.
2. **Sign in.** Open `<address>/admin/`; the browser asks for a user and a password. Use `admin` and the password shown **once** in the outputs. Lost it? Change `HERMES_ADMIN_PASSWORD` in the app variables and restart.
3. **Talk.** In the panel use *Chat* (`/admin/chat`, the Hermes terminal). If you turned on the browser chat, it is at `<address>/` with the same login.
4. **Connect a channel** (or use *Channels* at `/admin/channels`):
   - *Telegram:* create the bot with @BotFather; give the token and your numeric id (@userinfobot).
   - *Discord:* Developer Portal > Bot > Reset Token, with **Message Content Intent**; give your user id.
   - *Slack:* a Socket Mode app; `xoxb-` (bot), `xapp-` (app, scope `connections:write`) and the member id.
   - *WhatsApp:* turn the option on and give the allowed numbers (with country code, digits only). Scan the QR in *Channels > WhatsApp* (it expires) or in the **app log** (look for "Scan this QR code with WhatsApp on your phone", in a monospaced font; restart the app for a new one). Use one of the two at a time.
   - *Email:* address, password (an app password on Gmail), IMAP and SMTP servers, the list of allowed senders and your server's `authserv-id` (Gmail: `mx.google.com`). The agent only acts on senders the server authenticated.
5. **Skills and schedules.** Hermes syncs the skills on the first start. *Cron* creates recurring tasks that talk to you through the channel.
6. **Change model.** Edit `HERMES_MODEL_PROVIDER` and `HERMES_MODEL_CUSTOM` (or `HERMES_MODEL`) and restart: the variable is the source of truth and overwrites `config.yaml` on the next start.

## Update and roll back
The platform takes a snapshot before updating. The state (`/app/.hermes`: memories, sessions, skills, configuration) comes back with the rollback.
