const db = require('./firestore');
const {firestore} = require("firebase-admin")
const {collections} = require('../utils/utils');

module.exports.getLocation = async function(location){
    const snap = await db.collection(collections.locations).where("queries", "array-contains", location.toLowerCase()).get().catch();
    if (!snap.empty){
        loc = snap.docs.shift();
        return [loc.id, loc.data()]
    };
}

module.exports.addLocation = async function(location, data){
    location = location.replace('/', '\\');
    await db.collection(collections.locations).doc(location).update({
        name: data.name,
        flag: data.flag,
        offset: data.offset,
        queries: firestore.FieldValue.arrayUnion(data.query.toLowerCase())
    }, {merge: true}).catch();
}