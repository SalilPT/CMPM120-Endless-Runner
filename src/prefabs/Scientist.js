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
            key: "scientistRunning",
            frames: this.anims.generateFrameNumbers("scientistRunningSpritesheet", {start: 0}),
            frameRate: 12,
            repeat: -1
        });
        
        this.losingAnim = this.scene.anims.create({
            key: "scientistLosing",
            // COMPLETE THIS
        })
    }

    update() {

    }

    // Play the background animation for the scientist when the menu is still visible
    playMenuBackgroundAnim() {

    }

    // Play running animation
    playRunningAnim() {
        this.anims.play("scientistRunning");
    }

    playJumpingAnim() {

    }

    // Play the animation for when the player loses
    // Returns the duration of the animation in ms
    playLossAnim() {
        //this.anims.play("scientistLosing");
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