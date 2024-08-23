import { ButtonInteraction, GuildMember } from 'discord.js';

export function formatUser(userId: string): string {
	return '<@' + userId + '>' + ' (`' + userId + '`)';
}

export function formatCode(string: string): string {
	return '`' + string + '`';
}

export function hasStaffPermission(interaction: ButtonInteraction, elite: boolean = false): boolean {
	if (!(interaction.member instanceof GuildMember)) return false;

	let allowed = false;
	const staffRoles = elite ? JSON.parse(process.env.ELITE_STAFF!) : JSON.parse(process.env.STAFF!);
	for (const id of staffRoles) {
		if (interaction.member.roles.cache.has(id)) allowed = true;
	}

	return allowed;
}
