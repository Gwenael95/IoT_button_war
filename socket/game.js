const {getRandInteger, arrayExcludingVal, shuffleArray} = require("./helpers")

class Game {
    MIN_BETWEEN_LED_CHANGE = 3
    MAX_BETWEEN_LED_CHANGE = 7
    LED_INDEXES = [0, 1, 2]

    constructor() {
        this.duration = 30 // in seconds
        this.currentLight = []
        this.startTimestamp = null
        this.isGameEnd = false
        this.randomListLed = []
        this._setRandomListIndexLight()
        this.start()
    }

    _setRandomListIndexLight(){
        let nbSec = 0
        let currentButton = null
        while(nbSec < this.duration + this.MAX_BETWEEN_LED_CHANGE){
            currentButton = shuffleArray(arrayExcludingVal(this.LED_INDEXES, currentButton))[0] // random led index, without repetition
            this.randomListLed.push({ledIndex:currentButton, time:nbSec, ledOffIndex:arrayExcludingVal(this.LED_INDEXES, currentButton)})
            nbSec += getRandInteger(this.MIN_BETWEEN_LED_CHANGE, this.MAX_BETWEEN_LED_CHANGE)
        }
    }

    getLightOn(){
        const now = new Date().getTime();
        let val = null;
        if(!this.isEnd()) {
            for (let i = 0; i < this.randomListLed.length; i++) {
                console.log(this.randomListLed[i], val, this.randomListLed[i].time * 1000, now - this.startTimestamp)
                if (this.randomListLed[i].time * 1000 > now - this.startTimestamp) {
                    val = this.randomListLed[i].ledIndex
                    break
                } else {
                    this.randomListLed.shift()
                    i--
                }
            }
        }
        return val
    }

    start() {
        if(this.startTimestamp == null) {
            const currentDate = new Date();
            this.startTimestamp = currentDate.getTime();
            console.log(this.startTimestamp)
            setTimeout(()=>{console.log("################# END OF THE GAME #############")}, this.duration*1000)
        }
    }

    isEnd() {
        const now = new Date().getTime();
        this.isGameEnd = now-this.startTimestamp >= this.duration*1000
        console.log("game chrono = ", now-this.startTimestamp, (this.isGameEnd ? "this is the end" : ""))
        return this.isGameEnd
    }
}

module.exports = { Game };
