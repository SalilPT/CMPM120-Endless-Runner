// Naming convention: camel case
// Line endings: LF

"use strict";

let globalGameConfig = {
    type: Phaser.WEBGL,
    width: 640,
    height: 360,
    backgroundColor: 0xCCCCCC,
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    //scene: [Menu, Credits, Play]
    scene: [Menu, Play, Credits, GameOver]
}

let globalGame = new Phaser.Game(globalGameConfig);
let upKey, downKey, rightKey, leftKey;
