# First steps

1. **Wait for the first start.** It installs the dependencies, downloads Hermes and the WebUI (by commit, SHA-256 checked) and syncs the skills. Follow it in the app log.
2. **Sign in.** Open the app address; the page asks for the password shown **once** in the outputs (password only, no user). Lost it? Change `HERMES_ADMIN_PASSWORD` in the app variables and restart.
3. **Talk.** The browser chat is at `<address>/` (if you turned it off, the page shows only a note and the agent answers through its channels).
4. **Connect a channel:**
   - *Telegram:* create the bot with @BotFather; give the token and your numeric id (@userinfobot).
   - *Discord:* Developer Portal > Bot > Reset Token, with **Message Content Intent**; give your user id.
   - *Slack:* a Socket Mode app; `xoxb-` (bot), `xapp-` (app, scope `connections:write`) and the member id.
   - *WhatsApp:* turn the option on and give the allowed numbers (with country code, digits only). After the deploy, open the **app log**, find "Scan this QR code with WhatsApp on your phone" and scan the QR (monospaced font) in WhatsApp > Linked devices > Link a device. It expires in ~1 min; restart the app for a new one. Once paired, the agent restarts by itself. The first time it downloads Node.js (~30 MB) and installs the bridge.
   - *Email:* address, password (an app password on Gmail), IMAP and SMTP servers, the list of allowed senders and your server's `authserv-id` (Gmail: `mx.google.com`). The agent only acts on senders the server authenticated.
5. **Skills and schedules.** Hermes syncs the skills on the first start. Schedules (cron) talk to you through the channel.
6. **Change model.** Edit `HERMES_MODEL_PROVIDER` and `HERMES_MODEL_CUSTOM` (or `HERMES_MODEL`) and restart: the variable is the source of truth and overwrites `config.yaml` on the next start.

## Update and roll back
The platform takes a snapshot before updating. The state (`/app/.hermes`: memories, sessions, skills, configuration) comes back with the rollback.
