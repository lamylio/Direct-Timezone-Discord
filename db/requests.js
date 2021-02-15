const db = require('./firestore');
const {firestore} = require("firebase-admin")
const {collections} = require('../utils/utils');

module.exports.addRequests = async function(count){
    let d = new Date(Date.now());
    let f = d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace('/', '-');

    await db.collection(collections.requests).doc(f).update({
        total: firestore.FieldValue.increment(count),
    }, {merge: true}).catch();
}