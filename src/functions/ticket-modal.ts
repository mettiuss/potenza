import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
	GuildMember,
	ModalBuilder,
	ModalSubmitInteraction,
	TextChannel,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

export async function showModal(interaction: ButtonInteraction) {
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

export async function handleModal(interaction: ModalSubmitInteraction) {
	let description = interaction.fields.getTextInputValue('description');
	let platform = interaction.fields.getTextInputValue('platform');
	if (!['pc', 'switch', 'ps', 'xbox', 'mobile'].includes(platform.toLowerCase()))
		return interaction.reply({
			content: '**<:FNIT_Stop:857617083185758208> Piattaforma non valida**',
			ephemeral: true,
		});

	const richiesteUtentiChannel = (await interaction.client.channels.fetch('683363814137266207')) as TextChannel;
	let richesteUtentiMessage = await richiesteUtentiChannel.send({
		embeds: [
			new EmbedBuilder()
				.setColor('#00e3ff')
				.setTitle('Nuova Richiesta di Supporto')
				.setDescription(
					`Ehi <@${interaction.user.id}>, la tua richiesta è in lavorazione!\n\nPer favore, **abbi pazienza**: appena un membro dello staff sarà disponibile, arriverà in tuo aiuto. Sii paziente!\n**Descrizione**\n` +
						'```\n' +
						description +
						'\n```\n**Piattaforma**' +
						'```' +
						platform +
						'\n```\n'
				),
		],
	});
	const nuoveRichiesteChannel = (await interaction.client.channels.fetch('807985160703180850')) as TextChannel;
	nuoveRichiesteChannel.send({
		embeds: [
			new EmbedBuilder({
				description: '[`Nuova richiesta di supporto per voi`](' + richesteUtentiMessage.url + ')',
				footer: { text: 'Interagisci con il bottone per aprire la richiesta' },
				color: 0x00e3ff,
			}),
		],
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setLabel('Apri Ticket').setStyle(ButtonStyle.Success).setCustomId('ticket-open')
			),
		],
	});
	return await interaction.reply({
		content:
			'<:FNIT_ThumbsUp:454640434380013599> Richiesta inviata!\nPer favore, **abbi pazienza**: appena un membro dello staff sarà disponibile, arriverà in tuo aiuto.',
		ephemeral: true,
	});
}
