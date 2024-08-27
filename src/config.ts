import { readdirSync } from 'fs';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { MongoClient } from 'mongodb';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
	],
	partials: [Partials.Message],
});

// Initialize Mongodb
const mongo = new MongoClient(process.env.MONGO as string);
const mongoDb = mongo.db(process.env.MONGO_DB);
client.mongo = {
	block: mongoDb.collection('ticket-block'),
	ticket: mongoDb.collection('ticket'),
	logs: mongoDb.collection('logs'),
	channel: mongoDb.collection('channel'),
	feedback: mongoDb.collection('feedback'),
	settings: mongoDb.collection('settings'),
};

// Load Settings
client.settings = await client.mongo.settings.findOne({ _id: 'settings' });

// Load Commands
client.commands = new Collection();
const commandFiles = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	import(`../dist/commands/${file}`).then((command) => client.commands.set(command.data.name, command));
}

// Load Events
const eventFiles = readdirSync('./dist/events').filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	import(`../dist/events/${file}`).then((event) => {
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	});
}

export default client;
