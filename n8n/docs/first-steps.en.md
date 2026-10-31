# First steps

1. **Sign in as the owner.** The owner account already exists when the deploy ends: open the address and sign in with the email you provided and the password from the outputs (shown once). n8n reapplies these details at every start and locks email and password changes in the interface; to change them, edit `N8N_INSTANCE_OWNER_EMAIL` or the password `VERTRA_OWNER_PASSWORD` in the app variables and restart.
2. **Your first flow.** *Create workflow*, add a **Webhook** and a **Code** node in JavaScript:
   ```javascript
   return [{ json: { ok: true, n: $input.all().length } }];
   ```
   The Python Code node is not available in this template.
3. **Code modules.** In **Safe** mode only data and text modules are allowed: crypto, url, path, util, zlib, buffer, querystring, string_decoder, events, stream, assert (+ moment). To allow everything (fs, child_process, http...), choose **All** or change `VERTRA_CODE_MODULES` (`safe` / `all`) in the app variables.
4. **Community nodes.** *Settings > Community nodes > Install*, enter the npm package. It needs outbound access to the npm registry.
5. **Workers.** In the workers mode the editor hands each execution to the worker through Redis. Tune the parallelism in `N8N_WORKER_CONCURRENCY` (the wizard asks).
6. **Email.** With SMTP set up, *Settings > Users > Invite* sends the invitation by email. The *Send Email* node uses the flow's own credential.

## Update and roll back
The platform takes a snapshot before updating and a rollback goes back **with the data**. n8n version updates arrive as new versions of the template and reinstall the dependencies.
