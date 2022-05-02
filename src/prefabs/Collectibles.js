class Collectibles extends Phaser.Physics.Arcade.Sprite {
    // params is an object whose fields are the parameters
    constructor(params) {
        super(params.scene, params.x, params.y, params.texture, params.frame,);
        params.scene.add.existing(this);
        params.scene.physics.add.existing(this);
        this.spawnPoint = params.x;
        this.scene = params.scene;
        this.body.setMass(0);
        this.angle = Phaser.Math.Between(-15, 15);
    }

    update() {
        this.setVelocityX(this.scene.currEnvScrollXVel)
        if (this.x <= 0 - this.width) {
            this.destroy();
        }
    }

    // When the player collects this, call this function to determine what to do
    handleCollisionWithPlayer() {
        // Prevent multiple unintended calls to this method
        this.body.checkCollision.none = true;
        // Play small animation
        this.scene.tweens.add({
            targets: this,
            scaleX: {from: 1, to: -0.5},
            scaleY: {from: 1, to: 0.75},
            ease: Phaser.Math.Easing.Quadratic.Out,
            duration: 120,
            onComplete: () => {this.destroy();}, // Destroy self
        })
        // Particles?

        

    }
}