import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { buildUserActivityEmbed, lastExecutedCommandDescription, makeGraph } from '../utils/stats.js';
import { PotenzaEmbedBuilder } from '../utils/PotenzaEmbedBuilder.js';

function subtractMonths(date: Date, months: number): Date {
	var dateOffset = 30 * 24 * 60 * 60 * 1000 * months;
	date.setTime(date.getTime() - dateOffset);
	return date;
}

export const data = new SlashCommandBuilder()
	.setName('stats')
	.setDescription(`Statistiche sull'attività dei Vindertech.`)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('activity')
			.setDescription('Invia un grafico sul numero di comandi eseguiti dai Vindertech')
			.addStringOption((input) =>
				input
					.setName('tipo')
					.setDescription('Filtra per tipo di azione')
					.addChoices(
						{ name: 'open', value: 'open' },
						{ name: 'close', value: 'close' },
						{ name: 'block', value: 'block' },
						{ name: 'unblock', value: 'unblock' }
					)
			)
			.addUserOption((input) => input.setName('utente').setDescription('Filtra per utente'))
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('last-command')
			.setDescription("Invia la data dell'ultimo comando eseguito da ogni Vindertech")
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('feedback')
			.setDescription('Invia statistiche dei feedback per i vindertech')
			.addUserOption((input) => input.setName('utente').setDescription('Filtra per utente').setRequired(true))
	)
	.setDMPermission(false);
export async function execute(interaction: ChatInputCommandInteraction) {
	switch (interaction.options.getSubcommand()) {
		case 'activity':
			return statsActivity(interaction);
		case 'last-command':
			return lastCommandActivity(interaction);
		case 'feedback':
			return feedbackActivity(interaction);
	}
}

async function statsActivity(interaction: ChatInputCommandInteraction) {
	const user_activity = interaction.options.getUser('utente');

	if (user_activity) {
		const docs = await interaction.client.mongo.logs.find({ staff: user_activity.id }).toArray();

		return await interaction.reply({
			embeds: [buildUserActivityEmbed(user_activity, docs)],
			ephemeral: true,
		});
	}

	const action = interaction.options.getString('tipo');
	let docs;
	if (action) {
		docs = interaction.client.mongo.logs.find({
			$and: [{ action: action }, { at: { $gte: subtractMonths(new Date(), 1) } }],
		});
	} else {
		docs = interaction.client.mongo.logs.find({ at: { $gte: subtractMonths(new Date(), 1) } });
	}
	const list = await docs.toArray();

	return await interaction.reply({
		embeds: [
			new PotenzaEmbedBuilder(null, false)
				.setTitle(`Numero di comandi eseguiti nell'ultimo mese`)
				.setDescription(makeGraph(list)),
		],
		ephemeral: true,
	});
}

async function lastCommandActivity(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });
	const guild = await interaction.client.guilds.fetch(process.env.GUILD_ID!);
	await guild.members.fetch();
	const vindertech = (await guild.roles.fetch('659513332218331155'))!;

	return await interaction.editReply({
		embeds: [
			new PotenzaEmbedBuilder(null, false)
				.setTitle(`Data ultimo comando eseguito`)
				.setDescription(await lastExecutedCommandDescription(interaction, vindertech.members)),
		],
	});
}

async function feedbackActivity(interaction: ChatInputCommandInteraction) {
	const user_feedback = interaction.options.getUser('utente', true);
	const feedbackDocument = await interaction.client.mongo.feedback.findOne({ _id: user_feedback.id });

	if (feedbackDocument) {
		const likeCount: number = feedbackDocument.like || 0;
		const noLikeCount: number = feedbackDocument.nolike || 0;
		const averageRating: number = (likeCount / (likeCount + noLikeCount)) * 5;
		const averageRatingInStars: number = parseFloat(averageRating.toFixed(2));

		await interaction.reply({
			content: `**👮  Informazioni Utente <@${user_feedback.id}>**\n- 👍  ** Like Ricevuti: ${likeCount}**\n- 👎  ** Non mi piace Ricevuti: ${noLikeCount}**\n> **﻿:star:﻿ Valutazione Media: ${averageRatingInStars}/5**`,
			ephemeral: true,
		});
	} else {
		await interaction.reply({
			content: `❌ Nessuna statistica disponibile per l'utente <@${user_feedback.id}>.`,
			ephemeral: true,
		});
	}
}
