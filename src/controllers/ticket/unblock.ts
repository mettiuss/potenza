import { ChatInputCommandInteraction, User } from 'discord.js';
import { formatUser } from '../../utils/ticket.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';

export async function ticketUnblock(interaction: ChatInputCommandInteraction, user: User) {
	const doc = await interaction.client.mongo.block.findOne({ _id: user.id });
	if (!doc)
		return await interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> L'utente ${formatUser(user.id)} non è bloccato`,
			ephemeral: true,
		});

	await interaction.deferReply();

	await Promise.all([
		interaction.client.mongo.block.deleteOne({ _id: user.id }),
		interaction.client.mongo.logs.insertOne({
			staff: interaction.user.id,
			action: 'unblock',
			at: new Date(),
		}),
		interaction.client.ticketLogChannel.send({
			embeds: [
				new PotenzaEmbedBuilder(interaction.guild)
					.setTitle('**Utente sbloccato**')
					.addWhoFields(interaction.user.id, user.id),
			],
		}),
	]);

	await interaction.editReply(`**L'utente ${formatUser(user.id)} è stato sbloccato**`);
}
