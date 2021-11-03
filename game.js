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
var maxPlatforms = 25;

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
    
    this.platforms = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });

    this.platforms.create(400, 400, 'ground');
    this.platforms.create(1000, 400, 'ground');

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

    //this.physics.add.collider(player, this.platforms);

    this.physics.add.collider(
        player,
        this.platforms,
        function (_player, _platform) {
            if (_player.body.touching.up && _platform.body.touching.down) {
                _player.body.velocity.y = 0;
            }
        });
}

function update () {
    // Scroll level / move player left and right
    if (cursors.left.isDown) {
       //player.setVelocityX(-160);
       this.platforms.setVelocityX(300);

        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
       //player.setVelocityX(160);
        this.platforms.setVelocityX(-300,);

        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        this.platforms.setVelocityX(0);

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
    // Spawn a new platform
    var totalPlatforms = this.platforms.children.entries.length;
    latestPlatform = this.platforms.children.entries[totalPlatforms-1];
    if (latestPlatform.x == 400) {
        // Difference in y from height of prev platform
        var value;
        var maxHeight = 200;
        var minHeight = 450;
        if (latestPlatform.y >= maxHeight && latestPlatform.y <= minHeight) {
            value = Phaser.Math.Between(-1, 1) * 50;
        } else if (latestPlatform.y <= maxHeight) {
            value = 50;
        } else if (latestPlatform.y >= minHeight) {
            value = -50;
        }
        this.platforms.create(1000, latestPlatform.y + value, 'ground');
        // Destroy platforms that are a long way behind the player
        if (totalPlatforms > maxPlatforms) {
            this.platforms.children.entries[0].destroy();
        }
    }
}
