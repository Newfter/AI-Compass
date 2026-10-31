/* =========================================================
   AI COMPASS — AI LAB EXPERIMENT: "TEACH THE MACHINE"
   A tiny neural network, built from scratch (no libraries), that
   learns live in your browser to tell two kinds of dots apart.
   Place the dots (or pick an example), press Train, and watch the
   boundary bend, the loss fall and every neuron change.

   The lab hub (js/lab.js) loads this file when the experiment opens,
   after the lab kit and js/content/lab/classifier.js (every text, in
   English and Russian). The file registers the experiment with
   AICompass.lab.define("classifier", { create }) (the last section).
   create(stage, hub) builds it in the hub's stage and returns its
   controller; the hub then calls pause() and resume() (off screen,
   hidden browser tab), language(), theme() and destroy().

   Between two openings (on the same visit) it keeps the dots, the
   network, the Undo steps and the loss chart. Your settings are saved
   as "lab.nn". Progress events (through the hub): "lab.use" when
   training starts, "lab.milestone" { kind: "learned", epochs } when
   the network has learned.

   Sections of this file:
    1. Settings                   5. Drawing
    2. Small helpers              6. Controls, stats and the animation loop
    3. The experiment's HTML      7. Canvas sizes, theme and language
    4. The maths                  8. Opening and closing: AICompass.lab.define
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lab || !A.lab.define) return;

    const t = A.t;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
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

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    // The experiment's own element (".lab-nn", made by create()): everything it
    // touches is inside it. null while the experiment is closed.
    let root = null;

    // Shortcuts to elements inside the experiment
    function $(selector) {
        return root.querySelector(selector);
    }

    function $$(selector) {
        return Array.prototype.slice.call(root.querySelectorAll(selector));
    }

    // The filled part of a slider: .ui-range (css/components.css) colours the line from the start up to --fill
    function updateRangeFill(range) {
        const min = Number(range.min);
        const max = Number(range.max);
        range.style.setProperty("--fill", (((Number(range.value) - min) / (max - min)) * 100).toFixed(1) + "%");
    }

    // A random number with a bell-curve shape (for natural-looking clusters)
    function randomNormal() {
        let u = 0;
        while (u === 0) u = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
    }

    /* =========================================================
       3. THE EXPERIMENT'S HTML
       ========================================================= */
    // Small pictures for the buttons and the example chips
    const icons = {
        play: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
        pause: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>',
        step: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 5.5v13l9-6.5z" fill="currentColor"/><rect x="16" y="5.5" width="2.6" height="13" rx="1" fill="currentColor"/></svg>',
        reset: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.1-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4.5 3.5v4.5H9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        undo: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 7H4.5V2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 7a8 8 0 1 1-1 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
        trash: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        clusters: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="7" cy="8" r="2.2" class="lab-ic-a"/><circle cx="9.5" cy="5" r="1.6" class="lab-ic-a"/><circle cx="17" cy="16" r="2.2" class="lab-ic-b"/><circle cx="14.5" cy="19" r="1.6" class="lab-ic-b"/></svg>',
        circle: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" class="lab-ic-b-stroke" stroke-width="2.4" stroke-dasharray="3 2.6"/><circle cx="12" cy="12" r="3" class="lab-ic-a"/></svg>',
        xor: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2" class="lab-ic-a"/><rect x="13" y="13" width="8" height="8" rx="2" class="lab-ic-a"/><rect x="13" y="3" width="8" height="8" rx="2" class="lab-ic-b"/><rect x="3" y="13" width="8" height="8" rx="2" class="lab-ic-b"/></svg>',
        spiral: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 12c0-1.5 2-1.5 2 0s-1.6 3-3.5 3S7 13 7 11s2-5 5-5 6 2 6 6-3 7.5-7 7.5" fill="none" class="lab-ic-a-stroke" stroke-width="2.2" stroke-linecap="round"/></svg>'
    };

    // The whole experiment. create() puts it in the hub's stage, and its empty
    // data-i18n holders get their texts at that moment.
    function classifierHTML() {
        // The visible text ("0.03" or "0,03") is written by updateLrLabels()
        const lrOptions = LR_OPTIONS.map((value) => '<option value="' + value + '"></option>').join("");

        const steps = [1, 2, 3, 4].map((n) =>
            '<li class="lab-step-card">' +
                '<span class="lab-step-num mono" aria-hidden="true">0' + n + '</span>' +
                '<h5 data-i18n="lab.explain' + n + 'Title"></h5>' +
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
                    '<span class="lab-board-corners ui-corners" aria-hidden="true"></span>' +
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
                            '<input type="range" id="lab-neurons" class="lab-range ui-range" min="' + MIN_NEURONS + '" max="' + MAX_NEURONS + '" step="1" value="' + DEFAULT_SETTINGS.hidden + '" aria-describedby="lab-neurons-hint">' +
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
                            '<button type="button" class="lab-switch ui-switch" role="switch" aria-checked="false" aria-describedby="lab-layer-hint">' +
                                '<span class="lab-switch-track ui-switch-track" aria-hidden="true"><span class="lab-switch-knob ui-switch-knob"></span></span>' +
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
                '<h4 class="lab-explain-title" id="lab-explain-nn"><span class="lab-explain-icon" aria-hidden="true">?</span><span data-i18n="lab.explainTitle"></span></h4>' +
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
    /* =========================================================
       4. THE MATHS
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
    function trainStep() {
        const loss = computeGradients(nn.net, nn.points);
        if (loss === null) return null;
        applyGradients(nn.net, nn.points.length);
        nn.epoch++;

        // Safety net: if numbers ever explode, start again with fresh weights
        if (!isFinite(loss)) {
            nn.net = createNetwork();
            return null;
        }
        recordLoss(loss);
        return loss;
    }

    // Backpropagation. For one dot with answer y (0 or 1) and guess p:
    // loss = -log(p) if y = 1, -log(1 - p) if y = 0. It returns the average loss over
    // all the dots (null when there are none), and leaves in every layer's gW and gb
    // the SUM of the gradients over the dots (applyGradients divides by their number).
    function computeGradients(net, points) {
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

        return loss / points.length;
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
        net: null,               // the network (made at the first opening, see firstOpening)
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
        preset: null,            // the example on the board (its chip is lit), or null
        autoStarted: false,      // it started learning by itself once (see autoStart)
        announceFrame: 0,        // the frames booked to read the numbers out after Step
        // What must be worked out or drawn again at the next frame
        dirty: { net: true, maps: true, board: true, diagram: true, chart: true, stats: true }
    };

    // The first opening starts with a fresh network and the circle example: you can watch
    // the line bend into a ring in a few seconds. (It is made here, not when the file loads,
    // in the same order as always: first the network's random weights, then the dots.)
    function firstOpening() {
        if (nn.net) return;
        nn.net = createNetwork();
        nn.points = makePreset("circle");
        nn.preset = "circle";
    }

    // The first time you see the network, it starts learning by itself (unless
    // animations are off): the line bends into a ring before your eyes. Once per visit.
    function autoStart() {
        if (nn.autoStarted || paused || !hub || !hub.visible()) return;
        nn.autoStarted = true;
        if (A.motion.ok() && nn.points.length && nn.epoch === 0) setTraining(true);
    }

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
       5. DRAWING
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
        canvas: null,
        ctx: null,
        image: null,
        probs: new Float32Array(GRID * GRID),
        segments: []
    };

    // All the neurons' small maps, side by side in one canvas (one column per neuron)
    const atlas = { canvas: null, ctx: null, image: null, columns: 0 };

    // The two small canvases above are made once, at the first opening
    function makeOffscreenCanvases() {
        if (heat.canvas) return;
        heat.canvas = document.createElement("canvas");
        heat.canvas.width = GRID;
        heat.canvas.height = GRID;
        heat.ctx = heat.canvas.getContext("2d");
        heat.image = heat.ctx.createImageData(GRID, GRID);
        atlas.canvas = document.createElement("canvas");
        atlas.ctx = atlas.canvas.getContext("2d");
    }

    // The three canvases on the page (findElements() fills in their elements when the
    // experiment opens). "ratio" is the pixel ratio their backing store was made for, and
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

        $(".lab-chart-empty").hidden = values.length > 1;
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

        // Labels (11px: the smallest text the lab draws on a canvas; it was 10px)
        ctx.font = "600 11px " + colors.mono;
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
       6. CONTROLS, STATS AND THE ANIMATION LOOP
       ========================================================= */
    // The classifier's buttons, settings and numbers (findElements() finds them)
    let nnEls = null;

    let hub = null;              // what the hub gave this opening: track(), announce()... (see create)
    let paused = false;          // the hub said pause(): off screen, or the browser tab is hidden
    let frame = 0;               // the animation frame that is booked (0: none)

    // Training runs only while you can see it
    function wantsTraining() {
        return nn.training && !paused;
    }

    // Books one animation frame (asking twice before it runs books it once).
    // While paused nothing is booked: resume() books one.
    function schedule() {
        if (!frame && !paused && root) frame = requestAnimationFrame(tick);
    }

    // The animation loop: train a little, then redraw whatever changed
    function tick(now) {
        frame = 0;
        if (paused || !root) {
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
        root.classList.toggle("is-training", nn.training);
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
        hub.track("milestone", { kind: "learned", epochs: nn.epoch });
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
        if (on) hub.track("use");
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
        nn.preset = name;
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
        // read out the new numbers once they are calculated (two frames later)
        cancelAnimationFrame(nn.announceFrame);
        nn.announceFrame = requestAnimationFrame(() => {
            nn.announceFrame = requestAnimationFrame(() => {
                nn.announceFrame = 0;
                announceStats();
            });
        });
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
       7. CANVAS SIZES, THEME AND LANGUAGE
       ========================================================= */
    // A ResizeObserver tells us when a canvas box changes size (all current browsers have one)
    const canWatchSizes = "ResizeObserver" in window;

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

        // A canvas with a new size is blank until it is drawn again. It is drawn right
        // here: the size watcher runs just before the browser paints, so the blank canvas
        // is never shown. (While paused it waits until resume().)
        if (resized && !paused) redraw(performance.now(), true);
        schedule();
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

    // The texts that JavaScript writes (core has translated every data-i18n text already)
    function refreshTexts() {
        // An old message must not stay behind in the old language, not even one on its way
        // (core writes a message 80 ms after it is said): this cancels it and empties the line
        A.announce("", { region: nnEls.live, delay: 0 });
        updateLrLabels();
        updateTrainButton();
        updateDiagramLabel();
        updateStats();
        nn.dirty.diagram = true;     // the diagram's labels and the board's read-out are drawn
        nn.dirty.board = true;
        schedule();
    }

    /* =========================================================
       8. OPENING AND CLOSING: AICompass.lab.define
       The hub calls create() each time the experiment opens, and the
       controller's destroy() when it closes. The dots, the network and
       the loss chart stay in this file's memory in between.
       ========================================================= */
    let resizer = null;          // the ResizeObserver that watches the canvas boxes
    let stopResize = null;       // (browsers without one: A.onResize)
    let stopRatio = null;        // stops A.onPixelRatioChange

    function findElements() {
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
    }

    // Builds the experiment in the hub's stage (an empty element) and returns its controller
    function create(stage, context) {
        hub = context;
        paused = false;
        firstOpening();
        makeOffscreenCanvases();
        stage.innerHTML = classifierHTML();
        root = stage.firstElementChild;
        findElements();
        // The HTML has empty text holders: they are filled in this once
        // (after that, core keeps them in the right language)
        A.applyTranslations(root);
        setUpBoard();
        setUpControls();

        // What it shows: the first opening's example, or what you left last time.
        // Nothing runs until you press Train (also when it was training when it closed),
        // except the very first time (autoStart, at the end).
        nn.training = false;
        selectClass(nn.selected);
        markPreset(nn.preset);
        $(".lab-board-empty").hidden = nn.points.length > 0;
        updateEditButtons();
        scoreDots();          // the loss and the accuracy are shown before the first drawing
        Object.keys(nn.dirty).forEach((part) => { nn.dirty[part] = true; });
        refreshTexts();

        // Canvas sizes follow their boxes and the screen's pixel ratio
        if (canWatchSizes) {
            resizer = new ResizeObserver(measureAll);
            [board.el, chart.wrap, diagram.wrap].forEach((element) => resizer.observe(element));
        } else {
            stopResize = A.onResize(measureAll);
            measureAll();
        }
        // The pixel ratio changes when the window moves to a screen with sharper pixels.
        // No box changes size then, so the size watcher misses it.
        stopRatio = A.onPixelRatioChange(measureAll);
        autoStart();

        return {
            pause: pause,
            resume: resume,
            language: refreshTexts,
            theme: themeChanged,
            destroy: destroy
        };
    }

    // Off screen or a hidden browser tab: nothing runs (training goes on after resume)
    function pause() {
        paused = true;
        cancelAnimationFrame(frame);
        frame = 0;
        cancelAnimationFrame(nn.announceFrame);
        nn.announceFrame = 0;
        clearTimeout(nn.touchTimer);
        if (nn.hover && nn.hover.touch) nn.hover = null;    // the guess shown after a tap ends early
        nn.lastTick = 0;
    }

    function resume() {
        paused = false;
        nn.dirty.board = true;
        schedule();
        autoStart();
    }

    // Closing: stop everything. The hub empties the stage afterwards.
    function destroy() {
        pause();
        if (resizer) resizer.disconnect();
        if (stopResize) stopResize();
        if (stopRatio) stopRatio();
        resizer = null;
        stopResize = null;
        stopRatio = null;
        // The next opening starts paused (nothing runs until you press Train)
        nn.training = false;
        nn.hover = null;
        nn.cursor = null;
        nn.stroke = null;
        nn.tap = null;
        nn.stepBudget = 0;
        // The elements go away with the stage: forget them
        root = null;
        nnEls = null;
        hub = null;
        board.el = board.canvas = board.readout = board.ctx = board.sprites = null;
        board.size = board.ratio = 0;
        chart.wrap = chart.canvas = chart.ctx = null;
        chart.w = chart.h = chart.ratio = 0;
        diagram.wrap = diagram.canvas = diagram.ctx = null;
        diagram.w = diagram.h = diagram.ratio = 0;
        colors = null;
    }

    A.lab.define("classifier", {
        create: create,
        // The pure maths, for the checks in Node (the page doesn't use this)
        maths: {
            settings: settings,
            createNetwork: createNetwork,
            countParams: countParams,
            forward: forward,
            computeGradients: computeGradients,
            applyGradients: applyGradients,
            makePreset: makePreset,
            contour: contour
        }
    });
})();
