import { ChatInputCommandInteraction } from 'discord.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';
import { formatSetting, settingsCategories } from '../../utils/settings.js';

export async function listSettings(interaction: ChatInputCommandInteraction) {
	const embed = new PotenzaEmbedBuilder(null, false).setTitle(':gear: Impostazioni Potenza');

	for (const category of settingsCategories) {
		let value = '';

		for (const setting of category.elements) value += formatSetting(setting, interaction.client.settings);

		embed.addFields({
			name: category.name,
			value,
		});
	}

	return await interaction.reply({
		embeds: [embed],
		ephemeral: true,
	});
}
