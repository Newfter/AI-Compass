/* =========================================================
   AI COMPASS — THE PRO DESIGN: THE CONTROL PANEL
   The site has two designs (Settings, or the Simple / Pro switch in the
   menu bar; js/settings.js keeps the choice):
   - Simple (the default): calm and easy, for beginners.
   - Pro: a rich, dense look for people who know AI well (css/pro.css).
   This file draws the Pro design's control panel on the home page: your
   progress in every part of the site, and quick actions with their
   keyboard keys. It is only built when the Pro design is on.
   Nothing is saved by this file: it reads what the other parts know
   (A.lessons, A.lab, A.quiz, A.glossary, A.journey).
   Its texts (English and Russian) are in js/content/pro.js.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="pro"]');
    if (!A || !mount) return;

    const t = A.t;
    const esc = A.escapeHTML;
    const root = document.documentElement;
    const PRO_CLASS = "design-pro";

    let built = false;

    function isPro() {
        return root.classList.contains(PRO_CLASS);
    }

    // Runs a function and ignores an error: a part that isn't there yet shows "—"
    function safe(callback, fallback) {
        try {
            const value = callback();
            return value === undefined ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    /* ----- What the panel shows ----- */
    function numbers() {
        const lessons = A.lessons;
        const lessonDone = safe(function () { return lessons.completed().length; }, 0);
        const lessonTotal = safe(function () { return lessons.count; }, 0);

        const labIds = safe(function () { return A.lab.list().map(function (entry) { return entry.id; }); }, []);
        const tried = A.storage.get("lab.tried", []);
        const labDone = Array.isArray(tried) ? labIds.filter(function (id) { return tried.indexOf(id) !== -1; }).length : 0;

        const quiz = safe(function () { return A.quiz.stats(); }, null);
        let bestQuiz = null;
        if (quiz && quiz.best) {
            ["classic", "timed", "myth"].forEach(function (mode) {
                const run = quiz.best[mode];
                if (run && run.total && (!bestQuiz || run.score / run.total > bestQuiz.score / bestQuiz.total)) bestQuiz = run;
            });
        }

        const termsDone = safe(function () { return A.glossary.explored().length; }, 0);
        const termsTotal = safe(function () { return A.glossary.ids.length; }, 0);

        const xp = safe(function () { return A.journey.xp(); }, null);
        const level = safe(function () { return A.journey.level(); }, null);
        const streakJourney = safe(function () { return A.journey.streak().days; }, 0);
        const streakQuiz = quiz && quiz.daily ? quiz.daily.streak || 0 : 0;

        return {
            lessons: { done: lessonDone, total: lessonTotal },
            lab: { done: labDone, total: labIds.length },
            quiz: bestQuiz,
            terms: { done: termsDone, total: termsTotal },
            xp: xp,
            level: level,
            streak: Math.max(streakJourney || 0, streakQuiz)
        };
    }

    function share(part) {
        return part && part.total ? Math.min(1, part.done / part.total) : 0;
    }

    function tile(key, value, sub, part, tone) {
        return '<li class="pro-tile" data-tone="' + tone + '">' +
                '<span class="pro-tile-label">' + esc(t(key)) + "</span>" +
                '<span class="pro-tile-value">' + value + "</span>" +
                (sub ? '<span class="pro-tile-sub">' + sub + "</span>" : "") +
                (part ? '<span class="pro-bar" aria-hidden="true"><span style="--share: ' + share(part).toFixed(3) + '"></span></span>' : "") +
            "</li>";
    }

    function count(part) {
        return A.format.number(part.done) + '<small>/' + A.format.number(part.total) + "</small>";
    }

    function action(name, key, keys, extra) {
        return '<li><button type="button" class="pro-action" data-pro-action="' + name + '">' +
                '<span class="pro-action-text">' + esc(extra || t(key)) + "</span>" +
                (keys ? '<span class="pro-action-keys">' + keys.map(function (k) { return "<kbd>" + esc(k) + "</kbd>"; }).join("") + "</span>"
                      : '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>') +
            "</button></li>";
    }

    function draw() {
        if (!isPro()) return;
        built = true;
        const n = numbers();
        const lessons = A.lessons;
        const next = safe(function () { return lessons.next(); }, 0);
        const nextText = next ? t("pro.next", { title: safe(function () { return lessons.title(next); }, String(next)) }) : t("pro.allDone");
        const quizValue = n.quiz ? A.format.number(n.quiz.score) + "<small>/" + A.format.number(n.quiz.total) + "</small>" : esc(t("pro.none"));
        const mod = A.isMac ? "⌘" : "Ctrl";

        mount.innerHTML =
            '<div class="pro-dash-head">' +
                '<span class="pro-dash-title"><span class="pro-pulse" aria-hidden="true"></span>' + esc(t("pro.title")) + "</span>" +
                '<span class="pro-dash-meta">' + esc(A.lang.toUpperCase()) + " · " + esc(t(A.theme === "light" ? "settings.themeLight" : "settings.themeDark").toUpperCase()) + "</span>" +
            "</div>" +
            '<h2 class="pro-dash-label">' + esc(t("pro.statsLabel")) + "</h2>" +
            '<ul class="pro-tiles">' +
                tile("pro.lessons", count(n.lessons), "", n.lessons, "1") +
                tile("pro.lab", count(n.lab), "", n.lab, "2") +
                tile("pro.quiz", quizValue, "", n.quiz ? { done: n.quiz.score, total: n.quiz.total } : null, "3") +
                tile("pro.glossary", count(n.terms), "", n.terms, "2") +
                tile("pro.level", n.level === null ? esc(t("pro.none")) : A.format.number(n.level),
                    n.xp === null ? "" : esc(t("pro.xp", { n: A.format.number(n.xp) })), null, "1") +
                tile("pro.streak", A.format.number(n.streak) + "<small>" + esc(t("pro.days", { n: "" }).trim()) + "</small>", "", null, "3") +
            "</ul>" +
            '<h2 class="pro-dash-label">' + esc(t("pro.actionsLabel")) + "</h2>" +
            '<ul class="pro-actions">' +
                action("next", "", null, nextText) +
                action("search", "pro.search", [mod, "K"]) +
                action("keys", "pro.keys", ["?"]) +
                action("daily", "pro.daily") +
                action("term", "pro.term") +
                action("compass", "pro.compass") +
                action("simple", "pro.back") +
            "</ul>";
        A.dom.setHidden(mount, false);
    }

    function refresh() {
        if (isPro()) draw();
        else if (built) A.dom.setHidden(mount, true);
    }

    mount.addEventListener("click", function (event) {
        const button = event.target.closest("[data-pro-action]");
        if (!button) return;
        const name = button.getAttribute("data-pro-action");
        if (name === "next") {
            const next = safe(function () { return A.lessons.next(); }, 0);
            if (next) A.lessons.open(next, button);
            else A.navigate("lessons");
        } else if (name === "search") {
            if (A.palette) A.palette.open();
        } else if (name === "keys") {
            if (A.settings) A.settings.shortcuts();
        } else if (name === "daily") {
            if (A.quiz) A.quiz.start("daily");
        } else if (name === "term") {
            const term = safe(function () { return A.glossary.random(); }, null);
            if (term) A.glossary.show(term.id, { focus: true });
            else A.navigate("glossary");
        } else if (name === "compass") {
            if (A.journey) A.journey.open();
        } else if (name === "simple") {
            if (A.settings) {
                A.settings.set("design", "simple");
                A.toast(t("settings.saidValue", { setting: t("settings.design"), value: t("settings.designSimple") }), "🌱");
            }
        }
    });

    // The progress changes; the texts change with the language; the design can be switched
    A.on("activity", refresh);
    A.on("settings", function (detail) {
        if (detail && (detail.name === "design" || detail.name === "theme")) refresh();
    });
    A.onLanguageChange(refresh);
    A.onThemeChange(refresh);
    window.addEventListener("hashchange", refresh);
    A.ready(refresh);
})();
