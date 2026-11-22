/* =========================================================
   AI COMPASS — THE BENCH KIT (AICompass.researchKit, called "kit" in tools)
   The parts that every tool of the Research lab's bench is built from, so
   that sixteen tools look and behave like one instrument: number fields,
   lists of pasted numbers, result rows, the plain-words verdict, the
   formula, the source, one chart function, long computations in slices,
   the standard layout with "Copy result" and "Add to notebook".
   js/research.js loads it (after the lab kit, js/lab/kit.js, and the maths,
   js/research/math.js) before the first tool opens. Its texts are in
   js/content/research.js (section 5). The tools ci and bounds use most of
   it: copy them. S/r9/research/TOOL-GUIDE.md explains every part.

   HOW A TOOL USES IT
     create(stage, ctx) {
         const K = kit.use(ctx);                    // one per tool; K.destroy() cleans up all of it
         const panel = K.panel(stage, { questionKey: "...", titleKey: "...", onChange: refresh });
         const n = panel.field({ name: "n", labelKey: "...", kind: "int", min: 1, value: 500 });
         const out = panel.result({ name: "lo", labelKey: "..." });
         function refresh() {
             const v = panel.values();              // null while an input is wrong (the panel says so)
             if (!v) return;
             out.set(v.n / 2, { formula: "500 / 2 = 250" });
             panel.verdict.set("...", "good");
         }
         refresh();
         return K.controller(refresh);              // language() / theme() / destroy() for the hub
     }

   TEXTS. Wherever a part asks for a label, give a translation key or a function that
   returns the text. The kit writes every text as plain text (textContent), never as HTML,
   so "<", "&" and a learner's words are always safe; K.language() writes them again.

   THE KIT AT A GLANCE
     kit.use(ctx) -> K                 everything below lives on K
     kit.num(value, { digits, fixed, percent, grouping })   a number for people: 4 significant
                                       digits by default, whole numbers in full, "—" for no value
     kit.interval(lo, hi, options)     "[0.7946, 0.8604]"   ("[0,7946; 0,8604]" in Russian)
     kit.parse(text, { percent })      -> { ok, value } or { ok: false, error }   (one number)
     kit.parseList(text)               -> { values, bad }                        (many numbers)
     kit.inputText(value)              a number written the way the fields show it
   Layout
     K.panel(parent, { questionKey, titleKey, onChange, stack })
         -> { element, inputs, outputs, below, field, list, choice, toggle, result, heading,
              remark, formula, source, chart, job, table, verdict, values(), copyText(), refresh() }
     K.parts(parent, { name, labelKey, items: [{ id, labelKey }], onChange })
         -> { element, panels: { id: element }, current(), select(id, focus) }     tabs inside a tool
   Inputs (saved through ctx.store under their name; a panel's own come from panel.field and so on)
     K.field(parent, { name, labelKey, kind, value, min, max, minOpen, maxOpen, unitKey, hintKey,
                       powers, onChange })    kind "number" | "int" | "prob" | "percent"
         -> { element, input, name, value(), valid(), shown(), set(value), setLimits(limits), display() }
     K.list(parent, { name, labelKey, value, minCount, maxCount, min, max, hintKey, onChange })
         -> { element, input, name, values(), valid(), set(numbers), display() }
     K.choice(parent, { name, labelKey, options: [{ value, labelKey }], value, onChange })
     K.toggle(parent, { name, labelKey, checked, hintKey, onChange })
   Outputs
     K.result(parent, { name, labelKey, unitKey, kind, digits, hintKey })
         kind "number" | "int" | "percent" | "interval" | "text"
         -> { element, set(value, { formula, tone }), clear(), value(), display() }
     K.verdict(parent) -> { element, set(text, tone), clear(), text() }    tone good | warn | bad | info
     K.remark(parent, { key, tone }) -> { element, set(keyOrFunction, tone), hidden(on) }
         (a function label is read again on set, on hidden(false) and on a language switch;
          so is a result's unitKey function on every set)
     K.formula(parent, { key }) -> { element, set(keyOrFunction), text() }
     K.source(parent, { nameKey, units }) -> { element, set(options), text() }
     K.table(parent, { columns: [{ labelKey, numeric }], captionKey }) -> { element, set(rows) }
     K.chart(parent, spec) -> { element, set(spec), clear(), draw() }        (see section 8;
                                       x / y: { log, labelKey, min, max, step, format })
     K.job(parent) -> { element, start(work, { chunk, onDone, onStop }), stop(), running() }
   The life cycle
     K.language()   K.theme()   K.destroy()   K.controller(refresh)

   Sections of this file:
    1. Settings and small helpers        6. Outputs: results, verdict, remark, formula, source, table
    2. Numbers for people                7. The panel: the standard layout, copy, notebook
    3. Reading what people type          8. The chart
    4. Texts that follow the language    9. Long computations (job)
    5. Inputs: field, list, choice,     10. Parts (tabs inside a tool)
       toggle                           11. AICompass.researchKit
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || A.researchKit) return;      // loaded twice by mistake: the first copy stays

    const t = A.t;

    /* =========================================================
       1. SETTINGS AND SMALL HELPERS
       ========================================================= */
    const DIGITS = 4;                 // significant digits of a result, unless a tool asks for more
    const SCIENTIFIC_BELOW = 1e-4;    // smaller numbers (not 0) are written 4.29×10⁻⁵
    const SCIENTIFIC_FROM = 1e15;     // and so are numbers this big (whole numbers below it are written in full)
    const DASH = "—";                 // no value (an input is wrong, or there is nothing to say)
    const MESSAGE_DELAY = 450;        // ms: while typing, a field shows its error after this pause
    const LIST_MAX_TEXT = 200000;     // characters a list may hold
    const LIST_MAX_COUNT = 100000;    // numbers a list may hold
    const LIST_BAD_SHOWN = 5;         // words that could not be read, named in the message
    const JOB_SLICE = 12;             // ms of work in one slice: the page stays responsive
    const JOB_PAUSE_POLL = 400;       // ms between two looks while a job waits for the page
    const CHART_HEIGHT = 260;         // px, the default height of a chart
    const CHART_FONT = 11;            // px, the smallest text on a chart (the lab kit's size)
    const CHART_PAD = 8;              // px of room around the plot
    const CHART_CORNER = 12;          // px kept free at the rounded corners of the canvas box
    const TICK_GAP_X = 70;            // px of room for each number along the bottom
    const TICK_GAP_Y = 36;            // ... and along the side

    let idCounter = 0;

    function uid() {
        idCounter += 1;
        return "rk-" + idCounter;
    }

    function el(tag, className, attributes) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        Object.keys(attributes || {}).forEach(function (name) { element.setAttribute(name, attributes[name]); });
        return element;
    }

    function isNumber(value) {
        return typeof value === "number" && isFinite(value);
    }

    // An error in a tool's callback must not break the page: report it and go on
    function report(error) {
        if (typeof window.reportError === "function") window.reportError(error);
        else console.error(error);
    }

    function safeCall(callback, value) {
        if (typeof callback !== "function") return undefined;
        try {
            return callback(value);
        } catch (error) {
            report(error);
            return undefined;
        }
    }

    // The text of a label: a translation key, or a function that returns the text
    function textOf(label, values) {
        if (typeof label === "function") return String(label());
        return label ? t(label, values) : "";
    }

    /* =========================================================
       2. NUMBERS FOR PEOPLE
       kit.num(value, options): how the bench writes a number.
         - "—" when there is no value (NaN, null), "∞" for infinity
         - whole numbers below 10¹⁵ in full, with groups: 4,612 (Russian 4 612)
         - other numbers with 4 significant digits (digits: n for more):
           0.7946, 42.95, 4,611 (a number of 1,000 or more keeps all its whole digits)
         - below 10⁻⁴ and from 10¹⁵ on, a power of ten: 4.29×10⁻⁵
         - fixed: n         exactly n decimals (0.050)
         - percent: true    a share as a percentage: 0.0429 -> 4.29%
         - grouping: false  no thousands groups
       The decimal mark is the local one ("0,7946" in Russian), and a negative
       number has the real minus sign: −1.81.
       ========================================================= */
    const SUPERSCRIPT = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };

    function superscript(power) {
        return String(power).split("").map(function (char) { return SUPERSCRIPT[char] || char; }).join("");
    }

    function num(value, options) {
        // the real minus sign (−), not the hyphen the browser writes
        return numberText(value, options).replace(/^-/, "−");
    }

    function numberText(value, options) {
        const s = typeof options === "number" ? { digits: options } : (options || {});
        if (typeof value !== "number" || isNaN(value)) return DASH;
        if (s.percent) return num(value * 100, Object.assign({}, s, { percent: false })) + "%";
        if (!isFinite(value)) return value > 0 ? "∞" : "−∞";
        const grouping = s.grouping === false ? false : undefined;
        if (s.fixed !== undefined) return A.format.number(value, { digits: s.fixed, grouping: grouping });
        const size = Math.abs(value);
        if (Number.isInteger(value) && size < SCIENTIFIC_FROM) return A.format.number(value, { grouping: grouping });
        const digits = Math.max(1, Math.min(15, s.digits || DIGITS));
        if (size < SCIENTIFIC_BELOW || size >= SCIENTIFIC_FROM) {
            let power = Math.floor(Math.log10(size));
            let mantissa = Number((size / Math.pow(10, power)).toPrecision(digits));
            if (mantissa >= 10) {           // 9.9996 rounds up to 10.00: that is 1.000 of the next power
                mantissa /= 10;
                power += 1;
            }
            const head = mantissa === 1 ? "" : A.format.number(mantissa, { maxDigits: digits - 1 }) + "×";
            return (value < 0 ? "−" : "") + head + "10" + superscript(power);
        }
        if (size >= Math.pow(10, digits - 1)) return A.format.number(Math.round(value), { grouping: grouping });
        const rounded = Number(value.toPrecision(digits));
        const decimals = Math.max(0, digits - 1 - Math.floor(Math.log10(Math.abs(rounded))));
        return A.format.number(rounded, { maxDigits: decimals, grouping: grouping });
    }

    // "[0.7946, 0.8604]": an interval the local way (Russian "[0,7946; 0,8604]")
    function interval(lo, hi, options) {
        return t("research.kit.interval", { lo: num(lo, options), hi: num(hi, options) });
    }

    // A number the way an input field shows it: up to 12 significant digits, the local
    // decimal mark, no thousands groups (easy to edit), a power of ten as "1e21"
    function inputText(value) {
        if (!isNumber(value)) return "";
        let text = String(Number(value.toPrecision(12))).replace("e+", "e");
        if (A.lang === "ru") text = text.replace(".", ",");
        return text;
    }

    /* =========================================================
       3. READING WHAT PEOPLE TYPE
       kit.parse(text, { percent }): one number.
         - a minus may be "-" or "−"; spaces around the number do not matter
         - groups of thousands: "1 000 000" (spaces), and in English "1,000,000"
         - the decimal mark: a dot; in Russian a comma too ("0,83")
           (in English any other comma is refused with "Use a dot for decimals")
         - powers: 1e6, 1.5e-3, 2^20, 10^-3, 1.5×10^6 (also 1.5*10^6)
         - percent: true also takes a "%" at the end ("83%")
       -> { ok: true, value } or { ok: false, error: "errEmpty" | "errNumber" | "errDot" }
       ========================================================= */
    const PLAIN = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
    const GROUPS_SPACE = /^[-+]?\d{1,3}( \d{3})+([.,]\d+)?$/;
    const GROUPS_COMMA = /^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/;

    function plainNumber(text, lang) {
        let body = text;
        if (GROUPS_SPACE.test(body)) body = body.replace(/ /g, "");
        if (lang !== "ru" && GROUPS_COMMA.test(body)) body = body.replace(/,/g, "");
        if (body.indexOf(",") !== -1) {
            if (lang !== "ru") return { ok: false, error: "errDot" };
            if (body.indexOf(".") !== -1 || body.split(",").length > 2) return { ok: false, error: "errNumber" };
            body = body.replace(",", ".");
        }
        if (!PLAIN.test(body)) return { ok: false, error: "errNumber" };
        const value = Number(body);
        return isFinite(value) ? { ok: true, value: value } : { ok: false, error: "errNumber" };
    }

    function parse(text, options) {
        const settings = options || {};
        const lang = settings.lang || A.lang;
        let body = String(text === undefined || text === null ? "" : text)
            .replace(/[   ]/g, " ")      // no-break and thin spaces (copied from a document)
            .replace(/[−‒–]/g, "-")      // the real minus and dashes that look like one
            .trim();
        if (settings.percent) body = body.replace(/\s*%$/, "");
        if (!body) return { ok: false, error: "errEmpty" };
        // 1.5×10^6, 1.5*10^6, 1.5·10^6
        let match = /^(.+?)\s*[×x*·]\s*10\s*\^\s*(.+)$/i.exec(body);
        if (match) {
            const mantissa = plainNumber(match[1], lang);
            const power = plainNumber(match[2], lang);
            if (!mantissa.ok) return mantissa;
            if (!power.ok || !Number.isInteger(power.value)) return { ok: false, error: "errNumber" };
            const value = mantissa.value * Math.pow(10, power.value);
            return isFinite(value) ? { ok: true, value: value } : { ok: false, error: "errNumber" };
        }
        // 2^20, 10^-3
        match = /^(.+?)\s*\^\s*(.+)$/.exec(body);
        if (match) {
            const base = plainNumber(match[1], lang);
            const power = plainNumber(match[2], lang);
            if (!base.ok) return base;
            if (!power.ok) return power;
            const value = Math.pow(base.value, power.value);
            return isFinite(value) ? { ok: true, value: value } : { ok: false, error: "errNumber" };
        }
        return plainNumber(body, lang);
    }

    // kit.parseList(text): many numbers. THE RULE (shown under every list, tested in
    // dev/tests/research.test.js):
    //   - spaces, new lines, tabs, semicolons and brackets always separate numbers
    //   - English: a comma separates too ("0.5, 0.7" or "0.5,0.7")
    //   - Russian: a comma BETWEEN TWO DIGITS is the decimal mark ("0,5"), any other
    //     comma separates ("0,5, 0,7" and "0,5 ,0,7" are two numbers; "1,2,3" is not a number)
    //   -> { values: [numbers], bad: [the words that could not be read] }
    function parseList(text, options) {
        const lang = (options && options.lang) || A.lang;
        const source = String(text || "").replace(/[   ]/g, " ").replace(/[−‒–]/g, "-");
        let prepared = "";
        for (let i = 0; i < source.length; i++) {
            const char = source.charAt(i);
            if (char === ",") {
                const between = lang === "ru" && /\d/.test(source.charAt(i - 1)) && /\d/.test(source.charAt(i + 1));
                prepared += between ? "," : " ";
            } else {
                prepared += char;
            }
        }
        const words = prepared.split(/[\s;[\](){}]+/).filter(Boolean);
        const values = [];
        const bad = [];
        words.forEach(function (word) {
            const result = plainNumber(word, "ru");     // the commas left are decimal marks
            if (result.ok && (lang === "ru" || word.indexOf(",") === -1)) values.push(result.value);
            else bad.push(word);
        });
        return { values: values, bad: bad };
    }

    /* =========================================================
       4. TEXTS THAT FOLLOW THE LANGUAGE
       Every text the kit writes is remembered with what it was made from
       (a key, or a function), and K.language() writes it again.
       ========================================================= */
    function makeTexts() {
        const items = [];
        return {
            // element.textContent (or an attribute) = the label's text, now and after a language switch
            bind: function (element, label, attribute) {
                const item = { element: element, label: label, attribute: attribute };
                items.push(item);
                write(item);
                return item;
            },
            all: function () {
                items.forEach(write);
            },
            // one bound text again (a function label reads its numbers anew)
            write: function (item) {
                if (item) write(item);
            },
            clear: function () {
                items.length = 0;
            }
        };

        function write(item) {
            const text = textOf(item.label);
            if (item.attribute) {
                if (item.element.getAttribute(item.attribute) !== text) item.element.setAttribute(item.attribute, text);
            } else if (item.element.textContent !== text) {
                item.element.textContent = text;
            }
        }
    }

    /* =========================================================
       THE KIT OF ONE TOOL: kit.use(ctx)
       ========================================================= */
    function use(ctx) {
        const texts = makeTexts();
        const fields = [];          // every field, list, choice and toggle (for the language switch)
        const charts = [];
        const jobs = [];
        const panels = [];
        const relabelRoots = [];    // elements that hold lab kit controls (kit.relabel)
        const sources = [];
        const tables = [];
        const cleanups = [];
        let destroyed = false;

        function store() {
            return ctx && ctx.store ? ctx.store : { get: function (name, fallback) { return fallback; }, set: function () { return false; }, remove: function () {} };
        }

        function announce(text) {
            if (ctx && typeof ctx.announce === "function") ctx.announce(text);
            else A.announce(text);
        }

        /* =========================================================
           5. INPUTS: FIELD, LIST, CHOICE, TOGGLE
           ========================================================= */
        // A labelled number input with a unit, limits, a hint and live checking.
        //   name       its name: saved as research.<tool>.<name>, and the key of panel.values()
        //   kind       "number" (default) | "int" (whole numbers) | "prob" (0 to 1) |
        //              "percent" (0 to 100, typed as a percentage; value() gives the share:
        //              83 -> 0.83, and min, max and value are written in percent)
        //   value      the first value (in the units shown)
        //   min, max   limits (included; minOpen / maxOpen: true leaves the limit itself out)
        //   unitKey    the unit after the box ("examples"); a percent field shows "%" itself
        //   hintKey    a line under the box
        //   powers     true: big numbers are common here (1e6, 2^20), the phone shows letters too
        //   onChange   called on every change (also when the text becomes wrong)
        function field(parent, options) {
            const s = Object.assign({}, options);
            const kind = s.kind || "number";
            const limits = {
                min: s.min !== undefined ? s.min : (kind === "prob" || kind === "percent" ? 0 : undefined),
                max: s.max !== undefined ? s.max : (kind === "prob" ? 1 : kind === "percent" ? 100 : undefined),
                minOpen: Boolean(s.minOpen),
                maxOpen: Boolean(s.maxOpen)
            };
            const id = uid();
            const element = el("div", "rk-field", { "data-name": s.name, "data-kind": kind });
            const label = el("label", "rk-label", { for: id });
            texts.bind(label, s.labelKey);
            const control = el("div", "rk-control");
            const input = el("input", "rk-input", {
                id: id, type: "text", inputmode: s.powers ? "text" : "decimal",
                autocomplete: "off", autocapitalize: "off", spellcheck: "false", "data-name": s.name
            });
            control.appendChild(input);
            const described = [];
            if (s.unitKey || kind === "percent") {
                const unit = el("span", "rk-unit", { id: uid() });
                if (s.unitKey) texts.bind(unit, s.unitKey);
                else unit.textContent = "%";
                control.appendChild(unit);
                described.push(unit.id);
            }
            element.append(label, control);
            if (s.hintKey) {
                const hint = el("p", "rk-hint", { id: uid() });
                texts.bind(hint, s.hintKey);
                element.appendChild(hint);
                described.push(hint.id);
            }
            const message = el("p", "rk-msg", { id: uid(), "aria-live": "polite" });
            element.appendChild(message);
            described.push(message.id);
            input.setAttribute("aria-describedby", described.join(" "));
            if (parent) parent.appendChild(element);

            let state = { ok: false, value: NaN, error: null };
            let messageTimer = 0;

            function limitText(value) {
                return num(value, { digits: 12 });
            }

            // What is wrong with a number, or null
            function problem(value) {
                if (kind === "int" && !Number.isInteger(value)) return { key: "research.kit.errWhole" };
                const lowBad = limits.min !== undefined && (limits.minOpen ? !(value > limits.min) : !(value >= limits.min));
                const highBad = limits.max !== undefined && (limits.maxOpen ? !(value < limits.max) : !(value <= limits.max));
                if (!lowBad && !highBad) return null;
                const values = { min: limitText(limits.min), max: limitText(limits.max) };
                const both = limits.min !== undefined && limits.max !== undefined && !limits.minOpen && !limits.maxOpen;
                if (lowBad) return { key: limits.minOpen ? "research.kit.errAbove" : both ? "research.kit.errRange" : "research.kit.errMin", values: values };
                return { key: limits.maxOpen ? "research.kit.errBelow" : both ? "research.kit.errRange" : "research.kit.errMax", values: values };
            }

            function check(text) {
                const read = parse(text, { percent: kind === "percent" });
                if (!read.ok) return { ok: false, value: NaN, error: { key: "research.kit." + read.error } };
                const wrong = problem(read.value);
                return wrong ? { ok: false, value: NaN, error: wrong } : { ok: true, value: read.value, error: null };
            }

            function showMessage() {
                clearTimeout(messageTimer);
                messageTimer = 0;
                const text = state.error ? t(state.error.key, state.error.values) : "";
                A.dom.setText(message, text);
                element.classList.toggle("is-invalid", !state.ok);
                if (state.ok) input.removeAttribute("aria-invalid");
                else input.setAttribute("aria-invalid", "true");
            }

            // later: true while typing (the message waits for a pause); a fix shows at once
            function update(later) {
                state = check(input.value);
                if (state.ok) {
                    store().set(s.name, state.value);
                    showMessage();
                } else if (later) {
                    clearTimeout(messageTimer);
                    messageTimer = setTimeout(showMessage, MESSAGE_DELAY);
                } else {
                    showMessage();
                }
            }

            input.addEventListener("input", function () {
                update(true);
                safeCall(s.onChange);
            });
            input.addEventListener("change", function () {
                if (messageTimer) showMessage();
            });
            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") showMessage();
            });

            // The saved value, if it is still allowed; else the tool's first value
            const saved = store().get(s.name, undefined, function (value) { return isNumber(value) && !problem(value); });
            input.value = inputText(saved !== undefined ? saved : s.value);
            state = check(input.value);
            showMessage();

            const api = {
                element: element,
                input: input,
                name: s.name,
                kind: kind,
                // The number to compute with (a percent field gives the share), or NaN while wrong
                value: function () {
                    if (!state.ok) return NaN;
                    return kind === "percent" ? state.value / 100 : state.value;
                },
                valid: function () { return state.ok; },
                // The number as the box shows it (83 for 83%)
                shown: function () { return state.ok ? state.value : NaN; },
                // Writes a number into the box (in the units shown) and saves it
                set: function (value) {
                    input.value = inputText(value);
                    update(false);
                },
                setLimits: function (changes) {
                    Object.assign(limits, changes);
                    update(false);
                },
                label: function () { return textOf(s.labelKey); },
                // "83%" or "500 examples": for "Copy result" and the notebook
                display: function () {
                    if (!state.ok) return input.value;
                    if (kind === "percent") return num(state.value, { digits: 12 }) + "%";
                    return num(state.value, { digits: 12 }) + (s.unitKey ? " " + textOf(s.unitKey) : "");
                },
                focus: function () { input.focus(); },
                // The language changed: the same number with the new decimal mark
                language: function () {
                    if (state.ok) input.value = inputText(state.value);
                    else if (input.value) state = check(input.value);
                    showMessage();
                }
            };
            fields.push(api);
            return api;
        }

        // A text box for pasted numbers. It says how many numbers it understood and which
        // words it could not read (the rule: parseList above). A list with a word it cannot
        // read is not used: a result from half the numbers would mislead.
        //   name, labelKey, hintKey (default: the separator rule), rows (default 4)
        //   value        the first numbers (an array)
        //   minCount, maxCount   how many numbers it needs (default 1 and 100,000)
        //   min, max     limits for each number (included)
        //   whole: true  whole numbers only
        //   onChange     called on every change
        function list(parent, options) {
            const s = Object.assign({}, options);
            const minCount = s.minCount === undefined ? 1 : s.minCount;
            const maxCount = s.maxCount === undefined ? LIST_MAX_COUNT : s.maxCount;
            const id = uid();
            const element = el("div", "rk-field rk-list", { "data-name": s.name });
            const label = el("label", "rk-label", { for: id });
            texts.bind(label, s.labelKey);
            const input = el("textarea", "rk-input rk-textarea", {
                id: id, rows: String(s.rows || 4), spellcheck: "false", autocomplete: "off", autocapitalize: "off", "data-name": s.name
            });
            const hint = el("p", "rk-hint", { id: uid() });
            texts.bind(hint, s.hintKey || "research.kit.listHint");
            const status = el("p", "rk-msg rk-list-status", { id: uid(), "aria-live": "polite" });
            input.setAttribute("aria-describedby", hint.id + " " + status.id);
            element.append(label, input, hint, status);
            if (parent) parent.appendChild(element);

            let state = { ok: false, values: [], message: "" };
            let messageTimer = 0;

            function check(text) {
                if (text.length > LIST_MAX_TEXT) {
                    return { ok: false, values: [], message: t("research.kit.listLong", { max: num(LIST_MAX_TEXT) }) };
                }
                const read = parseList(text);
                const parts = [];
                let ok = read.bad.length === 0;
                if (read.values.length || !read.bad.length) parts.push(A.plural("research.kit.listRead", read.values.length));
                if (read.bad.length) {
                    let named = read.bad.slice(0, LIST_BAD_SHOWN).map(function (word) {
                        return "“" + (word.length > 24 ? word.slice(0, 23) + "…" : word) + "”";
                    }).join(", ");
                    if (read.bad.length > LIST_BAD_SHOWN) named += " " + t("research.kit.listMore", { n: num(read.bad.length - LIST_BAD_SHOWN) });
                    parts.push(t("research.kit.listBad", { list: named }));
                }
                if (ok && read.values.length < minCount) {
                    ok = false;
                    parts.push(t("research.kit.listFew", { min: num(minCount) }));
                }
                if (ok && read.values.length > maxCount) {
                    ok = false;
                    parts.push(t("research.kit.listMany", { max: num(maxCount) }));
                }
                if (ok) {
                    const outside = read.values.find(function (value) {
                        return (s.min !== undefined && value < s.min) || (s.max !== undefined && value > s.max) || (s.whole && !Number.isInteger(value));
                    });
                    if (outside !== undefined) {
                        ok = false;
                        if (s.whole && !Number.isInteger(outside)) parts.push(t("research.kit.errWhole"));
                        else parts.push(t("research.kit.listOut", { value: num(outside, { digits: 12 }), min: num(s.min, { digits: 12 }), max: num(s.max, { digits: 12 }) }));
                    }
                }
                return { ok: ok, values: ok ? read.values : [], message: parts.join(" ") };
            }

            function showMessage() {
                clearTimeout(messageTimer);
                messageTimer = 0;
                A.dom.setText(status, state.message);
                element.classList.toggle("is-invalid", !state.ok);
                if (state.ok) input.removeAttribute("aria-invalid");
                else input.setAttribute("aria-invalid", "true");
            }

            function update(later) {
                state = check(input.value);
                if (state.ok) store().set(s.name, state.values);
                // The count is written at once; a problem waits for a pause in the typing
                if (state.ok || !later) showMessage();
                else {
                    clearTimeout(messageTimer);
                    messageTimer = setTimeout(showMessage, MESSAGE_DELAY);
                }
            }

            function textFor(values) {
                return values.map(inputText).join(" ");
            }

            input.addEventListener("input", function () {
                update(true);
                safeCall(s.onChange);
            });
            input.addEventListener("change", function () {
                if (messageTimer) showMessage();
            });

            const saved = store().get(s.name, undefined, function (value) {
                return Array.isArray(value) && value.length <= maxCount && value.every(isNumber);
            });
            input.value = textFor(saved || s.value || []);
            state = check(input.value);
            showMessage();

            const api = {
                element: element,
                input: input,
                name: s.name,
                kind: "list",
                values: function () { return state.ok ? state.values.slice() : null; },
                value: function () { return state.ok ? state.values.slice() : null; },
                valid: function () { return state.ok; },
                set: function (values) {
                    input.value = textFor(values || []);
                    update(false);
                },
                label: function () { return textOf(s.labelKey); },
                display: function () {
                    if (!state.ok) return input.value.slice(0, 200);
                    const shown = state.values.slice(0, 50).map(function (value) { return num(value, { digits: 12 }); }).join("; ");
                    return shown + (state.values.length > 50 ? "; … (" + A.plural("research.kit.listRead", state.values.length) + ")" : "");
                },
                focus: function () { input.focus(); },
                language: function () {
                    // Numbers that were read are written again with the new decimal mark;
                    // text that has a problem stays as it is and is read again
                    if (state.ok) input.value = textFor(state.values);
                    state = check(input.value);
                    showMessage();
                }
            };
            fields.push(api);
            return api;
        }

        // One of a few options (the lab kit's segmented control), saved.
        //   options: [{ value, labelKey }]; value: the first choice
        function choice(parent, options) {
            const s = Object.assign({}, options);
            const items = s.options || [];
            const allowed = items.map(function (item) { return item.value; });
            const saved = store().get(s.name, undefined, function (value) { return allowed.indexOf(value) !== -1; });
            const control = A.labKit.segmented({
                labelKey: s.labelKey,
                options: items,
                value: saved !== undefined ? saved : (s.value !== undefined ? s.value : allowed[0]),
                onChange: function (value) {
                    store().set(s.name, value);
                    safeCall(s.onChange, value);
                }
            });
            control.element.classList.add("rk-choice");
            control.element.setAttribute("data-name", s.name);
            if (parent) parent.appendChild(control.element);
            relabelRoots.push(control.element);
            const api = {
                element: control.element,
                name: s.name,
                kind: "choice",
                value: function () { return control.value(); },
                valid: function () { return true; },
                set: function (value) {
                    control.set(value);
                    store().set(s.name, value);
                },
                label: function () { return textOf(s.labelKey); },
                display: function () {
                    const item = items.find(function (entry) { return entry.value === control.value(); });
                    return item ? textOf(item.labelKey || function () { return String(item.label); }) : "";
                },
                language: function () {}
            };
            fields.push(api);
            return api;
        }

        // An on / off switch (the lab kit's toggle), saved
        function toggle(parent, options) {
            const s = Object.assign({}, options);
            const saved = store().get(s.name, undefined, function (value) { return typeof value === "boolean"; });
            const control = A.labKit.toggle({
                labelKey: s.labelKey,
                hintKey: s.hintKey,
                checked: saved !== undefined ? saved : Boolean(s.checked),
                onChange: function (on) {
                    store().set(s.name, on);
                    safeCall(s.onChange, on);
                }
            });
            control.element.classList.add("rk-toggle");
            control.element.setAttribute("data-name", s.name);
            if (parent) parent.appendChild(control.element);
            relabelRoots.push(control.element);
            const api = {
                element: control.element,
                name: s.name,
                kind: "toggle",
                value: function () { return control.checked(); },
                valid: function () { return true; },
                set: function (on) {
                    control.set(on);
                    store().set(s.name, Boolean(on));
                },
                label: function () { return textOf(s.labelKey); },
                display: function () { return control.checked() ? "✓" : "✗"; },
                language: function () {}
            };
            fields.push(api);
            return api;
        }

        /* =========================================================
           6. OUTPUTS: RESULTS, VERDICT, REMARK, FORMULA, SOURCE, TABLE
           ========================================================= */
        // A result row: its name, the value (kit.num), a unit, and optionally the formula
        // with the numbers put in, in the code font: set(value, { formula: "…" }).
        //   kind "number" (default) | "int" | "percent" (a share, written as %) |
        //        "interval" (set({ lo, hi })) | "text" (set("words"))
        //   digits  significant digits (default 4); set(value, { digits }) gives this one value more
        // The exact value stays on the row for tests and for copying by hand:
        // data-value (data-lo and data-hi for an interval).
        function result(parent, options) {
            const s = Object.assign({ kind: "number" }, options);
            const element = el("div", "rk-result", { "data-name": s.name || "" });
            const name = el("dt", "rk-result-name");
            texts.bind(name, s.labelKey);
            const body = el("dd", "rk-result-body");
            const value = el("span", "rk-result-value");
            const unit = el("span", "rk-result-unit");
            const unitText = s.unitKey ? texts.bind(unit, s.unitKey) : null;
            body.append(value, unit);
            const formulaBox = el("dd", "rk-result-formula");
            const formula = el("code");
            formulaBox.appendChild(formula);
            formulaBox.hidden = true;
            element.append(name, body, formulaBox);
            if (s.hintKey) {
                const hint = el("dd", "rk-result-hint");
                texts.bind(hint, s.hintKey);
                element.appendChild(hint);
            }
            if (parent) parent.appendChild(element);

            let current = null;          // { value, extra }

            function format(raw) {
                // a tool may ask for more digits for one value: set(value, { digits: 6 })
                const wanted = current && current.extra && current.extra.digits ? current.extra.digits : s.digits;
                const digits = { digits: wanted };
                if (raw === null || raw === undefined) return DASH;
                if (s.kind === "text") return String(raw);
                if (s.kind === "interval") return raw && isNumber(raw.lo) && isNumber(raw.hi) ? interval(raw.lo, raw.hi, { digits: wanted, percent: s.percent }) : DASH;
                if (s.kind === "percent") return num(raw, { digits: wanted, percent: true });
                if (s.kind === "int") return num(isNumber(raw) ? Math.round(raw) : raw);
                return num(raw, digits);
            }

            function paint() {
                const raw = current ? current.value : null;
                const extra = current ? current.extra : {};
                A.dom.setText(value, format(raw));
                if (s.kind === "interval" && raw) {
                    element.setAttribute("data-lo", String(raw.lo));
                    element.setAttribute("data-hi", String(raw.hi));
                    element.removeAttribute("data-value");
                } else if (raw !== null && raw !== undefined && s.kind !== "text") {
                    element.setAttribute("data-value", String(raw));
                } else {
                    element.removeAttribute("data-value");
                    element.removeAttribute("data-lo");
                    element.removeAttribute("data-hi");
                }
                const formulaText = extra && extra.formula ? textOf(extra.formula) : "";
                A.dom.setText(formula, formulaText);
                A.dom.setHidden(formulaBox, !formulaText);
                texts.write(unitText);          // a unit given as a function follows the tool's choice
                A.dom.setHidden(unit, !s.unitKey || raw === null || raw === undefined);
                if (extra && extra.tone) element.setAttribute("data-tone", extra.tone);
                else element.removeAttribute("data-tone");
                element.classList.toggle("is-empty", raw === null || raw === undefined);
            }

            const api = {
                element: element,
                name: s.name,
                // extra: { formula: text or function (the numbers put in), tone: "good" | "warn" | "bad" }
                set: function (raw, extra) {
                    current = { value: raw, extra: extra || {} };
                    paint();
                },
                clear: function () {
                    current = null;
                    paint();
                },
                value: function () { return current ? current.value : null; },
                label: function () { return textOf(s.labelKey); },
                display: function () {
                    return format(current ? current.value : null) + (s.unitKey && current ? " " + textOf(s.unitKey) : "");
                },
                formulaText: function () { return current && current.extra.formula ? textOf(current.extra.formula) : ""; },
                repaint: paint,
                hidden: function (on) { A.dom.setHidden(element, on); },
                isHidden: function () { return element.hidden; }
            };
            paint();
            return api;
        }

        // The sentence that says what the result means ("With 500 examples you cannot tell
        // 83% from 80%."). Screen readers hear it when it changes (role="status").
        function verdict(parent) {
            const element = el("p", "rk-verdict", { role: "status" });
            if (parent) parent.appendChild(element);
            let text = "";
            return {
                element: element,
                set: function (newText, tone) {
                    text = String(newText || "");
                    A.dom.setText(element, text);
                    element.setAttribute("data-tone", tone || "info");
                    A.dom.setHidden(element, !text);
                },
                clear: function () {
                    text = "";
                    A.dom.setText(element, "");
                    A.dom.setHidden(element, true);
                },
                text: function () { return text; }
            };
        }

        // A short note next to the results ("When both models are scored on the same
        // examples, a paired test is stronger: see part 4.")
        function remark(parent, options) {
            const s = Object.assign({}, options);
            const element = el("p", "rk-remark", { "data-tone": s.tone || "info" });
            let item = texts.bind(element, s.key);
            if (parent) parent.appendChild(element);
            return {
                element: element,
                set: function (label, tone) {
                    item.label = label;
                    texts.write(item);
                    if (tone) element.setAttribute("data-tone", tone);
                },
                // shown again: a function label reads its numbers anew
                hidden: function (on) {
                    if (!on) texts.write(item);
                    A.dom.setHidden(element, on);
                }
            };
        }

        // The general formula, in the code font. key: a text with "\n" between lines.
        function formula(parent, options) {
            const s = Object.assign({}, options);
            const element = el("figure", "rk-formula");
            const caption = el("figcaption", "rk-formula-title");
            texts.bind(caption, s.titleKey || "research.kit.formula");
            const pre = el("pre", "rk-formula-code");
            const code = el("code");
            pre.appendChild(code);
            element.append(caption, pre);
            const item = texts.bind(code, s.key);
            if (parent) parent.appendChild(element);
            return {
                element: element,
                set: function (label) {
                    item.label = label;
                    texts.all();
                },
                text: function () { return textOf(item.label); }
            };
        }

        // Which units of My path this copy of the site has (js/content/learn.js: the units of
        // the courses that are stages of the path, and the practice units). Never a request.
        function unitExists(id) {
            const learn = A.content.get("learn");
            if (!learn || !learn.courses) return false;
            const courses = (learn.stages || []).map(function (stage) { return stage.course; }).filter(Boolean).concat(["practice"]);
            return courses.some(function (name) {
                const course = learn.courses[name];
                return Boolean(course && Array.isArray(course.units) && course.units.some(function (unit) { return unit.id === id; }));
            });
        }

        // One line that names the result and links to the units of My path that teach it:
        // "Source: Wilson score interval · Unit b4: Measure a language model".
        // A unit this copy of the site does not have yet is simply left out.
        function source(parent, options) {
            let s = Object.assign({}, options);
            const element = el("p", "rk-source");
            if (parent) parent.appendChild(element);

            function paint() {
                element.textContent = "";
                const head = el("span", "rk-source-label");
                head.textContent = t("research.kit.source") + ": ";
                const name = el("span", "rk-source-name");
                name.textContent = textOf(s.nameKey);
                element.append(head, name);
                (s.units || []).filter(unitExists).forEach(function (id) {
                    const link = el("button", "rk-source-unit", { type: "button", "data-unit": id });
                    link.textContent = t("research.kit.sourceUnit", { id: id, title: t("learn.unit." + id) });
                    link.addEventListener("click", function () {
                        if (ctx && typeof ctx.learn === "function") ctx.learn(id, link);
                    });
                    const gap = el("span", "rk-source-gap", { "aria-hidden": "true" });
                    gap.textContent = " · ";
                    element.append(gap, link);
                });
            }

            paint();
            const api = {
                element: element,
                set: function (changes) {
                    s = Object.assign(s, changes);
                    paint();
                },
                text: function () {
                    const units = (s.units || []).filter(unitExists).map(function (id) { return t("research.kit.sourceUnit", { id: id, title: t("learn.unit." + id) }); });
                    return textOf(s.nameKey) + (units.length ? " (" + units.join("; ") + ")" : "");
                },
                language: paint
            };
            sources.push(api);
            return api;
        }

        // A small table of numbers (for tools that show a row per item: many p-values...).
        //   columns: [{ labelKey, numeric: true }]   set(rows): rows of numbers or texts
        //   (numbers are written with kit.num; a cell can also be { value, digits, percent })
        function table(parent, options) {
            const s = Object.assign({}, options);
            const element = el("div", "rk-table-wrap");
            const tableElement = el("table", "rk-table");
            if (s.captionKey) {
                const caption = el("caption", "rk-table-caption");
                texts.bind(caption, s.captionKey);
                tableElement.appendChild(caption);
            }
            const head = el("thead");
            const headRow = el("tr");
            (s.columns || []).forEach(function (column) {
                const cell = el("th", column.numeric ? "is-num" : "", { scope: "col" });
                texts.bind(cell, column.labelKey);
                headRow.appendChild(cell);
            });
            head.appendChild(headRow);
            const bodyElement = el("tbody");
            tableElement.append(head, bodyElement);
            element.appendChild(tableElement);
            if (parent) parent.appendChild(element);
            let rows = [];

            function cellText(value) {
                if (value && typeof value === "object") return num(value.value, value);
                if (typeof value === "number") return num(value);
                return value === undefined || value === null ? DASH : String(value);
            }

            function paint() {
                bodyElement.textContent = "";
                rows.forEach(function (row) {
                    const line = el("tr");
                    row.forEach(function (value, index) {
                        const column = (s.columns || [])[index] || {};
                        const cell = el(index === 0 ? "th" : "td", column.numeric ? "is-num" : "", index === 0 ? { scope: "row" } : {});
                        cell.textContent = cellText(value);
                        line.appendChild(cell);
                    });
                    bodyElement.appendChild(line);
                });
            }

            const api = {
                element: element,
                set: function (newRows) {
                    rows = (newRows || []).slice();
                    paint();
                },
                rows: function () { return rows.map(function (row) { return row.map(cellText); }); },
                language: paint
            };
            tables.push(api);
            return api;
        }

        /* =========================================================
           7. THE PANEL: THE STANDARD LAYOUT, COPY, NOTEBOOK
           A short "what question does this answer" line; inputs on the left
           (on top on a phone), results on the right; the formula and the
           source under them; then "Copy result" and "Add to notebook".
           Everything a panel's own builders make (panel.field, panel.result...)
           goes into "Copy result" and the notebook entry, in order.
             questionKey   the question line
             titleKey      the name of this part, for the copied text and the notebook
                           ("Wilson interval"); the tool's name comes first
             onChange      called after any input of the panel changed
             stack: true   inputs above results at every width
           ========================================================= */
        function panel(parent, options) {
            const s = Object.assign({}, options);
            const element = el("section", "rk-panel" + (s.stack ? " rk-panel-stack" : ""));
            const question = el("p", "rk-question");
            if (s.questionKey) texts.bind(question, s.questionKey);
            else question.hidden = true;
            const body = el("div", "rk-body");
            const inputs = el("div", "rk-inputs", { role: "group" });
            const inputsHead = el("h4", "rk-head", { id: uid() });
            texts.bind(inputsHead, "research.kit.inputs");
            inputs.setAttribute("aria-labelledby", inputsHead.id);
            inputs.appendChild(inputsHead);
            const outputs = el("div", "rk-outputs");
            const outputsHead = el("h4", "rk-head", { id: uid() });
            texts.bind(outputsHead, "research.kit.results");
            outputs.appendChild(outputsHead);
            const theVerdict = verdict(outputs);
            theVerdict.clear();
            let rows = el("dl", "rk-results");        // where result rows go (a heading starts a new group)
            outputs.appendChild(rows);
            body.append(inputs, outputs);
            const below = el("div", "rk-below");
            const actions = el("div", "rk-actions");
            element.append(question, body, below, actions);
            if (parent) parent.appendChild(element);
            relabelRoots.push(element);

            const own = { inputs: [], results: [], formulas: [], sources: [], charts: [] };

            function changed() {
                safeCall(s.onChange);
            }

            function withChange(options) {
                const settings = Object.assign({}, options);
                const original = settings.onChange;
                settings.onChange = function (value) {
                    safeCall(original, value);
                    changed();
                };
                return settings;
            }

            // ----- "Copy result" and "Add to notebook" -----
            const copyButton = A.labKit.button("research.kit.copy", { variant: "ghost", size: "sm", onClick: copy });
            const noteButton = A.labKit.button("research.kit.note", { variant: "primary", size: "sm", onClick: addNote });
            copyButton.element.classList.add("rk-copy");
            noteButton.element.classList.add("rk-note");
            const status = el("p", "rk-action-msg", { role: "status" });
            const openNotebook = el("button", "rk-action-link", { type: "button" });
            texts.bind(openNotebook, "research.kit.openNotebook");
            openNotebook.hidden = true;
            openNotebook.addEventListener("click", function () {
                if (ctx && typeof ctx.openNotebook === "function") ctx.openNotebook(openNotebook);
            });
            const fallback = el("textarea", "rk-input rk-copy-text", { readonly: "", rows: "6", "aria-label": "" });
            texts.bind(fallback, "research.kit.copy", "aria-label");
            fallback.hidden = true;
            actions.append(copyButton.element, noteButton.element, status, openNotebook, fallback);

            function say(text, withLink) {
                A.dom.setText(status, text);
                A.dom.setHidden(openNotebook, !withLink);
            }

            // Is there a result to share? (every input is right)
            function complete() {
                return own.inputs.every(function (item) { return item.valid(); });
            }

            function visibleResults() {
                return own.results.filter(function (item) { return !item.isHidden() && item.value() !== null; });
            }

            function heading() {
                const tool = ctx && typeof ctx.title === "function" ? ctx.title() : "";
                const part = s.titleKey ? textOf(s.titleKey) : "";
                // a one-panel tool may name its panel after itself: then the name once
                return tool && part && part !== tool ? tool + ": " + part : tool || part;
            }

            // The plain text of "Copy result": the inputs, the results with their formulas,
            // the verdict, the general formula and the source
            function copyText() {
                const lines = [heading(), ""];
                lines.push(t("research.kit.inputs"));
                own.inputs.forEach(function (item) { lines.push("  " + item.label() + ": " + item.display()); });
                lines.push("", t("research.kit.results"));
                visibleResults().forEach(function (item) {
                    lines.push("  " + item.label() + ": " + item.display());
                    const worked = item.formulaText();
                    if (worked) worked.split("\n").forEach(function (line) { lines.push("      " + line); });
                });
                if (theVerdict.text()) lines.push("", theVerdict.text());
                own.formulas.forEach(function (item) {
                    lines.push("", t("research.kit.formula"));
                    item.text().split("\n").forEach(function (line) { lines.push("  " + line); });
                });
                own.sources.forEach(function (item) { lines.push("", t("research.kit.source") + ": " + item.text()); });
                lines.push("", t("research.kit.copyFrom") + ", " + A.format.date(Date.now()));
                return lines.join("\n");
            }

            function copy() {
                if (!complete()) {
                    say(t("research.kit.noResult"), false);
                    return;
                }
                const text = copyText();
                fallback.hidden = true;
                const done = function () {
                    say(t("research.kit.copied"), false);
                    announce(t("research.kit.copied"));
                };
                const failed = function () {
                    // The browser said no: the text is shown, selected, to copy by hand
                    fallback.value = text;
                    fallback.hidden = false;
                    fallback.focus();
                    fallback.select();
                    let copied = false;
                    try {
                        copied = document.execCommand("copy");
                    } catch (error) {
                        copied = false;
                    }
                    if (copied) done();
                    else say(t("research.kit.copyFailed"), false);
                };
                if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                    navigator.clipboard.writeText(text).then(done, failed);
                } else {
                    failed();
                }
            }

            function addNote() {
                if (!complete()) {
                    say(t("research.kit.noResult"), false);
                    return;
                }
                const textParts = [];
                if (theVerdict.text()) textParts.push(theVerdict.text());
                own.formulas.forEach(function (item) { textParts.push(item.text()); });
                own.sources.forEach(function (item) { textParts.push(t("research.kit.source") + ": " + item.text()); });
                const results = [];
                visibleResults().forEach(function (item) {
                    results.push([item.label(), item.display()]);
                    const worked = item.formulaText();
                    if (worked) results.push(["", worked]);
                });
                const entry = {
                    tool: ctx ? ctx.id : "",
                    title: heading(),
                    inputs: own.inputs.map(function (item) { return [item.label(), item.display()]; }),
                    results: results,
                    text: textParts.join("\n\n")
                };
                const answer = ctx && typeof ctx.note === "function" ? ctx.note(entry) : { ok: false };
                if (answer && answer.ok) {
                    say(t("research.kit.noted"), true);
                    announce(t("research.kit.noted"));
                } else {
                    say(t("research.kit.noteFull", { max: num(answer && answer.max ? answer.max : 300) }), true);
                }
            }

            const api = {
                element: element,
                inputs: inputs,
                outputs: outputs,
                below: below,
                actions: actions,
                verdict: theVerdict,
                field: function (options) {
                    const item = field(inputs, withChange(options));
                    own.inputs.push(item);
                    return item;
                },
                list: function (options) {
                    const item = list(inputs, withChange(options));
                    own.inputs.push(item);
                    return item;
                },
                choice: function (options) {
                    const item = choice(inputs, withChange(options));
                    own.inputs.push(item);
                    return item;
                },
                toggle: function (options) {
                    const item = toggle(inputs, withChange(options));
                    own.inputs.push(item);
                    return item;
                },
                // A sub-heading in the results ("Guarantee at n"); the rows after it form a group
                heading: function (labelKey) {
                    const head = el("h5", "rk-subhead");
                    texts.bind(head, labelKey);
                    outputs.appendChild(head);
                    rows = el("dl", "rk-results");
                    outputs.appendChild(rows);
                    return head;
                },
                result: function (options) {
                    const item = result(rows, options);
                    own.results.push(item);
                    return item;
                },
                remark: function (options) {
                    return remark(outputs, options);
                },
                formula: function (options) {
                    const item = formula(below, options);
                    own.formulas.push(item);
                    return item;
                },
                source: function (options) {
                    const item = source(below, options);
                    own.sources.push(item);
                    return item;
                },
                chart: function (spec, where) {
                    const item = chart(where === "below" ? below : outputs, spec);
                    own.charts.push(item);
                    return item;
                },
                job: function () {
                    return job(outputs);
                },
                table: function (options) {
                    return table(outputs, options);
                },
                // The numbers of every input by name (a percent field gives its share), or null
                // while one is wrong: then every result shows "—", the charts are emptied and
                // the verdict asks to fix the inputs marked in red.
                values: function () {
                    if (!complete()) {
                        own.results.forEach(function (item) { item.clear(); });
                        own.charts.forEach(function (item) { item.clear(); });
                        theVerdict.set(t("research.kit.fixInputs"), "bad");
                        return null;
                    }
                    const values = {};
                    own.inputs.forEach(function (item) { values[item.name] = item.value(); });
                    return values;
                },
                copyText: copyText,
                refresh: changed,
                clearMessage: function () { say("", false); }
            };
            panels.push(api);
            return api;
        }

        /* =========================================================
           8. THE CHART
           K.chart(parent, spec) draws on the lab kit's canvas, in the colours of
           the look, with its fonts and markers, and draws again after a resize,
           a look change (K.theme) and a language switch (K.language).
             spec = {
               labelKey   the chart's name for screen readers
               height     px (default 260)
               x, y       { log: true, labelKey, min, max, step, format(value) }    the axes
                          (step on a linear axis: ticks only at its multiples, e.g. 1 for outcomes)
               series     [{ kind: "line" | "points" | "bars", data, labelKey or label,
                             colorIndex (0..7) or color ("danger", "warning", "muted", "accent"...),
                             dash: true, band, errors: true }]
                   line    data [[x, y], ...]; band: [[x, lo, hi], ...] a light area around it
                   points  data [[x, y], ...]; with errors: true [[x, y, lo, hi], ...] (error bars)
                   bars    data [[left, right, height], ...] (a histogram)
               marks      [{ x, y, labelKey or label, colorIndex }]   a ringed point, or with
                           no y a vertical line with its label at the top
               hlines     [{ y, labelKey or label, color, dash }]    a horizontal line with a label
               legend     false: no legend under the chart (default: one entry per named series)
               describe   a text or a function: the screen-reader text (default: a summary)
             }
           Values that a logarithmic axis cannot show (0 or below) are left out.
           The lab kit's own lineChart has one x value per index and no log x
           axis, so this one is drawn here, with the same canvas, colours and look.
           ========================================================= */
        function chart(parent, spec) {
            const lk = A.labKit;
            const element = el("figure", "rk-chart");
            if (parent) parent.appendChild(element);
            let settings = Object.assign({}, spec);
            const view = lk.canvas(element, { height: settings.height || CHART_HEIGHT, labelKey: settings.labelKey || "research.kit.chart" });
            const legendBox = el("div", "rk-chart-legend");
            element.appendChild(legendBox);
            let legend = null;

            function paintLegend() {
                const items = (settings.series || []).filter(function (series) { return series.labelKey || series.label; }).map(function (series) {
                    return {
                        labelKey: series.labelKey || undefined,
                        label: series.labelKey ? undefined : labelOf(series),
                        color: series.colorIndex === undefined && series.color ? colorOf(series, lk.colors()) : undefined,
                        colorIndex: series.colorIndex,
                        shape: series.kind === "bars" ? "square" : series.kind === "points" ? "dot" : series.dash ? "dash" : "line"
                    };
                });
                const show = settings.legend !== false && items.length > 0;
                if (!show) {
                    legendBox.textContent = "";
                    legend = null;
                    return;
                }
                if (!legend) {
                    legend = lk.legend(items);
                    legendBox.textContent = "";
                    legendBox.appendChild(legend.element);
                } else {
                    legend.update(items);
                }
            }

            function draw() {
                if (destroyed) return;
                drawChart(view, settings);
            }

            view.onResize(draw);
            const api = {
                element: element,
                set: function (newSpec) {
                    settings = Object.assign({}, spec, newSpec);
                    paintLegend();
                    draw();
                },
                update: function (changes) {
                    settings = Object.assign(settings, changes);
                    paintLegend();
                    draw();
                },
                clear: function () {
                    settings = Object.assign({}, settings, { series: [], marks: [], hlines: [] });
                    paintLegend();
                    draw();
                },
                draw: draw,
                language: function () {
                    paintLegend();
                    draw();
                },
                destroy: function () { view.destroy(); }
            };
            paintLegend();
            draw();
            charts.push(api);
            return api;
        }

        function colorOf(item, c) {
            if (item.color && c[item.color]) return c[item.color];
            if (item.color) return item.color;
            return c.series[Math.abs(Math.round(item.colorIndex || 0)) % c.series.length];
        }

        function labelOf(item) {
            if (item.labelKey) return textOf(item.labelKey);
            if (typeof item.label === "function") return String(item.label());
            return item.label === undefined || item.label === null ? "" : String(item.label);
        }

        // Nice steps for a linear axis: 1, 2, 2.5 or 5 times a power of ten
        function niceStep(range, count) {
            const raw = range / Math.max(1, count);
            if (!(raw > 0)) return 1;
            const power = Math.pow(10, Math.floor(Math.log10(raw)));
            const fraction = raw / power;
            return (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10) * power;
        }

        function decimalsOf(step) {
            const text = String(Number(step.toPrecision(6)));
            const exponent = text.indexOf("e-");
            if (exponent !== -1) return Number(text.slice(exponent + 2));
            const dot = text.indexOf(".");
            return dot === -1 ? 0 : text.length - dot - 1;
        }

        // An axis: where its values go, its ticks and their labels.
        //   lo, hi    the range of the data (on a log axis: log10 of the values)
        //   room      how many labels fit
        //   fixed     { min, max } from the spec (already on the axis's scale), or nulls
        function makeAxis(lo, hi, room, log, fixed, format, extend) {
            const axis = { log: log, major: [], minor: [] };
            if (log) {
                let min = fixed.min !== null ? fixed.min : Math.floor(lo + 1e-9);
                let max = fixed.max !== null ? fixed.max : Math.ceil(hi - 1e-9);
                if (max - min < 1e-9) {
                    min -= 1;
                    max += 1;
                }
                const decades = Math.ceil(max - 1e-9) - Math.floor(min + 1e-9);
                const every = Math.max(1, Math.ceil(decades / Math.max(1, room)));
                for (let p = Math.floor(min + 1e-9); p <= Math.ceil(max - 1e-9); p += 1) {
                    if (p >= min - 1e-9 && p <= max + 1e-9 && (p % every === 0)) axis.major.push({ at: p, text: format ? format(Math.pow(10, p)) : powerText(p) });
                    if (decades <= room) {
                        for (let m = 2; m <= 9; m++) {
                            const at = p + Math.log10(m);
                            if (at < min - 1e-9 || at > max + 1e-9) continue;
                            // a short axis also names 2 and 5 (0.02, 0.05, 0.2, 0.5...)
                            if (decades <= 2 && (m === 2 || m === 5)) axis.major.push({ at: at, text: format ? format(m * Math.pow(10, p)) : num(m * Math.pow(10, p)) });
                            else axis.minor.push(at);
                        }
                    }
                }
                axis.min = min;
                axis.max = max;
                return axis;
            }
            let min = fixed.min !== null ? fixed.min : lo;
            let max = fixed.max !== null ? fixed.max : hi;
            if (max - min < 1e-12) {
                const pad = Math.max(Math.abs(min) * 0.1, 0.5);
                min -= pad;
                max += pad;
            }
            let step = niceStep(max - min, Math.max(2, room));
            // spec step (e.g. 1 for outcomes 1, 2, 3): ticks only at its multiples
            if (fixed.step) step = Math.max(1, Math.ceil(step / fixed.step - 1e-9)) * fixed.step;
            const decimals = decimalsOf(step);
            if (extend) {
                if (fixed.min === null) min = Math.floor(min / step + 1e-9) * step;
                if (fixed.max === null) max = Math.ceil(max / step - 1e-9) * step;
            }
            for (let value = Math.ceil(min / step - 1e-9) * step; value <= max + step * 1e-6 && axis.major.length < 60; value += step) {
                const clean = Number(value.toFixed(Math.min(20, decimals)));
                axis.major.push({ at: clean, text: format ? format(clean) : (Math.abs(clean) >= 1e5 ? A.format.number(clean, { compact: true }) : A.format.number(clean, { maxDigits: decimals })) });
            }
            axis.min = min;
            axis.max = max;
            return axis;
        }

        // 10ⁿ written for an axis: plain numbers from 0.001 to 10,000, a power of ten beyond
        function powerText(power) {
            if (power >= -3 && power <= 4) return num(Math.pow(10, power), { digits: 1 });
            return "10" + superscript(power);
        }

        function drawChart(view, spec) {
            const g = view.ctx;
            const width = view.width;
            const height = view.height;
            if (!width || !height) return;
            const lk = A.labKit;
            const c = lk.colors();
            const xs = spec.x || {};
            const ys = spec.y || {};
            const series = (spec.series || []).filter(function (item) { return item && Array.isArray(item.data); });
            const marks = (spec.marks || []).filter(function (mark) { return mark && isNumber(mark.x); });
            const hlines = (spec.hlines || []).filter(function (line) { return line && isNumber(line.y); });
            const tx = function (value) { return !isNumber(value) ? NaN : xs.log ? (value > 0 ? Math.log10(value) : NaN) : value; };
            const ty = function (value) { return !isNumber(value) ? NaN : ys.log ? (value > 0 ? Math.log10(value) : NaN) : value; };
            g.clearRect(0, 0, width, height);

            // 1. The range of everything that is drawn
            const range = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity, points: 0 };
            const addX = function (value) {
                const v = tx(value);
                if (!isFinite(v)) return;
                range.x0 = Math.min(range.x0, v);
                range.x1 = Math.max(range.x1, v);
            };
            const addY = function (value) {
                const v = ty(value);
                if (!isFinite(v)) return;
                range.y0 = Math.min(range.y0, v);
                range.y1 = Math.max(range.y1, v);
            };
            series.forEach(function (item) {
                item.data.forEach(function (d) {
                    if (item.kind === "bars") {
                        if (isFinite(tx(d[0])) && isFinite(tx(d[1])) && isFinite(ty(d[2]))) range.points += 1;
                        addX(d[0]);
                        addX(d[1]);
                        addY(d[2]);
                        if (!ys.log) addY(0);
                    } else {
                        if (isFinite(tx(d[0])) && isFinite(ty(d[1]))) range.points += 1;
                        addX(d[0]);
                        addY(d[1]);
                        if (item.errors) {
                            addY(d[2]);
                            addY(d[3]);
                        }
                    }
                });
                (item.band || []).forEach(function (d) {
                    addX(d[0]);
                    addY(d[1]);
                    addY(d[2]);
                });
            });
            if (range.points) {
                hlines.forEach(function (line) { addY(line.y); });
                marks.forEach(function (mark) {
                    addX(mark.x);
                    if (isNumber(mark.y)) addY(mark.y);
                });
            }
            const stepOf = function (axis) { return !axis.log && axis.step > 0 && isFinite(axis.step) ? axis.step : null; };
            const fixedX = { min: isFinite(tx(xs.min)) ? tx(xs.min) : null, max: isFinite(tx(xs.max)) ? tx(xs.max) : null, step: stepOf(xs) };
            const fixedY = { min: isFinite(ty(ys.min)) ? ty(ys.min) : null, max: isFinite(ty(ys.max)) ? ty(ys.max) : null, step: stepOf(ys) };

            // 2. Room for the numbers and the axis names
            const top = CHART_PAD + (ys.labelKey ? CHART_FONT + 10 : 4);
            const bottom = CHART_FONT + 12 + (xs.labelKey ? CHART_FONT + 8 : 0);
            const plotHeight = Math.max(20, height - top - bottom);
            if (!range.points) {
                g.font = lk.font(CHART_FONT + 1, 500, "body");
                g.fillStyle = c.muted;
                g.textAlign = "center";
                g.textBaseline = "middle";
                g.fillText(t("research.kit.chartEmpty"), width / 2, height / 2);
                view.describe(t("research.kit.chartEmpty"));
                return;
            }
            const yAxis = makeAxis(range.y0, range.y1, Math.max(2, Math.floor(plotHeight / TICK_GAP_Y)), Boolean(ys.log), fixedY, ys.format, true);
            g.font = lk.font(CHART_FONT, 500, "mono");
            let labelWidth = 0;
            yAxis.major.forEach(function (tick) { labelWidth = Math.max(labelWidth, g.measureText(tick.text).width); });
            const left = Math.ceil(CHART_PAD + labelWidth + 8);
            const right = CHART_PAD + 10;
            const plotWidth = Math.max(20, width - left - right);
            const xAxis = makeAxis(range.x0, range.x1, Math.max(2, Math.floor(plotWidth / TICK_GAP_X)), Boolean(xs.log), fixedX, xs.format, false);
            const xAt = function (v) { return left + ((v - xAxis.min) / ((xAxis.max - xAxis.min) || 1)) * plotWidth; };
            const yAt = function (v) { return top + plotHeight - ((v - yAxis.min) / ((yAxis.max - yAxis.min) || 1)) * plotHeight; };
            const px = function (value) { return xAt(tx(value)); };
            const py = function (value) { return yAt(ty(value)); };

            // 3. The grid and the numbers on both axes
            g.lineWidth = 1;
            g.strokeStyle = lk.alpha(c.text, c.light ? 0.05 : 0.045);
            g.beginPath();
            yAxis.minor.forEach(function (at) {
                const y = Math.round(yAt(at)) + 0.5;
                g.moveTo(left, y);
                g.lineTo(left + plotWidth, y);
            });
            xAxis.minor.forEach(function (at) {
                const x = Math.round(xAt(at)) + 0.5;
                g.moveTo(x, top);
                g.lineTo(x, top + plotHeight);
            });
            g.stroke();
            g.strokeStyle = c.grid;
            g.fillStyle = c.muted;
            g.textAlign = "right";
            g.textBaseline = "middle";
            yAxis.major.forEach(function (tick) {
                const y = Math.round(yAt(tick.at)) + 0.5;
                if (y < top - 1 || y > top + plotHeight + 1) return;
                g.beginPath();
                g.moveTo(left, y);
                g.lineTo(left + plotWidth, y);
                g.stroke();
                g.fillText(tick.text, left - 8, y);
            });
            g.textBaseline = "top";
            g.textAlign = "left";
            let lastRight = -Infinity;
            xAxis.major.forEach(function (tick) {
                const x = Math.round(xAt(tick.at)) + 0.5;
                if (x < left - 1 || x > left + plotWidth + 1) return;
                g.strokeStyle = c.grid;
                g.beginPath();
                g.moveTo(x, top);
                g.lineTo(x, top + plotHeight);
                g.stroke();
                const textWidth = g.measureText(tick.text).width;
                const textX = A.util.clamp(x - textWidth / 2, 2, width - textWidth - 2);
                if (textX < lastRight + 8) return;      // it would touch the number before
                g.fillStyle = c.muted;
                g.fillText(tick.text, textX, top + plotHeight + 6);
                lastRight = textX + textWidth;
            });
            // the axes themselves, a little stronger
            g.strokeStyle = lk.alpha(c.text, c.light ? 0.3 : 0.28);
            g.beginPath();
            g.moveTo(left + 0.5, top);
            g.lineTo(left + 0.5, Math.round(top + plotHeight) + 0.5);
            g.lineTo(left + plotWidth, Math.round(top + plotHeight) + 0.5);
            g.stroke();

            // 4. Axis names (kept clear of the box's rounded corners)
            g.font = lk.font(CHART_FONT, 600, "body");
            g.fillStyle = c.muted;
            if (ys.labelKey) {
                g.textAlign = "left";
                g.textBaseline = "top";
                g.fillText(textOf(ys.labelKey), Math.max(CHART_CORNER, CHART_PAD), CHART_PAD - 2);
            }
            if (xs.labelKey) {
                g.textAlign = "right";
                g.textBaseline = "bottom";
                g.fillText(textOf(xs.labelKey), width - CHART_CORNER, height - 3);
            }

            // 5. Inside the plot: lines across, areas, bars, lines, points
            g.save();
            g.beginPath();
            g.rect(left - 1, top - 6, plotWidth + 7, plotHeight + 7);
            g.clip();
            hlines.forEach(function (line) {
                const y = Math.round(py(line.y)) + 0.5;
                if (!isFinite(y)) return;
                g.strokeStyle = line.color ? colorOf(line, c) : lk.alpha(c.text, 0.55);
                g.lineWidth = 1.25;
                g.setLineDash(line.dash === false ? [] : [5, 4]);
                g.beginPath();
                g.moveTo(left, y);
                g.lineTo(left + plotWidth, y);
                g.stroke();
            });
            g.setLineDash([]);
            series.forEach(function (item) {
                const color = colorOf(item, c);
                if (item.band && item.band.length > 1) {
                    const band = item.band.filter(function (d) { return isFinite(px(d[0])) && isFinite(py(d[1])) && isFinite(py(d[2])); });
                    if (band.length > 1) {
                        g.beginPath();
                        band.forEach(function (d, i) {
                            if (i) g.lineTo(px(d[0]), py(d[2]));
                            else g.moveTo(px(d[0]), py(d[2]));
                        });
                        for (let i = band.length - 1; i >= 0; i--) g.lineTo(px(band[i][0]), py(band[i][1]));
                        g.closePath();
                        g.fillStyle = lk.alpha(color, 0.16);
                        g.fill();
                    }
                }
                if (item.kind === "bars") {
                    const base = ys.log ? top + plotHeight : yAt(Math.max(yAxis.min, Math.min(yAxis.max, 0)));
                    item.data.forEach(function (d) {
                        const x0 = px(d[0]);
                        const x1 = px(d[1]);
                        const y = py(d[2]);
                        if (!isFinite(x0) || !isFinite(x1) || !isFinite(y)) return;
                        const barLeft = Math.min(x0, x1) + 0.5;
                        const barWidth = Math.max(1, Math.abs(x1 - x0) - 1);
                        g.fillStyle = lk.alpha(color, 0.38);
                        g.fillRect(barLeft, Math.min(y, base), barWidth, Math.abs(base - y));
                        g.strokeStyle = color;
                        g.lineWidth = 1;
                        g.strokeRect(barLeft, Math.min(y, base), barWidth, Math.abs(base - y));
                    });
                    return;
                }
                if (item.kind === "line" || item.kind === undefined) {
                    g.strokeStyle = color;
                    g.lineWidth = item.width || 2;
                    g.lineJoin = "round";
                    g.lineCap = "round";
                    g.setLineDash(item.dash ? [6, 4] : []);
                    g.beginPath();
                    let drawing = false;
                    item.data.forEach(function (d) {
                        const x = px(d[0]);
                        const y = py(d[1]);
                        if (!isFinite(x) || !isFinite(y)) {
                            drawing = false;
                            return;
                        }
                        if (drawing) g.lineTo(x, y);
                        else g.moveTo(x, y);
                        drawing = true;
                    });
                    g.stroke();
                    g.setLineDash([]);
                    if (!item.points) return;
                }
                // points (with error bars)
                item.data.forEach(function (d) {
                    const x = px(d[0]);
                    const y = py(d[1]);
                    if (!isFinite(x) || !isFinite(y)) return;
                    if (item.errors) {
                        const lo = py(d[2]);
                        const hi = py(d[3]);
                        if (isFinite(lo) && isFinite(hi)) {
                            g.strokeStyle = color;
                            g.lineWidth = 1.5;
                            g.beginPath();
                            g.moveTo(x, lo);
                            g.lineTo(x, hi);
                            g.moveTo(x - 4, lo);
                            g.lineTo(x + 4, lo);
                            g.moveTo(x - 4, hi);
                            g.lineTo(x + 4, hi);
                            g.stroke();
                        }
                    }
                    lk.marker(g, item.shape || "dot", x, y, 3.5, color);
                });
            });
            // vertical lines (marks without a y) and ringed points
            marks.forEach(function (mark) {
                const x = Math.round(px(mark.x)) + 0.5;
                if (!isFinite(x)) return;
                const color = mark.colorIndex !== undefined || mark.color ? colorOf(mark, c) : c.text;
                if (!isNumber(mark.y)) {
                    g.strokeStyle = lk.alpha(color, 0.5);
                    g.lineWidth = 1.25;
                    g.beginPath();
                    g.moveTo(x, top);
                    g.lineTo(x, top + plotHeight);
                    g.stroke();
                } else if (isFinite(py(mark.y))) {
                    lk.marker(g, "ring", x, py(mark.y), 5.5, color);
                }
            });
            g.restore();

            // 6. Labels of the lines across and of the marks, on a soft plate so they stay readable
            g.font = lk.font(CHART_FONT, 600, "mono");
            g.textBaseline = "middle";
            const plates = [];
            function plate(text, x, y, color, align) {
                if (!text) return;
                const textWidth = g.measureText(text).width;
                let boxX = align === "right" ? x - textWidth - 6 : x;
                boxX = A.util.clamp(boxX, left + 2, left + plotWidth - textWidth - 6);
                let boxY = A.util.clamp(y, top + 7, top + plotHeight - 7);
                // move off a label that is already there
                for (let tries = 0; tries < 4; tries++) {
                    const clash = plates.some(function (box) { return Math.abs(box.y - boxY) < 14 && boxX < box.x + box.w + 4 && box.x < boxX + textWidth + 10; });
                    if (!clash) break;
                    boxY = A.util.clamp(boxY + 15, top + 7, top + plotHeight - 7);
                }
                plates.push({ x: boxX, y: boxY, w: textWidth + 6 });
                g.fillStyle = lk.alpha(c.surface, 0.88);
                g.fillRect(boxX - 1, boxY - 8, textWidth + 8, 16);
                g.fillStyle = color;
                g.textAlign = "left";
                g.fillText(text, boxX + 3, boxY);
            }
            hlines.forEach(function (line) {
                const y = py(line.y);
                if (!isFinite(y) || y < top - 1 || y > top + plotHeight + 1) return;
                plate(labelOf(line), left + plotWidth - 2, y - 9, line.color ? colorOf(line, c) : c.muted, "right");
            });
            marks.forEach(function (mark) {
                const x = px(mark.x);
                if (!isFinite(x) || x < left - 1 || x > left + plotWidth + 1) return;
                const color = mark.colorIndex !== undefined || mark.color ? colorOf(mark, c) : c.text;
                if (!isNumber(mark.y)) plate(labelOf(mark), x + 5, top + 8, color, "left");
                else if (isFinite(py(mark.y))) plate(labelOf(mark), x + 8, py(mark.y) - 12, color, "left");
            });

            // 7. The text for screen readers
            view.describe(describeChart(spec, series, marks));
        }

        function describeChart(spec, series, marks) {
            if (typeof spec.describe === "function") return String(safeCall(spec.describe) || "");
            if (typeof spec.describe === "string") return spec.describe;
            const parts = [];
            series.forEach(function (item) {
                const points = item.data.filter(function (d) { return item.kind === "bars" ? isNumber(d[2]) : isNumber(d[0]) && isNumber(d[1]); });
                if (!points.length) return;
                const xValues = points.map(function (d) { return d[0]; });
                const yValues = points.map(function (d) { return item.kind === "bars" ? d[2] : d[1]; });
                parts.push(t("research.kit.chartSeries", {
                    name: labelOf(item) || t("research.kit.chart"),
                    count: A.plural("research.kit.chartPoints", points.length),
                    x0: num(Math.min.apply(null, xValues)),
                    x1: num(Math.max.apply(null, xValues)),
                    y0: num(Math.min.apply(null, yValues)),
                    y1: num(Math.max.apply(null, yValues))
                }));
            });
            marks.forEach(function (mark) {
                const label = labelOf(mark);
                if (label) parts.push(t("research.kit.chartMark", { label: label }));
            });
            return parts.join(" ") || t("research.kit.chartEmpty");
        }

        /* =========================================================
           9. LONG COMPUTATIONS (job)
           K.job(parent) -> { element, start(work, options), stop(), running() }
           work: { step(chunk) -> true when finished, progress (0..1, or a
           function that returns it) }: for example what M.bootstrapStart gives.
           The job calls step() again and again for at most about 12 ms, then
           lets the page breathe, shows how far it is, and has a "Stop" button.
           It waits while the tool is not on screen (ctx.visible()), and stops
           by itself when the tool closes.
             options: chunk (what step() is given, default 100),
                      onDone(), onStop(), onProgress(share),
                      quiet (true: no "Done." at the end; the tool announces its own result)
           ========================================================= */
        function job(parent) {
            const element = el("div", "rk-job");
            element.hidden = true;
            const bar = el("div", "rk-job-bar", { role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" });
            const fill = el("span", "rk-job-fill");
            bar.appendChild(fill);
            const text = el("span", "rk-job-text");
            const stopButton = A.labKit.button("research.kit.jobStop", { variant: "ghost", size: "sm", onClick: function () { stop(true); } });
            stopButton.element.classList.add("rk-job-stop");
            element.append(bar, text, stopButton.element);
            if (parent) parent.appendChild(element);
            texts.bind(bar, "research.kit.jobProgress", "aria-label");

            let active = null;       // { work, settings }
            let timer = 0;

            function share() {
                if (!active) return 0;
                const value = typeof active.work.progress === "function" ? active.work.progress() : active.work.progress;
                return isNumber(value) ? A.util.clamp(value, 0, 1) : 0;
            }

            function paint(paused) {
                const percent = Math.floor(share() * 100);
                fill.style.setProperty("--share", (share()).toFixed(3));
                bar.setAttribute("aria-valuenow", String(percent));
                A.dom.setText(text, paused ? t("research.kit.jobPaused") : t("research.kit.jobRunning", { percent: num(percent) + "%" }));
                element.classList.toggle("is-paused", Boolean(paused));
            }

            function visible() {
                return !ctx || typeof ctx.visible !== "function" || ctx.visible();
            }

            function slice() {
                timer = 0;
                if (!active || destroyed) return;
                if (!visible()) {
                    paint(true);
                    timer = setTimeout(slice, JOB_PAUSE_POLL);
                    return;
                }
                const until = performance.now() + JOB_SLICE;
                let finished = false;
                try {
                    do {
                        finished = active.work.step(active.settings.chunk || 100) === true;
                    } while (!finished && performance.now() < until);
                } catch (error) {
                    report(error);
                    stop(true);
                    return;
                }
                paint(false);
                safeCall(active.settings.onProgress, share());
                if (finished) {
                    const done = active.settings.onDone;
                    const quietly = Boolean(active.settings.quiet);
                    active = null;
                    element.hidden = true;
                    safeCall(done);
                    // quiet: the tool announces its own end (the station says what the study found)
                    if (!quietly) announce(t("research.kit.jobDone"));
                } else {
                    timer = setTimeout(slice, 0);
                }
            }

            // byHand: the Stop button (it says "Stopped."); a new start or closing the tool is quiet
            function stop(byHand) {
                clearTimeout(timer);
                timer = 0;
                if (!active) return;
                const stopped = active.settings.onStop;
                active = null;
                element.hidden = true;
                if (byHand) announce(t("research.kit.jobStopped"));
                safeCall(stopped);
            }

            const api = {
                element: element,
                start: function (work, options) {
                    stop(false);
                    if (!work || typeof work.step !== "function") return;
                    active = { work: work, settings: options || {} };
                    element.hidden = false;
                    paint(false);
                    timer = setTimeout(slice, 0);
                },
                stop: function () { stop(true); },
                running: function () { return Boolean(active); },
                quiet: function () { stop(false); },
                // a language switch: the line in the new language (also while it is hidden, so no
                // old words stay in the page)
                language: function () { paint(element.classList.contains("is-paused")); }
            };
            jobs.push(api);
            return api;
        }

        /* =========================================================
           10. PARTS (tabs inside a tool)
           K.parts(parent, { name, labelKey, items: [{ id, labelKey }], value, onChange })
           -> { element, panels: { <id>: element }, current(), select(id, focus) }
           A tool with several small calculators shows one at a time. The arrow keys
           move between the tabs; the open part is saved (ctx.store, under name).
           ========================================================= */
        function parts(parent, options) {
            const s = Object.assign({ name: "part" }, options);
            const items = s.items || [];
            const ids = items.map(function (item) { return item.id; });
            const element = el("div", "rk-parts");
            const tablist = el("div", "rk-parts-tabs", { role: "tablist" });
            texts.bind(tablist, s.labelKey || "research.kit.parts", "aria-label");
            const panelsBox = el("div", "rk-parts-panels");
            element.append(tablist, panelsBox);
            if (parent) parent.appendChild(element);
            const tabs = {};
            const panelsById = {};
            items.forEach(function (item, index) {
                const tabId = uid();
                const panelId = uid();
                const tab = el("button", "rk-part-tab", { type: "button", role: "tab", id: tabId, "aria-controls": panelId, "data-part": item.id });
                const number = el("span", "rk-part-num", { "aria-hidden": "true" });
                number.textContent = String(index + 1);
                const label = el("span", "rk-part-label");
                texts.bind(label, item.labelKey);
                tab.append(number, label);
                tab.addEventListener("click", function () { select(item.id, false, true); });
                tablist.appendChild(tab);
                const box = el("div", "rk-part", { role: "tabpanel", id: panelId, "aria-labelledby": tabId, "data-part": item.id });
                panelsBox.appendChild(box);
                tabs[item.id] = tab;
                panelsById[item.id] = box;
            });

            tablist.addEventListener("keydown", function (event) {
                const index = ids.indexOf(document.activeElement && document.activeElement.getAttribute("data-part"));
                if (index === -1) return;
                let next = -1;
                if (event.key === "ArrowRight") next = (index + 1) % ids.length;
                else if (event.key === "ArrowLeft") next = (index - 1 + ids.length) % ids.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = ids.length - 1;
                if (next === -1) return;
                event.preventDefault();
                select(ids[next], true, true);
            });

            let current = null;
            function select(id, focus, byHand) {
                if (ids.indexOf(id) === -1) return;
                const changed = id !== current;
                current = id;
                ids.forEach(function (other) {
                    const on = other === id;
                    tabs[other].setAttribute("aria-selected", String(on));
                    tabs[other].tabIndex = on ? 0 : -1;
                    panelsById[other].hidden = !on;
                });
                if (focus) tabs[id].focus();
                if (byHand) store().set(s.name, id);
                if (changed && byHand) safeCall(s.onChange, id);
            }

            const saved = store().get(s.name, undefined, function (value) { return ids.indexOf(value) !== -1; });
            select(saved || s.value || ids[0], false, false);
            return {
                element: element,
                panels: panelsById,
                current: function () { return current; },
                select: function (id, focus) { select(id, focus, true); }
            };
        }

        /* =========================================================
           THE LIFE CYCLE OF THE KIT OF ONE TOOL
           ========================================================= */
        // The language changed: every text again, fields with the new decimal mark,
        // the lab kit's controls, the charts (their numbers are written the local way)
        function language() {
            if (destroyed) return;
            texts.all();
            fields.forEach(function (item) { item.language(); });
            sources.forEach(function (item) { item.language(); });
            tables.forEach(function (item) { item.language(); });
            relabelRoots.forEach(function (root) { if (root.isConnected) A.labKit.relabel(root); });
            charts.forEach(function (item) { item.language(); });
            jobs.forEach(function (item) { item.language(); });
            panels.forEach(function (item) { item.clearMessage(); });
        }

        // The look changed: the charts read the colours again and draw again
        function theme() {
            if (destroyed) return;
            A.labKit.colors.invalidate();
            charts.forEach(function (item) { item.draw(); });
        }

        function destroy() {
            if (destroyed) return;
            jobs.forEach(function (item) { item.quiet(); });
            charts.forEach(function (item) { item.destroy(); });
            cleanups.forEach(function (callback) { safeCall(callback); });
            destroyed = true;
            texts.clear();
            fields.length = 0;
            charts.length = 0;
            jobs.length = 0;
            panels.length = 0;
            relabelRoots.length = 0;
            sources.length = 0;
            tables.length = 0;
        }

        const K = {
            panel: panel,
            parts: parts,
            field: field,
            list: list,
            choice: choice,
            toggle: toggle,
            result: result,
            verdict: verdict,
            remark: remark,
            formula: formula,
            source: source,
            table: table,
            chart: chart,
            job: job,
            unitExists: unitExists,
            // Write a text into an element now and after each language switch
            text: function (element, label, attribute) {
                texts.bind(element, label, attribute);
                return element;
            },
            onDestroy: function (callback) { cleanups.push(callback); },
            language: language,
            theme: theme,
            destroy: destroy,
            // What create() returns, when the tool needs nothing else: refresh() writes the results again
            controller: function (refresh) {
                return {
                    language: function () {
                        language();
                        safeCall(refresh);
                    },
                    theme: theme,
                    destroy: destroy
                };
            }
        };
        if (ctx && typeof ctx.onClose === "function") ctx.onClose(destroy);
        return K;
    }

    /* =========================================================
       11. AICompass.researchKit
       ========================================================= */
    A.feature("researchKit", {
        use: use,
        num: num,
        interval: interval,
        parse: parse,
        parseList: parseList,
        inputText: inputText,
        superscript: superscript,
        DASH: DASH
    });
})();
