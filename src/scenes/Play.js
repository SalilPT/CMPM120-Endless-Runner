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

        //////////
        // Variables for game balancing
        this.currLevel = 1;
        this.baseTimeForLevel = 10000;
        this.minTimeForLevel = 4000;
        this.levelDifficultyScale = 1.25;
        this.fractionOfLevelTimeForCombo = (3/8);

        this.baseEnvScrollXVel = -192;
        this.maxEnvScrollXVel = -1600;
        this.envScrollXVelIncrement = -32;
        //////////
        this.gameplayRunning = false;
        this.platformSpawnRightThreshold = globalGame.config.width + this.textures.get("platform1").getSourceImage().width;
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

        // Place tile sprites
        this.myBackground = this.add.tileSprite(0, -globalGame.config.height, globalGame.config.width, globalGame.config.height*2, "volcanicBackground").setOrigin(0);
        this.myBackgroundTimer = this.createTileSpriteAnimTimer(this.myBackground, 3, 4);
        this.lavaTop = this.add.tileSprite(0, globalGame.config.height, globalGame.config.width, 50, "lavaTop", 0).setOrigin(0);
        this.lavaTopAnimTimer = this.createTileSpriteAnimTimer(this.lavaTop, 4, 4);
        this.lavaBottom = this.add.tileSprite(0, globalGame.config.height, globalGame.config.width, globalGame.config.height * 2, "lavaBottom", 0).setOrigin(0);
        this.lavaBottomAnimTimer = this.createTileSpriteAnimTimer(this.lavaBottom, 4, 4);
        // Use a render texture game object to prevent gaps between the top and bottom portions of the lava
        this.lavaRenderTexture = this.add.renderTexture(0, globalGame.config.height, globalGame.config.width, globalGame.config.height * 2).setOrigin(0);
        this.lavaRenderTexture.draw(this.lavaTop, 0, 0);
        this.lavaRenderTexture.draw(this.lavaBottom, 0, this.lavaTop.height);

        // Variables for player character
        this.playerStartPosX = globalGame.config.width / 2 ;
        this.playerStartPosY = globalGame.config.height / 2 ;
        let playerCharArgs = {
            scene: this,
            x: this.playerStartPosX,
            y: this.playerStartPosY,
            texture: "jebRunningSpritesheet",
            frame: 0
        }
        this.playerChar = new Scientist(playerCharArgs).setOrigin(0.5);
        this.playerChar.playIdleAnim();
        //this.playerChar.playMenuBackgroundAnim();
        
        // Have the camera follow the player character
        this.cameras.main.startFollow(this.playerChar);

        // Variables for platform management
        this.platformSpawnYCoord = this.playerChar.y + this.playerChar.height/2;
        this.platform1BaseWidth = this.textures.get("platform1").getSourceImage().width;
        this.defaultPlatformBodyHeight = this.textures.get("platform1").getSourceImage().height;
        this.rightmostPlatform;
        
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
            
            // Normally, checking whether or not a character is on ground like this would be bad.
            // But here, it works.
            if ((this.playerChar.body.y + this.playerChar.body.halfHeight) == this.playerStartPosY
            && !this.obstacleInRange) {
                console.log("Jumping");
                this.playerChar.playJumpingAnim()
                this.playerChar.body.setVelocityY(-400);
            }
        }
        );

        // Variables to handle the lava
        this.currTimeForLevel = this.baseTimeForLevel;
        this.lavaRisingTweenConfig = {
            from: globalGame.config.height * 1.25,
            to: this.playerStartPosY + this.playerChar.body.height/2,
            duration: this.currTimeForLevel,
            ease: Phaser.Math.Easing.Quadratic.Out,
            onUpdate: () => {
                this.lavaRenderTexture.y = this.lavaRisingTween.getValue();
            },
            onComplete: () => {
                console.log("Lava reached player");
                this.endGameplay();
            },
            paused: true
        }
        this.lavaRisingTween = this.tweens.addCounter(this.lavaRisingTweenConfig);

        // The platforms left to spawn on the current level before the platforms near an enemy are spawned
        this.platformsLeftToSpawnOnCurrLevel = this.calculatePlatformsNeededBeforeCombo(this.platform1BaseWidth, this.baseEnvScrollXVel, this.baseTimeForLevel * (1-this.fractionOfLevelTimeForCombo));
        this.platformsSpawnedOnNextLevel = 0;
        this.numPlatformsInEmptyStretch = 2;

        this.obstacleInRange = false;

        // Create first starting platform 1 platform widths behind right side of player character
        this.createStartingPlatforms(this.getPhysBounds(this.playerChar).right - (1 * this.platform1BaseWidth));
        // Account for platforms spawned behind player character
        this.platformsLeftToSpawnOnCurrLevel += 1;
        // create the globlin sprite
        this.globlinSprite = new Obstacle(this, globalGame.config.width * 2, this.playerStartPosY, 'globlinAtlas', 0, {active:true}).setOrigin(.5);
        this.globlinGroup = this.physics.add.group({
            runChildUpdate: true    // run update method of all members in the group
        });
        this.globlinGroup.add(this.globlinSprite);
        this.globlinSprite.playIdleAnim();

        // Layering
        this.lavaRenderTexture.setDepth(3);
        this.globlinSprite.setDepth(2);
        this.playerChar.setDepth(2);
        this.activePlatformGroup.setDepth(1);

        // Add a scorekeeper
        this.scorekeeper = new Scorekeeper({
            scene: this,
            x: 24,
            y: 24
        });
        this.scorekeeper.setVisible(false);
        this.scorekeeper.setDepth(20);

        // Cosmetic things
        this.collectiblesTextures = ["crystal_red", "crystal_green", "crystal_blue", "crystal_purple"];
        this.defaultPlayerPlatColliderCallback = (object1, object2) => {
            object2.setData("steppedOn", true);
        };
        this.playerAndPlatformCollider.collideCallback = this.defaultPlayerPlatColliderCallback;






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
        
    }

    update() {
        // keeps track of when to play running animation
        if ((this.playerChar.body.y + this.playerChar.body.halfHeight) == this.playerStartPosY
        && this.currEnvScrollXVel < 0){
            this.playerChar.playRunningAnim();
        }
            // Check collisions using Arcade Physics

        
        //this.currEnvScrollXVel = this.currEnvScrollXVel == -1000 ? -1000 : -1000; // breaks spawning; might need to add upcoming platforms to group that gets updated after spawning
                


        this.spawnPlatformsToRightThreshold();

        //console.log("Okay" + this.platformsLeftToSpawnOnCurrLevel);
        if (this.platformsLeftToSpawnOnCurrLevel <= this.numPlatformsInEmptyStretch
            && !this.encounterActive) {
            this.startEncounter();
        }

        // Slow down player for the encounter and generate platforms on the next level
        if (this.encounterActive) {
            if (this.getPhysBounds(this.enemyTriggerPlatform).x - this.getPhysBounds(this.playerChar).right <= this.platform1BaseWidth/2
            && !this.obstacleInRange) {
                //this.currEnvScrollXVel = 0;
                this.obstacleInRange = true;
                this.playerChar.playIdleAnim();                

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
                // Slow down the player character over time
                // Use a kinematics equation (with no acceleration) to determine the duration value needed to have the player character stop at platform before enemy trigger platform
                // This technically isn't perfect because the deceleration happens in steps, but the small differences between actual and intended positions won't be that important.
                let deltaX = Math.abs(this.getPhysBounds(this.enemyTriggerPlatform).x - 0.25 * this.platform1BaseWidth - this.getPhysBounds(this.playerChar).right);
                let velInitial = -this.currEnvScrollXVel;
                let timeToSlowDown = (2 * deltaX) / velInitial;
                timeToSlowDown *= 1000;
                // If the time to slow down is less than 1/60 of a second, stop the player character immediately
                if (timeToSlowDown < 1000/60) {this.currEnvScrollXVel = 0;}
                console.log("Slowdown time: ", timeToSlowDown);
                this.encounterSlowdownTween = this.tweens.addCounter({
                    from: this.currEnvScrollXVel,
                    to: 0,
                    duration: timeToSlowDown,
                    onUpdate: () => {this.currEnvScrollXVel = this.encounterSlowdownTween.getValue()}
                });
            }
            // Spawn the platforms of the next level
            while ((this.getPhysBounds(this.rightmostPlatform).right) < this.platformSpawnRightThreshold) {
                this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord, false);
            }
        }

        //this.currEnvScrollXVel = this.currEnvScrollXVel == -1000 ? -1000 : -1000; // breaks spawning; might need to add upcoming platforms to group that gets updated after spawning


        // Update background and lava
        this.myBackground.tilePositionX -= this.currEnvScrollXVel/60;
        this.lavaTop.tilePositionX -= this.currEnvScrollXVel/60;
        this.lavaBottom.tilePositionX -= this.currEnvScrollXVel/60;

        this.lavaRenderTexture.clear();
        this.lavaRenderTexture.draw(this.lavaTop, 0, 0);
        this.lavaRenderTexture.draw(this.lavaBottom, 0, this.lavaTop.height);

        //console.log("this.currEnvScrollXVel: " + this.currEnvScrollXVel);
        //console.log(this.playerChar.x)

        // Update current onscreen and offscreen platforms
        for (let platform of this.activePlatformGroup.getChildren()) {
            if ((platform.x + platform.displayWidth) < this.leftBoundPlatformCutoff
            || platform.y > globalGame.config.height) {
                this.activePlatformGroup.killAndHide(platform);
                this.activePlatformGroup.remove(platform);
                continue;
            }
            
            // Platform falling effect
            if ((platform.x + platform.displayWidth) < this.playerChar.x) {
                this.platformFallEffect(platform);
            }
            platform.body.setVelocityX(this.currEnvScrollXVel);
        }
    }
    
    // Spawn platform at provided position
    spawnPlatform(x, y, spawnOnCurrLevel = true) {
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

            platformToSpawn.body.checkCollision.up = true;
            platformToSpawn.body.checkCollision.right = false;
            platformToSpawn.body.checkCollision.down = false;
            platformToSpawn.body.checkCollision.left = false;

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
        
        // Prepare platform for falling after going past Jeb
        platformToSpawn.setDisplayOrigin(0);
        platformToSpawn.setGravity(0,0);
        platformToSpawn.setAngle(0);
        platformToSpawn.setData("falling", false);
        platformToSpawn.setData("steppedOn", false);

        this.rightmostPlatform = platformToSpawn;
        if (platformToSpawn.x > this.rightmostPlatform.x) {this.rightmostPlatform = platformToSpawn;}
        if (spawnOnCurrLevel) {
            this.platformsLeftToSpawnOnCurrLevel -= 1;
        }
        else {
            this.platformsSpawnedOnNextLevel += 1;
        }
        return platformToSpawn;
    }

    spawnPlatformsToRightThreshold() {
        while (
            (this.rightmostPlatform.x + this.rightmostPlatform.width) < this.platformSpawnRightThreshold
            && !this.encounterActive) {
                console.assert(this.rightmostPlatform.body.x + this.rightmostPlatform.body.width === this.getPhysBounds(this.rightmostPlatform).right, "Platform check failed: " + (this.rightmostPlatform.body.x + this.rightmostPlatform.body.width) + " != " + this.getPhysBounds(this.rightmostPlatform).right);
    
                this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord, !this.encounterActive);
                // spawn collectible relative to the platform being spawned and with randomized y coordinate above the platform
                if (this.input.keyboard.enabled == true) {
                    this.spawnCollectible(this.getPhysBounds(this.rightmostPlatform).right, this.randomCollectibleY());
                }

                if (this.platformsLeftToSpawnOnCurrLevel == 0) {
                    
                    return;
                }
    
            }
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
        this.spawnEmptyStretchOfPlatforms(this.numPlatformsInEmptyStretch * this.platform1BaseWidth + 1);
        this.platformSpawnYCoord -= this.nextLevelHeightIncrement;
    }

    // Place key combo
    placeKeyCombo(x, y, comboLength = 4) { // x,y coordinates of where the arrows apear horizontally
        //add sprites to the scene
        this.keyComboArrows = [];
        let arrowWidth = this.textures.get("promtedArrow").getSourceImage().width;
        for (let i = 0; i < comboLength; i++) {
            let newArrow = new KeyComboArrow(this, x + (arrowWidth + arrowWidth/15) * i, y, 'promtedArrow', 0);
            newArrow.rotateArrow();
            // Bring new arrow to foreground
            newArrow.setDepth(10);
            this.keyComboArrows.push(newArrow);
        }
        // Center the arrows around the provided x parameter
        let xOffset = x - Phaser.Math.Average([this.keyComboArrows.at(0).x, this.keyComboArrows.at(-1).x]);
        this.keyComboArrows.forEach((arrow) => {arrow.x += xOffset;});

        // create a keycombo based on the current orientation of the randomly rotated keys
        this.keyComboNeeded = this.input.keyboard.createCombo(Array.from(this.keyComboArrows, a => a.getDirection()), {
            resetOnWrongKey: true,  // if they press the wrong key is the combo reset?
            maxKeyDelay: 0,         // max delay (ms) between each key press (0 = disabled)
            deleteOnMatch: true    // if combo matches, will it delete itself?
        });

        // Update textures of the arrows every 1/60th of a second
        let keyComboUpdateTimer = this.time.addEvent({
            delay: 1000/60,
            callback: () => {
                if (this.gameplayRunning ==true){
                    for (let i = 0; i < this.keyComboArrows.length; i++) {
                        if (i < this.keyComboNeeded.index) {
                            this.keyComboArrows[i].changeToPassingSprite();
                        }
                        else {
                            this.keyComboArrows[i].changeToUnpassedSprite();
                        }
                    }
                }
            },
            loop: true
        });

        // watch for keycombomatches
        this.input.keyboard.on('keycombomatch', (combo, event) => {
            if (combo === this.keyComboNeeded && this.gameplayRunning == true) { 
                console.log('change arrow sprites to their passed sprite')
                this.keyComboArrows.forEach((arrow) => arrow.changeToPassingSprite());

                this.scorekeeper.addScoreForLevelIncrease(this.currLevel);
                this.playJumpingToNextLevelAnim();

                keyComboUpdateTimer.destroy();
                // When matched, delete the arrows after one second
                this.time.delayedCall(1000, () => {
                    this.keyComboArrows.forEach((arrow) => {arrow.destroy();});
                });
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
        this.globlinSprite.x = this.getPhysBounds(this.rightmostPlatform).right - this.platform1BaseWidth/1.7;
        this.globlinSprite.playIdleAnim();
        // REMOVE THIS LATER
        //this.enemyTriggerPlatform.setTint(0xFF0000);
    }

    // Create the platforms at the start of the game
    createStartingPlatforms(startingXCoord) {
        let currX = startingXCoord;
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
        
        //this.platformsLeftToSpawnOnCurrLevel = Infinity;

        // Don't let lava rise anymore
        this.lavaRisingTween.pause();
        // Define a collider callback function for once the player lands on the next level and remove it after the player lands
        let landedJumpCallbackFunction = () => {
            console.log("Landed Jump");

            // Get the closest platform in front of Jeb after landing on next level
            let platformList = this.activePlatformGroup.getChildren();
            let closestPlatformInFront = this.physics.closest(
                this.getPhysBounds(this.playerChar),
                // Targets will only be platforms to right of Jeb
                platformList.filter(
                    (platform) => {
                        return this.getPhysBounds(platform).x > this.getPhysBounds(this.playerChar).right
                    }
                )
            );
            //console.log(closestPlatformInFront)
            //closestPlatformInFront.setTint(0x00FF00);
            let numPlatformsToIgnore = platformList.filter(
                (platform) => {
                    return platform.y == closestPlatformInFront.y && platform.x < closestPlatformInFront.x
                }
            ).length;
            //console.log("P" + numPlatformsToIgnore);
            // The time in ms until the player char reaches the closes platform in front
            let timeUntilReachingNextPlatform = (this.getPhysBounds(closestPlatformInFront).x - this.getPhysBounds(this.playerChar).right) / Math.abs(this.currEnvScrollXVel) * 1000;
            //console.log(timeUntilReachingNextPlatform);

            this.time.delayedCall(timeUntilReachingNextPlatform, () => {
                // Change y positions of sprites, NOT their physics bodies

                let heightDiff = this.playerStartPosY + this.playerChar.body.height/2 - this.getPhysBounds(this.playerChar).bottom;
                this.activePlatformGroup.incY(heightDiff);
                this.platformSpawnYCoord = this.playerStartPosY + this.playerChar.body.height/2;
                
                this.playerChar.body.setVelocityY(0);
                this.playerChar.setY(this.playerStartPosY);

                this.collectibleGroup.incY(heightDiff);
        
                this.myBackground.tilePositionY -= heightDiff;
                this.currLevel += 1;
                this.resetLavaForNextLevel();

                let platformsNeeded = this.calculatePlatformsNeededBeforeCombo(this.platform1BaseWidth, this.currEnvScrollXVel, this.currTimeForLevel * (1-this.fractionOfLevelTimeForCombo));
                this.platformsLeftToSpawnOnCurrLevel = platformsNeeded - (this.platformsSpawnedOnNextLevel - numPlatformsToIgnore);
                this.platformsSpawnedOnNextLevel = 0;
                this.setKeyComboPlacementTimer(this.currTimeForLevel * (1-this.fractionOfLevelTimeForCombo));

                // TODO: Increase number of platforms in empty stretch

                // Encounter no longer active
                this.encounterActive = false;
                this.obstacleInRange = false;

            });
            this.playerAndPlatformCollider.collideCallback = this.defaultPlayerPlatColliderCallback;
            
        };

        // Play an animation of defeating enemy and then make player character jump
        console.log('jeb fires laser')
        this.playerChar.playAttackObstacleAnim();
        this.time.delayedCall(900, ()=> {
            this.globlinSprite.playDeathAnim();
        });
        this.time.delayedCall(
            2000,
            () => {
                this.currEnvScrollXVel = Math.max(this.baseEnvScrollXVel + this.envScrollXVelIncrement * this.currLevel, this.maxEnvScrollXVel);
                this.playerChar.playJumpingAnim();
                this.playerChar.setVelocityY(-600);

                // Set callback for landing jump
                this.playerAndPlatformCollider.collideCallback = landedJumpCallbackFunction;
            }
        );
    }

    // After every level, reset lava to bottom of screen and adjust the amount of time the player has to complete the new level
    resetLavaForNextLevel() {
        this.lavaRenderTexture.y = globalGame.config.height;
        this.lavaRisingTween.remove();

        // Sigmoid curve is used to get the next time for level
        let numerator = (this.baseTimeForLevel - this.minTimeForLevel) * 2;
        let denominator = 1 + Math.pow(this.levelDifficultyScale, this.currLevel - 1);
        this.currTimeForLevel = (numerator / denominator) + this.minTimeForLevel;
        this.lavaRisingTweenConfig.duration = this.currTimeForLevel;

        this.lavaRisingTween = this.tweens.addCounter(this.lavaRisingTweenConfig);
        this.lavaRisingTween.play();
    }

    // Sets the timer that determines when a key combo will be placed and activated
    setKeyComboPlacementTimer(timeUntilPlacement) {
        this.keyComboPlacementTimer = this.time.delayedCall(
            timeUntilPlacement,
            () => {
                this.placeKeyCombo(this.playerStartPosX, globalGame.config.height * 0.75, Math.min(1 + Math.ceil(this.currLevel/2), 4));
            }
        )
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
        this.currEnvScrollXVel = this.baseEnvScrollXVel;
        this.playerChar.setGravity(0, 800);

        this.playerChar.playRunningAnim();
        this.lavaRisingTween.play();
        
        this.setKeyComboPlacementTimer(this.currTimeForLevel * (1-this.fractionOfLevelTimeForCombo));

        this.scorekeeper.setVisible(true);
        this.gameplayRunning = true;
    }

    endGameplay() {
        let losingAnimTime = this.playerChar.playLossAnim();
        this.scene.launch("gameOverScene");
        this.gameplayRunning = false;
        
        this.keyComboArrows.forEach((arrow) => {arrow.destroy();});
        this.keyComboNeeded.destroy();
        // Make the lava rise at the end of the game
        let lavaEndGameTween = this.tweens.addCounter(
            {
            from: this.lavaRenderTexture.y,
            to: -globalGame.config.height/2,
            duration: 10 * 1000,
            ease: Phaser.Math.Easing.Quadratic.InOut,
            
            onUpdate: () => {
                this.lavaRenderTexture.y = lavaEndGameTween.getValue();
            },
            }
        );
        this.time.delayedCall(losingAnimTime,
            () => {
                // COMPLETE THIS
            }
        );
    }

    // helper function to return random Y coordinate above the current platform height for collectibles
    randomCollectibleY() {
        return this.platformSpawnYCoord - this.textures.get("crystal_red").getSourceImage().height/3 - (Math.random() * (this.playerChar.height * 2));
    }

    // Calculate how many platforms would be needed before enemy platform, 
    // given the platform length, x scroll speed of the level and the time allowed for the level before key combo.
    // The timeBeforeCombo parameter is in ms.
    calculatePlatformsNeededBeforeCombo(platLength, xScrollSpd, timeBeforeCombo) {
        // Speed is in pixels per second
        let timePerPlatform = platLength / Math.abs(xScrollSpd);
        // Convert time per platform to ms
        timePerPlatform *= 1000;
        
        console.log("Platforms needed: " + Math.ceil(timeBeforeCombo / timePerPlatform));
        return Math.ceil(timeBeforeCombo / timePerPlatform);
    }

    // Makes a platform do a falling animation
    platformFallEffect(platform) {
        // If this platform is already falling or wasn't stepped on, return
        if (platform.getData("falling") == true || platform.getData("steppedOn") == false) {
            return;
        }

        platform.setData("falling", true);

        // Set origin and account for offset
        platform.setDisplayOrigin(platform.width, 0);
        platform.setX(platform.x + platform.width);

        platform.setGravity(0, 800);
        platform.setAngularVelocity(Phaser.Math.Between(-16, -64));
    }
}
