const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * @param {Object} client
 * @param {string} pluginsPath
 */
async function loadPlugins(client, pluginsPath) {
  const absolutePluginsPath = path.resolve(process.cwd(), pluginsPath);

  if (!fs.existsSync(absolutePluginsPath)) {
    logger.error(`Plugins directory not found: ${absolutePluginsPath}`);
    return;
  }

  const pluginFolders = fs.readdirSync(absolutePluginsPath);

  let pluginCount = 0;
  let commandCount = 0;
  let eventCount = 0;

  await Promise.all(
    pluginFolders.map(async (folder) => {
      try {
        const pluginPath = path.join(absolutePluginsPath, folder, 'plugin.js');

        if (!fs.existsSync(pluginPath)) {
          logger.warn(`Missing plugin.js in plugin folder: ${folder}`);
          return;
        }

        const plugin = require(pluginPath);

        if (!validatePlugin(plugin, folder)) return;

        logger.info(`Loading plugin: ${plugin.name} (${pluginPath}) - ${plugin.description}`);
        pluginCount++;

        if (plugin.commands && Array.isArray(plugin.commands)) {
          plugin.commands.forEach((file) => {
            loadCommand(client, file, plugin.name);
            commandCount++;
          });
        } else {
          logger.warn(`No valid commands found for plugin: ${plugin.name}`);
        }

        if (plugin.events && Array.isArray(plugin.events)) {
          plugin.events.forEach((file) => {
            loadEvent(client, file, plugin.name);
            eventCount++;
          });
        } else {
          logger.warn(`No valid events found for plugin: ${plugin.name}`);
        }
      } catch (error) {
        logger.error(`Failed to load plugin: ${folder}`, error);
      }
    })
  );

  logger.info(
    `Plugins loaded: ${pluginCount}, Commands loaded: ${commandCount}, Events loaded: ${eventCount}`
  );
}

/**
 * @param {Object} plugin
 * @param {string} folder
 * @returns {boolean}
 */
function validatePlugin(plugin, folder) {
  if (!plugin.name || !plugin.description) {
    logger.warn(`Invalid plugin definition in folder: ${folder}`);
    return false;
  }
  return true;
}

/**
 * @param {Object} client
 * @param {string} commandPath
 * @param {string} pluginName
 */
function loadCommand(client, commandPath, pluginName) {
  try {
    const command = require(commandPath);

    if (isValidModule(command, 'command')) {
      client.commands.set(command.data.name, command);
      logger.info(`Loaded command: ${command.data.name} (${commandPath}) from plugin: ${pluginName}`);
    } else {
      logger.warn(`Invalid command file: ${commandPath}`);
    }
  } catch (error) {
    logger.error(`Failed to load command file: ${commandPath}`, error);
  }
}

/**
 * @param {Object} client
 * @param {string} eventPath
 * @param {string} pluginName
 */
function loadEvent(client, eventPath, pluginName) {
  try {
    const event = require(eventPath);

    if (isValidModule(event, 'event')) {
      const handler = (...args) => event.execute(...args, client);

      if (event.once) {
        client.once(event.name, handler);
      } else {
        client.on(event.name, handler);
      }

      logger.info(`Loaded event: ${event.name} (${eventPath}) from plugin: ${pluginName}`);
    } else {
      logger.warn(`Invalid event file: ${eventPath}`);
    }
  } catch (error) {
    logger.error(`Failed to load event file: ${eventPath}`, error);
  }
}

/**
 * @param {Object} file
 * @param {string} type
 * @returns {boolean}
 */
function isValidModule(file, type) {
  if (type === 'command') {
    return file.data && typeof file.execute === 'function';
  }
  if (type === 'event') {
    return file.name && typeof file.execute === 'function';
  }
  return false;
}

module.exports = { loadPlugins };
