class Game extends Phaser.Scene {

    constructor () {
        super('Game');
    }

    init() {
        this.graphics;
        // Used to prepare data
        this.gameData = {
            maxObjects: 25,
            minPlatformHeight: 400,
            maxPlatformHeight: 200,
            mobile: false,
            UIScale: 1.1,
            menuOpen: false,
        };
        this.gameData.mobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('left', 'assets/left.png');
        this.load.image('up', 'assets/up.png');
        this.load.image('right', 'assets/right.png');
        this.load.image('pause', 'assets/pause.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.json('bugs', 'bugs.json');
    }

    create(data) {
        this.bugsJSON = this.cache.json.get('bugs');

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
        this.platforms.create(400, 400, 'ground');
        this.platforms.create(1000, 400, 'ground');

        // Display distance travelled
        this.distanceTraveled = this.add.text(10, 0, '0', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: '32px' });
        this.distanceTraveled.setScrollFactor(0);

        // Spawn the player
        this.player = {
            sprite: null,
            speed: 300,
            jump: 330,
            bounce: 0,
            distanceTraveled: 0,
            bugsCollected: [],
            alive: true
        };
        this.player.sprite = this.physics.add.sprite(400, 360, 'dude');
        this.player.sprite.setBounce(this.player.bounce);
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
        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.gameData.mobile) {
            this.input.addPointer(2); // For multi-touch
            this.leftButton = this.add.image(800 - (144*this.gameData.UIScale), 600 - 49*this.gameData.UIScale, 'left');
            this.upButton = this.add.image(48*this.gameData.UIScale, 600 - 49*this.gameData.UIScale, 'up');
            this.rightButton = this.add.image(800 - 48*this.gameData.UIScale, 600 - 49*this.gameData.UIScale, 'right');
            this.leftButton.setScrollFactor(0);
            this.upButton.setScrollFactor(0);
            this.rightButton.setScrollFactor(0);
            this.leftButton.setScale(this.gameData.UIScale);
            this.upButton.setScale(this.gameData.UIScale);
            this.rightButton.setScale(this.gameData.UIScale);
            this.leftButton.setInteractive();
            this.upButton.setInteractive();
            this.rightButton.setInteractive();
            this.leftButton.on('pointerdown', () => { this.left_held = true; });
            this.leftButton.on('pointerup', () => { this.left_held = false; });
            this.upButton.on('pointerdown', () => { this.jump_pressed = true; });
            this.rightButton.on('pointerdown', () => { this.right_held = true; });
            this.rightButton.on('pointerup', () => { this.right_held = false; });
        }
        this.pause = this.add.image(800-(37*this.gameData.UIScale), 37*this.gameData.UIScale, 'pause');
        this.pause.setScrollFactor(0);
        this.pause.setScale(this.gameData.UIScale);
        this.pause.setInteractive();
        this.pause.on('pointerdown', () => { this.toggleMenu(); });

