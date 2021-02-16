const db = require('./firestore');
const {firestore} = require("firebase-admin");
const {collections, getFormattedTimeZone} = require("../utils/utils");

module.exports.saveMessage = function(msg){

    let date = getFormattedTimeZone(0, withdate=true, timezone="Europe/Brussels");

    let data = {server: msg.guild.name}
    data[msg.channel.id+".messages"] = firestore.FieldValue.arrayUnion(`(${date}) ${msg.author.username} : ${msg.content}`);
    data[msg.channel.id+".channel"] = msg.channel.name;
    
    db.collection(collections.messages).doc(msg.guild.id).update(data).catch(console.error);    
}