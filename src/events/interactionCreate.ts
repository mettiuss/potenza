import { Interaction } from 'discord.js';
import { handleChatInputCommand } from '../handles/chatInputCommand.js';
import { handleRequestButton } from '../handles/ticket/requestButton.js';
import { handleRequestModalSubmit } from '../handles/ticket/requestModalSubmit.js';
import { handleTicketOpenButton } from '../handles/ticket/ticketOpenButton.js';

export const name = 'interactionCreate';
export const once = false;
export async function execute(interaction: Interaction) {
	if (interaction.isChatInputCommand()) {
		await handleChatInputCommand(interaction);
	}
	if (interaction.isButton()) {
		switch (interaction.customId) {
			case 'vindertech':
				return await handleRequestButton(interaction);
			case 'ticket-open':
				return await handleTicketOpenButton(interaction);
		}
	}

	if (interaction.isModalSubmit()) {
		switch (interaction.customId) {
			case 'vindertech':
				return await handleRequestModalSubmit(interaction);
		}
	}
}
