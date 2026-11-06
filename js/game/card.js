// ========================================
// FlipMind - Memory card
// ========================================

// Card colours for each level theme (fill and border)
const THEME_COLOURS = Object.freeze({
    arcade: { fill: 0x202638, border: 0x5ea0ff },
    nature: { fill: 0x1b2b3d, border: 0x5ea0ff },
    fruit: { fill: 0x2a2140, border: 0xa66cff },
    animals: { fill: 0x2e2030, border: 0xff8fa3 },
    colours: { fill: 0x24244a, border: 0x7b7cff }
});

const REVEALED_COLOURS = { fill: 0x263b68, border: 0x7b7cff };
const MATCHED_COLOURS = { fill: 0x173a3a, border: 0x36d6b0 };

// Length of each half of the flip animation (ms)
const FLIP_TIME = 120;

/**
 * One card on the board, drawn with Phaser. The card is a container
 * holding a rounded rectangle and a text label, and flips with a tween.
 */
export class Card {
    constructor(scene, { symbol, x, y, size, theme, onClick }) {
        this.scene = scene;
        this.symbol = symbol;
        this.size = size;
        this.themeColours = THEME_COLOURS[theme] || THEME_COLOURS.arcade;
        this.revealed = false;
        this.matched = false;
        this.hovered = false;

        this.background = scene.add.graphics();

        this.label = scene.add.text(0, 0, "?", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.round(size * 0.4)}px`,
            color: "#ffffff",
            padding: { y: 6 }
        }).setOrigin(0.5);

        this.container = scene.add.container(x, y, [this.background, this.label]);
        this.container.setSize(size, size);
        this.container.setInteractive({ useHandCursor: true });

        this.container.on("pointerdown", () => onClick(this));

        this.container.on("pointerover", () => {
            this.hovered = true;
            this.#draw();
        });

        this.container.on("pointerout", () => {
            this.hovered = false;
            this.#draw();
        });

        this.#draw();
    }

    get isRevealed() {
        return this.revealed;
    }

    get isMatched() {
        return this.matched;
    }

    // Turn the card face up
    reveal() {
        this.revealed = true;
        this.#flip(this.symbol);
    }

    // Turn the card face down
    hide() {
        this.revealed = false;
        this.#flip("?");
    }

    // Keep the card face up once its pair has been found
    markMatched() {
        this.matched = true;
        this.container.disableInteractive();
        this.#draw();
    }

    // Remove the card from the scene
    destroy() {
        this.scene.tweens.killTweensOf(this.container);
        this.container.destroy();
    }

    // Squash the card to nothing, change its face, then grow it back
    #flip(text) {
        this.scene.tweens.killTweensOf(this.container);

        this.scene.tweens.add({
            targets: this.container,
            scaleX: 0,
            duration: FLIP_TIME,
            ease: "Sine.easeIn",
            onComplete: () => {
                this.label.setText(text);
                this.#draw();

                this.scene.tweens.add({
                    targets: this.container,
                    scaleX: 1,
                    duration: FLIP_TIME,
                    ease: "Sine.easeOut"
                });
            }
        });
    }

    // Draw the card background for its current state
    #draw() {
        let colours = this.themeColours;

        if (this.matched) {
            colours = MATCHED_COLOURS;
        } else if (this.revealed) {
            colours = REVEALED_COLOURS;
        }

        const half = this.size / 2;
        const border = this.hovered && !this.matched ? 0x8b8cff : colours.border;

        this.background.clear();
        this.background.fillStyle(colours.fill, 1);
        this.background.fillRoundedRect(-half, -half, this.size, this.size, 12);
        this.background.lineStyle(2, border, 1);
        this.background.strokeRoundedRect(-half, -half, this.size, this.size, 12);
    }
}
