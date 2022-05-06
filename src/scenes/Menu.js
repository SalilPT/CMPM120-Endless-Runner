class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    init() {

    }

    preload() {
        //load title
        this.load.image("title", "./assets/Title.png");
        // Load background and lava
        this.load.spritesheet("volcanicBackground", "./assets/background sprite sheet (3 frames) 384x128.png", {frameWidth: 384/3, frameHeight: 128});
        this.load.spritesheet("lavaTop", "./assets/lava sprite sheet (4 frames) 512x50.png", {frameWidth: 512/4, frameHeight: 50});
        // Load assets for Platforms and Scientist
        this.load.image("platform1", "./assets/Rock Platform 1 (Shadow)(128x74).png");
        
        this.load.spritesheet("scientist", "./assets/running spritesheet 64 pixels a frame.png", {frameWidth: 64});
        this.load.spritesheet("scientistRunningSpritesheet", "./assets/running spritesheet 64 pixels a frame.png", {frameWidth: 64});
        // Load UI buttons
        this.load.image("playButton", "./assets/playButton.png");
        this.load.image("creditsButton", "./assets/creditsButton.png")
        this.load.image("titleButton", "./assets/titleButton.png")
        // Load audio assets
    }

    create() {
        this.playButton = this.add.sprite(globalGameConfig.width/2, globalGameConfig.height/1.47, "playButton");
        this.creditsButton = this.add.sprite(globalGameConfig.width/2, globalGameConfig.height/1.47 + this.playButton.height + this.playButton.height/6, "creditsButton");
        this.title = this.add.sprite(globalGameConfig.width/2, globalGameConfig.height/4, "title");
        this.playButton.setInteractive();
        this.creditsButton.setInteractive();
        // put menu scene to the top of screen
        this.scene.bringToTop();
        // play button functionality
        this.playButton.on("pointerdown", () => {
            console.log("Clicked on playButton in Menu scene");
            this.scene.sleep("menuScene")
            // start the game
            this.scene.get("playScene").startGameplay();
        });
        //credits button functionality
        this.creditsButton.on("pointerdown", () => {
            console.log("Clicked on creditsButton in Menu scene");
            this.scene.sleep("menuScene");
            this.scene.sleep("playScene");
            // start the game
            this.scene.launch("creditsScene");
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
