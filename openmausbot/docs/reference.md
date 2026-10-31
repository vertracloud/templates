# Referência

## Onde ficam as coisas (`/app`, o disco persistente)
| Caminho | O que é |
|---|---|
| `.openmausbot/` | Conversas, bots, rotinas, configurações e sessões pareadas. |
| `.claude/`, `.claude.json` | Login do Claude. |
| `.codex/` | Login do Codex. |
| `node_modules/` | Os pacotes (cerca de 1,2 GB), reinstalados se `package.json` ou o lockfile mudarem. |

## Variável do app
| Variável | Para que serve |
|---|---|
| `PUBLIC_ORIGIN` | Endereço público do app (vem de `{{app.url}}`): links de pareamento e verificação de origem. |

O `start.sh` define o resto: dados em `.openmausbot`, `claude` e `codex` no `PATH`, atualização automática do Claude Code desligada, edição open source e a porta 80.

## Problemas comuns
- **Não acho o código.** Cada início imprime um novo; role o log até o último `pairing code`, ou reinicie o app. Ele vence em 5 minutos.
- **"Código errado ou vencido".** Use o código do último início, uma vez só.
- **O app mostra a configuração do motor em vez do login.** Em *Engines*, abra as opções avançadas, escolha *Set CLI* e informe `/app/node_modules/.bin/claude` (ou `/app/node_modules/.bin/codex`).
- **O app não sobe depois de um reinício.** O `start.sh` já apaga a trava do servidor (`openmausbot-server.lease`) a cada início; se persistir, veja o log.
- **Lento com vários bots.** Cada bot ativo roda seu processo; aumente a RAM (3 GB recomendado).
