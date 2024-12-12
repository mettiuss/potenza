import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	PermissionsBitField,
	User,
} from 'discord.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';
import { formatUser, fullTicketStaff, getUserChannel } from '../../utils/ticket.js';

export async function ticketOpen(interaction: ChatInputCommandInteraction, user: User) {
	if (!interaction.guild) return;

	if (getUserChannel(interaction.guild, user.id)) {
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **This user already has an open ticket**',
			ephemeral: true,
		});
	}

	await interaction.deferReply({ ephemeral: true });

	const ticketChannel = await interaction.guild.channels.create(createChannelCreateOptions(interaction, user));
	if (!ticketChannel) return;

	await Promise.all([
		ticketChannel.send({
			embeds: [new PotenzaEmbedBuilder(interaction.guild).newTicket(user.id)],
		}),
		interaction.client.ticketLogChannel.send({
			embeds: [
				new PotenzaEmbedBuilder(interaction.guild)
					.setTitle('**Richiesta Supporto Aperta**')
					.addWhoFields(interaction.user.id, user.id),
			],
		}),
		interaction.client.mongo.logs.insertOne({
			staff: interaction.user.id,
			action: 'open',
			at: new Date(),
		}),
	]);

	await interaction.editReply({
		content: `**Ticket aperto per ${formatUser(user.id)}**`,
	});
}

export function createChannelCreateOptions(interaction: CommandInteraction | ButtonInteraction, user: User) {
	const staffPerms = [
		PermissionsBitField.Flags.ViewChannel,
		PermissionsBitField.Flags.ManageMessages,
		PermissionsBitField.Flags.EmbedLinks,
		PermissionsBitField.Flags.AttachFiles,
	];
	let permissionOverwrites = [
		{ id: interaction.guild!.id, deny: [PermissionsBitField.Flags.ViewChannel] },
		{
			id: user.id,
			allow: [
				PermissionsBitField.Flags.ViewChannel,
				PermissionsBitField.Flags.EmbedLinks,
				PermissionsBitField.Flags.AttachFiles,
				PermissionsBitField.Flags.ReadMessageHistory,
			],
		},
	];
	for (let id of fullTicketStaff(interaction.client)) {
		permissionOverwrites.push({ id: id, allow: staffPerms });
	}
	return {
		name: `ticket-${user.username}`,
		topic: user.id,
		parent: interaction.client.settings['ticket-category'],
		permissionOverwrites: permissionOverwrites,
	};
}
