const db = require('./firestore');
const {firestore} = require("firebase-admin")
const {collections} = require('../utils/utils');

module.exports.addRequests = async function(server, count){
    let d = new Date(Date.now());
    let f = d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');

    let data = {}
    data[server] = firestore.FieldValue.increment(count);
    data["total"] = firestore.FieldValue.increment(count);

    await db.collection(collections.requests).doc(f).update(data, {merge: true}).catch(console.error);
}