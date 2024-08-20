import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { getUserChannel } from '../../Functions/Ticket/utils.js';

export async function handleRequestButton(interaction: ButtonInteraction) {
	const doc = await interaction.client.mongo.block.findOne({ _id: interaction.user.id });
	if (doc)
		return interaction.reply({
			content: `Sei stato/a bloccato/a dal servizio Vindertech`,
			ephemeral: true,
		});

	const userChannel = getUserChannel(interaction.guild!, interaction.user.id);

	if (userChannel.size !== 0)
		return interaction.reply({
			content: `Hai già un ticket aperto, per ulteriori problemi scrivi direttamente nel canale <#${
				userChannel.at(0)!.id
			}>`,
			ephemeral: true,
		});

	const modal = new ModalBuilder().setCustomId('vindertech').setTitle('Richiesta Supporto');

	// Create the text input components
	const descriptionInput = new TextInputBuilder()
		.setCustomId('description')
		.setLabel('descrizione del problema')
		.setStyle(TextInputStyle.Paragraph);

	const platformInput = new TextInputBuilder()
		.setCustomId('platform')
		.setLabel('Piattaforma')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('PC, XBOX, PS, Mobile, Switch')
		.setMaxLength(10);

	const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);
	const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(platformInput);

	// Add inputs to the modal
	modal.addComponents(firstActionRow, secondActionRow);

	// Show the modal to the user
	return await interaction.showModal(modal);
}
