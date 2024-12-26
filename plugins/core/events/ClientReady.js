const Discord = require('discord.js');
const logger = require('../../../utils/logger');

module.exports = {
  name: Discord.Events.ClientReady,
  once: true,
  execute(client) {
    
    client.user.setPresence({
      activities: [{ name: 'Pterodactyl Panel', type: Discord.ActivityType.Watching }],
      status: 'idle',
    });
    
    logger.info(`Bot is ready! Logged in as ${client.user.tag}`);
  },
};
