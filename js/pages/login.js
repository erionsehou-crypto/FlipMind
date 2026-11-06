// ========================================
// FlipMind - Login page
// ========================================

import { NavigationBar } from "../navigation.js";
import { AccountStore } from "../accounts.js";
import { UserSession } from "../session.js";
import { FormValidator } from "../validator.js";
import { FormFeedback } from "../form-feedback.js";
import { AuthAnimation } from "../auth-animation.js";

// How long the success message is shown before going to the Home page (ms)
const REDIRECT_DELAY = 1200;

/**
 * Validates the login form, checks the email and password against the
 * stored accounts and saves the session in localStorage.
 */
class LoginPage {
    constructor(form, animation) {
        this.form = form;
        this.animation = animation;
        this.feedback = new FormFeedback(form, document.getElementById("form-message"));

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.login();
        });

        // Tell returning users that they are already logged in, and guests
        // who were sent here from the game that they need an account
        const username = UserSession.getUsername();

        if (username) {
            this.feedback.showInfo(`You are logged in as ${username}. Log in again to switch account.`);
        } else if (UserSession.wasLoginRequired()) {
            this.feedback.showInfo("Please log in or create an account to play FlipMind.");
        }
    }

    login() {
        const email = this.form.querySelector("#email").value.trim().toLowerCase();
        const password = this.form.querySelector("#password").value;

        const errors = FormValidator.validateLogin({ email, password });

        if (Object.keys(errors).length > 0) {
            this.feedback.showErrors(errors);
            return;
        }

        const account = AccountStore.findByEmail(email);

        if (!account) {
            this.feedback.showError("No account was found with this email address. Please register first.", "email");
            return;
        }

        if (account.password !== password) {
            this.feedback.showError("Incorrect password. Please try again.", "password");
            return;
        }

        if (!UserSession.start(account)) {
            this.feedback.showError("Login failed because the browser storage is unavailable.");
            return;
        }

        this.feedback.showSuccess(`Welcome back, ${account.username}! Redirecting to the home page...`);
        this.animation.celebrate();

        setTimeout(() => {
            this.animation.leaveTo("../index.html");
        }, REDIRECT_DELAY);
    }
}

// The animation is created first, so the Logout link added by the
// navigation bar keeps its own click handler
const animation = new AuthAnimation(document.querySelector("main"));

new NavigationBar().render();
new LoginPage(document.getElementById("login-form"), animation);
animation.start();
