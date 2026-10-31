# Primeiros passos

1. **Guarde a API key global.** Ela aparece **uma única vez** nas saídas do assistente. Se perder, troque o segredo `AUTHENTICATION_API_KEY` nas variáveis do app e reinicie.
2. **Abra o painel** em `<endereço>/manager` e entre com a API key.
3. **Crie uma instância.** Nome livre, integração `WHATSAPP-BAILEYS`. O painel mostra o QR code; no celular, *WhatsApp > Aparelhos conectados > Conectar um aparelho*.
4. **Envie uma mensagem de teste:**
   ```bash
   curl -X POST "<endereço>/message/sendText/<instância>" \
     -H "apikey: <chave>" -H "Content-Type: application/json" \
     -d '{"number":"5511999999999","text":"Olá da Evolution API"}'
   ```
5. **Receba eventos.** Em *Webhook* da instância informe a URL do seu serviço e marque os eventos (`MESSAGES_UPSERT`, `CONNECTION_UPDATE`...).

## Cache local ou Redis
O padrão é o cache local (sem Redis). Escolha Redis gerenciado no assistente se quiser que o cache sobreviva a reinícios do processo; ele usa mais 512 MB do plano e conecta com certificado de cliente.

## Backup e atualização
Os dados ficam no Postgres da stack e nos arquivos de `/app` (`instances`, `store`). A plataforma tira o snapshot antes de atualizar e o rollback volta com os dados.
