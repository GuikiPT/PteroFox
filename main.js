require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const figlet = require('figlet-promised');
const colors = require('colors/safe');
const fs = require('fs');
const { loadPlugins } = require('./utils/pluginLoader');
const logger = require('./utils/logger');

if (!process.env.DISCORD_TOKEN) {
  logger.error('DISCORD_TOKEN is missing in the environment variables.');
  process.exit(1);
}

const intents = [GatewayIntentBits.Guilds];
const client = new Client({ intents });
client.commands = new Collection();

async function runFiglet(name) {
  const result = await figlet(name.toString());
  console.log(colors.bold(colors.rainbow(result)));
}

async function initializeBot() {
  try {
    await runFiglet('PteroFox');
    logger.info('Starting bot initialization...');
    logger.info('Starting to load plugins...');
    await loadPlugins(client, './plugins');
    logger.info('Plugins loaded successfully.');

    await client.login(process.env.DISCORD_TOKEN);
    logger.info('Bot initialization complete.');
  } catch (error) {
    logger.error('Error during bot startup:', error);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Shutting down gracefully...');
  await client.destroy();
  process.exit(0);
});

initializeBot();
