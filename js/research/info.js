/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "info": ENTROPY AND DIVERGENCES
   Five small calculators in one tool (tabs inside the tool, K.parts):
     a. Two distributions  p and q: entropies, cross-entropy, KL both ways,
                           Jensen–Shannon, total variation, Hellinger,
                           Pinsker's inequality with the numbers, perplexity,
                           and a bar chart of p and q
     b. Joint table        a table of X (rows) and Y (columns), probabilities
                           or counts: marginals, H(X), H(Y), H(X, Y), the
                           conditional entropies and the mutual information
     c. Units              a loss in nats, bits or as a perplexity, and the
                           size of a text compressed by an ideal coder
     d. Fano               the smallest error any decoder must make
     e. Coin               the entropy of a coin, with its curve
   The results are those of unit t3 (S/r9/theory/TOPICS.md, t3).
   Texts: js/content/research/info.js. The functions of section 1 are pure
   and are given to the tests as spec.maths (dev/tests/research.info.math.js).
    1. The numbers (pure)
    2. The verdicts (pure)
    3. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["t3", "r5"];
    const SUM_TOLERANCE = 1e-6;          // a list "adds up to 1" when it is this close
    const MAX_CELLS = 8;                 // the joint table is at most 8 × 8
    const SHOWN_TERMS = 4;               // terms of a sum written out in a worked formula

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       unit: "bits" (log₂) or "nats" (ln). 0·log 0 counts as 0.
       ========================================================= */
    function perNat(unit) {
        return unit === "nats" ? 1 : 1 / Math.LN2;
    }

    function sum(list) {
        let total = 0;
        for (let i = 0; i < list.length; i++) total += list[i];
        return total;
    }

    // What is wrong with a pair of lists for part (a), or null
    //   -> { problem: "length" | "zero" | "sum", which: ["p"] / ["q"] / ["p", "q"], sums }
    function checkPair(p, q) {
        if (p.length !== q.length) return { problem: "length", p: p.length, q: q.length };
        const sums = { p: sum(p), q: sum(q) };
        const zero = ["p", "q"].filter(function (name) { return !(sums[name] > 0); });
        if (zero.length) return { problem: "zero", which: zero, sums: sums };
        const off = ["p", "q"].filter(function (name) { return Math.abs(sums[name] - 1) > SUM_TOLERANCE; });
        if (off.length) return { problem: "sum", which: off, sums: sums };
        return null;
    }

    function normalise(list) {
        const total = sum(list);
        return list.map(function (value) { return value / total; });
    }

    // (a) Everything about two distributions (each already adds up to 1 within 10⁻⁶;
    // they are divided by their sums first, so that the numbers are exactly those of a distribution)
    function two(pIn, qIn, unit) {
        const M = A.researchMath;
        const p = normalise(pIn);
        const q = normalise(qIn);
        const m = p.map(function (value, i) { return 0.5 * (value + q[i]); });
        const klNats = M.kl(p, q, "nats");
        let tv = 0;
        let bc = 0;
        for (let i = 0; i < p.length; i++) {
            tv += Math.abs(p[i] - q[i]);
            bc += Math.sqrt(p[i] * q[i]);
        }
        tv /= 2;
        const hp = M.entropy(p, unit);
        // the first outcome where one gives 0 and the other does not
        const zeroIn = function (a, b) {
            for (let i = 0; i < a.length; i++) if (a[i] > 0 && !(b[i] > 0)) return i;
            return -1;
        };
        return {
            p: p, q: q, m: m,
            hp: hp,
            hq: M.entropy(q, unit),
            cross: M.crossEntropy(p, q, unit),
            klPQ: M.kl(p, q, unit),
            klQP: M.kl(q, p, unit),
            klPM: M.kl(p, m, unit),
            klQM: M.kl(q, m, unit),
            js: M.jensenShannon(p, q, unit),
            tv: tv,
            bc: Math.min(1, bc),
            hellinger: Math.sqrt(Math.max(0, 1 - bc)),
            klNats: klNats,
            pinsker: Math.sqrt(klNats / 2),
            perplexity: Math.exp(M.entropy(p, "nats")),
            zeroPQ: zeroIn(p, q),
            zeroQP: zeroIn(q, p)
        };
    }

    // (b) A table from a flat list read row by row, cols numbers per row
    //   -> { problem } or { rows, cols, counts (whole numbers that were normalised), total, joint, px, py,
    //        hx, hy, hxy, hxGivenY, hyGivenX, mi }
    function joint(values, cols, unit) {
        const M = A.researchMath;
        if (values.length % cols !== 0) return { problem: "shape", count: values.length, cols: cols };
        const rows = values.length / cols;
        if (rows > MAX_CELLS) return { problem: "rows", rows: rows };
        const total = sum(values);
        if (!(total > 0)) return { problem: "zero" };
        let counts = false;
        if (Math.abs(total - 1) > SUM_TOLERANCE) {
            if (!values.every(function (value) { return Number.isInteger(value); })) return { problem: "neither", total: total };
            counts = true;
        }
        const table = [];
        for (let i = 0; i < rows; i++) table.push(values.slice(i * cols, (i + 1) * cols).map(function (value) { return value / total; }));
        const px = table.map(function (row) { return sum(row); });
        const py = [];
        for (let j = 0; j < cols; j++) py.push(sum(table.map(function (row) { return row[j]; })));
        const flat = [].concat.apply([], table);
        const hx = M.entropy(px, unit);
        const hy = M.entropy(py, unit);
        const hxy = M.entropy(flat, unit);
        // I(X; Y) = Σ p(x, y)·log(p(x, y)/(p(x)·p(y))): never below 0 (rounding may say −10⁻¹⁷)
        let mi = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (table[i][j] > 0) mi += table[i][j] * Math.log(table[i][j] / (px[i] * py[j]));
            }
        }
        mi = Math.max(0, mi) * perNat(unit);
        return {
            rows: rows, cols: cols, counts: counts, total: total, joint: table, px: px, py: py,
            hx: hx, hy: hy, hxy: hxy,
            hxGivenY: Math.max(0, hxy - hy),
            hyGivenX: Math.max(0, hxy - hx),
            mi: mi
        };
    }

    // (c) A loss given in one unit -> { nats, bits, perplexity }
    // (each from the number as given, so that the given unit stays exact: 0.8 bits is 0.8, not 0.79999…)
    function units(value, from) {
        if (from === "bits") return { nats: value * Math.LN2, bits: value, perplexity: Math.pow(2, value) };
        if (from === "perplexity") return { nats: Math.log(value), bits: Math.log2(value), perplexity: value };
        return { nats: value, bits: value / Math.LN2, perplexity: Math.exp(value) };
    }

    // n symbols at b bits each, by an ideal coder: n·b/8 bytes
    function compressed(n, bits) {
        return n * bits / 8;
    }

    // (d) Fano: M equally likely hypotheses, I bits -> { log2M, raw: 1 − (I + 1)/log₂ M, bound: at least 0 }
    function fano(count, info) {
        const log2M = Math.log2(count);
        const raw = 1 - (info + 1) / log2M;
        return { log2M: log2M, raw: raw, bound: Math.max(0, raw) };
    }

    // (e) the entropy of a coin
    function coin(p, unit) {
        return A.researchMath.binaryEntropy(p, unit);
    }

    /* =========================================================
       2. THE VERDICTS (pure: which sentence, with which numbers)
       ========================================================= */
    function verdictTwo(r) {
        if (r.tv === 0) return { key: "research.info.a.verdictSame", tone: "good" };
        if (r.klPQ === Infinity) {
            return { key: r.klQP === Infinity ? "research.info.a.verdictBothInfinite" : "research.info.a.verdictInfinite", tone: "bad", outcome: r.zeroPQ + 1, other: r.zeroQP + 1 };
        }
        if (r.klQP === Infinity) return { key: "research.info.a.verdictBackInfinite", tone: "info", outcome: r.zeroQP + 1 };
        return { key: "research.info.a.verdict", tone: "info" };
    }

    function verdictJoint(r) {
        if (r.hx === 0) return { key: "research.info.b.verdictFixed", tone: "info" };
        if (r.mi <= 1e-12 * r.hx) return { key: "research.info.b.verdictIndependent", tone: "info", share: 0 };
        return { key: "research.info.b.verdict", tone: r.mi >= r.hx * (1 - 1e-12) ? "good" : "info", share: r.mi / r.hx };
    }

    function verdictFano(f) {
        return f.raw > 0 ? { key: "research.info.d.verdict", tone: "warn" } : { key: "research.info.d.verdictNothing", tone: "info" };
    }

    const maths = {
        checkPair: checkPair, normalise: normalise, two: two, joint: joint, units: units, compressed: compressed, fano: fano, coin: coin,
        verdictTwo: verdictTwo, verdictJoint: verdictJoint, verdictFano: verdictFano
    };

    /* =========================================================
       3. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(ctx);
        const num = kit.num;

        function w(value, digits) {
            return num(value, { digits: digits || 5, grouping: false });
        }
        function exactly(value) {
            return num(value, { digits: 12, grouping: false });
        }
        function listText(list) {
            return "(" + list.map(function (value) { return w(value); }).join("; ") + ")";
        }
        // "a + b + c + d + … (n terms)": a sum written out, the first few terms
        function terms(count, term) {
            const shown = [];
            for (let i = 0; i < Math.min(count, SHOWN_TERMS); i++) shown.push(term(i));
            return shown.join(" + ") + (count > SHOWN_TERMS ? " + … " + t("research.info.terms", { n: String(count) }) : "");
        }
        function noText() {
            return "";
        }
        function logName(unit) {
            return unit === "nats" ? "ln" : "log₂";
        }
        // "bits" / "nats" in the form the number asks for ("1 bit", «0,47 бита»)
        function unitWord(unit, value) {
            return A.plural("research.info.unit." + unit, isFinite(value) ? value : 5);
        }
        function unitChoice(panel, name) {
            return panel.choice({
                name: name,
                labelKey: "research.info.unit",
                value: "bits",
                options: [{ value: "bits", labelKey: "research.info.unit.bitsName" }, { value: "nats", labelKey: "research.info.unit.natsName" }]
            });
        }
        // A result row in bits or nats (text, so that "infinite" can be a word); the exact
        // value stays on the row in data-value
        function infoRow(panel, name, labelKey, unitOf, hintKey) {
            let last = 0;
            const row = panel.result({
                name: name, labelKey: labelKey, kind: "text", hintKey: hintKey,
                unitKey: function () { return isFinite(last) && unitOf() ? unitWord(unitOf(), last) : ""; }
            });
            const set = row.set;
            row.put = function (value, extra) {
                last = value;
                set(isFinite(value) ? num(value, 5) : t("research.info.infinite"), Object.assign({ tone: isFinite(value) ? undefined : "bad" }, extra));
                row.element.setAttribute("data-value", String(value));
            };
            return row;
        }

        const parts = K.parts(stage, {
            name: "part",
            labelKey: "research.info.parts",
            items: [
                { id: "two", labelKey: "research.info.part.two" },
                { id: "joint", labelKey: "research.info.part.joint" },
                { id: "units", labelKey: "research.info.part.units" },
                { id: "fano", labelKey: "research.info.part.fano" },
                { id: "coin", labelKey: "research.info.part.coin" }
            ]
        });

        /* ----- (a) Two distributions ----- */
        const a = (function () {
            const panel = K.panel(parts.panels.two, { questionKey: "research.info.a.question", titleKey: "research.info.part.two", onChange: refresh });
            // no upper limit of 1: weights or counts may be pasted, and Normalise turns them into probabilities
            const fp = panel.list({ name: "a.p", labelKey: "research.info.a.p", value: [0.5, 0.5], minCount: 2, maxCount: 50, min: 0, max: 1e12, rows: 2 });
            const fq = panel.list({ name: "a.q", labelKey: "research.info.a.q", value: [0.9, 0.1], minCount: 2, maxCount: 50, min: 0, max: 1e12, rows: 2 });
            const unit = unitChoice(panel, "a.unit");
            // the remarks get their sentences (with numbers) when they are shown
            const problem = K.remark(panel.inputs, { key: noText, tone: "bad" });
            problem.element.setAttribute("role", "status");
            const fix = A.labKit.button("research.info.a.normalise", { variant: "ghost", size: "sm", onClick: normaliseLists });
            fix.element.classList.add("rs-info-normalise");
            panel.inputs.appendChild(fix.element);
            const u = function () { return unit.value(); };
            const rows = {
                hp: infoRow(panel, "hp", "research.info.a.hp", u),
                hq: infoRow(panel, "hq", "research.info.a.hq", u),
                cross: infoRow(panel, "cross", "research.info.a.cross", u),
                klPQ: infoRow(panel, "klPQ", "research.info.a.klPQ", u),
                klQP: infoRow(panel, "klQP", "research.info.a.klQP", u),
                js: infoRow(panel, "js", "research.info.a.js", u, "research.info.a.jsHint"),
                tv: infoRow(panel, "tv", "research.info.a.tv", function () { return null; }),
                hellinger: infoRow(panel, "hellinger", "research.info.a.hellinger", function () { return null; }),
                pinsker: infoRow(panel, "pinsker", "research.info.a.pinsker", function () { return null; }, "research.info.a.pinskerHint"),
                perplexity: infoRow(panel, "perplexity", "research.info.a.perplexity", function () { return null; }, "research.info.a.perplexityHint")
            };
            const why = panel.remark({ key: noText, tone: "warn" });
            const chart = panel.chart({
                labelKey: "research.info.a.chart",
                height: 220,
                x: { labelKey: "research.info.a.axisOutcome", step: 1 },
                y: { labelKey: "research.info.a.axisProb" }
            }, "below");
            panel.formula({ key: "research.info.a.formula" });
            panel.source({ nameKey: "research.info.a.source", units: UNITS });

            function hideProblem() {
                problem.hidden(true);
                fix.element.hidden = true;
            }

            function normaliseLists() {
                const p = fp.values();
                const q = fq.values();
                if (p && sum(p) > 0) fp.set(normalise(p));
                if (q && sum(q) > 0) fq.set(normalise(q));
                refresh();
                fp.input.focus();
            }

            function blank(text) {
                Object.keys(rows).forEach(function (name) { rows[name].clear(); });
                chart.clear();
                why.hidden(true);
                panel.verdict.set(text, "bad");
            }

            function refresh() {
                hideProblem();
                const v = panel.values();
                if (!v) {
                    why.hidden(true);
                    return;
                }
                const p = v["a.p"];
                const q = v["a.q"];
                const wrong = checkPair(p, q);
                if (wrong) {
                    let text;
                    if (wrong.problem === "length") text = t("research.info.a.lengthProblem", { p: String(wrong.p), q: String(wrong.q) });
                    else if (wrong.problem === "zero") text = t("research.info.a.zeroProblem", { list: wrong.which.join(t("research.info.and")) });
                    else text = t("research.info.a.sumProblem", { list: wrong.which.map(function (name) { return name + ": " + num(wrong.sums[name], { digits: 10 }); }).join(", ") });
                    problem.set(function () { return text; }, "bad");
                    problem.hidden(false);
                    fix.element.hidden = wrong.problem !== "sum";
                    blank(text);
                    return;
                }
                const unitNow = v["a.unit"];
                const r = two(p, q, unitNow);
                const log = logName(unitNow);
                const n = r.p.length;
                rows.hp.put(r.hp, { formula: t("research.info.a.hWork", { name: "p", log: log, sum: terms(n, function (i) { return w(r.p[i]) + "·" + log + " " + w(r.p[i]); }), v: w(r.hp) }) });
                rows.hq.put(r.hq, { formula: t("research.info.a.hWork", { name: "q", log: log, sum: terms(n, function (i) { return w(r.q[i]) + "·" + log + " " + w(r.q[i]); }), v: w(r.hq) }) });
                const crossWork = r.cross === Infinity
                    ? t("research.info.a.crossInfinite", { i: String(r.zeroPQ + 1), p: w(r.p[r.zeroPQ]) })
                    : t("research.info.a.crossWork", { log: log, sum: terms(n, function (i) { return w(r.p[i]) + "·" + log + " " + w(r.q[i]); }), v: w(r.cross) });
                rows.cross.put(r.cross, { formula: crossWork });
                const klWork = function (a2, b2, value, zero, first, second) {
                    if (value === Infinity) return t("research.info.a.klInfinite", { i: String(zero + 1), first: first, second: second, p: w(a2[zero]) });
                    return t("research.info.a.klWork", { first: first, second: second, log: log, sum: terms(n, function (i) { return w(a2[i]) + "·" + log + "(" + w(a2[i]) + "/" + w(b2[i]) + ")"; }), v: w(value) });
                };
                rows.klPQ.put(r.klPQ, { formula: klWork(r.p, r.q, r.klPQ, r.zeroPQ, "p", "q") });
                rows.klQP.put(r.klQP, { formula: klWork(r.q, r.p, r.klQP, r.zeroQP, "q", "p") });
                rows.js.put(r.js, { formula: t("research.info.a.jsWork", { m: listText(r.m), a: w(r.klPM), b: w(r.klQM), v: w(r.js) }) });
                rows.tv.put(r.tv, { formula: t("research.info.a.tvWork", { sum: terms(n, function (i) { return "|" + w(r.p[i]) + " − " + w(r.q[i]) + "|"; }), v: w(r.tv) }) });
                rows.hellinger.put(r.hellinger, { formula: t("research.info.a.hellingerWork", { bc: w(r.bc, 6), v: w(r.hellinger) }) });
                if (r.klNats === Infinity) {
                    // KL is infinite: Pinsker says only TV ≤ ∞, no bound (the word, not a number)
                    rows.pinsker.set(t("research.info.a.pinskerNone"), { formula: t("research.info.a.pinskerInfinite"), tone: "warn" });
                    rows.pinsker.element.setAttribute("data-value", "Infinity");
                } else {
                    rows.pinsker.put(r.pinsker, { formula: t("research.info.a.pinskerWork", { kl: w(r.klNats), v: w(r.pinsker), tv: w(r.tv) }), tone: r.tv <= r.pinsker * (1 + 1e-12) ? "good" : "bad" });
                }
                rows.perplexity.put(r.perplexity, { formula: t(unitNow === "nats" ? "research.info.a.perplexityWorkNats" : "research.info.a.perplexityWork", { h: w(r.hp), v: w(r.perplexity) }) });

                if (r.zeroPQ >= 0) {
                    why.set(function () { return t("research.info.a.why", { i: String(r.zeroPQ + 1), p: w(r.p[r.zeroPQ]) }); }, "warn");
                    why.hidden(false);
                } else {
                    why.hidden(true);
                }

                const said = verdictTwo(r);
                panel.verdict.set(t(said.key, {
                    kl: num(r.klPQ, 4), klr: num(r.klQP, 4), unitA: unitWord(unitNow, r.klPQ), unitB: unitWord(unitNow, r.klQP),
                    i: String(said.outcome), j: String(said.other)
                }), said.tone);

                chart.set({
                    x: { labelKey: "research.info.a.axisOutcome", step: 1, min: 0.5, max: n + 0.5 },
                    y: { labelKey: "research.info.a.axisProb", min: 0 },
                    series: [
                        { kind: "bars", data: r.p.map(function (value, i) { return [i + 0.6, i + 1, value]; }), colorIndex: 0, labelKey: "research.info.a.seriesP" },
                        { kind: "bars", data: r.q.map(function (value, i) { return [i + 1, i + 1.4, value]; }), colorIndex: 1, labelKey: "research.info.a.seriesQ" }
                    ],
                    describe: function () { return t("research.info.a.describe", { p: listText(r.p), q: listText(r.q) }); }
                });
            }
            return { refresh: refresh };
        })();

        /* ----- (b) A joint table ----- */
        const b = (function () {
            const panel = K.panel(parts.panels.joint, { questionKey: "research.info.b.question", titleKey: "research.info.part.joint", onChange: refresh });
            panel.list({ name: "b.table", labelKey: "research.info.b.table", value: [0.45, 0.05, 0.05, 0.45], minCount: 1, maxCount: 64, min: 0, max: 1e12, rows: 3, hintKey: "research.info.b.tableHint" });
            panel.field({ name: "b.cols", labelKey: "research.info.b.cols", kind: "int", min: 1, max: MAX_CELLS, value: 2 });
            const unit = unitChoice(panel, "b.unit");
            const problem = K.remark(panel.inputs, { key: noText, tone: "bad" });
            problem.element.setAttribute("role", "status");
            const u = function () { return unit.value(); };
            const read = panel.result({ name: "read", labelKey: "research.info.b.read", kind: "text" });
            const px = panel.result({ name: "px", labelKey: "research.info.b.px", kind: "text" });
            const py = panel.result({ name: "py", labelKey: "research.info.b.py", kind: "text" });
            const rows = {
                hx: infoRow(panel, "hx", "research.info.b.hx", u),
                hy: infoRow(panel, "hy", "research.info.b.hy", u),
                hxy: infoRow(panel, "hxy", "research.info.b.hxy", u),
                hxGivenY: infoRow(panel, "hxGivenY", "research.info.b.hxGivenY", u),
                hyGivenX: infoRow(panel, "hyGivenX", "research.info.b.hyGivenX", u),
                mi: infoRow(panel, "mi", "research.info.b.mi", u)
            };
            panel.formula({ key: "research.info.b.formula" });
            panel.source({ nameKey: "research.info.b.source", units: UNITS });

            function refresh() {
                problem.hidden(true);
                const v = panel.values();
                if (!v) return;
                const unitNow = v["b.unit"];
                const r = joint(v["b.table"], v["b.cols"], unitNow);
                if (r.problem) {
                    const text = t("research.info.b." + r.problem + "Problem", { count: String(r.count), cols: String(r.cols), rows: String(r.rows), total: num(r.total, { digits: 10 }), max: String(MAX_CELLS) });
                    problem.set(function () { return text; }, "bad");
                    problem.hidden(false);
                    [read, px, py].forEach(function (row) { row.clear(); });
                    Object.keys(rows).forEach(function (name) { rows[name].clear(); });
                    panel.verdict.set(text, "bad");
                    return;
                }
                const log = logName(unitNow);
                read.set(t(r.counts ? "research.info.b.readCounts" : "research.info.b.readProbs", { rows: String(r.rows), cols: String(r.cols), total: num(r.total) }), {
                    formula: r.counts ? t("research.info.b.countsWork", { total: exactly(r.total) }) : undefined, tone: r.counts ? "warn" : undefined
                });
                px.set(listText(r.px), { formula: t("research.info.b.pxWork") });
                py.set(listText(r.py), { formula: t("research.info.b.pyWork") });
                rows.hx.put(r.hx, { formula: t("research.info.b.hWork", { name: "X", log: log, sum: terms(r.px.length, function (i) { return w(r.px[i]) + "·" + log + " " + w(r.px[i]); }), v: w(r.hx) }) });
                rows.hy.put(r.hy, { formula: t("research.info.b.hWork", { name: "Y", log: log, sum: terms(r.py.length, function (i) { return w(r.py[i]) + "·" + log + " " + w(r.py[i]); }), v: w(r.hy) }) });
                rows.hxy.put(r.hxy, { formula: t("research.info.b.hxyWork", { log: log, n: String(r.rows * r.cols), v: w(r.hxy) }) });
                rows.hxGivenY.put(r.hxGivenY, { formula: t("research.info.b.hxGivenYWork", { hxy: w(r.hxy), hy: w(r.hy), v: w(r.hxGivenY) }) });
                rows.hyGivenX.put(r.hyGivenX, { formula: t("research.info.b.hyGivenXWork", { hxy: w(r.hxy), hx: w(r.hx), v: w(r.hyGivenX) }) });
                rows.mi.put(r.mi, { formula: t("research.info.b.miWork", { hx: w(r.hx), hy: w(r.hy), hxy: w(r.hxy), v: w(r.mi) }) });
                const said = verdictJoint(r);
                panel.verdict.set(t(said.key, {
                    mi: num(r.mi, 4), hx: num(r.hx, 4), unitMi: unitWord(unitNow, r.mi), unitHx: unitWord(unitNow, r.hx),
                    share: num(said.share, { percent: true, digits: 3 })
                }), said.tone);
            }
            return { refresh: refresh };
        })();

        /* ----- (c) Units ----- */
        const c = (function () {
            const panel = K.panel(parts.panels.units, { questionKey: "research.info.c.question", titleKey: "research.info.part.units", onChange: refresh });
            const value = panel.field({ name: "c.value", labelKey: "research.info.c.value", kind: "number", min: 0, max: 690, value: 2, powers: true });
            const from = panel.choice({
                name: "c.from",
                labelKey: "research.info.c.from",
                value: "nats",
                options: [
                    { value: "nats", labelKey: "research.info.c.fromNats" },
                    { value: "bits", labelKey: "research.info.c.fromBits" },
                    { value: "perplexity", labelKey: "research.info.c.fromPerplexity" }
                ]
            });
            panel.field({ name: "c.n", labelKey: "research.info.c.n", kind: "int", min: 1, max: 1e15, value: 1000000, powers: true, hintKey: "research.info.c.nHint" });
            const nats = panel.result({ name: "nats", labelKey: "research.info.c.nats", digits: 5 });
            const bits = panel.result({ name: "bits", labelKey: "research.info.c.bits", digits: 5 });
            const perplexity = panel.result({ name: "perplexity", labelKey: "research.info.c.perplexity", digits: 5 });
            let lastSize = 5;
            const bytes = panel.result({ name: "bytes", labelKey: "research.info.c.bytes", digits: 6, unitKey: function () { return A.plural("research.info.c.unitBytes", lastSize); } });
            panel.formula({ key: "research.info.c.formula" });
            panel.source({ nameKey: "research.info.c.source", units: UNITS });

            // Limits that follow the chosen unit: a perplexity is at least 1; e^690 and 2^995 still fit
            function limits() {
                const unitNow = from.value();
                if (unitNow === "perplexity") value.setLimits({ min: 1, max: 1e300 });
                else value.setLimits({ min: 0, max: unitNow === "bits" ? 995 : 690 });
            }

            function refresh() {
                limits();
                const v = panel.values();
                if (!v) return;
                const r = units(v["c.value"], v["c.from"]);
                const size = compressed(v["c.n"], r.bits);
                const words = { x: exactly(v["c.value"]), nats: w(r.nats), bits: w(r.bits), ppl: w(r.perplexity), n: String(v["c.n"]), size: w(size, 6) };
                const via = v["c.from"];
                nats.set(r.nats, { formula: t("research.info.c.natsWork." + via, words) });
                bits.set(r.bits, { formula: t("research.info.c.bitsWork." + via, words) });
                perplexity.set(r.perplexity, { formula: t("research.info.c.perplexityWork." + via, words) });
                lastSize = Number(size.toPrecision(6));
                bytes.set(size, { formula: t("research.info.c.bytesWork", words) });
                panel.verdict.set(t("research.info.c.verdict", {
                    nats: num(r.nats, 5), bits: num(r.bits, 5), ppl: num(r.perplexity, 5), n: num(v["c.n"]), bytes: num(size, 6),
                    unitNats: unitWord("nats", Number(r.nats.toPrecision(5))), unitBits: unitWord("bits", Number(r.bits.toPrecision(5))),
                    unitBytes: A.plural("research.info.c.unitBytes", lastSize)
                }), "info");
            }
            return { refresh: refresh };
        })();

        /* ----- (d) Fano ----- */
        const d = (function () {
            const panel = K.panel(parts.panels.fano, { questionKey: "research.info.d.question", titleKey: "research.info.part.fano", onChange: refresh });
            const fM = panel.field({ name: "d.M", labelKey: "research.info.d.M", kind: "int", min: 2, max: 1e15, value: 1024, powers: true });
            const fI = panel.field({ name: "d.I", labelKey: "research.info.d.I", kind: "number", min: 0, value: 4, hintKey: "research.info.d.IHint" });
            const log2M = panel.result({ name: "log2M", labelKey: "research.info.d.log2M", digits: 6 });
            const bound = panel.result({ name: "bound", labelKey: "research.info.d.bound", digits: 5 });
            panel.formula({ key: "research.info.d.formula" });
            panel.source({ nameKey: "research.info.d.source", units: UNITS });

            function refresh() {
                // I(X; Y) cannot exceed H(X) = log₂ M (a hair of room for the 12 digits a field keeps)
                const count = fM.value();
                if (!isNaN(count)) fI.setLimits({ max: Number(Math.log2(count).toPrecision(12)) });
                const v = panel.values();
                if (!v) return;
                const f = fano(v["d.M"], v["d.I"]);
                const words = { M: String(v["d.M"]), I: exactly(v["d.I"]), log: w(f.log2M, 6), raw: w(f.raw, 6) };
                log2M.set(f.log2M, { formula: t("research.info.d.log2MWork", words) });
                bound.set(f.bound, { formula: t(f.raw > 0 ? "research.info.d.boundWork" : "research.info.d.boundZero", words), tone: f.raw > 0 ? "warn" : undefined });
                const said = verdictFano(f);
                panel.verdict.set(t(said.key, { M: num(v["d.M"]), I: num(v["d.I"], { digits: 12 }), unit: unitWord("bits", v["d.I"]), p: num(f.bound, { percent: true, digits: 4 }) }), said.tone);
            }
            return { refresh: refresh };
        })();

        /* ----- (e) The entropy of a coin ----- */
        const e = (function () {
            const panel = K.panel(parts.panels.coin, { questionKey: "research.info.e.question", titleKey: "research.info.part.coin", onChange: refresh });
            panel.field({ name: "e.p", labelKey: "research.info.e.p", kind: "prob", value: 0.9 });
            const hBits = panel.result({ name: "bits", labelKey: "research.info.e.bits", digits: 5 });
            const hNats = panel.result({ name: "nats", labelKey: "research.info.e.nats", digits: 5 });
            const chart = panel.chart({
                labelKey: "research.info.e.chart",
                height: 220,
                x: { labelKey: "research.info.e.axisP", min: 0, max: 1 },
                y: { labelKey: "research.info.e.axisH", min: 0, max: 1 }
            }, "below");
            panel.formula({ key: "research.info.e.formula" });
            panel.source({ nameKey: "research.info.e.source", units: UNITS });
            const curve = [];
            for (let i = 0; i <= 200; i++) curve.push([i / 200, coin(i / 200, "bits")]);

            function refresh() {
                const v = panel.values();
                if (!v) return;
                const p = v["e.p"];
                const bits = coin(p, "bits");
                const nats = coin(p, "nats");
                const words = { p: exactly(p), q: exactly(Number((1 - p).toFixed(12))), bits: w(bits), nats: w(nats) };
                hBits.set(bits, { formula: t(p === 0 || p === 1 ? "research.info.e.certainWork" : "research.info.e.bitsWork", words) });
                hNats.set(nats, { formula: t("research.info.e.natsWork", words) });
                panel.verdict.set(t(p === 0 || p === 1 ? "research.info.e.verdictCertain" : "research.info.e.verdict", { p: num(p, { digits: 12 }), bits: num(bits, 4), unit: unitWord("bits", Number(bits.toPrecision(4))), share: num(bits, { percent: true, digits: 3 }) }), "info");
                chart.set({
                    x: { labelKey: "research.info.e.axisP", min: 0, max: 1 },
                    y: { labelKey: "research.info.e.axisH", min: 0, max: 1 },
                    series: [{ kind: "line", data: curve, colorIndex: 0, labelKey: "research.info.e.series" }],
                    marks: [{ x: p, y: bits, colorIndex: 1, label: function () { return t("research.info.e.mark", { p: num(p, { digits: 12 }), h: num(bits, 4) }); } }],
                    describe: function () { return t("research.info.e.describe", { p: num(p, { digits: 12 }), h: num(bits, 4) }); }
                });
            }
            return { refresh: refresh };
        })();

        function refresh() {
            a.refresh();
            b.refresh();
            c.refresh();
            d.refresh();
            e.refresh();
        }
        refresh();
        return K.controller(refresh);
    }

    A.research.define("info", { create: create, maths: maths });
})();
