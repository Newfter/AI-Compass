/* =========================================================
   AI COMPASS — MINI-LAB "PIXEL DETECTIVE" (lesson 7)
   A 3 × 3 filter slides over a 12 × 12 picture of black (0) and white
   (1) pixels: at each place, the 9 pixels under it are multiplied by its
   numbers and added up (a CNN's "convolution"). The 10 × 10 result
   shows what it finds; pointing at a square explains its number.
   Loaded by js/lessons.js (see "A MINI-LAB IN ITS OWN FILE" there).
   Texts: "lessons.w7.*" (js/content/lessons-deep.js). Styles:
   css/lessons-labs.css ("px-"). Sections:
    1. Settings
    2. The maths: a filter slides over the picture
    3. Drawing the lab
    4. Updating it
    5. Painting (mouse, pen, touch and keyboard)
    6. Pointing at the result, and the buttons
    7. The lab for js/lessons.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lessons) return;

    // ---------- 1. Settings ----------
    const SIZE = 12;                          // the picture is SIZE × SIZE pixels
    const K = 3;                              // the filter is K × K
    const OUT = SIZE - K + 1;                 // so the result is OUT × OUT (10 × 10)
    const FIRST_SHAPE = "square";             // the picture shown the first time
    const FIRST_SPOT = { row: 3, col: 1 };    // the result square explained first: on the square's left edge
    // The filters, row by row. "divide": the blur adds 9 pixels and divides by 9 (an average).
    const FILTERS = {
        vertical: { weights: [-1, 0, 1, -1, 0, 1, -1, 0, 1], divide: 1 },
        horizontal: { weights: [-1, -1, -1, 0, 0, 0, 1, 1, 1], divide: 1 },
        blur: { weights: [1, 1, 1, 1, 1, 1, 1, 1, 1], divide: 9 }
    };
    // The shapes: "#" is a white pixel (1), "." a black one (0)
    const SHAPES = {
        square: ["............", "............", "............", "...######...", "...######...", "...######...",
            "...######...", "...######...", "...######...", "............", "............", "............"],
        plus: ["............", "............", ".....##.....", ".....##.....", ".....##.....", "..########..",
            "..########..", ".....##.....", ".....##.....", ".....##.....", "............", "............"],
        seven: ["............", "............", "..########..", "..########..", ".......##...", ".......##...",
            "......##....", "......##....", ".....##.....", ".....##.....", "....##......", "............"]
    };

    // ---------- 2. The maths: a filter slides over the picture ----------
    // The pixels, row after row ("clear" has no rows: all black)
    function shapePixels(name) {
        const rows = SHAPES[name];
        return Array.from({ length: SIZE * SIZE }, function (unused, i) { return rows && rows[Math.floor(i / SIZE)][i % SIZE] === "#" ? 1 : 0; });
    }

    // The 9 pixels under the filter when its top-left corner is on (row, col)
    function windowAt(pixels, row, col) {
        return Array.from({ length: K * K }, function (unused, i) { return pixels[(row + Math.floor(i / K)) * SIZE + col + i % K]; });
    }

    // At each place: multiply square by square and add up (the blur then divides by 9)
    function convolve(pixels, filter) {
        return Array.from({ length: OUT * OUT }, function (unused, i) {
            let sum = 0;
            windowAt(pixels, Math.floor(i / OUT), i % OUT).forEach(function (value, j) { sum += value * filter.weights[j]; });
            return sum / filter.divide;
        });
    }

    // Edges give whole numbers from −3 to 3; a blur gives an average ("0.4"; its filter: "1/9")
    function show(value) {
        return Number.isInteger(value) ? A.format.number(value) : A.format.number(value, 1);
    }

    function weightText(filter, weight) {
        return filter.divide === 1 ? A.format.number(weight) : weight + "/" + filter.divide;
    }

    // A blur's sum as a fraction: "4/9 ≈ 0.44" (or just "0" and "1")
    function sumText(filter, value) {
        if (filter.divide === 1 || Number.isInteger(value)) return A.format.number(value);
        return Math.round(value * filter.divide) + "/" + filter.divide + " ≈ " + A.format.number(value, 2);
    }

    // ---------- 3. Drawing the lab ----------
    function build(host, api) {
        const state = api.state;
        if (!state.pixels) Object.assign(state, { pixels: shapePixels(FIRST_SHAPE), filter: "vertical", numbers: false, spot: FIRST_SPOT, cursor: 0 });
        const cells = function (count, kind) {
            return Array.from({ length: count }, function (unused, i) {
                return `<button type="button" class="px-cell" data-i="${i}" data-fid="w7-${kind}${i}" tabindex="-1"></button>`;
            }).join("");
        };
        const group = function (kind, title, ids) {
            return `<div class="px-group" role="group" aria-labelledby="px-${kind}"><p class="lsn-lab-sub mono" id="px-${kind}">${api.text(title)}</p>
                <div class="px-choices">${ids.map(function (id) {
                    return `<button type="button" class="lsn-pill px-pill" data-${kind}="${id}" data-fid="w7-${id}">${api.text(kind[0] + "." + id)}</button>`;
                }).join("")}</div></div>`;
        };
        host.innerHTML = `
            <div class="px-lab">
                <div class="px-controls">${group("shape", "shapes", ["square", "plus", "seven", "clear"])}${group("filter", "filter", Object.keys(FILTERS))}</div>
                <div class="px-boards">
                    <figure class="px-board">
                        <figcaption class="px-caption" id="px-picture-name">${api.text("picture", { size: SIZE })}</figcaption>
                        <div class="px-grid px-picture" role="group" aria-labelledby="px-picture-name" aria-describedby="px-paint" style="--px-n: ${SIZE};">${cells(SIZE * SIZE, "p")}<span class="px-window" aria-hidden="true"></span></div>
                        <p class="px-legend" aria-hidden="true"><span class="px-item"><span class="px-key is-white"></span>${api.text("bright")}</span><span class="px-item"><span class="px-key"></span>${api.text("dark")}</span></p>
                    </figure>
                    <span class="px-arrow" aria-hidden="true">→</span>
                    <figure class="px-board">
                        <figcaption class="px-caption" id="px-result-name">${api.text("result", { size: OUT })}</figcaption>
                        <div class="px-grid px-result" role="group" aria-labelledby="px-result-name" style="--px-n: ${OUT};">${cells(OUT * OUT, "r")}</div>
                        <p class="px-legend" aria-hidden="true"><span class="px-item px-for-edges"><span class="px-key is-pos"></span>${api.text("legendPos")}</span><span class="px-item px-for-edges"><span class="px-key is-neg"></span>${api.text("legendNeg")}</span><span class="px-item px-for-blur"><span class="px-key is-grey"></span>${api.text("legendBlur", { n: K * K })}</span></p>
                    </figure>
                </div>
                <button type="button" class="px-switch ui-switch" role="switch" aria-checked="false" data-px="numbers" data-fid="w7-numbers">
                    <span class="ui-switch-track" aria-hidden="true"><span class="ui-switch-knob"></span></span>${api.text("numbers")}
                </button>
                <div class="px-explain" data-px="explain"></div>
                <p class="px-status" data-px="status"></p>
                <p class="lsn-lab-small" id="px-paint">${api.text(A.media("(hover: none), (pointer: coarse)").matches ? "paintTouch" : "paint")}</p>
                <p class="lsn-lab-small">${api.text("why", { k: K })}</p>
            </div>`;

        const picture = host.querySelector(".px-picture");
        const result = host.querySelector(".px-result");
        const pictureCells = Array.prototype.slice.call(picture.querySelectorAll(".px-cell"));
        const resultCells = Array.prototype.slice.call(result.querySelectorAll(".px-cell"));
        const part = function (name) { return host.querySelector('[data-px="' + name + '"]'); };
        const place = function (i, n, value) { return { row: Math.floor(i / n) + 1, col: i % n + 1, value: value }; };
        const indexOf = function (element) {
            const cell = element && element.closest ? element.closest(".px-cell") : null;
            return cell ? Number(cell.getAttribute("data-i")) : -1;
        };
        let values = [];   // the result's numbers

        // ---------- 4. Updating it ----------
        function update() {
            const filter = FILTERS[state.filter];
            const blur = filter.divide > 1;
            values = convolve(state.pixels, filter);
            pictureCells.forEach(function (cell, i) {
                const on = state.pixels[i] === 1;
                cell.classList.toggle("is-white", on);
                A.dom.setAttr(cell, "aria-pressed", String(on));
                A.dom.setAttr(cell, "aria-label", api.text("pixel", place(i, SIZE, api.text(on ? "bright" : "dark"))));
                A.dom.setText(cell, state.numbers ? String(state.pixels[i]) : "");
            });
            resultCells.forEach(function (cell, i) {
                const value = values[i];
                const grey = Math.round(value * 255);
                cell.style.background = blur ? "rgb(" + grey + ", " + grey + ", " + grey + ")" : "";
                A.dom.setAttr(cell, "data-level", blur ? (value >= 0.5 ? "light" : "dark") : String(Math.abs(value)));
                A.dom.setAttr(cell, "data-sign", value > 0 ? "pos" : value < 0 ? "neg" : "zero");
                A.dom.setAttr(cell, "aria-label", api.text("cell", place(i, OUT, show(value))));
                A.dom.setText(cell, state.numbers ? show(value) : "");
            });
            host.querySelectorAll("[data-filter]").forEach(function (button) {
                A.dom.setAttr(button, "aria-pressed", String(button.getAttribute("data-filter") === state.filter));
            });
            A.dom.setAttr(part("numbers"), "aria-checked", String(state.numbers));
            host.firstElementChild.classList.toggle("is-blur", blur);   // the right legend (css/lessons-labs.css)
            host.firstElementChild.classList.toggle("has-numbers", state.numbers);
            A.dom.setText(part("status"), statusText());
            updateSpot();
        }

        // "Vertical edges: 32 squares of the result found an edge."
        function statusText() {
            if (FILTERS[state.filter].divide > 1) return api.text("blurred", { n: K * K });
            const name = api.text("f." + state.filter);
            const found = values.filter(function (value) { return value !== 0; }).length;
            return found ? api.plural("found", found, { filter: name }) : api.text("none", { filter: name });
        }

        // The explained square: the pixels under the filter, the filter, the products, the
        // sum, and all of it as one sentence for screen readers
        function spotMaths() {
            const filter = FILTERS[state.filter];
            const under = windowAt(state.pixels, state.spot.row, state.spot.col).map(String);
            const weights = filter.weights.map(function (weight) { return weightText(filter, weight); });
            const total = sumText(filter, values[state.spot.row * OUT + state.spot.col]);
            const rows = function (list) { return [0, 1, 2].map(function (r) { return list.slice(r * K, r * K + K).join(" "); }).join(", "); };
            const products = under.map(function (value, i) { return value === "0" ? "0" : weights[i]; });
            const spoken = api.text("sumSpoken", { window: rows(under), filter: rows(weights), sum: total });
            return { under: under, weights: weights, products: products, total: total, spoken: spoken };
        }

        // The explained square, its window on the picture, and the one square of each
        // grid that Tab reaches (the arrow keys do the rest)
        function updateSpot() {
            const spot = state.spot.row * OUT + state.spot.col;
            const maths = spotMaths();
            const mini = function (list, kind) { return `<span class="px-mini ${kind}">${list.map(function (text) { return "<span>" + text + "</span>"; }).join("")}</span>`; };
            resultCells.forEach(function (cell, i) {
                cell.classList.toggle("is-spot", i === spot);
                A.dom.setAttr(cell, "tabindex", i === spot ? "0" : "-1");
            });
            pictureCells.forEach(function (cell, i) { A.dom.setAttr(cell, "tabindex", i === state.cursor ? "0" : "-1"); });
            picture.style.setProperty("--px-row", state.spot.row);
            picture.style.setProperty("--px-col", state.spot.col);
            part("explain").innerHTML = `
                <p class="px-explain-title">${api.text("window", { row: state.spot.row + 1, col: state.spot.col + 1 })}</p>
                <p class="px-explain-lead">${api.text("sum")}</p>
                <div class="px-sum" aria-hidden="true">${mini(maths.under, "is-window")}<span class="px-op">×</span>${mini(maths.weights, "is-filter")}<span class="px-op">→</span>${mini(maths.products, "is-products")}<span class="px-op">=</span><strong class="px-total">${maths.total}</strong></div>
                <p class="sr-only">${maths.spoken}</p>`;
        }

        // ---------- 5. Painting (mouse, pen, touch and keyboard) ----------
        // A mouse or a pen paints while pressed (starting on a white pixel rubs out); a finger
        // taps one pixel (so the page still scrolls); Space or Enter changes the focused pixel.
        let paintValue = null;   // while painting: 1 paints, 0 rubs out
        let skipClick = false;   // the click that ends a mouse stroke was handled already

        picture.addEventListener("pointerdown", function (event) {
            const i = indexOf(event.target);
            if (i < 0 || event.pointerType === "touch" || event.button !== 0) return;
            paintValue = state.pixels[i] = state.pixels[i] ? 0 : 1;
            skipClick = true;
            state.cursor = i;
            if (picture.setPointerCapture) picture.setPointerCapture(event.pointerId);
            update();
        });

        picture.addEventListener("pointermove", function (event) {
            const under = paintValue === null ? null : document.elementFromPoint(event.clientX, event.clientY);
            const i = under && picture.contains(under) ? indexOf(under) : -1;
            if (i < 0 || state.pixels[i] === paintValue) return;
            state.pixels[i] = paintValue;
            update();
        });

        function endStroke() {
            if (paintValue === null) return;
            paintValue = null;
            api.announce(statusText());
            setTimeout(function () { skipClick = false; }, 0);
        }
        ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (type) { picture.addEventListener(type, endStroke); });

        picture.addEventListener("click", function (event) {
            const i = indexOf(event.target);
            if (skipClick || i < 0) {
                skipClick = false;
                return;
            }
            state.pixels[i] = state.pixels[i] ? 0 : 1;
            state.cursor = i;
            update();
            api.announce(pictureCells[i].getAttribute("aria-label") + ". " + statusText());
        });

        // Arrow keys, Home and End move around a grid (and never turn the reader's page)
        function arrowKeys(grid, list, n, onMove) {
            grid.addEventListener("keydown", function (event) {
                const i = indexOf(event.target);
                const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -n, ArrowDown: n, Home: -(i % n), End: n - 1 - i % n };
                if (i < 0 || !(event.key in moves)) return;
                event.preventDefault();
                const next = i + moves[event.key];
                const sideways = event.key === "ArrowLeft" || event.key === "ArrowRight";
                if (next < 0 || next >= n * n || (sideways && Math.floor(next / n) !== Math.floor(i / n))) return;
                onMove(next);
                list[next].focus();
            });
        }
        arrowKeys(picture, pictureCells, SIZE, function (i) {
            state.cursor = i;
            updateSpot();
        });

        // ---------- 6. Pointing at the result, and the buttons ----------
        function spotAt(i, speak) {
            if (i < 0) return;
            state.spot = { row: Math.floor(i / OUT), col: i % OUT };
            updateSpot();
            if (speak) api.announce(spotMaths().spoken);
        }
        arrowKeys(result, resultCells, OUT, function () {});   // focusin below does the work
        result.addEventListener("pointerover", function (event) {
            if (event.pointerType !== "touch") spotAt(indexOf(event.target), false);   // a mouse or a pen pointing
        });
        result.addEventListener("focusin", function (event) { spotAt(indexOf(event.target), true); });
        result.addEventListener("click", function (event) { spotAt(indexOf(event.target), false); });   // a tap (Safari doesn't focus buttons)

        host.querySelector(".px-lab").addEventListener("click", function (event) {
            const button = event.target.closest('[data-shape], [data-filter], [data-px="numbers"]');
            if (!button) return;
            if (button.hasAttribute("data-shape")) state.pixels = shapePixels(button.getAttribute("data-shape"));
            else if (button.hasAttribute("data-filter")) state.filter = button.getAttribute("data-filter");
            else state.numbers = !state.numbers;
            update();
            if (!button.hasAttribute("data-px")) api.announce(statusText());
        });

        update();
    }

    // ---------- 7. The lab for js/lessons.js ----------
    // No timers and no listeners outside host, so there is nothing to stop.
    A.lessons.defineLab("pixels", { build: build });
})();
