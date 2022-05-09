class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOverScene");
    }

    create() {
        this.scene.bringToTop();
        console.log("started the gameOverScene");
        let creditsConfig = {
            fontFamily: 'jebFont',
            fontSize: '18px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness:2,
            align: 'left',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }
        //set text
        this.add.text(globalGame.config.width/2, globalGame.config.height/3, 'GAME OVER', creditsConfig).setOrigin(0.5);
        this.resetButton = this.add.sprite(globalGameConfig.width/8, globalGameConfig.height/1.15, "creditsButton");
        this.add.text(globalGameConfig.width/8, globalGameConfig.height/1.15,'RESET', creditsConfig).setOrigin(.5);
        //button functionality
        this.resetButton.setInteractive();
        this.resetButton.on("pointerdown", () => {
            this.sound.play('buttonSound');
            console.log("Clicked on resetButton in  gameoverscene");
            this.scene.sleep(); // Prevent multiple background timers from being launched. Currently this restarts the background. TODO: Fix this
            this.scene.wake("menuScene");
            this.scene.stop("playScene");
            this.scene.launch("playScene");
        });
    }
}