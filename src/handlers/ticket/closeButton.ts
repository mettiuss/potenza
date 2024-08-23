import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	ColorResolvable,
	EmbedBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
	TextChannel,
	TextInputBuilder,
	TextInputStyle,
	User,
} from 'discord.js';
import { formatCode, formatUser, hasStaffPermission } from '../../utils/utils.js';
import { baseEmbed, getUserChannel } from '../../utils/ticket.js';
import discordTranscripts from 'discord-html-transcripts';
import axios from 'axios';

export async function deleteTicketChannel(channel: TextChannel) {
	await channel.edit({ topic: '' });
	await channel.delete();
}

export async function sendCloseMessage(
	interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
	user: User,
	reason: string
) {
	try {
		const userId = interaction.user.id; // UserID del Vindertech
		const LikeButton = new ButtonBuilder()
			.setCustomId(`feedback_like_${userId}`)
			.setLabel('👍')
			.setStyle(ButtonStyle.Primary);
		const NoLikeButton = new ButtonBuilder()
			.setCustomId(`feedback_nolike_${userId}`)
			.setLabel('👎')
			.setStyle(ButtonStyle.Danger);

		await user.send({
			embeds: [
				baseEmbed(interaction, user)
					.setTitle('**Richiesta Supporto Chiusa**')
					.addFields(
						{
							name: 'Staffer',
							value: `<@${interaction.user.id}> | ID: ` + '`' + interaction.user.id + '`',
							inline: false,
						},
						{
							name: 'Motivazione',
							value: reason!,
							inline: false,
						},
						{
							name: '**Feedback**',
							value: `Ci auguriamo che il servizio di supporto Vindertech ti sia stato utile nella risoluzione del tuo problema e abbia soddisfatto le tue aspettative. 
**La tua opinione conta per noi!**
Ti invitiamo a lasciare un Feedback qui di seguito per permetterci di migliorare sempre di più il servizio offerto e continuare ad aiutare tanti altri utenti come te. Grazie in anticipo!`,
							inline: false,
						}
					),
			],
			components: [new ActionRowBuilder<ButtonBuilder>().addComponents(LikeButton, NoLikeButton)],
		});
	} catch {}
}

export default async function (interaction: ButtonInteraction) {
	if (!hasStaffPermission(interaction) || !interaction.guild || !interaction.channel) return;

	const ticketDoc =
		(await interaction.client.mongo.ticket.findOne({ channel: interaction.channel.id })) ||
		(await interaction.client.mongo.ticket.findOne({ message: interaction.message.id }));

	const ticketUser = await interaction.client.users.fetch(ticketDoc._id);
	if (!ticketUser)
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **User not found**',
			ephemeral: true,
		});

	const modal = new ModalBuilder().setCustomId(`close-${ticketUser.id}`).setTitle('Chiusura ticket');

	// Create the text input components
	const descriptionInput = new TextInputBuilder()
		.setCustomId('reason')
		.setLabel('Motivazione')
		.setStyle(TextInputStyle.Paragraph)
		.setMaxLength(1010);

	// Add inputs to the modal
	modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput));

	// Show the modal to the user
	await interaction.showModal(modal);

	let executed = false;

	interaction
		.awaitModalSubmit({
			time: 5 * 60 * 1000,
			filter: ({ user, customId }) => user.id === interaction.user.id && customId === `close-${ticketUser.id}`,
		})
		.then(async (submitted) => {
			if (executed || !submitted.guild) return;

			const reason = submitted.fields.getTextInputValue('reason');

			const userChannel = getUserChannel(submitted.guild, ticketUser.id);

			if (!userChannel)
				return submitted.reply({
					content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(
						ticketUser.id
					)} non possiede nessun ticket aperto.**`,
					ephemeral: true,
				});

			try {
				await submitted.reply({
					content: '<a:A_FNIT_Loading:1249346325946830971>',
					ephemeral: true,
				});
			} catch {}

			deleteTicketChannel(userChannel);

			sendCloseMessage(submitted, ticketUser, reason);

			interaction.client.mongo.logs.insertOne({
				staff: interaction.user.id,
				action: 'close',
				at: new Date(),
			});

			const attachment = await discordTranscripts.createTranscript(userChannel, {
				saveImages: true,
				poweredBy: false,
			});

			const logMessage = await interaction.client.logChannel.send({
				embeds: [
					baseEmbed(interaction, ticketUser)
						.setTitle('**Richiesta Supporto Chiusa**')
						.addFields(
							{
								name: 'Staffer',
								value: `<@${interaction.user.id}> | ID: ${interaction.user.id}`,
								inline: false,
							},
							{
								name: 'Utente',
								value: `<@${ticketUser.id}> | ID: ${ticketUser.id}`,
								inline: false,
							},
							{
								name: 'Motivazione',
								value: reason,
								inline: false,
							}
						),
				],
				files: [attachment],
			});

			const attachment_url = logMessage.attachments.at(0)!.url;

			const url = 'https://vindertech.itzmirko.it/file/?url=' + encodeURIComponent(attachment_url);
			axios.get(url);

			const updateEmbed = new EmbedBuilder()
				.setColor(interaction.client.color as ColorResolvable)
				.setTitle(`:green_circle: Richiesta chiusa`)
				.setDescription(
					`**User:** ${formatUser(ticketUser.id)}\n**Staff:** ${formatUser(
						interaction.user.id
					)}\n**Close Reason:** ${formatCode(reason)}\n**Log:** [${formatCode(
						'Log URL'
					)}](https://vindertech.mirkohubtv.it/file/?url=${attachment_url})`
				)
				.setFields(
					{
						name: 'Descrizione',
						value: '```\n' + ticketDoc.description + '\n```',
					},
					{ name: 'Piattaforma', value: '```\n' + ticketDoc.platform + '\n```' }
				);

			const nuoveRichiesteChannel = (await interaction.client.channels.fetch(
				process.env.NUOVE_RICHIESTE!
			)) as TextChannel;
			const message = await nuoveRichiesteChannel.messages.fetch(ticketDoc.message);

			await message.edit({
				embeds: [updateEmbed],
				components: [],
			});

			await interaction.client.mongo.ticket.deleteOne({ _id: ticketUser.id });

			try {
				await submitted.editReply(
					`**Ticket chiuso per ${formatUser(ticketUser.id)} con motivazione: ${formatCode(reason)}**`
				);
			} catch {}

			executed = true;
		})
		.catch((err) => console.error(err));
}
