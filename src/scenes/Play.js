class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }
    
    init() {
    }

    preload() {
        this.load.image('orange', './assets/orangeA.png');
        this.load.image('green', './assets/greenA.png');
    }

    create() {
        this.startEncounter(100, 100);
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
    startEncounter(x, y) { // x,y coordinates of where the arrows apear horizontally
        //add sprites to the scene
        this.Arrow1 = new KeyComboArrow(this, x, y, 'orange', 0);
        this.Arrow1.rotateArrow(); // randomly rotate the arrow by either 0, 90, 180, or 270 degrees
        this.Arrow2 = new KeyComboArrow(this, x + this.Arrow1.width + this.Arrow1.width/10, y, 'orange', 0);
        this.Arrow2.rotateArrow();
        this.Arrow3 = new KeyComboArrow(this, x + (this.Arrow1.width*2) + (this.Arrow1.width/10)*2, y, 'orange', 0);
        this.Arrow3.rotateArrow();
        this.Arrow4 = new KeyComboArrow(this, x + (this.Arrow1.width*3) + (this.Arrow1.width/10)*3, y, 'orange', 0);
        this.Arrow4.rotateArrow();
        
        
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
