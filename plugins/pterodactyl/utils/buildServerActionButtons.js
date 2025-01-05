const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Builds action buttons for managing server power.
 *
 * @param {string} serverId - The server ID.
 * @param {string} serverName - The server name.
 * @param {boolean} ephemeral - Whether the buttons should be ephemeral.
 * @param {string} [serverState] - The current state of the server (e.g., running, offline).
 * @returns {ActionRowBuilder[]} Array of ActionRowBuilder containing buttons.
 */
function buildServerActionButtons(serverId, serverName, ephemeral, serverState) {
	if (!serverId || !serverName) {
		throw new Error('Invalid serverId or serverName passed to buildServerActionButtons.');
	}

	const ephemeralStr = ephemeral ? 'true' : 'false';
	const sanitizedServerName = serverName.replace(/[^a-zA-Z0-9-_]/g, '');

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(`pteroStart::${serverId}::${sanitizedServerName}::${ephemeralStr}`)
			.setLabel('Start')
			.setStyle(ButtonStyle.Success)
			.setDisabled(serverState === 'running'),

		new ButtonBuilder()
			.setCustomId(`pteroStop::${serverId}::${sanitizedServerName}::${ephemeralStr}`)
			.setLabel('Stop')
			.setStyle(ButtonStyle.Danger)
			.setDisabled(serverState === 'offline'),

		new ButtonBuilder()
			.setCustomId(`pteroRestart::${serverId}::${sanitizedServerName}::${ephemeralStr}`)
			.setLabel('Restart')
			.setStyle(ButtonStyle.Primary)
	);

	return [row];
}

module.exports = { buildServerActionButtons };
