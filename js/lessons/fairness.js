/* =========================================================
   AI COMPASS — MINI-LAB "FAIR OR NOT?" (lesson 11)
   Four short cases, one at a time: a loan app, a job filter, a
   face-unlock test and an essay checker. For each one the learner
   picks what the problem is (one of three answers), then sees why,
   and what would help. The face-unlock case has numbers to explore:
   one overall accuracy hides a much worse result for one group, and
   a switch splits the results by skin tone. Every number and
   percentage of that case is worked out from FACE_TEST below.
   Loaded by js/lessons.js (see "A MINI-LAB IN ITS OWN FILE" there).
   Texts: "lessons.w11.*" (js/content/lessons-deep.js). Styles:
   css/lessons-labs.css ("fair-"). Sections:
    1. Settings
    2. The face-unlock numbers
    3. Drawing the lab
    4. Drawing a case
    5. Updating the case list and the score
    6. Answers, moving between cases and starting over
    7. The lab for js/lessons.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lessons) return;

    // ---------- 1. Settings ----------
    // The cases, in order: an emoji and the right answer (0, 1 or 2). Their texts are
    // "lessons.w11.c<number>.tag", ".story", ".o1" to ".o3", ".why" and ".help".
    const CASES = [
        { icon: "🏦", correct: 1 },
        { icon: "📄", correct: 0 },
        { icon: "📱", correct: 2, faceTest: true },   // shows the numbers of FACE_TEST
        { icon: "📝", correct: 2 }
    ];
    const LETTERS = ["A", "B", "C"];   // one per answer
    // The face-unlock test: the photos of each group, and how many of them it got right
    const FACE_TEST = {
        light: { photos: 900, right: 882 },
        dark: { photos: 100, right: 68 }
    };
    const GROUPS = ["light", "dark"];

    // ---------- 2. The face-unlock numbers ----------
    // All the photos together: 1000 photos, 950 right
    function faceTotal() {
        const total = { photos: 0, right: 0 };
        GROUPS.forEach(function (group) {
            total.photos += FACE_TEST[group].photos;
            total.right += FACE_TEST[group].right;
        });
        return total;
    }

    // The values for the {placeholders} of the face-unlock texts
    function faceValues() {
        const total = faceTotal();
        return {
            photos: A.format.number(total.photos),
            right: A.format.number(total.right),
            p: A.format.percent(total.right / total.photos),
            light: A.format.percent(FACE_TEST.light.right / FACE_TEST.light.photos),
            dark: A.format.percent(FACE_TEST.dark.right / FACE_TEST.dark.photos),
            share: A.format.percent(FACE_TEST.dark.photos / total.photos)
        };
    }

    // ---------- 3. Drawing the lab ----------
    function build(host, api) {
        const state = api.state;
        if (!state.answers) Object.assign(state, { at: 0, answers: CASES.map(function () { return null; }), split: false });

        host.innerHTML = `
            <div class="fair-lab">
                <div class="fair-top">
                    <ol class="fair-dots" aria-label="${A.escapeHTML(api.text("cases"))}">${CASES.map(function (info, i) {
                        return `<li><button type="button" class="fair-dot" data-go="${i}" data-fid="w11-dot${i}">${i + 1}</button></li>`;
                    }).join("")}</ol>
                    <p class="lsn-lab-score" data-fair="score"></p>
                </div>
                <article class="fair-case" data-fair="case"></article>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-win fair-done" data-fair="done" hidden></p>
                    <button type="button" class="btn btn-ghost btn-small" data-fair="reset" data-fid="w11-reset"><span aria-hidden="true">↺</span> ${api.text("reset")}</button>
                </div>
            </div>`;

        const lab = host.firstElementChild;
        const part = function (name) { return lab.querySelector('[data-fair="' + name + '"]'); };
        const caseBox = part("case");
        const dots = Array.prototype.slice.call(lab.querySelectorAll("[data-go]"));

        // A text of case i: "lessons.w11.c<i + 1>.<name>" (the face-unlock numbers fill its placeholders)
        function caseText(i, name) {
            return api.text("c" + (i + 1) + "." + name, faceValues());
        }

        function isRight(i) {
            return state.answers[i] === CASES[i].correct;
        }

        // ---------- 4. Drawing a case ----------
        function caseHTML() {
            const i = state.at;
            const info = CASES[i];
            const chosen = state.answers[i];
            const answered = chosen !== null;
            const options = LETTERS.map(function (letter, o) {
                let stateClass = "";
                if (answered) {
                    if (o === info.correct) stateClass = " is-correct";
                    else if (o === chosen) stateClass = " is-wrong";
                    else stateClass = " is-dim";
                }
                return `<button type="button" class="lsn-option ui-option fair-option${stateClass}" data-answer="${o}" data-fid="w11-c${i}-o${o}"
                            aria-pressed="${chosen === o}"${answered ? ' aria-disabled="true"' : ""}>
                            <span class="lsn-option-mark mono" aria-hidden="true">${letter}</span>
                            <span>${caseText(i, "o" + (o + 1))}</span>
                        </button>`;
            });
            return `
                <p class="fair-tag mono"><span aria-hidden="true">${info.icon}</span> ${api.text("caseOf", { n: i + 1, total: CASES.length })}</p>
                <h4 class="fair-title" tabindex="-1" data-fid="w11-title">${caseText(i, "tag")}</h4>
                <p class="fair-story">${caseText(i, "story")}</p>
                ${info.faceTest ? faceTestHTML() : ""}
                <p class="fair-question" id="fair-question">${api.text("question")}</p>
                <div class="lsn-options fair-options" role="group" aria-labelledby="fair-question">${options.join("")}</div>
                ${answered ? feedbackHTML(i) : ""}`;
        }

        // The test results as bars: all the photos, and (split) each group. A result
        // below the overall one is marked, so the gap stands out.
        function faceTestHTML() {
            const total = faceTotal();
            const rows = [{ name: api.text("c3.all"), photos: total.photos, right: total.right }];
            if (state.split) {
                GROUPS.forEach(function (group) {
                    rows.push({ name: api.text("c3." + group), photos: FACE_TEST[group].photos, right: FACE_TEST[group].right });
                });
            }
            const overall = total.right / total.photos;
            return `
                <div class="fair-test">
                    <ul class="fair-bars">${rows.map(function (row) {
                        const share = row.right / row.photos;
                        return `
                        <li class="fair-bar-row${share < overall ? " is-low" : ""}">
                            <span class="fair-bar-name">${row.name}</span>
                            <span class="fair-bar" aria-hidden="true"><span style="width: ${share * 100}%"></span></span>
                            <span class="fair-bar-value mono">${api.text("c3.row", { right: A.format.number(row.right), photos: A.format.number(row.photos), p: A.format.percent(share) })}</span>
                        </li>`;
                    }).join("")}</ul>
                    <button type="button" class="fair-switch ui-switch" role="switch" aria-checked="${state.split}" data-fair="split" data-fid="w11-split">
                        <span class="ui-switch-track" aria-hidden="true"><span class="ui-switch-knob"></span></span>${api.text("c3.split")}
                    </button>
                    ${state.split ? `<p class="fair-share">${api.text("c3.share", faceValues())}</p>` : ""}
                </div>`;
        }

        function feedbackHTML(i) {
            const right = isRight(i);
            const next = nextOpen();
            return `
                <div class="lsn-feedback-box fair-feedback ${right ? "is-correct" : "is-wrong"}">
                    <p class="lsn-feedback-title"><span aria-hidden="true">${right ? "🕵️" : "🤔"}</span> ${api.text(right ? "right" : "wrong")}</p>
                    ${right ? "" : `<p><strong>${api.text("answer")}</strong> ${caseText(i, "o" + (CASES[i].correct + 1))}.</p>`}
                    <p><strong>${api.text("why")}</strong> ${caseText(i, "why")}</p>
                    <p><strong>${api.text("help")}</strong> ${caseText(i, "help")}</p>
                    ${next === -1 ? "" : `<button type="button" class="btn btn-primary btn-small" data-fair="next" data-fid="w11-next">${api.text("next")} <span aria-hidden="true">→</span></button>`}
                </div>`;
        }

        // Draws the case again. The focus stays on the same control (the same data-fid).
        function drawCase() {
            const focused = document.activeElement;
            const fid = focused && caseBox.contains(focused) ? focused.getAttribute("data-fid") : null;
            caseBox.innerHTML = caseHTML();
            const again = fid ? caseBox.querySelector('[data-fid="' + fid + '"]') : null;
            if (again) again.focus({ preventScroll: true });
        }

        // ---------- 5. Updating the case list and the score ----------
        function update() {
            let spotted = 0;
            let answered = 0;
            dots.forEach(function (dot, i) {
                let status = "open";
                if (state.answers[i] !== null) {
                    answered += 1;
                    status = isRight(i) ? "spotted" : "missed";
                    if (status === "spotted") spotted += 1;
                }
                A.dom.setAttr(dot, "class", "fair-dot is-" + status + (i === state.at ? " is-now" : ""));
                A.dom.setAttr(dot, "aria-label", api.text("dot", { n: i + 1, status: api.text(status) }));
                if (i === state.at) dot.setAttribute("aria-current", "step");
                else dot.removeAttribute("aria-current");
            });
            A.dom.setText(part("score"), api.text("score", { n: spotted, total: CASES.length }));
            A.dom.setText(part("done"), api.text("allDone"));
            A.dom.setHidden(part("done"), answered < CASES.length);
            A.dom.setHidden(part("reset"), answered === 0);
        }

        // ---------- 6. Answers, moving between cases and starting over ----------
        // The next case still to answer after the current one (going round), or -1
        function nextOpen() {
            for (let step = 1; step < CASES.length; step++) {
                const i = (state.at + step) % CASES.length;
                if (state.answers[i] === null) return i;
            }
            return -1;
        }

        // Shows case i; the focus goes to its title, so screen readers read the new case
        function goTo(i) {
            state.at = i;
            drawCase();
            update();
            caseBox.querySelector(".fair-title").focus();
        }

        function answer(o) {
            const i = state.at;
            if (state.answers[i] !== null) return;
            state.answers[i] = o;
            drawCase();
            update();
            let message = api.text(isRight(i) ? "right" : "wrong");
            if (!isRight(i)) message += " " + api.text("answer") + " " + caseText(i, "o" + (CASES[i].correct + 1)) + ".";
            message += " " + api.text("why") + " " + caseText(i, "why");
            if (!part("done").hidden) message += " " + api.text("allDone");
            api.announce(message);
        }

        lab.addEventListener("click", function (event) {
            const option = event.target.closest("[data-answer]");
            if (option) {
                answer(Number(option.getAttribute("data-answer")));
                return;
            }
            const dot = event.target.closest("[data-go]");
            if (dot) {
                goTo(Number(dot.getAttribute("data-go")));
                return;
            }
            const button = event.target.closest("[data-fair]");
            const action = button ? button.getAttribute("data-fair") : "";
            if (action === "next") {
                const next = nextOpen();
                if (next !== -1) goTo(next);
            } else if (action === "split") {
                state.split = !state.split;
                drawCase();
                if (state.split) {
                    const values = faceValues();
                    const say = GROUPS.map(function (group) {
                        return api.text("c3." + group) + ": " + api.text("c3.row", {
                            right: A.format.number(FACE_TEST[group].right),
                            photos: A.format.number(FACE_TEST[group].photos),
                            p: values[group]
                        });
                    });
                    api.announce(say.join(". ") + ". " + api.text("c3.share", values));
                }
            } else if (action === "reset") {
                Object.assign(state, { at: 0, answers: CASES.map(function () { return null; }), split: false });
                goTo(0);
                api.announce(api.text("resetDone"));
            }
        });

        drawCase();
        update();
    }

    // ---------- 7. The lab for js/lessons.js ----------
    // No timers and no listeners outside host, so there is nothing to stop.
    A.lessons.defineLab("fairness", { build: build });
})();
