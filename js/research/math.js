/* =========================================================
   AI COMPASS — THE RESEARCH LAB: SHARED MATHS (AICompass.researchMath, called "M")
   The numerical functions that the bench tools and the experiment station
   share. Pure functions: nothing here touches the page, so the same file
   runs in the browser (A.researchMath) and in Node (require), where
   dev/tests/research.math.js checks every function against values that were
   computed in another way.
   js/research.js loads this file before the first tool opens.

   ACCURACY. The distribution functions are right to at least 10 significant
   digits over their whole range, far tails included (the test compares 870
   values with ones computed to 140 digits; the largest error is 10⁻¹²).
   A function that cannot answer (a parameter outside its range, text in place
   of a number) returns NaN or null, never a wrong number: a tool checks its
   inputs first and shows a message.
   ONE THING TO KNOW. A probability close to 1 has lost the digits of its tail
   before it arrives here (1 − 10⁻²⁰ is just 1 for a computer). Ask for the
   small side: normalSf, tSf, chi2Sf, fSf, gammaQ, betaIc, binomSf give the
   upper tail directly, and betaInv(1 − p, b, a) is the distance of
   betaInv(p, a, b) from 1.

   M AT A GLANCE (each function has its line of explanation where it is written)
   Special functions
     lnGamma(x)   lnBeta(a, b)   erf(x)   erfc(x)
     gammaP(a, x)   gammaQ(a, x)   gammaInv(p, a)        the regularised incomplete gamma function
     betaI(x, a, b)   betaIc(x, a, b)   betaInv(p, a, b)   the regularised incomplete beta function
   Distributions
     normalPdf(z)   normalCdf(z)   normalSf(z)   normalInv(p)   zFor(confidence)
     tPdf(t, df)   tCdf(t, df)   tSf(t, df)   tInv(p, df)   tFor(confidence, df)
     chi2Cdf(x, k)   chi2Sf(x, k)   chi2Inv(p, k)   fCdf(x, d1, d2)   fSf(x, d1, d2)
     binomPmf(k, n, p)   binomCdf(k, n, p)   binomSf(k, n, p)
   Describing numbers
     sum   mean   variance   sd   sem   min   max   median   quantile(list, q)
     correlation(xs, ys)   linearFit(xs, ys)
   Intervals and tests
     wilson(p, n, confidence)   wilsonN(p, half, confidence)   waldN(p, half, confidence)
     clopperPearson(k, n, confidence)   twoProportions(pA, nA, pB, nB, confidence)   mcnemar(b, c)
     tInterval(list, confidence)   welch(a, b, confidence)   pairedT(a, b, confidence)
     effectSize(a, b)   superiority(a, b)
     bootstrap(lists, stat, options)   bootstrapStart(lists, stat, options)
     bonferroni(ps)   holm(ps)   benjaminiHochberg(ps)
   Information
     entropy(p, unit)   crossEntropy(p, q, unit)   kl(p, q, unit)   jensenShannon(p, q, unit)
     binaryEntropy(p, unit)   klBernoulli(p, q, unit)            unit: "bits" (default) or "nats"
   Chance
     rng(seed) -> { seed, uniform(), normal(), gamma(shape), beta(a, b), int(n), shuffle(array), uint32() }
   Matrices (a matrix is an array of rows: [[1, 2], [3, 4]])
     cholesky(A)   choleskySolve(L, b)   solveSpd(A, b)   eigSym(A, options)   eigSymStart(A, options)
     transpose(A)   matMul(A, B)   matVec(A, x)   gram(X)   dot(x, y)
   Numerics
     integrate(f, a, b, n)   bisect(f, lo, hi, options)   minimise(f, lo, hi, tolerance)

   Sections of this file:
    1. Constants and small helpers        7. Describing numbers
    2. The gamma function                 8. Intervals and tests
    3. The incomplete gamma function      9. Resampling and many comparisons
    4. The incomplete beta function      10. Information
    5. The normal distribution           11. Random numbers
    6. Student's t, chi-square, F,       12. Matrices
       binomial                          13. Numerics, and the list of what M has

   WHY THIS FILE DOES NOT START LIKE THE OTHERS. Every other script of the site
   begins with "const A = window.AICompass". This one must also run in Node,
   where there is no window, so its first lines look at where it is.
   ========================================================= */

