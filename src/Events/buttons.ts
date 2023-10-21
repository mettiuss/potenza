import { ButtonInteraction } from 'discord.js';

export const name = 'interactionCreate';
export const once = false;
export async function execute(interaction: ButtonInteraction) {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;
  const match = customId.match(/^(\w+)_(\w+)_(\w+)$/);

  if (match) {
    const feedback = match[1];
    const like = match[2];
    const number = match[3];

    await interaction.update({
      components: [], // Rimuove i bottoni 
    });

    const message = await interaction.user.send(`*Grazie per il tuo feedback!*`);

    // Dopo 5000ms deleta il messaggio
    setTimeout(() => {
      message.delete().catch(error => {
        console.error(`Errore durante l'eliminazione del messaggio fb: ${error}`);
      });
    }, 5000);


    // Aggiorna MongoDB
    updateFeedbackCount(interaction, number, like);
  }
}

export const updateFeedbackCount = async (interaction: ButtonInteraction, number: string, like: string) => {
  try {
    const feedbackDocument = await interaction.client.mongo.feedbacks.findOne({ number });

    if (feedbackDocument) {
      // Se il docum esiste del vindertech lo aggiorna per il tipo di feedback speficato
      const updateData = {
        $inc: {
          [like]: 1,
        },
      };

      await interaction.client.mongo.feedbacks.updateOne({ number }, updateData);
    } else {
      // Se non esiste crea il doc
      const newFeedback = {
        number,
        [like]: 1, // Inserisce il primo voto del feedback
      };

      await interaction.client.mongo.feedbacks.insertOne(newFeedback);
    }
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dei feedback:', error);
  }
}