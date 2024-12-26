const { REST, Routes, Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const prompts = require('prompts');
const logger = require('./utils/logger'); 
const { validateEnv, loadCommandsFromPlugins, createRestClient, promptInput } = require('./utils/slashDeployerUtils');

require('dotenv').config();



async function deploySlashCommands() {
  validateEnv(['DISCORD_TOKEN', 'Discord_Client_ID']);

  logger.info('Starting Slash Command Deployment System...');

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  try {
    await client.login(process.env.DISCORD_TOKEN);
    logger.info(`Logged in as ${client.user.tag} for Slash Command Deployment.`);

    const actionChoices = [
      { title: 'Register Global Commands', value: 'registerGlobal' },
      { title: 'Register Test Guild Commands', value: 'registerTestGuild' },
      { title: 'Delete Single Global Command', value: 'deleteSingleGlobal' },
      { title: 'Delete Single Test Guild Command', value: 'deleteSingleTestGuild' },
      { title: 'Delete All Global Commands', value: 'deleteAllGlobal' },
      { title: 'Delete All Test Guild Commands', value: 'deleteAllTestGuild' },
    ];

    const { action } = await prompts({
      type: 'select',
      name: 'action',
      message: 'What would you like to do?',
      choices: actionChoices,
    });

    let commandName, guildId;

    if (action.startsWith('deleteSingle')) {
      commandName = await promptInput('Enter the command name to delete:', 'Command name is required!');
    }

    if (action.endsWith('TestGuild')) {
      guildId = await promptInput('Enter the test guild ID:', 'Guild ID is required!');
    }

    switch (action) {
      case 'registerGlobal':
        await registerCommands(client);
        break;
      case 'registerTestGuild':
        await registerCommands(client, guildId);
        break;
      case 'deleteSingleGlobal':
        await deleteSingleCommand(client, commandName);
        break;
      case 'deleteSingleTestGuild':
        await deleteSingleCommand(client, commandName, guildId);
        break;
      case 'deleteAllGlobal':
        await deleteAllCommands(client);
        break;
      case 'deleteAllTestGuild':
        await deleteAllCommands(client, guildId);
        break;
      default:
        logger.warn('Invalid action specified.');
    }
  } catch (error) {
    logger.error('Error during Slash Command Deployment:', error);
  } finally {
    logger.info('Shutting down Slash Command Deployment System gracefully...');
    await client.destroy();
  }
}

async function registerCommands(client, guildId = null) {
  const commands = await loadCommandsFromPlugins(path.join(__dirname, 'plugins'));
  const rest = createRestClient();

  try {
    const route = guildId
      ? Routes.applicationGuildCommands(client.user.id, guildId)
      : Routes.applicationCommands(client.user.id);

    const data = await rest.put(route, { body: commands });
    logger.info(`Successfully reloaded ${data.length} ${guildId ? 'guild-specific' : 'application'} (/) commands.`);
  } catch (error) {
    logger.error('Error registering commands:', error);
  }
}

async function deleteSingleCommand(client, commandName, guildId = null) {
  const rest = createRestClient();

  try {
    const route = guildId
      ? Routes.applicationGuildCommands(client.user.id, guildId)
      : Routes.applicationCommands(client.user.id);

    const commands = await rest.get(route);
    const command = commands.find((cmd) => cmd.name === commandName);
    if (!command) {
      logger.warn(`No command found with name: ${commandName}`);
      return;
    }

    const deleteRoute = guildId
      ? Routes.applicationGuildCommand(client.user.id, guildId, command.id)
      : Routes.applicationCommand(client.user.id, command.id);

    await rest.delete(deleteRoute);
    logger.info(`Successfully deleted command: ${commandName}`);
  } catch (error) {
    logger.error('Error deleting command:', error);
  }
}

async function deleteAllCommands(client, guildId = null) {
  const rest = createRestClient();

  try {
    const route = guildId
      ? Routes.applicationGuildCommands(client.user.id, guildId)
      : Routes.applicationCommands(client.user.id);

    await rest.put(route, { body: [] });
    logger.info(`Successfully deleted all ${guildId ? 'guild-specific' : 'application'} commands.`);
  } catch (error) {
    logger.error('Error deleting all commands:', error);
  }
}

deploySlashCommands();
