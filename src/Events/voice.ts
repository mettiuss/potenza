import { VoiceState, ChannelType, PermissionFlagsBits } from 'discord.js';

export const name = 'voiceStateUpdate';
export const once = false;

export async function execute(oldState: VoiceState, newState: VoiceState) {
  if (!newState.channel || !newState.member || newState.channelId !== process.env.CREATE_CHANNEL_ID) return;

  const newChannelName = `${newState.member.user.username}'s channel`;

  const newChannel = await newState.guild!.channels.create({
    name: newChannelName,
    type: ChannelType.GuildVoice,
    parent: newState.channel.parent,
    permissionOverwrites: [
      {
        id: newState.guild!.id,
        allow: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: newState.member.id,
        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Speak, PermissionFlagsBits.ManageChannels],
      },
    ],
  });
  await newState.setChannel(newChannel);
}

