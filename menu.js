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

        // Set game options to default if there are no game options already set
        this.gameOptions = JSON.parse(window.localStorage.getItem('gameOptions'));
        if (!this.gameOptions) {
            var gameOptions = {
                UIScale: 1.1,
            };
            this.gameOptions = gameOptions;
            window.localStorage.setItem('gameOptions', JSON.stringify(this.gameOptions));
        }

        // Set high score to zero if it hasn't already been set
        this.highScore = JSON.parse(window.localStorage.getItem('highScore'));
        if (!this.highScore) {
            this.highScore = 0;
            window.localStorage.setItem('highScore', JSON.stringify(this.highScore));
        }

        this.gameOptions = JSON.parse(window.localStorage.getItem('gameOptions'));

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        var gameStart = this.add.text(screenCenterX, 250, 'PLAY GAME', { fontFamily: 'font1', fontSize: (32*this.gameOptions.UIScale)+'px' });
        gameStart.setOrigin(0.5,0.5);
        gameStart.setInteractive();
        gameStart.on('pointerdown', () => {
            this.scene.start("Game");
        });
        var collection = this.add.text(screenCenterX, 250 + (50*this.gameOptions.UIScale), 'COLLECTION', { fontFamily: 'font1', fontSize: (32*this.gameOptions.UIScale)+'px' });
        collection.setOrigin(0.5,0.5);
        collection.setInteractive();
        collection.on('pointerdown', () => {
            this.scene.start("BugCollection");
        });
        var options = this.add.text(screenCenterX, 250 + (100*this.gameOptions.UIScale), 'OPTIONS', { fontFamily: 'font1', fontSize: (32*this.gameOptions.UIScale)+'px' });
        options.setOrigin(0.5,0.5);
        options.setInteractive();
        options.on('pointerdown', () => {
            this.scene.start("Options");
        });

         var newHighScore = this.add.text(screenCenterX,  500+ (10*this.gameOptions.UIScale), "HIGH SCORE: " + this.highScore + "m", { fontFamily: 'font2', fontSize: (16*this.gameOptions.UIScale)+'px' });
         newHighScore.setOrigin(0.5,0.5);
    }

    update(time, delta) {

    }
}