class Game extends Phaser.Scene {

    constructor () {
        super('Game');
    }

    init() {
        // Used to prepare data
        this.gameData = {
            minPlatformHeight: 400,
            maxPlatformHeight: 200,
            mobile: false,
            UIScale: 1.1,
            menuOpen: false,
            distanceBetweenPlatforms: 500,
            enemiesVisible: true
        };
        this.gameData.mobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }

    preload() {
        this.load.image('sky', 'assets/sprites/sky.png');
        this.load.image('ground', 'assets/sprites/platform.png');
        this.load.image('left', 'assets/sprites/left.png');
        this.load.image('up', 'assets/sprites/up.png');
        this.load.image('right', 'assets/sprites/right.png');
        this.load.image('pause', 'assets/sprites/pause.png');
        this.load.spritesheet('dude', 'assets/sprites/player.png', { frameWidth: 20, frameHeight: 36 });
        this.load.spritesheet('enemy', 'assets/sprites/enemy.png', { frameWidth: 80, frameHeight: 80});
        this.load.spritesheet('bug', 'assets/sprites/bug.png', { frameWidth: 64, frameHeight: 64 });
        
        this.load.audio('jump', 'assets/sounds/jump.wav');
        this.load.audio('pickup', 'assets/sounds/pickup.wav');
        this.load.audio('enemy', 'assets/sounds/enemy.wav');
        this.load.audio('fall', 'assets/sounds/fall.wav');


        this.load.json('bugs', 'bugs.json');
    }

