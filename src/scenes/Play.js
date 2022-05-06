class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }
    
    init() {
    }

    preload() {
        this.load.image('promtedArrow', './assets/blueArrow.png');
        this.load.image('passedArrow', './assets/greenArrow.png');
        
        // Load sprites for collectibles
        this.load.image('crystal_red', './assets/red crystal.png');
        this.load.image('crystal_green', './assets/green crystal.png');
        this.load.image('crystal_blue', './assets/blue crystal.png');
        this.load.image('crystal_purple', './assets/purple crystal.png');
    }

    create() {
        /*
        Initiate variables to use
        */
        this.platformSpawnRightThreshold = globalGame.config.width * 1.25;
        //this.platformSpawnRightThreshold = globalGame.config.width * .76;
        // Platform pooling code adapted from code by Emanuele Feronato: https://www.emanueleferonato.com/2018/11/13/build-a-html5-endless-runner-with-phaser-in-a-few-lines-of-code-using-arcade-physics-and-featuring-object-pooling/ 
        this.activePlatformGroup = this.add.group(
            {
                removeCallback: function (platform) {
                    platform.body.setVelocity(0,0);
                    platform.clearTint();
                    platform.scene.platformPool.add(platform);
                }
            }
        );
        this.platformPool = this.add.group(
            {
                removeCallback: function (platform) {
                    platform.scene.activePlatformGroup.add(platform);
                }
            }
        );

        // The current scrolling speed of the environment 
        this.currEnvScrollXVel = 0;
        this.currEnvScrollYVel = 0;

        // Place tile sprites
        this.myBackground = this.add.tileSprite(0, -globalGame.config.height, globalGame.config.width, globalGame.config.height*2, "volcanicBackground").setOrigin(0);
        this.myBackgroundTimer = this.createTileSpriteAnimTimer(this.myBackground, 3, 4);
        this.lavaTop = this.add.tileSprite(0, globalGame.config.height, globalGame.config.width, 50, "lavaTop", 0).setOrigin(0);
        this.lavaTopAnimTimer = this.createTileSpriteAnimTimer(this.lavaTop, 4, 4);

        // Variables for player character
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
        this.playerChar.playMenuBackgroundAnim();
        
        // Have the camera follow the player character
        this.cameras.main.startFollow(this.playerChar);

        // Variables for platform management
        this.platformSpawnYCoord = this.playerChar.y + this.playerChar.height/2;
        this.platform1BaseWidth = this.textures.get("platform1").getSourceImage().width;
        this.defaultPlatformBodyHeight = this.textures.get("platform1").getSourceImage().height;
        this.rightmostPlatform;
        this.createStartingPlatforms();
        this.encounterActive = false;
        this.enemyTriggerPlatform;
        this.leftBoundPlatformCutoff = -globalGame.config.width;
        this.nextLevelHeightIncrement = 200;


        this.playerAndPlatformCollider = this.physics.add.collider(this.playerChar, this.activePlatformGroup);
        // create group thata handles collectibles
        this.collectibleGroup = this.physics.add.group({
            runChildUpdate: true    // run update method of all members in the group
        });
        this.playerAndCollectibleCollider = this.physics.add.collider(this.playerChar, this.collectibleGroup, (object1, object2) => {
            object2.handleCollisionWithPlayer();
            this.scorekeeper.addScoreForCollectible(this.currLevel);
        });
        this.playerAndCollectibleCollider.overlapOnly = true;
        // Jumping mechanics
        upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        upKey.on("down", () => {
            console.log("Jumping");
            if ((this.playerChar.body.y + this.playerChar.body.halfHeight) == this.playerStartPosY
            && !this.obstacleInRange) {
                this.playerChar.body.setVelocityY(-400);
            }
        }
        );
        
        this.collectiblesTextures = ["crystal_red", "crystal_green", "crystal_blue", "crystal_purple"];

        // Variables to handle the lava
        this.baseTimeForLevel = 10000;
        this.currTimeForLevel = this.baseTimeForLevel;
        this.lavaRisingTweenConfig = {
            from: globalGame.config.height*1.25,
            to: this.playerStartPosY + this.playerChar.body.height/4,
            duration: this.currTimeForLevel,
            ease: Phaser.Math.Easing.Quadratic.Out,
            onUpdate: () => {this.lavaTop.y = this.lavaRisingTween.getValue()},
            onComplete: () => {
                console.log("Lava reached player");
                this.endGameplay();
            },
            paused: true
        }
        this.lavaRisingTween = this.tweens.addCounter(this.lavaRisingTweenConfig);

        this.currLevel = 1;
        this.minTimeForLevel = 4000;
        this.levelDifficultyScale = 1.25;

        this.obstacleTimerConfig = {
            delay: (2 + Math.random() * 0) * 1000,
            callback: () => {this.startEncounter();

            }
        }
        this.obstacleTimer;

        this.obstacleInRange = false;

        // Layering
        this.lavaTop.setDepth(3);
        this.playerChar.setDepth(2);
        this.activePlatformGroup.setDepth(1);

        // Add a scorekeeper (currently doesn't work)
        this.scorekeeper = new Scorekeeper({
            scene: this,
            x: 24,
            y: 24
        });
        this.scorekeeper.setDepth(20);

        // TEMPORARY STUFF
        console.log("playScene started");
        this.input.setGlobalTopOnly(true);
        
        this.input.keyboard.on("keydown-D", () => {console.log("D"); this.currEnvScrollXVel -= 10});
        this.input.keyboard.on("keydown-A", () => {console.log("A"); this.currEnvScrollXVel += 10});
        //this.input.keyboard.on("keydown-UP", () => {
        //    console.log("UP");})
        this.input.keyboard.on("keydown-DOWN", () => {
            console.log("DOWN");
        });
        
        // commented code below was replaced by startGamplay function that is called in menu scene
        /*this.input.on("pointerdown", pointer => {
            console.log("Clicked in play");
            this.currEnvScrollXVel = -200;
            this.playerChar.setGravity(0, 400);
        });*/

        


    }

    update() {
        
        // Check collisions using Arcade Physics

        // Update current onscreen and offscreen platforms
        //this.currEnvScrollXVel = this.currEnvScrollXVel <= -1000 ? -100 : this.currEnvScrollXVel - 500;
        //console.log(this.platformPool.getLength(), this.activePlatformGroup.getLength());
        //this.currEnvScrollXVel = this.currEnvScrollXVel == -1000 ? -1000 : -1000; // breaks spawning; might need to add upcoming platforms to group that gets updated after spawning
                
        for (let platform of this.activePlatformGroup.getChildren()) {
            if ((platform.x + platform.displayWidth) < this.leftBoundPlatformCutoff) {
                this.activePlatformGroup.killAndHide(platform);
                this.activePlatformGroup.remove(platform);
                continue;
            }
            
            platform.body.setVelocityX(this.currEnvScrollXVel);
            platform.body.setVelocityY(this.currEnvScrollYVel);
        }

        while (
        (this.rightmostPlatform.x + this.rightmostPlatform.width) < this.platformSpawnRightThreshold
        && !this.encounterActive) {
            console.assert(this.rightmostPlatform.body.x + this.rightmostPlatform.body.width === this.getPhysBounds(this.rightmostPlatform).right, "Platform check failed: " + (this.rightmostPlatform.body.x + this.rightmostPlatform.body.width) + " != " + this.getPhysBounds(this.rightmostPlatform).right);

            this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord);
            // spawn collectible relative to the platform being spawned and with randomized y coordinate above the platform
            if (this.input.keyboard.enabled == true) {
                this.spawnCollectible(this.getPhysBounds(this.rightmostPlatform).right, this.randomCollectibleY());
            }

        }
        
        // Move lava up
        
        // Update camera (currently just changes the positions on things onscreen)
        // If there's currently an encounter, do the following
        if (this.encounterActive) {

            if (this.getPhysBounds(this.enemyTriggerPlatform).right <= globalGame.config.width*(3/4)
            && !this.obstacleInRange) {
                //this.currEnvScrollXVel = 0;
                this.obstacleInRange = true;

                this.placeKeyCombo(this.playerChar.x - 96, globalGame.config.height * 0.75);

                /*
                // TRY TO SLOW DOWN PLATFORMS AS PLAYER APPOACHES ENEMY
                this.tweens.addCounter({
                    target: this.enemyTriggerPlatform.body.x,
                    start: this.enemyTriggerPlatform.body.x,
                    end: 0,
                    duration: 1000,
                    onStart: () => {console.log("AAA");}
                });
                */
                console.log(typeof(this.tempthing))
                this.why = this.tweens.addCounter({
                    from: this.currEnvScrollXVel,
                    to: 0,
                    //key: {from: tempthing, to: 0},
                    duration: 250,
                    callbackScope: this,
                    onStart: () => {console.log("AAA");console.log(typeof(this.currEnvScrollXVel))},
                    onUpdate: () => {this.currEnvScrollXVel = this.why.getValue()}
                });
                
            }
            
            else if (this.enemyTriggerPlatform.x + this.enemyTriggerPlatform.width <= this.platformSpawnRightThreshold) {
                
                while ((this.rightmostPlatform.x + this.rightmostPlatform.width) < this.platformSpawnRightThreshold) {
                        this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord);

                }
            }
        }
        //this.currEnvScrollXVel = this.currEnvScrollXVel == -1000 ? -1000 : -1000; // breaks spawning; might need to add upcoming platforms to group that gets updated after spawning


        // Update background
        this.myBackground.tilePositionX -= this.currEnvScrollXVel/60;
        this.lavaTop.tilePositionX -= this.currEnvScrollXVel/60;

        //console.log("this.currEnvScrollXVel: " + this.currEnvScrollXVel);
        //console.log("this.currEnvScrollYVel: " + this.currEnvScrollYVel);
        //console.log(this.playerChar.x)
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
            //platformToSpawn = new Platform(this, x, y, "platform1");
            platformToSpawn.setDisplaySize(this.platform1BaseWidth, this.defaultPlatformBodyHeight);
            platformToSpawn.setPushable(false);

            platformToSpawn.body.checkCollision.left = false;
            platformToSpawn.body.checkCollision.down = false;
            platformToSpawn.body.checkCollision.right = false;

            this.activePlatformGroup.add(platformToSpawn);
        }
        platformToSpawn.setOrigin(0);
        
        // IMPORTANT SECTION
        platformToSpawn.body.reset(x,y);
        // Not sure if these two are necessary, but I'll keep them here anyway
        platformToSpawn.body.x = x;
        platformToSpawn.body.y = y;
        //
        
        platformToSpawn.body.setVelocityX(this.currEnvScrollXVel);
        this.rightmostPlatform = platformToSpawn;
        if (platformToSpawn.x > this.rightmostPlatform.x) {this.rightmostPlatform = platformToSpawn;}
        //console.log("New platform x: " + platformToSpawn.x);
        return platformToSpawn;
    }

    // Choose an enemy at random and return a reference to it
    chooseEnemy() {

    }

    // Spawn a collectible offscreen (Maybe with height from ground as parameter?)
    spawnCollectible(X,Y) {

        console.log('spawining collectibles')
        let collectibleConfig = {
            scene: this,
            x: X,
            y: Y,
            texture: Phaser.Math.RND.pick(this.collectiblesTextures), 
            frame: 0
        }
        // create new collectible
        let spawnedCollectible = new Collectibles(collectibleConfig);
        // add collectible to group
        this.collectibleGroup.add(spawnedCollectible);
    }
 
    // Start encounter with obstacle
    startEncounter() {
        console.warn("Enemy encounter would start here");
        this.encounterActive = true;
        this.spawnEmptyStretchOfPlatforms();
        this.platformSpawnYCoord -= this.nextLevelHeightIncrement;
    }

    // Place key combo
    placeKeyCombo(x, y) { // x,y coordinates of where the arrows apear horizontally
        let CorrectInputNum = 0;
        //add sprites to the scene 
        this.Arrow1 = new KeyComboArrow(this, x, y, 'promtedArrow', 0); // dont set origin to (0,0) or rotation wont work properly
        this.Arrow1.rotateArrow();
        this.Arrow2 = new KeyComboArrow(this, x + this.Arrow1.width + this.Arrow1.width/15, y, 'promtedArrow', 0);
        this.Arrow2.rotateArrow();
        this.Arrow3 = new KeyComboArrow(this, x + (this.Arrow1.width*2) + (this.Arrow1.width/15)*2, y, 'promtedArrow', 0);
        this.Arrow3.rotateArrow();
        this.Arrow4 = new KeyComboArrow(this, x + (this.Arrow1.width*3) + (this.Arrow1.width/15)*3, y, 'promtedArrow', 0);
        this.Arrow4.rotateArrow();
        // Bring arrows to foreground
        this.Arrow1.setDepth(10);
        this.Arrow2.setDepth(10);
        this.Arrow3.setDepth(10);
        this.Arrow4.setDepth(10);
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

                this.scorekeeper.addScoreForLevelIncrease(this.currLevel);
                this.playJumpingToNextLevelAnim();
            }
        });
    }

    // Spawn empty stretch of platforms before obstacle encounter. Returns a reference to the last spawned platform.
    spawnEmptyStretchOfPlatforms(length = globalGame.config.width/2) {
        let numPlatformsToSpawn = Math.ceil(length / this.platform1BaseWidth);
        for (let i = 0; i < numPlatformsToSpawn - 1; i++) {
            this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord);
        }
        
        this.enemyTriggerPlatform = this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord);
        // REMOVE THIS LATER
        this.enemyTriggerPlatform.setTint(0xFF0000);
    }

    // Create the platforms at the start of the game
    createStartingPlatforms() {
        let currX = globalGame.config.width/4;
        while (true) {
            let newPlatform = this.spawnPlatform(currX, this.platformSpawnYCoord);
            currX = this.getPhysBounds(newPlatform).right;
            if (currX >= this.platformSpawnRightThreshold) {
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
        // Don't let lava rise anymore
        this.lavaRisingTween.pause();
        // Play animation and wait for it to finish
        if (this.obstacleInRange) {
            this.obstacleInRange = false;
            // Encounter no longer active
            this.encounterActive = false;
            this.currEnvScrollXVel = -200;
            this.playerChar.setVelocityY(-600);

            // Add a collider to the player and remove it after the player lands
            this.playerAndPlatformCollider.collideCallback = () => {
                console.log("Landed Jump");
                
                this.time.delayedCall(1000/60, () => {
                // Change y positions of sprites, NOT their physics bodies

                let heightDiff = this.playerStartPosY + this.playerChar.body.height/2 - this.getPhysBounds(this.playerChar).bottom;
                this.activePlatformGroup.incY(heightDiff);
                this.platformSpawnYCoord = this.playerStartPosY + this.playerChar.body.height/2;
                
                this.playerChar.body.setVelocityY(0);
                this.playerChar.setY(this.playerStartPosY);

                this.collectibleGroup.incY(heightDiff);
        
                this.myBackground.tilePositionY -= heightDiff;
                this.resetLavaForNextLevel();

                this.obstacleTimer = this.time.addEvent(this.obstacleTimerConfig);
                });
                this.playerAndPlatformCollider.collideCallback = undefined;
            };  
        }
    }

    // After every level, reset lava to bottom of screen and adjust the amount of time the player has to complete the new level
    resetLavaForNextLevel() {
        this.lavaTop.y = globalGame.config.height;
        this.lavaRisingTween.remove();

        // Sigmoid curve is used to get the next time for level
        this.currLevel += 1;
        let numerator = (this.baseTimeForLevel - this.minTimeForLevel) * 2;
        let denominator = 1 + Math.pow(this.levelDifficultyScale, this.currLevel - 1);
        this.currTimeForLevel = (numerator / denominator) + this.minTimeForLevel;
        this.lavaRisingTweenConfig.duration = this.currTimeForLevel;

        this.lavaRisingTween = this.tweens.addCounter(this.lavaRisingTweenConfig);
        this.lavaRisingTween.play();
    }
    
    // Returns true if the lava has reached the player
    lavaHasReachedPlayer() {
        return this.lavaTop.y + this.lavaTop.height * 0.125 < this.playerStartPosY;
    }
    
    // Helper function to get the bounds of an Arcade Physics object's body
    getPhysBounds(obj) {
        let dummy_obj = {};
        obj.body.getBounds(dummy_obj);
        return dummy_obj;
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

    startGameplay() {
        console.log("start the gameplay");
        this.currEnvScrollXVel = -200;
        this.playerChar.setGravity(0, 800);

        this.playerChar.playRunningAnim();
        this.obstacleTimer = this.time.addEvent(this.obstacleTimerConfig);
        this.lavaRisingTween.play();
    }

    endGameplay() {
        
    }

    // helper function to return random Y coordinate above the current platform height for collectibles
    randomCollectibleY() {
        return this.platformSpawnYCoord - this.textures.get("crystal_red").getSourceImage().height/3 - (Math.random() * (this.playerChar.height * 2));
    }
}
