class Options extends Phaser.Scene {

    constructor () {
        super('Options');
    }

    init() {
    
    }

    preload() {
        this.load.image('up', 'assets/up.png');
        this.load.image('down', 'assets/down.png');
    }

    create(data) {
        this.gameOptions = JSON.parse(window.localStorage.getItem('gameOptions'));

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        var gameStart = this.add.text(725, 575, 'BACK', { fontFamily: 'font1', fontSize: '32px' });
        gameStart.setInteractive();
        gameStart.on('pointerdown', () => {
            window.localStorage.setItem('gameOptions', JSON.stringify(this.gameOptions));
            this.scene.start("Menu");
        });

        var UIScaleLabel = this.add.text(screenCenterX-100, 200, 'UI SCALE', { fontFamily: 'font2', fontSize: '32px' });
        UIScaleLabel.setOrigin(0.5,0.5);

        this.UIScaleValue = this.add.text(screenCenterX+50, 200, this.UIScale, { fontFamily: 'font2', fontSize: '32px' });
        this.UIScaleValue.setOrigin(0.5,0.5);

        this.upButton = this.add.image(screenCenterX+125, 200, 'up');
        this.upButton.setInteractive();
        this.upButton.setScale(0.25);
        this.upButton.on('pointerdown', () => {
            if (this.gameOptions.UIScale < 2) {
                this.gameOptions.UIScale = this.gameOptions.UIScale + 0.1;
            }
        });

        this.downButton = this.add.image(screenCenterX+175, 200, 'down');
        this.downButton.setInteractive();
        this.downButton.setScale(0.25);
        this.downButton.on('pointerdown', () => {
            if (this.gameOptions.UIScale > 1) {
                this.gameOptions.UIScale = this.gameOptions.UIScale - 0.1;
            }
        });

    }

    update(time, delta) {
        console.log(this.UIScale);
        this.UIScaleValue.setText(Math.round(this.gameOptions.UIScale*10)/10);
    }
}