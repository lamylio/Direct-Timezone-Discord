require('dotenv').config()
module.exports = {
    settings: {
        prefix: "!",
        debug: true,
        refresh: 60,
        activity: "the time go by.. ⏳",
        new_role:{
            getName(x){return x.annotations.timezone.name},
            color: "#d990e7",
            hoist: true,
        }
    },
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
    getFormattedTimeZone(offset){
        localstamp = Date.now() + offset*1000;
        localtime = new Date(localstamp).toLocaleTimeString("en-GB", {timeZone: "UTC", timeStyle: 'short'});
        return localtime;
    }
}

