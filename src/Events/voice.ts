import { VoiceState, ChannelType, PermissionFlagsBits, VoiceChannel } from 'discord.js';

export const name = 'voiceStateUpdate';
export const once = false;
export async function execute(oldState: VoiceState, newState: VoiceState) {
  const channelID = '1164249961093926974'; // ID MAIN CHANNEL

  if (newState.member && newState.channelId === channelID) {
    const user = newState.member.user;
    const newChannelName = `${user.username}'s channel`;

    console.log('Creating voice channel...');

    const parentChannel = newState.channel;
    if (parentChannel) {
      newState.guild!.channels
        .create({
          name: newChannelName,
          type: ChannelType.GuildVoice,
          parent: parentChannel.parent,
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
        })
        .then((newChannel) => {
          console.log('Channel created:', newChannel);

          newState.setChannel(newChannel);
          console.log('User moved in the channel');

        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }
}