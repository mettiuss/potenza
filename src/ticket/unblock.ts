import { ChatInputCommandInteraction, TextChannel, User } from 'discord.js';
import { formatUser } from '../utils.js';
import { createBlockLogEmbed } from './embeds.js';

export default async (interaction: ChatInputCommandInteraction, user: User) => {
	const doc = await interaction.client.mongo.block.findOne({ _id: user.id });
	if (!doc)
		return await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(user.id)} non è bloccato**`,
			ephemeral: true,
		});
	await interaction.client.mongo.block.deleteOne({ _id: user.id });
	await interaction.client.log_channel.send({ embeds: [createBlockLogEmbed(interaction, user, 'block')] });
	await interaction.client.mongo.logs.insertOne({
		staff: interaction.user.id,
		action: 'unblock',
		at: new Date(),
	});
	return await interaction.reply(`**L'utente ${formatUser(user.id)} è stato sbloccato**`);
};
