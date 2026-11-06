// ========================================
// FlipMind - Memory game rules
// ========================================

import { LEVELS, FINAL_LEVEL } from "./levels.js";
import { ScoreStore } from "../scores.js";

// How long two different cards stay face up before turning back (ms)
const MISMATCH_DELAY = 800;

/**
 * Controls the game: choosing levels, flipping cards, checking pairs,
 * counting mistakes, the mistake limit, scoring and unlocking levels.
 * The board, the page display, progress storage, sounds, the
 * animated mascot and the win celebration are separate objects
 * that are passed in.
 */
export class MemoryGame {
    constructor({ board, view, progress, sounds, mascot, celebration, username }) {
        this.board = board;
        this.view = view;
        this.progress = progress;
        this.sounds = sounds;
        this.mascot = mascot;
        this.celebration = celebration;
        this.username = username;

        this.selectedLevel = 1;
        this.isPlaying = false;
        this.firstCard = null;
        this.lockBoard = false;
        this.matchedPairs = 0;
        this.mistakes = 0;

        // Every attempt (pair of cards turned over), used only for the score
        this.moves = 0;

        // Increased whenever a game starts or ends, so a delayed
        // card flip from an old game is ignored
        this.session = 0;
    }

    get config() {
        return LEVELS[this.selectedLevel - 1];
    }

    // Connect the buttons and show the first level
    init() {
        this.view.onStart(() => this.start());

        this.view.onSoundToggle(() => {
            this.view.setSoundState(this.sounds.toggle());
        });

        this.view.setSoundState(this.sounds.enabled);
        this.prepareLevel(1, "Start Game");
        this.view.setMessage("Choose an unlocked level and press Start Game!");
    }

    // Select a level and show an empty board for it
    prepareLevel(level, startLabel) {
        this.selectedLevel = level;
        this.isPlaying = false;
        this.firstCard = null;
        this.lockBoard = false;
        this.moves = 0;
        this.mistakes = 0;
        this.matchedPairs = 0;
        this.session++;

        this.board.clear();
        this.view.showStats(this.config, 0, 0);
        this.view.setStatus(this.#describeLevel());
        this.view.setStartLabel(startLabel);
        this.#renderLevelButtons();
    }

    // Start (or restart) the selected level
    start() {
        this.#resetAnimations();
        this.prepareLevel(this.selectedLevel, "Restart Level");
        this.isPlaying = true;

        this.board.build(this.config, (card) => this.flip(card));
        this.view.setStatus(`Level ${this.selectedLevel}: ${this.config.name} - ${this.config.themeName}`);
        this.view.setMessage("");
    }

    // Handle a click on a card
    flip(card) {
        if (!this.isPlaying || this.lockBoard || card.isRevealed || card.isMatched) {
            return;
        }

        card.reveal();
        this.sounds.flip();

        if (!this.firstCard) {
            this.firstCard = card;
            return;
        }

        // Two cards are face up: one attempt (the score uses the number of attempts)
        const firstCard = this.firstCard;
        this.firstCard = null;
        this.moves++;

        if (firstCard.symbol === card.symbol) {
            this.#handleMatch(firstCard, card);
        } else {
            this.#handleMismatch(firstCard, card);
        }
    }

    // Correct pair: keep both cards face up
    #handleMatch(firstCard, secondCard) {
        firstCard.markMatched();
        secondCard.markMatched();
        this.matchedPairs++;
        this.#updateStats();

        if (this.matchedPairs === this.config.pairs) {
            this.#completeLevel();
        } else {
            this.sounds.match();
            this.mascot.cheer();
        }
    }

    // Wrong pair: one mistake, then both cards turn back over after a short
    // delay. The board is locked until then, so extra clicks are ignored
    // and one wrong pair can only ever count as one mistake.
    #handleMismatch(firstCard, secondCard) {
        this.lockBoard = true;
        this.mistakes++;
        this.#updateStats();
        this.sounds.mismatch();
        this.mascot.sad();

        const session = this.session;

