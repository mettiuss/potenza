import { Interaction } from 'discord.js';
import { handleCommand } from '../handles/Command.js';
import { handleRequestButton } from '../handles/ticket/requestButton.js';
import { handleRequestModalSubmit } from '../handles/ticket/requestModalSubmit.js';
import { handleTicketOpenButton } from '../handles/ticket/ticketOpenButton.js';
import { handleTicketCloseButton } from '../handles/ticket/ticketCloseButton.js';

export const name = 'interactionCreate';
export const once = false;
export async function execute(interaction: Interaction) {
	if (interaction.isCommand()) {
		await handleCommand(interaction);
	}
	if (interaction.isButton()) {
		switch (interaction.customId) {
			case 'vindertech':
				return await handleRequestButton(interaction);
			case 'ticket-open':
				return await handleTicketOpenButton(interaction);
			case 'ticket-close':
				return await handleTicketCloseButton(interaction);
		}
	}

	if (interaction.isModalSubmit()) {
		switch (interaction.customId) {
			case 'vindertech':
				return await handleRequestModalSubmit(interaction);
		}
	}
}
