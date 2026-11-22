/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "sizer": MODEL SIZER
   A decoder-only transformer with pre-norm blocks, from its settings
   (blocks L, width d, heads h, feed-forward factor m, vocabulary V,
   context n, and four switches) to:
     - the exact number of parameters, block by block and in total
     - where they are: attention, feed-forward, embeddings, the rest
       (with a share and a bar for each)
     - the memory of the weights at b bits, and of the key-value cache
   With "count only the weight matrices of the blocks" it counts the way
   unit t9 does: L·(4 + 2m)·d².
   Texts: js/content/research/sizer.js. Styles (the bars): css/research/sizer.css.
   The functions of section 1 are pure and are given to the tests as
   spec.maths (dev/tests/research.sizer.math.js).
    1. The numbers (pure)
    2. The verdict (pure)
    3. Two helpers for the page: a rule between two fields, bytes for people
    4. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const UNITS = ["t9", "r1", "r10"];
    const BITS = [32, 16, 8, 4];
    // Decimal units, as the screen says: 1 kB = 10³ bytes, 1 MB = 10⁶ bytes, ...
    // (their names are texts: research.sizer.byte.<id>)
    const BYTE_UNITS = [["B", 1], ["kB", 1e3], ["MB", 1e6], ["GB", 1e9], ["TB", 1e12], ["PB", 1e15]];

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       ========================================================= */
    // The hidden width of the feed-forward layer, m·d, as a whole number, or NaN when
    // m·d is not whole (a layer cannot have 2,048.03 units). A factor typed with 12
    // digits (2.66666666667 for 8/3) still gives its whole number.
    function hiddenWidth(m, d) {
        const exact = m * d;
        const whole = Math.round(exact);
        return whole >= 1 && Math.abs(exact - whole) <= 1e-9 * Math.max(1, exact) ? whole : NaN;
    }

    // The head size d/h, or NaN when h does not divide d
    function headSize(d, h) {
        return d % h === 0 ? d / h : NaN;
    }

    // Every count of the model. s = { L, d, m, V, n, tied, positions, biases, weightsOnly }
    //   tied         the output layer shares the input embedding (no V·d of its own)
    //   positions    learned position embeddings (n·d)
    //   biases       the linear layers have biases (the normalisations always have a gain and a bias)
    //   weightsOnly  only the weight matrices of the blocks, as unit t9 counts: L·(4 + 2m)·d²
    // -> null when m·d is not whole
    function count(s) {
        const d = s.d;
        const H = hiddenWidth(s.m, d);
        if (isNaN(H)) return null;
        const only = Boolean(s.weightsOnly);
        const bias = s.biases && !only;
        const attention = 4 * d * d + (bias ? 4 * d : 0);
        const feedForward = 2 * H * d + (bias ? H + d : 0);
        const norms = only ? 0 : 4 * d;
        const block = attention + feedForward + norms;
        const blocks = s.L * block;
        const tokens = only ? 0 : s.V * d;
        const positions = only || !s.positions ? 0 : s.n * d;
        const output = only || s.tied ? 0 : s.V * d;
        const finalNorm = only ? 0 : 2 * d;
        const total = blocks + tokens + positions + output + finalNorm;
        return {
            hidden: H,
            block: { attention: attention, feedForward: feedForward, norms: norms, total: block },
            blocks: blocks,
            tokens: tokens,
            positions: positions,
            output: output,
            finalNorm: finalNorm,
            total: total,
            parts: {
                attention: s.L * attention,
                feedForward: s.L * feedForward,
                embeddings: tokens + positions + output,
                rest: s.L * norms + finalNorm
            }
        };
    }

    // The weights in bytes at b bits each: N·b/8
    function weightBytes(total, bits) {
        return total * bits / 8;
    }

    // The key-value cache in bytes: 2·L·n·d values for each sequence at full context,
    // b bits each -> { perSequence, total }
    function cacheBytes(L, n, d, bits, sequences) {
        const perSequence = 2 * L * n * d * bits / 8;
        return { perSequence: perSequence, total: perSequence * sequences };
    }

    // A size in bytes in the largest unit that keeps the number at 1 or more
    // -> { value, unit, size } (1,234,567 bytes -> 1.234567 MB)
    function bytesIn(bytes) {
        let chosen = BYTE_UNITS[0];
        BYTE_UNITS.forEach(function (unit) { if (bytes >= unit[1]) chosen = unit; });
        return { value: bytes / chosen[1], unit: chosen[0], size: chosen[1] };
    }

    /* =========================================================
       2. THE VERDICT (pure): which sentences fit the numbers
       -> { where: "blocks" | "weightsOnly", cache: "one" | "many", cacheLarger: true | false }
       ========================================================= */
    function verdictParts(weightsOnly, sequences, weights, cache) {
        return {
            where: weightsOnly ? "weightsOnly" : "blocks",
            cache: sequences === 1 ? "one" : "many",
            cacheLarger: cache > weights
        };
    }

    // How many significant digits a share gets as a percentage: 4, or more when 4 would round
    // a share below 1 up to 100% (a byte vocabulary under 200 wide blocks: "100% of the
    // parameters are in the blocks; the token embedding table alone holds 0.0013%" cannot
    // both be true; it is 99.9987%)
    function shareDigits(share) {
        let d = 4;
        while (d < 15 && share < 1 && Number((share * 100).toPrecision(d)) >= 100) d += 1;
        return d;
    }

    const maths = {
        hiddenWidth: hiddenWidth, headSize: headSize, count: count, weightBytes: weightBytes,
        cacheBytes: cacheBytes, bytesIn: bytesIn, verdictParts: verdictParts, shareDigits: shareDigits
    };

    /* =========================================================
       3. TWO HELPERS FOR THE PAGE
       (candidates for the bench kit: see the final notes of task T2)
       ========================================================= */
    // A rule between fields that limits cannot say ("h must divide d"). The field is
    // marked like a wrong input, the message stands under it, and the panel counts it as
    // wrong until it is fixed: values() gives null, so every result shows "—", and Copy
    // and the notebook refuse. test() returns the message, or "" when the rule holds.
    // The returned check() must run at the start of every refresh, before values().
    function crossRule(item, test) {
        const ownValid = item.valid;
        let message = "";
        let shown = "";
        item.valid = function () { return ownValid() && !message; };
        // The field's own message (Enter, leaving the box) is written after an input
        // event: the rule's message is written again after it. A text the kit wrote
        // (a list's "16 numbers read.") is only replaced while the rule is broken.
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

        // whole numbers in a worked formula: all digits, no groups
        function w(value, digits) {
            return num(value, { digits: digits || 6, grouping: false });
        }
        function pct(share) {
            return num(share, { percent: true, digits: shareDigits(share) });
        }
        function unitText(id) {
            return t("research.sizer.byte." + id);
        }
        function bytesText(bytes) {
            const b = bytesIn(bytes);
            return num(b.value) + " " + unitText(b.unit);
        }

        const panel = K.panel(stage, { questionKey: "research.sizer.question", titleKey: "research.sizer.title", onChange: refresh });
        const fields = {
            L: panel.field({ name: "L", labelKey: "research.sizer.L", kind: "int", min: 1, max: 100000, value: 12 }),
            d: panel.field({ name: "d", labelKey: "research.sizer.d", kind: "int", min: 1, max: 1e7, value: 768, powers: true }),
            h: panel.field({ name: "h", labelKey: "research.sizer.h", kind: "int", min: 1, max: 1e7, value: 12 }),
            m: panel.field({ name: "m", labelKey: "research.sizer.m", kind: "number", min: 0, minOpen: true, max: 1000, value: 4, hintKey: "research.sizer.mHint" }),
            V: panel.field({ name: "V", labelKey: "research.sizer.V", kind: "int", min: 1, max: 1e9, value: 50000, powers: true }),
            n: panel.field({ name: "n", labelKey: "research.sizer.n", kind: "int", min: 1, max: 1e9, value: 1024, powers: true })
        };
        panel.toggle({ name: "tied", labelKey: "research.sizer.tied", checked: true });
        panel.toggle({ name: "positions", labelKey: "research.sizer.positions", checked: true });
        panel.toggle({ name: "biases", labelKey: "research.sizer.biases", checked: true, hintKey: "research.sizer.biasesHint" });
        panel.toggle({ name: "weightsOnly", labelKey: "research.sizer.weightsOnly", checked: false, hintKey: "research.sizer.weightsOnlyHint" });
        panel.choice({ name: "bits", labelKey: "research.sizer.bits", value: 16, options: BITS.map(function (b) { return { value: b, label: String(b) }; }) });
        panel.choice({ name: "cacheBits", labelKey: "research.sizer.cacheBits", value: 16, options: BITS.map(function (b) { return { value: b, label: String(b) }; }) });
        panel.field({ name: "sequences", labelKey: "research.sizer.sequences", kind: "int", min: 1, max: 1e9, value: 1, powers: true, hintKey: "research.sizer.sequencesHint" });

        const rules = [
            crossRule(fields.h, function () {
                if (!fields.d.valid()) return "";
                const d = fields.d.value();
                const h = fields.h.value();
                return d % h === 0 ? "" : t("research.sizer.errHeads", { d: num(d), h: num(h), rest: num(d % h) });
            }),
            crossRule(fields.m, function () {
                if (!fields.d.valid()) return "";
                const d = fields.d.value();
                const m = fields.m.value();
                return isNaN(hiddenWidth(m, d)) ? t("research.sizer.errHidden", { md: num(m * d, { digits: 8 }), m: num(m, { digits: 12 }), d: num(d) }) : "";
            })
        ];

        panel.heading("research.sizer.countHead");
        const out = {
            head: panel.result({ name: "head", labelKey: "research.sizer.head", kind: "int" }),
            hidden: panel.result({ name: "hidden", labelKey: "research.sizer.hidden", kind: "int" }),
            block: panel.result({ name: "block", labelKey: "research.sizer.block", kind: "int" }),
            blocks: panel.result({ name: "blocks", labelKey: "research.sizer.blocks", kind: "int" }),
            tokens: panel.result({ name: "tokens", labelKey: "research.sizer.tokens", kind: "int" }),
            positions: panel.result({ name: "positions", labelKey: "research.sizer.positionsRow", kind: "int" }),
            output: panel.result({ name: "output", labelKey: "research.sizer.output", kind: "int" }),
            finalNorm: panel.result({ name: "finalNorm", labelKey: "research.sizer.finalNorm", kind: "int" }),
            total: panel.result({ name: "total", labelKey: "research.sizer.total", kind: "int" })
        };
        panel.heading("research.sizer.whereHead");
        const shares = {};
        const PART_NAMES = ["attention", "feedForward", "embeddings", "rest"];
        const shareNow = {};
        PART_NAMES.forEach(function (name, index) {
            shareNow[name] = NaN;
            shares[name] = panel.result({
                name: "part." + name, labelKey: "research.sizer.part." + name, kind: "int",
                unitKey: function () { return t("research.sizer.shareUnit", { share: pct(shareNow[name]) }); }
            });
            // A bar for the share (the number is in the row: the bar is only a picture of it)
            const bar = document.createElement("dd");
            bar.className = "rs-sizer-bar";
            bar.setAttribute("aria-hidden", "true");
            const fill = document.createElement("span");
            fill.className = "rs-sizer-fill";
            fill.style.setProperty("--rs-sizer-color", "var(--lk-series-" + (index + 1) + ")");
            bar.appendChild(fill);
            shares[name].element.appendChild(bar);
            shares[name].fill = fill;
        });
        panel.heading("research.sizer.memoryHead");
        let unitNow = { weights: "B", perSequence: "B", cache: "B", together: "B" };
        const memory = {};
        ["weights", "perSequence", "cache", "together"].forEach(function (name) {
            memory[name] = panel.result({ name: "mem." + name, labelKey: "research.sizer.mem." + name, unitKey: function () { return unitText(unitNow[name]); } });
        });
        panel.remark({ key: "research.sizer.remark" });
        panel.formula({ key: "research.sizer.formula" });
        panel.source({ nameKey: "research.sizer.source", units: UNITS });

        function setBytes(name, bytes, formula) {
            const b = bytesIn(bytes);
            unitNow[name] = b.unit;
            memory[name].set(b.value, { formula: formula });
        }

        function refresh() {
            rules.forEach(function (check) { check(); });
            const v = panel.values();
            if (!v) {
                PART_NAMES.forEach(function (name) { shares[name].fill.style.setProperty("--rs-sizer-share", "0"); });
                return;
            }
            const s = { L: v.L, d: v.d, m: v.m, V: v.V, n: v.n, tied: v.tied, positions: v.positions, biases: v.biases, weightsOnly: v.weightsOnly };
            const r = count(s);
            if (!r) return;
            const only = v.weightsOnly;
            const bias = v.biases && !only;
            const d = v.d;
            const H = r.hidden;
            const words = { L: String(v.L), d: String(d), h: String(v.h), m: w(v.m, 12), H: String(H), V: String(v.V), n: String(v.n) };

            out.head.set(d / v.h, { formula: t("research.sizer.headWork", Object.assign({}, words, { value: w(d / v.h) })) });
            out.hidden.set(H, { formula: t("research.sizer.hiddenWork", words) });
            const blockWork = only
                ? t("research.sizer.blockWorkOnly", Object.assign({}, words, { value: w(r.block.total) }))
                : t(bias ? "research.sizer.blockWork" : "research.sizer.blockWorkNoBias", Object.assign({}, words, {
                    attention: w(r.block.attention), feedForward: w(r.block.feedForward), norms: w(r.block.norms), value: w(r.block.total)
                }));
            out.block.set(r.block.total, { formula: blockWork });
            out.blocks.set(r.blocks, { formula: t("research.sizer.blocksWork", Object.assign({}, words, { block: w(r.block.total), value: w(r.blocks) })) });
            ["tokens", "positions", "output", "finalNorm"].forEach(function (name) { out[name].hidden(only); });
            out.positions.hidden(only || !v.positions);
            out.output.hidden(only || v.tied);
            if (!only) {
                out.tokens.set(r.tokens, { formula: t("research.sizer.tokensWork", Object.assign({}, words, { value: w(r.tokens) })) });
                if (v.positions) out.positions.set(r.positions, { formula: t("research.sizer.positionsWork", Object.assign({}, words, { value: w(r.positions) })) });
                else out.positions.clear();
                if (!v.tied) out.output.set(r.output, { formula: t("research.sizer.outputWork", Object.assign({}, words, { value: w(r.output) })) });
                else out.output.clear();
                out.finalNorm.set(r.finalNorm, { formula: t("research.sizer.finalNormWork", Object.assign({}, words, { value: w(r.finalNorm) })) });
            } else {
                ["tokens", "positions", "output", "finalNorm"].forEach(function (name) { out[name].clear(); });
            }
            const pieces = [w(v.L) + "·" + w(r.block.total)];
            if (!only) {
                pieces.push(w(r.tokens));
                if (v.positions) pieces.push(w(r.positions));
                if (!v.tied) pieces.push(w(r.output));
                pieces.push(w(r.finalNorm));
            }
            out.total.set(r.total, {
                formula: only
                    ? t("research.sizer.totalWorkOnly", Object.assign({}, words, { value: w(r.total) }))
                    : pieces.join(" + ") + " = " + w(r.total)
            });

            // Where the parameters are
            const partWork = {
                attention: t(bias ? "research.sizer.part.attentionWork" : "research.sizer.part.attentionWorkNoBias", words),
                feedForward: t(bias ? "research.sizer.part.feedForwardWork" : "research.sizer.part.feedForwardWorkNoBias", words),
                embeddings: [w(r.tokens)].concat(v.positions ? [w(r.positions)] : [], v.tied ? [] : [w(r.output)]).join(" + "),
                rest: t("research.sizer.part.restWork", words)
            };
            PART_NAMES.forEach(function (name) {
                const hide = only && (name === "embeddings" || name === "rest");
                shares[name].hidden(hide);
                const value = r.parts[name];
                shareNow[name] = value / r.total;
                shares[name].fill.style.setProperty("--rs-sizer-share", hide ? "0" : String(Math.max(0, Math.min(1, value / r.total))));
                if (hide) {
                    shares[name].clear();
                    return;
                }
                shares[name].set(value, {
                    formula: t("research.sizer.part.work", { work: partWork[name], value: w(value), total: w(r.total), share: num(value / r.total, { percent: true, digits: 6, grouping: false }) })
                });
            });

            // Memory
            const weights = weightBytes(r.total, v.bits);
            const cache = cacheBytes(v.L, v.n, d, v.cacheBits, v.sequences);
            setBytes("weights", weights, t("research.sizer.mem.weightsWork", { N: w(r.total), b: String(v.bits), bytes: w(weights), shown: bytesText(weights) }));
            setBytes("perSequence", cache.perSequence, t("research.sizer.mem.perSequenceWork", Object.assign({}, words, { b: String(v.cacheBits), bytes: w(cache.perSequence), shown: bytesText(cache.perSequence) })));
            setBytes("cache", cache.total, t("research.sizer.mem.cacheWork", { one: w(cache.perSequence), s: String(v.sequences), bytes: w(cache.total), shown: bytesText(cache.total) }));
            setBytes("together", weights + cache.total, t("research.sizer.mem.togetherWork", { weights: w(weights), cache: w(cache.total), bytes: w(weights + cache.total), shown: bytesText(weights + cache.total) }));

            // The verdict
            const parts = verdictParts(only, v.sequences, weights, cache.total);
            const said = {
                L: num(v.L), blocks: pct(r.blocks / r.total), tokens: pct(r.tokens / r.total), total: num(r.total),
                attention: pct(r.parts.attention / r.total), feedForward: pct(r.parts.feedForward / r.total),
                weights: bytesText(weights), bits: String(v.bits), cache: bytesText(cache.total), s: num(v.sequences), context: num(v.n)
            };
            let text = parts.where === "weightsOnly"
                ? t("research.sizer.verdictOnly", said)
                : A.plural("research.sizer.verdictBlocks", v.L, said);
            text += " " + t(parts.cache === "one" ? "research.sizer.verdictMemoryOne" : "research.sizer.verdictMemoryMany", said);
            if (parts.cacheLarger) text += " " + t("research.sizer.verdictCacheLarger");
            panel.verdict.set(text, "info");
        }

        refresh();
        return K.controller(refresh);
    }

    A.research.define("sizer", { create: create, maths: maths });
})();
