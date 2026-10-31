# Referência

## Variáveis do app

| Variável | Valor | Para que serve |
|---|---|---|
| `WEBUI_SECRET_KEY` | segredo gerado | Assina os logins; trocar desconecta todos. |
| `WEBUI_ADMIN_EMAIL` / `WEBUI_ADMIN_PASSWORD` | do assistente | Cria a conta de administrador se ainda não existir usuário. |
| `ENABLE_SIGNUP` | `false` | Cadastro aberto desligado. |
| `OPENAI_API_BASE_URL` / `OPENAI_API_KEY` | do assistente | Endereço compatível com OpenAI do provedor e a chave. |
| `DATABASE_URL` | só com Postgres | URL com `sslmode=verify-full` e certificado de cliente (a chave do cliente precisa de permissão `0400`). |
| `BYPASS_EMBEDDING_AND_RETRIEVAL` | `true` | A imagem `slim` não tem modelo de embeddings; sem isto o envio de documentos tentaria baixar um. |
| `ENABLE_OLLAMA_API`, `ENABLE_VERSION_UPDATE_CHECK` | `false` | A Vertra não hospeda modelo local; a versão é a do template. |
| `WEBUI_URL`, `CORS_ALLOW_ORIGIN`, `WEBUI_SESSION_COOKIE_SECURE` | endereço do app / `true` | Origem pública, CORS restrito e cookie seguro (o app é servido por https). |
| `DATA_DIR` | `/app/data` | Dados, caches e estáticos no disco do app. |

## Recursos

- RAM: 512 MB (mínimo) / 1024 MB (recomendado); Postgres 1024 MB quando escolhido.
- Porta 8080; healthcheck em `/health` (200 `{"status":true}`), até 180 s.
- Disco: o programa fica em `/opt/open-webui` (somente leitura); dados em `/app/data`.

## Problemas comuns

- **Nenhum modelo aparece.** A chave ou o endereço da API estão errados: confira *Conexões* e as variáveis `OPENAI_API_*`.
- **Não consigo criar conta.** O cadastro aberto está desligado de propósito; peça ao administrador.
- **Postgres recusa a conexão.** O certificado de cliente precisa estar em `/app/.vertra/certs/...` e a chave com permissão `0400` (a plataforma cuida disso).
