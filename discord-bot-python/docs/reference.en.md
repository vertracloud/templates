# Reference

| Item | Value |
|---|---|
| Variable | `DISCORD_TOKEN` (encrypted; comes from the wizard question) |
| Language | Python (Python, the platform's recommended version) |
| Start command | `python3 -u main.py` |
| Main file | `main.py` |
| RAM | 100 MB (minimum), 256 MB (recommended) |
| Web | no (outgoing connections only) |
| Zero-downtime deploy | off (one token = one copy) |

## Common problems

- **`Login failed` in the log.** The value of `DISCORD_TOKEN` is not the bot token (Portal > Bot > Reset Token). Update the variable and restart.
- **`/ping` does not show up.** Global commands take a few minutes; check that the invite had the `applications.commands` scope.
- **The app does not stay up.** Without a valid token the process exits with code 1; fix the token and restart.
