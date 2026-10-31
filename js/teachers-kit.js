/* =========================================================
   AI COMPASS — THE TEACHER KIT
   The two windows of the "For teachers" section. js/teachers.js loads
   this file (with its texts and styles) the first time a teacher opens
   one of them, so the page itself doesn't get any slower:
   - the document window ("teacher-plan"): the lesson plan, the
     worksheet or the answer key of a lesson, on a sheet of paper, with
     "Print" (only the sheet is printed, black on white, on A4) and
     "Copy as text" (to paste into a document of your own);
   - the classroom quiz ("classroom-quiz"): a full-screen quiz for the
     projector, with questions from the quiz bank (AICompass.quiz), a
     timer, team scores and keys for a presentation clicker.

   Sections of this file:
    1. Settings
    2. Small helpers
    3. Loading the plans and the quiz questions
    4. The lesson plan
    5. The worksheet and its answer key
    6. Copy as text
    7. The document window
    8. The classroom quiz: its settings (kept in this browser)
    9. The classroom quiz: the window and its screens
   10. The classroom quiz: playing (the timer, the answer, the teams, the keys)
   11. Language changes and the API
   Texts: js/content/teachers-kit.js. The plans and worksheets:
   js/content/teachers-basics.js (lessons 1-6) and
   js/content/teachers-deep.js (lessons 7-12). Styles: css/teachers-kit.css.

   API, for js/teachers.js only (others use AICompass.teachers):
       AICompass.teachersKit.openDocument(view, n, opener)
           view: "plan", "worksheet" or "answers"; n: the lesson
       AICompass.teachersKit.classroomQuiz(options)
           options (all optional):
             opener    the element to give the focus back to
             lessons   [1, 2, "timeline"...]: the lessons to ask about
             count     5-20 questions; timer: 0 or 10-60 seconds;
             teams     0 or 2-4; myths: true or false
             start     true: start at once, without the settings screen
   Both return true once their window is open.
   Progress event: A.track("teacher.open", { what, n }): what is "plan",
   "worksheet", "answers" (with n, the lesson) or "quiz".
   Storage: "teachers.quiz" = { v: 1, lessons, count, timer, teams, myths },
   the classroom quiz's settings, only in this browser.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const data = A && A.content.get("teachers");
    if (!A || !data || !A.lessons || !A.overlays) return;

    const t = A.t;
    const esc = A.escapeHTML;
    const root = document.documentElement;

    // ---------- 1. Settings ----------
    // The plans and worksheets of each track (each file is big: it loads when needed)
    const PLAN_FILES = {
        basics: "js/content/teachers-basics.js",
        deep: "js/content/teachers-deep.js"
    };

    // The three documents of a lesson, in the order of their tabs
    const VIEWS = [
        { id: "plan", icon: "📝", label: "teachers.plan", what: "plan" },
        { id: "worksheet", icon: "✏️", label: "teachers.worksheet", what: "worksheet" },
        { id: "answers", icon: "✅", label: "teachers.answers", what: "answers" }
    ];

    const CLOSE_TIME = 300;          // ms: the closing animation of both windows (css/teachers-kit.css)
    const QUIZ_ICON = "📽️";

    // The classroom quiz
    const COUNT = { min: 5, max: 20, start: 10 };   // how many questions: the slider and where it starts
    const TIMERS = [0, 10, 20, 30, 45, 60];         // seconds for each question (0: no timer)
    const TEAMS = [0, 2, 3, 4];                     // how many teams (0: no team scores)
    const HISTORY = "timeline";                     // the "lesson" of the quiz bank's history questions
    const TICK = 200;                               // ms between two looks at the timer
    const STORE_KEY = "teachers.quiz";              // its settings, kept only in this browser
    const OVERLAY_DOC = "teacher-plan";             // the windows' names for A.overlays
    const OVERLAY_QUIZ = "classroom-quiz";

    // ---------- 2. Small helpers ----------
    const LESSONS = A.lessons.list();
    const LESSON_NUMBERS = LESSONS.map(function (lesson) { return lesson.number; });

    function lessonInfo(n) {
        return LESSONS.find(function (lesson) { return lesson.number === n; }) || null;
    }

    function lessonUrl(n) {
        return data.siteUrl + "#lesson-" + n;
    }

    // The letters of answers, in the current language: ["A", "B", ...] or ["А", "Б", ...]
    function letters() {
        return t("teachers.letters").split(" ");
    }

    // A copy of a list of texts in alphabetical order (as a worksheet shows them)
    function alphabetical(list) {
        return list.slice().sort(function (a, b) { return a.localeCompare(b, A.lang); });
    }

    // A number from a text, always the same for the same text (FNV-1a)
    function hashOf(text) {
        let hash = 2166136261;
        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }

    // 0, 1, ... count-1 in a mixed order that is always the same for the same
    // seed text (so a printed worksheet and its answer key always agree)
    function seededOrder(count, seedText) {
        let seed = hashOf(seedText) || 1;
        function random() {                  // "mulberry32": a tiny random number generator
            seed = (seed + 0x6D2B79F5) >>> 0;
            let x = seed;
            x = Math.imul(x ^ (x >>> 15), x | 1);
            x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
            return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        }
        const order = [];
        for (let i = 0; i < count; i++) order.push(i);
        for (let i = count - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            const keep = order[i];
            order[i] = order[j];
            order[j] = keep;
        }
        return order;
    }

    // The options of a quiz question on paper: a multiple-choice question gets
    // its own fixed order (in the bank the right answer is always the first one)
    function paperOrder(question) {
        const all = question.options.map(function (option, i) { return i; });
        return question.type === "choice" ? seededOrder(all.length, question.id) : all;
    }

    // Texts with gaps: "a [word] here" -> [{ text: "a " }, { gap: "word" }, { text: " here" }]
    const GAP = /\[([^\[\]]+)\]/g;
    const ENDS_WITH_GAP = /^([^\[\]]*)\[([^\[\]]+)\]\s*$/;

    function splitGaps(text) {
        const parts = [];
        let last = 0;
        let match;
        GAP.lastIndex = 0;
        while ((match = GAP.exec(text))) {
            if (match.index > last) parts.push({ text: text.slice(last, match.index) });
            parts.push({ gap: match[1] });
            last = GAP.lastIndex;
        }
        if (last < text.length) parts.push({ text: text.slice(last) });
        return parts;
    }

    // A gap on the worksheet: an empty line about as long as its answer
    function blankHTML(answer) {
        const width = Math.max(4, Math.min(20, Math.round(answer.length * 0.6)));
        return `<span class="tk-gap" style="--tk-gap: ${width}em"><span class="sr-only">${esc(t("teachers.sheet.gap"))}</span></span>`;
    }

    function answerHTML(answer) {
        return `<strong class="tk-answer">${esc(answer)}</strong>`;
    }

    // A text with its gaps: empty on the worksheet, filled in on the answer key
    function gapsHTML(text, withAnswers) {
        return splitGaps(text).map(function (part) {
            if (part.gap === undefined) return esc(part.text);
            return withAnswers ? answerHTML(part.gap) : blankHTML(part.gap);
        }).join("");
    }

    // Lines to write on
    function linesHTML(count) {
        let lines = "";
        for (let i = 0; i < count; i++) lines += '<span class="tk-line"></span>';
        return `<div class="tk-lines" data-tk-lines="${count}">${lines}</div>`;
    }

    // An element can take the focus back (it is still on the page, and shown)
    function canTakeFocus(element) {
        return Boolean(element && element.isConnected && typeof element.focus === "function" &&
            element !== document.body && element !== root &&
            !element.closest("[hidden]") && element.getClientRects().length > 0);
    }

    // ---------- 3. Loading the plans and the quiz questions ----------
    function storedPlan(n) {
        const plans = A.content.get("teachers-plans");
        return plans && plans[n] ? plans[n] : null;
    }

    function loadPlan(n) {
        const file = PLAN_FILES[A.lessons.trackOf(n)];
        if (!file) return Promise.reject(new Error("No plan file for lesson " + n));
        return A.loadScript(file).then(function () {
            const plan = storedPlan(n);
            if (!plan) throw new Error("No plan for lesson " + n);
            // The other track's file too, in a quiet moment: then every plan
            // opens at once, and (with the site saved for offline use) works offline
            A.whenIdle(function () {
                Object.keys(PLAN_FILES).forEach(function (track) {
                    A.loadScript(PLAN_FILES[track]).catch(function () {});
                });
            });
            return plan;
        });
    }

    function hasQuiz() {
        return Boolean(A.quiz && typeof A.quiz.ready === "function" && typeof A.quiz.question === "function");
    }

    // The quiz bank's texts (the documents work without them: only the quiz
    // questions are left out)
    function questionsReady() {
        if (!hasQuiz()) return Promise.resolve(false);
        return A.quiz.ready().then(function () { return true; }, function () { return false; });
    }

    function bankQuestion(id) {
        return hasQuiz() ? A.quiz.question(id) : null;
    }

    // ---------- 4. The lesson plan ----------
    // The top of every document: the site and the kind of document, the lesson, and a line of facts
    function documentHead(view, n, facts) {
        const kind = VIEWS.find(function (item) { return item.id === view; });
        return `
            <header class="tk-doc-head">
                <p class="tk-doc-kicker">${esc(data.siteName)} · ${esc(t(kind.label))}</p>
                <h1 class="tk-doc-title" id="tk-doc-title" tabindex="-1">${esc(t("teachers.plan.heading", { n: n, title: A.lessons.title(n) }))}</h1>
                ${facts && facts.length ? `<p class="tk-doc-meta">${facts.map(esc).join(" · ")}</p>` : ""}
            </header>`;
    }

    function trackFact(n) {
        const tracks = A.lessons.tracks();
        const index = tracks.findIndex(function (track) { return track.lessons.indexOf(n) !== -1; });
        return index === -1 ? "" : t("teachers.track", { n: index + 1 }) + ": " + tracks[index].title();
    }

    function classMinutes() {
        return data.planSteps.reduce(function (total, step) { return total + step.minutes; }, 0);
    }

    // A question from the quiz bank with its options (and, on the teacher's
    // side, its answer and why). "" when the bank isn't there.
    // tag: the element that holds it ("li" in the worksheet's quick quiz)
    function bankQuestionHTML(id, withAnswer, tag) {
        const box = tag || "div";
        const question = bankQuestion(id);
        if (!question) return "";
        const marks = letters();
        const order = paperOrder(question);
        const rightAt = order.indexOf(question.correct);
        const options = order.map(function (original, i) {
            const right = withAnswer && original === question.correct;
            return `<li class="tk-option${right ? " is-right" : ""}"><span class="tk-option-letter">${esc(marks[i])}</span><span>${esc(question.options[original])}</span></li>`;
        }).join("");
        const answer = withAnswer ? `
            <p class="tk-bank-answer"><strong class="tk-answer">${esc(t("teachers.plan.answer", { answer: marks[rightAt] + ". " + question.options[question.correct] }))}</strong>
            ${esc(question.explain)}</p>` : "";
        return `
            <${box} class="tk-bank" data-tk-question="${esc(id)}">
                <p class="tk-bank-text">${esc(question.text)}</p>
                <ul class="tk-options">${options}</ul>
                ${answer}
            </${box}>`;
    }

    // "To go further": the lesson's AI Lab experiment, when the lab can name it
    // (AICompass.lab.list(), from the lab hub; without it the line is left out)
    function goFurtherHTML(n) {
        const lesson = lessonInfo(n);
        if (!lesson || !lesson.experiment || !A.lab || typeof A.lab.list !== "function") return "";
        const experiment = A.lab.list().find(function (item) { return item.id === lesson.experiment; });
        if (!experiment || !experiment.titleKey) return "";
        return `<p>${esc(t("teachers.plan.goFurther", { title: t(experiment.titleKey), url: data.siteUrl + "#lab/" + experiment.id }))}</p>`;
    }

    // A button on the screen (never printed or copied)
    function screenButton(attributes, icon, label) {
        return `<p class="tk-screen-only"><button class="tk-doc-link" type="button" ${attributes}><span aria-hidden="true">${icon}</span> ${esc(label)}</button></p>`;
    }

    // The five steps of the class, each with its own part of the plan
    const STEPS = {
        warmup: function (part) {
            return `
                <p class="tk-label">${esc(t("teachers.plan.ask"))}</p>
                <p class="tk-quote">${esc(part.warmup)}</p>
                <p><span class="tk-label">${esc(t("teachers.plan.howTo"))}</span> ${esc(part.warmupNote)}</p>`;
        },
        reading: function (part, n) {
            const lesson = lessonInfo(n);
            return `
                <p>${esc(t("teachers.plan.read", { n: n, title: A.lessons.title(n), time: A.plural("teachers.minutes", lesson.minutes) }))}</p>
                <p><span class="tk-label">${esc(t("teachers.plan.lookFor"))}</span> ${esc(part.reading)}</p>
                ${screenButton(`data-tk-reader="lesson" data-tk-focus="open-lesson"`, "📖", t("teachers.plan.openLesson", { n: n }))}`;
        },
        activity: function (part, n) {
            return `
                <p class="tk-activity-title">${esc(part.activity.title)}</p>
                <ol class="tk-list tk-steps-list">${part.activity.steps.map(function (step) { return `<li>${esc(step)}</li>`; }).join("")}</ol>
                <p><span class="tk-label">${esc(t("teachers.plan.extension"))}</span> ${esc(part.extension)}</p>
                ${goFurtherHTML(n)}
                ${screenButton(`data-tk-reader="lab" data-tk-focus="open-lab"`, "🧪", t("teachers.plan.openLab"))}`;
        },
        discussion: function (part) {
            return `
                <p class="tk-label">${esc(t("teachers.plan.discuss"))}</p>
                <ul class="tk-list">${part.discussion.map(function (question) { return `<li>${esc(question)}</li>`; }).join("")}</ul>`;
        },
        exit: function (part, n, plan) {
            const question = bankQuestionHTML(plan.exit, true);
            return `
                <p class="tk-label">${esc(t("teachers.plan.exitWrite"))}</p>
                <p class="tk-quote">${esc(part.exit)}</p>
                ${question ? `<p class="tk-label">${esc(t("teachers.plan.exitQuiz"))}</p>${question}` : ""}`;
        }
    };

    function planHTML(n, plan) {
        const part = plan[A.lang] || plan.en;
        const lesson = lessonInfo(n);
        const facts = [
            trackFact(n),
            A.plural("teachers.plan.class", classMinutes()),
            t("teachers.plan.readingTime", { time: A.plural("teachers.minutes", lesson.minutes) })
        ].filter(Boolean);

        const steps = data.planSteps.map(function (step, i) {
            const render = STEPS[step.id];
            if (!render) return "";
            return `
                <section class="tk-step">
                    <h3 class="tk-step-head">
                        <span class="tk-step-number">${A.format.number(i + 1)}</span>
                        <span class="tk-step-name">${esc(t("teachers.step." + step.id))}</span>
                        <span class="tk-step-time">${esc(A.plural("teachers.minutes", step.minutes))}</span>
                    </h3>
                    <div class="tk-step-body">${render(part, n, plan)}</div>
                </section>`;
        }).join("");

        return `
            ${documentHead("plan", n, facts)}
            <section class="tk-part">
                <h2>${esc(t("teachers.plan.objectives"))}</h2>
                <p>${esc(t("teachers.plan.objectivesLead"))}</p>
                <ul class="tk-list">${part.objectives.map(function (goal) { return `<li>${esc(goal)}</li>`; }).join("")}</ul>
            </section>
            <section class="tk-part">
                <h2>${esc(t("teachers.plan.materials"))}</h2>
                <ul class="tk-list">
                    <li>${esc(t("teachers.plan.material.device"))}</li>
                    <li>${esc(t("teachers.plan.material.link", { n: n, url: lessonUrl(n) }))}</li>
                    <li>${esc(t("teachers.plan.material.sheet"))}</li>
                </ul>
            </section>
            <section class="tk-part">
                <h2>${esc(t("teachers.plan.steps"))}</h2>
                ${steps}
            </section>
            <section class="tk-part">
                <h2>${esc(t("teachers.plan.differentiation"))}</h2>
                <dl class="tk-diff">
                    <dt>${esc(t("teachers.plan.easier"))}</dt><dd>${esc(part.easier)}</dd>
                    <dt>${esc(t("teachers.plan.harder"))}</dt><dd>${esc(part.harder)}</dd>
                </dl>
            </section>`;
    }

    // ---------- 5. The worksheet and its answer key ----------
    // A lab question "Which...? [answer]": the question, then lines to write
    // on (the answer on the answer key). A gap inside a sentence stays a gap.
    function questionHTML(text, withAnswers) {
        const match = text.match(ENDS_WITH_GAP);
        if (!match) return gapsHTML(text, withAnswers);
        const answer = match[2];
        return `<p>${esc(match[1].trim())}</p>` +
            (withAnswers ? `<p>${answerHTML(answer)}</p>` : linesHTML(Math.max(1, Math.min(3, Math.ceil(answer.length / 55)))));
    }

    // A cell of a lab table: "[32]" is an empty box to fill in (as tall as its
    // answer needs); "" stays empty
    function cellHTML(cell, withAnswers) {
        const whole = cell.match(/^\[([^\[\]]+)\]$/);
        if (whole && withAnswers) return answerHTML(whole[1]);
        if (whole || !cell) {
            const lines = whole ? Math.max(1, Math.min(3, Math.ceil(whole[1].length / 32))) : 1;
            return `<span class="tk-cell-blank" style="--tk-lines: ${lines}"></span>`;
        }
        return gapsHTML(cell, withAnswers);
    }

    // Each kind of task: { lead (HTML), kicker (text), body (HTML) }
    const TASKS = {
        fill: function (task, withAnswers) {
            const extra = task.extra || [];
            const words = task.items.map(function (item) {
                const gap = splitGaps(item).find(function (part) { return part.gap !== undefined; });
                return gap ? gap.gap : "";
            }).concat(extra);
            const box = withAnswers ? "" : `
                <ul class="tk-wordbox" data-tk-inline>${alphabetical(words).map(function (word) { return `<li>${esc(word)}</li>`; }).join("")}</ul>`;
            return {
                lead: esc(t("teachers.task.fill")) + (extra.length ? " " + esc(A.plural("teachers.task.extra", extra.length)) : ""),
                body: box + `<ol class="tk-list tk-numbered">${task.items.map(function (item) { return `<li>${gapsHTML(item, withAnswers)}</li>`; }).join("")}</ol>`
            };
        },
        match: function (task, withAnswers) {
            const marks = letters();
            const meanings = alphabetical(task.pairs.map(function (pair) { return pair[1]; }));
            const terms = task.pairs.map(function (pair) {
                const letter = marks[meanings.indexOf(pair[1])];
                return `<li><span class="tk-box">${withAnswers ? esc(letter) : ""}</span><span>${esc(pair[0])}</span></li>`;
            }).join("");
            const list = meanings.map(function (meaning, i) {
                return `<li><span class="tk-letter">${esc(marks[i])}</span><span>${esc(meaning)}</span></li>`;
            }).join("");
            return {
                lead: esc(t("teachers.task.match")),
                body: `<div class="tk-match"><ol class="tk-list tk-numbered tk-boxes">${terms}</ol><ul class="tk-list tk-meanings">${list}</ul></div>`
            };
        },
        truefalse: function (task, withAnswers) {
            const yes = t("teachers.task.trueLetter");
            const no = t("teachers.task.falseLetter");
            const rows = task.items.map(function (item) {
                const mark = withAnswers
                    ? answerHTML(t(item[1] ? "teachers.key.true" : "teachers.key.false"))
                    : `<span class="tk-circle">${esc(yes)}</span><span class="tk-circle">${esc(no)}</span>`;
                return `<li class="tk-tf"><span class="tk-tf-text">${esc(item[0])}${withAnswers ? ` <span class="tk-why">${esc(item[2])}</span>` : ""}</span><span class="tk-tf-mark">${mark}</span></li>`;
            }).join("");
            return {
                lead: esc(t("teachers.task.truefalse", { true: yes, false: no })),
                body: `<ol class="tk-list tk-numbered tk-tf-list">${rows}</ol>`
            };
        },
        sort: function (task, withAnswers) {
            const head = `<tr><td></td>${task.groups.map(function (group) { return `<th scope="col">${esc(group)}</th>`; }).join("")}</tr>`;
            const rows = task.items.map(function (item) {
                return `<tr><th scope="row">${esc(item[0])}</th>${task.groups.map(function (group, g) {
                    const mark = withAnswers ? (item[1] === g ? answerHTML("✓") : "") : '<span class="tk-square"></span>';
                    return `<td class="tk-tick">${mark}</td>`;
                }).join("")}</tr>`;
            }).join("");
            return {
                lead: esc(t("teachers.task.sort")),
                body: `<table class="tk-table tk-sort"><thead>${head}</thead><tbody>${rows}</tbody></table>`
            };
        },
        order: function (task, withAnswers) {
            const rows = alphabetical(task.items).map(function (item) {
                const place = task.items.indexOf(item) + 1;
                return `<li><span class="tk-box">${withAnswers ? esc(A.format.number(place)) : ""}</span><span>${esc(item)}</span></li>`;
            }).join("");
            return {
                lead: esc(t("teachers.task.order", { n: task.items.length })),
                body: `<ul class="tk-list tk-boxes">${rows}</ul>`
            };
        },
        explain: function (task, withAnswers) {
            return {
                kicker: t("teachers.task.explain"),
                lead: esc(task.text),
                body: withAnswers
                    ? `<p class="tk-sample"><span class="tk-label">${esc(t("teachers.key.sample"))}</span> ${esc(task.answer)}</p>`
                    : linesHTML(task.lines)
            };
        },
        lab: function (task, withAnswers) {
            let body = "";
            if (task.table) {
                const head = `<tr>${task.table.head.map(function (title) {
                    return title ? `<th scope="col">${esc(title)}</th>` : "<td></td>";
                }).join("")}</tr>`;
                const rows = task.table.rows.map(function (row) {
                    return `<tr>${row.map(function (cell, i) {
                        return i === 0 ? `<th scope="row">${gapsHTML(cell, withAnswers)}</th>` : `<td>${cellHTML(cell, withAnswers)}</td>`;
                    }).join("")}</tr>`;
                }).join("");
                body += `<table class="tk-table tk-lab-table"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
            }
            if (task.items) {
                body += `<ol class="tk-list tk-numbered tk-questions">${task.items.map(function (item) {
                    return `<li>${questionHTML(item, withAnswers)}</li>`;
                }).join("")}</ol>`;
            }
            return { kicker: t("teachers.task.lab"), lead: esc(task.text), body: body };
        }
    };

    function taskHTML(number, task) {
        return `
            <section class="tk-task">
                <h2 class="tk-task-head">
                    <span class="tk-task-number">${esc(t("teachers.sheet.task", { n: number }))}</span>
                    ${task.kicker ? `<span class="tk-task-kicker">${esc(task.kicker)}</span>` : ""}
                </h2>
                <p class="tk-task-lead">${task.lead}</p>
                ${task.body}
            </section>`;
    }

    function worksheetHTML(n, plan, withAnswers) {
        const part = plan[A.lang] || plan.en;
        const view = withAnswers ? "answers" : "worksheet";
        let html = documentHead(view, n, withAnswers ? [trackFact(n)] : []);
        if (withAnswers) {
            html += `<p class="tk-key-note">${esc(t("teachers.key.note"))}</p>`;
        } else {
            html += `
                <div class="tk-fields">
                    <span class="tk-field">${esc(t("teachers.sheet.name"))}<span class="tk-field-line"></span></span>
                    <span class="tk-field">${esc(t("teachers.sheet.class"))}<span class="tk-field-line"></span></span>
                    <span class="tk-field">${esc(t("teachers.sheet.date"))}<span class="tk-field-line"></span></span>
                </div>
                <p class="tk-sheet-intro">${esc(t("teachers.sheet.intro", { n: n, url: lessonUrl(n) }))}</p>`;
        }
        part.tasks.forEach(function (task, i) {
            const render = TASKS[task.type];
            if (render) html += taskHTML(i + 1, render(task, withAnswers));
        });
        // The last task: a quick quiz from the quiz bank
        const questions = (plan.quiz || []).map(function (id) { return bankQuestionHTML(id, withAnswers, "li"); }).filter(Boolean);
        if (questions.length) {
            html += taskHTML(part.tasks.length + 1, {
                lead: esc(t("teachers.task.quiz")),
                body: `<ol class="tk-list tk-numbered tk-quiz-list">${questions.join("")}</ol>`
            });
        }
        return html;
    }

    function documentHTML(view, n, plan) {
        const body = view === "plan" ? planHTML(n, plan) : worksheetHTML(n, plan, view === "answers");
        // (On paper the footer is printed at the bottom of every page instead: see printFooter)
        return `
            ${body}
            <footer class="tk-sheet-foot">
                <p class="tk-doc-foot">${esc(footerText())}</p>
            </footer>`;
    }

    function footerText() {
        return t("teachers.doc.footer", { site: data.siteName, url: data.siteUrl });
    }

    // ---------- 6. Copy as text ----------
    // The document as plain text: headings underlined, lists with numbers or
    // dashes, tables with " | ", gaps and boxes as lines to write on.
    const BLOCK_TAGS = ["ARTICLE", "SECTION", "HEADER", "FOOTER", "DIV", "P", "H1", "H2", "H3", "H4", "UL", "OL", "LI", "DL", "DT", "DD", "TABLE"];
    const SPACE_AFTER = ".tk-letter, .tk-option-letter, .tk-label, .tk-task-number, .tk-circle, .tk-box, .tk-tf-text";

    function skippedInText(node) {
        return node.nodeType === 1 && (node.matches(".tk-screen-only, [aria-hidden='true'], script, style") ||
            (node.classList.contains("sr-only") && !node.closest(".tk-gap")));
    }

    function inlineText(node) {
        if (node.nodeType === 3) return node.nodeValue;
        if (node.nodeType !== 1 || skippedInText(node)) return "";
        if (node.classList.contains("tk-gap")) return " ________ ";
        if (node.classList.contains("tk-square")) return "[ ]";
        if (node.classList.contains("tk-cell-blank")) return "________";
        if (node.classList.contains("tk-field-line")) return " ________________   ";
        let text;
        if (node.classList.contains("tk-box")) text = "[" + (node.textContent.trim() || "   ") + "]";
        else text = Array.prototype.map.call(node.childNodes, inlineText).join("");
        if (node.matches(SPACE_AFTER)) text += "  ";
        if (node.classList.contains("tk-step-number")) text = text.trim() + ". ";
        if (node.classList.contains("tk-step-time")) text = " (" + text.trim() + ")";
        if (node.classList.contains("tk-task-kicker")) text = " · " + text.trim();
        return text;
    }

    function hasBlockChild(element) {
        return Array.prototype.some.call(element.children, function (child) {
            return BLOCK_TAGS.indexOf(child.tagName) !== -1 && !skippedInText(child);
        });
    }

    function documentText(element) {
        const lines = [];
        function add(text, indent) {
            const clean = text.replace(/\s+/g, " ").replace(/ ([.,:;!?])/g, "$1").trim();
            if (clean) lines.push((indent || "") + clean);
            return clean;
        }
        function space() {
            if (lines.length && lines[lines.length - 1] !== "") lines.push("");
        }
        function visit(node, indent, marker) {
            if (node.nodeType !== 1 || skippedInText(node)) return;
            const tag = node.tagName;
            if (tag === "H1" || tag === "H2") {
                space();
                const text = add(inlineText(node), indent);
                lines.push(indent + (tag === "H1" ? "=" : "-").repeat(Math.min(70, text.length)));
                return;
            }
            if (tag === "H3" || tag === "DT") {
                space();
                add(inlineText(node), indent);
                return;
            }
            if (tag === "TABLE") {
                space();
                node.querySelectorAll("tr").forEach(function (row) {
                    add(Array.prototype.map.call(row.children, function (cell) {
                        return inlineText(cell).replace(/\s+/g, " ").trim();
                    }).join(" | "), indent);
                });
                space();
                return;
            }
            if (node.classList.contains("tk-lines")) {
                const count = Number(node.getAttribute("data-tk-lines")) || 1;
                for (let i = 0; i < count; i++) lines.push(indent + "_".repeat(60));
                return;
            }
            if (node.hasAttribute("data-tk-inline")) {
                // The word box: the words on one line
                space();
                add(Array.prototype.map.call(node.children, inlineText).join("   ·   "), indent + "   ");
                space();
                return;
            }
            if (tag === "UL" || tag === "OL") {
                // Lists whose items have their own letter or box get no dash
                const ownMarks = node.matches(".tk-options, .tk-meanings, .tk-boxes");
                Array.prototype.forEach.call(node.children, function (item, i) {
                    visit(item, indent, tag === "OL" ? (i + 1) + ". " : ownMarks ? "" : "- ");
                });
                return;
            }
            if (tag === "LI" && hasBlockChild(node)) {
                // A list item with blocks inside (a quiz question): the marker goes on its first line
                let first = true;
                Array.prototype.forEach.call(node.childNodes, function (child) {
                    if (child.nodeType !== 1 || skippedInText(child)) return;
                    if (first && BLOCK_TAGS.indexOf(child.tagName) !== -1 && !hasBlockChild(child) && child.tagName !== "UL" && child.tagName !== "OL" && !child.classList.contains("tk-lines")) {
                        add((marker || "") + inlineText(child), indent);
                    } else {
                        visit(child, indent + "   ");
                    }
                    first = false;
                });
                return;
            }
            if (hasBlockChild(node)) {
                if (tag === "SECTION" || tag === "HEADER" || tag === "FOOTER") space();
                Array.prototype.forEach.call(node.childNodes, function (child) {
                    if (child.nodeType === 1) visit(child, indent);
                });
                return;
            }
            add((marker || "") + inlineText(node), indent);
            if (tag === "P" && node.classList.contains("tk-doc-kicker")) space();
        }
        visit(element, "");
        return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
    }

    // Copies a text: the Clipboard API, or the older way (a hidden text box)
    function copyText(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return copyTheOldWay(text); });
        }
        return Promise.resolve(copyTheOldWay(text));
    }

    function copyTheOldWay(text) {
        const box = document.createElement("textarea");
        box.value = text;
        box.setAttribute("readonly", "");
        box.className = "tk-copy-box";
        const keep = document.activeElement;
        (doc.panel || document.body).appendChild(box);
        box.select();
        let copied = false;
        try {
            copied = document.execCommand("copy");
        } catch (error) {
            copied = false;
        }
        box.remove();
        if (keep && typeof keep.focus === "function") keep.focus({ preventScroll: true });
        return copied;
    }

    // ---------- 7. The document window ----------
    const doc = {
        element: null,       // the whole window (with its backdrop)
        panel: null,         // the dialog
        body: null,          // the part that scrolls
        page: null,          // the sheet with the document
        overlay: null,
        open: false,
        view: "plan",
        n: 1,
        opener: null,        // the button to give the focus back to
        shown: "",           // what the sheet shows now: "plan:3:en"
        token: 0,            // the latest render (an older load that finishes late is ignored)
        closeTimer: 0
    };

    function toolHTML(action, icon, labelKey) {
        return `
            <button class="tk-tool" type="button" data-tk-action="${action}">
                <span class="tk-tool-icon" aria-hidden="true">${icon}</span>
                ${A.i18nHTML(labelKey, "tk-tool-label")}
            </button>`;
    }

    function buildDocWindow() {
        const element = document.createElement("div");
        element.className = "tk-window";
        element.hidden = true;
        element.innerHTML = `
            <div class="tk-window-backdrop" data-tk-action="close"></div>
            <div class="tk-window-panel" role="dialog" aria-modal="true" aria-labelledby="tk-doc-title" tabindex="-1">
                <div class="tk-window-top">
                    <p class="tk-window-where mono" data-tk-where></p>
                    <div class="tk-window-tools">
                        <button class="tk-tool tk-tool-icon-only" type="button" data-tk-action="prev">
                            <span aria-hidden="true">←</span>${A.i18nHTML("teachers.doc.prev", "sr-only")}
                        </button>
                        <button class="tk-tool tk-tool-icon-only" type="button" data-tk-action="next">
                            <span aria-hidden="true">→</span>${A.i18nHTML("teachers.doc.next", "sr-only")}
                        </button>
                        <button class="tk-tool tk-tool-lang" type="button" data-tk-action="language"></button>
                        ${toolHTML("copy", "📋", "teachers.doc.copy")}
                        ${toolHTML("print", "🖨️", "teachers.doc.print")}
                        <button class="tk-tool tk-tool-icon-only tk-tool-close" type="button" data-tk-action="close">
                            <span aria-hidden="true">✕</span>${A.i18nHTML("teachers.doc.close", "sr-only")}
                        </button>
                    </div>
                </div>
                <div class="tk-tabs" role="tablist" data-tk-tabs>
                    ${VIEWS.map(function (view) {
                        return `
                            <button class="tk-tab" type="button" role="tab" id="tk-tab-${view.id}" aria-controls="tk-doc" data-tk-view="${view.id}">
                                <span aria-hidden="true">${view.icon}</span> ${A.i18nHTML(view.label)}
                            </button>`;
                    }).join("")}
                </div>
                <div class="tk-window-body" data-tk-body>
                    <article class="tk-doc" id="tk-doc" role="tabpanel" data-tk-doc></article>
                </div>
            </div>`;
        document.body.appendChild(element);
        doc.element = element;
        doc.panel = element.querySelector(".tk-window-panel");
        doc.body = element.querySelector("[data-tk-body]");
        doc.page = element.querySelector("[data-tk-doc]");

        element.addEventListener("click", onDocClick);
        doc.panel.addEventListener("keydown", onDocKey);

        doc.overlay = A.overlays.register(OVERLAY_DOC, {
            element: doc.panel,
            root: element,
            close: function () { closeDocWindow(); }
        });
    }

    // The bar and the tabs: which lesson, which document, which buttons work
    function renderDocChrome() {
        const total = LESSONS.length;
        A.dom.setText(doc.element.querySelector("[data-tk-where]"), t("teachers.doc.where", { n: doc.n, total: total }));
        A.dom.setAttr(doc.element.querySelector("[data-tk-tabs]"), "aria-label", t("teachers.doc.tabs"));
        VIEWS.forEach(function (view) {
            const tab = doc.element.querySelector('[data-tk-view="' + view.id + '"]');
            const selected = view.id === doc.view;
            A.dom.setAttr(tab, "aria-selected", String(selected));
            A.dom.setAttr(tab, "tabindex", selected ? "0" : "-1");
        });
        A.dom.setAttr(doc.page, "aria-labelledby", "tk-tab-" + doc.view);
        const index = LESSON_NUMBERS.indexOf(doc.n);
        [["prev", index - 1], ["next", index + 1]].forEach(function (pair) {
            const button = doc.element.querySelector('[data-tk-action="' + pair[0] + '"]');
            const target = LESSON_NUMBERS[pair[1]];
            const off = target === undefined;
            if (off && document.activeElement === button) doc.panel.focus({ preventScroll: true });
            button.disabled = off;
            A.dom.setAttr(button, "title", off ? "" : t("teachers.plan.heading", { n: target, title: A.lessons.title(target) }));
        });
        const language = doc.element.querySelector('[data-tk-action="language"]');
        A.dom.setText(language, t("teachers.lang.switch"));
        A.dom.setAttr(language, "lang", A.lang === "ru" ? "en" : "ru");
        A.dom.setAttr(language, "aria-label", t("teachers.lang.label"));
    }

    // Draws the document (after loading its plan, the first time)
    function renderDocument(options) {
        const settings = options || {};
        const token = ++doc.token;
        const n = doc.n;
        const view = doc.view;
        renderDocChrome();
        const plan = storedPlan(n);
        const quizWaiting = hasQuiz() && plan && !bankQuestion(plan.exit);
        if (plan && !quizWaiting) {
            drawDocument(view, n, plan, settings);
            return Promise.resolve(true);
        }
        doc.shown = "";
        doc.page.innerHTML = `<p class="tk-doc-status" role="status">${esc(t("teachers.doc.loading"))}</p>`;
        return Promise.all([loadPlan(n), questionsReady()]).then(function (results) {
            if (token === doc.token && doc.open) drawDocument(view, n, results[0], settings);
            return true;
        }, function () {
            if (token === doc.token && doc.open) {
                doc.page.innerHTML = `
                    <div class="tk-doc-status" role="alert">
                        <p>${esc(t("teachers.doc.error"))}</p>
                        <p><button class="btn btn-primary btn-small" type="button" data-tk-action="retry">${esc(t("teachers.doc.retry"))}</button></p>
                    </div>`;
            }
            return true;
        });
    }

    function drawDocument(view, n, plan, settings) {
        const shown = view + ":" + n + ":" + A.lang;
        if (shown === doc.shown && !settings.force) return;
        // Keep the place on the page when only the language changes; the focus too
        const sameDocument = doc.shown.split(":").slice(0, 2).join(":") === view + ":" + n;
        const scrollShare = sameDocument && doc.body.scrollHeight > 0 ? doc.body.scrollTop / doc.body.scrollHeight : 0;
        const focused = doc.page.contains(document.activeElement) ? document.activeElement.getAttribute("data-tk-focus") : null;
        const focusTitle = doc.page.contains(document.activeElement) && document.activeElement.id === "tk-doc-title";

        doc.page.innerHTML = documentHTML(view, n, plan);
        doc.page.setAttribute("data-tk-view", view);
        doc.shown = shown;
        doc.body.scrollTop = Math.round(scrollShare * doc.body.scrollHeight);

        // The title takes the focus when the window opens, or when the focus was on the old sheet
        const again = focused ? doc.page.querySelector('[data-tk-focus="' + focused + '"]') : null;
        const active = document.activeElement;
        if (again) again.focus({ preventScroll: true });
        else if (focusTitle || (settings.focusTitle && (active === doc.panel || active === document.body || !doc.panel.contains(active)))) focusDocTitle();
    }

    function focusDocTitle() {
        const title = doc.page.querySelector("#tk-doc-title");
        if (title) title.focus({ preventScroll: true });
        else doc.panel.focus({ preventScroll: true });
    }

    function trackDocument() {
        A.track("teacher.open", { what: doc.view, n: doc.n });
    }

    function openDocument(view, n, opener) {
        if (!VIEWS.some(function (item) { return item.id === view; }) || LESSON_NUMBERS.indexOf(n) === -1) {
            return Promise.resolve(false);
        }
        if (!doc.element) buildDocWindow();
        if (quiz.open) closeQuiz();
        const wasOpen = doc.open;
        const changed = !wasOpen || doc.view !== view || doc.n !== n;
        doc.view = view;
        doc.n = n;
        if (!wasOpen) showDocWindow(opener);
        if (changed) trackDocument();
        return renderDocument({ focusTitle: true }).then(function () { return true; });
    }

    function showDocWindow(opener) {
        clearTimeout(doc.closeTimer);
        doc.open = true;
        doc.opener = opener && opener.nodeType === 1 && !doc.element.contains(opener) ? opener : null;
        doc.shown = "";
        doc.element.hidden = false;
        doc.element.classList.remove("is-closing");
        A.dom.replay(doc.element, "is-open");
        doc.overlay.opened();           // before the focus moves into the window
        doc.panel.focus({ preventScroll: true });
        window.addEventListener("beforeprint", onBeforePrint);
        window.addEventListener("afterprint", onAfterPrint);
    }

    function closeDocWindow() {
        if (!doc.open) return;
        doc.open = false;
        doc.token++;
        window.removeEventListener("beforeprint", onBeforePrint);
        window.removeEventListener("afterprint", onAfterPrint);
        root.classList.remove("tk-printing", "tk-page-footer");
        doc.element.classList.remove("is-open");
        const opener = doc.opener;
        const view = doc.view;
        const n = doc.n;
        doc.overlay.closed(function () { giveFocusBack(opener, A.teachers && A.teachers.documentButton(view, n)); });
        finishClosing(doc);
    }

    // Hides a window after its closing animation (at once in calm mode)
    function finishClosing(win) {
        const finish = function () {
            win.element.hidden = true;
            win.element.classList.remove("is-closing");
        };
        if (!A.motion.ok()) {
            finish();
        } else {
            win.element.classList.add("is-closing");
            win.closeTimer = setTimeout(finish, CLOSE_TIME);
        }
    }

    function giveFocusBack(opener, fallback) {
        if (canTakeFocus(opener)) opener.focus({ preventScroll: true });
        else if (canTakeFocus(fallback)) fallback.focus({ preventScroll: true });
    }

    function switchView(view, focusTab) {
        if (view === doc.view) return;
        doc.view = view;
        trackDocument();
        renderDocument();
        if (focusTab) doc.element.querySelector('[data-tk-view="' + view + '"]').focus();
    }

    function stepLesson(direction) {
        const target = LESSON_NUMBERS[LESSON_NUMBERS.indexOf(doc.n) + direction];
        if (target === undefined) return;
        doc.n = target;
        trackDocument();
        renderDocument();
        A.announce(t("teachers.plan.heading", { n: target, title: A.lessons.title(target) }));
    }

    // Printing: only the sheet (css/teachers-kit.css hides the rest of the
    // page while <html> has "tk-printing"). Ctrl+P works the same way.
    function printDocument() {
        preparePrint();
        window.print();
    }

    // Ctrl+P prints the sheet only while this window is on top (a lesson
    // opened from the plan covers it, and then the lesson is what prints)
    function onBeforePrint() {
        if (doc.open && A.overlays.top() === OVERLAY_DOC) preparePrint();
    }

    function preparePrint() {
        printFooter();
        root.classList.add("tk-printing");
    }

    // The site's name and address at the bottom of every printed page, and
    // the page's number on the right: "page margin boxes" of the tk-sheet
    // pages (css/teachers-kit.css), with the text in the current language.
    // The left box stays empty, whatever the rest of the site prints there.
    // Browsers that don't know page margin boxes print the sheet's own footer
    // instead, once, at the end.
    function printFooter() {
        let style = document.getElementById("tk-print-footer");
        if (!style) {
            style = document.createElement("style");
            style.id = "tk-print-footer";
            document.head.appendChild(style);
        }
        const text = '"' + footerText().replace(/[\\"]/g, "\\$&").replace(/\s+/g, " ") + '"';
        const look = "color: #333333; font: 8.5pt \"Manrope\", system-ui, sans-serif;";
        style.textContent = "@page tk-sheet { " +
            "@bottom-left { content: none; } " +
            "@bottom-center { content: " + text + "; " + look + " } " +
            "@bottom-right { content: counter(page) \" / \" counter(pages); " + look + " } }";
        const rule = style.sheet && style.sheet.cssRules[0];
        root.classList.toggle("tk-page-footer", Boolean(rule && rule.cssRules && rule.cssRules.length));
    }

    function onAfterPrint() {
        root.classList.remove("tk-printing", "tk-page-footer");
    }

    function copyDocument(button) {
        if (!doc.shown) return;
        const text = documentText(doc.page);
        copyText(text).then(function (copied) {
            A.toast(t(copied ? "teachers.doc.copied" : "teachers.doc.copyFailed"), copied ? "📋" : "⚠️");
            if (copied && button && doc.open && document.activeElement !== button) button.focus({ preventScroll: true });
        });
    }

    function onDocClick(event) {
        const tab = event.target.closest("[data-tk-view]");
        if (tab) {
            switchView(tab.getAttribute("data-tk-view"), false);
            return;
        }
        const reader = event.target.closest("[data-tk-reader]");
        if (reader) {
            // The lesson reader opens above this window; closing it comes back here
            const part = reader.getAttribute("data-tk-reader") === "lab" ? { part: "lab" } : undefined;
            A.lessons.open(doc.n, reader, part);
            return;
        }
        const action = event.target.closest("[data-tk-action]");
        if (!action) return;
        const name = action.getAttribute("data-tk-action");
        if (name === "close") closeDocWindow();
        else if (name === "prev") stepLesson(-1);
        else if (name === "next") stepLesson(1);
        else if (name === "print") printDocument();
        else if (name === "copy") copyDocument(action);
        else if (name === "language") A.toggleLanguage();
        else if (name === "retry") renderDocument({ focusTitle: true });
    }

    // The tabs: arrow keys, Home and End move between them
    function onDocKey(event) {
        const tab = event.target.closest && event.target.closest("[data-tk-view]");
        if (!tab) return;
        const index = VIEWS.findIndex(function (view) { return view.id === tab.getAttribute("data-tk-view"); });
        let next = -1;
        if (event.key === "ArrowRight") next = (index + 1) % VIEWS.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + VIEWS.length) % VIEWS.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = VIEWS.length - 1;
        if (next === -1) return;
        event.preventDefault();
        switchView(VIEWS[next].id, true);
    }

    // ---------- 8. The classroom quiz: its settings (kept in this browser) ----------
    const LESSON_CHOICES = LESSON_NUMBERS.concat([HISTORY]);

    function defaultSettings() {
        return { lessons: LESSON_CHOICES.slice(), count: COUNT.start, timer: 0, teams: 0, myths: true };
    }

    // Reads the saved settings; anything that doesn't fit is replaced by the default
    function readSettings() {
        const settings = defaultSettings();
        const saved = A.storage.get(STORE_KEY, null);
        if (!saved || typeof saved !== "object" || saved.v !== 1) return settings;
        if (Array.isArray(saved.lessons)) {
            const lessons = LESSON_CHOICES.filter(function (choice) { return saved.lessons.indexOf(choice) !== -1; });
            if (lessons.length) settings.lessons = lessons;
        }
        if (Number.isInteger(saved.count) && saved.count >= COUNT.min && saved.count <= COUNT.max) settings.count = saved.count;
        if (TIMERS.indexOf(saved.timer) !== -1) settings.timer = saved.timer;
        if (TEAMS.indexOf(saved.teams) !== -1) settings.teams = saved.teams;
        if (typeof saved.myths === "boolean") settings.myths = saved.myths;
        return settings;
    }

    function saveSettings() {
        const s = quiz.settings;
        A.storage.set(STORE_KEY, { v: 1, lessons: s.lessons.slice(), count: s.count, timer: s.timer, teams: s.teams, myths: s.myths });
    }

    // Options given to classroomQuiz() override the saved settings
    function applyOptions(settings, options) {
        if (Array.isArray(options.lessons)) {
            const lessons = LESSON_CHOICES.filter(function (choice) { return options.lessons.indexOf(choice) !== -1; });
            if (lessons.length) settings.lessons = lessons;
        }
        if (Number.isInteger(options.count)) settings.count = A.util.clamp(options.count, COUNT.min, COUNT.max);
        if (TIMERS.indexOf(options.timer) !== -1) settings.timer = options.timer;
        if (TEAMS.indexOf(options.teams) !== -1) settings.teams = options.teams;
        if (typeof options.myths === "boolean") settings.myths = options.myths;
        return settings;
    }

    // The questions that fit the chosen lessons: [{ id, lesson }]
    function questionPool(settings) {
        if (!hasQuiz()) return [];
        const kinds = A.quiz.bank().concat(settings.myths ? A.quiz.bank("myths") : []);
        return kinds.filter(function (question) { return settings.lessons.indexOf(question.lesson) !== -1; });
    }

    // ---------- 9. The classroom quiz: the window and its screens ----------
    const quiz = {
        element: null,
        panel: null,
        stage: null,
        teamsBar: null,
        overlay: null,
        open: false,
        opener: null,
        screen: "setup",      // "setup", "loading", "error", "question" or "results"
        settings: null,
        game: null,           // the quiz being played (kept while the window is closed, to continue)
        timer: 0,             // the interval of the countdown
        closeTimer: 0
    };

    function buildQuizWindow() {
        const element = document.createElement("div");
        element.className = "tk-cq";
        element.hidden = true;
        element.innerHTML = `
            <div class="tk-cq-panel" role="dialog" aria-modal="true" aria-labelledby="tk-cq-title" tabindex="-1">
                <header class="tk-cq-top">
                    <h2 class="tk-cq-title" id="tk-cq-title"><span aria-hidden="true">${QUIZ_ICON}</span> ${A.i18nHTML("teachers.quiz.title")}</h2>
                    <p class="tk-cq-counter mono" data-cq-counter></p>
                    <div class="tk-cq-clock" data-cq-clock hidden>
                        <span class="tk-cq-clock-bar" aria-hidden="true"><span data-cq-clock-bar></span></span>
                        <span class="tk-cq-seconds mono" role="timer" data-cq-seconds></span>
                        <button class="tk-tool tk-tool-icon-only" type="button" data-cq-action="pause">
                            <span aria-hidden="true" data-cq-pause-icon>⏸</span><span class="sr-only" data-cq-pause-label></span>
                        </button>
                    </div>
                    <div class="tk-cq-tools">
                        <button class="tk-tool tk-tool-lang" type="button" data-cq-action="language"></button>
                        <button class="tk-tool tk-tool-icon-only" type="button" data-cq-action="fullscreen">
                            <span aria-hidden="true">⛶</span><span class="sr-only" data-cq-full-label></span>
                        </button>
                        <button class="tk-tool tk-tool-icon-only tk-tool-close" type="button" data-cq-action="close">
                            <span aria-hidden="true">✕</span>${A.i18nHTML("teachers.cq.close", "sr-only")}
                        </button>
                    </div>
                </header>
                <div class="tk-cq-stage" data-cq-stage></div>
                <div class="tk-cq-teams" data-cq-teams hidden></div>
            </div>`;
        document.body.appendChild(element);
        quiz.element = element;
        quiz.panel = element.querySelector(".tk-cq-panel");
        quiz.stage = element.querySelector("[data-cq-stage]");
        quiz.teamsBar = element.querySelector("[data-cq-teams]");

        element.addEventListener("click", onQuizClick);
        element.addEventListener("input", onQuizInput);
        element.addEventListener("change", onQuizInput);
        quiz.panel.addEventListener("keydown", onQuizKey);

        quiz.overlay = A.overlays.register(OVERLAY_QUIZ, {
            element: quiz.panel,
            root: element,
            close: function () { closeQuiz(); }
        });
    }

    function classroomQuiz(options) {
        const settings = options || {};
        if (!quiz.element) buildQuizWindow();
        if (doc.open) closeDocWindow();
        quiz.settings = applyOptions(readSettings(), settings);
        if (!quiz.open) showQuiz(settings.opener);
        A.track("teacher.open", { what: "quiz" });
        return loadQuestions(settings.start === true);
    }

    // The questions' texts come with the quiz bank (loaded once)
    function loadQuestions(startNow) {
        quiz.screen = "loading";
        renderQuiz();
        return questionsReady().then(function (ready) {
            if (!quiz.open) return true;
            if (!ready) {
                quiz.screen = "error";
            } else if (startNow && questionPool(quiz.settings).length) {
                startGame();
                return true;
            } else {
                quiz.screen = "setup";
            }
            renderQuiz({ focus: true });
            return true;
        });
    }

    function showQuiz(opener) {
        clearTimeout(quiz.closeTimer);
        quiz.open = true;
        quiz.opener = opener && opener.nodeType === 1 && !quiz.element.contains(opener) ? opener : null;
        quiz.element.hidden = false;
        quiz.element.classList.remove("is-closing");
        A.dom.replay(quiz.element, "is-open");
        quiz.overlay.opened();
        quiz.panel.focus({ preventScroll: true });
        document.addEventListener("fullscreenchange", onFullscreenChange);
    }

    function closeQuiz() {
        if (!quiz.open) return;
        quiz.open = false;
        stopClock();
        document.removeEventListener("fullscreenchange", onFullscreenChange);
        if (document.fullscreenElement && quiz.element.contains(document.fullscreenElement)) {
            document.exitFullscreen().catch(function () {});
        }
        quiz.element.classList.remove("is-open");
        const opener = quiz.opener;
        quiz.overlay.closed(function () { giveFocusBack(opener, A.teachers && A.teachers.quizButton()); });
        finishClosing(quiz);
    }

    // The top bar: the counter, the clock, the buttons
    function renderQuizTop() {
        const game = quiz.game;
        const playing = quiz.screen === "question" && game;
        A.dom.setText(quiz.element.querySelector("[data-cq-counter]"),
            playing ? t("teachers.cq.counter", { n: game.index + 1, total: game.ids.length }) : "");
        const language = quiz.element.querySelector('[data-cq-action="language"]');
        A.dom.setText(language, t("teachers.lang.switch"));
        A.dom.setAttr(language, "lang", A.lang === "ru" ? "en" : "ru");
        A.dom.setAttr(language, "aria-label", t("teachers.lang.label"));
        const full = quiz.element.querySelector('[data-cq-action="fullscreen"]');
        A.dom.setHidden(full, !document.fullscreenEnabled);
        A.dom.setText(quiz.element.querySelector("[data-cq-full-label]"),
            t(document.fullscreenElement ? "teachers.cq.exitFullscreen" : "teachers.cq.fullscreen"));
        A.dom.setAttr(full, "aria-pressed", String(Boolean(document.fullscreenElement)));
        renderClock();
        renderTeams();
    }

    function renderQuiz(options) {
        const settings = options || {};
        // Drawing the stage again removes the element that had focus: keep focus in the window
        const hadFocus = quiz.stage.contains(document.activeElement);
        A.dom.setAttr(quiz.element, "data-cq-screen", quiz.screen);
        if (quiz.screen === "loading" || quiz.screen === "error") {
            quiz.stage.innerHTML = quiz.screen === "loading"
                ? `<p class="tk-cq-status" role="status">${esc(t("teachers.cq.loading"))}</p>`
                : `<div class="tk-cq-status" role="alert">
                        <p>${esc(t("teachers.cq.error"))}</p>
                        <p><button class="btn btn-primary" type="button" data-cq-action="retry">${esc(t("teachers.doc.retry"))}</button></p>
                   </div>`;
        } else if (quiz.screen === "setup") {
            renderSetup();
        } else if (quiz.screen === "question") {
            renderQuestion();
        } else if (quiz.screen === "results") {
            renderResults();
        }
        renderQuizTop();
        if (settings.focus) {
            // A new screen starts at its top, not where the last one was scrolled to
            quiz.stage.scrollTop = 0;
            focusQuizHeading();
        } else if (hadFocus && !quiz.element.contains(document.activeElement)) {
            focusQuizHeading();
        }
    }

    function focusQuizHeading() {
        const heading = quiz.stage.querySelector("[data-cq-heading]");
        (heading || quiz.panel).focus({ preventScroll: true });
    }

    // --- The settings screen ---
    function radioGroupHTML(name, legendKey, values, labelOf, current) {
        return `
            <fieldset class="tk-cq-field">
                <legend class="tk-cq-legend">${esc(t(legendKey))}</legend>
                <div class="tk-cq-choices">
                    ${values.map(function (value) {
                        return `
                            <label class="tk-cq-choice">
                                <input type="radio" name="tk-cq-${name}" value="${value}" data-cq-${name}${value === current ? " checked" : ""}>
                                <span>${esc(labelOf(value))}</span>
                            </label>`;
                    }).join("")}
                </div>
            </fieldset>`;
    }

    function renderSetup() {
        const s = quiz.settings;
        const allOn = LESSON_NUMBERS.every(function (n) { return s.lessons.indexOf(n) !== -1; });
        const game = quiz.game;
        const resume = game && !game.finished;
        const chips = LESSON_NUMBERS.map(function (n) {
            return `<button class="tk-cq-chip" type="button" data-cq-lesson="${n}" aria-pressed="${s.lessons.indexOf(n) !== -1}"
                        aria-label="${esc(t("teachers.cq.lessonLabel", { n: n, title: A.lessons.title(n) }))}">${A.format.number(n)}</button>`;
        }).join("");
        quiz.stage.innerHTML = `
            <div class="tk-cq-setup">
                <h3 class="tk-cq-heading" tabindex="-1" data-cq-heading>${esc(t("teachers.quiz.title"))}</h3>
                <p class="tk-cq-lead">${esc(t("teachers.cq.lead"))}</p>
                <fieldset class="tk-cq-field">
                    <legend class="tk-cq-legend">${esc(t("teachers.cq.lessons"))}</legend>
                    <div class="tk-cq-chips">
                        <button class="tk-cq-chip tk-cq-chip-wide" type="button" data-cq-lesson="all" aria-pressed="${allOn}">${esc(t("teachers.cq.all"))}</button>
                        ${chips}
                        <button class="tk-cq-chip tk-cq-chip-wide" type="button" data-cq-lesson="${HISTORY}" aria-pressed="${s.lessons.indexOf(HISTORY) !== -1}">${esc(t("teachers.cq.history"))}</button>
                    </div>
                    <button class="tk-cq-switch ui-switch" type="button" role="switch" aria-checked="${s.myths}" data-cq-myths>
                        <span class="ui-switch-track" aria-hidden="true"><span class="ui-switch-knob"></span></span>${esc(t("teachers.cq.myths"))}
                    </button>
                </fieldset>
                <fieldset class="tk-cq-field">
                    <legend class="tk-cq-legend">${esc(t("teachers.cq.count"))}</legend>
                    <div class="tk-cq-count">
                        <input class="ui-range tk-cq-range" type="range" min="${COUNT.min}" max="${COUNT.max}" step="1" value="${s.count}"
                            data-cq-count aria-describedby="tk-cq-available">
                        <output class="tk-cq-count-out mono" data-cq-count-out></output>
                    </div>
                    <p class="tk-cq-available" id="tk-cq-available" data-cq-available></p>
                </fieldset>
                ${radioGroupHTML("timer", "teachers.cq.timer", TIMERS, function (seconds) {
                    return seconds ? A.plural("teachers.cq.seconds", seconds) : t("teachers.cq.off");
                }, s.timer)}
                ${radioGroupHTML("teams", "teachers.cq.teams", TEAMS, function (teams) {
                    return teams ? A.plural("teachers.cq.teamCount", teams) : t("teachers.cq.noTeams");
                }, s.teams)}
                <p class="tk-cq-none" role="status" data-cq-none></p>
                <div class="tk-cq-actions">
                    <button class="btn btn-primary tk-cq-big" type="button" data-cq-action="start">
                        <span aria-hidden="true">▶</span> ${esc(t("teachers.cq.start"))}
                    </button>
                    ${resume ? `<button class="btn btn-ghost tk-cq-big" type="button" data-cq-action="continue">
                        ${esc(t("teachers.cq.continue", { n: game.index + 1, total: game.ids.length }))}</button>` : ""}
                </div>
                <p class="tk-cq-note"><span aria-hidden="true">🔒</span> ${esc(t("teachers.cq.privacy"))}</p>
                <div class="tk-cq-keys">
                    <p class="tk-cq-keys-title">${esc(t("teachers.cq.keysTitle"))}</p>
                    <dl class="tk-cq-keylist">
                        <dt><kbd>${esc(t("teachers.cq.key.space"))}</kbd></dt><dd>${esc(t("teachers.cq.key.spaceDo"))}</dd>
                        <dt><kbd>1</kbd>–<kbd>4</kbd></dt><dd>${esc(t("teachers.cq.key.teamsDo"))}</dd>
                        <dt><kbd>P</kbd></dt><dd>${esc(t("teachers.cq.key.pauseDo"))}</dd>
                        <dt><kbd>F</kbd></dt><dd>${esc(t("teachers.cq.key.fullDo"))}</dd>
                        <dt><kbd>Esc</kbd></dt><dd>${esc(t("teachers.cq.key.closeDo"))}</dd>
                    </dl>
                </div>
            </div>`;
        updateSetupNumbers();
    }

    // The numbers under the settings: how many questions fit, and the slider's value
    function updateSetupNumbers() {
        const s = quiz.settings;
        const available = questionPool(s).length;
        const asked = Math.min(s.count, available);
        const out = quiz.stage.querySelector("[data-cq-count-out]");
        const questions = A.plural("teachers.quiz.questions", asked);
        A.dom.setText(out, available && available < s.count ? t("teachers.cq.allOf", { questions: questions }) : questions);
        A.dom.setAttr(quiz.stage.querySelector("[data-cq-count]"), "aria-valuetext", questions);
        A.dom.setText(quiz.stage.querySelector("[data-cq-available]"), A.plural("teachers.cq.available", available));
        A.dom.setText(quiz.stage.querySelector("[data-cq-none]"), available ? "" : t("teachers.cq.none"));
        const start = quiz.stage.querySelector('[data-cq-action="start"]');
        start.disabled = available === 0;
        const allOn = LESSON_NUMBERS.every(function (n) { return s.lessons.indexOf(n) !== -1; });
        quiz.stage.querySelectorAll("[data-cq-lesson]").forEach(function (chip) {
            const id = chip.getAttribute("data-cq-lesson");
            const on = id === "all" ? allOn : s.lessons.indexOf(id === HISTORY ? HISTORY : Number(id)) !== -1;
            A.dom.setAttr(chip, "aria-pressed", String(on));
        });
        A.dom.setAttr(quiz.stage.querySelector("[data-cq-myths]"), "aria-checked", String(s.myths));
    }

    function toggleLesson(id) {
        const s = quiz.settings;
        if (id === "all") {
            const allOn = LESSON_NUMBERS.every(function (n) { return s.lessons.indexOf(n) !== -1; });
            const others = s.lessons.filter(function (choice) { return LESSON_NUMBERS.indexOf(choice) === -1; });
            s.lessons = allOn ? others : LESSON_NUMBERS.concat(others);
        } else {
            const choice = id === HISTORY ? HISTORY : Number(id);
            if (LESSON_CHOICES.indexOf(choice) === -1) return;
            const at = s.lessons.indexOf(choice);
            if (at === -1) s.lessons.push(choice);
            else s.lessons.splice(at, 1);
        }
        s.lessons = LESSON_CHOICES.filter(function (choice) { return s.lessons.indexOf(choice) !== -1; });
        saveSettings();
        updateSetupNumbers();
    }

    // --- A question ---
    function currentQuestion() {
        const game = quiz.game;
        return game ? bankQuestion(game.ids[game.index]) : null;
    }

    function tagText(question) {
        const parts = [question.lesson === HISTORY ? t("teachers.cq.history") : t("teachers.lessonN", { n: question.lesson })];
        if (question.type === "myth") parts.push(t("teachers.cq.mythTag"));
        return parts.join(" · ");
    }

    function renderQuestion() {
        const game = quiz.game;
        const question = currentQuestion();
        if (!question) {
            quiz.screen = "error";
            renderQuiz();
            return;
        }
        const marks = letters();
        const order = game.orders[question.id];
        const last = game.index === game.ids.length - 1;
        const mainKey = !game.revealed ? "teachers.cq.reveal" : last ? "teachers.cq.finish" : "teachers.cq.next";
        const options = order.map(function (original, i) {
            const right = original === question.correct;
            const state = game.revealed ? (right ? " is-right" : " is-dim") : "";
            return `
                <li class="tk-cq-option${state}">
                    <span class="tk-cq-letter" aria-hidden="true">${esc(marks[i])}</span>
                    <span class="tk-cq-option-text"><span class="sr-only">${esc(marks[i])}. </span>${esc(question.options[original])}</span>
                    ${game.revealed && right ? `<span class="tk-cq-right"><span aria-hidden="true">✓</span> ${esc(t("teachers.cq.rightAnswer"))}</span>` : ""}
                </li>`;
        }).join("");
        quiz.stage.innerHTML = `
            <div class="tk-cq-question${game.revealed ? " is-revealed" : ""}" data-cq-kind="${esc(question.type)}">
                <p class="tk-cq-tag mono">${esc(tagText(question))}</p>
                <h3 class="tk-cq-text" tabindex="-1" data-cq-heading>${esc(question.text)}</h3>
                <ol class="tk-cq-options${order.length === 2 ? " is-two" : ""}">${options}</ol>
                ${game.revealed ? `<p class="tk-cq-explain">${esc(question.explain)}</p>` : ""}
                <p class="tk-cq-timeup" data-cq-timeup${game.timeUp && !game.revealed ? "" : " hidden"}>
                    <span aria-hidden="true">⏰</span> ${esc(t("teachers.cq.timeUp"))}
                </p>
                <div class="tk-cq-actions">
                    <button class="btn btn-primary tk-cq-big tk-cq-main" type="button" data-cq-action="main">
                        ${esc(t(mainKey))} <span aria-hidden="true">${game.revealed ? "→" : "👁"}</span>
                    </button>
                </div>
            </div>`;
    }

    // --- The results ---
    function teamName(i) {
        return t("teachers.cq.team", { n: i + 1 });
    }

    function joinNames(names) {
        if (names.length < 2) return names.join("");
        return names.slice(0, -1).join(", ") + t("teachers.and") + names[names.length - 1];
    }

    function renderResults() {
        const game = quiz.game;
        let verdict = t("teachers.cq.thanks");
        let ranking = "";
        if (game.teams) {
            const best = Math.max.apply(null, game.scores);
            const winners = game.scores.map(function (score, i) { return score === best ? teamName(i) : null; }).filter(Boolean);
            verdict = winners.length === 1 ? t("teachers.cq.winner", { team: winners[0] }) : t("teachers.cq.tie", { teams: joinNames(winners) });
            const order = game.scores.map(function (score, i) { return i; }).sort(function (a, b) { return game.scores[b] - game.scores[a] || a - b; });
            ranking = `<ol class="tk-cq-ranking">${order.map(function (i) {
                return `<li class="${game.scores[i] === best ? "is-best" : ""}"><span class="tk-cq-rank-name">${esc(teamName(i))}</span>
                    <span class="tk-cq-rank-score mono">${esc(A.plural("teachers.cq.points", game.scores[i]))}</span></li>`;
            }).join("")}</ol>`;
        }
        quiz.stage.innerHTML = `
            <div class="tk-cq-results">
                <p class="tk-cq-results-icon" aria-hidden="true">🏁</p>
                <h3 class="tk-cq-heading" tabindex="-1" data-cq-heading>${esc(t("teachers.cq.done"))}</h3>
                <p class="tk-cq-played">${esc(A.plural("teachers.cq.played", game.ids.length))}</p>
                <p class="tk-cq-verdict">${esc(verdict)}</p>
                ${ranking}
                <div class="tk-cq-actions">
                    <button class="btn btn-primary tk-cq-big" type="button" data-cq-action="again">
                        <span aria-hidden="true">↻</span> ${esc(t("teachers.cq.again"))}
                    </button>
                    <button class="btn btn-ghost tk-cq-big" type="button" data-cq-action="settings">${esc(t("teachers.cq.settings"))}</button>
                </div>
            </div>`;
    }

    // --- The team scores (under the question) ---
    function renderTeams() {
        const game = quiz.game;
        const show = Boolean(game && game.teams && quiz.screen === "question");
        A.dom.setHidden(quiz.teamsBar, !show);
        if (!show) return;
        if (quiz.teamsBar.childElementCount !== game.teams || quiz.teamsBar.getAttribute("data-lang") !== A.lang) {
            quiz.teamsBar.setAttribute("data-lang", A.lang);
            quiz.teamsBar.innerHTML = game.scores.map(function (score, i) {
                const name = teamName(i);
                return `
                    <div class="tk-cq-team" data-cq-team="${i}">
                        <span class="tk-cq-team-key mono" aria-hidden="true">${i + 1}</span>
                        <span class="tk-cq-team-name">${esc(name)}</span>
                        <button class="tk-cq-point tk-cq-minus" type="button" data-cq-point="-1" data-cq-for="${i}" aria-label="${esc(t("teachers.cq.minus", { team: name }))}">−</button>
                        <span class="tk-cq-score mono" data-cq-score="${i}"></span>
                        <button class="tk-cq-point tk-cq-plus" type="button" data-cq-point="1" data-cq-for="${i}" aria-label="${esc(t("teachers.cq.plus", { team: name }))}">+</button>
                    </div>`;
            }).join("");
        }
        game.scores.forEach(function (score, i) {
            A.dom.setText(quiz.teamsBar.querySelector('[data-cq-score="' + i + '"]'), A.format.number(score));
        });
    }

    // ---------- 10. The classroom quiz: playing ----------
    function startGame() {
        const s = quiz.settings;
        saveSettings();
        const pool = A.util.shuffle(questionPool(s));
        const ids = pool.slice(0, Math.min(s.count, pool.length)).map(function (question) { return question.id; });
        const orders = {};
        ids.forEach(function (id) {
            const question = bankQuestion(id);
            const all = question.options.map(function (option, i) { return i; });
            orders[id] = question.type === "choice" ? A.util.shuffle(all) : all;
        });
        const scores = [];
        for (let i = 0; i < s.teams; i++) scores.push(0);
        quiz.game = { ids: ids, orders: orders, index: 0, revealed: false, finished: false, teams: s.teams, scores: scores,
            timer: s.timer, left: s.timer * 1000, paused: false, timeUp: false };
        showQuestion();
    }

    function showQuestion() {
        const game = quiz.game;
        game.revealed = false;
        game.timeUp = false;
        game.paused = false;
        game.left = game.timer * 1000;
        quiz.screen = "question";
        renderQuiz({ focus: true });
        A.announce(t("teachers.cq.counter", { n: game.index + 1, total: game.ids.length }));
        startClock();
    }

    function reveal() {
        const game = quiz.game;
        if (!game || game.revealed) return;
        game.revealed = true;
        stopClock();
        const keepFocus = document.activeElement && document.activeElement.getAttribute("data-cq-action") === "main";
        renderQuiz();
        const main = quiz.stage.querySelector('[data-cq-action="main"]');
        if (!main) return;
        if (keepFocus) main.focus({ preventScroll: true });
        // The explanation appears above the button: on a small screen, scroll until the button shows
        const stageBox = quiz.stage.getBoundingClientRect();
        const mainBox = main.getBoundingClientRect();
        if (mainBox.bottom > stageBox.bottom) quiz.stage.scrollTop += mainBox.bottom - stageBox.bottom + 12;
        const question = currentQuestion();
        if (question) {
            const at = game.orders[question.id].indexOf(question.correct);
            A.announce(t("teachers.cq.answerSay", { answer: letters()[at] + ". " + question.options[question.correct], explain: question.explain }));
        }
    }

    function nextQuestion() {
        const game = quiz.game;
        if (game.index < game.ids.length - 1) {
            game.index += 1;
            showQuestion();
        } else {
            game.finished = true;
            stopClock();
            quiz.screen = "results";
            renderQuiz({ focus: true });
        }
    }

    // Space, the main button, a clicker: reveal the answer, then go on
    function mainAction() {
        if (quiz.screen !== "question" || !quiz.game) return;
        if (!quiz.game.revealed) reveal();
        else nextQuestion();
    }

    function addPoint(team, change) {
        const game = quiz.game;
        if (!game || quiz.screen !== "question" || team < 0 || team >= game.teams) return;
        game.scores[team] = Math.max(0, game.scores[team] + change);
        renderTeams();
        A.announce(t("teachers.cq.scoreSay", { team: teamName(team), points: A.plural("teachers.cq.points", game.scores[team]) }));
    }

    // --- The timer: counts down with the page's clock (performance.now) ---
    function startClock() {
        stopClock();
        const game = quiz.game;
        if (!game || !game.timer || game.revealed || game.paused || game.timeUp) {
            renderClock();
            return;
        }
        let last = performance.now();
        quiz.timer = setInterval(function () {
            const now = performance.now();
            game.left = Math.max(0, game.left - (now - last));
            last = now;
            if (game.left <= 0) timeUp();
            renderClock();
        }, TICK);
        renderClock();
    }

    function stopClock() {
        clearInterval(quiz.timer);
        quiz.timer = 0;
    }

    function timeUp() {
        const game = quiz.game;
        stopClock();
        game.timeUp = true;
        A.dom.setHidden(quiz.stage.querySelector("[data-cq-timeup]"), false);
        A.announce(t("teachers.cq.timeUp"), { politeness: "assertive" });
    }

    function togglePause() {
        const game = quiz.game;
        if (!game || !game.timer || game.revealed || game.timeUp || quiz.screen !== "question") return;
        game.paused = !game.paused;
        if (game.paused) stopClock();
        else startClock();
        renderClock();
        A.announce(game.paused ? t("teachers.cq.paused") : A.plural("teachers.cq.timeLeft", Math.ceil(game.left / 1000)));
    }

    function renderClock() {
        const game = quiz.game;
        const clock = quiz.element.querySelector("[data-cq-clock]");
        const show = Boolean(game && game.timer && quiz.screen === "question");
        A.dom.setHidden(clock, !show);
        if (!show) return;
        const seconds = Math.ceil(game.left / 1000);
        const secondsText = quiz.element.querySelector("[data-cq-seconds]");
        A.dom.setText(secondsText, game.paused ? t("teachers.cq.paused") : A.format.number(seconds));
        A.dom.setAttr(secondsText, "aria-label", A.plural("teachers.cq.timeLeft", seconds));
        quiz.element.querySelector("[data-cq-clock-bar]").style.transform = "scaleX(" + (game.left / (game.timer * 1000)).toFixed(3) + ")";
        clock.classList.toggle("is-low", seconds <= 5 && !game.revealed);
        const pause = quiz.element.querySelector('[data-cq-action="pause"]');
        A.dom.setHidden(pause, game.revealed || game.timeUp);
        A.dom.setText(quiz.element.querySelector("[data-cq-pause-icon]"), game.paused ? "▶" : "⏸");
        A.dom.setText(quiz.element.querySelector("[data-cq-pause-label]"), t(game.paused ? "teachers.cq.resume" : "teachers.cq.pause"));
    }

    // --- Full screen (where the browser allows it) ---
    function toggleFullscreen() {
        if (!document.fullscreenEnabled) return;
        if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
        else quiz.element.requestFullscreen().catch(function () {});
    }

    function onFullscreenChange() {
        renderQuizTop();
    }

    // --- Clicks, the settings' controls and the keys ---
    function onQuizClick(event) {
        const point = event.target.closest("[data-cq-point]");
        if (point) {
            addPoint(Number(point.getAttribute("data-cq-for")), Number(point.getAttribute("data-cq-point")));
            // After a click with the mouse, Space goes on with the quiz again (a keyboard press keeps its place)
            if (event.detail > 0) focusMain();
            return;
        }
        const lesson = event.target.closest("[data-cq-lesson]");
        if (lesson) {
            toggleLesson(lesson.getAttribute("data-cq-lesson"));
            return;
        }
        if (event.target.closest("[data-cq-myths]")) {
            quiz.settings.myths = !quiz.settings.myths;
            saveSettings();
            updateSetupNumbers();
            return;
        }
        const action = event.target.closest("[data-cq-action]");
        if (!action) return;
        const name = action.getAttribute("data-cq-action");
        if (name === "close") closeQuiz();
        else if (name === "main") mainAction();
        else if (name === "start" || name === "again") startGame();
        else if (name === "continue") showQuestion();
        else if (name === "settings") {
            quiz.screen = "setup";
            renderQuiz({ focus: true });
        } else if (name === "pause") togglePause();
        else if (name === "fullscreen") toggleFullscreen();
        else if (name === "language") A.toggleLanguage();
        else if (name === "retry") loadQuestions(false);
    }

    function focusMain() {
        const main = quiz.stage.querySelector('[data-cq-action="main"]');
        if (main) main.focus({ preventScroll: true });
    }

    function onQuizInput(event) {
        const s = quiz.settings;
        const target = event.target;
        if (target.hasAttribute("data-cq-count")) {
            s.count = A.util.clamp(Math.round(Number(target.value)) || COUNT.start, COUNT.min, COUNT.max);
        } else if (target.hasAttribute("data-cq-timer") && target.checked) {
            s.timer = Number(target.value);
        } else if (target.hasAttribute("data-cq-teams") && target.checked) {
            s.teams = Number(target.value);
        } else {
            return;
        }
        if (event.type === "change") saveSettings();
        updateSetupNumbers();
    }

    const TEAM_KEYS = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3 };
    const NEXT_KEYS = ["Space", "PageDown", "ArrowRight", "KeyN"];    // a clicker sends one of these

    // event.code is the key's place on the keyboard: P and F work in any layout
    function onQuizKey(event) {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
        const code = event.code;
        const inInput = Boolean(event.target.matches && event.target.matches("input, select, textarea"));
        const onButton = !inInput && Boolean(event.target.closest && event.target.closest("button"));
        if (quiz.screen === "question" && !inInput) {
            // Space and Enter on a focused button press that button; the other keys go on
            const pressesButton = onButton && (code === "Space" || event.key === "Enter");
            if ((NEXT_KEYS.indexOf(code) !== -1 || event.key === "Enter") && !pressesButton) {
                event.preventDefault();
                if (!event.repeat) mainAction();
                return;
            }
            if (code in TEAM_KEYS) {
                event.preventDefault();
                addPoint(TEAM_KEYS[code], event.shiftKey ? -1 : 1);
                return;
            }
            if (code === "KeyP") {
                event.preventDefault();
                togglePause();
                return;
            }
        }
        if (code === "KeyF" && !(event.target.matches && event.target.matches("input"))) {
            event.preventDefault();
            toggleFullscreen();
        }
    }

    // ---------- 11. Language changes and the API ----------
    // The control that has the focus, by what it does (the same one is found again
    // after the screen is drawn in the other language)
    const FOCUS_KEYS = ["data-cq-action", "data-cq-lesson", "data-cq-myths", "data-cq-count", "data-cq-heading"];

    function focusKey(element) {
        if (!element || !quiz.element.contains(element)) return null;
        if (element.hasAttribute("data-cq-point")) {
            return '[data-cq-point="' + element.getAttribute("data-cq-point") + '"][data-cq-for="' + element.getAttribute("data-cq-for") + '"]';
        }
        if (element.name && element.type === "radio") return 'input[name="' + element.name + '"][value="' + element.value + '"]';
        const name = FOCUS_KEYS.find(function (attribute) { return element.hasAttribute(attribute); });
        return name ? "[" + name + (element.getAttribute(name) ? '="' + element.getAttribute(name) + '"' : "") + "]" : null;
    }

    A.onLanguageChange(function () {
        if (doc.open) renderDocument();
        if (quiz.open) {
            const key = focusKey(document.activeElement);
            const wasInside = quiz.element.contains(document.activeElement);
            renderQuiz();
            const again = key ? quiz.element.querySelector(key) : null;
            if (again && again.getClientRects().length) again.focus({ preventScroll: true });
            else if (wasInside && !quiz.element.contains(document.activeElement)) focusQuizHeading();
        }
    });

    A.feature("teachersKit", {
        openDocument: function (view, n, opener) { return openDocument(view, Number(n), opener); },
        classroomQuiz: classroomQuiz,
        // For tests and other tools: the text "Copy as text" copies, and the open window
        documentText: function () { return doc.open && doc.shown ? documentText(doc.page) : ""; },
        state: function () {
            return {
                document: doc.open ? { view: doc.view, n: doc.n, ready: Boolean(doc.shown) } : null,
                quiz: quiz.open ? { screen: quiz.screen, index: quiz.game ? quiz.game.index : -1,
                    total: quiz.game ? quiz.game.ids.length : 0, revealed: Boolean(quiz.game && quiz.game.revealed),
                    scores: quiz.game ? quiz.game.scores.slice() : [], timeUp: Boolean(quiz.game && quiz.game.timeUp) } : null
            };
        }
    });
})();
