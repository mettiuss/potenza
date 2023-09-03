import { ButtonInteraction, ChatInputCommandInteraction, EmbedBuilder, Message, TextChannel, User } from 'discord.js';
import { createChannelCreateOptions, getUserChannel } from './utils.js';
import { formatUser } from '../utils.js';
import { createLogEmbed, createUserEmbed } from './embeds.js';

export default async (
	interaction: ChatInputCommandInteraction | ButtonInteraction,
	user: User,
	richiestaUtenteMessage: Message | undefined = undefined
) => {
	if (!interaction.guild) return;

	if (getUserChannel(interaction.guild, user.id).size !== 0)
		return await interaction.reply({
			content: `**<:FNIT_Stop:857617083185758208> L'utente ${formatUser(user.id)} ha già un ticket aperto.**`,
			ephemeral: true,
		});

	const logChannel = (await interaction.client.channels.fetch('721809334178414614')) as TextChannel;
	const ticketChannel = await interaction.guild.channels.create(createChannelCreateOptions(interaction, user));
	await ticketChannel.send({ embeds: [createUserEmbed(interaction, user, 'open')] });
	await logChannel.send({ embeds: [createLogEmbed(interaction, user, 'open')] });
	if (interaction instanceof ButtonInteraction && richiestaUtenteMessage) {
		return await interaction.update({
			embeds: [
				new EmbedBuilder({
					description:
						'[`Richiesta presa in carico da ' +
						interaction.user.tag +
						'`](' +
						richiestaUtenteMessage.url +
						')',
					color: 0x00e3ff,
				}),
			],
			components: [],
		});
	}
	return await interaction.reply(`**Ticket aperto per ${formatUser(user.id)}**`);
};
