import { ChatInputCommandInteraction } from 'discord.js';

import { EmbedBuilder, User } from 'discord.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';
import { formatCode } from '../../utils/ticket.js';

function subtractDays(date: Date, days: number): Date {
	var dateOffset = 24 * 60 * 60 * 1000 * days;
	date.setTime(date.getTime() - dateOffset);
	return date;
}

function subtractMonths(date: Date, months: number): Date {
	var dateOffset = 30 * 24 * 60 * 60 * 1000 * months;
	date.setTime(date.getTime() - dateOffset);
	return date;
}

interface LogRecord {
	staff: string;
	action: 'open' | 'close' | 'block' | 'unblock';
	at: Date;
}

function buildUserActivityEmbed(user: User, docs: any): EmbedBuilder {
	return new EmbedBuilder()
		.setAuthor({
			name: user.username,
			iconURL: user.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
		})
		.setDescription('**Vindertech Stats**')
		.addFields(
			{
				name: 'Open (last 7 days)',
				value: docs
					.filter((el: LogRecord) => el.at > subtractDays(new Date(), 7) && el.action === 'open')
					.length.toString(),
				inline: true,
			},
			{
				name: 'Open (last 30 days)',
				value: docs
					.filter((el: LogRecord) => el.at > subtractDays(new Date(), 30) && el.action === 'open')
					.length.toString(),
				inline: true,
			},
			{
				name: 'Open (all time)',
				value: docs.filter((el: LogRecord) => el.action === 'open').length.toString(),
				inline: true,
			},
			{
				name: 'Close (last 7 days)',
				value: docs
					.filter((el: LogRecord) => el.at > subtractDays(new Date(), 7) && el.action === 'close')
					.length.toString(),
				inline: true,
			},
			{
				name: 'Close (last 30 days)',
				value: docs
					.filter((el: LogRecord) => el.at > subtractDays(new Date(), 30) && el.action === 'close')
					.length.toString(),
				inline: true,
			},
			{
				name: 'Close (all time)',
				value: docs.filter((el: LogRecord) => el.action === 'close').length.toString(),
				inline: true,
			},
			{
				name: 'Block (last 7 days)',
				value: docs
					.filter((el: LogRecord) => el.at > subtractDays(new Date(), 7) && el.action === 'block')
					.length.toString(),
				inline: true,
			},
			{
				name: 'Block (last 30 days)',
				value: docs
					.filter((el: LogRecord) => el.at > subtractDays(new Date(), 30) && el.action === 'block')
					.length.toString(),
				inline: true,
			},
			{
				name: 'Block (all time)',
				value: docs.filter((el: LogRecord) => el.action === 'block').length.toString(),
				inline: true,
			},
			{
				name: 'UnBlock (last 7 days)',
				value: docs
					.filter((el: LogRecord) => el.at > subtractDays(new Date(), 7) && el.action === 'unblock')
					.length.toString(),
				inline: true,
			},
			{
				name: 'UnBlock (last 30 days)',
				value: docs
					.filter((el: LogRecord) => el.at > subtractDays(new Date(), 30) && el.action === 'unblock')
					.length.toString(),
				inline: true,
			},
			{
				name: 'UnBlock (all time)',
				value: docs.filter((el: LogRecord) => el.action === 'unblock').length.toString(),
				inline: true,
			},
			{
				name: 'Total (last 7 days)',
				value: docs.filter((el: LogRecord) => el.at > subtractDays(new Date(), 7)).length.toString(),
				inline: true,
			},
			{
				name: 'Total (last 30 days)',
				value: docs.filter((el: LogRecord) => el.at > subtractDays(new Date(), 30)).length.toString(),
				inline: true,
			},
			{
				name: 'Total (all time)',
				value: docs.length.toString(),
				inline: true,
			}
		);
}

function makeGraph(list: any) {
	const userMap: [string, number][] = [];
	list.forEach((el: any) => {
		let found = false;
		for (let i = 0; i < userMap.length; i++) {
			if (userMap[i][0] == el.staff) {
				userMap[i][1] += 1;
				found = true;
			}
		}
		if (!found) {
			userMap.push([el.staff, 1]);
		}
	});

	userMap.sort(function (a, b) {
		return b[1] - a[1];
	});

	let description = '';
	let max = 0;
	userMap.forEach((el) => {
		if (el[1] > max) max = el[1];
	});

	userMap.forEach((el) => {
		for (let i = 0; i < Math.floor((el[1] / max) * 10); i++) description += '▬';
		for (let i = Math.floor((el[1] / max) * 10); i < 10; i++) description += ' ';
		description += ` <@${el[0]}> (${formatCode(el[1].toString())})\n`;
	});
	return description;
}

export async function statsActivity(interaction: ChatInputCommandInteraction) {
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
