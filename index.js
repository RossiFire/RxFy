const Discord = require("discord.js")
const dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord.js/node_modules/discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")

dotenv.config()

const TOKEN = process.env.TOKEN
const LOAD_SLASH = process.argv[2] == "load"
//const CLIENT_ID = "982566294337515520"  // Official Bot
const CLIENT_ID = "983057108448710706"   // Second Version

const GUILD_ID = "438291033088851970"   // Discord Nek
//const GUILD_ID = "970717726165327884"   // Discord Test


// Set what bot will use as intents
const client = new Discord.Client({ 
    intents: 
    [
        Discord.Intents.FLAGS.GUILDS, 
        Discord.Intents.FLAGS.GUILD_MESSAGES, 
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    ] 
});
/* const client = new Discord.Client({ intents: ["GUILDS", "GUILD_VOICE_STATES"] }); */

client.slashcommands = new Discord.Collection()

// Set some audio setting for the bot
client.player = new Player(client,{
    ytdlOptions:{
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})


// Load slash commands
let commands = []

// Read files from slash folder
const slashFiles = fs.readdirSync("./slash").filter(file=> file.endsWith(".js"));
client.slashcommands.clear();
for (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if(LOAD_SLASH) commands.push(slashcmd.data.toJSON());
}

if (LOAD_SLASH) {
    const rest = new REST({ version : "9"}).setToken(TOKEN)
    console.log("Deploying slash commands")
    const route = Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
        rest.put(route, {body: commands})
        .then(()=>{
            console.log("Successfully loaded");
            process.exit(0)
        })
        .catch((err)=>{
            console.log(err)
            process.exit(1);
        })
} else{
    // Ready to open client
    client.on("ready",()=>{
        console.log(`Logged in as ${client.user.tag}`)
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
        }
        handleCommand();
    })
    client.login(TOKEN)
}

