import {
	ButtonInteraction,
	ChannelType,
	CommandInteraction,
	EmbedBuilder,
	Guild,
	GuildChannelCreateOptions,
	PermissionsBitField,
	TextChannel,
	User,
} from 'discord.js';
import { createLogEmbed, createUserEmbed } from './ticket-embeds.js';
import { formatUser } from '../utils.js';

export function getUserChannel(guild: Guild, userID: string) {
	return guild.channels.cache.filter(
		(ch) => ch.type === ChannelType.GuildText && ch.topic == `Ticket User ID: ${userID}`
	);
}

export function createChannelCreateOptions(
	interaction: CommandInteraction | ButtonInteraction,
	user: User
): GuildChannelCreateOptions {
	let staffPerms = [
		PermissionsBitField.Flags.ViewChannel,
		PermissionsBitField.Flags.ManageMessages,
		PermissionsBitField.Flags.EmbedLinks,
		PermissionsBitField.Flags.AttachFiles,
	];
	return {
		name: `ticket-${user.username}`,
		topic: `Ticket User ID: ${user.id}`,
		parent: '683363228931194899',
		permissionOverwrites: [
			{ id: interaction.guild!.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
			{ id: '454262524955852800', allow: staffPerms },
			{ id: '659513332218331155', allow: staffPerms },
			{ id: '720221658501087312', allow: staffPerms },
			{
				id: user.id,
				allow: [
					PermissionsBitField.Flags.ViewChannel,
					PermissionsBitField.Flags.EmbedLinks,
					PermissionsBitField.Flags.AttachFiles,
					PermissionsBitField.Flags.ReadMessageHistory,
				],
			},
		],
	};
}

export async function ticketOpen(interaction: ButtonInteraction) {
	const richiesteUtentiChannel = (await interaction.client.channels.fetch('683363814137266207')) as TextChannel;
	let richiestaUtenteMessage;
	try {
		richiestaUtenteMessage = await richiesteUtentiChannel.messages.fetch(
			interaction.message?.embeds[0]?.description?.split('(')[1].split(')')[0].split('/').at(-1)!
		);
	} catch {
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **Message not found**',
			ephemeral: true,
		});
	}
	const user = await interaction.guild?.members.fetch(
		richiestaUtenteMessage.embeds[0].description?.split('<@')[1].split('>')[0]!
	);
	if (!user)
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **User not found**',
			ephemeral: true,
		});
	let userEmbed = createUserEmbed(interaction, user.user, 'open');
	let logEmbed = createLogEmbed(interaction, user.user, 'open');
	if (getUserChannel(interaction.guild!, user.id).size === 0) {
		const ticketChannel = await interaction.guild?.channels.create(
			createChannelCreateOptions(interaction, user.user)
		);
		ticketChannel?.send({ embeds: [userEmbed] });
		const logChannel = (await interaction.client.channels.fetch('721809334178414614')) as TextChannel;
		await logChannel.send({ embeds: [logEmbed] });
		await interaction.update({
			embeds: [
				new EmbedBuilder({
					description:
						'[`Richiesta presa in carico da ' +
						interaction.user.tag +
						'`](' +
						richiestaUtenteMessage.url +
						')',
					color: 0x00e3ff,
				}),
			],
			components: [],
		});
		return await interaction.reply({
			content: `**Ticket aperto per ${formatUser(user.id)}**`,
			ephemeral: true,
		});
	} else {
		return await interaction.reply({
			content: `L'utente ${formatUser(user.id)} ha già un ticket aperto.`,
			ephemeral: true,
		});
	}
}
