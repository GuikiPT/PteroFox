const prompts = require('prompts');
const logger = require('./logger');
const fs = require('fs');
const { REST } = require('discord.js');

function validateEnv(keys) {
  keys.forEach((key) => {
    if (!process.env[key]) {
      logger.error(`Missing environment variable: ${key}`);
      process.exit(1);
    }
  });
}

function createRestClient() {
  return new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
}

async function loadCommandsFromPlugins(pluginsPath) {
  const commands = [];

  if (!fs.existsSync(pluginsPath)) {
    logger.error(`Plugins directory not found: ${pluginsPath}`);
    return commands;
  }

  const pluginFolders = fs.readdirSync(pluginsPath);

  for (const folder of pluginFolders) {
    const pluginPath = `${pluginsPath}/${folder}/plugin.js`;

    if (!fs.existsSync(pluginPath)) {
      logger.warn(`Missing plugin.js in plugin folder: ${folder}`);
      continue;
    }

    try {
      const plugin = require(pluginPath);

      if (!plugin.commands || !Array.isArray(plugin.commands)) {
        logger.warn(`No commands array found in plugin: ${plugin.name}`);
        continue;
      }

      for (const commandFile of plugin.commands) {
        const command = require(commandFile);
        if (command?.data && typeof command.execute === 'function') {
          commands.push(command.data.toJSON());
        } else {
          logger.warn(`Invalid command file: ${commandFile}`);
        }
      }
    } catch (error) {
      logger.error(`Failed to load plugin: ${folder}`, error);
    }
  }

  return commands;
}

/**
 * @param {string} message
 * @param {string} validationMessage
 * @returns {Promise<string>}
 */
async function promptInput(message, validationMessage = 'Input is required!') {
  const { input } = await prompts({
    type: 'text',
    name: 'input',
    message,
    validate: (input) => (input ? true : validationMessage),
  });
  return input;
}

module.exports = {
  validateEnv,
  createRestClient,
  loadCommandsFromPlugins,
  promptInput,
};
