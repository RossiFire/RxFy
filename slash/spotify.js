const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sp")
        .setDescription("Cerca le canzoni su spotify")
        .addSubcommand((subcommand)=>
            subcommand
            .setName("canzone")
            .setDescription("Cera una canzone in base all'url")
            .addStringOption((option)=> option.setName("url").setDescription("Url della canzone/video").setRequired(true))
        )
        .addSubcommand((subcommand)=>
            subcommand
            .setName("playlist")
            .setDescription("Cerca una playlist di canzoni")
            .addStringOption((option)=> option.setName("url").setDescription("Url della playlist").setRequired(true))
        ),
    run: async ({ client, interaction}) => {
        
        if(!interaction.member.voice.channel) return interaction.editReply("Devi essere in un canale vocale per usare questo comando")
        const queue = await client.player.createQueue(interaction.guild)
        if(!queue.connection) await queue.connect(interaction.member.voice.channel)
        let embed = new MessageEmbed()
        if(interaction.options._subcommand === "canzone"){

            let url =interaction.options.getString("url")
            const result = await client.player.search(url,{
                requesterBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_SONG
            })  
            if(result.tracks.length === 0){
                queue.destroy();
                return interaction.editReply("Nessun risultato");
            } 
            
            const song = result.tracks[0]
            await queue.addTrack(song);
            embed
                .setDescription(`**[${song.title}](${song.url})** è stata aggiunta alla Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Duration: ${song.duration}`})

        }  else if(interaction.options._subcommand === "playlist"){
            
            let url =interaction.options.getString("url")
            const result = await client.player.search(url,{
                requesterBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_PLAYLIST
            })  
            if(result.tracks.length === 0) 
                return interaction.editReply("Nessun risultato");
            
            const playlist = result.playlist       
            for(const singleTrack of result.tracks){
                if(singleTrack){
                    await queue.addTrack(singleTrack);
                }
            }     
            embed
                .setDescription(`**${result.tracks.length} canzoni da [${playlist.title}](${playlist.url})** sono state aggiunta alla Queue`)
                .setThumbnail(playlist.thumbnail)

        }
        if(!queue.playing) await queue.play();
        await interaction.editReply({embeds: [embed]});
    }
}

