// ========================================
// FlipMind - Game page display
// ========================================

/**
 * Updates everything on the game page except the cards:
 * level buttons, statistics, status text, messages and buttons.
 */
export class GameView {
    constructor() {
        this.levelSelect = document.getElementById("level-select");
        this.levelStatus = document.getElementById("level-status");
        this.currentLevel = document.getElementById("current-level");
        this.mistakes = document.getElementById("mistakes");
        this.pairs = document.getElementById("pairs");
        this.lastScore = document.getElementById("last-score");
        this.message = document.getElementById("game-message");
        this.startButton = document.getElementById("start-button");
        this.soundButton = document.getElementById("sound-toggle");
    }

    // Draw the level buttons; locked levels are disabled
    renderLevelButtons(levels, unlockedLevel, selectedLevel, onSelect) {
        const buttons = levels.map(function (config) {
            const button = document.createElement("button");
            const isUnlocked = config.level <= unlockedLevel;

            button.type = "button";
            button.className = "level-button";
            button.classList.toggle("selected", config.level === selectedLevel);
            button.classList.toggle("locked", !isUnlocked);
            button.disabled = !isUnlocked;
            button.textContent = isUnlocked ? config.level : "🔒";

            button.setAttribute("aria-label", isUnlocked
                ? `Select level ${config.level}`
                : `Level ${config.level} locked`);

            button.title = isUnlocked
                ? `Level ${config.level} - ${config.name} (${config.themeName})`
                : "Complete previous levels to unlock this level";

            button.addEventListener("click", () => onSelect(config.level));

            return button;
        });

        this.levelSelect.replaceChildren(...buttons);
    }

    // Show the current level, mistakes (with the level's limit) and pairs
    showStats(config, mistakes, matchedPairs) {
        this.currentLevel.textContent = config.level;
        this.mistakes.textContent = `${mistakes} / ${config.maxMistakes}`;

        this.pairs.textContent = `${matchedPairs} / ${config.pairs}`;
    }

    showLastScore(score) {
        this.lastScore.textContent = score;
    }

    setStatus(text) {
        this.levelStatus.textContent = text;
    }

    setMessage(text) {
        this.message.textContent = text;
    }

    setStartLabel(text) {
        this.startButton.textContent = text;
    }

    setSoundState(enabled) {
        this.soundButton.textContent = enabled ? "🔊 Sound: On" : "🔇 Sound: Off";
        this.soundButton.setAttribute("aria-pressed", String(enabled));
    }

    onStart(handler) {
        this.startButton.addEventListener("click", handler);
    }

    onSoundToggle(handler) {
        this.soundButton.addEventListener("click", handler);
    }
}
