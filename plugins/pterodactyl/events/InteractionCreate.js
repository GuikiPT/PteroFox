const { Events } = require('discord.js');
const { buildServerActionButtons } = require('../utils/buildServerActionButtons');
const { sendPowerAction } = require('../utils/pteroHelpers');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('pteroServerSelect')) {
      if (interaction.user.id !== process.env.OWNER_ID) {
        return interaction.reply({
          content: 'You are not authorized to use this menu.',
          ephemeral: true,
        });
      }

      const [menuTag, ephemeralStr] = interaction.customId.split('::');
      const ephemeral = ephemeralStr === 'true';

      const selectedServerId = interaction.values[0];

      const actionRows = buildServerActionButtons(selectedServerId, ephemeral);

      await interaction.update({
        content: `You selected server: \`${selectedServerId}\`\nChoose an action:`,
        components: actionRows,
      });
    }

    else if (interaction.isButton() && interaction.customId.startsWith('ptero')) {
      if (interaction.user.id !== process.env.OWNER_ID) {
        return interaction.reply({
          content: 'You are not authorized to press these buttons.',
          ephemeral: true,
        });
      }

      const [actionTag, serverId, ephemeralStr] = interaction.customId.split('::');
      const powerSignal = actionTag.replace('ptero', '').toLowerCase();
      const ephemeral = ephemeralStr === 'true';

      await interaction.deferReply({ ephemeral });
      try {
        await sendPowerAction(serverId, powerSignal);
        await interaction.editReply(`Server \`${serverId}\` has been **${powerSignal}ed** successfully!`);
      } catch (error) {
        console.error(error);
        await interaction.editReply(`Failed to **${powerSignal}** server \`${serverId}\`.\nError: ${error.message}`);
      }
    }
  },
};
