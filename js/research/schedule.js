/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "schedule": LEARNING-RATE SCHEDULE DESIGNER
   A schedule over steps t = 1 … T: a linear warm-up to η_max over W steps,
   then one of seven shapes (constant, linear, cosine, inverse square root,
   exponential, steps, polynomial). For one schedule, or two (A and B):
     - the rate at a chosen step and at the last step
     - the sum of all rates Σ η_t (the "budget") and their mean
     - the first step after the warm-up at which the rate is below a value
     - a chart of the rate against the step (linear or logarithmic axis)
     - a table of the rate at evenly spaced steps, with "Copy table"
   Texts: js/content/research/schedule.js. Styles: css/research/schedule.css.
   The functions of section 1 are pure and are given to the tests as
   spec.maths (dev/tests/research.schedule.math.js).
    1. The numbers (pure)
    2. The verdict (pure)
    3. Two helpers for the page: a rule a field's limits cannot say, a field
       used only in one mode
    4. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["r3", "t2"];
    const SHAPES = ["constant", "linear", "cosine", "invsqrt", "exponential", "steps", "polynomial"];
    const WITH_U = { linear: true, cosine: true, exponential: true, polynomial: true };   // shapes written with the progress u
    const ALL_POINTS = 4000;            // up to this many steps the chart draws every step
    const SAMPLES = 2000;               // otherwise this many evenly spaced steps (plus every corner)
    const SAME = 0.001;                 // two budgets within 0.1% are "the same"

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       A schedule s = { T, W, max, min, shape, gamma, k, p }.
       ========================================================= */
    // The rate at step t (1 ≤ t ≤ T)
    function rate(s, step) {
        if (s.W > 0 && step <= s.W) return s.max * step / s.W;
        const u = (step - s.W) / (s.T - s.W);
        switch (s.shape) {
            case "constant": return s.max;
            case "linear": return s.max + (s.min - s.max) * u;
            case "cosine": return s.min + 0.5 * (s.max - s.min) * (1 + Math.cos(Math.PI * u));
            case "invsqrt": return s.max * Math.sqrt(s.W / step);
            case "exponential": return s.max * Math.pow(s.min / s.max, u);
            case "steps": return s.max * Math.pow(s.gamma, Math.floor((step - s.W) / s.k));
            case "polynomial": return s.min + (s.max - s.min) * Math.pow(1 - u, s.p);
            default: return NaN;
        }
    }

    // The rate a shape starts from, for the sentence "… from 0.0003 to 0": η_max when there is
    // a warm-up (the rate is η_max at t = W). With no warm-up no step has η_max itself: step 1
    // is already at u = 1/T (or after the first drop, when k = 1), so it is the rate of step 1
    // (T = 2, cosine from 0.0003 to 0: the two rates are 0.00015 and 0).
    function startRate(s) {
        return s.W >= 1 ? s.max : rate(s, 1);
    }

    // The progress u after the warm-up, and the exponent of the steps shape, at step t
    function progress(s, step) {
        return (step - s.W) / (s.T - s.W);
    }

    function stepsDone(s, step) {
        return Math.floor((step - s.W) / s.k);
    }

    // The whole run in one pass: the sum of all rates (Neumaier's compensated sum, so a
    // million small numbers keep their digits), the mean, the rate at a step, at the end,
    // and the first step after the warm-up whose rate is below "below" (null: never).
    // After the warm-up every shape is non-increasing (γ ≤ 1, η_min ≤ η_max), so from that
    // step on the rate stays below the value.
    // A pass over 10⁷ steps takes about a quarter of a second, so the sum of a schedule and
    // its first step below a value are kept for the last few schedules: a change of another
    // field (the step to read, the rows of the table, the second schedule) does not walk the
    // whole run again. The numbers are the same as without the memory.
    const memory = { sums: [], firsts: [] };
    const MEMORY_SIZE = 8;

    function remember(list, key, compute) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].key === key) return list[i].value;
        }
        const value = compute();
        list.push({ key: key, value: value });
        if (list.length > MEMORY_SIZE) list.shift();
        return value;
    }

    function scheduleKey(s) {
        return [s.T, s.W, s.max, s.min, s.shape, s.gamma, s.k, s.p].join("|");
    }

    function run(s, at, below) {
        const key = scheduleKey(s);
        const total = remember(memory.sums, key, function () {
            let sum = 0;
            let fix = 0;
            for (let step = 1; step <= s.T; step++) {
                const value = rate(s, step);
                const next = sum + value;
                fix += Math.abs(sum) >= Math.abs(value) ? (sum - next) + value : (value - next) + sum;
                sum = next;
            }
            return sum + fix;
        });
        // "below" is strict; a rate equal to it up to rounding (1/√t: 0.0003·√(1000/9000) is
        // 9.999999999999999×10⁻⁵ on a computer, exactly 10⁻⁴ in truth) is not below it
        const first = remember(memory.firsts, key + "|" + below, function () {
            const limit = below * (1 - 1e-12);
            for (let step = Math.max(1, Math.floor(s.W) + 1); step <= s.T; step++) {
                if (rate(s, step) < limit) return step;
            }
            return null;
        });
        return { sum: total, mean: total / s.T, at: rate(s, Math.min(at, s.T)), end: rate(s, s.T), first: first };
    }

    // The steps of the table: about "rows" evenly spaced steps from 1 to T,
    // t_k = round(k·T/(rows − 1)) for k = 0 … rows − 1 (t_0 = 1), in whole numbers only,
    // without repeats; every step when rows ≥ T
    function tableSteps(T, rows) {
        if (rows >= T) {
            const all = [];
            for (let step = 1; step <= T; step++) all.push(step);
            return all;
        }
        const list = [];
        for (let k = 0; k < rows; k++) {
            const step = Math.max(1, Math.floor((2 * k * T + (rows - 1)) / (2 * (rows - 1))));
            if (list[list.length - 1] !== step) list.push(step);
        }
        return list;
    }

    // The points of the chart: every step up to ALL_POINTS steps; otherwise SAMPLES evenly
    // spaced steps plus the corners (the end of the warm-up, and both sides of every
    // drop of the steps shape when there are at most 500 drops)
    function points(s) {
        const chosen = {};
        if (s.T <= ALL_POINTS) {
            for (let step = 1; step <= s.T; step++) chosen[step] = true;
        } else {
            for (let i = 0; i <= SAMPLES; i++) chosen[1 + Math.round(i * (s.T - 1) / SAMPLES)] = true;
            if (s.W >= 1) {
                chosen[s.W] = true;
                if (s.W < s.T) chosen[s.W + 1] = true;
            }
            if (s.shape === "steps" && (s.T - s.W) / s.k <= 500) {
                for (let drop = s.W + s.k; drop <= s.T; drop += s.k) {
                    chosen[drop] = true;
                    chosen[drop - 1] = true;
                }
            }
        }
        return Object.keys(chosen).map(Number).sort(function (a, b) { return a - b; }).map(function (step) { return [step, rate(s, step)]; });
    }

    /* =========================================================
       2. THE VERDICT (pure)
         start: "warm" (a warm-up, then the shape), "cold" (no warm-up), "allWarm" (W = T)
         compare: B against A by their sums: "more", "less", or "same" within 0.1%
       ========================================================= */
    function verdictParts(s, sumA, sumB) {
        let start = "warm";
        if (s.W === 0) start = "cold";
        else if (s.W >= s.T) start = "allWarm";
        let compare = "";
        if (isFinite(sumB)) {
            const rel = (sumB - sumA) / sumA;
            if (Math.abs(rel) <= SAME) compare = "same";
            else compare = rel > 0 ? "more" : "less";
        }
        return { start: start, compare: compare };
    }

    const maths = {
        rate: rate, startRate: startRate, progress: progress, run: run, tableSteps: tableSteps, points: points,
        verdictParts: verdictParts, SHAPES: SHAPES
    };

    /* =========================================================
       3. TWO HELPERS FOR THE PAGE
       (candidates for the bench kit: see the final notes of task T2)
       ========================================================= */
    // A rule that a field's limits cannot say: see js/research/sizer.js, section 3
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

    // A field used only in one mode: see js/research/compute.js, section 3
    function onlyWhen(item, isShown) {
        const ownValid = item.valid;
        const ownDisplay = item.display;
        item.valid = function () { return !isShown() || ownValid(); };
        item.display = function () { return isShown() ? ownDisplay() : t("research.schedule.unused"); };
        return function apply() { A.dom.setHidden(item.element, !isShown()); };
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

        const panel = K.panel(stage, { questionKey: "research.schedule.question", titleKey: "research.schedule.title", onChange: refresh });
        const shapeOptions = SHAPES.map(function (id) { return { value: id, labelKey: "research.schedule.shape." + id }; });

        // ----- Inputs: the run, schedule A, schedule B, what to show -----
        const fieldT = panel.field({ name: "T", labelKey: "research.schedule.T", kind: "int", min: 2, max: 1e7, value: 10000, powers: true });
        const rules = [];
        const modes = [];
        // The fields of one schedule; suffix "" for A, "2" for B
        function scheduleFields(suffix, defaults, isOn) {
            const key = function (name) { return "research.schedule." + name + (suffix ? "B" : ""); };
            const f = {};
            f.W = panel.field({ name: "W" + suffix, labelKey: key("W"), kind: "int", min: 0, max: 1e7, value: defaults.W, powers: true });
            f.max = panel.field({ name: "max" + suffix, labelKey: key("max"), kind: "number", min: 0, minOpen: true, max: 10, value: defaults.max });
            f.min = panel.field({ name: "min" + suffix, labelKey: key("min"), kind: "number", min: 0, max: 10, value: defaults.min });
            f.shape = panel.choice({ name: "shape" + suffix, labelKey: key("shape"), value: defaults.shape, options: shapeOptions });
            f.shape.element.classList.add("rs-schedule-shapes");
            f.gamma = panel.field({ name: "gamma" + suffix, labelKey: key("gamma"), kind: "number", min: 0, minOpen: true, max: 1, value: 0.5 });
            f.k = panel.field({ name: "k" + suffix, labelKey: key("k"), kind: "int", min: 1, max: 1e7, value: 1000, powers: true });
            f.p = panel.field({ name: "p" + suffix, labelKey: key("p"), kind: "number", min: 0, minOpen: true, max: 100, value: 2 });
            const shape = function () { return f.shape.value(); };
            const read = function (item) { return item.valid() ? item.value() : NaN; };
            rules.push(crossRule(f.W, function () {
                if (!isOn()) return "";
                const T = read(fieldT);
                if (f.W.value() > T) return t("research.schedule.err.warmLong", { T: num(T) });
                if (shape() === "invsqrt" && f.W.value() < 1) return t("research.schedule.err.sqrtWarm");
                return "";
            }));
            rules.push(crossRule(f.min, function () {
                if (!isOn()) return "";
                const top = read(f.max);
                if (f.min.value() > top) return t("research.schedule.err.minHigh", { max: num(top, { digits: 12 }) });
                if (shape() === "exponential" && !(f.min.value() > 0)) return t("research.schedule.err.expZero");
                return "";
            }));
            modes.push(onlyWhen(f.W, isOn), onlyWhen(f.max, isOn), onlyWhen(f.min, isOn), onlyWhen(f.shape, isOn),
                onlyWhen(f.gamma, function () { return isOn() && shape() === "steps"; }),
                onlyWhen(f.k, function () { return isOn() && shape() === "steps"; }),
                onlyWhen(f.p, function () { return isOn() && shape() === "polynomial"; }));
            return f;
        }
        const always = function () { return true; };
        scheduleFields("", { W: 1000, max: 0.0003, min: 0, shape: "cosine" }, always);
        const compare = panel.toggle({ name: "compare", labelKey: "research.schedule.compare", checked: false });
        const bOn = function () { return compare.value(); };
        scheduleFields("2", { W: 1000, max: 0.0003, min: 0, shape: "linear" }, bOn);
        const atField = panel.field({ name: "at", labelKey: "research.schedule.at", kind: "int", min: 1, max: 1e7, value: 5500, powers: true });
        rules.push(crossRule(atField, function () {
            const T = fieldT.valid() ? fieldT.value() : NaN;
            return atField.value() > T ? t("research.schedule.err.atLong", { T: num(T) }) : "";
        }));
        panel.field({ name: "below", labelKey: "research.schedule.below", kind: "number", min: 0, minOpen: true, max: 10, value: 0.0001, hintKey: "research.schedule.belowHint" });
        panel.choice({
            name: "axis", labelKey: "research.schedule.axis", value: "linear",
            options: [{ value: "linear", labelKey: "research.schedule.axis.linear" }, { value: "log", labelKey: "research.schedule.axis.log" }]
        });
        panel.field({ name: "rows", labelKey: "research.schedule.rows", kind: "int", min: 2, max: 1001, value: 11 });

        // ----- Results -----
        let atStep = 1;
        function scheduleResults(suffix) {
            const r = {};
            r.head = panel.heading(suffix ? "research.schedule.headB" : "research.schedule.headA");
            r.formula = panel.result({ name: "formula" + suffix, labelKey: "research.schedule.formulaRow", kind: "text" });
            r.at = panel.result({ name: "at" + suffix, labelKey: "research.schedule.atResult", digits: 5 });
            r.end = panel.result({ name: "end" + suffix, labelKey: "research.schedule.end", digits: 5 });
            r.sum = panel.result({ name: "sum" + suffix, labelKey: "research.schedule.sum", digits: 7 });
            r.mean = panel.result({ name: "mean" + suffix, labelKey: "research.schedule.mean", digits: 5 });
            r.first = panel.result({ name: "first" + suffix, labelKey: "research.schedule.first", kind: "text" });
            return r;
        }
        const ra = scheduleResults("");
        const rb = scheduleResults("2");
        rb.diff = panel.result({ name: "diff", labelKey: "research.schedule.diff", kind: "percent", digits: 4 });
        panel.remark({ key: "research.schedule.remark" });
        const chart = panel.chart({ labelKey: "research.schedule.chart", height: 280, x: { labelKey: "research.schedule.axisStep" }, y: { labelKey: "research.schedule.axisRate" } }, "below");

        // The table of rates at evenly spaced steps, and "Copy table"
        const tableBox = document.createElement("div");
        tableBox.className = "rs-schedule-table";
        panel.below.appendChild(tableBox);
        const tableOne = K.table(tableBox, { captionKey: "research.schedule.tableCaption", columns: [{ labelKey: "research.schedule.col.step", numeric: true }, { labelKey: "research.schedule.col.rate", numeric: true }] });
        const tableTwo = K.table(tableBox, { captionKey: "research.schedule.tableCaption", columns: [{ labelKey: "research.schedule.col.step", numeric: true }, { labelKey: "research.schedule.col.rateA", numeric: true }, { labelKey: "research.schedule.col.rateB", numeric: true }] });
        const tableActions = document.createElement("div");
        tableActions.className = "rs-schedule-table-actions";
        const copyTable = A.labKit.button("research.schedule.copyTable", { variant: "ghost", size: "sm", onClick: copyTableNow });
        copyTable.element.classList.add("rs-schedule-copy");
        const tableStatus = document.createElement("p");
        tableStatus.className = "rk-action-msg rs-schedule-status";
        tableStatus.setAttribute("role", "status");
        tableActions.append(copyTable.element, tableStatus);
        tableBox.appendChild(tableActions);
        panel.formula({ key: "research.schedule.formula" });
        panel.source({ nameKey: "research.schedule.source", units: UNITS });

        let current = null;          // the schedules and runs now on the screen, for the table copy

        // The schedule of A or B from the panel's values
        function scheduleOf(v, suffix) {
            return { T: v.T, W: v["W" + suffix], max: v["max" + suffix], min: v["min" + suffix], shape: v["shape" + suffix], gamma: v["gamma" + suffix], k: v["k" + suffix], p: v["p" + suffix] };
        }

        // The expression of the shape, with symbols (t, u) or with the numbers of one step
        function expression(s, step) {
            const symbolic = step === undefined;
            const values = {
                max: w(s.max), min: w(s.min), W: String(s.W), gamma: w(s.gamma), k: String(s.k), p: w(s.p),
                t: symbolic ? "t" : String(step),
                u: symbolic ? "u" : w(progress(s, step)),
                j: symbolic ? t("research.schedule.e.floor", { W: String(s.W), k: String(s.k) }) : String(stepsDone(s, step))
            };
            return t("research.schedule.e." + s.shape, values);
        }

        // "t ≤ 1000: η = 0.0003·t/1000; t > 1000: η = …; u = (t − 1000)/9000"
        function formulaText(s) {
            const parts = [];
            if (s.W >= s.T) return t("research.schedule.f.warm", { W: String(s.W), max: w(s.max) });
            if (s.W > 0) parts.push(t("research.schedule.f.warm", { W: String(s.W), max: w(s.max) }));
            parts.push(t(s.W > 0 ? "research.schedule.f.after" : "research.schedule.f.all", { W: String(s.W), expr: expression(s) }));
            if (WITH_U[s.shape]) parts.push(t("research.schedule.f.u", { W: String(s.W), span: String(s.T - s.W) }));
            return parts.join("; ");
        }

        // The worked rate at one step
        function workedAt(s, step) {
            const value = rate(s, step);
            if (s.W > 0 && step <= s.W) return t("research.schedule.w.warm", { max: w(s.max), t: String(step), W: String(s.W), value: w(value) });
            if (WITH_U[s.shape]) {
                return t("research.schedule.w.withU", { t: String(step), W: String(s.W), span: String(s.T - s.W), u: w(progress(s, step)), expr: expression(s, step), value: w(value) });
            }
            return t("research.schedule.w.plain", { t: String(step), expr: expression(s, step), value: w(value) });
        }

        function workedFirst(s, r, below) {
            if (r.first === null) return t("research.schedule.w.never", { x: w(below), T: String(s.T), end: w(r.end), W: String(s.W) });
            if (r.first === 1) return t("research.schedule.w.firstAtOne", { x: w(below), now: w(rate(s, 1)) });
            return t("research.schedule.w.first", { x: w(below), W: String(s.W), n: String(r.first), m: String(r.first - 1), before: w(rate(s, r.first - 1)), now: w(rate(s, r.first)) });
        }

        function describeShape(s, r) {
            return t("research.schedule.d." + s.shape, { max: num(startRate(s)), min: num(s.min), end: num(r.end), gamma: num(s.gamma, { digits: 12 }), k: num(s.k), p: num(s.p, { digits: 12 }) });
        }

        function fill(rows, s, r, below) {
            // the shape as the value, the whole formula as its worked line (it is too long for a value)
            rows.formula.set(t("research.schedule.shape." + s.shape), { formula: formulaText(s) });
            rows.at.set(r.at, { formula: workedAt(s, atStep) });
            rows.end.set(r.end, { formula: workedAt(s, s.T) });
            rows.sum.set(r.sum, { formula: t("research.schedule.w.sum", { T: String(s.T), sum: w(r.sum, 10) }) });
            rows.mean.set(r.mean, { formula: t("research.schedule.w.mean", { T: String(s.T), sum: w(r.sum, 10), mean: w(r.mean) }) });
            rows.first.set(r.first === null ? t("research.schedule.never") : num(r.first), { formula: workedFirst(s, r, below) });
        }

        function refresh() {
            modes.forEach(function (apply) { apply(); });
            rules.forEach(function (check) { check(); });
            const on = bOn();
            [rb.head].forEach(function (head) { A.dom.setHidden(head, !on); });
            ["formula", "at", "end", "sum", "mean", "first"].forEach(function (name) { rb[name].hidden(!on); });
            rb.diff.hidden(!on);
            A.dom.setHidden(tableOne.element, on);
            A.dom.setHidden(tableTwo.element, !on);
            A.dom.setText(tableStatus, "");
            const v = panel.values();
            if (!v) {
                current = null;
                tableOne.set([]);
                tableTwo.set([]);
                return;
            }
            atStep = v.at;
            const sa = scheduleOf(v, "");
            const runA = run(sa, v.at, v.below);
            fill(ra, sa, runA, v.below);
            let sb = null;
            let runB = null;
            if (on) {
                sb = scheduleOf(v, "2");
                runB = run(sb, v.at, v.below);
                fill(rb, sb, runB, v.below);
                rb.diff.set((runB.sum - runA.sum) / runA.sum, { formula: t("research.schedule.w.diff", { a: w(runA.sum, 10), b: w(runB.sum, 10), rel: w((runB.sum - runA.sum) / runA.sum * 100, 4) }) });
            } else {
                ["formula", "at", "end", "sum", "mean", "first"].forEach(function (name) { rb[name].clear(); });
                rb.diff.clear();
            }
            current = { a: sa, b: sb };

            // The verdict
            const parts = verdictParts(sa, runA.sum, on ? runB.sum : NaN);
            // (a warm-up of T − 1 steps is not "100% of the run": the share gets the digits it needs)
            let shareDigits = 4;
            while (shareDigits < 15 && sa.W < sa.T && Number((sa.W / sa.T * 100).toPrecision(shareDigits)) >= 100) shareDigits += 1;
            const said = { share: num(sa.W / sa.T, { percent: true, digits: shareDigits }), W: num(sa.W), max: num(sa.max), mean: num(runA.mean), shape: describeShape(sa, runA) };
            let text = t("research.schedule.verdict." + parts.start, said);
            if (parts.compare) {
                text += " " + t("research.schedule.verdict." + parts.compare, {
                    rel: num(Math.abs(runB.sum - runA.sum) / runA.sum, { percent: true }), a: num(runA.sum), b: num(runB.sum)
                });
            }
            panel.verdict.set(text, "info");

            // The table
            const steps = tableSteps(v.T, v.rows);
            if (on) tableTwo.set(steps.map(function (step) { return [num(step), { value: rate(sa, step), digits: 6 }, { value: rate(sb, step), digits: 6 }]; }));
            else tableOne.set(steps.map(function (step) { return [num(step), { value: rate(sa, step), digits: 6 }]; }));

            drawChart(v, sa, sb, runA, runB);
        }

        function drawChart(v, sa, sb, runA, runB) {
            const log = v.axis === "log";
            const series = [{ kind: "line", data: points(sa), colorIndex: 0, width: 2, label: function () { return t("research.schedule.series", { s: "A", shape: t("research.schedule.shape." + sa.shape) }); } }];
            if (sb) series.push({ kind: "line", data: points(sb), colorIndex: 1, width: 2, dash: true, label: function () { return t("research.schedule.series", { s: "B", shape: t("research.schedule.shape." + sb.shape) }); } });
            const peak = Math.max(sa.max, sb ? sb.max : 0);
            chart.set({
                x: { labelKey: "research.schedule.axisStep", min: 1, max: v.T },
                y: { labelKey: "research.schedule.axisRate", log: log, min: log ? undefined : 0 },
                series: series,
                marks: [{ x: v.at, label: function () { return t("research.schedule.mark", { t: num(v.at) }); } }],
                hlines: v.below <= peak ? [{ y: v.below, color: "muted", dash: true, label: function () { return t("research.schedule.hline", { x: num(v.below) }); } }] : [],
                describe: function () {
                    let text = t("research.schedule.describe", { T: num(v.T), s: "A", shape: describeShape(sa, runA), mean: num(runA.mean), at: num(runA.at), t: num(v.at) });
                    if (sb) text += " " + t("research.schedule.describe", { T: num(v.T), s: "B", shape: describeShape(sb, runB), mean: num(runB.mean), at: num(runB.at), t: num(v.at) });
                    return text;
                }
            });
        }

        // A number for a spreadsheet: 10 significant digits, no groups, no superscripts
        // (3e-7, not 3×10⁻⁷), with the decimal mark of the language
        function plain(value) {
            const mark = num(1.5).charAt(1);
            return String(Number(value.toPrecision(10))).replace(".", mark);
        }

        // "Copy table": step and rate(s), separated by tabs, ready for a spreadsheet
        function copyTableNow() {
            if (!current) {
                A.dom.setText(tableStatus, t("research.kit.noResult"));
                return;
            }
            const two = Boolean(current.b);
            const head = two ? [t("research.schedule.col.step"), t("research.schedule.col.rateA"), t("research.schedule.col.rateB")] : [t("research.schedule.col.step"), t("research.schedule.col.rate")];
            const steps = tableSteps(current.a.T, panel.values().rows);
            const lines = [head.join("\t")].concat(steps.map(function (step) {
                const cells = [String(step), plain(rate(current.a, step))];
                if (two) cells.push(plain(rate(current.b, step)));
                return cells.join("\t");
            }));
            lines.push("", "A: " + formulaText(current.a));
            if (two) lines.push("B: " + formulaText(current.b));
            const text = lines.join("\n");
            const done = function () {
                A.dom.setText(tableStatus, t("research.schedule.tableCopied", { n: String(steps.length) }));
                ctx.announce(t("research.schedule.tableCopied", { n: String(steps.length) }));
            };
            const failed = function () { A.dom.setText(tableStatus, t("research.schedule.tableFailed")); };
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") navigator.clipboard.writeText(text).then(done, failed);
            else failed();
        }

        refresh();
        return K.controller(refresh);
    }

    A.research.define("schedule", { create: create, maths: maths });
})();
