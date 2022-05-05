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
     * @param firestoreDocRef {string}
     * @param duration {int|null|undefined}
     */
    constructor(players, firestoreDocRef, duration) {
        this.duration = (duration === null || duration === undefined ? 60 : duration) // in seconds
        this.currentLight = []
        this.startTimestamp = null
        this.isGameEnd = false
        this.randomListLed = []
        this.scores = {}
        this.players = players
        this.firestoreDocRef = firestoreDocRef
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
        return this.scores[controller.dest64]
    }
    getFormatedScore(){
        const data = {}
        for (let i=0; i<this.players.length ;i++){
            data["scoreJ" + (i+1)] = this.scores[this.players[i].dest64]
        }
        return data
    }

    /**
     * init the game sequence of light to switch on randomly.
     * ledOnIndex is the index of light to be on.
     * time is the
     * finalTime is the start time the light is switch on
     * @private
     */
    _initRandomListIndexLight(){
        let nbSec = 0
        let currentLedIndex = null
        while(nbSec < this.duration + this.MAX_BETWEEN_LED_CHANGE){
            currentLedIndex = shuffleArray(arrayExcludingVal(this.LED_INDEXES, currentLedIndex))[0] // random led index, without repetition
            const prevTime = nbSec
            nbSec += getRandInteger(this.MIN_BETWEEN_LED_CHANGE, this.MAX_BETWEEN_LED_CHANGE)
            this.randomListLed.push({ledOnIndex:currentLedIndex, time:prevTime, finalTime:nbSec, ledOffIndex:arrayExcludingVal(this.LED_INDEXES, currentLedIndex)})
        }
    }

    /**
     * get the light currently switch on, and remove passed randomListLed item
     * @return {null}
     */
    getLightOn(){
        const now = new Date().getTime();
        let val = null;
        if(!this.isEnd()) {
            for (let i = 0; i < this.randomListLed.length; i++) {
                //console.log(this.randomListLed[i], val, this.randomListLed[i].finalTime * 1000, now - this.startTimestamp)
                if (this.randomListLed[i].finalTime * 1000 > now - this.startTimestamp) {
                    val = this.randomListLed[i].ledOnIndex
                    break
                } else {
                    this.randomListLed.shift()
                    i--
                }
            }
        }
        return val
    }

    /**
     * start the game,
     * generate a timestamp on start that will serve as reference to know how much time has passed for this game.
     * we log text when it's end of the game using setTimeout
     */
    start() {
        if(this.startTimestamp == null) {
            const currentDate = new Date();
            this.startTimestamp = currentDate.getTime();
            console.log(this.startTimestamp)
            setTimeout(()=>{console.log("################# END OF THE GAME #############")}, this.duration*1000)
        }
    }

    /**
     * called to check if the game is ended and set isGameEnd.
     * @return {boolean}
     */
    isEnd() {
        const now = new Date().getTime();
        this.isGameEnd = now-this.startTimestamp >= this.duration*1000
        console.log("game chrono = ", now-this.startTimestamp, (this.isGameEnd ? "this is the end : " : ""), (this.isGameEnd ? this.scores : ""))
        return this.isGameEnd
    }
}

module.exports = { Game };
