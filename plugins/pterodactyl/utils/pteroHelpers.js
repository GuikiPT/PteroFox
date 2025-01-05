const axios = require('axios');
require('dotenv').config();

const PTERO_API_HOST = process.env.PTERO_API_HOST;
const PTERO_API_KEY = process.env.PTERO_API_KEY;

if (!PTERO_API_HOST || !PTERO_API_KEY) {
	throw new Error('PTERO_API_HOST or PTERO_API_KEY is not configured in the environment variables.');
}

const axiosInstance = axios.create({
	baseURL: PTERO_API_HOST,
	headers: {
		Authorization: `Bearer ${PTERO_API_KEY}`,
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

function logAxiosError(error) {
	if (error.response) {
		console.error(`[Axios Error] Response: ${error.response.status} ${error.response.statusText}`, error.response.data);
	} else if (error.request) {
		console.error('[Axios Error] No response received:', error.request);
	} else {
		console.error('[Axios Error] Request setup error:', error.message);
	}
}

async function fetchAllServers() {
	try {
		const { data } = await axiosInstance.get('/api/client');
		return data.data;
	} catch (error) {
		logAxiosError(error);
		throw new Error('Failed to fetch servers from Pterodactyl.');
	}
}

async function sendPowerAction(serverId, action) {
	try {
		await axiosInstance.post(`/api/client/servers/${serverId}/power`, { signal: action });
	} catch (error) {
		logAxiosError(error);
		throw new Error(`Failed to send power action '${action}' to server ${serverId}.`);
	}
}

async function getServerState(serverId) {
	try {
		const { data } = await axiosInstance.get(`/api/client/servers/${serverId}/resources`);
		console.log(`[Server State] Server ${serverId}: ${data.attributes.current_state}`);
		return data.attributes.current_state;
	} catch (error) {
		logAxiosError(error);
		throw new Error(`Failed to fetch server state for server ${serverId}.`);
	}
}

module.exports = {
	fetchAllServers,
	sendPowerAction,
	getServerState,
};
