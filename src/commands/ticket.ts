import {
	ButtonInteraction,
	ChannelType,
	CommandInteraction,
	EmbedBuilder,
	Guild,
	GuildChannelCreateOptions,
	PermissionsBitField,
	TextChannel,
	User,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export function getUserChannel(guild: Guild, userID: string) {
	return guild.channels.cache.filter(
		(ch) => ch.type === ChannelType.GuildText && ch.topic == `Ticket User ID: ${userID}`
	);
}

export function getGuildIcon(interaction: CommandInteraction | ButtonInteraction) {
	return interaction.guild && interaction.guild.iconURL()
		? interaction.guild.iconURL()!
		: 'https://cdn.discordapp.com/embed/avatars/0.png';
}

export function createUserEmbed(
	interaction: CommandInteraction | ButtonInteraction,
	user: User,
	type: 'open' | 'close',
	reason?: string
) {
	let embed = new EmbedBuilder()
		.setColor('#00e3ff')
		.setTimestamp(new Date())
		.setAuthor({
			name: user.username,
			iconURL: user.avatarURL() ? user.avatarURL()! : 'https://cdn.discordapp.com/embed/avatars/0.png',
		})
		.setFooter({ text: interaction.guild?.name!, iconURL: getGuildIcon(interaction) });
	switch (type) {
		case 'open':
			embed
				.setTitle('**Richiesta Supporto Accettata**')
				.setDescription(
					`Hey <@${user.id}>, la tua richiesta è stata accettata e per questo abbiamo aperto un ticket. Un membro del team Vindertech ti risponderà il prima possibile.`
				)
				.addFields(
					{
						name: '**Domande Frequenti**',
						value: 'Se hai bisogno delle domande e risposte frequenti, [clicca qui](https://www.epicgames.com/help/it/fortnite-c75).',
						inline: false,
					},
					{
						name: '**Supporto Tecnico**',
						value: `Se hai bisogno di aiuto in gioco, contatta l'assistenza [cliccando qui](https://www.epicgames.com/help/it/contact-us).`,
						inline: false,
					},
					{
						name: '**Bacheca Trello**',
						value: 'Puoi consultare i problemi già noti ad Epic Games [cliccando qui](https://trello.com/b/zXyhyOIs/fortnite-italia-community-issues).',
						inline: false,
					}
				);
			return embed;
		case 'close':
			embed.setTitle('**Richiesta Supporto Chiusa**').addFields(
				{
					name: 'Staffer',
					value: `<@${interaction.user.id}> | ID: ` + '`' + interaction.user.id + '`',
					inline: false,
				},
				{
					name: 'Motivazione',
					value: reason!,
					inline: false,
				},
				{
					name: '**Bacheca Trello**',
					value: 'Puoi consultare i problemi già noti ad Epic Games [cliccando qui](https://trello.com/b/zXyhyOIs/fortnite-italia-community-issues).',
					inline: false,
				}
			);
			return embed;
	}
}

export function createLogEmbed(
	interaction: CommandInteraction | ButtonInteraction,
	user: User,
	type: 'open' | 'close',
	reason?: string
) {
	let embed = new EmbedBuilder()
		.setTimestamp(new Date())
		.setAuthor({
			name: user.username,
			iconURL: user.avatarURL() ? user.avatarURL()! : 'https://cdn.discordapp.com/embed/avatars/0.png',
		})
		.setFooter({ text: interaction.guild?.name!, iconURL: getGuildIcon(interaction) });
	switch (type) {
		case 'open':
			embed.setTitle('**Richiesta Supporto Aperta**').addFields(
				{
					name: 'Staffer',
					value: `<@${interaction.user.id}> | ID: ${interaction.user.id}`,
					inline: false,
				},
				{
					name: 'Utente',
					value: `<@${user.id}> | ID: ${user.id}`,
					inline: false,
				}
			);
			return embed;
		case 'close':
			embed.setTitle('**Richiesta Supporto Chiusa**').addFields(
				{
					name: 'Staffer',
					value: `<@${interaction.user.id}> | ID: ${interaction.user.id}`,
					inline: false,
				},
				{
					name: 'Utente',
					value: `<@${user.id}> | ID: ${user.id}`,
					inline: false,
				},
				{
					name: 'Motivazione',
					value: reason!,
					inline: false,
				}
			);
			return embed;
	}
}

export function createChannelCreateOptions(
	interaction: CommandInteraction | ButtonInteraction,
	user: User
): GuildChannelCreateOptions {
	let staffPerms = [
		PermissionsBitField.Flags.ViewChannel,
		PermissionsBitField.Flags.ManageMessages,
		PermissionsBitField.Flags.EmbedLinks,
		PermissionsBitField.Flags.AttachFiles,
	];
	return {
		name: `ticket-${user.username}`,
		topic: `Ticket User ID: ${user.id}`,
		parent: '683363228931194899',
		permissionOverwrites: [
			{ id: interaction.guild!.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
			{ id: '454262524955852800', allow: staffPerms },
			{ id: '659513332218331155', allow: staffPerms },
			{ id: '720221658501087312', allow: staffPerms },
			{
				id: user.id,
				allow: [
					PermissionsBitField.Flags.ViewChannel,
					PermissionsBitField.Flags.EmbedLinks,
					PermissionsBitField.Flags.AttachFiles,
					PermissionsBitField.Flags.ReadMessageHistory,
				],
			},
		],
	};
}

export const data = new SlashCommandBuilder()
	.setName('ticket')
	.setDescription(`Aprire e chiudere un ticket per il Supporto Vindertech.`)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('open')
			.setDescription("Aprire un ticket per l'utente specificato")
			.addUserOption((input) =>
				input.setName('utente').setDescription('Utente a cui si riferisce questa azione').setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('close')
			.setDescription("Chiudere un ticket per l'utente specificato")
			.addUserOption((input) =>
				input.setName('utente').setDescription('Utente a cui si riferisce questa azione').setRequired(true)
			)
			.addStringOption((input) =>
				input.setName('motivazione').setDescription('La motivazione di questa azione').setRequired(true)
			)
	);
export async function execute(interaction: CommandInteraction) {
	const user = interaction.options.getUser('utente')!;
	let userEmbed, logEmbed;

	switch ((interaction.options as any).getSubcommand()) {
		case 'open':
			userEmbed = createUserEmbed(interaction, user, 'open');
			logEmbed = createLogEmbed(interaction, user, 'open');
			if (getUserChannel(interaction.guild!, user.id).size === 0) {
				const ticketChannel = await interaction.guild?.channels.create(
					createChannelCreateOptions(interaction, user)
				);
				ticketChannel?.send({ embeds: [userEmbed] });
				const logChannel = (await interaction.client.channels.fetch('721809334178414614')) as TextChannel;
				await logChannel.send({ embeds: [logEmbed] });
				return await interaction.reply(`**Ticket aperto per <@${user.id}> (` + '`' + user.id + '`)**');
			} else {
				return await interaction.reply(
					`L'utente <@${user.id}> (` + '`' + user.id + '`) ha già un ticket aperto.'
				);
			}
		case 'close':
			const reason = (interaction.options as any).getString('motivazione');

			userEmbed = createUserEmbed(interaction, user, 'close', reason);
			logEmbed = createLogEmbed(interaction, user, 'close', reason);
			let userChannel = getUserChannel(interaction.guild!, user.id);
			if (userChannel.size === 0) {
				return await interaction.reply(
					`L'utente <@${user.id}> (` + '`' + user.id + '`) non possiede nessun ticket aperto.'
				);
			} else {
				await userChannel.at(0)?.delete();
				try {
					await user.send({ embeds: [userEmbed] });
				} catch {}
				const logChannel = (await interaction.client.channels.fetch('721809334178414614')) as TextChannel;
				await logChannel.send({ embeds: [logEmbed] });
				return await interaction.reply(
					`**Ticket chiuso per <@${user.id}> (` + '`' + user.id + '`) con motivazione: `' + reason + '`**'
				);
			}
	}
}
