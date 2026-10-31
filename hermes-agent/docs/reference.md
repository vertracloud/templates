# Referência

## Variáveis do app

| Variável | Valor | Para que serve |
|---|---|---|
| `HERMES_HOME` | `/app/.hermes` | Estado do agente, no disco do app. |
| `HERMES_ADMIN_PASSWORD` | segredo gerado | Senha do chat. Vira um hash a cada início e a variável é removida do ambiente dos processos. |
| `HERMES_WEBUI` | `true` / `false` | Liga o chat no navegador. |
| `PIP_NO_DEPS` | `1` | A instalação usa só `requirements.txt` (lock completo, com hashes). |
| `HERMES_MODEL_PROVIDER`, `HERMES_MODEL`, `HERMES_MODEL_CUSTOM`, `HERMES_BASE_URL` | do assistente | Provedor, modelo padrão da opção, modelo digitado (vence) e URL base do endpoint compatível; aplicados a cada início. |
| `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENAI_COMPAT_API_KEY` | do assistente | A chave do provedor escolhido. |
| `TELEGRAM_*`, `DISCORD_*`, `SLACK_*`, `WHATSAPP_*`, `EMAIL_*` | do assistente | Credenciais e listas de permitidos de cada canal. `GATEWAY_ALLOW_ALL_USERS` fica `false`. No e-mail, `EMAIL_AUTHSERV_ID` é obrigatório e `EMAIL_TRUST_FROM_HEADER` fica `false`: não ligue, ou qualquer pessoa poderia se passar por alguém da lista. |
| `PUBLIC_ORIGIN` | endereço do app | Origem pública (origens permitidas do chat; cookie `Secure` em https). |

## Recursos

- RAM: 1536 MB (mínimo) / 2048 MB (recomendado); ~0,6 GiB em repouso, medido sem WhatsApp.
- Uma porta pública (80) para o chat. Nenhuma outra porta fica aberta fora do container; o painel `/admin` do Hermes não é iniciado.
- Disco: dependências Python em `/app/.local` (~380 MB), código do Hermes em `/app/hermes-agent` (~90 MB) e do WebUI em `/app/hermes-webui` (~18 MB); com WhatsApp, Node.js em `/app/.local/node` (~136 MB) e a ponte (npm) em `/app/hermes-agent/scripts/whatsapp-bridge`; estado em `/app/.hermes`.
- Rede no runtime: GitHub (primeiro início), PyPI (instalação), nodejs.org e o registro npm (só com WhatsApp), APIs dos provedores e dos canais.
- Versões fixas: Hermes `bf0203a794a0` (tag v0.22.5), WebUI `687d80333870` e Node.js `v24.22.2`, cada um com SHA-256 em `src/start.py`; dependências com hashes em `src/requirements.txt` (lock oficial do Hermes para Python 3.14). Para atualizar, troque-os juntos.

## Problemas comuns

- **O chat pede senha e não aceita.** Use a senha das saídas. Perdeu? Troque o segredo `HERMES_ADMIN_PASSWORD` e reinicie: a senha é regravada a cada início. Depois de várias tentativas erradas o login espera um minuto.
- **403 em um pedido seu.** É a proteção de origem cruzada do chat: o `Origin` do pedido não é o endereço do app. Abra o app direto pelo endereço dele; chamadas de script sem `Origin` (curl) não são afetadas.
- **O app cai logo ao subir.** Confira a RAM (mínimo 1,5 GB) e o log: `HERMES_ADMIN_PASSWORD is required` indica o segredo ausente; `could not get a verified copy` indica falha ao baixar o código do GitHub ou o Node.js (ou SHA-256 diferente do fixado; o app sai com código 70).
- **Canal não responde.** Veja o log do app (token rejeitado) e se o seu id está na lista de permitidos. No e-mail, "authserv-id" no log significa que `EMAIL_AUTHSERV_ID` não bate com o cabeçalho `Authentication-Results` mais ao topo das suas mensagens.
- **Mudei o `config.yaml` e voltou.** Provedor e modelo são reaplicados a cada início a partir das variáveis; mude as variáveis.
- **O QR do WhatsApp não aparece, ou não escaneia.** Procure "Scan this QR code" no log (ele só sai enquanto não há sessão). Se as linhas aparecem quebradas, use uma fonte monoespaçada. Se expirou, reinicie. Para parear de novo, apague `/app/.hermes/platforms/whatsapp/session` e reinicie.
- **Preciso do painel `/admin`.** Fica desligado neste template (sem senha própria; o front precisa de Node para ser montado).
