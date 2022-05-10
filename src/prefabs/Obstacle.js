class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame,);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        //animations
        this.anims.create({
            key: 'globlinIdleAnim',
            frameRate: 8,
            frames: this.anims.generateFrameNames('globlinAtlas',{
            prefix: 'globlin_idle_f',
            //suffix: '.png',
            start:1,
            end: 4
            }),
            repeat:-1
        });
        this.anims.create({
            key: 'globlinDeathAnim',
            frameRate: 8,
            frames: this.anims.generateFrameNames('globlinAtlas',{
            prefix: 'globlin_death_f',
            //suffix: '.png',
            start:1,
            end: 8
            }),
            //repeat:-1
        });
    }
    update (){
        this.setVelocityX(this.scene.currEnvScrollXVel)
        if (this.x <= 0 - this.width) {
            this.destroy();
        }
    }
    playIdleAnim(){
        this.anims.play('globlinIdleAnim', 1);
    }
    playDeathAnim() {
        this.anims.play('globlinDeathAnim').on('animationcomplete', () => {
            this.destroy();
        });;
    }
}