// Naming convention: camel case
// Line endings: LF

let globalGameConfig = {
    type: Phaser.WEBGL,
    width: 640,
    height: 360,
    backgroundColor: 0xCCCCCC,
    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    },
    //scene: [Menu, Credits, Play]
    scene: [Menu, Play]
}

let globalGame = new Phaser.Game(globalGameConfig);
