import { ButtonInteraction, ChatInputCommandInteraction, TextChannel, User } from 'discord.js';
import { getUserChannel } from './utils.js';
import { formatUser } from '../utils.js';
import { createLogEmbed, createUserEmbed } from './embeds.js';
import discordTranscripts from 'discord-html-transcripts';

export default async (interaction: ChatInputCommandInteraction | ButtonInteraction, user: User, reason: string) => {
	if (!interaction.guild) return;

	const userChannel = getUserChannel(interaction.guild, user.id);

	if (userChannel.size === 0) {
		await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(
				user.id
			)} non possiede nessun ticket aperto.**`,
			ephemeral: true,
		});
		return;
	}

	const channel = userChannel.at(0) as TextChannel;

	const attachment = await discordTranscripts.createTranscript(channel, {
		saveImages: true,
		poweredBy: false,
	});

	await channel.edit({ topic: '' });
	await channel.delete();
	await interaction.client.mongo.logs.insertOne({
		staff: interaction.user.id,
		action: 'close',
		at: new Date(),
	});
	try {
		await user.send({ embeds: [createUserEmbed(interaction, user, 'close', reason)] });
	} catch {}

	const logMessage = await interaction.client.log_channel.send({
		embeds: [createLogEmbed(interaction, user, 'close', reason)],
		files: [attachment],
	});

	return logMessage.attachments.at(0)!.url;
};
