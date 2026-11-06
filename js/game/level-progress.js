// ========================================
// FlipMind - Unlocked levels
// ========================================

import { JsonStorage, STORAGE_KEYS } from "../storage.js";

/**
 * Remembers the highest unlocked level for each logged-in player,
 * stored as JSON: { "user:name": level }.
 */
export class LevelProgress {
    constructor(username, finalLevel) {
        this.userKey = `user:${username.toLowerCase()}`;
        this.finalLevel = finalLevel;
    }

    // Highest level the player may choose (always between 1 and the final level)
    getUnlockedLevel() {
        const saved = Number(this.#readUserProgress()[this.userKey]);

        if (!Number.isFinite(saved) || saved < 1) {
            return 1;
        }

        return Math.min(this.finalLevel, Math.floor(saved));
    }

    // Unlock a level (progress never goes backwards)
    unlock(level) {
        const highest = Math.min(this.finalLevel, Math.max(this.getUnlockedLevel(), level));

        const progress = this.#readUserProgress();
        progress[this.userKey] = highest;

        return JsonStorage.write(STORAGE_KEYS.userProgress, progress);
    }

    // Progress of every player
    #readUserProgress() {
        const progress = JsonStorage.read(STORAGE_KEYS.userProgress, {});

        return progress !== null && typeof progress === "object" && !Array.isArray(progress)
            ? progress
            : {};
    }
}
