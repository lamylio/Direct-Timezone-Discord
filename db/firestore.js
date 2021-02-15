const admin = require('firebase-admin');
const serviceAccount = require('./firebaseAccount.json');
const {server, collections} = require('../utils/utils.js')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

module.exports = admin.firestore();
