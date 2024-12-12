import { ChatInputCommandInteraction } from 'discord.js';
import { listSettings } from '../controllers/settings/list.js';
import { editSettings } from '../controllers/settings/edit.js';
import { SettingsSlashCommandBuilder } from '../controllers/settings/SettingsSlashCommandBuilder.js';

export const data = (
	new SettingsSlashCommandBuilder()
		.setName('settings')
		.setDescription(`Modifica le impostazioni del bot`)
		.setDMPermission(false)
		.addSubcommand((subcommand) =>
			subcommand.setName('list').setDescription('Lista di tutte le impostazioni del bot')
		) as SettingsSlashCommandBuilder
).addSettingsSubCommands();

export async function execute(interaction: ChatInputCommandInteraction) {
	if (interaction.options.getSubcommand() === 'list') return await listSettings(interaction);
	else return await editSettings(interaction);
}
