const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


module.exports.updateScore = async function (idScore, scoreJ1, scoreJ2) {

  const docRef = db.collection('Score').doc(idScore);

  const scoreData = {
    idScore: idScore,
    scoreJ1: scoreJ1,
    scoreJ2: scoreJ2
  }

  await docRef.update(scoreData);
}

module.exports.listParties = function () {

  const parties = db.collection('Partie');

  return parties.get()

}

