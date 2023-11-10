import { VoiceBasedChannel, VoiceState } from 'discord.js';

export const name = 'voiceStateUpdate';
export const once = false;

export async function execute(oldState: VoiceState, newState: VoiceState) {
  const channelID = '1164249961093926974'; // ID MAIN CHANNEL
  const categoryID = '1163224804980162681';

  if (oldState.channel && oldState.channel.parentId === categoryID) {
    const user = oldState.member?.user;
    const channelName = `${user?.username}'s channel`;

    // Check channel owner leaves the vc
    if (oldState.channel.name === channelName) {
      console.log('User leaving channel:', oldState.member);

      // Check owner vc
      const ownerVoiceState = oldState.guild?.voiceStates.cache.find((voiceState) => {
        return voiceState.channelId === channelID && voiceState.member?.user.username === user?.username;
      });

      if (!ownerVoiceState) {
        await deleteChannel(oldState.channel);
      }
    }
  }
}

async function deleteChannel(channel: VoiceBasedChannel) {
  // Check channel main (crea canali)
  if (channel.id !== '1164249961093926974') {
      await channel.delete();
      console.log('Channel deleted because its creator left');
  }
}

