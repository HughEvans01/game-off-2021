class Options extends Phaser.Scene {

    constructor () {
        super('Options');
    }

    init() {
    
    }

    preload() {
        this.load.image('up', 'assets/sprites/up.png');
        this.load.image('down', 'assets/sprites/down.png');
        this.load.image('unchecked', 'assets/sprites/unchecked.png');
        this.load.image('checked', 'assets/sprites/checked.png');
    }

    create(data) {
        this.gameOptions = JSON.parse(window.localStorage.getItem('gameOptions'));

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        var gameStart = this.add.text(725, 575, 'BACK', { fontFamily: 'font1', fontSize: (32*this.gameOptions.UIScale)+'px' });
        gameStart.setInteractive();
        gameStart.setOrigin(0.5,0.5);
        gameStart.on('pointerdown', () => {
            window.localStorage.setItem('gameOptions', JSON.stringify(this.gameOptions));
            this.scene.start("Menu");
        });

        // UI Scale options
        var UIScaleLabel = this.add.text(screenCenterX-120*this.gameOptions.UIScale, 200, 'UI SCALE', { fontFamily: 'font2', fontSize: (32*this.gameOptions.UIScale)+'px' });
        UIScaleLabel.setOrigin(0.5,0.5);

        this.UIScaleValue = this.add.text(screenCenterX+50*this.gameOptions.UIScale, 200, this.UIScale, { fontFamily: 'font2', fontSize: (32*this.gameOptions.UIScale)+'px' });
        this.UIScaleValue.setOrigin(0.5,0.5);

        this.uiScaleUpButton = this.add.image(screenCenterX+125*this.gameOptions.UIScale, 200, 'up');
        this.uiScaleUpButton.setInteractive();
        this.uiScaleUpButton.setScale(0.4*this.gameOptions.UIScale);
        this.uiScaleUpButton.on('pointerdown', () => {
            if (this.gameOptions.UIScale < 2) {
                this.gameOptions.UIScale = this.gameOptions.UIScale + 0.1;
            }
        });

        this.uiScaleDownButton = this.add.image(screenCenterX+175*this.gameOptions.UIScale, 200, 'down');
        this.uiScaleDownButton.setInteractive();
        this.uiScaleDownButton.setScale(0.4*this.gameOptions.UIScale);
        this.uiScaleDownButton.on('pointerdown', () => {
            if (this.gameOptions.UIScale > 1) {
                this.gameOptions.UIScale = this.gameOptions.UIScale - 0.1;
            }
        });

        // Volume options
        this.volumeLabel = this.add.text(screenCenterX-120*this.gameOptions.UIScale, 300, 'VOLUME  ', { fontFamily: 'font2', fontSize: (32*this.gameOptions.UIScale)+'px' });
        this.volumeLabel.setOrigin(0.5,0.5);

        this.volumeValue = this.add.text(screenCenterX+50*this.gameOptions.UIScale, 300, this.UIScale, { fontFamily: 'font2', fontSize: (32*this.gameOptions.UIScale)+'px' });
        this.volumeValue.setOrigin(0.5,0.5);

        this.volumeUpButton = this.add.image(screenCenterX+125*this.gameOptions.UIScale, 300, 'up');
        this.volumeUpButton.setInteractive();
        this.volumeUpButton.setScale(0.4*this.gameOptions.UIScale);
        this.volumeUpButton.on('pointerdown', () => {
            if (this.gameOptions.volume < 1) {
                this.gameOptions.volume = this.gameOptions.volume + 0.1;
            }

        });

        this.volumeDownButton = this.add.image(screenCenterX+175*this.gameOptions.UIScale, 300, 'down');
        this.volumeDownButton.setInteractive();
        this.volumeDownButton.setScale(0.4*this.gameOptions.UIScale);
        this.volumeDownButton.on('pointerdown', () => {
            if (this.gameOptions.volume > 0) {
                this.gameOptions.volume = this.gameOptions.volume - 0.1;
            }

        });

        // Touch screen controls options
        var mobileLabel = this.add.text(screenCenterX-40*this.gameOptions.UIScale, 400, 'TOUCH CONTROLS', { fontFamily: 'font2', fontSize: (32*this.gameOptions.UIScale)+'px' });
        mobileLabel.setOrigin(0.5,0.5);

        if (this.gameOptions.mobile) {
            this.mobileCheckBox = this.add.image(screenCenterX+175*this.gameOptions.UIScale, 400, 'checked');
        } else {
            this.mobileCheckBox = this.add.image(screenCenterX+175*this.gameOptions.UIScale, 400, 'unchecked');
        }
        
        this.mobileCheckBox.setInteractive();
        this.mobileCheckBox.setScale(0.4*this.gameOptions.UIScale);
        this.mobileCheckBox.on('pointerdown', () => {
            if (this.gameOptions.mobile) {
                this.gameOptions.mobile = false;
                this.mobileCheckBox.setTexture('unchecked');
            } else {
                this.gameOptions.mobile = true;
                this.mobileCheckBox.setTexture('checked');
            }

        });


    }

    update(time, delta) {
        this.UIScaleValue.setText(Math.round((this.gameOptions.UIScale/2)*200)+"%");
        this.volumeValue.setText(Math.round((this.gameOptions.volume)*100)+"%");
    }
}