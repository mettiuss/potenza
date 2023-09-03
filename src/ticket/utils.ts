import {
	ButtonInteraction,
	ChannelType,
	CommandInteraction,
	Guild,
	GuildChannelCreateOptions,
	PermissionsBitField,
	User,
} from 'discord.js';

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
