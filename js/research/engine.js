/* =========================================================
   AI COMPASS — THE RESEARCH LAB: THE TRAINING ENGINE (AICompass.researchEngine, called "E")
   A small, exact training engine for the experiment station: data from a
   seed, a fully connected network, mini-batch training with SGD, momentum
   or Adam, decoupled weight decay, a constant or a cosine learning rate,
   and records of the losses and accuracies along the way. Nothing here
   touches the page, so the same file runs in the browser (the station
   loads it: A.researchEngine) and in Node (require), where
   dev/tests/research.engine.js proves its mathematics (a gradient check,
   every optimiser by hand, determinism, stepping against running at once).

   THE WORDS
     data seed   which data set: the training sample and the test set (1,000 clean points)
     run seed    the initial weights and the order of the batches (the usual meaning of
                 "seed" in papers), on the same data. With freshSample: true a run seed
                 also draws a new training sample (the test set stays the same).
     record      the training loss, the test loss, the training accuracy (against the
                 labels it was trained on, noisy ones included) and the test accuracy,
                 measured on the whole sets at up to 100 evenly spaced epochs
     diverged    a loss that is not finite (or above 10⁶, where the numbers are about to
                 overflow) ends the run; it is recorded with its epoch, never as NaN

   E AT A GLANCE
     E.defaults()                  a configuration that learns moons well
     E.LIMITS, E.CHOICES           what each setting may be
     E.check(config)               -> [] or [{ key, code: "range" | "whole" | "choice", min, max }]
     E.normalise(config)           the defaults filled in, numbers cleaned
     E.makeData(config, dataSeed, runSeed) -> { kind, train, test, val, flipped }
     E.paramCount(config)          the number of weights and biases
     E.cost(config)                about 6 × parameters × examples × epochs, plus the evaluations
     E.start(config, seed, { dataSeed }) -> run { step(ms), done, progress(), result }
     E.run(config, seed, options)  the same run, at once -> its result
     E.batch(jobs)                 several runs one after another, in small steps (a study)
     E.rate(config, step, total)   the learning rate at an update (1-based)
     E.optimiser(kind, size)       -> { step(params, grads, rate, decay, mask) } (for the tests)
     E.network(config), E.lossAndGrad(net, params, x, y, count, grads)   (for the tests)

   Sections:
    1. Settings and limits
    2. Data
    3. The network: layout, initialisation, forward and backward
    4. Optimisers, the learning rate, weight decay
    5. A run, in small steps
    6. Several runs: a batch of jobs
    7. What the engine gives
   ========================================================= */

