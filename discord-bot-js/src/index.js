"use strict";

const { Client, Events, GatewayIntentBits } = require("discord.js");

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("DISCORD_TOKEN is not set. Add it in the app environment variables and restart.");
  process.exit(1);
}

// Slash commands need no privileged intent: Guilds is enough.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (ready) => {
  // Registers /ping globally on every start (idempotent). Global commands can take a few minutes to show up in Discord.
  await ready.application.commands.set([{ name: "ping", description: "Replies with pong and the gateway latency" }]);
  console.log(`Logged in as ${ready.user.tag}. Slash command /ping registered.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "ping") return;
  await interaction.reply(`Pong! ${Math.round(client.ws.ping)} ms`);
});

client.on(Events.Error, (error) => console.error("Discord client error:", error.message));

client.login(token).catch((error) => {
  console.error(`Login failed: ${error.message.replace(/\.$/, "")}. Check that DISCORD_TOKEN is the bot token (Developer Portal > Bot > Reset Token).`);
  process.exit(1);
});
