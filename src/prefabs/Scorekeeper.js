class Scorekeeper extends Phaser.GameObjects.Text {
    constructor(params) {
        super(params.scene, params.x, params.y, "SCORE: 0", {fontFamily: "Impact"});

        this.textStyleConfig = {
            fontFamily: "JebFont",
            fontSize: "large",
            color: "white",
            align: "left",
            stroke: '#000000',
            strokeThickness: 2,
            resolution: 8
        }
        this.setStyle(this.textStyleConfig);
        
        this.currScore = 0;
        // Treat this as a HUD game object that doesn't move with the rest of the world
        this.setScrollFactor(0);
        params.scene.add.existing(this);
        params.scene.sys.displayList.add(this);
    }

    getScore() {
        return this.currScore;
    }
    
    addScoreForCollectible(currLevel) {
        this.currScore += Math.ceil(currLevel/4) * 5;
        this.text = "SCORE: " + this.currScore;
    }

    addScoreForLevelIncrease(levelBeforeJump) {
        this.currScore += levelBeforeJump * 20;
        this.text = "SCORE: " + this.currScore;
    }
}