/* global module, require -- Node's names: "what this file gives" and "load another file" */
(function (root, factory) {
    "use strict";
    // The shared maths (js/research/math.js) brings the seeded random generator
    let M = root && root.AICompass ? root.AICompass.researchMath : null;
    if (!M && typeof require === "function") M = require("./math.js");
    const E = factory(M);
    if (typeof module === "object" && module && module.exports) module.exports = E;
    if (root && root.AICompass) root.AICompass.researchEngine = E;
})(typeof window !== "undefined" ? window : null, function (M) {
    "use strict";

    /* =========================================================
       1. SETTINGS AND LIMITS
       ========================================================= */
    const TASKS = ["moons", "circles", "spirals", "blobs", "wave"];      // wave: the regression problem
    const ACTIVATIONS = ["tanh", "relu"];
    const OPTIMISERS = ["sgd", "momentum", "adam"];
    const SCHEDULES = ["constant", "cosine"];
    const MOMENTUM = 0.9;
    const BETA1 = 0.9;
    const BETA2 = 0.999;
    const ADAM_EPS = 1e-8;
    const LOSS_CAP = 1e6;            // a loss above this counts as diverged (overflow is near)
    const EVAL_CHUNK = 250;          // rows evaluated at once
    const BLOB_SPREAD = 0.35;        // the spread of a blob before the noise setting is added

    // The limits of every setting (included). batch 0 means the full batch.
    const LIMITS = {
        noise: { min: 0, max: 1 },
        nTrain: { min: 10, max: 2000, whole: true },
        nTest: { min: 100, max: 5000, whole: true },
        nVal: { min: 0, max: 2000, whole: true },
        labelNoise: { min: 0, max: 0.5 },
        depth: { min: 1, max: 4, whole: true },
        width: { min: 1, max: 256, whole: true },
        lr: { min: 1e-6, max: 100 },
        weightDecay: { min: 0, max: 1 },
        batch: { min: 0, max: 2000, whole: true },
        epochs: { min: 1, max: 5000, whole: true },
        warmup: { min: 0, max: 0.5 },
        records: { min: 1, max: 100, whole: true }
    };
    const CHOICES = { task: TASKS, activation: ACTIVATIONS, optimizer: OPTIMISERS, schedule: SCHEDULES };

    function defaults() {
        return {
            task: "moons", noise: 0.2, nTrain: 200, nTest: 1000, nVal: 0, labelNoise: 0, freshSample: false,
            depth: 2, width: 16, activation: "tanh",
            optimizer: "adam", lr: 0.01, weightDecay: 0, batch: 32, epochs: 60,
            schedule: "constant", warmup: 0.05, records: 20
        };
    }

    function isNumber(value) {
        return typeof value === "number" && isFinite(value);
    }

    // The defaults filled in. (Numbers are kept as given: check() says what is wrong.)
    function normalise(config) {
        const out = defaults();
        Object.keys(config || {}).forEach(function (key) {
            if (config[key] !== undefined) out[key] = config[key];
        });
        out.freshSample = Boolean(out.freshSample);
        return out;
    }

    // -> [] when the configuration is fine, else one problem per wrong setting
    function check(config) {
        const c = normalise(config);
        const problems = [];
        Object.keys(CHOICES).forEach(function (key) {
            if (CHOICES[key].indexOf(c[key]) === -1) problems.push({ key: key, code: "choice" });
        });
        Object.keys(LIMITS).forEach(function (key) {
            const limit = LIMITS[key];
            const value = c[key];
            if (!isNumber(value) || value < limit.min || value > limit.max) problems.push({ key: key, code: "range", min: limit.min, max: limit.max });
            else if (limit.whole && !Number.isInteger(value)) problems.push({ key: key, code: "whole", min: limit.min, max: limit.max });
        });
        return problems;
    }

    /* =========================================================
       2. DATA
       Two-class problems in the plane (class = index mod 2, so a sample is
       balanced) and one regression problem. Points are drawn one after the
       other from the seed, so a training set of 100 is the start of the one
       of 800 with the same seed: a sweep of the size adds data, it does not
       draw a new set each time. The test set has its own stream and clean
       labels (or clean targets); label noise flips exactly round(share × n)
       training labels, chosen from their own stream.
       ========================================================= */
    function point(task, cls, noise, r) {
        let x;
        let y;
        if (task === "moons") {
            const a = Math.PI * r.uniform();
            if (cls === 0) {
                x = Math.cos(a);
                y = Math.sin(a);
            } else {
                x = 1 - Math.cos(a);
                y = 0.5 - Math.sin(a);
            }
            x -= 0.5;
            y -= 0.25;
        } else if (task === "circles") {
            const a = 2 * Math.PI * r.uniform();
            const radius = cls === 0 ? 1 : 0.5;
            x = radius * Math.cos(a);
            y = radius * Math.sin(a);
        } else if (task === "spirals") {
            // one and a half turns each, the second turned half a circle; the centre is left out
            const s = r.uniform();
            const radius = 0.1 + 0.9 * s;
            const a = 3 * Math.PI * s + cls * Math.PI;
            x = 1.5 * radius * Math.cos(a);
            y = 1.5 * radius * Math.sin(a);
        } else {
            // blobs: two round clouds
            x = (cls === 0 ? -0.9 : 0.9) + BLOB_SPREAD * r.normal();
            y = BLOB_SPREAD * r.normal();
        }
        return [x + noise * r.normal(), y + noise * r.normal()];
    }

    // The regression problem: a smooth function of two inputs
    function wave(x, y) {
        return Math.sin(2 * x) * Math.cos(1.5 * y);
    }

    // count points from the stream named `name`; clean: no noise on a regression target
    function sample(task, count, noise, name, clean) {
        const r = M.rng(name);
        const x = new Float64Array(count * 2);
        const y = new Float64Array(count);
        for (let i = 0; i < count; i++) {
            if (task === "wave") {
                const a = -1.5 + 3 * r.uniform();
                const b = -1.5 + 3 * r.uniform();
                x[2 * i] = a;
                x[2 * i + 1] = b;
                const e = r.normal();          // drawn always, so that clean and noisy sets match
                y[i] = wave(a, b) + (clean ? 0 : noise * e);
            } else {
                const cls = i % 2;
                const p = point(task, cls, noise, r);
                x[2 * i] = p[0];
                x[2 * i + 1] = p[1];
                y[i] = cls;
            }
        }
        return { x: x, y: y, n: count };
    }

    function makeData(config, dataSeed, runSeed) {
        const c = normalise(config);
        const d = Math.floor(Number(dataSeed) || 0);
        const trainName = "st-train-" + d + (c.freshSample ? "-" + Math.floor(Number(runSeed) || 0) : "");
        const train = sample(c.task, c.nTrain, c.noise, trainName, false);
        const test = sample(c.task, c.nTest, c.noise, "st-test-" + d, true);
        const val = c.nVal > 0 ? sample(c.task, c.nVal, c.noise, "st-val-" + d, true) : null;
        let flipped = 0;
        if (c.task !== "wave" && c.labelNoise > 0) {
            const count = Math.round(c.labelNoise * c.nTrain);
            const order = [];
            for (let i = 0; i < c.nTrain; i++) order.push(i);
            M.rng(trainName + "-flip-" + c.nTrain).shuffle(order);
            for (let i = 0; i < count; i++) train.y[order[i]] = 1 - train.y[order[i]];
            flipped = count;
        }
        return { kind: c.task === "wave" ? "regression" : "classes", train: train, test: test, val: val, flipped: flipped };
    }

    /* =========================================================
       3. THE NETWORK
       sizes: 2 inputs, depth hidden layers of `width`, then 2 logits
       (softmax cross-entropy) or 1 output (squared error). All the
       parameters live in one Float64Array: for each layer its weights
       (row j holds what unit j takes from each unit before it), then its
       biases. Initialisation from the seed, scaled for the activation:
       He (variance 2/fan-in) for ReLU, LeCun (1/fan-in) for tanh and for
       the output layer; biases start at 0.
       The loss is the mean over the examples: cross-entropy in nats, or
       the mean squared error (ŷ − y)².
       ========================================================= */
    function network(config) {
        const c = normalise(config);
        const out = c.task === "wave" ? 1 : 2;
        const sizes = [2];
        for (let i = 0; i < c.depth; i++) sizes.push(c.width);
        sizes.push(out);
        const layers = [];
        let offset = 0;
        for (let l = 1; l < sizes.length; l++) {
            const layer = { inputs: sizes[l - 1], units: sizes[l], w: offset, b: offset + sizes[l - 1] * sizes[l] };
            offset = layer.b + sizes[l];
            layers.push(layer);
        }
        // which parameters are weights (weight decay touches only these)
        const mask = new Uint8Array(offset);
        layers.forEach(function (layer) {
            for (let i = layer.w; i < layer.b; i++) mask[i] = 1;
        });
        return { sizes: sizes, layers: layers, size: offset, relu: c.activation === "relu", regression: out === 1, mask: mask, buffers: null, rows: 0 };
    }

    function paramCount(config) {
        return network(config).size;
    }

    function initialise(net, seed) {
        const r = M.rng(seed);
        const params = new Float64Array(net.size);
        net.layers.forEach(function (layer, index) {
            const last = index === net.layers.length - 1;
            const scale = Math.sqrt((net.relu && !last ? 2 : 1) / layer.inputs);
            for (let i = layer.w; i < layer.b; i++) params[i] = scale * r.normal();
        });
        return params;
    }

    // Work space for up to `rows` examples at once
    function buffers(net, rows) {
        if (net.buffers && net.rows >= rows) return net.buffers;
        const acts = net.sizes.map(function (size) { return new Float64Array(rows * size); });
        const deltas = net.sizes.map(function (size) { return new Float64Array(rows * size); });
        net.buffers = { acts: acts, deltas: deltas };
        net.rows = rows;
        return net.buffers;
    }

    // Forward pass of `count` rows of x (2 numbers each, from row `start`, or through `index`).
    // Leaves the activations in the buffers; returns the output layer's buffer.
    function forward(net, params, x, count, index, start) {
        const work = buffers(net, count);
        const input = work.acts[0];
        for (let b = 0; b < count; b++) {
            const row = index ? index[start + b] : start + b;
            input[2 * b] = x[2 * row];
            input[2 * b + 1] = x[2 * row + 1];
        }
        const last = net.layers.length - 1;
        for (let l = 0; l <= last; l++) {
            const layer = net.layers[l];
            const before = work.acts[l];
            const after = work.acts[l + 1];
            const nIn = layer.inputs;
            const nOut = layer.units;
            for (let b = 0; b < count; b++) {
                const inBase = b * nIn;
                const outBase = b * nOut;
                for (let j = 0; j < nOut; j++) {
                    let z = params[layer.b + j];
                    const w = layer.w + j * nIn;
                    for (let k = 0; k < nIn; k++) z += params[w + k] * before[inBase + k];
                    if (l < last) z = net.relu ? (z > 0 ? z : 0) : Math.tanh(z);
                    after[outBase + j] = z;
                }
            }
        }
        return work.acts[last + 1];
    }

    // The loss of one row's output, and (with delta) its gradient with respect to the outputs
    // scaled by `scale`. -> { loss, right } (right: 1 when the class is right, 0 otherwise)
    function rowLoss(net, out, b, target, delta, scale) {
        if (net.regression) {
            const e = out[b] - target;
            if (delta) delta[b] = 2 * e * scale;
            return { loss: e * e, right: 0 };
        }
        const z0 = out[2 * b];
        const z1 = out[2 * b + 1];
        const top = z0 > z1 ? z0 : z1;
        const lse = top + Math.log(Math.exp(z0 - top) + Math.exp(z1 - top));
        const cls = target > 0.5 ? 1 : 0;
        if (delta) {
            delta[2 * b] = (Math.exp(z0 - lse) - (cls === 0 ? 1 : 0)) * scale;
            delta[2 * b + 1] = (Math.exp(z1 - lse) - (cls === 1 ? 1 : 0)) * scale;
        }
        const picked = (z1 > z0 ? 1 : 0) === cls ? 1 : 0;
        return { loss: lse - (cls === 0 ? z0 : z1), right: picked };
    }

    // The mean loss of `count` rows and its gradient (into grads, which is overwritten).
    // index/start choose the rows, as in forward().
    function lossAndGrad(net, params, x, y, count, grads, index, start) {
        const from = start || 0;
        const out = forward(net, params, x, count, index, from);
        const work = net.buffers;
        const last = net.layers.length - 1;
        const delta = work.deltas[last + 1];
        let total = 0;
        for (let b = 0; b < count; b++) {
            const row = index ? index[from + b] : from + b;
            total += rowLoss(net, out, b, y[row], delta, 1 / count).loss;
        }
        grads.fill(0);
        for (let l = last; l >= 0; l--) {
            const layer = net.layers[l];
            const before = work.acts[l];
            const here = work.deltas[l + 1];
            const nIn = layer.inputs;
            const nOut = layer.units;
            const back = l > 0 ? work.deltas[l] : null;
            if (back) back.fill(0, 0, count * nIn);
            for (let b = 0; b < count; b++) {
                const inBase = b * nIn;
                const outBase = b * nOut;
                for (let j = 0; j < nOut; j++) {
                    const d = here[outBase + j];
                    if (d === 0) continue;
                    grads[layer.b + j] += d;
                    const w = layer.w + j * nIn;
                    for (let k = 0; k < nIn; k++) {
                        grads[w + k] += d * before[inBase + k];
                        if (back) back[inBase + k] += d * params[w + k];
                    }
                }
            }
            // through the activation of the layer before: tanh' = 1 − a², ReLU' = [a > 0]
            if (back) {
                for (let i = 0; i < count * nIn; i++) {
                    const a = before[i];
                    back[i] *= net.relu ? (a > 0 ? 1 : 0) : 1 - a * a;
                }
            }
        }
        return total / count;
    }

    // Loss and accuracy on a whole set -> { loss, acc } (acc null for regression)
    function evaluate(net, params, set) {
        let total = 0;
        let right = 0;
        for (let start = 0; start < set.n; start += EVAL_CHUNK) {
            const count = Math.min(EVAL_CHUNK, set.n - start);
            const out = forward(net, params, set.x, count, null, start);
            for (let b = 0; b < count; b++) {
                const one = rowLoss(net, out, b, set.y[start + b], null, 0);
                total += one.loss;
                right += one.right;
            }
        }
        return { loss: total / set.n, acc: net.regression ? null : right / set.n };
    }

    /* =========================================================
       4. OPTIMISERS, THE LEARNING RATE, WEIGHT DECAY
       One update with gradient g, rate η and decay λ (decoupled: it acts on
       the weights directly, not through the gradient, and never on biases):
         sgd        w ← w − η·g − η·λ·w
         momentum   v ← 0.9·v + g;            w ← w − η·v − η·λ·w
         adam       m ← β₁m + (1 − β₁)g;  v ← β₂v + (1 − β₂)g²;  m̂ = m/(1 − β₁ᵗ);  v̂ = v/(1 − β₂ᵗ)
                    w ← w − η·m̂/(√v̂ + ε) − η·λ·w        (β₁ = 0.9, β₂ = 0.999, ε = 10⁻⁸)
       The learning rate at update s of S (s from 1):
         constant   η
         cosine     warm-up for W = round(warmup·S) updates: η·s/W; then
                    η·½(1 + cos(π·(s − W)/(S − W)))
       ========================================================= */
    function optimiser(kind, size) {
        const first = kind === "sgd" ? null : new Float64Array(size);
        const second = kind === "adam" ? new Float64Array(size) : null;
        let t = 0;
        return {
            kind: kind,
            step: function (params, grads, rate, decay, mask) {
                t += 1;
                const fix1 = 1 - Math.pow(BETA1, t);
                const fix2 = 1 - Math.pow(BETA2, t);
                for (let i = 0; i < params.length; i++) {
                    const g = grads[i];
                    const w = params[i];
                    let move;
                    if (kind === "sgd") {
                        move = g;
                    } else if (kind === "momentum") {
                        first[i] = MOMENTUM * first[i] + g;
                        move = first[i];
                    } else {
                        first[i] = BETA1 * first[i] + (1 - BETA1) * g;
                        second[i] = BETA2 * second[i] + (1 - BETA2) * g * g;
                        move = (first[i] / fix1) / (Math.sqrt(second[i] / fix2) + ADAM_EPS);
                    }
                    params[i] = w - rate * move - (decay > 0 && mask && mask[i] ? rate * decay * w : 0);
                }
            },
            count: function () { return t; }
        };
    }

    function warmupSteps(config, total) {
        return Math.min(total, Math.round(normalise(config).warmup * total));
    }

    function rate(config, step, total) {
        const c = normalise(config);
        if (c.schedule !== "cosine") return c.lr;
        const warm = warmupSteps(c, total);
        if (step <= warm) return c.lr * step / warm;
        const span = total - warm;
        if (span <= 0) return c.lr;
        return c.lr * 0.5 * (1 + Math.cos(Math.PI * (step - warm) / span));
    }

    /* =========================================================
       5. A RUN, IN SMALL STEPS
       start(config, seed, { dataSeed, data }) -> run
         run.step(ms)    trains for about ms milliseconds (at least one mini-batch); true when done
         run.done        finished (to the end, or diverged)
         run.progress()  0..1 (updates done of all)
         run.result      once done: { config, seed, dataSeed, diverged, divergedEpoch, epochs,
                         updates, records: [{ epoch, trainLoss, testLoss, trainAcc, testAcc }],
                         final: { trainLoss, testLoss, trainAcc, testAcc, valLoss, valAcc } or null }
       The same configuration and seeds give the same numbers however the run is sliced:
       the slices only decide when it pauses, never what it computes.
       ========================================================= */
    function recordEpochs(epochs, records) {
        const count = Math.min(records, epochs);
        const list = [];
        for (let k = 1; k <= count; k++) list.push(Math.round(k * epochs / count));
        return list;
    }

    function cost(config) {
        const c = normalise(config);
        const p = paramCount(c);
        const points = Math.min(c.records, c.epochs);
        return 6 * p * c.nTrain * c.epochs + 2 * p * (c.nTrain + c.nTest) * points + 2 * p * c.nVal;
    }

    function now() {
        return typeof performance !== "undefined" ? performance.now() : Date.now();
    }

    function start(config, seed, options) {
        const c = normalise(config);
        const settings = options || {};
        const dataSeed = Math.floor(Number(settings.dataSeed) || 0);
        const runSeed = Math.floor(Number(seed) || 0);
        const data = settings.data || makeData(c, dataSeed, runSeed);
        const net = network(c);
        const params = initialise(net, "st-init-" + dataSeed + "-" + runSeed);
        const grads = new Float64Array(net.size);
        const opt = optimiser(c.optimizer, net.size);
        const n = data.train.n;
        const batch = c.batch > 0 && c.batch < n ? c.batch : n;
        const perEpoch = Math.ceil(n / batch);
        const total = perEpoch * c.epochs;
        const order = new Int32Array(n);
        for (let i = 0; i < n; i++) order[i] = i;
        const shuffler = M.rng("st-order-" + dataSeed + "-" + runSeed);
        const wanted = recordEpochs(c.epochs, c.records);
        const records = [];
        let epoch = 0;
        let inEpoch = 0;
        let updates = 0;
        let nextRecord = 0;
        const run = { done: false, result: null };

        function shuffle() {
            for (let i = n - 1; i > 0; i--) {
                const j = shuffler.int(i + 1);
                const keep = order[i];
                order[i] = order[j];
                order[j] = keep;
            }
        }

        function finish(diverged) {
            run.done = true;
            let final = null;
            if (!diverged) {
                const last = records[records.length - 1];
                final = { trainLoss: last.trainLoss, testLoss: last.testLoss, trainAcc: last.trainAcc, testAcc: last.testAcc, valLoss: null, valAcc: null };
                if (data.val) {
                    const v = evaluate(net, params, data.val);
                    final.valLoss = isNumber(v.loss) ? v.loss : null;
                    final.valAcc = v.acc;
                }
            }
            run.result = {
                config: c,
                seed: runSeed,
                dataSeed: dataSeed,
                diverged: Boolean(diverged),
                divergedEpoch: diverged ? diverged : null,
                epochs: diverged ? diverged : c.epochs,
                updates: updates,
                records: records,
                final: final
            };
        }

        function record() {
            const tr = evaluate(net, params, data.train);
            const te = evaluate(net, params, data.test);
            if (!(isNumber(tr.loss) && isNumber(te.loss)) || tr.loss > LOSS_CAP) return false;
            records.push({ epoch: epoch, trainLoss: tr.loss, testLoss: te.loss, trainAcc: tr.acc, testAcc: te.acc });
            return true;
        }

        // One mini-batch. -> false when the run is over
        function update() {
            if (inEpoch === 0) shuffle();
            const from = inEpoch * batch;
            const count = Math.min(batch, n - from);
            const loss = lossAndGrad(net, params, data.train.x, data.train.y, count, grads, order, from);
            if (!isNumber(loss) || loss > LOSS_CAP) {
                finish(epoch + 1);
                return false;
            }
            updates += 1;
            opt.step(params, grads, rate(c, updates, total), c.weightDecay, net.mask);
            inEpoch += 1;
            if (inEpoch === perEpoch) {
                inEpoch = 0;
                epoch += 1;
                if (epoch === wanted[nextRecord]) {
                    nextRecord += 1;
                    if (!record()) {
                        finish(epoch);
                        return false;
                    }
                }
                if (epoch === c.epochs) {
                    finish(0);
                    return false;
                }
            }
            return true;
        }

        run.step = function (ms) {
            if (run.done) return true;
            const until = now() + (isNumber(ms) ? ms : 10);
            do {
                if (!update()) return true;
            } while (now() < until);
            return false;
        };
        run.progress = function () {
            return run.done ? 1 : updates / total;
        };
        run.updatesTotal = total;
        run.records = records;          // grows while the run goes on (live curves)
        run.params = params;
        run.net = net;
        return run;
    }

    function runAtOnce(config, seed, options) {
        const run = start(config, seed, options);
        while (!run.step(1000)) { /* the whole run */ }
        return run.result;
    }

    /* =========================================================
       6. SEVERAL RUNS: A BATCH OF JOBS
       batch(jobs): jobs = [{ config, seed, dataSeed, tag }], run one after
       another. The data of a job is made once and shared by every later job
       that has the same data (same data seed, task, noise, sizes, label
       noise, and run seed when freshSample is on).
         step(ms) -> true when every job is done; progress() 0..1 by the cost
         results  [{ tag, job, result }] of the jobs that finished, in order
         current  the index of the job that runs now
         live()   { tag, job, records } of the job that runs now (its records so far), or null
       ========================================================= */
    function dataKey(config, job) {
        const c = normalise(config);
        return [c.task, c.noise, c.nTrain, c.nTest, c.nVal, c.labelNoise, job.dataSeed, c.freshSample ? job.seed : ""].join("|");
    }

    function batch(jobs) {
        const list = (jobs || []).slice();
        const costs = list.map(function (job) { return cost(job.config); });
        const totalCost = costs.reduce(function (a, b) { return a + b; }, 0) || 1;
        const cache = {};
        let doneCost = 0;
        let index = 0;
        let running = null;
        const out = { results: [], current: 0, done: list.length === 0 };

        function begin() {
            const job = list[index];
            const key = dataKey(job.config, job);
            if (!cache[key]) cache[key] = makeData(job.config, job.dataSeed, job.seed);
            running = start(job.config, job.seed, { dataSeed: job.dataSeed, data: cache[key] });
        }

        out.step = function (ms) {
            if (out.done) return true;
            const until = now() + (isNumber(ms) ? ms : 10);
            do {
                if (!running) begin();
                if (running.step(Math.max(0, until - now()))) {
                    out.results.push({ tag: list[index].tag, job: list[index], result: running.result });
                    doneCost += costs[index];
                    running = null;
                    index += 1;
                    out.current = index;
                    if (index >= list.length) {
                        out.done = true;
                        return true;
                    }
                }
            } while (now() < until);
            return false;
        };
        out.progress = function () {
            if (out.done) return 1;
            const part = running ? running.progress() * costs[index] : 0;
            return Math.min(1, (doneCost + part) / totalCost);
        };
        // The job that runs now and its records so far (null between jobs)
        out.live = function () {
            return running ? { tag: list[index].tag, job: list[index], records: running.records } : null;
        };
        out.count = list.length;
        return out;
    }

    /* =========================================================
       7. WHAT THE ENGINE GIVES
       ========================================================= */
    return {
        TASKS: TASKS,
        CHOICES: CHOICES,
        LIMITS: LIMITS,
        LOSS_CAP: LOSS_CAP,
        defaults: defaults,
        normalise: normalise,
        check: check,
        makeData: makeData,
        wave: wave,
        network: network,
        paramCount: paramCount,
        initialise: initialise,
        forward: forward,
        lossAndGrad: lossAndGrad,
        evaluate: evaluate,
        optimiser: optimiser,
        rate: rate,
        recordEpochs: recordEpochs,
        cost: cost,
        start: start,
        run: runAtOnce,
        batch: batch
    };
});
