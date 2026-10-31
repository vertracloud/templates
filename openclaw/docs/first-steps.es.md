# Primeros pasos

1. **Entra al panel.** Abre la dirección de la app. En *Configuración > Gateway* pega el **token del gateway** (mostrado una vez en las salidas; también vive en la variable cifrada `OPENCLAW_GATEWAY_TOKEN`). En hasta 15 s el primer navegador se empareja solo; los siguientes dispositivos piden aprobación en *Configuración > Dispositivos*.
2. **Habla con el asistente.** El modelo y el proveedor elegidos en el asistente ya están activos. Para otro modelo, cámbialo en *Configuración > Modelos* o en las variables `OPENCLAW_PROVIDER` / `OPENCLAW_MODEL_ID`.
3. **Usa el navegador.** Pide "abre example.com y dime el título". *Chat > + > Browser* muestra la ventana del agente. Las páginas en red privada o local se bloquean a propósito.
4. **Conecta un canal.**
   - *Telegram:* crea el bot con @BotFather e indica el token y tu id numérico (habla con @userinfobot).
   - *Discord:* Portal de Desarrolladores > Bot > Reset Token; activa **Message Content Intent**; indica tu id de usuario (Modo Desarrollador).
   - *Slack:* una app con Socket Mode; indica el *Bot User OAuth Token* (`xoxb-`), el *App-Level Token* (`xapp-`, scope `connections:write`) y el id de miembro.
   - *WhatsApp:* *Configuración > Canales > WhatsApp* y escanea el QR en cuanto aparezca.
5. **Cron y skills.** *Configuración > Cron* para tareas programadas; las skills listas aparecen en *Skills*.

## Actualizar y volver
La plataforma toma un snapshot antes de actualizar. Volver de versión lleva los datos: OpenClaw migra su esquema local al arrancar una versión nueva.
