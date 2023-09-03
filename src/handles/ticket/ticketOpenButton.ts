import { ButtonInteraction, TextChannel } from 'discord.js';
import ticketOpen from '../../ticket/open.js';
import { execute } from '../../utils.js';

export async function handleTicketOpenButton(interaction: ButtonInteraction) {
	const richiesteUtentiChannel = (await interaction.client.channels.fetch('683363814137266207')) as TextChannel;

	const messageId = interaction.message.embeds[0]!.description!.split('(')[1].split(')')[0].split('/').at(-1)!;

	const richiestaUtenteMessage = await execute(richiesteUtentiChannel.messages.fetch(messageId));

	if (!richiestaUtenteMessage) {
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **Message not found**',
			ephemeral: true,
		});
	}

	const userId = richiestaUtenteMessage.embeds[0].description!.split('<@')[1].split('>')[0]!;
	const user = await interaction.guild?.members.fetch(userId);
	if (!user) {
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **User not found**',
			ephemeral: true,
		});
	}

	await ticketOpen(interaction, user.user, richiestaUtenteMessage);
}
