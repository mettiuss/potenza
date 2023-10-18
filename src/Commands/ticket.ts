import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import ticketOpen from '../Functions/Ticket/open.js';
import ticketClose from '../Functions/Ticket/close.js';
import ticketBlock from '../Functions/Ticket/block.js';
import ticketUnblock from '../Functions/Ticket/unblock.js';
import ticketBlocked from '../Functions/Ticket/blocked.js';
import { formatCode, formatUser } from '../utils.js';

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
	let res;

	switch (interaction.options.getSubcommand()) {
		case 'open':
			res = await ticketOpen(interaction, user!);
			if (res) await interaction.reply(`**Ticket aperto per ${formatUser(user!.id)}**`);
			return;
		case 'close':
			const reason = interaction.options.getString('motivazione', true);
			res = await ticketClose(interaction, user!, reason);
			if (res)
				await interaction.reply(
					`**Ticket chiuso per ${formatUser(user!.id)} con motivazione: ${formatCode(reason)}**`
				);
			return;
		case 'block':
			return await ticketBlock(interaction, user!);
		case 'unblock':
			return await ticketUnblock(interaction, user!);
		case 'blocked':
			return await ticketBlocked(interaction);
	}
}
