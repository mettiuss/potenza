import { ButtonInteraction, ChatInputCommandInteraction, TextChannel, User } from 'discord.js';
import { getUserChannel } from './utils.js';
import { formatCode, formatUser } from '../utils.js';
import { createLogEmbed, createUserEmbed } from './embeds.js';

export default async (interaction: ChatInputCommandInteraction | ButtonInteraction, user: User, reason: string) => {
	if (!interaction.guild) return;

	let userChannel = getUserChannel(interaction.guild, user.id);

	if (userChannel.size === 0)
		return await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(
				user.id
			)} non possiede nessun ticket aperto.**`,
			ephemeral: true,
		});

	await userChannel.at(0)?.edit({ topic: '' });
	await userChannel.at(0)?.delete();
	try {
		await user.send({ embeds: [createUserEmbed(interaction, user, 'close', reason)] });
	} catch {}
	const logChannel = (await interaction.client.channels.fetch('721809334178414614')) as TextChannel;
	await logChannel.send({ embeds: [createLogEmbed(interaction, user, 'close', reason)] });
	return await interaction.reply(
		`**Ticket chiuso per ${formatUser(user.id)} con motivazione: ${formatCode(reason)}**`
	);
};
