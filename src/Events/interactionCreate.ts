import { Interaction } from 'discord.js';

import handleCommand from '../handlers/command.js';

import handleRequestButton from '../handlers/ticket/requestButton.js';
import handleRequestModalSubmit from '../handlers/ticket/requestModalSubmit.js';
import handleTicketIgnoreButton from '../handlers/ticket/ignoreButton.js';
import handleTicketOpenButton from '../handlers/ticket/openButton.js';
import handleTicketCloseButton from '../handlers/ticket/closeButton.js';
import handleFeedback from '../handlers/ticket/feedback.js';

export const name = 'interactionCreate';
export const once = false;
export async function execute(interaction: Interaction) {
	if (interaction.isCommand()) {
		await handleCommand(interaction);
	}

	if (interaction.isButton()) {
		if (interaction.customId == 'request') return await handleRequestButton(interaction);
		if (interaction.customId == 'ticket-ignore') return await handleTicketIgnoreButton(interaction);
		if (interaction.customId == 'ticket-open') return await handleTicketOpenButton(interaction);
		if (interaction.customId == 'ticket-close') return await handleTicketCloseButton(interaction);
		if (interaction.customId.startsWith('feedback')) return await handleFeedback(interaction);
	}

	if (interaction.isModalSubmit()) {
		if (interaction.customId == 'request') return await handleRequestModalSubmit(interaction);
	}
}
