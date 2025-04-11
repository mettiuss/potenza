import { Client, PresenceUpdateStatus, TextChannel } from 'discord.js';
import { clearEmptyChannels } from '../controllers/ticket/clearEmptyChannels.js';
import { initializeTicketChannels } from '../controllers/ticket/initializeTicketChannels.js';

export const name = 'ready';
export const once = true;
export async function execute(client: Client) {
	client.user!.setStatus(PresenceUpdateStatus.DoNotDisturb);

	console.log(`Ready! Logged in as ${client.user!.tag}`);

	setInterval(clearEmptyChannels, 60 * 1000, client);
	setInterval(initializeTicketChannels, 60 * 1000, client);
}
