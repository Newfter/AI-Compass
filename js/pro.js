/* =========================================================
   AI COMPASS — THE PRO DESIGN
   The site has two designs (Settings, or the Simple / Pro switch in the
   menu bar; js/settings.js keeps the choice):
   - Simple (the default): calm and easy, for beginners.
   - Pro: a rich, dense look for people who know AI well (css/pro.css).
   This file draws what only the Pro design has:
    1. Settings and small helpers
    2. What the panels show (the numbers)
    3. The control panel (next to the home page title)
    4. The workspace under it: the terminal, the activity map, progress
       by track, the term of the day and today's to-do list
    5. The terminal's commands
    6. The status bar at the bottom of the screen
    7. "g then a letter": jumping to a page with the keyboard
    8. Keeping everything up to date
    9. The focus timer (status bar, terminal: timer 25)
   10. The context bar at the top of every page
   Everything is built only while the Pro design is on, and nothing is
   saved by this file except the terminal's last commands (this browser
   only). It reads what the other parts know (A.lessons, A.lab, A.quiz,
   A.glossary, A.journey).
   Its texts (English and Russian) are in js/content/pro.js.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    /* =========================================================
       1. SETTINGS AND SMALL HELPERS
       ========================================================= */
    const panel = document.querySelector('[data-feature="pro"]');
    const deck = document.querySelector("[data-pro-deck]");
    const statusBar = document.querySelector("[data-pro-status]");

    const t = A.t;
    const esc = A.escapeHTML;
    const root = document.documentElement;
    const PRO_CLASS = "design-pro";

    const DAYS_SHOWN = 42;                 // the activity map: six weeks (My Compass keeps 42 days)
    const DAY_STARTS_AT = 4;               // like js/journey.js: a new day starts at 4 a.m.
    const HISTORY_KEY = "pro.history";     // the terminal's last commands
    const HISTORY_MAX = 30;
    const LOG_MAX = 80;                    // lines kept in the terminal
    const JUMP_MS = 1200;                  // "g", then the letter within this time
    const TIMER_KEY = "pro.timer";         // the focus timer: { end, minutes } while it runs
    const TIMER_DEFAULT = 25;              // minutes, like a "pomodoro"

    // This visit only (nothing saved): when it started, the pages seen, the commands run
    const session = { start: Date.now(), pages: new Set(), commands: 0 };

    // The pages a command or "g + letter" can open: the name (in both languages),
    // the section id, the letter for "g + letter"
    const PAGES = [
        { id: "home", key: "h", names: ["home", "главная"] },
        { id: "learn", key: "p", names: ["path", "learn", "путь"] },
        { id: "lessons", key: "l", names: ["lessons", "уроки"] },
        { id: "lab", key: "a", names: ["lab", "лаборатория"] },
        { id: "quiz", key: "q", names: ["quiz", "тест"] },
        { id: "challenge", key: "c", names: ["challenge", "вызов"] },
        { id: "glossary", key: "g", names: ["glossary", "словарь"] },
        { id: "timeline", key: "t", names: ["history", "timeline", "история"] },
        { id: "teachers", key: "e", names: ["teachers", "учителя"] },
        { id: "about", key: "i", names: ["about", "о проекте"] }
    ];

    function isPro() {
        return root.classList.contains(PRO_CLASS);
    }

    // Runs a function and ignores an error: a part that isn't there yet shows "—"
    function safe(callback, fallback) {
        try {
            const value = callback();
            return value === undefined || value === null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function num(n) {
        return A.format.number(n);
    }

    const ARROW = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    // A page can be opened only when it is on the page (Challenge and Teachers show up later)
    function pageReady(id) {
        const section = document.getElementById(id);
        return Boolean(section) && !section.hidden;
    }

    function openPage(id) {
        if (!pageReady(id)) return false;
        A.navigate(id);
        return true;
    }

    function dayKey(time) {
        const date = new Date(time - DAY_STARTS_AT * 3600000);
        const pad = function (n) { return (n < 10 ? "0" : "") + n; };
        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    }

    /* =========================================================
       2. WHAT THE PANELS SHOW (THE NUMBERS)
       ========================================================= */
    function labTried() {
        const tried = A.storage.get("lab.tried", []);
        return Array.isArray(tried) ? tried : [];
    }

    function numbers() {
        const lessons = A.lessons;
        const lessonDone = safe(function () { return lessons.completed().length; }, 0);
        const lessonTotal = safe(function () { return lessons.count; }, 0);

        const labList = safe(function () { return A.lab.list(); }, []);
        const tried = labTried();
        const labDone = labList.filter(function (entry) { return tried.indexOf(entry.id) !== -1; }).length;

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

        const streakJourney = safe(function () { return A.journey.streak().days; }, 0);
        const streakQuiz = quiz && quiz.daily ? quiz.daily.streak || 0 : 0;

        return {
            lessons: { done: lessonDone, total: lessonTotal },
            lab: { done: labDone, total: labList.length },
            quiz: bestQuiz,
            quizStats: quiz,
            terms: { done: termsDone, total: termsTotal },
            xp: safe(function () { return A.journey.xp(); }, null),
            level: safe(function () { return A.journey.level(); }, null),
            badges: safe(function () { return A.journey.badges().length; }, 0),
            streak: Math.max(streakJourney || 0, streakQuiz)
        };
    }

    function share(part) {
        return part && part.total ? Math.min(1, part.done / part.total) : 0;
    }

    function count(part) {
        return num(part.done) + "<small>/" + num(part.total) + "</small>";
    }

    /* =========================================================
       3. THE CONTROL PANEL (next to the home page title)
       ========================================================= */
    function tile(key, value, sub, part, tone) {
        return '<li class="pro-tile" data-tone="' + tone + '">' +
                '<span class="pro-tile-label">' + esc(t(key)) + "</span>" +
                '<span class="pro-tile-value">' + value + "</span>" +
                (sub ? '<span class="pro-tile-sub">' + sub + "</span>" : "") +
                (part ? '<span class="pro-bar" aria-hidden="true"><span style="--share: ' + share(part).toFixed(3) + '"></span></span>' : "") +
            "</li>";
    }

    function action(name, text, keys) {
        return '<li><button type="button" class="pro-action" data-pro-action="' + name + '">' +
                '<span class="pro-action-text">' + esc(text) + "</span>" +
                (keys ? '<span class="pro-action-keys">' + keys.map(function (k) { return "<kbd>" + esc(k) + "</kbd>"; }).join("") + "</span>" : ARROW) +
            "</button></li>";
    }

    function drawPanel(n) {
        if (!panel) return;
        const lessons = A.lessons;
        const next = safe(function () { return lessons.next(); }, 0);
        const nextText = next ? t("pro.next", { title: safe(function () { return lessons.title(next); }, String(next)) }) : t("pro.allDone");
        const quizValue = n.quiz ? num(n.quiz.score) + "<small>/" + num(n.quiz.total) + "</small>" : esc(t("pro.none"));
        const mod = A.isMac ? "⌘" : "Ctrl";
        const overall = share({ done: n.lessons.done + n.lab.done + n.terms.done, total: n.lessons.total + n.lab.total + n.terms.total });

        panel.innerHTML =
            '<div class="pro-dash-head">' +
                '<span class="pro-dash-title"><span class="pro-pulse" aria-hidden="true"></span>' + esc(t("pro.title")) + "</span>" +
                '<span class="pro-dash-meta">' + esc(A.lang.toUpperCase()) + " · " +
                    esc(t(A.theme === "light" ? "settings.themeLight" : "settings.themeDark").toUpperCase()) + "</span>" +
            "</div>" +
            '<div class="pro-overall">' +
                '<span class="pro-overall-ring" style="--share: ' + overall.toFixed(3) + '" aria-hidden="true"></span>' +
                '<span class="pro-overall-text">' +
                    '<strong>' + esc(A.format.percent ? A.format.percent(overall) : Math.round(overall * 100) + "%") + "</strong>" +
                    "<span>" + esc(t("pro.overall")) + "</span>" +
                "</span>" +
                '<span class="pro-overall-badges">' + esc(t("pro.badges", { n: num(n.badges) })) + "</span>" +
            "</div>" +
            '<h2 class="pro-dash-label">' + esc(t("pro.statsLabel")) + "</h2>" +
            '<ul class="pro-tiles">' +
                tile("pro.lessons", count(n.lessons), "", n.lessons, "1") +
                tile("pro.lab", count(n.lab), "", n.lab, "2") +
                tile("pro.quiz", quizValue, "", n.quiz ? { done: n.quiz.score, total: n.quiz.total } : null, "3") +
                tile("pro.glossary", count(n.terms), "", n.terms, "2") +
                tile("pro.level", n.level === null ? esc(t("pro.none")) : num(n.level),
                    n.xp === null ? "" : esc(t("pro.xp", { n: num(n.xp) })), null, "1") +
                tile("pro.streak", num(n.streak) + "<small>" + esc(t("pro.daysShort")) + "</small>", "", null, "3") +
            "</ul>" +
            '<h2 class="pro-dash-label">' + esc(t("pro.actionsLabel")) + "</h2>" +
            '<ul class="pro-actions">' +
                action("next", nextText) +
                action("search", t("pro.search"), [mod, "K"]) +
                action("keys", t("pro.keys"), ["?"]) +
                action("terminal", t("pro.terminalOpen"), ["`"]) +
                action("daily", t("pro.daily")) +
                action("compass", t("pro.compass")) +
                action("simple", t("pro.back")) +
            "</ul>";
        A.dom.setHidden(panel, false);
    }

    /* =========================================================
       4. THE WORKSPACE (under the home page title)
       ========================================================= */
    let terminal = null;     // the terminal's parts, once the workspace is built

    function heatmap() {
        const days = safe(function () { return A.journey.activity(); }, {});
        const now = Date.now();
        let max = 0;
        let active = 0;
        let total = 0;
        const cells = [];
        for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
            const key = dayKey(now - i * 86400000);
            const xp = typeof days[key] === "number" ? days[key] : 0;
            if (xp > max) max = xp;
            if (xp > 0) active++;
            total += xp;
            cells.push({ key: key, xp: xp, today: i === 0 });
        }
        const html = cells.map(function (cell) {
            const level = !cell.xp ? 0 : Math.min(4, 1 + Math.floor((cell.xp / Math.max(1, max)) * 3.999));
            const date = A.format.date ? A.format.date(new Date(cell.key + "T12:00:00"), { day: "numeric", month: "short" }) : cell.key;
            const label = t("pro.heatCell", { date: date, n: num(cell.xp) });
            return '<li class="pro-heat-cell" data-level="' + level + '"' + (cell.today ? ' data-today="true"' : "") +
                ' title="' + esc(label) + '"><span class="sr-only">' + esc(label) + "</span></li>";
        }).join("");
        return { html: html, active: active, total: total };
    }

    function trackBars(n) {
        const tracks = safe(function () { return A.lessons.tracks(); }, []);
        const rows = tracks.map(function (track) {
            return { label: track.icon + " " + track.title(), done: track.done, total: track.total, tone: track.id === "deep" ? "3" : track.id === "world" ? "2" : "1" };
        });
        rows.push({ label: "🧪 " + t("pro.lab"), done: n.lab.done, total: n.lab.total, tone: "2" });
        rows.push({ label: "📖 " + t("pro.glossary"), done: n.terms.done, total: n.terms.total, tone: "2" });
        return rows.map(function (row) {
            const part = share(row);
            return '<li class="pro-track" data-tone="' + row.tone + '">' +
                    '<span class="pro-track-name">' + esc(row.label) + "</span>" +
                    '<span class="pro-track-count">' + num(row.done) + "/" + num(row.total) + "</span>" +
                    '<span class="pro-bar" aria-hidden="true"><span style="--share: ' + part.toFixed(3) + '"></span></span>' +
                "</li>";
        }).join("");
    }

    function todayList(n) {
        const daily = n.quizStats && n.quizStats.daily;
        const due = safe(function () { return A.glossary.due(); }, null);
        const today = safe(function () { return A.journey.streak().today; }, 0);
        const items = [
            { done: Boolean(daily && daily.done), text: t(daily && daily.done ? "pro.todayDailyDone" : "pro.todayDaily"), act: "daily" },
            { done: due === 0, text: due === null ? t("pro.todayCardsNone") : due === 0 ? t("pro.todayCardsDone") : t("pro.todayCards", { n: num(due) }), act: "cards" },
            { done: today > 0, text: today > 0 ? t("pro.todayXp", { n: num(today) }) : t("pro.todayXpNone"), act: "next" }
        ];
        return items.map(function (item) {
            return '<li><button type="button" class="pro-todo" data-pro-action="' + item.act + '" data-done="' + item.done + '">' +
                    '<span class="pro-todo-box" aria-hidden="true"></span>' +
                    '<span class="pro-todo-text">' + esc(item.text) + "</span>" + ARROW +
                "</button></li>";
        }).join("");
    }

    function termOfDay() {
        const term = safe(function () { return A.glossary.termOfDay(); }, null);
        if (!term) return '<p class="pro-muted">' + esc(t("pro.none")) + "</p>";
        return '<p class="pro-term-name">' + esc(term.term) + "</p>" +
            '<p class="pro-term-text">' + esc(term.short || term.definition || "") + "</p>" +
            '<button type="button" class="pro-link" data-pro-action="termday" data-term="' + esc(term.id) + '">' +
                esc(t("pro.termOpen")) + ARROW + "</button>";
    }

    // "This session": how long this visit has lasted, the pages seen, the commands run
    function duration(ms) {
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        return hours ? hours + ":" + String(minutes % 60).padStart(2, "0") + " h" : minutes + " min";
    }

    function sessionHTML() {
        const timer = timerState();
        const rows = [
            ["pro.sessionTime", duration(Date.now() - session.start)],
            ["pro.sessionPages", num(session.pages.size)],
            ["pro.sessionCommands", num(session.commands)],
            ["pro.sessionTimer", timer ? clock(timer.end - Date.now()) : t("pro.timerOff")]
        ];
        return '<dl class="pro-kv">' + rows.map(function (row) {
                return "<div><dt>" + esc(t(row[0])) + '</dt><dd' + (row[0] === "pro.sessionTimer" ? ' data-pro-timer-text' : "") + ">" + esc(row[1]) + "</dd></div>";
            }).join("") + "</dl>" +
            '<button type="button" class="pro-link" data-pro-action="timer">' +
                esc(t(timer ? "pro.timerStop" : "pro.timerStart", { n: num(TIMER_DEFAULT) })) + ARROW + "</button>";
    }

    // "Recommended next": up to four steps, picked from what is not done yet
    function insightsList(n) {
        const list = [];
        const lessons = A.lessons;
        // My path first: cards that are due today, or the invitation to build a path
        const memory = safe(function () { return A.learn.profile() ? A.learn.memory() : null; }, null);
        if (memory && memory.due) list.push({ icon: "🧠", text: t("pro.recReview", { n: num(memory.due) }), act: "review" });
        else if (A.learn && !memory) list.push({ icon: "🧭", text: t("pro.recPath"), act: "path" });
        const next = safe(function () { return lessons.next(); }, 0);
        if (next && n.lessons.done < n.lessons.total) {
            list.push({ icon: "📚", text: t("pro.recLesson", { n: num(next), title: safe(function () { return lessons.title(next); }, "") }), act: "next" });
        }
        const tried = labTried();
        const untried = safe(function () { return A.lab.list(); }, []).filter(function (entry) { return tried.indexOf(entry.id) === -1; });
        if (untried.length) {
            list.push({ icon: untried[0].icon || "🧪", text: t("pro.recLab", { title: t(untried[0].titleKey), n: num(untried.length) }), act: "lab", arg: untried[0].id });
        }
        const mistakes = n.quizStats && n.quizStats.mistakes;
        if (!n.quiz) list.push({ icon: "🏆", text: t("pro.recQuizFirst"), act: "quiz" });
        else if (mistakes && mistakes.due) list.push({ icon: "🔁", text: t("pro.recMistakes", { n: num(mistakes.due) }), act: "mistakes" });
        else list.push({ icon: "⏱️", text: t("pro.recTimed"), act: "timed" });
        if (n.terms.done < n.terms.total) list.push({ icon: "📖", text: t("pro.recTerms", { n: num(n.terms.total - n.terms.done) }), act: "glossary" });
        return list.slice(0, 4);
    }

    function insightsHTML(n) {
        const list = insightsList(n);
        if (!list.length) return '<li class="pro-muted">' + esc(t("pro.recAllDone")) + "</li>";
        return list.map(function (item, index) {
            return '<li><button type="button" class="pro-insight" data-pro-action="' + item.act + '"' + (item.arg ? ' data-arg="' + esc(item.arg) + '"' : "") + ">" +
                    '<span class="pro-insight-rank">' + String(index + 1).padStart(2, "0") + "</span>" +
                    '<span class="pro-insight-icon" aria-hidden="true">' + esc(item.icon) + "</span>" +
                    '<span class="pro-insight-text">' + esc(item.text) + "</span>" + ARROW +
                "</button></li>";
        }).join("");
    }

    function card(id, titleKey, body, extraClass, meta) {
        return '<section class="pro-card' + (extraClass ? " " + extraClass : "") + '" aria-labelledby="pro-card-' + id + '">' +
                '<header class="pro-card-head">' +
                    '<h3 class="pro-card-title" id="pro-card-' + id + '">' + esc(t(titleKey)) + "</h3>" +
                    (meta ? '<span class="pro-card-meta">' + meta + "</span>" : "") +
                "</header>" + body +
            "</section>";
    }

    function buildDeck() {
        if (!deck || terminal) return;
        deck.innerHTML =
            '<h2 class="pro-deck-title">' + esc(t("pro.deckTitle")) + "</h2>" +
            '<div class="pro-deck-grid">' +
                card("terminal", "pro.terminal",
                    '<div class="pro-term-log" role="log" aria-live="polite" tabindex="0" data-ref="log"></div>' +
                    '<form class="pro-term-form" data-ref="form" autocomplete="off">' +
                        '<label class="pro-term-prompt" for="pro-term-input">ai@compass:~$</label>' +
                        '<input class="pro-term-input" id="pro-term-input" type="text" spellcheck="false" autocapitalize="off" ' +
                            'enterkeyhint="go" data-ref="input" aria-describedby="pro-term-hint">' +
                    "</form>" +
                    '<p class="pro-term-hint" id="pro-term-hint" data-ref="hint"></p>',
                    "pro-card-terminal", '<span data-ref="termMeta"></span>') +
                '<div class="pro-card-slot" data-ref="activity"></div>' +
                '<div class="pro-card-slot" data-ref="tracks"></div>' +
                '<div class="pro-card-slot" data-ref="today"></div>' +
                '<div class="pro-card-slot" data-ref="term"></div>' +
                '<div class="pro-card-slot" data-ref="session"></div>' +
                '<div class="pro-card-slot" data-ref="insights"></div>' +
            "</div>";

        const ref = function (name) { return deck.querySelector('[data-ref="' + name + '"]'); };
        terminal = {
            log: ref("log"),
            form: ref("form"),
            input: ref("input"),
            hint: ref("hint"),
            meta: ref("termMeta"),
            slots: { activity: ref("activity"), tracks: ref("tracks"), today: ref("today"), term: ref("term"), session: ref("session"), insights: ref("insights") },
            history: loadHistory(),
            back: -1,
            greeted: false
        };

        terminal.form.addEventListener("submit", function (event) {
            event.preventDefault();
            const line = terminal.input.value.trim();
            terminal.input.value = "";
            terminal.back = -1;
            if (!line) return;
            remember(line);
            print("$ " + line, "cmd");
            run(line);
        });

        terminal.input.addEventListener("keydown", function (event) {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                const list = terminal.history;
                if (!list.length) return;
                event.preventDefault();
                if (event.key === "ArrowUp") terminal.back = Math.min(list.length - 1, terminal.back + 1);
                else terminal.back = Math.max(-1, terminal.back - 1);
                terminal.input.value = terminal.back === -1 ? "" : list[list.length - 1 - terminal.back];
            } else if (event.key === "Tab" && terminal.input.value.trim() && !event.shiftKey) {
                const done = complete(terminal.input.value);
                if (done) {
                    event.preventDefault();
                    terminal.input.value = done;
                }
            } else if (event.key === "l" && event.ctrlKey) {
                event.preventDefault();
                clearLog();
            }
        });
    }

    function drawDeck(n) {
        if (!deck) return;
        buildDeck();
        const heat = heatmap();
        terminal.slots.activity.innerHTML = card("activity", "pro.activity",
            '<ol class="pro-heat" aria-label="' + esc(t("pro.activityLabel")) + '">' + heat.html + "</ol>" +
            '<p class="pro-heat-legend"><span>' + esc(t("pro.heatLess")) + '</span><i data-level="0"></i><i data-level="1"></i><i data-level="2"></i><i data-level="3"></i><i data-level="4"></i><span>' + esc(t("pro.heatMore")) + "</span></p>",
            "pro-card-activity", esc(t("pro.activityMeta", { days: num(heat.active), xp: num(heat.total) })));
        terminal.slots.tracks.innerHTML = card("tracks", "pro.tracks", '<ul class="pro-tracks">' + trackBars(n) + "</ul>", "pro-card-tracks");
        terminal.slots.today.innerHTML = card("today", "pro.today", '<ul class="pro-todos">' + todayList(n) + "</ul>", "pro-card-today");
        terminal.slots.term.innerHTML = card("term", "pro.termDay", termOfDay(), "pro-card-term");
        terminal.slots.session.innerHTML = card("session", "pro.session", sessionHTML(), "pro-card-session");
        terminal.slots.insights.innerHTML = card("insights", "pro.insights", '<ol class="pro-insights">' + insightsHTML(n) + "</ol>", "pro-card-insights");

        terminal.input.setAttribute("aria-label", t("pro.terminalLabel"));
        terminal.input.setAttribute("placeholder", t("pro.terminalPlaceholder"));
        A.dom.setText(terminal.hint, t("pro.terminalHint"));
        A.dom.setText(terminal.meta, "UTF-8 · " + A.lang.toUpperCase());
        if (!terminal.greeted) {
            terminal.greeted = true;
            print(t("pro.termWelcome"), "info");
            print(t("pro.termWelcome2"), "dim");
        }
        A.dom.setHidden(deck, false);
    }

    /* =========================================================
       5. THE TERMINAL'S COMMANDS
       ========================================================= */
    function loadHistory() {
        const list = A.storage.get(HISTORY_KEY, []);
        return Array.isArray(list) ? list.filter(function (item) { return typeof item === "string" && item.length < 200; }).slice(-HISTORY_MAX) : [];
    }

    function remember(line) {
        const list = terminal.history;
        if (list[list.length - 1] !== line) list.push(line);
        while (list.length > HISTORY_MAX) list.shift();
        A.storage.set(HISTORY_KEY, list);
    }

    function print(text, kind) {
        const line = document.createElement("p");
        line.className = "pro-term-line" + (kind ? " is-" + kind : "");
        line.textContent = text;
        terminal.log.appendChild(line);
        while (terminal.log.childElementCount > LOG_MAX) terminal.log.firstElementChild.remove();
        terminal.log.scrollTop = terminal.log.scrollHeight;
    }

    function clearLog() {
        terminal.log.textContent = "";
    }

    // Every command: its names (English and Russian), what it takes, what it does
    const COMMANDS = [
        { names: ["help", "помощь", "?"], usage: "help", does: "pro.cmd.help", run: cmdHelp },
        { names: ["go", "open", "открыть"], usage: "go <page>", does: "pro.cmd.go", run: cmdGo },
        { names: ["lesson", "урок"], usage: "lesson <1-15>", does: "pro.cmd.lesson", run: cmdLesson },
        { names: ["lab", "лаб"], usage: "lab [id]", does: "pro.cmd.lab", run: cmdLab },
        { names: ["quiz", "тест"], usage: "quiz [classic|timed|daily|myth]", does: "pro.cmd.quiz", run: cmdQuiz },
        { names: ["define", "def", "что"], usage: "define <word>", does: "pro.cmd.define", run: cmdDefine },
        { names: ["search", "find", "поиск"], usage: "search", does: "pro.cmd.search", run: function () { if (A.palette) A.palette.open(); } },
        { names: ["stats", "статистика"], usage: "stats", does: "pro.cmd.stats", run: cmdStats },
        { names: ["path", "путь"], usage: "path", does: "pro.cmd.path", run: cmdPath },
        { names: ["review", "повторить"], usage: "review", does: "pro.cmd.review", run: cmdReview },
        { names: ["theme", "тема"], usage: "theme [dark|light]", does: "pro.cmd.theme", run: cmdTheme },
        { names: ["lang", "язык"], usage: "lang [en|ru]", does: "pro.cmd.lang", run: cmdLang },
        { names: ["design", "дизайн"], usage: "design simple", does: "pro.cmd.design", run: cmdDesign },
        { names: ["keys", "клавиши"], usage: "keys", does: "pro.cmd.keys", run: function () { if (A.settings) A.settings.shortcuts(); } },
        { names: ["date", "time", "дата"], usage: "date", does: "pro.cmd.date", run: function () { print(new Date().toLocaleString(A.lang === "ru" ? "ru-RU" : "en-GB")); } },
        { names: ["ls", "pages"], usage: "ls", does: "pro.cmd.ls", run: cmdLs },
        { names: ["whoami", "кто"], usage: "whoami", does: "pro.cmd.whoami", run: cmdWhoami },
        { names: ["random", "случайный"], usage: "random", does: "pro.cmd.random", run: cmdRandom },
        { names: ["timer", "таймер"], usage: "timer [minutes|stop]", does: "pro.cmd.timer", run: cmdTimer },
        { names: ["history", "история"], usage: "history", does: "pro.cmd.history", run: cmdHistory },
        { names: ["neofetch", "sysinfo"], usage: "neofetch", does: "pro.cmd.neofetch", run: cmdNeofetch },
        { names: ["echo"], usage: "echo <text>", does: "pro.cmd.echo", run: function (arg) { print(arg || ""); } },
        { names: ["clear", "cls", "очистить"], usage: "clear", does: "pro.cmd.clear", run: clearLog }
    ];

    function findCommand(name) {
        const wanted = name.toLowerCase();
        return COMMANDS.find(function (command) { return command.names.indexOf(wanted) !== -1; }) || null;
    }

    function complete(text) {
        const parts = text.replace(/^\s+/, "").split(/\s+/);
        if (parts.length !== 1) return "";
        const start = parts[0].toLowerCase();
        const matches = [];
        COMMANDS.forEach(function (command) {
            command.names.forEach(function (name) {
                if (name.indexOf(start) === 0 && name !== start) matches.push(name);
            });
        });
        if (matches.length === 1) return matches[0] + " ";
        if (matches.length > 1) print(matches.join("   "), "dim");
        return "";
    }

    function run(line) {
        session.commands++;
        const parts = line.split(/\s+/);
        const command = findCommand(parts[0]);
        if (!command) {
            print(t("pro.term.unknown", { name: parts[0] }), "error");
            return;
        }
        try {
            command.run(parts.slice(1).join(" "));
        } catch (error) {
            print(t("pro.term.failed"), "error");
        }
    }

    function cmdHelp() {
        print(t("pro.term.helpTitle"), "info");
        COMMANDS.forEach(function (command) {
            print("  " + (command.usage + "                                ").slice(0, 34) + t(command.does));
        });
        print(t("pro.term.helpKeys"), "dim");
    }

    function findPage(name) {
        const wanted = name.toLowerCase().trim();
        return PAGES.find(function (page) { return page.id === wanted || page.names.indexOf(wanted) !== -1; }) || null;
    }

    function cmdGo(arg) {
        const page = arg ? findPage(arg) : null;
        if (!page) {
            print(t("pro.term.pages", { list: PAGES.filter(function (p) { return pageReady(p.id); }).map(function (p) { return p.names[0]; }).join(", ") }), "dim");
            return;
        }
        if (openPage(page.id)) print(t("pro.term.opened", { name: page.names[0] }), "ok");
        else print(t("pro.term.notHere"), "error");
    }

    function cmdLesson(arg) {
        const lessons = A.lessons;
        const total = safe(function () { return lessons.count; }, 0);
        const number = arg ? parseInt(arg, 10) : safe(function () { return lessons.next(); }, 1) || 1;
        if (!(number >= 1 && number <= total)) {
            print(t("pro.term.lessonRange", { n: num(total) }), "error");
            return;
        }
        print(t("pro.term.lessonOpen", { n: num(number), title: safe(function () { return lessons.title(number); }, "") }), "ok");
        lessons.open(number, terminal.input);
    }

    function cmdLab(arg) {
        const list = safe(function () { return A.lab.list(); }, []);
        if (!arg) {
            const tried = labTried();
            print(t("pro.term.labTitle"), "info");
            list.forEach(function (entry) {
                print("  " + (tried.indexOf(entry.id) !== -1 ? "✓ " : "· ") + (entry.id + "              ").slice(0, 14) + t(entry.titleKey));
            });
            print(t("pro.term.labHint"), "dim");
            return;
        }
        const wanted = arg.toLowerCase();
        const entry = list.find(function (item) { return item.id === wanted || t(item.titleKey).toLowerCase().indexOf(wanted) !== -1; });
        if (!entry) {
            print(t("pro.term.labUnknown", { name: arg }), "error");
            return;
        }
        print(t("pro.term.labOpen", { title: t(entry.titleKey) }), "ok");
        A.lab.open(entry.id);
    }

    function cmdQuiz(arg) {
        const modes = ["classic", "timed", "daily", "myth"];
        const mode = arg ? arg.toLowerCase() : "classic";
        if (modes.indexOf(mode) === -1) {
            print(t("pro.term.quizModes", { list: modes.join(", ") }), "error");
            return;
        }
        print(t("pro.term.quizStart", { mode: mode }), "ok");
        if (A.quiz) A.quiz.start(mode);
    }

    function cmdDefine(arg) {
        if (!arg) {
            print(t("pro.term.defineHow"), "dim");
            return;
        }
        const term = safe(function () { return A.glossary.find(arg); }, null);
        if (!term) {
            print(t("pro.term.defineNone", { word: arg }), "error");
            return;
        }
        print(term.term.toUpperCase(), "info");
        print(term.short || term.definition || "");
        print(t("pro.term.defineMore"), "dim");
    }

    function cmdStats() {
        const n = numbers();
        print(t("pro.statsLabel").toUpperCase(), "info");
        print("  " + t("pro.lessons") + ": " + n.lessons.done + "/" + n.lessons.total);
        print("  " + t("pro.lab") + ": " + n.lab.done + "/" + n.lab.total);
        print("  " + t("pro.quiz") + ": " + (n.quiz ? n.quiz.score + "/" + n.quiz.total : t("pro.none")));
        print("  " + t("pro.glossary") + ": " + n.terms.done + "/" + n.terms.total);
        print("  " + t("pro.level") + ": " + (n.level === null ? t("pro.none") : n.level) + (n.xp === null ? "" : "  (" + t("pro.xp", { n: n.xp }) + ")"));
        print("  " + t("pro.streak") + ": " + n.streak);
    }

    // "path": the stages of My path with their progress, then the memory numbers
    function cmdPath() {
        const learn = A.learn;
        if (!learn || !safe(function () { return learn.profile(); }, null)) {
            print(t("pro.term.pathNone"), "dim");
            return;
        }
        const path = learn.path();
        const marks = { done: "✓", start: "▸", progress: "▸", known: "–", later: "·" };
        print(t("nav.learn").toUpperCase(), "info");
        path.stages.forEach(function (stage, index) {
            print("  " + (marks[stage.state] || "·") + " " + index + "  " + (t("learn.stage." + stage.id) + "                          ").slice(0, 26) +
                stage.done + "/" + stage.total + (stage.star ? "  ★" : ""));
        });
        if (path.next) print("  " + t("pro.chipNext") + ": " + path.next.title);
        const memory = learn.memory();
        print("  " + t("pro.term.pathMemory", { total: num(memory.total), due: num(memory.due), strong: num(memory.strong) }), "dim");
    }

    function cmdReview() {
        if (!A.learn) return;
        print(t("pro.term.reviewStart"), "ok");
        A.learn.review(terminal ? terminal.input : null);
    }

    function cmdLs() {
        PAGES.forEach(function (page) {
            const ready = pageReady(page.id);
            print("  " + (ready ? "drwxr-x  " : "d------  ") + ("~/" + page.id + "/              ").slice(0, 16) + "g " + page.key);
        });
    }

    function cmdWhoami() {
        const n = numbers();
        print(t("pro.term.whoami", {
            level: n.level === null ? "—" : n.level,
            xp: n.xp === null ? 0 : n.xp,
            badges: n.badges,
            streak: n.streak
        }), "info");
    }

    function cmdRandom() {
        const term = safe(function () { return A.glossary.random(); }, null);
        if (!term) {
            print(t("pro.none"), "error");
            return;
        }
        print(term.term.toUpperCase(), "info");
        print(term.short || term.definition || "");
    }

    function cmdTimer(arg) {
        const value = (arg || "").toLowerCase();
        if (value === "stop" || value === "стоп") {
            stopTimer(false);
            print(t("pro.term.timerStopped"), "ok");
            return;
        }
        const minutes = value ? parseInt(value, 10) : TIMER_DEFAULT;
        if (!(minutes >= 1 && minutes <= 180)) {
            print(t("pro.term.timerHow"), "error");
            return;
        }
        startTimer(minutes);
        print(t("pro.term.timerStarted", { n: minutes }), "ok");
    }

    function cmdHistory() {
        const list = terminal.history;
        if (!list.length) {
            print(t("pro.none"), "dim");
            return;
        }
        list.forEach(function (line, index) {
            print(("   " + (index + 1)).slice(-4) + "  " + line, "dim");
        });
    }

    function cmdNeofetch() {
        const n = numbers();
        const art = [
            "      .-^-.      ",
            "    /   N   \\    ",
            "   |  \\ | /  |   ",
            "   | -- o -- |   ",
            "   |  / | \\  |   ",
            "    \\   S   /    ",
            "      '-.-'      "
        ];
        const info = [
            "ai@compass",
            "----------",
            "OS: AI Compass (" + (A.lang === "ru" ? "RU" : "EN") + ")",
            "Design: Pro",
            "Theme: " + A.theme,
            "Lessons: " + n.lessons.done + "/" + n.lessons.total,
            "Lab: " + n.lab.done + "/" + n.lab.total + "  ·  XP: " + (n.xp === null ? 0 : n.xp)
        ];
        art.forEach(function (line, index) {
            print(line + "  " + (info[index] || ""), index < 2 ? "info" : "");
        });
    }

    function cmdTheme(arg) {
        const wanted = arg ? arg.toLowerCase() : (A.theme === "light" ? "dark" : "light");
        if (wanted !== "dark" && wanted !== "light") {
            print("theme dark | theme light", "error");
            return;
        }
        A.setTheme(wanted);
        print(t("pro.term.done"), "ok");
    }

    function cmdLang(arg) {
        const wanted = arg ? arg.toLowerCase() : (A.lang === "ru" ? "en" : "ru");
        if (wanted !== "en" && wanted !== "ru") {
            print("lang en | lang ru", "error");
            return;
        }
        A.setLanguage(wanted);
        print(t("pro.term.done"), "ok");
    }

    function cmdDesign(arg) {
        const wanted = arg ? arg.toLowerCase() : "simple";
        if (wanted !== "simple" && wanted !== "pro") {
            print("design simple | design pro", "error");
            return;
        }
        if (A.settings) A.settings.set("design", wanted);
    }

    /* =========================================================
       6. THE STATUS BAR (bottom of the screen, wide screens)
       ========================================================= */
    function pageName() {
        const current = document.querySelector("main > section.page-current");
        const id = current ? current.id : "home";
        const page = PAGES.find(function (p) { return p.id === id; });
        const keys = { home: "cmd.home", learn: "nav.learn", lessons: "nav.lessons", lab: "nav.lab", quiz: "nav.quiz", challenge: "nav.challenge", glossary: "nav.glossary", timeline: "nav.timeline", teachers: "nav.teachers", about: "nav.about" };
        return keys[id] ? t(keys[id]) : page ? page.names[0] : id;
    }

    function drawStatus(n) {
        if (!statusBar) return;
        const mod = A.isMac ? "⌘K" : "Ctrl+K";
        const online = navigator.onLine !== false;
        statusBar.innerHTML =
            '<span class="pro-status-item pro-status-brand"><span class="pro-pulse" aria-hidden="true"></span>AI COMPASS · PRO</span>' +
            '<span class="pro-status-item">' + esc(t("pro.statusPage")) + " <b>" + esc(pageName()) + "</b></span>" +
            '<span class="pro-status-item">' + esc(online ? t("pro.statusOnline") : t("pro.statusOffline")) + "</span>" +
            '<span class="pro-status-item">' + esc(A.lang.toUpperCase()) + " · " + esc(t(A.theme === "light" ? "settings.themeLight" : "settings.themeDark")) + "</span>" +
            '<span class="pro-status-spacer"></span>' +
            '<span class="pro-status-item">' + esc(t("pro.level")) + " <b>" + (n.level === null ? "—" : num(n.level)) + "</b>" +
                (n.xp === null ? "" : " · " + esc(t("pro.xp", { n: num(n.xp) }))) + "</span>" +
            '<span class="pro-status-item">🔥 <b>' + num(n.streak) + "</b></span>" +
            '<button type="button" class="pro-status-item pro-status-timer" data-pro-action="timer" title="' + esc(t("pro.timerTitle")) + '">⏱ <b data-pro-timer-text>' +
                esc(timerState() ? clock(timerState().end - Date.now()) : t("pro.timerOff")) + "</b></button>" +
            '<span class="pro-status-item pro-status-keys"><kbd>' + esc(mod) + "</kbd> " + esc(t("pro.statusSearch")) + " <kbd>?</kbd> " + esc(t("pro.statusKeys")) + " <kbd>g</kbd> " + esc(t("pro.statusJump")) + "</span>";
        A.dom.setHidden(statusBar, false);
    }

    /* =========================================================
       7. "G THEN A LETTER": JUMPING TO A PAGE WITH THE KEYBOARD
       Pro design only. "g", then within a second: h home, p my path,
       l lessons, a lab, q quiz, c challenge, g glossary, t history, e teachers,
       i about. "`" (the key left of 1) goes to the terminal.
       ========================================================= */
    let jumpUntil = 0;

    document.addEventListener("keydown", function (event) {
        if (!isPro() || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
        if (A.dom.isTyping(event.target) || A.overlays.hasModal()) return;
        const key = event.key.toLowerCase();
        if (Date.now() < jumpUntil) {
            jumpUntil = 0;
            const page = PAGES.find(function (p) { return p.key === key; });
            if (page && openPage(page.id)) event.preventDefault();
            return;
        }
        if (key === "g" && !event.shiftKey) {
            jumpUntil = Date.now() + JUMP_MS;
            return;
        }
        if (event.key === "`") {
            event.preventDefault();
            focusTerminal();
        }
    });

    function focusTerminal() {
        openPage("home");
        refresh();
        if (!terminal) return;
        requestAnimationFrame(function () {
            terminal.input.scrollIntoView({ block: "center", behavior: A.motion.ok() ? "smooth" : "auto" });
            terminal.input.focus({ preventScroll: true });
        });
    }

    /* =========================================================
       8. KEEPING EVERYTHING UP TO DATE
       ========================================================= */
    function hideAll() {
        [panel, deck, statusBar].forEach(function (element) {
            if (element) A.dom.setHidden(element, true);
        });
    }

    let waiting = false;
    function refresh() {
        const current = document.querySelector("main > section.page-current");
        session.pages.add(current ? current.id : "home");
        if (!isPro()) {
            hideAll();
            return;
        }
        const n = numbers();
        drawPanel(n);
        drawDeck(n);
        drawStatus(n);
        drawPageBars(n);
        tickTimer();
    }

    // Many changes can come at once (a lesson finished gives XP, a badge...): drawn once per frame
    function later() {
        if (waiting) return;
        waiting = true;
        requestAnimationFrame(function () {
            waiting = false;
            refresh();
        });
    }

    if (panel) {
        panel.addEventListener("click", onAction);
    }
    if (deck) deck.addEventListener("click", onAction);
    if (statusBar) statusBar.addEventListener("click", onAction);

    function onAction(event) {
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
        } else if (name === "terminal") {
            focusTerminal();
        } else if (name === "timer") {
            if (timerState()) stopTimer(false);
            else startTimer(TIMER_DEFAULT);
        } else if (name === "lab") {
            const id = button.getAttribute("data-arg");
            if (A.lab && id) A.lab.open(id);
            else A.navigate("lab");
        } else if (name === "quiz" || name === "timed" || name === "mistakes") {
            if (A.quiz) A.quiz.start(name === "quiz" ? "classic" : name);
        } else if (name === "glossary") {
            A.navigate("glossary");
        } else if (name === "review") {
            if (A.learn) A.learn.review(button);
        } else if (name === "path") {
            openPage("learn");
        } else if (name === "daily") {
            if (A.quiz) A.quiz.start("daily");
        } else if (name === "cards") {
            if (A.glossary && typeof A.glossary.study === "function") A.glossary.study();
            else A.navigate("glossary");
        } else if (name === "termday") {
            const id = button.getAttribute("data-term");
            if (A.glossary && id) A.glossary.show(id, { focus: true });
        } else if (name === "compass") {
            if (A.journey) A.journey.open();
        } else if (name === "simple") {
            if (A.settings) {
                A.settings.set("design", "simple");
                A.toast(t("settings.saidValue", { setting: t("settings.design"), value: t("settings.designSimple") }), "🌱");
            }
        }
    }

    A.on("activity", later);
    A.on("section", later);
    A.on("settings", function (detail) {
        if (detail && (detail.name === "design" || detail.name === "theme")) later();
    });
    A.onLanguageChange(function () {
        if (terminal) {
            // The welcome lines are written again in the new language
            clearLog();
            terminal.greeted = false;
        }
        later();
    });
    A.onThemeChange(later);
    window.addEventListener("hashchange", later);
    window.addEventListener("online", later);
    window.addEventListener("offline", later);
    A.ready(refresh);
    /* =========================================================
       9. THE FOCUS TIMER
       A study timer (25 minutes unless asked otherwise). It shows in the
       status bar and in "This session", and a toast says when it is over.
       Its end time is saved, so it keeps running after a reload.
       ========================================================= */
    let timerTicker = 0;

    function timerState() {
        const saved = A.storage.get(TIMER_KEY, null);
        if (!saved || typeof saved.end !== "number" || typeof saved.minutes !== "number") return null;
        return saved;
    }

    function clock(ms) {
        const total = Math.max(0, Math.round(ms / 1000));
        return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
    }

    function startTimer(minutes) {
        A.storage.set(TIMER_KEY, { end: Date.now() + minutes * 60000, minutes: minutes });
        A.toast(t("pro.timerStarted", { n: num(minutes) }), "⏱️");
        later();
    }

    function stopTimer(finished) {
        const was = timerState();
        A.storage.remove(TIMER_KEY);
        if (finished && was) A.toast(t("pro.timerDone", { n: num(was.minutes) }), "🎉");
        later();
    }

    // Once a second while the timer runs: only the time texts change
    function tickTimer() {
        const timer = timerState();
        if (!timer) {
            clearInterval(timerTicker);
            timerTicker = 0;
            return;
        }
        if (timer.end <= Date.now()) {
            clearInterval(timerTicker);
            timerTicker = 0;
            stopTimer(true);
            return;
        }
        document.querySelectorAll("[data-pro-timer-text]").forEach(function (element) {
            A.dom.setText(element, clock(timer.end - Date.now()));
        });
        if (!timerTicker) timerTicker = setInterval(tickTimer, 1000);
    }

    /* =========================================================
       10. THE CONTEXT BAR AT THE TOP OF EVERY PAGE
       A line above each page's title: where you are (like a path in a
       terminal), live numbers for that page, and its "g" key.
       ========================================================= */
    function chip(label, value) {
        return '<span class="pro-chip"><span>' + esc(label) + "</span><b>" + value + "</b></span>";
    }

    function pageChips(id, n) {
        if (id === "learn") {
            const memory = safe(function () { return A.learn.profile() ? A.learn.memory() : null; }, null);
            if (!memory) return chip(t("pro.chipCards"), "—") + chip(t("pro.chipDue"), "—");
            return chip(t("pro.chipCards"), num(memory.total)) +
                chip(t("pro.chipDue"), num(memory.due)) +
                chip(t("pro.chipStrong"), num(memory.strong));
        }
        if (id === "lessons") {
            const next = safe(function () { return A.lessons.next(); }, 0);
            return chip(t("pro.lessons"), count(n.lessons)) +
                chip(t("pro.chipNext"), next ? "#" + num(next) : "✓");
        }
        if (id === "lab") {
            return chip(t("pro.lab"), count(n.lab)) + chip(t("pro.chipLeft"), num(n.lab.total - n.lab.done));
        }
        if (id === "quiz" || id === "challenge") {
            const mistakes = n.quizStats && n.quizStats.mistakes;
            return chip(t("pro.quiz"), n.quiz ? num(n.quiz.score) + "/" + num(n.quiz.total) : "—") +
                chip(t("pro.streak"), num(n.streak)) +
                chip(t("pro.chipMistakes"), num(mistakes ? mistakes.count : 0));
        }
        if (id === "glossary") {
            const due = safe(function () { return A.glossary.due(); }, null);
            return chip(t("pro.glossary"), count(n.terms)) + chip(t("pro.chipDue"), due === null ? "—" : num(due));
        }
        return chip(t("pro.level"), n.level === null ? "—" : num(n.level)) + chip("XP", n.xp === null ? "—" : num(n.xp));
    }

    function drawPageBars(n) {
        document.querySelectorAll("main > section.section[id]").forEach(function (section) {
            const container = section.querySelector(":scope > .container");
            if (!container) return;
            let bar = container.querySelector(":scope > .pro-pagebar");
            if (!bar) {
                bar = document.createElement("div");
                bar.className = "pro-pagebar";
                container.insertBefore(bar, container.firstChild);
            }
            // Only the open page needs fresh numbers; the others are drawn when they open
            if (!section.classList.contains("page-current") && bar.childElementCount) return;
            const page = PAGES.find(function (p) { return p.id === section.id; });
            bar.innerHTML =
                '<span class="pro-path" aria-hidden="true"><span>~/ai-compass/</span><b>' + esc(section.id) + "</b></span>" +
                '<span class="pro-chips">' + pageChips(section.id, n) + "</span>" +
                (page ? '<span class="pro-pagebar-key" aria-hidden="true"><kbd>g</kbd><kbd>' + esc(page.key) + "</kbd></span>" : "");
        });
    }
})();
