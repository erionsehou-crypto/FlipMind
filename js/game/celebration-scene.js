// ========================================
// FlipMind - Celebration effects scene
// ========================================

// Confetti and star colours that match FlipMind's blue and purple theme
const CONFETTI_COLOURS = [0x5ea0ff, 0x8bb8ff, 0x7b7cff, 0xa66cff, 0xc9a7ff, 0x36d6b0, 0xff8fa3];
const STAR_COLOURS = [0xffffff, 0xffe08a, 0x8bb8ff, 0xc9a7ff];

/**
 * A transparent Phaser scene laid over the whole page. It draws the
 * confetti, the stars and the "LEVEL COMPLETED!" / "YOU WIN!" banner.
 * It only draws: it never takes clicks, so the page keeps working.
 */
export class CelebrationScene extends Phaser.Scene {
    constructor(onReady) {
        super("CelebrationScene");
        this.onReady = onReady;
        this.banner = null;
    }

    create() {
        CelebrationScene.#createTextures(this);

        // Confetti falling from the top of the screen
        this.rain = this.add.particles(0, -20, "confetti", {
            x: { onEmit: () => Phaser.Math.Between(0, this.scale.width) },
            speedX: { min: -70, max: 70 },
            speedY: { min: 120, max: 260 },
            gravityY: 90,
            lifespan: { min: 3800, max: 5200 },
            ...CelebrationScene.#confettiLook(),
            emitting: false
        });

        // Confetti fired up from the bottom corners (final level only)
        this.leftCannon = this.#createCannon(-80, -50);
        this.rightCannon = this.#createCannon(-130, -100);

        // Stars that burst out in every direction
        this.stars = this.add.particles(0, 0, "star", {
            speed: { min: 120, max: 380 },
            angle: { min: 0, max: 360 },
            gravityY: 160,
            lifespan: { min: 900, max: 1500 },
            scale: { start: 1.1, end: 0.2 },
            alpha: { start: 1, end: 0 },
            rotate: { start: 0, end: 270 },
            tint: STAR_COLOURS,
            emitting: false
        });

        this.onReady(this);
    }

    // A short celebration for a completed level
    levelComplete(level, origin, reduceMotion) {
        this.clearEffects();
        this.#showBanner("LEVEL COMPLETED!", `Level ${level + 1} unlocked`, 64, 2600, reduceMotion);

        if (reduceMotion) {
            return;
        }

        this.#startRain(2, 1000);
        this.stars.explode(18, origin.x, origin.y);
    }

    // A bigger celebration for finishing the final level
    gameComplete(finalLevel, origin, reduceMotion) {
        this.clearEffects();
        this.#showBanner("YOU WIN!", `All ${finalLevel} levels complete - Memory Master!`, 110, 4000, reduceMotion);

        if (reduceMotion) {
            return;
        }

        this.#startRain(4, 2600);
        this.stars.explode(28, origin.x, origin.y);

        // Three rounds of confetti cannons and stars around the banner
        [0, 700, 1400].forEach((delay) => {
            this.time.delayedCall(delay, () => {
                const { width, height } = this.scale;

                this.leftCannon.explode(45, 0, height);
                this.rightCannon.explode(45, width, height);
                this.stars.explode(14, Phaser.Math.Between(width * 0.25, width * 0.75), height * 0.4);
            });
        });
    }

    // Remove every effect straight away, e.g. when a new level starts
    clearEffects() {
        this.time.removeAllEvents();

        [this.rain, this.leftCannon, this.rightCannon, this.stars].forEach((emitter) => {
            emitter.stop();
            emitter.killAll();
        });

        if (this.banner) {
            this.tweens.killTweensOf(this.banner);
            this.banner.destroy();
            this.banner = null;
        }
    }

