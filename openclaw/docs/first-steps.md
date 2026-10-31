# Primeiros passos

1. **Entre no painel.** Abra o endereço do app. Em *Configurações > Gateway* cole o **token do gateway** (mostrado uma vez nas saídas; ele também fica na variável cifrada `OPENCLAW_GATEWAY_TOKEN`). Em até 15 s o primeiro navegador é pareado sozinho; os dispositivos seguintes pedem aprovação em *Configurações > Dispositivos*.
2. **Fale com o assistente.** O modelo e o provedor escolhidos no assistente já estão ativos. Para outro modelo, mude em *Configurações > Modelos* ou nas variáveis `OPENCLAW_PROVIDER` / `OPENCLAW_MODEL_ID`.
3. **Use o navegador.** Peça "abra example.com e me diga o título". Em *Chat > + > Browser* aparece a janela do agente. Páginas em rede privada ou local são bloqueadas de propósito.
4. **Conecte um canal.**
   - *Telegram:* crie o bot com o @BotFather e informe o token e seu id numérico (fale com @userinfobot).
   - *Discord:* Portal do Desenvolvedor > Bot > Reset Token; ative **Message Content Intent**; informe seu id de usuário (Modo Desenvolvedor).
   - *Slack:* app com Socket Mode; informe o *Bot User OAuth Token* (`xoxb-`), o *App-Level Token* (`xapp-`, escopo `connections:write`) e o id de membro.
   - *WhatsApp:* *Configurações > Canais > WhatsApp* e escaneie o QR logo que aparecer.
5. **Cron e skills.** *Configurações > Cron* para tarefas agendadas; as skills prontas aparecem em *Skills*.

## Atualizar e voltar
A plataforma tira um snapshot antes de atualizar. Voltar a versão leva os dados junto: o OpenClaw migra o esquema do banco local ao subir uma versão nova.