        this.physics.add.collider(this.player.sprite, this.platforms);
        this.physics.add.overlap(this.player.sprite, this.pickups, this.collectPickup, null, this);
        this.physics.add.overlap(this.player.sprite, this.enemies, this.killPlayer, null, this);


    }   

    update(time, delta) {
        // TODO The below feels dumb, improve it?
        // Keep touch screen controls on top
        if (this.gameData.mobile) {
            this.children.bringToTop(this.leftButton);
            this.children.bringToTop(this.upButton);
            this.children.bringToTop(this.rightButton);
        }
        if (this.player.alive) {
            // Track player with camera
            if (this.player.sprite.y < 600) {
                this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
            }
            // Update distance travelled
            this.player.distanceTraveled = Math.round((this.player.sprite.x - 400)/100);
            if (this.player.distanceTraveled > 0) {
                this.distanceTraveled.setText(this.player.distanceTraveled);
            } else {
                this.distanceTraveled.setText("0");
            }
            // Move player left and right
            if (this.cursors.left.isDown || this.left_held) {
                this.player.sprite.setVelocityX(-this.player.speed);
                this.player.sprite.anims.play('left', true);
            } else if (this.cursors.right.isDown || this.right_held) {
                this.player.sprite.setVelocityX(this.player.speed,);
                this.player.sprite.anims.play('right', true);
            } else {
                this.player.sprite.setVelocityX(0);
                this.left_pressed = false;
                this.right_pressed = false;
                this.player.sprite.anims.play('turn');
            }
            // Jump
            if ((this.cursors.up.isDown || this.jump_pressed) && this.player.sprite.body.touching.down) {
                this.player.sprite.setVelocityY(-this.player.jump);
                this.jump_pressed = false;
            }
            // Kill player if they fall out of the level
            if (this.player.sprite.y > 600) {
                this.killPlayer();
            }
        }
        // Generate level
        this.totalPlatforms = this.platforms.children.entries.length;
        this.latestPlatform = this.platforms.children.entries[this.totalPlatforms-1];
        // TODO Logic for spawning platforms and entities is stupid, improve it
        var a = this.latestPlatform.x;
        var b = this.player.sprite.x;
        if ((a - b) < 2000) {
            this.spawnPlatform();
            var entity = Phaser.Math.Between(0, 9);
            if (entity < 4) {
                this.spawnEnemy();
            } else if (entity == 9){
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
    }

    toggleMenu() {
        if (!this.gameData.menuOpen) {
            this.graphics = this.add.graphics();
            this.graphics.fillStyle(0x000000, 1);
            this.graphics.fillRoundedRect(this.player.sprite.x-200, this.player.sprite.y-150, 400, 300, 32);
            this.score = this.add.text(this.player.sprite.x,  this.player.sprite.y-50, this.player.distanceTraveled, { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: '32px' });
            this.score.setOrigin(0.5,0.5);
            this.playAgain = this.add.text(this.player.sprite.x, this.player.sprite.y, 'PLAY AGAIN', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: '32px' });
            this.playAgain.setOrigin(0.5,0.5);
            this.playAgain.setInteractive();
            this.playAgain.on('pointerdown', () => {
                this.scene.restart();
            });
            this.playAgain.on('pointerdown', () => {
                this.scene.pause("Menu");
            });
            this.backToMenu = this.add.text(this.player.sprite.x, this.player.sprite.y+50, 'BACK TO MENU', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: '32px' });
            this.backToMenu.setOrigin(0.5,0.5);
            this.backToMenu.setInteractive();
            this.backToMenu.on('pointerdown', () => {
                this.scene.start("Menu");
            });
            this.gameData.menuOpen = true;
        } else {
            this.graphics.destroy();
            this.score.destroy();
            this.playAgain.destroy();
            this.backToMenu.destroy();
            this.gameData.menuOpen = false;
        }
    }

    spawnPlatform() {
        // Difference in y from height of prev platform
        var offset;
        if (this.latestPlatform.y >= this.gameData.maxPlatformHeight && this.latestPlatform.y <= this.gameData.minPlatformHeight) {
            offset = Phaser.Math.Between(-1, 1) * 50;
        } else if (this.latestPlatform.y <= this.gameData.maxPlatformHeight) {
            offset = 50;
        } else if (this.latestPlatform.y >= this.gameData.minPlatformHeight) {
            offset = -50;
        }
        // TODO This line is very, very stupid. Replace it with something better
        this.platforms.create(this.latestPlatform.x + 600, this.latestPlatform.y + offset, 'ground');
        // Destroy platforms that are a long way behind the player
        if (this.totalPlatforms > this.gameData.maxObjects) {
           this.platforms.children.entries[0].destroy();
        }
        this.totalPlatforms = this.platforms.children.entries.length;
        this.latestPlatform = this.platforms.children.entries[this.totalPlatforms-1];
    }

    spawnEnemy() {
        this.latestEnemy = this.enemies.create(this.latestPlatform.x, this.latestPlatform.y - 50, 'bomb'); 
        this.totalEnemies = this.enemies.children.entries.length;
        // Destroy enemies that are a long way behind the player
        if (this.totalEnemies > this.gameData.maxObjects) {
            this.enemies.children.entries[0].destroy();
        }
        this.tweens.add({
            targets: this.latestEnemy,
            y: this.latestPlatform.y - 200,
            duration: 2000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true
        });
    }

    spawnPickup() {
        var offset = this.latestPlatform.width/2;
        this.pickup = this.pickups.create(this.latestPlatform.x + offset, this.latestPlatform.y - 50, 'star');
        this.totalPickups = this.pickups.children.entries.length;
        this.pickup.bugID = Phaser.Math.Between(0, this.bugsJSON.length-1);
        this.pickup.setTintFill(this.bugsJSON[this.pickup.bugID].colour);
        // Destroy pickups that are a long way behind the player
        if (this.totalPickups > this.gameData.maxObjects) {
            this.pickups.children.entries[0].destroy();
        }
        this.tweens.add({
            targets: this.pickup,
            x: this.latestPlatform.x - offset,
            duration: 2000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true
        });
    }

    collectPickup(player, pickup) {
        pickup.destroy();
        // TODO Transition goes here
        this.player.bugsCollected.push(pickup.bugID);
        window.localStorage.setItem('bugCollection', JSON.stringify(this.player.bugsCollected));
        // Apply effect of bug
        eval(this.bugsJSON[pickup.bugID].effect);
        this.player.sprite.setBounce(this.player.bounce);
    }
}