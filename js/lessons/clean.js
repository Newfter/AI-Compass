/* =========================================================
   AI COMPASS — MINI-LAB "DATA DETECTIVE" (lesson 13)
   A small table that a class collected to train a model. Four rows have
   a problem (an impossible age, a typo, a duplicate, a missing value).
   Each row is a button: a broken row is marked "found" with what is
   wrong; a good row says it looks fine. All four found: the clean table.
   Loaded by js/lessons.js (see "A MINI-LAB IN ITS OWN FILE" there).
   Texts: "lessons.w13.*" (js/content/lessons-world.js). Styles:
   css/lessons-labs.css ("cln-"). Sections:
    1. Settings: the table
    2. Drawing and updating the lab
    3. The lab for js/lessons.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lessons) return;

    // ---------- 1. Settings: the table ----------
    // [name index, age, pet, hours outside (null: missing), problem or ""]
    // Names come from "names" (one list per language, so they read naturally).
    const ROWS = [
        [0, 14, "dog", 2, ""],
        [1, 150, "cat", 1, "age"],
        [2, 13, "fish", 3, ""],
        [3, 15, "dgo", 2, "typo"],
        [4, 14, "hamster", null, "missing"],
        [5, 13, "fish", 3, "dup"],
        [6, 15, "cat", 1.5, ""],
        [7, 14, "dog", 2.5, ""]
    ];
    const PROBLEMS = ROWS.filter(function (row) { return row[4]; }).length;

    // ---------- 2. Drawing and updating the lab ----------
    function build(host, api) {
        const state = api.state;
        if (!state.found) Object.assign(state, { found: {}, last: -1 });
        const names = api.text("names").split("|");
        const hours = function (value) { return value === null ? api.text("missing") : A.format.number(value, 1); };
        const cells = function (row) {
            return [names[row[0]], A.format.number(row[1]), api.text("pet." + row[2]), hours(row[3])];
        };

        host.innerHTML = `
            <div class="cln-lab">
                <div class="cln-table" role="group" aria-labelledby="cln-found">
                    <div class="cln-row cln-head" aria-hidden="true">
                        <span>#</span><span>${api.text("colName")}</span><span>${api.text("colAge")}</span><span>${api.text("colPet")}</span><span>${api.text("colHours")}</span>
                    </div>
                    ${ROWS.map(function (row, i) {
                        const c = cells(row);
                        return `<button type="button" class="cln-row" data-row="${i}" data-fid="w13-row${i}" aria-pressed="false"
                                    aria-label="${A.escapeHTML(api.text("rowLabel", { n: i + 1, name: c[0], age: c[1], pet: c[2], hours: c[3] }))}">
                                    <span class="mono">${i + 1}</span>${c.map(function (text, k) {
                                        return `<span class="${k === 3 && row[3] === null ? "cln-empty" : ""}">${text}</span>`;
                                    }).join("")}
                                </button>`;
                    }).join("")}
                </div>
                <p class="lsn-lab-sub mono" id="cln-found" data-cln="count"></p>
                <p class="lsn-lab-status" data-cln="status" hidden></p>
                <div class="lsn-lab-actions">
                    <button type="button" class="btn btn-ghost btn-small" data-cln="reset" data-fid="w13-reset"><span aria-hidden="true">↺</span> ${api.text("reset")}</button>
                </div>
            </div>`;

        const lab = host.firstElementChild;
        const part = function (name) { return lab.querySelector('[data-cln="' + name + '"]'); };
        const buttons = Array.prototype.slice.call(lab.querySelectorAll("button[data-row]"));

        function foundCount() {
            return Object.keys(state.found).length;
        }

        function statusText() {
            if (foundCount() === PROBLEMS) return api.text("done");
            if (state.last === -1) return "";
            const problem = ROWS[state.last][4];
            return problem ? api.text("p." + problem) : api.text("fine");
        }

        function update() {
            buttons.forEach(function (button, i) {
                const found = Boolean(state.found[i]);
                const fine = state.last === i && !ROWS[i][4];
                button.classList.toggle("is-found", found);
                button.classList.toggle("is-fine", fine);
                A.dom.setAttr(button, "aria-pressed", String(found));
            });
            A.dom.setText(part("count"), api.text("found", { n: A.format.number(foundCount()), total: A.format.number(PROBLEMS) }));
            const status = statusText();
            A.dom.setText(part("status"), status);
            A.dom.setHidden(part("status"), !status);
            part("status").classList.toggle("is-done", foundCount() === PROBLEMS);
            A.dom.setAttr(part("reset"), "aria-disabled", String(foundCount() === 0 && state.last === -1));
        }

        lab.addEventListener("click", function (event) {
            const button = event.target.closest("button[data-row]");
            if (button) {
                const i = Number(button.getAttribute("data-row"));
                state.last = i;
                if (ROWS[i][4]) state.found[i] = true;
                update();
                api.announce(api.text("found", { n: A.format.number(foundCount()), total: A.format.number(PROBLEMS) }) + ". " + statusText());
                return;
            }
            if (event.target.closest('[data-cln="reset"]')) {
                state.found = {};
                state.last = -1;
                update();
            }
        });

        update();
    }

    // ---------- 3. The lab for js/lessons.js ----------
    // No timers and no listeners outside host, so there is nothing to stop.
    A.lessons.defineLab("clean", { build: build });
})();
