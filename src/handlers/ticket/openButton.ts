import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ColorResolvable,
	EmbedBuilder,
} from 'discord.js';
import { formatUser, hasStaffPermission } from '../../utils/utils.js';
import { baseEmbed, createChannelCreateOptions } from '../../utils/ticket.js';

export default async function (interaction: ButtonInteraction) {
	if (!hasStaffPermission(interaction) || !interaction.guild) return;

	const ticketDoc = await interaction.client.mongo.ticket.findOne({ message: interaction.message.id });

	const user = await interaction.client.users.fetch(ticketDoc._id);
	if (!user)
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **User not found**',
			ephemeral: true,
		});

	await interaction.reply({
		content: '<a:A_FNIT_Loading:1249346325946830971>',
		ephemeral: true,
	});

	const ticketChannel = await interaction.guild.channels.create(createChannelCreateOptions(interaction, user));
	if (!ticketChannel) return;

	ticketChannel.send({
		embeds: [
			baseEmbed(interaction.client, interaction.guild, user)
				.setTitle('**Richiesta Supporto Accettata**')
				.setDescription(
					`Hey <@${user.id}>, la tua richiesta è stata accettata e per questo abbiamo aperto un ticket. Un membro del team Vindertech ti risponderà il prima possibile.`
				)
				.addFields(
					{
						name: '**Descrizione**',
						value: '```\n' + ticketDoc.description + '\n```',
					},
					{
						name: '**Domande Frequenti**',
						value: 'Se hai bisogno delle domande e risposte frequenti, [clicca qui](https://www.epicgames.com/help/it/fortnite-c75).',
					},
					{
						name: '**Supporto Tecnico**',
						value: `Se hai bisogno di aiuto in gioco, contatta l'assistenza [cliccando qui](https://www.epicgames.com/help/it/contact-us).`,
					},
					{
						name: '**Bacheca Trello**',
						value: 'Puoi consultare i problemi già noti ad Epic Games [cliccando qui](https://trello.com/b/zXyhyOIs/fortnite-italia-community-issues).',
					}
				),
		],
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setLabel('Chiudi Ticket').setStyle(ButtonStyle.Danger).setCustomId('ticket-close')
			),
		],
	});

	interaction.client.logChannel.send({
		embeds: [
			baseEmbed(interaction.client, interaction.guild, user)
				.setTitle('**Richiesta Supporto Aperta**')
				.addFields(
					{
						name: 'Staffer',
						value: `<@${interaction.user.id}> | ID: ${interaction.user.id}`,
						inline: false,
					},
					{
						name: 'Utente',
						value: `<@${user.id}> | ID: ${user.id}`,
						inline: false,
					}
				),
		],
	});

	interaction.client.mongo.logs.insertOne({
		staff: interaction.user.id,
		action: 'open',
		at: new Date(),
	});

	const updateEmbed = new EmbedBuilder()
		.setColor(interaction.client.color as ColorResolvable)
		.setTitle(`:blue_circle: Richiesta di ${user.tag} presa in carico da ${interaction.user.tag}`)
		.setDescription(
			`**User:** ${formatUser(user.id)}\n**Staff:** ${formatUser(interaction.user.id)}\n**Channel:** <#${
				ticketChannel.id
			}>`
		)
		.setFields(
			{
				name: 'Descrizione',
				value: '```\n' + ticketDoc.description + '\n```',
			},
			{ name: 'Piattaforma', value: '```\n' + ticketDoc.platform + '\n```' }
		);

	await interaction.client.mongo.ticket.updateOne(
		{ message: interaction.message.id },
		{ $set: { channel: ticketChannel.id, staff: interaction.user.id } }
	);

	await interaction.message.edit({
		content: '',
		embeds: [updateEmbed],
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setLabel('Chiudi Ticket').setStyle(ButtonStyle.Danger).setCustomId('ticket-close')
			),
		],
	});

	interaction.editReply({
		content: `**Ticket aperto per ${formatUser(user.id)}**`,
	});
}
