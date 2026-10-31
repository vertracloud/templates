# Referência

## Variáveis do app

| Variável | Valor | Para que serve |
|---|---|---|
| `OPENCLAW_HOME` | `/app` | O estado vai para `/app/.openclaw` (disco do app). |
| `OPENCLAW_GATEWAY_TOKEN` | segredo gerado | Token do gateway (SecretRef de ambiente: nunca em texto no `openclaw.json`). |
| `PUBLIC_ORIGIN` | `{{app.url}}` | Origem pública (vira `gateway.publicOrigin` e a origem permitida do painel). |
| `OPENCLAW_PROVIDER`, `OPENCLAW_MODEL`, `OPENCLAW_MODEL_ID` | do assistente | Provedor e modelo, recalculados **a cada início** (`OPENCLAW_MODEL_ID` digitado vence o padrão da opção). |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_COMPAT_API_KEY` | do assistente | A chave do provedor escolhido; `OPENAI_COMPAT_BASE_URL` leva a URL do endpoint compatível. |
| `OPENCLAW_BROWSER` | `on` / `off` | Navegador do agente na primeira subida. |
| `TELEGRAM_*`, `DISCORD_*`, `SLACK_*` | do assistente | Token e lista de permitidos de cada canal (SecretRef de ambiente). |
| `OPENCLAW_BOOTSTRAP_PAIRING` | `off` | Opcional: desliga o pareamento automático do primeiro navegador. |

## Recursos

- RAM: 2048 MB (mínimo) / 3072 MB (recomendado) **mais 1024 MB** com o navegador (padrão): 3072 / 4096.
- Runtime Node 24.22.1 (o OpenClaw exige Node 24.22.1 ou mais novo na linha 24); o Chromium do navegador vem do runtime. Porta 80; healthcheck em `/healthz` até 420 s.
- Disco: o programa (pacote `openclaw` do npm, fixado no `package-lock.json`) fica em `/app/node_modules`; o estado em `/app/.openclaw`. Os plugins de canal do npm somam ~240 MB.
- A primeira instalação das dependências leva alguns minutos; depois ela só se repete se o `package.json` ou o lockfile mudarem.

## Problemas comuns

- **O painel não conecta.** Confira o token em *Configurações > Gateway* e que o endereço aberto é o do app (`PUBLIC_ORIGIN`).
- **Timeout nas ferramentas de navegador.** Falta RAM: com várias abas o Chromium passa de 2 GB. Suba a RAM ou use menos abas.
- **Discord/Slack demoram a subir.** Normal no primeiro boot (plugins do npm). Se falhar, confira o token e a saída para o npm no log.
- **`OPENCLAW_MODEL_ID is required`.** Com endpoint compatível o modelo é obrigatório.
