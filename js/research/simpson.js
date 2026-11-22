/* =========================================================
   AI COMPASS — RESEARCH LAB, BENCH TOOL "simpson": CONFOUNDING AND ADJUSTMENT
   A table of counts: two treatments (A, B) in two groups, cases and successes.
     - the raw rates, the rates inside each group, the share of each group
     - the adjusted rates twice: standardisation (the backdoor sum
       Σ_z P(success | x, z)·P(z)) and weighting each case by 1/P(x | z),
       with the weighted table, so that the two can be seen to agree
     - the risk difference and risk ratio, raw and adjusted; the odds ratio,
       raw and pooled by Mantel–Haenszel
     - a flag for Simpson's paradox
     - the reader's choice of structure (common cause, mediator, collider),
       drawn as a small graph, and the verdict that follows from it
   The formulas are those of S/r9/research/sheet-T1.md ("simpson"). Texts:
   js/content/research/simpson.js. The functions of sections 1 and 2 are pure
   and are given to the tests as spec.maths (dev/tests/research.simpson.math.js).
    1. The numbers (pure)
    2. The verdict (pure)
    3. The drawing of the structure
    4. The tool: create(stage, ctx)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const t = A.t;
    const MAX_CASES = 1e9;               // cases in one cell
    const CELLS = ["a1", "a2", "b1", "b2"];   // treatment A or B, group 1 or 2
    // The presets: [cases, successes] for A in groups 1 and 2, then B
    const PRESETS = {
        // Charig and colleagues (1986): open surgery (A) and percutaneous nephrolithotomy (B),
        // stones under 2 cm (group 1) and larger (group 2)
        kidney: { a1: [87, 81], a2: [263, 192], b1: [270, 234], b2: [80, 55] },
        // the example of unit t10: mild (group 1) and severe (group 2) cases
        t10: { a1: [100, 90], a2: [400, 240], b1: [400, 320], b2: [100, 50] }
    };
    const STRUCTURES = ["cause", "mediator", "collider"];

    /* =========================================================
       1. THE NUMBERS (pure functions: spec.maths)
       ========================================================= */
    // top / bottom, or ∞ when only the bottom is 0, or NaN when both are
    function ratio(top, bottom) {
        if (bottom === 0) return top === 0 ? NaN : Infinity;
        return top / bottom;
    }

    function sign(value) {
        return value > 0 ? 1 : value < 0 ? -1 : 0;
    }

    // Are the counts usable? Whole numbers, at least one case in every cell, 0 ≤ successes ≤ cases
    function valid(cells) {
        return Boolean(cells) && CELLS.every(function (id) {
            const cell = cells[id];
            return Array.isArray(cell) && Number.isInteger(cell[0]) && Number.isInteger(cell[1]) &&
                cell[0] >= 1 && cell[0] <= MAX_CASES && cell[1] >= 0 && cell[1] <= cell[0];
        });
    }

    // cells: { a1: [n, s], a2, b1, b2 } ->
    //   { n: {A, B}, s: {A, B}, total, group: [N1, N2], pz: [P(z=1), P(z=2)],
    //     raw: {A, B}, rate: {A: [r1, r2], B}, adj: {A, B} (the backdoor sum),
    //     weighted: {A: {rows: [{ p, weight, n, s }], n, s, rate}, B} (weighting by 1/P(x | z)),
    //     rd: {raw, adj, groups: [d1, d2]}, rr: {raw, adj}, or: {raw, mh, mhTop, mhBottom}, paradox }
    function analyse(cells) {
        if (!valid(cells)) return null;
        const pick = function (x, z) { return cells[(x === "A" ? "a" : "b") + (z + 1)]; };
        const out = { n: {}, s: {}, raw: {}, rate: {}, adj: {}, weighted: {} };
        out.group = [0, 1].map(function (z) { return pick("A", z)[0] + pick("B", z)[0]; });
        out.total = out.group[0] + out.group[1];
        out.pz = out.group.map(function (size) { return size / out.total; });
        ["A", "B"].forEach(function (x) {
            out.n[x] = pick(x, 0)[0] + pick(x, 1)[0];
            out.s[x] = pick(x, 0)[1] + pick(x, 1)[1];
            out.raw[x] = out.s[x] / out.n[x];
            out.rate[x] = [0, 1].map(function (z) { return pick(x, z)[1] / pick(x, z)[0]; });
            // standardisation: Σ_z P(success | x, z)·P(z)
            out.adj[x] = out.rate[x][0] * out.pz[0] + out.rate[x][1] * out.pz[1];
            // weighting: each case of x in group z counts 1/P(x | z) times
            const rows = [0, 1].map(function (z) {
                const p = pick(x, z)[0] / out.group[z];
                const weight = 1 / p;
                return { p: p, weight: weight, n: pick(x, z)[0] * weight, s: pick(x, z)[1] * weight };
            });
            const wn = rows[0].n + rows[1].n;
            const ws = rows[0].s + rows[1].s;
            out.weighted[x] = { rows: rows, n: wn, s: ws, rate: ws / wn };
        });
        out.rd = {
            raw: out.raw.A - out.raw.B,
            adj: out.adj.A - out.adj.B,
            groups: [0, 1].map(function (z) { return out.rate.A[z] - out.rate.B[z]; })
        };
        out.rr = { raw: ratio(out.raw.A, out.raw.B), adj: ratio(out.adj.A, out.adj.B) };
        // odds ratios: a = successes of A, b = failures of A, c = successes of B, d = failures of B
        const a = out.s.A;
        const b = out.n.A - out.s.A;
        const c = out.s.B;
        const d = out.n.B - out.s.B;
        let top = 0;
        let bottom = 0;
        [0, 1].forEach(function (z) {
            const cellA = pick("A", z);
            const cellB = pick("B", z);
            top += cellA[1] * (cellB[0] - cellB[1]) / out.group[z];
            bottom += (cellA[0] - cellA[1]) * cellB[1] / out.group[z];
        });
        out.or = { raw: ratio(a * d, b * c), mh: ratio(top, bottom), mhTop: top, mhBottom: bottom };
        // Simpson's paradox: both groups point one way, the raw comparison the other
        const g = out.rd.groups.map(sign);
        out.paradox = sign(out.rd.raw) !== 0 && g[0] === g[1] && g[0] === -sign(out.rd.raw);
        return out;
    }

    /* =========================================================
       2. THE VERDICT (pure): -> { keys, tone }
       keys: the structure's sentence, the paradox sentence if there is one, the caveat.
       warn when the raw and the adjusted difference point in opposite directions
       (then the choice of structure decides the answer).
       ========================================================= */
    function verdictOf(r, structure) {
        const keys = [STRUCTURES.indexOf(structure) === -1 ? "cause" : structure];
        if (r.paradox) keys.push(r.rd.groups[0] > 0 ? "paradoxA" : "paradoxB");
        keys.push("caveat");
        const opposite = sign(r.rd.raw) * sign(r.rd.adj) < 0;
        return { keys: keys, tone: opposite ? "warn" : "info" };
    }

    const maths = { analyse: analyse, valid: valid, ratio: ratio, verdictOf: verdictOf, presets: PRESETS };

    /* =========================================================
       3. THE DRAWING OF THE STRUCTURE (an SVG: X the treatment, Z the group, Y the outcome)
       ========================================================= */
    const SVG = "http://www.w3.org/2000/svg";
    const NODE = { X: [64, 116], Y: [256, 116], Z: [160, 34] };
    const ARROWS = {
        cause: [["Z", "X"], ["Z", "Y"], ["X", "Y"]],
        mediator: [["X", "Z"], ["Z", "Y"], ["X", "Y"]],
        collider: [["X", "Z"], ["Y", "Z"], ["X", "Y"]]
    };
    let drawings = 0;

    function svg(tag, attributes) {
        const element = document.createElementNS(SVG, tag);
        Object.keys(attributes || {}).forEach(function (name) { element.setAttribute(name, attributes[name]); });
        return element;
    }

    // The node boxes are 112 × 34; an arrow runs from the edge of one box to the edge of the other
    function edgePoint(from, to) {
        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const sx = dx === 0 ? Infinity : 58 / Math.abs(dx);
        const sy = dy === 0 ? Infinity : 21 / Math.abs(dy);
        const k = Math.min(sx, sy);
        return [from[0] + dx * k, from[1] + dy * k];
    }

    function makeDrawing(parent) {
        drawings += 1;
        const marker = "rs-simpson-arrow-" + drawings;
        const figure = document.createElement("figure");
        figure.className = "rs-simpson-graph";
        figure.style.margin = "12px 0 0";
        const picture = svg("svg", { viewBox: "0 0 320 150", role: "img", focusable: "false" });
        picture.style.display = "block";
        picture.style.width = "100%";
        picture.style.maxWidth = "360px";
        picture.style.height = "auto";
        picture.style.color = "var(--text)";
        const caption = document.createElement("figcaption");
        caption.className = "rk-hint";
        figure.append(picture, caption);
        parent.appendChild(figure);

        function draw(structure, names) {
            picture.textContent = "";
            const defs = svg("defs");
            const head = svg("marker", { id: marker, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" });
            head.appendChild(svg("path", { d: "M0,0 L10,5 L0,10 z", fill: "currentColor" }));
            defs.appendChild(head);
            picture.appendChild(defs);
            (ARROWS[structure] || ARROWS.cause).forEach(function (pair) {
                const from = edgePoint(NODE[pair[0]], NODE[pair[1]]);
                const to = edgePoint(NODE[pair[1]], NODE[pair[0]]);
                const line = svg("line", { x1: from[0], y1: from[1], x2: to[0], y2: to[1], "stroke-width": "2", "marker-end": "url(#" + marker + ")" });
                line.style.stroke = pair.indexOf("Z") !== -1 ? "var(--accent-2)" : "currentColor";
                line.style.color = pair.indexOf("Z") !== -1 ? "var(--accent-2)" : "var(--text)";
                picture.appendChild(line);
            });
            Object.keys(NODE).forEach(function (id) {
                const at = NODE[id];
                const box = svg("rect", { x: at[0] - 56, y: at[1] - 17, width: "112", height: "34", rx: "8", "stroke-width": "1.5" });
                box.style.fill = "var(--surface-2)";
                box.style.stroke = id === "Z" ? "var(--accent-2)" : "var(--border-strong)";
                const label = svg("text", { x: at[0], y: at[1] + 4.5, "text-anchor": "middle", "font-size": "13" });
                label.style.fill = "var(--text)";
                label.style.fontFamily = "inherit";
                label.textContent = names[id];
                picture.append(box, label);
            });
            const text = t("research.simpson.graph." + structure, { x: names.X, y: names.Y, z: names.Z });
            picture.setAttribute("aria-label", text);
            caption.textContent = text;
        }
        return { draw: draw, element: figure };
    }

    /* =========================================================
       4. THE TOOL
       ========================================================= */
    function create(stage, ctx) {
        const kit = A.researchKit;
        const K = kit.use(ctx);
        const num = kit.num;

        function w(value) {
            return num(value, { digits: 5, grouping: false });
        }
        function signed(value) {
            return (value > 0 ? "+" : "") + w(value);
        }
        // the names of the groups, the treatments' outcome and the group variable, for a preset
        function names(preset) {
            const p = "research.simpson.names." + (PRESETS[preset] ? preset : "own") + ".";
            return { g1: t(p + "g1"), g2: t(p + "g2"), X: t("research.simpson.names.x"), Y: t(p + "y"), Z: t(p + "z") };
        }

        const panel = K.panel(stage, { questionKey: "research.simpson.question", titleKey: "research.tool.simpson.name", onChange: refresh });
        const preset = panel.choice({
            name: "preset", labelKey: "research.simpson.preset", value: "kidney",
            options: [{ value: "kidney", labelKey: "research.simpson.preset.kidney" }, { value: "t10", labelKey: "research.simpson.preset.t10" }, { value: "own", labelKey: "research.simpson.preset.own" }]
        });
        const about = document.createElement("p");
        about.className = "rk-hint rs-simpson-about";
        panel.inputs.appendChild(about);
        const fields = {};
        CELLS.forEach(function (id) {
            const start = PRESETS.kidney[id];
            fields[id] = {
                n: panel.field({ name: id + ".n", labelKey: "research.simpson.field." + id + ".n", kind: "int", min: 1, max: MAX_CASES, value: start[0], powers: true }),
                // the limit "at most the cases" is set by refresh: a saved count must not meet the preset's limit first
                s: panel.field({ name: id + ".s", labelKey: "research.simpson.field." + id + ".s", kind: "int", min: 0, max: MAX_CASES, value: start[1], powers: true, hintKey: id === "a1" ? "research.simpson.successHint" : undefined })
            };
        });
        const structure = panel.choice({
            name: "structure", labelKey: "research.simpson.structure", value: "cause",
            options: [{ value: "cause", labelKey: "research.simpson.structure.cause" }, { value: "mediator", labelKey: "research.simpson.structure.mediator" }, { value: "collider", labelKey: "research.simpson.structure.collider" }]
        });
        const drawing = makeDrawing(panel.inputs);

        panel.heading("research.simpson.head.raw");
        const rawA = panel.result({ name: "raw.a", labelKey: "research.simpson.raw.a" });
        const rawB = panel.result({ name: "raw.b", labelKey: "research.simpson.raw.b" });
        panel.heading("research.simpson.head.groups");
        const groupRows = {
            a1: panel.result({ name: "rate.a1", labelKey: "research.simpson.rate.a1" }),
            b1: panel.result({ name: "rate.b1", labelKey: "research.simpson.rate.b1" }),
            a2: panel.result({ name: "rate.a2", labelKey: "research.simpson.rate.a2" }),
            b2: panel.result({ name: "rate.b2", labelKey: "research.simpson.rate.b2" })
        };
        const pz = panel.result({ name: "pz", labelKey: "research.simpson.pz" });
        panel.heading("research.simpson.head.adjusted");
        const adjA = panel.result({ name: "adj.a", labelKey: "research.simpson.adj.a", hintKey: "research.simpson.adjHint" });
        const adjB = panel.result({ name: "adj.b", labelKey: "research.simpson.adj.b" });
        const ipwA = panel.result({ name: "ipw.a", labelKey: "research.simpson.ipw.a", hintKey: "research.simpson.ipwHint" });
        const ipwB = panel.result({ name: "ipw.b", labelKey: "research.simpson.ipw.b" });
        const table = panel.table({
            captionKey: "research.simpson.table",
            columns: [
                { labelKey: "research.simpson.col.cell" }, { labelKey: "research.simpson.col.n", numeric: true }, { labelKey: "research.simpson.col.s", numeric: true },
                { labelKey: "research.simpson.col.p", numeric: true }, { labelKey: "research.simpson.col.weight", numeric: true },
                { labelKey: "research.simpson.col.wn", numeric: true }, { labelKey: "research.simpson.col.ws", numeric: true }
            ]
        });
        panel.heading("research.simpson.head.measures");
        const rdRaw = panel.result({ name: "rd.raw", labelKey: "research.simpson.rd.raw" });
        const rdAdj = panel.result({ name: "rd.adj", labelKey: "research.simpson.rd.adj" });
        const rrRaw = panel.result({ name: "rr.raw", labelKey: "research.simpson.rr.raw" });
        const rrAdj = panel.result({ name: "rr.adj", labelKey: "research.simpson.rr.adj" });
        const orRaw = panel.result({ name: "or.raw", labelKey: "research.simpson.or.raw" });
        const orMh = panel.result({ name: "or.mh", labelKey: "research.simpson.or.mh", hintKey: "research.simpson.orHint" });
        const paradox = panel.result({ name: "paradox", labelKey: "research.simpson.paradox", kind: "text" });
        panel.formula({ key: "research.simpson.formula" });
        panel.source({ nameKey: "research.simpson.source", units: ["t10", "r12"] });

        let lastPreset = preset.value();

        // Writes a preset's counts into the eight boxes (the success limits first follow the cases)
        function fill(id) {
            CELLS.forEach(function (cell) {
                fields[cell].n.set(PRESETS[id][cell][0]);
                fields[cell].s.setLimits({ max: PRESETS[id][cell][0] });
                fields[cell].s.set(PRESETS[id][cell][1]);
            });
        }

        function matches(id, v) {
            return Boolean(PRESETS[id]) && CELLS.every(function (cell) {
                return v[cell + ".n"] === PRESETS[id][cell][0] && v[cell + ".s"] === PRESETS[id][cell][1];
            });
        }

        function refresh() {
            // a preset picked: its counts; counts changed by hand: "your own"
            const chosen = preset.value();
            if (chosen !== lastPreset && PRESETS[chosen]) fill(chosen);
            lastPreset = chosen;
            // successes may not exceed the cases of their cell
            CELLS.forEach(function (cell) {
                if (fields[cell].n.valid()) fields[cell].s.setLimits({ max: fields[cell].n.value() });
            });
            const label = names(preset.value());
            about.textContent = t("research.simpson.about." + preset.value());
            drawing.draw(structure.value(), label);
            const v = panel.values();
            if (!v) {
                table.set([]);
                return;
            }
            if (PRESETS[chosen] && !matches(chosen, v)) {
                preset.set("own");
                lastPreset = "own";
                Object.assign(label, names("own"));
                about.textContent = t("research.simpson.about.own");
                drawing.draw(structure.value(), label);
            }
            const cells = {};
            CELLS.forEach(function (cell) { cells[cell] = [v[cell + ".n"], v[cell + ".s"]]; });
            const r = analyse(cells);
            if (!r) return;
            const group = [label.g1, label.g2];

            rawA.set(r.raw.A, { formula: num(r.s.A) + "/" + num(r.n.A) + " = " + w(r.raw.A) });
            rawB.set(r.raw.B, { formula: num(r.s.B) + "/" + num(r.n.B) + " = " + w(r.raw.B) });
            CELLS.forEach(function (cell) {
                const z = Number(cell[1]) - 1;
                const value = r.rate[cell[0] === "a" ? "A" : "B"][z];
                groupRows[cell].set(value, { formula: group[z] + ": " + num(cells[cell][1]) + "/" + num(cells[cell][0]) + " = " + w(value) });
            });
            pz.set(r.pz[0], {
                formula: group[0] + ": (" + num(cells.a1[0]) + " + " + num(cells.b1[0]) + ")/" + num(r.total) + " = " + w(r.pz[0]) +
                    "; " + group[1] + ": " + w(r.pz[1])
            });
            ["A", "B"].forEach(function (x) {
                const row = x === "A" ? adjA : adjB;
                row.set(r.adj[x], { formula: w(r.rate[x][0]) + "·" + w(r.pz[0]) + " + " + w(r.rate[x][1]) + "·" + w(r.pz[1]) + " = " + w(r.adj[x]) });
                const weighted = r.weighted[x];
                (x === "A" ? ipwA : ipwB).set(weighted.rate, {
                    formula: t("research.simpson.ipwWork", { s: w(weighted.s), n: w(weighted.n), value: w(weighted.rate) })
                });
            });
            // the weighted table: a row per cell, then each treatment's sums
            const rows = [];
            ["A", "B"].forEach(function (x) {
                [0, 1].forEach(function (z) {
                    const cell = cells[(x === "A" ? "a" : "b") + (z + 1)];
                    const item = r.weighted[x].rows[z];
                    rows.push([x + " · " + group[z], cell[0], cell[1], { value: item.p, digits: 4 }, { value: item.weight, digits: 4 }, { value: item.n, digits: 5 }, { value: item.s, digits: 5 }]);
                });
                rows.push([t("research.simpson.col.total", { x: x }), r.n[x], r.s[x], "", "", { value: r.weighted[x].n, digits: 5 }, { value: r.weighted[x].s, digits: 5 }]);
            });
            table.set(rows);

            rdRaw.set(r.rd.raw, { formula: w(r.raw.A) + " − " + w(r.raw.B) + " = " + w(r.rd.raw) });
            rdAdj.set(r.rd.adj, { formula: w(r.adj.A) + " − " + w(r.adj.B) + " = " + w(r.rd.adj) });
            rrRaw.set(r.rr.raw, { formula: w(r.raw.A) + "/" + w(r.raw.B) + " = " + w(r.rr.raw) });
            rrAdj.set(r.rr.adj, { formula: w(r.adj.A) + "/" + w(r.adj.B) + " = " + w(r.rr.adj) });
            const failA = r.n.A - r.s.A;
            const failB = r.n.B - r.s.B;
            orRaw.set(r.or.raw, { formula: "(" + num(r.s.A) + "·" + num(failB) + ")/(" + num(failA) + "·" + num(r.s.B) + ") = " + w(r.or.raw) });
            const part = function (z, top) {
                const cellA = cells["a" + (z + 1)];
                const cellB = cells["b" + (z + 1)];
                return top ? num(cellA[1]) + "·" + num(cellB[0] - cellB[1]) + "/" + num(r.group[z]) : num(cellA[0] - cellA[1]) + "·" + num(cellB[1]) + "/" + num(r.group[z]);
            };
            orMh.set(r.or.mh, {
                formula: "(" + part(0, true) + " + " + part(1, true) + ") / (" + part(0, false) + " + " + part(1, false) + ") = " +
                    w(r.or.mhTop) + "/" + w(r.or.mhBottom) + " = " + w(r.or.mh)
            });
            paradox.set(t(r.paradox ? "research.simpson.paradox.yes" : "research.simpson.paradox.no"), {
                formula: t("research.simpson.paradoxWork", { raw: signed(r.rd.raw), g1: group[0], d1: signed(r.rd.groups[0]), g2: group[1], d2: signed(r.rd.groups[1]) }),
                tone: r.paradox ? "warn" : undefined
            });

            const verdict = verdictOf(r, structure.value());
            const values = {
                rawA: num(r.raw.A), rawB: num(r.raw.B), adjA: num(r.adj.A), adjB: num(r.adj.B),
                rdRaw: num(r.rd.raw), rdAdj: num(r.rd.adj)
            };
            panel.verdict.set(verdict.keys.map(function (key) { return t("research.simpson.verdict." + key, values); }).join(" "), verdict.tone);
        }

        refresh();
        return K.controller(refresh);
    }

    A.research.define("simpson", { create: create, maths: maths });
})();
