/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "rates": CONVERGENCE RATES
   Two parts (tabs inside the tool, K.parts):
     a. Rates     for the constants L, μ, D, the starting gap and a target ε:
                  the guarantees of gradient descent (step 1/L), of the best
                  fixed step 2/(L + μ), of Nesterov's accelerated method, and
                  the lower bounds that no gradient method can beat; each as a
                  bound after k steps and as the steps it needs for ε. A chart
                  of the gap against k with two real runs on one example
                  function (a seeded quadratic in 50 dimensions).
     b. Noise     stochastic gradient descent with a constant step on
                  (λ/2)·x²: when it is stable and the noise floor it settles at.
   The formulas are those of the sheet of unit t2 (Nesterov's textbook,
   "Lectures on convex optimization", theorems 2.1.7, 2.1.13, 2.1.14,
   2.1.15 and 2.2.3, and Su, Boyd and Candès 2016 for the convex momentum).
   Texts: js/content/research/rates.js. The functions of section 1 are pure
   and are given to the tests as spec.maths (dev/tests/research.rates.math.js).
    1. The numbers (pure)
    2. The example function: two real runs (pure)
    3. The verdicts (pure)
    4. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["t2", "r3"];
    const DIM = 50;                  // dimensions of the example quadratic
    const LOW_SPREAD = 1000;         // μ = 0: its curvatures go down to L/1000
    const CHART_MIN = 20;            // steps on the chart, at least
    const CHART_MAX = 3000;          // ... and at most
    const CHART_POINTS = 400;        // points per curve, at most
    const FLOOR = 0.01;              // the chart goes down to ε·FLOOR

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       r = √(μ/L) is used in place of κ = L/μ wherever it can, so that a tiny μ
       (κ beyond what a computer can store) still gives right answers.
       ========================================================= */
    // The smallest whole k ≥ 0 for which ok(k) holds, starting from x, the formula's value.
    // ok is the condition itself, so a rounding error in x cannot move the answer.
    // Beyond 9·10¹⁵ whole numbers are not exact: x rounded up.
    function smallestWhole(x, ok) {
        if (isNaN(x)) return NaN;
        if (!isFinite(x)) return x > 0 ? Infinity : 0;
        let n = Math.max(0, Math.ceil(x));
        if (n >= 9e15) return n;
        for (let i = 0; i < 8 && n > 0 && ok(n - 1); i++) n -= 1;
        for (let i = 0; i < 8 && !ok(n); i++) n += 1;
        return n;
    }

    // The smallest whole k ≥ 0 with C·f^k ≤ ε, where lnF = ln f (−∞ for f = 0, 0 for f = 1)
    //   -> { exact: the real k from the logarithms, n }
    function geometricSteps(C, lnF, eps) {
        const lnC = Math.log(C);
        const lnE = Math.log(eps);
        if (lnC <= lnE) return { exact: 0, n: 0 };
        if (lnF === -Infinity) return { exact: 0, n: 1 };
        if (!(lnF < 0)) return { exact: Infinity, n: Infinity };
        const exact = (lnE - lnC) / lnF;
        const ok = function (k) { return k === 0 ? lnC <= lnE : lnC + k * lnF <= lnE; };
        return { exact: exact, n: smallestWhole(exact, ok) };
    }

    // ln of C·f^k (with 0^0 = 1), so that a bound far below 10⁻³⁰⁰ keeps its digits
    function lnGeometric(C, lnF, k) {
        return k === 0 ? Math.log(C) : Math.log(C) + k * lnF;
    }

    // Everything at once. L, mu (0 = convex only), D, gap (f(x₀) − f*), eps, k (steps for "after k")
    //   -> { kappa, already, convex: {...}, strong: {...} or null }
    //   ln… values are natural logarithms of the bounds (the tool writes tiny ones as powers of ten)
    function rates(L, mu, D, gap, eps, k) {
        const LD2 = L * D * D;
        const k1 = k + 1;
        const convex = {
            gd: LD2 / (2 * k),
            gdSteps: { exact: LD2 / (2 * eps), n: smallestWhole(LD2 / (2 * eps), function (n) { return n >= 1 && LD2 / (2 * n) <= eps; }) },
            nest: 2 * LD2 / (k1 * k1),
            nestSteps: (function () {
                const exact = Math.sqrt(2 * LD2 / eps) - 1;
                return { exact: exact, n: smallestWhole(exact, function (n) { return 2 * LD2 / ((n + 1) * (n + 1)) <= eps; }) };
            })(),
            lower: 3 * LD2 / (32 * k1 * k1),
            lowerSteps: (function () {
                const exact = Math.sqrt(3 * LD2 / (32 * eps)) - 1;
                return { exact: exact, n: smallestWhole(exact, function (n) { return 3 * LD2 / (32 * (n + 1) * (n + 1)) <= eps; }) };
            })()
        };
        const out = { kappa: mu > 0 ? L / mu : Infinity, already: gap <= eps, convex: convex, strong: null };
        if (mu > 0) {
            const ratio = mu / L;
            const r = Math.sqrt(ratio);
            const lnGd = Math.log1p(-ratio);                       // ln(1 − μ/L)
            const lnNest = Math.log1p(-r);                         // ln(1 − √(μ/L))
            const lnQ2 = 2 * Math.log1p(-2 * r / (1 + r));         // ln q², q = (√κ − 1)/(√κ + 1) = (1 − r)/(1 + r)
            const half = mu * D * D / 2;                           // (μ/2)·D²
            out.strong = {
                gdFactor: 1 - ratio,
                lnGd: lnGeometric(gap, lnGd, k),
                gdSteps: geometricSteps(gap, lnGd, eps),
                approx: (1 / ratio) * Math.log(gap / eps),
                best: (1 - ratio) / (1 + ratio),                   // (κ − 1)/(κ + 1)
                nestFactor: 1 - r,
                half: half,
                lnNest: lnGeometric(gap + half, lnNest, k),
                nestRateSteps: geometricSteps(gap, lnNest, eps),
                nestSteps: geometricSteps(gap + half, lnNest, eps),
                nestTwoSteps: geometricSteps(2 * gap, lnNest, eps),
                q: (1 - r) / (1 + r),
                q2: Math.exp(lnQ2),
                lnLower: lnGeometric(half, lnQ2, k),
                lowerSteps: geometricSteps(half, lnQ2, eps)
            };
        }
        return out;
    }

    // (b) SGD with a constant step η on (λ/2)·x², gradient noise of variance σ²
    //   -> { product: η·λ, stable, flip, factor: 1 − ηλ, variance, loss }  (variance and loss Infinity when unstable)
    //   flip: η·λ = 2 exactly and no noise. Then x⁺ = −x: x neither settles nor grows, so the
    //   words "grows without bound" would be false there (the page says what happens instead)
    function sgd(lambda, eta, noise) {
        const product = eta * lambda;
        const stable = product > 0 && product < 2;
        const variance = stable ? eta * noise / (lambda * (2 - product)) : Infinity;
        return {
            product: product, stable: stable, flip: product === 2 && noise === 0, factor: 1 - product,
            variance: variance, loss: stable ? lambda / 2 * variance : Infinity
        };
    }

    /* =========================================================
       2. THE EXAMPLE FUNCTION: TWO REAL RUNS (pure)
       f(x) = ½·Σ λ_i·x_i² in its own axes (a rotation changes nothing for these
       methods), 50 curvatures spread evenly on a log scale between μ and L
       (L/1000 and L when μ = 0). The start has length D in a seeded random
       direction; when μ > 0 and its gap is above the entered one, the direction
       is tilted towards the flattest axis until the gap is exactly the entered
       one, so that every bound drawn holds for the runs.
       ========================================================= */
    function curvatures(L, mu) {
        const low = mu > 0 ? mu : L / LOW_SPREAD;
        const out = [];
        for (let i = 0; i < DIM; i++) out.push(Math.exp(Math.log(low) + (Math.log(L) - Math.log(low)) * i / (DIM - 1)));
        out[0] = low;
        out[DIM - 1] = L;
        return out;
    }

    function startPoint(L, mu, D, gap, seed) {
        const M = A.researchMath;
        const lambdas = curvatures(L, mu);
        const random = M.rng(seed);
        let u = lambdas.map(function () { return random.normal(); });
        const unit = function (v) {
            const length = Math.sqrt(v.reduce(function (s, x) { return s + x * x; }, 0));
            return v.map(function (x) { return x / length; });
        };
        u = unit(u);
        const rayleigh = function (v) { return v.reduce(function (s, x, i) { return s + lambdas[i] * x * x; }, 0); };
        const target = 2 * gap / (D * D);
        if (mu > 0 && rayleigh(u) > target) {
            // Mix the direction (without its flattest part) with the flattest axis:
            // R(θ) = cos²θ·R' + sin²θ·μ, so cos²θ = (target − μ)/(R' − μ)
            const rest = u.slice();
            rest[0] = 0;
            const w = unit(rest);
            const big = rayleigh(w);
            const share = big > lambdas[0] ? Math.max(0, Math.min(1, (target - lambdas[0]) / (big - lambdas[0]))) : 0;
            u = w.map(function (x) { return x * Math.sqrt(share); });
            u[0] = Math.sqrt(1 - share);
        }
        const x0 = u.map(function (x) { return D * x; });
        return { lambdas: lambdas, x0: x0, gap: 0.5 * rayleigh(x0) };
    }

    // The gaps f(x_k) − f* for k = 0..steps of plain gradient descent (step 1/L) and of
    // Nesterov's method (y_k = x_k + β_k·(x_k − x_{k−1}), x_{k+1} = y_k − ∇f(y_k)/L, x_{−1} = x₀;
    // β = (√κ − 1)/(√κ + 1) when μ > 0, β_k = (k − 1)/(k + 2) when μ = 0)
    function runs(L, mu, D, gap, seed, steps) {
        const start = startPoint(L, mu, D, gap, seed);
        const lambdas = start.lambdas;
        const n = lambdas.length;
        const value = function (x) { let s = 0; for (let i = 0; i < n; i++) s += lambdas[i] * x[i] * x[i]; return 0.5 * s; };
        const r = Math.sqrt(mu / L);
        const constant = mu > 0 ? (1 - r) / (1 + r) : 0;
        const gd = [start.gap];
        const nest = [start.gap];
        let x = start.x0.slice();
        for (let k = 1; k <= steps; k++) {
            for (let i = 0; i < n; i++) x[i] -= lambdas[i] * x[i] / L;
            gd.push(value(x));
        }
        let current = start.x0.slice();
        let previous = start.x0.slice();
        const y = new Array(n);
        for (let k = 0; k < steps; k++) {
            const beta = mu > 0 ? constant : (k >= 1 ? (k - 1) / (k + 2) : 0);
            for (let i = 0; i < n; i++) y[i] = current[i] + beta * (current[i] - previous[i]);
            previous = current;
            current = y.map(function (yi, i) { return yi - lambdas[i] * yi / L; });
            nest.push(value(current));
        }
        return { start: start, gd: gd, nest: nest };
    }

    // The number of steps the chart shows: a little more than the upper bounds ask for
    function chartSteps(r) {
        const counts = r.strong ? [r.strong.gdSteps.n, r.strong.nestSteps.n] : [r.convex.gdSteps.n, r.convex.nestSteps.n];
        const most = Math.max.apply(null, counts.map(function (n) { return isFinite(n) ? n : CHART_MAX; }));
        return Math.max(CHART_MIN, Math.min(CHART_MAX, Math.ceil(most * 1.25)));
    }

    /* =========================================================
       3. THE VERDICTS (pure: which sentence, with which numbers)
       ========================================================= */
    // -> { key, tone, values }   values are numbers; the tool writes them
    function verdictRates(r, gap, eps) {
        if (r.already) return { key: "research.rates.verdictAlready", tone: "good", values: { gap: gap, eps: eps } };
        if (r.strong) {
            return {
                key: "research.rates.verdictStrong",
                tone: "info",
                values: { gap: gap, eps: eps, factor: gap / eps, gd: r.strong.gdSteps.n, nest: r.strong.nestSteps.n, lower: r.strong.lowerSteps.n }
            };
        }
        return { key: "research.rates.verdictConvex", tone: "info", values: { eps: eps, gd: r.convex.gdSteps.n, nest: r.convex.nestSteps.n, lower: r.convex.lowerSteps.n } };
    }

    function verdictSgd(s, noise) {
        if (s.flip) return { key: "research.rates.b.verdictFlip", tone: "bad", values: {} };
        if (!s.stable) return { key: "research.rates.b.verdictUnstable", tone: "bad", values: { product: s.product } };
        if (noise === 0) return { key: "research.rates.b.verdictNoNoise", tone: "good", values: {} };
        return { key: "research.rates.b.verdict", tone: "info", values: { variance: s.variance, loss: s.loss } };
    }

    const maths = {
        smallestWhole: smallestWhole, geometricSteps: geometricSteps, rates: rates, sgd: sgd,
        curvatures: curvatures, startPoint: startPoint, runs: runs, chartSteps: chartSteps,
        verdictRates: verdictRates, verdictSgd: verdictSgd
    };

    /* =========================================================
       4. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(ctx);
        const num = kit.num;

        // Numbers inside the worked formulas: 5 significant digits, no thousands groups
        function w(value, digits) {
            return num(value, { digits: digits || 5, grouping: false });
        }
        // A number as typed, with all its digits
        function exactly(value) {
            return num(value, { digits: 12, grouping: false });
        }
        // e^lnValue for people, also far below 10⁻³⁰⁰ (then from its logarithm)
        function fromLn(lnValue, digits) {
            if (lnValue === -Infinity) return num(0);
            if (lnValue > -690) return num(Math.exp(lnValue), { digits: digits || 4 });
            const log10 = lnValue / Math.LN10;
            let power = Math.floor(log10);
            let mantissa = Number(Math.pow(10, log10 - power).toPrecision(digits || 4));
            if (mantissa >= 10) {
                mantissa /= 10;
                power += 1;
            }
            return num(mantissa, { digits: digits || 4 }) + "×10" + kit.superscript(power);
        }
        // A bound row (kind "text"): its text from the logarithm, the exact value on the row
        function setBound(row, lnValue, extra) {
            row.set(fromLn(lnValue, 5), extra);
            if (lnValue > -740) row.element.setAttribute("data-value", String(Math.exp(lnValue)));
            row.element.setAttribute("data-ln", String(lnValue));
        }
        function stepsText(steps) {
            return isFinite(steps) ? String(steps) : "∞";
        }
        // A result row for a number of steps, its unit in the right form ("1 step", «2 шага»)
        function stepsRow(panel, name, labelKey) {
            let last = 0;
            const row = panel.result({
                name: name, labelKey: labelKey, kind: "int",
                unitKey: function () { return A.plural("research.rates.unit.steps", isFinite(last) ? last : 5); }
            });
            const set = row.set;
            row.set = function (value, extra) {
                last = value;
                set(value, extra);
            };
            return row;
        }
        // The worked formula of a step count: the general one, or why it is 0 or 1
        function stepsWork(key, steps, words, strong) {
            if (steps.n === 0) return t("research.rates.zeroSteps");
            if (strong && words.same) return t("research.rates.oneStep", { n: stepsText(steps.n) });
            return t(key, Object.assign({}, words, { exact: w(steps.exact, 7), n: stepsText(steps.n) }));
        }

        const parts = K.parts(stage, {
            name: "part",
            labelKey: "research.rates.parts",
            items: [
                { id: "rates", labelKey: "research.rates.part.rates" },
                { id: "noise", labelKey: "research.rates.part.noise" }
            ]
        });

        /* ----- (a) Rates ----- */
        const a = (function () {
            const panel = K.panel(parts.panels.rates, { questionKey: "research.rates.question", titleKey: "research.rates.part.rates", onChange: refresh });
            const fL = panel.field({ name: "L", labelKey: "research.rates.L", kind: "number", min: 0, minOpen: true, max: 1e15, value: 100, powers: true, hintKey: "research.rates.LHint" });
            const fMu = panel.field({ name: "mu", labelKey: "research.rates.mu", kind: "number", min: 0, value: 1, powers: true, hintKey: "research.rates.muHint" });
            const fD = panel.field({ name: "D", labelKey: "research.rates.D", kind: "number", min: 0, minOpen: true, max: 1e10, value: 1, powers: true, hintKey: "research.rates.DHint" });
            const largest = panel.toggle({ name: "largest", labelKey: "research.rates.largest", checked: true, hintKey: "research.rates.largestHint" });
            const fGap = panel.field({ name: "gap", labelKey: "research.rates.gap", kind: "number", min: 0, minOpen: true, value: 50, powers: true, hintKey: "research.rates.gapHint" });
            panel.field({ name: "eps", labelKey: "research.rates.eps", kind: "number", min: 1e-100, value: 5e-5, powers: true, hintKey: "research.rates.epsHint" });
            panel.field({ name: "k", labelKey: "research.rates.k", kind: "int", min: 1, max: 1e9, value: 100, powers: true, hintKey: "research.rates.kHint" });
            panel.field({ name: "seed", labelKey: "research.rates.seed", kind: "int", min: 0, max: 4294967295, value: 1, hintKey: "research.rates.seedHint" });

            panel.heading("research.rates.convexHead");
            const rows = {
                gd: panel.result({ name: "gdConvex", labelKey: "research.rates.gdConvex", kind: "text" }),
                gdSteps: stepsRow(panel, "gdConvexSteps", "research.rates.gdConvexSteps"),
                nest: panel.result({ name: "nestConvex", labelKey: "research.rates.nestConvex", kind: "text" }),
                nestSteps: stepsRow(panel, "nestConvexSteps", "research.rates.nestConvexSteps"),
                lower: panel.result({ name: "lowerConvex", labelKey: "research.rates.lowerConvex", kind: "text", hintKey: "research.rates.lowerConvexHint" }),
                lowerSteps: stepsRow(panel, "lowerConvexSteps", "research.rates.lowerConvexSteps")
            };
            panel.heading("research.rates.strongHead");
            const strongNote = panel.remark({ key: "research.rates.noStrong" });
            const srows = {
                kappa: panel.result({ name: "kappa", labelKey: "research.rates.kappa" }),
                gd: panel.result({ name: "gdStrong", labelKey: "research.rates.gdStrong", kind: "text" }),
                gdSteps: stepsRow(panel, "gdStrongSteps", "research.rates.gdStrongSteps"),
                approx: panel.result({ name: "approx", labelKey: "research.rates.approx", digits: 6, hintKey: "research.rates.approxHint" }),
                best: panel.result({ name: "best", labelKey: "research.rates.best", hintKey: "research.rates.bestHint" }),
                nest: panel.result({ name: "nestStrong", labelKey: "research.rates.nestStrong", kind: "text" }),
                nestRateSteps: stepsRow(panel, "nestRateSteps", "research.rates.nestRateSteps"),
                nestSteps: stepsRow(panel, "nestStrongSteps", "research.rates.nestStrongSteps"),
                nestTwoSteps: stepsRow(panel, "nestTwoSteps", "research.rates.nestTwoSteps"),
                q2: panel.result({ name: "lowerFactor", labelKey: "research.rates.lowerFactor" }),
                lower: panel.result({ name: "lowerStrong", labelKey: "research.rates.lowerStrong", kind: "text", hintKey: "research.rates.lowerStrongHint" }),
                lowerSteps: stepsRow(panel, "lowerStrongSteps", "research.rates.lowerStrongSteps")
            };
            panel.remark({ key: "research.rates.remark" });
            const chart = panel.chart({
                labelKey: "research.rates.chart",
                height: 320,
                x: { labelKey: "research.rates.axisK" },
                y: { log: true, labelKey: "research.rates.axisGap" }
            }, "below");
            const runNote = K.remark(panel.below, { key: "research.rates.runNote" });
            panel.formula({ key: "research.rates.formula" });
            panel.source({ nameKey: "research.rates.source", units: UNITS });

            // The limits that depend on other inputs: μ ≤ L, and μ·D²/2 ≤ gap ≤ L·D²/2
            // (a hair of room for the 12 digits a field keeps)
            function limits() {
                const L = fL.value();
                if (!isNaN(L)) fMu.setLimits({ max: L });
                const mu = fMu.value();
                const D = fD.value();
                fGap.input.readOnly = largest.value();
                if (isNaN(L) || isNaN(mu) || isNaN(D)) return;
                const top = L * D * D / 2;
                const bottom = mu * D * D / 2;
                if (largest.value()) {
                    fGap.setLimits({ min: 0, minOpen: true, max: undefined });
                    fGap.set(top);
                } else {
                    fGap.setLimits({ min: bottom * (1 - 1e-12), minOpen: mu === 0, max: top * (1 + 1e-12) });
                }
            }

            function refresh() {
                limits();
                const v = panel.values();
                if (!v) {
                    runNote.hidden(true);
                    return;
                }
                const L = v.L;
                const mu = v.mu;
                const D = v.D;
                const top = L * D * D / 2;
                const gap = largest.value() ? top : Math.min(top, Math.max(mu * D * D / 2, v.gap));
                const eps = v.eps;
                const k = v.k;
                const r = rates(L, mu, D, gap, eps, k);
                const words = { L: exactly(L), mu: exactly(mu), D: exactly(D), gap: w(gap), eps: exactly(eps), k: String(k), k1: String(k + 1), same: mu === L };
                const c = r.convex;
                const mark = function (value) { return value <= eps ? "good" : undefined; };
                rows.gd.set(num(c.gd, 5), { formula: t("research.rates.gdConvexWork", Object.assign({}, words, { v: w(c.gd) })), tone: mark(c.gd) });
                rows.gd.element.setAttribute("data-value", String(c.gd));
                rows.gdSteps.set(c.gdSteps.n, { formula: stepsWork("research.rates.gdConvexStepsWork", c.gdSteps, words, false) });
                rows.nest.set(num(c.nest, 5), { formula: t("research.rates.nestConvexWork", Object.assign({}, words, { v: w(c.nest) })), tone: mark(c.nest) });
                rows.nest.element.setAttribute("data-value", String(c.nest));
                rows.nestSteps.set(c.nestSteps.n, { formula: stepsWork("research.rates.nestConvexStepsWork", c.nestSteps, words, false) });
                rows.lower.set(num(c.lower, 5), { formula: t("research.rates.lowerConvexWork", Object.assign({}, words, { v: w(c.lower) })) });
                rows.lower.element.setAttribute("data-value", String(c.lower));
                rows.lowerSteps.set(c.lowerSteps.n, { formula: stepsWork("research.rates.lowerConvexStepsWork", c.lowerSteps, words, false) });

                const s = r.strong;
                strongNote.hidden(Boolean(s));
                Object.keys(srows).forEach(function (name) { srows[name].hidden(!s); });
                if (s) {
                    const sw = Object.assign({}, words, { kappa: w(r.kappa, 6), half: w(s.half), q2: w(s.q2, 6) });
                    srows.kappa.set(r.kappa, { formula: t("research.rates.kappaWork", sw) });
                    setBound(srows.gd, s.lnGd, { formula: t("research.rates.gdStrongWork", Object.assign({}, sw, { v: fromLn(s.lnGd, 5) })), tone: s.lnGd <= Math.log(eps) ? "good" : undefined });
                    srows.gdSteps.set(s.gdSteps.n, { formula: stepsWork("research.rates.gdStrongStepsWork", s.gdSteps, sw, true) });
                    srows.approx.set(Math.max(0, s.approx), { formula: t("research.rates.approxWork", Object.assign({}, sw, { v: w(Math.max(0, s.approx), 6) })) });
                    srows.best.set(s.best, { formula: t("research.rates.bestWork", Object.assign({}, sw, { v: w(s.best, 6) })) });
                    setBound(srows.nest, s.lnNest, { formula: t("research.rates.nestStrongWork", Object.assign({}, sw, { v: fromLn(s.lnNest, 5) })), tone: s.lnNest <= Math.log(eps) ? "good" : undefined });
                    srows.nestRateSteps.set(s.nestRateSteps.n, { formula: stepsWork("research.rates.nestRateStepsWork", s.nestRateSteps, sw, true) });
                    srows.nestSteps.set(s.nestSteps.n, { formula: stepsWork("research.rates.nestStrongStepsWork", s.nestSteps, sw, true) });
                    srows.nestTwoSteps.set(s.nestTwoSteps.n, { formula: stepsWork("research.rates.nestTwoStepsWork", s.nestTwoSteps, sw, true) });
                    srows.q2.set(s.q2, { formula: t("research.rates.lowerFactorWork", Object.assign({}, sw, { q: w(s.q, 6), v: w(s.q2, 6) })) });
                    setBound(srows.lower, s.lnLower, { formula: t("research.rates.lowerStrongWork", Object.assign({}, sw, { q2: w(s.q2, 6), v: fromLn(s.lnLower, 5) })) });
                    srows.lowerSteps.set(s.lowerSteps.n, { formula: stepsWork("research.rates.lowerStrongStepsWork", s.lowerSteps, sw, true) });
                } else {
                    Object.keys(srows).forEach(function (name) { srows[name].clear(); });
                }

                const said = verdictRates(r, gap, eps);
                const values = said.values;
                panel.verdict.set(t(said.key, {
                    gap: num(values.gap), eps: num(values.eps, { digits: 12 }), factor: num(values.factor),
                    gd: num(values.gd), nest: num(values.nest), lower: num(values.lower)
                }), said.tone);

                drawChart(L, mu, D, gap, eps, k, v.seed, r);
            }

            function drawChart(L, mu, D, gap, eps, k, seed, r) {
                const steps = chartSteps(r);
                const run = runs(L, mu, D, gap, seed, steps);
                const every = Math.max(1, Math.ceil(steps / CHART_POINTS));
                const floor = eps * FLOOR;
                const ks = [];
                for (let i = 0; i <= steps; i += every) ks.push(i);
                if (ks[ks.length - 1] !== steps) ks.push(steps);
                const s = r.strong;
                const lnUpperGd = function (i) { return s ? lnGeometric(gap, Math.log1p(-mu / L), i) : Math.log(L * D * D / (2 * i)); };
                const lnUpperNest = function (i) { return s ? lnGeometric(gap + s.half, Math.log1p(-Math.sqrt(mu / L)), i) : Math.log(2 * L * D * D / ((i + 1) * (i + 1))); };
                const lnLower = function (i) { return s ? lnGeometric(s.half, 2 * Math.log1p(-2 * Math.sqrt(mu / L) / (1 + Math.sqrt(mu / L))), i) : Math.log(3 * L * D * D / (32 * (i + 1) * (i + 1))); };
                const curve = function (lnAt, from) {
                    const out = [];
                    for (const i of ks) {
                        if (i < from) continue;
                        const ln = lnAt(i);
                        out.push([i, ln > -740 ? Math.exp(ln) : 0]);
                        if (ln < Math.log(floor)) break;
                    }
                    return out;
                };
                const real = function (list) {
                    const out = [];
                    for (const i of ks) {
                        out.push([i, list[i]]);
                        if (!(list[i] >= floor)) break;
                    }
                    return out;
                };
                const top = Math.max(gap, s ? gap + s.half : 2 * L * D * D / 4);
                const marks = k <= steps ? [{ x: k, label: function () { return t("research.rates.markK", { k: num(k) }); } }] : [];
                chart.set({
                    x: { labelKey: "research.rates.axisK", min: 0, max: steps },
                    y: { log: true, labelKey: "research.rates.axisGap", min: Math.pow(10, Math.floor(Math.log10(floor))), max: Math.pow(10, Math.ceil(Math.log10(top) + 1e-9)) },
                    series: [
                        { kind: "line", data: curve(lnUpperGd, s ? 0 : 1), colorIndex: 0, dash: true, labelKey: s ? "research.rates.series.gdStrong" : "research.rates.series.gdConvex" },
                        { kind: "line", data: curve(lnUpperNest, s ? 0 : 1), colorIndex: 1, dash: true, labelKey: s ? "research.rates.series.nestStrong" : "research.rates.series.nestConvex" },
                        { kind: "line", data: curve(lnLower, 0), color: "danger", dash: true, labelKey: "research.rates.series.lower" },
                        { kind: "line", data: real(run.gd), colorIndex: 0, width: 2.5, labelKey: "research.rates.series.runGd" },
                        { kind: "line", data: real(run.nest), colorIndex: 1, width: 2.5, labelKey: "research.rates.series.runNest" }
                    ],
                    hlines: [{ y: eps, label: function () { return t("research.rates.lineEps", { eps: num(eps, { digits: 12 }) }); } }],
                    marks: marks,
                    describe: function () {
                        return t("research.rates.describe", {
                            steps: num(steps), eps: num(eps, { digits: 12 }),
                            gd: num(run.gd[Math.min(k, steps)]), nest: num(run.nest[Math.min(k, steps)]), k: num(Math.min(k, steps))
                        });
                    }
                });
                runNote.set(function () {
                    return t("research.rates.runNote", { seed: String(seed), dim: String(DIM), gap: num(run.start.gap), steps: num(steps) });
                });
                runNote.hidden(false);
            }
            return { refresh: refresh };
        })();

        /* ----- (b) Noise: SGD with a constant step ----- */
        const b = (function () {
            const panel = K.panel(parts.panels.noise, { questionKey: "research.rates.b.question", titleKey: "research.rates.part.noise", onChange: refresh });
            panel.field({ name: "b.lambda", labelKey: "research.rates.b.lambda", kind: "number", min: 0, minOpen: true, max: 1e12, value: 1, powers: true });
            panel.field({ name: "b.eta", labelKey: "research.rates.b.eta", kind: "number", min: 0, minOpen: true, max: 1e12, value: 0.1, powers: true });
            panel.field({ name: "b.noise", labelKey: "research.rates.b.noise", kind: "number", min: 0, max: 1e12, value: 1, powers: true, hintKey: "research.rates.b.noiseHint" });
            const stable = panel.result({ name: "stable", labelKey: "research.rates.b.stable", kind: "text" });
            const variance = panel.result({ name: "variance", labelKey: "research.rates.b.variance", kind: "text" });
            const loss = panel.result({ name: "loss", labelKey: "research.rates.b.loss", kind: "text" });
            panel.formula({ key: "research.rates.b.formula" });
            panel.source({ nameKey: "research.rates.b.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) return;
                const lambda = v["b.lambda"];
                const eta = v["b.eta"];
                const noise = v["b.noise"];
                const s = sgd(lambda, eta, noise);
                const words = { lambda: exactly(lambda), eta: exactly(eta), noise: exactly(noise), product: w(s.product), limit: w(2 / lambda) };
                stable.set(t(s.stable ? "research.rates.b.yes" : "research.rates.b.no"), { formula: t("research.rates.b.stableWork", words), tone: s.stable ? "good" : "bad" });
                stable.element.setAttribute("data-value", s.stable ? "1" : "0");
                if (s.stable) {
                    variance.set(num(s.variance, 5), { formula: t("research.rates.b.varianceWork", Object.assign({}, words, { v: w(s.variance) })) });
                    variance.element.setAttribute("data-value", String(s.variance));
                    loss.set(num(s.loss, 5), { formula: t("research.rates.b.lossWork", Object.assign({}, words, { variance: w(s.variance), v: w(s.loss) })) });
                    loss.element.setAttribute("data-value", String(s.loss));
                } else if (s.flip) {
                    // η·λ = 2 and no noise: x⁺ = −x, nothing grows and nothing settles
                    variance.set(t("research.rates.b.stays"), { formula: t("research.rates.b.flipWork", words), tone: "bad" });
                    loss.set(t("research.rates.b.stays"), { tone: "bad" });
                } else {
                    variance.set(t("research.rates.b.infinite"), { formula: t("research.rates.b.unstableWork", words), tone: "bad" });
                    loss.set(t("research.rates.b.infinite"), { tone: "bad" });
                }
                const said = verdictSgd(s, noise);
                panel.verdict.set(t(said.key, { product: num(said.values.product), variance: num(said.values.variance), loss: num(said.values.loss) }), said.tone);
            }
            return { refresh: refresh };
        })();

        function refresh() {
            a.refresh();
            b.refresh();
        }
        refresh();
        return K.controller(refresh);
    }

    A.research.define("rates", { create: create, maths: maths });
})();
