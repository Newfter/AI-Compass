/* =========================================================
   AI COMPASS — THE LAB KIT (AICompass.labKit, called "kit" in experiments)
   The shared parts that every AI Lab experiment is built from: controls,
   displays, the "What's happening?" panel, "Try this" challenges,
   canvases, charts, colours, a frame loop, random numbers, saved
   settings and screen-reader messages. The lab hub loads this file
   (after css/lab/kit.css and js/content/lab/kit.js) before the first
   experiment opens. Everything is built with the core toolkit (js/core.js).
   js/lab/sample.js is a small experiment that uses most of it: copy it.

   LABELS. Wherever a builder asks for a label, give a translation key
   ("lab.kit.play") or a function that returns the text, for text that
   changes: function () { return t("lab.sample.steps", { n: steps }); }.
   Keys follow a language switch by themselves (core re-translates
   data-i18n). Functions, numbers and glossary links are written again by
   kit.relabel(stage): every experiment calls it in its language().
   Each builder returns an object with the element to put on the page
   ({ element, ... }); builders that take "children" accept those objects too.

   THE KIT AT A GLANCE (each part is explained where it is written)
   Controls
     button(label, { icon, variant, size, title, pressed, onClick })
         variant "primary" | "ghost" (default) | "subtle" | "danger";  size "md" | "sm"
         -> { element, setLabel(label), setIcon(name), setPressed(on), pressed(), setBusy(on), setDisabled(on) }
         kit.button("lab.kit.step", { icon: "step", onClick: stepOnce })
     iconButton(icon, label, options)         a square button; the label is its name and its tooltip
     segmented({ labelKey, options: [{ value, labelKey, icon }], value, onChange })
         -> { element, value(), set(value), setDisabled(on) }      (arrow keys move the choice)
     slider({ labelKey, min, max, step, value, format, describe, hintKey, log, steps, onInput, onChange })
         -> { element, input, value(), set(value), setDisabled(on) }      (log: true for 0.0001 ... 1)
     toggle({ labelKey, checked, hintKey, onChange }) -> { element, checked(), set(on), setDisabled(on) }
     select({ labelKey, options: [{ value, labelKey or label }], value, hintKey, onChange })
         -> { element, select, value(), set(value), setOptions(options, value), setDisabled(on) }
     chips({ labelKey, options: [{ value, labelKey or label, colorIndex, icon }], value, values, multi, onChange })
         -> { element, value(), values(), set(valueOrValues), setDisabled(on) }
   Displays
     stat({ labelKey, value, format, trend, better }) -> { element, set(value, trend), value() }
     status(state) -> { element, set(state) }           "ready" | "running" | "paused" | "done"
     legend([{ labelKey or label, colorIndex or color, shape }]) -> { element, update(items) }
     bars(parent, { items: [{ label or labelKey, value, colorIndex }], format, max, signed })
         -> { element, update(items, { max }) }
   Teaching
     explain({ titleKey, steps: [{ key, values }], open })
         -> { element, setStep(i, values), setValues(i, values), setText(key, values), setOpen(on) }
     challenges({ ctx, items: [{ key, check(info), insightKey }], titleKey, onComplete })
         -> { element, check(info), complete(i), isDone(i), count(), reset() }
     hint({ key, values, tone: "info" | "tip" | "warn", dismissible }) -> { element, set(key, values), show(), hide() }
     termLink(id, labelKey) -> element        a glossary link (plain text until the glossary has the term)
   Layout
     layout(stage, { side }) -> { root, top, main, side, bottom }
     toolbar(children)    row(children, { grid })    group(labelKey, children, { plain })
   Canvas, colours, drawing
     canvas(parent, { aspect, height, minHeight, maxHeight, labelKey })
         -> { canvas, ctx, width, height, dpr, onResize(callback), describe(text), destroy() }
     colors() -> { bg, surface, grid, text, muted, accent, accent2, accent3, success, warning, danger, series[8], light }
     colors.invalidate()     alpha(color, amount)     font(size, weight, family)
     scale(t) / scale.rgb(t)          0..1  -> faint ... strong (one colour family)
     diverge(t) / diverge.rgb(t)     -1..1  -> red ... neutral ... cyan
     drawGrid(ctx, width, height, step)     marker(ctx, shape, x, y, radius, color)     shapes
     lineChart(canvasView, { series: [{ values, colorIndex, labelKey, faint, fill, points, marks }],
               x0, xStep, yMin, yMax, log, highlightX, format, xFormat, xLabelKey, yLabelKey }) -> { draw(), set(changes) }
   Running, chance, saving, messages
     loop({ update(stepMs), draw(info), rate, stepMs, budget }) -> { start(), stop(), running(), step(), setRate(rate) }
     rng(seed) -> { seed, next(), range(a, b), int(n), normal(mean, sd), pick(list), shuffle(list) }     newSeed()
     store(id) -> { get(name, fallback, check), set(name, value), remove(name) }      key "lab.<id>.<name>"
     announcer({ minGap }) -> { say(text, { urgent }), cancel() }
     number(value)     a number the kit's way: local, never "0" for a small one (0.0042, 4.2×10⁻⁵)
     relabel(root)     icons (the SVG of each icon name)

   SAVED CHALLENGES (the hub reads these for its "2 / 4" chips, before this file loads):
     A.storage key "lab.<id>.challenges" = { v: 1, total: 4, done: ["lab.<id>.ch1", ...] }
     (done lists the translation keys of the finished challenges)

   Sections of this file:
    1. Settings                          7. Layout
    2. Small helpers: elements, labels   8. Canvas and colours
    3. Icons and buttons                 9. Drawing and the line chart
    4. Controls                         10. Loop, random numbers, storage, announcer
    5. Displays                         11. AICompass.labKit
    6. Teaching
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || A.labKit) return;      // loaded twice by mistake: the first copy stays

    const t = A.t;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
    // ----- The loop -----
    const FRAME_BUDGET = 8;              // ms of update() steps in one frame, at most (the page stays smooth)
    const MAX_FRAME_GAP = 100;           // ms: after a longer gap (a slow frame, a hidden tab) the loop doesn't catch up
    const DEFAULT_RATE = 60;             // steps per second, when an experiment doesn't say
    const DEFAULT_STEP_MS = 1000 / 60;   // the length of one step, as update(stepMs) gets it

    // ----- Numbers on screen -----
    const COUNT_UP_MS = 600;             // a stat tile counts up to a new number in this time...
    const FAST_UPDATES_MS = 250;         // ...unless its last change was less than this long ago (then it is written at once)
    const SMALL_NUMBER = 0.01;           // below this, kit.number() keeps 2 significant digits ("0.0042"), never "0"...
    const TINY_NUMBER = 0.0001;          // ...and below this it writes a power of ten ("4.2×10⁻⁵"), which stays short

    // ----- Screen-reader messages -----
    const ANNOUNCE_GAP = 1200;           // ms: at most one message this often (a newer one replaces one that waits)
    const REPEAT_WINDOW = 5000;          // ms: the same message again within this time is not said again

    // ----- Colours -----
    const SERIES_COUNT = 8;              // categorical colours: --lk-series-1 ... --lk-series-8 in css/lab/kit.css
    const SCALE_STEPS = 256;             // each colour scale is a table of this many ready-made colours
    const GRID_ALPHA = { dark: 0.07, light: 0.09 };   // how strong the faint canvas grid lines are
    const SHAPES = ["dot", "square", "triangle", "diamond", "ring"];   // marker shapes, a second clue next to colour

    // ----- Charts -----
    const CHART_FONT = 11;               // px: the smallest text the kit draws on a canvas
    const CHART_PAD = 8;                 // px of room around the plot
    const TICK_GAP_X = 64;               // px: about this much room for each number along the bottom...
    const TICK_GAP_Y = 34;               // ...and along the side
    const FAINT_ALPHA = 0.35;            // a "faint" series (raw values under a smoothed line) is this see-through
    const CORNER = 12;                   // px kept free at the canvas box's rounded corners (css/lab/kit.css)

    // ----- Saved challenges ("lab.<id>.challenges" in the experiment's store) -----
    const CHALLENGE_KEY = "challenges";
    const CHALLENGE_VERSION = 1;

    /* =========================================================
       2. SMALL HELPERS: ELEMENTS, LABELS, RELABEL
       ========================================================= */
    let idCounter = 0;

    // A new id, to link a label to its control: "lk-17"
    function uid() {
        idCounter += 1;
        return "lk-" + idCounter;
    }

    // Makes an element: el("button", "lk-btn", { type: "button" })
    function el(tag, className, attributes) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        Object.keys(attributes || {}).forEach(function (name) {
            element.setAttribute(name, attributes[name]);
        });
        return element;
    }

    // Builders take page elements, or kit objects that carry one ({ element })
    function nodeOf(item) {
        return item && item.element ? item.element : item;
    }

    function appendAll(parent, children) {
        (children || []).forEach(function (child) {
            const node = nodeOf(child);
            if (node) parent.appendChild(node);
        });
        return parent;
    }

    function isNumber(value) {
        return typeof value === "number" && isFinite(value);
    }

    // "1e-7" -> 7, "0.25" -> 2, "3" -> 0: how many decimals a step needs
    function decimalsOf(value) {
        const text = String(value);
        const exponent = text.indexOf("e-");
        if (exponent !== -1) return Number(text.slice(exponent + 2));
        const dot = text.indexOf(".");
        return dot === -1 ? 0 : text.length - dot - 1;
    }

    // ----- Texts that follow the language -----
    // kit.relabel(root) asks every element inside root that has "updaters" to write its
    // texts again. They live in a WeakMap: an element that leaves the page takes its
    // updaters with it, so there is nothing to clean up and nothing kept alive.
    // Each element has named slots ("text", "aria-label"...), so binding again replaces.
    const updaters = new WeakMap();

    function setUpdater(element, slot, update) {
        let slots = updaters.get(element);
        if (!slots) {
            slots = {};
            updaters.set(element, slots);
        }
        if (update) slots[slot] = update;
        else delete slots[slot];
        element.setAttribute("data-lk-relabel", "");
    }

    // The text of a label: a translation key, or a function that returns the text
    function labelText(label, values) {
        if (typeof label === "function") return String(label());
        return label ? t(label, values) : "";
    }

    // Writes a text into an element, but only when it changed. Our texts may hold simple
    // HTML (<strong>), like every text of the site; plain ones are set as plain text.
    function writeText(element, text) {
        if (text.indexOf("<") === -1 && text.indexOf("&") === -1) {
            if (element.firstElementChild || element.textContent !== text) element.textContent = text;
        } else if (element.innerHTML !== text) {
            element.innerHTML = text;
        }
    }

    // Shows a label in an element. A key gets data-i18n, so core translates it again by
    // itself; a function is asked again by kit.relabel().
    function bindText(element, label) {
        if (typeof label === "function") {
            element.removeAttribute("data-i18n");
            const update = function () { writeText(element, String(label())); };
            setUpdater(element, "text", update);
            update();
            return;
        }
        setUpdater(element, "text", null);
        if (label) {
            element.setAttribute("data-i18n", label);
            writeText(element, t(label));
        } else {
            element.removeAttribute("data-i18n");
            element.textContent = "";
        }
    }

    // The text of a list item: "labelKey" (a key or a function) or "label" (plain words, such as data)
    function bindItemText(element, item) {
        if (item.labelKey) bindText(element, item.labelKey);
        else bindText(element, function () { return item.label === undefined ? "" : String(item.label); });
    }

    // data-i18n-attr="aria-label:key,title:key": core translates these attributes by itself
    function setAttributeKey(element, attribute, key) {
        const pairs = (element.getAttribute("data-i18n-attr") || "").split(",").filter(function (pair) {
            return pair && pair.split(":")[0].trim() !== attribute;
        });
        if (key) pairs.push(attribute + ":" + key);
        if (pairs.length) element.setAttribute("data-i18n-attr", pairs.join(","));
        else element.removeAttribute("data-i18n-attr");
    }

    // The same as bindText(), for an attribute such as aria-label or title
    function bindAttribute(element, attribute, label) {
        if (typeof label === "function") {
            setAttributeKey(element, attribute, null);
            const update = function () { element.setAttribute(attribute, String(label())); };
            setUpdater(element, attribute, update);
            update();
            return;
        }
        setUpdater(element, attribute, null);
        setAttributeKey(element, attribute, label || null);
        if (label) element.setAttribute(attribute, t(label));
        else element.removeAttribute(attribute);
    }

    // ----- Numbers -----
    // kit.number(value): how the kit writes a number when the experiment gives no format of
    // its own (stat tiles, bars, chart labels, {placeholders}). The local way ("0,25" in
    // Russian), up to 3 decimals, and never "0" for a number that isn't 0: a loss of 0.00042
    // must not read as "no loss at all". Below 0.01 it keeps 2 significant digits (0.0042,
    // 0.00017); below 0.0001 it uses a power of ten (4.2×10⁻⁵, 10⁻⁶), so it stays short.
    const SUPERSCRIPT = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };

    function number(value) {
        const size = Math.abs(value);
        if (!(size > 0) || size >= SMALL_NUMBER || !isFinite(size)) return A.format.number(value);
        let power = Math.floor(Math.log10(size));          // 0.0042 -> -3
        if (size >= TINY_NUMBER) return A.format.number(value, { maxDigits: 1 - power });
        let mantissa = Number((size / Math.pow(10, power)).toFixed(1));     // 4.2
        if (mantissa >= 10) {               // 9.97 rounds up to 10.0: that is 1.0 of the next power
            mantissa = 1;
            power += 1;
        }
        const exponent = String(power).split("").map(function (digit) { return SUPERSCRIPT[digit]; }).join("");
        return (value < 0 ? "−" : "") + (mantissa === 1 ? "" : A.format.number(mantissa, { maxDigits: 1 }) + "×") + "10" + exponent;
    }

    // Values for {placeholders}: numbers are written with kit.number() ("0,25" in Russian), and
    // words are escaped, because the texts around them may hold HTML
    function formatValues(values) {
        const out = {};
        Object.keys(values || {}).forEach(function (name) {
            const value = values[name];
            out[name] = typeof value === "number" ? number(value) : A.escapeHTML(value);
        });
        return out;
    }

    // A text without its HTML tags (for screen-reader messages)
    function plain(text) {
        return String(text).replace(/<[^>]*>/g, "");
    }

    // Writes every text inside root again in the current language: keys (core does that
    // too), functions, numbers and glossary links. Experiments call it in language().
    function relabel(root) {
        if (!root) return;
        A.applyTranslations(root);
        const elements = [root].concat(Array.prototype.slice.call(root.querySelectorAll("[data-lk-relabel]")));
        elements.forEach(function (element) {
            const slots = updaters.get(element);
            if (!slots) return;
            Object.keys(slots).forEach(function (slot) { slots[slot](); });
        });
    }

    // ----- A label, a control and an optional hint under it -----
    // <div class="lk-field"><label class="lk-label">…</label> (control) <p class="lk-help">…</p></div>
    function field(labelKey, options) {
        const settings = options || {};
        const element = el("div", "lk-field");
        const label = el(settings.forId ? "label" : "span", "lk-label", { id: uid() });
        if (settings.forId) label.setAttribute("for", settings.forId);
        bindText(label, labelKey);
        if (settings.hideLabel) label.classList.add("sr-only");
        element.appendChild(label);
        return { element: element, label: label };
    }

    // A small hint under a control, read out by screen readers with the control
    function addHelp(control, container, hintKey) {
        const help = el("p", "lk-help", { id: uid() });
        bindText(help, hintKey);
        container.appendChild(help);
        const ids = (control.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
        control.setAttribute("aria-describedby", ids.concat(help.id).join(" "));
        return help;
    }

    function indexOfValue(items, value) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].value === value) return i;
        }
        return -1;
    }

    // The CSS colour of series i (it follows the theme by itself)
    function seriesVar(index) {
        const i = Math.abs(Math.round(Number(index) || 0)) % SERIES_COUNT;
        return "var(--lk-series-" + (i + 1) + ")";
    }

    /* =========================================================
       3. ICONS AND BUTTONS
       ========================================================= */
    // Line icons in the site's style (24 x 24, currentColor). kit.icons has the whole <svg>.
    const ICON_PATHS = {
        play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
        pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/>',
        step: '<path d="M6 5.5v13l9-6.5z" fill="currentColor"/><rect x="16" y="5.5" width="2.6" height="13" rx="1" fill="currentColor"/>',
        reset: '<path d="M5 12a7 7 0 1 0 2.1-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4.5 3.5v4.5H9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
        shuffle: '<path d="M4 7h3.5c4.5 0 4.5 10 9 10H20M4 17h3.5c1.6 0 2.6-1.3 3.4-3M20 7h-3.5c-1.6 0-2.6 1.3-3.4 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        dice: '<rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="9" r="1.6" fill="currentColor"/><circle cx="15" cy="15" r="1.6" fill="currentColor"/><circle cx="15" cy="9" r="1.6" fill="currentColor"/><circle cx="9" cy="15" r="1.6" fill="currentColor"/>',
        check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
        close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
        plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
        minus: '<path d="M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
        undo: '<path d="M9 7H4.5V2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 7a8 8 0 1 1-1 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
        trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        sparkle: '<path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z" fill="currentColor"/>',
        info: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v5.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.3" fill="currentColor"/>',
        tip: '<path d="M9 17.5h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        warn: '<path d="M12 3.5 21.5 20h-19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9.5v5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.3" r="1.3" fill="currentColor"/>',
        chevron: '<path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
        up: '<path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
        down: '<path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
        flat: '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
    };

    // The <svg> of an icon name ("play"), or the markup itself if it is already an <svg>
    function iconSVG(name) {
        if (!name) return "";
        if (String(name).indexOf("<svg") === 0) return name;
        const paths = ICON_PATHS[name];
        if (!paths) return "";
        return '<svg class="lk-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' + paths + "</svg>";
    }

    const icons = {};
    Object.keys(ICON_PATHS).forEach(function (name) { icons[name] = iconSVG(name); });

    // A button. pressed: true/false makes a toggle button (aria-pressed) that flips itself
    // on each press; use it for an on/off whose label stays the same ("Show trails").
    // A button whose label changes (Play / Pause) is a plain button: change its label.
    // setBusy(true) shows a spinner and ignores presses, but keeps the keyboard focus.
    function button(label, options) {
        const settings = options || {};
        const element = el("button", "lk-btn lk-btn-" + (settings.variant || "ghost") + " lk-btn-" + (settings.size || "md"), { type: "button" });
        const iconBox = el("span", "lk-btn-icon", { "aria-hidden": "true" });
        const text = el("span", "lk-btn-text");
        element.append(iconBox, text);

        const api = {
            element: element,
            setLabel: function (newLabel) { bindText(text, newLabel); },
            setIcon: function (name) {
                iconBox.innerHTML = iconSVG(name);
                iconBox.hidden = !iconBox.firstChild;
            },
            setPressed: function (on) { element.setAttribute("aria-pressed", String(Boolean(on))); },
            pressed: function () { return element.getAttribute("aria-pressed") === "true"; },
            setBusy: function (on) {
                element.classList.toggle("is-busy", Boolean(on));
                if (on) {
                    element.setAttribute("aria-busy", "true");
                    element.setAttribute("aria-disabled", "true");
                } else {
                    element.removeAttribute("aria-busy");
                    element.removeAttribute("aria-disabled");
                }
            },
            setDisabled: function (on) { element.disabled = Boolean(on); }
        };

        api.setIcon(settings.icon);
        api.setLabel(label);
        if (settings.title) bindAttribute(element, "title", settings.title);
        if (settings.pressed !== undefined) api.setPressed(settings.pressed);

        element.addEventListener("click", function (event) {
            if (element.getAttribute("aria-disabled") === "true") return;
            if (settings.pressed !== undefined) api.setPressed(!api.pressed());
            if (settings.onClick) settings.onClick(event, api);
        });
        return api;
    }

    // A square button with only an icon. Its label is its accessible name and its tooltip.
    function iconButton(icon, label, options) {
        const api = button(label, Object.assign({}, options, { icon: icon }));
        api.element.classList.add("lk-btn-square");
        api.element.querySelector(".lk-btn-text").classList.add("sr-only");
        const setText = api.setLabel;
        api.setLabel = function (newLabel) {
            setText(newLabel);
            bindAttribute(api.element, "title", newLabel);
        };
        api.setLabel(label);
        return api;
    }

    /* =========================================================
       4. CONTROLS: SEGMENTED, SLIDER, TOGGLE, SELECT, CHIPS
       Every control has a visible label (hideLabel: true keeps it for
       screen readers only) and works with the mouse, touch and keyboard.
       set(...) changes a control without calling onChange.
       ========================================================= */
    // A row of connected options, one of them chosen: a radio group. Tab enters the group
    // on the chosen option; the arrow keys (and Home / End) choose another one.
    function segmented(options) {
        const settings = options || {};
        const items = settings.options || [];
        const box = field(settings.labelKey, { hideLabel: settings.hideLabel });
        const group = el("div", "lk-seg", { role: "radiogroup", "aria-labelledby": box.label.id });
        let current = settings.value === undefined && items.length ? items[0].value : settings.value;

        const buttons = items.map(function (item, index) {
            const option = el("button", "lk-seg-option", { type: "button", role: "radio" });
            option.innerHTML = iconSVG(item.icon);
            const text = el("span", "lk-seg-text");
            bindItemText(text, item);
            option.appendChild(text);
            option.addEventListener("click", function () { choose(index, false); });
            group.appendChild(option);
            return option;
        });

        // The chosen option is the one that Tab reaches (a "roving" tabindex)
        function paint() {
            const chosen = indexOfValue(items, current);
            buttons.forEach(function (option, index) {
                option.setAttribute("aria-checked", String(index === chosen));
                option.tabIndex = index === (chosen === -1 ? 0 : chosen) ? 0 : -1;
            });
        }

        function choose(index, moveFocus) {
            if (moveFocus) buttons[index].focus();
            if (items[index].value === current) return;
            current = items[index].value;
            paint();
            if (settings.onChange) settings.onChange(current);
        }

        group.addEventListener("keydown", function (event) {
            const index = buttons.indexOf(document.activeElement);
            if (index === -1) return;
            const last = buttons.length - 1;
            let next = -1;
            if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
            else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = last;
            if (next === -1 || buttons[next].disabled) return;
            event.preventDefault();
            choose(next, true);
        });

        paint();
        box.element.appendChild(group);
        return {
            element: box.element,
            value: function () { return current; },
            set: function (value) {
                current = value;
                paint();
            },
            setDisabled: function (on) {
                buttons.forEach(function (option) { option.disabled = Boolean(on); });
            }
        };
    }

    // A slider (a native <input type="range">, so every keyboard and screen reader knows it).
    // format(value) is the number shown next to the label ("0.05"); describe(value) is what
    // screen readers hear (default: the same). onInput runs while dragging, onChange at the end.
    // log: true is for values that span many sizes (a learning rate from 0.0001 to 2): the
    // handle moves through powers of ten, so each step multiplies the value by the same
    // amount ("steps" of them from min to max, default 100). The number shown keeps 2
    // significant digits (0.0013, 0.35, 1.5); value() gives the exact value.
    function slider(options) {
        const settings = options || {};
        const min = Number(settings.min === undefined ? 0 : settings.min);
        const max = Number(settings.max === undefined ? 1 : settings.max);
        const log = Boolean(settings.log) && min > 0 && max > min;
        // The input's own numbers: the values, or their powers of ten (0.001 -> -3, 1 -> 0)
        const low = log ? Math.log10(min) : min;
        const high = log ? Math.log10(max) : max;
        const step = log ? (high - low) / (settings.steps || 100) : Number(settings.step || (max - min) / 100);
        const decimals = Math.max(decimalsOf(step), decimalsOf(min));
        const format = settings.format || function (value) {
            if (log) return A.format.number(Number(value.toPrecision(2)), { maxDigits: 8 });
            return A.format.number(value, { digits: decimals });
        };
        const describe = settings.describe || format;

        const id = uid();
        const box = field(settings.labelKey, { forId: id, hideLabel: settings.hideLabel });
        box.element.classList.add("lk-slider");
        const head = el("div", "lk-slider-head");
        const output = el("span", "lk-slider-value", { "aria-hidden": "true" });     // the input says the value itself
        head.append(box.label, output);
        const input = el("input", "ui-range lk-range", { type: "range", id: id, min: low, max: high, step: step });
        box.element.append(head, input);
        if (settings.hintKey) addHelp(input, box.element, settings.hintKey);

        // A value and its place on the input (its power of ten on a log slider)
        function toInput(value) {
            return log ? Math.log10(value) : value;
        }

        function fromInput(place) {
            return log ? Math.pow(10, place) : place;
        }

        // The nearest allowed value, without rounding noise (0.1 + 0.2 = 0.30000000000000004)
        function snap(raw) {
            const place = toInput(A.util.clamp(Number(raw), min, max));
            const steps = Math.round((place - low) / step);
            const snapped = A.util.clamp(low + steps * step, low, high);
            return log ? A.util.clamp(fromInput(snapped), min, max) : Number(snapped.toFixed(decimals));
        }

        let value = snap(settings.value === undefined ? min : settings.value);

        function show() {
            if (Math.abs(Number(input.value) - toInput(value)) > step / 2) input.value = String(toInput(value));
            output.textContent = format(value);
            input.setAttribute("aria-valuetext", describe(value));
            // How much of the line is coloured (.ui-range in css/components.css)
            input.style.setProperty("--fill", (((toInput(value) - low) / (high - low || 1)) * 100).toFixed(1) + "%");
        }

        function readInput() {
            return snap(fromInput(Number(input.value)));
        }

        input.addEventListener("input", function () {
            value = readInput();
            show();
            if (settings.onInput) settings.onInput(value);
        });
        input.addEventListener("change", function () {
            value = readInput();
            show();
            if (settings.onChange) settings.onChange(value);
        });
        setUpdater(input, "value", show);       // numbers are written the local way
        show();

        return {
            element: box.element,
            input: input,
            value: function () { return value; },
            set: function (newValue) {
                value = snap(newValue);
                show();
            },
            setDisabled: function (on) {
                input.disabled = Boolean(on);
                box.element.classList.toggle("is-disabled", Boolean(on));
            }
        };
    }

    // An on/off switch (a button with role="switch"; the track and the knob are .ui-switch
    // from css/components.css)
    function toggle(options) {
        const settings = options || {};
        const element = el("div", "lk-field lk-toggle");
        const control = el("button", "lk-switch ui-switch", { type: "button", role: "switch" });
        control.innerHTML = '<span class="ui-switch-track" aria-hidden="true"><span class="ui-switch-knob"></span></span>';
        const text = el("span", "lk-switch-text");
        bindText(text, settings.labelKey);
        control.appendChild(text);
        element.appendChild(control);
        if (settings.hintKey) addHelp(control, element, settings.hintKey);

        let on = Boolean(settings.checked);
        function paint() {
            control.setAttribute("aria-checked", String(on));
        }
        control.addEventListener("click", function () {
            on = !on;
            paint();
            if (settings.onChange) settings.onChange(on);
        });
        paint();

        return {
            element: element,
            checked: function () { return on; },
            set: function (value) {
                on = Boolean(value);
                paint();
            },
            setDisabled: function (disabled) { control.disabled = Boolean(disabled); }
        };
    }

    // A drop-down list (a native <select>). Option values can be anything (numbers too).
    function select(options) {
        const settings = options || {};
        const id = uid();
        const box = field(settings.labelKey, { forId: id, hideLabel: settings.hideLabel });
        const wrap = el("span", "lk-select");
        const control = el("select", "lk-select-input", { id: id });
        wrap.appendChild(control);
        box.element.appendChild(wrap);
        if (settings.hintKey) addHelp(control, box.element, settings.hintKey);

        let items = [];

        function setValue(value) {
            const index = indexOfValue(items, value);
            control.value = String(index === -1 ? 0 : index);
        }

        function setOptions(list, value) {
            items = list || [];
            control.textContent = "";
            items.forEach(function (item, index) {
                const option = el("option", "", { value: String(index) });
                bindItemText(option, item);
                control.appendChild(option);
            });
            setValue(value === undefined && items.length ? items[0].value : value);
        }

        const api = {
            element: box.element,
            select: control,
            value: function () {
                const item = items[Number(control.value)];
                return item ? item.value : undefined;
            },
            set: setValue,
            setOptions: setOptions,
            setDisabled: function (on) { control.disabled = Boolean(on); }
        };

        control.addEventListener("change", function () {
            if (settings.onChange) settings.onChange(api.value());
        });
        setOptions(settings.options, settings.value);
        return api;
    }

    // Chips: a row of small buttons that wrap onto more lines. One chosen (value), or with
    // multi: true any number of them (values). One-choice chips call onChange on every
    // press, also of the chosen one: handy for presets ("load this example again").
    function chips(options) {
        const settings = options || {};
        const items = settings.options || [];
        const multi = Boolean(settings.multi);
        const box = field(settings.labelKey, { hideLabel: settings.hideLabel });
        const group = el("div", "lk-chips", { role: "group", "aria-labelledby": box.label.id });
        let chosen = multi ? (settings.values || []).slice() : [settings.value];

        const buttons = items.map(function (item, index) {
            const chip = el("button", "lk-chip", { type: "button", "aria-pressed": "false" });
            if (item.colorIndex !== undefined) {
                const dot = el("span", "lk-chip-dot", { "aria-hidden": "true" });
                dot.style.setProperty("--lk-chip-color", seriesVar(item.colorIndex));
                chip.appendChild(dot);
            }
            chip.insertAdjacentHTML("beforeend", iconSVG(item.icon));
            const text = el("span", "lk-chip-text");
            bindItemText(text, item);
            chip.appendChild(text);
            chip.addEventListener("click", function () { press(index); });
            group.appendChild(chip);
            return chip;
        });

        function paint() {
            buttons.forEach(function (chip, index) {
                chip.setAttribute("aria-pressed", String(chosen.indexOf(items[index].value) !== -1));
            });
        }

        function press(index) {
            const value = items[index].value;
            if (multi) {
                const at = chosen.indexOf(value);
                if (at === -1) chosen.push(value);
                else chosen.splice(at, 1);
                // in the order of the options, whatever the order of the presses
                chosen = items.map(function (item) { return item.value; }).filter(function (v) { return chosen.indexOf(v) !== -1; });
                paint();
                if (settings.onChange) settings.onChange(chosen.slice());
            } else {
                chosen = [value];
                paint();
                if (settings.onChange) settings.onChange(value);
            }
        }

        paint();
        box.element.appendChild(group);
        return {
            element: box.element,
            value: function () { return multi ? chosen.slice() : chosen[0]; },
            values: function () { return chosen.slice(); },
            set: function (value) {
                chosen = multi ? (value || []).slice() : [value];
                paint();
            },
            setDisabled: function (on) {
                buttons.forEach(function (chip) { chip.disabled = Boolean(on); });
            }
        };
    }

    /* =========================================================
       5. DISPLAYS: STAT TILES, STATUS, LEGENDS, BARS
       ========================================================= */
    // A number with its label. trend: "up" | "down" | "flat" (an arrow), or "auto": the arrow
    // shows which way the number went the last time it changed (setting the same number again,
    // as every redraw and language switch does, keeps the arrow). better: "up" (default) or
    // "down" says which way is good, so the arrow is green or red (for a loss, down is good).
    // A single change counts up (when animations are on); quick changes are written at once.
    function stat(options) {
        const settings = options || {};
        const format = settings.format || number;
        const better = settings.better === "down" ? "down" : "up";
        const element = el("div", "lk-stat");
        const label = el("span", "lk-stat-label");
        bindText(label, settings.labelKey);
        const valueBox = el("span", "lk-stat-value");
        const trendBox = el("span", "lk-stat-trend");
        element.append(label, valueBox, trendBox);

        let current = null;
        let trend = null;
        let lastSet = -Infinity;
        let counter = null;

        function text(value) {
            if (isNumber(value)) return format(value);
            return value === null || value === undefined || value === "" ? "—" : String(value);
        }

        function paintTrend() {
            trendBox.hidden = !trend;
            if (!trend) return;
            trendBox.setAttribute("data-trend", trend);
            trendBox.setAttribute("data-good", trend === "flat" ? "flat" : String(trend === better));
            const words = t(trend === "up" ? "lab.kit.trendUp" : trend === "down" ? "lab.kit.trendDown" : "lab.kit.trendFlat");
            trendBox.innerHTML = iconSVG(trend) + '<span class="sr-only">' + A.escapeHTML(words) + "</span>";
        }

        function set(value, newTrend) {
            const previous = current;
            current = value;
            if (newTrend !== undefined) {
                trend = newTrend;
            } else if (settings.trend === "auto" && isNumber(previous) && isNumber(value) && value !== previous) {
                trend = value > previous ? "up" : "down";
            }

            const now = performance.now();
            const quick = now - lastSet < FAST_UPDATES_MS;
            lastSet = now;
            if (counter) counter.stop();
            counter = null;
            if (!quick && A.motion.ok() && isNumber(previous) && isNumber(value) && previous !== value) {
                // whole numbers stay whole while they count
                const whole = Number.isInteger(previous) && Number.isInteger(value);
                counter = A.countUp(valueBox, previous, value, COUNT_UP_MS, {
                    format: function (v) { return format(whole ? Math.round(v) : v); }
                });
            } else {
                writeText(valueBox, text(value));
            }
            paintTrend();
        }

        setUpdater(valueBox, "value", function () {
            if (counter) counter.finish();
            writeText(valueBox, text(current));
            paintTrend();
        });

        current = settings.value === undefined ? null : settings.value;
        trend = settings.trend && settings.trend !== "auto" ? settings.trend : null;
        writeText(valueBox, text(current));
        paintTrend();

        return {
            element: element,
            set: set,
            value: function () { return current; }
        };
    }

    // A small status pill with a coloured dot: "ready", "running", "paused" or "done".
    // (The words are lab.kit.ready / running / paused / finished.)
    const STATUS_KEYS = { ready: "lab.kit.ready", running: "lab.kit.running", paused: "lab.kit.paused", done: "lab.kit.finished" };

    function status(state) {
        const element = el("span", "lk-status");
        element.innerHTML = '<span class="lk-status-dot" aria-hidden="true"></span>';
        const text = el("span", "lk-status-text");
        element.appendChild(text);
        function set(newState) {
            const name = STATUS_KEYS[newState] ? newState : "ready";
            element.setAttribute("data-status", name);
            bindText(text, STATUS_KEYS[name]);
        }
        set(state);
        return { element: element, set: set };
    }

    // Marker shapes as small pictures (legends), the same shapes as kit.marker() on a canvas
    const SWATCHES = {
        dot: '<circle cx="8" cy="8" r="5"/>',
        square: '<rect x="3.5" y="3.5" width="9" height="9" rx="1.5"/>',
        triangle: '<path d="M8 2.8 13.6 12.6H2.4z"/>',
        diamond: '<path d="M8 2.2 13.8 8 8 13.8 2.2 8z"/>',
        ring: '<circle cx="8" cy="8" r="4.4" fill="none" stroke="currentColor" stroke-width="2.2"/>',
        line: '<rect x="1" y="6.8" width="14" height="2.4" rx="1.2"/>',
        dash: '<rect x="1" y="6.8" width="5.5" height="2.4" rx="1.2"/><rect x="9.5" y="6.8" width="5.5" height="2.4" rx="1.2"/>'
    };

    function swatch(shape, color) {
        const name = SWATCHES[shape] ? shape : "dot";
        const box = el("span", "lk-swatch", { "aria-hidden": "true" });
        box.style.setProperty("--lk-swatch-color", color);
        box.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" focusable="false">' + SWATCHES[name] + "</svg>";
        return box;
    }

    // What the colours and shapes mean. color is any CSS colour ("var(--danger)"), or
    // colorIndex picks a series colour. Shapes: dot, square, triangle, diamond, ring, line, dash.
    function legend(items) {
        const element = el("ul", "lk-legend", { role: "list" });
        function update(list) {
            element.textContent = "";
            (list || []).forEach(function (item) {
                const row = el("li", "lk-legend-item");
                row.appendChild(swatch(item.shape, item.color || seriesVar(item.colorIndex)));
                const text = el("span", "lk-legend-text");
                bindItemText(text, item);
                row.appendChild(text);
                element.appendChild(row);
            });
        }
        update(items);
        return { element: element, update: update };
    }

    // A list of horizontal bars made of page elements (not a canvas), so screen readers read
    // every label and number. update(items) reuses the rows, so the bars glide to their new
    // length (when animations are on). Values below zero, or signed: true, make bars that
    // grow left or right from the middle. max: the value of a full bar (default: the biggest).
    function bars(parent, options) {
        const settings = options || {};
        const format = settings.format || number;
        const element = el("ul", "lk-bars", { role: "list" });
        if (parent) parent.appendChild(element);
        const rows = [];
        let items = [];
        let max = settings.max;

        function makeRow() {
            const row = {
                item: el("li", "lk-bar"),
                label: el("span", "lk-bar-label"),
                track: el("span", "lk-bar-track", { "aria-hidden": "true" }),
                fill: el("span", "lk-bar-fill"),
                value: el("span", "lk-bar-value")
            };
            row.track.appendChild(row.fill);
            row.item.append(row.label, row.track, row.value);
            element.appendChild(row.item);
            return row;
        }

        function update(list, extra) {
            items = list || [];
            if (extra && extra.max !== undefined) max = extra.max;
            let biggest = 0;
            items.forEach(function (item) { biggest = Math.max(biggest, Math.abs(Number(item.value) || 0)); });
            const full = max || biggest || 1;
            const signed = Boolean(settings.signed) || items.some(function (item) { return item.value < 0; });
            element.classList.toggle("is-signed", signed);

            while (rows.length < items.length) rows.push(makeRow());
            while (rows.length > items.length) rows.pop().item.remove();
            items.forEach(function (item, index) {
                const row = rows[index];
                const value = Number(item.value) || 0;
                const share = A.util.clamp(Math.abs(value) / full, 0, 1);
                bindItemText(row.label, item);
                row.item.classList.toggle("is-negative", value < 0);
                // A signed bar has half of the track on each side of zero
                row.fill.style.width = (share * (signed ? 50 : 100)).toFixed(2) + "%";
                row.fill.style.setProperty("--lk-bar-color", item.colorIndex === undefined ? "" : seriesVar(item.colorIndex));
                writeText(row.value, format(value));
            });
        }

        setUpdater(element, "values", function () { update(items); });
        update(settings.items);
        return { element: element, update: update };
    }

    /* =========================================================
       6. TEACHING: EXPLAIN, CHALLENGES, HINTS, GLOSSARY LINKS
       ========================================================= */
    // The "What's happening?" panel: a native <details> (open and close it with a click,
    // Enter or Space) with numbered steps. setStep(i, values) lights up step i and fills its
    // {placeholders}; numbers in values are written the local way, also after a language
    // change. setValues(i, values) fills a step without lighting it up. setText(key, values)
    // shows one more free sentence under the steps (null hides it).
    function explain(options) {
        const settings = options || {};
        const element = el("details", "lk-explain");
        element.open = settings.open !== false;
        const summary = el("summary", "lk-explain-summary");
        summary.innerHTML = '<span class="lk-explain-icon" aria-hidden="true">?</span>';
        const title = el("span", "lk-explain-title");
        bindText(title, settings.titleKey || "lab.kit.whatsHappening");
        summary.appendChild(title);
        summary.insertAdjacentHTML("beforeend", '<span class="lk-explain-chevron" aria-hidden="true">' + iconSVG("chevron") + "</span>");
        const body = el("div", "lk-explain-body");
        const list = el("ol", "lk-explain-steps");
        const note = el("p", "lk-explain-note");
        body.append(list, note);
        element.append(summary, body);

        const steps = (settings.steps || []).map(function (step, index) {
            const item = el("li", "lk-explain-step");
            const badge = el("span", "lk-explain-num", { "aria-hidden": "true" });
            badge.textContent = (index < 9 ? "0" : "") + (index + 1);
            const text = el("p", "lk-explain-text");
            item.append(badge, text);
            list.appendChild(item);
            return { key: step.key, values: Object.assign({}, step.values), item: item, text: text };
        });
        let current = -1;
        let noteKey = null;
        let noteValues = {};

        function paintStep(step) {
            writeText(step.text, t(step.key, formatValues(step.values)));
        }

        function paintNote() {
            note.hidden = !noteKey;
            writeText(note, noteKey ? t(noteKey, formatValues(noteValues)) : "");
        }

        function setValues(index, values) {
            const step = steps[index];
            if (!step) return;
            Object.assign(step.values, values);
            paintStep(step);
        }

        steps.forEach(paintStep);
        paintNote();
        setUpdater(element, "texts", function () {
            steps.forEach(paintStep);
            paintNote();
        });

        return {
            element: element,
            setStep: function (index, values) {
                if (values) setValues(index, values);
                if (index === current) return;
                current = index;
                steps.forEach(function (step, i) {
                    step.item.classList.toggle("is-current", i === index);
                    if (i === index) step.item.setAttribute("aria-current", "step");
                    else step.item.removeAttribute("aria-current");
                });
            },
            setValues: setValues,
            setText: function (key, values) {
                noteKey = key || null;
                noteValues = values || {};
                paintNote();
            },
            setOpen: function (on) { element.open = Boolean(on); }
        };
    }

    // "Try this": small goals that lead to an idea. Each item: { key, check, insightKey }.
    //   key          the goal ("Make the loss go up")
    //   check(info)  optional: returns true when the goal is reached. The experiment calls
    //                challenges.check(info) with whatever it knows ({ loss, lr, steps... })
    //   insightKey   optional: shown once the goal is reached ("Why did that happen?")
    // complete(i) ticks one by hand. A finished challenge is announced, saved through
    // ctx.store ("lab.<id>.challenges" = { v: 1, total, done: [keys] }) and reported with
    // ctx.track("challenge", { n, done, total }) (n counts from 1).
    const fallbackAnnouncer = { say: function (text) { A.announce(text); } };

    function challenges(options) {
        const settings = options || {};
        const ctx = settings.ctx || null;
        const items = settings.items || [];
        const say = ctx && ctx.announce ? ctx.announce : fallbackAnnouncer.say;

        const element = el("section", "lk-challenges");
        const head = el("div", "lk-challenges-head");
        const title = el("h4", "lk-challenges-title", { id: uid() });
        bindText(title, settings.titleKey || "lab.kit.tryThis");
        const counter = el("span", "lk-challenges-count");
        head.append(title, counter);
        element.setAttribute("aria-labelledby", title.id);
        const list = el("ol", "lk-challenge-list");
        element.append(head, list);

        // Saved states: only keys of challenges that still exist count
        const saved = ctx && ctx.store ? ctx.store.get(CHALLENGE_KEY, null, function (value) {
            return value && value.v === CHALLENGE_VERSION && Array.isArray(value.done);
        }) : null;
        const done = items.map(function (item) { return Boolean(saved && saved.done.indexOf(item.key) !== -1); });

        const rows = items.map(function (item) {
            const row = el("li", "lk-challenge");
            const mark = el("span", "lk-challenge-mark", { "aria-hidden": "true" });
            mark.innerHTML = iconSVG("check");
            const body = el("div", "lk-challenge-body");
            const text = el("p", "lk-challenge-text");
            bindText(text, item.key);
            const state = el("span", "sr-only");
            body.append(text, state);
            if (item.insightKey) {
                const insight = el("p", "lk-challenge-insight");
                bindText(insight, item.insightKey);
                body.appendChild(insight);
            }
            row.append(mark, body);
            list.appendChild(row);
            return { row: row, state: state };
        });

        function count() {
            return done.filter(Boolean).length;
        }

        function paint() {
            rows.forEach(function (row, index) {
                row.row.classList.toggle("is-done", done[index]);
                bindText(row.state, done[index] ? "lab.kit.stateDone" : "lab.kit.stateOpen");
            });
            bindText(counter, function () { return t("lab.kit.challengeCount", { done: count(), total: items.length }); });
        }

        function save() {
            if (!ctx || !ctx.store) return;
            ctx.store.set(CHALLENGE_KEY, {
                v: CHALLENGE_VERSION,
                total: items.length,
                done: items.filter(function (item, index) { return done[index]; }).map(function (item) { return item.key; })
            });
        }

        function complete(index) {
            if (!items[index] || done[index]) return false;
            done[index] = true;
            save();
            paint();
            let message = t("lab.kit.challengeDone", { text: plain(t(items[index].key)) });
            if (count() === items.length) message += " " + t("lab.kit.allDone");
            say(message);
            if (ctx && ctx.track) ctx.track("challenge", { n: index + 1, done: count(), total: items.length });
            if (settings.onComplete) settings.onComplete(index, items[index]);
            return true;
        }

        paint();
        return {
            element: element,
            check: function (info) {
                items.forEach(function (item, index) {
                    if (done[index] || typeof item.check !== "function") return;
                    let reached = false;
                    try {
                        reached = Boolean(item.check(info));
                    } catch (error) {
                        reached = false;      // a check that can't answer yet just isn't reached
                    }
                    if (reached) complete(index);
                });
            },
            complete: complete,
            isDone: function (index) { return Boolean(done[index]); },
            count: count,
            reset: function () {
                done.fill(false);
                save();
                paint();
            }
        };
    }

    // A small note in a box: tone "info" (default), "tip" or "warn". dismissible: true adds
    // a close button. set(key, values) shows another text (and shows the note again).
    const TONES = {
        info: { icon: "info", key: "lab.kit.hintInfo" },
        tip: { icon: "tip", key: "lab.kit.hintTip" },
        warn: { icon: "warn", key: "lab.kit.hintWarn" }
    };

    function hint(options) {
        const settings = options || {};
        const tone = TONES[settings.tone] ? settings.tone : "info";
        const element = el("div", "lk-hint lk-hint-" + tone, { role: "note" });
        const iconBox = el("span", "lk-hint-icon", { "aria-hidden": "true" });
        iconBox.innerHTML = iconSVG(TONES[tone].icon);
        const body = el("div", "lk-hint-body");
        const label = el("span", "lk-hint-label");
        bindText(label, TONES[tone].key);
        const text = el("p", "lk-hint-text");
        body.append(label, text);
        element.append(iconBox, body);

        let key = settings.key;
        let values = settings.values;
        function paint() {
            writeText(text, key ? t(key, formatValues(values)) : "");
        }
        setUpdater(text, "text", paint);
        paint();

        const api = {
            element: element,
            set: function (newKey, newValues) {
                key = newKey;
                values = newValues;
                paint();
                element.hidden = false;
            },
            show: function () { element.hidden = false; },
            hide: function () { element.hidden = true; }
        };

        if (settings.dismissible) {
            const close = iconButton("close", "lab.kit.dismiss", { variant: "subtle", size: "sm", onClick: api.hide });
            close.element.classList.add("lk-hint-close");
            element.appendChild(close.element);
        }
        return api;
    }

    // Is this term in the glossary? (The glossary's content may load after the experiment.)
    function glossaryHas(id) {
        if (A.glossary && typeof A.glossary.term === "function") return Boolean(A.glossary.term(id));
        const data = A.content.get("glossary");
        return Boolean(data && Array.isArray(data.terms) && data.terms.some(function (term) { return term.id === id; }));
    }

    // A word that opens its glossary card: A.glossary.show(id) when the glossary is on the
    // page, else the link #term-<id>. A term the glossary doesn't have (yet) is plain text,
    // never a dead link; it is checked again in kit.relabel(), so it comes alive by itself.
    function termLink(id, labelKey) {
        const element = el("span", "lk-term");

        function open(event) {
            if (!A.glossary || typeof A.glossary.show !== "function") return;   // the #term- link does it
            event.preventDefault();
            A.glossary.show(id, { focus: true });
        }

        function paint() {
            const text = labelText(labelKey) || id;
            let link = element.querySelector("a");
            if (glossaryHas(id)) {
                if (!link) {
                    link = el("a", "lk-term-link", { href: "#term-" + encodeURIComponent(id) });
                    link.addEventListener("click", open);
                    element.textContent = "";
                    element.appendChild(link);
                }
                writeText(link, text);
            } else {
                if (link) link.remove();
                writeText(element, text);
            }
        }

        setUpdater(element, "term", paint);
        paint();
        return element;
    }

    /* =========================================================
       7. LAYOUT
       layout(stage, { side: true }) builds the usual frame of an experiment:
         top     full width: presets, a toolbar
         main    the canvas
         side    the controls and numbers (with side: true)
         bottom  full width: "What's happening?" and "Try this"
       With side, main and side stand next to each other once the stage
       is about 820px wide, and one under the other below that (canvas
       first). It follows the stage's own width (a container query), not
       the window's, so it fits any card. Empty parts take no room.
       ========================================================= */
    function layout(stage, options) {
        const settings = options || {};
        const root = el("div", "lk-root");
        const frame = el("div", "lk-layout" + (settings.side ? " lk-layout-side" : ""));
        const parts = {
            root: root,
            top: el("div", "lk-top"),
            main: el("div", "lk-main"),
            side: settings.side ? el("div", "lk-side") : null,
            bottom: el("div", "lk-bottom")
        };
        appendAll(frame, [parts.top, parts.main, parts.side, parts.bottom]);
        root.appendChild(frame);
        if (stage) stage.appendChild(root);
        return parts;
    }

    // A row of buttons that wraps onto more lines when it runs out of room
    function toolbar(children) {
        return appendAll(el("div", "lk-toolbar"), children);
    }

    // A row with a gap; grid: true makes equal columns that wrap (for stat tiles)
    function row(children, options) {
        return appendAll(el("div", options && options.grid ? "lk-grid" : "lk-row"), children);
    }

    // A labelled box around related parts (like the lab's "Settings" box). plain: true
    // keeps the label but drops the box.
    function group(labelKey, children, options) {
        const element = el("div", options && options.plain ? "lk-group lk-group-plain" : "lk-group", { role: "group" });
        if (labelKey) {
            const label = el("span", "lk-group-label", { id: uid() });
            bindText(label, labelKey);
            element.setAttribute("aria-labelledby", label.id);
            element.appendChild(label);
        }
        return appendAll(element, children);
    }

    /* =========================================================
       8. CANVAS AND COLOURS
       ========================================================= */
    // A canvas that fills the width of its parent and is sharp on every screen.
    //   aspect      width / height (default 16 / 10); or height: a fixed height in px
    //   minHeight, maxHeight   limits in px (a phone keeps a usable height)
    //   labelKey    its name for screen readers (role="img")
    // It returns a "view": { canvas, ctx, width, height, dpr, box, onResize, describe, destroy }.
    // Draw in CSS pixels (ctx is already scaled). After a size change the canvas is empty:
    // onResize(callback) is called then, so draw again there. describe(text) keeps a text
    // version of the picture for screen readers (read with the canvas, not announced).
    // destroy() stops watching the size (call it in the experiment's destroy()).
    function canvas(parent, options) {
        const settings = options || {};
        const box = el("div", "lk-canvas-box");
        if (settings.height) box.style.height = settings.height + "px";
        else box.style.aspectRatio = String(settings.aspect || 16 / 10);
        if (settings.minHeight) box.style.minHeight = settings.minHeight + "px";
        if (settings.maxHeight) box.style.maxHeight = settings.maxHeight + "px";
        const element = el("canvas", "lk-canvas", { role: "img" });
        const description = el("p", "sr-only", { id: uid() });
        element.setAttribute("aria-describedby", description.id);
        bindAttribute(element, "aria-label", settings.labelKey || "lab.kit.canvasLabel");
        box.append(element, description);
        if (parent) parent.appendChild(box);

        const callbacks = [];
        let destroyed = false;
        const view = {
            canvas: element,
            ctx: element.getContext("2d"),
            box: box,
            width: 0,
            height: 0,
            dpr: 1,
            onResize: function (callback) { callbacks.push(callback); },
            describe: function (text) {
                if (description.textContent !== text) description.textContent = text;
            },
            destroy: destroy
        };

        // Gives the canvas as many real pixels as the screen shows (A.canvas.fit)
        function fit() {
            if (destroyed) return;
            const width = box.clientWidth;
            const height = box.clientHeight;
            const ratio = A.canvas.pixelRatio();
            if (!width || !height) return;          // not on the page (yet)
            if (width === view.width && height === view.height && ratio === view.dpr) return;
            view.width = width;
            view.height = height;
            view.dpr = ratio;
            view.ctx = A.canvas.fit(element, width, height);
            callbacks.forEach(function (callback) { callback(view); });
        }

        // At most once per frame; the size is read after the browser has laid out the page
        const queueFit = A.util.frameThrottle(fit);
        let observer = null;
        let stopResize = null;
        if ("ResizeObserver" in window) {
            observer = new ResizeObserver(queueFit);
            observer.observe(box);
        } else {
            stopResize = A.onResize(queueFit);
        }
        const stopRatio = A.onPixelRatioChange(queueFit);    // moved to a sharper screen

        function destroy() {
            destroyed = true;
            if (observer) observer.disconnect();
            if (stopResize) stopResize();
            stopRatio();
            callbacks.length = 0;
            box.remove();
        }

        fit();
        return view;
    }

    // ----- The theme's colours, for drawing -----
    // colors() reads the colours of the current theme from the CSS once and keeps them.
    // Every colour is a ready string for ctx.fillStyle. series has 8 colours for groups
    // ("group 1, group 2..."): use them in order, from the first one. They were checked with
    // a colour-blindness simulation: any two of the first six stay apart for people with red-
    // green colour blindness too (see css/lab/kit.css). For more than six groups at once, add
    // a second clue: kit.marker() shapes or labels (a good idea with fewer groups, too).
    // In theme(), call kit.colors.invalidate() and draw again.
    let palette = null;
    let fonts = null;
    let rawColors = null;       // the same colours as [r, g, b], for the scales below

    function rgbString(color) {
        return "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
    }

    function readColor(name, fallback) {
        return A.colors.parse(A.cssVar(name)) || fallback;
    }

    function colors() {
        if (palette && palette.theme === A.theme) return palette;
        const grey = [128, 128, 128];
        const light = A.theme === "light";
        rawColors = {
            surface: readColor("--surface-solid", light ? [255, 255, 255] : [16, 22, 42]),
            text: readColor("--text", light ? [18, 22, 43] : [238, 241, 255]),
            accent: readColor("--accent", grey),
            accent2: readColor("--accent-2", grey),
            danger: readColor("--danger", grey)
        };
        const series = [];
        for (let i = 1; i <= SERIES_COUNT; i++) series.push(rgbString(readColor("--lk-series-" + i, rawColors.accent2)));
        palette = {
            theme: A.theme,
            light: light,
            bg: rgbString(readColor("--bg", rawColors.surface)),
            surface: rgbString(rawColors.surface),
            grid: A.colors.rgba(rawColors.text, light ? GRID_ALPHA.light : GRID_ALPHA.dark),
            text: rgbString(rawColors.text),
            muted: rgbString(readColor("--text-muted", grey)),
            accent: rgbString(rawColors.accent),
            accent2: rgbString(rawColors.accent2),
            accent3: rgbString(readColor("--accent-3", grey)),
            success: rgbString(readColor("--success", grey)),
            warning: rgbString(readColor("--warning", grey)),
            danger: rgbString(rawColors.danger),
            series: series
        };
        return palette;
    }

    // Forget the colours (after a theme change): the next colors() reads them again
    colors.invalidate = function () {
        palette = null;
        scaleTables = {};
    };

    // The same colour, see-through: alpha(c.accent, 0.3) -> "rgba(155,109,255,0.3)"
    const alphaCache = new Map();

    function alpha(color, amount) {
        const key = color + "|" + amount;
        let result = alphaCache.get(key);
        if (!result) {
            if (alphaCache.size > 400) alphaCache.clear();      // stays small
            result = A.colors.rgba(A.colors.parse(color) || [128, 128, 128], amount);
            alphaCache.set(key, result);
        }
        return result;
    }

    // A canvas font: font(11) -> "500 11px <the site's mono font>". family: "mono" (default),
    // "body" or "display". Keep canvas text at 11px or more.
    function font(size, weight, family) {
        if (!fonts) {
            fonts = {
                mono: A.cssVar("--font-mono") || "monospace",
                body: A.cssVar("--font-body") || "sans-serif",
                display: A.cssVar("--font-display") || "sans-serif"
            };
        }
        return (weight || 500) + " " + (size || CHART_FONT) + "px " + (fonts[family] || fonts.mono);
    }

    // ----- Colour scales -----
    // scale(t), t from 0 to 1: how much of something (a value, a probability, a height).
    // Small values are faint, big ones strong: on the dark theme from a dim violet through
    // violet to bright cyan, on the light theme from a pale violet to a deep one (the
    // brightness always changes in one direction, so the order is clear to everybody).
    // diverge(t), t from -1 to 1: which side of zero. Red below zero, cyan above, and a
    // neutral grey at zero (it reads as "nothing").
    // Each is a table of 256 colours made once per theme, so asking is quick (fine for
    // every cell of a big grid). scale.rgb(t) and diverge.rgb(t) give [r, g, b] for ImageData.
    let scaleTables = {};

    function scaleStops() {
        const c = rawColors;
        if (palette.light) {
            return [[0, A.colors.mix(c.surface, c.accent, 0.1)], [0.55, c.accent], [1, A.colors.mix(c.accent, c.text, 0.45)]];
        }
        return [[0, A.colors.mix(c.surface, c.accent, 0.2)], [0.55, c.accent], [1, c.accent2]];
    }

    function divergeStops() {
        const c = rawColors;
        const neutral = A.colors.mix(c.surface, c.text, palette.light ? 0.08 : 0.12);
        return [[0, c.danger], [0.5, neutral], [1, c.accent2]];
    }

    function buildTable(stops) {
        const css = [];
        const rgb = [];
        for (let i = 0; i < SCALE_STEPS; i++) {
            const at = i / (SCALE_STEPS - 1);
            let k = 1;
            while (k < stops.length - 1 && at > stops[k][0]) k++;
            const from = stops[k - 1];
            const to = stops[k];
            const color = A.colors.mix(from[1], to[1], (at - from[0]) / (to[0] - from[0]));
            rgb.push(color);
            css.push(rgbString(color));
        }
        return { css: css, rgb: rgb };
    }

    function table(name) {
        const c = colors();          // reads the theme's colours again after a theme change
        if (scaleTables.theme !== c.theme) scaleTables = { theme: c.theme };
        if (!scaleTables[name]) scaleTables[name] = buildTable(name === "scale" ? scaleStops() : divergeStops());
        return scaleTables[name];
    }

    // 0..1 -> the place in a table (anything else is clamped; not a number counts as 0)
    function tableIndex(share) {
        return Math.round(A.util.clamp(Number(share) || 0, 0, 1) * (SCALE_STEPS - 1));
    }

    function scale(share) {
        return table("scale").css[tableIndex(share)];
    }
    scale.rgb = function (share) { return table("scale").rgb[tableIndex(share)]; };

    function diverge(value) {
        return table("diverge").css[tableIndex(((Number(value) || 0) + 1) / 2)];
    }
    diverge.rgb = function (value) { return table("diverge").rgb[tableIndex(((Number(value) || 0) + 1) / 2)]; };

    /* =========================================================
       9. DRAWING AND THE LINE CHART
       ========================================================= */
    // A faint grid behind a drawing, every "step" px (default 24), on whole pixels so it stays sharp
    function drawGrid(context, width, height, step) {
        const gap = step || 24;
        context.save();
        context.strokeStyle = colors().grid;
        context.lineWidth = 1;
        context.beginPath();
        for (let x = gap; x < width; x += gap) {
            context.moveTo(Math.round(x) + 0.5, 0);
            context.lineTo(Math.round(x) + 0.5, height);
        }
        for (let y = gap; y < height; y += gap) {
            context.moveTo(0, Math.round(y) + 0.5);
            context.lineTo(width, Math.round(y) + 0.5);
        }
        context.stroke();
        context.restore();
    }

    // A marker on a canvas: shape "dot" | "square" | "triangle" | "diamond" | "ring"
    // (kit.shapes in that order), with a thin ring of the background colour around it so
    // it stays visible where it overlaps lines or other markers.
    function marker(context, shape, x, y, radius, color) {
        const r = radius || 4;
        context.beginPath();
        if (shape === "square") {
            context.rect(x - r * 0.88, y - r * 0.88, r * 1.76, r * 1.76);
        } else if (shape === "triangle") {
            context.moveTo(x, y - r * 1.15);
            context.lineTo(x + r * 1.05, y + r * 0.75);
            context.lineTo(x - r * 1.05, y + r * 0.75);
            context.closePath();
        } else if (shape === "diamond") {
            context.moveTo(x, y - r * 1.2);
            context.lineTo(x + r * 1.2, y);
            context.lineTo(x, y + r * 1.2);
            context.lineTo(x - r * 1.2, y);
            context.closePath();
        } else {
            context.arc(x, y, r, 0, Math.PI * 2);
        }
        context.lineJoin = "round";
        context.lineWidth = 3;
        context.strokeStyle = colors().surface;
        context.stroke();
        if (shape === "ring") {
            context.lineWidth = 2;
            context.strokeStyle = color;
            context.stroke();
        } else {
            context.fillStyle = color;
            context.fill();
        }
    }

    // ----- Nice numbers for the axes: steps of 1, 2, 2.5 or 5 times a power of ten -----
    function niceStep(range, count) {
        const raw = range / Math.max(1, count);
        if (!(raw > 0)) return 1;
        const power = Math.pow(10, Math.floor(Math.log10(raw)));
        const fraction = raw / power;
        const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
        return nice * power;
    }

    // The tick values from low to high. extend: true widens the range to whole steps
    // (for a range that follows the data); otherwise ticks stay inside it.
    function ticksFor(low, high, count, extend) {
        const step = niceStep(high - low, count);
        const decimals = Math.max(0, decimalsOf(Number(step.toPrecision(6))));
        const first = extend ? Math.floor(low / step + 1e-9) * step : Math.ceil(low / step - 1e-9) * step;
        const last = extend ? Math.ceil(high / step - 1e-9) * step : Math.floor(high / step + 1e-9) * step;
        const ticks = [];
        for (let value = first; value <= last + step / 2 && ticks.length < 50; value += step) {
            ticks.push(Number(value.toFixed(decimals)));
        }
        return { ticks: ticks, step: step, decimals: decimals, min: extend ? first : low, max: extend ? last : high };
    }

    // The last number in a list that is a real number, and where it is
    function lastFinite(values) {
        for (let i = values.length - 1; i >= 0; i--) {
            if (isNumber(values[i])) return i;
        }
        return -1;
    }

    // A line chart on a kit canvas: kit.lineChart(view, options) -> { draw(), set(changes) }.
    //   series      [{ values, colorIndex, color, labelKey, faint, fill, points, marks }]
    //               values: an array the experiment keeps adding to (then calls draw())
    //               faint: thin and see-through (raw values under a smoothed line)
    //               fill: a light wash under the line; points: a dot on every value;
    //               marks: [indexes] get a ring (e.g. "the best car finished a lap here")
    //   x0, xStep   the x value of the first point and between points (default 0 and 1)
    //   yMin, yMax  a fixed range (default: it follows the data)
    //   log: true   a logarithmic y axis (powers of ten), for values that span many sizes
    //   highlightX  an x value to mark with a vertical line (e.g. the chosen k)
    //   format(v)   the y numbers (default: kit.number, short from 10,000); xFormat(v) the x numbers
    //   xLabelKey, yLabelKey   the axis names (keys or functions)
    // It draws itself again after a resize, and keeps a text summary for screen readers.
    // The newest value of each series is labelled at the end of its line.
    function lineChart(view, options) {
        let settings = Object.assign({}, options);

        function draw() {
            drawLineChart(view, settings);
        }

        view.onResize(draw);
        return {
            draw: draw,
            set: function (changes) {
                settings = Object.assign(settings, changes);
            }
        };
    }

    function drawLineChart(view, settings) {
        const context = view.ctx;
        const width = view.width;
        const height = view.height;
        if (!width || !height) return;
        const c = colors();
        const log = settings.log === true;
        const series = (settings.series || []).filter(function (s) { return s && s.values; });
        const x0 = settings.x0 || 0;
        const xStep = settings.xStep || 1;
        const yFormat = settings.format || function (value) {
            return Math.abs(value) >= 10000 ? A.format.number(value, { compact: true }) : number(value);
        };
        const xFormat = settings.xFormat || function (value) { return A.format.number(value, { compact: Math.abs(value) >= 10000 }); };
        // Positions use log10 of the values on a log axis (values of 0 or less are skipped there)
        const toY = function (value) {
            if (!isNumber(value)) return NaN;
            return log ? (value > 0 ? Math.log10(value) : NaN) : value;
        };

        context.clearRect(0, 0, width, height);

        // 1. How many points, and the range of the values
        let count = 0;
        let low = Infinity;
        let high = -Infinity;
        series.forEach(function (s) {
            count = Math.max(count, s.values.length);
            for (let i = 0; i < s.values.length; i++) {
                const v = toY(s.values[i]);
                if (v < low) low = v;
                if (v > high) high = v;
            }
        });
        const fixedLow = settings.yMin !== undefined && isNumber(toY(settings.yMin));
        const fixedHigh = settings.yMax !== undefined && isNumber(toY(settings.yMax));
        if (fixedLow) low = toY(settings.yMin);
        if (fixedHigh) high = toY(settings.yMax);
        if (!isFinite(low) || !isFinite(high)) {
            low = 0;
            high = 1;
        }
        if (high - low < 1e-12) {
            low -= log ? 0.5 : Math.max(Math.abs(low) * 0.1, 0.5);
            high += log ? 0.5 : Math.max(Math.abs(high) * 0.1, 0.5);
        }

        // 2. Room for the axis names and numbers (the left side depends on the widest number)
        const top = CHART_PAD + (settings.yLabelKey ? CHART_FONT + 8 : 2);
        const bottom = CHART_FONT + 10 + (settings.xLabelKey ? CHART_FONT + 6 : 0);
        const plotHeight = Math.max(10, height - top - bottom);
        let yTicks;
        if (log) {
            const lowPower = Math.floor(low + 1e-9);
            const highPower = Math.ceil(high - 1e-9);
            const every = Math.max(1, Math.ceil((highPower - lowPower) / Math.max(1, Math.floor(plotHeight / TICK_GAP_Y))));
            const powers = [];
            for (let p = lowPower; p <= highPower; p += every) powers.push(p);
            yTicks = { ticks: powers, min: fixedLow ? low : lowPower, max: fixedHigh ? high : highPower };
        } else {
            yTicks = ticksFor(low, high, Math.max(2, Math.floor(plotHeight / TICK_GAP_Y)), !(fixedLow || fixedHigh));
            if (fixedLow) yTicks.min = low;
            if (fixedHigh) yTicks.max = high;
        }
        const tickText = function (tick) { return log ? yFormat(Math.pow(10, tick)) : yFormat(tick); };

        context.font = font(CHART_FONT, 500, "mono");
        let labelWidth = 0;
        yTicks.ticks.forEach(function (tick) { labelWidth = Math.max(labelWidth, context.measureText(tickText(tick)).width); });
        const left = Math.ceil(CHART_PAD + labelWidth + 8);
        const right = CHART_PAD + 4;
        const plotWidth = Math.max(10, width - left - right);
        const yRange = yTicks.max - yTicks.min || 1;
        const yAt = function (v) { return top + plotHeight - ((v - yTicks.min) / yRange) * plotHeight; };
        const xAt = function (i) { return left + (count > 1 ? (i / (count - 1)) * plotWidth : 0); };

        // 3. Grid lines and numbers on the y axis
        context.lineWidth = 1;
        context.textAlign = "right";
        context.textBaseline = "middle";
        yTicks.ticks.forEach(function (tick) {
            const y = Math.round(yAt(tick)) + 0.5;
            if (y < top - 1 || y > top + plotHeight + 1) return;
            context.strokeStyle = c.grid;
            context.beginPath();
            context.moveTo(left, y);
            context.lineTo(left + plotWidth, y);
            context.stroke();
            context.fillStyle = c.muted;
            context.fillText(tickText(tick), left - 8, y);
        });

        // the base line, a little stronger
        context.strokeStyle = alpha(c.text, c.light ? 0.22 : 0.2);
        context.beginPath();
        context.moveTo(left, Math.round(top + plotHeight) + 0.5);
        context.lineTo(left + plotWidth, Math.round(top + plotHeight) + 0.5);
        context.stroke();

        // 4. Numbers along the x axis (nice x values, kept inside the canvas)
        context.textBaseline = "top";
        const xFirst = x0;
        const xLast = x0 + Math.max(0, count - 1) * xStep;
        if (count > 0) {
            const xTicks = count > 1
                ? ticksFor(Math.min(xFirst, xLast), Math.max(xFirst, xLast), Math.max(1, Math.floor(plotWidth / TICK_GAP_X)), false)
                : { ticks: [xFirst] };
            // whole steps for whole x values (no "2.5 epochs")
            const ticks = Number.isInteger(xStep) && Number.isInteger(x0)
                ? xTicks.ticks.filter(function (value) { return Number.isInteger(value); })
                : xTicks.ticks;
            ticks.forEach(function (value) {
                const i = count > 1 ? (value - x0) / xStep : 0;
                const x = xAt(i);
                const text = xFormat(value);
                const textWidth = context.measureText(text).width;
                context.textAlign = "left";
                context.fillStyle = c.muted;
                context.fillText(text, A.util.clamp(x - textWidth / 2, 0, width - textWidth), top + plotHeight + 6);
            });
        }

        // 5. Axis names (kept out of the canvas box's rounded corners)
        context.font = font(CHART_FONT, 600, "body");
        context.fillStyle = c.muted;
        if (settings.yLabelKey) {
            context.textAlign = "left";
            context.textBaseline = "top";
            context.fillText(labelText(settings.yLabelKey), Math.max(CORNER, left - 8 - labelWidth), CHART_PAD - 2);
        }
        if (settings.xLabelKey) {
            context.textAlign = "right";
            context.textBaseline = "bottom";
            context.fillText(labelText(settings.xLabelKey), width - CORNER, height - 3);
        }

        // 6. The highlighted x (a thin vertical line)
        const highlight = isNumber(settings.highlightX) && count > 0 ? (settings.highlightX - x0) / xStep : NaN;
        if (isNumber(highlight) && highlight >= 0 && highlight <= count - 1) {
            const x = Math.round(xAt(highlight)) + 0.5;
            context.strokeStyle = alpha(c.text, 0.35);
            context.beginPath();
            context.moveTo(x, top);
            context.lineTo(x, top + plotHeight);
            context.stroke();
        }

        // 7. The lines (only the visible part of a value that is far outside a fixed range)
        context.save();
        context.beginPath();
        context.rect(left - 4, top - 4, plotWidth + 8, plotHeight + 8);
        context.clip();
        series.forEach(function (s) {
            drawSeries(context, s, xAt, yAt, toY, top + plotHeight, plotWidth, c, highlight);
        });
        context.restore();

        // 8. The newest value of each line: a dot at its end, then its number above or below
        //    the dot, wherever it covers no other number and no other dot (else it is skipped)
        context.font = font(CHART_FONT, 600, "mono");
        context.textBaseline = "middle";
        context.textAlign = "left";
        const ends = [];
        series.forEach(function (s) {
            const index = lastFinite(s.values);
            if (s.faint || index === -1 || !isNumber(toY(s.values[index]))) return;
            const y = A.util.clamp(yAt(toY(s.values[index])), top, top + plotHeight);
            ends.push({ x: xAt(index), y: y, text: yFormat(s.values[index]) });
            marker(context, "dot", xAt(index), y, 4, seriesColor(s, c));
        });
        const placed = [];         // the boxes of the numbers written so far
        const half = CHART_FONT / 2 + 2;
        ends.forEach(function (end) {
            const textWidth = context.measureText(end.text).width;
            const labelX = A.util.clamp(end.x - textWidth / 2, left + 2, width - textWidth - 2);
            const free = [end.y - 13, end.y + 13].filter(function (labelY) {
                if (labelY - half < top - 2 || labelY + half > top + plotHeight + 2) return false;
                const covers = function (y, x, size) {
                    return Math.abs(y - labelY) < half + size && x > labelX - 3 - size && x < labelX + textWidth + 3 + size;
                };
                return !placed.some(function (box) { return Math.abs(box.y - labelY) < 2 * half && box.x < labelX + textWidth + 6 && labelX < box.x + box.width + 6; }) &&
                    !ends.some(function (other) { return other !== end && covers(other.y, other.x, 5); });
            });
            if (!free.length) return;
            placed.push({ x: labelX, y: free[0], width: textWidth });
            // a soft plate under the number, so it stays readable over lines and the grid
            context.fillStyle = alpha(c.surface, 0.85);
            context.fillRect(labelX - 3, free[0] - half, textWidth + 6, 2 * half);
            context.fillStyle = c.text;
            context.fillText(end.text, labelX, free[0]);
        });

        // 9. Nothing to show yet
        if (count === 0) {
            context.font = font(CHART_FONT + 1, 500, "body");
            context.fillStyle = c.muted;
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(labelText(settings.emptyKey || "lab.kit.chartEmpty"), left + plotWidth / 2, top + plotHeight / 2);
        }

        view.describe(chartSummary(series, yFormat));
    }

    function seriesColor(s, c) {
        return s.color || c.series[Math.abs(Math.round(s.colorIndex || 0)) % SERIES_COUNT];
    }

    // One line of the chart. Very long lists are thinned to the lowest and highest value of
    // each pixel column, so the shape (and every spike) stays while the drawing stays quick.
    function drawSeries(context, s, xAt, yAt, toY, baseY, plotWidth, c, highlight) {
        const values = s.values;
        const color = seriesColor(s, c);
        const points = [];
        const crowded = values.length > plotWidth * 2;
        let column = null;
        for (let i = 0; i < values.length; i++) {
            const v = toY(values[i]);
            if (!isNumber(v)) {
                points.push(null);        // a gap in the line
                column = null;
                continue;
            }
            const x = xAt(i);
            const y = yAt(v);
            if (crowded && column && Math.floor(x) === column.x) {
                column.low = Math.max(column.low, y);
                column.high = Math.min(column.high, y);
                continue;
            }
            if (column && crowded) points.push([column.x, column.low], [column.x, column.high]);
            column = crowded ? { x: Math.floor(x), low: y, high: y } : null;
            if (!crowded) points.push([x, y]);
        }
        if (column && crowded) points.push([column.x, column.low], [column.x, column.high]);

        function trace() {
            context.beginPath();
            let drawing = false;
            points.forEach(function (point) {
                if (!point) {
                    drawing = false;
                    return;
                }
                if (drawing) context.lineTo(point[0], point[1]);
                else context.moveTo(point[0], point[1]);
                drawing = true;
            });
        }

        // a light wash under the line
        if (s.fill && points.length > 1) {
            const real = points.filter(Boolean);
            trace();
            context.lineTo(real[real.length - 1][0], baseY);
            context.lineTo(real[0][0], baseY);
            context.closePath();
            context.fillStyle = alpha(color, 0.1);
            context.fill();
        }

        trace();
        context.lineJoin = "round";
        context.lineCap = "round";
        context.lineWidth = s.faint ? 1.5 : 2;
        context.strokeStyle = s.faint ? alpha(color, FAINT_ALPHA) : color;
        context.stroke();

        if (s.faint) return;
        // a dot on every value (when there is room for them), marks, and the highlighted x
        if (s.points && values.length <= plotWidth / 8) {
            values.forEach(function (value, i) {
                if (isNumber(toY(value))) marker(context, "dot", xAt(i), yAt(toY(value)), 3.5, color);
            });
        }
        (s.marks || []).forEach(function (i) {
            if (isNumber(toY(values[i]))) marker(context, "ring", xAt(i), yAt(toY(values[i])), 5.5, color);
        });
        const h = Math.round(highlight);
        if (isNumber(highlight) && isNumber(toY(values[h]))) marker(context, "dot", xAt(h), yAt(toY(values[h])), 5, color);
    }

    // "Loss: 42 values, the latest is 0.031, the lowest 0.03, the highest 0.9."
    function chartSummary(series, format) {
        const parts = [];
        series.forEach(function (s) {
            if (s.faint) return;
            const numbers = s.values.filter(isNumber);
            const name = s.labelKey ? plain(labelText(s.labelKey)) : t("lab.kit.chart");
            if (!numbers.length) {
                parts.push(name + ": " + t("lab.kit.chartEmpty") + ".");
                return;
            }
            parts.push(t("lab.kit.chartSummary", {
                name: name,
                count: A.plural("lab.kit.chartValues", numbers.length),
                last: format(numbers[numbers.length - 1]),
                min: format(Math.min.apply(null, numbers)),
                max: format(Math.max.apply(null, numbers))
            }));
        });
        return parts.join(" ");
    }

    /* =========================================================
       10. LOOP, RANDOM NUMBERS, STORAGE, ANNOUNCER
       ========================================================= */
    // The animation loop of an experiment, on requestAnimationFrame.
    //   update(stepMs)  one fixed step of the simulation. stepMs is always the same (option
    //                   stepMs, default 1000/60), so the simulation behaves the same at any speed
    //   draw(info)      once per frame, after the steps: info = { steps, progress }, where
    //                   progress (0..1) is how far the next step is (for smooth animation)
    //   rate            steps per second (default 60). Infinity = "Turbo": as many steps as fit
    //   budget          ms of steps per frame, at most (default 8); what doesn't fit is
    //                   dropped, so a slow computer runs the simulation slower, not jerkier
    // -> { start(), stop(), running(), step(), setRate(rate) }
    //   stop() cancels everything: nothing runs while stopped. step() runs one update and
    //   one draw (for a Step button; it doesn't start the loop).
    function loop(options) {
        const settings = options || {};
        const budget = settings.budget || FRAME_BUDGET;
        const stepMs = settings.stepMs || DEFAULT_STEP_MS;
        let rate = settings.rate === undefined ? DEFAULT_RATE : settings.rate;
        let frame = 0;
        let isRunning = false;
        let lastTime = 0;
        let owed = 0;          // steps that are due but not run yet (a fraction of one, mostly)

        function tick(now) {
            frame = 0;
            if (!isRunning) return;
            const elapsed = A.util.clamp(now - lastTime, 0, MAX_FRAME_GAP);
            lastTime = now;
            let todo = Infinity;
            if (rate !== Infinity) {
                owed += (elapsed * rate) / 1000;
                todo = Math.floor(owed);
                owed -= todo;
            }

            const started = performance.now();
            let steps = 0;
            while (steps < todo && isRunning) {
                settings.update(stepMs);
                steps += 1;
                if (performance.now() - started >= budget) break;    // the rest waits (or is dropped)
            }
            if (steps < todo) owed = 0;

            if (settings.draw) settings.draw({ steps: steps, progress: rate === Infinity ? 1 : owed });
            if (isRunning) frame = requestAnimationFrame(tick);
        }

        return {
            start: function () {
                if (isRunning) return;
                isRunning = true;
                lastTime = performance.now();
                owed = 0;
                frame = requestAnimationFrame(tick);
            },
            stop: function () {
                isRunning = false;
                if (frame) cancelAnimationFrame(frame);
                frame = 0;
            },
            running: function () { return isRunning; },
            step: function () {
                settings.update(stepMs);
                if (settings.draw) settings.draw({ steps: 1, progress: 0 });
            },
            setRate: function (newRate) {
                rate = newRate;
                owed = 0;
            }
        };
    }

    // Random numbers you can repeat: the same seed always gives the same numbers, so a
    // preset behaves the same way every time (good for teaching, and for tests).
    // It is "mulberry32", a small and well-tested generator of 32-bit numbers.
    //   next()          0 <= x < 1
    //   range(a, b)     a <= x < b
    //   int(n)          a whole number 0, 1, ... n - 1
    //   normal(mean, sd)  a bell-curve number (the Box–Muller method)
    //   pick(list)      one item;  shuffle(list)  a shuffled copy
    function rng(seed) {
        let state = Number(seed) >>> 0;

        function next() {
            state = (state + 0x6D2B79F5) >>> 0;
            let x = state;
            x = Math.imul(x ^ (x >>> 15), x | 1);
            x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
            return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        }

        return {
            seed: Number(seed) >>> 0,
            next: next,
            range: function (a, b) { return a + next() * (b - a); },
            int: function (n) { return Math.floor(next() * n); },
            normal: function (mean, sd) {
                const u = 1 - next();          // never 0, so the logarithm is fine
                const v = next();
                const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
                return (mean || 0) + (sd === undefined ? 1 : sd) * z;
            },
            pick: function (list) { return list[Math.floor(next() * list.length)]; },
            shuffle: function (list) {
                const copy = list.slice();
                for (let i = copy.length - 1; i > 0; i--) {
                    const j = Math.floor(next() * (i + 1));
                    const swap = copy[i];
                    copy[i] = copy[j];
                    copy[j] = swap;
                }
                return copy;
            }
        };
    }

    // A new seed for "New random" (from Math.random, so the test harness can repeat it)
    function newSeed() {
        return Math.floor(Math.random() * 4294967296);
    }

    // The saved things of one experiment, under "lab.<id>.<name>" (A.storage adds "aic:").
    //   get(name, fallback, check)  check(value) must say yes, or you get the fallback:
    //                               saved data can be old, broken or edited by hand
    //   set(name, value)            returns false when the browser doesn't let us save
    // Version what you save ({ v: 1, ... }) so a later version can recognise it.
    function store(id) {
        const base = "lab." + id + ".";
        return {
            get: function (name, fallback, check) {
                const value = A.storage.get(base + name, undefined);
                if (value === undefined) return fallback;
                if (check) {
                    try {
                        if (!check(value)) return fallback;
                    } catch (error) {
                        return fallback;
                    }
                }
                return value;
            },
            set: function (name, value) { return A.storage.set(base + name, value); },
            remove: function (name) { A.storage.remove(base + name); }
        };
    }

    // Screen-reader messages without the flood: say(text) speaks politely, at most once per
    // minGap ms (a newer message replaces one that still waits), and the same text twice in
    // a row is said once. { urgent: true } speaks at once and interrupts (for rare, important
    // news). cancel() drops a waiting message (the hub calls it when the experiment closes).
    function announcer(options) {
        const gap = (options && options.minGap) || ANNOUNCE_GAP;
        let lastText = "";
        let lastTime = -Infinity;
        let waiting = null;
        let timer = 0;

        function speak(text, urgent) {
            lastText = text;
            lastTime = performance.now();
            A.announce(text, urgent ? { politeness: "assertive" } : undefined);
        }

        function sayWaiting() {
            timer = 0;
            const text = waiting;
            waiting = null;
            if (text) speak(text, false);
        }

        return {
            say: function (text, sayOptions) {
                if (!text) return;
                const now = performance.now();
                if (sayOptions && sayOptions.urgent) {
                    clearTimeout(timer);
                    timer = 0;
                    waiting = null;
                    speak(text, true);
                    return;
                }
                if (text === (waiting || lastText) && now - lastTime < REPEAT_WINDOW) return;
                const wait = lastTime + gap - now;
                if (wait <= 0 && !timer) {
                    speak(text, false);
                    return;
                }
                waiting = text;
                if (!timer) timer = setTimeout(sayWaiting, Math.max(0, wait));
            },
            cancel: function () {
                clearTimeout(timer);
                timer = 0;
                waiting = null;
            }
        };
    }

    /* =========================================================
       11. AICompass.labKit
       ========================================================= */
    A.feature("labKit", {
        // controls
        button: button,
        iconButton: iconButton,
        segmented: segmented,
        slider: slider,
        toggle: toggle,
        select: select,
        chips: chips,
        // displays
        stat: stat,
        status: status,
        legend: legend,
        bars: bars,
        // teaching
        explain: explain,
        challenges: challenges,
        hint: hint,
        termLink: termLink,
        // layout
        layout: layout,
        toolbar: toolbar,
        row: row,
        group: group,
        // canvas, colours, drawing
        canvas: canvas,
        colors: colors,
        alpha: alpha,
        font: font,
        scale: scale,
        diverge: diverge,
        drawGrid: drawGrid,
        marker: marker,
        shapes: SHAPES.slice(),
        lineChart: lineChart,
        // running, chance, saving, messages
        loop: loop,
        rng: rng,
        newSeed: newSeed,
        store: store,
        announcer: announcer,
        // texts, numbers and icons
        number: number,
        relabel: relabel,
        icons: icons
    });
})();