    #startRain(quantity, duration) {
        this.rain.setQuantity(quantity);
        this.rain.start();
        this.time.delayedCall(duration, () => this.rain.stop());
    }

    // Confetti shot upwards at an angle between min and max (degrees)
    #createCannon(min, max) {
        return this.add.particles(0, 0, "confetti", {
            angle: { min, max },
            speed: { min: 550, max: 950 },
            gravityY: 650,
            lifespan: { min: 2600, max: 3400 },
            ...CelebrationScene.#confettiLook(),
            emitting: false
        });
    }

    // The big title in a dark rounded panel: it pops in, waits, then fades away
    #showBanner(title, subtitle, titleSize, showTime, reduceMotion) {
        const { width, height } = this.scale;
        const subtitleSize = Math.round(titleSize * 0.28);

        const titleText = this.add.text(0, -subtitleSize * 0.7, title, {
            fontFamily: "Orbitron, Arial, sans-serif",
            fontSize: `${titleSize}px`,
            fontStyle: "900",
            color: "#ffffff",
            stroke: "#262a66",
            strokeThickness: Math.max(4, Math.round(titleSize / 12)),
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5);

        titleText.setShadow(0, 0, "#7b7cff", 22, true, true);

        // White at the top fading to FlipMind blue at the bottom
        const gradient = titleText.context.createLinearGradient(0, 0, 0, titleText.height);
        gradient.addColorStop(0.2, "#ffffff");
        gradient.addColorStop(0.9, "#8bb8ff");
        titleText.setFill(gradient);

        const subtitleText = this.add.text(0, titleText.height / 2, subtitle, {
            fontFamily: "Orbitron, Arial, sans-serif",
            fontSize: `${subtitleSize}px`,
            fontStyle: "700",
            color: "#c9a7ff"
        }).setOrigin(0.5);

        // The panel goes from the top of the title to below the subtitle
        const top = titleText.y - titleText.height / 2;
        const panelWidth = Math.max(titleText.width, subtitleText.width) + 48;
        const panelHeight = subtitleText.y + subtitleText.height / 2 + 16 - top;
        const panel = this.add.graphics();

        panel.fillStyle(0x0f1220, 0.82);
        panel.fillRoundedRect(-panelWidth / 2, top, panelWidth, panelHeight, 18);
        panel.lineStyle(2, 0x7b7cff, 0.9);
        panel.strokeRoundedRect(-panelWidth / 2, top, panelWidth, panelHeight, 18);

        this.banner = this.add.container(width / 2, height * 0.4, [panel, titleText, subtitleText]);
        this.banner.setDepth(1);

        // Shrink the banner to fit narrow screens such as phones
        const fitScale = Math.min(1, (width - 24) / panelWidth);
        this.banner.setScale(fitScale);

        if (!reduceMotion) {
            this.banner.setScale(fitScale * 0.2);
            this.banner.setAlpha(0);

            this.tweens.add({
                targets: this.banner,
                scale: fitScale,
                alpha: 1,
                duration: 450,
                ease: "Back.easeOut"
            });
        }

        this.tweens.add({
            targets: this.banner,
            alpha: 0,
            y: height * 0.4 - 30,
            delay: showTime,
            duration: 450,
            ease: "Sine.easeIn",
            onComplete: () => {
                this.banner.destroy();
                this.banner = null;
            }
        });
    }

    // Spinning, fluttering coloured paper
    static #confettiLook() {
        return {
            rotate: { onEmit: () => Phaser.Math.Between(0, 360), onUpdate: (particle, key, t, value) => value + 4 },
            scaleY: { onUpdate: (particle, key, t) => Math.cos(t * 30 + particle.life) },
            alpha: { start: 1, end: 0, ease: "Quart.easeIn" },
            tint: CONFETTI_COLOURS
        };
    }

    // Draw the confetti and star shapes once and keep them as textures
    static #createTextures(scene) {
        const graphics = scene.add.graphics();

        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 12, 7);
        graphics.generateTexture("confetti", 12, 7);
        graphics.clear();

        // Five-pointed star: points alternate between outer and inner radius
        const points = [];

        for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? 9 : 4;
            const angle = -Math.PI / 2 + (i * Math.PI) / 5;

            points.push({ x: 9 + radius * Math.cos(angle), y: 9 + radius * Math.sin(angle) });
        }

        graphics.fillStyle(0xffffff, 1);
        graphics.fillPoints(points, true);
        graphics.generateTexture("star", 18, 18);
        graphics.destroy();
    }
}
