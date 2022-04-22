// Naming convention: camel case
// Line endings: LF

let globalGameConfig = {
    type: Phaser.WEBGL,
    width: 640,
    height: 360,
    scene: [Menu, Credits, Play]
}

let globalGame = new Phaser.Game(globalGameConfig);
