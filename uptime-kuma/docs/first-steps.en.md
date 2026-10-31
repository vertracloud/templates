# First steps

1. **Sign in as the administrator.** The account already exists when the deploy ends (the address only opens after it is created): sign in with `admin` and the password from the outputs, shown once. Change the password in *Settings > Profile* if you like; the password from the outputs only applies on the first start.
2. **Create the first monitor.** *Add New Monitor*: type (HTTP(S), TCP, Ping, DNS...), name, target and interval. The minimum is 20 s; 60 s is enough for most sites.
3. **Connect an alert.** *Settings > Notifications > Setup Notification*. For Telegram, create a bot with @BotFather and enter the token and the chat id. Tick *Default enabled* so every new monitor uses that channel.
4. **Publish a status page.** *Status Pages > New Status Page*, choose the short address (`/status/<name>`), add the monitors and save. The page is public and asks for no login.
5. **Use your own domain (optional).** Add the domain in the app's *Domains* and, in the Kuma status page, enter it under *Domain Names*.

## "Push" monitor (heartbeat)
For scheduled jobs (cron, backups), create a *Push* monitor: Kuma generates a URL. Make the job call that URL on every run; if it stops calling within the interval, the monitor goes down and the alert fires.

## Updates and backup
Uptime Kuma migrates its database on update, so the platform's rollback goes back **with the data**. The data (`/app/data/kuma.db`) is part of the app's snapshots.
