const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
} = require('discord.js');
const { fetchAllServers } = require('../utils/pteroHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pteromanage')
    .setDescription('Manage your Pterodactyl servers via an interactive menu')
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ])
    .setContexts([
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ])
    .addBooleanOption((option) =>
      option
        .setName('hidden')
        .setDescription(
          'Whether to make this menu ephemeral (only you see it). Defaults to false.'
        )
    ),

  async execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: 'You are not authorized to use this command.',
        ephemeral: true,
      });
    }

    const ephemeralOption = interaction.options.getBoolean('hidden');
    const ephemeral = ephemeralOption ?? false;

    await interaction.deferReply({ ephemeral });

    let servers;
    try {
      servers = await fetchAllServers();
    } catch (error) {
      console.error(error);
      return interaction.editReply(
        'Failed to fetch servers from Pterodactyl. Please try again later.'
      );
    }

    if (!servers || servers.length === 0) {
      return interaction.editReply(
        'No servers found or accessible with this API key.'
      );
    }

    const ephemeralStr = ephemeral ? 'true' : 'false';

    const options = servers.map((srv) => ({
      label: srv.attributes.name,
      value: srv.attributes.identifier,
      description: `ID: ${srv.attributes.identifier}`,
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`pteroServerSelect::${ephemeralStr}`)
      .setPlaceholder('Select a server to manage...')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.editReply({
      content: 'Choose a server to manage:',
      components: [row],
    });
  },
};
