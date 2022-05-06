const xbee_api = require("xbee-api");
const {Controller} = require("./controller");
const C = xbee_api.constants;

ledBoard = {dest64:"0013A20041C34B12".toLowerCase(), dest16:"B332", led0:C.PIN_COMMAND.DIO0, led1:C.PIN_COMMAND.DIO1, led2:C.PIN_COMMAND.DIO2}
controller1 =  new Controller("", "", "", "", "") ;
//controller1 =  new Controller("0013A20041A72946", "B089", C.CHANGE_DETECTION.MASK[0][0], C.CHANGE_DETECTION.MASK[2][0], C.CHANGE_DETECTION.MASK[3][0]) ;
//controller2 =  new Controller("", "", "", "", "") ;

// set true if don't need to check connection
controller2 =  new Controller("0013A20041582FB1", "498E", C.CHANGE_DETECTION.MASK[0][0], C.CHANGE_DETECTION.MASK[1][0], C.CHANGE_DETECTION.MASK[2][0], true) ;
controller3 =  new Controller("0013A20041C34AC1", "4D81", C.CHANGE_DETECTION.MASK[0][0], C.CHANGE_DETECTION.MASK[2][0], C.CHANGE_DETECTION.MASK[3][0]) ;
controller4 =  new Controller("", "","", "", "") ;
controller5 =  new Controller("", "","", "", "") ;

const controllerList = [
    controller1,
    controller2,
    controller3,
    controller4,
    controller5,
]

const puceListDest64 = []
controllerList.forEach(el=>{
    puceListDest64.push(el.dest64)
})

module.exports = { ledBoard, controllerList, controller1, controller2, controller3, controller4, puceListDest64 };
