class Menu extends Phaser.Scene {

    constructor () {
        super('Menu');
    }

    init() {
    
    }

    preload() {
        this.load.json('bugs', 'bugs.json');
    }

    create(data) {

        // Define an empty bug collection and save it in local storage if there isn't one already
        this.bugCollection = JSON.parse(window.localStorage.getItem('bugCollection'));
        if (!this.bugCollection) {
             this.bugsJSON = this.cache.json.get('bugs');
             var emptyBugCollection = [];
             for (var i=0; i<this.bugsJSON.length; i++) {
                emptyBugCollection.push(false);
             }
             this.bugCollection = emptyBugCollection;
             window.localStorage.setItem('bugCollection', JSON.stringify(this.bugCollection));
        }

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        var gameStart = this.add.text(screenCenterX, 300, 'PLAY GAME', { fontFamily: 'font1', fontSize: '32px' });
        gameStart.setOrigin(0.5,0.5);
        gameStart.setInteractive();
        gameStart.on('pointerdown', () => {
            this.scene.pause("Menu");
            this.scene.start("Game");
        });
        var collection = this.add.text(screenCenterX, 350, 'COLLECTION', { fontFamily: 'font1', fontSize: '32px' });
        collection.setOrigin(0.5,0.5);
        collection.setInteractive();
        collection.on('pointerdown', () => {
            this.scene.pause("Menu");
            this.scene.start("BugCollection");
        });
        var options = this.add.text(screenCenterX, 400, 'OPTIONS', { fontFamily: 'font1', fontSize: '32px' });
        options.setOrigin(0.5,0.5);
        options.setInteractive();
        options.on('pointerdown', () => {
            // TODO Open options goes here
        });
    }

    update(time, delta) {

    }
}