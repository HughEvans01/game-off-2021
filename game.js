var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;

var game = new Phaser.Game(config);

function preload () {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create () {
    //  A simple background for our game
    this.add.image(400, 300, 'sky');
    
    this.movingPlatforms = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });

    this.movingPlatforms.create(400, 400, 'ground');
    this.movingPlatforms.create(1000, 400, 'ground');

    // The player and its settings
    player = this.physics.add.sprite(400, 300, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });


    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(player, this.movingPlatforms);
}

function update () {
    // Scroll level / move player left and right
    if (cursors.left.isDown) {
       //player.setVelocityX(-160);
       this.movingPlatforms.setVelocityX(300);

        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
       //player.setVelocityX(160);
        this.movingPlatforms.setVelocityX(-300,);

        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        this.movingPlatforms.setVelocityX(0);

        player.anims.play('turn');
    }
    // Jump
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
    // Kill player if they fall out of the level
    if (player.y > 600) {
        this.scene.restart();
    }
}
