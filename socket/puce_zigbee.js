const xbee_api = require("xbee-api");
const {Controller} = require("./controller");
const C = xbee_api.constants;

ledBoard = {dest64:"0013A20041C34B12".toLowerCase(), dest16:"B332"}
//ic.MASK[0] = ["DIO0"];
// ic.MASK[1] = ["DIO1"];
controller1 =  new Controller("0013A20041A72946", "B089", C.CHANGE_DETECTION.MASK[0][0], C.CHANGE_DETECTION.MASK[2][0], C.CHANGE_DETECTION.MASK[3][0] ) ;

module.exports = { ledBoard, controller1 };
