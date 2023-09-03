import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { formatCode, formatUser } from '../utils.js';
import { createChannelCreateOptions, getUserChannel } from '../functions/ticket.js';
import { createBlockLogEmbed, createLogEmbed, createUserEmbed } from '../functions/ticket-embeds.js';
import { sendList } from '../functions/ticket-list.js';

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
	let userEmbed, logEmbed, doc, logChannel;

	switch (interaction.options.getSubcommand()) {
		case 'open':
			userEmbed = createUserEmbed(interaction, user, 'open');
			logEmbed = createLogEmbed(interaction, user, 'open');
			if (getUserChannel(interaction.guild!, user.id).size === 0) {
				const ticketChannel = await interaction.guild?.channels.create(
					createChannelCreateOptions(interaction, user)
				);
				ticketChannel?.send({ embeds: [userEmbed] });
				const logChannel = (await interaction.client.channels.fetch('721809334178414614')) as TextChannel;
				await logChannel.send({ embeds: [logEmbed] });
				return await interaction.reply(`**Ticket aperto per <@${user.id}> (` + '`' + user.id + '`)**');
			} else {
				return await interaction.reply(
					`L'utente <@${user.id}> (` + '`' + user.id + '`) ha già un ticket aperto.'
				);
			}
		case 'close':
			const reason = interaction.options.getString('motivazione', true);

			userEmbed = createUserEmbed(interaction, user, 'close', reason);
			logEmbed = createLogEmbed(interaction, user, 'close', reason);
			let userChannel = getUserChannel(interaction.guild!, user.id);
			if (userChannel.size === 0) {
				return await interaction.reply(`L'utente ${formatUser(user.id)} non possiede nessun ticket aperto.`);
			} else {
				await userChannel.at(0)?.edit({ topic: '' });
				await userChannel.at(0)?.delete();
				try {
					await user.send({ embeds: [userEmbed] });
				} catch {}
				const logChannel = (await interaction.client.channels.fetch('721809334178414614')) as TextChannel;
				await logChannel.send({ embeds: [logEmbed] });
				return await interaction.reply(
					`**Ticket chiuso per ${formatUser(user.id)} con motivazione: ${formatCode(reason)}**`
				);
			}
		case 'block':
			doc = await interaction.client.mongo.findOne({ _id: user.id });
			if (doc)
				return await interaction.reply(
					`**L'utente ${formatUser(user.id)} è già stato bloccato da <@${doc.staff}> il <t:${Math.floor(
						doc.at.getTime() / 1000
					)}:f>**`
				);
			if (!(interaction.member instanceof GuildMember))
				return await interaction.reply(`**<:FNIT_Stop:857617083185758208> C'è stato un errore, riprova**`);
			await interaction.client.mongo.insertOne({
				_id: user.id,
				staff: interaction.member.id,
				at: new Date(),
			});
			logChannel = (await interaction.client.channels.fetch('721809334178414614')) as TextChannel;
			logEmbed = createBlockLogEmbed(interaction, user, 'block');
			await logChannel.send({ embeds: [logEmbed] });
			return await interaction.reply(`**L'utente ${formatUser(user.id)} è stato bloccato**`);
		case 'unblock':
			doc = await interaction.client.mongo.findOne({ _id: user.id });
			if (!doc) return await interaction.reply(`**L'utente ${formatUser(user.id)} non è bloccato**`);
			await interaction.client.mongo.deleteOne({ _id: user.id });
			logChannel = (await interaction.client.channels.fetch('721809334178414614')) as TextChannel;
			logEmbed = createBlockLogEmbed(interaction, user, 'block');
			await logChannel.send({ embeds: [logEmbed] });
			return await interaction.reply(`**L'utente ${formatUser(user.id)} è stato sbloccato**`);
		case 'block-list':
			return await sendList(interaction);
	}
}
