// ========================================
// FlipMind - Registered user accounts
// ========================================

import { JsonStorage, STORAGE_KEYS } from "./storage.js";

/**
 * Stores registered accounts as a JSON array in localStorage.
 * Each account: { username, fullName, email, phone, address, password, registeredAt }.
 * Accounts created before the full name, phone and address fields were
 * added are still valid.
 */
export class AccountStore {
    // Every stored record, unchanged (malformed records are kept, not erased)
    static #readAll() {
        const users = JsonStorage.read(STORAGE_KEYS.users, []);

        return Array.isArray(users) ? users : [];
    }

    // Records that have the fields needed to log in
    static getAll() {
        return AccountStore.#readAll().filter(function (user) {
            return (
                user !== null &&
                typeof user === "object" &&
                typeof user.username === "string" &&
                user.username.trim() !== "" &&
                typeof user.email === "string" &&
                typeof user.password === "string"
            );
        });
    }

    // Find an account by email address (not case-sensitive)
    static findByEmail(email) {
        const target = email.toLowerCase();

        return AccountStore.getAll().find(function (user) {
            return user.email.toLowerCase() === target;
        }) || null;
    }

    // Check whether a username is already registered (not case-sensitive)
    static isUsernameTaken(username) {
        const target = username.toLowerCase();

        return AccountStore.getAll().some(function (user) {
            return user.username.toLowerCase() === target;
        });
    }

    // Add a new account and report whether it was saved
    static add(account) {
        const users = AccountStore.#readAll();

        users.push(account);

        return JsonStorage.write(STORAGE_KEYS.users, users);
    }
}
