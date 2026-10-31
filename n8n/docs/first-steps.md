# Primeiros passos

1. **Entre como owner.** A conta de owner já existe quando o deploy termina: abra o endereço e entre com o e-mail que você informou e a senha das saídas (mostrada uma vez). O n8n reaplica esses dados a cada início e trava a troca de e-mail e senha pela interface; para trocar, mude `N8N_INSTANCE_OWNER_EMAIL` ou a senha `VERTRA_OWNER_PASSWORD` nas variáveis do app e reinicie.
2. **Seu primeiro fluxo.** *Create workflow*, adicione um **Webhook** e um nó **Code** em JavaScript:
   ```javascript
   return [{ json: { ok: true, n: $input.all().length } }];
   ```
   O nó Code em Python não está disponível neste template.
3. **Módulos do Code.** No modo **Seguro** só entram os módulos de dados e texto: crypto, url, path, util, zlib, buffer, querystring, string_decoder, events, stream, assert (+ moment). Para liberar tudo (fs, child_process, http...), escolha **Todos** ou mude `VERTRA_CODE_MODULES` (`safe` / `all`) nas variáveis do app.
4. **Nós da comunidade.** *Configurações > Nós da comunidade > Instalar*, informe o pacote do npm. Precisa de saída para o registro npm.
5. **Workers.** No modo com workers, o editor entrega cada execução ao worker por Redis. Ajuste o paralelismo em `N8N_WORKER_CONCURRENCY` (o assistente pergunta).
6. **E-mail.** Com SMTP configurado, *Settings > Users > Invite* envia o convite por e-mail. O nó *Send Email* usa a credencial do próprio fluxo.

## Atualizar e voltar
A plataforma tira um snapshot antes de atualizar e o rollback volta **com os dados**. As atualizações de versão do n8n chegam como versões novas do template e reinstalam as dependências.
