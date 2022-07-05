class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // animations
        this.anims.create({
            key: 'globlinIdleAnim',
            frameRate: 8,
            frames: this.anims.generateFrameNames('globlinAtlas', {
                prefix: 'globlin_idle_f',
                start: 1,
                end: 4
            }),
            showOnStart: true,
            repeat: -1
        });
        this.anims.create({
            key: 'globlinDeathAnim',
            frameRate: 8,
            frames: this.anims.generateFrameNames('globlinAtlas', {
                prefix: 'globlin_death_f',
                start: 1,
                end: 8,
            }),
            hideOnComplete: true
        });
    }
    update () {
        this.setVelocityX(this.scene.currEnvScrollXVel);
    }

    playIdleAnim() {
        this.anims.play('globlinIdleAnim', 1);
    }

    playDeathAnim() {
        this.anims.play('globlinDeathAnim');
    }   
}
