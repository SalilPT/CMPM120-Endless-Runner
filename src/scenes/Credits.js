class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }

    init() {

    }
    preload() {
        //this.load.spritesheet("volcanicBackground", "./assets/background sprite sheet (3 frames) 384x128.png", {frameWidth: 384/3, frameHeight: 128});
    }
    create() {
        console.log("started the credits scene")
        this.myBackground = this.add.tileSprite(0, -globalGame.config.height, globalGame.config.width, globalGame.config.height*2, "volcanicBackground").setOrigin(0);
        this.myBackgroundTimer = this.createTileSpriteAnimTimer(this.myBackground, 3, 4);
        // credit text configuration
        let creditsConfig = {
            fontFamily: 'Courier',
            fontSize: '30px',
            fontStyle: 'Bold',
            color: '#72DAE3',
            align: 'left',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }
        
        // show menu text
        this.add.text(globalGame.config.width/2, globalGame.config.height/2, 'Art by:\nMiles Katlin\n\nProgramming by:\nSalil Tantamjarik\nGustavo Cruz', creditsConfig).setOrigin(0.5);
        //show title button
        this.titleButton = this.add.sprite(globalGameConfig.width/8, globalGameConfig.height/1.15, "titleButton");
        this.titleButton.setInteractive();
        //titleButton button functionality
        this.titleButton.on("pointerdown", () => {
            console.log("Clicked on titleButton in Credits scene");
            //this.scene.sleep("creditsScene")
            this.scene.stop(); // Prevent multiple background timers from being launched. Currently this restarts the background. TODO: Fix this
            this.scene.wake("menuScene");
            this.scene.wake("playScene");
        });

        // Assign event to transition back to menu
    }
        // Function to create timer to animate tileSprite Game Objects
    // Returns a reference to the newly added timer
    createTileSpriteAnimTimer(obj, numTotalAnimFrames, fps = 4) {
        let newTimer;
        obj.setData("currAnimFrame", 0);
        newTimer = this.time.addEvent(
            {
                delay: 1000/fps,
                callback: () => {
                    obj.setData("currAnimFrame", (obj.getData("currAnimFrame") + 1) % numTotalAnimFrames);
                    obj.setFrame(obj.getData("currAnimFrame"));
                },
                loop: true
            }
        );
        return newTimer;
    }
}
