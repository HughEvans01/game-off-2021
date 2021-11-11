class BugCollection extends Phaser.Scene {

    constructor () {
        super('BugCollection');
    }

    init() {
    
    }

    preload() {
        this.load.image('star', 'assets/star.png');
        this.load.json('bugs', 'bugs.json');
    }

    create(data) {
        this.pickups = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });

        this.bugsJSON = this.cache.json.get('bugs');
        var gameStart = this.add.text(725, 575, 'BACK', { fontFamily: 'font1', fontSize: '32px' });
        gameStart.setOrigin(0.5,0.5);
        gameStart.setInteractive();
        gameStart.on('pointerdown', () => {
            this.scene.start("Menu");
        });

        // Display all bugs in a grid with collected bugs in colour
        this.bugCollection = JSON.parse(window.localStorage.getItem('bugCollection'));
        console.log(this.bugCollection);
        var x = 50;
        var y = 50;
        var bug = null;
        for (var i=0; i<this.bugsJSON.length; i++) {
            bug = this.bugsJSON[i];
            var pickup = this.pickups.create(x, y, 'star');
            if (this.bugCollection.includes(i)) {
                pickup.setTintFill(bug.colour);
            } else {
                pickup.setTintFill("0x959aa1");
            }
            x = x + 50;
            if (x > 300) {
                x = 50;
                y = y + 50;
            }
        }
    }

    update(time, delta) {

    }
}