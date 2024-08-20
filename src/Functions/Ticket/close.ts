import { ChatInputCommandInteraction, ModalSubmitInteraction, TextChannel, User } from 'discord.js';
import { getUserChannel } from './utils.js';
import { formatUser } from '../../utils.js';
import { createLogEmbed, createUserEmbed } from './embeds.js';
import discordTranscripts from 'discord-html-transcripts';
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

async function deleteTicketChannel(channel: TextChannel) {
	await channel.edit({ topic: '' });
	await channel.delete();
}

async function sendCloseMessage(
	interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
	user: User,
	reason: string
) {
	try {
		const userId = interaction.user.id; // UserID del Vindertech
		const LikeButton = new ButtonBuilder()
			.setCustomId(`feedback_like_${userId}`)
			.setLabel('👍')
			.setStyle(ButtonStyle.Primary);
		const NoLikeButton = new ButtonBuilder()
			.setCustomId(`feedback_nolike_${userId}`)
			.setLabel('👎')
			.setStyle(ButtonStyle.Danger);

		await user.send({
			embeds: [createUserEmbed(interaction, user, 'close', reason)],
			components: [new ActionRowBuilder<ButtonBuilder>().addComponents(LikeButton, NoLikeButton)],
		});
	} catch {}
}

export default async (
	interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
	user: User,
	reason: string
) => {
	if (!interaction.guild) return;

	const userChannel = getUserChannel(interaction.guild, user.id);

	if (userChannel.size === 0) {
		if (interaction instanceof ModalSubmitInteraction) {
			await interaction.editReply({
				content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(
					user.id
				)} non possiede nessun ticket aperto.**`,
			});
			return;
		}
		await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(
				user.id
			)} non possiede nessun ticket aperto.**`,
			ephemeral: true,
		});
		return;
	}

	if (interaction instanceof ChatInputCommandInteraction) await interaction.deferReply();

	const channel = userChannel.at(0) as TextChannel;

	const attachment = await discordTranscripts.createTranscript(channel, {
		saveImages: true,
		poweredBy: false,
	});

	const res = await Promise.all([
		interaction.client.log_channel.send({
			embeds: [createLogEmbed(interaction, user, 'close', reason)],
			files: [attachment],
		}),
		interaction.client.mongo.descriptions.deleteOne({ _id: channel.id }),
		deleteTicketChannel(channel),
		sendCloseMessage(interaction, user, reason),
		interaction.client.mongo.logs.insertOne({
			staff: interaction.user.id,
			action: 'close',
			at: new Date(),
		}),
	]);

	return res[0].attachments.at(0)!.url;
};
