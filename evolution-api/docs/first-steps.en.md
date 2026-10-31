# First steps

1. **Keep the global API key.** It shows up **only once** in the wizard outputs. If you lose it, change the `AUTHENTICATION_API_KEY` secret in the app variables and restart.
2. **Open the manager** at `<address>/manager` and sign in with the API key.
3. **Create an instance.** Any name, integration `WHATSAPP-BAILEYS`. The manager shows the QR code; on the phone, *WhatsApp > Linked devices > Link a device*.
4. **Send a test message:**
   ```bash
   curl -X POST "<address>/message/sendText/<instance>" \
     -H "apikey: <key>" -H "Content-Type: application/json" \
     -d '{"number":"5511999999999","text":"Hello from Evolution API"}'
   ```
5. **Receive events.** In the instance's *Webhook* enter your service URL and tick the events (`MESSAGES_UPSERT`, `CONNECTION_UPDATE`...).

## Local cache or Redis
The default is the local cache (no Redis). Choose managed Redis in the wizard if you want the cache to survive process restarts; it uses 512 MB more of the plan and connects with a client certificate.

## Backup and updates
Data lives in the stack's Postgres and in the files under `/app` (`instances`, `store`). The platform takes a snapshot before updating and a rollback goes back with the data.
