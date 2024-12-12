import discord from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import prettier from 'prettier';

export const data = new SlashCommandBuilder()
	.setName('eval')
	.setDescription(`Admin command`)
	.addStringOption((input) => input.setName('code').setDescription('The code to execute').setRequired(true))
	.setDMPermission(false);
export async function execute(interaction: discord.ChatInputCommandInteraction) {
	if (interaction.user.id !== '707165674845241344') return;

	const code = interaction.options.getString('code', true);

	try {
		(globalThis as any).client = interaction.client;
		(globalThis as any).guild = interaction.guild;
		(globalThis as any).channel = interaction.channel;
		(globalThis as any).user = interaction.user;
		(globalThis as any).discord = discord;

		let evaluated = await Object.getPrototypeOf(async function () {}).constructor(code)();

		evaluated = String(evaluated).replaceAll(interaction.client.token, '[TOKEN]');

		await interaction.reply({
			content: `:inbox_tray: **Input**\n\`\`\`js\n${await prettier.format(code, { parser: 'babel' })}\n\`\`\`\n:outbox_tray: **Output**\n\`\`\`js\n${evaluated}\n\`\`\``,
			ephemeral: true,
		});
	} catch (e: any) {
		await interaction.reply({
			content: `:x: **Error**\n\`\`\`js\n${e.stack}\n\`\`\``,
			ephemeral: true,
		});
	}
}
