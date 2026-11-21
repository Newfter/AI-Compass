/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "bounds": GENERALISATION BOUNDS
   For chosen n, δ, |H|, d and a wanted gap ε:
     - at n: Hoeffding for one fixed h, the union bound over a finite class,
       the realisable case, and the order of the VC bound
     - for ε: the n each of them asks for (an n that is enough: the bounds are
       sufficient conditions, a smaller n may do, so no text says "needs")
     - a chart of the four bounds against n (both axes logarithmic), with
       the lines ε and 1 and the points where each bound drops below ε
     - a verdict that says plainly when a bound is vacuous (above 1)
   The formulas are exactly those of unit t1 (S/r9/theory/TOPICS.md, t1).
   Texts: js/content/research/bounds.js. The functions of section 1 are pure
   and are given to the tests as spec.maths (dev/tests/research.bounds.math.js).
   This file is one of the two models for every bench tool: see
   S/r9/research/TOOL-GUIDE.md.
    1. The numbers (pure)
    2. The chart's data
    3. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const CURVE_POINTS = 200;            // points per curve on the chart
    const MAX_DECADES = 16;              // the chart's n axis spans at most this many powers of ten

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       ln(2/δ) is written ln 2 − ln δ, so a tiny δ (10⁻³⁰⁰) does not overflow.
       ========================================================= */
    function ln2Over(delta) {
        return Math.LN2 - Math.log(delta);
    }
    function ln1Over(delta) {
        return -Math.log(delta);
    }

    // The smallest whole n ≥ 1 for which ok(n) holds, starting from x, the formula's value.
    // ok is the bound's own test, so a rounding error in x (4612.000000000001 for an exact
    // 4612) cannot move the answer. Beyond 9·10¹⁵ whole numbers are not exact: x rounded up.
    function smallestWhole(x, ok) {
        if (!isFinite(x)) return x > 0 ? Infinity : 1;
        let n = Math.max(1, Math.ceil(x));
        if (n >= 9e15) return n;
        for (let i = 0; i < 8 && n > 1 && ok(n - 1); i++) n -= 1;
        for (let i = 0; i < 8 && !ok(n); i++) n += 1;
        return n;
    }

    // One fixed h: √(ln(2/δ) / (2n))
    function hoeffding(n, delta) {
        return Math.sqrt(ln2Over(delta) / (2 * n));
    }

    // Every h in a finite class H: √((ln|H| + ln(2/δ)) / (2n))
    function finite(n, delta, size) {
        return Math.sqrt((Math.log(size) + ln2Over(delta)) / (2 * n));
    }

    // Realisable case, an h with no training errors: R(h) ≤ (ln|H| + ln(1/δ)) / n
    function realisable(n, delta, size) {
        return (Math.log(size) + ln1Over(delta)) / n;
    }

    // The smallest n at which the VC order is shown: e·d (from there on it falls with n;
    // between d and e·d the expression still rises, so it would read as a false promise)
    function vcStart(d) {
        return Math.E * d;
    }

    // The VC order √((d·ln(n/d) + ln(1/δ)) / n), or NaN below n = e·d
    function vcOrder(n, delta, d) {
        if (!(n >= vcStart(d))) return NaN;
        return Math.sqrt((d * Math.log(n / d) + ln1Over(delta)) / n);
    }

    // The examples each bound asks for a gap ε: { exact (the formula, before rounding up), n }
    // n is the smallest whole number at which the bound itself is at most ε
    function needHoeffding(eps, delta) {
        const exact = ln2Over(delta) / (2 * eps * eps);
        return { exact: exact, n: smallestWhole(exact, function (n) { return ln2Over(delta) / (2 * n) <= eps * eps; }) };
    }
    function needFinite(eps, delta, size) {
        const exact = (Math.log(size) + ln2Over(delta)) / (2 * eps * eps);
        return { exact: exact, n: smallestWhole(exact, function (n) { return (Math.log(size) + ln2Over(delta)) / (2 * n) <= eps * eps; }) };
    }
    function needRealisable(eps, delta, size) {
        const exact = (Math.log(size) + ln1Over(delta)) / eps;
        return { exact: exact, n: smallestWhole(exact, function (n) { return realisable(n, delta, size) <= eps; }) };
    }

    // The smallest whole n ≥ e·d at which the VC order is at most ε (bisection on the
    // square, which falls with n from e·d on), or Infinity beyond 10³⁰⁰
    function needVc(eps, delta, d) {
        const M = A.researchMath;
        const start = Math.ceil(vcStart(d));
        const target = eps * eps;
        const square = function (n) { return (d * Math.log(n / d) + ln1Over(delta)) / n; };
        if (square(start) <= target) return { exact: start, n: start };
        let hi = start * 2;
        while (square(hi) > target) {
            hi *= 2;
            if (!(hi < 1e300)) return { exact: Infinity, n: Infinity };
        }
        const root = M.bisect(function (n) { return square(n) - target; }, start, hi, { log: true });
        return { exact: root, n: smallestWhole(root, function (n) { return n >= start && square(n) <= target; }) };
    }

    // Can 1 − δ be written exactly as a percentage ("95%")? Yes for a δ with at most 10
    // decimals. For a smaller or longer δ the percentage would be rounded, and for a tiny δ
    // (10⁻¹³ and below) it would read "at least 100%", which no bound promises: the verdict
    // then says "1 − δ" instead.
    function exactPercent(delta) {
        return Number(delta.toFixed(10)) === delta;
    }

    // Everything at once, for the tool and the tests
    function all(n, delta, size, d, eps) {
        return {
            hoeffding: hoeffding(n, delta),
            finite: finite(n, delta, size),
            realisable: realisable(n, delta, size),
            vc: vcOrder(n, delta, d),
            need: {
                hoeffding: needHoeffding(eps, delta),
                finite: needFinite(eps, delta, size),
                realisable: needRealisable(eps, delta, size),
                vc: needVc(eps, delta, d)
            }
        };
    }

    /* =========================================================
       2. THE CHART'S DATA
       The n axis covers the entered n and every n the bounds ask for (one power
       of ten more on each side); the curves are sampled evenly on a log scale.
       ========================================================= */
    function chartRange(n, r) {
        const ns = [n, r.need.hoeffding.n, r.need.finite.n, r.need.realisable.n, r.need.vc.n].filter(function (value) { return value > 0 && value < 1e15; });
        let low = Math.max(0, Math.floor(Math.log10(Math.min.apply(null, ns))) - 1);
        let high = Math.ceil(Math.log10(Math.max.apply(null, ns)) + 1e-9) + 1;
        if (high - low < 3) high = low + 3;
        if (high - low > MAX_DECADES) low = high - MAX_DECADES;
        return { low: low, high: high };
    }

    function curves(delta, size, d, range) {
        const data = { hoeffding: [], finite: [], realisable: [], vc: [] };
        for (let i = 0; i <= CURVE_POINTS; i++) {
            const x = Math.pow(10, range.low + (range.high - range.low) * i / CURVE_POINTS);
            data.hoeffding.push([x, hoeffding(x, delta)]);
            data.finite.push([x, finite(x, delta, size)]);
            data.realisable.push([x, realisable(x, delta, size)]);
            const vc = vcOrder(x, delta, d);
            if (!isNaN(vc)) data.vc.push([x, vc]);
        }
        // the VC curve starts exactly at e·d
        const start = vcStart(d);
        if (start >= Math.pow(10, range.low) && start <= Math.pow(10, range.high)) data.vc.unshift([start, vcOrder(start, delta, d)]);
        return data;
    }

    const maths = {
        smallestWhole: smallestWhole, hoeffding: hoeffding, finite: finite, realisable: realisable, vcStart: vcStart, vcOrder: vcOrder,
        needHoeffding: needHoeffding, needFinite: needFinite, needRealisable: needRealisable, needVc: needVc, all: all,
        exactPercent: exactPercent, chartRange: chartRange, curves: curves
    };

    /* =========================================================
       3. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(ctx);
        const num = kit.num;

        function w(value, digits) {
            return num(value, { digits: digits || 4, grouping: false });
        }
        function exactly(value) {
            return num(value, { digits: 12, grouping: false });
        }

        const panel = K.panel(stage, { questionKey: "research.bounds.question", titleKey: "research.bounds.title", onChange: refresh });
        panel.field({ name: "n", labelKey: "research.bounds.n", kind: "int", min: 1, value: 1000, powers: true });
        panel.field({ name: "delta", labelKey: "research.bounds.delta", kind: "prob", min: 0, max: 1, minOpen: true, maxOpen: true, value: 0.05, powers: true, hintKey: "research.bounds.deltaHint" });
        panel.field({ name: "size", labelKey: "research.bounds.h", kind: "int", min: 1, value: 1000, powers: true, hintKey: "research.bounds.hHint" });
        panel.field({ name: "d", labelKey: "research.bounds.d", kind: "int", min: 1, value: 10, powers: true, hintKey: "research.bounds.dHint" });
        panel.field({ name: "eps", labelKey: "research.bounds.eps", kind: "number", min: 0, max: 1, minOpen: true, value: 0.05, powers: true, hintKey: "research.bounds.epsHint" });

        panel.heading("research.bounds.atN");
        const rows = {
            hoeffding: panel.result({ name: "hoeffding", labelKey: "research.bounds.hoeff" }),
            finite: panel.result({ name: "finite", labelKey: "research.bounds.finite" }),
            realisable: panel.result({ name: "realisable", labelKey: "research.bounds.real" }),
            vc: panel.result({ name: "vc", labelKey: "research.bounds.vc", hintKey: "research.bounds.vcHint" })
        };
        panel.heading("research.bounds.forEps");
        const needs = {
            hoeffding: panel.result({ name: "nHoeffding", labelKey: "research.bounds.nHoeff", kind: "int", unitKey: "research.bounds.unit.examples" }),
            finite: panel.result({ name: "nFinite", labelKey: "research.bounds.nFinite", kind: "int", unitKey: "research.bounds.unit.examples" }),
            realisable: panel.result({ name: "nRealisable", labelKey: "research.bounds.nReal", kind: "int", unitKey: "research.bounds.unit.examples" }),
            vc: panel.result({ name: "nVc", labelKey: "research.bounds.nVc", kind: "int", unitKey: "research.bounds.unit.examples" })
        };
        panel.remark({ key: "research.bounds.remark" });
        const chart = panel.chart({
            labelKey: "research.bounds.chart",
            height: 300,
            x: { log: true, labelKey: "research.bounds.axisN" },
            y: { log: true, labelKey: "research.bounds.axisGap" }
        }, "below");
        panel.formula({ key: "research.bounds.formula" });
        panel.source({ nameKey: "research.bounds.source", units: ["t1"] });

        // A worked formula, marked when its bound is above 1
        function worked(text, value) {
            return value > 1 ? t("research.bounds.vacuousMark", { work: text }) : text;
        }

        function refresh() {
            const v = panel.values();
            if (!v) return;
            const n = v.n;
            const delta = v.delta;
            const size = v.size;
            const d = v.d;
            const eps = v.eps;
            const r = all(n, delta, size, d, eps);
            const words = {
                n: String(n), n2: String(2 * n), delta: exactly(delta), h: exactly(size), d: String(d), eps: exactly(eps),
                l2: w(ln2Over(delta)), l1: w(ln1Over(delta)), lh: w(Math.log(size)), ed: w(vcStart(d))
            };
            const tone = function (value) { return value > 1 ? "bad" : value <= eps ? "good" : undefined; };
            rows.hoeffding.set(r.hoeffding, { tone: tone(r.hoeffding), formula: worked(t("research.bounds.hoeffWork", Object.assign({}, words, { value: w(r.hoeffding) })), r.hoeffding) });
            rows.finite.set(r.finite, { tone: tone(r.finite), formula: worked(t("research.bounds.finiteWork", Object.assign({}, words, { value: w(r.finite) })), r.finite) });
            rows.realisable.set(r.realisable, { tone: tone(r.realisable), formula: worked(t("research.bounds.realWork", Object.assign({}, words, { value: w(r.realisable) })), r.realisable) });
            if (isNaN(r.vc)) {
                rows.vc.set(null, { formula: t("research.bounds.vcSmall", words), tone: "bad" });
            } else {
                rows.vc.set(r.vc, { tone: tone(r.vc), formula: worked(t("research.bounds.vcWork", Object.assign({}, words, { dl: w(d * Math.log(n / d)), value: w(r.vc) })), r.vc) });
            }
            needs.hoeffding.set(r.need.hoeffding.n, { formula: t("research.bounds.nHoeffWork", Object.assign({}, words, { exact: w(r.need.hoeffding.exact, 6), n: String(r.need.hoeffding.n) })) });
            needs.finite.set(r.need.finite.n, { formula: t("research.bounds.nFiniteWork", Object.assign({}, words, { exact: w(r.need.finite.exact, 6), n: String(r.need.finite.n) })) });
            needs.realisable.set(r.need.realisable.n, { formula: t("research.bounds.nRealWork", Object.assign({}, words, { exact: w(r.need.realisable.exact, 6), n: String(r.need.realisable.n) })) });
            needs.vc.set(r.need.vc.n, { formula: t("research.bounds.nVcWork", Object.assign({}, words, { n: num(r.need.vc.n, { grouping: false }) })) });

            // The verdict: the union bound (the bound for these settings), then what else is vacuous
            const said = {
                n: num(n), h: num(size), value: num(r.finite), eps: num(eps, { digits: 12 }), need: num(r.need.finite.n),
                conf: exactPercent(delta) ? num(1 - delta, { percent: true, digits: 12 }) : t("research.bounds.confWords")
            };
            let text;
            let verdictTone;
            if (r.finite > 1) {
                text = t("research.bounds.verdictVacuous", said);
                verdictTone = "bad";
            } else if (r.finite <= eps) {
                text = t("research.bounds.verdictWithin", said);
                verdictTone = "good";
            } else {
                text = t("research.bounds.verdictAbove", said);
                verdictTone = "warn";
            }
            const others = [];
            if (r.hoeffding > 1) others.push(t("research.bounds.short.hoeff"));
            if (r.realisable > 1) others.push(t("research.bounds.short.real"));
            if (isNaN(r.vc) || r.vc > 1) others.push(t("research.bounds.short.vc"));
            if (others.length) text += " " + t("research.bounds.verdictOthers", { list: others.join(t("research.bounds.listAnd")) });
            panel.verdict.set(text, verdictTone);

            drawChart(n, delta, size, d, eps, r);
        }

        function drawChart(n, delta, size, d, eps, r) {
            const range = chartRange(n, r);
            const data = curves(delta, size, d, range);
            const all4 = [data.hoeffding, data.finite, data.realisable, data.vc];
            let lowest = eps;
            all4.forEach(function (curve) {
                curve.forEach(function (point) { if (point[1] > 0) lowest = Math.min(lowest, point[1]); });
            });
            const names = { hoeffding: 0, finite: 1, realisable: 2, vc: 3 };
            const marks = [{ x: n, label: function () { return t("research.bounds.markN", { n: num(n) }); } }];
            Object.keys(names).forEach(function (name) {
                const need = r.need[name].n;
                if (!(need >= Math.pow(10, range.low) && need <= Math.pow(10, range.high))) return;
                marks.push({
                    x: need, y: eps, colorIndex: names[name],
                    label: name === "finite" ? function () { return t("research.bounds.markCross", { n: num(need) }); } : undefined
                });
            });
            chart.set({
                x: { log: true, labelKey: "research.bounds.axisN", min: Math.pow(10, range.low), max: Math.pow(10, range.high) },
                y: { log: true, labelKey: "research.bounds.axisGap", min: Math.pow(10, Math.floor(Math.log10(lowest) + 1e-9)), max: 10 },
                series: [
                    { kind: "line", data: data.hoeffding, colorIndex: 0, labelKey: "research.bounds.series.hoeff" },
                    { kind: "line", data: data.finite, colorIndex: 1, labelKey: "research.bounds.series.finite", width: 2.5 },
                    { kind: "line", data: data.realisable, colorIndex: 2, labelKey: "research.bounds.series.real" },
                    { kind: "line", data: data.vc, colorIndex: 3, labelKey: "research.bounds.series.vc", dash: true }
                ],
                hlines: [
                    { y: eps, label: function () { return t("research.bounds.lineEps", { eps: num(eps, { digits: 12 }) }); } },
                    { y: 1, color: "danger", label: function () { return t("research.bounds.lineOne"); } }
                ],
                marks: marks,
                describe: function () {
                    return t("research.bounds.describe", {
                        n: num(n), eps: num(eps, { digits: 12 }), hoeff: num(r.hoeffding), finite: num(r.finite), real: num(r.realisable), vc: num(r.vc),
                        nHoeff: num(r.need.hoeffding.n), nFinite: num(r.need.finite.n), nReal: num(r.need.realisable.n), nVc: num(r.need.vc.n)
                    });
                }
            });
        }

        refresh();
        return K.controller(refresh);
    }

    A.research.define("bounds", { create: create, maths: maths });
})();
