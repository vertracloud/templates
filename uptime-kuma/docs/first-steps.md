# Primeiros passos

1. **Entre como administrador.** A conta já existe quando o deploy termina (o endereço só abre depois de ela ser criada): entre com `admin` e a senha das saídas, mostrada uma vez. Troque a senha em *Configurações > Perfil* se quiser; a senha das saídas só vale no primeiro início.
2. **Crie o primeiro monitor.** *Add New Monitor*: tipo (HTTP(S), TCP, Ping, DNS...), nome, alvo e intervalo. O mínimo é 20 s; 60 s serve para a maioria dos sites.
3. **Ligue um alerta.** *Settings > Notifications > Setup Notification*. Para o Telegram, crie um bot com o @BotFather e informe o token e o id do chat. Marque *Default enabled* para que todo monitor novo use esse canal.
4. **Publique uma página de status.** *Status Pages > New Status Page*, escolha o endereço curto (`/status/<nome>`), adicione os monitores e salve. A página é pública e não pede login.
5. **Use o seu domínio (opcional).** Em *Domínios do app* adicione o domínio e, na página de status do Kuma, informe-o em *Domain Names*.

## Monitor "Push" (heartbeat)
Para tarefas agendadas (cron, backup), crie um monitor do tipo *Push*: o Kuma gera uma URL. Faça a tarefa chamar essa URL a cada execução; se ela parar de chamar no intervalo, o monitor cai e o alerta dispara.

## Atualizações e backup
O Uptime Kuma migra o banco ao atualizar, por isso o rollback da plataforma volta **com os dados**. Os dados (`/app/data/kuma.db`) entram nos snapshots do app.
