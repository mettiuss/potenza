import { EmbedBuilder, EmbedData, Guild } from 'discord.js';

export class PotenzaEmbedBuilder extends EmbedBuilder {
	public constructor(guild: Guild | null, setFooter: boolean = true) {
		let data: EmbedData = {
			color: 58367,
		};
		if (setFooter) {
			data.footer = {
				text: guild ? guild.name : 'No name',
				iconURL: guild && guild.iconURL() ? guild.iconURL()! : 'https://cdn.discordapp.com/embed/avatars/0.png',
			};
			data.timestamp = new Date();
		}
		super(data);
	}

	addWhoFields(staffId?: string, userId?: string, reason?: string): this {
		if (staffId)
			this.addFields({
				name: 'Staffer',
				value: `<@${staffId}> | ID: ${staffId}`,
			});

		this.addFields({
			name: 'Utente',
			value: staffId ? `<@${userId}> | ID: ${userId}` : 'sconosciuto',
		});

		if (reason)
			this.addFields({
				name: 'Motivazione',
				value: reason,
			});

		return this;
	}

	newTicket(userId: string, description?: string) {
		this.setTitle('**Richiesta Supporto Accettata**').setDescription(
			`Hey <@${userId}>, la tua richiesta è stata accettata e per questo abbiamo aperto un ticket. Un membro del team Vindertech ti risponderà il prima possibile.`
		);
		if (description)
			this.addFields({
				name: '**Descrizione**',
				value: '```\n' + description + '\n```',
			});

		this.addFields(
			{
				name: '**Domande Frequenti**',
				value: 'Se hai bisogno delle domande e risposte frequenti, [clicca qui](https://www.epicgames.com/help/it/fortnite-c75).',
			},
			{
				name: '**Supporto Tecnico**',
				value: `Se hai bisogno di aiuto in gioco, contatta l'assistenza [cliccando qui](https://www.epicgames.com/help/it/contact-us).`,
			},
			{
				name: '**Bacheca Trello**',
				value: 'Puoi consultare i problemi già noti ad Epic Games [cliccando qui](https://trello.com/b/zXyhyOIs/fortnite-italia-community-issues).',
			}
		);
		return this;
	}

	addProblemFields(ticketDoc: any) {
		this.addFields(
			{
				name: 'Descrizione',
				value: '```\n' + ticketDoc.description + '\n```',
			},
			{ name: 'Piattaforma', value: '```\n' + ticketDoc.platform + '\n```' }
		);
		return this;
	}
}
