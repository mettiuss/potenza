import { ChatInputCommandInteraction, GuildMember, TextChannel, User } from 'discord.js';
import { formatUser } from '../utils.js';
import { createBlockLogEmbed } from './embeds.js';

export default async (interaction: ChatInputCommandInteraction, user: User) => {
	const doc = await interaction.client.mongo.block.findOne({ _id: user.id });
	if (doc)
		return await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(user.id)} è già stato bloccato da <@${
				doc.staff
			}> il <t:${Math.floor(doc.at.getTime() / 1000)}:f>**`,
			ephemeral: true,
		});
	if (!(interaction.member instanceof GuildMember))
		return await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> C'è stato un errore, riprova**`,
			ephemeral: true,
		});
	await interaction.client.mongo.block.insertOne({
		_id: user.id,
		staff: interaction.member.id,
		at: new Date(),
	});
	await interaction.client.log_channel.send({ embeds: [createBlockLogEmbed(interaction, user, 'block')] });
	await interaction.client.mongo.logs.insertOne({
		staff: interaction.user.id,
		action: 'block',
		at: new Date(),
	});
	return await interaction.reply(`**L'utente ${formatUser(user.id)} è stato bloccato**`);
};
