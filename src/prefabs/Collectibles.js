class Collectibles extends Phaser.Physics.Arcade.Sprite {
    // params is an object whose fields are the parameters
    constructor(params) {
        super(params.scene, params.x, params.y, params.texture, params.frame,);
        params.scene.add.existing(this);
        params.scene.physics.add.existing(this);
        this.spawnPoint = params.x;
    }

    update() {
        //this.setVelocityY(this.scene.currEnvScrollYVel);
        if (!this.scene.encounterActive) {
            this.setVelocityX(this.scene.currEnvScrollXVel)
            //this.setVelocityY(this.scene.currEnvScrollYVel);
            if (this.x <= 0 - this.width) {
                this.destroy();
            }
        }
    }

    // When the player collects this, call this function to determine what to do
    handleCollisionWithPlayer() {
        // Play small animation

        // Particles?

        // Destroy self

    }
}