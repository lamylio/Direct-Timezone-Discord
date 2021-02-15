const Discord = require('discord.js');
const {getRoles} = require('../db/roles');
const {getFormattedTimeZone, roundTime, settings} = require('../utils/utils');

module.exports = {
    name: "report",
    description: "Get the timezone of every roles on the server",
    aliases: ["everyzone", "allzones"],
    usage : ``,
    async execute(msg, args){
        let server = msg.guild;
        if (server.available){
            let roles = await getRoles(server.id);

            let fields = ""
            roles.forEach(role => {
                let current = new Date(Date.now() + role.offset*1000);
                let cdate = current.toLocaleString({ year: 'numeric', month: '2-digit', day: '2-digit', hour:'2-digit', minute:'2-digit', timeZone: "UTC", timeStyle: "short"}).replace(/\//g, '-');

                fields += `<@&${role.id}>, more precisely ${cdate}\n`;
            });
            
            let embbed = new Discord.MessageEmbed()
                .setColor(settings.new_role.color)
                .setTitle(`Report requested by ${msg.author.username}`)
                .setAuthor(msg.client.user.username)
                .setDescription("")
                .setThumbnail(msg.client.user.avatarURL())
                .addFields(
                    { name: 'Current time for each group', value: fields },
                )
                .setFooter('Made with love by Lioche ❤', 'https://cdn.discordapp.com/avatars/140938018000338947/8cb068570db3565361746c84ac1d8e7a.png?size=128');
                
            msg.channel.send(embbed)
        }

    }
}