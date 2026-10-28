/* =========================================================
   AI COMPASS — MY COMPASS: THE WINDOW (the dashboard)
   js/journey.js loads this file the first time somebody opens "My Compass"
   (it is not in index.html, so it costs nothing at start-up). It builds the
   big window that shows the learner's journey:
     - the level, its progress ring, and the numbers under it;
     - the next best steps (buttons that go there);
     - the progress in each part of the site, and a skill radar;
     - the activity of the last 6 weeks, one square per day;
     - the badges, and how to earn XP;
     - "Your data": save to a file, copy as text, load, start over.
   Everything it knows comes from js/journey.js through "host" (its section 10).

   Sections of this file:
    1. Settings
    2. Small helpers
    3. Building the window
    4. Opening and closing
    5. Drawing: the level and the numbers
    6. Drawing: the next best steps
    7. Drawing: progress and the skill radar
    8. Drawing: the activity calendar (and its arrow keys)
    9. Drawing: badges and how to earn XP
   10. Your data: save, copy, load, start over
   11. Drawing it all, language changes, and A.journeyPanel
   Every text (English and Russian) is in js/content/journey.js
   ========================================================= */
(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const t = A.t;

    /* ---------- 1. Settings ---------- */
    const CLOSE_MS = 220;                 // the closing animation (css/journey.css)
    const STEPS = 3;                      // how many "next best steps" are shown
    const QUIZ_GOOD = 0.8;                // "Beat your quiz best" is suggested while the best is under 80%
    const HABIT_DAYS = 14;                // consistency (on the radar): the days with XP in the last
    const HABIT_GOAL = 7;                 // 14 days; 7 of them fill it up
    const WEEKS = 6;                      // the activity calendar shows 6 weeks
    const HEAT = [1, 30, 80, 150];        // the XP of a day for the calendar's 4 colours (from less to more)
    const RADAR = { width: 360, height: 252, radius: 96, labelGap: 14 };   // the skill radar (SVG units)
    const FILE_NAME = "ai-compass-progress-{day}.json";   // the name of a saved progress file
    const MAX_FILE_BYTES = 400000;        // a bigger file can't be a progress file
    const URL_LIFE = 10000;               // ms: a saved file's temporary address is freed after this

    // The icons of the parts of the site (names of icons in js/content/journey.js)
    const AREA_ICONS = { lessons: "first-lesson", lab: "lab-all", words: "terms-10", history: "eras-all", quiz: "perfect-quiz" };

    /* ---------- 2. Small helpers ---------- */
    function attempt(callback, fallback) {
        return A.util.attempt(callback, fallback);
    }

    function esc(text) {
        return A.escapeHTML(String(text));
    }

    function xpText(n) {
        return t("journey.xp", { n: A.format.number(n) });
    }

    // A day number (see js/journey.js) as a date, in the current language
    function dateOf(number, options) {
        return A.format.date(number * 86400000, Object.assign({ timeZone: "UTC" }, options));
    }

    // Does the quiz have a daily challenge? TODO(quiz): the quiz's new modes will tell
    // (A.quiz.stats().daily); the daily step and its XP rule appear when it does.
    function quizHasDaily() {
        return attempt(function () {
            const stats = A.quiz && typeof A.quiz.stats === "function" ? A.quiz.stats() : null;
            return Boolean(stats && stats.daily);
        }, false);
    }

    /* ---------- 3. Building the window ---------- */
    let host = null;          // what js/journey.js gives (see create below)
    let ui = {};              // the window's elements
    let overlay = null;       // its record in A.overlays
    let isOpen = false;
    let hideTimer = 0;
    let lastFocus = null;     // where the focus goes back to
    let focusDay = 0;         // the calendar's day that the Tab key reaches
    let checked = null;       // progress read from a file or text, waiting for "Replace"
    let importError = "";     // why the last file or text couldn't be loaded
    let resetPress = null;    // A.confirmPress of "Start over"

    function build() {
        const icon = host.icon;
        const root = A.dom.fromHTML(
            '<div class="jr-overlay" hidden>' +
                '<div class="jr-window" role="dialog" aria-modal="true" aria-labelledby="jr-kicker jr-title">' +
                    '<header class="jr-head">' +
                        '<span class="jr-head-mark" aria-hidden="true">' + icon("navigator") + "</span>" +
                        '<div class="jr-head-text">' +
                            '<p class="jr-kicker mono" id="jr-kicker" data-i18n="journey.label"></p>' +
                            '<h2 class="jr-title" id="jr-title" tabindex="-1" data-i18n="journey.title"></h2>' +
                        "</div>" +
                        '<button type="button" class="jr-close" data-ref="close" data-i18n-attr="aria-label:journey.close,title:journey.close">' +
                            icon("close") +
                        "</button>" +
                    "</header>" +
                    '<div class="jr-body" data-ref="body">' +
                        '<section class="jr-hero jr-card" data-ref="hero" aria-labelledby="jr-title"></section>' +
                        '<section class="jr-next jr-card" data-ref="next" aria-labelledby="jr-next-title"></section>' +
                        // Two columns on wide screens, each as tall as its own cards
                        '<div class="jr-columns">' +
                            '<div class="jr-column">' +
                                '<section class="jr-card" data-ref="areas" aria-labelledby="jr-areas-title"></section>' +
                                '<section class="jr-card" data-ref="activity" aria-labelledby="jr-activity-title"></section>' +
                            "</div>" +
                            '<div class="jr-column">' +
                                '<section class="jr-card" data-ref="skills" aria-labelledby="jr-skills-title"></section>' +
                                '<section class="jr-card jr-rules" data-ref="rules"></section>' +
                            "</div>" +
                        "</div>" +
                        '<section class="jr-card" data-ref="badges" aria-labelledby="jr-badges-title"></section>' +
                        buildData() +
                    "</div>" +
                "</div>" +
            "</div>"
        );
        document.querySelector('[data-feature="journey"]').appendChild(root);
        A.applyTranslations(root);

        ui = { overlay: root, window: root.querySelector(".jr-window"), title: root.querySelector(".jr-title") };
        root.querySelectorAll("[data-ref]").forEach(function (element) {
            ui[element.getAttribute("data-ref")] = element;
        });

        // Closing: the × button, or a click on the dimmed page around the window
        ui.close.addEventListener("click", function () { close("close"); });
        root.addEventListener("mousedown", function (event) {
            if (event.target === root) close("close");
        });
        ui.body.addEventListener("click", onBodyClick);
        ui.activity.addEventListener("keydown", onCalendarKey);
        ui.activity.addEventListener("focusin", onDayShown);
        ui.activity.addEventListener("pointerover", onDayShown);
        ui.activity.addEventListener("click", onDayShown);
        setUpData();

        overlay = A.overlays.register("journey", {
            root: root,                 // the window and the dimmed page around it
            element: ui.window,
            modal: true,
            // If the focus lands outside the window, it comes back to the title
            holdFocus: function () { ui.title.focus({ preventScroll: true }); },
            close: function (reason) { close(reason); }
        });
    }

    // The buttons of the window share one click listener: data-action names what they do
    function onBodyClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target || !ui.body.contains(target)) return;
        const action = target.getAttribute("data-action");
        if (action === "step") goToStep(Number(target.getAttribute("data-step")));
        else if (ACTIONS[action]) ACTIONS[action](target);
    }

    /* ---------- 4. Opening and closing ---------- */
    function open(opener) {
        if (isOpen) {
            ui.title.focus({ preventScroll: true });
            return;
        }
        clearTimeout(hideTimer);
        // Opened again while closing: the focus is still inside, the old place stays
        const active = opener || document.activeElement;
        if (!ui.overlay.contains(active)) lastFocus = active && active !== document.body ? active : null;

        host.opened();               // the "journey.open" event: a badge it brings is drawn below
        isOpen = true;
        render(true);
        ui.overlay.hidden = false;
        ui.overlay.classList.remove("is-closing");
        overlay.opened();            // before the focus moves in (core makes the rest inert)
        ui.body.scrollTop = 0;
        A.dom.replay(ui.overlay, "is-open");
        ui.title.focus({ preventScroll: true });
    }

    // reason: "close", "escape", "navigate", "command" (from core or this file).
    // keepFocus: the caller moves the focus itself (a next step going somewhere)
    function close(reason, keepFocus) {
        if (!isOpen) return;
        isOpen = false;
        if (resetPress) resetPress.disarm();
        ui.overlay.classList.remove("is-open");
        ui.overlay.classList.add("is-closing");
        const target = lastFocus;
        lastFocus = null;
        overlay.closed(keepFocus ? null : function () { giveFocusBack(target); });
        host.closed();
        hideTimer = setTimeout(function () {
            if (isOpen) return;
            ui.overlay.hidden = true;
            ui.overlay.classList.remove("is-closing");
        }, A.motion.ok() ? CLOSE_MS : 0);
    }

    // Back to where the focus was, or else to the menu bar button
    function giveFocusBack(target) {
        if (target && target.isConnected && typeof target.focus === "function" && !target.closest("[inert]")) {
            target.focus({ preventScroll: true });
        }
        const active = document.activeElement;
        if ((!active || active === document.body || ui.window.contains(active)) && host.button) {
            host.button.focus({ preventScroll: true });
        }
    }

    /* ---------- 5. Drawing: the level and the numbers ---------- */
    function drawHero(firstTime) {
        const state = host.state;
        const icon = host.icon;
        const level = host.levelInfo(state.xp);
        const percent = A.format.percent(level.progress, { small: false });
        const ringText = level.top
            ? t("journey.ringTextTop", { level: level.level, name: level.name })
            : t("journey.ringText", { level: level.level, name: level.name, percent: percent });
        const streak = host.currentStreak();
        const day = host.today();
        const todayXP = Object.prototype.hasOwnProperty.call(state.days, day) ? state.days[day] : 0;
        const earned = Object.keys(state.badges).length;
        const best = state.best.streak || 0;

        ui.hero.innerHTML =
            '<span class="jr-corners ui-corners" aria-hidden="true"></span>' +
            '<div class="jr-level">' +
                '<div class="jr-ring ui-ring" role="img" aria-label="' + esc(ringText) + '">' +
                    '<svg class="jr-ring-ticks ui-ring-ticks" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
                        '<circle cx="50" cy="50" r="48"></circle>' +
                    "</svg>" +
                    '<svg class="jr-ring-chart ui-ring-chart" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
                        '<defs><linearGradient id="jr-ring-gradient" x1="0" y1="0" x2="1" y2="1">' +
                            '<stop offset="0" class="jr-stop-a"></stop><stop offset="1" class="jr-stop-b"></stop>' +
                        "</linearGradient></defs>" +
                        '<circle class="jr-ring-track ui-ring-track" cx="50" cy="50" r="40" pathLength="100"></circle>' +
                        '<circle class="jr-ring-bar ui-ring-bar" cx="50" cy="50" r="40" pathLength="100"></circle>' +
                    "</svg>" +
                    '<span class="jr-ring-value" aria-hidden="true">' +
                        '<small class="mono">' + esc(t("journey.ringLabel")) + "</small>" +
                        "<strong>" + level.level + "</strong>" +
                    "</span>" +
                "</div>" +
                '<div class="jr-level-text">' +
                    '<p class="jr-level-of mono">' + esc(t("journey.levelOf", { level: level.level, max: level.max })) + "</p>" +
                    '<p class="jr-level-name">' + esc(level.name) + "</p>" +
                    '<p class="jr-level-xp"><strong>' + esc(xpText(state.xp)) + "</strong></p>" +
                    '<p class="jr-level-next">' + esc(level.top
                        ? t("journey.topLevel")
                        : t("journey.toNext", { n: A.format.number(level.toNext), name: level.nextName })) + "</p>" +
                "</div>" +
            "</div>" +
            '<ul class="jr-stats">' +
                stat("streak", A.format.number(streak), A.plural("journey.stat.streak", streak), streak > 0) +
                stat("spark", A.format.number(best), t("journey.stat.best")) +
                stat("calendar", A.format.number(todayXP), t("journey.stat.today")) +
                stat("certificate", A.format.number(earned), A.plural("journey.stat.badges", earned)) +
            "</ul>" +
            '<p class="jr-note jr-streak-note">' + icon("check", "jr-note-icon") + "<span>" + esc(t("journey.streakNote")) + "</span></p>";

        // The ring fills up from empty when the window opens (instantly in calm mode)
        const bar = ui.hero.querySelector(".jr-ring-bar");
        const offset = String(Math.round((1 - level.progress) * 1000) / 10);
        if (firstTime && A.motion.ok()) {
            bar.style.strokeDashoffset = "100";
            requestAnimationFrame(function () {
                requestAnimationFrame(function () { bar.style.strokeDashoffset = offset; });
            });
        } else {
            bar.style.strokeDashoffset = offset;
        }
    }

    function stat(iconName, value, label, lit) {
        return '<li class="jr-stat' + (lit ? " is-lit" : "") + '">' +
            host.icon(iconName, "jr-stat-icon") +
            '<span class="jr-stat-text"><strong class="jr-stat-value">' + esc(value) + "</strong>" +
            '<span class="jr-stat-label">' + esc(label) + "</span></span></li>";
    }

    /* ---------- 6. Drawing: the next best steps ---------- */
    let steps = [];           // what the step buttons do (drawn in this order)

    // Up to 3 suggestions, the most useful first: the next lesson, today's challenge,
    // a lab experiment never tried, the quiz (again, while the best is under 80%),
    // the word of the day, the history not yet visited
    function suggestions() {
        const rules = host.data.rules;
        const list = [];
        const done = lessonsDone();
        const next = Number(host.site.lessons().filter(function (id) { return done.indexOf(id) === -1; })[0]) || 0;
        if (next) {
            const started = done.length > 0;
            list.push({
                icon: "first-lesson",
                title: t(started ? "journey.next.lessonGo" : "journey.next.lessonStart", { n: next }),
                sub: attempt(function () { return A.lessons.title(next); }, ""),
                xp: rules.lesson.xp,
                run: function () { A.lessons.open(next, host.button); }
            });
        }
        if (quizHasDaily() && !Object.prototype.hasOwnProperty.call(host.state.awarded, "daily@" + host.today())) {
            list.push({
                icon: "calendar",
                title: t("journey.next.daily"),
                sub: t("journey.next.dailyText"),
                xp: rules.daily.xp,
                run: function () { A.quiz.start("daily"); }
            });
        }
        const lab = labProgress();
        if (lab.total && lab.done < lab.total) {
            list.push({
                icon: "lab-all",
                title: t("journey.next.lab"),
                sub: t("journey.next.labText", { n: A.format.number(lab.done), total: A.format.number(lab.total) }),
                xp: rules.lab.xp,
                run: function () {
                    if (lab.untried) A.lab.open(lab.untried);
                    else A.navigate("lab");
                }
            });
        }
        const best = quizBest();
        if (A.quiz && (!best || best.share < QUIZ_GOOD)) {
            list.push({
                icon: "perfect-quiz",
                title: t(best ? "journey.next.quizAgain" : "journey.next.quiz"),
                sub: best
                    ? t("journey.next.quizAgainText", { score: A.format.number(best.score), total: A.format.number(best.total) })
                    : t("journey.next.quizText"),
                xp: rules.quiz.xp,
                run: function () { A.quiz.start(best && best.mode === "timed" ? { timed: true } : undefined); }
            });
        }
        const term = termOfDay();
        if (term) {
            list.push({
                icon: "terms-10",
                title: t("journey.next.term", { term: term.term }),
                sub: t("journey.next.termText"),
                xp: rules.term.xp,
                run: function () { A.glossary.show(term.id, { focus: true }); }
            });
        }
        const eras = host.site.eras();
        const visited = host.countAwards("era:", eras);
        if (eras.length && visited < eras.length) {
            list.push({
                icon: "eras-all",
                title: t("journey.next.history"),
                sub: t("journey.next.historyText", { n: A.format.number(visited), total: A.format.number(eras.length) }),
                xp: rules.era.xp,
                run: function () { A.navigate("timeline"); }
            });
        }
        return list.slice(0, STEPS);
    }

    // The word of the day: one not explored yet, chosen by the date (the same all day).
    // The glossary's own word of the day wins when it has one (A.glossary.termOfDay).
    function termOfDay() {
        const ids = host.site.terms();
        const unexplored = ids.filter(function (id) {
            return !Object.prototype.hasOwnProperty.call(host.state.awarded, "term:" + id);
        });
        if (!unexplored.length || !A.glossary) return null;
        const featured = attempt(function () {
            return typeof A.glossary.termOfDay === "function" ? A.glossary.termOfDay() : null;
        }, null);
        const id = featured && unexplored.indexOf(featured.id) !== -1
            ? featured.id
            : unexplored[host.dayNumber(host.today()) % unexplored.length];
        return attempt(function () { return A.glossary.term(id); }, null);
    }

    function drawSteps() {
        steps = suggestions();
        const icon = host.icon;
        let html = '<div class="jr-card-head"><h3 class="jr-h3" id="jr-next-title">' + icon("arrow", "jr-h3-icon") +
            esc(t("journey.next.title")) + "</h3></div>";
        if (!steps.length) {
            html += '<p class="jr-note">' + icon("spark", "jr-note-icon") + "<span>" + esc(t("journey.next.done")) + "</span></p>";
        } else {
            html += '<ul class="jr-steps">' + steps.map(function (step, index) {
                return "<li>" +
                    '<button type="button" class="jr-step" data-action="step" data-step="' + index + '" data-focus="step-' + index + '">' +
                        '<span class="jr-step-icon" aria-hidden="true">' + icon(step.icon) + "</span>" +
                        '<span class="jr-step-text">' +
                            '<span class="jr-step-title">' + esc(step.title) + "</span>" +
                            (step.sub ? '<span class="jr-step-sub">' + esc(step.sub) + "</span>" : "") +
                        "</span>" +
                        '<span class="jr-step-xp mono">' + esc(t("journey.next.reward", { n: A.format.number(step.xp) })) + "</span>" +
                    "</button>" +
                "</li>";
            }).join("") + "</ul>";
        }
        ui.next.innerHTML = html;
    }

    // A step goes somewhere on the page, so the window closes first; the place it
    // goes to takes the focus
    function goToStep(index) {
        const step = steps[index];
        if (!step) return;
        close("navigate", true);
        attempt(step.run);
    }

    /* ---------- 7. Drawing: progress and the skill radar ---------- */
    // The lessons finished ("1", "2"...): those the lessons know about, and those in the
    // progress (progress loaded from another browser has lessons this one hasn't seen)
    function lessonsDone() {
        const completed = attempt(function () { return A.lessons.completed().map(String); }, []);
        return host.site.lessons().filter(function (id) {
            return completed.indexOf(id) !== -1 || Object.prototype.hasOwnProperty.call(host.state.awarded, "lesson:" + id);
        });
    }

    function labProgress() {
        const ids = host.site.lab();
        const total = host.site.labTotal();
        const done = Math.min(total, ids ? host.countAwards("lab:", ids) : host.countAwards("lab:"));
        let untried = "";
        if (ids) {
            untried = ids.filter(function (id) {
                return !Object.prototype.hasOwnProperty.call(host.state.awarded, "lab:" + id);
            })[0] || "";
        }
        return { done: done, total: total, untried: untried };
    }

    // The best quiz result of any mode, as a share of its questions (null: never played)
    function quizBest() {
        const best = host.state.best;
        const questions = Number(A.textValue("quizQuestionCount")) || 0;
        let found = null;
        Object.keys(best).forEach(function (key) {
            const match = /^quiz\.([a-z0-9_-]+)$/i.exec(key);
            if (!match) return;
            const total = best[key + ".total"] || questions;
            if (!total) return;
            const share = Math.min(1, best[key] / total);
            if (!found || share > found.share) found = { mode: match[1], score: best[key], total: total, share: share };
        });
        return found;
    }

    // Each part of the site: done, out of how many (from the features, never written here)
    function areas() {
        const lab = labProgress();
        const terms = host.site.terms();
        const eras = host.site.eras();
        return [
            { id: "lessons", done: lessonsDone().length, total: host.site.lessons().length },
            { id: "lab", done: lab.done, total: lab.total },
            { id: "words", done: host.countAwards("term:", terms), total: terms.length },
            { id: "history", done: host.countAwards("era:", eras), total: eras.length }
        ].filter(function (area) { return area.total > 0; });
    }

    // The days with XP in the last HABIT_DAYS days
    function habitDays() {
        const now = host.dayNumber(host.today());
        let count = 0;
        Object.keys(host.state.days).forEach(function (day) {
            const age = now - host.dayNumber(day);
            if (age >= 0 && age < HABIT_DAYS && host.state.days[day] > 0) count++;
        });
        return count;
    }

    function drawAreas() {
        const icon = host.icon;
        const best = quizBest();
        let html = '<div class="jr-card-head"><h3 class="jr-h3" id="jr-areas-title">' + icon("level", "jr-h3-icon") +
            esc(t("journey.areas.title")) + "</h3></div><ul class=\"jr-areas\">";
        areas().forEach(function (area) {
            html += areaRow(area.id, t("journey.area.count", { n: A.format.number(area.done), total: A.format.number(area.total) }),
                area.done / area.total);
        });
        if (A.quiz) {
            html += areaRow("quiz", best
                ? t("journey.area.count", { n: A.format.number(best.score), total: A.format.number(best.total) })
                : t("journey.area.quizNone"), best ? best.share : 0);
        }
        ui.areas.innerHTML = html + "</ul>";
    }

    function areaRow(id, value, share) {
        return '<li class="jr-area">' +
            '<span class="jr-area-icon" aria-hidden="true">' + host.icon(AREA_ICONS[id]) + "</span>" +
            '<span class="jr-area-name">' + esc(t("journey.area." + id)) + "</span>" +
            '<span class="jr-area-value mono">' + esc(value) + "</span>" +
            '<span class="jr-meter" aria-hidden="true"><span style="width: ' + (Math.round(share * 1000) / 10) + '%"></span></span>' +
            "</li>";
    }

    // The 6 skills, each from 0 to 1, in the order of the radar (clockwise from the top)
    function skills() {
        const shareOf = {};
        areas().forEach(function (area) { shareOf[area.id] = area.done / area.total; });
        const best = quizBest();
        return [
            { id: "lessons", value: shareOf.lessons || 0 },
            { id: "lab", value: shareOf.lab || 0 },
            { id: "words", value: shareOf.words || 0 },
            { id: "history", value: shareOf.history || 0 },
            { id: "quiz", value: best ? best.share : 0 },
            { id: "habit", value: Math.min(1, habitDays() / HABIT_GOAL) }
        ];
    }

    function drawSkills() {
        const list = skills();
        const icon = host.icon;
        const cx = RADAR.width / 2;
        const cy = RADAR.height / 2;
        // The corner of axis i at a share of the radius (0 = the middle, 1 = the edge)
        function point(i, share) {
            const angle = -Math.PI / 2 + i * 2 * Math.PI / list.length;
            return [cx + Math.cos(angle) * RADAR.radius * share, cy + Math.sin(angle) * RADAR.radius * share];
        }
        function polygon(share) {
            return list.map(function (skill, i) { return point(i, share).map(round).join(","); }).join(" ");
        }

        let svg = '<svg class="jr-radar" viewBox="0 0 ' + RADAR.width + " " + RADAR.height + '" aria-hidden="true" focusable="false">';
        [1 / 3, 2 / 3, 1].forEach(function (share) {
            svg += '<polygon class="jr-radar-grid" points="' + polygon(share) + '"></polygon>';
        });
        list.forEach(function (skill, i) {
            const end = point(i, 1);
            svg += '<line class="jr-radar-axis" x1="' + cx + '" y1="' + cy + '" x2="' + round(end[0]) + '" y2="' + round(end[1]) + '"></line>';
        });
        svg += '<polygon class="jr-radar-shape" points="' + list.map(function (skill, i) {
            return point(i, Math.max(skill.value, 0.02)).map(round).join(",");
        }).join(" ") + '"></polygon>';
        list.forEach(function (skill, i) {
            const dot = point(i, Math.max(skill.value, 0.02));
            svg += '<circle class="jr-radar-dot" cx="' + round(dot[0]) + '" cy="' + round(dot[1]) + '" r="3.5"></circle>';
            // The name, just outside the edge: on the left side it ends there, on the right it starts there
            const angle = -Math.PI / 2 + i * 2 * Math.PI / list.length;
            const x = cx + Math.cos(angle) * (RADAR.radius + RADAR.labelGap);
            const y = cy + Math.sin(angle) * (RADAR.radius + RADAR.labelGap);
            const anchor = Math.abs(Math.cos(angle)) < 0.1 ? "middle" : (Math.cos(angle) > 0 ? "start" : "end");
            const shift = Math.sin(angle) > 0.5 ? 10 : (Math.sin(angle) < -0.5 ? -4 : 4);
            svg += '<text class="jr-radar-label" x="' + round(x) + '" y="' + round(y + shift) + '" text-anchor="' + anchor + '">' +
                esc(t("journey.skill." + skill.id)) + "</text>";
        });
        svg += "</svg>";

        // The same numbers as a table (for screen readers, and for reading them exactly)
        const table = '<table class="jr-skill-table"><caption class="sr-only">' + esc(t("journey.skills.caption")) + "</caption><tbody>" +
            list.map(function (skill) {
                return '<tr><th scope="row">' + esc(t("journey.skill." + skill.id)) + "</th>" +
                    '<td class="mono">' + esc(A.format.percent(skill.value, { small: false })) + "</td></tr>";
            }).join("") + "</tbody></table>";

        ui.skills.innerHTML =
            '<div class="jr-card-head"><h3 class="jr-h3" id="jr-skills-title">' + icon("all-rounder", "jr-h3-icon") +
                esc(t("journey.skills.title")) + "</h3></div>" +
            '<div class="jr-skills-body">' + svg + table + "</div>" +
            '<p class="jr-note">' + esc(t("journey.skills.note", {
                period: A.plural("journey.days", HABIT_DAYS),
                goal: A.plural("journey.days", HABIT_GOAL)
            })) + "</p>";
    }

    function round(value) {
        return Math.round(value * 10) / 10;
    }

    /* ---------- 8. Drawing: the activity calendar (and its arrow keys) ---------- */
    // 6 rows of 7 days, Monday first; the last row is this week. Each day is a
    // square coloured by its XP. One day at a time is reachable with Tab (the
    // others with the arrow keys), and each one says its date and XP.
    function calendarDays() {
        const todayNumber = host.dayNumber(host.today());
        const weekday = (new Date(todayNumber * 86400000).getUTCDay() + 6) % 7;     // 0 = Monday
        const first = todayNumber - weekday - (WEEKS - 1) * 7;
        return { today: todayNumber, first: first };
    }

    function heatLevel(xp) {
        let level = 0;
        HEAT.forEach(function (from, index) {
            if (xp >= from) level = index + 1;
        });
        return level;
    }

    function dayLabel(number, todayNumber) {
        const day = host.dayFromNumber(number);
        const xp = Object.prototype.hasOwnProperty.call(host.state.days, day) ? host.state.days[day] : 0;
        let date = dateOf(number, { weekday: "long", day: "numeric", month: "long" });
        if (number === todayNumber) date = t("journey.activity.today", { date: date });
        return xp ? t("journey.activity.day", { date: date, n: A.format.number(xp) }) : t("journey.activity.none", { date: date });
    }

    function drawCalendar() {
        const icon = host.icon;
        const days = calendarDays();
        if (focusDay < days.first || focusDay > days.today) focusDay = days.today;

        let grid = '<div class="jr-calendar" role="grid" aria-labelledby="jr-activity-title" aria-describedby="jr-activity-hint">' +
            '<div class="jr-week jr-weekdays" role="row">';
        for (let d = 0; d < 7; d++) {
            // 1 January 2024 was a Monday
            const name = A.format.date(Date.UTC(2024, 0, 1 + d), { weekday: "short", timeZone: "UTC" });
            grid += '<span class="jr-weekday mono" role="columnheader">' + esc(name) + "</span>";
        }
        grid += "</div>";
        for (let w = 0; w < WEEKS; w++) {
            grid += '<div class="jr-week" role="row">';
            for (let d = 0; d < 7; d++) {
                const number = days.first + w * 7 + d;
                if (number > days.today) {
                    grid += '<span class="jr-day is-future" role="gridcell"></span>';
                    continue;
                }
                const key = host.dayFromNumber(number);
                const xp = Object.prototype.hasOwnProperty.call(host.state.days, key) ? host.state.days[key] : 0;
                const label = dayLabel(number, days.today);
                grid += '<span class="jr-day jr-heat-' + heatLevel(xp) + (number === days.today ? " is-today" : "") + '"' +
                    ' role="gridcell" tabindex="' + (number === focusDay ? "0" : "-1") + '"' +
                    ' data-day="' + number + '" data-focus="day-' + number + '"' +
                    ' aria-label="' + esc(label) + '" title="' + esc(label) + '"></span>';
            }
            grid += "</div>";
        }
        grid += "</div>";

        let legend = '<div class="jr-legend" aria-hidden="true"><span>' + esc(t("journey.activity.less")) + "</span>";
        for (let level = 0; level <= HEAT.length; level++) legend += '<span class="jr-day jr-heat-' + level + '"></span>';
        legend += "<span>" + esc(t("journey.activity.more")) + "</span></div>";

        // Beside the calendar: the days with XP, all its XP, and the best day
        let active = 0;
        let total = 0;
        let bestDay = 0;
        for (let number = days.first; number <= days.today; number++) {
            const key = host.dayFromNumber(number);
            const xp = Object.prototype.hasOwnProperty.call(host.state.days, key) ? host.state.days[key] : 0;
            if (xp > 0) active++;
            total += xp;
            bestDay = Math.max(bestDay, xp);
        }
        const side = '<ul class="jr-activity-stats">' +
            '<li><strong>' + esc(A.format.number(active)) + "</strong><span>" + esc(A.plural("journey.activity.daysWith", active)) + "</span></li>" +
            '<li><strong>' + esc(A.format.number(total)) + "</strong><span>" + esc(A.plural("journey.activity.total", WEEKS)) + "</span></li>" +
            '<li><strong>' + esc(xpText(bestDay)) + "</strong><span>" + esc(t("journey.activity.bestDay")) + "</span></li>" +
            "</ul>";

        ui.activity.innerHTML =
            '<div class="jr-card-head"><h3 class="jr-h3" id="jr-activity-title">' + icon("calendar", "jr-h3-icon") +
                esc(t("journey.activity.title")) + "</h3>" +
                '<span class="jr-card-meta mono">' + esc(A.plural("journey.activity.sub", WEEKS)) + "</span></div>" +
            '<div class="jr-activity-body">' +
                '<div class="jr-activity-main">' +
                    grid +
                    '<p class="jr-day-readout mono" aria-hidden="true">' + esc(dayLabel(focusDay, days.today)) + "</p>" +
                    legend +
                "</div>" +
                side +
            "</div>" +
            '<p class="jr-note" id="jr-activity-hint">' + esc(t("journey.activity.grid")) + "</p>";
    }

    // The arrow keys move a day (left, right) or a week (up, down); Home and End go to
    // the first day and to today
    function onCalendarKey(event) {
        const cell = event.target.closest("[data-day]");
        if (!cell) return;
        const days = calendarDays();
        const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        let target;
        if (Object.prototype.hasOwnProperty.call(moves, event.key)) target = Number(cell.getAttribute("data-day")) + moves[event.key];
        else if (event.key === "Home") target = days.first;
        else if (event.key === "End") target = days.today;
        else return;
        event.preventDefault();
        moveToDay(A.util.clamp(target, days.first, days.today), true);
    }

    function moveToDay(number, focus) {
        const next = ui.activity.querySelector('[data-day="' + number + '"]');
        if (!next) return;
        const current = ui.activity.querySelector('.jr-day[tabindex="0"]');
        if (current && current !== next) current.setAttribute("tabindex", "-1");
        next.setAttribute("tabindex", "0");
        focusDay = number;
        if (focus) next.focus({ preventScroll: false });
        showDay(number);
    }

    // The line under the calendar names the day that is focused, pointed at or tapped
    function onDayShown(event) {
        const cell = event.target.closest && event.target.closest("[data-day]");
        if (!cell) return;
        if (event.type === "click") moveToDay(Number(cell.getAttribute("data-day")), false);
        else showDay(Number(cell.getAttribute("data-day")));
    }

    function showDay(number) {
        const readout = ui.activity.querySelector(".jr-day-readout");
        if (readout) A.dom.setText(readout, dayLabel(number, calendarDays().today));
    }

    /* ---------- 9. Drawing: badges and how to earn XP ---------- */
    // The {n} of a badge's texts: its goal, or what the site has ("There are 6.")
    function badgeValues(badge) {
        const settings = host.settings;
        if (badge.id === "speedrunner") {
            return {
                time: A.plural("journey.seconds", settings.speedSeconds),
                share: A.format.percent(settings.speedShare)
            };
        }
        const totals = {
            "all-lessons": function () { return A.lessons ? A.lessons.count : 0; },
            "lab-all": host.site.labTotal,
            "terms-all": function () { return host.site.terms().length; }
        };
        if (totals[badge.id]) return { n: A.format.number(totals[badge.id]()) };
        return {};
    }

    function badgeText(badge, part) {
        const key = "journey.badge." + badge.id + "." + part;
        return badge.goal ? A.plural(key, badge.goal) : t(key, badgeValues(badge));
    }

    function drawBadges() {
        const state = host.state;
        const icon = host.icon;
        const all = host.data.badges;
        const earned = all.filter(function (badge) { return Object.prototype.hasOwnProperty.call(state.badges, badge.id); });

        let html = '<div class="jr-card-head"><h3 class="jr-h3" id="jr-badges-title">' + icon("certificate", "jr-h3-icon") +
            esc(t("journey.badges.title")) + "</h3>" +
            '<span class="jr-card-meta mono">' + esc(t("journey.badges.count", {
                n: A.format.number(earned.length), total: A.format.number(all.length)
            })) + "</span></div>" +
            '<ul class="jr-badge-grid">';
        all.forEach(function (badge) {
            const date = state.badges[badge.id];
            const isEarned = Object.prototype.hasOwnProperty.call(state.badges, badge.id);
            html += '<li class="jr-badge ' + (isEarned ? "is-earned" : "is-locked") + '">' +
                '<span class="jr-badge-icon" aria-hidden="true">' + icon(badge.icon || badge.id) +
                    (isEarned ? "" : '<span class="jr-badge-lock">' + icon("lock") + "</span>") + "</span>" +
                '<span class="jr-badge-text">' +
                    '<span class="jr-badge-title">' + esc(host.badgeTitle(badge.id)) + "</span>" +
                    (isEarned
                        ? '<span class="jr-badge-desc">' + esc(badgeText(badge, "desc")) + "</span>" +
                          '<span class="jr-badge-date mono">' + esc(t("journey.badges.earned", {
                              date: dateOf(host.dayNumber(date), { day: "numeric", month: "long", year: "numeric" })
                          })) + "</span>"
                        : '<span class="sr-only">' + esc(t("journey.badges.locked")) + ". </span>" +
                          '<span class="jr-badge-desc">' + esc(badgeText(badge, "hint")) + "</span>") +
                "</span>" +
            "</li>";
        });
        ui.badges.innerHTML = html + "</ul>";
    }

    // The XP table, in the order of the content file, with today's limits filled in.
    // The daily challenge and the lab challenges are listed once the site has them.
    function drawRules() {
        const rules = host.data.rules;
        const open = ui.rules.querySelector("details");
        const shown = Object.keys(rules).filter(function (name) {
            if (name === "daily") return quizHasDaily();
            if (name === "challenge") return host.site.lab() !== null;
            return true;
        });
        const startTime = A.format.date(Date.UTC(2024, 0, 1, host.settings.dayStartsAt), {
            hour: "2-digit", minute: "2-digit", timeZone: "UTC"
        });
        ui.rules.innerHTML =
            '<details class="jr-rules-box"' + (open && open.open ? " open" : "") + ">" +
                '<summary class="jr-rules-summary" data-focus="rules">' +
                    '<h3 class="jr-h3">' + host.icon("spark", "jr-h3-icon") + esc(t("journey.rules.title")) + "</h3>" +
                    host.icon("arrow", "jr-rules-arrow") +
                "</summary>" +
                '<p class="jr-rules-intro">' + esc(t("journey.rules.intro")) + "</p>" +
                '<table class="jr-rule-table"><tbody>' +
                    shown.map(function (name) {
                        const rule = rules[name];
                        return '<tr><th scope="row">' + esc(t("journey.rule." + name, { n: A.format.number(rule.perDay || 0) })) + "</th>" +
                            '<td class="mono">' + esc(t("journey.next.reward", { n: A.format.number(rule.xp) })) + "</td></tr>";
                    }).join("") +
                "</tbody></table>" +
                '<p class="jr-note">' + esc(t("journey.rules.day", { time: startTime })) + "</p>" +
            "</details>";
    }

    /* ---------- 10. Your data: save, copy, load, start over ---------- */
    // Built once: its texts follow the language by themselves (data-i18n)
    function buildData() {
        const icon = host.icon;
        return '<section class="jr-card jr-data" aria-labelledby="jr-data-title">' +
            '<div class="jr-card-head"><h3 class="jr-h3" id="jr-data-title">' + icon("lock", "jr-h3-icon") +
                '<span data-i18n="journey.data.title"></span></h3></div>' +
            '<p class="jr-privacy">' + icon("check", "jr-note-icon") + '<span data-i18n="journey.privacy"></span></p>' +
            '<p class="jr-blocked" data-ref="blocked" hidden>' + icon("warning", "jr-note-icon") + '<span data-i18n="journey.blocked"></span></p>' +
            '<div class="jr-actions">' +
                '<button type="button" class="btn btn-ghost btn-small jr-action" data-action="export">' + icon("download") +
                    '<span data-i18n="journey.export"></span></button>' +
                '<button type="button" class="btn btn-ghost btn-small jr-action" data-action="copy">' + icon("copy") +
                    '<span data-i18n="journey.copy"></span></button>' +
                '<button type="button" class="btn btn-ghost btn-small jr-action" data-action="import" data-ref="importToggle" aria-expanded="false" aria-controls="jr-import">' +
                    icon("upload") + '<span data-i18n="journey.import"></span></button>' +
                '<button type="button" class="btn btn-ghost btn-small jr-action jr-reset" data-ref="reset">' + icon("reset") +
                    '<span data-ref="resetLabel" data-i18n="journey.reset"></span></button>' +
            "</div>" +
            '<p class="jr-note" data-i18n="journey.resetNote"></p>' +
            '<div class="jr-copy-box" data-ref="copyBox" hidden>' +
                '<p class="jr-warning" data-i18n="journey.copyFailed"></p>' +
                '<label class="jr-label" for="jr-copy-text" data-i18n="journey.copyField"></label>' +
                '<textarea class="jr-field mono" id="jr-copy-text" data-ref="copyText" rows="3" readonly spellcheck="false"></textarea>' +
            "</div>" +
            '<div class="jr-import" id="jr-import" data-ref="importBox" hidden>' +
                '<p data-i18n="journey.import.intro"></p>' +
                '<div class="jr-import-file">' +
                    '<button type="button" class="btn btn-ghost btn-small jr-action" data-action="file">' + icon("upload") +
                        '<span data-i18n="journey.import.file"></span></button>' +
                    '<input type="file" class="jr-file" data-ref="file" accept=".json,application/json,text/plain" tabindex="-1" hidden>' +
                "</div>" +
                '<label class="jr-label" for="jr-import-text" data-i18n="journey.import.paste"></label>' +
                '<textarea class="jr-field mono" id="jr-import-text" data-ref="importText" rows="3" spellcheck="false" autocomplete="off"></textarea>' +
                '<div class="jr-import-check">' +
                    '<button type="button" class="btn btn-primary btn-small" data-action="check" data-ref="check">' +
                        '<span data-i18n="journey.import.check"></span></button>' +
                "</div>" +
                '<div class="jr-import-result" data-ref="importResult" aria-live="polite"></div>' +
            "</div>" +
        "</section>";
    }

    function setUpData() {
        resetPress = A.confirmPress(ui.reset, {
            onArm: function () {
                ui.reset.classList.add("is-armed");
                ui.resetLabel.setAttribute("data-i18n", "journey.resetAsk");
                ui.resetLabel.textContent = t("journey.resetAsk");
                A.announce(t("journey.resetAsk"));
            },
            onDisarm: function () {
                ui.reset.classList.remove("is-armed");
                ui.resetLabel.setAttribute("data-i18n", "journey.reset");
                ui.resetLabel.textContent = t("journey.reset");
            },
            onConfirm: function () {
                host.reset();
                A.toast(t("journey.resetDone"), "🧭");
            }
        });

        ui.file.addEventListener("change", function () {
            const file = ui.file.files && ui.file.files[0];
            ui.file.value = "";
            if (!file) return;
            if (file.size > MAX_FILE_BYTES) {
                showChecked({ error: "tooBig" });
                return;
            }
            file.text().then(function (text) {
                showChecked(host.readProgress(text));
            }, function () {
                showChecked({ error: "notProgress" });
            });
        });
    }

    const ACTIONS = {
        // A JSON file named after today
        export: function () {
            const text = JSON.stringify(host.exportData(), null, 2);
            const address = URL.createObjectURL(new Blob([text], { type: "application/json" }));
            const link = document.createElement("a");
            link.href = address;
            link.download = FILE_NAME.replace("{day}", host.today());
            link.hidden = true;
            ui.window.appendChild(link);        // inside the window: the rest of the page is inert
            link.click();
            link.remove();
            setTimeout(function () { URL.revokeObjectURL(address); }, URL_LIFE);
            A.track("journey.export", { how: "file" });
            A.toast(t("journey.exported"), "💾");
        },

        // The same progress as one line of text, copied for the learner to keep
        copy: function () {
            const text = host.toText(host.exportData());
            ui.copyText.value = text;
            A.track("journey.export", { how: "text" });
            copyToClipboard(text).then(function (ok) {
                ui.copyBox.hidden = ok;
                if (ok) {
                    A.toast(t("journey.copied"), "📋");
                } else {
                    // Copying is blocked here: the text is shown, ready to copy by hand
                    ui.copyText.focus({ preventScroll: false });
                    ui.copyText.select();
                    A.announce(t("journey.copyFailed"));
                }
            });
        },

        import: function () {
            const show = ui.importBox.hidden;
            ui.importBox.hidden = !show;
            ui.importToggle.setAttribute("aria-expanded", String(show));
            if (show) {
                ui.importText.focus({ preventScroll: false });
            } else {
                clearChecked();
            }
        },

        file: function () {
            ui.file.click();
        },

        check: function () {
            showChecked(host.readProgress(ui.importText.value));
        },

        // Asked first ("Replace my progress?"), then done
        replace: function () {
            if (!checked) return;
            const level = host.levelInfo(checked.xp).level;
            host.replace(checked);
            clearChecked();
            ui.importText.value = "";
            ui.importBox.hidden = true;
            ui.importToggle.setAttribute("aria-expanded", "false");
            ui.importToggle.focus({ preventScroll: true });
            A.toast(t("journey.import.done", { level: level }), "🧭");
        },

        cancel: function () {
            clearChecked();
            ui.importText.focus({ preventScroll: true });
        }
    };

    // TODO(core): one copy helper for the whole site (the quiz has its own copy)
    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(function () { return true; }, function () {
                return copyWithSelection();
            });
        }
        return Promise.resolve(copyWithSelection());
    }

    // The old way: select the text in the window's own text box and copy it
    function copyWithSelection() {
        const box = ui.copyBox;
        const wasHidden = box.hidden;
        box.hidden = false;
        ui.copyText.select();
        let ok = false;
        try {
            ok = document.execCommand("copy");
        } catch (error) {
            ok = false;
        }
        box.hidden = wasHidden;
        return ok;
    }

    // The result of checking a file or text: what it holds, and "Replace?", or why not
    function showChecked(result) {
        checked = result.state || null;
        importError = result.error || "";
        drawImportResult();
    }

    function clearChecked() {
        checked = null;
        importError = "";
        drawImportResult();
    }

    function drawImportResult() {
        if (importError) {
            ui.importResult.innerHTML = '<p class="jr-warning">' + host.icon("warning", "jr-note-icon") +
                "<span>" + esc(t("journey.import." + importError)) + "</span></p>";
            return;
        }
        if (!checked) {
            ui.importResult.innerHTML = "";
            return;
        }
        const badges = Object.keys(checked.badges).length;
        const summary = t("journey.import.summary", {
            xp: xpText(checked.xp),
            badges: A.plural("journey.import.badges", badges),
            streak: A.plural("journey.import.streak", checked.best.streak || 0)
        });
        ui.importResult.innerHTML =
            '<div class="jr-summary">' +
                '<p class="jr-summary-text"><strong>' + esc(summary) + "</strong></p>" +
                "<p>" + esc(t("journey.import.ask")) + "</p>" +
                '<div class="jr-actions">' +
                    '<button type="button" class="btn btn-primary btn-small" data-action="replace" data-focus="replace">' +
                        esc(t("journey.import.replace")) + "</button>" +
                    '<button type="button" class="btn btn-ghost btn-small" data-action="cancel" data-focus="cancel">' +
                        esc(t("journey.import.cancel")) + "</button>" +
                "</div>" +
            "</div>";
    }

    /* ---------- 11. Drawing it all, language changes, and A.journeyPanel ---------- */
    // Draws every part from the progress. The focus stays on the same control
    // (each one that is drawn again has a data-focus name).
    function render(firstTime) {
        const active = document.activeElement;
        const focusName = active && ui.window.contains(active) ? active.getAttribute("data-focus") : null;

        drawHero(firstTime);
        drawSteps();
        drawAreas();
        drawSkills();
        drawCalendar();
        drawRules();
        drawBadges();
        drawImportResult();
        A.dom.setHidden(ui.blocked, host.canSave);

        if (focusName) {
            const again = ui.window.querySelector('[data-focus="' + focusName + '"]');
            if (again) again.focus({ preventScroll: true });
            else if (!ui.window.contains(document.activeElement)) ui.title.focus({ preventScroll: true });
        }
    }

    A.onLanguageChange(function () {
        if (isOpen) render(false);
    });

    function create(journeyHost) {
        if (overlay) return api;
        host = journeyHost;
        build();
        return api;
    }

    const api = {
        open: open,
        close: function () { close("close"); },
        // The progress changed: draw it again (when the window is closed, opening draws it)
        refresh: function () {
            if (isOpen) render(false);
        },
        get isOpen() { return isOpen; }
    };

    A.feature("journeyPanel", { create: create });
})();
