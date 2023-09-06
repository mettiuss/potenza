import { Client, PresenceUpdateStatus, TextChannel } from 'discord.js';

export const name = 'ready';
export const once = true;
export async function execute(client: Client) {
	client.user!.setStatus(PresenceUpdateStatus.DoNotDisturb);
	client.log_channel = (await client.channels.fetch('721809334178414614')) as TextChannel;
	console.log(`Ready! Logged in as ${client.user!.tag}`);
}
