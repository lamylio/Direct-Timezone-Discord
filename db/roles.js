const db = require('./firestore');
const {firestore} = require("firebase-admin");
const {collections} = require("../utils");

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