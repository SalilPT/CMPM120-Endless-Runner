class KeyComboArrow extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, position) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
    }

    // rotates the sprite randomly by 0, 90, 180, or 270
    rotateArrow() {  
        let angleRotation = 0
        angleRotation += Math.floor(Math.random() * 4);
        if (angleRotation == 1) {
            this.angle += 90;
        } else if (angleRotation == 2) {
            this.angle += 180;
        } else if (angleRotation == 3) {
            this.angle += 270;
        }
    }
}