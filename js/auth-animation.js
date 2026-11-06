// ========================================
// FlipMind - Login and Register page animation
// ========================================

import { LEVELS } from "./game/levels.js";

// Every symbol used in the game, so the animation shows real FlipMind cards
const SYMBOLS = LEVELS.flatMap((level) => level.symbols);

// Number of cards in the row above the page title
const DEMO_CARDS = 4;

// Timings of one round of the card demo (ms)
const FLIP_GAP = 450;
const SHOW_TIME = 1500;
const REST_TIME = 700;

// Fade-out before going to another page (ms, matches the CSS)
const LEAVE_TIME = 250;

/**
 * Decorative memory-card animation for the Login and Register pages.
 * A row of cards above the form flips over two at a time, and matching
 * pairs glow. The cards are hidden from screen readers.
 * Nothing moves when the user has asked for reduced motion.
 */
export class AuthAnimation {
    constructor(main) {
        this.main = main;
        this.timer = null;
        this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        this.demoCards = this.#createDemoRow();
        this.#smoothAuthLinks();

        // A page restored with the Back button must not stay faded out
        window.addEventListener("pageshow", () => {
            this.main.classList.remove("page-leaving");
        });
    }

    // Start flipping pairs of cards
    start() {
        if (this.reducedMotion) {
            this.#showStaticPair();
            return;
        }

        this.#playRound();
    }

    // Success: stop the demo and show every card as a matched pair
    celebrate() {
        clearTimeout(this.timer);

        const [first, second] = AuthAnimation.#randomSymbols(2);

        this.demoCards.forEach(function (card, index) {
            card.front.textContent = index < DEMO_CARDS / 2 ? first : second;
            card.element.classList.add("is-flipped", "is-matched");
        });

        this.main.querySelector("form").classList.add("form-success");
    }

    // Fade the page out, then open the given address
    leaveTo(url) {
        if (this.reducedMotion) {
            window.location.href = url;
            return;
        }

        this.main.classList.add("page-leaving");

        setTimeout(function () {
            window.location.href = url;
        }, LEAVE_TIME);
    }

    // One round: flip two cards, glow if they match, then turn them back
    #playRound() {
        const [a, b] = AuthAnimation.#twoDifferentCards(this.demoCards);
        const isMatch = Math.random() < 0.5;
        const [first, other] = AuthAnimation.#randomSymbols(2);

        a.front.textContent = first;
        b.front.textContent = isMatch ? first : other;

        a.element.classList.add("is-flipped");

        this.timer = setTimeout(() => {
            b.element.classList.add("is-flipped");

            this.timer = setTimeout(() => {
                if (isMatch) {
                    a.element.classList.add("is-matched");
                    b.element.classList.add("is-matched");
                }

                this.timer = setTimeout(() => {
                    [a, b].forEach(function (card) {
                        card.element.classList.remove("is-flipped", "is-matched");
                    });

                    this.timer = setTimeout(() => this.#playRound(), REST_TIME);
                }, SHOW_TIME);
            }, FLIP_GAP);
        }, FLIP_GAP);
    }

    // Reduced motion: one matched pair is shown face up, without movement
    #showStaticPair() {
        const [symbol] = AuthAnimation.#randomSymbols(1);

        [this.demoCards[1], this.demoCards[2]].forEach(function (card) {
            card.front.textContent = symbol;
            card.element.classList.add("is-flipped", "is-matched");
        });
    }

    // Row of cards placed above the page title
    #createDemoRow() {
        const row = document.createElement("div");
        row.className = "memory-demo";
        row.setAttribute("aria-hidden", "true");

        const cards = Array.from({ length: DEMO_CARDS }, function () {
            return AuthAnimation.#createCard();
        });

        row.append(...cards.map((card) => card.element));
        this.main.querySelector(".hero-content").prepend(row);

        return cards;
    }

    // Links between Login and Register fade the page out before leaving
    #smoothAuthLinks() {
        const links = document.querySelectorAll('a[href$="login.html"], a[href$="register.html"]');

        links.forEach((link) => {
            link.addEventListener("click", (event) => {
                const isCurrentPage = link.pathname === window.location.pathname;
                const opensElsewhere = event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0;

                if (isCurrentPage || opensElsewhere) {
                    return;
                }

                event.preventDefault();
                this.leaveTo(link.href);
            });
        });
    }

    // A card with a "?" back and a symbol on its front
    static #createCard() {
        const element = document.createElement("div");
        element.className = "demo-card";

        const inner = document.createElement("div");
        inner.className = "auth-card-inner";

        const back = document.createElement("span");
        back.className = "auth-card-face auth-card-back";
        back.textContent = "?";

        const front = document.createElement("span");
        front.className = "auth-card-face auth-card-front";

        inner.append(back, front);
        element.append(inner);

        return { element, front };
    }

    // Two different cards picked at random
    static #twoDifferentCards(cards) {
        const first = Math.floor(Math.random() * cards.length);
        const offset = 1 + Math.floor(Math.random() * (cards.length - 1));

        return [cards[first], cards[(first + offset) % cards.length]];
    }

    // A number of different symbols picked at random
    static #randomSymbols(count) {
        const pool = [...SYMBOLS];
        const picked = [];

        for (let i = 0; i < count; i++) {
            const index = Math.floor(Math.random() * pool.length);
            picked.push(pool.splice(index, 1)[0]);
        }

        return picked;
    }
}
