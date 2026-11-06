// ========================================
// FlipMind - Form validation
// ========================================

/**
 * JavaScript validation for the registration and login forms.
 * Each method returns an object that maps an input id to an error
 * message. An empty object means the form is valid.
 */
export class FormValidator {
    static #FULL_NAME_PATTERN = /^[\p{L}][\p{L} .'-]{1,49}$/u;
    static #USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
    static #EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Digits with an optional leading +, ignoring spaces, hyphens and brackets
    static #PHONE_PATTERN = /^\+?[0-9]{10,15}$/;
    static #ADDRESS_PATTERN = /^[\p{L}0-9][\p{L}0-9 ,.'\/#-]{4,99}$/u;
    static MIN_PASSWORD_LENGTH = 8;

    // Check every registration field
    static validateRegistration({ fullName, username, email, phone, address, password }) {
        const errors = {};

        if (!fullName) {
            errors["full-name"] = "Please enter your full name.";
        } else if (!FormValidator.#FULL_NAME_PATTERN.test(fullName)) {
            errors["full-name"] =
                "Full name must be 2-50 characters: letters, spaces, hyphens or apostrophes.";
        }

        if (!username) {
            errors.username = "Please choose a username.";
        } else if (!FormValidator.#USERNAME_PATTERN.test(username)) {
            errors.username =
                "Username must be 3-20 characters: letters, numbers or _ only.";
        }

        Object.assign(errors, FormValidator.#checkEmail(email));

        if (!phone) {
            errors.phone = "Please enter your phone number.";
        } else if (!FormValidator.#PHONE_PATTERN.test(phone.replace(/[\s()-]/g, ""))) {
            errors.phone =
                "Phone number must have 10-15 digits, for example 07123 456789.";
        }

        if (!address) {
            errors.address = "Please enter your address.";
        } else if (!FormValidator.#ADDRESS_PATTERN.test(address)) {
            errors.address =
                "Address must be 5-100 characters: letters, numbers, spaces and , . ' / # - only.";
        }

        if (!password) {
            errors.password = "Please choose a password.";
        } else if (password.length < FormValidator.MIN_PASSWORD_LENGTH) {
            errors.password =
                `Password must be at least ${FormValidator.MIN_PASSWORD_LENGTH} characters.`;
        }

        return errors;
    }

    // Check the login fields
    static validateLogin({ email, password }) {
        const errors = FormValidator.#checkEmail(email);

        if (!password) {
            errors.password = "Please enter your password.";
        }

        return errors;
    }

    // Shared email check for both forms
    static #checkEmail(email) {
        if (!email) {
            return { email: "Please enter your email address." };
        }

        if (!FormValidator.#EMAIL_PATTERN.test(email)) {
            return { email: "Please enter a valid email address, for example name@example.com." };
        }

        return {};
    }
}
