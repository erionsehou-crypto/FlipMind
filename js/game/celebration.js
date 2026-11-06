// ========================================
// FlipMind - Win celebrations
// ========================================

import { CelebrationScene } from "./celebration-scene.js";

/**
 * Plays the confetti, stars and win banner in a second, transparent
 * Phaser game that covers the page. The layer ignores the mouse
 * (pointer-events: none in the CSS), so buttons and links still work.
 */
export class Celebration {
    constructor(element) {
        // Players who ask for less motion only see the banner
        this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        this.ready = new Promise((resolve) => {
            this.game = new Phaser.Game({
                type: Phaser.AUTO,
                parent: element,
                transparent: true,
                banner: false,
                audio: { noAudio: true },
                input: { keyboard: false, mouse: false, touch: false, gamepad: false },
                scale: { mode: Phaser.Scale.RESIZE },
                scene: new CelebrationScene(resolve)
            });
        });
    }

    // origin: where the stars start (the mascot's position on the page)
    levelComplete(level, origin) {
        this.ready.then((scene) => scene.levelComplete(level, origin, this.reduceMotion));
    }

    gameComplete(finalLevel, origin) {
        this.ready.then((scene) => scene.gameComplete(finalLevel, origin, this.reduceMotion));
    }

    clear() {
        this.ready.then((scene) => scene.clearEffects());
    }
}
