let SerialPort = require('serialport');
let xbee_api = require('xbee-api');
let storage = require("./storage")
require('dotenv').config()
const frames = require("./frames");
const puces = require("./puce_zigbee");
const {handleControllerByFrame, gameStart} = require("./helpers");
const {Game} = require("./game");

//region listen new party to start new game
currGame = null

const launchGameOnNewParty = (newDocRef, duration) =>{
  currGame = new Game([puces.controller1, puces.controller2], newDocRef, duration)
  //storage.updateParty(newDocRef, {})
  gameStart(currGame, xbeeAPI, frames, storage)
}
const storeObs = (docSnapshot) =>{
  const doc = docSnapshot.docs[docSnapshot.docChanges()[0].newIndex]
  let duration = null;
  try{
    duration = parseInt(doc._fieldsProto.duree[doc._fieldsProto.duree.valueType])
  }catch (e){
  }
  launchGameOnNewParty(doc.ref, duration)
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
  baudRate: parseInt(process.env.SERIAL_BAUDRATE) || 9600,
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);
//endregion

const players = []
//region on start server
serialport.on("open", function () {
  let frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "NI",
    commandParameter: [],
  };
  console.log("STARTED")
  xbeeAPI.builder.write(frame_obj);

  frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: "FFFFFFFFFFFFFFFF",
    command: "NI",
    commandParameter: [],
  };
  xbeeAPI.builder.write(frame_obj);

});
//endregion

// All frames parsed by the XBee will be emitted here


xbeeAPI.parser.on("data", function (frame) {
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
    console.log("NODE_IDENTIFICATION");
    // storage.registerSensor(frame.remote64)

  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {
    console.log("ZIGBEE_IO_DATA_SAMPLE_RX from ", frame.remote64, "with PIN = ", frame.digitalSamples)
    //storage.registerSample(frame.remote64,frame.analogSamples.AD0 )

    handleControllerByFrame(puces.controller1, xbeeAPI, frame, currGame, storage)
    handleControllerByFrame(puces.controller2, xbeeAPI, frame, currGame, storage)

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
    //console.log("REMOTE_COMMAND_RESPONSE", frame.commandData) //if light off : commandData = <Buffer 00> , else if on  : commandData = <Buffer 05>
  }
  //else if(C.FRAME_TYPE.AT_COMMAND === frame.type){}
  else {
    console.debug("frame = ", frame);
    let dataReceived = String.fromCharCode.apply(null, frame.commandData)
    console.log("data received = ", dataReceived);
  }

});
