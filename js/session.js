// ========================================
// FlipMind - Logged-in user session
// ========================================

import { JsonStorage, STORAGE_KEYS } from "./storage.js";
import { AccountStore } from "./accounts.js";

// Added to the login page address when a guest tries to open the game
const LOGIN_REQUIRED = "login-required";

/**
 * Keeps track of which user is logged in.
 * The session is saved in localStorage, so it survives page reloads.
 */
export class UserSession {
    // Return the logged-in user, or null for a guest
    static getCurrentUser() {
        const user = JsonStorage.read(STORAGE_KEYS.currentUser, null);

        const isValid =
            user !== null &&
            typeof user === "object" &&
            typeof user.username === "string" &&
            user.username.trim() !== "";

        return isValid ? user : null;
    }

    // Return the logged-in username, or null for a guest
    static getUsername() {
        const user = UserSession.getCurrentUser();

        return user ? user.username : null;
    }

    // Log a user in by saving their public details (never the password)
    static start(account) {
        return JsonStorage.write(STORAGE_KEYS.currentUser, {
            username: account.username,
            email: account.email,
            loggedInAt: new Date().toISOString()
        });
    }

    // Log the current user out
    static end() {
        JsonStorage.remove(STORAGE_KEYS.currentUser);
    }

    // Address of the login page that explains a login is needed
    static loginRequiredUrl(loginPage) {
        return `${loginPage}?reason=${LOGIN_REQUIRED}`;
    }

    // True if this page was opened by a "login required" redirect
    static wasLoginRequired() {
        return new URLSearchParams(window.location.search).get("reason") === LOGIN_REQUIRED;
    }

    /**
     * Only lets registered, logged-in users stay on the page.
     * Anyone else is sent to the login page (replace() keeps the
     * protected page out of the browser history). Returns the username,
     * or null if the visitor is being redirected.
     */
    static requireLogin(loginPage) {
        const username = UserSession.getUsername();

        if (username && AccountStore.isUsernameTaken(username)) {
            return username;
        }

        // Clear a session left behind by an account that no longer exists
        UserSession.end();
        window.location.replace(UserSession.loginRequiredUrl(loginPage));

        return null;
    }
}
