const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { errorEmbedResponse } = require("../utils/ErrorEmbed")

module.exports = {
    data: new SlashCommandBuilder() .setName("skip").setDescription("salta la traccia attuale e va a quella successiva"),
    run: async ({ client, interaction}) =>{
        const queue = client.player.getQueue(interaction.guildId)
        
        if (!queue) return await errorEmbedResponse(interaction,'Non ci sono canzoni nella queue')
        queue.skip();
        const song = queue.tracks[0];
        if(!song){
            queue.destroy();
            await 
            errorEmbedResponse(interaction,"Era l'ultima traccia, bot disconnesso automaticamente")
        }else{
            await errorEmbedResponse(interaction,"Traccia Skippata")
        }
    }
}