const Discord = require("discord.js")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord.js/node_modules/discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")
const { sendIssueReport } = require("./utils/ErrorEmbed")

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID.toString();
const LOAD_SLASH = process.argv[2] == "load"
let currentInteraction;

// Set bot intents
const client = new Discord.Client({ 
    intents: 
    [
        Discord.Intents.FLAGS.GUILDS, 
        Discord.Intents.FLAGS.GUILD_MESSAGES, 
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    ] 
});


// Set some audio setting for the bot
const myPlayer = new Player(client,{ ytdlOptions:{ quality: "highestaudio", highWaterMark: 1 << 25}})
client.player = myPlayer

client.slashcommands = new Discord.Collection()
let commands = []
// Read files from slash folder
const slashFiles = fs.readdirSync("./slash").filter(file=> file.endsWith(".js"));
client.slashcommands.clear();
for (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if(LOAD_SLASH) commands.push(slashcmd.data.toJSON());
}


// Ready to open client
client.on("ready",()=>{
    console.log(`Logged in as ${client.user.tag}`)
    client.user.setPresence({ activities: [{ name: 'Te che fallisci', type: 'WATCHING' }], status: 'online',  });

    if(LOAD_SLASH){
        const rest = new REST({ version : "9"}).setToken(TOKEN)
        console.log("Deploying slash commands")
        client.guilds.cache.forEach((guild)=>{
            const botPermissions = guild.me.permissions.toArray()
            if(!botPermissions.some(permission=> permission === 'USE_APPLICATION_COMMANDS')) return
            const route = Routes.applicationGuildCommands(CLIENT_ID, guild.id)
                rest.put(route, {body: commands})
                .then(()=>{ console.log("Successfully loaded"); process.exit(0)})
                .catch((err)=>{ console.log(err)})
        })
    }

    myPlayer.on('connectionError', (queue, error) => {
        console.log(error.message);
        sendIssueReport(error)
    });

    myPlayer.on('channelEmpty', (queue) => {
        console.log('Nobody is in the voice channel\n')
        queue.destroy();
        sendIssueReport('Channel Empty')
    });
    
    myPlayer.on('queueEnd', (queue) => {
        console.log('Queue Ended Or Bot disconnected')
    });

    myPlayer.on("trackStart",(queue,track)=>{
        const embed = new Discord.MessageEmbed()
        .setDescription(`Ora in riproduzione - [${track.title}](${track.url}) ✅`)
        .setFooter({text: `${track.author} - ${track.duration}`})
        currentInteraction.channel.send({embeds: [embed]});
    })
})



client.on("interactionCreate",(interaction)=>{

    async function handleCommand(){
        if (!interaction) return
        if (!interaction.isCommand()) return
        if(interaction.user.bot) return

        const slashcmd = client.slashcommands.get(interaction.commandName)
        if (!slashcmd) return interaction.reply("Comando non riconosciuto")
        currentInteraction = interaction
        await interaction.deferReply();
        // Here i call the "run" function written in the slash file we're searching for, because the "slashcmd" is equal to the object
        await slashcmd.run({ client, interaction})
    }

    handleCommand();

})


    
client.login(TOKEN)

