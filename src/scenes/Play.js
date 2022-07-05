class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // Load sprites for key combo arrows
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
        this.minTimeForLevel = 3600;
        this.levelDifficultyScale = 1.15; // Value greater than 1
        this.fractionOfLevelTimeForCombo = (3/8);

        this.baseEnvScrollXVel = -192;
        this.maxEnvScrollXVel = -1600;
        this.envScrollXVelIncrement = -16;
        //////////
        this.gameplayRunning = false;
        this.platformSpawnRightThreshold = globalGame.config.width + this.textures.get("platform1").getSourceImage().width;
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

        // Place TileSprites
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

        // Check collisions using Arcade Physics
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
            && !this.obstacleInRange && this.gameplayRunning) {
                this.playerChar.playJumpingAnim();
                this.playerChar.body.setVelocityY(-400);
            }
        });

        // Variables to handle the lava
        this.currTimeForLevel = this.baseTimeForLevel;
        this.lavaRisingTweenConfig = {
            from: globalGame.config.height * 1.15,
            to: this.playerStartPosY + this.playerChar.body.height/2,
            duration: this.currTimeForLevel,
            ease: Phaser.Math.Easing.Quadratic.Out,
            onUpdate: () => {
                this.lavaRenderTexture.y = this.lavaRisingTween.getValue();
            },
            onComplete: () => {
                this.endGameplay();
            },
            paused: true
        }
        this.lavaRisingTween = this.tweens.addCounter(this.lavaRisingTweenConfig);

        // The platforms left to spawn on the current level before the platforms near an enemy are spawned
        this.platformsLeftToSpawnOnCurrLevel = this.calculatePlatformsNeededBeforeCombo(this.platform1BaseWidth, this.baseEnvScrollXVel, this.baseTimeForLevel * (1 - this.fractionOfLevelTimeForCombo));
        this.platformsSpawnedOnNextLevel = 0;
        this.baseNumPlatformsInEmptyStretch = 2;
        this.numPlatformsInEmptyStretch = this.baseNumPlatformsInEmptyStretch;

        this.obstacleInRange = false;

        // Create first starting platform 1 platform widths behind right side of player character
        this.createStartingPlatforms(this.getPhysBounds(this.playerChar).right - (1 * this.platform1BaseWidth));
        // Account for platforms spawned behind player character
        this.platformsLeftToSpawnOnCurrLevel += 1;
        // create the globlin sprite
        this.globlinSprite = new Obstacle(this, globalGame.config.width * 2, this.playerStartPosY - this.playerStartPosY/30, 'globlinAtlas', 0, {active:true}).setOrigin(0.5);
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

        // Background Music
        this.backgroundMusic = this.sound.add("backgroundMusic");
        this.backgroundMusic.setVolume(0.275);
    }

    update(updateTime, updateDelta) {
        // keeps track of when to play running animation
        if ((this.playerChar.body.y + this.playerChar.body.halfHeight) == this.playerStartPosY
        && this.currEnvScrollXVel < 0 && !this.obstacleInRange) {
            this.playerChar.playRunningAnim();
        }

        this.spawnPlatformsToRightThreshold();

        if (this.platformsLeftToSpawnOnCurrLevel <= this.numPlatformsInEmptyStretch
            && !this.encounterActive) {
            this.startEncounter();
        }

        // Slow down player for the encounter and generate platforms on the next level
        if (this.encounterActive) {
            // Set the slowdown threshold to half the width of a platform plus the total width of the platforms in the empty stretch, excluding the total width of the base empty stretch platforms
            let slowdownThreshold = this.platform1BaseWidth/2 + this.platform1BaseWidth * (this.numPlatformsInEmptyStretch - this.baseNumPlatformsInEmptyStretch);
            if (this.getPhysBounds(this.enemyTriggerPlatform).x - this.getPhysBounds(this.playerChar).right <= slowdownThreshold
            && !this.obstacleInRange) {
                this.obstacleInRange = true;
                this.playerChar.playIdleAnim();

                // Slow down the player character over time
                // Use a kinematics equation (with no acceleration) to determine the duration value needed to have the player character stop at platform before enemy trigger platform
                // This technically isn't perfect because the deceleration happens in steps, but the small differences between actual and intended positions won't be that important.
                let deltaX = Math.abs(this.getPhysBounds(this.enemyTriggerPlatform).x - 0.25 * this.platform1BaseWidth - this.getPhysBounds(this.playerChar).right);
                let velInitial = -this.currEnvScrollXVel;
                let timeToSlowDown = (2 * deltaX) / velInitial;
                timeToSlowDown *= 1000;
                // If the time to slow down is less than 1/60 of a second, stop the player character immediately
                if (timeToSlowDown < 1000/60) {this.currEnvScrollXVel = 0;}

                this.encounterSlowdownTween = this.tweens.addCounter({
                    from: this.currEnvScrollXVel,
                    to: 0,
                    duration: timeToSlowDown,
                    onUpdate: () => {this.currEnvScrollXVel = this.encounterSlowdownTween.getValue();}
                });
            }
            // Spawn the platforms of the next level
            while ((this.getPhysBounds(this.rightmostPlatform).right) < this.platformSpawnRightThreshold) {
                this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord, false);
            }
        }

        // Update background and lava
        this.myBackground.tilePositionX -= this.currEnvScrollXVel * (updateDelta/1000);
        this.lavaTop.tilePositionX -= this.currEnvScrollXVel * (updateDelta/1000);
        this.lavaBottom.tilePositionX -= this.currEnvScrollXVel * (updateDelta/1000);

        this.lavaRenderTexture.clear();
        this.lavaRenderTexture.draw(this.lavaTop, 0, 0);
        this.lavaRenderTexture.draw(this.lavaBottom, 0, this.lavaTop.height);

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
            platformToSpawn.setTexture("platform1");

            this.platformPool.remove(platformToSpawn);
        }

        // If a platform can't be retrieved from the pool, create a new one
        else {
            platformToSpawn = this.physics.add.sprite(x, y, "platform1");
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

    // Spawn a collectible
    spawnCollectible(X,Y) {
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
        this.encounterActive = true;
        this.spawnEmptyStretchOfPlatforms(this.numPlatformsInEmptyStretch * this.platform1BaseWidth + 1);
        this.platformSpawnYCoord -= this.nextLevelHeightIncrement;

        // Spawn the first platform of the next level and specifitcally set its texture
        let firstPlatformOfNextLevel = this.spawnPlatform(this.getPhysBounds(this.rightmostPlatform).right, this.platformSpawnYCoord, false);
        firstPlatformOfNextLevel.setTexture("platformLeft");
    }

    // Place key combo
    placeKeyCombo(x, y, comboLength = 4) { // x,y coordinates of where the arrows apear horizontally
        // add sprites to the scene
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

        // Rapidly update the textures of the arrows
        let keyComboUpdateTimer = this.time.addEvent({
            delay: 1000/globalGame.loop.targetFps,
            callback: () => {
                if (this.gameplayRunning == true){
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
                // Prevent having multiple listeners for key combos
                this.input.keyboard.removeListener("keycombomatch");

                this.keyComboArrows.forEach((arrow) => arrow.changeToPassingSprite());

                this.scorekeeper.addScoreForLevelIncrease(this.currLevel);
                this.playJumpingToNextLevelAnim();

                this.time.removeEvent(keyComboUpdateTimer);
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

        // Set texture on enemy trigger platform
        this.enemyTriggerPlatform.setTexture("platformRight");

        this.globlinSprite.body.reset(this.getPhysBounds(this.enemyTriggerPlatform).x + this.platform1BaseWidth/2, this.globlinSprite.y);
        this.globlinSprite.playIdleAnim();
    }

    // Create the platforms at the start of the game (there should be space for at least 2 starting platforms)
    createStartingPlatforms(startingXCoord) {
        let currX = startingXCoord;
        // Spawn first platform with different texture
        let firstPlatform = this.spawnPlatform(currX, this.platformSpawnYCoord);
        firstPlatform.setTexture("platformLeft");
        currX = this.getPhysBounds(firstPlatform).right;

        while (true) {
            let newPlatform = this.spawnPlatform(currX, this.platformSpawnYCoord);
            currX = this.getPhysBounds(newPlatform).right;
            if (currX >= this.platformSpawnRightThreshold) {
                break;
            }
        }
    }

    // After a successful key combo, play animation to move onto the next level of scaffolding
    playJumpingToNextLevelAnim() {
        // Don't let lava rise anymore
        this.lavaRisingTween.pause();

        // Define a collider callback function for once the player lands on the next level and remove it after the player lands
        let landedJumpCallbackFunction = () => {
            // Get the closest platform in front of Jeb after landing on next level
            let platformList = this.activePlatformGroup.getChildren();
            let closestPlatformInFront = this.physics.closest(
                this.getPhysBounds(this.playerChar),
                // Targets will only be platforms to right of Jeb
                platformList.filter(
                    (platform) => {
                        return this.getPhysBounds(platform).x > this.getPhysBounds(this.playerChar).right;
                    }
                )
            );

            let numPlatformsToIgnore = platformList.filter(
                (platform) => {
                    return platform.y == closestPlatformInFront.y && platform.x < closestPlatformInFront.x;
                }
            ).length;

            // The time in ms until the player char reaches the closes platform in front
            let timeUntilReachingNextPlatform = (this.getPhysBounds(closestPlatformInFront).x - this.getPhysBounds(this.playerChar).right) / Math.abs(this.currEnvScrollXVel) * 1000;

            this.time.delayedCall(timeUntilReachingNextPlatform, () => {
                // Change y positions of sprites, NOT their physics bodies
                let heightDiff = this.playerStartPosY + this.playerChar.body.height/2 - this.getPhysBounds(this.playerChar).bottom;
                this.activePlatformGroup.incY(heightDiff);
                this.platformSpawnYCoord = this.playerStartPosY + this.playerChar.body.height/2;

                this.playerChar.body.setVelocityY(0);
                this.playerChar.setY(this.playerStartPosY);

                this.collectibleGroup.incY(heightDiff);

                this.myBackground.tilePositionY -= heightDiff;

                this.resetLavaForNextLevel();

                let platformsNeeded = this.calculatePlatformsNeededBeforeCombo(this.platform1BaseWidth, this.currEnvScrollXVel, this.currTimeForLevel * (1-this.fractionOfLevelTimeForCombo));
                this.platformsLeftToSpawnOnCurrLevel = platformsNeeded - (this.platformsSpawnedOnNextLevel - numPlatformsToIgnore);
                this.platformsSpawnedOnNextLevel = 0;
                this.setKeyComboPlacementTimer(this.currTimeForLevel * (1-this.fractionOfLevelTimeForCombo));

                // Adjust the number of platforms in empty stretch
                let platformsPerSecond = -this.currEnvScrollXVel / this.platform1BaseWidth;
                this.numPlatformsInEmptyStretch = this.baseNumPlatformsInEmptyStretch + Math.floor(platformsPerSecond/4);

                // Encounter no longer active
                this.encounterActive = false;
                this.obstacleInRange = false;

            });
            this.playerAndPlatformCollider.collideCallback = this.defaultPlayerPlatColliderCallback;
        };

        // Play an animation of defeating enemy and then make player character jump
        this.playerChar.playAttackObstacleAnim();
        this.time.delayedCall(950, () => {
            this.globlinSprite.playDeathAnim();
        });
        this.time.delayedCall(
            2000,
            () => {
                // In case the encounter slowdown tween is somehow still playing, stop it
                this.encounterSlowdownTween.stop();

                // Update current level
                this.currLevel += 1;
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
                let comboLength = Math.min(1 + Math.ceil(this.currLevel/2), 4);
                this.placeKeyCombo(this.playerStartPosX, globalGame.config.height * 0.75, comboLength);
            }
        );
    }

    // Helper function to get the bounds of an Arcade Physics object's body
    getPhysBounds(obj) {
        let dummy_obj = {};
        obj.body.getBounds(dummy_obj);
        return dummy_obj;
    }

    // Function to create timer to animate TileSprite Game Objects
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
        this.currEnvScrollXVel = this.baseEnvScrollXVel;
        this.playerChar.setGravity(0, 800);

        this.playerChar.playRunningAnim();
        this.lavaRisingTween.play();

        this.setKeyComboPlacementTimer(this.currTimeForLevel * (1 - this.fractionOfLevelTimeForCombo));

        this.scorekeeper.setVisible(true);

        this.backgroundMusic.play({loop: true});

        this.gameplayRunning = true;
    }

    endGameplay() {
        this.playerChar.playLossAnim();
        this.scene.launch("gameOverScene");
        this.gameplayRunning = false;

        this.keyComboArrows.forEach((arrow) => {arrow.destroy();});
        this.keyComboNeeded.destroy();

        // Make the lava rise at the end of the game
        let lavaEndGameTween = this.tweens.addCounter({
            from: this.lavaRenderTexture.y,
            to: -globalGame.config.height/2,
            duration: 10 * 1000,
            ease: Phaser.Math.Easing.Quadratic.InOut,

            onUpdate: () => {
                this.lavaRenderTexture.y = lavaEndGameTween.getValue();
            },
        });

        let backgroundMusicFadeOutTween = this.tweens.addCounter({
            from: this.backgroundMusic.volume,
            to: 0,
            duration: 1 * 1000,
            ease: Phaser.Math.Easing.Quadratic.InOut,
            onUpdate: () => {
                this.backgroundMusic.setVolume(backgroundMusicFadeOutTween.getValue());
            },
            onComplete: () => {
                this.backgroundMusic.stop();
            }
        });
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
