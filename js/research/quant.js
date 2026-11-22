/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "quant": QUANTISATION
   Weights w ~ N(0, σ²) stored with b bits by a symmetric uniform quantiser
   that clips at R = c·σ: Q = 2^(b−1) − 1, step s = R/Q,
   w ↦ s·clamp(round(w/s), −Q, Q)   (2Q + 1 levels, 0 is one of them).
     - the model: rounding noise s²/12 inside the range (the uniform-noise
       model), the clipping error outside it (exact for a normal
       distribution), the mean squared error and the SQNR in dB
     - the exact error of this quantiser for normal weights, level by level,
       so the reader sees how far the uniform-noise model is off
     - the best clipping range c for b bits (searched numerically in [0.5, 12])
     - a simulation next to the model: 2,000,000 seeded normal weights, or the
       reader's own pasted weights (σ estimated from them)
     - a chart of SQNR against b, with the rule of thumb "6 dB per bit"
     - the size of a model at b bits
   Texts: js/content/research/quant.js. The functions of section 1 are pure
   and are given to the tests as spec.maths (dev/tests/research.quant.math.js).
    1. The numbers (pure)
    2. The verdict (pure)
    3. Two helpers for the page: a rule a field's limits cannot say, a field
       used only in one mode
    4. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["r10"];
    // normal weights in the simulation: two million, as on the sheet. With 200,000 only about
    // 13 weights are clipped at 8 bits and c = 4, and the clipping part (from those few far
    // weights) made the default measurement land 3.7 standard errors from the exact value
    const RUNS = 2000000;
    const C_LOW = 0.5;                   // the best clipping range is searched in [C_LOW, C_HIGH]
    const C_HIGH = 12;
    const C_GRID = 0.05;                 // first on a grid with this step, then exactly around the best point
    const B_LOW = 2;                     // the chart's bits
    const B_HIGH = 16;
    const DB_PER_BIT = 20 * Math.log10(2);   // 6.0206 dB: the rule of thumb "about 6 dB per bit"
    const FAR_DB = 0.5;                  // a gain from here on is worth saying "would gain"
    const ROUGH_BITS = 3;                // at this many bits or fewer the uniform-noise model can be rough
                                         // (it leaves 5% of the exact error at a step of about 2.5σ:
                                         // 2 bits with c above 2.5, 3 bits with c above 7.4)
    const MODEL_OFF = 0.05;              // model more than 5% away from the exact error: say so
    const DIFFER = 0.1;                  // pasted weights: model and measurement more than 10% apart: say so
    const PIECE = 0.25;                  // the exact error integrates over pieces at most this wide (in σ)
    const BYTE_UNITS = [["B", 1], ["kB", 1e3], ["MB", 1e6], ["GB", 1e9], ["TB", 1e12], ["PB", 1e15]];
    // Gauss–Legendre with 8 points on [−1, 1]: exact for polynomials up to degree 15
    const GL_X = [0.1834346424956498, 0.5255324099163290, 0.7966664774136267, 0.9602898564975363];
    const GL_W = [0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763];

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       All errors are relative to σ² (they scale with it): multiply by σ².
       ========================================================= */
    function M() {
        return A.researchMath;
    }

    // Q = 2^(b−1) − 1: the largest level index; 2Q + 1 levels in all
    function levels(bits) {
        return Math.pow(2, bits - 1) - 1;
    }

    // The clipping error / σ²: 2·[(1 + c²)·(1 − Φ(c)) − c·φ(c)], with 1 − Φ(c) taken as
    // normalSf(c), so the far tail keeps its digits (never below 0)
    function clipping(c) {
        return Math.max(0, 2 * ((1 + c * c) * M().normalSf(c) - c * M().normalPdf(c)));
    }

    // The model for b bits clipping at c·σ, everything relative to σ²:
    // -> { Q, step (s/σ), inside (2Φ(c) − 1), rounding, clipping, mse, sqnr (dB) }
    function model(bits, c) {
        const Q = levels(bits);
        const step = c / Q;
        const inside = 1 - 2 * M().normalSf(c);
        const rounding = step * step / 12 * inside;
        const clip = clipping(c);
        const mse = rounding + clip;
        return { Q: Q, step: step, inside: inside, rounding: rounding, clipping: clip, mse: mse, sqnr: -10 * Math.log10(mse) };
    }

    // ∫ (w − m)²·φ(w) dw from lo to hi: Gauss–Legendre on pieces at most PIECE wide
    function moment(m, lo, hi) {
        const pieces = Math.max(1, Math.ceil((hi - lo) / PIECE));
        const width = (hi - lo) / pieces;
        let total = 0;
        for (let p = 0; p < pieces; p++) {
            const middle = lo + (p + 0.5) * width;
            let part = 0;
            for (let i = 0; i < GL_X.length; i++) {
                const a = middle - GL_X[i] * width / 2;
                const b = middle + GL_X[i] * width / 2;
                part += GL_W[i] * ((a - m) * (a - m) * M().normalPdf(a) + (b - m) * (b - m) * M().normalPdf(b));
            }
            total += part * width / 2;
        }
        return total;
    }

    // The true mean squared error / σ² of this quantiser for w ~ N(0, σ²), level by level:
    // level k (|k| < Q) takes w in [(k − ½)s, (k + ½)s); the outer level Q takes everything
    // from (Q − ½)s on, which is the part up to Q·s plus the clipping error beyond it.
    // By symmetry: level 0 + 2·(levels 1 … Q − 1) + 2·(the outer level).
    function exactMse(bits, c) {
        const Q = levels(bits);
        const s = c / Q;
        let inner = 0;
        for (let k = 1; k < Q; k++) inner += moment(k * s, (k - 0.5) * s, (k + 0.5) * s);
        const outer = moment(Q * s, (Q - 0.5) * s, Q * s) + clipping(c) / 2;
        return moment(0, -s / 2, s / 2) + 2 * inner + 2 * outer;
    }

    // The share of normal weights outside the clipping range, |w| > c·σ = Q·s: these are the
    // clipped ones. It is the rest of the model's "inside" share 2Φ(c) − 1, and these are
    // the weights the clipping error is about (the hint of c says the same: values beyond
    // ±c·σ are clipped). The number of bits does not matter.
    function clippedShare(bits, c) {
        return 2 * M().normalSf(c);
    }

    // The c in [0.5, 12] with the smallest model error for b bits: the best grid point,
    // then golden-section search between its neighbours -> { c, mse, sqnr }
    function best(bits) {
        let at = C_LOW;
        let lowest = Infinity;
        for (let c = C_LOW; c <= C_HIGH + 1e-9; c += C_GRID) {
            const value = model(bits, c).mse;
            if (value < lowest) {
                lowest = value;
                at = c;
            }
        }
        const found = M().minimise(function (c) { return model(bits, c).mse; }, Math.max(C_LOW, at - C_GRID), Math.min(C_HIGH, at + C_GRID), 1e-12);
        const r = model(bits, found.x);
        return { c: found.x, mse: r.mse, sqnr: r.sqnr };
    }

    // One weight through the quantiser: s·clamp(round(w/s), −Q, Q). round() goes half away
    // from 0, so the quantiser is symmetric (a tie has probability 0 for normal weights)
    function quantise(w, step, Q) {
        const k = w / step;
        const r = Math.sign(k) * Math.floor(Math.abs(k) + 0.5);
        return step * Math.max(-Q, Math.min(Q, r));
    }

    // The sample standard deviation (n − 1) and the mean of pasted weights
    function estimate(values) {
        const m = M().mean(values);
        return { mean: m, sigma: M().sd(values) };
    }

    // A measurement in slices (for the kit's job): the mean of (w − q(w))² over the weights,
    // with its standard error and the number of clipped weights. o = { bits, c, sigma, values }
    // (the reader's weights) or { bits, c, sigma, count, seed } (count normal weights N(0, σ²)
    // from rng(seed)).
    // -> { step(chunk) -> true when done, progress(), result() -> { n, mse, se, clipped } }
    function measurement(o) {
        const Q = levels(o.bits);
        const stepSize = o.c * o.sigma / Q;
        const edge = o.c * o.sigma;      // a weight is clipped when it lies outside ±c·σ
        const n = o.values ? o.values.length : o.count;
        const random = o.values ? null : M().rng(o.seed);
        let i = 0;
        let mean = 0;
        let spread = 0;              // Welford: the sum of squared distances from the running mean
        let clipped = 0;
        return {
            step: function (chunk) {
                const end = Math.min(n, i + (chunk || 1000));
                for (; i < end; i++) {
                    const w = o.values ? o.values[i] : o.sigma * random.normal();
                    const e = w - quantise(w, stepSize, Q);
                    const e2 = e * e;
                    const before = mean;
                    mean += (e2 - mean) / (i + 1);
                    spread += (e2 - before) * (e2 - mean);
                    if (Math.abs(w) > edge) clipped += 1;
                }
                return i >= n;
            },
            progress: function () { return n ? i / n : 1; },
            result: function () {
                return { n: n, mse: mean, se: n > 1 ? Math.sqrt(spread / (n - 1) / n) : NaN, clipped: clipped };
            }
        };
    }

    // The whole measurement at once (for the tests)
    function measure(o) {
        const work = measurement(o);
        while (!work.step(100000)) { /* the slices run one after the other */ }
        return work.result();
    }

    // The chart's data: SQNR for b = 2 … 16 at the chosen c and at the best c of each b
    function curve(c) {
        const chosen = [];
        const optimal = [];
        for (let b = B_LOW; b <= B_HIGH; b++) {
            chosen.push([b, model(b, c).sqnr]);
            optimal.push([b, best(b).sqnr]);
        }
        return { chosen: chosen, optimal: optimal };
    }

    // Bytes of N weights at b bits
    function bytesFor(count, bits) {
        return count * bits / 8;
    }

    function bytesIn(bytes) {
        let chosen = BYTE_UNITS[0];
        BYTE_UNITS.forEach(function (unit) { if (bytes >= unit[1]) chosen = unit; });
        return { value: bytes / chosen[1], unit: chosen[0] };
    }

    /* =========================================================
       2. THE VERDICT (pure): which sentences fit the numbers
         gain:  "far" from 0.5 dB on ("would gain"), "near" below
         model: normal weights: "off" when the model is more than 5% from the exact
                error; else "fine" at 2 or 3 bits (can be rough, but not here); else ""
                pasted weights: "rough" at 2 or 3 bits; else ""
         differ: pasted weights only: model and measurement more than 10% apart
       modelOff = (model − exact)/exact; measuredOff = (model − measured)/measured
       ========================================================= */
    function verdictParts(bits, gainDb, modelOff, measuredOff, pasted) {
        let modelWord = "";
        if (pasted) modelWord = bits <= ROUGH_BITS ? "rough" : "";
        else if (Math.abs(modelOff) > MODEL_OFF) modelWord = "off";
        else if (bits <= ROUGH_BITS) modelWord = "fine";
        return {
            gain: gainDb >= FAR_DB ? "far" : "near",
            model: modelWord,
            differ: Boolean(pasted) && isFinite(measuredOff) && Math.abs(measuredOff) > DIFFER
        };
    }

    const maths = {
        levels: levels, clipping: clipping, model: model, moment: moment, exactMse: exactMse, clippedShare: clippedShare,
        best: best, quantise: quantise, estimate: estimate, measurement: measurement, measure: measure, curve: curve,
        bytesFor: bytesFor, bytesIn: bytesIn, verdictParts: verdictParts, RUNS: RUNS, DB_PER_BIT: DB_PER_BIT
    };

    /* =========================================================
       3. TWO HELPERS FOR THE PAGE
       (candidates for the bench kit: see the final notes of task T2)
       ========================================================= */
    // A rule that a field's limits cannot say: see js/research/sizer.js, section 3
    function crossRule(item, test) {
        const ownValid = item.valid;
        let message = "";
        let shown = "";
        item.valid = function () { return ownValid() && !message; };
        function paint() {
            if (!ownValid()) return;
            const box = item.element.querySelector(".rk-msg");
            if (box && (message || box.textContent === shown)) A.dom.setText(box, message);
            shown = message;
            item.element.classList.toggle("is-invalid", Boolean(message));
            if (message) item.input.setAttribute("aria-invalid", "true");
            else item.input.removeAttribute("aria-invalid");
        }
        item.input.addEventListener("keydown", function (event) { if (event.key === "Enter") paint(); });
        item.input.addEventListener("change", paint);
        return function check() {
            message = ownValid() ? test() || "" : "";
            paint();
        };
    }

    // A field used only in one mode: see js/research/compute.js, section 3
    function onlyWhen(item, isShown) {
        const ownValid = item.valid;
        const ownDisplay = item.display;
        item.valid = function () { return !isShown() || ownValid(); };
        item.display = function () { return isShown() ? ownDisplay() : t("research.quant.unused"); };
        return function apply() { A.dom.setHidden(item.element, !isShown()); };
    }

    /* =========================================================
       4. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(ctx);
        const num = kit.num;

        function w(value, digits) {
            return num(value, { digits: digits || 5, grouping: false });
        }
        function db(value) {
            return num(value, { fixed: 2 });
        }
        function share(value) {
            return num(Math.abs(value), { percent: true, digits: 3 });
        }
        function bytesText(bytes) {
            const r = bytesIn(bytes);
            return num(r.value) + " " + t("research.quant.byte." + r.unit);
        }

        const panel = K.panel(stage, { questionKey: "research.quant.question", titleKey: "research.quant.title", onChange: refresh });
        const source = panel.choice({
            name: "source", labelKey: "research.quant.source", value: "normal",
            options: [{ value: "normal", labelKey: "research.quant.source.normal" }, { value: "pasted", labelKey: "research.quant.source.pasted" }]
        });
        const isNormal = function () { return source.value() === "normal"; };
        const isPasted = function () { return source.value() === "pasted"; };
        const sigmaField = panel.field({ name: "sigma", labelKey: "research.quant.sigma", kind: "number", min: 0, minOpen: true, max: 1e6, value: 1, hintKey: "research.quant.sigmaHint" });
        const list = panel.list({
            name: "weights", labelKey: "research.quant.weights", minCount: 2, min: -1e6, max: 1e6,
            value: [0.021, -0.013, 0.004, 0.035, -0.027, 0.009, -0.002, 0.018, -0.041, 0.012, 0.007, -0.019, 0.026, -0.008, 0.015, -0.033]
        });
        panel.field({ name: "bits", labelKey: "research.quant.bits", kind: "int", min: 2, max: 16, value: 8 });
        panel.field({ name: "c", labelKey: "research.quant.c", kind: "number", min: 0, minOpen: true, max: 20, value: 4, unitKey: "research.quant.unit.sigma", hintKey: "research.quant.cHint" });
        const seedField = panel.field({ name: "seed", labelKey: "research.quant.seed", kind: "int", min: 0, max: 4294967295, value: 1 });
        panel.field({ name: "count", labelKey: "research.quant.count", kind: "number", min: 1, max: 1e15, value: 1e9, powers: true, hintKey: "research.quant.countHint" });
        const modes = [onlyWhen(sigmaField, isNormal), onlyWhen(list, isPasted), onlyWhen(seedField, isNormal)];
        const rules = [crossRule(list, function () {
            if (!isPasted()) return "";
            const values = list.values();
            return values && !(estimate(values).sigma > 0) ? t("research.quant.errEqual") : "";
        })];

        panel.heading("research.quant.modelHead");
        const out = {
            estimate: panel.result({ name: "estimate", labelKey: "research.quant.estimate", digits: 5 }),
            levels: panel.result({ name: "levels", labelKey: "research.quant.levels", kind: "int" }),
            step: panel.result({ name: "step", labelKey: "research.quant.step", digits: 5 }),
            rounding: panel.result({ name: "rounding", labelKey: "research.quant.rounding", digits: 5 }),
            clipping: panel.result({ name: "clipping", labelKey: "research.quant.clipping", digits: 4 }),
            mse: panel.result({ name: "mse", labelKey: "research.quant.mse", digits: 5 }),
            mseAbs: panel.result({ name: "mseAbs", labelKey: "research.quant.mseAbs", digits: 5 }),
            sqnr: panel.result({ name: "sqnr", labelKey: "research.quant.sqnr", unitKey: "research.quant.unit.db" }),
            exact: panel.result({ name: "exact", labelKey: "research.quant.exact", digits: 5, hintKey: "research.quant.exactHint" })
        };
        panel.heading("research.quant.bestHead");
        out.bestC = panel.result({ name: "bestC", labelKey: "research.quant.bestC", digits: 4, unitKey: "research.quant.unit.sigma" });
        out.bestSqnr = panel.result({ name: "bestSqnr", labelKey: "research.quant.bestSqnr", unitKey: "research.quant.unit.db" });
        out.gain = panel.result({ name: "gain", labelKey: "research.quant.gain", unitKey: "research.quant.unit.db" });
        panel.heading("research.quant.simHead");
        out.simMse = panel.result({ name: "simMse", labelKey: "research.quant.simMse", digits: 5 });
        out.simSe = panel.result({ name: "simSe", labelKey: "research.quant.simSe", digits: 2, hintKey: "research.quant.simSeHint" });
        out.simSqnr = panel.result({ name: "simSqnr", labelKey: "research.quant.simSqnr", unitKey: "research.quant.unit.db" });
        out.clipped = panel.result({ name: "clipped", labelKey: "research.quant.clipped", kind: "int" });
        out.agree = panel.result({ name: "agree", labelKey: "research.quant.agree", kind: "percent", digits: 3 });
        const job = panel.job();
        panel.heading("research.quant.sizeHead");
        let sizeUnit = "B";
        out.size = panel.result({ name: "size", labelKey: "research.quant.size", unitKey: function () { return t("research.quant.byte." + sizeUnit); } });
        const chart = panel.chart({
            labelKey: "research.quant.chart",
            height: 280,
            x: { labelKey: "research.quant.axisBits", step: 1 },
            y: { labelKey: "research.quant.axisDb" }
        }, "below");
        panel.remark({ key: "research.quant.remark" });
        panel.formula({ key: "research.quant.formula" });
        panel.source({ nameKey: "research.quant.source.name", units: UNITS });

        let current = null;          // what the verdict needs: { v, sigma, r, top, gain, exact }

        function verdict(measuredOff) {
            if (!current) return;
            const c = current;
            const pasted = isPasted();
            const modelOff = pasted ? NaN : (c.r.mse - c.exact) / c.exact;
            const parts = verdictParts(c.v.bits, c.gain, modelOff, measuredOff, pasted);
            const said = {
                b: String(c.v.bits), c: num(c.v.c, { digits: 12 }), loss: num(c.r.mse, { percent: true }), sqnr: db(c.r.sqnr),
                best: num(c.top.c, { digits: 4 }), gain: db(c.gain), off: share(modelOff), exact: num(c.exact), rel: share(measuredOff)
            };
            let text = t("research.quant.verdict", said);
            text += " " + t(parts.gain === "far" ? "research.quant.verdictFar" : "research.quant.verdictNear", said);
            if (parts.model === "off") text += " " + t("research.quant.verdictModelOff", said);
            if (parts.model === "fine") text += " " + t("research.quant.verdictModelFine", said);
            if (parts.model === "rough") text += " " + t("research.quant.verdictRough", said);
            if (parts.differ) text += " " + t("research.quant.verdictDifferPasted", said);
            panel.verdict.set(text, parts.gain === "far" || parts.model === "off" ? "warn" : "good");
        }

        function refresh() {
            modes.forEach(function (apply) { apply(); });
            rules.forEach(function (check) { check(); });
            job.quiet();
            const v = panel.values();
            if (!v) {
                current = null;
                return;
            }
            const pasted = isPasted();
            const guess = pasted ? estimate(v.weights) : null;
            const sigma = pasted ? guess.sigma : v.sigma;
            const r = model(v.bits, v.c);
            const exact = pasted ? NaN : exactMse(v.bits, v.c);
            const top = best(v.bits);
            const gain = top.sqnr - r.sqnr;
            const words = {
                b: String(v.bits), c: w(v.c, 12), Q: String(r.Q), L: String(2 * r.Q + 1), step: w(r.step), stepAbs: w(r.step * sigma),
                sigma: w(sigma), inside: w(r.inside, 6), rounding: w(r.rounding), clipping: w(r.clipping, 5), mse: w(r.mse), mseAbs: w(r.mse * sigma * sigma),
                sqnr: w(r.sqnr, 6), best: w(top.c, 6), bestSqnr: w(top.sqnr, 6), gain: w(gain, 4),
                exact: w(exact, 6), off: w((r.mse - exact) / exact * 100, 3)
            };
            out.estimate.hidden(!pasted);
            if (pasted) out.estimate.set(sigma, { formula: t("research.quant.estimateWork", { n: String(v.weights.length), mean: w(guess.mean), sigma: w(sigma) }) });
            else out.estimate.clear();
            out.levels.set(2 * r.Q + 1, { formula: t("research.quant.levelsWork", words) });
            out.step.set(r.step * sigma, { formula: t("research.quant.stepWork", words) });
            out.rounding.set(r.rounding, { formula: t("research.quant.roundingWork", words) });
            out.clipping.set(r.clipping, { formula: t("research.quant.clippingWork", words) });
            out.mse.set(r.mse, { formula: t("research.quant.mseWork", words) });
            out.mseAbs.set(r.mse * sigma * sigma, { formula: t("research.quant.mseAbsWork", words) });
            out.sqnr.set(r.sqnr, { formula: t("research.quant.sqnrWork", words) });
            out.exact.hidden(pasted);
            if (pasted) out.exact.clear();
            else out.exact.set(exact, { formula: t("research.quant.exactWork", words), tone: Math.abs(r.mse - exact) > MODEL_OFF * exact ? "warn" : "" });
            out.bestC.set(top.c, { formula: t("research.quant.bestCWork", words) });
            out.bestSqnr.set(top.sqnr, { formula: t("research.quant.bestSqnrWork", words) });
            out.gain.set(gain, { formula: t("research.quant.gainWork", words), tone: gain >= FAR_DB ? "warn" : "good" });
            const bytes = bytesFor(v.count, v.bits);
            sizeUnit = bytesIn(bytes).unit;
            out.size.set(bytesIn(bytes).value, { formula: t("research.quant.sizeWork", { N: num(v.count, { digits: 12, grouping: false }), b: String(v.bits), bytes: w(bytes, 12), shown: bytesText(bytes) }) });
            current = { v: v, sigma: sigma, r: r, top: top, gain: gain, exact: exact };
            verdict(NaN);
            drawChart(v, r);

            // The measurement, in slices
            ["simMse", "simSe", "simSqnr", "clipped", "agree"].forEach(function (name) { out[name].clear(); });
            const settings = pasted ? { bits: v.bits, c: v.c, sigma: sigma, values: v.weights } : { bits: v.bits, c: v.c, sigma: sigma, count: RUNS, seed: v.seed };
            const work = measurement(settings);
            job.start(work, {
                chunk: 4000,
                onDone: function () {
                    const m = work.result();
                    const rel = m.mse / (sigma * sigma);
                    const se = m.se / (sigma * sigma);
                    const relative = (r.mse - rel) / rel;
                    const said = {
                        n: String(m.n), seed: settings.seed === undefined ? "" : String(settings.seed), mse: w(rel), se: w(se, 3), sqnr: w(-10 * Math.log10(rel), 6),
                        model: w(r.mse), rel: w(relative * 100, 3), k: String(m.clipped), expected: w(m.n * clippedShare(v.bits, v.c), 4), c: w(v.c, 12)
                    };
                    // No error at all (pasted weights that all lie on levels): the SQNR is infinite,
                    // which the row cannot show as a number, so it stays empty and the MSE row says why
                    out.simMse.set(rel, { formula: rel > 0 ? t(pasted ? "research.quant.simMseWorkPasted" : "research.quant.simMseWork", said) : t("research.quant.simZero") });
                    out.simSe.set(se, { formula: t("research.quant.simSeWork", said) });
                    if (rel > 0) out.simSqnr.set(-10 * Math.log10(rel), { formula: t("research.quant.simSqnrWork", said) });
                    else out.simSqnr.clear();
                    out.clipped.set(m.clipped, { formula: t(pasted ? "research.quant.clippedWorkPasted" : "research.quant.clippedWork", said) });
                    if (rel > 0) out.agree.set(relative, { formula: t("research.quant.agreeWork", said) });
                    else out.agree.clear();
                    verdict(rel > 0 ? relative : NaN);
                }
            });
        }

        function drawChart(v, r) {
            const data = curve(v.c);
            const top = best(v.bits);
            const reference = [[B_LOW, top.sqnr + DB_PER_BIT * (B_LOW - v.bits)], [B_HIGH, top.sqnr + DB_PER_BIT * (B_HIGH - v.bits)]];
            chart.set({
                x: { labelKey: "research.quant.axisBits", step: 1, min: B_LOW, max: B_HIGH },
                y: { labelKey: "research.quant.axisDb" },
                series: [
                    { kind: "line", data: data.optimal, colorIndex: 1, labelKey: "research.quant.series.best", width: 2.5 },
                    { kind: "line", data: data.chosen, colorIndex: 0, points: true, label: function () { return t("research.quant.series.chosen", { c: num(v.c, { digits: 12 }) }); } },
                    { kind: "line", data: reference, color: "muted", dash: true, labelKey: "research.quant.series.rule", width: 1.25 }
                ],
                marks: [{ x: v.bits, y: r.sqnr, colorIndex: 0, label: function () { return t("research.quant.mark", { b: String(v.bits), sqnr: db(r.sqnr) }); } }],
                describe: function () {
                    return t("research.quant.describe", {
                        c: num(v.c, { digits: 12 }), low: db(data.chosen[0][1]), high: db(data.chosen[data.chosen.length - 1][1]),
                        bestLow: db(data.optimal[0][1]), bestHigh: db(data.optimal[data.optimal.length - 1][1]), b: String(v.bits), sqnr: db(r.sqnr)
                    });
                }
            });
        }

        refresh();
        return K.controller(refresh);
    }

    A.research.define("quant", { create: create, maths: maths });
})();
