class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    init() {

    }

    preload() {
        // Load background

        // Load assets for Platforms and Scientist

        // Load UI buttons

        // Load audio assets
    }

    create() {
        // Place menu buttons

        // Assign events for when buttons are clicked
        this.scene.start('playScene');

        // Play background music

    }

    update() {

    }
    
}
