const SerialPort = require("serialport");
const xbee_api = require("xbee-api");
const C = xbee_api.constants;

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
    if(frame.remote64 === controller.dest64 && currGame !== null){
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
    storage.resetScore(currGame.getNbPlayer())
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

//region autoconfig controllers
function autoConfigController(index, frames, puces){
    const SERIAL_PORT2 = process.env["SERIAL_PORT" + index];
    let hasErrorOccured = false
    let serialport2 = new SerialPort(SERIAL_PORT2, {
        baudRate: parseInt(process.env.SERIAL_BAUDRATE) || 115200,
    }, function (err) {
        if (err) {
            hasErrorOccured = true
            return console.log('Error: ', err.message)
        }
    });
    if(!hasErrorOccured) {
        let xbeeAPI2 = new xbee_api.XBeeAPI({
            api_mode: parseInt(process.env.API_MODE) || 1
        });
        serialport2.pipe(xbeeAPI2.parser);
        xbeeAPI2.builder.pipe(serialport2);

        onOpenPort2 = () => {
            xbeeAPI2.builder.write(frames.frame_name);
            xbeeAPI2.builder.write(frames.frame_sh);
            xbeeAPI2.builder.write(frames.frame_sl);
            xbeeAPI2.builder.write(frames.frame_net_addr);

            //to init buttons automatically
            xbeeAPI2.builder.write(frames.frame_d0);
            xbeeAPI2.builder.write(frames.frame_d1);
            xbeeAPI2.builder.write(frames.frame_d2);
            xbeeAPI2.builder.write(frames.frame_d3);
            xbeeAPI2.builder.write(frames.frame_d4);
        }
        serialport2.on("open", onOpenPort2);


        xbeeAPI2.parser.on("data", function (frame) {
            console.log("PORT", index, "RECEIVE DATA")
            if (C.FRAME_TYPE.NODE_IDENTIFICATION === frame.type) {
            } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {
            } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
            } else {
                autoConfigFromFrameData(frame, index, puces)
            }
        })
    }
}

/**
 *
 * @param frame
 * @param index {int}
 * @param puces
 */
function autoConfigFromFrameData(frame, index, puces){
    console.debug("frame = ", frame);
    if(frame.command === "SH"){
        const sh = frame.commandData.toString("hex")
        puces["controller" + index].setSh(sh)
        console.log(puces["controller" + index].dest64)
    }
    else if(frame.command === "SL"){
        const sl = frame.commandData.toString("hex")
        puces["controller" + index].setSl(sl)
        console.log(puces["controller" + index].dest64)
    }
    else if(frame.command === "MY"){
        const my = frame.commandData.toString("hex")
        puces["controller" + index].setDest16(my)
        console.log(puces["controller" + index].dest16)
    }
    else if(frame.command === "D0" || frame.command === "D1" || frame.command === "D2"
        || frame.command === "D3" || frame.command === "D4"){
        const dVal = frame.commandData.toString("hex")
        if(dVal === "03"){
            const pin = frame.command.replace("D", "DIO")
            puces["controller" + index].addButtonInPotentialButton(pin)
            console.log("HERE CONTROLLERS", puces["controller" + index].potentialButton)
        }
    }
    else{
        let dataReceived = String.fromCharCode.apply(null, frame.commandData)
        console.log("data received = ", dataReceived);
    }
}
//endregion

// region main xbee action
onOpenPortMain = (xbeeAPI, frames) =>{
    xbeeAPI.builder.write(frames.frame_name);
    xbeeAPI.builder.write(frames.frame_sh);
    xbeeAPI.builder.write(frames.frame_sl);
    xbeeAPI.builder.write(frames.frame_net_addr);

    //region to init buttons automatically
    xbeeAPI.builder.write(frames.frame_d0);
    xbeeAPI.builder.write(frames.frame_d1);
    xbeeAPI.builder.write(frames.frame_d2);
    xbeeAPI.builder.write(frames.frame_d3);
    xbeeAPI.builder.write(frames.frame_d4);
    //endregion

    //region launch a sequence of frame to test LED on start
    xbeeAPI.builder.write(frames.ledOff_0);
    xbeeAPI.builder.write(frames.ledOff_1);
    xbeeAPI.builder.write(frames.ledOff_2);

    const sequence = [
        frames.ledOn_0,
        frames.ledOn_1,
        frames.ledOn_2,
        frames.ledOff_0,
        frames.ledOff_1,
        frames.ledOff_2,
    ]
    for (let i=0; i<sequence.length ;i++){
        setTimeout(()=>{ xbeeAPI.builder.write(sequence[i]);}, 200*(i+1))
    }
    //endregion
}
//endregion
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
    gameStart,
    autoConfigFromFrameData, autoConfigController, onOpenPortMain
};
