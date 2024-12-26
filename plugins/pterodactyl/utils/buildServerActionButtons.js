const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * @param {string} serverId
 * @param {boolean} ephemeral
 * @returns
 */
function buildServerActionButtons(serverId, ephemeral) {
  const ephemeralStr = ephemeral ? 'true' : 'false';

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`pteroStart::${serverId}::${ephemeralStr}`)
      .setLabel('Start')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`pteroStop::${serverId}::${ephemeralStr}`)
      .setLabel('Stop')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`pteroRestart::${serverId}::${ephemeralStr}`)
      .setLabel('Restart')
      .setStyle(ButtonStyle.Primary),
  );

  return [row];
}

module.exports = { buildServerActionButtons };
