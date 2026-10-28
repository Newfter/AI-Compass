/* =========================================================
   AI COMPASS — LAB: ROBOT IN A MAZE (reinforcement learning)
   A robot learns to find a battery in a maze by trial and error. Nobody
   tells it the way. After each move it gets a reward (every move costs a
   little, a battery gives +2 or +10, a pit −10) and updates its table of
   scores Q[square][move]: that is Q-learning. After many episodes the
   best scores lead the way, and the board shows them as colours and
   arrows. The user picks a maze or draws one, changes α, γ and ε, and
   can make the floor slippery.
   Its tests: dev/tests/maze.math.js (the maths, in Node) and
   dev/tests/maze.test.js (the page).

   Sections:
    1. Settings
    2. Small helpers
    3. The world: squares, moves and rewards
    4. The learner: Q-learning
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
    // ----- The world -----
    // Every move costs a little; a battery or a pit adds its reward and ends the episode.
    // (A preset can change these for its own maze: see js/content/lab/maze.js.)
    const REWARD = { move: -0.1, pit: -10, small: 2, big: 10 };
    const SLIP = 0.2;                    // slippery floor: a move slides sideways this often (half left, half right)
    const MAX_SIZE = { cols: 12, rows: 9 };   // the biggest maze
    const MOVES_PER_SQUARE = 4;          // an episode ends after 4 × (number of squares) moves
    // The four moves, clockwise, as steps along x and y: 0 up, 1 right, 2 down, 3 left.
    // So (a + 1) % 4 is a quarter turn to the right of move a, and (a + 3) % 4 to the left.
    const MOVES = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
    // The letters of a maze in js/content/lab/maze.js, and the tiles they stand for
    const LETTERS = { ".": "empty", "#": "wall", "x": "pit", "b": "small", "B": "big", "S": "start" };
    const TILES = ["empty", "wall", "pit", "small", "big", "start"];

    // ----- The learner (the sliders) -----
    const ALPHA = { min: 0.01, max: 1, step: 0.01, value: 0.5 };     // α, the learning rate
    const GAMMA = { min: 0, max: 0.99, step: 0.01, value: 0.9 };     // γ, how much the future counts
    const EPSILON = { min: 0, max: 1, step: 0.01, value: 0.2 };      // ε, how often to explore
    const SHRINK = 0.99;                 // "ε shrinks": ε × 0.99 after each episode...
    const EPSILON_FLOOR = 0.01;          // ...but not below this

    // ----- Running -----
    const SPEED = { watch: 6, fast: 60, turbo: 1000 };   // moves per second; Turbo: calls per second (see tick())
    const FRAME_MS = 7;                  // Turbo: a frame's script (moves and drawing) stays near 7 ms, inside the
                                         // lab's 8 ms budget; the moves get what the drawing leaves...
    const TURBO_BUDGET = 5;              // ...but at most 5 ms
    const BATCH = 32;                    // Turbo looks at the clock after every 32 moves
    const TURBO_PAINT_MS = 200;          // in Turbo the numbers and charts are written 5 times a second
    const SHOW_RATE = 6;                 // squares per second when "Show the best path" walks it
    const SLIDE = 0.6;                   // in Watch mode the robot slides for this part of a move's time, then rests
    const BUMP = 0.18;                   // ...and a bump into a wall nudges it this far (in squares)
    const TRAIL = 24;                    // the trail shows the robot's last 24 squares, fading

    // ----- The board -----
    const MAX_SQUARE = 84;               // px: the biggest square on a wide screen
    const BOARD_PAD = 6;                 // px of room around the board
    const MIN_SCALE = 1;                 // a square's colour: its value / the board's biggest value (but at least / 1)
    const TINT = 0.55;                   // how strong that colour is over the floor
    const SURE_GAP = 0.5;                // an arrow is fully drawn when its move beats the second best by this much
    const HOLE = "rgb(6, 8, 18)";        // the inside of a pit (and the robot's shadow): dark in both themes
    const SHINE = "rgb(255, 255, 255)";  // the light on a glass wall

    // ----- Numbers -----
    const DIGITS = 2;                    // the scores are written with 2 decimals
    const HISTORY = 400;                 // the charts show the last 400 episodes
    const AVERAGE = 10;                  // their bold line: the average of the last 10 episodes
    const RECENT = 20;                   // "Found a battery": the share of the last 20 episodes

    // ----- Challenges -----
    const SAFE_EPISODES = 200;           // challenge 2: this many episodes on the slippery floor first
    const PATIENT_EPISODES = 50;         // challenge 3: this many episodes since Forget (no lucky early path)
    const LOCK_IN = { episodes: 30, share: 0.2, gamma: 0.8 };   // challenge 4: 30 episodes with ε = 0
                                         // and γ ≥ 0.8, and fewer than 20 % of them reach the big battery

    // ----- Saving (ctx.store) -----
    const SAVE_VERSION = 1;              // "maze" = { v: 1, cols, rows, cells } (the user's own maze)
                                         // "settings" = { v: 1, preset, alpha, gamma, epsilon, shrink, slippery, layer, speed }
    const MINE = "mine";                 // the preset id of the user's own maze...
    const MINE_SEED = 1;                 // ...and its random numbers

    // ----- Words -----
    const TILE_KEYS = { empty: "lab.maze.empty", wall: "lab.maze.wall", pit: "lab.maze.pit", small: "lab.maze.small", big: "lab.maze.big", start: "lab.maze.start" };
    const END_KEYS = { big: "lab.maze.endBig", small: "lab.maze.endSmall", pit: "lab.maze.endPit", limit: "lab.maze.endLimit" };
    const DIRECTION_KEYS = ["lab.maze.dirUp", "lab.maze.dirRight", "lab.maze.dirDown", "lab.maze.dirLeft"];
    const DIRECTION_NAMES = ["lab.maze.up", "lab.maze.right", "lab.maze.down", "lab.maze.left"];
    const PATH_KEYS = { big: "lab.maze.pathBig", small: "lab.maze.pathSmall", pit: "lab.maze.pathPit", loop: "lab.maze.pathLoop", unknown: "lab.maze.pathUnknown" };

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    // TODO(kit): kit.icon(paths), the kit's <svg> wrapper for an icon that the kit doesn't
    // have. This experiment needs a pencil, a route, a flag and its tiles.
    function svgIcon(paths) {
        return '<svg class="lk-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' + paths + "</svg>";
    }

    const LINE = ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    const ICONS = {
        edit: svgIcon('<path d="M4.5 19.5l1-4.5L15.8 4.7a2.1 2.1 0 0 1 3 3L8.5 18.5zM13.8 6.7l3 3"' + LINE + "/>"),
        episode: svgIcon('<path d="M5 5.5v13l8-6.5z" fill="currentColor"/><path d="M16.5 19.5V5l4 2.5-4 2.5"' + LINE + "/>"),
        route: svgIcon('<circle cx="6" cy="18" r="2.3" fill="currentColor"/><circle cx="18" cy="6" r="2.3" fill="currentColor"/><path d="M8.5 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.5"' + LINE + "/>"),
        wall: svgIcon('<rect x="3.5" y="5" width="17" height="14" rx="2"' + LINE + '/><path d="M3.5 12h17M9 5v7M15 12v7"' + LINE + "/>"),
        pit: svgIcon('<rect x="3.5" y="3.5" width="17" height="17" rx="3"' + LINE + '/><path d="M7.5 16.5l9-9M4 12l8-8M12 20l8-8"' + LINE + "/>"),
        small: svgIcon('<rect x="8" y="6" width="8" height="14" rx="2"' + LINE + '/><path d="M10.5 4h3"' + LINE + '/><rect x="10" y="14.5" width="4" height="3.5" rx="1" fill="currentColor"/>'),
        big: svgIcon('<rect x="6.5" y="5.5" width="11" height="15.5" rx="2.5"' + LINE + '/><path d="M10 3.5h4"' + LINE + '/><path d="M13 8.5l-3.5 5h3l-1.5 4.5 4-6h-3z" fill="currentColor"/>'),
        start: svgIcon('<path d="M6 21V4"' + LINE + '/><path d="M6 4.5h11l-2.5 4 2.5 4H6"' + LINE + "/>"),
        eraser: svgIcon('<path d="M9 20h11M4.8 14.2l8.5-8.5a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L10 19.5H7.6z"' + LINE + '/><path d="M9 10l5 5"' + LINE + "/>")
    };

    // "+2", "−10", "−0.1": a reward with its sign, written the local way
    function signed(value) {
        return (value > 0 ? "+" : "") + A.format.number(value);
    }

    // A score with 2 decimals: "1.20" ("1,20" in Russian)
    function score(value) {
        return A.format.number(value, { digits: DIGITS });
    }

    // A score inside a sum, in brackets when it is negative: "× (−1.20)"
    function term(value) {
        return value < 0 ? "(" + score(value) + ")" : score(value);
    }

    function round2(value) {
        return Math.round(value * 100) / 100;
    }

    // The average of the last n numbers of a list
    function averageOfLast(list, n) {
        const from = Math.max(0, list.length - n);
        let sum = 0;
        for (let i = from; i < list.length; i++) sum += list[i];
        return sum / (list.length - from);
    }

    // A tile's name inside a sentence: "wall", "small battery"
    function tileText(tile) {
        return t(TILE_KEYS[tile]).toLowerCase();
    }

    let instances = 0;                   // experiments opened so far (for unique element ids)

    // Writes a text only when it changed (no work for the page when nothing is new)
    function setText(element, text) {
        if (element.textContent !== text) element.textContent = text;
    }

    /* =========================================================
       3. THE WORLD: SQUARES, MOVES AND REWARDS
       A world is { cols, rows, cells, start, slippery, rewards }. cells[s]
       is the tile of square s. Squares are counted row by row from the
       top left, so square s is in row floor(s / cols), column s % cols.
       ========================================================= */
    function makeWorld(cols, rows, cells, rewards) {
        return {
            cols: cols,
            rows: rows,
            cells: cells.slice(),
            start: cells.indexOf("start"),
            slippery: false,
            rewards: Object.assign({}, REWARD, rewards)
        };
    }

    // A world from the rows of letters of a preset ("S..#", see js/content/lab/maze.js)
    function worldFromRows(lines, rewards) {
        const cells = [];
        lines.forEach(function (line) {
            line.split("").forEach(function (letter) { cells.push(LETTERS[letter] || "empty"); });
        });
        return makeWorld(lines[0].length, lines.length, cells, rewards);
    }

    // Batteries and pits end the episode
    function isEnd(tile) {
        return tile === "pit" || tile === "small" || tile === "big";
    }

    function rowOf(world, s) {
        return Math.floor(s / world.cols);
    }

    function colOf(world, s) {
        return s % world.cols;
    }

    // The square that move a leads to from square s. At a wall or the edge the robot stays put.
    function target(world, s, a) {
        const x = colOf(world, s) + MOVES[a].x;
        const y = rowOf(world, s) + MOVES[a].y;
        if (x < 0 || y < 0 || x >= world.cols || y >= world.rows) return s;
        const next = y * world.cols + x;
        return world.cells[next] === "wall" ? s : next;
    }

    // One move a from square s. On a slippery floor it goes a quarter turn to the left with
    // probability SLIP / 2, and to the right with SLIP / 2. The reward is the cost of the move,
    // plus the battery's or the pit's reward when the robot lands on one (that ends the episode).
    // -> { next, reward, done, actual }   (actual: the move that really happened)
    function step(world, s, a, random) {
        let actual = a;
        if (world.slippery) {
            const roll = random.next();
            if (roll < SLIP / 2) actual = (a + 3) % 4;
            else if (roll < SLIP) actual = (a + 1) % 4;
        }
        const next = target(world, s, actual);
        const tile = world.cells[next];
        const done = isEnd(tile);
        return { next: next, reward: world.rewards.move + (done ? world.rewards[tile] : 0), done: done, actual: actual };
    }

    // An episode ends after this many moves, if no battery or pit ended it before
    function episodeLimit(world) {
        return MOVES_PER_SQUARE * world.cells.length;
    }

    // The fewest moves from the start to a battery (a breadth-first search: all squares 1 move
    // away, then 2, ...), or -1 when no battery can be reached. Paths don't go through pits or
    // batteries, because those end the episode.
    function shortestPath(world) {
        const distance = world.cells.map(function () { return -1; });
        const queue = [world.start];
        distance[world.start] = 0;
        for (let i = 0; i < queue.length; i++) {
            const s = queue[i];
            const tile = world.cells[s];
            if (tile === "small" || tile === "big") return distance[s];
            if (isEnd(tile)) continue;
            for (let a = 0; a < 4; a++) {
                const next = target(world, s, a);
                if (distance[next] === -1) {
                    distance[next] = distance[s] + 1;
                    queue.push(next);
                }
            }
        }
        return -1;
    }

    // How many moves of a path could slide into a pit on a slippery floor
    function riskyMoves(world, path) {
        let risky = 0;
        path.moves.forEach(function (a, i) {
            const s = path.cells[i];
            if (world.cells[target(world, s, (a + 3) % 4)] === "pit" || world.cells[target(world, s, (a + 1) % 4)] === "pit") risky += 1;
        });
        return risky;
    }

    // Edit mode: puts a tile on square s. There is always exactly one start: painting the
    // start moves it, and the start's own square can't be painted over. -> true if it changed
    function paintSquare(world, s, tile) {
        const old = world.cells[s];
        if (old === tile || old === "start") return false;
        if (tile === "start") {
            world.cells[world.start] = "empty";
            world.start = s;
        }
        world.cells[s] = tile;
        return true;
    }

    // Is this a maze that we saved? { v: 1, cols, rows, cells: [tile names] }, with one start
    function isSavedMaze(value) {
        if (!value || value.v !== SAVE_VERSION || !Array.isArray(value.cells)) return false;
        if (!Number.isInteger(value.cols) || !Number.isInteger(value.rows)) return false;
        if (value.cols < 2 || value.rows < 2 || value.cols > MAX_SIZE.cols || value.rows > MAX_SIZE.rows) return false;
        if (value.cells.length !== value.cols * value.rows) return false;
        if (!value.cells.every(function (tile) { return TILES.indexOf(tile) !== -1; })) return false;
        return value.cells.filter(function (tile) { return tile === "start"; }).length === 1;
    }

    // Are these settings that we saved?
    function isSavedSettings(value) {
        function inRange(x, range) {
            return typeof x === "number" && x >= range.min && x <= range.max;
        }
        return Boolean(value) && value.v === SAVE_VERSION && typeof value.preset === "string" &&
            inRange(value.alpha, ALPHA) && inRange(value.gamma, GAMMA) && inRange(value.epsilon, EPSILON) &&
            typeof value.shrink === "boolean" && typeof value.slippery === "boolean" && typeof value.layer === "boolean" &&
            Object.prototype.hasOwnProperty.call(SPEED, value.speed);
    }

    /* =========================================================
       4. THE LEARNER: Q-LEARNING
       Q[s][a] is the robot's score for move a in square s: how much
       reward it expects to collect from there on, if it makes that move
       and then keeps making its best moves. All scores start at 0.
       ========================================================= */
    function newTable(world) {
        return world.cells.map(function () { return [0, 0, 0, 0]; });
    }

    function bestScore(values) {
        return Math.max(values[0], values[1], values[2], values[3]);
    }

    // Nothing learned in this square yet: all four scores are still the same
    function undecided(values) {
        return values[0] === values[1] && values[1] === values[2] && values[2] === values[3];
    }

    // ε-greedy: with probability ε a random move (exploring), otherwise the move with the best
    // score (using what it knows). Equal best scores are a tie: the seeded random numbers pick.
    // -> { action, explore }
    function chooseAction(values, epsilon, random) {
        if (random.next() < epsilon) return { action: random.int(4), explore: true };
        const top = bestScore(values);
        const ties = [];
        for (let a = 0; a < 4; a++) {
            if (values[a] === top) ties.push(a);
        }
        return { action: ties.length === 1 ? ties[0] : ties[random.int(ties.length)], explore: false };
    }

    // The Q-learning update of one score:
    //     new = old + α · (reward + γ · bestNext − old)
    // bestNext is the best score of the square the robot reached: what it expects to collect
    // from there on (0 when the episode ended there). The score moves a step α of the way
    // towards "this reward, plus the future counted with γ".
    function qUpdate(old, reward, bestNext, alpha, gamma) {
        return old + alpha * (reward + gamma * bestNext - old);
    }

    // One move of training: choose, move, update. learner = { alpha, gamma, epsilon }.
    // -> everything that happened, for the inspector and the "What's happening?" panel
    function learnMove(world, Q, s, learner, random) {
        const choice = chooseAction(Q[s], learner.epsilon, random);
        const moved = step(world, s, choice.action, random);
        const old = Q[s][choice.action];
        const bestNext = moved.done ? 0 : bestScore(Q[moved.next]);
        const value = qUpdate(old, moved.reward, bestNext, learner.alpha, learner.gamma);
        Q[s][choice.action] = value;
        return {
            s: s, action: choice.action, explore: choice.explore, actual: moved.actual,
            next: moved.next, reward: moved.reward, done: moved.done,
            old: old, bestNext: bestNext, value: value, alpha: learner.alpha, gamma: learner.gamma
        };
    }

    // The robot's plan: from the start, always the move with the best score (no exploring,
    // no slipping, no learning). Equal best scores: the first of up, right, down, left.
    // -> { cells, moves, end }   end: "small" | "big" | "pit", or "loop" (it would walk in a
    // circle or into a wall), or "unknown" (a square where all four scores are still equal)
    function greedyPath(Q, world) {
        const cells = [world.start];
        const moves = [];
        const visited = world.cells.map(function () { return false; });
        visited[world.start] = true;
        let s = world.start;
        for (let i = 0; i < world.cells.length; i++) {
            const values = Q[s];
            if (undecided(values)) return { cells: cells, moves: moves, end: "unknown" };
            const a = values.indexOf(bestScore(values));
            const next = target(world, s, a);
            if (visited[next]) return { cells: cells, moves: moves, end: "loop" };
            visited[next] = true;
            cells.push(next);
            moves.push(a);
            if (isEnd(world.cells[next])) return { cells: cells, moves: moves, end: world.cells[next] };
            s = next;
        }
        return { cells: cells, moves: moves, end: "loop" };
    }

    // A path that ends at a battery
    function reachesBattery(path) {
        return path.end === "small" || path.end === "big";
    }

    /* =========================================================
       5. DRAWING THE BOARD
       The tiles are drawn once into a hidden canvas (they only change with
       the maze, the size or the theme); each frame copies it and draws the
       learned colours and arrows, the best path, the trail and the robot.
       ========================================================= */
    // Where the board sits on the canvas: the size of a square and the top-left corner
    function boardGeometry(view, world) {
        const size = Math.max(4, Math.floor(Math.min((view.width - 2 * BOARD_PAD) / world.cols, (view.height - 2 * BOARD_PAD) / world.rows)));
        return {
            size: size,
            left: Math.round((view.width - size * world.cols) / 2),
            top: Math.round((view.height - size * world.rows) / 2)
        };
    }

    // The middle of square s
    function centerOf(geo, world, s) {
        return { x: geo.left + (colOf(world, s) + 0.5) * geo.size, y: geo.top + (rowOf(world, s) + 0.5) * geo.size };
    }

    // The rounded square of a tile, a little smaller than its square
    function tilePath(g, geo, world, s, inset) {
        const x = geo.left + colOf(world, s) * geo.size;
        const y = geo.top + rowOf(world, s) * geo.size;
        A.canvas.roundRect(g, x + inset, y + inset, geo.size - 2 * inset, geo.size - 2 * inset, geo.size * 0.16);
    }

    // A wall: a block of tinted glass with light on its top half
    function drawWall(g, geo, world, s, c) {
        const x = geo.left + colOf(world, s) * geo.size;
        const y = geo.top + rowOf(world, s) * geo.size;
        const glass = g.createLinearGradient(x, y, x, y + geo.size);
        glass.addColorStop(0, kit.alpha(c.accent, c.light ? 0.45 : 0.5));
        glass.addColorStop(1, kit.alpha(c.accent, c.light ? 0.25 : 0.22));
        tilePath(g, geo, world, s, 1);
        g.fillStyle = glass;
        g.fill();
        g.lineWidth = 1;
        g.strokeStyle = kit.alpha(c.accent, c.light ? 0.75 : 0.7);
        g.stroke();
        A.canvas.roundRect(g, x + 3.5, y + 3.5, geo.size - 7, geo.size * 0.32, geo.size * 0.1);
        g.fillStyle = kit.alpha(SHINE, c.light ? 0.4 : 0.12);
        g.fill();
    }

    // A pit: a dark hole with a hazard stripe around it
    function drawPit(g, geo, world, s, c) {
        const x = geo.left + colOf(world, s) * geo.size;
        const y = geo.top + rowOf(world, s) * geo.size;
        const size = geo.size;
        g.save();
        tilePath(g, geo, world, s, 1.5);
        g.clip();
        g.fillStyle = c.warning;
        g.fillRect(x, y, size, size);
        g.strokeStyle = HOLE;
        g.lineWidth = size / 10;
        g.beginPath();
        for (let k = -size; k < size; k += size / 4) {
            g.moveTo(x + k, y + size);
            g.lineTo(x + k + size, y);
        }
        g.stroke();
        A.canvas.roundRect(g, x + size * 0.2, y + size * 0.2, size * 0.6, size * 0.6, size * 0.14);
        g.fillStyle = HOLE;
        g.fill();
        g.restore();
    }

    // A battery: a small one is a third full, a big one is full and has a lightning bolt.
    // glow: a soft light around it (not in calm mode)
    function drawBattery(g, geo, world, s, c, big, glow) {
        const p = centerOf(geo, world, s);
        const size = geo.size;
        const w = size * (big ? 0.36 : 0.26);
        const h = size * (big ? 0.52 : 0.38);
        const x = p.x - w / 2;
        const y = p.y - h / 2 + size * 0.04;
        if (glow) {
            const light = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * (big ? 0.5 : 0.36));
            light.addColorStop(0, kit.alpha(c.success, big ? 0.42 : 0.3));
            light.addColorStop(1, kit.alpha(c.success, 0));
            g.fillStyle = light;
            g.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        }
        g.fillStyle = c.success;
        A.canvas.roundRect(g, p.x - w * 0.22, y - size * 0.07, w * 0.44, size * 0.08, 1.5);
        g.fill();
        g.lineWidth = Math.max(1.5, size * 0.045);
        g.strokeStyle = c.success;
        A.canvas.roundRect(g, x, y, w, h, w * 0.2);
        g.stroke();
        const pad = g.lineWidth + 1;
        const charge = (h - 2 * pad) * (big ? 1 : 0.4);
        A.canvas.roundRect(g, x + pad, y + h - pad - charge, w - 2 * pad, charge, 2);
        g.fillStyle = kit.alpha(c.success, 0.85);
        g.fill();
        if (big) {
            const u = h;
            const cy = y + h / 2;
            g.beginPath();
            g.moveTo(p.x + 0.06 * u, cy - 0.27 * u);
            g.lineTo(p.x - 0.12 * u, cy + 0.04 * u);
            g.lineTo(p.x - 0.01 * u, cy + 0.04 * u);
            g.lineTo(p.x - 0.06 * u, cy + 0.27 * u);
            g.lineTo(p.x + 0.12 * u, cy - 0.06 * u);
            g.lineTo(p.x + 0.01 * u, cy - 0.06 * u);
            g.closePath();
            g.fillStyle = c.surface;
            g.fill();
        }
    }

    // Every tile of the maze, on the hidden canvas
    function drawTiles(g, geo, world, c, glow) {
        g.fillStyle = kit.alpha(c.text, 0.03);
        A.canvas.roundRect(g, geo.left - 4, geo.top - 4, geo.size * world.cols + 8, geo.size * world.rows + 8, 14);
        g.fill();
        world.cells.forEach(function (tile, s) {
            if (tile === "wall") {
                drawWall(g, geo, world, s, c);
                return;
            }
            if (tile === "pit") {
                drawPit(g, geo, world, s, c);
                return;
            }
            tilePath(g, geo, world, s, 1.5);
            g.fillStyle = kit.alpha(c.text, c.light ? 0.06 : 0.05);
            g.fill();
            if (tile === "small" || tile === "big") drawBattery(g, geo, world, s, c, tile === "big", glow);
        });
    }

    // The start: a dashed pad
    function drawStart(g, geo, world, c) {
        const p = centerOf(geo, world, world.start);
        g.beginPath();
        g.arc(p.x, p.y, geo.size * 0.34, 0, 2 * Math.PI);
        g.fillStyle = kit.alpha(c.accent2, 0.12);
        g.fill();
        g.lineWidth = Math.max(1.5, geo.size * 0.05);
        g.setLineDash([geo.size * 0.12, geo.size * 0.08]);
        g.strokeStyle = kit.alpha(c.accent2, 0.85);
        g.stroke();
        g.setLineDash([]);
    }

    // An arrow in the middle of a square, pointing along move a: a line and a head
    function drawArrow(g, x, y, a, size, color) {
        const half = size * 0.2;
        const wing = size * 0.1;
        const dx = MOVES[a].x;
        const dy = MOVES[a].y;
        const tipX = x + dx * half;
        const tipY = y + dy * half;
        g.beginPath();
        g.moveTo(x - dx * half, y - dy * half);
        g.lineTo(tipX, tipY);
        g.moveTo(tipX - dx * wing - dy * wing, tipY - dy * wing + dx * wing);
        g.lineTo(tipX, tipY);
        g.lineTo(tipX - dx * wing + dy * wing, tipY - dy * wing - dx * wing);
        g.lineWidth = Math.max(2, size * 0.055);
        g.lineCap = "round";
        g.lineJoin = "round";
        g.strokeStyle = color;
        g.stroke();
    }

    // A square that has scores (not a wall, not the end of an episode) and was explored
    function explored(world, Q, s) {
        const values = Q[s];
        return world.cells[s] !== "wall" && !isEnd(world.cells[s]) && !(undecided(values) && values[0] === 0);
    }

    // The biggest value (best score) on the board, but at least MIN_SCALE: the colours compare
    // each square with the best one, so the way to the battery shows from light to strong
    function valueScale(world, Q) {
        let biggest = MIN_SCALE;
        Q.forEach(function (values, s) {
            if (explored(world, Q, s)) biggest = Math.max(biggest, Math.abs(bestScore(values)));
        });
        return biggest;
    }

    // What it learned: each explored square tinted by its value (its best score), and the
    // arrow of its best move, clearer the more that move beats the second best
    function drawValues(g, geo, world, Q, c) {
        const scale = valueScale(world, Q);
        world.cells.forEach(function (tile, s) {
            const values = Q[s];
            if (!explored(world, Q, s)) return;
            const best = values.indexOf(bestScore(values));
            let second = -Infinity;
            for (let a = 0; a < 4; a++) {
                if (a !== best) second = Math.max(second, values[a]);
            }
            g.globalAlpha = TINT;
            tilePath(g, geo, world, s, 1.5);
            g.fillStyle = kit.diverge(values[best] / scale);
            g.fill();
            g.globalAlpha = 1;
            const sure = Math.min(1, (values[best] - second) / SURE_GAP);
            const p = centerOf(geo, world, s);
            drawArrow(g, p.x, p.y, best, geo.size, kit.alpha(c.text, Math.round((0.2 + 0.8 * sure) * 20) / 20));
        });
    }

    // The best path being shown: a line through the first "shown" squares. A cross at its
    // end when it doesn't reach a battery.
    function drawRoute(g, geo, world, route, c, glow) {
        const count = Math.min(route.shown, route.cells.length);
        g.save();
        g.lineWidth = Math.max(3, geo.size * 0.12);
        g.lineCap = "round";
        g.lineJoin = "round";
        g.strokeStyle = kit.alpha(c.accent3, 0.85);
        if (glow) {
            g.shadowColor = c.accent3;
            g.shadowBlur = geo.size * 0.3;
        }
        g.beginPath();
        for (let i = 0; i < count; i++) {
            const p = centerOf(geo, world, route.cells[i]);
            if (i === 0) g.moveTo(p.x, p.y);
            else g.lineTo(p.x, p.y);
        }
        g.stroke();
        g.restore();
        const tip = centerOf(geo, world, route.cells[count - 1]);
        kit.marker(g, "dot", tip.x, tip.y, Math.max(4, geo.size * 0.12), c.accent3);
        if (count === route.cells.length && !reachesBattery(route)) {
            const r = geo.size * 0.16;
            g.beginPath();
            g.moveTo(tip.x - r, tip.y - r);
            g.lineTo(tip.x + r, tip.y + r);
            g.moveTo(tip.x + r, tip.y - r);
            g.lineTo(tip.x - r, tip.y + r);
            g.lineWidth = Math.max(2.5, geo.size * 0.07);
            g.strokeStyle = c.danger;
            g.stroke();
        }
    }

    // The robot's last squares as dots that fade
    function drawTrail(g, geo, world, trail, c) {
        trail.forEach(function (s, i) {
            const p = centerOf(geo, world, s);
            g.beginPath();
            g.arc(p.x, p.y, Math.max(2, geo.size * 0.07), 0, 2 * Math.PI);
            g.fillStyle = kit.alpha(c.accent2, Math.round((12 * (i + 1)) / trail.length) / 20);
            g.fill();
        });
    }

    // The robot: a small friendly droid. mood: "happy" (on a battery), "sad" (in a pit) or
    // "normal". glow: its antenna light shines (not in calm mode).
    function drawRobot(g, x, y, size, c, mood, glow) {
        const u = size * 0.8;
        const eye = c.light ? c.accent : c.accent2;
        const light = mood === "happy" ? c.success : mood === "sad" ? c.danger : c.accent2;
        g.save();
        // shadow and wheels
        g.beginPath();
        g.ellipse(x, y + u * 0.4, u * 0.3, u * 0.06, 0, 0, 2 * Math.PI);
        g.fillStyle = kit.alpha(HOLE, 0.3);
        g.fill();
        g.fillStyle = kit.alpha(c.text, 0.65);
        A.canvas.roundRect(g, x - u * 0.25, y + u * 0.25, u * 0.17, u * 0.12, u * 0.04);
        g.fill();
        A.canvas.roundRect(g, x + u * 0.08, y + u * 0.25, u * 0.17, u * 0.12, u * 0.04);
        g.fill();
        // antenna
        g.strokeStyle = c.text;
        g.lineWidth = Math.max(1.5, u * 0.045);
        g.beginPath();
        g.moveTo(x, y - u * 0.16);
        g.lineTo(x, y - u * 0.32);
        g.stroke();
        if (glow) {
            const halo = g.createRadialGradient(x, y - u * 0.36, 0, x, y - u * 0.36, u * 0.18);
            halo.addColorStop(0, kit.alpha(light, 0.6));
            halo.addColorStop(1, kit.alpha(light, 0));
            g.fillStyle = halo;
            g.fillRect(x - u * 0.2, y - u * 0.56, u * 0.4, u * 0.4);
        }
        g.beginPath();
        g.arc(x, y - u * 0.36, u * 0.065, 0, 2 * Math.PI);
        g.fillStyle = light;
        g.fill();
        // body, ears and visor
        g.fillStyle = c.text;
        A.canvas.roundRect(g, x - u * 0.3, y - u * 0.17, u * 0.6, u * 0.45, u * 0.14);
        g.fill();
        g.fillStyle = c.accent;
        g.beginPath();
        g.arc(x - u * 0.31, y + u * 0.04, u * 0.05, 0, 2 * Math.PI);
        g.arc(x + u * 0.31, y + u * 0.04, u * 0.05, 0, 2 * Math.PI);
        g.fill();
        g.fillStyle = c.surface;
        A.canvas.roundRect(g, x - u * 0.22, y - u * 0.08, u * 0.44, u * 0.23, u * 0.09);
        g.fill();
        // eyes: round, happy arcs, or crosses
        g.strokeStyle = eye;
        g.fillStyle = eye;
        g.lineWidth = Math.max(1.2, u * 0.04);
        g.lineCap = "round";
        [-1, 1].forEach(function (side) {
            const ex = x + side * u * 0.1;
            const ey = y + u * 0.035;
            const r = u * 0.045;
            g.beginPath();
            if (mood === "happy") {
                g.arc(ex, ey + r * 0.5, r, Math.PI, 2 * Math.PI);
                g.stroke();
            } else if (mood === "sad") {
                g.moveTo(ex - r, ey - r);
                g.lineTo(ex + r, ey + r);
                g.moveTo(ex + r, ey - r);
                g.lineTo(ex - r, ey + r);
                g.stroke();
            } else {
                g.arc(ex, ey, r, 0, 2 * Math.PI);
                g.fill();
            }
        });
        g.restore();
    }

    // The selected square (the keyboard cursor)
    function drawCursor(g, geo, world, s, c) {
        tilePath(g, geo, world, s, 0.5);
        g.lineWidth = 2.5;
        g.strokeStyle = c.text;
        g.stroke();
    }

    /* =========================================================
       6. THE EXPERIMENT
       ========================================================= */
    A.lab.define("maze", {
        // The maths, for dev/tests/maze.math.js (the hub doesn't use it)
        maths: {
            REWARD: REWARD, SLIP: SLIP, MOVES: MOVES, worldFromRows: worldFromRows, makeWorld: makeWorld,
            target: target, step: step, episodeLimit: episodeLimit, shortestPath: shortestPath, riskyMoves: riskyMoves,
            paintSquare: paintSquare, isSavedMaze: isSavedMaze, isSavedSettings: isSavedSettings,
            newTable: newTable, chooseAction: chooseAction, qUpdate: qUpdate, learnMove: learnMove, greedyPath: greedyPath,
            SHRINK: SHRINK, EPSILON_FLOOR: EPSILON_FLOOR, LOCK_IN: LOCK_IN
        },

        create: function (stage, ctx) {
            const presets = A.content.get("lab.maze").presets;

            // ----- Saved things (checked: saved data can be old, broken or edited by hand) -----
            let myMaze = ctx.store.get("maze", null, isSavedMaze);
            const saved = ctx.store.get("settings", null, isSavedSettings);

            // A preset by its id ("mine" is the user's own maze); an unknown id gives the first
            function presetById(id) {
                if (id === MINE && myMaze) return { id: MINE, labelKey: "lab.maze.presetMine", aboutKey: "lab.maze.aboutMine", seed: MINE_SEED };
                return presets.filter(function (p) { return p.id === id; })[0] || presets[0];
            }

            // ----- State. state: "ready" | "running" | "paused" | "done" -----
            let preset = presetById(saved ? saved.preset : "");
            const initial = saved || {
                alpha: preset.alpha, gamma: preset.gamma, epsilon: preset.epsilon,
                shrink: preset.shrink, slippery: preset.slippery, layer: true, speed: "watch"
            };
            const learner = { alpha: initial.alpha, gamma: initial.gamma, epsilon: initial.epsilon };
            let epsilonStart = initial.epsilon;  // the ε the user chose (ε shrinks from here; Forget goes back)
            let shrink = initial.shrink;
            let layer = initial.layer;
            let speed = initial.speed;
            let world = null;
            let worldVersion = 0;             // changes with the maze (the hidden canvas of tiles follows)
            let Q = null;
            let random = null;
            let shortest = -1;
            let state = "ready";
            let s = 0;                        // the robot's square
            let from = 0;                     // the square it came from (Watch mode slides from there)
            let bump = -1;                    // the move that bumped into a wall, or -1
            let moves = 0;                    // moves in this episode
            let episode = 0;                  // the number of the episode in progress (or just finished)
            let episodeReward = 0;
            let episodeOver = true;           // the next move starts a new episode at the start
            let lastEnd = null;               // how the last episode ended: "big", "small", "pit" or "limit"
            let lastMoves = 0;
            let last = null;                  // the last move and its update (learnMove's record)
            let history = null;               // per finished episode, for the charts and the stats
            let sinceForget = null;           // challenge 4: { episodes, big, greedy }
            let slipperyEpisodes = 0;         // challenge 2: episodes on the slippery floor since Forget
            const trail = [];
            let route = null;                 // the best path being shown: { cells, moves, end, shown }
            let showing = false;              // the loop walks the best path (no learning)
            let stopAtEpisodeEnd = false;     // "Run 1 episode"
            let note = null;                  // () -> [key, values]: the sentence under "What's happening?"
            let editing = false;
            let armed = false;                // "Edit the maze" was pressed once: the warning shows
            let tool = "wall";
            let painting = false;             // a mouse button is down in edit mode
            let selected = 0;                 // the square in the inspector (the keyboard cursor)
            let showCursor = false;           // the cursor is drawn once the user picks a square
            let tileCache = null;             // { key, image }: the tiles, drawn once
            let dirty = true;                 // the numbers on the page need writing again
            let lastPaint = 0;
            let resumeOnShow = false;         // running when the hub paused us
            const turbo = { ms: TURBO_BUDGET, rest: 1, start: 0, moves: 0 };   // Turbo's time per frame (ms):
                                              // for moves, for the rest of the frame (a running average),
                                              // when this frame's moves started and how long they took

            // ----- The page: kit parts, plus the inspector's small grid -----
            const ui = kit.layout(stage, { side: true });
            ui.root.classList.add("mz-root");

            const presetSelect = kit.select({ labelKey: "lab.kit.presets", options: presetOptions(), value: preset.id, onChange: choosePreset });
            const editButton = kit.button("lab.maze.edit", { icon: ICONS.edit, pressed: false, onClick: toggleEdit });
            const about = document.createElement("p");
            about.className = "mz-about";
            instances += 1;
            about.id = "mz-about-" + instances;
            presetSelect.select.setAttribute("aria-describedby", about.id);
            const askHint = kit.hint({ key: "lab.maze.editAsk", tone: "warn" });
            askHint.hide();
            const noWayHint = kit.hint({ key: "lab.maze.noWay", tone: "info" });
            noWayHint.hide();
            const toolPicker = kit.segmented({
                labelKey: "lab.maze.tool",
                options: [
                    { value: "wall", labelKey: "lab.maze.wall", icon: ICONS.wall },
                    { value: "pit", labelKey: "lab.maze.pit", icon: ICONS.pit },
                    { value: "small", labelKey: "lab.maze.small", icon: ICONS.small },
                    { value: "big", labelKey: "lab.maze.big", icon: ICONS.big },
                    { value: "start", labelKey: "lab.maze.start", icon: ICONS.start },
                    { value: "empty", labelKey: "lab.maze.eraser", icon: ICONS.eraser }
                ],
                value: tool,
                onChange: function (value) { tool = value; }
            });
            const editBox = document.createElement("div");
            editBox.className = "mz-edit";
            editBox.hidden = true;
            editBox.append(toolPicker.element, kit.hint({ key: "lab.maze.editHelp", tone: "tip" }).element);

            const playButton = kit.button("lab.kit.play", { icon: "play", variant: "primary", onClick: togglePlay });
            const stepButton = kit.button("lab.kit.step", { icon: "step", onClick: stepOnce });
            const episodeButton = kit.button("lab.maze.runEpisode", { icon: ICONS.episode, onClick: runEpisode });
            const pathButton = kit.button("lab.maze.bestPath", { icon: ICONS.route, onClick: showBestPath });
            const forgetButton = kit.button("lab.maze.forget", { icon: "reset", variant: "subtle", onClick: function () { forget(true); } });
            const status = kit.status("ready");

            // Above the board: the maze to train on, and the training buttons
            ui.top.append(presetSelect.element, about, kit.toolbar([playButton, stepButton, episodeButton, status]));

            // The board: a canvas that the keyboard can reach (its label says how)
            const scene = kit.canvas(ui.main, {
                aspect: 1,
                labelKey: function () { return t(editing ? "lab.maze.canvasEdit" : "lab.maze.canvas"); }
            });
            scene.box.classList.add("mz-board");
            scene.canvas.tabIndex = 0;
            scene.canvas.setAttribute("role", "application");
            const legend = kit.legend([]);
            const stats = {
                episode: kit.stat({ labelKey: "lab.maze.statEpisode", value: 0 }),
                moves: kit.stat({ labelKey: "lab.maze.statMoves", value: 0 }),
                found: kit.stat({ labelKey: "lab.maze.statFound", format: function (v) { return A.format.percent(v); } }),
                best: kit.stat({ labelKey: "lab.maze.statBest" })
            };
            const inspector = makeInspector();
            // Under the board: what to do with the board, the edit tools, then the numbers
            ui.main.append(
                kit.toolbar([pathButton, forgetButton, editButton]),
                askHint.element,
                editBox,
                noWayHint.element,
                legend.element,
                kit.row([stats.episode, stats.moves, stats.found, stats.best], { grid: true }),
                kit.group("lab.maze.inspector", [inspector.element])
            );
            const speedPicker = kit.segmented({
                labelKey: "lab.kit.speed",
                options: [
                    { value: "watch", labelKey: "lab.kit.speedWatch" },
                    { value: "fast", labelKey: "lab.kit.speedFast" },
                    { value: "turbo", labelKey: "lab.kit.speedTurbo" }
                ],
                value: speed,
                onChange: setSpeed
            });
            const alphaSlider = kit.slider({
                labelKey: "lab.maze.alpha", min: ALPHA.min, max: ALPHA.max, step: ALPHA.step, value: learner.alpha,
                hintKey: "lab.maze.alphaHint",
                onInput: function (value) { learner.alpha = value; },
                onChange: saveSettings
            });
            const gammaSlider = kit.slider({
                labelKey: "lab.maze.gamma", min: GAMMA.min, max: GAMMA.max, step: GAMMA.step, value: learner.gamma,
                hintKey: "lab.maze.gammaHint",
                onInput: function (value) { learner.gamma = value; },
                onChange: saveSettings
            });
            const epsilonSlider = kit.slider({
                labelKey: "lab.maze.epsilon", min: EPSILON.min, max: EPSILON.max, step: EPSILON.step, value: learner.epsilon,
                hintKey: "lab.maze.epsilonHint",
                onInput: function (value) {
                    learner.epsilon = value;
                    epsilonStart = value;
                    dirty = true;
                },
                onChange: saveSettings
            });
            const slipperySwitch = kit.toggle({
                labelKey: "lab.maze.slippery", checked: initial.slippery, hintKey: "lab.maze.slipperyHint",
                onChange: function (on) {
                    world.slippery = on;
                    slipperyEpisodes = 0;
                    saveSettings();
                    changed();
                }
            });
            const shrinkSwitch = kit.toggle({
                labelKey: "lab.maze.shrink", checked: shrink,
                hintKey: function () { return t("lab.maze.shrinkHint", { k: A.format.number(SHRINK), floor: A.format.number(EPSILON_FLOOR) }); },
                onChange: function (on) {
                    shrink = on;
                    saveSettings();
                    changed();
                }
            });
            const layerSwitch = kit.toggle({
                labelKey: "lab.maze.layer", checked: layer, hintKey: "lab.maze.layerHint",
                onChange: function (on) {
                    layer = on;
                    saveSettings();
                    changed();
                }
            });
            // the sliders' own values (a saved 0.123 runs as the slider's 0.12)
            learner.alpha = alphaSlider.value();
            learner.gamma = gammaSlider.value();
            learner.epsilon = epsilonSlider.value();
            epsilonStart = learner.epsilon;

            ui.side.appendChild(kit.group("lab.kit.settings", [speedPicker, alphaSlider, gammaSlider, epsilonSlider, slipperySwitch, shrinkSwitch, layerSwitch]));

            // Charts: moves and reward per episode (faint: each episode; bold: the average of 10)
            const charts = document.createElement("div");
            charts.className = "mz-charts";
            ui.bottom.appendChild(charts);
            const movesView = kit.canvas(charts, { height: 160, labelKey: "lab.maze.chartMoves" });
            const rewardView = kit.canvas(charts, { height: 160, labelKey: "lab.maze.chartReward" });
            const movesChart = kit.lineChart(movesView, { series: [], xLabelKey: "lab.maze.episode", yLabelKey: "lab.maze.chartMoves" });
            const rewardChart = kit.lineChart(rewardView, { series: [], xLabelKey: "lab.maze.episode", yLabelKey: "lab.maze.chartReward" });

            const idea = document.createElement("p");
            idea.className = "mz-idea";
            idea.innerHTML = A.i18nHTML("lab.maze.ideaLine") + " ";
            idea.append(kit.termLink("reinforcement", "lab.maze.term"), ". ");
            idea.insertAdjacentHTML("beforeend", A.i18nHTML("lab.maze.realWorld"));
            const toy = document.createElement("p");
            toy.className = "mz-idea";
            toy.innerHTML = A.i18nHTML("lab.maze.toyLine") + " ";
            toy.append(kit.termLink("q-learning", "lab.maze.termQ"), ". ");
            toy.insertAdjacentHTML("beforeend", A.i18nHTML("lab.maze.toyLine2"));
            const explain = kit.explain({ steps: [
                { key: "lab.maze.step1" },
                { key: "lab.maze.step2" },
                { key: "lab.maze.step3" },
                { key: "lab.maze.step4" },
                { key: "lab.maze.step5" }
            ] });
            const challenges = kit.challenges({ ctx: ctx, items: [
                {
                    key: "lab.maze.ch1", insightKey: "lab.maze.ch1Why",
                    check: function (info) { return info.preset === "first" && reachesBattery(info.path) && info.path.moves.length === info.shortest; }
                },
                {
                    key: "lab.maze.ch2", insightKey: "lab.maze.ch2Why",
                    check: function (info) {
                        return info.preset === "cliff" && info.slippery && info.slipperyEpisodes >= SAFE_EPISODES &&
                            reachesBattery(info.path) && riskyMoves(world, info.path) === 0;
                    }
                },
                {
                    key: "lab.maze.ch3", insightKey: "lab.maze.ch3Why",
                    check: function (info) { return info.preset === "far" && info.episodes >= PATIENT_EPISODES && info.path.end === "big"; }
                },
                {
                    key: "lab.maze.ch4", insightKey: "lab.maze.ch4Why",
                    check: function (info) {
                        const run = info.sinceForget;
                        return info.preset === "far" && run.greedy && run.episodes >= LOCK_IN.episodes && run.big < LOCK_IN.share * run.episodes;
                    }
                }
            ] });
            ui.bottom.append(idea, toy, explain.element, challenges.element);

            const loop = kit.loop({ rate: SPEED[speed], budget: TURBO_BUDGET, update: tick, draw: frame });
            scene.onResize(function () { render(1); });
            // Calm mode switched on or off (the hub doesn't tell us): the glows go or come back at once
            const offMotion = A.motion.onChange(function () {
                tileCache = null;
                trail.length = 0;
                changed();
            });

            // ----- The inspector: the selected square's four scores around a small square -----
            function makeInspector() {
                const element = document.createElement("div");
                element.className = "mz-inspector";
                const name = document.createElement("p");
                name.className = "mz-cell-name";
                const grid = document.createElement("div");
                grid.className = "mz-qgrid";
                grid.setAttribute("role", "group");
                const center = document.createElement("span");
                center.className = "mz-q-center";
                center.setAttribute("aria-hidden", "true");
                center.innerHTML = kit.icons.up;
                const items = DIRECTION_NAMES.map(function (key, a) {
                    const item = document.createElement("span");
                    item.className = "mz-q mz-q-" + ["up", "right", "down", "left"][a];
                    item.innerHTML = '<span class="mz-q-arrow" aria-hidden="true">' + kit.icons.up + '</span><span class="sr-only"></span><span class="mz-q-value"></span>';
                    grid.appendChild(item);
                    return { element: item, name: item.querySelector(".sr-only"), value: item.querySelector(".mz-q-value") };
                });
                grid.appendChild(center);
                const noScores = document.createElement("p");
                noScores.className = "mz-note";
                const move = document.createElement("p");
                move.className = "mz-update";
                const formula = document.createElement("p");
                formula.className = "mz-formula";
                element.append(name, grid, noScores, move, formula);
                return { element: element, name: name, grid: grid, center: center, items: items, noScores: noScores, move: move, formula: formula };
            }

            // ----- Training -----
            function beginEpisode() {
                s = world.start;
                moves = 0;
                episodeReward = 0;
                episode += 1;
                episodeOver = false;
                trail.length = 0;
            }

            function endEpisode(end) {
                episodeOver = true;
                lastEnd = end;
                lastMoves = moves;
                history.moves.push(moves);
                history.reward.push(episodeReward);
                history.found.push(end === "small" || end === "big");
                history.avgMoves.push(averageOfLast(history.moves, AVERAGE));
                history.avgReward.push(averageOfLast(history.reward, AVERAGE));
                // Old episodes leave the lists in big bites (cheaper than one at a time)
                if (history.moves.length > 2 * HISTORY) {
                    const extra = history.moves.length - HISTORY;
                    ["moves", "reward", "found", "avgMoves", "avgReward"].forEach(function (name) { history[name].splice(0, extra); });
                    history.first += extra;
                }
                history.changed = true;
                sinceForget.episodes += 1;
                if (end === "big") sinceForget.big += 1;
                if (learner.epsilon > 0 || shrink || learner.gamma < LOCK_IN.gamma) sinceForget.greedy = false;
                if (world.slippery) slipperyEpisodes += 1;
                if (shrink && learner.epsilon > EPSILON_FLOOR) learner.epsilon = Math.max(EPSILON_FLOOR, learner.epsilon * SHRINK);
                if (stopAtEpisodeEnd) {
                    stopAtEpisodeEnd = false;
                    loop.stop();
                    setState("done");
                    note = function () { return ["lab.maze.episodeDone", episodeValues()]; };
                    ctx.announce(t("lab.maze.episodeDone", episodeValues()));
                }
            }

            function episodeValues() {
                return { n: episode, moves: A.plural("lab.maze.moves", lastMoves), end: t(END_KEYS[lastEnd]) };
            }

            // One move of training, with its update (the loop calls this at the chosen speed)
            function trainMove() {
                route = null;
                if (episodeOver) beginEpisode();
                const record = learnMove(world, Q, s, learner, random);
                last = record;
                from = s;
                bump = record.next === s ? record.actual : -1;
                s = record.next;
                moves += 1;
                episodeReward += record.reward;
                if (speed !== "turbo" && A.motion.ok()) {
                    trail.push(s);
                    if (trail.length > TRAIL) trail.shift();
                }
                record.limit = !record.done && moves >= episodeLimit(world);
                if (record.done) endEpisode(world.cells[s]);
                else if (record.limit) endEpisode("limit");
                dirty = true;
            }

            // The loop's step: a training move, or the next square of the best path. In Turbo the
            // loop calls this 1000 times a second: the first call of a frame makes all the moves
            // that fit in turboMs, the other calls of that frame do nothing.
            function tick() {
                if (showing) {
                    route.shown += 1;
                    if (route.shown >= route.cells.length) stopShow();
                } else if (speed !== "turbo") {
                    trainMove();
                } else if (!turbo.start) {
                    turbo.start = performance.now();
                    const until = turbo.start + turbo.ms;
                    do {
                        for (let i = 0; i < BATCH && loop.running(); i++) trainMove();
                    } while (loop.running() && performance.now() < until);
                    turbo.moves = performance.now() - turbo.start;
                }
            }

            // The loop's drawing, once per frame. In Turbo it also times the frame: when the rest
            // of the frame is slow (a slow computer), the moves get less time, so that the whole
            // frame stays near FRAME_MS.
            function frame(info) {
                render(info.progress);
                if (turbo.start) {
                    turbo.rest = 0.9 * turbo.rest + 0.1 * (performance.now() - turbo.start - turbo.moves);
                    turbo.ms = A.util.clamp(FRAME_MS - turbo.rest, 1, TURBO_BUDGET);
                    turbo.start = 0;
                }
            }

            function stopShow() {
                if (!showing) return;
                showing = false;
                loop.stop();
                loop.setRate(SPEED[speed]);
            }

            // ----- What the buttons do -----
            function setState(next) {
                state = next;
                status.set(next);
                playButton.setLabel(next === "running" ? "lab.kit.pause" : "lab.kit.play");
                playButton.setIcon(next === "running" ? "pause" : "play");
                dirty = true;
            }

            // Any button press takes back a waiting "edit the maze?" warning
            function disarm() {
                armed = false;
                askHint.hide();
            }

            // Before training starts again: leave edit mode, stop the best-path show
            function prepare() {
                disarm();
                leaveEdit(false);
                stopShow();
                note = null;
            }

            function togglePlay() {
                if (state === "running") {
                    loop.stop();
                    stopAtEpisodeEnd = false;
                    setState("paused");
                    render(1);
                    return;
                }
                prepare();
                stopAtEpisodeEnd = false;
                setState("running");
                loop.start();
            }

            function runEpisode() {
                prepare();
                stopAtEpisodeEnd = true;
                setState("running");
                loop.start();
            }

            function stepOnce() {
                prepare();
                loop.stop();
                stopAtEpisodeEnd = false;
                trainMove();
                selected = last.s;
                showCursor = true;
                setState("paused");
                ctx.announce(t("lab.maze.stepSay", {
                    dir: t(DIRECTION_KEYS[last.actual]), r: signed(last.reward), old: score(last.old), new: score(last.value)
                }));
                render(1);
            }

            function showBestPath() {
                disarm();
                leaveEdit(false);
                if (state === "running") {
                    loop.stop();
                    setState("paused");
                }
                stopShow();
                const path = greedyPath(Q, world);
                route = { cells: path.cells, moves: path.moves, end: path.end, shown: A.motion.ok() ? 1 : path.cells.length };
                from = s;
                bump = -1;
                note = function () { return [PATH_KEYS[route ? route.end : "unknown"], { moves: A.plural("lab.maze.moves", route ? route.moves.length : 0) }]; };
                ctx.announce(t(PATH_KEYS[path.end], { moves: A.plural("lab.maze.moves", path.moves.length) }));
                if (route.shown < route.cells.length) {
                    showing = true;
                    loop.setRate(SHOW_RATE);
                    loop.start();
                }
                changed();
            }

            function setSpeed(value) {
                speed = value;
                if (!showing) loop.setRate(SPEED[speed]);
                trail.length = 0;
                saveSettings();
                changed();
            }

            // Forget everything: all scores back to 0, the numbers of the preset again
            function forget(say) {
                disarm();
                stopShow();
                loop.stop();
                Q = newTable(world);
                random = kit.rng(preset.seed);
                learner.epsilon = epsilonStart;
                s = world.start;
                from = s;
                bump = -1;
                moves = 0;
                episode = 0;
                episodeReward = 0;
                episodeOver = true;
                lastEnd = null;
                lastMoves = 0;
                last = null;
                history = { first: 1, moves: [], reward: [], found: [], avgMoves: [], avgReward: [], changed: true };
                sinceForget = { episodes: 0, big: 0, greedy: true };
                slipperyEpisodes = 0;
                trail.length = 0;
                route = null;
                stopAtEpisodeEnd = false;
                note = null;
                setState("ready");
                if (say) ctx.announce(t("lab.maze.forgotten"));
                changed();
            }

            // A new maze (a preset, or the user's own): its world, its size, its legend
            function loadPreset(id, applySettings) {
                preset = presetById(id);
                if (preset.id === MINE) world = makeWorld(myMaze.cols, myMaze.rows, myMaze.cells);
                else world = worldFromRows(preset.maze, preset.rewards);
                if (applySettings && preset.id !== MINE) {
                    learner.alpha = preset.alpha;
                    learner.gamma = preset.gamma;
                    epsilonStart = preset.epsilon;
                    shrink = preset.shrink;
                    alphaSlider.set(preset.alpha);
                    gammaSlider.set(preset.gamma);
                    epsilonSlider.set(preset.epsilon);
                    shrinkSwitch.set(preset.shrink);
                    slipperySwitch.set(preset.slippery);
                }
                world.slippery = slipperySwitch.checked();
                worldVersion += 1;
                shortest = shortestPath(world);
                selected = world.start;
                showCursor = false;
                scene.box.style.aspectRatio = String(world.cols / world.rows);
                scene.box.style.maxWidth = world.cols * MAX_SQUARE + 2 * BOARD_PAD + "px";
                legend.update(legendItems());
                forget(false);
            }

            function choosePreset(id) {
                disarm();
                leaveEdit(false);
                loadPreset(id, true);
                saveSettings();
            }

            function presetOptions() {
                const options = presets.map(function (p) { return { value: p.id, labelKey: p.labelKey }; });
                if (myMaze) options.push({ value: MINE, labelKey: "lab.maze.presetMine" });
                return options;
            }

            // The legend: each tile with its reward (rewards come from the Settings or the preset)
            function legendItems() {
                const r = world.rewards;
                function withReward(key, value) {
                    return function () { return t("lab.maze.withReward", { name: t(key), r: signed(value) }); };
                }
                return [
                    { labelKey: "lab.maze.wall", color: "var(--accent)", shape: "square" },
                    { labelKey: withReward("lab.maze.pit", r.pit), color: "var(--warning)", shape: "triangle" },
                    { labelKey: withReward("lab.maze.small", r.small), color: "var(--success)", shape: "dot" },
                    { labelKey: withReward("lab.maze.big", r.big), color: "var(--success)", shape: "diamond" },
                    { labelKey: "lab.maze.start", color: "var(--accent-2)", shape: "ring" },
                    { labelKey: function () { return t("lab.maze.moveCost", { r: signed(r.move) }); }, color: "var(--text-muted)", shape: "dash" }
                ];
            }

            function saveSettings() {
                ctx.store.set("settings", {
                    v: SAVE_VERSION, preset: preset.id, alpha: learner.alpha, gamma: learner.gamma, epsilon: epsilonStart,
                    shrink: shrink, slippery: world.slippery, layer: layer, speed: speed
                });
            }

            // ----- Edit mode -----
            function toggleEdit() {
                if (editing) {
                    leaveEdit(true);
                    return;
                }
                editButton.setPressed(false);
                if (episode > 0 && !armed) {
                    armed = true;
                    askHint.show();
                    ctx.announce(t("lab.maze.editAsk"));
                    return;
                }
                disarm();
                stopShow();
                forget(false);
                editing = true;
                editButton.setPressed(true);
                editBox.hidden = false;
                scene.box.classList.add("mz-editing");
                kit.relabel(scene.box);
                ctx.announce(t("lab.maze.editOn"));
                changed();
            }

            function leaveEdit(say) {
                if (!editing) return;
                editing = false;
                painting = false;
                editButton.setPressed(false);
                editBox.hidden = true;
                scene.box.classList.remove("mz-editing");
                kit.relabel(scene.box);
                if (say) ctx.announce(t("lab.maze.editOff"));
                changed();
            }

            // Paints the chosen tile on a square. The first change makes the maze the user's own.
            function paint(square) {
                if (square < 0 || !paintSquare(world, square, tool)) return;
                myMaze = { v: SAVE_VERSION, cols: world.cols, rows: world.rows, cells: world.cells.slice() };
                ctx.store.set("maze", myMaze);
                if (preset.id !== MINE) {
                    preset = presetById(MINE);
                    presetSelect.setOptions(presetOptions(), MINE);
                    saveSettings();
                }
                worldVersion += 1;
                shortest = shortestPath(world);
                selected = square;
                forget(false);
            }

            // ----- The board: mouse, touch and keyboard -----
            // The square under the pointer, or -1
            function squareAt(event) {
                const box = scene.canvas.getBoundingClientRect();
                const geo = boardGeometry(scene, world);
                const x = Math.floor((event.clientX - box.left - geo.left) / geo.size);
                const y = Math.floor((event.clientY - box.top - geo.top) / geo.size);
                return x < 0 || y < 0 || x >= world.cols || y >= world.rows ? -1 : y * world.cols + x;
            }

            function select(square, say) {
                if (square < 0) return;
                selected = square;
                showCursor = true;
                if (say) ctx.announce(squareText(square));
                changed();
            }

            // "Row 2, column 3: wall." plus the best move there
            function squareText(square) {
                const tile = world.cells[square];
                let text = t("lab.maze.cell", { row: rowOf(world, square) + 1, col: colOf(world, square) + 1, tile: tileText(tile) });
                if (tile === "wall" || isEnd(tile) || editing) return text;
                const values = Q[square];
                if (undecided(values)) return text + " " + t("lab.maze.cellNew");
                return text + " " + t("lab.maze.cellBest", { dir: t(DIRECTION_KEYS[values.indexOf(bestScore(values))]) });
            }

            // A mouse paints while its button is down; a finger paints with a tap (the click
            // below), so a finger can still scroll the page over the board
            scene.canvas.addEventListener("pointerdown", function (event) {
                if (!editing || event.pointerType === "touch" || event.button !== 0) return;
                painting = true;
                scene.canvas.setPointerCapture(event.pointerId);
                paint(squareAt(event));
            });
            scene.canvas.addEventListener("pointermove", function (event) {
                if (painting) paint(squareAt(event));
            });
            ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (type) {
                scene.canvas.addEventListener(type, function () { painting = false; });
            });
            scene.canvas.addEventListener("click", function (event) {
                const square = squareAt(event);
                if (editing) paint(square);
                else select(square, false);
            });
            scene.canvas.addEventListener("keydown", function (event) {
                const move = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].indexOf(event.key);
                if (move !== -1) {
                    event.preventDefault();
                    const x = A.util.clamp(colOf(world, selected) + MOVES[move].x, 0, world.cols - 1);
                    const y = A.util.clamp(rowOf(world, selected) + MOVES[move].y, 0, world.rows - 1);
                    select(y * world.cols + x, true);
                } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (editing) {
                        paint(selected);
                        select(selected, true);
                    } else {
                        const values = Q[selected];
                        showCursor = true;
                        ctx.announce(squareText(selected) + (isEnd(world.cells[selected]) || world.cells[selected] === "wall" ? "" : " " +
                            t("lab.maze.cellScores", { up: score(values[0]), right: score(values[1]), down: score(values[2]), left: score(values[3]) })));
                        changed();
                    }
                }
            });

            // ----- Everything on screen follows the state -----
            // Something changed outside the loop: write and draw it now
            function changed() {
                dirty = true;
                render(1);
            }

            function robotMood() {
                if (!episodeOver || !lastEnd) return "normal";
                return lastEnd === "pit" ? "sad" : lastEnd === "limit" ? "normal" : "happy";
            }

            // progress: how far the next move is (0..1), for the robot's slide in Watch mode
            function drawBoard(progress) {
                if (!scene.width || !scene.height) return;
                const g = scene.ctx;
                const c = kit.colors();
                const motion = A.motion.ok();
                const geo = boardGeometry(scene, world);
                const key = [scene.width, scene.height, scene.dpr, c.theme, motion, worldVersion].join("|");
                if (!tileCache || tileCache.key !== key) {
                    const image = document.createElement("canvas");
                    image.width = Math.round(scene.width * scene.dpr);
                    image.height = Math.round(scene.height * scene.dpr);
                    const ig = image.getContext("2d");
                    ig.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
                    drawTiles(ig, geo, world, c, motion);
                    tileCache = { key: key, image: image };
                }
                g.clearRect(0, 0, scene.width, scene.height);
                g.drawImage(tileCache.image, 0, 0, scene.width, scene.height);
                if (layer) drawValues(g, geo, world, Q, c);
                drawStart(g, geo, world, c);
                if (route) drawRoute(g, geo, world, route, c, motion);
                if (motion && speed !== "turbo" && trail.length) drawTrail(g, geo, world, trail, c);
                // The robot: it slides (Watch mode with motion), or stands on its square
                let spot = centerOf(geo, world, s);
                if (motion && speed === "watch" && state === "running" && !showing && progress < 1) {
                    const share = Math.min(1, progress / SLIDE);
                    const ease = share * share * (3 - 2 * share);
                    if (bump !== -1) {
                        const push = Math.sin(Math.PI * ease) * BUMP * geo.size;
                        spot = { x: spot.x + MOVES[bump].x * push, y: spot.y + MOVES[bump].y * push };
                    } else {
                        const start = centerOf(geo, world, from);
                        spot = { x: start.x + (spot.x - start.x) * ease, y: start.y + (spot.y - start.y) * ease };
                    }
                }
                drawRobot(g, spot.x, spot.y, geo.size, c, robotMood(), motion);
                if (showCursor) drawCursor(g, geo, world, selected, c);
            }

            function render(progress) {
                drawBoard(progress === undefined ? 1 : progress);
                if (!dirty) return;
                // In Turbo the numbers change too fast to read: write them 10 times a second
                const now = performance.now();
                if (state === "running" && speed === "turbo" && now - lastPaint < TURBO_PAINT_MS) return;
                lastPaint = now;
                dirty = false;
                const path = greedyPath(Q, world);
                if (history.changed) paintCharts();
                paintStats(path);
                paintInspector();
                paintExplain();
                paintBoardText(path);
                setText(about, t(preset.aboutKey));
                noWayHint.element.hidden = shortest !== -1;
                challenges.check({
                    preset: preset.id, path: path, shortest: shortest, slippery: world.slippery, slipperyEpisodes: slipperyEpisodes,
                    episodes: sinceForget.episodes, sinceForget: sinceForget
                });
            }

            function paintCharts() {
                history.changed = false;
                const skip = Math.max(0, history.moves.length - HISTORY);     // the episodes too old to show
                movesChart.set({ x0: history.first + skip, series: [
                    { values: history.moves.slice(skip), colorIndex: 0, faint: true },
                    { values: history.avgMoves.slice(skip), colorIndex: 0, labelKey: "lab.maze.chartMovesAvg" }
                ] });
                rewardChart.set({ x0: history.first + skip, series: [
                    { values: history.reward.slice(skip), colorIndex: 1, faint: true },
                    { values: history.avgReward.slice(skip), colorIndex: 1, labelKey: "lab.maze.chartRewardAvg" }
                ] });
                movesChart.draw();
                rewardChart.draw();
            }

            function paintStats(path) {
                stats.episode.set(episode);
                stats.moves.set(moves);
                const recent = history.found.slice(-RECENT);
                stats.found.set(recent.length ? recent.filter(Boolean).length / recent.length : null);
                stats.best.set(reachesBattery(path) ? path.moves.length : null);
                if (Math.abs(epsilonSlider.value() - learner.epsilon) >= EPSILON.step / 2) epsilonSlider.set(learner.epsilon);
            }

            function paintInspector() {
                const tile = world.cells[selected];
                const values = Q[selected];
                setText(inspector.name, t("lab.maze.cell", { row: rowOf(world, selected) + 1, col: colOf(world, selected) + 1, tile: tileText(tile) }));
                const scored = tile !== "wall" && !isEnd(tile);
                inspector.grid.hidden = !scored;
                inspector.noScores.hidden = scored;
                setText(inspector.noScores, scored ? "" : t(tile === "wall" ? "lab.maze.wallNote" : "lab.maze.noScores"));
                const label = t("lab.maze.scores");
                if (inspector.grid.getAttribute("aria-label") !== label) inspector.grid.setAttribute("aria-label", label);
                const top = bestScore(values);
                const learned = !undecided(values);
                const fresh = last && state !== "running" && last.s === selected;
                inspector.items.forEach(function (item, a) {
                    setText(item.name, t(DIRECTION_NAMES[a]) + ": ");
                    setText(item.value, score(values[a]));
                    item.element.classList.toggle("is-best", learned && values[a] === top);
                    item.element.classList.toggle("is-low", values[a] < 0);
                    item.element.classList.toggle("is-updated", Boolean(fresh) && last.action === a);
                });
                // the small square in the middle: its colour on the board, and its best move
                inspector.center.style.background = layer && explored(world, Q, selected) ? kit.alpha(kit.diverge(top / valueScale(world, Q)), TINT) : "";
                inspector.center.setAttribute("data-best", learned ? String(values.indexOf(top)) : "");
                // the last update, with its numbers (not while running: they change too fast)
                const showUpdate = Boolean(last) && state !== "running" && !editing;
                inspector.formula.hidden = !showUpdate;
                if (!showUpdate) {
                    setText(inspector.move, state === "running" || editing ? "" : t("lab.maze.stepHint"));
                    return;
                }
                let text = t("lab.maze.lastMove", {
                    row: rowOf(world, last.s) + 1, col: colOf(world, last.s) + 1, dir: t(DIRECTION_KEYS[last.action]),
                    how: t(last.explore ? "lab.maze.howRandom" : "lab.maze.howBest"), r: signed(last.reward)
                });
                if (last.actual !== last.action) text += " " + t("lab.maze.slipped", { dir: t(DIRECTION_KEYS[last.actual]) });
                setText(inspector.move, text);
                setText(inspector.formula, formulaText(last));
            }

            // "Q = 1.20 + 0.5 × (−0.1 + 0.9 × 3.40 − 1.20) = 2.08". The scores are rounded, so
            // when the rounded numbers don't give exactly the result, it says "≈".
            function formulaText(m) {
                const check = round2(m.old) + m.alpha * (m.reward + m.gamma * round2(m.bestNext) - round2(m.old));
                return t("lab.maze.formula", {
                    old: score(m.old), alpha: A.format.number(m.alpha), r: A.format.number(m.reward), gamma: A.format.number(m.gamma),
                    next: term(m.bestNext), oldAgain: term(m.old), eq: round2(check) === round2(m.value) ? "=" : "≈", new: score(m.value)
                });
            }

            function paintExplain() {
                explain.setValues(1, {
                    eps: learner.epsilon,
                    how: last ? t(last.explore ? "lab.maze.howRandomLong" : "lab.maze.howBestLong") : ""
                });
                explain.setValues(2, { reward: last ? signed(last.reward) : "—", why: last ? whyText(last) : "" });
                explain.setValues(3, { old: last ? score(last.old) : "—", new: last ? score(last.value) : "—" });
                explain.setStep(state === "running" || state === "done" ? 4 : last ? 3 : 0);
                if (note) {
                    const sentence = note();
                    explain.setText(sentence[0], sentence[1]);
                } else {
                    explain.setText(null);
                }
            }

            // Why the last move got its reward
            function whyText(m) {
                const cost = signed(world.rewards.move);
                if (m.done) {
                    const tile = world.cells[m.next];
                    return t("lab.maze.whyEnd", { tile: t(TILE_KEYS[tile]), bonus: signed(world.rewards[tile]), cost: cost });
                }
                if (m.limit) return t("lab.maze.whyLimit");
                return t(m.next === m.s ? "lab.maze.whyWall" : "lab.maze.whyMove", { cost: cost });
            }

            // The board in words, for screen readers
            function paintBoardText(path) {
                const lastText = lastEnd ? t("lab.maze.describeLast", { moves: A.plural("lab.maze.moves", lastMoves), end: t(END_KEYS[lastEnd]) })
                    : t("lab.maze.describeNone");
                const bestText = reachesBattery(path) ? t("lab.maze.describeBest", { moves: A.plural("lab.maze.moves", path.moves.length) })
                    : t("lab.maze.describeNoBest");
                scene.describe(t("lab.maze.describe", {
                    cols: world.cols, rows: world.rows, episode: episode,
                    robot: t("lab.maze.describeRobot", { row: rowOf(world, s) + 1, col: colOf(world, s) + 1 }),
                    last: lastText, best: bestText
                }));
            }

            loadPreset(preset.id, false);

            // ----- The controller: the hub calls these -----
            return {
                pause: function () {
                    resumeOnShow = loop.running();
                    loop.stop();
                },
                resume: function () {
                    if (resumeOnShow) loop.start();
                    resumeOnShow = false;
                },
                language: function () {
                    kit.relabel(stage);
                    history.changed = true;
                    changed();
                },
                theme: function () {
                    kit.colors.invalidate();
                    tileCache = null;
                    history.changed = true;
                    changed();
                },
                destroy: function () {
                    loop.stop();
                    offMotion();
                    scene.destroy();
                    movesView.destroy();
                    rewardView.destroy();
                }
            };
        }
    });
})();
