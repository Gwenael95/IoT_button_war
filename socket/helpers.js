function getRandInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

//region array
/**
 * return an array containing all element from arr1 that are not in arr2
 * @param arr1
 * @param arr2
 * @return {*}
 */
function getDiffInArray(arr1, arr2){
    return arr1.filter(x => !arr2.includes(x)) .concat(arr2.filter(x => !arr1.includes(x)))
}
function arrayExcludingVal(arr1, value){
    return arr1.filter(x => value!==x)
}

/**
 * move all element in array to another random index
 * @param array
 * @return {*}
 */
const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}
//endregion

/**
 * get an array of element == 0 in an object
 * @param obj
 * @return {*[]}
 */
function whichIs0InObject(obj){
    const objKeys = Object.keys(obj);
    let pressedArr = [];

    for(let i=0; i<objKeys.length ;i++){
        if(obj[objKeys[i]] === 0){
            pressedArr.push(objKeys[i])
        }
    }
    return pressedArr
}

//region xbee commands
/**
 * handle the action for a specified controller, like adding score to player and saving it to db
 * @param xbeeAPI {XBeeAPI}
 * @param frame {object}
 * @param controller {Controller} :
 * @param currGame {Game}
 * @param storage
 */
function handleControllerByFrame(controller, xbeeAPI,  frame, currGame, storage){
    if(frame.remote64 === controller.dest64){
        const lightOn = currGame.getLightOn();
        if(lightOn === null){
            console.log("END OF THE GAME, (you should stop spamming)")
            return null
        }

        //region get the last button clicked
        const keysPressed = whichIs0InObject(frame.digitalSamples);
        const inputChanged = controller.whichButtonJustChange(keysPressed) // it doesn't regard if is pressed or unpressed
        controller.setPressed(keysPressed)
        console.log("KEY changing = ", inputChanged)
        //endregion

        if(frame.digitalSamples[inputChanged] === 0){ // if the button is pressed
            //console.log(inputChanged, "is pressed", controller.indexLastInputChanged, " current light on=", lightOn, " --- last changed = ", controller.indexLastInputChanged)
            console.log("light on=", lightOn)
            let playerScore = currGame.setScore(controller, lightOn === controller.indexLastInputChanged)
            //storage.updateScore( playerScore, 30)
            storage.updateScore( currGame.getFormatedScore())

            //xbeeAPI.builder.write(frames["isLedOn_" + controller.indexLastInputChanged]) // is that usefull to check if switch on, could be saved in var
        }
    }
}

/**
 * init a new game, all the sequence is prepared, and events occurred thanks to setTimeout
 * @param currGame {Game}
 * @param xbeeAPI {XBeeAPI}
 * @param frames
 * @param storage
 */
function gameStart(currGame, xbeeAPI, frames, storage){
    storage.resetScore()
    for(let i=0; i<currGame.randomListLed.length ;i++){
        const el = currGame.randomListLed[i]
        console.log(el)
        if(el.time > currGame.duration){
            const func = () => {
                currGame.LED_INDEXES.forEach(buttonId=>{
                    xbeeAPI.builder.write(frames["ledOn_" + buttonId])
                })
            }
            setTimeout(func, currGame.duration*1000)

            break
        }

        const func = () => {
            xbeeAPI.builder.write(frames["ledOn_" + el.ledOnIndex])
            el.ledOffIndex.forEach(buttonId=>{
                xbeeAPI.builder.write(frames["ledOff_" + buttonId])
            })
        }
        setTimeout(func, el.time*1000)
    }
}
//endregion

//region deprecated, not useful anymore

function getInterInArray(arr1, arr2){
    return arr1.filter(x => arr2.includes(x));
}

function objectContainsKeys(obj, keys){
    const objKeys = Object.keys(obj);
    let boolArr = [];
    keys.forEach(el=>{
        boolArr = [objKeys.includes(el)]
    })
    return !boolArr.includes(false)
}
//endregion
module.exports = { objectContainsKeys, whichIs0InObject,
    handleControllerByFrame, getRandInteger,
    getDiffInArray, shuffleArray,
    getInterInArray, arrayExcludingVal,
    gameStart};
