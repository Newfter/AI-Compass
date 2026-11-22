/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "descent2": DOUBLE DESCENT
   Linear regression with weak features (the solvable model behind unit t4):
   x has D independent standard normal coordinates, y = x·β + noise of variance
   σ², every coordinate of β has the same weight and ‖β‖² = 1. The learner sees
   n examples and uses the first p coordinates: least squares for p ≤ n, the
   interpolating solution of smallest norm for p > n, ridge with λ > 0.
     theory      the expected test error, exact for this model (Belkin, Hsu and
                 Xu, 2020), infinite at p = n − 1, n, n + 1
     simulation  fresh training sets, each fit's exact test error, the median
                 of the runs with the band from the first to the third quartile
   The results are those of units r4 and t4 (S/r9/theory/TOPICS.md).
   Texts: js/content/research/descent2.js. The functions of section 1 and 2 are
   pure and are given to the tests as spec.maths (dev/tests/research.descent2.math.js).
    1. The theory (pure)
    2. The simulation (pure, seeded, in pieces for K.job)
    3. The verdicts (pure)
    4. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["r4", "t4"];
    const FEW_DIGITS = 1e-10;            // a solve whose smallest pivot share is below this gives no point
    const GRID_STEPS = 30;               // the grid: D·i/30, and every p within 8 of n
    const NEAR = 8;

    /* =========================================================
       1. THE THEORY (pure functions: spec.maths)
       ========================================================= */
    // The expected test error with the first p of D coordinates, n examples, noise σ²
    // (b = p/D is the share of the signal inside the used coordinates):
    //   p ≤ n − 2:  (1 − b + σ²)·(1 + p/(n − p − 1))
    //   p ≥ n + 2:  b·(1 − n/p) + (1 − b + σ²)·(1 + n/(p − n − 1))
    //   infinite for p = n − 1, n, n + 1
    function theory(p, D, n, s2) {
        const b = p / D;
        const rest = 1 - b + s2;
        if (p <= n - 2) return rest * (1 + p / (n - p - 1));
        if (p >= n + 2) return b * (1 - n / p) + rest * (1 + n / (p - n - 1));
        return Infinity;
    }

    // The best p left of the peak (1 ≤ p ≤ min(n − 2, D)) -> { p, value } or null
    function bestLeft(D, n, s2) {
        let best = null;
        for (let p = 1; p <= Math.min(n - 2, D); p++) {
            const value = theory(p, D, n, s2);
            if (!best || value < best.value) best = { p: p, value: value };
        }
        return best;
    }

    // The p of the simulation: 1, 2, 3, D·i/30 and every p within 8 of n (and `extra`), rising
    function grid(D, n, extra) {
        const set = new Set([1, 2, 3]);
        for (let i = 1; i <= GRID_STEPS; i++) set.add(Math.max(1, Math.round(D * i / GRID_STEPS)));
        for (let p = n - NEAR; p <= n + NEAR; p++) set.add(p);
        if (extra !== undefined) set.add(extra);
        return Array.from(set).filter(function (p) { return Number.isInteger(p) && p >= 1 && p <= D; }).sort(function (x, y) { return x - y; });
    }

    // The q-quantile of a rising list (linear between neighbours, as R's type 7)
    function quantile(sorted, q) {
        if (!sorted.length) return NaN;
        const h = (sorted.length - 1) * q;
        const lo = Math.floor(h);
        return lo + 1 < sorted.length ? sorted[lo] + (h - lo) * (sorted[lo + 1] - sorted[lo]) : sorted[lo];
    }

    function summary(values) {
        const sorted = values.slice().sort(function (x, y) { return x - y; });
        let sum = 0;
        sorted.forEach(function (value) { sum += value; });
        return {
            count: sorted.length,
            median: quantile(sorted, 0.5), q1: quantile(sorted, 0.25), q3: quantile(sorted, 0.75),
            mean: sorted.length ? sum / sorted.length : NaN
        };
    }

    /* =========================================================
       2. THE SIMULATION (pure: seeded, in pieces)
       ========================================================= */
    // The two forms of the fit, both through M.solveSpd (Cholesky); null when the system is
    // numerically singular (never a wrong β̂):
    //   by the features (p ≤ n):  (X_pᵀX_p + λI)·β̂ = X_pᵀy, with G = XᵀX and Xᵀy given
    //   by the examples (p > n):  (X_p·X_pᵀ + λI)·α = y, β̂ = X_pᵀα, with K = X_p·X_pᵀ given
    function solveFeatures(G, Xty, p, lambda) {
        const block = [];
        for (let i = 0; i < p; i++) {
            const row = G[i].slice(0, p);
            row[i] += lambda;
            block.push(row);
        }
        const out = A.researchMath.solveSpd(block, Xty.slice(0, p));
        return out.ok && out.minPivot >= FEW_DIGITS ? out.x : null;
    }

    function solveExamples(K, y, X, D, p, lambda) {
        const n = y.length;
        const block = [];
        for (let i = 0; i < n; i++) {
            const row = K[i].slice();
            row[i] += lambda;
            block.push(row);
        }
        const out = A.researchMath.solveSpd(block, y.slice());
        if (!(out.ok && out.minPivot >= FEW_DIGITS)) return null;
        const beta = new Array(p).fill(0);
        for (let i = 0; i < n; i++) {
            const a = out.x[i];
            const base = i * D;
            for (let j = 0; j < p; j++) beta[j] += X[base + j] * a;
        }
        return beta;
    }

    // One fit from scratch (X: n·D numbers row by row): the tests compare the two forms with it
    function fit(X, y, D, p, lambda, form) {
        const n = y.length;
        if (form === "features") {
            const G = [];
            const Xty = new Array(p).fill(0);
            for (let a = 0; a < p; a++) G.push(new Array(p).fill(0));
            for (let i = 0; i < n; i++) {
                const base = i * D;
                for (let a = 0; a < p; a++) {
                    const xa = X[base + a];
                    Xty[a] += xa * y[i];
                    for (let b = 0; b < p; b++) G[a][b] += xa * X[base + b];
                }
            }
            return solveFeatures(G, Xty, p, lambda);
        }
        const K = [];
        for (let i = 0; i < n; i++) {
            K.push(new Array(n).fill(0));
            for (let k = 0; k < n; k++) {
                let sum = 0;
                for (let j = 0; j < p; j++) sum += X[i * D + j] * X[k * D + j];
                K[i][k] = sum;
            }
        }
        return solveExamples(K, y, X, D, p, lambda);
    }

    // The exact test error of β̂ on the first p coordinates: ‖β̂ − β_p‖² + (1 − p/D) + σ²
    function testError(betaHat, D, s2) {
        const weight = 1 / Math.sqrt(D);
        let sum = 0;
        betaHat.forEach(function (value) { sum += (value - weight) * (value - weight); });
        return sum + (1 - betaHat.length / D) + s2;
    }

    // settings { D, n, s2, lambda, runs, seed, ps }. A piece is one training set or one p of it.
    // result() -> { ps, plain: [summary + missing], ridge: [...] or null, missing }
    function simulate(settings) {
        const D = settings.D;
        const n = settings.n;
        const s2 = settings.s2;
        const lambda = settings.lambda;
        const ps = settings.ps;
        const runs = settings.runs;
        const rand = A.researchMath.rng(settings.seed);
        const weight = 1 / Math.sqrt(D);
        const sigma = Math.sqrt(s2);
        const small = ps.filter(function (p) { return p <= n; });
        const m = small.length ? small[small.length - 1] : 0;
        const plain = ps.map(function () { return []; });
        const ridge = lambda > 0 ? ps.map(function () { return []; }) : null;
        const missing = ps.map(function () { return 0; });
        let run = 0;
        let index = -1;                 // −1: the next piece makes a training set
        let X = null;
        let y = null;
        let G = null;
        let Xty = null;
        let K = null;
        let columns = 0;                // columns already added to K

        function newSet() {
            X = new Float64Array(n * D);
            y = new Array(n);
            for (let i = 0; i < n; i++) {
                let sum = 0;
                const base = i * D;
                for (let j = 0; j < D; j++) {
                    const value = rand.normal();
                    X[base + j] = value;
                    sum += value;
                }
                y[i] = sum * weight + sigma * rand.normal();
            }
            G = [];
            Xty = new Array(m).fill(0);
            for (let a = 0; a < m; a++) G.push(new Array(m).fill(0));
            for (let i = 0; i < n; i++) {
                const base = i * D;
                for (let a = 0; a < m; a++) {
                    const xa = X[base + a];
                    Xty[a] += xa * y[i];
                    const row = G[a];
                    for (let b = 0; b <= a; b++) row[b] += xa * X[base + b];
                }
            }
            for (let a = 0; a < m; a++) for (let b = 0; b < a; b++) G[b][a] = G[a][b];
            K = [];
            for (let i = 0; i < n; i++) K.push(new Array(n).fill(0));
            columns = 0;
        }

        function addColumns(p) {
            for (; columns < p; columns++) {
                const j = columns;
                for (let i = 0; i < n; i++) {
                    const xi = X[i * D + j];
                    const row = K[i];
                    for (let k = 0; k <= i; k++) row[k] += xi * X[k * D + j];
                }
            }
            for (let i = 0; i < n; i++) for (let k = 0; k < i; k++) K[k][i] = K[i][k];
        }

        function onePoint(i) {
            const p = ps[i];
            let plainBeta;
            let ridgeBeta = null;
            if (p <= n) {
                plainBeta = solveFeatures(G, Xty, p, 0);
                if (ridge) ridgeBeta = solveFeatures(G, Xty, p, lambda);
            } else {
                addColumns(p);
                plainBeta = solveExamples(K, y, X, D, p, 0);
                if (ridge) ridgeBeta = solveExamples(K, y, X, D, p, lambda);
            }
            if (plainBeta) plain[i].push(testError(plainBeta, D, s2));
            else missing[i] += 1;
            if (ridge && ridgeBeta) ridge[i].push(testError(ridgeBeta, D, s2));
        }

        const pieces = runs * (ps.length + 1);
        return {
            step: function (chunk) {
                let budget = Math.max(1, chunk);
                while (budget > 0 && run < runs) {
                    if (index < 0) newSet();
                    else onePoint(index);
                    index += 1;
                    if (index >= ps.length) {
                        index = -1;
                        run += 1;
                    }
                    budget -= 1;
                }
                return run >= runs;
            },
            progress: function () { return (run * (ps.length + 1) + index + 1) / pieces; },
            result: function () {
                let total = 0;
                missing.forEach(function (count) { total += count; });
                return {
                    ps: ps.slice(),
                    plain: plain.map(function (values, i) { return Object.assign(summary(values), { p: ps[i], missing: missing[i] }); }),
                    ridge: ridge ? ridge.map(function (values, i) { return Object.assign(summary(values), { p: ps[i] }); }) : null,
                    missing: total
                };
            }
        };
    }

    // Runs a simulation to its end at once (the tests, and nothing on the page)
    function runAll(work) {
        while (!work.step(1000)) { /* on */ }
        return work.result();
    }

    /* =========================================================
       3. THE VERDICTS (pure: which sentences)
       ========================================================= */
    // From the theory: the error at p = D against predicting 0 (1 + σ²) and against the best
    // point left of the peak; then, when the peak lies within 1 … D, why it is there
    function verdict(D, n, s2) {
        const zero = 1 + s2;
        const best = bestLeft(D, n, s2);
        const atD = theory(D, D, n, s2);
        const keys = [];
        let tone = "info";
        if (D <= n - 2) {
            keys.push(best.value < zero ? "research.descent2.verdictUnder" : "research.descent2.verdictUnderZero");
        } else if (!isFinite(atD)) {
            keys.push("research.descent2.verdictOnPeak");
            tone = "warn";
        } else if (atD < best.value && atD < zero) {
            keys.push("research.descent2.verdictLargest");
            tone = "good";
        } else if (best.value <= atD && best.value < zero) {
            keys.push("research.descent2.verdictLeft");
        } else {
            keys.push("research.descent2.verdictZero");
        }
        if (D >= n - 1) keys.push("research.descent2.verdictPeak");
        return { keys: keys, tone: tone, zero: zero, best: best, atD: atD };
    }

    // Observed near the peak: is the mean far above the median?
    function verdictMean(mean, median) {
        return mean > 2 * median ? "research.descent2.verdictMeanFar" : "research.descent2.verdictMeanNear";
    }

    // Observed: what the ridge did to the median at the peak
    function verdictRidge(plainMedian, ridgeMedian) {
        if (ridgeMedian < 0.9 * plainMedian) return "research.descent2.verdictRidgeLower";
        if (ridgeMedian > 1.1 * plainMedian) return "research.descent2.verdictRidgeHigher";
        return "research.descent2.verdictRidgeSame";
    }

    const maths = {
        theory: theory, bestLeft: bestLeft, grid: grid, quantile: quantile, summary: summary,
        solveFeatures: solveFeatures, solveExamples: solveExamples, fit: fit, testError: testError,
        simulate: simulate, runAll: runAll, verdict: verdict, verdictMean: verdictMean, verdictRidge: verdictRidge,
        FEW_DIGITS: FEW_DIGITS
    };

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
        function exactly(value) {
            return num(value, { digits: 12, grouping: false });
        }
        function noText() {
            return "";
        }

        const panel = K.panel(stage, { questionKey: "research.descent2.question", titleKey: "research.descent2.title", onChange: refresh });
        const fD = panel.field({ name: "D", labelKey: "research.descent2.D", kind: "int", min: 20, max: 200, value: 100, hintKey: "research.descent2.DHint" });
        panel.field({ name: "n", labelKey: "research.descent2.n", kind: "int", min: 10, max: 100, value: 40 });
        panel.field({ name: "s2", labelKey: "research.descent2.s2", kind: "number", min: 0, max: 100, value: 0.25 });
        const fP = panel.field({ name: "p", labelKey: "research.descent2.p", kind: "int", min: 1, max: 100, value: 60, hintKey: "research.descent2.pHint" });
        panel.field({ name: "lambda", labelKey: "research.descent2.lambda", kind: "number", min: 0, max: 1e6, value: 0, hintKey: "research.descent2.lambdaHint" });
        panel.field({ name: "runs", labelKey: "research.descent2.runs", kind: "int", min: 10, max: 100, value: 40 });
        panel.field({ name: "seed", labelKey: "research.descent2.seed", kind: "int", min: 0, max: 1e9, value: 1, hintKey: "research.descent2.seedHint" });

        panel.heading("research.descent2.theoryHead");
        const rowZero = panel.result({ name: "zero", labelKey: "research.descent2.zero", digits: 5 });
        const rowAtD = panel.result({ name: "atD", labelKey: "research.descent2.atD", kind: "text" });
        const rowBestP = panel.result({ name: "bestP", labelKey: "research.descent2.bestP", kind: "int" });
        const rowBest = panel.result({ name: "best", labelKey: "research.descent2.best", digits: 5 });
        const rowAtP = panel.result({ name: "atP", labelKey: "research.descent2.atP", kind: "text" });
        panel.heading("research.descent2.simHead");
        const rowMedian = panel.result({ name: "median", labelKey: "research.descent2.median", digits: 5 });
        const rowMean = panel.result({ name: "mean", labelKey: "research.descent2.mean", digits: 5 });
        const rowRidge = panel.result({ name: "ridge", labelKey: "research.descent2.ridge", digits: 5 });
        const job = panel.job();
        const chart = panel.chart({
            labelKey: "research.descent2.chart", height: 300,
            x: { labelKey: "research.descent2.axisP" }, y: { log: true, labelKey: "research.descent2.axisError" }
        }, "below");
        const note = K.remark(panel.below, { key: noText, tone: "info" });
        note.hidden(true);
        panel.formula({ key: "research.descent2.formula" });
        panel.source({ nameKey: "research.descent2.source", units: UNITS });
        let lastSim = "";
        let theoryText = "";
        let done = null;                 // the finished simulation: { v, ps, sim }

        // A text row with its number (or "infinite") on data-value
        function putTheory(row, value, formula) {
            if (isFinite(value)) row.set(num(value, 5), { formula: formula });
            else row.set(t("research.descent2.infinite"), { formula: formula, tone: "bad" });
            row.element.setAttribute("data-value", String(value));
        }

        function theoryCurve(D, n, s2) {
            const out = [];
            for (let p = 1; p <= D; p++) {
                const value = theory(p, D, n, s2);
                out.push([p, isFinite(value) ? value : null]);
            }
            return out;
        }

        function draw(v, sim) {
            const D = v.D;
            const n = v.n;
            const s2 = v.s2;
            const series = [{ kind: "line", data: theoryCurve(D, n, s2), colorIndex: 1, labelKey: "research.descent2.seriesTheory" }];
            if (sim) {
                const points = sim.plain.filter(function (row) { return row.count > 0 && row.median > 0; });
                series.unshift({
                    kind: "line", colorIndex: 0, labelKey: "research.descent2.seriesMedian",
                    data: points.map(function (row) { return [row.p, row.median]; }),
                    band: points.map(function (row) { return [row.p, row.q1, row.q3]; })
                });
                if (sim.ridge) {
                    series.push({
                        kind: "line", colorIndex: 2, dash: true, labelKey: "research.descent2.seriesRidge",
                        data: sim.ridge.filter(function (row) { return row.count > 0; }).map(function (row) { return [row.p, row.median]; })
                    });
                }
            }
            chart.set({
                x: { labelKey: "research.descent2.axisP", min: 0, max: D },
                y: { log: true, labelKey: "research.descent2.axisError" },
                series: series,
                hlines: [{ y: 1 + s2, label: function () { return t("research.descent2.lineZero", { v: num(1 + s2, 5) }); } }],
                // on a narrow chart the line's name is short, so that it stays inside
                marks: n <= D ? [{ x: n, label: function () { return t(chart.element.clientWidth >= 480 ? "research.descent2.markN" : "research.descent2.markNShort", { n: num(n) }); } }] : [],
                describe: function () {
                    const best = bestLeft(D, n, s2);
                    // p = n is on the chart only when n ≤ D; otherwise no model has p = n and "infinite at p = n" is not said
                    const key = n <= D ? (sim ? "research.descent2.describeSim" : "research.descent2.describe")
                        : (sim ? "research.descent2.describeSimUnder" : "research.descent2.describeUnder");
                    return t(key, {
                        D: num(D), n: num(n), zero: num(1 + s2, 5), atD: isFinite(theory(D, D, n, s2)) ? num(theory(D, D, n, s2), 5) : t("research.descent2.infinite"),
                        bestP: num(best.p), best: num(best.value, 5), runs: sim ? num(v.runs) : ""
                    });
                }
            });
        }

        function refresh() {
            const dNow = fD.value();
            if (!isNaN(dNow)) fP.setLimits({ max: Math.max(1, dNow) });
            const v = panel.values();
            if (!v) {
                job.quiet();
                note.hidden(true);
                lastSim = "";
                done = null;
                return;
            }
            const D = v.D;
            const n = v.n;
            const s2 = v.s2;
            const p = v.p;
            const lambda = v.lambda;
            const zero = 1 + s2;
            const said = verdict(D, n, s2);
            const best = said.best;
            const words = { D: String(D), n: String(n), s2: exactly(s2), zero: w(zero), p: String(p), bestP: String(best.p), best: w(best.value), last: String(Math.min(n - 2, D)) };
            rowZero.set(zero, { formula: t("research.descent2.zeroWork", words) });
            putTheory(rowAtD, said.atD, t(formKey(D, n), Object.assign({}, words, workWords(D, D, n, s2))));
            rowBestP.set(best.p, { formula: t("research.descent2.bestPWork", words) });
            rowBest.set(best.value, { formula: t(formKey(best.p, n), Object.assign({}, words, workWords(best.p, D, n, s2))) });
            putTheory(rowAtP, theory(p, D, n, s2), t(formKey(p, n), Object.assign({}, words, workWords(p, D, n, s2))));
            const values = {
                D: num(D), n: num(n), atD: isFinite(said.atD) ? num(said.atD, 4) : "", zero: num(zero, 4),
                bestP: num(best.p), best: num(best.value, 4)
            };
            theoryText = said.keys.map(function (key) { return t(key, values); }).join(" ");
            panel.verdict.set(theoryText, said.tone);

            const key = [D, n, s2, p, lambda, v.runs, v.seed].join(" ");
            if (key === lastSim && !job.running()) {
                if (done) paintSim(done, said.tone);          // a language switch: the sentences again
                return;
            }
            lastSim = key;
            done = null;
            rowMedian.clear();
            rowMean.clear();
            rowRidge.clear();
            rowRidge.hidden(!(lambda > 0));
            draw(v, null);
            const ps = grid(D, n, p);
            const work = simulate({ D: D, n: n, s2: s2, lambda: lambda, runs: v.runs, seed: v.seed, ps: ps });
            note.set(function () { return t("research.descent2.simRunning"); }, "info");
            note.hidden(false);
            job.start(work, {
                chunk: 1,
                onStop: function () {
                    lastSim = "";
                    note.set(function () { return t("research.descent2.simStopped"); }, "info");
                },
                onDone: function () {
                    done = { v: v, ps: ps, sim: work.result() };
                    draw(v, done.sim);
                    paintSim(done, said.tone);
                }
            });
        }

        // The simulation's rows, its sentences in the verdict and its note (again after a language switch)
        function paintSim(state, tone) {
            const v = state.v;
            const ps = state.ps;
            const sim = state.sim;
            const n = v.n;
            const p = v.p;
            const at = sim.plain[ps.indexOf(p)];
            if (at.count) {
                rowMedian.set(at.median, { formula: t("research.descent2.medianWork", { p: String(p), count: String(at.count), q1: w(at.q1), q3: w(at.q3) }) });
                rowMean.set(at.mean, { formula: t("research.descent2.meanWork", { p: String(p), count: String(at.count) }) });
            } else {
                rowMedian.clear();
                rowMean.clear();
            }
            const ridgeAt = sim.ridge ? sim.ridge[ps.indexOf(p)] : null;
            if (ridgeAt && ridgeAt.count) rowRidge.set(ridgeAt.median, { formula: t("research.descent2.ridgeWork", { p: String(p), lambda: exactly(v.lambda) }) });
            else rowRidge.clear();
            // near the peak, at p = n: the mean against the median, and what the ridge did there
            const sentences = [];
            const peak = n <= v.D ? sim.plain[ps.indexOf(n)] : null;
            if (peak && peak.count) {
                sentences.push(t(verdictMean(peak.mean, peak.median), { n: num(n), mean: num(peak.mean, 3), median: num(peak.median, 3) }));
                const ridgePeak = sim.ridge ? sim.ridge[ps.indexOf(n)] : null;
                if (ridgePeak && ridgePeak.count) {
                    sentences.push(t(verdictRidge(peak.median, ridgePeak.median), { n: num(n), lambda: num(v.lambda, { digits: 12 }), plain: num(peak.median, 3), ridge: num(ridgePeak.median, 3) }));
                }
            }
            if (sentences.length) panel.verdict.set(theoryText + " " + sentences.join(" "), tone);
            const noteValues = { runs: num(v.runs), n: num(n), count: num(ps.length), seed: String(v.seed), missing: num(sim.missing) };
            note.set(function () {
                return t("research.descent2.simNote", noteValues) + (sim.missing ? " " + t("research.descent2.simMissing", noteValues) : "");
            }, "info");
        }

        function formKey(p, n) {
            if (p <= n - 2) return "research.descent2.workUnder";
            if (p >= n + 2) return "research.descent2.workOver";
            return "research.descent2.workPeak";
        }

        function workWords(p, D, n, s2) {
            const b = p / D;
            return { at: String(p), b: w(b, 6), rest: w(1 - b + s2, 6), value: isFinite(theory(p, D, n, s2)) ? w(theory(p, D, n, s2)) : "" };
        }

        refresh();
        return K.controller(refresh);
    }

    A.research.define("descent2", { create: create, maths: maths });
})();
