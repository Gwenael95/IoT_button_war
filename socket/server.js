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

const launchGameOnNewParty = (newDocId, duration) =>{
  const onEnd = (score) =>{
    storage.updateParty(newDocId, score)
  }
  currGame = new Game([puces.controller1, puces.controller2], newDocId, duration, onEnd)
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
const SERIAL_PORT2 = process.env.SERIAL_PORT2;

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
let serialport2 = new SerialPort(SERIAL_PORT2, {
  baudRate: parseInt(process.env.SERIAL_BAUDRATE) || 115200,
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

serialport2.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport2);
//endregion

//region on start server
onOpenPort = () =>{
  let frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "NI",
    commandParameter: [],
  };
  xbeeAPI.builder.write(frame_obj);
  /*
  let frame_sh = {
    type: C.FRAME_TYPE.AT_COMMAND_QUEUE_PARAMETER_VALUE,
    command: "SH",
    commandParameter: [] // Can either be string or byte array.
  }
  let frame_sl = {
    type: C.FRAME_TYPE.AT_COMMAND_QUEUE_PARAMETER_VALUE,
    command: "SL",
    commandParameter: [] // Can either be string or byte array.
  }
  console.log("STARTED")
  //nextFrameId() save it , and return it for the last xbeeApiBuilder
  xbeeAPI.builder.write(frame_sh);
  xbeeAPI.builder.write(frame_sl);
  */
}
serialport.on("open", onOpenPort);
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
  else {
    console.debug("frame = ", frame);

    if(frame.command === "SH"){
      const sh = frame.commandData.toString("hex")
      console.log("SH = ", sh )
    }
    else if(frame.command === "SL"){
      const sl = frame.commandData.toString("hex")
      console.log("SL = ", sl )
    }
    else{
      let dataReceived = String.fromCharCode.apply(null, frame.commandData)
      console.log("data received = ", dataReceived);
    }
  }
});
