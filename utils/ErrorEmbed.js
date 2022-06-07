const { MessageEmbed } = require("discord.js")

function errorEmbedResponse(interaction, text){
    return interaction.editReply({
        embeds: [new MessageEmbed().setDescription(`❗**${text}**❗`).setColor(process.env.palette)]
    })
}


module.exports = { errorEmbedResponse }