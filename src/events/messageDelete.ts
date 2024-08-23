import { Message, PartialMessage } from 'discord.js';
import { baseEmbed } from '../utils/ticket.js';

export const name = 'messageDelete';
export const once = false;
export async function execute(message: Message | PartialMessage) {
	console.log(message.channelId, process.env.NUOVE_RICHIESTE);
	if (message.channelId != process.env.NUOVE_RICHIESTE) return;

	const ticketDoc = await message.client.mongo.ticket.findOneAndDelete({ message: message.id });

	if (!ticketDoc) return;

	const user = await message.client.user.fetch(ticketDoc._id);

	message.client.logChannel.send({
		embeds: [
			baseEmbed(message.client, message.guild, user)
				.setTitle('**Richiesta Supporto Ignorata**')
				.addFields({
					name: 'Utente',
					value: user ? `<@${user.id}> | ID: ${user.id}` : 'sconosciuto',
					inline: false,
				}),
		],
	});
}
