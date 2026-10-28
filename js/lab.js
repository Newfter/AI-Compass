/* =========================================================
   AI COMPASS — THE AI LAB
   Two real experiments, built from scratch (no libraries):
    1. "Teach the machine": a tiny neural network that learns,
       live in your browser, to tell two kinds of dots apart.
    2. "Next-word predictor": a tiny language model that counts
       which words follow which, just like a (very) mini chatbot.
   The lab sits far down the page, so its HTML is made only when
   it is needed (section 10).
   Sections of this file:
    1. Settings                        7. Next-word predictor: the maths
    2. Small helpers                   8. Next-word predictor: the panel
    3. The lab card and its two tabs   9. Tabs, canvas sizes, language, theme
    4. Neural network: the maths      10. Building the lab
    5. Neural network: drawing        11. Commands and AICompass.lab
    6. Neural network: controls, stats and the animation loop
   Other features use AICompass.lab.open("classifier" | "predictor")
   (see the last section).
   Every text (English and Russian) is in js/content/lab.js,
   and so are the sentences the predictor learns from.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="lab"]');
    const data = A && A.content.get("lab");      // the predictor's sentences (js/content/lab.js)
    if (!A || !mount || !data) return;

    const t = A.t;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
    const TABS = ["classifier", "predictor"];   // the lab's two tabs (also saved as "lab.tab")
    // One experiment per tab. The hero number shows it: data-count-name="labExperimentCount"
    A.setTextValue("labExperimentCount", TABS.length);

    // ----- Teach the machine (the neural network) -----
    // Learning rates you can choose (10 is too big on purpose: try it and watch the loss jump)
    const LR_OPTIONS = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10];
    // The settings until you change them (yours are saved as "lab.nn")
    const DEFAULT_SETTINGS = { lr: 0.03, optimizer: "adam", speed: "normal", hidden: 8, twoLayers: false };
    const MIN_NEURONS = 2;                // neurons in a hidden layer: from 2...
    const MAX_NEURONS = 16;               // ...to 16
    const SPEEDS = { slow: 20, normal: 120, fast: 480 };   // training epochs per second
    const MAX_POINTS = 400;               // dots on the board, at most
    const UNDO_STEPS = 60;                // how many steps Undo remembers
    const LEARNED_LOSS = 0.025;           // every dot right and the loss this small: "Learned it!", training pauses
    const STUCK_EPOCHS = 2500;            // after this many epochs with less than...
    const STUCK_ACCURACY = 0.95;          // ...95% of the dots right, a hint pops up
    const LOSS_HISTORY = 200;             // loss values the chart keeps (when full, it keeps every second one)

    // Drawing the board, the chart and the diagram
    const GRID = 50;                      // the board's colours are worked out on a 50 x 50 grid, then smoothly scaled up
    const MINI = 16;                      // each neuron's small map in the diagram is 16 x 16
    const FRAME_BUDGET = 10;              // ms per frame shared by learning and drawing, so the page stays smooth (learning gets at least half)
    const MAPS_EVERY = 33;                // ms: while training, the board's colours are worked out at most this often (30 times a second)
    const DIAGRAM_EVERY = 45;             // ms: while training, the diagram is drawn at most this often...
    const STATS_EVERY = 110;              // ms: ...and the numbers are written at most this often
    const ANNOUNCE_EVERY = 6000;          // ms: while training, screen readers hear the numbers this often

    // Mouse, touch and keyboard on the board (the board goes from -1 to 1 both ways)
    const PAINT_STEP = 0.07;              // hold and drag: a new dot every 0.07
    const TAP_MOVE = 10;                  // px: a finger that moves further than this is scrolling, not tapping
    const TOUCH_GUESS = 3000;             // ms: after a tap, the network's guess for that spot shows this long
    const CURSOR_STEP = 0.05;             // an arrow key moves the keyboard cursor this far...
    const CURSOR_JUMP = 0.2;              // ...and this far with Shift

    // ----- Next-word predictor (the language model) -----
    const DISCOUNT = 0.3;                 // how much of every count is set aside for words never seen there
    const CANDIDATES = 5;                 // rows of candidate words
    const CHOICES = 20;                   // the most likely words that take part in the draw (creativity, auto-write)
    const MATCH_LIMIT = 400;              // "finishing the word": at most this many words that start with your letters
    const MAX_TEXT = 400;                 // characters in the text box, at most
    const MAX_TOKENS = 40;                // the token view shows the last 40 words
    const MAX_TAUGHT = 50;                // sentences you can teach (in each language)
    const MAX_TEACH = 140;                // characters in a sentence you teach, at most
    const TEMPERATURE = { min: 0, max: 2, step: 0.1, start: 0.7 };   // the creativity slider (yours is saved as "lab.temperature")
    const AUTO_WORDS = 12;                // auto-write adds up to 12 words...
    const AUTO_STOP = MAX_TEXT - 40;      // ...and stops early when the text is this long
    const AUTO_PAUSE = { pick: 260, next: 160 };        // ms: the chosen word lights up, then the next word is chosen
    const AUTO_PAUSE_CALM = { pick: 200, next: 120 };   // the same with animations off (the words appear at once)
    const LETTER_MS = 30;                 // auto-write types a letter every 30 ms...
    const LETTER_RANDOM = 25;             // ...plus up to 25 ms at random, like a person
    const SR_PAUSE = 900;                 // ms: screen readers hear the top guess after this pause in typing

    // ----- When the lab works -----
    const ON_SCREEN = 0.05;               // the lab is "on screen" (training runs) when 5% of it shows
    const NEAR_MARGIN = "50% 0px";        // the canvases are kept up to date while the lab is within half a screen

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    // Shortcuts to elements inside the lab
    const $ = (selector) => mount.querySelector(selector);
    const $$ = (selector) => Array.prototype.slice.call(mount.querySelectorAll(selector));

    // The filled part of a slider: its CSS colours the line from the start up to --fill
    function updateRangeFill(range) {
        const min = Number(range.min);
        const max = Number(range.max);
        range.style.setProperty("--fill", (((Number(range.value) - min) / (max - min)) * 100).toFixed(1) + "%");
    }

    // A word in quotes, the way the language writes them: “word” or «слово»
    function quote(word) {
        return t("lab.q", { w: word });
    }

    // A random number with a bell-curve shape (for natural-looking clusters)
    function randomNormal() {
        let u = 0;
        while (u === 0) u = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
    }

    /* =========================================================
       3. THE LAB CARD AND ITS TWO TABS
       ========================================================= */
    // Small pictures for the buttons and the example chips
    const icons = {
        play: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
        pause: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>',
        step: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 5.5v13l9-6.5z" fill="currentColor"/><rect x="16" y="5.5" width="2.6" height="13" rx="1" fill="currentColor"/></svg>',
        reset: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.1-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4.5 3.5v4.5H9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        undo: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 7H4.5V2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 7a8 8 0 1 1-1 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
        trash: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        sparkle: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z" fill="currentColor"/><circle cx="19" cy="19" r="1.6" fill="currentColor"/></svg>',
        stop: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>',
        close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
        clusters: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="7" cy="8" r="2.2" class="lab-ic-a"/><circle cx="9.5" cy="5" r="1.6" class="lab-ic-a"/><circle cx="17" cy="16" r="2.2" class="lab-ic-b"/><circle cx="14.5" cy="19" r="1.6" class="lab-ic-b"/></svg>',
        circle: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" class="lab-ic-b-stroke" stroke-width="2.4" stroke-dasharray="3 2.6"/><circle cx="12" cy="12" r="3" class="lab-ic-a"/></svg>',
        xor: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2" class="lab-ic-a"/><rect x="13" y="13" width="8" height="8" rx="2" class="lab-ic-a"/><rect x="13" y="3" width="8" height="8" rx="2" class="lab-ic-b"/><rect x="3" y="13" width="8" height="8" rx="2" class="lab-ic-b"/></svg>',
        spiral: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 12c0-1.5 2-1.5 2 0s-1.6 3-3.5 3S7 13 7 11s2-5 5-5 6 2 6 6-3 7.5-7 7.5" fill="none" class="lab-ic-a-stroke" stroke-width="2.2" stroke-linecap="round"/></svg>'
    };

    // The whole card. It is made only when the lab is needed (build(), section 10),
    // and its empty data-i18n holders get their texts at that moment.
    // data-no-glare: the card is too big for the light that follows the mouse
    // along a card's border (js/effects.js, section 10)
    function labHTML() {
        return '<div class="lab card" data-reveal data-no-glare>' +
            '<span class="lab-corners" aria-hidden="true"></span>' +
            '<div class="lab-top">' +
                '<div class="lab-tabs" role="tablist" data-active="classifier" data-i18n-attr="aria-label:lab.tablistLabel">' +
                    '<span class="lab-tab-glow" aria-hidden="true"></span>' +
                    tabButton("classifier", "🧠", "lab.tabNN", "lab.tabNNSub") +
                    tabButton("predictor", "💬", "lab.tabLM", "lab.tabLMSub") +
                '</div>' +
                '<p class="lab-live mono"><span class="lab-live-dot" aria-hidden="true"></span><span data-i18n="lab.live"></span></p>' +
            '</div>' +
            '<div class="lab-panel" role="tabpanel" id="lab-panel-classifier" aria-labelledby="lab-tab-classifier" data-panel="classifier">' +
                classifierHTML() +
            '</div>' +
            '<div class="lab-panel" role="tabpanel" id="lab-panel-predictor" aria-labelledby="lab-tab-predictor" data-panel="predictor" hidden>' +
                predictorHTML() +
            '</div>' +
        '</div>';
    }

    function tabButton(name, icon, titleKey, subKey) {
        return '<button type="button" class="lab-tab" role="tab" id="lab-tab-' + name + '" aria-controls="lab-panel-' + name + '" data-tab="' + name + '">' +
            '<span class="lab-tab-icon" aria-hidden="true">' + icon + '</span>' +
            '<span class="lab-tab-text"><span class="lab-tab-title" data-i18n="' + titleKey + '"></span>' +
            '<span class="lab-tab-sub mono" data-i18n="' + subKey + '"></span></span>' +
        '</button>';
    }

    function classifierHTML() {
        // The visible text ("0.03" or "0,03") is written by updateLrLabels()
        const lrOptions = LR_OPTIONS.map((value) => '<option value="' + value + '"></option>').join("");

        const steps = [1, 2, 3, 4].map((n) =>
            '<li class="lab-step-card">' +
                '<span class="lab-step-num mono" aria-hidden="true">0' + n + '</span>' +
                '<h4 data-i18n="lab.explain' + n + 'Title"></h4>' +
                '<p data-i18n="lab.explain' + n + 'Text"></p>' +
            '</li>').join("");

        const tips = [1, 2, 3, 4].map((n) => '<li data-i18n="lab.tip' + n + '"></li>').join("");

        return '<div class="lab-nn">' +
            // ----- Left: the board -----
            '<div class="lab-nn-stage">' +
                '<div class="lab-toolbar">' +
                    '<div class="lab-classpick" role="group" data-i18n-attr="aria-label:lab.classGroup">' +
                        '<button type="button" class="lab-class lab-class-a" data-class="0" aria-pressed="true">' +
                            '<span class="lab-dot lab-dot-a" aria-hidden="true"></span><span data-i18n="lab.classA"></span>' +
                        '</button>' +
                        '<button type="button" class="lab-class lab-class-b" data-class="1" aria-pressed="false">' +
                            '<span class="lab-dot lab-dot-b" aria-hidden="true"></span><span data-i18n="lab.classB"></span>' +
                        '</button>' +
                    '</div>' +
                    '<div class="lab-edit">' +
                        '<button type="button" class="lab-tool" data-action="undo" data-i18n-attr="aria-label:lab.undoLabel,title:lab.undoLabel">' + icons.undo + '<span data-i18n="lab.undo"></span></button>' +
                        '<button type="button" class="lab-tool" data-action="clear" data-i18n-attr="aria-label:lab.clearLabel,title:lab.clearLabel">' + icons.trash + '<span data-i18n="lab.clear"></span></button>' +
                    '</div>' +
                '</div>' +
                '<div class="lab-board" tabindex="0" role="application" data-i18n-attr="aria-label:lab.boardLabel">' +
                    '<canvas class="lab-board-canvas" aria-hidden="true"></canvas>' +
                    '<span class="lab-board-corners" aria-hidden="true"></span>' +
                    '<span class="lab-scan" aria-hidden="true"></span>' +
                    '<div class="lab-board-empty" aria-hidden="true">' +
                        '<span class="lab-empty-icon">✦</span>' +
                        '<strong data-i18n="lab.emptyTitle"></strong>' +
                        '<span class="lab-hint-mouse" data-i18n="lab.emptyText"></span>' +
                        '<span class="lab-hint-touch" data-i18n="lab.emptyTextTouch"></span>' +
                    '</div>' +
                    '<div class="lab-readout mono" aria-hidden="true" hidden></div>' +
                '</div>' +
                '<div class="lab-presets" role="group" aria-labelledby="lab-presets-title">' +
                    '<span class="lab-mini-label mono" id="lab-presets-title" data-i18n="lab.presetsLabel"></span>' +
                    ["clusters", "circle", "xor", "spiral"].map((name) =>
                        '<button type="button" class="chip lab-preset" data-preset="' + name + '">' + icons[name] +
                        '<span data-i18n="lab.preset' + name.charAt(0).toUpperCase() + name.slice(1) + '"></span></button>').join("") +
                '</div>' +
                '<ul class="lab-legend">' +
                    '<li><span class="lab-dot lab-dot-a" aria-hidden="true"></span><span data-i18n="lab.classA"></span></li>' +
                    '<li><span class="lab-dot lab-dot-b" aria-hidden="true"></span><span data-i18n="lab.classB"></span></li>' +
                    '<li><span class="lab-legend-line" aria-hidden="true"></span><span data-i18n="lab.legendBoundary"></span></li>' +
                    '<li><span class="lab-legend-ring" aria-hidden="true"></span><span data-i18n="lab.legendWrong"></span></li>' +
                '</ul>' +
                '<p class="lab-hint"><span class="lab-hint-mouse" data-i18n="lab.hintMouse"></span><span class="lab-hint-touch" data-i18n="lab.hintTouch"></span></p>' +
            '</div>' +

            // ----- Right: buttons, stats, settings and the network diagram -----
            '<div class="lab-nn-side">' +
                '<div class="lab-run">' +
                    '<button type="button" class="btn btn-primary lab-train" data-action="train">' +
                        '<span class="lab-train-icon"></span><span class="lab-train-text"></span>' +
                    '</button>' +
                    '<button type="button" class="btn btn-ghost" data-action="step" data-i18n-attr="title:lab.stepLabel">' + icons.step + '<span data-i18n="lab.step"></span></button>' +
                    '<button type="button" class="btn btn-ghost" data-action="reset" data-i18n-attr="title:lab.resetLabel">' + icons.reset + '<span data-i18n="lab.reset"></span></button>' +
                '</div>' +

                '<div class="lab-box lab-statbox">' +
                    '<div class="lab-box-head">' +
                        '<span class="lab-mini-label mono" data-i18n="lab.statsTitle"></span>' +
                        '<span class="lab-status mono" data-status="ready"><span class="lab-status-dot" aria-hidden="true"></span><span class="lab-status-text"></span></span>' +
                    '</div>' +
                    '<dl class="lab-stats">' +
                        '<div class="lab-stat"><dt class="mono" data-i18n="lab.statEpoch"></dt><dd class="mono" data-stat="epoch">0</dd></div>' +
                        '<div class="lab-stat"><dt class="mono" data-i18n="lab.statLoss"></dt><dd class="mono" data-stat="loss">—</dd></div>' +
                        '<div class="lab-stat"><dt class="mono" data-i18n="lab.statAccuracy"></dt><dd class="mono" data-stat="acc">—</dd>' +
                            '<span class="lab-acc-bar" aria-hidden="true"><span data-stat="accbar"></span></span></div>' +
                        '<div class="lab-stat"><dt class="mono" data-i18n="lab.statPoints"></dt><dd class="mono" data-stat="points">0</dd>' +
                            '<span class="lab-stat-sub mono" data-stat="split"></span></div>' +
                    '</dl>' +
                    '<div class="lab-chart">' +
                        '<div class="lab-chart-head"><span class="lab-mini-label mono" data-i18n="lab.chartTitle"></span></div>' +
                        '<div class="lab-chart-wrap">' +
                            '<canvas class="lab-chart-canvas" role="img"></canvas>' +
                            '<span class="lab-chart-empty" data-i18n="lab.chartEmpty"></span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                '<div class="lab-box lab-settings">' +
                    '<div class="lab-box-head"><span class="lab-mini-label mono" data-i18n="lab.settings"></span></div>' +
                    '<div class="lab-fields">' +
                        '<div class="lab-field">' +
                            '<label for="lab-lr" data-i18n="lab.lr"></label>' +
                            '<span class="lab-select"><select id="lab-lr" aria-describedby="lab-lr-hint">' + lrOptions + '</select></span>' +
                            '<small id="lab-lr-hint" data-i18n="lab.lrHint"></small>' +
                        '</div>' +
                        '<div class="lab-field">' +
                            '<label for="lab-opt" data-i18n="lab.optimizer"></label>' +
                            '<span class="lab-select"><select id="lab-opt" aria-describedby="lab-opt-hint">' +
                                '<option value="adam" data-i18n="lab.optAdam"></option>' +
                                '<option value="sgd" data-i18n="lab.optSgd"></option>' +
                            '</select></span>' +
                            '<small id="lab-opt-hint" data-i18n="lab.optHint"></small>' +
                        '</div>' +
                        '<div class="lab-field lab-field-wide">' +
                            '<div class="lab-range-head">' +
                                '<label for="lab-neurons" data-i18n="lab.neurons"></label>' +
                                '<output class="lab-range-value mono" for="lab-neurons" data-out="neurons">' + DEFAULT_SETTINGS.hidden + '</output>' +
                            '</div>' +
                            '<input type="range" id="lab-neurons" class="lab-range" min="' + MIN_NEURONS + '" max="' + MAX_NEURONS + '" step="1" value="' + DEFAULT_SETTINGS.hidden + '" aria-describedby="lab-neurons-hint">' +
                            '<small id="lab-neurons-hint" data-i18n="lab.neuronsHint"></small>' +
                        '</div>' +
                        '<div class="lab-field lab-field-speed">' +
                            '<span class="lab-field-label" id="lab-speed-label" data-i18n="lab.speed"></span>' +
                            '<div class="lab-seg" role="group" aria-labelledby="lab-speed-label">' +
                                '<button type="button" data-speed="slow" aria-pressed="false" data-i18n="lab.speedSlow"></button>' +
                                '<button type="button" data-speed="normal" aria-pressed="true" data-i18n="lab.speedNormal"></button>' +
                                '<button type="button" data-speed="fast" aria-pressed="false" data-i18n="lab.speedFast"></button>' +
                            '</div>' +
                        '</div>' +
                        '<div class="lab-field lab-field-layer">' +
                            '<span class="lab-field-label" aria-hidden="true">&nbsp;</span>' +
                            '<button type="button" class="lab-switch" role="switch" aria-checked="false" aria-describedby="lab-layer-hint">' +
                                '<span class="lab-switch-track" aria-hidden="true"><span class="lab-switch-knob"></span></span>' +
                                '<span data-i18n="lab.layer2"></span>' +
                            '</button>' +
                            '<small id="lab-layer-hint" data-i18n="lab.layer2Hint"></small>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

            '</div>' +

            // ----- Full width: the live network diagram -----
            '<div class="lab-box lab-diagram">' +
                '<div class="lab-box-head">' +
                    '<span class="lab-mini-label mono" data-i18n="lab.diagramTitle"></span>' +
                    '<span class="lab-params mono" data-out="params"></span>' +
                '</div>' +
                '<div class="lab-diagram-body">' +
                    '<div class="lab-diagram-wrap"><canvas class="lab-diagram-canvas" role="img"></canvas></div>' +
                    '<div class="lab-diagram-info">' +
                        '<p><span data-i18n="lab.diagramHow"></span> ' +
                            '<span class="lab-hint-mouse" data-i18n="lab.diagramPointMouse"></span>' +
                            '<span class="lab-hint-touch" data-i18n="lab.diagramPointTouch"></span></p>' +
                        '<p class="lab-diagram-legend">' +
                            '<span><span class="lab-wline lab-wline-pos" aria-hidden="true"></span><span data-i18n="lab.legendPos"></span></span>' +
                            '<span><span class="lab-wline lab-wline-neg" aria-hidden="true"></span><span data-i18n="lab.legendNeg"></span></span>' +
                        '</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            // ----- Below: the explanation -----
            '<section class="lab-explain" aria-labelledby="lab-explain-nn">' +
                '<h3 class="lab-explain-title" id="lab-explain-nn"><span class="lab-explain-icon" aria-hidden="true">?</span><span data-i18n="lab.explainTitle"></span></h3>' +
                '<ol class="lab-steps">' + steps + '</ol>' +
                '<div class="lab-tips">' +
                    '<p class="lab-mini-label mono" data-i18n="lab.tipsTitle"></p>' +
                    '<ul>' + tips + '</ul>' +
                '</div>' +
                '<p class="lab-hood" data-i18n="lab.underHood"></p>' +
            '</section>' +
            '<p class="sr-only" aria-live="polite" data-live="nn"></p>' +
        '</div>';
    }

    function predictorHTML() {
        const starters = [1, 2, 3, 4, 5].map((n) =>
            '<button type="button" class="chip lab-starter" data-starter="' + n + '" data-i18n="lab.lmStarter' + n + '"></button>').join("");

        const candidates = Array.from({ length: CANDIDATES }, (item, i) =>
            '<li class="lab-cand-item" hidden>' +
                '<button type="button" class="lab-cand" data-index="' + i + '">' +
                    '<span class="lab-cand-fill" aria-hidden="true"></span>' +
                    '<span class="lab-cand-pick" aria-hidden="true"></span>' +
                    '<span class="lab-cand-rank mono" aria-hidden="true">' + (i + 1) + '</span>' +
                    '<span class="lab-cand-word"></span>' +
                    '<span class="lab-cand-pct mono"></span>' +
                '</button>' +
            '</li>').join("");

        const steps = [1, 2, 3].map((n) =>
            '<li class="lab-step-card">' +
                '<span class="lab-step-num mono" aria-hidden="true">0' + n + '</span>' +
                '<h4 data-i18n="lab.lmExplain' + n + 'Title"></h4>' +
                '<p data-i18n="lab.lmExplain' + n + 'Text"></p>' +
            '</li>').join("");

        const stats = ["sentences", "words", "pairs", "triples"].map((name) =>
            '<div class="lab-lm-stat"><strong class="mono gradient-text" data-lmstat="' + name + '">0</strong><span data-lmstat-label="' + name + '"></span></div>').join("");

        return '<div class="lab-lm">' +
            '<div class="lab-lm-main">' +
                '<label class="lab-lm-label" for="lab-lm-input" data-i18n="lab.lmPromptLabel"></label>' +
                '<div class="lab-lm-field">' +
                    '<textarea id="lab-lm-input" class="lab-lm-input" rows="3" maxlength="' + MAX_TEXT + '" spellcheck="false" autocomplete="off" autocapitalize="sentences" data-i18n-attr="placeholder:lab.lmPlaceholder"></textarea>' +
                    '<button type="button" class="lab-lm-clear" data-i18n-attr="aria-label:lab.lmClear,title:lab.lmClear">' + icons.close + '</button>' +
                '</div>' +
                '<div class="lab-starters" role="group" aria-labelledby="lab-starters-title">' +
                    '<span class="lab-mini-label mono" id="lab-starters-title" data-i18n="lab.lmStarters"></span>' +
                    starters +
                '</div>' +
                '<p class="lab-lm-notice" hidden><span data-i18n="lab.lmUnknown"></span></p>' +
                '<div class="lab-box lab-predict">' +
                    '<div class="lab-box-head">' +
                        '<span class="lab-mini-label mono" data-lm="mode"></span>' +
                    '</div>' +
                    '<p class="lab-lm-context" data-lm="context"></p>' +
                    '<ol class="lab-cands">' + candidates + '</ol>' +
                    '<p class="lab-cands-legend" data-i18n="lab.lmLegend"></p>' +
                '</div>' +
                '<div class="lab-lm-controls">' +
                    '<button type="button" class="btn btn-primary lab-auto" data-action="auto" aria-describedby="lab-auto-hint">' +
                        '<span class="lab-auto-icon"></span><span class="lab-auto-text"></span>' +
                    '</button>' +
                    '<span class="sr-only" id="lab-auto-hint"></span>' +
                    '<div class="lab-temp">' +
                        '<div class="lab-range-head">' +
                            '<label for="lab-temp" data-i18n="lab.lmTemp"></label>' +
                            '<output class="lab-range-value mono" for="lab-temp" data-out="temp"></output>' +
                        '</div>' +
                        '<input type="range" id="lab-temp" class="lab-range lab-range-temp" min="' + TEMPERATURE.min + '" max="' + TEMPERATURE.max + '" step="' + TEMPERATURE.step + '" value="' + TEMPERATURE.start + '">' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="lab-lm-side">' +
                '<section class="lab-box lab-tokens-box" aria-labelledby="lab-tokens-title">' +
                    '<div class="lab-box-head"><h3 class="lab-mini-label mono" id="lab-tokens-title" data-i18n="lab.lmTokensTitle"></h3></div>' +
                    '<div class="lab-tokens" data-lm="tokens"></div>' +
                    '<p class="lab-box-note" data-i18n="lab.lmTokensHint"></p>' +
                '</section>' +
                '<section class="lab-box" aria-labelledby="lab-knows-title">' +
                    '<div class="lab-box-head"><h3 class="lab-mini-label mono" id="lab-knows-title" data-i18n="lab.lmStatsTitle"></h3></div>' +
                    '<div class="lab-lm-stats">' + stats + '</div>' +
                '</section>' +
                '<section class="lab-box" aria-labelledby="lab-teach-title">' +
                    '<div class="lab-box-head"><h3 class="lab-mini-label mono" id="lab-teach-title" data-i18n="lab.lmTeachTitle"></h3></div>' +
                    '<form class="lab-teach" novalidate>' +
                        '<label class="sr-only" for="lab-teach-input" data-i18n="lab.lmTeachLabel"></label>' +
                        '<input type="text" id="lab-teach-input" class="lab-teach-input" maxlength="' + MAX_TEACH + '" autocomplete="off" aria-describedby="lab-teach-status" data-i18n-attr="placeholder:lab.lmTeachPlaceholder">' +
                        '<button type="submit" class="btn btn-ghost btn-small lab-teach-btn" data-i18n="lab.lmTeachButton"></button>' +
                    '</form>' +
                    '<p class="lab-teach-status" id="lab-teach-status" aria-live="polite"></p>' +
                    '<button type="button" class="lab-link-btn" data-action="forget" hidden data-i18n="lab.lmTeachForget"></button>' +
                '</section>' +
            '</div>' +

            '<section class="lab-explain" aria-labelledby="lab-explain-lm">' +
                '<h3 class="lab-explain-title" id="lab-explain-lm"><span class="lab-explain-icon" aria-hidden="true">?</span><span data-i18n="lab.lmExplainTitle"></span></h3>' +
                '<ol class="lab-steps lab-steps-3">' + steps + '</ol>' +
                '<div class="lab-real">' +
                    '<span class="lab-real-icon" aria-hidden="true">🤖</span>' +
                    '<div><h4 data-i18n="lab.lmRealTitle"></h4><p data-i18n="lab.lmRealText"></p></div>' +
                '</div>' +
            '</section>' +
            '<p class="sr-only" aria-live="polite" data-live="lm"></p>' +
        '</div>';
    }

    // The card, once it is built (findElements() finds it)
    let labCard = null;

    /* =========================================================
       4. NEURAL NETWORK: THE MATHS
       The network gets a spot (x, y) of the board and answers with the
       probability that the spot belongs to class B:
       2 inputs (x, y) -> hidden layer(s) -> 1 output.
       - A neuron multiplies each input by a weight, adds them up with
         its bias, and squashes the sum: with tanh (-1 to 1) in the hidden
         layers, with the sigmoid (0 to 1) at the output.
       - Forward pass: the inputs go through the layers, one after another.
       - The loss (binary cross-entropy) measures how wrong the answers are:
         a confident wrong answer costs a lot, a confident right one almost
         nothing.
       - Backpropagation goes backwards through the layers and works out
         how much each weight is to blame for the loss (its gradient).
       - The optimizer (Adam, or SGD with momentum) moves every weight a
         small step against its gradient. One pass over all the dots is
         one "epoch".
       ========================================================= */
    // ----- Your settings (saved as "lab.nn"; an old or broken value gets the defaults) -----
    const savedSettings = A.storage.get("lab.nn", {}) || {};

    const settings = {
        lr: LR_OPTIONS.indexOf(savedSettings.lr) >= 0 ? savedSettings.lr : DEFAULT_SETTINGS.lr,
        optimizer: savedSettings.optimizer === "sgd" ? "sgd" : DEFAULT_SETTINGS.optimizer,
        speed: SPEEDS[savedSettings.speed] ? savedSettings.speed : DEFAULT_SETTINGS.speed,
        hidden: A.util.clamp(Math.round(Number(savedSettings.hidden) || DEFAULT_SETTINGS.hidden), MIN_NEURONS, MAX_NEURONS),
        twoLayers: savedSettings.twoLayers === true
    };

    function saveSettings() {
        A.storage.set("lab.nn", settings);
    }

    // Builds a network with small random weights
    function createNetwork() {
        const sizes = settings.twoLayers ? [2, settings.hidden, settings.hidden, 1] : [2, settings.hidden, 1];
        const layers = [];
        for (let l = 1; l < sizes.length; l++) {
            const nIn = sizes[l - 1];
            const nOut = sizes[l];
            const count = nIn * nOut;
            const layer = {
                nIn: nIn,
                nOut: nOut,
                W: new Float64Array(count),        // weights: W[j * nIn + i] connects input i to neuron j
                b: new Float64Array(nOut),         // biases
                gW: new Float64Array(count),       // gradients (how to change each weight)
                gb: new Float64Array(nOut),
                mW: new Float64Array(count),       // optimizer memory
                vW: new Float64Array(count),
                mb: new Float64Array(nOut),
                vb: new Float64Array(nOut),
                a: new Float64Array(nOut),         // the neurons' outputs ("activations")
                d: new Float64Array(nOut)          // the neurons' share of the error
            };
            const scale = Math.sqrt(1 / nIn);
            for (let i = 0; i < count; i++) layer.W[i] = randomNormal() * scale;
            layers.push(layer);
        }
        return { sizes: sizes, layers: layers, t: 0 };
    }

    function countParams(net) {
        return net.layers.reduce((sum, layer) => sum + layer.W.length + layer.b.length, 0);
    }

    // Forward pass: send (x, y) through the network and get P(class B).
    // Each neuron j: z = bias + sum of (weight * input), then a = tanh(z) or sigmoid(z).
    const inputs = new Float64Array(2);

    function forward(net, x, y) {
        inputs[0] = x;
        inputs[1] = y;
        const layers = net.layers;
        const last = layers.length - 1;
        let previous = inputs;
        for (let l = 0; l <= last; l++) {
            const layer = layers[l];
            const W = layer.W;
            const nIn = layer.nIn;
            for (let j = 0; j < layer.nOut; j++) {
                let z = layer.b[j];
                const row = j * nIn;
                for (let i = 0; i < nIn; i++) z += W[row + i] * previous[i];
                layer.a[j] = l === last ? 1 / (1 + Math.exp(-z)) : Math.tanh(z);
            }
            previous = layer.a;
        }
        return layers[last].a[0];
    }

    // One epoch: look at every dot, measure the error (binary cross-entropy),
    // work out how each weight should change (backpropagation), then change it.
    // For one dot with answer y (0 or 1) and guess p: loss = -log(p) if y = 1, -log(1 - p) if y = 0.
    // The epoch's loss is the average over all dots; the gradients are summed here
    // and divided by the number of dots in applyGradients.
    function trainStep() {
        const net = nn.net;
        const points = nn.points;
        const layers = net.layers;
        const last = layers.length - 1;
        if (!points.length) return null;

        layers.forEach((layer) => {
            layer.gW.fill(0);
            layer.gb.fill(0);
        });

        let loss = 0;
        for (let k = 0; k < points.length; k++) {
            const point = points[k];
            const out = forward(net, point.x, point.y);
            const safe = A.util.clamp(out, 1e-7, 1 - 1e-7);
            loss -= point.label === 1 ? Math.log(safe) : Math.log(1 - safe);

            // With sigmoid + cross-entropy the output error is simply (guess - answer)
            layers[last].d[0] = out - point.label;

            // Go backwards through the layers. A weight's gradient is
            // (its neuron's share of the error) x (the input it multiplies);
            // a neuron's share is passed down to the layer below, through the
            // same weights, times the slope of tanh (1 - a²).
            for (let l = last; l >= 0; l--) {
                const layer = layers[l];
                const previous = l === 0 ? inputs : layers[l - 1].a;
                const nIn = layer.nIn;
                for (let j = 0; j < layer.nOut; j++) {
                    const delta = layer.d[j];
                    const row = j * nIn;
                    layer.gb[j] += delta;
                    for (let i = 0; i < nIn; i++) layer.gW[row + i] += delta * previous[i];
                }
                if (l > 0) {
                    const below = layers[l - 1];
                    for (let i = 0; i < nIn; i++) {
                        let sum = 0;
                        for (let j = 0; j < layer.nOut; j++) sum += layer.W[j * nIn + i] * layer.d[j];
                        below.d[i] = sum * (1 - below.a[i] * below.a[i]);   // tanh slope
                    }
                }
            }
        }

        applyGradients(net, points.length);
        nn.epoch++;
        loss /= points.length;

        // Safety net: if numbers ever explode, start again with fresh weights
        if (!isFinite(loss)) {
            nn.net = createNetwork();
            return null;
        }
        recordLoss(loss);
        return loss;
    }

    // The optimizer decides how far to move each weight
    function applyGradients(net, count) {
        const lr = settings.lr;
        net.t++;

        if (settings.optimizer === "adam") {
            // Adam: keeps a running average of the gradient and of its size
            const beta1 = 0.9;
            const beta2 = 0.999;
            const fix1 = 1 - Math.pow(beta1, net.t);
            const fix2 = 1 - Math.pow(beta2, net.t);
            const adam = (w, g, m, v) => {
                for (let i = 0; i < w.length; i++) {
                    const grad = g[i] / count;
                    m[i] = beta1 * m[i] + (1 - beta1) * grad;
                    v[i] = beta2 * v[i] + (1 - beta2) * grad * grad;
                    w[i] -= lr * (m[i] / fix1) / (Math.sqrt(v[i] / fix2) + 1e-8);
                }
            };
            net.layers.forEach((layer) => {
                adam(layer.W, layer.gW, layer.mW, layer.vW);
                adam(layer.b, layer.gb, layer.mb, layer.vb);
            });
        } else {
            // SGD with momentum: like a ball rolling downhill that keeps some speed
            const sgd = (w, g, velocity) => {
                for (let i = 0; i < w.length; i++) {
                    velocity[i] = 0.9 * velocity[i] - lr * (g[i] / count);
                    w[i] += velocity[i];
                }
            };
            net.layers.forEach((layer) => {
                sgd(layer.W, layer.gW, layer.mW);
                sgd(layer.b, layer.gb, layer.mb);
            });
        }
    }

    function resetOptimizer(net) {
        net.t = 0;
        net.layers.forEach((layer) => {
            layer.mW.fill(0);
            layer.vW.fill(0);
            layer.mb.fill(0);
            layer.vb.fill(0);
        });
    }

    // ----- Example datasets (coordinates go from -1 to 1) -----
    function makePreset(name) {
        const points = [];
        const edge = (value) => A.util.clamp(value, -0.96, 0.96);

        if (name === "clusters") {
            for (let i = 0; i < 60; i++) {
                points.push({ x: edge(-0.42 + randomNormal() * 0.17), y: edge(0.38 + randomNormal() * 0.17), label: 0 });
                points.push({ x: edge(0.42 + randomNormal() * 0.17), y: edge(-0.38 + randomNormal() * 0.17), label: 1 });
            }
        } else if (name === "circle") {
            for (let i = 0; i < 70; i++) {
                let angle = A.util.random(0, 2 * Math.PI);
                let radius = Math.sqrt(Math.random()) * 0.4;          // (the square root spreads the dots evenly over the disc)
                points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle), label: 0 });
                angle = A.util.random(0, 2 * Math.PI);
                radius = A.util.random(0.62, 0.92);
                points.push({ x: edge(radius * Math.cos(angle)), y: edge(radius * Math.sin(angle)), label: 1 });
            }
        } else if (name === "xor") {
            while (points.length < 140) {
                const x = A.util.random(-0.93, 0.93);
                const y = A.util.random(-0.93, 0.93);
                if (Math.abs(x) < 0.1 || Math.abs(y) < 0.1) continue;
                points.push({ x: x, y: y, label: x * y > 0 ? 0 : 1 });
            }
        } else {
            // Two spirals wound around each other
            const perArm = 80;
            for (let arm = 0; arm < 2; arm++) {
                for (let i = 0; i < perArm; i++) {
                    const step = i / perArm;
                    const radius = 0.08 + step * 0.84;
                    const angle = step * 3.2 * Math.PI + arm * Math.PI;
                    points.push({
                        x: edge(radius * Math.cos(angle) + randomNormal() * 0.025),
                        y: edge(radius * Math.sin(angle) + randomNormal() * 0.025),
                        label: arm
                    });
                }
            }
        }
        return points;
    }

    // ----- Everything the classifier remembers -----
    const nn = {
        points: [],
        undo: [],
        net: createNetwork(),
        training: false,
        learned: false,          // reached 100% (training pauses by itself)
        keepGoing: false,        // you pressed Train after that, so it won't pause by itself again
        epoch: 0,
        loss: null,
        acc: null,
        preds: new Float32Array(0),
        lossHistory: { values: [], stride: 1, counter: 0 },
        selected: 0,             // class of the next dot: 0 = A, 1 = B
        hover: null,             // mouse position on the board
        cursor: null,            // keyboard cursor on the board
        stroke: null,            // mouse "painting" in progress
        tap: null,               // touch tap in progress
        touchTimer: 0,           // hides the guess shown after a tap
        maxWarned: false,        // the "board is full" message was shown
        stepBudget: 0,
        lastTick: 0,
        drawCost: 0,             // how long drawing takes (ms, a smooth average)
        stuckHinted: false,
        lastStats: 0,
        lastAnnounce: 0,
        lastDiagram: 0,
        lastMaps: 0,
        autoStarted: false,
        // What must be worked out or drawn again at the next frame
        dirty: { net: true, maps: true, board: true, diagram: true, chart: true, stats: true }
    };

    // The board starts with the circle example: you can watch the line bend into a ring in a few seconds
    nn.points = makePreset("circle");

    // Keeps up to LOSS_HISTORY loss values; when full it keeps every second one
    function recordLoss(loss) {
        const history = nn.lossHistory;
        history.counter++;
        if (history.counter % history.stride !== 0) return;
        history.values.push(loss);
        if (history.values.length > LOSS_HISTORY) {
            history.values = history.values.filter((value, index) => index % 2 === 0);
            history.stride *= 2;
        }
        nn.dirty.chart = true;
    }

    function clearLossHistory() {
        nn.lossHistory = { values: [], stride: 1, counter: 0 };
        nn.dirty.chart = true;
    }

    /* =========================================================
       5. NEURAL NETWORK: DRAWING
       The board shows the network's answer for every spot (the colours),
       the line where it is 50 / 50, and the dots (with a red ring when the
       network gets one wrong). The diagram shows every neuron with a small
       map of what it reacts to, and the weights as lines.
       ========================================================= */
    // All canvas colours come from the CSS variables, so both themes work.
    // They are read just before drawing (null = not read yet, or the theme changed):
    // reading them right after a change would make the browser restyle the page at once.
    let colors = null;
    function readColors() {
        const light = A.theme === "light";
        colors = {
            a: A.colors.rgb("--accent-rgb"),
            b: A.colors.rgb("--accent-2-rgb"),
            base: A.colors.rgb("--surface-solid"),
            text: A.colors.rgb("--text"),
            // small labels on the diagram: the dim grey is too pale on white, so the light theme uses a darker one
            dim: A.colors.rgb(light ? "--text-muted" : "--text-dim"),
            danger: A.colors.rgb("--danger"),
            shine: A.colors.rgb("--on-accent"),     // the white of text on the accent colour
            mono: A.cssVar("--font-mono") || "monospace",
            light: light
        };
    }

    // The board's colours: the network's answer on a GRID x GRID grid, in a small canvas
    // that drawBoard() scales up smoothly. "segments" is the 50 / 50 line.
    const heat = {
        canvas: document.createElement("canvas"),
        probs: new Float32Array(GRID * GRID),
        segments: []
    };
    heat.canvas.width = GRID;
    heat.canvas.height = GRID;
    heat.ctx = heat.canvas.getContext("2d");
    heat.image = heat.ctx.createImageData(GRID, GRID);

    // All the neurons' small maps, side by side in one canvas (one column per neuron)
    const atlas = { canvas: document.createElement("canvas"), columns: 0 };
    atlas.ctx = atlas.canvas.getContext("2d");

    // The three canvases on the page (findElements() fills in their elements when the
    // lab is built). "ratio" is the pixel ratio their backing store was made for, and
    // ctx comes from A.canvas.fit (it draws in CSS pixels).
    const board = {
        el: null,
        canvas: null,
        readout: null,
        ctx: null,
        size: 0,
        ratio: 0,
        sprites: null
    };

    const chart = { wrap: null, canvas: null, ctx: null, w: 0, h: 0, ratio: 0 };

    const diagram = { wrap: null, canvas: null, ctx: null, w: 0, h: 0, ratio: 0 };

    // Colour for a value from -1 (class A, purple) to +1 (class B, cyan)
    function paint(data, index, value, strength) {
        const target = value < 0 ? colors.a : colors.b;
        const amount = Math.pow(Math.min(1, Math.abs(value)), 0.85) * strength;
        const base = colors.base;
        data[index] = base[0] + (target[0] - base[0]) * amount;
        data[index + 1] = base[1] + (target[1] - base[1]) * amount;
        data[index + 2] = base[2] + (target[2] - base[2]) * amount;
        data[index + 3] = 255;
    }

    // Asks the network about every spot of the board (the coloured background and the
    // 50 / 50 line), and makes every neuron's small map for the diagram.
    // This is the most expensive drawing work: while training it runs at most about
    // 30 times a second (see redraw), when paused it runs at once.
    function refreshMaps() {
        const net = nn.net;
        const data = heat.image.data;
        const strength = colors.light ? 0.5 : 0.62;

        // 1. Big heatmap
        for (let gy = 0; gy < GRID; gy++) {
            const y = 1 - ((gy + 0.5) / GRID) * 2;
            for (let gx = 0; gx < GRID; gx++) {
                const x = ((gx + 0.5) / GRID) * 2 - 1;
                let p = forward(net, x, y);
                if (!(p >= 0 && p <= 1)) p = 0.5;
                const cell = gy * GRID + gx;
                heat.probs[cell] = p;
                paint(data, cell * 4, p * 2 - 1, strength);
            }
        }
        heat.ctx.putImageData(heat.image, 0, 0);
        heat.segments = contour(heat.probs, GRID, 0.5);

        // 2. One mini-map per neuron (inputs, hidden neurons and the output)
        const columns = net.sizes.reduce((sum, n) => sum + n, 0);
        if (atlas.columns !== columns) {
            atlas.columns = columns;
            atlas.canvas.width = columns * MINI;
            atlas.canvas.height = MINI;
            atlas.image = atlas.ctx.createImageData(columns * MINI, MINI);
        }
        const mini = atlas.image.data;
        const rowWidth = columns * MINI;
        const last = net.layers.length - 1;
        const miniStrength = colors.light ? 1 : 0.85;
        for (let gy = 0; gy < MINI; gy++) {
            const y = 1 - ((gy + 0.5) / MINI) * 2;
            for (let gx = 0; gx < MINI; gx++) {
                const x = ((gx + 0.5) / MINI) * 2 - 1;
                forward(net, x, y);
                let column = 0;
                const put = (value) => {
                    paint(mini, (gy * rowWidth + column * MINI + gx) * 4, value, miniStrength);
                    column++;
                };
                put(x);
                put(y);
                for (let l = 0; l <= last; l++) {
                    const layer = net.layers[l];
                    for (let j = 0; j < layer.nOut; j++) put(l === last ? layer.a[j] * 2 - 1 : layer.a[j]);
                }
            }
        }
        atlas.ctx.putImageData(atlas.image, 0, 0);
    }

    // The network's guess for every dot, the loss and the accuracy
    // (cheap: one question per dot, so it runs whenever the network changes)
    function scoreDots() {
        const net = nn.net;
        const points = nn.points;
        if (nn.preds.length !== points.length) nn.preds = new Float32Array(points.length);
        let loss = 0;
        let correct = 0;
        for (let k = 0; k < points.length; k++) {
            const point = points[k];
            const p = forward(net, point.x, point.y);
            nn.preds[k] = p;
            const safe = A.util.clamp(p, 1e-7, 1 - 1e-7);
            loss -= point.label === 1 ? Math.log(safe) : Math.log(1 - safe);
            if ((p >= 0.5 ? 1 : 0) === point.label) correct++;
        }
        nn.loss = points.length ? loss / points.length : null;
        nn.acc = points.length ? correct / points.length : null;
    }

    // "Marching squares": finds the line where the probability is exactly 0.5
    function contour(values, size, level) {
        const segments = [];
        const lerp = (a, b) => (level - a) / (b - a);
        for (let j = 0; j < size - 1; j++) {
            for (let i = 0; i < size - 1; i++) {
                const tl = values[j * size + i];
                const tr = values[j * size + i + 1];
                const br = values[(j + 1) * size + i + 1];
                const bl = values[(j + 1) * size + i];
                let code = 0;
                if (tl > level) code |= 8;
                if (tr > level) code |= 4;
                if (br > level) code |= 2;
                if (bl > level) code |= 1;
                if (code === 0 || code === 15) continue;

                const top = [i + lerp(tl, tr), j];
                const right = [i + 1, j + lerp(tr, br)];
                const bottom = [i + lerp(bl, br), j + 1];
                const left = [i, j + lerp(tl, bl)];
                const centre = (tl + tr + br + bl) / 4 > level;
                const add = (p, q) => segments.push(p[0], p[1], q[0], q[1]);

                switch (code) {
                    case 1: case 14: add(left, bottom); break;
                    case 2: case 13: add(bottom, right); break;
                    case 3: case 12: add(left, right); break;
                    case 4: case 11: add(top, right); break;
                    case 6: case 9: add(top, bottom); break;
                    case 7: case 8: add(left, top); break;
                    case 5:
                        if (centre) { add(left, top); add(bottom, right); } else { add(top, right); add(left, bottom); }
                        break;
                    case 10:
                        if (centre) { add(top, right); add(left, bottom); } else { add(left, top); add(bottom, right); }
                        break;
                }
            }
        }
        return segments;
    }

    // Converts board coordinates (-1..1) to pixels and back
    function toPx(value, size) {
        return ((value + 1) / 2) * size;
    }

    function toPy(value, size) {
        return (1 - (value + 1) / 2) * size;
    }

    // Pre-drawn glowing dots: much faster than drawing a glow for every dot every frame
    function dotRadius() {
        return A.util.clamp(board.size * 0.0115, 3.6, 7);
    }

    function makeSprites() {
        const r = dotRadius();
        const ratio = board.ratio;
        const make = (color) => {
            const glow = colors.light ? r * 0.7 : r * 1.5;
            const half = r + glow + 2;
            // A sharp sprite on retina screens too (rounded up, so the whole glow fits)
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = Math.ceil(half * 2 * ratio);
            const g = canvas.getContext("2d");
            g.scale(ratio, ratio);
            const gradient = g.createRadialGradient(half, half, r * 0.6, half, half, half);
            gradient.addColorStop(0, A.colors.rgba(color, colors.light ? 0.35 : 0.55));
            gradient.addColorStop(1, A.colors.rgba(color, 0));
            g.fillStyle = gradient;
            g.fillRect(0, 0, half * 2, half * 2);
            g.beginPath();
            g.arc(half, half, r, 0, Math.PI * 2);
            g.fillStyle = A.colors.rgba(color, 1);
            g.fill();
            g.lineWidth = Math.max(1.2, r * 0.32);
            g.strokeStyle = A.colors.rgba(colors.base, 0.95);
            g.stroke();
            // a tiny highlight makes the dots look like glass beads
            g.beginPath();
            g.arc(half - r * 0.3, half - r * 0.32, r * 0.32, 0, Math.PI * 2);
            g.fillStyle = A.colors.rgba(colors.shine, 0.35);
            g.fill();
            return { canvas: canvas, half: half };
        };
        board.sprites = [make(colors.a), make(colors.b)];
    }

    function drawBoard() {
        const size = board.size;
        if (!size) return;
        if (!board.sprites) makeSprites();
        const ctx = board.ctx;
        ctx.clearRect(0, 0, size, size);

        // 1. The heatmap: what the network thinks about every spot
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(heat.canvas, 0, 0, size, size);

        // 2. A faint grid, like graph paper
        ctx.lineWidth = 1;
        for (let k = -0.75; k <= 0.76; k += 0.25) {
            const isAxis = Math.abs(k) < 0.01;
            ctx.strokeStyle = A.colors.rgba(colors.text, isAxis ? (colors.light ? 0.16 : 0.12) : (colors.light ? 0.07 : 0.05));
            const px = Math.round(toPx(k, size)) + 0.5;
            const py = Math.round(toPy(k, size)) + 0.5;
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, size);
            ctx.moveTo(0, py);
            ctx.lineTo(size, py);
            ctx.stroke();
        }

        // 3. The glowing decision boundary (where the network is 50 / 50)
        const segments = heat.segments;
        if (segments.length) {
            const scale = size / GRID;
            ctx.beginPath();
            for (let s = 0; s < segments.length; s += 4) {
                ctx.moveTo((segments[s] + 0.5) * scale, (segments[s + 1] + 0.5) * scale);
                ctx.lineTo((segments[s + 2] + 0.5) * scale, (segments[s + 3] + 0.5) * scale);
            }
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = A.colors.rgba(colors.text, colors.light ? 0.12 : 0.16);
            ctx.lineWidth = 7;
            ctx.stroke();
            ctx.strokeStyle = A.colors.rgba(colors.text, colors.light ? 0.75 : 0.9);
            ctx.lineWidth = 1.7;
            ctx.stroke();
        }

        // 4. The dots, with a red ring around the ones the network gets wrong
        const r = dotRadius();
        const points = nn.points;
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = A.colors.rgba(colors.danger, 0.95);
        ctx.setLineDash([2.5, 2.2]);
        ctx.beginPath();
        for (let k = 0; k < points.length; k++) {
            const point = points[k];
            const guess = nn.preds[k] >= 0.5 ? 1 : 0;
            if (k < nn.preds.length && guess !== point.label) {
                const x = toPx(point.x, size);
                const y = toPy(point.y, size);
                ctx.moveTo(x + r + 3.5, y);
                ctx.arc(x, y, r + 3.5, 0, Math.PI * 2);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        for (let k = 0; k < points.length; k++) {
            const point = points[k];
            const sprite = board.sprites[point.label];
            const half = sprite.half;
            ctx.drawImage(sprite.canvas, toPx(point.x, size) - half, toPy(point.y, size) - half, half * 2, half * 2);
        }

        // 5. Where the next dot would go (mouse or keyboard)
        const spot = nn.cursor || nn.hover;

        // When that spot moves, the network diagram shows it too
        const spotKey = spot ? spot.x.toFixed(3) + "," + spot.y.toFixed(3) : "";
        if (spotKey !== board.lastSpot) {
            board.lastSpot = spotKey;
            nn.dirty.diagram = true;
        }
        if (spot) {
            const x = toPx(spot.x, size);
            const y = toPy(spot.y, size);
            const sprite = board.sprites[spot.label];
            ctx.globalAlpha = 0.5;
            ctx.drawImage(sprite.canvas, x - sprite.half, y - sprite.half, sprite.half * 2, sprite.half * 2);
            ctx.globalAlpha = 1;

            ctx.strokeStyle = A.colors.rgba(colors.text, 0.7);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(x, y, r + 8, 0, Math.PI * 2);
            ctx.stroke();

            if (nn.cursor) {
                // keyboard: dashed guides across the board
                ctx.setLineDash([3, 5]);
                ctx.strokeStyle = A.colors.rgba(colors.text, 0.35);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, y - r - 10);
                ctx.moveTo(x, y + r + 10);
                ctx.lineTo(x, size);
                ctx.moveTo(0, y);
                ctx.lineTo(x - r - 10, y);
                ctx.moveTo(x + r + 10, y);
                ctx.lineTo(size, y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
        updateReadout();
    }

    // Small text in the corner of the board: position and the network's guess there
    function updateReadout() {
        const spot = nn.cursor || nn.hover;
        if (!spot) {
            board.readout.hidden = true;
            return;
        }
        const p = forward(nn.net, spot.x, spot.y);
        const isB = p >= 0.5;
        board.readout.hidden = false;
        board.readout.textContent = t("lab.readout", {
            x: A.format.number(spot.x, { digits: 2, minus: false }),   // "-0.50" with a plain "-", as it always was
            y: A.format.number(spot.y, { digits: 2, minus: false }),
            cls: isB ? "B" : "A",
            pct: A.format.number((isB ? p : 1 - p) * 100, 0)
        });
        board.readout.classList.toggle("is-b", isB);
    }

    // ----- The loss chart -----
    function drawChart() {
        if (!chart.w) return;
        const ctx = chart.ctx;
        const w = chart.w;
        const h = chart.h;
        const values = nn.lossHistory.values;
        ctx.clearRect(0, 0, w, h);

        // faint guide lines
        ctx.strokeStyle = A.colors.rgba(colors.text, colors.light ? 0.08 : 0.06);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 1; k < 4; k++) {
            const y = Math.round((h * k) / 4) + 0.5;
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();

        labCard.querySelector(".lab-chart-empty").hidden = values.length > 1;
        if (values.length < 2) return;

        let max = 0.1;
        for (let i = 0; i < values.length; i++) if (values[i] > max) max = values[i];
        const pad = 5;
        const xAt = (i) => (i / (values.length - 1)) * (w - 8) + 1;
        const yAt = (v) => h - pad - (Math.min(v, max) / max) * (h - pad * 2);

        // area under the line
        ctx.beginPath();
        ctx.moveTo(xAt(0), yAt(values[0]));
        for (let i = 1; i < values.length; i++) ctx.lineTo(xAt(i), yAt(values[i]));
        ctx.lineTo(xAt(values.length - 1), h);
        ctx.lineTo(xAt(0), h);
        ctx.closePath();
        const fill = ctx.createLinearGradient(0, 0, 0, h);
        fill.addColorStop(0, A.colors.rgba(colors.a, colors.light ? 0.22 : 0.32));
        fill.addColorStop(1, A.colors.rgba(colors.a, 0));
        ctx.fillStyle = fill;
        ctx.fill();

        // the line itself
        ctx.beginPath();
        ctx.moveTo(xAt(0), yAt(values[0]));
        for (let i = 1; i < values.length; i++) ctx.lineTo(xAt(i), yAt(values[i]));
        const stroke = ctx.createLinearGradient(0, 0, w, 0);
        stroke.addColorStop(0, A.colors.rgba(colors.a, 1));
        stroke.addColorStop(1, A.colors.rgba(colors.b, 1));
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.stroke();

        // a glowing dot at the newest value
        const lastX = xAt(values.length - 1);
        const lastY = yAt(values[values.length - 1]);
        ctx.fillStyle = A.colors.rgba(colors.b, 0.25);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = A.colors.rgba(colors.b, 1);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 2.8, 0, Math.PI * 2);
        ctx.fill();
    }

    // ----- The live network diagram -----
    function drawDiagram() {
        if (!diagram.w) return;
        const ctx = diagram.ctx;
        const w = diagram.w;
        const h = diagram.h;
        const net = nn.net;
        const sizes = net.sizes;
        const columns = sizes.length;
        ctx.clearRect(0, 0, w, h);

        // Where every neuron goes
        const top = 30;
        const bottom = 8;
        const maxNodes = Math.max.apply(null, sizes);
        const available = h - top - bottom;
        const slot = Math.min(available / maxNodes, 46);
        const node = A.util.clamp(slot * 0.74, 10, 30);
        const left = 26;
        const right = 40;
        const xs = sizes.map((n, c) => left + node / 2 + (c * (w - left - right - node)) / (columns - 1));
        const ys = sizes.map((n) => {
            const list = [];
            const start = top + (available - n * slot) / 2 + slot / 2;
            for (let k = 0; k < n; k++) list.push(start + k * slot);
            return list;
        });
        const outputSize = node * 1.3;

        // Connections: colour = sign of the weight, thickness = its size
        ctx.lineCap = "round";
        net.layers.forEach((layer, l) => {
            const x1 = xs[l] + node / 2;
            const x2 = xs[l + 1] - (l + 1 === columns - 1 ? outputSize : node) / 2;
            const mid = (x1 + x2) / 2;
            for (let j = 0; j < layer.nOut; j++) {
                for (let i = 0; i < layer.nIn; i++) {
                    const weight = layer.W[j * layer.nIn + i];
                    const strength = Math.min(1, Math.abs(weight) / 2.5);
                    ctx.strokeStyle = A.colors.rgba(weight >= 0 ? colors.b : colors.a, 0.12 + strength * 0.75);
                    ctx.lineWidth = 0.4 + strength * 4.2;
                    ctx.beginPath();
                    ctx.moveTo(x1, ys[l][i]);
                    ctx.bezierCurveTo(mid, ys[l][i], mid, ys[l + 1][j], x2, ys[l + 1][j]);
                    ctx.stroke();
                }
            }
        });

        // The spot you point at on the board (mouse or keyboard cursor).
        // Running the network on it fills every layer's "a" with that spot's activations.
        const spot = nn.cursor || nn.hover;
        const spotP = spot ? forward(net, spot.x, spot.y) : null;
        const ringGap = Math.max(1, Math.min(3, (slot - node) / 2 - 0.6));

        // Neurons, each showing its own mini-map of what it reacts to
        let atlasColumn = 0;
        sizes.forEach((n, c) => {
            const isOutput = c === columns - 1;
            const s = isOutput ? outputSize : node;
            for (let k = 0; k < n; k++) {
                const x = xs[c] - s / 2;
                const y = ys[c][k] - s / 2;
                ctx.save();
                A.canvas.roundRect(ctx, x, y, s, s, Math.min(6, s * 0.25));
                ctx.clip();
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(atlas.canvas, atlasColumn * MINI, 0, MINI, MINI, x, y, s, s);
                ctx.restore();
                A.canvas.roundRect(ctx, x, y, s, s, Math.min(6, s * 0.25));
                ctx.strokeStyle = A.colors.rgba(colors.text, isOutput ? 0.55 : 0.25);
                ctx.lineWidth = isOutput ? 1.5 : 1;
                ctx.stroke();

                if (spot) {
                    // A glowing ring: how strongly this neuron reacts to the spot (colour = sign)
                    let value;
                    if (c === 0) value = k === 0 ? spot.x : spot.y;
                    else value = isOutput ? net.layers[c - 1].a[k] * 2 - 1 : net.layers[c - 1].a[k];
                    A.canvas.roundRect(ctx, x - ringGap, y - ringGap, s + ringGap * 2, s + ringGap * 2, Math.min(8, s * 0.3));
                    ctx.strokeStyle = A.colors.rgba(value < 0 ? colors.a : colors.b, Math.min(1, Math.abs(value)) * 0.95);
                    ctx.lineWidth = 1.6;
                    ctx.stroke();

                    // A small dot marks the same spot inside the neuron's mini-map
                    ctx.beginPath();
                    ctx.arc(x + ((spot.x + 1) / 2) * s, y + (1 - (spot.y + 1) / 2) * s, A.util.clamp(s * 0.1, 1.8, 3.2), 0, Math.PI * 2);
                    ctx.fillStyle = A.colors.rgba(colors.text, 1);
                    ctx.fill();
                    ctx.lineWidth = 1.2;
                    ctx.strokeStyle = A.colors.rgba(colors.base, 0.9);
                    ctx.stroke();
                }
                atlasColumn++;
            }
        });

        // Labels
        ctx.font = "600 10px " + colors.mono;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = A.colors.rgba(colors.dim, 1);
        sizes.forEach((n, c) => {
            let label;
            if (c === 0) label = t("lab.nnInput");
            else if (c === columns - 1) label = t("lab.nnOutput");
            else label = t("lab.nnHidden", { n: c });
            ctx.fillText(label, A.util.clamp(xs[c], 22, w - 22), 12);
        });
        ctx.font = "600 11px " + colors.mono;
        ctx.textAlign = "right";
        ctx.fillStyle = A.colors.rgba(colors.text, 0.75);
        ctx.fillText("x", xs[0] - node / 2 - 6, ys[0][0]);
        ctx.fillText("y", xs[0] - node / 2 - 6, ys[0][1]);
        ctx.textAlign = "left";
        const outX = xs[columns - 1] + outputSize / 2 + 5;
        const outY = ys[columns - 1][0];
        ctx.fillText(t("lab.nnOutputHint"), outX, spot ? outY - 7 : outY);
        if (spot) {
            // The network's answer for the spot you point at
            ctx.fillStyle = A.colors.rgba(spotP >= 0.5 ? colors.b : colors.a, 1);
            ctx.fillText(A.format.percent(spotP, { small: false }), outX, outY + 8);
        }
    }

    function updateDiagramLabel() {
        const params = countParams(nn.net);
        // "8 hidden neurons", or "8 hidden neurons → 8 hidden neurons" with two layers
        const layerText = settings.hidden + " " + A.plural("lab.pluralHidden", settings.hidden);
        const hidden = settings.twoLayers ? layerText + " → " + layerText : layerText;
        const paramsText = t("lab.params", { n: params, params: A.plural("lab.pluralParams", params) });
        $('[data-out="params"]').textContent = paramsText;
        diagram.canvas.setAttribute("aria-label", t("lab.diagramLabel", { hidden: hidden, params: paramsText }));
    }

    /* =========================================================
       6. NEURAL NETWORK: CONTROLS, STATS AND THE ANIMATION LOOP
       ========================================================= */
    // The classifier's buttons, settings and numbers (findElements() finds them)
    let nnEls = null;

    let activeTab = "classifier";
    let labVisible = false;      // on screen in a visible browser tab (see onLabVisible)
    let labNear = false;         // near the screen: the canvases are kept up to date (see onLabNear)
    let languageStale = false;   // the language changed while the lab was far away
    let frame = 0;               // the animation frame that is booked (0: none)

    // Training runs only while you can see it
    function wantsTraining() {
        return nn.training && labVisible && activeTab === "classifier";
    }

    // Books one animation frame (asking twice before it runs books it once)
    function schedule() {
        if (!frame) frame = requestAnimationFrame(tick);
    }

    // The animation loop: train a little, then redraw whatever changed
    function tick(now) {
        frame = 0;
        // Far from the screen nothing is drawn: the loop sleeps until the lab comes near
        if (!labNear) {
            nn.lastTick = 0;
            return;
        }

        // How much time has passed since the last frame (at most 0.1 s)
        const elapsed = nn.lastTick ? Math.min(100, now - nn.lastTick) : 16.7;
        nn.lastTick = now;

        if (wantsTraining()) train(elapsed);

        // The drawing time is measured: learning leaves room for it in the next frames
        const drawStart = performance.now();
        redraw(now);
        nn.drawCost += (performance.now() - drawStart - nn.drawCost) * 0.2;

        // Tell screen-reader users how it's going, but not too often
        if (wantsTraining() && now - nn.lastAnnounce > ANNOUNCE_EVERY) {
            nn.lastAnnounce = now;
            announceStats();
        }

        if (wantsTraining()) checkStuck();

        if (wantsTraining() || nn.dirty.maps || nn.dirty.diagram || nn.dirty.stats) schedule();
        else nn.lastTick = 0;    // the loop sleeps; the next frame starts fresh
    }

    // The epochs of this frame. The speed is in epochs per second, so it is the same
    // on 60 Hz and 120 Hz screens. Learning and drawing share FRAME_BUDGET: learning
    // gets the time the drawing does not need, but always at least half of it
    // (on a slow computer the drawing alone can take longer than the whole budget).
    function train(elapsed) {
        nn.stepBudget += (SPEEDS[settings.speed] * elapsed) / 1000;
        let steps = Math.floor(nn.stepBudget);
        nn.stepBudget -= steps;
        if (steps < 1) return;
        const budget = Math.max(FRAME_BUDGET / 2, FRAME_BUDGET - nn.drawCost);
        const started = performance.now();
        while (steps-- > 0 && performance.now() - started < budget) trainStep();
        nn.dirty.net = true;
    }

    // Draws whatever changed since the last time.
    // force: draw it all now, without waiting (a canvas that was just resized is blank)
    function redraw(now, force) {
        const dirty = nn.dirty;
        if (!colors) readColors();

        // The network (or the dots) changed: score every dot again
        if (dirty.net) {
            scoreDots();
            dirty.net = false;
            dirty.maps = true;
            dirty.diagram = true;
            dirty.stats = true;
            checkLearned();
        }
        // While training, the board's colours follow about 30 times a second
        if (dirty.maps && (force || !nn.training || now - nn.lastMaps >= MAPS_EVERY)) {
            refreshMaps();
            dirty.maps = false;
            dirty.board = true;
            nn.lastMaps = now;
        }
        if (dirty.board) {
            drawBoard();
            dirty.board = false;
        }
        // The diagram and the numbers don't need 60 updates a second
        if (dirty.diagram && (force || !nn.training || now - nn.lastDiagram > DIAGRAM_EVERY)) {
            drawDiagram();
            dirty.diagram = false;
            nn.lastDiagram = now;
        }
        if (dirty.chart) {
            drawChart();
            dirty.chart = false;
        }
        if (dirty.stats && (force || !nn.training || now - nn.lastStats > STATS_EVERY)) {
            updateStats();
            dirty.stats = false;
            nn.lastStats = now;
        }
    }

    function updateStats() {
        const points = nn.points;
        const countB = points.reduce((sum, point) => sum + point.label, 0);
        // Very big counts get short, so they fit their box: "1.2M" or "1,2 млн"
        nnEls.epoch.textContent = A.format.number(nn.epoch, nn.epoch < 1e6 ? 0 : { compact: true });
        nnEls.loss.textContent = nn.loss === null ? "—" : A.format.number(nn.loss, 3);
        nnEls.acc.textContent = nn.acc === null ? "—" : A.format.percent(nn.acc, { small: false });
        nnEls.accBar.style.transform = "scaleX(" + (nn.acc || 0) + ")";
        nnEls.accBar.parentElement.classList.toggle("is-full", nn.acc === 1);
        nnEls.points.textContent = A.format.number(points.length);
        nnEls.split.textContent = t("lab.pointsSplit", { a: points.length - countB, b: countB });

        // The chart's text for screen readers (it changes with the language too)
        const values = nn.lossHistory.values;
        chart.canvas.setAttribute("aria-label", values.length > 1 ?
            t("lab.chartLabel", { loss: A.format.number(values[values.length - 1], 3) }) :
            t("lab.chartLabelEmpty"));
        updateStatus();
    }

    function updateStatus() {
        let status = "ready";
        if (nn.training) status = "training";
        else if (nn.learned) status = "done";
        else if (nn.epoch > 0) status = "paused";
        const keys = { ready: "lab.statusReady", training: "lab.statusTraining", paused: "lab.statusPaused", done: "lab.statusDone" };
        nnEls.status.setAttribute("data-status", status);
        nnEls.statusText.textContent = t(keys[status]);
        labCard.classList.toggle("is-training", nn.training);
    }

    function announceStats() {
        if (nn.loss === null) return;
        A.announce(t("lab.srStatus", {
            epoch: A.format.number(nn.epoch),
            loss: A.format.number(nn.loss, 3),
            acc: A.format.number(nn.acc * 100, 0)
        }), { region: nnEls.live });
    }

    function updateTrainButton() {
        nnEls.train.querySelector(".lab-train-icon").innerHTML = nn.training ? icons.pause : icons.play;
        nnEls.train.querySelector(".lab-train-text").textContent = t(nn.training ? "lab.pause" : "lab.train");
        nnEls.train.classList.toggle("is-training", nn.training);
        updateStatus();
    }

    // Are there dots of both classes (something to tell apart)?
    function hasBothClasses() {
        return nn.points.some((p) => p.label === 0) && nn.points.some((p) => p.label === 1);
    }

    // When every dot is right and the loss is tiny, training pauses by itself.
    // This happens only once: if you press Train again, it keeps going until you pause.
    function checkLearned() {
        if (!nn.training || nn.learned || nn.keepGoing) return;
        if (nn.acc !== 1 || nn.loss === null || nn.loss > LEARNED_LOSS) return;
        if (!hasBothClasses()) return;
        nn.training = false;
        nn.learned = true;
        updateTrainButton();
        A.toast(t("lab.toastLearned", { n: A.format.number(nn.epoch), epochs: A.plural("lab.pluralEpochs", nn.epoch) }), "🎯");
        announceStats();
    }

    // A friendly hint when the network trains for a long time without success
    function checkStuck() {
        if (nn.stuckHinted || nn.epoch < STUCK_EPOCHS || nn.acc === null || nn.acc >= STUCK_ACCURACY) return;
        nn.stuckHinted = true;
        A.toast(t("lab.toastStuck"), "🧩");
    }

    function setTraining(on) {
        if (on && !nn.points.length) {
            A.toast(t("lab.toastEmpty"), "✦");
            return;
        }
        // With one class there is nothing to learn (training would never finish).
        // The Step button still works, to watch what happens.
        if (on && !hasBothClasses()) {
            A.toast(t("lab.toastOneClass"), "⚖️");
            return;
        }
        // Training again after "Learned it!" means: keep going, don't stop by yourself
        if (on && nn.learned) nn.keepGoing = true;
        nn.training = on;
        if (on) nn.learned = false;
        updateTrainButton();
        A.announce(t(on ? "lab.srTraining" : "lab.srPaused"), { region: nnEls.live });
        schedule();
    }

    function resetNetwork() {
        nn.net = createNetwork();
        nn.epoch = 0;
        nn.learned = false;
        nn.keepGoing = false;
        nn.stuckHinted = false;
        nn.stepBudget = 0;
        clearLossHistory();
        nn.dirty.net = true;
        updateDiagramLabel();
        updateStatus();
        schedule();
    }

    // ----- Dots -----
    // Remembers the dots as they are now, for Undo
    function pushUndo() {
        nn.undo.push(nn.points.slice());
        if (nn.undo.length > UNDO_STEPS) nn.undo.shift();
    }

    function pointsChanged() {
        nn.learned = false;
        nn.keepGoing = false;
        nn.dirty.net = true;
        // Below the limit again: the next refused dot shows the "board is full" message again
        if (nn.points.length < MAX_POINTS) nn.maxWarned = false;
        $(".lab-board-empty").hidden = nn.points.length > 0;
        updateEditButtons();
        // Training stops when there is nothing (left) to tell apart
        if (nn.training && !hasBothClasses()) {
            if (nn.points.length) A.toast(t("lab.toastOneClass"), "⚖️");
            nn.training = false;
            updateTrainButton();
        }
        schedule();
    }

    // Undo and Clear are switched off when there is nothing to undo or clear.
    // If the button you just pressed switches itself off, keyboard focus moves
    // to the other button (or to the board), so it is not lost.
    function updateEditButtons() {
        const undoButton = $('[data-action="undo"]');
        const clearButton = $('[data-action="clear"]');
        const undoOff = nn.undo.length === 0;
        const clearOff = nn.points.length === 0;
        const focused = document.activeElement;
        if ((focused === undoButton && undoOff) || (focused === clearButton && clearOff)) {
            const other = focused === undoButton ? clearButton : undoButton;
            const otherOff = other === undoButton ? undoOff : clearOff;
            other.disabled = otherOff;
            (otherOff ? board.el : other).focus();
        }
        undoButton.disabled = undoOff;
        clearButton.disabled = clearOff;
    }

    // Is the board full? The first dot that does not fit shows a message.
    function boardFull() {
        if (nn.points.length < MAX_POINTS) return false;
        if (!nn.maxWarned) A.toast(t("lab.toastMax", { n: MAX_POINTS }), "✋");
        nn.maxWarned = true;
        return true;
    }

    function addPoint(spot, label) {
        nn.points.push({ x: A.util.clamp(spot.x, -1, 1), y: A.util.clamp(spot.y, -1, 1), label: label });
    }

    // One click, tap or Enter: one new dot, one Undo step and one message for screen readers.
    // Nothing happens (not even an Undo step) when the board is full.
    function addDot(spot, label) {
        if (boardFull()) return;
        pushUndo();
        addPoint(spot, label);
        markPreset(null);
        pointsChanged();
        announceAdded(label);
    }

    function className(label) {
        return t(label === 1 ? "lab.classB" : "lab.classA");
    }

    function announceAdded(label) {
        const n = nn.points.length;
        A.announce(t("lab.srAdded", { cls: className(label), n: n, points: A.plural("lab.pluralPoints", n) }), { region: nnEls.live });
    }

    function selectClass(label) {
        nn.selected = label;
        $$(".lab-class").forEach((button) => {
            button.setAttribute("aria-pressed", String(Number(button.getAttribute("data-class")) === label));
        });
        if (nn.hover) nn.hover.label = label;
        if (nn.cursor) nn.cursor.label = label;
        nn.dirty.board = true;
        schedule();
    }

    function loadPreset(name) {
        pushUndo();
        nn.points = makePreset(name);
        pointsChanged();
        resetNetwork();
        markPreset(name);
        const n = nn.points.length;
        A.announce(t("lab.srPreset", {
            name: t("lab.preset" + name.charAt(0).toUpperCase() + name.slice(1)),
            n: n,
            points: A.plural("lab.pluralPoints", n)
        }), { region: nnEls.live });
        setTraining(true);
    }

    // Highlights the chip of the example that is on the board (null: none of them)
    function markPreset(name) {
        $$(".lab-preset").forEach((chip) => chip.classList.toggle("active", chip.getAttribute("data-preset") === name));
    }

    // ----- Mouse, touch and pen on the board -----
    function eventToBoard(event) {
        const rect = board.el.getBoundingClientRect();
        return {
            x: A.util.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
            y: A.util.clamp(1 - ((event.clientY - rect.top) / rect.height) * 2, -1, 1)
        };
    }

    function labelFor(event) {
        // Shift-click or right-click adds the other class
        return event.shiftKey || event.button === 2 ? 1 - nn.selected : nn.selected;
    }

    function onPointerDown(event) {
        if (event.button !== 0 && event.button !== 2) return;
        const spot = eventToBoard(event);
        const label = labelFor(event);

        if (event.pointerType === "touch") {
            // On phones we wait for the finger to lift, so you can still scroll over the board
            nn.tap = { id: event.pointerId, x: event.clientX, y: event.clientY, spot: spot, label: label };
            return;
        }

        event.preventDefault();
        // preventDefault() also stops the normal focus, so we focus the board ourselves:
        // then Ctrl+Z, A / B and Backspace work right after clicking
        board.el.focus({ preventScroll: true });
        nn.cursor = null;
        addDot(spot, label);
        // "painted": the dots this drag adds after the first one (they share its Undo step)
        nn.stroke = { id: event.pointerId, last: spot, label: label, painted: 0 };
        try {
            board.el.setPointerCapture(event.pointerId);
        } catch (error) {
            // The browser can refuse (the pointer is already gone): drawing still works
        }
        nn.dirty.board = true;
        schedule();
    }

    function onPointerMove(event) {
        if (event.pointerType === "touch") {
            if (nn.tap && Math.hypot(event.clientX - nn.tap.x, event.clientY - nn.tap.y) > TAP_MOVE) nn.tap = null;
            return;
        }
        const spot = eventToBoard(event);
        nn.hover = { x: spot.x, y: spot.y, label: nn.stroke ? nn.stroke.label : (event.shiftKey ? 1 - nn.selected : nn.selected) };

        // Hold and drag to paint: a new dot every little while
        if (nn.stroke && nn.stroke.id === event.pointerId) {
            const last = nn.stroke.last;
            if (Math.hypot(spot.x - last.x, spot.y - last.y) > PAINT_STEP && !boardFull()) {
                addPoint(spot, nn.stroke.label);
                nn.stroke.last = spot;
                nn.stroke.painted++;
                pointsChanged();
            }
        }
        nn.dirty.board = true;
        schedule();
    }

    // Phones have no mouse pointer to "point" with, so after a tap we show the
    // network's guess for that spot (readout + diagram markers) for a few seconds
    function showTouchSpot(spot, label) {
        clearTimeout(nn.touchTimer);
        nn.hover = { x: spot.x, y: spot.y, label: label, touch: true };
        nn.dirty.board = true;
        schedule();
        nn.touchTimer = setTimeout(() => {
            if (nn.hover && nn.hover.touch) {
                nn.hover = null;
                nn.dirty.board = true;
                schedule();
            }
        }, TOUCH_GUESS);
    }

    function endPointer(event) {
        if (nn.tap && nn.tap.id === event.pointerId && event.type === "pointerup") {
            const tap = nn.tap;
            nn.tap = null;
            addDot(tap.spot, tap.label);
            showTouchSpot(tap.spot, tap.label);
        }
        if (event.type === "pointercancel") nn.tap = null;
        if (nn.stroke && nn.stroke.id === event.pointerId) {
            // The first dot was announced already: a drag that painted more says the new total once
            if (nn.stroke.painted > 0) announceAdded(nn.stroke.label);
            nn.stroke = null;
        }
    }

    function onPointerLeave(event) {
        if (event.pointerType === "touch") return;
        nn.hover = null;
        nn.dirty.board = true;
        schedule();
    }

    // ----- Keyboard on the board -----
    function onBoardFocus() {
        // Only show the keyboard cursor when the board was reached with the keyboard
        if (board.el.matches(":focus-visible") && !nn.cursor) {
            nn.cursor = { x: 0, y: 0, label: nn.selected };
            nn.dirty.board = true;
            schedule();
        }
    }

    function onBoardBlur() {
        nn.cursor = null;
        nn.dirty.board = true;
        schedule();
    }

    function onBoardKey(event) {
        const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
        if (event.ctrlKey || event.metaKey) {
            if (event.code === "KeyZ") {
                event.preventDefault();
                undo();
            }
            return;
        }
        if (moves[event.key]) {
            event.preventDefault();
            if (!nn.cursor) nn.cursor = { x: 0, y: 0, label: nn.selected };
            const amount = event.shiftKey ? CURSOR_JUMP : CURSOR_STEP;
            nn.cursor.x = A.util.clamp(nn.cursor.x + moves[event.key][0] * amount, -1, 1);
            nn.cursor.y = A.util.clamp(nn.cursor.y + moves[event.key][1] * amount, -1, 1);
            nn.dirty.board = true;
            schedule();
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!nn.cursor) nn.cursor = { x: 0, y: 0, label: nn.selected };
            addDot(nn.cursor, nn.selected);
            nn.dirty.board = true;     // the cursor may have just appeared
            schedule();
        } else if (event.code === "KeyA" || event.code === "KeyB") {
            event.preventDefault();
            selectClass(event.code === "KeyA" ? 0 : 1);
        } else if (event.key === "Backspace" || event.key === "Delete") {
            event.preventDefault();
            undo();
        }
    }

    function setUpBoard() {
        const el = board.el;
        el.addEventListener("pointerdown", onPointerDown);
        el.addEventListener("pointermove", onPointerMove);
        el.addEventListener("pointerup", endPointer);
        el.addEventListener("pointercancel", endPointer);
        el.addEventListener("pointerleave", onPointerLeave);
        el.addEventListener("contextmenu", (event) => event.preventDefault());
        el.addEventListener("focus", onBoardFocus);
        el.addEventListener("blur", onBoardBlur);
        el.addEventListener("keydown", onBoardKey);
    }

    function undo() {
        if (!nn.undo.length) return;
        nn.points = nn.undo.pop();
        markPreset(null);
        pointsChanged();
        const n = nn.points.length;
        A.announce(t("lab.srUndo", { n: n, points: A.plural("lab.pluralPoints", n) }), { region: nnEls.live });
    }

    // ----- Buttons and settings -----
    function clearBoard() {
        if (!nn.points.length) return;
        pushUndo();
        nn.points = [];
        markPreset(null);
        pointsChanged();
        A.announce(t("lab.srCleared"), { region: nnEls.live });
    }

    // One epoch at a time, to watch every small change
    function stepOnce() {
        if (!nn.points.length) {
            A.toast(t("lab.toastEmpty"), "✦");
            return;
        }
        if (nn.training) setTraining(false);
        trainStep();
        nn.dirty.net = true;
        schedule();
        // read out the new numbers once they are calculated
        requestAnimationFrame(() => requestAnimationFrame(announceStats));
    }

    function setUpControls() {
        $$(".lab-class").forEach((button) => {
            button.addEventListener("click", () => selectClass(Number(button.getAttribute("data-class"))));
        });
        $$(".lab-preset").forEach((chip) => {
            chip.addEventListener("click", () => loadPreset(chip.getAttribute("data-preset")));
        });
        $('[data-action="undo"]').addEventListener("click", undo);
        $('[data-action="clear"]').addEventListener("click", clearBoard);
        nnEls.train.addEventListener("click", () => setTraining(!nn.training));
        $('[data-action="step"]').addEventListener("click", stepOnce);
        $('[data-action="reset"]').addEventListener("click", resetNetwork);

        // The settings show what was saved last time
        const speedButtons = $$(".lab-seg button");
        nnEls.lr.value = String(settings.lr);
        nnEls.opt.value = settings.optimizer;
        nnEls.neurons.value = String(settings.hidden);
        $('[data-out="neurons"]').textContent = settings.hidden;
        updateRangeFill(nnEls.neurons);
        nnEls.layer.setAttribute("aria-checked", String(settings.twoLayers));
        speedButtons.forEach((button) => {
            button.setAttribute("aria-pressed", String(button.getAttribute("data-speed") === settings.speed));
        });

        nnEls.lr.addEventListener("change", () => {
            settings.lr = Number(nnEls.lr.value);
            saveSettings();
        });

        nnEls.opt.addEventListener("change", () => {
            settings.optimizer = nnEls.opt.value === "sgd" ? "sgd" : "adam";
            resetOptimizer(nn.net);
            saveSettings();
        });

        nnEls.neurons.addEventListener("input", () => {
            settings.hidden = Number(nnEls.neurons.value);
            $('[data-out="neurons"]').textContent = settings.hidden;
            updateRangeFill(nnEls.neurons);
            saveSettings();
            resetNetwork();
        });

        nnEls.layer.addEventListener("click", () => {
            settings.twoLayers = !settings.twoLayers;
            nnEls.layer.setAttribute("aria-checked", String(settings.twoLayers));
            saveSettings();
            resetNetwork();
        });

        speedButtons.forEach((button) => {
            button.addEventListener("click", () => {
                settings.speed = button.getAttribute("data-speed");
                speedButtons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
                saveSettings();
            });
        });
    }

    /* =========================================================
       7. NEXT-WORD PREDICTOR: THE MATHS
       A word-level "n-gram" language model. "Training" it is counting:
       which word follows each word (pairs, "bigrams") and each two words
       (triples, "trigrams") in the example sentences.
       To guess the next word it looks at the last two words of the text:
       - every word seen after them gets (its count - DISCOUNT) / (all counts);
       - the share the discounts set aside goes to all the other words, in
         proportion to their chance after only the last word ("backoff"),
         which in turn backs off to how common each word is overall.
       So every word the model knows has a chance above 0, and the chances
       add up to 1. The temperature then decides how adventurous the pick is.
       ========================================================= */
    // The sentences it learns from (both languages) are in js/content/lab.js
    const CORPUS = data.corpus;

    // Every sentence is read as START START word word ... END,
    // so the model also learns how sentences begin and end
    const START = "<s>";
    const END = "</s>";
    const WORD_RE = /[\p{L}\p{N}'’-]+/gu;        // a word: letters of any alphabet, digits, ' and -
    const WORD_END = /[\p{L}\p{N}'’-]+$/u;       // the same kind of word, at the very end of a text
    const HAS_LETTER = /[\p{L}\p{N}]/u;          // ("-" or "'" alone is not a word)

    // Splits text into words (keeps letters of every alphabet, digits, ' and -)
    function wordsOf(text) {
        return (String(text).match(WORD_RE) || []).filter((word) => HAS_LETTER.test(word));
    }

    // Does the text end in the middle of a word (a word still being typed)?
    // "I like piz" and "AI-" do; "I like pizza ", "pizza." and "pizza 🍕" do not.
    function endsMidWord(text) {
        const tail = text.match(WORD_END);
        return Boolean(tail) && HAS_LETTER.test(tail[0]);
    }

    // Counts that "word" came after "key" (one word, or two words joined by a space)
    function addCount(map, key, word) {
        let context = map.get(key);
        if (!context) {
            context = { total: 0, counts: new Map() };
            map.set(key, context);
        }
        context.total++;
        context.counts.set(word, (context.counts.get(word) || 0) + 1);
    }

    // "Training" this model = counting. It also remembers how each word is usually
    // written ("AI", "Friday"), and counts the different pairs and triples it saw
    // (the "What it knows" box).
    function buildModel(sentences) {
        const unigrams = new Map();
        const bigrams = new Map();
        const trigrams = new Map();
        const casing = new Map();
        const pairs = new Set();
        const triples = new Set();
        let total = 0;
        let sentenceCount = 0;

        sentences.forEach((sentence) => {
            const original = wordsOf(sentence);
            if (!original.length) return;
            sentenceCount++;
            const lower = original.map((word) => word.toLowerCase());

            // Remember how words are written in the middle of a sentence ("AI", "I", "Friday")
            original.forEach((word, i) => {
                if (i === 0) return;
                let forms = casing.get(lower[i]);
                if (!forms) casing.set(lower[i], forms = new Map());
                forms.set(word, (forms.get(word) || 0) + 1);
            });

            const tokens = [START, START].concat(lower, [END]);
            for (let i = 2; i < tokens.length; i++) {
                const word = tokens[i];
                unigrams.set(word, (unigrams.get(word) || 0) + 1);
                total++;
                addCount(bigrams, tokens[i - 1], word);
                addCount(trigrams, tokens[i - 2] + " " + tokens[i - 1], word);
                if (word !== END && tokens[i - 1] !== START) {
                    pairs.add(tokens[i - 1] + " " + word);
                    if (tokens[i - 2] !== START) triples.add(tokens[i - 2] + " " + tokens[i - 1] + " " + word);
                }
            }
        });

        const unigramDist = new Map();
        unigrams.forEach((count, word) => unigramDist.set(word, count / total));

        const bestCasing = new Map();
        casing.forEach((forms, word) => {
            let best = word;
            let bestCount = 0;
            forms.forEach((count, form) => {
                if (count > bestCount) {
                    best = form;
                    bestCount = count;
                }
            });
            bestCasing.set(word, best);
        });

        return {
            unigrams: unigrams,
            unigramDist: unigramDist,
            bigrams: bigrams,
            trigrams: trigrams,
            casing: bestCasing,
            stats: {
                sentences: sentenceCount,
                words: unigrams.size - (unigrams.has(END) ? 1 : 0),
                pairs: pairs.size,
                triples: triples.size
            }
        };
    }

    // "Backoff": words seen after this context share most of the probability;
    // a small part is left for all other words, using the shorter context.
    function backoff(context, lower) {
        if (!context) return lower;
        const result = new Map();
        let seenLowerMass = 0;
        context.counts.forEach((count, word) => {
            result.set(word, (count - DISCOUNT) / context.total);
            seenLowerMass += lower.get(word) || 0;
        });
        const leftover = (DISCOUNT * context.counts.size) / context.total;
        const unseenMass = 1 - seenLowerMass;
        if (unseenMass > 1e-9) {
            lower.forEach((p, word) => {
                if (!context.counts.has(word)) result.set(word, (leftover * p) / unseenMass);
            });
        } else {
            let sum = 0;
            result.forEach((p) => { sum += p; });
            result.forEach((p, word) => result.set(word, p / sum));
        }
        return result;
    }

    // The chance of every word after "previous" (the words so far, in lower case).
    // level: 3 = it knows the last two words together, 2 = only the last word, 1 = neither.
    function predictNext(model, previous) {
        const p1 = previous.length ? previous[previous.length - 1] : START;
        const p2 = previous.length > 1 ? previous[previous.length - 2] : START;
        const bigram = model.bigrams.get(p1);
        const trigram = model.trigrams.get(p2 + " " + p1);
        const dist = backoff(trigram, backoff(bigram, model.unigramDist));
        return {
            dist: dist,
            level: trigram ? 3 : (bigram ? 2 : 1),
            p1: p1,
            p2: p2,
            count: trigram ? trigram.total : (bigram ? bigram.total : 0),
            oneCount: bigram ? bigram.total : 0
        };
    }

    // The chance of ONE word after "previous": exactly the number predictNext() gives
    // (the same sums in the same order), without making the whole list of every word.
    // The token view needs it for every word you typed, at every key press.
    function probOf(model, previous, word) {
        const p1 = previous.length ? previous[previous.length - 1] : START;
        const p2 = previous.length > 1 ? previous[previous.length - 2] : START;
        const bigram = model.bigrams.get(p1);
        const trigram = model.trigrams.get(p2 + " " + p1);
        const unigram = (w) => model.unigramDist.get(w);
        const afterOne = (w) => backoffOne(bigram, unigram, w);
        return backoffOne(trigram, afterOne, word) || 0;
    }

    // backoff() for one word. lower(word) is the shorter context's chance of a word
    // (undefined for a word it does not have, like Map.get). Gives undefined for a word
    // that backoff() would leave out of its list.
    function backoffOne(context, lower, word) {
        if (!context) return lower(word);
        if (context.seenLowerMass === undefined) {
            // Worked out once for each context (the model is made again when it changes)
            let seenLowerMass = 0;
            let keptSum = 0;
            context.counts.forEach((count, seen) => {
                seenLowerMass += lower(seen) || 0;
                keptSum += (count - DISCOUNT) / context.total;
            });
            context.seenLowerMass = seenLowerMass;
            context.keptSum = keptSum;
        }
        const count = context.counts.get(word);
        const unseenMass = 1 - context.seenLowerMass;
        if (unseenMass > 1e-9) {
            if (count) return (count - DISCOUNT) / context.total;
            const p = lower(word);
            if (p === undefined) return undefined;
            const leftover = (DISCOUNT * context.counts.size) / context.total;
            return (leftover * p) / unseenMass;
        }
        // The rare case where the seen words already have all of the shorter list's
        // probability: backoff() keeps only them, scaled up so they add up to 1
        return count ? ((count - DISCOUNT) / context.total) / context.keptSum : undefined;
    }

    // The most likely words first (filter: only the words it accepts)
    function topWords(dist, limit, filter) {
        const list = [];
        dist.forEach((p, word) => {
            if (word !== START && (!filter || filter(word))) list.push({ word: word, p: p });
        });
        list.sort((a, b) => b.p - a.p);
        return list.slice(0, limit);
    }

    // Temperature T: every chance p becomes p^(1/T), then they are scaled to add up to 1.
    // T below 1 sharpens the list towards the top word, above 1 flattens it (more
    // surprising picks), and near 0 it always picks the top word.
    function pickChances(list, temperature) {
        if (!list.length) return [];
        if (temperature < 0.05) return list.map((item, i) => (i === 0 ? 1 : 0));
        const weights = list.map((item) => Math.pow(item.p, 1 / temperature));
        const sum = weights.reduce((a, b) => a + b, 0) || 1;
        return weights.map((weight) => weight / sum);
    }

    /* =========================================================
       8. NEXT-WORD PREDICTOR: THE PANEL
       ========================================================= */
    // ----- State of the predictor -----
    const lm = {
        lang: A.lang,            // the language of the sentences it learned
        model: null,             // the counts (buildModel)
        taught: [],              // your own sentences (saved as "lab.taught.en" and "lab.taught.ru")
        temperature: TEMPERATURE.start,
        starter: null,           // { n, text } when the text came from a starter button
        writer: null,            // the auto-write job while it runs
        shown: [],               // candidates on screen right now
        mode: "next",            // "next" word, or "complete" (finishing the word being typed)
        lastResult: null,        // the last analysis (the creativity slider uses it again)
        srTimer: 0               // the short wait before screen readers hear the top guess
    };

    // The predictor's elements (findElements() finds them)
    let lmEls = null;

    // Your creativity setting (rounded to the slider's 0.1 steps; a broken value gets the start value)
    const savedTemp = Number(A.storage.get("lab.temperature", TEMPERATURE.start));
    lm.temperature = isFinite(savedTemp) ? A.util.clamp(Math.round(savedTemp * 10) / 10, TEMPERATURE.min, TEMPERATURE.max) : TEMPERATURE.start;

    // The model for the current language: the example sentences plus yours
    // (a saved value that is not a list of sentences is ignored)
    function loadModel() {
        lm.lang = A.lang;
        const taught = A.storage.get("lab.taught." + lm.lang, []);
        lm.taught = Array.isArray(taught) ? taught.filter((s) => typeof s === "string").slice(0, MAX_TAUGHT) : [];
        lm.model = buildModel(CORPUS[lm.lang].concat(lm.taught));
    }

    // Looks at the text: which words come before, and is the last word finished?
    function readText(text) {
        const cut = Math.max(text.lastIndexOf("."), text.lastIndexOf("!"), text.lastIndexOf("?"), text.lastIndexOf("…"));
        const sentence = text.slice(cut + 1);
        const previous = wordsOf(sentence).map((word) => word.toLowerCase());
        let partial = "";
        if (endsMidWord(text) && previous.length) partial = previous.pop();
        return { previous: previous, partial: partial };
    }

    // How a word should be written: "ai" -> "AI", capital letter at the start of a sentence
    function displayWord(word, atStart) {
        let shown = lm.model.casing.get(word) || word;
        if (atStart) shown = shown.charAt(0).toUpperCase() + shown.slice(1);
        return shown;
    }

    // Works out the candidates for the current text
    function analyse() {
        const text = lmEls.input.value;
        const state = readText(text);
        const model = lm.model;

        // Still typing a word? Then suggest ways to finish it, like a phone keyboard
        if (state.partial) {
            const prediction = predictNext(model, state.previous);
            let sum = 0;
            const matches = topWords(prediction.dist, MATCH_LIMIT, (word) => {
                const ok = word !== END && word.startsWith(state.partial);
                if (ok) sum += prediction.dist.get(word);
                return ok;
            });
            if (matches.length) {
                matches.forEach((item) => { item.p = item.p / (sum || 1); });
                return { mode: "complete", state: state, list: matches.slice(0, CHOICES), prediction: prediction };
            }
            state.previous.push(state.partial);
            state.partial = "";
        }
        const prediction = predictNext(model, state.previous);
        return { mode: "next", state: state, list: topWords(prediction.dist, CHOICES), prediction: prediction };
    }

    function contextText(result) {
        if (result.mode === "complete") return t("lab.lmCtxComplete", { prefix: quote(result.state.partial + "…") });
        const prediction = result.prediction;
        const cased = (word) => lm.model.casing.get(word) || word;
        const p1 = cased(prediction.p1);
        const p2 = cased(prediction.p2);
        if (prediction.p1 === START) return t("lab.lmCtxStart");
        if (prediction.level === 3) {
            const n = prediction.count;
            if (prediction.p2 === START) return t("lab.lmCtxFirst", { word: quote(p1), n: n, times: A.plural("lab.pluralTimes", n) });
            return t("lab.lmCtxTri", { words: quote(p2 + " " + p1), n: n, times: A.plural("lab.pluralTimes", n) });
        }
        if (prediction.level === 2) {
            const n = prediction.oneCount;
            if (prediction.p2 === START) return t("lab.lmCtxOne", { word: quote(p1), n: n, times: A.plural("lab.pluralTimes", n) });
            return t("lab.lmCtxBi", { pair: quote(p2 + " " + p1), word: quote(p1), n: n, times: A.plural("lab.pluralTimes", n) });
        }
        return t("lab.lmCtxUni", { word: quote(prediction.p1) });
    }

    // Draws the candidate rows, the context line and the token view
    function renderPredictor() {
        if (!lm.model) return;
        const result = analyse();
        lm.mode = result.mode;
        const atStart = result.state.previous.length === 0;
        const chances = pickChances(result.list, lm.temperature);
        lm.shown = result.list.slice(0, CANDIDATES).map((item, i) => ({ word: item.word, p: item.p, chance: chances[i] }));
        lm.lastResult = result;

        lmEls.mode.textContent = t(result.mode === "complete" ? "lab.lmComplete" : "lab.lmNext");
        lmEls.context.textContent = contextText(result);

        lmEls.items.forEach((item, i) => {
            const data = lm.shown[i];
            item.hidden = !data;
            if (!data) return;
            const button = item.querySelector(".lab-cand");
            const isEnd = data.word === END;
            const shown = isEnd ? "⏎ " + t("lab.lmEnd") : displayWord(data.word, atStart);
            button.classList.toggle("is-end", isEnd);
            button.querySelector(".lab-cand-word").textContent = shown;
            button.querySelector(".lab-cand-pct").textContent = A.format.percent(data.p);
            button.querySelector(".lab-cand-fill").style.transform = "scaleX(" + Math.max(0.015, data.p).toFixed(4) + ")";
            button.querySelector(".lab-cand-pick").style.transform = "scaleX(" + (data.chance || 0).toFixed(4) + ")";
            button.setAttribute("aria-label", isEnd ?
                t("lab.lmPickEndLabel", { pct: A.format.percent(data.p) }) :
                t("lab.lmPickLabel", { word: quote(shown), pct: A.format.percent(data.p) }));
        });

        renderTokens();
        updateTempOutput();

        // Screen readers hear the top guess after a short pause in typing
        clearTimeout(lm.srTimer);
        lm.srTimer = setTimeout(() => {
            const top = lm.shown[0];
            if (!top || lm.writer) return;
            const word = top.word === END ? t("lab.lmEnd") : quote(displayWord(top.word, atStart));
            A.announce(t("lab.lmSrTop", { word: word, pct: A.format.percent(top.p) }), { region: lmEls.live });
        }, SR_PAUSE);
    }

    // Shows each word coloured by how much the model expected it
    function renderTokens() {
        const text = lmEls.input.value;
        const tokens = [];
        let unknown = 0;
        let known = 0;
        const sentences = text.split(/[.!?…]+/);
        const typingLast = endsMidWord(text);
        sentences.forEach((sentence, s) => {
            const original = wordsOf(sentence);
            const previous = [];
            original.forEach((word, i) => {
                const lower = word.toLowerCase();
                const typing = typingLast && s === sentences.length - 1 && i === original.length - 1;
                const p = lm.model.unigrams.has(lower) ? probOf(lm.model, previous, lower) : 0;
                if (!typing) {
                    if (p === 0) unknown++;
                    else known++;
                }
                tokens.push({ word: word, p: p, typing: typing });
                previous.push(lower);
            });
        });

        lmEls.notice.hidden = !(known + unknown >= 2 && unknown / (known + unknown) > 0.5);

        const box = lmEls.tokens;
        if (!tokens.length) {
            box.textContent = "";
            const empty = document.createElement("p");
            empty.className = "lab-tokens-empty";
            empty.textContent = t("lab.lmTokensEmpty");
            box.appendChild(empty);
            return;
        }
        const note = box.querySelector(".lab-tokens-empty");
        if (note) note.remove();

        // The chips already in the box are kept and only get their new word and colour.
        // New chips are added at the end: only they fade in, so nothing flickers.
        const shown = tokens.slice(-MAX_TOKENS);
        const chips = box.children;
        const added = document.createDocumentFragment();
        shown.forEach((token, i) => {
            let chip = chips[i];
            if (!chip) {
                chip = document.createElement("span");
                chip.className = "lab-tok";
                chip.appendChild(document.createElement("span"));
                const value = document.createElement("small");
                value.className = "mono";
                chip.appendChild(value);
                added.appendChild(chip);
            }
            fillChip(chip, token);
        });
        while (chips.length > shown.length) box.lastElementChild.remove();
        box.appendChild(added);
    }

    // Puts a word and its chance into a chip (only what changed is written)
    function fillChip(chip, token) {
        let value;
        let glow = "";
        if (token.typing) {
            value = "…";
        } else if (token.p === 0) {
            value = t("lab.lmTokenNew");
        } else {
            value = A.format.percent(token.p);
            // log scale: 100% -> 1, 10% -> 0.67, 1% -> 0.33, 0.1% -> 0
            glow = A.util.clamp((Math.log10(token.p) + 3) / 3, 0, 1).toFixed(3);
        }
        const word = chip.firstElementChild;
        const small = chip.lastElementChild;
        A.dom.setText(word, token.word);      // only a real change is written
        A.dom.setText(small, value);
        chip.classList.toggle("is-typing", token.typing);
        chip.classList.toggle("is-new", !token.typing && token.p === 0);
        if (chip.style.getPropertyValue("--p") !== glow) chip.style.setProperty("--p", glow);
    }

    function renderLmStats() {
        const stats = lm.model.stats;
        const labels = { sentences: "lab.pluralSentences", words: "lab.pluralWords", pairs: "lab.pluralPairs", triples: "lab.pluralTriples" };
        Object.keys(labels).forEach((name) => {
            $('[data-lmstat="' + name + '"]').textContent = A.format.number(stats[name]);
            $('[data-lmstat-label="' + name + '"]').textContent = A.plural(labels[name], stats[name]);
        });
        lmEls.teachStatus.textContent = lm.taught.length ?
            t("lab.lmTeachCount", { n: lm.taught.length }) : t("lab.lmTeachNone");
        lmEls.teachStatus.classList.remove("is-error");
        lmEls.forget.hidden = lm.taught.length === 0;
    }

    function tempWord(value) {
        if (value < 0.05) return t("lab.lmTemp0");
        if (value < 0.5) return t("lab.lmTemp1");
        if (value < 1.05) return t("lab.lmTemp2");
        if (value < 1.5) return t("lab.lmTemp3");
        return t("lab.lmTemp4");
    }

    function updateTempOutput() {
        const text = A.format.number(lm.temperature, 1) + " · " + tempWord(lm.temperature);
        lmEls.tempOut.textContent = text;
        lmEls.temp.setAttribute("aria-valuetext", text);
        updateRangeFill(lmEls.temp);
    }

    function updateAutoButton() {
        const writing = Boolean(lm.writer);
        lmEls.auto.querySelector(".lab-auto-icon").innerHTML = writing ? icons.stop : icons.sparkle;
        lmEls.auto.querySelector(".lab-auto-text").textContent = t(writing ? "lab.lmStop" : "lab.lmAuto");
        lmEls.auto.classList.toggle("is-writing", writing);
        lmEls.field.classList.toggle("is-writing", writing);
    }

    // Adds a word to the text (or finishes the word being typed)
    function insertWord(word) {
        const input = lmEls.input;
        let text = input.value;
        const state = readText(text);
        // The half-typed word at the end of the text (null when the last word is finished)
        const typed = state.partial ? text.match(WORD_END) : null;

        if (word === END) {
            input.value = text.replace(/[\s,;:]+$/, "") + ". ";
        } else if (lm.mode === "complete" && typed) {
            // replace the half-typed word
            const keepCapital = typed[0].charAt(0) !== typed[0].charAt(0).toLowerCase();
            input.value = text.slice(0, text.length - typed[0].length) + displayWord(word, state.previous.length === 0 || keepCapital) + " ";
        } else {
            if (text && !/\s$/.test(text)) text += " ";
            input.value = text + displayWord(word, state.previous.length === 0 && !state.partial) + " ";
        }
        if (input.value.length > MAX_TEXT) input.value = input.value.slice(0, MAX_TEXT);
        input.scrollTop = input.scrollHeight;
        renderPredictor();
    }

    // ----- Auto-write: the model writes up to AUTO_WORDS words by itself -----
    // finishWord: true = a word that is half typed gets finished (the Stop button),
    // false = it is taken back (for example when you click a candidate instead).
    function stopAuto(announceDone, finishWord) {
        const job = lm.writer;
        if (!job) return;
        job.cancelled = true;
        clearTimeout(job.timer);
        lm.writer = null;
        lmEls.items.forEach((item) => item.querySelector(".lab-cand").classList.remove("is-picked"));

        // Stopped in the middle of typing a word? Only fix the text if you didn't edit it yourself.
        const input = lmEls.input;
        if (job.typing && input.value === job.base + job.typed) {
            input.value = finishWord ? job.base + job.word : job.base;
            input.scrollTop = input.scrollHeight;
            renderPredictor();
        }
        updateAutoButton();
        if (announceDone) A.announce(t("lab.lmSrDone"), { region: lmEls.live });
    }

    function startAuto() {
        if (lm.writer) {
            stopAuto(true, true);
            return;
        }
        // base = the text before the current word, word = the word being typed, typed = the letters so far
        const job = { cancelled: false, count: 0, timer: 0, typing: false, base: "", word: "", typed: "" };
        lm.writer = job;
        updateAutoButton();

        // The first new word needs a space before it ("piz" + " " + "next", "pizza." + " " + "Then")
        const input = lmEls.input;
        if (input.value && !/\s$/.test(input.value) && input.value.length < MAX_TEXT) input.value += " ";
        renderPredictor();

        const calm = !A.motion.ok();

        // A hidden browser tab stops it at its next step, and a half-typed word is taken
        // back (onLabVisible only hears about a hidden tab while the lab is on screen)
        function stoppedByHiddenTab() {
            if (!document.hidden) return false;
            stopAuto(false);
            return true;
        }

        function nextWord() {
            if (job.cancelled || stoppedByHiddenTab()) return;
            if (job.count >= AUTO_WORDS || input.value.length > AUTO_STOP) {
                stopAuto(true);
                return;
            }
            const result = analyse();
            const chances = pickChances(result.list, lm.temperature);
            if (!result.list.length) {
                stopAuto(true);
                return;
            }
            const choice = result.list[A.util.sampleWeighted(chances)].word;
            job.count++;

            // Light up the chosen candidate for a moment, so you can see the "decision"
            const shownIndex = lm.shown.findIndex((item) => item.word === choice);
            if (shownIndex >= 0) lmEls.items[shownIndex].querySelector(".lab-cand").classList.add("is-picked");

            job.timer = setTimeout(() => {
                if (job.cancelled || stoppedByHiddenTab()) return;
                lmEls.items.forEach((item) => item.querySelector(".lab-cand").classList.remove("is-picked"));
                if (choice === END) {
                    insertWord(END);
                    stopAuto(true);
                    return;
                }
                const atStart = readText(input.value).previous.length === 0;
                typeOut(displayWord(choice, atStart) + " ", () => {
                    job.typing = false;
                    renderPredictor();
                    job.timer = setTimeout(nextWord, calm ? AUTO_PAUSE_CALM.next : AUTO_PAUSE.next);
                });
            }, calm ? AUTO_PAUSE_CALM.pick : AUTO_PAUSE.pick);
        }

        // Letters appear one by one, like someone typing
        function typeOut(text, done) {
            if (calm) {
                input.value += text;
                input.scrollTop = input.scrollHeight;
                done();
                return;
            }
            job.typing = true;
            job.base = input.value;
            job.word = text;
            job.typed = "";
            let i = 0;
            (function typeLetter() {
                if (job.cancelled || stoppedByHiddenTab()) return;
                input.value += text.charAt(i);
                job.typed += text.charAt(i);
                input.scrollTop = input.scrollHeight;
                i++;
                if (i < text.length) job.timer = setTimeout(typeLetter, LETTER_MS + A.util.random(0, LETTER_RANDOM));
                else done();
            })();
        }

        nextWord();
    }

    // ----- Teaching the model your own sentences -----
    function teachSentence(event) {
        event.preventDefault();
        const sentence = lmEls.teachInput.value.trim().replace(/\s+/g, " ");
        if (wordsOf(sentence).length < 2) {
            lmEls.teachStatus.textContent = t("lab.lmTeachError");
            lmEls.teachStatus.classList.add("is-error");
            lmEls.teachInput.focus();
            return;
        }
        if (lm.taught.length >= MAX_TAUGHT) {
            lmEls.teachStatus.textContent = t("lab.lmTeachFull");
            lmEls.teachStatus.classList.add("is-error");
            return;
        }
        lm.taught.push(sentence.slice(0, MAX_TEACH));
        A.storage.set("lab.taught." + lm.lang, lm.taught);
        lm.model = buildModel(CORPUS[lm.lang].concat(lm.taught));
        lmEls.teachInput.value = "";
        renderLmStats();
        renderPredictor();
        A.toast(t("lab.lmTeachToast"), "🧠");
    }

    function forgetSentences() {
        lm.taught = [];
        A.storage.remove("lab.taught." + lm.lang);
        lm.model = buildModel(CORPUS[lm.lang]);
        renderLmStats();
        renderPredictor();
        lmEls.teachInput.focus();
        A.toast(t("lab.lmTeachForgot"), "🧹");
    }

    // ----- Typing, buttons and the slider -----
    function clearText() {
        stopAuto(false);
        lmEls.input.value = "";
        lm.starter = null;
        renderPredictor();
        lmEls.input.focus();
    }

    function useStarter(n) {
        stopAuto(false);
        lmEls.input.value = t("lab.lmStarter" + n) + " ";
        lm.starter = { n: n, text: lmEls.input.value };
        renderPredictor();
    }

    function onTemperature() {
        lm.temperature = A.util.clamp(Number(lmEls.temp.value) || 0, TEMPERATURE.min, TEMPERATURE.max);
        A.storage.set("lab.temperature", lm.temperature);
        // only the "chance to be picked" lines change
        if (lm.lastResult) {
            const chances = pickChances(lm.lastResult.list, lm.temperature);
            lmEls.items.forEach((item, i) => {
                if (lm.shown[i]) {
                    lm.shown[i].chance = chances[i];
                    item.querySelector(".lab-cand-pick").style.transform = "scaleX(" + (chances[i] || 0).toFixed(4) + ")";
                }
            });
        }
        updateTempOutput();
    }

    function setUpPredictor() {
        lmEls.temp.value = String(lm.temperature);
        lmEls.input.addEventListener("input", () => {
            stopAuto(false);
            if (lm.starter && !lmEls.input.value.startsWith(lm.starter.text)) lm.starter = null;
            renderPredictor();
        });
        lmEls.clear.addEventListener("click", clearText);
        $$(".lab-starter").forEach((button) => {
            button.addEventListener("click", () => useStarter(Number(button.getAttribute("data-starter"))));
        });
        lmEls.items.forEach((item, i) => {
            item.querySelector(".lab-cand").addEventListener("click", () => {
                const data = lm.shown[i];
                if (!data) return;
                stopAuto(false);
                insertWord(data.word);
            });
        });
        lmEls.auto.addEventListener("click", startAuto);
        lmEls.temp.addEventListener("input", onTemperature);
        lmEls.teachForm.addEventListener("submit", teachSentence);
        lmEls.forget.addEventListener("click", forgetSentences);
    }

    /* =========================================================
       9. TABS, CANVAS SIZES, LANGUAGE AND THEME
       ========================================================= */
    // The tab list, its two buttons and the two panels (findElements() finds them)
    let tabEls = null;

    // A ResizeObserver tells us when a canvas box changes size (all current browsers have one)
    const canWatchSizes = "ResizeObserver" in window;

    // Shows one tab. options.focus: move the keyboard focus to its button.
    // options.start: the call made while the lab is being built (it is not on screen
    // yet, so there is no fade-in). The canvases of a tab that appears are measured
    // by the size watcher, just before the browser paints.
    function selectTab(name, options) {
        const how = options || {};
        if (TABS.indexOf(name) < 0) name = "classifier";
        activeTab = name;
        tabEls.list.setAttribute("data-active", name);
        tabEls.buttons.forEach((button) => {
            const on = button.getAttribute("data-tab") === name;
            button.setAttribute("aria-selected", String(on));
            button.tabIndex = on ? 0 : -1;
            if (on && how.focus) button.focus();
        });
        tabEls.panels.forEach((panel) => {
            const on = panel.getAttribute("data-panel") === name;
            panel.hidden = !on;
            if (on && !how.start && A.motion.ok()) A.dom.replay(panel, "lab-panel-in");   // the fade-in plays again
        });
        if (name !== "predictor") stopAuto(false);
        A.storage.set("lab.tab", name);
        if (!how.start && !canWatchSizes) measureAll();
        schedule();
    }

    function setUpTabs() {
        const buttons = tabEls.buttons;
        buttons.forEach((button, index) => {
            button.addEventListener("click", () => selectTab(button.getAttribute("data-tab")));
            button.addEventListener("keydown", (event) => {
                let next = -1;
                if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
                else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = buttons.length - 1;
                if (next < 0) return;
                event.preventDefault();
                selectTab(buttons[next].getAttribute("data-tab"), { focus: true });
            });
        });
    }

    // ----- Canvas sizes follow their boxes -----
    // A canvas gets a new backing store (A.canvas.fit) when its box changes size,
    // or when the screen's pixel ratio changes.
    function measureAll() {
        const ratio = A.canvas.pixelRatio();
        // All sizes are read first: a canvas that gets a new size changes the layout,
        // and reading a size after that would make the browser lay out the page again
        const boardSize = board.el.clientWidth;
        const chartW = chart.wrap.clientWidth;
        const chartH = chart.wrap.clientHeight;
        const diagramW = diagram.wrap.clientWidth;
        const diagramH = diagram.wrap.clientHeight;
        let resized = false;

        if (boardSize && (boardSize !== board.size || ratio !== board.ratio)) {
            board.size = boardSize;
            board.ratio = ratio;
            board.ctx = A.canvas.fit(board.canvas, boardSize, boardSize);
            board.sprites = null;       // the dots are made again for the new size
            nn.dirty.board = true;
            resized = true;
        }

        if (chartW && (chartW !== chart.w || chartH !== chart.h || ratio !== chart.ratio)) {
            chart.w = chartW;
            chart.h = chartH;
            chart.ratio = ratio;
            chart.ctx = A.canvas.fit(chart.canvas, chartW, chartH);
            nn.dirty.chart = true;
            resized = true;
        }

        if (diagramW && (diagramW !== diagram.w || diagramH !== diagram.h || ratio !== diagram.ratio)) {
            diagram.w = diagramW;
            diagram.h = diagramH;
            diagram.ratio = ratio;
            diagram.ctx = A.canvas.fit(diagram.canvas, diagramW, diagramH);
            nn.dirty.diagram = true;
            resized = true;
        }

        // A canvas with a new size is blank until it is drawn again. Near the screen it
        // is drawn right here: the size watcher runs just before the browser paints,
        // so the blank canvas is never shown. (Far away it waits until the lab comes near.)
        if (resized && labNear) redraw(performance.now(), true);
        schedule();
    }

    // ----- Pause when the lab is off screen or the browser tab is hidden -----
    // A.whenVisible also pauses the lab's CSS animations while nobody can see them.
    function onLabVisible(visible) {
        labVisible = visible;
        // A hidden browser tab stops auto-write (nobody would see it type)
        if (document.hidden) stopAuto(false);
        // The first time you scroll to the lab, the network starts learning by itself
        if (visible && !nn.autoStarted) {
            nn.autoStarted = true;
            if (A.motion.ok() && activeTab === "classifier" && nn.points.length && nn.epoch === 0) setTraining(true);
        }
        schedule();
    }

    // ----- Work only near the screen -----
    // The canvases are drawn, and the texts follow a new language, only while the lab
    // is within half a screen of the window. Far away, a theme or language switch
    // costs nothing: the lab catches up as soon as it comes near.
    function onLabNear(near) {
        labNear = near;
        if (!near) return;
        if (languageStale) refreshLanguage();
        schedule();
    }

    // A jump straight to the lab (a menu link with animations off) shows it before
    // the watchers above hear about it. The page's scroll step tells us earlier,
    // just before the browser paints, so the lab measures and draws itself right there
    // (it may have been built a moment ago, by the jump itself).
    function sectionReached(section) {
        if (section.id !== "lab" || labNear) return;
        onLabNear(true);
        measureAll();
        redraw(performance.now(), true);
    }

    // ----- Theme: the canvases get the new colours -----
    // The colours are read again at the next drawing, not in the middle of the switch.
    function themeChanged() {
        colors = null;
        board.sprites = null;
        nn.dirty.maps = true;
        nn.dirty.board = true;
        nn.dirty.diagram = true;
        nn.dirty.chart = true;
        schedule();
    }

    // ----- Language: update the text that JavaScript writes, keep everything else -----
    // Learning-rate numbers in the style of the language ("0.03" or "0,03")
    function updateLrLabels() {
        Array.prototype.forEach.call(nnEls.lr.options, (option) => {
            const value = Number(option.value);
            const digits = value < 1 ? option.value.split(".")[1].length : 0;
            option.textContent = A.format.number(value, digits);
        });
    }

    function refreshTexts() {
        updateLrLabels();
        updateTrainButton();
        updateAutoButton();
        lmEls.autoHint.textContent = t("lab.lmAutoLabel", { n: AUTO_WORDS });
        updateDiagramLabel();
        updateStats();
        renderLmStats();
        updateTempOutput();
        nn.dirty.diagram = true;
        nn.dirty.board = true;
        schedule();
    }

    // The predictor switches to the sentences of the new language (and your own ones in it).
    // If the text is exactly a starter, it becomes the same starter in the new language.
    // Anything you wrote or picked yourself stays as it is.
    function refreshLanguage() {
        languageStale = false;
        const keepStarter = lm.starter && lmEls.input.value.trim() === lm.starter.text.trim();
        loadModel();
        if (keepStarter) {
            lmEls.input.value = t("lab.lmStarter" + lm.starter.n) + " ";
            lm.starter.text = lmEls.input.value;
        } else {
            lm.starter = null;
        }
        refreshTexts();
        renderPredictor();
    }

    // Core has already translated every data-i18n text: the lab only redoes what its
    // JavaScript writes, and far from the screen that waits until the lab comes near.
    function languageChanged() {
        stopAuto(false);     // the model must not go on writing in the old language
        if (labNear) refreshLanguage();
        else languageStale = true;
    }

    /* =========================================================
       10. BUILDING THE LAB
       The lab sits about three screens down the page, so its HTML is made
       only when it is needed: when it comes near the screen, when the browser
       has a quiet moment after the page loaded, or when something opens it
       (AICompass.lab.open, a command, a #lab link).
       ========================================================= */
    // Finds the elements the code works with, once the HTML is made
    function findElements() {
        labCard = $(".lab");
        board.el = $(".lab-board");
        board.canvas = $(".lab-board-canvas");
        board.readout = $(".lab-readout");
        chart.wrap = $(".lab-chart-wrap");
        chart.canvas = $(".lab-chart-canvas");
        diagram.wrap = $(".lab-diagram-wrap");
        diagram.canvas = $(".lab-diagram-canvas");
        nnEls = {
            live: $('[data-live="nn"]'),
            train: $(".lab-train"),
            epoch: $('[data-stat="epoch"]'),
            loss: $('[data-stat="loss"]'),
            acc: $('[data-stat="acc"]'),
            accBar: $('[data-stat="accbar"]'),
            points: $('[data-stat="points"]'),
            split: $('[data-stat="split"]'),
            status: $(".lab-status"),
            statusText: $(".lab-status-text"),
            lr: $("#lab-lr"),
            opt: $("#lab-opt"),
            neurons: $("#lab-neurons"),
            layer: $(".lab-switch")
        };
        lmEls = {
            input: $("#lab-lm-input"),
            clear: $(".lab-lm-clear"),
            mode: $('[data-lm="mode"]'),
            context: $('[data-lm="context"]'),
            tokens: $('[data-lm="tokens"]'),
            notice: $(".lab-lm-notice"),
            items: $$(".lab-cand-item"),
            auto: $(".lab-auto"),
            temp: $("#lab-temp"),
            tempOut: $('[data-out="temp"]'),
            teachForm: $(".lab-teach"),
            teachInput: $("#lab-teach-input"),
            teachStatus: $(".lab-teach-status"),
            forget: $('[data-action="forget"]'),
            live: $('[data-live="lm"]'),
            field: $(".lab-lm-field"),
            autoHint: $("#lab-auto-hint")
        };
        tabEls = { list: $(".lab-tabs"), buttons: $$(".lab-tab"), panels: $$(".lab-panel") };
    }

    function build() {
        mount.removeAttribute("data-lab-tab");   // only the empty mount needs it (see below)
        mount.innerHTML = labHTML();
        findElements();
        // The HTML has empty text holders: they are filled in this once
        // (after that, core keeps them in the right language)
        A.applyTranslations(labCard);
        setUpBoard();
        setUpControls();
        setUpPredictor();
        setUpTabs();

        // What the lab shows first (the canvases are drawn when it comes near the screen)
        loadModel();
        markPreset("circle");
        pointsChanged();
        scoreDots();          // the loss and the accuracy are shown before the first drawing
        updateDiagramLabel();
        refreshTexts();
        renderPredictor();
        selectTab(A.storage.get("lab.tab", "classifier"), { start: true });

        // Canvas sizes follow their boxes and the screen's pixel ratio
        if (canWatchSizes) {
            const resizer = new ResizeObserver(measureAll);
            [board.el, chart.wrap, diagram.wrap].forEach((element) => resizer.observe(element));
        } else {
            A.onResize(measureAll);
        }
        // The pixel ratio changes when the window moves to a screen with sharper pixels.
        // No box changes size then, so the size watcher misses it (audit LE-12).
        A.onPixelRatioChange(measureAll);
        // On screen or not, near or far, theme and language
        A.whenVisible(labCard, onLabVisible, { threshold: ON_SCREEN, pauseAnimations: true });
        A.whenVisible(labCard, onLabNear, { rootMargin: NEAR_MARGIN });
        A.onSection(sectionReached);
        A.onThemeChange(themeChanged);
        A.onLanguageChange(languageChanged);
    }

    // Until it is built, the empty mount keeps about the height of the tab the lab will
    // open on (lab.css), so the page below doesn't jump when the lab fills in
    mount.setAttribute("data-lab-tab", A.storage.get("lab.tab", "classifier"));

    // The toolkit calls build() when the lab is needed; ensure() builds it at once if it is not built yet
    const ensure = A.whenNeeded(mount, build);

    /* =========================================================
       11. COMMANDS AND AICompass.lab (what other features use)
       ========================================================= */
    // Opens the lab on one of its tabs and scrolls to it (it is built first if needed)
    function openLab(tab) {
        ensure();
        selectTab(tab === "predictor" ? "predictor" : "classifier");
        A.navigate("lab");
    }

    // Two Ctrl+K palette commands
    A.registerCommand({
        id: "lab-classifier",
        group: "lab.cmdGroup",
        icon: "🧠",
        title: function () { return t("lab.cmdNN"); },
        keywords: "lab neural network train teach classifier dots points machine learning лаборатория нейросеть нейронная сеть обучить обучение машина точки классификатор",
        run: function () { openLab("classifier"); }
    });

    A.registerCommand({
        id: "lab-predictor",
        group: "lab.cmdGroup",
        icon: "💬",
        title: function () { return t("lab.cmdLM"); },
        keywords: "lab next word predictor language model chatbot text autocomplete gpt лаборатория следующее слово предсказатель языковая модель чат-бот текст автодополнение",
        run: function () { openLab("predictor"); }
    });

    // AICompass.lab.open("classifier" | "predictor"); AICompass.openLab is the older name
    A.feature("lab", { open: openLab });
    A.openLab = openLab;

})();
