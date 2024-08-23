import 'dotenv/config';
import { readdirSync } from 'fs';
import { REST, Routes } from 'discord.js';

export default async function slashInit() {
	const commands = [];
	const commandFiles = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		let command = await import(`../dist/commands/${file}`);
		commands.push(command.data);
	}
	const rest = new REST().setToken(process.env.TOKEN!);

	try {
		if (process.env.DEVELOPMENT) {
			await rest.put(Routes.applicationGuildCommands(process.env.APP_ID!, process.env.GUILD_ID!), {
				body: commands,
			});
		} else {
			await rest.put(Routes.applicationCommands(process.env.APP_ID!), {
				body: commands,
			});
		}
		console.log('Slash commands refreshed');
	} catch (e) {
		console.log(e);
	}
}

await slashInit();
