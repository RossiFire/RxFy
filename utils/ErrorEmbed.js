const { MessageEmbed } = require("discord.js")
const nodemailer = require("nodemailer");

const transporter  = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'fratsavio.dr@gmail.com',
        pass: process.env.AUTH_MAIL
    }
})

const mailOption = {
    from: 'issue-tracker@rxfy.it',
    to: 'fratsavio.dr@gmail.com',
    subject: 'RxFy - Issue Report',
    text: ''
}

function errorEmbedResponse(interaction, text){
    return interaction.editReply({
        embeds: [new MessageEmbed().setDescription(`❗**${text}**❗`).setColor(process.env.PALETTE.toString())]
    })
}


function sendIssueReport(mailContent){
    mailOption.text = JSON.stringify(mailContent);
    transporter.sendMail(mailOption, 
        (error,info)=>{
            if(error){
                console.log('Error during sending report ---- ' + error)
            }else {
                console.log('Issue Report Sent')
            }
        }
    )
}

module.exports = { errorEmbedResponse, sendIssueReport }