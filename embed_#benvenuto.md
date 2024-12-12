    let benvenuto = (await client.channels.fetch('454263972770611211')) as TextChannel;
    let msg = await benvenuto.messages.fetch('1075886473192157184');

    let embed1 = new EmbedBuilder()
    	.setColor('#ffffff')
    	.setTitle('Benvenuto nel server ufficiale di lingua italiana di Fortnite!')
    	.setDescription(
    		'Gioca a Fortnite ora! https://www.epicgames.com/fortnite/it/home.\nScopri tutte le nuove notizie di Fortnite su <#454264582622412801> o https://www.epicgames.com/fortnite/it/news.'
    	);

    let embed2 = new EmbedBuilder()
    	.setColor('#ffffff')
    	.setTitle('Collegamenti delle Comunità')
    	.setDescription(
    		`Questo server è principalmente di lingua italiana. Di seguito sono riportati i link a tutti i server ufficiali di Fortnite in Discord, in diverse lingue:

-   Official Fortnite (Inglese): http://epic.gm/discorden
-   Oficial Fortnite Hispanohablante (Spagnolo): http://epic.gm/discordes
-   Oficial Fortnite Brasil & Portugal (Portoghese): http://epic.gm/discordpt
-   Official Fortnite Italia (Italiano): http://epic.gm/discordit
-   Serveur Discord Francophone Officiel (Francese): http://epic.gm/discordfr
-   Offizieller Deutscher Fortnite Discord (Tedesco): http://epic.gm/discordde
-   Türkçe Resmî Discord (Turco): http://epic.gm/discordtr
-   официальном русскоязычном дискорд (Russo): http://epic.gm/discordru
-   Oficjalny polski Discord (Polacco): http://epic.gm/fortnitepl
-   Official Fortnite Arabic (Arabo): http://epic.gm/fortniteme
-   フォートナイト 公式 (Giapponese): https://discord.gg/fortnitejp
-   포트나이트 공식 디코 (Coreano): https://discord.gg/fortnitekr

-   Trello: https://trello.com/b/zXyhyOIs/fortnite-italia-community-issues
-   Facebook: https://www.facebook.com/FortniteGameITALIA/
-   Instagram: https://www.instagram.com/fortniteita/?hl=it
-   Twitter: https://twitter.com/FortniteGame
-   TikTok: https://www.tiktok.com/share/user/6646882771904528390`
    );

    let embed3 = new EmbedBuilder()
    .setColor('#ffffff')
    .setTitle('Descrizione dei Ruoli')
    .setDescription(
    `<@&454262403819896833>: Community manager di EpicGames, si occupano di gestire i server ufficiali e di organizzare eventi.

<@&454262524955852800>: Ruolo più importante nel team di moderazione. Hanno l'ultima parola su tutto e sono responsabili per il corretto funzionamento del server.

<@&454268394464870401>: Hanno l'importante ruolo di garantire che tutti i canali di testo e vocali siano luoghi piacevoli e sicuri, in modo che tutti i membri del server possano goderseli.

<@&659513332218331155>: Si occupano, ove possibile, del supporto interno della community, ma non hanno nessun potere di moderazione. Per candidarsi al ruolo di Vindertech visitare il canale <#683363509966471197>.

<@&976447945970970694>: Membri dello staff di altre Community ufficiali di Fortnite. Non hanno poteri di moderazione.`
);

    let embed4 = new EmbedBuilder().setColor('#ffffff').setTitle('Descrizione delle Categorie')
    	.setDescription(`- Annunci: Categoria dedicata a tutte le notizie riguardanti il gioco di Fortnite o eventuali novità riguardanti questo server.

-   Informazioni: Tutte le informazioni utili per poterti orientare e ambientare al meglio all'interno di questo server.
-   <#710116429386612736>: Canale dedicato al collegamento/scollegamento del proprio account Epic dall'account Discord.
-   <#625752242611421214>: Canale dedicato al Negozio Giornaliero di Battaglia Reale.
-   Generale: Chat pubbliche dedicate a Fortnite o ad altri argomenti.
-   Ricerca Gruppo (LFG): Categoria dedicata alla ricerca di giocatori con cui giocare.
-   Canali della Community: Categoria dedicata alla condivisioni di contenuti creati dalla Community stessa.
-   Supporto Vindertech: Categoria dedicata al supporto in-game.`);
let embed5 = new EmbedBuilder().setColor('#ffffff').setTitle('Supporto')
	.setDescription(`Se riscontri problemi nel gioco o nel client di gioco, usa i seguenti link per ottenere aiuto.
-   Puoi contattare il team vindertech utilizzando il pulsante in fondo al canale <#683363509966471197>.
-   Se vuoi lasciare commenti o segnalare un giocatore nel gioco, usa lo strumento di segnalazione dei giochi in Fortnite. Per favore sii paziente. L'invio di più ticket per lo stesso problema rallenta il tempo di risposta.
-   Contattare i moderatori dei server di Discord o il personale di Epic Games non accelererà questo processo. Non hanno gli strumenti necessari per aiutarvi con questo tipo di problemi.

**Centro assistenza di Epic Games:** https://www.epicgames.com/site/it/customer-service
**Domande frequenti su Fortnite:** https://www.epicgames.com/fortnite/it/faq

Se il problema dovesse riguardare il server discord, ad esempio per segnalare un utente che infrange il regolamento, inviare un messaggio in dm al bot <@599162525166206996>.`);

    let embed6 = new EmbedBuilder()
    	.setColor('#ffffff')
    	.setTitle('Invito al Discord Official Fortnite Italia')
    	.setDescription(
    		'Vuoi invitare altri giocatori al Discord ufficiale della comunità di lingua italiana? Usa questo link: https://discord.gg/fortniteita'
    	);

    await msg.edit({ embeds: [embed1, embed2, embed3, embed4, embed5, embed6] });
