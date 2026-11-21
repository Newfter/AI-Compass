/* =========================================================
   AI COMPASS — THE RESEARCH LAB: THE EXPERIMENT STATION (tab "Experiments")
   Real small machine-learning experiments, trained in the browser a moment
   ago, the way research is done: a question, a prediction written down
   before the data, a plan, several seeds, error bars, a statistical test,
   a conclusion and a record in the lab notebook. Its unit of work is a
   STUDY: many training runs, compared honestly.
   The training itself: js/research/engine.js (A.researchEngine, loaded
   here). The statistics: js/research/math.js (A.researchMath). The
   controls, charts and the long-computation helper: the bench kit
   (js/research/kit.js) and the lab kit. Texts: js/content/research/station.js.
   Styles: css/research/station.css. The hub (js/research.js) loads this
   file when the tab first opens; it lives while the page is open.

   HONESTY. Every number comes from a network trained on this device. Each
   guided study has outcomes to predict and a decision rule, written down
   in its texts, that maps the measured numbers to one outcome or to "the
   data do not decide". Every sentence about the result is built from the
   measured numbers (S/r9/work/st/outcomes.md shows how often each outcome
   happens over many data seeds).

   Sections:
    1. Settings
    2. The guided studies
    3. Plans and jobs
    4. Summaries: groups of runs
    5. Analysis: the best value and Holm, two arms, the slope, resampling
    6. The decision rules of the guided studies
    7. Running a study (several phases, in small steps)
    8. The page: create(stage, ctx)
    9. Registering the station
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
    const ENGINE_FILE = "js/research/engine.js";
    const HISTORY_MAX = 20;            // earlier studies kept on this device
    const HISTORY_VERSION = 1;
    const ALPHA = 0.05;                // significance level of every test here
    const MARGIN = 0.02;               // "about the same": the 95% interval of an accuracy gap within ±2 points
    const MARGIN_ARMS = 0.01;          // ... within ±1 point for the two-arm study (10 seeds each)
    const FIT = 0.95;                  // "fits the noisy labels": a mean training accuracy on them of at least 95%
    const SOFT_LIMIT = 90;             // s: a longer study is refused (a laptop may "Run anyway")
    const HARD_LIMIT = 1200;           // s: refused on every device
    const CHUNK_MS = 4;                // ms of training in one piece of a slice of the job
    const LIVE_EVERY = 300;            // ms between two drawings of the live curves
    const RESAMPLE_DRAWS = 4000;       // pairs of groups drawn in the seed study
    const BOOT_ROUNDS = 200;           // bootstrap rounds for the interval of the 3-seed gap
    const BOOT_DRAWS = 600;
    const SEEDS = { min: 3, max: 20 };
    const VALUES = { min: 2, max: 8 };
    const TEXT_MAX = 4000;             // characters of a conclusion
    const HYPOTHESIS_MAX = 300;
    const TUNE_SEED = 100;             // tuning runs use seeds 101, 102, ... (never the compared ones)
    const FACTORS = ["lr", "width", "depth", "weightDecay", "batch", "nTrain", "labelNoise", "optimizer", "activation"];
    const METRICS = ["testAcc", "testLoss", "trainLoss"];
    const PERCENT = { testAcc: true, trainAcc: true, valAcc: true, testError: true };
    const HIGHER = { testAcc: true, trainAcc: true, valAcc: true };
    const FINAL = ["trainLoss", "testLoss", "trainAcc", "testAcc", "valAcc"];     // a run's final numbers, in this order

    function isNumber(value) {
        return typeof value === "number" && isFinite(value);
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function maths() {
        return A.researchMath;
    }

    /* =========================================================
       2. THE GUIDED STUDIES
       Each: a question (texts: research.st.q.<id>.*), a plan that runs in
       about ten seconds on a laptop, the outcomes to predict, and decide()
       (section 6). kind: sweep (one factor, many values), slope (the size of
       the training set), arms (two optimisers, each tuned), seeds (one
       setting, many seeds).
       ========================================================= */
    const STUDIES = [
        {
            id: "learning-rate", kind: "sweep", units: ["t2", "r3"], metric: "trainLoss",
            base: { task: "moons", noise: 0.2, nTrain: 200, depth: 2, width: 16, activation: "relu", optimizer: "sgd", lr: 0.1, batch: 32, epochs: 30, records: 15 },
            factor: "lr", values: [0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10], seeds: 10,
            outcomes: ["middle", "largest", "smallest", "flat"]
        },
        {
            id: "data-size", kind: "slope", units: ["r2", "t1"], metric: "testError",
            base: { task: "moons", noise: 0.2, freshSample: true, depth: 2, width: 16, activation: "tanh", optimizer: "adam", lr: 0.01, batch: 32, epochs: 1, records: 10 },
            factor: "nTrain", values: [25, 50, 100, 200, 400, 800], seeds: 8, updates: 600,
            outcomes: ["half", "one", "floor", "none"]
        },
        {
            id: "noisy-labels", kind: "sweep", units: ["r4"], metric: "testAcc",
            base: { task: "moons", noise: 0.1, nTrain: 60, labelNoise: 0.2, depth: 1, width: 16, activation: "relu", optimizer: "adam", lr: 0.02, batch: 0, epochs: 600, records: 10 },
            factor: "width", values: [4, 16, 64, 256], seeds: 6,
            outcomes: ["hurts", "benign", "nofit"]
        },
        {
            id: "adam-sgd", kind: "arms", units: ["r12", "r3"], metric: "testAcc",
            base: { task: "circles", noise: 0.1, nTrain: 200, nVal: 500, depth: 2, width: 16, activation: "tanh", optimizer: "adam", lr: 0.01, batch: 32, epochs: 30, records: 10 },
            factor: "optimizer", values: ["momentum", "adam"], seeds: 10,
            tune: { rates: { momentum: [0.01, 0.03, 0.1], adam: [0.003, 0.01, 0.03] }, seeds: 3 },
            outcomes: ["adam", "sgd", "same"]
        },
        {
            id: "weight-decay", kind: "sweep", units: ["r3", "r4"], metric: "testAcc",
            base: { task: "moons", noise: 0.25, nTrain: 40, labelNoise: 0.1, depth: 2, width: 32, activation: "tanh", optimizer: "adam", lr: 0.01, batch: 0, epochs: 300, records: 10 },
            factor: "weightDecay", values: [0, 1, 3, 10, 30], seeds: 5,
            outcomes: ["middle", "more", "nohelp", "none"]
        },
        {
            id: "batch-size", kind: "sweep", units: ["r3", "t2"], metric: "testAcc",
            base: { task: "moons", noise: 0.2, nTrain: 256, depth: 2, width: 16, activation: "tanh", optimizer: "sgd", lr: 0.05, batch: 32, epochs: 10, records: 10 },
            factor: "batch", values: [8, 32, 128, 256], seeds: 6,
            readings: [{ id: "epochs" }, { id: "updates", updates: 320 }],
            outcomes: ["small", "large", "none"]
        },
        {
            id: "seeds", kind: "seeds", units: ["r12"], metric: "testAcc",
            base: { task: "moons", noise: 0.25, nTrain: 100, depth: 2, width: 16, activation: "tanh", optimizer: "adam", lr: 0.01, batch: 32, epochs: 20, records: 10 },
            factor: null, values: [null], seeds: 20,
            outcomes: ["tiny", "some", "large"]
        },
        {
            id: "depth-width", kind: "sweep", units: ["r4", "r1"], metric: "testAcc",
            base: { task: "spirals", noise: 0.05, nTrain: 300, depth: 2, width: 19, activation: "relu", optimizer: "adam", lr: 0.01, batch: 32, epochs: 80, records: 10 },
            factor: "arch", values: [1, 2, 3, 4], widths: { 1: 100, 2: 19, 3: 14, 4: 12 }, seeds: 8,
            outcomes: ["deeper", "plateau", "shallow", "none"]
        }
    ];
    const OWN = "own";
    const byId = {};
    STUDIES.forEach(function (study) { byId[study.id] = study; });

    /* =========================================================
       3. PLANS AND JOBS
       A plan is what runs (and what the history keeps): plain data.
         { study, kind, base, factor, values, seeds, dataSeed, metric,
           readings, updates, widths, tune }
       Runs go seed by seed (seed 1 for every value, then seed 2...), so a
       study that is stopped early still has every value, with fewer seeds.
       ========================================================= */
    function planFor(study, dataSeed) {
        return {
            study: study.id, kind: study.kind, base: clone(study.base), factor: study.factor, values: study.values.slice(),
            seeds: study.seeds, dataSeed: dataSeed, metric: study.metric,
            readings: study.readings ? clone(study.readings) : null, updates: study.updates || 0,
            widths: study.widths ? clone(study.widths) : null, tune: study.tune ? clone(study.tune) : null
        };
    }

    function readingsOf(plan) {
        return plan.readings && plan.readings.length ? plan.readings : [{ id: "main" }];
    }

    function nTrainOf(plan, value) {
        return plan.factor === "nTrain" ? value : plan.base.nTrain || 200;
    }

    // The configuration of one value (and reading); rates: the tuned learning rates
    function variant(plan, value, reading, rates) {
        const c = clone(plan.base);
        if (plan.factor === "arch") {
            c.depth = value;
            c.width = plan.widths[value];
        } else if (plan.factor) {
            c[plan.factor] = value;
        }
        if (plan.factor === "optimizer" && rates && isNumber(rates[value])) c.lr = rates[value];
        const n = c.nTrain || 200;
        const batch = c.batch > 0 && c.batch < n ? c.batch : n;
        const updates = (reading && reading.updates) || plan.updates;
        if (updates) c.epochs = Math.max(1, Math.round(updates / Math.ceil(n / batch)));
        return c;
    }

    function jobsFor(plan, phase, rates) {
        const jobs = [];
        if (phase === "tune") {
            for (let s = 1; s <= plan.tune.seeds; s++) {
                plan.values.forEach(function (arm) {
                    plan.tune.rates[arm].forEach(function (lr) {
                        const c = variant(plan, arm, null, null);
                        c.lr = lr;
                        jobs.push({ config: c, seed: TUNE_SEED + s, dataSeed: plan.dataSeed, tag: { phase: "tune", value: arm, lr: lr, reading: "main" } });
                    });
                });
            }
            return jobs;
        }
        for (let s = 1; s <= plan.seeds; s++) {
            readingsOf(plan).forEach(function (reading) {
                plan.values.forEach(function (value) {
                    jobs.push({ config: variant(plan, value, reading, rates), seed: s, dataSeed: plan.dataSeed, tag: { phase: "main", value: value, reading: reading.id } });
                });
            });
        }
        return jobs;
    }

    function phasesOf(plan) {
        return plan.tune ? ["tune", "main"] : ["main"];
    }

    // Operations of the whole plan (the tuned rates do not change the cost)
    function planCost(plan, E) {
        let total = 0;
        phasesOf(plan).forEach(function (phase) {
            jobsFor(plan, phase, null).forEach(function (job) { total += E.cost(job.config); });
        });
        return total;
    }

    function jobCount(plan, phase) {
        if (phase === "tune") return plan.tune.seeds * plan.values.reduce(function (n, arm) { return n + plan.tune.rates[arm].length; }, 0);
        return plan.seeds * readingsOf(plan).length * plan.values.length;
    }

    // Every configuration of the plan, checked by the engine -> [] or the problems
    function planProblems(plan, E) {
        const problems = [];
        readingsOf(plan).forEach(function (reading) {
            plan.values.forEach(function (value) {
                E.check(variant(plan, value, reading, null)).forEach(function (problem) { problems.push(problem); });
            });
        });
        return problems;
    }

    /* =========================================================
       4. SUMMARIES: GROUPS OF RUNS
       A run is kept as { s: seed, d: diverged epoch (0: it did not),
       f: [trainLoss, testLoss, trainAcc, testAcc, valAcc] or null }: the
       summary numbers only (no curves). A group: the runs of one value (and
       reading): { value, reading, lr, runs: [...] }.
       ========================================================= */
    function compactRun(item) {
        const r = item.result;
        if (r.diverged) return { s: r.seed, d: r.divergedEpoch, f: null };
        return { s: r.seed, d: 0, f: FINAL.map(function (name) { return isNumber(r.final[name]) ? r.final[name] : null; }) };
    }

    function metricOf(run, metric) {
        if (!run || run.d || !run.f) return null;
        if (metric === "testError") return run.f[3] === null ? null : 1 - run.f[3];
        const value = run.f[FINAL.indexOf(metric)];
        return isNumber(value) ? value : null;
    }

    function sameValue(a, b) {
        return a === b || (a === null && b === null);
    }

    // runs: [{ tag, result }] from the runner -> { groups, tune }
    function groupRuns(plan, finished) {
        const groups = [];
        readingsOf(plan).forEach(function (reading) {
            plan.values.forEach(function (value) {
                const mine = finished.filter(function (item) {
                    return item.tag.phase === "main" && item.tag.reading === reading.id && sameValue(item.tag.value, value);
                });
                groups.push({ value: value, reading: reading.id, runs: mine.map(compactRun) });
            });
        });
        const tune = [];
        if (plan.tune) {
            plan.values.forEach(function (arm) {
                plan.tune.rates[arm].forEach(function (lr) {
                    const mine = finished.filter(function (item) { return item.tag.phase === "tune" && item.tag.value === arm && item.tag.lr === lr; });
                    tune.push({ value: arm, lr: lr, reading: "main", runs: mine.map(compactRun) });
                });
            });
        }
        return { groups: groups, tune: tune };
    }

    // The numbers of a group for a metric
    function stats(group, metric) {
        const M = maths();
        const values = group.runs.map(function (run) { return metricOf(run, metric); }).filter(isNumber);
        const n = values.length;
        return {
            values: values,
            n: n,
            runs: group.runs.length,
            diverged: group.runs.filter(function (run) { return run.d > 0; }).length,
            mean: n ? M.mean(values) : null,
            sd: n > 1 ? M.sd(values) : null,
            se: n > 1 ? M.sem(values) : null,
            min: n ? M.min(values) : null,
            max: n ? M.max(values) : null
        };
    }

    // The learning rate each arm gets: the best mean validation accuracy of its candidates
    function chooseRates(plan, tune) {
        const rates = {};
        plan.values.forEach(function (arm) {
            let best = null;
            tune.filter(function (group) { return group.value === arm; }).forEach(function (group) {
                const s = stats(group, "valAcc");
                if (s.n && (best === null || s.mean > best.mean)) best = { lr: group.lr, mean: s.mean };
            });
            rates[arm] = best ? best.lr : plan.tune.rates[arm][plan.tune.rates[arm].length - 1];
        });
        return rates;
    }

    /* =========================================================
       5. ANALYSIS
       compare(groups, metric): the best value, and each other value against
       it by Welch's t-test. The p-values are adjusted by Holm's method over
       EVERY pair of values that can be tested (m pairs), not only over the
       pairs with the best: the best is picked from these same runs, so a
       correction for the k − 1 comparisons that are shown would call a value
       "worse" too often when nothing differs (measured: 9% of studies, not
       5%, with 8 values and 6 seeds; 12% with 20 seeds).
       status: best | worse (adjusted p < 0.05) | tied (cannot
       be told apart) | broken (diverged in at least half of its runs) |
       untested (fewer than 2 finished runs). equivalent: the 95% interval of
       the gap to the best lies within ±margin (2 points of accuracy).
       Means, errors and tests use the runs that did not diverge.
       ========================================================= */
    function higher(metric) {
        return Boolean(HIGHER[metric]);
    }

    function marginFor(metric, bestMean) {
        return PERCENT[metric] ? MARGIN : Math.max(0.01, 0.1 * Math.abs(bestMean || 0));
    }

    function compare(groups, metric) {
        const M = maths();
        const up = higher(metric);
        const all = groups.map(function (group) { return stats(group, metric); });
        const info = all.map(function (s) {
            return { status: "untested", p: null, adj: null, gap: null, lo: null, hi: null, equivalent: false, broken: s.diverged > 0 && 2 * s.diverged >= s.runs };
        });
        let best = -1;
        [2, 1].some(function (need) {
            all.forEach(function (s, i) {
                if (info[i].broken || s.n < need) return;
                if (best === -1 || (up ? s.mean > all[best].mean : s.mean < all[best].mean)) best = i;
            });
            return best !== -1;
        });
        if (best === -1) {
            info.forEach(function (item) { if (item.broken) item.status = "broken"; });
            return { best: -1, info: info, stats: all, m: 0, margin: marginFor(metric, 0), higher: up };
        }
        const margin = marginFor(metric, all[best].mean);
        const tested = [];
        all.forEach(function (s, i) {
            if (i === best || info[i].broken || s.n < 2 || all[best].n < 2) return;
            const w = M.welch(all[best].values, s.values, 0.95);
            if (!w) return;
            // gap: how much better the best is (positive), with its 95% interval
            info[i].p = w.p;
            info[i].gap = up ? w.diff : -w.diff;
            info[i].lo = up ? w.lo : -w.hi;
            info[i].hi = up ? w.hi : -w.lo;
            tested.push(i);
        });
        // Holm's family: the pairs with the best (first, in the order of `tested`), then every
        // other pair of tested values
        const family = tested.map(function (i) { return info[i].p; });
        for (let a = 0; a < tested.length; a++) {
            for (let b = a + 1; b < tested.length; b++) {
                const w = M.welch(all[tested[a]].values, all[tested[b]].values, 0.95);
                family.push(w ? w.p : 1);
            }
        }
        const adjusted = M.holm(family);
        tested.forEach(function (i, k) {
            info[i].adj = adjusted[k];
            info[i].status = adjusted[k] < ALPHA && info[i].gap > 0 ? "worse" : "tied";
            info[i].equivalent = Math.max(Math.abs(info[i].lo), Math.abs(info[i].hi)) < margin;
        });
        info.forEach(function (item, i) {
            if (i === best) {
                item.status = "best";
                item.equivalent = true;
            } else if (item.broken) {
                item.status = "broken";
            }
        });
        return { best: best, info: info, stats: all, m: family.length, margin: margin, higher: up };
    }

    function bad(status) {
        return status === "worse" || status === "broken";
    }

    // "As good as the best": the best itself, or a value that cannot be told from it AND whose
    // gap has a 95% interval inside the margin. "Cannot be told apart" alone is not "the same":
    // with a few seeds a gap of many points can stay untold.
    function same(c, i) {
        const item = c.info[i];
        return item.status === "best" || (item.status === "tied" && item.equivalent);
    }

    // The slope of log error against log n (the training-set size): one line per run seed, then
    // the mean over the seeds; over all sizes, and over the smaller and the larger half of the
    // sizes (an odd count: the middle size is in both). A test error of 0 counts as half a test
    // example. With a loss as the metric it is the slope of log loss: nothing is floored, and
    // a loss of exactly 0 (it has no logarithm) is left out and counted in `zero`.
    function slope(plan, groups, metric) {
        const M = maths();
        const share = metric === "testAcc" || metric === "testError";
        const floor = share ? 0.5 / (plan.base.nTest || 1000) : 0;
        let floored = 0;
        let zero = 0;
        function errorOf(run) {
            const v = metricOf(run, metric);
            if (v === null) return null;
            return metric === "testAcc" || metric === "trainAcc" ? 1 - v : v;
        }
        // One least-squares line per run seed (its runs at these sizes) -> { seed: slope }.
        // The seeds are the independent units: the runs of one seed at several sizes share
        // their initial weights and, with a fresh sample per seed, nested training samples,
        // so they are not independent points of one line (the least-squares error of a line
        // through all runs came out about 15% too small: S/r9/work/RN/st).
        function slopesOf(list) {
            const bySeed = {};
            list.forEach(function (group) {
                group.runs.forEach(function (run) {
                    const e = errorOf(run);
                    if (e === null || !(Math.max(e, floor) > 0)) return;
                    if (!bySeed[run.s]) bySeed[run.s] = { xs: [], ys: [] };
                    bySeed[run.s].xs.push(Math.log(group.value));
                    bySeed[run.s].ys.push(Math.log(Math.max(e, floor)));
                });
            });
            const out = {};
            Object.keys(bySeed).forEach(function (seed) {
                const line = bySeed[seed].xs.length >= 2 ? M.linearFit(bySeed[seed].xs, bySeed[seed].ys) : null;
                if (line && isNumber(line.slope)) out[seed] = line.slope;
            });
            return out;
        }
        // The mean of some numbers (one per seed), its standard error and 95% interval (Student's t)
        function summary(values) {
            if (values.length < 2) return null;
            const mean = M.mean(values);
            const se = M.sem(values);
            if (!isNumber(mean) || !isNumber(se)) return null;
            const df = values.length - 1;
            const crit = M.tFor(0.95, df);
            return { slope: mean, se: se, df: df, lo: mean - crit * se, hi: mean + crit * se, n: values.length };
        }
        function fit(bySeed) {
            return summary(Object.keys(bySeed).map(function (seed) { return bySeed[seed]; }));
        }
        const sorted = groups.filter(function (group) { return group.value > 0; }).slice().sort(function (a, b) { return a.value - b.value; });
        sorted.forEach(function (group) {
            group.runs.forEach(function (run) {
                const e = errorOf(run);
                if (e !== null && e < floor) floored += 1;
                if (e !== null && !share && !(e > 0)) zero += 1;
            });
        });
        if (sorted.length < 3) return null;
        const half = Math.ceil(sorted.length / 2);
        const all = fit(slopesOf(sorted));
        const earlyBySeed = slopesOf(sorted.slice(0, half));
        const lateBySeed = slopesOf(sorted.slice(sorted.length - half));
        const early = fit(earlyBySeed);
        const late = fit(lateBySeed);
        // late − early, seed by seed (paired): its mean, standard error and 95% interval; z: its t
        const change = summary(Object.keys(lateBySeed).filter(function (seed) { return earlyBySeed[seed] !== undefined; }).map(function (seed) { return lateBySeed[seed] - earlyBySeed[seed]; }));
        const z = change && change.se > 0 ? change.slope / change.se : null;
        const first = stats(sorted[0], metric);
        const last = stats(sorted[sorted.length - 1], metric);
        const err = function (s) { return s.mean === null ? null : metric === "testAcc" ? 1 - s.mean : s.mean; };
        return { all: all, early: early, late: late, change: change, z: z, floored: floored, floor: floor, zero: zero, loss: !share, n0: sorted[0].value, n1: sorted[sorted.length - 1].value, e0: err(first), e1: err(last) };
    }

    // Two arms: Welch's t-test of second − first, its interval and the effect size
    function arms(groups, metric) {
        const M = maths();
        if (groups.length !== 2) return null;
        const a = stats(groups[0], metric);
        const b = stats(groups[1], metric);
        if (a.n < 2 || b.n < 2) return { first: a, second: b, test: null };
        const w = M.welch(b.values, a.values, 0.95);
        const size = M.effectSize(b.values, a.values);
        return { first: a, second: b, test: w, g: size ? size.g : null, d: size ? size.d : null };
    }

    // The seed study: from the runs of one setting, draw two disjoint groups of k runs
    // ("two identical methods") again and again, and look at the gap between their means
    function gapsOf(values, k, draws, r) {
        const n = values.length;
        const pool = values.slice();
        const gaps = new Float64Array(draws);
        for (let d = 0; d < draws; d++) {
            // a partial shuffle: the first 2k places
            for (let i = 0; i < 2 * k; i++) {
                const j = i + r.int(n - i);
                const keep = pool[i];
                pool[i] = pool[j];
                pool[j] = keep;
            }
            let a = 0;
            let b = 0;
            for (let i = 0; i < k; i++) {
                a += pool[i];
                b += pool[k + i];
            }
            gaps[d] = Math.abs(a - b) / k;
        }
        return Array.from(gaps);
    }

    function resample(values, dataSeed) {
        const M = maths();
        const n = values.length;
        if (n < 6) return null;
        const r = M.rng("st-resample-" + dataSeed);
        const ks = [3, 5, 10].filter(function (k) { return 2 * k <= n; });
        const gaps = {};
        ks.forEach(function (k) { gaps[k] = gapsOf(values, k, RESAMPLE_DRAWS, r); });
        const x3 = M.quantile(gaps[3], 0.95);
        const rows = ks.map(function (k) {
            const list = gaps[k];
            return { k: k, x: M.quantile(list, 0.95), y: list.filter(function (g) { return g >= x3; }).length / list.length, median: M.median(list) };
        });
        // how sure is the 3-seed gap? a bootstrap over the runs themselves
        const boot = [];
        const sample = new Array(n);
        for (let b = 0; b < BOOT_ROUNDS; b++) {
            for (let i = 0; i < n; i++) sample[i] = values[r.int(n)];
            boot.push(M.quantile(gapsOf(sample, 3, BOOT_DRAWS, r), 0.95));
        }
        return { n: n, sd: M.sd(values), min: M.min(values), max: M.max(values), mean: M.mean(values), rows: rows, x3: x3, lo: M.quantile(boot, 0.05), hi: M.quantile(boot, 0.95), draws: RESAMPLE_DRAWS };
    }

    // Everything the results show: plan + groups (+ tune) -> analysis
    function analyse(plan, groups, tune) {
        const out = { readings: {}, slope: null, arms: null, seeds: null };
        readingsOf(plan).forEach(function (reading) {
            const mine = groups.filter(function (group) { return group.reading === reading.id; });
            out.readings[reading.id] = { groups: mine, compare: compare(mine, plan.metric) };
        });
        const main = out.readings[readingsOf(plan)[0].id];
        if (plan.factor === "nTrain" && plan.values.length >= 3) out.slope = slope(plan, main.groups, plan.metric);
        if (plan.values.length === 2) out.arms = arms(main.groups, plan.metric);
        if (plan.kind === "seeds") {
            const s = stats(main.groups[0], plan.metric);
            out.seeds = resample(s.values, plan.dataSeed);
        }
        if (plan.tune && tune) out.rates = chooseRates(plan, tune);
        out.decision = decide(plan, out);
        return out;
    }

    /* =========================================================
       6. THE DECISION RULES OF THE GUIDED STUDIES
       decide(plan, analysis) -> { outcome: an id of the study's outcomes or
       "undecided", facts: { ... the numbers the sentence names } }.
       The rules in words are the texts research.st.q.<id>.rule.
       ========================================================= */
    function statusList(c) {
        return c.info.map(function (item) { return item.status; });
    }

    function decideRate(c) {
        const b = c.best;
        if (b < 0) return { outcome: "undecided", facts: {} };
        const status = statusList(c);
        const below = [];
        const above = [];
        status.forEach(function (s, i) {
            if (i < b && bad(s)) below.push(i);
            if (i > b && bad(s)) above.push(i);
        });
        const facts = { best: b, below: below, above: above, broken: status.map(function (s, i) { return s === "broken" ? i : -1; }).filter(function (i) { return i >= 0; }) };
        if (!status.some(bad)) {
            // "Hardly matters" has to be shown, not only not refuted: every other rate was
            // tested, and the 95% interval of its gap to the best ends below half of the best
            // loss (so no mean is 1.5 times the best or more). Means within a factor of 1.5
            // alone would also call one seed per rate, or very noisy runs, "hardly matters".
            const limit = 0.5 * Math.abs(c.stats[b].mean);
            const near = c.info.every(function (item, i) { return i === b || (item.status === "tied" && item.hi < limit); });
            return { outcome: near ? "flat" : "undecided", facts: facts };
        }
        // "the same" on one side: nothing there told apart from the best, and within the margin
        const side = function (from, to) {
            for (let i = from; i < to; i++) if (!same(c, i)) return false;
            return true;
        };
        if (below.length && above.length) return { outcome: "middle", facts: facts };
        if (below.length && side(b + 1, status.length)) return { outcome: "largest", facts: facts };
        if (above.length && side(0, b)) return { outcome: "smallest", facts: facts };
        return { outcome: "undecided", facts: facts };
    }

    function decideData(s) {
        if (!s || !s.all) return { outcome: "undecided", facts: {} };
        const facts = { slope: s };
        // a floor: the larger half is flat by its own slope (between −0.25 and 0.25) and flatter
        // than the smaller half, where the error falls; and the 95% interval of the change of
        // the slope, seed by seed, lies above 0
        const flat = s.late && Math.abs(s.late.slope) < 0.25 && s.early && Math.abs(s.late.slope) < Math.abs(s.early.slope);
        if (flat && s.change && s.change.lo > 0 && s.early.hi < 0) return { outcome: "floor", facts: facts };
        if (s.all.hi <= -0.75) return { outcome: "one", facts: facts };
        if (s.all.lo >= -0.75 && s.all.hi <= -0.25) return { outcome: "half", facts: facts };
        if (s.all.lo >= -0.25) return { outcome: "none", facts: facts };
        return { outcome: "undecided", facts: facts };
    }

    function decideNoisy(c) {
        const w = c.info.length - 1;
        if (c.best < 0) return { outcome: "undecided", facts: {} };
        const fit = c.fitWidest;
        const facts = { widest: w, fit: fit };
        const status = c.info[w].status;
        // "Fits the noise" is measured on its own (the mean training accuracy on the noisy
        // labels), so that no outcome claims a fit that was not there. A width that diverged
        // has no fit to speak of.
        if (status === "broken" || !isNumber(fit)) return { outcome: "undecided", facts: facts };
        if (fit < FIT) return { outcome: "nofit", facts: facts };
        if (status === "worse") return { outcome: "hurts", facts: facts };
        if (same(c, w)) return { outcome: "benign", facts: facts };
        return { outcome: "undecided", facts: facts };
    }

    function decideArms(a) {
        if (!a || !a.test) return { outcome: "undecided", facts: {} };
        const w = a.test;
        if (w.p < ALPHA) return { outcome: w.diff > 0 ? "adam" : "sgd", facts: {} };
        if (w.lo > -MARGIN_ARMS && w.hi < MARGIN_ARMS) return { outcome: "same", facts: {} };
        return { outcome: "undecided", facts: {} };
    }

    function allEquivalent(c) {
        return c.best >= 0 && c.info.every(function (item) { return item.equivalent; });
    }

    function decideDecay(c) {
        if (c.best < 0) return { outcome: "undecided", facts: {} };
        const status = statusList(c);
        const last = status.length - 1;
        const zeroBad = bad(status[0]);
        const topBad = bad(status[last]);
        // "as good as the best" (same) where an outcome says that a value does not help or is
        // the best: a value that only "cannot be told apart" may still be many points behind
        if (zeroBad && topBad) return { outcome: "middle", facts: {} };
        if (zeroBad && same(c, last)) return { outcome: "more", facts: {} };
        if (topBad && same(c, 0)) return { outcome: "nohelp", facts: {} };
        if (!status.some(bad) && allEquivalent(c)) return { outcome: "none", facts: {} };
        return { outcome: "undecided", facts: {} };
    }

    function decideBatch(c) {
        if (c.best < 0) return { outcome: "undecided", facts: {} };
        const status = statusList(c);
        const last = status.length - 1;
        if (!status.some(bad) && allEquivalent(c)) return { outcome: "none", facts: {} };
        if (same(c, 0) && bad(status[last])) return { outcome: "small", facts: {} };
        if (same(c, last) && bad(status[0])) return { outcome: "large", facts: {} };
        return { outcome: "undecided", facts: {} };
    }

    function decideSeeds(r) {
        if (!r) return { outcome: "undecided", facts: {} };
        const bin = function (x) { return x < 0.01 ? "tiny" : x < 0.05 ? "some" : "large"; };
        // the band of the whole interval, as the rule says (not the band of the point estimate)
        return { outcome: bin(r.lo) === bin(r.hi) ? bin(r.lo) : "undecided", facts: { low: bin(r.lo), high: bin(r.hi) } };
    }

    function decideDepth(c) {
        if (c.best < 0) return { outcome: "undecided", facts: {} };
        const status = statusList(c);
        const last = status.length - 1;
        if (!status.some(bad) && allEquivalent(c)) return { outcome: "none", facts: {} };
        // every depth from the second on is as good as the best
        let level = true;
        for (let i = 1; i <= last; i++) if (!same(c, i)) level = false;
        if (bad(status[0]) && bad(status[1]) && same(c, last)) return { outcome: "deeper", facts: {} };
        if (bad(status[0]) && level) return { outcome: "plateau", facts: {} };
        if (same(c, 0) && bad(status[last])) return { outcome: "shallow", facts: {} };
        return { outcome: "undecided", facts: {} };
    }

    function decide(plan, analysis) {
        const first = analysis.readings[readingsOf(plan)[0].id];
        const c = first ? first.compare : null;
        switch (plan.study) {
            case "learning-rate": return decideRate(c);
            case "data-size": return decideData(analysis.slope);
            case "noisy-labels":
                c.fitWidest = (function () {
                    const g = first.groups[first.groups.length - 1];
                    const s = stats(g, "trainAcc");
                    return s.mean;
                })();
                return decideNoisy(c);
            case "adam-sgd": return decideArms(analysis.arms);
            case "weight-decay": return decideDecay(c);
            case "batch-size": {
                const result = decideBatch(c);
                const second = analysis.readings.updates;
                result.facts.second = second ? decideBatch(second.compare).outcome : null;
                return result;
            }
            case "seeds": return decideSeeds(analysis.seeds);
            case "depth-width": return decideDepth(c);
            default: return { outcome: null, facts: {} };
        }
    }

    /* =========================================================
       7. RUNNING A STUDY
       makeRunner(plan, E) -> { step(ms), progress(), done, finished (the runs
       that ended: [{ tag, result }]), live(), phase(), counts() }
       The phases run one after the other: the two-arm study first tunes the
       learning rate of each optimiser on a validation set (seeds 101...),
       then compares the two at those rates (seeds 1...).
       ========================================================= */
    function makeRunner(plan, E) {
        const phases = phasesOf(plan);
        const costs = phases.map(function (phase) {
            return jobsFor(plan, phase, null).reduce(function (sum, job) { return sum + E.cost(job.config); }, 0);
        });
        const totalCost = costs.reduce(function (a, b) { return a + b; }, 0) || 1;
        const totalRuns = phases.reduce(function (n, phase) { return n + jobCount(plan, phase); }, 0);
        let index = 0;
        let doneCost = 0;
        let batch = E.batch(jobsFor(plan, phases[0], null));
        let taken = 0;
        const runner = { done: false, finished: [], rates: null };

        runner.step = function (ms) {
            if (runner.done) return true;
            batch.step(ms);
            while (taken < batch.results.length) {
                const item = batch.results[taken];
                runner.finished.push({ tag: item.tag, result: item.result });
                taken += 1;
            }
            if (batch.done) {
                doneCost += costs[index];
                index += 1;
                if (index >= phases.length) {
                    runner.done = true;
                    return true;
                }
                if (phases[index] === "main" && plan.tune) runner.rates = chooseRates(plan, groupRuns(plan, runner.finished).tune);
                batch = E.batch(jobsFor(plan, phases[index], runner.rates));
                taken = 0;
            }
            return false;
        };
        runner.progress = function () {
            if (runner.done) return 1;
            return Math.min(1, (doneCost + batch.progress() * costs[index]) / totalCost);
        };
        runner.live = function () { return runner.done ? null : batch.live(); };
        runner.phase = function () { return phases[Math.min(index, phases.length - 1)]; };
        runner.counts = function () { return { done: runner.finished.length, total: totalRuns }; };
        runner.mainTotal = jobCount(plan, "main");
        return runner;
    }

    /* =========================================================
       8. THE PAGE: create(stage, ctx)
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const lk = A.labKit;
        const K = kit.use(ctx);
        const store = ctx.store;
        let E = A.researchEngine || null;
        let destroyed = false;
        let paused = false;
        let speed = 0;                   // operations per ms on this device (measured)
        const ui = {};
        const state = {
            study: STUDIES[0].id,
            phase: "plan",               // plan | running | done
            prediction: null,
            record: null,                // the study on screen: { plan, prediction, hypothesis, groups, tune, analysis, partial, done, total, conclusion, id, time, reopened }
            runner: null,
            started: 0,
            quarter: 0,
            lastLive: 0,
            curves: null,                // the curves of this visit, by group key (not saved)
            reading: null,
            override: false
        };

        /* ----- small helpers ----- */
        function el(tag, className, attributes) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            Object.keys(attributes || {}).forEach(function (name) { element.setAttribute(name, attributes[name]); });
            return element;
        }

        function text(element, label) {
            K.text(element, label);
            return element;
        }

        function num(value, options) {
            return kit.num(value, options);
        }

        function pct(value) {
            return kit.num(value, { percent: true });
        }

        function metricText(metric, value) {
            if (!isNumber(value)) return kit.DASH;
            return PERCENT[metric] ? pct(value) : num(value);
        }

        function seText(metric, value) {
            if (!isNumber(value)) return kit.DASH;
            return PERCENT[metric] ? kit.num(value * 100, { digits: 2 }) + "%" : num(value, { digits: 2 });
        }

        // Two significant digits, and more of them next to the threshold: a p of 0.0497 must not
        // be shown as "0.05" beside the mark for "below 0.05" (nor 0.0503 without the mark)
        function pText(p) {
            if (!isNumber(p)) return kit.DASH;
            if (p < 0.0001) return "< " + num(0.0001);
            let digits = 2;
            while (digits < 6 && p !== ALPHA && Number(p.toPrecision(digits)) === ALPHA) digits += 1;
            return num(p, { digits: digits });
        }

        // How many seeds each value really got (a stopped study has fewer than planned)
        function seedsRun(record) {
            const first = record.analysis.readings[readingsOf(record.plan)[0].id];
            const counts = first.groups.map(function (group) { return group.runs.length; });
            const lo = Math.min.apply(null, counts);
            const hi = Math.max.apply(null, counts);
            return lo === hi ? num(lo) : num(lo) + "–" + num(hi);
        }

        function duration(seconds) {
            const s = Math.max(1, Math.round(seconds));
            if (s < 60) return t("research.st.sec", { n: A.format.number(s) });
            return t("research.st.minSec", { m: A.format.number(Math.floor(s / 60)), s: A.format.number(s % 60) });
        }

        function studyOf(id) {
            return byId[id] || null;
        }

        function questionOf(plan) {
            return plan.study === OWN ? t("research.st.own") : t("research.st.q." + plan.study + ".title");
        }

        function outcomeText(studyId, outcome) {
            return outcome === "undecided" ? t("research.st.undecided") : t("research.st.q." + studyId + ".o." + outcome);
        }

        function factorName(plan) {
            return plan.factor ? t("research.st.factor." + plan.factor) : t("research.st.factor.none");
        }

        function valueText(plan, value) {
            switch (plan.factor) {
                case "labelNoise": return pct(value);
                case "optimizer": return t("research.st.opt." + value);
                case "activation": return t("research.st.act." + value);
                case "arch": return t("research.st.archValue", { depth: A.format.number(value), width: A.format.number(plan.widths[value]) });
                case "batch": return value === 0 || value >= nTrainOf(plan, value) ? t("research.st.fullBatch", { n: num(nTrainOf(plan, value)) }) : num(value);
                case null: return t("research.st.oneSetting");
                default: return num(value);
            }
        }

        function readingName(id) {
            return t("research.st.reading." + id);
        }

        function canRunAnyway() {
            try {
                return window.matchMedia("(pointer: fine)").matches;
            } catch (error) {
                return false;
            }
        }

        function button(label, options, attribute) {
            const b = lk.button(label, options);
            if (attribute) b.element.setAttribute("data-st", attribute);
            return b;
        }

        /* =========================================================
           8a. THE FRAME: header, steps, the three sections, the history
           ========================================================= */
        const root = el("div", "rs-station");
        stage.appendChild(root);
        const head = el("header", "rs-station-head");
        const title = text(el("h3", "rs-station-title", { tabindex: "-1" }), "research.st.title");
        const lead = text(el("p", "rs-station-lead"), "research.st.lead");
        const steps = el("ol", "rs-station-steps");
        K.text(steps, "research.st.steps", "aria-label");
        ["plan", "run", "results"].forEach(function (name, index) {
            const item = el("li", "rs-station-step-dot", { "data-step": name });
            const number = el("span", "rs-station-step-num", { "aria-hidden": "true" });
            number.textContent = String(index + 1);
            item.append(number, text(el("span", "rs-station-step-name"), "research.st.step." + name));
            steps.appendChild(item);
        });
        head.append(title, lead, steps);
        root.appendChild(head);

        const loading = el("p", "rs-station-loading", { role: "status" });
        text(loading, "research.st.loadingEngine");
        root.appendChild(loading);

        function section(name) {
            const box = el("section", "rs-station-section rs-station-" + name, { "aria-labelledby": "rs-station-h-" + name, "data-section": name });
            const heading = el("h4", "rs-station-section-title", { id: "rs-station-h-" + name, tabindex: "-1" });
            const number = el("span", "rs-station-section-num", { "aria-hidden": "true" });
            number.textContent = { plan: "1", run: "2", results: "3", history: "" }[name];
            heading.append(number, text(el("span", ""), "research.st.section." + name));
            box.appendChild(heading);
            return { box: box, heading: heading };
        }

        /* =========================================================
           8b. STEP 1: THE PLAN
           ========================================================= */
        function buildPlan() {
            const s = section("plan");
            ui.plan = s;
            const chooser = el("div", "rs-station-chooser");
            const options = STUDIES.map(function (study, index) {
                return { value: study.id, labelKey: function () { return (index + 1) + ". " + t("research.st.q." + study.id + ".title"); } };
            }).concat([{ value: OWN, labelKey: function () { return (STUDIES.length + 1) + ". " + t("research.st.own"); } }]);
            ui.select = lk.select({ labelKey: "research.st.study", options: options, value: state.study, onChange: function (value) { selectStudy(value, { push: true }); } });
            ui.select.element.classList.add("rs-station-select");
            ui.select.select.setAttribute("data-st", "study");
            chooser.appendChild(ui.select.element);
            s.box.appendChild(chooser);

            ui.question = el("h5", "rs-station-question");
            ui.why = el("p", "rs-station-why");
            s.box.append(ui.question, ui.why);

            // A guided study: the plan as a table, and its data seed
            ui.guided = el("div", "rs-station-guided");
            ui.planTable = el("div", "rk-table-wrap rs-station-table-wrap");
            ui.guided.appendChild(ui.planTable);
            const seedRow = el("div", "rs-station-seed-row");
            ui.dataSeed = K.field(seedRow, { name: "dataSeed", labelKey: "research.st.dataSeed", kind: "int", min: 1, max: 1000000, value: 1, hintKey: "research.st.dataSeedHint", onChange: updateEstimate });
            ui.guided.appendChild(seedRow);
            s.box.appendChild(ui.guided);

            // My own study: every line can be edited
            ui.own = el("div", "rs-station-own");
            buildOwn(ui.own);
            s.box.appendChild(ui.own);

            ui.estimate = el("p", "rs-station-estimate", { "aria-live": "polite" });
            ui.guard = el("div", "rs-station-guard");
            ui.guard.hidden = true;
            ui.guardText = el("p", "rs-station-guard-text", { role: "alert" });
            ui.anyway = button("research.st.anyway", { variant: "ghost", size: "sm", onClick: function () { state.override = true; startStudy(); } }, "anyway");
            ui.guard.append(ui.guardText, ui.anyway.element);
            s.box.append(ui.estimate, ui.guard);

            // The prediction (guided studies) or a hypothesis (my own study)
            ui.predict = el("div", "rs-station-predict");
            ui.predictTitle = text(el("h5", "rs-station-sub"), "research.st.predict.title");
            ui.predictLead = text(el("p", "rs-station-note"), "research.st.predict.lead");
            ui.predictSlot = el("div", "rs-station-predict-slot");
            ui.prereg = text(el("p", "rs-station-prereg"), "research.st.predict.prereg");
            ui.predict.append(ui.predictTitle, ui.predictLead, ui.predictSlot, ui.prereg);
            s.box.appendChild(ui.predict);

            ui.hypothesisBox = el("div", "rs-station-hypothesis rk-field");
            const hLabel = el("label", "rk-label", { for: "rs-station-hypothesis" });
            text(hLabel, "research.st.hypothesis");
            ui.hypothesis = el("textarea", "rk-input rk-textarea", { id: "rs-station-hypothesis", rows: "2", maxlength: String(HYPOTHESIS_MAX), "data-st": "hypothesis" });
            K.text(ui.hypothesis, "research.st.hypothesisHint", "placeholder");
            ui.hypothesisBox.append(hLabel, ui.hypothesis);
            s.box.appendChild(ui.hypothesisBox);

            const actions = el("div", "rs-station-actions");
            ui.run = button("research.st.run", { variant: "primary", onClick: function () { state.override = false; startStudy(); } }, "run");
            ui.fresh = button("research.st.fresh", { variant: "ghost", onClick: newStudy }, "fresh");
            ui.fresh.element.hidden = true;
            ui.runHint = el("p", "rs-station-run-hint", { "aria-live": "polite", id: "rs-station-run-hint" });
            ui.run.element.setAttribute("aria-describedby", "rs-station-run-hint");
            actions.append(ui.run.element, ui.fresh.element, ui.runHint);
            s.box.appendChild(actions);
            root.appendChild(s.box);
        }

        // ----- My own study: the form -----
        const ownFields = {};
        let ownChoices = {};
        const ownLists = {};
        const LIST_LIMITS = {
            lr: { min: 1e-6, max: 100, value: [0.001, 0.01, 0.1, 1] },
            width: { min: 1, max: 256, whole: true, value: [4, 16, 64] },
            depth: { min: 1, max: 4, whole: true, value: [1, 2, 3] },
            weightDecay: { min: 0, max: 1, value: [0, 0.001, 0.01, 0.1] },
            batch: { min: 0, max: 2000, whole: true, value: [8, 32, 128] },
            nTrain: { min: 10, max: 2000, whole: true, value: [50, 100, 200, 400] },
            labelNoise: { min: 0, max: 0.5, value: [0, 0.1, 0.2, 0.3] }
        };

        function ownStored(name, fallback, allowed) {
            return store.get("own-" + name, fallback, function (value) { return allowed.indexOf(value) !== -1; });
        }

        function buildOwn(box) {
            const grid = el("div", "rs-station-own-grid");
            function group(key) {
                const fieldset = el("fieldset", "rs-station-fieldset");
                const legend = el("legend", "rs-station-legend");
                text(legend, "research.st.plan." + key);
                fieldset.appendChild(legend);
                grid.appendChild(fieldset);
                return fieldset;
            }
            function select(parent, name, labelKey, values, prefix, fallback) {
                const control = lk.select({
                    labelKey: labelKey,
                    options: values.map(function (value) { return { value: value, labelKey: prefix + value }; }),
                    value: ownStored(name, fallback, values),
                    onChange: function (value) {
                        store.set("own-" + name, value);
                        onOwnChange();
                    }
                });
                control.select.setAttribute("data-st", "own-" + name);
                parent.appendChild(control.element);
                ownChoices[name] = control;
                return control;
            }
            function field(parent, options) {
                const item = K.field(parent, Object.assign({}, options, { name: "own-" + options.name, onChange: onOwnChange }));
                ownFields[options.name] = item;
                return item;
            }
            ownChoices = {};
            const data = group("data");
            select(data, "task", "research.st.field.task", ["moons", "circles", "spirals", "blobs", "wave"], "research.st.task.", "moons");
            field(data, { name: "noise", labelKey: "research.st.field.noise", kind: "number", min: 0, max: 1, value: 0.2 });
            field(data, { name: "nTrain", labelKey: "research.st.field.nTrain", kind: "int", min: 10, max: 2000, value: 200 });
            field(data, { name: "labelNoise", labelKey: "research.st.field.labelNoise", kind: "percent", min: 0, max: 50, value: 0 });
            const freshToggle = K.toggle(data, { name: "own-fresh", labelKey: "research.st.field.fresh", checked: false, onChange: onOwnChange });
            ownFields.fresh = freshToggle;
            const model = group("model");
            field(model, { name: "depth", labelKey: "research.st.field.depth", kind: "int", min: 1, max: 4, value: 2 });
            field(model, { name: "width", labelKey: "research.st.field.width", kind: "int", min: 1, max: 256, value: 16 });
            select(model, "activation", "research.st.field.activation", ["tanh", "relu"], "research.st.act.", "tanh");
            const training = group("training");
            select(training, "optimizer", "research.st.field.optimizer", ["sgd", "momentum", "adam"], "research.st.opt.", "adam");
            field(training, { name: "lr", labelKey: "research.st.field.lr", kind: "number", min: 1e-6, max: 100, value: 0.01, powers: true });
            field(training, { name: "weightDecay", labelKey: "research.st.field.weightDecay", kind: "number", min: 0, max: 1, value: 0 });
            field(training, { name: "batch", labelKey: "research.st.field.batch", kind: "int", min: 0, max: 2000, value: 32, hintKey: "research.st.field.batchHint" });
            field(training, { name: "epochs", labelKey: "research.st.field.epochs", kind: "int", min: 1, max: 5000, value: 60 });
            select(training, "schedule", "research.st.field.schedule", ["constant", "cosine"], "research.st.schedule.", "constant");
            const varies = group("varies");
            select(varies, "factor", "research.st.field.factor", FACTORS, "research.st.factor.", "width");
            Object.keys(LIST_LIMITS).forEach(function (name) {
                const limit = LIST_LIMITS[name];
                const item = K.list(varies, {
                    name: "own-values-" + name, labelKey: function () { return t("research.st.field.values", { factor: t("research.st.factor." + name) }); },
                    value: limit.value, minCount: VALUES.min, maxCount: VALUES.max, min: limit.min, max: limit.max, whole: limit.whole,
                    hintKey: name === "labelNoise" ? "research.st.field.valuesShare" : name === "batch" ? "research.st.field.valuesBatch" : undefined,
                    rows: 2, onChange: onOwnChange
                });
                item.element.setAttribute("data-factor", name);
                ownLists[name] = item;
            });
            ui.ownChips = el("div", "rs-station-own-chips");
            varies.appendChild(ui.ownChips);
            const seeds = group("seeds");
            field(seeds, { name: "seeds", labelKey: "research.st.field.seeds", kind: "int", min: SEEDS.min, max: SEEDS.max, value: 3 });
            field(seeds, { name: "dataSeed", labelKey: "research.st.dataSeed", kind: "int", min: 1, max: 1000000, value: 1 });
            ui.ownMetric = K.choice(seeds, {
                name: "own-metric", labelKey: "research.st.field.metric", value: "testAcc",
                options: METRICS.map(function (m) { return { value: m, labelKey: "research.st.metricShort." + m }; }),
                onChange: onOwnChange
            });
            box.appendChild(grid);
            ui.ownProblem = el("p", "rs-station-own-problem", { role: "alert" });
            ui.ownProblem.hidden = true;
            box.appendChild(ui.ownProblem);
        }

        // The chips of the two categorical factors (optimiser, activation)
        let ownChipControl = null;
        function paintOwnChips() {
            const factor = ownChoices.factor.value();
            ui.ownChips.textContent = "";
            ownChipControl = null;
            if (factor !== "optimizer" && factor !== "activation") return;
            const values = factor === "optimizer" ? ["sgd", "momentum", "adam"] : ["tanh", "relu"];
            const saved = store.get("own-chips-" + factor, values, function (list) {
                return Array.isArray(list) && list.every(function (v) { return values.indexOf(v) !== -1; });
            });
            ownChipControl = lk.chips({
                labelKey: function () { return t("research.st.field.values", { factor: t("research.st.factor." + factor) }); },
                options: values.map(function (v) { return { value: v, labelKey: (factor === "optimizer" ? "research.st.opt." : "research.st.act.") + v }; }),
                values: saved, multi: true,
                onChange: function () {
                    store.set("own-chips-" + factor, ownChipControl.values());
                    onOwnChange();
                }
            });
            ui.ownChips.appendChild(ownChipControl.element);
        }

        function onOwnChange() {
            const factor = ownChoices.factor ? ownChoices.factor.value() : "width";
            Object.keys(ownLists).forEach(function (name) { A.dom.setHidden(ownLists[name].element, name !== factor); });
            if (!ownChipControl || ui.ownChips.getAttribute("data-factor") !== factor) {
                paintOwnChips();
                ui.ownChips.setAttribute("data-factor", factor);
            }
            updateEstimate();
        }

        // My own study as a plan -> { plan } or { problem: text }
        function ownPlan() {
            const bad = Object.keys(ownFields).some(function (name) { return !ownFields[name].valid(); });
            const factor = ownChoices.factor.value();
            const list = ownLists[factor];
            if (bad || (list && !list.valid())) return { problem: t("research.st.fix") };
            let values;
            if (list) {
                values = list.values();
                const unique = values.filter(function (v, i) { return values.indexOf(v) === i; });
                if (unique.length < VALUES.min) return { problem: t("research.st.needTwo") };
                values = unique;
            } else {
                values = ownChipControl ? ownChipControl.values() : [];
                const order = factor === "optimizer" ? ["sgd", "momentum", "adam"] : ["tanh", "relu"];
                values = order.filter(function (v) { return values.indexOf(v) !== -1; });
                if (values.length < VALUES.min) return { problem: t("research.st.needTwo") };
            }
            const task = ownChoices.task.value();
            const metric = ui.ownMetric.value();
            if (task === "wave" && metric === "testAcc") return { problem: t("research.st.regAcc") };
            const base = {
                task: task, noise: ownFields.noise.value(), nTrain: ownFields.nTrain.value(), labelNoise: task === "wave" ? 0 : ownFields.labelNoise.value(),
                freshSample: ownFields.fresh.value(), depth: ownFields.depth.value(), width: ownFields.width.value(), activation: ownChoices.activation.value(),
                optimizer: ownChoices.optimizer.value(), lr: ownFields.lr.value(), weightDecay: ownFields.weightDecay.value(), batch: ownFields.batch.value(),
                epochs: ownFields.epochs.value(), schedule: ownChoices.schedule.value(), records: Math.min(25, ownFields.epochs.value())
            };
            const plan = {
                study: OWN, kind: "sweep", base: base, factor: factor, values: values, seeds: ownFields.seeds.value(),
                dataSeed: ownFields.dataSeed.value(), metric: metric, readings: null, updates: 0, widths: null, tune: null
            };
            const problems = E ? planProblems(plan, E) : [];
            if (problems.length) return { problem: t("research.st.fix") };
            return { plan: plan };
        }

        function currentPlan() {
            if (state.study === OWN) return ownPlan();
            if (!ui.dataSeed.valid()) return { problem: t("research.st.fix") };
            return { plan: planFor(byId[state.study], ui.dataSeed.value()) };
        }

        // ----- The plan table of a guided study (and of every record) -----
        function planRows(plan) {
            const b = Object.assign({ nTest: 1000, labelNoise: 0, weightDecay: 0, schedule: "constant", freshSample: false }, plan.base);
            const rows = [];
            let data = t("research.st.line.data", { task: t("research.st.task." + b.task), noise: num(b.noise), n: plan.factor === "nTrain" ? t("research.st.line.varies") : num(b.nTrain), test: num(b.nTest), seed: num(plan.dataSeed) });
            if (b.labelNoise > 0 && plan.factor !== "labelNoise") data += t("research.st.line.labelNoise", { share: pct(b.labelNoise) });
            if (b.freshSample) data += t("research.st.line.fresh");
            rows.push([t("research.st.plan.data"), data]);
            let model;
            if (plan.factor === "arch") {
                const counts = plan.values.map(function (v) { return E ? E.paramCount(variant(plan, v, null, null)) : 0; });
                model = t("research.st.line.arch", { act: t("research.st.act." + b.activation), from: num(Math.min.apply(null, counts)), to: num(Math.max.apply(null, counts)) });
            } else {
                model = t("research.st.line.model", {
                    depth: plan.factor === "depth" ? t("research.st.line.varies") : num(b.depth),
                    width: plan.factor === "width" ? t("research.st.line.varies") : num(b.width),
                    act: plan.factor === "activation" ? t("research.st.line.varies") : t("research.st.act." + b.activation)
                });
                if (E && plan.factor !== "width" && plan.factor !== "depth") model += t("research.st.line.params", { n: num(E.paramCount(b)) });
            }
            rows.push([t("research.st.plan.model"), model]);
            const batch = plan.factor === "batch" ? t("research.st.line.varies") : (b.batch > 0 && b.batch < b.nTrain ? num(b.batch) : t("research.st.fullBatch", { n: num(b.nTrain) }));
            let length;
            if (plan.updates) length = t("research.st.line.updates", { n: num(plan.updates) });
            else if (plan.readings) length = t("research.st.line.readings", { epochs: num(b.epochs), updates: num(plan.readings[1].updates) });
            else length = t("research.st.line.epochs", { n: num(b.epochs) });
            let lr = plan.factor === "lr" ? t("research.st.line.varies") : num(b.lr);
            if (plan.tune) lr = t("research.st.line.tuned");
            rows.push([t("research.st.plan.training"), t("research.st.line.training", {
                opt: plan.factor === "optimizer" ? t("research.st.line.varies") : t("research.st.opt." + b.optimizer),
                lr: lr, schedule: t("research.st.schedule." + b.schedule),
                wd: plan.factor === "weightDecay" ? t("research.st.line.varies") : num(b.weightDecay), batch: batch, length: length
            })]);
            let varies;
            if (plan.factor === null) varies = t("research.st.line.nothing");
            else if (plan.tune) varies = t("research.st.line.armsTuned", { first: valueText(plan, plan.values[0]), second: valueText(plan, plan.values[1]), r1: plan.tune.rates[plan.values[0]].map(function (v) { return num(v); }).join(", "), r2: plan.tune.rates[plan.values[1]].map(function (v) { return num(v); }).join(", "), seeds: num(plan.tune.seeds) });
            else varies = factorName(plan) + ": " + plan.values.map(function (v) { return valueText(plan, v); }).join(", ");
            rows.push([t("research.st.plan.varies"), varies]);
            rows.push([t("research.st.plan.seeds"), t("research.st.line.seeds", { n: num(plan.seeds) })]);
            rows.push([t("research.st.plan.metric"), t("research.st.metric." + plan.metric)]);
            if (E) {
                const cost = planCost(plan, E);
                // an estimate by a rule of thumb (about 6 × parameters × examples × epochs): three digits, not ten
                rows.push([t("research.st.plan.cost"), t("research.st.line.cost", { ops: num(Number(cost.toPrecision(3))), runs: num(phasesOf(plan).reduce(function (n, phase) { return n + jobCount(plan, phase); }, 0)) })]);
            }
            return rows;
        }

        function tableOf(rows, options) {
            const settings = options || {};
            const table = el("table", "rk-table rs-station-table" + (settings.className ? " " + settings.className : ""));
            if (settings.caption) {
                const caption = el("caption", "rk-table-caption");
                caption.textContent = settings.caption;
                table.appendChild(caption);
            }
            if (settings.columns) {
                const head = el("thead");
                const tr = el("tr");
                settings.columns.forEach(function (column, i) {
                    const th = el("th", settings.numeric && settings.numeric[i] ? "is-num" : "", { scope: "col" });
                    th.textContent = column;
                    tr.appendChild(th);
                });
                head.appendChild(tr);
                table.appendChild(head);
            }
            const body = el("tbody");
            rows.forEach(function (row, r) {
                const tr = el("tr");
                if (settings.marks && settings.marks[r]) tr.setAttribute("data-mark", settings.marks[r]);
                row.forEach(function (cell, i) {
                    const td = el(i === 0 ? "th" : "td", settings.numeric && settings.numeric[i] ? "is-num" : "", i === 0 ? { scope: "row" } : {});
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                body.appendChild(tr);
            });
            table.appendChild(body);
            return table;
        }

        /* ----- The estimate and the guard ----- */
        function estimateOf(plan) {
            if (!E || !speed) return null;
            return planCost(plan, E) / speed / 1000;
        }

        function updateEstimate() {
            if (!ui.estimate || state.phase === "running") return;
            const current = currentPlan();
            A.dom.setHidden(ui.ownProblem, !(state.study === OWN && current.problem));
            if (state.study === OWN && current.problem) A.dom.setText(ui.ownProblem, current.problem);
            if (current.problem || !E) {
                A.dom.setText(ui.estimate, "");
                A.dom.setHidden(ui.guard, true);
                updateRunButton();
                return;
            }
            const seconds = estimateOf(current.plan);
            const cost = planCost(current.plan, E);
            A.dom.setText(ui.estimate, seconds === null ? t("research.st.measuring") : t("research.st.estimate", { ops: num(cost), time: duration(seconds) }));
            if (state.study !== OWN) renderPlanTable(current.plan);
            A.dom.setHidden(ui.guard, true);
            updateRunButton();
        }

        function renderPlanTable(plan) {
            ui.planTable.textContent = "";
            ui.planTable.appendChild(tableOf(planRows(plan), { caption: t("research.st.planCaption"), className: "rs-station-plan-table" }));
        }

        // The study is too large for this device? -> null or { text, anyway }
        function guardFor(plan) {
            const seconds = estimateOf(plan);
            if (seconds === null) return null;
            if (seconds > HARD_LIMIT) return { text: t("research.st.tooBigHard", { time: duration(seconds) }) + " " + t("research.st.tooBigHint"), anyway: false };
            if (seconds > SOFT_LIMIT && !state.override) return { text: t("research.st.tooBig", { time: duration(seconds), limit: duration(SOFT_LIMIT) }) + " " + t("research.st.tooBigHint"), anyway: canRunAnyway() };
            return null;
        }

        function updateRunButton() {
            if (!ui.run) return;
            const guided = state.study !== OWN;
            const running = state.phase === "running";
            const locked = state.phase === "done" && state.record && !state.record.reopened;
            const needsPrediction = guided && !state.prediction;
            ui.run.setDisabled(running || locked || needsPrediction || !E);
            A.dom.setHidden(ui.run.element, locked);
            A.dom.setHidden(ui.fresh.element, !locked);
            let hint = "";
            if (!E) hint = t("research.st.loadingEngine");
            else if (needsPrediction && !running && !locked) hint = t("research.st.predict.need");
            else if (locked) hint = guided ? t("research.st.predict.locked") : "";
            A.dom.setText(ui.runHint, hint);
        }

        /* =========================================================
           8c. THE PREDICTION
           The lab kit's segmented control (a radio group), shown as a column.
           Nothing is chosen at first; once the study starts it is locked.
           ========================================================= */
        let predictControl = null;
        function buildPrediction() {
            ui.predictSlot.textContent = "";
            predictControl = null;
            const study = studyOf(state.study);
            A.dom.setHidden(ui.predict, !study);
            A.dom.setHidden(ui.hypothesisBox, Boolean(study));
            if (!study) return;
            predictControl = lk.segmented({
                labelKey: "research.st.predict.label",
                hideLabel: true,
                options: study.outcomes.map(function (outcome) { return { value: outcome, labelKey: "research.st.q." + study.id + ".o." + outcome }; }),
                value: null,
                onChange: function (value) {
                    if (state.phase !== "plan") return;
                    state.prediction = value;
                    updateRunButton();
                }
            });
            predictControl.element.classList.add("rs-station-predict-control");
            ui.predictSlot.appendChild(predictControl.element);
            if (state.prediction) predictControl.set(state.prediction);
            predictControl.setDisabled(state.phase !== "plan");
        }

        /* =========================================================
           8d. CHOOSING A STUDY, THE ADDRESS
           ========================================================= */
        function selectStudy(id, how) {
            const options = how || {};
            if (!(byId[id] || id === OWN)) return;
            if (state.phase === "running") {
                ui.select.set(state.study);
                return;
            }
            const changed = id !== state.study;
            state.study = id;
            ui.select.set(id);
            if (changed || state.phase !== "plan") {
                state.prediction = null;
                state.phase = "plan";
                state.record = null;
                state.curves = null;
                hideResults();
            }
            paintStudy();
            if (options.push !== undefined && ctx.setRoute) ctx.setRoute(id, { replace: !options.push });
        }

        function paintStudy() {
            const study = studyOf(state.study);
            A.dom.setText(ui.question, study ? t("research.st.q." + study.id + ".title") : t("research.st.own"));
            A.dom.setText(ui.why, study ? t("research.st.q." + study.id + ".why") : t("research.st.ownWhy"));
            A.dom.setHidden(ui.guided, !study);
            A.dom.setHidden(ui.own, Boolean(study));
            if (!study) onOwnChange();
            buildPrediction();
            setPlanLocked(state.phase !== "plan");
            updateEstimate();
            paintSteps();
        }

        function setPlanLocked(on) {
            ui.select.setDisabled(state.phase === "running");
            ui.dataSeed.input.disabled = on;
            Object.keys(ownFields).forEach(function (name) {
                const item = ownFields[name];
                if (item.input) item.input.disabled = on;
                else if (item.element) item.element.querySelectorAll("button, input").forEach(function (b) { b.disabled = on; });
            });
            Object.keys(ownChoices).forEach(function (name) { ownChoices[name].setDisabled(on); });
            Object.keys(ownLists).forEach(function (name) { ownLists[name].input.disabled = on; });
            if (ownChipControl) ownChipControl.setDisabled(on);
            if (ui.ownMetric) ui.ownMetric.element.querySelectorAll("button").forEach(function (b) { b.disabled = on; });
            ui.hypothesis.disabled = on;
            if (predictControl) predictControl.setDisabled(on);
        }

        function paintSteps() {
            const current = state.phase === "running" ? "run" : state.phase === "done" ? "results" : "plan";
            steps.querySelectorAll(".rs-station-step-dot").forEach(function (item) {
                const on = item.getAttribute("data-step") === current;
                item.classList.toggle("is-current", on);
                if (on) item.setAttribute("aria-current", "step");
                else item.removeAttribute("aria-current");
            });
        }

        /* =========================================================
           8e. STEP 2: THE RUN
           The bench kit's job runs the study in slices of about 12 ms (the
           page stays responsive), shows the bar and "Stop", and waits while
           the station is not on screen (another tab of the lab, a hidden page).
           ========================================================= */
        function buildRun() {
            const s = section("run");
            ui.runSection = s;
            s.box.hidden = true;
            ui.progress = el("p", "rs-station-progress");
            ui.jobSlot = el("div", "rs-station-job");
            ui.job = K.job(ui.jobSlot);
            ui.live = K.chart(s.box, { labelKey: "research.st.liveChart", height: 220, x: { labelKey: "research.st.axis.epoch" }, y: { labelKey: function () { return t("research.st.metricShort." + liveMetric()); } }, series: [], legend: false });
            s.box.insertBefore(ui.progress, ui.live.element);
            s.box.insertBefore(ui.jobSlot, ui.live.element);
            ui.liveNote = text(el("p", "rs-station-note"), "research.st.liveNote");
            s.box.appendChild(ui.liveNote);
            root.appendChild(s.box);
        }

        function liveMetric() {
            const plan = state.record ? state.record.plan : null;
            if (!plan) return "testAcc";
            return plan.metric === "testError" ? "testAcc" : plan.metric === "trainLoss" ? "trainLoss" : plan.metric;
        }

        function startStudy() {
            if (state.phase === "running" || !E) return;
            const current = currentPlan();
            if (current.problem) {
                updateEstimate();
                A.dom.setText(ui.runHint, current.problem);
                return;
            }
            const plan = current.plan;
            const study = studyOf(plan.study);
            if (study && !state.prediction) {
                updateRunButton();
                return;
            }
            const guard = guardFor(plan);
            if (guard) {
                A.dom.setText(ui.guardText, guard.text);
                A.dom.setHidden(ui.anyway.element, !guard.anyway);
                A.dom.setHidden(ui.guard, false);
                return;
            }
            A.dom.setHidden(ui.guard, true);
            state.override = false;
            state.phase = "running";
            state.record = {
                plan: plan, prediction: study ? state.prediction : null,
                hypothesis: study ? "" : String(ui.hypothesis.value || "").trim().slice(0, HYPOTHESIS_MAX),
                conclusion: "", time: Date.now(), id: "s" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36)
            };
            state.curves = {};
            state.runner = makeRunner(plan, E);
            state.started = performance.now();
            state.activeMs = 0;
            state.lastTick = performance.now();
            state.quarter = 0;
            state.lastLive = 0;
            hideResults();
            setPlanLocked(true);
            updateRunButton();
            paintSteps();
            A.dom.setHidden(ui.runSection.box, false);
            ui.live.set({ series: [] });
            paintProgress();
            ctx.announce(t("research.st.said.start", { n: num(state.runner.counts().total) }));
            ui.job.start({
                step: function (chunk) { return state.runner.step(chunk); },
                progress: function () { return state.runner.progress(); }
            }, { chunk: CHUNK_MS, onProgress: onProgress, onDone: function () { finish(false); }, onStop: function () { finish(true); } });
            const stop = ui.jobSlot.querySelector(".rk-job-stop");
            if (stop) {
                stop.setAttribute("data-st", "stop");
                stop.focus({ preventScroll: true });
            }
            ui.runSection.box.scrollIntoView({ block: "nearest" });
        }

        function onProgress(share) {
            const now = performance.now();
            const gap = now - state.lastTick;
            state.lastTick = now;
            if (gap < 1000) state.activeMs += gap;        // a long gap was a pause: not training time
            paintProgress();
            const quarter = Math.floor(share * 4);
            if (quarter > state.quarter && quarter < 4) {
                state.quarter = quarter;
                ctx.announce(t("research.st.said.quarter", { percent: pct(quarter / 4) }));
            }
            if (now - state.lastLive > LIVE_EVERY) {
                state.lastLive = now;
                paintLive();
            }
        }

        function paintProgress() {
            const runner = state.runner;
            if (!runner) return;
            const counts = runner.counts();
            const share = runner.progress();
            let left = "";
            if (share > 0.03 && state.activeMs > 300) left = duration(state.activeMs * (1 - share) / share / 1000);
            else {
                const estimate = estimateOf(state.record.plan);
                if (estimate !== null) left = duration(estimate * (1 - share));
            }
            const key = runner.phase() === "tune" ? "research.st.progressTune" : "research.st.progress";
            let line = t(key, { done: num(Math.min(counts.total, counts.done + 1)), total: num(counts.total) });
            if (left) line += " · " + t("research.st.left", { time: left });
            if (paused) line = t("research.st.pausedLine");
            A.dom.setText(ui.progress, line);
        }

        function curveKey(tag) {
            return tag.phase + "|" + tag.reading + "|" + JSON.stringify(tag.value) + "|" + (tag.lr || "");
        }

        function curvePoints(records, metric) {
            const name = metric === "testError" ? "testAcc" : metric;
            return records.map(function (r) { return [r.epoch, r[name]]; }).filter(function (p) { return isNumber(p[1]); });
        }

        // The live chart: every finished run of the main phase (thin), and the run that goes on now
        function paintLive() {
            if (!state.runner || paused) return;
            const plan = state.record.plan;
            const metric = liveMetric();
            const series = [];
            const seen = {};
            state.runner.finished.forEach(function (item) {
                const key = curveKey(item.tag);
                if (!state.curves[key]) state.curves[key] = [];
                if (!seen[key]) seen[key] = 0;
                seen[key] += 1;
                if (state.curves[key].length < seen[key]) state.curves[key].push(item.result.records.map(function (r) { return { epoch: r.epoch, trainLoss: r.trainLoss, testLoss: r.testLoss, trainAcc: r.trainAcc, testAcc: r.testAcc }; }));
                const index = item.tag.phase === "tune" ? 7 : plan.values.indexOf(item.tag.value);
                series.push({ kind: "line", data: curvePoints(item.result.records, metric), colorIndex: Math.max(0, index) % 8, width: 1.25 });
            });
            const live = state.runner.live();
            if (live) {
                const index = live.tag.phase === "tune" ? 7 : plan.values.indexOf(live.tag.value);
                series.push({ kind: "line", data: curvePoints(live.records, metric), colorIndex: Math.max(0, index) % 8, width: 2.5 });
            }
            const finishedCount = state.runner.finished.length;      // the chart is described again later, when the runner is gone
            ui.live.set({ series: series, y: { log: !PERCENT[metric], labelKey: function () { return t("research.st.metricShort." + metric); } }, describe: function () { return t("research.st.liveDescribe", { n: num(finishedCount) }); } });
        }

        function finish(stopped) {
            const runner = state.runner;
            if (!runner) return;
            paintLive();
            state.runner = null;
            const record = state.record;
            const grouped = groupRuns(record.plan, runner.finished);
            const mainDone = runner.finished.filter(function (item) { return item.tag.phase === "main"; }).length;
            // the curves of the runs that finished, kept for this visit
            runner.finished.forEach(function (item) {
                const key = curveKey(item.tag);
                if (!state.curves[key]) state.curves[key] = [];
            });
            rebuildCurves(runner.finished);
            if (!mainDone) {
                state.phase = "plan";
                state.record = null;
                A.dom.setText(ui.progress, t("research.st.said.nothing"));
                ctx.announce(t("research.st.said.nothing"));
                setPlanLocked(false);
                updateRunButton();
                paintSteps();
                ui.run.element.focus({ preventScroll: true });
                return;
            }
            record.groups = grouped.groups;
            record.tune = grouped.tune;
            record.rates = runner.rates;
            record.partial = stopped || mainDone < runner.mainTotal;
            record.done = mainDone;
            record.total = runner.mainTotal;
            record.analysis = analyse(record.plan, record.groups, record.tune);
            record.reopened = false;
            if (state.activeMs > 200) {
                const doneCost = record.plan && E ? planCost(record.plan, E) * runner.progress() : 0;
                if (doneCost > 0 && !stopped) speed = 0.5 * speed + 0.5 * (doneCost / state.activeMs);
            }
            state.phase = "done";
            state.reading = readingsOf(record.plan)[0].id;
            A.dom.setHidden(ui.runSection.box, true);
            A.dom.setText(ui.progress, "");              // repainted at the next start, in the language of then
            saveHistory(record);
            renderResults();
            setPlanLocked(true);
            updateRunButton();
            paintSteps();
            const said = record.partial
                ? t("research.st.said.stopped", { done: num(record.done), total: num(record.total) })
                : t("research.st.said.done");
            // after the job's own short "Done." or "Stopped.", so that this fuller message replaces it in the queue
            const message = said + " " + verdictSentence(record).text;
            setTimeout(function () { if (!destroyed) ctx.announce(message); }, 0);
            ui.results.heading.focus({ preventScroll: true });
            ui.results.box.scrollIntoView({ block: "start" });
        }

        function rebuildCurves(finished) {
            const curves = {};
            finished.forEach(function (item) {
                const key = curveKey(item.tag);
                if (!curves[key]) curves[key] = [];
                curves[key].push({ seed: item.result.seed, diverged: item.result.diverged, records: item.result.records });
            });
            state.curves = curves;
        }

        // "Start a new study": the prediction can be chosen again
        function newStudy() {
            state.phase = "plan";
            state.prediction = null;
            state.record = null;
            state.curves = null;
            hideResults();
            paintStudy();
            ui.plan.heading.focus({ preventScroll: true });
            ui.plan.box.scrollIntoView({ block: "start" });
        }

        /* =========================================================
           8f. STEP 3: THE RESULTS
           ========================================================= */
        function buildResults() {
            const s = section("results");
            ui.results = s;
            s.box.hidden = true;
            ui.resultsNote = el("p", "rs-station-partial", { role: "note" });
            ui.readingSlot = el("div", "rs-station-reading");
            ui.resultsTable = el("div", "rk-table-wrap rs-station-table-wrap");
            ui.metricChart = K.chart(null, { labelKey: "research.st.metricChart", height: 240, series: [] });
            ui.curvesBox = el("div", "rs-station-curves");
            ui.curvesTitle = text(el("h5", "rs-station-sub"), "research.st.curvesTitle");
            ui.curvesChips = el("div", "rs-station-curves-chips");
            ui.curvesChart = K.chart(null, { labelKey: "research.st.curvesTitle", height: 240, series: [] });
            ui.curvesNote = el("p", "rs-station-note");
            ui.curvesBox.append(ui.curvesTitle, ui.curvesChips, ui.curvesChart.element, ui.curvesNote);
            ui.analysisBox = el("div", "rs-station-analysis");
            ui.verdictBox = el("div", "rs-station-verdict-box");
            ui.knownBox = el("div", "rs-station-known");
            const conclusion = el("div", "rs-station-conclusion rk-field");
            const cLabel = el("label", "rk-label", { for: "rs-station-conclusion" });
            text(cLabel, "research.st.conclusion");
            ui.conclusion = el("textarea", "rk-input rk-textarea", { id: "rs-station-conclusion", rows: "4", maxlength: String(TEXT_MAX), "data-st": "conclusion" });
            K.text(ui.conclusion, "research.st.conclusionHint", "placeholder");
            ui.conclusion.addEventListener("input", function () {
                if (state.record) state.record.conclusion = ui.conclusion.value.slice(0, TEXT_MAX);
            });
            ui.conclusion.addEventListener("change", function () {
                if (state.record) updateHistoryConclusion(state.record);
            });
            conclusion.append(cLabel, ui.conclusion);
            const actions = el("div", "rs-station-actions rs-station-result-actions");
            ui.note = button("research.st.note", { variant: "primary", size: "sm", onClick: addToNotebook }, "note");
            ui.copy = button("research.st.copy", { variant: "ghost", size: "sm", onClick: copyText }, "copy");
            ui.csv = button("research.st.csv", { variant: "ghost", size: "sm", onClick: downloadCsv }, "csv");
            ui.actionMsg = el("p", "rk-action-msg rs-station-action-msg", { role: "status" });
            ui.openNotebook = el("button", "rk-action-link", { type: "button" });
            text(ui.openNotebook, "research.kit.openNotebook");
            ui.openNotebook.hidden = true;
            ui.openNotebook.addEventListener("click", function () { ctx.openNotebook(ui.openNotebook); });
            ui.fallback = el("textarea", "rk-input rk-copy-text", { readonly: "", rows: "8" });
            K.text(ui.fallback, "research.st.copy", "aria-label");
            ui.fallback.hidden = true;
            actions.append(ui.note.element, ui.copy.element, ui.csv.element, ui.actionMsg, ui.openNotebook, ui.fallback);
            s.box.append(ui.resultsNote, ui.readingSlot, ui.resultsTable, ui.metricChart.element, ui.curvesBox, ui.analysisBox, ui.verdictBox, ui.knownBox, conclusion, actions);
            root.appendChild(s.box);
        }

        function hideResults() {
            if (!ui.results) return;
            A.dom.setHidden(ui.results.box, true);
            A.dom.setHidden(ui.runSection.box, state.phase !== "running");
            ui.conclusion.value = "";
            say("", false);
        }

        function say(message, withLink) {
            A.dom.setText(ui.actionMsg, message);
            A.dom.setHidden(ui.openNotebook, !withLink);
        }

        function currentReading(record) {
            const ids = readingsOf(record.plan).map(function (r) { return r.id; });
            return ids.indexOf(state.reading) !== -1 ? state.reading : ids[0];
        }

        function renderResults() {
            const record = state.record;
            if (!record || !record.analysis) return;
            const plan = record.plan;
            A.dom.setHidden(ui.results.box, false);
            // the note on top: partial, reopened
            const notes = [];
            if (record.partial) notes.push(t("research.st.partial", { done: num(record.done), total: num(record.total) }));
            if (record.reopened) notes.push(t("research.st.reopenedNote", { date: A.format.date(record.time, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) }));
            A.dom.setText(ui.resultsNote, notes.join(" "));
            A.dom.setHidden(ui.resultsNote, !notes.length);
            // two readings (the batch study): which one the table and charts show
            ui.readingSlot.textContent = "";
            if (readingsOf(plan).length > 1) {
                const control = lk.segmented({
                    labelKey: "research.st.readingLabel",
                    options: readingsOf(plan).map(function (r) { return { value: r.id, labelKey: "research.st.reading." + r.id }; }),
                    value: currentReading(record),
                    onChange: function (value) {
                        state.reading = value;
                        renderReading();
                    }
                });
                control.element.classList.add("rs-station-reading-control");
                ui.readingSlot.appendChild(control.element);
            }
            renderReading();
            renderAnalysis();
            renderVerdict();
            renderKnown();
            ui.conclusion.value = record.conclusion || "";
            A.dom.setHidden(ui.csv.element, false);
        }

        function renderReading() {
            const record = state.record;
            const plan = record.plan;
            const reading = currentReading(record);
            const part = record.analysis.readings[reading];
            const c = part.compare;
            const metric = plan.metric;
            // the table
            const columns = [factorName(plan), t("research.st.col.mean"), t("research.st.col.min"), t("research.st.col.max"), t("research.st.col.runs"), t("research.st.col.diverged"), t("research.st.col.p")];
            const marks = [];
            const rows = part.groups.map(function (group, i) {
                const s = c.stats[i];
                const info = c.info[i];
                marks.push(info.status);
                let status = "";
                if (info.status === "best") status = t("research.st.status.best");
                else if (info.status === "broken") status = t("research.st.status.broken");
                else if (info.adj !== null) status = pText(info.adj) + (info.status === "worse" ? " *" : "");
                const divergedText = s.diverged ? num(s.diverged) + " (" + t("research.st.epochShort", { list: group.runs.filter(function (r) { return r.d; }).map(function (r) { return num(r.d); }).join(", ") }) + ")" : "0";
                return [
                    valueText(plan, group.value),
                    s.n ? metricText(metric, s.mean) + (s.se !== null ? " ± " + seText(metric, s.se) : "") : kit.DASH,
                    metricText(metric, s.min),
                    metricText(metric, s.max),
                    num(s.runs),
                    divergedText,
                    status
                ];
            });
            if (plan.study === "noisy-labels") {
                columns.splice(4, 0, t("research.st.col.fit"));
                rows.forEach(function (row, i) { row.splice(4, 0, metricText("trainAcc", stats(part.groups[i], "trainAcc").mean)); });
            }
            ui.resultsTable.textContent = "";
            const caption = t("research.st.tableCaption", { metric: t("research.st.metric." + metric) }) + (readingsOf(plan).length > 1 ? " · " + readingName(reading) : "");
            ui.resultsTable.appendChild(tableOf(rows, { caption: caption, columns: columns, numeric: columns.map(function (c2, i) { return i > 0; }), marks: marks, className: "rs-station-results-table" }));
            const footnote = el("p", "rs-station-table-note");
            footnote.textContent = t("research.st.tableNote", { m: num(c.m) });
            ui.resultsTable.appendChild(footnote);
            renderMetricChart(plan, part, metric);
            renderCurves(plan, reading);
        }

        // A loss spread over orders of magnitude gets a logarithmic y axis (never an accuracy)
        function logFor(metric, numbers) {
            if (PERCENT[metric]) return false;
            const list = numbers.filter(isNumber);
            if (!list.length || list.some(function (v) { return v <= 0; })) return false;
            return Math.max.apply(null, list) / Math.min.apply(null, list) >= 20;
        }

        function axisFor(plan) {
            const numeric = plan.factor && plan.factor !== "optimizer" && plan.factor !== "activation";
            if (!numeric) return { categorical: true };
            const positive = plan.values.filter(function (v) { return v > 0; });
            const log = positive.length === plan.values.length && Math.max.apply(null, positive) / Math.min.apply(null, positive) >= 10;
            return { categorical: false, log: log };
        }

        // A little room beyond the first and the last value, so that no point sits on the frame
        function padded(plan, axis, side) {
            const xs = plan.values.map(function (v, i) { return xOf(plan, v, i, axis); });
            const lo = Math.min.apply(null, xs);
            const hi = Math.max.apply(null, xs);
            if (axis.log) return side < 0 ? lo / 1.6 : hi * 1.6;
            const room = 0.06 * ((hi - lo) || 1);
            return side < 0 ? lo - room : hi + room;
        }

        function xOf(plan, value, index, axis) {
            if (axis.categorical) return index + 1;
            if (plan.factor === "batch" && value === 0) return nTrainOf(plan, value);
            return value;
        }

        function renderMetricChart(plan, part, metric) {
            const c = part.compare;
            const axis = axisFor(plan);
            const percent = Boolean(PERCENT[metric]);
            const y = { labelKey: function () { return t("research.st.metricShort." + metric); }, format: percent ? function (v) { return kit.num(v * 100, { digits: 3 }) + "%"; } : undefined };
            if (plan.kind === "seeds") {
                const s = c.stats[0];
                const runs = part.groups[0].runs;
                const points = [];
                runs.forEach(function (run) {
                    const v = metricOf(run, metric);
                    if (v !== null) points.push([run.s, v]);
                });
                ui.metricChart.set({
                    labelKey: "research.st.seedChart", height: 240,
                    x: { labelKey: "research.st.axis.seed", step: 1 }, y: y,
                    series: [{ kind: "points", data: points, colorIndex: 0, labelKey: "research.st.seedRuns" }],
                    hlines: s.mean !== null ? [{ y: s.mean, labelKey: function () { return t("research.st.meanLine", { value: metricText(metric, s.mean) }); } }] : [],
                    describe: function () { return t("research.st.seedDescribe", { n: num(s.n), min: metricText(metric, s.min), max: metricText(metric, s.max), mean: metricText(metric, s.mean) }); }
                });
                return;
            }
            const data = [];
            const marks = [];
            part.groups.forEach(function (group, i) {
                const s = c.stats[i];
                const x = xOf(plan, group.value, i, axis);
                if (s.n) data.push([x, s.mean, s.mean - (s.se || 0), s.mean + (s.se || 0)]);
                if (s.diverged) marks.push({ x: x, labelKey: function () { return t("research.st.divergedMark", { n: num(s.diverged) }); }, color: "danger" });
            });
            const x = axis.categorical
                ? { labelKey: function () { return factorName(plan); }, step: 1, min: 0.5, max: plan.values.length + 0.5, format: function (v) { const i = Math.round(v) - 1; return plan.values[i] !== undefined && Math.abs(v - i - 1) < 1e-9 ? valueText(plan, plan.values[i]) : ""; } }
                : { labelKey: function () { return factorName(plan); }, log: axis.log, min: padded(plan, axis, -1), max: padded(plan, axis, 1) };
            const best = c.best >= 0 ? part.groups[c.best] : null;
            const ends = data.reduce(function (all, p) { return all.concat([p[2], p[3]]); }, []).filter(isNumber);
            y.log = logFor(metric, ends);
            // room above and below the points, so the top point and its label do not sit on the frame
            if (ends.length) {
                const lo = Math.min.apply(null, ends);
                const hi = Math.max.apply(null, ends);
                if (y.log) { y.min = lo / 1.4; y.max = hi * 1.4; }
                else {
                    const room = Math.max(hi - lo, Math.abs(hi) * 0.01, 1e-6) * 0.12;
                    y.min = lo - room;
                    y.max = hi + room;
                    if (percent) { y.min = Math.max(0, y.min); y.max = Math.min(1, y.max); }
                    if (!percent && lo >= 0) y.min = Math.max(0, y.min);
                }
            }
            ui.metricChart.set({
                labelKey: "research.st.metricChart", height: 240, x: x, y: y,
                series: [{ kind: "points", data: data, errors: true, colorIndex: 0, labelKey: function () { return t("research.st.meanSe"); } }],
                marks: marks.concat(best ? [{ x: xOf(plan, best.value, c.best, axis), y: c.stats[c.best].mean, labelKey: "research.st.status.best", colorIndex: 2 }] : []),
                describe: function () {
                    return part.groups.map(function (group, i) {
                        const s = c.stats[i];
                        return valueText(plan, group.value) + ": " + (s.n ? metricText(metric, s.mean) + " ± " + seText(metric, s.se) : kit.DASH) + (s.diverged ? ", " + t("research.st.divergedMark", { n: num(s.diverged) }) : "");
                    }).join("; ");
                }
            });
        }

        // The learning curves of chosen settings: the mean over the seeds and a band
        // from the lowest to the highest seed (only right after a run: they are not saved)
        let curveChoice = null;
        function renderCurves(plan, reading) {
            ui.curvesChips.textContent = "";
            const curves = state.curves;
            if (!curves || state.record.reopened) {
                A.dom.setHidden(ui.curvesChart.element, true);
                A.dom.setText(ui.curvesNote, t("research.st.curvesGone"));
                return;
            }
            A.dom.setHidden(ui.curvesChart.element, false);
            const metric = liveMetric();
            const values = plan.values;
            if (!curveChoice || curveChoice.plan !== plan || curveChoice.reading !== reading) {
                const c = state.record.analysis.readings[reading].compare;
                const pick = [0, c.best, values.length - 1].filter(function (i, k, all) { return i >= 0 && all.indexOf(i) === k; });
                curveChoice = { plan: plan, reading: reading, chosen: pick.map(function (i) { return i; }) };
            }
            if (values.length > 1) {
                const chips = lk.chips({
                    labelKey: "research.st.curvesPick",
                    options: values.map(function (v, i) { return { value: i, labelKey: function () { return valueText(plan, v); }, colorIndex: i % 8 }; }),
                    values: curveChoice.chosen.slice(), multi: true,
                    onChange: function () {
                        curveChoice.chosen = chips.values().slice();
                        paintCurves(plan, reading, metric);
                    }
                });
                ui.curvesChips.appendChild(chips.element);
            }
            paintCurves(plan, reading, metric);
        }

        function paintCurves(plan, reading, metric) {
            const series = [];
            let divergedRuns = 0;
            const chosen = plan.values.length > 1 ? curveChoice.chosen : [0];
            chosen.slice().sort(function (a, b) { return a - b; }).forEach(function (i) {
                const value = plan.values[i];
                const key = curveKey({ phase: "main", reading: reading, value: value });
                const runs = (state.curves[key] || []).filter(function (run) {
                    if (run.diverged) divergedRuns += 1;
                    return !run.diverged && run.records.length;
                });
                if (!runs.length) return;
                const name = metric === "testError" ? "testAcc" : metric;
                const epochs = runs[0].records.map(function (r) { return r.epoch; });
                const mean = [];
                const band = [];
                epochs.forEach(function (epoch, k) {
                    const ys = runs.map(function (run) { return run.records[k] ? run.records[k][name] : null; }).filter(isNumber);
                    if (!ys.length) return;
                    const m = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length;
                    mean.push([epoch, m]);
                    band.push([epoch, Math.min.apply(null, ys), Math.max.apply(null, ys)]);
                });
                series.push({ kind: "line", data: mean, band: runs.length > 1 ? band : undefined, colorIndex: i % 8, labelKey: function () { return valueText(plan, value); } });
            });
            const percent = Boolean(PERCENT[metric === "testError" ? "testAcc" : metric]);
            const ys = series.reduce(function (all, s) { return all.concat((s.band || s.data).map(function (p) { return p[1]; }), s.data.map(function (p) { return p[1]; }), (s.band || []).map(function (p) { return p[2]; })); }, []);
            ui.curvesChart.set({
                labelKey: "research.st.curvesTitle", height: 240,
                x: { labelKey: "research.st.axis.epoch" },
                y: { log: logFor(metric, ys), labelKey: function () { return t("research.st.metricShort." + metric); }, format: percent ? function (v) { return kit.num(v * 100, { digits: 3 }) + "%"; } : undefined },
                series: series
            });
            A.dom.setText(ui.curvesNote, t("research.st.curvesNote") + (divergedRuns ? " " + t("research.st.curvesDiverged", { n: num(divergedRuns) }) : ""));
        }

        /* ----- The analysis in words ----- */
        function listOf(plan, part, indices) {
            return indices.map(function (i) { return valueText(plan, part.groups[i].value); }).join(", ");
        }

        function compareLines(plan, part) {
            const c = part.compare;
            const metric = plan.metric;
            const lines = [];
            if (c.best < 0) {
                lines.push(t("research.st.a.noBest"));
                return lines;
            }
            const s = c.stats[c.best];
            lines.push(t("research.st.a.best", { value: valueText(plan, part.groups[c.best].value), mean: metricText(metric, s.mean), se: seText(metric, s.se) }));
            // the best value lost some runs (fewer than half): its mean is over the others only
            if (s.diverged) lines.push(t("research.st.a.bestDiverged", { n: num(s.diverged), runs: num(s.runs) }));
            const by = { worse: [], tied: [], broken: [], untested: [] };
            c.info.forEach(function (item, i) { if (by[item.status]) by[item.status].push(i); });
            if (c.m) lines.push(t("research.st.a.tests", { m: num(c.m) }));
            if (by.worse.length) lines.push(t("research.st.a.worse", { list: listOf(plan, part, by.worse) }));
            if (by.tied.length) lines.push(t("research.st.a.tied", { list: listOf(plan, part, by.tied) }));
            if (by.broken.length) lines.push(t("research.st.a.broken", { list: listOf(plan, part, by.broken) }));
            if (by.untested.length) lines.push(t("research.st.a.untested", { list: listOf(plan, part, by.untested) }));
            return lines;
        }

        function analysisLines(record) {
            const plan = record.plan;
            const a = record.analysis;
            const lines = [];
            if (plan.tune && a.rates) {
                lines.push(t("research.st.a.tuned", {
                    first: valueText(plan, plan.values[0]), r1: num(a.rates[plan.values[0]]),
                    second: valueText(plan, plan.values[1]), r2: num(a.rates[plan.values[1]]), seeds: num(plan.tune.seeds)
                }));
            }
            if (plan.kind === "seeds" && a.seeds) {
                const r = a.seeds;
                const metric = plan.metric;
                lines.push(t("research.st.a.spread", { n: num(r.n), sd: seText(metric, r.sd), min: metricText(metric, r.min), max: metricText(metric, r.max) }));
                const row = function (k) { return r.rows.find(function (item) { return item.k === k; }); };
                lines.push(t("research.st.a.resample", {
                    x: seText(metric, r.x3),
                    y5: row(5) ? pct(row(5).y) : kit.DASH, y10: row(10) ? pct(row(10).y) : kit.DASH,
                    draws: num(r.draws), n: num(r.n)
                }));
                lines.push(t("research.st.a.resampleCi", { lo: seText(metric, r.lo), hi: seText(metric, r.hi) }));
                return lines;
            }
            if (a.arms && a.arms.test) {
                const w = a.arms.test;
                const metric = plan.metric;
                const diff = function (v) { return PERCENT[metric] ? kit.num(v * 100, { digits: 3 }) + "%" : num(v); };
                lines.push(t("research.st.a.arms", {
                    first: valueText(plan, plan.values[0]), second: valueText(plan, plan.values[1]),
                    diff: diff(w.diff), lo: diff(w.lo), hi: diff(w.hi), t: num(w.t, { digits: 3 }), df: num(w.df, { digits: 3 }), p: pText(w.p), g: num(a.arms.g, { digits: 3 })
                }));
            }
            readingsOf(plan).forEach(function (reading) {
                const part = a.readings[reading.id];
                if (readingsOf(plan).length > 1) lines.push(readingName(reading.id) + ":");
                compareLines(plan, part).forEach(function (line) { lines.push(line); });
            });
            if (a.slope && a.slope.all) {
                const s = a.slope;
                const f = function (fit) { return fit ? num(fit.slope, { digits: 3 }) + " ± " + num(fit.se, { digits: 2 }) : kit.DASH; };
                lines.push(t(s.loss ? "research.st.a.slopeLoss" : "research.st.a.slope", { slope: f(s.all), lo: num(s.all.lo, { digits: 3 }), hi: num(s.all.hi, { digits: 3 }), early: f(s.early), late: f(s.late), seeds: num(s.all.n) }));
                if (s.floored) lines.push(t("research.st.a.floored", { n: num(s.floored), floor: pct(s.floor) }));
                if (s.zero) lines.push(t("research.st.a.zeroLoss", { n: num(s.zero) }));
            }
            return lines;
        }

        function renderAnalysis() {
            const record = state.record;
            ui.analysisBox.textContent = "";
            const heading = text(el("h5", "rs-station-sub"), "research.st.analysis");
            const list = el("ul", "rs-station-lines");
            analysisLines(record).forEach(function (line) {
                const item = el("li");
                item.textContent = line;
                list.appendChild(item);
            });
            ui.analysisBox.append(heading, list);
            if (record.plan.kind === "seeds" && record.analysis.seeds) {
                const r = record.analysis.seeds;
                const metric = record.plan.metric;
                const rows = r.rows.map(function (row) { return [num(row.k), seText(metric, row.x), pct(row.y), seText(metric, row.median)]; });
                const wrap = el("div", "rk-table-wrap rs-station-table-wrap");
                wrap.appendChild(tableOf(rows, {
                    caption: t("research.st.resampleCaption"),
                    columns: [t("research.st.col.k"), t("research.st.col.x95"), t("research.st.col.share", { x: seText(metric, r.x3) }), t("research.st.col.median")],
                    numeric: [true, true, true, true]
                }));
                ui.analysisBox.appendChild(wrap);
            }
            if (record.plan.tune && record.tune && record.tune.length) {
                const plan = record.plan;
                const rows = record.tune.map(function (group) {
                    const s = stats(group, "valAcc");
                    const chosen = record.analysis.rates && record.analysis.rates[group.value] === group.lr;
                    return [valueText(plan, group.value), num(group.lr), s.n ? pct(s.mean) + (s.se !== null ? " ± " + seText("valAcc", s.se) : "") : kit.DASH, chosen ? t("research.st.chosen") : ""];
                });
                const wrap = el("div", "rk-table-wrap rs-station-table-wrap");
                wrap.appendChild(tableOf(rows, { caption: t("research.st.tuneCaption"), columns: [t("research.st.factor.optimizer"), t("research.st.factor.lr"), t("research.st.col.val"), ""], numeric: [false, true, true, false] }));
                ui.analysisBox.appendChild(wrap);
            }
        }

        /* ----- Prediction against data ----- */
        function story(record) {
            const plan = record.plan;
            const a = record.analysis;
            const first = a.readings[readingsOf(plan)[0].id];
            const c = first.compare;
            const metric = plan.metric;
            const v = function (i) { return valueText(plan, first.groups[i].value); };
            const m = function (i) { return metricText(metric, c.stats[i].mean); };
            const facts = (a.decision && a.decision.facts) || {};
            switch (plan.study) {
                case "learning-rate": {
                    if (c.best < 0) return t("research.st.story.none");
                    let s = t("research.st.story.lr.best", { rate: v(c.best), loss: m(c.best) });
                    s += " " + (facts.below && facts.below.length ? t("research.st.story.lr.below", { list: listOf(plan, first, facts.below) }) : t("research.st.story.lr.noBelow"));
                    const broken = (facts.broken || []).filter(function (i) { return i > c.best; });
                    const worse = (facts.above || []).filter(function (i) { return broken.indexOf(i) === -1; });
                    if (broken.length) s += " " + t("research.st.story.lr.broken", { list: listOf(plan, first, broken) });
                    if (worse.length) s += " " + t("research.st.story.lr.above", { list: listOf(plan, first, worse) });
                    if (!broken.length && !worse.length) s += " " + t("research.st.story.lr.noAbove");
                    return s;
                }
                case "data-size": {
                    const s = a.slope;
                    if (!s || !s.all) return t("research.st.story.none");
                    const f = function (fit) { return fit ? num(fit.slope, { digits: 2 }) : kit.DASH; };
                    return t("research.st.story.data", { e0: pct(s.e0), n0: num(s.n0), e1: pct(s.e1), n1: num(s.n1), slope: f(s.all), early: f(s.early), late: f(s.late) });
                }
                case "noisy-labels": {
                    if (c.best < 0) return t("research.st.story.none");
                    const w = first.groups.length - 1;
                    const status = c.info[w].status;
                    // a widest network that diverged in at least half of its runs was not tested
                    // against the best: "clearly worse" would say more than the runs show
                    if (status === "broken") return t("research.st.story.noisyBroken", { width: v(w), n: num(c.stats[w].diverged), runs: num(c.stats[w].runs), best: v(c.best), bestAcc: m(c.best) });
                    let s = t("research.st.story.noisy", { width: v(w), fit: pct(c.fitWidest), acc: m(w), best: v(c.best), bestAcc: m(c.best) });
                    if (status === "best") s += " " + t("research.st.story.noisyBest");
                    else if (status === "worse") s += " " + t("research.st.story.noisyWorse");
                    else if (c.info[w].equivalent) s += " " + t("research.st.story.noisySame");
                    else s += " " + t("research.st.story.noisyUnclear");
                    return s;
                }
                case "adam-sgd": {
                    const arm = a.arms;
                    if (!arm || !arm.test) return t("research.st.story.none");
                    const w = arm.test;
                    return t("research.st.story.arms", {
                        first: valueText(plan, plan.values[0]), a1: metricText(metric, arm.first.mean),
                        second: valueText(plan, plan.values[1]), a2: metricText(metric, arm.second.mean),
                        diff: kit.num(w.diff * 100, { digits: 3 }) + "%", lo: kit.num(w.lo * 100, { digits: 3 }) + "%", hi: kit.num(w.hi * 100, { digits: 3 }) + "%",
                        p: pText(w.p), g: num(arm.g, { digits: 2 })
                    });
                }
                case "weight-decay": {
                    if (c.best < 0) return t("research.st.story.none");
                    const last = first.groups.length - 1;
                    return t("research.st.story.decay", { zero: m(0), best: v(c.best), bestAcc: m(c.best), top: v(last), topAcc: m(last) });
                }
                case "batch-size": {
                    const second = a.readings.updates;
                    const last = first.groups.length - 1;
                    const s2 = second.compare;
                    const m2 = function (i) { return metricText(metric, s2.stats[i].mean); };
                    let s = t("research.st.story.batch", { b0: v(0), a0: m(0), bN: v(last), aN: m(last), c0: m2(0), cN: m2(last) });
                    const r1 = a.decision.outcome;
                    const r2 = facts.second;
                    // two different outcomes show that the answer depends on what is held fixed;
                    // a reading that does not decide shows nothing either way
                    const key = r1 === r2 ? "batchSame" : (r1 === "undecided" || r2 === "undecided") ? "batchUnclear" : "batchDiffer";
                    s += " " + t("research.st.story." + key, { r1: outcomeText(plan.study, r1), r2: outcomeText(plan.study, r2) });
                    return s;
                }
                case "seeds": {
                    const r = a.seeds;
                    if (!r) return t("research.st.story.none");
                    return t("research.st.story.seeds", { x: seText(metric, r.x3), lo: seText(metric, r.lo), hi: seText(metric, r.hi), n: num(r.n) });
                }
                case "depth-width":
                    if (c.best < 0) return t("research.st.story.none");
                    return t("research.st.story.depth", { list: first.groups.map(function (g, i) { return t("research.st.story.depthItem", { depth: num(g.value), acc: m(i) }); }).join("; "), best: v(c.best) });
                default: {
                    if (a.arms && a.arms.test) {
                        const w = a.arms.test;
                        return t("research.st.story.ownArms", { first: valueText(plan, plan.values[0]), second: valueText(plan, plan.values[1]), p: pText(w.p) }) + " " + (w.p < ALPHA ? t("research.st.story.ownClear") : t("research.st.story.ownUnclear"));
                    }
                    if (c.best < 0) return t("research.st.story.none");
                    const worse = c.info.map(function (item, i) { return bad(item.status) ? i : -1; }).filter(function (i) { return i >= 0; });
                    return t("research.st.story.own", { best: v(c.best), mean: m(c.best) }) + " " + (worse.length ? t("research.st.story.ownWorse", { list: listOf(plan, first, worse) }) : t("research.st.story.ownNone"));
                }
            }
        }

        // -> { text, tone, outcome }
        function verdictSentence(record) {
            const plan = record.plan;
            const outcome = record.analysis.decision ? record.analysis.decision.outcome : null;
            if (plan.study === OWN) {
                return { text: t("research.st.verdict.own"), tone: "info", outcome: null };
            }
            if (outcome === "undecided") return { text: t("research.st.verdict.undecided", { n: seedsRun(record) }), tone: "info", outcome: outcome };
            if (outcome === record.prediction) return { text: t("research.st.verdict.match"), tone: "good", outcome: outcome };
            return { text: t("research.st.verdict.other", { outcome: outcomeText(plan.study, outcome) }), tone: "warn", outcome: outcome };
        }

        function predictionLine(record) {
            const plan = record.plan;
            if (plan.study === OWN) {
                return record.hypothesis ? t("research.st.verdict.hypothesis", { text: record.hypothesis }) + " " + t("research.st.verdict.inStudy", { story: story(record) }) : t("research.st.verdict.inStudy", { story: story(record) });
            }
            return t("research.st.verdict.you", { prediction: outcomeText(plan.study, record.prediction), story: story(record) });
        }

        function renderVerdict() {
            const record = state.record;
            ui.verdictBox.textContent = "";
            ui.verdictBox.appendChild(text(el("h5", "rs-station-sub"), "research.st.verdict.title"));
            const v = verdictSentence(record);
            const verdict = K.verdict(ui.verdictBox);
            verdict.set(v.text, v.tone);
            verdict.element.setAttribute("data-outcome", v.outcome || "");
            verdict.element.removeAttribute("role");
            const you = el("p", "rs-station-you");
            you.textContent = predictionLine(record);
            ui.verdictBox.appendChild(you);
            if (record.plan.study !== OWN) {
                const rule = el("p", "rs-station-rule");
                rule.textContent = t("research.st.verdict.rule", { rule: t("research.st.q." + record.plan.study + ".rule") });
                ui.verdictBox.appendChild(rule);
            }
        }

        function renderKnown() {
            const record = state.record;
            ui.knownBox.textContent = "";
            const study = studyOf(record.plan.study);
            ui.knownBox.appendChild(text(el("h5", "rs-station-sub"), "research.st.known"));
            const p = el("p", "rs-station-known-text");
            p.textContent = study ? t("research.st.q." + study.id + ".known") : t("research.st.ownKnown");
            ui.knownBox.appendChild(p);
            const units = (study ? study.units : ["r12"]).filter(K.unitExists);
            if (units.length) {
                const line = el("p", "rs-station-units");
                const label = el("span", "rs-station-units-label");
                label.textContent = t("research.st.unitsLabel") + " ";
                line.appendChild(label);
                units.forEach(function (id, i) {
                    if (i) {
                        const gap = el("span", "", { "aria-hidden": "true" });
                        gap.textContent = " · ";
                        line.appendChild(gap);
                    }
                    const link = el("button", "rk-source-unit", { type: "button", "data-unit": id });
                    link.textContent = t("research.kit.sourceUnit", { id: id, title: t("learn.unit." + id) });
                    link.addEventListener("click", function () { ctx.learn(id, link); });
                    line.appendChild(link);
                });
                ui.knownBox.appendChild(line);
            }
            const caveat = el("p", "rs-station-caveat");
            caveat.textContent = t("research.st.caveat");
            ui.knownBox.appendChild(caveat);
        }

        /* =========================================================
           8g. THE RECORD: notebook, copy, CSV
           ========================================================= */
        function resultRows(record) {
            const plan = record.plan;
            const rows = [];
            readingsOf(plan).forEach(function (reading) {
                const part = record.analysis.readings[reading.id];
                part.groups.forEach(function (group, i) {
                    const s = part.compare.stats[i];
                    const name = (readingsOf(plan).length > 1 ? readingName(reading.id) + ", " : "") + factorName(plan) + " " + valueText(plan, group.value);
                    let value = s.n ? metricText(plan.metric, s.mean) + (s.se !== null ? " ± " + seText(plan.metric, s.se) : "") : kit.DASH;
                    value += " [" + metricText(plan.metric, s.min) + "; " + metricText(plan.metric, s.max) + "]";
                    value += " · " + t("research.st.recordRuns", { runs: num(s.runs), diverged: num(s.diverged) });
                    const status = part.compare.info[i].status;
                    if (status !== "untested") value += " · " + t("research.st.status." + status);
                    rows.push([name, value]);
                });
            });
            return rows.slice(0, 30);
        }

        function recordText(record) {
            const plan = record.plan;
            const lines = [t("research.tab.station") + ": " + questionOf(plan), ""];
            lines.push(t("research.st.section.plan"));
            planRows(plan).forEach(function (row) { lines.push("  " + row[0] + ": " + row[1]); });
            if (plan.study !== OWN) lines.push("", t("research.st.predict.title") + ": " + outcomeText(plan.study, record.prediction) + " (" + t("research.st.predict.before") + ")");
            else if (record.hypothesis) lines.push("", t("research.st.hypothesis") + ": " + record.hypothesis);
            lines.push("", t("research.st.tableCaption", { metric: t("research.st.metric." + plan.metric) }));
            resultRows(record).forEach(function (row) { lines.push("  " + row[0] + ": " + row[1]); });
            if (record.partial) lines.push("  " + t("research.st.partial", { done: num(record.done), total: num(record.total) }));
            lines.push("", t("research.st.analysis"));
            analysisLines(record).forEach(function (line) { lines.push("  " + line); });
            lines.push("", t("research.st.verdict.title"));
            lines.push("  " + verdictSentence(record).text);
            lines.push("  " + predictionLine(record));
            if (plan.study !== OWN) lines.push("  " + t("research.st.verdict.rule", { rule: t("research.st.q." + plan.study + ".rule") }));
            lines.push("", t("research.st.caveat"));
            if (record.conclusion) lines.push("", t("research.st.conclusion") + ": " + record.conclusion);
            lines.push("", t("research.kit.copyFrom") + ", " + A.format.date(record.time));
            return lines.join("\n");
        }

        function addToNotebook() {
            const record = state.record;
            if (!record) return;
            record.conclusion = ui.conclusion.value.slice(0, TEXT_MAX);
            const plan = record.plan;
            const inputs = planRows(plan).map(function (row) { return [row[0], row[1]]; });
            if (plan.study !== OWN) inputs.push([t("research.st.predict.title"), outcomeText(plan.study, record.prediction) + " (" + t("research.st.predict.before") + ")"]);
            else if (record.hypothesis) inputs.push([t("research.st.hypothesis"), record.hypothesis]);
            const results = resultRows(record);
            const v = verdictSentence(record);
            results.push([t("research.st.verdict.title"), v.text]);
            const parts = [analysisLines(record).join("\n"), v.text + " " + predictionLine(record)];
            if (plan.study !== OWN) parts.push(t("research.st.verdict.rule", { rule: t("research.st.q." + plan.study + ".rule") }));
            parts.push(t("research.st.caveat"));
            if (record.conclusion) parts.push(t("research.st.conclusion") + ": " + record.conclusion);
            let body = parts.join("\n\n");
            if (body.length > TEXT_MAX) {
                // the learner's conclusion is kept whole; the analysis gives way
                const tail = record.conclusion ? "\n\n" + t("research.st.conclusion") + ": " + record.conclusion : "";
                body = body.slice(0, Math.max(0, TEXT_MAX - tail.length - 1)) + "…" + tail;
                body = body.slice(0, TEXT_MAX);
            }
            const answer = ctx.note({ title: questionOf(plan) + (record.partial ? " (" + t("research.st.partialShort") + ")" : ""), inputs: inputs, results: results, text: body });
            if (answer && answer.ok) {
                say(t("research.st.noted"), true);
                ctx.announce(t("research.st.noted"));
            } else {
                say(t("research.kit.noteFull", { max: num(answer && answer.max ? answer.max : 300) }), true);
            }
            updateHistoryConclusion(record);
        }

        function copyText() {
            const record = state.record;
            if (!record) return;
            record.conclusion = ui.conclusion.value.slice(0, TEXT_MAX);
            const body = recordText(record);
            ui.fallback.hidden = true;
            const done = function () {
                say(t("research.st.copied"), false);
                ctx.announce(t("research.st.copied"));
            };
            const failed = function () {
                ui.fallback.value = body;
                ui.fallback.hidden = false;
                ui.fallback.focus();
                ui.fallback.select();
                let copied = false;
                try {
                    copied = document.execCommand("copy");
                } catch (error) {
                    copied = false;
                }
                if (copied) done();
                else say(t("research.kit.copyFailed"), false);
            };
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") navigator.clipboard.writeText(body).then(done, failed);
            else failed();
        }

        // One row per run: plain numbers with a dot, for a spreadsheet or a script
        function csvOf(record) {
            const plan = record.plan;
            const head = ["study", "phase", "reading", "factor", "value", "learning_rate", "run_seed", "data_seed", "diverged_epoch", "final_train_loss", "final_test_loss", "final_train_acc", "final_test_acc", "final_val_acc"];
            const lines = [head.join(",")];
            const cell = function (value) {
                if (value === null || value === undefined) return "";
                const textValue = String(value);
                return /[",\n]/.test(textValue) ? '"' + textValue.replace(/"/g, '""') + '"' : textValue;
            };
            const add = function (group, phase) {
                group.runs.forEach(function (run) {
                    const lr = phase === "tune" ? group.lr : (plan.factor === "optimizer" && record.analysis.rates ? record.analysis.rates[group.value] : variant(plan, group.value, null, null).lr);
                    lines.push([plan.study, phase, group.reading, plan.factor || "", group.value === null ? "" : group.value, lr, run.s, plan.dataSeed, run.d || 0]
                        .concat(FINAL.map(function (name, i) { return run.f ? run.f[i] : null; })).map(cell).join(","));
                });
            };
            (record.tune || []).forEach(function (group) { add(group, "tune"); });
            record.groups.forEach(function (group) { add(group, "main"); });
            return lines.join("\n") + "\n";
        }

        function downloadCsv() {
            const record = state.record;
            if (!record) return;
            const date = new Date(record.time);
            const pad = function (n) { return (n < 10 ? "0" : "") + n; };
            const name = "study-" + record.plan.study + "-" + date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + ".csv";
            const address = URL.createObjectURL(new Blob([csvOf(record)], { type: "text/csv;charset=utf-8" }));
            const link = el("a", "", { href: address, download: name });
            link.hidden = true;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(function () { URL.revokeObjectURL(address); }, 60000);
            say(t("research.st.csvDone", { name: name }), false);
        }

        /* =========================================================
           8h. EARLIER STUDIES (the last 20 of this device)
           Saved under research.station.history: { v: 1, items: [...] }, each
           the plan, the prediction, the summary numbers of every run (no
           curves), the conclusion. Read back strictly: an item that is not
           right is left out. With storage blocked, it lasts for the visit.
           ========================================================= */
        function validRun(run) {
            return run && typeof run === "object" && Number.isInteger(run.s) && Number.isInteger(run.d) && run.d >= 0 &&
                (run.f === null || (Array.isArray(run.f) && run.f.length === FINAL.length && run.f.every(function (v) { return v === null || isNumber(v); })));
        }

        function validGroup(group, plan) {
            return group && typeof group === "object" && Array.isArray(group.runs) && group.runs.length <= 64 && group.runs.every(validRun) &&
                plan.values.some(function (v) { return sameValue(v, group.value); }) && typeof group.reading === "string";
        }

        function validPlan(plan) {
            if (!plan || typeof plan !== "object" || !plan.base || typeof plan.base !== "object") return false;
            if (!(byId[plan.study] || plan.study === OWN)) return false;
            if (!Array.isArray(plan.values) || plan.values.length < 1 || plan.values.length > VALUES.max) return false;
            if (!(Number.isInteger(plan.seeds) && plan.seeds >= 1 && plan.seeds <= SEEDS.max) || !Number.isInteger(plan.dataSeed)) return false;
            if (plan.study === OWN) {
                if (FACTORS.indexOf(plan.factor) === -1 || METRICS.indexOf(plan.metric) === -1 || plan.kind !== "sweep" || plan.tune || plan.readings || plan.updates) return false;
                if (E && planProblems(plan, E).length) return false;
                return true;
            }
            // a guided study's plan must be the study's own, with its data seed
            return JSON.stringify(plan) === JSON.stringify(planFor(byId[plan.study], plan.dataSeed));
        }

        function validItem(item) {
            if (!item || typeof item !== "object" || typeof item.id !== "string" || !/^[a-z0-9]{1,40}$/.test(item.id)) return false;
            if (!isNumber(item.time) || !validPlan(item.plan)) return false;
            const study = byId[item.plan.study];
            if (study && study.outcomes.indexOf(item.prediction) === -1) return false;
            if (typeof item.hypothesis !== "string" || item.hypothesis.length > HYPOTHESIS_MAX) return false;
            if (typeof item.conclusion !== "string" || item.conclusion.length > TEXT_MAX) return false;
            if (!Array.isArray(item.groups) || !item.groups.every(function (g) { return validGroup(g, item.plan); })) return false;
            if (item.tune !== undefined && !(Array.isArray(item.tune) && item.tune.every(function (g) { return validGroup(g, item.plan) && isNumber(g.lr); }))) return false;
            return typeof item.partial === "boolean" && Number.isInteger(item.done) && Number.isInteger(item.total);
        }

        let history = null;
        function loadHistory() {
            if (history) return history;
            const saved = store.get("history", null, function (value) { return value && value.v === HISTORY_VERSION && Array.isArray(value.items); });
            history = saved ? saved.items.filter(function (item) {
                try {
                    return validItem(item);
                } catch (error) {
                    return false;
                }
            }).slice(0, HISTORY_MAX) : [];
            return history;
        }

        function itemOf(record) {
            return {
                id: record.id, time: record.time, plan: record.plan, prediction: record.prediction, hypothesis: record.hypothesis || "",
                conclusion: (record.conclusion || "").slice(0, TEXT_MAX), groups: record.groups, tune: record.tune || [],
                partial: record.partial, done: record.done, total: record.total
            };
        }

        function saveHistory(record) {
            loadHistory();
            history = [itemOf(record)].concat(history.filter(function (item) { return item.id !== record.id; })).slice(0, HISTORY_MAX);
            store.set("history", { v: HISTORY_VERSION, items: history });
            renderHistory();
        }

        function updateHistoryConclusion(record) {
            loadHistory();
            const item = history.find(function (entry) { return entry.id === record.id; });
            if (!item) return;
            item.conclusion = (record.conclusion || "").slice(0, TEXT_MAX);
            store.set("history", { v: HISTORY_VERSION, items: history });
        }

        const analysed = {};
        function recordOf(item) {
            if (!analysed[item.id]) analysed[item.id] = analyse(item.plan, item.groups, item.tune);
            return Object.assign({}, item, { analysis: analysed[item.id], reopened: true });
        }

        function oneLine(record) {
            const plan = record.plan;
            if (plan.study !== OWN) {
                const outcome = record.analysis.decision.outcome;
                return t("research.st.history.result", { outcome: outcomeText(plan.study, outcome) });
            }
            const part = record.analysis.readings[readingsOf(plan)[0].id];
            const c = part.compare;
            if (c.best < 0) return t("research.st.story.none");
            return t("research.st.history.best", { factor: factorName(plan), value: valueText(plan, part.groups[c.best].value), mean: metricText(plan.metric, c.stats[c.best].mean) });
        }

        function buildHistory() {
            const s = section("history");
            ui.history = s;
            ui.historyBlocked = el("p", "rs-station-note", { role: "note" });
            ui.historyList = el("ul", "rs-station-history-list", { role: "list" });
            s.box.append(ui.historyBlocked, ui.historyList);
            root.appendChild(s.box);
        }

        function renderHistory() {
            if (!ui.historyList) return;
            const items = loadHistory();
            A.dom.setText(ui.historyBlocked, A.storage.available() ? "" : t("research.st.history.blocked"));
            A.dom.setHidden(ui.historyBlocked, A.storage.available());
            ui.historyList.textContent = "";
            if (!items.length) {
                const empty = el("li", "rs-station-history-empty");
                empty.textContent = t("research.st.history.empty");
                ui.historyList.appendChild(empty);
                return;
            }
            items.forEach(function (item) {
                const record = recordOf(item);
                const li = el("li", "rs-station-history-item");
                const b = el("button", "rs-station-history-open", { type: "button", "data-id": item.id });
                const when = el("span", "rs-station-history-time");
                when.textContent = A.format.date(item.time, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
                const name = el("span", "rs-station-history-name");
                name.textContent = questionOf(item.plan) + (item.partial ? " (" + t("research.st.partialShort") + ")" : "");
                const line = el("span", "rs-station-history-line");
                line.textContent = oneLine(record);
                b.append(when, name, line);
                b.setAttribute("aria-label", t("research.st.history.reopen", { title: questionOf(item.plan) }) + ", " + when.textContent + ". " + line.textContent);
                b.addEventListener("click", function () { reopen(item.id); });
                li.appendChild(b);
                ui.historyList.appendChild(li);
            });
        }

        function reopen(id) {
            if (state.phase === "running") return;
            const item = loadHistory().find(function (entry) { return entry.id === id; });
            if (!item) return;
            const record = recordOf(item);
            state.study = item.plan.study;
            ui.select.set(state.study);
            state.phase = "done";
            state.prediction = item.prediction;
            state.record = record;
            state.curves = null;
            state.reading = readingsOf(record.plan)[0].id;
            if (state.study === OWN) restoreOwn(record.plan);
            else ui.dataSeed.set(record.plan.dataSeed);
            paintStudy();
            ui.hypothesis.value = record.hypothesis || "";
            renderResults();
            if (ctx.setRoute) ctx.setRoute(state.study, { replace: false });
            ui.results.heading.focus({ preventScroll: true });
            ui.results.box.scrollIntoView({ block: "start" });
        }

        // A reopened own study shows its plan in the form
        function restoreOwn(plan) {
            const b = plan.base;
            ["noise", "nTrain", "depth", "width", "lr", "weightDecay", "batch", "epochs"].forEach(function (name) { if (isNumber(b[name])) ownFields[name].set(b[name]); });
            ownFields.labelNoise.set(b.labelNoise * 100);
            ownFields.fresh.set(Boolean(b.freshSample));
            ownFields.seeds.set(plan.seeds);
            ownFields.dataSeed.set(plan.dataSeed);
            ["task", "activation", "optimizer", "schedule"].forEach(function (name) {
                ownChoices[name].set(b[name]);
                store.set("own-" + name, b[name]);
            });
            ownChoices.factor.set(plan.factor);
            store.set("own-factor", plan.factor);
            if (ownLists[plan.factor]) ownLists[plan.factor].set(plan.values);
            else store.set("own-chips-" + plan.factor, plan.values);
            ui.ownMetric.set(plan.metric);
            ui.ownChips.removeAttribute("data-factor");
        }

        /* =========================================================
           8i. BUILDING, THE ENGINE, THE LIFE CYCLE
           ========================================================= */
        function measureSpeed() {
            if (!E || destroyed) return;
            // a typical small run; the first one warms the code up and is not counted
            const config = { task: "moons", nTrain: 200, depth: 2, width: 16, epochs: 8, records: 2, batch: 32 };
            E.run(config, 1, { dataSeed: 1 });
            let best = 0;
            for (let i = 0; i < 3; i++) {
                const started = performance.now();
                E.run(config, 1, { dataSeed: 1 });
                const ms = Math.max(0.5, performance.now() - started);
                best = Math.max(best, E.cost(config) / ms);
            }
            speed = best * 0.85;          // the page's slices and drawing take their share
            updateEstimate();
        }

        let built = false;
        function build() {
            if (built || destroyed) return;
            built = true;
            loading.remove();
            buildPlan();
            buildRun();
            buildResults();
            buildHistory();
            const wanted = String(ctx.route || "").split("/")[0];
            if (byId[wanted] || wanted === OWN) state.study = wanted;
            ui.select.set(state.study);
            paintStudy();
            renderHistory();
            setTimeout(measureSpeed, 60);
        }

        if (A.keepOffline) A.keepOffline(ENGINE_FILE);
        if (E) build();
        else {
            A.loadScript(ENGINE_FILE).then(function () {
                E = A.researchEngine || null;
                if (E) build();
                else throw new Error("js/research/engine.js did not load");
            }).catch(function (error) {
                if (destroyed) return;
                if (typeof window.reportError === "function") window.reportError(error);
                A.dom.setText(loading, t("research.st.engineFailed"));
                loading.setAttribute("role", "alert");
            });
        }

        return {
            language: function () {
                if (destroyed) return;
                K.language();
                lk.relabel(root);
                if (!built) return;
                if (ui.actionMsg) A.dom.setText(ui.actionMsg, "");          // a passing message ("Saved as …") is not kept across a switch
                if (state.study === OWN) onOwnChange();
                paintStudy();
                if (state.phase === "running") paintProgress();
                if (state.phase === "done" && state.record) renderResults();
                renderHistory();
            },
            theme: function () {
                if (destroyed) return;
                K.theme();
            },
            pause: function () {
                paused = true;
                if (state.phase === "running") paintProgress();
            },
            resume: function () {
                paused = false;
                if (state.phase === "running") {
                    paintProgress();
                    paintLive();
                }
            },
            route: function (rest) {
                if (!built) return;
                const wanted = String(rest || "").split("/")[0];
                if (state.phase === "running") {
                    if (wanted !== state.study && ctx.setRoute) ctx.setRoute(state.study, { replace: true });
                    return;
                }
                if (byId[wanted] || wanted === OWN) {
                    if (wanted !== state.study) selectStudy(wanted, {});
                }
            },
            destroy: function () {
                destroyed = true;
                K.destroy();
            }
        };
    }

    /* =========================================================
       9. REGISTERING THE STATION
       spec.maths: the pure parts, for dev/tests/research.engine.js and the
       outcome runs in Node (S/r9/work/st/).
       ========================================================= */
    A.research.define("station", {
        create: create,
        maths: {
            STUDIES: STUDIES,
            planFor: planFor,
            variant: variant,
            jobsFor: jobsFor,
            planCost: planCost,
            jobCount: jobCount,
            groupRuns: groupRuns,
            stats: stats,
            compare: compare,
            slope: slope,
            arms: arms,
            resample: resample,
            analyse: analyse,
            decide: decide,
            makeRunner: makeRunner,
            metricOf: metricOf
        }
    });
})();
