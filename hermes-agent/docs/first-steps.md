# Primeiros passos

1. **Aguarde o primeiro início.** Ele instala as dependências, baixa o Hermes e o WebUI (por commit, com SHA-256 verificado) e sincroniza as skills. Acompanhe no log do app.
2. **Entre.** Abra o endereço do app; a página pede a senha mostrada **uma vez** nas saídas (só a senha, sem usuário). Perdeu? Troque `HERMES_ADMIN_PASSWORD` nas variáveis do app e reinicie.
3. **Converse.** O chat do navegador está em `<endereço>/` (se você o desligou, a página mostra só uma nota e o agente atende pelos canais).
4. **Conecte um canal:**
   - *Telegram:* crie o bot com o @BotFather; informe o token e seu id numérico (@userinfobot).
   - *Discord:* Portal do Desenvolvedor > Bot > Reset Token, com **Message Content Intent**; informe seu id de usuário.
   - *Slack:* app com Socket Mode; `xoxb-` (bot), `xapp-` (app, escopo `connections:write`) e o id de membro.
   - *WhatsApp:* marque a opção e informe os números permitidos (com DDI, só dígitos). Depois do deploy, abra o **log do app**, localize "Scan this QR code with WhatsApp on your phone" e escaneie o QR (fonte monoespaçada) em WhatsApp > Aparelhos conectados > Conectar um aparelho. Ele expira em ~1 min; reinicie o app para um novo. Ao parear, o agente reinicia sozinho. A primeira vez baixa o Node.js (~30 MB) e instala a ponte.
   - *E-mail:* endereço, senha (de app, no Gmail), servidores IMAP e SMTP, a lista de remetentes permitidos e o `authserv-id` do seu servidor (Gmail: `mx.google.com`). O agente só age em remetentes que o servidor autenticou.
5. **Skills e agendamentos.** O Hermes sincroniza as skills no primeiro início. Os agendamentos (cron) falam com você pelo canal.
6. **Trocar de modelo.** Mude `HERMES_MODEL_PROVIDER` e `HERMES_MODEL_CUSTOM` (ou `HERMES_MODEL`) e reinicie: a variável é a fonte da verdade e sobrescreve o `config.yaml` no próximo início.

## Atualizar e voltar
A plataforma tira um snapshot antes de atualizar. O estado (`/app/.hermes`: memórias, sessões, skills, configuração) volta junto no rollback.
