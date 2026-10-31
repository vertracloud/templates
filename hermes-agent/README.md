# Hermes Agent

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Agente de IA que aprende com o uso, com painel web, chat opcional no navegador e canais de mensagem. Hermes Agent v0.22.5 como app de código Python 3.14 (sem imagem Docker): as dependências são o lock oficial do projeto, com hashes; o código do Hermes, o Node.js e o Caddy são baixados na primeira subida, por versão e com SHA-256 conferido, e o painel é montado a partir do código-fonte. Você traz a chave do modelo.

## O que é

- **Painel** em `/admin/`: configuração, chaves, sessões, arquivos, logs, agendamentos (cron), skills, plugins, MCP, canais (inclui o pareamento do WhatsApp), webhooks e um chat de terminal em `/admin/chat`.
- **Chat no navegador** opcional (Hermes WebUI) em `/`, com sessões, arquivos e configurações. Sem ele, `/` leva ao painel.
- **Login único**: o Caddy escuta a porta pública e pede usuário (`admin`) e senha (gerada) uma vez e guarda uma sessão em cookie, para o chat do painel e o chat do navegador não pedirem a senha de novo. O painel, o chat e o agente escutam só em `127.0.0.1`, dentro do container.
- **Protegido contra origem cruzada**: o Caddy recusa (403), antes do login, pedido cujo `Origin` não seja o próprio endereço do app e pedido de outro site que não seja uma navegação (um link seu continua abrindo). Isso impede que a página de outro app em `*.vertraweb.app` use o seu login aberto no navegador para abrir o terminal do painel ou mudar dados.
- **Sem moldura**: o painel e o chat não abrem dentro de outra página (`X-Frame-Options: DENY` e `frame-ancestors 'none'`), então a prévia do painel da Vertra mostra o cartão "abrir em nova aba" para este app.
- **Provedores** e **canais** como descrito abaixo. Provedor e modelo valem **a cada início** (a variável manda).

## O que o assistente pergunta

| Pergunta | Para que serve |
|---|---|
| Provedor de modelo | OpenRouter (padrão), Anthropic, OpenAI, Google Gemini ou endpoint compatível com OpenAI. |
| Chave de API do provedor | Só nas variáveis cifradas do app. |
| URL base e modelo | A URL só com endpoint compatível (termina em `/v1`). Modelo em branco = padrão do provedor; obrigatório com endpoint compatível. |
| Chat no navegador (Hermes WebUI) | Opcional; custa ~150 MB de RAM. Fica em `/`, e o painel em `/admin/`. |
| Telegram, Discord, Slack, WhatsApp, e-mail | Cada um pede credenciais e a **lista de quem pode falar com o agente** (obrigatória). O WhatsApp é pareado por QR no painel (ou no log do app). No e-mail, informe também o identificador do servidor (`authserv-id`; Gmail: `mx.google.com`): o agente só age em remetentes que o seu servidor autenticou. |

## O que você recebe

- O **painel** (`<endereço>/admin/`) e o usuário `admin`.
- A **senha** do login, mostrada **uma vez**.
- O próximo passo e a instrução do WhatsApp.

## Primeiros passos

1. Aguarde o primeiro início: instala as dependências, baixa o Hermes, o Node.js e o Caddy e monta o painel (cerca de 2 minutos com boa rede, até ~10 com o GitHub lento: instala ~130 pacotes em ~30-50 s, baixa ~150 MB e monta o painel em ~1 min). Acompanhe no log do app; o painel abre quando a montagem termina.
2. Abra `<endereço>/admin/` com `admin` e a senha das saídas.
3. Fale com o agente pelo chat de terminal do painel (`/admin/chat`), pelo chat no navegador (`/`, se ligou) ou pelo canal que conectou.
4. **WhatsApp:** veja a seção abaixo.
5. Para trocar de provedor ou modelo, mude `HERMES_MODEL_PROVIDER` / `HERMES_MODEL_CUSTOM` nas variáveis do app e reinicie.

## WhatsApp

Opcional, pela ponte não oficial Baileys (a do Hermes). O Node.js que ela precisa já vem com o app; na primeira vez o app instala as dependências da ponte (npm).

**Parear:**
- **Pelo painel:** em `/admin/channels` > WhatsApp, escaneie o QR (ele expira) em WhatsApp > Aparelhos conectados > Conectar um aparelho.
- **Pelo log:** abra o **log do app**, procure "Scan this QR code with WhatsApp on your phone" e escaneie o QR, que sai em blocos de texto: veja numa fonte monoespaçada (linhas quebradas não escaneiam). Ele expira em ~1 min; reinicie o app para um novo. Use um dos dois de cada vez.
- Ao parear pelo log, o app reinicia o agente sozinho e a ponte sobe. O padrão é o modo "conversar consigo mesmo" (WhatsApp > conversa com você mesmo); `WHATSAPP_ALLOWED_USERS` limita quem fala com o agente.

