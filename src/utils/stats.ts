import { Collection, EmbedBuilder, GuildMember, Interaction, User } from 'discord.js';
import { formatCode } from './utils.js';

function subtractDays(date: Date, days: number): Date {
	var dateOffset = 24 * 60 * 60 * 1000 * days;
	date.setTime(date.getTime() - dateOffset);
	return date;
}

export interface LogRecord {
	staff: string;
	action: 'open' | 'close' | 'block' | 'unblock';
	at: Date;
}

export function buildUserActivityEmbed(user: User, docs: any): EmbedBuilder {
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

export function makeGraph(list: any) {
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

export async function lastExecutedCommandDescription(
	interaction: Interaction,
	members: Collection<string, GuildMember>
): Promise<string> {
	let memberTimes: [string, number | null][] = [];

	for (let member of members) {
		let doc = await interaction.client.mongo.logs.findOne({ staff: member[1].id }, { sort: { at: -1 } });
		if (doc) {
			memberTimes.push([member[1].id, Math.floor(doc.at.getTime() / 1000)]);
		} else {
			memberTimes.push([member[1].id, null]);
		}
	}

	let desc = '';

	memberTimes.sort(function (a, b) {
		if (!b[1]) return -1;
		if (!a[1]) return 1;
		return b[1] - a[1];
	});

	for (let member of memberTimes) {
		if (!member[1]) {
			desc += `<@${member[0]}> | No log registered\n`;
		} else {
			desc += `<@${member[0]}> | <t:${member[1]}:f>\n`;
		}
	}
	return desc;
}
