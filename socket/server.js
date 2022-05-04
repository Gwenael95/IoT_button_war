let SerialPort = require('serialport');
let xbee_api = require('xbee-api');
//let storage = require("./storage")
require('dotenv').config()
const frames = require("./frames");
const puces = require("./puce_zigbee");
const {handleControllerByFrame} = require("./helpers");
const {Game} = require("./game");

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


//region on start server
serialport.on("open", function () {
  let frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "NI",
    commandParameter: [],
  };
  console.log("STARTED", frame_obj)

  xbeeAPI.builder.write(frame_obj);

  // frame_obj = { // AT Request to be sent
  //   type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
  //   destination64: "FFFFFFFFFFFFFFFF",
  //   command: "NI",
  //   commandParameter: [],
  // };
  // xbeeAPI.builder.write(frame_obj);

});
//endregion

// All frames parsed by the XBee will be emitted here

// //storage.listSensors().then((sensors) => sensors.forEach((sensor) => console.log(sensor.data())))

currGame = new Game()
console.log(currGame.randomListLed)
/*currGame.randomListLed.forEach((el, index)=>{
  const func = () => {
    console.log("###### " , el.ledIndex, " is off", "that was element", index)
    xbeeAPI.builder.write(frames["ledOn_" + el.ledIndex])
    el.ledOffIndex.forEach(buttonId=>{
      xbeeAPI.builder.write(frames["ledOff_" + buttonId])
    })
  }
  setTimeout(func, el.time*1000)
})*/
for(let i=0; i<currGame.randomListLed.length ;i++){
  const el = currGame.randomListLed[i]
  const func = () => {
    console.log("###### " , el.ledIndex, " is off", "that was element", i)
    xbeeAPI.builder.write(frames["ledOn_" + el.ledIndex])
    el.ledOffIndex.forEach(buttonId=>{
      xbeeAPI.builder.write(frames["ledOff_" + buttonId])
    })
  }
  setTimeout(func, el.time*1000)
}

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
    //storage.registerSensor(frame.remote64)

  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {
    console.log("ZIGBEE_IO_DATA_SAMPLE_RX from ", frame.remote64, "with PIN = ", frame.digitalSamples)
    //storage.registerSample(frame.remote64,frame.analogSamples.AD0 )

    handleControllerByFrame(puces.controller1, xbeeAPI, frame, currGame, "ledOff_")
    handleControllerByFrame(puces.controller2, xbeeAPI, frame, currGame, "ledOn_")
   /*
      US 4 lessons iot
      if(frame.digitalSamples.DIO3 === 0){
        console.log("frame on")
        xbeeAPI.builder.write(frames.ledOn_3)
      }
      else{
        console.log("frame off")
        xbeeAPI.builder.write(frames.ledOff_1)
      }*/

  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
    console.log("REMOTE_COMMAND_RESPONSE", frame.commandData)
    //if off : commandData = <Buffer 00> , else if on  : commandData = <Buffer 05>
  } else {
    console.debug(frame);
    let dataReceived = String.fromCharCode.apply(null, frame.commandData)
    console.log(dataReceived);
  }

});
