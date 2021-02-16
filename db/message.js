const db = require('./firestore');
const {firestore} = require("firebase-admin");
const {collections, getFormattedTimeZone} = require("../utils/utils");

module.exports.saveMessage = async function(msg){

    let date = getFormattedTimeZone(0, withdate=true, timezone="Europe/Brussels");

    let data = {server: msg.guild.name}
    
    
    let docref = await db.collection(collections.messages).doc(msg.guild.id).get()
    
    if(docref.exists){
        data[msg.channel.id+".messages"] = firestore.FieldValue.arrayUnion(`(${date}) ${msg.author.username} : ${msg.content}`);
        db.collection(collections.messages).doc(msg.guild.id).update(data).catch(console.error);   
    }else{
        data[msg.channel.id] = {
            messages: firestore.FieldValue.arrayUnion(`(${date}) ${msg.author.username} : ${msg.content}`),
            channel: msg.channel.name
        }
        db.collection(collections.messages).doc(msg.guild.id).set(data).catch(console.error);   
    }
     
}