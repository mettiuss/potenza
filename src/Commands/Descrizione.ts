import {
	ActionRowBuilder,
	ApplicationCommandType,
	MessageContextMenuCommandInteraction,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { ContextMenuCommandBuilder } from '@discordjs/builders';

export const data = new ContextMenuCommandBuilder().setName('Descrizione').setType(ApplicationCommandType.Message);
export async function execute(interaction: MessageContextMenuCommandInteraction) {
	const modal = new ModalBuilder().setCustomId('description').setTitle('Descrizione Problema');

	let description = await interaction.client.mongo.descriptions.findOne({
		_id: interaction.targetMessage.channel.id,
	});

	if (description) {
		description = description.description.replaceAll('```\n', '').replaceAll('\n```', '');
	} else {
		description = 'Nessuna descrizione';
	}

	// Create the text input components
	const descriptionInput = new TextInputBuilder()
		.setCustomId('reason')
		.setLabel('Descrizione')
		.setStyle(TextInputStyle.Paragraph)
		.setValue(description);

	// Add inputs to the modal
	modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput));

	// Show the modal to the user
	await interaction.showModal(modal);

	const submitted = await interaction.awaitModalSubmit({
		time: 5 * 60 * 1000,
		filter: ({ customId }) => customId === `description`,
	});

	if (submitted) {
		await submitted.deferUpdate();
	}
}
