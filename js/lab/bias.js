/* =========================================================
   AI COMPASS — LAB: BIAS DETECTIVE (fairness)
   A made-up summer coding camp has only a few places. For years people
   chose who got in; now the camp wants an AI to choose, trained on those
   past decisions. The applicants belong to two made-up groups, Blue and
   Orange, and every Blue applicant has an Orange twin with exactly the
   same skill, so any difference in how twins are treated is plainly
   unfair. The model is a logistic regression, trained in the browser by
   gradient descent. It learns the unfairness of the past, and switching
   the group column off does not fix it: the neighbourhood stands in for
   the group (a "proxy"). A scorecard measures fairness group by group.

   The made-up Blue and Orange groups (so that no real group gets a
   stereotype) and the idea of a threshold for each group follow Google's
   2016 explorable "Attacking discrimination with smarter machine
   learning" by Martin Wattenberg, Fernanda Viégas and Moritz Hardt.

   Its tests: dev/tests/bias.math.js (the maths, in Node) and
   dev/tests/bias.test.js (the page, in a browser).

   Sections:
    1. Settings
    2. Small helpers
    3. The applicants
    4. The model: logistic regression
    5. Measuring fairness
    6. Drawing the applicants
    7. The experiment (A.lab.define)
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
    // ----- The made-up applicants -----
    const PAIRS = 150;                       // twin pairs: 150 Blue and 150 Orange applicants
    const SKILL = { mean: 60, sd: 12 };      // a pair's real skill (hidden: the truth), from 0 to 100
    const TEST_NOISE = 6;                    // a test score is the skill ± about this much (luck on the day)
    const DECISION_NOISE = 4;                // the people who decided were a little random too
    const PASS_MARK = 66;                    // truly qualified: a skill of 66 or more. The past decisions used the same bar
    const MAJORITY = 0.8;                    // 80 % of Blue live in the North, 80 % of Orange in the South
    // The two stories. deciderBias: points the deciders took off every Orange applicant;
    // testGap: points the Orange twin scores lower on the test (less test preparation).
    const PRESETS = {
        decisions: { deciderBias: 12, testGap: 0 },     // "Unfair decisions"
        test: { deciderBias: 0, testGap: 8 }            // "Unfair test"
    };
    // The groups of applicants the experiment ships with; "New applicants" moves on to the
    // next one. Each shows every lesson clearly, and dev/tests/bias.math.js checks that for
    // every one of them. They had to be picked: with only 300 applicants, chance moves the
    // gaps by a few points, and in about one random group in five the gap without the group
    // column is 5 points or less. These come from a search over the seeds 1 to 600.
    const SEEDS = [42, 16, 45, 27, 81, 60];

    // ----- The model -----
    // The columns it may use, as numbers: the test score (0 to 100), the neighbourhood
    // (1 = South) and the group (1 = Orange). chipKey names its chip, weightKey its bar.
    const COLUMNS = [
        { id: "score", chipKey: "lab.bias.colScore", weightKey: "lab.bias.wScore" },
        { id: "south", chipKey: "lab.bias.colSouth", weightKey: "lab.bias.wSouth" },
        { id: "orange", chipKey: "lab.bias.colOrange", weightKey: "lab.bias.wOrange" }
    ];
    const TRAINING = {
        rate: 2,            // the learning rate. The inputs are standardised and there are at most three,
                            // so the loss bends at most 3 / 4 + l2 = 0.753: any rate below 2 / 0.753 = 2.66
                            // lowers the loss at every step (dev/tests/bias.math.js checks it)
        steps: 300,         // full-batch steps in one training (a few milliseconds)
        l2: 0.003           // a small penalty on big weights ("L2"): they stay finite and comparable
    };
    const WATCH_RATE = 60;              // steps per second with "Show training" on (300 steps in 5 s)
    const PANEL_EVERY = 125;            // ms: while a training is watched, the picture and the loss change
                                        // every frame, but the table, the weights and the explanation only
                                        // 8 times a second (as fast as anyone reads; it spares slow phones)
    const TRAINING_FLASH = 350;         // ms of the short "Training…" state after a change

    // ----- The decision and the scorecard -----
    // The threshold sliders. They reach down to 1 %: on "Unfair test", qualified Orange applicants
    // get the same chance as Blue ones only with an Orange threshold of about 5 to 12 %
    const THRESHOLD = { min: 0.01, max: 0.99, step: 0.01, value: 0.5 };
    const GAP_LIMIT = 5;                // points: a bigger gap between the groups is highlighted
    const GOAL_ACCURACY = 80;           // challenges 3 and 4: right about at least this % of each group
    const WEIGHT_MAX = 5;               // the weight of a full bar in "What the model learned"
    const SMALL_WEIGHT = 0.1;           // a weight shown as 0.1 or less (either sign) "hardly matters". The words
                                        // follow the number shown (one decimal), so one number never gets two
    // The scorecard's rows (whole percentages for Blue and Orange, then the gap)
    const ROWS = [
        { id: "past", key: "lab.bias.rowPast", saysKey: "lab.bias.saysPast" },              // accepted in the past
        { id: "accepted", key: "lab.bias.rowAccepted", saysKey: "lab.bias.saysAccepted" },  // accepted by the model
        { id: "tpr", key: "lab.bias.rowTpr", saysKey: "lab.bias.saysTpr" },                 // qualified who got in
        { id: "truth", key: "lab.bias.rowTruth", saysKey: "lab.bias.saysTruth" },           // right about who was qualified
        { id: "agree", key: "lab.bias.rowAgree", saysKey: "lab.bias.saysAgree" }            // agrees with the past decisions
    ];

    // ----- Drawing -----
    // The two groups: their names (as a group, one person, and "whom" for the gap sentences)
    // and their colour: a kit series colour, counted from 0 (5 is --lk-series-6, blue, and
    // 6 is --lk-series-7, orange; both themes have their own shade of each)
    const GROUPS = [
        { nameKey: "lab.bias.blue", oneKey: "lab.bias.blueOne", whomKey: "lab.bias.blueWhom", color: 5 },
        { nameKey: "lab.bias.orange", oneKey: "lab.bias.orangeOne", whomKey: "lab.bias.orangeWhom", color: 6 }
    ];
    const DRAW = {
        aspect: 3 / 2,      // the picture's width / height...
        minHeight: 380,     // ...but at least this tall (a phone)...
        maxHeight: 440,     // ...and at most this tall (px). Tall enough for 120 dots to pile up in a lane
        side: 14,           // px of room left and right of the score axis
        top: 6,             // px above the Blue row
        head: 22,           // px for a group's name and count
        groupGap: 12,       // px between the Blue and the Orange rows
        laneFloor: 30,      // a lane's height follows how many applicants it holds, plus this many
                            // (so the North lane of 120 Blue is taller than the South lane of 30)
        axis: 34,           // px for the score axis at the bottom
        radius: { min: 3, max: 4.6, per: 150 },     // a dot's radius: the canvas width / 150, within these limits
        dotGap: 1,          // px between two dots of a pile
        hit: 14,            // px: the pointer this close to a dot points at it
        dim: 0.22,          // how strongly the other dots show while a twin pair is shown
        waitingFade: 0.45,  // ...and while the model trains again ("Training…")
        tick: 10,           // a grid line every 10 points of the test score...
        label: 20,          // ...and a number every 20
        pageJump: 10        // PageUp / PageDown move this many applicants
    };

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    // Makes an element: el("p", "bd-note", { id: "x" })
    function el(tag, className, attributes) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        Object.keys(attributes || {}).forEach(function (name) {
            element.setAttribute(name, attributes[name]);
        });
        return element;
    }

    // An element whose text is a translation key: core translates it again by itself
    function textOf(tag, className, key) {
        const element = el(tag, className, { "data-i18n": key });
        element.innerHTML = t(key);
        return element;
    }

    // A panel with a title: an h4, because in the lab the experiment's own title is an h3.
    // The panel is named by its title for screen readers (aria-labelledby).
    let panelCount = 0;
    function panel(className, titleKey) {
        panelCount += 1;
        const id = "bd-panel-" + panelCount;
        const section = el("section", "bd-panel " + className, { "aria-labelledby": id });
        const title = textOf("h4", "bd-title", titleKey);
        title.id = id;
        section.appendChild(title);
        return section;
    }

    // TODO(kit): kit.sentence(element, key, links). A translated sentence whose {placeholders}
    // are elements, such as glossary links: sentence(p, "lab.bias.ideaLine", { bias: makeLink }).
    // Each link is made again (in the new language) when the sentence is written again.
    function sentence(element, key, links) {
        element.textContent = "";
        t(key).split(/(\{\w+\})/).forEach(function (part) {
            const name = /^\{(\w+)\}$/.exec(part);
            if (name && links[name[1]]) element.appendChild(links[name[1]]());
            else if (part) element.appendChild(document.createTextNode(part));
        });
    }

    // TODO(kit): kit.table(columns, rows): a small table of numbers with a header row and
    // a name for each row (a scorecard, a confusion matrix). This one is the scorecard:
    // a row per measure, then Blue, Orange and the gap. It returns the cells to fill in.
    function scoreTable() {
        const table = el("table", "bd-table");
        const headRow = el("tr");
        const corner = textOf("th", "bd-measure", "lab.bias.measure");
        corner.setAttribute("scope", "col");
        headRow.appendChild(corner);
        GROUPS.forEach(function (group, index) {
            const cell = el("th", "bd-group-head", { scope: "col" });
            cell.append(el("span", "bd-dot bd-dot-" + index, { "aria-hidden": "true" }), textOf("span", "", group.nameKey));
            headRow.appendChild(cell);
        });
        const gapHead = textOf("th", "", "lab.bias.gap");
        gapHead.setAttribute("scope", "col");
        headRow.appendChild(gapHead);
        const head = el("thead");
        head.appendChild(headRow);

        const body = el("tbody");
        const cells = {};
        ROWS.forEach(function (row) {
            const line = el("tr", "bd-row-" + row.id);
            const name = textOf("th", "", row.key);
            name.setAttribute("scope", "row");
            const blue = el("td");
            const orange = el("td");
            const gap = el("td", "bd-gap");
            const icon = el("span", "bd-gap-icon", { "aria-hidden": "true" });
            icon.innerHTML = kit.icons.warn;
            const number = el("span", "bd-gap-number");
            const big = textOf("span", "sr-only", "lab.bias.bigGap");
            gap.append(icon, number, big);
            line.append(name, blue, orange, gap);
            body.appendChild(line);
            cells[row.id] = { blue: blue, orange: orange, gap: gap, number: number, big: big };
        });
        table.append(head, body);
        return { element: table, cells: cells };
    }

    // A weight as the page shows it: rounded to one decimal
    function shownWeight(value) {
        return Math.round(value * 10) / 10;
    }

    // A weight with one decimal and its sign: "+3.9", "−1.7", "0.0"
    function weightText(value) {
        const rounded = shownWeight(value);
        return (rounded > 0 ? "+" : "") + A.format.number(rounded, { digits: 1 });
    }

    // A gap in points with its sign: "−19", "+3", "0" (null: not measured yet)
    function gapText(value) {
        if (value === null) return "—";
        return (value > 0 ? "+" : "") + A.format.number(value);
    }

    // A whole percentage: 33 -> "33%" (null: not measured yet)
    function percentText(value) {
        return value === null ? "—" : A.format.percent(value / 100, { small: false });
    }

    /* =========================================================
       3. THE APPLICANTS
       Every pair of twins shares a skill. The test score is the skill
       plus luck on the day (the same luck for both twins), and in the
       "Unfair test" story the Orange twin scores 8 points lower. The
       past decision accepted someone whose score, plus the deciders'
       own randomness, beat the pass mark; in "Unfair decisions" the
       deciders first took 12 points off every Orange applicant.
       ========================================================= */
    function clip(value) {
        return A.util.clamp(value, 0, 100);
    }

    // 300 made-up applicants from a seed: Blue first (0 to 149), then Orange (150 to 299).
    // Applicant i's twin is i + 150 (or i - 150). Each applicant:
    //   { group (0 Blue, 1 Orange), pair, skill, score, south (1 = lives in the South),
    //     past (1 = accepted in the past), qualified (1 = truly qualified) }
    // Both stories use the same random numbers, so the same seed gives the same people.
    function makeApplicants(seed, presetName) {
        const preset = PRESETS[presetName] || PRESETS.decisions;
        const random = kit.rng(seed);

        // 1. Each pair: its skill, the test's luck (shared by the twins) and the deciders'
        //    randomness (one number for each twin)
        const pairs = [];
        for (let i = 0; i < PAIRS; i++) {
            pairs.push({
                skill: clip(random.normal(SKILL.mean, SKILL.sd)),
                luck: random.normal(0, TEST_NOISE),
                whim: [random.normal(0, DECISION_NOISE), random.normal(0, DECISION_NOISE)]
            });
        }

        // 2. Where they live, unrelated to skill: exactly 80 % of each group in its usual
        //    neighbourhood. The first 30 of a shuffled list live in the other one.
        const others = Math.round(PAIRS * (1 - MAJORITY));
        const numbers = [];
        for (let i = 0; i < PAIRS; i++) numbers.push(i);
        const inOtherPlace = [new Array(PAIRS).fill(false), new Array(PAIRS).fill(false)];
        random.shuffle(numbers).slice(0, others).forEach(function (i) { inOtherPlace[0][i] = true; });   // Blue in the South
        random.shuffle(numbers).slice(0, others).forEach(function (i) { inOtherPlace[1][i] = true; });   // Orange in the North

        // 3. The applicants
        const people = [];
        [0, 1].forEach(function (group) {
            const orange = group === 1;
            pairs.forEach(function (pair, i) {
                const score = clip(pair.skill + pair.luck - (orange ? preset.testGap : 0));
                const judged = score + pair.whim[group] - (orange ? preset.deciderBias : 0);
                people.push({
                    group: group,
                    pair: i,
                    skill: pair.skill,
                    score: score,
                    south: orange === !inOtherPlace[group][i] ? 1 : 0,
                    past: judged > PASS_MARK ? 1 : 0,
                    qualified: pair.skill >= PASS_MARK ? 1 : 0
                });
            });
        });
        return people;
    }

    function twinOf(index) {
        return index < PAIRS ? index + PAIRS : index - PAIRS;
    }

    // For the arrow keys: each group's applicants from the lowest test score to the highest
    function walkingOrder(people) {
        return [0, 1].map(function (group) {
            const list = [];
            people.forEach(function (person, i) {
                if (person.group === group) list.push(i);
            });
            return list.sort(function (a, b) { return people[a].score - people[b].score || a - b; });
        });
    }

    /* =========================================================
       4. THE MODEL: LOGISTIC REGRESSION
       The model gives each applicant a chance of being accepted:
           z = bias + w1·x1 + w2·x2 + w3·x3     (its "logit")
           chance = 1 / (1 + e^(−z))            (the sigmoid squeezes z into 0..1)
       Training lowers the loss, the average "surprise" at the labels:
           loss = average of −[y·log(chance) + (1 − y)·log(1 − chance)] + l2/2 · Σ w²
       by gradient descent on all the applicants at once (full batch):
           ∂loss/∂wj = average of (chance − y)·xj + l2·wj,   ∂loss/∂bias = average of (chance − y)
       Each column is standardised first (minus its average, divided by its
       spread), so every input has an average of 0 and a spread of 1: one
       learning rate suits them all, and the weights can be compared.
       ========================================================= */
    function columnValue(person, column) {
        if (column === "score") return person.score;
        if (column === "south") return person.south;
        return person.group;                 // "orange": 1 for Orange, 0 for Blue
    }

    // A new, untrained model (all weights 0: a chance of 50 % for everyone).
    //   columns  the columns it may use ("score", "south", "orange")
    //   labels   what it learns to predict: 1 = accepted, one number per applicant
    function makeModel(people, columns, labels) {
        const count = people.length;
        const means = [];
        const spreads = [];
        columns.forEach(function (column) {
            let sum = 0;
            people.forEach(function (person) { sum += columnValue(person, column); });
            const mean = sum / count;
            let squares = 0;
            people.forEach(function (person) {
                const distance = columnValue(person, column) - mean;
                squares += distance * distance;
            });
            means.push(mean);
            spreads.push(Math.sqrt(squares / count) || 1);      // a column with no spread stays as it is
        });
        const model = {
            columns: columns.slice(),
            means: means,
            spreads: spreads,
            inputs: people.map(function (person) {
                return columns.map(function (column, j) { return (columnValue(person, column) - means[j]) / spreads[j]; });
            }),
            labels: labels.slice(),
            weights: columns.map(function () { return 0; }),
            bias: 0,
            steps: 0,
            chances: new Array(count).fill(0.5),
            losses: [],                       // the loss after 0, 1, 2... steps (for the chart)
            gradient: null                    // the gradient at the current weights
        };
        model.gradient = evaluate(model);
        model.losses.push(model.gradient.loss);
        return model;
    }

    // The sigmoid, written so that e^z never overflows
    function sigmoid(z) {
        if (z >= 0) return 1 / (1 + Math.exp(-z));
        const e = Math.exp(z);
        return e / (1 + e);
    }

    // log(1 + e^z) without overflow. The loss of one applicant is softplus(z) − y·z, which is
    // the same as −[y·log(chance) + (1 − y)·log(1 − chance)], but never takes log(0)
    function softplus(z) {
        return Math.max(z, 0) + Math.log1p(Math.exp(-Math.abs(z)));
    }

    // The loss and its gradient at the model's current weights. Also refreshes model.chances.
    function evaluate(model) {
        const count = model.inputs.length;
        const size = model.weights.length;
        const gradient = new Array(size).fill(0);
        let gradientBias = 0;
        let loss = 0;
        for (let i = 0; i < count; i++) {
            const x = model.inputs[i];
            let z = model.bias;
            for (let j = 0; j < size; j++) z += model.weights[j] * x[j];
            const chance = sigmoid(z);
            model.chances[i] = chance;
            loss += softplus(z) - model.labels[i] * z;
            const error = chance - model.labels[i];          // how far the chance is from the label
            for (let j = 0; j < size; j++) gradient[j] += error * x[j];
            gradientBias += error;
        }
        let penalty = 0;
        for (let j = 0; j < size; j++) {
            gradient[j] = gradient[j] / count + TRAINING.l2 * model.weights[j];
            penalty += model.weights[j] * model.weights[j];
        }
        return { loss: loss / count + (TRAINING.l2 / 2) * penalty, weights: gradient, bias: gradientBias / count };
    }

    // One step of gradient descent: every weight moves a little way downhill
    function trainStep(model) {
        const gradient = model.gradient;
        for (let j = 0; j < model.weights.length; j++) model.weights[j] -= TRAINING.rate * gradient.weights[j];
        model.bias -= TRAINING.rate * gradient.bias;
        model.steps += 1;
        model.gradient = evaluate(model);
        model.losses.push(model.gradient.loss);
    }

    // The rest of a training, at once
    function trainFully(model) {
        while (model.steps < TRAINING.steps) trainStep(model);
        return model;
    }

    // The model's chances for other applicants, with the weights it has now. Used for the
    // moment between new applicants arriving and the model being trained on them.
    function applyModel(model, people) {
        model.chances = people.map(function (person) {
            let z = model.bias;
            model.columns.forEach(function (column, j) {
                z += (model.weights[j] * (columnValue(person, column) - model.means[j])) / model.spreads[j];
            });
            return sigmoid(z);
        });
    }

    // The weight of one column, or null when the model doesn't use it
    function weightOf(model, column) {
        const at = model.columns.indexOf(column);
        return at === -1 ? null : model.weights[at];
    }

    /* =========================================================
       5. MEASURING FAIRNESS
       ========================================================= */
    // Accepted (1) or not (0): a chance at or above the applicant's group's threshold
    function decide(model, people, thresholds) {
        return people.map(function (person, i) {
            return model.chances[i] >= thresholds[person.group] ? 1 : 0;
        });
    }

    // A share as a whole percentage (null when there is nobody to count)
    function percent(part, whole) {
        return whole > 0 ? Math.round((100 * part) / whole) : null;
    }

    // The scorecard: for each row of ROWS, [Blue, Orange] in whole percentages.
    // decisions: the model's (null before any training: the model's rows are null)
    function measure(people, decisions) {
        const tally = [0, 1].map(function () {
            return { people: 0, past: 0, accepted: 0, qualified: 0, qualifiedIn: 0, rightTruth: 0, rightPast: 0 };
        });
        people.forEach(function (person, i) {
            const group = tally[person.group];
            group.people += 1;
            group.past += person.past;
            group.qualified += person.qualified;
            if (!decisions) return;
            const yes = decisions[i];
            group.accepted += yes;
            if (yes && person.qualified) group.qualifiedIn += 1;
            if (yes === person.qualified) group.rightTruth += 1;
            if (yes === person.past) group.rightPast += 1;
        });
        function both(part, whole) {
            return tally.map(function (group) { return percent(group[part], group[whole || "people"]); });
        }
        return {
            counts: tally,
            past: both("past"),
            accepted: decisions ? both("accepted") : null,
            tpr: decisions ? both("qualifiedIn", "qualified") : null,
            truth: decisions ? both("rightTruth") : null,
            agree: decisions ? both("rightPast") : null
        };
    }

    // The gaps: Orange minus Blue, in percentage points, of the whole percentages shown
    // (so the numbers on screen always add up). null for a row that isn't measured.
    function gaps(card) {
        const out = {};
        ROWS.forEach(function (row) {
            const pair = card[row.id];
            out[row.id] = pair && pair[0] !== null && pair[1] !== null ? pair[1] - pair[0] : null;
        });
        return out;
    }

    // The test score where an applicant's chance reaches the threshold, for one lane
    // (a group and a neighbourhood). Above it the model accepts. NaN when the score
    // doesn't decide (the model doesn't use it, or gives it no positive weight).
    function cutOff(model, group, south, threshold) {
        const at = model.columns.indexOf("score");
        if (at === -1 || !(model.weights[at] > 1e-9)) return NaN;
        let z = Math.log(threshold / (1 - threshold)) - model.bias;
        model.columns.forEach(function (column, j) {
            if (j === at) return;
            const value = column === "south" ? south : group;
            z -= (model.weights[j] * (value - model.means[j])) / model.spreads[j];
        });
        return model.means[at] + (model.spreads[at] * z) / model.weights[at];
    }

    // The "Try this" goals. Each gets the situation after a training or a threshold change:
    //   { trained, preset, columns, betterLabels, card (measure()), gaps (gaps()) }
    function hasColumn(situation, column) {
        return situation.columns.indexOf(column) !== -1;
    }

    function rightAboutBoth(situation) {
        return Math.min(situation.card.truth[0], situation.card.truth[1]) >= GOAL_ACCURACY;
    }

    const GOALS = [
        // 1. Trained on the history with all the columns, in "Unfair decisions", with the gap there
        //    to be found: Orange accepted more than 5 points less often (a threshold that hides the
        //    gap doesn't count, because the insight that opens talks about it)
        function (s) {
            return s.trained && s.preset === "decisions" && !s.betterLabels && s.columns.length === COLUMNS.length &&
                s.gaps.accepted < -GAP_LIMIT;
        },
        // 2. The same without the group column, but with the neighbourhood: Orange still loses out
        function (s) {
            return s.trained && s.preset === "decisions" && !s.betterLabels && !hasColumn(s, "orange") &&
                hasColumn(s, "south") && s.gaps.accepted < -GAP_LIMIT;
        },
        // 3. An acceptance gap under 5 points, and right about at least 80 % of each group
        function (s) {
            return s.trained && Math.abs(s.gaps.accepted) < GAP_LIMIT && rightAboutBoth(s);
        },
        // 4. "Unfair test": qualified people get in equally often (and still at least 80 % right)
        function (s) {
            return s.trained && s.preset === "test" && Math.abs(s.gaps.tpr) <= GAP_LIMIT && rightAboutBoth(s);
        }
    ];

    /* =========================================================
       6. DRAWING THE APPLICANTS
       Two rows, Blue above and Orange below. Each row has two lanes, the
       North and the South, so the neighbourhood shows too. A dot sits at
       its test score; dots at nearly the same score pile up and down
       ("a beeswarm"). Filled = accepted, outlined = rejected, a diamond =
       truly qualified. In each lane a line shows where the model's chance
       reaches the threshold: one line per group, with a step in it when
       the neighbourhood changes the model's mind.
       ========================================================= */
    // Where everything goes for the canvas's current size. counts: how many applicants each lane
    // holds (Blue North, Blue South, Orange North, Orange South). A crowded lane gets more of its
    // row's height, so its dots pile up without covering each other as much.
    function sceneLayout(width, height, counts) {
        const left = DRAW.side;
        const right = width - DRAW.side;
        const rowHeight = Math.max(40, (height - DRAW.top - 2 * DRAW.head - DRAW.groupGap - DRAW.axis) / 2);
        const heads = [];
        const lanes = [];             // group * 2 + south: Blue North, Blue South, Orange North, Orange South
        let y = DRAW.top;
        for (let group = 0; group < 2; group++) {
            heads.push(y + DRAW.head / 2);
            y += DRAW.head;
            const shares = [counts[group * 2] + DRAW.laneFloor, counts[group * 2 + 1] + DRAW.laneFloor];
            shares.forEach(function (share) {
                const laneHeight = (rowHeight * share) / (shares[0] + shares[1]);
                lanes.push({ top: y, middle: y + laneHeight / 2, bottom: y + laneHeight });
                y += laneHeight;
            });
            y += DRAW.groupGap;
        }
        return {
            width: width,
            height: height,
            left: left,
            right: right,
            radius: A.util.clamp(width / DRAW.radius.per, DRAW.radius.min, DRAW.radius.max),
            heads: heads,
            lanes: lanes,
            divide: lanes[1].bottom + DRAW.groupGap / 2,      // between the Blue and the Orange rows
            axis: height - DRAW.axis + 8,
            x: function (score) { return left + ((right - left) * score) / 100; }
        };
    }

    // Piles up dots that would cover each other: each keeps its x (its test score) and goes to
    // the free spot nearest to the middle of its lane. xs: the dots' x; gap: the distance between
    // two dot centres. Returns each dot's y offset from the middle. A pile too tall for the lane
    // (half: the most room on each side) is squeezed to fit, so its dots overlap a little.
    function swarm(xs, gap, half) {
        const order = xs.map(function (x, i) { return i; }).sort(function (a, b) { return xs[a] - xs[b] || a - b; });
        const offsets = new Array(xs.length).fill(0);
        const placed = [];               // the dots placed so far, from left to right
        order.forEach(function (i) {
            // Each placed dot closer than gap (left and right) blocks a stretch of heights
            const blocked = [];
            for (let k = placed.length - 1; k >= 0; k--) {
                const j = placed[k];
                const dx = xs[i] - xs[j];
                if (dx >= gap) break;                     // every dot further back is further away
                const dy = Math.sqrt(gap * gap - dx * dx);
                blocked.push([offsets[j] - dy, offsets[j] + dy]);
            }
            // The free height nearest to the middle: 0 or the edge of a blocked stretch
            const tries = [0];
            blocked.forEach(function (stretch) { tries.push(stretch[0], stretch[1]); });
            tries.sort(function (a, b) { return Math.abs(a) - Math.abs(b); });
            for (let k = 0; k < tries.length; k++) {
                const y = tries[k];
                const free = blocked.every(function (stretch) { return y <= stretch[0] + 1e-6 || y >= stretch[1] - 1e-6; });
                if (free) {
                    offsets[i] = y;
                    break;
                }
            }
            placed.push(i);
        });
        let tallest = 0;
        offsets.forEach(function (y) { tallest = Math.max(tallest, Math.abs(y)); });
        if (tallest > half) offsets.forEach(function (y, i) { offsets[i] = (y * half) / tallest; });
        return offsets;
    }

    // How many applicants each lane holds: [Blue North, Blue South, Orange North, Orange South]
    function laneCounts(people) {
        const counts = [0, 0, 0, 0];
        people.forEach(function (person) { counts[person.group * 2 + person.south] += 1; });
        return counts;
    }

    // Every applicant's place on the canvas: [{ x, y }], one per applicant
    function placeDots(people, layout) {
        const places = people.map(function (person) { return { x: layout.x(person.score), y: 0 }; });
        const gap = 2 * layout.radius + DRAW.dotGap;
        layout.lanes.forEach(function (lane, laneIndex) {
            const members = [];
            people.forEach(function (person, i) {
                if (person.group * 2 + person.south === laneIndex) members.push(i);
            });
            const half = Math.max(0, (lane.bottom - lane.top) / 2 - layout.radius - 1);
            const offsets = swarm(members.map(function (i) { return places[i].x; }), gap, half);
            members.forEach(function (i, k) { places[i].y = lane.middle + offsets[k]; });
        });
        return places;
    }

    // One applicant: a circle, or a diamond when truly qualified; filled when accepted,
    // outlined (on the background colour) when rejected
    function drawApplicant(context, x, y, radius, color, filled, diamond, background) {
        context.beginPath();
        if (diamond) {
            const reach = radius * 1.32;
            context.moveTo(x, y - reach);
            context.lineTo(x + reach, y);
            context.lineTo(x, y + reach);
            context.lineTo(x - reach, y);
            context.closePath();
        } else {
            context.arc(x, y, radius, 0, Math.PI * 2);
        }
        if (filled) {
            context.fillStyle = color;
            context.fill();
        } else {
            context.fillStyle = background;
            context.fill();
            context.lineWidth = 1.5;
            context.strokeStyle = color;
            context.stroke();
        }
    }

    // A small box of text lines (the twin pair's label), kept inside the canvas.
    // x: where the twins are (the box goes to its side: 1 right, -1 left); bottom: the box's lower edge
    function drawLabel(context, lines, x, bottom, side, layout, c) {
        context.font = kit.font(12, 600, "body");
        let width = 0;
        lines.forEach(function (line) { width = Math.max(width, context.measureText(line).width); });
        const lineHeight = 17;
        const boxWidth = width + 18;
        const boxHeight = lines.length * lineHeight + 10;
        let left = side > 0 ? x + 14 : x - 14 - boxWidth;
        left = A.util.clamp(left, 4, layout.width - boxWidth - 4);
        const top = A.util.clamp(bottom - boxHeight, 4, layout.height - boxHeight - 4);
        context.fillStyle = kit.alpha(c.surface, 0.94);
        context.strokeStyle = kit.alpha(c.text, 0.35);
        context.lineWidth = 1;
        context.beginPath();
        A.canvas.roundRect(context, left, top, boxWidth, boxHeight, 8);
        context.fill();
        context.stroke();
        context.textAlign = "left";
        context.textBaseline = "middle";
        lines.forEach(function (line, i) {
            context.fillStyle = i === 0 ? c.text : c.muted;
            context.font = kit.font(12, i === 0 ? 700 : 600, "body");
            context.fillText(line, left + 9, top + 5 + lineHeight * (i + 0.5));
        });
    }

    // The whole picture. scene = { layout, places, people, filled (0/1 per applicant),
    // cuts (per lane: a test score, or NaN for no line), active (an applicant or -1),
    // texts: { heads: [Blue, Orange], counts: [..], lanes: [North, South], axis, pair: [lines], waiting } }
    function drawScene(view, scene) {
        const context = view.ctx;
        const layout = scene.layout;
        const c = kit.colors();
        const radius = layout.radius;
        context.clearRect(0, 0, view.width, view.height);

        // 1. A faint band for each lane, and grid lines along the score
        layout.lanes.forEach(function (lane, index) {
            context.fillStyle = kit.alpha(c.text, index % 2 === 0 ? 0.035 : 0.055);
            context.fillRect(layout.left, lane.top, layout.right - layout.left, lane.bottom - lane.top);
        });
        context.strokeStyle = c.grid;
        context.lineWidth = 1;
        context.beginPath();
        for (let score = 0; score <= 100; score += DRAW.tick) {
            const x = Math.round(layout.x(score)) + 0.5;
            context.moveTo(x, layout.lanes[0].top);
            context.lineTo(x, layout.lanes[3].bottom);
        }
        context.stroke();

        // 2. The group names with their counts, and the lane names
        context.textBaseline = "middle";
        context.textAlign = "left";
        layout.heads.forEach(function (y, group) {
            kit.marker(context, "dot", layout.left + 5, y, 5, c.series[GROUPS[group].color]);
            context.font = kit.font(13, 700, "body");
            context.fillStyle = c.text;
            const name = scene.texts.heads[group];
            context.fillText(name, layout.left + 16, y);
            const countX = layout.left + 16 + context.measureText(name).width + 10;
            context.font = kit.font(12, 500, "body");
            context.fillStyle = c.muted;
            context.fillText(scene.texts.counts[group], countX, y);
        });
        context.font = kit.font(11, 600, "body");
        context.fillStyle = c.muted;
        layout.lanes.forEach(function (lane, index) {
            context.fillText(scene.texts.lanes[index % 2], layout.left + 4, lane.top + 9);
        });

        // 3. The threshold lines: in each lane where the chance reaches the threshold, joined
        //    into one line per group (with a step where North and South differ)
        context.strokeStyle = kit.alpha(c.text, 0.85);
        context.lineWidth = 2;
        [0, 1].forEach(function (group) {
            let previous = null;
            [0, 1].forEach(function (south) {
                const cut = scene.cuts[group * 2 + south];
                const lane = layout.lanes[group * 2 + south];
                if (!(cut >= 0 && cut <= 100)) {
                    previous = null;
                    return;
                }
                const x = Math.round(layout.x(cut)) + 0.5;
                context.beginPath();
                if (previous !== null) {
                    context.moveTo(previous, lane.top);
                    context.lineTo(x, lane.top);
                } else {
                    context.moveTo(x, lane.top + 2);
                }
                context.lineTo(x, lane.bottom - 2);
                context.stroke();
                previous = x;
            });
        });

        // 4. The applicants (the others fade while a twin pair is shown)
        const pair = scene.active === -1 ? null : [scene.active, twinOf(scene.active)];
        let fade = 1;
        if (pair) fade = DRAW.dim;
        else if (scene.texts.waiting) fade = DRAW.waitingFade;
        context.globalAlpha = fade;
        scene.people.forEach(function (person, i) {
            if (pair && (i === pair[0] || i === pair[1])) return;
            const place = scene.places[i];
            drawApplicant(context, place.x, place.y, radius, c.series[GROUPS[person.group].color], scene.filled[i] === 1, person.qualified === 1, c.surface);
        });
        context.globalAlpha = 1;

        // 5. The twin pair: a line between the twins, a ring around each, and a label
        if (pair) {
            const a = scene.places[pair[0]];
            const b = scene.places[pair[1]];
            context.strokeStyle = kit.alpha(c.text, 0.75);
            context.lineWidth = 1.5;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
            pair.forEach(function (i) {
                const place = scene.places[i];
                const person = scene.people[i];
                drawApplicant(context, place.x, place.y, radius + 1, c.series[GROUPS[person.group].color], scene.filled[i] === 1, person.qualified === 1, c.surface);
                context.strokeStyle = c.text;
                context.lineWidth = 2;
                context.beginPath();
                context.arc(place.x, place.y, radius + 5, 0, Math.PI * 2);
                context.stroke();
            });
            // The label sits just above the line between the rows (in the Blue South lane,
            // where few dots are), beside the twins, so it never covers the Orange row's name
            const middle = (a.x + b.x) / 2;
            drawLabel(context, scene.texts.pair, middle, layout.lanes[1].bottom - 2, middle < layout.width / 2 ? 1 : -1, layout, c);
        }

        // 6. The score axis: a number every 20 points, and its name
        context.font = kit.font(11, 500, "mono");
        context.fillStyle = c.muted;
        context.textAlign = "center";
        context.textBaseline = "top";
        for (let score = 0; score <= 100; score += DRAW.label) {
            context.fillText(A.format.number(score), layout.x(score), layout.axis);
        }
        context.font = kit.font(11, 600, "body");
        context.textAlign = "right";
        context.textBaseline = "bottom";
        context.fillText(scene.texts.axis, layout.right, layout.height - 2);

        // 7. "Training…" over the picture while a training is on its way
        if (scene.texts.waiting) {
            context.font = kit.font(13, 700, "body");
            context.textAlign = "center";
            context.textBaseline = "middle";
            const width = context.measureText(scene.texts.waiting).width + 28;
            const x = layout.width / 2;
            context.fillStyle = kit.alpha(c.surface, 0.92);
            context.strokeStyle = kit.alpha(c.accent2, 0.6);
            context.lineWidth = 1;
            context.beginPath();
            A.canvas.roundRect(context, x - width / 2, layout.divide - 16, width, 32, 16);
            context.fill();
            context.stroke();
            context.fillStyle = c.text;
            context.fillText(scene.texts.waiting, x, layout.divide);
        }
    }

    // The applicant nearest to a point (in CSS px), or -1 when none is within reach
    function nearest(places, x, y, reach) {
        let best = -1;
        let bestDistance = reach * reach;
        places.forEach(function (place, i) {
            const distance = (place.x - x) * (place.x - x) + (place.y - y) * (place.y - y);
            if (distance <= bestDistance) {
                best = i;
                bestDistance = distance;
            }
        });
        return best;
    }

    /* =========================================================
       7. THE EXPERIMENT
       ========================================================= */
    A.lab.define("bias", {
        // The maths, for dev/tests/bias.math.js (the hub doesn't use it)
        maths: {
            settings: { PAIRS: PAIRS, PASS_MARK: PASS_MARK, MAJORITY: MAJORITY, PRESETS: PRESETS, SEEDS: SEEDS, TRAINING: TRAINING, THRESHOLD: THRESHOLD, GAP_LIMIT: GAP_LIMIT, GOAL_ACCURACY: GOAL_ACCURACY },
            makeApplicants: makeApplicants,
            twinOf: twinOf,
            makeModel: makeModel,
            evaluate: evaluate,
            trainStep: trainStep,
            trainFully: trainFully,
            weightOf: weightOf,
            decide: decide,
            measure: measure,
            gaps: gaps,
            cutOff: cutOff,
            goals: GOALS,
            swarm: swarm,
            sceneLayout: sceneLayout,
            laneCounts: laneCounts,
            placeDots: placeDots
        },

        create: function (stage, ctx) {
            // ----- State -----
            // phase: "untrained" (never trained), "waiting" (the short "Training…" state),
            // "running" or "paused" (with "Show training"), "trained"
            let preset = "decisions";
            let seedIndex = 0;
            let people = makeApplicants(SEEDS[0], preset);
            let walk = walkingOrder(people);
            let columns = COLUMNS.map(function (column) { return column.id; });
            let betterLabels = false;
            let model = null;                   // the model being trained or trained (null: never trained)
            let phase = "untrained";
            let view = "past";                  // what the dots show: "past" or "model"
            let active = -1;                    // the applicant whose twin pair is shown (-1: none)
            let activeBy = "";                  // who chose it: "pointer" (a mouse), "touch" or "key"
            let waitTimer = 0;
            let waitOwed = false;               // the hub paused us during "Training…": finish on resume
            let resumeOnShow = false;           // the loop ran when the hub paused us
            let places = [];                    // each applicant's place on the canvas
            let layout = null;
            let saysText = "";                  // the scorecard's sentences, as last written
            let panelsAt = 0;                   // when the panels were last written during a watched training

            // ----- The page: kit parts, plus the scorecard table and texts -----
            const ui = kit.layout(stage, { side: true });
            ui.root.classList.add("bd-root");

            // Top: the story, the idea with glossary links, and the data
            const story = textOf("p", "bd-lead", "lab.bias.story");
            const twins = textOf("p", "bd-lead", "lab.bias.twins");
            const idea = el("p", "bd-idea");
            const presetSelect = kit.select({
                labelKey: "lab.bias.storyLabel",
                options: [{ value: "decisions", labelKey: "lab.bias.presetDecisions" }, { value: "test", labelKey: "lab.bias.presetTest" }],
                value: preset,
                onChange: choosePreset
            });
            const newButton = kit.button("lab.bias.newApplicants", { icon: "dice", onClick: newApplicants });
            const dataRow = kit.row([presetSelect, newButton]);
            dataRow.classList.add("bd-data");
            const presetNote = el("p", "bd-preset-note");
            ui.top.append(story, twins, idea, dataRow, presetNote);

            // Main: what the dots show and the Train button, the picture, its key, the twin
            // pair in words, and the model's settings
            const viewSwitch = kit.segmented({
                labelKey: "lab.bias.view",
                options: [{ value: "model", labelKey: "lab.bias.viewModel" }, { value: "past", labelKey: "lab.bias.viewPast" }],
                value: view,
                onChange: function (value) {
                    view = value;
                    render();
                }
            });
            const trainButton = kit.button("lab.bias.train", { icon: "sparkle", variant: "primary", onClick: pressTrain });
            const stepButton = kit.button("lab.kit.step", { icon: "step", onClick: stepOnce });
            const status = kit.status("ready");
            const viewRow = kit.row([viewSwitch, kit.toolbar([trainButton, stepButton, status])]);
            viewRow.classList.add("bd-view");
            ui.main.appendChild(viewRow);

            const scene = kit.canvas(ui.main, { aspect: DRAW.aspect, minHeight: DRAW.minHeight, maxHeight: DRAW.maxHeight, labelKey: "lab.bias.canvas" });
            scene.box.classList.add("bd-scene");
            scene.canvas.tabIndex = 0;
            scene.canvas.setAttribute("role", "application");     // a widget with its own keys (the arrows)
            const legend = kit.legend([
                { labelKey: "lab.bias.legendAccepted", color: "var(--text-muted)", shape: "dot" },
                { labelKey: "lab.bias.legendRejected", color: "var(--text-muted)", shape: "ring" },
                { labelKey: "lab.bias.legendQualified", color: "var(--text-muted)", shape: "diamond" },
                { labelKey: "lab.bias.legendLine", color: "var(--text)", shape: "line" }
            ]);
            const pairBox = el("div", "bd-pair");
            const truthNote = kit.hint({ key: "lab.bias.truthNote" });

            const columnChips = kit.chips({
                labelKey: "lab.bias.columns",
                multi: true,
                options: COLUMNS.map(function (column) { return { value: column.id, labelKey: column.chipKey }; }),
                values: columns,
                onChange: function (values) {
                    columns = values;
                    changed();
                }
            });
            const noColumns = kit.hint({ key: "lab.bias.noColumns", tone: "warn" });
            const labelsToggle = kit.toggle({
                labelKey: "lab.bias.betterLabels",
                hintKey: "lab.bias.betterLabelsHint",
                onChange: function (on) {
                    betterLabels = on;
                    changed();
                }
            });
            const watchToggle = kit.toggle({ labelKey: "lab.bias.showTraining", hintKey: "lab.bias.showTrainingHint", onChange: setWatching });
            const chartBox = el("div", "bd-chart");
            const chartView = kit.canvas(chartBox, { height: 150, labelKey: "lab.bias.lossChart" });
            const chart = kit.lineChart(chartView, {
                series: [{ values: [], colorIndex: 0, labelKey: "lab.kit.loss", fill: true }],
                xLabelKey: "lab.kit.stepCount",
                yLabelKey: "lab.kit.loss"
            });
            const modelGroup = kit.group("lab.bias.modelGroup", [columnChips, noColumns, labelsToggle, watchToggle, chartBox]);
            ui.main.append(legend.element, pairBox, truthNote.element, modelGroup);

            // Beside: the scorecard, the decision (thresholds), what the model learned
            const table = scoreTable();
            const tableWrap = el("div", "bd-table-wrap");
            tableWrap.appendChild(table.element);
            const says = el("ul", "bd-says", { role: "list" });
            const scorePanel = panel("bd-score", "lab.bias.scorecard");
            scorePanel.append(tableWrap, textOf("p", "bd-help", "lab.bias.gapNote"), says);

            const shared = thresholdSlider("lab.bias.threshold");
            const separateToggle = kit.toggle({ labelKey: "lab.bias.separate", onChange: setSeparate });
            const blueSlider = thresholdSlider("lab.bias.thresholdBlue");
            const orangeSlider = thresholdSlider("lab.bias.thresholdOrange");
            const decisionGroup = kit.group("lab.bias.decisionGroup", [
                shared, separateToggle, blueSlider, orangeSlider, textOf("p", "bd-help", "lab.bias.thresholdHint")
            ]);

            const weightsBox = el("div", "bd-weights");
            const weightBars = kit.bars(weightsBox, { items: [], signed: true, max: WEIGHT_MAX, format: weightText });
            const learnedEmpty = el("p", "bd-empty");
            const proxyLine = el("p", "bd-proxy");
            const learnedPanel = panel("bd-learned", "lab.bias.learned");
            learnedPanel.append(textOf("p", "bd-help", "lab.bias.learnedHelp"), weightsBox, learnedEmpty, proxyLine);
            ui.side.append(scorePanel, decisionGroup, learnedPanel);

            // Below: "What's happening?", "Try this" and two real cases
            const explain = kit.explain({
                steps: [
                    { key: "lab.bias.step1" }, { key: "lab.bias.step2" }, { key: "lab.bias.step3" },
                    { key: "lab.bias.step4" }, { key: "lab.bias.step5" }
                ]
            });
            explain.setText("lab.bias.toyNote");
            const challenges = kit.challenges({
                ctx: ctx,
                items: GOALS.map(function (goal, i) {
                    return { key: "lab.bias.ch" + (i + 1), insightKey: "lab.bias.ch" + (i + 1) + "Why", check: goal };
                })
            });
            const realList = el("ul", "bd-cases", { role: "list" });
            ["lab.bias.realHiring", "lab.bias.realHealth"].forEach(function (key) {
                realList.appendChild(textOf("li", "bd-case", key));
            });
            const realPanel = panel("bd-real", "lab.bias.realTitle");
            realPanel.appendChild(realList);
            ui.bottom.append(explain.element, challenges.element, realPanel);

            const loop = kit.loop({ rate: WATCH_RATE, update: watchStep, draw: renderTraining });
            scene.onResize(function () {
                layout = null;              // the dots are placed again for the new size
                render();
            });

            // ----- Small builders that need the page -----
            function thresholdSlider(labelKey) {
                return kit.slider({
                    labelKey: labelKey,
                    min: THRESHOLD.min,
                    max: THRESHOLD.max,
                    step: THRESHOLD.step,
                    value: THRESHOLD.value,
                    format: function (value) { return A.format.percent(value); },
                    onInput: function () { changeThreshold(false); },
                    onChange: function () { changeThreshold(true); }
                });
            }

            // The texts that hold glossary links, written again after a language change
            function writeSentences() {
                sentence(idea, "lab.bias.ideaLine", {
                    data: function () { return kit.termLink("data", "lab.bias.termData"); },
                    training: function () { return kit.termLink("training", "lab.bias.termTraining"); },
                    bias: function () { return kit.termLink("bias", "lab.bias.termBias"); }
                });
                sentence(proxyLine, "lab.bias.proxyLine", {
                    proxy: function () { return kit.termLink("proxy", "lab.bias.termProxy"); }
                });
            }

            // ----- What the controls do -----
            function thresholds() {
                if (separateToggle.checked()) return [blueSlider.value(), orangeSlider.value()];
                return [shared.value(), shared.value()];
            }

            function labelsFor(list) {
                return list.map(function (person) { return betterLabels ? person.qualified : person.past; });
            }

            // A change to the data, the columns or the labels: train again (once trained)
            function changed() {
                if (model) startTraining();
                else render();
            }

            function choosePreset(value) {
                preset = value;
                people = makeApplicants(SEEDS[seedIndex], preset);
                newPeople();
            }

            function newApplicants() {
                seedIndex = (seedIndex + 1) % SEEDS.length;
                people = makeApplicants(SEEDS[seedIndex], preset);
                newPeople();
                ctx.announce(t("lab.bias.sayNew"));
            }

            function newPeople() {
                walk = walkingOrder(people);
                layout = null;                      // the dots are placed again
                active = -1;
                activeBy = "";
                // Until it has trained on them, the old model decides about the new applicants
                if (model) applyModel(model, people);
                changed();
            }

            function setSeparate(on) {
                if (on) {
                    blueSlider.set(shared.value());
                    orangeSlider.set(shared.value());
                }
                showSliders();
                changeThreshold(true);
            }

            function showSliders() {
                const on = separateToggle.checked();
                A.dom.setHidden(shared.element, on);
                A.dom.setHidden(blueSlider.element, !on);
                A.dom.setHidden(orangeSlider.element, !on);
            }

            // A threshold moved: the model stays the same, only its decisions change.
            // atEnd: the slider was let go (or moved by a key), so the result is announced.
            function changeThreshold(atEnd) {
                render();
                if (atEnd && phase === "trained") ctx.announce(acceptedSentence());
            }

            // The Train button: train (or train again); with "Show training" it pauses and continues
            function pressTrain() {
                if (phase === "running") {
                    loop.stop();
                    setPhase("paused");
                    render();                       // the panels catch up with the picture
                } else if (phase === "paused") {
                    setPhase("running");
                    loop.start();
                } else if (phase !== "waiting") {
                    startTraining();
                }
            }

            // A new training from the start. Without "Show training" the result comes after a
            // short "Training…" (the maths itself takes a few milliseconds); with it, the steps
            // run one by one so the loss can be watched going down.
            function startTraining() {
                stopTraining();
                if (watchToggle.checked()) {
                    model = makeModel(people, columns, labelsFor(people));
                    showModel();
                    setPhase("running");
                    loop.start();
                } else {
                    setPhase("waiting");
                    waitTimer = setTimeout(finishWaiting, TRAINING_FLASH);
                }
                render();
            }

            function finishWaiting() {
                waitTimer = 0;
                model = trainFully(makeModel(people, columns, labelsFor(people)));
                showModel();
                finish();
            }

            // The dots show the model's decisions once there is a model
            function showModel() {
                view = "model";
                viewSwitch.set("model");
                viewSwitch.setDisabled(false);
                chart.set({ series: [{ values: model.losses, colorIndex: 0, labelKey: "lab.kit.loss", fill: true }] });
            }

            function stopTraining() {
                loop.stop();
                clearTimeout(waitTimer);
                waitTimer = 0;
                waitOwed = false;
            }

            // One step of the watched training (the loop calls it); the last one finishes
            function watchStep() {
                trainStep(model);
                if (model.steps >= TRAINING.steps) finish();
            }

            // Step: one step of training by hand. It shows the training (the loss chart), and
            // starts a new training when none is on its way.
            function stepOnce() {
                if (!watchToggle.checked()) {
                    watchToggle.set(true);
                    A.dom.setHidden(chartBox, false);
                }
                if (phase !== "running" && phase !== "paused") {
                    stopTraining();
                    model = makeModel(people, columns, labelsFor(people));
                    showModel();
                }
                loop.stop();
                setPhase("paused");
                watchStep();
                if (phase === "paused") render();      // (the last step finishes, and finish() renders)
            }

            function setWatching(on) {
                A.dom.setHidden(chartBox, !on);
                if (on && phase === "waiting") {
                    startTraining();                       // watch this training instead
                } else if (!on && (phase === "running" || phase === "paused")) {
                    loop.stop();
                    trainFully(model);                     // the rest at once
                    finish();
                } else {
                    render();
                }
            }

            function finish() {
                loop.stop();
                setPhase("trained");
                render();
                const card = measure(people, decide(model, people, thresholds()));
                ctx.announce(t("lab.bias.sayTrained") + " " + acceptedSentence());
                ctx.track("milestone", {
                    kind: "trained",
                    preset: preset,
                    columns: columns.join("+") || "none",
                    labels: betterLabels ? "truth" : "past",
                    gap: gaps(card).accepted
                });
            }

            function setPhase(next) {
                phase = next;
                status.set({ untrained: "ready", waiting: "running", running: "running", paused: "paused", trained: "done" }[next]);
                // A busy button keeps the keyboard focus (it is only aria-disabled)
                trainButton.setBusy(next === "waiting");
                trainButton.setLabel({
                    untrained: "lab.bias.train", waiting: "lab.bias.training", running: "lab.kit.pause",
                    paused: "lab.bias.continue", trained: "lab.bias.trainAgain"
                }[next]);
                trainButton.setIcon({ untrained: "sparkle", waiting: "", running: "pause", paused: "play", trained: "reset" }[next]);
                stepButton.setDisabled(next === "waiting");
            }

            // ----- The twin pair: pointer, touch and keyboard -----
            // The applicant under the pointer (or -1)
            function pointAt(event) {
                const box = scene.canvas.getBoundingClientRect();
                return nearest(places, event.clientX - box.left, event.clientY - box.top, Math.max(DRAW.hit, layout ? layout.radius * 3 : 0));
            }

            // Where the keyboard starts: in the Blue row, the twin pair nearest the middle that
            // is treated differently (the lesson at once), or the middle when no pair is
            function firstForKeys() {
                const row = walk[0];
                const shown = decisionsShown(thresholds());
                const middle = Math.floor(row.length / 2);
                let best = -1;
                row.forEach(function (index, place) {
                    if (shown[index] === shown[twinOf(index)]) return;
                    if (best === -1 || Math.abs(place - middle) < Math.abs(best - middle)) best = place;
                });
                return row[best === -1 ? middle : best];
            }

            // Shows the twin pair of an applicant (-1: none). by: "pointer", "touch" or "key".
            // A touch or a key also reads the pair out; the mouse only shows it (it moves too often).
            function setActive(index, by) {
                if (index === active && by === activeBy) return;
                active = index;
                activeBy = index === -1 ? "" : by;
                renderPicture();
                if (index !== -1 && by !== "pointer") ctx.announce(pairSentence(index));
            }

            scene.canvas.addEventListener("pointermove", function (event) {
                if (event.pointerType !== "mouse" || !layout) return;
                const index = pointAt(event);
                if (index !== -1) setActive(index, "pointer");
                else if (activeBy === "pointer") setActive(-1, "");
            });
            scene.canvas.addEventListener("pointerleave", function () {
                if (activeBy === "pointer") setActive(-1, "");
            });
            scene.canvas.addEventListener("pointerdown", function (event) {
                if (!layout) return;
                const index = pointAt(event);
                if (event.pointerType !== "mouse") {
                    setActive(index, "touch");          // a tap away from the dots lets go of the pair
                } else if (index !== -1) {
                    ctx.announce(pairSentence(index));  // a click reads the pair out
                }
            });
            // Reached with the Tab key (not a click): show a pair straight away (the one under
            // the mouse, if there is one) and read it out
            scene.canvas.addEventListener("focus", function () {
                if (scene.canvas.matches(":focus-visible")) setActive(active === -1 ? firstForKeys() : active, "key");
            });
            scene.canvas.addEventListener("blur", function () {
                if (activeBy === "key") setActive(-1, "");
            });
            // The keys: ← → walk along a row (by test score), PageUp / PageDown 10 at a time,
            // Home / End to the ends; ↑ goes to the Blue twin and ↓ to the Orange one; Escape lets go
            const MOVES = { ArrowLeft: -1, ArrowRight: 1, PageUp: -DRAW.pageJump, PageDown: DRAW.pageJump, Home: -PAIRS, End: PAIRS };
            scene.canvas.addEventListener("keydown", function (event) {
                const key = event.key;
                const twinKey = key === "ArrowUp" || key === "ArrowDown";
                if (key === "Escape" && active !== -1) {
                    event.preventDefault();
                    setActive(-1, "key");
                    return;
                }
                if (MOVES[key] === undefined && !twinKey) return;
                event.preventDefault();
                if (active === -1) {
                    setActive(firstForKeys(), "key");
                    return;
                }
                let next = active;
                if (twinKey) {
                    const wanted = key === "ArrowUp" ? 0 : 1;
                    if (people[active].group !== wanted) next = twinOf(active);
                } else {
                    const row = walk[people[active].group];
                    next = row[A.util.clamp(row.indexOf(active) + MOVES[key], 0, row.length - 1)];
                }
                if (next === active) ctx.announce(pairSentence(active));     // at the end already: say it again
                else setActive(next, "key");
            });

            // ----- Texts for the picture, the pair and the announcements -----
            function pastDecisions() {
                return people.map(function (person) { return person.past; });
            }

            // What the dots show: the model's decisions or the past ones (1 = accepted)
            function decisionsShown(limits) {
                if (view === "model" && model) return decide(model, people, limits);
                return pastDecisions();
            }

            function decisionWord(yes) {
                return t(yes ? "lab.bias.accepted" : "lab.bias.rejected");
            }

            // "Blue, score 72, North: accepted"
            function applicantPhrase(index, shown) {
                const person = people[index];
                return t("lab.bias.applicant", {
                    group: t(GROUPS[person.group].oneKey),
                    score: A.format.number(Math.round(person.score)),
                    area: t(person.south ? "lab.bias.south" : "lab.bias.north"),
                    decision: decisionWord(shown[index])
                });
            }

            // "Blue, score 72, North: accepted. Twin: Orange, score 72, South: rejected. Both have skill 70."
            function pairSentence(index) {
                const shown = decisionsShown(thresholds());
                return t("lab.bias.pairSay", {
                    first: applicantPhrase(index, shown),
                    twin: applicantPhrase(twinOf(index), shown),
                    skill: A.format.number(Math.round(people[index].skill))
                });
            }

            // "Accepted: Blue 33%, Orange 10%." (by the model, or in the past before any training)
            function acceptedSentence() {
                const card = measure(people, model ? decide(model, people, thresholds()) : null);
                const row = card.accepted || card.past;
                return t("lab.bias.sayAccepted", { blue: percentText(row[0]), orange: percentText(row[1]) });
            }

            // The twin pair in words, under the picture (or how to meet one)
            function paintPair(shown) {
                pairBox.textContent = "";
                if (active === -1) {
                    pairBox.appendChild(el("p", "bd-pair-hint")).textContent = t("lab.bias.pairHint");
                    return;
                }
                const blue = active < PAIRS ? active : twinOf(active);
                const head = el("p", "bd-pair-head");
                head.textContent = t("lab.bias.pairHead", {
                    skill: A.format.number(Math.round(people[blue].skill)),
                    truth: t(people[blue].qualified ? "lab.bias.truthYes" : "lab.bias.truthNo")
                });
                pairBox.appendChild(head);
                [blue, twinOf(blue)].forEach(function (index) {
                    const line = el("p", "bd-pair-row");
                    line.append(el("span", "bd-dot bd-dot-" + people[index].group, { "aria-hidden": "true" }), document.createTextNode(applicantPhrase(index, shown)));
                    pairBox.appendChild(line);
                });
                if (view === "past" || !model) pairBox.appendChild(el("p", "bd-pair-note")).textContent = t("lab.bias.pairPast");
            }

            // ----- Everything on screen follows the state -----
            function render() {
                const limits = thresholds();
                const modelDecisions = model ? decide(model, people, limits) : null;
                const shown = view === "model" && modelDecisions ? modelDecisions : pastDecisions();
                const card = measure(people, modelDecisions);
                const gap = gaps(card);
                drawPicture(shown, limits);
                paintPair(shown);
                paintScorecard(card, gap);
                paintWeights();
                paintExplain(gap);
                A.dom.setHidden(noColumns.element, columns.length > 0);
                A.dom.setText(presetNote, t(preset === "test" ? "lab.bias.aboutTest" : "lab.bias.aboutDecisions"));
                ui.side.classList.toggle("is-waiting", phase === "waiting");
                if (phase === "trained") {
                    challenges.check({ trained: true, preset: preset, columns: columns, betterLabels: betterLabels, card: card, gaps: gap });
                }
                chart.draw();
            }

            // A frame of the watched training: the picture and the loss every time, the rest a
            // few times a second
            function renderTraining() {
                const now = performance.now();
                if (now - panelsAt >= PANEL_EVERY) {
                    panelsAt = now;
                    render();
                } else {
                    renderPicture();
                    chart.draw();
                }
            }

            // Only the picture and the pair in words (the pointer moved to another applicant)
            function renderPicture() {
                const limits = thresholds();
                const shown = decisionsShown(limits);
                drawPicture(shown, limits);
                paintPair(shown);
            }

            function drawPicture(shown, limits) {
                if (!scene.width) return;
                if (!layout || layout.width !== scene.width || layout.height !== scene.height) {
                    layout = sceneLayout(scene.width, scene.height, laneCounts(people));
                    places = placeDots(people, layout);
                }
                const lines = view === "model" && model;
                const cuts = [0, 1, 2, 3].map(function (lane) {
                    const group = lane >> 1;            // lanes 0 and 1 are Blue, 2 and 3 Orange
                    return lines ? cutOff(model, group, lane % 2, limits[group]) : NaN;
                });
                const counts = [0, 1].map(function (group) {
                    let yes = 0;
                    people.forEach(function (person, i) {
                        if (person.group === group) yes += shown[i];
                    });
                    return t("lab.bias.rowCount", { n: A.format.number(yes), total: A.format.number(PAIRS) });
                });
                let pairLines = [];
                if (active !== -1) {
                    const blue = active < PAIRS ? active : twinOf(active);
                    pairLines = [t("lab.bias.sameSkill")].concat([blue, twinOf(blue)].map(function (index) {
                        return t("lab.bias.pairLine", { group: t(GROUPS[people[index].group].oneKey), decision: decisionWord(shown[index]) });
                    }));
                }
                drawScene(scene, {
                    layout: layout,
                    places: places,
                    people: people,
                    filled: shown,
                    cuts: cuts,
                    active: active,
                    texts: {
                        heads: GROUPS.map(function (group) { return t(group.nameKey); }),
                        counts: counts,
                        lanes: [t("lab.bias.north"), t("lab.bias.south")],
                        axis: t("lab.bias.axis"),
                        pair: pairLines,
                        waiting: phase === "waiting" ? t("lab.bias.training") : ""
                    }
                });
                scene.describe(t("lab.bias.describe", {
                    view: t(view === "model" && model ? "lab.bias.viewModel" : "lab.bias.viewPast"),
                    blue: counts[0],
                    orange: counts[1]
                }));
            }

            // The table, and its big gaps in words. sentences: [{ text, gap }] (gap: about a big gap)
            function paintScorecard(card, gap) {
                const sentences = [];
                let modelGaps = 0;                  // big gaps in the model's rows
                ROWS.forEach(function (row) {
                    const cells = table.cells[row.id];
                    const pair = card[row.id];
                    A.dom.setText(cells.blue, percentText(pair ? pair[0] : null));
                    A.dom.setText(cells.orange, percentText(pair ? pair[1] : null));
                    A.dom.setText(cells.number, gapText(gap[row.id]));
                    const big = gap[row.id] !== null && Math.abs(gap[row.id]) > GAP_LIMIT;
                    cells.gap.classList.toggle("is-big", big);
                    A.dom.setHidden(cells.big, !big);
                    if (!big) return;
                    if (row.id !== "past") modelGaps += 1;
                    sentences.push({
                        text: t(row.saysKey, {
                            group: t(GROUPS[gap[row.id] < 0 ? 1 : 0].whomKey),      // the group that loses out
                            gap: A.plural("lab.bias.points", Math.abs(gap[row.id]))
                        }),
                        gap: true
                    });
                });
                if (model && modelGaps === 0) sentences.push({ text: t("lab.bias.saysFair"), gap: false });
                if (!model) sentences.push({ text: t("lab.bias.untrainedNote"), gap: false });
                // Written again only when a sentence changed (render runs every frame while training)
                const text = sentences.map(function (said) { return said.text; }).join("\n");
                if (text === saysText) return;
                saysText = text;
                says.textContent = "";
                sentences.forEach(function (said) {
                    const item = el("li", said.gap ? "bd-say is-gap" : "bd-say");
                    item.textContent = said.text;
                    says.appendChild(item);
                });
            }

            function paintWeights() {
                const items = model ? model.columns.map(function (column, j) {
                    const value = model.weights[j];
                    const shown = shownWeight(value);          // the words follow the number shown
                    const info = COLUMNS.filter(function (item) { return item.id === column; })[0];
                    let push = "lab.bias.pushNone";
                    if (shown > SMALL_WEIGHT) push = "lab.bias.pushYes";
                    if (shown < -SMALL_WEIGHT) push = "lab.bias.pushNo";
                    return {
                        value: value,
                        labelKey: function () {
                            return A.escapeHTML(t(info.weightKey)) + '<span class="bd-push">' + A.escapeHTML(t(push)) + "</span>";
                        }
                    };
                }) : [];
                weightBars.update(items);
                A.dom.setHidden(weightsBox, items.length === 0);
                A.dom.setText(learnedEmpty, t(model ? "lab.bias.noWeights" : "lab.bias.notTrained"));
                A.dom.setHidden(learnedEmpty, items.length > 0);
                // The proxy warning: the group column is off, yet the neighbourhood still pushes
                // towards rejection. Only the biased deciders' labels ("Unfair decisions", the past)
                // hold that pattern. Elsewhere the labels say nothing about the group once the
                // test score is known, so a South weight there is only chance, not a proxy.
                const south = model ? weightOf(model, "south") : null;
                const proxy = preset === "decisions" && !betterLabels && south !== null &&
                    shownWeight(south) < -SMALL_WEIGHT && weightOf(model, "orange") === null;
                A.dom.setHidden(proxyLine, !proxy);
            }

            function paintExplain(gap) {
                const orange = model ? weightOf(model, "orange") : null;
                const south = model ? weightOf(model, "south") : null;
                // "Unfair test", trained on the past: the people who decided were fair, so once the
                // test score is known, the group and the neighbourhood tell the model nothing more.
                // Their weights are only chance (300 applicants are a small sample).
                const fairDeciders = preset === "test" && !betterLabels;
                explain.setValues(0, { n: people.length, what: t(betterLabels ? "lab.bias.whatTruth" : "lab.bias.whatPast") });

                let learned = t("lab.bias.learnedLater");
                if (model && orange === null) learned = t("lab.bias.learnedHidden");
                else if (model) learned = t(fairDeciders ? "lab.bias.learnedTest" : "lab.bias.learnedOrange", { w: weightText(orange) });
                explain.setValues(1, { learned: learned });

                let southNow = "";
                if (model && south === null) southNow = t("lab.bias.southHidden");
                else if (model) southNow = t(fairDeciders ? "lab.bias.southChance" : "lab.bias.southNow", { w: weightText(south) });
                explain.setValues(2, { south: southNow });

                explain.setValues(3, {
                    now: gap.accepted === null ? "" : t("lab.bias.gapsNow", {
                        accepted: A.plural("lab.bias.points", Math.abs(gap.accepted)),
                        tpr: A.plural("lab.bias.points", Math.abs(gap.tpr))
                    })
                });

                // The step that fits what is on screen
                let current = 0;                                // 1. not trained yet
                if (model) {
                    if (betterLabels || separateToggle.checked()) current = 4;      // 5. a fix
                    else if (orange !== null) current = 1;                           // 2. it learned the unfairness
                    else if (south !== null) current = 2;                            // 3. a proxy
                    else current = 3;                                                // 4. measuring fairness
                }
                explain.setStep(current);
            }

            // ----- Start: the past decisions, a model not trained yet -----
            viewSwitch.set("past");
            viewSwitch.setDisabled(true);
            A.dom.setHidden(chartBox, true);
            showSliders();
            writeSentences();
            setPhase("untrained");
            render();

            // ----- The controller: the hub calls these -----
            return {
                pause: function () {
                    resumeOnShow = loop.running();
                    loop.stop();
                    if (waitTimer) {                 // finish "Training…" when we are back
                        clearTimeout(waitTimer);
                        waitTimer = 0;
                        waitOwed = true;
                    }
                },
                resume: function () {
                    if (waitOwed) {
                        waitOwed = false;
                        finishWaiting();
                    } else if (resumeOnShow && phase === "running") {
                        loop.start();
                    }
                    resumeOnShow = false;
                },
                language: function () {
                    kit.relabel(stage);
                    writeSentences();
                    render();
                },
                theme: function () {
                    kit.colors.invalidate();
                    render();
                },
                destroy: function () {
                    stopTraining();
                    scene.destroy();
                    chartView.destroy();
                }
            };
        }
    });
})();
