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

            let fields = "\n"
            for (role of roles){
                
                let f = await server.roles.fetch(role.id).then(r => {
                    let field = ""
                    field += `<@&${role.id}>, precisely the **${getFormattedTimeZone(role.offset, 1, true, role.zone).substring(0,10)} at ${getFormattedTimeZone(role.offset, 1, false, role.zone)}**\n`;
                    field += `Members : ${r.members.map(m => m.displayName)}\n\n`;
                    return field
                });
                fields+=f;
            };
            
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