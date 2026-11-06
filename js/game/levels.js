// ========================================
// FlipMind - Level configuration
// ========================================

// Each level adds more pairs, a stricter mistake limit and its own card theme.
// maxMistakes: how many wrong pairs are allowed; one more and the level is lost.
// Later levels allow fewer mistakes for each pair, so they get harder.
export const LEVELS = Object.freeze([
    {
        level: 1, name: "Beginner", theme: "arcade", themeName: "Arcade",
        pairs: 8, columns: 4, maxMistakes: 12,
        symbols: ["🧠", "🎮", "🚀", "⭐", "🎯", "👾", "💎", "⚡"]
    },
    {
        level: 2, name: "Intermediate", theme: "nature", themeName: "Nature",
        pairs: 10, columns: 5, maxMistakes: 12,
        symbols: ["🌲", "🌵", "🌻", "🌸", "🍁", "🍄", "🌊", "🌙", "🌈", "❄️"]
    },
    {
        level: 3, name: "Advanced", theme: "fruit", themeName: "Fruit Market",
        pairs: 12, columns: 6, maxMistakes: 12,
        symbols: ["🍎", "🍌", "🍇", "🍓", "🍒", "🍑", "🍍", "🥝", "🍉", "🍋", "🥥", "🥑"]
    },
    {
        level: 4, name: "Expert", theme: "animals", themeName: "Animal Kingdom",
        pairs: 15, columns: 6, maxMistakes: 13,
        symbols: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"]
    },
    {
        // Similar coloured shapes make the final level harder to remember
        level: 5, name: "Master", theme: "colours", themeName: "Colour Chaos",
        pairs: 18, columns: 6, maxMistakes: 14,
        symbols: ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫", "⚪",
                  "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫", "⬛", "⬜"]
    }
]);

export const FINAL_LEVEL = LEVELS.length;
