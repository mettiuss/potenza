import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	GuildMember,
} from 'discord.js';
import { formatUser } from '../utils.js';

export async function sendList(interaction: CommandInteraction) {
	const backId = 'back';
	const forwardId = 'forward';
	const backButton = new ButtonBuilder()
		.setLabel('Indietro')
		.setEmoji('⬅️')
		.setStyle(ButtonStyle.Secondary)
		.setCustomId(backId);
	const forwardButton = new ButtonBuilder()
		.setLabel('Avanti')
		.setEmoji('➡️')
		.setStyle(ButtonStyle.Secondary)
		.setCustomId(forwardId);

	const el = interaction.client.mongo.find();
	const docs = await el.toArray();

	/**
	 * Creates an embed with guilds starting from an index.
	 * @param {number} start The index to start from.
	 * @returns {Promise<MessageEmbed>}
	 */
	const generateEmbed = async (start: number) => {
		const current = docs.slice(start, start + 2);

		// You can of course customise this embed however you want
		return new EmbedBuilder({
			title: `Showing users ${start + 1}-${start + current.length} out of ${docs.length}`,
			color: 58367,
			fields: await Promise.all(
				current.map(async (doc: any) => ({
					name: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬',
					value: `**User:** ${formatUser(doc._id)}\n**Time:** <t:${Math.floor(
						doc.at.getTime() / 1000
					)}:f>\n**Staff:** <@${doc.staff}>`,
				}))
			),
		});
	};

	// Send the embed with the first 2 guilds
	const canFitOnOnePage = docs.length <= 2;
	const embedMessage = await interaction.reply({
		embeds: [await generateEmbed(0)],
		components: canFitOnOnePage ? [] : [new ActionRowBuilder<ButtonBuilder>().addComponents(forwardButton)],
	});
	// Exit if there is only one page of guilds (no need for all of this)
	if (canFitOnOnePage) return;

	// Collect button interactions (when a user clicks a button),
	// but only when the button as clicked by the original message author
	const collector = embedMessage.createMessageComponentCollector({
		filter: ({ user }) => user.id === (interaction.member as GuildMember).id,
	});

	let currentIndex = 0;
	collector.on('collect', async (interaction) => {
		// Increase/decrease index
		interaction.customId === backId ? (currentIndex -= 2) : (currentIndex += 2);
		// Respond to interaction by updating message with new embed
		await interaction.update({
			embeds: [await generateEmbed(currentIndex)],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					...(currentIndex ? [backButton] : []),
					// forward button if it isn't the end
					...(currentIndex + 2 < docs.length ? [forwardButton] : []),
				]),
			],
		});
	});
}
