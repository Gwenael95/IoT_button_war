
class Controller {
    constructor(dest64, dest16, button0, button1, button2) {
        this.dest64 = dest64.toLowerCase()
        this.dest16 = dest16.toLowerCase()
        this.button0 = button0
        this.button1 = button1
        this.button2 = button2
        //this.pressedInputs = {[this.button0]:false, [this.button1]:false, [this.button2]:false }
        this.pressedInputs = []
    }

    setPressed (newPressedList){
        this.pressedInputs = newPressedList
    }
    whichButtonJustChange (newPressedList){
        return this.pressedInputs.filter(x => !newPressedList.includes(x)) .concat(newPressedList.filter(x => !this.pressedInputs.includes(x)))[0];
    }
}

module.exports = { Controller };
