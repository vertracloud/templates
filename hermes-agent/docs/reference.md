# Referência

## Variáveis do app

| Variável | Valor | Para que serve |
|---|---|---|
| `HERMES_HOME` | `/app/.hermes` | Estado do agente, no disco do app. |
| `HERMES_ADMIN_USER` / `HERMES_ADMIN_PASSWORD` | `admin` / segredo gerado | Login do Caddy (a senha vira hash bcrypt a cada início e a variável é removida do ambiente dos processos). |
| `HERMES_WEBUI` | `true` / `false` | Liga o chat no navegador. |
| `PIP_NO_DEPS` | `1` | A instalação usa só `requirements.txt` (lock completo, com hashes). |
| `HERMES_MODEL_PROVIDER`, `HERMES_MODEL`, `HERMES_MODEL_CUSTOM`, `HERMES_BASE_URL` | do assistente | Provedor, modelo padrão da opção, modelo digitado (vence) e URL base do endpoint compatível; aplicados a cada início. |
| `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENAI_COMPAT_API_KEY` | do assistente | A chave do provedor escolhido. |
| `TELEGRAM_*`, `DISCORD_*`, `SLACK_*`, `WHATSAPP_*`, `EMAIL_*` | do assistente | Credenciais e listas de permitidos de cada canal. `GATEWAY_ALLOW_ALL_USERS` fica `false`. No e-mail, `EMAIL_AUTHSERV_ID` é obrigatório e `EMAIL_TRUST_FROM_HEADER` fica `false`: não ligue, ou qualquer pessoa poderia se passar por alguém da lista. |
| `PUBLIC_ORIGIN` | endereço do app | Origem pública (origens permitidas do chat; cookie `Secure` em https). |

## Recursos

- RAM: 2048 MB (mínimo) / 3072 MB (recomendado); ~1,1 GiB em repouso com painel, chat e uma sessão de terminal abertos; a primeira montagem chega a ~1,4 GiB.
- Porta pública 80, do Caddy. O painel (`127.0.0.1:9119`), o chat (`127.0.0.1:8787`) e o agente só escutam dentro do container.
- Disco: ~770 MB (dependências Python ~380 MB, Node.js ~136 MB, Caddy ~45 MB, código do Hermes ~90 MB, painel e chat de terminal ~8 MB); com WhatsApp, mais ~50 MB da ponte; o estado fica em `/app/.hermes`.
- Rede no runtime: GitHub (primeiro início), PyPI (instalação), nodejs.org e o registro npm (montagem do painel e ponte do WhatsApp), APIs dos provedores e dos canais.
- Versões fixas: Hermes `bf0203a794a0` (tag v0.22.5), WebUI `687d80333870`, Node.js `v24.22.2` e Caddy `v2.11.7`, cada um com SHA-256 em `src/start.py`; dependências com hashes em `src/requirements.txt` (lock oficial do Hermes para Python 3.14). Para atualizar, troque-os juntos.

## Problemas comuns

- **401 em tudo.** É o login do Caddy: use `admin` e a senha das saídas.
- **403 em um pedido seu.** É a proteção de origem cruzada: o `Origin` do pedido não é o endereço do app (um script ou proxy seu mandando `Origin` de outro site) ou o navegador marcou o pedido como de outro site. Abra o app direto pelo endereço dele; chamadas de script sem `Origin` (curl) não são afetadas.
- **502 ou sem resposta em `/admin` logo depois do deploy.** O primeiro início ainda monta o painel (`/healthz` já responde). Acompanhe no log: "dashboard build: ... done".
- **A montagem do painel falhou.** O log mostra "building the dashboard failed at: ..."; o agente e os canais seguem no ar sem painel e a montagem é tentada de novo no próximo início. Confira a rede (nodejs.org, registro npm) e a RAM.
- **O app cai logo ao subir.** Confira a RAM (mínimo 2 GB) e o log: `HERMES_ADMIN_PASSWORD is required` indica o segredo ausente; `could not get a verified copy` indica falha ao baixar do GitHub ou do nodejs.org (ou SHA-256 diferente do fixado; o app sai com código 70).
- **O QR do WhatsApp não aparece, ou não escaneia.** Em `/admin/channels` ou no log ("Scan this QR code", só enquanto não há sessão). Se as linhas do log aparecem quebradas, use uma fonte monoespaçada. Se expirou, reinicie. Para parear de novo, apague `/app/.hermes/platforms/whatsapp/session` e reinicie.
- **Canal não responde.** Veja o log do app (token rejeitado) e se o seu id está na lista de permitidos. No e-mail, "authserv-id" no log significa que `EMAIL_AUTHSERV_ID` não bate com o cabeçalho `Authentication-Results` mais ao topo das suas mensagens.
- **Mudei o `config.yaml` e voltou.** Provedor e modelo são reaplicados a cada início a partir das variáveis; mude as variáveis.
