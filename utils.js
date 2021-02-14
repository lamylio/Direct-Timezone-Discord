require('dotenv').config()
module.exports = {
    settings: {
        prefix: "!",
        debug: true,
        refresh: 60*15,
        activity: "the time go by.. ⏳",
        new_role:{
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
    getFormattedTimeZone(offset, round=15){
        localstamp = Date.now() + offset*1000;
        localtime = new Date(localstamp);

        localtime.setMilliseconds(Math.round(localtime.getMilliseconds() / 1000) * 1000);
        localtime.setSeconds(Math.round(localtime.getSeconds() / 60) * 60);
        localtime.setMinutes(Math.round(localtime.getMinutes() / round) * round);

        return localtime.toLocaleTimeString("en-GB", {timeZone: "UTC", timeStyle: 'short'});
    }
}

