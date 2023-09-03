import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import ticketOpen from '../ticket/open.js';
import ticketClose from '../ticket/close.js';
import ticketBlock from '../ticket/block.js';
import ticketUnblock from '../ticket/unblock.js';
import ticketBlockList from '../ticket/block-list.js';

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
		subcommand.setName('block-list').setDescription('Invia una lista degli utenti attualmente bloccati')
	);
export async function execute(interaction: ChatInputCommandInteraction) {
	const user = interaction.options.getUser('utente', true);

	switch (interaction.options.getSubcommand()) {
		case 'open':
			return await ticketOpen(interaction, user);
		case 'close':
			const reason = interaction.options.getString('motivazione', true);
			return await ticketClose(interaction, user, reason);
		case 'block':
			return await ticketBlock(interaction, user);
		case 'unblock':
			return await ticketUnblock(interaction, user);
		case 'block-list':
			return await ticketBlockList(interaction);
	}
}
