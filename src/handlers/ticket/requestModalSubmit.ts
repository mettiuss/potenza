import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalSubmitInteraction } from 'discord.js';
import { formatUser } from '../../utils/ticket.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';

export default async function (interaction: ModalSubmitInteraction) {
	const description = interaction.fields.getTextInputValue('description');
	const platform = interaction.fields.getTextInputValue('platform').toUpperCase();

	if (!['PC', 'SWITCH', 'PS', 'XBOX', 'MOBILE'].includes(platform))
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> Piattaforma non valida',
			ephemeral: true,
		});

	await interaction.reply({
		content: '<a:A_FNIT_Loading:1249346325946830971>',
		ephemeral: true,
	});

	const embed = new PotenzaEmbedBuilder(null, false)
		.setTitle(`:red_circle: Nuova richiesta di supporto (${interaction.user.tag})`)
		.setDescription(`**User:** ${formatUser(interaction.user.id)}`)
		.addProblemFields({ description, platform });

	const nuoveRichiesteMessage = await interaction.client.nuoveRichiesteChannel.send({
		content: interaction.client.settings['ticket-staff'].map((el: string) => `<@&${el}>`).join(', '),
		embeds: [embed],
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setLabel('Apri Ticket').setStyle(ButtonStyle.Success).setCustomId('ticket-open'),
				new ButtonBuilder()
					.setLabel('Ignora Ticket')
					.setStyle(ButtonStyle.Secondary)
					.setCustomId('ticket-ignore')
			),
		],
	});

	await interaction.client.mongo.ticket.insertOne({
		_id: interaction.user.id,
		message: nuoveRichiesteMessage.id,
		description,
		platform,
	});

	await interaction.editReply({
		content:
			'<:FNIT_ThumbsUp:454640434380013599> Richiesta inviata!\nPer favore, **abbi pazienza**: appena un membro dello staff sarà disponibile, arriverà in tuo aiuto.',
	});
}
