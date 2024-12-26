const axios = require('axios');
require('dotenv').config();

const PTERO_API_HOST = process.env.PTERO_API_HOST;
const PTERO_API_KEY  = process.env.PTERO_API_KEY;

async function fetchAllServers() {
  try {
    const { data } = await axios.get(`${PTERO_API_HOST}/api/client`, {
      headers: {
        Authorization: `Bearer ${PTERO_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    return data.data;
  } catch (error) {
    console.error(error?.response?.data || error);
    throw new Error('Failed to fetch servers from Pterodactyl.');
  }
}

async function sendPowerAction(serverId, action) {
  try {
    await axios.post(
      `${PTERO_API_HOST}/api/client/servers/${serverId}/power`,
      { signal: action },
      {
        headers: {
          Authorization: `Bearer ${PTERO_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(error?.response?.data || error);
    throw new Error(
      error?.response?.data?.errors?.[0]?.detail ||
      `Failed to send power action '${action}' to server ${serverId}.`
    );
  }
}

module.exports = {
  fetchAllServers,
  sendPowerAction,
};
