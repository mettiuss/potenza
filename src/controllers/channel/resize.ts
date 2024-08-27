import { ChatInputCommandInteraction } from 'discord.js';

export async function channelResize(interaction: ChatInputCommandInteraction, limit: number) {
	if (!interaction.guild) return;

	const channelDoc = await interaction.client.mongo.channel.findOne({
		owner: interaction.user.id,
	});

	if (!channelDoc)
		return await interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> Non possiedi nessun canale, entra in <#${interaction.client.settings['channel-voice']}> per creare il tuo.`,
			ephemeral: true,
		});

	const channel = await interaction.guild.channels.fetch(channelDoc._id);

	await interaction.guild.channels.edit(channel!, { userLimit: limit });

	await interaction.reply({
		content: `**Dimensione canale modificato correttamente**`,
		ephemeral: true,
	});
}
