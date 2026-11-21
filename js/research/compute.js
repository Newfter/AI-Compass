/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "compute": TRAINING COMPUTE PLANNER
   From the size of a model N and its training tokens D (or steps × batch ×
   sequence length) and the hardware (peak speed, the share of it reached,
   the number of accelerators, their power, the building's overhead):
     - the training cost C ≈ 6·N·D (a rule of thumb for dense transformers)
     - the time on one accelerator and on all of them, accelerator-hours
     - the energy in kWh
     - tokens per parameter D/N, and an upper estimate of generation speed
   Texts: js/content/research/compute.js. The functions of section 1 are pure
   and are given to the tests as spec.maths (dev/tests/research.compute.math.js).
    1. The numbers (pure)
    2. The verdict (pure)
    3. A helper for the page: a field used only in one mode
    4. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["r2", "r1"];
    const MINUTE = 60;
    const HOUR = 3600;
    const DAY = 86400;
    const YEAR = 365.25 * DAY;          // a Julian year: the one astronomers use
    // Readable time units (texts: research.compute.time.<id>): the unit is the largest one
    // that keeps the number at or above the first value of the next line
    const TIME_UNITS = [["s", 1, 2 * MINUTE], ["min", MINUTE, 2 * HOUR], ["h", HOUR, 3 * DAY], ["d", DAY, 2 * YEAR], ["y", YEAR, Infinity]];

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       ========================================================= */
    // The training tokens from steps × batch (sequences) × sequence length (tokens)
    function tokensFrom(steps, batch, length) {
        return steps * batch * length;
    }

    // Everything at once. s = { N, D, speed (FLOP/s), utilisation (0..1), count, power (W), overhead }
    function plan(s) {
        const cost = 6 * s.N * s.D;                        // FLOP
        const effective = s.speed * s.utilisation;         // FLOP/s that one accelerator really does
        const secondsOne = cost / effective;               // on one accelerator
        const seconds = secondsOne / s.count;              // wall-clock time on all of them
        const acceleratorHours = seconds / HOUR * s.count;
        const energy = s.power * s.count * (seconds / HOUR) * s.overhead / 1000;      // kWh
        return {
            cost: cost,
            effective: effective,
            secondsOne: secondsOne,
            seconds: seconds,
            acceleratorHours: acceleratorHours,
            energy: energy,
            perParameter: s.D / s.N,
            serving: effective / (2 * s.N)                 // tokens per second, at most
        };
    }

    // A time in the most readable unit -> { value, unit }: seconds below 2 minutes, minutes
    // below 2 hours, hours below 3 days, days below 2 years, then years
    function timeIn(seconds) {
        for (let i = 0; i < TIME_UNITS.length; i++) {
            if (seconds < TIME_UNITS[i][2]) return { value: seconds / TIME_UNITS[i][1], unit: TIME_UNITS[i][0] };
        }
        return { value: seconds / YEAR, unit: "y" };
    }

    /* =========================================================
       2. THE VERDICT (pure): "short" under a minute of wall-clock time,
       "long" over a year, "normal" between
       ========================================================= */
    function verdictCase(seconds) {
        if (seconds < MINUTE) return "short";
        if (seconds > YEAR) return "long";
        return "normal";
    }

    const maths = { tokensFrom: tokensFrom, plan: plan, timeIn: timeIn, verdictCase: verdictCase, YEAR: YEAR };

    /* =========================================================
       3. A FIELD USED ONLY IN ONE MODE
       (a candidate for the bench kit: see the final notes of task T2)
       While it is hidden, it cannot block the results, and "Copy result" and the
       notebook say "not used" instead of its number. apply() shows or hides it.
       ========================================================= */
    function onlyWhen(item, isShown) {
        const ownValid = item.valid;
        const ownDisplay = item.display;
        item.valid = function () { return !isShown() || ownValid(); };
        item.display = function () { return isShown() ? ownDisplay() : t("research.compute.unused"); };
        return function apply() { A.dom.setHidden(item.element, !isShown()); };
    }

    /* =========================================================
       4. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(ctx);
        const num = kit.num;

        // A number in a worked formula: big and small ones as a power of ten, no groups
        function w(value, digits) {
            const size = Math.abs(value);
            if (size >= 1e6 && isFinite(size)) {
                let power = Math.floor(Math.log10(size));
                let mantissa = Number((value / Math.pow(10, power)).toPrecision(digits || 6));
                if (Math.abs(mantissa) >= 10) {
                    mantissa /= 10;
                    power += 1;
                }
                return (mantissa === 1 ? "" : num(mantissa, { digits: digits || 6, grouping: false }) + "×") + "10" + kit.superscript(power);
            }
            return num(value, { digits: digits || 6, grouping: false });
        }
        function timeText(seconds) {
            const r = timeIn(seconds);
            return num(r.value) + " " + t("research.compute.time." + r.unit);
        }

        const panel = K.panel(stage, { questionKey: "research.compute.question", titleKey: "research.compute.title", onChange: refresh });
        panel.field({ name: "N", labelKey: "research.compute.N", kind: "number", min: 0, minOpen: true, max: 1e20, value: 1e9, powers: true, hintKey: "research.compute.NHint" });
        const mode = panel.choice({
            name: "mode", labelKey: "research.compute.mode", value: "tokens",
            options: [{ value: "tokens", labelKey: "research.compute.mode.tokens" }, { value: "steps", labelKey: "research.compute.mode.steps" }]
        });
        const byTokens = function () { return mode.value() === "tokens"; };
        const bySteps = function () { return mode.value() === "steps"; };
        const modeFields = [
            onlyWhen(panel.field({ name: "D", labelKey: "research.compute.D", kind: "number", min: 0, minOpen: true, max: 1e20, value: 2e10, powers: true }), byTokens),
            onlyWhen(panel.field({ name: "steps", labelKey: "research.compute.steps", kind: "int", min: 1, max: 1e12, value: 10000, powers: true }), bySteps),
            onlyWhen(panel.field({ name: "batch", labelKey: "research.compute.batch", kind: "int", min: 1, max: 1e9, value: 500, powers: true }), bySteps),
            onlyWhen(panel.field({ name: "length", labelKey: "research.compute.length", kind: "int", min: 1, max: 1e9, value: 4000, powers: true }), bySteps)
        ];
        panel.field({ name: "speed", labelKey: "research.compute.speed", kind: "number", min: 0, minOpen: true, max: 1e25, value: 3e14, powers: true, unitKey: "research.compute.unit.flops", hintKey: "research.compute.speedHint" });
        panel.field({ name: "utilisation", labelKey: "research.compute.utilisation", kind: "percent", min: 0, minOpen: true, max: 100, value: 40, hintKey: "research.compute.utilisationHint" });
        panel.field({ name: "count", labelKey: "research.compute.count", kind: "int", min: 1, max: 1e9, value: 8, powers: true });
        panel.field({ name: "power", labelKey: "research.compute.power", kind: "number", min: 0, minOpen: true, max: 1e6, value: 400, unitKey: "research.compute.unit.watts" });
        panel.field({ name: "overhead", labelKey: "research.compute.overhead", kind: "number", min: 1, max: 10, value: 1.2, hintKey: "research.compute.overheadHint" });

        let tokensNow = 0;            // the plural of "tokens" follows the number
        const out = {
            tokens: panel.result({ name: "tokens", labelKey: "research.compute.tokens", unitKey: function () { return A.plural("research.compute.unit.tokens", tokensNow); } }),
            cost: panel.result({ name: "cost", labelKey: "research.compute.cost", unitKey: "research.compute.unit.flop", hintKey: "research.compute.costHint" }),
            // (a text row: the kit writes whole numbers below 10¹⁵ in full, 120,000,000,000,000)
            effective: panel.result({ name: "effective", labelKey: "research.compute.effective", kind: "text", unitKey: "research.compute.unit.flops" })
        };
        let unitOne = "s";
        let unitWall = "s";
        out.one = panel.result({ name: "one", labelKey: "research.compute.one", unitKey: function () { return t("research.compute.time." + unitOne); } });
        out.wall = panel.result({ name: "wall", labelKey: "research.compute.wall", unitKey: function () { return t("research.compute.time." + unitWall); } });
        out.hours = panel.result({ name: "hours", labelKey: "research.compute.hours", unitKey: "research.compute.unit.acceleratorHours" });
        out.energy = panel.result({ name: "energy", labelKey: "research.compute.energy", unitKey: "research.compute.unit.kwh" });
        out.perParameter = panel.result({ name: "perParameter", labelKey: "research.compute.perParameter", hintKey: "research.compute.perParameterHint" });
        out.serving = panel.result({ name: "serving", labelKey: "research.compute.serving", unitKey: "research.compute.unit.tokensPerSecond", hintKey: "research.compute.servingHint" });
        panel.remark({ key: "research.compute.remark" });
        panel.formula({ key: "research.compute.formula" });
        panel.source({ nameKey: "research.compute.source", units: UNITS });

        function refresh() {
            modeFields.forEach(function (apply) { apply(); });
            const v = panel.values();
            if (!v) return;
            const steps = bySteps();
            const D = steps ? tokensFrom(v.steps, v.batch, v.length) : v.D;
            const s = { N: v.N, D: D, speed: v.speed, utilisation: v.utilisation, count: v.count, power: v.power, overhead: v.overhead };
            const r = plan(s);
            const words = {
                N: w(v.N), D: w(D), speed: w(v.speed), u: w(v.utilisation), k: String(v.count), power: w(v.power), overhead: w(v.overhead),
                C: w(r.cost), eff: w(r.effective), secondsOne: w(r.secondsOne), seconds: w(r.seconds),
                one: timeText(r.secondsOne), wall: timeText(r.seconds), hoursWall: w(r.seconds / HOUR), hours: w(r.acceleratorHours),
                energy: w(r.energy), ratio: w(r.perParameter), serving: w(r.serving)
            };
            out.tokens.hidden(!steps);
            tokensNow = D;
            if (steps) out.tokens.set(D, { formula: t("research.compute.tokensWork", { steps: String(v.steps), batch: String(v.batch), length: String(v.length), D: w(D) }) });
            else out.tokens.clear();
            out.cost.set(r.cost, { formula: t("research.compute.costWork", words) });
            out.effective.set(w(r.effective, 4), { formula: t("research.compute.effectiveWork", words) });
            const one = timeIn(r.secondsOne);
            unitOne = one.unit;
            out.one.set(one.value, { formula: t("research.compute.oneWork", words) });
            const wall = timeIn(r.seconds);
            unitWall = wall.unit;
            out.wall.set(wall.value, { formula: t("research.compute.wallWork", words) });
            out.hours.set(r.acceleratorHours, { formula: t("research.compute.hoursWork", words) });
            out.energy.set(r.energy, { formula: t("research.compute.energyWork", words) });
            out.perParameter.set(r.perParameter, { formula: t("research.compute.perParameterWork", words) });
            out.serving.set(r.serving, { formula: t("research.compute.servingWork", words) });

            const said = { wall: timeText(r.seconds), one: timeText(r.secondsOne), hours: num(r.acceleratorHours), energy: num(r.energy), ratio: num(r.perParameter) };
            let text = A.plural("research.compute.verdict", v.count, said);
            const kind = verdictCase(r.seconds);
            if (kind === "short") text += " " + t("research.compute.verdictShort");
            if (kind === "long") text += " " + t("research.compute.verdictLong");
            panel.verdict.set(text, kind === "normal" ? "info" : "warn");
        }

        refresh();
        return K.controller(refresh);
    }

    A.research.define("compute", { create: create, maths: maths });
})();
