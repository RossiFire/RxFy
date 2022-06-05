const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder() .setName("skip").setDescription("salta la traccia attuale e va a quella successiva"),
    run: async ({ client, interaction}) =>{
        const queue = client.player.getQueue(interaction.guildId)
        
        if (!queue) return await interaction.editReply({
            embeds: [new MessageEmbed().setDescription("❗**Non ci sono canzoni nella queue**").setAuthor({name: interaction.user.username}).setColor("#FBBB57")]
        })
        queue.skip();
        const song = queue.tracks[0];
        if(!song){
            queue.destroy();
            await interaction.editReply({
                embeds: [new MessageEmbed().setDescription(`❗**Era l'ultima traccia**, bot disconnesso automaticamente`).setColor("#FBBB57")]
            })
        }else{
            await interaction.editReply({
                embeds: [ new MessageEmbed().setDescription(`Prossima traccia: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail).setColor("#FBBB57")]
            })
        }
    }
}