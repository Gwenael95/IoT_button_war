const {getRandInteger, arrayExcludingVal, shuffleArray} = require("./helpers")

class Game {
    MIN_BETWEEN_LED_CHANGE = 3
    MAX_BETWEEN_LED_CHANGE = 7
    POINT_PER_GOOD = 1
    POINT_PER_BAD = -3

    LED_INDEXES = [0, 1, 2]

    /**
     *
     * @param players {Array<Controller>}
     */
    constructor(players) {
        this.duration = 30 // in seconds
        this.currentLight = []
        this.startTimestamp = null
        this.isGameEnd = false
        this.randomListLed = []
        this.scores = {}
        this.players = players
        this._initScores()
        this._initRandomListIndexLight()
        this.start()
    }
    _initScores(){
        this.players.forEach(controller=>{
            this.scores[controller.dest64] = 0
        })
    }
    setScore(controller, isGood){
        this.scores[controller.dest64] += (isGood ? this.POINT_PER_GOOD : this.POINT_PER_BAD)
        console.log("Score = ", controller.dest64, this.scores[controller.dest64] , (isGood ? "the light was on, +" +  this.POINT_PER_GOOD + " pt" : "the light was off, -" + this.POINT_PER_BAD + " pts"))
    }

    _initRandomListIndexLight(){
        let nbSec = 0
        let currentButton = null
        while(nbSec < this.duration + this.MAX_BETWEEN_LED_CHANGE){
            currentButton = shuffleArray(arrayExcludingVal(this.LED_INDEXES, currentButton))[0] // random led index, without repetition
            const lastTime =nbSec
            nbSec += getRandInteger(this.MIN_BETWEEN_LED_CHANGE, this.MAX_BETWEEN_LED_CHANGE)
            this.randomListLed.push({ledIndex:currentButton, time:lastTime, lastTime:nbSec, ledOffIndex:arrayExcludingVal(this.LED_INDEXES, currentButton)})
        }
    }

    getLightOn(){
        const now = new Date().getTime();
        let val = null;
        if(!this.isEnd()) {
            for (let i = 0; i < this.randomListLed.length; i++) {
                console.log(this.randomListLed[i], val, this.randomListLed[i].lastTime * 1000, now - this.startTimestamp)
                if (this.randomListLed[i].lastTime * 1000 > now - this.startTimestamp) {
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
        console.log("game chrono = ", now-this.startTimestamp, (this.isGameEnd ? "this is the end : " : ""), (this.isGameEnd ? this.scores : ""))
        return this.isGameEnd
    }
}

module.exports = { Game };
