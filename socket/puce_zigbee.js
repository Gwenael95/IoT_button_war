const xbee_api = require("xbee-api");
const {Controller} = require("./controller");
const C = xbee_api.constants;

ledBoard = {dest64:"0013A20041C34B12".toLowerCase(), dest16:"B332", led0:C.PIN_COMMAND.DIO0, led1:C.PIN_COMMAND.DIO1, led2:C.PIN_COMMAND.DIO2}
controller1 =  new Controller("0013A20041A72946", "B089", C.CHANGE_DETECTION.MASK[0][0], C.CHANGE_DETECTION.MASK[2][0], C.CHANGE_DETECTION.MASK[3][0] ) ;
controller2 =  new Controller("0013A20041582FB1", "100E", C.CHANGE_DETECTION.MASK[0][0], C.CHANGE_DETECTION.MASK[1][0], C.CHANGE_DETECTION.MASK[2][0] ) ;

module.exports = { ledBoard, controller1, controller2 };
