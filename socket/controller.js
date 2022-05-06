const {getDiffInArray} = require("./helpers")

class Controller {
    constructor(dest64, dest16, button0, button1, button2, alreadyConfig) {
        this.dest64 = dest64.toLowerCase()
        this.dest16 = dest16.toLowerCase()
        this.button0 = button0
        this.button1 = button1
        this.button2 = button2
        this.setButtonList()
        this.indexLastInputChanged = null
        this.isAlreadyConfig = (alreadyConfig !== null && alreadyConfig !== undefined ? alreadyConfig : false)
        this.pressedInputs = []
        this.sh = null
        this.sl = null
        this.potentialButton = []
    }

    setIsAutoConfig(){
        console.log("HERE CHECK IF CONFIG", this.dest64, this.dest16, this.button0, this.button1, this.button2 )
        this.isAlreadyConfig = this.dest64 != null && this.dest16 != null
            && this.button0 != null && this.button1 != null && this.button2 != null
        && this.dest64 !== "" && this.dest16 !== ""
            && this.button0 !== "" && this.button1 !== "" && this.button2 !== ""
    }
    setButtonList(){
        this.buttonList = [ this.button0,  this.button1,  this.button2]
        this.setIsAutoConfig()
    }
    //region setters for auto init
    addButtonInPotentialButton(newButton){
        this.potentialButton.push(newButton)
        this.potentialButton.sort()
        for(let i=0; i < this.potentialButton.length && i<4 ;i++){
            this["button" + i] = this.potentialButton[i]
        }
        this.setButtonList()
    }
    setSh(shVal){
        this.sh = shVal
        this.setDest64FromShSl()
    }
    setSl(slVal){
        this.sl = slVal
        this.setDest64FromShSl()
    }
    setDest64FromShSl(){
        if(this.sh !== null && this.sl !== null && (this.sh + this.sl).length ===  16){
            this.dest64 = this.sh + this.sl
            this.setIsAutoConfig()
        }
    }
    setDest64(dest64){
        this.dest64 = dest64
        this.setIsAutoConfig()
    }
    setDest16(dest16){
        this.dest16 = dest16
        this.setIsAutoConfig()
    }
    //endregion

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
