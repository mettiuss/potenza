import { Message } from 'discord.js';

export const name = 'messageCreate';
export const once = false;
export async function execute(message: Message) {
	if (message.author.id === '710078958036582471' && message.channel.id === '602075899549974539')
		await message.delete();
	if (message.author.id === '707165674845241344' && message.content === 'ping') {
		await message.channel.send(`Pong! ${message.client.ws.ping}`);
	}
}
