// ========================================
// FlipMind - Scores and rankings data
// ========================================

import { JsonStorage, STORAGE_KEYS } from "./storage.js";
import { FINAL_LEVEL } from "./game/levels.js";

/**
 * Stores each user's top score for every level as JSON in localStorage.
 * A stored score is only replaced when the user beats it.
 * Result format: { username, level, pairs, moves, score, completedAt }.
 */
export class ScoreStore {
    // Score for a completed level: harder levels and fewer moves score more
    static calculateScore(level, pairs, moves) {
        return Math.max(0, level * 1000 + pairs * 100 - moves * 10);
    }

    // Every stored record, unchanged (old or corrupted rows are kept, not erased)
    static #readAll() {
        const results = JsonStorage.read(STORAGE_KEYS.results, []);

        return Array.isArray(results) ? results : [];
    }

    // A usable result for one of the current levels
    static #isValid(result) {
        return (
            result !== null &&
            typeof result === "object" &&
            typeof result.username === "string" &&
            result.username.trim() !== "" &&
            Number.isInteger(result.level) &&
            result.level >= 1 && result.level <= FINAL_LEVEL &&
            Number.isInteger(result.pairs) &&
            result.pairs >= 1 &&
            Number.isInteger(result.moves) &&
            result.moves >= result.pairs
        );
    }

    // Valid results with their score recalculated, so results saved by
    // earlier versions of the game are ranked with the same formula
    static getResults() {
        return ScoreStore.#readAll()
            .filter(ScoreStore.#isValid)
            .map(function (result) {
                return {
                    ...result,
                    score: ScoreStore.calculateScore(result.level, result.pairs, result.moves)
                };
            });
    }

    // Save a completed level, keeping only the user's best score for it
    static saveResult(username, { level, pairs, moves }) {
        const score = ScoreStore.calculateScore(level, pairs, moves);

        const newResult = {
            username,
            level,
            pairs,
            moves,
            score,
            completedAt: new Date().toISOString()
        };

        if (!ScoreStore.#isValid(newResult)) {
            return { saved: false, reason: "invalid-result", score };
        }

        const results = ScoreStore.#readAll();
        const key = username.toLowerCase();

        const existingIndex = results.findIndex(function (result) {
            return (
                ScoreStore.#isValid(result) &&
                result.username.toLowerCase() === key &&
                result.level === level
            );
        });

        if (existingIndex !== -1) {
            const old = results[existingIndex];
            const bestScore = ScoreStore.calculateScore(old.level, old.pairs, old.moves);

            if (score <= bestScore) {
                return { saved: true, improved: false, score, bestScore };
            }

            results[existingIndex] = newResult;

        } else {
            results.push(newResult);
        }

        if (!JsonStorage.write(STORAGE_KEYS.results, results)) {
            return { saved: false, reason: "storage-error", score };
        }

        return { saved: true, improved: true, score, bestScore: score };
    }

    /**
     * One row per registered user: the total of their best level scores,
     * their highest completed level and the moves used for those results.
     * Users who have not completed a level yet are listed last.
     * Optional demo results (sample players, see demo-players.js) are
     * ranked alongside, kept apart from real accounts and marked isDemo.
     */
    static getLeaderboard(accounts, demoResults = []) {
        const players = new Map();

        const newPlayer = function (username, isDemo) {
            return { username, totalScore: 0, highestLevel: 0, totalMoves: 0, hasScores: false, isDemo };
        };

        const addResult = function (player, result) {
            player.totalScore += result.score;
            player.totalMoves += result.moves;
            player.highestLevel = Math.max(player.highestLevel, result.level);
            player.hasScores = true;
        };

        accounts.forEach(function (account) {
            players.set(account.username.toLowerCase(), newPlayer(account.username, false));
        });

        ScoreStore.getResults().forEach(function (result) {
            const player = players.get(result.username.toLowerCase());

            // Only registered users appear in the rankings
            if (!player) {
                return;
            }

            addResult(player, result);
        });

        // Demo players use their own keys, so they never mix with a real
        // account that has the same username
        demoResults.filter(ScoreStore.#isValid).forEach(function (result) {
            const key = `demo:${result.username.toLowerCase()}`;

            if (!players.has(key)) {
                players.set(key, newPlayer(result.username, true));
            }

            addResult(players.get(key), {
                ...result,
                score: ScoreStore.calculateScore(result.level, result.pairs, result.moves)
            });
        });

        const rows = Array.from(players.values()).sort(function (a, b) {
            return (
                (b.hasScores - a.hasScores) ||
                (b.totalScore - a.totalScore) ||
                (b.highestLevel - a.highestLevel) ||
                (a.totalMoves - b.totalMoves) ||
                a.username.localeCompare(b.username)
            );
        });

        // Players with the same total score share the same rank
        return rows.map(function (row) {
            const higherScores = rows.filter(function (other) {
                return other.hasScores && other.totalScore > row.totalScore;
            }).length;

            return { ...row, rank: row.hasScores ? higherScores + 1 : null };
        });
    }
}
