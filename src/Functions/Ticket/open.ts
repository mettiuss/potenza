import { ButtonInteraction, ChatInputCommandInteraction, User } from 'discord.js';
import { createChannelCreateOptions, getUserChannel } from './utils.js';
import { formatUser } from '../../utils.js';
import { createLogEmbed, createUserEmbed } from './embeds.js';

export default async (interaction: ChatInputCommandInteraction | ButtonInteraction, user: User) => {
	if (!interaction.guild) return;

	if (getUserChannel(interaction.guild, user.id).size !== 0) {
		await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(user.id)} ha già un ticket aperto.**`,
			ephemeral: true,
		});
		return;
	}

	if (interaction instanceof ButtonInteraction)
		await interaction.update({
			content: '<a:A_FNIT_Upload:751852538961068144>',
		});

	const ticketChannel = await interaction.guild.channels.create(createChannelCreateOptions(interaction, user));

	if (interaction instanceof ButtonInteraction)
		await interaction.client.mongo.descriptions.insertOne({
			_id: ticketChannel.id,
			description: interaction.message.embeds[0].fields[0].value,
		});

	await Promise.all([
		ticketChannel.send({ embeds: [createUserEmbed(interaction, user, 'open')] }),
		interaction.client.log_channel.send({ embeds: [createLogEmbed(interaction, user, 'open')] }),
		interaction.client.mongo.logs.insertOne({
			staff: interaction.user.id,
			action: 'open',
			at: new Date(),
		}),
	]);
	return ticketChannel.id;
};
