# Reference

## App variables

| Variable | Value | What it does |
|---|---|---|
| `UPTIME_KUMA_DB_TYPE` | `sqlite` | Without it Kuma 2.x opens the "Setup Database" wizard and does not start by itself. |
| `DATA_DIR` | `/app/data/` | Data folder, on the app's persistent disk. |
| `PORT` | `3001` | Set by the platform (the app port). |

## Resources

- RAM: 512 MB minimum (a web app's floor); in use, about 110-120 MiB.
- Port 3001; healthcheck at `/api/entry-page` (up in seconds).
- Disk: the database grows with the heartbeat history; Kuma deletes old history (default: 180 days, in *Settings > Monitor History*).

## Common problems

- **I forgot the administrator password.** The password from the outputs only applies on the first start. To start over, delete the data (`/app/data`) in the file manager and restart (the `admin` administrator is recreated with the password of the `KUMA_ADMIN_PASSWORD` variable), or roll back to an earlier snapshot.
- **The Ping monitor does not answer.** `ping` runs unprivileged (datagram ICMP sockets). Some targets filter ICMP; use a TCP or HTTP monitor.
- **Duplicate alerts.** Keep a single copy of the app (zero-downtime deploy is off for this reason).
