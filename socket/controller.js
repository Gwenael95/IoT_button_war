const {getDiffInArray} = require("./helpers")

class Controller {
    constructor(dest64, dest16, button0, button1, button2) {
        this.dest64 = dest64.toLowerCase()
        this.dest16 = dest16.toLowerCase()
        this.button0 = button0
        this.button1 = button1
        this.button2 = button2
        this.buttonList = [ this.button0,  this.button1,  this.button2]
        this.indexLastInputChanged = null
        this.pressedInputs = []
    }

    setPressed (newPressedList){
        this.pressedInputs = newPressedList
    }
    setJustChangeButton (newButton){
        this.indexLastInputChanged = this.buttonList.indexOf(newButton)
    }
    whichButtonJustChange (newPressedList){
        //const button = this.pressedInputs.filter(x => !newPressedList.includes(x)) .concat(newPressedList.filter(x => !this.pressedInputs.includes(x)))[0]
        const button = getDiffInArray(this.pressedInputs, newPressedList)[0]
        this.setJustChangeButton(button)
        return button;
    }
}

module.exports = { Controller };
