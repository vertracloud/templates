# Primeros pasos

1. **Entra como administrador.** La cuenta ya existe cuando termina el deploy (la dirección solo abre después de crearla): entra con `admin` y la contraseña de las salidas, que se muestra una vez. Cambia la contraseña en *Configuración > Perfil* si quieres; la contraseña de las salidas solo vale en el primer arranque.
2. **Crea el primer monitor.** *Add New Monitor*: tipo (HTTP(S), TCP, Ping, DNS...), nombre, destino e intervalo. El mínimo es 20 s; 60 s alcanza para la mayoría de los sitios.
3. **Conecta una alerta.** *Settings > Notifications > Setup Notification*. Para Telegram, crea un bot con @BotFather e indica el token y el id del chat. Marca *Default enabled* para que cada monitor nuevo use ese canal.
4. **Publica una página de estado.** *Status Pages > New Status Page*, elige la dirección corta (`/status/<nombre>`), agrega los monitores y guarda. La página es pública y no pide login.
5. **Usa tu dominio (opcional).** Agrega el dominio en *Dominios* de la app y, en la página de estado de Kuma, indícalo en *Domain Names*.

## Monitor "Push" (heartbeat)
Para tareas programadas (cron, backups), crea un monitor *Push*: Kuma genera una URL. Haz que la tarea llame a esa URL en cada ejecución; si deja de llamar dentro del intervalo, el monitor cae y se dispara la alerta.

## Actualizaciones y backup
Uptime Kuma migra su base al actualizar, por eso el rollback de la plataforma vuelve **con los datos**. Los datos (`/app/data/kuma.db`) entran en los snapshots de la app.
