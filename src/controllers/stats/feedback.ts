import { ChatInputCommandInteraction } from 'discord.js';

export async function statsFeedback(interaction: ChatInputCommandInteraction) {
	const user_feedback = interaction.options.getUser('utente', true);
	const feedbackDocument = await interaction.client.mongo.feedback.findOne({ _id: user_feedback.id });

	if (feedbackDocument) {
		const likeCount: number = feedbackDocument.like || 0;
		const noLikeCount: number = feedbackDocument.nolike || 0;
		const averageRating: number = (likeCount / (likeCount + noLikeCount)) * 5;
		const averageRatingInStars: number = parseFloat(averageRating.toFixed(2));

		await interaction.reply({
			content: `**👮  Informazioni Utente <@${user_feedback.id}>**\n- 👍  ** Like Ricevuti: ${likeCount}**\n- 👎  ** Non mi piace Ricevuti: ${noLikeCount}**\n> **﻿:star:﻿ Valutazione Media: ${averageRatingInStars}/5**`,
			ephemeral: true,
		});
	} else {
		await interaction.reply({
			content: `❌ Nessuna statistica disponibile per l'utente <@${user_feedback.id}>.`,
			ephemeral: true,
		});
	}
}
