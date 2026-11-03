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

    // The progress changes in a lesson; the texts change with the language
    A.on("activity", refresh);
    A.on("section", refresh);
    A.onLanguageChange(refresh);
    window.addEventListener("hashchange", refresh);
    A.ready(refresh);
})();
