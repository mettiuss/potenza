import { SlashCommandBuilder } from 'discord.js';
import { settingsList } from '../../utils/settings.js';

export class SettingsSlashCommandBuilder extends SlashCommandBuilder {
	public constructor() {
		super();
	}
	addSettingsSubCommands(): this {
		for (let setting of settingsList) {
			this.addSubcommand((subcommand) => {
				subcommand.setName(setting.name.split(' ').join('-').toLowerCase()).setDescription(setting.description);

				if (setting.list)
					subcommand.addStringOption((input) =>
						input
							.setName('azione')
							.setDescription(`L'azione da apportare all'oggetto specificato`)
							.addChoices({ name: 'Aggiungi', value: 'add' }, { name: 'Rimuovi', value: 'remove' })
							.setRequired(true)
					);

				switch (setting.type) {
					case 'channel':
						subcommand.addChannelOption((input) =>
							input
								.setName('canale')
								.setDescription('Il canale a cui si riferisce questa azione')
								.setRequired(true)
						);
						break;
					case 'mentionable':
						subcommand.addMentionableOption((input) =>
							input
								.setName('ruolo')
								.setDescription(`Il ruolo a cui si riferisce questa azione`)
								.setRequired(true)
						);
						break;
					default:
						break;
				}

				return subcommand;
			});
		}
		return this;
	}
}
