const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const { errorEmbedResponse } = require("../utils/ErrorEmbed")


module.exports = {
    data: new SlashCommandBuilder().setName("current").setDescription("Mostre le informazioni della traccia corrente"),
    run: async ({ client, interaction}) =>{
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue) return errorEmbedResponse(interaction,'Non ci sono canzoni nella queue')
        const song = queue.current
        let index = queue.tracks.length
        let finalText = ''

        if(index > 0){ finalText = 'Canzoni rimanenti: ' + index}
        else{ finalText = "Ultima canzone della coda"}

        let bar = queue.createProgressBar({
            queue: false,
            length: 15,
            indicator: '◽',
            timecodes : true,
            line: '◾'
        })

        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setThumbnail(song.thumbnail)
                    .setTitle("In riproduzione")
                    .setDescription(`[${song.title}](${song.url})\n\n` + bar)
                    .setColor(process.env.PALETTE.toString())
                    .setFooter({text: finalText})
                ]
        })
    }
}
