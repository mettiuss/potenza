import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ModalSubmitInteraction,
	TextChannel,
} from 'discord.js';

export async function handleRequestModalSubmit(interaction: ModalSubmitInteraction) {
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
