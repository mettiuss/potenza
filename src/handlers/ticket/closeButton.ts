import {
	ActionRowBuilder,
	ButtonInteraction,
	ModalBuilder,
	TextChannel,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { formatCode, formatUser, fullTicketStaff, getUserChannel, hasStaffPermission } from '../../utils/ticket.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';
import { sendCloseMessage, sendLogGetTranscript } from '../../controllers/ticket/close.js';

export default async function (interaction: ButtonInteraction) {
	if (
		!interaction.member ||
		!hasStaffPermission(interaction.member, fullTicketStaff(interaction.client)) ||
		!interaction.guild ||
		!interaction.channel
	)
		return;

	const ticketDoc =
		(await interaction.client.mongo.ticket.findOne({ channel: interaction.channel.id })) ||
		(await interaction.client.mongo.ticket.findOne({ message: interaction.message.id }));

	if (!ticketDoc)
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **Ticket not found**',
			ephemeral: true,
		});

	const ticketUser = await interaction.client.users.fetch(ticketDoc._id);
	if (!ticketUser)
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **User not found**',
			ephemeral: true,
		});

	const id = `close-${ticketUser.id}-${Date.now().toString(36)}`;

	const modal = new ModalBuilder().setCustomId(id).setTitle('Chiusura ticket');

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
			filter: ({ user, customId }) => user.id === interaction.user.id && customId === id,
		})
		.then(async (submitted) => {
			if (executed || !submitted.guild) return;

			const reason = submitted.fields.getTextInputValue('reason');

			const userChannel = getUserChannel(submitted.guild, ticketUser.id);

			if (!userChannel)
				return submitted.reply({
					content: `<:FNIT_Stop:857617083185758208> L'utente ${formatUser(
						ticketUser.id
					)} non possiede nessun ticket aperto.`,
					ephemeral: true,
				});

			try {
				await submitted.reply({
					content: '<a:A_FNIT_Loading:1249346325946830971>',
					ephemeral: true,
				});
			} catch {}

			const attachment_url = await sendLogGetTranscript(
				userChannel,
				interaction.client,
				interaction.guild,
				interaction.user,
				ticketUser,
				reason
			);

			await Promise.all([
				(async () => {
					await userChannel.edit({ topic: '' });
					await userChannel.delete();
				})(),
				sendCloseMessage(submitted, ticketUser, reason),
				interaction.client.mongo.logs.insertOne({
					staff: interaction.user.id,
					action: 'close',
					at: new Date(),
				}),
			]);

			const updateEmbed = new PotenzaEmbedBuilder(null, false)
				.setTitle(`:green_circle: Richiesta chiusa`)
				.setDescription(
					`**User:** ${formatUser(ticketUser.id)}\n**Staff:** ${formatUser(
						interaction.user.id
					)}\n**Close Reason:** ${formatCode(reason)}\n**Log:** [${formatCode(
						'Log URL'
					)}](https://vindertech.mirkohubtv.it/file/?url=${attachment_url})`
				)
				.addProblemFields(ticketDoc);

			const nuoveRichiesteChannel = (await interaction.client.channels.fetch(
				interaction.client.settings['ticket-richieste']
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
