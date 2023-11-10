import { VoiceState, ChannelType, PermissionFlagsBits } from 'discord.js';

export const name = 'voiceStateUpdate';
export const once = false;

export async function execute(oldState: VoiceState, newState: VoiceState) {
  const channelID = '1164249961093926974'; // ID MAIN CHANNEL

  if (!newState.member || newState.channelId !== channelID || !newState.channel) return;

  const user = newState.member.user;
  const newChannelName = `${user.username}'s channel`;

  console.log('Creating voice channel...');

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

    console.log('Channel created:', newChannel);
    newState.setChannel(newChannel);
    console.log('User moved to the channel');
}

