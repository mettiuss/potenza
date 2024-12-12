import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import { channelRename } from '../controllers/channel/rename.js';
import { channelResize } from '../controllers/channel/resize.js';
import { channelOpen } from '../controllers/channel/open.js';
import { channelClose } from '../controllers/channel/close.js';
import { channelInvite } from '../controllers/channel/invite.js';
import { channelKick } from '../controllers/channel/kick.js';

export const data = new SlashCommandBuilder()
	.setName('channel')
	.setDescription(`Permette la gestione dei canali Custom`)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('rename')
			.setDescription('Modifica il nome del canale vocale')
			.addStringOption((input) =>
				input
					.setName('nome')
					.setDescription('Il nome da assegnare al canale vocale')
					.setMinLength(3)
					.setMaxLength(30)
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('resize')
			.setDescription('Modifica la dimensione del canale vocale')
			.addNumberOption((input) =>
				input
					.setName('limite')
					.setDescription('Limite massimo di utenti del canale')
					.setMinValue(1)
					.setMaxValue(99)
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) => subcommand.setName('open').setDescription('Imposta il canale vocale come pubblico'))
	.addSubcommand((subcommand) => subcommand.setName('close').setDescription('Imposta il canale vocale come privato'))
	.addSubcommand((subcommand) =>
		subcommand
			.setName('invite')
			.setDescription('Invita in DM un utente al canale vocale')
			.addUserOption((input) =>
				input.setName('utente').setDescription('Utente a cui si riferisce questa azione').setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('kick')
			.setDescription('Espelle un utente connesso al canale vocale')
			.addUserOption((input) =>
				input.setName('utente').setDescription('Utente a cui si riferisce questa azione').setRequired(true)
			)
	)
	.setDMPermission(false);
export async function execute(interaction: ChatInputCommandInteraction) {
	let data;

	switch (interaction.options.getSubcommand()) {
		case 'rename':
			data = interaction.options.getString('nome', true);
			return channelRename(interaction, data);
		case 'resize':
			data = interaction.options.getNumber('limite', true);
			return channelResize(interaction, data);
		case 'open':
			return channelOpen(interaction);
		case 'close':
			return channelClose(interaction);
		case 'invite':
			data = interaction.options.getUser('utente', true);
			return channelInvite(interaction, data);
		case 'kick':
			data = interaction.options.getUser('utente', true);
			return channelKick(interaction, data);
	}
}
