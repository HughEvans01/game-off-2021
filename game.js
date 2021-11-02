console.log("Game started");

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
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

    //  The platforms group contains the ground and the 2 ledges we can jump on
   platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
   platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
   //platforms.create(600, 400, 'ground');
   //platforms.create(50, 250, 'ground');
   //platforms.create(750, 220, 'ground');

   movingPlatform = this.physics.add.image(400, 400, 'ground');
   movingPlatform.setImmovable(true);
    movingPlatform.body.allowGravity = false;
   // movingPlatform.setVelocityX(50);


    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

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

    this.physics.add.collider(player,platforms);
    this.physics.add.collider(player, movingPlatform);
}

function update () {
     if (cursors.left.isDown)
    {
       player.setVelocityX(-160);
       movingPlatform.setVelocityX(160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
       player.setVelocityX(160);
        movingPlatform.setVelocityX(-160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);
        movingPlatform.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }

}
