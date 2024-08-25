import 'dotenv/config';
import { readdirSync } from 'fs';
import { REST, Routes } from 'discord.js';

const { TOKEN, APP_ID, GUILD_ID, NODE_ENV } = process.env;

// Fetch the commands
const commands = [];
const commandFiles = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	let command = await import(`../dist/commands/${file}`);
	commands.push(command.data);
}

// Register the commands
const rest = new REST().setToken(TOKEN!);

const route =
	NODE_ENV == 'DEV' ? Routes.applicationGuildCommands(APP_ID!, GUILD_ID!) : Routes.applicationCommands(APP_ID!);

try {
	await rest.put(route, {
		body: commands,
	});

	console.log('Slash commands refreshed');
} catch (e) {
	console.log(e);
}
