/* =========================================================
   AI COMPASS — MY COMPASS (XP, levels, badges and the streak)
   "My Compass" shows learners how far they have come. Every feature reports
   what the learner does (A.track: the "Progress events" in README.md), and
   this file turns those reports into:
     - XP (experience points), each reward with a key, so nothing pays twice;
     - 10 levels;
     - badges;
     - a gentle streak: the days in a row with some XP.
   It keeps them in this browser only, shows the level on the menu bar button,
   and celebrates a new level or a new badge with a toast. This file is small
   and runs at start-up; the window with the dashboard (js/journey-panel.js)
   is loaded the first time somebody opens it.

   Sections of this file:
    1. Settings
    2. Small helpers: days, checks, icons, what the site has
    3. The saved progress: a fresh one, checking one, loading, saving, tidying
    4. Levels
    5. XP rules: what each progress event pays
    6. Badges: when each one is earned
    7. Awarding: XP, the streak, badges and the celebration
    8. The first run: what the learner did before My Compass
    9. The menu bar button
   10. The window (js/journey-panel.js, loaded on demand)
   11. Export and import
   12. Listening, the Ctrl+K command, the #journey link and the public API

   The saved progress (A.storage key "journey"):
     { v: 1,                                   the version of this format
       xp: 1240,                               all the XP so far
       awarded: { "lesson:3": 1, ... },        what has paid already (section 5)
       days: { "2026-01-15": 120, ... },       the XP of each day, the last 42 days
       badges: { "first-lesson": "2026-01-15", ... },   the day each badge was earned
       best: { streak: 9, "quiz.classic": 10, "quiz.classic.total": 12 },
       streak: { days: 3, last: "2026-01-15" },        the streak now, and its last day
       active: 12,                             how many days had some XP, ever
       facts: { language: 1, palette: 4, ... } }       things that earn badges but no XP
   A day is written "2026-01-15" (local time). It starts at 4 a.m., so time
   after midnight still counts as the day before.

   Other features use AICompass.journey (section 12):
     xp()           -> 1240
     level()        -> 6
     badges()       -> [{ id, title, date }]   (the badges earned, in the order of the grid)
     streak()       -> { days, best, today }   (today: the XP of today)
     open()         -> a Promise; opens the window
     export()       -> the progress, as an object (what "Save to a file" saves)
     import(data)   -> { ok: true } or { ok: false, error }   (data: that object, or its text)
   After a level-up or a new badge it sends the event "journey" (A.on("journey", ...)),
   so Compass Bot can congratulate:
     { type: "level", level: 3, name: "Pathfinder" }
     { type: "badge", id: "first-lesson", name: "First steps" }
   Progress events sent by My Compass itself: journey.open {},
   journey.export { how: "file" | "text" }.
   Every text (English and Russian), the XP table, the levels and the badges
   are in js/content/journey.js
   ========================================================= */
