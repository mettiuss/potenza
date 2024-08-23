import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import { ticketBlock } from '../controllers/ticket/block.js';
import { ticketUnblock } from '../controllers/ticket/unblock.js';
import { ticketBlocked } from '../controllers/ticket/blocked.js';
import { ticketOpen } from '../controllers/ticket/open.js';
import { ticketClose } from '../controllers/ticket/close.js';

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
			.addStringOption((input) =>
				input.setName('motivazione').setDescription('La motivazione di questa azione').setRequired(true)
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
	let reason;

	switch (interaction.options.getSubcommand()) {
		case 'open':
			return ticketOpen(interaction, user!);
		case 'close':
			reason = interaction.options.getString('motivazione', true);
			return ticketClose(interaction, user!, reason);
		case 'block':
			reason = interaction.options.getString('motivazione', true);
			return ticketBlock(interaction, user!, reason);
		case 'unblock':
			return ticketUnblock(interaction, user!);
		case 'blocked':
			return ticketBlocked(interaction);
	}
}
