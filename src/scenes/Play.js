class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }
    
    init() {
    }

    preload() {
        this.load.image('promtedArrow', './assets/orangeA.png');
        this.load.image('passedArrow', './assets/greenA.png');
    }

    create() {
        //define keys
        upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);

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
        let CorrectInputNum = 0;
        //add sprites to the scene 
        this.Arrow1 = new KeyComboArrow(this, x, y, 'promtedArrow', 0); // dont set origin to (0,0) or rotation wont work properly
        this.Arrow1.rotateArrow();
        this.Arrow2 = new KeyComboArrow(this, x + this.Arrow1.width + this.Arrow1.width/10, y, 'promtedArrow', 0);
        this.Arrow2.rotateArrow();
        this.Arrow3 = new KeyComboArrow(this, x + (this.Arrow1.width*2) + (this.Arrow1.width/10)*2, y, 'promtedArrow', 0);
        this.Arrow3.rotateArrow();
        this.Arrow4 = new KeyComboArrow(this, x + (this.Arrow1.width*3) + (this.Arrow1.width/10)*3, y, 'promtedArrow', 0);
        this.Arrow4.rotateArrow();
        // create a keycombo based on the current orientation of the randomly rotated keys
        let keyComboNeeded = this.input.keyboard.createCombo([this.Arrow1.getDirection(), this.Arrow2.getDirection(), this.Arrow3.getDirection(), this.Arrow4.getDirection()], {
            resetOnWrongKey: true,  // if they press the wrong key is the combo reset?
            maxKeyDelay: 0,         // max delay (ms) between each key press (0 = disabled)
            deleteOnMatch: true    // if combo matches, will it delete itself?
        });
        // watch for keycombomatches
        this.input.keyboard.on('keycombomatch', (combo, event) => {
            if (combo === keyComboNeeded) { 
                console.log('change arrow sprites to their passed sprite')
                this.Arrow1.changeToPassingSprite();
                this.Arrow2.changeToPassingSprite();
                this.Arrow3.changeToPassingSprite();
                this.Arrow4.changeToPassingSprite();
            }
        });

    }

    // Spawn empty streatch of platforms before obstacle encounter
    spawnEmptyStretchOfPlatforms() {

    }

    // After a successful key combo, play animation to move onto the next level of scaffolding
    playJumpingToNextLevelAnim() {
        // destroy arrow sprites
        this.Arrow1.destroy();
        this.Arrow2.destroy();
        this.Arrow3.destroy();
        this.Arrow4.destroy();
        // Turn off player control

        // Play animation and wait for it to finish

        // Return control to player
    }
    
}