const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("discord-player");
const { errorEmbedResponse } = require("../utils/ErrorEmbed");
const playdl = require("play-dl");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("youtube")
        .setDescription("Canzoni/Playlist da Youtube")
        .addStringOption((option)=> option.setName("url").setDescription("Url del video/playlist da Youtube").setRequired(true)),
    run: async ({ client, interaction}) => {
        
        if(!interaction.member.voice.channel) return errorEmbedResponse(interaction,`Devi essere in un canale vocale per usare questo comando`)
        const queue = await client.player.createQueue(interaction.guild, { metadata: { channel: interaction.channel},
            async onBeforeCreateStream(track, source, _queue) { return (await playdl.stream(track.url, { discordPlayerCompatibility : true })).stream;}
        })
        if(!queue.connection) await queue.connect(interaction.member.voice.channel)
        let embed = new MessageEmbed()

        let url =interaction.options.getString("url")
        const result = await client.player.search(url,{
            requesterBy: interaction.user,
            searchEngine: QueryType.YOUTUBE_PLAYLIST
        })  
        
        if(result.tracks.length > 1){
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
        else
        {
            const result = await client.player.search(url,{
                requesterBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })  
            if(result.tracks.length === 0)  return errorEmbedResponse(interaction,'Nessun risultato trovato')
                const song = result.tracks[0]
                await queue.addTrack(song);
                embed
                    .setDescription(`**[${song.title}](${song.url})** è stata aggiunta alla queue`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: `Duration: ${song.duration}`})
                    .setColor(process.env.PALETTE.toString())
        }



    
    
        if(!queue.playing) await queue.play();
        await interaction.editReply({embeds: [embed]});
    }
}

