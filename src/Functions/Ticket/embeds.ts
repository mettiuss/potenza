import {
	ButtonInteraction,
	ColorResolvable,
	CommandInteraction,
	EmbedBuilder,
	ModalSubmitInteraction,
	User,
} from 'discord.js';

function getGuildIcon(interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction) {
	return interaction.guild && interaction.guild.iconURL()
		? interaction.guild.iconURL()!
		: 'https://cdn.discordapp.com/embed/avatars/0.png';
}

export function createUserEmbed(
	interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
	user: User,
	type: 'open' | 'close',
	reason?: string
) {
	let embed = new EmbedBuilder()
		.setColor(interaction.client.color as ColorResolvable)
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
					name: '**Feedback**',
					value: `Ci auguriamo che il servizio di supporto Vindertech ti sia stato utile nella risoluzione del tuo problema e abbia soddisfatto le tue aspettative. 
**La tua opinione conta per noi!**
Ti invitiamo a lasciare un Feedback qui di seguito per permetterci di migliorare sempre di più il servizio offerto e continuare ad aiutare tanti altri utenti come te. Grazie in anticipo!`,
					inline: false,
				}
			);
			return embed;
	}
}

export function createLogEmbed(
	interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
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

export function createBlockLogEmbed(interaction: CommandInteraction, user: User, type: 'block' | 'unblock') {
	return new EmbedBuilder()
		.setTimestamp(new Date())
		.setAuthor({
			name: user.username,
			iconURL: user.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
		})
		.setFooter({ text: interaction.guild?.name!, iconURL: getGuildIcon(interaction) })
		.setTitle(type == 'block' ? '**Utente bloccato**' : '**Utente sbloccato**')
		.addFields(
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
}
