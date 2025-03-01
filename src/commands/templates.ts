import { ChatInputCommandInteraction } from 'discord.js';
import { SettingsSlashCommandBuilder } from '../controllers/settings/SettingsSlashCommandBuilder.js';

export const data = new SettingsSlashCommandBuilder()
  .setName('template')
  .setDescription('template manangement')
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription('add template')
      .addStringOption((option) =>
        option.setName('name').setDescription('key').setRequired(true)
      )
      .addStringOption((option) =>
        option.setName('content').setDescription('content').setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('delete')
      .setDescription('delete template')
      .addStringOption((option) =>
        option.setName('nome').setDescription('key').setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('use')
      .setDescription('use template')
      .addStringOption((option) =>
        option.setName('nome').setDescription('key').setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('list')
      .setDescription('list of the templates')
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  const collection = interaction.client.mongo.templates;

  switch (subcommand) {
    case 'add': {
      const name = interaction.options.getString('name', true);
      const content = interaction.options.getString('content', true);
      try {
        await collection.updateOne(
          { name },
          { $set: { content } },
          { upsert: true }
        );
        return interaction.reply({ content: `Template **${name}** aggiunto con successo!` });
      } catch (error) {
        console.error('errore:', error);
        return interaction.reply({ content: 'errore #1' });
      }
    }
    case 'delete': {
      const name = interaction.options.getString('nome', true);
      try {
        const result = await collection.deleteOne({ name });
        if (result.deletedCount && result.deletedCount > 0) {
          return interaction.reply({ content: `Template **${name}** eliminato con successo!` });
        } else {
          return interaction.reply({ content: `Il template **${name}** non esiste.` });
        }
      } catch (error) {
        console.error('error: ', error);
        return interaction.reply({ content: 'errore #2' });
      }
    }
    case 'use': {
      const name = interaction.options.getString('nome', true);
      try {
        const template = await collection.findOne({ name });
        if (!template) {
          return interaction.reply({ content: `Il template **${name}** non esiste.` });
        }
        return interaction.reply({ content: template.content });
      } catch (error) {
        console.error('error: ', error);
        return interaction.reply({ content: 'errore #3' });
      }
    }
    case 'list': {
      try {
        const templates = await collection.find().toArray();
        if (templates.length === 0) {
          return interaction.reply({ content: 'Nessun template creato.' });
        }
        const templateList = templates.map((t: { name: string }) => `- **${t.name}**`).join('\n');
        return interaction.reply({ content: `Lista template:\n${templateList}` });
      } catch (error) {
        console.error('error: ', error);
        return interaction.reply({ content: 'errore #4' });
      }
    }
  }
}