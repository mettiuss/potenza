import { CategoryChannel, ChannelType, Client, TextChannel } from 'discord.js';

export async function initializeTicketChannels(client: Client) {
	try {
		client.ticketLogChannel = (await client.channels.fetch(client.settings['ticket-log'])) as TextChannel;
	} catch {
		client.ticketLogChannel = null;
	}
	try {
		client.nuoveRichiesteChannel = (await client.channels.fetch(
			client.settings['ticket-richieste']
		)) as TextChannel;
	} catch {
		client.nuoveRichiesteChannel = null;
	}
}
