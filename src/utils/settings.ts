import { formatCode } from './ticket.js';

interface Setting {
	id: string;
	name: string;
	description: string;
	type: string;
	list: boolean;
}

const ticket_category = {
	id: 'ticket-category',
	name: 'Categoria Ticket',
	description: `La categoria all'interno della quale vengono creati i canali dei ticket.`,
	type: 'channel',
	list: false,
};

const ticket_log = {
	id: 'ticket-log',
	name: 'Canale Ticket Log',
	description: `Il canale dove verranno inviati i messaggi di log per la funzione di ticket.`,
	type: 'channel',
	list: false,
};

const ticket_richieste = {
	id: 'ticket-richieste',
	name: 'Canale Nuove Richieste',
	description: `Il canale dove verranno inviate le nuove richieste.`,
	type: 'channel',
	list: false,
};

const ticket_staff = {
	id: 'ticket-staff',
	name: 'Staff Ticket',
	description: `I ruoli che hanno accesso ai ticket e possono eseguire la maggior parte delle azioni.`,
	type: 'mentionable',
	list: true,
};

const ticket_staff_admin = {
	id: 'ticket-staff-admin',
	name: 'Admin Staff Ticket',
	description: `I ruoli che hanno accesso alle funzionalità admin dei ticket, come l'eliminazione di richieste.`,
	type: 'mentionable',
	list: true,
};

const channel_category = {
	id: 'channel-category',
	name: 'Custom Channel Category',
	description: `La categoria all'interno della quale vengono creati i canali vocali custom.`,
	type: 'channel',
	list: false,
};

const channel_voice = {
	id: 'channel-voice',
	name: 'Create Voice Channel',
	description: `Il canale vocale per la creazione dei canali vocali custom.`,
	type: 'channel',
	list: false,
};

const channel_mute = {
	id: 'channel-mute',
	name: 'Mute Role',
	description: `Il ruolo di mute del server, gli utenti con questo ruolo non possono entrare in vocale.`,
	type: 'mentionable',
	list: false,
};

const channel_staff = {
	id: 'channel-staff',
	name: 'Staff Custom Channel',
	description: `I ruoli di moderazione dei canali vocali, questi utenti non possono essere espulsi.`,
	type: 'mentionable',
	list: true,
};

export const settingsList = [
	ticket_category,
	ticket_log,
	ticket_richieste,
	ticket_staff,
	ticket_staff_admin,
	channel_category,
	channel_voice,
	channel_mute,
	channel_staff,
];

export const settingsCategories = [
	{
		name: '<:FNIT_Vindertech:678655323115880512> Ticket',
		elements: [ticket_category, ticket_log, ticket_richieste, ticket_staff, ticket_staff_admin],
	},
	{
		name: ':speaking_head: Channel',
		elements: [channel_category, channel_voice, channel_mute, channel_staff],
	},
];

export const settingsName = Object.fromEntries(settingsList.map((s) => [s.name.split(' ').join('-').toLowerCase(), s]));

export function formatSetting(setting: Setting, settings: any) {
	let value = '';
	value += `${formatCode(setting.name)}: `;

	if (!settings[setting.id]) {
		value += '❗ **undefined**\n';
		return value;
	}

	if (setting.list) {
		value += '[';
		value += settings[setting.id]
			.map((el: string) => {
				switch (setting.type) {
					case 'channel':
						return `<#${el}>`;
					case 'mentionable':
						return `<@&${el}>`;
				}
			})
			.join(', ');
		value += `]\n`;
	} else {
		switch (setting.type) {
			case 'channel':
				value += `<#${settings[setting.id]}>\n`;
				break;
			case 'mentionable':
				value += `<@&${settings[setting.id]}>\n`;
				break;
		}
	}
	return value;
}
