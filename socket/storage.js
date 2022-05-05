const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const docScore = db.collection('Score')
const docIdScore = getMaindocIdScore()
const docParties = db.collection('Partie');

//region Scores
/**
 * use to get the 'score' collection's doc id from firebase
 * @return {Promise<null>}
 */
async function getMaindocIdScore(){
  const snapshot = await docScore.get();
  let docIdScore = null

  //seems impossible to get doc with another function thant foreach
  snapshot.forEach(doc => {
    docIdScore = doc.id;
  });
  return docIdScore;
}

/**
 * update the score in DB, that will be used in realtime on our client (android)
 * @param scores
 * @return {Promise<void>}
 */
//updateScore = async function ( scoreJ1, scoreJ2) {
updateScore = async function ( scores) {
  /*const scoreData = {
    scoreJ1: scoreJ1,
    scoreJ2: scoreJ2
  }*/

  await docScore.doc(await docIdScore).update(scores);
}
resetScore = async function (){
  const scoreData = {
    scoreJ1: 0,
    scoreJ2: 0,
    scoreJ3: 0,
  }
  await updateScore(scoreData)
}
//endregion

//region Parties
updateParty = async function ( docId, playersScore) {
  /*const scoreData = {
    scoreJ1: scoreJ1,
    scoreJ2: scoreJ2
  }*/
  const docParty = docParties.doc(docId)
  console.log(docParty)
  //playersScore[""]

  //await docParty.update(scores);
}

/**
 * observer for parties, that execute a function when a snapshot is detected
 * @param func
 * @return {() => void}
 */
function observerParties(func){
  return docParties.onSnapshot(docSnapshot => {
    try{
      if(docSnapshot.docChanges().length === 1 && docSnapshot.docChanges()[0].type === "added") {
        func(docSnapshot)
      }
    }
    catch (e){
      console.log("ERROR to launch game", e)
    }
  }, err => {
    console.log(`Encountered error: ${err}`);
  });
}

async function deleteParties(){
  const snapchot = await docParties.get()
  snapchot.forEach(el=>{
    docParties.doc(el.id).delete()
  })
}
//deleteParties()
//endregion

module.exports = {
  docParties, updateScore, observerParties,
  resetScore, updateParty
};