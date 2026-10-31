# First steps

## 1. Create the bot and get the token
1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and create a **New Application**.
2. Under **Bot**, use **Reset Token** and copy the value. It is shown only once.
3. Paste the token into the template wizard. It becomes the encrypted variable `DISCORD_TOKEN`.

## 2. Invite the bot
Under **OAuth2 > URL Generator** tick the scopes `bot` and `applications.commands`, open the generated URL and choose the server.

## 3. Check
After the deploy the app log should show `Logged in as <bot name>`. In Discord, type `/ping`: the bot answers `Pong!` with the latency.

## 4. Make your own bot
The template is a starting point. Open `src/index.js` and add commands; deploy again (or restart, if you edited in the app's editor).
To add libraries, run `npm install <package>` locally and ship the updated `package.json` and `package-lock.json`: the platform installs dependencies on every deploy.
