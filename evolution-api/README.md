# Evolution API

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

API de WhatsApp com instâncias, webhooks e integrações. Evolution API v2.3.7 (versão estável; a tag `latest` do projeto é um pré-lançamento) numa imagem da Vertra, com Postgres gerenciado incluído.

## O que é

- Várias instâncias de WhatsApp (conexão por QR code) com envio e recebimento de mensagens por API REST.
- Webhooks e integrações (Typebot, Chatwoot, Dify, n8n e outras) configuráveis por instância.
- Painel de administração em `/manager`.
- Postgres gerenciado para os dados (mensagens, contatos, instâncias) e, se quiser, Redis gerenciado para o cache. Os arquivos de sessão ficam em `/app` e entram nos backups.

## O que o assistente pergunta

| Pergunta | Opções | O que muda |
|---|---|---|
| Cache da Evolution API | Cache local (padrão) ou Redis gerenciado | Local roda sem Redis. Redis guarda o cache fora do processo e usa mais 512 MB do plano. |

## O que você recebe

- **Painel** (`<endereço>/manager`).
- **API key global**, mostrada **uma vez**: guarde-a. Ela dá acesso a todas as instâncias.
- O próximo passo: abrir o painel, entrar com a API key, criar uma instância e ler o QR code no WhatsApp.

## Primeiros passos

1. Abra `<endereço>/manager` e entre com a **API key global** (as saídas mostram a chave uma só vez).
2. Crie uma instância (um nome, `WHATSAPP-BAILEYS`) e leia o **QR code** em *WhatsApp > Aparelhos conectados > Conectar um aparelho*.
3. Envie uma mensagem de teste por API: `POST <endereço>/message/sendText/<instância>` com o cabeçalho `apikey` (use a chave da instância ou a global).
4. Configure o webhook da instância para o seu serviço (por exemplo um fluxo do n8n).

## Limites conhecidos

- O healthcheck é a rota `/` (a Evolution não tem `/healthz`).
- Deploy sem downtime fica desligado: duas cópias poderiam abrir duas sessões do mesmo WhatsApp e o servidor derrubaria a conexão.
- O rollback exige voltar **com os dados**: a Evolution aplica migrações do banco a cada início.
- RAM: 512 MB é o mínimo (a Evolution usa ~150-300 MiB); cresce com o número de instâncias conectadas e o volume de mensagens (recomendado 1024 MB).
- A conexão por Baileys (WhatsApp Web não oficial) pode ser bloqueada pelo WhatsApp se usada para spam: use com contatos que consentiram.
- Com Redis gerenciado, a conexão usa certificado de cliente; a imagem traz um pequeno pré-carregamento (`vertra-tls-client-cert.cjs`) restrito ao host do Redis.

## Licença

A Evolution API é distribuída sob a Apache 2.0 **com condições adicionais** (<https://github.com/evolution-foundation/evolution-api/blob/main/LICENSE>): não remova o logo e o copyright do painel (`/manager`) e, se a Evolution fizer parte de um projeto seu, exiba um aviso claro de que ela é usada (por exemplo na documentação ou nas configurações). Leia a licença antes de oferecê-la a terceiros. Este template é um empacotamento da Vertra Cloud e não é afiliado ao projeto.

Mais detalhes: [docs/first-steps.md](docs/first-steps.md) · [docs/reference.md](docs/reference.md)
