const fetch = require('node-fetch');
const {geocoding_api, keys, settings, getFormattedTimeZone} = require('../utils')
const {getLocation, addLocation} = require("../db/locations")
const {addRole} = require("../db/roles")

module.exports = {
    name: "zone",
    description: "Get the timezone of a location",
    aliases: ["timezone", "setzone"],
    usage : `<location>`,
    async execute(msg, args){

        if (!args || args.length < 1) throw SyntaxError("wrong command : please specify a location!");
        
        const query = args.join(' ');        
        const known_location = await getLocation(query);

        let stored_location, stored_data;

        /* Check if location was found is the database */
        if (known_location === undefined){
            if (settings.debug) console.log("Location not found in database.. Fetching..");

            /* If not, we ask the geocoding_api */
            const api_url = encodeURI(geocoding_api.replace("%k", keys.GEOKEY).replace("%q", query));
            const json = await (await fetch(api_url)).json();
            if (settings.debug) console.log("Queries left:", json.rate.remaining);

            const location = json.results[0].annotations.timezone.name;
            const name = json.results[0].annotations.timezone.short_name;
            const offset = json.results[0].annotations.timezone.offset_sec;
            let flag = json.results[0].annotations.flag;
            if (flag == undefined) flag = "❓";

            /* And store it in the database for later uses */
            [stored_location, stored_data] = [location.replace("/", "\\"), {flag: flag, offset: offset, name: name, query: query}];
            addLocation(stored_location, stored_data);
        }else{
            [stored_location, stored_data] = known_location;
        }        

        /* Check for server role (name used instead of location id)*/
        server_role = msg.guild.roles.cache.find(role => role.name.toLowerCase().startsWith(stored_data.name.toLowerCase()))
         if (!server_role){
            if (settings.debug) console.log("Server role doesn't exist yet.. creating.");
            server_role = await msg.guild.roles.create({data: {
                name: stored_data.name, 
                color: settings.new_role.color, 
                hoist: settings.new_role.hoist
            }, reason: "Role-Location doesn't exists yet."});
            addRole(msg.guild.id, {id: server_role.id, name: server_role.name, offset: stored_data.offset});
        }

        /* Add the corresponding server-role to the user */
        msg.guild.members.fetch(msg.author.id).then(author => {
            author.roles.add(server_role.id, "Timezone command.");
        })

        /* Send a nice message */
        msg.reply(`you are now known as living near **${stored_location}**, being in the time zone **${stored_data.name}** ! By the way, it should be **${getFormattedTimeZone(stored_data.offset)}** at your place!`).then(resp => {
            resp.react(stored_data.flag)
        });
        

    },
}