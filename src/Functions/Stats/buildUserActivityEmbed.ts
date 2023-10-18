import { EmbedBuilder, User } from 'discord.js';
import { LogRecord } from '../Ticket/utils.js';

function subtractDays(date: Date, days: number): Date {
	var dateOffset = 24 * 60 * 60 * 1000 * days;
	date.setTime(date.getTime() - dateOffset);
	return date;
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
