// ========================================
// FlipMind - Sound effects
// ========================================

import { JsonStorage, STORAGE_KEYS } from "../storage.js";

/**
 * Short sound effects generated with the Web Audio API, so no audio
 * files are needed. Sounds only start after the player clicks, which
 * browsers require. The on/off choice is saved in localStorage.
 */
export class SoundEffects {
    constructor() {
        this.enabled = JsonStorage.read(STORAGE_KEYS.sound, true) !== false;
        this.context = null;
    }

    // Switch sounds on or off and remember the choice
    toggle() {
        this.enabled = !this.enabled;
        JsonStorage.write(STORAGE_KEYS.sound, this.enabled);

        return this.enabled;
    }

    flip() {
        this.#play([[660, 0, 0.07]], "triangle");
    }

    match() {
        this.#play([[523, 0, 0.1], [784, 0.09, 0.14]], "sine");
    }

    mismatch() {
        this.#play([[220, 0, 0.12], [175, 0.1, 0.16]], "square", 0.04);
    }

    win() {
        this.#play([[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.3]], "sine");
    }

    lose() {
        this.#play([[392, 0, 0.18], [330, 0.18, 0.18], [262, 0.36, 0.35]], "triangle");
    }

    // Play a list of [frequency, startTime, duration] notes
    #play(notes, type, volume = 0.08) {
        const context = this.enabled ? this.#getContext() : null;

        if (!context) {
            return;
        }

        notes.forEach(function ([frequency, start, duration]) {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const startAt = context.currentTime + start;

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            // Fade out quickly to avoid clicks
            gain.gain.setValueAtTime(volume, startAt);
            gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

            oscillator.connect(gain).connect(context.destination);
            oscillator.start(startAt);
            oscillator.stop(startAt + duration);
        });
    }

    // Create the audio context on first use (returns null if unsupported)
    #getContext() {
        try {
            if (!this.context) {
                this.context = new AudioContext();
            }

            if (this.context.state === "suspended") {
                this.context.resume();
            }

            return this.context;

        } catch (error) {
            console.error("Sound effects are not available:", error);
            this.enabled = false;
            return null;
        }
    }
}
