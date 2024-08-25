import { ButtonInteraction, ChannelType, Guild, GuildMember, TextChannel } from 'discord.js';

export function formatUser(userId: string): string {
	return '<@' + userId + '>' + ' (`' + userId + '`)';
}

export function formatCode(string: string): string {
	return '`' + string + '`';
}

export function hasStaffPermission(interaction: ButtonInteraction, elite: boolean = false): boolean {
	if (!(interaction.member instanceof GuildMember)) return false;

	let allowed = false;
	const staffRoles = elite ? JSON.parse(process.env.ELITE_STAFF_TICKET!) : JSON.parse(process.env.STAFF_TICKET!);
	for (const id of staffRoles) {
		if (interaction.member.roles.cache.has(id)) allowed = true;
	}

	return allowed;
}

export function getUserChannel(guild: Guild, userId: string) {
	const channels = guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildText && ch.topic == userId);
	if (channels.size == 0) return;
	return channels.at(0) as TextChannel;
}
