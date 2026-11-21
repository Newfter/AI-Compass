/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "noise": DIFFUSION NOISE SCHEDULES
   How much signal is left at step t of the noising process of a diffusion
   model, for the linear schedule (β evenly spaced from β_1 to β_T) and the
   cosine schedule (ᾱ_t = f(t)/f(0), f(t) = cos²(((t/T + s)/(1 + s))·π/2),
   s = 0.008, each β_t capped at 0.999), and for the continuous form of the
   linear one (the variance-preserving process with β(u) linear on [0, 1]):
     - at step t: β_t, ᾱ_t, the signal and noise scales, SNR and ln SNR,
       the posterior variance β̃_t, the factor σ_t/α_t
     - for the whole schedule: the first step with SNR below 1, the values at T
     - two charts that draw both schedules and the continuous form
   Every product of (1 − β_i) is kept as a sum of logarithms, so ᾱ near 1
   and 1 − ᾱ near 1 both keep their digits.
   Texts: js/content/research/noise.js. The functions of section 1 are pure
   and are given to the tests as spec.maths (dev/tests/research.noise.math.js).
    1. The numbers (pure)
    2. The verdict (pure)
    3. A helper for the page: a rule a field's limits cannot say
    4. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["r6", "t7"];
    const OFFSET = 0.008;              // s of the cosine schedule
    const CAP = 0.999;                 // the largest β_t of the cosine schedule
    const TOO_SMALL = -300 * Math.LN10; // ln ᾱ below this is exactly ᾱ < 10⁻³⁰⁰, as the message says: the number cannot be written
    const LEFT_AT_END = 0.01;          // a signal scale at T from here on is worth a warning
    const CHART_POINTS = 1000;         // at most this many points of each line

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       A schedule is a list of β_1 … β_T (index 0 is β_1).
       ========================================================= */
    // β_t evenly spaced from β_1 to β_T
    function linearBetas(T, first, last) {
        const betas = [];
        for (let i = 0; i < T; i++) betas.push(first + (last - first) * i / (T - 1));
        return betas;
    }

    // f(t) = cos²(((t/T + s)/(1 + s))·π/2)
    function cosineF(step, T) {
        const c = Math.cos(((step / T + OFFSET) / (1 + OFFSET)) * Math.PI / 2);
        return c * c;
    }

    // β_t = 1 − ᾱ_t/ᾱ_{t−1} = 1 − f(t)/f(t − 1), capped at 0.999
    function cosineBetas(T) {
        const betas = [];
        for (let step = 1; step <= T; step++) betas.push(Math.min(CAP, 1 - cosineF(step, T) / cosineF(step - 1, T)));
        return betas;
    }

    // ln ᾱ_t for t = 0 … T: the running sum of ln(1 − β_i) (ln ᾱ_0 = 0)
    function logAlphaBars(betas) {
        const out = [0];
        let sum = 0;
        for (let i = 0; i < betas.length; i++) {
            sum += Math.log1p(-betas[i]);
            out.push(sum);
        }
        return out;
    }

    // Everything at one ln ᾱ: ᾱ, the signal and noise scales, SNR, ln SNR, σ/α
    function fromLog(L) {
        const abar = Math.exp(L);
        const rest = -Math.expm1(L);                      // 1 − ᾱ, with its digits when ᾱ is near 1
        const lnSnr = L - Math.log(rest);
        return { L: L, abar: abar, rest: rest, signal: Math.sqrt(abar), noise: Math.sqrt(rest), snr: abar / rest, lnSnr: lnSnr, factor: Math.exp(-lnSnr / 2) };
    }

    // One schedule, all at once -> { betas, logs (ln ᾱ_0 … ln ᾱ_T), first (the first t with
    // SNR < 1, i.e. ᾱ_t < ½; null: never), capped (how many β hit the cap) }
    function schedule(kind, T, first, last) {
        const betas = kind === "cosine" ? cosineBetas(T) : linearBetas(T, first, last);
        const logs = logAlphaBars(betas);
        let below = null;
        for (let step = 1; step <= T; step++) {
            if (logs[step] < -Math.LN2) {
                below = step;
                break;
            }
        }
        const capped = kind === "cosine" ? betas.filter(function (b) { return b >= CAP; }).length : 0;
        return { kind: kind, T: T, betas: betas, logs: logs, first: below, capped: capped };
    }

    // At step t: β_t, the values of fromLog, and the posterior variance
    // β̃_t = β_t·(1 − ᾱ_{t−1})/(1 − ᾱ_t) (0 at t = 1, where ᾱ_0 = 1)
    function at(s, step) {
        const r = fromLog(s.logs[step]);
        r.beta = s.betas[step - 1];
        r.posterior = r.beta * (-Math.expm1(s.logs[step - 1])) / r.rest;
        return r;
    }

    // The continuous form: ln ᾱ(u) = −β_min·u − ½·(β_max − β_min)·u², with β_min = T·β_1,
    // β_max = T·β_T
    function continuousLog(u, betaMin, betaMax) {
        return -betaMin * u - 0.5 * (betaMax - betaMin) * u * u;
    }

    // The steps a chart draws: every step up to CHART_POINTS, else evenly spaced ones with 1 and T
    function chartSteps(T) {
        if (T <= CHART_POINTS) {
            const all = [];
            for (let step = 1; step <= T; step++) all.push(step);
            return all;
        }
        const list = [];
        for (let i = 0; i < CHART_POINTS; i++) {
            const step = 1 + Math.round(i * (T - 1) / (CHART_POINTS - 1));
            if (list[list.length - 1] !== step) list.push(step);
        }
        return list;
    }

    /* =========================================================
       2. THE VERDICT (pure)
         order: which schedule keeps SNR ≥ 1 longer: "cosine" (cosine later), "linear",
                "same"; "neverLinear" / "neverCosine" / "neverBoth" when one never falls below 1
         endWarn: the linear schedule still keeps a signal scale of 0.01 or more at T
       ========================================================= */
    function verdictParts(firstLinear, firstCosine, endSignalLinear) {
        let order;
        if (firstLinear === null && firstCosine === null) order = "neverBoth";
        else if (firstLinear === null) order = "neverLinear";
        else if (firstCosine === null) order = "neverCosine";
        else if (firstCosine > firstLinear) order = "cosine";
        else if (firstCosine < firstLinear) order = "linear";
        else order = "same";
        return { order: order, endWarn: endSignalLinear >= LEFT_AT_END };
    }

    // How many significant digits a share needs in a sentence ("keeps 28% of the signal's
    // scale"): the wanted number, or more when that would round a share below 1 up to 100%
    // (at step 1 the signal scale is 0.99995: "99.99%", never "100%": some signal is always lost)
    function shareDigits(share, digits) {
        let d = digits;
        while (d < 15 && share < 1 && Number((share * 100).toPrecision(d)) >= 100) d += 1;
        return d;
    }

    const maths = {
        linearBetas: linearBetas, cosineF: cosineF, cosineBetas: cosineBetas, logAlphaBars: logAlphaBars, fromLog: fromLog,
        schedule: schedule, at: at, continuousLog: continuousLog, chartSteps: chartSteps, verdictParts: verdictParts, shareDigits: shareDigits,
        OFFSET: OFFSET, CAP: CAP, TOO_SMALL: TOO_SMALL
    };

    /* =========================================================
       3. A RULE THAT A FIELD'S LIMITS CANNOT SAY
       (a candidate for the bench kit: see js/research/sizer.js, section 3)
       ========================================================= */
    function crossRule(item, test) {
        const ownValid = item.valid;
        let message = "";
        let shown = "";
        item.valid = function () { return ownValid() && !message; };
        function paint() {
            if (!ownValid()) return;
            const box = item.element.querySelector(".rk-msg");
            if (box && (message || box.textContent === shown)) A.dom.setText(box, message);
            shown = message;
            item.element.classList.toggle("is-invalid", Boolean(message));
            if (message) item.input.setAttribute("aria-invalid", "true");
            else item.input.removeAttribute("aria-invalid");
        }
        item.input.addEventListener("keydown", function (event) { if (event.key === "Enter") paint(); });
        item.input.addEventListener("change", paint);
        return function check() {
            message = ownValid() ? test() || "" : "";
            paint();
        };
    }

    /* =========================================================
       4. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(ctx);
        const num = kit.num;

        function w(value, digits) {
            return num(value, { digits: digits || 6, grouping: false });
        }

        const panel = K.panel(stage, { questionKey: "research.noise.question", titleKey: "research.noise.title", onChange: refresh });
        const fieldT = panel.field({ name: "T", labelKey: "research.noise.T", kind: "int", min: 2, max: 100000, value: 1000, powers: true });
        panel.choice({
            name: "kind", labelKey: "research.noise.kind", value: "linear",
            options: [{ value: "linear", labelKey: "research.noise.kind.linear" }, { value: "cosine", labelKey: "research.noise.kind.cosine" }]
        });
        const first = panel.field({ name: "beta1", labelKey: "research.noise.beta1", kind: "number", min: 1e-8, max: 0.999, value: 0.0001, hintKey: "research.noise.betaHint" });
        const last = panel.field({ name: "betaT", labelKey: "research.noise.betaT", kind: "number", min: 1e-8, max: 0.999, value: 0.02 });
        const stepField = panel.field({ name: "t", labelKey: "research.noise.t", kind: "int", min: 1, max: 100000, value: 500 });
        const rules = [
            crossRule(stepField, function () {
                const T = fieldT.valid() ? fieldT.value() : NaN;
                return stepField.value() > T ? t("research.noise.err.tLong", { T: num(T) }) : "";
            }),
            crossRule(last, function () {
                if (!fieldT.valid() || !first.valid()) return "";
                const s = schedule("linear", fieldT.value(), first.value(), last.value());
                return s.logs[s.T] < TOO_SMALL ? t("research.noise.err.gone") : "";
            })
        ];

        panel.heading("research.noise.headStep");
        const out = {
            beta: panel.result({ name: "beta", labelKey: "research.noise.beta", digits: 5 }),
            abar: panel.result({ name: "abar", labelKey: "research.noise.abar", digits: 5 }),
            signal: panel.result({ name: "signal", labelKey: "research.noise.signal", digits: 5 }),
            noise: panel.result({ name: "noise", labelKey: "research.noise.noise", digits: 5 }),
            snr: panel.result({ name: "snr", labelKey: "research.noise.snr", digits: 5 }),
            lnSnr: panel.result({ name: "lnSnr", labelKey: "research.noise.lnSnr", digits: 5 }),
            posterior: panel.result({ name: "posterior", labelKey: "research.noise.posterior", digits: 5 }),
            factor: panel.result({ name: "factor", labelKey: "research.noise.factor", digits: 5, hintKey: "research.noise.factorHint" })
        };
        panel.heading("research.noise.headWhole");
        out.first = panel.result({ name: "first", labelKey: "research.noise.first", kind: "text" });
        out.abarT = panel.result({ name: "abarT", labelKey: "research.noise.abarT", digits: 5 });
        out.signalT = panel.result({ name: "signalT", labelKey: "research.noise.signalT", digits: 5 });
        out.lnSnrT = panel.result({ name: "lnSnrT", labelKey: "research.noise.lnSnrT", digits: 5 });
        panel.heading("research.noise.headContinuous");
        out.cont = panel.result({ name: "cont", labelKey: "research.noise.cont", digits: 5 });
        out.contEnd = panel.result({ name: "contEnd", labelKey: "research.noise.contEnd", digits: 5 });
        panel.remark({ key: "research.noise.remark" });
        const scales = panel.chart({ labelKey: "research.noise.chartScales", height: 260, x: { labelKey: "research.noise.axisStep" }, y: { labelKey: "research.noise.axisScale" } }, "below");
        const snrChart = panel.chart({ labelKey: "research.noise.chartSnr", height: 260, x: { labelKey: "research.noise.axisStep" }, y: { labelKey: "research.noise.axisLnSnr" } }, "below");
        panel.formula({ key: "research.noise.formula" });
        panel.source({ nameKey: "research.noise.source", units: UNITS });

        function refresh() {
            rules.forEach(function (check) { check(); });
            const v = panel.values();
            if (!v) return;
            const linear = schedule("linear", v.T, v.beta1, v.betaT);
            const cosine = schedule("cosine", v.T, v.beta1, v.betaT);
            const chosen = v.kind === "cosine" ? cosine : linear;
            const step = v.t;
            const r = at(chosen, step);
            const before = step > 1 ? fromLog(chosen.logs[step - 1]) : null;
            const words = {
                t: String(step), m: String(step - 1), T: String(v.T), beta: w(r.beta), abar: w(r.abar), rest: w(r.rest), signal: w(r.signal), noise: w(r.noise),
                snr: w(r.snr), lnSnr: w(r.lnSnr), posterior: w(r.posterior), factor: w(r.factor), restBefore: before ? w(before.rest) : "0",
                L: w(r.L, 8), beta1: w(v.beta1), betaT: w(v.betaT)
            };
            out.beta.set(r.beta, { formula: t(v.kind === "cosine" ? (r.beta >= CAP ? "research.noise.w.betaCapped" : "research.noise.w.betaCosine") : "research.noise.w.betaLinear", words) });
            out.abar.set(r.abar, { formula: t("research.noise.w.abar", words) });
            out.signal.set(r.signal, { formula: t("research.noise.w.signal", words) });
            out.noise.set(r.noise, { formula: t("research.noise.w.noise", words) });
            out.snr.set(r.snr, { formula: t("research.noise.w.snr", words) });
            out.lnSnr.set(r.lnSnr, { formula: t("research.noise.w.lnSnr", words) });
            out.posterior.set(r.posterior, { formula: t(step === 1 ? "research.noise.w.posteriorOne" : "research.noise.w.posterior", words) });
            out.factor.set(r.factor, { formula: t("research.noise.w.factor", words) });

            const end = at(chosen, v.T);
            if (chosen.first === null) out.first.set(t("research.noise.never"), { formula: t("research.noise.w.never", { T: String(v.T), snr: w(end.snr) }) });
            else {
                const a = at(chosen, chosen.first);
                const b = chosen.first > 1 ? at(chosen, chosen.first - 1) : null;
                out.first.set(num(chosen.first), { formula: b ? t("research.noise.w.first", { n: String(chosen.first), m: String(chosen.first - 1), before: w(b.snr), now: w(a.snr) }) : t("research.noise.w.firstOne", { now: w(a.snr) }) });
            }
            const endWords = { T: String(v.T), abar: w(end.abar), rest: w(end.rest), signal: w(end.signal), lnSnr: w(end.lnSnr), L: w(end.L, 8) };
            out.abarT.set(end.abar, { formula: t(v.kind === "cosine" && chosen.capped ? "research.noise.w.abarTCapped" : "research.noise.w.abarT", endWords) });
            out.signalT.set(end.signal, { formula: t("research.noise.w.signalT", endWords) });
            out.lnSnrT.set(end.lnSnr, { formula: t("research.noise.w.lnSnrT", endWords) });

            const betaMin = v.T * v.beta1;
            const betaMax = v.T * v.betaT;
            const u = step / v.T;
            const cont = Math.exp(continuousLog(u, betaMin, betaMax));
            const discrete = Math.exp(linear.logs[step]);
            out.cont.set(cont, { formula: t("research.noise.w.cont", { u: w(u), min: w(betaMin), max: w(betaMax), cont: w(cont), t: String(step), discrete: w(discrete), rel: w((cont - discrete) / discrete * 100, 3) }) });
            const contEnd = Math.exp(continuousLog(1, betaMin, betaMax));
            out.contEnd.set(contEnd, { formula: t("research.noise.w.contEnd", { min: w(betaMin), max: w(betaMax), cont: w(contEnd), T: String(v.T), discrete: w(Math.exp(linear.logs[v.T])) }) });

            // The verdict: both schedules at step t, then which keeps the signal longer
            const lin = at(linear, step);
            const cos = at(cosine, step);
            const linEnd = at(linear, v.T);
            const parts = verdictParts(linear.first, cosine.first, linEnd.signal);
            const kept = function (share, digits) { return num(share, { percent: true, digits: shareDigits(share, digits) }); };
            let text = t("research.noise.verdict", { t: num(step), T: num(v.T), lin: kept(lin.signal, 2), cos: kept(cos.signal, 2) });
            text += " " + t("research.noise.verdict." + parts.order, { lin: linear.first === null ? "" : num(linear.first), cos: cosine.first === null ? "" : num(cosine.first) });
            if (parts.endWarn) text += " " + t("research.noise.verdict.endWarn", { x: kept(linEnd.signal, 4) });
            panel.verdict.set(text, parts.endWarn ? "warn" : "info");

            drawCharts(v, linear, cosine, betaMin, betaMax);
        }

        function drawCharts(v, linear, cosine, betaMin, betaMax) {
            const steps = chartSteps(v.T);
            const line = function (s, pick) { return steps.map(function (step) { return [step, pick(fromLog(s.logs[step]))]; }); };
            const contLine = function (pick) { return steps.map(function (step) { return [step, pick(fromLog(continuousLog(step / v.T, betaMin, betaMax)))]; }); };
            const signal = function (r) { return r.signal; };
            const noise = function (r) { return r.noise; };
            const lnSnr = function (r) { return r.lnSnr; };
            const mark = [{ x: v.t, label: function () { return t("research.noise.mark", { t: num(v.t) }); } }];
            scales.set({
                x: { labelKey: "research.noise.axisStep", min: 1, max: v.T },
                y: { labelKey: "research.noise.axisScale", min: 0, max: 1 },
                series: [
                    { kind: "line", data: line(linear, signal), colorIndex: 0, width: 2, labelKey: "research.noise.series.linearSignal" },
                    { kind: "line", data: line(linear, noise), colorIndex: 0, width: 1.5, dash: true, labelKey: "research.noise.series.linearNoise" },
                    { kind: "line", data: line(cosine, signal), colorIndex: 1, width: 2, labelKey: "research.noise.series.cosineSignal" },
                    { kind: "line", data: line(cosine, noise), colorIndex: 1, width: 1.5, dash: true, labelKey: "research.noise.series.cosineNoise" },
                    { kind: "line", data: contLine(signal), colorIndex: 2, width: 1.25, dash: true, labelKey: "research.noise.series.continuous" }
                ],
                marks: mark,
                describe: function () {
                    return t("research.noise.describeScales", { T: num(v.T), t: num(v.t), lin: num(at(linear, v.t).signal), cos: num(at(cosine, v.t).signal), linEnd: num(at(linear, v.T).signal), cosEnd: num(at(cosine, v.T).signal) });
                }
            });
            snrChart.set({
                x: { labelKey: "research.noise.axisStep", min: 1, max: v.T },
                y: { labelKey: "research.noise.axisLnSnr" },
                series: [
                    { kind: "line", data: line(linear, lnSnr), colorIndex: 0, width: 2, labelKey: "research.noise.series.linear" },
                    { kind: "line", data: line(cosine, lnSnr), colorIndex: 1, width: 2, labelKey: "research.noise.series.cosine" },
                    { kind: "line", data: contLine(lnSnr), colorIndex: 2, width: 1.25, dash: true, labelKey: "research.noise.series.continuous" }
                ],
                hlines: [{ y: 0, color: "muted", dash: true, labelKey: "research.noise.hline" }],
                marks: mark,
                describe: function () {
                    return t("research.noise.describeSnr", {
                        T: num(v.T), lin: linear.first === null ? t("research.noise.never") : num(linear.first), cos: cosine.first === null ? t("research.noise.never") : num(cosine.first),
                        linEnd: num(at(linear, v.T).lnSnr), cosEnd: num(at(cosine, v.T).lnSnr)
                    });
                }
            });
        }

        refresh();
        return K.controller(refresh);
    }

    A.research.define("noise", { create: create, maths: maths });
})();
