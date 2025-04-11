import { Message, PartialMessage } from 'discord.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';

export async function handleTicketMessageDelete(message: Message | PartialMessage) {
	if (message.channelId != message.client.settings['ticket-richieste']) return;

	const ticketDoc = await message.client.mongo.ticket.findOneAndDelete({ message: message.id });

	if (!ticketDoc) return;

	const user = await message.client.user.fetch(ticketDoc._id);

	if (message.client.ticketLogChannel) {
		message.client.ticketLogChannel.send({
			embeds: [
				new PotenzaEmbedBuilder(message.guild)
					.setTitle('**Richiesta Supporto Ignorata**')
					.addWhoFields(undefined, user?.id),
			],
		});
	} else {
		if (message.channel.isSendable()) {
			message.channel.send(
				'<:FNIT_Stop:857617083185758208> canale di log non definito, utilizza `/settings canale-ticket-log` per definirne uno.'
			);
		}
	}
}
