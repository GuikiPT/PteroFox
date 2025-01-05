const { Events } = require('discord.js');
const { buildServerActionButtons } = require('../utils/buildServerActionButtons');
const { sendPowerAction, getServerState } = require('../utils/pteroHelpers');

function isAuthorized(userId) {
	const authorizedUsers = process.env.AUTHORIZED_USER_IDS?.split(',') || [];
	return authorizedUsers.includes(userId);
}

function logError(context, error, userId) {
	console.error(`[${context}] Error by user ${userId}:`, error);
}

async function handleMenuSelection(interaction) {
	const [menuTag, ephemeralStr] = interaction.customId.split('::');
	const ephemeral = ephemeralStr === 'true';

	const [selectedServerId, selectedServerName] = interaction.values[0].split('::');
	if (!selectedServerId || !selectedServerName) {
		return interaction.reply({
			content: 'Invalid server data received. Please try again.',
			ephemeral: true,
		});
	}

	let serverState;
	try {
		serverState = await getServerState(selectedServerId);
	} catch (error) {
		return interaction.reply({
			content: 'Failed to retrieve server state. Please try again later.',
			ephemeral: true,
		});
	}

	const actionRows = buildServerActionButtons(selectedServerId, selectedServerName, ephemeral, serverState);

	await interaction.update({
		content: `You selected server: \`${selectedServerName} (${selectedServerId})\`\nChoose an action:`,
		components: actionRows,
	});
}

async function handleButtonPress(interaction) {
	const [actionTag, serverId, serverName, ephemeralStr] = interaction.customId.split('::');
	const powerSignal = actionTag.replace('ptero', '').toLowerCase();
	const ephemeral = ephemeralStr === 'true';

	if (!serverId || !serverName) {
		return interaction.reply({
			content: 'Invalid server action data received. Please try again.',
			ephemeral: true,
		});
	}

	await interaction.deferReply({ ephemeral });
	try {
		await sendPowerAction(serverId, powerSignal);
		await interaction.editReply(`Server \`${serverName} (${serverId})\` has been **${powerSignal}ed** successfully!`);
	} catch (error) {
		logError('sendPowerAction', error, interaction.user.id);
		await interaction.editReply(`Failed to **${powerSignal}** server \`${serverName} (${serverId})\`.\nError: ${error.message}`);
	}
}

module.exports = {
	name: Events.InteractionCreate,

	async execute(interaction) {
		if (!isAuthorized(interaction.user.id)) {
			return interaction.reply({
				content: 'You are not authorized to perform this action.',
				ephemeral: true,
			});
		}

		try {
			if (interaction.isStringSelectMenu() && interaction.customId.startsWith('pteroServerSelect')) {
				await handleMenuSelection(interaction);
			} else if (interaction.isButton() && interaction.customId.startsWith('ptero')) {
				await handleButtonPress(interaction);
			}
		} catch (error) {
			logError('InteractionHandler', error, interaction.user.id);
			return interaction.reply({
				content: 'An error occurred while processing your request. Please try again later.',
				ephemeral: true,
			});
		}
	},
};
