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
        spy: false
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
        WEATHERKEY: process.env.WEATHERKEY,
    },
    geocoding_api: `https://api.opencagedata.com/geocode/v1/json?q=%q&key=%k&language=fr&pretty=1`,
    weather_api: `http://api.openweathermap.org/data/2.5/weather?q=%q&appid=%k&units=metric`,
    roundTime(date, round=15){
        localtime = new Date(date);
    
        localtime.setMilliseconds(Math.round(localtime.getMilliseconds() / 1000) * 1000);
        localtime.setSeconds(Math.round(localtime.getSeconds() / 60) * 60);
        localtime.setMinutes(Math.round(localtime.getMinutes() / round) * round);
    
        return localtime;
    },
    getFormattedTimeZone(offset, round=15, withdate=false, timezone="UTC", lang="fr-FR"){
        localstamp = Date.now()
        cleanzone = timezone.replace('\\', '/');

        if (timezone == "UTC") localstamp += offset*1000; // in case we havent any zone defined
        localtime = module.exports.roundTime(localstamp, round);
        
        if(withdate) return localtime.toLocaleString('fr-FR', {timeZone: cleanzone, hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric'})
        return localtime.toLocaleTimeString("fr-FR", {timeZone: cleanzone, hour: '2-digit', minute:'2-digit', timeStyle: 'short'});
    },
}

