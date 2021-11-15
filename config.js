// Ensure fonts are loaded before starting game
document.fonts.ready.then(function(font_face_set) {
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scale: {
            mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 600 },
                debug: false
            }
        },
        scene: [ Menu, Game, BugCollection, Options ]
    };

    new Phaser.Game(config);
});