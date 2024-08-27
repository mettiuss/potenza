import { ChatInputCommandInteraction, PermissionFlagsBits, User, VoiceChannel } from 'discord.js';
import { formatCode, hasStaffPermission } from '../../utils/ticket.js';

export async function channelKick(interaction: ChatInputCommandInteraction, user: User) {
	if (!interaction.guild) return;

	const channelDoc = await interaction.client.mongo.channel.findOne({
		owner: interaction.user.id,
	});

	if (!channelDoc)
		return await interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> Non possiedi nessun canale, entra in <#${interaction.client.settings['channel-voice']}> per creare il tuo.`,
			ephemeral: true,
		});

	const member = await interaction.guild.members.fetch(user.id);

	if (hasStaffPermission(member, interaction.client.settings['channel-staff']))
		return await interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> Non puoi espellere un membro dello staff.`,
			ephemeral: true,
		});
	const channel = (await interaction.guild.channels.fetch(channelDoc._id)) as VoiceChannel;

	await Promise.all([channel.permissionOverwrites.edit(member.id, { Connect: false }), member.voice.disconnect()]);

	await interaction.reply({
		content: `**L'utente <@${
			member.id
		}> è stato espulso dal canale**\n*Non potrà più rientrare se non reinvitato tramite il comando ${formatCode(
			'/channel invite'
		)}*`,
		ephemeral: true,
	});
}
