import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Client,
	Guild,
	ModalSubmitInteraction,
	TextChannel,
	User,
} from 'discord.js';
import { formatCode, formatUser, getUserChannel } from '../../utils/ticket.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';
import discordTranscripts from 'discord-html-transcripts';
import axios from 'axios';

export async function sendCloseMessage(
	interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
	user: User,
	reason: string
) {
	try {
		const userId = interaction.user.id; // UserID del Vindertech

		await user.send({
			embeds: [
				new PotenzaEmbedBuilder(interaction.guild).setTitle('**Richiesta Supporto Chiusa**').addFields(
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
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId(`feedback_like_${userId}`)
						.setLabel('👍')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId(`feedback_nolike_${userId}`)
						.setLabel('👎')
						.setStyle(ButtonStyle.Danger)
				),
			],
		});
	} catch {}
}

export async function sendLogGetTranscript(
	userChannel: TextChannel,
	client: Client,
	guild: Guild | null,
	staff: User,
	user: User,
	reason: string
) {
	const attachment = await discordTranscripts.createTranscript(userChannel, {
		saveImages: false,
		poweredBy: false,
	});

	const logMessage = await client.ticketLogChannel.send({
		embeds: [
			new PotenzaEmbedBuilder(guild)
				.setTitle('**Richiesta Supporto Chiusa**')
				.addWhoFields(staff.id, user.id, reason),
		],
		files: [attachment],
	});

	const attachment_url = logMessage.attachments.at(0)!.url;

	try {
		axios.get('https://vindertech.itzmirko.it/file/?url=' + encodeURIComponent(attachment_url));
	} catch {}

	return attachment_url;
}

export async function ticketClose(interaction: ChatInputCommandInteraction, user: User, reason: string) {
	if (!interaction.guild) return;

	const userChannel = getUserChannel(interaction.guild, user.id);
	if (!userChannel)
		return interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> L'utente ${formatUser(
				user.id
			)} non possiede nessun ticket aperto.`,
			ephemeral: true,
		});

	await interaction.deferReply({ ephemeral: true });

	const attachment_url = await sendLogGetTranscript(
		userChannel,
		interaction.client,
		interaction.guild,
		interaction.user,
		user,
		reason
	);

	await Promise.all([
		(async () => {
			await userChannel.edit({ topic: '' });
			await userChannel.delete();
		})(),
		sendCloseMessage(interaction, user, reason),
		interaction.client.mongo.logs.insertOne({
			staff: interaction.user.id,
			action: 'close',
			at: new Date(),
		}),
	]);

	const ticketDoc = await interaction.client.mongo.ticket.findOne({ _id: user.id });

	if (ticketDoc) {
		const updateEmbed = new PotenzaEmbedBuilder(null, false)
			.setTitle(`:green_circle: Richiesta chiusa`)
			.setDescription(
				`**User:** ${formatUser(user.id)}\n**Staff:** ${formatUser(
					ticketDoc.staff
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
	}

	await interaction.client.mongo.ticket.deleteOne({ _id: user.id });

	await interaction.editReply(`**Ticket chiuso per ${formatUser(user.id)} con motivazione: ${formatCode(reason)}**`);
}
