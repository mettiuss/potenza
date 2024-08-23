import { Client, PresenceUpdateStatus, TextChannel } from 'discord.js';

export const name = 'ready';
export const once = true;
export async function execute(client: Client) {
	client.user!.setStatus(PresenceUpdateStatus.DoNotDisturb);

	// INIT channels
	client.logChannel = (await client.channels.fetch(process.env.LOG_CHANNEL!)) as TextChannel;
	client.nuoveRichiesteChannel = (await client.channels.fetch(process.env.NUOVE_RICHIESTE!)) as TextChannel;

	console.log(`Ready! Logged in as ${client.user!.tag}`);
}
