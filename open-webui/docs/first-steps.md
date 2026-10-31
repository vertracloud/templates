# Primeiros passos

1. **Entre.** Abra o endereço e use o e-mail e a senha de administrador informados no assistente. `WEBUI_ADMIN_PASSWORD` só cria a conta enquanto não existe nenhum usuário; depois, troque a senha em *Perfil > Senha*.
2. **Converse.** Os modelos do provedor aparecem no seletor no topo do chat.
3. **Convide a equipe.** *Painel de administração > Usuários > Adicionar*. O cadastro aberto está desligado (`ENABLE_SIGNUP=false`).
4. **Troque ou some provedores.** *Configurações do administrador > Conexões*: qualquer API compatível com OpenAI (OpenRouter, Anthropic e Gemini por suas rotas compatíveis, ou um servidor próprio).
5. **Anexos.** Sem embeddings locais, o arquivo anexado inteiro entra no contexto: use arquivos pequenos ou modelos de contexto longo.

## Dados e backup
Com SQLite, o banco fica em `/app/data/webui.db` e entra nos snapshots do app. Com Postgres gerenciado, os dados ficam no banco da stack. O rollback volta com os dados.
