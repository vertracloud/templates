# Bot de Discord (Python)

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Bot de Discord mínimo em Python, com discord.py 2.7.1 e o comando `/ping`. É um **template de código**: o código é seu, aberto e editável; a Vertra roda o que está em `src/`.

## O que é

- Faz login com o token do bot, registra o comando de barra `/ping` a cada início e responde com a latência do gateway.
- Só a intent `Guilds` (sem intent privilegiada para ligar no Portal do Desenvolvedor).
- Sem token ou com token errado, o processo termina com código 1 e uma mensagem clara no log do app.
- Código-fonte em `src/main.py`; dependências em `src/requirements.txt`.

## O que o assistente pergunta

| Pergunta | Para que serve |
|---|---|
| Token do bot | Vira a variável `DISCORD_TOKEN` (cifrada). Veja o passo 1 abaixo para obtê-lo. |

## O que você recebe

- O app (sem endereço web: o bot só faz conexões de saída).
- Próximo passo: convidar o bot ao servidor e usar `/ping`.

## Primeiros passos

1. No [Portal do Desenvolvedor do Discord](https://discord.com/developers/applications), crie uma aplicação, abra **Bot** e use **Reset Token**; copie o token.
2. Cole o token quando o assistente perguntar.
3. Convide o bot ao seu servidor: **OAuth2 > URL Generator**, escopos `bot` e `applications.commands`.
4. Digite `/ping`. O comando global pode levar alguns minutos para aparecer na primeira vez.
5. Para mudar o bot, edite `src/main.py` (pelo editor/arquivos do app ou por deploy) e reinicie.

## Limites conhecidos

- Não tem página web: o healthcheck é só o ready-gate (o processo precisa ficar de pé).
- Duas cópias com o mesmo token respondem em dobro: o deploy sem downtime fica desligado.
- O mínimo é 100 MB e 256 MB (o recomendado) bastam para um bot simples; bots com muitos servidores ou cache grande pedem mais (RAM pode ser aumentada).
- O token fica em variável cifrada; nunca o coloque no código.
- Comandos globais do Discord demoram a propagar; para testes use comandos de servidor (guild) no seu código.

## Licença

O código deste template é da Vertra Cloud, sob a licença MIT (veja a `LICENSE` do repositório). discord.py 2.7.1 é distribuída sob a licença MIT: <https://github.com/Rapptz/discord.py/blob/master/LICENSE>.

Mais detalhes: [docs/first-steps.md](docs/first-steps.md) · [docs/reference.md](docs/reference.md)
