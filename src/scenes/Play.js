class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }
    
    init() {

    }

    create() {
        /*
        Initiate variables to use
        */
        this.platformSpawnXCoord = globalGame.config.width * 1.5;
        // Platform pooling code adapted from code by Emanuele Feronato: https://www.emanueleferonato.com/2018/11/13/build-a-html5-endless-runner-with-phaser-in-a-few-lines-of-code-using-arcade-physics-and-featuring-object-pooling/ 
        this.activePlatformGroup = this.add.group(
            {
                removeCallback: function (platform) {
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
        //this.testPhysicsSprite.setSize(64, 8);
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
        this.defaultPlatformBodyHeight = 8;
        this.rightmostPlatform;
        this.createStartingPlatforms();
        this.enemyTriggerPlatform;










        // TEMPORARY STUFF
        console.log("playScene started");
        this.input.setGlobalTopOnly(true);
        
        this.input.keyboard.on("keydown-RIGHT", () => {console.log("RIGHT"); this.currEnvScrollVel -= 1;});
        this.input.keyboard.on("keydown-LEFT", () => {console.log("LEFT"); this.currEnvScrollVel += 1;});
        this.input.keyboard.on("keydown-UP", () => {
            console.log("UP");
            if (this.obstacleInRange) {
                this.encounterActive = false;
                this.obstacleInRange = false;
                this.currEnvScrollVel = -150;
                this.playerChar.setVelocityY(-400);
                this.obstacleTimer = this.time.addEvent(this.obstacleTimerConfig);
            }
            else {
            this.playerChar.setVelocityY(-200);}});
        this.input.keyboard.on("keydown-DOWN", () => {
            console.log("DOWN");
        });
        
        this.input.on("pointerdown", pointer => {
            console.log("Clicked in play");
            this.currEnvScrollVel = -150;
            this.playerChar.setFriction(0);
            this.playerChar.setGravity(0, 400);
        });

        this.physics.add.collider(this.playerChar, this.activePlatformGroup);

        this.obstacleTimerConfig = {
            delay: (5 + Math.random() * 5) * 1000,
            callback: () => {this.startEncounter();}
        }
        this.obstacleTimer = this.time.addEvent(this.obstacleTimerConfig);

        this.obstacleInRange = false;
    }

    update() {
        // Check collisions using Arcade Physics

        // Update current onscreen and offscreen platforms
        for (let platform of this.activePlatformGroup.getChildren()) {
            if ((platform.x + platform.displayWidth) < 0) {
                this.activePlatformGroup.killAndHide(platform);
                this.activePlatformGroup.remove(platform);
                continue;
            }
            platform.setVelocityX(this.currEnvScrollVel);
        }
        while (
            (this.rightmostPlatform.x + this.rightmostPlatform.width) < this.platformSpawnXCoord
            && !this.encounterActive) {
                this.spawnPlatform(this.rightmostPlatform.x + this.rightmostPlatform.width, this.platformSpawnYCoord);
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

            if (this.enemyTriggerPlatform.x + this.enemyTriggerPlatform.width <= globalGame.config.width*(3/4)) {
                this.currEnvScrollVel = 0;
                this.obstacleInRange = true;
            }
            else if (this.enemyTriggerPlatform.x + this.enemyTriggerPlatform.width <= this.platformSpawnXCoord) {
                
                while ((this.rightmostPlatform.x + this.rightmostPlatform.width) < this.platformSpawnXCoord) {
                        this.spawnPlatform(this.rightmostPlatform.x + this.rightmostPlatform.width, this.platformSpawnYCoord);
                }
            }
        }
    }
    
    // Spawn platform at provided position
    spawnPlatform(x, y) {
        let platformToSpawn;
        // Check if a platform is in the pool first
        if (this.platformPool.getLength() > 0) {
            platformToSpawn = this.platformPool.getFirst();
            platformToSpawn.setOrigin(0);
            platformToSpawn.setX(x);
            platformToSpawn.setY(y);
            platformToSpawn.setActive(true);
            platformToSpawn.setVisible(true);
            this.platformPool.remove(platformToSpawn);
        }
        // If a platform can't be retrieved from the pool, create a new one
        else {
            platformToSpawn = this.physics.add.sprite(x, y, "platform1");
            platformToSpawn.setOrigin(0);
            platformToSpawn.setDisplaySize(platformToSpawn.body.width, this.defaultPlatformBodyHeight);
            platformToSpawn.setPushable(false);
            this.activePlatformGroup.add(platformToSpawn);
        }
        this.rightmostPlatform = platformToSpawn;
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

    // Spawn empty stretch of platforms before obstacle encounter. Returns a reference to the last spawned platform.
    spawnEmptyStretchOfPlatforms(length = globalGame.config.width) {
        let numPlatformsToSpawn = Math.ceil(length / this.platform1BaseWidth);
        for (let i = 0; i < numPlatformsToSpawn - 1; i++) {
            this.spawnPlatform(this.rightmostPlatform.x + this.rightmostPlatform.width, this.platformSpawnYCoord);
        }
        this.enemyTriggerPlatform = this.spawnPlatform(this.rightmostPlatform.x + this.rightmostPlatform.width, this.platformSpawnYCoord);
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
    }

    // After a successful key combo, play animation to move onto the next level of scaffolding
    playJumpingToNextLevelAnim() {
        // Turn off player control

        // Play animation and wait for it to finish

        // Return control to player
    }
}
