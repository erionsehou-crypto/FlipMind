// ========================================
// FlipMind - Registration page
// ========================================

import { NavigationBar } from "../navigation.js";
import { AccountStore } from "../accounts.js";
import { FormValidator } from "../validator.js";
import { FormFeedback } from "../form-feedback.js";
import { AuthAnimation } from "../auth-animation.js";

// How long the success message is shown before going to the login page (ms)
const REDIRECT_DELAY = 1200;

/**
 * Validates the registration form with JavaScript, checks for duplicate
 * accounts and saves the new account as JSON in localStorage.
 */
class RegisterPage {
    constructor(form, animation) {
        this.form = form;
        this.animation = animation;
        this.feedback = new FormFeedback(form, document.getElementById("form-message"));

        // preventDefault() stops the browser submitting the form itself,
        // so the password never appears in the page URL
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.register();
        });
    }

    // Read and tidy the values typed by the user
    readForm() {
        return {
            fullName: this.form.querySelector("#full-name").value.trim().replace(/\s+/g, " "),
            username: this.form.querySelector("#username").value.trim(),
            email: this.form.querySelector("#email").value.trim().toLowerCase(),
            phone: this.form.querySelector("#phone").value.trim().replace(/\s+/g, " "),
            address: this.form.querySelector("#address").value.trim().replace(/\s+/g, " "),
            password: this.form.querySelector("#password").value
        };
    }

    register() {
        const data = this.readForm();
        const errors = FormValidator.validateRegistration(data);

        // Duplicate checks only run on values that are otherwise valid
        if (!errors.username && AccountStore.isUsernameTaken(data.username)) {
            errors.username = "This username is already taken. Please choose another one.";
        }

        if (!errors.email && AccountStore.findByEmail(data.email)) {
            errors.email = "An account with this email address already exists.";
        }

        if (Object.keys(errors).length > 0) {
            this.feedback.showErrors(errors);
            return;
        }

        const saved = AccountStore.add({
            ...data,
            registeredAt: new Date().toISOString()
        });

        if (!saved) {
            this.feedback.showError("Registration failed because the browser storage is unavailable.");
            return;
        }

        this.feedback.showSuccess("Registration successful! Redirecting to login...");
        this.animation.celebrate();

        setTimeout(() => {
            this.animation.leaveTo("login.html");
        }, REDIRECT_DELAY);
    }
}

// The animation is created first, so the Logout link added by the
// navigation bar keeps its own click handler
const animation = new AuthAnimation(document.querySelector("main"));

new NavigationBar().render();
new RegisterPage(document.getElementById("register-form"), animation);
animation.start();
