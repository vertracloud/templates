# Primeiros passos

## 1. Criar o bot e pegar o token
1. Abra o [Portal do Desenvolvedor do Discord](https://discord.com/developers/applications) e crie uma **New Application**.
2. Em **Bot**, use **Reset Token** e copie o valor. Ele só aparece uma vez.
3. Cole o token no assistente do template. Ele vira a variável cifrada `DISCORD_TOKEN`.

## 2. Convidar o bot
Em **OAuth2 > URL Generator** marque os escopos `bot` e `applications.commands`, abra a URL gerada e escolha o servidor.

## 3. Conferir
Depois do deploy o log do app deve mostrar `Logged in as <nome do bot>`. No Discord, digite `/ping`: o bot responde `Pong!` com a latência.

## 4. Fazer o seu bot
O template é um ponto de partida. Abra `src/index.js` e acrescente comandos; faça deploy de novo (ou reinicie, se editou pelo editor do app).
Para adicionar bibliotecas, use `npm install <pacote>` localmente e envie o `package.json` e o `package-lock.json` atualizados: a plataforma instala as dependências a cada deploy.
