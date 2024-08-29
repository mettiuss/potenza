import { Client, PresenceUpdateStatus, TextChannel } from 'discord.js';
import { clearEmptyChannels } from '../controllers/ticket/clearEmptyChannels.js';

export const name = 'ready';
export const once = true;
export async function execute(client: Client) {
	client.user!.setStatus(PresenceUpdateStatus.DoNotDisturb);

	// INIT channels
	client.ticketLogChannel = (await client.channels.fetch(client.settings['ticket-log'])) as TextChannel;
	client.nuoveRichiesteChannel = (await client.channels.fetch(client.settings['ticket-richieste'])) as TextChannel;

	console.log(`Ready! Logged in as ${client.user!.tag}`);

	setInterval(clearEmptyChannels, 60 * 1000, client);
}
