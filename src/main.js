/*
//////////
INFORMATION
//////////

Collaborators:
Gustavo Cruz Martinez
Miles Katlin
Salil Tantamjarik

Date Completed: June 30, 2022

Game Title: "Jeb's Infernal Escape"

Interesting Technical Features:
- Used the launch() method run the Menu and Play scenes in parallel
- Used object pooling for platforms
- Used a render texture for the lava
- Used a key combo to keep track of the inputted keys
- Used lots of tweens

Visual Style:
Miles: This is the first time I have ever tried creating pixel art. I am quite 
proud of all the art I made but I am particularly proud of the background and 
main character Jeb. For the background, it took a lot of work to give it depth 
while also making it seamless and I am very happy with how it turned out. Jeb 
the robots animations were surprisingly difficult. I wanted to make sure each 
animation could flow into the next and also wanted to make sure our hero stood 
out from the chaos going on in the scene.
*/

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
    scene: [Menu, Play, Credits, GameOver]
}

let globalGame = new Phaser.Game(globalGameConfig);
let upKey, downKey, rightKey, leftKey;