        setTimeout(() => {
            // Ignore the delay if the game was restarted or ended meanwhile
            if (session !== this.session || !this.board.contains(firstCard)) {
                return;
            }

            firstCard.hide();
            secondCard.hide();
            this.lockBoard = false;

            if (this.#hasTooManyMistakes()) {
                this.#failLevel();
            }
        }, MISMATCH_DELAY);
    }

    // The level is lost when the mistake limit is exceeded
    #hasTooManyMistakes() {
        return this.mistakes > this.config.maxMistakes;
    }

    // All pairs found: save the score, unlock the next level and show the result
    #completeLevel() {
        const completedLevel = this.selectedLevel;
        const { pairs } = this.config;
        const moves = this.moves;
        const mistakes = this.mistakes;
        const isFinalLevel = completedLevel === FINAL_LEVEL;

        const result = ScoreStore.saveResult(this.username, { level: completedLevel, pairs, moves });

        this.progress.unlock(isFinalLevel ? FINAL_LEVEL : completedLevel + 1);
        this.sounds.win();
        this.mascot.celebrate(isFinalLevel);

        // Show the next level (or the final level again) with fresh statistics
        if (isFinalLevel) {
            this.prepareLevel(FINAL_LEVEL, `Play Level ${FINAL_LEVEL} Again`);
        } else {
            this.prepareLevel(completedLevel + 1, `Start Level ${completedLevel + 1}`);
        }

        this.view.showLastScore(result.score);

        // Started after the board has shrunk, so the stars come from the mascot
        if (isFinalLevel) {
            this.celebration.gameComplete(FINAL_LEVEL, this.mascot.getScreenPosition());
        } else {
            this.celebration.levelComplete(completedLevel, this.mascot.getScreenPosition());
        }

        const intro = isFinalLevel
            ? `Memory Master! Level ${completedLevel} complete with ${MemoryGame.#countMistakes(mistakes)} - you finished all ${FINAL_LEVEL} levels!`
            : `Level ${completedLevel} complete with ${MemoryGame.#countMistakes(mistakes)}! Level ${completedLevel + 1} unlocked.`;

        this.view.setMessage(`${intro} Score: ${result.score}. ${this.#describeSavedScore(result)}`);
    }

    // Mistake limit exceeded: the level is lost
    #failLevel() {
        this.isPlaying = false;
        this.lockBoard = true;
        this.session++;
        this.sounds.lose();
        this.mascot.cry();

        this.view.setMessage(`Game Over! You made more than ${MemoryGame.#countMistakes(this.config.maxMistakes)}. Try again!`);
        this.view.setStatus(`Level ${this.selectedLevel} failed. Try again to beat this level.`);
        this.view.setStartLabel("Try Again");
    }

    // Explain what happened to the score
    #describeSavedScore(result) {
        if (!result.saved) {
            return "Your score could not be saved.";
        }

        return result.improved
            ? "New best score saved to the Rankings!"
            : `Your best score for this level is still ${result.bestScore}.`;
    }

    // e.g. "Level 2: Intermediate - Nature | 10 pairs | 12 mistakes max"
    #describeLevel() {
        const { level, name, themeName, pairs, maxMistakes } = this.config;

        return `Level ${level}: ${name} - ${themeName} | ${pairs} pairs | ${maxMistakes} mistakes max`;
    }

    // Mascot back to idle and any celebration removed
    #resetAnimations() {
        this.mascot.reset();
        this.celebration.clear();
    }

    // "1 mistake", "3 mistakes"
    static #countMistakes(count) {
        return `${count} ${count === 1 ? "mistake" : "mistakes"}`;
    }

    #updateStats() {
        this.view.showStats(this.config, this.mistakes, this.matchedPairs);
    }

    // Clicking an unlocked level starts it straight away, even during
    // another level. Clicking the level being played does nothing, so
    // the current attempt is not lost by accident.
    #renderLevelButtons() {
        this.view.renderLevelButtons(
            LEVELS,
            this.progress.getUnlockedLevel(),
            this.selectedLevel,
            (level) => {
                const isLocked = level > this.progress.getUnlockedLevel();
                const isCurrentGame = this.isPlaying && level === this.selectedLevel;

                if (isLocked || isCurrentGame) {
                    return;
                }

                this.selectedLevel = level;
                this.start();
            }
        );
    }
}
