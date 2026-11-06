// ========================================
// FlipMind - DEMO ranking data (sample players)
// ========================================

// DEMO DATA: fictional sample players shown on the Rankings page, so the
// table is not empty before real users have played. They are not user
// accounts: they have no email or password and cannot log in.
// To remove them, delete this file and the DEMO_RESULTS import in
// js/pages/rankings.js.

import { LEVELS } from "./game/levels.js";

// Moves each sample player used on the levels they completed (Level 1 first).
// Every value is at least the number of pairs, and the mistakes (moves minus
// pairs) are within the level's mistake limit, so each score is one that a
// real player could achieve.
const DEMO_PLAYERS = Object.freeze([
    { username: "NovaFlip", moves: [11, 15, 18, 22, 26] },
    { username: "MemoryMaster_Kai", moves: [12, 16, 19, 24, 27] },
    { username: "PixelQueen", moves: [10, 14, 20, 23] },
    { username: "CardShark77", moves: [13, 17, 20] },
    { username: "LunaMatch", moves: [14, 17] },
    { username: "Ray_Beginner", moves: [19] }
]);

// One result per completed level, in the same format the game saves
// (the score is calculated by ScoreStore with the normal formula)
export const DEMO_RESULTS = Object.freeze(DEMO_PLAYERS.flatMap(function (player) {
    return player.moves.map(function (moves, index) {
        return {
            username: player.username,
            level: LEVELS[index].level,
            pairs: LEVELS[index].pairs,
            moves
        };
    });
}));
