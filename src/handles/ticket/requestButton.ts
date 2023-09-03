import {
	ActionRowBuilder,
	ButtonInteraction,
	GuildMember,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

export async function handleRequestButton(interaction: ButtonInteraction) {
	if (!(interaction.member instanceof GuildMember)) return;

	let doc = await interaction.client.mongo.findOne({ _id: interaction.member.id });
	if (doc)
		return interaction.reply({
			content: `Sei stato/a bloccato/a dal servizio Vindertech`,
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
