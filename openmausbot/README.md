# OpenMausBot

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

App de chat em que cada contato é um agente **Claude Code** ou **Codex**, com personalidade, memória, rotinas agendadas e uma interface web. OpenMausBot 0.1.134 como projeto de código no runtime Node 24 da Vertra; o `openmausbot`, o Claude Code (2.1.316) e o Codex (0.166.0) são pacotes do npm fixados no `package-lock.json`. Você entra com a sua conta Claude e/ou ChatGPT: a Vertra não hospeda modelo.

## O que o assistente pergunta

Nada. As contas Claude e Codex são conectadas dentro do app, e o acesso é por um código de pareamento impresso no log.

## O que você recebe

- **Endereço** do app (a interface web).
- Como entrar (pareamento) e como conectar Claude e Codex, nas saídas do app.

## Primeiros passos

1. Depois do deploy, abra o **log do app** e copie o código da linha `pairing code` (12 caracteres, uso único, vale 5 minutos). A linha `open or scan` traz o link já com o código.
2. Abra `<endereço do app>/pair`, digite o código e confirme. A sessão do navegador dura 30 dias e é renovada a cada uso.
3. Em *Configurações > IA > Engines*, entre no **Claude** (cole de volta o código que a Anthropic mostrar) e/ou no **Codex** (login do ChatGPT por código de dispositivo). Os logins ficam em `/app/.claude` e `/app/.codex`.
4. Crie os bots e converse. Outro dispositivo: reinicie o app para gerar um código novo, ou use *Phone apps* nas configurações do app.

## Limites conhecidos

- **Uma sessão pareada vale como acesso de administrador ao app**: os bots executam comandos dentro do container. Não pareie dispositivos que você não conhece.
- Quem tem os arquivos do app (inclusive snapshots) tem os logins do Claude e do Codex.
- O primeiro deploy leva cerca de 2 minutos para instalar os pacotes (1,2 GB em disco); as subidas seguintes, alguns segundos.
- RAM: 2 GB no mínimo (3 GB recomendado). Parado, o app usa cerca de 0,2 GB; cada bot ativo roda o seu próprio processo do Claude ou do Codex.
- Só a porta 80 é exposta: o receptor de webhooks do OpenMausBot (porta separada) não é alcançável. O navegador dos bots não vem instalado.
- Deploy sem downtime fica desligado (o servidor não aceita duas cópias na mesma pasta de dados). Os pacotes só mudam com uma nova versão do template.
- A interface web envia estatísticas anônimas de uso (PostHog) até você desligar em *Configurações > Geral > Usage analytics*.
- Não foi testado com login real no Claude ou no Codex.

## Licença

OpenMausBot é distribuído sob a Apache-2.0: <https://github.com/milind-soni/OpenMausBot/blob/main/LICENSE>. O pacote npm traz também uma pasta `enterprise/`, sob licença própria e com código disponível; o template a mantém desligada (edição open source). O Codex (`@openai/codex`) é Apache-2.0; o Claude Code (`@anthropic-ai/claude-code`) segue os termos da Anthropic. Os nomes OpenMausBot e MausBot e o mascote são marcas da Supamaus Software Private Limited; este template é um empacotamento da Vertra Cloud, sem afiliação com o projeto, e o ícone é o oficial do projeto, usado só para identificar o que o template empacota (`ICONS.md`).

Mais detalhes: [docs/first-steps.md](docs/first-steps.md) · [docs/reference.md](docs/reference.md)
