# Uptime Kuma

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Monitoramento de sites e serviços com alertas e página de status pública. Uptime Kuma 2.5.8 (variante `slim`, SQLite), numa imagem da Vertra que mantém o programa fora do `/app` e os dados no disco do app.

## O que é

- Monitores de HTTP(S), TCP, ping, DNS, palavra-chave, JSON, push (heartbeat) e outros, com intervalo a partir de 20 s.
- Alertas por Telegram, Discord, Slack, e-mail (SMTP), webhook e dezenas de outros canais.
- Páginas de status públicas (`/status/<nome>`), que você pode publicar também no seu domínio.
- Banco SQLite em `/app/data`, dentro do disco do app: entra nos backups e snapshots.

## O que o assistente pergunta

Nenhuma pergunta: o app sobe pronto.

## O que você recebe

- **Endereço** do app.
- **Usuário e senha do administrador** (`admin` e uma senha gerada, mostrada **uma vez**): a conta já existe quando o deploy termina, então ninguém consegue criá-la antes de você.

## Primeiros passos

1. Abra o endereço e entre com `admin` e a senha das saídas (você pode trocá-la em Configurações > Perfil).
2. Em **Add New Monitor**, escolha o tipo, informe o alvo e o intervalo.
3. Em **Settings > Notifications**, conecte Telegram, Discord, e-mail ou outro canal e marque "Default enabled" para novos monitores.
4. Em **Status Pages**, crie uma página pública e escolha os monitores que aparecem nela.

## Limites conhecidos

- O monitor **Real Browser** (Chromium) não existe: a imagem `slim` não traz navegador.
- Sem MariaDB embutido: só SQLite. Para milhares de monitores, prefira outra instalação.
- Sem monitor de contêiner Docker (não há acesso ao Docker do servidor).
- Os testes saem de um único lugar (o servidor do seu app). Um alerta de queda reflete a rota desse servidor até o alvo.
- Deploy sem downtime fica desligado: duas cópias no mesmo banco rodariam todos os monitores em dobro (alertas duplicados).
- O app usa pouca RAM (cerca de 120 MiB em repouso); 512 MB é o piso de um app web.

## Licença

Uptime Kuma é distribuído sob a licença MIT (Louis Lam e colaboradores): <https://github.com/louislam/uptime-kuma/blob/master/LICENSE>. O ícone é o logo oficial do projeto, sem alterações (veja `ICONS.md` na raiz do repositório); a listagem não implica endosso do projeto.

Mais detalhes: [docs/first-steps.md](docs/first-steps.md) · [docs/reference.md](docs/reference.md)
