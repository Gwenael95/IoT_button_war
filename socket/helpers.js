const frames = require("./frames");

function getRandInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

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
 * @param frame
 * @param controller {Controller} :
 */
function handleControllerByFrame(controller, xbeeAPI,  frame){
    if(frame.remote64 === controller.dest64){
        //region get the last button clicked
        const keysPressed = whichIs0InObject(frame.digitalSamples);
        const inputChanged = controller.whichButtonJustChange(keysPressed) // it doesn't regard if is pressed or unpressed
        controller.setPressed(keysPressed)
        console.log("KEY changing = ", inputChanged)
        //endregion

        if(frame.digitalSamples[inputChanged] === 0){ // if the button is pressed
            console.log(inputChanged, "is pressed", controller.indexLastInputChanged)
            //xbeeAPI.builder.write(frames["ledOff_" + controller.indexLastInputChanged])
            xbeeAPI.builder.write(frames["ledOff_" + controller.indexLastInputChanged])

            //xbeeAPI.builder.write(frames["isLedOn_" + controller.indexLastInputChanged]) // is that usefull to check if switch on, could be saved in var
        }
    }
}

//region deprecated, not useful anymore
function objectContainsKeys(obj, keys){
    const objKeys = Object.keys(obj);
    let boolArr = [];
    keys.forEach(el=>{
        boolArr = [objKeys.includes(el)]
    })
    return !boolArr.includes(false)
}

/**
 *
 * @param buttonName string : like D0, D1
 */
function giveSampleByButton(buttonName){
    switch (buttonName){
        case "D0":
            return "DIO0"
        case "D1":
            return "DIO1"
        case "D2":
            return "DIO2"
        case "D3":
            return "DIO3"
        case "D4":
            return "DIO4"
        default:
            return "DIO0"
    }
}
function giveSampleButtonArr(buttonNameList){
    let arr = []
    buttonNameList.forEach(el=>{
        arr.push(giveSampleByButton(el))
    })
    return arr
}
//endregion
module.exports = { objectContainsKeys, whichIs0InObject, giveSampleByButton, giveSampleButtonArr, handleControllerByFrame};
