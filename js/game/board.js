// ========================================
// FlipMind - Game board
// ========================================

import { Card } from "./card.js";
import { GameScene } from "./game-scene.js";
import { Mascot } from "./mascot.js";

// Size of the Phaser canvas and its layout (in game pixels)
const WIDTH = 840;
const MASCOT_AREA = 110;
const GAP = 12;
const MAX_CARD_SIZE = 112;

/**
 * Creates the Phaser game and the shuffled grid of cards for a level.
 * The canvas is resized to fit the number of rows of each level, and
 * Phaser scales it to the width of the page.
 */
export class Board {
    constructor(element) {
        this.cards = [];
        this.scene = null;
        this.mascot = null;

        // Resolves once Phaser has started and loaded the sprite sheet
        this.ready = new Promise((resolve) => {
            const scene = new GameScene((readyScene) => {
                this.scene = readyScene;
                this.mascot = new Mascot(readyScene, WIDTH / 2, MASCOT_AREA / 2);
                resolve(this);
            });

            this.game = new Phaser.Game({
                type: Phaser.AUTO,
                parent: element,
                width: WIDTH,
                height: MASCOT_AREA,
                transparent: true,
                banner: false,
                // The game makes its own sound effects (sound-effects.js)
                audio: { noAudio: true },
                scale: { mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT },
                scene
            });
        });
    }

    // Fisher-Yates shuffle
    static shuffle(items) {
        for (let i = items.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));

            [items[i], items[randomIndex]] = [items[randomIndex], items[i]];
        }

        return items;
    }

    // Build two shuffled cards for every symbol of the level
    build(config, onCardClick) {
        this.clear();

        const symbols = Board.shuffle([
            ...config.symbols.slice(0, config.pairs),
            ...config.symbols.slice(0, config.pairs)
        ]);

        const columns = config.columns;
        const rows = Math.ceil(symbols.length / columns);
        const size = Math.min(MAX_CARD_SIZE, (WIDTH - GAP * (columns - 1)) / columns);
        const gridWidth = columns * size + GAP * (columns - 1);
        const left = (WIDTH - gridWidth) / 2 + size / 2;
        const top = MASCOT_AREA + size / 2;

        this.scene.scale.setGameSize(WIDTH, MASCOT_AREA + rows * size + GAP * (rows - 1));

        this.cards = symbols.map((symbol, index) => {
            return new Card(this.scene, {
                symbol,
                x: left + (index % columns) * (size + GAP),
                y: top + Math.floor(index / columns) * (size + GAP),
                size,
                theme: config.theme,
                onClick: onCardClick
            });
        });
    }

    // Remove every card, leaving only the mascot, ready for the next level
    clear() {
        this.cards.forEach((card) => card.destroy());
        this.cards = [];
        this.scene.scale.setGameSize(WIDTH, MASCOT_AREA);
    }

    // True if the card belongs to the board currently on screen
    contains(card) {
        return this.cards.includes(card);
    }
}
