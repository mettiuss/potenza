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
	const staffPerms = [
		PermissionsBitField.Flags.ViewChannel,
		PermissionsBitField.Flags.ManageMessages,
		PermissionsBitField.Flags.EmbedLinks,
		PermissionsBitField.Flags.AttachFiles,
	];
	let permissionOverwrites = [
		{ id: interaction.guild!.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
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
	for (let id of JSON.parse(process.env.STAFF!)) {
		permissionOverwrites.push({ id: id, allow: staffPerms });
	}
	return {
		name: `ticket-${user.username}`,
		topic: `Ticket User ID: ${user.id}`,
		parent: process.env.TICKET_CATEGORY,
		permissionOverwrites: permissionOverwrites,
	};
}

export interface LogRecord {
	staff: string;
	action: 'open' | 'close' | 'block' | 'unblock';
	at: Date;
}
