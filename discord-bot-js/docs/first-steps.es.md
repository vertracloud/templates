# Primeros pasos

## 1. Crear el bot y obtener el token
1. Abre el [Portal de Desarrolladores de Discord](https://discord.com/developers/applications) y crea una **New Application**.
2. En **Bot**, usa **Reset Token** y copia el valor. Solo aparece una vez.
3. Pega el token en el asistente del template. Se vuelve la variable cifrada `DISCORD_TOKEN`.

## 2. Invitar al bot
En **OAuth2 > URL Generator** marca los scopes `bot` y `applications.commands`, abre la URL generada y elige el servidor.

## 3. Comprobar
Después del deploy el log de la app debe mostrar `Logged in as <nombre del bot>`. En Discord, escribe `/ping`: el bot responde `Pong!` con la latencia.

## 4. Hacer tu propio bot
El template es un punto de partida. Abre `src/index.js` y agrega comandos; haz deploy otra vez (o reinicia, si editaste en el editor de la app).
Para agregar librerías, usa `npm install <paquete>` localmente y envía el `package.json` y el `package-lock.json` actualizados: la plataforma instala las dependencias en cada deploy.
