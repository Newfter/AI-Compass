/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "seeds": COMPARING RUNS OVER SEEDS
   Two lists of results, one number per training run (one seed each):
     - each list: n, mean, standard deviation, standard error, range, t interval
     - Welch's test (unpaired) and, when the runs are paired, the paired t-test
       with the correlation of the two lists
     - effect sizes: pooled s, Cohen's d, Hedges' g, probability of superiority
     - a seeded percentile bootstrap of the difference (10,000 resamples, a job)
     - planning: runs per model for a difference Δ (normal approximation)
     - a dot chart of every run with each mean and its interval
   The formulas are those of S/r9/research/sheet-T1.md ("seeds"). Texts:
   js/content/research/seeds.js. The functions of sections 1 and 2 are pure and
   are given to the tests as spec.maths (dev/tests/research.seeds.math.js).
    1. The numbers (pure)
    2. The verdict (pure)
    3. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["r12", "b4"];
    const LEVELS = [0.9, 0.95, 0.99];
    const POWER = 0.8;                   // planning: the difference is found 80% of the time
    const REPS = 10000;                  // bootstrap resamples
    const MAX_RUNS = 200;                // numbers in one list
    const LIMIT = 1e15;                  // |a result| at most this, so its square stays a safe number
    const FEW_RUNS = 5;                  // below this the spread itself is poorly known
    const BOOT_FEW = 10;                 // below this the bootstrap interval is too narrow
    const DEFAULT_A = [71.2, 70.8, 72.1, 71.5, 70.9];
    const DEFAULT_B = [70.1, 71.0, 70.4, 69.8, 70.6];

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       ========================================================= */
    // The smallest whole n ≥ 1 for which ok(n) holds, starting from x, the formula's value
    // (the same helper as in ci.js: the condition decides, not the rounding of x)
    function smallestWhole(x, ok) {
        if (!isFinite(x)) return x > 0 ? Infinity : 1;
        let n = Math.max(1, Math.ceil(x));
        if (n >= 9e15) return n;
        for (let i = 0; i < 8 && n > 1 && ok(n - 1); i++) n -= 1;
        for (let i = 0; i < 8 && !ok(n); i++) n += 1;
        return n;
    }

    // One list -> { n, mean, min, max } and, from 2 numbers on, { sd, se, crit, half, lo, hi, df }
    function describe(list, level) {
        const M = A.researchMath;
        const n = list.length;
        const out = { n: n, mean: M.mean(list), min: M.min(list), max: M.max(list) };
        if (n < 2) return out;
        const r = M.tInterval(list, level);
        if (!r) return out;
        return Object.assign(out, { sd: r.sd, se: r.se, crit: r.crit, half: r.half, lo: r.lo, hi: r.hi, df: r.df });
    }

    // Runs per model to find a difference delta with 80% power, two-sided at the level:
    // n = ⌈2·(z_(1−α/2) + z_0.8)²·s²/Δ² + z_(1−α/2)²/4⌉  -> { exact, n, z, zPower } or null
    function planRuns(pooled, delta, level) {
        const M = A.researchMath;
        if (!(pooled > 0) || !(delta > 0) || !isFinite(pooled) || !isFinite(delta)) return null;
        const z = M.zFor(level);
        const zPower = M.normalInv(POWER);
        const exact = 2 * (z + zPower) * (z + zPower) * pooled * pooled / (delta * delta) + z * z / 4;
        // at least 2 runs: one run per model has no spread, so no test can use it
        const formula = smallestWhole(exact, function (count) { return count >= exact; });
        return { exact: exact, n: Math.max(2, formula), floored: formula < 2, z: z, zPower: zPower };
    }

    // Everything at once. options: { level, paired (wanted), delta }
    //   -> { a, b, enough, diff, canPair, pairedOn, welch, paired, effect, superiority, wins,
    //        plan: { observed, wanted } }
    //   welch / paired: M.welch / M.pairedT (null when they cannot be computed); paired is
    //   computed only when it was wanted and both lists have the same length.
    function compare(a, b, options) {
        const M = A.researchMath;
        const s = Object.assign({ level: 0.95, paired: false, delta: NaN }, options);
        const out = {
            a: describe(a, s.level),
            b: describe(b, s.level),
            enough: a.length >= 2 && b.length >= 2,
            diff: a.length && b.length ? M.mean(a) - M.mean(b) : NaN,
            canPair: a.length === b.length && a.length >= 2,
            pairedOn: false,
            welch: null, paired: null, effect: null, superiority: NaN, wins: NaN,
            plan: { observed: null, wanted: null }
        };
        if (!out.enough) return out;
        out.welch = M.welch(a, b, s.level);
        if (s.paired && out.canPair) {
            out.paired = M.pairedT(a, b, s.level);
            out.pairedOn = Boolean(out.paired);
        }
        out.effect = M.effectSize(a, b);
        out.superiority = M.superiority(a, b);
        // the pairs with a > b (ties count ½): a whole number or a half
        out.wins = Math.round(out.superiority * a.length * b.length * 2) / 2;
        const pooled = out.effect ? out.effect.pooled : NaN;
        out.plan.observed = planRuns(pooled, Math.abs(out.diff), s.level);
        out.plan.wanted = planRuns(pooled, s.delta, s.level);
        return out;
    }

    // The difference of the two means, for the bootstrap (lists[0] − lists[1])
    function meanDifference(lists) {
        const M = A.researchMath;
        return M.mean(lists[0]) - M.mean(lists[1]);
    }

    // A seeded percentile bootstrap of mean(a) − mean(b) that runs in pieces (K.job):
    // each list resampled on its own, or the pairs together when paired
    function bootstrapStart(a, b, options) {
        const M = A.researchMath;
        const s = Object.assign({ seed: 1, level: 0.95, paired: false, reps: REPS }, options);
        return M.bootstrapStart([a, b], meanDifference, { reps: s.reps, seed: s.seed, confidence: s.level, paired: s.paired });
    }

    /* =========================================================
       2. THE VERDICT (pure): which sentences, and the tone
       r: compare(); s: { level, better: "higher" | "lower", pairedWanted }
       -> { tone, parts: [[key, values]] }   (values: numbers and letters; the tool writes them)
       The test used is the paired one when it is on, else Welch's.
       ========================================================= */
    function verdictOf(r, s) {
        const alpha = Number((1 - s.level).toFixed(10));
        const parts = [];
        if (!r.enough) return { tone: "bad", parts: [["one", {}]] };
        const used = r.pairedOn ? r.paired : r.welch;
        let tone;
        if (!used || !(used.se > 0)) {
            parts.push([r.pairedOn ? "noSpreadPaired" : "noSpread", { d: r.diff }]);
            tone = "bad";
        } else if (used.p < alpha - 1e-12) {
            // which model is better: the sign of A − B, read the way the reader's metric goes
            const aAhead = s.better === "lower" ? used.diff < 0 : used.diff > 0;
            parts.push(["yes", { winner: aAhead ? "A" : "B", d: used.diff, lo: used.lo, hi: used.hi, p: used.p, level: s.level, alpha: alpha }]);
            tone = "good";
        } else {
            parts.push(["no", { d: used.diff, p: used.p, alpha: alpha, half: used.half }]);
            tone = "warn";
        }
        if (r.pairedOn && r.welch && r.welch.se > 0 && used.se > 0) {
            const values = { r: r.paired.r, paired: r.paired.half, welch: r.welch.half };
            // A list that never changes has no correlation, and its two intervals are equal in
            // exact arithmetic: asked first, so that the last digit of rounding cannot say "helped"
            if (!isFinite(r.paired.r)) parts.push(["pairFlat", { paired: r.paired.half, welch: r.welch.half }]);
            else if (r.paired.half < r.welch.half && r.paired.r > 0) parts.push(["pairHelped", values]);
            else if (r.paired.r > 0) parts.push(["pairWeak", values]);
            else parts.push(["pairNot", values]);
        }
        if (s.pairedWanted && !r.canPair) parts.push(["pairLengths", {}]);
        if (Math.min(r.a.n, r.b.n) < FEW_RUNS) parts.push(["few", { min: FEW_RUNS }]);
        return { tone: tone, parts: parts };
    }

    // A notebook entry keeps at most 40 result rows (js/research.js, LIMITS.rows), and the
    // kit sends two per result (the value, then its worked formula under a blank name).
    // This tool has up to 31 results, so each formula is folded into its result's row:
    // every output reaches the notebook. (Meant for the kit: see the final report.)
    const NOTE_ROWS = 40;
    function foldRows(rows) {
        const out = [];
        (rows || []).forEach(function (row) {
            if (row[0] === "" && out.length) out[out.length - 1] = [out[out.length - 1][0], out[out.length - 1][1] + "\n" + row[1]];
            else out.push([row[0], row[1]]);
        });
        return out;
    }
    function withFoldedNotes(ctx) {
        if (!ctx || typeof ctx.note !== "function") return ctx;
        return Object.assign({}, ctx, {
            note: function (entry) {
                const rows = entry && entry.results ? entry.results : [];
                return ctx.note(Object.assign({}, entry, { results: rows.length > NOTE_ROWS ? foldRows(rows) : rows }));
            }
        });
    }

    const maths = {
        smallestWhole: smallestWhole, describe: describe, planRuns: planRuns, compare: compare,
        meanDifference: meanDifference, bootstrapStart: bootstrapStart, verdictOf: verdictOf, foldRows: foldRows,
        FEW_RUNS: FEW_RUNS, BOOT_FEW: BOOT_FEW, REPS: REPS
    };

    /* =========================================================
       3. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(withFoldedNotes(ctx));
        const num = kit.num;

        // Numbers in the worked formulas: 5 significant digits, no thousands groups
        function w(value, digits) {
            return num(value, { digits: digits || 5, grouping: false });
        }
        function pct(share) {
            return num(share, { percent: true, digits: 4 });
        }

        const panel = K.panel(stage, { questionKey: "research.seeds.question", titleKey: "research.seeds.title", onChange: refresh });
        const listA = panel.list({ name: "a", labelKey: "research.seeds.a", value: DEFAULT_A, minCount: 1, maxCount: MAX_RUNS, min: -LIMIT, max: LIMIT, rows: 3 });
        const listB = panel.list({ name: "b", labelKey: "research.seeds.b", value: DEFAULT_B, minCount: 1, maxCount: MAX_RUNS, min: -LIMIT, max: LIMIT, rows: 3 });
        const pairedSwitch = panel.toggle({ name: "paired", labelKey: "research.seeds.paired", checked: false, hintKey: "research.seeds.pairedHint" });
        panel.choice({
            name: "level", labelKey: "research.seeds.level", value: 0.95,
            options: LEVELS.map(function (level) { return { value: level, labelKey: "research.seeds.level." + Math.round(level * 100) }; })
        });
        panel.choice({
            name: "better", labelKey: "research.seeds.better", value: "higher",
            options: [{ value: "higher", labelKey: "research.seeds.better.higher" }, { value: "lower", labelKey: "research.seeds.better.lower" }]
        });
        panel.field({ name: "delta", labelKey: "research.seeds.delta", kind: "number", min: 0, minOpen: true, value: 0.5, powers: true, hintKey: "research.seeds.deltaHint" });
        panel.field({ name: "seed", labelKey: "research.seeds.seed", kind: "int", min: 0, max: 4294967295, value: 1, hintKey: "research.seeds.seedHint" });

        function listRows(prefix, letter) {
            panel.heading(function () { return t("research.seeds.headList", { model: letter }); });
            return {
                n: panel.result({ name: prefix + "n", labelKey: "research.seeds.n", kind: "int" }),
                mean: panel.result({ name: prefix + "mean", labelKey: "research.seeds.mean" }),
                sd: panel.result({ name: prefix + "sd", labelKey: "research.seeds.sd" }),
                se: panel.result({ name: prefix + "se", labelKey: "research.seeds.se" }),
                range: panel.result({ name: prefix + "range", labelKey: "research.seeds.range", kind: "interval" }),
                ci: panel.result({ name: prefix + "ci", labelKey: "research.seeds.ci", kind: "interval" })
            };
        }
        const rowsA = listRows("a.", "A");
        const rowsB = listRows("b.", "B");

        panel.heading("research.seeds.headWelch");
        const welch = {
            diff: panel.result({ name: "diff", labelKey: "research.seeds.diff" }),
            se: panel.result({ name: "w.se", labelKey: "research.seeds.w.se" }),
            df: panel.result({ name: "w.df", labelKey: "research.seeds.w.df" }),
            t: panel.result({ name: "w.t", labelKey: "research.seeds.t" }),
            p: panel.result({ name: "w.p", labelKey: "research.seeds.p" }),
            ci: panel.result({ name: "w.ci", labelKey: "research.seeds.diffCi", kind: "interval" })
        };
        const pairedHead = panel.heading("research.seeds.headPaired");
        const paired = {
            diff: panel.result({ name: "p.diff", labelKey: "research.seeds.p.diff" }),
            sd: panel.result({ name: "p.sd", labelKey: "research.seeds.p.sd" }),
            t: panel.result({ name: "p.t", labelKey: "research.seeds.t" }),
            df: panel.result({ name: "p.df", labelKey: "research.seeds.p.df", kind: "int" }),
            p: panel.result({ name: "p.p", labelKey: "research.seeds.p" }),
            ci: panel.result({ name: "p.ci", labelKey: "research.seeds.diffCi", kind: "interval" }),
            r: panel.result({ name: "p.r", labelKey: "research.seeds.p.r", hintKey: "research.seeds.p.rHint" })
        };
        panel.heading("research.seeds.headEffect");
        const effect = {
            pooled: panel.result({ name: "e.pooled", labelKey: "research.seeds.e.pooled" }),
            d: panel.result({ name: "e.d", labelKey: "research.seeds.e.d" }),
            g: panel.result({ name: "e.g", labelKey: "research.seeds.e.g" }),
            sup: panel.result({ name: "e.sup", labelKey: "research.seeds.e.sup", hintKey: "research.seeds.e.supHint" })
        };
        panel.heading("research.seeds.headBoot");
        const boot = panel.result({ name: "boot", labelKey: "research.seeds.boot", kind: "interval", hintKey: "research.seeds.bootHint" });
        const job = panel.job();
        panel.heading("research.seeds.headPlan");
        // "6 runs", "1 run" (Russian: 2 запуска, 6 запусков): the unit follows the row's number
        const runs = { observed: NaN, wanted: NaN };
        const planObserved = panel.result({ name: "plan.observed", labelKey: "research.seeds.plan.observed", kind: "int", unitKey: function () { return A.plural("research.seeds.unit.runs", runs.observed); } });
        const planWanted = panel.result({ name: "plan.wanted", labelKey: "research.seeds.plan.wanted", kind: "int", unitKey: function () { return A.plural("research.seeds.unit.runs", runs.wanted); } });
        panel.remark({ key: "research.seeds.planRemark" });

        const chart = panel.chart({
            labelKey: "research.seeds.chart",
            height: 280,
            x: { min: 0.5, max: 2.5, step: 1, format: axisName },
            y: { labelKey: "research.seeds.axisY" }
        }, "below");
        panel.formula({ key: "research.seeds.formula" });
        panel.source({ nameKey: "research.seeds.source", units: UNITS });

        function axisName(value) {
            return value === 1 ? "A" : value === 2 ? "B" : "";
        }
        function quantileOf(level) {
            return w(1 - (1 - level) / 2, 4);
        }

        function clearAll(rows) {
            rows.forEach(function (row) { row.clear(); });
        }

        /* ----- one list ----- */
        function showList(rows, list, d, level) {
            rows.n.set(d.n);
            rows.mean.set(d.mean, { formula: t("research.seeds.meanWork", { sum: w(A.researchMath.sum(list)), n: String(d.n), mean: w(d.mean) }) });
            rows.range.set({ lo: d.min, hi: d.max });
            if (d.n < 2 || !isFinite(d.sd)) {
                clearAll([rows.sd, rows.se, rows.ci]);
                return;
            }
            rows.sd.set(d.sd, { formula: t("research.seeds.sdWork", { mean: w(d.mean), m1: String(d.n - 1), ss: w(d.sd * d.sd * (d.n - 1)), sd: w(d.sd) }) });
            rows.se.set(d.se, { formula: t("research.seeds.seWork", { sd: w(d.sd), n: String(d.n), se: w(d.se) }) });
            rows.ci.set({ lo: d.lo, hi: d.hi }, {
                formula: t("research.seeds.ciWork", {
                    level: pct(level), mean: w(d.mean), q: quantileOf(level), df: String(d.df), crit: w(d.crit), se: w(d.se), half: w(d.half), lo: w(d.lo), hi: w(d.hi)
                })
            });
        }

        /* ----- the bootstrap: a job, started again only when its inputs change ----- */
        let bootKey = "";
        let bootResult = null;
        function showBoot(result, few, isPaired) {
            const alpha = 1 - result.level;
            boot.set({ lo: result.lo, hi: result.hi }, {
                tone: few ? "warn" : undefined,
                formula: t(isPaired ? "research.seeds.bootWorkPaired" : "research.seeds.bootWork", {
                    level: pct(result.level), seed: String(result.seed), reps: num(result.reps),
                    q1: num(alpha / 2 * 100, { digits: 4 }), q2: num((1 - alpha / 2) * 100, { digits: 4 }), lo: w(result.lo), hi: w(result.hi)
                })
            });
        }
        function runBoot(a, b, settings) {
            const key = JSON.stringify([a, b, settings.seed, settings.level, settings.paired]);
            const few = Math.min(a.length, b.length) < BOOT_FEW;
            if (key === bootKey && bootResult) {
                showBoot(bootResult, few, settings.paired);
                return;
            }
            if (key === bootKey && job.running()) return;
            bootResult = null;
            boot.clear();
            const work = bootstrapStart(a, b, settings);
            job.start(work, {
                chunk: 50,
                onDone: function () {
                    const r = work.result();
                    bootResult = { lo: r.lo, hi: r.hi, seed: r.seed, reps: r.reps, level: settings.level };
                    showBoot(bootResult, few, settings.paired);
                },
                onStop: function () {
                    if (bootKey === key) bootKey = "";
                }
            });
            // (after start: starting stops the job before, whose onStop must not clear this key)
            bootKey = key;
        }
        function stopBoot() {
            bootKey = "";
            bootResult = null;
            job.quiet();
            boot.clear();
        }

        /* ----- the tests ----- */
        function showWelch(r, level) {
            const v = r.welch;
            const words = {
                ma: w(r.a.mean), mb: w(r.b.mean), d: w(r.diff), sa: w(r.a.sd), sb: w(r.b.sd), na: String(r.a.n), nb: String(r.b.n),
                va: w(r.a.sd * r.a.sd / r.a.n), vb: w(r.b.sd * r.b.sd / r.b.n), na1: String(r.a.n - 1), nb1: String(r.b.n - 1), level: pct(level)
            };
            welch.diff.set(r.diff, { formula: t("research.seeds.diffWork", words) });
            if (!v || !(v.se > 0)) {
                welch.se.set(v ? v.se : null, { formula: v ? t("research.seeds.w.seWork", Object.assign({ se: w(v.se) }, words)) : undefined, tone: "bad" });
                clearAll([welch.df, welch.t, welch.p, welch.ci]);
                return;
            }
            Object.assign(words, { se: w(v.se), df: w(v.df), t: w(v.t), abst: w(Math.abs(v.t)), p: w(v.p), crit: w(v.crit), q: quantileOf(level), lo: w(v.lo), hi: w(v.hi) });
            welch.se.set(v.se, { formula: t("research.seeds.w.seWork", words) });
            welch.df.set(v.df, { formula: t("research.seeds.w.dfWork", words) });
            welch.t.set(v.t, { formula: t("research.seeds.tWork", words) });
            welch.p.set(v.p, { formula: t("research.seeds.pWork", words), tone: v.p < 1 - level - 1e-12 ? "good" : undefined });
            welch.ci.set({ lo: v.lo, hi: v.hi }, { formula: t("research.seeds.diffCiWork", words) });
        }

        function showPaired(r, level) {
            const on = Boolean(r.pairedOn);
            A.dom.setHidden(pairedHead, !on);
            Object.keys(paired).forEach(function (name) { paired[name].hidden(!on); });
            if (!on) {
                clearAll(Object.keys(paired).map(function (name) { return paired[name]; }));
                return;
            }
            const v = r.paired;
            const words = { n: String(v.n), m1: String(v.n - 1), d: w(v.diff), sd: w(v.sd), level: pct(level) };
            paired.diff.set(v.diff, { formula: t("research.seeds.p.diffWork", words) });
            paired.sd.set(v.sd, { formula: t("research.seeds.p.sdWork", words) });
            paired.df.set(v.df, { formula: t("research.seeds.p.dfWork", words) });
            if (isFinite(v.r)) paired.r.set(v.r, { formula: t("research.seeds.p.rWork", { r: w(v.r) }), tone: v.r > 0 ? "good" : undefined });
            else paired.r.set(null, { formula: t("research.seeds.p.rFlat") });
            if (!(v.se > 0)) {
                clearAll([paired.t, paired.p, paired.ci]);
                return;
            }
            Object.assign(words, { se: w(v.se), t: w(v.t), abst: w(Math.abs(v.t)), df: String(v.df), p: w(v.p), crit: w(v.crit), q: quantileOf(level), lo: w(v.lo), hi: w(v.hi) });
            paired.t.set(v.t, { formula: t("research.seeds.p.tWork", words) });
            paired.p.set(v.p, { formula: t("research.seeds.pWork", words), tone: v.p < 1 - level - 1e-12 ? "good" : undefined });
            paired.ci.set({ lo: v.lo, hi: v.hi }, { formula: t("research.seeds.p.ciWork", words) });
        }

        function showEffect(r) {
            const e = r.effect;
            if (!e || !(e.pooled > 0)) {
                effect.pooled.set(e ? e.pooled : null, { tone: "bad" });
                clearAll([effect.d, effect.g]);
            } else {
                const words = {
                    na1: String(r.a.n - 1), nb1: String(r.b.n - 1), sa: w(r.a.sd), sb: w(r.b.sd), na: String(r.a.n), nb: String(r.b.n),
                    pooled: w(e.pooled), d: w(r.diff), cohen: w(e.d), g: w(e.g), four: String(4 * (r.a.n + r.b.n) - 9)
                };
                effect.pooled.set(e.pooled, { formula: t("research.seeds.e.pooledWork", words) });
                effect.d.set(e.d, { formula: t("research.seeds.e.dWork", words) });
                effect.g.set(e.g, { formula: t("research.seeds.e.gWork", words) });
            }
            effect.sup.set(r.superiority, {
                formula: t("research.seeds.e.supWork", { wins: num(r.wins, { digits: 12, grouping: false }), pairs: String(r.a.n * r.b.n), sup: w(r.superiority) })
            });
        }

        function showPlan(r, delta) {
            [[planObserved, r.plan.observed, Math.abs(r.diff), "research.seeds.planWorkObserved", "observed"], [planWanted, r.plan.wanted, delta, "research.seeds.planWork", "wanted"]].forEach(function (item) {
                const row = item[0];
                const plan = item[1];
                runs[item[4]] = plan ? plan.n : Infinity;
                if (item[2] === 0 && r.effect && r.effect.pooled > 0) {
                    row.set(Infinity, { formula: t("research.seeds.plan.never") });
                } else if (!plan) {
                    row.clear();
                } else {
                    row.set(plan.n, {
                        formula: t(item[3], { z: w(plan.z, 6), zp: w(plan.zPower, 6), s: w(r.effect.pooled), delta: w(item[2]), exact: w(plan.exact, 6), n: String(plan.n) }) +
                            (plan.floored ? " " + t("research.seeds.planFloor") : "")
                    });
                }
            });
        }

        /* ----- the verdict: the pure rules of section 2, written in words ----- */
        function sentence(part) {
            const values = {};
            Object.keys(part[1]).forEach(function (name) {
                const value = part[1][name];
                if (typeof value !== "number") values[name] = value;
                else if (name === "alpha" || name === "level") values[name] = pct(value);
                else values[name] = num(value);
            });
            return t("research.seeds.verdict." + part[0], values);
        }

        /* ----- the chart: every run as a dot, each mean with its interval ----- */
        function drawChart(a, b, r, level) {
            const spread = function (list, centre) {
                const n = list.length;
                return list.map(function (value, i) { return [centre - 0.26 + (n > 1 ? 0.18 * i / (n - 1) : 0.09), value]; });
            };
            const means = function (d, centre) {
                return [centre + 0.14, d.mean, isFinite(d.lo) ? d.lo : d.mean, isFinite(d.hi) ? d.hi : d.mean];
            };
            chart.set({
                series: [
                    { kind: "points", data: spread(a, 1), colorIndex: 0, labelKey: "research.seeds.series.runsA" },
                    { kind: "points", data: spread(b, 2), colorIndex: 1, labelKey: "research.seeds.series.runsB" },
                    {
                        kind: "points", data: [means(r.a, 1), means(r.b, 2)], errors: true, shape: "diamond", color: "text",
                        label: function () { return t("research.seeds.series.mean", { level: pct(level) }); }
                    }
                ],
                describe: function () {
                    return t("research.seeds.describe", {
                        na: num(r.a.n), nb: num(r.b.n), ma: num(r.a.mean), mb: num(r.b.mean),
                        la: num(r.a.lo), ha: num(r.a.hi), lb: num(r.b.lo), hb: num(r.b.hi), level: pct(level)
                    });
                }
            });
        }

        function refresh() {
            // the switch is offered only when both lists can be paired
            const sameLength = listA.valid() && listB.valid() && listA.values().length === listB.values().length && listA.values().length >= 2;
            A.dom.setHidden(pairedSwitch.element, !sameLength);
            const v = panel.values();
            if (!v) {
                showPaired({ pairedOn: false }, 0.95);
                stopBoot();
                return;
            }
            const a = v.a;
            const b = v.b;
            const level = v.level;
            const r = compare(a, b, { level: level, paired: v.paired, delta: v.delta });
            showList(rowsA, a, r.a, level);
            showList(rowsB, b, r.b, level);
            showPaired(r, level);
            if (!r.enough) {
                clearAll([welch.diff, welch.se, welch.df, welch.t, welch.p, welch.ci, effect.pooled, effect.d, effect.g, effect.sup, planObserved, planWanted]);
                stopBoot();
            } else {
                showWelch(r, level);
                showEffect(r);
                showPlan(r, v.delta);
                if (r.welch && r.welch.se > 0) runBoot(a, b, { seed: v.seed, level: level, paired: r.pairedOn });
                else stopBoot();
            }
            const said = verdictOf(r, { level: level, better: v.better, pairedWanted: v.paired });
            panel.verdict.set(said.parts.map(sentence).join(" "), said.tone);
            drawChart(a, b, r, level);
        }

        refresh();
        return K.controller(refresh);
    }

    A.research.define("seeds", { create: create, maths: maths });
})();
