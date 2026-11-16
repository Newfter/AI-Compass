/* =========================================================
   AI COMPASS — THE HOME PAGE
   One small helper for the home page: the "Continue where you left off"
   button under the hero buttons. It shows only for a visitor who has
   finished at least one lesson (and not all of them), names the next
   lesson, and opens it with one tap.
   Its texts (English and Russian) are in js/content/page.js ("home.continue*").
   Nothing is saved by this file: it reads the lessons' progress (A.lessons).
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const button = document.querySelector("[data-home-continue]");
    if (!button) return;

    const titleEl = button.querySelector('[data-ref="title"]');
    const percentEl = button.querySelector('[data-ref="percent"]');

    // Which lesson the button opens right now (0: the button is hidden)
    let nextNumber = 0;

    function refresh() {
        const lessons = A.lessons;
        if (!lessons || typeof lessons.next !== "function") return;
        const done = lessons.completed().length;
        const total = lessons.count || 0;
        const next = lessons.next();
        nextNumber = done > 0 && next ? next : 0;
        A.dom.setHidden(button, !nextNumber);
        if (!nextNumber) return;

        const share = total ? done / total : 0;
        A.dom.setText(titleEl, A.t("home.continueTitle", { n: next, title: lessons.title(next) }));
        A.dom.setText(percentEl, Math.round(share * 100) + "%");
        button.style.setProperty("--done", String(share));
        button.setAttribute("title", A.t("home.continueDone", { done: done, total: total }));
    }

    button.addEventListener("click", function () {
        if (nextNumber && A.lessons) A.lessons.open(nextNumber, button);
    });

    // ----- "Start here": three first steps (Simple design only, css/pro.css hides it in Pro) -----
    const start = document.querySelector("[data-home-start]");

    function startSteps() {
        const lessonDone = Boolean(A.lessons && A.util.attempt(function () { return A.lessons.completed().indexOf(1) !== -1; }));
        const tried = A.storage.get("lab.tried", []);
        const labDone = Array.isArray(tried) && tried.length > 0;
        const quiz = A.quiz && typeof A.quiz.stats === "function" ? A.util.attempt(function () { return A.quiz.stats(); }) : null;
        const quizDone = Boolean(quiz && quiz.best && ["classic", "timed", "myth", "daily"].some(function (mode) { return quiz.best[mode]; }) ||
            quiz && quiz.daily && quiz.daily.last);
        return { lesson: lessonDone, lab: labDone, quiz: quizDone };
    }

    function refreshStart() {
        if (!start || !A.lessons) return;
        const steps = startSteps();
        let all = true;
        start.querySelectorAll("[data-start]").forEach(function (step) {
            const done = steps[step.getAttribute("data-start")];
            if (!done) all = false;
            step.classList.toggle("is-done", done);
            A.dom.setHidden(step.querySelector(".home-start-done"), !done);
        });
        A.dom.setHidden(start.querySelector(".home-start-all"), !all);
        A.dom.setHidden(start, false);
    }

    if (start) {
        start.addEventListener("click", function (event) {
            const step = event.target.closest("[data-start]");
            if (!step) return;
            const name = step.getAttribute("data-start");
            if (name === "lesson" && A.lessons) A.lessons.open(1, step);
            else if (name === "lab") A.navigate("lab");
            else if (name === "quiz" && A.quiz) A.quiz.start("classic");
        });
    }

    // The progress changes in a lesson; the texts change with the language
    function refreshAll() {
        refresh();
        refreshStart();
    }

    A.on("activity", refreshAll);
    A.on("section", refreshAll);
    A.onLanguageChange(refreshAll);
    window.addEventListener("hashchange", refreshAll);
    A.ready(refreshAll);
})();
