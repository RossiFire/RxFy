const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { errorEmbedResponse } = require("../utils/ErrorEmbed");

module.exports = {
    data: new SlashCommandBuilder() .setName("help").setDescription("Lista dei comandi")
    .addStringOption((option)=> option.setName("comando").setDescription("Singolo comando da cercare").setRequired(false)),
    run: async ({ client, interaction}) =>{
        const searchingCommand = interaction.options.getString("comando")
        const foundCommands = searchingCommand ? client.slashcommands.filter(command=> command.data.name.toUpperCase() === searchingCommand.toUpperCase()) :  client.slashcommands
        let description = '📑 **__Lista dei comandi__** \n\n'

        foundCommands.forEach(command=> {
            description = description + `\`/${command.data.name}\` - ${command.data.description} \n`
            command.data.name
        })
        description += '\n • **Link utili** \n  [Link Invito](https://discord.com/api/oauth2/authorize?client_id=983057108448710706&permissions=8&scope=bot%20applications.commands)'
        if(foundCommands.size <= 0) return await errorEmbedResponse(interaction, 'Comando non esistente')

        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                .setAuthor({name: 'RxFy • Help', iconURL: client.user.avatarURL()})
                .setDescription(description)
                .setColor(process.env.PALETTE)
            ]
        })
    }
}