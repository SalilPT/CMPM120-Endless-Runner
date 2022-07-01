class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOverScene");
    }

    create() {
        this.scene.bringToTop();
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

        // set text
        this.add.text(globalGame.config.width/2, globalGame.config.height/3, 'GAME OVER', creditsConfig).setOrigin(0.5);
        this.resetButton = this.add.sprite(globalGameConfig.width/8, globalGameConfig.height/1.15, "creditsButton");
        this.add.text(globalGameConfig.width/8, globalGameConfig.height/1.15,'RESET', creditsConfig).setOrigin(.5);

        // button functionality
        this.resetButton.setInteractive({useHandCursor: true});
        this.resetButton.on("pointerdown", () => {
            globalGame.sound.stopAll(); // Stop all audio
            this.sound.play('buttonSound');
            this.scene.stop();
            this.scene.wake("menuScene");
            this.scene.stop("playScene");
            this.scene.launch("playScene");
        });
    }
}
