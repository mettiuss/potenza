import {
	ActionRowBuilder,
	ButtonInteraction,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import ticketClose from '../../Functions/Ticket/close.js';
import { formatCode, formatUser } from '../../utils.js';
import axios from 'axios';

export async function handleTicketCloseButton(interaction: ButtonInteraction) {
	const embed = interaction.message.embeds.at(0)!;

	const userId = embed.description!.split('<@')[1].split('>')[0]!;
	const user = await interaction.client.users.fetch(userId);
	if (!user) {
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **User not found**',
			ephemeral: true,
		});
	}

	const modal = new ModalBuilder().setCustomId(`close-${userId}`).setTitle('Chiusura ticket');

	// Create the text input components
	const descriptionInput = new TextInputBuilder()
		.setCustomId('reason')
		.setLabel('Motivazione')
		.setStyle(TextInputStyle.Paragraph);

	// Add inputs to the modal
	modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput));

	// Show the modal to the user
	await interaction.showModal(modal);

	const submitted = await interaction.awaitModalSubmit({
		time: 5 * 60 * 1000,
		filter: ({ user, customId }) => user.id === interaction.user.id && customId === `close-${userId}`,
	});

	let executed = false;

	if (submitted && !executed) {
		const reason = submitted.fields.getTextInputValue('reason');

		try {
			await submitted.reply({
				content: `**Sto chiudendo il ticket per ${formatUser(user!.id)} con motivazione: ${formatCode(
					reason
				)}**`,
				ephemeral: true,
			});
		} catch {
			return;
		}

		const attachment_url = await ticketClose(submitted, user!, reason);

		if (!attachment_url) return;

		const description = embed.description?.split('**Channel:**')[0];

		const updateEmbed = new EmbedBuilder()
			.setColor('#00e3ff')
			.setTitle(`:green_circle: Richiesta chiusa`)
			.setDescription(
				description +
					`**Close Reason:** ${formatCode(reason)}\n**Log:** [${formatCode(
						'Log URL'
					)}](https://vindertech.itzmirko.it/file/?url=${attachment_url})`
			)
			.setFields(embed.fields);

		await interaction.message.edit({
			embeds: [updateEmbed],
			components: [],
		});
		
		const url = 'https://vindertech.itzmirko.it/file/?url=' + encodeURIComponent(attachment_url);

		try {
			await axios.get(url);
		} catch {
			console.log(`Error making GET request`);
		}
		executed = true;
	}
}
