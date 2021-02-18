const db = require('./firestore');
const {firestore} = require("firebase-admin")
const {collections, getFormattedTimeZone} = require('../utils/utils');

module.exports.addRequests = async function(server, count){
    let f = getFormattedTimeZone(0, 1, true, "Europe/Brussels").replace(/\//g, '-').substr(0, 10);

    let data = {}
    data[server] = firestore.FieldValue.increment(count);
    data["total"] = firestore.FieldValue.increment(count);

    await db.collection(collections.requests).doc(f).update(data, {merge: true}).catch(console.error);
}

module.exports.saveRateLimit = async function(msg){
    let f = getFormattedTimeZone(0, 1, true, "Europe/Brussels").replace(/\//g, '-').substr(0, 10);
    let data = {rateLimited: firestore.FieldValue.arrayUnion(`(${f}) ${msg}`)}

    await db.collection(collections.requests).doc(f).update(data, {merge: true}).catch(console.error);
}