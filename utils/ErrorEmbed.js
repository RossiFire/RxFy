const { MessageEmbed } = require("discord.js")
const dotenv = require("dotenv")
dotenv.config()

function errorEmbedResponse(interaction, text){
    return interaction.editReply({
        embeds: [new MessageEmbed().setDescription(`❗**${text}**❗`).setColor(process.env.PALETTE.toString())]
    })
}


module.exports = { errorEmbedResponse }