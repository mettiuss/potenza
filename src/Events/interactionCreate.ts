import { Interaction } from 'discord.js';
import { handleCommand } from '../HandleInteractions/Command.js';
import { handleRequestButton } from '../HandleInteractions/ticket/requestButton.js';
import { handleRequestModalSubmit } from '../HandleInteractions/ticket/requestModalSubmit.js';
import { handleTicketOpenButton } from '../HandleInteractions/ticket/ticketOpenButton.js';
import { handleTicketCloseButton } from '../HandleInteractions/ticket/ticketCloseButton.js';

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
