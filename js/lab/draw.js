/* =========================================================
   AI COMPASS — LAB: DRAW AND TEACH (an image classifier)
   You teach the computer your own drawings. You draw a few pictures
   of each kind ("Sun", "House", "Fish"); the computer turns each one
   into 28 x 28 = 784 numbers (its pixels) and two models learn from
   those numbers:
     - nearest neighbours: a new drawing gets the kind of the k most
       similar examples (no training at all);
     - a small neural network: 784 numbers -> 32 hidden neurons -> one
       score per kind, trained with backpropagation and Adam.
   Then you test both on new drawings and see where they fail, and why.
   The big idea: a model is only as good as its examples (training data
   and generalisation).
   Its tests: dev/tests/draw.math.js (the maths, in Node) and
   dev/tests/draw.test.js (the page).

   Sections:
    1. Settings
    2. Small helpers
    3. The picture the computer sees (preprocessing)
    4. Example drawings
    5. Nearest neighbours
    6. The neural network
    7. Saving
    8. Drawing
    9. The experiment (A.lab.define)
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
    // ----- The picture the computer sees (section 3) -----
    const GRID = 28;                     // the small picture is 28 x 28 pixels, like the MNIST digits...
    const PIXELS = GRID * GRID;          // ...so 784 numbers
    const FIT = 20;                      // the drawing is scaled until its longer side is 20 pixels
    const PEN_RADIUS = 1;                // the pen is 2 pixels wide in the small picture, whatever the drawing's size

    // ----- The drawing pad -----
    const PAD_PEN = 0.035;               // the pen on the pad: 3.5% of the pad's width (the same look on every screen)
    const MIN_MOVE = 0.004;              // a new point only once the pen has moved this far (a share of the pad)
    const MAX_POINTS = 5000;             // points in one drawing, at most
    const PREDICT_EVERY = 200;           // ms: while you draw, the models guess at most 5 times a second
    const KEY_STEPS = GRID;              // the keyboard pen moves on a 28 x 28 grid...
    const KEY_JUMP = 4;                  // ...4 steps at a time with Shift

    // ----- Kinds of drawings ("classes") and examples -----
    const MIN_CLASSES = 2;               // a classifier needs two kinds at least...
    const MAX_CLASSES = 5;               // ...and this one takes five at most
    const MAX_NAME = 16;                 // letters in a name, at most
    const MAX_PER_CLASS = 30;            // examples of one kind, at most
    const MAX_TEST = 40;                 // test drawings, at most
    const MIN_TEST = 3;                  // test accuracy needs at least this many test drawings
    const COLORS = 6;                    // a kind gets one of the first 6 series colours (they stay apart for colour-blind eyes)
    const START_CLASSES = [              // the first three kinds and their colours: gold, violet, cyan
        { key: "sun", color: 4 },
        { key: "house", color: 1 },
        { key: "fish", color: 0 }
    ];

    // ----- Example drawings (section 4) -----
    const KINDS = ["sun", "house", "fish"];   // the shapes the generator can draw (and the first three classes)
    const EXAMPLE_SEED = 2024;           // "Load example drawings": always the same drawings...
    const EXAMPLES_PER_KIND = 8;         // ...8 of each kind
    const CHECK_SEED = 777;              // another seed: a hidden check set, for the tests only

    // ----- Nearest neighbours (section 5) -----
    const K = { min: 1, max: 7, value: 3 };   // the k slider

    // ----- The neural network (section 6) -----
    const HIDDEN = 32;                   // hidden neurons (ReLU)
    const LEARNING_RATE = 0.003;         // Adam's step size
    const ADAM = { beta1: 0.9, beta2: 0.999, epsilon: 1e-8 };
    const BATCH = 16;                    // examples per mini-batch (one weight update)
    const WEIGHT_DECAY = 0.0005;         // L2: a small pull of every weight towards 0 (keeps them modest)
    const NET_SEED = 7;                  // the first random weights (He initialisation)
    const TRAIN_SEED = 31;               // the order of the examples and their wiggles (the same every time)
    const EPOCHS = 60;                   // "Train" stops after 60 epochs (passes over all examples)...
    const GOOD_LOSS = 0.05;              // ...or as soon as the loss is below 0.05
    const MORE_EPOCHS = 20;              // "Train more": 20 more epochs
    const CHUNK = 2;                     // examples per loop step (the loop fits as many steps as it can into a frame)
    const CHECK_CHUNK = 8;               // examples per step of the check after each epoch (no learning, so quicker)
    const TRAIN_BUDGET = 2;              // ms of training per frame: with the chart and the scores, a frame stays well under 8 ms
    // "Wiggle the examples" (data augmentation): each time an example is used it is
    // moved by up to 2 pixels, turned by up to 12 degrees and scaled by up to 10%
    const WIGGLE = { shift: 2, turn: 12, scale: 0.1 };

    // ----- "Try this" -----
    const SURE_SUN = 0.8;                // challenge 1: the network says "sun" this surely
    const LOOKS_GOOD = { train: 1, test: 0.6, tests: 5 };   // challenge 2: 100% training, 60% test at most
    const FIXED = { test: 0.8, tests: 5 };                   // challenge 3 (after challenge 2): 80% test accuracy at least
    const FOOLED = 0.7;                  // challenge 4: both models wrong, each at least this sure

    // ----- Saving: ctx.store "data" = { v: 1, classes, train, test } and "settings" = { v: 1, k, wiggle } -----
    const SAVE_VERSION = 1;

    // ----- On screen (section 8) -----
    const CHART_HEIGHT = 150;            // px: the loss chart
    const NUMBER_CELL = 34;              // px: a zoomed-in pixel with its number written in it needs this much room...
    const ZOOM = { min: 4, max: 10 };    // ...so the zoomed corner is 4 to 10 pixels across
    const MAP_CELLS = 2;                 // the small map of the whole picture covers 2 x 2 zoomed pixels
    const MIN_GRID_CELL = 6;             // px: smaller pixels get no lines between them
    const DARK_TEXT = 0.45;              // a number on a pixel with this much ink (or more) is written in the light colour
    const FOCUS_INK = 0.35;              // "Focus": the drawing shows faintly under the colours...
    const FOCUS_FULL = 0.9;              // ...the pixels above the 90th percentile get the full colour...
    const FOCUS_GAMMA = 0.7;             // ...and weak colours are made a little stronger, so they show
    const MESSAGE_FONT = { min: 13, max: 16 };   // px: a message in the middle of a canvas
    const GLOW = 2.4;                    // the soft glow under the ink is this many times wider than the pen (not in calm mode)
    const OVERFIT_GAP = 0.2;             // "What's happening?" points at step 5 when test accuracy is 20 points below training

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    // ----- Base64: a short text for the 784 bytes of a picture, to save it -----
    // Every 3 bytes (24 bits) become 4 letters of 6 bits each; "=" fills the end.
    const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function toBase64(bytes) {
        let text = "";
        for (let i = 0; i < bytes.length; i += 3) {
            const left = bytes.length - i;
            const bits = (bytes[i] << 16) | ((left > 1 ? bytes[i + 1] : 0) << 8) | (left > 2 ? bytes[i + 2] : 0);
            text += BASE64[(bits >> 18) & 63] + BASE64[(bits >> 12) & 63] +
                (left > 1 ? BASE64[(bits >> 6) & 63] : "=") + (left > 2 ? BASE64[bits & 63] : "=");
        }
        return text;
    }

    // The bytes back, or null when the text is not base64 of exactly "size" bytes
    function fromBase64(text, size) {
        if (typeof text !== "string" || text.length !== Math.ceil(size / 3) * 4) return null;
        const bytes = new Uint8Array(size);
        let at = 0;
        for (let i = 0; i < text.length; i += 4) {
            let bits = 0;
            for (let j = 0; j < 4; j++) {
                const letter = text[i + j];
                const value = letter === "=" ? 0 : BASE64.indexOf(letter);
                if (value === -1) return null;
                bits = (bits << 6) | value;
            }
            [(bits >> 16) & 255, (bits >> 8) & 255, bits & 255].forEach(function (byte) {
                if (at < size) bytes[at++] = byte;
            });
        }
        return bytes;
    }

    // ----- Page parts that the kit doesn't have (yet) -----
    let idCount = 0;

    // A new id, to link an element to its label or description: "dw-help-7"
    function uid(name) {
        idCount += 1;
        return "dw-" + name + "-" + idCount;
    }

    function el(tag, className, attributes) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        Object.keys(attributes || {}).forEach(function (name) { element.setAttribute(name, attributes[name]); });
        return element;
    }

    function percent(share) {
        return A.format.percent(share);
    }

    // An element whose text is a translation key: core writes it again after a language change
    function textEl(tag, className, key) {
        const element = el(tag, className, { "data-i18n": key });
        element.textContent = t(key);
        return element;
    }

    // An attribute that is a translation key (data-i18n-attr="name:key", which core follows too)
    function textAttribute(element, attribute, key) {
        const pairs = (element.getAttribute("data-i18n-attr") || "").split(",").filter(Boolean);
        element.setAttribute("data-i18n-attr", pairs.concat(attribute + ":" + key).join(","));
        element.setAttribute(attribute, t(key));
    }

    // A text with HTML (<strong>) whose values are data, such as a name you typed: the values are
    // escaped, so they always show as plain letters
    function safeText(key, values) {
        const safe = {};
        Object.keys(values || {}).forEach(function (name) { safe[name] = A.escapeHTML(String(values[name])); });
        return t(key, safe);
    }

    // TODO(kit): a panel with a heading. kit.group() names its box with a <span>; in the hub an
    // experiment's panel titles are <h4> headings, so screen-reader users can jump between them.
    function panel(titleKey, children, className) {
        const box = kit.group(null, children);
        const title = textEl("h4", "dw-title", titleKey);
        title.id = uid("title");
        box.setAttribute("aria-labelledby", title.id);
        box.prepend(title);
        if (className) box.classList.add(className);
        return box;
    }

    // TODO(kit): a sentence with glossary links in it (kit.sentence). The text "... {overfitting} ..."
    // is cut at its {placeholders}, and each one becomes the element given for it (kit.termLink),
    // kept on one line.
    function fillSentence(element, key, links) {
        element.textContent = "";
        t(key).split(/\{(\w+)\}/).forEach(function (part, index) {
            if (index % 2 === 0) {
                element.append(part);
            } else {
                const term = el("span", "dw-term");
                term.append(links[part] || "{" + part + "}");
                element.append(term);
            }
        });
    }

    // TODO(kit): a list of buttons with one tab stop (a "roving tabindex"). Tab reaches the list
    // once; the arrow keys, Home and End move between its buttons.
    function roving(list) {
        function buttons() {
            return Array.prototype.slice.call(list.querySelectorAll("button"));
        }
        list.addEventListener("keydown", function (event) {
            const all = buttons();
            const at = all.indexOf(document.activeElement);
            const moves = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };
            let next = -1;
            if (at === -1) return;
            if (moves[event.key]) next = A.util.clamp(at + moves[event.key], 0, all.length - 1);
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = all.length - 1;
            if (next === -1) return;
            event.preventDefault();
            all[next].focus();
        });
        list.addEventListener("focusin", function (event) {
            buttons().forEach(function (button) { button.tabIndex = button === event.target ? 0 : -1; });
        });
    }

    // Which button of a list has the tab stop (0 when none has it)
    function tabStopOf(list) {
        return Math.max(0, Array.prototype.indexOf.call(list.querySelectorAll("button"), list.querySelector("button[tabindex='0']")));
    }

    // After a list of buttons is filled: one of them (number "at", or the last one) takes the tab stop
    function setTabStop(list, at) {
        const all = list.querySelectorAll("button");
        Array.prototype.forEach.call(all, function (button, index) {
            button.tabIndex = index === Math.min(at, all.length - 1) ? 0 : -1;
        });
    }

    /* =========================================================
       3. THE PICTURE THE COMPUTER SEES
       A drawing is a list of strokes; a stroke is a list of points
       { x, y } from 0 to 1 (a share of the pad, so every screen size
       gives the same numbers). It becomes 784 numbers the way the famous
       MNIST digits were made:
         1. crop: the smallest box around the ink;
         2. scale: the longer side of that box becomes 20 pixels, and the
            proportions stay;
         3. centre: the picture moves so that the centre of mass of the
            ink (its balance point) sits in the middle of a 28 x 28 grid;
         4. read: each pixel becomes a number from 0 (no ink) to 1 (full
            ink). A pixel at the edge of a line gets a share of the ink:
            that is anti-aliasing.
       The pen is 2 pixels wide in the small picture, so a small drawing
       and a big one give the same picture.
       ========================================================= */
    // The smallest box around every point, or null when there is no point
    function boundingBox(strokes) {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;
        strokes.forEach(function (stroke) {
            stroke.forEach(function (point) {
                left = Math.min(left, point.x);
                right = Math.max(right, point.x);
                top = Math.min(top, point.y);
                bottom = Math.max(bottom, point.y);
            });
        });
        if (left === Infinity) return null;
        return { x: left, y: top, width: right - left, height: bottom - top };
    }

    // How far the point (px, py) is from the line segment from (ax, ay) to (bx, by)
    function distanceToSegment(px, py, ax, ay, bx, by) {
        const vx = bx - ax;
        const vy = by - ay;
        const length2 = vx * vx + vy * vy;
        // the share of the way along the segment where it comes closest (0 = at a, 1 = at b)
        const along = length2 > 0 ? A.util.clamp(((px - ax) * vx + (py - ay) * vy) / length2, 0, 1) : 0;
        const dx = ax + along * vx - px;
        const dy = ay + along * vy - py;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Draws the strokes into a 28 x 28 grid of numbers. "place" turns a point of the pad
    // into grid coordinates: (x * scale + dx, y * scale + dy). A pixel is as dark as the pen
    // covers it, judged by how far its centre is from the nearest line: closer than
    // PEN_RADIUS - 0.5 is full ink (1), further than PEN_RADIUS + 0.5 is none (0), and in
    // between it gets a share.
    function rasterise(strokes, place) {
        const reach = PEN_RADIUS + 0.5;
        const nearest = new Float64Array(PIXELS).fill(Infinity);
        strokes.forEach(function (stroke) {
            // each piece of line from one point to the next (a single point is a dot)
            for (let i = stroke.length > 1 ? 1 : 0; i < stroke.length; i++) {
                const from = stroke[Math.max(0, i - 1)];
                const ax = from.x * place.scale + place.dx;
                const ay = from.y * place.scale + place.dy;
                const bx = stroke[i].x * place.scale + place.dx;
                const by = stroke[i].y * place.scale + place.dy;
                // only the pixels near this piece can get its ink
                const left = Math.max(0, Math.floor(Math.min(ax, bx) - reach));
                const right = Math.min(GRID - 1, Math.floor(Math.max(ax, bx) + reach));
                const top = Math.max(0, Math.floor(Math.min(ay, by) - reach));
                const bottom = Math.min(GRID - 1, Math.floor(Math.max(ay, by) + reach));
                for (let row = top; row <= bottom; row++) {
                    for (let col = left; col <= right; col++) {
                        const distance = distanceToSegment(col + 0.5, row + 0.5, ax, ay, bx, by);
                        if (distance < nearest[row * GRID + col]) nearest[row * GRID + col] = distance;
                    }
                }
            }
        });
        const pixels = new Float64Array(PIXELS);
        for (let i = 0; i < PIXELS; i++) pixels[i] = A.util.clamp(reach - nearest[i], 0, 1);
        return pixels;
    }

    // The balance point of the ink: the average position of the pixels, each one counted
    // as much as its ink. (Pixel col, row has its centre at col + 0.5, row + 0.5.)
    function centreOfMass(pixels) {
        let mass = 0;
        let sumX = 0;
        let sumY = 0;
        for (let i = 0; i < PIXELS; i++) {
            mass += pixels[i];
            sumX += pixels[i] * ((i % GRID) + 0.5);
            sumY += pixels[i] * (Math.floor(i / GRID) + 0.5);
        }
        if (mass === 0) return { x: GRID / 2, y: GRID / 2, mass: 0 };
        return { x: sumX / mass, y: sumY / mass, mass: mass };
    }

    // The four steps. Returns the 784 numbers and what each step found (the tests check
    // them): { pixels, box, scale, mass (before centring), shift }; null for an empty pad.
    function preprocess(strokes) {
        // 1. Crop
        const box = boundingBox(strokes);
        if (!box) return null;
        // 2. Scale: the longer side of the lines becomes 18 pixels, and the pen adds 1 pixel
        //    on each side, so the ink is 20 pixels long. (A single dot is not scaled.)
        const longest = Math.max(box.width, box.height);
        const scale = longest > 0 ? (FIT - 2 * PEN_RADIUS) / longest : 1;
        const place = {
            scale: scale,
            dx: GRID / 2 - (box.x + box.width / 2) * scale,
            dy: GRID / 2 - (box.y + box.height / 2) * scale
        };
        // 3. Centre: move the ink's balance point to the middle, but never push ink off the grid
        const mass = centreOfMass(rasterise(strokes, place));
        const roomX = (GRID - box.width * scale - 2 * PEN_RADIUS) / 2;
        const roomY = (GRID - box.height * scale - 2 * PEN_RADIUS) / 2;
        const shift = {
            x: A.util.clamp(GRID / 2 - mass.x, -roomX, roomX),
            y: A.util.clamp(GRID / 2 - mass.y, -roomY, roomY)
        };
        place.dx += shift.x;
        place.dy += shift.y;
        // 4. Read the numbers, rounded to steps of 1/255 (pictures are saved as bytes)
        const pixels = rasterise(strokes, place);
        for (let i = 0; i < PIXELS; i++) pixels[i] = Math.round(pixels[i] * 255) / 255;
        return { pixels: pixels, box: box, scale: scale, mass: mass, shift: shift };
    }

    // A picture ready for the models: its numbers, where its ink is (most of the 784
    // numbers are 0, and the maths can skip those), and the sum of its squares
    function picture(pixels) {
        const ink = [];
        let square = 0;
        for (let i = 0; i < PIXELS; i++) {
            if (pixels[i] !== 0) {
                ink.push(i);
                square += pixels[i] * pixels[i];
            }
        }
        return { values: pixels, ink: ink, square: square };
    }

    /* =========================================================
       4. EXAMPLE DRAWINGS
       Suns, houses and fish, drawn by the computer the way a hand would:
       the shape is built from lines and ovals, then the whole drawing is
       moved, turned and resized a little, and every point wobbles. A seed
       always gives the same drawings (kit.rng).
       ========================================================= */
    // Points along a straight line from a to b, in "steps" pieces
    function linePoints(a, b, steps) {
        const points = [];
        for (let i = 0; i <= steps; i++) {
            points.push({ x: a.x + ((b.x - a.x) * i) / steps, y: a.y + ((b.y - a.y) * i) / steps });
        }
        return points;
    }

    // Points along lines through several corners, one after another
    function pathPoints(corners, stepsPerLine) {
        let points = [corners[0]];
        for (let i = 1; i < corners.length; i++) points = points.concat(linePoints(corners[i - 1], corners[i], stepsPerLine).slice(1));
        return points;
    }

    // Points along an oval around (cx, cy) with radii rx and ry, from the angle "start",
    // going round by "sweep" radians (a full turn is 2π)
    function ovalPoints(cx, cy, rx, ry, start, sweep, steps) {
        const points = [];
        for (let i = 0; i <= steps; i++) {
            const angle = start + (sweep * i) / steps;
            points.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
        }
        return points;
    }

    // The three shapes, drawn around (0, 0), about 0.6 to 0.8 wide (y grows downwards)
    const SHAPES = {
        // A circle and 6 to 10 rays around it
        sun: function (random) {
            const radius = random.range(0.13, 0.17);
            const strokes = [ovalPoints(0, 0, radius, radius * random.range(0.9, 1.1), random.range(0, 2 * Math.PI), 2 * Math.PI + random.range(0.1, 0.4), 30)];
            const rays = 6 + random.int(5);
            const turn = random.range(0, 2 * Math.PI);
            for (let i = 0; i < rays; i++) {
                const angle = turn + (2 * Math.PI * i) / rays + random.range(-0.15, 0.15);
                const inner = radius * random.range(1.25, 1.45);
                const outer = radius * random.range(1.9, 2.3);
                strokes.push(linePoints(
                    { x: Math.cos(angle) * inner, y: Math.sin(angle) * inner },
                    { x: Math.cos(angle) * outer, y: Math.sin(angle) * outer }, 4));
            }
            return strokes;
        },
        // A square, a roof and a door
        house: function (random) {
            const half = random.range(0.2, 0.26);
            const height = random.range(0.3, 0.4);
            const roof = random.range(0.2, 0.3);
            const top = (roof - height) / 2;          // the middle of the house at y = 0
            const bottom = top + height;
            const doorLeft = random.range(-half * 0.6, half * 0.2);
            const doorWidth = random.range(0.08, 0.12);
            const doorTop = bottom - height * random.range(0.45, 0.6);
            return [
                pathPoints([{ x: -half, y: top }, { x: half, y: top }, { x: half, y: bottom }, { x: -half, y: bottom }, { x: -half, y: top }], 6),
                pathPoints([{ x: -half - 0.03, y: top }, { x: random.range(-0.04, 0.04), y: top - roof }, { x: half + 0.03, y: top }], 6),
                pathPoints([{ x: doorLeft, y: bottom }, { x: doorLeft, y: doorTop }, { x: doorLeft + doorWidth, y: doorTop }, { x: doorLeft + doorWidth, y: bottom }], 3)
            ];
        },
        // An oval body, a tail on the right and an eye on the left (the fish swims to the left)
        fish: function (random) {
            const rx = random.range(0.24, 0.3);
            const ry = random.range(0.13, 0.18);
            const tailX = rx * 0.92;
            const tailLength = random.range(0.15, 0.22);
            const spread = random.range(0.11, 0.16);
            const eyeX = -rx * random.range(0.5, 0.62);
            const eyeY = -ry * random.range(0.2, 0.4);
            return [
                ovalPoints(-0.06, 0, rx, ry, random.range(0, 2 * Math.PI), 2 * Math.PI + random.range(0.1, 0.3), 30),
                pathPoints([{ x: tailX - 0.06, y: 0 }, { x: tailX - 0.06 + tailLength, y: -spread }, { x: tailX - 0.06 + tailLength, y: spread }, { x: tailX - 0.06, y: 0 }], 4),
                ovalPoints(eyeX - 0.06, eyeY, 0.025, 0.025, 0, 2 * Math.PI, 10)
            ];
        }
    };

    // The hand: the whole drawing is resized, stretched, turned and moved a little, and
    // each line wobbles (a slow wave plus a little noise). The result is in pad units (0..1).
    function handDrawn(strokes, random) {
        const size = random.range(0.9, 1.15);
        const stretch = random.range(0.92, 1.08);
        const turn = random.range(-0.14, 0.14);            // radians: about 8 degrees either way
        const cx = 0.5 + random.range(-0.06, 0.06);
        const cy = 0.5 + random.range(-0.06, 0.06);
        const cos = Math.cos(turn);
        const sin = Math.sin(turn);
        return strokes.map(function (stroke) {
            const phase = random.range(0, 2 * Math.PI);
            const waves = random.range(1, 3);
            const amount = random.range(0.004, 0.01);
            return stroke.map(function (point, i) {
                const wobble = amount * Math.sin(phase + (2 * Math.PI * waves * i) / stroke.length);
                const x = point.x * size * stretch + wobble + random.normal(0, 0.002);
                const y = (point.y * size) / stretch - wobble + random.normal(0, 0.002);
                return {
                    x: A.util.clamp(cx + x * cos - y * sin, 0, 1),
                    y: A.util.clamp(cy + x * sin + y * cos, 0, 1)
                };
            });
        });
    }

    // One drawing of a kind ("sun", "house" or "fish")
    function drawExample(kind, random) {
        return handDrawn(SHAPES[kind](random), random);
    }

    // "perKind" drawings of each kind from one seed, in the order sun, house, fish, sun...
    // -> [{ kind, strokes }]
    function makeExamples(seed, perKind) {
        const random = kit.rng(seed);
        const list = [];
        for (let i = 0; i < perKind; i++) {
            KINDS.forEach(function (kind) {
                list.push({ kind: kind, strokes: drawExample(kind, random) });
            });
        }
        return list;
    }

    /* =========================================================
       5. NEAREST NEIGHBOURS ("k-NN")
       No training: to guess, compare the drawing with every example.
       Two pictures are as far apart as the straight-line (Euclidean)
       distance between their 784 numbers: the square root of the sum
       of (a - b)² over all pixels. The k nearest examples vote.
       ========================================================= */
    // The squared distance, quickly: (a - b)² = a² + b² - 2ab added up over all pixels, and
    // the products ab are 0 wherever a has no ink, so only a's ink pixels are visited
    function squaredDistance(a, b) {
        let product = 0;
        for (let i = 0; i < a.ink.length; i++) product += a.values[a.ink[i]] * b.values[a.ink[i]];
        return Math.max(0, a.square + b.square - 2 * product);
    }

    // The examples' indexes from the nearest to the furthest (equal distances: the older
    // example first). skip: an index to leave out (the example itself).
    function rankExamples(examples, input, skip) {
        const list = [];
        examples.forEach(function (example, index) {
            if (index !== skip) list.push({ index: index, distance: squaredDistance(input, example) });
        });
        list.sort(function (a, b) { return a.distance - b.distance || a.index - b.index; });
        return list.map(function (item) { return item.index; });
    }

    // The k nearest examples vote. -> { shares (one per class, adding up to 1), best (a class
    // index, or -1 without examples), confidence (the winner's share), nearest (indexes) }
    // A tie goes to the class whose example is nearest.
    function knnVote(examples, ranked, k, classCount) {
        const nearest = ranked.slice(0, k);
        const shares = new Array(classCount).fill(0);
        nearest.forEach(function (index) { shares[examples[index].c] += 1 / nearest.length; });
        let best = -1;
        nearest.forEach(function (index) {
            const c = examples[index].c;
            if (best === -1 || shares[c] > shares[best] + 1e-9) best = c;
        });
        return { shares: shares, best: best, confidence: best === -1 ? 0 : shares[best], nearest: nearest };
    }

    function knnPredict(examples, input, k, classCount) {
        return knnVote(examples, rankExamples(examples, input, -1), k, classCount);
    }

    // Training accuracy "leave one out": each example is guessed from all the others
    // (with itself among them it would always find itself, and score 100%).
    // null with fewer than 2 examples. ranks: each example's rankExamples(), when they are known
    // already (they don't depend on k, so the page keeps them until the examples change).
    function leaveOneOut(examples, k, classCount, ranks) {
        if (examples.length < 2) return null;
        let right = 0;
        examples.forEach(function (example, index) {
            const ranked = ranks ? ranks[index] : rankExamples(examples, example, index);
            if (knnVote(examples, ranked, k, classCount).best === example.c) right += 1;
        });
        return right / examples.length;
    }

    /* =========================================================
       6. THE NEURAL NETWORK
       784 inputs -> 32 hidden neurons -> one score per class.
       - A hidden neuron adds up every input times its weight, plus its
         bias, and keeps the sum if it is positive (ReLU), else 0.
       - Each class's score is the same sum over the hidden neurons.
       - Softmax turns the scores into probabilities that add up to 1:
         p = e^score / (the sum of e^score over all classes).
       - The loss (cross-entropy) is -log(p of the right class): small
         when the network is sure and right, big when it is sure and wrong.
       - Backpropagation works out, for every weight, how much the loss
         changes when the weight grows (its gradient); Adam moves each
         weight a small step against it. One mini-batch of 16 examples
         gives one step; one pass over all examples is an epoch.
       - L2 weight decay adds WEIGHT_DECAY/2 · (every weight)² to the loss,
         so weights don't grow huge on a handful of examples.
       ========================================================= */
    // A new network with random weights (He initialisation: a bell curve whose spread
    // suits ReLU neurons, √(2 / inputs)). Its numbers are in four groups; each group keeps
    // its weights (w), its summed gradients (g) and Adam's two running averages (m, v).
    function createNetwork(classCount, seed) {
        const random = kit.rng(seed);
        function group(name, size, spread, decay) {
            const w = new Float64Array(size);
            if (spread) for (let i = 0; i < size; i++) w[i] = random.normal(0, spread);
            return { name: name, w: w, g: new Float64Array(size), m: new Float64Array(size), v: new Float64Array(size), decay: decay };
        }
        const groups = [
            group("W1", HIDDEN * PIXELS, Math.sqrt(2 / PIXELS), true),     // W1[j * 784 + i]: pixel i -> hidden neuron j
            group("b1", HIDDEN, 0, false),
            group("W2", classCount * HIDDEN, Math.sqrt(2 / HIDDEN), true),  // W2[c * 32 + j]: hidden neuron j -> class c
            group("b2", classCount, 0, false)
        ];
        return { classes: classCount, groups: groups, W1: groups[0].w, b1: groups[1].w, W2: groups[2].w, b2: groups[3].w, steps: 0 };
    }

    function countWeights(net) {
        return net.groups.reduce(function (sum, group) { return sum + group.w.length; }, 0);
    }

    // The same count before a network exists: 784 x 32 + 32 + 32 x classes + classes
    function weightCount(classCount) {
        return HIDDEN * PIXELS + HIDDEN + classCount * HIDDEN + classCount;
    }

    // Probabilities from scores. The biggest score is taken away first: the same
    // answer, but e^score can't overflow.
    function softmax(scores) {
        const top = Math.max.apply(null, scores);
        const exps = scores.map(function (score) { return Math.exp(score - top); });
        const sum = exps.reduce(function (a, b) { return a + b; }, 0);
        return exps.map(function (value) { return value / sum; });
    }

    // Forward pass: the picture through the network.
    // -> { sums (each hidden neuron's sum before ReLU), hidden, scores, probs }
    function forward(net, input) {
        const sums = new Float64Array(HIDDEN);
        const hidden = new Float64Array(HIDDEN);
        for (let j = 0; j < HIDDEN; j++) {
            let sum = net.b1[j];
            const row = j * PIXELS;
            for (let n = 0; n < input.ink.length; n++) sum += net.W1[row + input.ink[n]] * input.values[input.ink[n]];
            sums[j] = sum;
            hidden[j] = sum > 0 ? sum : 0;
        }
        const scores = [];
        for (let c = 0; c < net.classes; c++) {
            let score = net.b2[c];
            for (let j = 0; j < HIDDEN; j++) score += net.W2[c * HIDDEN + j] * hidden[j];
            scores.push(score);
        }
        return { sums: sums, hidden: hidden, scores: scores, probs: softmax(scores) };
    }

    // The network's guess: { probs, best, confidence }
    function netPredict(net, input) {
        const probs = forward(net, input).probs;
        let best = 0;
        probs.forEach(function (p, c) { if (p > probs[best]) best = c; });
        return { probs: probs, best: best, confidence: probs[best] };
    }

    // Backpropagation for one example of class "label": adds its gradients to each
    // group's g, and returns its loss (cross-entropy)
    function backward(net, input, label) {
        const pass = forward(net, input);
        const W1g = net.groups[0].g;
        const b1g = net.groups[1].g;
        const W2g = net.groups[2].g;
        const b2g = net.groups[3].g;
        // With softmax and cross-entropy, a score's gradient is simply p - (1 for the right class, else 0)
        const scoreGrad = pass.probs.map(function (p, c) { return p - (c === label ? 1 : 0); });
        const hiddenGrad = new Float64Array(HIDDEN);
        for (let c = 0; c < net.classes; c++) {
            b2g[c] += scoreGrad[c];
            for (let j = 0; j < HIDDEN; j++) {
                W2g[c * HIDDEN + j] += scoreGrad[c] * pass.hidden[j];
                hiddenGrad[j] += net.W2[c * HIDDEN + j] * scoreGrad[c];
            }
        }
        for (let j = 0; j < HIDDEN; j++) {
            if (pass.sums[j] <= 0) continue;          // ReLU: a neuron that was off passes nothing back
            b1g[j] += hiddenGrad[j];
            const row = j * PIXELS;
            for (let n = 0; n < input.ink.length; n++) W1g[row + input.ink[n]] += hiddenGrad[j] * input.values[input.ink[n]];
        }
        return -Math.log(Math.max(pass.probs[label], 1e-12));
    }

    // The full gradient of one number: the batch's average plus the weight decay's pull
    function gradientOf(group, i, count) {
        return group.g[i] / count + (group.decay ? WEIGHT_DECAY * group.w[i] : 0);
    }

    // One Adam step with the gradients summed over "count" examples, then g is cleared.
    // Adam keeps running averages of each gradient (m) and of its square (v), and moves a
    // weight by about LEARNING_RATE in the direction that lowers the loss.
    function stepAdam(net, count) {
        net.steps += 1;
        const fix1 = 1 - Math.pow(ADAM.beta1, net.steps);     // the averages start at 0: this corrects for it
        const fix2 = 1 - Math.pow(ADAM.beta2, net.steps);
        net.groups.forEach(function (group) {
            for (let i = 0; i < group.w.length; i++) {
                const grad = gradientOf(group, i, count);
                group.m[i] = ADAM.beta1 * group.m[i] + (1 - ADAM.beta1) * grad;
                group.v[i] = ADAM.beta2 * group.v[i] + (1 - ADAM.beta2) * grad * grad;
                group.w[i] -= (LEARNING_RATE * (group.m[i] / fix1)) / (Math.sqrt(group.v[i] / fix2) + ADAM.epsilon);
                group.g[i] = 0;
            }
        });
    }

    // The loss of a batch, as training sees it: the average cross-entropy plus the weight
    // decay (for the tests, which compare the gradients with this)
    function batchLoss(net, inputs, labels) {
        let loss = 0;
        inputs.forEach(function (input, n) { loss -= Math.log(Math.max(forward(net, input).probs[labels[n]], 1e-12)); });
        let squares = 0;
        net.groups.forEach(function (group) {
            if (group.decay) for (let i = 0; i < group.w.length; i++) squares += group.w[i] * group.w[i];
        });
        return loss / inputs.length + (WEIGHT_DECAY / 2) * squares;
    }

    // The gradient of batchLoss for every number of every group: [{ name, grad }] (tests)
    function batchGradient(net, inputs, labels) {
        inputs.forEach(function (input, n) { backward(net, input, labels[n]); });
        return net.groups.map(function (group) {
            const grad = new Float64Array(group.w.length);
            for (let i = 0; i < grad.length; i++) grad[i] = gradientOf(group, i, inputs.length);
            group.g.fill(0);
            return { name: group.name, grad: grad };
        });
    }

    // ----- Wiggle (data augmentation) -----
    // A new 28 x 28 picture: the old one moved by (dx, dy) pixels, turned by "angle" radians
    // and scaled by "scale" around its middle. Each new pixel looks up where it came from in
    // the old picture and mixes the four pixels around that spot (bilinear interpolation).
    // A bigger drawing would get thicker lines too, so the ink is divided by "scale": the
    // pen stays as thick as before.
    function wiggleWith(values, dx, dy, angle, scale) {
        const out = new Float64Array(PIXELS);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const centre = GRID / 2;
        for (let row = 0; row < GRID; row++) {
            for (let col = 0; col < GRID; col++) {
                // undo the move, the turn and the scale: where was this spot before?
                const u = col + 0.5 - centre - dx;
                const v = row + 0.5 - centre - dy;
                const x = (cos * u + sin * v) / scale + centre - 0.5;
                const y = (-sin * u + cos * v) / scale + centre - 0.5;
                const x0 = Math.floor(x);
                const y0 = Math.floor(y);
                const fx = x - x0;
                const fy = y - y0;
                const ink = (1 - fx) * (1 - fy) * pixelAt(values, x0, y0) + fx * (1 - fy) * pixelAt(values, x0 + 1, y0) +
                    (1 - fx) * fy * pixelAt(values, x0, y0 + 1) + fx * fy * pixelAt(values, x0 + 1, y0 + 1);
                out[row * GRID + col] = Math.min(1, ink / scale);
            }
        }
        return out;
    }

    // A pixel of a picture; outside the grid there is no ink
    function pixelAt(values, col, row) {
        return col < 0 || row < 0 || col >= GRID || row >= GRID ? 0 : values[row * GRID + col];
    }

    // A random wiggle within the limits of WIGGLE
    function wiggle(values, random) {
        return wiggleWith(values,
            random.range(-WIGGLE.shift, WIGGLE.shift),
            random.range(-WIGGLE.shift, WIGGLE.shift),
            (random.range(-WIGGLE.turn, WIGGLE.turn) * Math.PI) / 180,
            1 + random.range(-WIGGLE.scale, WIGGLE.scale));
    }

    // ----- Training, a little at a time -----
    // A training run is a plan for a few epochs. trainChunk() does the next small piece of
    // work, so the page can train between frames (kit.loop) and stay smooth. Each epoch:
    //   1. "learn": the examples in a shuffled order, in mini-batches of 16 (wiggled when
    //      that is on): backpropagation, then an Adam step after each batch;
    //   2. "check": every example as it is (not wiggled), to measure the loss and the
    //      training accuracy with the weights at the end of the epoch; then the network's
    //      guess for each test drawing (for the test accuracy), still in small pieces.
    // settings: { seed, wiggle, epochs, goodLoss (0: never stop early) }
    function newRun(settings) {
        return {
            random: kit.rng(settings.seed),
            wiggle: settings.wiggle,
            epochs: settings.epochs,
            goodLoss: settings.goodLoss,
            done: 0,               // epochs finished in this run
            phase: "learn",
            order: null,           // this epoch's shuffled order of the examples
            next: 0,               // the next example in the order (or in the check)
            inBatch: 0,            // examples in the mini-batch so far
            lossSum: 0,
            right: 0,
            guesses: [],           // the check's guesses for the test drawings
            finished: false,
            ending: ""             // "goal" (the loss is small) or "epochs" (the run is over)
        };
    }

    // The next piece of work. Returns the epoch's result { loss, accuracy, guesses } when an
    // epoch has just ended, else null. tests (may be left out): the test drawings to guess.
    function trainChunk(net, run, examples, tests) {
        if (run.finished || !examples.length) return null;
        if (run.phase === "learn") {
            if (!run.order) {
                run.order = run.random.shuffle(examples.map(function (example, index) { return index; }));
                run.next = 0;
            }
            for (let n = 0; n < CHUNK && run.next < run.order.length; n++) {
                const example = examples[run.order[run.next++]];
                backward(net, run.wiggle ? picture(wiggle(example.values, run.random)) : example, example.c);
                run.inBatch += 1;
                if (run.inBatch === BATCH || run.next === run.order.length) {
                    stepAdam(net, run.inBatch);
                    run.inBatch = 0;
                }
            }
            if (run.next === run.order.length) {
                run.phase = "check";
                run.next = 0;
                run.lossSum = 0;
                run.right = 0;
                run.guesses = [];
            }
            return null;
        }
        // the check: the examples first, then the test drawings
        const testCount = tests ? tests.length : 0;
        for (let n = 0; n < CHECK_CHUNK && run.next < examples.length + testCount; n++) {
            if (run.next < examples.length) {
                const example = examples[run.next++];
                const probs = forward(net, example).probs;
                run.lossSum -= Math.log(Math.max(probs[example.c], 1e-12));
                if (probs.indexOf(Math.max.apply(null, probs)) === example.c) run.right += 1;
            } else {
                run.guesses.push(netPredict(net, tests[run.next++ - examples.length]));
            }
        }
        if (run.next < examples.length + testCount) return null;
        const result = { loss: run.lossSum / examples.length, accuracy: run.right / examples.length, guesses: run.guesses };
        run.done += 1;
        run.phase = "learn";
        run.order = null;
        if (run.goodLoss && result.loss < run.goodLoss) {
            run.finished = true;
            run.ending = "goal";
        } else if (run.done >= run.epochs) {
            run.finished = true;
            run.ending = "epochs";
        }
        return result;
    }

    // A whole run at once (the tests; and the Step button, for one epoch) -> the epochs' results
    function trainRun(net, examples, settings) {
        const run = newRun(settings);
        const results = [];
        while (!run.finished) {
            const result = trainChunk(net, run, examples);
            if (result) results.push(result);
        }
        return results;
    }

    // ----- What the network looks at -----
    // For each pixel: how much surer the network gets of class c when that pixel gets a
    // little more ink (the gradient of log p_c, which grows exactly when p_c grows). A pixel
    // that lifts c's score is not enough: if it lifts another class's score more, the network
    // gets less sure of c. So the gradient is
    //   Σ over the other classes k of p_k · (gradient of score c − gradient of score k):
    // how much the pixel lifts c above each rival, counted as much as that rival is likely.
    // Through the hidden neurons that are on, the gradient of score c is Σ over j of
    // W2[c, j] · W1[j, pixel]. (Written this way, it stays right when p_c rounds to 1.)
    function saliency(net, input, c) {
        const pass = forward(net, input);
        const map = new Float64Array(PIXELS);
        for (let j = 0; j < HIDDEN; j++) {
            if (pass.sums[j] <= 0) continue;
            let weight = 0;
            for (let k = 0; k < net.classes; k++) {
                if (k !== c) weight += pass.probs[k] * (net.W2[c * HIDDEN + j] - net.W2[k * HIDDEN + j]);
            }
            const row = j * PIXELS;
            for (let i = 0; i < PIXELS; i++) map[i] += weight * net.W1[row + i];
        }
        return map;
    }

    // The network's accuracy on a list of examples, and its guesses (null without examples)
    function netAccuracy(net, examples) {
        if (!examples.length) return null;
        const guesses = examples.map(function (example) { return netPredict(net, example); });
        const right = guesses.filter(function (guess, n) { return guess.best === examples[n].c; }).length;
        return { accuracy: right / examples.length, guesses: guesses };
    }

    /* =========================================================
       7. SAVING
       ctx.store "data" = { v: 1, classes: [{ key, name, color }],
                            train: [{ c, px, g }], test: [{ c, px }] }
         key    "sun" | "house" | "fish" for the first kinds (their name
                follows the language until you rename them), else null
         name   your name for the kind ("" = the default name)
         color  the series colour (0-5)
         c      the class (its place in classes); px the 784 pixels as
                bytes in base64; g: true for a computer-made example
       The network's weights are not saved: training again takes a second.
       ========================================================= */
    function encodeExample(example, withFlag) {
        const bytes = new Uint8Array(PIXELS);
        for (let i = 0; i < PIXELS; i++) bytes[i] = Math.round(example.values[i] * 255);
        const saved = { c: example.c, px: toBase64(bytes) };
        if (withFlag && example.g) saved.g = true;
        return saved;
    }

    function encodeData(classes, train, test) {
        return {
            v: SAVE_VERSION,
            classes: classes.map(function (item) { return { key: item.key, name: item.name, color: item.color }; }),
            train: train.map(function (example) { return encodeExample(example, true); }),
            test: test.map(function (example) { return encodeExample(example, false); })
        };
    }

    // A saved example back: a picture with its class, or null if anything is odd
    function decodeExample(saved, classCount) {
        if (!saved || typeof saved !== "object" || !Number.isInteger(saved.c) || saved.c < 0 || saved.c >= classCount) return null;
        if (saved.g !== undefined && saved.g !== true) return null;
        const bytes = fromBase64(saved.px, PIXELS);
        if (!bytes) return null;
        const values = new Float64Array(PIXELS);
        for (let i = 0; i < PIXELS; i++) values[i] = bytes[i] / 255;
        return Object.assign(picture(values), { c: saved.c, g: saved.g === true });
    }

    // The saved data back as { classes, train, test }, or null when anything is odd (an
    // old version, a broken value, too many kinds or examples...)
    function decodeData(value) {
        if (!value || typeof value !== "object" || value.v !== SAVE_VERSION) return null;
        if (!Array.isArray(value.classes) || !Array.isArray(value.train) || !Array.isArray(value.test)) return null;
        if (value.classes.length < MIN_CLASSES || value.classes.length > MAX_CLASSES || value.test.length > MAX_TEST) return null;
        const colors = [];
        const keys = [];
        const classes = [];
        for (let n = 0; n < value.classes.length; n++) {
            const item = value.classes[n];
            if (!item || typeof item !== "object" || typeof item.name !== "string" || item.name.length > MAX_NAME) return null;
            if (!(item.key === null || (KINDS.indexOf(item.key) !== -1 && keys.indexOf(item.key) === -1))) return null;
            if (!Number.isInteger(item.color) || item.color < 0 || item.color >= COLORS || colors.indexOf(item.color) !== -1) return null;
            colors.push(item.color);
            if (item.key) keys.push(item.key);
            classes.push({ key: item.key, name: item.name, color: item.color });
        }
        const train = value.train.map(function (saved) { return decodeExample(saved, classes.length); });
        const test = value.test.map(function (saved) {
            return saved && saved.g === undefined ? decodeExample(saved, classes.length) : null;
        });
        if (train.indexOf(null) !== -1 || test.indexOf(null) !== -1) return null;
        const perClass = classes.map(function (item, c) { return train.filter(function (example) { return example.c === c; }).length; });
        if (Math.max.apply(null, perClass) > MAX_PER_CLASS) return null;
        return { classes: classes, train: train, test: test };
    }

    // The saved settings: { v: 1, k (1-7), wiggle (true / false) }
    function isSettings(value) {
        return Boolean(value) && value.v === SAVE_VERSION && Number.isInteger(value.k) && value.k >= K.min && value.k <= K.max &&
            typeof value.wiggle === "boolean";
    }

    /* =========================================================
       8. DRAWING
       Each function paints one canvas from the numbers it is given.
       The colours come from kit.colors(), so they follow the theme.
       A 28 x 28 picture is painted pixel by pixel into a small canvas
       of 28 x 28, which is then shown enlarged without smoothing, so
       every pixel stays a sharp square.
       ========================================================= */
    // A colour of kit.colors() as [r, g, b]
    function rgbOf(color) {
        return A.colors.parse(color) || [128, 128, 128];
    }

    // The 784 numbers in one colour: each pixel is as strong as its number (0: none, 1: full)
    function paintInk(canvas, values, rgb, strength) {
        const context = canvas.getContext("2d");
        const image = context.createImageData(GRID, GRID);
        for (let i = 0; i < PIXELS; i++) {
            image.data[i * 4] = rgb[0];
            image.data[i * 4 + 1] = rgb[1];
            image.data[i * 4 + 2] = rgb[2];
            image.data[i * 4 + 3] = Math.round(values[i] * strength * 255);
        }
        context.putImageData(image, 0, 0);
    }

    // Where the network looks, in the kit's two-sided colours. map says how much surer the
    // network gets when a pixel gets more ink (see saliency()); on each pixel you drew,
    // gradient x ink is about how much surer that pixel's ink makes it (how much less sure it
    // would be without it). Cyan pixels make it surer, red ones less sure; the pixels without
    // ink stay clear (their gradient is mostly the noise of unused weights).
    function paintFocus(canvas, map, values) {
        // Full colour from the 90th percentile up, so one strong pixel doesn't make the rest faint
        const sizes = [];
        for (let i = 0; i < PIXELS; i++) {
            if (values[i]) sizes.push(Math.abs(map[i] * values[i]));
        }
        sizes.sort(function (a, b) { return a - b; });
        const full = sizes.length ? sizes[Math.floor(FOCUS_FULL * (sizes.length - 1))] || sizes[sizes.length - 1] : 0;
        const context = canvas.getContext("2d");
        const image = context.createImageData(GRID, GRID);
        for (let i = 0; i < PIXELS; i++) {
            const share = full ? A.util.clamp((map[i] * values[i]) / full, -1, 1) : 0;
            const rgb = kit.diverge.rgb(share);
            image.data[i * 4] = rgb[0];
            image.data[i * 4 + 1] = rgb[1];
            image.data[i * 4 + 2] = rgb[2];
            image.data[i * 4 + 3] = Math.round(Math.pow(Math.abs(share), FOCUS_GAMMA) * 255);
        }
        context.putImageData(image, 0, 0);
    }

    function drawEnlarged(context, small, x, y, size) {
        context.imageSmoothingEnabled = false;
        context.drawImage(small, x, y, size, size);
        context.imageSmoothingEnabled = true;
    }

    // Breaks a text into lines no wider than "width"
    function wrapLines(context, text, width) {
        const lines = [];
        let line = "";
        String(text).split(" ").forEach(function (word) {
            const longer = line ? line + " " + word : word;
            if (line && context.measureText(longer).width > width) {
                lines.push(line);
                line = word;
            } else {
                line = longer;
            }
        });
        if (line) lines.push(line);
        return lines;
    }

    // A short message in the middle of a canvas, on a soft patch so it reads over a picture.
    // Measuring text is slow, so the last message's lines are kept (it is drawn again while you draw).
    // A canvas font is slow to set when it changes (the browser works out the page's styles
    // first), but the same font again costs nothing. So the canvas keeps its font: there is
    // no save() and restore() here, which would put the old font back.
    const lastMessage = { key: "", lines: [], widest: 0 };
    function drawMessage(view, text) {
        const context = view.ctx;
        const c = kit.colors();
        const size = A.util.clamp(Math.round(view.width / 24), MESSAGE_FONT.min, MESSAGE_FONT.max);
        const lineHeight = Math.round(size * 1.35);
        context.font = kit.font(size, 600, "body");
        const key = context.font + "|" + view.width + "|" + text;
        if (key !== lastMessage.key) {
            lastMessage.key = key;
            lastMessage.lines = wrapLines(context, text, view.width * 0.78);
            lastMessage.widest = Math.max.apply(null, lastMessage.lines.map(function (line) { return context.measureText(line).width; }));
        }
        const lines = lastMessage.lines;
        const widest = lastMessage.widest;
        const top = view.height / 2 - (lines.length * lineHeight) / 2;
        context.fillStyle = kit.alpha(c.surface, 0.88);
        context.beginPath();
        if (context.roundRect) context.roundRect(view.width / 2 - widest / 2 - 12, top - 8, widest + 24, lines.length * lineHeight + 16, 10);
        else context.rect(view.width / 2 - widest / 2 - 12, top - 8, widest + 24, lines.length * lineHeight + 16);
        context.fill();
        context.fillStyle = c.muted;
        context.textAlign = "center";
        context.textBaseline = "middle";
        lines.forEach(function (line, n) { context.fillText(line, view.width / 2, top + (n + 0.5) * lineHeight); });
    }

    function traceStrokes(context, strokes, size, width, color) {
        context.strokeStyle = color;
        context.fillStyle = color;
        context.lineWidth = width;
        context.lineCap = "round";
        context.lineJoin = "round";
        strokes.forEach(function (stroke) {
            context.beginPath();
            if (stroke.length === 1) {
                context.arc(stroke[0].x * size, stroke[0].y * size, width / 2, 0, Math.PI * 2);
                context.fill();
                return;
            }
            context.moveTo(stroke[0].x * size, stroke[0].y * size);
            for (let i = 1; i < stroke.length; i++) context.lineTo(stroke[i].x * size, stroke[i].y * size);
            context.stroke();
        });
    }

    // The pad: your strokes in the ink colour. pen: the keyboard pen { x, y, down } while the
    // keyboard draws (then the 28 x 28 grid it moves on shows as faint dots), else null.
    function drawPad(view, strokes, pen, emptyText) {
        const context = view.ctx;
        const size = view.width;
        if (!size) return;
        const c = kit.colors();
        const width = PAD_PEN * size;
        context.clearRect(0, 0, size, view.height);
        if (pen) {
            context.fillStyle = c.grid;
            for (let row = 0; row < KEY_STEPS; row++) {
                for (let col = 0; col < KEY_STEPS; col++) {
                    context.fillRect(((col + 0.5) / KEY_STEPS) * size - 1, ((row + 0.5) / KEY_STEPS) * size - 1, 2, 2);
                }
            }
        }
        if (A.motion.ok()) traceStrokes(context, strokes, size, width * GLOW, kit.alpha(c.accent2, 0.14));
        traceStrokes(context, strokes, size, width, c.text);
        if (!strokes.length && emptyText) drawMessage(view, emptyText);
        if (pen) {
            const x = ((pen.x + 0.5) / KEY_STEPS) * size;
            const y = ((pen.y + 0.5) / KEY_STEPS) * size;
            context.beginPath();
            context.arc(x, y, Math.max(width * 0.75, 6), 0, Math.PI * 2);
            context.lineWidth = 2;
            context.strokeStyle = c.accent;
            context.fillStyle = kit.alpha(c.accent, pen.down ? 0.9 : 0.15);
            context.fill();
            context.stroke();
        }
    }

    // "What the computer sees". how: "picture" (the pixels), "numbers" (a zoomed-in corner with
    // the number of each pixel) or "focus" (the network's map under the pixels).
    // message: a text for the middle (the pad is empty, the network isn't trained...)
    function drawSeen(view, layer, values, how, map, message) {
        const context = view.ctx;
        const size = view.width;
        if (!size) return;
        const c = kit.colors();
        context.clearRect(0, 0, size, view.height);
        if (values && how === "numbers") {
            drawNumbers(view, layer, values);
        } else {
            if (values) {
                paintInk(layer, values, rgbOf(c.text), map ? FOCUS_INK : 1);
                drawEnlarged(context, layer, 0, 0, size);
            }
            if (values && map) {
                paintFocus(layer, map, values);
                drawEnlarged(context, layer, 0, 0, size);
            }
            if (size / GRID >= MIN_GRID_CELL) kit.drawGrid(context, size, view.height, size / GRID);
        }
        if (message) drawMessage(view, message);
    }

    // The square of count x count pixels with the most in-between numbers (the soft edges of
    // the lines, where anti-aliasing shows), then the most ink -> { x, y } of its corner
    function busiestSquare(values, count) {
        let best = { x: (GRID - count) >> 1, y: (GRID - count) >> 1, soft: -1, ink: -1 };
        for (let y = 0; y + count <= GRID; y++) {
            for (let x = 0; x + count <= GRID; x++) {
                let soft = 0;
                let ink = 0;
                for (let row = y; row < y + count; row++) {
                    for (let col = x; col < x + count; col++) {
                        const value = values[row * GRID + col];
                        if (value > 0 && value < 1) soft += 1;
                        ink += value;
                    }
                }
                if (soft > best.soft || (soft === best.soft && ink > best.ink)) best = { x: x, y: y, soft: soft, ink: ink };
            }
        }
        return best;
    }

    // 0, 1, 0.5, 0.37: at most 2 decimals (0.996 is written 1)
    function numberText(value) {
        return A.format.number(value, { maxDigits: 2 });
    }

    // The numbers: a zoomed-in square of the picture with each pixel's number in it, and in its
    // emptiest corner a small map of the whole picture that shows where the square is
    function drawNumbers(view, layer, values) {
        const context = view.ctx;
        const size = view.width;
        const c = kit.colors();
        const ink = rgbOf(c.text);
        const count = A.util.clamp(Math.floor(size / NUMBER_CELL), ZOOM.min, ZOOM.max);
        const cell = size / count;
        const spot = busiestSquare(values, count);
        const valueAt = function (col, row) { return values[(spot.y + row) * GRID + spot.x + col]; };
        context.font = kit.font(A.util.clamp(Math.round(cell * 0.3), 11, 14), 600, "mono");     // kept (see drawMessage)
        context.textAlign = "center";
        context.textBaseline = "middle";
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                const value = valueAt(col, row);
                if (value) {
                    context.fillStyle = "rgba(" + ink.join(", ") + ", " + value.toFixed(3) + ")";
                    context.fillRect(col * cell, row * cell, cell, cell);
                }
                context.fillStyle = value >= DARK_TEXT ? c.surface : c.muted;
                context.fillText(numberText(value), (col + 0.5) * cell, (row + 0.5) * cell);
            }
        }
        kit.drawGrid(context, size, view.height, cell);

        // The small map goes into the corner of the square with the least ink
        const corners = [[0, 0], [count - MAP_CELLS, 0], [0, count - MAP_CELLS], [count - MAP_CELLS, count - MAP_CELLS]];
        let corner = corners[0];
        let least = Infinity;
        corners.forEach(function (option) {
            let sum = 0;
            for (let row = 0; row < MAP_CELLS; row++) {
                for (let col = 0; col < MAP_CELLS; col++) sum += valueAt(option[0] + col, option[1] + row);
            }
            if (sum < least) {
                least = sum;
                corner = option;
            }
        });
        const gap = 4;
        const mapSize = MAP_CELLS * cell - 2 * gap;
        const mapX = corner[0] * cell + gap;
        const mapY = corner[1] * cell + gap;
        context.fillStyle = c.surface;
        context.strokeStyle = c.muted;
        context.lineWidth = 1;
        context.fillRect(mapX, mapY, mapSize, mapSize);
        context.strokeRect(mapX + 0.5, mapY + 0.5, mapSize - 1, mapSize - 1);
        paintInk(layer, values, ink, 1);
        drawEnlarged(context, layer, mapX, mapY, mapSize);
        const pixel = mapSize / GRID;
        context.strokeStyle = c.accent2;
        context.lineWidth = 1.5;
        context.strokeRect(mapX + spot.x * pixel, mapY + spot.y * pixel, count * pixel, count * pixel);
    }

    /* =========================================================
       9. THE EXPERIMENT
       ========================================================= */
    A.lab.define("draw", {
        // The maths, for dev/tests/draw.math.js (the hub doesn't use it)
        maths: {
            GRID: GRID, PIXELS: PIXELS, FIT: FIT, PEN_RADIUS: PEN_RADIUS, HIDDEN: HIDDEN, BATCH: BATCH,
            EPOCHS: EPOCHS, GOOD_LOSS: GOOD_LOSS, WEIGHT_DECAY: WEIGHT_DECAY, WIGGLE: WIGGLE, KINDS: KINDS, CHECK_CHUNK: CHECK_CHUNK,
            EXAMPLE_SEED: EXAMPLE_SEED, EXAMPLES_PER_KIND: EXAMPLES_PER_KIND, CHECK_SEED: CHECK_SEED, TRAIN_SEED: TRAIN_SEED, NET_SEED: NET_SEED,
            toBase64: toBase64, fromBase64: fromBase64,
            boundingBox: boundingBox, rasterise: rasterise, centreOfMass: centreOfMass, preprocess: preprocess, picture: picture,
            drawExample: drawExample, makeExamples: makeExamples,
            squaredDistance: squaredDistance, rankExamples: rankExamples, knnVote: knnVote, knnPredict: knnPredict, leaveOneOut: leaveOneOut,
            createNetwork: createNetwork, countWeights: countWeights, weightCount: weightCount, softmax: softmax, forward: forward,
            netPredict: netPredict, backward: backward, batchLoss: batchLoss, batchGradient: batchGradient, stepAdam: stepAdam,
            wiggleWith: wiggleWith, wiggle: wiggle, newRun: newRun, trainChunk: trainChunk, trainRun: trainRun,
            saliency: saliency, netAccuracy: netAccuracy,
            encodeData: encodeData, decodeData: decodeData, isSettings: isSettings
        },

        create: function (stage, ctx) {
            // ----- State -----
            const saved = decodeData(ctx.store.get("data", null));
            const savedSettings = ctx.store.get("settings", null, isSettings);
            let classes = saved ? saved.classes : START_CLASSES.map(function (item) {
                return { key: item.key, name: "", color: item.color };
            });
            let train = saved ? saved.train : [];    // the examples: pictures with their class c (g: made by the computer)
            let test = saved ? saved.test : [];      // the test drawings: pictures with their real class c
            let k = savedSettings ? savedSettings.k : K.value;
            let wiggleOn = savedSettings ? savedSettings.wiggle : true;
            let mode = "teach";                      // "teach" | "test"
            let seenMode = "picture";                // "picture" | "numbers" | "focus"
            let strokes = [];                        // the drawing on the pad: lists of points { x, y } from 0 to 1
            let drawing = null;                      // the stroke under a finger or the mouse: { id, points }
            let pen = null;                          // the keyboard pen { x, y, down }, once the keyboard has drawn
            let penShown = false;                    // the pen and its grid show while the keyboard draws
            let input = null;                        // the drawing as the models see it (a picture), or null
            let knnGuess = null;                     // what the models say about it
            let netGuess = null;
            let net = null;
            let netState = "none";                   // "none" | "trained" | "stale" (the examples changed since)
            let run = null;                          // the training run (see newRun())
            let trainState = "ready";                // "ready" | "running" | "paused" | "done"
            let ending = "";                         // how the last run ended: "goal" | "epochs"
            let resumeOnShow = false;                // training was running when the hub paused us
            const losses = [];                       // the network's loss after each epoch
            let lastAccuracy = null;                 // its training accuracy after the last epoch...
            let lastGuesses = [];                    // ...and its guesses for the test drawings then
            let newEpochs = false;                   // an epoch ended since the screen was last updated
            let resultsFrame = 0;                    // a requested frame to show what the network says now
            let runs = 0;                            // training runs so far (each one gets its own seed)
            let ranks = null;                        // kept until the examples change: each example's neighbours...
            let testRanks = null;                    // ...and each test drawing's
            let scores = { knn: { train: null, test: null, guesses: [] }, net: { train: null, test: null, guesses: [] } };
            let mistakesShown = "";                  // the mistakes on screen (drawn again only when they change)
            let nearShown = "";                      // the same for the nearest examples...
            let explainShown = "";                   // ...and for the numbers in "What's happening?"
            let fooled = false;                      // challenge 4 happened
            let lastGuess = -Infinity;               // when the models last guessed (ms)
            let frame = 0;                           // a requested animation frame for the pad
            let armed = null;                        // the delete button that waits for its second press
            let made = null;                         // the computer's example drawings, made once
            let rows = [];                           // the gallery: one row per class
            const layer = el("canvas", null, { width: GRID, height: GRID });   // for painting 28 x 28 pictures
            const thumbs = new WeakMap();            // each small picture's numbers and class, to paint it again

            // ----- The page -----
            const ui = kit.layout(stage, { side: true });
            ui.root.classList.add("dw-root");

            // Top: Teach / Test, and the computer's example drawings
            const modeSwitch = kit.segmented({
                labelKey: "lab.draw.mode",
                options: [{ value: "teach", labelKey: "lab.draw.teach" }, { value: "test", labelKey: "lab.draw.test" }],
                value: mode,
                onChange: setMode
            });
            const modeHelp = el("p", "lk-help", { id: uid("mode") });
            modeSwitch.element.appendChild(modeHelp);
            modeSwitch.element.querySelector(".lk-seg").setAttribute("aria-describedby", modeHelp.id);
            const examplesButton = kit.button(function () {
                return t(hasMade() ? "lab.draw.removeExamples" : "lab.draw.loadExamples");
            }, { icon: "sparkle", onClick: toggleExamples });
            ui.top.appendChild(kit.row([modeSwitch, examplesButton]));

            // Main: the pad and what the computer sees
            const padColumn = el("div", "dw-column");
            const seenColumn = el("div", "dw-column");
            const board = el("div", "dw-board");
            const boardBox = el("div", "dw-board-box");
            board.append(padColumn, seenColumn);
            boardBox.appendChild(board);
            ui.main.appendChild(boardBox);

            padColumn.appendChild(textEl("h4", "dw-title", "lab.draw.padTitle"));
            const pad = kit.canvas(padColumn, { aspect: 1, labelKey: "lab.draw.padLabel" });
            pad.box.classList.add("dw-pad-box");
            pad.canvas.classList.add("dw-pad");
            pad.canvas.tabIndex = 0;
            pad.canvas.setAttribute("role", "application");
            textAttribute(pad.canvas, "aria-roledescription", "lab.draw.padRole");
            const padHelp = textEl("p", "lk-help", "lab.draw.padHelp");
            padHelp.id = uid("help");
            pad.canvas.setAttribute("aria-describedby", pad.canvas.getAttribute("aria-describedby") + " " + padHelp.id);
            const undoButton = kit.button("lab.draw.undo", { icon: "undo", size: "sm", onClick: undoStroke });
            const clearButton = kit.button("lab.draw.clear", { icon: "trash", size: "sm", onClick: clearPad });
            const classButtons = kit.toolbar([]);
            const addGroup = kit.group(function () { return t(mode === "teach" ? "lab.draw.addAs" : "lab.draw.itWas"); }, [classButtons], { plain: true });
            const padHint = kit.hint({ tone: "info" });
            padHint.hide();
            padColumn.append(kit.toolbar([undoButton, clearButton]), padHelp, addGroup, padHint.element);

            seenColumn.appendChild(textEl("h4", "dw-title", "lab.draw.seenTitle"));
            const seen = kit.canvas(seenColumn, { aspect: 1, labelKey: "lab.draw.seenLabel" });
            seen.box.classList.add("dw-seen-box");
            const seenSwitch = kit.segmented({
                labelKey: "lab.draw.seenShow",
                hideLabel: true,
                options: [
                    { value: "picture", labelKey: "lab.draw.seenPicture" },
                    { value: "numbers", labelKey: "lab.draw.seenNumbers" },
                    { value: "focus", labelKey: "lab.draw.seenFocus" }
                ],
                value: seenMode,
                onChange: function (value) {
                    seenMode = value;
                    showSeen();
                }
            });
            const seenCaption = el("p", "lk-help dw-caption");
            const focusLegend = kit.legend([
                { labelKey: "lab.draw.focusMore", colorIndex: 0, shape: "square" },
                { labelKey: "lab.draw.focusLess", color: "var(--danger)", shape: "square" }
            ]);
            seenColumn.append(seenSwitch.element, seenCaption, focusLegend.element);

            // The two models' guesses
            const knn = {
                note: el("p", "dw-note"),
                verdict: el("p", "dw-verdict"),
                bars: kit.bars(null, { format: percent, max: 1 }),
                near: el("div", "dw-near"),
                list: el("ul", "dw-near-list", { role: "list" })
            };
            knn.near.append(textEl("p", "dw-near-title", "lab.draw.lookLike"), knn.list);
            const kSlider = kit.slider({
                labelKey: "lab.draw.k",
                min: K.min,
                max: K.max,
                step: 1,
                value: k,
                describe: function (value) { return A.plural("lab.draw.kValue", value); },
                hintKey: "lab.draw.kHint",
                onInput: function (value) {
                    k = value;
                    guessNow(false);
                    measureKnn();
                },
                onChange: saveSettings
            });
            const netPart = {
                note: el("p", "dw-note"),
                verdict: el("p", "dw-verdict"),
                bars: kit.bars(null, { format: percent, max: 1 })
            };
            const guesses = el("div", "dw-guesses");
            guesses.append(
                panel("lab.draw.knnTitle", [textEl("p", "lk-help", "lab.draw.knnAbout"), knn.note, knn.verdict, knn.bars, knn.near, kSlider]),
                panel("lab.draw.netTitle", [textEl("p", "lk-help", "lab.draw.netAbout"), netPart.note, netPart.verdict, netPart.bars])
            );
            ui.main.appendChild(guesses);

            // The gallery: every example, class by class
            const rowsBox = el("div", "dw-rows");
            const addClassButton = kit.button("lab.draw.addClass", { icon: "plus", size: "sm", onClick: addClass });
            const clearAllButton = kit.button("lab.draw.clearAll", { icon: "trash", size: "sm", variant: "danger" });
            confirmButton(clearAllButton.element, {
                onArm: function () { clearAllButton.setLabel("lab.draw.clearAllConfirm"); },
                onDisarm: function () { clearAllButton.setLabel("lab.draw.clearAll"); },
                onConfirm: clearAll
            });
            const saveHint = kit.hint({ key: "lab.draw.saveFailed", tone: "warn" });
            saveHint.hide();
            ui.main.appendChild(panel("lab.draw.galleryTitle", [
                textEl("p", "lk-help", "lab.draw.galleryAbout"),
                rowsBox,
                kit.toolbar([addClassButton, clearAllButton]),
                textEl("p", "lk-help", "lab.draw.privacy"),
                saveHint.element
            ]));

            // Side: training the network
            const trainButton = kit.button(trainLabel, { icon: "play", variant: "primary", onClick: pressTrain });
            const stepButton = kit.button("lab.draw.stepEpoch", { icon: "step", onClick: stepEpoch });
            const resetButton = kit.iconButton("reset", "lab.draw.resetNet", { onClick: resetNetwork });
            const status = kit.status("ready");
            const trainNote = el("p", "dw-note");
            const wiggleSwitch = kit.toggle({
                labelKey: "lab.draw.wiggle",
                checked: wiggleOn,
                hintKey: "lab.draw.wiggleHint",
                onChange: function (on) {
                    wiggleOn = on;
                    if (run) run.wiggle = on;
                    saveSettings();
                }
            });
            const wiggleWhy = el("p", "lk-help", { id: uid("why") });
            wiggleSwitch.element.appendChild(wiggleWhy);
            const wiggleControl = wiggleSwitch.element.querySelector(".lk-switch");
            wiggleControl.setAttribute("aria-describedby", (wiggleControl.getAttribute("aria-describedby") || "") + " " + wiggleWhy.id);
            const chartView = kit.canvas(null, { height: CHART_HEIGHT, labelKey: "lab.draw.chartLabel" });
            const chart = kit.lineChart(chartView, {
                series: [{ values: losses, colorIndex: 1, labelKey: "lab.kit.loss", fill: true }],
                x0: 1,
                yMin: 0,
                xLabelKey: "lab.kit.epoch",
                yLabelKey: "lab.kit.loss"
            });
            const epochStat = kit.stat({ labelKey: "lab.kit.epoch", value: 0 });
            const lossStat = kit.stat({ labelKey: "lab.kit.loss", trend: "auto", better: "down" });
            const accuracyStat = kit.stat({ labelKey: "lab.draw.trainAccuracy", format: percent });
            ui.side.appendChild(panel("lab.draw.trainTitle", [
                kit.toolbar([trainButton, stepButton, resetButton, status]),
                trainNote,
                wiggleSwitch,
                chartView.box,
                kit.row([epochStat, lossStat, accuracyStat], { grid: true })
            ]));

            // Side: how good is each model?
            const table = el("table", "dw-scores");
            table.innerHTML = '<thead><tr><th scope="col"></th><th scope="col"></th><th scope="col"></th></tr></thead>' +
                '<tbody><tr><th scope="row"></th><td></td><td></td></tr><tr><th scope="row"></th><td></td><td></td></tr></tbody>';
            const heads = table.querySelectorAll("th");
            ["lab.kit.accuracy", "lab.draw.onTraining", "lab.draw.onTest", "lab.draw.knnTitle", "lab.draw.netTitle"].forEach(function (key, n) {
                heads[n].setAttribute("data-i18n", key);
                heads[n].textContent = t(key);
            });
            const cells = table.querySelectorAll("tbody td");    // k-NN training, k-NN test, network training, network test
            const testsNote = el("p", "dw-note");
            const overfitLine = el("p", "lk-help");
            const mistakesList = el("ul", "dw-mistakes", { role: "list" });
            const noMistakes = textEl("p", "lk-help", "lab.draw.noMistakes");
            const mistakesBox = el("div", "dw-column");
            mistakesBox.append(textEl("h5", "dw-subtitle", "lab.draw.mistakes"), noMistakes, mistakesList);
            const testCount = el("span", "dw-count");
            const testsTitle = textEl("h5", "dw-subtitle", "lab.draw.testsTitle");
            const testsHead = el("div", "dw-row-head");
            testsHead.append(testsTitle, testCount);
            const testList = el("ul", "dw-thumbs", { role: "list" });
            roving(testList);
            ui.side.appendChild(panel("lab.draw.measureTitle", [
                table,
                testsNote,
                textEl("p", "lk-help", "lab.draw.looNote"),
                overfitLine,
                mistakesBox,
                testsHead,
                testList
            ]));

            // Bottom: what's happening, the real world, and challenges
            const explain = kit.explain({ steps: [
                { key: "lab.draw.step1" }, { key: "lab.draw.step2" }, { key: "lab.draw.step3" }, { key: "lab.draw.step4" }, { key: "lab.draw.step5" }
            ] });
            const realWorld = el("p", "dw-real");
            const challenges = kit.challenges({ ctx: ctx, items: [
                { key: "lab.draw.ch1", insightKey: "lab.draw.ch1Why", check: function (info) { return info.sureSun; } },
                { key: "lab.draw.ch2", insightKey: "lab.draw.ch2Why", check: function (info) { return info.looksGood; } },
                { key: "lab.draw.ch3", insightKey: "lab.draw.ch3Why", check: function (info) { return info.fixed; } },
                { key: "lab.draw.ch4", insightKey: "lab.draw.ch4Why", check: function (info) { return info.fooled; } }
            ] });
            ui.bottom.append(explain.element, realWorld, challenges.element);

            // Sentences with glossary links (written again after a language change)
            const sentences = [
                { element: wiggleWhy, key: "lab.draw.wiggleWhy", links: { augmentation: kit.termLink("data-augmentation", "lab.draw.termAugmentation") } },
                { element: overfitLine, key: "lab.draw.overfitLine", links: {
                    generalization: kit.termLink("generalization", "lab.draw.termGeneralization"),
                    overfitting: kit.termLink("overfitting", "lab.draw.termOverfitting")
                } },
                { element: realWorld, key: "lab.draw.realWorld", links: {
                    supervised: kit.termLink("supervised", "lab.draw.termSupervised"),
                    training: kit.termLink("training", "lab.draw.termTraining"),
                    dataset: kit.termLink("dataset", "lab.draw.termDataset"),
                    network: kit.termLink("neural-network", "lab.draw.termNetwork")
                } }
            ];

            const loop = kit.loop({ rate: Infinity, budget: TRAIN_BUDGET, update: trainStep, draw: drawTraining });
            pad.onResize(paintPad);
            seen.onResize(showSeen);

            // ----- Small helpers for this page -----
            function nameOf(c) {
                const item = classes[c];
                if (!item) return "";
                return item.name.trim() || defaultName(c);
            }

            // "Sun", "House", "Fish" follow the language until you rename them; a new class is "Class 4"
            function defaultName(c) {
                return classes[c].key ? t("lab.draw." + classes[c].key) : t("lab.draw.classN", { n: c + 1 });
            }

            function countOf(c) {
                return train.filter(function (example) { return example.c === c; }).length;
            }

            function hasMade() {
                return train.some(function (example) { return example.g; });
            }

            // A small dot in a class's colour, as an icon for the kit's buttons
            function dotIcon(color) {
                return '<svg class="lk-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">' +
                    '<circle cx="12" cy="12" r="8" style="fill: var(--lk-series-' + (color + 1) + ')"/></svg>';
            }

            function colorDot(color) {
                const dot = el("span", "dw-dot", { "aria-hidden": "true" });
                dot.style.setProperty("--dw-color", "var(--lk-series-" + (color + 1) + ")");
                return dot;
            }

            // A small picture (a 28 x 28 canvas, shown enlarged) in a class's colour
            function thumbCanvas(values, c) {
                const canvas = el("canvas", "dw-ink", { width: GRID, height: GRID, "aria-hidden": "true" });
                thumbs.set(canvas, { values: values, color: classes[c].color });
                paintThumb(canvas);
                return canvas;
            }

            function paintThumb(canvas) {
                const item = thumbs.get(canvas);
                if (item) paintInk(canvas, item.values, rgbOf(kit.colors().series[item.color]), 1);
            }

            // A delete button that asks for a second press (A.confirmPress). Only one waits at a time.
            function confirmButton(button, options) {
                const confirm = A.confirmPress(button, {
                    onArm: function () {
                        if (armed && armed !== confirm) armed.disarm();
                        armed = confirm;
                        options.onArm();
                    },
                    onDisarm: function () {
                        if (armed === confirm) armed = null;
                        options.onDisarm();
                    },
                    onConfirm: function () {
                        if (armed === confirm) armed = null;
                        options.onConfirm();
                    }
                });
                return confirm;
            }

            function disarm() {
                if (armed) armed.disarm();
                armed = null;
            }

            // A picture in the gallery: press it twice to delete it (or press Delete once)
            function thumbButton(example, label, onDelete) {
                const button = el("button", "dw-thumb", { type: "button", "aria-label": label, title: label });
                button.style.setProperty("--dw-color", "var(--lk-series-" + (classes[example.c].color + 1) + ")");
                button.appendChild(thumbCanvas(example.values, example.c));
                const cross = el("span", "dw-thumb-cross", { "aria-hidden": "true" });
                cross.innerHTML = kit.icons.close;
                button.appendChild(cross);
                confirmButton(button, {
                    onArm: function () {
                        button.classList.add("is-armed");
                        button.setAttribute("aria-label", t("lab.draw.pressAgain", { what: label }));
                        ctx.announce(t("lab.draw.pressAgain", { what: label }));
                    },
                    onDisarm: function () {
                        button.classList.remove("is-armed");
                        button.setAttribute("aria-label", label);
                    },
                    onConfirm: onDelete
                });
                button.addEventListener("keydown", function (event) {
                    if (event.key !== "Delete" && event.key !== "Backspace") return;
                    event.preventDefault();
                    onDelete();
                });
                return button;
            }

            function saveData() {
                const ok = ctx.store.set("data", encodeData(classes, train, test));
                if (ok) saveHint.hide();
                else saveHint.show();
            }

            function saveSettings() {
                ctx.store.set("settings", { v: SAVE_VERSION, k: k, wiggle: wiggleOn });
            }

            function say(key, values) {
                padHint.set(key, values);
                ctx.announce(t(key, values));
            }

            // ----- Drawing on the pad: mouse, pen and touch -----
            function pointOf(event) {
                const box = pad.canvas.getBoundingClientRect();
                return {
                    x: A.util.clamp((event.clientX - box.left) / box.width, 0, 1),
                    y: A.util.clamp((event.clientY - box.top) / box.height, 0, 1)
                };
            }

            function pointCount() {
                return strokes.reduce(function (sum, stroke) { return sum + stroke.length; }, 0);
            }

            // A new point for a stroke, once the pen has moved far enough (and up to MAX_POINTS)
            function addPoint(stroke, point) {
                const last = stroke[stroke.length - 1];
                if (last && Math.hypot(point.x - last.x, point.y - last.y) < MIN_MOVE) return;
                if (pointCount() >= MAX_POINTS) return;
                stroke.push(point);
            }

            pad.canvas.addEventListener("pointerdown", function (event) {
                if (drawing || !event.isPrimary || event.button !== 0) return;
                if (pen && pen.down) pen.down = false;
                drawing = { id: event.pointerId, points: [pointOf(event)] };
                strokes.push(drawing.points);
                try {
                    pad.canvas.setPointerCapture(event.pointerId);
                } catch (error) {
                    // a pointer that has already gone: its stroke ends at once
                }
                padHint.hide();
                padChanged();
            });

            pad.canvas.addEventListener("pointermove", function (event) {
                if (!drawing || event.pointerId !== drawing.id) return;
                const events = event.getCoalescedEvents ? event.getCoalescedEvents() : [];
                (events.length ? events : [event]).forEach(function (one) { addPoint(drawing.points, pointOf(one)); });
                padChanged();
            });

            ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (name) {
                pad.canvas.addEventListener(name, function (event) {
                    if (!drawing || event.pointerId !== drawing.id) return;
                    drawing = null;
                    padChanged();
                    guessNow(true);
                });
            });

            // A long press on a touch screen would open a menu
            pad.canvas.addEventListener("contextmenu", function (event) { event.preventDefault(); });

            // ----- Drawing with the keyboard -----
            const MOVES = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

            function penPoint() {
                return { x: (pen.x + 0.5) / KEY_STEPS, y: (pen.y + 0.5) / KEY_STEPS };
            }

            function sayPen() {
                ctx.announce(t("lab.draw.penAt", { x: pen.x + 1, y: pen.y + 1 }) + " " + t(pen.down ? "lab.draw.penDown" : "lab.draw.penUp"));
            }

            function showPen() {
                if (!pen) pen = { x: Math.floor(KEY_STEPS / 2), y: Math.floor(KEY_STEPS / 2), down: false };
                penShown = true;
            }

            // The keyboard pen goes up: its stroke is finished
            function liftPen() {
                pen.down = false;
                padChanged();
                guessNow(true);
            }

            pad.canvas.addEventListener("keydown", function (event) {
                if (event.altKey || event.ctrlKey || event.metaKey) return;
                const move = MOVES[event.key];
                if (move) {
                    event.preventDefault();
                    showPen();
                    const jump = event.shiftKey ? KEY_JUMP : 1;
                    pen.x = A.util.clamp(pen.x + move[0] * jump, 0, KEY_STEPS - 1);
                    pen.y = A.util.clamp(pen.y + move[1] * jump, 0, KEY_STEPS - 1);
                    if (pen.down) addPoint(strokes[strokes.length - 1], penPoint());
                    sayPen();
                    padChanged();
                } else if (event.key === " ") {
                    event.preventDefault();
                    if (event.repeat) return;
                    showPen();
                    if (pen.down) {
                        liftPen();
                    } else {
                        pen.down = true;
                        strokes.push([penPoint()]);
                        padHint.hide();
                        padChanged();
                    }
                    sayPen();
                } else if (event.key === "Enter") {
                    event.preventDefault();
                    if (event.repeat) return;
                    if (pen && pen.down) {
                        pen.down = false;
                        padChanged();
                    }
                    guessNow(true);
                    ctx.announce(strokes.length ? t("lab.draw.finished") + " " + guessWords() : t("lab.draw.padBlank"));
                }
            });

            pad.canvas.addEventListener("focus", function () {
                if (!pad.canvas.matches(":focus-visible")) return;
                showPen();
                padChanged();
            });

            pad.canvas.addEventListener("blur", function () {
                penShown = false;
                if (pen && pen.down) liftPen();
                else padChanged();
            });

            // ----- The pad changed -----
            // The pad is painted once per frame at most; while a stroke goes on, the models
            // guess at most every PREDICT_EVERY ms, and once more when it ends.
            function padChanged() {
                if (!frame) frame = requestAnimationFrame(onFrame);
            }

            function onFrame(now) {
                frame = 0;
                paintPad();
                if ((drawing || (pen && pen.down)) && now - lastGuess >= PREDICT_EVERY) guessNow(false);
            }

            function paintPad() {
                drawPad(pad, strokes, penShown ? pen : null, t("lab.draw.padEmpty"));
                pad.describe(strokes.length ? A.plural("lab.draw.padStrokes", strokes.length) : t("lab.draw.padBlank"));
            }

            function undoStroke() {
                drawing = null;
                if (pen) pen.down = false;
                strokes.pop();
                padEdited();
            }

            function clearPad() {
                drawing = null;
                if (pen) pen.down = false;
                strokes = [];
                padEdited();
            }

            function padEdited() {
                padHint.hide();
                padChanged();
                guessNow(false);
            }

            // Undo and Clear only work on a drawing. A button that switches off hands the
            // keyboard focus to the pad (a disabled button would drop it).
            function showPadButtons() {
                const empty = !strokes.length;
                if (empty && (document.activeElement === undoButton.element || document.activeElement === clearButton.element)) pad.canvas.focus();
                undoButton.setDisabled(empty);
                clearButton.setDisabled(empty);
            }

            // ----- The models guess -----
            function guessNow(final) {
                lastGuess = performance.now();
                const result = preprocess(strokes);
                input = result ? picture(result.pixels) : null;
                knnGuess = input && train.length ? knnPredict(train, input, k, classes.length) : null;
                netGuess = input && net && netState !== "none" ? netPredict(net, input) : null;
                showSeen();               // the canvas first, then the page's texts
                showGuesses();
                showPadButtons();
                renderExplain();
                if (final) checkChallenges();
            }

            // What the models say, as one sentence for screen readers
            function guessWords() {
                if (!input) return t("lab.draw.padBlank");
                const words = [];
                words.push(knnGuess ? t("lab.draw.sayKnn", { name: nameOf(knnGuess.best), p: percent(knnGuess.confidence) }) : t("lab.draw.noExamples"));
                words.push(netGuess ? t("lab.draw.sayNet", { name: nameOf(netGuess.best), p: percent(netGuess.confidence) }) : t("lab.draw.netUntrained"));
                return words.join(" ");
            }

            function showModel(part, shares, best, noteKey, warn) {
                part.note.hidden = !noteKey;
                part.note.textContent = noteKey ? t(noteKey) : "";
                part.note.classList.toggle("is-warn", Boolean(warn));
                part.verdict.hidden = !shares;
                part.bars.element.hidden = !shares;
                if (!shares) return;
                part.verdict.innerHTML = safeText("lab.draw.verdict", { name: nameOf(best), p: percent(shares[best]) });
                part.bars.update(classes.map(function (item, c) {
                    return { label: A.escapeHTML(nameOf(c)), value: shares[c], colorIndex: item.color };
                }));
            }

            function showGuesses() {
                const knnShares = knnGuess ? knnGuess.shares : null;
                showModel(knn, knnShares, knnGuess ? knnGuess.best : 0, !train.length ? "lab.draw.noExamples" : !input ? "lab.draw.drawToGuess" : null, false);
                knn.near.hidden = !knnGuess;
                // the small pictures are made again only when the nearest examples change
                const nearest = knnGuess ? knnGuess.nearest : [];
                const near = nearest.map(function (index) { return index + ":" + nameOf(train[index].c); }).join(" ");
                if (near !== nearShown) {
                    nearShown = near;
                    knn.list.textContent = "";
                    nearest.forEach(function (index) {
                        const item = el("li", "dw-near-item", { role: "img", "aria-label": nameOf(train[index].c), title: nameOf(train[index].c) });
                        item.style.setProperty("--dw-color", "var(--lk-series-" + (classes[train[index].c].color + 1) + ")");
                        item.appendChild(thumbCanvas(train[index].values, train[index].c));
                        knn.list.appendChild(item);
                    });
                }
                const netNote = netState === "none" ? "lab.draw.netUntrained" : !input ? "lab.draw.drawToGuess" : netState === "stale" ? "lab.draw.netStale" : null;
                showModel(netPart, netGuess ? netGuess.probs : null, netGuess ? netGuess.best : 0, netNote, netState === "stale");
            }

            // "What the computer sees", in the chosen way
            function showSeen() {
                let message = "";
                let map = null;
                if (!input) {
                    message = t("lab.draw.seenEmpty");
                } else if (seenMode === "focus") {
                    if (netGuess) map = saliency(net, input, netGuess.best);
                    else message = t("lab.draw.focusUntrained");
                }
                drawSeen(seen, layer, input ? input.values : null, seenMode, map, message);
                seen.describe(input ? A.plural("lab.draw.seenDescribe", input.ink.length) : t("lab.draw.seenEmpty"));
                const captions = {
                    picture: t("lab.draw.seenPictureNote"),
                    numbers: t("lab.draw.seenNumbersNote"),
                    focus: map ? t("lab.draw.seenFocusNote", { name: nameOf(netGuess.best) }) : t("lab.draw.seenFocusAbout")
                };
                seenCaption.textContent = captions[seenMode];
                focusLegend.element.hidden = !map;
            }

            // ----- Teach and Test -----
            function setMode(value) {
                mode = value;
                padHint.hide();
                kit.relabel(addGroup);
                modeHelp.textContent = t(mode === "teach" ? "lab.draw.teachHelp" : "lab.draw.testHelp");
            }

            // One button per class under the pad: "Sun · 8" (Teach) or "Sun" (Test)
            function fillClassButtons() {
                classButtons.textContent = "";
                classes.forEach(function (item, c) {
                    const button = kit.button(function () {
                        return mode === "teach" ? safeText("lab.draw.addCount", { name: nameOf(c), n: countOf(c) }) : A.escapeHTML(nameOf(c));
                    }, { icon: dotIcon(item.color), onClick: function () { addDrawing(c); } });
                    classButtons.appendChild(button.element);
                });
            }

            // The drawing on the pad becomes an example of class c (Teach) or a test drawing (Test)
            function addDrawing(c) {
                if (!input) {
                    say("lab.draw.drawFirst");
                    return;
                }
                if (mode === "teach") {
                    if (countOf(c) >= MAX_PER_CLASS) {
                        say("lab.draw.fullClass", { name: nameOf(c), n: MAX_PER_CLASS });
                        return;
                    }
                    train.push(Object.assign({}, input, { c: c, g: false }));
                    clearPad();
                    examplesChanged();
                    ctx.announce(A.plural("lab.draw.added", countOf(c), { name: nameOf(c) }));
                    return;
                }
                if (test.length >= MAX_TEST) {
                    say("lab.draw.fullTest", { n: MAX_TEST });
                    return;
                }
                // Were both models wrong, and sure of it? (challenge 4)
                if (knnGuess && netGuess && knnGuess.best !== c && netGuess.best !== c &&
                    knnGuess.confidence >= FOOLED && netGuess.confidence >= FOOLED) fooled = true;
                const verdict = {
                    added: t("lab.draw.testAdded", { name: nameOf(c) }),
                    knn: !knnGuess ? "" : knnGuess.best === c ? t("lab.draw.knnRight") : t("lab.draw.knnWrong", { name: nameOf(knnGuess.best) }),
                    net: !netGuess ? "" : netGuess.best === c ? t("lab.draw.netRight") : t("lab.draw.netWrong", { name: nameOf(netGuess.best) })
                };
                test.push(Object.assign({}, input, { c: c }));
                clearPad();
                testsChanged();
                say("lab.draw.testResult", verdict);
            }

            // ----- The examples, the test drawings and the classes change -----
            function examplesChanged() {
                ranks = null;
                testRanks = null;
                nearShown = "";
                if (netState === "trained") netState = "stale";
                stopRun();
                saveData();
                fillRows();
                kit.relabel(classButtons);
                kit.relabel(examplesButton.element);
                clearAllButton.setDisabled(!train.length && !test.length);
                measure();
                guessNow(false);
                showTraining();
            }

            function testsChanged() {
                testRanks = null;
                saveData();
                fillTests();
                clearAllButton.setDisabled(!train.length && !test.length);
                measure();
            }

            // A class was added or deleted: the network needs another output, so it starts again
            function classesChanged() {
                stopRun();
                net = null;
                netState = "none";
                losses.length = 0;
                lastAccuracy = null;
                ending = "";
                ranks = null;
                testRanks = null;
                saveData();
                buildRows();
                fillClassButtons();
                fillTests();
                addClassButton.setDisabled(classes.length >= MAX_CLASSES);
                measure();
                guessNow(false);
                showTraining();
            }

            // "Load example drawings" adds the computer's drawings (for the classes that are a
            // sun, a house or a fish); pressed again, it takes them away
            function toggleExamples() {
                if (hasMade()) {
                    train = train.filter(function (example) { return !example.g; });
                    examplesChanged();
                    say("lab.draw.examplesRemoved");
                    return;
                }
                if (!made) {
                    made = makeExamples(EXAMPLE_SEED, EXAMPLES_PER_KIND).map(function (item) {
                        return { kind: item.kind, picture: picture(preprocess(item.strokes).pixels) };
                    });
                }
                let added = 0;
                let full = 0;
                made.forEach(function (item) {
                    const c = classes.findIndex(function (one) { return one.key === item.kind; });
                    if (c === -1) return;
                    if (countOf(c) >= MAX_PER_CLASS) {
                        full += 1;
                        return;
                    }
                    train.push(Object.assign({}, item.picture, { c: c, g: true }));
                    added += 1;
                });
                if (!added) {
                    say(full ? "lab.draw.examplesFull" : "lab.draw.examplesNone", { n: MAX_PER_CLASS });
                    return;
                }
                examplesChanged();
                say(full ? "lab.draw.examplesSome" : "lab.draw.examplesAdded", { n: added, max: MAX_PER_CLASS });
            }

            function addClass() {
                if (classes.length >= MAX_CLASSES) return;
                const used = classes.map(function (item) { return item.color; });
                let color = 0;
                while (used.indexOf(color) !== -1) color += 1;
                classes.push({ key: null, name: "", color: color });
                classesChanged();
                rows[rows.length - 1].name.focus();
                ctx.announce(t("lab.draw.classAdded", { name: nameOf(classes.length - 1) }));
            }

            function deleteClass(c) {
                const name = nameOf(c);
                function keep(example) { return example.c !== c; }
                function shift(example) {
                    if (example.c > c) example.c -= 1;
                    return example;
                }
                train = train.filter(keep).map(shift);
                test = test.filter(keep).map(shift);
                classes.splice(c, 1);
                classesChanged();
                rows[Math.min(c, rows.length - 1)].name.focus();
                ctx.announce(t("lab.draw.classDeleted", { name: name }));
            }

            function clearAll() {
                train = [];
                test = [];
                fillTests();
                examplesChanged();
                say("lab.draw.allDeleted");
            }

            // ----- The gallery -----
            // Each class has a row: its colour, its name (you can type a new one), how many
            // examples it has, a delete button, its average drawing and its examples.
            function buildRows() {
                disarm();
                rowsBox.textContent = "";
                rows = classes.map(function (item, c) {
                    const row = {
                        element: el("section", "dw-row"),
                        name: el("input", "dw-name", { type: "text", maxlength: String(MAX_NAME), autocomplete: "off", spellcheck: "false" }),
                        count: el("span", "dw-count"),
                        average: el("figure", "dw-average"),
                        list: el("ul", "dw-thumbs", { role: "list" }),
                        empty: textEl("p", "lk-help dw-empty", "lab.draw.rowEmpty"),
                        remove: kit.iconButton("trash", function () { return A.escapeHTML(t("lab.draw.deleteClass", { name: nameOf(c) })); }, { variant: "subtle", size: "sm" })
                    };
                    row.name.value = item.name;
                    row.name.addEventListener("input", function () {
                        item.name = row.name.value.slice(0, MAX_NAME);
                        renderNames(c);
                    });
                    row.name.addEventListener("change", saveData);
                    confirmButton(row.remove.element, {
                        onArm: function () {
                            row.remove.setLabel(function () { return A.escapeHTML(A.plural("lab.draw.deleteClassConfirm", countOf(c), { name: nameOf(c) })); });
                            ctx.announce(A.plural("lab.draw.deleteClassConfirm", countOf(c), { name: nameOf(c) }));
                        },
                        onDisarm: function () {
                            row.remove.setLabel(function () { return A.escapeHTML(t("lab.draw.deleteClass", { name: nameOf(c) })); });
                        },
                        onConfirm: function () { deleteClass(c); }
                    });
                    row.remove.setDisabled(classes.length <= MIN_CLASSES);
                    const head = el("div", "dw-row-head");
                    head.append(colorDot(item.color), row.name, row.count, row.remove.element);
                    const body = el("div", "dw-row-body");
                    body.append(row.average, row.list, row.empty);
                    row.element.append(head, body);
                    roving(row.list);
                    rowsBox.appendChild(row.element);
                    return row;
                });
                fillRows();
            }

            function fillRows() {
                disarm();
                rows.forEach(fillRow);
            }

            function fillRow(row, c) {
                const examples = [];
                train.forEach(function (example, index) {
                    if (example.c === c) examples.push(index);
                });
                row.name.placeholder = defaultName(c);
                row.name.setAttribute("aria-label", t("lab.draw.nameLabel", { n: c + 1 }));
                row.count.textContent = t("lab.draw.count", { n: examples.length, max: MAX_PER_CLASS });
                // The average drawing: every pixel's mean over the class's examples
                row.average.textContent = "";
                const mean = new Float64Array(PIXELS);
                examples.forEach(function (index) {
                    for (let i = 0; i < PIXELS; i++) mean[i] += train[index].values[i] / examples.length;
                });
                row.average.appendChild(thumbCanvas(mean, c));
                const caption = textEl("figcaption", "dw-average-caption", "lab.draw.average");
                row.average.appendChild(caption);
                row.average.setAttribute("role", "img");
                row.average.setAttribute("aria-label", t(examples.length ? "lab.draw.averageOf" : "lab.draw.averageNone", { name: nameOf(c) }));
                row.average.classList.toggle("is-empty", !examples.length);
                // The examples
                const tabStop = tabStopOf(row.list);
                row.list.textContent = "";
                examples.forEach(function (index, n) {
                    const label = t(train[index].g ? "lab.draw.madeLabel" : "lab.draw.yourLabel", { name: nameOf(c), n: n + 1 });
                    const item = el("li");
                    item.appendChild(thumbButton(train[index], label, function () { deleteExample(index); }));
                    row.list.appendChild(item);
                });
                setTabStop(row.list, tabStop);
                row.list.hidden = !examples.length;
                row.empty.hidden = examples.length > 0;
            }

            function focusIn(list, position, fallback) {
                const all = list.querySelectorAll("button");
                if (all.length) all[Math.min(position, all.length - 1)].focus();
                else fallback.focus();
            }

            function deleteExample(index) {
                const c = train[index].c;
                const row = rows[c];
                const position = train.filter(function (example, n) { return example.c === c && n < index; }).length;
                const hadFocus = row.list.contains(document.activeElement);
                train.splice(index, 1);
                examplesChanged();
                ctx.announce(A.plural("lab.draw.deleted", countOf(c), { name: nameOf(c) }));
                if (hadFocus) focusIn(row.list, position, row.name);
            }

            // A name changed: everything that shows it follows at once
            function renderNames(c) {
                kit.relabel(classButtons);
                fillRow(rows[c], c);
                showGuesses();
                fillTests();
                showMistakes(true);
                showSeen();
            }

            // The test drawings, in the colour of what they really are
            function fillTests() {
                disarm();
                testCount.textContent = t("lab.draw.count", { n: test.length, max: MAX_TEST });
                const tabStop = tabStopOf(testList);
                testList.textContent = "";
                test.forEach(function (example, n) {
                    const item = el("li");
                    item.appendChild(thumbButton(example, t("lab.draw.testLabel", { n: n + 1, name: nameOf(example.c) }), function () { deleteTest(n); }));
                    testList.appendChild(item);
                });
                setTabStop(testList, tabStop);
                testList.hidden = !test.length;
            }

            function deleteTest(n) {
                const hadFocus = testList.contains(document.activeElement);
                test.splice(n, 1);
                testsChanged();
                ctx.announce(A.plural("lab.draw.testDeleted", test.length));
                if (hadFocus) focusIn(testList, n, pad.canvas);
            }

            // ----- Training the network -----
            // A run trains for up to EPOCHS epochs (or MORE_EPOCHS with "Train more"), a little
            // in every frame (kit.loop keeps to TRAIN_BUDGET ms), and stops early when the loss is
            // below GOOD_LOSS. Train after a change goes on from the weights the network has.
            function canTrain() {
                const seenClasses = [];
                train.forEach(function (example) {
                    if (seenClasses.indexOf(example.c) === -1) seenClasses.push(example.c);
                });
                return seenClasses.length >= 2;
            }

            function trainLabel() {
                if (trainState === "running") return t("lab.kit.pause");
                if (trainState === "paused") return t("lab.draw.continue");
                if (trainState === "done" && netState === "trained") return t("lab.draw.trainMore");
                return t("lab.draw.train");
            }

            function newTrainingRun() {
                const more = trainState === "done" && netState === "trained";
                if (!net) {
                    net = createNetwork(classes.length, NET_SEED);
                    losses.length = 0;
                    lastAccuracy = null;
                }
                runs += 1;
                run = newRun({
                    seed: TRAIN_SEED + runs,
                    wiggle: wiggleOn,
                    epochs: more ? MORE_EPOCHS : EPOCHS,
                    goodLoss: more ? 0 : GOOD_LOSS
                });
                ending = "";
            }

            function pressTrain() {
                if (trainState === "running") {
                    loop.stop();
                    trainState = "paused";
                    showTraining();
                    return;
                }
                if (!canTrain()) {
                    say("lab.draw.needTwo");
                    return;
                }
                if (trainState !== "paused" || !run) newTrainingRun();
                trainState = "running";
                loop.start();
                showTraining();
                ctx.announce(A.plural("lab.draw.learning", train.length));
            }

            // One epoch at once, then a pause: to follow the training slowly
            function stepEpoch() {
                if (!canTrain()) {
                    say("lab.draw.needTwo");
                    return;
                }
                loop.stop();
                if (!run) newTrainingRun();
                let result = null;
                while (!result && !run.finished) result = trainChunk(net, run, train, test);
                if (result) epochEnded(result);
                if (run.finished) finishTraining();
                else trainState = "paused";
                showResults();
                showTraining();
                ctx.announce(t("lab.draw.epochSay", { n: losses.length, loss: kit.number(losses[losses.length - 1]), accuracy: percent(lastAccuracy) }));
            }

            function trainStep() {
                const result = trainChunk(net, run, train, test);
                if (result) {
                    epochEnded(result);
                    newEpochs = true;
                }
                if (run.finished) finishTraining();
            }

            // The loop's drawing: the screen changes only when an epoch has ended. The chart
            // goes first; what the network says now comes in the next frame (in a frame of its
            // own), so that no frame has too much to do.
            function drawTraining() {
                if (!newEpochs) return;
                newEpochs = false;
                showTraining();
                if (!resultsFrame) resultsFrame = requestAnimationFrame(showResults);
            }

            function epochEnded(result) {
                losses.push(result.loss);
                lastAccuracy = result.accuracy;
                lastGuesses = result.guesses;
                netState = "trained";
            }

            // What the network says with its new weights: the scores, its guess for your
            // drawing, and the Focus view. The epoch's check measured it already (unless the
            // test drawings changed since).
            function showResults() {
                if (resultsFrame) cancelAnimationFrame(resultsFrame);
                resultsFrame = 0;
                if (input && net) netGuess = netPredict(net, input);
                if (seenMode === "focus") showSeen();     // the other views don't show the network
                measureNet(lastAccuracy, lastGuesses.length === test.length ? lastGuesses : undefined);
                showGuesses();
            }

            // The last epoch's check measured the network as it is now (the training stopped)
            function finishTraining() {
                loop.stop();
                ending = run.ending;
                run = null;
                trainState = "done";
                ctx.announce(A.plural(ending === "goal" ? "lab.draw.doneGoal" : "lab.draw.doneEpochs", losses.length,
                    { loss: kit.number(GOOD_LOSS), accuracy: percent(lastAccuracy) }));
                ctx.track("milestone", { kind: "trained", epochs: losses.length, accuracy: lastAccuracy });
            }

            // The examples changed while training: the run's plan no longer fits them
            function stopRun() {
                loop.stop();
                run = null;
                trainState = "ready";
            }

            function resetNetwork() {
                stopRun();
                net = null;
                netState = "none";
                losses.length = 0;
                lastAccuracy = null;
                ending = "";
                measureNet();
                guessNow(false);
                showTraining();
                ctx.announce(t("lab.draw.netReset"));
            }

            function trainingNote() {
                if (!canTrain()) return t("lab.draw.needTwo");
                if (trainState === "running") return A.plural("lab.draw.learning", train.length);
                if (netState === "stale") return t("lab.draw.stale");
                if (trainState === "paused") return A.plural("lab.draw.pausedAt", losses.length);
                if (trainState === "done") {
                    return A.plural(ending === "goal" ? "lab.draw.doneGoal" : "lab.draw.doneEpochs", losses.length,
                        { loss: kit.number(GOOD_LOSS), accuracy: percent(lastAccuracy) });
                }
                return A.plural(net ? "lab.draw.readyMore" : "lab.draw.readyToTrain", train.length);
            }

            // The training panel: the chart, the numbers, the buttons and the note
            function showTraining() {
                chart.draw();
                epochStat.set(losses.length);
                lossStat.set(losses.length ? losses[losses.length - 1] : null);
                accuracyStat.set(lastAccuracy);
                status.set(trainState);
                trainButton.setLabel(trainLabel);
                trainButton.setIcon(trainState === "running" ? "pause" : "play");
                // Move the focus away first: a disabled button cannot keep it
                if (!net && document.activeElement === resetButton.element) trainButton.element.focus();
                resetButton.setDisabled(!net);
                trainNote.textContent = trainingNote();
                trainNote.classList.toggle("is-warn", netState === "stale" && trainState !== "running");
                chartView.describe(losses.length ? A.plural("lab.draw.chartDescribe", losses.length, { loss: kit.number(losses[losses.length - 1]) }) : t("lab.kit.chartEmpty"));
                renderExplain();
            }

            // ----- Measuring -----
            // Training accuracy: the examples it learned from (for k-NN each one is left out and
            // guessed from the others). Test accuracy: the test drawings, which it never learned.
            function measure() {
                if (resultsFrame) showResults();       // a waiting update of the network's results goes first
                measureKnn();
                measureNet();
            }

            function measureKnn() {
                if (!ranks) ranks = train.map(function (example, index) { return rankExamples(train, example, index); });
                if (!testRanks) testRanks = test.map(function (example) { return rankExamples(train, example, -1); });
                const guessed = train.length ? testRanks.map(function (ranked) { return knnVote(train, ranked, k, classes.length); }) : [];
                scores.knn = { train: leaveOneOut(train, k, classes.length, ranks), test: testAccuracy(guessed), guesses: guessed };
                showScores();
            }

            // trainAccuracy and testGuesses: known already (from the epoch that just ended), else measured
            function measureNet(trainAccuracy, testGuesses) {
                const ready = Boolean(net) && netState !== "none";
                let guessed = [];
                if (ready) guessed = testGuesses || test.map(function (example) { return netPredict(net, example); });
                let accuracy = null;
                if (ready) accuracy = trainAccuracy !== undefined ? trainAccuracy : (train.length ? netAccuracy(net, train).accuracy : null);
                scores.net = { train: accuracy, test: testAccuracy(guessed), guesses: guessed };
                showScores();
            }

            function testAccuracy(guessed) {
                if (test.length < MIN_TEST || !guessed.length) return null;
                return guessed.filter(function (guess, n) { return guess.best === test[n].c; }).length / test.length;
            }

            // force: draw the list of mistakes again even if it didn't change (a new language)
            function showScores(force) {
                [scores.knn.train, scores.knn.test, scores.net.train, scores.net.test].forEach(function (value, n) {
                    cells[n].textContent = value === null ? "—" : percent(value);
                });
                // A test score far below the training score: the model learned its examples, not the idea
                [scores.knn, scores.net].forEach(function (score, n) {
                    cells[n * 2 + 1].classList.toggle("is-low", gap(score) >= OVERFIT_GAP);
                });
                testsNote.hidden = test.length >= MIN_TEST;
                testsNote.textContent = testsNote.hidden ? "" : A.plural("lab.draw.needTests", MIN_TEST - test.length);
                showMistakes(force);
                checkChallenges();
                renderExplain();
            }

            function gap(score) {
                return score.train !== null && score.test !== null ? score.train - score.test : 0;
            }

            // The test drawings that a model got wrong, each with what it said
            function showMistakes(force) {
                const list = [];
                test.forEach(function (example, n) {
                    const saidKnn = scores.knn.guesses[n] && scores.knn.guesses[n].best !== example.c ? scores.knn.guesses[n].best : -1;
                    const saidNet = scores.net.guesses[n] && scores.net.guesses[n].best !== example.c ? scores.net.guesses[n].best : -1;
                    if (saidKnn !== -1 || saidNet !== -1) list.push({ n: n, knn: saidKnn, net: saidNet });
                });
                const shown = list.map(function (item) { return item.n + ":" + item.knn + ":" + item.net; }).join(" ") + "|" + test.length;
                if (shown === mistakesShown && !force) return;
                mistakesShown = shown;
                mistakesList.textContent = "";
                list.forEach(function (item) {
                    const example = test[item.n];
                    const row = el("li", "dw-mistake");
                    const picture = el("span", "dw-mistake-ink");
                    picture.style.setProperty("--dw-color", "var(--lk-series-" + (classes[example.c].color + 1) + ")");
                    picture.appendChild(thumbCanvas(example.values, example.c));
                    const words = el("p", "dw-mistake-text");
                    words.innerHTML = [safeText("lab.draw.really", { name: nameOf(example.c) })]
                        .concat(item.knn !== -1 ? [safeText("lab.draw.saidKnn", { name: nameOf(item.knn) })] : [])
                        .concat(item.net !== -1 ? [safeText("lab.draw.saidNet", { name: nameOf(item.net) })] : [])
                        .join("<br>");
                    row.append(picture, words);
                    mistakesList.appendChild(row);
                });
                mistakesList.hidden = !list.length;
                noMistakes.hidden = list.length > 0;
                mistakesBox.hidden = !test.length || (!scores.knn.guesses.length && !scores.net.guesses.length);
            }

            // ----- "What's happening?" and "Try this" -----
            function renderExplain() {
                const ink = input ? input.ink.length : 0;
                const loss = losses.length ? losses[losses.length - 1] : "—";
                let step = 0;
                if (trainState === "running") step = 3;
                else if (gap(scores.knn) >= OVERFIT_GAP || gap(scores.net) >= OVERFIT_GAP) step = 4;
                else if (input && netGuess) step = 2;
                else if (input && knnGuess) step = 1;
                // written again only when a number changed (this runs while you draw)
                const shown = [ink, train.length, k, classes.length, loss, step].join(" ");
                if (shown === explainShown) return;
                explainShown = shown;
                explain.setValues(0, { pixels: PIXELS, ink: ink });
                explain.setValues(1, { examples: train.length, k: k });
                explain.setValues(2, { weights: weightCount(classes.length) });
                explain.setValues(3, { loss: loss });
                explain.setStep(step);
            }

            function checkChallenges() {
                const sun = classes.findIndex(function (item) { return item.key === "sun"; });
                const trained = netState === "trained";
                const enough = test.length >= LOOKS_GOOD.tests;
                function looksGood(score) {
                    return score.train !== null && score.train >= LOOKS_GOOD.train && score.test !== null && score.test <= LOOKS_GOOD.test;
                }
                challenges.check({
                    sureSun: trained && Boolean(netGuess) && netGuess.best === sun && netGuess.confidence >= SURE_SUN,
                    looksGood: enough && ((trained && looksGood(scores.net)) || looksGood(scores.knn)),
                    // "Fix it" means the model of challenge 2: there is something to fix only after that
                    fixed: challenges.isDone(1) && test.length >= FIXED.tests && trained && scores.net.test !== null && scores.net.test >= FIXED.test,
                    fooled: fooled
                });
            }

            // ----- Everything on screen, from the numbers -----
            function renderAll() {
                sentences.forEach(function (item) { fillSentence(item.element, item.key, item.links); });
                modeHelp.textContent = t(mode === "teach" ? "lab.draw.teachHelp" : "lab.draw.testHelp");
                fillRows();
                fillTests();
                showScores(true);
                paintPad();
                guessNow(false);
                showTraining();
            }

            fillClassButtons();
            buildRows();
            fillTests();
            addClassButton.setDisabled(classes.length >= MAX_CLASSES);
            clearAllButton.setDisabled(!train.length && !test.length);
            measure();
            renderAll();

            // ----- The controller: the hub calls these -----
            return {
                pause: function () {
                    resumeOnShow = loop.running();
                    loop.stop();
                    if (resultsFrame) showResults();       // now, instead of in a frame
                    if (frame) cancelAnimationFrame(frame);
                    frame = 0;
                    drawing = null;
                    if (pen) pen.down = false;
                    disarm();
                },
                resume: function () {
                    if (resumeOnShow && trainState === "running" && run) loop.start();
                    resumeOnShow = false;
                    padChanged();
                },
                language: function () {
                    kit.relabel(stage);
                    padHint.hide();
                    renderAll();
                },
                theme: function () {
                    kit.colors.invalidate();
                    paintPad();
                    showSeen();
                    chart.draw();
                    stage.querySelectorAll("canvas.dw-ink").forEach(paintThumb);
                },
                motion: function () {
                    paintPad();
                },
                destroy: function () {
                    loop.stop();
                    if (frame) cancelAnimationFrame(frame);
                    if (resultsFrame) cancelAnimationFrame(resultsFrame);
                    frame = 0;
                    resultsFrame = 0;
                    disarm();
                    pad.destroy();
                    seen.destroy();
                    chartView.destroy();
                }
            };
        }
    });
})();
