import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ColorResolvable,
	EmbedBuilder,
	ModalSubmitInteraction,
	TextChannel,
} from 'discord.js';
import { formatUser } from '../../utils.js';

export async function handleRequestModalSubmit(interaction: ModalSubmitInteraction) {
	const description = interaction.fields.getTextInputValue('description');
	const platform = interaction.fields.getTextInputValue('platform');
	if (!['pc', 'switch', 'ps', 'xbox', 'mobile'].includes(platform.toLowerCase()))
		return interaction.reply({
			content: '**<:FNIT_Stop:857617083185758208> Piattaforma non valida**',
			ephemeral: true,
		});

	const richiesteUtentiChannel = (await interaction.client.channels.fetch(
		process.env.RICHIESTE_UTENTI!
	)) as TextChannel;

	const embed = new EmbedBuilder()
		.setColor(interaction.client.color as ColorResolvable)
		.setTitle('Nuova Richiesta di Supporto')
		.setDescription(
			`Ehi <@${interaction.user.id}>, la tua richiesta è in lavorazione!\n\nPer favore, **abbi pazienza**: appena un membro dello staff sarà disponibile, arriverà in tuo aiuto. Sii paziente!`
		)
		.setFields(
			{
				name: 'Descrizione',
				value: '```\n' + description + '\n```',
			},
			{ name: 'Piattaforma', value: '```\n' + platform + '\n```' }
		);

	await richiesteUtentiChannel.send({
		embeds: [embed],
	});
	const nuoveRichiesteChannel = (await interaction.client.channels.fetch(
		process.env.NUOVE_RICHIESTE!
	)) as TextChannel;
	embed
		.setTitle(`:red_circle: Nuova richiesta di supporto (${interaction.user.tag})`)
		.setDescription(`**User:** ${formatUser(interaction.user.id)}`);

	nuoveRichiesteChannel.send({
		content: `<@&659513332218331155>`,
		embeds: [embed],
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
