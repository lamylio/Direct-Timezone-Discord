const admin = require('firebase-admin');
const serviceAccount = require('./firebaseAccount.json');
const {server, collections} = require('../utils.js')


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

/* --- */

module.exports.getServerRoles = async function(){
    const snap = await db.collection(collections.guilds).doc("140938526723276800").get();
    if (snap.exists){
        data = snap.data();
        roles = data.roles;
        return roles;
    }
}

module.exports.getLocation = async function(location){
    const snap = await db.collection(collections.locations).where("queries", "array-contains", location).get();
    if (!snap.empty){
        
    };
}