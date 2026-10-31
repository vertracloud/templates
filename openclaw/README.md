# OpenClaw

[Português (Brasil)](README.md) · [English](README.en.md) · [Español](README.es.md)

Assistente de IA pessoal com navegador, painel e canais de mensagem. OpenClaw 2026.10.7 como projeto de código no runtime Node 24 da Vertra (o pacote `openclaw` do npm, fixado no `package-lock.json`; o Chromium vem do runtime). Você traz a chave do modelo: a Vertra não hospeda modelo.

## O que é

- **Painel (Control UI)** no endereço do app, protegido pelo token do gateway.
- **Navegador do agente** (opcional, ligado por padrão): Chromium headless dentro do container, para o assistente abrir, ler e preencher páginas.
- **Terminal do painel** ligado (um shell do próprio container, sem privilégio novo).
- **Provedores**: OpenAI, Anthropic, Google Gemini, OpenRouter e endpoint compatível; dezenas de outros pelo painel (Configurações > Modelos).
- **Canais**: Telegram, Discord e Slack ligados no primeiro boot; WhatsApp por QR no painel.
- Agendamentos (cron), skills e voz fazem parte do OpenClaw; a voz depende do microfone do seu navegador e de um provedor de fala.

## O que o assistente pergunta

| Pergunta | Para que serve |
|---|---|
| Provedor de modelo | OpenAI, Anthropic, Google Gemini, OpenRouter ou endpoint compatível com OpenAI. |
| Chave de API do provedor | Guardada só nas variáveis cifradas do app. O OpenClaw sobe mesmo com chave inválida; ela só é usada quando o assistente responde. |
| URL base do endpoint | Só com endpoint compatível: termina em `/v1`. |
| Modelo (opcional) | Em branco = padrão do provedor. Obrigatório com endpoint compatível. No OpenRouter aceita qualquer id (também `:free`). |
| O assistente pode usar um navegador? | Sim (padrão): Chromium dentro do app, 3 GB de RAM no mínimo. Não: só texto, 2 GB. Vale na primeira subida. |
| Telegram, Discord, Slack | Cada canal pede o token e **quem pode falar com o bot**. Sem lista de permitidos o canal não liga. |

## O que você recebe

- **Endereço** do app (o painel).
- **Token do gateway**, mostrado **uma vez**: é a credencial de acesso ao painel.
- O próximo passo (colar o token e aguardar o pareamento do primeiro navegador) e a instrução do WhatsApp.

## Primeiros passos

1. Depois do deploy, abra o endereço e cole o **token do gateway** em *Configurações > Gateway*. Aguarde até 15 s: o primeiro navegador é pareado sozinho.
2. Converse com o assistente no painel. Peça algo que use a web ("abra o site X e resuma"): em *Chat > + > Browser* você vê o que ele vê.
3. Para conectar o **WhatsApp**: *Configurações > Canais > WhatsApp* e escaneie o QR assim que aparecer (ele expira). Uma sessão de WhatsApp por app.
4. Para trocar de provedor ou modelo depois: *Configurações > Modelos* no painel.

## Limites conhecidos

- O primeiro boot leva 30-45 s sem canais e **1 a 3 min com Discord ou Slack** (o OpenClaw instala os plugins do canal do npm e roda o doctor; exige saída para o registro npm). Depois, 15-50 s.
- RAM: **3 GB no mínimo com o navegador** (4 GB recomendado); sem o navegador, 2 GB (3 GB recomendado). O gateway usa cerca de 1 GiB; o navegador com várias abas pesadas chega a ~1,9 GiB.
- O arquivo `/app/.openclaw/openclaw.json` é gerado **uma vez**; depois é seu e o painel o reescreve. O token do gateway, a origem pública e o modelo seguem as variáveis do app (por referência).
- O pareamento automático do primeiro navegador reduz "token + aprovação" a "token" **naquele primeiro dispositivo**. `OPENCLAW_BOOTSTRAP_PAIRING=off` desliga.
- O navegador do agente bloqueia rede privada/local (política SSRF do OpenClaw) e roda sem o sandbox do próprio Chromium (o container é o isolamento).
- **Teste local (dev):** o gateway só aceita origem pública HTTPS ou `http://localhost` / `http://127.0.0.1`. Em produção o `{{app.url}}` é sempre HTTPS, então nada muda. Em ambiente local o endereço do app é `http://<nome>.localhost:8080` e o gateway recusa subir (o deploy termina `unhealthy`); para testar local, publique o app com uma cópia do template cujo `PUBLIC_ORIGIN` seja `http://localhost:8080`. O manifesto não muda por isso.
- Deploy sem downtime fica desligado (duas cópias no mesmo disco não coexistem); voltar de versão leva os dados junto.
- Os modelos padrão de cada provedor vêm da documentação do OpenClaw; informe o modelo se quiser outro. Não foi exercitado com chave real de provedor.

## Licença

OpenClaw é distribuído sob a licença MIT (OpenClaw Foundation): <https://github.com/openclaw/openclaw/blob/main/LICENSE>. O Chromium do runtime segue a licença do projeto Chromium. Este template é um empacotamento da Vertra Cloud e não é afiliado ao projeto; o ícone é o logo oficial, sem alterações (`ICONS.md`).

Mais detalhes: [docs/first-steps.md](docs/first-steps.md) · [docs/reference.md](docs/reference.md)
