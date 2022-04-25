class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    init() {

    }

    preload() {
        // Load background

        // Load assets for Platforms and Scientist
        this.load.image("platform1", "./assets/Volcano Background 128x128 (glow 1).png");
        this.load.image("scientist", "./assets/Jeb The Geologist temp file.png");
        // Load UI buttons

        // Load audio assets
    }

    create() {
        this.input.setGlobalTopOnly(true);
        this.input.on("pointerdown", pointer => {console.log("Clicked in menu");});
        setTimeout(() => {this.scene.launch("playScene");}, 0);
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
