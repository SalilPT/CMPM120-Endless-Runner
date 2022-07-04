class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }

    create() {
        // Bring the Play scene's background tilesprite in front of everything else in the Play scene
        // This makes it so the background tilesprite becomes the background for the Credits scene
        let playSceneBackground = this.scene.get("playScene").myBackground;
        let playSceneBackgroundDepth = playSceneBackground.depth;
        this.scene.get("playScene").children.bringToTop(playSceneBackground);

        // credit text configuration
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
            fixedWidth: 0,
            resolution: 8
        }
        
        // show credits text
        this.add.text(globalGame.config.width/2, globalGame.config.height/2, 'ART BY:\nMILES KATLIN\n\nPROGRAMMING BY:\nSALIL TANTAMJARIK\nGUSTAVO CRUZ\n\nSOUND AND MUSIC BY:\nSALIL TANTAMJARIK\nMILES KATLIN\nGUSTAVO CRUZ', creditsConfig).setOrigin(0.5);
        // show title button
        this.titleButton = this.add.sprite(globalGameConfig.width/8, globalGameConfig.height/1.15, "creditsButton");
        this.add.text(globalGameConfig.width/8, globalGameConfig.height/1.15,'BACK', creditsConfig).setOrigin(.5);
        this.titleButton.setInteractive({useHandCursor: true});
        // titleButton button functionality
        this.titleButton.on("pointerdown", () => {
            this.input.manager.canvas.style.cursor = "default"; // Reset cursor icon. Thanks to rexrainbow: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/cursor/
            playSceneBackground.setDepth(playSceneBackgroundDepth); // Reset depth of Play scene's background to what it was when this scene was started
            this.sound.play('buttonSound');
            this.scene.stop(); // Prevent multiple background timers from being launched. Currently this restarts the background. TODO: Fix this
            this.scene.wake("menuScene");
        });
    }
}