    create(data) {
        this.gameOptions = JSON.parse(window.localStorage.getItem('gameOptions'));
        this.bugsJSON = this.cache.json.get('bugs');

        this.highScore = JSON.parse(window.localStorage.getItem('highScore'));

        this.gameData.enemiesVisible = true;

        this.jumpSound = this.sound.add('jump', {volume: this.gameOptions.volume});
        this.pickupSound = this.sound.add('pickup', {volume: this.gameOptions.volume});
        this.enemy = this.sound.add('enemy', {volume: this.gameOptions.volume});
        this.fall = this.sound.add('fall', {volume: this.gameOptions.volume});

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

        // Setup start of level
        this.background = this.add.image(400, 300, 'sky');
        this.background.setScrollFactor(0);

        this.latestPlatform = null; // Clear platform from previous run so start platform is at correct height. Sorry :(
        this.spawnPlatform(400);
        this.spawnPlatform(this.latestPlatform.x+this.gameData.distanceBetweenPlatforms);

        // Used for testing specfic bugs
        /*this.pickup = this.pickups.create(this.latestPlatform.x, this.latestPlatform.y - 50, 'bug');
        this.pickup.bugID = 6;
        this.pickup.setTintFill(this.bugsJSON[this.pickup.bugID].colour);*/

        // Display distance travelled
        this.distanceTraveled = this.add.text((20*this.gameOptions.UIScale), 10*this.gameOptions.UIScale, '0', { fontFamily: 'font2', fontSize: (32*this.gameOptions.UIScale)+'px' });
        this.distanceTraveled.setScrollFactor(0);

        // Define player attributes
        this.player = {
            sprite: null,
            speed: 300,
            jump: 300,
            bounce: 0,
            distanceTraveled: 0,
            bugsCollected: [],
            alive: true,
            scale: 1,
            idleSpeed: 0,
            direction: 'right'
        };

        // Get existing bug collection so it can be updated in play
        this.player.bugsCollected = JSON.parse(window.localStorage.getItem('bugCollection'));

        // Spawn the player sprite
        this.player.sprite = this.physics.add.sprite(400, 360, 'dude');
        this.player.sprite.setOrigin(0.5,0.5);
        this.player.sprite.setBounce(this.player.bounce);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'leftIdle',
            frames: this.anims.generateFrameNumbers('dude', { start: 3, end: 4 }),
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 6, end: 9 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'rightIdle',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 6 }),
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'enemy',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 1 }),
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'bug',
            frames: this.anims.generateFrameNumbers('bug', { start: 0, end: 2 }),
            frameRate: 2,
            repeat: -1
        });

        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.gameData.mobile) {
            this.input.addPointer(2); // For multi-touch
            this.leftButton = this.add.image(800 - (144*this.gameOptions.UIScale), 600 - 49*this.gameOptions.UIScale, 'left');
            this.upButton = this.add.image(48*this.gameOptions.UIScale, 600 - 49*this.gameOptions.UIScale, 'up');
            this.rightButton = this.add.image(800 - 48*this.gameOptions.UIScale, 600 - 49*this.gameOptions.UIScale, 'right');
            this.leftButton.setScrollFactor(0).setScale(this.gameOptions.UIScale).setInteractive();
            this.upButton.setScrollFactor(0).setScale(this.gameOptions.UIScale).setInteractive();
            this.rightButton.setScrollFactor(0).setScale(this.gameOptions.UIScale).setInteractive();
            this.leftButton.on('pointerdown', () => { this.left_held = true; });
            this.leftButton.on('pointerup', () => { this.left_held = false; });
            this.upButton.on('pointerdown', () => { this.jump_pressed = true; });
            this.rightButton.on('pointerdown', () => { this.right_held = true; });
            this.rightButton.on('pointerup', () => { this.right_held = false; });
        }
        this.pause = this.add.image(800-(37*this.gameOptions.UIScale), 27*this.gameOptions.UIScale, 'pause');
        this.pause.setScrollFactor(0);
        this.pause.setScale(this.gameOptions.UIScale);
        this.pause.setInteractive();
        this.pause.on('pointerdown', () => { this.toggleMenu(); });

        this.physics.add.collider(this.player.sprite, this.platforms);
        this.physics.add.overlap(this.player.sprite, this.pickups, this.collectPickup, null, this);
        this.physics.add.overlap(this.player.sprite, this.enemies, this.killPlayer, null, this);

        this.time.addEvent({ delay: 1000, callback: playenemy, callbackScope: this, loop: true });


    }   

    update(time, delta) {
        // TODO The below feels dumb, improve it?
        // Keep UI on top of game
        if (this.gameData.mobile) {
            this.children.bringToTop(this.leftButton);
            this.children.bringToTop(this.upButton);
            this.children.bringToTop(this.rightButton);
        }
        this.children.bringToTop(this.distanceTraveled);
        this.children.bringToTop(this.pause);

        if (this.player.alive) {
            // Track player with camera
            if (this.player.sprite.y < 600) {
                this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
            }
            // Update distance travelled
            this.player.distanceTraveled = Math.round((this.player.sprite.x - 400)/100);
            if (this.player.distanceTraveled > 0) {
                this.distanceTraveled.setText(this.player.distanceTraveled+ "m");
            } else {
                this.distanceTraveled.setText("0m");
            }
            // Move player left and right
            if (this.cursors.left.isDown || this.left_held) {
                this.player.direction = 'left';
                this.player.sprite.setVelocityX(-this.player.speed);
                if (this.player.sprite.body.touching.down) {
                    this.player.sprite.anims.play('left', true);
                } else {
                   this.player.sprite.anims.play('leftIdle', true);
                }
            } else if (this.cursors.right.isDown || this.right_held) {
                this.player.direction = 'right';
                this.player.sprite.setVelocityX(this.player.speed,);
                if (this.player.sprite.body.touching.down) {
                    this.player.sprite.anims.play('right', true);
                } else {
                    this.player.sprite.anims.play('rightIdle', true);
                }
            } else {
                if (this.player.direction == 'left') {
                    this.player.sprite.setVelocityX(this.player.idleSpeed*-1);
                    this.player.sprite.anims.play('leftIdle', true);
                } else if (this.player.direction == 'right') {
                    this.player.sprite.setVelocityX(this.player.idleSpeed);
                    this.player.sprite.anims.play('rightIdle', true);
                }
                this.left_pressed = false;
                this.right_pressed = false;
                
            }
            // Jump
            if ((this.cursors.up.isDown || this.jump_pressed) && this.player.sprite.body.touching.down) {
                this.jumpSound.play();
                this.player.sprite.setVelocityY(-this.player.jump);
                this.jump_pressed = false;
            }
            // Kill player if they fall out of the level
            if (this.player.sprite.y > 600) {
                this.fall.play();
                this.killPlayer();
            }
        }
        // Generate level
        this.totalPlatforms = this.platforms.children.entries.length;
        this.latestPlatform = this.platforms.children.entries[this.totalPlatforms-1];
        // TODO Logic for spawning platforms and entities is stupid, improve it
        // Distance between player and edge of level generation
        var a = this.latestPlatform.x;
        var b = this.player.sprite.x;
        if ((a - b) < 2000) {
            this.spawnPlatform(this.latestPlatform.x + this.gameData.distanceBetweenPlatforms);
            var entity = Phaser.Math.Between(0, 9);
            if (entity < 6 ) {
                this.spawnEnemy();
            } else if (entity > 6){
                this.spawnPickup();
            }
        }

    }

    killPlayer() {
        this.right_held = false;
        this.left_held = false;
        this.jump_pressed = false;
        this.player.sprite.setActive(false).setVisible(false);
        this.player.alive = false;
        if (this.gameData.menuOpen == false) {
            if (this.gameData.mobile) {
                this.leftButton.destroy();
                this.rightButton.destroy();
                this.upButton.destroy();
            }
            this.pause.destroy();
            this.toggleMenu();
        }
        window.localStorage.setItem('bugCollection', JSON.stringify(this.player.bugsCollected));
    }

    toggleMenu() {
        if (!this.gameData.menuOpen) {
            this.graphics = this.add.graphics();
            this.graphics.fillStyle(0x000000, 1);
            this.graphics.fillRoundedRect(this.player.sprite.x-150*this.gameOptions.UIScale, this.player.sprite.y-100*this.gameOptions.UIScale, 300*this.gameOptions.UIScale, 200*this.gameOptions.UIScale, 32);
            this.newHighScore = this.add.text(this.player.sprite.x,  this.player.sprite.y-75*this.gameOptions.UIScale, "", { fontFamily: 'font2', fontSize: (16*this.gameOptions.UIScale)+'px' });
            this.newHighScore.setOrigin(0.5,0.5);
            if (this.player.distanceTraveled > this.highScore) {
                this.highScore = this.player.distanceTraveled;
                window.localStorage.setItem('highScore', JSON.stringify(this.highScore));
                this.newHighScore.setText("NEW HIGH SCORE");
            }
            this.score = this.add.text(this.player.sprite.x,  this.player.sprite.y-50*this.gameOptions.UIScale, this.player.distanceTraveled + "m", { fontFamily: 'font2', fontSize: (16*this.gameOptions.UIScale)+'px' });
            this.score.setOrigin(0.5,0.5);
            var text = 'PLAY AGAIN';
            if (this.player.alive) {
                text = 'RESTART';
            }
            this.playAgain = this.add.text(this.player.sprite.x, this.player.sprite.y, text, { fontFamily: 'font1', fontSize: (32*this.gameOptions.UIScale)+'px' });
            this.playAgain.setOrigin(0.5,0.5);
            this.playAgain.setInteractive();
            this.playAgain.on('pointerdown', () => {
                this.scene.start();
            });
            this.playAgain.on('pointerdown', () => {
                this.scene.pause("Menu");
            });
            this.backToMenu = this.add.text(this.player.sprite.x, this.player.sprite.y+50*this.gameOptions.UIScale, 'BACK TO MENU', { fontFamily: 'font1', fontSize: (32*this.gameOptions.UIScale)+'px' });
            this.backToMenu.setOrigin(0.5,0.5);
            this.backToMenu.setInteractive();
            this.backToMenu.on('pointerdown', () => {
                this.scene.start("Menu");
            });
            this.gameData.menuOpen = true;
        } else {
            this.graphics.destroy();
            this.newHighScore.destroy();
            this.score.destroy();
            this.playAgain.destroy();
            this.backToMenu.destroy();
            this.gameData.menuOpen = false;
        }
    }

    spawnPlatform(x) {
        // Difference in y from height of prev platform
        if (this.latestPlatform) {
            var offset;
            if (this.latestPlatform.y >= this.gameData.maxPlatformHeight && this.latestPlatform.y <= this.gameData.minPlatformHeight) {
                offset = Phaser.Math.Between(-1, 1) * 50;
            } else if (this.latestPlatform.y <= this.gameData.maxPlatformHeight) {
                offset = 50;
            } else if (this.latestPlatform.y >= this.gameData.minPlatformHeight) {
                offset = -50;
            }
            this.latestPlatform = this.platforms.create(x, this.latestPlatform.y + offset, 'ground');
        } else {
            this.latestPlatform = this.platforms.create(x, 400, 'ground');
        }
        this.latestPlatform.setOrigin(0.5,0);
    }

    spawnEnemy() {
        var direction = Phaser.Math.Between(0, 1);
        if (direction == 1) {
            // Enemy start by going up
            this.latestEnemy = this.enemies.create(this.latestPlatform.x, this.latestPlatform.y - 200, 'enemy');
            this.tweens.add({
                targets: this.latestEnemy,
                y: this.latestPlatform.y -50,
                duration: 2000,
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: true
            });

        } else {
            // Enemy starts by going down
            this.latestEnemy = this.enemies.create(this.latestPlatform.x, this.latestPlatform.y - 50, 'enemy');
            this.tweens.add({
                targets: this.latestEnemy,
                y: this.latestPlatform.y - 200,
                duration: 2000,
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: true
            });
        }
        // Implements the sneaky bug
        this.changedExisting = false;
        if (this.gameData.enemiesVisible == false) {
            this.latestEnemy.setTintFill(0x55AA00);
            // Changes the colour of any bugs that spawned before bug was picked up
            if (this.changedExisting == false) {
                for (var i=0; i<this.enemies.children.size; i++) {
                    this.enemies.children.entries[i].setTintFill(0x55AA00);
                }
                this.changedExisting = true;
            }
        }
        this.latestEnemy.anims.play('enemy', true);
        this.latestEnemy.setSize(64, 64, true);
    }

    spawnPickup() {
        var offset = Phaser.Math.Between((-this.latestPlatform.width/2)+16, (this.latestPlatform.width/2)-16);
        this.pickup = this.pickups.create(this.latestPlatform.x + offset, this.latestPlatform.y - 50, 'bug');
        this.pickup.anims.play('bug', true);
        this.pickup.bugID = Phaser.Math.Between(0, this.bugsJSON.length-1);
        this.pickup.setTintFill(this.bugsJSON[this.pickup.bugID].colour);
        this.tweens.add({
            targets: this.pickup,
            y: this.latestPlatform.y - 40,
            duration: 2000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true
        });
    }

    collectPickup(player, pickup) {
        this.pickupSound.play();
        pickup.destroy();
        // TODO Transition goes here
        this.player.bugsCollected[pickup.bugID] = true;
        // Apply effect of bug
        eval(this.bugsJSON[pickup.bugID].effect);
        this.player.sprite.setBounce(this.player.bounce);
    }

    getDistanceToClosestEnemy() {
        var distance;
        var shortestDistance = 10000; // Arbitrarily large number, there should typically be an enemy closer than this
        for (var i=0; i<this.enemies.children.size; i++) {
            distance = Math.abs(this.player.sprite.x - this.enemies.children.entries[i].x);
            if (distance < shortestDistance) {
                shortestDistance = distance;
            }
        }
        return shortestDistance;
    }
}

function playenemy() {
    // Play enemy sound when enemies are nearby
    var distance = this.getDistanceToClosestEnemy();
    if (distance < 300 && this.player.alive) {
        this.enemy.play();
    }
}
