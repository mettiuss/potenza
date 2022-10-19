import { readdirSync } from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';

export default async function slashInit() {
	const commands = [];
	const commandFiles = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		let command = await import(`../dist/commands/${file}`);
		if (command.permissions) command.data.defaultPermission = false;
		command.data.permissions = command.permissions;
		commands.push(command.data);
	}
	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

	rest.put(Routes.applicationGuildCommands(process.env.APPID!, process.env.GUILD_ID!), {
		body: commands,
	}).catch(console.error);
}
