// ========================================
// FlipMind - Local server warning
// ========================================

// The website uses JavaScript modules, which browsers block when an HTML
// file is opened directly from disk (file://). This normal script still
// runs in that case and explains how to open the website correctly.
if (window.location.protocol === "file:") {
    const warning = document.createElement("p");

    warning.className = "file-warning";
    warning.setAttribute("role", "alert");
    warning.textContent =
        "FlipMind must be opened through a local web server, for example " +
        "VS Code Live Server. Opened directly from a file, the game, login " +
        "and rankings cannot run.";

    document.body.prepend(warning);
}
