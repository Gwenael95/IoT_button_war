//region Import
let SerialPort = require('serialport');
let xbee_api = require('xbee-api');
let storage = require("./storage")
require('dotenv').config()
const frames = require("./frames");
const puces = require("./puce_zigbee");
const {handleControllerByFrame, gameStart ,autoConfigController, autoConfigFromFrameData, onOpenPortMain} = require("./helpers");
const {Game} = require("./game");
//endregion

//region listen new party to start new game
currGame = null

const launchGameOnNewParty = (newDocId, duration) =>{
  const onEnd = (score) =>{
    storage.updateParty(newDocId, score)
  }
  currGame = new Game(puces.controllerList, newDocId, duration, onEnd)
  gameStart(currGame, xbeeAPI, frames, storage)
}
const storeObs = (docSnapshot) =>{
  const doc = docSnapshot.docs[docSnapshot.docChanges()[0].newIndex]
  let duration = null;
  try{
    duration = parseInt(doc._fieldsProto.dureeParty[doc._fieldsProto.dureeParty.valueType])
  }catch (e){
  }
  launchGameOnNewParty(doc.id, duration)
}
const storageObserverParties = storage.observerParties(storeObs)
//storageObserverParties(); // stop listening
//endregion


//region init
const C = xbee_api.constants;
const SERIAL_PORT = process.env.SERIAL_PORT;

let xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: parseInt(process.env.API_MODE) || 1
});

let serialport = new SerialPort(SERIAL_PORT, {
  baudRate: parseInt(process.env.SERIAL_BAUDRATE) || 115200,
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
});
serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

//on start server, send some xbee command
serialport.on("open", ()=>{onOpenPortMain(xbeeAPI, frames)});
//endregion



// All frames parsed by the XBee will be emitted here

//region main parser
xbeeAPI.parser.on("data", function (frame) {
  console.log("PORT 1 RECEIVE DATA", frame)

  //on new device is joined, register it

  //on packet received, dispatch event
  //let dataReceived = String.fromCharCode.apply(null, frame.data);
  if (C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET === frame.type) {
    console.log("C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET");
    let dataReceived = String.fromCharCode.apply(null, frame.data);
    console.log(">> ZIGBEE_RECEIVE_PACKET >", dataReceived);
  }

  if (C.FRAME_TYPE.NODE_IDENTIFICATION === frame.type) {
    // let dataReceived = String.fromCharCode.apply(null, frame.nodeIdentifier);
    console.log("NODE_IDENTIFICATION", frame);
    for(let i =0; i<puces.controllerList.length; i++){
      if (!puces.controllerList[i].isAutoConfig){
        let shouldContinue = false
        for(let j =0; j<puces.controllerList.length; j++) {
          if(puces.controllerList[j].dest64 === frame.sender64 && puces.controllerList[j].isAutoConfig){
            shouldContinue = true
            break
          }
        }
        if(shouldContinue){
          continue
        }

        puces.controllerList[i].setDest64(frame.sender64)
        puces.controllerList[i].setDest16(frame.sender16)

        /*
        // region for autoconfig button
        xbeeAPI.builder.write(frames.frame_d0);
        xbeeAPI.builder.write(frames.frame_d1);
        xbeeAPI.builder.write(frames.frame_d2);
        xbeeAPI.builder.write(frames.frame_d3);
        xbeeAPI.builder.write(frames.frame_d4);
         */
      }
    }
    // storage.registerSensor(frame.remote64)

  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {
    console.log("ZIGBEE_IO_DATA_SAMPLE_RX from ", frame.remote64, "with PIN = ", frame.digitalSamples)
    //storage.registerSample(frame.remote64,frame.analogSamples.AD0 )

    puces.controllerList.forEach(controller=>{
      //console.log("the controller to test", controller.dest64)
      if(controller.dest64 === frame.remote64) {
        handleControllerByFrame(controller, xbeeAPI, frame, currGame, storage)
      }
    })

    // //US 4 lessons iot
    // if(frame.digitalSamples.DIO3 === 0){
    //   console.log("frame on")
    //   xbeeAPI.builder.write(frames.ledOn_3)
    // }
    // else{
    //   console.log("frame off")
    //   xbeeAPI.builder.write(frames.ledOff_1)
    // }

  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
    //console.log("REMOTE_COMMAND_RESPONSE") //if light off : commandData = <Buffer 00> , else if on  : commandData = <Buffer 05>

  }
  else if(C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST === frame.type){
    console.log("remote AT command")
  }
  else {
    if(!puces.controllerList[0].isAutoConfig) {
      autoConfigFromFrameData(frame, 1, puces)
    }
    /*
    //remote autoconfig impossible (can't know the sender)
    for(let i =0; i<puces.controllerList.length; i++){
      if (!puces.controllerList[i].isAutoConfig && puces.controllerList[i].dest64 == frame.){ //require to identify the sender
        autoConfigFromFrameData(frame, i, puces.controllerList[i] )
      }
    }*/
  }
});

//endregion



//region prepare for Controller for index (if connected to same computer)
//autoConfigController(2, frames, puces)
//autoConfigController(3, frames, puces)
//autoConfigController(4, frames, puces)
//endregion