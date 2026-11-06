// ========================================
// FlipMind - Animated mascot
// ========================================

// Light blue tears that match the tear drawn on the sad frames
const TEAR_COLOUR = 0x8bd3ff;

// Bluish grey tint that makes the crying mascot look gloomy
const SAD_TINT = 0xb8c2e6;

/**
 * The FlipMind mascot, animated from a sprite sheet with Phaser.
 * Frames 0-3 are the idle loop, 4-7 cheer and 8-11 are sad.
 * After a short cheer or sad animation the mascot goes back to idle.
 * When a level ends the mascot celebrates (bounces with a big smile)
 * or cries (tears and a sad face) until reset() is called.
 */
export class Mascot {
    constructor(scene, x, y) {
        Mascot.#createAnimations(scene);
        Mascot.#createTearTexture(scene);

        this.scene = scene;
        this.homeX = x;
        this.homeY = y;
        this.state = "idle";

        this.sprite = scene.add.sprite(x, y, "mascot");
        this.sprite.play("mascot-idle");

        // One stream of tears for each eye, shown only while crying
        this.tears = [
            Mascot.#createTears(scene, this.sprite, -11, -1),
            Mascot.#createTears(scene, this.sprite, 11, 1)
        ];

        this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation) => {
            if (this.state === "crying" && animation.key === "mascot-sad") {
                this.sprite.play("mascot-crying");
            } else if (this.state === "idle") {
                this.sprite.play("mascot-idle");
            }
        });
    }

    // Found a pair
    cheer() {
        this.sprite.play("mascot-happy");
    }

    // Wrong pair
    sad() {
        this.sprite.play("mascot-sad");
    }

    // Level completed: jump up and down with a big smile.
    // The final level gives a longer, higher celebration.
    celebrate(isFinalLevel) {
        this.reset();
        this.state = "celebrating";
        this.sprite.play("mascot-celebrate");

        this.scene.tweens.add({
            targets: this.sprite,
            y: this.homeY - (isFinalLevel ? 9 : 7),
            scaleY: 1.06,
            scaleX: 0.95,
            duration: 190,
            ease: "Quad.easeOut",
            yoyo: true,
            repeat: isFinalLevel ? 9 : 5,
            onComplete: () => {
                if (this.state === "celebrating") {
                    this.sprite.setScale(1);
                    this.sprite.play("mascot-proud");
                }
            }
        });

        // A little happy wiggle while jumping
        this.scene.tweens.add({
            targets: this.sprite,
            angle: { from: -6, to: 6 },
            duration: 380,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: isFinalLevel ? 4 : 2,
            onComplete: () => this.sprite.setAngle(0)
        });
    }

    // Too many mistakes: a sad face, streams of tears and a slow sad sway
    cry() {
        this.reset();
        this.state = "crying";
        this.sprite.play("mascot-sad");
        this.sprite.setTint(SAD_TINT);

        this.scene.tweens.add({
            targets: this.sprite,
            y: this.homeY + 4,
            scaleY: 0.94,
            duration: 500,
            ease: "Sine.easeOut"
        });

        this.scene.tweens.add({
            targets: this.sprite,
            angle: { from: -4, to: 4 },
            duration: 900,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1
        });

        this.tears.forEach((tears) => tears.start());
    }

    // Back to the normal idle loop, e.g. when a level starts
    reset() {
        this.state = "idle";
        this.scene.tweens.killTweensOf(this.sprite);
        this.tears.forEach((tears) => {
            tears.stop();
            tears.killAll();
        });

        this.sprite.clearTint();
        this.sprite.setPosition(this.homeX, this.homeY);
        this.sprite.setScale(1);
        this.sprite.setAngle(0);
        this.sprite.play("mascot-idle");
    }

    // Where the mascot is on the page (in CSS pixels), used to start
    // the stars of the celebration at the mascot
    getScreenPosition() {
        const bounds = this.scene.game.canvas.getBoundingClientRect();
        const scale = bounds.width / this.scene.scale.width;

        return {
            x: bounds.left + this.homeX * scale,
            y: bounds.top + this.homeY * scale
        };
    }

    // Animations are defined once for the whole game
    static #createAnimations(scene) {
        if (scene.anims.exists("mascot-idle")) {
            return;
        }

        scene.anims.create({
            key: "mascot-idle",
            frames: scene.anims.generateFrameNumbers("mascot", { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });

        scene.anims.create({
            key: "mascot-happy",
            frames: scene.anims.generateFrameNumbers("mascot", { start: 4, end: 7 }),
            frameRate: 10,
            repeat: 1
        });

        scene.anims.create({
            key: "mascot-sad",
            frames: scene.anims.generateFrameNumbers("mascot", { start: 8, end: 11 }),
            frameRate: 6
        });

        // Level won: the cheer frames looped while the mascot jumps,
        // then a calmer smile until the next level starts
        scene.anims.create({
            key: "mascot-celebrate",
            frames: scene.anims.generateFrameNumbers("mascot", { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: "mascot-proud",
            frames: scene.anims.generateFrameNumbers("mascot", { frames: [5, 6] }),
            frameRate: 3,
            repeat: -1
        });

        // Level lost: the saddest frames (with the tear) looped slowly
        scene.anims.create({
            key: "mascot-crying",
            frames: scene.anims.generateFrameNumbers("mascot", { frames: [9, 10, 11, 10] }),
            frameRate: 3,
            repeat: -1
        });
    }

    // Draw a small tear drop once and keep it as a texture
    static #createTearTexture(scene) {
        if (scene.textures.exists("mascot-tear")) {
            return;
        }

        const graphics = scene.add.graphics();

        graphics.fillStyle(TEAR_COLOUR, 1);
        graphics.fillTriangle(4, 0, 0.5, 6, 7.5, 6);
        graphics.fillCircle(4, 7, 3.5);
        graphics.generateTexture("mascot-tear", 8, 11);
        graphics.destroy();
    }

    // Tears fall from under one eye; direction -1 is left, 1 is right
    static #createTears(scene, sprite, offsetX, direction) {
        const tears = scene.add.particles(0, 0, "mascot-tear", {
            speedX: { min: 15 * direction, max: 45 * direction },
            speedY: { min: -40, max: -10 },
            gravityY: 260,
            lifespan: 650,
            frequency: 140,
            scale: { start: 1, end: 0.6 },
            alpha: { start: 1, end: 0 },
            emitting: false
        });

        tears.startFollow(sprite, offsetX, 12);
        tears.setDepth(1);

        return tears;
    }
}
