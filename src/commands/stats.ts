import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { formatCode } from '../utils.js';

function subtractMonths(date: Date, months: number): Date {
	date.setMonth(date.getMonth() - months);
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
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('last-command')
			.setDescription("Invia la data dell'ultimo comando eseguito da ogni Vindertech")
	)
	.setDMPermission(false);
export async function execute(interaction: ChatInputCommandInteraction) {
	switch (interaction.options.getSubcommand()) {
		case 'activity':
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
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Numero di comandi eseguiti nell'ultimo mese`)
						.setColor('#00e3ff')
						.setDescription(description),
				],
				ephemeral: true,
			});
		case 'last-command':
			const guild = await interaction.client.guilds.fetch(process.env.GUILD_ID!);
			const vindertech = (await guild.roles.fetch('659513332218331155'))!;

			let memberTimes: [string, number | null][] = [];

			for (let member of vindertech.members) {
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

			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Data ultimo comando eseguito`)
						.setColor('#00e3ff')
						.setDescription(desc),
				],
				ephemeral: true,
			});
	}
}
