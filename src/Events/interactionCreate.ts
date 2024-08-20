import { Interaction } from 'discord.js';
import { handleRequestButton } from '../HandleInteractions/ticket/requestButton.js';
import { handleRequestModalSubmit } from '../HandleInteractions/ticket/requestModalSubmit.js';
import { handleTicketOpenButton } from '../HandleInteractions/ticket/ticketOpenButton.js';
import { handleTicketCloseButton } from '../HandleInteractions/ticket/ticketCloseButton.js';
import { handleFeedback } from '../HandleInteractions/handleFeedback.js';
import { handleCommand } from '../HandleInteractions/Command.js';

export const name = 'interactionCreate';
export const once = false;
export async function execute(interaction: Interaction) {
	if (interaction.isCommand()) {
		await handleCommand(interaction);
	}

	if (interaction.isButton()) {
		if (interaction.customId == 'vindertech') return await handleRequestButton(interaction);
		if (interaction.customId == 'ticket-open') return await handleTicketOpenButton(interaction);
		if (interaction.customId == 'ticket-close') return await handleTicketCloseButton(interaction);
		if (interaction.customId.startsWith('feedback')) return await handleFeedback(interaction);
	}

	if (interaction.isModalSubmit()) {
		if (interaction.customId == 'vindertech') return await handleRequestModalSubmit(interaction);
	}
}
