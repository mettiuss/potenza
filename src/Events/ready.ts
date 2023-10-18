import { Client, PresenceUpdateStatus, TextChannel } from 'discord.js';

export const name = 'ready';
export const once = true;
export async function execute(client: Client) {
	client.user!.setStatus(PresenceUpdateStatus.DoNotDisturb);
	client.log_channel = (await client.channels.fetch(process.env.LOG_CHANNEL!)) as TextChannel;
	console.log(`Ready! Logged in as ${client.user!.tag}`);
}
