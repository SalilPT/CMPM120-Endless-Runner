class Scientist extends Phaser.Physics.Arcade.Sprite {
    constructor(params) {
        super(params.scene, params.x, params.y, params.texture, params.frame);
        // Add graphics that's displayed and the physics body
        params.scene.add.existing(this);
        params.scene.physics.add.existing(this);
    }

    update() {

    }

    // Play the background animation for the scientist when the menu is still visible
    playMenuBackgroundAnim() {

    }

    // After the play button is pressed, transition to running animation
    transitionToRunningAnim() {

    }

    // Play the animation for when the player loses
    playLossAnim() {

    }

    playAttackObstacleAnim() {

    }

    playFailedAttackObstacleAnim() {

    }

    // Play animation for when the player collects something
    playCollectingAnim() {

    }
}