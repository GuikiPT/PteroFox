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
		.setName('power_manager')
		.setDescription('Select and manage Pterodactyl server power actions.')
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
			option.setName('hidden').setDescription('Make this menu ephemeral (only you see it). Defaults to false.')
		),

	async execute(interaction) {
		const authorizedUsers = process.env.AUTHORIZED_USER_IDS?.split(',') || [];
		if (!authorizedUsers.includes(interaction.user.id)) {
			return interaction.reply({
				content: 'You are not authorized to use this command.',
				ephemeral: true,
			});
		}

		const ephemeral = interaction.options.getBoolean('hidden') ?? false;

		await interaction.deferReply({ ephemeral });

		if (!process.env.PTERO_API_HOST || !process.env.PTERO_API_KEY) {
			return interaction.editReply('Pterodactyl API host or key is not configured. Please check your environment variables.');
		}

		let servers;
		try {
			servers = await fetchAllServers();
		} catch (error) {
			console.error(`Error fetching servers: ${error.message}`, error);
			return interaction.editReply('An error occurred while fetching the server list. Please try again later.');
		}

		if (!servers || servers.length === 0) {
			return interaction.editReply('No servers found or accessible with this API key.');
		}

		if (servers.length > 25) {
			return interaction.editReply(`Too many servers to display (${servers.length}). Please reduce the number of servers accessible via your API key.`);
		}

		const options = servers.map((srv) => ({
			label: `${srv.attributes.name} (ID: ${srv.attributes.identifier})`,
			value: `${srv.attributes.identifier}::${srv.attributes.name}`,
			description: `Server ID: ${srv.attributes.identifier}`,
		}));

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(`pteroServerSelect::${ephemeral}`)
			.setPlaceholder('Select a server to manage...')
			.addOptions(options);

		const row = new ActionRowBuilder().addComponents(selectMenu);

		await interaction.editReply({
			content: `Found ${servers.length} servers. Choose one to manage:`,
			components: [row],
		});
	},
};
