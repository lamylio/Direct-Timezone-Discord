const db = require('./firestore');
const {firestore} = require("firebase-admin");
const {collections} = require("../utils/utils");


module.exports.getRoles = async function(server){
    const snap = await db.collection(collections.guilds).doc(server).get();
    if (!snap.empty){
        return snap.data().roles;
    }
    return [];
}

module.exports.addRole = async function(server, data){
    await db.collection(collections.guilds).doc(server).update({
        active: true,
        roles: firestore.FieldValue.arrayUnion(data)
    }, {merge: true}).catch();
}

module.exports.removeRole = async function(server, data){
    await db.collection(collections.guilds).doc(server).update({
        roles: firestore.FieldValue.arrayRemove(data)
    }, {merge: true}).catch();
}