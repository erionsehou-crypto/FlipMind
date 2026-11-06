// ========================================
// FlipMind - Rankings page
// ========================================

import { NavigationBar } from "../navigation.js";
import { UserSession } from "../session.js";
import { AccountStore } from "../accounts.js";
import { ScoreStore } from "../scores.js";
// DEMO DATA: remove this import (and its use below) to hide the sample players
import { DEMO_RESULTS } from "../demo-players.js";

/**
 * Fills the rankings table with every registered user and their
 * top scores, loaded from localStorage, together with the demo sample
 * players. The logged-in user always has an account, so the table is
 * never empty.
 */
class RankingsTable {
    constructor(tableBody) {
        this.tableBody = tableBody;
    }

    render() {
        const rows = ScoreStore.getLeaderboard(AccountStore.getAll(), DEMO_RESULTS);

        this.tableBody.replaceChildren(...rows.map((row) => this.#createRow(row)));
    }

    // One table row; players without a completed level show dashes
    #createRow(row) {
        const values = row.hasScores
            ? [row.rank, row.username, row.highestLevel, row.totalMoves, row.totalScore]
            : ["-", row.username, "-", "-", "No score yet"];

        const tableRow = document.createElement("tr");

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = String(value);
            tableRow.appendChild(cell);
        });

        // Sample players are clearly labelled as demo data
        if (row.isDemo) {
            const badge = document.createElement("span");
            badge.className = "demo-badge";
            badge.textContent = "Demo";
            tableRow.children[1].append(badge);
        }

        return tableRow;
    }
}

// Only logged-in users can view the rankings
if (UserSession.requireLogin("login.html")) {
    new NavigationBar().render();
    new RankingsTable(document.getElementById("rankings-body")).render();
}
