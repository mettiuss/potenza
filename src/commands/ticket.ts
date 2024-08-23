import { ChatInputCommandInteraction, ColorResolvable, TextChannel, User, EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { formatCode, formatUser } from '../utils/utils.js';
import {
	baseEmbed,
	createChannelCreateOptions,
	ELEMENTS_PAGE,
	getComponentsRow,
	getUserChannel,
	makeEmbed,
} from '../utils/ticket.js';
import { deleteTicketChannel, sendCloseMessage } from '../handlers/ticket/closeButton.js';
import discordTranscripts from 'discord-html-transcripts';
import axios from 'axios';

export const data = new SlashCommandBuilder()
	.setName('ticket')
	.setDescription(`Aprire e chiudere un ticket per il Supporto Vindertech.`)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('open')
			.setDescription("Aprire un ticket per l'utente specificato")
			.addUserOption((input) =>
				input.setName('utente').setDescription('Utente a cui si riferisce questa azione').setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('close')
			.setDescription("Chiudere un ticket per l'utente specificato")
			.addUserOption((input) =>
				input.setName('utente').setDescription('Utente a cui si riferisce questa azione').setRequired(true)
			)
			.addStringOption((input) =>
				input.setName('motivazione').setDescription('La motivazione di questa azione').setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('block')
			.setDescription("Blocca un utente dall'inviare richieste vindertech")
			.addUserOption((input) =>
				input.setName('utente').setDescription('Utente a cui si riferisce questa azione').setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('unblock')
			.setDescription("Sblocca un utente dall'inviare richieste vindertech")
			.addUserOption((input) =>
				input.setName('utente').setDescription('Utente a cui si riferisce questa azione').setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand.setName('blocked').setDescription('Invia una lista degli utenti attualmente bloccati')
	)
	.setDMPermission(false);
export async function execute(interaction: ChatInputCommandInteraction) {
	const user = interaction.options.getUser('utente');

	switch (interaction.options.getSubcommand()) {
		case 'open':
			return ticketOpen(interaction, user!);
		case 'close':
			const reason = interaction.options.getString('motivazione', true);
			return ticketClose(interaction, user!, reason);
		case 'block':
			return ticketBlock(interaction, user!);
		case 'unblock':
			return ticketUnblock(interaction, user!);
		case 'blocked':
			return ticketBlocked(interaction);
	}
}

async function ticketOpen(interaction: ChatInputCommandInteraction, user: User) {
	if (!interaction.guild) return;

	await interaction.deferReply({ ephemeral: true });

	const ticketChannel = await interaction.guild.channels.create(createChannelCreateOptions(interaction, user));
	if (!ticketChannel) return;

	ticketChannel.send({
		embeds: [
			baseEmbed(interaction, user)
				.setTitle('**Richiesta Supporto Accettata**')
				.setDescription(
					`Hey <@${user.id}>, la tua richiesta è stata accettata e per questo abbiamo aperto un ticket. Un membro del team Vindertech ti risponderà il prima possibile.`
				)
				.addFields(
					{
						name: '**Domande Frequenti**',
						value: 'Se hai bisogno delle domande e risposte frequenti, [clicca qui](https://www.epicgames.com/help/it/fortnite-c75).',
					},
					{
						name: '**Supporto Tecnico**',
						value: `Se hai bisogno di aiuto in gioco, contatta l'assistenza [cliccando qui](https://www.epicgames.com/help/it/contact-us).`,
					},
					{
						name: '**Bacheca Trello**',
						value: 'Puoi consultare i problemi già noti ad Epic Games [cliccando qui](https://trello.com/b/zXyhyOIs/fortnite-italia-community-issues).',
					}
				),
		],
	});

	interaction.client.logChannel.send({
		embeds: [
			baseEmbed(interaction, user)
				.setTitle('**Richiesta Supporto Aperta**')
				.addFields(
					{
						name: 'Staffer',
						value: `<@${interaction.user.id}> | ID: ${interaction.user.id}`,
						inline: false,
					},
					{
						name: 'Utente',
						value: `<@${user.id}> | ID: ${user.id}`,
						inline: false,
					}
				),
		],
	});

	interaction.client.mongo.logs.insertOne({
		staff: interaction.user.id,
		action: 'open',
		at: new Date(),
	});

	interaction.editReply({
		content: `**Ticket aperto per ${formatUser(user.id)}**`,
	});
}

async function ticketClose(interaction: ChatInputCommandInteraction, user: User, reason: string) {
	if (!interaction.guild) return;

	const userChannel = getUserChannel(interaction.guild, user.id);
	if (!userChannel)
		return interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(
				user.id
			)} non possiede nessun ticket aperto.**`,
			ephemeral: true,
		});

	await interaction.deferReply({ ephemeral: true });

	deleteTicketChannel(userChannel);

	sendCloseMessage(interaction, user, reason);

	interaction.client.mongo.logs.insertOne({
		staff: interaction.user.id,
		action: 'close',
		at: new Date(),
	});

	const attachment = await discordTranscripts.createTranscript(userChannel, {
		saveImages: true,
		poweredBy: false,
	});

	const logMessage = await interaction.client.logChannel.send({
		embeds: [
			baseEmbed(interaction, user)
				.setTitle('**Richiesta Supporto Chiusa**')
				.addFields(
					{
						name: 'Staffer',
						value: `<@${interaction.user.id}> | ID: ${interaction.user.id}`,
						inline: false,
					},
					{
						name: 'Utente',
						value: `<@${user.id}> | ID: ${user.id}`,
						inline: false,
					},
					{
						name: 'Motivazione',
						value: reason,
						inline: false,
					}
				),
		],
		files: [attachment],
	});

	const attachment_url = logMessage.attachments.at(0)!.url;

	const ticketDoc = await interaction.client.mongo.ticket.findOne({ _id: user.id });

	if (ticketDoc) {
		const updateEmbed = new EmbedBuilder()
			.setColor(interaction.client.color as ColorResolvable)
			.setTitle(`:green_circle: Richiesta chiusa`)
			.setDescription(
				`**User:** ${formatUser(user.id)}\n**Staff:** ${formatUser(
					interaction.user.id
				)}\n**Close Reason:** ${formatCode(reason)}\n**Log:** [${formatCode(
					'Log URL'
				)}](https://vindertech.mirkohubtv.it/file/?url=${attachment_url})`
			)
			.setFields(
				{
					name: 'Descrizione',
					value: '```\n' + ticketDoc.description + '\n```',
				},
				{ name: 'Piattaforma', value: '```\n' + ticketDoc.platform + '\n```' }
			);

		const nuoveRichiesteChannel = (await interaction.client.channels.fetch(
			process.env.NUOVE_RICHIESTE!
		)) as TextChannel;
		const message = await nuoveRichiesteChannel.messages.fetch(ticketDoc.message);

		await message.edit({
			embeds: [updateEmbed],
			components: [],
		});
	}

	const url = 'https://vindertech.itzmirko.it/file/?url=' + encodeURIComponent(attachment_url);
	axios.get(url);

	interaction.client.mongo.ticket.deleteOne({ _id: user.id });

	await interaction.editReply(`**Ticket chiuso per ${formatUser(user.id)} con motivazione: ${formatCode(reason)}**`);
}

async function ticketBlock(interaction: ChatInputCommandInteraction, user: User) {
	const doc = await interaction.client.mongo.block.findOne({ _id: user.id });

	if (doc)
		return await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(user.id)} è già stato bloccato da <@${
				doc.staff
			}> il <t:${Math.floor(doc.at.getTime() / 1000)}:f>**`,
			ephemeral: true,
		});

	await interaction.deferReply();

	await interaction.client.mongo.block.insertOne({
		_id: user.id,
		staff: interaction.user.id,
		at: new Date(),
	});
	await interaction.client.mongo.logs.insertOne({
		staff: interaction.user.id,
		action: 'block',
		at: new Date(),
	});

	await interaction.client.logChannel.send({
		embeds: [
			baseEmbed(interaction, user)
				.setTitle('**Utente bloccato**')
				.addFields(
					{
						name: 'Staffer',
						value: `<@${interaction.user.id}> | ID: ${interaction.user.id}`,
						inline: false,
					},
					{
						name: 'Utente',
						value: `<@${user.id}> | ID: ${user.id}`,
						inline: false,
					}
				),
		],
	});

	await interaction.editReply(`**L'utente ${formatUser(user.id)} è stato bloccato**`);
}

async function ticketUnblock(interaction: ChatInputCommandInteraction, user: User) {
	const doc = await interaction.client.mongo.block.findOne({ _id: user.id });
	if (!doc)
		return await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(user.id)} non è bloccato**`,
			ephemeral: true,
		});

	await interaction.deferReply();

	await interaction.client.mongo.block.deleteOne({ _id: user.id });
	await interaction.client.mongo.logs.insertOne({
		staff: interaction.user.id,
		action: 'unblock',
		at: new Date(),
	});

	await interaction.client.logChannel.send({
		embeds: [
			baseEmbed(interaction, user)
				.setTitle('**Utente sbloccato**')
				.addFields(
					{
						name: 'Staffer',
						value: `<@${interaction.user.id}> | ID: ${interaction.user.id}`,
						inline: false,
					},
					{
						name: 'Utente',
						value: `<@${user.id}> | ID: ${user.id}`,
						inline: false,
					}
				),
		],
	});

	await interaction.editReply(`**L'utente ${formatUser(user.id)} è stato sbloccato**`);
}

async function ticketBlocked(interaction: ChatInputCommandInteraction) {
	const docs = await interaction.client.mongo.block.find().toArray();
	let current_page = 0;
	const total_pages = Math.ceil(docs.length / ELEMENTS_PAGE);

	const message = await interaction.reply({
		embeds: [makeEmbed(docs, current_page)],
		components: getComponentsRow(current_page, total_pages),
	});

	const collector = message.createMessageComponentCollector({
		filter: ({ user }) => user.id === interaction.user.id,
	});

	collector.on('collect', async (interaction) => {
		switch (interaction.customId) {
			case 'start':
				current_page = 0;
				break;
			case 'back':
				current_page -= 1;
				break;
			case 'forward':
				current_page += 1;
				break;
			case 'end':
				current_page = total_pages - 1;
				break;
			case 'stop':
				await interaction.update({
					embeds: [makeEmbed(docs, current_page)],
					components: [],
				});
				return;
		}

		await interaction.update({
			embeds: [makeEmbed(docs, current_page)],
			components: getComponentsRow(current_page, total_pages),
		});
	});
}
