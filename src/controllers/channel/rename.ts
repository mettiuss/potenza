import { ChatInputCommandInteraction } from 'discord.js';

export async function channelRename(interaction: ChatInputCommandInteraction, name: string) {
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

	try {
		await interaction.guild.channels.edit(channel!, { name });
	} catch {
		return await interaction.reply({
			content: `<:FNIT_Stop:857617083185758208> Impossibile utilizzare il nome scelto, scegline un'altro`,
			ephemeral: true,
		});
	}

	await interaction.reply({
		content: `**Nome canale modificato correttamente**`,
		ephemeral: true,
	});
}
