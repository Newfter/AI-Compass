/* =========================================================
   AI COMPASS — LAB: FINDING GROUPS (k-means clustering)
   Points on a board, and nobody tells the computer which points belong
   together. k-means finds groups by itself: it places k centres, every
   point joins its nearest centre (Assign), each centre moves to the
   middle of its points (Update), and it repeats until no point changes
   group. People then decide what the groups mean. This is
   "unsupervised learning": learning from data without any answers.
   This is Lloyd's algorithm (1957), the usual way to run k-means. The
   "k-means++" start is from Arthur and Vassilvitskii (2007).

   The presets (seeded examples) are in js/content/lab/cluster.js.
   Its tests: dev/tests/cluster.math.js (the maths, in Node) and
   dev/tests/cluster.test.js (the page, in a browser).

   Sections:
    1. Settings
    2. Small helpers
    3. The points: presets and saved boards
    4. The maths: k-means
    5. Drawing the board
    6. The experiment (A.lab.define)
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
    // ----- The points -----
    const MAX_POINTS = 400;                  // a board holds at most this many points
    const EDGE = 0.02;                       // preset points stay this far inside the 0..1 square
    const MAX_TRIES = 50;                    // a bell-curve point outside the square is drawn again, this many times at most
    const MOONS_WIDTH = 0.88;                // the two moons fill this much of the square's width
    const DEFAULT_PRESET = "three";          // the board on the first visit

    // ----- k-means -----
    const K_RANGE = { min: 1, max: 8, value: 3 };   // the k slider
    const MAX_ITERATIONS = 100;              // a run always stops here (k-means settles long before: a seat belt)
    const STARTS = ["random", "plusplus"];   // how a run places its first centres ("Starting centres")
    const OWN_START = 1;                     // the first run's seed on your own points (a preset has its own)

    // ----- Play -----
    const SPEEDS = ["watch", "fast"];
    const BEAT = { watch: 900, fast: 150 };  // ms from one half-step to the next while playing
    const GLIDE = { watch: 550, fast: 120 }; // ms the centres take to glide to their new place (only with animations on)

    // ----- The elbow chart -----
    const ELBOW_RUNS = 5;                    // each k: the best of 5 k-means++ runs...
    const ELBOW_SEED = 101;                  // ...whose seeds are ELBOW_SEED + 10·k + run: always the same chart
    const ELBOW_BUDGET = 4;                  // ms of elbow runs per frame at most, so the page stays smooth
    const BAD_RESULT = 1.5;                  // challenge 2: a finished run with an inertia above 1.5 × the best known
    // Presets with round groups: there, a bad result means one centre took two groups. (On
    // Stretched a high inertia means the opposite: the rare run that found the long groups.)
    const ROUND_PRESETS = ["three", "five", "sizes", "shop"];

    // ----- The board (sizes in CSS px; css/lab/cluster.css keeps it square) -----
    const BOARD = {
        pad: 14,                             // room around the 0..1 square...
        axisLeft: 56,                        // ...but more on the left and at the bottom when the axes have
        axisBottom: 40,                      //    names and numbers (Shop customers)
        gridLines: 10,                       // a faint grid line every tenth of the square
        point: { min: 3, max: 4.6, per: 110 },     // a point's radius: the square's size / 110, within these limits
        centre: { min: 8, max: 12, per: 42 },      // a centre ring's radius, worked out the same way
        glow: 14,                            // px of soft glow around each centre (only with animations on)
        distanceAlpha: 0.4,                  // how strong the lines from the points to their centres are
        regionCells: 56,                     // "Show regions" colours a 56 × 56 grid; the browser smooths it out
        regionAlpha: { dark: 0.17, light: 0.15 },
        keySteps: 40,                        // the keyboard cursor moves on a 41 × 41 grid of spots...
        keyJump: 5                           // ...and Shift + an arrow key jumps 5 spots
    };
    // A second clue next to colour, for colour-blind eyes: group 1 is dots, group 2 squares...
    const SHAPES = ["dot", "square", "triangle", "diamond"];

    // ----- Shop customers -----
    const NAME_LENGTH = 20;                  // a group's name: at most 20 characters
    const MONEY_ROUND = 10;                  // money in the descriptions is rounded to $10

    // ----- Saved things (ctx.store) -----
    // "settings" = { v, k, start, speed, regions, distances }
    // "board"    = { v, base: a preset's id or null, added: [[x, y], ...] (your own points) }
    const SAVE_VERSION = 1;
    const HISTORY = 50;                      // Undo remembers this many changes of the board

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    let idCount = 0;

    // A new id for this page: "km-7"
    function newId() {
        idCount += 1;
        return "km-" + idCount;
    }

    // Makes an element: el("p", "km-caption", { id: "x" })
    function el(tag, className, attributes) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        Object.keys(attributes || {}).forEach(function (name) {
            element.setAttribute(name, attributes[name]);
        });
        return element;
    }

    // An element whose text is a translation key: core translates it again by itself
    function textEl(tag, className, key) {
        const element = el(tag, className, { "data-i18n": key });
        element.innerHTML = t(key);
        return element;
    }

    // Writes a text only when it changed (a text that stays the same costs nothing)
    function setText(element, text) {
        if (element.textContent !== text) element.textContent = text;
    }

    // TODO(kit): kit.sentence(element, key, links). A translated sentence whose {placeholders}
    // are elements, such as glossary links: sentence(p, "lab.cluster.realWorld", { data: makeLink }).
    // Each link is made again (in the new language) when the sentence is written again.
    function sentence(element, key, links) {
        element.textContent = "";
        t(key).split(/(\{\w+\})/).forEach(function (part) {
            const name = /^\{(\w+)\}$/.exec(part);
            if (name && links[name[1]]) element.appendChild(links[name[1]]());
            else if (part) element.appendChild(document.createTextNode(part));
        });
    }

    // TODO(kit): kit.textField({ labelKey, placeholderKey, maxLength, onInput }): a one-line text
    // box with a label, in the kit's style (the kit has no text box yet). The label here holds
    // a colour mark and two lines of text, so it is built by the caller and handed in.
    function textField(label, maxLength, onInput) {
        const id = newId();
        const element = el("div", "lk-field km-field");
        label.setAttribute("for", id);
        const input = el("input", "km-input", { id: id, type: "text", maxlength: String(maxLength), autocomplete: "off", spellcheck: "false" });
        input.addEventListener("input", function () { onInput(input.value); });
        element.append(label, input);
        return { element: element, input: input };
    }

    // A small coloured shape, like the group's points on the board (a legend mark)
    function swatch(group) {
        const mark = el("span", "km-swatch", { "aria-hidden": "true", "data-shape": SHAPES[group % SHAPES.length] });
        mark.style.setProperty("--km-color", "var(--lk-series-" + ((group % 8) + 1) + ")");
        return mark;
    }

    function isUnit(value) {
        return typeof value === "number" && isFinite(value) && value >= 0 && value <= 1;
    }

    // A number from 0 to 1 rounded to 3 decimals, so saved boards stay small
    function round3(value) {
        return Math.round(value * 1000) / 1000;
    }

    /* =========================================================
       3. THE POINTS: PRESETS AND SAVED BOARDS
       A point is { x, y, truth } in a square from 0 to 1 (y goes up).
       truth is the group a preset made the point in. The computer never
       sees it: the tests use it to check how well k-means did. Your own
       points have truth -1.
       ========================================================= */
    function presetList() {
        const data = A.content.get("lab.cluster");
        return data && Array.isArray(data.presets) ? data.presets : [];
    }

    function presetOf(id) {
        return presetList().filter(function (preset) { return preset.id === id; })[0] || null;
    }

    function inside(x, y) {
        return x >= EDGE && x <= 1 - EDGE && y >= EDGE && y <= 1 - EDGE;
    }

    function keepInside(value) {
        return A.util.clamp(value, EDGE, 1 - EDGE);
    }

    // One point of a blob: a bell curve around (x, y). sd is how far it spreads, sd2 how far
    // across (for a stretched blob), and angle turns it (in degrees). A point that falls
    // outside the square is drawn again.
    function blobPoint(blob, group, random) {
        const angle = ((blob.angle || 0) * Math.PI) / 180;
        const across = blob.sd2 === undefined ? blob.sd : blob.sd2;
        let x = blob.x;
        let y = blob.y;
        for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
            const u = random.normal(0, blob.sd);
            const v = random.normal(0, across);
            x = blob.x + u * Math.cos(angle) - v * Math.sin(angle);
            y = blob.y + u * Math.sin(angle) + v * Math.cos(angle);
            if (inside(x, y)) break;
        }
        return { x: keepInside(x), y: keepInside(y), truth: group };
    }

    // Two moons: two half circles that hook into each other (the classic shape k-means can't
    // separate). In "moon units" the upper one is (cos a, sin a) and the lower one is
    // (1 − cos a, 0.5 − sin a), for a from 0 to 180°: 3 units wide. They are scaled into the square.
    function addMoons(points, moons, random) {
        const scale = MOONS_WIDTH / 3;
        for (let i = 0; i < moons.n; i++) {
            const lower = i % 2;
            const a = random.range(0, Math.PI);
            const mx = (lower ? 1 - Math.cos(a) : Math.cos(a)) + random.normal(0, moons.noise);
            const my = (lower ? 0.5 - Math.sin(a) : Math.sin(a)) + random.normal(0, moons.noise);
            points.push({ x: keepInside(0.5 + (mx - 0.5) * scale), y: keepInside(0.5 + (my - 0.25) * scale), truth: lower });
        }
    }

    // The points of a preset, made from its seed (the same points every time)
    function makePoints(preset) {
        const random = kit.rng(preset.seed);
        const points = [];
        if (preset.moons) addMoons(points, preset.moons, random);
        (preset.blobs || []).forEach(function (blob, group) {
            for (let i = 0; i < blob.n; i++) points.push(blobPoint(blob, group, random));
        });
        return points;
    }

    // Saved data can be old, broken or edited by hand: check every part of it
    function isSettings(value) {
        return value.v === SAVE_VERSION && Number.isInteger(value.k) && value.k >= K_RANGE.min && value.k <= K_RANGE.max &&
            STARTS.indexOf(value.start) !== -1 && SPEEDS.indexOf(value.speed) !== -1 &&
            typeof value.regions === "boolean" && typeof value.distances === "boolean";
    }

    function isBoard(value) {
        return value.v === SAVE_VERSION && (value.base === null || Boolean(presetOf(value.base))) &&
            Array.isArray(value.added) && value.added.length <= MAX_POINTS &&
            value.added.every(function (pair) { return Array.isArray(pair) && pair.length === 2 && isUnit(pair[0]) && isUnit(pair[1]); });
    }

    /* =========================================================
       4. THE MATHS: k-MEANS
       Pure functions (they change nothing they are given), so the tests
       can check them by hand. A centre is { x, y }; "labels" lists the
       group of every point (-1: a new point with no group yet).
       ========================================================= */
    // The squared distance between two points. k-means compares squared distances: the
    // nearest point is the same either way, and no square root is needed.
    function distance2(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    }

    // The number of the centre nearest to a point (on a tie, the first one)
    function nearest(point, centres) {
        let best = 0;
        let bestDistance = Infinity;
        for (let i = 0; i < centres.length; i++) {
            const d = distance2(point, centres[i]);
            if (d < bestDistance) {
                best = i;
                bestDistance = d;
            }
        }
        return best;
    }

    // ASSIGN: every point joins its nearest centre. Returns the new labels.
    // previous (optional): the labels so far. On a tie a point stays in its group, so a
    // point only moves to a centre that is really nearer, and a run can't go round in circles.
    function assign(points, centres, previous) {
        return points.map(function (point, i) {
            const group = nearest(point, centres);
            const old = previous ? previous[i] : -1;
            if (old >= 0 && old < centres.length && old !== group && distance2(point, centres[old]) <= distance2(point, centres[group])) return old;
            return group;
        });
    }

    // How many points are in another group than before (a point that had no group counts too)
    function countChanged(before, after) {
        let changed = 0;
        for (let i = 0; i < after.length; i++) {
            if (!before || before[i] !== after[i]) changed += 1;
        }
        return changed;
    }

    // UPDATE: each centre moves to the mean of its points (the average x and the average y),
    // the middle of its group. A centre with no points stays where it is: it has nothing to
    // average. Points with no group yet (-1) don't pull any centre.
    function update(points, labels, centres) {
        const sums = centres.map(function () { return { x: 0, y: 0, n: 0 }; });
        points.forEach(function (point, i) {
            const group = labels[i];
            if (group < 0 || group >= centres.length) return;
            sums[group].x += point.x;
            sums[group].y += point.y;
            sums[group].n += 1;
        });
        return centres.map(function (centre, group) {
            const sum = sums[group];
            if (sum.n === 0) return { x: centre.x, y: centre.y };
            return { x: sum.x / sum.n, y: sum.y / sum.n };
        });
    }

    // INERTIA: the squared distance from each point to its group's centre, all added up.
    // Small = tight groups. Neither Assign nor Update can ever make it bigger: Assign gives
    // each point a nearer (or the same) centre, and the mean is the spot with the smallest sum
    // of squared distances to a group's points.
    function inertia(points, labels, centres) {
        let total = 0;
        points.forEach(function (point, i) {
            const group = labels[i];
            if (group >= 0 && group < centres.length) total += distance2(point, centres[group]);
        });
        return total;
    }

    // "Random points" start: k different points, picked at random, are the first centres
    function initRandom(points, k, random) {
        const order = random.shuffle(points.map(function (point, i) { return i; }));
        return order.slice(0, k).map(function (i) { return { x: points[i].x, y: points[i].y }; });
    }

    // "k-means++" start: the first centre is a random point. Each next centre is a point picked
    // at random too, but with a chance in proportion to its squared distance from the nearest
    // centre chosen so far, so far-away points are much more likely: the centres start spread out.
    function initKMeansPlusPlus(points, k, random) {
        const first = points[random.int(points.length)];
        const centres = [{ x: first.x, y: first.y }];
        const far = points.map(function (point) { return distance2(point, first); });     // to the nearest centre so far
        while (centres.length < k) {
            let total = 0;
            far.forEach(function (d) { total += d; });
            let pick = -1;
            if (total > 0) {
                // A spot on a line made of every point's squared distance, end to end: a point
                // owns a piece of the line as long as its squared distance
                let roll = random.next() * total;
                for (let i = 0; i < far.length; i++) {
                    if (far[i] <= 0) continue;
                    pick = i;
                    roll -= far[i];
                    if (roll < 0) break;
                }
            } else {
                pick = random.int(points.length);      // every point already sits on a centre
            }
            const chosen = points[pick];
            centres.push({ x: chosen.x, y: chosen.y });
            far.forEach(function (d, i) { far[i] = Math.min(d, distance2(points[i], chosen)); });
        }
        return centres;
    }

    function startCentres(points, k, start, random) {
        return start === "random" ? initRandom(points, k, random) : initKMeansPlusPlus(points, k, random);
    }

    // A whole run, start to finish: Assign and Update until no point changes group.
    // -> { centres, labels, inertia, iterations } (iterations: how many times it assigned)
    function run(points, k, start, random) {
        let centres = startCentres(points, k, start, random);
        let labels = null;
        let iterations = 0;
        while (iterations < MAX_ITERATIONS) {
            const next = assign(points, centres, labels);
            iterations += 1;
            const changed = countChanged(labels, next);
            labels = next;
            if (changed === 0) break;
            centres = update(points, labels, centres);
        }
        return { centres: centres, labels: labels, inertia: inertia(points, labels, centres), iterations: iterations };
    }

    // The elbow chart's seeds: fixed, so the chart is the same every time
    function elbowSeed(k, attempt) {
        return ELBOW_SEED + k * 10 + attempt;
    }

    // The best inertia of ELBOW_RUNS k-means++ runs for one k (the page does the same runs a few
    // at a time, between frames)
    function elbowBest(points, k) {
        let best = null;
        for (let attempt = 0; attempt < ELBOW_RUNS; attempt++) {
            const result = run(points, k, "plusplus", kit.rng(elbowSeed(k, attempt)));
            if (best === null || result.inertia < best) best = result.inertia;
        }
        return best;
    }

    /* =========================================================
       5. DRAWING THE BOARD
       drawBoard(view, scene) paints everything from a "scene", a plain
       object made in section 6: the points, their groups, the centres
       where they are drawn now, the switches and the texts.
       ========================================================= */
    // Where the 0..1 square sits on the canvas: { left, top, size } in CSS px. With named
    // axes (Shop customers) there is more room on the left and at the bottom for them.
    function squareOf(view, axes) {
        const left = axes ? BOARD.axisLeft : BOARD.pad;
        const bottom = axes ? BOARD.axisBottom : BOARD.pad;
        const size = Math.max(10, Math.min(view.width - left - BOARD.pad, view.height - bottom - BOARD.pad));
        return {
            left: left + (view.width - left - BOARD.pad - size) / 2,
            top: BOARD.pad + (view.height - bottom - BOARD.pad - size) / 2,
            size: size
        };
    }

    // From the square's numbers to canvas px and back (y goes up in the square, down on the canvas)
    function toScreen(square, point) {
        return { x: square.left + point.x * square.size, y: square.top + (1 - point.y) * square.size };
    }

    function fromScreen(square, x, y) {
        return { x: (x - square.left) / square.size, y: 1 - (y - square.top) / square.size };
    }

    function sizeFor(square, rule) {
        return A.util.clamp(square.size / rule.per, rule.min, rule.max);
    }

    // The colours of the groups as [r, g, b] (for the regions picture), kept for one theme
    let groupRGB = { theme: null, list: [] };

    function groupColours(c) {
        if (groupRGB.theme !== c.theme) groupRGB = { theme: c.theme, list: c.series.map(function (color) { return A.colors.parse(color) || [128, 128, 128]; }) };
        return groupRGB.list;
    }

    // The regions: a small picture (regionCells × regionCells) in which every cell has the
    // colour of its nearest centre. It is drawn stretched over the square, and the browser
    // smooths it: soft borders. (These areas are called Voronoi cells.)
    function paintRegions(picture, centres, c) {
        const cells = BOARD.regionCells;
        const context = picture.getContext("2d");
        const image = context.createImageData(cells, cells);
        const colours = groupColours(c);
        const alpha = Math.round((c.light ? BOARD.regionAlpha.light : BOARD.regionAlpha.dark) * 255);
        for (let row = 0; row < cells; row++) {
            for (let column = 0; column < cells; column++) {
                const group = nearest({ x: (column + 0.5) / cells, y: 1 - (row + 0.5) / cells }, centres);
                const colour = colours[group % colours.length];
                const at = (row * cells + column) * 4;
                image.data[at] = colour[0];
                image.data[at + 1] = colour[1];
                image.data[at + 2] = colour[2];
                image.data[at + 3] = alpha;
            }
        }
        context.putImageData(image, 0, 0);
    }

    // The faint grid inside the square, a little stronger at its edges
    function drawSquareGrid(ctx, square, c) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = c.grid;
        ctx.beginPath();
        for (let i = 1; i < BOARD.gridLines; i++) {
            const at = Math.round(square.left + (i / BOARD.gridLines) * square.size) + 0.5;
            const down = Math.round(square.top + (i / BOARD.gridLines) * square.size) + 0.5;
            ctx.moveTo(at, square.top);
            ctx.lineTo(at, square.top + square.size);
            ctx.moveTo(square.left, down);
            ctx.lineTo(square.left + square.size, down);
        }
        ctx.stroke();
        ctx.strokeStyle = kit.alpha(c.text, c.light ? 0.16 : 0.14);
        ctx.strokeRect(Math.round(square.left) + 0.5, Math.round(square.top) + 0.5, Math.round(square.size), Math.round(square.size));
    }

    // Shop customers: numbers and names on the two axes
    function drawAxes(ctx, square, axes, c) {
        ctx.fillStyle = c.muted;
        ctx.font = kit.font(11, 500, "mono");
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        for (let visits = 0; visits <= axes.visits; visits += axes.visitsStep) {
            ctx.fillText(A.format.number(visits), square.left + (visits / axes.visits) * square.size, square.top + square.size + 5);
        }
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (let money = 0; money <= axes.money; money += axes.moneyStep) {
            ctx.fillText(t("lab.cluster.money", { n: A.format.number(money) }), square.left - 6, square.top + (1 - money / axes.money) * square.size);
        }
        ctx.font = kit.font(11, 600, "body");
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(t("lab.cluster.visitsAxis"), square.left + square.size, square.top + square.size + BOARD.axisBottom - 2);
        ctx.save();
        ctx.translate(square.left - BOARD.axisLeft + 3, square.top);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(t("lab.cluster.moneyAxis"), 0, 0);
        ctx.restore();
    }

    // A centre: a ring with a cross, in its group's colour, on a dark (or light) halo
    function drawCentre(ctx, x, y, radius, color, c, glow) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = kit.alpha(c.surface, 0.55);
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = c.surface;
        ctx.stroke();
        if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = BOARD.glow;
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.shadowBlur = 0;
        const arm = radius * 0.55;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - arm, y);
        ctx.lineTo(x + arm, y);
        ctx.moveTo(x, y - arm);
        ctx.lineTo(x, y + arm);
        ctx.stroke();
    }

    // A group's name under its centre, on a small plate (kept inside the canvas)
    function drawName(ctx, view, x, y, text, color, c) {
        ctx.font = kit.font(12, 700, "body");
        const width = ctx.measureText(text).width + 14;
        const height = 22;
        const left = A.util.clamp(x - width / 2, 2, view.width - width - 2);
        const top = A.util.clamp(y, 2, view.height - height - 2);
        ctx.beginPath();
        A.canvas.roundRect(ctx, left, top, width, height, 8);
        ctx.fillStyle = kit.alpha(c.surface, 0.9);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.fillStyle = c.text;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, left + width / 2, top + height / 2 + 0.5);
    }

    // The keyboard cursor: a cross-hair in a circle
    function drawCursor(ctx, x, y, c) {
        ctx.lineCap = "round";
        [[c.surface, 5], [c.accent2, 2]].forEach(function (pen) {
            ctx.strokeStyle = pen[0];
            ctx.lineWidth = pen[1];
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.moveTo(x - 15, y);
            ctx.lineTo(x - 5, y);
            ctx.moveTo(x + 5, y);
            ctx.lineTo(x + 15, y);
            ctx.moveTo(x, y - 15);
            ctx.lineTo(x, y - 5);
            ctx.moveTo(x, y + 5);
            ctx.lineTo(x, y + 15);
            ctx.stroke();
        });
    }

    // Everything on the board, back to front: regions, grid, axes, lines to the centres,
    // points, centres, names, the cursor
    function drawBoard(view, scene) {
        const ctx = view.ctx;
        if (!view.width || !view.height) return;
        const c = kit.colors();
        const square = squareOf(view, scene.axes);
        const pointRadius = sizeFor(square, BOARD.point);
        const centreRadius = sizeFor(square, BOARD.centre);
        const centres = scene.centres;
        const labels = scene.labels;
        ctx.clearRect(0, 0, view.width, view.height);

        if (scene.regions && centres.length) {
            paintRegions(scene.picture, centres, c);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(scene.picture, square.left, square.top, square.size, square.size);
        }
        drawSquareGrid(ctx, square, c);
        if (scene.axes) drawAxes(ctx, square, scene.axes, c);

        // Lines from every point to its centre: one path per group
        if (scene.distances && labels && centres.length) {
            ctx.lineWidth = 1;
            centres.forEach(function (centre, group) {
                const end = toScreen(square, centre);
                ctx.beginPath();
                scene.points.forEach(function (point, i) {
                    if (labels[i] !== group) return;
                    const start = toScreen(square, point);
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                });
                ctx.strokeStyle = kit.alpha(c.series[group % c.series.length], BOARD.distanceAlpha);
                ctx.stroke();
            });
        }

        scene.points.forEach(function (point, i) {
            const spot = toScreen(square, point);
            const group = labels ? labels[i] : -1;
            if (group >= 0) kit.marker(ctx, SHAPES[group % SHAPES.length], spot.x, spot.y, pointRadius, c.series[group % c.series.length]);
            else kit.marker(ctx, "dot", spot.x, spot.y, pointRadius, c.muted);
        });

        centres.forEach(function (centre, group) {
            const spot = toScreen(square, centre);
            drawCentre(ctx, spot.x, spot.y, centreRadius, c.series[group % c.series.length], c, scene.glow);
        });

        (scene.names || []).forEach(function (name, group) {
            if (!name || !centres[group]) return;
            const spot = toScreen(square, centres[group]);
            drawName(ctx, view, spot.x, spot.y + centreRadius + 6, name, c.series[group % c.series.length], c);
        });

        if (scene.cursor) {
            const spot = toScreen(square, scene.cursor);
            drawCursor(ctx, spot.x, spot.y, c);
        }

        if (!scene.points.length) {
            ctx.font = kit.font(13, 600, "body");
            ctx.fillStyle = c.muted;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(scene.emptyText, square.left + square.size / 2, square.top + square.size / 2);
        }
    }

    /* =========================================================
       6. THE EXPERIMENT
       ========================================================= */
    A.lab.define("cluster", {
        // The maths, for dev/tests/cluster.math.js (the hub doesn't use it)
        maths: {
            makePoints: makePoints, presetOf: presetOf, distance2: distance2, nearest: nearest, assign: assign,
            countChanged: countChanged, update: update, inertia: inertia, initRandom: initRandom,
            initKMeansPlusPlus: initKMeansPlusPlus, run: run, elbowSeed: elbowSeed, elbowBest: elbowBest,
            settings: { MAX_POINTS: MAX_POINTS, MAX_ITERATIONS: MAX_ITERATIONS, ELBOW_RUNS: ELBOW_RUNS, BAD_RESULT: BAD_RESULT }
        },

        create: function (stage, ctx) {
            // ----- Saved settings and points (anything odd means the defaults) -----
            const saved = ctx.store.get("settings", null, isSettings);
            const savedBoard = ctx.store.get("board", null, isBoard);

            // ----- State -----
            // board: where the points come from: a preset (base) and your own points (added)
            let board = savedBoard ? { base: savedBoard.base, added: savedBoard.added.slice() } : { base: DEFAULT_PRESET, added: [] };
            let points = [];
            let k = saved ? saved.k : K_RANGE.value;
            let start = saved ? saved.start : "plusplus";
            let speed = saved ? saved.speed : "watch";
            let showRegions = saved ? saved.regions : true;
            let showDistances = saved ? saved.distances : false;
            // The run. next: the half-step that comes next ("start", "assign" or "update");
            // changed: points that changed group in the last Assign; inertia: null until a point has a group
            let current = null;
            let state = "ready";                 // "ready" | "running" | "paused" | "done"
            let history = [];                    // earlier boards, for Undo
            let names = [];                      // the names you give the groups (Shop customers)
            let namedOnce = false;               // the "named" milestone is sent once per run
            const cursor = { x: 0.5, y: 0.5, shown: false };     // the keyboard cursor
            const elbowValues = [];              // the chart's line: the best inertia for k = 1, 2... (it grows as the runs finish)
            const runValues = [];                // the chart's dot: this run's inertia at its k
            let elbowJobs = [];                  // elbow runs still to do: { k, attempt }
            let glide = null;                    // { from: centres, started, ms } while the centres glide
            let frame = 0;                       // the animation frame we wait for (0: none)
            let nextBeat = 0;                    // when the next half-step is due while playing
            let hidden = false;                  // the hub paused us: off screen, or the tab is hidden
            const picture = document.createElement("canvas");     // the regions, small (section 5)
            picture.width = BOARD.regionCells;
            picture.height = BOARD.regionCells;

            // ----- The page: kit parts, plus a text box for each group's name -----
            const ui = kit.layout(stage, { side: true });

            // Top: the presets and what the chosen one is about
            const presetChips = kit.chips({
                labelKey: "lab.kit.presets",
                options: presetList().map(function (preset) { return { value: preset.id, labelKey: "lab.cluster.preset." + preset.id }; }),
                value: board.base,
                onChange: loadPreset
            });
            const caption = el("p", "km-caption");
            ui.top.append(presetChips.element, caption);

            // Main: the board, its tools, and the names of the groups
            const boardHead = el("div", "km-board-head");
            const phase = el("span", "km-phase");
            const count = el("span", "km-count");
            boardHead.append(phase, count);
            const boardBox = el("div", "km-board");
            const scene = kit.canvas(boardBox, { aspect: 1, labelKey: "lab.cluster.canvas" });
            scene.canvas.classList.add("km-canvas");
            scene.canvas.tabIndex = 0;
            scene.canvas.setAttribute("role", "application");
            const boardHelp = textEl("p", "lk-help km-help", "lab.cluster.boardHelp");
            boardHelp.id = newId();
            scene.canvas.setAttribute("aria-describedby", scene.canvas.getAttribute("aria-describedby") + " " + boardHelp.id);
            const undoButton = kit.button("lab.cluster.undo", { icon: "undo", size: "sm", onClick: undo });
            const clearButton = kit.button("lab.cluster.clear", { icon: "trash", size: "sm", variant: "danger", onClick: clearBoard });
            const boardLegend = kit.legend([
                { labelKey: "lab.cluster.legendPoint", color: "var(--text-muted)", shape: "dot" },
                { labelKey: "lab.cluster.legendCentre", color: "var(--text)", shape: "ring" }
            ]);
            const boardTools = kit.toolbar([undoButton, clearButton]);
            boardTools.classList.add("km-tools");
            boardTools.appendChild(boardLegend.element);
            const warning = kit.hint({ tone: "warn" });
            const lesson = kit.hint({ tone: "info" });
            warning.hide();
            lesson.hide();

            const namesPanel = el("section", "km-panel km-names");
            const namesTitle = textEl("h4", "km-title", "lab.cluster.namesTitle");
            namesTitle.id = newId();
            namesPanel.setAttribute("aria-labelledby", namesTitle.id);
            const namesList = el("div", "km-name-list");
            namesPanel.append(namesTitle, textEl("p", "lk-help", "lab.cluster.namesHelp"), namesList);
            namesPanel.hidden = true;
            let nameFields = [];                 // one per group: { element, input, title, details }

            // (in one box, so that the board and everything under it line up when the column is wide)
            const boardArea = el("div", "km-area");
            boardArea.append(boardHead, boardBox, boardTools, boardHelp, warning.element, lesson.element, namesPanel);
            ui.main.appendChild(boardArea);

            // Side: the buttons, the settings, the numbers and the elbow chart
            const playButton = kit.button("lab.kit.play", { icon: "play", variant: "primary", onClick: togglePlay });
            const stepButton = kit.button("lab.kit.step", { icon: "step", onClick: stepOnce });
            const resetButton = kit.button("lab.kit.reset", { icon: "reset", onClick: resetRun });
            const newStartButton = kit.button("lab.cluster.newStart", { icon: "dice", variant: "subtle", onClick: newStart });
            const status = kit.status("ready");
            const kSlider = kit.slider({
                labelKey: "lab.cluster.k", min: K_RANGE.min, max: K_RANGE.max, step: 1, value: k,
                hintKey: "lab.cluster.kHint",
                onInput: setK,
                onChange: saveSettings
            });
            const startControl = kit.segmented({
                labelKey: "lab.cluster.start",
                options: [{ value: "random", labelKey: "lab.cluster.startRandom" }, { value: "plusplus", labelKey: "lab.cluster.startPlus" }],
                value: start,
                onChange: setStart
            });
            startControl.element.appendChild(textEl("p", "lk-help", "lab.cluster.startHint"));
            const speedControl = kit.segmented({
                labelKey: "lab.kit.speed",
                options: [{ value: "watch", labelKey: "lab.kit.speedWatch" }, { value: "fast", labelKey: "lab.kit.speedFast" }],
                value: speed,
                onChange: function (value) {
                    speed = value;
                    nextBeat = Math.min(nextBeat, performance.now() + BEAT[speed]);
                    saveSettings();
                }
            });
            const regionsToggle = kit.toggle({
                labelKey: "lab.cluster.regions", checked: showRegions, hintKey: "lab.cluster.regionsHint",
                onChange: function (on) {
                    showRegions = on;
                    paint();
                    saveSettings();
                }
            });
            const distancesToggle = kit.toggle({
                labelKey: "lab.cluster.distances", checked: showDistances, hintKey: "lab.cluster.distancesHint",
                onChange: function (on) {
                    showDistances = on;
                    paint();
                    saveSettings();
                }
            });
            const iterationStat = kit.stat({ labelKey: "lab.cluster.iteration", value: 0 });
            const inertiaStat = kit.stat({ labelKey: "lab.cluster.inertia", trend: "auto", better: "down" });
            const changedStat = kit.stat({ labelKey: "lab.cluster.changed" });

            const elbowPanel = el("section", "km-elbow");
            const elbowTitle = textEl("h4", "km-title", "lab.cluster.elbowTitle");
            elbowTitle.id = newId();
            elbowPanel.setAttribute("aria-labelledby", elbowTitle.id);
            elbowPanel.appendChild(elbowTitle);
            const chartView = kit.canvas(elbowPanel, { height: 180, labelKey: "lab.cluster.chart" });
            const chart = kit.lineChart(chartView, {
                series: [
                    { values: elbowValues, colorIndex: 1, labelKey: "lab.cluster.bestOf", points: true, fill: true },     // (no gaps: see workOnElbow)
                    { values: runValues, colorIndex: 0, labelKey: "lab.cluster.thisRun", points: true }
                ],
                x0: K_RANGE.min,
                xStep: 1,
                yMin: 0,
                highlightX: k,
                xLabelKey: "lab.cluster.kAxis",
                yLabelKey: "lab.cluster.inertia",
                emptyKey: "lab.cluster.chartEmpty"
            });
            elbowPanel.append(
                kit.legend([
                    { labelKey: "lab.cluster.bestOf", colorIndex: 1, shape: "line" },
                    { labelKey: "lab.cluster.thisRun", colorIndex: 0, shape: "dot" }
                ]).element,
                kit.hint({ tone: "tip", key: "lab.cluster.elbowHint" }).element
            );

            ui.side.append(
                kit.toolbar([playButton, stepButton, resetButton, newStartButton, status]),
                kSlider.element,
                startControl.element,
                speedControl.element,
                regionsToggle.element,
                distancesToggle.element,
                kit.row([iterationStat, inertiaStat, changedStat], { grid: true }),
                elbowPanel
            );

            // Bottom: the idea in real life, "What's happening?" and "Try this"
            const idea = el("p", "km-idea");
            const explain = kit.explain({ steps: [
                { key: "lab.cluster.step1" },
                { key: "lab.cluster.step2" },
                { key: "lab.cluster.step3" },
                { key: "lab.cluster.step4" },
                { key: "lab.cluster.step5" }
            ] });
            const challenges = kit.challenges({ ctx: ctx, items: [
                {
                    key: "lab.cluster.ch1", insightKey: "lab.cluster.ch1Why",
                    check: function (info) { return info.preset === "five" && info.k === 5 && info.done; }
                },
                {
                    key: "lab.cluster.ch2", insightKey: "lab.cluster.ch2Why",
                    check: function (info) { return info.preset === "three" && info.k === 3 && info.done && info.bad; }
                },
                {
                    key: "lab.cluster.ch3", insightKey: "lab.cluster.ch3Why",
                    check: function (info) { return info.preset === "moons" && info.k === 2 && info.done; }
                },
                {
                    key: "lab.cluster.ch4", insightKey: "lab.cluster.ch4Why",
                    check: function (info) { return info.shop && info.done && info.named; }
                }
            ] });
            ui.bottom.append(idea, explain.element, challenges.element);

            // ----- Saving -----
            function saveSettings() {
                ctx.store.set("settings", { v: SAVE_VERSION, k: k, start: start, speed: speed, regions: showRegions, distances: showDistances });
            }

            function saveBoard() {
                ctx.store.set("board", { v: SAVE_VERSION, base: board.base, added: board.added });
            }

            // ----- The points -----
            function buildPoints() {
                const preset = presetOf(board.base);
                points = preset ? makePoints(preset) : [];
                board.added = board.added.slice(0, Math.max(0, MAX_POINTS - points.length));
                board.added.forEach(function (pair) { points.push({ x: pair[0], y: pair[1], truth: -1 }); });
            }

            // The preset this board is exactly (nothing added), or null
            function exactPreset() {
                return board.added.length === 0 ? board.base : null;
            }

            function remember() {
                history.push({ base: board.base, added: board.added.slice() });
                if (history.length > HISTORY) history.shift();
            }

            function loadPreset(id) {
                const preset = presetOf(id);
                if (!preset) return;
                remember();
                board = { base: id, added: [] };
                buildPoints();
                k = preset.k;
                kSlider.set(k);
                names = [];
                newRun(preset.start);
                pointsReplaced();
                saveSettings();
            }

            function clearBoard() {
                if (!points.length) return;
                remember();
                board = { base: null, added: [] };
                points = [];
                names = [];
                newRun(OWN_START);
                pointsReplaced();
                ctx.announce(t("lab.cluster.saidCleared"));
            }

            function addPoint(x, y) {
                if (points.length >= MAX_POINTS) {
                    warning.set("lab.cluster.full", { max: MAX_POINTS });
                    ctx.announce(t("lab.cluster.full", { max: kit.number(MAX_POINTS) }));
                    return false;
                }
                remember();
                const pair = [round3(A.util.clamp(x, 0, 1)), round3(A.util.clamp(y, 0, 1))];
                board.added.push(pair);
                points.push({ x: pair[0], y: pair[1], truth: -1 });
                if (current.labels) current.labels.push(-1);     // it has no group until the next Assign
                pointsEdited("assign");
                return true;
            }

            function undo() {
                const previous = history.pop();
                if (!previous) return;
                // Undoing your last point: the run goes on without it. Anything bigger starts again.
                const lastPoint = previous.base === board.base && previous.added.length === board.added.length - 1;
                board = previous;
                if (lastPoint) {
                    points.pop();
                    if (current.labels) current.labels.pop();
                    pointsEdited("update");
                } else {
                    buildPoints();
                    const preset = presetOf(board.base);
                    names = [];
                    newRun(preset ? preset.start : OWN_START);
                    pointsReplaced();
                }
                ctx.announce(t("lab.cluster.saidUndone", { points: A.plural("lab.cluster.nPoints", points.length) }));
            }

            // A whole new set of points: the run starts again, the elbow chart too
            function pointsReplaced() {
                presetChips.set(board.base);
                saveBoard();
                restartElbow();
                setState("ready");
                render();
            }

            // A point added or taken away: a run that has started goes on. next: "assign" after a
            // new point (it needs a group), "update" after a removed one (the centres move to the
            // middle of what is left). A finished run isn't finished any more.
            function pointsEdited(next) {
                presetChips.set(board.base);
                if (points.length < k) {
                    newRun(current.seed);
                    setState("ready");
                } else if (current.centres.length) {
                    if (current.labels) {
                        current.next = next;
                        current.inertia = inertia(points, current.labels, current.centres);
                    }
                    if (state === "done") setState("paused");
                }
                saveBoard();
                restartElbow();
                render();
            }

            // ----- The run -----
            function newRun(seed) {
                current = { seed: seed, centres: [], labels: null, next: "start", iteration: 0, changed: null, inertia: null };
                glide = null;
                namedOnce = false;
                inertiaStat.set(null, null);
            }

            function canRun() {
                return points.length > 0 && points.length >= k;
            }

            // One half-step of k-means: Start, then Assign and Update in turn
            function halfStep() {
                finishGlide();
                if (current.next === "start") {
                    current.centres = startCentres(points, k, start, kit.rng(current.seed));
                    current.next = "assign";
                } else if (current.next === "assign") {
                    const labels = assign(points, current.centres, current.labels);
                    current.changed = countChanged(current.labels, labels);
                    current.labels = labels;
                    current.iteration += 1;
                    current.inertia = inertia(points, labels, current.centres);
                    current.next = "update";
                    if (current.changed === 0) finish();
                } else {
                    const moved = update(points, current.labels, current.centres);
                    if (A.motion.ok()) glide = { from: current.centres, started: performance.now(), ms: GLIDE[speed] };
                    current.centres = moved;
                    current.inertia = inertia(points, current.labels, moved);
                    current.next = "assign";
                }
            }

            // No point changed group: the run is over
            function finish() {
                setState("done");
                ctx.announce(t("lab.cluster.saidDone", { n: A.format.number(current.iteration), inertia: kit.number(current.inertia) }));
                ctx.track("milestone", { kind: "grouped", preset: exactPreset() || "own", k: k, iterations: current.iteration });
            }

            // What the last half-step did, for screen readers (after Step; Play only says the end)
            function sayStep() {
                if (state === "done") return;
                if (current.next === "assign" && current.labels === null) ctx.announce(t("lab.cluster.saidStart", { centres: A.plural("lab.cluster.nCentres", k) }));
                else if (current.next === "update") ctx.announce(t("lab.cluster.saidAssign", { changed: A.format.number(current.changed) }));
                else ctx.announce(t("lab.cluster.saidUpdate", { inertia: kit.number(current.inertia) }));
            }

            // A disabled button drops the keyboard focus onto the page: hand it on first
            // (Step hands it to Play; Undo and Clear to the board, where points are added)
            function disable(button, on, focusTo) {
                if (on && document.activeElement === button.element) focusTo.focus();
                button.setDisabled(on);
            }

            function setState(next) {
                state = next;
                status.set(next);
                playButton.setLabel(next === "running" ? "lab.kit.pause" : "lab.kit.play");
                playButton.setIcon(next === "running" ? "pause" : "play");
                if (next === "running") {
                    nextBeat = performance.now();
                    wake();
                }
            }

            // ----- What the buttons do -----
            function togglePlay() {
                if (state === "running") {
                    setState("paused");
                    render();
                    return;
                }
                if (!canRun()) return;
                if (state === "done") newRun(current.seed);      // Play after the end: the same run again
                setState("running");
                render();
            }

            function stepOnce() {
                if (!canRun() || state === "done") return;
                setState("paused");
                halfStep();
                sayStep();
                render();
            }

            function resetRun() {
                newRun(current.seed);
                setState("ready");
                render();
            }

            // Other starting centres: a new seed, and the centres appear at once
            function newStart() {
                if (!canRun()) return;
                names = [];
                newRun(kit.newSeed());
                setState("paused");
                halfStep();
                sayStep();
                render();
            }

            function setK(value) {
                if (value === k) return;
                k = value;
                names = [];
                newRun(current.seed);
                chart.set({ highlightX: k });
                setState("ready");
                render();
            }

            function setStart(value) {
                start = value;
                names = [];
                newRun(current.seed);
                setState("ready");
                render();
                saveSettings();
            }

            // ----- The frame loop: it runs only while something moves -----
            // (a run playing, centres gliding, or elbow runs still to do)
            function wake() {
                if (!frame && !hidden) frame = requestAnimationFrame(onFrame);
            }

            function onFrame(now) {
                frame = 0;
                if (state === "running" && now >= nextBeat) {
                    if (canRun()) halfStep();
                    else setState("ready");
                    nextBeat = now + BEAT[speed];
                    render();
                } else if (glide) {
                    paint();
                }
                if (elbowJobs.length) workOnElbow();
                if (state === "running" || glide || elbowJobs.length) wake();
            }

            // Where the centres are drawn: during a glide, part of the way to their new place
            function drawnCentres() {
                if (!glide) return current.centres;
                const progress = (performance.now() - glide.started) / glide.ms;
                if (progress >= 1) {
                    glide = null;
                    return current.centres;
                }
                const eased = A.util.easeOut(progress);
                return current.centres.map(function (centre, i) {
                    return { x: A.util.lerp(glide.from[i].x, centre.x, eased), y: A.util.lerp(glide.from[i].y, centre.y, eased) };
                });
            }

            function finishGlide() {
                glide = null;
            }

            // ----- The elbow chart: 40 small runs, a few per frame -----
            function restartElbow() {
                elbowValues.length = 0;
                elbowJobs = [];
                for (let size = K_RANGE.min; size <= K_RANGE.max; size++) {
                    if (size > points.length) break;        // more centres than points: no run
                    for (let attempt = 0; attempt < ELBOW_RUNS; attempt++) elbowJobs.push({ k: size, attempt: attempt });
                }
                wake();
            }

            function workOnElbow() {
                const started = performance.now();
                do {
                    const job = elbowJobs.shift();
                    const result = run(points, job.k, "plusplus", kit.rng(elbowSeed(job.k, job.attempt)));
                    // The jobs go k by k, so a new k adds one value at the end of the line, which
                    // has no gaps (the kit's light wash under a line needs that)
                    const at = job.k - K_RANGE.min;
                    if (at >= elbowValues.length || result.inertia < elbowValues[at]) elbowValues[at] = result.inertia;
                } while (elbowJobs.length && performance.now() - started < ELBOW_BUDGET);
                chart.draw();
                if (!elbowJobs.length) checkChallenges();
            }

            // ----- The board: clicks, taps and the keyboard -----
            scene.canvas.addEventListener("click", function (event) {
                if (!scene.width) return;
                const box = scene.canvas.getBoundingClientRect();
                const square = squareOf(scene, presetAxes());
                const spot = fromScreen(square, event.clientX - box.left, event.clientY - box.top);
                if (!isUnit(spot.x) || !isUnit(spot.y)) return;      // a click beside the square
                cursor.shown = false;
                if (addPoint(spot.x, spot.y)) warning.hide();
            });

            const MOVES = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
            scene.canvas.addEventListener("keydown", function (event) {
                if (event.altKey || event.ctrlKey || event.metaKey) return;
                const move = MOVES[event.key];
                if (move) {
                    event.preventDefault();
                    const jump = (event.shiftKey ? BOARD.keyJump : 1) / BOARD.keySteps;
                    cursor.x = round3(A.util.clamp(cursor.x + move[0] * jump, 0, 1));
                    cursor.y = round3(A.util.clamp(cursor.y + move[1] * jump, 0, 1));
                    cursor.shown = true;
                    ctx.announce(t("lab.cluster.saidCursor", { place: placeText(cursor) }));
                    paint();
                } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (event.repeat) return;
                    cursor.shown = true;
                    if (addPoint(cursor.x, cursor.y)) {
                        ctx.announce(t("lab.cluster.saidAdded", { place: placeText(cursor), points: A.plural("lab.cluster.nPoints", points.length) }));
                    }
                }
            });

            scene.canvas.addEventListener("focus", function () {
                if (!scene.canvas.matches(":focus-visible")) return;
                cursor.shown = true;
                paint();
            });

            scene.canvas.addEventListener("blur", function () {
                cursor.shown = false;
                paint();
            });

            scene.onResize(paint);

            // ----- Shop customers: a name for every group -----
            function presetAxes() {
                const preset = presetOf(board.base);
                return preset && preset.axes ? preset.axes : null;
            }

            // "12 visits and $250 a month" (Shop customers) or "40% across, 70% up"
            function placeText(point) {
                const axes = presetAxes();
                if (axes) {
                    return t("lab.cluster.shopPlace", {
                        visits: A.plural("lab.cluster.nVisits", Math.round(point.x * axes.visits)),
                        money: t("lab.cluster.money", { n: A.format.number(Math.round((point.y * axes.money) / MONEY_ROUND) * MONEY_ROUND) })
                    });
                }
                return t("lab.cluster.place", { x: A.format.percent(point.x), y: A.format.percent(point.y) });
            }

            function groupSizes() {
                const sizes = current.centres.map(function () { return 0; });
                (current.labels || []).forEach(function (group) {
                    if (group >= 0 && group < sizes.length) sizes[group] += 1;
                });
                return sizes;
            }

            function showNames() {
                return Boolean(presetAxes()) && state === "done";
            }

            // One text box per group, made again when k changes
            function buildNameFields() {
                namesList.textContent = "";
                nameFields = [];
                for (let group = 0; group < k; group++) {
                    const label = el("label", "km-name-label");
                    const title = el("span", "km-name-title");
                    const details = el("span", "km-name-details");
                    const words = el("span", "km-name-words");
                    words.append(title, details);
                    label.append(swatch(group), words);
                    const field = textField(label, NAME_LENGTH, nameTyped.bind(null, group));
                    namesList.appendChild(field.element);
                    nameFields.push({ input: field.input, title: title, details: details });
                }
            }

            function nameTyped(group, value) {
                names[group] = value.slice(0, NAME_LENGTH);
                paint();
                checkChallenges();
                if (!namedOnce && allNamed()) {
                    namedOnce = true;
                    ctx.track("milestone", { kind: "named", groups: k });
                }
            }

            function allNamed() {
                for (let group = 0; group < k; group++) {
                    if (!names[group] || !names[group].trim()) return false;
                }
                return true;
            }

            function renderNames() {
                namesPanel.hidden = !showNames();
                if (namesPanel.hidden) return;
                if (nameFields.length !== k) buildNameFields();
                const axes = presetAxes();
                const sizes = groupSizes();
                nameFields.forEach(function (field, group) {
                    const centre = current.centres[group];
                    setText(field.title, t("lab.cluster.groupName", { n: group + 1 }));
                    setText(field.details, t("lab.cluster.groupDetails", {
                        customers: A.plural("lab.cluster.nCustomers", sizes[group]),
                        place: placeText(centre)
                    }));
                    field.input.setAttribute("placeholder", t("lab.cluster.namePlaceholder"));
                    if (field.input.value !== (names[group] || "")) field.input.value = names[group] || "";
                    if (!axes) field.input.value = "";
                });
            }

            // The idea in real life, with its glossary links (again after a language change)
            function writeIdea() {
                sentence(idea, "lab.cluster.realWorld", {
                    recommendation: function () { return kit.termLink("recommendation", "lab.cluster.termRecommendation"); },
                    data: function () { return kit.termLink("data", "lab.cluster.termData"); },
                    unsupervised: function () { return kit.termLink("unsupervised", "lab.cluster.termUnsupervised"); }
                });
            }

            // ----- Everything on screen follows the state -----
            // The board alone (every frame of a glide)
            function paint() {
                drawBoard(scene, {
                    points: points,
                    labels: current.labels,
                    centres: drawnCentres(),
                    regions: showRegions,
                    distances: showDistances,
                    glow: A.motion.ok(),
                    axes: presetAxes(),
                    names: showNames() ? names : null,
                    cursor: cursor.shown ? cursor : null,
                    emptyText: t("lab.cluster.emptyBoard"),
                    picture: picture
                });
            }

            // Which step of "What's happening?" is lit
            function explainStep() {
                if (state === "done") return 4;
                if (current.next === "start") return 0;
                if (current.labels === null) return 1;
                return current.next === "update" ? 2 : 3;
            }

            function phaseText() {
                if (state === "done") return t("lab.cluster.phaseDone");
                if (current.next === "start") return t("lab.cluster.phaseReady");
                if (current.labels === null) return t("lab.cluster.phaseStart");
                return t(current.next === "update" ? "lab.cluster.phaseAssign" : "lab.cluster.phaseUpdate", { n: A.format.number(current.iteration) });
            }

            // The lesson of a finished run on a preset (null: nothing special to say). Each preset
            // has its lesson at the k it was made for (lessonK); dev/tests/cluster.math.js checks them.
            function lessonKey() {
                const preset = presetOf(exactPreset());
                if (!preset || state !== "done") return null;
                if (k !== preset.lessonK) return "lab.cluster.lesson.otherK";
                if (isBad() && ROUND_PRESETS.indexOf(preset.id) !== -1) return "lab.cluster.lesson.bad";
                return "lab.cluster.lesson." + preset.id;
            }

            // A bad result: a finished inertia well above the best one the elbow chart knows
            function isBad() {
                const best = elbowValues[k - K_RANGE.min];
                return !elbowJobs.length && best > 0 && current.inertia > BAD_RESULT * best;
            }

            function describeBoard() {
                if (!points.length) return t("lab.cluster.describeEmpty");
                const total = A.plural("lab.cluster.nPoints", points.length);
                if (!current.labels) return t("lab.cluster.describeNoGroups", { points: total });
                const sizes = groupSizes();
                const axes = presetAxes();
                const parts = [t("lab.cluster.describeGroups", { points: total, groups: A.plural("lab.cluster.inGroups", k) })];
                current.centres.forEach(function (centre, group) {
                    const name = axes && names[group] && names[group].trim() ? " " + t("lab.cluster.quoted", { name: names[group].trim() }) : "";
                    parts.push(t("lab.cluster.describeGroup", {
                        n: group + 1,
                        name: name,
                        points: A.plural(axes ? "lab.cluster.nCustomers" : "lab.cluster.nPoints", sizes[group]),
                        place: placeText(centre)
                    }));
                });
                return parts.join(" ");
            }

            function checkChallenges() {
                challenges.check({
                    preset: exactPreset(),
                    shop: Boolean(presetAxes()),
                    k: k,
                    done: state === "done",
                    bad: state === "done" && isBad(),
                    named: allNamed()
                });
            }

            function render() {
                const enough = canRun();
                const preset = presetOf(board.base);

                disable(playButton, !enough, scene.canvas);
                disable(stepButton, !enough || state === "done", enough ? playButton.element : scene.canvas);
                disable(newStartButton, !enough, scene.canvas);
                disable(undoButton, !history.length, scene.canvas);
                disable(clearButton, !points.length, scene.canvas);

                // The texts around the board
                if (!preset) setText(caption, t("lab.cluster.about.own"));
                else if (board.added.length) setText(caption, t("lab.cluster.about.edited", { preset: t("lab.cluster.preset." + preset.id), points: A.plural("lab.cluster.nPoints", board.added.length) }));
                else setText(caption, t("lab.cluster.about." + preset.id));
                setText(phase, phaseText());
                phase.setAttribute("data-phase", state === "done" ? "done" : current.next === "start" ? "ready" : current.labels === null ? "start" : current.next === "update" ? "assign" : "update");
                setText(count, A.plural("lab.cluster.nPoints", points.length));
                scene.canvas.setAttribute("aria-roledescription", t("lab.cluster.boardRole"));
                if (!points.length) warning.set("lab.cluster.empty");
                else if (!enough) warning.set("lab.cluster.tooFew", { k: k });
                else if (points.length < MAX_POINTS) warning.hide();
                const lessonText = lessonKey();
                if (lessonText) lesson.set(lessonText, { k: k });
                else lesson.hide();

                // The numbers
                iterationStat.set(current.iteration);
                inertiaStat.set(current.inertia);
                changedStat.set(current.changed);
                runValues.length = 0;      // (an empty board: no values at all, so the chart says "No points yet")
                if (points.length) {
                    for (let size = K_RANGE.min; size <= K_RANGE.max; size++) runValues.push(size === k ? current.inertia : null);
                }
                chart.draw();

                // "What's happening?"
                explain.setValues(0, { points: A.plural("lab.cluster.nPointsSees", points.length) });
                explain.setValues(1, { centres: A.plural("lab.cluster.nCentres", k) });
                explain.setValues(2, { changed: current.changed === null ? "—" : current.changed });
                explain.setValues(3, { inertia: current.inertia === null ? "—" : current.inertia });
                explain.setStep(explainStep());
                if (state === "done") explain.setText("lab.cluster.doneNote", { n: current.iteration });
                else explain.setText(null);

                renderNames();
                paint();
                scene.describe(describeBoard());
                checkChallenges();
            }

            // ----- Start -----
            buildPoints();
            newRun(presetOf(board.base) ? presetOf(board.base).start : OWN_START);
            if (!saved) {
                const preset = presetOf(board.base);
                if (preset) k = preset.k;
            }
            kSlider.set(k);
            chart.set({ highlightX: k });
            restartElbow();
            setState("ready");
            writeIdea();
            render();

            // ----- The controller: the hub calls these -----
            return {
                pause: function () {
                    hidden = true;
                    finishGlide();
                    if (frame) cancelAnimationFrame(frame);
                    frame = 0;
                },
                resume: function () {
                    hidden = false;
                    if (state === "running") nextBeat = performance.now() + BEAT[speed];
                    paint();
                    if (state === "running" || elbowJobs.length) wake();
                },
                language: function () {
                    kit.relabel(stage);
                    writeIdea();
                    render();
                },
                theme: function () {
                    kit.colors.invalidate();
                    render();
                },
                motion: function () {
                    if (!A.motion.ok()) finishGlide();
                    paint();
                },
                destroy: function () {
                    if (frame) cancelAnimationFrame(frame);
                    frame = 0;
                    hidden = true;
                    scene.destroy();
                    chartView.destroy();
                }
            };
        }
    });
})();
