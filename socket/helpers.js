
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
module.exports = { objectContainsKeys, whichIs0InObject, giveSampleByButton, giveSampleButtonArr};
