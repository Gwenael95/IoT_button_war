let SerialPort = require('serialport');
let xbee_api = require('xbee-api');
const C = xbee_api.constants;
//let storage = require("./storage")
require('dotenv').config()
const frames = require("./frames");
const puces = require("./puce_gisbee");


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

// All frames parsed by the XBee will be emitted here

// //storage.listSensors().then((sensors) => sensors.forEach((sensor) => console.log(sensor.data())))



xbeeAPI.parser.on("data", function (frame) {

  console.log("i receive data")
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

    console.log("ZIGBEE_IO_DATA_SAMPLE_RX")
    console.log(frame.digitalSamples, frame.remote64)
    console.log(frame.digitalSamples.DIO3)
    //storage.registerSample(frame.remote64,frame.analogSamples.AD0 )
    if(frame.remote64 === puces.gwen){
      if(frame.digitalSamples.DIO3 === 0){
        console.log("frame on")
        xbeeAPI.builder.write(frames.remoteOnRailas)
      }
      else{
        console.log("frame off")
        xbeeAPI.builder.write(frames.remoteOffRailas)

      }
    }


  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
    console.log("REMOTE_COMMAND_RESPONSE")
  } else {
    console.debug(frame);
    let dataReceived = String.fromCharCode.apply(null, frame.commandData)
    console.log(dataReceived);
  }

});
