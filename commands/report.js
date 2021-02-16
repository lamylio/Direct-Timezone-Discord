const Discord = require('discord.js');
const {getRoles} = require('../db/roles');
const {getFormattedTimeZone, settings} = require('../utils/utils');

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
                fields += `<@&${role.id}>, more precisely ${getFormattedTimeZone(0, 1, true, role.zone)}\n`;
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