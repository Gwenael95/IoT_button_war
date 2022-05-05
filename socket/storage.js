const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const docRef = db.collection('Score')
const scoreDocId = getMainScoreDocId()
const docParties = db.collection('Partie');

/**
 * use to get the 'score' collection's doc id from firebase
 * @return {Promise<null>}
 */
async function getMainScoreDocId(){
  const snapshot = await docRef.get();
  let scoreDocId = null

  //seems impossible to get doc with another function thant foreach
  snapshot.forEach(doc => {
    scoreDocId = doc.id;
  });
  return scoreDocId;
}

//module.exports.updateScore = async function ( scoreJ1, scoreJ2) {
updateScore = async function ( scoreJ1, scoreJ2) {
  const scoreData = {
    scoreJ1: scoreJ1,
    scoreJ2: scoreJ2
  }
  await docRef.doc(await scoreDocId).update(scoreData);
}

listParties = function () {
  const parties = db.collection('Partie');
  return parties.get()
}

function observerParties(func){
  return docParties.onSnapshot(docSnapshot => {
    func(docSnapshot)
  }, err => {
    console.log(`Encountered error: ${err}`);
  });
}

module.exports = {
  docParties, updateScore, observerParties
};