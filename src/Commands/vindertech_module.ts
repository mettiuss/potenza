import { CommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export const data = {
  name: 'tvindertech',
  description: 'Invia un messaggio con un bottone "Richiesta supporto".',
};

export async function execute(interaction: CommandInteraction) {
  // ID del ruolo che può inviare il CMD
  const allowedRoleId = '1163055886848229396';

  const member = interaction.member;
  if (member) {
    if (Array.isArray(member.roles)) {
      if (member.roles.includes(allowedRoleId)) {
        const supportButton = new ButtonBuilder()
          .setCustomId('vindertech')
          .setLabel('Richiesta Supporto')
          .setStyle(ButtonStyle.Primary);
        await interaction.reply('Hai bisogno di supporto?');
        await interaction.followUp({
          content: 'Clicca il bottone qui sotto per richiederlo.',
          components: [new ActionRowBuilder<ButtonBuilder>().addComponents(supportButton)],
        });
      } else {
        await interaction.reply('Non hai i permessi per eseguire questo comando.');
      }
    } else {
      if (member.roles.cache.has(allowedRoleId)) {
        const supportButton = new ButtonBuilder()
          .setCustomId('vindertech')
          .setLabel('Richiesta Supporto')
          .setStyle(ButtonStyle.Primary);
        await interaction.reply('Hai bisogno di supporto?');
        await interaction.followUp({
          content: 'Clicca il bottone qui sotto per richiederlo.',
          components: [new ActionRowBuilder<ButtonBuilder>().addComponents(supportButton)],
        });
      } else {
        await interaction.reply('Non hai i permessi per eseguire questo comando.');
      }
    }
  }
}