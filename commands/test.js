const {roundTime, getFormattedTimeZone} = require('../utils/utils');
const {addRequests} = require('../db/requests');

module.exports = {
    name: "test",
    usage : ``,
    async execute(msg, args){
        
        addRequests(args[0]);
    
    }
}