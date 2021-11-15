class BugCollection extends Phaser.Scene {

    constructor () {
        super('BugCollection');
    }

    init() {
    
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.spritesheet('bug', 'assets/bug.png', { frameWidth: 64, frameHeight: 64 });
        this.load.json('bugs', 'bugs.json');
    }

    create(data) {
        this.pickups = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });

        this.anims.create({
            key: 'bug',
            frames: this.anims.generateFrameNumbers('bug', { start: 0, end: 2 }),
            frameRate: 2,
            repeat: -1
        });

        this.background = this.add.image(400, 300, 'sky');

        this.bugsJSON = this.cache.json.get('bugs');
        var gameStart = this.add.text(725, 575, 'BACK', { fontFamily: 'font1', fontSize: '32px' });
        gameStart.setInteractive();
        gameStart.on('pointerdown', () => {
            this.scene.start("Menu");
        });

        // Display all bugs in a grid with collected bugs in colour
        this.bugCollection = JSON.parse(window.localStorage.getItem('bugCollection'));
        var x = 100;
        var y = 50;
        var bug = null;
        for (var i=0; i<this.bugsJSON.length; i++) {
            bug = this.bugsJSON[i];
            var pickup = this.pickups.create(x, y, 'bug');
            pickup.anims.play('bug', true);
            pickup.setOrigin(0.5,0.5);
            pickup.setScale(0.5);
            pickup.setTintFill("0x959aa1");
            if (this.bugCollection[i]) {
                pickup.setTintFill(bug.colour);
                var text = this.add.text(x, y+25, bug.name, { fontFamily: 'font2', fontSize: '16px' });
                text.setOrigin(0.5,0.5);
            }

            x = x + 200;
            if (x > 500) {
                x = 100;
                y = y + 50;
            }
        }
    }

    update(time, delta) {

    }
}