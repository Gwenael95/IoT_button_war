const xbee_api = require("xbee-api");
const puces = require("./puce_zigbee");
const C = xbee_api.constants;

//@todo : is there a command to get all DI states (instead of one call per led)

//region on off LED
//region LED 1 on/off
const ledOff_0 = {
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST, // 0x17, // xbee_api.constants.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST
    //id: 0x01, // optional, nextFrameId() is called per default
    destination64: puces.ledBoard.dest64,
    destination16: puces.ledBoard.dest16, // optional, "fffe" is default
    //remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: puces.ledBoard.led0,
    commandParameter: [ C.PIN_MODE.D0.DISABLED ] // Can either be string or byte array.
}
const ledOn_0 = { ...ledOff_0}
ledOn_0.commandParameter = [ C.PIN_MODE.D0.DIGITAL_OUTPUT_HIGH ]

const isLedOn_0 = { ...ledOff_0}
isLedOn_0.commandParameter = [ ]

//endregion

//region LED 2 on/off
const ledOff_1 = { ...ledOff_0}
ledOff_1.command =  puces.ledBoard.led1
const ledOn_1 = { ...ledOff_1}
ledOn_1.commandParameter = [ C.PIN_MODE.D0.DIGITAL_OUTPUT_HIGH ]
const isLedOn_1 = { ...ledOff_1}
isLedOn_1.commandParameter = [ ]
//endregion

//region LED 3 on/off
const ledOff_2 = { ...ledOff_0}
ledOff_2.command = puces.ledBoard.led2
const ledOn_2 = { ...ledOff_2}
ledOn_2.commandParameter = [ C.PIN_MODE.D0.DIGITAL_OUTPUT_HIGH ]
const isLedOn_2 = { ...ledOff_2}
isLedOn_2.commandParameter = [ ]
//endregion
//endregion

//region frames AT command for init

const frame_name = {
    type: C.FRAME_TYPE.AT_COMMAND_QUEUE_PARAMETER_VALUE,
    command: "NI",
    commandParameter: [],
};
const frame_sh = { ...frame_name}
frame_sh.command = "SH"
const frame_sl = {...frame_name}
frame_sl.command = "SL"
const frame_net_addr = {...frame_name}
frame_net_addr.command = "MY"

const frame_d0 = {...frame_name}
frame_d0.command = "D0"
const frame_d1 = {...frame_name}
frame_d1.command = "D1"
const frame_d2 = {...frame_name}
frame_d2.command = "D2"
const frame_d3 = {...frame_name}
frame_d3.command = "D3"
const frame_d4 = {...frame_name}
frame_d4.command = "D4"
//endregion

module.exports = {
    ledOff_0, ledOn_0, isLedOn_0,
    ledOff_1, ledOn_1, isLedOn_1,
    ledOff_2, ledOn_2, isLedOn_2,
    frame_name, frame_sl, frame_sh, frame_net_addr,
    frame_d0, frame_d1, frame_d2, frame_d3, frame_d4,
};
