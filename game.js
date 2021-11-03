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

var game = new Phaser.Game(config);

var player;
var maxObjects = 25;

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
    
    // Starting platforms
    this.platforms.create(400, 400, 'ground');
    this.platforms.create(1000, 400, 'ground');

    this.pickups = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });

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

    this.physics.add.collider(player, this.platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, this.pickups, collectPickup, null, this);
}

function update () {
    // Scroll level / move player left and right
    if (cursors.left.isDown) {
       //player.setVelocityX(-160);
       this.platforms.setVelocityX(300);
       this.pickups.setVelocityX(300);

        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
       //player.setVelocityX(160);
        this.platforms.setVelocityX(-300,);
        this.pickups.setVelocityX(-300);

        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        this.platforms.setVelocityX(0);
        this.pickups.setVelocityX(0);

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
    // Generate level
    var totalPlatforms = this.platforms.children.entries.length;
    var latestPlatform = this.platforms.children.entries[totalPlatforms-1];
    // TODO Logic for spawning platforms at intervals is stupid, improve it
    if (latestPlatform.x == 400) {
        latestPlatform = spawnPlatform(this.platforms,latestPlatform);
        spawnPickup(this.pickups,latestPlatform);
    }
}

function spawnPlatform(platforms,latestPlatform) {
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
    platforms.create(1000, latestPlatform.y + value, 'ground');
    return  platforms.children.entries[platforms.children.entries.length-1];
    // Destroy platforms that are a long way behind the player
    if (totalPlatforms > maxObjects) {
        platforms.children.entries[0].destroy();
    }
}

function spawnPickup(pickups,platform) {
    var totalPickups = pickups.children.entries.length;
    pickups.create(platform.x, platform.y - 50, 'star'); 
    // Destroy pickups that are a long way behind the player
    if (totalPickups > maxObjects) {
        pickups.children.entries[0].destroy();
    }
}

function collectPickup(player, pickup)
{
    pickup.destroy();
}