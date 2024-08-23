import { Message, PartialMessage } from 'discord.js';
import { handleTicketMessageDelete } from '../controllers/ticket/ignore.js';

export const name = 'messageDelete';
export const once = false;
export async function execute(message: Message | PartialMessage) {
	handleTicketMessageDelete(message);
}
