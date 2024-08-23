import { ButtonInteraction } from 'discord.js';
import { formatUser, hasStaffPermission } from '../../utils/utils.js';
import { baseEmbed } from '../../utils/ticket.js';

export default async function (interaction: ButtonInteraction) {
	if (!hasStaffPermission(interaction, true)) return;

	interaction.message.delete();

	const ticketDoc = await interaction.client.mongo.ticket.findOneAndDelete({ message: interaction.message.id });
	const user = ticketDoc ? await interaction.client.user.fetch(ticketDoc._id) : undefined;

	interaction.client.logChannel.send({
		embeds: [
			baseEmbed(interaction, user)
				.setTitle('**Richiesta Supporto Ignorata**')
				.addFields(
					{
						name: 'Staffer',
						value: `<@${interaction.user.id}> | ID: ${interaction.user.id}`,
						inline: false,
					},
					{
						name: 'Utente',
						value: user ? `<@${user.id}> | ID: ${user.id}` : 'sconosciuto',
						inline: false,
					}
				),
		],
	});

	interaction.reply({
		content: ticketDoc ? `**Ticket ignorato per ${formatUser(ticketDoc._id)}**` : `**Ticket ignorato**`,
		ephemeral: true,
	});
}
