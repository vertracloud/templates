# Referência

## Variáveis do app

| Variável | Valor | Para que serve |
|---|---|---|
| `N8N_ROLE` | `main` / `worker` | Qual processo o `start.sh` inicia (editor ou worker). |
| `N8N_PORT` | `80` | Porta que a plataforma usa para o tráfego web (só o editor). |
| `N8N_ENCRYPTION_KEY` | segredo gerado | Cifra as credenciais; a mesma no editor e no worker. Trocar derruba o boot. |
| `DB_TYPE`, `DB_POSTGRESDB_*` | da opção `mode` | SQLite ou Postgres da stack, com certificado de cliente (`..._SSL_*_FILE`). |
| `EXECUTIONS_MODE`, `QUEUE_BULL_REDIS_*`, `VERTRA_TLS_CLIENT_*` | só no modo com workers | Fila por Redis; um pequeno pré-carregamento (`redis-tls-client.cjs`) injeta o certificado de cliente só nas conexões ao host do Redis. |
| `N8N_WEBHOOK_URL`, `N8N_EDITOR_BASE_URL`, `N8N_HOST` | `{{app.url}}` | Endereço público. |
| `VERTRA_CODE_MODULES` | `safe` / `all` | Módulos permitidos no Code (JavaScript). `VERTRA_JS_EXTERNAL_ALLOW` lista os pacotes externos (padrão `moment`). |
| `GENERIC_TIMEZONE`, `TZ` | do assistente | Fuso dos agendamentos. |
| `EXECUTIONS_DATA_MAX_AGE` / `EXECUTIONS_DATA_PRUNE_MAX_COUNT` | `168` / `5000` | Retenção do histórico (horas / execuções). |
| `N8N_SMTP_*`, `N8N_EMAIL_MODE` | do assistente (SMTP) | E-mail de convites e redefinição. |

## Recursos

- RAM: editor 1024 MB (mínimo) / 2048 MB (recomendado); worker 1024 MB; Postgres 1024 MB; Redis 512 MB. Totais mínimos: SQLite 1 GB, Postgres 2 GB, workers 3,5 GB.
- Healthcheck em `/healthz/readiness` (espera o banco), até 240 s.
- Instalação: `npm ci` no deploy e a cada atualização (cerca de 2,5 minutos); as dependências ocupam cerca de 2,7 GB de `/app` em cada app.
- Disco: o código e o `node_modules` ficam em `/app`; os dados em `/app/.n8n` (nós da comunidade em `/app/.n8n/nodes`; arquivos binários em `/app/.n8n/binaryData` no modo simples).

## Problemas comuns

- **`Module 'fs' is disallowed` (ou outro módulo).** O módulo não está na lista segura: escolha **Todos** ou ajuste `VERTRA_CODE_MODULES`.
- **Nó Code em Python não roda.** O runner de Python não existe neste template; use JavaScript.
- **O boot não termina.** Confira se a `N8N_ENCRYPTION_KEY` do app é a mesma gravada em `/app/.n8n/config`.
- **O deploy falha na instalação.** Veja o log do deploy: falta de espaço em `/app` ou sem saída para o registro npm.
- **Nó da comunidade não instala.** Falta saída para o registro npm ou espaço em `/app`.
