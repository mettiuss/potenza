import {
	ChannelType,
	Guild,
	TextChannel,
	ButtonInteraction,
	ColorResolvable,
	CommandInteraction,
	EmbedBuilder,
	User,
	GuildChannelCreateOptions,
	PermissionsBitField,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Client,
} from 'discord.js';
import { formatUser } from './utils.js';

export const ELEMENTS_PAGE = 5;

function getGuildIcon(guild: Guild | null) {
	return guild && guild.iconURL() ? guild.iconURL()! : 'https://cdn.discordapp.com/embed/avatars/0.png';
}

export function baseEmbed(client: Client, guild: Guild | null, user?: User) {
	let embed = new EmbedBuilder()
		.setColor(client.color as ColorResolvable)
		.setTimestamp(new Date())
		.setFooter({ text: guild ? guild.name : 'No name', iconURL: getGuildIcon(guild) });
	if (user)
		embed.setAuthor({
			name: user.username,
			iconURL: user.avatarURL() ? user.avatarURL()! : 'https://cdn.discordapp.com/embed/avatars/0.png',
		});
	return embed;
}

export function getUserChannel(guild: Guild, userID: string) {
	const channels = guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildText && ch.topic == userID);
	if (channels.size == 0) return;
	return channels.at(0) as TextChannel;
}

export function createChannelCreateOptions(
	interaction: CommandInteraction | ButtonInteraction,
	user: User
): GuildChannelCreateOptions {
	const staffPerms = [
		PermissionsBitField.Flags.ViewChannel,
		PermissionsBitField.Flags.ManageMessages,
		PermissionsBitField.Flags.EmbedLinks,
		PermissionsBitField.Flags.AttachFiles,
	];
	let permissionOverwrites = [
		{ id: interaction.guild!.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
		{
			id: user.id,
			allow: [
				PermissionsBitField.Flags.ViewChannel,
				PermissionsBitField.Flags.EmbedLinks,
				PermissionsBitField.Flags.AttachFiles,
				PermissionsBitField.Flags.ReadMessageHistory,
			],
		},
	];
	for (let id of JSON.parse(process.env.STAFF!)) {
		permissionOverwrites.push({ id: id, allow: staffPerms });
	}
	return {
		name: `ticket-${user.username}`,
		topic: user.id,
		parent: process.env.TICKET_CATEGORY,
		permissionOverwrites: permissionOverwrites,
	};
}

export function getComponentsRow(current_page: number, total_pages: number) {
	if (total_pages === 1) return [];
	return [
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel('<<')
				.setStyle(ButtonStyle.Secondary)
				.setCustomId('start')
				.setDisabled(current_page === 0),
			new ButtonBuilder()
				.setLabel('<')
				.setStyle(ButtonStyle.Primary)
				.setCustomId('back')
				.setDisabled(current_page === 0),
			new ButtonBuilder()
				.setLabel('>')
				.setStyle(ButtonStyle.Primary)
				.setCustomId('forward')
				.setDisabled(current_page + 1 === total_pages),
			new ButtonBuilder()
				.setLabel('>>')
				.setStyle(ButtonStyle.Secondary)
				.setCustomId('end')
				.setDisabled(current_page + 1 === total_pages),
			new ButtonBuilder().setLabel('Stop').setStyle(ButtonStyle.Danger).setCustomId('stop')
		),
	];
}

export function makeEmbed(docs: any, current_page: number) {
	const startElement = current_page * ELEMENTS_PAGE;
	const elements = docs.slice(startElement, startElement + ELEMENTS_PAGE);

	let description = '';
	elements.forEach((doc: any) => {
		description += `**User:** ${formatUser(doc._id)}\n**Staff:** <@${doc.staff}>\n**Date:** <t:${Math.floor(
			doc.at.getTime() / 1000
		)}:f>\n\n`;
	});

	return new EmbedBuilder({
		title: `Showing users ${startElement + 1}-${startElement + elements.length} out of ${docs.length}`,
		color: 58367,
		description: description,
	});
}
