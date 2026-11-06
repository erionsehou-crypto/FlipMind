// ========================================
// FlipMind - JSON storage helper
// ========================================

// Every localStorage key used by the website, defined in one place
export const STORAGE_KEYS = Object.freeze({
    users: "flipmindUsers",
    currentUser: "flipmindCurrentUser",
    results: "flipmindLevelResults",
    userProgress: "flipmindUserProgress",
    sound: "flipmindSoundEnabled"
});

/**
 * Reads and writes JSON data in HTML localStorage.
 * Each call is wrapped in try/catch, so corrupted data or blocked
 * storage is reported in the console instead of crashing the page.
 */
export class JsonStorage {
    // Return the parsed value, or the fallback if it is missing or corrupted
    static read(key, fallback) {
        try {
            const text = localStorage.getItem(key);

            return text === null ? fallback : JSON.parse(text);

        } catch (error) {
            console.error(`Could not read "${key}" from localStorage:`, error);
            return fallback;
        }
    }

    // Save a value as JSON and report whether it worked
    static write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;

        } catch (error) {
            console.error(`Could not save "${key}" to localStorage:`, error);
            return false;
        }
    }

    // Delete a key
    static remove(key) {
        try {
            localStorage.removeItem(key);

        } catch (error) {
            console.error(`Could not remove "${key}" from localStorage:`, error);
        }
    }
}
