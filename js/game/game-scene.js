// ========================================
// FlipMind - Phaser scene
// ========================================

// Phaser is a third-party game engine loaded with a <script> tag in
// game.html, before this module runs, so it is available as a global.

/**
 * The Phaser scene that the board and the mascot are drawn in.
 * It loads the mascot sprite sheet, then reports that it is ready.
 */
export class GameScene extends Phaser.Scene {
    constructor(onReady) {
        super("GameScene");
        this.onReady = onReady;
    }

    // Load the sprite sheet: 12 frames of 96 x 96 pixels in one row
    preload() {
        this.load.spritesheet("mascot", "../images/mascot-spritesheet.png", {
            frameWidth: 96,
            frameHeight: 96
        });
    }

    create() {
        this.onReady(this);
    }
}
