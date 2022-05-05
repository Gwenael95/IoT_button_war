const xbee_api = require("xbee-api");
const puces = require("./puce_zigbee");
const C = xbee_api.constants;

//@todo : is there a command to get all DI states (instead of one call per led)

//region on off LED
//region LED 1 on/off
ledOff_0 = {
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST, // 0x17, // xbee_api.constants.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST
    //id: 0x01, // optional, nextFrameId() is called per default
    destination64: puces.ledBoard.dest64,
    destination16: puces.ledBoard.dest16, // optional, "fffe" is default
    //remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: puces.ledBoard.led0,
    commandParameter: [ C.PIN_MODE.D0.DISABLED ] // Can either be string or byte array.
}
ledOn_0 = { ...ledOff_0}
ledOn_0.commandParameter = [ C.PIN_MODE.D0.DIGITAL_OUTPUT_HIGH ]

isLedOn_0 = { ...ledOff_0}
isLedOn_0.commandParameter = [ ]

//endregion

//region LED 2 on/off
ledOff_1 = { ...ledOff_0}
ledOff_1.command =  puces.ledBoard.led1
ledOn_1 = { ...ledOff_1}
ledOn_1.commandParameter = [ C.PIN_MODE.D0.DIGITAL_OUTPUT_HIGH ]
isLedOn_1 = { ...ledOff_1}
isLedOn_1.commandParameter = [ ]
//endregion

//region LED 3 on/off
ledOff_2 = { ...ledOff_0}
ledOff_2.command = puces.ledBoard.led2
ledOn_2 = { ...ledOff_2}
ledOn_2.commandParameter = [ C.PIN_MODE.D0.DIGITAL_OUTPUT_HIGH ]
isLedOn_2 = { ...ledOff_2}
isLedOn_2.commandParameter = [ ]
//endregion
//endregion

module.exports = {
    ledOff_0, ledOn_0, isLedOn_0,
    ledOff_1, ledOn_1, isLedOn_1,
    ledOff_2, ledOn_2, isLedOn_2
};
