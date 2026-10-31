# Hermes Agent

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Agente de IA que aprende com o uso, com chat no navegador e canais de mensagem. Hermes Agent v0.22.5 como app de código Python 3.14 (sem imagem Docker): as dependências são o lock oficial do projeto, com hashes, e o código do Hermes é baixado do repositório oficial, por commit e com verificação de SHA-256, no primeiro início. Você traz a chave do modelo.

## O que é

- **Chat no navegador** (Hermes WebUI) em `/`, com sessões, arquivos, configurações e provedores. Ele tem login próprio: pede só a senha gerada.
- **Canais**: Telegram, Discord, Slack, WhatsApp e e-mail, cada um com lista de quem pode falar com o agente.
- **Provedores** como descrito abaixo. Provedor e modelo valem **a cada início** (a variável manda).
- A senha não fica no ambiente dos processos do agente: o app guarda só o hash dela e remove a variável antes de iniciar o agente.
- **Sem moldura**: o chat não abre dentro de outra página (`X-Frame-Options: DENY`), então a prévia do painel da Vertra mostra o cartão "abrir em nova aba" para este app.
- O **painel do Hermes** (`/admin`) fica **desligado**: ele não tem senha própria e o front dele precisa de Node para ser montado. Configuração pelo chat; canais por variáveis do app.

## O que o assistente pergunta

| Pergunta | Para que serve |
|---|---|
| Provedor de modelo | OpenRouter (padrão), Anthropic, OpenAI, Google Gemini ou endpoint compatível com OpenAI. |
| Chave de API do provedor | Só nas variáveis cifradas do app. |
| URL base e modelo | A URL só com endpoint compatível (termina em `/v1`). Modelo em branco = padrão do provedor; obrigatório com endpoint compatível. |
| Chat no navegador (Hermes WebUI) | Ligado por padrão; custa ~150 MB de RAM. Desligado, a página responde só uma nota e o agente atende pelos canais. |
| Telegram, Discord, Slack, WhatsApp, e-mail | Cada um pede credenciais e a **lista de quem pode falar com o agente** (obrigatória). O WhatsApp é pareado por QR no log do app. No e-mail, informe também o identificador do servidor (`authserv-id`; Gmail: `mx.google.com`): o agente só age em remetentes que o seu servidor autenticou. |

## O que você recebe

- O endereço do **chat** e a **senha** do login, mostrada **uma vez** (só senha, sem usuário).
- O próximo passo e a instrução do WhatsApp.

## Primeiros passos

1. Aguarde o primeiro início (instala as dependências, baixa o Hermes e o WebUI e sincroniza as skills).
2. Abra o endereço e entre com a senha das saídas.
3. Fale com o agente no chat ou pelo canal que conectou.
4. **WhatsApp:** veja a seção abaixo.
5. Para trocar de provedor ou modelo, mude `HERMES_MODEL_PROVIDER` / `HERMES_MODEL_CUSTOM` nas variáveis do app e reinicie.

## WhatsApp

Opcional, pela ponte não oficial Baileys (a mesma do Hermes). Ao ligar a opção, o app baixa o Node.js oficial (`v24.22.2`, de nodejs.org, com SHA-256 conferido; ~136 MB em `/app/.local/node`, só na primeira vez) e instala a ponte; o Node fica visível só para o Hermes.

**Parear olhando o log:**
1. Depois do deploy, abra o **log do app** e procure "Scan this QR code with WhatsApp on your phone".
2. O QR sai em blocos de texto: veja o log numa fonte monoespaçada. Se o seu visualizador quebrar as linhas, o QR não escaneia; use a janela larga ou copie o texto para um editor monoespaçado.
3. No celular: WhatsApp > Aparelhos conectados > Conectar um aparelho, e escaneie. O QR expira em ~1 min; se expirar, reinicie o app para um novo.
4. Ao parear, o app reinicia o agente sozinho e a ponte sobe. O padrão é o modo "conversar consigo mesmo" (WhatsApp > conversa com você mesmo); `WHATSAPP_ALLOWED_USERS` limita quem fala com o agente.

