import { ChatInputCommandInteraction } from 'discord.js';
import { formatSetting, settingsName } from '../../utils/settings.js';

export async function editSettings(interaction: ChatInputCommandInteraction) {
	const setting_data = settingsName[interaction.options.getSubcommand()];

	let data;
	switch (setting_data.type) {
		case 'channel':
			data = interaction.options.getChannel('canale', true);
			break;
		case 'mentionable':
			data = interaction.options.getMentionable('ruolo', true);
			break;
	}

	if (setting_data.list) {
		const action = interaction.options.getString('azione', true);
		if (action == 'add') {
			if (!interaction.client.settings[setting_data.id]) interaction.client.settings[setting_data.id] = [];
			interaction.client.settings[setting_data.id].push((data as any).id);
		} else {
			let index = interaction.client.settings[setting_data.id].indexOf((data as any).id);
			interaction.client.settings[setting_data.id].splice(index, 1);
		}
	} else {
		interaction.client.settings[setting_data.id] = (data as any).id;
	}

	await interaction.client.mongo.settings.updateOne({ _id: 'settings' }, { $set: interaction.client.settings });
	await interaction.reply({
		content: `**Setting has been changed**\n${formatSetting(setting_data, interaction.client.settings)}`,
		ephemeral: true,
	});
}
