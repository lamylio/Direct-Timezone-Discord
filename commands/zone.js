const fetch = require('node-fetch');
const {geocoding_api, keys} = require('../utils')

module.exports = {
    name: "zone",
    description: "Get the timezone of a location",
    aliases: ["timezone", "setzone"],
    usage : `<location>`,
    execute(msg, args){

        if (!args || args.length < 1) throw SyntaxError("wrong command : please specify a location!");

        query = encodeURIComponent(args.join(' '));
        api_url = encodeURI(geocoding_api.replace("%k", keys.GEOKEY).replace("%q", query));
        
        console.log(api_url);
        /* TODO fetch */
    },
}