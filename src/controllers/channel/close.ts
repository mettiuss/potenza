import { ChatInputCommandInteraction, PermissionFlagsBits, VoiceChannel } from 'discord.js';
import { formatCode } from '../../utils/ticket.js';

export async function channelClose(interaction: ChatInputCommandInteraction) {
	if (!interaction.guild) return;

	const channelDoc = await interaction.client.mongo.channel.findOne({
		owner: interaction.user.id,
	});

	if (!channelDoc)
		return await interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> Non possiedi nessun canale, entra in <#${interaction.client.settings['channel-voice']}> per creare il tuo.`,
			ephemeral: true,
		});

	const channel = (await interaction.guild.channels.fetch(channelDoc._id)) as VoiceChannel;

	await channel.permissionOverwrites.edit(interaction.guild.id, { Connect: false });

	await interaction.reply({
		content: `**Canale impostato come privato**\n*Ora gli utenti potranno entrare solo se invitati con il comando ${formatCode(
			'/channel invite'
		)}**`,
		ephemeral: true,
	});
}
