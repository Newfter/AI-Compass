/* =========================================================
   AI COMPASS — THE AI CHALLENGE (QUIZ)
   Questions about AI inside one glass card with three screens:
   1. START    rules, best score, "timed mode" switch
   2. QUESTION progress, score, streak, timer ring, answers, feedback
   3. RESULTS  score ring, rank, new best + confetti, answer review
   Keyboard: number keys answer, Enter goes to the next question.
   Other files can call window.AICompass.startQuiz().
   The language can change at any moment: the quiz keeps its place
   and simply re-writes its texts in the other language.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="quiz"]');
    const data = A && A.content.get("quiz");      // the questions and ranks (js/content/quiz.js)
    if (!A || !mount || !data) return;

    const t = A.t;

    // ---------- 1. Settings ----------
    const TIME_LIMIT = 20;          // seconds per question in timed mode
    const BASE_POINTS = 100;        // for every correct answer
    const SPEED_BONUS_MAX = 50;     // timed mode: a fast answer earns up to +50
    const STREAK_STEP = 10;         // 2 in a row: +10, 3 in a row: +20, ...
    const STREAK_BONUS_MAX = 50;    // ...but never more than +50
    const PRAISE_COUNT = 4;         // how many different "Correct!" messages we have
    const CHOICE_OPTIONS = 4;       // answers of a multiple-choice question ("o1" … "o4" in the texts)
    const SECONDS_PER_QUESTION = 25;   // about how long one question takes (to read, answer and learn)
    const SCROLL_GAP = 8;           // px kept free below the menu bar and above the assistant's button
    const ON_SCREEN_MARGIN = "-25% 0px";   // "on screen" = the quiz reaches into the middle half of the window
    const CONFETTI_DELAY = 950;     // ms after the results appear (the ring is almost full then)
    const CONFETTI_MS = 3000;       // how long the confetti of a new best score falls
    const TIMER_RADIUS = 27;        // the countdown ring (an SVG circle in a 64 × 64 picture)
    const RESULT_RADIUS = 66;       // the score ring of the results (in a 160 × 160 picture)
    const TIMER_LENGTH = 2 * Math.PI * TIMER_RADIUS;     // the length of a ring is its circumference
    const RESULT_LENGTH = 2 * Math.PI * RESULT_RADIUS;

    // ---------- 2. The questions and ranks ----------
    // They live in js/content/quiz.js, next to every text (English and Russian).
    const QUESTIONS = data.questions;
    const RANKS = data.ranks;           // by the number of correct answers
    const PLAY_MINUTES = Math.max(1, Math.round(QUESTIONS.length * SECONDS_PER_QUESTION / 60));

    // ---------- 4. Small helpers ----------
    // (Plurals, number formats, shuffling, motion and screen-reader messages
    // come from the shared toolkit in core.js.)

    // A translated piece of text. The data-i18n attribute lets core.js
    // re-translate it by itself when the language changes.
    const text = A.i18nHTML;

    // "Twelve questions": the texts can spell out the exact number the quiz has
    // ("quiz.questionCount.12"); any other number uses the plural forms ("13 questions")
    function questionCount() {
        const exactKey = "quiz.questionCount." + QUESTIONS.length;
        return A.has(exactKey) ? t(exactKey) : A.plural("quiz.questionCount", QUESTIONS.length);
    }

    function optionKey(question, original) {
        if (question.type === "truefalse") return original === 0 ? "quiz.true" : "quiz.false";
        return "quiz." + question.key + ".o" + (original + 1);
    }

    function rankFor(correct) {
        let rank = RANKS[0];
        RANKS.forEach((item) => {
            if (correct >= item.min) rank = item;
        });
        return rank;
    }

    function isTypingField(element) {
        return Boolean(element && element.closest && (element.isContentEditable || element.closest("input, textarea, select")));
    }

    // Each mode has its own best score, because the timed mode can give more points
    // (speed bonus). The points are saved as a number, the details of that game next to it:
    //   no timer: "quiz.best" + "quiz.bestRun"     timed: "quiz.bestTimed" + "quiz.bestTimedRun"
    function bestKeys(timed) {
        return timed
            ? { points: "quiz.bestTimed", details: "quiz.bestTimedRun" }
            : { points: "quiz.best", details: "quiz.bestRun" };
    }

    function readBest(timed) {
        const keys = bestKeys(timed);
        const points = A.storage.get(keys.points, null);
        if (typeof points !== "number" || !isFinite(points)) return null;
        const details = A.storage.get(keys.details, null) || {};
        return {
            points: points,
            correct: typeof details.correct === "number" ? details.correct : null,
            total: typeof details.total === "number" ? details.total : QUESTIONS.length
        };
    }

    function saveBest(timed, details) {
        const keys = bestKeys(timed);
        A.storage.set(keys.points, details.points);
        A.storage.set(keys.details, details);
    }

    // ---------- 5. The state of the quiz ----------
    const state = {
        screen: "start",              // "start", "question" or "results"
        timed: A.storage.get("quiz.timed", false) === true,   // the switch on the start screen
        gameTimed: false,             // was the current game started in timed mode?
        order: [],                    // question numbers in the order of this game
        optionOrders: [],             // for each question: the order of its options
        index: 0,                     // which question we are on
        answers: [],                  // what happened on each question
        points: 0,
        streak: 0,
        bestStreak: 0,
        result: null,                 // filled in when the game ends
        reviewFilter: "all"           // "all" or "mistakes"
    };

    // ---------- 6. The card that holds every screen ----------
    // The quiz is several screens down the page, so its card is built only when
    // it is needed (see section 17). Until then these three are null.
    let card = null;            // the glass card
    let stage = null;           // the part of the card where the screens take turns
    let live = null;            // the quiz's own line for screen-reader messages

    let ui = {};                // shortcuts to the elements of the current screen
    let paintScreen = null;     // re-writes the texts of the current screen
    let busy = false;           // true while one screen fades into the next
    let swapTimer = 0;
    let resizeTimer = 0;
    let onScreen = false;       // can you see the quiz? (see section 17)

    function paint() {
        if (paintScreen) paintScreen();
    }

    // ----- Numbers that count up on screen (the score, the result in %) -----
    const counters = {};        // the ones counting right now, by name

    // Counts the number in "element" from "from" up to "to" in "duration" ms:
    // fast at first, slower at the end. done() runs when it has arrived.
    // TODO(core): effects.js and lessons.js count numbers up too; a shared
    // A.countUp(element, from, to, duration) would replace the three copies.
    function countUp(name, element, from, to, duration, done) {
        stopCounter(name);
        const start = performance.now();
        const write = (value) => {
            element.textContent = A.format.number(Math.round(value));
        };
        const arrive = () => {
            delete counters[name];
            if (done) done();
        };
        const counter = {
            frame: 0,
            // Jumps straight to the end (when animations are switched off meanwhile)
            finish: () => {
                cancelAnimationFrame(counter.frame);
                write(to);
                arrive();
            }
        };
        const step = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            write(A.util.lerp(from, to, 1 - Math.pow(1 - progress, 3)));
            if (progress < 1 && element.isConnected) counter.frame = requestAnimationFrame(step);
            else arrive();
        };
        counters[name] = counter;
        counter.frame = requestAnimationFrame(step);
    }

    function stopCounter(name) {
        if (!counters[name]) return;
        cancelAnimationFrame(counters[name].frame);
        delete counters[name];
    }

    // Stops the numbers that are counting up (score, percentage)
    function stopCounters() {
        Object.keys(counters).forEach(stopCounter);
    }

    // Swaps the current screen for a new one: the old one fades out,
    // the card smoothly changes its height and the new one slides in.
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
                }, 650);
            }

            busy = false;

            // Bring the top of the card back into view (e.g. after "Next" on a phone)
            if (settings.reveal) {
                const box = card.getBoundingClientRect();
                if (box.top < 0 || box.top > window.innerHeight * 0.8) {
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
            swapTimer = setTimeout(swap, 220);
        } else {
            swap();
        }
    }

    // ---------- 7. START screen ----------
    function buildStart() {
        // Rule 3 has two versions: keyboard shortcuts, or "tap" for touch screens.
        // CSS shows the one that fits the device. paintStart() writes the texts
        // of the rules, because some of them contain numbers.
        const rules = [
            ["🧩", "quiz.start.rule1"],
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

                '<ul class="qz-tiles qz-start-tiles">' +
                    '<li class="qz-tile"><strong class="qz-tile-value">' + QUESTIONS.length + '</strong><span class="qz-tile-label" data-ref="questionsLabel"></span></li>' +
                    '<li class="qz-tile"><strong class="qz-tile-value">~' + PLAY_MINUTES + '</strong><span class="qz-tile-label" data-ref="minutesLabel"></span></li>' +
                    '<li class="qz-tile qz-tile-best">' +
                        '<span class="qz-tile-icon" aria-hidden="true" data-ref="bestIcon"></span>' +
                        '<strong class="qz-tile-value" data-ref="bestValue"></strong>' +
                        '<span class="qz-tile-label" data-ref="bestLabel"></span>' +
                    "</li>" +
                "</ul>" +

                '<div class="qz-rules-box">' +
                    '<p class="qz-mini-title mono">' + text("quiz.start.rulesTitle") + "</p>" +
                    '<ul class="qz-rules">' + rules + "</ul>" +
                "</div>" +

                '<button class="qz-switch" type="button" role="switch" aria-checked="false" aria-labelledby="qz-timed-label" aria-describedby="qz-timed-desc">' +
                    '<span class="qz-switch-icon" aria-hidden="true">⏱️</span>' +
                    '<span class="qz-switch-text">' +
                        '<strong id="qz-timed-label">' + text("quiz.timed.label") + "</strong>" +
                        '<small id="qz-timed-desc" data-ref="timedDesc"></small>' +
                    "</span>" +
                    '<span class="qz-switch-state mono" aria-hidden="true" data-ref="timedState"></span>' +
                    '<span class="qz-switch-track" aria-hidden="true"><span class="qz-switch-thumb"></span></span>' +
                "</button>" +

                '<div class="qz-start-actions">' +
                    '<button class="btn btn-primary qz-start-button" type="button">' +
                        text("quiz.start.button") +
                        '<span class="qz-arrow" aria-hidden="true">→</span>' +
                    "</button>" +
                "</div>" +
            "</div>"
        );

        screen.querySelectorAll("[data-ref]").forEach((element) => {
            ui[element.getAttribute("data-ref")] = element;
        });
        ui.timedSwitch = screen.querySelector(".qz-switch");
        ui.rules = Array.prototype.slice.call(screen.querySelectorAll(".qz-rule-text"));

        ui.timedSwitch.addEventListener("click", () => setTimed(!state.timed));
        screen.querySelector(".qz-start-button").addEventListener("click", () => startGame());

        paintScreen = paintStart;
        return screen;
    }

    function paintStart() {
        // The "best score" tile shows the record of the mode that is switched on
        const best = readBest(state.timed);
        const bestLabel = t(state.timed ? "quiz.start.bestTimed" : "quiz.start.bestRelaxed");
        ui.startText.textContent = t("quiz.start.text", { questions: questionCount() });
        ui.questionsLabel.textContent = A.plural("quiz.start.questions", QUESTIONS.length);
        ui.minutesLabel.textContent = A.plural("quiz.start.minutes", PLAY_MINUTES);
        ui.bestValue.textContent = best ? A.format.number(best.points) : "—";
        ui.bestValue.parentNode.classList.toggle("is-empty", !best);
        ui.bestIcon.textContent = state.timed ? "⏱️" : "🌿";
        ui.bestLabel.textContent = best && best.correct !== null
            ? t("quiz.start.bestWith", { label: bestLabel, correct: best.correct, total: best.total })
            : bestLabel;
        ui.timedDesc.textContent = t("quiz.timed.desc", {
            time: A.plural("quiz.seconds", TIME_LIMIT),
            bonus: SPEED_BONUS_MAX
        });
        ui.timedState.textContent = t(state.timed ? "quiz.timed.on" : "quiz.timed.off");
        ui.timedSwitch.setAttribute("aria-checked", String(state.timed));

        // The rules: our own texts with a little HTML (<strong>, <kbd>), so they go in as HTML.
        // Unchanged ones are left alone (this runs again on every click of the switch).
        const numbers = { points: A.plural("quiz.points", BASE_POINTS), last: CHOICE_OPTIONS };
        ui.rules.forEach((element) => {
            const html = t(element.getAttribute("data-key"), numbers);
            if (element.innerHTML !== html) element.innerHTML = html;
        });
    }

    function setTimed(value) {
        state.timed = Boolean(value);
        A.storage.set("quiz.timed", state.timed);
        if (state.screen === "start" && ui.timedSwitch) paintStart();
    }

    // ---------- 8. QUESTION screen ----------
    function currentQuestion() {
        return QUESTIONS[state.order[state.index]];
    }

    function buildQuestion() {
        const question = currentQuestion();
        const order = state.optionOrders[state.index];
        const total = state.order.length;
        const isLast = state.index === total - 1;

        const options = order.map((original, position) =>
            '<button class="qz-option" type="button" data-position="' + position + '" style="--i:' + position + '">' +
                '<kbd class="qz-key" aria-hidden="true">' + (position + 1) + "</kbd>" +
                text(optionKey(question, original), "qz-option-text") +
                '<span class="qz-mark" aria-hidden="true"></span>' +
                '<span class="sr-only qz-sr-correct" data-i18n="quiz.q.srCorrect" hidden>' + t("quiz.q.srCorrect") + "</span>" +
                '<span class="sr-only qz-sr-picked" data-i18n="quiz.q.srPicked" hidden>' + t("quiz.q.srPicked") + "</span>" +
            "</button>"
        ).join("");

        let segments = "";
        for (let i = 0; i < total; i++) segments += '<span class="qz-seg"></span>';

        const timer = state.gameTimed
            ? '<div class="qz-timer" role="timer">' +
                  '<svg viewBox="0 0 64 64" aria-hidden="true">' +
                      '<circle class="qz-timer-track" cx="32" cy="32" r="' + TIMER_RADIUS + '"></circle>' +
                      '<circle class="qz-timer-bar" cx="32" cy="32" r="' + TIMER_RADIUS + '" stroke-dasharray="' + TIMER_LENGTH.toFixed(2) + '"></circle>' +
                  "</svg>" +
                  '<span class="qz-timer-num" aria-hidden="true">' + TIME_LIMIT + "</span>" +
                  '<span class="sr-only qz-timer-sr"></span>' +
              "</div>"
            : "";

        const screen = A.dom.fromHTML(
            '<div class="qz-screen qz-question' + (question.type === "truefalse" ? " is-truefalse" : "") + '">' +
                '<div class="qz-hud">' +
                    '<div class="qz-hud-left">' +
                        '<span class="qz-counter mono" aria-hidden="true" data-ref="counter"></span>' +
                        '<span class="qz-topic">' + text("quiz.topic." + question.topic) + "</span>" +
                    "</div>" +
                    '<div class="qz-hud-right">' +
                        '<div class="qz-score">' +
                            '<span class="qz-score-label mono">' + text("quiz.q.score") + "</span>" +
                            '<strong class="qz-score-value" data-ref="score"></strong>' +
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
                    '<p class="qz-type mono">' + text("quiz.q.type." + question.type) + "</p>" +
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
                    '<p class="qz-fb-explain">' + text("quiz." + question.key + ".explain") + "</p>" +
                    '<ul class="qz-fb-bonus" data-ref="fbBonus"></ul>' +
                    '<div class="qz-fb-actions">' +
                        '<button class="btn btn-primary qz-next" type="button">' +
                            text(isLast ? "quiz.q.finish" : "quiz.q.next") +
                            '<span class="qz-arrow" aria-hidden="true">→</span>' +
                        "</button>" +
                        '<span class="qz-hint mono">' + text("quiz.q.enterHint") + "</span>" +
                    "</div>" +
                "</div>" +
            "</div>"
        );

        screen.querySelectorAll("[data-ref]").forEach((element) => {
            ui[element.getAttribute("data-ref")] = element;
        });
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
        ui.quit.addEventListener("click", pressQuit);
        // Holding Enter down repeats the key, and every repeat would click again:
        // that is not a second press either
        ui.quit.addEventListener("keydown", (event) => {
            if (event.repeat && event.key === "Enter") event.preventDefault();
        });
        disarmQuit();

        paintScreen = paintQuestion;
        return screen;
    }

    function paintQuestion() {
        const total = state.order.length;
        const answered = state.answers.filter(Boolean).length;
        const record = state.answers[state.index];
        const question = currentQuestion();

        ui.counter.textContent = t("quiz.q.counter", { n: state.index + 1, total: total });
        ui.counterSr.textContent = t("quiz.q.counter", { n: state.index + 1, total: total }) + ". ";
        if (!counters.score) ui.score.textContent = A.format.number(state.points);

        // Streak counter: only shown from 2 correct answers in a row
        ui.streak.hidden = state.streak < 2;
        ui.streak.classList.toggle("is-hot", state.streak >= 4);
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
        // True/false explanations already start with "True." or "False."
        const showRight = !record.correct && question.type !== "truefalse";
        ui.fbAnswer.hidden = !showRight;
        ui.fbAnswer.textContent = showRight ? t("quiz.fb.rightAnswer", { answer: t(optionKey(question, question.correct)) }) : "";

        const bonus = [];
        if (record.base) bonus.push(["base", t("quiz.fb.base", { n: record.base })]);
        if (record.speed) bonus.push(["speed", "⚡ " + t("quiz.fb.speed", { n: record.speed })]);
        if (record.streakBonus) bonus.push(["streak", "🔥 " + t("quiz.fb.streak", { n: record.streakBonus })]);
        if (record.lostStreak >= 2) bonus.push(["lost", t("quiz.fb.streakLost")]);
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
    // After the first press the button asks "Sure?" for 4 seconds.
    let quitArmed = false;
    let quitTimer = 0;

    function pressQuit(event) {
        if (state.screen !== "question" || busy) return;
        if (quitArmed) {
            // The second click of a double-click (or of a bouncy mouse) is not a second press.
            // (Keyboard presses have detail 0.)
            if (event && event.detail > 1) return;
            disarmQuit();
            backToStart();
            return;
        }
        quitArmed = true;
        paintQuit();
        A.announce(t("quiz.q.quitHint"), { region: live });
        clearTimeout(quitTimer);
        quitTimer = setTimeout(disarmQuit, 4000);
    }

    function disarmQuit() {
        clearTimeout(quitTimer);
        quitArmed = false;
        paintQuit();
    }

    function paintQuit() {
        if (!ui.quit) return;
        ui.quit.classList.toggle("is-armed", quitArmed);
        ui.quitText.textContent = t(quitArmed ? "quiz.q.quitConfirm" : "quiz.q.quit");
    }

    // ---------- 9. The countdown (timed mode) ----------
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
        if (running) timer.remaining -= A.util.clamp(now - timer.last, 0, 100);
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
        ui.timer.classList.toggle("is-warning", seconds <= 10 && seconds > 5);
        ui.timer.classList.toggle("is-danger", seconds <= 5);
        if (seconds <= 5 && seconds > 0 && timer.active) A.dom.replay(ui.timerNum, "is-tick");

        if (seconds === 5 && !timer.warned && timer.active) {
            timer.warned = true;
            A.announce(t("quiz.q.timeLeft", { time: A.plural("quiz.seconds", 5) }), { region: live });
        }
    }

    // ---------- 10. Answering ----------
    // position: which button was chosen (0-3), or null when the time ran out
    function answer(position) {
        if (state.screen !== "question" || busy || state.answers[state.index]) return;

        const question = currentQuestion();
        const order = state.optionOrders[state.index];
        const picked = position === null ? null : order[position];
        if (position !== null && picked === undefined) return;

        const correct = picked === question.correct;
        const secondsLeft = state.gameTimed ? Math.max(0, timer.remaining) / 1000 : 0;
        stopTimer();

        const record = {
            picked: picked,
            correct: correct,
            timeout: position === null,
            base: 0,
            speed: 0,
            streakBonus: 0,
            points: 0,
            lostStreak: 0,
            praise: 1 + Math.floor(Math.random() * PRAISE_COUNT)
        };

        if (correct) {
            state.streak += 1;
            record.base = BASE_POINTS;
            if (state.gameTimed) record.speed = Math.round(SPEED_BONUS_MAX * Math.min(1, secondsLeft / TIME_LIMIT));
            if (state.streak >= 2) record.streakBonus = Math.min(STREAK_BONUS_MAX, (state.streak - 1) * STREAK_STEP);
            record.points = record.base + record.speed + record.streakBonus;
        } else {
            record.lostStreak = state.streak;
            state.streak = 0;
        }
        state.bestStreak = Math.max(state.bestStreak, state.streak);

        const oldPoints = state.points;
        state.points += record.points;
        state.answers[state.index] = record;

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
        if (state.streak >= 2) A.dom.replay(ui.streak, "is-bump");

        // The message for screen readers: result, points, right answer, explanation
        const parts = [feedbackTitle(record)];
        if (record.points > 0) parts.push("+" + A.plural("quiz.points", record.points) + ".");
        if (!record.correct && question.type !== "truefalse") {
            parts.push(t("quiz.fb.rightAnswer", { answer: t(optionKey(question, question.correct)) }) + ".");
        }
        parts.push(t("quiz." + question.key + ".explain"));
        A.announce(parts.join(" "), { region: live });

        if (keepFocus) ui.next.focus({ preventScroll: true });

        // Make sure the explanation and the "Next" button can be seen.
        // The button stops above the assistant's round button in the bottom corner,
        // but we never scroll so far that the top of the explanation disappears
        // under the menu bar. (Both sizes come from the CSS and are smaller on phones.)
        requestAnimationFrame(() => {
            if (!ui.next || !ui.next.isConnected) return;
            const topSpace = A.layout.navHeight() + SCROLL_GAP;
            const bottomSpace = A.layout.px("--launcher-room", 96) + SCROLL_GAP;
            // The feedback is still sliding in from a little lower (its "is-in" animation):
            // measure where it will stop, not where it is now
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
        stopCounter("score");
        if (!ui.score) return;
        if (A.motion.ok()) countUp("score", ui.score, from, to, 700);
        else ui.score.textContent = A.format.number(to);
    }

    function goNext() {
        if (state.screen !== "question" || busy || !state.answers[state.index]) return;
        if (state.index < state.order.length - 1) {
            state.index += 1;
            showScreen(buildQuestion, { focus: ".qz-question-text", reveal: true, after: beginQuestion });
        } else {
            finishGame();
        }
    }

    function beginQuestion() {
        if (state.gameTimed && !state.answers[state.index]) startTimer();
    }

    // ---------- 11. Starting and finishing a game ----------
    function startGame(options) {
        const settings = options || {};
        stopTimer();
        stopConfetti();
        card.classList.remove("is-flash-good", "is-flash-bad");
        state.gameTimed = state.timed;
        state.order = A.util.shuffle(QUESTIONS.map((question, index) => index));
        state.optionOrders = state.order.map((index) =>
            QUESTIONS[index].type === "truefalse"
                ? [0, 1]
                : A.util.shuffle(Array.from({ length: CHOICE_OPTIONS }, (value, option) => option))
        );
        state.index = 0;
        state.answers = [];
        state.points = 0;
        state.streak = 0;
        state.bestStreak = 0;
        state.result = null;
        state.reviewFilter = "all";
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
        const total = state.order.length;
        const correct = state.answers.filter((record) => record && record.correct).length;
        // Compare with the best score of the same mode (timed or not)
        const best = readBest(state.gameTimed);
        const isNewBest = state.points > 0 && (!best || state.points > best.points);

        if (isNewBest) {
            saveBest(state.gameTimed, {
                points: state.points,
                correct: correct,
                total: total,
                timed: state.gameTimed,
                date: new Date().toISOString().slice(0, 10)
            });
        }

        state.result = {
            correct: correct,
            total: total,
            percent: Math.round((correct / total) * 100),
            points: state.points,
            bestStreak: state.bestStreak,
            timed: state.gameTimed,
            isNewBest: isNewBest,
            previousBest: best ? best.points : null,
            rank: rankFor(correct)
        };
        state.screen = "results";
        ringShown = false;
        showScreen(buildResults, {
            focus: ".qz-res-title",
            forceFocus: settings.forceFocus,
            reveal: settings.reveal !== false,
            after: animateResults
        });
    }

    function backToStart() {
        stopTimer();
        stopConfetti();
        state.screen = "start";
        showScreen(buildStart, { focus: ".qz-start-title", reveal: true });
    }

    // ---------- 12. RESULTS screen ----------
    function buildResults() {
        const result = state.result;
        const rank = result.rank;

        const review = state.order.map((questionIndex, position) => {
            const question = QUESTIONS[questionIndex];
            const record = state.answers[position];
            const status = record.timeout ? "timeout" : record.correct ? "correct" : "wrong";
            const statusKey = "quiz.review.status" + status.charAt(0).toUpperCase() + status.slice(1);
            const yourAnswer = record.timeout
                ? text("quiz.review.noAnswer", "qz-ri-value")
                : text(optionKey(question, record.picked), "qz-ri-value");
            const rightLine = record.correct
                ? ""
                : '<p class="qz-ri-line is-right">' + text("quiz.review.rightAnswer", "qz-ri-label") + " " + text(optionKey(question, question.correct), "qz-ri-value") + "</p>";

            let learn = "";
            if (typeof question.learn === "number" && A.lessons) {
                learn = '<button class="btn btn-ghost btn-small qz-ri-learn" type="button" data-lesson="' + question.learn + '"><span aria-hidden="true">📚</span><span class="qz-ri-learn-text"></span></button>';
            } else if (question.learn === "timeline" && document.getElementById("timeline")) {
                learn = '<button class="btn btn-ghost btn-small qz-ri-learn" type="button" data-section="timeline"><span aria-hidden="true">🕰️</span>' + text("quiz.review.timeline") + "</button>";
            }

            return '<li class="qz-ri is-' + status + '" data-status="' + status + '">' +
                "<details>" +
                    "<summary>" +
                        '<span class="qz-ri-status" aria-hidden="true"></span>' +
                        '<span class="qz-ri-num mono" aria-hidden="true">' + String(position + 1).padStart(2, "0") + "</span>" +
                        '<span class="qz-ri-question">' + text("quiz." + question.key + ".text") +
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

        const tiles = [
            ["correct", "quiz.res.correct", "✅"],
            ["points", "quiz.res.points", "⭐"],
            ["streak", "quiz.res.bestStreak", "🔥"],
            ["mode", "quiz.res.mode", result.timed ? "⏱️" : "🌿"]
        ].map((tile, index) =>
            '<li class="qz-tile qz-tile-' + tile[0] + '" style="--i:' + index + '">' +
                '<span class="qz-tile-icon" aria-hidden="true">' + tile[2] + "</span>" +
                '<strong class="qz-tile-value" data-ref="tile-' + tile[0] + '"></strong>' +
                text(tile[1], "qz-tile-label") +
            "</li>"
        ).join("");

        const screen = A.dom.fromHTML(
            '<div class="qz-screen qz-results rank-' + rank.id + '">' +
                '<div class="qz-res-hero">' +
                    '<div class="qz-res-ring" data-ref="ring">' +
                        '<svg viewBox="0 0 160 160" aria-hidden="true">' +
                            "<defs>" +
                                '<linearGradient id="qz-ring-gradient" x1="0" y1="0" x2="1" y2="1">' +
                                    '<stop class="qz-stop-a" offset="0"></stop>' +
                                    '<stop class="qz-stop-b" offset="1"></stop>' +
                                "</linearGradient>" +
                            "</defs>" +
                            '<circle class="qz-res-ticks" cx="80" cy="80" r="77"></circle>' +
                            '<circle class="qz-res-track" cx="80" cy="80" r="' + RESULT_RADIUS + '"></circle>' +
                            '<circle class="qz-res-bar" cx="80" cy="80" r="' + RESULT_RADIUS + '" stroke="url(#qz-ring-gradient)" stroke-dasharray="' + RESULT_LENGTH.toFixed(2) + '" stroke-dashoffset="' + RESULT_LENGTH.toFixed(2) + '"></circle>' +
                        "</svg>" +
                        '<div class="qz-res-center" aria-hidden="true">' +
                            '<strong class="qz-res-percent"><span data-ref="percent">0</span><span class="qz-res-pct">%</span></strong>' +
                            '<span class="qz-res-caption mono">' + text("quiz.res.ringCaption") + "</span>" +
                        "</div>" +
                        '<span class="sr-only" data-ref="ringSr"></span>' +
                    "</div>" +
                    '<div class="qz-res-info">' +
                        '<p class="qz-kicker mono">' + text("quiz.res.kicker") + "</p>" +
                        '<h3 class="qz-res-title" tabindex="-1">' +
                            '<span class="qz-rank-emoji" aria-hidden="true">' + rank.emoji + "</span>" +
                            text("quiz.rank." + rank.id, "qz-rank-name") +
                        "</h3>" +
                        '<p class="qz-res-text">' + text("quiz.rank." + rank.id + "Text") + "</p>" +
                        '<p class="qz-best' + (result.isNewBest ? " is-new" : "") + '" data-ref="best">' +
                            '<span aria-hidden="true">' + (result.isNewBest ? "✨" : "🏅") + "</span>" +
                            '<span data-ref="bestText"></span>' +
                        "</p>" +
                    "</div>" +
                "</div>" +

                '<ul class="qz-tiles qz-res-tiles">' + tiles + "</ul>" +

                '<div class="qz-res-actions">' +
                    '<button class="btn btn-primary qz-retry" type="button"><span class="qz-retry-icon" aria-hidden="true">↻</span>' + text("quiz.res.retry") + "</button>" +
                    '<button class="btn btn-ghost qz-copy" type="button">' +
                        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
                        text("quiz.res.copy", "qz-copy-label") +
                        text("quiz.res.copiedLabel", "qz-copied-label") +
                    "</button>" +
                    '<button class="btn btn-ghost qz-to-start" type="button">' + text("quiz.res.toStart") + "</button>" +
                "</div>" +

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

        screen.querySelectorAll("[data-ref]").forEach((element) => {
            ui[element.getAttribute("data-ref")] = element;
        });
        ui.items = Array.prototype.slice.call(screen.querySelectorAll(".qz-ri"));
        ui.copy = screen.querySelector(".qz-copy");

        screen.querySelector(".qz-retry").addEventListener("click", () => startGame());
        screen.querySelector(".qz-to-start").addEventListener("click", backToStart);
        ui.copy.addEventListener("click", copyResult);

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
        if (!counters.percent) ui.percent.textContent = A.format.number(ringShown ? result.percent : 0);

        ui["tile-correct"].textContent = result.correct + " / " + result.total;
        ui["tile-points"].textContent = A.format.number(result.points);
        ui["tile-streak"].textContent = String(result.bestStreak);
        ui["tile-mode"].textContent = t(result.timed ? "quiz.res.modeTimed" : "quiz.res.modeRelaxed");

        // "New best score!" or the best score of this mode.
        // No best score yet (a first game with 0 points)? Then the badge stays hidden.
        const best = readBest(result.timed);
        ui.best.hidden = !result.isNewBest && !best;
        if (result.isNewBest) {
            ui.bestText.textContent = t("quiz.res.newBest");
        } else if (best) {
            ui.bestText.textContent = t(result.timed ? "quiz.res.bestWasTimed" : "quiz.res.bestWas", {
                points: A.plural("quiz.points", best.points)
            });
        }

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
    let ringShown = false;

    function animateResults() {
        const result = state.result;
        const bar = stage.querySelector(".qz-res-bar");
        if (!bar || !result) return;
        const target = RESULT_LENGTH * (1 - result.percent / 100);
        bar.classList.toggle("is-empty", result.percent === 0);

        // A short summary for screen-reader users
        let summary = t("quiz.res.announce", {
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
        countUp("percent", ui.percent, 0, result.percent, 1400, () => {
            ringShown = true;
            if (ring.isConnected) A.dom.replay(ring, "is-done");
        });

        if (result.isNewBest) {
            clearTimeout(confettiTimer);
            confettiTimer = setTimeout(burstConfetti, CONFETTI_DELAY);
        }
    }

    // ---------- 13. Confetti (only for a new best score) ----------
    // effects.js draws it: one burst from the middle of the score ring.
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

    // ---------- 14. "Copy my result" ----------
    let copiedTimer = 0;

    function copyResult() {
        const result = state.result;
        if (!result) return;
        let message = t("quiz.share.text", {
            correct: result.correct,
            total: result.total,
            percent: result.percent,
            points: A.plural("quiz.points", result.points),
            rank: t("quiz.rank." + result.rank.id),
            emoji: result.rank.emoji
        });
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
            copiedTimer = setTimeout(() => button.classList.remove("is-copied"), 2200);
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

    // ---------- 15. Keyboard: number keys to answer, Enter for the next question ----------
    document.addEventListener("keydown", (event) => {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        if (state.screen !== "question" || busy) return;
        if (isTypingField(event.target) || A.overlays.hasModal()) return;

        // Only when the quiz is on screen (or has the focus)
        const focusInside = card.contains(document.activeElement);
        if (!focusInside && !onScreen) return;

        const answered = Boolean(state.answers[state.index]);

        // Number keys: 1 for the first answer, 2 for the second, ...
        if (!answered && /^[1-9]$/.test(event.key)) {
            const button = ui.options && ui.options[Number(event.key) - 1];
            if (!button) return;
            event.preventDefault();
            A.dom.replay(button, "is-pressed");
            answer(Number(event.key) - 1);
            return;
        }

        if (answered && event.key === "Enter") {
            // Real buttons and links already react to Enter by themselves
            const target = event.target;
            const control = target.closest ? target.closest("a, button, summary, [role='button']") : null;
            if (control && !control.classList.contains("qz-option")) return;
            event.preventDefault();
            goNext();
        }
    });

    // ---------- 16. Pop-up windows, calm mode and the language ----------
    // A pop-up window that shuts out the page (the lesson reader, the command palette,
    // the chat on phones) pauses the countdown; it goes on when the last one closes
    A.overlays.onChange((detail) => {
        timer.blocked = detail.modal;
        if (!timer.active) return;
        if (timer.blocked) drawTimer(true);
        else resumeTimer();
    });

    // Animations switched off meanwhile (calm mode): numbers that are counting jump to the end
    A.motion.onChange((detail) => {
        if (!detail.ok) Object.keys(counters).forEach((name) => counters[name].finish());
    });

    // core.js has already translated every [data-i18n] element;
    // here we re-write the texts that contain numbers
    A.onLanguageChange(() => {
        paint();
        if (timer.active) {
            timer.seconds = -1;
            drawTimer(!timer.frame);
        }
    });

    // ---------- 17. Building the quiz ----------
    // The card and its start screen are built when the quiz comes near the screen,
    // when the browser has a quiet moment after loading, or when ensure() is called
    // first (by AICompass.quiz.start). With a link like #quiz, core builds it at once.
    function build() {
        mount.innerHTML =
            '<div class="qz-card card" data-reveal>' +
                '<span class="qz-corners" aria-hidden="true"></span>' +
                '<div class="qz-stage"></div>' +
                '<p class="sr-only qz-live" aria-live="polite" aria-atomic="true"></p>' +
            "</div>";
        card = mount.querySelector(".qz-card");
        stage = mount.querySelector(".qz-stage");
        live = mount.querySelector(".qz-live");

        // The countdown, the number keys and the decorations only work while you can see
        // the quiz: core tells us when it comes on or goes off screen (or the browser
        // tab is hidden), and pauses its CSS animations meanwhile (data-paused).
        A.whenVisible(mount, (visible) => {
            onScreen = visible;
            if (visible) resumeTimer();
        }, { pauseAnimations: true, rootMargin: ON_SCREEN_MARGIN });

        showScreen(buildStart);
    }

    const ensure = A.whenNeeded(mount, build);

    // ---------- 18. Public API + Ctrl+K commands ----------
    // AICompass.quiz.start(): scrolls to the quiz and starts it.
    // A game that is already running just continues.
    // Optional: start({ timed: true }) to choose the mode.
    function startQuiz(options) {
        ensure();
        const settings = options || {};
        const wantsMode = typeof settings.timed === "boolean";
        if (wantsMode) setTimed(settings.timed);
        // Core closes the pop-up windows in the way and scrolls; the focus is moved below
        A.navigate("quiz", { focus: false });

        // Act after the command palette (if any) has closed and given the focus back
        setTimeout(() => {
            const playing = state.screen === "question";
            if (playing && state.answers.filter(Boolean).length === state.order.length) {
                // Every question is answered already: show the results first, so the
                // score isn't lost. A new game (in either mode) can start from there.
                finishGame({ forceFocus: true, reveal: false });
            } else if (playing && (!wantsMode || settings.timed === state.gameTimed)) {
                const heading = stage.querySelector(".qz-question-text");
                if (heading) heading.focus({ preventScroll: true });
            } else {
                startGame({ forceFocus: true, reveal: false });
            }
        }, 80);
    }

    // Other features use AICompass.quiz.start() (AICompass.startQuiz is the older name)
    A.feature("quiz", { start: startQuiz });
    A.startQuiz = startQuiz;

    A.registerCommand({
        id: "quiz-start",
        group: "quiz.cmdGroup",
        icon: "🏆",
        title: () => t("quiz.cmd.start"),
        keywords: "quiz test challenge start play questions score тест викторина испытание вопросы начать играть",
        run: () => startQuiz()
    });

    A.registerCommand({
        id: "quiz-start-timed",
        group: "quiz.cmdGroup",
        icon: "⏱️",
        title: () => t("quiz.cmd.startTimed"),
        keywords: "quiz timed timer speed fast challenge тест таймер на время скорость быстро испытание",
        run: () => startQuiz({ timed: true })
    });
})();
