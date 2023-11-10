import { VoiceState, ChannelType, PermissionFlagsBits } from 'discord.js';

export const name = 'voiceStateUpdate';
export const once = false;

export async function execute(oldState: VoiceState, newState: VoiceState) {
  const channelID = '1164249961093926974'; // ID MAIN CHANNEL

  // Verifica se il membro è in un canale vocale specifico e se ha il canale principale
  if (!newState.member || newState.channelId !== channelID) return;

  const user = newState.member.user;
  const newChannelName = `${user.username}'s channel`;

  console.log('Creating voice channel...');

  const parentChannel = newState.channel;

  // Se non c'è il canale principale, esce dalla funzione
  if (!parentChannel) return;

  try {
    const newChannel = await newState.guild!.channels.create({
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
    });

    console.log('Channel created:', newChannel);
    newState.setChannel(newChannel);
    console.log('User moved to the channel');
  } catch (error) {
    console.error('Error:', error);
  }
}
