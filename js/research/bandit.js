/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "bandit": BANDIT REGRET
   A simulator of the multi-armed bandit with 0/1 rewards (Bernoulli arms):
     - four algorithms: ε-greedy, UCB1, Thompson sampling, explore then commit
     - for every run and step the pseudo-regret Σ (μ* − μ of the arm pulled),
       averaged over the runs with a band of ± one standard error (a job,
       seeded: the same seed gives the same curves)
     - at T: the mean regret ± its standard error and the share of pulls of
       the best arm, for each algorithm
     - three reference values and curves with exact formulas: the exploration
       part of ε-greedy, the asymptotic lower bound of Lai and Robbins, the
       finite-time upper bound of UCB1
     - a verdict that says only what the run shows
   The formulas are those of S/r9/research/sheet-T1.md ("bandit"). Texts:
   js/content/research/bandit.js. The functions of sections 1 and 2 are pure
   and are given to the tests as spec.maths (dev/tests/research.bandit.math.js).
    1. The numbers (pure): KL, the reference values, the simulation
    2. The verdict (pure)
    3. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["t8", "r7"];
    const ALGOS = ["eps", "ucb", "ts", "etc"];
    const ARM_MIN = 0.001;               // success probabilities: inside (0, 1), as the sheet asks
    const ARM_MAX = 0.999;
    const MIN_ARMS = 2;
    const MAX_ARMS = 10;
    const MIN_T = 100;
    const MAX_T = 20000;
    const MIN_RUNS = 10;
    const MAX_RUNS = 200;
    const MAX_M = 10000;
    const LINEAR_POINTS = 200;           // the curves are kept at these steps (and at T/2 and T)
    const LOG_POINTS = 120;
    const LINE_SHARE = 0.75;             // late rate ≥ 0.75·early rate: "a straight line"
    const BEND_SHARE = 0.5;              // late rate < 0.5·early rate: "the curve bends"
    const CHUNK = 2000;                  // pulls per step() of the job
    const SERIES_SMALL = 0.01;           // below this |u| the KL term uses its series

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       ========================================================= */
    // y·h(1 + u) with h(r) = r·ln r − r + 1 ≥ 0, where x = y·(1 + u): one term of the KL
    // divergence written so that the two terms never cancel (both are ≥ 0 and they add up to
    // KL). It takes u, not x, because 1 − p would lose the digits of a tiny p − q. Near u = 0
    // its series.
    function klTerm(u, y) {
        if (Math.abs(u) < SERIES_SMALL) {
            // h(1 + u) = u²/2 − u³/6 + u⁴/12 − … = Σ_(k≥2) (−u)^k / (k(k − 1))
            let sum = 0;
            let power = u * u;
            for (let k = 2; k <= 12; k++) {
                sum += (k % 2 ? -power : power) / (k * (k - 1));
                power *= u;
            }
            return y * sum;
        }
        return y * ((1 + u) * Math.log1p(u) - u);
    }

    // KL(p ‖ q) = p·ln(p/q) + (1 − p)·ln((1 − p)/(1 − q)) in nats, for p and q inside (0, 1)
    function klBernoulli(p, q) {
        if (!(p > 0 && p < 1) || !(q > 0 && q < 1)) return NaN;
        const d = p - q;
        return klTerm(d / q, q) + klTerm(-d / (1 - q), 1 - q);
    }

    // The arms and the exact reference values. arms: success probabilities, T: the horizon,
    // eps: ε of ε-greedy -> { K, best, gaps, worse (the arms with Δ > 0), kls, sumGap, meanGap,
    //   lrConst = Σ Δ_i/KL(μ_i ‖ μ*), ucbLog = Σ 8/Δ_i, ucbConst = (1 + π²/3)·Σ Δ_i, equal,
    //   explore, laiRobbins, ucbBound (at T) } or null for arms that cannot be used
    function references(arms, T, eps) {
        if (!Array.isArray(arms) || arms.length < 1 || !arms.every(function (mu) { return mu > 0 && mu < 1; })) return null;
        const K = arms.length;
        const best = Math.max.apply(null, arms);
        const gaps = arms.map(function (mu) { return best - mu; });
        const worse = [];
        gaps.forEach(function (gap, i) { if (gap > 0) worse.push(i); });
        const kls = worse.map(function (i) { return klBernoulli(arms[i], best); });
        let sumGap = 0;
        gaps.forEach(function (gap) { sumGap += gap; });
        let lrConst = 0;
        let ucbLog = 0;
        worse.forEach(function (i, j) {
            lrConst += gaps[i] / kls[j];
            ucbLog += 8 / gaps[i];
        });
        const out = {
            K: K, best: best, gaps: gaps, worse: worse, kls: kls, sumGap: sumGap, meanGap: sumGap / K,
            lrConst: lrConst, ucbLog: ucbLog, ucbConst: (1 + Math.PI * Math.PI / 3) * sumGap, equal: worse.length === 0, eps: eps
        };
        const at = curvesAt(out, T);
        out.explore = at.explore;
        out.laiRobbins = at.laiRobbins;
        out.ucbBound = at.ucbBound;
        return out;
    }

    // The three reference curves at step t (t ≥ 1)
    function curvesAt(ref, step) {
        const ln = Math.log(step);
        return {
            explore: ref.eps * step * ref.meanGap,
            laiRobbins: ln * ref.lrConst,
            ucbBound: ref.equal ? 0 : ref.ucbLog * ln + ref.ucbConst
        };
    }

    // The steps at which the curves are kept: 200 evenly spaced, 120 evenly spaced on a
    // logarithmic scale, T/2 (for the shape) and T; whole numbers from 1 to T, rising
    function gridFor(T) {
        const seen = {};
        const add = function (value) { seen[Math.min(T, Math.max(1, Math.round(value)))] = true; };
        for (let i = 0; i <= LINEAR_POINTS; i++) add(T * i / LINEAR_POINTS);
        for (let i = 0; i <= LOG_POINTS; i++) add(Math.pow(T, i / LOG_POINTS));
        add(Math.floor(T / 2));
        add(T);
        return Object.keys(seen).map(Number).sort(function (a, b) { return a - b; });
    }

    // Each algorithm and run has its own random stream, from the seed and their names:
    // switching an algorithm off does not change the others' runs
    function seedText(seed, id, run) {
        return "bandit:" + seed + ":" + id + ":" + run;
    }

    // The simulation, in pieces for K.job.
    //   settings: { arms, T, runs, seed, eps, m, algos: ["eps", "ucb", "ts", "etc"] }
    //   -> { step(pulls) -> true when finished, progress(), done(), result() }
    //   result(): { grid, half, T, runs, algos: { <id>: { curve (mean regret at each grid step),
    //     se (its standard error), mean, sd, seMean (at T), share, shareSd, shareSe (pulls of a
    //     best arm / T), early, late (mean regret per step up to T/2 and after it) } } }
    // The algorithms (μ̂_i = successes/pulls of arm i, 0 before its first pull):
    //   eps   with probability ε a random arm, else the largest μ̂_i (ties at random)
    //   ucb   each arm once, then the largest μ̂_i + √(2·ln t / n_i), t = pulls so far (ties at random)
    //   ts    the largest θ_i drawn from Beta(1 + successes_i, 1 + failures_i)
    //   etc   m pulls of each arm in turn, then the largest μ̂_i (ties at random) forever
    function simulateStart(settings) {
        const M = A.researchMath;
        const s = settings;
        const arms = s.arms.slice();
        const K = arms.length;
        const T = s.T;
        const best = Math.max.apply(null, arms);
        const gaps = arms.map(function (mu) { return best - mu; });
        const grid = gridFor(T);
        const G = grid.length;
        const half = Math.floor(T / 2);
        const algos = (s.algos || []).filter(function (id) { return ALGOS.indexOf(id) !== -1; });
        const total = algos.length * s.runs * T;
        const acc = {};
        algos.forEach(function (id) {
            acc[id] = { count: 0, mean: new Float64Array(G), m2: new Float64Array(G), finals: [], shares: [] };
        });

        let a = 0;               // which algorithm
        let run = 0;             // which run of it
        let made = 0;            // pulls made in all
        let finished = algos.length === 0 || !(s.runs >= 1) || !(T >= 1);
        let pulls;
        let wins;
        let regret;
        let bestPulls;
        let step;                // pulls made in this run
        let g;                   // the next grid step
        let cum;                 // this run's regret at the grid steps
        let random;
        let committed;

        // The arm with the largest value, ties decided at random (each tied arm equally likely)
        function argmax(value) {
            let top = -Infinity;
            let chosen = 0;
            let ties = 0;
            for (let i = 0; i < K; i++) {
                const v = value(i);
                if (v > top) {
                    top = v;
                    chosen = i;
                    ties = 1;
                } else if (v === top) {
                    ties += 1;
                    if (random.int(ties) === 0) chosen = i;
                }
            }
            return chosen;
        }
        function estimate(i) {
            return pulls[i] > 0 ? wins[i] / pulls[i] : 0;
        }
        function ucbIndex(i) {
            return wins[i] / pulls[i] + Math.sqrt(2 * Math.log(step) / pulls[i]);
        }

        const choose = {
            eps: function () {
                if (random.uniform() < s.eps) return random.int(K);
                return argmax(estimate);
            },
            ucb: function () {
                if (step < K) return step;
                return argmax(ucbIndex);
            },
            ts: function () {
                let top = -Infinity;
                let chosen = 0;
                for (let i = 0; i < K; i++) {
                    const theta = random.beta(1 + wins[i], 1 + pulls[i] - wins[i]);
                    if (theta > top) {
                        top = theta;
                        chosen = i;
                    }
                }
                return chosen;
            },
            etc: function () {
                if (step < s.m * K) return step % K;
                if (committed < 0) committed = argmax(estimate);
                return committed;
            }
        };

        function begin() {
            pulls = new Float64Array(K);
            wins = new Float64Array(K);
            regret = 0;
            bestPulls = 0;
            step = 0;
            g = 0;
            cum = new Float64Array(G);
            committed = -1;
            random = M.rng(seedText(s.seed, algos[a], run));
        }

        function endRun() {
            const box = acc[algos[a]];
            box.count += 1;
            for (let i = 0; i < G; i++) {
                // Welford's running mean and sum of squares: no loss of digits
                const delta = cum[i] - box.mean[i];
                box.mean[i] += delta / box.count;
                box.m2[i] += delta * (cum[i] - box.mean[i]);
            }
            box.finals.push(regret);
            box.shares.push(bestPulls / T);
            run += 1;
            if (run >= s.runs) {
                run = 0;
                a += 1;
            }
            if (a >= algos.length) finished = true;
            else begin();
        }

        if (!finished) begin();

        function stepMany(count) {
            let left = count;
            while (!finished && left > 0) {
                const arm = choose[algos[a]]();
                pulls[arm] += 1;
                if (random.uniform() < arms[arm]) wins[arm] += 1;
                regret += gaps[arm];
                if (gaps[arm] === 0) bestPulls += 1;
                step += 1;
                if (grid[g] === step) {
                    cum[g] = regret;
                    g += 1;
                }
                left -= 1;
                made += 1;
                if (step === T) endRun();
            }
            return finished;
        }

        // Both measured from the first value: runs that are all the same give exactly that
        // value and a spread of exactly 0
        function spread(list, mean) {
            if (list.length < 2) return 0;
            let sum = 0;
            list.forEach(function (x) { sum += (x - mean) * (x - mean); });
            return Math.sqrt(sum / (list.length - 1));
        }
        function meanOf(list) {
            if (!list.length) return NaN;
            let sum = 0;
            list.forEach(function (x) { sum += x - list[0]; });
            return list[0] + sum / list.length;
        }

        function result() {
            const out = { grid: grid, half: half, T: T, runs: s.runs, algos: {} };
            const h = grid.indexOf(half);
            algos.forEach(function (id) {
                const box = acc[id];
                const n = box.count;
                const mean = meanOf(box.finals);
                const sd = spread(box.finals, mean);
                const share = meanOf(box.shares);
                const shareSd = spread(box.shares, share);
                const curve = Array.from(box.mean);
                out.algos[id] = {
                    curve: curve,
                    se: curve.map(function (_, i) { return n > 1 ? Math.sqrt(Math.max(0, box.m2[i]) / (n - 1) / n) : 0; }),
                    mean: mean, sd: sd, seMean: n > 0 ? sd / Math.sqrt(n) : NaN,
                    share: share, shareSd: shareSd, shareSe: n > 0 ? shareSd / Math.sqrt(n) : NaN,
                    early: half > 0 ? curve[h] / half : NaN,
                    late: (curve[G - 1] - curve[h]) / (T - half),
                    runs: n
                };
            });
            return out;
        }

        return {
            step: stepMany,
            progress: function () { return total > 0 ? made / total : 1; },
            done: function () { return finished; },
            result: result
        };
    }

    // The whole simulation at once (for the tests)
    function simulate(settings) {
        const work = simulateStart(settings);
        while (!work.step(100000)) { /* until every run is made */ }
        return work.result();
    }

    // What the verdict needs from a finished simulation
    function summarise(result, settings) {
        const K = settings.arms.length;
        const ref = references(settings.arms, settings.T, settings.eps);
        return {
            T: settings.T,
            runs: settings.runs,
            equal: Boolean(ref && ref.equal),
            epsValue: settings.eps,
            mk: settings.m * K,
            etcNever: settings.algos.indexOf("etc") !== -1 && settings.m * K >= settings.T,
            algos: settings.algos.filter(function (id) { return result.algos[id]; }).map(function (id) {
                const r = result.algos[id];
                return { id: id, mean: r.mean, se: r.seMean, early: r.early, late: r.late };
            })
        };
    }

    /* =========================================================
       2. THE VERDICT (pure): which sentences, and the tone
       r: summarise() -> { tone, parts: [[key, values]] }
       values: numbers, and algorithm ids (alg, alg2) or lists of them (names)
       ========================================================= */
    function verdictOf(r) {
        const parts = [];
        if (!r.algos.length) return { tone: "bad", parts: [["none", {}]] };
        if (r.equal) return { tone: "info", parts: [["equal", {}]] };
        const sorted = r.algos.slice().sort(function (x, y) { return x.mean - y.mean || ALGOS.indexOf(x.id) - ALGOS.indexOf(y.id); });
        const first = sorted[0];
        let tone = "info";
        if (sorted.length === 1) {
            parts.push(["single", { alg: first.id, mean: first.mean, se: first.se, T: r.T, runs: r.runs }]);
        } else {
            const second = sorted[1];
            const diff = second.mean - first.mean;
            const twice = 2 * Math.sqrt(first.se * first.se + second.se * second.se);
            const clear = diff > twice;
            parts.push([clear ? "clear" : "unclear", {
                alg: first.id, mean: first.mean, se: first.se, alg2: second.id, mean2: second.mean, se2: second.se, diff: diff, twice: twice, T: r.T, runs: r.runs
            }]);
            tone = clear ? "good" : "warn";
        }
        const find = function (id) { return r.algos.find(function (item) { return item.id === id; }); };
        const eps = find("eps");
        const ucb = find("ucb");
        // the sheet: at a short horizon and a small gap ε-greedy is often ahead of UCB1: say so
        if (eps && ucb && eps.mean < ucb.mean) parts.push(["epsAhead", { eps: eps.mean, ucb: ucb.mean, T: r.T }]);
        // with ε = 0 the line has another cause: pure greedy never explores ("never stops exploring" would be false)
        if (eps && eps.early > 0 && eps.late >= LINE_SHARE * eps.early) parts.push([r.epsValue === 0 ? "greedyLine" : "epsLine", { early: eps.early, late: eps.late }]);
        // "bend" and "not bent yet" are said of UCB1 and Thompson sampling only: their regret is
        // logarithmic, so their curves do bend sooner or later. Explore then commit with a fixed m
        // has a kink and then a straight line (its regret is linear in T), so it gets its own sentence.
        const others = r.algos.filter(function (item) { return item.id !== "eps" && item.id !== "etc" && item.early > 0; });
        const bent = others.filter(function (item) { return item.late < BEND_SHARE * item.early; }).map(function (item) { return item.id; });
        const straight = others.filter(function (item) { return !(item.late < BEND_SHARE * item.early); }).map(function (item) { return item.id; });
        if (bent.length) parts.push(["bend", { names: bent }]);
        if (straight.length) parts.push(["straight", { names: straight, T: r.T }]);
        const etc = find("etc");
        if (r.etcNever) parts.push(["etcNever", { mk: r.mk, T: r.T }]);
        else if (etc && etc.early > 0) parts.push(["etcShape", { early: etc.early, late: etc.late, mk: r.mk }]);
        return { tone: tone, parts: parts };
    }

    const maths = {
        klTerm: klTerm, klBernoulli: klBernoulli, references: references, curvesAt: curvesAt, gridFor: gridFor,
        seedText: seedText, simulateStart: simulateStart, simulate: simulate, summarise: summarise, verdictOf: verdictOf,
        ALGOS: ALGOS, LINE_SHARE: LINE_SHARE, BEND_SHARE: BEND_SHARE,
        limits: { ARM_MIN: ARM_MIN, ARM_MAX: ARM_MAX, MIN_ARMS: MIN_ARMS, MAX_ARMS: MAX_ARMS, MIN_T: MIN_T, MAX_T: MAX_T, MIN_RUNS: MIN_RUNS, MAX_RUNS: MAX_RUNS, MAX_M: MAX_M }
    };

    /* =========================================================
       3. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(ctx);
        const num = kit.num;

        // Numbers in the worked formulas: 5 significant digits, no thousands groups
        function w(value, digits) {
            return num(value, { digits: digits || 5, grouping: false });
        }
        function pct(share, digits) {
            return num(share, { percent: true, digits: digits || 4 });
        }
        function nameOf(id) {
            return t("research.bandit.alg." + id);
        }

        const panel = K.panel(stage, { questionKey: "research.bandit.question", titleKey: "research.bandit.title", onChange: refresh });
        panel.list({
            name: "arms", labelKey: "research.bandit.arms", hintKey: "research.bandit.armsHint", value: [0.3, 0.5, 0.7],
            minCount: MIN_ARMS, maxCount: MAX_ARMS, min: ARM_MIN, max: ARM_MAX, rows: 2
        });
        panel.field({ name: "T", labelKey: "research.bandit.T", kind: "int", min: MIN_T, max: MAX_T, value: 5000, powers: true });
        panel.field({ name: "runs", labelKey: "research.bandit.runs", kind: "int", min: MIN_RUNS, max: MAX_RUNS, value: 50, hintKey: "research.bandit.runsHint" });
        panel.field({ name: "seed", labelKey: "research.bandit.seed", kind: "int", min: 0, max: 4294967295, value: 1, hintKey: "research.bandit.seedHint" });
        ALGOS.forEach(function (id) {
            panel.toggle({ name: "use." + id, labelKey: "research.bandit.label." + id, checked: true, hintKey: "research.bandit.use." + id + "Hint" });
        });
        panel.field({ name: "eps", labelKey: "research.bandit.eps", kind: "prob", min: 0, max: 1, value: 0.1 });
        panel.field({ name: "m", labelKey: "research.bandit.m", kind: "int", min: 1, max: MAX_M, value: 50 });

        // How the chart looks: not inputs of the result (not copied), saved all the same
        const chartHead = document.createElement("h5");
        chartHead.className = "rk-subhead";
        K.text(chartHead, "research.bandit.chartHead");
        panel.inputs.appendChild(chartHead);
        const axis = K.choice(panel.inputs, {
            name: "axis", labelKey: "research.bandit.axis", value: "linear",
            options: [{ value: "linear", labelKey: "research.bandit.axis.linear" }, { value: "log", labelKey: "research.bandit.axis.log" }],
            onChange: drawChart
        });
        const showRef = {
            explore: K.toggle(panel.inputs, { name: "show.explore", labelKey: "research.bandit.show.explore", checked: true, onChange: drawChart }),
            laiRobbins: K.toggle(panel.inputs, { name: "show.laiRobbins", labelKey: "research.bandit.show.laiRobbins", checked: true, onChange: drawChart }),
            ucbBound: K.toggle(panel.inputs, { name: "show.ucbBound", labelKey: "research.bandit.show.ucbBound", checked: false, onChange: drawChart })
        };

        /* ----- the results ----- */
        const job = panel.job();
        const runButton = A.labKit.button("research.bandit.run", { variant: "primary", size: "sm", onClick: runAgain });
        runButton.element.classList.add("rk-bandit-run");
        runButton.element.hidden = true;
        panel.outputs.appendChild(runButton.element);
        // The job's own Stop button: after it, the results stay empty and "Run" comes back
        const stopButton = job.element.querySelector(".rk-job-stop");
        if (stopButton) stopButton.addEventListener("click", stoppedByHand);

        panel.heading("research.bandit.headSim");
        const simRow = panel.result({ name: "sim", labelKey: "research.bandit.sim", kind: "text" });
        const shown = {};            // the numbers the unit texts show: ± SE
        const regRows = {};
        ALGOS.forEach(function (id) {
            regRows[id] = panel.result({
                name: "reg." + id, labelKey: "research.bandit.label." + id,
                unitKey: function () { return t("research.bandit.pm", { se: num(shown["reg." + id]) }); }
            });
        });
        panel.heading("research.bandit.headBest");
        const bestRows = {};
        ALGOS.forEach(function (id) {
            bestRows[id] = panel.result({
                name: "best." + id, labelKey: "research.bandit.label." + id, kind: "percent",
                unitKey: function () { return t("research.bandit.pm", { se: pct(shown["best." + id], 2) }); }
            });
        });
        panel.remark({ key: "research.bandit.pseudoRemark" });
        panel.heading("research.bandit.headRef");
        const exploreRow = panel.result({ name: "explore", labelKey: "research.bandit.explore", hintKey: "research.bandit.exploreHint" });
        const lrRow = panel.result({ name: "laiRobbins", labelKey: "research.bandit.laiRobbins", hintKey: "research.bandit.laiRobbinsHint" });
        const ucbRow = panel.result({ name: "ucbBound", labelKey: "research.bandit.ucbBound", hintKey: "research.bandit.ucbBoundHint" });

        const chart = panel.chart({
            labelKey: "research.bandit.chart",
            height: 300,
            x: { labelKey: "research.bandit.axisT" },
            y: { labelKey: "research.bandit.axisR", min: 0 }
        }, "below");
        panel.formula({ key: "research.bandit.formula" });
        panel.source({ nameKey: "research.bandit.source", units: UNITS });

        /* ----- state ----- */
        let now = null;              // { settings, ref } of the inputs as they are
        let simKey = "";
        let simResult = null;
        let stopped = false;         // the reader pressed Stop
        let lastKey = "";            // the inputs of the last refresh

        function settingsOf(v) {
            return {
                arms: v.arms, T: v.T, runs: v.runs, seed: v.seed, eps: v.eps, m: v.m,
                algos: ALGOS.filter(function (id) { return v["use." + id]; })
            };
        }

        /* ----- the reference values: exact, at once ----- */
        function showReferences(ref, s) {
            const lnT = Math.log(s.T);
            const gapsText = ref.gaps.map(function (gap) { return w(gap); }).join(" + ");
            exploreRow.set(ref.explore, {
                formula: t("research.bandit.exploreWork", { eps: w(s.eps, 12), T: String(s.T), gaps: gapsText, K: String(ref.K), value: w(ref.explore) })
            });
            if (ref.equal) {
                lrRow.set(0, { formula: t("research.bandit.noWorse") });
                ucbRow.set(0, { formula: t("research.bandit.noWorse") });
                return;
            }
            const best = w(ref.best);
            const terms = ref.worse.map(function (i, j) { return w(ref.gaps[i]) + "/" + w(ref.kls[j]); }).join(" + ");
            const kls = ref.worse.map(function (i, j) { return "KL(" + w(s.arms[i]) + "‖" + best + ") = " + w(ref.kls[j]); }).join("; ");
            lrRow.set(ref.laiRobbins, {
                formula: t("research.bandit.laiRobbinsWork", { T: String(s.T), lnT: w(lnT, 6), terms: terms, sum: w(ref.lrConst, 6), value: w(ref.laiRobbins), kls: kls })
            });
            const inverse = ref.worse.map(function (i) { return "1/" + w(ref.gaps[i]); }).join(" + ");
            ucbRow.set(ref.ucbBound, {
                formula: t("research.bandit.ucbBoundWork", {
                    T: String(s.T), lnT: w(lnT, 6), inverse: inverse, inverseSum: w(ref.ucbLog / 8, 6), c: w(1 + Math.PI * Math.PI / 3, 5),
                    sumGap: w(ref.sumGap), value: w(ref.ucbBound)
                })
            });
        }

        /* ----- the simulation: a job, started again only when its inputs change ----- */
        function clearSim() {
            simRow.clear();
            ALGOS.forEach(function (id) {
                regRows[id].clear();
                bestRows[id].clear();
            });
        }

        function showSim(result, s) {
            simRow.set(t("research.bandit.simText", { runs: num(s.runs), T: num(s.T), seed: String(s.seed) }));
            s.algos.forEach(function (id) {
                const r = result.algos[id];
                shown["reg." + id] = r.seMean;
                shown["best." + id] = r.shareSe;
                regRows[id].set(r.mean, {
                    formula: t("research.bandit.regWork", {
                        runs: String(s.runs), T: String(s.T), mean: w(r.mean), sd: w(r.sd), se: w(r.seMean),
                        early: w(r.early), late: w(r.late), half: String(result.half)
                    })
                });
                bestRows[id].set(r.share, {
                    formula: t("research.bandit.bestWork", { runs: String(s.runs), T: String(s.T), share: w(r.share), sd: w(r.shareSd), se: w(r.shareSe) })
                });
            });
            sayVerdict(verdictOf(summarise(result, s)));
        }

        function sayVerdict(said) {
            panel.verdict.set(said.parts.map(sentence).join(" "), said.tone);
        }

        function startSim(s, key) {
            simResult = null;
            stopped = false;
            runButton.element.hidden = true;
            clearSim();
            const work = simulateStart(s);
            job.start(work, {
                chunk: CHUNK,
                onDone: function () {
                    simResult = work.result();
                    showSim(simResult, s);
                    drawChart();
                },
                onStop: function () {
                    if (simKey === key) simKey = "";
                }
            });
            // (after start: starting stops the job before, whose onStop must not clear this key)
            simKey = key;
            panel.verdict.set(t("research.bandit.running", { runs: num(s.runs), T: num(s.T) }), "info");
        }

        function stopSim() {
            simKey = "";
            simResult = null;
            job.quiet();
            clearSim();
        }

        function stoppedByHand() {
            stopped = true;
            simKey = "";
            simResult = null;
            clearSim();
            runButton.element.hidden = false;
            panel.verdict.set(t("research.bandit.verdict.stopped"), "warn");
            drawChart();
        }

        function runAgain() {
            stopped = false;
            simKey = "";
            refresh();
            if (job.running()) {
                const first = panel.element.querySelector(".rk-job-stop");
                if (first) first.focus();
            }
        }

        /* ----- the verdict: the pure rules of section 2, written in words ----- */
        function sentence(part) {
            const values = {};
            Object.keys(part[1]).forEach(function (name) {
                const value = part[1][name];
                if (name === "alg" || name === "alg2") values[name] = nameOf(value);
                else if (name === "names") values[name] = value.map(nameOf).join(", ");
                else values[name] = num(value);
            });
            return t("research.bandit.verdict." + part[0], values);
        }

        /* ----- the chart: the mean regret of each algorithm with ± SE, and the references ----- */
        function drawChart() {
            if (!now) {
                chart.clear();
                return;
            }
            const s = now.settings;
            const ref = now.ref;
            const logX = axis.value() === "log";
            const grid = gridFor(s.T);
            const series = [];
            const result = simResult && simKey === JSON.stringify(s) ? simResult : null;
            if (result) {
                s.algos.forEach(function (id) {
                    const r = result.algos[id];
                    series.push({
                        kind: "line", colorIndex: ALGOS.indexOf(id), labelKey: "research.bandit.label." + id,
                        data: result.grid.map(function (step, i) { return [step, r.curve[i]]; }),
                        band: result.grid.map(function (step, i) { return [step, Math.max(0, r.curve[i] - r.se[i]), r.curve[i] + r.se[i]]; })
                    });
                });
            }
            const reference = function (name, key, style) {
                if (!showRef[name].value()) return;
                series.push(Object.assign({
                    kind: "line", dash: true, labelKey: key,
                    data: grid.map(function (step) { return [step, curvesAt(ref, step)[name]]; })
                }, style));
            };
            reference("explore", "research.bandit.series.explore", { colorIndex: 0 });
            reference("laiRobbins", "research.bandit.series.laiRobbins", { color: "danger" });
            if (!ref.equal) reference("ucbBound", "research.bandit.series.ucbBound", { colorIndex: 1 });
            chart.set({
                x: { log: logX, labelKey: "research.bandit.axisT", min: 1, max: s.T },
                y: { labelKey: "research.bandit.axisR", min: 0 },
                series: series,
                describe: function () {
                    if (!result) return t("research.bandit.describeNone", { T: num(s.T) });
                    const list = s.algos.map(function (id) { return nameOf(id) + " " + num(result.algos[id].mean); }).join("; ");
                    return t("research.bandit.describe", { runs: num(s.runs), seed: String(s.seed), T: num(s.T), list: list });
                }
            });
        }

        function refresh() {
            const v = panel.values();
            if (!v) {
                now = null;
                stopSim();
                runButton.element.hidden = true;
                return;
            }
            const s = settingsOf(v);
            const ref = references(s.arms, s.T, s.eps);
            if (!ref) return;
            now = { settings: s, ref: ref };
            showReferences(ref, s);
            ALGOS.forEach(function (id) {
                const on = s.algos.indexOf(id) !== -1;
                regRows[id].hidden(!on);
                bestRows[id].hidden(!on);
            });
            const key = JSON.stringify(s);
            if (!s.algos.length) {
                stopSim();
                runButton.element.hidden = true;
                sayVerdict(verdictOf({ algos: [], equal: ref.equal, T: s.T, runs: s.runs }));
            } else if (key === simKey && simResult) {
                showSim(simResult, s);
            } else if (key === simKey && job.running()) {
                panel.verdict.set(t("research.bandit.running", { runs: num(s.runs), T: num(s.T) }), "info");
            } else if (stopped && key === lastKey) {
                // after Stop, a language switch does not start the run again: a change or "Run" does
                panel.verdict.set(t("research.bandit.verdict.stopped"), "warn");
            } else {
                startSim(s, key);
            }
            lastKey = key;
            drawChart();
        }

        refresh();
        return K.controller(refresh);
    }

    A.research.define("bandit", { create: create, maths: maths });
})();
