/* =========================================================
   AI COMPASS — LAB: BUILD A SPAM FILTER
   A naive Bayes filter: it counts how often each word appears in spam and
   in normal messages, then reads a new message word by word, multiplying
   the odds by each word's clue. The learner writes messages and sees each
   word's pull, moves the spam line (the threshold) and sees the trade-off
   on messages the filter has never seen, and teaches it new examples.
   Texts and the messages (one set per language): js/content/lab/spam.js.

   Sections:
    1. Settings
    2. The maths (words, counting, the chance)
    3. The experiment (A.lab.define)
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
    const LINE = { min: 0.05, max: 0.99, step: 0.01, value: 0.5 };  // the spam line slider
    const SMOOTH = 1;                   // Laplace smoothing: every word is counted once more in each pile
    const MAX_MINE = 40;                // the learner's own examples, per language, at most
    const MAX_TEXT = 300;               // characters in the message box
    const CLUES = 6;                    // the strongest words shown on each side
    const SAVE_VERSION = 1;             // ctx.store "settings" = { v, line }; "mine" = { v, en: [[text, 1|0]], ru: [...] }
    const GOALS = { sure: 0.9, caught: 6, taught: 2 };

    /* =========================================================
       2. THE MATHS
       ========================================================= */
    // Words: lower case letters and digits, two characters or more
    function words(text) {
        return (String(text).toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(function (word) { return word.length > 1; });
    }

    // Counts the words of each pile. rows: [[text, 1 = spam / 0 = normal]]
    function train(rows) {
        const model = { messages: [0, 0], counts: [Object.create(null), Object.create(null)], totals: [0, 0], vocab: Object.create(null), size: 0 };
        rows.forEach(function (row) {
            const y = row[1] ? 1 : 0;
            model.messages[y]++;
            words(row[0]).forEach(function (word) {
                model.counts[y][word] = (model.counts[y][word] || 0) + 1;
                model.totals[y]++;
                if (!model.vocab[word]) {
                    model.vocab[word] = true;
                    model.size++;
                }
            });
        });
        return model;
    }

    // How much more likely the word is in spam than in a normal message (> 1: spam)
    function ratio(model, word) {
        const spam = ((model.counts[1][word] || 0) + SMOOTH) / (model.totals[1] + SMOOTH * model.size);
        const ham = ((model.counts[0][word] || 0) + SMOOTH) / (model.totals[0] + SMOOTH * model.size);
        return spam / ham;
    }

    // The chance a message is spam: the starting odds (how common spam is), times each known word's ratio
    function score(model, text) {
        let logOdds = Math.log(Math.max(model.messages[1], 1) / Math.max(model.messages[0], 1));
        const clues = words(text).map(function (word) {
            if (!model.vocab[word]) return { word: word, ratio: null };
            const r = ratio(model, word);
            logOdds += Math.log(r);
            return { word: word, ratio: r };
        });
        return { chance: 1 / (1 + Math.exp(-logOdds)), clues: clues };
    }

    // The filter on the test messages at a line: caught, missed, blocked, passed
    function confusion(model, rows, line) {
        const out = { caught: 0, missed: 0, blocked: 0, passed: 0, spam: 0, ham: 0, results: [] };
        rows.forEach(function (row) {
            const chance = score(model, row[0]).chance;
            const flagged = chance >= line;
            if (row[1]) {
                out.spam++;
                if (flagged) out.caught++; else out.missed++;
            } else {
                out.ham++;
                if (flagged) out.blocked++; else out.passed++;
            }
            out.results.push({ text: row[0], truth: row[1], chance: chance, flagged: flagged });
        });
        return out;
    }

    // The strongest clue words, CLUES on each side
    function strongest(model) {
        const list = Object.keys(model.vocab).map(function (word) { return { word: word, r: ratio(model, word) }; });
        return {
            spam: list.filter(function (x) { return x.r > 1; }).sort(function (a, b) { return b.r - a.r || (a.word < b.word ? -1 : 1); }).slice(0, CLUES),
            ham: list.filter(function (x) { return x.r < 1; }).sort(function (a, b) { return a.r - b.r || (a.word < b.word ? -1 : 1); }).slice(0, CLUES)
        };
    }

    /* =========================================================
       3. THE EXPERIMENT
       ========================================================= */
    function make(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    // 0.9996 is not "100%": the ends say "more than 99%" / "less than 1%"
    function chanceText(chance) {
        if (chance > 0.99) return ">99%";
        if (chance < 0.01) return "<1%";
        return A.format.percent(chance);
    }

    function times(r) {
        const n = r >= 1 ? r : 1 / r;
        return A.format.number(n, { digits: n < 10 ? 1 : 0 });
    }

    A.lab.define("spam", {
        maths: { words: words, train: train, score: score, confusion: confusion, ratio: ratio },

        create: function (stage, ctx) {
            const data = A.content.get("lab.spam");
            const saved = ctx.store.get("settings", null, function (value) {
                return value.v === SAVE_VERSION && typeof value.line === "number" && value.line >= LINE.min && value.line <= LINE.max;
            });
            const savedMine = ctx.store.get("mine", null, function (value) {
                return value.v === SAVE_VERSION && Array.isArray(value.en) && Array.isArray(value.ru);
            });
            const mine = {
                en: savedMine ? savedMine.en.filter(validRow).slice(-MAX_MINE) : [],
                ru: savedMine ? savedMine.ru.filter(validRow).slice(-MAX_MINE) : []
            };
            let line = saved ? saved.line : LINE.value;
            let model = null;
            let exampleIndex = -1;
            let taughtNow = 0;                 // examples taught since the experiment opened

            function validRow(row) {
                return Array.isArray(row) && typeof row[0] === "string" && row[0].length <= MAX_TEXT && (row[1] === 0 || row[1] === 1);
            }

            const set = function () { return data[A.lang] || data.en; };
            const mineNow = function () { return mine[A.lang] || mine.en; };

            function retrain() {
                model = train(set().train.concat(mineNow()));
            }

            // ----- The page -----
            const ui = kit.layout(stage, { side: true });

            // Write a message
            const boxId = "sp-box-" + Math.random().toString(36).slice(2, 8);
            const boxLabel = make("label", "sp-label");
            boxLabel.htmlFor = boxId;
            boxLabel.setAttribute("data-i18n", "lab.spam.writeLabel");
            boxLabel.textContent = t("lab.spam.writeLabel");
            const box = make("textarea", "sp-box");
            box.id = boxId;
            box.rows = 3;
            box.maxLength = MAX_TEXT;
            box.setAttribute("data-i18n-attr", "placeholder:lab.spam.placeholder");
            box.placeholder = t("lab.spam.placeholder");
            box.addEventListener("input", render);
            const exampleButton = kit.button("lab.spam.example", { icon: "dice", onClick: showExample });
            const clearButton = kit.button("lab.spam.clear", { icon: "close", variant: "subtle", onClick: function () {
                box.value = "";
                render();
                box.focus();
            } });

            const meter = make("div", "sp-meter");
            const meterHead = make("div", "sp-meter-head");
            const meterLabel = make("span", "sp-meter-label");
            meterLabel.setAttribute("data-i18n", "lab.spam.chance");
            meterLabel.textContent = t("lab.spam.chance");
            const meterValue = make("strong", "sp-meter-value");
            meterHead.append(meterLabel, meterValue);
            const track = make("div", "sp-track");
            track.setAttribute("aria-hidden", "true");
            const fill = make("span", "sp-fill");
            const mark = make("span", "sp-mark");
            track.append(fill, mark);
            const verdict = make("p", "sp-verdict");
            verdict.setAttribute("aria-live", "polite");
            meter.append(meterHead, track, verdict);

            const wordsHelp = make("p", "sp-help");
            wordsHelp.setAttribute("data-i18n", "lab.spam.wordsHelp");
            wordsHelp.textContent = t("lab.spam.wordsHelp");
            const chips = make("ul", "sp-chips");

            const teachCount = make("p", "sp-help");
            const teachHelp = make("p", "sp-help");
            teachHelp.setAttribute("data-i18n", "lab.spam.teachHelp");
            teachHelp.textContent = t("lab.spam.teachHelp");
            const spamButton = kit.button("lab.spam.markSpam", { icon: "plus", onClick: function () { teach(1); } });
            const hamButton = kit.button("lab.spam.markHam", { icon: "plus", onClick: function () { teach(0); } });
            const forgetButton = kit.button("lab.spam.forget", { icon: "trash", variant: "subtle", onClick: forget });

            ui.main.append(
                kit.group("lab.spam.writeTitle", [boxLabel, box, kit.toolbar([exampleButton, clearButton]), meter]),
                kit.group("lab.spam.wordsTitle", [wordsHelp, chips]),
                kit.group("lab.spam.teachTitle", [teachHelp, kit.toolbar([spamButton, hamButton, forgetButton]), teachCount])
            );

            // The side: the line, the four counts, the clues
            const lineSlider = kit.slider({
                labelKey: "lab.spam.threshold", min: LINE.min, max: LINE.max, step: LINE.step, value: line,
                hintKey: "lab.spam.thresholdHint",
                format: function (v) { return A.format.percent(v); },
                onInput: function (value) {
                    line = value;
                    render();
                },
                onChange: function (value) { ctx.store.set("settings", { v: SAVE_VERSION, line: value }); }
            });
            line = lineSlider.value();
            const testTitle = make("p", "sp-test-title");
            const count = function (v) { return A.format.number(v); };
            const stats = {
                caught: kit.stat({ labelKey: "lab.spam.caught", format: count }),
                missed: kit.stat({ labelKey: "lab.spam.missed", format: count }),
                blocked: kit.stat({ labelKey: "lab.spam.blocked", format: count }),
                passed: kit.stat({ labelKey: "lab.spam.passed", format: count })
            };
            stats.caught.element.classList.add("sp-good");
            stats.passed.element.classList.add("sp-good");
            stats.missed.element.classList.add("sp-bad");
            stats.blocked.element.classList.add("sp-bad");
            const cluesBox = make("div", "sp-clues");
            const spamTitle = make("p", "sp-clues-title");
            spamTitle.setAttribute("data-i18n", "lab.spam.cluesSpam");
            spamTitle.textContent = t("lab.spam.cluesSpam");
            const spamBarsBox = make("div");
            const hamTitle = make("p", "sp-clues-title");
            hamTitle.setAttribute("data-i18n", "lab.spam.cluesHam");
            hamTitle.textContent = t("lab.spam.cluesHam");
            const hamBarsBox = make("div");
            cluesBox.append(spamTitle, spamBarsBox, hamTitle, hamBarsBox);
            const spamBars = kit.bars(spamBarsBox, { items: [], format: function (v) { return "×" + times(Math.exp(v)); } });
            const hamBars = kit.bars(hamBarsBox, { items: [], format: function (v) { return "×" + times(Math.exp(v)); } });

            ui.side.append(
                lineSlider.element,
                kit.group(null, [testTitle, kit.row([stats.caught, stats.missed, stats.blocked, stats.passed], { grid: true })], { plain: true }),
                kit.group("lab.spam.cluesTitle", [cluesBox])
            );

            // The bottom: the table, the idea, the explain panel, the challenges
            const tableBox = make("details", "sp-table-box");
            const tableSummary = make("summary", "sp-table-sum");
            const tableWrap = make("div", "sp-table-wrap");
            tableBox.append(tableSummary, tableWrap);
            const idea = make("p", "sp-idea");
            const explain = kit.explain({ steps: [{ key: "lab.spam.step1" }, { key: "lab.spam.step2" }, { key: "lab.spam.step3" }] });
            const challenges = kit.challenges({ ctx: ctx, items: [
                { key: "lab.spam.ch1", insightKey: "lab.spam.ch1Why", check: function (info) { return info.hasText && info.chance >= GOALS.sure; } },
                { key: "lab.spam.ch2", insightKey: "lab.spam.ch2Why", check: function (info) { return info.hasFree && info.chance < info.line; } },
                { key: "lab.spam.ch3", insightKey: "lab.spam.ch3Why", check: function (info) { return info.blocked === 0 && info.caught >= GOALS.caught; } },
                { key: "lab.spam.ch4", insightKey: "lab.spam.ch4Why", check: function (info) { return info.taught >= GOALS.taught; } }
            ] });
            ui.bottom.append(tableBox, idea, explain.element, challenges.element);

            // ----- What the buttons do -----
            function showExample() {
                const rows = set().test;
                exampleIndex = (exampleIndex + 1) % rows.length;
                box.value = rows[exampleIndex][0];
                render();
            }

            function teach(label) {
                const text = box.value.trim();
                if (!words(text).length) {
                    box.focus();
                    return;
                }
                const list = mineNow();
                list.push([text.slice(0, MAX_TEXT), label]);
                if (list.length > MAX_MINE) list.shift();
                saveMine();
                taughtNow++;
                retrain();
                ctx.announce(t("lab.spam.saidTaught", {
                    label: t(label ? "lab.spam.labelSpam" : "lab.spam.labelHam"),
                    n: A.format.number(model.messages[0] + model.messages[1])
                }));
                ctx.track("milestone", { kind: "taught", label: label ? "spam" : "ham", mine: list.length });
                render();
            }

            function forget() {
                mine[A.lang === "ru" ? "ru" : "en"] = [];
                saveMine();
                retrain();
                render();
            }

            function saveMine() {
                ctx.store.set("mine", { v: SAVE_VERSION, en: mine.en, ru: mine.ru });
            }

            // ----- Drawing -----
            function drawChips(clues) {
                chips.textContent = "";
                if (!clues.length) {
                    chips.appendChild(make("li", "sp-chip is-new", t("lab.spam.wordsNone")));
                    return;
                }
                clues.forEach(function (clue) {
                    let kind = "is-new";
                    let label = t("lab.spam.wordNew", { word: clue.word });
                    let strength = 0;
                    if (clue.ratio !== null) {
                        kind = clue.ratio >= 1 ? "is-spam" : "is-ham";
                        label = t(clue.ratio >= 1 ? "lab.spam.wordSpam" : "lab.spam.wordHam", { word: clue.word, n: times(clue.ratio) });
                        strength = Math.min(1, Math.abs(Math.log(clue.ratio)) / 2.5);
                    }
                    const chip = make("li", "sp-chip " + kind);
                    chip.style.setProperty("--sp-strength", strength.toFixed(2));
                    chip.title = label;
                    const word = make("span", "sp-chip-word", clue.word);
                    word.setAttribute("aria-hidden", "true");
                    chip.append(word, make("span", "sr-only", label));
                    if (clue.ratio !== null) {
                        const n = make("span", "sp-chip-n", "×" + times(clue.ratio));
                        n.setAttribute("aria-hidden", "true");
                        chip.appendChild(n);
                    }
                    chips.appendChild(chip);
                });
            }

            function drawTable(result) {
                tableWrap.textContent = "";
                A.dom.setText(tableSummary, t("lab.spam.tableTitle", { n: A.format.number(result.results.length) }));
                const table = make("table", "sp-table");
                const head = make("tr");
                ["lab.spam.colMessage", "lab.spam.colTruth", "lab.spam.colChance", "lab.spam.colVerdict"].forEach(function (key) {
                    const th = make("th", "", t(key));
                    th.scope = "col";
                    head.appendChild(th);
                });
                const thead = make("thead");
                thead.appendChild(head);
                const tbody = make("tbody");
                result.results.forEach(function (row) {
                    const right = row.flagged === Boolean(row.truth);
                    const tr = make("tr");
                    const th = make("th", "sp-msg", row.text);
                    th.scope = "row";
                    const verdictCell = make("td", right ? "is-right" : "is-wrong");
                    const markSpan = make("span", "sp-markch", right ? "✓" : "✗");
                    markSpan.setAttribute("aria-hidden", "true");
                    verdictCell.append(markSpan, document.createTextNode(t(row.flagged ? "lab.spam.spam" : "lab.spam.ham")),
                        make("span", "sr-only", " (" + t(right ? "lab.spam.right" : "lab.spam.wrong") + ")"));
                    tr.append(th, make("td", "", t(row.truth ? "lab.spam.spam" : "lab.spam.ham")), make("td", "sp-num", chanceText(row.chance)), verdictCell);
                    tbody.appendChild(tr);
                });
                table.append(thead, tbody);
                tableWrap.appendChild(table);
            }

            function render() {
                const text = box.value;
                const result = score(model, text);
                const hasText = words(text).length > 0;
                const chance = hasText ? result.chance : null;
                const known = result.clues.filter(function (clue) { return clue.ratio !== null; }).length;

                A.dom.setText(meterValue, hasText ? chanceText(chance) : "—");
                fill.style.width = hasText ? (chance * 100).toFixed(1) + "%" : "0%";
                mark.style.left = (line * 100).toFixed(1) + "%";
                meter.classList.toggle("is-spam", hasText && chance >= line);
                meter.classList.toggle("is-ham", hasText && chance < line);
                A.dom.setText(verdict, t(!hasText ? "lab.spam.verdictEmpty" : chance >= line ? "lab.spam.verdictSpam" : "lab.spam.verdictHam"));
                drawChips(result.clues);

                const list = mineNow();
                A.dom.setText(teachCount, list.length ? A.plural("lab.spam.taught", list.length) : t("lab.spam.taughtNone"));
                spamButton.setDisabled(!hasText);
                hamButton.setDisabled(!hasText);
                forgetButton.setDisabled(!list.length);

                const test = confusion(model, set().test, line);
                A.dom.setText(testTitle, t("lab.spam.testTitle", { n: A.format.number(test.results.length) }));
                stats.caught.set(test.caught);
                stats.missed.set(test.missed);
                stats.blocked.set(test.blocked);
                stats.passed.set(test.passed);
                drawTable(test);

                const clues = strongest(model);
                spamBars.update(clues.spam.map(function (x) { return { label: x.word, value: Math.log(x.r), colorIndex: 3 }; }));
                hamBars.update(clues.ham.map(function (x) { return { label: x.word, value: Math.log(1 / x.r), colorIndex: 0 }; }));

                idea.innerHTML = A.i18nHTML("lab.spam.ideaLine") + " ";
                idea.append(kit.termLink("naive-bayes", "lab.spam.term"), ".");
                explain.setValues(0, { spam: A.format.number(model.messages[1]), ham: A.format.number(model.messages[0]) });
                explain.setValues(1, { known: A.format.number(known) });
                explain.setValues(2, { chance: hasText ? chanceText(chance) : "—", line: A.format.percent(line) });
                explain.setStep(hasText ? 2 : 0);
                explain.setText(test.blocked > 0 || line > 0.85 ? "lab.spam.noteLine" : "lab.spam.noteNaive");

                const free = set().free;
                challenges.check({
                    hasText: hasText,
                    chance: hasText ? chance : 0,
                    line: line,
                    hasFree: words(text).indexOf(free) !== -1,
                    blocked: test.blocked,
                    caught: test.caught,
                    taught: taughtNow
                });
            }

            retrain();
            render();

            // ----- The controller: the hub calls these -----
            return {
                pause: function () {},
                resume: function () {},
                language: function () {
                    kit.relabel(stage);
                    box.placeholder = t("lab.spam.placeholder");
                    exampleIndex = -1;
                    retrain();
                    render();
                },
                theme: function () {
                    kit.colors.invalidate();
                    render();
                },
                destroy: function () {
                    box.removeEventListener("input", render);
                }
            };
        }
    });
})();
