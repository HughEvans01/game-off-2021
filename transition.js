class Transition extends Phaser.Scene {

    constructor () {
        super('Transition');
    }

    init() {
    
    }

    preload() {

    }

    create(data) {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        var text1 = this.add.text(screenCenterX, 200, 'YOU DIED', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: '100px' });
        text1.setOrigin(0.5,0.5);
        var text2 = this.add.text(screenCenterX, 400, 'PLAY AGAIN', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: '32px' });
        text2.setOrigin(0.5,0.5);
        text2.setInteractive();
        text2.on('pointerdown', () => {
            this.scene.pause("Transition");
            this.scene.start("Game");
        });
    }

    update(time, delta) {

    }
}