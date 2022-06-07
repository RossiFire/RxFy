const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { errorEmbedResponse } = require("../utils/ErrorEmbed");

module.exports = {
    data: new SlashCommandBuilder() .setName("shuffle").setDescription("Mischia l'ordine delle canzoni nella queue"),
    run: async ({ client, interaction}) =>{
        const queue = client.player.getQueue(interaction.guildId)
        
        if (!queue) return await errorEmbedResponse(interaction,'Non ci sono canzoni nella queue')
        queue.shuffle();
        await interaction.editReply({
            embeds: [new MessageEmbed().setDescription("**L'ordine delle canzoni è stato mischiato**✅").setColor(process.env.palette)]
        })
    }
}