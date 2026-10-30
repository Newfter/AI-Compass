/* =========================================================
   AI COMPASS — LESSONS
   Short interactive lessons about AI, in tracks: "Basics" (lessons
   1-6) and "Deep dive" (7 and on). This file builds a progress panel
   (ring, a lesson map with one row per track, continue / reset), one
   group of lesson cards per track, a full-screen lesson reader (text,
   a mini-lab, key ideas, a "check yourself" question, previous / next)
   and the certificates: one per finished track, one for all lessons.
   Sections of this file:
    1. Settings
    2. The tracks and the lessons (icon, colour, mini-lab, keywords)
    3. Small helpers
    4. Saved progress
    5. Progress panel, certificates and track groups (built once)
    6. Updating the panel, the tracks and the cards
    7. Completing lessons
    8. The certificates
    9. Clicks on the panel, the certificates and the tracks
   10. Mini-lab 1: AI or not AI?
   11. Mini-lab 2: watch a model learn
   12. Mini-lab 3: play with a neuron
   13. Mini-lab 4: be the language model
   14. Mini-lab 5: spot the hidden AI
   15. Mini-lab 6: what would you do? (and the list of these six)
   16. Mini-labs in their own files (A.lessons.defineLab)
   17. The lesson reader (and the glossary words in its text)
   18. Reading aloud
   19. Language and theme changes
   20. Start (and links like #lesson-3)
   21. Ctrl+K commands and the public API
   Every text (English and Russian) is in js/content/lessons.js
   (tracks, reader, lessons 1-6) and js/content/lessons-deep.js
   (lessons 7 and on). Other features use AICompass.lessons (section 21).

   Events (A.track; see "Progress events" in README.md):
     lesson.open { n }             every time a lesson is shown
     lesson.complete { n }         the first time a lesson is marked as done
     lesson.check { n, correct }   a "check yourself" question is answered
     track.complete { track }      the last lesson of a track is done ("basics", "deep")
     certificate.make { track }    a certificate is downloaded ("basics", "deep" or "all")
   Saved in this browser only (A.storage, as "aic:" + the key):
     lessons.completed   [the numbers of the finished lessons]
     lessons.certName    the name typed for the certificates
     lessons.textSize    "s", "m" or "l": the reader's text size
     lessons.view        { v: 1, tracks: { deep: "auto" | "open" | "closed" } }:
                         on phones, whether a track's cards are folded away
     lessons.probe       written and removed at start-up: can the browser save?

   A MINI-LAB IN ITS OWN FILE
   The six first mini-labs live in this file (sections 10-15). A new
   one gets its own file, js/lessons/<name>.js, which loads (together
   with css/lessons-labs.css) the first time its lesson is shown:

       (function () {
           "use strict";
           const A = window.AICompass;
           A.lessons.defineLab("<name>", {
               build: function (host, api) { ... },  // draw the lab inside host (an empty <div>)
               destroy: function (host) { ... },     // optional: stop timers, forget host
               theme: function (host) { ... }        // optional: the theme changed (redraw a <canvas>)
           });
       })();

   build(host, api) runs each time the lab is shown: when its lesson
   opens, and again after a language change (destroy runs first).
   api.lesson          the lesson's number
   api.state           an object for the lab's state: it survives closing
                       the reader and language changes; "Reset progress"
                       empties it
   api.text(key, values)            t("lessons.w<lesson>.<key>", values)
   api.plural(key, count, values)   the same with A.plural
   api.lang            "en" or "ru"
   api.motion          A.motion: animate only when api.motion.ok()
   api.announce(text)  tells screen readers what changed (a live region)
   Closing the reader (or going to another lesson) calls destroy(host);
   the next lesson shown replaces what is inside host, so listeners on
   elements inside it go with them.
   Rules: put listeners on host or inside it (never on window or
   document, unless destroy removes them); give every button a
   data-fid="..." (after a language change the focus comes back to
   the button with the same data-fid); a lab that uses the arrow keys
   calls event.preventDefault() (then ← → don't change the lesson).

   HOW TO ADD A LESSON (the same recipe is in README.md, "Add a lesson")
   1. Section 2: add an entry at the end of LESSONS with the next
      number and its track. Always add at the end: saved progress
      remembers lessons by their number.
   2. Its texts, "lessons.l<n>.*", in js/content/lessons-deep.js, in
      both languages: copy the block of lesson 7 (title, desc, s1-s4
      .h / .p / .note, key1-3, tip, tipBtn, q, a1-a3, explain).
   3. Its mini-lab: reuse one of the six (lab: "sort", ...) or write
      js/lessons/<name>.js as above (lab: "<name>"), with its texts
      "lessons.w<n>.*" (at least .title and .intro).
   The cards, the lesson map, the counts, the certificates, the Ctrl+K
   command and the site search follow the list by themselves.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="lessons"]');
    if (!A || !mount) return;

    const t = A.t;
    const esc = A.escapeHTML;

    // ---------- 1. Settings ----------
    // Numbers you may want to change. Times are in milliseconds, sizes in CSS pixels.
    // (Each mini-lab keeps its own numbers at the start of its section.)
    const READER_ID = "lesson-reader";            // the reader's name among the pop-up windows (A.overlays in core.js)
    const RING_COUNT_UP_TIME = 900;               // the percentage in the progress ring counts up for this long
    const RESET_CONFIRM_TIME = 4000;              // "Reset progress" waits this long for the second press
    const READER_CLOSE_TIME = 260;                // a closing reader is hidden after this (it has mostly faded out by then)
    const TEXT_SIZES = ["s", "m", "l"];           // the reader's text sizes, in the order the "A A" button goes through them
    const NARROW_SCREEN = "(max-width: 400px)";   // here the "Listen" button shows only its sound bars
    const PART_TOP_GAP = 18;                      // space left above a part when the contents list jumps to it
    const SPY_LINE = 0.35;                        // a part is the current one once its top is in the upper 35% of the reader
    const SPY_BOTTOM = 0.985;                     // scrolled this far down (98.5%), the last part is the current one
    const SCROLL_END_LIMIT = 3000;                // a jump in the reader counts as finished after this at the latest
    const SCROLL_START_TIME = 1000;               // browsers without the "scrollend" event: a jump must start within this time
    const SCROLL_QUIET_TIME = 250;                // ... and has finished after this long without a scroll event
    const SPEAK_MARGIN = 40;                      // the sentence read aloud stays at least this far inside the reader
    const NO_VOICE_WARNING_GAP = 5000;            // "no voice" is shown at most once in this time
    const CERT_ICON_STEP = 190;                   // the space between the lesson icons on the certificate (canvas pixels)
    const CERT_ICON_ROW = 1330;                   // their row is never wider than this: with more than 8 lessons, the icons get smaller
    const CERT_ROW_GAP = 152;                     // the full-course certificate has one row of icons per track, this far apart
    const DOWNLOAD_CLEANUP_TIME = 4000;           // the certificate's temporary download address is freed after this
    const LAB_FOLDER = "js/lessons/";             // a mini-lab with its own file is js/lessons/<name>.js ...
    const LAB_STYLES = "css/lessons-labs.css";    // ... and these are the styles of those mini-labs (both load on first use)

    // ---------- 2. The tracks and the lessons ----------
    // The tracks, in order. A track's lessons are the lessons that name it.
    // Texts: "lessons.track.<id>.title" and ".desc". rgb: the track's colour.
    const TRACKS = [
        { id: "basics", icon: "🌱", rgb: "--accent-rgb" },
        { id: "deep", icon: "🤿", rgb: "--accent-2-rgb" }
    ];

    // The texts are in js/content/lessons.js (lessons 1-6) and js/content/lessons-deep.js
    // (7 and on): keys "lessons.l1.title", ... track: the lesson's track (see TRACKS).
    // rgb: which accent colour the lesson uses. lab: which mini-lab it shows (one of the
    // six in sections 10-15, or the name of its own file in js/lessons/, see section 16).
    // correct: index (0, 1 or 2) of the right answer to "Check yourself".
    // notes: which sections have a small highlighted box, and its type.
    // tryIt: where "Try it on this site" goes: a section of the page (TRY_SECTIONS below)
    // or the id of an AI Lab experiment ("classifier", "vision"...). tryIcon: its emoji.
    const LESSONS = [
        {
            number: 1, track: "basics", icon: "🤖", level: "beginner", minutes: 4, rgb: "--accent-rgb",
            sections: 4, notes: { 1: "fact", 2: "example" }, lab: "sort", correct: 1,
            tryIt: "timeline", tryIcon: "🕰️",
            keywords: "what is ai artificial intelligence basics что такое ии искусственный интеллект основы"
        },
        {
            number: 2, track: "basics", icon: "📊", level: "beginner", minutes: 5, rgb: "--accent-2-rgb",
            sections: 4, notes: { 2: "tip" }, lab: "fit", correct: 2,
            tryIt: "classifier", tryIcon: "🧪",
            keywords: "machine learning training data model машинное обучение данные модель"
        },
        {
            number: 3, track: "basics", icon: "🧠", level: "intermediate", minutes: 6, rgb: "--accent-3-rgb",
            sections: 4, notes: { 3: "example" }, lab: "neuron", correct: 0,
            tryIt: "classifier", tryIcon: "🧪",
            keywords: "neural networks neuron deep learning нейронные сети нейрон глубокое обучение нейросеть"
        },
        {
            number: 4, track: "basics", icon: "💬", level: "intermediate", minutes: 6, rgb: "--accent-rgb",
            sections: 4, notes: { 3: "example" }, lab: "words", correct: 2,
            tryIt: "predictor", tryIcon: "🔮",
            keywords: "generative ai chatbots llm chatgpt генеративный ии чат-боты чатбот языковая модель"
        },
        {
            number: 5, track: "basics", icon: "📱", level: "beginner", minutes: 4, rgb: "--accent-2-rgb",
            sections: 4, notes: { 1: "fact" }, lab: "day", correct: 1,
            tryIt: "glossary", tryIcon: "📖",
            keywords: "everyday life phone recommendations повседневная жизнь телефон рекомендации"
        },
        {
            number: 6, track: "basics", icon: "⚖️", level: "intermediate", minutes: 5, rgb: "--accent-3-rgb",
            sections: 4, notes: { 2: "tip" }, lab: "dilemmas", correct: 0,
            tryIt: "quiz", tryIcon: "🏆",
            keywords: "ethics safety bias deepfakes privacy этика безопасность предвзятость дипфейки приватность"
        },
        {
            number: 7, track: "deep", icon: "👁️", level: "intermediate", minutes: 7, rgb: "--accent-2-rgb",
            sections: 4, notes: { 1: "fact", 2: "example", 4: "example" }, lab: "pixels", correct: 2,
            tryIt: "vision", tryIcon: "🔬",
            keywords: "computer vision how computers see pixels images filters convolution cnn компьютерное зрение как компьютер видит пиксели картинки фильтры свёртка свёрточная сеть"
        },
        {
            number: 8, track: "deep", icon: "🎯", level: "intermediate", minutes: 7, rgb: "--accent-3-rgb",
            sections: 4, notes: { 1: "example", 3: "fact", 4: "example" }, lab: "slots", correct: 0,
            tryIt: "maze", tryIcon: "🤖",
            keywords: "reinforcement learning trial and error reward agent q-learning обучение с подкреплением пробы ошибки награда агент"
        },
        {
            number: 9, track: "deep", icon: "✍️", level: "intermediate", minutes: 8, rgb: "--accent-rgb",
            sections: 4, notes: { 1: "fact", 3: "fact", 4: "tip" }, lab: "temperature", correct: 1,
            tryIt: "chatbot", tryIcon: "💬",
            keywords: "how chatbots write tokens next token attention transformer temperature gpt как чат-боты пишут токены внимание трансформер температура"
        }
    ];

    // "Try it on this site" targets that are sections of the page (any other tryIt
    // is an experiment of the AI Lab)
    const TRY_SECTIONS = ["timeline", "glossary", "quiz", "lab"];

    const TOTAL = LESSONS.length;
    // Texts and the hero number can show it: {lessonCount}, data-count-name="lessonCount"
    A.setTextValue("lessonCount", TOTAL);

    // Each track's lesson numbers, in order: { basics: [1, 2, ...], deep: [7, ...] }
    const TRACK_BY_ID = {};
    const TRACK_LESSONS = {};
    TRACKS.forEach(function (track) {
        TRACK_BY_ID[track.id] = track;
        TRACK_LESSONS[track.id] = LESSONS.filter(function (lesson) { return lesson.track === track.id; })
            .map(function (lesson) { return lesson.number; });
    });
    // The lesson map lines its rows up in this many columns (the longest track)
    const LONGEST_TRACK = Math.max.apply(null, TRACKS.map(function (track) { return TRACK_LESSONS[track.id].length; }));

    // The certificates: one per track, and "all" for every lesson (the full course)
    const CERTIFICATES = TRACKS.map(function (track) { return track.id; }).concat("all");

    // ---------- 3. Small helpers ----------
    // (Only what core.js has no helper for.)

    // The element inside root marked data-ref="name"
    function ref(root, name) {
        return root.querySelector('[data-ref="' + name + '"]');
    }

    // 3 -> "03"
    function pad(n) {
        return String(n).padStart(2, "0");
    }

    // lessonKey(2, "title") -> "lessons.l2.title"
    function lessonKey(n, part) {
        return "lessons.l" + n + "." + part;
    }

    function lessonTitle(n) {
        return t(lessonKey(n, "title"));
    }

    // The track of lesson n: "basics", "deep"... ("" when there is no such lesson)
    function trackOf(n) {
        const lesson = LESSONS[n - 1];
        return lesson ? lesson.track : "";
    }

    function trackTitle(id) {
        return t("lessons.track." + id + ".title");
    }

    // The lessons a certificate is for: a track's lessons, or all of them ("all")
    function certLessons(kind) {
        if (kind === "all") return LESSONS.map(function (lesson) { return lesson.number; });
        return TRACK_LESSONS[kind] || [];
    }

    function certTitle(kind) {
        return kind === "all" ? t("lessons.cert.all") : trackTitle(kind);
    }

    // Redraws a part of the page from scratch, but keeps the keyboard focus on
    // the "same" button afterwards (buttons are matched by data-fid).
    function redraw(box, html) {
        const active = document.activeElement;
        const fid = active && box.contains(active) ? active.getAttribute("data-fid") : null;
        box.innerHTML = html;
        if (fid) {
            const again = box.querySelector('[data-fid="' + fid + '"]');
            if (again) again.focus({ preventScroll: true });
        }
    }

    // ---------- 4. Saved progress ----------
    const savedCompleted = A.storage.get("lessons.completed", []);
    const completed = new Set(
        (Array.isArray(savedCompleted) ? savedCompleted : []).filter(function (n) {
            return Number.isInteger(n) && n >= 1 && n <= TOTAL;
        })
    );

    const checkAnswers = {};   // lesson number -> chosen option (this visit only)
    const labState = {};       // lesson number -> state of its mini-lab
    // Can this browser keep the progress? A test write, removed at once, so the panel
    // says the truth from the start (it changes again if a later save fails)
    let canSave = A.storage.set("lessons.probe", 1);
    A.storage.remove("lessons.probe");

    function saveCompleted() {
        canSave = A.storage.set("lessons.completed", Array.from(completed).sort(function (a, b) { return a - b; }));
    }

    // How many of these lessons are done
    function countDone(numbers) {
        return numbers.filter(function (n) { return completed.has(n); }).length;
    }

    function isTrackDone(id) {
        const numbers = TRACK_LESSONS[id] || [];
        return numbers.length > 0 && countDone(numbers) === numbers.length;
    }

    // On phones, the cards of a track after the first can be folded away, so the
    // section doesn't get endless: "open", "closed", or "auto" (open once the track
    // before it is done or one of its lessons was opened; see trackUnfolded)
    const FOLD_CHOICES = ["auto", "open", "closed"];
    const savedView = A.storage.get("lessons.view", null);
    const savedFolds = savedView && savedView.v === 1 && savedView.tracks && typeof savedView.tracks === "object"
        ? savedView.tracks
        : {};
    const view = { v: 1, tracks: {} };
    TRACKS.forEach(function (track, index) {
        if (index === 0) return;
        const choice = savedFolds[track.id];
        view.tracks[track.id] = FOLD_CHOICES.indexOf(choice) !== -1 ? choice : "auto";
    });

    function saveView() {
        A.storage.set("lessons.view", view);
    }

    // The first lesson that is not completed yet (0 when all are done)
    function nextLesson() {
        for (let n = 1; n <= TOTAL; n++) {
            if (!completed.has(n)) return n;
        }
        return 0;
    }

    // ---------- 5. Progress panel, certificates and track groups (built once) ----------
    function cardHTML(lesson) {
        const n = lesson.number;
        return `
            <article class="lsn-card card" id="lesson-card-${n}" data-lesson="${n}" data-reveal data-tilt style="--lsn-rgb: var(${lesson.rgb});">
                <span class="lsn-card-glow" aria-hidden="true"></span>
                <div class="lsn-card-top">
                    <span class="lsn-card-num" aria-hidden="true">${pad(n)}</span>
                    <span class="lsn-badge mono" data-ref="badge" hidden></span>
                </div>
                <div class="lsn-card-icon" aria-hidden="true">
                    <span>${lesson.icon}</span>
                    <span class="lsn-card-tick">✓</span>
                </div>
                <h4 class="lsn-card-title" data-i18n="lessons.l${n}.title">${lessonTitle(n)}</h4>
                <p class="lsn-card-desc" data-i18n="lessons.l${n}.desc">${t(lessonKey(n, "desc"))}</p>
                <div class="lsn-card-meta">
                    <span class="chip lsn-level lsn-level-${lesson.level}">
                        <span class="lsn-dot" aria-hidden="true"></span>
                        <span data-i18n="lessons.level.${lesson.level}">${t("lessons.level." + lesson.level)}</span>
                    </span>
                    <span class="chip"><span aria-hidden="true">⏱</span><span data-ref="minutes"></span></span>
                </div>
                <button type="button" class="btn btn-ghost btn-small lsn-card-open" data-open="${n}">
                    <span data-ref="openText"></span>
                    <span class="lsn-arrow" aria-hidden="true">→</span>
                </button>
            </article>`;
    }

    // One round button per lesson on the map, joined by glowing lines
    function stepHTML(n) {
        return `
            <li class="lsn-step" data-step="${n}">
                <button type="button" class="lsn-node" data-open="${n}">
                    <span class="lsn-node-num" aria-hidden="true">${n}</span>
                    <span class="lsn-node-check" aria-hidden="true">✓</span>
                </button>
                <span class="lsn-step-label" aria-hidden="true" data-i18n="lessons.l${n}.title">${lessonTitle(n)}</span>
            </li>`;
    }

    // The lesson map has one row per track: its name, then its lessons.
    // (The list is named "Basics: 2 of 6 done" by updateHUD, so the label is only for the eyes.)
    function mapRowHTML(track) {
        return `
            <div class="lsn-map-row" data-track="${track.id}">
                <p class="lsn-map-label" aria-hidden="true">
                    <span class="lsn-map-icon">${track.icon}</span>
                    <span class="lsn-map-name" data-i18n="lessons.track.${track.id}.title">${trackTitle(track.id)}</span>
                    <span class="lsn-map-count mono" data-ref="mapCount"></span>
                </p>
                <ol class="lsn-path" data-ref="mapRow">${TRACK_LESSONS[track.id].map(stepHTML).join("")}</ol>
            </div>`;
    }

    // A track: its header (name, description, progress), then its lesson cards.
    // A track after the first has a button that folds its cards away on phones.
    function trackHTML(track, index) {
        const id = track.id;
        const fold = index === 0 ? "" : `
                <button type="button" class="btn btn-ghost lsn-track-fold" data-fold="${id}" aria-controls="lsn-cards-${id}" aria-expanded="true">
                    <span data-ref="foldText"></span>
                    <span class="lsn-fold-arrow" aria-hidden="true">⌄</span>
                </button>`;
        return `
            <section class="lsn-track" id="lsn-track-${id}" data-track="${id}" aria-labelledby="lsn-track-title-${id}" style="--lsn-rgb: var(${track.rgb});">
                <header class="lsn-track-head">
                    <span class="lsn-track-icon" aria-hidden="true">${track.icon}</span>
                    <div class="lsn-track-text">
                        <p class="lsn-track-label mono" data-ref="trackLabel"></p>
                        <h3 class="lsn-track-title" id="lsn-track-title-${id}" data-i18n="lessons.track.${id}.title">${trackTitle(id)}</h3>
                        <p class="lsn-track-desc" data-i18n="lessons.track.${id}.desc">${t("lessons.track." + id + ".desc")}</p>
                        ${index === 0 ? "" : '<p class="lsn-track-hint" data-ref="trackHint" hidden></p>'}
                    </div>
                    <div class="lsn-track-progress">
                        <p class="lsn-track-count" data-ref="trackCount"></p>
                        <span class="lsn-track-bar" aria-hidden="true"><span data-ref="trackBar"></span></span>
                    </div>
                </header>${fold}
                <div class="lsn-grid" id="lsn-cards-${id}">${TRACK_LESSONS[id].map(function (n) { return cardHTML(LESSONS[n - 1]); }).join("")}</div>
            </section>`;
    }

    // One button per certificate in the certificate panel (a track's, or the full course)
    function certPickHTML(kind) {
        const icon = kind === "all" ? "🏆" : TRACK_BY_ID[kind].icon;
        return `
            <button type="button" class="lsn-cert-pick" data-cert="${kind}" data-fid="cert-${kind}" aria-pressed="false">
                <span class="lsn-cert-pick-icon" aria-hidden="true">${icon}</span>
                <span class="lsn-cert-pick-text">
                    <span class="lsn-cert-pick-name" data-ref="certName"></span>
                    <span class="lsn-cert-pick-state" data-ref="certState"></span>
                </span>
            </button>`;
    }

    mount.innerHTML = `
        <div class="lsn-hud card ui-scan" data-reveal>
            <span class="lsn-hud-corners ui-corners" aria-hidden="true"></span>
            <div class="lsn-ring ui-ring" aria-hidden="true">
                <svg class="lsn-ring-ticks ui-ring-ticks" viewBox="0 0 100 100" focusable="false">
                    <circle cx="50" cy="50" r="48" transform="rotate(-90 50 50)"></circle>
                </svg>
                <svg class="lsn-ring-chart ui-ring-chart" viewBox="0 0 100 100" focusable="false">
                    <defs>
                        <linearGradient id="lsn-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" class="lsn-stop-a"></stop>
                            <stop offset="1" class="lsn-stop-b"></stop>
                        </linearGradient>
                    </defs>
                    <circle class="lsn-ring-track ui-ring-track" cx="50" cy="50" r="40" pathLength="100"></circle>
                    <circle class="lsn-ring-fill ui-ring-bar" cx="50" cy="50" r="40" pathLength="100" data-ref="ringFill"></circle>
                </svg>
                <span class="lsn-ring-value"><span data-ref="percent">0</span><small>%</small></span>
            </div>
            <div class="lsn-hud-info">
                <p class="lsn-hud-label mono" data-i18n="lessons.hud.label">${t("lessons.hud.label")}</p>
                <p class="lsn-hud-count" data-ref="count"></p>
                <p class="lsn-hud-sub" data-ref="sub"></p>
            </div>
            <div class="lsn-hud-actions">
                <button type="button" class="btn btn-primary btn-small" data-ref="continue"></button>
                <button type="button" class="btn btn-primary btn-small lsn-cert-toggle" data-ref="certToggle" aria-expanded="false" aria-controls="lsn-cert" hidden>
                    <span aria-hidden="true">🏆</span>
                    <span data-i18n="lessons.cert.button">${t("lessons.cert.button")}</span>
                </button>
                <button type="button" class="btn btn-ghost btn-small lsn-reset" data-ref="reset"></button>
            </div>
            <div class="lsn-map" data-ref="path" role="group" style="--lsn-cols: ${LONGEST_TRACK};">${TRACKS.map(mapRowHTML).join("")}</div>
            <p class="lsn-privacy"><span aria-hidden="true">🔒</span> <span data-ref="privacy"></span></p>
            <p class="sr-only" aria-live="polite" data-ref="live"></p>
        </div>

        <section class="lsn-cert card" id="lsn-cert" aria-labelledby="lsn-cert-title" hidden>
            <div class="lsn-cert-form">
                <p class="lsn-hud-label mono">🏆 AI Compass</p>
                <h3 class="lsn-cert-title" id="lsn-cert-title" data-i18n="lessons.cert.title">${t("lessons.cert.title")}</h3>
                <p class="lsn-cert-intro" data-i18n="lessons.cert.intro">${t("lessons.cert.intro")}</p>
                <p class="lsn-field-label" id="lsn-cert-pick-label" data-i18n="lessons.cert.pick">${t("lessons.cert.pick")}</p>
                <div class="lsn-cert-picks" role="group" aria-labelledby="lsn-cert-pick-label">${CERTIFICATES.map(certPickHTML).join("")}</div>
                <label class="lsn-field-label" for="lsn-cert-name" data-i18n="lessons.cert.nameLabel">${t("lessons.cert.nameLabel")}</label>
                <input class="lsn-input" id="lsn-cert-name" type="text" maxlength="40" autocomplete="name" spellcheck="false" aria-describedby="lsn-cert-privacy"
                       data-i18n-attr="placeholder:lessons.cert.placeholder" placeholder="${esc(t("lessons.cert.placeholder"))}">
                <p class="lsn-cert-privacy" id="lsn-cert-privacy"><span aria-hidden="true">🔒</span> <span data-i18n="lessons.cert.privacy">${t("lessons.cert.privacy")}</span></p>
                <button type="button" class="btn btn-primary" data-ref="certDownload">
                    <span aria-hidden="true">⬇</span>
                    <span data-i18n="lessons.cert.download">${t("lessons.cert.download")}</span>
                </button>
            </div>
            <div class="lsn-cert-preview">
                <canvas width="1600" height="1100" role="img" data-ref="certCanvas"></canvas>
            </div>
        </section>

        <div class="lsn-tracks">${TRACKS.map(trackHTML).join("")}</div>
    `;

    const hud = {
        root: mount.querySelector(".lsn-hud"),
        ringFill: ref(mount, "ringFill"),
        percent: ref(mount, "percent"),
        count: ref(mount, "count"),
        sub: ref(mount, "sub"),
        continueButton: ref(mount, "continue"),
        certToggle: ref(mount, "certToggle"),
        reset: ref(mount, "reset"),
        path: ref(mount, "path"),
        privacy: ref(mount, "privacy"),
        live: ref(mount, "live")
    };

    const cert = {
        root: mount.querySelector(".lsn-cert"),
        picks: Array.prototype.slice.call(mount.querySelectorAll(".lsn-cert-pick")),
        input: mount.querySelector("#lsn-cert-name"),
        download: ref(mount, "certDownload"),
        canvas: ref(mount, "certCanvas")
    };

    const tracksRoot = mount.querySelector(".lsn-tracks");
    const cards = Array.prototype.slice.call(tracksRoot.querySelectorAll(".lsn-card"));
    const steps = Array.prototype.slice.call(hud.path.querySelectorAll(".lsn-step"));

    // The parts of each track that change: its header, its fold button, its row on the map
    const trackParts = TRACKS.map(function (track) {
        const root = tracksRoot.querySelector('.lsn-track[data-track="' + track.id + '"]');
        const row = hud.path.querySelector('.lsn-map-row[data-track="' + track.id + '"]');
        return {
            track: track,
            root: root,
            label: ref(root, "trackLabel"),
            count: ref(root, "trackCount"),
            bar: ref(root, "trackBar"),
            hint: ref(root, "trackHint"),
            fold: root.querySelector("[data-fold]"),
            mapRow: ref(row, "mapRow"),
            mapCount: ref(row, "mapCount")
        };
    });

    // ---------- 6. Updating the panel, the tracks and the cards ----------
    let ringCount = null;       // the percentage counting up (A.countUp), once the ring has started
    let ringStarted = false;

    // Fills the ring and counts the percentage in its middle up (or down) to "target".
    // A new target counts on from the number shown now. (With animations off,
    // A.countUp writes the number at once.)
    function setRing(target) {
        hud.ringFill.style.strokeDashoffset = String(100 - target);
        const from = ringCount ? Math.round(ringCount.value) : 0;
        ringCount = A.countUp(hud.percent, from, target, RING_COUNT_UP_TIME);
    }

    function updateHUD() {
        const done = completed.size;
        const next = nextLesson();
        const percent = Math.round((done / TOTAL) * 100);

        hud.root.classList.toggle("is-complete", done === TOTAL);
        hud.count.textContent = A.plural("lessons.hud.count", done, { total: TOTAL });
        hud.sub.textContent = done === TOTAL
            ? t("lessons.hud.allDone")
            : A.plural("lessons.hud.left", TOTAL - done) + " · " + t("lessons.hud.upNext", { title: lessonTitle(next) });

        // Buttons. The certificate button shows as soon as one certificate is earned.
        hud.continueButton.hidden = done === TOTAL;
        hud.continueButton.innerHTML = esc(done === 0 ? t("lessons.hud.start") : t("lessons.hud.continue", { n: next })) +
            ' <span class="lsn-arrow" aria-hidden="true">→</span>';
        const hasCertificate = earnedCertificates().length > 0;
        hud.certToggle.hidden = !hasCertificate;
        if (!hasCertificate) toggleCertificate(false);
        else if (!cert.root.hidden) updateCertificatePicker();
        hud.reset.hidden = done === 0;
        const armed = resetPress.armed;
        hud.reset.classList.toggle("is-armed", armed);
        hud.reset.textContent = (armed ? "⚠ " : "↺ ") + t(armed ? "lessons.hud.resetConfirm" : "lessons.hud.reset");

        // The lesson map: one row per track ("Basics: 2 of 6 done"), one node per lesson
        hud.path.setAttribute("aria-label", t("lessons.hud.pathLabel"));
        trackParts.forEach(function (part) {
            const numbers = TRACK_LESSONS[part.track.id];
            const doneHere = countDone(numbers);
            part.mapCount.textContent = A.format.number(doneHere) + "/" + A.format.number(numbers.length);
            part.mapRow.setAttribute("aria-label", t("lessons.hud.mapRow", {
                track: trackTitle(part.track.id),
                done: A.plural("lessons.track.done", doneHere, { total: numbers.length })
            }));
        });
        steps.forEach(function (step) {
            const n = Number(step.getAttribute("data-step"));
            const isDone = completed.has(n);
            step.classList.toggle("is-done", isDone);
            step.classList.toggle("is-next", n === next);
            step.classList.toggle("is-linked", isDone && completed.has(n - 1));
            const node = step.querySelector(".lsn-node");
            node.setAttribute("aria-label", t(isDone ? "lessons.hud.nodeDone" : "lessons.hud.nodeTodo", { n: n, title: lessonTitle(n) }));
            node.title = lessonTitle(n);
        });

        // Where the progress is kept (or that it can't be kept)
        hud.privacy.textContent = t(canSave ? "lessons.hud.privacy" : "lessons.hud.noSave");

        if (ringStarted) setRing(percent);
    }

    // On phones a track after the first shows its cards when the learner unfolds it,
    // or ("auto") once the track before it is done or one of its own lessons is done
    function trackUnfolded(index) {
        const id = TRACKS[index].id;
        const choice = view.tracks[id];
        if (choice === "open") return true;
        if (choice === "closed") return false;
        return isTrackDone(TRACKS[index - 1].id) || countDone(TRACK_LESSONS[id]) > 0;
    }

    // Opening a lesson of a folded track unfolds it (for good): the reader comes back to its card
    function unfoldTrackOf(n) {
        const id = trackOf(n);
        if (!Object.prototype.hasOwnProperty.call(view.tracks, id) || view.tracks[id] === "open") return;
        view.tracks[id] = "open";
        saveView();
        updateTracks();
    }

    function toggleFold(id) {
        const index = TRACKS.indexOf(TRACK_BY_ID[id]);
        if (index < 1) return;
        view.tracks[id] = trackUnfolded(index) ? "closed" : "open";
        saveView();
        updateTracks();
    }

    // The track headers: "TRACK 2 · 3 LESSONS", "1 of 3 done" and its bar, the hint,
    // the fold button. (The folding itself only happens on phones: see css/lessons.css.)
    function updateTracks() {
        trackParts.forEach(function (part, index) {
            const id = part.track.id;
            const numbers = TRACK_LESSONS[id];
            const doneHere = countDone(numbers);
            const isComplete = numbers.length > 0 && doneHere === numbers.length;
            part.root.classList.toggle("is-complete", isComplete);
            part.label.textContent = t("lessons.track.label", { n: index + 1 }) + " · " + A.plural("lessons.track.lessons", numbers.length);
            part.count.textContent = (isComplete ? "✓ " : "") + A.plural("lessons.track.done", doneHere, { total: numbers.length });
            part.bar.style.width = (numbers.length ? (doneHere / numbers.length) * 100 : 0) + "%";
            if (index === 0) return;

            // Nothing is locked: the hint only suggests finishing the track before it first
            const before = TRACKS[index - 1].id;
            part.hint.hidden = isTrackDone(before);
            part.hint.textContent = "💡 " + t("lessons.track.hint", { before: trackTitle(before) });

            const open = trackUnfolded(index);
            part.root.classList.toggle("is-folded", !open);
            part.fold.setAttribute("aria-expanded", String(open));
            ref(part.fold, "foldText").textContent = t(open ? "lessons.track.hide" : "lessons.track.show", { track: trackTitle(id) });
        });
    }

    function updateCards() {
        const next = nextLesson();
        cards.forEach(function (card) {
            const n = Number(card.getAttribute("data-lesson"));
            const lesson = LESSONS[n - 1];
            const isDone = completed.has(n);
            const isNext = n === next;
            card.classList.toggle("is-done", isDone);
            card.classList.toggle("is-next", isNext);

            const badge = ref(card, "badge");
            badge.hidden = !isDone && !isNext;
            badge.textContent = isDone ? "✓ " + t("lessons.card.done") : t("lessons.card.next");

            ref(card, "minutes").textContent = t("lessons.card.minutes", { n: lesson.minutes });
            ref(card, "openText").textContent = t(isDone ? "lessons.card.review" : "lessons.card.open");
            card.querySelector("[data-open]").setAttribute("aria-label",
                t(isDone ? "lessons.card.reviewLabel" : "lessons.card.openLabel", { n: n, title: lessonTitle(n) }));
        });
    }

    function updateProgress() {
        updateHUD();
        updateTracks();
        updateCards();
        if (reader.open) updateReaderChrome();
    }

    // The ring counts up the first time the panel comes into view
    let stopRingWatch = null;
    stopRingWatch = A.whenVisible(hud.root, function (visible) {
        if (!visible || ringStarted) return;
        ringStarted = true;
        setRing(Math.round((completed.size / TOTAL) * 100));
        if (stopRingWatch) stopRingWatch();
    }, { threshold: 0.3 });

    // The decorative loops (ring ticks, glowing lines...) pause while the lessons are
    // off screen (whenVisible sets data-paused then) and while the reader covers them
    let mountVisible = true;
    let readerCovers = false;

    function updatePaused() {
        mount.toggleAttribute("data-paused", !mountVisible || readerCovers);
    }

    A.whenVisible(mount, function (visible) {
        mountVisible = visible;
        updatePaused();
    }, { pauseAnimations: true });

    A.overlays.onChange(function (detail) {
        readerCovers = detail.open.indexOf(READER_ID) !== -1;
        updatePaused();
    });

    // ---------- 7. Completing lessons ----------
    function setCompleted(n, isDone) {
        const before = completed.size;
        const wasDone = completed.has(n);
        const track = trackOf(n);
        const trackWasDone = isTrackDone(track);
        if (isDone) completed.add(n);
        else completed.delete(n);
        saveCompleted();
        updateProgress();
        const finishedTrack = isDone && !trackWasDone && isTrackDone(track);
        if (isDone && !wasDone) A.track("lesson.complete", { n: n });
        if (finishedTrack) A.track("track.complete", { track: track });

        if (!isDone) {
            A.toast(t("lessons.toast.undone"), "↩️");
            return;
        }
        // The very last lesson gets one big message instead of two small ones,
        // and the last lesson of a track says that its certificate is ready
        if (completed.size === TOTAL && before < TOTAL) {
            if (A.effects) A.effects.confetti();   // two bursts from the bottom corners
            A.toast(A.plural("lessons.toast.all", TOTAL), "🏆");
        } else if (finishedTrack) {
            if (A.effects) A.effects.confetti();
            A.toast(t("lessons.toast.track", { track: trackTitle(track) }), "🎓");
        } else {
            A.toast(t("lessons.toast.done", { title: lessonTitle(n) }), "✅");
        }
    }

    // Reset needs two presses, so progress is not lost by accident. The first press
    // asks "Sure?" (updateHUD paints the armed button); a second press within
    // RESET_CONFIRM_TIME resets. A.confirmPress ignores the second click of a
    // double-click (or a double tap) and a held-down Enter key.
    function resetProgress() {
        completed.clear();
        saveCompleted();
        Object.keys(checkAnswers).forEach(function (key) { delete checkAnswers[key]; });
        Object.keys(labState).forEach(function (key) { delete labState[key]; });
        updateProgress();
        A.toast(t("lessons.toast.reset"), "↺");
        hud.continueButton.focus();
    }

    const resetPress = A.confirmPress(hud.reset, {
        onArm: function () {
            updateHUD();
            A.announce(t("lessons.hud.resetAsk"), { region: hud.live });
        },
        onDisarm: updateHUD,
        onConfirm: resetProgress,
        timeout: RESET_CONFIRM_TIME
    });

    // ---------- 8. The certificates ----------
    // One per finished track, and one for every lesson ("all", the full course).
    // The picture is drawn on a <canvas> (only while it is shown) and can be saved as a PNG file.
    let certFrame = 0;
    let certKind = "";   // the certificate shown: "basics", "deep" or "all" ("" when none is earned)

    // The certificates earned so far, in the order of CERTIFICATES
    function earnedCertificates() {
        return CERTIFICATES.filter(function (kind) {
            const numbers = certLessons(kind);
            return numbers.length > 0 && countDone(numbers) === numbers.length;
        });
    }

    // The picker: the earned certificates can be chosen, the others say how many lessons are left.
    // If the one shown is no longer earned (a lesson was un-completed), the best earned one is shown:
    // the last in the list, so the full course comes first, then the later tracks.
    function updateCertificatePicker() {
        const earned = earnedCertificates();
        if (earned.indexOf(certKind) === -1) certKind = earned.length ? earned[earned.length - 1] : "";
        cert.picks.forEach(function (button) {
            const kind = button.getAttribute("data-cert");
            const isEarned = earned.indexOf(kind) !== -1;
            const numbers = certLessons(kind);
            button.setAttribute("aria-pressed", String(kind === certKind));
            button.setAttribute("aria-disabled", String(!isEarned));
            button.classList.toggle("is-earned", isEarned);
            ref(button, "certName").textContent = certTitle(kind);
            ref(button, "certState").textContent = isEarned
                ? "✓ " + t("lessons.cert.earned")
                : A.plural("lessons.cert.toGo", numbers.length - countDone(numbers));
        });
    }

    function pickCertificate(kind) {
        if (earnedCertificates().indexOf(kind) === -1) return;
        certKind = kind;
        updateCertificatePicker();
        drawCertificate();
    }

    function toggleCertificate(force) {
        const show = typeof force === "boolean" ? force : cert.root.hidden;
        if (show && !earnedCertificates().length) return;
        cert.root.hidden = !show;
        hud.certToggle.setAttribute("aria-expanded", String(show));
        if (show) {
            updateCertificatePicker();
            drawCertificate();
            cert.root.scrollIntoView({ behavior: A.motion.ok() ? "smooth" : "auto", block: "nearest" });
        }
    }

    function scheduleCertificate() {
        if (cert.root.hidden) return;
        cancelAnimationFrame(certFrame);
        certFrame = requestAnimationFrame(drawCertificate);
    }

    // Writes text and makes the font smaller until it fits the given width
    function fitText(ctx, text, x, y, maxWidth, weight, size, family) {
        let fontSize = size;
        ctx.font = weight + " " + fontSize + "px " + family;
        while (ctx.measureText(text).width > maxWidth && fontSize > 12) {
            fontSize -= 2;
            ctx.font = weight + " " + fontSize + "px " + family;
        }
        ctx.fillText(text, x, y);
    }

    // Splits text into lines that are each at most maxWidth wide
    function splitLines(ctx, text, maxWidth) {
        const lines = [];
        let line = "";
        text.split(" ").forEach(function (word) {
            const test = line ? line + " " + word : word;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        });
        lines.push(line);
        return lines;
    }

    // Writes text on two centred lines. If it needs more lines, the font gets
    // a little smaller until it fits (no words are ever cut off).
    function wrapText(ctx, text, x, y, maxWidth, weight, size, family) {
        let fontSize = size;
        let lines;
        do {
            ctx.font = weight + " " + fontSize + "px " + family;
            lines = splitLines(ctx, text, maxWidth);
            fontSize -= 1;
        } while (lines.length > 2 && fontSize >= 14);
        const lineHeight = Math.round((fontSize + 1) * 1.28);
        lines.forEach(function (line, index) {
            ctx.fillText(line, x, y + index * lineHeight);
        });
    }

    // One lesson on the certificate: its icon in a ring, a check mark, and (if
    // withTitle) its title under it. scale 1 is full size.
    function drawLessonBadge(ctx, lesson, x, y, scale, withTitle, look) {
        const scaled = function (size) { return Math.round(size * scale); };
        ctx.beginPath();
        ctx.arc(x, y, 54 * scale, 0, Math.PI * 2);
        ctx.fillStyle = look.rgba("--accent", 0.14);
        ctx.fill();
        ctx.strokeStyle = look.gradient;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.font = scaled(46) + "px " + look.fonts.body;
        ctx.textBaseline = "middle";
        ctx.fillStyle = look.color.text;
        ctx.fillText(lesson.icon, x, y + 3 * scale);
        ctx.beginPath();
        ctx.arc(x + 40 * scale, y - 40 * scale, 17 * scale, 0, Math.PI * 2);
        ctx.fillStyle = look.color.success;
        ctx.fill();
        ctx.fillStyle = look.color.bg;
        ctx.font = "700 " + scaled(20) + "px " + look.fonts.body;
        ctx.fillText("✓", x + 40 * scale, y - 39 * scale);
        ctx.textBaseline = "alphabetic";
        if (withTitle) {
            ctx.fillStyle = look.color.muted;
            wrapText(ctx, lessonTitle(lesson.number), x, y + 92 * scale, 176 * scale, "600", scaled(19), look.fonts.body);
        }
    }

    // A row of lessons centred on x = W / 2. The row is never wider than
    // CERT_ICON_ROW: with many lessons, the icons get smaller (never bigger than maxScale).
    function drawLessonRow(ctx, numbers, W, y, maxScale, withTitle, look) {
        const count = numbers.length;
        const scale = Math.min(maxScale, CERT_ICON_ROW / Math.max(1, (count - 1) * CERT_ICON_STEP));
        numbers.forEach(function (n, index) {
            const x = W / 2 + (index - (count - 1) / 2) * CERT_ICON_STEP * scale;
            drawLessonBadge(ctx, LESSONS[n - 1], x, y, scale, withTitle, look);
        });
    }

    function drawCertificate() {
        if (!certKind) return;
        const canvas = cert.canvas;
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const H = canvas.height;
        // The theme's colours (a canvas can't use CSS variables): rgba(name, alpha)
        const rgba = function (name, alpha) {
            return A.colors.rgba(A.colors.rgb(name), alpha === undefined ? 1 : alpha);
        };
        const color = {
            bg: rgba("--bg"),
            text: rgba("--text"),
            muted: rgba("--text-muted"),
            accent: rgba("--accent"),
            accent2: rgba("--accent-2"),
            success: rgba("--success")
        };
        const fonts = {
            display: A.cssVar("--font-display") || "sans-serif",
            body: A.cssVar("--font-body") || "sans-serif",
            mono: A.cssVar("--font-mono") || "monospace"
        };
        const name = cert.input.value.trim() || t("lessons.cert.defaultName");
        const numbers = certLessons(certKind);
        const gradient = ctx.createLinearGradient(0, 0, W, H);
        gradient.addColorStop(0, color.accent);
        gradient.addColorStop(1, color.accent2);
        // What the lesson badges need (see drawLessonBadge)
        const look = { rgba: rgba, color: color, fonts: fonts, gradient: gradient };

        ctx.save();
        ctx.clearRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";

        // Background with two soft glows and a fine grid
        ctx.fillStyle = color.bg;
        ctx.fillRect(0, 0, W, H);
        let glow = ctx.createRadialGradient(260, 160, 0, 260, 160, 900);
        glow.addColorStop(0, rgba("--accent", 0.3));
        glow.addColorStop(1, rgba("--accent", 0));
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
        glow = ctx.createRadialGradient(W - 220, H - 160, 0, W - 220, H - 160, 800);
        glow.addColorStop(0, rgba("--accent-2", 0.2));
        glow.addColorStop(1, rgba("--accent-2", 0));
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = rgba("--accent", 0.07);
        ctx.lineWidth = 1;
        for (let x = 0; x <= W; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y <= H; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Frames and corner brackets
        A.canvas.roundRect(ctx, 36, 36, W - 72, H - 72, 40);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
        A.canvas.roundRect(ctx, 60, 60, W - 120, H - 120, 28);
        ctx.strokeStyle = rgba("--accent-2", 0.25);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.strokeStyle = color.accent2;
        ctx.lineWidth = 5;
        [[84, 84, 1, 1], [W - 84, 84, -1, 1], [84, H - 84, 1, -1], [W - 84, H - 84, -1, -1]].forEach(function (c) {
            ctx.beginPath();
            ctx.moveTo(c[0], c[1] + 56 * c[3]);
            ctx.lineTo(c[0], c[1]);
            ctx.lineTo(c[0] + 56 * c[2], c[1]);
            ctx.stroke();
        });

        // Brand with the certificate's name ("AI COMPASS: BASICS"), and heading
        ctx.fillStyle = color.accent2;
        if ("letterSpacing" in ctx) ctx.letterSpacing = "8px";
        fitText(ctx, "🧭 AI COMPASS: " + certTitle(certKind).toUpperCase(), W / 2, 168, 1300, "600", 30, fonts.mono);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
        ctx.fillStyle = gradient;
        fitText(ctx, t("lessons.cert.heading").toUpperCase(), W / 2, 268, 1280, "700", 58, fonts.display);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

        // The name, with a glow
        ctx.save();
        ctx.shadowColor = rgba("--accent", 0.55);
        ctx.shadowBlur = 36;
        ctx.fillStyle = color.text;
        fitText(ctx, name, W / 2, 448, 1240, "700", 100, fonts.display);
        ctx.restore();
        const line = ctx.createLinearGradient(W / 2 - 380, 0, W / 2 + 380, 0);
        line.addColorStop(0, rgba("--accent-2", 0));
        line.addColorStop(0.5, color.accent2);
        line.addColorStop(1, rgba("--accent", 0));
        ctx.fillStyle = line;
        ctx.fillRect(W / 2 - 380, 492, 760, 3);

        // "for completing all six lessons (of the Basics track)": the number as a word
        // when the texts have one ("lessons.cert.count.6"), otherwise in digits
        const countWord = "lessons.cert.count." + numbers.length;
        const values = A.has(countWord) ? { n: t(countWord) } : {};
        const forText = certKind === "all"
            ? A.plural("lessons.cert.for", numbers.length, values)
            : A.plural("lessons.cert.forTrack", numbers.length, Object.assign({ track: certTitle(certKind) }, values));
        ctx.fillStyle = color.muted;
        fitText(ctx, forText, W / 2, 566, 1240, "500", 34, fonts.body);

        // The lessons with a check mark: a track's in one row around the middle, with
        // their titles; the full course's in one row per track, with the track's name
        if (certKind !== "all") {
            drawLessonRow(ctx, numbers, W, 700, 1, true, look);
        } else {
            TRACKS.forEach(function (track, index) {
                const y = 690 + index * CERT_ROW_GAP;
                ctx.fillStyle = color.muted;
                if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";
                fitText(ctx, trackTitle(track.id).toUpperCase(), W / 2, y - 60, 900, "600", 20, fonts.mono);
                if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
                drawLessonRow(ctx, TRACK_LESSONS[track.id], W, y, 0.8, false, look);
            });
        }

        // Date and seal
        const date = A.format.date(new Date());
        ctx.textAlign = "left";
        ctx.fillStyle = color.muted;
        ctx.font = "500 26px " + fonts.mono;
        ctx.fillText(t("lessons.cert.date", { date: date }), 132, H - 128);

        // The round "6/6" seal (the certificate's lessons, all done) sits low enough to leave space under the lesson names
        const sealX = W - 220;
        const sealY = H - 168;
        ctx.textAlign = "center";
        ctx.beginPath();
        ctx.arc(sealX, sealY, 78, 0, Math.PI * 2);
        ctx.fillStyle = rgba("--accent-2", 0.1);
        ctx.fill();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sealX, sealY, 65, 0, Math.PI * 2);
        ctx.setLineDash([4, 8]);
        ctx.strokeStyle = color.accent2;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = gradient;
        ctx.font = "700 40px " + fonts.display;
        ctx.fillText(A.format.number(countDone(numbers)) + "/" + A.format.number(numbers.length), sealX, sealY + 7);
        ctx.fillStyle = color.muted;
        fitText(ctx, A.plural("lessons.cert.lessons", numbers.length).toUpperCase(), sealX, sealY + 36, 100, "600", 16, fonts.mono);
        ctx.restore();

        canvas.setAttribute("aria-label", t("lessons.cert.preview", { cert: certTitle(certKind), name: name }));
    }

    function downloadCertificate() {
        if (!certKind) return;
        drawCertificate();
        A.track("certificate.make", { track: certKind });
        const fileName = "ai-compass-certificate-" + certKind + ".png";
        function save(url, isBlob) {
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            if (isBlob) setTimeout(function () { URL.revokeObjectURL(url); }, DOWNLOAD_CLEANUP_TIME);
            A.toast(t("lessons.toast.cert"), "🏆");
        }
        try {
            if (cert.canvas.toBlob) {
                cert.canvas.toBlob(function (blob) {
                    if (blob) save(URL.createObjectURL(blob), true);
                    else save(cert.canvas.toDataURL("image/png"), false);
                }, "image/png");
            } else {
                save(cert.canvas.toDataURL("image/png"), false);
            }
        } catch (error) {
            // A browser can refuse to turn the picture into a file: then there is no download
        }
    }

    // The saved name: only a text, and never longer than the box allows (maxlength)
    const savedName = A.storage.get("lessons.certName", "");
    cert.input.value = typeof savedName === "string" ? savedName.slice(0, cert.input.maxLength) : "";
    cert.input.addEventListener("input", function () {
        A.storage.set("lessons.certName", cert.input.value);
        scheduleCertificate();
    });
    cert.download.addEventListener("click", downloadCertificate);

    // ---------- 9. Clicks on the panel, the certificates and the tracks ----------
    hud.root.addEventListener("click", function (event) {
        const node = event.target.closest("[data-open]");
        if (node) {
            openLesson(Number(node.getAttribute("data-open")), node);
            return;
        }
        if (event.target.closest('[data-ref="continue"]')) {
            openLesson(nextLesson() || 1, hud.continueButton);
        } else if (event.target.closest('[data-ref="certToggle"]')) {
            toggleCertificate();
        }
        // (Reset listens by itself: see resetPress in section 7)
    });

    cert.root.addEventListener("click", function (event) {
        const pick = event.target.closest("[data-cert]");
        if (pick) pickCertificate(pick.getAttribute("data-cert"));
    });

    // The fold button of a track (phones), and a click anywhere on a card, which
    // opens it (the card's button is the keyboard way in)
    tracksRoot.addEventListener("click", function (event) {
        const fold = event.target.closest("[data-fold]");
        if (fold) {
            toggleFold(fold.getAttribute("data-fold"));
            return;
        }
        const card = event.target.closest(".lsn-card");
        if (!card) return;
        const selection = window.getSelection ? String(window.getSelection()) : "";
        if (selection && !event.target.closest("button")) return;   // the user is selecting text
        openLesson(Number(card.getAttribute("data-lesson")), card.querySelector("[data-open]"));
    });

    // ---------- 10. Mini-lab 1: AI or not AI? ----------
    const SORT_ANSWERS = ["not", "ai", "ai", "not", "ai"];

    // Every mini-lab gets a view (redrawn) and a hidden live region (for screen readers)
    function labShell(box) {
        box.innerHTML = '<div class="lsn-lab-view"></div><p class="sr-only" aria-live="polite"></p>';
        return { view: box.firstElementChild, live: box.lastElementChild };
    }

    function mountSortLab(box, state) {
        const shell = labShell(box);

        function choiceButton(index, value, pick) {
            const label = value === "ai" ? "🤖 " + t("lessons.w1.ai") : "⚙️ " + t("lessons.w1.not");
            return `<button type="button" class="lsn-pill" data-sort="${value}" data-i="${index}" data-fid="w1-${index}-${value}"
                        aria-pressed="${pick === value}"${pick ? ' aria-disabled="true"' : ""}>${label}</button>`;
        }

        function draw() {
            let score = 0;
            let answered = 0;
            const rows = SORT_ANSWERS.map(function (answer, index) {
                const pick = state.answers[index];
                const isRight = pick === answer;
                if (pick) {
                    answered += 1;
                    if (isRight) score += 1;
                }
                const stateClass = pick ? (isRight ? "is-right" : "is-wrong") : "";
                const feedback = pick
                    ? `<p class="lsn-sort-feedback"><strong>${isRight ? "✓ " + t("lessons.w1.right") : "✗ " + t("lessons.w1.wrong")}</strong> ${t("lessons.w1.e" + (index + 1))}</p>`
                    : "";
                return `
                    <li class="lsn-sort-item ${stateClass}">
                        <p class="lsn-sort-text" id="lsn-sort-${index}">${t("lessons.w1.i" + (index + 1))}</p>
                        <div class="lsn-sort-buttons" role="group" aria-labelledby="lsn-sort-${index}">
                            ${choiceButton(index, "ai", pick)}
                            ${choiceButton(index, "not", pick)}
                        </div>
                        ${feedback}
                    </li>`;
            }).join("");

            let summary = t("lessons.w1.score", { score: score, total: SORT_ANSWERS.length });
            if (answered === SORT_ANSWERS.length) {
                summary += " — " + t(score === SORT_ANSWERS.length ? "lessons.w1.perfect" : "lessons.w1.good");
            }
            redraw(shell.view, `
                <ol class="lsn-sort">${rows}</ol>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-score">${summary}</p>
                    ${answered ? `<button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w1-reset">↺ ${t("lessons.w1.reset")}</button>` : ""}
                </div>`);
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-sort]");
            if (button) {
                const index = Number(button.getAttribute("data-i"));
                if (state.answers[index]) return;
                state.answers[index] = button.getAttribute("data-sort");
                draw();
                const isRight = state.answers[index] === SORT_ANSWERS[index];
                A.announce(t(isRight ? "lessons.w1.right" : "lessons.w1.wrong") + " " + t("lessons.w1.e" + (index + 1)), { region: shell.live });
                return;
            }
            if (event.target.closest('[data-lab="reset"]')) {
                state.answers = SORT_ANSWERS.map(function () { return null; });
                draw();
                const first = shell.view.querySelector("[data-sort]");
                if (first) first.focus({ preventScroll: true });
            }
        };

        draw();
        return null;
    }

    // ---------- 11. Mini-lab 2: watch a model learn (a line learns with gradient descent) ----------
    // Pretend data: hours of study -> test score
    const FIT_HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const FIT_SCORES = [33, 45, 46, 58, 56, 69, 71, 78, 85];
    const FIT_START = { a: -0.2, b: 0.6 };   // the line starts sloping the wrong way
    const FIT_RATE = 0.6;                     // the "learning rate": how big each nudge is
    const FIT_STOP_CHANGE = 0.005;            // learning stops when a step changes the error by less than this...
    const FIT_MAX_STEPS = 300;                // ... or after this many steps
    const FIT_STEP_TIME = 70;                 // "Auto" takes one step every 70 ms
    const FIT_CHART_STEPS = 60;               // the error chart is at least this many steps wide

    // Average error of the line "score = a * hours + b", in points (root mean square)
    function fitError(a, b) {
        let total = 0;
        FIT_HOURS.forEach(function (hours, i) {
            const diff = a * (hours / 10) + b - FIT_SCORES[i] / 100;
            total += diff * diff;
        });
        return Math.sqrt(total / FIT_HOURS.length) * 100;
    }

    // One step of gradient descent: find which way makes the error smaller, move a little
    function fitStep(state) {
        let slopeA = 0;
        let slopeB = 0;
        FIT_HOURS.forEach(function (hours, i) {
            const x = hours / 10;
            const diff = state.a * x + state.b - FIT_SCORES[i] / 100;
            slopeA += (2 * diff * x) / FIT_HOURS.length;
            slopeB += (2 * diff) / FIT_HOURS.length;
        });
        state.a -= FIT_RATE * slopeA;
        state.b -= FIT_RATE * slopeB;
        state.step += 1;
        const error = fitError(state.a, state.b);
        const previous = state.history[state.history.length - 1];
        state.history.push(error);
        state.done = Math.abs(previous - error) < FIT_STOP_CHANGE || state.step >= FIT_MAX_STEPS;
    }

    function freshFit() {
        return { a: FIT_START.a, b: FIT_START.b, step: 0, history: [fitError(FIT_START.a, FIT_START.b)], done: false, running: false };
    }

    function mountFitLab(box, state) {
        const shell = labShell(box);
        const view = shell.view;

        // Chart sizes (in SVG units)
        const left = 46;
        const right = 326;
        const top = 14;
        const bottom = 190;
        const sx = function (hours) { return left + (hours / 10) * (right - left); };
        const sy = function (score) { return bottom - (score / 100) * (bottom - top); };
        const lossLeft = 30;
        const lossRight = 292;
        const lossTop = 10;
        const lossBottom = 84;
        const lossMax = 25;

        let gridLines = "";
        let labels = "";
        [0, 25, 50, 75, 100].forEach(function (score) {
            gridLines += `<line x1="${left}" x2="${right}" y1="${sy(score)}" y2="${sy(score)}"/>`;
            labels += `<text x="${left - 8}" y="${sy(score) + 3.5}" text-anchor="end">${score}</text>`;
        });
        [0, 2, 4, 6, 8, 10].forEach(function (hours) {
            gridLines += `<line x1="${sx(hours)}" x2="${sx(hours)}" y1="${top}" y2="${bottom}"/>`;
            labels += `<text x="${sx(hours)}" y="${bottom + 15}" text-anchor="middle">${hours}</text>`;
        });
        const points = FIT_HOURS.map(function (hours, i) {
            return `<circle cx="${sx(hours)}" cy="${sy(FIT_SCORES[i])}" r="5"/>`;
        }).join("");

        view.innerHTML = `
            <div class="lsn-fit">
                <figure class="lsn-fit-chart">
                    <svg viewBox="0 0 340 230" role="img" aria-label="${esc(t("lessons.w2.chart"))}">
                        <defs>
                            <clipPath id="lsn-fit-clip"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}"/></clipPath>
                        </defs>
                        <g class="lsn-chart-grid">${gridLines}</g>
                        <g class="lsn-chart-labels">${labels}</g>
                        <text class="lsn-chart-title" x="${(left + right) / 2}" y="224" text-anchor="middle">${t("lessons.w2.hours")}</text>
                        <text class="lsn-chart-title" transform="translate(11 ${(top + bottom) / 2}) rotate(-90)" text-anchor="middle">${t("lessons.w2.score")}</text>
                        <g class="lsn-fit-residuals" data-residuals clip-path="url(#lsn-fit-clip)"></g>
                        <line class="lsn-fit-line" data-line clip-path="url(#lsn-fit-clip)"/>
                        <g class="lsn-fit-points">${points}</g>
                    </svg>
                    <figcaption class="lsn-legend">
                        <span><i class="lsn-key-dot" aria-hidden="true"></i>${t("lessons.w2.data")}</span>
                        <span><i class="lsn-key-line" aria-hidden="true"></i>${t("lessons.w2.model")}</span>
                        <span><i class="lsn-key-dash" aria-hidden="true"></i>${t("lessons.w2.residual")}</span>
                    </figcaption>
                </figure>
                <div class="lsn-fit-side">
                    <p class="lsn-stat-step mono" data-stat="step"></p>
                    <p class="lsn-stat-big" data-stat="error"></p>
                    <p class="lsn-stat-small" data-stat="predict"></p>
                    <figure class="lsn-loss">
                        <figcaption class="mono">${t("lessons.w2.lossTitle")}</figcaption>
                        <svg viewBox="0 0 300 92" role="img" aria-label="${esc(t("lessons.w2.lossChart"))}">
                            <defs>
                                <linearGradient id="lsn-loss-fill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0" class="lsn-stop-a"></stop>
                                    <stop offset="1" class="lsn-stop-fade"></stop>
                                </linearGradient>
                            </defs>
                            <line class="lsn-loss-axis" x1="${lossLeft}" x2="${lossRight}" y1="${lossBottom}" y2="${lossBottom}"/>
                            <line class="lsn-loss-axis" x1="${lossLeft}" x2="${lossLeft}" y1="${lossTop}" y2="${lossBottom}"/>
                            <text class="lsn-loss-tick" x="${lossLeft - 5}" y="${lossTop + 4}" text-anchor="end">${lossMax}</text>
                            <text class="lsn-loss-tick" x="${lossLeft - 5}" y="${lossBottom}" text-anchor="end">0</text>
                            <path class="lsn-loss-area" data-loss-area/>
                            <polyline class="lsn-loss-line" data-loss/>
                            <circle class="lsn-loss-dot" r="3.5" data-loss-dot/>
                        </svg>
                    </figure>
                </div>
                <div class="lsn-lab-actions">
                    <button type="button" class="btn btn-primary btn-small" data-lab="step" data-fid="w2-step"><span aria-hidden="true">➕</span> ${t("lessons.w2.step")}</button>
                    <button type="button" class="btn btn-ghost btn-small" data-lab="auto" data-fid="w2-auto"></button>
                    <button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w2-reset"><span aria-hidden="true">↺</span> ${t("lessons.w2.reset")}</button>
                </div>
                <p class="lsn-lab-status" data-status></p>
                <p class="lsn-lab-small">${t("lessons.w2.fake")}</p>
            </div>`;

        const line = view.querySelector("[data-line]");
        const residuals = view.querySelector("[data-residuals]");
        const lossLine = view.querySelector("[data-loss]");
        const lossArea = view.querySelector("[data-loss-area]");
        const lossDot = view.querySelector("[data-loss-dot]");
        const autoButton = view.querySelector('[data-lab="auto"]');
        const status = view.querySelector("[data-status]");
        let frame = 0;
        let lastTime = 0;

        function update() {
            const model = function (hours) { return (state.a * (hours / 10) + state.b) * 100; };
            line.setAttribute("x1", sx(0));
            line.setAttribute("y1", sy(model(0)).toFixed(1));
            line.setAttribute("x2", sx(10));
            line.setAttribute("y2", sy(model(10)).toFixed(1));
            residuals.innerHTML = FIT_HOURS.map(function (hours, i) {
                return `<line x1="${sx(hours)}" x2="${sx(hours)}" y1="${sy(FIT_SCORES[i])}" y2="${sy(model(hours)).toFixed(1)}"/>`;
            }).join("");

            const error = state.history[state.history.length - 1];
            view.querySelector('[data-stat="step"]').textContent = t("lessons.w2.steps", { n: state.step });
            view.querySelector('[data-stat="error"]').textContent = t("lessons.w2.error", { e: A.format.number(error, 1) });
            view.querySelector('[data-stat="predict"]').textContent = A.plural("lessons.w2.predict", Math.round(model(10)));

            // The error curve
            const maxSteps = Math.max(FIT_CHART_STEPS, state.history.length - 1);
            const lx = function (i) { return lossLeft + (i / maxSteps) * (lossRight - lossLeft); };
            const ly = function (value) { return lossBottom - (Math.min(value, lossMax) / lossMax) * (lossBottom - lossTop); };
            const coords = state.history.map(function (value, i) { return lx(i).toFixed(1) + "," + ly(value).toFixed(1); });
            lossLine.setAttribute("points", coords.join(" "));
            lossArea.setAttribute("d", "M" + lx(0) + "," + lossBottom + " L" + coords.join(" L") + " L" + lx(state.history.length - 1).toFixed(1) + "," + lossBottom + " Z");
            lossDot.setAttribute("cx", lx(state.history.length - 1).toFixed(1));
            lossDot.setAttribute("cy", ly(error).toFixed(1));

            autoButton.innerHTML = state.running
                ? '<span aria-hidden="true">⏸</span> ' + esc(t("lessons.w2.pause"))
                : '<span aria-hidden="true">▶</span> ' + esc(t("lessons.w2.auto"));
            status.textContent = t(state.done ? "lessons.w2.done" : state.step === 0 ? "lessons.w2.start" : "lessons.w2.learning");
            status.classList.toggle("is-done", state.done);
        }

        function stepOnce() {
            fitStep(state);
            if (state.done && state.running) {
                state.running = false;
                A.announce(t("lessons.w2.done"), { region: shell.live });
            }
            update();
        }

        function loop(now) {
            if (!state.running) return;
            if (now - lastTime >= FIT_STEP_TIME) {
                lastTime = now;
                stepOnce();
            }
            if (state.running) frame = requestAnimationFrame(loop);
        }

        function setRunning(on) {
            cancelAnimationFrame(frame);
            if (on && state.done) Object.assign(state, freshFit());   // learned already: start again
            state.running = on;
            if (on) frame = requestAnimationFrame(loop);
            update();
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-lab]");
            if (!button) return;
            const action = button.getAttribute("data-lab");
            if (action === "step") {
                if (state.running) setRunning(false);
                stepOnce();
                A.announce(t("lessons.w2.steps", { n: state.step }) + ". " +
                    t("lessons.w2.error", { e: A.format.number(state.history[state.history.length - 1], 1) }) +
                    (state.done ? " " + t("lessons.w2.done") : ""), { region: shell.live });
            } else if (action === "auto") {
                setRunning(!state.running);
            } else if (action === "reset") {
                cancelAnimationFrame(frame);
                Object.assign(state, freshFit());
                update();
            }
        };

        update();
        if (state.running) frame = requestAnimationFrame(loop);
        return function () { cancelAnimationFrame(frame); };
    }

    // ---------- 12. Mini-lab 3: play with a neuron ----------
    // Starts on "Go to the park!" (z = 0.35), so the "Try this" hint can flip it
    const NEURON_START = { x1: 0.9, x2: 0.2, w1: 1.5, w2: 2.5, b: -1.5 };
    const NEURON_SLIDERS = [
        { key: "x1", min: 0, max: 1, step: 0.05, digits: 2, label: "lessons.w3.x1" },
        { key: "x2", min: 0, max: 1, step: 0.05, digits: 2, label: "lessons.w3.x2" },
        { key: "w1", min: -3, max: 3, step: 0.1, digits: 1, label: "lessons.w3.w1" },
        { key: "w2", min: -3, max: 3, step: 0.1, digits: 1, label: "lessons.w3.w2" },
        { key: "b", min: -3, max: 3, step: 0.1, digits: 1, label: "lessons.w3.b" }
    ];

    function mountNeuronLab(box, state) {
        const shell = labShell(box);
        const view = shell.view;

        function sliderHTML(slider) {
            const id = "lsn-neuron-" + slider.key;
            return `
                <div class="lsn-slider">
                    <label for="${id}">${t(slider.label)}</label>
                    <output for="${id}" class="mono" data-value="${slider.key}"></output>
                    <input class="lsn-range ui-range" type="range" id="${id}" data-key="${slider.key}" data-fid="w3-${slider.key}"
                           min="${slider.min}" max="${slider.max}" step="${slider.step}" value="${state[slider.key]}">
                </div>`;
        }

        view.innerHTML = `
            <div class="lsn-neuron">
                <svg class="lsn-neuron-svg" viewBox="0 0 360 196" role="img" aria-label="${esc(t("lessons.w3.diagram"))}">
                    <line class="lsn-edge" data-edge="1" x1="62" y1="50" x2="214" y2="98"/>
                    <line class="lsn-edge" data-edge="2" x1="62" y1="146" x2="214" y2="98"/>
                    <line class="lsn-edge-out" x1="246" y1="98" x2="290" y2="98"/>
                    <g class="lsn-edge-tag" transform="translate(132 64)">
                        <rect x="-23" y="-12" width="46" height="24" rx="8"/>
                        <text text-anchor="middle" y="4.5" data-tag="1"></text>
                    </g>
                    <g class="lsn-edge-tag" transform="translate(132 132)">
                        <rect x="-23" y="-12" width="46" height="24" rx="8"/>
                        <text text-anchor="middle" y="4.5" data-tag="2"></text>
                    </g>
                    <text class="lsn-svg-emoji" x="22" y="56" text-anchor="middle">☀️</text>
                    <text class="lsn-svg-emoji" x="22" y="152" text-anchor="middle">📚</text>
                    <circle class="lsn-in-node" cx="62" cy="50" r="22"/>
                    <circle class="lsn-in-node" cx="62" cy="146" r="22"/>
                    <text class="lsn-in-value" x="62" y="54.5" text-anchor="middle" data-in="1"></text>
                    <text class="lsn-in-value" x="62" y="150.5" text-anchor="middle" data-in="2"></text>
                    <circle class="lsn-neuron-glow" cx="226" cy="98" r="46"/>
                    <circle class="lsn-neuron-core" cx="226" cy="98" r="30"/>
                    <text class="lsn-neuron-sigma" x="226" y="94" text-anchor="middle">Σ</text>
                    <text class="lsn-neuron-z" x="226" y="113" text-anchor="middle" data-z></text>
                    <rect class="lsn-out-box" x="290" y="76" width="62" height="44" rx="12"/>
                    <text class="lsn-out-value" x="321" y="104" text-anchor="middle" data-out></text>
                </svg>
                <div class="lsn-neuron-controls">
                    <fieldset class="lsn-fieldset">
                        <legend class="mono">${t("lessons.w3.inputs")}</legend>
                        ${NEURON_SLIDERS.slice(0, 2).map(sliderHTML).join("")}
                    </fieldset>
                    <fieldset class="lsn-fieldset">
                        <legend class="mono">${t("lessons.w3.params")}</legend>
                        ${NEURON_SLIDERS.slice(2).map(sliderHTML).join("")}
                    </fieldset>
                </div>
                <div class="lsn-neuron-result">
                    <p class="lsn-formula mono" data-formula></p>
                    <div class="lsn-meter" aria-hidden="true"><span data-meter></span><i></i></div>
                    <div class="lsn-neuron-verdict">
                        <p class="lsn-verdict" data-verdict></p>
                        <button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w3-reset"><span aria-hidden="true">↺</span> ${t("lessons.w3.reset")}</button>
                    </div>
                </div>
                <p class="lsn-lab-hint"><span aria-hidden="true">💡</span> ${t("lessons.w3.try")}</p>
                <p class="lsn-lab-small">${t("lessons.w3.explain")}</p>
            </div>`;

        let lastAnswer = null;

        function update(shouldAnnounce) {
            const z = state.w1 * state.x1 + state.w2 * state.x2 + state.b;
            const output = 1 / (1 + Math.exp(-z));   // the sigmoid activation function

            [1, 2].forEach(function (i) {
                const weight = state["w" + i];
                const edge = view.querySelector('[data-edge="' + i + '"]');
                edge.style.strokeWidth = (1.5 + Math.abs(weight) * 2.2).toFixed(1);
                edge.style.opacity = (0.3 + Math.min(1, Math.abs(weight) / 3) * 0.7).toFixed(2);
                edge.classList.toggle("is-negative", weight < 0);
                view.querySelector('[data-tag="' + i + '"]').textContent = A.format.number(weight, 1);
                view.querySelector('[data-in="' + i + '"]').textContent = A.format.number(state["x" + i], 2);
            });
            view.querySelector("[data-z]").textContent = "z=" + A.format.number(z, 2);
            view.querySelector("[data-out]").textContent = A.format.percent(output);
            view.querySelector(".lsn-neuron-svg").style.setProperty("--lsn-out", output.toFixed(3));

            NEURON_SLIDERS.forEach(function (slider) {
                const text = A.format.number(state[slider.key], slider.digits);
                view.querySelector('[data-value="' + slider.key + '"]').textContent = text;
                view.querySelector('[data-key="' + slider.key + '"]').setAttribute("aria-valuetext", text);
            });

            const bias = state.b < 0 ? "− " + A.format.number(-state.b, 1) : "+ " + A.format.number(state.b, 1);
            view.querySelector("[data-formula]").textContent =
                "z = " + A.format.number(state.x1, 2) + " × " + A.format.number(state.w1, 1) +
                " + " + A.format.number(state.x2, 2) + " × " + A.format.number(state.w2, 1) +
                " " + bias + " = " + A.format.number(z, 2) + "   →   σ(z) = " + A.format.percent(output);
            view.querySelector("[data-meter]").style.width = (output * 100).toFixed(1) + "%";

            const isYes = output >= 0.5;
            const verdict = view.querySelector("[data-verdict]");
            verdict.textContent = t("lessons.w3.output") + ": " + t(isYes ? "lessons.w3.yes" : "lessons.w3.no");
            verdict.classList.toggle("is-yes", isYes);
            if (shouldAnnounce && lastAnswer !== null && lastAnswer !== isYes) {
                A.announce(t("lessons.w3.decision", { answer: t(isYes ? "lessons.w3.yes" : "lessons.w3.no") }), { region: shell.live });
            }
            lastAnswer = isYes;
        }

        box.oninput = function (event) {
            const key = event.target.getAttribute("data-key");
            if (!key) return;
            state[key] = parseFloat(event.target.value);
            update(true);
        };

        box.onclick = function (event) {
            if (!event.target.closest('[data-lab="reset"]')) return;
            Object.assign(state, NEURON_START);
            NEURON_SLIDERS.forEach(function (slider) {
                view.querySelector('[data-key="' + slider.key + '"]').value = state[slider.key];
            });
            update(true);
        };

        update(false);
        return null;
    }

    // ---------- 13. Mini-lab 4: be the language model ----------
    // How much the model "likes" each word (made-up scores called logits)
    const WORD_LOGITS = [2.2, 1.5, 1.2, 0.8, 0.4, -0.2];

    // Softmax with temperature: turns the scores into probabilities that add up to 1
    function wordProbabilities(temperature) {
        const scaled = WORD_LOGITS.map(function (logit) { return logit / temperature; });
        const highest = Math.max.apply(null, scaled);
        const exps = scaled.map(function (value) { return Math.exp(value - highest); });
        const sum = exps.reduce(function (total, value) { return total + value; }, 0);
        return exps.map(function (value) { return value / sum; });
    }

    function mountWordsLab(box, state) {
        const shell = labShell(box);
        const view = shell.view;
        const word = function (i) { return t("lessons.w4.word" + (i + 1)); };

        view.innerHTML = `
            <div class="lsn-words">
                <p class="lsn-sentence">
                    <span class="lsn-sentence-prompt">${t("lessons.w4.prompt")}</span>
                    <span class="lsn-blank" data-blank></span><span class="lsn-cursor" aria-hidden="true"></span>
                </p>
                <p class="lsn-lab-sub mono">${t("lessons.w4.probs")}</p>
                <ol class="lsn-bars">
                    ${WORD_LOGITS.map(function (logit, i) {
                        return `
                            <li class="lsn-bar" data-row="${i}">
                                <span class="lsn-bar-word">${word(i)}</span>
                                <span class="lsn-bar-track" aria-hidden="true"><span class="lsn-bar-fill"></span></span>
                                <span class="lsn-bar-value mono"></span>
                            </li>`;
                    }).join("")}
                </ol>
                <div class="lsn-slider lsn-temp">
                    <label for="lsn-temp">${t("lessons.w4.temp")}</label>
                    <output for="lsn-temp" class="mono" data-temp-value></output>
                    <input class="lsn-range ui-range" type="range" id="lsn-temp" data-fid="w4-temp" min="0.2" max="2" step="0.1" value="${state.temp}">
                    <div class="lsn-temp-scale" aria-hidden="true"><span>❄ ${t("lessons.w4.low")}</span><span>${t("lessons.w4.high")} 🔥</span></div>
                </div>
                <p class="lsn-temp-note" data-temp-note></p>
                <div class="lsn-lab-actions">
                    <button type="button" class="btn btn-primary btn-small" data-lab="generate" data-fid="w4-generate"><span aria-hidden="true">✨</span> ${t("lessons.w4.generate")}</button>
                    <button type="button" class="btn btn-ghost btn-small" data-lab="clear" data-fid="w4-clear"><span aria-hidden="true">↺</span> ${t("lessons.w4.clear")}</button>
                </div>
                <div class="lsn-history">
                    <p class="lsn-lab-sub mono">${t("lessons.w4.history")}</p>
                    <ol class="lsn-history-list" data-history></ol>
                </div>
                <p class="lsn-lab-small">${t("lessons.w4.note")}</p>
            </div>`;

        const blank = view.querySelector("[data-blank]");
        const rows = Array.prototype.slice.call(view.querySelectorAll(".lsn-bar"));

        function updateBars() {
            const probabilities = wordProbabilities(state.temp);
            rows.forEach(function (row, i) {
                row.querySelector(".lsn-bar-fill").style.width = (probabilities[i] * 100).toFixed(1) + "%";
                row.querySelector(".lsn-bar-value").textContent = A.format.percent(probabilities[i]);
                row.classList.toggle("is-picked", state.last === i);
            });
            const temperature = A.format.number(state.temp, 1);
            view.querySelector("[data-temp-value]").textContent = temperature;
            view.querySelector("#lsn-temp").setAttribute("aria-valuetext", temperature);
            let note = "lessons.w4.tempMid";
            if (state.temp < 0.6) note = "lessons.w4.tempLow";
            else if (state.temp > 1.3) note = "lessons.w4.tempHigh";
            view.querySelector("[data-temp-note]").textContent = t(note);
        }

        function updateSentence() {
            blank.textContent = state.last === null ? "…" : word(state.last);
            blank.classList.toggle("is-filled", state.last !== null);
            const list = view.querySelector("[data-history]");
            list.innerHTML = state.history.length
                ? state.history.map(function (i, index) {
                    return `<li class="lsn-history-chip${index === 0 ? " is-new" : ""}">${word(i)}</li>`;
                }).join("")
                : `<li class="lsn-history-empty">${t("lessons.w4.empty")}</li>`;
        }

        function generate() {
            const probabilities = wordProbabilities(state.temp);
            const picked = A.util.sampleWeighted(probabilities);
            state.last = picked;
            state.history.unshift(picked);
            state.history = state.history.slice(0, 10);
            updateBars();
            updateSentence();
            A.dom.replay(blank, "is-pop");   // the little "pop" on the new word
            A.announce(t("lessons.w4.picked", { word: word(picked), p: A.format.percent(probabilities[picked]) }), { region: shell.live });
        }

        box.oninput = function (event) {
            if (event.target.id !== "lsn-temp") return;
            state.temp = parseFloat(event.target.value);
            updateBars();
        };

        box.onclick = function (event) {
            const button = event.target.closest("[data-lab]");
            if (!button) return;
            if (button.getAttribute("data-lab") === "generate") {
                generate();
            } else {
                state.history = [];
                state.last = null;
                updateBars();
                updateSentence();
            }
        };

        updateBars();
        updateSentence();
        return null;
    }

    // ---------- 14. Mini-lab 5: spot the hidden AI ----------
    const DAY_MOMENTS = [
        { time: "07:00", icon: "📱" },
        { time: "08:10", icon: "🚌" },
        { time: "12:30", icon: "⌨️" },
        { time: "16:00", icon: "📧" },
        { time: "19:00", icon: "📸" },
        { time: "21:00", icon: "🎬" }
    ];

    function mountDayLab(box, state) {
        const shell = labShell(box);

        function draw() {
            const found = state.found.filter(Boolean).length;
            const items = DAY_MOMENTS.map(function (moment, i) {
                const isOpen = state.open[i];
                return `
                    <li class="lsn-moment${isOpen ? " is-open" : ""}${state.found[i] ? " is-found" : ""}">
                        <span class="lsn-moment-time mono" aria-hidden="true">${moment.time}</span>
                        <div class="lsn-moment-card">
                            <button type="button" class="lsn-moment-button" data-moment="${i}" data-fid="w5-${i}"
                                    aria-expanded="${isOpen}" aria-controls="lsn-moment-${i}">
                                <span class="lsn-moment-icon" aria-hidden="true">${moment.icon}</span>
                                <span class="lsn-moment-text"><span class="sr-only">${moment.time} — </span>${t("lessons.w5.m" + (i + 1))}</span>
                                <span class="lsn-moment-hint mono" aria-hidden="true">${isOpen ? "🤖" : t("lessons.w5.hint")}</span>
                            </button>
                            <p class="lsn-moment-ai" id="lsn-moment-${i}"${isOpen ? "" : " hidden"}>
                                <strong>${t("lessons.w5.aiLabel")}</strong> ${t("lessons.w5.a" + (i + 1))}
                            </p>
                        </div>
                    </li>`;
            }).join("");

            redraw(shell.view, `
                <ol class="lsn-day">${items}</ol>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-score">
                        <span class="lsn-progress-mini" aria-hidden="true"><span style="width: ${(found / DAY_MOMENTS.length) * 100}%"></span></span>
                        ${t("lessons.w5.found", { n: found, total: DAY_MOMENTS.length })}
                    </p>
                    ${found ? `<button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w5-reset">↺ ${t("lessons.w5.reset")}</button>` : ""}
                </div>
                ${found === DAY_MOMENTS.length ? `<p class="lsn-lab-win">${t("lessons.w5.all")}</p>` : ""}`);
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-moment]");
            if (button) {
                const i = Number(button.getAttribute("data-moment"));
                const wasFound = state.found.filter(Boolean).length;
                state.open[i] = !state.open[i];
                state.found[i] = true;
                draw();
                const found = state.found.filter(Boolean).length;
                if (found === DAY_MOMENTS.length && wasFound < found) A.announce(t("lessons.w5.all"), { region: shell.live });
                else if (wasFound < found) A.announce(t("lessons.w5.found", { n: found, total: DAY_MOMENTS.length }), { region: shell.live });
                return;
            }
            if (event.target.closest('[data-lab="reset"]')) {
                state.open = DAY_MOMENTS.map(function () { return false; });
                state.found = DAY_MOMENTS.map(function () { return false; });
                draw();
                const first = shell.view.querySelector("[data-moment]");
                if (first) first.focus({ preventScroll: true });
            }
        };

        draw();
        return null;
    }

    // ---------- 15. Mini-lab 6: what would you do? ----------
    const DILEMMA_BEST = [1, 1, 2];   // the most responsible option in each situation

    // "Three real-life situations...": the number of situations, as a word when
    // the texts have one ("lessons.w6.count.3"), otherwise in digits
    function dilemmaIntro() {
        const count = DILEMMA_BEST.length;
        const word = "lessons.w6.count." + count;
        return A.plural("lessons.w6.intro", count, A.has(word) ? { n: t(word) } : null);
    }

    function mountDilemmaLab(box, state) {
        const shell = labShell(box);

        function draw() {
            let good = 0;
            let answered = 0;
            const items = DILEMMA_BEST.map(function (best, s) {
                const key = "lessons.w6.s" + (s + 1);
                const chosen = state.choices[s];
                const hasChosen = chosen !== null;
                if (hasChosen) {
                    answered += 1;
                    if (chosen === best) good += 1;
                }
                const options = [0, 1, 2].map(function (o) {
                    let stateClass = "";
                    if (hasChosen) {
                        if (o === best) stateClass = " is-best";
                        else if (o === chosen) stateClass = " is-chosen";
                        else stateClass = " is-dim";
                    }
                    return `<button type="button" class="lsn-choice ui-option${stateClass}" data-s="${s}" data-o="${o}" data-fid="w6-${s}-${o}"
                                aria-pressed="${chosen === o}"${hasChosen ? ' aria-disabled="true"' : ""}>${t(key + "o" + (o + 1))}</button>`;
                }).join("");

                let feedback = "";
                if (hasChosen) {
                    const isBest = chosen === best;
                    feedback = `
                        <div class="lsn-dilemma-feedback ${isBest ? "is-good" : "is-bad"}">
                            <p><strong>${isBest ? "✓ " + t("lessons.w6.best") : "✗ " + t("lessons.w6.notBest")}</strong> ${t(key + "f" + (chosen + 1))}</p>
                            ${isBest ? "" : `<p><strong>${t("lessons.w6.better")}</strong> ${t(key + "o" + (best + 1))}. ${t(key + "f" + (best + 1))}</p>`}
                        </div>`;
                }
                return `
                    <li class="lsn-dilemma">
                        <p class="lsn-dilemma-tag mono">${t("lessons.w6.situation", { n: s + 1 })}</p>
                        <p class="lsn-dilemma-text" id="lsn-dilemma-${s}">${t(key)}</p>
                        <div class="lsn-dilemma-options" role="group" aria-labelledby="lsn-dilemma-${s}">${options}</div>
                        ${feedback}
                    </li>`;
            }).join("");

            redraw(shell.view, `
                <ol class="lsn-dilemmas">${items}</ol>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-score">${t("lessons.w6.score", { n: good, total: DILEMMA_BEST.length })}</p>
                    ${answered ? `<button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w6-reset">↺ ${t("lessons.w6.reset")}</button>` : ""}
                </div>`);
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-s]");
            if (button) {
                const s = Number(button.getAttribute("data-s"));
                if (state.choices[s] !== null) return;
                state.choices[s] = Number(button.getAttribute("data-o"));
                draw();
                const key = "lessons.w6.s" + (s + 1);
                const isBest = state.choices[s] === DILEMMA_BEST[s];
                A.announce(t(isBest ? "lessons.w6.best" : "lessons.w6.notBest") + " " + t(key + "f" + (state.choices[s] + 1)), { region: shell.live });
                return;
            }
            if (event.target.closest('[data-lab="reset"]')) {
                state.choices = DILEMMA_BEST.map(function () { return null; });
                draw();
                const first = shell.view.querySelector("[data-s]");
                if (first) first.focus({ preventScroll: true });
            }
        };

        draw();
        return null;
    }

    // The six mini-labs of this file, and how a fresh one starts.
    // intro: the text under the lab's title, for a lab whose text counts something
    // (the others simply use "lessons.w<lesson>.intro")
    const LAB_TYPES = {
        sort: { mount: mountSortLab, fresh: function () { return { answers: SORT_ANSWERS.map(function () { return null; }) }; } },
        fit: { mount: mountFitLab, fresh: freshFit },
        neuron: { mount: mountNeuronLab, fresh: function () { return Object.assign({}, NEURON_START); } },
        words: { mount: mountWordsLab, fresh: function () { return { temp: 1, history: [], last: null }; } },
        day: {
            mount: mountDayLab,
            fresh: function () {
                return { open: DAY_MOMENTS.map(function () { return false; }), found: DAY_MOMENTS.map(function () { return false; }) };
            }
        },
        dilemmas: {
            mount: mountDilemmaLab,
            intro: dilemmaIntro,
            fresh: function () { return { choices: DILEMMA_BEST.map(function () { return null; }) }; }
        }
    };

    // Shows the mini-lab of lesson n in box. Returns what stops it (or null).
    function mountLab(n, box) {
        const type = LAB_TYPES[LESSONS[n - 1].lab];
        if (!type) return mountFileLab(n, box);   // a mini-lab with its own file (section 16)
        if (!labState[n]) labState[n] = type.fresh();
        return type.mount(box, labState[n]);
    }

    // The text under the mini-lab's title in lesson n
    function labIntro(n) {
        const type = LAB_TYPES[LESSONS[n - 1].lab];
        return type && type.intro ? type.intro() : t("lessons.w" + n + ".intro");
    }

    // ---------- 16. Mini-labs in their own files (A.lessons.defineLab) ----------
    // The contract is in the header of this file. js/lessons/<name>.js calls
    // A.lessons.defineLab(name, { build, destroy, theme }) when it loads.
    const fileLabs = Object.create(null);   // name -> the lab, once its file has run
    let shownFileLab = null;                // { lab, host } while such a lab is on screen

    function defineLab(name, lab) {
        if (!/^[a-z0-9-]+$/.test(String(name)) || !lab || typeof lab.build !== "function") {
            throw new Error("A.lessons.defineLab(name, { build(host, api) }): the name uses a-z, 0-9 and -");
        }
        fileLabs[name] = lab;
    }

    // What a lab gets to work with (see "A MINI-LAB IN ITS OWN FILE" at the top)
    function labAPI(n, live) {
        if (!labState[n]) labState[n] = {};
        const prefix = "lessons.w" + n + ".";
        return {
            lesson: n,
            state: labState[n],
            text: function (key, values) { return t(prefix + key, values); },
            plural: function (key, count, values) { return A.plural(prefix + key, count, values); },
            get lang() { return A.lang; },
            motion: A.motion,
            announce: function (text) { A.announce(text, { region: live }); }
        };
    }

    // Shows a lab whose code is in js/lessons/<name>.js: at once if that file has
    // already run, otherwise after loading it (with a "loading" line, and a
    // "Try again" button if it can't be loaded, for example offline)
    function mountFileLab(n, box) {
        const name = LESSONS[n - 1].lab;
        const shell = labShell(box);
        let stopped = false;
        let shown = null;

        function setState(state) {
            box.setAttribute("data-lab-state", state);
            if (state === "loading") shell.view.setAttribute("aria-busy", "true");
            else shell.view.removeAttribute("aria-busy");
        }

        function showError() {
            setState("error");
            shell.view.innerHTML = `
                <div class="lsn-lab-error" role="alert">
                    <p><span aria-hidden="true">⚠️</span> ${t("lessons.lab.error")}</p>
                    <button type="button" class="btn btn-ghost btn-small" data-lab-retry data-fid="lab-retry"><span aria-hidden="true">↻</span> ${t("lessons.lab.retry")}</button>
                </div>`;
        }

        function build() {
            const lab = fileLabs[name];
            if (!lab) {
                showError();   // the file ran but didn't define this lab
                return;
            }
            shell.view.innerHTML = "";
            try {
                lab.build(shell.view, labAPI(n, shell.live));
            } catch (error) {
                console.error(error);
                showError();
                return;
            }
            shown = lab;
            shownFileLab = { lab: lab, host: shell.view };
            setState("ready");
        }

        function load() {
            setState("loading");
            shell.view.innerHTML = `
                <p class="lsn-lab-loading" role="status">
                    <span class="lsn-lab-spinner" aria-hidden="true"></span>
                    <span>${t("lessons.lab.loading")}</span>
                </p>`;
            Promise.all([A.loadScript(LAB_FOLDER + name + ".js"), A.loadStyle(LAB_STYLES)]).then(function () {
                if (!stopped) build();
            }, function () {
                if (!stopped) showError();
            });
        }

        // "Try again": the button is about to go away, so the focus waits on the lab's
        // title (screen readers hear the loading message, then the lab is there).
        // A tap doesn't always focus the button, so the title gets the focus either way.
        box.onclick = function (event) {
            if (!event.target.closest("[data-lab-retry]")) return;
            const title = parts.article.querySelector("#lsn-lab-title");
            if (title) title.focus({ preventScroll: true });
            load();
        };

        if (fileLabs[name]) build();
        else load();

        // Closing the reader, another lesson or a language change: the lab stops
        return function () {
            stopped = true;
            if (shown && typeof shown.destroy === "function") {
                try {
                    shown.destroy(shell.view);
                } catch (error) {
                    console.error(error);
                }
            }
            if (shownFileLab && shownFileLab.lab === shown) shownFileLab = null;
            shown = null;
        };
    }

    // ---------- 17. The lesson reader (a full-screen dialog) ----------
    // Its empty frame (about 50 elements) is built once, here at start-up: that costs
    // less than a millisecond. The lesson text, its mini-lab and the contents list
    // are built each time a lesson is shown.
    const reader = {
        open: false,
        lesson: 0,
        opener: null,
        closeTimer: 0,
        scrollRatio: 0,
        cleanupLab: null,
        previousHash: "",
        peek: ""            // data-fid of the glossary word whose meaning is shown ("" for none)
    };

    let textSize = A.storage.get("lessons.textSize", "m");
    if (TEXT_SIZES.indexOf(textSize) === -1) textSize = "m";

    const readerEl = document.createElement("div");
    readerEl.className = "lsn-reader";
    readerEl.hidden = true;
    readerEl.setAttribute("data-size", textSize);
    readerEl.innerHTML = `
        <div class="lsn-reader-backdrop" data-action="close"></div>
        <div class="lsn-reader-panel" role="dialog" aria-modal="true">
            <div class="lsn-reader-progress" aria-hidden="true"><span data-ref="progress"></span></div>
            <header class="lsn-reader-top">
                <div class="lsn-reader-where">
                    <span class="lsn-reader-pulse" aria-hidden="true"></span>
                    <p class="lsn-reader-crumb mono" data-ref="crumb"><span class="lsn-crumb-track" data-ref="crumbTrack"></span><span class="lsn-crumb-sep" aria-hidden="true"> · </span><span class="lsn-crumb-lesson" data-ref="crumbLesson"></span></p>
                    <p class="lsn-reader-keys mono" data-ref="keys"></p>
                </div>
                <div class="lsn-reader-tools">
                    <button type="button" class="lsn-tool lsn-tool-listen" data-action="listen" data-fid="listen">
                        <span class="lsn-wave" aria-hidden="true"><i></i><i></i><i></i></span>
                        <span data-ref="listenText"></span>
                    </button>
                    <button type="button" class="lsn-tool" data-action="size" data-fid="size">
                        <span aria-hidden="true">A<small>A</small></span>
                    </button>
                    <button type="button" class="lsn-tool lsn-tool-close" data-action="close" data-fid="close">
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
                    </button>
                </div>
            </header>
            <div class="lsn-reader-scroll" data-ref="scroll">
                <div class="lsn-reader-layout">
                    <nav class="lsn-toc" aria-labelledby="lsn-toc-title">
                        <p class="lsn-toc-title mono" id="lsn-toc-title" data-ref="tocTitle"></p>
                        <ol class="lsn-toc-list" data-ref="toc"></ol>
                    </nav>
                    <article class="lsn-article" data-ref="article"></article>
                </div>
            </div>
            <footer class="lsn-reader-foot">
                <button type="button" class="btn btn-ghost lsn-nav lsn-nav-prev" data-action="prev" data-fid="prev">
                    <span class="lsn-nav-arrow" aria-hidden="true">←</span>
                    <span class="lsn-nav-copy"><span class="lsn-nav-small mono"></span><span class="lsn-nav-title"></span></span>
                </button>
                <button type="button" class="btn btn-primary lsn-complete" data-action="complete" data-fid="complete">
                    <span data-ref="completeText"></span>
                </button>
                <button type="button" class="btn btn-ghost lsn-nav lsn-nav-next" data-action="next" data-fid="next">
                    <span class="lsn-nav-copy"><span class="lsn-nav-small mono"></span><span class="lsn-nav-title"></span></span>
                    <span class="lsn-nav-arrow" aria-hidden="true">→</span>
                </button>
            </footer>
            <p class="sr-only" aria-live="polite" data-ref="readerLive"></p>
            <span id="lsn-term-hint" data-ref="termHint" hidden></span>
        </div>`;
    document.body.appendChild(readerEl);

    const panel = readerEl.querySelector(".lsn-reader-panel");
    const parts = {
        backdrop: readerEl.querySelector(".lsn-reader-backdrop"),
        progress: ref(readerEl, "progress"),
        crumb: ref(readerEl, "crumb"),
        crumbTrack: ref(readerEl, "crumbTrack"),
        crumbLesson: ref(readerEl, "crumbLesson"),
        keys: ref(readerEl, "keys"),
        listen: readerEl.querySelector('[data-action="listen"]'),
        listenText: ref(readerEl, "listenText"),
        size: readerEl.querySelector('[data-action="size"]'),
        close: readerEl.querySelector(".lsn-tool-close"),
        scroll: ref(readerEl, "scroll"),
        tocTitle: ref(readerEl, "tocTitle"),
        toc: ref(readerEl, "toc"),
        article: ref(readerEl, "article"),
        prev: readerEl.querySelector('[data-action="prev"]'),
        next: readerEl.querySelector('[data-action="next"]'),
        complete: readerEl.querySelector('[data-action="complete"]'),
        completeText: ref(readerEl, "completeText"),
        live: ref(readerEl, "readerLive"),
        termHint: ref(readerEl, "termHint")
    };

    // On very narrow screens the "Listen" button shows only its sound bars. The word
    // is hidden with the shared .sr-only class, so screen readers still read it.
    A.onMedia(NARROW_SCREEN, function (narrow) {
        parts.listenText.classList.toggle("sr-only", narrow);
    });

    // The reader is a pop-up window of the page (see "overlays" in core.js). While it is
    // open, core stops the page from scrolling, makes the rest of the page unreachable
    // (inert), keeps Tab inside the panel and closes the reader with Esc, when the page
    // goes to another section and when a Ctrl+K command runs. We only report when the
    // reader opens and closes.
    const overlay = A.overlays.register(READER_ID, {
        root: readerEl,          // the panel and the backdrop around it
        element: panel,
        modal: true,
        closeOnNavigate: true,
        // Esc and a plain close give the focus back to the button that opened the reader.
        // After "navigate" or "command" the place you go to takes the focus.
        close: function (reason) {
            closeReader({ restoreFocus: reason === "escape" || reason === "close" });
        }
    });

    // The full text of one lesson
    function articleHTML(n) {
        const lesson = LESSONS[n - 1];
        let html = `
            <header class="lsn-article-head">
                <div class="lsn-article-icon" aria-hidden="true">${lesson.icon}</div>
                <div class="lsn-article-chips">
                    <span class="chip lsn-level lsn-level-${lesson.level}"><span class="lsn-dot" aria-hidden="true"></span>${t("lessons.level." + lesson.level)}</span>
                    <span class="chip"><span aria-hidden="true">⏱</span>${t("lessons.card.minutes", { n: lesson.minutes })}</span>
                    <span class="chip lsn-chip-done" data-ref="doneChip" hidden>✓ ${t("lessons.card.done")}</span>
                </div>
                <h2 class="lsn-article-title" id="lsn-reader-title" tabindex="-1" data-fid="title" data-speak>${lessonTitle(n)}</h2>
                <p class="lsn-article-lead" data-speak>${t(lessonKey(n, "desc"))}</p>
            </header>`;

        for (let i = 1; i <= lesson.sections; i++) {
            const note = lesson.notes[i];
            const noteIcon = { fact: "✨", example: "🔎", tip: "💡" }[note];
            html += `
                <section class="lsn-part" id="lsn-part-s${i}" data-part="s${i}">
                    <h3 class="lsn-part-title" tabindex="-1" data-fid="part-s${i}"><span class="lsn-part-num mono" aria-hidden="true">${pad(i)}</span><span data-speak>${t(lessonKey(n, "s" + i + ".h"))}</span></h3>
                    <p class="lsn-part-text" data-speak>${t(lessonKey(n, "s" + i + ".p"))}</p>
                    ${note ? `
                    <aside class="lsn-note lsn-note-${note}">
                        <p class="lsn-note-label mono"><span aria-hidden="true">${noteIcon}</span> ${t("lessons.note." + note)}</p>
                        <p data-speak>${t(lessonKey(n, "s" + i + ".note"))}</p>
                    </aside>` : ""}
                </section>`;
        }

        html += `
            <section class="lsn-part lsn-lab" id="lsn-part-lab" data-part="lab" aria-labelledby="lsn-lab-title">
                <div class="lsn-lab-head">
                    <p class="lsn-lab-label mono"><span class="lsn-lab-led" aria-hidden="true"></span>${t("lessons.reader.miniLab")}</p>
                    <h3 class="lsn-lab-title" id="lsn-lab-title" tabindex="-1" data-fid="part-lab">${t("lessons.w" + n + ".title")}</h3>
                    <p class="lsn-lab-intro">${labIntro(n)}</p>
                </div>
                <div class="lsn-lab-body" data-ref="lab"></div>
            </section>

            <section class="lsn-part lsn-keys" id="lsn-part-keys" data-part="keys">
                <h3 class="lsn-part-title" tabindex="-1" data-fid="part-keys"><span class="lsn-part-num mono" aria-hidden="true">✦</span><span data-speak>${t("lessons.reader.keyIdeas")}</span></h3>
                <ul class="lsn-keys-list">
                    ${[1, 2, 3].map(function (k) {
                        return `<li><span class="lsn-key-num mono" aria-hidden="true">${pad(k)}</span><span data-speak>${t(lessonKey(n, "key" + k))}</span></li>`;
                    }).join("")}
                </ul>
            </section>

            <aside class="lsn-try" aria-labelledby="lsn-try-label">
                <span class="lsn-try-icon" aria-hidden="true">${lesson.tryIcon}</span>
                <div class="lsn-try-body">
                    <p class="lsn-try-label mono" id="lsn-try-label">${t("lessons.reader.tryIt")}</p>
                    <p class="lsn-try-text">${t(lessonKey(n, "tip"))}</p>
                </div>
                <button type="button" class="btn btn-primary btn-small" data-action="try" data-fid="try">${t(lessonKey(n, "tipBtn"))} <span class="lsn-arrow" aria-hidden="true">→</span></button>
            </aside>

            <section class="lsn-part lsn-check" id="lsn-part-check" data-part="check" aria-labelledby="lsn-check-title">
                <h3 class="lsn-part-title" id="lsn-check-title" tabindex="-1" data-fid="part-check"><span class="lsn-part-num mono" aria-hidden="true">?</span><span>${t("lessons.reader.check")}</span></h3>
                <p class="lsn-check-question" id="lsn-check-question">${t(lessonKey(n, "q"))}</p>
                <div class="lsn-options" role="group" aria-labelledby="lsn-check-question" data-ref="options"></div>
                <div class="lsn-feedback" aria-live="polite" data-ref="feedback"></div>
            </section>`;
        return html;
    }

    // The "In this lesson" list on the left
    function tocHTML(n) {
        const lesson = LESSONS[n - 1];
        const items = [];
        for (let i = 1; i <= lesson.sections; i++) {
            items.push({ part: "s" + i, num: pad(i), text: t(lessonKey(n, "s" + i + ".h")) });
        }
        items.push({ part: "lab", num: "🧪", text: t("lessons.reader.miniLab") });
        items.push({ part: "keys", num: "✦", text: t("lessons.reader.keyIdeas") });
        items.push({ part: "check", num: "?", text: t("lessons.reader.check") });
        return items.map(function (item) {
            return `<li><button type="button" class="lsn-toc-link" data-goto="${item.part}" data-fid="toc-${item.part}">
                        <span class="lsn-toc-num mono" aria-hidden="true">${item.num}</span><span>${item.text}</span>
                    </button></li>`;
        }).join("");
    }

    // ----- "Check yourself" -----
    function renderCheck() {
        const n = reader.lesson;
        const lesson = LESSONS[n - 1];
        const options = ref(parts.article, "options");
        const feedback = ref(parts.article, "feedback");
        if (!options || !feedback) return;
        const chosen = checkAnswers[n];
        const answered = chosen !== undefined;
        const letters = t("lessons.check.letters").split("|");

        redraw(options, [0, 1, 2].map(function (i) {
            let stateClass = "";
            let mark = letters[i] || String(i + 1);
            if (answered) {
                if (i === lesson.correct) {
                    stateClass = " is-correct";
                    mark = "✓";
                } else if (i === chosen) {
                    stateClass = " is-wrong";
                    mark = "✗";
                } else {
                    stateClass = " is-dim";
                }
            }
            return `<button type="button" class="lsn-option ui-option${stateClass}" data-option="${i}" data-fid="option-${i}"
                        aria-pressed="${chosen === i}"${answered ? ' aria-disabled="true"' : ""}>
                        <span class="lsn-option-mark mono" aria-hidden="true">${mark}</span>
                        <span class="lsn-option-text">${t(lessonKey(n, "a" + (i + 1)))}</span>
                    </button>`;
        }).join(""));

        if (!answered) {
            feedback.innerHTML = "";
            return;
        }
        const isRight = chosen === lesson.correct;
        const rightAnswer = t(lessonKey(n, "a" + (lesson.correct + 1)));
        feedback.innerHTML = `
            <div class="lsn-feedback-box ${isRight ? "is-correct" : "is-wrong"}">
                <p class="lsn-feedback-title"><span aria-hidden="true">${isRight ? "🎉" : "🤔"}</span> ${t(isRight ? "lessons.check.correct" : "lessons.check.wrong")}</p>
                ${isRight ? "" : `<p>${t("lessons.check.rightAnswer", { answer: rightAnswer })}</p>`}
                <p>${t(lessonKey(n, "explain"))}</p>
                ${isRight && completed.has(n) ? `<p class="lsn-feedback-done">${t("lessons.check.autoDone")}</p>` : ""}
                ${isRight ? "" : `<button type="button" class="btn btn-ghost btn-small" data-action="retry" data-fid="retry">↺ ${t("lessons.check.retry")}</button>`}
            </div>`;
    }

    function answerCheck(choice) {
        const n = reader.lesson;
        if (checkAnswers[n] !== undefined) return;
        checkAnswers[n] = choice;
        A.track("lesson.check", { n: n, correct: choice === LESSONS[n - 1].correct });
        // A right answer completes the lesson automatically
        if (choice === LESSONS[n - 1].correct && !completed.has(n)) setCompleted(n, true);
        renderCheck();
    }

    function retryCheck() {
        delete checkAnswers[reader.lesson];
        renderCheck();
        const first = parts.article.querySelector("[data-option]");
        if (first) first.focus({ preventScroll: true });
    }

    // ----- Glossary words in the text -----
    // The texts mark glossary words as <strong data-term="id">. A word that the glossary
    // has becomes a button that shows its meaning just below the paragraph (with a way
    // to the glossary); a word it doesn't have yet stays bold text.
    function linkTerms(root) {
        if (!A.glossary) return;
        root.querySelectorAll("strong[data-term]").forEach(function (word, index) {
            const id = word.getAttribute("data-term");
            if (!A.glossary.term(id)) return;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "lsn-term";
            button.setAttribute("data-term", id);
            button.setAttribute("data-fid", "term-" + index);
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-describedby", "lsn-term-hint");
            button.innerHTML = word.innerHTML;
            word.replaceWith(button);
        });
    }

    // Shows the meaning of a glossary word under its paragraph (quiet: without telling screen readers)
    function openPeek(word, quiet) {
        const id = word.getAttribute("data-term");
        const term = A.glossary ? A.glossary.term(id) : null;
        if (!term) return;
        closePeek(false);
        reader.peek = word.getAttribute("data-fid");
        const peek = document.createElement("div");
        peek.className = "lsn-peek";
        peek.id = "lsn-peek";
        peek.innerHTML = `
            <p class="lsn-peek-label mono"><span aria-hidden="true">📖</span> ${esc(t("lessons.term.label"))}</p>
            <p class="lsn-peek-term">${esc(term.term)}</p>
            <p class="lsn-peek-text">${esc(term.definition)}</p>
            <div class="lsn-peek-actions">
                <button type="button" class="btn btn-ghost btn-small" data-action="glossary" data-term="${esc(id)}" data-fid="peek-open">
                    ${esc(t("lessons.term.open"))} <span aria-hidden="true">↗</span>
                </button>
                <button type="button" class="btn btn-ghost btn-small" data-action="peek-close" data-fid="peek-close" aria-label="${esc(t("lessons.term.closeLabel", { term: term.term }))}">
                    ${esc(t("lessons.term.close"))}
                </button>
            </div>`;
        (word.closest("p, li") || word).after(peek);
        word.setAttribute("aria-expanded", "true");
        word.setAttribute("aria-controls", "lsn-peek");
        if (!quiet) A.announce(term.term + ": " + term.definition, { region: parts.live });
    }

    // focusWord: give the focus back to the word (the peek's own button is going away)
    function closePeek(focusWord) {
        const peek = parts.article.querySelector(".lsn-peek");
        const word = reader.peek ? parts.article.querySelector('[data-fid="' + reader.peek + '"]') : null;
        reader.peek = "";
        if (peek) peek.remove();
        if (!word) return;
        word.setAttribute("aria-expanded", "false");
        word.removeAttribute("aria-controls");
        if (focusWord) word.focus({ preventScroll: true });
    }

    // ----- Building and updating the reader -----
    function stopLab(pause) {
        const lesson = LESSONS[reader.lesson - 1];
        if (pause && lesson && LAB_TYPES[lesson.lab] && labState[reader.lesson]) labState[reader.lesson].running = false;
        if (reader.cleanupLab) reader.cleanupLab();
        reader.cleanupLab = null;
    }

    function renderLessonContent() {
        const n = reader.lesson;
        stopLab(false);
        panel.style.setProperty("--lsn-rgb", "var(" + LESSONS[n - 1].rgb + ")");
        parts.article.innerHTML = articleHTML(n);
        linkTerms(parts.article);
        // The window is named by the lesson's title. That title only exists from the
        // first lesson on, so the name is linked here and not in the HTML above.
        A.dom.setAttr(panel, "aria-labelledby", "lsn-reader-title");
        parts.toc.innerHTML = tocHTML(n);
        reader.cleanupLab = mountLab(n, ref(parts.article, "lab"));
        renderCheck();
    }

    // Previous / next buttons. After the last lesson, "next" becomes "Finish". When the
    // other lesson is in another track, the button names that track ("Next · Deep dive").
    function setNavButton(button, target, kind) {
        const exists = target >= 1 && target <= TOTAL;
        const isFinish = kind === "next" && !exists;
        const otherTrack = exists && trackOf(target) !== trackOf(reader.lesson);
        const track = exists ? trackTitle(trackOf(target)) : "";
        button.setAttribute("aria-disabled", String(!exists && !isFinish));
        button.classList.toggle("is-finish", isFinish);
        button.classList.toggle("is-new-track", otherTrack);
        let small = t("lessons.reader." + kind);
        if (isFinish) small = t("lessons.reader.finish");
        else if (otherTrack) small = t("lessons.reader." + kind + "Track", { track: track });
        button.querySelector(".lsn-nav-small").textContent = small;
        button.querySelector(".lsn-nav-title").textContent = exists ? lessonTitle(target) : isFinish ? t("lessons.reader.finishTitle") : "";
        if (otherTrack) button.setAttribute("aria-label", t("lessons.reader." + kind + "TrackLabel", { track: track, title: lessonTitle(target) }));
        else if (exists) button.setAttribute("aria-label", t("lessons.reader." + kind + "Label", { title: lessonTitle(target) }));
        else button.setAttribute("aria-label", t(isFinish ? "lessons.reader.finishLabel" : "lessons.reader.firstLesson"));
    }

    // Everything around the text: top bar, buttons, labels
    function updateReaderChrome() {
        const n = reader.lesson;
        if (!n) return;
        const isDone = completed.has(n);

        // "Deep dive · Lesson 08 / 09": the track, then the lesson's place among all lessons
        parts.crumbTrack.textContent = trackTitle(trackOf(n));
        parts.crumbLesson.textContent = t("lessons.reader.crumb", { n: pad(n), total: pad(TOTAL) });
        parts.keys.textContent = t("lessons.reader.keys");
        parts.termHint.textContent = t("lessons.term.hint");
        parts.tocTitle.textContent = t("lessons.reader.toc");
        parts.close.setAttribute("aria-label", t("lessons.reader.close"));
        parts.close.title = t("lessons.reader.close");

        parts.listen.hidden = !canSpeak;
        parts.listen.classList.toggle("is-on", speech.active);
        parts.listen.title = t("lessons.reader.listenLabel");
        parts.listenText.textContent = t(speech.active ? "lessons.reader.stop" : "lessons.reader.listen");

        const sizeLabel = t("lessons.reader.textSize", { size: t("lessons.reader.size." + textSize) });
        parts.size.setAttribute("aria-label", sizeLabel);
        parts.size.title = sizeLabel;

        setNavButton(parts.prev, n - 1, "prev");
        setNavButton(parts.next, n + 1, "next");

        // When the lesson is done, the button says so and shows a visible "Undo",
        // so nobody un-completes a lesson by accident without knowing it
        parts.complete.classList.toggle("is-done", isDone);
        if (isDone) {
            parts.completeText.innerHTML = '<span aria-hidden="true">✓</span> ' + esc(t("lessons.reader.completed")) +
                '<span class="lsn-complete-undo"><span aria-hidden="true">↩</span> ' + esc(t("lessons.reader.undo")) + "</span>";
            parts.complete.setAttribute("aria-label", t("lessons.reader.undoLabel"));
        } else {
            parts.completeText.textContent = t("lessons.reader.complete");
            parts.complete.removeAttribute("aria-label");
        }
        const chip = ref(parts.article, "doneChip");
        if (chip) chip.hidden = !isDone;
    }

    // Reading progress bar + highlight of the current part in the list ("scroll spy").
    // After a click in the list, the clicked part is the current one until that scroll
    // has ended: a short part near the end can't reach the top, so the spy alone
    // would pick the part below it.
    let scrollFrame = 0;
    const spy = { held: false, hold: 0, timer: 0, target: 0 };

    function markCurrentPart(name) {
        parts.toc.querySelectorAll("[data-goto]").forEach(function (link) {
            if (link.getAttribute("data-goto") === name) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
    }

    function onReaderScroll() {
        const box = parts.scroll;
        const max = box.scrollHeight - box.clientHeight;
        const ratio = max > 0 ? Math.min(1, box.scrollTop / max) : 1;
        reader.scrollRatio = ratio;
        parts.progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
        if (spy.held) return;

        // The current part is the last one whose top is above the spy line
        const limit = box.getBoundingClientRect().top + box.clientHeight * SPY_LINE;
        const sections = parts.article.querySelectorAll("[data-part]");
        let active = sections.length ? sections[0].getAttribute("data-part") : "";
        sections.forEach(function (section) {
            if (section.getBoundingClientRect().top <= limit) active = section.getAttribute("data-part");
        });
        if (ratio > SPY_BOTTOM && sections.length) active = sections[sections.length - 1].getAttribute("data-part");
        markCurrentPart(active);
    }

    // The hold ends when the scroll ends ("scrollend"; browsers without it: when the
    // scroll events stop), or as soon as you scroll yourself with the wheel or a finger.
    // If the reader is somewhere else by then, the spy takes over again at once.
    const HAS_SCROLLEND = "onscrollend" in window;

    function holdSpy(target) {
        spy.held = true;
        spy.hold += 1;
        spy.target = target;
        waitForScrollEnd(HAS_SCROLLEND ? SCROLL_END_LIMIT : SCROLL_START_TIME);
    }

    // A safety net in case the end of the scroll is never reported
    function waitForScrollEnd(wait) {
        clearTimeout(spy.timer);
        spy.timer = setTimeout(endHold, wait);
    }

    // Lets go one frame later, so the frame that is already waiting for the last
    // scroll event still sees the hold
    function endHold() {
        if (!spy.held) return;
        const hold = spy.hold;
        clearTimeout(spy.timer);
        requestAnimationFrame(function () {
            if (!spy.held || spy.hold !== hold) return;   // a newer click holds it now
            spy.held = false;
            if (Math.abs(parts.scroll.scrollTop - spy.target) > 4) onReaderScroll();
        });
    }

    function releaseSpy() {
        clearTimeout(spy.timer);
        spy.held = false;
    }

    parts.scroll.addEventListener("scroll", function () {
        if (spy.held) waitForScrollEnd(HAS_SCROLLEND ? SCROLL_END_LIMIT : SCROLL_QUIET_TIME);
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(function () {
            scrollFrame = 0;
            onReaderScroll();
        });
    }, { passive: true });
    parts.scroll.addEventListener("scrollend", endHold);
    parts.scroll.addEventListener("wheel", endHold, { passive: true });
    parts.scroll.addEventListener("touchstart", endHold, { passive: true });

    // Scrolls the reader to a part ("s1", "lab", "keys", "check"...) and focuses its title.
    // options.instant: no smooth scrolling (a lesson that opens at a part).
    function goToPart(name, options) {
        const target = parts.article.querySelector('[data-part="' + name + '"]');
        if (!target) return;
        const box = parts.scroll;
        // While the window opens it is drawn a little smaller (a CSS scale): measure in its own size
        const scale = panel.offsetHeight ? panel.getBoundingClientRect().height / panel.offsetHeight : 1;
        const top = (target.getBoundingClientRect().top - box.getBoundingClientRect().top) / (scale || 1) + box.scrollTop - PART_TOP_GAP;
        const smooth = A.motion.ok() && !(options && options.instant);
        markCurrentPart(name);
        holdSpy(A.util.clamp(top, 0, box.scrollHeight - box.clientHeight));
        box.scrollTo({ top: top, behavior: smooth ? "smooth" : "auto" });
        const heading = target.querySelector("[tabindex='-1']");
        if (heading) heading.focus({ preventScroll: true });
    }

    // Shows lesson n in the (already open) reader
    function showLesson(n) {
        stopSpeaking();
        stopLab(true);
        reader.lesson = n;
        reader.peek = "";
        unfoldTrackOf(n);
        A.track("lesson.open", { n: n });
        renderLessonContent();
        updateReaderChrome();
        releaseSpy();
        parts.scroll.scrollTop = 0;
        onReaderScroll();
        setHash("#lesson-" + n);
        if (A.motion.ok()) A.dom.replay(parts.article, "is-entering");   // the fade-in
        const title = parts.article.querySelector("#lsn-reader-title");
        if (title) title.focus({ preventScroll: true });
    }

    function goRelative(step) {
        const target = reader.lesson + step;
        if (target >= 1 && target <= TOTAL) showLesson(target);
    }

    function toggleComplete() {
        setCompleted(reader.lesson, !completed.has(reader.lesson));
        renderCheck();
    }

    function cycleTextSize() {
        textSize = TEXT_SIZES[(TEXT_SIZES.indexOf(textSize) + 1) % TEXT_SIZES.length];
        A.storage.set("lessons.textSize", textSize);
        readerEl.setAttribute("data-size", textSize);
        updateReaderChrome();
        onReaderScroll();
    }

    // Does the AI Lab have this experiment? (The lab hub lists them; the lab before
    // it had two: "classifier" and "predictor".)
    function labHas(id) {
        if (!A.lab) return false;
        if (typeof A.lab.list === "function") {
            return A.lab.list().some(function (item) { return item && item.id === id; });
        }
        return id === "classifier" || id === "predictor";
    }

    // "Try it on this site": close the reader and jump to the right place: a section,
    // or an AI Lab experiment (the lab itself while it doesn't have that experiment)
    function runTryIt() {
        const target = LESSONS[reader.lesson - 1].tryIt;
        const isSection = TRY_SECTIONS.indexOf(target) !== -1;
        const sectionId = isSection ? target : "lab";
        closeReader({ restoreFocus: false });
        requestAnimationFrame(function () {
            A.dom.focusHeading(sectionId);   // the focus waits there if the feature moves it nowhere
            if (!isSection && labHas(target)) A.lab.open(target);
            else if (sectionId === "quiz" && A.quiz) A.quiz.start();
            else A.navigate(sectionId);
        });
    }

    function setHash(hash) {
        try {
            history.replaceState(history.state, "", hash || window.location.pathname + window.location.search);
        } catch (error) {
            // Some browsers refuse this for a page opened from a file: the reader works without it
        }
    }

    function scrollCardIntoView(n) {
        const card = document.getElementById("lesson-card-" + n);
        if (!card) return;
        const box = card.getBoundingClientRect();
        const top = window.scrollY + box.top - Math.max(0, (window.innerHeight - box.height) / 2);
        window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }

    // While a lesson is open, pop-up messages sit just above the reader's bottom bar:
    // .lsn-reading (css/lessons.css) sets --toast-bottom. The class goes on the toast
    // stack itself, not on <body>: every element would inherit a variable set on
    // <body>, so the whole page would be restyled on every open and close.
    function setReading(on) {
        const toasts = document.getElementById("toast-stack");
        if (toasts) toasts.classList.toggle("lsn-reading", on);
    }

    // Can the keyboard focus go back to this element when the reader closes?
    function canTakeFocus(element) {
        return Boolean(element && element.isConnected && typeof element.focus === "function" &&
            element !== document.body && element !== document.documentElement &&
            !readerEl.contains(element) && !element.closest("[inert], [hidden]") &&
            element.getClientRects().length > 0);
    }

    // options.part: open the lesson at one of its parts ("s2", "lab", "keys", "check"...)
    function openLesson(number, opener, options) {
        const n = Number(number);
        if (!Number.isInteger(n) || n < 1 || n > TOTAL) return;
        const part = options && /^[a-z0-9]+$/.test(String(options.part)) ? String(options.part) : "";
        if (reader.open) {
            if (n !== reader.lesson) showLesson(n);
            if (part) goToPart(part, { instant: true });
            return;
        }
        // The lesson's card must be there to come back to (a folded track unfolds)
        unfoldTrackOf(n);
        clearTimeout(reader.closeTimer);
        reader.open = true;
        reader.opener = canTakeFocus(opener) ? opener : null;
        // Without a button to come back to, closing returns to the lesson's card
        if (!reader.opener) scrollCardIntoView(n);
        const hash = window.location.hash;
        reader.previousHash = /^#lesson-\d+$/.test(hash) ? "" : hash;

        setReading(true);
        readerEl.hidden = false;
        readerEl.classList.remove("is-closing");
        A.dom.replay(readerEl, "is-open");   // the opening animation starts from the beginning
        overlay.opened();            // before the focus moves into the reader
        showLesson(n);
        if (part) goToPart(part, { instant: true });
    }

    // options.restoreFocus = false: another part of the page takes the focus
    // options.keepHash = true: leave the address bar alone (the Back button changed it)
    function closeReader(options) {
        if (!reader.open) return;
        const settings = options || {};
        reader.open = false;
        stopSpeaking();
        stopLab(true);
        releaseSpy();
        readerEl.classList.remove("is-open");
        setReading(false);
        // Core gives the focus back as soon as the page can take it (see core.js)
        const opener = reader.opener;
        const lesson = reader.lesson;
        overlay.closed(settings.restoreFocus === false ? null : function () { giveFocusBack(opener, lesson); });
        if (!settings.keepHash) setHash(reader.previousHash);

        const finish = function () {
            readerEl.hidden = true;
            readerEl.classList.remove("is-closing");
        };
        if (!A.motion.ok()) {
            finish();
        } else {
            readerEl.classList.add("is-closing");
            reader.closeTimer = setTimeout(finish, READER_CLOSE_TIME);
        }
    }

    // Back to the button that opened the reader. If there is none, go to the
    // card of the lesson you were reading (scrolled into view, so the focus ring is visible).
    function giveFocusBack(opener, lesson) {
        if (canTakeFocus(opener)) {
            opener.focus({ preventScroll: true });
            return;
        }
        const card = mount.querySelector("#lesson-card-" + lesson + " [data-open]");
        if (card) {
            scrollCardIntoView(lesson);
            card.focus({ preventScroll: true });
        }
    }

    // ----- Clicks and keys inside the reader -----
    // A click on the backdrop around the panel closes the reader, but only when the
    // press also started there, and not as the second click of a double-click
    // (the first click may have opened the reader from a lesson card under it).
    let pressOnBackdrop = false;
    readerEl.addEventListener("pointerdown", function (event) {
        pressOnBackdrop = event.target === parts.backdrop;
    });

    readerEl.addEventListener("click", function (event) {
        const target = event.target.closest("[data-action], [data-option], [data-goto], .lsn-term");
        if (!target || !readerEl.contains(target)) return;
        if (target.getAttribute("aria-disabled") === "true") return;
        if (target === parts.backdrop && (!pressOnBackdrop || event.detail > 1)) return;

        if (target.classList.contains("lsn-term")) {
            if (target.getAttribute("aria-expanded") === "true") closePeek(false);
            else openPeek(target, false);
            return;
        }
        if (target.hasAttribute("data-option")) {
            answerCheck(Number(target.getAttribute("data-option")));
            return;
        }
        if (target.hasAttribute("data-goto")) {
            goToPart(target.getAttribute("data-goto"));
            return;
        }
        switch (target.getAttribute("data-action")) {
            case "close": closeReader(); break;
            case "prev": goRelative(-1); break;
            case "next":
                if (reader.lesson === TOTAL) closeReader();
                else goRelative(1);
                break;
            case "complete": toggleComplete(); break;
            case "listen":
                if (speech.active) stopSpeaking();
                else startSpeaking();
                break;
            case "size": cycleTextSize(); break;
            case "try": runTryIt(); break;
            case "retry": retryCheck(); break;
            case "peek-close": closePeek(true); break;
            case "glossary":
                // The glossary closes the reader and shows the word there
                if (A.glossary) A.glossary.show(target.getAttribute("data-term"), { focus: true });
                break;
        }
    });

    // ← and → go to the previous / next lesson. (Esc and Tab are handled by core.)
    document.addEventListener("keydown", function (event) {
        if (!reader.open || A.overlays.top() !== READER_ID) return;
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.defaultPrevented) return;   // a mini-lab moved around its own grid with them
        // Only when the focus is in the reader (or lost on the page body),
        // and never while typing or moving a slider
        const target = event.target;
        if (!readerEl.contains(target) && target !== document.body && target !== document.documentElement) return;
        if (A.dom.isTyping(target)) return;
        event.preventDefault();
        goRelative(event.key === "ArrowLeft" ? -1 : 1);
    });

    // ---------- 18. Reading aloud (the browser's built-in speech) ----------
    const canSpeak = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
    const speech = { active: false, session: 0, element: null, warnedAt: 0 };

    function markSpeaking(element) {
        if (speech.element) speech.element.classList.remove("is-speaking");
        speech.element = element;
        if (!element) return;
        element.classList.add("is-speaking");
        const box = parts.scroll.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        if (rect.top < box.top + SPEAK_MARGIN || rect.bottom > box.bottom - SPEAK_MARGIN) {
            element.scrollIntoView({ block: "center", behavior: A.motion.ok() ? "smooth" : "auto" });
        }
    }

    function stopSpeaking() {
        if (!canSpeak) return;
        const wasActive = speech.active;
        speech.active = false;
        speech.session += 1;
        if (wasActive) window.speechSynthesis.cancel();
        markSpeaking(null);
        if (reader.lesson) updateReaderChrome();
    }

    function startSpeaking() {
        if (!canSpeak) return;
        stopSpeaking();
        window.speechSynthesis.cancel();

        // Split the lesson into sentences: short pieces are read more reliably
        const chunks = [];
        parts.article.querySelectorAll("[data-speak]").forEach(function (element) {
            const text = element.textContent.replace(/\s+/g, " ").trim();
            (text.match(/[^.!?…]+[.!?…]*["»”)]*\s*/g) || [text]).forEach(function (sentence) {
                if (sentence.trim()) chunks.push({ element: element, text: sentence.trim() });
            });
        });

        const langCode = A.lang === "ru" ? "ru" : "en";
        const voice = window.speechSynthesis.getVoices().filter(function (item) {
            return item.lang && item.lang.toLowerCase().indexOf(langCode) === 0;
        })[0] || null;

        speech.active = true;
        speech.session += 1;
        const session = speech.session;
        let index = 0;
        let started = false;

        function next() {
            if (session !== speech.session) return;
            if (index >= chunks.length) {
                stopSpeaking();
                return;
            }
            const chunk = chunks[index];
            index += 1;
            markSpeaking(chunk.element);
            const utterance = new window.SpeechSynthesisUtterance(chunk.text);
            utterance.lang = langCode === "ru" ? "ru-RU" : "en-US";
            if (voice) utterance.voice = voice;
            utterance.onstart = function () { started = true; };
            utterance.onend = next;
            utterance.onerror = function (event) {
                if (session !== speech.session) return;
                if (event.error === "interrupted" || event.error === "canceled") return;
                stopSpeaking();
                // Only warn once every few seconds, even if the button is pressed again
                if (!started && Date.now() - speech.warnedAt > NO_VOICE_WARNING_GAP) {
                    speech.warnedAt = Date.now();
                    A.toast(t("lessons.reader.noSpeech"), "🔇");
                }
            };
            window.speechSynthesis.speak(utterance);
        }

        next();
        updateReaderChrome();
    }

    // ---------- 19. Language and theme changes ----------
    A.onLanguageChange(function () {
        updateHUD();
        updateTracks();
        updateCards();
        if (!cert.root.hidden) {
            updateCertificatePicker();
            drawCertificate();
        }
        if (!reader.open) return;

        // Re-draw the open lesson in the new language, keeping its place, answers, the
        // open glossary word and the focus (a mini-lab is built again with its state)
        const ratio = reader.scrollRatio;
        const active = document.activeElement;
        const focusWasInside = Boolean(active) && readerEl.contains(active);
        const fid = focusWasInside ? active.getAttribute("data-fid") : null;
        const peek = reader.peek;
        stopSpeaking();
        renderLessonContent();
        reader.peek = "";
        const word = peek ? parts.article.querySelector('[data-fid="' + peek + '"]') : null;
        if (word) openPeek(word, true);
        updateReaderChrome();
        const box = parts.scroll;
        box.scrollTop = ratio * (box.scrollHeight - box.clientHeight);
        onReaderScroll();
        if (focusWasInside && !active.isConnected) {
            const again = fid ? readerEl.querySelector('[data-fid="' + fid + '"]') : null;
            const target = again || parts.article.querySelector("#lsn-reader-title");
            if (target) target.focus({ preventScroll: true });
        }
    });

    A.onThemeChange(function () {
        scheduleCertificate();
        // A mini-lab with its own file may draw on a <canvas> with the theme's colours
        if (shownFileLab && typeof shownFileLab.lab.theme === "function") {
            try {
                shownFileLab.lab.theme(shownFileLab.host);
            } catch (error) {
                console.error(error);
            }
        }
    });

    // Fonts arrive a little later: redraw the certificate with them
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(scheduleCertificate);
    }

    // ---------- 20. Start ----------
    updateHUD();
    updateTracks();
    updateCards();

    // A link like index.html#lesson-3 opens that lesson (0: the address names no lesson)
    function lessonFromHash() {
        const match = /^#lesson-(\d+)$/.exec(window.location.hash);
        const n = match ? Number(match[1]) : 0;
        return n >= 1 && n <= TOTAL ? n : 0;
    }

    // The Back / Forward buttons change the hash: open the lesson, or close the reader
    window.addEventListener("hashchange", function () {
        const n = lessonFromHash();
        if (n) openLesson(n, document.activeElement);
        else if (reader.open) closeReader({ keepHash: true });
    });

    // Opened once every script has run, so the whole page (and every
    // command of the Ctrl+K palette) is ready behind the reader
    A.ready(function () {
        const n = lessonFromHash();
        if (n) openLesson(n);
    });

    // ---------- 21. Ctrl+K commands and the public API ----------
    // One command per lesson, plus "continue where I stopped"
    LESSONS.forEach(function (lesson) {
        A.registerCommand({
            id: "lesson-" + lesson.number,
            group: "lessons.cmdGroup",
            icon: lesson.icon,
            title: function () { return t("lessons.cmdOpen", { title: lessonTitle(lesson.number) }); },
            keywords: "lesson урок " + lesson.number + " " + lesson.keywords,
            // An open reader stays open and switches to this lesson
            keepOverlays: [READER_ID],
            // The palette gives the focus back before running a command, so the
            // focused element is where the reader returns to when it closes
            run: function () { openLesson(lesson.number, document.activeElement); }
        });
    });

    A.registerCommand({
        id: "lessons-continue",
        group: "lessons.cmdGroup",
        icon: "▶️",
        title: function () { return t("lessons.cmdContinue"); },
        keywords: "continue next lesson learning продолжить следующий урок обучение",
        keepOverlays: [READER_ID],
        run: function () { openLesson(nextLesson() || 1, document.activeElement); }
    });

    // Other features use AICompass.lessons (AICompass.openLesson and closeLesson are
    // older names). Closing the reader brings the focus back to "opener": the button
    // they used (by default, whatever has the focus).
    A.feature("lessons", {
        count: TOTAL,
        // [{ number, icon, track, level, minutes, experiment, title(), description() }] in order.
        // experiment: the AI Lab experiment of "Try it on this site" (null for a section)
        list: function () {
            return LESSONS.map(function (lesson) {
                return {
                    number: lesson.number,
                    icon: lesson.icon,
                    track: lesson.track,
                    level: lesson.level,
                    minutes: lesson.minutes,
                    experiment: TRY_SECTIONS.indexOf(lesson.tryIt) === -1 ? lesson.tryIt : null,
                    title: function () { return lessonTitle(lesson.number); },
                    description: function () { return t(lessonKey(lesson.number, "desc")); }
                };
            });
        },
        // [{ id, icon, lessons: [numbers], title(), description() }] in order
        tracks: function () {
            return TRACKS.map(function (track) {
                return {
                    id: track.id,
                    icon: track.icon,
                    lessons: TRACK_LESSONS[track.id].slice(),
                    title: function () { return trackTitle(track.id); },
                    description: function () { return t("lessons.track." + track.id + ".desc"); }
                };
            });
        },
        // The track of lesson n ("basics", "deep"; "" for no such lesson)
        trackOf: trackOf,
        // The certificates earned so far: some of "basics", "deep" and "all"
        certificates: earnedCertificates,
        title: function (number) {
            return number >= 1 && number <= TOTAL ? lessonTitle(number) : "";
        },
        // The numbers of the finished lessons, smallest first
        completed: function () {
            return Array.from(completed).sort(function (a, b) { return a - b; });
        },
        isCompleted: function (number) { return completed.has(number); },
        // The first lesson that is not finished yet (0 when all are)
        next: nextLesson,
        // open(3), open(3, button), open(3, button, { part: "s2" }): at a part of the
        // lesson ("s1"-"s4", "lab", "keys", "check"); an unknown part opens it at the top
        open: function (number, opener, options) {
            openLesson(number, opener || document.activeElement, options);
        },
        // Like Esc: the focus goes back to the opener (or to the lesson's card)
        close: function () { closeReader(); },
        isOpen: function () { return reader.open; },
        // For the mini-labs in js/lessons/ (see the top of this file)
        defineLab: defineLab
    });

    A.openLesson = A.lessons.open;
    A.closeLesson = A.lessons.close;
})();
