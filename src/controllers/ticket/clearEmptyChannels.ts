import { CategoryChannel, ChannelType, Client } from 'discord.js';

export async function clearEmptyChannels(client: Client) {
	const category = (await client.channels.fetch(client.settings['channel-category'])) as CategoryChannel;
	category.children.cache.forEach((channel, channelId) => {
		if (channel.type !== ChannelType.GuildVoice || channelId === client.settings['channel-voice']) return;
		if (channel.members.size !== 0) return;

		try {
			client.mongo.channel.deleteOne({
				_id: channel.id,
			});
		} catch {}
		channel.delete();
	});
}
