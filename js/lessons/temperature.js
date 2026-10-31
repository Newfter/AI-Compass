/* =========================================================
   AI COMPASS — MINI-LAB "TEMPERATURE DIAL" (lesson 9)
   A language model has given each possible next word a score. Softmax
   with temperature turns the scores into probabilities: divide each
   score by the temperature T, raise e to that power, then divide each
   result by their sum. Low T: the top word almost always wins; high T:
   unlikely words get a real chance. "Generate" picks a word with those
   probabilities, and the count of each word shows how often it came
   up. "Show the maths" has a table with every step.
   Loaded by js/lessons.js (see "A MINI-LAB IN ITS OWN FILE" there).
   Texts: "lessons.w9.*" (js/content/lessons-deep.js). Styles:
   css/lessons-labs.css ("tmp-"). Sections:
    1. Settings
    2. The maths: softmax with temperature
    3. Drawing the lab
    4. Updating it
    5. Generating words
    6. The lab for js/lessons.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lessons) return;

    // ---------- 1. Settings ----------
    const SCORES = [3.0, 2.2, 1.6, 1.0, 0.4, -0.6];   // made-up scores of the six words ("logits"), best first
    const T_MIN = 0.2;                                // the temperature dial goes from T_MIN to T_MAX ...
    const T_MAX = 2;
    const T_STEP = 0.1;                               // ... in steps of T_STEP
    const T_START = 1;                                // where the dial starts (at 1 the scores are used as they are)
    const MANY = 10;                                  // the words that "Generate 10" picks

    // ---------- 2. The maths: softmax with temperature ----------
    // Each step is kept, so the table can show it. Math.exp(score ÷ T) is at most
    // e^15 (about 3.3 million) here, so the numbers never get too big for JavaScript.
    function softmax(temperature) {
        const scaled = SCORES.map(function (score) { return score / temperature; });
        const weights = scaled.map(Math.exp);
        const sum = weights.reduce(function (total, weight) { return total + weight; }, 0);
        return {
            scaled: scaled,
            weights: weights,
            sum: sum,
            probabilities: weights.map(function (weight) { return weight / sum; })
        };
    }

    // e^(score ÷ T) goes from 0.05 to about 3.3 million: fewer decimals for the big
    // ones, and "3.27M" from 10,000 on (so the table fits on a phone)
    function weightText(value) {
        if (value >= 10000) return A.format.number(value, { compact: true, digits: 2 });
        return A.format.number(value, value >= 100 ? 0 : value >= 10 ? 1 : 2);
    }

    // ---------- 3. Drawing the lab ----------
    function build(host, api) {
        const state = api.state;
        if (!state.counts) Object.assign(state, { temp: T_START, counts: SCORES.map(function () { return 0; }), last: null });
        const words = api.text("words").split("|");
        const columns = ["colWord", "colScore", "colScaled", "colWeight", "colProb"];

        host.innerHTML = `
            <div class="tmp-lab">
                <p class="lsn-sentence">
                    <span class="lsn-sentence-prompt">${api.text("prompt")}</span>
                    <span class="lsn-blank" data-tmp="blank"></span>
                </p>
                <p class="lsn-lab-sub mono" id="tmp-probs">${api.text("probs")}</p>
                <ol class="tmp-bars" aria-labelledby="tmp-probs">${words.map(function (word, i) {
                    return `
                    <li class="tmp-bar">
                        <span class="tmp-word">${word}</span>
                        <span class="tmp-track" aria-hidden="true"><span class="tmp-fill" data-tmp="fill"></span></span>
                        <span class="tmp-value mono" data-tmp="value"></span>
                        <span class="tmp-count mono" data-tmp="count" data-row="${i}"></span>
                    </li>`;
                }).join("")}</ol>
                <div class="lsn-slider lsn-temp">
                    <label for="tmp-temp">${api.text("temp")}</label>
                    <output for="tmp-temp" class="mono" data-tmp="temp"></output>
                    <input class="lsn-range ui-range" type="range" id="tmp-temp" data-fid="w9-temp" min="${T_MIN}" max="${T_MAX}" step="${T_STEP}" value="${state.temp}">
                    <div class="lsn-temp-scale" aria-hidden="true"><span>❄ ${api.text("low")}</span><span>${api.text("high")} 🔥</span></div>
                </div>
                <p class="lsn-temp-note" data-tmp="note"></p>
                <div class="lsn-lab-actions">
                    <button type="button" class="btn btn-primary btn-small" data-generate="1" data-fid="w9-generate"><span aria-hidden="true">✨</span> ${api.text("generate")}</button>
                    <button type="button" class="btn btn-ghost btn-small" data-generate="${MANY}" data-fid="w9-many"><span aria-hidden="true">✨</span> ${api.text("generateMany", { n: MANY })}</button>
                    <button type="button" class="btn btn-ghost btn-small" data-tmp="clear" data-fid="w9-clear"><span aria-hidden="true">↺</span> ${api.text("clear")}</button>
                </div>
                <p class="tmp-tally"><span class="lsn-lab-sub mono">${api.text("tally")}</span> <span data-tmp="tally"></span></p>
                <details class="tmp-maths">
                    <summary data-fid="w9-maths">${api.text("maths")}</summary>
                    <p class="tmp-maths-intro">${api.text("mathsIntro")}</p>
                    <div class="tmp-table-box" role="region" tabindex="0" aria-label="${A.escapeHTML(api.text("table"))}">
                        <table class="tmp-table">
                            <thead><tr>${columns.map(function (key) { return `<th scope="col">${api.text(key)}</th>`; }).join("")}</tr></thead>
                            <tbody>${words.map(function (word, i) {
                                return `<tr><th scope="row">${word}</th><td class="mono">${A.format.number(SCORES[i], 1)}</td><td class="mono" data-row="${i}"></td><td class="mono" data-row="${i}"></td><td class="mono" data-row="${i}"></td></tr>`;
                            }).join("")}</tbody>
                            <tfoot><tr><th scope="row">${api.text("sum")}</th><td></td><td></td><td class="mono" data-tmp="sum"></td><td class="mono">${A.format.percent(1)}</td></tr></tfoot>
                        </table>
                    </div>
                </details>
                <p class="lsn-lab-small">${api.text("note")}</p>
            </div>`;

        const lab = host.firstElementChild;
        const part = function (name) { return lab.querySelector('[data-tmp="' + name + '"]'); };
        const all = function (name) { return Array.prototype.slice.call(lab.querySelectorAll('[data-tmp="' + name + '"]')); };
        const slider = lab.querySelector("#tmp-temp");
        const rows = Array.prototype.slice.call(lab.querySelectorAll(".tmp-table tbody tr"));
        if (state.maths) lab.querySelector(".tmp-maths").open = true;

        // ---------- 4. Updating it ----------
        function update() {
            const maths = softmax(state.temp);
            const total = state.counts.reduce(function (sum, n) { return sum + n; }, 0);
            const fills = all("fill");
            const percents = all("value");
            all("count").forEach(function (count, i) {
                fills[i].style.width = (maths.probabilities[i] * 100).toFixed(2) + "%";
                A.dom.setText(percents[i], A.format.percent(maths.probabilities[i], { digits: 1 }));
                count.innerHTML = total ? `<span aria-hidden="true">×${state.counts[i]}</span><span class="sr-only">${api.plural("times", state.counts[i])}</span>` : "";
                count.parentNode.classList.toggle("is-picked", state.last === i);
                const cells = rows[i].querySelectorAll("td[data-row]");
                A.dom.setText(cells[0], A.format.number(maths.scaled[i], 2));
                A.dom.setText(cells[1], weightText(maths.weights[i]));
                A.dom.setText(cells[2], A.format.percent(maths.probabilities[i], { digits: 1 }));
            });
            A.dom.setText(part("sum"), weightText(maths.sum));
            const temperature = A.format.number(state.temp, 1);
            A.dom.setText(part("temp"), temperature);
            slider.setAttribute("aria-valuetext", temperature);
            slider.style.setProperty("--fill", ((state.temp - T_MIN) / (T_MAX - T_MIN) * 100) + "%");
            // The note says what dividing by T does, compared with T = 1: below 1 the scores
            // move further apart (the top word gets likelier), above 1 they move closer
            // together (the unlikely words get likelier). The dial moves in steps of 0.1.
            const atOne = Math.abs(state.temp - 1) < T_STEP / 2;
            A.dom.setText(part("note"), api.text(atOne ? "tempMid" : state.temp < 1 ? "tempLow" : "tempHigh"));
            A.dom.setText(part("tally"), total ? api.plural("tallyCount", total) : api.text("empty"));
            const blank = part("blank");
            A.dom.setText(blank, state.last === null ? "…" : words[state.last]);
            blank.classList.toggle("is-filled", state.last !== null);
        }

        // ---------- 5. Generating words ----------
        // Picks "count" words, each with its probability (A.util.sampleWeighted)
        function generate(count) {
            const probabilities = softmax(state.temp).probabilities;
            const picked = [];
            for (let i = 0; i < count; i++) {
                const word = A.util.sampleWeighted(probabilities);
                state.counts[word] += 1;
                picked.push(word);
            }
            state.last = picked[picked.length - 1];
            update();
            if (api.motion.ok()) A.dom.replay(part("blank"), "is-pop");
            api.announce(count === 1
                ? api.text("picked", { word: words[state.last], p: A.format.percent(probabilities[state.last], { digits: 1 }) })
                : api.text("pickedMany", { list: picked.map(function (i) { return words[i]; }).join(", ") }));
        }

        lab.addEventListener("input", function (event) {
            if (event.target !== slider) return;
            state.temp = A.util.clamp(Number(slider.value) || T_START, T_MIN, T_MAX);
            update();
        });
        lab.addEventListener("click", function (event) {
            const button = event.target.closest('[data-generate], [data-tmp="clear"]');
            if (!button) return;
            if (button.hasAttribute("data-generate")) {
                generate(Number(button.getAttribute("data-generate")));
                return;
            }
            state.counts = SCORES.map(function () { return 0; });
            state.last = null;
            update();
            api.announce(api.text("empty"));
        });
        lab.querySelector(".tmp-maths").addEventListener("toggle", function (event) { state.maths = event.target.open; });

        update();
    }

    // ---------- 6. The lab for js/lessons.js ----------
    // No timers and no listeners outside host, so there is nothing to stop.
    A.lessons.defineLab("temperature", { build: build });
})();
