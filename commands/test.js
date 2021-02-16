const {roundTime, getFormattedTimeZone} = require('../utils/utils');
const {addRequests} = require('../db/requests');

module.exports = {
    name: "test",
    usage : ``,
    async execute(msg, args){
        
        getFormattedTimeZone(0, 1, true, timezone=args[0]);
    
    }
}