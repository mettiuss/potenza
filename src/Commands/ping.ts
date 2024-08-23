import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder().setName('ping').setDescription(`Ritorna la latenza del bot`);

function formatMs(ms: number): string {
	if (ms > 1000 * 60 * 60 * 24 * 2) return `${Math.round(ms / (1000 * 60 * 60 * 24))} days`;

	if (ms > 1000 * 60 * 60 * 2) return `${Math.round(ms / (1000 * 60 * 60))} hours`;

	if (ms > 1000 * 60 * 2) return `${Math.round(ms / (1000 * 60))} minutes`;

	return `${Math.round(ms / 1000)} seconds`;
}

export async function execute(interaction: ChatInputCommandInteraction) {
	const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });

	const embed = new EmbedBuilder({
		description: `**Pong Client** 🏓   [${interaction.client.ws.ping} ms]\n**Pong Messaggio** 📧 [${
			sent.createdTimestamp - interaction.createdTimestamp
		} ms]\n**Uptime Client** :stopwatch:  [${formatMs(interaction.client.uptime)}]`,
	}).setColor(interaction.client.color as ColorResolvable);

	await interaction.editReply({ content: '', embeds: [embed] });
}
