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
        this.load.image("scientist", "./assets/Jeb The Geologist temp file.png");
        // Load UI buttons

        // Load audio assets
    }

    create() {
        this.input.setGlobalTopOnly(true);
        this.input.on("pointerdown", pointer => {console.log("Clicked in menu");});
        setTimeout(() => {this.scene.launch("playScene"); this.scene.stop("menuScene")}, 0);
        // Place menu buttons

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
