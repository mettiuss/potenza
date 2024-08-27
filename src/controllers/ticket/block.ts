import { ChatInputCommandInteraction, User } from 'discord.js';
import { formatCode, formatUser } from '../../utils/ticket.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';

export async function ticketBlock(interaction: ChatInputCommandInteraction, user: User, reason: string) {
	const doc = await interaction.client.mongo.block.findOne({ _id: user.id });
	if (doc)
		return interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> L'utente ${formatUser(user.id)} è già stato bloccato da <@${
				doc.staff
			}> il <t:${Math.floor(doc.at.getTime() / 1000)}:f>`,
			ephemeral: true,
		});

	await interaction.deferReply();

	await Promise.all([
		interaction.client.mongo.block.insertOne({
			_id: user.id,
			staff: interaction.user.id,
			at: new Date(),
			reason,
		}),
		interaction.client.mongo.logs.insertOne({
			staff: interaction.user.id,
			action: 'block',
			at: new Date(),
		}),
		interaction.client.ticketLogChannel.send({
			embeds: [
				new PotenzaEmbedBuilder(interaction.guild)
					.setTitle('**Utente bloccato**')
					.addWhoFields(interaction.user.id, user.id, reason),
			],
		}),
	]);

	await interaction.editReply(
		`**L'utente ${formatUser(user.id)} è stato bloccato con motivazione ${formatCode(reason)}**`
	);
}
