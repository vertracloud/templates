# First steps

1. **Sign in to the panel.** Open the app address. In *Settings > Gateway* paste the **gateway token** (shown once in the outputs; it also lives in the encrypted variable `OPENCLAW_GATEWAY_TOKEN`). Within 15 s the first browser is paired automatically; later devices ask for approval in *Settings > Devices*.
2. **Talk to the assistant.** The model and provider chosen in the wizard are already active. For another model, change it in *Settings > Models* or in the `OPENCLAW_PROVIDER` / `OPENCLAW_MODEL_ID` variables.
3. **Use the browser.** Ask "open example.com and tell me the title". *Chat > + > Browser* shows the agent's window. Pages on a private or local network are blocked on purpose.
4. **Connect a channel.**
   - *Telegram:* create the bot with @BotFather and enter the token and your numeric id (talk to @userinfobot).
   - *Discord:* Developer Portal > Bot > Reset Token; enable **Message Content Intent**; enter your user id (Developer Mode).
   - *Slack:* an app with Socket Mode; enter the *Bot User OAuth Token* (`xoxb-`), the *App-Level Token* (`xapp-`, scope `connections:write`) and the member id.
   - *WhatsApp:* *Settings > Channels > WhatsApp* and scan the QR as soon as it appears.
5. **Cron and skills.** *Settings > Cron* for scheduled tasks; the ready skills show up in *Skills*.

## Update and roll back
The platform takes a snapshot before updating. Rolling back brings the data along: OpenClaw migrates its local schema when it starts a new version.
