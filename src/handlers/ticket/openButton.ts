import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';
import { formatUser, fullTicketStaff, getUserChannel, hasStaffPermission } from '../../utils/ticket.js';
import { createChannelCreateOptions } from '../../controllers/ticket/open.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';

export default async function (interaction: ButtonInteraction) {
	if (
		!interaction.member ||
		!hasStaffPermission(interaction.member, fullTicketStaff(interaction.client)) ||
		!interaction.guild
	)
		return;

	const ticketDoc = await interaction.client.mongo.ticket.findOne({ message: interaction.message.id });

	const user = await interaction.client.users.fetch(ticketDoc._id);
	if (!user)
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **User not found**',
			ephemeral: true,
		});

	if (getUserChannel(interaction.guild, user.id)) {
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **This user already has an open ticket**',
			ephemeral: true,
		});
	}

	await interaction.reply({
		content: '<a:A_FNIT_Loading:1249346325946830971>',
		ephemeral: true,
	});

	const ticketChannel = await interaction.guild.channels.create(createChannelCreateOptions(interaction, user));
	if (!ticketChannel) return;

	const updateEmbed = new PotenzaEmbedBuilder(null, false)
		.setTitle(`:blue_circle: Richiesta di ${user.tag} presa in carico da ${interaction.user.tag}`)
		.setDescription(
			`**User:** ${formatUser(user.id)}\n**Staff:** ${formatUser(interaction.user.id)}\n**Channel:** <#${
				ticketChannel.id
			}>`
		)
		.addProblemFields(ticketDoc);

	await Promise.all([
		ticketChannel.send({
			embeds: [new PotenzaEmbedBuilder(interaction.guild).newTicket(user.id, ticketDoc.description)],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel('Chiudi Ticket')
						.setStyle(ButtonStyle.Danger)
						.setCustomId('ticket-close')
				),
			],
		}),
		interaction.client.ticketLogChannel.send({
			embeds: [
				new PotenzaEmbedBuilder(interaction.guild)
					.setTitle('**Richiesta Supporto Aperta**')
					.addWhoFields(interaction.user.id, user.id),
			],
		}),
		interaction.client.mongo.logs.insertOne({
			staff: interaction.user.id,
			action: 'open',
			at: new Date(),
		}),
		interaction.client.mongo.ticket.updateOne(
			{ message: interaction.message.id },
			{ $set: { channel: ticketChannel.id, staff: interaction.user.id } }
		),
		interaction.message.edit({
			content: '',
			embeds: [updateEmbed],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel('Chiudi Ticket')
						.setStyle(ButtonStyle.Danger)
						.setCustomId('ticket-close')
				),
			],
		}),
	]);

	await interaction.editReply({
		content: `**Ticket aperto per ${formatUser(user.id)}**`,
	});
}
