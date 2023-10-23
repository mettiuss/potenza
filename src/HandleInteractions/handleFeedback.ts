import { ButtonInteraction } from 'discord.js';

export async function handleFeedback(interaction: ButtonInteraction) {
	const id_data = interaction.customId.split('_');

	const like: boolean = id_data[1] == 'like';
	const vindertech_id: string = id_data[2];

	await interaction.update({
		components: [], // Rimuove i bottoni
	});

	await interaction.user.send(`<:FNIT_Vindertech:678655323115880512> *Grazie per il tuo feedback!*`);

	// Aggiorna MongoDB
	interaction.client.mongo.feedback.updateOne(
		{ _id: vindertech_id },
		like ? { $inc: { like: 1 } } : { $inc: { nolike: 1 } },
		{ upsert: true }
	);
}
