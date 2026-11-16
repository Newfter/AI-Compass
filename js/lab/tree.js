/* =========================================================
   AI COMPASS — LAB: GROW A DECISION TREE
   A box of examples (animals, or days when Sam did or didn't go cycling)
   is split by yes/no questions into smaller, tidier boxes. The learner
   picks the questions, or lets the computer pick the one that leaves the
   least "messiness" (Gini impurity). A second set of examples the tree
   has never seen shows when a big tree has learned the training examples
   by heart instead of the rule (overfitting).
   Texts and the animal tables: js/content/lab/tree.js.

   Sections:
    1. Settings
    2. The maths (examples, messiness, growing, answering)
    3. The tree on the page
    4. The experiment (A.lab.define)
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
    const DATASETS = ["animals", "cycling"];
    const DEPTH = { min: 1, max: 6, value: 3 };   // the "Deepest level" slider
    const SAVE_VERSION = 1;                       // ctx.store "settings" = { v: 1, data, depth }
    // Cycling days: made from this seed, so everyone sees the same days. Checked by hand:
    // depth 2 (3 questions) is right on 92% of the new days, depth 6 on 58% (96% on training).
    const CYCLING = {
        seed: 105,
        train: 24,
        test: 24,
        odd: 0.14,                                // the share of days when Sam broke the rule
        chance: { rainy: 0.35, sunny: 0.6, warm: 0.5, windy: 0.35, weekend: 2 / 7, friend: 0.45 }
    };
    const GOALS = { animalQuestions: 4, smallQuestions: 3, smallTest: 0.75, deep: 6 };
    const TINY = 1e-9;                            // a split must lower the messiness by more than this

    /* =========================================================
       2. THE MATHS
       An example: { name, x: [0/1 per question], y: class index }
       A node:     { items, split: question index or null, yes, no }
       ========================================================= */
    // The days: Sam goes when it isn't raining and it's warm or a friend comes, except on odd days
    function makeDays(settings) {
        const random = kit.rng(settings.seed);
        const chance = settings.chance;
        const days = [];
        for (let i = 0; i < settings.train + settings.test; i++) {
            const rainy = random.next() < chance.rainy ? 1 : 0;
            const sunny = !rainy && random.next() < chance.sunny ? 1 : 0;
            const warm = random.next() < chance.warm ? 1 : 0;
            const windy = random.next() < chance.windy ? 1 : 0;
            const weekend = random.next() < chance.weekend ? 1 : 0;
            const friend = random.next() < chance.friend ? 1 : 0;
            let go = !rainy && (warm || friend);
            if (random.next() < settings.odd) go = !go;
            days.push({ name: i + 1, x: [rainy, sunny, warm, windy, weekend, friend], y: go ? 0 : 1 });
        }
        return { train: days.slice(0, settings.train), test: days.slice(settings.train) };
    }

    function makeAnimals(table) {
        const row = function (entry) {
            return { name: entry[0], x: entry[1].slice(), y: table.classes.indexOf(entry[2]) };
        };
        return { train: table.train.map(row), test: table.test.map(row) };
    }

    function counts(items, classes) {
        const out = new Array(classes).fill(0);
        items.forEach(function (item) { out[item.y]++; });
        return out;
    }

    // Messiness (Gini impurity): 1 − Σ p², the chance that two examples picked at random differ
    function gini(items, classes) {
        if (!items.length) return 0;
        let sum = 1;
        counts(items, classes).forEach(function (n) {
            const p = n / items.length;
            sum -= p * p;
        });
        return sum;
    }

    function parts(items, question) {
        return {
            yes: items.filter(function (item) { return item.x[question] === 1; }),
            no: items.filter(function (item) { return item.x[question] !== 1; })
        };
    }

    // The messiness of the two boxes together (each weighted by its size), or null when one is empty
    function splitGini(items, question, classes) {
        const p = parts(items, question);
        if (!p.yes.length || !p.no.length) return null;
        return (p.yes.length * gini(p.yes, classes) + p.no.length * gini(p.no, classes)) / items.length;
    }

    // The question that leaves the least messiness (the first one on a tie), or -1 when none helps
    function bestQuestion(items, questions, classes) {
        let best = -1;
        let bestValue = gini(items, classes) - TINY;
        for (let q = 0; q < questions; q++) {
            const value = splitGini(items, q, classes);
            if (value !== null && value < bestValue) {
                best = q;
                bestValue = value;
            }
        }
        return best;
    }

    function leaf(items) {
        return { items: items, split: null, yes: null, no: null };
    }

    function splitNode(node, question) {
        const p = parts(node.items, question);
        node.split = question;
        node.yes = leaf(p.yes);
        node.no = leaf(p.no);
    }

    // Asks the best question again and again, down to maxDepth levels
    function grow(node, questions, classes, depth, maxDepth) {
        if (depth >= maxDepth || gini(node.items, classes) === 0) return node;
        const best = bestQuestion(node.items, questions, classes);
        if (best === -1) return node;
        splitNode(node, best);
        grow(node.yes, questions, classes, depth + 1, maxDepth);
        grow(node.no, questions, classes, depth + 1, maxDepth);
        return node;
    }

    // The most common answer in a box (the first class on a tie)
    function majority(items, classes) {
        const c = counts(items, classes);
        let best = 0;
        c.forEach(function (n, i) { if (n > c[best]) best = i; });
        return best;
    }

    // Follows the questions down to a box and says its most common answer
    function predict(node, example, classes) {
        while (node.split !== null) node = example.x[node.split] === 1 ? node.yes : node.no;
        return majority(node.items, classes);
    }

    // The path of boxes an example goes through: "" (the first box), "y", "yn"...
    function pathOf(node, example) {
        let path = "";
        while (node.split !== null) {
            const yes = example.x[node.split] === 1;
            path += yes ? "y" : "n";
            node = yes ? node.yes : node.no;
        }
        return path;
    }

    function accuracy(tree, examples, classes) {
        if (!examples.length) return 0;
        let right = 0;
        examples.forEach(function (example) { if (predict(tree, example, classes) === example.y) right++; });
        return right / examples.length;
    }

    function questionCount(node) {
        return node.split === null ? 0 : 1 + questionCount(node.yes) + questionCount(node.no);
    }

    function levelCount(node) {
        return node.split === null ? 0 : 1 + Math.max(levelCount(node.yes), levelCount(node.no));
    }

    function nodeAt(root, path) {
        let node = root;
        for (let i = 0; i < path.length && node; i++) node = path[i] === "y" ? node.yes : node.no;
        return node || null;
    }

    /* =========================================================
       3. THE TREE ON THE PAGE
       ========================================================= */
    function make(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function seriesColor(index) {
        return "var(--lk-series-" + (index + 1) + ")";
    }

    // A thin bar with one coloured part per class
    function countBar(c, total) {
        const bar = make("span", "dt-mix");
        bar.setAttribute("aria-hidden", "true");
        c.forEach(function (n, i) {
            if (!n) return;
            const part = make("span", "dt-mix-part");
            part.style.width = ((n / total) * 100).toFixed(2) + "%";
            part.style.background = seriesColor(i);
            bar.appendChild(part);
        });
        return bar;
    }

    /* =========================================================
       4. THE EXPERIMENT
       ========================================================= */
    A.lab.define("tree", {
        // The maths, for tests (the hub doesn't use it)
        maths: { makeDays: makeDays, gini: gini, splitGini: splitGini, bestQuestion: bestQuestion, grow: grow, predict: predict, accuracy: accuracy, leaf: leaf, CYCLING: CYCLING },

        create: function (stage, ctx) {
            const table = A.content.get("lab.tree");
            const saved = ctx.store.get("settings", null, function (value) {
                return value.v === SAVE_VERSION && DATASETS.indexOf(value.data) !== -1 &&
                    typeof value.depth === "number" && value.depth >= DEPTH.min && value.depth <= DEPTH.max;
            });
            const sets = { animals: makeAnimals(table.animals), cycling: makeDays(CYCLING) };
            let data = saved ? saved.data : "animals";
            let maxDepth = saved ? saved.depth : DEPTH.value;
            let root = null;
            let selected = "";               // the path of the chosen box
            let lastSplit = null;            // { before, after } of the last question asked
            let grownDeep = false;           // the tree was grown with the deepest setting, unchanged since
            let manualRoot = false;          // the learner split the first box by hand (and it helped)
            let phase = 0;                   // the explain step: 0 nothing yet, 1 a question, 2 grown

            const spec = function () { return table[data]; };
            const classCount = function () { return spec().classes.length; };
            const questions = function () { return spec().features.length; };

            // ----- The page -----
            const ui = kit.layout(stage, { side: true });

            const dataPicker = kit.segmented({
                labelKey: "lab.tree.data",
                options: [{ value: "animals", labelKey: "lab.tree.dataAnimals" }, { value: "cycling", labelKey: "lab.tree.dataCycling" }],
                value: data,
                onChange: function (value) {
                    data = value;
                    save();
                    start();
                }
            });
            const about = make("p", "dt-about");
            ui.top.append(dataPicker.element, about);

            const treeHead = make("div", "dt-tree-head");
            const treeTitle = make("h4", "dt-tree-title");
            treeTitle.setAttribute("data-i18n", "lab.tree.treeTitle");
            treeTitle.textContent = t("lab.tree.treeTitle");
            const legendBox = make("div", "dt-legend-box");
            treeHead.append(treeTitle, legendBox);
            const treeHelp = make("p", "dt-help");
            treeHelp.setAttribute("data-i18n", "lab.tree.treeHelp");
            treeHelp.textContent = t("lab.tree.treeHelp");
            const treeBox = make("div", "dt-tree");
            const summary = make("p", "sr-only");
            summary.setAttribute("aria-live", "off");
            ui.main.append(treeHead, treeHelp, treeBox, summary);

            // The side: questions for the chosen box, buttons, numbers
            const splitBox = make("div", "dt-split");
            const bestButton = kit.button("lab.tree.best", { icon: "sparkle", variant: "primary", onClick: chooseBest });
            const removeButton = kit.button("lab.tree.remove", { icon: "undo", onClick: removeQuestion });
            const growButton = kit.button("lab.tree.grow", { icon: "play", onClick: growAll });
            const clearButton = kit.button("lab.tree.clear", { icon: "trash", variant: "subtle", onClick: start });
            const depthSlider = kit.slider({
                labelKey: "lab.tree.depth", min: DEPTH.min, max: DEPTH.max, step: 1, value: maxDepth,
                hintKey: "lab.tree.depthHint",
                format: function (v) { return A.format.number(v); },
                onInput: function (value) { maxDepth = value; },
                onChange: function (value) {
                    maxDepth = value;
                    save();
                }
            });
            const percent = function (v) { return A.format.percent(v); };
            const stats = {
                questions: kit.stat({ labelKey: "lab.tree.questions", value: 0, format: function (v) { return A.format.number(v); } }),
                levels: kit.stat({ labelKey: "lab.tree.levels", value: 0, format: function (v) { return A.format.number(v); } }),
                train: kit.stat({ labelKey: "lab.tree.trainAcc", format: percent }),
                test: kit.stat({ labelKey: "lab.tree.testAcc", format: percent })
            };
            ui.side.append(
                kit.group("lab.tree.splitTitle", [splitBox, kit.toolbar([bestButton, removeButton])]),
                kit.group(null, [depthSlider, kit.toolbar([growButton, clearButton])], { plain: true }),
                kit.row([stats.questions, stats.levels, stats.train, stats.test], { grid: true })
            );

            // The bottom: the two tables, the idea, the explain panel, the challenges
            const tables = make("div", "dt-tables");
            const idea = make("p", "dt-idea");
            const explain = kit.explain({ steps: [{ key: "lab.tree.step1" }, { key: "lab.tree.step2" }, { key: "lab.tree.step3" }] });
            const challenges = kit.challenges({ ctx: ctx, items: [
                { key: "lab.tree.ch1", insightKey: "lab.tree.ch1Why", check: function (info) { return info.manualRoot; } },
                { key: "lab.tree.ch2", insightKey: "lab.tree.ch2Why", check: function (info) {
                    return info.data === "animals" && info.questions > 0 && info.questions <= GOALS.animalQuestions && info.train === 1;
                } },
                { key: "lab.tree.ch3", insightKey: "lab.tree.ch3Why", check: function (info) {
                    return info.data === "cycling" && info.deep && info.test < info.train;
                } },
                { key: "lab.tree.ch4", insightKey: "lab.tree.ch4Why", check: function (info) {
                    return info.data === "cycling" && info.questions > 0 && info.questions <= GOALS.smallQuestions && info.test >= GOALS.smallTest;
                } }
            ] });
            ui.bottom.append(tables, idea, explain.element, challenges.element);

            // Open tables stay open when the page is drawn again
            const openTables = { train: false, test: false };

            // ----- What the buttons do -----
            function save() {
                ctx.store.set("settings", { v: SAVE_VERSION, data: data, depth: maxDepth });
            }

            function start() {
                root = leaf(sets[data].train.slice());
                selected = "";
                lastSplit = null;
                grownDeep = false;
                phase = 0;
                render();
            }

            function className(index) {
                return t("lab.tree.class." + spec().classes[index]);
            }

            function questionText(index) {
                return t("lab.tree.q." + spec().features[index]);
            }

            function exampleName(example) {
                if (data === "cycling") return t("lab.tree.dayName", { n: A.format.number(example.name) });
                const names = table.animals.names[A.lang] || table.animals.names.en;
                return names[example.name] || example.name;
            }

            // Asks a question in the chosen box, then moves on to a messy child box
            function ask(question, byHand) {
                const node = nodeAt(root, selected);
                if (!node || node.split !== null) return;
                const before = gini(node.items, classCount());
                const after = splitGini(node.items, question, classCount());
                if (after === null) return;
                splitNode(node, question);
                lastSplit = { before: before, after: after };
                grownDeep = false;
                phase = 1;
                if (byHand && selected === "" && after < before - TINY) manualRoot = true;
                const nextBox = ["y", "n"].map(function (side) { return selected + side; }).filter(function (path) {
                    return gini(nodeAt(root, path).items, classCount()) > 0;
                })[0];
                if (nextBox !== undefined) selected = nextBox;
                ctx.announce(t("lab.tree.saidSplit", { question: questionText(question), before: kit.number(before), after: kit.number(after) }));
                ctx.track("milestone", { kind: "split", data: data, byHand: Boolean(byHand), depth: selected.length });
                render();
                if (nextBox !== undefined) focusSelected();
            }

            function chooseBest() {
                const node = nodeAt(root, selected);
                if (!node || node.split !== null) return;
                const best = bestQuestion(node.items, questions(), classCount());
                if (best !== -1) ask(best, false);
            }

            function removeQuestion() {
                const node = nodeAt(root, selected);
                if (!node || node.split === null) return;
                node.split = null;
                node.yes = null;
                node.no = null;
                grownDeep = false;
                render();
            }

            function growAll() {
                root = grow(leaf(sets[data].train.slice()), questions(), classCount(), 0, maxDepth);
                selected = "";
                lastSplit = root.split === null ? null : { before: gini(root.items, classCount()), after: splitGini(root.items, root.split, classCount()) };
                grownDeep = maxDepth >= GOALS.deep;
                phase = 2;
                const q = questionCount(root);
                const test = accuracy(root, sets[data].test, classCount());
                ctx.announce(t("lab.tree.saidGrow", { q: A.format.number(q), test: percent(test) }));
                ctx.track("milestone", { kind: "grow", data: data, depth: maxDepth, questions: q, test: Math.round(test * 100) });
                render();
            }

            function choose(path) {
                selected = path;
                render();
                focusSelected();
            }

            function focusSelected() {
                const button = treeBox.querySelector('.dt-node[data-path="' + selected + '"]');
                if (button) button.focus({ preventScroll: true });
            }

            // ----- Drawing -----
            function pathName(path) {
                if (!path) return t("lab.tree.rootPath");
                let node = root;
                const steps = [];
                for (let i = 0; i < path.length; i++) {
                    steps.push(t("lab.tree.short." + spec().features[node.split]) + " " + t(path[i] === "y" ? "lab.tree.yes" : "lab.tree.no").toLowerCase());
                    node = path[i] === "y" ? node.yes : node.no;
                }
                return steps.join(" → ");
            }

            function drawNode(node, path) {
                const item = make("li", "dt-item");
                const c = counts(node.items, classCount());
                const g = gini(node.items, classCount());
                const button = make("button", "dt-node");
                button.type = "button";
                button.setAttribute("data-path", path);
                button.setAttribute("aria-pressed", String(path === selected));
                if (path) {
                    const edge = make("span", "dt-edge " + (path[path.length - 1] === "y" ? "is-yes" : "is-no"),
                        t(path[path.length - 1] === "y" ? "lab.tree.yes" : "lab.tree.no"));
                    button.appendChild(edge);
                }
                const body = make("span", "dt-node-body");
                const n = A.plural("lab.tree.examples", node.items.length);
                if (node.split !== null) {
                    body.appendChild(make("span", "dt-node-q", questionText(node.split)));
                    button.setAttribute("aria-label", t("lab.tree.nodeSplitLabel", { path: pathName(path), question: questionText(node.split), n: n }));
                } else {
                    const label = className(majority(node.items, classCount()));
                    body.appendChild(make("span", "dt-node-says", t("lab.tree.leafSays", { label: label })));
                    button.setAttribute("aria-label", t("lab.tree.nodeLabel", { path: pathName(path), n: n, label: label, gini: kit.number(g) }));
                }
                const meta = make("span", "dt-node-meta");
                meta.append(countBar(c, node.items.length), make("span", "dt-node-n", n),
                    make("span", "dt-node-gini" + (g === 0 ? " is-pure" : ""), g === 0 ? t("lab.tree.pure") : t("lab.tree.messiness", { n: kit.number(g) })));
                body.appendChild(meta);
                button.appendChild(body);
                button.addEventListener("click", function () { choose(path); });
                item.appendChild(button);
                if (node.split !== null) {
                    const kids = make("ul", "dt-kids");
                    kids.append(drawNode(node.yes, path + "y"), drawNode(node.no, path + "n"));
                    item.appendChild(kids);
                }
                return item;
            }

            function drawTree() {
                treeBox.textContent = "";
                const list = make("ul", "dt-root");
                list.appendChild(drawNode(root, ""));
                treeBox.appendChild(list);
                legendBox.textContent = "";
                legendBox.appendChild(kit.legend(spec().classes.map(function (name, i) {
                    return { label: t("lab.tree.class." + name), colorIndex: i, shape: "square" };
                })).element);
            }

            function drawSplitPanel() {
                splitBox.textContent = "";
                const node = nodeAt(root, selected);
                const g = gini(node.items, classCount());
                const chosen = make("p", "dt-chosen");
                chosen.append(make("span", "dt-chosen-label", t("lab.tree.chosen") + ": "), make("strong", "", pathName(selected)));
                splitBox.appendChild(chosen);
                bestButton.setDisabled(node.split !== null || g === 0);
                removeButton.setDisabled(node.split === null);
                if (node.split !== null) {
                    splitBox.appendChild(make("p", "dt-note", t("lab.tree.splitDone")));
                    return;
                }
                if (g === 0) {
                    splitBox.appendChild(make("p", "dt-note", t("lab.tree.splitLeaf")));
                    return;
                }
                const help = make("p", "dt-note", t("lab.tree.splitHelp", { now: kit.number(g) }));
                const list = make("ul", "dt-qs");
                const best = bestQuestion(node.items, questions(), classCount());
                spec().features.forEach(function (feature, q) {
                    const after = splitGini(node.items, q, classCount());
                    const li = make("li");
                    const button = make("button", "dt-q" + (q === best ? " is-best" : ""));
                    button.type = "button";
                    button.disabled = after === null;
                    const top = make("span", "dt-q-top");
                    top.append(make("span", "dt-q-text", questionText(q)),
                        make("span", "dt-q-value", after === null ? t("lab.tree.splitUseless") : t("lab.tree.splitAfter", { n: kit.number(after) })));
                    const track = make("span", "dt-q-track");
                    track.setAttribute("aria-hidden", "true");
                    const fill = make("span", "dt-q-fill");
                    fill.style.width = after === null ? "0%" : (Math.max(0.02, after / g) * 100).toFixed(1) + "%";
                    track.appendChild(fill);
                    button.append(top, track);
                    button.addEventListener("click", function () { ask(q, true); });
                    li.appendChild(button);
                    list.appendChild(li);
                });
                splitBox.append(help, list);
            }

            function drawTable(kind, examples) {
                const box = make("details", "dt-table-box");
                box.open = openTables[kind];
                box.addEventListener("toggle", function () { openTables[kind] = box.open; });
                box.appendChild(make("summary", "dt-table-sum",
                    t(kind === "train" ? "lab.tree.tableTrain" : "lab.tree.tableTest", { n: A.format.number(examples.length) })));
                const wrap = make("div", "dt-table-wrap");
                const tableEl = make("table", "dt-table");
                const head = make("tr");
                ["lab.tree.colName", "lab.tree.colYes", "lab.tree.colAnswer", "lab.tree.colGuess"].forEach(function (key) {
                    const th = make("th", "", t(key));
                    th.scope = "col";
                    head.appendChild(th);
                });
                const thead = make("thead");
                thead.appendChild(head);
                const tbody = make("tbody");
                examples.forEach(function (example) {
                    const guess = predict(root, example, classCount());
                    const right = guess === example.y;
                    const tr = make("tr", pathOf(root, example).indexOf(selected) === 0 && selected ? "is-in" : "");
                    const th = make("th", "", exampleName(example));
                    th.scope = "row";
                    const yes = spec().features.filter(function (f, i) { return example.x[i] === 1; })
                        .map(function (f) { return t("lab.tree.short." + f); }).join(", ") || "—";
                    const answer = make("td");
                    answer.append(make("span", "dt-dot"), document.createTextNode(className(example.y)));
                    answer.firstChild.style.background = seriesColor(example.y);
                    const guessCell = make("td", right ? "is-right" : "is-wrong");
                    guessCell.append(make("span", "dt-mark", right ? "✓" : "✗"), document.createTextNode(className(guess)));
                    guessCell.appendChild(make("span", "sr-only", " (" + t(right ? "lab.tree.right" : "lab.tree.wrong") + ")"));
                    guessCell.firstChild.setAttribute("aria-hidden", "true");
                    tr.append(th, make("td", "dt-yes", yes), answer, guessCell);
                    tbody.appendChild(tr);
                });
                tableEl.append(thead, tbody);
                wrap.appendChild(tableEl);
                box.appendChild(wrap);
                return box;
            }

            function render() {
                const set = sets[data];
                const k = classCount();
                const q = questionCount(root);
                const levels = levelCount(root);
                const train = accuracy(root, set.train, k);
                const test = accuracy(root, set.test, k);
                A.dom.setText(about, t(data === "animals" ? "lab.tree.aboutAnimals" : "lab.tree.aboutCycling"));
                drawTree();
                drawSplitPanel();
                tables.textContent = "";
                tables.append(drawTable("train", set.train), drawTable("test", set.test));
                stats.questions.set(q);
                stats.levels.set(levels);
                stats.train.set(train);
                stats.test.set(test);
                idea.innerHTML = A.i18nHTML("lab.tree.ideaLine") + " ";
                idea.append(kit.termLink("decision-tree", "lab.tree.term"), ".");
                const rootGini = gini(set.train, k);
                explain.setValues(0, { gini: rootGini });
                explain.setValues(1, lastSplit ? { before: lastSplit.before, after: lastSplit.after } : { before: rootGini, after: rootGini });
                explain.setValues(2, { train: percent(train), test: percent(test) });
                explain.setStep(phase === 0 ? 0 : phase === 1 ? 1 : 2);
                if (data === "cycling" && train - test >= 0.2) explain.setText("lab.tree.noteOverfit");
                else if (data === "animals") explain.setText("lab.tree.noteAnimals");
                else explain.setText(null);
                challenges.check({ data: data, questions: q, levels: levels, train: train, test: test, deep: grownDeep, manualRoot: manualRoot });
                manualRoot = false;
                A.dom.setText(summary, t("lab.tree.describe", { q: A.format.number(q), levels: A.format.number(levels), train: percent(train), test: percent(test) }));
            }

            start();

            // ----- The controller: the hub calls these -----
            return {
                pause: function () {},
                resume: function () {},
                language: function () {
                    kit.relabel(stage);
                    render();
                },
                theme: function () {
                    kit.colors.invalidate();
                    render();
                },
                destroy: function () {
                    treeBox.textContent = "";
                }
            };
        }
    });
})();
