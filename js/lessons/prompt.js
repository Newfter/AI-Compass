/* =========================================================
   AI COMPASS — MINI-LAB "PROMPT MAKEOVER" (lesson 12)
   A vague prompt ("Tell me about volcanoes.") and five ingredients to
   switch on and off: a role, context, a clear task, an example and a
   format. Each one changes the prompt, a scripted answer and a quality
   meter (the meter just counts the ingredients, and says so).
   The answer is put together from texts written in advance:
     clear task   three points about why some volcanoes explode
                  ("focused1"-"focused3"), otherwise three general
                  points ("general1"-"general3")
     context      each point in simple words (".easy") instead of the
                  textbook version (".hard"), and a closing offer to
                  quiz the learner before the test
     example      each point gets an everyday comparison (".like")
     format       the points as a list instead of one paragraph
     role         a friendly teacher's opening line
   Loaded by js/lessons.js (see "A MINI-LAB IN ITS OWN FILE" there).
   Texts: "lessons.w12.*" (js/content/lessons-deep.js). Styles:
   css/lessons-labs.css ("prompt-"). Sections:
    1. Settings
    2. Drawing the lab
    3. The prompt and the answer
    4. Updating the lab
    5. Switching ingredients on and off
    6. The lab for js/lessons.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lessons) return;

    // ---------- 1. Settings ----------
    // The ingredients, in the order they appear in the prompt. Texts: "i.<id>" (the
    // name), "part.<id>" (what it adds to the prompt), "effect.<id>" (what it changes).
    // The meter has a word for each number of ingredients switched on: "level.0" to
    // "level.5" (add "level.6" if you add an ingredient).
    const INGREDIENTS = [
        { id: "role", icon: "🎭" },
        { id: "context", icon: "🧭" },
        { id: "task", icon: "🎯" },
        { id: "example", icon: "💡" },
        { id: "format", icon: "📋" }
    ];
    const POINTS = 3;   // each answer has this many points ("general1"-"general3", "focused1"-"focused3")

    // ---------- 2. Drawing the lab ----------
    function build(host, api) {
        const state = api.state;
        if (!state.on) {
            state.on = {};
            INGREDIENTS.forEach(function (item) { state.on[item.id] = false; });
            state.last = null;   // the last change: { id, on }, shown under the ingredients
        }

        host.innerHTML = `
            <div class="prompt-lab">
                <div class="prompt-box">
                    <p class="lsn-lab-sub mono" id="prompt-yours">${api.text("yourPrompt")}</p>
                    <p class="prompt-text" aria-labelledby="prompt-yours" data-makeover="prompt"></p>
                </div>
                <div class="prompt-ingredients" role="group" aria-labelledby="prompt-ingredients">
                    <p class="lsn-lab-sub mono" id="prompt-ingredients">${api.text("ingredients")}</p>
                    <div class="prompt-chips">${INGREDIENTS.map(function (item) {
                        return `<button type="button" class="prompt-chip" data-kind="${item.id}" data-ingredient="${item.id}" data-fid="w12-${item.id}" aria-pressed="false">
                                    <span class="prompt-chip-icon" aria-hidden="true">${item.icon}</span>
                                    <span>${api.text("i." + item.id)}</span>
                                    <span class="prompt-chip-mark" aria-hidden="true"></span>
                                </button>`;
                    }).join("")}</div>
                    <p class="lsn-lab-status prompt-status" data-makeover="status" hidden></p>
                </div>
                <div class="prompt-meter">
                    <p class="prompt-meter-head">
                        <span class="lsn-lab-sub mono">${api.text("meter")}</span>
                        <strong class="prompt-level" data-makeover="level"></strong>
                        <span class="prompt-count mono" data-makeover="count"></span>
                    </p>
                    <span class="prompt-bar" aria-hidden="true">${INGREDIENTS.map(function () { return "<i></i>"; }).join("")}</span>
                    <p class="lsn-lab-small">${api.text("meterNote")}</p>
                </div>
                <div class="prompt-answer">
                    <p class="lsn-lab-sub mono" id="prompt-answer"><span aria-hidden="true">🤖</span> ${api.text("answer")}</p>
                    <div class="prompt-bubble" role="group" aria-labelledby="prompt-answer" data-makeover="answer"></div>
                </div>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-small prompt-honest">${api.text("honest")}</p>
                    <button type="button" class="btn btn-ghost btn-small" data-makeover="reset" data-fid="w12-reset"><span aria-hidden="true">↺</span> ${api.text("reset")}</button>
                </div>
            </div>`;

        const lab = host.firstElementChild;
        const part = function (name) { return lab.querySelector('[data-makeover="' + name + '"]'); };
        const chips = Array.prototype.slice.call(lab.querySelectorAll("[data-ingredient]"));
        const segments = Array.prototype.slice.call(lab.querySelectorAll(".prompt-bar i"));

        // ---------- 3. The prompt and the answer ----------
        function countOn() {
            return INGREDIENTS.filter(function (item) { return state.on[item.id]; }).length;
        }

        // The prompt: one coloured piece per ingredient that is on. The clear task takes
        // the place of the vague question.
        function promptHTML() {
            const pieces = [];
            INGREDIENTS.forEach(function (item) {
                if (item.id === "task" && !state.on.task) {
                    pieces.push(`<span class="prompt-piece is-vague">${api.text("base")}</span>`);
                } else if (state.on[item.id]) {
                    pieces.push(`<span class="prompt-piece" data-kind="${item.id}">${api.text("part." + item.id)}</span>`);
                }
            });
            return pieces.join(" ");
        }

        // The answer, put together as the header of this file explains
        function answerHTML() {
            const on = state.on;
            const topic = on.task ? "focused" : "general";
            const level = on.context ? "easy" : "hard";
            const points = [];
            for (let i = 1; i <= POINTS; i++) {
                let text = api.text(topic + i + "." + level);
                if (on.example) text += " " + api.text(topic + i + ".like");
                points.push(text);
            }
            let html = on.role ? `<p data-kind="role">${api.text("opening")}</p>` : "";
            if (on.format) {
                html += `<ul class="prompt-list" data-kind="format">${points.map(function (text) { return "<li>" + text + "</li>"; }).join("")}</ul>`;
            } else {
                html += `<p>${points.join(" ")}</p>`;
            }
            if (on.context) html += `<p data-kind="context">${api.text("closing")}</p>`;
            return html;
        }

        // The last change ("Added “Role”: ..."), from state.last = { id, on }, or ""
        function statusText() {
            const last = state.last;
            if (!last) return "";
            const name = api.text("i." + last.id);
            return last.on ? api.text("on", { name: name, effect: api.text("effect." + last.id) }) : api.text("off", { name: name });
        }

        function meterText() {
            const count = countOn();
            return api.text("meterSay", {
                level: api.text("level." + count),
                count: api.plural("count", INGREDIENTS.length, { n: count, total: INGREDIENTS.length })
            });
        }

        // ---------- 4. Updating the lab ----------
        function update() {
            const count = countOn();
            chips.forEach(function (chip) {
                A.dom.setAttr(chip, "aria-pressed", String(state.on[chip.getAttribute("data-ingredient")]));
            });
            part("prompt").innerHTML = promptHTML();
            part("answer").innerHTML = answerHTML();
            segments.forEach(function (segment, i) {
                segment.classList.toggle("is-on", i < count);
            });
            A.dom.setText(part("level"), api.text("level." + count));
            A.dom.setText(part("count"), api.plural("count", INGREDIENTS.length, { n: count, total: INGREDIENTS.length }));
            lab.style.setProperty("--prompt-fill", String(count / INGREDIENTS.length));
            A.dom.setAttr(part("reset"), "aria-disabled", String(count === 0));
            A.dom.setText(part("status"), statusText());
            A.dom.setHidden(part("status"), !state.last);
        }

        // ---------- 5. Switching ingredients on and off ----------
        function toggle(id) {
            state.on[id] = !state.on[id];
            state.last = { id: id, on: state.on[id] };
            update();
            if (api.motion.ok()) A.dom.replay(part("answer"), "is-new");
            api.announce(statusText() + " " + meterText());
        }

        lab.addEventListener("click", function (event) {
            const chip = event.target.closest("[data-ingredient]");
            if (chip) {
                toggle(chip.getAttribute("data-ingredient"));
                return;
            }
            if (!event.target.closest('[data-makeover="reset"]') || countOn() === 0) return;
            INGREDIENTS.forEach(function (item) { state.on[item.id] = false; });
            state.last = null;
            update();
            api.announce(api.text("resetDone") + " " + meterText());
        });

        update();
    }

    // ---------- 6. The lab for js/lessons.js ----------
    // No timers and no listeners outside host, so there is nothing to stop.
    A.lessons.defineLab("prompt", { build: build });
})();