A sessão fica em `/app/.hermes/platforms/whatsapp/session`. Para parear de novo, apague essa pasta (gerenciador de arquivos) e reinicie. Uma sessão de WhatsApp por app.

**Alternativa oficial: WhatsApp Cloud API (Meta).** O Hermes também fala com a API oficial da Meta (variáveis `WHATSAPP_CLOUD_PHONE_NUMBER_ID`, `WHATSAPP_CLOUD_ACCESS_TOKEN`, `WHATSAPP_CLOUD_APP_SECRET`, `WHATSAPP_CLOUD_VERIFY_TOKEN`, `WHATSAPP_CLOUD_ALLOWED_USERS`; veja a documentação do Hermes). Ela não usa QR nem a ponte, mas exige que a Meta alcance um webhook HTTPS (`/whatsapp/webhook`, porta `WHATSAPP_CLOUD_WEBHOOK_PORT`, padrão 8090). Este template só expõe a porta pública do chat, então o webhook não fica acessível sem um proxy seu à frente; o assistente não configura essa opção.

## Limites conhecidos

- RAM: mínimo **1,5 GB**, recomendado 2 GB (~0,6 GiB em repouso, medido sem WhatsApp).
- Primeiro início: cerca de 1,5 minuto (instala ~130 pacotes com hash em ~40 s, baixa ~120 MB do GitHub e sincroniza as skills); com WhatsApp, mais o Node.js e a ponte. Reinícios: ~10 s. O app não responde enquanto instala e baixa; o healthcheck é `/health` (só contadores).
- As dependências são o lock oficial do Hermes v0.22.5 para Python 3.14 (extras `all`, `messaging` e `anthropic`), instaladas com `PIP_NO_DEPS=1`: o lock já é o conjunto completo, e o pip recusaria a substituição de Pillow que o próprio projeto faz. Ficam de fora Matrix, Bedrock, Azure, Google Chat, OTLP e voz/TTS.
- O Python da plataforma traz um SQLite com o bug de corrupção do modo WAL; o Hermes detecta e usa `journal_mode=DELETE` (um aviso no log), um pouco mais lento em gravações.
- Token de canal inválido **aparece no log do app** ("token ... was rejected"): não compartilhe o log. O app segue no ar com o canal parado.
- Signal, Matrix, Mattermost e outros não estão no assistente. O Signal exige um daemon `signal-cli` externo.
- O login do chat limita tentativas por endereço, mas a senha gerada é longa. Esqueceu a senha? Troque o segredo `HERMES_ADMIN_PASSWORD` e reinicie.
- O compartilhamento de métricas de uso com o projeto Hermes vem **desligado por padrão**; se você ligar depois, sua escolha é mantida.
- Deploy sem downtime fica desligado (a segunda cópia no mesmo disco sai com erro).
- O canal de e-mail e os modelos padrão de cada provedor não foram exercitados com conta ou chave reais.

## Licença

Hermes Agent é distribuído sob a licença MIT (Nous Research): <https://github.com/NousResearch/hermes-agent/blob/main/LICENSE>. O chat é o Hermes WebUI (MIT): <https://github.com/nesquena/hermes-webui/blob/687d80333870c3797d6858738621fca13d1bf27a/LICENSE>. Com WhatsApp ligado, o Node.js baixado é distribuído sob licença MIT (<https://github.com/nodejs/node/blob/main/LICENSE>) e a ponte usa o Baileys (MIT). O ícone é o logo oficial, sem alterações (`ICONS.md`). Este template é um empacotamento da Vertra Cloud e não é afiliado ao projeto.

Mais detalhes: [docs/first-steps.md](docs/first-steps.md) · [docs/reference.md](docs/reference.md)
