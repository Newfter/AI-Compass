/* =========================================================
   AI COMPASS — MINI-LAB "WHAT THE APP SEES" (lesson 14)
   One video ("Guitar for beginners") and six things the viewer may have
   done with it. Each one switched on is a signal with a weight; their sum
   moves a meter from "much less" to "lots more", and each signal adds a
   guess the app now makes about the viewer. A like and a quick skip
   together are "mixed signals". The weights are made up (the lab says so).
   Loaded by js/lessons.js (see "A MINI-LAB IN ITS OWN FILE" there).
   Texts: "lessons.w14.*" (js/content/lessons-world.js). Styles:
   css/lessons-labs.css ("sig-"). Sections:
    1. Settings
    2. Drawing and updating the lab
    3. The lab for js/lessons.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lessons) return;

    // ---------- 1. Settings ----------
    // Each signal: its weight ("more like this" is positive). Texts: "s.<id>" and "g.<id>".
    const SIGNALS = [
        { id: "end", icon: "⏱️", weight: 3 },
        { id: "skip", icon: "⏭️", weight: -4 },
        { id: "like", icon: "👍", weight: 2 },
        { id: "share", icon: "📤", weight: 3 },
        { id: "search", icon: "🔎", weight: 2 },
        { id: "night", icon: "🌙", weight: 0 }
    ];
    // The meter: the sum of the weights, cut to -4...+6, as 6 levels ("level.0" ... "level.5")
    const LEVELS = [-3, -1, 1, 3, 6];   // a sum below LEVELS[i] is level i (else level 5)

    // ---------- 2. Drawing and updating the lab ----------
    function build(host, api) {
        const state = api.state;
        if (!state.on) state.on = {};

        host.innerHTML = `
            <div class="sig-lab">
                <div class="sig-video" aria-hidden="true"><span class="sig-thumb">🎸</span><strong>${api.text("video")}</strong></div>
                <div class="sig-list" role="group" aria-label="${A.escapeHTML(api.text("video"))}">${SIGNALS.map(function (signal) {
                    return `<button type="button" class="sig-chip" data-signal="${signal.id}" data-fid="w14-${signal.id}" aria-pressed="false">
                                <span class="sig-icon" aria-hidden="true">${signal.icon}</span>
                                <span>${api.text("s." + signal.id)}</span>
                            </button>`;
                }).join("")}</div>
                <div class="sig-meter">
                    <p class="lsn-lab-sub mono" id="sig-meter">${api.text("meter")}</p>
                    <span class="sig-track" aria-hidden="true"><span class="sig-zero"></span><span class="sig-fill" data-sig="fill"></span></span>
                    <strong class="sig-level" aria-labelledby="sig-meter" data-sig="level"></strong>
                </div>
                <div class="sig-guesses">
                    <p class="lsn-lab-sub mono">${api.text("guesses")}</p>
                    <ul data-sig="guesses"></ul>
                </div>
                <p class="lsn-lab-small">${api.text("note")}</p>
            </div>`;

        const lab = host.firstElementChild;
        const part = function (name) { return lab.querySelector('[data-sig="' + name + '"]'); };
        const chips = Array.prototype.slice.call(lab.querySelectorAll("[data-signal]"));

        function sum() {
            return SIGNALS.reduce(function (total, signal) { return total + (state.on[signal.id] ? signal.weight : 0); }, 0);
        }

        function level() {
            const value = sum();
            for (let i = 0; i < LEVELS.length; i++) if (value < LEVELS[i]) return i;
            return LEVELS.length;
        }

        function update() {
            chips.forEach(function (chip) {
                A.dom.setAttr(chip, "aria-pressed", String(Boolean(state.on[chip.getAttribute("data-signal")])));
            });
            const value = Math.max(-4, Math.min(6, sum()));
            // The bar grows from the "no change" mark (at 40%: -4 ... 0 ... +6)
            const fill = part("fill");
            fill.style.left = (value < 0 ? 40 + value * 10 : 40) + "%";
            fill.style.width = Math.abs(value) * 10 + "%";
            fill.classList.toggle("is-less", value < 0);
            A.dom.setText(part("level"), api.text("level." + level()));
            const list = part("guesses");
            const on = SIGNALS.filter(function (signal) { return state.on[signal.id]; });
            let items = on.map(function (signal) { return "<li>" + api.text("g." + signal.id) + "</li>"; });
            if (state.on.skip && (state.on.like || state.on.end || state.on.share)) items.push('<li class="sig-mixed">' + api.text("mixed") + "</li>");
            if (!items.length) items = ['<li class="sig-none">' + api.text("none") + "</li>"];
            list.innerHTML = items.join("");
        }

        lab.addEventListener("click", function (event) {
            const chip = event.target.closest("[data-signal]");
            if (!chip) return;
            const id = chip.getAttribute("data-signal");
            state.on[id] = !state.on[id];
            update();
            api.announce(api.text("meter") + " " + api.text("level." + level()) + (state.on[id] ? ". " + api.text("g." + id) : ""));
        });

        update();
    }

    // ---------- 3. The lab for js/lessons.js ----------
    A.lessons.defineLab("signals", { build: build });
})();
