require('dotenv').config();

module.exports = {
    settings: {
        prefix: "!",
        debug: true,
        refresh: 60*15,
        activity: `what time it is every 15 minutes ⏳`,
        new_role:{
            color: "#d990e7",
            hoist: true,
        },
        spy: true
    },
    colors: require('chalk'),
    collections: {
        guilds: "server",
        locations: "location",
        roles: "group",
        requests: "request", 
        messages: "message",
    },
    keys: {
        TOKEN: process.env.TOKEN,
        GEOKEY: process.env.GEOKEY,
    },
    geocoding_api: `https://api.opencagedata.com/geocode/v1/json?q=%q&key=%k&language=fr&pretty=1`,
    roundTime(date, round=15){
        localtime = new Date(date);
    
        localtime.setMilliseconds(Math.round(localtime.getMilliseconds() / 1000) * 1000);
        localtime.setSeconds(Math.round(localtime.getSeconds() / 60) * 60);
        localtime.setMinutes(Math.round(localtime.getMinutes() / round) * round);
    
        return localtime;
    },
    getFormattedTimeZone(offset, round=15){
        localstamp = Date.now() + offset*1000;
        localtime = module.exports.roundTime(localstamp, round);

        return localtime.toLocaleTimeString("en-GB", {timeZone: "UTC",hour: '2-digit', minute:'2-digit', timeStyle: 'short'});
    },
}

