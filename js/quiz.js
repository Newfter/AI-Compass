/* =========================================================
   AI COMPASS — THE AI CHALLENGE (QUIZ)
   A game of questions about AI, in one glass card with these screens:
   START     the modes (Classic, Timed, Daily challenge, Myth or fact,
             Lesson review, My mistakes), each with your best result
   LESSONS   Lesson review: choose a lesson
   DAILY     today's daily challenge is done: come back tomorrow
   QUESTION  progress, score, streak, timer ring, the answers, and an
             explanation after each answer
   RESULTS   score ring, rank, a new best score (with confetti) and a
             review of every answer
   Keyboard: the number keys answer (the arrows ← → in Myth or fact),
   Enter goes to the next question.
   The language can change at any moment: the quiz keeps its place
   and simply re-writes its texts in the other language.
   Sections of this file:
    1. Settings
    2. The questions, the statements and the ranks
    3. Small helpers (texts, days, a random that repeats)
    4. Saved progress (best scores, daily challenge, mistakes)
    5. Choosing the questions of a game
    6. The state of the quiz
    7. The card and its screens
    8. START screen (the modes)
    9. LESSONS screen (Lesson review)
   10. DAILY screen (done for today)
   11. QUESTION screen
   12. The countdowns (timed mode, and "next" in Myth or fact)
   13. Answering (and the boxes of "My mistakes")
   14. Starting and finishing a game
   15. RESULTS screen
   16. Confetti (a new best score, a perfect daily challenge, an empty list of mistakes)
   17. "Copy my result"
   18. Keyboard: number keys, arrows and Enter
   19. Pop-up windows, calm mode and the language
   20. Building the quiz (only when it is needed)
   21. Ctrl+K commands and the public API
   Other features use AICompass.quiz (see the last section).
   Every text (English and Russian) and the list of questions with their
   tags are in js/content/quiz.js. The texts of the questions themselves are
   in js/content/quiz-bank.js, which is loaded only when the quiz is needed.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="quiz"]');
    const data = A && A.content.get("quiz");      // the questions, statements and ranks (js/content/quiz.js)
    if (!A || !mount || !data) return;

    const t = A.t;
    // A translated piece of text inside HTML. Its data-i18n attribute lets core.js
    // re-translate it by itself when the language changes.
    const text = A.i18nHTML;

    // ---------- 1. Settings ----------
    // Points
    const BASE_POINTS = 100;        // for every correct answer
    const STREAK_MIN = 2;           // right answers in a row that make a streak: it shows, and earns a bonus
    const STREAK_STEP = 10;         // 2 in a row: +10, 3 in a row: +20, ...
    const STREAK_BONUS_MAX = 50;    // ...but never more than +50
    const STREAK_HOT = 4;           // from 4 in a row the flame burns brighter

    // Timed mode
    const TIME_LIMIT = 20;          // seconds per question
    const SPEED_BONUS_MAX = 50;     // a fast answer earns up to +50
    const WARNING_SECONDS = 10;     // the timer turns yellow with 10 seconds left...
    const DANGER_SECONDS = 5;       // ...and red with 5 (screen readers hear it then, once)
    const MAX_FRAME_MS = 100;       // a long pause between two frames counts as 100 ms at most

    // The modes: how many questions, and how many easy (1), medium (2) and hard (3) ones
    const GAME_SIZE = 12;                       // Classic and Timed
    const GAME_MIX = { 1: 4, 2: 5, 3: 3 };
    const DAILY_SIZE = 5;                       // the daily challenge
    const DAILY_MIX = { 1: 2, 2: 2, 3: 1 };
    const MYTH_SIZE = 15;                       // statements in a game of "Myth or fact"
    const MISTAKES_SIZE = 10;                   // "My mistakes": questions in one review, at most
    // "My mistakes" has 3 boxes. A wrong answer puts a question in box 1; in a review, a right
    // answer moves it up one box, and a right answer in box 3 takes it off the list.
    // A question comes back this many days after it lands in box 1, 2 or 3:
    const BOX_WAIT_DAYS = [0, 1, 3];
    const MYTH_NEXT_MS = 1800;      // Myth or fact: the next statement comes by itself after this long (not in calm mode)

    // The questions
    const CHOICE_OPTIONS = 4;       // answers of a multiple-choice question ("o1" … "o4" in the texts)
    const PRAISE_COUNT = 4;         // how many different "Correct!" messages there are
    const MYTH_KEYS = ["←", "→"];   // the keys shown on the "Myth" and "Fact" buttons
    const BANK_FILE = "js/content/quiz-bank.js";    // the texts of the questions, loaded when needed

    // Timings, in milliseconds
    const LEAVE_MS = 220;           // the old screen fades out (as long as "qz-leave" in quiz.css)...
    const RESIZE_MS = 650;          // ...then the card changes its height while the new screen slides in
    const SCORE_COUNT_MS = 700;     // the score counts up to its new value
    const PERCENT_COUNT_MS = 1400;  // the result in % counts up while the ring fills
    const QUIT_CONFIRM_MS = 4000;   // after a first press, "Quit" waits this long for the second one
    const COPIED_MS = 2200;         // the copy button says "Copied" for this long
    const CONFETTI_DELAY = 950;     // after the results appear (the ring is almost full then)
    const CONFETTI_MS = 3000;       // how long the confetti falls
    const START_DELAY = 80;         // quiz.start() waits for the command palette to close first
    const STILL_FRAMES = 3;         // a smooth scroll has ended when the page stays put for this many frames
    const MAX_WAIT_FRAMES = 120;    // ... or after this many frames at most (about 2 seconds)

    // Sizes and places
    const SCROLL_GAP = 8;           // px kept free below the menu bar and above the assistant's button
    const LAUNCHER_ROOM = 96;       // px for the assistant's button, if the CSS has no --launcher-room
    const REVEAL_LINE = 0.8;        // a new screen scrolls the card's top into view if it is above the window or below 80% of it
    const ON_SCREEN_MARGIN = "-25% 0px";   // "on screen" = the quiz reaches into the middle half of the window
    const PRELOAD_MARGIN = "50% 0px";      // the texts of the questions load when the quiz is half a window away
    const TIMER_RADIUS = 27;        // the countdown ring (an SVG circle in a 64 × 64 picture)
    const RESULT_RADIUS = 66;       // the score ring of the results (in a 160 × 160 picture)
    const TIMER_LENGTH = 2 * Math.PI * TIMER_RADIUS;     // the length of a ring is its circumference
    const RESULT_LENGTH = 2 * Math.PI * RESULT_RADIUS;

    // The modes, in the order of the start screen:
    //   icon    on its card, its Ctrl+K command and its results
    //   retry   the results offer "Try again"
    //   copy    the results offer "Copy my result"
    const MODES = {
        classic: { icon: "🎯", retry: true, copy: true },
        timed: { icon: "⏱️", retry: true, copy: true },
        daily: { icon: "📅", retry: false, copy: true },
        myth: { icon: "🔍", retry: true, copy: true },
        lesson: { icon: "📚", retry: true, copy: false },
        mistakes: { icon: "🔁", retry: false, copy: false }
    };
    const MODE_ORDER = ["classic", "timed", "daily", "myth", "lesson", "mistakes"];
    const BEST_MODES = ["classic", "timed", "myth"];     // modes with a best score of their own

    // ---------- 2. The questions, the statements and the ranks ----------
    // They live in js/content/quiz.js, next to every text (English and Russian).
    const QUESTIONS = data.questions;
    // "Myth or fact" statements are played like true-or-false questions:
    // answer 0 is "Myth", answer 1 is "Fact"
    const MYTHS = data.myths.map((item) => ({
        key: item.key,
        lesson: item.lesson,
        topic: "myth",
        difficulty: 1,
        type: "myth",
        correct: item.fact ? 1 : 0
    }));
    const RANKS = data.ranks;           // by the share of correct answers
    // Every question and statement by its key: "q7" -> its question, "m3" -> its statement
    const BY_KEY = {};
    QUESTIONS.concat(MYTHS).forEach((question) => {
        BY_KEY[question.key] = question;
    });
    // The lessons that have questions, in order: 1, 2, … 12, then "timeline" (the history)
    const LESSONS = [];
    QUESTIONS.forEach((question) => {
        if (LESSONS.indexOf(question.lesson) === -1) LESSONS.push(question.lesson);
    });
    LESSONS.sort((a, b) => lessonOrder(a) - lessonOrder(b));
    // Texts and the hero number can show it: {quizQuestionCount}, data-count-name="quizQuestionCount"
    A.setTextValue("quizQuestionCount", QUESTIONS.length);

    // ---------- 3. Small helpers ----------
    // (Plurals, number formats, shuffling, motion and screen-reader messages
    // come from the shared toolkit in core.js.)

    // Does an object have this key itself? (Saved data is checked with it, so a
    // key like "constructor" can never sneak in.)
    function own(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    function isObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    // A whole number, 0 or more
    function isCount(value) {
        return typeof value === "number" && isFinite(value) && value >= 0 && Math.floor(value) === value;
    }

    // "12 questions" / "12 вопросов"
    function questionCount(n) {
        return A.plural("quiz.questionCount", n);
    }

    // The text key of an answer: "quiz.q7.o2", "quiz.true", "quiz.myth"...
    function optionKey(question, original) {
        if (question.type === "myth") return original === 0 ? "quiz.myth" : "quiz.fact";
        if (question.type === "truefalse") return original === 0 ? "quiz.true" : "quiz.false";
        return "quiz." + question.key + ".o" + (original + 1);
    }

    // The rank for a share of right answers (the same for 5, 12 or 15 questions)
    function rankFor(correct, total) {
        const share = total > 0 ? correct / total : 0;
        let rank = RANKS[0];
        RANKS.forEach((item) => {
            if (share + 1e-9 >= item.min) rank = item;
        });
        return rank;
    }

    // Lessons 1-12 first, the history last
    function lessonOrder(lesson) {
        return lesson === "timeline" ? 99 : Number(lesson);
    }

    // A lesson as an option: 3, "3" or "timeline" -> 3 or "timeline"; anything else -> null
    function toLesson(value) {
        if (value === "timeline") return "timeline";
        const number = typeof value === "number" || /^\d+$/.test(String(value)) ? Number(value) : NaN;
        return LESSONS.indexOf(number) !== -1 ? number : null;
    }

    // Can the lesson reader open this lesson? (Lessons 7-12 may not be on the site yet.)
    function lessonExists(lesson) {
        return typeof lesson === "number" && Boolean(A.lessons) && lesson >= 1 && lesson <= A.lessons.count;
    }

    // The topic most of a lesson's questions are about
    function mainTopic(lesson) {
        const counts = {};
        let best = "";
        QUESTIONS.forEach((question) => {
            if (question.lesson !== lesson) return;
            counts[question.topic] = (counts[question.topic] || 0) + 1;
            if (!best || counts[question.topic] > counts[best]) best = question.topic;
        });
        return best;
    }

    // A lesson's title in the current language ("AI history" for the timeline).
    // While a lesson is not on the site yet, the main topic of its questions.
    function lessonTitle(lesson) {
        if (lesson === "timeline") return t("quiz.lessons.history");
        const title = A.lessons ? A.lessons.title(lesson) : "";
        return title || t("quiz.topic." + mainTopic(lesson));
    }

    // "Lesson 3" / "AI history"
    function lessonLabel(lesson) {
        return lesson === "timeline" ? t("quiz.lessons.history") : t("quiz.lessons.number", { n: lesson });
    }

    // ----- Days -----
    // A day is a local date written "2026-01-15": the daily challenge changes at midnight.
    const DAY_MS = 24 * 60 * 60 * 1000;

    function pad(number) {
        return (number < 10 ? "0" : "") + number;
    }

    function dayKey(date) {
        const day = date || new Date();
        return day.getFullYear() + "-" + pad(day.getMonth() + 1) + "-" + pad(day.getDate());
    }

    function dayDate(key) {
        const parts = key.split("-").map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    function addDays(key, days) {
        const date = dayDate(key);
        date.setDate(date.getDate() + days);
        return dayKey(date);
    }

    // Whole days from one day to another (rounded: a summer-time change makes one day 23 or 25 hours)
    function daysBetween(from, to) {
        return Math.round((dayDate(to) - dayDate(from)) / DAY_MS);
    }

    // Is this a real day like "2026-01-15"? (Not "2026-02-31", not a number.)
    function isDay(value) {
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && dayKey(dayDate(value)) === value;
    }

    // "tomorrow" / "in 3 days"
    function whenText(day) {
        const days = Math.max(1, daysBetween(dayKey(), day));
        return days === 1 ? t("quiz.when.tomorrow") : A.plural("quiz.inDays", days);
    }

    // "15 January" / "15 января"
    function dayText(day) {
        return A.format.date(dayDate(day).getTime(), { day: "numeric", month: "long" });
    }

    // ----- A random that repeats -----
    // The same text always gives the same "random" numbers, on every computer. The daily
    // challenge uses the date as its text, so everyone gets the same questions that day.
    // (A hash of the text starts the small "mulberry32" generator; numbers from 0 to 1.)
    // TODO(core): A.util.seeded(text) would let other features use it too
    function seededRandom(seedText) {
        let seed = 2166136261;
        for (let i = 0; i < seedText.length; i++) {
            seed = Math.imul(seed ^ seedText.charCodeAt(i), 16777619);
        }
        return function () {
            seed = (seed + 0x6D2B79F5) | 0;
            let x = seed;
            x = Math.imul(x ^ (x >>> 15), x | 1);
            x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
            return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        };
    }

    // A shuffled copy of a list, with a given random (A.util.shuffle always uses Math.random)
    function shuffleWith(list, random) {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            const temp = copy[i];
            copy[i] = copy[j];
            copy[j] = temp;
        }
        return copy;
    }

    // ----- The texts of the questions -----
    // They are in a file of their own, loaded the first time the quiz is needed.
    function textsLoaded() {
        return A.has("quiz." + QUESTIONS[0].key + ".text");
    }

    // Returns a Promise that is kept when the texts are there. A failed load (no network)
    // is tried again on the next call.
    function loadBank() {
        if (textsLoaded()) return Promise.resolve();
        return A.loadScript(BANK_FILE);
    }

    // Numbers that count up on screen (A.countUp in core.js): the score and the
    // result in %. A.countUp writes the end value at once when animations are off,
    // and finishes by itself when calm mode is switched on meanwhile.
    let scoreCount = null;
    let percentCount = null;

    // Is this number counting right now? (Then a redraw leaves it alone.)
    function counting(count) {
        return Boolean(count && count.running);
    }

    // Stops the numbers that are counting up, where they are (a new screen comes)
    function stopCounters() {
        if (scoreCount) scoreCount.stop();
        if (percentCount) percentCount.stop();
    }

    // ---------- 4. Saved progress (best scores, daily challenge, mistakes) ----------
    // Three keys in the browser's storage (A.storage adds "aic:" in front), each with a
    // version number "v", so that a later change can tell old data from new:
    //   "quiz.bests"     the best game of each mode and of each lesson:
    //                    { v: 1, modes: { classic, timed, myth }, lessons: { "3": …, "timeline": … } },
    //                    each game { points, correct, total, date: "2026-01-15" }
    //   "quiz.daily"     the daily challenge: { v: 1, last: the last day it was played,
    //                    correct, total, marks: "10110" (right and wrong, in order),
    //                    streak: days in a row, best: the longest streak, days: days played }
    //   "quiz.mistakes"  the questions answered wrongly and their boxes:
    //                    { v: 1, items: { q7: { box: 1, due: "2026-01-15" }, … } }
    // Everything read back is checked; anything odd is left out, so a broken value can't
    // break the quiz. If the browser can't save (private mode, storage full), the quiz still
    // works: it keeps everything in memory until the page closes, and says so on the start screen.
    // (Older versions saved "quiz.best", "quiz.bestRun", "quiz.bestTimed", "quiz.bestTimedRun"
    // and "quiz.timed": see migrateOldBests.)
    const VERSION = 1;
    const BEST_KEY = "quiz.bests";
    const DAILY_KEY = "quiz.daily";
    const MISTAKES_KEY = "quiz.mistakes";

    const saved = {
        bests: { modes: {}, lessons: {} },
        daily: noDaily(),
        mistakes: {},
        read: false,            // read from the browser at least once?
        failed: false           // a save did not work: from then on, memory is the only copy
    };

    function noDaily() {
        return { last: null, correct: 0, total: 0, marks: "", streak: 0, best: 0, days: 0 };
    }

    // Reads everything again (another tab may have played meanwhile)
    function readSaved() {
        if (saved.failed) return;       // the browser doesn't save: memory is newer
        saved.bests = readBests();
        saved.daily = readDaily();
        saved.mistakes = readMistakes();
        if (!saved.read) {
            saved.read = true;
            migrateOldBests();
        }
    }

    // One saved game: { points, correct, total, date }, or null if it doesn't look right
    function checkRun(value) {
        if (!isObject(value) || !isCount(value.points) || !isCount(value.total) || value.total < 1) return null;
        return {
            points: value.points,
            correct: isCount(value.correct) && value.correct <= value.total ? value.correct : null,
            total: value.total,
            date: isDay(value.date) ? value.date : null
        };
    }

    function readBests() {
        const value = A.storage.get(BEST_KEY, null);
        const bests = { modes: {}, lessons: {} };
        if (!isObject(value) || value.v !== VERSION) return bests;
        if (isObject(value.modes)) {
            BEST_MODES.forEach((mode) => {
                const run = own(value.modes, mode) ? checkRun(value.modes[mode]) : null;
                if (run) bests.modes[mode] = run;
            });
        }
        if (isObject(value.lessons)) {
            LESSONS.forEach((lesson) => {
                const run = own(value.lessons, String(lesson)) ? checkRun(value.lessons[String(lesson)]) : null;
                if (run) bests.lessons[String(lesson)] = run;
            });
        }
        return bests;
    }

    function readDaily() {
        const value = A.storage.get(DAILY_KEY, null);
        const daily = noDaily();
        if (!isObject(value) || value.v !== VERSION || !isDay(value.last)) return daily;
        daily.last = value.last;
        daily.total = isCount(value.total) && value.total > 0 ? value.total : DAILY_SIZE;
        daily.correct = isCount(value.correct) ? Math.min(value.correct, daily.total) : 0;
        daily.marks = typeof value.marks === "string" && /^[01]{1,20}$/.test(value.marks) ? value.marks : "";
        daily.streak = isCount(value.streak) && value.streak > 0 ? value.streak : 1;
        daily.best = Math.max(isCount(value.best) ? value.best : 0, daily.streak);
        daily.days = Math.max(isCount(value.days) ? value.days : 0, 1);
        return daily;
    }

    function readMistakes() {
        const value = A.storage.get(MISTAKES_KEY, null);
        const items = {};
        if (!isObject(value) || value.v !== VERSION || !isObject(value.items)) return items;
        const latest = addDays(dayKey(), BOX_WAIT_DAYS[BOX_WAIT_DAYS.length - 1]);
        Object.keys(value.items).forEach((key) => {
            const item = value.items[key];
            // Only questions of the bank (not "Myth or fact" statements), in a box from 1 to 3
            if (!own(BY_KEY, key) || BY_KEY[key].type === "myth" || !isObject(item)) return;
            if (!isCount(item.box) || item.box < 1 || item.box > BOX_WAIT_DAYS.length || !isDay(item.due)) return;
            // A date far ahead (the computer's clock was wrong) comes back to the longest wait
            items[key] = { box: item.box, due: item.due > latest ? latest : item.due };
        });
        return items;
    }

    // Saves one key. If the browser refuses, the quiz remembers that (see "failed").
    function store(key, value) {
        if (A.storage.set(key, value)) return true;
        saved.failed = true;
        return false;
    }

    function saveBests() {
        return store(BEST_KEY, { v: VERSION, modes: saved.bests.modes, lessons: saved.bests.lessons });
    }

    function saveDaily() {
        const daily = saved.daily;
        return store(DAILY_KEY, {
            v: VERSION,
            last: daily.last,
            correct: daily.correct,
            total: daily.total,
            marks: daily.marks,
            streak: daily.streak,
            best: daily.best,
            days: daily.days
        });
    }

    function saveMistakes() {
        return store(MISTAKES_KEY, { v: VERSION, items: saved.mistakes });
    }

    // The best scores of the quiz before the modes (Classic and Timed, 12 questions)
    // become the first bests of those modes. The new key is written first: the old
    // keys are removed only once it is saved, so nothing can get lost on the way.
    function migrateOldBests() {
        const old = [
            ["classic", "quiz.best", "quiz.bestRun"],
            ["timed", "quiz.bestTimed", "quiz.bestTimedRun"]
        ];
        let found = A.storage.get("quiz.timed", undefined) !== undefined;     // the old timed-mode switch
        old.forEach((keys) => {
            const points = A.storage.get(keys[1], undefined);
            if (points === undefined) return;
            found = true;
            const details = A.storage.get(keys[2], null);
            const run = checkRun({
                points: points,
                correct: isObject(details) ? details.correct : null,
                total: isObject(details) && isCount(details.total) && details.total > 0 ? details.total : GAME_SIZE,
                date: isObject(details) ? details.date : null
            });
            const best = saved.bests.modes[keys[0]];
            if (run && (!best || run.points > best.points)) saved.bests.modes[keys[0]] = run;
        });
        if (found && saveBests()) {
            ["quiz.best", "quiz.bestRun", "quiz.bestTimed", "quiz.bestTimedRun", "quiz.timed"].forEach((key) => {
                A.storage.remove(key);
            });
        }
    }

    // How many questions are in "My mistakes", how many are due today, and the next day one is due
    function mistakesInfo() {
        const today = dayKey();
        const info = { count: 0, due: 0, next: null };
        Object.keys(saved.mistakes).forEach((key) => {
            const due = saved.mistakes[key].due;
            info.count += 1;
            if (due <= today) info.due += 1;
            else if (!info.next || due < info.next) info.next = due;
        });
        return info;
    }

    // Days in a row of the daily challenge, as long as the streak is still alive
    // (played today or yesterday). A missed day doesn't say anything: it just starts again.
    function liveStreak() {
        const daily = saved.daily;
        if (!daily.last) return 0;
        const gap = daysBetween(daily.last, dayKey());
        return gap === 0 || gap === 1 ? daily.streak : 0;
    }

    // ---------- 5. Choosing the questions of a game ----------
    // The lessons go in pairs, so that 12 questions visit every part of the course:
    // lessons 1-2, 3-4, 5-6, 7-8, 9-10, 11-12, and the history.
    function groupOf(question) {
        return question.lesson === "timeline" ? "history" : String(Math.ceil(question.lesson / 2));
    }

    // Easy questions first, hard ones last; equals keep their order
    function easyFirst(questions) {
        return questions
            .map((question, index) => ({ question: question, index: index }))
            .sort((a, b) => a.question.difficulty - b.question.difficulty || a.index - b.index)
            .map((item) => item.question);
    }

    // Picks "size" questions: as many easy, medium and hard ones as "mix" asks for,
    // spread evenly over the groups of lessons, and if possible none of "avoid" (the
    // questions of the last game). random() decides between equals, so every game is
    // different (and the daily challenge, with a random that repeats, is the same for all).
    function pickBalanced(size, mix, random, avoid) {
        const need = Object.assign({}, mix);
        const perGroup = {};
        const chosen = [];
        let pool = shuffleWith(QUESTIONS, random);

        while (chosen.length < size && pool.length) {
            // The difficulty that is needed most now (on a tie, the easier one)
            let level = 0;
            Object.keys(need).forEach((key) => {
                if (need[key] > 0 && (!level || need[key] > need[level])) level = Number(key);
            });

            // The best question for it: the right difficulty above all, then a group of
            // lessons with few questions so far, then one that wasn't in the last game.
            // On a tie the first one wins, and the pool is shuffled.
            let best = null;
            let bestScore = Infinity;
            pool.forEach((question) => {
                const score =
                    (level && question.difficulty !== level ? 1000 : 0) +
                    (perGroup[groupOf(question)] || 0) * 10 +
                    (avoid.indexOf(question.key) === -1 ? 0 : 1);
                if (score < bestScore) {
                    best = question;
                    bestScore = score;
                }
            });

            chosen.push(best);
            pool = pool.filter((question) => question !== best);
            perGroup[groupOf(best)] = (perGroup[groupOf(best)] || 0) + 1;
            if (need[best.difficulty] > 0) need[best.difficulty] -= 1;
        }
        return easyFirst(chosen);
    }

    // Myth or fact: statements that weren't in the last game first, and about as many
    // myths as facts (so that one answer can't win the game)
    function pickMyths(random, avoid) {
        const ordered = shuffleWith(MYTHS, random).sort((a, b) =>
            (avoid.indexOf(a.key) === -1 ? 0 : 1) - (avoid.indexOf(b.key) === -1 ? 0 : 1));
        const size = Math.min(MYTH_SIZE, MYTHS.length);
        const most = Math.ceil(size / 2);
        const count = [0, 0];
        const chosen = [];
        ordered.forEach((myth) => {
            if (chosen.length < size && count[myth.correct] < most) {
                chosen.push(myth);
                count[myth.correct] += 1;
            }
        });
        // (Only if one kind runs out: fill up with the other one)
        ordered.forEach((myth) => {
            if (chosen.length < size && chosen.indexOf(myth) === -1) chosen.push(myth);
        });
        return chosen;
    }

    // Lesson review: every question of the lesson, from easy to hard
    function pickLesson(lesson, random) {
        return easyFirst(shuffleWith(QUESTIONS.filter((question) => question.lesson === lesson), random));
    }

    // My mistakes: the questions due today, those in the lowest box first (they need it most)
    function pickMistakes(random) {
        const today = dayKey();
        return shuffleWith(Object.keys(saved.mistakes), random)
            .filter((key) => saved.mistakes[key].due <= today)
            .sort((a, b) => saved.mistakes[a].box - saved.mistakes[b].box)
            .slice(0, MISTAKES_SIZE)
            .map((key) => BY_KEY[key]);
    }

    // ---------- 6. The state of the quiz ----------
    const state = {
        screen: "start",              // "start", "lessons", "daily", "question" or "results"
        mode: "classic",              // the mode of the current (or last) game
        lesson: null,                 // Lesson review: the lesson (1-12 or "timeline")
        timed: false,                 // does the current game have a timer?
        day: "",                      // the day the current game started
        questions: [],                // the questions of this game, in order
        optionOrders: [],             // for each question: the order of its options
        index: 0,                     // which question we are on
        answers: [],                  // what happened on each question
        points: 0,
        streak: 0,
        bestStreak: 0,
        boxes: [],                    // My mistakes: the box of each question when the game started
        moves: null,                  // My mistakes: { cleared, up, back } in this game
        dailyCounted: false,          // the daily challenge: is this game today's one try? (from its first answer)
        startedAt: 0,                 // when the current game started (Date.now())
        askedAt: 0,                   // when the current question appeared (Date.now())
        result: null,                 // filled in when the game ends
        reviewFilter: "all",          // "all" or "mistakes"
        notice: null                  // a message under the modes: a function that returns its text
    };

    // The questions of the last game of each mode, so that the next game can be different
    // (Classic and Timed share theirs)
    const lastGame = {};

    // A game that waits for the texts of the questions: { mode, settings }
    let pending = null;

    // ---------- 7. The card and its screens ----------
    // The quiz is several screens down the page, so its card is built only when
    // it is needed (see section 20). Until then these three are null.
    let card = null;            // the glass card
    let stage = null;           // the part of the card where the screens take turns
    let live = null;            // the quiz's own line for screen-reader messages

    let ui = {};                // shortcuts to the elements of the current screen
    let paintScreen = null;     // re-writes the texts of the current screen
    let busy = false;           // true while one screen fades into the next
    let swapTimer = 0;
    let resizeTimer = 0;
    let onScreen = false;       // can you see the quiz? (see section 20)

    function paint() {
        if (paintScreen) paintScreen();
    }

    // Keeps a shortcut to every element with a data-ref (ui.score, ui.notice...)
    function collectRefs(screen) {
        screen.querySelectorAll("[data-ref]").forEach((element) => {
            ui[element.getAttribute("data-ref")] = element;
        });
    }

    // Swaps the current screen for a new one: the old one fades out,
    // the card smoothly changes its height and the new one slides in.
    // options: { focus (a selector), forceFocus, reveal (scroll the card's top into view),
    //            showNotice (scroll the message into view instead), after (runs at the end) }
    function showScreen(build, options) {
        const settings = options || {};
        const oldScreen = stage.firstElementChild;
        const active = document.activeElement;
        const moveFocus = settings.focus && (settings.forceFocus || card.contains(active) || active === document.body);
        const animate = Boolean(oldScreen) && A.motion.ok() && onScreen;

        clearTimeout(swapTimer);
        clearTimeout(resizeTimer);
        busy = true;

        const swap = () => {
            // Height on screen now (maybe in the middle of an earlier change),
            // then free the height again so the new screen can be measured.
            // (Measuring makes the browser lay out the page, so only when it is needed.)
            const fromHeight = animate ? stage.getBoundingClientRect().height : 0;
            stage.classList.remove("is-resizing");
            stage.style.height = "";
            stopCounters();
            ui = {};
            paintScreen = null;
            const screen = build();
            stage.replaceChildren(screen);
            paint();

            if (animate) {
                const toHeight = stage.getBoundingClientRect().height;
                stage.style.height = fromHeight + "px";
                void stage.offsetHeight;
                stage.classList.add("is-resizing");
                stage.style.height = toHeight + "px";
                screen.classList.add("qz-enter");
                resizeTimer = setTimeout(() => {
                    stage.classList.remove("is-resizing");
                    stage.style.height = "";
                    screen.classList.remove("qz-enter");
                }, RESIZE_MS);
            }

            busy = false;

            // Bring the top of the card back into view (e.g. after "Next" on a phone).
            // A message that comes with the new screen goes first: it must be seen.
            if (settings.showNotice && ui.notice && !ui.notice.hidden) {
                revealNotice();
            } else if (settings.reveal) {
                const box = card.getBoundingClientRect();
                if (box.top < 0 || box.top > window.innerHeight * REVEAL_LINE) {
                    card.scrollIntoView({ block: "start", behavior: A.motion.ok() ? "smooth" : "auto" });
                }
            }

            if (moveFocus) {
                const target = screen.querySelector(settings.focus);
                if (target) target.focus({ preventScroll: true });
            }
            if (settings.after) settings.after();
        };

        if (animate) {
            oldScreen.classList.add("qz-leave");
            // The old screen only fades out now. It is not re-painted any more:
            // its data may be gone already (like the results after "Try again").
            paintScreen = null;
            swapTimer = setTimeout(swap, LEAVE_MS);
        } else {
            swap();
        }
    }

    // Everything that runs on a screen stops when the quiz goes to another screen
    function stopEverything() {
        stopTimer();
        stopAutoNext();
        stopConfetti();
    }

    // ---------- 8. START screen (the modes) ----------
    function buildStart() {
        // Rule 3 has two versions: keyboard shortcuts, or "tap" for touch screens.
        // CSS shows the one that fits the device. paintStart() writes the texts
        // of the rules, because some of them contain numbers.
        const rules = [
            ["🔥", "quiz.start.rule2"],
            ["⌨️", "quiz.start.rule3", "👆", "quiz.start.rule3Touch"],
            ["💡", "quiz.start.rule4"]
        ].map((rule, index) => {
            let content =
                '<span class="qz-rule-icon' + (rule[2] ? " qz-for-keys" : "") + '" aria-hidden="true">' + rule[0] + "</span>" +
                '<span class="qz-rule-text' + (rule[2] ? " qz-for-keys" : "") + '" data-key="' + rule[1] + '"></span>';
            if (rule[2]) {
                content +=
                    '<span class="qz-rule-icon qz-for-touch" aria-hidden="true">' + rule[2] + "</span>" +
                    '<span class="qz-rule-text qz-for-touch" data-key="' + rule[3] + '"></span>';
            }
            return '<li class="qz-rule" style="--i:' + index + '">' + content + "</li>";
        }).join("");

        // One card for each mode: its name, what it is, and your best result
        const modes = MODE_ORDER.map((mode, index) =>
            '<li class="qz-mode-item" style="--i:' + index + '">' +
                '<button class="qz-mode" type="button" data-mode="' + mode + '">' +
                    '<span class="qz-mode-icon" aria-hidden="true">' + MODES[mode].icon + "</span>" +
                    '<span class="qz-mode-body">' +
                        text("quiz.mode." + mode, "qz-mode-name") +
                        '<span class="qz-mode-text" data-ref="text-' + mode + '"></span>' +
                        '<span class="qz-mode-stat mono" data-ref="stat-' + mode + '"></span>' +
                    "</span>" +
                    '<span class="qz-mode-go" aria-hidden="true">→</span>' +
                "</button>" +
            "</li>"
        ).join("");

        const screen = A.dom.fromHTML(
            '<div class="qz-screen qz-start">' +
                '<div class="qz-start-head">' +
                    '<div class="qz-orb" aria-hidden="true">' +
                        '<span class="qz-orb-ring"></span>' +
                        '<span class="qz-orb-ring qz-orb-ring-2"></span>' +
                        '<span class="qz-orb-sweep"></span>' +
                        '<span class="qz-orb-core">🏆</span>' +
                        '<span class="qz-orb-orbit"><span></span></span>' +
                    "</div>" +
                    '<div class="qz-start-intro">' +
                        '<p class="qz-kicker mono">' + text("quiz.start.kicker") + "</p>" +
                        '<h3 class="qz-start-title" tabindex="-1">' + text("quiz.start.title") + "</h3>" +
                        '<p class="qz-start-text" data-ref="startText"></p>' +
                    "</div>" +
                "</div>" +

                '<ul class="qz-modes" role="list" data-i18n-attr="aria-label:quiz.start.modesLabel" aria-label="' + t("quiz.start.modesLabel") + '">' +
                    modes +
                "</ul>" +
                '<p class="qz-notice" data-ref="notice" hidden></p>' +

                '<div class="qz-rules-box">' +
                    '<p class="qz-mini-title mono">' + text("quiz.start.rulesTitle") + "</p>" +
                    '<ul class="qz-rules">' + rules + "</ul>" +
                "</div>" +
                '<p class="qz-privacy" data-ref="privacy"></p>' +
            "</div>"
        );

        collectRefs(screen);
        ui.rules = Array.prototype.slice.call(screen.querySelectorAll(".qz-rule-text"));
        ui.modeButtons = {};
        screen.querySelectorAll(".qz-mode").forEach((button) => {
            const mode = button.getAttribute("data-mode");
            ui.modeButtons[mode] = button;
            button.addEventListener("click", () => chooseMode(mode));
        });

        paintScreen = paintStart;
        return screen;
    }

    function paintStart() {
        ui.startText.textContent = t("quiz.start.text", { questions: questionCount(QUESTIONS.length) });
        MODE_ORDER.forEach((mode) => {
            ui["text-" + mode].textContent = modeText(mode);
            ui["stat-" + mode].textContent = modeStat(mode);
        });

        // "My mistakes" looks switched off while nothing is due (a press says why);
        // the daily challenge shows a tick once it is done for today
        const mistakes = ui.modeButtons.mistakes;
        if (mistakesInfo().due) mistakes.removeAttribute("aria-disabled");
        else mistakes.setAttribute("aria-disabled", "true");
        ui.modeButtons.daily.classList.toggle("is-done", saved.daily.last === dayKey());

        // The rules: our own texts with a little HTML (<strong>, <kbd>), so they go in as HTML.
        // Unchanged ones are left alone.
        const numbers = { points: A.plural("quiz.points", BASE_POINTS), last: CHOICE_OPTIONS };
        ui.rules.forEach((element) => {
            const html = t(element.getAttribute("data-key"), numbers);
            if (element.innerHTML !== html) element.innerHTML = html;
        });

        paintNotice();
        ui.privacy.textContent = t(saved.failed ? "quiz.start.noSave" : "quiz.start.privacy");
        ui.privacy.classList.toggle("is-warning", saved.failed);
    }

    // What a mode is ("12 questions from every lesson...")
    function modeText(mode) {
        return t("quiz.mode." + mode + "Text", {
            questions: questionCount(mode === "daily" ? DAILY_SIZE : GAME_SIZE),
            statements: A.plural("quiz.statementCount", Math.min(MYTH_SIZE, MYTHS.length)),
            time: A.plural("quiz.seconds", TIME_LIMIT),
            bonus: SPEED_BONUS_MAX
        });
    }

    // Your best result in a mode, or what is waiting there
    function modeStat(mode) {
        if (mode === "daily") {
            const streak = liveStreak();
            const days = A.plural("quiz.streakDays", streak);
            if (saved.daily.last === dayKey()) return t("quiz.stat.dailyDone", { days: days });
            return streak ? t("quiz.stat.dailyStreak", { days: days }) : t("quiz.stat.dailyNew");
        }
        if (mode === "lesson") {
            const reviewed = Object.keys(saved.bests.lessons).length;
            const last = LESSONS.filter((lesson) => lesson !== "timeline").pop();
            return reviewed
                ? t("quiz.stat.lessons", { n: reviewed, total: LESSONS.length })
                : t("quiz.stat.lessonsNone", { last: last });
        }
        if (mode === "mistakes") {
            const info = mistakesInfo();
            if (info.due) return A.plural("quiz.stat.mistakesDue", info.due);
            return info.count ? t("quiz.stat.mistakesNext", { when: whenText(info.next) }) : t("quiz.stat.mistakesNone");
        }
        const best = saved.bests.modes[mode];
        if (!best) return t("quiz.stat.none");
        const points = A.format.number(best.points);
        return best.correct === null
            ? t("quiz.stat.bestScore", { points: points })
            : t("quiz.stat.best", { points: points, correct: best.correct, total: best.total });
    }

    // A message under the modes ("Loading the questions…", "Nothing to review right now…").
    // "make" returns the text in the current language; null hides the message.
    function setNotice(make) {
        state.notice = make;
        paintNotice();
        if (make && live) A.announce(make(), { region: live });
    }

    function paintNotice() {
        if (!ui.notice) return;
        ui.notice.hidden = !state.notice;
        ui.notice.textContent = state.notice ? state.notice() : "";
    }

    // Scrolls the message into view if it is outside the window: on a phone it is far
    // below the first modes, and a message nobody sees doesn't help. (Not for "Loading…":
    // that one is gone again in a moment.) With animations on, a smooth scroll may still be
    // on its way (the one to the quiz after a command): then this looks once it has ended.
    function revealNotice() {
        // Like the feedback after an answer (see answer()): the window scrolls, never the
        // card (scrollIntoView would also scroll the card while its height changes), and
        // the message stays clear of the menu bar and of the assistant's round button.
        const look = () => {
            const notice = ui.notice;
            if (!notice || notice.hidden || !notice.isConnected) return;
            const topSpace = A.layout.navHeight() + SCROLL_GAP;
            const bottomSpace = A.layout.px("--launcher-room", LAUNCHER_ROOM) + SCROLL_GAP;
            // A new screen may still slide in from a little lower ("qz-enter" in quiz.css):
            // measure where it will stop ("m42" = how far it is moved down right now)
            const screen = notice.closest(".qz-screen");
            const slide = screen ? new DOMMatrixReadOnly(getComputedStyle(screen).transform).m42 : 0;
            const box = notice.getBoundingClientRect();
            const top = box.top - slide;
            const lowest = window.innerHeight - bottomSpace;
            let distance = 0;
            if (box.bottom - slide > lowest) distance = Math.min(box.bottom - slide - lowest, top - topSpace);
            else if (top < topSpace) distance = top - topSpace;
            if (distance) window.scrollBy({ top: distance, behavior: A.motion.ok() ? "smooth" : "auto" });
        };
        if (A.motion.ok()) afterScrolling(look);
        else look();
    }

    // Calls back once the page has stopped moving (the same scroll position for a few
    // frames), or after about two seconds at most.
    // TODO(core): other features could use this too (A.afterScrolling?)
    function afterScrolling(callback) {
        let lastY = window.scrollY;
        let still = 0;
        let frames = 0;
        const check = () => {
            const y = window.scrollY;
            still = y === lastY ? still + 1 : 0;
            lastY = y;
            frames += 1;
            if (still >= STILL_FRAMES || frames >= MAX_WAIT_FRAMES) callback();
            else requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
    }

    // A press on a mode card
    function chooseMode(mode) {
        if (state.screen !== "start" || busy) return;
        if (mode === "lesson") {
            pending = null;
            showLessons();
        } else {
            play(mode, {});
        }
    }

    // ---------- 9. LESSONS screen (Lesson review) ----------
    function showLessons(options) {
        const settings = options || {};
        stopEverything();
        readSaved();
        state.notice = null;
        state.screen = "lessons";
        showScreen(buildLessons, {
            focus: ".qz-lessons-title",
            forceFocus: settings.forceFocus,
            reveal: settings.reveal !== false
        });
    }

    function buildLessons() {
        const items = LESSONS.map((lesson, index) => {
            const isHistory = lesson === "timeline";
            return '<li class="qz-lesson-item" style="--i:' + index + '">' +
                '<button class="qz-lesson" type="button" data-lesson="' + lesson + '">' +
                    '<span class="qz-lesson-num mono" aria-hidden="true">' + (isHistory ? "🕰️" : lesson) + "</span>" +
                    '<span class="qz-lesson-body">' +
                        '<span class="qz-lesson-title">' +
                            (isHistory ? "" : '<span class="sr-only" data-ref="number-' + lesson + '"></span>') +
                            '<span data-ref="title-' + lesson + '"></span>' +
                        "</span>" +
                        '<span class="qz-lesson-meta mono" data-ref="meta-' + lesson + '"></span>' +
                    "</span>" +
                "</button>" +
            "</li>";
        }).join("");

        const screen = A.dom.fromHTML(
            '<div class="qz-screen qz-lessons">' +
                '<button class="qz-back" type="button"><span class="qz-back-arrow" aria-hidden="true">←</span>' + text("quiz.lessons.back") + "</button>" +
                '<div class="qz-lessons-head">' +
                    '<p class="qz-kicker mono">' + text("quiz.lessons.kicker") + "</p>" +
                    '<h3 class="qz-lessons-title" tabindex="-1">' + text("quiz.lessons.title") + "</h3>" +
                    '<p class="qz-lessons-text">' + text("quiz.lessons.text") + "</p>" +
                "</div>" +
                '<ul class="qz-lesson-list" role="list" data-i18n-attr="aria-label:quiz.lessons.listLabel" aria-label="' + t("quiz.lessons.listLabel") + '">' +
                    items +
                "</ul>" +
                '<p class="qz-notice" data-ref="notice" hidden></p>' +
            "</div>"
        );

        collectRefs(screen);
        screen.querySelector(".qz-back").addEventListener("click", () => {
            if (busy) return;
            backToStart({ focusMode: "lesson" });
        });
        screen.querySelectorAll(".qz-lesson").forEach((button) => {
            button.addEventListener("click", () => {
                if (state.screen !== "lessons" || busy) return;
                play("lesson", { lesson: toLesson(button.getAttribute("data-lesson")) });
            });
        });

        paintScreen = paintLessons;
        return screen;
    }

    function paintLessons() {
        LESSONS.forEach((lesson) => {
            const count = QUESTIONS.filter((question) => question.lesson === lesson).length;
            const best = saved.bests.lessons[String(lesson)];
            if (ui["number-" + lesson]) ui["number-" + lesson].textContent = lessonLabel(lesson) + ": ";
            ui["title-" + lesson].textContent = lessonTitle(lesson);
            ui["meta-" + lesson].textContent = best && best.correct !== null
                ? t("quiz.lessons.best", { questions: questionCount(count), correct: best.correct, total: best.total })
                : questionCount(count);
        });
        paintNotice();
    }

    // ---------- 10. DAILY screen (done for today) ----------
    function showDaily(options) {
        const settings = options || {};
        stopEverything();
        state.screen = "daily";
        showScreen(buildDaily, {
            focus: ".qz-daily-title",
            forceFocus: settings.forceFocus,
            reveal: settings.reveal !== false
        });
    }

    function buildDaily() {
        const daily = saved.daily;
        // Today's answers as small squares, like the shared result: right, wrong, ...
        const marks = daily.marks.split("").map((mark) =>
            '<span class="qz-dot ' + (mark === "1" ? "is-right" : "is-wrong") + '"></span>'
        ).join("");
        const tiles = [
            ["streak", "quiz.daily.streak", "🔥"],
            ["best", "quiz.daily.best", "🏅"],
            ["days", "quiz.daily.days", "📅"]
        ].map((tile, index) =>
            '<li class="qz-tile" style="--i:' + index + '">' +
                '<span class="qz-tile-icon" aria-hidden="true">' + tile[2] + "</span>" +
                '<strong class="qz-tile-value gradient-text" data-ref="daily-' + tile[0] + '"></strong>' +
                text(tile[1], "qz-tile-label") +
            "</li>"
        ).join("");

        const screen = A.dom.fromHTML(
            '<div class="qz-screen qz-daily">' +
                '<button class="qz-back" type="button"><span class="qz-back-arrow" aria-hidden="true">←</span>' + text("quiz.lessons.back") + "</button>" +
                '<div class="qz-daily-head">' +
                    '<span class="qz-daily-icon" aria-hidden="true">📅</span>' +
                    '<div class="qz-daily-intro">' +
                        '<p class="qz-kicker mono">' + text("quiz.daily.kicker") + "</p>" +
                        '<h3 class="qz-daily-title" tabindex="-1">' + text("quiz.daily.doneTitle") + "</h3>" +
                        '<p class="qz-daily-text" data-ref="dailyText"></p>' +
                        (marks ? '<p class="qz-dots" aria-hidden="true">' + marks + "</p>" : "") +
                    "</div>" +
                "</div>" +
                '<ul class="qz-tiles qz-daily-tiles">' + tiles + "</ul>" +
                '<p class="qz-daily-gentle">' + text("quiz.daily.gentle") + "</p>" +
            "</div>"
        );

        collectRefs(screen);
        screen.querySelector(".qz-back").addEventListener("click", () => {
            if (busy) return;
            backToStart({ focusMode: "daily" });
        });

        paintScreen = paintDaily;
        return screen;
    }

    function paintDaily() {
        const daily = saved.daily;
        ui.dailyText.textContent = t("quiz.daily.doneText", { correct: daily.correct, total: daily.total });
        ui["daily-streak"].textContent = String(liveStreak());
        ui["daily-best"].textContent = String(daily.best);
        ui["daily-days"].textContent = String(daily.days);
    }

    // ---------- 11. QUESTION screen ----------
    function currentQuestion() {
        return state.questions[state.index];
    }

    function buildQuestion() {
        const question = currentQuestion();
        const order = state.optionOrders[state.index];
        const total = state.questions.length;
        const isLast = state.index === total - 1;
        const isMyth = question.type === "myth";

        const options = order.map((original, position) =>
            '<button class="qz-option ui-option" type="button" data-position="' + position + '" style="--i:' + position + '">' +
                '<kbd class="qz-key" aria-hidden="true">' + (isMyth ? MYTH_KEYS[position] : position + 1) + "</kbd>" +
                text(optionKey(question, original), "qz-option-text") +
                '<span class="qz-mark" aria-hidden="true"></span>' +
                '<span class="sr-only qz-sr-correct" data-i18n="quiz.q.srCorrect" hidden>' + t("quiz.q.srCorrect") + "</span>" +
                '<span class="sr-only qz-sr-picked" data-i18n="quiz.q.srPicked" hidden>' + t("quiz.q.srPicked") + "</span>" +
            "</button>"
        ).join("");

        let segments = "";
        for (let i = 0; i < total; i++) segments += '<span class="qz-seg"></span>';

        const timer = state.timed
            ? '<div class="qz-timer ui-ring" role="timer">' +
                  '<svg class="ui-ring-chart" viewBox="0 0 64 64" aria-hidden="true">' +
                      '<circle class="qz-timer-track ui-ring-track" cx="32" cy="32" r="' + TIMER_RADIUS + '"></circle>' +
                      '<circle class="qz-timer-bar ui-ring-bar" cx="32" cy="32" r="' + TIMER_RADIUS + '" stroke-dasharray="' + TIMER_LENGTH.toFixed(2) + '"></circle>' +
                  "</svg>" +
                  '<span class="qz-timer-num" aria-hidden="true">' + TIME_LIMIT + "</span>" +
                  '<span class="sr-only qz-timer-sr"></span>' +
              "</div>"
            : "";

        // How hard the question is: 1 to 3 small bars (not for Myth or fact)
        const level = isMyth
            ? ""
            : '<span class="qz-level" data-level="' + question.difficulty + '" data-i18n-attr="title:quiz.level.' + question.difficulty + '" title="' + t("quiz.level." + question.difficulty) + '">' +
                  '<span class="qz-level-bar"></span><span class="qz-level-bar"></span><span class="qz-level-bar"></span>' +
                  text("quiz.level." + question.difficulty, "sr-only") +
              "</span>";

        // A tag for the modes that need one: the daily challenge, the lesson, or the box of a mistake
        let tag = "";
        if (state.mode === "daily") {
            tag = '<span class="qz-tag"><span aria-hidden="true">' + MODES.daily.icon + "</span>" + text("quiz.mode.daily") + "</span>";
        } else if (state.mode === "lesson" || state.mode === "mistakes") {
            tag = '<span class="qz-tag"><span aria-hidden="true">' + MODES[state.mode].icon + '</span><span data-ref="tag"></span></span>';
        }

        // Myth or fact shows only the verdict after an answer (the explanations come
        // at the end), and moves on by itself: the bar shows when.
        const explanation = isMyth
            ? '<p class="qz-fb-verdict">' + text(question.correct === 0 ? "quiz.fb.myth" : "quiz.fb.fact") + "</p>"
            : '<p class="qz-fb-explain">' + text("quiz." + question.key + ".explain") + "</p>";
        const nextKey = isLast ? "quiz.q.finish" : isMyth ? "quiz.q.nextMyth" : "quiz.q.next";

        const screen = A.dom.fromHTML(
            '<div class="qz-screen qz-question' + (question.type === "choice" ? "" : " is-truefalse") + (isMyth ? " is-myth" : "") + '">' +
                '<div class="qz-hud">' +
                    '<div class="qz-hud-left">' +
                        '<span class="qz-counter mono" aria-hidden="true" data-ref="counter"></span>' +
                        '<span class="qz-topic">' + text("quiz.topic." + question.topic) + "</span>" +
                        tag +
                    "</div>" +
                    '<div class="qz-hud-right">' +
                        '<div class="qz-score">' +
                            '<span class="qz-score-label mono">' + text("quiz.q.score") + "</span>" +
                            '<strong class="qz-score-value gradient-text" data-ref="score"></strong>' +
                            '<span class="qz-score-pop mono" aria-hidden="true" data-ref="scorePop"></span>' +
                        "</div>" +
                        '<div class="qz-streak" data-ref="streak" hidden>' +
                            '<span class="qz-flame" aria-hidden="true">🔥</span>' +
                            '<span class="qz-streak-text" aria-hidden="true" data-ref="streakText"></span>' +
                            '<span class="sr-only" data-ref="streakSr"></span>' +
                        "</div>" +
                        timer +
                    "</div>" +
                "</div>" +

                '<div class="qz-progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" data-i18n-attr="aria-label:quiz.q.progressLabel" aria-label="' + t("quiz.q.progressLabel") + '">' +
                    segments +
                "</div>" +

                '<div class="qz-type-row">' +
                    '<p class="qz-type mono">' + text("quiz.q.type." + question.type) + level + "</p>" +
                    '<button class="qz-quit" type="button" data-ref="quit">' +
                        '<span class="qz-quit-icon" aria-hidden="true">✕</span>' +
                        '<span data-ref="quitText"></span>' +
                    "</button>" +
                "</div>" +
                '<h3 class="qz-question-text" id="qz-question-text" tabindex="-1">' +
                    '<span class="sr-only" data-ref="counterSr"></span>' +
                    text("quiz." + question.key + ".text") +
                "</h3>" +

                '<div class="qz-options" role="group" aria-labelledby="qz-question-text">' + options + "</div>" +

                '<div class="qz-feedback" data-ref="feedback" hidden>' +
                    '<div class="qz-fb-head">' +
                        '<span class="qz-fb-icon" aria-hidden="true"></span>' +
                        '<strong class="qz-fb-title" data-ref="fbTitle"></strong>' +
                        '<span class="qz-fb-points mono" data-ref="fbPoints"></span>' +
                    "</div>" +
                    '<p class="qz-fb-answer" data-ref="fbAnswer" hidden></p>' +
                    explanation +
                    '<ul class="qz-fb-bonus" data-ref="fbBonus"></ul>' +
                    '<div class="qz-fb-actions">' +
                        '<button class="btn btn-primary qz-next" type="button">' +
                            text(nextKey) +
                            '<span class="qz-arrow" aria-hidden="true">→</span>' +
                        "</button>" +
                        '<span class="qz-hint mono">' + text("quiz.q.enterHint") + "</span>" +
                    "</div>" +
                    (isMyth ? '<span class="qz-auto" aria-hidden="true" data-ref="auto" hidden><span class="qz-auto-bar" data-ref="autoBar"></span></span>' : "") +
                "</div>" +
            "</div>"
        );

        collectRefs(screen);
        ui.options = Array.prototype.slice.call(screen.querySelectorAll(".qz-option"));
        ui.segments = Array.prototype.slice.call(screen.querySelectorAll(".qz-seg"));
        ui.progress = screen.querySelector(".qz-progress");
        ui.next = screen.querySelector(".qz-next");
        ui.timer = screen.querySelector(".qz-timer");
        if (ui.timer) {
            ui.timerBar = ui.timer.querySelector(".qz-timer-bar");
            ui.timerNum = ui.timer.querySelector(".qz-timer-num");
            ui.timerSr = ui.timer.querySelector(".qz-timer-sr");
        }

        ui.options.forEach((button) => {
            button.addEventListener("click", () => answer(Number(button.getAttribute("data-position"))));
        });
        ui.next.addEventListener("click", goNext);
        watchQuit(ui.quit);

        paintScreen = paintQuestion;
        return screen;
    }

    function paintQuestion() {
        const total = state.questions.length;
        const answered = state.answers.filter(Boolean).length;
        const record = state.answers[state.index];
        const question = currentQuestion();
        const counter = t(question.type === "myth" ? "quiz.q.counterMyth" : "quiz.q.counter", { n: state.index + 1, total: total });

        ui.counter.textContent = counter;
        ui.counterSr.textContent = counter + ". ";
        if (!counting(scoreCount)) ui.score.textContent = A.format.number(state.points);
        if (ui.tag) {
            ui.tag.textContent = state.mode === "lesson"
                ? lessonLabel(state.lesson)
                : t("quiz.q.box", { n: state.boxes[state.index], total: BOX_WAIT_DAYS.length });
        }

        // Streak counter: only shown from 2 correct answers in a row
        ui.streak.hidden = state.streak < STREAK_MIN;
        ui.streak.classList.toggle("is-hot", state.streak >= STREAK_HOT);
        ui.streakText.textContent = t("quiz.q.streak", { n: state.streak });
        ui.streakSr.textContent = A.plural("quiz.q.streakSr", state.streak);

        // Progress bar: one segment per question
        ui.progress.setAttribute("aria-valuenow", String(answered));
        ui.progress.setAttribute("aria-valuetext", t("quiz.q.progressText", { n: answered, total: total }));
        ui.segments.forEach((segment, index) => {
            const done = state.answers[index];
            segment.classList.toggle("is-correct", Boolean(done && done.correct));
            segment.classList.toggle("is-wrong", Boolean(done && !done.correct));
            segment.classList.toggle("is-current", index === state.index && !done);
        });

        if (ui.timerSr) {
            ui.timerSr.textContent = t("quiz.q.timeLeft", { time: A.plural("quiz.seconds", shownSeconds()) });
        }
        paintQuit();

        // Feedback after answering
        if (!record) return;
        ui.fbTitle.textContent = feedbackTitle(record);
        ui.fbPoints.textContent = record.points > 0 ? "+" + A.plural("quiz.points", record.points) : t("quiz.fb.noPoints");
        // True/false explanations already start with "True." or "False.",
        // and Myth or fact says "It's a myth." / "It's a fact."
        const showRight = !record.correct && question.type === "choice";
        ui.fbAnswer.hidden = !showRight;
        ui.fbAnswer.textContent = showRight ? t("quiz.fb.rightAnswer", { answer: t(optionKey(question, question.correct)) }) : "";

        const bonus = [];
        if (record.base) bonus.push(["base", t("quiz.fb.base", { n: record.base })]);
        if (record.speed) bonus.push(["speed", "⚡ " + t("quiz.fb.speed", { n: record.speed })]);
        if (record.streakBonus) bonus.push(["streak", "🔥 " + t("quiz.fb.streak", { n: record.streakBonus })]);
        if (record.lostStreak >= STREAK_MIN) bonus.push(["lost", t("quiz.fb.streakLost")]);
        if (record.box) bonus.push(["box", boxText(record.box)]);
        ui.fbBonus.replaceChildren(...bonus.map((item) => {
            const chip = document.createElement("li");
            chip.className = "qz-bonus qz-bonus-" + item[0];
            chip.textContent = item[1];
            return chip;
        }));
        ui.fbBonus.hidden = bonus.length === 0;
    }

    function feedbackTitle(record) {
        if (record.timeout) return t("quiz.fb.timeout");
        return record.correct ? t("quiz.fb.correct" + record.praise) : t("quiz.fb.wrong");
    }

    // "Quit" needs two presses, so one accidental tap doesn't end the game.
    // After the first press the button asks "Sure?" for 4 seconds (QUIT_CONFIRM_MS).
    // A.confirmPress (core.js) ignores the second click of a double-click (or of a
    // bouncy mouse) and a held-down Enter key. Every question screen has a new button.
    let quitPress = null;

    function watchQuit(button) {
        quitPress = A.confirmPress(button, {
            enabled: () => state.screen === "question" && !busy,
            onArm: () => {
                paintQuit();
                // A daily challenge that has started counts anyway (see countDailyTry)
                const hint = state.mode === "daily" && state.dailyCounted ? "quiz.q.quitHintDaily" : "quiz.q.quitHint";
                A.announce(t(hint), { region: live });
            },
            onDisarm: paintQuit,
            onConfirm: () => backToStart(),
            timeout: QUIT_CONFIRM_MS
        });
    }

    function paintQuit() {
        if (!ui.quit) return;
        const armed = Boolean(quitPress && quitPress.armed);
        ui.quit.classList.toggle("is-armed", armed);
        ui.quitText.textContent = t(armed ? "quiz.q.quitConfirm" : "quiz.q.quit");
    }

    // ---------- 12. The countdowns (timed mode, and "next" in Myth or fact) ----------
    // Both only run while you can see the quiz and no pop-up window covers it.
    const timer = {
        active: false,
        remaining: 0,      // milliseconds left
        last: 0,
        frame: 0,
        blocked: A.overlays.hasModal(),   // a pop-up window covers the page
        seconds: -1,
        warned: false
    };

    function shownSeconds() {
        return Math.max(0, Math.ceil(timer.remaining / 1000));
    }

    function startTimer() {
        stopTimer();
        timer.active = true;
        timer.remaining = TIME_LIMIT * 1000;
        timer.seconds = -1;
        timer.warned = false;
        drawTimer(true);
        resumeTimer();
    }

    function stopTimer() {
        timer.active = false;
        if (timer.frame) cancelAnimationFrame(timer.frame);
        timer.frame = 0;
    }

    function resumeTimer() {
        if (!timer.active || timer.frame || !onScreen || timer.blocked) return;
        timer.last = performance.now();
        timer.frame = requestAnimationFrame(tickTimer);
    }

    function tickTimer(now) {
        timer.frame = 0;
        if (!timer.active) return;

        // The clock only runs while you can actually see the question.
        // A long pause between two frames counts as 100 ms at most.
        const running = onScreen && !timer.blocked;
        if (running) timer.remaining -= A.util.clamp(now - timer.last, 0, MAX_FRAME_MS);
        timer.last = now;
        drawTimer(!running);

        if (timer.remaining <= 0) {
            stopTimer();
            answer(null);
            return;
        }

        // Off screen, in a hidden tab or under a pop-up window the loop stops;
        // resumeTimer() starts it again
        if (running) timer.frame = requestAnimationFrame(tickTimer);
    }

    function drawTimer(paused) {
        if (!ui.timer) return;
        const fraction = Math.max(0, timer.remaining) / (TIME_LIMIT * 1000);
        ui.timerBar.style.strokeDashoffset = (TIMER_LENGTH * (1 - fraction)).toFixed(2);
        ui.timer.classList.toggle("is-paused", Boolean(paused) && timer.active);

        const seconds = shownSeconds();
        if (seconds === timer.seconds) return;
        timer.seconds = seconds;
        ui.timerNum.textContent = String(seconds);
        ui.timerSr.textContent = t("quiz.q.timeLeft", { time: A.plural("quiz.seconds", seconds) });
        ui.timer.classList.toggle("is-warning", seconds <= WARNING_SECONDS && seconds > DANGER_SECONDS);
        ui.timer.classList.toggle("is-danger", seconds <= DANGER_SECONDS);
        // The last seconds tick, and screen readers hear once that time is running out
        if (seconds <= DANGER_SECONDS && seconds > 0 && timer.active) A.dom.replay(ui.timerNum, "is-tick");

        if (seconds === DANGER_SECONDS && !timer.warned && timer.active) {
            timer.warned = true;
            A.announce(t("quiz.q.timeLeft", { time: A.plural("quiz.seconds", DANGER_SECONDS) }), { region: live });
        }
    }

    // Myth or fact moves on to the next statement by itself, shortly after an answer
    // (a thin bar shows when). Enter or the button go on at once. In calm mode it waits
    // for you instead, so nothing moves on its own.
    const autoNext = { active: false, remaining: 0, last: 0, frame: 0 };

    function startAutoNext() {
        stopAutoNext();
        if (!ui.auto || !A.motion.ok()) return;
        autoNext.active = true;
        autoNext.remaining = MYTH_NEXT_MS;
        ui.auto.hidden = false;
        drawAutoNext();
        resumeAutoNext();
    }

    function stopAutoNext() {
        autoNext.active = false;
        if (autoNext.frame) cancelAnimationFrame(autoNext.frame);
        autoNext.frame = 0;
        if (ui.auto) ui.auto.hidden = true;
    }

    function resumeAutoNext() {
        if (!autoNext.active || autoNext.frame || !onScreen || timer.blocked) return;
        autoNext.last = performance.now();
        autoNext.frame = requestAnimationFrame(tickAutoNext);
    }

    function tickAutoNext(now) {
        autoNext.frame = 0;
        if (!autoNext.active) return;
        // Calm mode switched on meanwhile: wait for the button
        if (!A.motion.ok()) {
            stopAutoNext();
            return;
        }
        const running = onScreen && !timer.blocked;
        if (running) autoNext.remaining -= A.util.clamp(now - autoNext.last, 0, MAX_FRAME_MS);
        autoNext.last = now;
        drawAutoNext();
        if (autoNext.remaining <= 0 && !busy) {
            stopAutoNext();
            goNext();
            return;
        }
        if (running) autoNext.frame = requestAnimationFrame(tickAutoNext);
    }

    function drawAutoNext() {
        if (!ui.autoBar) return;
        const fraction = A.util.clamp(autoNext.remaining / MYTH_NEXT_MS, 0, 1);
        ui.autoBar.style.transform = "scaleX(" + (1 - fraction).toFixed(3) + ")";
    }

    // ---------- 13. Answering (and the boxes of "My mistakes") ----------
    // position: which button was chosen (0-3), or null when the time ran out
    function answer(position) {
        if (state.screen !== "question" || busy || state.answers[state.index]) return;

        const question = currentQuestion();
        const order = state.optionOrders[state.index];
        const picked = position === null ? null : order[position];
        if (position !== null && picked === undefined) return;

        const correct = picked === question.correct;
        const secondsLeft = state.timed ? Math.max(0, timer.remaining) / 1000 : 0;
        // How long the answer took (with the timer: the time it counted down)
        const ms = state.timed ? TIME_LIMIT * 1000 - secondsLeft * 1000 : Math.max(0, Date.now() - state.askedAt);
        stopTimer();
        A.track("quiz.answer", { id: question.key, correct: correct, mode: state.mode });

        const record = {
            picked: picked,
            correct: correct,
            timeout: position === null,
            base: 0,
            speed: 0,
            streakBonus: 0,
            points: 0,
            lostStreak: 0,
            praise: A.util.randomInt(1, PRAISE_COUNT),      // which "Correct!" message
            ms: Math.round(ms),                              // how long the answer took
            box: noteMistake(question, correct)               // what happened in "My mistakes"
        };

        if (correct) {
            state.streak += 1;
            record.base = BASE_POINTS;
            if (state.timed) record.speed = Math.round(SPEED_BONUS_MAX * Math.min(1, secondsLeft / TIME_LIMIT));
            if (state.streak >= STREAK_MIN) record.streakBonus = Math.min(STREAK_BONUS_MAX, (state.streak - 1) * STREAK_STEP);
            record.points = record.base + record.speed + record.streakBonus;
        } else {
            record.lostStreak = state.streak;
            state.streak = 0;
        }
        state.bestStreak = Math.max(state.bestStreak, state.streak);

        const oldPoints = state.points;
        state.points += record.points;
        state.answers[state.index] = record;
        if (state.mode === "daily") countDailyTry();

        // Where is the focus? Keyboard users get moved on to the "Next" button.
        const active = document.activeElement;
        const keepFocus = card.contains(active) || active === document.body || !active;

        markOptions(record);
        ui.feedback.hidden = false;
        ui.feedback.classList.remove("is-good", "is-bad", "is-timeout");
        ui.feedback.classList.add(record.timeout ? "is-timeout" : record.correct ? "is-good" : "is-bad");
        A.dom.replay(ui.feedback, "is-in");
        // Only one glow at a time: with both classes the red one would always win
        card.classList.remove("is-flash-good", "is-flash-bad");
        A.dom.replay(card, correct ? "is-flash-good" : "is-flash-bad");
        paint();

        if (record.points > 0) {
            animateScore(oldPoints, state.points);
            ui.scorePop.textContent = "+" + A.format.number(record.points);
            A.dom.replay(ui.scorePop, "is-popping");
        }
        if (state.streak >= STREAK_MIN) A.dom.replay(ui.streak, "is-bump");

        // The message for screen readers: result, points, right answer, explanation
        const parts = [feedbackTitle(record)];
        if (record.points > 0) parts.push("+" + A.plural("quiz.points", record.points) + ".");
        if (question.type === "myth") {
            parts.push(t(question.correct === 0 ? "quiz.fb.myth" : "quiz.fb.fact"));
        } else {
            if (!record.correct && question.type === "choice") {
                parts.push(t("quiz.fb.rightAnswer", { answer: t(optionKey(question, question.correct)) }) + ".");
            }
            parts.push(t("quiz." + question.key + ".explain"));
        }
        if (record.box && state.mode === "mistakes") parts.push(boxText(record.box));
        A.announce(parts.join(" "), { region: live });

        if (keepFocus) ui.next.focus({ preventScroll: true });
        if (question.type === "myth") startAutoNext();

        // Make sure the explanation and the "Next" button can be seen.
        // The button stops above the assistant's round button in the bottom corner,
        // but we never scroll so far that the top of the explanation disappears
        // under the menu bar. (Both sizes come from the CSS and are smaller on phones.)
        requestAnimationFrame(() => {
            if (!ui.next || !ui.next.isConnected) return;
            const topSpace = A.layout.navHeight() + SCROLL_GAP;
            const bottomSpace = A.layout.px("--launcher-room", LAUNCHER_ROOM) + SCROLL_GAP;
            // The feedback is still sliding in from a little lower (its "is-in" animation):
            // measure where it will stop, not where it is now. The browser gives the
            // feedback's current move (its CSS transform) as a matrix of numbers; "m42" is
            // how many px it is moved down right now (the translateY of qz-feedback-in in
            // quiz.css, 0 once the slide is over). The "Next" button moves with it.
            const slide = new DOMMatrixReadOnly(getComputedStyle(ui.feedback).transform).m42;
            const nextBottom = ui.next.getBoundingClientRect().bottom - slide;
            const feedbackTop = ui.feedback.getBoundingClientRect().top - slide;
            const lowest = window.innerHeight - bottomSpace;
            const distance = Math.min(nextBottom - lowest, feedbackTop - topSpace);
            if (nextBottom > lowest && distance > 0) {
                window.scrollBy({ top: distance, behavior: A.motion.ok() ? "smooth" : "auto" });
            }
        });
    }

    // A wrong answer puts the question in box 1 of "My mistakes" (in any mode, except
    // Myth or fact). In a review of "My mistakes", a right answer moves the question up
    // a box, so it comes back later, and a right answer in the last box takes it off the
    // list. Returns what happened, for the feedback: null, or { change, box, due } with
    // change "saved" (a new mistake), "back" (back to box 1), "up" or "cleared".
    function noteMistake(question, correct) {
        if (question.type === "myth") return null;
        const today = dayKey();
        const reviewing = state.mode === "mistakes";
        const item = own(saved.mistakes, question.key) ? saved.mistakes[question.key] : null;
        let change = null;

        if (!correct) {
            saved.mistakes[question.key] = { box: 1, due: addDays(today, BOX_WAIT_DAYS[0]) };
            change = { change: reviewing ? "back" : "saved", box: 1 };
            if (reviewing) state.moves.back += 1;
        } else if (reviewing && item) {
            if (item.box >= BOX_WAIT_DAYS.length) {
                delete saved.mistakes[question.key];
                change = { change: "cleared", box: item.box };
                state.moves.cleared += 1;
            } else {
                const box = item.box + 1;
                const due = addDays(today, BOX_WAIT_DAYS[box - 1]);
                saved.mistakes[question.key] = { box: box, due: due };
                change = { change: "up", box: box, due: due };
                state.moves.up += 1;
            }
        }
        if (change) saveMistakes();
        return change;
    }

    // The chip under the explanation: "Saved to “My mistakes”", "Step 2 of 3: back tomorrow"...
    function boxText(box) {
        if (box.change === "saved") return "📌 " + t("quiz.fb.saved");
        if (box.change === "back") return "↩️ " + t("quiz.fb.boxReset");
        if (box.change === "cleared") return "✅ " + t("quiz.fb.cleared");
        return "⬆️ " + t("quiz.fb.boxUp", { n: box.box, total: BOX_WAIT_DAYS.length, when: whenText(box.due) });
    }

    // Colours the options: green for the right one, red for a wrong pick
    function markOptions(record) {
        const question = currentQuestion();
        const order = state.optionOrders[state.index];
        ui.options.forEach((button, position) => {
            const original = order[position];
            const isRight = original === question.correct;
            const isPicked = original === record.picked;
            button.setAttribute("aria-disabled", "true");
            button.classList.add("is-locked");
            button.classList.toggle("is-correct", isRight);
            button.classList.toggle("is-wrong", isPicked && !isRight);
            button.classList.toggle("is-picked", isPicked);
            button.classList.toggle("is-dim", !isRight && !isPicked);
            button.querySelector(".qz-sr-correct").hidden = !isRight;
            button.querySelector(".qz-sr-picked").hidden = !isPicked;
        });
    }

    // The score counts up to its new value
    function animateScore(from, to) {
        if (scoreCount) scoreCount.stop();
        if (!ui.score) return;
        scoreCount = A.countUp(ui.score, from, to, SCORE_COUNT_MS);
    }

    function goNext() {
        if (state.screen !== "question" || busy || !state.answers[state.index]) return;
        stopAutoNext();
        if (state.index < state.questions.length - 1) {
            state.index += 1;
            showScreen(buildQuestion, { focus: ".qz-question-text", reveal: true, after: beginQuestion });
        } else {
            finishGame();
        }
    }

    function beginQuestion() {
        if (state.answers[state.index]) return;
        state.askedAt = Date.now();
        if (state.timed) startTimer();
    }

    // ---------- 14. Starting and finishing a game ----------
    // Starts a mode, or shows why it can't start yet: the daily challenge is done for
    // today, nothing is due in "My mistakes", or the texts of the questions are still
    // loading (then the game starts as soon as they are there).
    // settings: { lesson, forceFocus, reveal }
    function play(mode, settings) {
        const options = settings || {};
        readSaved();
        if (mode === "daily" && saved.daily.last === dayKey()) {
            pending = null;
            showDaily(options);
            return;
        }
        if (mode === "lesson" && toLesson(options.lesson) === null) {
            pending = null;
            showLessons(options);
            return;
        }
        if (mode === "mistakes") {
            const info = mistakesInfo();
            if (!info.due) {
                pending = null;
                const notice = info.count
                    ? () => t("quiz.notice.mistakesLater", { when: whenText(info.next) })
                    : () => t("quiz.notice.mistakesEmpty");
                if (state.screen === "start") {
                    setNotice(notice);
                    revealNotice();
                } else {
                    backToStart({ notice: notice, focusMode: "mistakes", forceFocus: options.forceFocus, reveal: options.reveal });
                }
                return;
            }
        }
        if (!textsLoaded()) {
            waitForTexts(mode, options);
            return;
        }
        pending = null;
        startGame(mode, options);
    }

    // The texts of the questions are not there yet: say so, and start once they are.
    // If something else is chosen meanwhile, only the newest choice starts.
    function waitForTexts(mode, options) {
        pending = { mode: mode, settings: options };
        setNotice(() => t("quiz.notice.loading"));
        loadBank().then(() => {
            const next = pending;
            pending = null;
            if (next) play(next.mode, next.settings);
        }, () => {
            const failed = pending;
            if (!failed) return;
            pending = null;
            const notice = () => t("quiz.notice.loadFailed");
            // The start screen has the message right under the modes. From the other screens
            // (the list of lessons, "come back tomorrow") go back there, so it can be seen.
            if (state.screen === "start") {
                setNotice(notice);
                revealNotice();
            } else {
                backToStart({ notice: notice, focusMode: failed.mode });
            }
        });
    }

    function startGame(mode, options) {
        const settings = options || {};
        stopEverything();
        card.classList.remove("is-flash-good", "is-flash-bad");

        const today = dayKey();
        // The daily challenge: a random that repeats, started from the date
        const random = mode === "daily" ? seededRandom("daily " + today) : Math.random;
        const recent = lastGame[mode === "timed" ? "classic" : mode] || [];
        let questions;
        if (mode === "daily") questions = pickBalanced(DAILY_SIZE, DAILY_MIX, random, []);
        else if (mode === "myth") questions = pickMyths(random, recent);
        else if (mode === "lesson") questions = pickLesson(toLesson(settings.lesson), random);
        else if (mode === "mistakes") questions = pickMistakes(random);
        else questions = pickBalanced(GAME_SIZE, GAME_MIX, random, recent);
        lastGame[mode === "timed" ? "classic" : mode] = questions.map((question) => question.key);

        state.mode = mode;
        state.lesson = mode === "lesson" ? toLesson(settings.lesson) : null;
        state.timed = mode === "timed";
        state.day = today;
        state.questions = questions;
        state.optionOrders = questions.map((question) =>
            question.type === "choice"
                ? shuffleWith(Array.from({ length: CHOICE_OPTIONS }, (value, option) => option), random)
                : [0, 1]
        );
        state.index = 0;
        state.answers = [];
        state.points = 0;
        state.streak = 0;
        state.bestStreak = 0;
        state.boxes = questions.map((question) => (mode === "mistakes" ? saved.mistakes[question.key].box : 0));
        state.moves = { cleared: 0, up: 0, back: 0 };
        state.dailyCounted = false;
        state.result = null;
        state.startedAt = Date.now();
        state.reviewFilter = "all";
        state.notice = null;
        state.screen = "question";
        showScreen(buildQuestion, {
            focus: ".qz-question-text",
            forceFocus: settings.forceFocus,
            reveal: settings.reveal !== false,
            after: beginQuestion
        });
    }

    function finishGame(options) {
        const settings = options || {};
        stopTimer();
        stopAutoNext();
        readSaved();
        const mode = state.mode;
        const total = state.questions.length;
        const correct = state.answers.filter((record) => record && record.correct).length;
        const result = {
            mode: mode,
            lesson: state.lesson,
            day: state.day,
            correct: correct,
            total: total,
            percent: Math.round((correct / total) * 100),
            points: state.points,
            bestStreak: state.bestStreak,
            timed: state.timed,
            rank: rankFor(correct, total),
            marks: state.answers.map((record) => (record && record.correct ? "1" : "0")).join(""),
            isNewBest: false,
            previousBest: null,     // the best before this game
            streak: 0,              // the daily challenge: days in a row
            moves: state.moves,     // My mistakes: cleared, moved up, back to box 1
            left: 0,                // My mistakes: questions still on the list
            celebrate: false
        };
        const run = { points: state.points, correct: correct, total: total, date: dayKey() };
        let isNewDay = false;

        // A new best score? (Each mode and each lesson has its own.)
        if (BEST_MODES.indexOf(mode) !== -1 || mode === "lesson") {
            const list = mode === "lesson" ? saved.bests.lessons : saved.bests.modes;
            const id = mode === "lesson" ? String(state.lesson) : mode;
            result.previousBest = list[id] || null;
            result.isNewBest = state.points > 0 && (!result.previousBest || state.points > result.previousBest.points);
            if (result.isNewBest) {
                list[id] = run;
                saveBests();
            }
        } else if (mode === "daily") {
            // Today's try was counted at its first answer (see countDailyTry)
            result.streak = saved.daily.streak;
            isNewDay = state.dailyCounted;
        } else if (mode === "mistakes") {
            result.left = mistakesInfo().count;
        }
        result.celebrate = result.isNewBest ||
            (mode === "daily" && correct === total) ||
            (mode === "mistakes" && result.left === 0 && result.moves.cleared > 0);

        state.result = result;
        const detail = {
            mode: mode,
            score: correct,
            total: total,
            points: state.points,
            timed: state.timed,
            seconds: Math.round((Date.now() - state.startedAt) / 1000),
            // only the time spent answering (reading the explanations doesn't count)
            answerSeconds: Math.round(state.answers.reduce((sum, record) => sum + (record ? record.ms : 0), 0) / 1000)
        };
        if (mode === "lesson") detail.lesson = state.lesson;
        A.track("quiz.finish", detail);
        if (isNewDay) A.track("daily.complete", { date: state.day, score: correct, total: total, streak: result.streak });

        state.screen = "results";
        ringShown = false;
        showScreen(buildResults, {
            focus: ".qz-res-title",
            forceFocus: settings.forceFocus,
            reveal: settings.reveal !== false,
            after: animateResults
        });
    }

    // The daily challenge is one try a day, and the try starts with its FIRST answer, not
    // at the end: every answer shows the right one, so quitting (or reloading the page)
    // must not give a second go at the same questions. The streak grows if the challenge
    // was played yesterday too, and simply starts again at 1 after a missed day.
    // After that, each answer updates today's marks. ("daily.complete" is sent at the end.)
    function countDailyTry() {
        if (!state.dailyCounted) {
            readSaved();                // another tab may have played today meanwhile
            const daily = saved.daily;
            if (daily.last === state.day) return;      // then that try is the one that counts
            const gap = daily.last ? daysBetween(daily.last, state.day) : 0;
            daily.streak = gap === 1 ? daily.streak + 1 : 1;
            daily.best = Math.max(daily.best, daily.streak);
            daily.days += 1;
            daily.last = state.day;
            state.dailyCounted = true;
        }
        const daily = saved.daily;
        daily.correct = state.answers.filter((record) => record && record.correct).length;
        daily.total = state.questions.length;
        daily.marks = state.answers.map((record) => (record && record.correct ? "1" : "0")).join("");
        saveDaily();
    }

    // settings: { notice (a message under the modes), focusMode (the card to focus), forceFocus, reveal }
    function backToStart(options) {
        const settings = options || {};
        stopEverything();
        pending = null;
        readSaved();
        state.notice = settings.notice || null;
        state.screen = "start";
        showScreen(buildStart, {
            focus: settings.focusMode ? '.qz-mode[data-mode="' + settings.focusMode + '"]' : ".qz-start-title",
            forceFocus: settings.forceFocus,
            reveal: settings.reveal !== false,
            showNotice: Boolean(state.notice),
            after: () => {
                if (state.notice) A.announce(state.notice(), { region: live });
            }
        });
    }

    // ---------- 15. RESULTS screen ----------
    let ringShown = false;      // has the score ring filled up? (until then the % shows 0)

    function buildResults() {
        const result = state.result;
        const rank = result.rank;
        const isMistakes = result.mode === "mistakes";

        const review = state.questions.map((question, position) => {
            const record = state.answers[position];
            const status = record.timeout ? "timeout" : record.correct ? "correct" : "wrong";
            const statusKey = "quiz.review.status" + status.charAt(0).toUpperCase() + status.slice(1);
            const yourAnswer = record.timeout
                ? text("quiz.review.noAnswer", "qz-ri-value")
                : text(optionKey(question, record.picked), "qz-ri-value");
            const rightLine = record.correct
                ? ""
                : '<p class="qz-ri-line is-right">' + text("quiz.review.rightAnswer", "qz-ri-label") + " " + text(optionKey(question, question.correct), "qz-ri-value") + "</p>";
            // Myth or fact: the verdict shows right away, so the list is the facts at the end
            const verdict = question.type === "myth"
                ? '<span class="qz-ri-verdict is-' + (question.correct === 0 ? "myth" : "fact") + '">' + text(question.correct === 0 ? "quiz.myth" : "quiz.fact") + "</span>"
                : "";

            let learn = "";
            if (lessonExists(question.lesson)) {
                learn = '<button class="btn btn-ghost btn-small qz-ri-learn" type="button" data-lesson="' + question.lesson + '"><span aria-hidden="true">📚</span><span class="qz-ri-learn-text"></span></button>';
            } else if (question.lesson === "timeline" && document.getElementById("timeline")) {
                learn = '<button class="btn btn-ghost btn-small qz-ri-learn" type="button" data-section="timeline"><span aria-hidden="true">🕰️</span>' + text("quiz.review.timeline") + "</button>";
            }

            return '<li class="qz-ri is-' + status + '" data-status="' + status + '">' +
                "<details>" +
                    "<summary>" +
                        '<span class="qz-ri-status" aria-hidden="true"></span>' +
                        '<span class="qz-ri-num mono" aria-hidden="true">' + String(position + 1).padStart(2, "0") + "</span>" +
                        '<span class="qz-ri-question">' + verdict + text("quiz." + question.key + ".text") +
                            '<span class="sr-only">, ' + text(statusKey) + "</span>" +
                        "</span>" +
                        '<span class="qz-ri-points mono" aria-hidden="true">' + (record.points ? "+" + record.points : "0") + "</span>" +
                        '<span class="qz-ri-chevron" aria-hidden="true"></span>' +
                    "</summary>" +
                    '<div class="qz-ri-body">' +
                        '<p class="qz-ri-line is-yours">' + text("quiz.review.yourAnswer", "qz-ri-label") + " " + yourAnswer + "</p>" +
                        rightLine +
                        '<p class="qz-ri-explain">' + text("quiz." + question.key + ".explain") + "</p>" +
                        learn +
                    "</div>" +
                "</details>" +
            "</li>";
        }).join("");

        // The 4th tile: days in a row (daily challenge), questions left (My mistakes), or the mode
        const fourth = result.mode === "daily" ? ["days", "quiz.daily.streak", "📅"]
            : isMistakes ? ["left", "quiz.res.left", "📌"]
                : ["mode", "quiz.res.mode", MODES[result.mode].icon];
        const tiles = [
            ["correct", "quiz.res.correct", "✅"],
            ["points", "quiz.res.points", "⭐"],
            ["streak", "quiz.res.bestStreak", "🔥"],
            fourth
        ].map((tile, index) =>
            '<li class="qz-tile qz-tile-' + tile[0] + '" style="--i:' + index + '">' +
                '<span class="qz-tile-icon" aria-hidden="true">' + tile[2] + "</span>" +
                '<strong class="qz-tile-value gradient-text" data-ref="tile-' + tile[0] + '"></strong>' +
                text(tile[1], "qz-tile-label") +
            "</li>"
        ).join("");

        // The buttons under the result: the first one is the main one
        const actions = [];
        if (MODES[result.mode].retry) {
            actions.push('<button class="btn qz-retry" type="button"><span class="qz-retry-icon" aria-hidden="true">↻</span>' + text("quiz.res.retry") + "</button>");
        }
        if (result.mode === "lesson" && lessonExists(result.lesson)) {
            actions.push('<button class="btn qz-open-lesson" type="button"><span aria-hidden="true">📚</span><span data-ref="openLesson"></span></button>');
        }
        if (result.mode === "lesson") {
            actions.push('<button class="btn qz-other-lesson" type="button">' + text("quiz.res.otherLesson") + "</button>");
        }
        if (isMistakes && mistakesInfo().due) {
            actions.push('<button class="btn qz-more" type="button"><span class="qz-retry-icon" aria-hidden="true">↻</span>' + text("quiz.res.moreMistakes") + "</button>");
        }
        if (MODES[result.mode].copy) {
            actions.push(
                '<button class="btn qz-copy" type="button">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
                    text("quiz.res.copy", "qz-copy-label") +
                    text("quiz.res.copiedLabel", "qz-copied-label") +
                "</button>"
            );
        }
        actions.push('<button class="btn qz-to-start" type="button">' + text("quiz.res.toStart") + "</button>");
        const buttons = actions.map((html, index) =>
            html.replace('class="btn ', 'class="btn ' + (index === 0 ? "btn-primary " : "btn-ghost "))
        ).join("");

        const bestIcon = result.isNewBest ? "✨"
            : result.mode === "daily" ? "🔥"
                : isMistakes ? (result.left ? "📌" : "🎉")
                    : "🏅";
        const title = isMistakes
            ? '<span class="qz-rank-emoji" aria-hidden="true">' + MODES.mistakes.icon + "</span>" + text("quiz.res.mistakesTitle", "qz-rank-name gradient-text")
            : '<span class="qz-rank-emoji" aria-hidden="true">' + rank.emoji + "</span>" + text("quiz.rank." + rank.id, "qz-rank-name gradient-text");
        const intro = isMistakes
            ? '<p class="qz-res-text" data-ref="mistakesText"></p>'
            : '<p class="qz-res-text">' + text("quiz.rank." + rank.id + "Text") + "</p>";

        const screen = A.dom.fromHTML(
            '<div class="qz-screen qz-results rank-' + (isMistakes ? "review" : rank.id) + " is-" + result.mode + '">' +
                '<div class="qz-res-hero">' +
                    '<div class="qz-res-ring ui-ring" data-ref="ring">' +
                        '<svg class="ui-ring-chart" viewBox="0 0 160 160" aria-hidden="true">' +
                            "<defs>" +
                                '<linearGradient id="qz-ring-gradient" x1="0" y1="0" x2="1" y2="1">' +
                                    '<stop class="qz-stop-a" offset="0"></stop>' +
                                    '<stop class="qz-stop-b" offset="1"></stop>' +
                                "</linearGradient>" +
                            "</defs>" +
                            '<circle class="qz-res-ticks ui-ring-ticks" cx="80" cy="80" r="77"></circle>' +
                            '<circle class="qz-res-track ui-ring-track" cx="80" cy="80" r="' + RESULT_RADIUS + '"></circle>' +
                            '<circle class="qz-res-bar ui-ring-bar" cx="80" cy="80" r="' + RESULT_RADIUS + '" stroke="url(#qz-ring-gradient)" stroke-dasharray="' + RESULT_LENGTH.toFixed(2) + '" stroke-dashoffset="' + RESULT_LENGTH.toFixed(2) + '"></circle>' +
                        "</svg>" +
                        '<div class="qz-res-center" aria-hidden="true">' +
                            '<strong class="qz-res-percent gradient-text"><span data-ref="percent">0</span><span class="qz-res-pct">%</span></strong>' +
                            '<span class="qz-res-caption mono">' + text("quiz.res.ringCaption") + "</span>" +
                        "</div>" +
                        '<span class="sr-only" data-ref="ringSr"></span>' +
                    "</div>" +
                    '<div class="qz-res-info">' +
                        '<p class="qz-kicker mono" data-ref="kicker"></p>' +
                        '<h3 class="qz-res-title" tabindex="-1">' + title + "</h3>" +
                        intro +
                        '<p class="qz-best' + (result.isNewBest ? " is-new" : "") + '" data-ref="best">' +
                            '<span aria-hidden="true">' + bestIcon + "</span>" +
                            '<span data-ref="bestText"></span>' +
                        "</p>" +
                    "</div>" +
                "</div>" +

                '<ul class="qz-tiles qz-res-tiles">' + tiles + "</ul>" +

                '<div class="qz-res-actions">' + buttons + "</div>" +

                '<div class="qz-review">' +
                    '<div class="qz-review-head">' +
                        '<h4 class="qz-review-title">' + text("quiz.review.title") + "</h4>" +
                        '<div class="qz-review-tools">' +
                            '<div class="qz-filters" role="group" data-i18n-attr="aria-label:quiz.review.filterLabel" aria-label="' + t("quiz.review.filterLabel") + '">' +
                                '<button class="chip" type="button" data-filter="all" data-ref="filterAll"></button>' +
                                '<button class="chip" type="button" data-filter="mistakes" data-ref="filterMistakes"></button>' +
                            "</div>" +
                            '<button class="btn btn-ghost btn-small qz-expand" type="button" data-ref="expand"></button>' +
                        "</div>" +
                    "</div>" +
                    '<p class="qz-review-empty" data-ref="empty" hidden>' + text("quiz.review.noMistakes") + "</p>" +
                    '<ol class="qz-review-list" data-ref="reviewList">' + review + "</ol>" +
                "</div>" +
            "</div>"
        );

        collectRefs(screen);
        ui.items = Array.prototype.slice.call(screen.querySelectorAll(".qz-ri"));
        ui.copy = screen.querySelector(".qz-copy");

        const on = (selector, action) => {
            const button = screen.querySelector(selector);
            if (button) {
                button.addEventListener("click", () => {
                    if (state.screen === "results" && !busy) action(button);
                });
            }
        };
        on(".qz-retry", () => play(result.mode, { lesson: result.lesson }));
        on(".qz-more", () => play("mistakes", {}));
        on(".qz-other-lesson", () => showLessons());
        on(".qz-to-start", () => backToStart());
        on(".qz-copy", copyResult);
        on(".qz-open-lesson", (button) => {
            // The lesson opens on top of the page; closing it brings you back to this button
            button.focus({ preventScroll: true });
            A.lessons.open(result.lesson, button);
        });

        ui.filterAll.addEventListener("click", () => setFilter("all"));
        ui.filterMistakes.addEventListener("click", () => setFilter("mistakes"));
        ui.expand.addEventListener("click", toggleAll);

        // "toggle" doesn't bubble, so we listen while it travels down (capture)
        ui.reviewList.addEventListener("toggle", paintReviewTools, true);

        ui.reviewList.addEventListener("click", (event) => {
            const button = event.target.closest(".qz-ri-learn");
            if (!button) return;
            const lesson = Number(button.getAttribute("data-lesson"));
            if (lesson && A.lessons) {
                // The lesson opens on top of the page. We hand over this button, so that
                // closing the lesson brings you right back here, to your review.
                // (Some browsers don't focus a clicked button, so we do it ourselves.)
                button.focus({ preventScroll: true });
                A.lessons.open(lesson, button);
            } else if (button.getAttribute("data-section")) {
                A.navigate(button.getAttribute("data-section"));
            }
        });

        paintScreen = paintResults;
        return screen;
    }

    function paintResults() {
        const result = state.result;
        ui.ringSr.textContent = t("quiz.res.ringSr", { percent: result.percent });
        if (!counting(percentCount)) ui.percent.textContent = A.format.number(ringShown ? result.percent : 0);

        ui.kicker.textContent = resultKicker(result);
        ui["tile-correct"].textContent = result.correct + " / " + result.total;
        ui["tile-points"].textContent = A.format.number(result.points);
        ui["tile-streak"].textContent = String(result.bestStreak);
        if (ui["tile-mode"]) ui["tile-mode"].textContent = result.mode === "lesson" ? lessonLabel(result.lesson) : t("quiz.mode." + result.mode);
        if (ui["tile-days"]) ui["tile-days"].textContent = String(result.streak);
        if (ui["tile-left"]) ui["tile-left"].textContent = String(result.left);
        if (ui.mistakesText) ui.mistakesText.textContent = t("quiz.res.mistakesText", result.moves);
        if (ui.openLesson) ui.openLesson.textContent = t("quiz.res.openLesson", { n: result.lesson });

        const line = bestLine(result);
        ui.best.hidden = !line;
        ui.bestText.textContent = line;

        // "Learn more" buttons use the lesson titles in the current language
        ui.reviewList.querySelectorAll(".qz-ri-learn[data-lesson]").forEach((button) => {
            const n = Number(button.getAttribute("data-lesson"));
            const title = A.lessons ? A.lessons.title(n) : "";
            button.querySelector(".qz-ri-learn-text").textContent = title
                ? t("quiz.review.lesson", { n: n, title: title })
                : t("quiz.review.lessonPlain", { n: n });
        });

        paintReviewTools();
    }

    // "Mission complete", "Daily challenge · 15 January", "Review · Neural networks"...
    function resultKicker(result) {
        if (result.mode === "classic") return t("quiz.res.kicker");
        return t("quiz.res.kicker." + result.mode, {
            date: dayText(result.day),
            name: result.mode === "lesson" ? lessonTitle(result.lesson) : ""
        });
    }

    // The line under the rank: a new best score, the best of this mode, the daily
    // streak, or how many mistakes are left. "" when there is nothing to say yet.
    function bestLine(result) {
        if (result.isNewBest) return t("quiz.res.newBest");
        if (result.mode === "daily") return t("quiz.res.dailyStreak", { days: A.plural("quiz.streakDays", result.streak) });
        if (result.mode === "mistakes") {
            return result.left ? A.plural("quiz.res.mistakesLeft", result.left) : t("quiz.res.mistakesClear");
        }
        const best = result.previousBest;
        if (!best) return "";
        if (result.mode === "lesson") {
            return best.correct === null ? "" : t("quiz.res.bestWasLesson", { correct: best.correct, total: best.total });
        }
        const key = { classic: "quiz.res.bestWas", timed: "quiz.res.bestWasTimed", myth: "quiz.res.bestWasMyth" }[result.mode];
        return t(key, { points: A.plural("quiz.points", best.points) });
    }

    // Filter chips, "Expand all" and the "no mistakes" message
    function paintReviewTools() {
        if (state.screen !== "results" || !ui.items) return;
        const mistakes = ui.items.filter((item) => item.getAttribute("data-status") !== "correct").length;
        ui.filterAll.textContent = t("quiz.review.all", { n: ui.items.length });
        ui.filterMistakes.textContent = t("quiz.review.mistakes", { n: mistakes });
        ui.filterAll.setAttribute("aria-pressed", String(state.reviewFilter === "all"));
        ui.filterMistakes.setAttribute("aria-pressed", String(state.reviewFilter === "mistakes"));

        const visible = ui.items.filter((item) => !item.hidden);
        ui.empty.hidden = visible.length > 0;
        ui.expand.hidden = visible.length === 0;
        const allOpen = visible.length > 0 && visible.every((item) => item.querySelector("details").open);
        ui.expand.textContent = t(allOpen ? "quiz.review.collapse" : "quiz.review.expand");
        ui.expand.setAttribute("data-open", String(allOpen));
    }

    function setFilter(filter) {
        state.reviewFilter = filter;
        ui.items.forEach((item) => {
            item.hidden = filter === "mistakes" && item.getAttribute("data-status") === "correct";
        });
        paintReviewTools();
    }

    function toggleAll() {
        const open = ui.expand.getAttribute("data-open") !== "true";
        ui.items.forEach((item) => {
            if (!item.hidden) item.querySelector("details").open = open;
        });
        paintReviewTools();
    }

    // The score ring fills up and the percentage counts up
    function animateResults() {
        const result = state.result;
        const bar = stage.querySelector(".qz-res-bar");
        if (!bar || !result) return;
        const target = RESULT_LENGTH * (1 - result.percent / 100);
        bar.classList.toggle("is-empty", result.percent === 0);

        // A short summary for screen-reader users
        let summary = result.mode === "mistakes"
            ? t("quiz.res.announceMistakes", { correct: result.correct, total: result.total, left: bestLine(result) })
            : t("quiz.res.announce", {
                correct: result.correct,
                total: result.total,
                points: A.plural("quiz.points", result.points),
                rank: t("quiz.rank." + result.rank.id)
            });
        if (result.isNewBest) summary += " " + t("quiz.res.newBest");
        A.announce(summary, { region: live });

        if (!A.motion.ok()) {
            ringShown = true;
            bar.style.strokeDashoffset = target.toFixed(2);
            paint();
            return;
        }

        ringShown = false;
        void bar.getBoundingClientRect();   // the browser notes the "empty" ring first
        requestAnimationFrame(() => {
            bar.classList.add("is-animated");
            bar.style.strokeDashoffset = target.toFixed(2);
        });

        const ring = ui.ring;
        percentCount = A.countUp(ui.percent, 0, result.percent, PERCENT_COUNT_MS, {
            done: () => {
                ringShown = true;
                if (ring.isConnected) A.dom.replay(ring, "is-done");
            }
        });

        if (result.celebrate) {
            clearTimeout(confettiTimer);
            confettiTimer = setTimeout(burstConfetti, CONFETTI_DELAY);
        }
    }

    // ---------- 16. Confetti ----------
    // For a new best score, a perfect daily challenge or an empty list of mistakes
    // (not in calm mode). effects.js draws it: one burst from the middle of the score ring.
    let confettiTimer = 0;
    let confettiUntil = 0;      // until then, confetti that the quiz started may still be falling

    function burstConfetti() {
        if (!A.effects || state.screen !== "results" || !ui.ring || !ui.ring.isConnected) return;
        A.effects.confetti({ origin: ui.ring, duration: CONFETTI_MS });
        confettiUntil = performance.now() + CONFETTI_MS;
    }

    // A new game or the start screen stops the quiz's confetti, but never the
    // confetti of another feature (finishing every lesson celebrates with it too)
    function stopConfetti() {
        clearTimeout(confettiTimer);
        if (A.effects && performance.now() < confettiUntil) A.effects.stopConfetti();
        confettiUntil = 0;
    }

    // ---------- 17. "Copy my result" ----------
    let copiedTimer = 0;

    // The text to share: Classic, Timed and Myth or fact share the rank; the daily
    // challenge shares its row of 🟩 and 🟥 (no spoilers: just right and wrong)
    function shareText(result) {
        const key = { timed: "quiz.share.timed", daily: "quiz.share.daily", myth: "quiz.share.myth" }[result.mode] || "quiz.share.text";
        return t(key, {
            correct: result.correct,
            total: result.total,
            percent: result.percent,
            points: A.plural("quiz.points", result.points),
            rank: t("quiz.rank." + result.rank.id),
            emoji: result.rank.emoji,
            date: dayText(result.day),
            marks: result.marks.replace(/1/g, "🟩").replace(/0/g, "🟥"),
            days: A.plural("quiz.streakDays", result.streak)
        });
    }

    function copyResult() {
        const result = state.result;
        if (!result) return;
        let message = shareText(result);
        // On the real website, add a link to the quiz
        if (/^https?:$/.test(window.location.protocol)) {
            message += "\n" + window.location.origin + window.location.pathname + "#quiz";
        }

        const done = (ok) => {
            A.toast(t(ok ? "quiz.res.copied" : "quiz.res.copyFailed"), ok ? "📋" : "⚠️");
            if (!ok || !ui.copy) return;
            ui.copy.classList.add("is-copied");
            clearTimeout(copiedTimer);
            const button = ui.copy;
            copiedTimer = setTimeout(() => button.classList.remove("is-copied"), COPIED_MS);
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(message).then(
                () => done(true),
                () => done(copyWithTextarea(message))
            );
        } else {
            done(copyWithTextarea(message));
        }
    }

    // The old way of copying, for browsers without navigator.clipboard
    function copyWithTextarea(message) {
        const active = document.activeElement;
        const area = document.createElement("textarea");
        area.value = message;
        area.setAttribute("readonly", "");
        area.className = "qz-copy-area";
        document.body.appendChild(area);
        area.select();
        let ok = false;
        try {
            ok = document.execCommand("copy");
        } catch (error) {
            ok = false;
        }
        area.remove();
        if (active && typeof active.focus === "function") active.focus({ preventScroll: true });
        return ok;
    }

    // ---------- 18. Keyboard: number keys, arrows and Enter ----------
    // The number keys answer (1 for the first answer, ...). In Myth or fact the arrows
    // answer too: ← "Myth", → "Fact". Enter goes to the next question.
    document.addEventListener("keydown", (event) => {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        if (state.screen !== "question" || busy) return;
        if (A.dom.isTyping(event.target) || A.overlays.hasModal()) return;
        // A key pressed in a window next to the page (Compass Bot on a computer) is for that window
        if (A.overlays.contains(event.target)) return;

        // Only when the quiz is on screen (or has the focus)
        const focusInside = card.contains(document.activeElement);
        if (!focusInside && !onScreen) return;

        const answered = Boolean(state.answers[state.index]);

        if (!answered) {
            let position = -1;
            if (/^[1-9]$/.test(event.key)) position = Number(event.key) - 1;
            else if (currentQuestion().type === "myth" && event.key === "ArrowLeft") position = 0;
            else if (currentQuestion().type === "myth" && event.key === "ArrowRight") position = 1;
            const button = position >= 0 && ui.options ? ui.options[position] : null;
            if (!button) return;
            event.preventDefault();
            A.dom.replay(button, "is-pressed");
            answer(position);
            return;
        }

        if (event.key === "Enter") {
            // Real buttons and links already react to Enter by themselves
            const target = event.target;
            const control = target.closest ? target.closest("a, button, summary, [role='button']") : null;
            if (control && !control.classList.contains("qz-option")) return;
            event.preventDefault();
            goNext();
        }
    });

    // ---------- 19. Pop-up windows, calm mode and the language ----------
    // A pop-up window that shuts out the page (the lesson reader, the command palette,
    // the chat on phones) pauses the countdowns; they go on when the last one closes
    A.overlays.onChange((detail) => {
        timer.blocked = detail.modal;
        if (timer.active) {
            if (timer.blocked) drawTimer(true);
            else resumeTimer();
        }
        if (!timer.blocked) resumeAutoNext();
    });

    // core.js has already translated every [data-i18n] element;
    // here we re-write the texts that contain numbers. The last message for screen
    // readers is emptied: it was in the other language. (Through A.announce, which also
    // drops a message still on its way: it writes it a moment later.)
    A.onLanguageChange(() => {
        if (live) A.announce("", { region: live });
        paint();
        if (timer.active) {
            timer.seconds = -1;
            drawTimer(!timer.frame);
        }
    });

    // ---------- 20. Building the quiz (only when it is needed) ----------
    // The card and its start screen are built when the quiz comes near the screen,
    // when the browser has a quiet moment after loading, or when ensure() is called
    // first (by AICompass.quiz.start). With a link like #quiz, core builds it at once.
    // The texts of the questions (js/content/quiz-bank.js) load only when the quiz is
    // about half a window away, or when a game starts.
    function build() {
        mount.innerHTML =
            '<div class="qz-card card ui-scan" data-reveal>' +
                '<span class="qz-corners ui-corners" aria-hidden="true"></span>' +
                '<div class="qz-stage"></div>' +
                '<p class="sr-only qz-live" aria-live="polite" aria-atomic="true"></p>' +
            "</div>";
        card = mount.querySelector(".qz-card");
        stage = mount.querySelector(".qz-stage");
        live = mount.querySelector(".qz-live");
        readSaved();

        // The countdowns, the number keys and the decorations only work while you can see
        // the quiz: core tells us when it comes on or goes off screen (or the browser
        // tab is hidden), and pauses its CSS animations meanwhile (data-paused).
        A.whenVisible(mount, (visible) => {
            onScreen = visible;
            if (visible) {
                resumeTimer();
                resumeAutoNext();
            }
        }, { pauseAnimations: true, rootMargin: ON_SCREEN_MARGIN });

        A.whenVisible(mount, (visible) => {
            if (visible) loadBank().catch(() => {});     // a failed load is tried again later
        }, { rootMargin: PRELOAD_MARGIN });

        showScreen(buildStart);
    }

    const ensure = A.whenNeeded(mount, build);

    // ---------- 21. Ctrl+K commands and the public API ----------
    // AICompass.quiz.start(mode, options): scrolls to the quiz and starts a mode:
    //   "classic", "timed", "daily", "myth", "lesson" or "mistakes".
    //   start("lesson", { lesson: 3 }) reviews lesson 3 ({ lesson: "timeline" }: the history);
    //   start("lesson") lets you choose the lesson.
    //   start() continues the game that is running, or starts Classic.
    //   start({ timed: true }) is the older form: "timed" (and { timed: false } "classic").
    // A game of the same mode that is already running just continues. The daily challenge
    // shows "come back tomorrow" once it is done for today, and "My mistakes" says when
    // the next review is if nothing is due.
    function startQuiz(mode, options) {
        let settings = isObject(options) ? options : {};
        let wanted = mode;
        if (isObject(mode)) {
            settings = mode;
            wanted = typeof mode.timed === "boolean" ? (mode.timed ? "timed" : "classic") : undefined;
        }
        if (typeof wanted !== "string" || !own(MODES, wanted)) wanted = undefined;
        const lesson = toLesson(settings.lesson);

        ensure();
        // Core closes the pop-up windows in the way and scrolls; the focus is moved below
        A.navigate("quiz", { focus: false });

        // Act after the command palette (if any) has closed and given the focus back
        setTimeout(() => {
            const playing = state.screen === "question";
            const sameGame = playing && (!wanted || (wanted === state.mode &&
                (wanted !== "lesson" || lesson === null || lesson === state.lesson)));
            if (playing && state.answers.filter(Boolean).length === state.questions.length) {
                // Every question is answered already: show the results first, so the
                // score isn't lost. A new game can start from there.
                finishGame({ forceFocus: true, reveal: false });
            } else if (sameGame) {
                const heading = stage.querySelector(".qz-question-text");
                if (heading) heading.focus({ preventScroll: true });
            } else {
                play(wanted || "classic", { lesson: lesson, forceFocus: true, reveal: false });
            }
        }, START_DELAY);
    }

    // AICompass.quiz.question("q7"): a question in the current language, for Compass Bot's
    // "quiz me" and the teacher kit:
    //   { id, type, lesson, topic, difficulty, text, options: [...], correct, explain }
    // options are in the order of the texts: a multiple-choice question's right answer is
    // options[0]; true-or-false: ["True", "False"]; Myth or fact ("m1"…): ["Myth", "Fact"].
    // correct is the number of the right option. The texts load with the quiz: until
    // AICompass.quiz.ready() is kept, question() starts loading them and returns null.
    function questionInfo(id) {
        if (typeof id !== "string" || !own(BY_KEY, id)) return null;
        if (!textsLoaded()) {
            loadBank().catch(() => {});
            return null;
        }
        const question = BY_KEY[id];
        const count = question.type === "choice" ? CHOICE_OPTIONS : 2;
        const options = [];
        for (let i = 0; i < count; i++) options.push(t(optionKey(question, i)));
        return {
            id: question.key,
            type: question.type,
            lesson: question.lesson,
            topic: question.topic,
            difficulty: question.difficulty,
            text: t("quiz." + question.key + ".text"),
            options: options,
            correct: question.correct,
            explain: t("quiz." + question.key + ".explain")
        };
    }

    // AICompass.quiz.bank(): every question with its tags (no texts needed):
    //   [{ id, type, lesson, topic, difficulty }]   (topic names: t("quiz.topic." + topic))
    // bank("myths"): the Myth or fact statements, [{ id, type: "myth", lesson, topic, difficulty, fact }]
    function bankList(kind) {
        if (kind === "myths") {
            return MYTHS.map((myth) => ({
                id: myth.key,
                type: myth.type,
                lesson: myth.lesson,
                topic: myth.topic,
                difficulty: myth.difficulty,
                fact: myth.correct === 1
            }));
        }
        return QUESTIONS.map((question) => ({
            id: question.key,
            type: question.type,
            lesson: question.lesson,
            topic: question.topic,
            difficulty: question.difficulty
        }));
    }

    // AICompass.quiz.stats(): the saved results, for My Compass and the teacher kit:
    //   best: { classic, timed, myth: { score, total, points, date } or null,
    //           lessons: { "3": { score, total, points, date }, "timeline": … } }
    //   daily: { today, done (played today?), streak (days in a row, 0 once a day is missed),
    //            best, days, last (the last day played), score, total (of that day) }
    //   mistakes: { count (on the list), due (to review today), next (the next day one is due, or null) }
    // (score is the number of right answers; it can be null for a best score kept from
    // the quiz before the modes.)
    function stats() {
        readSaved();
        const game = (run) => (run ? { score: run.correct, total: run.total, points: run.points, date: run.date } : null);
        const best = { lessons: {} };
        BEST_MODES.forEach((mode) => {
            best[mode] = game(saved.bests.modes[mode]);
        });
        Object.keys(saved.bests.lessons).forEach((lesson) => {
            best.lessons[lesson] = game(saved.bests.lessons[lesson]);
        });
        const daily = saved.daily;
        const today = dayKey();
        return {
            best: best,
            daily: {
                today: today,
                done: daily.last === today,
                streak: liveStreak(),
                best: daily.best,
                days: daily.days,
                last: daily.last,
                score: daily.last ? daily.correct : null,
                total: daily.last ? daily.total : null
            },
            mistakes: mistakesInfo()
        };
    }

    // One Ctrl+K command for each mode. "Start the AI Challenge" continues a running game.
    [
        { id: "quiz-start", icon: "🏆", title: "quiz.cmd.start", mode: undefined,
            keywords: "quiz test challenge start play questions score classic тест викторина испытание вопросы начать играть классика" },
        { id: "quiz-start-timed", icon: MODES.timed.icon, title: "quiz.cmd.startTimed", mode: "timed",
            keywords: "quiz timed timer speed fast challenge тест таймер на время скорость быстро испытание" },
        { id: "quiz-daily", icon: MODES.daily.icon, title: "quiz.cmd.daily", mode: "daily",
            keywords: "daily challenge today streak day quiz испытание дня ежедневное сегодня серия день тест" },
        { id: "quiz-myth", icon: MODES.myth.icon, title: "quiz.cmd.myth", mode: "myth",
            keywords: "myth fact true false statements quiz миф факт правда ложь утверждения тест" },
        { id: "quiz-lesson", icon: MODES.lesson.icon, title: "quiz.cmd.lesson", mode: "lesson",
            keywords: "lesson review revise repeat quiz questions урок повторить повторение тест вопросы" },
        { id: "quiz-mistakes", icon: MODES.mistakes.icon, title: "quiz.cmd.mistakes", mode: "mistakes",
            keywords: "mistakes errors wrong review again quiz ошибки неверные повторить разбор тест" }
    ].forEach((command) => {
        A.registerCommand({
            id: command.id,
            group: "quiz.cmdGroup",
            icon: command.icon,
            title: () => t(command.title),
            keywords: command.keywords,
            run: () => startQuiz(command.mode)
        });
    });

    // Other features use AICompass.quiz (AICompass.startQuiz is the older name of start):
    //   start(mode, options)   see above
    //   question(id)           one question in the current language (see above)
    //   bank(kind)             the questions (or "myths") with their tags
    //   stats()                best results, daily challenge, mistakes
    //   ready()                a Promise, kept once the texts of the questions are loaded
    //                          (it fails without a network; calling it again tries again)
    //   modes                  the modes, in the order of the start screen
    // Progress events (A.track): "quiz.answer" { id, correct, mode } after every answer,
    // "quiz.finish" { mode, score, total, points, timed, seconds, answerSeconds, lesson } after
    // every game (score = right answers; seconds = from the first question to the end;
    // answerSeconds = only the time spent answering, without reading the explanations;
    // lesson only in "lesson" mode), and "daily.complete" { date, score, total, streak }
    // once a day, after the daily challenge.
    A.feature("quiz", {
        start: startQuiz,
        question: questionInfo,
        bank: bankList,
        stats: stats,
        ready: loadBank,
        modes: MODE_ORDER.slice()
    });
    A.startQuiz = startQuiz;
})();
