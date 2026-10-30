/* =========================================================
   AI COMPASS — LAB: HOW COMPUTERS SEE (convolution filters)
   To a computer a picture is a grid of numbers. A 3 × 3 filter slides
   over it, multiplies the 9 pixels under it by its 9 numbers and adds
   them up: one new pixel of the feature map. Three views:
     Filters          the picture and its feature map side by side, a
                      magnifier with the real numbers, the filter's 9 numbers
     Step by step     the picture shrunk to 16 × 16: the window slides,
                      and an equation shows each sum
     What a CNN sees  a tiny two-layer network with filters set by hand
   Texts and data (pictures, ready filters, the network):
   js/content/lab/vision.js. Tests: dev/tests/vision.math.js (Node) and
   dev/tests/vision.test.js (Playwright).

   Sections:
    1. Settings
    2. Small helpers (what core and the kit lack)
    3. The maths: grids, the filter, ReLU, pooling
    4. Pictures: presets, the draw pad, photos
    5. The tiny network ("What a CNN sees")
    6. The "Try this" checks
    7. Drawing on screen
    8. The experiment (A.lab.define)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lab || !A.lab.define) return;

    const t = A.t;
    const kit = A.labKit;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
    const SIZE = 96;                  // every picture is 96 x 96 pixels: 0 is black, 255 is white
    const SAMPLES = 4;                // preset shapes: 4 x 4 samples in each pixel, for smooth edges
    const COARSE = 16;                // step by step: the picture shrunk to 16 x 16
    const NUMBER = { min: -10, max: 10, step: 0.1 };      // the filter's numbers
    const DIVISOR = { min: 1, max: 100, step: 1 };        // "divide by" (the blur filters use 9 and 16)
    const SMALLEST = 8;               // "Apply again" needs a feature map at least 8 x 8
    const LOUPE = 5;                  // the magnifier shows 5 x 5 numbers
    const SWEEP_RATE = 6;             // Play in step by step: windows per second
    const PEN = { radius: 3.5, value: 255, background: 0 };   // the draw pad: a white pen on black
    const DEFAULTS = { picture: "shapes", filter: "outline", edges: "same", relu: false, pool: false, view: "filter" };
    const DIVERGE_RANGE = 255;        // without ReLU, colours go from −255 (full red) to 255 (full cyan)
    const MAP_FLOOR = 0.1;            // a network map stays dark until it reaches 10% of its biggest possible answer
    const STEP_LAYOUT = { gap: 34, caption: 24, margin: 12, most: 30, numbers: 22, uneven: 26, least: 8 };
    // The "Try this" goals
    const CHECK = {
        edgeRatio: 4,                 // 1: vertical edges answer more than 4 times the horizontal ones...
        edgeMargin: 3,                //    ...measured at least 3 px away from the corners of the squares
        edgeLeast: 1,                 //    ...and the vertical ones answer at all
        brighter: 1.4,                // 2: the map is 1.4 times as bright as the picture...
        darkest: 10,                  //    ...which is not almost black to start with
        blurs: 3,                     // 3: "Apply again" 3 times in a row with a blur on Letters AI
        blurSum: 0.05                 //    a blur's numbers add up to 1 (give or take 0.05)
    };
    const SAVE_VERSION = 1;           // ctx.store "settings" = { v, picture, numbers, divisor, edges, relu, pool, view }
                                      // ctx.store "drawing" = { v, data } (the pad's 96 x 96 bytes, base64)
    const VIEWS = ["filter", "step", "cnn"];
    const EDGES = ["same", "valid"];
    const PHOTO_ICON = '<svg class="lk-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
        '<rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>' +
        '<circle cx="9" cy="10" r="1.8" fill="currentColor"/><path d="M4.5 17.5l5-5 3.5 3.5 2.5-2.5 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
    const AGAIN_ICON = '<svg class="lk-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
        '<path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M18 2.5v4.2h-4.2M6 21.5v-4.2h4.2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    function el(tag, className, attributes) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        Object.keys(attributes || {}).forEach(function (name) { element.setAttribute(name, attributes[name]); });
        return element;
    }

    // An element whose text is a translation key (core and kit.relabel() write it again)
    function textEl(tag, className, key) {
        const element = el(tag, className, { "data-i18n": key });
        element.innerHTML = t(key);
        return element;
    }

    // A number for equations and captions: up to 2 decimals, the local way, with a real minus
    function num(value) {
        const rounded = Math.round(value * 100) / 100;
        return A.format.number(rounded === 0 ? 0 : rounded, { maxDigits: 2 });
    }

    // Rounds to a control's step (0.1 or 1) without "0.30000000000000004"
    function snap(value, settings) {
        const decimals = settings.step < 1 ? 1 : 0;
        return Number((Math.round(A.util.clamp(value, settings.min, settings.max) / settings.step) * settings.step).toFixed(decimals));
    }

    // TODO(kit): kit.numberField({ min, max, step, value, onInput, onChange }): a number box the
    // keyboard can change (arrow keys step it). While someone types, the last good number counts;
    // on leaving the box it shows the clean number (in range, on the step).
    function numberField(settings) {
        const input = el("input", "cv-number", {
            type: "number", min: String(settings.min), max: String(settings.max), step: String(settings.step)
        });
        let value = settings.value;
        input.value = String(value);

        function read() {
            const typed = input.valueAsNumber;
            return isFinite(typed) ? snap(typed, settings) : NaN;
        }
        input.addEventListener("input", function () {
            const next = read();
            if (!isFinite(next) || next === value) return;
            value = next;
            settings.onInput(value);
        });
        input.addEventListener("change", function () {
            const next = read();
            if (isFinite(next)) value = next;
            input.value = String(value);
            if (settings.onChange) settings.onChange(value);
        });
        return {
            element: input,
            value: function () { return value; },
            set: function (next) {
                value = next;
                if (input.valueAsNumber !== next) input.value = String(next);
            }
        };
    }

    // TODO(kit): kit.fileButton(label, { accept, icon, onFile }): a kit button that opens the
    // file picker (the real <input type="file"> stays hidden and out of the Tab order)
    function fileButton(labelKey, settings) {
        const input = el("input", "cv-file", { type: "file", accept: settings.accept, tabindex: "-1", "aria-hidden": "true" });
        const button = kit.button(labelKey, { icon: settings.icon, onClick: function () { input.click(); } });
        input.addEventListener("change", function () {
            const file = input.files && input.files[0];
            input.value = "";               // choosing the same file again is a new choice
            if (file) settings.onFile(file);
        });
        const element = el("span", "cv-file-button");
        element.append(button.element, input);
        return { element: element, button: button, input: input };
    }

    // TODO(kit): kit.sentence(key, parts): a translated text whose {placeholders} are elements
    // (glossary links). Call it again after a language change: the elements are reused.
    function fillSentence(element, key, parts) {
        element.textContent = "";
        t(key).split(/(\{[a-zA-Z]+\})/).forEach(function (piece) {
            const name = /^\{([a-zA-Z]+)\}$/.exec(piece);
            if (name && parts[name[1]]) element.appendChild(parts[name[1]]);
            else if (piece) element.appendChild(document.createTextNode(piece));
        });
    }

    // A translated attribute that follows the language. It joins the element's other
    // data-i18n-attr pairs, so a binding the kit made (a canvas's aria-label) stays.
    // TODO(kit): export kit.bindAttribute (kit.js has it inside)
    function translateAttr(element, attribute, key) {
        const pairs = (element.getAttribute("data-i18n-attr") || "").split(",").filter(function (pair) {
            return pair && pair.split(":")[0].trim() !== attribute;
        });
        pairs.push(attribute + ":" + key);
        element.setAttribute("data-i18n-attr", pairs.join(","));
        element.setAttribute(attribute, t(key));
    }

    // TODO(kit): kit.pixelCanvas(): a canvas that shows a grid of numbers at its own size and
    // is scaled up by CSS with sharp square pixels (image-rendering: pixelated)
    function pixelCanvas(className) {
        const canvas = el("canvas", "cv-pixels" + (className ? " " + className : ""));
        canvas.width = SIZE;
        canvas.height = SIZE;
        return canvas;
    }

    /* =========================================================
       3. THE MATHS: GRIDS, THE FILTER, RELU, POOLING
       A grid is { w, h, data }: the numbers row by row, top left first.
       ========================================================= */
    function makeGrid(w, h) {
        return { w: w, h: h, data: new Float64Array(w * h) };
    }

    function copyGrid(grid) {
        return { w: grid.w, h: grid.h, data: new Float64Array(grid.data) };
    }

    // A pixel, or 0 outside the picture ("same size" pads the picture with zeros)
    function pixelAt(grid, x, y) {
        if (x < 0 || y < 0 || x >= grid.w || y >= grid.h) return 0;
        return grid.data[y * grid.w + x];
    }

    // How big the feature map of a w x h picture is: the same, or 2 px smaller ("only full windows")
    function outputSize(w, h, edges) {
        const cut = edges === "valid" ? 2 : 0;
        return { w: Math.max(0, w - cut), h: Math.max(0, h - cut) };
    }

    // The 9 pixels under the window whose centre is (x, y), row by row
    function windowAt(grid, x, y) {
        const pixels = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) pixels.push(pixelAt(grid, x + dx, y + dy));
        }
        return pixels;
    }

    // One new pixel: the 9 pixels times the filter's 9 numbers, added up, divided by the divisor.
    // (Maths calls this sliding sum cross-correlation; neural networks call it convolution.)
    function convolveAt(grid, filter, x, y) {
        const numbers = filter.numbers;
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) sum += numbers[(dy + 1) * 3 + dx + 1] * pixelAt(grid, x + dx, y + dy);
        }
        return sum / (filter.divisor || 1);
    }

    // The whole feature map. edges "same": every pixel gets a window (zeros outside);
    // "valid": only windows that fit inside the picture, so the map is 2 px smaller.
    function convolve(grid, filter, edges) {
        const size = outputSize(grid.w, grid.h, edges);
        const out = makeGrid(size.w, size.h);
        const shift = edges === "valid" ? 1 : 0;
        const n = filter.numbers;
        const divisor = filter.divisor || 1;
        const w = grid.w;
        const data = grid.data;
        for (let y = 0; y < size.h; y++) {
            const cy = y + shift;
            for (let x = 0; x < size.w; x++) {
                const cx = x + shift;
                let sum = 0;
                if (cx > 0 && cy > 0 && cx < w - 1 && cy < grid.h - 1) {
                    // inside: the quick way, no checks for the edges
                    const at = cy * w + cx;
                    sum = n[0] * data[at - w - 1] + n[1] * data[at - w] + n[2] * data[at - w + 1] +
                        n[3] * data[at - 1] + n[4] * data[at] + n[5] * data[at + 1] +
                        n[6] * data[at + w - 1] + n[7] * data[at + w] + n[8] * data[at + w + 1];
                    out.data[y * size.w + x] = sum / divisor;
                } else {
                    out.data[y * size.w + x] = convolveAt(grid, filter, cx, cy);
                }
            }
        }
        return out;
    }

    // ReLU: every negative number becomes 0
    function relu(grid) {
        const out = makeGrid(grid.w, grid.h);
        for (let i = 0; i < grid.data.length; i++) out.data[i] = grid.data[i] > 0 ? grid.data[i] : 0;
        return out;
    }

    // Max pooling 2 x 2: the biggest number of each 2 x 2 block (an odd last row or column is dropped)
    function maxPool(grid) {
        const out = makeGrid(Math.floor(grid.w / 2), Math.floor(grid.h / 2));
        for (let y = 0; y < out.h; y++) {
            for (let x = 0; x < out.w; x++) {
                const at = 2 * y * grid.w + 2 * x;
                out.data[y * out.w + x] = Math.max(grid.data[at], grid.data[at + 1], grid.data[at + grid.w], grid.data[at + grid.w + 1]);
            }
        }
        return out;
    }

    // The feature map as the next picture ("Apply again"): whole numbers from 0 to 255
    function toPicture(grid) {
        const out = makeGrid(grid.w, grid.h);
        for (let i = 0; i < grid.data.length; i++) out.data[i] = Math.round(A.util.clamp(grid.data[i], 0, 255));
        return out;
    }

    // The average brightness as the eye sees it: below 0 shows as black, above 255 as white
    function brightness(grid) {
        if (!grid.data.length) return 0;
        let sum = 0;
        for (let i = 0; i < grid.data.length; i++) sum += A.util.clamp(grid.data[i], 0, 255);
        return sum / grid.data.length;
    }

    function extremes(grid) {
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < grid.data.length; i++) {
            if (grid.data[i] < min) min = grid.data[i];
            if (grid.data[i] > max) max = grid.data[i];
        }
        return grid.data.length ? { min: min, max: max } : { min: 0, max: 0 };
    }

    // Grey from a colour, with the Rec. 601 weights (the eye sees green as brightest):
    // grey = 0.299 · red + 0.587 · green + 0.114 · blue
    function grayscale(red, green, blue) {
        return 0.299 * red + 0.587 * green + 0.114 * blue;
    }

    // The biggest square in the middle of a w x h photo
    function cropBox(w, h) {
        const size = Math.min(w, h);
        return { x: Math.floor((w - size) / 2), y: Math.floor((h - size) / 2), size: size };
    }

    // A grid shrunk (or grown) to w x h: each new pixel is the average of the old pixels it
    // covers, parts of pixels counted by their share
    function shrink(grid, w, h) {
        const out = makeGrid(w, h);
        const sx = grid.w / w;
        const sy = grid.h / h;
        for (let oy = 0; oy < h; oy++) {
            const y0 = oy * sy;
            const y1 = y0 + sy;
            for (let ox = 0; ox < w; ox++) {
                const x0 = ox * sx;
                const x1 = x0 + sx;
                let sum = 0;
                for (let y = Math.floor(y0); y < Math.min(grid.h, Math.ceil(y1 - 1e-9)); y++) {
                    const wy = Math.min(y + 1, y1) - Math.max(y, y0);
                    for (let x = Math.floor(x0); x < Math.min(grid.w, Math.ceil(x1 - 1e-9)); x++) {
                        sum += wy * (Math.min(x + 1, x1) - Math.max(x, x0)) * grid.data[y * grid.w + x];
                    }
                }
                out.data[oy * w + ox] = sum / (sx * sy);
            }
        }
        return out;
    }

    function sameNumbers(a, b) {
        return a.length === b.length && a.every(function (value, i) { return Math.abs(value - b[i]) < 1e-9; });
    }

    // Negative numbers on one side, positive on the other: an edge finder
    function hasBothSigns(numbers) {
        return numbers.some(function (n) { return n < 0; }) && numbers.some(function (n) { return n > 0; });
    }

    // A blur: no negative numbers, more than one number used, and they add up to 1 (after dividing)
    function isBlur(filter) {
        const sum = filter.numbers.reduce(function (a, b) { return a + b; }, 0);
        const biggest = Math.max.apply(null, filter.numbers);
        return filter.numbers.every(function (n) { return n >= 0; }) && sum > 0 && biggest < sum &&
            Math.abs(sum / (filter.divisor || 1) - 1) <= CHECK.blurSum;
    }

    /* =========================================================
       4. PICTURES: PRESETS, THE DRAW PAD, PHOTOS
       ========================================================= */
    function segmentDistance(x, y, from, to) {
        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const length2 = dx * dx + dy * dy;
        const k = length2 ? A.util.clamp(((x - from[0]) * dx + (y - from[1]) * dy) / length2, 0, 1) : 0;
        return Math.hypot(x - (from[0] + k * dx), y - (from[1] + k * dy));
    }

    // Is (x, y) inside the polygon? (A ray to the right crosses its sides an odd number of times.)
    function insidePolygon(points, x, y) {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const a = points[i];
            const b = points[j];
            if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
        }
        return inside;
    }

    // Is the point (x, y) (in pixels, 0 to 96) inside a shape of the content file?
    function insideShape(shape, x, y) {
        switch (shape.type) {
            case "rect":
                return x >= shape.x && x < shape.x + shape.w && y >= shape.y && y < shape.y + shape.h;
            case "circle":
                return (x - shape.x) * (x - shape.x) + (y - shape.y) * (y - shape.y) <= shape.r * shape.r;
            case "polygon":
                return insidePolygon(shape.points, x, y);
            case "line":
                return segmentDistance(x, y, shape.from, shape.to) <= shape.width / 2;
            case "arc": {
                // a band around a circle between two angles (degrees, clockwise from "right"), with
                // round ends. The round ends lie inside the band too, so a point off it is out.
                const distance = Math.sqrt((x - shape.x) * (x - shape.x) + (y - shape.y) * (y - shape.y));
                if (Math.abs(distance - shape.r) > shape.width / 2) return false;
                let angle = (Math.atan2(y - shape.y, x - shape.x) * 180) / Math.PI;
                if (angle < 0) angle += 360;
                if (angle >= shape.from && angle <= shape.to) return true;
                return [shape.from, shape.to].some(function (end) {
                    const ex = shape.x + shape.r * Math.cos((end * Math.PI) / 180);
                    const ey = shape.y + shape.r * Math.sin((end * Math.PI) / 180);
                    return Math.hypot(x - ex, y - ey) <= shape.width / 2;
                });
            }
            case "checker":
                return (Math.floor(x / shape.size) + Math.floor(y / shape.size)) % 2 === 1;
            case "stripes":
                return (((x + y) % shape.period) + shape.period) % shape.period < shape.period / 2;
            default:
                return false;
        }
    }

    // The box a shape stays in, in pixels (the whole picture for patterns): only the points in it
    // need testing, which makes drawing a picture about ten times quicker
    function shapeBounds(shape) {
        let box;
        switch (shape.type) {
            case "rect":
                box = [shape.x, shape.y, shape.x + shape.w, shape.y + shape.h];
                break;
            case "circle":
                box = [shape.x - shape.r, shape.y - shape.r, shape.x + shape.r, shape.y + shape.r];
                break;
            case "polygon": {
                const xs = shape.points.map(function (p) { return p[0]; });
                const ys = shape.points.map(function (p) { return p[1]; });
                box = [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)];
                break;
            }
            case "line": {
                const half = shape.width / 2;
                box = [Math.min(shape.from[0], shape.to[0]) - half, Math.min(shape.from[1], shape.to[1]) - half,
                    Math.max(shape.from[0], shape.to[0]) + half, Math.max(shape.from[1], shape.to[1]) + half];
                break;
            }
            case "arc": {
                const reach = shape.r + shape.width / 2;
                box = [shape.x - reach, shape.y - reach, shape.x + reach, shape.y + reach];
                break;
            }
            default:
                box = [0, 0, SIZE, SIZE];
        }
        return box.map(function (v, i) { return A.util.clamp(i < 2 ? Math.floor(v) - 1 : Math.ceil(v) + 1, 0, SIZE); });
    }

    // A preset picture, drawn by code (no image files): the background, then each shape on top,
    // tested at 4 x 4 points in every pixel and averaged, so edges are smooth. Plain maths and no
    // canvas, so a preset is the same number for number in every browser.
    function drawPicture(spec) {
        const fine = SIZE * SAMPLES;
        const points = new Float64Array(fine * fine).fill(spec.background);
        spec.shapes.forEach(function (shape) {
            const box = shapeBounds(shape);
            for (let py = box[1] * SAMPLES; py < box[3] * SAMPLES; py++) {
                const y = (py + 0.5) / SAMPLES;
                for (let px = box[0] * SAMPLES; px < box[2] * SAMPLES; px++) {
                    if (insideShape(shape, (px + 0.5) / SAMPLES, y)) points[py * fine + px] = shape.value;
                }
            }
        });
        const picture = makeGrid(SIZE, SIZE);
        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
                let sum = 0;
                for (let j = 0; j < SAMPLES; j++) {
                    for (let i = 0; i < SAMPLES; i++) sum += points[(y * SAMPLES + j) * fine + x * SAMPLES + i];
                }
                picture.data[y * SIZE + x] = Math.round(sum / (SAMPLES * SAMPLES));
            }
        }
        return picture;
    }

    function blankPicture() {
        const picture = makeGrid(SIZE, SIZE);
        picture.data.fill(PEN.background);
        return picture;
    }

    // The pen: a round dot with a soft rim (x, y in pixels, may be between pixels)
    function paintDot(picture, x, y) {
        const reach = PEN.radius + 1;
        for (let py = Math.max(0, Math.floor(y - reach)); py <= Math.min(picture.h - 1, Math.ceil(y + reach)); py++) {
            for (let px = Math.max(0, Math.floor(x - reach)); px <= Math.min(picture.w - 1, Math.ceil(x + reach)); px++) {
                const cover = A.util.clamp(PEN.radius + 0.5 - Math.hypot(px + 0.5 - x, py + 0.5 - y), 0, 1);
                const at = py * picture.w + px;
                picture.data[at] = Math.max(picture.data[at], Math.round(PEN.value * cover));
            }
        }
    }

    // A stroke from one point to the next: dots half a pixel apart
    function paintLine(picture, from, to) {
        const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / 0.5));
        for (let i = 0; i <= steps; i++) paintDot(picture, from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
    }

    // The drawing for ctx.store: 96 x 96 bytes as base64 (about 12 KB)
    function encodePicture(picture) {
        let bytes = "";
        for (let i = 0; i < picture.data.length; i++) bytes += String.fromCharCode(A.util.clamp(Math.round(picture.data[i]), 0, 255));
        return btoa(bytes);
    }

    // ...and back; null for anything that is not a 96 x 96 drawing
    function decodePicture(text) {
        let bytes;
        try {
            bytes = atob(String(text));
        } catch (error) {
            return null;
        }
        if (bytes.length !== SIZE * SIZE) return null;
        const picture = makeGrid(SIZE, SIZE);
        for (let i = 0; i < bytes.length; i++) picture.data[i] = bytes.charCodeAt(i);
        return picture;
    }

    // A photo as a picture: the middle square, 96 x 96, in grey. It is drawn at 4 times the size
    // (on white, for see-through parts) and shrunk by averaging, which is smoother than one big jump.
    function photoPicture(image) {
        const box = cropBox(image.naturalWidth || image.width, image.naturalHeight || image.height);
        const big = SIZE * SAMPLES;
        const canvas = document.createElement("canvas");
        canvas.width = big;
        canvas.height = big;
        const context = canvas.getContext("2d");
        context.fillStyle = "#fff";
        context.fillRect(0, 0, big, big);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, box.x, box.y, box.size, box.size, 0, 0, big, big);
        const pixels = context.getImageData(0, 0, big, big).data;
        const grey = makeGrid(big, big);
        for (let i = 0; i < big * big; i++) grey.data[i] = grayscale(pixels[4 * i], pixels[4 * i + 1], pixels[4 * i + 2]);
        return toPicture(shrink(grey, SIZE, SIZE));
    }

    /* =========================================================
       5. THE TINY NETWORK ("WHAT A CNN SEES")
       Layer 1: 4 edge filters on the picture (0 to 1), ReLU, max pooling.
       Layer 2: 3 filters; each adds up one 3 x 3 filter on each of the 4
       layer-1 maps (3 x 3 x 4 numbers), then ReLU and max pooling.
       ========================================================= */
    function runNetwork(picture, network) {
        const scaled = makeGrid(picture.w, picture.h);
        for (let i = 0; i < picture.data.length; i++) scaled.data[i] = picture.data[i] / 255;
        const layer1 = network.layer1.map(function (filter) {
            return maxPool(relu(convolve(scaled, { numbers: filter.numbers, divisor: 1 }, "same")));
        });
        const layer2 = network.layer2.map(function (filter) {
            const sum = makeGrid(layer1[0].w, layer1[0].h);
            filter.grids.forEach(function (numbers, i) {
                const part = convolve(layer1[i], { numbers: numbers, divisor: 1 }, "same");
                for (let k = 0; k < sum.data.length; k++) sum.data[k] += part.data[k];
            });
            return maxPool(relu(sum));
        });
        return { layer1: layer1, layer2: layer2 };
    }

    // The biggest answer a filter can give when everything it likes is at full strength
    // (a layer-1 map answers at most 4: 1 + 2 + 1 for a black-to-white edge)
    function biggestAnswer(grids, input) {
        let positive = 0;
        grids.forEach(function (numbers) { numbers.forEach(function (n) { if (n > 0) positive += n; }); });
        return positive * input;
    }

    /* =========================================================
       6. THE "TRY THIS" CHECKS
       ========================================================= */
    // Challenge 1, on the Checkerboard (squares of `cell` px): the average size of the answers
    // (|value|) next to vertical edges and next to horizontal edges, away from the corners and
    // from the border of the picture. `map` is the "same size" feature map, before ReLU.
    function edgeAnswers(map, cell) {
        let vertical = 0;
        let verticalCount = 0;
        let horizontal = 0;
        let horizontalCount = 0;
        for (let y = 1; y < map.h - 1; y++) {
            const ay = y % cell;
            for (let x = 1; x < map.w - 1; x++) {
                const ax = x % cell;
                const size = Math.abs(map.data[y * map.w + x]);
                if ((ax === 0 || ax === cell - 1) && ay >= CHECK.edgeMargin && ay < cell - CHECK.edgeMargin) {
                    vertical += size;
                    verticalCount++;
                }
                if ((ay === 0 || ay === cell - 1) && ax >= CHECK.edgeMargin && ax < cell - CHECK.edgeMargin) {
                    horizontal += size;
                    horizontalCount++;
                }
            }
        }
        return { vertical: vertical / Math.max(1, verticalCount), horizontal: horizontal / Math.max(1, horizontalCount) };
    }

    function verticalOnly(answers) {
        return answers.vertical >= CHECK.edgeLeast && answers.vertical > CHECK.edgeRatio * answers.horizontal;
    }

    /* =========================================================
       7. DRAWING ON SCREEN
       ========================================================= */
    // A grid into a pixel canvas: grey (0 black, 255 white) or, with diverging: true, the kit's
    // colours for numbers below and above 0. top: the number that shows as full white.
    function paintGrid(canvas, grid, options) {
        const settings = options || {};
        if (canvas.width !== grid.w) canvas.width = grid.w;
        if (canvas.height !== grid.h) canvas.height = grid.h;
        if (!grid.w || !grid.h) return;
        const context = canvas.getContext("2d");
        const image = context.createImageData(grid.w, grid.h);
        const top = settings.top || 255;
        for (let i = 0; i < grid.data.length; i++) {
            let rgb;
            if (settings.diverging) {
                rgb = kit.diverge.rgb(grid.data[i] / DIVERGE_RANGE);
            } else {
                const grey = Math.round(255 * A.util.clamp(grid.data[i] / top, 0, 1));
                rgb = [grey, grey, grey];
            }
            image.data[4 * i] = rgb[0];
            image.data[4 * i + 1] = rgb[1];
            image.data[4 * i + 2] = rgb[2];
            image.data[4 * i + 3] = 255;
        }
        context.putImageData(image, 0, 0);
    }

    // The colour of one number for a canvas or a cell: grey, or diverging without ReLU
    function cellColor(value, diverging) {
        if (diverging) return kit.diverge(value / DIVERGE_RANGE);
        const grey = Math.round(A.util.clamp(value, 0, 255));
        return "rgb(" + grey + ", " + grey + ", " + grey + ")";
    }

    // Dark text on light cells, light text on dark ones (the cells are data, not theme)
    function inkFor(value, diverging) {
        if (diverging) return kit.colors().text;
        return value > 120 ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
    }

    // Where everything goes in the step-by-step canvas, for a canvas `width` px wide: two grids
    // with numbers in the cells if they fit, else the picture with numbers and a smaller map,
    // else (a phone) two small grids and the numbers only in the equation below.
    function stepLayout(width) {
        const S = STEP_LAYOUT;
        const room = width - S.gap - 2 * S.margin;
        let cellIn = Math.floor(room / (2 * COARSE));
        let cellOut = cellIn;
        if (cellIn < S.numbers) {
            const big = Math.min(S.uneven, Math.floor((room - COARSE * S.least) / COARSE));
            if (big >= S.numbers) {
                cellIn = big;
                cellOut = Math.floor((room - COARSE * big) / COARSE);
            }
        }
        cellIn = Math.max(4, Math.min(S.most, cellIn));
        cellOut = Math.max(4, Math.min(S.most, cellOut));
        const used = COARSE * (cellIn + cellOut) + S.gap;
        const left = Math.max(S.margin, Math.floor((width - used) / 2));
        return {
            cellIn: cellIn,
            cellOut: cellOut,
            inX: left,
            outX: left + COARSE * cellIn + S.gap,
            top: S.caption + S.margin,
            height: S.caption + 2 * S.margin + COARSE * Math.max(cellIn, cellOut),
            numbersIn: cellIn >= S.numbers,
            numbersOut: cellOut >= S.uneven
        };
    }

    // The step-by-step picture: the 16 x 16 picture with the 3 x 3 window, an arrow, and the
    // feature map filled in up to the pixel being worked out (which lights up)
    function drawStep(view, s) {
        const context = view.ctx;
        const c = kit.colors();
        const L = stepLayout(view.width);
        const map = s.map;
        const shift = s.edges === "valid" ? 1 : 0;
        context.clearRect(0, 0, view.width, view.height);

        // Captions
        context.font = kit.font(12, 600);
        context.fillStyle = c.muted;
        context.textAlign = "left";
        context.textBaseline = "middle";
        const outCaption = [t("lab.vision.stepOut", { w: map.w, h: map.h }), t("lab.vision.stepOutShort", { w: map.w, h: map.h })]
            .filter(function (text, i) { return i === 1 || context.measureText(text).width <= view.width - L.outX; })[0];
        context.fillText(t("lab.vision.stepIn"), L.inX, STEP_LAYOUT.caption / 2 + 2);
        context.fillText(outCaption, L.outX, STEP_LAYOUT.caption / 2 + 2);

        // The picture's cells, with their numbers when they fit
        const small = kit.font(11, 600);
        context.font = small;
        context.textAlign = "center";
        for (let y = 0; y < COARSE; y++) {
            for (let x = 0; x < COARSE; x++) {
                const value = s.coarse.data[y * COARSE + x];
                context.fillStyle = cellColor(value, false);
                context.fillRect(L.inX + x * L.cellIn, L.top + y * L.cellIn, L.cellIn, L.cellIn);
                if (L.numbersIn) {
                    context.fillStyle = inkFor(value, false);
                    context.fillText(String(Math.round(value)), L.inX + (x + 0.5) * L.cellIn, L.top + (y + 0.5) * L.cellIn + 0.5);
                }
            }
        }

        // The map's frame (16 x 16: a "valid" map sits one cell in from each side), then its cells
        // up to the current one
        context.fillStyle = kit.alpha(c.text, 0.05);
        context.fillRect(L.outX, L.top, COARSE * L.cellOut, COARSE * L.cellOut);
        const diverging = !s.relu;
        let showOut = L.numbersOut;
        if (showOut) {
            for (let i = 0; i <= s.index; i++) {
                if (context.measureText(num(Math.round(s.shown[i]))).width + 4 > L.cellOut) showOut = false;
            }
        }
        for (let i = 0; i <= s.index && i < map.data.length; i++) {
            const x = (i % map.w) + shift;
            const y = Math.floor(i / map.w) + shift;
            const value = s.shown[i];
            context.fillStyle = cellColor(value, diverging);
            context.fillRect(L.outX + x * L.cellOut, L.top + y * L.cellOut, L.cellOut, L.cellOut);
            if (showOut) {
                context.fillStyle = inkFor(value, diverging);
                context.fillText(num(Math.round(value)), L.outX + (x + 0.5) * L.cellOut, L.top + (y + 0.5) * L.cellOut + 0.5);
            }
        }

        // Thin lines between the cells
        context.strokeStyle = kit.alpha(c.text, 0.12);
        context.lineWidth = 1;
        context.beginPath();
        for (let k = 0; k <= COARSE; k++) {
            context.moveTo(L.inX + k * L.cellIn + 0.5, L.top);
            context.lineTo(L.inX + k * L.cellIn + 0.5, L.top + COARSE * L.cellIn);
            context.moveTo(L.inX, L.top + k * L.cellIn + 0.5);
            context.lineTo(L.inX + COARSE * L.cellIn, L.top + k * L.cellIn + 0.5);
            context.moveTo(L.outX + k * L.cellOut + 0.5, L.top);
            context.lineTo(L.outX + k * L.cellOut + 0.5, L.top + COARSE * L.cellOut);
            context.moveTo(L.outX, L.top + k * L.cellOut + 0.5);
            context.lineTo(L.outX + COARSE * L.cellOut, L.top + k * L.cellOut + 0.5);
        }
        context.stroke();

        // The arrow from the picture to the map
        const arrowY = L.top + (COARSE * Math.min(L.cellIn, L.cellOut)) / 2;
        const arrowX = L.inX + COARSE * L.cellIn + 8;
        context.strokeStyle = c.muted;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(arrowX, arrowY);
        context.lineTo(arrowX + STEP_LAYOUT.gap - 16, arrowY);
        context.moveTo(arrowX + STEP_LAYOUT.gap - 22, arrowY - 5);
        context.lineTo(arrowX + STEP_LAYOUT.gap - 16, arrowY);
        context.lineTo(arrowX + STEP_LAYOUT.gap - 22, arrowY + 5);
        context.stroke();

        // The window on the picture and the pixel of the map it makes. At the border the window
        // sticks out of the picture (those pixels count as 0): it is cut off a little way out.
        const ox = s.index % map.w;
        const oy = Math.floor(s.index / map.w);
        const cx = ox + shift;
        const cy = oy + shift;
        const reach = STEP_LAYOUT.margin;
        context.save();
        context.beginPath();
        context.rect(L.inX - reach, L.top - reach, COARSE * L.cellIn + 2 * reach, COARSE * L.cellIn + 2 * reach);
        context.rect(L.outX - reach, L.top - reach, COARSE * L.cellOut + 2 * reach, COARSE * L.cellOut + 2 * reach);
        context.clip();
        if (s.glow) {
            context.shadowColor = c.accent;
            context.shadowBlur = 10;
        }
        context.strokeStyle = c.accent;
        context.lineWidth = 3;
        context.strokeRect(L.inX + (cx - 1) * L.cellIn, L.top + (cy - 1) * L.cellIn, 3 * L.cellIn, 3 * L.cellIn);
        context.strokeRect(L.outX + cx * L.cellOut - 1, L.top + cy * L.cellOut - 1, L.cellOut + 2, L.cellOut + 2);
        context.restore();
        return L;
    }

    /* =========================================================
       8. THE EXPERIMENT
       ========================================================= */
    A.lab.define("vision", {
        // The maths, for dev/tests/vision.math.js (the hub doesn't use it)
        maths: {
            makeGrid: makeGrid, pixelAt: pixelAt, outputSize: outputSize, windowAt: windowAt, convolveAt: convolveAt,
            convolve: convolve, relu: relu, maxPool: maxPool, toPicture: toPicture, brightness: brightness,
            grayscale: grayscale, cropBox: cropBox, shrink: shrink, isBlur: isBlur, hasBothSigns: hasBothSigns,
            drawPicture: drawPicture, paintLine: paintLine, blankPicture: blankPicture, encodePicture: encodePicture,
            decodePicture: decodePicture, runNetwork: runNetwork, biggestAnswer: biggestAnswer,
            edgeAnswers: edgeAnswers, verticalOnly: verticalOnly, stepLayout: stepLayout,
            settings: { SIZE: SIZE, COARSE: COARSE, CHECK: CHECK, NUMBER: NUMBER, DIVISOR: DIVISOR }
        },

        create: function (stage, ctx) {
            const data = A.content.get("lab.vision");
            const presets = data.pictures;
            const filterPresets = data.filters;
            const network = data.network;
            const presetIds = presets.map(function (p) { return p.id; });

            // ----- Saved settings and drawing (checked; anything odd: the defaults) -----
            function goodNumber(value, limits) {
                return typeof value === "number" && isFinite(value) && value >= limits.min && value <= limits.max;
            }
            const saved = ctx.store.get("settings", null, function (value) {
                return value && value.v === SAVE_VERSION &&
                    (presetIds.indexOf(value.picture) !== -1 || value.picture === "draw") &&
                    Array.isArray(value.numbers) && value.numbers.length === 9 &&
                    value.numbers.every(function (n) { return goodNumber(n, NUMBER); }) &&
                    goodNumber(value.divisor, DIVISOR) && EDGES.indexOf(value.edges) !== -1 &&
                    typeof value.relu === "boolean" && typeof value.pool === "boolean" && VIEWS.indexOf(value.view) !== -1;
            });
            const savedDrawing = ctx.store.get("drawing", null, function (value) {
                return value && value.v === SAVE_VERSION && typeof value.data === "string" && decodePicture(value.data) !== null;
            });
            const startFilter = filterPresets.filter(function (f) { return f.id === DEFAULTS.filter; })[0];

            // ----- State -----
            const state = {
                pictureId: saved ? saved.picture : DEFAULTS.picture,     // a preset's id, "draw" or "photo"
                original: null,                 // the picture before any "Apply again"
                input: null,                    // the picture the filter works on
                applied: 0,                     // "Apply again" presses since the original
                blurRun: 0,                     // challenge 3: blurs in a row on Letters AI
                numbers: saved ? saved.numbers.map(function (n) { return snap(n, NUMBER); }) : startFilter.numbers.slice(),
                divisor: saved ? snap(saved.divisor, DIVISOR) : startFilter.divisor,
                edges: saved ? saved.edges : DEFAULTS.edges,
                relu: saved ? saved.relu : DEFAULTS.relu,
                pool: saved ? saved.pool : DEFAULTS.pool,
                view: saved ? saved.view : DEFAULTS.view,
                loupe: { x: 40, y: 40 },        // the magnifier's middle pixel
                stepIndex: 0,                   // step by step: the map pixel being worked out
                stepState: "ready",             // "ready" | "running" | "paused" | "done"
                selected: null,                 // the network map whose filter is shown: { layer, index }
                roofSeen: false                 // challenge 4
            };
            let drawing = savedDrawing ? decodePicture(savedDrawing.data) : blankPicture();
            let inputVersion = 0;               // grows whenever the picture changes
            let raw = null;                     // the feature map before ReLU and pooling
            let output = null;                  // the feature map as shown
            let coarse = null;                  // step by step: the 16 x 16 picture...
            let stepMap = null;                 // ...its map before ReLU...
            let stepShown = null;               // ...and as shown
            let coarseVersion = -1;
            let net = null;
            let netVersion = -1;
            let paintedInput = -1;              // the input canvas shows this version
            let stroke = null;                  // the draw pad: { id, last } while a pen is down
            let resumeOnShow = false;
            let destroyed = false;
            let frame = 0;
            const pictureCache = {};

            function presetPicture(id) {
                if (!pictureCache[id]) {
                    const spec = presets.filter(function (p) { return p.id === id; })[0];
                    pictureCache[id] = drawPicture(spec);
                }
                return pictureCache[id];
            }

            function filterNow() {
                return { numbers: state.numbers, divisor: state.divisor };
            }

            // ----- The page -----
            const ui = kit.layout(stage);
            ui.root.classList.add("cv-root");

            // Top: the picture and the view
            const pictureChips = kit.chips({
                labelKey: "lab.vision.picture",
                options: presets.map(function (p) { return { value: p.id, labelKey: p.labelKey }; })
                    .concat([{ value: "draw", labelKey: "lab.vision.picDraw" }]),
                value: state.pictureId,
                onChange: choosePicture
            });
            const photo = fileButton("lab.vision.photo", { accept: "image/*", icon: PHOTO_ICON, onFile: readPhoto });
            const photoNote = textEl("p", "cv-note", "lab.vision.photoNote");
            const clearButton = kit.button("lab.vision.clear", { icon: "trash", size: "sm", onClick: clearDrawing });
            const drawHint = kit.hint({ key: "lab.vision.drawHint", tone: "tip" });
            const photoError = kit.hint({ key: "lab.vision.photoError", tone: "warn" });
            photoError.hide();
            const photoRow = el("div", "cv-photo-row");
            photoRow.append(photo.element, clearButton.element, photoNote);
            const viewSwitch = kit.segmented({
                labelKey: "lab.vision.view",
                options: [
                    { value: "filter", labelKey: "lab.vision.viewFilter" },
                    { value: "step", labelKey: "lab.vision.viewStep" },
                    { value: "cnn", labelKey: "lab.vision.viewCnn" }
                ],
                value: state.view,
                onChange: setView
            });
            viewSwitch.element.classList.add("cv-views");
            ui.top.append(pictureChips.element, photoRow, drawHint.element, photoError.element, viewSwitch.element);

            const work = el("div", "cv-work");
            ui.main.appendChild(work);

            // Filters view: the picture and its feature map at the same scale
            const filterShow = el("section", "cv-show cv-show-filter");
            const pair = el("div", "cv-pair");
            const inFigure = el("figure", "cv-figure");
            const inFrame = el("div", "cv-frame");
            const inBox = el("div", "cv-box");
            const inCanvas = pixelCanvas("cv-input");
            inCanvas.tabIndex = 0;
            inCanvas.setAttribute("role", "application");
            translateAttr(inCanvas, "aria-roledescription", "lab.vision.pictureRole");
            const inDescription = el("p", "sr-only", { id: "cv-in-" + Math.random().toString(36).slice(2) });
            inCanvas.setAttribute("aria-describedby", inDescription.id);
            const loupeBox = el("div", "cv-loupe-box", { "aria-hidden": "true" });
            inBox.append(inCanvas, loupeBox);
            inFrame.appendChild(inBox);
            const inCaption = el("figcaption", "cv-caption");
            inFigure.append(inFrame, inCaption, inDescription);

            const outFigure = el("figure", "cv-figure");
            const outFrame = el("div", "cv-frame");
            const outBox = el("div", "cv-box");
            const outCanvas = pixelCanvas("cv-output");
            outCanvas.setAttribute("role", "img");
            translateAttr(outCanvas, "aria-label", "lab.vision.outputLabel");
            const outDescription = el("p", "sr-only", { id: "cv-out-" + Math.random().toString(36).slice(2) });
            outCanvas.setAttribute("aria-describedby", outDescription.id);
            const spot = el("div", "cv-spot", { "aria-hidden": "true" });
            outBox.append(outCanvas, spot);
            outFrame.appendChild(outBox);
            const outCaption = el("figcaption", "cv-caption");
            pair.append(inFigure, outFigure);

            // The colour key of the map, under it
            const legend = el("div", "cv-legend");
            const legendBar = el("div", "cv-legend-bar", { "aria-hidden": "true" });
            const legendEnds = el("div", "cv-legend-ends", { "aria-hidden": "true" });
            const legendLow = el("span");
            const legendMid = el("span");
            const legendHigh = el("span");
            legendEnds.append(legendLow, legendMid, legendHigh);
            const legendText = el("p", "cv-legend-text");
            legend.append(legendBar, legendEnds, legendText);
            outFigure.append(outFrame, outCaption, legend, outDescription);

            // The magnifier: the real numbers of a 5 x 5 patch
            const loupe = el("div", "cv-loupe");
            const loupeHead = el("div", "cv-loupe-head");
            loupeHead.append(textEl("h5", "cv-subtitle", "lab.vision.loupeTitle"), el("span", "cv-loupe-where"));
            const loupeWhere = loupeHead.lastChild;
            const loupeGrid = el("div", "cv-loupe-grid", { "aria-hidden": "true" });
            const loupeCells = [];
            for (let i = 0; i < LOUPE * LOUPE; i++) {
                const cell = el("span", "cv-loupe-cell" + (i === (LOUPE * LOUPE - 1) / 2 ? " is-middle" : ""));
                loupeGrid.appendChild(cell);
                loupeCells.push(cell);
            }
            loupe.append(loupeHead, loupeGrid, textEl("p", "cv-help", "lab.vision.loupeHelp"));

            const statIn = kit.stat({ labelKey: "lab.vision.statIn", format: function (v) { return num(Math.round(v)); } });
            const statOut = kit.stat({ labelKey: "lab.vision.statOut", format: function (v) { return num(Math.round(v)); } });
            const under = el("div", "cv-under");
            const stats = el("div", "cv-stats");
            stats.append(statIn.element, statOut.element);
            under.append(loupe, stats);
            filterShow.append(pair, under);

            // Step by step: the 16 x 16 picture, the window and the map; the equation below
            const stepShow = el("section", "cv-show cv-show-step");
            const stepCanvasBox = el("div", "cv-step-canvas");
            stepShow.appendChild(stepCanvasBox);
            const stepView = kit.canvas(stepCanvasBox, { height: 300, labelKey: "lab.vision.stepLabel" });
            stepView.canvas.setAttribute("role", "application");
            translateAttr(stepView.canvas, "aria-roledescription", "lab.vision.stepRole");
            stepView.canvas.tabIndex = 0;
            const equation = el("section", "cv-equation");
            const stepButton = kit.button("lab.kit.step", { icon: "step", variant: "primary", onClick: stepOnce });
            const playButton = kit.button("lab.kit.play", { icon: "play", onClick: togglePlay });
            const restartButton = kit.button("lab.kit.reset", { icon: "reset", onClick: restartSweep });
            const stepStatus = kit.status("ready");
            const stepCount = el("p", "cv-step-count");
            const eqTitle = el("h5", "cv-subtitle");
            const eqGrids = el("div", "cv-eq-grids", { "aria-hidden": "true" });
            const eqLine = el("p", "cv-eq-line");
            const eqResult = el("p", "cv-eq-result");
            const eqNote = el("p", "cv-help");
            const calmHint = kit.hint({ key: "lab.vision.calmNote", tone: "info" });
            const poolHint = kit.hint({ key: "lab.vision.poolStepNote", tone: "info" });
            equation.append(kit.toolbar([stepButton, playButton, restartButton, stepStatus]), stepCount, eqTitle, eqGrids,
                eqLine, eqResult, eqNote, calmHint.element, poolHint.element);
            stepShow.appendChild(equation);

            // What a CNN sees: the picture, 4 maps of layer 1, 3 maps of layer 2
            const cnnShow = el("section", "cv-show cv-show-cnn");
            const cnnTitle = textEl("h4", "cv-title", "lab.vision.cnnTitle");
            const netInput = el("figure", "cv-net-input");
            const netCanvas = pixelCanvas("cv-net-picture");
            netCanvas.setAttribute("aria-hidden", "true");
            const netCaption = el("figcaption", "cv-caption");
            netInput.append(netCanvas, netCaption);
            const layer1Title = el("h5", "cv-subtitle");
            const layer2Title = el("h5", "cv-subtitle");
            function mapTile(filter, layer, index) {
                const button = kit.button(filter.labelKey, { onClick: function () { selectMap(layer, index); } });
                button.element.classList.add("cv-map");
                button.setPressed(false);
                const canvas = pixelCanvas("cv-map-canvas");
                canvas.setAttribute("aria-hidden", "true");
                button.element.insertBefore(canvas, button.element.firstChild);
                return { button: button, canvas: canvas };
            }
            const tiles1 = network.layer1.map(function (f, i) { return mapTile(f, 1, i); });
            const tiles2 = network.layer2.map(function (f, i) { return mapTile(f, 2, i); });
            const maps1 = el("div", "cv-maps cv-maps-4");
            tiles1.forEach(function (tile) { maps1.appendChild(tile.button.element); });
            const maps2 = el("div", "cv-maps cv-maps-3");
            tiles2.forEach(function (tile) { maps2.appendChild(tile.button.element); });
            const honest = textEl("p", "cv-honest", "lab.vision.honest");
            const crossNote = textEl("p", "cv-help", "lab.vision.crossCorrelation");
            cnnShow.append(cnnTitle, netInput, layer1Title, maps1, layer2Title, maps2,
                textEl("p", "cv-help", "lab.vision.mapsHelp"), honest, crossNote);

            // The filter panel (Filters and Step by step)
            const panel = el("section", "cv-panel");
            const filterChips = kit.chips({
                labelKey: "lab.vision.filters",
                options: filterPresets.map(function (f) { return { value: f.id, labelKey: f.labelKey }; }),
                value: null,
                onChange: chooseFilter
            });
            const numbersBox = el("div", "cv-numbers", { role: "group" });
            const numbersLabel = textEl("span", "lk-label", "lab.vision.numbers");
            numbersLabel.id = "cv-numbers-" + Math.random().toString(36).slice(2);
            numbersBox.setAttribute("aria-labelledby", numbersLabel.id);
            const grid3 = el("div", "cv-grid3");
            const cells = state.numbers.map(function (value, i) {
                const field = numberField({
                    min: NUMBER.min, max: NUMBER.max, step: NUMBER.step, value: value,
                    onInput: function (next) { setNumber(i, next); },
                    onChange: save
                });
                grid3.appendChild(field.element);
                return field;
            });
            const divisorRow = el("label", "cv-divisor");
            const divisorField = numberField({
                min: DIVISOR.min, max: DIVISOR.max, step: DIVISOR.step, value: state.divisor,
                onInput: function (next) {
                    state.divisor = next;
                    filterEdited();
                },
                onChange: save
            });
            divisorRow.append(textEl("span", "cv-divisor-text", "lab.vision.divisor"), divisorField.element);
            const sumLine = el("p", "cv-sum");
            numbersBox.append(numbersLabel, grid3, divisorRow, sumLine, textEl("p", "cv-help", "lab.vision.numbersHelp"));

            const edgesSwitch = kit.segmented({
                labelKey: "lab.vision.edges",
                options: [{ value: "same", labelKey: "lab.vision.edgesSame" }, { value: "valid", labelKey: "lab.vision.edgesValid" }],
                value: state.edges,
                onChange: function (value) {
                    state.edges = value;
                    clampStep();
                    changed();
                }
            });
            edgesSwitch.element.appendChild(textEl("p", "cv-help", "lab.vision.edgesHelp"));
            const reluSwitch = kit.toggle({
                labelKey: "lab.vision.relu", checked: state.relu,
                onChange: function (on) {
                    state.relu = on;
                    changed();
                }
            });
            const poolSwitch = kit.toggle({
                labelKey: "lab.vision.pool", checked: state.pool, hintKey: "lab.vision.poolHelp",
                onChange: function (on) {
                    state.pool = on;
                    changed();
                }
            });
            const againButton = kit.button("lab.vision.applyAgain", { icon: AGAIN_ICON, onClick: applyAgain });
            const backButton = kit.button("lab.vision.backToPicture", { icon: "undo", variant: "subtle", onClick: backToPicture });
            const appliedNote = el("p", "cv-help cv-applied");
            panel.append(textEl("h4", "cv-title", "lab.vision.filterTitle"), filterChips.element, numbersBox,
                edgesSwitch.element, reluSwitch.element, poolSwitch.element,
                kit.toolbar([againButton, backButton]), appliedNote);

            // The map panel (What a CNN sees): the filter of the chosen map
            const mapPanel = el("section", "cv-panel cv-map-panel");
            const mapTitle = el("h4", "cv-title");
            const mapBody = el("div", "cv-map-body");
            const mapAbout = el("p", "cv-map-about");
            const mapMore = el("p", "cv-help");
            const tryButton = kit.button("lab.vision.tryFilter", { icon: "sparkle", onClick: tryMapFilter });
            mapPanel.append(mapTitle, mapBody, mapAbout, mapMore, tryButton.element);

            work.append(filterShow, stepShow, cnnShow, panel, mapPanel);

            // Bottom: the big idea with glossary links, "What's happening?" and "Try this"
            const ideaLine = el("p", "cv-idea");
            const terms = {
                convolution: kit.termLink("convolution", "lab.vision.termConvolution"),
                vision: kit.termLink("computer-vision", "lab.vision.termVision"),
                network: kit.termLink("neural-network", "lab.vision.termNetwork")
            };
            fillSentence(ideaLine, "lab.vision.ideaLine", terms);
            const explain = kit.explain({ steps: [
                { key: "lab.vision.step1", values: { w: SIZE, h: SIZE } },
                { key: "lab.vision.step2", values: { sum: "0" } },
                { key: "lab.vision.step3" },
                { key: "lab.vision.step4" },
                { key: "lab.vision.step5" }
            ] });
            explain.setText("lab.vision.realWorld");
            const challenges = kit.challenges({ ctx: ctx, items: [
                { key: "lab.vision.ch1", insightKey: "lab.vision.ch1Why", check: function (info) { return info.verticalOnly; } },
                { key: "lab.vision.ch2", insightKey: "lab.vision.ch2Why", check: function (info) { return info.brighter; } },
                { key: "lab.vision.ch3", insightKey: "lab.vision.ch3Why", check: function (info) { return info.blurs >= CHECK.blurs; } },
                { key: "lab.vision.ch4", insightKey: "lab.vision.ch4Why", check: function (info) { return info.roof; } }
            ] });
            ui.bottom.append(ideaLine, explain.element, challenges.element);

            const sweep = kit.loop({ rate: SWEEP_RATE, update: sweepStep, draw: paintStep });

            // ----- Saving -----
            function save() {
                ctx.store.set("settings", {
                    v: SAVE_VERSION,
                    picture: state.pictureId === "photo" ? DEFAULTS.picture : state.pictureId,
                    numbers: state.numbers.slice(),
                    divisor: state.divisor,
                    edges: state.edges,
                    relu: state.relu,
                    pool: state.pool,
                    view: state.view
                });
            }

            function saveDrawing() {
                ctx.store.set("drawing", { v: SAVE_VERSION, data: encodePicture(drawing) });
            }

            // ----- The picture -----
            function setPicture(id, picture) {
                state.pictureId = id;
                state.original = picture;
                state.input = picture;
                state.applied = 0;
                state.blurRun = 0;
                inputVersion++;
                state.loupe.x = Math.min(state.loupe.x, picture.w - 1);
                state.loupe.y = Math.min(state.loupe.y, picture.h - 1);
                stopSweep("ready");
                state.stepIndex = 0;
            }

            function choosePicture(id) {
                if (id === "draw") setPicture("draw", drawing);
                else setPicture(id, presetPicture(id));
                photoError.hide();
                ctx.announce(t("lab.vision.pictureSay", { name: pictureName() }));
                save();
                render();
            }

            function pictureName() {
                if (state.applied > 0) return t("lab.vision.picResult");
                if (state.pictureId === "photo") return t("lab.vision.picPhoto");
                if (state.pictureId === "draw") return t("lab.vision.picDraw");
                return t(presets.filter(function (p) { return p.id === state.pictureId; })[0].labelKey);
            }

            function readPhoto(file) {
                const url = URL.createObjectURL(file);
                const image = new Image();
                image.onload = function () {
                    URL.revokeObjectURL(url);
                    if (destroyed) return;
                    let picture = null;
                    try {
                        picture = photoPicture(image);
                    } catch (error) {
                        picture = null;
                    }
                    if (!picture) {
                        photoError.show();
                        return;
                    }
                    photoError.hide();
                    pictureChips.set(null);
                    setPicture("photo", picture);
                    ctx.announce(t("lab.vision.photoReady", { w: SIZE, h: SIZE }));
                    render();
                };
                image.onerror = function () {
                    URL.revokeObjectURL(url);
                    if (!destroyed) photoError.show();
                };
                image.src = url;
            }

            function clearDrawing() {
                drawing = blankPicture();
                saveDrawing();
                if (state.pictureId === "draw") setPicture("draw", drawing);
                ctx.announce(t("lab.vision.cleared"));
                render();
            }

            // ----- The filter -----
            function setNumber(index, value) {
                state.numbers[index] = value;
                filterEdited();
            }

            function filterEdited() {
                syncFilterChips();
                changed();
            }

            // The ready filter whose numbers these are is pressed (none for the user's own)
            function syncFilterChips() {
                const match = filterPresets.filter(function (f) {
                    return sameNumbers(f.numbers, state.numbers) && f.divisor === state.divisor;
                })[0];
                filterChips.set(match ? match.id : null);
            }

            function chooseFilter(id) {
                const preset = filterPresets.filter(function (f) { return f.id === id; })[0];
                useFilter(preset.numbers, preset.divisor);
                ctx.announce(t("lab.vision.filterSay", { name: t(preset.labelKey) }));
            }

            function useFilter(numbers, divisor) {
                state.numbers = numbers.slice();
                state.divisor = divisor;
                cells.forEach(function (field, i) { field.set(state.numbers[i]); });
                divisorField.set(divisor);
                filterEdited();
                save();
            }

            // Something about the filter changed: everything follows at once
            function changed() {
                save();
                render();
            }

            function applyAgain() {
                if (!output || output.w < SMALLEST || output.h < SMALLEST) {
                    ctx.announce(t("lab.vision.tooSmall"));
                    return;
                }
                const blurring = state.pictureId === "letters" && isBlur(filterNow()) && !state.pool;
                state.blurRun = blurring ? state.blurRun + 1 : 0;
                state.input = toPicture(output);
                state.applied += 1;
                inputVersion++;
                state.loupe.x = Math.min(state.loupe.x, state.input.w - 1);
                state.loupe.y = Math.min(state.loupe.y, state.input.h - 1);
                stopSweep("ready");
                state.stepIndex = 0;
                ctx.announce(t("lab.vision.appliedSay", { w: state.input.w, h: state.input.h }));
                render();
            }

            function backToPicture() {
                state.input = state.original;
                state.applied = 0;
                state.blurRun = 0;
                inputVersion++;
                stopSweep("ready");
                state.stepIndex = 0;
                ctx.announce(t("lab.vision.backSay"));
                render();
            }

            // ----- The views -----
            function setView(view) {
                state.view = view;
                if (view !== "step") stopSweep(state.stepState === "running" ? "paused" : state.stepState);
                save();
                render();
            }

            // ----- The magnifier and the draw pad (pointer and keyboard) -----
            function pointAt(event) {
                const rect = inCanvas.getBoundingClientRect();
                return {
                    x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * state.input.w,
                    y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * state.input.h
                };
            }

            function moveLoupe(x, y) {
                const nx = A.util.clamp(Math.floor(x), 0, state.input.w - 1);
                const ny = A.util.clamp(Math.floor(y), 0, state.input.h - 1);
                if (nx === state.loupe.x && ny === state.loupe.y) return false;
                state.loupe.x = nx;
                state.loupe.y = ny;
                return true;
            }

            function queueRender() {
                if (frame || destroyed) return;
                frame = requestAnimationFrame(function () {
                    frame = 0;
                    render();
                });
            }

            function cancelRender() {
                if (frame) cancelAnimationFrame(frame);
                frame = 0;
            }

            function drawingNow() {
                return state.pictureId === "draw";
            }

            inCanvas.addEventListener("pointerdown", function (event) {
                if (stroke || !event.isPrimary || event.button !== 0) return;
                const point = pointAt(event);
                stroke = { id: event.pointerId, last: point, drew: false };
                try {
                    inCanvas.setPointerCapture(event.pointerId);
                } catch (error) {
                    // a pointer that is already gone
                }
                if (drawingNow()) {
                    if (state.applied > 0) setPicture("draw", drawing);
                    paintLine(drawing, point, point);
                    stroke.drew = true;
                    drawHint.hide();
                    inputVersion++;
                }
                moveLoupe(point.x, point.y);
                queueRender();
            });

            inCanvas.addEventListener("pointermove", function (event) {
                const point = pointAt(event);
                let moved = moveLoupe(point.x, point.y);
                if (stroke && event.pointerId === stroke.id && drawingNow() && state.applied === 0) {
                    const events = event.getCoalescedEvents ? event.getCoalescedEvents() : [];
                    (events.length ? events : [event]).forEach(function (one) {
                        const next = pointAt(one);
                        paintLine(drawing, stroke.last, next);
                        stroke.last = next;
                    });
                    stroke.drew = true;
                    inputVersion++;
                    moved = true;
                }
                if (moved) queueRender();
            });

            ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (name) {
                inCanvas.addEventListener(name, function (event) {
                    if (!stroke || event.pointerId !== stroke.id) return;
                    if (stroke.drew) saveDrawing();
                    stroke = null;
                });
            });
            inCanvas.addEventListener("contextmenu", function (event) {
                if (drawingNow()) event.preventDefault();
            });

            const MOVES = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
            inCanvas.addEventListener("keydown", function (event) {
                const move = MOVES[event.key];
                if (!move) return;
                event.preventDefault();
                const jump = event.shiftKey ? 8 : 1;
                if (moveLoupe(state.loupe.x + move[0] * jump, state.loupe.y + move[1] * jump)) {
                    ctx.announce(t("lab.vision.loupeSay", {
                        row: state.loupe.y + 1, col: state.loupe.x + 1,
                        value: num(pixelAt(state.input, state.loupe.x, state.loupe.y))
                    }));
                    render();
                }
            });

            // ----- Step by step -----
            function stepSize() {
                return outputSize(COARSE, COARSE, state.edges);
            }

            function clampStep() {
                const size = stepSize();
                state.stepIndex = Math.min(state.stepIndex, size.w * size.h - 1);
            }

            function stepMotion() {
                return A.motion.ok();
            }

            function setStepState(next) {
                state.stepState = next;
                stepStatus.set(next);
                playButton.setLabel(next === "running" ? "lab.kit.pause" : "lab.kit.play");
                playButton.setIcon(next === "running" ? "pause" : "play");
            }

            function stopSweep(next) {
                sweep.stop();
                if (state.stepState === "running" || next === "ready") setStepState(next);
            }

            // One window further along the row, then down; at the end the map is done
            function advance() {
                const size = stepSize();
                if (state.stepIndex >= size.w * size.h - 1) {
                    setStepState("done");
                    return false;
                }
                state.stepIndex += 1;
                if (state.stepIndex >= size.w * size.h - 1) setStepState("done");
                return true;
            }

            function sweepStep() {
                if (!stepMotion()) {
                    stopSweep("paused");
                    return;
                }
                advance();
                if (state.stepState === "done") {
                    sweep.stop();
                    ctx.announce(t("lab.vision.stepDone"));
                }
            }

            function stepOnce() {
                if (state.stepState === "running") stopSweep("paused");
                if (state.stepState === "done") {
                    state.stepIndex = 0;
                    setStepState("paused");
                } else {
                    advance();
                    if (state.stepState !== "done") setStepState("paused");
                }
                sayStep();
                render();
            }

            function togglePlay() {
                if (state.stepState === "running") {
                    stopSweep("paused");
                    render();
                    return;
                }
                if (!stepMotion()) return;
                if (state.stepState === "done") state.stepIndex = 0;
                setStepState("running");
                sweep.start();
                render();
            }

            function restartSweep() {
                stopSweep("ready");
                state.stepIndex = 0;
                render();
            }

            function sayStep() {
                const at = stepWindow();
                ctx.announce(state.stepState === "done" ? t("lab.vision.stepDone")
                    : t("lab.vision.stepSay", { row: at.cy + 1, col: at.cx + 1, value: num(at.shown) }));
            }

            // The window being worked out: where it is, its 9 pixels, products and sums
            function stepWindow() {
                const size = stepSize();
                const shift = state.edges === "valid" ? 1 : 0;
                const ox = state.stepIndex % size.w;
                const oy = Math.floor(state.stepIndex / size.w);
                const cx = ox + shift;
                const cy = oy + shift;
                const pixels = windowAt(coarse, cx, cy);
                const products = pixels.map(function (p, k) { return state.numbers[k] * p; });
                const total = products.reduce(function (a, b) { return a + b; }, 0);
                const value = total / state.divisor;
                const outside = cx === 0 || cy === 0 || cx === COARSE - 1 || cy === COARSE - 1;
                return {
                    cx: cx, cy: cy, pixels: pixels, products: products, total: total, value: value,
                    shown: state.relu ? Math.max(0, value) : value, outside: outside
                };
            }

            function stepKey(event) {
                const move = MOVES[event.key];
                if (!move) return;
                event.preventDefault();
                const size = stepSize();
                if (state.stepState === "running") stopSweep("paused");
                const ox = A.util.clamp((state.stepIndex % size.w) + move[0], 0, size.w - 1);
                const oy = A.util.clamp(Math.floor(state.stepIndex / size.w) + move[1], 0, size.h - 1);
                state.stepIndex = oy * size.w + ox;
                setStepState(state.stepIndex === size.w * size.h - 1 ? "done" : "paused");
                sayStep();
                render();
            }
            stepView.canvas.addEventListener("keydown", stepKey);

            // A click on a cell of the picture (or the map) puts the window there
            stepView.canvas.addEventListener("click", function (event) {
                const L = stepLayout(stepView.width);
                const rect = stepView.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                let cx = -1;
                let cy = -1;
                if (x >= L.inX && x < L.inX + COARSE * L.cellIn && y >= L.top && y < L.top + COARSE * L.cellIn) {
                    cx = Math.floor((x - L.inX) / L.cellIn);
                    cy = Math.floor((y - L.top) / L.cellIn);
                } else if (x >= L.outX && x < L.outX + COARSE * L.cellOut && y >= L.top && y < L.top + COARSE * L.cellOut) {
                    cx = Math.floor((x - L.outX) / L.cellOut);
                    cy = Math.floor((y - L.top) / L.cellOut);
                }
                if (cx < 0) return;
                const size = stepSize();
                const shift = state.edges === "valid" ? 1 : 0;
                const ox = A.util.clamp(cx - shift, 0, size.w - 1);
                const oy = A.util.clamp(cy - shift, 0, size.h - 1);
                if (state.stepState === "running") stopSweep("paused");
                state.stepIndex = oy * size.w + ox;
                setStepState(state.stepIndex === size.w * size.h - 1 ? "done" : "paused");
                render();
            });

            // ----- What a CNN sees -----
            function selectMap(layer, index) {
                state.selected = { layer: layer, index: index };
                const filter = layer === 1 ? network.layer1[index] : network.layer2[index];
                if (layer === 1 && filter.id !== "vertical" && filter.id !== "horizontal" && state.pictureId === "house") state.roofSeen = true;
                ctx.announce(t("lab.vision.mapSay", { name: t(filter.labelKey) }));
                render();
            }

            function tryMapFilter() {
                if (!state.selected || state.selected.layer !== 1) return;
                useFilter(network.layer1[state.selected.index].numbers, 1);
                viewSwitch.set("filter");
                setView("filter");
                cells[0].element.focus();
            }

            // ----- Everything on screen follows the numbers -----
            function computeOutput() {
                raw = convolve(state.input, filterNow(), state.edges);
                let shown = state.relu ? relu(raw) : raw;
                if (state.pool) shown = maxPool(shown);
                output = shown;
            }

            function paintFilterView() {
                const input = state.input;
                if (paintedInput !== inputVersion) {
                    paintGrid(inCanvas, input);
                    paintedInput = inputVersion;
                }
                const diverging = !state.relu;
                paintGrid(outCanvas, output, { diverging: diverging });

                // Same scale: the map's box is as big, compared with the picture's, as the map is
                outBox.style.width = (100 * output.w) / input.w + "%";
                outBox.style.height = (100 * output.h) / input.h + "%";
                A.dom.setText(inCaption, t("lab.vision.inputCaption", { w: input.w, h: input.h }));
                A.dom.setText(outCaption, t("lab.vision.outputCaption", { w: output.w, h: output.h }));
                A.dom.setAttr(inCanvas, "aria-label", t(drawingNow() && state.applied === 0 ? "lab.vision.inputLabelDraw" : "lab.vision.inputLabel"));
                inFrame.classList.toggle("is-drawing", drawingNow() && state.applied === 0);
                inDescription.textContent = t("lab.vision.describeInput", {
                    name: pictureName(), w: input.w, h: input.h, mean: num(Math.round(brightness(input)))
                });
                const range = extremes(output);
                outDescription.textContent = t("lab.vision.describeOutput", {
                    w: output.w, h: output.h, min: num(range.min), max: num(range.max)
                });

                // The colour key
                if (diverging) {
                    legendBar.style.background = "linear-gradient(to right, " +
                        [-1, -0.5, 0, 0.5, 1].map(function (v) { return kit.diverge(v); }).join(", ") + ")";
                    legendLow.textContent = num(-DIVERGE_RANGE);
                    legendMid.textContent = "0";
                    legendHigh.textContent = num(DIVERGE_RANGE);
                } else {
                    legendBar.style.background = "linear-gradient(to right, rgb(0, 0, 0), rgb(255, 255, 255))";
                    legendLow.textContent = "0";
                    legendMid.textContent = "";
                    legendHigh.textContent = "255";
                }
                A.dom.setText(legendText, t(diverging ? "lab.vision.legendColors" : "lab.vision.legendGray"));

                // The magnifier's box on the picture, and the pixel of the map it makes
                const lx = state.loupe.x;
                const ly = state.loupe.y;
                const half = (LOUPE - 1) / 2;
                loupeBox.style.left = (100 * (lx - half)) / input.w + "%";
                loupeBox.style.top = (100 * (ly - half)) / input.h + "%";
                loupeBox.style.width = (100 * LOUPE) / input.w + "%";
                loupeBox.style.height = (100 * LOUPE) / input.h + "%";
                let sx = lx - (state.edges === "valid" ? 1 : 0);
                let sy = ly - (state.edges === "valid" ? 1 : 0);
                if (state.pool) {
                    sx = Math.floor(sx / 2);
                    sy = Math.floor(sy / 2);
                }
                const spotOn = sx >= 0 && sy >= 0 && sx < output.w && sy < output.h;
                spot.hidden = !spotOn;
                if (spotOn) {
                    spot.style.left = (100 * sx) / output.w + "%";
                    spot.style.top = (100 * sy) / output.h + "%";
                    spot.style.width = 100 / output.w + "%";
                    spot.style.height = 100 / output.h + "%";
                }
                A.dom.setText(loupeWhere, t("lab.vision.loupeWhere", { row: ly + 1, col: lx + 1 }));
                loupeCells.forEach(function (cell, i) {
                    const x = lx - half + (i % LOUPE);
                    const y = ly - half + Math.floor(i / LOUPE);
                    const outside = x < 0 || y < 0 || x >= input.w || y >= input.h;
                    cell.classList.toggle("is-outside", outside);
                    if (outside) {
                        A.dom.setText(cell, "");
                        cell.style.background = "";
                        cell.style.color = "";
                        return;
                    }
                    const value = pixelAt(input, x, y);
                    A.dom.setText(cell, num(value));
                    cell.style.background = cellColor(value, false);
                    cell.style.color = inkFor(value, false);
                });
                statIn.set(brightness(input));
                statOut.set(brightness(output));
            }

            function paintStep() {
                if (coarseVersion !== inputVersion || !coarse) {
                    coarse = toPicture(shrink(state.input, COARSE, COARSE));
                    coarseVersion = inputVersion;
                }
                stepMap = convolve(coarse, filterNow(), state.edges);
                stepShown = state.relu ? relu(stepMap) : stepMap;
                clampStep();
                const L = stepLayout(stepView.width || 320);
                if (Math.abs(stepView.box.clientHeight - L.height) > 1) {
                    stepView.box.style.height = L.height + "px";      // the canvas follows (onResize)
                }
                if (stepView.width) {
                    drawStep(stepView, {
                        coarse: coarse, map: stepMap, shown: stepShown.data, index: state.stepIndex,
                        edges: state.edges, relu: state.relu, glow: A.motion.ok()
                    });
                }
                paintEquation();
            }

            // The mini grids of the equation panel (pixels, filter, products): plain cells
            function miniGrid(values, kind) {
                const box = el("div", "cv-mini cv-mini-" + kind);
                values.forEach(function (value) {
                    const cell = el("span", "cv-mini-cell");
                    cell.textContent = num(value);
                    if (kind === "pixels") {
                        cell.style.background = cellColor(value, false);
                        cell.style.color = inkFor(value, false);
                    } else if (value < 0) {
                        cell.classList.add("is-negative");
                    }
                    box.appendChild(cell);
                });
                return box;
            }

            function paintEquation() {
                const at = stepWindow();
                const size = stepSize();
                A.dom.setText(eqTitle, t("lab.vision.stepWhere", { row: at.cy + 1, col: at.cx + 1 }));
                A.dom.setText(stepCount, state.stepState === "done" ? t("lab.vision.stepDone")
                    : t("lab.vision.stepCount", { n: state.stepIndex + 1, total: size.w * size.h }));
                eqGrids.textContent = "";
                const labelled = function (key, grid) {
                    const group = el("div", "cv-eq-part");
                    group.append(textEl("span", "cv-eq-label", key), grid);
                    return group;
                };
                const sign = function (text) {
                    const mark = el("span", "cv-eq-sign");
                    mark.textContent = text;
                    return mark;
                };
                eqGrids.append(labelled("lab.vision.eqPixels", miniGrid(at.pixels, "pixels")), sign("×"),
                    labelled("lab.vision.eqFilter", miniGrid(state.numbers, "filter")), sign("="),
                    labelled("lab.vision.eqProducts", miniGrid(at.products, "products")));
                const terms = at.pixels.map(function (p, k) { return "(" + num(state.numbers[k]) + " × " + num(p) + ")"; });
                A.dom.setText(eqLine, terms.join(" + ") + " = " + num(at.total));
                let result = "";
                if (state.divisor !== 1) result += num(at.total) + " ÷ " + num(state.divisor) + " = " + num(at.value);
                if (state.relu) result += (result ? " " : "") + "→ " + t("lab.vision.eqRelu", { value: num(at.shown) });
                A.dom.setText(eqResult, result);
                eqResult.hidden = !result;
                A.dom.setText(eqNote, (at.outside && state.edges === "same" ? t("lab.vision.eqOutside") + " " : "") + t("lab.vision.eqMap"));
                const calm = !A.motion.ok();
                playButton.element.hidden = calm;
                if (calm) calmHint.show();
                else calmHint.hide();
                if (state.pool) poolHint.show();
                else poolHint.hide();
                stepView.describe(t("lab.vision.stepDescribe", {
                    row: at.cy + 1, col: at.cx + 1, value: num(at.shown),
                    n: state.stepIndex + 1, total: size.w * size.h
                }));
            }

            function paintNetwork() {
                if (netVersion !== inputVersion || !net) {
                    net = runNetwork(state.input, network);
                    netVersion = inputVersion;
                }
                paintGrid(netCanvas, state.input);
                A.dom.setText(netCaption, t("lab.vision.cnnPicture", { w: state.input.w, h: state.input.h }));
                // Layer 1 on one scale (which map answers most is part of the story)...
                let top1 = biggestAnswer([network.layer1[0].numbers], 1) * MAP_FLOOR;
                net.layer1.forEach(function (map) { top1 = Math.max(top1, extremes(map).max); });
                net.layer1.forEach(function (map, i) { paintGrid(tiles1[i].canvas, map, { top: top1 }); });
                // ...layer 2 each on its own (its filters have different sizes of numbers)
                net.layer2.forEach(function (map, i) {
                    const floor = biggestAnswer(network.layer2[i].grids, biggestAnswer([network.layer1[0].numbers], 1)) * MAP_FLOOR;
                    paintGrid(tiles2[i].canvas, map, { top: Math.max(floor, extremes(map).max) });
                });
                const first = net.layer1[0];
                const second = net.layer2[0];
                A.dom.setText(layer1Title, t("lab.vision.layer1", { w: first.w, h: first.h }));
                A.dom.setText(layer2Title, t("lab.vision.layer2", { w: second.w, h: second.h }));
                tiles1.forEach(function (tile, i) { tile.button.setPressed(Boolean(state.selected && state.selected.layer === 1 && state.selected.index === i)); });
                tiles2.forEach(function (tile, i) { tile.button.setPressed(Boolean(state.selected && state.selected.layer === 2 && state.selected.index === i)); });
                paintMapPanel();
            }

            function paintMapPanel() {
                mapBody.textContent = "";
                const chosen = state.selected;
                tryButton.element.hidden = !chosen || chosen.layer !== 1;
                if (!chosen) {
                    A.dom.setText(mapTitle, t("lab.vision.pickMap"));
                    A.dom.setText(mapAbout, "");
                    A.dom.setText(mapMore, "");
                    return;
                }
                const filter = chosen.layer === 1 ? network.layer1[chosen.index] : network.layer2[chosen.index];
                A.dom.setText(mapTitle, t("lab.vision.filterOf", { name: t(filter.labelKey) }));
                if (chosen.layer === 1) {
                    mapBody.appendChild(miniGrid(filter.numbers, "filter"));
                } else {
                    filter.grids.forEach(function (numbers, i) {
                        const part = el("div", "cv-map-part");
                        const title = el("h5", "cv-subtitle");
                        title.textContent = t("lab.vision.onMap", { name: t(network.layer1[i].labelKey) });
                        part.append(title, miniGrid(numbers, "filter"));
                        mapBody.appendChild(part);
                    });
                }
                A.dom.setText(mapAbout, t(filter.aboutKey));
                A.dom.setText(mapMore, chosen.layer === 2 ? t("lab.vision.aboutLayer2") : "");
            }

            function paintPanel() {
                const total = state.numbers.reduce(function (a, b) { return a + b; }, 0);
                A.dom.setText(sumLine, state.divisor === 1 ? t("lab.vision.sum", { sum: num(total) })
                    : t("lab.vision.sumDivided", { raw: num(total), divisor: num(state.divisor), sum: num(total / state.divisor) }));
                appliedNote.hidden = state.applied === 0;
                A.dom.setText(appliedNote, state.applied ? A.plural("lab.vision.applied", state.applied, { n: state.applied }) : "");
                backButton.setDisabled(state.applied === 0);
                againButton.setDisabled(!output || output.w < SMALLEST || output.h < SMALLEST);
                cells.forEach(function (field, i) {
                    A.dom.setAttr(field.element, "aria-label", t("lab.vision.cell", { row: Math.floor(i / 3) + 1, col: (i % 3) + 1 }));
                });
                A.dom.setAttr(divisorField.element, "aria-label", t("lab.vision.divisor"));
            }

            function paintExplain() {
                let value;
                if (state.view === "step" && coarse) value = stepWindow().value;
                else value = convolveAt(state.input, filterNow(), state.loupe.x, state.loupe.y);
                explain.setValues(0, { w: state.input.w, h: state.input.h });
                explain.setValues(1, { sum: num(value) });
                let current;
                if (state.view === "cnn") current = 4;
                else if (state.relu || state.pool) current = 3;
                else if (hasBothSigns(state.numbers)) current = 2;
                else if (sameNumbers(state.numbers, filterPresets[0].numbers)) current = 0;
                else current = 1;
                explain.setStep(current);
            }

            function checkChallenges() {
                let vertical = false;
                if (state.pictureId === "checker" && state.applied === 0) {
                    const sameMap = state.edges === "same" ? raw : convolve(state.input, filterNow(), "same");
                    vertical = verticalOnly(edgeAnswers(sameMap, presets.filter(function (p) { return p.id === "checker"; })[0].shapes[0].size));
                }
                const before = brightness(state.input);
                challenges.check({
                    verticalOnly: vertical,
                    brighter: !state.pool && before >= CHECK.darkest && brightness(output) >= CHECK.brighter * before,
                    blurs: state.blurRun,
                    roof: state.roofSeen
                });
            }

            // Everything on screen follows the numbers. all: true paints the hidden views too
            // (after a language switch, so that no text is left in the other language).
            function render(all) {
                if (destroyed) return;
                cancelRender();
                computeOutput();
                work.setAttribute("data-view", state.view);
                filterShow.hidden = state.view !== "filter";
                stepShow.hidden = state.view !== "step";
                cnnShow.hidden = state.view !== "cnn";
                panel.hidden = state.view === "cnn";
                mapPanel.hidden = state.view !== "cnn";
                const drawMode = drawingNow();
                clearButton.element.hidden = !drawMode;
                if (!drawMode) drawHint.hide();
                else if (!stroke) drawHint.show();
                if (all === true || state.view === "filter") paintFilterView();
                if (all === true || state.view === "step") paintStep();
                if (all === true || state.view === "cnn") paintNetwork();
                paintPanel();
                paintExplain();
                checkChallenges();
            }

            stepView.onResize(function () {
                if (state.view === "step") paintStep();
            });

            // ----- Start: the saved (or first) picture -----
            if (state.pictureId === "draw") setPicture("draw", drawing);
            else setPicture(state.pictureId, presetPicture(state.pictureId));
            syncFilterChips();
            render();

            // ----- The controller: the hub calls these -----
            return {
                pause: function () {
                    resumeOnShow = sweep.running();
                    sweep.stop();
                    cancelRender();
                },
                resume: function () {
                    if (resumeOnShow && state.stepState === "running" && A.motion.ok()) sweep.start();
                    resumeOnShow = false;
                },
                language: function () {
                    kit.relabel(stage);
                    fillSentence(ideaLine, "lab.vision.ideaLine", terms);
                    render(true);
                },
                theme: function () {
                    kit.colors.invalidate();
                    render();
                },
                motion: function () {
                    if (!A.motion.ok() && state.stepState === "running") stopSweep("paused");
                    render();
                },
                destroy: function () {
                    destroyed = true;
                    sweep.stop();
                    cancelRender();
                    stepView.destroy();
                }
            };
        }
    });
})();
