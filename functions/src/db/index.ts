import * as admin from "firebase-admin";
admin.initializeApp();

const db = admin.firestore();

// const docRef = db.collection('users').doc('alovelace');
// docRef.set({
//   first: 'Ada',
//   last: 'Lovelace',
//   born: 1815
// }).then(result => {
//   console.log(result.writeTime);
// });

export { db };
