/* =========================================================
   AI COMPASS — MINI-LAB "THREE SLOT MACHINES" (lesson 8)
   Each machine gives a star with its own hidden chance (25%, 50% or
   75%, shuffled for every game). With 30 pulls, the learner has to
   explore (try the machines) and exploit (use the best one). A
   machine's estimate is its stars ÷ its pulls. A robot player can
   play the same machines next to the learner, one pull for each of
   theirs: it tries every machine once, then explores (a random
   machine) 10% of the time and otherwise picks the best estimate.
   Loaded by js/lessons.js (see "A MINI-LAB IN ITS OWN FILE" there).
   Texts: "lessons.w8.*" (js/content/lessons-deep.js). Styles:
   css/lessons-labs.css ("slot-"). Sections:
    1. Settings
    2. A game: the machines, a pull and the robot's choice
    3. Drawing the lab
    4. Updating it
    5. Pulls, the robot and a new game
    6. The lab for js/lessons.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lessons) return;

    // ---------- 1. Settings ----------
    const CHANCES = [0.25, 0.5, 0.75];   // the hidden chances of a star (shuffled for every game)
    const PULLS = 30;                    // pulls in a game
    const EXPLORE = 0.1;                 // the robot picks a machine at random this share of the time
    const MACHINES = [0, 1, 2];
    const ICONS = { star: "⭐", none: "💨", waiting: "❔" };

    // ---------- 2. A game: the machines, a pull and the robot's choice ----------
    function newGame() {
        return { chances: A.util.shuffle(CHANCES), you: newPlayer(), robot: newPlayer(), last: null };
    }

    function newPlayer() {
        return { pulls: [0, 0, 0], stars: [0, 0, 0], last: [null, null, null] };
    }

    function sum(list) {
        return list.reduce(function (total, n) { return total + n; }, 0);
    }

    // A star comes with the machine's hidden chance
    function pull(game, player, machine) {
        const star = Math.random() < game.chances[machine];
        player.pulls[machine] += 1;
        if (star) player.stars[machine] += 1;
        player.last[machine] = star;
        return star;
    }

    // The robot: every machine once (in a random order), then 10% of the time any
    // machine, otherwise the machine with the best estimate (a tie: one of them)
    function robotChoice(robot) {
        const untried = MACHINES.filter(function (m) { return robot.pulls[m] === 0; });
        if (untried.length) return A.util.pick(untried);
        if (Math.random() < EXPLORE) return A.util.pick(MACHINES);
        const estimates = MACHINES.map(function (m) { return robot.stars[m] / robot.pulls[m]; });
        const best = Math.max.apply(null, estimates);
        return A.util.pick(MACHINES.filter(function (m) { return estimates[m] === best; }));
    }

    // ---------- 3. Drawing the lab ----------
    function build(host, api) {
        const state = api.state;
        if (!state.game) Object.assign(state, { game: newGame(), robotOn: false });
        const names = api.text("names").split("|");

        host.innerHTML = `
            <div class="slot-lab">
                <button type="button" class="slot-switch ui-switch" role="switch" aria-checked="false" aria-describedby="slot-robot-note" data-slot="robot" data-fid="w8-robot">
                    <span class="ui-switch-track" aria-hidden="true"><span class="ui-switch-knob"></span></span><span aria-hidden="true">🤖</span> ${api.text("robot")}
                </button>
                <p class="slot-note" id="slot-robot-note" data-slot="note">${api.text("robotNote", { p: A.format.percent(EXPLORE) })}</p>
                <div class="slot-machines">${MACHINES.map(function (m) {
                    return `
                    <div class="slot-machine" data-machine="${m}">
                        <p class="slot-name">${api.text("machine", { name: names[m] })}</p>
                        <p class="slot-reel" aria-hidden="true"><span data-slot="reel"></span></p>
                        <p class="slot-stats" data-slot="stats"></p>
                        <p class="slot-estimate"><span class="slot-estimate-label">${api.text("estimate")}</span> <span class="mono" data-slot="estimate"></span></p>
                        <span class="slot-bar" aria-hidden="true"><span data-slot="bar"></span></span>
                        <p class="slot-chance mono" data-slot="chance" aria-hidden="true" hidden></p>
                        <button type="button" class="btn btn-primary btn-small slot-pull" data-pull="${m}" data-fid="w8-pull${m}" aria-label="${A.escapeHTML(api.text("pullLabel", { name: names[m] }))}">
                            <span aria-hidden="true">🎰</span> ${api.text("pull")}
                        </button>
                        <p class="slot-robot mono" data-slot="robotRow"></p>
                    </div>`;
                }).join("")}</div>
                <div class="slot-score">
                    <p data-slot="you"></p>
                    <p data-slot="left"></p>
                    <p data-slot="robotScore"></p>
                </div>
                <div class="slot-end" data-slot="end" hidden>
                    <p class="slot-end-title" data-slot="endText"></p>
                    <p data-slot="best"></p>
                    <p data-slot="scores"></p>
                    <div class="lsn-lab-actions">
                        <button type="button" class="btn btn-ghost btn-small" data-slot="again" data-fid="w8-again"><span aria-hidden="true">↻</span> ${api.text("again")}</button>
                    </div>
                </div>
                <p class="lsn-lab-small">${api.text("bandit")}</p>
            </div>`;

        const lab = host.firstElementChild;
        const part = function (name, root) { return (root || lab).querySelector('[data-slot="' + name + '"]'); };
        const machines = Array.prototype.slice.call(lab.querySelectorAll(".slot-machine"));

        // ---------- 4. Updating it ----------
        // "2 ÷ 3 = 0.67", or "not tried yet"
        function estimateText(player, m) {
            if (!player.pulls[m]) return api.text("untried");
            const value = A.format.number(player.stars[m] / player.pulls[m], 2);
            return api.text("estimateMath", { wins: player.stars[m], pulls: player.pulls[m], value: value });
        }

        function chancesText() {
            return MACHINES.map(function (m) { return names[m] + ": " + A.format.percent(state.game.chances[m]); }).join(", ");
        }

        function update() {
            const game = state.game;
            const left = PULLS - sum(game.you.pulls);
            const over = left === 0;
            const best = game.chances.indexOf(Math.max.apply(null, game.chances));
            machines.forEach(function (box, m) {
                const pulls = game.you.pulls[m];
                const last = game.you.last[m];
                A.dom.setText(part("reel", box), last === null ? ICONS.waiting : last ? ICONS.star : ICONS.none);
                A.dom.setText(part("stats", box), api.text("pulls", { n: pulls }) + " · " + api.text("stars", { n: game.you.stars[m] }));
                A.dom.setText(part("estimate", box), estimateText(game.you, m));
                part("bar", box).style.width = (pulls ? 100 * game.you.stars[m] / pulls : 0) + "%";
                A.dom.setText(part("chance", box), A.format.percent(game.chances[m]));
                A.dom.setHidden(part("chance", box), !over);
                box.classList.toggle("is-best", over && m === best);
                box.classList.toggle("is-last", game.last === m);
                A.dom.setAttr(box.querySelector("[data-pull]"), "aria-disabled", String(over));
                A.dom.setText(part("robotRow", box), api.text("robotRow", { math: estimateText(game.robot, m) }));
                A.dom.setHidden(part("robotRow", box), !state.robotOn);
            });
            A.dom.setAttr(part("robot"), "aria-checked", String(state.robotOn));
            A.dom.setHidden(part("note"), !state.robotOn);
            A.dom.setText(part("you"), api.text("score", { n: sum(game.you.stars) }));
            A.dom.setText(part("left"), api.plural("left", left));
            A.dom.setText(part("robotScore"), api.text("robotScore", { n: sum(game.robot.stars) }));
            A.dom.setHidden(part("robotScore"), !state.robotOn);
            A.dom.setHidden(part("end"), !over);
            if (over) {
                A.dom.setText(part("endText"), api.text("end", { chances: chancesText() }));
                A.dom.setText(part("best"), api.text("best", {
                    name: names[best],
                    expected: A.format.number(PULLS * game.chances[best], 1),
                    pulls: PULLS,
                    p: A.format.percent(game.chances[best])
                }));
                A.dom.setText(part("scores"), scoresText());
            }
        }

        function scoresText() {
            const you = sum(state.game.you.stars);
            if (!state.robotOn) return api.text("you", { you: you });
            return api.text("youRobot", { you: you, robot: sum(state.game.robot.stars) });
        }

        // ---------- 5. Pulls, the robot and a new game ----------
        // The robot makes as many pulls as the learner has made (it catches up when switched on)
        function robotCatchUp() {
            const game = state.game;
            while (state.robotOn && sum(game.robot.pulls) < sum(game.you.pulls)) pull(game, game.robot, robotChoice(game.robot));
        }

        function pullMachine(m) {
            const game = state.game;
            if (sum(game.you.pulls) >= PULLS) return;
            const star = pull(game, game.you, m);
            game.last = m;
            robotCatchUp();
            update();
            if (api.motion.ok()) A.dom.replay(machines[m].querySelector(".slot-reel"), "is-spin");
            const left = PULLS - sum(game.you.pulls);
            let message = api.text("result", {
                name: names[m],
                result: api.text(star ? "star" : "noStar"),
                math: estimateText(game.you, m),
                left: api.plural("left", left)
            });
            if (!left) message += " " + part("endText").textContent + " " + part("best").textContent + " " + scoresText();
            api.announce(message);   // at the end, the focus stays on the (now inactive) button: "Play again" is next
        }

        lab.addEventListener("click", function (event) {
            const pullButton = event.target.closest("[data-pull]");
            if (pullButton) {
                pullMachine(Number(pullButton.getAttribute("data-pull")));
                return;
            }
            const button = event.target.closest('[data-slot="robot"], [data-slot="again"]');
            if (!button) return;
            if (button.getAttribute("data-slot") === "robot") {
                state.robotOn = !state.robotOn;
                robotCatchUp();
                update();
                return;
            }
            state.game = newGame();
            update();
            api.announce(api.text("newGame"));
            lab.querySelector("[data-pull]").focus();   // "Play again" is hidden now
        });

        update();
    }

    // ---------- 6. The lab for js/lessons.js ----------
    // No timers and no listeners outside host, so there is nothing to stop.
    A.lessons.defineLab("slots", { build: build });
})();
