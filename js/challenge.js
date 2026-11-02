/* =========================================================
   AI COMPASS — THE KNOWLEDGE CHALLENGE (and its leaderboard)
   A competitive round of 20 random questions from every lesson, for people
   who are signed in (js/account.js). Everything that matters for fairness
   happens in the database (supabase/schema.sql): it picks the questions,
   shuffles them and their options, starts the clock, marks the answers and
   ranks the players. This file only shows the questions, collects the
   answers and draws the results and the leaderboard. The right answers and
   the explanations arrive only after the attempt is finished.
   The leaderboard is public (nicknames only) and is shown to everybody; it
   ranks right answers first, then time, and has an all-time and a weekly view.

   Sections of this file:
    1. Settings
    2. Small helpers
    3. The attempt in progress (kept in this browser, so a reload continues it)
    4. Building the section
    5. The lobby: rules, start, your best result
    6. A question
    7. Sending the answers and the result
    8. The leaderboard
    9. Keyboard, account changes, language
   10. The Ctrl+K commands and the public API
   Every text (English and Russian) is in js/content/challenge.js
   Progress events (A.track): "challenge.start" { attempt }, "challenge.finish"
   { correct, total, seconds, eligible, newBest } (My Compass ignores them for now).
   ========================================================= */
(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const t = A.t;

    /* ---------- 1. Settings ---------- */
    const STORE_KEY = "challenge.attempt";   // the attempt in progress (A.storage)
    const BOARD_CACHE = 60000;               // ms: a leaderboard younger than this is not fetched again
    const STATS_CACHE = 60000;               // ms: the same for "your best result"
    const WARN_MINUTES = 5;                  // "about 5 minutes left" appears once, gently
    const SWITCH_MS = 220;                   // the screen change animation (css/challenge.css)
    const TICK_MS = 1000;                    // the clock is redrawn every second
    const MAX_WRONG_SHOWN = 20;              // the result lists every question that went wrong

    const section = document.getElementById("challenge");
    const mount = section ? section.querySelector('[data-feature="challenge"]') : null;
    const navLink = document.querySelector(".ch-nav-link");
    const enabled = Boolean(mount && A.account && A.account.enabled);

    // Accounts are off in this copy of the site: no section, no menu link, no command
    if (!enabled) {
        if (navLink) navLink.hidden = true;
        const index = A.commands.findIndex(function (c) { return c.id === "go-challenge"; });
        if (index !== -1) A.commands.splice(index, 1);
        return;
    }
    A.dom.setHidden(section, false);

    /* ---------- 2. Small helpers ---------- */
    function esc(text) {
        return A.escapeHTML(String(text));
    }

    function pad(n) {
        return (n < 10 ? "0" : "") + n;
    }

    // 3 min 42 s
    function timeText(ms) {
        const seconds = Math.max(0, Math.round(Number(ms) / 1000));
        const minutes = Math.floor(seconds / 60);
        return minutes ? t("challenge.time.minSec", { m: minutes, s: seconds % 60 }) : t("challenge.time.sec", { s: seconds });
    }

    // 3:42 (the running clock)
    function clockText(ms) {
        const seconds = Math.max(0, Math.floor(Number(ms) / 1000));
        return Math.floor(seconds / 60) + ":" + pad(seconds % 60);
    }

    function whenText(time) {
        const ago = Date.now() - time;
        if (ago < 90000) return t("challenge.when.now");
        return A.plural("challenge.when.minutes", Math.round(ago / 60000));
    }

    function shortDate(iso) {
        return A.format.date(new Date(iso).getTime(), { day: "numeric", month: "long" });
    }

    function signedIn() {
        return Boolean(A.account && A.account.signedIn());
    }

    function myId() {
        const user = A.account.user();
        return user ? user.id : "";
    }

    // Is the challenge on screen (so keys may belong to it)?
    function onScreen() {
        if (!ui.root) return false;
        const box = ui.root.getBoundingClientRect();
        return box.bottom > 0 && box.top < window.innerHeight;
    }

    /* ---------- 3. The attempt in progress ----------
       { id, user, startedAt, expiresAt, total, lang, rules, questions: [{ id, lesson, text, options }],
         answers: [position or null], index }    (times in ms, from the server clock) */
    let attempt = null;
    let expiredNote = false;     // the saved attempt was over its time: say so once in the lobby

    function loadAttempt() {
        const saved = A.storage.get(STORE_KEY, null);
        if (!saved || typeof saved !== "object" || !Array.isArray(saved.questions) || !saved.id) return null;
        if (saved.user !== myId()) return null;
        if (Date.now() >= Number(saved.expiresAt)) {
            expiredNote = true;
            A.storage.remove(STORE_KEY);
            return null;
        }
        return saved;
    }

    function saveAttempt() {
        if (attempt) A.storage.set(STORE_KEY, attempt);
        else A.storage.remove(STORE_KEY);
    }

    /* ---------- 4. Building the section ---------- */
    const ui = {};
    let screen = "lobby";        // lobby | question | sending | result
    let result = null;           // the marked attempt, from the server
    let lobbyError = "";         // "start", "bank", "signedOut", "tooSoon"
    let lobbyWait = 0;           // seconds to wait when the error is "tooSoon"
    let starting = false;
    let sendError = false;
    let stats = { data: null, at: 0, loading: false, failed: false };
    let board = { period: "all", data: {}, at: {}, loading: false, failed: false };
    let clockTimer = 0;
    let warned = false;
    let switchTimer = 0;
    let quitPress = null;
    let built = false;

    function build() {
        if (built) return;
        built = true;
        mount.innerHTML =
            '<div class="ch">' +
                '<div class="ch-main" data-ref="main"></div>' +
                '<aside class="ch-board" data-ref="board" aria-labelledby="ch-board-title"></aside>' +
            "</div>";
        ui.root = mount.firstElementChild;
        ui.main = ui.root.querySelector("[data-ref=main]");
        ui.board = ui.root.querySelector("[data-ref=board]");
        ui.root.addEventListener("click", onClick);
        attempt = loadAttempt();
        render();
        loadBoard(board.period);
        if (signedIn()) loadStats();
    }

    // Changes the screen with a short fade (none in calm mode)
    function show(nextScreen) {
        clearTimeout(switchTimer);
        screen = nextScreen;
        ui.root.classList.toggle("is-playing", screen === "question" || screen === "sending");
        if (!A.motion.ok()) {
            render();
            return;
        }
        ui.main.classList.add("is-leaving");
        switchTimer = setTimeout(function () {
            ui.main.classList.remove("is-leaving");
            render();
            A.dom.replay(ui.main, "is-entering");
        }, SWITCH_MS);
    }

    function render() {
        if (!built) return;
        if (screen === "question") renderQuestion();
        else if (screen === "sending") renderSending();
        else if (screen === "result") renderResult();
        else renderLobby();
        renderBoard();
    }

    /* ---------- 5. The lobby ---------- */
    function rulesList(rules) {
        const r = rules || (attempt && attempt.rules) || (board.data.all && board.data.all.rules) || { questions: 20, limit_minutes: 60, min_seconds: 60 };
        return '<ul class="ch-rules">' +
            "<li>" + esc(A.plural("challenge.rules.1", r.questions)) + "</li>" +
            "<li>" + esc(t("challenge.rules.2")) + "</li>" +
            "<li>" + esc(t("challenge.rules.3", { n: r.limit_minutes })) + "</li>" +
            "<li>" + esc(t("challenge.rules.4", { n: r.questions })) + "</li>" +
            "<li>" + esc(t("challenge.rules.5")) + "</li>" +
            "<li>" + esc(t("challenge.rules.6", { n: r.min_seconds })) + "</li>" +
        "</ul>";
    }

    function renderLobby() {
        let html = '<div class="ch-card ch-lobby">';
        html += '<h3 class="ch-h3" id="ch-rules-title">' + esc(t("challenge.rules.title")) + "</h3>" + rulesList();

        if (!signedIn()) {
            html += '<div class="ch-start-box">' +
                "<p>" + esc(t("challenge.signIn.text")) + "</p>" +
                '<button type="button" class="btn btn-primary ch-big" data-action="signin">' + esc(t("challenge.signIn.button")) + "</button>" +
                '<p class="ch-muted">' + esc(t("challenge.signIn.practice")) + ' <a href="#quiz" data-action="quiz">' + esc(t("challenge.signIn.quiz")) + "</a></p>" +
            "</div>";
        } else {
            html += '<div class="ch-start-box">';
            if (attempt) {
                html += '<button type="button" class="btn btn-primary ch-big" data-action="continue" data-focus="continue">' + esc(t("challenge.continue")) + "</button>" +
                    '<p class="ch-muted">' + esc(t("challenge.continueSub", { n: attempt.index + 1, total: attempt.total })) + "</p>" +
                    '<button type="button" class="btn btn-ghost btn-small" data-action="start">' + esc(t("challenge.startOver")) + "</button>";
            } else {
                html += '<button type="button" class="btn btn-primary ch-big" data-action="start" data-focus="start"' + (starting ? " disabled" : "") + ">" +
                    esc(t(starting ? "challenge.starting" : "challenge.start")) + "</button>";
            }
            if (expiredNote) html += '<p class="ch-note">' + esc(t("challenge.expiredNote")) + "</p>";
            if (lobbyError) {
                html += '<p class="ch-problem" role="alert">' +
                    esc(lobbyError === "tooSoon" ? A.plural("challenge.error.tooSoon", lobbyWait) : t("challenge.error." + lobbyError)) + "</p>";
            }
            html += "</div>";
            html += '<div class="ch-best">' +
                '<h3 class="ch-h3">' + esc(t("challenge.best.title")) + "</h3>" + bestText() +
            "</div>";
        }
        html += "</div>";
        ui.main.innerHTML = html;
        focusBack();
    }

    function bestText() {
        const s = stats.data;
        if (stats.loading && !s) return '<p class="ch-muted">' + esc(t("challenge.best.loading")) + "</p>";
        if (!s || !s.best) return '<p class="ch-muted">' + esc(t("challenge.best.none")) + "</p>";
        let html = '<p class="ch-best-line"><strong>' + esc(t("challenge.best.line", { correct: s.best.correct, total: s.best.total, time: timeText(s.best.duration_ms) })) + "</strong></p>";
        if (s.standing && s.standing.all) html += '<p class="ch-muted">' + esc(t("challenge.best.position", { position: s.standing.all.position, players: s.standing.all.players })) + "</p>";
        if (s.week_best) html += '<p class="ch-muted">' + esc(t("challenge.best.week", { correct: s.week_best.correct, total: s.week_best.total, time: timeText(s.week_best.duration_ms) })) + "</p>";
        return html;
    }

    function loadStats(force) {
        if (!signedIn()) return;
        if (!force && stats.data && Date.now() - stats.at < STATS_CACHE) return;
        if (stats.loading) return;
        stats.loading = true;
        A.account.rpc("my_stats").then(function (data) {
            stats = { data: data, at: Date.now(), loading: false, failed: false };
            if (screen === "lobby") render();
        }, function () {
            stats.loading = false;
            stats.failed = true;
            if (screen === "lobby") render();
        });
    }

    // After a rebuild, the focus goes back to the control it was on
    let focusName = null;
    function rememberFocus() {
        const active = document.activeElement;
        focusName = active && ui.root && ui.root.contains(active) ? active.getAttribute("data-focus") : null;
    }
    function focusBack() {
        if (!focusName) return;
        const again = ui.main.querySelector('[data-focus="' + focusName + '"]');
        focusName = null;
        if (again) again.focus({ preventScroll: true });
    }

    function start() {
        if (starting || !signedIn()) return Promise.resolve(false);
        starting = true;
        lobbyError = "";
        expiredNote = false;
        rememberFocus();
        render();
        return A.account.rpc("begin_attempt", { lang: A.lang }).then(function (data) {
            starting = false;
            const startedAt = new Date(data.attempt.started_at).getTime();
            const expiresAt = new Date(data.attempt.expires_at).getTime();
            // The server's clock may differ from this device's: the clock shown counts from now
            const skew = Date.now() - startedAt;
            attempt = {
                id: data.attempt.id, user: myId(), startedAt: startedAt + skew, expiresAt: expiresAt + skew, skew: skew,
                total: data.attempt.total, lang: A.lang, rules: data.rules, questions: data.questions,
                answers: data.questions.map(function () { return null; }), index: 0
            };
            saveAttempt();
            result = null;
            warned = false;
            A.track("challenge.start", { attempt: attempt.id });
            show("question");
            return true;
        }, function (error) {
            starting = false;
            const code = error && error.message;
            lobbyError = code === "bank_too_small" ? "bank" : code === "not_signed_in" ? "signedOut" : code === "too_soon" ? "tooSoon" : "start";
            // the server says how long to wait (its hint); without it, the rule itself
            const rulesKnown = (board.data.all && board.data.all.rules) || {};
            lobbyWait = parseInt(error && error.raw && error.raw.hint, 10) || rulesKnown.cooldown_seconds || 60;
            if (screen === "lobby") render(); else show("lobby");    // the problem is explained in the lobby
            return false;
        });
    }

    function resume() {
        if (!attempt) return;
        warned = false;
        show("question");
    }

    /* ---------- 6. A question ---------- */
    function renderQuestion() {
        stopClock();
        if (!attempt) { screen = "lobby"; renderLobby(); return; }
        const i = attempt.index;
        const q = attempt.questions[i];
        const picked = attempt.answers[i];
        const last = i === attempt.total - 1;
        const nextKey = last ? (picked === null ? "challenge.q.finishSkip" : "challenge.q.finish") : (picked === null ? "challenge.q.skip" : "challenge.q.next");
        let html = '<div class="ch-card ch-play">' +
            '<div class="ch-top">' +
                '<p class="ch-progress"><span class="ch-progress-text">' + esc(t("challenge.q.progress", { n: i + 1, total: attempt.total })) + "</span>" +
                    '<span class="ch-progress-bar" aria-hidden="true"><span class="ch-progress-fill" style="width:' + Math.round(i / attempt.total * 100) + '%"></span></span></p>' +
                '<p class="ch-timer" role="timer" aria-live="off"><span class="ch-timer-label">' + esc(t("challenge.q.time")) + '</span> <span class="ch-timer-num mono" data-ref="clock">' + clockText(Date.now() - attempt.startedAt) + "</span>" +
                    '<span class="sr-only" data-ref="clockSr"></span></p>' +
            "</div>" +
            '<h3 class="ch-question" id="ch-question" tabindex="-1" data-ref="question">' + esc(q.text) + "</h3>" +
            '<div class="ch-options" role="group" aria-labelledby="ch-question">' +
                q.options.map(function (option, position) {
                    return '<button type="button" class="ui-option ch-option' + (picked === position ? " is-chosen" : "") + '" data-action="pick" data-position="' + position + '" aria-pressed="' + (picked === position ? "true" : "false") + '" style="--i:' + position + '">' +
                        '<kbd class="ch-key" aria-hidden="true">' + (position + 1) + "</kbd>" +
                        '<span class="ch-option-text">' + esc(option) + "</span>" +
                        (picked === position ? '<span class="sr-only">' + esc(t("challenge.q.chosen")) + "</span>" : "") +
                    "</button>";
                }).join("") +
            "</div>" +
            '<div class="ch-controls">' +
                '<button type="button" class="btn btn-primary ch-next" data-action="next" data-ref="next" data-focus="next">' + esc(t(nextKey)) + "</button>" +
                '<button type="button" class="btn btn-ghost btn-small ch-quit" data-ref="quit"><span data-ref="quitLabel">' + esc(t("challenge.q.quit")) + "</span></button>" +
            "</div>" +
            '<p class="ch-hint">' + esc(t("challenge.q.hint")) + "</p>" +
            '<p class="ch-note ch-warn" data-ref="warn" hidden></p>' +
        "</div>";
        ui.main.innerHTML = html;
        ui.main.querySelectorAll("[data-ref]").forEach(function (element) { ui[element.getAttribute("data-ref")] = element; });
        setUpQuit();
        startClock();
        if (focusName === "next" || focusName === null) ui.question.focus({ preventScroll: true });
        focusName = null;
    }

    function setUpQuit() {
        quitPress = A.confirmPress(ui.quit, {
            onArm: function () {
                ui.quit.classList.add("is-armed");
                ui.quitLabel.textContent = t("challenge.q.quitAsk");
                A.announce(t("challenge.q.quitAsk"));
            },
            onDisarm: function () {
                if (!ui.quit.isConnected) return;
                ui.quit.classList.remove("is-armed");
                ui.quitLabel.textContent = t("challenge.q.quit");
            },
            onConfirm: quit
        });
    }

    function pick(position) {
        if (!attempt || screen !== "question") return;
        const i = attempt.index;
        attempt.answers[i] = attempt.answers[i] === position ? null : position;
        saveAttempt();
        const buttons = ui.main.querySelectorAll(".ch-option");
        buttons.forEach(function (button, p) {
            const on = attempt.answers[i] === p;
            button.classList.toggle("is-chosen", on);
            button.setAttribute("aria-pressed", on ? "true" : "false");
            const sr = button.querySelector(".sr-only");
            if (on && !sr) button.insertAdjacentHTML("beforeend", '<span class="sr-only">' + esc(t("challenge.q.chosen")) + "</span>");
            if (!on && sr) sr.remove();
        });
        const last = i === attempt.total - 1;
        const picked = attempt.answers[i];
        ui.next.textContent = t(last ? (picked === null ? "challenge.q.finishSkip" : "challenge.q.finish") : (picked === null ? "challenge.q.skip" : "challenge.q.next"));
    }

    function next() {
        if (!attempt || screen !== "question") return;
        if (attempt.index < attempt.total - 1) {
            attempt.index += 1;
            saveAttempt();
            focusName = null;
            show("question");
        } else {
            submit();
        }
    }

    function quit() {
        attempt = null;
        saveAttempt();
        stopClock();
        show("lobby");
    }

    function startClock() {
        stopClock();
        tick();
        clockTimer = setInterval(tick, TICK_MS);
    }

    function stopClock() {
        clearInterval(clockTimer);
        clockTimer = 0;
    }

    function tick() {
        if (!attempt || !ui.clock || !ui.clock.isConnected) { stopClock(); return; }
        const elapsed = Date.now() - attempt.startedAt;
        ui.clock.textContent = clockText(elapsed);
        ui.clockSr.textContent = t("challenge.q.timeSr", { time: timeText(elapsed) });
        const left = attempt.expiresAt - Date.now();
        if (!warned && left <= WARN_MINUTES * 60000 && left > 0) {
            warned = true;
            ui.warn.textContent = t("challenge.q.timeWarn", { n: WARN_MINUTES });
            ui.warn.hidden = false;
            A.announce(ui.warn.textContent);
        }
    }

    /* ---------- 7. Sending the answers and the result ---------- */
    function renderSending() {
        stopClock();
        ui.main.innerHTML = '<div class="ch-card ch-sending" role="status">' +
            (sendError
                ? '<p class="ch-problem">' + esc(t("challenge.sendFailed")) + "</p>" +
                  '<button type="button" class="btn btn-primary ch-big" data-action="resend" data-focus="resend">' + esc(t("challenge.sendRetry")) + "</button>"
                : '<p class="ch-muted ch-sending-text">' + esc(t("challenge.sending")) + "</p>") +
        "</div>";
        focusBack();
    }

    function submit() {
        if (!attempt) return Promise.resolve(false);
        const sending = attempt;
        sendError = false;
        stopClock();
        show("sending");
        return A.account.rpc("submit_attempt", { attempt_id: sending.id, answers: sending.answers, lang: A.lang }).then(function (data) {
            result = data;
            attempt = null;
            saveAttempt();
            A.track("challenge.finish", {
                correct: data.correct, total: data.total, seconds: Math.round((data.duration_ms || 0) / 1000),
                eligible: Boolean(data.eligible), newBest: Boolean(data.new_best)
            });
            board.at = {};             // the boards are stale now
            loadStats(true);
            show("result");
            loadBoard(board.period, true);
            return true;
        }, function (error) {
            const code = error && error.message;
            if (code === "attempt_not_found" || code === "bad_answers") {
                // The attempt is gone on the server (another device started a new one): back to the start
                attempt = null;
                saveAttempt();
                lobbyError = "start";
                show("lobby");
                return false;
            }
            sendError = true;
            render();
            return false;
        });
    }

    function renderResult() {
        stopClock();
        const r = result;
        if (!r) { screen = "lobby"; renderLobby(); return; }
        const rules = r.rules || {};
        let html = '<div class="ch-card ch-result">';
        html += '<h3 class="ch-h3" id="ch-result-title" tabindex="-1" data-ref="resultTitle">' + esc(t("challenge.res.title")) + "</h3>";

        if (r.status === "expired") {
            html += '<p class="ch-problem">' + esc(t("challenge.res.expired")) + "</p>";
        } else {
            const share = r.total ? r.correct / r.total : 0;
            html += '<div class="ch-score">' +
                '<p class="ch-score-big"><strong>' + esc(t("challenge.res.score", { correct: r.correct, total: r.total })) + "</strong></p>" +
                '<p class="ch-score-line">' + esc(t("challenge.res.accuracy", { percent: A.format.percent(share) })) + " · " + esc(t("challenge.res.time", { time: timeText(r.duration_ms) })) + "</p>" +
                (r.new_best ? '<p class="ch-newbest">' + esc(t("challenge.res.newBest")) + "</p>" : "") +
                (r.eligible === false ? '<p class="ch-note">' + esc(t("challenge.res.tooFast", { n: rules.min_seconds || 60 })) + "</p>" : "") +
                (r.eligible && r.standing && r.standing.all ? '<p class="ch-muted">' + esc(t("challenge.res.standingAll", r.standing.all)) +
                    (r.standing.week ? " · " + esc(t("challenge.res.standingWeek", r.standing.week)) : "") + "</p>" : "") +
            "</div>";
            html += '<p class="ch-verdict">' + esc(t(share === 1 ? "challenge.res.perfect" : share >= 0.7 ? "challenge.res.good" : "challenge.res.keepGoing")) + "</p>";

            const review = Array.isArray(r.review) ? r.review : [];
            const wrong = review.filter(function (item) { return item.picked !== item.correct; });
            if (wrong.length) {
                html += '<h4 class="ch-h4">' + esc(t("challenge.res.wrongTitle")) + " (" + wrong.length + ")</h4>" +
                    '<ol class="ch-review">' + wrong.slice(0, MAX_WRONG_SHOWN).map(reviewItem).join("") + "</ol>";
                if (review.length - wrong.length > 0) html += '<p class="ch-muted">' + esc(A.plural("challenge.res.allRight", review.length - wrong.length)) + "</p>";
            }
            if (review.length) {
                html += '<details class="ch-all"><summary>' + esc(t("challenge.res.allTitle", { n: review.length })) + "</summary>" +
                    '<ol class="ch-review ch-review-all">' + review.map(reviewItem).join("") + "</ol></details>";
            }
        }
        html += '<div class="ch-controls ch-result-controls">' +
            '<button type="button" class="btn btn-primary" data-action="start">' + esc(t("challenge.res.again")) + "</button>" +
            '<button type="button" class="btn btn-ghost" data-action="lessons">' + esc(t("challenge.res.lessons")) + "</button>" +
            '<button type="button" class="btn btn-ghost" data-action="board">' + esc(t("challenge.res.board")) + "</button>" +
        "</div></div>";
        ui.main.innerHTML = html;
        ui.main.querySelectorAll("[data-ref]").forEach(function (element) { ui[element.getAttribute("data-ref")] = element; });
        ui.resultTitle.focus({ preventScroll: true });
    }

    function reviewItem(item) {
        const right = item.picked === item.correct;
        const skipped = item.picked === null || item.picked === undefined;
        const mark = right ? "right" : skipped ? "skipped" : "wrong";
        return '<li class="ch-review-item is-' + mark + '">' +
            '<p class="ch-review-q"><span class="ch-mark" aria-hidden="true"></span><span class="sr-only">' + esc(t("challenge.res." + mark)) + ": </span>" + esc(item.text) + "</p>" +
            (right ? "" : '<p class="ch-review-yours">' + esc(skipped ? t("challenge.res.noAnswer") : t("challenge.res.yourAnswer", { answer: item.options[item.picked] })) + "</p>") +
            '<p class="ch-review-right">' + esc(t("challenge.res.rightAnswer", { answer: item.options[item.correct] })) + "</p>" +
            '<p class="ch-review-why">' + esc(item.explanation) + "</p>" +
            '<a class="ch-review-lesson" href="#lesson-' + Number(item.lesson) + '">' + esc(t("challenge.res.openLesson", { n: item.lesson })) + "</a>" +
        "</li>";
    }

    /* ---------- 8. The leaderboard ---------- */
    function loadBoard(period, force) {
        const data = board.data[period];
        if (!force && data && Date.now() - (board.at[period] || 0) < BOARD_CACHE) return Promise.resolve(data);
        if (board.loading) return Promise.resolve(null);
        board.loading = true;
        board.failed = false;
        renderBoard();
        return A.account.rpc("challenge_board", { period: period }).then(function (result) {
            board.loading = false;
            board.data[period] = result;
            board.at[period] = Date.now();
            renderBoard();
            return result;
        }, function () {
            board.loading = false;
            board.failed = true;
            renderBoard();
            return null;
        });
    }

    function renderBoard() {
        if (!ui.board) return;
        const period = board.period;
        const data = board.data[period];
        const active = document.activeElement;
        const keepFocus = active && ui.board.contains(active) ? active.getAttribute("data-focus") : null;
        let html = '<div class="ch-card ch-board-card">' +
            '<div class="ch-board-head">' +
                '<h3 class="ch-h3" id="ch-board-title">' + esc(t("challenge.board.title")) + "</h3>" +
                '<div class="ch-tabs" role="group">' +
                    '<button type="button" class="ch-tab' + (period === "all" ? " is-on" : "") + '" data-action="period" data-period="all" data-focus="tab-all" aria-pressed="' + (period === "all") + '">' + esc(t("challenge.board.all")) + "</button>" +
                    '<button type="button" class="ch-tab' + (period === "week" ? " is-on" : "") + '" data-action="period" data-period="week" data-focus="tab-week" aria-pressed="' + (period === "week") + '">' + esc(t("challenge.board.week")) + "</button>" +
                "</div>" +
            "</div>";
        if (period === "week" && data && data.since) html += '<p class="ch-muted ch-board-since">' + esc(t("challenge.board.weekSince", { date: shortDate(data.since) })) + "</p>";

        if (!data && board.loading) {
            html += '<p class="ch-muted" role="status">' + esc(t("challenge.board.loading")) + "</p>";
        } else if (!data) {
            html += '<p class="ch-problem">' + esc(t("challenge.board.failed")) + "</p>";
        } else if (!data.rows || !data.rows.length) {
            html += '<p class="ch-empty">' + esc(t(period === "week" ? "challenge.board.emptyWeek" : "challenge.board.empty")) + "</p>";
        } else {
            html += '<table class="ch-table"><thead><tr>' +
                "<th scope=\"col\">" + esc(t("challenge.board.colPos")) + "</th>" +
                "<th scope=\"col\">" + esc(t("challenge.board.colName")) + "</th>" +
                "<th scope=\"col\">" + esc(t("challenge.board.colScore")) + "</th>" +
                "<th scope=\"col\">" + esc(t("challenge.board.colTime")) + "</th>" +
            "</tr></thead><tbody>";
            data.rows.forEach(function (row) {
                const medal = row.position <= 3 ? row.position : 0;
                html += '<tr class="ch-row' + (row.me ? " is-me" : "") + (medal ? " ch-medal-" + medal : "") + '">' +
                    '<td class="ch-pos">' + (medal ? '<span class="ch-medal" aria-hidden="true"></span>' : "") + "<span>" + row.position + "</span></td>" +
                    '<td class="ch-name">' + esc(row.nickname) + (row.me ? ' <span class="ch-you">' + esc(t("challenge.board.you")) + "</span>" : "") + "</td>" +
                    '<td class="ch-score-cell">' + row.correct + "</td>" +
                    '<td class="ch-time-cell">' + esc(timeText(row.duration_ms)) + "</td>" +
                "</tr>";
            });
            html += "</tbody></table>";
        }
        if (data) {
            if (data.me) {
                html += '<p class="ch-yourplace">' + esc(t("challenge.board.yourPlace", { position: data.me.position, players: data.players })) + "</p>";
            } else if (signedIn()) {
                html += '<p class="ch-muted">' + esc(t("challenge.board.notYet")) + "</p>";
            } else {
                html += '<p class="ch-muted">' + esc(t("challenge.board.signIn")) + "</p>";
            }
            html += '<p class="ch-board-meta mono">' + esc(A.plural("challenge.board.players", data.players || 0)) + " · " + esc(t("challenge.board.updated", { when: whenText(board.at[period] || Date.now()) })) +
                ' <button type="button" class="ch-refresh" data-action="refresh" data-focus="refresh">' + esc(t("challenge.board.refresh")) + "</button></p>";
        } else if (board.failed) {
            html += '<p><button type="button" class="btn btn-ghost btn-small" data-action="refresh" data-focus="refresh">' + esc(t("challenge.retry")) + "</button></p>";
        }
        html += '<p class="ch-board-rules">' + esc(t("challenge.board.rules")) + "</p>";
        html += "</div>";
        ui.board.innerHTML = html;
        if (keepFocus) {
            const again = ui.board.querySelector('[data-focus="' + keepFocus + '"]');
            if (again) again.focus({ preventScroll: true });
        }
    }

    /* ---------- 9. Keyboard, clicks, account changes, language ---------- */
    function onClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target || !ui.root.contains(target)) return;
        const action = target.getAttribute("data-action");
        if (action === "signin") A.account.signIn("#challenge");
        else if (action === "start") { quitPress = null; attempt = null; saveAttempt(); start(); }
        else if (action === "continue") resume();
        else if (action === "pick") pick(Number(target.getAttribute("data-position")));
        else if (action === "next") next();
        else if (action === "resend") submit();
        else if (action === "lessons") A.navigate("lessons");
        else if (action === "board") {
            const title = ui.board.querySelector("#ch-board-title");
            if (title) { title.setAttribute("tabindex", "-1"); title.focus(); title.scrollIntoView({ block: "nearest", behavior: A.motion.ok() ? "smooth" : "auto" }); }
        } else if (action === "period") {
            board.period = target.getAttribute("data-period") === "week" ? "week" : "all";
            renderBoard();
            loadBoard(board.period);
        } else if (action === "refresh") loadBoard(board.period, true);
        else if (action === "quiz") { event.preventDefault(); A.navigate("quiz"); }
    }

    // 1 to 4 pick an answer, Enter goes on (only while a question is on screen)
    document.addEventListener("keydown", function (event) {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        if (screen !== "question" || !attempt || !built) return;
        if (A.dom.isTyping(event.target) || A.overlays.hasModal() || A.overlays.contains(event.target)) return;
        const focusInside = ui.root.contains(document.activeElement);
        if (!focusInside && !onScreen()) return;
        if (/^[1-4]$/.test(event.key)) {
            const position = Number(event.key) - 1;
            if (position < attempt.questions[attempt.index].options.length) {
                event.preventDefault();
                const button = ui.main.querySelectorAll(".ch-option")[position];
                if (button) A.dom.replay(button, "is-pressed");
                pick(position);
            }
            return;
        }
        if (event.key === "Enter") {
            const control = event.target.closest ? event.target.closest("a, button, summary, [role='button']") : null;
            if (control && !control.classList.contains("ch-option")) return;
            event.preventDefault();
            next();
        }
    });

    A.on("account", function (detail) {
        if (!built) return;
        if (detail.type === "signin") {
            attempt = loadAttempt();
            stats = { data: null, at: 0, loading: false, failed: false };
            loadStats(true);
            board.at = {};
            if (screen === "lobby") render();
            loadBoard(board.period, true);
        } else if (detail.type === "signout") {
            stopClock();
            attempt = null;
            result = null;
            stats = { data: null, at: 0, loading: false, failed: false };
            board.at = {};
            screen = "lobby";
            render();
            loadBoard(board.period, true);
        } else if (detail.type === "nickname") {
            board.at = {};
            loadBoard(board.period, true);
        }
    });

    A.onLanguageChange(function () {
        if (built) render();
    });

    // Leaving the page while playing keeps the attempt: it is already saved after every answer
    A.whenNeeded(mount, build);

    /* ---------- 10. The Ctrl+K commands and the public API ---------- */
    A.registerCommand({
        id: "challenge-play",
        group: "cmd.groupNavigate",
        icon: "🥇",
        title: function () { return t("challenge.cmd.play"); },
        keywords: "challenge leaderboard competition ranking score time play знания проверка таблица лидеров рейтинг соревнование",
        run: function () {
            A.navigate("challenge");
            build();
            if (signedIn() && screen === "lobby" && !attempt) start();
        }
    });

    A.feature("challenge", {
        open: function () { A.navigate("challenge"); build(); },
        start: function () { build(); return start(); },
        // The leaderboard: a Promise of { period, players, rows, me, rules, updated_at }
        board: function (period) { build(); return loadBoard(period === "week" ? "week" : "all"); },
        get screen() { return screen; },
        get inProgress() { return Boolean(attempt); }
    });
})();
