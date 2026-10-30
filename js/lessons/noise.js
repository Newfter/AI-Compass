/* =========================================================
   AI COMPASS — MINI-LAB "FROM NOISE TO PICTURE" (lesson 10)
   How an image generator (a diffusion model) makes a picture: it
   starts from pure random noise and takes the noise away, step by
   step. This lab is an illustration, and says so on screen: every
   step is worked out in advance from a finished picture (a small
   pixel drawing). After k of the STEPS steps, each colour of each
   pixel is
       (1 − n) × picture + n × noise,   where n = 1 − k ÷ STEPS
   is the share of noise left: all of it at step 0, none at the end.
   "New noise" draws new random noise and shows the other version of
   the picture: other noise, another picture for the same prompt. The
   film strip under the picture keeps every step so far.
   Loaded by js/lessons.js (see "A MINI-LAB IN ITS OWN FILE" there).
   Texts: "lessons.w10.*" (js/content/lessons-deep.js). Styles:
   css/lessons-labs.css ("noise-"). Sections:
    1. Settings
    2. The pictures
    3. The maths: mixing a picture with noise
    4. Drawing the lab
    5. Updating it
    6. Steps, playing, prompts and new noise
    7. The lab for js/lessons.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lessons) return;

    // ---------- 1. Settings ----------
    const STEPS = 10;              // denoising steps, from pure noise to the finished picture
    const PLAY_STEP_TIME = 450;    // "Play all steps" takes a step this often (milliseconds)
    const BLEND_TIME = 260;        // with motion on, the big picture blends into the next step over this long
    const SIZE = 16;               // the pictures are SIZE × SIZE pixels
    const MOSTLY_NOISE = 0.3;      // up to this share of the steps done, the picture is "mostly noise" ...
    const SHAPES = 0.6;            // ... up to this share "shapes start to show", then "almost clear"

    // ---------- 2. The pictures ----------
    // Each picture is SIZE rows of SIZE letters, and each letter is a colour of the
    // palette. Each picture has two versions (two palettes): the second one is also
    // mirrored, so that "New noise" clearly gives another picture. The texts
    // "lessons.w10.pic.<prompt>.<version>" describe each version for screen readers.
    const PICTURES = {
        rocket: {
            icon: "🚀",
            rows: [
                "*.......RR......",
                ".......RRRR...*.",
                "......RRRRRR....",
                "......WWWWWW....",
                "..*...WWGGWW....",
                "......WGBBGW....",
                "......WGBBGW..*.",
                "......WWGGWW....",
                "......WWWWWW....",
                ".*....WWWWWW....",
                ".....RWWWWWWR...",
                "....RRWWWWWWRR..",
                "....RR.FYYF.RR..",
                "..*....FYYF....*",
                ".......FFFF.....",
                "........FF......"
            ],
            palettes: [
                { ".": "#0b1030", "*": "#fff6c8", R: "#e8373e", W: "#f2f4f8", G: "#8a93a8", B: "#49b6ff", F: "#ff7a1a", Y: "#ffd23f" },
                { ".": "#1a0b33", "*": "#ffffff", R: "#2f6bff", W: "#f2f4f8", G: "#b8c0d0", B: "#7ee8ff", F: "#ff5a36", Y: "#ffe066" }
            ]
        },
        cat: {
            icon: "🐱",
            rows: [
                "................",
                "..O..........O..",
                "..OO........OO..",
                "..OPO......OPO..",
                "..OPPOOOOOOPPO..",
                ".OOOOODOODOOOOO.",
                ".OOOOOODDOOOOOO.",
                ".OOEKEOOOOEKEOO.",
                ".OOEKEOOOOEKEOO.",
                ".OOOOOOOOOOOOOO.",
                ".OOOOOWPPWOOOOO.",
                "..OOOWKWWKWOOO..",
                "..OOOWWKKWWOOO..",
                "..OOOOWWWWOOOO..",
                "....OOOOOOOO....",
                "................"
            ],
            palettes: [
                { ".": "#cdebd2", O: "#f08a24", D: "#b4570f", P: "#ff9fb2", E: "#4fcf5a", K: "#1d1d1d", W: "#fff7ee" },
                { ".": "#d6e4ff", O: "#8e949e", D: "#5a5f69", P: "#ff9fb2", E: "#ffd23f", K: "#1d1d1d", W: "#f4f4f4" }
            ]
        },
        sunset: {
            icon: "🌅",
            rows: [
                "AAAAAAAAAAAAAAAA",
                "AAAAAAAAAAAAAAAA",
                "BBBBBBBBBBBBBBBB",
                "BBBLLLLBBBBBBBBB",
                "CCLLLLLLCCCCCCCC",
                "CCCCCCCCCCCCCCCC",
                "EEEEEEEEESSSEEEE",
                "EEEEEEEESSSSSEEE",
                "EEEEEEESSSSSSSEE",
                "DDDDDDDDDDDDDDDD",
                "DDDDDDDRRRRRRRDD",
                "DDDDDDDDDDDDDDDD",
                "DDDDDDDDRRRRRDDD",
                "DDDDDDDDDDDDDDDD",
                "DDDDDDDDDRRRDDDD",
                "DDDDDDDDDDDDDDDD"
            ],
            palettes: [
                { A: "#3b1863", B: "#a83a7c", L: "#f6a5a0", C: "#f2795a", E: "#ffcf6e", S: "#ff8a1f", D: "#0d2a5c", R: "#ff9d3c" },
                { A: "#0d1b4a", B: "#3a3f9a", L: "#cbb8ff", C: "#8b5cc8", E: "#e9a6d8", S: "#fff4b0", D: "#3a1858", R: "#f5d9ff" }
            ]
        }
    };
    const PROMPTS = Object.keys(PICTURES);

    // ---------- 3. The maths: mixing a picture with noise ----------
    // The share of noise left after "step" steps: 1 at step 0, 0 after the last step
    function noiseShare(step) {
        return 1 - step / STEPS;
    }

    // "#ff8a1f" -> [255, 138, 31]
    function hexToRgb(hex) {
        return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    }

    // The colours [red, green, blue] of every pixel of a picture, row by row
    function pictureColours(prompt, version) {
        const picture = PICTURES[prompt];
        const palette = picture.palettes[version];
        const colours = [];
        picture.rows.forEach(function (row) {
            const letters = row.split("");
            if (version === 1) letters.reverse();   // the second version is mirrored
            letters.forEach(function (letter) { colours.push(hexToRgb(palette[letter])); });
        });
        return colours;
    }

    // New random noise: a random colour for every pixel (each part from 0 to 255)
    function newNoise() {
        const noise = [];
        for (let i = 0; i < SIZE * SIZE; i++) {
            noise.push([A.util.randomInt(0, 255), A.util.randomInt(0, 255), A.util.randomInt(0, 255)]);
        }
        return noise;
    }

    // Paints the mix on a SIZE × SIZE canvas: each colour is (1 − share) × picture + share × noise
    // (A.util.lerp(picture, noise, share) is exactly that)
    function paint(canvas, colours, noise, share) {
        const context = canvas.getContext("2d");
        const image = context.createImageData(SIZE, SIZE);
        colours.forEach(function (colour, i) {
            for (let c = 0; c < 3; c++) image.data[i * 4 + c] = Math.round(A.util.lerp(colour[c], noise[i][c], share));
            image.data[i * 4 + 3] = 255;   // not see-through
        });
        context.putImageData(image, 0, 0);
    }

    // ---------- 4. Drawing the lab ----------
    let stopShownLab = null;   // stops the timers of the lab on screen (there is only ever one)

    function build(host, api) {
        const state = api.state;
        if (!state.noise) Object.assign(state, { prompt: PROMPTS[0], version: 0, step: 0, noise: newNoise() });
        state.playing = false;

        const frames = [];
        for (let k = 0; k <= STEPS; k++) {
            frames.push(`<li class="noise-frame" data-frame="${k}"><canvas width="${SIZE}" height="${SIZE}"></canvas><span class="mono">${k}</span></li>`);
        }

        host.innerHTML = `
            <div class="noise-lab">
                <div class="noise-prompts" role="group" aria-labelledby="noise-prompt-label">
                    <p class="lsn-lab-sub mono" id="noise-prompt-label">${api.text("prompt")}</p>
                    <div class="noise-pills">${PROMPTS.map(function (prompt) {
                        return `<button type="button" class="lsn-pill noise-pill" data-prompt="${prompt}" data-fid="w10-${prompt}" aria-pressed="false"><span aria-hidden="true">${PICTURES[prompt].icon}</span> ${api.text("quoted", { text: api.text("p." + prompt) })}</button>`;
                    }).join("")}</div>
                </div>
                <div class="noise-stage">
                    <div class="noise-picture">
                        <canvas class="noise-canvas" width="${SIZE}" height="${SIZE}" role="img" data-noise="canvas"></canvas>
                        <p class="noise-caption" data-noise="caption" aria-hidden="true"></p>
                    </div>
                    <div class="noise-controls">
                        <div class="lsn-slider">
                            <label for="noise-steps">${api.text("steps")}</label>
                            <output for="noise-steps" class="mono" data-noise="stepText"></output>
                            <input class="lsn-range ui-range" type="range" id="noise-steps" data-fid="w10-steps" min="0" max="${STEPS}" step="1" value="${state.step}">
                        </div>
                        <div class="noise-left">
                            <p class="mono" data-noise="left"></p>
                            <span class="noise-meter" aria-hidden="true"><span data-noise="meter"></span></span>
                        </div>
                        <div class="lsn-lab-actions">
                            <button type="button" class="btn btn-primary btn-small" data-noise="denoise" data-fid="w10-denoise"><span aria-hidden="true">✨</span> ${api.text("denoise")}</button>
                            <button type="button" class="btn btn-ghost btn-small" data-noise="play" data-fid="w10-play"><span aria-hidden="true" data-noise="playIcon"></span> <span data-noise="playText"></span></button>
                            <button type="button" class="btn btn-ghost btn-small" data-noise="new" data-fid="w10-new"><span aria-hidden="true">🎲</span> ${api.text("newNoise")}</button>
                        </div>
                    </div>
                </div>
                <div class="noise-film" aria-hidden="true">
                    <p class="lsn-lab-sub mono">${api.text("strip")}</p>
                    <ol class="noise-strip">${frames.join("")}</ol>
                </div>
                <p class="lsn-lab-small">${api.text("versions")}</p>
                <p class="noise-honest"><span aria-hidden="true">ℹ️</span> ${api.text("honest")}</p>
            </div>`;

        const lab = host.firstElementChild;
        const part = function (name) { return lab.querySelector('[data-noise="' + name + '"]'); };
        const canvas = part("canvas");
        const slider = lab.querySelector("#noise-steps");
        const pills = Array.prototype.slice.call(lab.querySelectorAll("[data-prompt]"));
        const frameItems = Array.prototype.slice.call(lab.querySelectorAll("[data-frame]"));
        let colours = pictureColours(state.prompt, state.version);
        let shownShare = noiseShare(state.step);   // the share of noise on the big picture right now
        let blendFrame = 0;                         // the blend's animation frame (0: none)
        let playTimer = 0;                          // the "Play all steps" timer (0: not playing)

        // ---------- 5. Updating it ----------
        // What the picture looks like now, in words
        function stateText() {
            if (state.step >= STEPS) return api.text("done", { picture: api.text("pic." + state.prompt + "." + state.version) });
            if (state.step === 0) return api.text("d0");
            const done = state.step / STEPS;
            if (done <= MOSTLY_NOISE) return api.text("d1");
            if (done <= SHAPES) return api.text("d2");
            return api.text("d3");
        }

        function stepText() {
            return api.text("stepOf", { n: state.step, total: STEPS });
        }

        function canvasText() {
            return api.text("canvas", { state: stateText(), steps: stepText(), p: A.format.percent(noiseShare(state.step)) });
        }

        function update() {
            const share = noiseShare(state.step);
            pills.forEach(function (pill) {
                A.dom.setAttr(pill, "aria-pressed", String(pill.getAttribute("data-prompt") === state.prompt));
            });
            slider.value = state.step;
            A.dom.setAttr(slider, "aria-valuetext", stepText() + ". " + api.text("noiseLeft", { p: A.format.percent(share) }));
            A.dom.setText(part("stepText"), stepText());
            A.dom.setText(part("left"), api.text("noiseLeft", { p: A.format.percent(share) }));
            part("meter").style.width = (share * 100) + "%";
            A.dom.setAttr(canvas, "aria-label", canvasText());
            A.dom.setText(part("caption"), stateText());
            A.dom.setAttr(part("denoise"), "aria-disabled", String(state.step >= STEPS));
            A.dom.setText(part("playIcon"), state.playing ? "⏸" : "▶");
            A.dom.setText(part("playText"), api.text(state.playing ? "pause" : "play"));
            lab.classList.toggle("is-playing", state.playing);

            // The film strip: the steps done so far, the current one marked, the rest empty
            frameItems.forEach(function (item, k) {
                const frameCanvas = item.firstElementChild;
                item.classList.toggle("is-now", k === state.step);
                item.classList.toggle("is-done", k <= state.step);
                if (k <= state.step) paint(frameCanvas, colours, state.noise, noiseShare(k));
                else frameCanvas.getContext("2d").clearRect(0, 0, SIZE, SIZE);
            });
        }

        // The big picture: at once, or (with motion on) blended into the new step
        function paintPicture(smooth) {
            const target = noiseShare(state.step);
            cancelAnimationFrame(blendFrame);
            blendFrame = 0;
            if (!smooth || !api.motion.ok()) {
                shownShare = target;
                paint(canvas, colours, state.noise, shownShare);
                return;
            }
            const from = shownShare;
            const start = performance.now();
            function blend(now) {
                const progress = Math.min(1, (now - start) / BLEND_TIME);
                shownShare = A.util.lerp(from, target, A.util.easeOut(progress));
                paint(canvas, colours, state.noise, shownShare);
                blendFrame = progress < 1 ? requestAnimationFrame(blend) : 0;
            }
            blendFrame = requestAnimationFrame(blend);
        }

        function setStep(step, smooth) {
            state.step = A.util.clamp(step, 0, STEPS);
            paintPicture(smooth);
            update();
        }

        // ---------- 6. Steps, playing, prompts and new noise ----------
        function playStep() {
            playTimer = 0;
            if (document.hidden) {   // the tab was hidden: stop, the learner can press Play again
                stopPlaying();
                return;
            }
            setStep(state.step + 1, true);
            if (state.step < STEPS) {
                playTimer = setTimeout(playStep, PLAY_STEP_TIME);
            } else {
                stopPlaying();
                api.announce(canvasText());
            }
        }

        function startPlaying() {
            state.playing = true;
            if (state.step >= STEPS) {   // played to the end before: start again from pure noise
                setStep(0, false);
                playTimer = setTimeout(playStep, PLAY_STEP_TIME);
            } else {
                playStep();
            }
        }

        function stopPlaying() {
            clearTimeout(playTimer);
            playTimer = 0;
            if (!state.playing) return;
            state.playing = false;
            update();
        }

        // Another picture: a new prompt, or the other version (with new noise)
        function setPicture(prompt, version) {
            state.prompt = prompt;
            state.version = version;
            colours = pictureColours(prompt, version);
            setStep(0, false);
        }

        lab.addEventListener("click", function (event) {
            const pill = event.target.closest("[data-prompt]");
            if (pill) {
                const prompt = pill.getAttribute("data-prompt");
                if (prompt === state.prompt) return;
                stopPlaying();
                setPicture(prompt, state.version);
                api.announce(api.text("promptSet", { prompt: api.text("p." + prompt) }));
                return;
            }
            // "button": the icon and the text inside the Play button have a data-noise of their own
            const button = event.target.closest("button[data-noise]");
            const action = button ? button.getAttribute("data-noise") : "";
            if (action === "denoise") {
                if (state.step >= STEPS) return;
                stopPlaying();
                setStep(state.step + 1, true);
                api.announce(canvasText());
            } else if (action === "play") {
                if (state.playing) stopPlaying();
                else startPlaying();
            } else if (action === "new") {
                stopPlaying();
                state.noise = newNoise();
                setPicture(state.prompt, (state.version + 1) % PICTURES[state.prompt].palettes.length);
                api.announce(api.text("fresh"));
            }
        });

        // The slider: its value text (aria-valuetext) tells screen readers each step
        slider.addEventListener("input", function () {
            stopPlaying();
            setStep(Number(slider.value), true);
        });

        stopShownLab = function () {
            clearTimeout(playTimer);
            cancelAnimationFrame(blendFrame);
            playTimer = 0;
            blendFrame = 0;
            state.playing = false;
        };

        paintPicture(false);
        update();
    }

    // ---------- 7. The lab for js/lessons.js ----------
    // destroy: closing the reader, another lesson or a language change stops the
    // "Play all steps" timer and the blend (the listeners go with the lab's elements)
    A.lessons.defineLab("noise", {
        build: build,
        destroy: function () {
            if (stopShownLab) stopShownLab();
            stopShownLab = null;
        }
    });
})();
