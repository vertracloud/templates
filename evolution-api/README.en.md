# Evolution API

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

A WhatsApp API with instances, webhooks and integrations. Evolution API v2.3.7 (the stable release; the project's `latest` tag is a pre-release) in a Vertra image, with managed Postgres included.

## What it is

- Several WhatsApp instances (QR code pairing) with sending and receiving of messages through a REST API.
- Webhooks and integrations (Typebot, Chatwoot, Dify, n8n and others) configurable per instance.
- Admin manager at `/manager`.
- Managed Postgres for the data (messages, contacts, instances) and, if you want, managed Redis for the cache. Session files live in `/app` and are part of backups.

## What the wizard asks

| Question | Options | What changes |
|---|---|---|
| Evolution API cache | Local cache (default) or managed Redis | Local runs without Redis. Redis keeps the cache outside the process and uses 512 MB more of the plan. |

## What you get

- The **manager** (`<address>/manager`).
- The **global API key**, shown **once**: keep it. It gives access to every instance.
- The next step: open the manager, sign in with the API key, create an instance and scan the QR code in WhatsApp.

## First steps

1. Open `<address>/manager` and sign in with the **global API key** (the outputs show the key only once).
2. Create an instance (a name, `WHATSAPP-BAILEYS`) and scan the **QR code** in *WhatsApp > Linked devices > Link a device*.
3. Send a test message through the API: `POST <address>/message/sendText/<instance>` with the `apikey` header (the instance key or the global one).
4. Point the instance webhook to your service (for example an n8n flow).

## Known limits

- The healthcheck is the `/` route (Evolution has no `/healthz`).
- Zero-downtime deploy is off: two copies could open two sessions of the same WhatsApp and the server would drop the connection.
- A rollback has to go back **with the data**: Evolution applies database migrations on every start.
- RAM: 512 MB is the minimum (Evolution uses ~150-300 MiB); it grows with the number of connected instances and message volume (recommended 1024 MB).
- The Baileys connection (unofficial WhatsApp Web) can be blocked by WhatsApp if used for spam: use it with contacts who consented.
- With managed Redis the connection uses a client certificate; the image carries a small preload (`vertra-tls-client-cert.cjs`) limited to the Redis host.

## License

Evolution API is distributed under Apache 2.0 **with additional conditions** (<https://github.com/evolution-foundation/evolution-api/blob/main/LICENSE>): do not remove the logo and copyright of the manager (`/manager`) and, if Evolution is part of a project of yours, show a clear notice that it is used (for example in the documentation or in settings). Read the license before offering it to third parties. This template is a Vertra Cloud packaging and is not affiliated with the project.

More details: [docs/first-steps.en.md](docs/first-steps.en.md) · [docs/reference.en.md](docs/reference.en.md)
