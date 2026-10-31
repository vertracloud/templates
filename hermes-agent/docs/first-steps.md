# Primeiros passos

1. **Aguarde o primeiro início.** Ele instala as dependências, baixa o Hermes, o Node.js e o Caddy (por versão, com SHA-256 conferido) e monta o painel (cerca de 2 minutos com boa rede, até ~10 com o GitHub lento: instala ~130 pacotes em ~30-50 s, baixa ~150 MB e monta o painel em ~1 min). Acompanhe no log do app; o painel abre quando a montagem termina.
2. **Entre.** Abra `<endereço>/admin/`; o navegador pede usuário e senha. Use `admin` e a senha mostrada **uma vez** nas saídas. Perdeu? Troque `HERMES_ADMIN_PASSWORD` nas variáveis do app e reinicie.
3. **Converse.** No painel use *Chat* (`/admin/chat`, o terminal do Hermes). Se ligou o chat no navegador, ele está em `<endereço>/` com o mesmo login.
4. **Conecte um canal** (ou use *Canais* em `/admin/channels`):
   - *Telegram:* crie o bot com o @BotFather; informe o token e seu id numérico (@userinfobot).
   - *Discord:* Portal do Desenvolvedor > Bot > Reset Token, com **Message Content Intent**; informe seu id de usuário.
   - *Slack:* app com Socket Mode; `xoxb-` (bot), `xapp-` (app, escopo `connections:write`) e o id de membro.
   - *WhatsApp:* marque a opção e informe os números permitidos (com DDI, só dígitos). Escaneie o QR em *Canais > WhatsApp* (ele expira) ou no **log do app** (procure "Scan this QR code with WhatsApp on your phone", em fonte monoespaçada; reinicie o app para um novo). Use um dos dois de cada vez.
   - *E-mail:* endereço, senha (de app, no Gmail), servidores IMAP e SMTP, a lista de remetentes permitidos e o `authserv-id` do seu servidor (Gmail: `mx.google.com`). O agente só age em remetentes que o servidor autenticou.
5. **Skills e agendamentos.** O Hermes sincroniza as skills no primeiro início. *Cron* cria tarefas recorrentes que falam com você pelo canal.
6. **Trocar de modelo.** Mude `HERMES_MODEL_PROVIDER` e `HERMES_MODEL_CUSTOM` (ou `HERMES_MODEL`) e reinicie: a variável é a fonte da verdade e sobrescreve o `config.yaml` no próximo início.

## Atualizar e voltar
A plataforma tira um snapshot antes de atualizar. O estado (`/app/.hermes`: memórias, sessões, skills, configuração) volta junto no rollback.
