import { ChatInputCommandInteraction, TextChannel, User } from 'discord.js';
import { formatUser } from '../utils.js';
import { createBlockLogEmbed } from './embeds.js';

export default async (interaction: ChatInputCommandInteraction, user: User) => {
	const doc = await interaction.client.mongo.findOne({ _id: user.id });
	if (!doc)
		return await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(user.id)} non è bloccato**`,
			ephemeral: true,
		});
	await interaction.client.mongo.deleteOne({ _id: user.id });
	const logChannel = (await interaction.client.channels.fetch('721809334178414614')) as TextChannel;
	await logChannel.send({ embeds: [createBlockLogEmbed(interaction, user, 'block')] });
	return await interaction.reply(`**L'utente ${formatUser(user.id)} è stato sbloccato**`);
};
