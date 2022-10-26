import { Client, PresenceUpdateStatus } from 'discord.js';

export const name = 'ready';
export const once = true;
export async function execute(client: Client) {
	client.user!.setStatus(PresenceUpdateStatus.DoNotDisturb);
	console.log(`Ready! Logged in as ${client.user!.tag}`);
}
