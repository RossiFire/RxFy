const Discord = require("discord.js")
const dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord.js/node_modules/discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")

dotenv.config()

const TOKEN = process.env.TOKEN
const LOAD_SLASH = process.argv[2] == "load"
const CLIENT_ID = "983057108448710706"

// Set what bot will use as intents
const client = new Discord.Client({ 
    intents: 
    [
        Discord.Intents.FLAGS.GUILDS, 
        Discord.Intents.FLAGS.GUILD_MESSAGES, 
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    ] 
});

// Set some audio setting for the bot
client.player = new Player(client,{ ytdlOptions:{ quality: "highestaudio", highWaterMark: 1 << 25}})

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
    client.player.addListener("connectionError",(q,err)=>{
        console.log('Bot Quitted from a voice channel')
    })

    if(LOAD_SLASH){
        const rest = new REST({ version : "9"}).setToken(TOKEN)
        console.log("Deploying slash commands")
        client.guilds.cache.forEach((guild)=>{
            const botPermissions = guild.me.permissions.toArray()
            if(!botPermissions.some(permission=> permission === 'USE_APPLICATION_COMMANDS')) return

            const route = Routes.applicationGuildCommands(CLIENT_ID, guild.id)
                rest.put(route, {body: commands})
                .then(()=>{ console.log("Successfully loaded");})
                .catch((err)=>{ console.log(err)})
        })
    }

    client.player.on('connectionError', (queue, error) => {
        console.log(`Error emitted from the connection ${error.message} \n`);
    });

    client.player.on('channelEmpty', (queue) => {
        console.log('Nobody is in the voice channel')
        queue.destroy();
    });
    
    client.player.on('queueEnd', (queue) => {
        queue.metadata.send('I finished reading the whole queue ✅');
    });

})



client.on("interactionCreate",(interaction)=>{
    async function handleCommand(){
        if (!interaction) return
        if (!interaction.isCommand()) return
        if(interaction.user.bot) return

        const slashcmd = client.slashcommands.get(interaction.commandName)
        if (!slashcmd) return interaction.reply("Comando non riconosciuto")

        await interaction.deferReply();
        // Here i call the "run" function written in the slash file we're searching for, because the "slashcmd" is equal to the object
        await slashcmd.run({ client, interaction})
/*         client.player.removeAllListeners().addListener("trackStart",(queue,track)=>{
            const embed = new Discord.MessageEmbed()
                .setDescription(`Ora in riproduzione - [${track.title}](${track.url}) ✅`)
                .setFooter({text: `${track.author} - ${track.duration}`})
            interaction.channel.send({embeds: [embed]});
        }) */
    }
    handleCommand();

})
    
client.login(TOKEN)

