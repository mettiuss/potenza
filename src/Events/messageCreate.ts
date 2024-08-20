import { Message } from 'discord.js';

export const name = 'messageCreate';
export const once = false;
export async function execute(message: Message) {
	if (message.author.id === '710078958036582471' && message.channel.id === '602075899549974539')
		await message.delete();
}
