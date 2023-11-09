import { VoiceBasedChannel, VoiceState } from 'discord.js';

export const name = 'voiceStateUpdate';
export const once = false;
export async function execute(oldState: VoiceState, newState: VoiceState) {
  const channelID = '1164249961093926974'; // ID MAIN CHANNEL
  const categoryID = '1163224804980162681';

  if (oldState.channel && oldState.channel.parentId === categoryID) {
    const user = oldState.member?.user;
    const channelName = `${user?.username}'s channel`;

    // check if the user (owner of the channel are leaving the channel)
    if (oldState.channel.name === channelName) {
      console.log('User leaving channel:', oldState.member);

      // check if the channel owner is in the same voice channel.
      const ownerVoiceState = oldState.guild?.voiceStates.cache.find((voiceState) => {
        return voiceState.channelId === channelID && voiceState.member?.user.username === user?.username;
      });

      if (!ownerVoiceState) {
        deleteChannel(oldState.channel);
      }
    }
  }
}

function deleteChannel(channel: VoiceBasedChannel) {
  // check, it will not delete the main channel
  if (channel.id !== '1164249961093926974') {
    channel.delete()
      .then(() => {
        console.log('Channel deleted because its creator left');
      })
      .catch((error) => {
        console.error('Error while removing the channel:', error);
      });
  }
}
