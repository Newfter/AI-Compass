/* =========================================================
   AI COMPASS — LAB: DOWN THE HILL (gradient descent)
   How models learn: by walking downhill on their error. Each landscape
   is the error (the "loss") of a tiny model that has only two numbers,
   x and y: the height of the ground at (x, y) is how wrong the model
   is with those numbers. Up to three balls race downhill, each with its
   own way of stepping (plain gradient descent, momentum or Adam) and
   its own step size (the learning rate). The gradient points uphill,
   so every step goes the other way:
       new = old − learning rate × gradient
   Real neural networks do the same with millions of numbers.
   Its tests: dev/tests/descent.test.js (the page) and
   dev/tests/descent.math.js (the maths, in Node).

   Sections:
    1. Settings
    2. Small helpers
    3. The landscapes: six hills and their exact gradients
    4. Taking steps: the three optimizers and the rules of a race
    5. Contour lines (marching squares)
    6. Drawing the map
    7. Drawing the 3-D view
    8. The experiment (A.lab.define)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lab || !A.lab.define) return;

    const t = A.t;
    const kit = A.labKit;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
    // ----- A race -----
    const BALLS = 3;                         // up to three balls race at once
    const MAX_STEPS = 4000;                  // a ball that is still moving stops here ("out of steps")
    const ARRIVE_GRADIENT = 1e-3;            // "arrived": the gradient is shorter than this...
    const ARRIVE_STEP = 1e-4;                // ...and the last step was shorter than this
    const LOWEST_RADIUS = 0.05;              // a stop this close to a lowest point counts as the lowest point
    const EXPLODE_SCALE = 5;                 // "exploded": farther from the map's centre than 5 times its half-width
    const NOISE_SEED = 1717;                 // the noise of a race (ball i uses NOISE_SEED + i): the same every time
    // With noisy gradients a ball never stops: it jiggles. It has "settled" when its smoothed place
    // (each step it moves 5% of the way to the ball) stays within 0.15 for 100 steps.
    const SETTLE = { smooth: 0.05, radius: 0.15, steps: 100 };
    const LEAVE_SADDLE = 0.5;                // challenge 4: a stuck ball must get this far from the flat spot
    const NEWTON = { steps: 30, reach: 0.6 }; // finding the exact flat point near a stop (section 3)

    // ----- The optimizers (the update rules are in section 4) -----
    const MOMENTUM = 0.9;                    // how much of its speed a momentum ball keeps each step
    const ADAM = { beta1: 0.9, beta2: 0.999, epsilon: 1e-8 };
    const OPTIMIZERS = ["gd", "momentum", "adam"];

    // ----- Controls -----
    const RATE = { min: 0.0001, max: 2, perDecade: 10 };   // learning rate: a log slider, 10 positions per power of ten
    const SPEED = { watch: 20, fast: 500 };  // steps per second
    const DEFAULT_LANDSCAPE = "bowl";
    const SAVE_VERSION = 1;                  // ctx.store "settings" = { v: 1, landscape, view, speed, start, balls }

    // ----- The look -----
    const BALL_COLORS = [2, 3, 4];           // kit series colours (mint, pink, gold): they stand out on the
                                             // map's violet-to-cyan heights in both themes
    const BALL_SHAPES = ["dot", "square", "triangle"];   // a second clue next to the colour...
    const TRAIL_DASHES = [[], [7, 5], [1, 5]];           // ...and solid, dashed and dotted trails: where two
                                                         // trails overlap, the first shows through the gaps
    const BALL_RADIUS = 6.5;                 // px
    const MAP_PAD = 10;                      // px around the map
    const FILL_PX = 3;                       // the height colours: one sample every 3 px (smoothed when drawn)
    const GRID_PX = 4;                       // the contour lines: a grid cell every 4 px
    const CONTOUR_LEVELS = 12;               // contour lines at 12 evenly spaced heights...
    const STRONG_EVERY = 4;                  // ...every 4th one a little stronger, like on a hiking map
    const RANGE_SAMPLES = 64;                // the highest point of a map is looked for on a 64 x 64 grid
    const DOTS_UP_TO = 80;                   // a trail shows a dot at each of its first 80 steps
    const ARROW = { min: 22, max: 84 };      // px: the downhill arrow's length on screen
    const KEY_MOVE = 1 / 40;                 // arrow keys move the start by 1/40 of the map (Shift: 5 times more)
    const BURST_MS = 650;                    // the little burst when a ball explodes (not in calm mode)
    const HUGE = 1e6;                        // from here on, numbers are written as powers of ten

    // ----- The 3-D view -----
    const MESH = 48;                         // the surface: 48 x 48 tiles
    const VIEW_3D = {
        yaw: -32,                            // degrees: how far it is turned around the vertical axis
        tilt: 38,                            // degrees: how steeply the camera looks down (90 = from above)
        minTilt: 12,
        maxTilt: 90,
        keyTurn: 10,                         // degrees per arrow key press
        keyTilt: 5,
        dragTurn: 0.45,                      // degrees per pixel dragged
        dragTilt: 0.3,
        height: 0.9,                         // the surface's height, in map widths (the map is 2 wide)
        fill: 0.9                            // how much of the canvas the surface may fill
    };
    const LIGHT = [-0.45, 0.55, 0.7];        // where the light comes from (across, up the map, up)
    const AMBIENT = 0.42;                    // a tile facing away from the light still gets this much
    const TRAIL_POINTS_3D = 600;             // a long trail is drawn through at most this many points in 3-D

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    function el(tag, className) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        return element;
    }

    function finite(value) {
        return typeof value === "number" && isFinite(value);
    }

    // A learning rate as the slider shows it, with 2 significant digits (0.019953 -> 0.02):
    // the maths uses exactly the number on the screen
    function niceRate(value) {
        return Number(Number(value).toPrecision(2));
    }

    // A number for the screen, the kit's way ("0.0042", "4.2×10⁻⁵"). TODO(kit): kit.number for
    // big numbers. A huge one (an exploded ball's loss) is a power of ten too ("2.3×10¹⁴"),
    // and one that is no number at all is "∞".
    const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";

    function num(value) {
        if (!finite(value)) return "∞";
        const size = Math.abs(value);
        if (size < HUGE) return kit.number(value);
        let power = Math.floor(Math.log10(size));          // 2.3e14 -> 14
        let mantissa = Number((size / Math.pow(10, power)).toFixed(1));
        if (mantissa >= 10) {               // 9.97 rounds up to 10.0: that is 1.0 of the next power
            mantissa = 1;
            power += 1;
        }
        const exponent = String(power).split("").map(function (digit) { return SUPERSCRIPT[Number(digit)]; }).join("");
        return (value < 0 ? "−" : "") + A.format.number(mantissa, { maxDigits: 1 }) + "×10" + exponent;
    }

    // A point: "(1.5, −0.8)" in English, "(1,5; −0,8)" in Russian (its decimal mark is a comma)
    function pair(x, y) {
        return t("lab.descent.pair", { x: num(x), y: num(y) });
    }

    function ballName(index) {
        return t("lab.descent.ball", { n: index + 1 });
    }

    // TODO(kit): kit.sentence(key, links). Fills the {placeholders} of a text with elements
    // (kit.termLink), so a sentence can hold glossary links in both languages.
    function fillSentence(element, key, links) {
        element.textContent = "";
        String(t(key)).split(/(\{[a-z]+\})/).forEach(function (part) {
            const name = /^\{([a-z]+)\}$/.exec(part);
            if (name && links[name[1]]) element.appendChild(links[name[1]]());
            else if (part) element.appendChild(document.createTextNode(part));
        });
    }

    // TODO(kit): kit.swatch(shape, color), the legend's little shape on its own. The ball's mark
    // in its card: the same colour and shape as on the map (decorative: the name says it).
    const MARKS = {
        dot: '<circle cx="8" cy="8" r="5.5"/>',
        square: '<rect x="3" y="3" width="10" height="10" rx="1.5"/>',
        triangle: '<path d="M8 2.2 14 13H2z"/>'
    };

    function markSVG(shape) {
        return '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false">' + MARKS[shape] + "</svg>";
    }

    // The marks of the map, for the line under it: the start, a lowest point, another dip,
    // a flat spot (the same pictures as on the canvas; decorative, the words say it)
    const MAP_MARKS = {
        start: '<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="2"/>',
        lowest: '<path d="M8 1.6 9.7 6 14.1 6.1 10.6 8.9 11.9 13.4 8 10.8 4.1 13.4 5.4 8.9 1.9 6.1 6.3 6z" fill="currentColor"/>',
        dip: '<path d="M8 1.6 9.7 6 14.1 6.1 10.6 8.9 11.9 13.4 8 10.8 4.1 13.4 5.4 8.9 1.9 6.1 6.3 6z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
        saddle: '<path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        arrow: '<path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    };

    function mapMarkSVG(name) {
        return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">' + MAP_MARKS[name] + "</svg>";
    }

    // The icon of "Start on the ridge": a saddle-shaped line with a ball on top
    const RIDGE_ICON = '<svg class="lk-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
        '<path d="M3 17c3-5 6-7 9-7s6 2 9 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="12" cy="6.5" r="2.6" fill="currentColor"/></svg>';

    /* =========================================================
       3. THE LANDSCAPES
       Each one: its height f(x, y) (the loss), its exact gradient
       grad(x, y) = [∂f/∂x, ∂f/∂y] worked out by hand, the part of the
       (x, y) plane the map shows, its lowest points (and other dips),
       how its colours follow the height, and how strong the noise of
       "Noisy gradients" is there (about the size of a typical slope).
       Their names and texts are in js/content/lab/descent.js.
       ========================================================= */
    const LANDSCAPES = [
        {
            // A round bowl. Plain descent multiplies x and y by (1 − 2 × rate) at every step:
            // above a rate of 1 that factor is below −1, and the ball flies out.
            id: "bowl",
            f: function (x, y) { return x * x + y * y; },
            grad: function (x, y) { return [2 * x, 2 * y]; },
            domain: { x: [-2, 2], y: [-2, 2] },
            minima: [{ x: 0, y: 0, lowest: true }],
            colour: { top: 8 },
            noise: 1
        },
        {
            // A long valley, 20 times steeper across (y) than along (x). Plain descent must keep
            // its steps small for the steep walls (above 0.05 it zigzags, above 0.1 it flies out),
            // so it crawls along the floor; momentum builds up speed along it.
            id: "valley",
            f: function (x, y) { return 0.5 * (x * x + 20 * y * y); },
            grad: function (x, y) { return [x, 20 * y]; },
            domain: { x: [-3, 3], y: [-3, 3] },
            minima: [{ x: 0, y: 0, lowest: true }],
            colour: { top: 20 },
            noise: 1
        },
        {
            // Rosenbrock's "banana": a curved, very flat valley with steep sides. Its heights go
            // from 0 to about 2,500, so its colours and lines follow log(1 + height).
            id: "banana",
            f: function (x, y) { return (1 - x) * (1 - x) + 100 * (y - x * x) * (y - x * x); },
            grad: function (x, y) { return [-2 * (1 - x) - 400 * x * (y - x * x), 200 * (y - x * x)]; },
            domain: { x: [-2, 2], y: [-1, 3] },
            minima: [{ x: 1, y: 1, lowest: true }],
            colour: { log: true },
            noise: 2
        },
        {
            // A wide bowl with two dips in it: a deep one and a shallower one (a local minimum).
            // Both were found with Newton's method (dev/tests/descent.math.js checks them).
            id: "valleys",
            f: function (x, y) {
                return 0.08 * (x * x + y * y) - 2 * Math.exp(-((x - 1.6) * (x - 1.6) + (y - 0.4) * (y - 0.4)) / 0.8) -
                    1.4 * Math.exp(-((x + 1.5) * (x + 1.5) + (y + 0.6) * (y + 0.6)) / 0.6);
            },
            grad: function (x, y) {
                const deep = Math.exp(-((x - 1.6) * (x - 1.6) + (y - 0.4) * (y - 0.4)) / 0.8);
                const shallow = Math.exp(-((x + 1.5) * (x + 1.5) + (y + 0.6) * (y + 0.6)) / 0.6);
                // d/dx of −A·e^(−r²/s) is (2A(x − a)/s)·e^(−r²/s), and the same for y
                return [
                    0.16 * x + (4 * (x - 1.6) / 0.8) * deep + (2.8 * (x + 1.5) / 0.6) * shallow,
                    0.16 * y + (4 * (y - 0.4) / 0.8) * deep + (2.8 * (y + 0.6) / 0.6) * shallow
                ];
            },
            domain: { x: [-3, 3], y: [-3, 3] },
            minima: [
                { x: 1.55022909074857, y: 0.387557265280609, lowest: true },
                { x: -1.45003517000145, y: -0.580014737925300, lowest: false }
            ],
            colour: {},
            noise: 0.8
        },
        {
            // A saddle at (0, 0): downhill along y, uphill along x. On the ridge y = 0 the
            // gradient has no y part, so plain descent slides to the flat spot and stops.
            // The two lowest points are at (0, ±√5), where −y + 0.2y³ = 0.
            id: "saddle",
            f: function (x, y) { return 0.5 * x * x - 0.5 * y * y + 0.05 * y * y * y * y; },
            grad: function (x, y) { return [x, -y + 0.2 * y * y * y]; },
            domain: { x: [-3, 3], y: [-3, 3] },
            minima: [{ x: 0, y: Math.sqrt(5), lowest: true }, { x: 0, y: -Math.sqrt(5), lowest: true }],
            saddles: [{ x: 0, y: 0 }],
            colour: {},
            noise: 0.4
        },
        {
            // A bowl covered in small bumps: many little dips around the real lowest point (0, 0)
            id: "bumpy",
            f: function (x, y) { return 0.1 * (x * x + y * y) + 0.5 * (1 - Math.cos(3 * x) * Math.cos(3 * y)); },
            grad: function (x, y) {
                return [0.2 * x + 1.5 * Math.sin(3 * x) * Math.cos(3 * y), 0.2 * y + 1.5 * Math.cos(3 * x) * Math.sin(3 * y)];
            },
            domain: { x: [-3, 3], y: [-3, 3] },
            minima: [{ x: 0, y: 0, lowest: true }],
            colour: {},
            noise: 1.5
        }
    ];

    function landscape(id) {
        for (let i = 0; i < LANDSCAPES.length; i++) {
            if (LANDSCAPES[i].id === id) return LANDSCAPES[i];
        }
        return null;
    }

    // ----- Heights as colours -----
    // The lowest height of a landscape, and the height that gets the strongest colour
    // (colour.top, or the highest point of the map). Worked out once per landscape.
    const ranges = {};

    function heightRange(land) {
        if (ranges[land.id]) return ranges[land.id];
        let low = Infinity;
        land.minima.forEach(function (point) { low = Math.min(low, land.f(point.x, point.y)); });
        let high = land.colour.top;
        if (high === undefined) {
            high = -Infinity;
            for (let i = 0; i <= RANGE_SAMPLES; i++) {
                for (let j = 0; j <= RANGE_SAMPLES; j++) {
                    const x = land.domain.x[0] + ((land.domain.x[1] - land.domain.x[0]) * i) / RANGE_SAMPLES;
                    const y = land.domain.y[0] + ((land.domain.y[1] - land.domain.y[0]) * j) / RANGE_SAMPLES;
                    high = Math.max(high, land.f(x, y));
                }
            }
        }
        ranges[land.id] = { low: low, high: high };
        return ranges[land.id];
    }

    // 0 at the lowest point ... 1 at the top colour (and above). Banana uses log(1 + height).
    function heightShare(land, value) {
        const range = heightRange(land);
        const above = Math.max(0, value - range.low);
        const share = land.colour.log
            ? Math.log(1 + above) / Math.log(1 + range.high - range.low)
            : above / (range.high - range.low);
        return finite(share) ? Math.min(1, share) : 1;
    }

    // The loss on the screen: the height above the lowest point, so that the lowest point's loss
    // is 0 and no loss is below 0 (Two valleys and Saddle dip below 0). Lifting a whole landscape
    // changes no slope, so the race is the same.
    function lossAt(land, x, y) {
        return land.f(x, y) - heightRange(land).low;
    }

    // ----- Flat points: dips and saddles -----
    // How the slope itself changes around a point (the second derivatives, the "Hessian"),
    // from the exact gradient a tiny step to each side. Curving up in every direction means
    // a dip; up one way and down another means a saddle.
    function hessian(land, x, y) {
        const h = 1e-5;
        const right = land.grad(x + h, y);
        const left = land.grad(x - h, y);
        const up = land.grad(x, y + h);
        const down = land.grad(x, y - h);
        return {
            xx: (right[0] - left[0]) / (2 * h),
            yy: (up[1] - down[1]) / (2 * h),
            xy: ((up[0] - down[0]) / (2 * h) + (right[1] - left[1]) / (2 * h)) / 2
        };
    }

    // The exact flat point (gradient 0) near (x, y), by Newton's method: each step jumps to
    // where the slope would be zero if the ground curved the same way everywhere.
    // null when there is none close by.
    function flatPointNear(land, x, y) {
        let px = x;
        let py = y;
        for (let i = 0; i < NEWTON.steps; i++) {
            const g = land.grad(px, py);
            const H = hessian(land, px, py);
            const det = H.xx * H.yy - H.xy * H.xy;
            if (!det || !finite(det)) return null;
            const dx = (H.yy * g[0] - H.xy * g[1]) / det;
            const dy = (H.xx * g[1] - H.xy * g[0]) / det;
            px -= dx;
            py -= dy;
            if (!finite(px) || !finite(py) || Math.hypot(px - x, py - y) > NEWTON.reach) return null;
            if (Math.hypot(dx, dy) < 1e-13) break;
        }
        const g = land.grad(px, py);
        return Math.hypot(g[0], g[1]) < 1e-6 ? [px, py] : null;
    }

    // Where a ball stopped: "lowest" (a lowest point), "local" (a dip that isn't the lowest:
    // a local minimum) or "saddle" (a flat spot that goes down on some side)
    function classify(land, x, y) {
        const flat = flatPointNear(land, x, y) || [x, y];
        const lowest = land.minima.some(function (point) {
            return point.lowest && Math.hypot(point.x - flat[0], point.y - flat[1]) < LOWEST_RADIUS;
        });
        if (lowest) return "lowest";
        const H = hessian(land, flat[0], flat[1]);
        return H.xx * H.yy - H.xy * H.xy > 0 && H.xx > 0 ? "local" : "saddle";
    }

    // Farther out than EXPLODE_SCALE half-widths from the map's centre, or not a number at all
    function farOutside(land, p) {
        if (!finite(p[0]) || !finite(p[1])) return true;
        const d = land.domain;
        return Math.abs(p[0] - (d.x[0] + d.x[1]) / 2) > (EXPLODE_SCALE * (d.x[1] - d.x[0])) / 2 ||
            Math.abs(p[1] - (d.y[0] + d.y[1]) / 2) > (EXPLODE_SCALE * (d.y[1] - d.y[0])) / 2;
    }

    function inside(land, x, y) {
        const d = land.domain;
        return x >= d.x[0] && x <= d.x[1] && y >= d.y[0] && y <= d.y[1];
    }

    /* =========================================================
       4. TAKING STEPS: THE OPTIMIZERS AND THE RULES OF A RACE
       p is the position [x, y], g the gradient there, and "memory" what
       an optimizer remembers between steps (momentum's speed, Adam's
       averages). Each returns the new position.
       ========================================================= */
    function newMemory() {
        return { v: [0, 0], m: [0, 0], s: [0, 0], t: 0 };
    }

    // Plain gradient descent: p ← p − rate × g
    function stepGD(p, g, rate) {
        return [p[0] - rate * g[0], p[1] - rate * g[1]];
    }

    // Momentum: v ← 0.9 v + g, then p ← p − rate × v. The speed v remembers the last steps:
    // steps that keep going the same way add up (up to 10 times one step), and steps that
    // flip back and forth cancel out, like a heavy ball rolling.
    function stepMomentum(p, g, rate, memory) {
        memory.v[0] = MOMENTUM * memory.v[0] + g[0];
        memory.v[1] = MOMENTUM * memory.v[1] + g[1];
        return [p[0] - rate * memory.v[0], p[1] - rate * memory.v[1]];
    }

    // Adam: m is an average of the gradients and s an average of their squares. Both start at
    // 0, so early on they are too small: m̂ = m / (1 − 0.9^t) and ŝ = s / (1 − 0.999^t) fix that.
    // Each direction then steps rate × m̂ / (√ŝ + 1e−8): about "rate" long, however steep or
    // flat that direction is.
    function stepAdam(p, g, rate, memory) {
        memory.t += 1;
        const fixM = 1 - Math.pow(ADAM.beta1, memory.t);
        const fixS = 1 - Math.pow(ADAM.beta2, memory.t);
        const next = [0, 0];
        for (let i = 0; i < 2; i++) {
            memory.m[i] = ADAM.beta1 * memory.m[i] + (1 - ADAM.beta1) * g[i];
            memory.s[i] = ADAM.beta2 * memory.s[i] + (1 - ADAM.beta2) * g[i] * g[i];
            next[i] = p[i] - (rate * (memory.m[i] / fixM)) / (Math.sqrt(memory.s[i] / fixS) + ADAM.epsilon);
        }
        return next;
    }

    const STEPPERS = { gd: stepGD, momentum: stepMomentum, adam: stepAdam };

    // ----- A ball in a race -----
    // state: "moving" | "arrived" (at a lowest point) | "stuck" (kind "local" or "saddle") |
    // "exploded" | "limit" (out of steps)
    function newRacer(index, config, start, land) {
        return {
            index: index,
            on: config.on,
            opt: config.opt,
            rate: config.rate,
            p: [start[0], start[1]],
            before: [start[0], start[1]],      // where it was one step ago (the ball slides from there)
            memory: newMemory(),
            steps: 0,
            losses: [lossAt(land, start[0], start[1])],
            trail: [start[0], start[1]],       // x0, y0, x1, y1, ...
            state: "moving",
            kind: null,
            random: kit.rng(NOISE_SEED + index),
            smooth: [start[0], start[1]],      // the settle rule with noise (see SETTLE)
            anchor: [start[0], start[1]],
            still: 0,
            stuckAt: null,                     // where it got stuck on a flat spot
            escaped: false,                    // it left that flat spot later (challenge 4)
            jiggling: false                    // it stopped with noise on: it was still jiggling around a dip
        };
    }

    // One step of one ball. Returns true when its state changed (it arrived, got stuck,
    // exploded or ran out of steps).
    function advance(land, racer, noisy) {
        if (racer.state !== "moving") return false;
        const p = racer.p;
        const g = land.grad(p[0], p[1]);
        if (noisy) {
            // Like learning from a small random batch of examples: the slope is a little off
            g[0] += racer.random.normal(0, land.noise);
            g[1] += racer.random.normal(0, land.noise);
        }
        const next = STEPPERS[racer.opt](p, g, racer.rate, racer.memory);
        racer.before = p;
        racer.p = next;
        racer.steps += 1;
        const value = lossAt(land, next[0], next[1]);
        racer.losses.push(value);
        racer.trail.push(next[0], next[1]);

        if (!finite(value) || farOutside(land, next)) {
            racer.state = "exploded";
            return true;
        }
        if (racer.stuckAt && Math.hypot(next[0] - racer.stuckAt[0], next[1] - racer.stuckAt[1]) > LEAVE_SADDLE) {
            racer.escaped = true;
        }
        if (noisy ? settled(land, racer) : arrived(land, racer, p)) return true;
        if (racer.steps >= MAX_STEPS) {
            racer.state = "limit";
            return true;
        }
        return false;
    }

    // Without noise: the gradient is tiny and so was the last step
    function arrived(land, racer, before) {
        const g = land.grad(racer.p[0], racer.p[1]);
        const step = Math.hypot(racer.p[0] - before[0], racer.p[1] - before[1]);
        if (Math.hypot(g[0], g[1]) >= ARRIVE_GRADIENT || step >= ARRIVE_STEP) return false;
        stop(racer, classify(land, racer.p[0], racer.p[1]), racer.p);
        return true;
    }

    // With noise: the smoothed place stayed in one small spot for SETTLE.steps steps. A flat
    // ridge can't hold a jiggling ball (sooner or later a nudge sends it down), so a ball
    // only settles in a dip.
    function settled(land, racer) {
        const s = racer.smooth;
        s[0] += SETTLE.smooth * (racer.p[0] - s[0]);
        s[1] += SETTLE.smooth * (racer.p[1] - s[1]);
        if (Math.hypot(s[0] - racer.anchor[0], s[1] - racer.anchor[1]) > SETTLE.radius) {
            racer.anchor = [s[0], s[1]];
            racer.still = 0;
            return false;
        }
        racer.still += 1;
        if (racer.still < SETTLE.steps) return false;
        const kind = classify(land, s[0], s[1]);
        if (kind === "saddle") {
            racer.still = 0;
            return false;
        }
        stop(racer, kind, s);
        racer.jiggling = true;
        return true;
    }

    function stop(racer, kind, where) {
        racer.state = kind === "lowest" ? "arrived" : "stuck";
        racer.kind = kind;
        if (kind === "saddle") racer.stuckAt = [where[0], where[1]];
    }

    // Noise was switched on or off: the settle rule starts again from here, and a stuck ball
    // may move again (noise can shake it loose). Returns true if it was stuck.
    function noiseChanged(racer, noisy) {
        racer.smooth = [racer.p[0], racer.p[1]];
        racer.anchor = [racer.p[0], racer.p[1]];
        racer.still = 0;
        if (!noisy || racer.state !== "stuck" || racer.steps >= MAX_STEPS) return false;
        racer.state = "moving";
        racer.kind = null;
        racer.jiggling = false;
        return true;
    }

    /* =========================================================
       5. CONTOUR LINES (MARCHING SQUARES)
       The map is cut into small squares. For each square and each level,
       the corners above and below that height say where the line crosses
       the square's sides; the crossing point is found by linear
       interpolation. contours(f, grid, levels) returns, for each level, a
       flat list of line pieces [x1, y1, x2, y2, ...] in the map's own x and y.
       grid = { x0, x1, y0, y1, nx, ny } (nx x ny squares).
       ========================================================= */
    // The sides of a square, by the corners they join: 0 bottom (a-b), 1 right (b-c),
    // 2 top (c-d), 3 left (d-a), with corners a (bottom left), b, c, d going round.
    // For each of the 16 cases (which corners are above), the pairs of sides a line joins.
    // Cases 5 and 10 (two opposite corners above) are decided by the middle of the square.
    const SQUARE_CASES = [
        [], [3, 0], [0, 1], [3, 1], [1, 2], null, [0, 2], [3, 2],
        [2, 3], [0, 2], null, [1, 2], [1, 3], [0, 1], [3, 0], []
    ];

    function contours(f, grid, levels) {
        const nx = grid.nx;
        const ny = grid.ny;
        const dx = (grid.x1 - grid.x0) / nx;
        const dy = (grid.y1 - grid.y0) / ny;
        const values = new Float64Array((nx + 1) * (ny + 1));
        for (let j = 0; j <= ny; j++) {
            for (let i = 0; i <= nx; i++) values[j * (nx + 1) + i] = f(grid.x0 + i * dx, grid.y0 + j * dy);
        }

        return levels.map(function (level) {
            const pieces = [];
            const corner = [0, 0, 0, 0];
            // the point where side "side" of square (i, j) crosses the level
            function crossing(i, j, side) {
                const from = side === 3 ? 3 : side;        // the side's two corners, going round
                const to = (side + 1) % 4;
                const share = (level - corner[from]) / (corner[to] - corner[from]);
                const cornerX = [0, 1, 1, 0];
                const cornerY = [0, 0, 1, 1];
                const x = grid.x0 + (i + cornerX[from] + (cornerX[to] - cornerX[from]) * share) * dx;
                const y = grid.y0 + (j + cornerY[from] + (cornerY[to] - cornerY[from]) * share) * dy;
                pieces.push(x, y);
            }
            for (let j = 0; j < ny; j++) {
                for (let i = 0; i < nx; i++) {
                    const k = j * (nx + 1) + i;
                    corner[0] = values[k];
                    corner[1] = values[k + 1];
                    corner[2] = values[k + nx + 2];
                    corner[3] = values[k + nx + 1];
                    const index = (corner[0] > level ? 1 : 0) + (corner[1] > level ? 2 : 0) +
                        (corner[2] > level ? 4 : 0) + (corner[3] > level ? 8 : 0);
                    let sides = SQUARE_CASES[index];
                    if (sides === null) {
                        // two opposite corners above: is the middle above too?
                        const middle = (corner[0] + corner[1] + corner[2] + corner[3]) / 4 > level;
                        if (index === 5) sides = middle ? [0, 1, 2, 3] : [3, 0, 1, 2];
                        else sides = middle ? [3, 0, 1, 2] : [0, 1, 2, 3];
                    }
                    for (let s = 0; s < sides.length; s += 2) {
                        crossing(i, j, sides[s]);
                        crossing(i, j, sides[s + 1]);
                    }
                }
            }
            return pieces;
        });
    }

    // The levels: CONTOUR_LEVELS evenly spaced heights between the lowest and the top colour
    function contourLevels() {
        const levels = [];
        for (let k = 1; k <= CONTOUR_LEVELS; k++) levels.push(k / (CONTOUR_LEVELS + 1));
        return levels;
    }

    /* =========================================================
       6. DRAWING THE MAP
       The map is the (x, y) plane seen from above: colours for the
       height, contour lines, stars at the lowest points. That picture is
       drawn once into a hidden canvas (per landscape, size, theme and
       language) and copied each frame; the trails and the balls go on top.
       ========================================================= */
    // Where the landscape sits on the canvas: the biggest square that fits, with a margin
    function mapBox(view) {
        const size = Math.max(10, Math.min(view.width, view.height) - 2 * MAP_PAD);
        return { left: (view.width - size) / 2, top: (view.height - size) / 2, size: size };
    }

    function toScreen(land, box, x, y) {
        const d = land.domain;
        return [
            box.left + ((x - d.x[0]) / (d.x[1] - d.x[0])) * box.size,
            box.top + ((d.y[1] - y) / (d.y[1] - d.y[0])) * box.size
        ];
    }

    function fromScreen(land, box, sx, sy) {
        const d = land.domain;
        return [
            d.x[0] + ((sx - box.left) / box.size) * (d.x[1] - d.x[0]),
            d.y[1] - ((sy - box.top) / box.size) * (d.y[1] - d.y[0])
        ];
    }

    // The contour lines of a landscape at a size, kept: they only depend on the shape
    const contourCache = {};

    function mapContours(land, size) {
        const cells = Math.max(24, Math.round(size / GRID_PX));
        const key = land.id + "|" + cells;
        if (!contourCache[key]) {
            contourCache[key] = contours(function (x, y) { return heightShare(land, land.f(x, y)); }, {
                x0: land.domain.x[0], x1: land.domain.x[1], y0: land.domain.y[0], y1: land.domain.y[1], nx: cells, ny: cells
            }, contourLevels());
        }
        return contourCache[key];
    }

    // A small five-pointed star (a lowest point: filled; another dip: an outline)
    function star(g, x, y, radius, filled, c) {
        g.beginPath();
        for (let i = 0; i < 10; i++) {
            const angle = -Math.PI / 2 + (i * Math.PI) / 5;
            const r = i % 2 === 0 ? radius : radius * 0.45;
            if (i === 0) g.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
            else g.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        }
        g.closePath();
        g.lineJoin = "round";
        g.lineWidth = 3;
        g.strokeStyle = kit.alpha(c.surface, 0.9);
        g.stroke();
        g.lineWidth = 1.5;
        g.strokeStyle = c.text;
        g.stroke();
        if (filled) {
            g.fillStyle = c.text;
            g.fill();
        }
    }

    // Text on a soft plate, so it stays readable over the colours
    function label(g, text, x, y, align, c) {
        g.font = kit.font(11, 600);
        const width = g.measureText(text).width;
        const left = align === "right" ? x - width : align === "center" ? x - width / 2 : x;
        g.fillStyle = kit.alpha(c.surface, 0.82);
        g.fillRect(left - 4, y - 8, width + 8, 16);
        g.fillStyle = c.text;
        g.textAlign = "left";
        g.textBaseline = "middle";
        g.fillText(text, left, y);
    }

    // The still picture of a map: heights, contour lines, the dips and flat spots, the colour key
    function buildMapPicture(view, land) {
        const c = kit.colors();
        const box = mapBox(view);
        const picture = document.createElement("canvas");
        picture.width = Math.max(1, Math.round(view.width * view.dpr));
        picture.height = Math.max(1, Math.round(view.height * view.dpr));
        const g = picture.getContext("2d");
        g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);

        g.save();
        g.beginPath();
        A.canvas.roundRect(g, box.left, box.top, box.size, box.size, 10);
        g.clip();

        // 1. The heights as colours: a small picture, smoothed when it is stretched
        const cells = Math.max(16, Math.round(box.size / FILL_PX));
        const small = document.createElement("canvas");
        small.width = cells;
        small.height = cells;
        const smallContext = small.getContext("2d");
        const image = smallContext.createImageData(cells, cells);
        const d = land.domain;
        for (let j = 0; j < cells; j++) {
            for (let i = 0; i < cells; i++) {
                const x = d.x[0] + ((i + 0.5) / cells) * (d.x[1] - d.x[0]);
                const y = d.y[1] - ((j + 0.5) / cells) * (d.y[1] - d.y[0]);
                const rgb = kit.scale.rgb(heightShare(land, land.f(x, y)));
                const k = (j * cells + i) * 4;
                image.data[k] = rgb[0];
                image.data[k + 1] = rgb[1];
                image.data[k + 2] = rgb[2];
                image.data[k + 3] = 255;
            }
        }
        smallContext.putImageData(image, 0, 0);
        g.imageSmoothingEnabled = true;
        g.drawImage(small, box.left, box.top, box.size, box.size);

        // 2. The contour lines (one path per level; every STRONG_EVERY-th line a little stronger)
        const lines = mapContours(land, box.size);
        g.lineJoin = "round";
        lines.forEach(function (pieces, index) {
            const strong = (index + 1) % STRONG_EVERY === 0;
            g.beginPath();
            for (let k = 0; k < pieces.length; k += 4) {
                const a = toScreen(land, box, pieces[k], pieces[k + 1]);
                const b = toScreen(land, box, pieces[k + 2], pieces[k + 3]);
                g.moveTo(a[0], a[1]);
                g.lineTo(b[0], b[1]);
            }
            g.lineWidth = strong ? 1.3 : 0.9;
            g.strokeStyle = kit.alpha(c.light ? c.text : c.bg, strong ? 0.42 : 0.26);
            g.stroke();
        });
        g.restore();

        // 3. The lowest points (filled stars), other dips (outlined) and flat spots (a cross)
        land.minima.forEach(function (point) {
            const at = toScreen(land, box, point.x, point.y);
            star(g, at[0], at[1], 7, point.lowest, c);
        });
        (land.saddles || []).forEach(function (point) {
            const at = toScreen(land, box, point.x, point.y);
            g.lineCap = "round";
            g.lineWidth = 4;
            g.strokeStyle = kit.alpha(c.surface, 0.9);
            g.beginPath();
            g.moveTo(at[0] - 5, at[1] - 5);
            g.lineTo(at[0] + 5, at[1] + 5);
            g.moveTo(at[0] + 5, at[1] - 5);
            g.lineTo(at[0] - 5, at[1] + 5);
            g.stroke();
            g.lineWidth = 1.8;
            g.strokeStyle = c.text;
            g.stroke();
        });

        // 4. The colour key, top right: low ... high
        const keyWidth = 54;
        const right = box.left + box.size - 10;
        const top = box.top + 16;
        g.font = kit.font(11, 600);
        const highText = t("lab.descent.high");
        const lowText = t("lab.descent.low");
        const highWidth = g.measureText(highText).width;
        const lowWidth = g.measureText(lowText).width;
        const barLeft = right - highWidth - 6 - keyWidth;
        g.fillStyle = kit.alpha(c.surface, 0.82);
        g.fillRect(barLeft - lowWidth - 12, top - 9, lowWidth + keyWidth + highWidth + 22, 18);
        for (let i = 0; i < keyWidth; i++) {
            g.fillStyle = kit.scale(i / (keyWidth - 1));
            g.fillRect(barLeft + i, top - 3, 1, 6);
        }
        g.fillStyle = c.text;
        g.textBaseline = "middle";
        g.textAlign = "left";
        g.fillText(lowText, barLeft - lowWidth - 6, top);
        g.fillText(highText, barLeft + keyWidth + 6, top);

        // 5. The axes' names: x along the bottom, y up the side
        label(g, "x →", box.left + box.size - 10, box.top + box.size - 14, "right", c);
        label(g, "y ↑", box.left + 10, box.top + 16, "left", c);
        return picture;
    }

    // A ball's trail: a line through its steps (only where it moved a pixel or more, so a long
    // trail stays quick), with a dot on each of its first steps. It ends at the ball itself.
    function drawTrail(g, points, count, end, color, dots, dash) {
        if (count < 1) return;
        g.beginPath();
        g.moveTo(points[0][0], points[0][1]);
        let lastX = points[0][0];
        let lastY = points[0][1];
        for (let k = 1; k < count; k++) {
            const p = points[k];
            if (Math.abs(p[0] - lastX) + Math.abs(p[1] - lastY) < 0.75) continue;
            g.lineTo(p[0], p[1]);
            lastX = p[0];
            lastY = p[1];
        }
        g.lineTo(end[0], end[1]);
        g.lineJoin = "round";
        g.lineCap = "round";
        g.lineWidth = 2;
        g.strokeStyle = kit.alpha(color, 0.9);
        g.setLineDash(dash || []);
        g.stroke();
        g.setLineDash([]);
        if (!dots) return;
        g.fillStyle = color;
        for (let k = 1; k < Math.min(count, DOTS_UP_TO); k++) {
            g.beginPath();
            g.arc(points[k][0], points[k][1], 1.9, 0, Math.PI * 2);
            g.fill();
        }
    }

    // A ball, with a soft glow (not in calm mode)
    function drawBall(g, shape, x, y, color, glow) {
        if (glow) {
            g.save();
            g.shadowColor = color;
            g.shadowBlur = 14;
            kit.marker(g, shape, x, y, BALL_RADIUS, color);
            g.restore();
        }
        kit.marker(g, shape, x, y, BALL_RADIUS, color);
    }

    // A cross where a ball exploded
    function drawCrash(g, x, y, color, c) {
        g.lineCap = "round";
        g.lineWidth = 5;
        g.strokeStyle = kit.alpha(c.surface, 0.9);
        g.beginPath();
        g.moveTo(x - 6, y - 6);
        g.lineTo(x + 6, y + 6);
        g.moveTo(x + 6, y - 6);
        g.lineTo(x - 6, y + 6);
        g.stroke();
        g.lineWidth = 2.5;
        g.strokeStyle = color;
        g.stroke();
    }

    // The little burst: a ring that grows and fades, and eight short rays
    function drawBurst(g, x, y, color, progress) {
        const fade = 1 - progress;
        g.save();
        g.globalAlpha = fade;
        g.strokeStyle = color;
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(x, y, 6 + 26 * progress, 0, Math.PI * 2);
        g.stroke();
        g.lineCap = "round";
        g.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4 + 0.3;
            const near = 10 + 20 * progress;
            const far = near + 8 * fade;
            g.moveTo(x + near * Math.cos(angle), y + near * Math.sin(angle));
            g.lineTo(x + far * Math.cos(angle), y + far * Math.sin(angle));
        }
        g.stroke();
        g.restore();
    }

    // A small triangle on the edge of the map, pointing to a ball that left it
    function drawEdgeArrow(g, x, y, angle, color, c) {
        g.save();
        g.translate(x, y);
        g.rotate(angle);
        g.beginPath();
        g.moveTo(7, 0);
        g.lineTo(-5, -6);
        g.lineTo(-5, 6);
        g.closePath();
        g.lineWidth = 3;
        g.strokeStyle = kit.alpha(c.surface, 0.9);
        g.stroke();
        g.fillStyle = color;
        g.fill();
        g.restore();
    }

    // The downhill arrow at the start (the minus gradient) and the gradient's length
    function drawDownhill(g, x, y, gradient, c) {
        const length = Math.hypot(gradient[0], gradient[1]);
        if (!(length > 0) || !finite(length)) return;
        // a longer arrow for a steeper slope; the length grows slower than the slope
        const size = Math.min(ARROW.max, ARROW.min + 18 * Math.log10(1 + 10 * length));
        // the map's y grows upwards, the screen's downwards
        const ux = -gradient[0] / length;
        const uy = gradient[1] / length;
        const tipX = x + ux * size;
        const tipY = y + uy * size;
        g.lineCap = "round";
        g.lineJoin = "round";
        [[5, kit.alpha(c.surface, 0.85)], [2.4, c.text]].forEach(function (style) {
            g.lineWidth = style[0];
            g.strokeStyle = style[1];
            g.beginPath();
            g.moveTo(x + ux * 9, y + uy * 9);
            g.lineTo(tipX, tipY);
            g.moveTo(tipX - ux * 8 - uy * 5, tipY - uy * 8 + ux * 5);
            g.lineTo(tipX, tipY);
            g.lineTo(tipX - ux * 8 + uy * 5, tipY - uy * 8 - ux * 5);
            g.stroke();
        });
        label(g, num(length), tipX + ux * 14, tipY + uy * 10, "center", c);
    }

    /* =========================================================
       7. DRAWING THE 3-D VIEW
       The surface lives in a box: u across the map (−1 ... 1), v up the
       map (−1 ... 1) and w the height. The camera turns around the
       vertical axis ("yaw") and looks down at "tilt" degrees (90 = from
       straight above, like the map). It is made of MESH x MESH tiles,
       drawn from the farthest to the nearest, so near tiles cover far
       ones (the "painter's algorithm"). Each tile is lit by one light:
       the more it faces the light, the brighter (Lambert's law).
       ========================================================= */
    function camera(view, yaw, tilt) {
        const turn = (yaw * Math.PI) / 180;
        const down = (tilt * Math.PI) / 180;
        // half the picture's height, in box units: the map's corners and the surface's height
        const reach = Math.SQRT2 * Math.sin(down) + (VIEW_3D.height / 2) * Math.cos(down);
        return {
            cosA: Math.cos(turn),
            sinA: Math.sin(turn),
            cosE: Math.cos(down),
            sinE: Math.sin(down),
            scale: Math.min(view.width / (2 * Math.SQRT2), view.height / (2 * reach)) * VIEW_3D.fill,
            cx: view.width / 2,
            cy: view.height / 2
        };
    }

    // A point of the box on the screen: [x, y, depth] (a bigger depth is farther away)
    function project(cam, u, v, w) {
        const across = u * cam.cosA - v * cam.sinA;
        const away = u * cam.sinA + v * cam.cosA;
        return [
            cam.cx + cam.scale * across,
            cam.cy - cam.scale * (away * cam.sinE + w * cam.cosE),
            away * cam.cosE - w * cam.sinE
        ];
    }

    // Is point a (from project()) nearer to the camera than point b?
    function nearer(a, b) {
        return a[2] < b[2];
    }

    // A place on the map in the box: u, v and the height w of the ground there
    function boxPoint(land, x, y) {
        const d = land.domain;
        return [
            -1 + (2 * (x - d.x[0])) / (d.x[1] - d.x[0]),
            -1 + (2 * (y - d.y[0])) / (d.y[1] - d.y[0]),
            (heightShare(land, land.f(x, y)) - 0.5) * VIEW_3D.height
        ];
    }

    // The surface's corners and, for each tile, its height (for the colour) and its light
    const meshCache = {};

    function buildMesh(land) {
        if (meshCache[land.id]) return meshCache[land.id];
        const n = MESH;
        const size = n + 1;
        const d = land.domain;
        const corners = [];
        for (let j = 0; j <= n; j++) {
            for (let i = 0; i <= n; i++) {
                corners.push(boxPoint(land, d.x[0] + ((d.x[1] - d.x[0]) * i) / n, d.y[0] + ((d.y[1] - d.y[0]) * j) / n));
            }
        }
        const lightLength = Math.hypot(LIGHT[0], LIGHT[1], LIGHT[2]);
        const light = LIGHT.map(function (value) { return value / lightLength; });
        const tiles = [];
        for (let j = 0; j < n; j++) {
            for (let i = 0; i < n; i++) {
                const k = j * size + i;
                const a = corners[k];
                const b = corners[k + 1];
                const c = corners[k + size + 1];
                const e = corners[k + size];
                // the tile's normal: the cross product of its two diagonals (it points up)
                const d1 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
                const d2 = [e[0] - b[0], e[1] - b[1], e[2] - b[2]];
                const normal = [d1[1] * d2[2] - d1[2] * d2[1], d1[2] * d2[0] - d1[0] * d2[2], d1[0] * d2[1] - d1[1] * d2[0]];
                const length = Math.hypot(normal[0], normal[1], normal[2]) || 1;
                const facing = (normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2]) / length;
                tiles.push({
                    corners: [k, k + 1, k + size + 1, k + size],
                    height: (a[2] + b[2] + c[2] + e[2]) / (4 * VIEW_3D.height) + 0.5,
                    light: AMBIENT + (1 - AMBIENT) * Math.max(0, facing)
                });
            }
        }
        meshCache[land.id] = { corners: corners, tiles: tiles };
        return meshCache[land.id];
    }

    // The tiles' colours in the current theme: the map's colour for their height, lit
    function meshColours(mesh) {
        return mesh.tiles.map(function (tile) {
            const rgb = kit.scale.rgb(tile.height);
            return "rgb(" + Math.round(rgb[0] * tile.light) + ", " + Math.round(rgb[1] * tile.light) + ", " + Math.round(rgb[2] * tile.light) + ")";
        });
    }

    // The still picture of the 3-D view: the floor, the surface, the dips and the axes' names
    function buildSurfacePicture(view, land, cam, colours) {
        const c = kit.colors();
        const mesh = buildMesh(land);
        const picture = document.createElement("canvas");
        picture.width = Math.max(1, Math.round(view.width * view.dpr));
        picture.height = Math.max(1, Math.round(view.height * view.dpr));
        const g = picture.getContext("2d");
        g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);

        // the floor: a faint square under the surface
        const floor = -VIEW_3D.height / 2 - 0.08;
        const base = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (p) { return project(cam, p[0], p[1], floor); });
        g.beginPath();
        base.forEach(function (p, i) {
            if (i === 0) g.moveTo(p[0], p[1]);
            else g.lineTo(p[0], p[1]);
        });
        g.closePath();
        g.fillStyle = kit.alpha(c.text, 0.04);
        g.fill();
        g.lineWidth = 1;
        g.strokeStyle = kit.alpha(c.text, 0.18);
        g.stroke();

        // the surface, tile by tile from the farthest
        const points = mesh.corners.map(function (p) { return project(cam, p[0], p[1], p[2]); });
        const order = mesh.tiles.map(function (tile, index) {
            const k = tile.corners;
            return { index: index, depth: points[k[0]][2] + points[k[1]][2] + points[k[2]][2] + points[k[3]][2] };
        });
        order.sort(function (a, b) { return b.depth - a.depth; });
        g.lineJoin = "round";
        g.lineWidth = 0.8;
        order.forEach(function (item) {
            const k = mesh.tiles[item.index].corners;
            g.beginPath();
            g.moveTo(points[k[0]][0], points[k[0]][1]);
            g.lineTo(points[k[1]][0], points[k[1]][1]);
            g.lineTo(points[k[2]][0], points[k[2]][1]);
            g.lineTo(points[k[3]][0], points[k[3]][1]);
            g.closePath();
            g.fillStyle = colours[item.index];
            g.fill();
            g.strokeStyle = colours[item.index];      // the same colour hides the hairline seams
            g.stroke();
        });

        // the dips, on the surface
        land.minima.forEach(function (point) {
            const p = boxPoint(land, point.x, point.y);
            const at = project(cam, p[0], p[1], p[2]);
            star(g, at[0], at[1], 6, point.lowest, c);
        });

        // the axes' names, just outside the middle of the floor's nearest edge along x and along y
        const xSide = nearer(project(cam, 0, -1, floor), project(cam, 0, 1, floor)) ? -1 : 1;
        const ySide = nearer(project(cam, -1, 0, floor), project(cam, 1, 0, floor)) ? -1 : 1;
        const xName = project(cam, 0, xSide * 1.16, floor);
        const yName = project(cam, ySide * 1.16, 0, floor);
        label(g, "x", xName[0], xName[1], "center", c);
        label(g, "y", yName[0], yName[1], "center", c);
        return picture;
    }

    /* =========================================================
       8. THE EXPERIMENT
       ========================================================= */
    // The preset of a landscape, from the content file: { start, speed, balls: [{ on, opt, rate }] }.
    // A broken or missing one falls back to a plain race from the top right.
    function validBall(ball) {
        return Boolean(ball) && typeof ball.on === "boolean" && OPTIMIZERS.indexOf(ball.opt) !== -1 &&
            finite(ball.rate) && ball.rate >= RATE.min && ball.rate <= RATE.max;
    }

    function validStart(land, start) {
        return Array.isArray(start) && start.length === 2 && finite(start[0]) && finite(start[1]) && inside(land, start[0], start[1]);
    }

    function presetOf(land) {
        const data = A.content.get("lab.descent");
        const preset = data && data.presets ? data.presets[land.id] : null;
        if (preset && validStart(land, preset.start) && Array.isArray(preset.balls) && preset.balls.length === BALLS &&
            preset.balls.every(validBall)) {
            return preset;
        }
        const d = land.domain;
        return {
            start: [d.x[0] + 0.8 * (d.x[1] - d.x[0]), d.y[0] + 0.8 * (d.y[1] - d.y[0])],
            balls: [{ on: true, opt: "gd", rate: 0.01 }, { on: true, opt: "momentum", rate: 0.01 }, { on: false, opt: "adam", rate: 0.05 }]
        };
    }

    // Saved settings must be exactly right, or the defaults are used
    function validSettings(value) {
        if (!value || value.v !== SAVE_VERSION) return false;
        const land = landscape(value.landscape);
        return Boolean(land) && (value.view === "map" || value.view === "3d") && Object.prototype.hasOwnProperty.call(SPEED, value.speed) &&
            validStart(land, value.start) && Array.isArray(value.balls) && value.balls.length === BALLS && value.balls.every(validBall);
    }

    function copyBall(ball) {
        return { on: ball.on, opt: ball.opt, rate: niceRate(ball.rate) };
    }

    A.lab.define("descent", {
        // The maths, for dev/tests/descent.math.js (the hub doesn't use it)
        maths: {
            landscapes: LANDSCAPES,
            landscape: landscape,
            stepGD: stepGD,
            stepMomentum: stepMomentum,
            stepAdam: stepAdam,
            newMemory: newMemory,
            newRacer: newRacer,
            advance: advance,
            noiseChanged: noiseChanged,
            classify: classify,
            flatPointNear: flatPointNear,
            heightShare: heightShare,
            lossAt: lossAt,
            contours: contours,
            presetOf: presetOf,
            settings: { MAX_STEPS: MAX_STEPS, ARRIVE_GRADIENT: ARRIVE_GRADIENT, ARRIVE_STEP: ARRIVE_STEP, LEAVE_SADDLE: LEAVE_SADDLE }
        },

        create: function (stage, ctx) {
            // ----- State. state: "ready" | "running" | "paused" | "done" -----
            const saved = ctx.store.get("settings", null, validSettings);
            let land = landscape(saved ? saved.landscape : DEFAULT_LANDSCAPE);
            let viewName = saved ? saved.view : "map";
            let speedName = saved ? saved.speed : "watch";
            let start = saved ? saved.start.slice() : presetOf(land).start.slice();
            const configs = (saved ? saved.balls : presetOf(land).balls).map(copyBall);
            let noisy = false;
            let state = "ready";
            let racers = [];
            let bursts = [];                 // { racer, x, y, born }
            let resumeOnShow = false;        // running when the hub paused us
            let dragging = null;             // { mode: "start" | "turn", x, y, yaw, tilt }
            let yaw = VIEW_3D.yaw;
            let tilt = VIEW_3D.tilt;
            let redrawFrame = 0;             // a waiting requestAnimationFrame (a turn, a burst)
            let chartSteps = -1;             // the steps the chart last showed
            let mapPicture = null;           // the cached still pictures (see sections 6 and 7)
            let mapKey = "";
            let surfacePicture = null;
            let surfaceKey = "";
            let surfaceColours = null;
            let coloursKey = "";

            // ----- The page: only kit parts, plus a few texts of our own -----
            const ui = kit.layout(stage, { side: true });
            ui.root.classList.add("gd-root");

            // Above: the landscape, what it is, the race buttons and the options
            const landSelect = kit.select({
                labelKey: "lab.descent.landscape",
                options: LANDSCAPES.map(function (item) { return { value: item.id, labelKey: "lab.descent.land." + item.id }; }),
                value: land.id,
                onChange: chooseLandscape
            });
            const about = el("p", "gd-about");
            const playButton = kit.button("lab.kit.play", { icon: "play", variant: "primary", onClick: togglePlay });
            const stepButton = kit.button("lab.kit.step", { icon: "step", onClick: stepOnce });
            const resetButton = kit.button("lab.kit.reset", { icon: "reset", onClick: function () { reset(); } });
            const ridgeButton = kit.button("lab.descent.ridge", { icon: RIDGE_ICON, variant: "subtle", onClick: startOnRidge });
            const status = kit.status("ready");
            const speed = kit.segmented({
                labelKey: "lab.kit.speed",
                options: [{ value: "watch", labelKey: "lab.kit.speedWatch" }, { value: "fast", labelKey: "lab.kit.speedFast" }],
                value: speedName,
                onChange: function (value) {
                    speedName = value;
                    loop.setRate(SPEED[value]);
                    save();
                }
            });
            const viewSwitch = kit.segmented({
                labelKey: "lab.descent.view",
                options: [{ value: "map", labelKey: "lab.descent.viewMap" }, { value: "3d", labelKey: "lab.descent.view3d" }],
                value: viewName,
                onChange: function (value) {
                    viewName = value;
                    save();
                    labelScene();
                    render(1);
                }
            });
            const noise = kit.toggle({ labelKey: "lab.descent.noisy", hintKey: "lab.descent.noisyHint", onChange: setNoisy });
            const landRow = kit.row([landSelect, about]);
            landRow.classList.add("gd-land");
            const options = kit.row([speed, viewSwitch, noise]);
            options.classList.add("gd-options");
            ui.top.append(landRow, kit.toolbar([playButton, stepButton, resetButton, ridgeButton, status]), options);

            // The main view: the map or the 3-D surface, its key, and news about the race
            const scene = kit.canvas(ui.main, { aspect: 1, maxHeight: 640, labelKey: function () { return sceneLabel(); } });
            scene.box.classList.add("gd-scene");
            scene.canvas.tabIndex = 0;
            scene.canvas.setAttribute("role", "application");
            const legend = kit.legend([]);
            const marks = el("p", "gd-marks");
            const keys = el("div", "gd-keys");
            keys.append(legend.element, marks);
            const warning = kit.hint({ tone: "warn" });
            const tip = kit.hint({ tone: "tip" });
            warning.hide();
            tip.hide();
            ui.main.append(keys, warning.element, tip.element);

            // Beside: one card per ball
            const ballsTitle = el("h4", "gd-title");
            ballsTitle.setAttribute("data-i18n", "lab.descent.balls");
            ballsTitle.textContent = t("lab.descent.balls");
            const cards = configs.map(function (config, index) { return makeCard(index); });
            ui.side.append(ballsTitle);
            cards.forEach(function (card) { ui.side.appendChild(card.element); });

            // Below: the loss chart, the idea in one sentence, "What's happening?" and "Try this"
            const chartTitle = el("h4", "gd-title");
            chartTitle.setAttribute("data-i18n", "lab.descent.chartTitle");
            chartTitle.textContent = t("lab.descent.chartTitle");
            const chartBox = el("div", "gd-chart");
            chartBox.appendChild(chartTitle);
            const chartView = kit.canvas(chartBox, { height: 190, labelKey: "lab.descent.chart" });
            const chart = kit.lineChart(chartView, {
                series: [],
                log: false,
                xLabelKey: "lab.kit.stepCount",
                yLabelKey: function () { return t(land.colour.log ? "lab.descent.lossLog" : "lab.kit.loss"); }
            });
            const idea = el("p", "gd-idea");
            const explain = kit.explain({
                steps: [
                    { key: "lab.descent.step1" },
                    { key: "lab.descent.step2" },
                    { key: "lab.descent.step3" },
                    { key: "lab.descent.step4" },
                    { key: "lab.descent.step5" }
                ]
            });
            const challenges = kit.challenges({ ctx: ctx, items: [
                { key: "lab.descent.ch1", insightKey: "lab.descent.ch1Why", check: checkExplode },
                { key: "lab.descent.ch2", insightKey: "lab.descent.ch2Why", check: checkMomentum },
                { key: "lab.descent.ch3", insightKey: "lab.descent.ch3Why", check: checkLocal },
                { key: "lab.descent.ch4", insightKey: "lab.descent.ch4Why", check: checkSaddle }
            ] });
            ui.bottom.append(chartBox, idea, explain.element, challenges.element);

            const loop = kit.loop({ rate: SPEED[speedName], update: stepAll, draw: function (info) { render(info.progress); } });
            scene.onResize(function () { render(1); });

            // ----- A ball's card: on/off, optimizer, learning rate, its numbers and its state -----
            function makeCard(index) {
                // a named group: a screen reader says "Ball 1" before the controls inside
                const element = el("div", "gd-card");
                element.setAttribute("role", "group");
                element.style.setProperty("--gd-ball", "var(--lk-series-" + (BALL_COLORS[index] + 1) + ")");
                const head = el("div", "gd-card-head");
                const mark = el("span", "gd-mark");
                mark.innerHTML = markSVG(BALL_SHAPES[index]);
                const toggle = kit.toggle({
                    labelKey: function () { return ballName(index); },
                    checked: configs[index].on,
                    onChange: function (on) {
                        configs[index].on = on;
                        ballsChanged();
                    }
                });
                head.append(mark, toggle.element);
                const body = el("div", "gd-card-body");
                const optimizer = kit.select({
                    labelKey: "lab.descent.optimizer",
                    options: OPTIMIZERS.map(function (name) { return { value: name, labelKey: "lab.descent.opt." + name }; }),
                    value: configs[index].opt,
                    onChange: function (value) {
                        configs[index].opt = value;
                        ballsChanged();
                    }
                });
                const rate = kit.slider({
                    labelKey: "lab.kit.learningRate",
                    min: RATE.min,
                    max: RATE.max,
                    log: true,
                    steps: (Math.log10(RATE.max) - Math.log10(RATE.min)) * RATE.perDecade,
                    value: configs[index].rate,
                    format: function (value) { return A.format.number(niceRate(value), { maxDigits: 8 }); },
                    onInput: function (value) {
                        configs[index].rate = niceRate(value);
                        ballsChanged();
                    },
                    onChange: save
                });
                const stats = {
                    steps: kit.stat({ labelKey: "lab.kit.stepCount", value: 0, format: function (v) { return A.format.number(v); } }),
                    loss: kit.stat({ labelKey: "lab.kit.loss", format: num }),
                    slope: kit.stat({ labelKey: "lab.descent.gradLength", format: num })
                };
                const line = el("p", "gd-state");
                const settings = kit.row([optimizer, rate]);
                settings.classList.add("gd-card-settings");
                const numbers = kit.row([stats.steps, stats.loss, stats.slope], { grid: true });
                numbers.classList.add("gd-card-numbers");
                body.append(settings, numbers, line);
                element.append(head, body);
                element.setAttribute("aria-label", ballName(index));
                return { element: element, toggle: toggle, optimizer: optimizer, rate: rate, stats: stats, line: line, body: body, index: index };
            }

            // ----- The race -----
            // One step for every ball that is on and still moving (the loop calls this)
            function stepAll() {
                const news = [];
                racers.forEach(function (racer) {
                    if (racer.on && advance(land, racer, noisy)) news.push(racer);
                });
                if (news.length) tellNews(news);
                if (!racers.some(function (racer) { return racer.on && racer.state === "moving"; })) finish();
            }

            function anyOn() {
                return configs.some(function (config) { return config.on; });
            }

            function setState(next) {
                state = next;
                status.set(next);
                playButton.setLabel(next === "running" ? "lab.kit.pause" : "lab.kit.play");
                playButton.setIcon(next === "running" ? "pause" : "play");
                // A disabled button drops the keyboard focus: hand it to Play (which starts again)
                if ((next === "done" || !anyOn()) && document.activeElement === stepButton.element) playButton.element.focus();
                stepButton.setDisabled(next === "done" || !anyOn());
                playButton.setDisabled(!anyOn());
            }

            // Every ball back to the start, with the settings of its card
            function reset() {
                loop.stop();
                racers = configs.map(function (config, index) { return newRacer(index, config, start, land); });
                bursts = [];
                warning.hide();
                tip.hide();
                setState("ready");
                chart.set({
                    log: Boolean(land.colour.log),
                    series: racers.filter(function (racer) { return racer.on; }).map(function (racer) {
                        return { values: racer.losses, colorIndex: BALL_COLORS[racer.index], labelKey: function () { return ballName(racer.index); } };
                    })
                });
                chartSteps = -1;
                if (!anyOn()) tip.set("lab.descent.noBalls");
                render(1);
            }

            function togglePlay() {
                if (state === "running") {
                    loop.stop();
                    setState("paused");
                    render(1);
                    return;
                }
                if (!anyOn()) return;
                if (state === "done") reset();
                setState("running");
                loop.start();
            }

            function stepOnce() {
                if (!anyOn() || state === "done") return;
                loop.stop();
                setState("paused");
                loop.step();            // one stepAll() and one render()
            }

            function finish() {
                loop.stop();
                setState("done");
                const arrivedCount = racers.filter(function (racer) { return racer.on && racer.state === "arrived"; }).length;
                ctx.track("milestone", { kind: "raced", landscape: land.id, arrived: arrivedCount });
            }

            // Balls that arrived, got stuck, exploded or ran out of steps: say it, and show it
            function tellNews(news) {
                const messages = news.map(function (racer) { return newsText(racer); });
                ctx.announce(messages.join(" "));
                news.forEach(function (racer) {
                    if (racer.state !== "exploded") return;
                    warning.set("lab.descent.explodedNote", { ball: ballName(racer.index) });
                    if (A.motion.ok()) {
                        const at = exitPoint(racer);
                        bursts.push({ racer: racer, x: at[0], y: at[1], born: performance.now() });
                    }
                });
            }

            // ----- What the controls do -----
            function chooseLandscape(id) {
                land = landscape(id) || land;
                const preset = presetOf(land);
                start = preset.start.slice();
                preset.balls.forEach(function (ball, index) {
                    configs[index] = copyBall(ball);
                    syncCard(cards[index]);
                });
                if (preset.speed && SPEED[preset.speed]) {
                    speedName = preset.speed;
                    speed.set(speedName);
                    loop.setRate(SPEED[speedName]);
                }
                save();
                showLandscape();
                reset();
            }

            // A card shows its ball's settings (after a landscape was chosen)
            function syncCard(card) {
                const config = configs[card.index];
                card.toggle.set(config.on);
                card.optimizer.set(config.opt);
                card.rate.set(config.rate);
                config.rate = niceRate(card.rate.value());     // the slider's nearest place: the rate on screen
                card.body.hidden = !config.on;
            }

            // A ball's settings changed: the race starts again with them
            function ballsChanged() {
                cards.forEach(function (card) { card.body.hidden = !configs[card.index].on; });
                updateLegend();
                save();
                reset();
            }

            function setNoisy(on) {
                noisy = on;
                let loose = false;
                racers.forEach(function (racer) {
                    if (noiseChanged(racer, noisy) && racer.on) loose = true;
                });
                if (loose) {
                    // a stuck ball can move again: the race can go on
                    if (state === "done") setState("paused");
                    tip.set("lab.descent.shaken");
                } else {
                    tip.hide();
                }
                render(1);
            }

            // "Start on the ridge" (Saddle only): the start goes exactly onto the line y = 0
            function startOnRidge() {
                const x = Math.abs(start[0]) < 0.6 ? -2.4 : start[0];
                moveStart(x, 0);
                save();
                ctx.announce(t("lab.descent.onRidge"));
            }

            function moveStart(x, y) {
                const d = land.domain;
                start = [A.util.clamp(x, d.x[0], d.x[1]), A.util.clamp(y, d.y[0], d.y[1])];
                reset();
            }

            function save() {
                ctx.store.set("settings", {
                    v: SAVE_VERSION,
                    landscape: land.id,
                    view: viewName,
                    speed: speedName,
                    start: start.slice(),
                    balls: configs.map(copyBall)
                });
            }

            // ----- The map and the 3-D view: mouse, touch and keyboard -----
            // On the map, press or drag anywhere to put the start there. In 3-D, drag to turn it.
            scene.canvas.addEventListener("pointerdown", function (event) {
                if (event.pointerType === "mouse" && event.button !== 0) return;
                scene.canvas.setPointerCapture(event.pointerId);
                dragging = { mode: viewName === "3d" ? "turn" : "start", x: event.clientX, y: event.clientY, yaw: yaw, tilt: tilt };
                if (dragging.mode === "start") moveStartTo(event);
            });
            scene.canvas.addEventListener("pointermove", function (event) {
                if (!dragging) return;
                if (dragging.mode === "start") {
                    moveStartTo(event);
                } else {
                    turn(dragging.yaw + (event.clientX - dragging.x) * VIEW_3D.dragTurn,
                        dragging.tilt + (event.clientY - dragging.y) * VIEW_3D.dragTilt);
                }
            });
            ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (type) {
                scene.canvas.addEventListener(type, function () {
                    if (dragging && dragging.mode === "start") save();
                    dragging = null;
                });
            });

            function moveStartTo(event) {
                const rect = scene.canvas.getBoundingClientRect();
                const at = fromScreen(land, mapBox(scene), event.clientX - rect.left, event.clientY - rect.top);
                moveStart(at[0], at[1]);
            }

            function turn(newYaw, newTilt) {
                yaw = ((newYaw % 360) + 540) % 360 - 180;
                tilt = A.util.clamp(newTilt, VIEW_3D.minTilt, VIEW_3D.maxTilt);
                drawSoon();
            }

            // Arrow keys move the start (map) or turn the surface (3-D); Enter or Space starts the race
            scene.canvas.addEventListener("keydown", function (event) {
                const keys = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
                const move = keys[event.key];
                if (move) {
                    event.preventDefault();
                    if (viewName === "3d") {
                        turn(yaw + move[0] * VIEW_3D.keyTurn, tilt + move[1] * VIEW_3D.keyTilt);
                        return;
                    }
                    // steps on a grid of the key's step, so the start can land exactly on y = 0
                    const d = land.domain;
                    const stepX = (d.x[1] - d.x[0]) * KEY_MOVE * (event.shiftKey ? 5 : 1);
                    const stepY = (d.y[1] - d.y[0]) * KEY_MOVE * (event.shiftKey ? 5 : 1);
                    const x = Math.round((start[0] + move[0] * stepX) / stepX) * stepX;
                    const y = Math.round((start[1] + move[1] * stepY) / stepY) * stepY;
                    moveStart(Number(x.toFixed(10)), Number(y.toFixed(10)));
                    save();
                } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    togglePlay();
                }
            });

            // Draws the picture once at the next frame (a turn, a burst), unless the loop draws anyway
            function drawSoon() {
                if (redrawFrame || loop.running()) return;
                redrawFrame = requestAnimationFrame(function () {
                    redrawFrame = 0;
                    drawScene(1);
                    describeScene();
                    if (liveBursts()) drawSoon();
                });
            }

            function liveBursts() {
                const now = performance.now();
                bursts = bursts.filter(function (burst) { return now - burst.born < BURST_MS; });
                return bursts.length > 0 && A.motion.ok();
            }

            // ----- Drawing -----
            // Where a ball's trail left the map (an exploded ball's cross and burst go there)
            function exitPoint(racer) {
                const d = land.domain;
                const trail = racer.trail;
                for (let k = 0; k < trail.length; k += 2) {
                    if (!inside(land, trail[k], trail[k + 1])) {
                        return [A.util.clamp(trail[k], d.x[0], d.x[1]), A.util.clamp(trail[k + 1], d.y[0], d.y[1])];
                    }
                }
                return [A.util.clamp(racer.p[0], d.x[0], d.x[1]), A.util.clamp(racer.p[1], d.y[0], d.y[1])];
            }

            // Where a ball is drawn: on its way from its last place to the new one (in Watch mode)
            function shownAt(racer, progress) {
                const sliding = speedName === "watch" && state === "running" && racer.state === "moving" && A.motion.ok();
                const share = sliding ? A.util.clamp(progress, 0, 1) : 1;
                return [A.util.lerp(racer.before[0], racer.p[0], share), A.util.lerp(racer.before[1], racer.p[1], share)];
            }

            function drawScene(progress) {
                if (!scene.width || !scene.height) return;
                if (viewName === "3d") drawSurfaceView(progress);
                else drawMapView(progress);
            }

            function drawMapView(progress) {
                const g = scene.ctx;
                const c = kit.colors();
                const box = mapBox(scene);
                const key = [land.id, scene.width, scene.height, scene.dpr, c.theme, A.lang].join("|");
                if (!mapPicture || mapKey !== key) {
                    mapPicture = buildMapPicture(scene, land);
                    mapKey = key;
                }
                g.clearRect(0, 0, scene.width, scene.height);
                g.drawImage(mapPicture, 0, 0, scene.width, scene.height);
                const glow = A.motion.ok();
                const now = performance.now();

                g.save();
                g.beginPath();
                g.rect(box.left, box.top, box.size, box.size);
                g.clip();
                racers.forEach(function (racer) {
                    if (!racer.on || racer.steps === 0) return;
                    const color = c.series[BALL_COLORS[racer.index]];
                    const points = [];
                    for (let k = 0; k < racer.trail.length; k += 2) points.push(toScreen(land, box, racer.trail[k], racer.trail[k + 1]));
                    const at = shownAt(racer, progress);
                    drawTrail(g, points, points.length - 1, toScreen(land, box, at[0], at[1]), color, true, TRAIL_DASHES[racer.index]);
                });
                g.restore();

                // the start, and before the race its downhill arrow
                const home = toScreen(land, box, start[0], start[1]);
                if (state === "ready") drawDownhill(g, home[0], home[1], land.grad(start[0], start[1]), c);
                kit.marker(g, "ring", home[0], home[1], 8, c.text);

                racers.forEach(function (racer) {
                    if (!racer.on || racer.steps === 0) return;      // still at the start, under its ring
                    const color = c.series[BALL_COLORS[racer.index]];
                    if (racer.state === "exploded") {
                        const crash = toScreen(land, box, exitPoint(racer)[0], exitPoint(racer)[1]);
                        drawCrash(g, crash[0], crash[1], color, c);
                        return;
                    }
                    const at = shownAt(racer, progress);
                    if (inside(land, at[0], at[1])) {
                        const p = toScreen(land, box, at[0], at[1]);
                        drawBall(g, BALL_SHAPES[racer.index], p[0], p[1], color, glow && racer.state === "moving");
                    } else {
                        const d = land.domain;
                        const edge = toScreen(land, box, A.util.clamp(at[0], d.x[0], d.x[1]), A.util.clamp(at[1], d.y[0], d.y[1]));
                        const far = toScreen(land, box, at[0], at[1]);
                        drawEdgeArrow(g, edge[0], edge[1], Math.atan2(far[1] - edge[1], far[0] - edge[0]), color, c);
                    }
                });

                bursts.forEach(function (burst) {
                    const age = (now - burst.born) / BURST_MS;
                    if (age >= 1 || !glow) return;
                    const p = toScreen(land, box, burst.x, burst.y);
                    drawBurst(g, p[0], p[1], c.series[BALL_COLORS[burst.racer.index]], age);
                });
            }

            function drawSurfaceView(progress) {
                const g = scene.ctx;
                const c = kit.colors();
                const cam = camera(scene, yaw, tilt);
                const colourKey = land.id + "|" + c.theme;
                if (!surfaceColours || coloursKey !== colourKey) {
                    surfaceColours = meshColours(buildMesh(land));
                    coloursKey = colourKey;
                }
                const key = [colourKey, scene.width, scene.height, scene.dpr, yaw, tilt].join("|");
                if (!surfacePicture || surfaceKey !== key) {
                    surfacePicture = buildSurfacePicture(scene, land, cam, surfaceColours);
                    surfaceKey = key;
                }
                g.clearRect(0, 0, scene.width, scene.height);
                g.drawImage(surfacePicture, 0, 0, scene.width, scene.height);
                const glow = A.motion.ok();
                const now = performance.now();

                // a point of the map on the surface, a little above it so the balls sit on top
                function onSurface(x, y, lift) {
                    const p = boxPoint(land, x, y);
                    const at = project(cam, p[0], p[1], p[2]);
                    return [at[0], at[1] - (lift || 0)];
                }

                racers.forEach(function (racer) {
                    if (!racer.on || racer.steps === 0) return;
                    const color = c.series[BALL_COLORS[racer.index]];
                    const count = racer.trail.length / 2;
                    const stride = Math.max(1, Math.ceil(count / TRAIL_POINTS_3D));
                    const points = [];
                    for (let k = 0; k < count; k += stride) {
                        const x = racer.trail[2 * k];
                        const y = racer.trail[2 * k + 1];
                        if (!inside(land, x, y)) break;
                        points.push(onSurface(x, y, 2));
                    }
                    const at = shownAt(racer, progress);
                    if (!points.length) return;
                    const end = inside(land, at[0], at[1]) ? onSurface(at[0], at[1], 2) : points[points.length - 1];
                    drawTrail(g, points, points.length, end, color, false, TRAIL_DASHES[racer.index]);
                });

                const home = onSurface(start[0], start[1], 0);
                g.lineWidth = 2;
                g.strokeStyle = kit.alpha(c.text, 0.75);
                g.beginPath();
                g.moveTo(home[0], home[1]);
                g.lineTo(home[0], home[1] - 18);
                g.stroke();
                kit.marker(g, "ring", home[0], home[1] - 18, 6, c.text);

                racers.forEach(function (racer) {
                    if (!racer.on || racer.steps === 0) return;
                    const color = c.series[BALL_COLORS[racer.index]];
                    if (racer.state === "exploded") {
                        const exit = exitPoint(racer);
                        const crash = onSurface(exit[0], exit[1], 0);
                        drawCrash(g, crash[0], crash[1], color, c);
                        const burst = bursts.filter(function (item) { return item.racer === racer; })[0];
                        const age = burst ? (now - burst.born) / BURST_MS : 1;
                        if (glow && age < 1) drawBurst(g, crash[0], crash[1], color, age);
                        return;
                    }
                    const at = shownAt(racer, progress);
                    if (!inside(land, at[0], at[1])) return;
                    const p = onSurface(at[0], at[1], BALL_RADIUS - 1);
                    drawBall(g, BALL_SHAPES[racer.index], p[0], p[1], color, glow && racer.state === "moving");
                });
            }

            // ----- Texts that follow the race -----
            // The ball the explanation follows: the first one that is on
            function followed() {
                for (let i = 0; i < racers.length; i++) {
                    if (racers[i].on) return racers[i];
                }
                return null;
            }

            // A ball's state in one word: waiting, moving, loose (noise shakes it off a flat spot),
            // arrived, local, saddle, exploded or limit (out of steps). With noise a ball never stops
            // exactly: it settles and jiggles around a dip ("jiggleLowest", "jiggleLocal").
            function stateName(racer) {
                if (racer.jiggling) return racer.state === "arrived" ? "jiggleLowest" : "jiggleLocal";
                if (racer.state === "stuck") return racer.kind === "local" ? "local" : "saddle";
                if (racer.state !== "moving") return racer.state;
                if (racer.stuckAt && noisy && !racer.escaped) return "loose";
                return racer.steps ? "moving" : "waiting";
            }

            // The same in a few words, for its card: "At the lowest point."
            function stateWords(racer) {
                return t("lab.descent.state." + stateName(racer));
            }

            // The news when a ball stops, for screen readers: "Ball 1 reached the lowest point in 39 steps."
            const NEWS = {
                arrived: "lab.descent.arrived",
                jiggleLowest: "lab.descent.arrived",
                local: "lab.descent.stuckLocal",
                jiggleLocal: "lab.descent.stuckLocal",
                saddle: "lab.descent.stuckSaddle",
                exploded: "lab.descent.exploded",
                limit: "lab.descent.limit"
            };

            function newsText(racer) {
                const name = stateName(racer);
                if (!NEWS[name]) return ballName(racer.index) + ": " + stateWords(racer);
                return A.plural(NEWS[name], racer.steps, { ball: ballName(racer.index) });
            }

            function sceneLabel() {
                return t(viewName === "3d" ? "lab.descent.scene3d" : "lab.descent.sceneMap", { land: t("lab.descent.land." + land.id) });
            }

            function describeScene() {
                const startGrad = land.grad(start[0], start[1]);
                const parts = [t(viewName === "3d" ? "lab.descent.describe3d" : "lab.descent.describeMap", {
                    land: t("lab.descent.land." + land.id),
                    start: pair(start[0], start[1]),
                    height: num(lossAt(land, start[0], start[1])),
                    slope: num(Math.hypot(startGrad[0], startGrad[1])),
                    yaw: A.format.number(Math.round(yaw)),
                    tilt: A.format.number(Math.round(tilt))
                })];
                racers.forEach(function (racer) {
                    if (!racer.on) return;
                    parts.push(t("lab.descent.describeBall", {
                        ball: ballName(racer.index),
                        opt: t("lab.descent.opt." + racer.opt),
                        rate: num(racer.rate),
                        at: pair(racer.p[0], racer.p[1]),
                        loss: num(racer.losses[racer.losses.length - 1])
                    }) + " " + stateWords(racer));
                });
                scene.describe(parts.join(" "));
            }

            function showLandscape() {
                about.innerHTML = t("lab.descent.about." + land.id);
                ridgeButton.element.hidden = land.id !== "saddle";
                // the marks this map has, each with its little picture
                const names = ["start", "arrow", "lowest"];
                if (land.minima.some(function (point) { return !point.lowest; })) names.push("dip");
                if (land.saddles) names.push("saddle");
                marks.textContent = "";
                names.forEach(function (name) {
                    const item = el("span", "gd-marks-item");
                    item.innerHTML = mapMarkSVG(name);
                    item.appendChild(document.createTextNode(t("lab.descent.mark." + name)));
                    marks.appendChild(item);
                });
                updateLegend();
                labelScene();
            }

            // The canvas's name says which landscape and which view it shows (and the CSS picks the cursor)
            function labelScene() {
                scene.box.setAttribute("data-view", viewName);
                kit.relabel(scene.box);
            }

            function updateLegend() {
                const items = [];
                configs.forEach(function (config, index) {
                    if (!config.on) return;
                    items.push({ labelKey: function () { return ballName(index) + " · " + t("lab.descent.opt." + config.opt); }, colorIndex: BALL_COLORS[index], shape: BALL_SHAPES[index] });
                });
                legend.update(items);
            }

            function writeIdea() {
                fillSentence(idea, "lab.descent.ideaLine", {
                    loss: function () { return kit.termLink("loss", "lab.descent.termLoss"); },
                    training: function () { return kit.termLink("training", "lab.descent.termTraining"); },
                    parameters: function () { return kit.termLink("parameters", "lab.descent.termParameters"); },
                    gd: function () { return kit.termLink("gradient-descent", "lab.descent.termGD"); },
                    nn: function () { return kit.termLink("neural-network", "lab.descent.termNN"); }
                });
            }

            // ----- Everything on screen follows the numbers (once per frame while running) -----
            function render(progress) {
                drawScene(progress);
                const steps = racers.reduce(function (sum, racer) { return sum + racer.steps; }, 0);
                if (steps !== chartSteps) {
                    chart.draw();
                    chartSteps = steps;
                }
                cards.forEach(function (card) {
                    const racer = racers[card.index];
                    if (!racer || !racer.on) return;
                    const g = land.grad(racer.p[0], racer.p[1]);
                    card.stats.steps.set(racer.steps);
                    card.stats.loss.set(racer.losses[racer.losses.length - 1]);
                    card.stats.slope.set(Math.hypot(g[0], g[1]));
                    A.dom.setText(card.line, stateWords(racer));
                    A.dom.setAttr(card.line, "data-state", stateName(racer));
                });
                updateExplain();
                describeScene();
                challenges.check({ landscape: land.id, noisy: noisy, racers: racers.filter(function (racer) { return racer.on; }) });
                // a burst still fading after the race stopped: keep drawing until it is gone
                if (bursts.length && !loop.running()) drawSoon();
            }

            function updateExplain() {
                const racer = followed();
                const p = racer ? racer.p : start;
                const rate = racer ? racer.rate : configs[0].rate;
                const g = land.grad(p[0], p[1]);
                const next = stepGD(p, g, rate);
                explain.setValues(0, { ball: racer ? ballName(racer.index) : ballName(0), loss: num(lossAt(land, p[0], p[1])) });
                explain.setValues(1, { grad: pair(g[0], g[1]), length: num(Math.hypot(g[0], g[1])) });
                explain.setValues(2, { old: pair(p[0], p[1]), rate: num(rate), grad: pair(g[0], g[1]), next: pair(next[0], next[1]) });
                let current = 1;
                if (state === "done") current = 4;
                else if (state !== "ready") current = racer && racer.opt !== "gd" ? 3 : 2;
                explain.setStep(current);
            }

            // ----- The challenges ("Try this") -----
            function checkExplode(info) {
                return info.landscape === "bowl" && info.racers.some(function (racer) { return racer.opt === "gd" && racer.state === "exploded"; });
            }

            function checkMomentum(info) {
                if (info.landscape !== "valley") return false;
                const plain = info.racers.filter(function (racer) { return racer.opt === "gd" && racer.state === "arrived"; });
                const heavy = info.racers.filter(function (racer) { return racer.opt === "momentum" && racer.state === "arrived"; });
                return plain.some(function (a) {
                    return heavy.some(function (b) { return b.steps <= 0.5 * a.steps; });
                });
            }

            function checkLocal(info) {
                return info.landscape === "valleys" && info.racers.some(function (racer) {
                    return racer.opt === "gd" && racer.state === "stuck" && racer.kind === "local";
                });
            }

            function checkSaddle(info) {
                return info.landscape === "saddle" && info.noisy && info.racers.some(function (racer) { return racer.escaped; });
            }

            // ----- Start -----
            cards.forEach(syncCard);
            showLandscape();
            writeIdea();
            reset();

            // ----- The controller: the hub calls these -----
            return {
                pause: function () {
                    resumeOnShow = loop.running();
                    loop.stop();
                    if (redrawFrame) cancelAnimationFrame(redrawFrame);
                    redrawFrame = 0;
                    bursts = [];
                },
                resume: function () {
                    if (resumeOnShow && state === "running") loop.start();
                    resumeOnShow = false;
                },
                language: function () {
                    kit.relabel(stage);
                    cards.forEach(function (card) { card.element.setAttribute("aria-label", ballName(card.index)); });
                    showLandscape();
                    writeIdea();
                    chartSteps = -1;
                    render(1);
                },
                theme: function () {
                    kit.colors.invalidate();
                    mapPicture = null;
                    surfacePicture = null;
                    surfaceColours = null;
                    chartSteps = -1;
                    render(1);
                },
                motion: function () {
                    if (!A.motion.ok()) bursts = [];
                    render(1);
                },
                destroy: function () {
                    loop.stop();
                    if (redrawFrame) cancelAnimationFrame(redrawFrame);
                    redrawFrame = 0;
                    scene.destroy();
                    chartView.destroy();
                    mapPicture = null;
                    surfacePicture = null;
                }
            };
        }
    });
})();
