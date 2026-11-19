/* =========================================================
   AI COMPASS — MY PATH (the personal learning plan)
   The "My path" page turns the site into a course that teaches, not only
   a place to read:
   - three questions set it up: who is learning (a child, a student, an
     adult, a teacher, a pro), where to start (from zero, from the basics,
     or after a short level check) and how many minutes a day;
   - "Today's session": a memory check, the next step of the path,
     something to try in the AI Lab and "Explain it back";
   - the path: a row of stages, from "Start from zero" to "Under the hood".
     A stage is a lesson track or a guided course (small steps with a
     task each), and ends with a stage test. Nothing is locked;
   - the memory: every question of a finished lesson becomes a card that
     comes back after 1, 2, 4, 8, 16 and 32 days (spaced repetition).
     A right answer on its day moves the card one box up, a wrong one
     back to box 1; practising early never moves a card up.
   The study window itself (the level check, the memory check, the guided
   steps, "Explain it back") is js/learn-play.js: it loads the first time
   it is needed, and gets everything it needs from "host" (section 10).
   Sections of this file:
    1. Settings
    2. The data: who is learning, the stages, the guided courses
    3. Days
    4. What is saved
    5. The memory: cards and boxes
    6. The path: stages, steps and the next step
    7. Today's session
    8. Building the page
    9. Clicks
   10. The study window (js/learn-play.js) and what it gets
   11. Following what the learner does elsewhere
   12. The card on the home page
   13. Ctrl+K commands, the site search and the public API
   Progress events (A.track):
     learn.setup { who, start, goal }      the three questions are answered
     learn.placement { start }             the level check is finished
     learn.review { kind, cards, right }   a memory check ("review") or a practice ("practice") ends
     learn.test { stage, score, total, star }   a stage test ends
     learn.unit { course, unit, first, total }  a guided step is finished
                                           (first: right on the first try, of total tasks)
     learn.explain { n, score }            a lesson is explained back (score: 0-3 key ideas)
     learn.session { day }                 every step of today's session is done
   Saved in this browser only (A.storage, as "aic:" + the key):
     learn.profile   { v: 1, who, start, goal, since, placed }
     learn.memory    { v: 1, items: { "q12": [box, dueDay, seen, right] } }
     learn.units     { v: 1, done: { z1: [day, first, total] }, tests: { basics: [best, total, star, day] } }
     learn.explain   { v: 1, lessons: { "3": [day, score, text] } }
     learn.days      { v: 1, days: { "20408": { r, n, l, e, f } }, before }
                     (the last 400 days; n, l and e name what was done: "unit:z1",
                     the experiment, the lesson; before: the learning days older than that)
     learn.placed    { day, start, scores }   a level check taken before the three
                     questions: kept until they are answered, then it moves into the profile
   Texts and data: js/content/learn.js. Styles: css/learn.css.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="learn"]');
    const data = A && A.content.get("learn");
    if (!A || !mount || !data) return;

    const t = A.t;
    const esc = A.escapeHTML;
    const num = A.format.number;

    // ---------- 1. Settings ----------
    const DAY_STARTS_AT = 4;              // like My Compass: a new day starts at 4 a.m.
    const DAY_MS = 86400000;
    const DAYS_KEPT = 400;                // days of "what was done" that are kept (older ones are only counted)
    const FORECAST_DAYS = 14;             // the Pro design shows the reviews of the next two weeks
    const SEED_SPREAD = 3;                // lessons finished before the path existed: their cards are spread over 3 days
    const STRONG_SHARE = 0.6;             // a topic is "strong" from this share of its full strength
    const EXPLAIN_GOOD = 2;               // a lesson counts as explained with 2 of its 3 key ideas
    const EXPLAIN_MAX = 1200;             // letters of an explanation that are kept
    const PLAY_SCRIPT = "js/learn-play.js";
    const PLAY_STYLE = "css/learn-play.css";

    // ---------- 2. The data: who is learning, the stages, the guided courses ----------
    const PROFILES = data.profiles;
    const GOALS = data.goals;
    const STAGES = data.stages;
    const COURSES = data.courses;
    const BOX_DAYS = data.boxDays;
    const TOP_BOX = BOX_DAYS.length;
    const STARTS = ["zero", "some", "check"];

    const PROFILE_BY_ID = {};
    PROFILES.forEach(function (profile) { PROFILE_BY_ID[profile.id] = profile; });
    const STAGE_BY_ID = {};
    STAGES.forEach(function (stage, index) {
        stage.index = index;
        STAGE_BY_ID[stage.id] = stage;
    });
    // Every unit of every guided course: { id, icon, minutes, cards, course, stage, index }
    const UNIT_BY_ID = {};
    STAGES.forEach(function (stage) {
        if (!stage.course || !COURSES[stage.course]) return;
        COURSES[stage.course].units.forEach(function (unit, index) {
            UNIT_BY_ID[unit.id] = Object.assign({ course: stage.course, stage: stage.id, index: index }, unit);
        });
    });

    function has(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    function isObject(value) {
        return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function whole(value) {
        return Number.isInteger(value) && value >= 0;
    }

    // ---------- 3. Days ----------
    // A day is a whole number (days since 1970, local time, starting at 4 a.m.), so
    // "in 4 days" is simply + 4.
    function dayOf(time) {
        const date = new Date(time - DAY_STARTS_AT * 3600000);
        return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
    }

    function today() {
        return dayOf(Date.now());
    }

    // "today", "tomorrow", "in 4 days"
    function whenText(day) {
        const wait = day - today();
        if (wait <= 0) return t("learn.when.today");
        if (wait === 1) return t("learn.when.tomorrow");
        return A.plural("learn.when.days", wait);
    }

    // ---------- 4. What is saved ----------
    let canSave = A.storage.available();

    // What this tab last read or wrote under each key, as text: this is how it notices
    // that another tab has saved since (see takeSaved below)
    const KEYS = ["learn.profile", "learn.memory", "learn.units", "learn.explain", "learn.days"];
    const lastSeen = {};

    function save(key, value) {
        canSave = A.storage.set(key, value) !== false && A.storage.available();
        lastSeen[key] = JSON.stringify(value);
    }

    // Who is learning (null until the three questions are answered)
    function readProfile() {
        const saved = A.storage.get("learn.profile", null);
        if (!isObject(saved) || saved.v !== 1 || !has(PROFILE_BY_ID, saved.who)) return null;
        const placed = isObject(saved.placed) && has(STAGE_BY_ID, saved.placed.start) ? {
            day: whole(saved.placed.day) ? saved.placed.day : today(),
            start: saved.placed.start,
            scores: isObject(saved.placed.scores) ? saved.placed.scores : {}
        } : null;
        return {
            v: 1,
            who: saved.who,
            start: STARTS.indexOf(saved.start) !== -1 ? saved.start : "some",
            goal: GOALS.indexOf(saved.goal) !== -1 ? saved.goal : PROFILE_BY_ID[saved.who].goal,
            since: whole(saved.since) ? saved.since : today(),
            placed: placed
        };
    }

    let profile = readProfile();

    // The cards: { id: [box, dueDay, seen, right] }. Boxes 1-6 wait 1, 2, 4... days;
    // a new card starts in box 1.
    function readMemory() {
        const saved = A.storage.get("learn.memory", null);
        const items = {};
        if (isObject(saved) && saved.v === 1 && isObject(saved.items)) {
            Object.keys(saved.items).forEach(function (id) {
                const item = saved.items[id];
                if (!Array.isArray(item) || !whole(item[0]) || item[0] > TOP_BOX || !whole(item[1])) return;
                items[id] = [Math.max(1, item[0]), item[1], whole(item[2]) ? item[2] : 0, whole(item[3]) ? item[3] : 0];
            });
            return { fresh: false, items: items };
        }
        return { fresh: true, items: items };
    }

    const memoryState = readMemory();
    const items = memoryState.items;

    function saveMemory() {
        save("learn.memory", { v: 1, items: items });
    }

    // The guided steps that are finished, and the stage tests
    function readUnits() {
        const saved = A.storage.get("learn.units", null);
        const state = { done: {}, tests: {} };
        if (!isObject(saved) || saved.v !== 1) return state;
        if (isObject(saved.done)) {
            Object.keys(saved.done).forEach(function (id) {
                const row = saved.done[id];
                if (has(UNIT_BY_ID, id) && Array.isArray(row) && whole(row[0])) state.done[id] = [row[0], whole(row[1]) ? row[1] : 0, whole(row[2]) ? row[2] : 0];
            });
        }
        if (isObject(saved.tests)) {
            Object.keys(saved.tests).forEach(function (id) {
                const row = saved.tests[id];
                if (has(STAGE_BY_ID, id) && Array.isArray(row) && whole(row[0]) && whole(row[1])) state.tests[id] = [row[0], row[1], row[2] === true, whole(row[3]) ? row[3] : 0];
            });
        }
        return state;
    }

    const units = readUnits();

    function saveUnits() {
        save("learn.units", { v: 1, done: units.done, tests: units.tests });
    }

    // The lessons explained back: { "3": [day, score, text] }
    function readExplained() {
        const saved = A.storage.get("learn.explain", null);
        const lessons = {};
        if (isObject(saved) && saved.v === 1 && isObject(saved.lessons)) {
            Object.keys(saved.lessons).forEach(function (n) {
                const row = saved.lessons[n];
                if (Array.isArray(row) && whole(row[0]) && whole(row[1])) lessons[n] = [row[0], Math.min(3, row[1]), typeof row[2] === "string" ? row[2].slice(0, EXPLAIN_MAX) : ""];
            });
        }
        return lessons;
    }

    const explained = readExplained();

    // What was done on each day: r (memory check), n (a step of the path),
    // l (the lab), e (explained back), f (the whole session; said once).
    // n, l and e name the first thing of that kind done that day ("unit:z1",
    // "lesson:3" or "test:basics"; the experiment; the lesson's number), so that
    // today's session shows what was done. Older saves have 1 there.
    function isLearningDay(record) {
        return Boolean(record && (record.r || record.n || record.l || record.e));
    }

    let daysBefore = 0;      // the learning days older than DAYS_KEPT: no longer listed, still counted

    function readDays() {
        const saved = A.storage.get("learn.days", null);
        const days = {};
        daysBefore = 0;
        if (isObject(saved) && saved.v === 1 && isObject(saved.days)) {
            const oldest = today() - DAYS_KEPT;
            daysBefore = whole(saved.before) ? saved.before : 0;
            Object.keys(saved.days).forEach(function (key) {
                const record = saved.days[key];
                if (!whole(Number(key)) || !isObject(record)) return;
                if (Number(key) >= oldest) days[key] = record;
                else if (isLearningDay(record)) daysBefore += 1;
            });
        }
        return days;
    }

    const days = readDays();

    function saveDays() {
        save("learn.days", { v: 1, days: days, before: daysBefore });
    }

    KEYS.forEach(function (key) { lastSeen[key] = JSON.stringify(A.storage.get(key, null)); });

    // The site may be open in two tabs (or a tab stayed open since yesterday). Each tab
    // keeps its own copy of what is saved, and a save writes the whole copy: without
    // this, a step finished in one tab would be written over by the old copy of the
    // other. So before every change, when another tab saves and when this tab is shown
    // again, the tab takes what is saved now. (js/journey.js does the same for the
    // points.) True if something was different.
    function replaceAll(target, source) {
        Object.keys(target).forEach(function (key) { delete target[key]; });
        Object.assign(target, source);
    }

    function takeSaved() {
        let changed = false;
        KEYS.forEach(function (key) {
            const now = JSON.stringify(A.storage.get(key, null));
            if (now === lastSeen[key]) return;
            lastSeen[key] = now;
            changed = true;
            if (key === "learn.profile") {
                profile = readProfile();
            } else if (key === "learn.memory") {
                const memory = readMemory();
                replaceAll(items, memory.items);
                memoryState.fresh = memory.fresh;
            } else if (key === "learn.units") {
                const saved = readUnits();
                replaceAll(units.done, saved.done);
                replaceAll(units.tests, saved.tests);
            } else if (key === "learn.explain") {
                replaceAll(explained, readExplained());
            } else {
                replaceAll(days, readDays());
            }
        });
        return changed;
    }

    function dayRecord(day) {
        return has(days, String(day)) ? days[String(day)] : {};
    }

    // Marks one thing as done today: "r", "n", "l" or "e", with what it was
    // (a step's key, an experiment, a lesson's number) when there is one
    function markToday(what, which) {
        takeSaved();
        const key = String(today());
        if (!has(days, key)) days[key] = {};
        if (days[key][what]) return;
        days[key][what] = which || 1;
        saveDays();
    }

    // The days in a row with something learned (today may still be empty)
    function streak() {
        let day = today();
        if (!isLearningDay(dayRecord(day))) day -= 1;
        let count = 0;
        while (isLearningDay(dayRecord(day))) {
            count += 1;
            day -= 1;
        }
        return count;
    }

    function learningDays() {
        return daysBefore + Object.keys(days).filter(function (key) { return isLearningDay(days[key]); }).length;
    }

    // ---------- 5. The memory: cards and boxes ----------
    // A card is a question of the quiz ("q12", or a "Myth or fact" statement, "m3")
    // or a task of a guided step ("z1a": unit z1, card a). Its box and its day
    // are in "items". The questions themselves stay where they are (the quiz's
    // texts, the course files): the study window asks for them when it shows one.
    let quizCards = null;      // { id: { lesson, topic } }, from the quiz, once it is there

    function quizBank() {
        if (quizCards) return quizCards;
        if (!A.quiz || typeof A.quiz.bank !== "function") return {};
        quizCards = {};
        A.util.attempt(function () {
            A.quiz.bank().forEach(function (question) {
                quizCards[question.id] = { lesson: question.lesson, topic: question.topic, myth: false };
            });
            A.quiz.bank("myths").forEach(function (myth) {
                quizCards[myth.id] = { lesson: myth.lesson, topic: myth.topic || "myth", myth: true };
            });
        });
        return quizCards;
    }

    // The unit of a course card: "z1a" -> "z1" ("" when it is not one, also for a
    // letter past the unit's cards: a card left by an older version of a course)
    function unitOfCard(id) {
        const match = /^([a-z]+\d+)([a-z])$/.exec(id);
        if (!match || !has(UNIT_BY_ID, match[1])) return "";
        return match[2].charCodeAt(0) - 97 < (UNIT_BY_ID[match[1]].cards || 0) ? match[1] : "";
    }

    // What a card is about: { id, kind: "quiz" | "course", topic, lesson, unit, course }, or null
    function cardInfo(id) {
        const bank = quizBank();
        if (has(bank, id)) {
            return { id: id, kind: "quiz", topic: bank[id].topic, lesson: bank[id].lesson, myth: bank[id].myth, unit: "", course: "" };
        }
        const unit = unitOfCard(id);
        if (unit) {
            const course = UNIT_BY_ID[unit].course;
            return { id: id, kind: "course", topic: COURSES[course].topic, lesson: 0, myth: false, unit: unit, course: course };
        }
        return null;
    }

    function topicName(topic) {
        if (A.has("learn.topic." + topic)) return t("learn.topic." + topic);
        return A.has("quiz.topic." + topic) ? t("quiz.topic." + topic) : topic;
    }

    // The quiz cards of a lesson (its questions, then its "Myth or fact" statements)
    function lessonCards(n) {
        const bank = quizBank();
        return Object.keys(bank).filter(function (id) { return bank[id].lesson === n; });
    }

    // The cards of a guided unit: "z1a", "z1b"... (how many: "cards" in the data)
    function unitCards(unitId) {
        const unit = UNIT_BY_ID[unitId];
        const ids = [];
        for (let i = 0; unit && i < (unit.cards || 0); i++) ids.push(unitId + String.fromCharCode(97 + i));
        return ids;
    }

    // New cards: they start in box 1 and are ready after "wait" days (1: tomorrow).
    // Returns how many were really new.
    function addCards(ids, wait) {
        takeSaved();
        let added = 0;
        ids.forEach(function (id) {
            if (has(items, id) || !cardInfo(id)) return;
            items[id] = [1, today() + (wait === undefined ? 1 : wait), 0, 0];
            added += 1;
        });
        if (added) saveMemory();
        return added;
    }

    // An answer to a card, wherever it was given (the memory check, a test, the quiz):
    // - wrong: back to box 1, it returns tomorrow;
    // - right on or after its day: one box up, it returns after that box's days;
    // - right before its day (extra practice, a test on the day it was learned): it
    //   keeps its place. Only an answer after the wait shows that it was remembered,
    //   so practising ten times in one evening cannot push a card to the last box.
    // A card that is not in the memory yet enters it in box 1.
    // Returns { box, wait }: the card's box now and the days until it comes back.
    function answerCard(id, correct) {
        if (!cardInfo(id)) return null;
        takeSaved();
        const now = today();
        const known = has(items, id);
        const item = known ? items[id] : [0, now, 0, 0];
        let box = item[0];
        let due = item[1];
        if (!correct) {
            box = 1;
            due = now + BOX_DAYS[0];
        } else if (!known || due <= now) {
            box = Math.min(TOP_BOX, box + 1);
            due = now + BOX_DAYS[box - 1];
        }
        items[id] = [box, due, item[2] + 1, item[3] + (correct ? 1 : 0)];
        saveMemory();
        return { box: box, wait: Math.max(1, due - now) };
    }

    // The cards that are ready on a day: the longest waiting first, then the weakest
    function dueCards(day) {
        const limit = day === undefined ? today() : day;
        return Object.keys(items).filter(function (id) {
            return items[id][1] <= limit && cardInfo(id);
        }).sort(function (a, b) {
            return items[a][1] - items[b][1] || items[a][0] - items[b][0] || (a < b ? -1 : 1);
        });
    }

    // The numbers of the memory: cards, ready today, strong, answers, each box, the next days
    function memoryStats() {
        const now = today();
        const stats = { total: 0, due: 0, strong: 0, seen: 0, right: 0, boxes: [], forecast: [], next: 0 };
        for (let box = 0; box <= TOP_BOX; box++) stats.boxes.push(0);
        for (let day = 0; day < FORECAST_DAYS; day++) stats.forecast.push(0);
        Object.keys(items).forEach(function (id) {
            if (!cardInfo(id)) return;
            const item = items[id];
            stats.total += 1;
            stats.boxes[item[0]] += 1;
            stats.seen += item[2];
            stats.right += item[3];
            if (item[0] >= data.strongBox) stats.strong += 1;
            const wait = Math.max(0, item[1] - now);
            if (wait === 0) stats.due += 1;
            else if (!stats.next || item[1] < stats.next) stats.next = item[1];
            if (wait < FORECAST_DAYS) stats.forecast[wait] += 1;
        });
        return stats;
    }

    // Each topic: how many cards it has, how many are in memory, and how strong they
    // are (0-1: every card in the top box is 1). Topics with cards in memory come first.
    function topicStats() {
        const topics = {};
        const row = function (topic) {
            if (!has(topics, topic)) topics[topic] = { topic: topic, total: 0, known: 0, strength: 0, due: 0 };
            return topics[topic];
        };
        const bank = quizBank();
        Object.keys(bank).forEach(function (id) { row(bank[id].topic).total += 1; });
        Object.keys(UNIT_BY_ID).forEach(function (unitId) {
            row(COURSES[UNIT_BY_ID[unitId].course].topic).total += UNIT_BY_ID[unitId].cards || 0;
        });
        const now = today();
        Object.keys(items).forEach(function (id) {
            const info = cardInfo(id);
            if (!info) return;
            const topic = row(info.topic);
            topic.known += 1;
            topic.strength += items[id][0] / TOP_BOX;
            if (items[id][1] <= now) topic.due += 1;
        });
        return Object.keys(topics).map(function (key) {
            const topic = topics[key];
            const share = topic.total ? topic.strength / topic.total : 0;
            return {
                topic: topic.topic,
                name: topicName(topic.topic),
                total: topic.total,
                known: topic.known,
                due: topic.due,
                share: share,
                state: !topic.known ? "new" : (share >= STRONG_SHARE ? "strong" : "learning")
            };
        }).filter(function (topic) { return topic.total > 0; }).sort(function (a, b) {
            return (b.known > 0) - (a.known > 0) || a.share - b.share || (a.name < b.name ? -1 : 1);
        });
    }

    // The first time the memory is used: the lessons that are already finished
    // give their cards, spread over a few days so the first check stays short.
    function seedMemory() {
        takeSaved();
        if (!memoryState.fresh || !A.lessons) return;
        memoryState.fresh = false;
        const finished = A.util.attempt(function () { return A.lessons.completed(); }, []);
        finished.forEach(function (n, index) {
            addCards(lessonCards(n), index % SEED_SPREAD);
        });
        saveMemory();
    }

    // How many cards one memory check has (from the minutes a day)
    function sessionSize() {
        const goal = profile ? profile.goal : GOALS[1];
        return data.sessionCards[goal] || 8;
    }

    // The cards of a session:
    //   review     the cards that are ready today
    //   more       the weakest cards, ready or not (extra practice)
    //   topic      the cards of one topic: ready ones, then weak ones, then new ones
    function sessionCards(kind, topic) {
        const size = sessionSize();
        if (kind === "review") return dueCards().slice(0, size);
        const pool = Object.keys(items).filter(function (id) {
            const info = cardInfo(id);
            return info && (kind !== "topic" || info.topic === topic);
        }).sort(function (a, b) {
            return items[a][0] - items[b][0] || items[a][1] - items[b][1] || (a < b ? -1 : 1);
        });
        if (kind === "topic" && pool.length < size) {
            // Cards of the topic that are not in memory yet (a first try teaches too)
            const bank = quizBank();
            Object.keys(bank).forEach(function (id) {
                if (pool.length < size && bank[id].topic === topic && !has(items, id)) pool.push(id);
            });
            Object.keys(UNIT_BY_ID).forEach(function (unitId) {
                if (COURSES[UNIT_BY_ID[unitId].course].topic !== topic) return;
                unitCards(unitId).forEach(function (id) {
                    if (pool.length < size && !has(items, id)) pool.push(id);
                });
            });
        }
        return pool.slice(0, size);
    }

    // ---------- 6. The path: stages, steps and the next step ----------
    function lessonsApi() {
        return A.lessons && typeof A.lessons.tracks === "function" ? A.lessons : null;
    }

    // The lessons of a track, in order: [{ number, icon, minutes, title, experiment }]
    function trackLessons(trackId) {
        const api = lessonsApi();
        if (!api) return [];
        const track = api.tracks().filter(function (item) { return item.id === trackId; })[0];
        if (!track) return [];
        const list = api.list();
        return track.lessons.map(function (n) { return list[n - 1]; }).filter(Boolean);
    }

    function testPass() {
        return Math.ceil(data.test.questions * data.test.pass);
    }

    // The cards a stage test chooses from
    function stageCards(stage) {
        if (stage.track) {
            const bank = quizBank();
            const numbers = trackLessons(stage.track).map(function (lesson) { return lesson.number; });
            return Object.keys(bank).filter(function (id) { return !bank[id].myth && numbers.indexOf(bank[id].lesson) !== -1; });
        }
        let ids = [];
        COURSES[stage.course].units.forEach(function (unit) { ids = ids.concat(unitCards(unit.id)); });
        return ids;
    }

    // The steps of a stage, in order. Each one:
    //   { key: "lesson:3" | "unit:z1" | "test:basics", kind, icon, title, minutes, done, number, unit }
    function stageSteps(stage) {
        const steps = [];
        if (stage.track) {
            trackLessons(stage.track).forEach(function (lesson) {
                steps.push({
                    key: "lesson:" + lesson.number, kind: "lesson", icon: lesson.icon, number: lesson.number,
                    title: lesson.title(), minutes: lesson.minutes,
                    done: A.lessons.isCompleted(lesson.number)
                });
            });
        } else if (stage.course && COURSES[stage.course]) {
            COURSES[stage.course].units.forEach(function (unit) {
                steps.push({
                    key: "unit:" + unit.id, kind: "guide", icon: unit.icon, unit: unit.id,
                    title: t("learn.unit." + unit.id), text: t("learn.unit." + unit.id + ".text"), minutes: unit.minutes,
                    done: has(units.done, unit.id)
                });
            });
        }
        if (steps.length && stageCards(stage).length >= data.test.questions) {
            const test = units.tests[stage.id];
            steps.push({
                key: "test:" + stage.id, kind: "test", icon: "⭐", stage: stage.id,
                title: t("learn.path.test"), minutes: 3,
                done: Boolean(test && test[2]), best: test ? test[0] : null, total: test ? test[1] : data.test.questions
            });
        }
        return steps;
    }

    // Where the path begins: the stage's place in the list
    function startIndex() {
        if (!profile) return 1;
        if (profile.start === "zero") return 0;
        if (profile.start === "check" && profile.placed) return STAGE_BY_ID[profile.placed.start].index;
        return 1;
    }

    // The whole path: every stage with its steps, its state and the next step
    //   state: "done", "start" (the path is here, nothing done yet), "progress",
    //          "known" (before the start, untouched) or "later"
    function buildPath() {
        const start = startIndex();
        const stages = STAGES.map(function (stage) {
            const steps = stageSteps(stage);
            const done = steps.filter(function (step) { return step.done; }).length;
            return { stage: stage, steps: steps, done: done, total: steps.length, state: "later", star: Boolean(units.tests[stage.id] && units.tests[stage.id][2]) };
        });
        // The next step: the first one not done from the start on, then the ones before it
        const order = stages.slice(start).concat(stages.slice(0, start));
        let next = null;
        order.some(function (entry) {
            const step = entry.steps.filter(function (item) { return !item.done; })[0];
            if (step) next = { stage: entry.stage.id, step: step };
            return Boolean(step);
        });
        stages.forEach(function (entry, index) {
            if (entry.total && entry.done === entry.total) entry.state = "done";
            else if (next && next.stage === entry.stage.id) entry.state = entry.done ? "progress" : "start";
            else if (entry.done) entry.state = "progress";
            else if (index < start) entry.state = "known";
        });
        return { stages: stages, next: next, start: start };
    }

    // ---------- 7. Today's session ----------
    // The lab experiment to try today: the one of the newest finished lesson that
    // was not tried yet, otherwise any experiment not tried yet.
    function labToTry() {
        const api = lessonsApi();
        const list = A.lab && typeof A.lab.list === "function" ? A.util.attempt(function () { return A.lab.list(); }, []) : [];
        if (!list.length) return null;
        const tried = A.storage.get("lab.tried", []);
        const fresh = function (id) { return !Array.isArray(tried) || tried.indexOf(id) === -1; };
        const byId = {};
        list.forEach(function (entry) { byId[entry.id] = entry; });
        if (api) {
            const finished = api.completed().slice().reverse();
            const lessons = api.list();
            for (let i = 0; i < finished.length; i++) {
                const lesson = lessons[finished[i] - 1];
                if (lesson && lesson.experiment && byId[lesson.experiment] && fresh(lesson.experiment)) return byId[lesson.experiment];
            }
        }
        return list.filter(function (entry) { return fresh(entry.id); })[0] || null;
    }

    // The lesson to explain back today: the newest finished one not explained well yet
    function lessonToExplain() {
        const api = lessonsApi();
        if (!api) return 0;
        const finished = api.completed().slice().reverse();
        for (let i = 0; i < finished.length; i++) {
            const row = explained[String(finished[i])];
            if (!row || row[1] < EXPLAIN_GOOD) return finished[i];
        }
        return 0;
    }

    // A step of the path by its key ("unit:z1", "lesson:3", "test:basics"), or null
    function stepByKey(path, key) {
        if (typeof key !== "string") return null;
        let found = null;
        path.stages.some(function (entry) {
            found = entry.steps.filter(function (step) { return step.key === key; })[0] || null;
            return Boolean(found);
        });
        return found;
    }

    // An experiment of the AI Lab by its id, or null
    function labById(id) {
        if (typeof id !== "string" || !A.lab || typeof A.lab.list !== "function") return null;
        return A.util.attempt(function () { return A.lab.list(); }, []).filter(function (entry) { return entry.id === id; })[0] || null;
    }

    // Today's steps: [{ id: "review" | "next" | "lab" | "explain", title, text, done, minutes, ... }]
    function todayPlan(path) {
        const record = dayRecord(today());
        const steps = [];
        const due = dueCards().length;
        const goal = profile ? profile.goal : GOALS[1];
        if (due || record.r) {
            const count = Math.min(due, sessionSize());
            steps.push({
                id: "review", icon: "🧠", title: t("learn.today.review"),
                text: record.r && !due ? "" : A.plural("learn.today.review.text", count),
                done: Boolean(record.r) && !due, minutes: data.minutes.review
            });
        }
        // A row that is done names what was done today (an older save does not say),
        // not the step that would come next
        if (path.next || record.n) {
            const step = record.n ? stepByKey(path, record.n) : path.next.step;
            steps.push({
                id: "next", icon: step ? step.icon : "🧭", title: t(record.n ? "learn.today.nextDone" : "learn.today.next"),
                text: step ? step.title : "", done: Boolean(record.n), minutes: step ? step.minutes : 0, step: step
            });
        }
        if (goal >= GOALS[1]) {
            const lab = record.l ? labById(record.l) : labToTry();
            if (lab || record.l) {
                steps.push({
                    id: "lab", icon: lab ? lab.icon : "🧪", title: t("learn.today.lab"),
                    text: lab ? t("learn.today.lab.text", { title: t(lab.titleKey) }) : "",
                    done: Boolean(record.l), minutes: data.minutes.lab, lab: lab ? lab.id : ""
                });
            }
        }
        if (goal >= GOALS[GOALS.length - 1]) {
            const told = /^lesson:(\d+)$/.exec(typeof record.e === "string" ? record.e : "");
            const n = record.e ? (told && A.lessons && A.lessons.title(Number(told[1])) ? Number(told[1]) : 0) : lessonToExplain();
            if (n || record.e) {
                steps.push({
                    id: "explain", icon: "🗣️", title: t("learn.today.explain"),
                    text: n ? t("learn.today.explain.text", { n: num(n), title: A.lessons.title(n) }) : "",
                    done: Boolean(record.e), minutes: data.minutes.explain, lesson: n
                });
            }
        }
        const done = steps.filter(function (step) { return step.done; }).length;
        return {
            steps: steps,
            done: done,
            total: steps.length,
            complete: steps.length > 0 && done === steps.length,
            minutes: steps.reduce(function (sum, step) { return sum + (step.done ? 0 : step.minutes); }, 0),
            first: steps.filter(function (step) { return !step.done; })[0] || null
        };
    }

    // Once every step of today is done: say it, once
    function checkSession() {
        takeSaved();
        if (!profile) return;
        const plan = todayPlan(buildPath());
        const key = String(today());
        if (!plan.complete || (has(days, key) && days[key].f)) return;
        if (!has(days, key)) days[key] = {};
        days[key].f = 1;
        saveDays();
        A.track("learn.session", { day: today() });
        A.toast(t("learn.toast.session"), "🎉");
    }

    // ---------- 8. Building the page ----------
    let ui = null;                     // the parts of the page (null until it is built)
    const openStages = new Set();      // the stages whose steps are shown
    let stagesChosen = false;          // false: the stage of the next step opens by itself
    // The three questions: which one is shown, and the answers so far
    const wizard = { open: false, step: 1, who: "", start: "", goal: 0 };
    // A level check finished before the three questions: its result waits for them,
    // also over a reload (as learn.placed), and "Find my level" is already chosen
    let pendingPlaced = readPending();
    if (pendingPlaced) wizard.start = "check";

    function readPending() {
        if (profile) return null;
        const saved = A.storage.get("learn.placed", null);
        if (!isObject(saved) || !has(STAGE_BY_ID, saved.start)) return null;
        return { day: whole(saved.day) ? saved.day : today(), start: saved.start, scores: isObject(saved.scores) ? saved.scores : {} };
    }

    function ref(name) {
        return mount.querySelector('[data-ref="' + name + '"]');
    }

    function build() {
        mount.innerHTML =
            '<div class="lp">' +
                '<section class="lp-setup card" data-ref="setup" aria-labelledby="lp-setup-title" hidden></section>' +
                '<div class="lp-main" data-ref="main" hidden>' +
                    '<div class="lp-me" data-ref="me"></div>' +
                    '<section class="lp-today card" data-ref="today" aria-labelledby="lp-today-title"></section>' +
                    '<section class="lp-path" data-ref="path" aria-labelledby="lp-path-title"></section>' +
                    '<section class="lp-skills card" data-ref="skills" aria-labelledby="lp-skills-title"></section>' +
                "</div>" +
                '<div class="lp-about" data-ref="about"></div>' +
                '<p class="lp-note" data-ref="note"></p>' +
                '<p class="sr-only" aria-live="polite" data-ref="live"></p>' +
            "</div>";
        ui = {
            setup: ref("setup"), main: ref("main"), me: ref("me"), today: ref("today"),
            path: ref("path"), skills: ref("skills"), about: ref("about"), note: ref("note"), live: ref("live")
        };
        mount.addEventListener("click", onClick);
        seedMemory();
        render();
    }

    // Draws a block again and keeps the keyboard focus on the same button
    function redraw(element, html) {
        const active = document.activeElement;
        const fid = active && element.contains(active) ? active.getAttribute("data-fid") : "";
        element.innerHTML = html;
        if (!fid) return;
        const again = element.querySelector('[data-fid="' + fid + '"]');
        if (again) {
            again.focus({ preventScroll: true });
            return;
        }
        // The button is gone (its step is done): the block's heading takes the focus,
        // so the next press of Tab continues from there (a block without one: its
        // first button)
        const heading = element.querySelector("h3");
        if (heading) heading.setAttribute("tabindex", "-1");
        const target = heading || element.querySelector("button");
        if (target) target.focus({ preventScroll: true });
    }

    // Brings the top of a part of the page onto the screen when it is above it or
    // low down. (When the three questions close, a phone's browser keeps the block
    // below them in place and would land far down the page.)
    function showTop(element) {
        if (!element || element.hidden) return;
        const box = element.getBoundingClientRect();
        const room = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        // At once: a smooth scroll would first show where the browser jumped to
        if (box.top < room || box.top > window.innerHeight * 0.6) element.scrollIntoView({ block: "start", behavior: "instant" });
        else window.scrollTo({ top: window.scrollY, behavior: "instant" });   // stops a smooth scroll still running (a Tab just before)
    }

    // ----- The three questions -----
    function choiceHTML(action, value, icon, title, small, text, chosen) {
        return '<button type="button" class="lp-choice' + (chosen ? " is-chosen" : "") + '" data-lp="' + action + '" data-value="' + esc(String(value)) + '"' +
                ' data-fid="' + action + "-" + esc(String(value)) + '" aria-pressed="' + chosen + '">' +
            (icon ? '<span class="lp-choice-icon" aria-hidden="true">' + icon + "</span>" : "") +
            '<span class="lp-choice-body">' +
                '<span class="lp-choice-title">' + esc(title) + (small ? ' <span class="lp-choice-small">' + esc(small) + "</span>" : "") + "</span>" +
                '<span class="lp-choice-text">' + esc(text) + "</span>" +
            "</span>" +
        "</button>";
    }

    function setupHTML() {
        let title = "";
        let text = "";
        let choices = "";
        if (wizard.step === 1) {
            title = t("learn.setup.whoTitle");
            text = t("learn.setup.whoText");
            choices = PROFILES.map(function (item) {
                return choiceHTML("who", item.id, item.icon, t("learn.who." + item.id), t("learn.who." + item.id + ".age"),
                    t("learn.who." + item.id + ".text"), wizard.who === item.id);
            }).join("");
        } else if (wizard.step === 2) {
            title = t("learn.setup.startTitle");
            text = t("learn.setup.startText");
            const icons = { zero: "🐣", some: "🌱", check: "🎯" };
            const placedNow = pendingPlaced || (profile ? profile.placed : null);
            choices = STARTS.map(function (id) {
                // "Find my level" after a check: where the path starts (it is not asked again)
                const about = id !== "check" ? t("learn.start." + id + ".text") : (placedNow
                    ? t("learn.start.check.done", { stage: t("learn.stage." + placedNow.start) })
                    : A.plural("learn.start.check.text", placementQuestions(wizard.who)));
                return choiceHTML("start", id, icons[id], t("learn.start." + id), "", about, wizard.start === id);
            }).join("");
        } else {
            title = t("learn.setup.goalTitle");
            text = t("learn.setup.goalText");
            choices = GOALS.map(function (goal) {
                return choiceHTML("goal", goal, "⏱️", t("learn.goal." + goal), "", t("learn.goal." + goal + ".text"), wizard.goal === goal);
            }).join("");
        }
        const ready = wizard.step === 3 && wizard.goal;
        return '<p class="lp-kicker mono">' + esc(t("learn.setup.kicker", { n: num(wizard.step) })) + "</p>" +
            '<div class="lp-setup-dots" aria-hidden="true">' + [1, 2, 3].map(function (n) {
                return '<span class="' + (n === wizard.step ? "is-now" : (n < wizard.step ? "is-done" : "")) + '"></span>';
            }).join("") + "</div>" +
            '<h3 class="lp-setup-title" id="lp-setup-title" tabindex="-1">' + esc(title) + "</h3>" +
            '<p class="lp-setup-text">' + esc(text) + "</p>" +
            '<div class="lp-choices lp-choices-' + wizard.step + '" role="group" aria-labelledby="lp-setup-title">' + choices + "</div>" +
            '<div class="lp-setup-nav">' +
                (wizard.step > 1 || profile
                    ? '<button type="button" class="btn btn-ghost btn-small" data-lp="setup-back" data-fid="setup-back">' + esc(t("learn.setup.back")) + "</button>"
                    : "<span></span>") +
                (wizard.step === 3
                    ? '<button type="button" class="btn btn-primary" data-lp="setup-finish" data-fid="setup-finish"' + (ready ? "" : ' aria-disabled="true"') + ">" +
                        esc(t(wizard.start === "check" && !(pendingPlaced || (profile && profile.placed)) ? "learn.setup.finishCheck" : "learn.setup.finish")) + "</button>"
                    : "") +
            "</div>" +
            '<p class="lp-setup-privacy"><span aria-hidden="true">🔒</span> ' + esc(t("learn.setup.privacy")) + "</p>";
    }

    function openWizard() {
        wizard.open = true;
        wizard.step = 1;
        wizard.who = profile ? profile.who : "";
        wizard.start = profile ? profile.start : "";
        wizard.goal = profile ? profile.goal : 0;
        // "Change" starts from the saved profile: a result kept in memory from before the
        // path (another tab may have built it) must not win over profile.placed
        if (profile) pendingPlaced = null;
        render();
        focusSetup();
    }

    function focusSetup() {
        const title = ui && ui.setup.querySelector(".lp-setup-title");
        if (!title) return;
        title.focus({ preventScroll: true });
        showTop(ui.setup);
    }

    // ----- Who is learning -----
    function meHTML() {
        const who = PROFILE_BY_ID[profile.who];
        const row = streak();
        const count = learningDays();
        let daysText = t("learn.me.noDays");
        if (row >= 2) daysText = A.plural("learn.me.streak", row);
        else if (count) daysText = A.plural("learn.me.days", count);
        let tip = "";
        if (profile.start === "check" && !profile.placed) {
            tip = '<p class="lp-me-tip"><span aria-hidden="true">🎯</span> ' + esc(A.plural("learn.start.check.text", placementQuestions(profile.who))) +
                ' <button type="button" class="lp-link" data-lp="level" data-fid="level">' + esc(t("learn.setup.finishCheck")) + "</button></p>";
        } else if (profile.who === "kid") {
            tip = '<p class="lp-me-tip"><span aria-hidden="true">🔊</span> ' + esc(t("learn.me.kidTip")) + "</p>";
        } else if (profile.who === "pro" && A.settings && A.settings.get("design") !== "pro") {
            tip = '<p class="lp-me-tip"><span aria-hidden="true">🛰️</span> ' + esc(t("learn.me.proTip")) +
                ' <button type="button" class="lp-link" data-lp="to-pro" data-fid="to-pro">' + esc(t("learn.me.proButton")) + "</button></p>";
        } else if (profile.who === "teacher" && document.getElementById("teachers") && !document.getElementById("teachers").hidden) {
            tip = '<p class="lp-me-tip"><span aria-hidden="true">🍎</span> ' + esc(t("learn.me.teacherTip")) +
                ' <button type="button" class="lp-link" data-lp="to-teachers" data-fid="to-teachers">' + esc(t("learn.me.teacherButton")) + "</button></p>";
        }
        return '<div class="lp-me-row">' +
                '<span class="lp-me-icon" aria-hidden="true">' + who.icon + "</span>" +
                '<p class="lp-me-who"><span class="lp-me-label mono">' + esc(t("learn.me.as")) + "</span>" +
                    "<strong>" + esc(t("learn.who." + who.id)) + "</strong>" +
                    '<span class="lp-me-goal"> · ' + esc(t("learn.me.goal", { n: num(profile.goal) })) + "</span></p>" +
                '<p class="lp-me-days"><span aria-hidden="true">' + (row >= 2 ? "🔥" : "📅") + "</span> " + esc(daysText) + "</p>" +
                '<button type="button" class="btn btn-ghost btn-small lp-me-change" data-lp="change" data-fid="change">' + esc(t("learn.me.change")) + "</button>" +
            "</div>" + tip;
    }

    // ----- Today's session -----
    function todayHTML(plan, stats) {
        const head = '<header class="lp-today-head">' +
                '<div><p class="lp-kicker mono">' + (plan.complete || !plan.total ? "&nbsp;" : esc(A.plural("learn.today.about", Math.max(1, plan.minutes)))) + "</p>" +
                '<h3 class="lp-today-title" id="lp-today-title">' + esc(t("learn.today.title")) + "</h3></div>" +
                (plan.total ? '<p class="lp-today-progress mono">' + esc(t("learn.today.progress", { done: num(plan.done), total: num(plan.total) })) + "</p>" : "") +
            "</header>";

        let list = "";
        if (!plan.total) {
            list = '<p class="lp-today-empty">' + esc(t("learn.today.next.none")) + "</p>";
        } else {
            list = '<ol class="lp-steps">' + plan.steps.map(function (step, index) {
                const isNext = plan.first === step;
                const label = isNext ? t("learn.today.start") : t("learn.today.go");
                return '<li class="lp-step' + (step.done ? " is-done" : "") + (isNext ? " is-next" : "") + '">' +
                    '<span class="lp-step-mark" aria-hidden="true">' + (step.done ? "✓" : num(index + 1)) + "</span>" +
                    '<span class="lp-step-icon" aria-hidden="true">' + step.icon + "</span>" +
                    '<span class="lp-step-body"><strong class="lp-step-title">' + esc(step.title) + "</strong>" +
                        (step.text ? '<span class="lp-step-text">' + esc(step.text) + "</span>" : "") + "</span>" +
                    (step.done
                        ? '<span class="lp-step-done"><span class="sr-only">' + esc(t("learn.today.done")) + "</span></span>"
                        : '<button type="button" class="btn ' + (isNext ? "btn-primary" : "btn-ghost") + ' btn-small" data-lp="step" data-step="' + step.id + '" data-fid="step-' + step.id + '">' +
                            esc(label) + '<span class="sr-only">: ' + esc(step.title) + "</span></button>") +
                "</li>";
            }).join("") + "</ol>";
        }

        let end = "";
        if (plan.complete) {
            const tomorrow = stats.forecast[1] || 0;
            end = '<div class="lp-today-all"><span class="lp-today-all-icon" aria-hidden="true">🎉</span><div>' +
                "<strong>" + esc(t("learn.today.allTitle")) + "</strong> " + esc(t("learn.today.allText")) +
                (tomorrow ? " " + esc(A.plural("learn.today.tomorrow", tomorrow)) : "") + "</div></div>";
        }
        const links = [];
        if (stats.total) links.push('<button type="button" class="lp-link" data-lp="more" data-fid="more">' + esc(t("learn.today.more")) + "</button>");
        if (lessonsApi() && lessonsApi().completed().length) {
            links.push('<button type="button" class="lp-link" data-lp="explain" data-fid="explain">' + esc(t("learn.cmd.explain")) + "</button>");
        }
        return head + list + end + (links.length ? '<p class="lp-today-foot">' + links.join("") + "</p>" : "");
    }

    // ----- The path -----
    function stepKindText(step) {
        if (step.kind === "lesson") return t("learn.path.kind.lesson", { number: num(step.number), n: num(step.minutes) });
        if (step.kind === "test") return A.plural("learn.path.kind.test", data.test.questions);
        return t("learn.path.kind.guide", { n: num(step.minutes) });
    }

    function pathHTML(path) {
        const cards = path.stages.map(function (entry, index) {
            const stage = entry.stage;
            const open = openStages.has(stage.id);
            const share = entry.total ? entry.done / entry.total : 0;
            const stepsHTML = entry.steps.map(function (step) {
                const isNext = Boolean(path.next && path.next.step.key === step.key);
                let state = "";
                if (step.done) state = '<span class="lp-unit-state is-done"><span aria-hidden="true">✓</span><span class="sr-only">' + esc(t("learn.path.state.done")) + "</span></span>";
                else if (isNext) state = '<span class="lp-unit-state is-next">' + esc(t("learn.path.next")) + "</span>";
                let extra = "";
                if (step.kind === "test") {
                    extra = step.best !== null
                        ? t("learn.path.testBest", { score: num(step.best), total: num(step.total) })
                        : t("learn.path.testText", { pass: num(testPass()), total: num(data.test.questions) });
                } else if (step.kind === "guide") {
                    extra = step.text;
                } else if (has(explained, String(step.number)) && explained[String(step.number)][1] >= EXPLAIN_GOOD) {
                    extra = "🗣️ " + t("learn.path.explained");
                }
                return '<li><button type="button" class="lp-unit' + (step.done ? " is-done" : "") + (isNext ? " is-next" : "") + " is-" + step.kind + '"' +
                        ' data-lp="unit" data-unit="' + esc(step.key) + '" data-fid="unit-' + esc(step.key) + '">' +
                    '<span class="lp-unit-icon" aria-hidden="true">' + step.icon + "</span>" +
                    '<span class="lp-unit-body"><strong class="lp-unit-title">' + esc(step.title) + "</strong>" +
                        '<span class="lp-unit-kind mono">' + esc(stepKindText(step)) + "</span>" +
                        (extra ? '<span class="lp-unit-text">' + esc(extra) + "</span>" : "") + "</span>" +
                    state +
                "</button></li>";
            }).join("");
            return '<article class="lp-stage is-' + entry.state + (open ? " is-open" : "") + '" data-stage="' + stage.id + '">' +
                '<header class="lp-stage-head">' +
                    '<span class="lp-stage-icon" aria-hidden="true">' + stage.icon + "</span>" +
                    '<div class="lp-stage-name">' +
                        '<p class="lp-stage-kicker mono">' + esc(t("learn.path.stage", { n: num(index) })) +
                            ' <span class="lp-chip lp-chip-' + entry.state + '">' + esc(t("learn.path.state." + entry.state)) + "</span>" +
                            (entry.star ? ' <span class="lp-star" title="' + esc(t("learn.path.star")) + '"><span aria-hidden="true">⭐</span><span class="sr-only">' + esc(t("learn.path.star")) + "</span></span>" : "") + "</p>" +
                        '<h4 class="lp-stage-title">' + esc(t("learn.stage." + stage.id)) + "</h4>" +
                        '<p class="lp-stage-text">' + esc(t("learn.stage." + stage.id + ".text")) +
                            (entry.state === "known" ? ' <span class="lp-stage-optional">' + esc(t("learn.path.optional")) + "</span>" : "") + "</p>" +
                    "</div>" +
                    '<div class="lp-stage-side">' +
                        '<p class="lp-stage-count mono">' + esc(t("learn.path.count", { done: num(entry.done), total: num(entry.total) })) + "</p>" +
                        '<span class="lp-bar" aria-hidden="true"><span style="--done:' + share.toFixed(3) + '"></span></span>' +
                        '<button type="button" class="btn btn-ghost btn-small lp-stage-toggle" data-lp="stage" data-stage="' + stage.id + '" data-fid="stage-' + stage.id + '"' +
                            ' aria-expanded="' + open + '" aria-controls="lp-units-' + stage.id + '">' +
                            esc(t(open ? "learn.path.hide" : "learn.path.show")) + ' <span class="lp-caret" aria-hidden="true">⌄</span></button>' +
                    "</div>" +
                "</header>" +
                '<ol class="lp-units" id="lp-units-' + stage.id + '"' + (open ? "" : " hidden") + ">" + stepsHTML + "</ol>" +
            "</article>";
        }).join("");
        return '<div class="lp-block-head"><h3 class="lp-block-title" id="lp-path-title">' + esc(t("learn.path.title")) + "</h3>" +
            '<p class="lp-block-text">' + esc(A.plural("learn.path.text", STAGES.length)) + "</p></div>" +
            '<div class="lp-stages">' + cards + "</div>";
    }

    // ----- What you remember -----
    function skillsHTML(stats) {
        const head = '<div class="lp-block-head"><h3 class="lp-block-title" id="lp-skills-title">' + esc(t("learn.skills.title")) + "</h3>" +
            '<p class="lp-block-text">' + esc(t("learn.skills.text")) + "</p></div>";
        if (!stats.total) return head + '<p class="lp-skills-empty">' + esc(t("learn.skills.empty")) + "</p>";

        const tile = function (value, label, tone) {
            return '<li class="lp-tile' + (tone ? " is-" + tone : "") + '"><strong class="lp-tile-num mono">' + esc(num(value)) + "</strong>" +
                '<span class="lp-tile-label">' + esc(label) + "</span></li>";
        };
        const tiles = '<ul class="lp-tiles">' +
            tile(stats.total, t("learn.skills.inMemory")) +
            tile(stats.due, t("learn.skills.due"), stats.due ? "due" : "") +
            tile(stats.strong, t("learn.skills.strong"), "strong") +
        "</ul>";

        const topics = topicStats().filter(function (topic) { return topic.known > 0; });
        const topicsHTML = '<ul class="lp-topics">' + topics.map(function (topic) {
            return '<li class="lp-topic is-' + topic.state + '">' +
                '<span class="lp-topic-name">' + esc(topic.name) + "</span>" +
                '<span class="lp-topic-state mono">' + esc(t("learn.skills.state." + topic.state)) + " · " + esc(A.plural("learn.skills.cards", topic.known)) + "</span>" +
                '<span class="lp-bar" aria-hidden="true"><span style="--done:' + topic.share.toFixed(3) + '"></span></span>' +
                '<button type="button" class="btn btn-ghost btn-small" data-lp="practise" data-topic="' + esc(topic.topic) + '" data-fid="practise-' + esc(topic.topic) + '"' +
                    ' aria-label="' + esc(t("learn.skills.practiseTopic", { topic: topic.name })) + '">' + esc(t("learn.skills.practise")) + "</button>" +
            "</li>";
        }).join("") + "</ul>";

        // The Pro design also shows the boxes, the next two weeks and the share of right answers
        const peak = Math.max.apply(null, stats.boxes.concat(1));
        const boxes = '<div class="lp-pro-only lp-boxes"><p class="lp-mini-title mono">' + esc(t("learn.skills.boxes")) + "</p><ol>" +
            stats.boxes.slice(1).map(function (count, index) {
                const box = index + 1;
                const label = t("learn.skills.box", { n: num(box) }) + ": " + A.plural("learn.skills.boxWait", BOX_DAYS[index]);
                return '<li title="' + esc(label) + '"><span class="lp-box-bar" style="--h:' + (count / peak).toFixed(3) + '" aria-hidden="true"></span>' +
                    '<span class="lp-box-num mono">' + esc(num(count)) + "</span>" +
                    '<span class="lp-box-name mono">' + esc(num(box)) + '</span><span class="sr-only">' + esc(label) + "</span></li>";
            }).join("") + "</ol></div>";
        const forecastPeak = Math.max.apply(null, stats.forecast.concat(1));
        const forecast = '<div class="lp-pro-only lp-forecast"><p class="lp-mini-title mono">' + esc(t("learn.skills.forecast")) + "</p><ol>" +
            stats.forecast.map(function (count, day) {
                return '<li title="' + esc(whenText(today() + day) + ": " + A.plural("learn.skills.cards", count)) + '">' +
                    '<span class="lp-box-bar" style="--h:' + (count / forecastPeak).toFixed(3) + '" aria-hidden="true"></span>' +
                    '<span class="lp-box-name mono">' + (day === 0 ? "•" : esc(num(day))) + "</span>" +
                    '<span class="sr-only">' + esc(whenText(today() + day) + ": " + A.plural("learn.skills.cards", count)) + "</span></li>";
            }).join("") + "</ol></div>";
        const accuracy = stats.seen
            ? '<p class="lp-pro-only lp-accuracy mono">' + esc(t("learn.skills.accuracy")) + ": <strong>" + esc(A.format.percent(stats.right / stats.seen)) + "</strong> (" + esc(num(stats.right)) + " / " + esc(num(stats.seen)) + ")</p>"
            : "";

        const action = stats.due
            ? '<p class="lp-skills-action"><button type="button" class="btn btn-primary btn-small" data-lp="review" data-fid="review">' + esc(t("learn.skills.reviewNow")) + "</button></p>"
            : (stats.next ? '<p class="lp-skills-next">' + esc(t("learn.review.nextWhen", { when: whenText(stats.next) })) + "</p>" : "");
        return head + tiles + action + topicsHTML + '<div class="lp-pro-grid">' + boxes + forecast + "</div>" + accuracy;
    }

    // ----- How the site teaches, and the difference from a chatbot -----
    function aboutHTML() {
        const open = profile && !wizard.open ? "" : " open";
        const method = "<ol class=\"lp-method\">" + [1, 2, 3, 4, 5, 6].map(function (n) {
            return '<li><span class="lp-method-num mono" aria-hidden="true">' + num(n) + "</span><div><strong>" + esc(t("learn.method." + n)) + "</strong>" +
                "<p>" + esc(t("learn.method." + n + ".text")) + "</p></div></li>";
        }).join("") + "</ol>";
        const rows = [1, 2, 3, 4, 5, 6].map(function (n) {
            return '<div class="lp-why-row" role="row">' +
                '<p class="lp-why-bot" role="cell"><span class="lp-why-tag mono">' + esc(t("learn.why.colBot")) + "</span>" + esc(t("learn.why." + n + ".bot")) + "</p>" +
                '<p class="lp-why-here" role="cell"><span class="lp-why-tag mono">' + esc(t("learn.why.colHere")) + "</span>" + esc(t("learn.why." + n + ".here")) + "</p>" +
            "</div>";
        }).join("");
        return '<details class="lp-details"' + open + '><summary><span aria-hidden="true">🧭</span> ' + esc(t("learn.method.title")) + "</summary>" +
                '<p class="lp-details-lead">' + esc(t("learn.method.text")) + "</p>" + method + "</details>" +
            '<details class="lp-details"' + open + '><summary><span aria-hidden="true">💬</span> ' + esc(t("learn.why.title")) + "</summary>" +
                '<p class="lp-details-lead">' + esc(t("learn.why.lead")) + "</p>" +
                '<div class="lp-why" role="table" aria-label="' + esc(t("learn.why.title")) + '">' + rows + "</div>" +
                '<div class="lp-both"><strong>' + esc(t("learn.why.bothTitle")) + "</strong><p>" + esc(t("learn.why.bothText")) + "</p></div>" +
            "</details>";
    }

    let aboutKey = "";      // the about block is drawn again only when it has to change (it keeps what is open)

    function render() {
        document.documentElement.classList.toggle("has-path", Boolean(profile));
        refreshHome();
        if (!ui) return;
        const showSetup = !profile || wizard.open;
        A.dom.setHidden(ui.setup, !showSetup);
        A.dom.setHidden(ui.main, showSetup);
        if (showSetup) {
            redraw(ui.setup, setupHTML());
        } else {
            const path = buildPath();
            if (!stagesChosen) {
                openStages.clear();
                if (path.next) openStages.add(path.next.stage);
            }
            const stats = memoryStats();
            redraw(ui.me, meHTML());
            redraw(ui.today, todayHTML(todayPlan(path), stats));
            redraw(ui.path, pathHTML(path));
            redraw(ui.skills, skillsHTML(stats));
        }
        const key = A.lang + (showSetup ? ":setup" : ":path");
        if (key !== aboutKey) {
            aboutKey = key;
            ui.about.innerHTML = aboutHTML();
        }
        A.dom.setText(ui.note, canSave ? "" : t("learn.noSave"));
        A.dom.setHidden(ui.note, canSave);
        A.layoutChanged();
    }

    // Many things can change at once (an answer, a lesson...): one redraw for all of them
    let renderQueued = false;
    function renderSoon() {
        if (renderQueued) return;
        renderQueued = true;
        setTimeout(function () {
            renderQueued = false;
            takeSaved();
            render();
            checkSession();
        }, 0);
    }

    // ---------- 9. Clicks ----------
    function finishSetup() {
        if (!wizard.who || !wizard.start || !wizard.goal) return;
        takeSaved();
        const changed = Boolean(profile);
        profile = {
            v: 1, who: wizard.who, start: wizard.start, goal: wizard.goal,
            since: profile ? profile.since : today(),
            placed: pendingPlaced || (profile ? profile.placed : null)
        };
        pendingPlaced = null;
        save("learn.profile", profile);
        A.storage.remove("learn.placed");
        wizard.open = false;
        stagesChosen = false;
        A.track("learn.setup", { who: profile.who, start: profile.start, goal: profile.goal });
        render();
        showTop(ui.main);
        if (profile.start === "check" && !profile.placed) {
            startPlacement(ui.me.querySelector("[data-lp]"));
            return;
        }
        const stage = STAGES[startIndex()];
        A.toast(t(changed ? "learn.setup.changed" : "learn.setup.ready", { stage: t("learn.stage." + stage.id) }), stage.icon);
        const heading = ui.today.querySelector(".lp-today-title");
        if (heading) {
            heading.setAttribute("tabindex", "-1");
            heading.focus({ preventScroll: true });
        }
    }

    function onClick(event) {
        const button = event.target.closest("[data-lp]");
        if (!button || !mount.contains(button)) return;
        if (button.getAttribute("aria-disabled") === "true") return;
        const action = button.getAttribute("data-lp");
        const value = button.getAttribute("data-value");
        if (action === "who") {
            wizard.who = value;
            // The usual start and minutes for them (they can change both)
            if (!wizard.start) wizard.start = PROFILE_BY_ID[value].start;
            if (!wizard.goal) wizard.goal = PROFILE_BY_ID[value].goal;
            wizard.step = 2;
            render();
            focusSetup();
        } else if (action === "start") {
            wizard.start = value;
            wizard.step = 3;
            render();
            focusSetup();
        } else if (action === "goal") {
            wizard.goal = Number(value);
            render();
        } else if (action === "setup-back") {
            if (wizard.step > 1) {
                wizard.step -= 1;
            } else {
                // Back to the path: a level check taken while the questions were open is dropped
                wizard.open = false;
                if (profile) pendingPlaced = null;
            }
            render();
            if (wizard.open || !profile) {
                focusSetup();
            } else {
                // Back to the path, unchanged: the focus goes to the button that opened the questions
                showTop(ui.main);
                const change = ui.me.querySelector('[data-lp="change"]');
                if (change) change.focus({ preventScroll: true });
            }
        } else if (action === "setup-finish") {
            finishSetup();
        } else if (action === "change") {
            openWizard();
        } else if (action === "step") {
            runStep(button.getAttribute("data-step"), button);
        } else if (action === "stage") {
            const id = button.getAttribute("data-stage");
            stagesChosen = true;
            if (openStages.has(id)) openStages.delete(id);
            else openStages.add(id);
            render();
        } else if (action === "unit") {
            openStep(button.getAttribute("data-unit"), button);
        } else if (action === "practise") {
            startCards("topic", button, button.getAttribute("data-topic"));
        } else if (action === "more") {
            startCards("more", button);
        } else if (action === "review") {
            startCards("review", button);
        } else if (action === "explain") {
            explainAny(button);
        } else if (action === "level") {
            startPlacement(button);
        } else if (action === "to-pro") {
            if (A.settings) A.settings.set("design", "pro");
            render();
        } else if (action === "to-teachers") {
            A.navigate("teachers");
        }
    }

    // Opens a step of the path: "lesson:3", "unit:z1" or "test:basics"
    function openStep(key, opener) {
        const parts = String(key).split(":");
        if (parts[0] === "lesson" && A.lessons) {
            A.lessons.open(Number(parts[1]), opener);
        } else if (parts[0] === "unit" && has(UNIT_BY_ID, parts[1])) {
            play({ mode: "guide", unit: parts[1] }, opener);
        } else if (parts[0] === "test" && has(STAGE_BY_ID, parts[1])) {
            startTest(parts[1], opener);
        }
    }

    // Runs a step of today's session
    function runStep(id, opener) {
        const path = buildPath();
        const step = todayPlan(path).steps.filter(function (item) { return item.id === id; })[0];
        if (!step) return;
        if (id === "review") startCards("review", opener);
        else if (id === "next" && step.step) openStep(step.step.key, opener);
        else if (id === "lab" && step.lab && A.lab) A.lab.open(step.lab, { focus: true });
        else if (id === "explain" && step.lesson) explainLesson(step.lesson, opener);
    }

    // The first step of today that is not done (from the home page, Ctrl+K...)
    function startToday(opener) {
        if (!profile) {
            A.navigate("learn");
            return;
        }
        const plan = todayPlan(buildPath());
        if (plan.first) runStep(plan.first.id, opener);
        else A.navigate("learn");
    }

    // ---------- 10. The study window (js/learn-play.js) and what it gets ----------
    A.keepOffline([PLAY_SCRIPT, PLAY_STYLE].concat(Object.keys(COURSES).map(function (id) { return COURSES[id].file; })));

    let player = null;
    let playerLoading = null;

    function loadPlayer() {
        if (player) return Promise.resolve(player);
        if (!playerLoading) {
            playerLoading = Promise.all([A.loadScript(PLAY_SCRIPT), A.loadStyle(PLAY_STYLE)]).then(function () {
                player = A.learnPlay.create(host);
                return player;
            }).catch(function (error) {
                playerLoading = null;
                throw error;
            });
        }
        return playerLoading;
    }

    // Opens the study window on a request (see the modes at the top of js/learn-play.js)
    function play(request, opener) {
        const from = opener || document.activeElement;
        return loadPlayer().then(function (studyWindow) {
            studyWindow.open(request, from);
            return true;
        }, function () {
            A.toast(t("learn.play.loadError"), "⚠️");
            return false;
        });
    }

    // A memory check ("review"), extra practice ("more") or the practice of a topic ("topic")
    function startCards(kind, opener, topic) {
        seedMemory();
        return play({ mode: "cards", kind: kind, topic: topic || "", cards: sessionCards(kind, topic) }, opener);
    }

    // A stage test: questions from every lesson (or unit) of the stage, different each time
    function startTest(stageId, opener) {
        const stage = STAGE_BY_ID[stageId];
        const groups = {};
        A.util.shuffle(stageCards(stage)).forEach(function (id) {
            const info = cardInfo(id);
            const group = info.kind === "quiz" ? "l" + info.lesson : info.unit;
            (groups[group] = groups[group] || []).push(id);
        });
        const names = A.util.shuffle(Object.keys(groups));
        const cards = [];
        for (let round = 0; cards.length < data.test.questions; round++) {
            let found = false;
            names.forEach(function (name) {
                if (cards.length < data.test.questions && groups[name][round]) {
                    cards.push(groups[name][round]);
                    found = true;
                }
            });
            if (!found) break;
        }
        return play({ mode: "cards", kind: "test", stage: stageId, cards: A.util.shuffle(cards) }, opener);
    }

    // The stages the level check asks about: every stage but "zero" (that is where the
    // path starts when nothing is known yet). A young explorer is asked about the
    // first few only.
    function placementStages(who) {
        const stages = STAGES.filter(function (stage) { return stage.id !== "zero"; });
        return who === "kid" ? stages.slice(0, data.placement.kidStages) : stages;
    }

    // How many questions the level check has at most (it stops early when the
    // first stages are not known yet)
    function placementQuestions(who) {
        return placementStages(who).length * data.placement.perStage;
    }

    // The level check: a few questions for each stage, from the easier stages up
    function startPlacement(opener) {
        const bank = quizBank();
        const difficulty = {};
        A.util.attempt(function () {
            A.quiz.bank().forEach(function (question) { difficulty[question.id] = question.difficulty; });
        });
        // The learner the window is drawn for (host.who): the one chosen in the open
        // questions, or before there is a path. Otherwise a saved learner is checked as
        // saved: the questions may still hold a choice that was left with "Back"
        const who = host.who();
        const probes = [];
        placementStages(who).forEach(function (stage) {
            let ids = [];
            if (stage.track) {
                const pool = A.util.shuffle(stageCards(stage).filter(function (id) { return has(bank, id); }));
                // The basics: an easy one and a medium one; later stages: medium and hard
                const wanted = stage.id === "basics" ? [1, 2] : [2, 3];
                wanted.slice(0, data.placement.perStage).forEach(function (level) {
                    const pick = pool.filter(function (id) { return difficulty[id] === level && ids.indexOf(id) === -1; })[0] ||
                        pool.filter(function (id) { return ids.indexOf(id) === -1; })[0];
                    if (pick) ids.push(pick);
                });
            } else if (COURSES[stage.course] && Array.isArray(COURSES[stage.course].probes)) {
                ids = COURSES[stage.course].probes.slice(0, data.placement.perStage);
            }
            if (ids.length) probes.push({ stage: stage.id, cards: ids });
        });
        return play({ mode: "cards", kind: "place", probes: probes }, opener);
    }

    function explainLesson(n, opener) {
        return play({ mode: "explain", lesson: n }, opener);
    }

    // "Explain a lesson back" without saying which: the one today's session would choose
    function explainAny(opener) {
        const api = lessonsApi();
        const finished = api ? api.completed() : [];
        if (!finished.length) {
            A.toast(t("learn.explain.none"), "🗣️");
            return;
        }
        explainLesson(lessonToExplain() || finished[finished.length - 1], opener);
    }

    // A step of a course in the current language: the texts of "en" or "ru" next to its settings
    function localStep(step) {
        return Object.assign({}, step, step[A.lang] || step.en);
    }

    function loadCourse(courseId) {
        if (!has(COURSES, courseId)) return Promise.reject(new Error("no such course"));
        const ready = function () { return A.content.get("course." + courseId); };
        if (ready()) return Promise.resolve(ready());
        return A.loadScript(COURSES[courseId].file).then(function () {
            if (!ready()) throw new Error("the course did not load");
            return ready();
        });
    }

    // Many phone keypads for numbers have no minus key. So a course with a negative
    // answer somewhere gets a "±" button beside the field of its number tasks: of all
    // of them, so that the button never gives an answer away.
    const signedCourses = {};
    function needsSign(courseId) {
        if (has(signedCourses, courseId)) return signedCourses[courseId];
        const course = A.content.get("course." + courseId);
        if (!course || !course.units) return false;         // not loaded yet: asked again later
        signedCourses[courseId] = Object.keys(course.units).some(function (id) {
            return course.units[id].steps.some(function (step) { return step.type === "number" && step.answer < 0; });
        });
        return signedCourses[courseId];
    }

    // Everything the study window needs. It never reads the saved state itself.
    const host = {
        data: data,
        boxDays: BOX_DAYS,
        canSave: function () { return canSave; },
        // The learner chosen in the three questions while they are open (or before there is
        // a path), otherwise the saved one
        who: function () { return wizard.who && (wizard.open || !profile) ? wizard.who : (profile ? profile.who : "teen"); },
        whenText: whenText,
        testPass: testPass,
        stageName: function (id) { return t("learn.stage." + id); },
        topicName: topicName,

        // Loads what is needed to show these cards: the quiz's texts, the course files
        loadCards: function (ids) {
            const jobs = [];
            const courses = {};
            let quiz = false;
            ids.forEach(function (id) {
                const info = cardInfo(id);
                if (!info) return;
                if (info.kind === "quiz") quiz = true;
                else courses[info.course] = true;
            });
            if (quiz && A.quiz && typeof A.quiz.ready === "function") jobs.push(A.quiz.ready());
            Object.keys(courses).forEach(function (id) { jobs.push(loadCourse(id)); });
            return Promise.all(jobs);
        },

        // A card as a task for the window (in the current language), or null:
        //   { id, type, q, options, correct, why, keepOrder, from, topic, lesson, unitId, signed }
        // (unitId is the guided step a card comes from: "unit" is already taken by a
        // "number" task, where it is the unit of measure, like "%")
        card: function (id) {
            const info = cardInfo(id);
            if (!info) return null;
            if (info.kind === "quiz") {
                const question = A.quiz && A.quiz.question(id);
                if (!question) return null;
                return {
                    id: id, type: "choice", q: question.text, options: question.options, correct: question.correct, why: question.explain,
                    keepOrder: question.type !== "choice",
                    from: typeof info.lesson === "number" ? t("learn.review.fromLesson", { n: num(info.lesson) }) : t("nav.timeline"),
                    topic: topicName(info.topic), lesson: typeof info.lesson === "number" ? info.lesson : 0, unitId: ""
                };
            }
            const course = A.content.get("course." + info.course);
            const unit = course && course.units ? course.units[info.unit] : null;
            const step = unit ? unit.steps.filter(function (item) { return item.card === id; })[0] : null;
            if (!step) return null;
            return Object.assign(localStep(step), {
                id: id, from: t("learn.unit." + info.unit), topic: topicName(info.topic), lesson: 0, unitId: info.unit,
                signed: needsSign(info.course)        // a number task: with the "±" button
            });
        },

        // An answer to a card: the memory moves it. -> { box, wait } (the days until it comes back)
        answer: answerCard,
        // The numbers of the memory: { total, due, next (the day of the next card), ... }
        memory: memoryStats,
        // The window closed: the page shows what changed
        closed: function () { renderSoon(); },
        // When the button that opened the window is gone: the heading of today's session
        focusFallback: function () {
            const page = document.getElementById("learn");
            if (!ui || ui.main.hidden || !page || !page.classList.contains("page-current")) return null;
            const heading = mount.querySelector("#lp-today-title");
            if (heading) heading.setAttribute("tabindex", "-1");
            return heading;
        },

        // The end of a session of cards
        finishCards: function (request, result) {
            if (request.kind === "review") {
                markToday("r");
                A.track("learn.review", { kind: "review", cards: result.total, right: result.right });
            } else if (request.kind === "more" || request.kind === "topic") {
                A.track("learn.review", { kind: "practice", cards: result.total, right: result.right });
            } else if (request.kind === "test") {
                takeSaved();
                const before = units.tests[request.stage];
                const star = result.right >= testPass() && result.total >= data.test.questions;
                const best = before && before[0] > result.right ? before[0] : result.right;
                units.tests[request.stage] = [best, result.total, star || Boolean(before && before[2]), today()];
                saveUnits();
                if (star) markToday("n", "test:" + request.stage);
                A.track("learn.test", { stage: request.stage, score: result.right, total: result.total, star: star });
            }
            renderSoon();
        },

        // The end of the level check: scores is { basics: 2, deep: 1, ... } (right answers
        // for each stage that was asked) and asked is { basics: 2, deep: 2, ... } (how many
        // questions it got). Returns the stage where the path starts: the first stage
        // with a wrong answer.
        finishPlacement: function (scores, asked) {
            const counts = asked || {};
            let start = "";
            let last = null;        // the last stage that was asked
            STAGES.forEach(function (stage) {
                if (!has(scores, stage.id)) return;
                last = stage;
                if (!start && scores[stage.id] < (counts[stage.id] || data.placement.perStage)) start = stage.id;
            });
            // Everything right: the stage after the last one that was asked
            if (!start) start = STAGES[Math.min(STAGES.length - 1, last ? last.index + 1 : 1)].id;
            if (start === "basics" && scores.basics === 0) start = "zero";    // nothing right: from zero
            takeSaved();
            const placed = { day: today(), start: start, scores: scores };
            if (profile && !wizard.open) {
                profile.start = "check";
                profile.placed = placed;
                save("learn.profile", profile);
            } else if (profile) {
                // The three questions are open (maybe for another learner): the result waits
                // for "Build my path", and "Back" to the path drops it
                pendingPlaced = placed;
                wizard.start = "check";
            } else {
                // No path yet (the check was opened with Ctrl+K): the result waits for
                // the three questions, where "Find my level" is already chosen
                pendingPlaced = placed;
                save("learn.placed", placed);
                wizard.start = "check";
            }
            stagesChosen = false;
            A.track("learn.placement", { start: start });
            renderSoon();
            return start;
        },

        // The guided steps
        loadCourse: loadCourse,
        localStep: localStep,
        // Do the number tasks of this guided step get the "±" button?
        signed: function (id) { return has(UNIT_BY_ID, id) && needsSign(UNIT_BY_ID[id].course); },
        unit: function (id) {
            if (!has(UNIT_BY_ID, id)) return null;
            const unit = UNIT_BY_ID[id];
            const list = COURSES[unit.course].units;
            const next = list[unit.index + 1];
            const allDone = list.every(function (item) { return has(units.done, item.id); });
            const star = Boolean(units.tests[unit.stage] && units.tests[unit.stage][2]);
            return {
                id: id, course: unit.course, stage: unit.stage, icon: unit.icon, minutes: unit.minutes,
                title: t("learn.unit." + id), stageTitle: t("learn.stage." + unit.stage),
                done: has(units.done, id),
                next: next ? { id: next.id, title: t("learn.unit." + next.id) } : null,
                // after the last step of a finished course: the stage test, until its star is earned
                test: !next && allDone && !star
            };
        },
        // result: { first, total } (tasks right on the first try, of all tasks). -> how many cards are new
        finishUnit: function (id, result) {
            if (!has(UNIT_BY_ID, id)) return 0;
            takeSaved();
            const before = units.done[id];
            units.done[id] = [before ? before[0] : today(), Math.max(result.first, before ? before[1] : 0), result.total];
            saveUnits();
            const added = addCards(unitCards(id), 1);
            markToday("n", "unit:" + id);
            A.track("learn.unit", { course: UNIT_BY_ID[id].course, unit: id, first: result.first, total: result.total });
            renderSoon();
            return added;
        },

        // "Explain it back"
        explainInfo: function (n) {
            const api = lessonsApi();
            if (!api || !api.title(n)) return null;
            const row = explained[String(n)];
            return {
                n: n, title: api.title(n),
                prompt: A.has("learn.explain.l" + n) ? t("learn.explain.l" + n) : t("learn.explain.lead"),
                keys: [1, 2, 3].map(function (k) { return t("lessons.l" + n + ".key" + k); }),
                saved: row ? { day: row[0], score: row[1], text: row[2] } : null
            };
        },
        saveExplain: function (n, text, score) {
            takeSaved();
            explained[String(n)] = [today(), Math.max(0, Math.min(3, score)), String(text).slice(0, EXPLAIN_MAX)];
            save("learn.explain", { v: 1, lessons: explained });
            markToday("e", "lesson:" + n);
            A.track("learn.explain", { n: n, score: score });
            renderSoon();
        },

        openLesson: function (n, options) {
            if (A.lessons) A.lessons.open(n, null, options);
        },
        openUnit: function (id, opener) { play({ mode: "guide", unit: id }, opener); },
        openTest: startTest,
        showPath: function () { A.navigate("learn"); },
        moreCards: function (opener) { startCards("more", opener); }
    };

    // ---------- 11. Following what the learner does elsewhere ----------
    A.on("activity", function (activity) {
        const detail = activity.detail || {};
        if (activity.type === "lesson.complete") {
            const added = addCards(lessonCards(detail.n), 1);
            if (profile) {
                markToday("n", Number.isInteger(detail.n) ? "lesson:" + detail.n : "");
                if (added) A.toast(A.plural("learn.toast.cards", added), "🧠");
            }
            renderSoon();
        } else if (activity.type === "quiz.answer") {
            // Every answer in the quiz moves its card too
            if (typeof detail.id === "string" && typeof detail.correct === "boolean") answerCard(detail.id, detail.correct);
            renderSoon();
        } else if (activity.type === "lab.use" || activity.type === "lab.challenge") {
            if (profile) markToday("l", typeof detail.exp === "string" ? detail.exp : "");
            renderSoon();
        }
    });

    A.onLanguageChange(function () {
        aboutKey = "";
        render();
    });
    if (A.settings && typeof A.settings.onChange === "function") {
        A.settings.onChange(function (change) {
            if (change && change.name === "design") render();
        });
    }
    // Another tab saved, or this tab is shown again after a while (a phone puts a tab to
    // sleep and wakes it without its "storage" events): take what is saved and show it.
    // A new day (the page stayed open overnight) is shown too: the plan is for today.
    let shownDay = today();

    function takeAndShow() {
        const newDay = today() !== shownDay;
        shownDay = today();
        const changed = takeSaved();
        // A level check finished in another tab before the three questions (learn.placed)
        const waiting = profile ? pendingPlaced : readPending();
        const moved = JSON.stringify(waiting) !== JSON.stringify(pendingPlaced);
        if (moved) {
            pendingPlaced = waiting;
            if (waiting) wizard.start = "check";
        }
        if (changed || newDay || moved) renderSoon();
    }
    window.addEventListener("storage", takeAndShow);
    window.addEventListener("pageshow", takeAndShow);
    window.addEventListener("focus", takeAndShow);
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) takeAndShow();
    });
    A.on("page", takeAndShow);
    // A tab that stays on the screen past 4 a.m. (a computer left on): once a minute
    setInterval(function () {
        if (today() !== shownDay) takeAndShow();
    }, 60000);

    // ---------- 12. The card on the home page ----------
    // For a visitor with a path: today's steps and one button. Without a path, the
    // Simple design keeps its "three first steps" (with a link to here), and the Pro
    // design shows this card as an invitation.
    const homeCard = document.querySelector("[data-home-path]");

    function refreshHome() {
        if (!homeCard) return;
        const isPro = document.documentElement.classList.contains("design-pro");
        if (!profile && !isPro) {
            A.dom.setHidden(homeCard, true);
            return;
        }
        let title = t("learn.home.newTitle");
        let text = t("learn.home.newText");
        let button = t("learn.home.newButton");
        let list = "";
        if (profile) {
            const plan = todayPlan(buildPath());
            title = t(plan.complete || !plan.total ? "learn.home.doneTitle" : "learn.home.title");
            text = plan.complete || !plan.total ? t("learn.home.doneText") : A.plural("learn.home.steps", plan.total - plan.done);
            button = t(plan.complete || !plan.total ? "learn.home.doneButton" : "learn.home.button");
            list = '<ul class="home-path-steps">' + plan.steps.map(function (step) {
                return '<li class="' + (step.done ? "is-done" : "") + '"><span class="home-path-mark" aria-hidden="true">' + (step.done ? "✓" : step.icon) + "</span> " +
                    esc(step.title) + (step.id === "next" && step.text ? ': <span class="home-path-what">' + esc(step.text) + "</span>" : "") + "</li>";
            }).join("") + "</ul>";
        }
        const html = '<span class="home-path-icon" aria-hidden="true">🧭</span>' +
            '<div class="home-path-body"><p class="home-path-kicker mono">' + esc(t("learn.home.kicker")) + "</p>" +
                '<h2 class="home-path-title">' + esc(title) + "</h2>" +
                '<p class="home-path-text">' + esc(text) + "</p>" + list + "</div>" +
            '<button type="button" class="btn btn-primary home-path-button" data-fid="home-path">' + esc(button) + "</button>";
        if (homeCard.innerHTML !== html) redraw(homeCard, html);
        A.dom.setHidden(homeCard, false);
    }

    if (homeCard) {
        homeCard.addEventListener("click", function (event) {
            const button = event.target.closest(".home-path-button");
            if (!button) return;
            if (profile) startToday(button);
            else A.navigate("learn");
        });
    }
    // Links to this page from anywhere: <button data-open-path>
    document.addEventListener("click", function (event) {
        if (event.target.closest("[data-open-path]")) A.navigate("learn");
    });

    // ---------- 13. Ctrl+K commands, the site search and the public API ----------
    const ensure = A.whenNeeded(mount, build);

    function openPage() {
        ensure();
        A.navigate("learn");
    }

    [
        { id: "learn-open", icon: "🧭", title: "learn.cmd.open", run: openPage,
            keywords: "my path plan learning course start level stage personal мой путь план обучение курс начать уровень этап личный" },
        { id: "learn-today", icon: "📅", title: "learn.cmd.today", run: function () { ensure(); startToday(document.activeElement); },
            keywords: "today session daily plan study сегодня занятие ежедневно план учиться" },
        { id: "learn-review", icon: "🧠", title: "learn.cmd.review", run: function () { ensure(); startCards("review", document.activeElement); },
            keywords: "memory check review repeat spaced repetition cards remember память проверка повторение карточки вспомнить интервальное" },
        { id: "learn-level", icon: "🎯", title: "learn.cmd.level", run: function () { ensure(); startPlacement(document.activeElement); },
            keywords: "level check placement test where start уровень проверка тест с чего начать" },
        { id: "learn-explain", icon: "🗣️", title: "learn.cmd.explain", run: function () { ensure(); explainAny(document.activeElement); },
            keywords: "explain back own words teach feynman объяснить своими словами рассказать фейнман" },
        { id: "learn-setup", icon: "👤", title: "learn.cmd.setup", run: function () { openPage(); openWizard(); },
            keywords: "who is learning age profile child student adult teacher pro minutes кто учится возраст профиль ребёнок школьник взрослый учитель минуты" }
    ].forEach(function (command) {
        A.registerCommand({
            id: command.id,
            group: "learn.cmdGroup",
            icon: command.icon,
            title: function () { return t(command.title); },
            keywords: command.keywords,
            run: command.run
        });
    });

    // The site search (js/search.js: the Ctrl+K window) finds the guided steps: by their
    // name and their search words at once, and by everything they teach as soon as their
    // course file is there. Asking for the documents starts loading the course files, and
    // "version" tells the search to build its index again when one has arrived.
    function loadedCourses() {
        return Object.keys(COURSES).filter(function (id) { return Boolean(A.content.get("course." + id)); });
    }

    function unmarked(text) {
        return String(text).replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1");
    }

    function searchDocuments() {
        Object.keys(COURSES).forEach(function (id) { loadCourse(id).catch(function () {}); });
        const documents = [];
        STAGES.forEach(function (stage) {
            if (!stage.course || !COURSES[stage.course]) return;
            const course = A.content.get("course." + stage.course);
            const stageName = t("learn.stage." + stage.id);
            COURSES[stage.course].units.forEach(function (unit) {
                const title = t("learn.unit." + unit.id);
                const lines = [t("learn.unit." + unit.id + ".text")];
                const steps = course && course.units && course.units[unit.id] ? course.units[unit.id].steps : [];
                // What a step teaches: its ideas, its "think first" answers and its recap.
                // (The tasks stay out: a wrong option must never be found as if it were a fact.)
                steps.forEach(function (step) {
                    const text = step[A.lang] || step.en || {};
                    if (step.type === "info") lines.push.apply(lines, [text.title].concat(text.text || [], text.note || []));
                    else if (step.type === "reveal") lines.push.apply(lines, [text.q].concat(text.answer || []));
                    else if (step.type === "recap") lines.push.apply(lines, text.points || []);
                });
                documents.push({
                    id: unit.id,
                    title: title,
                    heading: stageName,
                    text: lines.filter(Boolean).map(unmarked).join(" "),
                    keywords: A.has("learn.unit." + unit.id + ".words") ? t("learn.unit." + unit.id + ".words") : "",
                    section: t("learn.search.section", { stage: stageName }),
                    label: t("learn.search.label", { title: title }),
                    icon: unit.icon,
                    open: function () { openGuidedStep(unit.id); }
                });
            });
        });
        return documents;
    }

    // Opens a guided step from anywhere (the search, another feature)
    function openGuidedStep(id, opener) {
        if (!has(UNIT_BY_ID, id)) return false;
        ensure();
        play({ mode: "guide", unit: id }, opener || document.activeElement);
        return true;
    }

    if (A.search && typeof A.search.register === "function") {
        A.search.register("learn", {
            icon: "🧭",
            version: function () { return "steps " + Object.keys(UNIT_BY_ID).length + ", courses " + loadedCourses().join(" "); },
            documents: searchDocuments
        });
    }

    // Other features use AICompass.learn:
    //   open()                 goes to the "My path" page
    //   step(id, opener)       opens a guided step ("z1", "p3"...); false if there is no such step
    //   today(opener)          starts the first step of today's session that is not done
    //   review(opener)         starts the memory check
    //   explain(n, opener)     "Explain it back" for lesson n (without n: the best one to explain)
    //   profile()              { who, start, goal } or null: who is learning
    //   plan()                 today's session: { steps: [{ id, title, text, done }], done, total, complete }
    //   memory()               { total, due, strong, seen, right, boxes, forecast, next }
    //   topics()               [{ topic, name, total, known, due, share, state }]
    //   path()                 { stages: [{ id, state, done, total, star }], next: { stage, key, title } or null }
    A.feature("learn", {
        open: openPage,
        step: openGuidedStep,
        today: function (opener) { ensure(); startToday(opener || document.activeElement); },
        review: function (opener) { ensure(); return startCards("review", opener); },
        explain: function (n, opener) {
            ensure();
            if (Number.isInteger(n) && n > 0) return explainLesson(n, opener);
            return explainAny(opener);
        },
        profile: function () { return profile ? { who: profile.who, start: profile.start, goal: profile.goal } : null; },
        plan: function () {
            const plan = todayPlan(buildPath());
            return {
                steps: plan.steps.map(function (step) { return { id: step.id, title: step.title, text: step.text, done: step.done }; }),
                done: plan.done, total: plan.total, complete: plan.complete
            };
        },
        memory: function () { seedMemory(); return memoryStats(); },
        topics: topicStats,
        path: function () {
            const path = buildPath();
            return {
                stages: path.stages.map(function (entry) {
                    return { id: entry.stage.id, state: entry.state, done: entry.done, total: entry.total, star: entry.star };
                }),
                next: path.next ? { stage: path.next.stage, key: path.next.step.key, title: path.next.step.title } : null
            };
        }
    });

    // The home card shows before the page itself is built
    A.ready(function () {
        document.documentElement.classList.toggle("has-path", Boolean(profile));
        refreshHome();
    });
})();
