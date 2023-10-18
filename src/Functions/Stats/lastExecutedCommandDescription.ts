import { Collection, GuildMember, Interaction } from 'discord.js';

export async function lastExecutedCommandDescription(
	interaction: Interaction,
	members: Collection<string, GuildMember>
): Promise<string> {
	let memberTimes: [string, number | null][] = [];

	for (let member of members) {
		let doc = await interaction.client.mongo.logs.findOne({ staff: member[1].id }, { sort: { at: -1 } });
		if (doc) {
			memberTimes.push([member[1].id, Math.floor(doc.at.getTime() / 1000)]);
		} else {
			memberTimes.push([member[1].id, null]);
		}
	}

	let desc = '';

	memberTimes.sort(function (a, b) {
		if (!b[1]) return -1;
		if (!a[1]) return 1;
		return b[1] - a[1];
	});

	for (let member of memberTimes) {
		if (!member[1]) {
			desc += `<@${member[0]}> | No log registered\n`;
		} else {
			desc += `<@${member[0]}> | <t:${member[1]}:f>\n`;
		}
	}
	return desc;
}
