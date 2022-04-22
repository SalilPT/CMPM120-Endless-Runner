class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }
    
    init() {

    }

    create() {
        // Initiate variables to use

        // Place tile sprites
    }

    update() {
        // Check collisions using Arcade Physics

        // Update current onscreen and offscreen platforms

        // Move lava up

        // Update camera

        // If there's currently an encounter, do the following

    }
    
    // Spawn platform offscreen at provided position
    spawnPlatformOffscreen(x, y) {

    }

    // Choose an enemy at random and return a reference to it
    chooseEnemy() {

    }

    // Spawn a collectible offscreen (Maybe with height from ground as parameter?)
    spawnCollectible() {

    }

    // Start encounter with obstacle
    startEncounter() {

    }

    // Spawn empty streatch of platforms before obstacle encounter
    spawnEmptyStretchOfPlatforms() {

    }

    // After a successful key combo, play animation to move onto the next level of scaffolding
    playJumpingToNextLevelAnim() {
        // Turn off player control

        // Play animation and wait for it to finish

        // Return control to player
    }
}
