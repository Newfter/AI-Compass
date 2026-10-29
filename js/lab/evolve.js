/* =========================================================
   AI COMPASS — LAB: EVOLUTION GARAGE (neuroevolution)
   Nobody programs how to drive. Many cars, each with a tiny random
   brain (a neural network of 74 numbers), try a race track. The ones
   that get furthest become the parents of the next generation, with
   small random changes. After a few generations good driving appears
   by itself. This is a genetic algorithm; evolving the numbers of a
   neural network this way is called neuroevolution.
   Its tests: dev/tests/evolve.math.js (the maths, in Node) and
   dev/tests/evolve.test.js (the page).

   Sections:
    1. Settings
    2. Small helpers
    3. The track: smoothing, walls, gates, the wall grid, checks
    4. The car: sensors, brain, physics, fitness
    5. Evolution: the next generation
    6. Drawing: the track, the cars, the brain
    7. The experiment: the page and the life of a run
    8. A.lab.define
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
    // ----- The world -----
    const WORLD = { width: 1000, height: 640 };   // world units: the canvas scales this box to fit
    const TRACK_POINTS = 200;            // the centre line is smoothed into this many evenly spaced points
    const GATES = 40;                    // gates across the road per lap (one every 5 points); gate 0 is the start line
    const CURVE_STEPS = 24;              // Catmull-Rom: points worked out between two control points, before evening out
    const GRID_CELL = 50;                // world units: the side of one cell of the wall grid (a speed trick)

    // ----- The car: a simple physics model, worked out once per tick -----
    //   speed   += throttle × accel × dt − drag × speed × dt      (kept between 0 and maxSpeed)
    //   heading += steer × turnRate × dt × (speed / maxSpeed)     (a car that stands still can't spin)
    //   position += speed × dt × (cos heading, sin heading)
    // One rule more than that: tyres can only push sideways so hard. The sideways
    // acceleration of a turning car is speed × turning speed, and it can't go over "grip".
    // So a fast car turns in a wider circle than a slow one, as real cars do: a tight
    // curve needs braking first.
    const TICK = 1 / 60;                 // seconds of simulated time in one tick (dt)
    const CAR = {
        radius: 7,                       // world units: the car is a circle this big when it meets a wall
        maxSpeed: 260,                   // world units per second
        accel: 220,                      // full gas (+1) adds this much speed per second; full brake (−1) takes it away
        drag: 0.5,                       // air and tyres: the speed shrinks by drag × speed per second
        turnRate: 2.6,                   // radians per second, at full steer and full speed
        grip: 250                        // the most sideways acceleration the tyres give (world units per second²)
    };
    const RAY_ANGLES = [-60, -30, 0, 30, 60];   // degrees: the 5 sensors, from the left of the heading to the right
    const RAY_LENGTH = 170;              // world units: a sensor sees this far; 1 means "no wall in range"

    // ----- The brain: 6 inputs, 8 hidden neurons, 2 outputs -----
    const INPUTS = 6;                    // the 5 sensors and the speed (speed / maxSpeed)
    const HIDDEN = 8;                    // hidden neurons (tanh)
    const OUTPUTS = 2;                   // steering (−1 left … +1 right) and throttle (−1 brake … +1 gas)
    const HIDDEN_NUMBERS = (INPUTS + 1) * HIDDEN;                 // 56: each hidden neuron has 6 weights and a bias
    const BRAIN_SIZE = HIDDEN_NUMBERS + (HIDDEN + 1) * OUTPUTS;   // 74 = 56 + 18: each output has 8 weights and a bias
    const START_WEIGHT = 1;              // generation 1: every number is random, between −1 and +1

    // ----- A race: one generation -----
    const STALL_SECONDS = 5;             // a car that passes no new gate for this long stops
    const LAPS_TO_WIN = 2;               // a car that drives 2 laps has finished
    const MAX_SECONDS = 40;              // a generation ends after this much simulated time at most
    const MAX_TICKS = Math.round(MAX_SECONDS / TICK);
    const BACK_MARGIN = 10;              // world units: a car this far behind its last gate drives the wrong way: it stops

    // ----- Evolution -----
    const ELITE = 2;                     // the best 2 cars are copied unchanged, so the best result never gets worse
    const TOURNAMENT = 3;                // a parent is the fittest of 3 cars picked at random
    const POPULATIONS = [20, 40, 80];    // the population sizes to choose from...
    const POPULATION = 40;               // ...and the first one
    const RATE = { min: 0, max: 0.5, step: 0.01, value: 0.1 };      // mutation rate: the share of the numbers that change
    const SIZE = { min: 0.05, max: 1, step: 0.05, value: 0.3 };     // mutation size: the standard deviation of a change

    // ----- Drawing your own track -----
    const DRAW = {
        width: 90,                       // world units: the road you draw is this wide
        spacing: 8,                      // the drawing is evened out to one point every 8 world units...
        smooth: 4,                       // ...each point is averaged with 4 neighbours on each side...
        passes: 2,                       // ...twice (this takes the wobble of a hand out)...
        controls: 40,                    // ...and 40 evenly spaced points of it are kept, like a preset's
        minPoints: 12,                   // a drawing with fewer points is a tap, not a loop
        minLength: 1400,                 // world units: a shorter loop is too small to race on
        minRadius: 65,                   // world units: a curve of the centre line tighter than this is too tight (see below)
        border: 6                        // world units kept free between a wall and the edge of the world
    };
    // Why 65: at full steer a car turns in a circle of radius maxSpeed / turnRate = 100 (its
    // middle), at any speed (and in a wider one when it is fast). On a road 90 wide it can
    // swing out by 45 − 7 = 38 from the centre line, so the centre line may bend no tighter
    // than 100 − 38 = 62. We keep a little room more.

    // ----- Your own track -----
    const MY_SEED = 1;                   // the random numbers of the cars on your own track
    const SAVE_VERSION = 1;              // ctx.store "track" = { v: 1, points: [[x, y], ...], width }
    const SAVED_POINTS = { min: 12, max: 400 };     // a track has this many control points (a drawing has DRAW.controls)
    const TRACK_WIDTH = { min: 60, max: 160 };      // world units: the widths a track may have
    const STROKE_STEP = 4;               // world units: a pointer move shorter than this adds no point to a drawing
    // What the hint says when a drawing can't be a track (the answers of checkTrack, and a tap)
    const PROBLEMS = {
        tap: "lab.evolve.drawTap",
        short: "lab.evolve.drawShort",
        outside: "lab.evolve.drawOutside",
        tight: "lab.evolve.drawTight",
        cross: "lab.evolve.drawCross"
    };

    // ----- Running -----
    const SPEEDS = { watch: 60, fast: 240, turbo: Infinity };   // ticks per second: real time, 4 per frame, as many as fit
    const LOOP_BUDGET = 6;               // ms of ticks per frame at most, so that a frame with its drawing stays in the lab's 8 ms
    const REST_TICKS = 40;               // Watch: a finished race stays on screen for 40 ticks (2/3 s) before the next one
    const PAINT_MS = { watch: 100, fast: 100, turbo: 200 };   // while running, the numbers are written at most this often...
    const CHART_MS = 250;                // ...the chart is drawn at most this often...
    const BRAIN_MS = 1000 / 15;          // ...and the brain diagram at most 15 times a second

    // ----- "Try this" -----
    const STUCK_GENERATIONS = 5;         // 2: generations made with mutation rate 0 and no crossover in a row
                                         //    (every child an exact copy), with no better best car
    const FALLS = 3;                     // 3: generations in a row made with the biggest mutation size whose average
                                         //    fitness is below the last one made with a smaller size

    // ----- Drawing -----
    const ASPHALT = { dark: 0.07, light: 0.08 };    // the road: the text colour, this see-through
    const GATE_ALPHA = 0.1;              // the gates: faint lines across the road
    const START_SQUARES = 8;             // the start line: two rows of 8 squares across the road
    const WALL_WIDTH = 1.6;              // px
    const WALL_GLOW = 9;                 // px of glow around the walls (none in calm mode)
    const ARROW = [[0.55, 0], [-0.45, 0.42], [-0.2, 0], [-0.45, -0.42]];   // a car's arrow: its corners, nose first, in car lengths
    const CAR_SIZE = { world: 14, min: 8 };        // a car is 14 world units long (its circle), but never shorter than 8 px
    const LEADER_SCALE = 1.5;            // the leader is drawn this much bigger
    const RANK_COLORS = { low: 0.25 };   // the last car gets kit.scale(0.25), the first one kit.scale(1)
    const HUD_PAD = 6;                   // px: the generation and the time, in the top left corner...
    const PILL = { x: 8, y: 11, alpha: 0.85 };     // ...on a pill (px around the text), like "Draw here"
    const DRAW_FADE = 0.3;               // draw mode: the old track shows this faintly
    const RAY_LABELS = ["←60°", "←30°", "0°", "30°→", "60°→"];   // the sensors in the brain diagram, left to right
    const CHART_HEIGHT = 200;            // px
    const BRAIN = {
        height: 210,                     // px: the diagram's canvas
        left: 64,                        // px kept for the input labels (at least)...
        right: 92,                       // ...and for the outputs' names and values
        gap: 6,                          // px between a label and its neuron...
        edge: 6,                         // ...and between a label and the canvas's edge
        pad: 14,                         // px above the first neuron and below the last one
        radius: 7,                       // px: a neuron
        bigWeight: 2                     // a weight this big (or bigger) gets the thickest, strongest line
    };

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    function clamp(value, min, max) {
        return value < min ? min : value > max ? max : value;
    }

    // The square of the distance from point (px, py) to the segment from (ax, ay) to (bx, by)
    function distanceToSegment2(px, py, ax, ay, bx, by) {
        const dx = bx - ax;
        const dy = by - ay;
        const length2 = dx * dx + dy * dy;
        // where the nearest point is along the segment: 0 at a, 1 at b
        const along = length2 > 0 ? clamp(((px - ax) * dx + (py - ay) * dy) / length2, 0, 1) : 0;
        const x = ax + along * dx - px;
        const y = ay + along * dy - py;
        return x * x + y * y;
    }

    // Do the segments a-b and c-d cross? (Touching at an end counts too.)
    function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
        const side1 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);    // which side of a-b is c...
        const side2 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);    // ...and d
        const side3 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);    // which side of c-d is a...
        const side4 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);    // ...and b
        return side1 * side2 <= 0 && side3 * side4 <= 0 && !(side1 === 0 && side2 === 0);
    }

    // TODO(kit): kit.disclosure(titleKey) -> { element, body }: a panel that opens and closes,
    // like the "What's happening?" panel but holding anything (here: the brain diagram). It is
    // a native <details>, so a click, Enter or Space opens it, and screen readers know it.
    function disclosure(titleKey) {
        const element = document.createElement("details");
        element.className = "ev-panel";
        element.open = true;
        const summary = document.createElement("summary");
        summary.className = "ev-panel-summary";
        const title = document.createElement("span");
        title.className = "ev-panel-title";
        title.setAttribute("data-i18n", titleKey);
        title.textContent = t(titleKey);
        const chevron = document.createElement("span");
        chevron.className = "ev-panel-chevron";
        chevron.setAttribute("aria-hidden", "true");
        chevron.innerHTML = kit.icons.chevron;
        summary.append(title, chevron);
        const body = document.createElement("div");
        body.className = "ev-panel-body";
        element.append(summary, body);
        return { element: element, body: body };
    }

    // TODO(kit): kit.sentence(element, text, links): a sentence with glossary links inside it,
    // where each language puts them in its own place ("... is called a {gaLink}."). termLink()
    // makes one link; this writes the words around it. links: { name: a function that makes
    // the link }. Call it again after a language change.
    function fillSentence(element, text, links) {
        element.textContent = "";
        text.split(/(\{\w+\})/).forEach(function (piece) {
            const name = piece.charAt(0) === "{" ? piece.slice(1, -1) : null;
            if (name && links[name]) element.appendChild(links[name]());
            else if (piece) element.appendChild(document.createTextNode(piece));
        });
    }

    /* =========================================================
       3. THE TRACK
       A track is a closed loop: a few control points of its centre line
       (js/content/lab/evolve.js) and a width. buildTrack() smooths the
       points into TRACK_POINTS evenly spaced ones, moves them half the
       width to each side for the two walls, and puts GATES gates across
       the road at even spacing.
       ========================================================= */
    // One coordinate of a Catmull-Rom curve between p1 (t = 0) and p2 (t = 1); p0 and p3 are
    // the points before and after. We use Catmull-Rom (not Chaikin's corner cutting) because
    // it goes through every control point: you design a track by putting points where the
    // road should go, and the curve between them has no corners.
    function catmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (3 * p1 - p0 - 3 * p2 + p3) * t3);
    }

    // count points spread evenly along a closed line through points ([[x, y], ...]),
    // starting at the first one
    function evenLoop(points, count) {
        const n = points.length;
        const lengths = [];
        let total = 0;
        for (let i = 0; i < n; i++) {
            const a = points[i];
            const b = points[(i + 1) % n];
            lengths.push(Math.hypot(b[0] - a[0], b[1] - a[1]));
            total += lengths[i];
        }
        const out = [];
        let edge = 0;              // the piece of the line we are on (from point edge to the next)...
        let edgeStart = 0;         // ...and how far along the loop it starts
        for (let k = 0; k < count; k++) {
            const wanted = (k * total) / count;
            while (edge < n - 1 && edgeStart + lengths[edge] < wanted) {
                edgeStart += lengths[edge];
                edge += 1;
            }
            const a = points[edge];
            const b = points[(edge + 1) % n];
            const share = lengths[edge] > 0 ? (wanted - edgeStart) / lengths[edge] : 0;
            out.push([a[0] + (b[0] - a[0]) * share, a[1] + (b[1] - a[1]) * share]);
        }
        return out;
    }

    // The smooth closed centre line through the control points, as count even points
    function smoothLoop(controls, count) {
        const n = controls.length;
        const dense = [];
        for (let i = 0; i < n; i++) {
            const p0 = controls[(i - 1 + n) % n];
            const p1 = controls[i];
            const p2 = controls[(i + 1) % n];
            const p3 = controls[(i + 2) % n];
            for (let step = 0; step < CURVE_STEPS; step++) {
                const at = step / CURVE_STEPS;
                dense.push([catmullRom(p0[0], p1[0], p2[0], p3[0], at), catmullRom(p0[1], p1[1], p2[1], p3[1], at)]);
            }
        }
        return evenLoop(dense, count);
    }

    // ----- The wall grid: a speed trick, not part of the AI -----
    // Every car asks 5 times per tick "where is the nearest wall in this direction?", and a
    // track has 400 wall segments. Testing them all would be slow with 80 cars. So the world
    // is cut into square cells once per track, and each cell lists the segments that pass
    // through it. A ray then tests only the segments in the cells under its bounding box.
    // segments: [[ax, ay, bx, by], ...]
    function buildGrid(segments, cellSize) {
        const size = cellSize || GRID_CELL;
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        segments.forEach(function (s) {
            minX = Math.min(minX, s[0], s[2]);
            minY = Math.min(minY, s[1], s[3]);
            maxX = Math.max(maxX, s[0], s[2]);
            maxY = Math.max(maxY, s[1], s[3]);
        });
        const grid = {
            size: size,
            x0: minX,
            y0: minY,
            columns: Math.floor((maxX - minX) / size) + 1,
            rows: Math.floor((maxY - minY) / size) + 1,
            cells: [],
            ax: new Float64Array(segments.length),
            ay: new Float64Array(segments.length),
            bx: new Float64Array(segments.length),
            by: new Float64Array(segments.length)
        };
        for (let c = 0; c < grid.columns * grid.rows; c++) grid.cells.push([]);
        segments.forEach(function (s, index) {
            grid.ax[index] = s[0];
            grid.ay[index] = s[1];
            grid.bx[index] = s[2];
            grid.by[index] = s[3];
            const c0 = cellColumn(grid, Math.min(s[0], s[2]));
            const c1 = cellColumn(grid, Math.max(s[0], s[2]));
            const r0 = cellRow(grid, Math.min(s[1], s[3]));
            const r1 = cellRow(grid, Math.max(s[1], s[3]));
            for (let row = r0; row <= r1; row++) {
                for (let column = c0; column <= c1; column++) grid.cells[row * grid.columns + column].push(index);
            }
        });
        return grid;
    }

    // The column and the row of the cell at x or y (a place outside the grid gets the nearest edge cell)
    function cellColumn(grid, x) {
        return clamp(Math.floor((x - grid.x0) / grid.size), 0, grid.columns - 1);
    }

    function cellRow(grid, y) {
        return clamp(Math.floor((y - grid.y0) / grid.size), 0, grid.rows - 1);
    }

    // The distance from (x, y) along the direction "angle" (radians) to the nearest wall,
    // or "length" when no wall is that close. The ray is x + d·cos, y + d·sin for d from 0
    // to length; a wall segment is a + u·(b − a) for u from 0 to 1. Where they meet, both
    // equations give the same point: the two cross products below solve for d and u.
    function castRay(grid, x, y, angle, length) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const endX = x + dx * length;
        const endY = y + dy * length;
        const c0 = cellColumn(grid, Math.min(x, endX));
        const c1 = cellColumn(grid, Math.max(x, endX));
        const r0 = cellRow(grid, Math.min(y, endY));
        const r1 = cellRow(grid, Math.max(y, endY));
        let nearest = length;
        for (let row = r0; row <= r1; row++) {
            for (let column = c0; column <= c1; column++) {
                const cell = grid.cells[row * grid.columns + column];
                for (let k = 0; k < cell.length; k++) {
                    const s = cell[k];
                    const ex = grid.bx[s] - grid.ax[s];
                    const ey = grid.by[s] - grid.ay[s];
                    const cross = dx * ey - dy * ex;
                    if (cross === 0) continue;                   // parallel: they never meet
                    const wx = grid.ax[s] - x;
                    const wy = grid.ay[s] - y;
                    const d = (wx * ey - wy * ex) / cross;       // how far along the ray
                    const u = (wx * dy - wy * dx) / cross;       // where on the wall segment (0 … 1)
                    if (d >= 0 && d < nearest && u >= 0 && u <= 1) nearest = d;
                }
            }
        }
        return nearest;
    }

    // Is a wall segment closer than radius to (x, y)? (Only the cells around the point are tested.)
    function touchesWall(grid, x, y, radius) {
        const c0 = cellColumn(grid, x - radius);
        const c1 = cellColumn(grid, x + radius);
        const r0 = cellRow(grid, y - radius);
        const r1 = cellRow(grid, y + radius);
        for (let row = r0; row <= r1; row++) {
            for (let column = c0; column <= c1; column++) {
                const cell = grid.cells[row * grid.columns + column];
                for (let k = 0; k < cell.length; k++) {
                    const s = cell[k];
                    if (distanceToSegment2(x, y, grid.ax[s], grid.ay[s], grid.bx[s], grid.by[s]) < radius * radius) return true;
                }
            }
        }
        return false;
    }

    // ----- The track -----
    // controls: the control points of the centre line, [[x, y], ...] in world units, in the
    // driving direction. The start line is at the first one. Returns everything the cars and
    // the drawing need:
    //   centre[i] = { x, y, dx, dy, length, at }   a point of the centre line; (dx, dy) and
    //                     length go to the next point; "at" is how far along the loop it is
    //   left[i], right[i] = { x, y }   the walls, half the width to each side
    //   gates[k] = { a, b }            gate k: the line across the road from left to right
    //   length, gap (between two gates), width, start = { x, y, heading }, grid
    function buildTrack(controls, width) {
        const points = smoothLoop(controls, TRACK_POINTS);
        const n = points.length;
        const track = { width: width, centre: [], left: [], right: [], gates: [], length: 0, gap: 0, start: null, grid: null };

        points.forEach(function (p, i) {
            const next = points[(i + 1) % n];
            const dx = next[0] - p[0];
            const dy = next[1] - p[1];
            const length = Math.hypot(dx, dy);
            track.centre.push({ x: p[0], y: p[1], dx: dx, dy: dy, length: length, at: track.length });
            track.length += length;
        });
        track.gap = track.length / GATES;

        // The walls: each point moves half the width along its "normal" (the direction at a
        // right angle to the road). A point's normal is the average of the normals of the two
        // pieces of road that meet there, so the wall bends where the road bends.
        track.centre.forEach(function (p, i) {
            const before = track.centre[(i - 1 + n) % n];
            let nx = -before.dy / before.length - p.dy / p.length;
            let ny = before.dx / before.length + p.dx / p.length;
            const size = Math.hypot(nx, ny) || 1;
            nx /= size;
            ny /= size;
            // (nx, ny) points to the right of the driving direction (y grows downwards)
            track.right.push({ x: p.x + nx * width / 2, y: p.y + ny * width / 2 });
            track.left.push({ x: p.x - nx * width / 2, y: p.y - ny * width / 2 });
        });

        for (let k = 0; k < GATES; k++) {
            const i = (k * n) / GATES;
            track.gates.push({ a: track.left[i], b: track.right[i] });
        }
        track.start = { x: track.centre[0].x, y: track.centre[0].y, heading: Math.atan2(track.centre[0].dy, track.centre[0].dx) };
        track.grid = buildGrid(wallSegments(track));
        return track;
    }

    // Both walls as segments [[ax, ay, bx, by], ...]: the left wall first, then the right one
    function wallSegments(track) {
        const n = track.centre.length;
        const segments = [];
        [track.left, track.right].forEach(function (wall) {
            for (let i = 0; i < n; i++) {
                const a = wall[i];
                const b = wall[(i + 1) % n];
                segments.push([a.x, a.y, b.x, b.y]);
            }
        });
        return segments;
    }

    // Is this track one the cars can race on? null when it is, or what is wrong:
    //   "short"    shorter than DRAW.minLength
    //   "outside"  a wall comes closer than DRAW.border to the edge of the world
    //   "tight"    a curve of the centre line is tighter than DRAW.minRadius
    //   "cross"    a wall crosses itself or the other wall
    function checkTrack(track) {
        const n = track.centre.length;
        if (track.length < DRAW.minLength) return "short";
        const walls = track.left.concat(track.right);
        const edge = DRAW.border;
        if (walls.some(function (p) { return p.x < edge || p.y < edge || p.x > WORLD.width - edge || p.y > WORLD.height - edge; })) return "outside";

        // How tight is the curve at each point: the radius of the circle through the
        // points two steps before and after it (a straight road has an endless radius)
        for (let i = 0; i < n; i++) {
            const a = track.centre[(i - 2 + n) % n];
            const b = track.centre[i];
            const c = track.centre[(i + 2) % n];
            const area2 = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));    // twice the triangle's area
            const sides = Math.hypot(b.x - a.x, b.y - a.y) * Math.hypot(c.x - b.x, c.y - b.y) * Math.hypot(c.x - a.x, c.y - a.y);
            if (area2 > 0 && sides / (2 * area2) < DRAW.minRadius) return "tight";
        }

        // Every wall segment against every other one, except its own neighbours (they share an end)
        const segments = wallSegments(track);
        for (let i = 0; i < segments.length; i++) {
            for (let j = i + 1; j < segments.length; j++) {
                const sameWall = (i < n) === (j < n);
                const gap = Math.abs(i - j);
                if (sameWall && (gap <= 1 || gap === n - 1)) continue;
                const s = segments[i];
                const r = segments[j];
                if (segmentsCross(s[0], s[1], s[2], s[3], r[0], r[1], r[2], r[3])) return "cross";
            }
        }
        return null;
    }

    // Can these be a track's control points and width? (The content file's tracks, and a
    // saved drawing, which can be old, broken or edited by hand.)
    function isTrackData(points, width) {
        return Array.isArray(points) && points.length >= SAVED_POINTS.min && points.length <= SAVED_POINTS.max &&
            points.every(function (p) {
                return Array.isArray(p) && p.length === 2 && isCoordinate(p[0], WORLD.width) && isCoordinate(p[1], WORLD.height);
            }) &&
            typeof width === "number" && width >= TRACK_WIDTH.min && width <= TRACK_WIDTH.max;
    }

    function isCoordinate(value, max) {
        return typeof value === "number" && value >= 0 && value <= max;
    }

    // A saved drawing ({ v: 1, points, width }) that still makes a good track
    function isSavedTrack(value) {
        return Boolean(value) && value.v === SAVE_VERSION && value.width === DRAW.width &&
            isTrackData(value.points, value.width) && checkTrack(buildTrack(value.points, value.width)) === null;
    }

    // A drawing ([[x, y], ...] in world units, in the order it was drawn) as control points
    // of a track: evened out, smoothed, closed, evened out again to DRAW.controls points,
    // rounded to whole world units. null when it is only a tap.
    function drawingToControls(drawing) {
        if (drawing.length < DRAW.minPoints) return null;
        let length = 0;
        for (let i = 1; i < drawing.length; i++) length += Math.hypot(drawing[i][0] - drawing[i - 1][0], drawing[i][1] - drawing[i - 1][1]);
        if (length < DRAW.spacing * DRAW.minPoints) return null;
        let points = evenLoop(drawing, Math.max(DRAW.minPoints, Math.round(length / DRAW.spacing)));
        for (let pass = 0; pass < DRAW.passes; pass++) {
            points = points.map(function (p, i) {
                let x = 0;
                let y = 0;
                for (let k = -DRAW.smooth; k <= DRAW.smooth; k++) {
                    const q = points[(i + k + points.length) % points.length];
                    x += q[0];
                    y += q[1];
                }
                return [x / (2 * DRAW.smooth + 1), y / (2 * DRAW.smooth + 1)];
            });
        }
        return evenLoop(points, DRAW.controls).map(function (p) { return [Math.round(p[0]), Math.round(p[1])]; });
    }

    /* =========================================================
       4. THE CAR: SENSORS, BRAIN, PHYSICS, FITNESS
       Each tick, every car still driving:
         1. moves with the steering and throttle its brain chose,
         2. is checked: a wall? a new gate? the wrong way? too slow?
         3. looks with its 5 sensors and lets its brain choose again.
       ========================================================= */
    // The brain, a small neural network: 6 inputs -> 8 hidden neurons (tanh) -> 2 outputs (tanh).
    // weights is one flat list of 74 numbers:
    //   numbers 0-55:  hidden neuron h has its 6 input weights at h × 7 + (0 … 5), its bias at h × 7 + 6
    //   numbers 56-73: output o has its 8 weights at 56 + o × 9 + (0 … 7), its bias at 56 + o × 9 + 8
    // A neuron adds up its inputs times their weights, plus its bias, and squashes the sum
    // into −1 … +1 with tanh. result (optional) = { hidden, output } to write into.
    function forward(weights, inputs, result) {
        const out = result || { hidden: new Float64Array(HIDDEN), output: new Float64Array(OUTPUTS) };
        for (let h = 0; h < HIDDEN; h++) {
            const base = h * (INPUTS + 1);
            let sum = weights[base + INPUTS];
            for (let i = 0; i < INPUTS; i++) sum += weights[base + i] * inputs[i];
            out.hidden[h] = Math.tanh(sum);
        }
        for (let o = 0; o < OUTPUTS; o++) {
            const base = HIDDEN_NUMBERS + o * (HIDDEN + 1);
            let sum = weights[base + HIDDEN];
            for (let h = 0; h < HIDDEN; h++) sum += weights[base + h] * out.hidden[h];
            out.output[o] = Math.tanh(sum);
        }
        return out;
    }

    // A brain of random numbers (generation 1)
    function randomBrain(rng) {
        const weights = new Float64Array(BRAIN_SIZE);
        for (let i = 0; i < BRAIN_SIZE; i++) weights[i] = rng.range(-START_WEIGHT, START_WEIGHT);
        return weights;
    }

    // A car on the start line, facing along the track, with this brain
    function newCar(track, weights) {
        const car = {
            weights: weights,
            x: track.start.x,
            y: track.start.y,
            heading: track.start.heading,
            speed: 0,
            point: 0,             // the nearest point of the centre line...
            at: 0,                // ...and how far along the loop that is
            driven: 0,            // how far the car got along the track (it keeps growing, lap after lap)
            gates: 0,             // gates passed in order
            fraction: 0,          // the part of the way to the next gate, 0 … 1
            time: 0,              // seconds since the start
            lastGate: 0,          // when it passed its last gate
            lapStart: 0,          // when its lap began
            laps: [],             // the time of each finished lap, in seconds
            state: "driving",     // "driving", then "crashed", "stalled", "wrong" (way), or "finished"
            rays: new Float64Array(RAY_ANGLES.length),    // what the sensors see: distance / RAY_LENGTH
            inputs: new Float64Array(INPUTS),
            activity: { hidden: new Float64Array(HIDDEN), output: new Float64Array(OUTPUTS) },
            steer: 0,
            throttle: 0
        };
        think(car, track);
        return car;
    }

    // Steps 3 of a tick: the sensors look (from the car's nose), and the brain chooses
    function think(car, track) {
        const noseX = car.x + Math.cos(car.heading) * CAR.radius;
        const noseY = car.y + Math.sin(car.heading) * CAR.radius;
        for (let r = 0; r < RAY_ANGLES.length; r++) {
            const angle = car.heading + (RAY_ANGLES[r] * Math.PI) / 180;
            car.rays[r] = castRay(track.grid, noseX, noseY, angle, RAY_LENGTH) / RAY_LENGTH;
            car.inputs[r] = car.rays[r];
        }
        car.inputs[INPUTS - 1] = car.speed / CAR.maxSpeed;
        forward(car.weights, car.inputs, car.activity);
        car.steer = car.activity.output[0];
        car.throttle = car.activity.output[1];
    }

    // Finds the point of the centre line nearest to the car (near the last one: a car moves
    // less than one point per tick) and updates how far it got: gates, laps, the wrong way
    function followTrack(car, track) {
        const n = track.centre.length;
        let best = car.point;
        let bestDistance = Infinity;
        let bestShare = 0;
        for (let k = -3; k <= 3; k++) {
            const i = (car.point + k + n) % n;
            const p = track.centre[i];
            const share = clamp(((car.x - p.x) * p.dx + (car.y - p.y) * p.dy) / (p.length * p.length), 0, 1);
            const x = p.x + share * p.dx - car.x;
            const y = p.y + share * p.dy - car.y;
            if (x * x + y * y < bestDistance) {
                bestDistance = x * x + y * y;
                best = i;
                bestShare = share;
            }
        }
        const at = track.centre[best].at + bestShare * track.centre[best].length;
        let change = at - car.at;
        // across the start line the place along the loop jumps from the end back to 0
        if (change > track.length / 2) change -= track.length;
        if (change < -track.length / 2) change += track.length;
        car.driven += change;
        car.at = at;
        car.point = best;

        while (car.driven >= (car.gates + 1) * track.gap) {
            car.gates += 1;
            car.lastGate = car.time;
            if (car.gates % GATES === 0) {
                car.laps.push(car.time - car.lapStart);
                car.lapStart = car.time;
            }
        }
        car.fraction = clamp((car.driven - car.gates * track.gap) / track.gap, 0, 1);
    }

    // One tick of one car (dt seconds)
    function stepCar(car, track, dt) {
        if (car.state !== "driving") return;
        // 1. Move, with the steering and throttle the brain chose last time
        car.speed = clamp(car.speed + car.throttle * CAR.accel * dt - CAR.drag * car.speed * dt, 0, CAR.maxSpeed);
        let turn = car.steer * CAR.turnRate * (car.speed / CAR.maxSpeed);        // radians per second
        const grip = CAR.grip / Math.max(car.speed, 1);                           // the most the tyres allow
        turn = clamp(turn, -grip, grip);
        car.heading += turn * dt;
        car.x += car.speed * dt * Math.cos(car.heading);
        car.y += car.speed * dt * Math.sin(car.heading);
        car.time += dt;

        // 2. Check: a wall, the gates, the wrong way, the finish, too long without a new gate
        if (touchesWall(track.grid, car.x, car.y, CAR.radius)) {
            car.state = "crashed";
            return;
        }
        followTrack(car, track);
        if (car.driven < car.gates * track.gap - BACK_MARGIN) {
            car.state = "wrong";
        } else if (car.gates >= LAPS_TO_WIN * GATES) {
            car.state = "finished";
            car.fraction = 0;
        } else if (car.time - car.lastGate > STALL_SECONDS) {
            car.state = "stalled";
        } else {
            // 3. Look and choose the next move
            think(car, track);
        }
    }

    // The score of a car: gates passed in order, plus the part of the way to the next one,
    // plus a bonus for finishing fast (up to 1)
    function fitness(car) {
        let score = car.gates + car.fraction;
        if (car.state === "finished") score += (MAX_SECONDS - car.time) / MAX_SECONDS;
        return score;
    }

    // A race: every brain in its own car, all on the start line. (Cars drive through each other.)
    function newRace(track, brains) {
        return {
            cars: brains.map(function (weights) { return newCar(track, weights); }),
            ticks: 0,
            driving: brains.length
        };
    }

    // One tick of the race. Returns false when it is over: every car has stopped, or the
    // time is up (MAX_SECONDS).
    function stepRace(race, track) {
        let driving = 0;
        for (let i = 0; i < race.cars.length; i++) {
            stepCar(race.cars[i], track, TICK);
            if (race.cars[i].state === "driving") driving += 1;
        }
        race.ticks += 1;
        race.driving = driving;
        return driving > 0 && race.ticks < MAX_TICKS;
    }

    /* =========================================================
       5. EVOLUTION: THE NEXT GENERATION
       population: [{ weights, fitness }], settings: { rate, size, crossover, count }
       ========================================================= */
    function copyBrain(weights) {
        return new Float64Array(weights);
    }

    // Tournament: pick TOURNAMENT cars at random; the fittest of them is a parent
    function tournament(population, rng) {
        let winner = population[rng.int(population.length)];
        for (let i = 1; i < TOURNAMENT; i++) {
            const rival = population[rng.int(population.length)];
            if (rival.fitness > winner.fitness) winner = rival;
        }
        return winner;
    }

    // Crossover: each number comes from parent a or parent b, 50 % each
    function crossover(a, b, rng) {
        const child = new Float64Array(BRAIN_SIZE);
        for (let i = 0; i < BRAIN_SIZE; i++) child[i] = rng.next() < 0.5 ? a[i] : b[i];
        return child;
    }

    // Mutation: each number changes with probability rate, by a random amount from a bell
    // curve (normal distribution) with standard deviation size
    function mutate(weights, rate, size, rng) {
        for (let i = 0; i < weights.length; i++) {
            if (rng.next() < rate) weights[i] += rng.normal(0, size);
        }
        return weights;
    }

    // The brains of the next generation (settings.count of them, default: as many as now).
    // The best ELITE are copied unchanged; every other one is a child of tournament winners.
    function nextGeneration(population, settings, rng) {
        const count = settings.count || population.length;
        const ranked = population.map(function (member, index) { return index; }).sort(function (a, b) {
            return population[b].fitness - population[a].fitness || a - b;     // best first; a tie keeps the order
        });
        const brains = [];
        for (let i = 0; i < Math.min(ELITE, count, ranked.length); i++) brains.push(copyBrain(population[ranked[i]].weights));
        while (brains.length < count) {
            const parent = tournament(population, rng);
            const child = settings.crossover
                ? crossover(parent.weights, tournament(population, rng).weights, rng)
                : copyBrain(parent.weights);
            brains.push(mutate(child, settings.rate, settings.size, rng));
        }
        return brains;
    }

    /* =========================================================
       6. DRAWING: THE TRACK, THE CARS, THE BRAIN
       The world (WORLD.width × WORLD.height) is scaled to fit the canvas.
       The track changes rarely, so it is drawn once into a hidden canvas
       (the "layer") and copied onto the screen in every frame; only the
       cars are drawn again each time.
       ========================================================= */
    // Where the world goes on a canvas: screen x = left + world x × scale
    function fitWorld(view) {
        const scale = Math.min(view.width / WORLD.width, view.height / WORLD.height);
        return { scale: scale, left: (view.width - WORLD.width * scale) / 2, top: (view.height - WORLD.height * scale) / 2 };
    }

    // A closed line through points ({ x, y }), as a path
    function traceLoop(g, points) {
        g.beginPath();
        points.forEach(function (p, i) {
            if (i === 0) g.moveTo(p.x, p.y);
            else g.lineTo(p.x, p.y);
        });
        g.closePath();
    }

    // The track, into the layer: the asphalt, the faint gates, the checkered start line and
    // the two walls, glowing in the accent colour (no glow in calm mode)
    function drawTrackLayer(layer, view, track, c, glow) {
        layer.width = Math.max(1, Math.round(view.width * view.dpr));
        layer.height = Math.max(1, Math.round(view.height * view.dpr));
        const g = layer.getContext("2d");
        const fit = fitWorld(view);
        const pixel = 1 / fit.scale;                 // one screen pixel, in world units
        // from here on, draw in world units
        g.setTransform(view.dpr * fit.scale, 0, 0, view.dpr * fit.scale, view.dpr * fit.left, view.dpr * fit.top);
        g.lineJoin = "round";

        // the asphalt: the centre line, drawn as wide as the road
        traceLoop(g, track.centre);
        g.lineWidth = track.width;
        g.strokeStyle = kit.alpha(c.text, c.light ? ASPHALT.light : ASPHALT.dark);
        g.stroke();

        // the gates (gate 0, the start line, comes next)
        g.beginPath();
        for (let k = 1; k < track.gates.length; k++) {
            g.moveTo(track.gates[k].a.x, track.gates[k].a.y);
            g.lineTo(track.gates[k].b.x, track.gates[k].b.y);
        }
        g.lineWidth = pixel;
        g.strokeStyle = kit.alpha(c.text, GATE_ALPHA);
        g.stroke();
        drawStartLine(g, track, c);

        // the walls (the glow's size is in real pixels: the transform doesn't change it)
        if (glow) {
            g.shadowColor = c.accent;
            g.shadowBlur = WALL_GLOW * view.dpr;
        }
        g.lineWidth = WALL_WIDTH * pixel;
        g.strokeStyle = c.accent;
        traceLoop(g, track.left);
        g.stroke();
        traceLoop(g, track.right);
        g.stroke();
    }

    // The start line: two rows of squares across the road, light and dark in turn
    function drawStartLine(g, track, c) {
        const gate = track.gates[0];
        const p = track.centre[0];
        const size = track.width / START_SQUARES;
        const across = { x: (gate.b.x - gate.a.x) / track.width, y: (gate.b.y - gate.a.y) / track.width };   // one unit, left to right
        const along = { x: p.dx / p.length, y: p.dy / p.length };                                             // one unit, forwards
        for (let row = 0; row < 2; row++) {
            for (let i = 0; i < START_SQUARES; i++) {
                // the square's corner on the left wall side, then its four corners
                const x = gate.a.x + across.x * i * size + along.x * (row - 1) * size;
                const y = gate.a.y + across.y * i * size + along.y * (row - 1) * size;
                g.beginPath();
                g.moveTo(x, y);
                g.lineTo(x + across.x * size, y + across.y * size);
                g.lineTo(x + across.x * size + along.x * size, y + across.y * size + along.y * size);
                g.lineTo(x + along.x * size, y + along.y * size);
                g.closePath();
                g.fillStyle = (i + row) % 2 === 0 ? kit.alpha(c.text, 0.75) : kit.alpha(c.bg, 0.75);
                g.fill();
            }
        }
    }

    // A car as a small arrow pointing where it drives. size: px from tail to nose.
    function drawCar(g, fit, car, size, color, outline) {
        const x = fit.left + car.x * fit.scale;
        const y = fit.top + car.y * fit.scale;
        const cos = Math.cos(car.heading);
        const sin = Math.sin(car.heading);
        g.beginPath();
        ARROW.forEach(function (corner, i) {
            // the corner turned with the car, then moved to where the car is
            const px = x + (corner[0] * cos - corner[1] * sin) * size;
            const py = y + (corner[0] * sin + corner[1] * cos) * size;
            if (i === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
        });
        g.closePath();
        if (outline) {
            g.lineJoin = "round";
            g.lineWidth = 3;
            g.strokeStyle = outline;
            g.stroke();
        }
        g.fillStyle = color;
        g.fill();
    }

    // A car's 5 sensors: a line from its nose to what each one sees, and a dot where it meets a wall
    function drawRays(g, fit, car, c) {
        const noseX = car.x + Math.cos(car.heading) * CAR.radius;
        const noseY = car.y + Math.sin(car.heading) * CAR.radius;
        g.lineWidth = 1.5;
        for (let r = 0; r < RAY_ANGLES.length; r++) {
            const angle = car.heading + (RAY_ANGLES[r] * Math.PI) / 180;
            const distance = car.rays[r] * RAY_LENGTH;
            const endX = fit.left + (noseX + Math.cos(angle) * distance) * fit.scale;
            const endY = fit.top + (noseY + Math.sin(angle) * distance) * fit.scale;
            g.beginPath();
            g.moveTo(fit.left + noseX * fit.scale, fit.top + noseY * fit.scale);
            g.lineTo(endX, endY);
            g.strokeStyle = kit.alpha(c.accent2, car.rays[r] < 1 ? 0.8 : 0.35);
            g.stroke();
            if (car.rays[r] < 1) kit.marker(g, "dot", endX, endY, 3, c.warning);
        }
    }

    // One frame of the track view. frame = { cars, leader, hud, drawing (draw mode), stroke,
    // hereText }: the layer, then the stopped cars (grey), the others from the last to the
    // first (brighter = further), and the leader on top, bigger, with its sensors
    function drawScene(view, layer, frame, c) {
        const g = view.ctx;
        g.clearRect(0, 0, view.width, view.height);
        if (!view.width || !view.height) return;
        const fit = fitWorld(view);
        g.globalAlpha = frame.drawing ? DRAW_FADE : 1;
        g.drawImage(layer, 0, 0, view.width, view.height);
        g.globalAlpha = 1;
        if (frame.drawing) {
            drawStroke(g, fit, frame, c);
            return;
        }

        const size = Math.max(CAR_SIZE.min, CAR_SIZE.world * fit.scale);
        const order = frame.cars.slice().sort(function (a, b) { return fitness(a) - fitness(b); });
        order.forEach(function (car) {
            if (car !== frame.leader && car.state !== "driving" && car.state !== "finished") drawCar(g, fit, car, size, kit.alpha(c.muted, 0.55), null);
        });
        order.forEach(function (car, i) {
            if (car === frame.leader || (car.state !== "driving" && car.state !== "finished")) return;
            const rank = order.length > 1 ? i / (order.length - 1) : 1;     // 0 for the last car, 1 for the first
            drawCar(g, fit, car, size, kit.scale(RANK_COLORS.low + (1 - RANK_COLORS.low) * rank), null);
        });
        if (frame.leader) {
            drawRays(g, fit, frame.leader, c);
            drawCar(g, fit, frame.leader, size * LEADER_SCALE, kit.scale(1), c.surface);
        }

        g.font = kit.font(12, 600);
        drawPill(g, frame.hud, HUD_PAD, HUD_PAD + PILL.y, c, false);
    }

    // A canvas text on a pill of the background colour, so the track under it doesn't cross
    // the words. (x, y): the pill's left end (or its middle, centred) and its middle height
    function drawPill(g, text, x, y, c, centred) {
        const width = g.measureText(text).width + 2 * PILL.x;
        const left = centred ? x - width / 2 : x;
        g.fillStyle = kit.alpha(c.surface, PILL.alpha);
        g.beginPath();
        if (g.roundRect) g.roundRect(left, y - PILL.y, width, 2 * PILL.y, PILL.y);
        else g.rect(left, y - PILL.y, width, 2 * PILL.y);
        g.fill();
        g.fillStyle = c.muted;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(text, left + width / 2, y);
    }

    // Draw mode: the edge of the field, and the line drawn so far (or a short "draw here")
    function drawStroke(g, fit, frame, c) {
        g.setLineDash([6, 6]);
        g.lineWidth = 1;
        g.strokeStyle = kit.alpha(c.text, 0.4);
        g.strokeRect(fit.left + 0.5, fit.top + 0.5, WORLD.width * fit.scale - 1, WORLD.height * fit.scale - 1);
        g.setLineDash([]);
        const points = frame.stroke ? frame.stroke.points : [];
        if (points.length === 0) {
            g.font = kit.font(13, 600);
            drawPill(g, frame.hereText, fit.left + (WORLD.width * fit.scale) / 2, fit.top + (WORLD.height * fit.scale) / 2, c, true);
            return;
        }
        g.beginPath();
        points.forEach(function (p, i) {
            if (i === 0) g.moveTo(fit.left + p[0] * fit.scale, fit.top + p[1] * fit.scale);
            else g.lineTo(fit.left + p[0] * fit.scale, fit.top + p[1] * fit.scale);
        });
        g.lineJoin = "round";
        g.lineCap = "round";
        g.lineWidth = 3;
        g.strokeStyle = c.accent2;
        g.stroke();
        kit.marker(g, "dot", fit.left + points[0][0] * fit.scale, fit.top + points[0][1] * fit.scale, 5, c.success);
    }

    // The brain of a car as a small diagram: 6 inputs on the left, 8 hidden neurons in the
    // middle, 2 outputs on the right. A line's colour shows its weight's sign (kit.diverge)
    // and its thickness the weight's size; a circle's brightness shows its value right now.
    // labels = { inputs: [6 texts], outputs: [2 texts] }
    function drawBrain(view, car, labels, c) {
        const g = view.ctx;
        const width = view.width;
        const height = view.height;
        g.clearRect(0, 0, width, height);
        if (!width || !height || !car) return;
        // room for the labels: at least BRAIN.left and BRAIN.right, more for longer words ("скорость")
        g.font = kit.font(11);
        const room = BRAIN.radius + BRAIN.gap + BRAIN.edge;
        const widest = function (texts) { return Math.max.apply(null, texts.map(function (text) { return g.measureText(text).width; })); };
        const left = Math.max(BRAIN.left, room + widest(labels.inputs));
        const right = Math.max(BRAIN.right, room + widest(labels.outputs.map(function (text) { return text + " " + A.format.number(-0.99, { digits: 2 }); })));
        const x = [left, (left + width - right) / 2, width - right];
        // the y of neuron i of a column with count neurons: spread evenly from top to bottom
        function yOf(count, i) {
            return BRAIN.pad + ((height - 2 * BRAIN.pad) * (i + 0.5)) / count;
        }

        for (let h = 0; h < HIDDEN; h++) {
            for (let i = 0; i < INPUTS; i++) drawLink(g, x[0], yOf(INPUTS, i), x[1], yOf(HIDDEN, h), car.weights[h * (INPUTS + 1) + i]);
        }
        for (let o = 0; o < OUTPUTS; o++) {
            for (let h = 0; h < HIDDEN; h++) drawLink(g, x[1], yOf(HIDDEN, h), x[2], yOf(OUTPUTS, o), car.weights[HIDDEN_NUMBERS + o * (HIDDEN + 1) + h]);
        }

        // inputs are 0 … 1; hidden neurons and outputs are −1 … +1 (tanh)
        for (let i = 0; i < INPUTS; i++) drawNeuron(g, x[0], yOf(INPUTS, i), car.inputs[i], c);
        for (let h = 0; h < HIDDEN; h++) drawNeuron(g, x[1], yOf(HIDDEN, h), (car.activity.hidden[h] + 1) / 2, c);
        for (let o = 0; o < OUTPUTS; o++) drawNeuron(g, x[2], yOf(OUTPUTS, o), (car.activity.output[o] + 1) / 2, c);

        g.fillStyle = c.muted;
        g.textBaseline = "middle";
        g.textAlign = "right";
        labels.inputs.forEach(function (text, i) { g.fillText(text, x[0] - BRAIN.radius - BRAIN.gap, yOf(INPUTS, i)); });
        g.textAlign = "left";
        labels.outputs.forEach(function (text, o) {
            g.fillText(text + " " + A.format.number(car.activity.output[o], { digits: 2 }), x[2] + BRAIN.radius + BRAIN.gap, yOf(OUTPUTS, o));
        });
    }

    function drawLink(g, x1, y1, x2, y2, weight) {
        const size = Math.min(1, Math.abs(weight) / BRAIN.bigWeight);
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.lineWidth = 0.5 + 2.5 * size;
        g.strokeStyle = kit.alpha(kit.diverge(clamp(weight / BRAIN.bigWeight, -1, 1)), 0.85);
        g.stroke();
    }

    // value: 0 … 1 (dim … bright)
    function drawNeuron(g, x, y, value, c) {
        g.beginPath();
        g.arc(x, y, BRAIN.radius, 0, Math.PI * 2);
        g.fillStyle = kit.scale(value);
        g.fill();
        g.lineWidth = 1.5;
        g.strokeStyle = kit.alpha(c.text, 0.35);
        g.stroke();
    }

    /* =========================================================
       7. THE EXPERIMENT
       The page, and the life of a run: a population of brains races,
       the race ends, the next generation is made, the next race starts.
       ========================================================= */
    function create(stage, ctx) {
        // ----- The tracks: the presets (js/content/lab/evolve.js) and your own drawing -----
        const content = A.content.get("lab.evolve") || {};
        const presets = (content.tracks || []).filter(function (item) { return isTrackData(item.points, item.width); });
        let mine = ctx.store.get("track", null, isSavedTrack);       // { v, points, width } or null
        const built = {};                                               // id -> its built track

        // ----- State -----
        const settings = { population: POPULATION, rate: RATE.value, size: SIZE.value, crossover: false, keep: false };
        let trackId = presets[0].id;
        let track = trackOf(trackId);
        let seed = 0;
        let rng = null;
        let race = null;              // this generation's cars
        let generation = 1;
        let made = null;              // { rate, size, crossover }: how this generation's brains were made (null: at random)
        let next = null;              // the next generation's brains, waiting for their race...
        let nextMade = null;          // ...and how they were made
        let rest = 0;                 // Watch: ticks left to look at the finished race
        const history = { best: [], average: [], laps: [] };     // per generation; laps: where the best car did more laps than ever before
        let bestEver = null;          // { fitness, weights, generation }
        let bestLap = null;           // seconds
        let firstLap = null;          // the generation of the first full lap
        let mostLaps = 0;             // the most laps a best car has driven in this run (the chart rings each new one)
        let stuck = 0;                // challenge 2: generations with rate 0 and no better best car
        let below = 0;                // challenge 3: generations in a row at the biggest size with a lower average...
        let reference = null;         // ...than this one (the last average made with a smaller size)
        let transfer = null;          // { from, lapped, result }: brains brought from another track
        let state = "ready";          // "ready" | "running" | "paused" | "done"
        let mode = "evolve";          // "evolve" | "champion" (a replay) | "draw"
        let replay = null;            // the champion's race
        let speed = "watch";
        let stepping = false;         // Step in Fast or Turbo: the loop runs until the generation ends
        let resumeOnShow = false;     // running when the hub paused us
        let stroke = null;            // the drawing in progress: { id, points }
        let note = null;              // what the explain panel's note says: a function -> [key, values]
        const layer = document.createElement("canvas");     // the track, drawn once (section 6)
        let layerKey = "";
        let lastPaint = -Infinity;
        let lastBrain = -Infinity;
        let lastChart = -Infinity;
        let chartDirty = true;
        let ticksRun = 0;             // ticks of every race so far (for the speed test)

        // ----- The page: kit parts, plus the brain panel (Small helpers) -----
        const ui = kit.layout(stage, { side: true });
        const scene = kit.canvas(ui.main, { aspect: WORLD.width / WORLD.height, minHeight: 200, labelKey: "lab.evolve.canvas" });
        const legend = kit.legend(legendItems());
        const drawHint = kit.hint({ key: "lab.evolve.drawHint", tone: "tip" });
        const drawProblem = kit.hint({ tone: "warn" });
        drawProblem.hide();
        const drawBox = document.createElement("div");
        drawBox.className = "ev-draw";
        drawBox.hidden = true;
        drawBox.append(drawHint.element, drawProblem.element,
            kit.button("lab.evolve.cancel", { icon: "close", size: "sm", onClick: cancelDraw }).element);
        const generationStat = kit.stat({ labelKey: "lab.evolve.generation", value: 1 });
        const drivingStat = kit.stat({ labelKey: "lab.evolve.driving" });
        const bestStat = kit.stat({ labelKey: "lab.evolve.bestFitness", format: oneDecimal });
        const lapStat = kit.stat({ labelKey: "lab.evolve.bestLap", format: secondsText });
        ui.main.append(legend.element, drawBox, kit.row([generationStat, drivingStat, bestStat, lapStat], { grid: true }));
        const chartView = kit.canvas(ui.main, { height: CHART_HEIGHT, labelKey: "lab.evolve.chart" });
        const chart = kit.lineChart(chartView, {
            series: [
                { values: history.best, colorIndex: 0, labelKey: "lab.evolve.best", marks: history.laps },
                { values: history.average, colorIndex: 1, labelKey: "lab.evolve.average" }
            ],
            x0: 1,
            yMin: 0,
            format: oneDecimal,
            xLabelKey: "lab.evolve.generation",
            yLabelKey: "lab.evolve.fitness"
        });
        ui.main.appendChild(kit.legend([
            { labelKey: "lab.evolve.best", colorIndex: 0, shape: "line" },
            { labelKey: "lab.evolve.average", colorIndex: 1, shape: "line" }
        ]).element);

        const playButton = kit.button("lab.kit.play", { icon: "play", variant: "primary", onClick: togglePlay });
        const stepButton = kit.button("lab.kit.step", { icon: "step", title: "lab.evolve.stepTitle", onClick: stepOnce });
        const status = kit.status("ready");
        const speedControl = kit.segmented({
            labelKey: "lab.kit.speed",
            options: [
                { value: "watch", labelKey: "lab.kit.speedWatch" },
                { value: "fast", labelKey: "lab.kit.speedFast" },
                { value: "turbo", labelKey: "lab.kit.speedTurbo" }
            ],
            value: speed,
            onChange: setSpeed
        });
        const trackSelect = kit.select({ labelKey: "lab.evolve.track", options: trackOptions(), value: trackId, onChange: chooseTrack });
        const trackNote = document.createElement("p");
        trackNote.className = "ev-note";
        const championButton = kit.button("lab.evolve.champion", { icon: "sparkle", onClick: toggleChampion });

        const brainPanel = disclosure("lab.evolve.brainTitle");
        const brainView = kit.canvas(brainPanel.body, { height: BRAIN.height, labelKey: "lab.evolve.brainCanvas" });
        const brainCaption = document.createElement("p");
        brainCaption.className = "ev-note";
        setKey(brainCaption, "lab.evolve.brainCaption");
        brainPanel.body.append(kit.legend([
            { labelKey: "lab.evolve.plus", color: "var(--accent-2)", shape: "line" },
            { labelKey: "lab.evolve.minus", color: "var(--danger)", shape: "line" }
        ]).element, brainCaption);

        const populationSelect = kit.select({
            labelKey: "lab.evolve.population", hintKey: "lab.evolve.populationHint", value: POPULATION,
            options: POPULATIONS.map(function (n) { return { value: n, label: String(n) }; }),
            onChange: setPopulation
        });
        const rateSlider = kit.slider({
            labelKey: "lab.evolve.rate", hintKey: "lab.evolve.rateHint",
            min: RATE.min, max: RATE.max, step: RATE.step, value: RATE.value,
            format: function (value) { return A.format.percent(value); },
            onInput: function (value) {
                settings.rate = value;
                render(true);
            }
        });
        const sizeSlider = kit.slider({
            labelKey: "lab.evolve.size", hintKey: "lab.evolve.sizeHint",
            min: SIZE.min, max: SIZE.max, step: SIZE.step, value: SIZE.value,
            onInput: function (value) { settings.size = value; }
        });
        const crossoverSwitch = kit.toggle({
            labelKey: "lab.evolve.crossover", hintKey: "lab.evolve.crossoverHint",
            onChange: function (on) { settings.crossover = on; }
        });
        const keepSwitch = kit.toggle({
            labelKey: "lab.evolve.keep", hintKey: "lab.evolve.keepHint",
            onChange: function (on) { settings.keep = on; }
        });

        const explain = kit.explain({ steps: [
            { key: "lab.evolve.step1" }, { key: "lab.evolve.step2" }, { key: "lab.evolve.step3" },
            { key: "lab.evolve.step4" }, { key: "lab.evolve.step5" }
        ] });
        const challenges = kit.challenges({ ctx: ctx, items: [
            { key: "lab.evolve.ch1", insightKey: "lab.evolve.ch1Why", check: function (info) { return info.track === "oval" && info.lapped; } },
            { key: "lab.evolve.ch2", insightKey: "lab.evolve.ch2Why", check: function (info) { return info.stuck >= STUCK_GENERATIONS; } },
            { key: "lab.evolve.ch3", insightKey: "lab.evolve.ch3Why", check: function (info) { return info.below >= FALLS; } },
            { key: "lab.evolve.ch4", insightKey: "lab.evolve.ch4Why", check: function (info) { return info.transferTested; } }
        ] });
        const idea = document.createElement("p");
        idea.className = "ev-idea";
        const real = document.createElement("p");
        real.className = "ev-real";
        setKey(real, "lab.evolve.real");
        const transferNote = document.createElement("p");
        transferNote.className = "ev-transfer";
        transferNote.hidden = true;
        writeIdea();

        ui.top.append(
            kit.row([
                kit.toolbar([playButton, stepButton, kit.button("lab.evolve.startOver", { icon: "dice", variant: "subtle", onClick: startOver }), status]),
                speedControl,
                trackSelect
            ]),
            trackNote
        );
        ui.side.append(
            kit.toolbar([championButton]),
            brainPanel.element,
            kit.group("lab.kit.settings", [populationSelect, rateSlider, sizeSlider, crossoverSwitch, keepSwitch])
        );
        ui.bottom.append(idea, real, explain.element, transferNote, challenges.element);

        const loop = kit.loop({ rate: SPEEDS[speed], budget: LOOP_BUDGET, update: tick, draw: function () { render(false); } });
        scene.onResize(function () { render(true); });
        brainView.onResize(function () { render(true); });
        brainPanel.element.addEventListener("toggle", function () { render(true); });
        scene.canvas.addEventListener("pointerdown", onPointerDown);
        scene.canvas.addEventListener("pointermove", onPointerMove);
        scene.canvas.addEventListener("pointerup", onPointerUp);
        scene.canvas.addEventListener("pointercancel", onPointerCancel);
        // Calm mode switched on or off (the hub doesn't tell us): the walls' glow goes or comes back
        const offMotion = A.motion.onChange(function () {
            layerKey = "";
            render(true);
        });

        // ----- The tracks -----
        function defOf(id) {
            if (id === "mine") return { id: "mine", titleKey: "lab.evolve.mine", noteKey: "lab.evolve.mineNote", seed: MY_SEED, width: mine.width, points: mine.points };
            return presets.filter(function (item) { return item.id === id; })[0];
        }

        function trackOf(id) {
            if (!built[id]) built[id] = buildTrack(defOf(id).points, defOf(id).width);
            return built[id];
        }

        function trackOptions() {
            const options = presets.map(function (item) { return { value: item.id, labelKey: item.titleKey }; });
            if (mine) options.push({ value: "mine", labelKey: "lab.evolve.mine" });
            options.push({ value: "draw", labelKey: "lab.evolve.draw" });
            return options;
        }

        function trackName(id) {
            return t(defOf(id).titleKey);
        }

        function chooseTrack(id) {
            if (id === "draw") startDrawing();
            else if (mode === "draw" && id === trackId) cancelDraw();      // back to the cars' own track: like Cancel, nothing is lost
            else loadTrack(id);
        }

        // Puts the cars on another track. With "Keep the brains" on, this generation's brains
        // go along (challenge 4); otherwise a new population starts from the track's own seed.
        // quiet: no message for screen readers (when the experiment opens)
        function loadTrack(id, quiet) {
            if (mode === "draw") stopDrawing();
            if (mode === "champion") leaveChampion();
            halt();
            const from = trackId;
            // a new drawing of "My track" is a new track too
            const keep = settings.keep && race !== null && (id !== from || id === "mine");
            const brains = keep ? race.cars.map(function (car) { return car.weights; }) : null;
            const lappedBefore = firstLap !== null || (transfer !== null && transfer.lapped);
            trackId = id;
            track = trackOf(id);
            layerKey = "";
            trackSelect.set(id);
            setKey(trackNote, defOf(id).noteKey);
            if (keep) {
                transfer = { from: from, lapped: lappedBefore, result: null };
                beginRun(brains);
            } else {
                freshPopulation(defOf(id).seed);
            }
            setState("ready");
            if (!quiet) ctx.announce(t("lab.evolve.trackChosen", { track: trackName(id) }));
        }

        // ----- A run: generation 1, then one race after another -----
        // A new population of random brains, made from a seed
        function freshPopulation(newSeed) {
            seed = newSeed;
            rng = kit.rng(seed);
            const brains = [];
            for (let i = 0; i < settings.population; i++) brains.push(randomBrain(rng));
            transfer = null;
            beginRun(brains);
        }

        // Generation 1 of these brains: the history starts again
        function beginRun(brains) {
            generation = 1;
            made = null;
            history.best.length = 0;
            history.average.length = 0;
            history.laps.length = 0;
            bestEver = null;
            bestLap = null;
            firstLap = null;
            mostLaps = 0;
            stuck = 0;
            below = 0;
            reference = null;
            transferNote.hidden = true;
            transferNote.textContent = "";        // no stale text in the old language
            setNote(null);
            chartDirty = true;
            startRace(brains);
        }

        function startRace(brains) {
            race = newRace(track, brains);
            next = null;
            rest = 0;
        }

        // One tick: the loop's update. The champion drives, or the finished race stays on
        // screen a moment (Watch), or the next race starts, or the race goes on.
        function tick() {
            if (mode === "champion") {
                if (!replay.over && !stepRace(replay, track)) endReplay();
                return;
            }
            if (next) {
                if (rest > 0) {
                    rest -= 1;
                    return;
                }
                generation += 1;
                made = nextMade;
                startRace(next);
                return;
            }
            ticksRun += 1;
            if (!stepRace(race, track)) endGeneration();
        }

        // The race is over: score every car, remember the best, check the challenges and
        // make the next generation's brains
        function endGeneration() {
            const population = race.cars.map(function (car) { return { weights: car.weights, fitness: fitness(car) }; });
            let bestIndex = 0;
            let sum = 0;
            population.forEach(function (member, i) {
                sum += member.fitness;
                if (member.fitness > population[bestIndex].fitness) bestIndex = i;
            });
            const best = population[bestIndex].fitness;
            const average = sum / population.length;
            const laps = Math.floor(race.cars[bestIndex].gates / GATES);
            const lapNow = laps >= 1;
            history.best.push(best);
            history.average.push(average);
            // a ring on the chart where the best car drove more laps than ever before (its first lap, its finish)
            if (laps > mostLaps) {
                mostLaps = laps;
                history.laps.push(history.best.length - 1);
            }
            race.cars.forEach(function (car) {
                car.laps.forEach(function (time) {
                    if (bestLap === null || time < bestLap) bestLap = time;
                });
            });
            const improved = !bestEver || best > bestEver.fitness;
            if (improved) bestEver = { fitness: best, weights: copyBrain(race.cars[bestIndex].weights), generation: generation };

            // Challenge 2: made with rate 0 and no crossover (so every child is an exact copy of
            // a parent), and no better than before. With crossover on, mixing two parents still
            // makes new brains, and evolution can go on improving for a while.
            stuck = made && made.rate === 0 && !made.crossover && !improved ? stuck + 1 : 0;
            // Challenge 3: made with the biggest size, and a lower average than before that size
            if (made && made.size >= SIZE.max) {
                below = reference !== null && average < reference ? below + 1 : 0;
            } else {
                below = 0;
                reference = made ? average : null;
            }
            // Challenge 4: brains from another track, tested here for one generation
            if (transfer && transfer.result === null) {
                transfer.result = best;
                writeTransfer();
            }

            if (lapNow && firstLap === null) {
                firstLap = generation;
                ctx.announce(t("lab.evolve.firstLap", { n: generation }));
                ctx.track("milestone", { firstLap: generation, track: trackId });
            } else if (speed === "watch" || stepping) {
                ctx.announce(t("lab.evolve.genDone", { n: generation, result: resultText(best) }));
            }
            challenges.check({
                track: trackId,
                lapped: lapNow,
                stuck: stuck,
                below: below,
                transferTested: Boolean(transfer && transfer.lapped && transfer.result !== null)
            });

            next = nextGeneration(population, { rate: settings.rate, size: settings.size, crossover: settings.crossover, count: settings.population }, rng);
            nextMade = { rate: settings.rate, size: settings.size, crossover: settings.crossover };
            rest = speed === "watch" && !stepping ? REST_TICKS : 0;
            chartDirty = true;
            if (stepping) {
                stopStepping();
                setState("paused");
            }
        }

        // ----- Play, Pause, Step, Speed, Start over -----
        function setState(nextState) {
            state = nextState;
            status.set(nextState);
            playButton.setLabel(nextState === "running" ? "lab.kit.pause" : "lab.kit.play");
            playButton.setIcon(nextState === "running" ? "pause" : "play");
            // A disabled button drops the keyboard focus: hand it to Play
            if (nextState === "done" && document.activeElement === stepButton.element) playButton.element.focus();
            stepButton.setDisabled(nextState === "done" || mode === "draw");
            render(true);
        }

        // Stops the loop (and a Step that runs a whole generation)
        function halt() {
            loop.stop();
            stopStepping();
        }

        function stopStepping() {
            if (!stepping) return;
            stepping = false;
            loop.stop();
            stepButton.setBusy(false);
            loop.setRate(SPEEDS[speed]);
        }

        function togglePlay() {
            if (state === "running") {
                halt();
                setState("paused");
                return;
            }
            if (mode === "draw") cancelDraw();
            if (mode === "champion" && replay.over) startReplay();      // the champion drives again
            stopStepping();
            loop.setRate(mode === "champion" ? SPEEDS.watch : SPEEDS[speed]);
            setState("running");
            loop.start();
        }

        // Watch (and the champion): one tick. Fast and Turbo: the rest of this generation, or
        // the whole next one, as fast as the frame budget allows; then it pauses.
        function stepOnce() {
            if (stepping || mode === "draw") return;
            if (state === "running") halt();
            if (mode === "champion" || speed === "watch") {
                rest = 0;
                loop.step();
                if (state !== "done") setState("paused");
                return;
            }
            stepping = true;
            stepButton.setBusy(true);
            rest = 0;
            loop.setRate(SPEEDS.turbo);
            setState("running");
            loop.start();
        }

        function setSpeed(value) {
            speed = value;
            if (!stepping && mode !== "champion") loop.setRate(SPEEDS[speed]);
            if (speed !== "watch") rest = 0;
            render(true);
        }

        // New random brains from a new seed, on the same track
        function startOver() {
            if (mode === "draw") cancelDraw();
            if (mode === "champion") leaveChampion();
            const wasRunning = state === "running" && !stepping;
            halt();
            freshPopulation(kit.newSeed());
            ctx.announce(t("lab.evolve.newStart"));
            setState(wasRunning ? "running" : "ready");
            if (wasRunning) loop.start();
        }

        // The population size: before the first race it makes generation 1 again (from the
        // same seed); later the next generation gets the new size
        function setPopulation(value) {
            settings.population = Number(value);
            if (mode === "evolve" && state === "ready" && generation === 1 && race.ticks === 0 && !transfer) {
                freshPopulation(seed);
                render(true);
            }
        }

        // ----- Watch the champion: the best brain ever, alone on the track -----
        function toggleChampion() {
            if (mode === "champion") {
                leaveChampion();
                return;
            }
            if (!bestEver) return;
            if (mode === "draw") cancelDraw();
            halt();
            mode = "champion";
            championButton.setLabel("lab.evolve.back");
            championButton.setIcon("close");
            startReplay();
            loop.setRate(SPEEDS.watch);
            setState("running");
            loop.start();
        }

        function startReplay() {
            replay = newRace(track, [bestEver.weights]);
            replay.over = false;
            setNote(null);
        }

        function endReplay() {
            loop.stop();
            replay.over = true;
            const car = replay.cars[0];
            setNote(function () {
                return ["lab.evolve.championDone", { result: resultText(fitness(car)), time: secondsText(car.time) }];
            });
            ctx.announce(t("lab.evolve.championDone", { result: resultText(fitness(car)), time: secondsText(car.time) }));
            setState("done");
        }

        function leaveChampion() {
            loop.stop();
            mode = "evolve";
            replay = null;
            championButton.setLabel("lab.evolve.champion");
            championButton.setIcon("sparkle");
            loop.setRate(SPEEDS[speed]);
            setNote(null);
            setState(generation === 1 && race.ticks === 0 && !next ? "ready" : "paused");
        }

        // ----- Draw a track -----
        function startDrawing() {
            if (mode === "champion") leaveChampion();
            halt();
            mode = "draw";
            stroke = null;
            drawBox.hidden = false;
            drawProblem.hide();
            scene.box.classList.add("ev-drawing");
            setState(state === "running" ? "paused" : state);
        }

        function stopDrawing() {
            // The box is about to hide: if Cancel had the keyboard focus, the track select takes it
            if (drawBox.contains(document.activeElement)) trackSelect.select.focus();
            mode = "evolve";
            stroke = null;
            drawBox.hidden = true;
            scene.box.classList.remove("ev-drawing");
        }

        function cancelDraw() {
            stopDrawing();
            trackSelect.set(trackId);
            setState(state);
        }

        // A pointer position as a point of the world (kept inside the field)
        function worldPoint(event) {
            const box = scene.canvas.getBoundingClientRect();
            const fit = fitWorld(scene);
            return [
                clamp((event.clientX - box.left - fit.left) / fit.scale, 0, WORLD.width),
                clamp((event.clientY - box.top - fit.top) / fit.scale, 0, WORLD.height)
            ];
        }

        function onPointerDown(event) {
            if (mode !== "draw" || stroke || (event.pointerType === "mouse" && event.button !== 0)) return;
            event.preventDefault();
            stroke = { id: event.pointerId, points: [worldPoint(event)] };
            // keep getting this pointer's moves when it leaves the canvas
            if (scene.canvas.setPointerCapture) scene.canvas.setPointerCapture(event.pointerId);
            drawProblem.hide();
            render(true);
        }

        function onPointerMove(event) {
            if (!stroke || event.pointerId !== stroke.id) return;
            const point = worldPoint(event);
            const last = stroke.points[stroke.points.length - 1];
            if (Math.hypot(point[0] - last[0], point[1] - last[1]) < STROKE_STEP) return;
            stroke.points.push(point);
            render(true);
        }

        function onPointerUp(event) {
            if (!stroke || event.pointerId !== stroke.id) return;
            const points = stroke.points;
            stroke = null;
            finishDrawing(points);
        }

        function onPointerCancel(event) {
            if (!stroke || event.pointerId !== stroke.id) return;
            stroke = null;
            render(true);
        }

        // A finished drawing: a track to race on (saved as "My track"), or a kind hint and
        // the old track stays
        function finishDrawing(points) {
            const controls = drawingToControls(points);
            const problem = controls ? checkTrack(buildTrack(controls, DRAW.width)) : "tap";
            if (problem) {
                drawProblem.set(PROBLEMS[problem]);
                ctx.announce(t(PROBLEMS[problem]));
                render(true);
                return;
            }
            mine = { v: SAVE_VERSION, points: controls, width: DRAW.width };
            ctx.store.set("track", mine);
            delete built.mine;
            trackSelect.setOptions(trackOptions(), "mine");
            loadTrack("mine");
            setKey(trackNote, "lab.evolve.drawSaved");
            ctx.announce(t("lab.evolve.drawSaved"));
        }

        // ----- Texts -----
        // A key on an element: core writes it again after a language change
        function setKey(element, key) {
            element.setAttribute("data-i18n", key);
            element.innerHTML = t(key);
        }

        // The explain panel's note: a function that returns [key, values], asked again after
        // a language change (null hides the note)
        function setNote(make) {
            note = make;
            if (note) explain.setText.apply(null, note());
            else explain.setText(null);
        }

        function writeIdea() {
            fillSentence(idea, t("lab.evolve.ideaLine"), {
                gaLink: function () { return kit.termLink("genetic-algorithm", "lab.evolve.gaTerm"); },
                paramsLink: function () { return kit.termLink("parameters", "lab.evolve.paramsTerm"); },
                nnLink: function () { return kit.termLink("neural-network", "lab.evolve.nnTerm"); }
            });
        }

        // Brains kept from another track have raced here once: what they did, in the words that
        // fit. Brains that never finished a lap there had learned little (that is not
        // overfitting); trained brains still drive a lap here, or fail: that is overfitting.
        function writeTransfer() {
            let key = "lab.evolve.transferUntrained";
            if (transfer.lapped) key = transfer.result >= GATES ? "lab.evolve.transferWorks" : "lab.evolve.transfer";
            const text = t(key, { from: trackName(transfer.from), to: trackName(trackId), result: resultText(transfer.result) });
            fillSentence(transferNote, text, {
                overfitLink: function () { return kit.termLink("overfitting", "lab.evolve.overfitTerm"); }
            });
            transferNote.hidden = false;
        }

        // "1 lap and 14 gates" from a fitness (its whole part is the gates passed in order)
        function resultText(score) {
            const passed = Math.floor(score);
            const laps = Math.floor(passed / GATES);
            const gates = passed % GATES;
            if (laps === 0) return A.plural("lab.evolve.gates", gates);
            if (gates === 0) return A.plural("lab.evolve.laps", laps);
            return t("lab.evolve.lapsAndGates", { laps: A.plural("lab.evolve.laps", laps), gates: A.plural("lab.evolve.gates", gates) });
        }

        function secondsText(seconds) {
            return t("lab.evolve.seconds", { s: A.format.number(seconds, { digits: 1 }) });
        }

        function oneDecimal(value) {
            return A.format.number(value, { digits: 1 });
        }

        function legendItems() {
            const c = kit.colors();
            return [
                { labelKey: "lab.evolve.leader", color: kit.scale(1), shape: "triangle" },
                { labelKey: "lab.evolve.others", color: kit.scale(0.6), shape: "triangle" },
                { labelKey: "lab.evolve.stopped", color: kit.alpha(c.muted, 0.7), shape: "triangle" }
            ];
        }

        function hudText() {
            if (mode === "champion") return t("lab.evolve.hudChampion", { time: secondsText(replay.cars[0].time) });
            if (next) return t("lab.evolve.hudOver", { n: generation });
            return t("lab.evolve.hud", { n: generation, time: secondsText(race.ticks * TICK) });
        }

        // The canvas for screen readers: "Generation 7 on Oval. 12 of 40 cars still driving. ..."
        function describeText(shown, leader) {
            if (mode === "draw") return t("lab.evolve.describeDraw");
            const name = trackName(trackId);
            if (mode === "champion") return t("lab.evolve.describeChampion", { track: name, result: resultText(fitness(shown.cars[0])) });
            const best = Math.max(bestEver ? bestEver.fitness : 0, leader ? fitness(leader) : 0);
            return t(best >= 1 ? "lab.evolve.describe" : "lab.evolve.describeStart", {
                gen: generation,
                track: name,
                driving: A.plural("lab.evolve.drivingCount", shown.driving, { total: shown.cars.length }),
                result: resultText(best)
            });
        }

        // The car to follow: the best one still driving (else the best of the race)
        function leaderOf(shown) {
            let leader = null;
            let best = null;
            shown.cars.forEach(function (car) {
                if (car.state === "driving" && (!leader || fitness(car) > fitness(leader))) leader = car;
                if (!best || fitness(car) > fitness(best)) best = car;
            });
            return leader || best;
        }

        // ----- Drawing everything (once per frame while running) -----
        function render(force) {
            const now = performance.now();
            const c = kit.colors();
            const shown = mode === "champion" ? replay : race;
            const leader = leaderOf(shown);
            const glow = A.motion.ok();
            // the track's layer, drawn again only when something it shows has changed
            const key = [scene.width, scene.height, scene.dpr, c.theme, glow, trackId].join("|");
            if (key !== layerKey) {
                drawTrackLayer(layer, scene, track, c, glow);
                layerKey = key;
            }
            drawScene(scene, layer, {
                cars: shown.cars, leader: leader, hud: hudText(),
                drawing: mode === "draw", stroke: stroke, hereText: t("lab.evolve.drawHere")
            }, c);
            if (brainPanel.element.open && (force || now - lastBrain >= BRAIN_MS)) {
                drawBrain(brainView, leader, brainLabels(), c);
                lastBrain = now;
            }
            if (force || now - lastPaint >= (state === "running" ? PAINT_MS[speed] : 0)) {
                paintNumbers(shown, leader);
                lastPaint = now;
            }
            if (chartDirty && (force || state !== "running" || now - lastChart >= CHART_MS)) {
                chart.draw();
                chartDirty = false;
                lastChart = now;
            }
        }

        function brainLabels() {
            return { inputs: RAY_LABELS.concat(t("lab.evolve.speed")), outputs: [t("lab.evolve.steer"), t("lab.evolve.gas")] };
        }

        // The stat tiles, the explain panel and the canvas description
        function paintNumbers(shown, leader) {
            generationStat.set(generation);
            drivingStat.set(shown.driving + " / " + shown.cars.length);
            bestStat.set(bestEver ? bestEver.fitness : null);
            lapStat.set(bestLap);
            championButton.setDisabled(!bestEver && mode !== "champion");
            const rays = Array.prototype.map.call(leader.rays, function (value) { return A.format.number(value, { digits: 2 }); });
            explain.setValues(0, { rays: rays.join(" · ") });
            explain.setValues(2, { best: bestEver ? oneDecimal(bestEver.fitness) : "—" });
            explain.setValues(3, { rate: A.format.percent(settings.rate) });
            // the story follows the first generations: sensors, random brains, fitness, parents, evolution
            explain.setStep(state === "ready" && generation === 1 ? 0 : Math.min(generation, 4));
            scene.describe(describeText(shown, leader));
        }

        loadTrack(trackId, true);

        // ----- The controller: the hub calls these -----
        return {
            pause: function () {
                resumeOnShow = loop.running();
                loop.stop();
            },
            resume: function () {
                if (resumeOnShow && state === "running") loop.start();
                resumeOnShow = false;
            },
            language: function () {
                kit.relabel(stage);
                writeIdea();
                if (!transferNote.hidden) writeTransfer();
                setNote(note);
                chartDirty = true;
                render(true);
            },
            theme: function () {
                kit.colors.invalidate();
                layerKey = "";
                legend.update(legendItems());
                chartDirty = true;
                render(true);
            },
            destroy: function () {
                loop.stop();
                offMotion();
                scene.canvas.removeEventListener("pointerdown", onPointerDown);
                scene.canvas.removeEventListener("pointermove", onPointerMove);
                scene.canvas.removeEventListener("pointerup", onPointerUp);
                scene.canvas.removeEventListener("pointercancel", onPointerCancel);
                scene.destroy();
                chartView.destroy();
                brainView.destroy();
            },
            // For dev/tests/evolve.test.js (the hub doesn't use it)
            inspect: function () {
                return {
                    state: state, mode: mode, speed: speed, trackId: trackId, seed: seed, generation: generation,
                    cars: race.cars.length, driving: race.driving, ticks: race.ticks, ticksRun: ticksRun, resting: Boolean(next),
                    best: history.best.slice(), average: history.average.slice(), laps: history.laps.slice(),
                    bestEver: bestEver ? bestEver.fitness : null, bestLap: bestLap, firstLap: firstLap,
                    settings: Object.assign({}, settings), stuck: stuck, below: below, mine: Boolean(mine),
                    transfer: transfer ? Object.assign({}, transfer) : null,
                    replay: replay ? { over: replay.over, time: replay.cars[0].time, gates: replay.cars[0].gates } : null
                };
            }
        };
    }

    /* =========================================================
       8. A.lab.define
       ========================================================= */
    A.lab.define("evolve", {
        // The maths, for dev/tests/evolve.math.js (the hub doesn't use it)
        maths: {
            WORLD: WORLD, CAR: CAR, GATES: GATES, LAPS_TO_WIN: LAPS_TO_WIN, MAX_SECONDS: MAX_SECONDS, TICK: TICK,
            BRAIN_SIZE: BRAIN_SIZE, RAY_LENGTH: RAY_LENGTH, ELITE: ELITE, RATE: RATE, SIZE: SIZE, POPULATION: POPULATION, DRAW: DRAW,
            catmullRom: catmullRom, smoothLoop: smoothLoop, buildTrack: buildTrack, checkTrack: checkTrack,
            drawingToControls: drawingToControls, isTrackData: isTrackData, isSavedTrack: isSavedTrack,
            buildGrid: buildGrid, castRay: castRay, touchesWall: touchesWall,
            forward: forward, randomBrain: randomBrain, newCar: newCar, stepCar: stepCar, fitness: fitness,
            newRace: newRace, stepRace: stepRace, tournament: tournament, crossover: crossover, mutate: mutate,
            nextGeneration: nextGeneration
        },
        create: create
    });
})();
