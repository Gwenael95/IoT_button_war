class Game {
    constructor() {
        this.duration = 60 // in seconds
    }

    start = (status, message) => {
        if (this.isAlertCenter) {
            createAlertWindowCenter(status, message);
        } else {
            createAlert(status, message);
        }
    }
}