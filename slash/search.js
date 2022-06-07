const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("discord-player");
const { errorEmbedResponse } = require("../utils/ErrorEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cerca")
        .setDescription("Cerca una canzone/video da qualsiasi piattaforma (Spotify, Youtube, Soundcloud, Vimeo, ecc...)")
        .addStringOption((option)=> option.setName("searchterms").setDescription("Termini di ricerca").setRequired(true)),
    run: async ({ client, interaction}) => {
        
        if(!interaction.member.voice.channel) return errorEmbedResponse(interaction,`Devi essere in un canale vocale per usare il comando 🤖 /${interaction.commandName} 🤖 `)
        
        const queue = await client.player.createQueue(interaction.guild)
        if(!queue.connection) await queue.connect(interaction.member.voice.channel)
        let embed = new MessageEmbed()
        let url =interaction.options.getString("searchterms")
        const result = await client.player.search(url,{
            requesterBy: interaction.user,
            searchEngine: QueryType.AUTO
        })  
        if(result.tracks.length === 0) return errorEmbedResponse(interaction,'Nessun risultato trovato')
        
        const song = result.tracks[0]
        await queue.addTrack(song);
        embed
            .setDescription(`**[${song.title}](${song.url})** è stata aggiunta alla Queue`)
            .setThumbnail(song.thumbnail)
            .setFooter({text: `Duration: ${song.duration}`})
            .setColor(process.env.palette)
        
        if(!queue.playing) await queue.play();
        await interaction.editReply({embeds: [embed]});
    }
}

