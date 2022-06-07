const { SlashCommandBuilder } = require("@discordjs/builders")
const { Player } = require("discord-player")
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const { errorEmbedResponse } = require("../utils/ErrorEmbed")


module.exports = {
    data: new SlashCommandBuilder().setName("info").setDescription("Mostre le informazioni sulla traccia corrente"),
    run: async ({ client, interaction}) =>{
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue) return errorEmbedResponse(interaction,'Non ci sono canzoni nella queue')
        if(queue.tracks.length > 0){
            createEmbeddedList(interaction, queue)
        }else{
            let bar = queue.createProgressBar({ queue: false,  length: 15, timecodes: true })
            const song = queue.current;
            await interaction.editReply({
                embeds: [
                    new MessageEmbed()
                    .setThumbnail(song.thumbnail)
                    .setDescription(`In riproduzione: [${song.title}](${song.url}) - ${song.author} (${song.duration})\n\n` + bar)
                    .setColor(process.env.palette)
                ]
            })
        }
    }
}


const getTruncatedTitle = (text) =>{
  return text.length > 60 ? `${text.substring(0,60)}... ` : text
}



function createEmbeddedList(interaction, queue){
    let itemPerPage = 15
    const embeds = []
      const pages = queue.tracks.length / itemPerPage
      for(let i = 0; i < pages; i++){
        const embed = new MessageEmbed()
            .setColor(process.env.palette)
            .setTimestamp()
            .setTitle("🎶 **Prossime canzoni** 🎶")
            //.setThumbnail();
        let rows = ''
        if(i === 0){
          rows = rows + `◽ **[${queue.current.title}](${queue.current.url})** - ${queue.current.author} (${queue.current.duration})\n` 
        }
        for(let j = 0; j< itemPerPage; j++){
          let song = queue.tracks[(j) + (i * itemPerPage)]
          let index = parseInt((j + 1)) +  ((parseInt(i)) * itemPerPage)
          if(song){
            rows = rows + `[${getTruncatedTitle(song.title)}](${song.url}) - ${song.author} (${song.duration})\n` 
          }
        }
        embed.setDescription(rows)
        embeds.push(embed);
      }
      sendCompleteList(interaction,embeds);
  }


  const sendCompleteList = async (interaction, pages , timeout = 600000) => {
    if (!interaction) throw new Error('Il canale è inaccessibile.');
    if (!pages) throw new Error('Pages are not given.');
    let page = 0;
    const row = new MessageActionRow()
      .addComponents(new MessageButton().setCustomId("btn_prev").setDisabled(false).setEmoji('⏪').setStyle("SECONDARY"))
      .addComponents(new MessageButton().setCustomId("btn_next").setDisabled(false).setEmoji("⏩").setStyle("SECONDARY"))
    // Send message
    const curPage = await interaction.editReply({embeds:[pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)]});
    const btnPage =  await interaction.channel.send({components: [row]});

    const collectorPaginateQuantity = pages.length < 10 ? 20 : pages.length * 2 
    
    // Create collector to handle button click
    const collector = btnPage.createMessageComponentCollector({
      max: collectorPaginateQuantity,
      time: timeout  // Last for 10 minutes
    })
  
    collector.on('collect', interaction=>{
      switch (interaction.customId) {
        case "btn_prev":
          page = page > 0 ? --page : pages.length - 1;
          break;
          case "btn_next":
            page = page + 1 < pages.length ? ++page : 0;
          break;
        default:
          break;
      }
      curPage.edit({embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)]});
      interaction.deferUpdate();
    })
  };