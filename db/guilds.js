const db = require('./firestore');
const {collections} = require('../utils/utils');

module.exports.getServers = async function(){
    const snap = await db.collection(collections.guilds).get();
    if (!snap.empty){
        return snap.docs;
    }
    return [];
}

module.exports.setActive = async function(server, active){
    await db.collection(collections.guilds).doc(server).update({active: active}, {merge: true}).catch();
}