// ========================================
// FlipMind - Home page entry point
// ========================================

import { NavigationBar } from "../navigation.js";
import { UserSession } from "../session.js";

// The website starts with authentication: guests go to the login page
if (UserSession.requireLogin("html/login.html")) {
    new NavigationBar().render();

    // The Play Game button opens the game page
    document.getElementById("play-game-button").addEventListener("click", function () {
        window.location.href = "html/game.html";
    });
}
