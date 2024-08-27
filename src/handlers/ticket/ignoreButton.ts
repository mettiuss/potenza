import { ButtonInteraction } from 'discord.js';
import { formatUser, hasStaffPermission } from '../../utils/ticket.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';

export default async function (interaction: ButtonInteraction) {
	if (
		!interaction.member ||
		!hasStaffPermission(interaction.member, interaction.client.settings['ticket-staff-admin'])
	)
		return;

	interaction.message.delete();

	const ticketDoc = await interaction.client.mongo.ticket.findOneAndDelete({ message: interaction.message.id });
	const user = ticketDoc ? await interaction.client.user.fetch(ticketDoc._id) : undefined;

	interaction.client.ticketLogChannel.send({
		embeds: [
			new PotenzaEmbedBuilder(interaction.guild)
				.setTitle('**Richiesta Supporto Ignorata**')
				.addWhoFields(interaction.user.id, user?.id),
		],
	});

	interaction.reply({
		content: ticketDoc ? `**Ticket ignorato per ${formatUser(ticketDoc._id)}**` : `**Ticket ignorato**`,
		ephemeral: true,
	});
}
