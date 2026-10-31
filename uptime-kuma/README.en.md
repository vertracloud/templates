# Uptime Kuma

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Monitor sites and services with alerts and a public status page. Uptime Kuma 2.5.8 (`slim` variant, SQLite), in a Vertra image that keeps the program outside `/app` and the data on the app's disk.

## What it is

- HTTP(S), TCP, ping, DNS, keyword, JSON, push (heartbeat) and other monitors, with intervals from 20 s.
- Alerts through Telegram, Discord, Slack, email (SMTP), webhook and dozens of other channels.
- Public status pages (`/status/<name>`), which you can also publish on your own domain.
- SQLite database in `/app/data`, on the app's disk: it is part of backups and snapshots.

## What the wizard asks

No questions: the app comes up ready.

## What you get

- The app **address**.
- **Administrator user and password** (`admin` and a generated password, shown **once**): the account already exists when the deploy ends, so nobody can create it before you.

## First steps

1. Open the address and sign in with `admin` and the password from the outputs (you can change it in Settings > Profile).
2. In **Add New Monitor**, pick the type, enter the target and the interval.
3. In **Settings > Notifications**, connect Telegram, Discord, email or another channel and tick "Default enabled" for new monitors.
4. In **Status Pages**, create a public page and choose which monitors it shows.

## Known limits

- The **Real Browser** monitor (Chromium) is not available: the `slim` image has no browser.
- No embedded MariaDB: SQLite only. For thousands of monitors, prefer another setup.
- No Docker container monitor (there is no access to the server's Docker).
- Checks come from one place (your app's server). A down alert reflects that server's route to the target.
- Zero-downtime deploy is off: two copies on the same database would run every monitor twice (duplicate alerts).
- The app uses little RAM (about 120 MiB idle); 512 MB is the floor of a web app.

## License

Uptime Kuma is distributed under the MIT license (Louis Lam and contributors): <https://github.com/louislam/uptime-kuma/blob/master/LICENSE>. The icon is the project's official logo, unmodified (see `ICONS.md` at the repository root); the listing does not imply endorsement by the project.

More details: [docs/first-steps.en.md](docs/first-steps.en.md) · [docs/reference.en.md](docs/reference.en.md)
