const xbee_api = require("xbee-api");
const puces = require("./puce_zigbee");
const C = xbee_api.constants;

remoteOffRailas = {
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST, // 0x17, // xbee_api.constants.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST
    //id: 0x01, // optional, nextFrameId() is called per default
    destination64: puces.railas,
    destination16: "B332", // optional, "fffe" is default
    //remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: "D0",
    commandParameter: [ 0x00 ] // Can either be string or byte array.
}
remoteOnRailas = { ...remoteOffRailas}
remoteOnRailas.commandParameter = [ 0x05 ]

module.exports = { remoteOffRailas, remoteOnRailas };
