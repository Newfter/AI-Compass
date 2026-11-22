/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "ci": ERROR BARS AND SAMPLE SIZE
   Four small calculators in one tool (tabs inside the tool, K.parts):
     a. Interval      an accuracy on n examples -> Wilson's interval (and the
                      exact Clopper–Pearson one, and Wald's for comparison)
     b. Sample size   the n for a wanted half-width
     c. Two models    two accuracies on n examples each (independent samples):
                      SE of the difference, z, p, and the n at which the
                      difference would be significant (and found with 80% power);
                      no "significant" when a model has under 5 right or wrong answers
     d. Paired test   the same examples: McNemar's exact test (and the χ² form)
   Texts: js/content/research/ci.js. The numbers come from js/research/math.js
   (A.researchMath); the four functions below are pure and are given to the
   tests as spec.maths (dev/tests/research.ci.math.js).
   This file is one of the two models for every bench tool: see
   S/r9/research/TOOL-GUIDE.md.
    1. The numbers (pure)
    2. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["b4", "r12"];
    const LEVELS = [0.9, 0.95, 0.99];
    const POWER = 0.8;                   // "found 80% of the time"
    // The z-test of part (c) is a normal approximation. The usual rule of thumb asks for at
    // least 5 right and 5 wrong answers for each model. Below that it calls far too many
    // differences significant (100% against 50% on 4 examples each: p = 0.046, while Fisher's
    // exact test gives 0.43), so the tool does not say "significant" there.
    const SMALL_COUNT = 5;

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       Shares are 0..1 (0.83 for 83%); confidence levels are shares (0.95).
       ========================================================= */
    // The smallest whole n ≥ 1 for which ok(n) holds, starting from x, the formula's value.
    // ok is the condition itself, so a rounding error in x (1286.0000000000002 for an exact
    // 1286) cannot move the answer. Beyond 9·10¹⁵ whole numbers are not exact: x rounded up.
    function smallestWhole(x, ok) {
        if (!isFinite(x)) return x > 0 ? Infinity : 1;
        let n = Math.max(1, Math.ceil(x));
        if (n >= 9e15) return n;
        for (let i = 0; i < 8 && n > 1 && ok(n - 1); i++) n -= 1;
        for (let i = 0; i < 8 && !ok(n); i++) n += 1;
        return n;
    }

    // (a) An accuracy p measured on n examples
    //   -> { z, se, k, whole, wilson: { lo, hi, centre, half }, wald: { lo, hi, half },
    //        exact: { lo, hi } (only when k = p·n is a whole number) or null }
    //   Wald's interval is NOT cut at 0 and 1: that it leaves [0, 1] is the point.
    function accuracyInterval(p, n, level) {
        const M = A.researchMath;
        const wilson = M.wilson(p, n, level);
        if (!wilson) return null;
        const z = wilson.z;
        const se = Math.sqrt(p * (1 - p) / n);
        const k = p * n;
        const nearest = Math.round(k);
        const whole = Math.abs(k - nearest) <= 1e-9 * Math.max(1, k);
        return {
            z: z,
            se: se,
            k: whole ? nearest : k,
            whole: whole,
            wilson: { lo: wilson.lo, hi: wilson.hi, centre: wilson.centre, half: wilson.half },
            wald: { lo: p - z * se, hi: p + z * se, half: z * se },
            exact: whole ? M.clopperPearson(nearest, n, level) : null
        };
    }

    // (b) The n for a half-width h around an expected accuracy p
    //   -> { z, wilson, wilsonExact, wald, waldExact, worst, worstExact }   (the n, and the
    //   formula's value before rounding up; worst: Wilson at p = 0.5, the largest n for any p)
    function sampleSize(p, half, level) {
        const M = A.researchMath;
        const z = M.zFor(level);
        if (!(p >= 0 && p <= 1) || !(half > 0) || isNaN(z)) return null;
        const wilsonValue = function (share) {
            const pq = share * (1 - share);
            const h2 = half * half;
            return z * z * (pq - 2 * h2 + Math.sqrt(pq * pq + h2 * (1 - 4 * pq))) / (2 * h2);
        };
        const waldExact = z * z * p * (1 - p) / (half * half);
        return {
            z: z,
            wilson: M.wilsonN(p, half, level),
            wilsonExact: wilsonValue(p),
            // (math.js waldN rounds the formula up; this asks the half-width itself, like wilsonN)
            wald: smallestWhole(waldExact, function (n) { return z * Math.sqrt(p * (1 - p) / n) <= half; }),
            waldExact: waldExact,
            worst: M.wilsonN(0.5, half, level),
            worstExact: wilsonValue(0.5)
        };
    }

    // (c) Two accuracies on independent samples of n each
    //   -> math.js twoProportions (diff, se, z, p, lo, hi, crit) plus
    //      { spread, zPower, nNeeded, n80, nNeededExact, n80Exact, minCount, small }
    //   nNeeded: the smallest n each at which |d| / SE reaches z_(1−α/2) (just significant);
    //   n80: ... reaches z_(1−α/2) + z_0.8 (the difference is found 80% of the time)
    //   minCount: the smallest of the four counts (right and wrong answers of A and of B);
    //   small: it is below SMALL_COUNT, so the normal approximation cannot be trusted
    //   (1e-9: (1 − 0.9)·50 is 4.999999999999999 on a computer, and that is 5)
    function twoModels(pA, pB, n, level) {
        const M = A.researchMath;
        const r = M.twoProportions(pA, n, pB, n, level);
        if (!r) return null;
        const spread = pA * (1 - pA) + pB * (1 - pB);
        const zPower = M.normalInv(POWER);
        const size = Math.abs(r.diff);
        const d2 = r.diff * r.diff;
        const reaches = function (target) {
            return function (count) { return spread === 0 || size / Math.sqrt(spread / count) >= target; };
        };
        const nNeededExact = d2 > 0 ? r.crit * r.crit * spread / d2 : Infinity;
        const n80Exact = d2 > 0 ? (r.crit + zPower) * (r.crit + zPower) * spread / d2 : Infinity;
        const minCount = Math.min(pA * n, (1 - pA) * n, pB * n, (1 - pB) * n);
        return Object.assign({}, r, {
            minCount: minCount,
            small: minCount < SMALL_COUNT - 1e-9,
            spread: spread,
            zPower: zPower,
            nNeededExact: nNeededExact,
            n80Exact: n80Exact,
            nNeeded: d2 > 0 ? smallestWhole(nNeededExact, reaches(r.crit)) : Infinity,
            n80: d2 > 0 ? smallestWhole(n80Exact, reaches(r.crit + zPower)) : Infinity
        });
    }

    // (d) McNemar: b examples only A gets right, c only B
    //   -> { n, p (exact, two-sided), tail = P(X ≤ min(b, c)), chi2 (continuity-corrected), pChi2 }
    function paired(b, c) {
        const M = A.researchMath;
        const r = M.mcnemar(b, c);
        if (!r) return null;
        const n = b + c;
        if (n === 0) return { n: 0, p: 1, tail: 1, chi2: 0, pChi2: 1 };
        const corrected = Math.max(0, Math.abs(b - c) - 1);
        const chi2 = corrected * corrected / n;
        return { n: n, p: r.p, tail: M.binomCdf(Math.min(b, c), n, 0.5), chi2: chi2, pChi2: M.chi2Sf(chi2, 1) };
    }

    // Significant digits for the two ends of an interval of shares written as percentages:
    // 4 as everywhere on the bench, more when the interval is so narrow that 4 digits would
    // print both ends alike (99.99% on a million examples is [99.9878%, 99.9918%], and
    // "[99.99%, 99.99%]" says nothing). Two digits of the width are kept; at most 12.
    function intervalDigits(lo, hi) {
        const width = Math.abs(hi - lo) * 100;
        const top = Math.max(Math.abs(lo), Math.abs(hi)) * 100;
        if (!(width > 0) || !isFinite(width) || !(top > 0) || !isFinite(top)) return 4;
        return Math.max(4, Math.min(12, Math.floor(Math.log10(top)) - Math.floor(Math.log10(width)) + 2));
    }

    const maths = {
        smallestWhole: smallestWhole, accuracyInterval: accuracyInterval, sampleSize: sampleSize, twoModels: twoModels, paired: paired,
        intervalDigits: intervalDigits
    };

    /* =========================================================
       2. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(ctx);
        const num = kit.num;

        // Numbers in the worked formulas: no thousands groups, so they read like a formula
        function w(value, digits) {
            return num(value, { digits: digits || 5, grouping: false });
        }
        // A share as typed (0.83), with all its digits
        function share(value) {
            return num(value, { digits: 12, grouping: false });
        }
        function pct(value, digits) {
            return num(value, { percent: true, digits: digits || 4 });
        }
        function points(value) {
            return num(value * 100, { digits: 4 });
        }
        function levelText(level) {
            return pct(level);
        }
        function alphaText(level) {
            return pct(Number((1 - level).toFixed(10)));
        }

        function levelChoice(panel, name) {
            return panel.choice({
                name: name,
                labelKey: "research.ci.level",
                value: 0.95,
                options: LEVELS.map(function (level) { return { value: level, labelKey: "research.ci.level." + Math.round(level * 100) }; })
            });
        }

        const parts = K.parts(stage, {
            name: "part",
            labelKey: "research.ci.parts",
            items: [
                { id: "interval", labelKey: "research.ci.part.interval" },
                { id: "size", labelKey: "research.ci.part.size" },
                { id: "two", labelKey: "research.ci.part.two" },
                { id: "paired", labelKey: "research.ci.part.paired" }
            ]
        });

        /* ----- (a) Interval ----- */
        const a = (function () {
            const panel = K.panel(parts.panels.interval, { questionKey: "research.ci.a.question", titleKey: "research.ci.part.interval", onChange: refresh });
            panel.field({ name: "a.acc", labelKey: "research.ci.a.acc", kind: "percent", value: 83, hintKey: "research.ci.a.accHint" });
            panel.field({ name: "a.n", labelKey: "research.ci.a.n", kind: "int", min: 1, value: 500, powers: true, unitKey: "research.ci.unit.examples" });
            levelChoice(panel, "a.level");
            const wilson = panel.result({ name: "wilson", labelKey: "research.ci.a.wilson", kind: "interval", percent: true });
            const half = panel.result({ name: "half", labelKey: "research.ci.a.half", unitKey: "research.ci.unit.points" });
            const k = panel.result({ name: "k", labelKey: "research.ci.a.k", digits: 6 });
            const exact = panel.result({ name: "exact", labelKey: "research.ci.a.exact", kind: "interval", percent: true });
            const wald = panel.result({ name: "wald", labelKey: "research.ci.a.wald", kind: "interval", percent: true });
            const note = panel.remark({ key: "research.ci.a.notWhole", tone: "warn" });
            panel.formula({ key: "research.ci.a.formula" });
            panel.source({ nameKey: "research.ci.a.source", units: UNITS });

            // A whole percentage inside the interval, as far from p as possible ("you cannot
            // tell 83% from 80%"), or null when the interval holds none but p's own
            function other(r, p) {
                const lower = Math.ceil(r.wilson.lo * 100 - 1e-9) / 100;
                const upper = Math.floor(r.wilson.hi * 100 + 1e-9) / 100;
                const candidates = [lower, upper].filter(function (value) {
                    return value >= r.wilson.lo - 1e-12 && value <= r.wilson.hi + 1e-12 && Math.abs(value - p) >= 0.005 - 1e-12;
                });
                if (!candidates.length) return null;
                if (candidates.length === 1) return candidates[0];
                return Math.abs(candidates[0] - p) >= Math.abs(candidates[1] - p) - 1e-9 ? candidates[0] : candidates[1];
            }

            function refresh() {
                const v = panel.values();
                note.hidden(true);
                if (!v) return;
                const p = v["a.acc"];
                const count = v["a.n"];
                const r = accuracyInterval(p, count, v["a.level"]);
                if (!r) return;
                const words = { z: w(r.z, 6), p: share(p), q: share(Number((1 - p).toFixed(12))), n: String(count) };
                // (digits: asked of the kit for a very narrow interval, see intervalDigits. The kit
                // of this round writes every row with its 4 digits; the verdict below has them.)
                const wilsonDigits = intervalDigits(r.wilson.lo, r.wilson.hi);
                wilson.set({ lo: r.wilson.lo, hi: r.wilson.hi }, {
                    formula: t("research.ci.a.wilsonWork", Object.assign({}, words, {
                        centre: w(r.wilson.centre), half: w(r.wilson.half), lo: w(r.wilson.lo), hi: w(r.wilson.hi)
                    })),
                    digits: wilsonDigits
                });
                half.set(r.wilson.half * 100, { formula: t("research.ci.a.halfWork", { half: w(r.wilson.half), points: w(r.wilson.half * 100) }) });
                k.set(r.k, { formula: t("research.ci.a.kWork", { p: share(p), n: String(count), k: num(r.k, { digits: 12, grouping: false }) }) });
                if (r.exact) {
                    const alpha = Number((1 - v["a.level"]).toFixed(10));
                    const low = r.k === 0 ? "0" : "Beta⁻¹(" + w(alpha / 2) + "; " + r.k + ", " + (count - r.k + 1) + ")";
                    const high = r.k === count ? "1" : "Beta⁻¹(" + w(1 - alpha / 2) + "; " + (r.k + 1) + ", " + (count - r.k) + ")";
                    exact.hidden(false);
                    exact.set({ lo: r.exact.lo, hi: r.exact.hi }, {
                        formula: t("research.ci.a.exactWork", { low: low, high: high, lo: w(r.exact.lo), hi: w(r.exact.hi) }),
                        digits: intervalDigits(r.exact.lo, r.exact.hi)
                    });
                } else {
                    exact.clear();
                    exact.hidden(true);
                    note.set(function () { return t("research.ci.a.notWhole", { k: num(r.k, { digits: 8, grouping: false }) }); }, "warn");
                    note.hidden(false);
                }
                const waldOut = r.wald.lo < 0 || r.wald.hi > 1;
                wald.set({ lo: r.wald.lo, hi: r.wald.hi }, {
                    formula: t("research.ci.a.waldWork", Object.assign({}, words, { half: w(r.wald.half), lo: w(r.wald.lo), hi: w(r.wald.hi) })),
                    tone: waldOut ? "warn" : undefined,
                    digits: intervalDigits(r.wald.lo, r.wald.hi)
                });
                if (waldOut && r.exact) {
                    note.set("research.ci.a.waldOut", "info");
                    note.hidden(false);
                }

                // (the measured accuracy with every digit that was typed: 99.999% is not "100%")
                const said = { n: num(count), acc: pct(p, 12), lo: pct(r.wilson.lo, wilsonDigits), hi: pct(r.wilson.hi, wilsonDigits), level: levelText(v["a.level"]) };
                if (p === 1) {
                    panel.verdict.set(t("research.ci.a.verdictAll", Object.assign(said, { err: pct(1 - r.wilson.lo) })), "warn");
                } else if (p === 0) {
                    panel.verdict.set(t("research.ci.a.verdictNone", said), "warn");
                } else {
                    const value = other(r, p);
                    if (value === null) panel.verdict.set(t("research.ci.a.verdictTight", Object.assign(said, { points: points(r.wilson.half) })), "good");
                    else panel.verdict.set(t("research.ci.a.verdict", Object.assign(said, { other: pct(value) })), r.wilson.half <= 0.01 ? "good" : "info");
                }
            }
            return { refresh: refresh };
        })();

        /* ----- (b) Sample size ----- */
        const b = (function () {
            const panel = K.panel(parts.panels.size, { questionKey: "research.ci.b.question", titleKey: "research.ci.part.size", onChange: refresh });
            panel.field({ name: "b.acc", labelKey: "research.ci.b.acc", kind: "percent", value: 83, hintKey: "research.ci.b.accHint" });
            panel.field({ name: "b.half", labelKey: "research.ci.b.half", kind: "number", min: 0, minOpen: true, max: 50, value: 2, unitKey: "research.ci.unit.points", hintKey: "research.ci.b.halfHint" });
            levelChoice(panel, "b.level");
            const wilson = panel.result({ name: "n", labelKey: "research.ci.b.wilson", kind: "int", unitKey: "research.ci.unit.examples" });
            const wald = panel.result({ name: "wald", labelKey: "research.ci.b.wald", kind: "int", unitKey: "research.ci.unit.examples" });
            const worst = panel.result({ name: "worst", labelKey: "research.ci.b.worst", kind: "int", unitKey: "research.ci.unit.examples" });
            panel.remark({ key: "research.ci.b.remark" });
            panel.formula({ key: "research.ci.b.formula" });
            panel.source({ nameKey: "research.ci.b.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) return;
                const p = v["b.acc"];
                const h = v["b.half"] / 100;
                const r = sampleSize(p, h, v["b.level"]);
                if (!r) return;
                const pq = p * (1 - p);
                const words = { z: w(r.z, 6), h: share(h), p: share(p), q: share(Number((1 - p).toFixed(12))), pq: w(pq, 6) };
                wilson.set(r.wilson, { formula: t("research.ci.b.wilsonWork", Object.assign({}, words, { exact: w(r.wilsonExact, 6), n: String(r.wilson) })) });
                wald.set(r.wald, { formula: t("research.ci.b.waldWork", Object.assign({}, words, { exact: w(r.waldExact, 6), n: String(r.wald) })) });
                worst.set(r.worst, { formula: t("research.ci.b.worstWork", Object.assign({}, words, { exact: w(r.worstExact, 6), n: String(r.worst) })) });
                const said = { acc: pct(p, 12), h: num(v["b.half"], { digits: 12 }), level: levelText(v["b.level"]), n: num(r.wilson), worst: num(r.worst) };
                panel.verdict.set(t(r.worst > r.wilson ? "research.ci.b.verdictWorst" : "research.ci.b.verdict", said), "info");
            }
            return { refresh: refresh };
        })();

        /* ----- (c) Two models, independent samples ----- */
        const c = (function () {
            const panel = K.panel(parts.panels.two, { questionKey: "research.ci.c.question", titleKey: "research.ci.part.two", onChange: refresh });
            panel.field({ name: "c.accA", labelKey: "research.ci.c.accA", kind: "percent", value: 83 });
            panel.field({ name: "c.accB", labelKey: "research.ci.c.accB", kind: "percent", value: 80 });
            panel.field({ name: "c.n", labelKey: "research.ci.c.n", kind: "int", min: 1, value: 500, powers: true, unitKey: "research.ci.unit.examples" });
            levelChoice(panel, "c.level");
            const diff = panel.result({ name: "diff", labelKey: "research.ci.c.diff", unitKey: "research.ci.unit.points" });
            const se = panel.result({ name: "se", labelKey: "research.ci.c.se", unitKey: "research.ci.unit.points" });
            const z = panel.result({ name: "z", labelKey: "research.ci.c.z" });
            const p = panel.result({ name: "p", labelKey: "research.ci.c.p" });
            const interval = panel.result({ name: "ci", labelKey: "research.ci.c.ci", kind: "interval", unitKey: "research.ci.unit.points" });
            const nNeeded = panel.result({ name: "nNeeded", labelKey: "research.ci.c.nNeeded", kind: "int", unitKey: "research.ci.unit.examples" });
            const n80 = panel.result({ name: "n80", labelKey: "research.ci.c.n80", kind: "int", unitKey: "research.ci.unit.examples" });
            panel.remark({ key: "research.ci.c.remark" });
            panel.formula({ key: "research.ci.c.formula" });
            panel.source({ nameKey: "research.ci.c.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) return;
                const pA = v["c.accA"];
                const pB = v["c.accB"];
                const count = v["c.n"];
                const level = v["c.level"];
                const r = twoModels(pA, pB, count, level);
                if (!r) return;
                const words = {
                    pA: share(pA), pB: share(pB), qA: share(Number((1 - pA).toFixed(12))), qB: share(Number((1 - pB).toFixed(12))),
                    n: String(count), d: w(r.diff), se: w(r.se), crit: w(r.crit, 6), zp: w(r.zPower, 6)
                };
                diff.set(r.diff * 100, { formula: t("research.ci.c.diffWork", words) });
                se.set(r.se * 100, { formula: t("research.ci.c.seWork", words) });
                // "significant" is said only where the normal approximation can be trusted (SMALL_COUNT)
                const significant = r.p < 1 - level - 1e-12;
                z.set(r.z, { formula: r.se > 0 ? t("research.ci.c.zWork", Object.assign({}, words, { z: w(r.z) })) : undefined });
                p.set(r.p, {
                    formula: r.se > 0 ? t("research.ci.c.pWork", { absz: w(Math.abs(r.z)), p: w(r.p) }) : undefined,
                    tone: significant ? (r.small ? "warn" : "good") : undefined
                });
                interval.set({ lo: r.lo * 100, hi: r.hi * 100 }, { formula: t("research.ci.c.ciWork", Object.assign({}, words, { lo: w(r.lo), hi: w(r.hi) })) });
                if (r.diff === 0) {
                    nNeeded.set(Infinity, { formula: t("research.ci.c.never") });
                    n80.set(Infinity, { formula: t("research.ci.c.never") });
                } else {
                    nNeeded.set(r.nNeeded, { formula: t("research.ci.c.nNeededWork", Object.assign({}, words, { exact: w(r.nNeededExact, 6), n: String(r.nNeeded) })) });
                    n80.set(r.n80, { formula: t("research.ci.c.n80Work", Object.assign({}, words, { exact: w(r.n80Exact, 6), n: String(r.n80) })) });
                }
                const said = {
                    n: num(count), accA: pct(pA, 12), accB: pct(pB, 12), p: num(r.p), alpha: alphaText(level),
                    d: num(Math.abs(r.diff) * 100, { digits: 4 }), nNeeded: num(r.nNeeded), n80: num(r.n80), few: String(SMALL_COUNT)
                };
                if (r.diff === 0) panel.verdict.set(t("research.ci.c.verdictSame"), "info");
                else if (r.small) panel.verdict.set(t("research.ci.c.verdictSmall", said), "warn");
                else if (significant) panel.verdict.set(t("research.ci.c.verdictYes", said), "good");
                else panel.verdict.set(t("research.ci.c.verdictNo", said), "warn");
            }
            return { refresh: refresh };
        })();

        /* ----- (d) Paired test (McNemar) ----- */
        const d = (function () {
            const panel = K.panel(parts.panels.paired, { questionKey: "research.ci.d.question", titleKey: "research.ci.part.paired", onChange: refresh });
            panel.field({ name: "d.b", labelKey: "research.ci.d.b", kind: "int", min: 0, value: 30, powers: true, hintKey: "research.ci.d.hint" });
            panel.field({ name: "d.c", labelKey: "research.ci.d.c", kind: "int", min: 0, value: 15, powers: true });
            levelChoice(panel, "d.level");
            const pairs = panel.result({ name: "pairs", labelKey: "research.ci.d.pairs", kind: "int" });
            const p = panel.result({ name: "p", labelKey: "research.ci.d.p" });
            const chi2 = panel.result({ name: "chi2", labelKey: "research.ci.d.chi2" });
            const chi2p = panel.result({ name: "chi2p", labelKey: "research.ci.d.chi2p", hintKey: "research.ci.d.chi2Hint" });
            panel.formula({ key: "research.ci.d.formula" });
            panel.source({ nameKey: "research.ci.d.source", units: ["r12"] });

            function refresh() {
                const v = panel.values();
                if (!v) return;
                const bCount = v["d.b"];
                const cCount = v["d.c"];
                const level = v["d.level"];
                const r = paired(bCount, cCount);
                if (!r) return;
                const words = { b: String(bCount), c: String(cCount), n: String(r.n), m: String(Math.min(bCount, cCount)) };
                pairs.set(r.n, { formula: t("research.ci.d.pairsWork", words) });
                const significant = r.n > 0 && r.p < 1 - level - 1e-12;
                p.set(r.p, {
                    formula: r.n > 0 ? t("research.ci.d.pWork", Object.assign({}, words, { tail: w(r.tail), p: w(r.p) })) : undefined,
                    tone: significant ? "good" : undefined
                });
                // (b = c: the correction stops at 0, and "(|b − c| − 1)² / n = 0" would be false arithmetic)
                chi2.set(r.chi2, { formula: r.n > 0 ? t(bCount === cCount ? "research.ci.d.chi2WorkEqual" : "research.ci.d.chi2Work", Object.assign({}, words, { chi2: w(r.chi2) })) : undefined });
                chi2p.set(r.pChi2, { formula: r.n > 0 ? t("research.ci.d.chi2pWork", { chi2: w(r.chi2), p: w(r.pChi2) }) : undefined });
                const aWins = bCount >= cCount;
                const said = {
                    n: num(r.n), b: num(bCount), c: num(cCount), p: num(r.p), alpha: alphaText(level),
                    winner: aWins ? "A" : "B", loser: aWins ? "B" : "A", more: num(Math.max(bCount, cCount)), less: num(Math.min(bCount, cCount))
                };
                if (r.n === 0) panel.verdict.set(t("research.ci.d.verdictNone"), "info");
                else if (significant) panel.verdict.set(t("research.ci.d.verdictYes", said), "good");
                else panel.verdict.set(t("research.ci.d.verdictNo", said), "warn");
            }
            return { refresh: refresh };
        })();

        function refresh() {
            a.refresh();
            b.refresh();
            c.refresh();
            d.refresh();
        }
        refresh();
        return K.controller(refresh);
    }

    A.research.define("ci", { create: create, maths: maths });
})();
