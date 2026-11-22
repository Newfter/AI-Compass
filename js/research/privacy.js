/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "privacy": PRIVACY BUDGET AND CERTIFIED RADIUS
   Six small calculators in one tool (tabs inside the tool, K.parts):
     a. What ε means       e^ε, and what a 50% guess can become
     b. Laplace            ε-DP noise for a count, a mean or any sensitivity
     c. Gaussian           (ε, δ)-DP noise: the classical formula (proved for ε < 1)
                           and the exact smallest σ (Balle and Wang, every ε > 0)
     d. Composition        k uses: basic against advanced composition
     e. Randomised response ε of the coin, the estimate and its standard error,
                           and what privacy costs in people
     f. Certified radius   randomised smoothing: R = σ·Φ⁻¹(p_A), with p_B, and
                           from k of n votes with a Clopper–Pearson bound
   The results are those of unit t11 (S/r9/theory/TOPICS.md, t11).
   Texts: js/content/research/privacy.js. Style: css/research/privacy.css (the
   greyed classical σ). The functions of section 1 are pure and are given to the
   tests as spec.maths (dev/tests/research.privacy.math.js).
    1. The numbers (pure)
    2. The verdicts (pure)
    3. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["t11"];

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       ========================================================= */
    // (a) e^ε bounds how far any observer's odds can move; a prior of ½ ends at most at e^ε/(1 + e^ε)
    function meaning(eps) {
        return { factor: Math.exp(eps), inverse: Math.exp(-eps), posterior: 1 / (1 + Math.exp(-eps)) };
    }

    // (b) The sensitivity of the common cases: a count changes by 1 when one person
    // joins or leaves; a mean of n values in [0, 1] by at most 1/n
    function sensitivity(kind, n, own) {
        if (kind === "count") return 1;
        if (kind === "mean") return 1 / n;
        return own;
    }

    // Laplace noise of scale b = Δ/ε: standard deviation b·√2; P(|noise| > b·ln 20) = 1/20
    function laplace(delta, eps) {
        const b = delta / eps;
        return { b: b, sd: b * Math.SQRT2, e95: b * Math.log(20) };
    }

    // (c) The classical Gaussian mechanism (Dwork and Roth, theorem A.1): proved for 0 < ε < 1
    function gaussClassical(delta, eps, d) {
        return delta * Math.sqrt(2 * Math.log(1.25 / d)) / eps;
    }

    // The exact δ of the Gaussian mechanism with noise σ = s·Δ (Balle and Wang, 2018, theorem 8):
    //   δ(s) = Φ(1/(2s) − ε·s) − e^ε·Φ(−1/(2s) − ε·s), falling in s
    function gaussDelta(s, eps) {
        const M = A.researchMath;
        const a = 1 / (2 * s) - eps * s;
        const b = -1 / (2 * s) - eps * s;
        return M.normalCdf(a) - Math.exp(eps) * M.normalCdf(b);
    }

    // The smallest σ with δ(σ) ≤ δ: halving on a logarithmic scale
    function gaussExact(delta, eps, d) {
        const M = A.researchMath;
        const f = function (s) { return gaussDelta(s, eps) - d; };
        let hi = 1;
        while (f(hi) > 0 && hi < 1e15) hi *= 4;
        let lo = Math.min(1, hi / 4);
        while (f(lo) <= 0 && lo > 1e-15) lo /= 4;
        return delta * M.bisect(f, lo, hi, { log: true });
    }

    // enough: the classical σ is not below the exact one, so that much noise does give (ε, δ).
    // Where the formula is proved (ε < 1) that is always so; for a large ε it is not (ε = 10,
    // δ = 10⁻⁵: classical 0.484 against the exact 0.500), and the page must then say so.
    function gauss(delta, eps, d) {
        const classical = gaussClassical(delta, eps, d);
        const exact = gaussExact(delta, eps, d);
        return { classical: classical, proved: eps < 1, exact: exact, enough: classical >= exact, saving: 1 - exact / classical };
    }

    // (d) k uses of an (ε, δ)-DP mechanism. Basic: (k·ε, k·δ). Advanced (Dwork, Rothblum
    // and Vadhan): for any δ' > 0, (ε·√(2k·ln(1/δ')) + k·ε·(e^ε − 1), k·δ + δ')
    function compose(eps, d, k, dPrime) {
        const advanced = eps * Math.sqrt(2 * k * Math.log(1 / dPrime)) + k * eps * Math.expm1(eps);
        return {
            basic: { eps: k * eps, delta: k * d },
            advanced: { eps: advanced, delta: k * d + dPrime },
            better: advanced < k * eps ? "advanced" : "basic"
        };
    }

    // (e) Randomised response: the truth with probability p, else the opposite
    function rrEps(p) {
        return Math.log(p) - Math.log1p(-p);
    }

    function rrP(eps) {
        return 1 / (1 + Math.exp(-eps));
    }

    // From the observed share q of "yes" among n answers
    function rrEstimate(p, q, n) {
        const scale = 2 * p - 1;
        const pi = (q - (1 - p)) / scale;
        const clipped = Math.min(1, Math.max(0, pi));
        const se = Math.sqrt(q * (1 - q) / n) / scale;
        const seDirect = Math.sqrt(clipped * (1 - clipped) / n);
        return {
            pi: pi, clipped: clipped, outside: pi < 0 || pi > 1,
            se: se, seDirect: seDirect,
            ratio: seDirect > 0 ? (se / seDirect) * (se / seDirect) : null
        };
    }

    // (f) Randomised smoothing (Cohen, Rosenfeld and Kolter, 2019, theorem 1)
    //   R = σ·Φ⁻¹(p_A) when p_A > ½ (null: abstain); with a bound p_B on the runner-up,
    //   R = (σ/2)·(Φ⁻¹(p_A) − Φ⁻¹(p_B)) when p_A > p_B
    function radius(sigma, pA) {
        return pA > 0.5 ? sigma * A.researchMath.normalInv(pA) : null;
    }

    function radiusAB(sigma, pA, pB) {
        const M = A.researchMath;
        return pA > pB ? sigma / 2 * (M.normalInv(pA) - M.normalInv(pB)) : null;
    }

    // The one-sided Clopper–Pearson lower bound on p_A at confidence 1 − α:
    // the α-quantile of Beta(k, n − k + 1); 0 when k = 0
    function lowerBound(k, n, alpha) {
        return k === 0 ? 0 : A.researchMath.betaInv(alpha, k, n - k + 1);
    }

    /* =========================================================
       2. THE VERDICTS (pure: which sentence)
       ========================================================= */
    function verdictMeaning(eps) {
        return eps === 0 ? { key: "research.privacy.a.verdictZero", tone: "good" } : { key: "research.privacy.a.verdict", tone: "info" };
    }

    // proved (ε < 1); not proved but still enough noise (above the exact σ); not proved and too little
    function verdictGauss(g) {
        if (g.proved) return { key: "research.privacy.c.verdict", tone: "info" };
        return g.enough ? { key: "research.privacy.c.verdictUnproved", tone: "info" } : { key: "research.privacy.c.verdictUnprovedShort", tone: "warn" };
    }

    // A total δ of 1 or more promises nothing (every mechanism is (ε, 1)-private), so such a bound
    // is never the one to use: both void, or only the advanced one (k·δ + δ′ ≥ 1)
    function verdictCompose(c) {
        if (c.basic.delta >= 1) return { key: "research.privacy.d.verdictVoid", tone: "bad" };
        if (c.better === "advanced" && c.advanced.delta >= 1) return { key: "research.privacy.d.verdictAdvancedVoid", tone: "info" };
        return c.better === "advanced" ? { key: "research.privacy.d.verdictAdvanced", tone: "good" } : { key: "research.privacy.d.verdictBasic", tone: "info" };
    }

    // outside 0–1 (taken as 0 or 1), exactly 0 or 1 (no spread when asked directly: no ratio), or ordinary
    function verdictRr(e) {
        if (e.outside) return { key: "research.privacy.e.verdictOutside", tone: "warn" };
        if (e.ratio === null) return { key: "research.privacy.e.verdictEdge", tone: "warn" };
        return { key: "research.privacy.e.verdict", tone: "info" };
    }

    // r: the radius from the entered p_A; rSamples: from the votes (null: abstain)
    function verdictRadius(r, rSamples) {
        if (r === null) return rSamples === null ? { key: "research.privacy.f.verdictNeither", tone: "bad" } : { key: "research.privacy.f.verdictSamplesOnly", tone: "warn" };
        if (rSamples === null) return { key: "research.privacy.f.verdictAbstain", tone: "warn" };
        return { key: "research.privacy.f.verdict", tone: "good" };
    }

    const maths = {
        meaning: meaning, sensitivity: sensitivity, laplace: laplace,
        gaussClassical: gaussClassical, gaussDelta: gaussDelta, gaussExact: gaussExact, gauss: gauss,
        compose: compose, rrEps: rrEps, rrP: rrP, rrEstimate: rrEstimate,
        radius: radius, radiusAB: radiusAB, lowerBound: lowerBound,
        verdictMeaning: verdictMeaning, verdictGauss: verdictGauss, verdictCompose: verdictCompose, verdictRr: verdictRr, verdictRadius: verdictRadius
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
        function noText() {
            return "";
        }
        // A result row that may hold a word in place of a number ("abstain", "infinite");
        // the exact value stays on the row in data-value
        function wordRow(panel, name, labelKey, hintKey) {
            const row = panel.result({ name: name, labelKey: labelKey, kind: "text", hintKey: hintKey });
            const set = row.set;
            row.put = function (value, text, extra) {
                set(text, extra);
                row.element.setAttribute("data-value", String(value));
            };
            return row;
        }

        const parts = K.parts(stage, {
            name: "part",
            labelKey: "research.privacy.parts",
            items: [
                { id: "meaning", labelKey: "research.privacy.part.meaning" },
                { id: "laplace", labelKey: "research.privacy.part.laplace" },
                { id: "gauss", labelKey: "research.privacy.part.gauss" },
                { id: "compose", labelKey: "research.privacy.part.compose" },
                { id: "rr", labelKey: "research.privacy.part.rr" },
                { id: "radius", labelKey: "research.privacy.part.radius" }
            ]
        });

        /* ----- (a) What ε means ----- */
        const a = (function () {
            const panel = K.panel(parts.panels.meaning, { questionKey: "research.privacy.a.question", titleKey: "research.privacy.part.meaning", onChange: refresh });
            panel.field({ name: "a.eps", labelKey: "research.privacy.eps", kind: "number", min: 0, max: 100, value: 1, hintKey: "research.privacy.a.epsHint" });
            const factor = panel.result({ name: "factor", labelKey: "research.privacy.a.factor", digits: 5 });
            const inverse = panel.result({ name: "inverse", labelKey: "research.privacy.a.inverse", digits: 5 });
            const posterior = panel.result({ name: "posterior", labelKey: "research.privacy.a.posterior", kind: "percent", digits: 4, hintKey: "research.privacy.a.posteriorHint" });
            panel.formula({ key: "research.privacy.a.formula" });
            panel.source({ nameKey: "research.privacy.a.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) return;
                const eps = v["a.eps"];
                const r = meaning(eps);
                const words = { eps: exactly(eps), f: w(r.factor), g: w(r.inverse), post: w(r.posterior) };
                factor.set(r.factor, { formula: t("research.privacy.a.factorWork", words) });
                inverse.set(r.inverse, { formula: t("research.privacy.a.inverseWork", words) });
                posterior.set(r.posterior, { formula: t("research.privacy.a.posteriorWork", words) });
                const said = verdictMeaning(eps);
                panel.verdict.set(t(said.key, { eps: num(eps, { digits: 12 }), f: num(r.factor, 5), post: num(r.posterior, { percent: true, digits: 4 }) }), said.tone);
            }
            return { refresh: refresh };
        })();

        /* ----- (b) Laplace ----- */
        const b = (function () {
            const panel = K.panel(parts.panels.laplace, { questionKey: "research.privacy.b.question", titleKey: "research.privacy.part.laplace", onChange: refresh });
            const kind = panel.choice({
                name: "b.kind",
                labelKey: "research.privacy.b.kind",
                value: "count",
                options: [
                    { value: "count", labelKey: "research.privacy.b.kindCount" },
                    { value: "mean", labelKey: "research.privacy.b.kindMean" },
                    { value: "own", labelKey: "research.privacy.b.kindOwn" }
                ]
            });
            const fN = panel.field({ name: "b.n", labelKey: "research.privacy.b.n", kind: "int", min: 1, max: 1e12, value: 1000, powers: true, hintKey: "research.privacy.b.nHint" });
            const fDelta = panel.field({ name: "b.delta", labelKey: "research.privacy.b.delta", kind: "number", min: 0, minOpen: true, max: 1e12, value: 1, hintKey: "research.privacy.b.deltaHint" });
            panel.field({ name: "b.eps", labelKey: "research.privacy.eps", kind: "number", min: 0, minOpen: true, max: 100, value: 0.5 });
            const scale = panel.result({ name: "b", labelKey: "research.privacy.b.b", digits: 5 });
            const sd = panel.result({ name: "sd", labelKey: "research.privacy.b.sd", digits: 5 });
            const e95 = panel.result({ name: "e95", labelKey: "research.privacy.b.e95", digits: 5, hintKey: "research.privacy.b.e95Hint" });
            panel.formula({ key: "research.privacy.b.formula" });
            panel.source({ nameKey: "research.privacy.b.source", units: UNITS });
            let own = fDelta.value();

            // n only for a mean; Δ typed only for "own", else it shows the Δ of the case
            function shape() {
                const now = kind.value();
                A.dom.setHidden(fN.element, now !== "mean");
                if (now !== "mean" && isNaN(fN.value())) fN.set(1000);
                fDelta.input.readOnly = now !== "own";
                if (now === "own") {
                    if (fDelta.input.dataset.shown === "case") fDelta.set(own);
                    fDelta.input.dataset.shown = "own";
                    own = fDelta.value();
                    return;
                }
                fDelta.input.dataset.shown = "case";
                const n = fN.value();
                if (now === "count") fDelta.set(1);
                else if (!isNaN(n)) fDelta.set(1 / n);
            }

            function refresh() {
                shape();
                const v = panel.values();
                if (!v) return;
                const delta = sensitivity(v["b.kind"], v["b.n"], v["b.delta"]);
                const eps = v["b.eps"];
                const r = laplace(delta, eps);
                const words = { delta: w(delta, 6), eps: exactly(eps), b: w(r.b), sd: w(r.sd), e95: w(r.e95), n: String(v["b.n"]) };
                scale.set(r.b, { formula: t("research.privacy.b.bWork", words) });
                sd.set(r.sd, { formula: t("research.privacy.b.sdWork", words) });
                e95.set(r.e95, { formula: t("research.privacy.b.e95Work", words) });
                panel.verdict.set(t("research.privacy.b.verdict." + v["b.kind"], {
                    eps: num(eps, { digits: 12 }), n: num(v["b.n"]), delta: num(delta, 6), b: num(r.b, 5), sd: num(r.sd, 5), e95: num(r.e95, 5)
                }), "info");
            }
            return { refresh: refresh };
        })();

        /* ----- (c) Gaussian ----- */
        const c = (function () {
            const panel = K.panel(parts.panels.gauss, { questionKey: "research.privacy.c.question", titleKey: "research.privacy.part.gauss", onChange: refresh });
            panel.field({ name: "c.delta", labelKey: "research.privacy.c.delta", kind: "number", min: 0, minOpen: true, max: 1e12, value: 1, hintKey: "research.privacy.c.deltaHint" });
            panel.field({ name: "c.eps", labelKey: "research.privacy.eps", kind: "number", min: 0.001, max: 100, value: 0.5 });
            panel.field({ name: "c.d", labelKey: "research.privacy.delta", kind: "number", min: 1e-100, max: 1, maxOpen: true, value: 1e-5, powers: true, hintKey: "research.privacy.deltaHint" });
            const exact = panel.result({ name: "exact", labelKey: "research.privacy.c.exact", digits: 6, hintKey: "research.privacy.c.exactHint" });
            const classical = panel.result({ name: "classical", labelKey: "research.privacy.c.classical", digits: 5, hintKey: "research.privacy.c.classicalHint" });
            const saving = panel.result({ name: "saving", labelKey: "research.privacy.c.saving", kind: "percent", digits: 3 });
            const unproved = panel.remark({ key: noText, tone: "warn" });
            panel.formula({ key: "research.privacy.c.formula" });
            panel.source({ nameKey: "research.privacy.c.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) {
                    unproved.hidden(true);
                    return;
                }
                const delta = v["c.delta"];
                const eps = v["c.eps"];
                const d = v["c.d"];
                const g = gauss(delta, eps, d);
                const words = { delta: exactly(delta), eps: exactly(eps), d: exactly(d), classical: w(g.classical, 6), exact: w(g.exact, 6), check: w(gaussDelta(g.exact / delta, eps), 4) };
                exact.set(g.exact, { formula: t("research.privacy.c.exactWork", words) });
                classical.set(g.classical, { formula: t("research.privacy.c.classicalWork", words) });
                // "smaller by" has a meaning only while the exact σ is the smaller one
                if (g.enough) saving.set(g.saving, { formula: t("research.privacy.c.savingWork", words) });
                else saving.clear();
                // ε ≥ 1: the classical number is shown greyed, as a number with no proof behind it
                classical.element.classList.toggle("rs-privacy-grey", !g.proved);
                saving.element.classList.toggle("rs-privacy-grey", !g.proved);
                if (g.proved) {
                    unproved.hidden(true);
                } else {
                    unproved.set(function () { return t(g.enough ? "research.privacy.c.unproved" : "research.privacy.c.unprovedShort", { eps: num(eps, { digits: 12 }) }); }, "warn");
                    unproved.hidden(false);
                }
                const said = verdictGauss(g);
                panel.verdict.set(t(said.key, {
                    what: delta === 1 ? t("research.privacy.c.whatCount") : t("research.privacy.c.whatOther", { delta: num(delta, { digits: 12 }) }),
                    eps: num(eps, { digits: 12 }), d: num(d, { digits: 12 }), exact: num(g.exact, 3), classical: num(g.classical, 3),
                    saving: num(g.saving, { percent: true, digits: 2 })
                }), said.tone);
            }
            return { refresh: refresh };
        })();

        /* ----- (d) Composition ----- */
        const d = (function () {
            const panel = K.panel(parts.panels.compose, { questionKey: "research.privacy.d.question", titleKey: "research.privacy.part.compose", onChange: refresh });
            panel.field({ name: "d.eps", labelKey: "research.privacy.d.eps", kind: "number", min: 0, minOpen: true, max: 100, value: 0.1 });
            panel.field({ name: "d.d", labelKey: "research.privacy.d.d", kind: "number", min: 0, max: 1, maxOpen: true, value: 0, powers: true, hintKey: "research.privacy.d.dHint" });
            panel.field({ name: "d.k", labelKey: "research.privacy.d.k", kind: "int", min: 1, max: 1e9, value: 100, powers: true });
            panel.field({ name: "d.dp", labelKey: "research.privacy.d.dp", kind: "number", min: 1e-100, max: 1, maxOpen: true, value: 1e-5, powers: true, hintKey: "research.privacy.d.dpHint" });
            const basicEps = panel.result({ name: "basicEps", labelKey: "research.privacy.d.basicEps", digits: 5 });
            const basicDelta = panel.result({ name: "basicDelta", labelKey: "research.privacy.d.basicDelta", digits: 5 });
            const advEps = panel.result({ name: "advEps", labelKey: "research.privacy.d.advEps", digits: 5 });
            const advDelta = panel.result({ name: "advDelta", labelKey: "research.privacy.d.advDelta", digits: 5 });
            panel.formula({ key: "research.privacy.d.formula" });
            panel.source({ nameKey: "research.privacy.d.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) return;
                const eps = v["d.eps"];
                const k = v["d.k"];
                const r = compose(eps, v["d.d"], k, v["d.dp"]);
                const words = {
                    eps: exactly(eps), d: exactly(v["d.d"]), k: String(k), dp: exactly(v["d.dp"]),
                    basic: w(r.basic.eps), basicDelta: w(r.basic.delta), adv: w(r.advanced.eps), advDelta: w(r.advanced.delta),
                    first: w(eps * Math.sqrt(2 * k * Math.log(1 / v["d.dp"]))), second: w(k * eps * Math.expm1(eps))
                };
                const said = verdictCompose(r);
                // the bound to use is marked; a bound whose total δ is 1 or more is never the one
                const advancedWins = said.key === "research.privacy.d.verdictAdvanced";
                const basicWins = said.key === "research.privacy.d.verdictBasic" || said.key === "research.privacy.d.verdictAdvancedVoid";
                // a total δ of 1 or more promises nothing
                const deltaTone = function (value) { return value >= 1 ? "bad" : undefined; };
                basicEps.set(r.basic.eps, { formula: t("research.privacy.d.basicEpsWork", words), tone: basicWins ? "good" : undefined });
                basicDelta.set(r.basic.delta, { formula: t("research.privacy.d.basicDeltaWork", words), tone: deltaTone(r.basic.delta) });
                advEps.set(r.advanced.eps, { formula: t("research.privacy.d.advEpsWork", words), tone: advancedWins ? "good" : undefined });
                advDelta.set(r.advanced.delta, { formula: t("research.privacy.d.advDeltaWork", words), tone: deltaTone(r.advanced.delta) });
                panel.verdict.set(t(said.key, {
                    k: num(k), basic: num(r.basic.eps, 5), adv: num(r.advanced.eps, 5), dp: num(v["d.dp"], { digits: 12 }),
                    times: num(r.basic.eps / r.advanced.eps, 3), delta: num(r.basic.delta, 5), advDelta: num(r.advanced.delta, 5)
                }), said.tone);
            }
            return { refresh: refresh };
        })();

        /* ----- (e) Randomised response ----- */
        const e = (function () {
            const panel = K.panel(parts.panels.rr, { questionKey: "research.privacy.e.question", titleKey: "research.privacy.part.rr", onChange: refresh });
            panel.field({ name: "e.p", labelKey: "research.privacy.e.p", kind: "prob", min: 0.5, minOpen: true, max: 1, value: 0.75, hintKey: "research.privacy.e.pHint" });
            panel.field({ name: "e.q", labelKey: "research.privacy.e.q", kind: "prob", value: 0.4 });
            panel.field({ name: "e.n", labelKey: "research.privacy.e.n", kind: "int", min: 1, max: 1e12, value: 1000, powers: true });
            panel.field({ name: "e.want", labelKey: "research.privacy.e.want", kind: "number", min: 0, max: 700, value: 1, hintKey: "research.privacy.e.wantHint" });
            const epsRow = wordRow(panel, "eps", "research.privacy.e.eps");
            const pFor = panel.result({ name: "pFor", labelKey: "research.privacy.e.pFor", digits: 6 });
            const pi = panel.result({ name: "pi", labelKey: "research.privacy.e.pi", digits: 5 });
            const se = panel.result({ name: "se", labelKey: "research.privacy.e.se", digits: 4 });
            const seDirect = panel.result({ name: "seDirect", labelKey: "research.privacy.e.seDirect", digits: 4, hintKey: "research.privacy.e.seDirectHint" });
            const ratio = panel.result({ name: "ratio", labelKey: "research.privacy.e.ratio", digits: 3, hintKey: "research.privacy.e.ratioHint" });
            const outside = panel.remark({ key: noText, tone: "warn" });
            panel.formula({ key: "research.privacy.e.formula" });
            panel.source({ nameKey: "research.privacy.e.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) {
                    outside.hidden(true);
                    return;
                }
                const p = v["e.p"];
                const q = v["e.q"];
                const n = v["e.n"];
                const eps = rrEps(p);
                const r = rrEstimate(p, q, n);
                const want = rrP(v["e.want"]);
                const words = {
                    p: exactly(p), q: exactly(q), n: String(n), eps: w(eps), want: exactly(v["e.want"]), pFor: w(want, 6),
                    pi: w(r.pi), clipped: w(r.clipped), se: w(r.se, 4), seDirect: w(r.seDirect, 4), ratio: w(r.ratio, 3), scale: w(2 * p - 1, 6)
                };
                if (isFinite(eps)) epsRow.put(eps, num(eps, 5), { formula: t("research.privacy.e.epsWork", words) });
                else epsRow.put(eps, t("research.privacy.infinite"), { formula: t("research.privacy.e.epsInfinite"), tone: "bad" });
                pFor.set(want, { formula: t("research.privacy.e.pForWork", words) });
                pi.set(r.pi, { formula: t("research.privacy.e.piWork", words), tone: r.outside ? "warn" : undefined });
                se.set(r.se, { formula: t("research.privacy.e.seWork", words) });
                seDirect.set(r.seDirect, { formula: t("research.privacy.e.seDirectWork", words) });
                if (r.ratio === null) ratio.clear();
                else ratio.set(r.ratio, { formula: t("research.privacy.e.ratioWork", words) });
                if (r.outside) {
                    outside.set(function () { return t("research.privacy.e.outside", { pi: num(r.pi, 5), clipped: num(r.clipped) }); }, "warn");
                    outside.hidden(false);
                } else {
                    outside.hidden(true);
                }
                const said = verdictRr(r);
                panel.verdict.set(t(said.key, {
                    p: num(p, { digits: 12 }), eps: isFinite(eps) ? num(eps, 4) : t("research.privacy.infinite"), n: num(n), q: num(q, { digits: 12 }),
                    pi: num(r.clipped, 4), se: num(r.se, 3), seDirect: num(r.seDirect, 3), ratio: r.ratio === null ? "" : num(r.ratio, 3)
                }), said.tone);
            }
            return { refresh: refresh };
        })();

        /* ----- (f) Certified radius ----- */
        const f = (function () {
            const panel = K.panel(parts.panels.radius, { questionKey: "research.privacy.f.question", titleKey: "research.privacy.part.radius", onChange: refresh });
            panel.field({ name: "f.sigma", labelKey: "research.privacy.f.sigma", kind: "number", min: 0, minOpen: true, max: 1e6, value: 0.5, hintKey: "research.privacy.f.sigmaHint" });
            const fA = panel.field({ name: "f.pA", labelKey: "research.privacy.f.pA", kind: "prob", min: 0, minOpen: true, max: 1, maxOpen: true, value: 0.8413, hintKey: "research.privacy.f.pAHint" });
            const useB = panel.toggle({ name: "f.useB", labelKey: "research.privacy.f.useB", checked: false, hintKey: "research.privacy.f.useBHint" });
            const fB = panel.field({ name: "f.pB", labelKey: "research.privacy.f.pB", kind: "prob", min: 0, minOpen: true, max: 1, value: 0.1 });
            const fK = panel.field({ name: "f.k", labelKey: "research.privacy.f.k", kind: "int", min: 0, max: 1e9, value: 990 });
            const fN = panel.field({ name: "f.n", labelKey: "research.privacy.f.n", kind: "int", min: 1, max: 1e9, value: 1000, powers: true });
            panel.field({ name: "f.conf", labelKey: "research.privacy.f.conf", kind: "percent", min: 50, max: 100, maxOpen: true, value: 99.9 });
            const rRow = wordRow(panel, "radius", "research.privacy.f.radius");
            panel.heading("research.privacy.f.samplesHead");
            const lower = panel.result({ name: "lower", labelKey: "research.privacy.f.lower", digits: 5, hintKey: "research.privacy.f.lowerHint" });
            const rSamples = wordRow(panel, "radiusSamples", "research.privacy.f.radiusSamples");
            panel.remark({ key: "research.privacy.f.covers", tone: "info" });
            panel.formula({ key: "research.privacy.f.formula" });
            panel.source({ nameKey: "research.privacy.f.source", units: UNITS });

            // p_A + p_B ≤ 1 and k ≤ n (a hair of room for the 12 digits a field keeps)
            function limits() {
                A.dom.setHidden(fB.element, !useB.value());
                // p_B is checked against p_A only while it is used (a hidden box must not block the results)
                const pA = fA.value();
                if (!useB.value()) fB.setLimits({ max: 1 });
                else if (!isNaN(pA)) fB.setLimits({ max: Number((1 - pA).toPrecision(12)) });
                const n = fN.value();
                if (!isNaN(n)) fK.setLimits({ max: n });
            }

            function refresh() {
                limits();
                const v = panel.values();
                if (!v) return;
                const sigma = v["f.sigma"];
                const pA = v["f.pA"];
                const k = v["f.k"];
                const n = v["f.n"];
                const alpha = 1 - v["f.conf"];
                const M = A.researchMath;
                const withB = v["f.useB"];
                const r = withB ? radiusAB(sigma, pA, v["f.pB"]) : radius(sigma, pA);
                const lo = lowerBound(k, n, alpha);
                const rs = radius(sigma, lo);
                const words = {
                    sigma: exactly(sigma), pA: exactly(pA), pB: exactly(v["f.pB"]), zA: w(M.normalInv(pA), 6), zB: w(M.normalInv(v["f.pB"]), 6),
                    r: w(r, 5), k: String(k), n: String(n), alpha: exactly(Number(alpha.toPrecision(12))), lo: w(lo, 6), zLo: w(M.normalInv(lo), 6), rs: w(rs, 5),
                    km: String(n - k + 1)
                };
                const abstain = t("research.privacy.f.abstain");
                if (r === null) rRow.put(0, abstain, { formula: t(withB ? "research.privacy.f.abstainWorkB" : "research.privacy.f.abstainWork", words), tone: "bad" });
                else rRow.put(r, num(r, 4), { formula: t(withB ? "research.privacy.f.radiusWorkB" : "research.privacy.f.radiusWork", words), tone: "good" });
                lower.set(lo, { formula: t(k === 0 ? "research.privacy.f.lowerZero" : "research.privacy.f.lowerWork", words) });
                if (rs === null) rSamples.put(0, abstain, { formula: t("research.privacy.f.abstainSamples", words), tone: "warn" });
                else rSamples.put(rs, num(rs, 4), { formula: t("research.privacy.f.radiusSamplesWork", words), tone: "good" });
                const said = verdictRadius(r, rs);
                panel.verdict.set(t(said.key, {
                    r: r === null ? "" : num(r, 4), rs: rs === null ? "" : num(rs, 4), k: num(k), n: num(n), lo: num(lo, 5),
                    conf: num(1 - alpha, { percent: true, digits: 12 })
                }), said.tone);
            }
            return { refresh: refresh };
        })();

        function refresh() {
            a.refresh();
            b.refresh();
            c.refresh();
            d.refresh();
            e.refresh();
            f.refresh();
        }
        refresh();
        return K.controller(refresh);
    }

    A.research.define("privacy", { create: create, maths: maths });
})();
