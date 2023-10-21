import { CommandInteraction, GuildMember, User, ApplicationCommandOptionType } from 'discord.js';

export const data = {
  name: 'feedbacks',
  description: 'Visualizza i resoconti delle valutazioni del Vindertech.',
  options: [
    {
      name: 'utente',
      type: ApplicationCommandOptionType.User,
      description: 'L\'utente di cui visualizzare le valutazioni.',
      required: false,
    },
  ],
};

export async function execute(interaction: CommandInteraction) {
  const user = interaction.options.getUser('utente') || interaction.user;
  const userId = user.id;
  const member = interaction.member as GuildMember;
  const auth_roles = ['720221658501087312', '454262524955852800', '1164902780847263824'];
  // Primo ruolo referente, secondo ruolo moderatori, ultimo ruolo test server

  try {
    if (userId === member.user.id || member.roles.cache.some(role => auth_roles.includes(role.id))) {

      const feedbackDocument = await interaction.client.mongo.feedbacks.findOne({ number: userId });

      if (feedbackDocument) {
        const likeCount = feedbackDocument.like || 0;
        const okayCount = feedbackDocument.okay || 0;
        const noLikeCount = feedbackDocument.nolike || 0;
        const totalVotes: number = likeCount + noLikeCount;
        const averageRating: number = likeCount / (likeCount + noLikeCount) *5;
        const averageRatingInStars: number = parseFloat(averageRating.toFixed(2));

        await interaction.reply({
            content: `**👮  Informazioni Utente (${user.username})**\n- 👍  ** Like Ricevuti: ${likeCount}**\n- 👌  ** Okay Ricevuti: ${okayCount}**\n- 👎  ** Non mi piace Ricevuti: ${noLikeCount}**\n> **﻿:star:﻿ Valutazione Media: ${averageRatingInStars}/5**`,
            ephemeral: true,
          });
      } else {
        await interaction.reply({
            content: `❌ Nessuna statistica disponibile per l'utente ${user.username}.`,
            ephemeral: true,
          });
      }
    } else {
      await interaction.reply({
        content: `❌ Non hai i permessi per accedere a queste statistiche.`,
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error('Errore nel recupero delle statistiche:', error);
    await interaction.reply('Si è verificato un errore durante il recupero delle statistiche.');
  }
}