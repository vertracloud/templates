# Reference

## Where things are (`/app`, the persistent disk)
| Path | What it is |
|---|---|
| `.openmausbot/` | Conversations, bots, routines, settings and paired sessions. |
| `.claude/`, `.claude.json` | The Claude login. |
| `.codex/` | The Codex login. |
| `node_modules/` | The packages (about 1.2 GB), reinstalled if `package.json` or the lockfile change. |

## App variable
| Variable | What it is for |
|---|---|
| `PUBLIC_ORIGIN` | The app's public address (from `{{app.url}}`): pairing links and the origin check. |

`start.sh` sets the rest: data in `.openmausbot`, `claude` and `codex` on the `PATH`, Claude Code auto-update off, the open-source edition and port 80.

## Common problems
- **I cannot find the code.** Every start prints a new one; scroll the log to the last `pairing code`, or restart the app. It expires in 5 minutes.
- **"Wrong or expired code".** Use the code of the latest start, once.
- **The app shows the engine setup instead of the login.** In *Engines*, open the advanced options, choose *Set CLI* and enter `/app/node_modules/.bin/claude` (or `/app/node_modules/.bin/codex`).
- **The app does not start after a restart.** `start.sh` already removes the server's lock (`openmausbot-server.lease`) on every start; if it persists, check the log.
- **Slow with many bots.** Every active bot runs its own process; raise the RAM (3 GB recommended).
