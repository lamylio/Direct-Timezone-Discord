require('dotenv').config()
module.exports = {
    prefix: "!",
    server: '140938526723276800',
    refresh: 30,
    collections: {
        guilds: "server",
        locations: "location",
        roles: "group",
    },
    keys: {
        TOKEN: process.env.TOKEN,
        GEOKEY: process.env.GEOKEY,
    },
    geocoding_api: `https://api.opencagedata.com/geocode/v1/json?q=%q&key=%k&language=fr&pretty=1`,
}

