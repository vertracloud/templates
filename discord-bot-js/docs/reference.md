# Referência

| Item | Valor |
|---|---|
| Variável | `DISCORD_TOKEN` (cifrada; vem da pergunta do assistente) |
| Linguagem | JavaScript (Node.js, versão recomendada da plataforma) |
| Comando de início | `node index.js` |
| Arquivo principal | `index.js` |
| RAM | 100 MB (mínimo), 256 MB (recomendada) |
| Web | não (só conexões de saída) |
| Deploy sem downtime | desligado (um token = uma cópia) |

## Problemas comuns

- **`Login failed` no log.** O valor de `DISCORD_TOKEN` não é o token do bot (Portal > Bot > Reset Token). Atualize a variável e reinicie.
- **`/ping` não aparece.** Comandos globais levam alguns minutos; confirme que o convite tinha o escopo `applications.commands`.
- **O app não fica no ar.** Sem token válido o processo sai com código 1; corrija o token e reinicie.