A sessão fica em `/app/.hermes/platforms/whatsapp/session`. Para parear de novo, apague essa pasta (gerenciador de arquivos) e reinicie. Uma sessão de WhatsApp por app.

**Alternativa oficial: WhatsApp Cloud API (Meta).** O Hermes também fala com a API oficial da Meta (variáveis `WHATSAPP_CLOUD_PHONE_NUMBER_ID`, `WHATSAPP_CLOUD_ACCESS_TOKEN`, `WHATSAPP_CLOUD_APP_SECRET`, `WHATSAPP_CLOUD_VERIFY_TOKEN`, `WHATSAPP_CLOUD_ALLOWED_USERS`; veja a documentação do Hermes). Ela não usa QR nem a ponte, mas exige que a Meta alcance um webhook HTTPS (`/whatsapp/webhook`, porta `WHATSAPP_CLOUD_WEBHOOK_PORT`, padrão 8090). Este template só expõe a porta pública do Caddy, então o webhook não fica acessível sem um proxy seu à frente; o assistente não configura essa opção.

## Limites conhecidos

- RAM: mínimo **2 GB**, recomendado 3 GB (~1,1 GiB em repouso com painel, chat e uma sessão de terminal abertos; a primeira montagem chega a ~1,4 GiB).
- Primeiro início: cerca de 2 minutos com boa rede, até ~10 com o GitHub lento: instala ~130 pacotes em ~30-50 s, baixa ~150 MB e monta o painel em ~1 min. Reinícios: cerca de 20 s, sem baixar nem montar nada. O `/healthz` (do próprio Caddy, sem senha e sem dados) responde antes de a montagem terminar; até lá `/admin` fica sem resposta.
- Disco: ~770 MB (dependências Python ~380 MB, Node.js ~136 MB, Caddy ~45 MB, código do Hermes ~90 MB, painel e chat de terminal ~8 MB); com WhatsApp, mais ~50 MB da ponte; o estado fica em `/app/.hermes`.
- As dependências são o lock oficial do Hermes v0.22.5 para Python 3.14 (extras `all`, `messaging` e `anthropic`), instaladas com `PIP_NO_DEPS=1`: o lock já é o conjunto completo, e o pip recusaria a substituição de Pillow que o próprio projeto faz. Ficam de fora Matrix, Bedrock, Azure, Google Chat, OTLP e voz/TTS.
- O Python da plataforma traz um SQLite com o bug de corrupção do modo WAL; o Hermes detecta e usa `journal_mode=DELETE` (um aviso no log), um pouco mais lento em gravações.
- Token de canal inválido **aparece no log do app** ("token ... was rejected"): não compartilhe o log. O app segue no ar com o canal parado.
- Signal, Matrix, Mattermost e outros não estão no assistente: use `/admin/channels` ou variáveis do app. O Signal exige um daemon `signal-cli` externo e não roda neste container.
- O Caddy é o único portão (sem limite de tentativas): a senha gerada é longa. Se quiser mais proteção, ponha uma regra de limite de taxa no seu domínio.
- O compartilhamento de métricas de uso com o projeto Hermes vem **desligado por padrão**: no primeiro start o template responde "No thanks" à pergunta "Help improve Hermes?" do painel; se você ligar depois, sua escolha é mantida.
- Deploy sem downtime fica desligado (a segunda cópia no mesmo disco sai com erro). Esqueceu a senha? Troque o segredo `HERMES_ADMIN_PASSWORD` e reinicie.
- O canal de e-mail e os modelos padrão de cada provedor não foram exercitados com conta ou chave reais.

## Licença

Hermes Agent é distribuído sob a licença MIT (Nous Research): <https://github.com/NousResearch/hermes-agent/blob/main/LICENSE>. O chat opcional é o Hermes WebUI (MIT): <https://github.com/nesquena/hermes-webui/blob/687d80333870c3797d6858738621fca13d1bf27a/LICENSE>. O Caddy que protege o acesso é Apache-2.0 e o Node.js é MIT; a ponte do WhatsApp usa o Baileys (MIT). O ícone é o logo oficial, sem alterações (`ICONS.md`). Este template é um empacotamento da Vertra Cloud e não é afiliado ao projeto.

Mais detalhes: [docs/first-steps.md](docs/first-steps.md) · [docs/reference.md](docs/reference.md)
