class Platform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame=0) {
        super(scene, x, y, texture, frame);
        this.body.checkCollision.left = false;
        this.body.checkCollision.down = false;
        this.body.checkCollision.right = false;
    }
}