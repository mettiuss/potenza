import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { buildUserActivityEmbed } from '../Functions/Stats/buildUserActivityEmbed.js';
import { lastExecutedCommandDescription } from '../Functions/Stats/lastExecutedCommandDescription.js';
import { makeGraph } from '../Functions/Stats/makeGraph.js';

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
	.setDMPermission(false);
export async function execute(interaction: ChatInputCommandInteraction) {
	switch (interaction.options.getSubcommand()) {
		case 'activity':
			const user = interaction.options.getUser('utente');
			if (user) {
				const docs = await interaction.client.mongo.logs.find({ staff: user.id }).toArray();

				return await interaction.reply({
					embeds: [buildUserActivityEmbed(user, docs)],
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
					new EmbedBuilder()
						.setTitle(`Numero di comandi eseguiti nell'ultimo mese`)
						.setColor('#00e3ff')
						.setDescription(makeGraph(list)),
				],
				ephemeral: true,
			});
		case 'last-command':
			await interaction.deferReply({ ephemeral: true });
			const guild = await interaction.client.guilds.fetch(process.env.GUILD_ID!);
			await guild.members.fetch();
			const vindertech = (await guild.roles.fetch('659513332218331155'))!;

			return await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Data ultimo comando eseguito`)
						.setColor('#00e3ff')
						.setDescription(await lastExecutedCommandDescription(interaction, vindertech.members)),
				],
			});
	}
}
