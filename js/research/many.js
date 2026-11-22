/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "many": MANY COMPARISONS
   Three small calculators in one tool (tabs inside the tool, K.parts):
     a. Chance       m independent tests at level α when nothing is real:
                     P(at least one false positive), the expected number,
                     the Bonferroni and Šidák thresholds, a chart against m
     b. Correct      a pasted list of p-values -> Bonferroni, Holm and
                     Benjamini–Hochberg adjusted values, sorted, and which
                     survive; a chart of the sorted p-values with the thresholds
     c. Best of k    the best of k equally good models on one test set: its
                     expected inflation SE·E_k, and the guarantee of unit t1
   The formulas are those of S/r9/research/sheet-T1.md ("many"). Texts:
   js/content/research/many.js. The functions of sections 1 and 2 are pure
   and are given to the tests as spec.maths (dev/tests/research.many.math.js).
    1. The numbers (pure)
    2. The verdicts (pure) and notebook rows
    3. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const MAX_P = 200;                   // p-values in one list
    const MAX_M = 1e9;                   // tests in part (a)
    const MAX_K = 1e6;                   // models in part (c)
    const EK_STEPS = 24000;              // Simpson steps for E_k on [−12, 12]
    const SAME = 1e-12;                  // "adjusted p ≤ α" allows this relative rounding (5·0.01 is 0.05)
    const ROUGH_NPQ = 10;                // part (c): below this n·p·(1 − p) a score is not close to normal (a rule of thumb)

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       ========================================================= */
    // (a) m independent tests at level α, nothing real
    //   fwer = 1 − (1 − α)^m, written −expm1(m·ln(1 − α)) so that a tiny α keeps its digits;
    //   sidak = 1 − (1 − α)^(1/m) the same way
    function chance(m, alpha) {
        if (!(m >= 1) || !(alpha > 0 && alpha < 1)) return null;
        const log = Math.log1p(-alpha);
        return { fwer: -Math.expm1(m * log), expected: m * alpha, bonferroni: alpha / m, sidak: -Math.expm1(log / m) };
    }

    // Does an adjusted p-value survive at α? (≤, with room for the last digit of rounding)
    function survives(value, alpha) {
        return value <= alpha * (1 + SAME);
    }

    // (b) A list of p-values at level α ->
    //   { m, order (the places of the list, by rising p; ties keep their order), sorted,
    //     bonferroni, holm, bh (adjusted values in the sorted order), survive: { raw, bonferroni, holm, bh } }
    function correct(ps, alpha) {
        const M = A.researchMath;
        const m = ps.length;
        if (!m || !ps.every(function (p) { return p >= 0 && p <= 1; })) return null;
        const order = ps.map(function (_, i) { return i; }).sort(function (i, j) { return ps[i] - ps[j] || i - j; });
        const pick = function (list) { return order.map(function (i) { return list[i]; }); };
        const out = {
            m: m, order: order, sorted: pick(ps),
            bonferroni: pick(M.bonferroni(ps)), holm: pick(M.holm(ps)), bh: pick(M.benjaminiHochberg(ps))
        };
        const count = function (list) { return list.filter(function (value) { return survives(value, alpha); }).length; };
        out.survive = { raw: count(out.sorted), bonferroni: count(out.bonferroni), holm: count(out.holm), bh: count(out.bh) };
        return out;
    }

    // E_k = ∫ x·k·φ(x)·Φ(x)^(k−1) dx, the expected largest of k independent standard normal
    // values, by Simpson's rule on [−12, 12] (outside it the integrand is below 10⁻²⁵ for every
    // k up to 10⁶). Φ^(k−1) is exp((k − 1)·ln Φ), with ln Φ from the upper tail where Φ is near 1.
    function expectedMax(k) {
        const M = A.researchMath;
        if (!(k >= 1) || !Number.isInteger(k)) return NaN;
        if (k === 1) return 0;
        const f = function (x) {
            const logPhi = x > 0 ? Math.log1p(-M.normalSf(x)) : Math.log(M.normalCdf(x));
            return x * k * M.normalPdf(x) * Math.exp((k - 1) * logPhi);
        };
        return M.integrate(f, -12, 12, EK_STEPS);
    }

    // (c) The best of k models on n examples, all of true accuracy p; guarantee at δ
    //   -> { se, ek, inflation, reported, eps (k models, union bound), eps1 (one model), over, npq }
    //   SE·E_k treats each score as normal. Two signs that it does not hold:
    //   over: p + SE·E_k is above 1, an accuracy that no test set can show;
    //   npq = n·p·(1 − p) below ROUGH_NPQ: too few expected errors (or successes) for a normal score.
    function bestOf(p, n, k, delta) {
        if (!(p >= 0 && p <= 1) || !(n >= 1) || !(k >= 1) || !(delta > 0 && delta < 1)) return null;
        const se = Math.sqrt(p * (1 - p) / n);
        const ek = expectedMax(k);
        // ln(2k/δ) written ln 2 + ln k − ln δ: no overflow for a tiny δ
        const eps = Math.sqrt((Math.LN2 + Math.log(k) - Math.log(delta)) / (2 * n));
        const eps1 = Math.sqrt((Math.LN2 - Math.log(delta)) / (2 * n));
        return { se: se, ek: ek, inflation: se * ek, reported: p + se * ek, eps: eps, eps1: eps1, over: p + se * ek > 1, npq: n * p * (1 - p) };
    }

    /* =========================================================
       2. THE VERDICTS (pure): -> { key, tone, values } (numbers; the tool writes them)
       ========================================================= */
    function verdictChance(r, m, alpha) {
        if (m === 1) return { key: "one", tone: "info", values: { alpha: alpha } };
        return { key: "many", tone: r.fwer >= 0.5 ? "bad" : "warn", values: { m: m, alpha: alpha, fwer: r.fwer, expected: r.expected, bonferroni: r.bonferroni, sidak: r.sidak } };
    }

    function verdictCorrect(r, alpha) {
        const values = { m: r.m, alpha: alpha, raw: r.survive.raw, bonferroni: r.survive.bonferroni, holm: r.survive.holm, bh: r.survive.bh };
        if (r.m === 1) return { key: "single", tone: "info", values: values };
        if (r.survive.raw === 0) return { key: "noneRaw", tone: "info", values: values };
        if (r.survive.bh === 0) return { key: "none", tone: "warn", values: values };
        if (r.survive.bonferroni === r.survive.raw && r.survive.bh === r.survive.raw) return { key: "all", tone: "good", values: values };
        return { key: "some", tone: "warn", values: values };
    }

    // over: the formula's value is impossible (above 100%), so no typical value is claimed.
    // rough: true when n·p·(1 − p) is below ROUGH_NPQ; the tool then adds the sentence "rough".
    function verdictBest(r, k, p) {
        const values = { k: k, p: p, inflation: r.inflation, reported: r.reported, eps: r.eps, eps1: r.eps1 };
        if (k === 1) return { key: "one", tone: "info", values: values };
        if (r.se === 0) return { key: "noSpread", tone: "info", values: values };
        if (r.over) return { key: "over", tone: "bad", values: values };
        return { key: r.eps >= 1 ? "vacuous" : "many", tone: "warn", values: values, rough: r.npq < ROUGH_NPQ };
    }

    // A notebook entry keeps rows of at most 400 characters (js/research.js, LIMITS.rowValue):
    // a long worked formula (a list of 200 adjusted p-values) goes on in further rows, cut
    // after a comma. Every output reaches the notebook. (Meant for the kit: see the final report.)
    const NOTE_VALUE = 400;
    function splitRows(rows) {
        const out = [];
        (rows || []).forEach(function (row) {
            let rest = String(row[1]);
            let name = row[0];
            while (rest.length > NOTE_VALUE) {
                let cut = rest.lastIndexOf(", ", NOTE_VALUE - 1);
                if (cut < NOTE_VALUE / 2) cut = NOTE_VALUE - 1;
                else cut += 1;
                out.push([name, rest.slice(0, cut)]);
                rest = rest.slice(cut).replace(/^ /, "");
                name = "";
            }
            out.push([name, rest]);
        });
        return out;
    }
    function withSplitNotes(ctx) {
        if (!ctx || typeof ctx.note !== "function") return ctx;
        return Object.assign({}, ctx, {
            note: function (entry) { return ctx.note(Object.assign({}, entry, { results: splitRows(entry && entry.results) })); }
        });
    }

    const maths = {
        chance: chance, correct: correct, survives: survives, expectedMax: expectedMax, bestOf: bestOf,
        verdictChance: verdictChance, verdictCorrect: verdictCorrect, verdictBest: verdictBest, splitRows: splitRows,
        ROUGH_NPQ: ROUGH_NPQ
    };

    /* =========================================================
       3. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(withSplitNotes(ctx));
        const num = kit.num;

        function w(value, digits) {
            return num(value, { digits: digits || 5, grouping: false });
        }
        function exactly(value) {
            return num(value, { digits: 12, grouping: false });
        }
        function pct(share) {
            return num(share, { percent: true, digits: 4 });
        }
        function say(verdict, prefix) {
            const values = {};
            Object.keys(verdict.values).forEach(function (name) {
                const value = verdict.values[name];
                if (name === "fwer" || name === "reported" || name === "p") values[name] = pct(value);
                else if (name === "inflation" || name === "eps" || name === "eps1") values[name] = num(100 * value);   // percentage points
                else if (name === "alpha") values[name] = num(value, { digits: 12 });
                else values[name] = num(value);
            });
            return t(prefix + verdict.key, values);
        }

        const parts = K.parts(stage, {
            name: "part",
            labelKey: "research.many.parts",
            items: [
                { id: "chance", labelKey: "research.many.part.chance" },
                { id: "correct", labelKey: "research.many.part.correct" },
                { id: "best", labelKey: "research.many.part.best" }
            ]
        });

        /* ----- (a) How fast chance wins ----- */
        const a = (function () {
            const panel = K.panel(parts.panels.chance, { questionKey: "research.many.a.question", titleKey: "research.many.part.chance", onChange: refresh });
            panel.field({ name: "a.m", labelKey: "research.many.a.m", kind: "int", min: 1, max: MAX_M, value: 20, powers: true, unitKey: "research.many.unit.tests" });
            panel.field({ name: "a.alpha", labelKey: "research.many.alpha", kind: "prob", min: 0, max: 1, minOpen: true, maxOpen: true, value: 0.05, powers: true, hintKey: "research.many.alphaHint" });
            const fwer = panel.result({ name: "fwer", labelKey: "research.many.a.fwer", kind: "percent", hintKey: "research.many.a.fwerHint" });
            const expected = panel.result({ name: "expected", labelKey: "research.many.a.expected" });
            const bonferroni = panel.result({ name: "bonferroni", labelKey: "research.many.a.bonferroni", hintKey: "research.many.a.bonferroniHint" });
            const sidak = panel.result({ name: "sidak", labelKey: "research.many.a.sidak", hintKey: "research.many.a.sidakHint" });
            const chart = panel.chart({
                labelKey: "research.many.a.chart", height: 240,
                x: { log: true, labelKey: "research.many.a.axisM" }, y: { labelKey: "research.many.a.axisP", min: 0, max: 1 }
            }, "below");
            panel.formula({ key: "research.many.a.formula" });
            panel.source({ nameKey: "research.many.a.source", units: ["r12"] });

            function refresh() {
                const v = panel.values();
                if (!v) return;
                const m = v["a.m"];
                const alpha = v["a.alpha"];
                const r = chance(m, alpha);
                if (!r) return;
                const words = { m: String(m), alpha: exactly(alpha), q: exactly(Number((1 - alpha).toFixed(14))) };
                fwer.set(r.fwer, { formula: t("research.many.a.fwerWork", Object.assign({ value: w(r.fwer, 6) }, words)), tone: r.fwer >= 0.5 ? "bad" : m > 1 ? "warn" : undefined });
                expected.set(r.expected, { formula: t("research.many.a.expectedWork", Object.assign({ value: w(r.expected, 6) }, words)) });
                bonferroni.set(r.bonferroni, { formula: t("research.many.a.bonferroniWork", Object.assign({ value: w(r.bonferroni, 6) }, words)) });
                sidak.set(r.sidak, { formula: t("research.many.a.sidakWork", Object.assign({ value: w(r.sidak, 6) }, words)) });
                const verdict = verdictChance(r, m, alpha);
                panel.verdict.set(say(verdict, "research.many.a.verdict."), verdict.tone);
                // the chart: 1 − (1 − α)^m from 1 to ten times m (at least to 100), on a log axis
                const top = Math.max(2, Math.ceil(Math.log10(m) + 1e-9) + 1);
                const data = [];
                for (let i = 0; i <= 200; i++) {
                    const x = Math.pow(10, top * i / 200);
                    data.push([x, -Math.expm1(x * Math.log1p(-alpha))]);
                }
                chart.set({
                    x: { log: true, labelKey: "research.many.a.axisM", min: 1, max: Math.pow(10, top) },
                    y: { labelKey: "research.many.a.axisP", min: 0, max: 1 },
                    series: [{ kind: "line", data: data, colorIndex: 0, labelKey: "research.many.a.series" }],
                    hlines: [{ y: alpha, label: function () { return t("research.many.a.lineAlpha", { alpha: num(alpha, { digits: 12 }) }); } }],
                    marks: [{ x: m, y: r.fwer, colorIndex: 0, label: function () { return t("research.many.a.mark", { m: num(m), p: pct(r.fwer) }); } }],
                    describe: function () { return t("research.many.a.describe", { m: num(m), p: pct(r.fwer), alpha: num(alpha, { digits: 12 }) }); }
                });
            }
            return { refresh: refresh };
        })();

        /* ----- (b) Correct a list of p-values ----- */
        const b = (function () {
            const panel = K.panel(parts.panels.correct, { questionKey: "research.many.b.question", titleKey: "research.many.part.correct", onChange: refresh });
            panel.list({ name: "b.ps", labelKey: "research.many.b.ps", value: [0.001, 0.008, 0.012, 0.03, 0.04, 0.2], minCount: 1, maxCount: MAX_P, min: 0, max: 1, rows: 3 });
            panel.field({ name: "b.alpha", labelKey: "research.many.alpha", kind: "prob", min: 0, max: 1, minOpen: true, maxOpen: true, value: 0.05, powers: true, hintKey: "research.many.b.alphaHint" });
            let mNow = 0;
            const of = function () { return t("research.many.b.of", { m: num(mNow) }); };
            const raw = panel.result({ name: "raw", labelKey: "research.many.b.raw", kind: "int", unitKey: of });
            const bonferroni = panel.result({ name: "bonferroni", labelKey: "research.many.b.bonferroni", kind: "int", unitKey: of });
            const holm = panel.result({ name: "holm", labelKey: "research.many.b.holm", kind: "int", unitKey: of });
            const bh = panel.result({ name: "bh", labelKey: "research.many.b.bh", kind: "int", unitKey: of });
            panel.remark({ key: "research.many.b.remark" });
            const table = panel.table({
                captionKey: "research.many.b.table",
                columns: [
                    { labelKey: "research.many.b.col.test" }, { labelKey: "research.many.b.col.p", numeric: true },
                    { labelKey: "research.many.b.col.bonferroni", numeric: true }, { labelKey: "research.many.b.col.holm", numeric: true },
                    { labelKey: "research.many.b.col.bh", numeric: true }
                ]
            });
            const chart = panel.chart({
                labelKey: "research.many.b.chart", height: 260,
                x: { labelKey: "research.many.b.axisRank", step: 1 }, y: { log: true, labelKey: "research.many.b.axisP" }
            }, "below");
            panel.formula({ key: "research.many.b.formula" });
            panel.source({ nameKey: "research.many.b.source", units: ["r12"] });

            function listText(values) {
                return values.map(function (value) { return w(value, 4); }).join(", ");
            }

            function refresh() {
                const v = panel.values();
                if (!v) {
                    table.set([]);
                    return;
                }
                const alpha = v["b.alpha"];
                const r = correct(v["b.ps"], alpha);
                if (!r) return;
                mNow = r.m;
                const words = { m: String(r.m), alpha: exactly(alpha), sorted: listText(r.sorted) };
                raw.set(r.survive.raw, { formula: t("research.many.b.rawWork", words) });
                bonferroni.set(r.survive.bonferroni, { formula: t("research.many.b.bonferroniWork", Object.assign({ list: listText(r.bonferroni) }, words)) });
                holm.set(r.survive.holm, { formula: t("research.many.b.holmWork", Object.assign({ list: listText(r.holm) }, words)) });
                bh.set(r.survive.bh, { formula: t("research.many.b.bhWork", Object.assign({ list: listText(r.bh) }, words)) });
                // an adjusted value, with ✓ when it survives (written again after a language switch:
                // the controller calls refresh)
                const cell = function (value) {
                    return num(value, { digits: 4 }) + (survives(value, alpha) ? " ✓" : "");
                };
                table.set(r.order.map(function (place, rank) {
                    return [
                        t("research.many.b.testName", { n: String(place + 1) }),
                        { value: r.sorted[rank], digits: 4 },
                        cell(r.bonferroni[rank]), cell(r.holm[rank]), cell(r.bh[rank])
                    ];
                }));
                const verdict = verdictCorrect(r, alpha);
                panel.verdict.set(say(verdict, "research.many.b.verdict."), verdict.tone);
                // the chart: the sorted p-values against their rank, with the three thresholds
                const ranks = r.sorted.map(function (p, i) { return [i + 1, p]; });
                const bhLine = [];
                const holmLine = [];
                for (let i = 1; i <= r.m; i++) {
                    bhLine.push([i, alpha * i / r.m]);
                    holmLine.push([i, alpha / (r.m - i + 1)]);
                }
                // the log axis starts at least a third of a decade below the smallest positive value
                // (a p-value of 0 cannot be drawn on it: the table shows it)
                const lo = Math.min.apply(null, r.sorted.filter(function (p) { return p > 0; }).concat([alpha / r.m]));
                chart.set({
                    x: { labelKey: "research.many.b.axisRank", step: 1, min: r.m > 1 ? 1 : 0, max: r.m > 1 ? r.m : 2 },
                    y: { log: true, labelKey: "research.many.b.axisP", min: Math.pow(10, Math.floor(Math.log10(lo) - 0.3)), max: 1 },
                    series: [
                        { kind: "line", data: bhLine, colorIndex: 2, labelKey: "research.many.b.series.bh" },
                        { kind: "line", data: holmLine, colorIndex: 1, dash: true, labelKey: "research.many.b.series.holm" },
                        { kind: "points", data: ranks, colorIndex: 0, labelKey: "research.many.b.series.p" }
                    ],
                    hlines: [
                        { y: alpha / r.m, color: "danger", label: function () { return t("research.many.b.lineBonferroni", { value: num(alpha / r.m) }); } },
                        { y: alpha, label: function () { return t("research.many.b.lineAlpha", { alpha: num(alpha, { digits: 12 }) }); } }
                    ],
                    describe: function () {
                        return t("research.many.b.describe", { m: num(r.m), raw: num(r.survive.raw), bonferroni: num(r.survive.bonferroni), holm: num(r.survive.holm), bh: num(r.survive.bh) });
                    }
                });
            }
            return { refresh: refresh };
        })();

        /* ----- (c) The best of k ----- */
        const c = (function () {
            const panel = K.panel(parts.panels.best, { questionKey: "research.many.c.question", titleKey: "research.many.part.best", onChange: refresh });
            panel.field({ name: "c.acc", labelKey: "research.many.c.acc", kind: "percent", value: 80, hintKey: "research.many.c.accHint" });
            panel.field({ name: "c.n", labelKey: "research.many.c.n", kind: "int", min: 1, value: 2000, powers: true, unitKey: "research.many.unit.examples" });
            panel.field({ name: "c.k", labelKey: "research.many.c.k", kind: "int", min: 1, max: MAX_K, value: 100, powers: true, unitKey: "research.many.unit.models" });
            panel.field({ name: "c.delta", labelKey: "research.many.c.delta", kind: "prob", min: 0, max: 1, minOpen: true, maxOpen: true, value: 0.05, powers: true, hintKey: "research.many.c.deltaHint" });
            const se = panel.result({ name: "se", labelKey: "research.many.c.se" });
            panel.heading("research.many.c.headTypical");
            const ek = panel.result({ name: "ek", labelKey: "research.many.c.ek" });
            const inflation = panel.result({ name: "inflation", labelKey: "research.many.c.inflation", hintKey: "research.many.c.inflationHint" });
            const reported = panel.result({ name: "reported", labelKey: "research.many.c.reported", kind: "percent" });
            panel.heading("research.many.c.headGuarantee");
            const eps = panel.result({ name: "eps", labelKey: "research.many.c.eps", hintKey: "research.many.c.epsHint" });
            const eps1 = panel.result({ name: "eps1", labelKey: "research.many.c.eps1" });
            panel.formula({ key: "research.many.c.formula" });
            panel.source({ nameKey: "research.many.c.source", units: ["t1", "r12"] });

            function refresh() {
                const v = panel.values();
                if (!v) return;
                const p = v["c.acc"];
                const n = v["c.n"];
                const k = v["c.k"];
                const delta = v["c.delta"];
                const r = bestOf(p, n, k, delta);
                if (!r) return;
                const words = {
                    p: exactly(p), q: exactly(Number((1 - p).toFixed(12))), n: String(n), k: String(k), delta: exactly(delta), se: w(r.se), ek: w(r.ek, 6),
                    inflation: w(r.inflation), reported: w(r.reported), eps: w(r.eps), eps1: w(r.eps1), k2: exactly(2 * k)
                };
                se.set(r.se, { formula: t("research.many.c.seWork", words) });
                ek.set(r.ek, { formula: t(k === 1 ? "research.many.c.ekOne" : "research.many.c.ekWork", words) });
                const verdict = verdictBest(r, k, p);
                const over = verdict.key === "over";
                inflation.set(r.inflation, { formula: t("research.many.c.inflationWork", words), tone: over ? "bad" : verdict.rough ? "warn" : undefined });
                // above 100% the formula's value is not an accuracy: no number is shown, only why
                if (over) reported.set(null, { formula: t("research.many.c.reportedOver", words), tone: "bad" });
                else reported.set(r.reported, { formula: t("research.many.c.reportedWork", words), tone: verdict.rough ? "warn" : undefined });
                eps.set(r.eps, { formula: t("research.many.c.epsWork", words), tone: r.eps >= 1 ? "bad" : undefined });
                eps1.set(r.eps1, { formula: t("research.many.c.eps1Work", words), tone: r.eps1 >= 1 ? "bad" : undefined });
                panel.verdict.set(say(verdict, "research.many.c.verdict.") +
                    (verdict.rough ? " " + t("research.many.c.verdict.rough", { npq: num(r.npq), limit: num(ROUGH_NPQ) }) : ""), verdict.tone);
            }
            return { refresh: refresh };
        })();

        function refresh() {
            a.refresh();
            b.refresh();
            c.refresh();
        }
        refresh();
        return K.controller(refresh);
    }

    A.research.define("many", { create: create, maths: maths });
})();