/* global module -- Node's name for "what this file gives to the file that asked for it" */
(function (root, factory) {
    "use strict";
    const M = factory();
    if (typeof module === "object" && module && module.exports) module.exports = M;     // Node: require("js/research/math.js")
    if (root && root.AICompass) root.AICompass.researchMath = M;                        // the browser: A.researchMath
})(typeof window !== "undefined" ? window : null, function () {
    "use strict";

    /* =========================================================
       1. CONSTANTS AND SMALL HELPERS
       ========================================================= */
    const EPS = 2.220446049250313e-16;       // the gap between 1 and the next number a computer can store
    const CLOSE = 4 * EPS;                   // "these two numbers are the same": a few of those gaps
    const TINY = 1e-300;                     // stands in for 0 inside a continued fraction (dividing by 0 would end it)
    const MAX_TERMS = 3000000;               // a sum or a fraction that needs more terms than this gives NaN
    const HALF_LN_2PI = 0.9189385332046727;  // ln(2π)/2
    const SQRT_2PI = 2.5066282746310002;     // √(2π)
    const SQRT2 = Math.SQRT2;

    function isNumber(value) {
        return typeof value === "number" && isFinite(value);
    }

    function clamp01(value) {
        return value < 0 ? 0 : value > 1 ? 1 : value;
    }

    // e − ln(1 + e), for e > −1. Near 0 the two parts are almost equal and their difference
    // would lose its digits, so there the series e²/2 − e³/3 + e⁴/4 − … is added up instead.
    function rlog1(e) {
        if (Math.abs(e) > 0.1) return e - Math.log1p(e);
        const m = -e;
        let power = m * m;
        let total = power / 2;
        for (let k = 3; k < 80; k++) {
            power *= m;
            const term = power / k;
            total += term;
            if (Math.abs(term) <= Math.abs(total) * 1e-17) break;
        }
        return total;
    }

    /* =========================================================
       2. THE GAMMA FUNCTION
       ========================================================= */
    // Lanczos' formula (g = 7, 9 terms): Γ(x) to about 15 digits for x ≥ 0.5
    const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
        -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

    function lnGammaLanczos(x) {
        const z = x - 1;
        let total = LANCZOS[0];
        for (let i = 1; i < 9; i++) total += LANCZOS[i] / (z + i);
        const t = z + 7.5;
        return HALF_LN_2PI + (z + 0.5) * Math.log(t) - t + Math.log(total);
    }

    // The small correction in Stirling's formula: ln Γ(x) = (x − ½)·ln x − x + ½·ln 2π + stirling(x).
    // For x ≥ 8 it is the series 1/(12x) − 1/(360x³) + 1/(1260x⁵) − …, right to the last digit.
    function stirling(x) {
        if (x >= 8) {
            const r = 1 / (x * x);
            return (1 / 12 - r * (1 / 360 - r * (1 / 1260 - r * (1 / 1680 - r * (1 / 1188 -
                r * (691 / 360360 - r * (1 / 156 - r * 3617 / 122400))))))) / x;
        }
        return lnGammaLanczos(x) - (x - 0.5) * Math.log(x) + x - HALF_LN_2PI;
    }

    // lnGamma(x): the natural logarithm of Γ(x) for x > 0 (and of |Γ(x)| for a negative x that is not whole)
    function lnGamma(x) {
        if (typeof x !== "number" || isNaN(x)) return NaN;
        if (x === Infinity) return Infinity;
        if (x <= 0) {
            if (x === Math.floor(x)) return Infinity;     // Γ has a pole at 0, −1, −2, …
            return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lnGamma(1 - x);
        }
        if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGammaLanczos(1 - x);
        if (x >= 8) return (x - 0.5) * Math.log(x) - x + HALF_LN_2PI + stirling(x);
        return lnGammaLanczos(x);
    }

    // ln Γ(q + p) − ln Γ(q). For a large q the two logarithms are huge and almost equal, so
    // their difference is worked out from Stirling's formula, term by term, with no loss.
    function lnGammaDelta(q, p) {
        if (q < 8) return lnGamma(q + p) - lnGamma(q);
        return (q - 0.5) * Math.log1p(p / q) + p * Math.log(q + p) - p + stirling(q + p) - stirling(q);
    }

    // lnBeta(a, b): ln B(a, b) = ln Γ(a) + ln Γ(b) − ln Γ(a + b), for a, b > 0
    function lnBeta(a, b) {
        if (!(a > 0) || !(b > 0)) return NaN;
        const small = Math.min(a, b);
        const large = Math.max(a, b);
        return lnGamma(small) - lnGammaDelta(large, small);
    }

    /* =========================================================
       3. THE INCOMPLETE GAMMA FUNCTION
       P(a, x) = (1/Γ(a))·∫₀ˣ t^(a−1)·e^(−t) dt and Q = 1 − P. The normal and the
       chi-square distributions are built on it.
       ========================================================= */
    // x^a·e^(−x) / Γ(a). For a large a the three parts are astronomically large or small,
    // so they are combined before anything is raised to a power.
    function gammaFront(a, x) {
        if (a < 8) return Math.exp(a * Math.log(x) - x - lnGamma(a));
        return Math.sqrt(a / (2 * Math.PI)) * Math.exp(-a * rlog1((x - a) / a) - stirling(a));
    }

    // 1 + x/(a+1) + x²/((a+1)(a+2)) + …: P(a, x) = front·(this sum)/a. Quick for x < a + 1.
    function gammaSeries(a, x) {
        let term = 1;
        let total = 1;
        for (let n = 1; n < MAX_TERMS; n++) {
            term *= x / (a + n);
            total += term;
            if (term <= total * EPS) return total;
        }
        return NaN;
    }

    // A continued fraction (Lentz's method): Q(a, x) = front·(this value). Quick for x ≥ a + 1.
    function gammaFraction(a, x) {
        let b = x + 1 - a;
        let c = 1 / TINY;
        let d = 1 / b;
        let h = d;
        for (let i = 1; i < MAX_TERMS; i++) {
            const an = -i * (i - a);
            b += 2;
            d = an * d + b;
            if (Math.abs(d) < TINY) d = TINY;
            c = b + an / c;
            if (Math.abs(c) < TINY) c = TINY;
            d = 1 / d;
            const change = d * c;
            h *= change;
            if (Math.abs(change - 1) <= CLOSE) return h;
        }
        return NaN;
    }

    // gammaP(a, x): the regularised lower incomplete gamma function P(a, x), for a > 0 and x ≥ 0
    function gammaP(a, x) {
        if (!(a > 0) || a === Infinity || typeof x !== "number" || isNaN(x)) return NaN;
        if (x <= 0) return 0;
        if (x === Infinity) return 1;
        if (x < a + 1) return clamp01(gammaFront(a, x) * gammaSeries(a, x) / a);
        return clamp01(1 - gammaFront(a, x) * gammaFraction(a, x));
    }

    // gammaQ(a, x): the upper part Q(a, x) = 1 − P(a, x), with all its digits in the far tail
    function gammaQ(a, x) {
        if (!(a > 0) || a === Infinity || typeof x !== "number" || isNaN(x)) return NaN;
        if (x <= 0) return 1;
        if (x === Infinity) return 0;
        if (x < a + 1) return clamp01(1 - gammaFront(a, x) * gammaSeries(a, x) / a);
        return clamp01(gammaFront(a, x) * gammaFraction(a, x));
    }

    // gammaInv(p, a): the x with P(a, x) = p (the quantile of a gamma distribution with shape a and scale 1)
    function gammaInv(p, a) {
        if (!(a > 0) || a === Infinity || typeof p !== "number" || isNaN(p) || p < 0 || p > 1) return NaN;
        if (p === 0) return 0;
        if (p === 1) return Infinity;
        const upper = p > 0.5;              // the smaller of the two tails keeps its digits
        const target = upper ? 1 - p : p;
        // A first guess: Wilson and Hilferty's cube; where that fails, the first term of the series
        const z = normalInv(p);
        let x = a * Math.pow(1 - 1 / (9 * a) + z / (3 * Math.sqrt(a)), 3);
        if (!(x > 0) || a < 0.5) x = Math.exp((Math.log(p) + lnGamma(a + 1)) / a);
        if (!(x > 0)) x = TINY;
        if (x === Infinity) x = a + 1;
        let lo = 0;
        let hi = Infinity;
        for (let i = 0; i < 200; i++) {
            const value = upper ? gammaQ(a, x) : gammaP(a, x);
            if (Math.abs(value - target) <= CLOSE * target) return x;
            // P grows with x and Q falls: either way the answer stays between lo and hi
            if ((value < target) !== upper) lo = x;
            else hi = x;
            const density = gammaFront(a, x) / x;
            let next = NaN;
            if (value > 0 && density > 0 && isFinite(density)) {
                // Newton's method on the logarithm of the tail: ln Q is nearly a straight line in x,
                // and ln P nearly one in ln x, so a few steps are enough
                next = upper
                    ? x + Math.log(value / target) * value / density
                    : x * Math.exp(-Math.log(value / target) * value / (x * density));
            }
            // A step that leaves the range in which the answer is known to be: halve the range instead
            if (!(next > lo && next < hi)) {
                next = hi === Infinity ? Math.max(2 * lo, 1) : (lo > 0 ? Math.sqrt(lo) * Math.sqrt(hi) : hi / 8);
            }
            if (Math.abs(next - x) <= CLOSE * x) return next;
            x = next;
        }
        // 200 steps and still moving: the answer only counts if it fits
        return Math.abs((upper ? gammaQ(a, x) : gammaP(a, x)) - target) <= 1e-9 * target ? x : NaN;
    }

    // erf(x): the error function (2/√π)·∫₀ˣ e^(−t²) dt
    function erf(x) {
        if (typeof x !== "number" || isNaN(x)) return NaN;
        if (x < 0) return -erf(-x);
        if (x < 1e-5) return x * 1.1283791670955126 * (1 - x * x / 3);     // 2/√π; x² alone would vanish for a tiny x
        return gammaP(0.5, x * x);
    }

    // erfc(x): 1 − erf(x), with all its digits where it is tiny (erfc(10) = 2.09×10⁻⁴⁵)
    function erfc(x) {
        if (typeof x !== "number" || isNaN(x)) return NaN;
        if (x < 0) return 2 - erfc(-x);
        if (x < 1e-5) return 1 - erf(x);
        return gammaQ(0.5, x * x);
    }

    /* =========================================================
       4. THE INCOMPLETE BETA FUNCTION
       I_x(a, b) = (1/B(a, b))·∫₀ˣ t^(a−1)·(1 − t)^(b−1) dt. Student's t, the F and
       the binomial distribution, and exact binomial intervals are built on it.
       Inside, x always travels with y = 1 − x: a caller that knows a tiny y exactly
       (t²/(ν + t²) for a small t) passes it, so no digits are lost in "1 − x".
       ========================================================= */
    // x^a·y^b / B(a, b). When a and b are both large, the logarithms of the three parts are
    // huge and cancel almost exactly; the form below (Didonato and Morris, 1992) subtracts
    // nothing large, so a million or a billion observations keep their digits.
    function betaFront(a, b, x, y) {
        if (x <= 0 || y <= 0) return 0;
        if (Math.min(a, b) >= 8) {
            let x0;
            let y0;
            let lambda;
            if (a > b) {
                const h = b / a;
                x0 = 1 / (1 + h);
                y0 = h / (1 + h);
                lambda = (a + b) * y - b;
            } else {
                const h = a / b;
                x0 = h / (1 + h);
                y0 = 1 / (1 + h);
                lambda = a - (a + b) * x;
            }
            let e = -lambda / a;
            const u = Math.abs(e) > 0.6 ? e - Math.log(x / x0) : rlog1(e);
            e = lambda / b;
            const v = Math.abs(e) > 0.6 ? e - Math.log(y / y0) : rlog1(e);
            return Math.sqrt(b * x0 / (2 * Math.PI)) *
                Math.exp(-(a * u + b * v) - (stirling(a) + stirling(b) - stirling(a + b)));
        }
        const logX = x <= 0.5 ? Math.log(x) : Math.log1p(-y);
        const logY = y <= 0.5 ? Math.log(y) : Math.log1p(-x);
        return Math.exp(a * logX + b * logY - lnBeta(a, b));
    }

    // The continued fraction of the incomplete beta function, 1/(1 + d₁/(1 + d₂/(1 + …))), by
    // Lentz's method: I_x(a, b) = front·(this value)/a. It converges quickly for x < (a + 1)/(a + b + 2).
    //   d(2m)   = m(b − m)x / ((a + 2m − 1)(a + 2m))                 "even"
    //   d(2m+1) = −(a + m)(a + b + m)x / ((a + 2m)(a + 2m + 1))       "odd"
    // The textbook loop works out 1 + d(2m+1)·(…) again and again. For a large a and an x close
    // to 1 (a billion tries with a tiny chance each) every odd d is −1 + (something tiny), and
    // "1 + d" loses its digits. So two steps are taken at once here, with w = 1 + d(2m+1) worked
    // out from y = 1 − x, where nothing cancels:
    //   s = even·D, t = even/C, then D = (1 + s)/(w + s), C = (w + t)/(1 + t), and the value grows by (w + t)/(w + s).
    // (Put the two textbook steps one after the other and this is what comes out.)
    function betaFraction(a, b, x, y) {
        const fromY = y < x;        // the smaller of x and y is the one that has all its digits
        const oddPlusOne = function (m) {
            const bottom = (a + 2 * m) * (a + 2 * m + 1);
            const top = fromY
                ? a * (2 * m + 1 - b) + m * (3 * m + 2 - b) + y * (a + m) * (a + b + m)
                : bottom - (a + m) * (a + b + m) * x;
            return top / bottom;
        };
        let d = oddPlusOne(0);
        if (Math.abs(d) < TINY) d = TINY;
        d = 1 / d;
        let c = 1;
        let h = d;
        for (let m = 1; m < MAX_TERMS; m++) {
            const even = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
            const w = oddPlusOne(m);
            const s = even * d;
            const t = even / c;
            let below = w + s;
            if (Math.abs(below) < TINY) below = TINY;
            let above = w + t;
            if (Math.abs(above) < TINY) above = TINY;
            let onePlusT = 1 + t;
            if (Math.abs(onePlusT) < TINY) onePlusT = TINY;
            d = (1 + s) / below;
            c = above / onePlusT;
            if (Math.abs(c) < TINY) c = TINY;
            const change = above / below;
            h *= change;
            if (Math.abs(change - 1) <= CLOSE) return h;
        }
        return NaN;
    }

    // I_x(a, b) with y = 1 − x given
    function ibeta(x, y, a, b) {
        if (x <= 0) return 0;
        if (y <= 0) return 1;
        const front = betaFront(a, b, x, y);
        if (x < (a + 1) / (a + b + 2)) return clamp01(front * betaFraction(a, b, x, y) / a);
        return clamp01(1 - front * betaFraction(b, a, y, x) / b);
    }

    function betaArgumentsOk(x, a, b) {
        return a > 0 && b > 0 && a !== Infinity && b !== Infinity && typeof x === "number" && !isNaN(x);
    }

    // betaI(x, a, b): the regularised incomplete beta function I_x(a, b), for a, b > 0 and 0 ≤ x ≤ 1
    function betaI(x, a, b) {
        if (!betaArgumentsOk(x, a, b)) return NaN;
        return ibeta(x, 1 - x, a, b);
    }

    // betaIc(x, a, b): 1 − I_x(a, b), with all its digits where it is tiny
    function betaIc(x, a, b) {
        if (!betaArgumentsOk(x, a, b)) return NaN;
        return ibeta(1 - x, x, b, a);
    }

    // A first guess for betaInv, as u = ln(x/(1 − x)) (Press et al., "Numerical Recipes", the routine invbetai)
    function betaInvGuess(p, q, a, b) {
        let u;
        if (a >= 1 && b >= 1) {
            const t = Math.sqrt(-2 * Math.log(Math.min(p, q)));
            let z = t - (2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481));
            if (p > q) z = -z;
            const al = (z * z - 3) / 6;
            const h = 2 / (1 / (2 * a - 1) + 1 / (2 * b - 1));
            const w = z * Math.sqrt(al + h) / h - (1 / (2 * b - 1) - 1 / (2 * a - 1)) * (al + 5 / 6 - 2 / (3 * h));
            u = Math.log(a / b) - 2 * w;                 // x = a/(a + b·e^(2w))
        } else {
            const t = Math.exp(a * Math.log(a / (a + b))) / a;
            const s = Math.exp(b * Math.log(b / (a + b))) / b;
            const w = t + s;
            if (p < t / w) {
                const x = Math.pow(a * w * p, 1 / a);
                u = Math.log(x) - Math.log1p(-x);
            } else {
                const y = Math.pow(b * w * q, 1 / b);
                u = Math.log1p(-y) - Math.log(y);
            }
        }
        if (u > -700 && u < 700) return u;
        return u <= -700 ? -700 : (u >= 700 ? 700 : 0);
    }

    // betaInv(p, a, b): the x with I_x(a, b) = p (the quantile of a beta distribution).
    // Its distance from 1, with all its digits, is betaInv(1 − p, b, a).
    // The search runs on u = ln(x/(1 − x)) and brings ln(I/(1 − I)) to ln(p/(1 − p)). On that scale
    // the function is nearly a straight line in both tails (I is like x^a near 0, and 1 − I like
    // (1 − x)^b near 1), so Newton's method needs few steps wherever the answer lies; a step that
    // leaves the range in which the answer is known to be, or that shrinks too slowly, is replaced
    // by halving the range.
    function betaInv(p, a, b) {
        if (!betaArgumentsOk(p, a, b) || p < 0 || p > 1) return NaN;
        if (p === 0) return 0;
        if (p === 1) return 1;
        const q = 1 - p;
        const upper = p > 0.5;          // the smaller of p and 1 − p is the one that has all its digits
        let u = betaInvGuess(p, q, a, b);
        let lo = -745;                  // x = 10⁻³²³ …
        let hi = 745;                   // … and 1 − x = 10⁻³²³: a computer holds nothing beyond
        let step = hi - lo;
        let stepBefore = step;
        let miss = Infinity;
        for (let i = 0; i < 300; i++) {
            const x = 1 / (1 + Math.exp(-u));
            const y = 1 / (1 + Math.exp(u));
            const small = upper ? ibeta(y, x, b, a) : ibeta(x, y, a, b);        // 1 − I for the upper half, else I
            // ln(I/(1 − I)) − ln(p/(1 − p)), with the small side used where its digits count
            miss = upper
                ? Math.log1p((q - small) / p) - Math.log(small / q)
                : Math.log(small / p) - Math.log1p((p - small) / q);
            if (miss === 0) return x;
            if (miss < 0) lo = u;
            else hi = u;
            // The slope of ln(I/(1 − I)) against u: (dI/du)/(I·(1 − I)), and dI/du = x^a·(1 − x)^b/B(a, b)
            const slope = betaFront(a, b, x, y) / (small * (1 - small));
            let move = -miss / slope;
            if (Math.abs(miss) <= 1e-7 && Math.abs(move) <= 1e-7) return 1 / (1 + Math.exp(-(u + move)));     // the last step needs no check
            if (!(u + move > lo && u + move < hi) || Math.abs(move) > 0.5 * Math.abs(stepBefore)) {
                move = 0.5 * (lo + hi) - u;
                if (move === 0) return x;                // lo and hi are neighbours: nothing lies between them
            }
            stepBefore = step;
            step = move;
            u += move;
        }
        // 300 steps and still moving: the answer only counts if it fits
        return Math.abs(miss) <= 1e-9 ? 1 / (1 + Math.exp(-u)) : NaN;
    }

    /* =========================================================
       5. THE NORMAL DISTRIBUTION
       ========================================================= */
    // normalPdf(z): the density of the standard normal distribution, e^(−z²/2)/√(2π)
    function normalPdf(z) {
        if (typeof z !== "number" || isNaN(z)) return NaN;
        return Math.exp(-0.5 * z * z) / SQRT_2PI;
    }

    // normalCdf(z): Φ(z), the probability that a standard normal value is at most z
    function normalCdf(z) {
        if (typeof z !== "number" || isNaN(z)) return NaN;
        if (z < -1) return 0.5 * erfc(-z / SQRT2);        // a tail: computed directly, so 10⁻³⁰ keeps its digits
        if (z > 1) return 1 - 0.5 * erfc(z / SQRT2);
        return 0.5 + 0.5 * erf(z / SQRT2);
    }

    // normalSf(z): 1 − Φ(z), the upper tail, with all its digits where it is tiny
    function normalSf(z) {
        return normalCdf(-z);
    }

    // Acklam's rational approximations of Φ⁻¹ (9 digits), polished below
    const INV_A = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const INV_B = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const INV_C = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const INV_D = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

    // normalInv(p): Φ⁻¹(p), the z with Φ(z) = p (−∞ for p = 0, +∞ for p = 1)
    function normalInv(p) {
        if (typeof p !== "number" || isNaN(p) || p < 0 || p > 1) return NaN;
        if (p === 0) return -Infinity;
        if (p === 1) return Infinity;
        if (p > 0.5) return -normalInv(1 - p);        // 1 − p is exact for p > 0.5
        let x;
        if (p < 0.02425) {
            const q = Math.sqrt(-2 * Math.log(p));
            x = (((((INV_C[0] * q + INV_C[1]) * q + INV_C[2]) * q + INV_C[3]) * q + INV_C[4]) * q + INV_C[5]) /
                ((((INV_D[0] * q + INV_D[1]) * q + INV_D[2]) * q + INV_D[3]) * q + 1);
        } else {
            const q = p - 0.5;
            const r = q * q;
            x = (((((INV_A[0] * r + INV_A[1]) * r + INV_A[2]) * r + INV_A[3]) * r + INV_A[4]) * r + INV_A[5]) * q /
                (((((INV_B[0] * r + INV_B[1]) * r + INV_B[2]) * r + INV_B[3]) * r + INV_B[4]) * r + 1);
        }
        // Two steps of Newton's method on ln Φ(x) = ln p bring the last digits, in the far tail too
        for (let i = 0; i < 2; i++) {
            const cdf = normalCdf(x);
            const pdf = normalPdf(x);
            if (!(cdf > 0) || !(pdf > 0)) break;
            x -= Math.log1p((cdf - p) / p) * cdf / pdf;
        }
        return x;
    }

    // zFor(confidence): the two-sided critical value, z with P(|Z| ≤ z) = confidence (0.95 -> 1.959964)
    function zFor(confidence) {
        if (!(confidence > 0 && confidence < 1)) return NaN;
        return -normalInv((1 - confidence) / 2);
    }

    /* =========================================================
       6. STUDENT'S t, CHI-SQUARE, F AND THE BINOMIAL DISTRIBUTION
       ========================================================= */
    // From this many degrees of freedom on, the tail of t comes from the normal distribution (below)
    const T_BY_NORMAL = 2e4;

    // tPdf(t, df): the density of Student's t distribution with df degrees of freedom (df > 0, not only whole)
    function tPdf(t, df) {
        if (typeof t !== "number" || isNaN(t) || !(df > 0)) return NaN;
        if (!(df < 1e300)) return normalPdf(t);
        return Math.exp(lnGammaDelta(df / 2, 0.5) - 0.5 * Math.log(df * Math.PI) - 0.5 * (df + 1) * Math.log1p(t * t / df));
    }

    // P(T > size) for size ≥ 0 and many degrees of freedom, by Hill's formula (1970): the tail is
    // the normal tail beyond z = √y·(1 + (y + 3)/b − (0.4y³ + 3.3y² + 24y + 85.5)/(b·(b + 0.8y² + 100))),
    // with y = (df − ½)·ln(1 + t²/df) and b = 48·(df − ½)². What is left out is of the size
    // y⁵/b³: nothing at all from 20,000 degrees of freedom on.
    function tTailByNormal(size, df) {
        if (df === Infinity) return normalSf(size);
        const a = df - 0.5;
        const b = 48 * a * a;
        const y = a * Math.log1p(size * size / df);
        const z = ((((-0.4 * y - 3.3) * y - 24) * y - 85.5) / (0.8 * y * y + 100 + b) + y + 3) / b + 1;
        return normalSf(z * Math.sqrt(y));
    }

    // tSf(t, df): the upper tail P(T > t), with all its digits where it is tiny
    function tSf(t, df) {
        if (typeof t !== "number" || isNaN(t) || !(df > 0)) return NaN;
        const t2 = t * t;
        if (t2 === Infinity) return t > 0 ? 0 : 1;
        // With very many degrees of freedom the beta function below needs more and more steps
        // (about √df of them); Hill's formula needs none and is exact to the last digit there.
        const tail = df >= T_BY_NORMAL
            ? tTailByNormal(Math.abs(t), df)
            : 0.5 * ibeta(df / (df + t2), t2 / (df + t2), df / 2, 0.5);
        return t >= 0 ? tail : 1 - tail;
    }

    // tCdf(t, df): the distribution function P(T ≤ t)
    function tCdf(t, df) {
        return tSf(-t, df);
    }

    // The u > 0 with P(T > u) = q, for 0 < q < 0.5
    function tUpper(q, df) {
        // First guess: the normal answer with its first two corrections for the heavier tails
        const z = -normalInv(q);
        const z2 = z * z;
        let u = z + z * (z2 + 1) / (4 * df) + z * (5 * z2 * z2 + 16 * z2 + 3) / (96 * df * df);
        const middle = q > 0.2;
        if (!middle && df < T_BY_NORMAL) {
            // Far out, the tail of t is a power of u: c·df^((df−1)/2)·u^(−df). Start from whichever guess is closer.
            const power = Math.exp((lnGammaDelta(df / 2, 0.5) - 0.5 * Math.log(df * Math.PI) + 0.5 * (df - 1) * Math.log(df) - Math.log(q)) / df);
            const miss = function (value) {
                const tail = tSf(value, df);
                return tail > 0 ? Math.abs(Math.log(tail / q)) : Infinity;
            };
            if (!(u > 0) || !isFinite(u) || (power > 0 && isFinite(power) && miss(power) < miss(u))) u = power;
        }
        if (!(u > 0) || !isFinite(u)) u = 1;
        let lo = 0;
        let hi = Infinity;
        for (let i = 0; i < 200; i++) {
            const tail = tSf(u, df);
            if (Math.abs(tail - q) <= CLOSE * q) return u;
            if (tail > q) lo = u;
            else hi = u;
            const density = tPdf(u, df);
            let next = NaN;
            if (density > 0 && isFinite(density)) {
                next = (middle || !(tail > 0))
                    ? u + (tail - q) / density                                    // Newton's method on the tail itself
                    : u * Math.exp(Math.log(tail / q) * tail / (u * density));    // ... and on ln(tail) against ln u
            }
            if (!(next > lo && next < hi)) next = hi === Infinity ? 2 * u : (lo > 0 ? Math.sqrt(lo) * Math.sqrt(hi) : hi / 2);
            if (Math.abs(next - u) <= CLOSE * u) return next;
            u = next;
        }
        // 200 steps and still moving: the answer only counts if it fits
        return Math.abs(tSf(u, df) - q) <= 1e-9 * q ? u : NaN;
    }

    // tInv(p, df): the quantile of Student's t, the t with P(T ≤ t) = p (tInv(0.975, 4) = 2.776445)
    function tInv(p, df) {
        if (typeof p !== "number" || isNaN(p) || p < 0 || p > 1 || !(df > 0)) return NaN;
        if (p === 0) return -Infinity;
        if (p === 1) return Infinity;
        if (p === 0.5) return 0;
        return p < 0.5 ? -tUpper(p, df) : tUpper(1 - p, df);
    }

    // tFor(confidence, df): the two-sided critical value, t with P(|T| ≤ t) = confidence
    function tFor(confidence, df) {
        if (!(confidence > 0 && confidence < 1)) return NaN;
        return -tInv((1 - confidence) / 2, df);
    }

    // chi2Cdf(x, k): the chi-square distribution function with k degrees of freedom
    function chi2Cdf(x, k) {
        return gammaP(k / 2, x / 2);
    }

    // chi2Sf(x, k): its upper tail P(X > x), the p-value of a chi-square test
    function chi2Sf(x, k) {
        return gammaQ(k / 2, x / 2);
    }

    // chi2Inv(p, k): its quantile
    function chi2Inv(p, k) {
        return 2 * gammaInv(p, k / 2);
    }

    // fSf(x, d1, d2): the upper tail P(F > x) of the F distribution with d1 and d2 degrees of freedom
    function fSf(x, d1, d2) {
        if (typeof x !== "number" || isNaN(x) || !(d1 > 0) || !(d2 > 0)) return NaN;
        if (x <= 0) return 1;
        if (x === Infinity) return 0;
        const bottom = d2 + d1 * x;
        return ibeta(d2 / bottom, d1 * x / bottom, d2 / 2, d1 / 2);
    }

    // fCdf(x, d1, d2): the F distribution function P(F ≤ x)
    function fCdf(x, d1, d2) {
        if (typeof x !== "number" || isNaN(x) || !(d1 > 0) || !(d2 > 0)) return NaN;
        if (x <= 0) return 0;
        if (x === Infinity) return 1;
        const bottom = d2 + d1 * x;
        return ibeta(d1 * x / bottom, d2 / bottom, d1 / 2, d2 / 2);
    }

    // x·ln(x/m) + m − x, the "deviance" part of a binomial probability (Loader, 2000), with a
    // series where x and m are close and the plain formula would lose its digits
    function deviance(x, m) {
        if (Math.abs(x - m) < 0.1 * (x + m)) {
            let v = (x - m) / (x + m);
            let s = (x - m) * v;
            let ej = 2 * x * v;
            v *= v;
            for (let j = 1; j < 1000; j++) {
                ej *= v;
                const next = s + ej / (2 * j + 1);
                if (next === s) return next;
                s = next;
            }
        }
        return x * Math.log(x / m) + m - x;
    }

    function wholeCount(value) {
        return isNumber(value) && value >= 0 && value === Math.floor(value);
    }

    // binomPmf(k, n, p): the probability of exactly k successes in n tries (right for a billion tries too)
    function binomPmf(k, n, p) {
        if (!wholeCount(n) || !isNumber(k) || !(p >= 0 && p <= 1)) return NaN;
        if (k < 0 || k > n || k !== Math.floor(k)) return 0;
        const q = 1 - p;
        if (p === 0) return k === 0 ? 1 : 0;
        if (p === 1) return k === n ? 1 : 0;
        if (n === 0) return 1;
        if (n === 1) return k === 0 ? q : p;          // one try is the coin itself, to the last digit
        if (k === 0) return Math.exp(p < 0.1 ? -deviance(n, n * q) - n * p : n * Math.log(q));
        if (k === n) return Math.exp(q < 0.1 ? -deviance(n, n * p) - n * q : n * Math.log(p));
        const exponent = stirling(n) - stirling(k) - stirling(n - k) - deviance(k, n * p) - deviance(n - k, n * q);
        return Math.exp(exponent) * Math.sqrt(n / (2 * Math.PI * k * (n - k)));
    }

    // binomCdf(k, n, p): P(X ≤ k) for X ~ Binomial(n, p)
    function binomCdf(k, n, p) {
        if (!wholeCount(n) || typeof k !== "number" || isNaN(k) || !(p >= 0 && p <= 1)) return NaN;
        k = Math.floor(k);
        if (k < 0) return 0;
        if (k >= n) return 1;
        return ibeta(1 - p, p, n - k, k + 1);
    }

    // binomSf(k, n, p): P(X ≥ k), the upper tail with k itself included
    function binomSf(k, n, p) {
        if (!wholeCount(n) || typeof k !== "number" || isNaN(k) || !(p >= 0 && p <= 1)) return NaN;
        k = Math.ceil(k);
        if (k <= 0) return 1;
        if (k > n) return 0;
        return ibeta(p, 1 - p, k, n - k + 1);
    }

    /* =========================================================
       7. DESCRIBING NUMBERS
       Lists are arrays of numbers. A function that needs more numbers than
       the list has returns NaN.
       ========================================================= */
    // sum(list): the sum, added so that small numbers are not lost next to large ones (Neumaier)
    function sum(list) {
        let total = 0;
        let lost = 0;
        for (let i = 0; i < list.length; i++) {
            const value = list[i];
            const next = total + value;
            lost += Math.abs(total) >= Math.abs(value) ? (total - next) + value : (value - next) + total;
            total = next;
        }
        return total + lost;
    }

    // mean(list): the arithmetic mean
    function mean(list) {
        return list.length ? sum(list) / list.length : NaN;
    }

    // variance(list): the sample variance, with n − 1 in the denominator (needs 2 numbers)
    function variance(list) {
        const n = list.length;
        if (n < 2) return NaN;
        const centre = mean(list);
        const squares = new Array(n);
        for (let i = 0; i < n; i++) squares[i] = (list[i] - centre) * (list[i] - centre);
        return sum(squares) / (n - 1);
    }

    // sd(list): the sample standard deviation, √variance
    function sd(list) {
        return Math.sqrt(variance(list));
    }

    // sem(list): the standard error of the mean, sd/√n
    function sem(list) {
        return sd(list) / Math.sqrt(list.length);
    }

    // min(list), max(list): the smallest and the largest number (a long list is fine)
    function min(list) {
        let best = list.length ? Infinity : NaN;
        for (let i = 0; i < list.length; i++) if (list[i] < best) best = list[i];
        return best;
    }

    function max(list) {
        let best = list.length ? -Infinity : NaN;
        for (let i = 0; i < list.length; i++) if (list[i] > best) best = list[i];
        return best;
    }

    function sorted(list) {
        return Array.prototype.slice.call(list).sort(function (a, b) { return a - b; });
    }

    // The q-quantile of a list that is sorted already (straight lines between the points)
    function quantileSorted(list, q) {
        const n = list.length;
        if (!n || !(q >= 0 && q <= 1)) return NaN;
        const place = (n - 1) * q;
        const below = Math.floor(place);
        if (below >= n - 1) return list[n - 1];
        return list[below] + (place - below) * (list[below + 1] - list[below]);
    }

    // quantile(list, q): the q-quantile for 0 ≤ q ≤ 1, the way R (type 7) and NumPy do it by default
    function quantile(list, q) {
        return quantileSorted(sorted(list), q);
    }

    // median(list): the middle value
    function median(list) {
        return quantile(list, 0.5);
    }

    // correlation(xs, ys): Pearson's correlation coefficient of two lists of the same length
    function correlation(xs, ys) {
        const n = xs.length;
        if (n < 2 || ys.length !== n) return NaN;
        const mx = mean(xs);
        const my = mean(ys);
        let sxx = 0;
        let syy = 0;
        let sxy = 0;
        for (let i = 0; i < n; i++) {
            const dx = xs[i] - mx;
            const dy = ys[i] - my;
            sxx += dx * dx;
            syy += dy * dy;
            sxy += dx * dy;
        }
        if (!(sxx > 0) || !(syy > 0)) return NaN;      // a list that never changes has no correlation
        return Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
    }

    // linearFit(xs, ys): the least-squares line y = intercept + slope·x
    //   -> { n, slope, intercept, r2, seSlope, seIntercept, df } (the standard errors need 3 points), or null
    function linearFit(xs, ys) {
        const n = xs.length;
        if (n < 2 || ys.length !== n) return null;
        const mx = mean(xs);
        const my = mean(ys);
        let sxx = 0;
        let sxy = 0;
        let syy = 0;
        for (let i = 0; i < n; i++) {
            const dx = xs[i] - mx;
            const dy = ys[i] - my;
            sxx += dx * dx;
            sxy += dx * dy;
            syy += dy * dy;
        }
        if (!(sxx > 0)) return null;                    // every x is the same: no line
        const slope = sxy / sxx;
        const intercept = my - slope * mx;
        let sse = 0;
        for (let i = 0; i < n; i++) {
            const miss = ys[i] - intercept - slope * xs[i];
            sse += miss * miss;
        }
        const df = n - 2;
        const s2 = df > 0 ? sse / df : NaN;
        return {
            n: n, slope: slope, intercept: intercept, df: df,
            r2: syy > 0 ? Math.max(0, 1 - sse / syy) : NaN,
            seSlope: Math.sqrt(s2 / sxx),
            seIntercept: Math.sqrt(s2 * (1 / n + mx * mx / sxx))
        };
    }

    /* =========================================================
       8. INTERVALS AND TESTS
       "confidence" is a share: 0.95 for a 95% interval.
       ========================================================= */
    // wilson(p, n, confidence): Wilson's score interval for a share p measured on n cases
    //   -> { lo, hi, centre, half, z }.  centre = (p + z²/2n)/(1 + z²/n),
    //   half = z·√(p(1 − p)/n + z²/4n²)/(1 + z²/n)
    function wilson(p, n, confidence) {
        if (!(p >= 0 && p <= 1) || !(n > 0) || n === Infinity) return null;
        const z = zFor(confidence === undefined ? 0.95 : confidence);
        if (isNaN(z)) return null;
        const z2 = z * z;
        const scale = 1 + z2 / n;
        const centre = (p + z2 / (2 * n)) / scale;
        const half = z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / scale;
        // At p = 0 the lower end is exactly 0 and at p = 1 the upper end exactly 1: said outright,
        // so that rounding cannot make them −10⁻¹⁷ or 0.9999999999999999
        return {
            lo: p === 0 ? 0 : Math.max(0, centre - half),
            hi: p === 1 ? 1 : Math.min(1, centre + half),
            centre: centre, half: half, z: z
        };
    }

    // wilsonN(p, half, confidence): the smallest whole n at which Wilson's interval around p
    // is at most ± half wide. From half = z·√(pq·n + z²/4)/(n + z²), solved for n:
    //   n = z²·(pq − 2h² + √(p²q² + h²·(1 − 4pq))) / (2h²),  q = 1 − p
    function wilsonN(p, half, confidence) {
        if (!(p >= 0 && p <= 1) || !(half > 0)) return NaN;
        const z = zFor(confidence === undefined ? 0.95 : confidence);
        if (isNaN(z)) return NaN;
        const pq = p * (1 - p);
        const h2 = half * half;
        const exact = z * z * (pq - 2 * h2 + Math.sqrt(pq * pq + h2 * (1 - 4 * pq))) / (2 * h2);
        let n = Math.max(1, Math.ceil(exact - 1e-9));
        if (!(n < 9e15)) return n;          // too large to count one by one: the formula's own value
        // The formula is exact; these few steps only guard its last rounding
        const width = function (count) { return wilson(p, count, confidence).half; };
        for (let i = 0; i < 3 && n > 1 && width(n - 1) <= half; i++) n -= 1;
        for (let i = 0; i < 3 && width(n) > half; i++) n += 1;
        return n;
    }

    // waldN(p, half, confidence): the textbook sample size z²·p(1 − p)/half², rounded up
    function waldN(p, half, confidence) {
        if (!(p >= 0 && p <= 1) || !(half > 0)) return NaN;
        const z = zFor(confidence === undefined ? 0.95 : confidence);
        if (isNaN(z)) return NaN;
        return Math.max(1, Math.ceil(z * z * p * (1 - p) / (half * half) - 1e-9));
    }

    // clopperPearson(k, n, confidence): the exact binomial interval for k successes in n tries
    //   -> { lo, hi }: lo is the α/2 quantile of Beta(k, n − k + 1), hi the 1 − α/2 quantile of Beta(k + 1, n − k)
    function clopperPearson(k, n, confidence) {
        if (!wholeCount(n) || n < 1 || !wholeCount(k) || k > n) return null;
        const alpha = 1 - (confidence === undefined ? 0.95 : confidence);
        if (!(alpha > 0 && alpha < 1)) return null;
        return {
            lo: k === 0 ? 0 : betaInv(alpha / 2, k, n - k + 1),
            hi: k === n ? 1 : 1 - betaInv(alpha / 2, n - k, k + 1)
        };
    }

    // twoProportions(pA, nA, pB, nB, confidence): two shares measured on independent samples
    //   -> { diff, se, z, p, lo, hi, crit, nNeeded }
    //   se = √(pA(1 − pA)/nA + pB(1 − pB)/nB), z = diff/se, p two-sided, the interval diff ± crit·se,
    //   nNeeded: the size of each sample at which this difference would just reach significance,
    //   crit²·(pA(1 − pA) + pB(1 − pB))/diff², rounded up (Infinity when the difference is 0)
    function twoProportions(pA, nA, pB, nB, confidence) {
        if (!(pA >= 0 && pA <= 1) || !(pB >= 0 && pB <= 1) || !(nA > 0) || !(nB > 0)) return null;
        const crit = zFor(confidence === undefined ? 0.95 : confidence);
        if (isNaN(crit)) return null;
        const diff = pA - pB;
        const spread = pA * (1 - pA) + pB * (1 - pB);
        const se = Math.sqrt(pA * (1 - pA) / nA + pB * (1 - pB) / nB);
        let z;
        let p;
        if (se > 0) {
            z = diff / se;
            p = 2 * normalSf(Math.abs(z));
        } else {
            // Both shares are 0 or 1: there is no spread at all
            z = diff === 0 ? 0 : (diff > 0 ? Infinity : -Infinity);
            p = diff === 0 ? 1 : 0;
        }
        let nNeeded;
        if (diff === 0) nNeeded = Infinity;
        else nNeeded = Math.max(1, Math.ceil(crit * crit * spread / (diff * diff) - 1e-9));
        return { diff: diff, se: se, z: z, p: Math.min(1, p), lo: diff - crit * se, hi: diff + crit * se, crit: crit, nNeeded: nNeeded };
    }

    // mcnemar(b, c): McNemar's exact test for two models scored on the same examples.
    // b: examples only the first got right, c: examples only the second got right.
    //   -> { n: b + c, p }: p = min(1, 2·P(X ≤ min(b, c))) for X ~ Binomial(b + c, ½); p = 1 when b + c = 0
    function mcnemar(b, c) {
        if (!wholeCount(b) || !wholeCount(c)) return null;
        const n = b + c;
        if (n === 0) return { n: 0, p: 1 };
        return { n: n, p: Math.min(1, 2 * binomCdf(Math.min(b, c), n, 0.5)) };
    }

    // tInterval(list, confidence): the mean of a list with its t interval
    //   -> { n, mean, sd, se, df, crit, half, lo, hi }, or null for fewer than 2 numbers
    function tInterval(list, confidence) {
        const n = list.length;
        if (n < 2) return null;
        const centre = mean(list);
        const spread = sd(list);
        const se = spread / Math.sqrt(n);
        const crit = tFor(confidence === undefined ? 0.95 : confidence, n - 1);
        if (isNaN(crit)) return null;
        return { n: n, mean: centre, sd: spread, se: se, df: n - 1, crit: crit, half: crit * se, lo: centre - crit * se, hi: centre + crit * se };
    }

    // The t statistic, its two-sided p-value and the interval, for a difference and its standard error
    function tSummary(diff, se, df, confidence) {
        const crit = tFor(confidence === undefined ? 0.95 : confidence, df);
        let t;
        let p;
        if (se > 0) {
            t = diff / se;
            p = Math.min(1, 2 * tSf(Math.abs(t), df));
        } else {
            // No spread at all: any difference is "infinitely" clear, and none is none
            t = diff === 0 ? 0 : (diff > 0 ? Infinity : -Infinity);
            p = diff === 0 ? 1 : 0;
        }
        return { diff: diff, se: se, t: t, df: df, p: p, crit: crit, half: crit * se, lo: diff - crit * se, hi: diff + crit * se };
    }

    // welch(a, b, confidence): Welch's t-test for two lists with their own spreads
    //   -> { nA, nB, meanA, meanB, diff, se, t, df, p, crit, half, lo, hi }, or null when a list has fewer than 2 numbers
    //   se = √(s²A/nA + s²B/nB); df by Welch and Satterthwaite; p two-sided
    function welch(a, b, confidence) {
        const nA = a.length;
        const nB = b.length;
        if (nA < 2 || nB < 2) return null;
        const meanA = mean(a);
        const meanB = mean(b);
        const vA = variance(a) / nA;
        const vB = variance(b) / nB;
        const se = Math.sqrt(vA + vB);
        const df = se > 0 ? (vA + vB) * (vA + vB) / (vA * vA / (nA - 1) + vB * vB / (nB - 1)) : nA + nB - 2;
        const out = tSummary(meanA - meanB, se, df, confidence);
        if (isNaN(out.crit)) return null;
        out.nA = nA;
        out.nB = nB;
        out.meanA = meanA;
        out.meanB = meanB;
        return out;
    }

    // pairedT(a, b, confidence): the paired t-test on the differences a[i] − b[i]
    //   -> { n, diff, sd, se, t, df, p, crit, half, lo, hi, r }, or null (different lengths, fewer than 2 pairs)
    function pairedT(a, b, confidence) {
        const n = a.length;
        if (n < 2 || b.length !== n) return null;
        const differences = new Array(n);
        for (let i = 0; i < n; i++) differences[i] = a[i] - b[i];
        const spread = sd(differences);
        const out = tSummary(mean(differences), spread / Math.sqrt(n), n - 1, confidence);
        if (isNaN(out.crit)) return null;
        out.n = n;
        out.sd = spread;
        out.r = correlation(a, b);
        return out;
    }

    // effectSize(a, b): -> { pooled, d, g }: the pooled standard deviation, Cohen's d = (mean a − mean b)/pooled,
    // and Hedges' g = d·(1 − 3/(4(nA + nB) − 9)); null when a list has fewer than 2 numbers
    function effectSize(a, b) {
        const nA = a.length;
        const nB = b.length;
        if (nA < 2 || nB < 2) return null;
        const pooled = Math.sqrt(((nA - 1) * variance(a) + (nB - 1) * variance(b)) / (nA + nB - 2));
        const d = pooled > 0 ? (mean(a) - mean(b)) / pooled : NaN;
        return { pooled: pooled, d: d, g: d * (1 - 3 / (4 * (nA + nB) - 9)) };
    }

    // superiority(a, b): the share of all pairs (x from a, y from b) with x > y, ties counted half
    function superiority(a, b) {
        if (!a.length || !b.length) return NaN;
        let wins = 0;
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b.length; j++) {
                if (a[i] > b[j]) wins += 1;
                else if (a[i] === b[j]) wins += 0.5;
            }
        }
        return wins / (a.length * b.length);
    }

    /* =========================================================
       9. RESAMPLING AND MANY COMPARISONS
       ========================================================= */
    // bootstrapStart(lists, stat, options): a seeded percentile bootstrap that can be run in pieces
    // (give its step to the bench kit's job helper).
    //   lists     an array of lists: each one is resampled with replacement
    //   stat      function (resampledLists) -> a number, for example the difference of two means
    //   options   reps (10,000), seed (1), confidence (0.95),
    //             paired: true resamples the same places in every list (they must have one length)
    //   -> { step(count) -> true when finished, done, progress (0..1), result() }
    //   result() -> { estimate, lo, hi, se, mean, reps, seed, values (sorted) }
    // The same seed gives the same result, in one piece or in many.
    function bootstrapStart(lists, stat, options) {
        const settings = options || {};
        const reps = Math.max(1, Math.floor(settings.reps || 10000));
        const seed = settings.seed === undefined ? 1 : settings.seed;
        const confidence = settings.confidence === undefined ? 0.95 : settings.confidence;
        const random = rng(seed);
        const values = new Float64Array(reps);
        const resampled = lists.map(function (list) { return new Array(list.length); });
        let made = 0;

        function once() {
            if (settings.paired) {
                const n = lists[0].length;
                for (let i = 0; i < n; i++) {
                    const place = random.int(n);
                    for (let k = 0; k < lists.length; k++) resampled[k][i] = lists[k][place];
                }
            } else {
                for (let k = 0; k < lists.length; k++) {
                    const list = lists[k];
                    const n = list.length;
                    for (let i = 0; i < n; i++) resampled[k][i] = list[random.int(n)];
                }
            }
            return stat(resampled);
        }

        const run = {
            done: false,
            progress: 0,
            step: function (count) {
                const until = Math.min(reps, made + Math.max(1, Math.floor(count || 100)));
                while (made < until) {
                    values[made] = once();
                    made += 1;
                }
                run.progress = made / reps;
                run.done = made >= reps;
                return run.done;
            },
            result: function () {
                const kept = Array.prototype.slice.call(values, 0, made).sort(function (a, b) { return a - b; });
                const alpha = 1 - confidence;
                return {
                    estimate: stat(lists),
                    lo: quantileSorted(kept, alpha / 2),
                    hi: quantileSorted(kept, 1 - alpha / 2),
                    se: sd(kept),
                    mean: mean(kept),
                    reps: made,
                    seed: seed,
                    values: kept
                };
            }
        };
        return run;
    }

    // bootstrap(lists, stat, options): the same, run to the end at once -> its result()
    function bootstrap(lists, stat, options) {
        const run = bootstrapStart(lists, stat, options);
        while (!run.step(1000)) { /* until every resample is made */ }
        return run.result();
    }

    // The places of a list in rising order of its values
    function rankOrder(ps) {
        return ps.map(function (_, index) { return index; }).sort(function (i, j) { return ps[i] - ps[j] || i - j; });
    }

    // bonferroni(ps): Bonferroni-adjusted p-values, min(1, m·p), in the order given
    function bonferroni(ps) {
        const m = ps.length;
        return ps.map(function (p) { return Math.min(1, m * p); });
    }

    // holm(ps): Holm's step-down adjusted p-values: with p(1) ≤ … ≤ p(m),
    // adjusted(i) = the largest of min(1, (m − j + 1)·p(j)) over j ≤ i. In the order given.
    function holm(ps) {
        const m = ps.length;
        const order = rankOrder(ps);
        const out = new Array(m);
        let running = 0;
        order.forEach(function (index, rank) {
            running = Math.max(running, Math.min(1, (m - rank) * ps[index]));
            out[index] = running;
        });
        return out;
    }

    // benjaminiHochberg(ps): Benjamini and Hochberg's step-up adjusted p-values (the false discovery rate):
    // adjusted(i) = the smallest of min(1, m·p(j)/j) over j ≥ i. In the order given.
    function benjaminiHochberg(ps) {
        const m = ps.length;
        const order = rankOrder(ps);
        const out = new Array(m);
        let running = 1;
        for (let rank = m - 1; rank >= 0; rank--) {
            const index = order[rank];
            running = Math.min(running, Math.min(1, m * ps[index] / (rank + 1)));
            out[index] = running;
        }
        return out;
    }

    /* =========================================================
       10. INFORMATION
       p and q are lists of probabilities that add up to 1 (the tool checks that).
       unit: "bits" (logarithms to base 2, the default) or "nats" (natural logarithms).
       0·log 0 counts as 0, as always.
       ========================================================= */
    function perNat(unit) {
        return unit === "nats" ? 1 : 1 / Math.LN2;
    }

    // entropy(p, unit): H(p) = −Σ p·log p
    function entropy(p, unit) {
        let total = 0;
        for (let i = 0; i < p.length; i++) {
            if (p[i] > 0) total -= p[i] * Math.log(p[i]);
        }
        return total * perNat(unit);
    }

    // crossEntropy(p, q, unit): H(p, q) = −Σ p·log q (Infinity when q gives 0 where p does not)
    function crossEntropy(p, q, unit) {
        if (q.length !== p.length) return NaN;
        let total = 0;
        for (let i = 0; i < p.length; i++) {
            if (!(p[i] > 0)) continue;
            if (!(q[i] > 0)) return Infinity;
            total -= p[i] * Math.log(q[i]);
        }
        return total * perNat(unit);
    }

    // kl(p, q, unit): the Kullback–Leibler divergence KL(p ‖ q) = Σ p·log(p/q) (Infinity when q gives 0 where p does not)
    function kl(p, q, unit) {
        if (q.length !== p.length) return NaN;
        let total = 0;
        for (let i = 0; i < p.length; i++) {
            if (!(p[i] > 0)) continue;
            if (!(q[i] > 0)) return Infinity;
            total += p[i] * Math.log(p[i] / q[i]);
        }
        return Math.max(0, total) * perNat(unit);      // it is never negative; rounding may say −10⁻¹⁷
    }

    // jensenShannon(p, q, unit): ½·KL(p ‖ m) + ½·KL(q ‖ m) with m = (p + q)/2: symmetric, at most 1 bit
    function jensenShannon(p, q, unit) {
        if (q.length !== p.length) return NaN;
        const middle = p.map(function (value, i) { return 0.5 * (value + q[i]); });
        return 0.5 * kl(p, middle, unit) + 0.5 * kl(q, middle, unit);
    }

    // binaryEntropy(p, unit): the entropy of a coin that shows heads with probability p
    function binaryEntropy(p, unit) {
        if (!(p >= 0 && p <= 1)) return NaN;
        return entropy([p, 1 - p], unit);
    }

    // klBernoulli(p, q, unit): KL between two coins, p·log(p/q) + (1 − p)·log((1 − p)/(1 − q))
    function klBernoulli(p, q, unit) {
        if (!(p >= 0 && p <= 1) || !(q >= 0 && q <= 1)) return NaN;
        return kl([p, 1 - p], [q, 1 - q], unit);
    }

    /* =========================================================
       11. RANDOM NUMBERS
       rng(seed) gives a generator that repeats: the same seed gives the same
       numbers, in the browser and in Node. The engine is "sfc32" (Chris
       Doty-Humphrey), which passes the strict test suites and never repeats
       within any simulation a browser can run; the seed is spread over its
       four numbers with "splitmix32".
         seed          a whole number or a text
         uniform()     a number above 0 and below 1 (never 0 or 1, so its logarithm is safe)
         normal()      a standard normal value (Box and Muller)
         gamma(shape)  a gamma value with that shape and scale 1 (Marsaglia and Tsang)
         beta(a, b)    a beta value
         int(n)        a whole number from 0 to n − 1, each equally likely
         shuffle(list) shuffles the list itself (in place) and returns it
         uint32()      the next raw 32-bit number
       ========================================================= */
    function hashText(text) {
        let h = 2166136261;
        for (let i = 0; i < text.length; i++) {
            h ^= text.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function rng(seed) {
        const start = typeof seed === "string" ? hashText(seed) : (Math.floor(Number(seed) || 0) >>> 0);
        let mix = start;
        function splitmix() {
            mix = (mix + 0x9e3779b9) | 0;
            let t = mix ^ (mix >>> 16);
            t = Math.imul(t, 0x21f0aaad);
            t ^= t >>> 15;
            t = Math.imul(t, 0x735a2d97);
            return (t ^ (t >>> 15)) >>> 0;
        }
        let a = splitmix();
        let b = splitmix();
        let c = splitmix();
        let d = 1;
        let spare = null;       // Box and Muller make two normal values at a time: the second waits here

        function uint32() {
            const t = (((a + b) | 0) + d) | 0;
            d = (d + 1) | 0;
            a = b ^ (b >>> 9);
            b = (c + (c << 3)) | 0;
            c = (c << 21) | (c >>> 11);
            c = (c + t) | 0;
            return t >>> 0;
        }
        for (let i = 0; i < 15; i++) uint32();      // the first numbers of a fresh generator are thrown away

        function uniform() {
            return (uint32() + 0.5) / 4294967296;
        }

        function normal() {
            if (spare !== null) {
                const kept = spare;
                spare = null;
                return kept;
            }
            const radius = Math.sqrt(-2 * Math.log(uniform()));
            const angle = 2 * Math.PI * uniform();
            spare = radius * Math.sin(angle);
            return radius * Math.cos(angle);
        }

        function gamma(shape) {
            if (!(shape > 0)) return NaN;
            if (shape < 1) return gamma(shape + 1) * Math.pow(uniform(), 1 / shape);
            const dd = shape - 1 / 3;
            const cc = 1 / Math.sqrt(9 * dd);
            for (;;) {
                const x = normal();
                let v = 1 + cc * x;
                if (v <= 0) continue;
                v = v * v * v;
                const u = uniform();
                if (u < 1 - 0.0331 * x * x * x * x) return dd * v;
                if (Math.log(u) < 0.5 * x * x + dd * (1 - v + Math.log(v))) return dd * v;
            }
        }

        function beta(shapeA, shapeB) {
            const x = gamma(shapeA);
            const y = gamma(shapeB);
            return x / (x + y);
        }

        function int(n) {
            n = Math.floor(n);
            if (!(n >= 1)) return NaN;
            if (n > 4294967296) return Math.floor(uniform() * n);
            // Numbers above the last full block of n would make the small results a little
            // more likely: they are drawn again
            const limit = 4294967296 - (4294967296 % n);
            let value = uint32();
            while (value >= limit) value = uint32();
            return value % n;
        }

        function shuffle(list) {
            for (let i = list.length - 1; i > 0; i--) {
                const j = int(i + 1);
                const held = list[i];
                list[i] = list[j];
                list[j] = held;
            }
            return list;
        }

        return { seed: seed, uniform: uniform, normal: normal, gamma: gamma, beta: beta, int: int, shuffle: shuffle, uint32: uint32 };
    }

    /* =========================================================
       12. MATRICES
       A matrix is an array of rows, each an array of numbers. Sizes up to
       about 200 × 200 are meant.
       ========================================================= */
    // transpose(A): rows become columns
    function transpose(A) {
        const rows = A.length;
        const cols = rows ? A[0].length : 0;
        const out = new Array(cols);
        for (let j = 0; j < cols; j++) {
            out[j] = new Array(rows);
            for (let i = 0; i < rows; i++) out[j][i] = A[i][j];
        }
        return out;
    }

    // matMul(A, B): the matrix product A·B
    function matMul(A, B) {
        const rows = A.length;
        const inner = B.length;
        const cols = inner ? B[0].length : 0;
        const out = new Array(rows);
        for (let i = 0; i < rows; i++) {
            const row = new Array(cols).fill(0);
            const left = A[i];
            for (let k = 0; k < inner; k++) {
                const factor = left[k];
                if (factor === 0) continue;
                const right = B[k];
                for (let j = 0; j < cols; j++) row[j] += factor * right[j];
            }
            out[i] = row;
        }
        return out;
    }

    // matVec(A, x): the product of a matrix and a vector
    function matVec(A, x) {
        return A.map(function (row) { return dot(row, x); });
    }

    // dot(x, y): the scalar product Σ x[i]·y[i]
    function dot(x, y) {
        let total = 0;
        for (let i = 0; i < x.length; i++) total += x[i] * y[i];
        return total;
    }

    // gram(X): Xᵀ·X, the symmetric matrix of the scalar products of the columns of X
    function gram(X) {
        const rows = X.length;
        const cols = rows ? X[0].length : 0;
        const out = new Array(cols);
        for (let i = 0; i < cols; i++) out[i] = new Array(cols).fill(0);
        for (let r = 0; r < rows; r++) {
            const row = X[r];
            for (let i = 0; i < cols; i++) {
                const factor = row[i];
                if (factor === 0) continue;
                const target = out[i];
                for (let j = i; j < cols; j++) target[j] += factor * row[j];
            }
        }
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < i; j++) out[i][j] = out[j][i];
        }
        return out;
    }

    // cholesky(A): the lower triangle L with L·Lᵀ = A, for a symmetric positive-definite A
    // (only its lower half is read).  -> { ok: true, L, minPivot } or { ok: false, reason, index }
    //   reason "singular": a pivot lost all its digits (A is singular for a computer, or not
    //   positive definite); "shape": A is not square; "number": an entry is not a finite number.
    //   minPivot: the smallest pivot divided by its diagonal entry. 1/(condition number) is at most
    //   this, so a value under about 10⁻¹⁰ says that the solution has few correct digits left.
    //   options.tolerance: a pivot must be above tolerance·(the largest diagonal entry); 64·n·2⁻⁵² if left out.
    function cholesky(A, options) {
        const n = A.length;
        const L = new Array(n);
        let largest = 0;
        for (let i = 0; i < n; i++) {
            if (!A[i] || A[i].length !== n) return { ok: false, reason: "shape", index: i };
            if (!isNumber(A[i][i])) return { ok: false, reason: "number", index: i };
            largest = Math.max(largest, Math.abs(A[i][i]));
            L[i] = new Array(n).fill(0);
        }
        const tolerance = options && options.tolerance !== undefined ? options.tolerance : 64 * n * EPS;
        let minPivot = 1;
        for (let j = 0; j < n; j++) {
            const rowJ = L[j];
            let pivot = A[j][j];
            for (let k = 0; k < j; k++) pivot -= rowJ[k] * rowJ[k];
            if (!(pivot > tolerance * largest)) {
                return { ok: false, reason: isNaN(pivot) ? "number" : "singular", index: j };
            }
            minPivot = Math.min(minPivot, pivot / A[j][j]);
            const root = Math.sqrt(pivot);
            rowJ[j] = root;
            for (let i = j + 1; i < n; i++) {
                const rowI = L[i];
                let value = A[i][j];
                for (let k = 0; k < j; k++) value -= rowI[k] * rowJ[k];
                rowI[j] = value / root;
            }
        }
        return { ok: true, L: L, minPivot: minPivot };
    }

    // choleskySolve(L, b): solves L·Lᵀ·x = b for the L of cholesky() -> x
    function choleskySolve(L, b) {
        const n = L.length;
        const y = new Array(n);
        for (let i = 0; i < n; i++) {
            let value = b[i];
            const row = L[i];
            for (let k = 0; k < i; k++) value -= row[k] * y[k];
            y[i] = value / row[i];
        }
        const x = new Array(n);
        for (let i = n - 1; i >= 0; i--) {
            let value = y[i];
            for (let k = i + 1; k < n; k++) value -= L[k][i] * x[k];
            x[i] = value / L[i][i];
        }
        return x;
    }

    // solveSpd(A, b): solves A·x = b for a symmetric positive-definite A
    //   -> { ok: true, x, minPivot } or { ok: false, reason, index } (see cholesky): never a wrong x for a singular A
    function solveSpd(A, b, options) {
        const factor = cholesky(A, options);
        if (!factor.ok) return factor;
        if (!b || b.length !== A.length) return { ok: false, reason: "shape" };
        const x = choleskySolve(factor.L, b);
        for (let i = 0; i < x.length; i++) {
            if (!isNumber(x[i])) return { ok: false, reason: "number", index: i };
        }
        return { ok: true, x: x, minPivot: factor.minPivot };
    }

    // eigSymStart(A, options): the eigenvalues of a symmetric matrix by Jacobi's rotations, in pieces
    // (give its step to the bench kit's job helper; 200 × 200 takes a moment).
    //   options.vectors: true also gives the eigenvectors
    //   -> { step(rows) -> true when finished, done, progress (0..1, a guess), result() }
    //   result() -> { ok, values (rising), vectors (vectors[k] belongs to values[k]), sweeps }
    // Only the upper half of A is read. Jacobi's method is slow but very exact.
    function eigSymStart(A, options) {
        const n = A.length;
        const wantVectors = Boolean(options && options.vectors);
        const a = new Float64Array(n * n);
        const v = wantVectors ? new Float64Array(n * n) : null;
        const d = new Float64Array(n);
        const bb = new Float64Array(n);
        const zz = new Float64Array(n);
        let bad = false;
        for (let i = 0; i < n; i++) {
            if (!A[i] || A[i].length !== n) bad = true;
            for (let j = 0; j < n && !bad; j++) {
                const value = j >= i ? A[i][j] : A[j][i];
                if (!isNumber(value)) bad = true;
                a[i * n + j] = value;
            }
            if (v) v[i * n + i] = 1;
            if (!bad) {
                d[i] = A[i][i];
                bb[i] = d[i];
            }
        }
        const MAX_SWEEPS = 60;
        let sweep = 0;
        let p = 0;              // the row the next piece of work starts at
        let threshold = 0;
        let finished = bad || n < 2;

        function offDiagonal() {
            let total = 0;
            for (let i = 0; i < n - 1; i++) {
                for (let j = i + 1; j < n; j++) total += Math.abs(a[i * n + j]);
            }
            return total;
        }

        function beginSweep() {
            const total = offDiagonal();
            if (total === 0 || sweep >= MAX_SWEEPS) {
                finished = true;
                return;
            }
            sweep += 1;
            threshold = sweep < 4 ? 0.2 * total / (n * n) : 0;
            p = 0;
        }

        // One turn in the plane of the rows p and q that makes the entry (p, q) zero
        function rotate(i, j, k, l, s, tau) {
            const g = a[i * n + j];
            const h = a[k * n + l];
            a[i * n + j] = g - s * (h + g * tau);
            a[k * n + l] = h + s * (g - h * tau);
        }

        function rowOfRotations(row) {
            for (let q = row + 1; q < n; q++) {
                const entry = a[row * n + q];
                const g = 100 * Math.abs(entry);
                if (sweep > 4 && Math.abs(d[row]) + g === Math.abs(d[row]) && Math.abs(d[q]) + g === Math.abs(d[q])) {
                    a[row * n + q] = 0;                     // far too small to matter any more
                } else if (Math.abs(entry) > threshold) {
                    let h = d[q] - d[row];
                    let t;
                    if (Math.abs(h) + g === Math.abs(h)) {
                        t = entry / h;
                    } else {
                        const theta = 0.5 * h / entry;
                        t = 1 / (Math.abs(theta) + Math.sqrt(1 + theta * theta));
                        if (theta < 0) t = -t;
                    }
                    const c = 1 / Math.sqrt(1 + t * t);
                    const s = t * c;
                    const tau = s / (1 + c);
                    h = t * entry;
                    zz[row] -= h;
                    zz[q] += h;
                    d[row] -= h;
                    d[q] += h;
                    a[row * n + q] = 0;
                    for (let j = 0; j < row; j++) rotate(j, row, j, q, s, tau);
                    for (let j = row + 1; j < q; j++) rotate(row, j, j, q, s, tau);
                    for (let j = q + 1; j < n; j++) rotate(row, j, q, j, s, tau);
                    if (v) {
                        for (let j = 0; j < n; j++) {
                            const g2 = v[j * n + row];
                            const h2 = v[j * n + q];
                            v[j * n + row] = g2 - s * (h2 + g2 * tau);
                            v[j * n + q] = h2 + s * (g2 - h2 * tau);
                        }
                    }
                }
            }
        }

        function endSweep() {
            for (let i = 0; i < n; i++) {
                bb[i] += zz[i];
                d[i] = bb[i];
                zz[i] = 0;
            }
        }

        const run = {
            done: finished,
            progress: finished ? 1 : 0,
            step: function (rows) {
                let left = Math.max(1, Math.floor(rows || 1));
                while (!finished && left > 0) {
                    if (sweep === 0 || p >= n - 1) {
                        if (sweep > 0) endSweep();
                        beginSweep();
                        if (finished) break;
                    }
                    rowOfRotations(p);
                    p += 1;
                    left -= 1;
                }
                run.done = finished;
                // Jacobi's method usually needs 6 to 10 sweeps: an honest guess, not a promise
                run.progress = finished ? 1 : Math.min(0.97, (sweep - 1 + p / Math.max(1, n - 1)) / 9);
                return finished;
            },
            result: function () {
                if (bad) return { ok: false, reason: "shape", values: [], vectors: null, sweeps: 0 };
                const order = [];
                for (let i = 0; i < n; i++) order.push(i);
                order.sort(function (i, j) { return d[i] - d[j]; });
                const values = order.map(function (i) { return d[i]; });
                let vectors = null;
                if (v) {
                    vectors = order.map(function (column) {
                        const vector = new Array(n);
                        for (let i = 0; i < n; i++) vector[i] = v[i * n + column];
                        return vector;
                    });
                }
                return { ok: finished && sweep < MAX_SWEEPS, values: values, vectors: vectors, sweeps: sweep };
            }
        };
        return run;
    }

    // eigSym(A, options): the same, run to the end at once -> its result()
    function eigSym(A, options) {
        const run = eigSymStart(A, options);
        while (!run.step(64)) { /* until the off-diagonal part is gone */ }
        return run.result();
    }

    /* =========================================================
       13. NUMERICS, AND THE LIST OF WHAT M HAS
       ========================================================= */
    // integrate(f, a, b, n): ∫ f from a to b by Simpson's rule with n steps (even; 1,000 if left out)
    function integrate(f, a, b, n) {
        let steps = Math.max(2, Math.floor(n || 1000));
        if (steps % 2) steps += 1;
        const h = (b - a) / steps;
        let total = f(a) + f(b);
        for (let i = 1; i < steps; i++) total += (i % 2 ? 4 : 2) * f(a + i * h);
        return total * h / 3;
    }

    // bisect(f, lo, hi, options): a root of f between lo and hi, where f changes its sign
    // (NaN when it does not). options.log: true halves on a logarithmic scale (lo and hi above 0),
    // which finds 10⁻⁷ as easily as 10⁷.
    function bisect(f, lo, hi, options) {
        const log = Boolean(options && options.log);
        let fLo = f(lo);
        const fHi = f(hi);
        if (fLo === 0) return lo;
        if (fHi === 0) return hi;
        if (isNaN(fLo) || isNaN(fHi) || (fLo > 0) === (fHi > 0)) return NaN;
        for (let i = 0; i < 300; i++) {
            const middle = log ? Math.sqrt(lo) * Math.sqrt(hi) : 0.5 * (lo + hi);
            if (!(middle > lo && middle < hi)) return middle;      // lo and hi are neighbours: no number between them
            const value = f(middle);
            if (value === 0) return middle;
            if ((value > 0) === (fLo > 0)) {
                lo = middle;
                fLo = value;
            } else {
                hi = middle;
            }
        }
        return log ? Math.sqrt(lo) * Math.sqrt(hi) : 0.5 * (lo + hi);
    }

    // minimise(f, lo, hi, tolerance): the lowest point of f between lo and hi by golden-section
    // search (f must have one valley there) -> { x, value }. x is right to about 8 digits.
    function minimise(f, lo, hi, tolerance) {
        const ratio = 0.6180339887498949;
        const tol = tolerance || 1e-9;
        let a = lo;
        let b = hi;
        let x1 = b - ratio * (b - a);
        let x2 = a + ratio * (b - a);
        let f1 = f(x1);
        let f2 = f(x2);
        for (let i = 0; i < 300 && Math.abs(b - a) > tol * (Math.abs(a) + Math.abs(b)) + 1e-300; i++) {
            if (f1 < f2) {
                b = x2;
                x2 = x1;
                f2 = f1;
                x1 = b - ratio * (b - a);
                f1 = f(x1);
            } else {
                a = x1;
                x1 = x2;
                f1 = f2;
                x2 = a + ratio * (b - a);
                f2 = f(x2);
            }
        }
        const x = 0.5 * (a + b);
        return { x: x, value: f(x) };
    }

    return {
        // special functions
        lnGamma: lnGamma, lnBeta: lnBeta, erf: erf, erfc: erfc,
        gammaP: gammaP, gammaQ: gammaQ, gammaInv: gammaInv,
        betaI: betaI, betaIc: betaIc, betaInv: betaInv,
        // distributions
        normalPdf: normalPdf, normalCdf: normalCdf, normalSf: normalSf, normalInv: normalInv, zFor: zFor,
        tPdf: tPdf, tCdf: tCdf, tSf: tSf, tInv: tInv, tFor: tFor,
        chi2Cdf: chi2Cdf, chi2Sf: chi2Sf, chi2Inv: chi2Inv, fCdf: fCdf, fSf: fSf,
        binomPmf: binomPmf, binomCdf: binomCdf, binomSf: binomSf,
        // describing numbers
        sum: sum, mean: mean, variance: variance, sd: sd, sem: sem, min: min, max: max,
        median: median, quantile: quantile, correlation: correlation, linearFit: linearFit,
        // intervals and tests
        wilson: wilson, wilsonN: wilsonN, waldN: waldN, clopperPearson: clopperPearson,
        twoProportions: twoProportions, mcnemar: mcnemar,
        tInterval: tInterval, welch: welch, pairedT: pairedT, effectSize: effectSize, superiority: superiority,
        // resampling and many comparisons
        bootstrap: bootstrap, bootstrapStart: bootstrapStart,
        bonferroni: bonferroni, holm: holm, benjaminiHochberg: benjaminiHochberg,
        // information
        entropy: entropy, crossEntropy: crossEntropy, kl: kl, jensenShannon: jensenShannon,
        binaryEntropy: binaryEntropy, klBernoulli: klBernoulli,
        // chance
        rng: rng,
        // matrices
        transpose: transpose, matMul: matMul, matVec: matVec, dot: dot, gram: gram,
        cholesky: cholesky, choleskySolve: choleskySolve, solveSpd: solveSpd, eigSym: eigSym, eigSymStart: eigSymStart,
        // numerics
        integrate: integrate, bisect: bisect, minimise: minimise
    };
});
