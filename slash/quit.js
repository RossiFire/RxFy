const { SlashCommandBuilder } = require("@discordjs/builders");
const { errorEmbedResponse } = require("../utils/ErrorEmbed");

module.exports = {
    data: new SlashCommandBuilder() .setName("quit").setDescription("Ferma il bot e pulisce la queue"),
    run: async ({ client, interaction}) =>{
        const queue = client.player.getQueue(interaction.guildId)
        
        if (!queue) return await errorEmbedResponse(interaction,'Non ci sono canzoni nella queue')
        queue.destroy();
        client.player.removeAllListeners();
        await errorEmbedResponse(interaction,'Bot disconnesso')
    }
}