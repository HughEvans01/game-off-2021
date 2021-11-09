class Menu extends Phaser.Scene {

    constructor () {
        super('Menu');
    }

    init() {
    
    }

    preload() {

    }

    create(data) {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        var gameStart = this.add.text(screenCenterX, 300, 'PLAY GAME', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: '32px' });
        gameStart.setOrigin(0.5,0.5);
        gameStart.setInteractive();
        gameStart.on('pointerdown', () => {
            this.scene.pause("Menu");
            this.scene.start("Game");
        });
        var collection = this.add.text(screenCenterX, 350, 'COLLECTION', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: '32px' });
        collection.setOrigin(0.5,0.5);
        collection.setInteractive();
        collection.on('pointerdown', () => {
            // TODO Open collection goes here
        });
        var options = this.add.text(screenCenterX, 400, 'OPTIONS', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: '32px' });
        options.setOrigin(0.5,0.5);
        options.setInteractive();
        options.on('pointerdown', () => {
            // TODO Open options goes here
        });
    }

    update(time, delta) {

    }
}