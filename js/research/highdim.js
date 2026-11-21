/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "highdim": HIGH DIMENSIONS
   Five small calculators in one tool (tabs inside the tool, K.parts), each with
   its formula and a small seeded simulation that runs by itself (K.job):
     a. Length      of a Gaussian vector: exact mean and spread, a histogram of
                    2,000 lengths with the exact density and the normal curve
     b. Angle       between two random directions: exact tail of the cosine, its
                    normal approximation and a bound; how many directions fit
     c. Volume      the shell (1 − ε)^d, the unit ball and its share of the cube;
                    random points of the cube against the ball
     d. Projection  Johnson–Lindenstrauss: the k that keeps n points' distances;
                    a random projection of n points, all pairs checked
     e. Noise       Marchenko–Pastur: the eigenvalues of a pure-noise covariance;
                    and the excess risk of least squares
   The results are those of units t4 and r9 (S/r9/theory/TOPICS.md).
   Texts: js/content/research/highdim.js. The functions of section 1 are pure and
   are given to the tests as spec.maths (dev/tests/research.highdim.math.js).
    1. The numbers (pure)
    2. The simulations (pure, seeded, in pieces for K.job)
    3. The verdicts (pure)
    4. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["t4", "r9"];
    const SIM = {
        vectors: 2000, maxD: 2000,                 // (a), (b): 2,000 vectors or pairs, d up to 2,000
        cube: 10000, cubeMaxD: 1000,               // (c): 10,000 points of the cube, d up to 1,000
        jlPoints: 300,                             // (d): at most 300 of the n points are projected
        mpMaxN: 400, mpMaxP: 200                   // (e): n up to 400, p up to 200
    };
    const BINS = 40;
    // (Γ(z + ½)/Γ(z))² = z·Σ c_j·z^(−j): the asymptotic series, exact coefficients
    // (from Stirling's series with Bernoulli polynomials; dev/tests/research.highdim.ref.py checks them)
    const RATIO_SERIES = [1, -1 / 4, 1 / 32, 1 / 128, -5 / 2048, -23 / 8192, 53 / 65536, 593 / 262144, -5165 / 8388608, -110123 / 33554432, 231743 / 268435456];
    const SERIES_FROM = 30;              // z = d/2 from which the series is used (its error is then below 10⁻¹⁶)

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       ========================================================= */
    // (a) |x| for x ~ N(0, I_d): E|x| = √2·Γ((d + 1)/2)/Γ(d/2), Var|x| = d − (E|x|)².
    // Var is a small difference of large numbers: for d ≥ 60 it comes from the series
    // d − 2·(Γ(z + ½)/Γ(z))² = −2·Σ_(j ≥ 1) c_j·z^(1 − j) with z = d/2; below, from the
    // ratio built up exactly from Γ(1)/Γ(½) or Γ(3/2)/Γ(1)
    function gaussLength(d) {
        const z = d / 2;
        let variance;
        let mean;
        if (z >= SERIES_FROM) {
            variance = 0;
            for (let j = RATIO_SERIES.length - 1; j >= 1; j--) variance += RATIO_SERIES[j] * Math.pow(z, 1 - j);
            variance *= -2;
            mean = Math.sqrt(d - variance);
        } else {
            let ratio;
            let at;
            if (d % 2 === 0) {
                ratio = Math.sqrt(Math.PI) / 2;          // Γ(3/2)/Γ(1)
                at = 1;
            } else {
                ratio = 1 / Math.sqrt(Math.PI);         // Γ(1)/Γ(½)
                at = 0.5;
            }
            for (; at < z; at += 1) ratio *= (at + 0.5) / at;
            mean = Math.SQRT2 * ratio;
            variance = d - mean * mean;
        }
        const sd = Math.sqrt(variance);
        const lo = Math.max(0, mean - 2 * sd);
        const hi = mean + 2 * sd;
        const M = A.researchMath;
        const share = M.gammaP(d / 2, hi * hi / 2) - (lo > 0 ? M.gammaP(d / 2, lo * lo / 2) : 0);
        return { mean: mean, approx: Math.sqrt(d - 0.5), sd: sd, relWidth: sd / mean, lo: lo, hi: hi, share: share };
    }

    // The density of |x| (the chi distribution with d degrees of freedom)
    function chiDensity(r, d) {
        if (!(r > 0)) return d === 1 ? Math.sqrt(2 / Math.PI) : 0;
        return Math.exp((d - 1) * Math.log(r) - r * r / 2 - (d / 2 - 1) * Math.LN2 - A.researchMath.lnGamma(d / 2));
    }

    function normalDensity(x, mean, variance) {
        return Math.exp(-(x - mean) * (x - mean) / (2 * variance)) / Math.sqrt(2 * Math.PI * variance);
    }

    // (b) The cosine of the angle between two independent uniform directions in d ≥ 2 dimensions:
    // mean 0, sd 1/√d; P(|cos| ≥ t) = I_(1 − t²)((d − 1)/2, ½) exactly; 2·(1 − Φ(t·√d)) approximately;
    // at most 2·e^(−d·t²/2). Directions with every |cos| below t: N(N − 1)·e^(−d·t²/2) < 1 is enough
    // (union bound over pairs), so N = ⌈e^(d·t²/4)⌉ − 1 exist; lnN gives the size when it is huge
    // Below 10⁻³⁰⁰ a double loses digits and then holds nothing: lnExact is then null (the page says
    // only that the exact tail lies below the bound, which it always does), and lnNormal comes from
    // the asymptotic series 2·(1 − Φ(z)) = 2·φ(z)/z·(1 − 1/z² + 3/z⁴ − 15/z⁶ + 105/z⁸ − …), z > 36
    // there, so that the five terms are good to about 10⁻¹².
    const TINY_TAIL = 1e-300;
    function angle(d, t2) {
        const M = A.researchMath;
        const tail = M.betaI(1 - t2 * t2, (d - 1) / 2, 0.5);
        const lnDirections = d * t2 * t2 / 4;
        const raw = Math.exp(lnDirections);
        const z = t2 * Math.sqrt(d);
        const normal = 2 * M.normalSf(z);
        const q = 1 / (z * z);
        const lnNormal = normal >= TINY_TAIL ? Math.log(normal)
            : Math.LN2 - z * z / 2 - Math.log(z * Math.sqrt(2 * Math.PI)) + Math.log1p(q * (-1 + q * (3 + q * (-15 + q * 105))));
        return {
            sd: 1 / Math.sqrt(d),
            exact: tail,
            lnExact: tail >= TINY_TAIL ? Math.log(tail) : null,
            normal: normal,
            lnNormal: lnNormal,
            lnBound: Math.LN2 - d * t2 * t2 / 2,
            bound: Math.min(Infinity, 2 * Math.exp(-d * t2 * t2 / 2)),
            lnDirections: lnDirections,
            directions: raw < 1e15 ? Math.max(1, Math.ceil(raw) - 1) : null
        };
    }

    // The density of the cosine: (1 − c²)^((d − 3)/2)/B(½, (d − 1)/2)
    function cosineDensity(c, d) {
        if (!(Math.abs(c) < 1)) return 0;
        const M = A.researchMath;
        return Math.exp((d - 3) / 2 * Math.log1p(-c * c) - M.lnBeta(0.5, (d - 1) / 2));
    }

    // (c) Volume: the share of a d-ball inside radius 1 − ε, the unit ball's volume
    // π^(d/2)/Γ(d/2 + 1) and its share of the cube [−1, 1]^d, all with their natural logarithms
    function volume(d, eps) {
        const lnInside = d * Math.log1p(-eps);
        const lnBall = d / 2 * Math.log(Math.PI) - A.researchMath.lnGamma(d / 2 + 1);
        const lnCube = lnBall - d * Math.LN2;
        return {
            lnInside: lnInside, inside: Math.exp(lnInside), shell: -Math.expm1(lnInside),
            lnBall: lnBall, ball: Math.exp(lnBall), lnCube: lnCube, cube: Math.exp(lnCube)
        };
    }

    // (d) Johnson–Lindenstrauss (Dasgupta and Gupta): k ≥ 4·ln n/(ε²/2 − ε³/3) for 0 < ε < 1
    function jl(n, eps) {
        const raw = 4 * Math.log(n) / (eps * eps / 2 - eps * eps * eps / 3);
        return { raw: raw, k: Math.ceil(raw - 1e-9 * raw) };
    }

    // (e) Marchenko–Pastur for γ = p/n in (0, 1]: support [(1 − √γ)², (1 + √γ)²] and its density
    function mpEdges(gamma) {
        const root = Math.sqrt(gamma);
        return { a: (1 - root) * (1 - root), b: (1 + root) * (1 + root) };
    }

    function mpDensity(x, gamma) {
        const e = mpEdges(gamma);
        if (!(x > e.a && x < e.b)) return 0;
        return Math.sqrt((e.b - x) * (x - e.a)) / (2 * Math.PI * gamma * x);
    }

    // Least squares with p standard normal features and n examples: the expected excess risk from noise.
    //   p < n − 1:         σ²·p/(n − p − 1)                 (σ²·E tr (XᵀX)⁻¹, an inverse Wishart mean)
    //   p = n − 1, n, n + 1: infinite
    //   p > n + 1:         σ²·n/(p − n − 1) for the fit of smallest norm (σ²·E tr (XXᵀ)⁻¹). There the
    //                      fit also loses the share 1 − n/p of the signal, which is not "from noise".
    //   σ² = 0:            0 for every p (nothing to follow), never 0·∞
    // ("infinite for every p ≥ n − 1" would contradict the tool "Double descent" beyond the peak.)
    function lsRisk(n, p, s2) {
        if (s2 === 0) return 0;
        if (p < n - 1) return s2 * p / (n - p - 1);
        if (p > n + 1) return s2 * n / (p - n - 1);
        return Infinity;
    }

    // (d) n points always fit in n − 1 dimensions with every distance kept exactly (the span of
    // their differences), so a k from the lemma that is not below n − 1 says nothing new
    function verdictJl(n, k) {
        return { key: k >= n - 1 ? "research.highdim.d.verdictNoGain" : "research.highdim.d.verdict", tone: "info" };
    }

    // A histogram as densities: bins of equal width from lo to hi -> [[x0, x1, density], ...]
    function histogram(values, lo, hi, bins) {
        const counts = new Array(bins).fill(0);
        const width = (hi - lo) / bins;
        values.forEach(function (value) {
            let i = Math.floor((value - lo) / width);
            if (value === hi) i = bins - 1;
            if (i >= 0 && i < bins) counts[i] += 1;
        });
        return counts.map(function (count, i) { return [lo + i * width, lo + (i + 1) * width, count / (values.length * width)]; });
    }

    // lo and hi of a list, opened up a little so that no value sits on the edge
    function span(values) {
        let lo = Infinity;
        let hi = -Infinity;
        values.forEach(function (value) {
            if (value < lo) lo = value;
            if (value > hi) hi = value;
        });
        const pad = (hi - lo) * 0.02 || Math.abs(hi) * 0.02 || 0.01;
        return { lo: lo - pad, hi: hi + pad };
    }

    /* =========================================================
       2. THE SIMULATIONS (pure: seeded, in pieces)
       Each returns { step(count) -> true when finished, progress(), result() }.
       ========================================================= */
    function items(count, one, finish) {
        let i = 0;
        return {
            step: function (chunk) {
                const end = Math.min(count, i + Math.max(1, chunk));
                for (; i < end; i++) one(i);
                return i >= count;
            },
            progress: function () { return i / count; },
            result: finish
        };
    }

    // (a) lengths of `count` Gaussian vectors in d dimensions
    function simLengths(d, count, seed) {
        const rand = A.researchMath.rng(seed);
        const out = new Array(count);
        return items(count, function (i) {
            let sum = 0;
            for (let j = 0; j < d; j++) {
                const z = rand.normal();
                sum += z * z;
            }
            out[i] = Math.sqrt(sum);
        }, function () { return out; });
    }

    // (b) cosines of `count` pairs of independent Gaussian vectors (uniform directions)
    function simCosines(d, count, seed) {
        const rand = A.researchMath.rng(seed);
        const out = new Array(count);
        return items(count, function (i) {
            let xy = 0;
            let xx = 0;
            let yy = 0;
            for (let j = 0; j < d; j++) {
                const x = rand.normal();
                const y = rand.normal();
                xy += x * y;
                xx += x * x;
                yy += y * y;
            }
            out[i] = xy / Math.sqrt(xx * yy);
        }, function () { return out; });
    }

    // (c) lengths of `count` uniform points of the cube [−1, 1]^d
    function simCube(d, count, seed) {
        const rand = A.researchMath.rng(seed);
        const out = new Array(count);
        return items(count, function (i) {
            let sum = 0;
            for (let j = 0; j < d; j++) {
                const u = 2 * rand.uniform() - 1;
                sum += u * u;
            }
            out[i] = Math.sqrt(sum);
        }, function () {
            const inside = out.filter(function (r) { return r <= 1; }).length;
            return { lengths: out, inside: inside };
        });
    }

    // (d) the n unit vectors e_1 … e_n (all pairwise distances √2), projected by a k × n matrix of
    // N(0, 1/k) entries: the projected point i is column i. The ratio ‖Pe_i − Pe_j‖²/‖e_i − e_j‖² for
    // every pair. (Only the points' mutual geometry matters, so the same holds for these points in
    // any number of dimensions.) First the columns, then the pairs row by row.
    function simJl(n, k, eps, seed) {
        const rand = A.researchMath.rng(seed);
        const scale = 1 / Math.sqrt(k);
        const columns = [];
        const ratios = [];
        let pairRow = 0;
        return {
            step: function (chunk) {
                let budget = Math.max(1, chunk);
                while (budget > 0 && columns.length < n) {
                    const column = new Float64Array(k);
                    for (let r = 0; r < k; r++) column[r] = rand.normal() * scale;
                    columns.push(column);
                    budget -= 1;
                }
                while (budget > 0 && columns.length === n && pairRow < n - 1) {
                    const ci = columns[pairRow];
                    for (let j = pairRow + 1; j < n; j++) {
                        const cj = columns[j];
                        let sum = 0;
                        for (let r = 0; r < k; r++) {
                            const diff = ci[r] - cj[r];
                            sum += diff * diff;
                        }
                        ratios.push(sum / 2);
                    }
                    pairRow += 1;
                    budget -= 1;
                }
                return columns.length === n && pairRow >= n - 1;
            },
            progress: function () { return (columns.length + pairRow) / (2 * n - 1); },
            result: function () {
                let lo = Infinity;
                let hi = -Infinity;
                let outside = 0;
                ratios.forEach(function (ratio) {
                    if (ratio < lo) lo = ratio;
                    if (ratio > hi) hi = ratio;
                    if (ratio < 1 - eps || ratio > 1 + eps) outside += 1;
                });
                return { ratios: ratios, min: lo, max: hi, outside: outside, pairs: ratios.length };
            }
        };
    }

    // (e) the eigenvalues of XᵀX/n for an n × p matrix X of independent standard normal entries:
    // X row by row, then XᵀX/n, then Jacobi's rotations (M.eigSymStart) in pieces
    function simNoise(n, p, seed) {
        const M = A.researchMath;
        const rand = M.rng(seed);
        const S = [];
        for (let i = 0; i < p; i++) S.push(new Array(p).fill(0));
        let row = 0;
        let eig = null;
        const x = new Float64Array(p);
        return {
            step: function (chunk) {
                let budget = Math.max(1, chunk);
                while (budget > 0 && row < n) {
                    for (let j = 0; j < p; j++) x[j] = rand.normal();
                    for (let i = 0; i < p; i++) {
                        const xi = x[i];
                        const Si = S[i];
                        for (let j = i; j < p; j++) Si[j] += xi * x[j];
                    }
                    row += 1;
                    budget -= 1;
                }
                if (row < n) return false;
                if (!eig) {
                    for (let i = 0; i < p; i++) {
                        for (let j = i; j < p; j++) {
                            S[i][j] /= n;
                            S[j][i] = S[i][j];
                        }
                    }
                    eig = M.eigSymStart(S);
                    return false;
                }
                return eig.step(Math.max(1, Math.round(budget / 4)));
            },
            progress: function () { return 0.3 * row / n + (eig ? 0.7 * (typeof eig.progress === "function" ? eig.progress() : eig.progress || 0) : 0); },
            result: function () { return eig ? eig.result() : null; }
        };
    }

    // Runs a simulation to its end at once (the tests, and nothing on the page)
    function runAll(work) {
        while (!work.step(1000)) { /* on */ }
        return work.result();
    }

    /* =========================================================
       3. THE VERDICTS (pure: which sentence)
       ========================================================= */
    const THIN = 0.2;                 // ±2 sd within 20% of the mean: a thin shell (from d ≈ 50 on)
    const RARE = 0.05;                // |cos| ≥ t in fewer than 5% of pairs: nearly perpendicular

    function verdictLength(r) {
        return 2 * r.relWidth <= THIN ? { key: "research.highdim.a.verdictThin", tone: "info" } : { key: "research.highdim.a.verdictWide", tone: "info" };
    }

    // "at least N directions" is said only when it says something (N ≥ 2)
    function verdictAngle(r) {
        if (!(r.exact < RARE)) return { key: "research.highdim.b.verdictCommon", tone: "info" };
        return r.directions !== null && r.directions < 2 ? { key: "research.highdim.b.verdictRareFew", tone: "info" } : { key: "research.highdim.b.verdictRare", tone: "info" };
    }

    // in one dimension the "ball" is the segment [−1, 1] and fills the cube
    function verdictVolume(d) {
        return { key: d === 1 ? "research.highdim.c.verdictOne" : "research.highdim.c.verdict", tone: "info" };
    }

    // over: more features than examples (p > n), where the fit of smallest norm is meant
    function verdictNoise(risk, over) {
        if (!isFinite(risk)) return { key: "research.highdim.e.verdictInfinite", tone: "warn" };
        return { key: over ? "research.highdim.e.verdictOver" : "research.highdim.e.verdict", tone: "info" };
    }

    const maths = {
        gaussLength: gaussLength, chiDensity: chiDensity, angle: angle, cosineDensity: cosineDensity, volume: volume,
        jl: jl, mpEdges: mpEdges, mpDensity: mpDensity, lsRisk: lsRisk, histogram: histogram,
        simLengths: simLengths, simCosines: simCosines, simCube: simCube, simJl: simJl, simNoise: simNoise, runAll: runAll,
        verdictLength: verdictLength, verdictAngle: verdictAngle, verdictVolume: verdictVolume, verdictJl: verdictJl, verdictNoise: verdictNoise,
        RATIO_SERIES: RATIO_SERIES, SIM: SIM, THIN: THIN, RARE: RARE
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
        // A number from its natural logarithm, also far below 10⁻³⁰⁰ or above 10³⁰⁰ (2.3682×10⁻⁴⁰)
        function fromLn(lnValue, digits) {
            if (lnValue === -Infinity) return num(0);
            if (lnValue > -690 && lnValue < 690) return num(Math.exp(lnValue), { digits: digits || 5 });
            const log10 = lnValue / Math.LN10;
            let power = Math.floor(log10);
            let mantissa = Number(Math.pow(10, log10 - power).toPrecision(digits || 5));
            if (mantissa >= 10) {
                mantissa /= 10;
                power += 1;
            }
            return num(mantissa, { digits: digits || 5 }) + "×10" + kit.superscript(power);
        }
        // A result row given by its logarithm: the text, the exact value and the logarithm on the row
        function lnRow(panel, name, labelKey, hintKey) {
            const row = panel.result({ name: name, labelKey: labelKey, kind: "text", hintKey: hintKey });
            const set = row.set;
            row.putLn = function (lnValue, extra, digits) {
                set(fromLn(lnValue, digits), extra);
                if (lnValue > -745 && lnValue < 709) row.element.setAttribute("data-value", String(Math.exp(lnValue)));
                else row.element.removeAttribute("data-value");
                row.element.setAttribute("data-ln", String(lnValue));
            };
            return row;
        }
        // The note under a simulation: what ran, with which seed (or why it did not)
        function simNote(panel) {
            const note = K.remark(panel.below, { key: noText, tone: "info" });
            note.hidden(true);
            return {
                say: function (key, values) {
                    note.set(function () { return t(key, values); }, "info");
                    note.hidden(false);
                },
                hide: function () { note.hidden(true); }
            };
        }
        // A chart with nothing to show is hidden (also from screen readers, so that no old
        // description is read), and shown again with its next drawing
        function hide(chart) {
            chart.clear();
            chart.element.hidden = true;
        }
        function show(chart, spec) {
            chart.element.hidden = false;
            chart.set(spec);
        }
        function vline(x, lo, hi) {
            return [[x, lo], [x, hi]];
        }

        const parts = K.parts(stage, {
            name: "part",
            labelKey: "research.highdim.parts",
            items: [
                { id: "length", labelKey: "research.highdim.part.length" },
                { id: "angle", labelKey: "research.highdim.part.angle" },
                { id: "volume", labelKey: "research.highdim.part.volume" },
                { id: "jl", labelKey: "research.highdim.part.jl" },
                { id: "noise", labelKey: "research.highdim.part.noise" }
            ]
        });

        /* ----- (a) The length of a Gaussian vector ----- */
        const a = (function () {
            const panel = K.panel(parts.panels.length, { questionKey: "research.highdim.a.question", titleKey: "research.highdim.part.length", onChange: refresh });
            panel.field({ name: "a.d", labelKey: "research.highdim.d", kind: "int", min: 1, max: 1e6, value: 100, powers: true });
            panel.field({ name: "a.seed", labelKey: "research.highdim.seed", kind: "int", min: 0, max: 1e9, value: 1, hintKey: "research.highdim.seedHint" });
            const mean = panel.result({ name: "mean", labelKey: "research.highdim.a.mean", digits: 6 });
            const approx = panel.result({ name: "approx", labelKey: "research.highdim.a.approx", digits: 6, hintKey: "research.highdim.a.approxHint" });
            const sd = panel.result({ name: "sd", labelKey: "research.highdim.a.sd", digits: 5 });
            const rel = panel.result({ name: "rel", labelKey: "research.highdim.a.rel", kind: "percent", digits: 3 });
            const share = panel.result({ name: "share", labelKey: "research.highdim.a.share", kind: "percent", digits: 4 });
            const job = panel.job();
            const chart = panel.chart({ labelKey: "research.highdim.a.chart", height: 240, x: { labelKey: "research.highdim.a.axisLength" }, y: { labelKey: "research.highdim.axisDensity" } }, "below");
            const note = simNote(panel);
            panel.formula({ key: "research.highdim.a.formula" });
            panel.source({ nameKey: "research.highdim.a.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) {
                    job.quiet();
                    note.hide();
                    hide(chart);
                    return;
                }
                const d = v["a.d"];
                const seed = v["a.seed"];
                const r = gaussLength(d);
                const words = { d: String(d), mean: w(r.mean, 6), approx: w(r.approx, 6), sd: w(r.sd), rel: w(r.relWidth, 4), lo: w(r.lo), hi: w(r.hi), share: w(r.share, 5) };
                mean.set(r.mean, { formula: t("research.highdim.a.meanWork", words) });
                approx.set(r.approx, { formula: t("research.highdim.a.approxWork", words) });
                sd.set(r.sd, { formula: t("research.highdim.a.sdWork", words) });
                rel.set(r.relWidth, { formula: t("research.highdim.a.relWork", words) });
                share.set(r.share, { formula: t("research.highdim.a.shareWork", words) });
                const said = verdictLength(r);
                panel.verdict.set(t(said.key, { d: num(d), dims: A.plural("research.highdim.dims", d), lo: num(r.lo, 4), hi: num(r.hi, 4), share: num(r.share, { percent: true, digits: 3 }) }), said.tone);
                if (d > SIM.maxD) {
                    job.quiet();
                    hide(chart);
                    note.say("research.highdim.simTooBig", { max: num(SIM.maxD) });
                    return;
                }
                note.say("research.highdim.simRunning", {});
                const work = simLengths(d, SIM.vectors, seed);
                job.start(work, {
                    chunk: Math.max(1, Math.floor(20000 / d)),
                    onDone: function () {
                        const lengths = work.result();
                        const range = span(lengths.concat([Math.max(0, r.approx - 3 * Math.SQRT1_2), r.approx + 3 * Math.SQRT1_2]));
                        const lo = Math.max(0, range.lo);
                        const curve = [];
                        const approxCurve = [];
                        for (let i = 0; i <= 120; i++) {
                            const x = lo + (range.hi - lo) * i / 120;
                            curve.push([x, chiDensity(x, d)]);
                            approxCurve.push([x, normalDensity(x, r.approx, 0.5)]);
                        }
                        let m = 0;
                        lengths.forEach(function (value) { m += value; });
                        m /= lengths.length;
                        let s = 0;
                        lengths.forEach(function (value) { s += (value - m) * (value - m); });
                        s = Math.sqrt(s / (lengths.length - 1));
                        show(chart, {
                            x: { labelKey: "research.highdim.a.axisLength", min: lo, max: range.hi },
                            y: { labelKey: "research.highdim.axisDensity", min: 0 },
                            series: [
                                { kind: "bars", data: histogram(lengths, lo, range.hi, BINS), colorIndex: 0, labelKey: "research.highdim.seriesSim" },
                                { kind: "line", data: curve, colorIndex: 1, labelKey: "research.highdim.a.seriesExact" },
                                { kind: "line", data: approxCurve, colorIndex: 2, dash: true, labelKey: "research.highdim.a.seriesNormal" }
                            ],
                            describe: function () { return t("research.highdim.a.describe", { count: num(SIM.vectors), d: num(d), mean: num(m, 5), sd: num(s, 4) }); }
                        });
                        note.say("research.highdim.a.simNote", { count: num(SIM.vectors), d: num(d), seed: String(seed), mean: num(m, 5), sd: num(s, 4) });
                    }
                });
            }
            return { refresh: refresh };
        })();

        /* ----- (b) The angle between two random directions ----- */
        const b = (function () {
            const panel = K.panel(parts.panels.angle, { questionKey: "research.highdim.b.question", titleKey: "research.highdim.part.angle", onChange: refresh });
            panel.field({ name: "b.d", labelKey: "research.highdim.d", kind: "int", min: 2, max: 1e6, value: 1000, powers: true });
            panel.field({ name: "b.t", labelKey: "research.highdim.b.t", kind: "number", min: 0, minOpen: true, max: 1, maxOpen: true, value: 0.1 });
            panel.field({ name: "b.seed", labelKey: "research.highdim.seed", kind: "int", min: 0, max: 1e9, value: 1, hintKey: "research.highdim.seedHint" });
            const sd = panel.result({ name: "sd", labelKey: "research.highdim.b.sd", digits: 5 });
            const exact = lnRow(panel, "exact", "research.highdim.b.exact");
            const normal = lnRow(panel, "normal", "research.highdim.b.normal", "research.highdim.b.normalHint");
            const bound = lnRow(panel, "bound", "research.highdim.b.bound", "research.highdim.b.boundHint");
            const directions = lnRow(panel, "directions", "research.highdim.b.directions", "research.highdim.b.directionsHint");
            const job = panel.job();
            const chart = panel.chart({ labelKey: "research.highdim.b.chart", height: 240, x: { labelKey: "research.highdim.b.axisCos" }, y: { labelKey: "research.highdim.axisDensity" } }, "below");
            const note = simNote(panel);
            panel.formula({ key: "research.highdim.b.formula" });
            panel.source({ nameKey: "research.highdim.b.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) {
                    job.quiet();
                    note.hide();
                    hide(chart);
                    return;
                }
                const d = v["b.d"];
                const tt = v["b.t"];
                const seed = v["b.seed"];
                const r = angle(d, tt);
                const lnExact = r.lnExact;
                const lnNormal = r.lnNormal;
                const words = {
                    d: String(d), t: exactly(tt), sd: w(r.sd), a: w((d - 1) / 2, 8), x: w(1 - tt * tt, 8), z: w(tt * Math.sqrt(d), 6),
                    exact: lnExact === null ? t("research.highdim.below", { v: fromLn(r.lnBound, 4) }) : fromLn(lnExact), normal: fromLn(lnNormal), bound: fromLn(r.lnBound), n: r.directions !== null ? num(r.directions) : fromLn(r.lnDirections, 4),
                    power: w(d * tt * tt / 4, 6)
                };
                sd.set(r.sd, { formula: t("research.highdim.b.sdWork", words) });
                if (lnExact === null) {
                    exact.set(words.exact, { formula: t("research.highdim.b.exactTiny", words) });
                    exact.element.removeAttribute("data-value");
                    exact.element.removeAttribute("data-ln");
                    exact.element.setAttribute("data-below-ln", String(r.lnBound));
                } else {
                    exact.element.removeAttribute("data-below-ln");
                    exact.putLn(lnExact, { formula: t("research.highdim.b.exactWork", words) });
                }
                normal.putLn(lnNormal, { formula: t("research.highdim.b.normalWork", words) });
                bound.putLn(r.lnBound, { formula: t("research.highdim.b.boundWork", words) });
                if (r.directions !== null) {
                    directions.set(num(r.directions), { formula: t("research.highdim.b.directionsWork", words) });
                    directions.element.setAttribute("data-value", String(r.directions));
                    directions.element.setAttribute("data-ln", String(r.lnDirections));
                } else {
                    directions.putLn(r.lnDirections, { formula: t("research.highdim.b.directionsWorkHuge", words) }, 4);
                }
                const said = verdictAngle(r);
                // |cos| ≥ t is an angle arcsin(t) or more away from a right angle
                panel.verdict.set(t(said.key, {
                    d: num(d), dims: A.plural("research.highdim.dims", d), t: num(tt, { digits: 12 }), p: lnExact === null ? words.exact : fromLn(lnExact, 3),
                    share: num(r.exact, { percent: true, digits: 3 }), n: words.n, deg: num(Math.asin(tt) * 180 / Math.PI, 3), sd: num(r.sd, 3)
                }), said.tone);
                if (d > SIM.maxD) {
                    job.quiet();
                    hide(chart);
                    note.say("research.highdim.simTooBig", { max: num(SIM.maxD) });
                    return;
                }
                note.say("research.highdim.simRunning", {});
                const work = simCosines(d, SIM.vectors, seed);
                job.start(work, {
                    chunk: Math.max(1, Math.floor(10000 / d)),
                    onDone: function () {
                        const cosines = work.result();
                        const reach = Math.min(1, Math.max(4.5 / Math.sqrt(d), span(cosines).hi, -span(cosines).lo));
                        const curve = [];
                        const approxCurve = [];
                        for (let i = 0; i <= 160; i++) {
                            const c = -reach + 2 * reach * i / 160;
                            curve.push([c, cosineDensity(c, d)]);
                            approxCurve.push([c, normalDensity(c, 0, 1 / d)]);
                        }
                        const beyond = cosines.filter(function (c) { return Math.abs(c) >= tt; }).length;
                        const top = 1.6 * Math.max(normalDensity(0, 0, 1 / d), cosineDensity(0, d));
                        show(chart, {
                            x: { labelKey: "research.highdim.b.axisCos", min: -reach, max: reach },
                            y: { labelKey: "research.highdim.axisDensity", min: 0, max: top },
                            series: [
                                { kind: "bars", data: histogram(cosines, -reach, reach, BINS), colorIndex: 0, labelKey: "research.highdim.seriesSim" },
                                { kind: "line", data: curve, colorIndex: 1, labelKey: "research.highdim.b.seriesExact" },
                                { kind: "line", data: approxCurve, colorIndex: 2, dash: true, labelKey: "research.highdim.b.seriesNormal" },
                                { kind: "line", data: vline(tt, 0, top), colorIndex: 3, dash: true, labelKey: "research.highdim.b.seriesT" },
                                { kind: "line", data: vline(-tt, 0, top), colorIndex: 3, dash: true }
                            ],
                            describe: function () { return t("research.highdim.b.describe", { count: num(SIM.vectors), d: num(d), beyond: num(beyond), t: num(tt, { digits: 12 }) }); }
                        });
                        note.say("research.highdim.b.simNote", { count: num(SIM.vectors), d: num(d), seed: String(seed), beyond: num(beyond), share: num(beyond / SIM.vectors, { percent: true, digits: 3 }), t: num(tt, { digits: 12 }) });
                    }
                });
            }
            return { refresh: refresh };
        })();

        /* ----- (c) Volume ----- */
        const c = (function () {
            const panel = K.panel(parts.panels.volume, { questionKey: "research.highdim.c.question", titleKey: "research.highdim.part.volume", onChange: refresh });
            panel.field({ name: "c.d", labelKey: "research.highdim.d", kind: "int", min: 1, max: 1e6, value: 100, powers: true });
            panel.field({ name: "c.eps", labelKey: "research.highdim.c.eps", kind: "number", min: 0, minOpen: true, max: 1, maxOpen: true, value: 0.05 });
            panel.field({ name: "c.seed", labelKey: "research.highdim.seed", kind: "int", min: 0, max: 1e9, value: 1, hintKey: "research.highdim.seedHint" });
            const inside = lnRow(panel, "inside", "research.highdim.c.inside");
            const shell = panel.result({ name: "shell", labelKey: "research.highdim.c.shell", kind: "percent", digits: 4 });
            const ball = lnRow(panel, "ball", "research.highdim.c.ball");
            const cube = lnRow(panel, "cube", "research.highdim.c.cube", "research.highdim.c.cubeHint");
            const job = panel.job();
            const chart = panel.chart({ labelKey: "research.highdim.c.chart", height: 240, x: { labelKey: "research.highdim.c.axisLength" }, y: { labelKey: "research.highdim.axisDensity" } }, "below");
            const note = simNote(panel);
            panel.formula({ key: "research.highdim.c.formula" });
            panel.source({ nameKey: "research.highdim.c.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) {
                    job.quiet();
                    note.hide();
                    hide(chart);
                    return;
                }
                const d = v["c.d"];
                const eps = v["c.eps"];
                const seed = v["c.seed"];
                const r = volume(d, eps);
                const words = { d: String(d), eps: exactly(eps), inside: fromLn(r.lnInside), shell: w(r.shell, 5), ball: fromLn(r.lnBall), cube: fromLn(r.lnCube), half: w(d / 2, 8) };
                inside.putLn(r.lnInside, { formula: t("research.highdim.c.insideWork", words) });
                shell.set(r.shell, { formula: t("research.highdim.c.shellWork", words) });
                ball.putLn(r.lnBall, { formula: t("research.highdim.c.ballWork", words) });
                cube.putLn(r.lnCube, { formula: t("research.highdim.c.cubeWork", words) });
                panel.verdict.set(t(verdictVolume(d).key, { d: num(d), dims: A.plural("research.highdim.dims", d), eps: num(eps, { digits: 12 }), shell: num(r.shell, { percent: true, digits: 4 }), cube: fromLn(r.lnCube, 3) }), "info");
                if (d > SIM.cubeMaxD) {
                    job.quiet();
                    hide(chart);
                    note.say("research.highdim.simTooBig", { max: num(SIM.cubeMaxD) });
                    return;
                }
                note.say("research.highdim.simRunning", {});
                const work = simCube(d, SIM.cube, seed);
                job.start(work, {
                    chunk: Math.max(1, Math.floor(40000 / d)),
                    onDone: function () {
                        const out = work.result();
                        const range = span(out.lengths.concat([0, 1.05]));
                        const lo = Math.max(0, range.lo);
                        const bars = histogram(out.lengths, lo, range.hi, BINS);
                        const top = Math.max.apply(null, bars.map(function (bar) { return bar[2]; })) * 1.1;
                        show(chart, {
                            x: { labelKey: "research.highdim.c.axisLength", min: lo, max: range.hi },
                            y: { labelKey: "research.highdim.axisDensity", min: 0, max: top },
                            series: [
                                { kind: "bars", data: bars, colorIndex: 0, labelKey: "research.highdim.c.seriesCube" },
                                { kind: "line", data: vline(1, 0, top), colorIndex: 3, dash: true, labelKey: "research.highdim.c.seriesBall" }
                            ],
                            describe: function () { return t("research.highdim.c.describe", { count: num(SIM.cube), d: num(d), inside: num(out.inside), mean: num(Math.sqrt(d / 3), 4) }); }
                        });
                        note.say("research.highdim.c.simNote", { count: num(SIM.cube), d: num(d), seed: String(seed), inside: num(out.inside), expected: fromLn(r.lnCube + Math.log(SIM.cube), 3) });
                    }
                });
            }
            return { refresh: refresh };
        })();

        /* ----- (d) Random projection ----- */
        const d = (function () {
            const panel = K.panel(parts.panels.jl, { questionKey: "research.highdim.d.question", titleKey: "research.highdim.part.jl", onChange: refresh });
            panel.field({ name: "d.n", labelKey: "research.highdim.d.n", kind: "int", min: 2, max: 1e15, value: 1000, powers: true });
            panel.field({ name: "d.eps", labelKey: "research.highdim.d.eps", kind: "number", min: 0, minOpen: true, max: 1, maxOpen: true, value: 0.2 });
            panel.field({ name: "d.seed", labelKey: "research.highdim.seed", kind: "int", min: 0, max: 1e9, value: 1, hintKey: "research.highdim.seedHint" });
            const raw = panel.result({ name: "raw", labelKey: "research.highdim.d.raw", digits: 5 });
            const k = panel.result({ name: "k", labelKey: "research.highdim.d.k", kind: "int", hintKey: "research.highdim.d.kHint" });
            const job = panel.job();
            const chart = panel.chart({ labelKey: "research.highdim.d.chart", height: 240, x: { labelKey: "research.highdim.d.axisRatio" }, y: { labelKey: "research.highdim.axisDensity" } }, "below");
            const note = simNote(panel);
            panel.formula({ key: "research.highdim.d.formula" });
            panel.source({ nameKey: "research.highdim.d.source", units: UNITS });

            function refresh() {
                const v = panel.values();
                if (!v) {
                    job.quiet();
                    note.hide();
                    hide(chart);
                    return;
                }
                const n = v["d.n"];
                const eps = v["d.eps"];
                const seed = v["d.seed"];
                const r = jl(n, eps);
                const words = { n: String(n), eps: exactly(eps), ln: w(Math.log(n), 6), den: w(eps * eps / 2 - eps * eps * eps / 3, 6), raw: w(r.raw, 6), k: String(r.k) };
                raw.set(r.raw, { formula: t("research.highdim.d.rawWork", words) });
                k.set(r.k, { formula: t("research.highdim.d.kWork", words) });
                const saidJl = verdictJl(n, r.k);
                panel.verdict.set(t(saidJl.key, { n: num(n), eps: num(eps, { digits: 12 }), k: num(r.k), n1: num(n - 1) }), saidJl.tone);
                const m = Math.min(n, SIM.jlPoints);
                note.say("research.highdim.simRunning", {});
                const work = simJl(m, r.k, eps, seed);
                job.start(work, {
                    chunk: Math.max(1, Math.floor(200000 / (r.k * m))),
                    onDone: function () {
                        const out = work.result();
                        const lo = Math.min(1 - eps, out.min) - 0.02;
                        const hi = Math.max(1 + eps, out.max) + 0.02;
                        const bars = histogram(out.ratios, lo, hi, BINS);
                        const top = Math.max.apply(null, bars.map(function (bar) { return bar[2]; })) * 1.1;
                        show(chart, {
                            x: { labelKey: "research.highdim.d.axisRatio", min: lo, max: hi },
                            y: { labelKey: "research.highdim.axisDensity", min: 0, max: top },
                            series: [
                                { kind: "bars", data: bars, colorIndex: 0, labelKey: "research.highdim.d.seriesPairs" },
                                { kind: "line", data: vline(1 - eps, 0, top), colorIndex: 3, dash: true, labelKey: "research.highdim.d.seriesLimits" },
                                { kind: "line", data: vline(1 + eps, 0, top), colorIndex: 3, dash: true }
                            ],
                            describe: function () { return t("research.highdim.d.describe", { pairs: num(out.pairs), min: num(out.min, 4), max: num(out.max, 4), outside: num(out.outside) }); }
                        });
                        note.say(m < n ? "research.highdim.d.simNoteSome" : "research.highdim.d.simNote", {
                            m: num(m), n: num(n), k: num(r.k), seed: String(seed), pairs: num(out.pairs), min: num(out.min, 4), max: num(out.max, 4), outside: num(out.outside)
                        });
                    }
                });
            }
            return { refresh: refresh };
        })();

        /* ----- (e) The spectrum of pure noise ----- */
        const e = (function () {
            const panel = K.panel(parts.panels.noise, { questionKey: "research.highdim.e.question", titleKey: "research.highdim.part.noise", onChange: refresh });
            panel.field({ name: "e.gamma", labelKey: "research.highdim.e.gamma", kind: "number", min: 0, minOpen: true, max: 1, value: 0.25, hintKey: "research.highdim.e.gammaHint" });
            panel.field({ name: "e.x", labelKey: "research.highdim.e.x", kind: "number", min: 0, minOpen: true, max: 100, value: 1 });
            panel.field({ name: "e.n", labelKey: "research.highdim.e.n", kind: "int", min: 10, max: SIM.mpMaxN, value: SIM.mpMaxN, hintKey: "research.highdim.e.nHint" });
            panel.field({ name: "e.seed", labelKey: "research.highdim.seed", kind: "int", min: 0, max: 1e9, value: 1, hintKey: "research.highdim.seedHint" });
            const fLsN = panel.field({ name: "e.lsN", labelKey: "research.highdim.e.lsN", kind: "int", min: 2, max: 1e9, value: 101 });
            const fLsP = panel.field({ name: "e.lsP", labelKey: "research.highdim.e.lsP", kind: "int", min: 1, max: 1e9, value: 50 });
            panel.field({ name: "e.s2", labelKey: "research.highdim.e.s2", kind: "number", min: 0, max: 1e12, value: 1 });
            const edgeA = panel.result({ name: "a", labelKey: "research.highdim.e.a", digits: 5 });
            const edgeB = panel.result({ name: "b", labelKey: "research.highdim.e.b", digits: 5 });
            const density = panel.result({ name: "density", labelKey: "research.highdim.e.density", digits: 5 });
            panel.heading("research.highdim.e.lsHead");
            const risk = panel.result({ name: "risk", labelKey: "research.highdim.e.risk", kind: "text", hintKey: "research.highdim.e.riskHint" });
            const job = panel.job();
            const chart = panel.chart({ labelKey: "research.highdim.e.chart", height: 240, x: { labelKey: "research.highdim.e.axisEig" }, y: { labelKey: "research.highdim.axisDensity" } }, "below");
            const note = simNote(panel);
            panel.formula({ key: "research.highdim.e.formula" });
            panel.source({ nameKey: "research.highdim.e.source", units: UNITS });
            let lastSim = "";

            function refresh() {
                const nLs = fLsN.value();
                if (!isNaN(nLs)) fLsP.setLimits({ max: Math.max(1, nLs * 10) });
                const v = panel.values();
                if (!v) {
                    job.quiet();
                    note.hide();
                    hide(chart);
                    lastSim = "";
                    return;
                }
                const gamma = v["e.gamma"];
                const x = v["e.x"];
                const edges = mpEdges(gamma);
                const words = { g: exactly(gamma), root: w(Math.sqrt(gamma), 6), a: w(edges.a), b: w(edges.b), x: exactly(x), dens: w(mpDensity(x, gamma)) };
                edgeA.set(edges.a, { formula: t("research.highdim.e.aWork", words) });
                edgeB.set(edges.b, { formula: t("research.highdim.e.bWork", words) });
                density.set(mpDensity(x, gamma), { formula: t(x > edges.a && x < edges.b ? "research.highdim.e.densityWork" : "research.highdim.e.densityOutside", words) });
                const ls = lsRisk(v["e.lsN"], v["e.lsP"], v["e.s2"]);
                const lsWords = { n: String(v["e.lsN"]), p: String(v["e.lsP"]), s2: exactly(v["e.s2"]), risk: w(ls) };
                // which formula gave the number: the classical one, the fit of smallest norm (p > n + 1), or no noise
                let riskKey = "research.highdim.e.riskWork";
                if (v["e.s2"] === 0 && v["e.lsP"] >= v["e.lsN"] - 1) riskKey = "research.highdim.e.riskNoNoise";
                else if (v["e.lsP"] > v["e.lsN"] + 1) riskKey = "research.highdim.e.riskOver";
                if (isFinite(ls)) risk.set(num(ls, 5), { formula: t(riskKey, lsWords) });
                else risk.set(t("research.highdim.infinite"), { formula: t("research.highdim.e.riskInfinite", lsWords), tone: "bad" });
                risk.element.setAttribute("data-value", String(ls));
                const said = verdictNoise(ls, v["e.lsP"] > v["e.lsN"]);
                panel.verdict.set(t(said.key, {
                    g: num(gamma, { digits: 12 }), a: num(edges.a, 4), b: num(edges.b, 4), over: num(edges.b, 3),
                    n: num(v["e.lsN"]), p: num(v["e.lsP"]), risk: num(ls, 4), s2: num(v["e.s2"], { digits: 12 }),
                    lost: num(Math.max(0, 1 - v["e.lsN"] / v["e.lsP"]), 3)
                }), said.tone);

                // the simulation: p = γ·n rounded, at most 200 (n is lowered to keep γ)
                let nSim = v["e.n"];
                let p = Math.round(gamma * nSim);
                if (p > SIM.mpMaxP) {
                    nSim = Math.floor(SIM.mpMaxP / gamma);
                    p = Math.round(gamma * nSim);
                }
                const seed = v["e.seed"];
                if (p < 2) {
                    job.quiet();
                    hide(chart);
                    lastSim = "";
                    note.say("research.highdim.e.simTooSmall", { n: num(nSim) });
                    return;
                }
                // the eigenvalues take a moment: run again only when the simulation's own inputs change
                const key = [nSim, p, seed, gamma].join(" ");
                if (key === lastSim && !job.running()) return;
                lastSim = key;
                const gSim = p / nSim;
                note.say("research.highdim.simRunning", {});
                const work = simNoise(nSim, p, seed);
                job.start(work, {
                    chunk: Math.max(4, Math.floor(40000 / (p * p))),
                    onStop: function () { lastSim = ""; },
                    onDone: function () {
                        const out = work.result();
                        if (!out || !out.ok) {
                            lastSim = "";
                            note.say("research.highdim.e.simFailed", {});
                            return;
                        }
                        const values = out.values;
                        const simEdges = mpEdges(gSim);
                        const lo = Math.max(0, Math.min(values[0], simEdges.a) - 0.05);
                        const hi = Math.max(values[values.length - 1], simEdges.b) + 0.05;
                        const curve = [];
                        for (let i = 0; i <= 200; i++) {
                            const at = lo + (hi - lo) * i / 200;
                            curve.push([at, mpDensity(at, gSim)]);
                        }
                        show(chart, {
                            x: { labelKey: "research.highdim.e.axisEig", min: lo, max: hi },
                            y: { labelKey: "research.highdim.axisDensity", min: 0 },
                            series: [
                                { kind: "bars", data: histogram(values, lo, hi, Math.min(BINS, Math.max(10, Math.round(p / 4)))), colorIndex: 0, labelKey: "research.highdim.e.seriesEig" },
                                { kind: "line", data: curve, colorIndex: 1, labelKey: "research.highdim.e.seriesMp" }
                            ],
                            describe: function () { return t("research.highdim.e.describe", { p: num(p), n: num(nSim), min: num(values[0], 4), max: num(values[values.length - 1], 4), a: num(simEdges.a, 4), b: num(simEdges.b, 4) }); }
                        });
                        note.say("research.highdim.e.simNote", {
                            n: num(nSim), p: num(p), g: num(gSim, 4), seed: String(seed),
                            min: num(values[0], 4), max: num(values[values.length - 1], 4), a: num(simEdges.a, 4), b: num(simEdges.b, 4)
                        });
                    }
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

    A.research.define("highdim", { create: create, maths: maths });
})();
