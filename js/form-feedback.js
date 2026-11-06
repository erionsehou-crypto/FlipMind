// ========================================
// FlipMind - Inline form messages
// ========================================

/**
 * Shows validation errors and success messages inside the page
 * (the brief does not allow alert boxes). Invalid inputs are marked
 * with aria-invalid so they are highlighted and announced by screen readers.
 * The form gives a short shake when an error is shown.
 */
export class FormFeedback {
    constructor(form, messageElement) {
        this.form = form;
        this.messageElement = messageElement;
    }

    // Show one message per invalid field and focus the first one
    showErrors(errors) {
        this.clear();

        const fieldIds = Object.keys(errors);

        fieldIds.forEach((id) => {
            const input = this.form.querySelector(`#${id}`);

            if (input) {
                input.setAttribute("aria-invalid", "true");
            }
        });

        this.#show(Object.values(errors), "error");

        const firstInput = this.form.querySelector(`#${fieldIds[0]}`);

        if (firstInput) {
            firstInput.focus();
        }
    }

    // Show a single error, highlighting the related field if there is one
    showError(text, fieldId = null) {
        if (fieldId) {
            this.showErrors({ [fieldId]: text });
            return;
        }

        this.clear();
        this.#show([text], "error");
    }

    showSuccess(text) {
        this.clear();
        this.#show([text], "success");
    }

    showInfo(text) {
        this.#show([text], "info");
    }

    // Remove all messages and highlights
    clear() {
        this.form.querySelectorAll("[aria-invalid]").forEach(function (input) {
            input.removeAttribute("aria-invalid");
        });

        this.messageElement.replaceChildren();
        this.messageElement.className = "form-message";
    }

    // Write each message on its own line
    #show(lines, type) {
        const items = lines.map(function (line) {
            const item = document.createElement("span");
            item.textContent = line;
            return item;
        });

        this.messageElement.replaceChildren(...items);
        this.messageElement.className = `form-message ${type}`;

        if (type === "error") {
            this.#shake();
        }
    }

    // Restart the shake animation (reading offsetWidth lets it play again)
    #shake() {
        this.form.classList.remove("form-shake");
        void this.form.offsetWidth;
        this.form.classList.add("form-shake");
    }
}
