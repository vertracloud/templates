# n8n

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Workflow automation with a visual editor. n8n 2.44.7 as a **code project** on the Vertra Cloud Node.js 24 runtime: the deploy installs the `n8n` npm package (version pinned in `package-lock.json`) and `start.sh` starts the editor or the worker. The code is open to read in `src/`.

## What it is

- **Editor and webhooks** at the app address; the database is chosen in the wizard.
- **Code node in JavaScript**, run by n8n's internal task runner (a process next to the editor, no extra container).
- **Community nodes** (*Settings > Community nodes*): they live in `/app/.n8n/nodes` and survive restart and update; in queue mode the worker reinstalls the packages on boot.
- Optional **email (SMTP)** for invitations and password reset.
- **Retention**: execution history is deleted after 7 days or 5000 executions.
- Telemetry, version notice and personalization are off; the "Execute Command" and "Local File Trigger" nodes ship disabled by n8n.

## What changed from the image version

- **The Python Code node is gone.** The Node runtime does not ship n8n's Python runner; use JavaScript in the Code node. A Python Code node reports that the runner is not available.
- The deploy **installs the dependencies** (`npm ci`, about 2.5 minutes) and uses about 2.7 GB of disk per app (the worker has its own copy).
- The modules allowed in the Code node (*Safe* or *All*) apply to JavaScript only.

## What the wizard asks

| Question | What it does |
|---|---|
| Administrator (owner) email | The email of the owner account, created at deploy time with a generated password (shown once in the outputs). |
| How will n8n run? | **Managed Postgres** (default: n8n + Postgres, 2 GB total), **built-in SQLite** (n8n only, 1 GB) or **Scale with workers** (n8n + 1 worker + Postgres + Redis, 3.5 GB). |
| Parallel executions on the worker | Only in the workers mode. Default 5; more parallelism needs more worker RAM. |
| Schedule time zone | America/Sao_Paulo, UTC, America/New_York or Europe/Lisbon. |
| Modules allowed in the Code node | **Safe** (default): data and text modules only. **All**: also files, processes and network inside your own container. |
| Send n8n emails? | Optional (invitations and password reset): SMTP server, security, port, user, password and sender. |

## What you get

- The app **address** (editor and webhooks).
- **Owner email and password**: the administrator account already exists at the end of the deploy; the password is generated and shown **once**. Nobody can create it before you.

## First steps

1. Choose how n8n will run, the time zone and, optionally, SMTP.
2. After the deploy open the address and sign in with the **owner** email and password from the outputs.
3. In a **Code** node use the **JavaScript** language.
4. Keep a copy of `N8N_ENCRYPTION_KEY` (an app variable): without it a backup's credentials cannot be read.

## Known limits

- **Encryption key:** the flows' credentials are encrypted with `N8N_ENCRYPTION_KEY` (a secret generated once, the same on the editor and the worker).
- First boot 10-60 s (migrates the database). Editor RAM 500-900 MiB; worker 440-500 MiB. The Code node's task runner starts together with n8n.
- The workers mode creates **1 worker** (more workers depend on the platform's replicas); the worker has no public address and only talks to Postgres and Redis. There are no dedicated webhook processors: webhooks are served by the editor.
- Zero-downtime deploy is off: in queue mode two copies both claim to be leader and polling triggers would run twice. A rollback goes back **with the data** (n8n migrates the database).
- A community node runs **inside** the n8n process, with access to whatever n8n can reach: install only packages you trust.
- Maximum request body 16 MiB (n8n default).
- n8n flags the internal task runner mode as deprecated and may require the external mode in future versions; updating n8n takes a new, tested template.
- Email with real STARTTLS/SSL still needs confirmation in production.

## License

n8n is distributed under the **Sustainable Use License** (internal business or personal/non-commercial use; n8n GmbH): <https://github.com/n8n-io/n8n/blob/master/LICENSE.md>. Read the license before offering n8n to third parties. The icon is n8n's official symbol, unmodified (`ICONS.md`). This template is a Vertra Cloud packaging and is not affiliated with n8n.

More details: [docs/first-steps.en.md](docs/first-steps.en.md) · [docs/reference.en.md](docs/reference.en.md)
