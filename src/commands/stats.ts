import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { statsActivity } from '../controllers/stats/activity.js';
import { statsLastCommand } from '../controllers/stats/lastCommand.js';
import { statsFeedback } from '../controllers/stats/feedback.js';

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
			return statsLastCommand(interaction);
		case 'feedback':
			return statsFeedback(interaction);
	}
}