(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="journey"]');
    const data = A && A.content.get("journey");
    if (!A || !mount || !data) return;

    const t = A.t;

    /* ---------- 1. Settings ---------- */
    const STORE_KEY = "journey";                 // A.storage key of the progress
    const VERSION = 1;                           // the version of the saved progress
    const EXPORT_MARK = "ai-compass-journey";    // a progress file says { app: EXPORT_MARK, ... }
    const SAVE_DELAY = 400;                      // ms: rewards that come together are saved once
    const CELEBRATE_DELAY = 350;                 // ms: rewards that come together share one toast
    const DAY_STARTS_AT = 4;                     // a new day starts at 4 a.m. (a late night is the day before)
    const DAYS_KEPT = 42;                        // the XP of each day is kept for 6 weeks (the activity calendar)
    const SPEED_SECONDS = 10;                    // the "Lightning round" badge: a timed quiz with under
    const SPEED_SHARE = 0.8;                     // 10 seconds a question on average, and 80% right or more
    const CONFETTI_PIECES = 60;                  // the small confetti burst of a new level
    const PANEL_SCRIPT = "js/journey-panel.js";  // the window, loaded the first time it opens
    // The biggest numbers that make sense, for checking saved and loaded progress
    const MAX_XP = 1000000;
    const MAX_COUNT = 100000;
    const MAX_ENTRIES = 5000;                    // entries in one list ("awarded", "days"...)
    const MAX_TEXT = 200000;                     // characters in a progress file or text

    const RULES = data.rules;
    const LEVELS = data.levels;
    const BADGES = data.badges;
    const BADGE_BY_ID = Object.create(null);
    BADGES.forEach(function (badge) { BADGE_BY_ID[badge.id] = badge; });

    /* ---------- 2. Small helpers: days, checks, icons, what the site has ---------- */
    function pad(number) {
        return (number < 10 ? "0" : "") + number;
    }

    // The day of a moment, written "2026-01-15" (local time; the day starts at 4 a.m.)
    function dayKey(time) {
        const date = new Date(time - DAY_STARTS_AT * 3600000);
        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    }

    function today() {
        return dayKey(Date.now());
    }

    // A day as a number, to count the days between two days: "2026-01-15" -> 20468
    function dayNumber(day) {
        const parts = day.split("-");
        return Math.round(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) / 86400000);
    }

    // And back: 20468 -> "2026-01-15"
    function dayFromNumber(number) {
        const date = new Date(number * 86400000);
        return date.getUTCFullYear() + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
    }

    function isDay(value) {
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && dayFromNumber(dayNumber(value)) === value;
    }

    // A whole number from 0 to max
    function isCount(value, max) {
        return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= (max || MAX_COUNT);
    }

    // A short name made of letters, digits, "-" and "_" (a term id, an experiment, a mode)
    function isId(value) {
        return typeof value === "string" && /^[a-z0-9][a-z0-9_-]{0,39}$/i.test(value);
    }

    function isObject(value) {
        return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    // Is this key in this list of saved things? (Never a built-in name like "constructor")
    function has(list, key) {
        return Object.prototype.hasOwnProperty.call(list, key);
    }

    // A line icon from the content file, in an <svg>
    function icon(name, className) {
        return '<svg class="jr-icon' + (className ? " " + className : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            (data.icons[name] || data.icons.spark) + "</svg>";
    }

    function levelName(level) {
        return t("journey.level." + level);
    }

    function badgeTitle(id) {
        return t("journey.badge." + id);
    }

    // What the site has, always from the features themselves (never counted here)
    const site = {
        // the lesson numbers, as texts: ["1", "2", ...]
        lessons: function () {
            const count = A.lessons ? A.lessons.count : 0;
            const list = [];
            for (let n = 1; n <= count; n++) list.push(String(n));
            return list;
        },
        terms: function () {
            return A.glossary && Array.isArray(A.glossary.ids) ? A.glossary.ids : [];
        },
        // TODO(timeline): an A.timeline API with the eras would be cleaner than its content data
        eras: function () {
            const timeline = A.content.get("timeline");
            return timeline && Array.isArray(timeline.eras) ? timeline.eras : [];
        },
        // The ids of the lab experiments once the lab lists them (A.lab.list, from the lab hub).
        // Before that only their number is known (labTotal), and this is null.
        lab: function () {
            if (!A.lab || typeof A.lab.list !== "function") return null;
            return A.util.attempt(function () {
                return A.lab.list().map(function (item) { return item.id; }).filter(isId);
            }, null);
        },
        labTotal: function () {
            const ids = site.lab();
            return ids ? ids.length : Number(A.textValue("labExperimentCount")) || 0;
        }
    };

    function isLesson(n) {
        return Number.isInteger(n) && n >= 1 && n <= (A.lessons ? A.lessons.count : MAX_COUNT);
    }

    function isTerm(id) {
        const terms = site.terms();
        return isId(id) && (!terms.length || terms.indexOf(id) !== -1);
    }

    function isEra(era) {
        const eras = site.eras();
        return isId(era) && (!eras.length || eras.indexOf(era) !== -1);
    }

    /* ---------- 3. The saved progress: a fresh one, checking one, loading, saving, tidying ---------- */
    let state = null;
    let canSave = true;          // false when the browser refuses to save (the window then says so)
    let saveTimer = 0;
    let savedText = "";          // what this tab saved or read last (to notice other tabs)
    let unsaved = [];            // the progress events since the last save (another tab may save over them)
    let tidiedFor = "";          // the day the old days were last cleared away

    function freshState() {
        return {
            v: VERSION,
            xp: 0,
            awarded: {},
            days: {},
            badges: {},
            best: { streak: 0 },
            streak: { days: 0, last: "" },
            active: 0,
            facts: {}
        };
    }

    // Checks progress that was saved or loaded from a file, every field and range,
    // and makes a clean copy of it. Returns { state } or { error }:
    //   "notProgress"  it isn't My Compass progress at all
    //   "newer"        it comes from a newer version of this format
    //   "damaged"      something in it is missing or wrong
    // Badges that this version doesn't know (from a newer site) are left out.
    function checkState(value) {
        if (!isObject(value) || !has(value, "v")) return { error: "notProgress" };
        if (typeof value.v === "number" && value.v > VERSION) return { error: "newer" };
        if (value.v !== VERSION) return { error: "damaged" };

        const clean = freshState();
        clean.best = {};
        const ok =
            isCount(value.xp, MAX_XP) &&
            copyEntries(value.awarded, clean.awarded, isAwardKey, isPositive) &&
            copyEntries(value.days, clean.days, isDay, function (xp) { return isCount(xp, MAX_XP); }) &&
            copyEntries(value.badges, clean.badges, isId, isDay) &&
            copyEntries(value.best, clean.best, isBestKey, function (number) { return isCount(number); }) &&
            copyEntries(value.facts, clean.facts, isId, isPositive) &&
            isObject(value.streak) && isCount(value.streak.days) &&
            (value.streak.last === "" || isDay(value.streak.last)) &&
            isCount(value.active);
        if (!ok) return { error: "damaged" };

        clean.xp = value.xp;
        clean.streak = { days: value.streak.days, last: value.streak.last };
        clean.active = value.active;
        if (!has(clean.best, "streak") || clean.best.streak < clean.streak.days) clean.best.streak = clean.streak.days;
        Object.keys(clean.badges).forEach(function (id) {
            if (!BADGE_BY_ID[id]) delete clean.badges[id];
        });
        return { state: clean };
    }

    // Copies the entries of a list after checking each name and value (false: one was wrong)
    function copyEntries(from, to, checkName, checkValue) {
        if (!isObject(from)) return false;
        const names = Object.keys(from);
        if (names.length > MAX_ENTRIES) return false;
        return names.every(function (name) {
            if (!checkName(name) || !checkValue(from[name])) return false;
            to[name] = from[name];
            return true;
        });
    }

    function isPositive(number) {
        return isCount(number) && number > 0;
    }

    // "lesson:3", "term:neural-network", "bot@2026-01-15"... (section 5)
    function isAwardKey(key) {
        return /^[a-z0-9][a-z0-9:._@-]{0,79}$/i.test(key);
    }

    // "streak", "quiz.classic", "quiz.classic.total"
    function isBestKey(key) {
        return /^[a-z0-9][a-z0-9._-]{0,59}$/i.test(key);
    }

    // At start-up: the saved progress, or (the first time, or when it is damaged)
    // a new one built from what the learner did before (section 8)
    function load() {
        const saved = A.storage.get(STORE_KEY, null);
        const checked = saved === null ? null : checkState(saved);
        if (checked && checked.state) {
            state = checked.state;
            savedText = JSON.stringify(saved);
            if (tidy(today())) saveSoon();
        } else {
            state = firstRun();
            saveNow();
        }
    }

    function saveSoon() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveNow, SAVE_DELAY);
    }

    function saveNow() {
        clearTimeout(saveTimer);
        saveTimer = 0;
        canSave = A.storage.set(STORE_KEY, state);
        savedText = JSON.stringify(state);
        unsaved = [];
    }

    // Clears away what is no longer needed: the XP of days more than 6 weeks ago,
    // and the daily limits of other days ("bot@2026-01-14"). True if something went.
    function tidy(day) {
        if (day === tidiedFor) return false;
        tidiedFor = day;
        const now = dayNumber(day);
        let changed = false;
        Object.keys(state.days).forEach(function (key) {
            if (now - dayNumber(key) < DAYS_KEPT) return;
            delete state.days[key];
            changed = true;
        });
        Object.keys(state.awarded).forEach(function (key) {
            const at = key.indexOf("@");
            if (at === -1 || key.slice(at + 1) === day) return;
            delete state.awarded[key];
            changed = true;
        });
        return changed;
    }

    /* ---------- 4. Levels ---------- */
    // The level of an amount of XP: the highest level whose XP it has
    function levelOf(xp) {
        let level = 1;
        for (let i = 1; i < LEVELS.length; i++) {
            if (xp >= LEVELS[i]) level = i + 1;
        }
        return level;
    }

    // Everything the window and the button show about a level
    function levelInfo(xp) {
        const level = levelOf(xp);
        const top = level === LEVELS.length;
        const from = LEVELS[level - 1];
        const to = top ? from : LEVELS[level];
        return {
            level: level,
            max: LEVELS.length,
            name: levelName(level),
            top: top,
            xp: xp,
            toNext: top ? 0 : to - xp,
            nextName: top ? "" : levelName(level + 1),
            progress: top ? 1 : (xp - from) / (to - from)       // 0..1 of the way to the next level
        };
    }

    // The streak now: it is still alive if its last day is today or yesterday
    function currentStreak() {
        const last = state.streak.last;
        if (!last) return 0;
        return dayNumber(today()) - dayNumber(last) <= 1 ? state.streak.days : 0;
    }

    /* ---------- 5. XP rules: what each progress event pays ---------- */
    // The XP table is in js/content/journey.js ("rules"). Each reward has a key in
    // state.awarded, so the same thing never pays twice:
    //   "lesson:3"  "check:3"  "certificate:all"  "lab:classifier"  "challenge:maze:2"
    //   "term:bias"  "era:deep"                   once, ever
    //   "quiz.classic@2026-01-15"  "daily@2026-01-15"           once on that day
    //   "bot@2026-01-15": 4   "palette@2026-01-15": 7           how many paid that day
    // Each function gets the event's detail and its day.
    const EVENTS = {
        "lesson.complete": function (detail, day) {
            if (isLesson(detail.n)) payOnce("lesson:" + detail.n, RULES.lesson, day);
        },
        "lesson.check": function (detail, day) {
            if (detail.correct === true && isLesson(detail.n)) payOnce("check:" + detail.n, RULES.check, day);
        },
        "certificate.make": function (detail, day) {
            payOnce("certificate:" + (isId(detail.track) ? detail.track : "all"), RULES.certificate, day);
        },
        "quiz.finish": quizFinished,
        "daily.complete": function (detail, day) {
            payOnce("daily@" + day, RULES.daily, day);
        },
        "lab.use": function (detail, day) {
            if (isId(detail.exp)) payOnce("lab:" + detail.exp, RULES.lab, day);
        },
        "lab.challenge": function (detail, day) {
            if (isId(detail.exp) && isCount(detail.n)) payOnce("challenge:" + detail.exp + ":" + detail.n, RULES.challenge, day);
        },
        "lab.milestone": function () {
            addFact("trainer");
        },
        "glossary.explore": function (detail, day) {
            if (isTerm(detail.id)) payOnce("term:" + detail.id, RULES.term, day);
        },
        "timeline.era": function (detail, day) {
            if (isEra(detail.era)) payOnce("era:" + detail.era, RULES.era, day);
        },
        "bot.ask": function (detail, day) {
            addFact("bot");
            payDaily("bot", RULES.bot, day);
        },
        "palette.run": function (detail, day) {
            addFact("palette", true);
            payDaily("palette", RULES.palette, day);
        },
        "language.change": function () {
            addFact("language");
        },
        "theme.change": function () {
            addFact("theme");
        },
        "settings.change": function (detail) {
            if (detail.name === "calm" && detail.value === true) addFact("calm");
        },
        "journey.open": function () {
            addFact("open");
        },
        "journey.export": function () {
            addFact("backup");
        }
    };

    // A quiz finished: 20 XP once a day in each mode, plus 5 XP for every right answer
    // above the best in that mode (in the first game of a mode, every right answer counts)
    function quizFinished(detail, day) {
        const total = detail.total;
        const score = detail.score;
        if (!isCount(total) || total < 1 || !isCount(score) || score > total) return;
        const mode = isId(detail.mode) ? detail.mode : (detail.timed ? "timed" : "classic");
        const bestKey = "quiz." + mode;

        payOnce(bestKey + "@" + day, RULES.quiz, day);
        const best = has(state.best, bestKey) ? state.best[bestKey] : -1;
        if (score > Math.max(best, 0)) pay(RULES.quizBetter.xp * (score - Math.max(best, 0)), day);
        if (score > best) {
            state.best[bestKey] = score;
            state.best[bestKey + ".total"] = total;
            changed = true;
        }

        if (score === total) addFact("perfect");
        const timed = mode === "timed" || detail.timed === true;
        if (timed && isCount(detail.seconds) && detail.seconds <= total * SPEED_SECONDS && score >= total * SPEED_SHARE) {
            addFact("speed");
        }
    }

    function payOnce(key, rule, day) {
        if (has(state.awarded, key)) return;
        state.awarded[key] = 1;
        pay(rule.xp, day);
    }

    // A small reward that pays at most rule.perDay times a day
    function payDaily(name, rule, day) {
        const key = name + "@" + day;
        const paid = has(state.awarded, key) ? state.awarded[key] : 0;
        if (paid >= rule.perDay) return;
        state.awarded[key] = paid + 1;
        pay(rule.xp, day);
    }

    // Something done that earns badges but no XP. counting: keep a count (the palette badge)
    function addFact(name, counting) {
        const count = has(state.facts, name) ? state.facts[name] : 0;
        if (count && (!counting || count >= MAX_COUNT)) return;
        state.facts[name] = count + 1;
        changed = true;
    }

    function factCount(name) {
        return has(state.facts, name) ? state.facts[name] : 0;
    }

    /* ---------- 6. Badges: when each one is earned ---------- */
    // The badges themselves (their order, goals, texts and icons) are in the content
    // file. Here is the test of each one: a small function that looks at the progress.
    // goal: the badge's number from the content file (3 challenges, 7 days...).
    const EARNED_WHEN = {
        "first-lesson": function firstLesson() { return countAwards("lesson:") > 0; },
        "all-lessons": function allLessons() { return everyOne("lesson:", site.lessons()); },
        "certificate": function certificate() { return countAwards("certificate:") > 0; },
        "perfect-quiz": function perfectQuiz() { return factCount("perfect") > 0; },
        "speedrunner": function speedrunner() { return factCount("speed") > 0; },
        "lab-all": function labAll() {
            const ids = site.lab();
            if (ids) return everyOne("lab:", ids);
            const total = site.labTotal();
            return total > 0 && countAwards("lab:") >= total;
        },
        "trainer": function trainer() { return factCount("trainer") > 0; },
        "challenges": function challenges(goal) { return countAwards("challenge:") >= goal; },
        "terms-10": function wordCollector(goal) { return countAwards("term:") >= goal; },
        "terms-all": function termsAll() { return everyOne("term:", site.terms()); },
        "eras-all": function erasAll() { return everyOne("era:", site.eras()); },
        "all-rounder": function allRounder() {
            return (countAwards("lesson:") + countAwards("check:") > 0) &&
                (countAwards("lab:") + countAwards("challenge:") > 0) &&
                Object.keys(state.best).some(function (key) { return key.indexOf("quiz.") === 0; }) &&
                countAwards("term:") > 0 &&
                countAwards("era:") > 0;
        },
        "days-3": activeDays,
        "days-7": activeDays,
        "days-30": activeDays,
        "welcome-back": function welcomeBack() { return factCount("back") > 0; },
        "bot-chat": function botChat() { return factCount("bot") > 0; },
        "palette": function shortcutPro(goal) { return factCount("palette") >= goal; },
        "polyglot": function polyglot() { return factCount("language") > 0; },
        "day-and-night": function dayAndNight() { return factCount("theme") > 0; },
        "zen": function calmMind() { return factCount("calm") > 0; },
        "navigator": function foundMyCompass() { return factCount("open") > 0; },
        "backup": function safeKeeper() { return factCount("backup") > 0; }
    };

    function activeDays(goal) {
        return state.active >= goal;
    }

    // How many rewards start with this ("term:"). With a list of ids, only those count
    // (a term that left the glossary no longer counts).
    function countAwards(prefix, ids) {
        let count = 0;
        Object.keys(state.awarded).forEach(function (key) {
            if (key.indexOf(prefix) !== 0) return;
            if (ids && ids.indexOf(key.slice(prefix.length)) === -1) return;
            count++;
        });
        return count;
    }

    // Has every one of these paid? ("lesson:" and the lesson numbers)
    function everyOne(prefix, ids) {
        return ids.length > 0 && countAwards(prefix, ids) === ids.length;
    }

    // The badges earned now (not before): each gets today's date
    function checkBadges(day) {
        const earned = [];
        BADGES.forEach(function (badge) {
            if (has(state.badges, badge.id) || !EARNED_WHEN[badge.id]) return;
            if (A.util.attempt(function () { return EARNED_WHEN[badge.id](badge.goal); }, false)) {
                state.badges[badge.id] = day;
                earned.push(badge.id);
            }
        });
        return earned;
    }

    /* ---------- 7. Awarding: XP, the streak, badges and the celebration ---------- */
    let changed = false;          // did the event being handled change the progress?
    let celebration = null;       // the toast waiting to be shown: { level, badges }

    // XP for a day: the total, the day's XP, and the streak
    function pay(xp, day) {
        if (!(xp > 0)) return;
        state.xp = Math.min(MAX_XP, state.xp + xp);
        state.days[day] = Math.min(MAX_XP, (has(state.days, day) ? state.days[day] : 0) + xp);
        countDay(day);
        changed = true;
    }

    // The first XP of a new day: one more active day, and the streak goes on (the
    // day after its last day) or starts again. A break of a week or more earns
    // "Welcome back". A clock that was set back counts nothing.
    function countDay(day) {
        const last = state.streak.last;
        if (day === last) return;
        const gap = last ? dayNumber(day) - dayNumber(last) : 0;
        if (gap < 0) return;
        const breakDays = BADGE_BY_ID["welcome-back"] ? BADGE_BY_ID["welcome-back"].goal : 0;
        if (last && breakDays && gap >= breakDays) addFact("back");
        state.active = Math.min(MAX_COUNT, state.active + 1);
        state.streak = { days: Math.min(MAX_COUNT, gap === 1 ? state.streak.days + 1 : 1), last: day };
        state.best.streak = Math.max(state.best.streak || 0, state.streak.days);
    }

    // One progress event. quiet: an event replayed after another tab saved
    // (it was celebrated already)
    function handle(activity, quiet) {
        if (!has(EVENTS, activity.type)) return;
        const day = dayKey(Number(activity.time) || Date.now());
        const tidied = tidy(day);
        const xpBefore = state.xp;
        const levelBefore = levelOf(xpBefore);
        changed = false;
        A.util.attempt(function () {
            EVENTS[activity.type](isObject(activity.detail) ? activity.detail : {}, day);
        });
        if (!changed && !tidied) return;

        const badges = changed ? checkBadges(day) : [];
        const level = levelOf(state.xp);
        if (!quiet) unsaved.push(activity);
        saveSoon();
        paintButton(state.xp > xpBefore);
        refreshPanel();
        if (!quiet) celebrate(level > levelBefore ? level : 0, badges);
    }

    // The "journey" events go out at once; the toast waits a moment, so that
    // rewards that come together (a lesson, its badge, a new level) share one toast
    function celebrate(level, badges) {
        if (level) A.emit("journey", { type: "level", level: level, name: levelName(level) });
        badges.forEach(function (id) {
            A.emit("journey", { type: "badge", id: id, name: badgeTitle(id) });
        });
        if (!level && !badges.length) return;
        if (!celebration) {
            celebration = { level: 0, badges: [] };
            setTimeout(showCelebration, CELEBRATE_DELAY);
        }
        celebration.level = Math.max(celebration.level, level);
        celebration.badges = celebration.badges.concat(badges);
    }

    function showCelebration() {
        const news = celebration;
        celebration = null;
        if (!news) return;
        const parts = [];
        if (news.level) parts.push(t("journey.toast.level", { level: news.level, name: levelName(news.level) }));
        if (news.badges.length === 1) parts.push(t("journey.toast.badge", { name: badgeTitle(news.badges[0]) }));
        if (news.badges.length > 1) {
            parts.push(A.plural("journey.toast.badges", news.badges.length, { names: news.badges.map(badgeTitle).join(", ") }));
        }
        toast(parts.join(" "), news.badges.length ? news.badges[0] : "level");
        // A small burst of confetti for a new level (never in calm mode)
        if (news.level && A.motion.ok() && A.effects && typeof A.effects.confetti === "function") {
            const origin = button && button.getClientRects().length ? button : null;
            A.effects.confetti({ origin: origin, count: CONFETTI_PIECES });
        }
    }

    // TODO(core): A.toast(text, icon) puts the icon in as text (an emoji). The toast of
    // a badge shows the badge's line icon instead, so the newest toast's icon is
    // replaced here. A.toast(text, { svg }) in core would make this helper unneeded.
    function toast(text, iconName) {
        A.toast(text, "🏅");
        const stack = document.getElementById("toast-stack");
        const holder = stack && stack.lastElementChild && stack.lastElementChild.querySelector(".toast-icon");
        if (!holder) return;
        holder.innerHTML = icon(iconName, "jr-toast-icon");
        holder.classList.add("jr-toast-badge");
    }

    /* ---------- 8. The first run: what the learner did before My Compass ---------- */
    // The lessons already finished pay their XP (on no day: they were done before,
    // so the activity calendar and the streak stay honest). The badges this earns
    // come quietly. TODO(quiz, glossary, lab): A.quiz.stats().best, A.glossary.explored()
    // and A.lab.tried() would let the quiz bests, the explored terms and the tried
    // experiments count here too (see the report); they are used when they exist.
    function firstRun() {
        state = freshState();
        A.util.attempt(function () {
            A.lessons.completed().forEach(function (n) {
                if (isLesson(n)) giveBefore("lesson:" + n, RULES.lesson.xp);
            });
        });
        A.util.attempt(function () {
            if (typeof A.glossary.explored !== "function") return;
            A.glossary.explored().forEach(function (id) {
                if (isTerm(id)) giveBefore("term:" + id, RULES.term.xp);
            });
        });
        A.util.attempt(function () {
            if (typeof A.lab.tried !== "function") return;
            A.lab.tried().forEach(function (id) {
                if (isId(id)) giveBefore("lab:" + id, RULES.lab.xp);
            });
        });
        A.util.attempt(function () {
            const stats = typeof A.quiz.stats === "function" ? A.quiz.stats() : null;
            if (!stats || !isObject(stats.best)) return;
            Object.keys(stats.best).forEach(function (mode) {
                const best = stats.best[mode];
                const score = isObject(best) ? best.score : best;
                const total = isObject(best) ? best.total : null;
                if (!isId(mode) || !isCount(score)) return;
                state.best["quiz." + mode] = score;
                if (isCount(total) && total >= score) state.best["quiz." + mode + ".total"] = total;
                state.xp = Math.min(MAX_XP, state.xp + RULES.quiz.xp + RULES.quizBetter.xp * score);
            });
        });
        checkBadges(today());
        return state;
    }

    function giveBefore(key, xp) {
        if (has(state.awarded, key)) return;
        state.awarded[key] = 1;
        state.xp = Math.min(MAX_XP, state.xp + xp);
    }

    /* ---------- 9. The menu bar button ---------- */
    // A tiny ring (the way to the next level) around the level number.
    // Its label names the level ("My Compass, level 3"), so this file writes it,
    // not core's translation of the page (data-i18n-attr is taken off).
    const button = document.getElementById("journey-toggle");
    const nav = {};

    function setUpButton() {
        if (!button) return;
        button.removeAttribute("data-i18n-attr");
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-expanded", "false");
        button.classList.add("jr-nav");
        button.innerHTML =
            '<span class="jr-nav-ring" aria-hidden="true">' +
                '<svg viewBox="0 0 32 32" focusable="false">' +
                    '<circle class="jr-nav-track" cx="16" cy="16" r="13" pathLength="100"></circle>' +
                    '<circle class="jr-nav-bar" cx="16" cy="16" r="13" pathLength="100"></circle>' +
                "</svg>" +
                '<span class="jr-nav-level"></span>' +
            "</span>";
        nav.bar = button.querySelector(".jr-nav-bar");
        nav.level = button.querySelector(".jr-nav-level");
        paintButton(false);
        button.hidden = false;
        button.addEventListener("click", function () { open(button); });
    }

    // gained: XP just came in, so the ring glows once
    function paintButton(gained) {
        if (!button || !nav.bar) return;
        const info = levelInfo(state.xp);
        A.dom.setText(nav.level, String(info.level));
        nav.bar.style.strokeDashoffset = String(Math.round((1 - info.progress) * 1000) / 10);
        const label = t("journey.navLabel", { level: info.level });
        A.dom.setAttr(button, "aria-label", label);
        A.dom.setAttr(button, "title", label);
        if (gained && A.motion.ok()) {
            button.classList.remove("jr-gain");
            requestAnimationFrame(function () { button.classList.add("jr-gain"); });
        }
    }

    /* ---------- 10. The window (js/journey-panel.js, loaded on demand) ---------- */
    // The dashboard is a big file that most visits never need: it is loaded the first
    // time the window opens. It publishes A.journeyPanel = { create(host) }, and gets
    // from "host" below everything it shows and does. It sends journey.open itself.
    let panel = null;            // the window, once built
    let panelLoading = null;     // the Promise of loading it

    function open(opener) {
        if (panel) {
            panel.open(opener);
            return Promise.resolve(true);
        }
        const topBefore = A.overlays.top();
        if (button) button.classList.add("jr-loading");
        if (!panelLoading) {
            panelLoading = A.loadScript(PANEL_SCRIPT)
                .then(function () { return A.whenFeature("journeyPanel"); })
                .then(function (factory) {
                    panel = factory.create(host);
                    return panel;
                });
            panelLoading.catch(function () { panelLoading = null; });   // the next try loads again
        }
        return panelLoading.then(function () {
            if (button) button.classList.remove("jr-loading");
            // Another window opened while this one was loading: it stays on top
            if (A.overlays.top() !== topBefore) return false;
            panel.open(opener);
            return true;
        }, function () {
            if (button) button.classList.remove("jr-loading");
            A.toast(t("journey.loadFailed"), "⚠️");
            return false;
        });
    }

    function refreshPanel() {
        if (panel) panel.refresh();
    }

    // What the window gets from this file
    const host = {
        data: data,
        settings: { dayStartsAt: DAY_STARTS_AT, daysKept: DAYS_KEPT, speedSeconds: SPEED_SECONDS, speedShare: SPEED_SHARE },
        button: button,
        site: site,
        get state() { return state; },
        get canSave() { return canSave; },
        today: today,
        dayNumber: dayNumber,
        dayFromNumber: dayFromNumber,
        levelInfo: levelInfo,
        currentStreak: currentStreak,
        countAwards: countAwards,
        factCount: factCount,
        badgeTitle: badgeTitle,
        icon: icon,
        exportData: exportData,
        toText: toText,
        readProgress: readProgress,
        replace: replaceState,
        reset: function () { replaceState(freshState()); },
        // The window tells when it opens and closes (the button and the #journey link follow)
        opened: function () {
            if (button) button.setAttribute("aria-expanded", "true");
            A.track("journey.open", {});
        },
        closed: function () {
            if (button) button.setAttribute("aria-expanded", "false");
            if (window.location.hash === "#journey") {
                try {
                    history.replaceState(history.state, "", window.location.pathname + window.location.search);
                } catch (error) {
                    // A page opened from a file may refuse this: the link simply stays
                }
            }
        }
    };

    /* ---------- 11. Export and import ---------- */
    // The progress as a file has it: a mark that says what it is, then the progress
    function exportData() {
        return Object.assign({ app: EXPORT_MARK }, JSON.parse(JSON.stringify(state)));
    }

    // The same as text: base64url (letters, digits, "-" and "_"), easy to paste anywhere
    function toText(value) {
        const bytes = new TextEncoder().encode(JSON.stringify(value));
        let binary = "";
        bytes.forEach(function (byte) { binary += String.fromCharCode(byte); });
        return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    // Reads the text of a progress file, the copied text, or an object.
    // Returns { state } or { error } ("empty", "tooBig", or one from checkState)
    function readProgress(input) {
        let value = input;
        if (typeof input === "string") {
            const text = input.trim();
            if (!text) return { error: "empty" };
            if (text.length > MAX_TEXT) return { error: "tooBig" };
            value = parseText(text);
        }
        if (!isObject(value) || value.app !== EXPORT_MARK) return { error: "notProgress" };
        return checkState(value);
    }

    // JSON ("{...}") or base64url text -> an object (undefined if it is neither)
    function parseText(text) {
        try {
            if (text.charAt(0) === "{") return JSON.parse(text);
            const base64 = text.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
            const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return JSON.parse(new TextDecoder().decode(bytes));
        } catch (error) {
            return undefined;
        }
    }

    // Puts checked progress in place of the current one (an import, or "Start over")
    function replaceState(newState) {
        state = newState;
        tidiedFor = "";
        tidy(today());
        saveNow();
        paintButton(false);
        refreshPanel();
    }

    function importProgress(input) {
        const result = readProgress(input);
        if (!result.state) return { ok: false, error: result.error };
        replaceState(result.state);
        return { ok: true };
    }

    /* ---------- 12. Listening, the Ctrl+K command, the #journey link and the public API ---------- */
    load();
    setUpButton();

    A.on("activity", function (activity) {
        if (activity && typeof activity.type === "string") handle(activity, false);
    });

    // Leaving the page (or hiding it on a phone): what is waiting is saved now
    function flush() {
        if (saveTimer) saveNow();
    }
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) flush();
    });

    // Another tab saved its progress: take it, then add again what happened here
    // since this tab last saved (the keys make sure nothing pays twice)
    window.addEventListener("storage", function () {
        const saved = A.storage.get(STORE_KEY, null);
        if (saved === null || JSON.stringify(saved) === savedText) return;
        const checked = checkState(saved);
        if (!checked.state) return;
        state = checked.state;
        savedText = JSON.stringify(saved);
        tidiedFor = "";
        unsaved.forEach(function (activity) { handle(activity, true); });
        paintButton(false);
        refreshPanel();
    });

    A.onLanguageChange(function () { paintButton(false); });

    A.registerCommand({
        id: "journey-open",
        group: "journey.cmdGroup",
        icon: "🧭",
        title: function () { return t("journey.cmd.open"); },
        keywords: "my compass progress dashboard xp experience points level badges achievements streak stats journey " +
            "мой компас прогресс панель опыт очки уровень значки награды достижения серия статистика путь",
        run: function () { open(button); }
    });

    // A link like index.html#journey opens the window
    function openFromLink() {
        if (window.location.hash === "#journey") open(button);
    }
    window.addEventListener("hashchange", openFromLink);
    A.ready(openFromLink);

    A.feature("journey", {
        xp: function () { return state.xp; },
        level: function () { return levelOf(state.xp); },
        badges: function () {
            return BADGES.filter(function (badge) { return has(state.badges, badge.id); }).map(function (badge) {
                return { id: badge.id, title: badgeTitle(badge.id), date: state.badges[badge.id] };
            });
        },
        streak: function () {
            const day = today();
            return { days: currentStreak(), best: state.best.streak || 0, today: has(state.days, day) ? state.days[day] : 0 };
        },
        open: function () { return open(document.activeElement); },
        export: exportData,
        import: importProgress
    });
})();
