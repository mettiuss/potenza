import { VoiceState, ChannelType, PermissionFlagsBits, VoiceBasedChannel, OverwriteResolvable } from 'discord.js';

export const name = 'voiceStateUpdate';
export const once = false;

export async function execute(oldState: VoiceState, newState: VoiceState) {
	createChannel(oldState, newState);
	leave(oldState, newState);
}

async function createChannel(oldState: VoiceState, newState: VoiceState) {
	if (!newState.guild || !newState.channel || !newState.member || newState.channelId !== process.env.CHANNEL_VOICE)
		return;

	const channelDoc = await newState.client.mongo.channel.findOne({
		owner: newState.member.id,
	});

	let channel;

	if (channelDoc) {
		channel = (await newState.guild.channels.fetch(channelDoc._id)) as VoiceBasedChannel;
	} else {
		let permissionOverwrites: OverwriteResolvable[] = [];
		for (const staff_id of JSON.parse(process.env.STAFF_CHANNEL!)) {
			permissionOverwrites.push({
				id: staff_id,
				allow: [PermissionFlagsBits.Connect],
			});
		}

		console.log(permissionOverwrites);

		channel = await newState.guild.channels.create({
			name: `${newState.member.user.username}'s channel`,
			type: ChannelType.GuildVoice,
			parent: newState.channel.parent,
			userLimit: 4,
			permissionOverwrites,
		});

		await newState.client.mongo.channel.insertOne({
			_id: channel.id,
			owner: newState.member.id,
		});
	}

	await newState.setChannel(channel);
}

async function leave(oldState: VoiceState, newState: VoiceState) {
	if (
		!oldState.channel ||
		oldState.channel.parentId !== process.env.CHANNEL_CATEGORY ||
		oldState.channel.members.size !== 0 ||
		oldState.channel.id === process.env.CHANNEL_VOICE
	)
		return;

	await oldState.client.mongo.channel.deleteOne({
		_id: oldState.channel.id,
	});

	await oldState.channel.delete();
}