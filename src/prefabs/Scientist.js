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
        
        this.losingAnim = this.scene.anims.create({
            key: "jebLosing",
            frames: this.anims.generateFrameNumbers("jebDeathSpritesheet", {start:0}),
            frameRate: 12,
        })
        this.scene.anims.create({
            key: 'jebIdle',
            frames: this.anims.generateFrameNumbers("jebIdleSpritesheet", {start:0}),
            frameRate: 8,
            repeat: -1
        })
        this.scene.anims.create({
            key: "jebJumping",
            frames: this.scene.anims.generateFrameNumbers("jebJumpingSpritesheet", {start:0}),
            frameRate: 16
        })
    }

    update() {

    }

    playIdleAnim(){
        this.anims.play("jebIdle", 1);
    }

    // Play the background animation for the scientist when the menu is still visible
    playMenuBackgroundAnim() {

    }

    // Play running animation
    playRunningAnim() {
        this.anims.play("jebRunning", 1);
    }

    playJumpingAnim() {
        this.anims.play("jebJumping");
    }

    // Play the animation for when the player loses
    // Returns the duration of the animation in ms
    playLossAnim() {
        this.anims.play("jebLosing");
        //return this.losingAnim.duration;
    }

    playAttackObstacleAnim() {

    }

    playFailedAttackObstacleAnim() {

    }

    // Play animation for when the player collects something
    playCollectingAnim() {

    }
}