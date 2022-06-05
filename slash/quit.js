const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder() .setName("quit").setDescription("Ferma il bot e pulisce la queue"),
    run: async ({ client, interaction}) =>{
        const queue = client.player.getQueue(interaction.guildId)
        
        if (!queue) return await interaction.editReply({
            embeds: [new MessageEmbed().setDescription("❗**Non ci sono canzoni nella queue**").setAuthor({name: interaction.user.username}).setColor("#FBBB57")]
        })
        queue.destroy();
        await interaction.editReply({
            embeds: [new MessageEmbed().setDescription(`**Bot disconnesso**❗`).setAuthor({name: interaction.user.username}).setColor("#FBBB57")]
        })
    }
}