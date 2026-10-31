# First steps

1. **Get the code.** Open the app log and copy the code on the `pairing code` line (single use, valid for 5 minutes). The `open or scan` line has the full link.
2. **Pair the browser.** Open `<app address>/pair`, type the code and confirm. A wrong or expired code is refused; a code works only once.
3. **Sign in to Claude and Codex.** *Settings > AI > Engines*:
   - *Claude*: the sign-in button opens Anthropic's page; copy the code it shows and paste it back into the app.
   - *Codex*: the app shows a single-use code to type on OpenAI's page (device-code login must be enabled in the ChatGPT account security settings).
   - With an API key instead of a personal account: *Settings > Connections > Model providers*.
4. **Create bots and chat.** Each bot uses Claude or Codex with your login. Scheduled routines keep running with the browser closed.

## Another device
Restart the app (every start prints a new code) or use *Phone apps* in the settings. Only a browser paired with full access sees the settings.

## Update and roll back
The packages are pinned in the template; a new template version changes them. The platform takes a snapshot before updating, and rolling back takes the data with it.
