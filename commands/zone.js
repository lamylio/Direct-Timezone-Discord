const fetch = require('node-fetch');
const {geocoding_api, keys, color, hoist, getFormattedTimeZone} = require('../utils')
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

        if (known_location === undefined){
            /* console.log("Location not found in database.. Fetching.."); */
            const api_url = encodeURI(geocoding_api.replace("%k", keys.GEOKEY).replace("%q", query));
            const json = await (await fetch(api_url)).json();
            console.log("Queries left:", json.rate.remaining);

            const location = json.results[0].annotations.timezone.name;
            const offset = json.results[0].annotations.timezone.offset_sec;
            /* const flag = ":flag_"+json.results[0].components.country_code; */
            let flag = json.results[0].annotations.flag;
            if (flag == undefined) flag = "❓";

            [stored_location, stored_data] = [location.replace("/", "\\"), {flag: flag, offset: offset, query: query}];
            addLocation(location, stored_data);
        }else{
            [stored_location, stored_data] = known_location;
        }        

        /* Check for server role */
        server_role = msg.guild.roles.cache.find(role => role.name.toLowerCase().startsWith(stored_location.toLowerCase()))
         if (!server_role){
            server_role = await msg.guild.roles.create({data: {name: stored_location, color: color, hoist: hoist}, reason: "Location doesn't exists yet."});
            addRole(msg.guild.id, {id: server_role.id, name: stored_location, offset: stored_data.offset});
        }

        msg.guild.members.fetch(msg.author.id).then(author => {
            author.roles.add(server_role.id, "Timezone command.");
        })

        msg.reply(`You are now known as being in the time zone of ${stored_location} ! By the way, it should be ${getFormattedTimeZone(stored_data.offset)} at your place!`).then(resp => {
            resp.react(stored_data.flag)
        });
        

    },
}