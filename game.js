var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
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

//TODO Define as many game attributes up here as possible
var player; // Stores reference to player sprite
var maxObjects = 25; // Maximum number of each type of object
var speed = 300; // Player speed
var jump = 330; // Jump velocity
var maxHeight = 200; // Max height for platforms to spawn
var minHeight = 450; // Min height for platforms to spawn
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    var mobile = true;
} else {
    var mobile = false;
}

var bugCounter = 0;
var latestBug = null;

var game = new Phaser.Game(config);


function preload () {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('left', 'assets/left.png');
    this.load.image('up', 'assets/up.png');
    this.load.image('right', 'assets/right.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.json('bugs', 'bugs.json');
}

function create () {
    // Logic for "bugs"
    this.bugsJSON = this.cache.json.get('bugs');
    if (latestBug != null) {
        // Apply effect of bug
        eval(this.bugsJSON[latestBug].effect);
        latestBug = null;
    }

    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    this.platforms = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });

    this.pickups = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });

    this.enemies = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });
    
    // Starting platforms
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

    // Touch screen controls
    if (mobile) {
        this.input.addPointer(2); // For multi-touch
        const leftButton = this.add.image(48, 549, 'left');
        const upButton = this.add.image(400, 549, 'up');
        const rightButton = this.add.image(752, 549, 'right');
        leftButton.setInteractive();
        upButton.setInteractive();
        rightButton.setInteractive();
        leftButton.on('pointerdown', () => { this.left_held = true; });
        leftButton.on('pointerup', () => { this.left_held = false; });
        upButton.on('pointerdown', () => { this.jump_pressed = true; });
        rightButton.on('pointerdown', () => { this.right_held = true; });
        rightButton.on('pointerup', () => { this.right_held = false; });
    }

    this.physics.add.collider(player, this.platforms);
    this.physics.add.overlap(player, this.pickups, collectPickup, null, this);
    this.physics.add.overlap(player, this.enemies, hitEnemy, null, this);
}

function update () {
    // Scroll level / move player left and right
    if (cursors.left.isDown || this.left_held) {
       //player.setVelocityX(-160);
       this.platforms.setVelocityX(speed);
       this.pickups.setVelocityX(speed);
       this.enemies.setVelocityX(speed);

        player.anims.play('left', true);
    } else if (cursors.right.isDown || this.right_held) {
       //player.setVelocityX(160);
        this.platforms.setVelocityX(-speed,);
        this.pickups.setVelocityX(-speed);
        this.enemies.setVelocityX(-speed);

        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        this.platforms.setVelocityX(0);
        this.pickups.setVelocityX(0);
        this.enemies.setVelocityX(0);

        this.left_pressed = false;
        this.right_pressed = false;

        player.anims.play('turn');
    }
    // Jump
    if ((cursors.up.isDown || this.jump_pressed) && player.body.touching.down) {
        player.setVelocityY(-jump);
        this.jump_pressed = false;
    }
    // Kill player if they fall out of the level
    if (player.y > 600) {
        clearBugs();
        this.right_held = false;
        this.left_held = false;
        this.jump_pressed = false;
        this.scene.restart();
    }
    // Generate level
    var totalPlatforms = this.platforms.children.entries.length;
    var latestPlatform = this.platforms.children.entries[totalPlatforms-1];
    // TODO Logic for spawning platforms and entities is stupid, improve it
    if (latestPlatform.x <= 400) {
        latestPlatform = spawnPlatform(this.platforms,latestPlatform);
        var entity = Phaser.Math.Between(0, 9);
        if (entity < 4) {
            spawnEnemy(this.enemies,latestPlatform);
        } else if (entity == 9){
            spawnPickup(this.pickups,latestPlatform,this.bugsJSON);
        }
    }
}

function spawnPlatform(platforms,latestPlatform) {
    // Difference in y from height of prev platform
    var value;
    if (latestPlatform.y >= maxHeight && latestPlatform.y <= minHeight) {
        value = Phaser.Math.Between(-1, 1) * 50;
    } else if (latestPlatform.y <= maxHeight) {
        value = 50;
    } else if (latestPlatform.y >= minHeight) {
        value = -50;
    }
    platforms.create(1000, latestPlatform.y + value, 'ground');
    var totalPlatforms = platforms.children.entries.length;
    // Destroy platforms that are a long way behind the player
    if (totalPlatforms > maxObjects) {
        platforms.children.entries[0].destroy();
        totalPlatforms = platforms.children.entries.length;
    }
    return  platforms.children.entries[totalPlatforms-1];
}

function spawnPickup(pickups,platform,bugs) {
    pickups.create(platform.x, platform.y - 50, 'star');
    var totalPickups = pickups.children.entries.length;
    var pickup = pickups.children.entries[totalPickups-1];
    pickup.bugID = Phaser.Math.Between(0, bugs.length-1);
    pickup.setTintFill(bugs[pickup.bugID].colour);
    // Destroy pickups that are a long way behind the player
    if (totalPickups > maxObjects) {
        pickups.children.entries[0].destroy();
    }
}

function collectPickup(player, pickup)
{
    pickup.destroy();
    // TODO Transition goes here
    bugCounter++;
    latestBug = pickup.bugID;
    this.scene.restart();

}

function spawnEnemy(enemies,platform) {
    enemies.create(platform.x, platform.y - 50, 'bomb'); 
    var totalEnemies = enemies.children.entries.length;
    // Destroy enemies that are a long way behind the player
    if (totalEnemies > maxObjects) {
      enemies.children.entries[0].destroy();
    }
}

function hitEnemy(player,enemy) {
    clearBugs();
    this.right_held = false;
    this.left_held = false;
    this.jump_pressed = false;
    this.scene.restart();
}

// Resets all of the game variables to default to clear bug effects
function clearBugs(){ 
    speed = 300; 
    jump = 330; 
    maxHeight = 200; 
    minHeight = 450; 
    bugCounter = 0;
    latestBug = null;
}