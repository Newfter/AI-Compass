/* =========================================================
   AI COMPASS — MINI-LAB "PROJECT PLANNER" (lesson 15)
   A plant-leaf health app, planned in four decisions (data, labels,
   testing, what users are told). Each decision has three options: one
   strong, the others "could be better" or "a problem", each with a
   reason. After the fourth step, the plan: every choice with its grade
   and the count of strong choices. Back and "Plan again" change choices.
   Loaded by js/lessons.js (see "A MINI-LAB IN ITS OWN FILE" there).
   Texts: "lessons.w15.*" (js/content/lessons-world.js). Styles:
   css/lessons-labs.css ("pln-"). Sections:
    1. Settings
    2. Drawing and updating the lab
    3. The lab for js/lessons.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lessons) return;

    // ---------- 1. Settings ----------
    // Each step: its id and the grade of options a, b, c ("good", "ok" or "bad").
    // Texts: "q.<id>", "<id>.<a|b|c>" (the option), "f.<id>.<a|b|c>" (why).
    const STEPS = [
        { id: "data", grades: { a: "bad", b: "good", c: "bad" } },
        { id: "labels", grades: { a: "ok", b: "good", c: "bad" } },
        { id: "test", grades: { a: "bad", b: "good", c: "ok" } },
        { id: "people", grades: { a: "bad", b: "good", c: "bad" } }
    ];
    const OPTIONS = ["a", "b", "c"];
    const MARKS = { good: "✓", ok: "~", bad: "✗" };

    // ---------- 2. Drawing and updating the lab ----------
    function build(host, api) {
        const state = api.state;
        if (!state.choices) Object.assign(state, { choices: {}, step: 0 });

        host.innerHTML = `<div class="pln-lab"><div data-pln="body"></div></div>`;
        const lab = host.firstElementChild;
        const body = lab.querySelector('[data-pln="body"]');

        function grade(step) {
            const choice = state.choices[step.id];
            return choice ? step.grades[choice] : "";
        }

        function feedbackHTML(step) {
            const choice = state.choices[step.id];
            if (!choice) return "";
            const g = step.grades[choice];
            return `<p class="pln-feedback is-${g}" role="status"><strong>${MARKS[g]} ${api.text("grade." + g)}.</strong> ${api.text("f." + step.id + "." + choice)}</p>`;
        }

        function stepHTML(index) {
            const step = STEPS[index];
            const choice = state.choices[step.id];
            return `
                <p class="lsn-lab-sub mono">${api.text("step", { n: index + 1, total: STEPS.length })}</p>
                <span class="pln-dots" aria-hidden="true">${STEPS.map(function (s, i) {
                    return `<i class="${i < index ? "is-past" : i === index ? "is-now" : ""}"></i>`;
                }).join("")}</span>
                <fieldset class="pln-step">
                    <legend class="pln-q">${api.text("q." + step.id)}</legend>
                    ${OPTIONS.map(function (option) {
                        const id = "pln-" + step.id + "-" + option;
                        return `<label class="pln-option${choice === option ? " is-" + step.grades[option] : ""}" for="${id}">
                                    <input type="radio" name="pln-${step.id}" id="${id}" value="${option}" data-fid="w15-${step.id}-${option}"${choice === option ? " checked" : ""}>
                                    <span>${api.text(step.id + "." + option)}</span>
                                </label>`;
                    }).join("")}
                </fieldset>
                ${feedbackHTML(step)}
                <div class="lsn-lab-actions">
                    ${index > 0 ? `<button type="button" class="btn btn-ghost btn-small" data-pln="back" data-fid="w15-back"><span aria-hidden="true">←</span> ${api.text("back")}</button>` : ""}
                    <button type="button" class="btn btn-primary btn-small" data-pln="next" data-fid="w15-next"${choice ? "" : ' aria-disabled="true"'}>${api.text("next")} <span aria-hidden="true">→</span></button>
                </div>`;
        }

        function summaryHTML() {
            const good = STEPS.filter(function (step) { return grade(step) === "good"; }).length;
            return `
                <p class="lsn-lab-sub mono">${api.text("summary")}</p>
                <ol class="pln-summary">${STEPS.map(function (step) {
                    const g = grade(step);
                    return `<li class="is-${g}"><span class="pln-mark" aria-hidden="true">${MARKS[g]}</span>
                                <span><strong>${api.text("q." + step.id)}</strong> ${api.text(step.id + "." + state.choices[step.id])}
                                <span class="sr-only">(${api.text("grade." + g)})</span></span></li>`;
                }).join("")}</ol>
                <p class="lsn-lab-status${good === STEPS.length ? " is-done" : ""}">${api.text("score", { n: A.format.number(good), total: A.format.number(STEPS.length) })}. ${api.text(good === STEPS.length ? "allGood" : "someWeak")}</p>
                <div class="lsn-lab-actions">
                    <button type="button" class="btn btn-ghost btn-small" data-pln="back" data-fid="w15-back"><span aria-hidden="true">←</span> ${api.text("back")}</button>
                    <button type="button" class="btn btn-ghost btn-small" data-pln="again" data-fid="w15-again"><span aria-hidden="true">↺</span> ${api.text("again")}</button>
                </div>`;
        }

        function update() {
            body.innerHTML = state.step >= STEPS.length ? summaryHTML() : stepHTML(state.step);
        }

        function focus(fid) {
            const target = body.querySelector('[data-fid="' + fid + '"]');
            if (target) target.focus();
        }

        lab.addEventListener("change", function (event) {
            const input = event.target.closest('input[type="radio"]');
            if (!input) return;
            const step = STEPS[state.step];
            state.choices[step.id] = input.value;
            update();
            focus("w15-" + step.id + "-" + input.value);
            const g = step.grades[input.value];
            api.announce(api.text("grade." + g) + ". " + api.text("f." + step.id + "." + input.value));
        });

        lab.addEventListener("click", function (event) {
            const button = event.target.closest("[data-pln]");
            if (!button || button.getAttribute("aria-disabled") === "true") return;
            const action = button.getAttribute("data-pln");
            if (action === "next" && state.choices[STEPS[state.step].id]) state.step++;
            else if (action === "back") state.step = Math.max(0, state.step - 1);
            else if (action === "again") {
                state.choices = {};
                state.step = 0;
            } else return;
            update();
            const first = body.querySelector("input:checked") || body.querySelector("input, button");
            if (first) first.focus();
        });

        update();
    }

    // ---------- 3. The lab for js/lessons.js ----------
    A.lessons.defineLab("plan", { build: build });
})();
