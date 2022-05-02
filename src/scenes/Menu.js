class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    init() {

    }

    preload() {
        // Load background and lava
        this.load.spritesheet("volcanicBackground", "./assets/background sprite sheet (3 frames) 384x128.png", {frameWidth: 384/3, frameHeight: 128});
        this.load.spritesheet("lavaTop", "./assets/lava sprite sheet (4 frames) 512x50.png", {frameWidth: 512/4, frameHeight: 50});
        // Load assets for Platforms and Scientist
        this.load.image("platform1", "./assets/Rock Platform 1 (Shadow)(128x74).png");
        
        this.load.spritesheet("scientist", "./assets/running spritesheet 64 pixels a frame.png", {frameWidth: 64});
        this.load.spritesheet("scientistRunningSpritesheet", "./assets/running spritesheet 64 pixels a frame.png", {frameWidth: 64});
        // Load UI buttons
        this.load.image("playButton", "./assets/janky play button.png");
        // Load audio assets
    }

    create() {
        this.playButton = this.add.sprite(globalGameConfig.width/2, globalGameConfig.height/1.5, "playButton");
        this.playButton.setInteractive();
        // put menu scene to the top of screen
        this.scene.bringToTop();
        // play button
        this.playButton.on("pointerdown", () => {
            console.log("Clicked on playButton in Menu scene");
            this.scene.stop("menuScene")
            // start the game
            this.scene.get("playScene").startGameplay();
        });
        this.scene.launch("playScene");

        // Assign events for when buttons are clicked
        upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        // Play background music

    }

    update() {
        
    }
    
}
