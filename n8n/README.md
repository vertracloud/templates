# n8n

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Automação de workflows com editor visual. n8n 2.44.7 como **projeto de código** no runtime Node.js 24 da Vertra Cloud: o deploy instala o pacote `n8n` do npm (versão fixada no `package-lock.json`) e o `start.sh` sobe o editor ou o worker. O código fica aberto para leitura em `src/`.

## O que é

- **Editor e webhooks** no endereço do app; o banco é escolhido no assistente.
- **Nó Code em JavaScript**, executado pelo task runner interno do n8n (um processo ao lado do editor, sem container extra).
- **Nós da comunidade** (*Configurações > Nós da comunidade*): ficam em `/app/.n8n/nodes` e sobrevivem a reinício e atualização; no modo fila o worker reinstala os pacotes ao subir.
- **E-mail (SMTP)** opcional para convites e redefinição de senha.
- **Retenção**: o histórico de execuções é apagado depois de 7 dias ou 5000 execuções.
- Telemetria, aviso de versão e personalização desligados; os nós "Execute Command" e "Local File Trigger" vêm desativados pelo n8n.

## O que mudou em relação à versão de imagem

- **O nó Code em Python não existe.** O runtime Node não traz o runner de Python do n8n; use JavaScript no nó Code. Um nó Code em Python mostra que o runner não está disponível.
- O deploy **instala as dependências** (`npm ci`, cerca de 2,5 minutos) e usa cerca de 2,7 GB de disco por app (o worker tem a própria cópia).
- Os módulos permitidos do nó Code (opção *Seguro* ou *Todos*) valem só para JavaScript.

## O que o assistente pergunta

| Pergunta | Para que serve |
|---|---|
| E-mail do administrador (owner) | O e-mail da conta de owner, criada no deploy com uma senha gerada (mostrada uma vez nas saídas). |
| Como o n8n vai rodar? | **Postgres gerenciado** (padrão: n8n + Postgres, 2 GB no total), **SQLite interno** (só o n8n, 1 GB) ou **Escalar com workers** (n8n + 1 worker + Postgres + Redis, 3,5 GB). |
| Execuções em paralelo no worker | Só no modo com workers. Padrão 5; mais paralelismo pede mais RAM do worker. |
| Fuso horário dos agendamentos | America/Sao_Paulo, UTC, America/New_York ou Europe/Lisbon. |
| Módulos permitidos no nó Code | **Seguro** (padrão): só módulos de dados e texto. **Todos**: também arquivos, processos e rede dentro do seu container. |
| Enviar e-mails do n8n? | Opcional (convites e redefinição de senha): servidor SMTP, segurança, porta, usuário, senha e remetente. |

## O que você recebe

- **Endereço** do app (editor e webhooks).
- **E-mail e senha do owner**: a conta de administrador já existe no fim do deploy; a senha é gerada e mostrada **uma vez**. Ninguém consegue criá-la antes de você.

## Primeiros passos

1. Escolha como o n8n vai rodar, o fuso horário e, se quiser, o SMTP.
2. Depois do deploy, abra o endereço e entre com o e-mail e a senha de **owner** das saídas.
3. Em um nó **Code** use a linguagem **JavaScript**.
4. Guarde uma cópia de `N8N_ENCRYPTION_KEY` (variável do app): sem ela as credenciais de um backup não podem ser lidas.

## Limites conhecidos

- **Chave de criptografia:** as credenciais dos fluxos são cifradas com `N8N_ENCRYPTION_KEY` (segredo gerado uma vez, igual no editor e no worker).
- Primeiro boot de 10 a 60 s (migra o banco). RAM do editor 500 a 900 MiB; do worker 440 a 500 MiB. O task runner do Code sobe junto com o n8n.
- O modo com workers cria **1 worker** (mais workers dependem das réplicas da plataforma); o worker não tem endereço público e só fala com o Postgres e o Redis. Webhook processors dedicados não existem: os webhooks são atendidos pelo editor.
- Deploy sem downtime fica desligado: no modo fila duas cópias se declaram líderes e gatilhos de polling rodariam em dobro. O rollback volta **com os dados** (o n8n migra o banco).
- Nó da comunidade roda **dentro** do processo do n8n, com acesso ao que o n8n acessa: instale só pacotes em que você confia.
- Corpo máximo de requisição 16 MiB (padrão do n8n).
- O n8n marca o modo de task runner interno como obsoleto e pode exigir o modo externo em versões futuras; atualizar o n8n pede um template novo, testado.
- O e-mail com STARTTLS/SSL real ainda precisa de confirmação em produção.

## Licença

O n8n é distribuído sob a **Sustainable Use License** (uso interno de negócio ou pessoal/não comercial; n8n GmbH): <https://github.com/n8n-io/n8n/blob/master/LICENSE.md>. Leia a licença antes de oferecer o n8n a terceiros. O ícone é o símbolo oficial do n8n, sem alterações (`ICONS.md`). Este template é um empacotamento da Vertra Cloud e não é afiliado ao n8n.

Mais detalhes: [docs/first-steps.md](docs/first-steps.md) · [docs/reference.md](docs/reference.md)
