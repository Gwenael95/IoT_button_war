const frames = require("./frames");

function getRandInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

//region array
function getDiffInArray(arr1, arr2){
    return arr1.filter(x => !arr2.includes(x)) .concat(arr2.filter(x => !arr1.includes(x)))
}
function arrayExcludingVal(arr1, value){
    return arr1.filter(x => value!==x)
}

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


/**
 *
 * @param xbeeAPI {XBeeAPI}
 * @param frame {object}
 * @param controller {Controller} :
 * @param currGame {Game}
 * @param framesFuncBasename {string}
 */
function handleControllerByFrame(controller, xbeeAPI,  frame, currGame, framesFuncBasename){
    if(frame.remote64 === controller.dest64){
        const lightOn = currGame.getLightOn();
        if(lightOn === null){
            console.log("END OF THE GAME")
            return null
        }

        //region get the last button clicked
        const keysPressed = whichIs0InObject(frame.digitalSamples);
        const inputChanged = controller.whichButtonJustChange(keysPressed) // it doesn't regard if is pressed or unpressed
        controller.setPressed(keysPressed)
        console.log("KEY changing = ", inputChanged)
        //endregion

        if(frame.digitalSamples[inputChanged] === 0){ // if the button is pressed
            console.log(inputChanged, "is pressed", controller.indexLastInputChanged, " current light on=", lightOn, " --- last changed = ", controller.indexLastInputChanged)
            //xbeeAPI.builder.write(frames[(framesFuncBasename) + controller.indexLastInputChanged])
            if(lightOn === controller.indexLastInputChanged){
                console.log("the light was on, +1 pt")
            }
            else{
                console.log("the light was off, -3 pts")
            }
            //xbeeAPI.builder.write(frames["isLedOn_" + controller.indexLastInputChanged]) // is that usefull to check if switch on, could be saved in var
        }
    }
}

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
    getInterInArray, arrayExcludingVal};
