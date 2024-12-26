const { listFiles } = require('../../utils/fileUtils');
const path = require('path');
const fs = require('fs');

const excludedCommands = [];
const excludedEvents = [];

const commandsPath = path.resolve(__dirname, 'commands');
const eventsPath = path.resolve(__dirname, 'events');

module.exports = {
  name: 'Core',
  description: 'Bot Core Functionality.',
  commands: fs.existsSync(commandsPath) ? listFiles(commandsPath, excludedCommands, true) : [],
  events: fs.existsSync(eventsPath) ? listFiles(eventsPath, excludedEvents, true) : [],
};
