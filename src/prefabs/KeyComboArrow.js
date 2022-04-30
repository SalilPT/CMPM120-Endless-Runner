class KeyComboArrow extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        // Treat this as a HUD game object that doesn't move with the rest of the world
        this.setScrollFactor(0);
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

    // returns the correspoding key input based on the rotation of the arrow
    getDirection() {
        console.log(this.angle);
        if (this.angle == 0){
            return upKey;
        } else if (this.angle == 90) {
            return rightKey;
        } else if (this.angle == -180) {
            return downKey;
        } else if (this.angle == -90) {
            return leftKey;
        }
    }

    // change the sprite to indicate the arrow in the combo was guessed correctly
    changeToPassingSprite(){
        this.setTexture('passedArrow',0);
    }
}