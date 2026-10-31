import os
import sys

import discord
from discord import app_commands

token = os.environ.get("DISCORD_TOKEN")
if not token:
    print("DISCORD_TOKEN is not set. Add it in the app environment variables and restart.", file=sys.stderr, flush=True)
    sys.exit(1)

# Slash commands need no privileged intent: the default intents are enough.
intents = discord.Intents.default()
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)


@tree.command(name="ping", description="Replies with pong and the gateway latency")
async def ping(interaction: discord.Interaction) -> None:
    await interaction.response.send_message(f"Pong! {round(client.latency * 1000)} ms")


@client.event
async def on_ready() -> None:
    print(f"Logged in as {client.user}. Slash command /ping registered.", flush=True)


@client.event
async def setup_hook() -> None:
    # Registers /ping globally on every start (idempotent). Global commands can take a few minutes to show up in Discord.
    await tree.sync()


try:
    # log_handler=None keeps the output plain; the prints above are enough for the app log.
    client.run(token, log_handler=None)
except discord.LoginFailure:
    print("Login failed: invalid token. Check that DISCORD_TOKEN is the bot token (Developer Portal > Bot > Reset Token).", file=sys.stderr, flush=True)
    sys.exit(1)
