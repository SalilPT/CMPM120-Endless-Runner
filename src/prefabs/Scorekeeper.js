class Scorekeeper extends Phaser.GameObjects.Text {
    constructor(params) {

        super(params.scene, params.x, params.y, "Score: 0", {fontFamily: "Impact"});

        this.textStyleConfig = {
            fontFamily: "Impact",
            color: "white",
            stroke: "black",
            strokeThickness: "1px",
            align: "left"
        }
        this.setStyle(this.textStyleConfig);
        this.currScore = 0;
        params.scene.add.existing(this);
    }

    getScore() {
        return this.currScore;
    }
    
    addScoreForCollectible(currLevel) {
        this.currScore += currLevel * 5;
        this.text = "Score: " + this.currScore;
    }

    addScoreForLevelIncrease(levelBeforeJump) {
        this.currScore += levelBeforeJump * 20;
        this.text = "Score: " + this.currScore;
    }
}