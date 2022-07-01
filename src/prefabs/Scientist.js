class Scientist extends Phaser.Physics.Arcade.Sprite {
    constructor(params) {
        super(params.scene, params.x, params.y, params.texture, params.frame);
        // Add graphics that's displayed and the physics body
        params.scene.add.existing(this);
        params.scene.physics.add.existing(this);

        // Set physics properties
        this.setBounce(0);
        this.setFriction(0);

        // Animations
        this.scene.anims.create({
            key: "jebRunning",
            frames: this.anims.generateFrameNumbers("jebRunningSpritesheet", {start: 0}),
            frameRate: 12,
            repeat: -1
        });
        this.scene.anims.create({
            key: "jebLosing",
            frames: this.anims.generateFrameNumbers("jebDeathSpritesheet", {start:0}),
            frameRate: 12,
        });
        this.scene.anims.create({
            key: "jebIdle",
            frames: this.anims.generateFrameNumbers("jebIdleSpritesheet", {start:0}),
            frameRate: 8,
            repeat: -1
        });
        this.scene.anims.create({
            key: "jebJumping",
            frames: this.scene.anims.generateFrameNumbers("jebJumpingSpritesheet", {start:0}),
            frameRate: 16
        });
        this.scene.anims.create({
            key: "jebAttack",
            frames: this.scene.anims.generateFrameNumbers("jebAttackSpritesheet"),
            frameRate: 14
        });

        // audios
        this.rnd = Phaser.Math.RND;
        this.jumpArr = [];
        this.jumpSound1 = this.scene.sound.add('jebJump1');
        this.jumpSound2 = this.scene.sound.add('jebJump2');
        this.jumpArr.push(this.jumpSound1);
        this.jumpArr.push(this.jumpSound2);
        
        this.jebDeathSound = this.scene.sound.add('jebDeath');
        this.laserSound = this.scene.sound.add('jebLaser');
    }

    playIdleAnim(){
        this.anims.play("jebIdle", 1);
    }

    // Play running animation
    playRunningAnim() {
        this.anims.play("jebRunning", 1);
    }

    playJumpingAnim() {
        this.soundToPlay = this.rnd.pick(this.jumpArr);
        this.anims.play("jebJumping");
        this.soundToPlay.play({detune:(Math.floor(Math.random() * 300)) - 150});
    }

    // Play the animation for when the player loses
    playLossAnim() {
        this.anims.play("jebLosing");
        this.jebDeathSound.play();
    }

    playAttackObstacleAnim() {
        this.anims.play("jebAttack");
        this.laserSound.play({rate:2, detune:-1200});
        this.scene.time.delayedCall(850, () => {
            this.laserBeam = this.scene.physics.add.sprite(this.scene.playerChar.x, this.scene.playerStartPosY, "laser", 0);
            this.laserBeam.setVelocityX(350);

            // Periodically check if the spawned laser is out of bounds. If so, destroy it.
            let laserOutOfBoundsCheckTimer = this.scene.time.addEvent({
                delay: (1000/60)*4,
                callback: () => {
                    if (this.laserBeam.x > globalGame.config.width) {
                        this.laserBeam.destroy();
                        this.scene.time.removeEvent(laserOutOfBoundsCheckTimer);
                        laserOutOfBoundsCheckTimer.destroy();
                    }
                },
                loop: true
            });
        });
    }
}
