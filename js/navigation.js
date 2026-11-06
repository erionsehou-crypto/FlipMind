// ========================================
// FlipMind - Navigation bar
// ========================================

import { UserSession } from "./session.js";

/**
 * Builds the navigation for logged-in users: it reveals the Home,
 * Play Game and Rankings links (hidden in the HTML, so guests only see
 * Register and Login), hides Register and Login, and adds the username
 * and a Logout link.
 */
export class NavigationBar {
    constructor(nav = document.querySelector(".site-header nav")) {
        this.navLeft = nav ? nav.querySelector(".nav-left") : null;
        this.navRight = nav ? nav.querySelector(".nav-right") : null;
    }

    // Show the full navigation when a user is logged in
    render() {
        const username = UserSession.getUsername();

        if (!this.navLeft || !this.navRight || !username) {
            return;
        }

        this.navLeft.hidden = false;

        // Reuse the page's own Login link path, because index.html is in
        // the project root and the other pages are inside html/
        const loginLink = this.navRight.querySelector('a[href$="login.html"]');
        const loginPage = loginLink ? loginLink.getAttribute("href") : "login.html";

        // Register and Login are only for guests
        this.navRight.querySelectorAll("a").forEach(function (link) {
            link.hidden = true;
        });

        const greeting = document.createElement("span");
        greeting.className = "nav-username";
        greeting.textContent = `Hi, ${username}`;

        const logoutLink = document.createElement("a");
        logoutLink.href = loginPage;
        logoutLink.textContent = "Logout";

        logoutLink.addEventListener("click", (event) => {
            event.preventDefault();
            UserSession.end();
            window.location.href = loginPage;
        });

        this.navRight.prepend(greeting);
        this.navRight.append(logoutLink);
    }
}
