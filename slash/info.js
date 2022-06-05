const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder() .setName("info").setDescription("Mostre le informazioni sulla traccia corrente"),
    run: async ({ client, interaction}) =>{
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue) return await interaction.editReply({
            embeds: [new MessageEmbed().setDescription("❗**Non ci sono canzoni nella queue**").setAuthor({name: interaction.user.username}).setColor("#FBBB57")]
        })
        let bar = queue.createProgressBar({ queue: false,  length: 15, timecodes: true })
        const song = queue.current;
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                .setThumbnail(song.thumbnail)
                .setDescription(`In riproduzione: [${song.title}](${song.url})\n\n` + bar)
                .setColor("#FBBB57")
            ]
        })
    }
}