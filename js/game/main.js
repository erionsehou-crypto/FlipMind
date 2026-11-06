// ========================================
// FlipMind - Game page entry point
// ========================================

import { NavigationBar } from "../navigation.js";
import { UserSession } from "../session.js";
import { MemoryGame } from "./memory-game.js";
import { Board } from "./board.js";
import { GameView } from "./game-view.js";
import { LevelProgress } from "./level-progress.js";
import { SoundEffects } from "./sound-effects.js";
import { Celebration } from "./celebration.js";
import { FINAL_LEVEL } from "./levels.js";

// Players must be logged in: guests are redirected to the login page
const username = UserSession.requireLogin("login.html");

if (username) {
    new NavigationBar().render();
    document.querySelector(".game-container").hidden = false;

    // The game starts once the Phaser engine and the sprite sheet are ready
    new Board(document.getElementById("game-board")).ready.then(function (board) {
        new MemoryGame({
            board,
            view: new GameView(),
            progress: new LevelProgress(username, FINAL_LEVEL),
            sounds: new SoundEffects(),
            mascot: board.mascot,
            celebration: new Celebration(document.getElementById("celebration-layer")),
            username
        }).init();
    });
}
