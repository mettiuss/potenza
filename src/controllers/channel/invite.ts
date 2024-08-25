import { ChatInputCommandInteraction, PermissionFlagsBits, User, VoiceChannel } from 'discord.js';
import { PotenzaEmbedBuilder } from '../../utils/PotenzaEmbedBuilder.js';

export async function channelInvite(interaction: ChatInputCommandInteraction, user: User) {
	if (!interaction.guild) return;

	const channelDoc = await interaction.client.mongo.channel.findOne({
		owner: interaction.user.id,
	});

	if (!channelDoc)
		return await interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> Non possiedi nessun canale, entra in <#${process.env.CHANNEL_VOICE}> per creare il tuo.`,
			ephemeral: true,
		});

	const member = await interaction.guild.members.fetch(user.id);

	const channel = (await interaction.guild.channels.fetch(channelDoc._id)) as VoiceChannel;

	await Promise.all([
		channel.permissionOverwrites.edit(member.id, { Connect: true }),
		member.send({
			embeds: [
				new PotenzaEmbedBuilder(interaction.guild)
					.setTitle('Nuovo Messaggio in arrivo')
					.setDescription(
						`<@${interaction.user.id}> ti ha appena invitato in un canale vocale.\n\n:envelope: <#${
							channel!.id
						}> :envelope:`
					)
					.setImage(doRandHT()),
			],
		}),
	]);

	await interaction.reply({
		content: `**L'utente <@${member.id}> è stato invitato nel canale, potrà entrare anche se il canale è privato**`,
		ephemeral: true,
	});
}

function doRandHT() {
	var rand = [
		'https://media.giphy.com/media/f8bPNbVr9uX2MPUJlM/giphy.gif',
		'https://media.giphy.com/media/gIBf88QbuPGRXimL7c/giphy.gif',
		'https://media.giphy.com/media/dshzxHnnW1AmdkR2D0/giphy.gif',
		'https://media.giphy.com/media/QUWj8q5wQP6SKzhhS6/giphy.gif',
		'https://media.giphy.com/media/kEdI683LJtrGmTVVCM/giphy.gif',
		'https://media.giphy.com/media/YOMJNlPt1n6nnkrp20/giphy.gif',
		'https://media.giphy.com/media/RMpv6gmGMgZSuKhD36/giphy.gif',
		'https://media.giphy.com/media/Ur2Jflemmt2kOhVVMB/giphy.gif',
	];
	return rand[Math.floor(Math.random() * rand.length)];
}