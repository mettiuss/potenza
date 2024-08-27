import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { formatCode, formatUser } from '../../utils/ticket.js';

export async function ticketBlocked(interaction: ChatInputCommandInteraction) {
	const docs = await interaction.client.mongo.block.find().toArray();
	let current_page = 0;
	const total_pages = Math.ceil(docs.length / ELEMENTS_PAGE);

	const message = await interaction.reply({
		embeds: [makeEmbed(docs, current_page)],
		components: getComponentsRow(current_page, total_pages),
	});

	const collector = message.createMessageComponentCollector({
		filter: ({ user }) => user.id === interaction.user.id,
	});

	collector.on('collect', async (interaction) => {
		switch (interaction.customId) {
			case 'start':
				current_page = 0;
				break;
			case 'back':
				current_page -= 1;
				break;
			case 'forward':
				current_page += 1;
				break;
			case 'end':
				current_page = total_pages - 1;
				break;
			case 'stop':
				await interaction.update({
					embeds: [makeEmbed(docs, current_page)],
					components: [],
				});
				return;
		}

		await interaction.update({
			embeds: [makeEmbed(docs, current_page)],
			components: getComponentsRow(current_page, total_pages),
		});
	});
}

const ELEMENTS_PAGE = 5;

function getComponentsRow(current_page: number, total_pages: number) {
	if (total_pages === 1) return [];
	return [
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel('<<')
				.setStyle(ButtonStyle.Secondary)
				.setCustomId('start')
				.setDisabled(current_page === 0),
			new ButtonBuilder()
				.setLabel('<')
				.setStyle(ButtonStyle.Primary)
				.setCustomId('back')
				.setDisabled(current_page === 0),
			new ButtonBuilder()
				.setLabel('>')
				.setStyle(ButtonStyle.Primary)
				.setCustomId('forward')
				.setDisabled(current_page + 1 === total_pages),
			new ButtonBuilder()
				.setLabel('>>')
				.setStyle(ButtonStyle.Secondary)
				.setCustomId('end')
				.setDisabled(current_page + 1 === total_pages),
			new ButtonBuilder().setLabel('Stop').setStyle(ButtonStyle.Danger).setCustomId('stop')
		),
	];
}

function makeEmbed(docs: any, current_page: number) {
	const startElement = current_page * ELEMENTS_PAGE;
	const elements = docs.slice(startElement, startElement + ELEMENTS_PAGE);

	let description = '';
	elements.forEach((doc: any) => {
		description += `**User:** ${formatUser(doc._id)}\n**Staff:** <@${doc.staff}>\n**Reason:** ${formatCode(
			doc.reason
		)}\n**Date:** <t:${Math.floor(doc.at.getTime() / 1000)}:f>\n\n`;
	});

	return new EmbedBuilder({
		title: `Showing users ${startElement + 1}-${startElement + elements.length} out of ${docs.length}`,
		color: 58367,
		description: description,
	});
}
