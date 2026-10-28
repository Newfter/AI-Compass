/* =========================================================
   AI COMPASS — LAB: GUESS THE LINE (the sample experiment)
   A few dots and a line y = a·x + b that the computer fits to them by
   gradient descent: it measures how wrong the line is (the loss), works
   out which way is downhill (the gradient) and takes a small step, again
   and again. It is small on purpose: it is the template for every lab
   experiment (the hub's contract, the kit, the store, the announcer).
   Its tests: dev/tests/sample.test.js and dev/tests/sample-maths.js.

   Sections:
    1. Settings
    2. The maths
    3. Drawing
    4. The experiment (A.lab.define)
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
    const SEED = 7;                          // the first dots (a seed always gives the same dots)
    const DOTS = 8;                          // how many dots
    const TRUE_LINE = { a: 0.6, b: 0.2 };    // the dots lie near this line...
    const NOISE = 0.06;                      // ...about this far above or below it
    const START = { a: -0.4, b: 0.9 };       // the first guess: a line that slopes the wrong way
    const RATE = { min: 0.01, max: 1, step: 0.01, value: 0.3 };   // the learning-rate slider
    const SPEED = { watch: 15, fast: 120 };  // steps per second
    const STILL = 0.0005;                    // both gradients below this: the line has stopped moving
    const MAX_STEPS = 3000;                  // a tiny learning rate stops here
    const BLOWN_UP = 1e6;                    // a loss above this: the line flew away
    const GOAL = 0.01;                       // challenge 1: a loss below this
    const SAVE_VERSION = 1;                  // ctx.store "settings" = { v: 1, lr }

    /* =========================================================
       2. THE MATHS
       ========================================================= */
    // Dots near the true line, made from a seed (x spread from 0.05 to 0.95)
    function makeDots(seed) {
        const random = kit.rng(seed);
        const dots = [];
        for (let i = 0; i < DOTS; i++) {
            const x = 0.05 + (0.9 * (i + random.next())) / DOTS;
            dots.push({ x: x, y: TRUE_LINE.a * x + TRUE_LINE.b + random.normal(0, NOISE) });
        }
        return dots;
    }

    // The loss: the average of the squared up-and-down distances from the dots to the line
    function loss(dots, a, b) {
        let sum = 0;
        dots.forEach(function (dot) {
            const error = a * dot.x + b - dot.y;
            sum += error * error;
        });
        return sum / dots.length;
    }

    // The gradient: how fast the loss grows when a or b grows (its partial derivatives)
    //   dLoss/da = 2/N · Σ error · x        dLoss/db = 2/N · Σ error
    function gradient(dots, a, b) {
        const slope = { a: 0, b: 0 };
        dots.forEach(function (dot) {
            const error = a * dot.x + b - dot.y;
            slope.a += (2 * error * dot.x) / dots.length;
            slope.b += (2 * error) / dots.length;
        });
        return slope;
    }

    /* =========================================================
       3. DRAWING
       ========================================================= */
    // "y = −0.4·x + 0.9", with the numbers written the local way
    function formula(a, b) {
        const number = function (value) { return A.format.number(value, { digits: 2 }); };
        return "y = " + number(a) + "·x " + (b < 0 ? "− " : "+ ") + number(Math.abs(b));
    }

    // The dots, the line, and a thin line from each dot to the line: its error
    function drawScene(view, dots, a, b) {
        const ctx = view.ctx;
        const c = kit.colors();
        const pad = 24;
        const toX = function (x) { return pad + x * (view.width - 2 * pad); };
        const toY = function (y) { return view.height - pad - y * (view.height - 2 * pad); };
        ctx.clearRect(0, 0, view.width, view.height);
        kit.drawGrid(ctx, view.width, view.height, 32);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = c.series[3];
        ctx.beginPath();
        dots.forEach(function (dot) {
            ctx.moveTo(toX(dot.x), toY(dot.y));
            ctx.lineTo(toX(dot.x), toY(a * dot.x + b));
        });
        ctx.stroke();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = c.series[0];
        ctx.beginPath();
        ctx.moveTo(toX(-0.2), toY(-0.2 * a + b));
        ctx.lineTo(toX(1.2), toY(1.2 * a + b));
        ctx.stroke();
        dots.forEach(function (dot) { kit.marker(ctx, "dot", toX(dot.x), toY(dot.y), 5, c.series[1]); });
        ctx.font = kit.font(13, 600);
        ctx.fillStyle = c.text;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(formula(a, b), 12, 10);
    }

    /* =========================================================
       4. THE EXPERIMENT
       ========================================================= */
    A.lab.define("sample", {
        // The maths, for dev/tests/sample-maths.js (the hub doesn't use it)
        maths: { makeDots: makeDots, loss: loss, gradient: gradient },

        create: function (stage, ctx) {
            // ----- State. state: "ready" | "running" | "paused" | "done" -----
            const saved = ctx.store.get("settings", null, function (value) {
                return value.v === SAVE_VERSION && value.lr >= RATE.min && value.lr <= RATE.max;
            });
            let lr = saved ? saved.lr : RATE.value;
            let dots = makeDots(SEED);
            let a = START.a;
            let b = START.b;
            let state = "ready";
            let blown = false;                // the loss exploded
            let resumeOnShow = false;         // running when the hub paused us
            const losses = [];                // the loss after each step (losses[0]: before any step)

            // ----- The page: only kit parts -----
            const ui = kit.layout(stage, { side: true });
            const scene = kit.canvas(ui.main, { aspect: 4 / 3, maxHeight: 420, labelKey: "lab.sample.canvas" });
            ui.main.appendChild(kit.legend([
                { labelKey: "lab.sample.dots", colorIndex: 1, shape: "dot" },
                { labelKey: "lab.sample.line", colorIndex: 0, shape: "line" },
                { labelKey: "lab.sample.errors", colorIndex: 3, shape: "line" }
            ]).element);
            const chartView = kit.canvas(ui.main, { height: 150, labelKey: "lab.sample.chart" });
            const chart = kit.lineChart(chartView, {
                series: [{ values: losses, colorIndex: 0, labelKey: "lab.kit.loss", fill: true }],
                log: true,
                xLabelKey: "lab.kit.stepCount"
            });
            const playButton = kit.button("lab.kit.play", { icon: "play", variant: "primary", onClick: togglePlay });
            const stepButton = kit.button("lab.kit.step", { icon: "step", onClick: stepOnce });
            const status = kit.status("ready");
            const speed = kit.segmented({
                labelKey: "lab.kit.speed",
                options: [{ value: "watch", labelKey: "lab.kit.speedWatch" }, { value: "fast", labelKey: "lab.kit.speedFast" }],
                value: "watch",
                onChange: function (value) { loop.setRate(SPEED[value]); }
            });
            const rate = kit.slider({
                labelKey: "lab.kit.learningRate", min: RATE.min, max: RATE.max, step: RATE.step, value: lr,
                hintKey: "lab.sample.rateHint",
                onInput: function (value) { lr = value; render(); },
                onChange: function (value) { ctx.store.set("settings", { v: SAVE_VERSION, lr: value }); }
            });
            const stepsStat = kit.stat({ labelKey: "lab.kit.stepCount", value: 0 });
            const lossStat = kit.stat({ labelKey: "lab.kit.loss", trend: "auto", better: "down" });
            const explain = kit.explain({ steps: [{ key: "lab.sample.step1" }, { key: "lab.sample.step2" }, { key: "lab.sample.step3" }] });
            const challenges = kit.challenges({ ctx: ctx, items: [
                { key: "lab.sample.ch1", insightKey: "lab.sample.ch1Why", check: function (info) { return info.loss < GOAL; } },
                { key: "lab.sample.ch2", insightKey: "lab.sample.ch2Why", check: function (info) { return info.blown; } }
            ] });
            const idea = document.createElement("p");
            idea.className = "smp-idea";
            idea.innerHTML = A.i18nHTML("lab.sample.ideaLine") + " ";
            idea.append(kit.termLink("gradient-descent", "lab.sample.term"), ".");

            ui.side.append(
                kit.toolbar([playButton, stepButton, kit.button("lab.kit.reset", { icon: "reset", onClick: reset }),
                    kit.button("lab.sample.newDots", { icon: "dice", variant: "subtle", onClick: newDots }), status]),
                speed.element,
                rate.element,
                kit.row([stepsStat, lossStat], { grid: true })
            );
            ui.bottom.append(idea, explain.element, challenges.element);

            const loop = kit.loop({ rate: SPEED.watch, update: takeStep, draw: render });
            scene.onResize(function () { drawScene(scene, dots, a, b); });

            // ----- What the buttons do -----
            // One step of gradient descent: a and b move a little way downhill
            function takeStep() {
                const slope = gradient(dots, a, b);
                a -= lr * slope.a;
                b -= lr * slope.b;
                losses.push(loss(dots, a, b));
                if (!(losses[losses.length - 1] < BLOWN_UP)) finish(true);
                else if ((Math.abs(slope.a) < STILL && Math.abs(slope.b) < STILL) || losses.length > MAX_STEPS) finish(false);
            }

            function setState(next) {
                state = next;
                status.set(next);
                playButton.setLabel(next === "running" ? "lab.kit.pause" : "lab.kit.play");
                playButton.setIcon(next === "running" ? "pause" : "play");
                stepButton.setDisabled(next === "done");
            }

            function finish(flewAway) {
                loop.stop();
                blown = flewAway;
                setState("done");
                explain.setText(flewAway ? "lab.sample.blown" : "lab.sample.fit");
                ctx.announce(flewAway ? t("lab.sample.doneBlown")
                    : A.plural("lab.sample.doneFit", losses.length - 1, { loss: A.format.number(losses[losses.length - 1]) }));
            }

            function togglePlay() {
                if (state === "running") {
                    loop.stop();
                    setState("paused");
                    return;
                }
                if (state === "done") reset();
                setState("running");
                loop.start();
            }

            function stepOnce() {
                loop.stop();
                setState("paused");
                loop.step();            // one takeStep() and one render()
            }

            function reset() {
                loop.stop();
                a = START.a;
                b = START.b;
                blown = false;
                losses.length = 0;
                losses.push(loss(dots, a, b));
                explain.setText(null);
                setState("ready");
                render();
            }

            function newDots() {
                dots = makeDots(kit.newSeed());
                reset();
            }

            // Everything on screen follows the numbers (once per frame while running)
            function render() {
                const latest = losses[losses.length - 1];
                const slope = gradient(dots, a, b);
                drawScene(scene, dots, a, b);
                chart.draw();
                stepsStat.set(losses.length - 1);
                lossStat.set(latest);
                explain.setValues(0, { a: a, b: b });
                explain.setValues(1, { loss: latest });
                explain.setValues(2, { ga: slope.a, gb: slope.b });
                explain.setStep(state === "ready" ? 0 : state === "done" ? 1 : 2);
                scene.describe(t("lab.sample.describe", { n: dots.length, line: formula(a, b), loss: A.format.number(latest) }));
                challenges.check({ loss: latest, blown: blown });
            }

            reset();

            // ----- The controller: the hub calls these -----
            return {
                pause: function () {
                    resumeOnShow = loop.running();
                    loop.stop();
                },
                resume: function () {
                    if (resumeOnShow && state === "running") loop.start();
                    resumeOnShow = false;
                },
                language: function () {
                    kit.relabel(stage);
                    render();
                },
                theme: function () {
                    kit.colors.invalidate();
                    render();
                },
                destroy: function () {
                    loop.stop();
                    scene.destroy();
                    chartView.destroy();
                }
            };
        }
    });
})();
