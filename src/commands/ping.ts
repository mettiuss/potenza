import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { formatMilliseconds } from '../controllers/ping.js';
import { PotenzaEmbedBuilder } from '../utils/PotenzaEmbedBuilder.js';

export const data = new SlashCommandBuilder().setName('ping').setDescription(`Ritorna la latenza del bot`);
export async function execute(interaction: ChatInputCommandInteraction) {
	const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });

	const clientPing = interaction.client.ws.ping;
	const messagePing = sent.createdTimestamp - interaction.createdTimestamp;
	const clientUptime = formatMilliseconds(interaction.client.uptime || 0);

	const embed = new PotenzaEmbedBuilder(null, false).setDescription(
		`**Pong Client** 🏓   [${clientPing} ms]\n**Pong Messaggio** 📧 [${messagePing} ms]\n**Uptime Client** :stopwatch:  [${clientUptime}]`
	);

	await interaction.editReply({ content: '', embeds: [embed] });
}
