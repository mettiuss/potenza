import { Interaction } from 'discord.js';
import { ticketOpen } from '../functions/ticket.js';
import { handleModal, showModal } from '../functions/ticket-modal.js';

export const name = 'interactionCreate';
export const once = false;
export async function execute(interaction: Interaction) {
	if (interaction.isCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
	if (interaction.isButton()) {
		switch (interaction.customId) {
			case 'vindertech':
				return await showModal(interaction);
			case 'ticket-open':
				return await ticketOpen(interaction);
		}
	}

	if (interaction.isModalSubmit()) {
		switch (interaction.customId) {
			case 'vindertech':
				return await handleModal(interaction);
		}
	}
}
