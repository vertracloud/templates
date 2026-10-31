# Referência

## Variáveis do app

| Variável | Valor | Para que serve |
|---|---|---|
| `UPTIME_KUMA_DB_TYPE` | `sqlite` | Sem isto o Kuma 2.x abre o assistente "Setup Database" e não sobe sozinho. |
| `DATA_DIR` | `/app/data/` | Pasta dos dados, no disco persistente do app. |
| `PORT` | `3001` | Definida pela plataforma (porta do app). |

## Recursos

- RAM: mínimo 512 MB (piso de um app web); em uso, cerca de 110-120 MiB.
- Porta 3001; healthcheck em `/api/entry-page` (sobe em segundos).
- Disco: o banco cresce com o histórico de batimentos; o Kuma apaga o histórico antigo (padrão: 180 dias, em *Settings > Monitor History*).

## Problemas comuns

- **Esqueci a senha do administrador.** A senha das saídas só vale no primeiro início. Para recomeçar, apague os dados (`/app/data`) pelo gerenciador de arquivos e reinicie (o administrador `admin` é recriado com a senha da variável `KUMA_ADMIN_PASSWORD`), ou use o rollback para um snapshot anterior.
- **Monitor Ping não responde.** O `ping` roda sem privilégios (sockets ICMP de datagrama). Alguns alvos filtram ICMP; use um monitor TCP ou HTTP.
- **Alertas duplicados.** Mantenha uma só cópia do app (o deploy sem downtime vem desligado por isso).
