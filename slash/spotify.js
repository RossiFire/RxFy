const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("discord-player");
const { errorEmbedResponse } = require("../utils/ErrorEmbed");
const dotenv = require("dotenv")
dotenv.config()

module.exports = {
    data: new SlashCommandBuilder()
        .setName("spotify")
        .setDescription("Canzoni/Playlist da Spotify")
        .addStringOption((option)=> option.setName("url").setDescription("Url della canzone/video").setRequired(true)),
    run: async ({ client, interaction}) => {
        
        if(!interaction.member.voice.channel) return errorEmbedResponse(interaction,`Devi essere in un canale vocale per usare questo comando `)
        const queue = await client.player.createQueue(interaction.guild)
        if(!queue.connection) await queue.connect(interaction.member.voice.channel)
        let embed = new MessageEmbed()

        let url = interaction.options.getString("url")
        const isPlaylist = url.includes("/playlist/") || url.includes("/album/")

        if(!isPlaylist){

            const result = await client.player.search(url,{
                requesterBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_SONG
            })  
            if(result.tracks.length === 0){
                queue.destroy();
                return errorEmbedResponse(interaction,'Nessun risultato trovato')
            } 
            
            const song = result.tracks[0]
            await queue.addTrack(song);
            embed
                .setDescription(`**[${song.title}](${song.url})** è stata aggiunta alla Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Duration: ${song.duration}`})
                .setColor(process.env.PALETTE.toString())

        }else{
            const result = await client.player.search(url,{
                requesterBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_PLAYLIST
            })  
            if(result.tracks.length === 0)  return errorEmbedResponse(interaction,'Nessun risultato trovato')
            
            const playlist = result.playlist       
            for(const singleTrack of result.tracks){
                if(singleTrack){
                    await queue.addTrack(singleTrack);
                }
            }    
            embed
                .setDescription(`Sono state caricate 🎶 **${result.tracks.length} canzoni** 🎶\n Dalla Playlist **[${playlist.title}](${playlist.url})** \n\n 🔥 **Buon ascolto** 🔥`)
                .setThumbnail(playlist.thumbnail)
                .setColor(process.env.PALETTE.toString())
        }
        
        if(!queue.playing) await queue.play();
        await interaction.editReply({embeds: [embed]});
    }
}

