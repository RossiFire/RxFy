const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder() .setName("shuffle").setDescription("Mischia l'ordine delle canzoni nella queue"),
    run: async ({ client, interaction}) =>{
        const queue = client.player.getQueue(interaction.guildId)
        
        if (!queue) return await interaction.editReply({
            embeds: [new MessageEmbed().setDescription("❗**Non ci sono canzoni nella queue**").setAuthor({name: interaction.user.username}).setColor("#FBBB57")]
        })
        queue.shuffle();
        await interaction.editReply(`La queue di ${queue.tracks.length} è stata mischiata`)
    }
}