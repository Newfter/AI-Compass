/* =========================================================
   AI COMPASS — FOR TEACHERS (the section)
   The "For teachers" section, just above "About":
   - the course at a glance (lessons, tracks, ages, reading time...),
     counted from the lessons themselves;
   - every lesson, with three buttons: "Lesson plan",
     "Worksheet" and "Answer key";
   - "Run a classroom quiz" (a quiz in big type for the projector);
   - a short note on using AI honestly, with a link to lesson 12.
   The section is far down the page, so it is only built when it comes
   near the screen (or when the browser has a quiet moment).

   The plans, the worksheets and the classroom quiz are the "teacher
   kit": a bigger file (js/teachers-kit.js, with its texts and styles)
   that loads only the first time a teacher opens one of them.
   This file stays small, so the page starts as fast as before.

   Sections of this file:
    1. Settings
    2. Small helpers
    3. Building the section
    4. Texts that change with the language
    5. Loading the teacher kit
    6. Start, commands and the API (AICompass.teachers)
   Texts and data (English and Russian): js/content/teachers.js.

   API: AICompass.teachers (see the end of this file)
       openPlan(n, opener)        the lesson plan of lesson n
       openWorksheet(n, opener)   the worksheet of lesson n
       openAnswerKey(n, opener)   its answer key
       classroomQuiz(options)     the classroom quiz (options: see js/teachers-kit.js)
   Each one returns a Promise: true once the window is open, false when
   it can't open (a lesson that doesn't exist, or the kit didn't load).
   Progress event: A.track("teacher.open", { what, n }), sent by the kit
   (what: "plan", "worksheet", "answers" or "quiz"; no n for the quiz).
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const section = document.getElementById("teachers");
    const mount = section && section.querySelector('[data-feature="teachers"]');
    const data = A && A.content.get("teachers");
    // The section lists the lessons, so it needs them (js/lessons.js runs before this file)
    if (!A || !mount || !data || !A.lessons) return;

    const t = A.t;
    const esc = A.escapeHTML;
    // A translated piece of text that core.js re-translates by itself
    const text = A.i18nHTML;

    // ---------- 1. Settings ----------
    // The teacher kit: its texts and its code (loaded in this order), and its styles
    const KIT_SCRIPTS = ["js/content/teachers-kit.js", "js/teachers-kit.js"];
    const KIT_STYLE = "css/teachers-kit.css";
    const KIT_FEATURE = "teachersKit";      // the name js/teachers-kit.js shares its API under

    // The three documents of every lesson, in the order of their buttons
    const DOCUMENTS = [
        { id: "plan", icon: "📝", label: "teachers.plan", name: "teachers.planFor" },
        { id: "worksheet", icon: "✏️", label: "teachers.worksheet", name: "teachers.worksheetFor" },
        { id: "answers", icon: "✅", label: "teachers.answers", name: "teachers.answersFor" }
    ];

    // The course at a glance: an icon and a text key for each fact
    const FACTS = [
        { id: "lessons", icon: "📚" },
        { id: "ages", icon: "🎒" },
        { id: "minutes", icon: "⏱️" },
        { id: "free", icon: "🎁" },
        { id: "offline", icon: "📶" },
        { id: "private", icon: "🔒" }
    ];

    const QUIZ_ICON = "📽️";
    const HONEST_ICON = "🤝";

    // ---------- 2. Small helpers ----------
    const LESSONS = A.lessons.list();          // [{ number, icon, track, level, minutes, ... }]

    function lessonExists(n) {
        return LESSONS.some(function (lesson) { return lesson.number === n; });
    }

    // The shortest and the longest reading time of a lesson, in minutes
    function readingMinutes() {
        const minutes = LESSONS.map(function (lesson) { return lesson.minutes; });
        return { from: Math.min.apply(null, minutes), to: Math.max.apply(null, minutes) };
    }

    // How long one planned class is: the minutes of all its steps
    function classMinutes() {
        return data.planSteps.reduce(function (total, step) { return total + step.minutes; }, 0);
    }

    // ["A", "B", "C"] -> "A, B and C" (in the current language)
    function joinNames(names) {
        if (names.length < 2) return names.join("");
        return names.slice(0, -1).join(", ") + t("teachers.and") + names[names.length - 1];
    }

    // "01", "02"... for the number badges
    function twoDigits(n) {
        return (n < 10 ? "0" : "") + n;
    }

    // ---------- 3. Building the section ----------
    let built = false;

    function factHTML(fact) {
        return `
            <li class="tk-fact">
                <span class="tk-fact-icon" aria-hidden="true">${fact.icon}</span>
                <p class="tk-fact-text">
                    <strong class="tk-fact-value" data-tk-fact="${fact.id}"></strong>
                    <span class="tk-fact-more" data-tk-fact-more="${fact.id}"></span>
                </p>
            </li>`;
    }

    function documentButtonHTML(doc, n) {
        return `
            <button class="tk-doc-button" type="button" data-tk-open="${doc.id}" data-tk-lesson="${n}">
                <span class="tk-doc-icon" aria-hidden="true">${doc.icon}</span>
                ${text(doc.label, "tk-doc-label")}
            </button>`;
    }

    function lessonHTML(lesson) {
        return `
            <li class="tk-lesson">
                <span class="tk-lesson-number mono" aria-hidden="true">${twoDigits(lesson.number)}</span>
                <span class="tk-lesson-icon" aria-hidden="true">${lesson.icon}</span>
                <span class="tk-lesson-text">
                    <span class="tk-lesson-title" data-tk-title="${lesson.number}"></span>
                    <span class="tk-lesson-meta mono" data-tk-meta="${lesson.number}"></span>
                </span>
                <span class="tk-lesson-actions">
                    ${DOCUMENTS.map(function (doc) { return documentButtonHTML(doc, lesson.number); }).join("")}
                </span>
            </li>`;
    }

    function trackHTML(track, index) {
        return `
            <div class="tk-track card" data-tk-track="${esc(track.id)}">
                <h4 class="tk-track-head">
                    <span class="tk-track-icon" aria-hidden="true">${track.icon}</span>
                    <span class="tk-track-label mono" data-tk-track-label="${index + 1}"></span>
                    <span class="tk-track-title" data-tk-track-title="${esc(track.id)}"></span>
                </h4>
                <ol class="tk-lessons">
                    ${track.lessons.map(function (n) {
                        const lesson = LESSONS.find(function (item) { return item.number === n; });
                        return lesson ? lessonHTML(lesson) : "";
                    }).join("")}
                </ol>
            </div>`;
    }

    function build() {
        if (built) return;
        built = true;

        mount.innerHTML = `
            <div class="tk-overview card" data-reveal>
                <span class="ui-corners" aria-hidden="true"></span>
                ${text("teachers.overview", "tk-overview-title", "h3")}
                <ul class="tk-facts">
                    ${FACTS.map(factHTML).join("")}
                </ul>
            </div>

            <div class="tk-kit" data-reveal>
                <div class="tk-kit-head">
                    ${text("teachers.kit.title", "tk-kit-title", "h3")}
                    <p class="tk-kit-text" data-tk-kit-text></p>
                </div>
                <div class="tk-tracks">
                    ${A.lessons.tracks().map(trackHTML).join("")}
                </div>
            </div>

            <div class="tk-extras" data-reveal>
                <div class="tk-extra tk-extra-quiz card ui-scan">
                    <span class="tk-extra-icon" aria-hidden="true">${QUIZ_ICON}</span>
                    ${text("teachers.quiz.title", "tk-extra-title", "h3")}
                    ${text("teachers.quiz.text", "tk-extra-text", "p")}
                    <p class="tk-extra-meta mono" data-tk-quiz-meta></p>
                    <button class="btn btn-primary tk-quiz-button" type="button" data-tk-quiz>
                        <span aria-hidden="true">▶</span> ${text("teachers.quiz.run")}
                    </button>
                </div>
                <div class="tk-extra tk-extra-honest card">
                    <span class="tk-extra-icon" aria-hidden="true">${HONEST_ICON}</span>
                    ${text("teachers.honest.title", "tk-extra-title", "h3")}
                    <p class="tk-extra-text" data-tk-honest-text></p>
                    <a class="btn btn-ghost btn-small tk-honest-link" href="#lesson-${data.honestLesson}" data-tk-honest></a>
                </div>
            </div>`;

        mount.addEventListener("click", onClick);
        renderTexts();
    }

    function onClick(event) {
        const docButton = event.target.closest("[data-tk-open]");
        if (docButton) {
            const n = Number(docButton.getAttribute("data-tk-lesson"));
            openDocument(docButton.getAttribute("data-tk-open"), n, docButton);
            return;
        }
        const quizButton = event.target.closest("[data-tk-quiz]");
        if (quizButton) {
            classroomQuiz({ opener: quizButton });
            return;
        }
        const honestLink = event.target.closest("[data-tk-honest]");
        if (honestLink && lessonExists(data.honestLesson)) {
            // The lessons open their reader themselves (the link also works without this)
            event.preventDefault();
            A.lessons.open(data.honestLesson, honestLink);
        }
    }

    // ---------- 4. Texts that change with the language ----------
    // (the plain texts have data-i18n: core.js translates them by itself)
    function setText(selector, value) {
        mount.querySelectorAll(selector).forEach(function (element) {
            A.dom.setText(element, value);
        });
    }

    function renderTexts() {
        if (!built) return;
        const tracks = A.lessons.tracks();
        const minutes = readingMinutes();
        const quoted = function (name) { return t("teachers.quoted", { name: name }); };

        // The course at a glance
        setText('[data-tk-fact="lessons"]', A.plural("teachers.fact.lessons", A.lessons.count));
        setText('[data-tk-fact-more="lessons"]', A.plural("teachers.fact.tracks", tracks.length, {
            names: joinNames(tracks.map(function (track) { return quoted(track.title()); }))
        }));
        setText('[data-tk-fact="ages"]', t("teachers.fact.ages", data.ages));
        setText('[data-tk-fact-more="ages"]', t("teachers.fact.agesText"));
        setText('[data-tk-fact="minutes"]', t("teachers.fact.minutes", minutes));
        setText('[data-tk-fact-more="minutes"]', t("teachers.fact.minutesText"));
        ["free", "offline", "private"].forEach(function (id) {
            setText('[data-tk-fact="' + id + '"]', t("teachers.fact." + id));
            setText('[data-tk-fact-more="' + id + '"]', t("teachers.fact." + id + "Text"));
        });

        // The lessons and their buttons
        setText("[data-tk-kit-text]", A.plural("teachers.kit.text", classMinutes()));
        tracks.forEach(function (track, index) {
            setText('[data-tk-track-label="' + (index + 1) + '"]', t("teachers.track", { n: index + 1 }));
            setText('[data-tk-track-title="' + track.id + '"]', track.title());
        });
        LESSONS.forEach(function (lesson) {
            const title = A.lessons.title(lesson.number);
            setText('[data-tk-title="' + lesson.number + '"]', title);
            setText('[data-tk-meta="' + lesson.number + '"]',
                t("teachers.lessonN", { n: lesson.number }) + " · " + A.plural("teachers.minutes", lesson.minutes));
            DOCUMENTS.forEach(function (doc) {
                const button = mount.querySelector('[data-tk-open="' + doc.id + '"][data-tk-lesson="' + lesson.number + '"]');
                if (button) A.dom.setAttr(button, "aria-label", t(doc.name, { title: title }));
            });
        });

        // The classroom quiz: how many questions it can ask
        const bank = A.quiz && typeof A.quiz.bank === "function" ? A.quiz.bank() : [];
        const myths = A.quiz && typeof A.quiz.bank === "function" ? A.quiz.bank("myths") : [];
        setText("[data-tk-quiz-meta]", bank.length
            ? A.plural("teachers.quiz.questions", bank.length) + " · " + A.plural("teachers.quiz.myths", myths.length)
            : "");

        // Using AI honestly
        const honest = data.honestLesson;
        setText("[data-tk-honest-text]", t("teachers.honest.text", { n: honest }));
        setText("[data-tk-honest]", t("teachers.honest.open", {
            n: honest,
            title: lessonExists(honest) ? A.lessons.title(honest) : ""
        }));
    }

    // ---------- 5. Loading the teacher kit ----------
    let kitLoading = null;

    // Loads the kit once (its texts, its code and its styles). A failed load
    // is forgotten, so the next click tries again.
    function loadKit() {
        if (!kitLoading) {
            const files = [A.loadStyle(KIT_STYLE)].concat(KIT_SCRIPTS.map(function (src) { return A.loadScript(src); }));
            kitLoading = Promise.all(files).then(function () { return A.whenFeature(KIT_FEATURE); });
            kitLoading.catch(function () { kitLoading = null; });
        }
        return kitLoading;
    }

    // Runs "action" with the kit. While it loads, the button that asked says
    // so (aria-busy); if it can't load, a message says why.
    function withKit(opener, action) {
        const button = opener && opener.nodeType === 1 && opener.closest ? opener.closest("button, a") : null;
        if (button) button.setAttribute("aria-busy", "true");
        return loadKit().then(function (kit) {
            return action(kit);
        }, function () {
            A.toast(t("teachers.loadError"), "⚠️");
            return false;
        }).then(function (result) {
            if (button) button.removeAttribute("aria-busy");
            return Boolean(result);
        });
    }

    // Opens one document of lesson n: "plan", "worksheet" or "answers"
    function openDocument(view, n, opener) {
        n = Number(n);
        if (!lessonExists(n) || !DOCUMENTS.some(function (doc) { return doc.id === view; })) {
            return Promise.resolve(false);
        }
        return withKit(opener, function (kit) { return kit.openDocument(view, n, opener); });
    }

    function classroomQuiz(options) {
        const settings = options || {};
        return withKit(settings.opener, function (kit) { return kit.classroomQuiz(settings); });
    }

    // The button the kit gives the focus back to when its window closes,
    // if the window wasn't opened by a button (from a command, or the API)
    function documentButton(view, n) {
        if (!built) return null;
        return mount.querySelector('[data-tk-open="' + view + '"][data-tk-lesson="' + n + '"]');
    }

    function quizButton() {
        return built ? mount.querySelector("[data-tk-quiz]") : null;
    }

    // ---------- 6. Start, commands and the API ----------
    // index.html keeps the section hidden until this file runs
    A.dom.setHidden(section, false);
    A.whenNeeded(mount, build);
    A.onLanguageChange(renderTexts);

    LESSONS.forEach(function (lesson) {
        A.registerCommand({
            id: "teacher-plan-" + lesson.number,
            group: "teachers.cmdGroup",
            icon: "📝",
            title: function () {
                return t("teachers.cmd.plan", { n: lesson.number, title: A.lessons.title(lesson.number) });
            },
            keywords: "teacher lesson plan worksheet class учитель план урока рабочий лист класс " + lesson.number,
            // An open plan stays open and switches to this lesson
            keepOverlays: ["teacher-plan"],
            run: function () { openDocument("plan", lesson.number, document.activeElement); }
        });
    });

    A.registerCommand({
        id: "teacher-quiz",
        group: "teachers.cmdGroup",
        icon: QUIZ_ICON,
        title: function () { return t("teachers.cmd.quiz"); },
        keywords: "classroom quiz projector teams class teacher викторина класс проектор команды учитель",
        run: function () { classroomQuiz({ opener: document.activeElement }); }
    });

    A.feature("teachers", {
        openPlan: function (n, opener) { return openDocument("plan", n, opener); },
        openWorksheet: function (n, opener) { return openDocument("worksheet", n, opener); },
        openAnswerKey: function (n, opener) { return openDocument("answers", n, opener); },
        classroomQuiz: classroomQuiz,
        // For the kit: the section's buttons (to give the focus back to)
        documentButton: documentButton,
        quizButton: quizButton
    });
})();
