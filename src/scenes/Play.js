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
        /*
        Initiate variables to use
        */
        this.platformSpawnXCoord = globalGame.config.width * 1.5;
        //this.platformSpawnXCoord = globalGame.config.width * .76;
        // Platform pooling code adapted from code by Emanuele Feronato: https://www.emanueleferonato.com/2018/11/13/build-a-html5-endless-runner-with-phaser-in-a-few-lines-of-code-using-arcade-physics-and-featuring-object-pooling/ 
        this.activePlatformGroup = this.add.group(
            {
                removeCallback: function (platform) {
                    platform.body.setVelocity(0,0);
                    platform.scene.platformPool.add(platform)
                }
            }
        );
        this.platformPool = this.add.group(
            {
                removeCallback: function (platform) {
                    platform.scene.activePlatformGroup.add(platform)
                }
            }
        );

        // The current scrolling speed of the environment 
        this.currEnvScrollVel = 0;

        this.encounterActive = false;
        // Place tile sprites
        this.testPhysicsSprite = this.physics.add.sprite(globalGame.config.width/4, globalGame.config.height/2+40, "platform1");
        this.testPhysicsSprite.setDisplaySize(32, 8);
        //console.log(this.testPhysicsSprite.height);
        this.testPhysicsSprite.destroy();

        this.playerStartPosX = globalGame.config.width / 2;
        this.playerStartPosY = globalGame.config.height / 2;
        let playerCharArgs = {
            scene: this,
            x: this.playerStartPosX,
            y: this.playerStartPosY,
            texture: "scientist",
            frame: 0
        }
        this.playerChar = new Scientist(playerCharArgs).setOrigin(0.5);
        this.playerChar.setBounce(0);
        this.platformSpawnYCoord = this.playerChar.y + this.playerChar.height/2;
        //his.playerChar.setDisplaySize(32, 32);
        //console.log(this.playerChar.body);
        //this.playerChar.setVelocity(5,0);
        this.platform1BaseWidth = this.textures.get("platform1").getSourceImage().width;
        console.log(this.platform1BaseWidth);
        this.defaultPlatformBodyHeight = this.textures.get("platform1").getSourceImage().height;;
        this.rightmostPlatform;
        this.createStartingPlatforms();
        this.encounterActive = false;
        this.enemyTriggerPlatform;
        this.leftBoundPlatformCutoff = -globalGame.config.width;

        this.myTweenManager = new Phaser.Tweens.TweenManager(this);








        // TEMPORARY STUFF
        console.log("playScene started");
        this.input.setGlobalTopOnly(true);
        
        this.input.keyboard.on("keydown-RIGHT", () => {console.log("RIGHT"); this.currEnvScrollVel -= 10 * !this.encounterActive;});
        this.input.keyboard.on("keydown-LEFT", () => {console.log("LEFT"); this.currEnvScrollVel += 10 * !this.encounterActive;});
        this.input.keyboard.on("keydown-UP", () => {
            console.log("UP");})
        this.input.keyboard.on("keydown-DOWN", () => {
            console.log("DOWN");
        });
        
        this.input.on("pointerdown", pointer => {
            console.log("Clicked in play");
            this.currEnvScrollVel = -100;
            this.playerChar.setFriction(0);
            this.playerChar.setGravity(0, 400);
        });

        this.physics.add.collider(this.playerChar, this.activePlatformGroup);

        this.obstacleTimerConfig = {
            delay: (5 + Math.random() * 5) * 1000,
            callback: () => {this.startEncounter();

            }
        }
        this.obstacleTimer = this.time.addEvent(this.obstacleTimerConfig);

        this.obstacleInRange = false;
    }

    update() {
        
        // Check collisions using Arcade Physics

        // Update current onscreen and offscreen platforms
        //this.currEnvScrollVel = this.currEnvScrollVel <= -1000 ? -100 : this.currEnvScrollVel - 500;
        //console.log(this.platformPool.getLength(), this.activePlatformGroup.getLength());
        //this.currEnvScrollVel = this.currEnvScrollVel == -1000 ? -1000 : -1000; // breaks spawning; might need to add upcoming platforms to group that gets updated after spawning
                
        for (let platform of this.activePlatformGroup.getChildren()) {
            if ((platform.x + platform.displayWidth) < this.leftBoundPlatformCutoff) {
                this.activePlatformGroup.killAndHide(platform);
                this.activePlatformGroup.remove(platform);
                continue;
            }
            platform.body.setVelocityX(this.currEnvScrollVel);
        }

        let thing = false;
        while (
            (this.rightmostPlatform.x + this.rightmostPlatform.width) < this.platformSpawnXCoord
            && !this.encounterActive) {
                console.log("???", this.rightmostPlatform.x + this.rightmostPlatform.width);
                
                console.assert(this.rightmostPlatform.body.x + this.rightmostPlatform.body.width === this.getPhysBounds(this.rightmostPlatform).right, "Platform check failed: " + (this.rightmostPlatform.body.x + this.rightmostPlatform.body.width) + " != " + this.getPhysBounds(this.rightmostPlatform).right);

                thing = this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord);
                
                //console.log(thing.x);     
                           

        }
        
        // Move lava up

        // Update camera (currently just changes the positions on things onscreen)
        if (!this.encounterActive) {
            // Check if every active platform is above starting y
            let canMovePlatformsDown = true;
            for (let platform of this.activePlatformGroup.getChildren()) {
                if (platform.y >= this.playerStartPosY + this.playerChar.height/2) {
                    canMovePlatformsDown = false;
                    break;
                }
            }
            if (canMovePlatformsDown) {
                for (let platform of this.activePlatformGroup.getChildren()) {
                    platform.y += 2;
                }
                this.platformSpawnYCoord += 2;
                this.playerChar.y += 2;
            }
        }
        // If there's currently an encounter, do the following
        if (this.encounterActive) {

            if (this.enemyTriggerPlatform.x + this.enemyTriggerPlatform.width <= globalGame.config.width*(3/4)
            && !this.obstacleInRange) {
                this.currEnvScrollVel = 0;
                this.obstacleInRange = true;

                this.placeKeyCombo(this.playerChar.x - 96, globalGame.config.height * 0.75);
            }
            else if (this.enemyTriggerPlatform.x + this.enemyTriggerPlatform.width <= this.platformSpawnXCoord) {
                
                while ((this.rightmostPlatform.x + this.rightmostPlatform.width) < this.platformSpawnXCoord) {
                        this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord);

                }
            }
        }
        //this.currEnvScrollVel = this.currEnvScrollVel == -1000 ? -1000 : -1000; // breaks spawning; might need to add upcoming platforms to group that gets updated after spawning
    }
    
    // Spawn platform at provided position
    spawnPlatform(x, y) {
        let platformToSpawn;
        // Check if a platform is in the pool first
        if (this.platformPool.getLength() > 0) {
            platformToSpawn = this.platformPool.getFirst();
            platformToSpawn.setActive(true);
            platformToSpawn.setVisible(true);
            
            this.platformPool.remove(platformToSpawn);
        }
        // If a platform can't be retrieved from the pool, create a new one
        else {
            platformToSpawn = this.physics.add.sprite(x, y, "platform1");
            platformToSpawn.setDisplaySize(this.platform1BaseWidth, this.defaultPlatformBodyHeight);
            platformToSpawn.setPushable(false);

            this.activePlatformGroup.add(platformToSpawn);
           
        }
        platformToSpawn.setOrigin(0);
        
        // IMPORTANT SECTION
        platformToSpawn.body.reset(x,y);
        // Not sure if these two are necessary, but I'll keep them here anyway
        platformToSpawn.body.x = x;
        platformToSpawn.body.y = y;
        //
        
        platformToSpawn.body.setVelocityX(this.currEnvScrollVel);
        this.rightmostPlatform = platformToSpawn;
        //console.log("New platform x: " + platformToSpawn.x);
        return platformToSpawn;
    }

    // Choose an enemy at random and return a reference to it
    chooseEnemy() {

    }

    // Spawn a collectible offscreen (Maybe with height from ground as parameter?)
    spawnCollectible() {

    }
 
    // Start encounter with obstacle
    startEncounter() {
        console.warn("Enemy encounter would start here");
        this.encounterActive = true;
        this.spawnEmptyStretchOfPlatforms();
        this.platformSpawnYCoord -= 128;
    }

    // Place key combo
    placeKeyCombo(x, y) { // x,y coordinates of where the arrows apear horizontally
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

                this.playJumpingToNextLevelAnim();

                if (this.obstacleInRange) {
                    this.encounterActive = false;
                    this.obstacleInRange = false;
                    this.currEnvScrollVel = -200;
                    this.playerChar.setVelocityY(-400);
                    this.obstacleTimer = this.time.addEvent(this.obstacleTimerConfig);
                }
            }
        });

    }

    // Spawn empty stretch of platforms before obstacle encounter. Returns a reference to the last spawned platform.
    spawnEmptyStretchOfPlatforms(length = globalGame.config.width) {
        let numPlatformsToSpawn = Math.ceil(length / this.platform1BaseWidth);
        for (let i = 0; i < numPlatformsToSpawn - 1; i++) {
            this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord);
        }
        
        this.enemyTriggerPlatform = this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord);
        
    }

    // Create the platforms at the start of the game
    createStartingPlatforms() {
        let currX = globalGame.config.width/4;
        while (true) {
            let newPlatform = this.spawnPlatform(currX, this.platformSpawnYCoord);
            currX = newPlatform.x + newPlatform.width;
            if (currX >= this.platformSpawnXCoord) {
                break;
            }
        }
        console.log(this.rightmostPlatform.x + this.rightmostPlatform.width);
    }

    // After a successful key combo, play animation to move onto the next level of scaffolding
    playJumpingToNextLevelAnim() {
        // destroy arrow sprites
        setTimeout( () => {
        this.Arrow1.destroy();
        this.Arrow2.destroy();
        this.Arrow3.destroy();
        this.Arrow4.destroy();
        },
        1000
        );
        // Turn off player control
        
        // Play animation and wait for it to finish

        // Return control to player
    }
    
    // Helper function to get the bounds of an Arcade Physics object's body
    getPhysBounds(obj) {
        let dummy_obj = {};
        obj.body.getBounds(dummy_obj);
        return dummy_obj;
    }
}
