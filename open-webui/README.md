# Open WebUI

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Interface de chat com IA para a sua equipe. Open WebUI v0.12.4 (variante `slim`) numa imagem da Vertra que mantém o programa fora do `/app` e os dados em `/app/data`. **Você traz a chave do modelo**: a Vertra não hospeda modelo.

## O que é

- Chat com os modelos do seu provedor, histórico, pastas, prompts e ferramentas.
- Contas de usuário com administrador criado no deploy e **cadastro aberto desligado**.
- Variante `slim`: sem modelo de embeddings, de voz nem Ollama embutidos. Os arquivos anexados entram inteiros no contexto (a busca por embeddings fica desligada).
- Dados em SQLite no disco do app ou em Postgres gerenciado (com certificado de cliente).
- Não abre dentro de outra página (`X-Frame-Options: DENY` e `frame-ancestors 'none'`): a prévia do painel da Vertra mostra o cartão "abrir em nova aba".

## O que o assistente pergunta

| Pergunta | Para que serve |
|---|---|
| Provedor de modelo | OpenAI, OpenRouter, Anthropic, Google Gemini (todos pela API compatível com OpenAI) ou outro endereço. |
| Endereço da API | Só com "Outro": termina em `/v1`. |
| Chave de API do provedor | Só nas variáveis cifradas do app. |
| E-mail e senha do administrador | A conta de administrador já nasce pronta; o cadastro aberto fica desligado. |
| Onde o Open WebUI guarda os dados? | **SQLite** no disco do app (padrão, para uso pessoal ou time pequeno) ou **Postgres gerenciado** (+1 GB de RAM). |

## O que você recebe

- **Endereço** do app.
- O próximo passo: entrar com o e-mail e a senha de administrador que você informou.

## Primeiros passos

1. Abra o endereço e entre com o e-mail e a senha de administrador do assistente.
2. Os modelos do provedor aparecem sozinhos no seletor. Converse.
3. Para criar outras contas: *Painel de administração > Usuários* (o cadastro aberto está desligado).
4. Para trocar de provedor ou somar outro: *Configurações do administrador > Conexões*.

## Limites conhecidos

- RAM: 512 MB é o mínimo (~300 MiB em uso; boot 10-30 s); 1 GB é margem para anexos e várias pessoas.
- Não há embeddings locais: *RAG* com busca semântica não está disponível; anexos vão inteiros ao contexto do modelo.
- Deploy sem downtime fica desligado (a cópia nova migra o banco com a antiga ainda atendendo). O rollback volta **com os dados**.
- A marca Open WebUI não pode ser alterada (veja a Licença).
- `WEBUI_SECRET_KEY` assina os logins: trocar desconecta todo mundo.
- As chamadas aos provedores não foram exercitadas com chave real; só o encadeamento com um servidor compatível local.

## Licença

O Open WebUI é distribuído sob a licença BSD-3 **com cláusula de marca** (cópia em `docker/LICENSE`): <https://github.com/open-webui/open-webui/blob/main/LICENSE>. A marca "Open WebUI" (nome, logo e identificadores visuais) **não pode ser alterada, removida ou ocultada**, salvo em implantações com até 50 usuários finais em 30 dias, com permissão escrita do detentor ou licença enterprise. Este template não altera a marca. O ícone é o do projeto, sem alterações (`ICONS.md`). Empacotamento da Vertra Cloud, não afiliado ao projeto.

Mais detalhes: [docs/first-steps.md](docs/first-steps.md) · [docs/reference.md](docs/reference.md)
