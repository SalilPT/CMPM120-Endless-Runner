class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    init() {

    }

    preload() {
        //load title
        this.load.image("title", "./assets/Title.png");
        // Load background and lava
        this.load.spritesheet("volcanicBackground", "./assets/background sprite sheet (3 frames) 384x128.png", {frameWidth: 384/3, frameHeight: 128});
        this.load.spritesheet("lavaTop", "./assets/lava sprite sheet (4 frames) 512x50.png", {frameWidth: 512/4, frameHeight: 50});
        this.load.spritesheet("lavaBottom", "./assets/Lava Bottom Spritesheet (4 frames).png", {frameWidth: 512/4, frameHeight: 64});
        // Load assets for Platforms and Scientist
        this.load.image("platform1", "./assets/Rock Platform 1 (Shadow)(128x74).png");
        this.load.image("laser", "./assets/Jeb laserbeam 64W x 78H.png");
        
        this.load.spritesheet("jebRunningSpritesheet", "./assets/Jeb running spritesheet 64x78.png", {frameWidth: 64, frameHeight: 78});
        this.load.spritesheet("jebDeathSpritesheet", "./assets/Jeb Death Spritesheet 64x78.png", {frameWidth:64, frameHeight:78});
        this.load.spritesheet("jebIdleSpritesheet", "./assets/Jeb Idle Spritesheet 64x78.png", {frameWidth:64, frameHeight:78});
        this.load.spritesheet("jebJumpingSpritesheet", "./assets/jeb jumping spirtesheet 64W x 78H.png", {frameWidth:64, frameHeight:78});
        this.load.spritesheet("jebAttackSpritesheet", "./assets/Jeb Attack Spritesheet 64W x 78H.png", {frameWidth:64, frameHeight:78});
        //atlas loading
        this.load.atlas("globlinAtlas", './assets/globlin.png', "./assets/globlin_atlas.json");

        // Load UI buttons
        this.load.image("playButton", "./assets/playButton.png");
        this.load.image("creditsButton", "./assets/creditsButton.png")
        this.load.image("titleButton", "./assets/titleButton.png")
        // Load audio assets
        this.load.audio('jebJump1', './assets/audio/Jump1.wav');
        this.load.audio('jebJump2', './assets/audio/Jump2.wav');
        this.load.audio('jebDeath', './assets/audio/Jeb Death.wav');
        this.load.audio('jebLaser', './assets/audio/Jeb Laser.wav');
        this.load.audio('itemPickup', './assets/audio/Item Pickup sound.wav');
        this.load.audio('globlinDeath1', './assets/audio/Globlin Death 1.wav');
        this.load.audio('globlinDeath2', './assets/audio/Globlin Death 2.wav');
        this.load.audio('globlinDeath3', './assets/audio/Globlin Death 3.wav');
        this.load.audio('buttonSound', './assets/audio/Button Sound.wav');

        this.load.audio('backgroundMusic', './assets/audio/An Infernal Dash.mp3');
    }

    create() {       
        // menu text configuration
        let menuConfig = {
            fontFamily: "JebFont",
            fontSize: '20px',
            color: '#ff9933',
            align: 'center',
            stroke: '#000000',
            strokeThickness:2,
            padding: {
                top: 5,
                bottom: 5,
            },
        }
        // set up title sprite
        this.title = this.add.sprite(globalGameConfig.width/2, globalGameConfig.height/6, "title");
        this.add.text(globalGameConfig.width/2, globalGameConfig.height/2.75,'INFERNAL ESCAPE', menuConfig).setOrigin(.5);
        this.title.setScale(.90);
        // set up button sprites
        menuConfig.fontSize = 16;
        menuConfig.color = '#FFFFFF';
        this.playButton = this.add.sprite(globalGameConfig.width/2.8, globalGameConfig.height/1.47, "playButton").setOrigin(.5);
        this.playButtonText = this.add.text(globalGameConfig.width/2.8, globalGameConfig.height/1.47,'PLAY', menuConfig).setOrigin(.5);
        this.creditsButton = this.add.sprite(globalGameConfig.width/1.60, globalGameConfig.height/1.47, "creditsButton").setOrigin(.5);
        this.creditsButtonText = this.add.text(globalGameConfig.width/1.59, globalGameConfig.height/1.47,'CREDITS', menuConfig).setOrigin(.5);

        // Adjusting positions of buttons to prevent tangent line with platforms (you can remove this if you'd like)
        this.playButton.y += this.playButton.height/4;
        this.playButtonText.y += this.playButton.height/4;
        this.creditsButton.y += this.creditsButton.height/4;
        this.creditsButtonText.y += this.creditsButton.height/4;
        // set button sprites as interactibles 
        this.playButton.setInteractive();
        this.creditsButton.setInteractive();
        // set instruction text
        menuConfig.align = 'left'
        menuConfig.color = '#ff9933'
        menuConfig.fontSize = 12;
        this.add.text(globalGame.config.width/4.5, globalGame.config.height/1.10, 'CONTROLS:\nUP KEY TO JUMP\nARROW KEYS WHEN PROMPTED', menuConfig).setOrigin(0.5);
        
        // put menu scene to the top of screen
        this.scene.bringToTop();
        // playButton functionality
        this.playButton.on("pointerdown", () => {
            this.sound.play('buttonSound');
            console.log("Clicked on playButton in Menu scene");
            this.scene.sleep("menuScene")
            // start the game
            this.scene.get("playScene").startGameplay();
        });
        //creditsButton functionality
        this.creditsButton.on("pointerdown", () => {
            this.sound.play('buttonSound')
            console.log("Clicked on creditsButton in Menu scene");
            this.scene.sleep("menuScene");
            this.scene.sleep("playScene");
            // start the game
            this.scene.launch("creditsScene");
        });
        // launch the playScene in parallel to the menut scene
        this.scene.launch("playScene");
        // Assign events for when buttons are clicked
        upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        // Play background music

    }

    update() {
        
    }
    
}
