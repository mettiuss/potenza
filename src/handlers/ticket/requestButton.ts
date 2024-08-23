import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export default async function (interaction: ButtonInteraction) {
	if (await interaction.client.mongo.block.findOne({ _id: interaction.user.id }))
		return interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> Sei stato/a bloccato/a dal servizio Vindertech.`,
			ephemeral: true,
		});

	const ticketDoc = await interaction.client.mongo.ticket.findOne({ _id: interaction.user.id });

	if (ticketDoc) {
		if (ticketDoc.channel) {
			return interaction.reply({
				content: `<:FNIT_Stop:857617083185758208> Hai già un ticket aperto, per ulteriori problemi scrivi direttamente nel canale <#${ticketDoc.channel}>`,
				ephemeral: true,
			});
		}
		return interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> Hai già inviato una richiesta al servizio Vindertech, sii paziente, a breve riceverai una risposta.`,
			ephemeral: true,
		});
	}

	const modal = new ModalBuilder().setCustomId('request').setTitle('Richiesta Supporto');

	// Create the text input components
	const descriptionInput = new TextInputBuilder()
		.setCustomId('description')
		.setLabel('descrizione del problema')
		.setStyle(TextInputStyle.Paragraph)
		.setMaxLength(1010);

	const platformInput = new TextInputBuilder()
		.setCustomId('platform')
		.setLabel('Piattaforma')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('PC, XBOX, PS, Mobile, Switch')
		.setMaxLength(10);

	// Add inputs to the modal
	modal.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
		new ActionRowBuilder<TextInputBuilder>().addComponents(platformInput)
	);

	// Show the modal to the user
	return await interaction.showModal(modal);
}
