import {
	APIInteractionGuildMember,
	ButtonInteraction,
	ChannelType,
	Client,
	Guild,
	GuildMember,
	TextChannel,
} from 'discord.js';

export function formatUser(userId: string): string {
	return '<@' + userId + '>' + ' (`' + userId + '`)';
}

export function formatCode(string: string): string {
	return '`' + string + '`';
}

export function hasStaffPermission(member: GuildMember | APIInteractionGuildMember, staff_list: string[]): boolean {
	if (!(member instanceof GuildMember)) return false;

	let allowed = false;
	for (const id of staff_list) {
		if (member.roles.cache.has(id)) allowed = true;
	}

	return allowed;
}

export function getUserChannel(guild: Guild, userId: string) {
	const channels = guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildText && ch.topic == userId);
	if (channels.size == 0) return;
	return channels.at(0) as TextChannel;
}

export function fullTicketStaff(client: Client) {
	return [...new Set([...client.settings['ticket-staff'], ...client.settings['ticket-staff-admin']])];
}
