/* =========================================================
   AI COMPASS — ARCTIC SNOW
   A few slowly falling snowflakes on <canvas id="arctic-snow">, only while
   the Arctic Blue palette is on (css/arctic-blue.css shows the canvas only
   then, and only with "Extra effects" on and motion allowed).
   It draws nothing and runs no timer otherwise, stops while the tab is
   hidden, and never takes a click (pointer-events: none).

   The snow reacts to the pointer (mouse, finger or pen):
   - moving it: nearby flakes are pushed away and carried a little in the
     direction it moves, and glow cyan while it is close;
   - a click or tap: a burst that blows the flakes outwards and flashes
     them periwinkle blue, then they calm down and fall again.
   The pointer events are listened to on the window, so nothing on the
   page is blocked by the canvas.
   ========================================================= */
(function () {
    "use strict";

    const A = window.AICompass;
    const canvas = document.getElementById("arctic-snow");
    if (!A || !canvas || !canvas.getContext) return;

    const root = document.documentElement;
    const g = canvas.getContext("2d");

    // How the snow reacts
    const HOVER_RADIUS = 120;          // px around the pointer
    const HOVER_PUSH = 220;            // how hard the pointer pushes a flake away (px/s)
    const HOVER_DRAG = 0.35;           // how much of the pointer's own movement a flake takes along
    const BURST_RADIUS = 260;          // px around a click
    const BURST_PUSH = 420;            // how hard a click blows a flake away (px/s)
    const SETTLE = 2.2;                // how fast the push fades (higher = quicker)
    const HOVER_FADE = 2.2;            // how fast the cyan glow fades (per second)
    const BURST_FADE = 0.9;            // how fast the periwinkle flash fades (per second)

    // Colours as [r, g, b]: calm, near the pointer, after a click (all blues). Night / day.
    const COLOURS = {
        dark:  { base: [225, 245, 255], hover: [90, 215, 255],  burst: [140, 165, 255] },
        light: { base: [40, 120, 190],  hover: [0, 160, 205],   burst: [70, 90, 220] }
    };

    let flakes = [];
    let width = 0;
    let height = 0;
    let ratio = 1;
    let frame = 0;
    let last = 0;

    // The pointer: where it is, and how fast it moved lately (px/s, fading)
    const pointer = { x: 0, y: 0, active: false, vx: 0, vy: 0, time: 0 };

    function wanted() {
        return root.getAttribute("data-palette") === "arctic"
            && root.classList.contains("fx-fancy")
            && A.motion.ok()
            && !document.hidden;
    }

    function resize() {
        ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        g.setTransform(ratio, 0, 0, ratio, 0, 0);
        // About one flake per 18,000 px² of screen, at most 90 (fewer on phones)
        const count = Math.min(90, Math.round(width * height / 18000));
        flakes = [];
        for (let i = 0; i < count; i++) flakes.push(makeFlake(true));
    }

    function makeFlake(anywhere) {
        return {
            x: Math.random() * width,
            y: anywhere ? Math.random() * height : -10,
            r: 0.8 + Math.random() * 2.2,
            speed: 14 + Math.random() * 28,           // px per second
            drift: Math.random() * Math.PI * 2,
            sway: 8 + Math.random() * 14,
            alpha: 0.35 + Math.random() * 0.5,
            vx: 0,                                    // push from the pointer (px/s), fades out
            vy: 0,
            hover: 0,                                 // 0..1: glow near the pointer
            burst: 0                                  // 0..1: flash after a click
        };
    }

    function mix(a, b, amount) {
        return [
            a[0] + (b[0] - a[0]) * amount,
            a[1] + (b[1] - a[1]) * amount,
            a[2] + (b[2] - a[2]) * amount
        ];
    }

    // ----- The pointer -----
    function onMove(event) {
        if (!flakes.length) return;
        const now = performance.now();
        const dt = Math.max((now - pointer.time) / 1000, 0.008);
        if (pointer.active) {
            // Speed of the pointer, smoothed so one jumpy event does not throw the snow
            pointer.vx = pointer.vx * 0.6 + ((event.clientX - pointer.x) / dt) * 0.4;
            pointer.vy = pointer.vy * 0.6 + ((event.clientY - pointer.y) / dt) * 0.4;
        }
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.time = now;
        pointer.active = true;
    }

    function onLeave() {
        pointer.active = false;
        pointer.vx = pointer.vy = 0;
    }

    function onDown(event) {
        if (!wanted() || !flakes.length) return;
        onMove(event);
        for (const f of flakes) {
            const dx = f.x - event.clientX;
            const dy = f.y - event.clientY;
            const distance = Math.hypot(dx, dy);
            if (distance > BURST_RADIUS) continue;
            const strength = 1 - distance / BURST_RADIUS;
            // Straight away from the click (a random push for a flake right under it)
            const angle = distance < 1 ? Math.random() * Math.PI * 2 : Math.atan2(dy, dx);
            f.vx += Math.cos(angle) * BURST_PUSH * strength;
            f.vy += Math.sin(angle) * BURST_PUSH * strength;
            f.burst = Math.max(f.burst, 0.35 + 0.65 * strength);
        }
        kick();
    }

    // Makes sure the loop runs (it may have been asleep) and the first frame has a fair time step
    function kick() {
        if (!frame && wanted()) { last = 0; frame = requestAnimationFrame(draw); }
    }

    function draw(time) {
        frame = 0;
        if (!wanted()) { g.clearRect(0, 0, width, height); return; }
        const dt = Math.min((time - (last || time)) / 1000, 0.05);
        last = time;
        const set = COLOURS[A.theme === "light" ? "light" : "dark"];
        const settle = Math.exp(-SETTLE * dt);

        // The pointer's own movement fades when it stops moving
        pointer.vx *= Math.exp(-6 * dt);
        pointer.vy *= Math.exp(-6 * dt);

        g.clearRect(0, 0, width, height);
        for (const f of flakes) {
            // 1. The pointer pushes the flakes that are close, and drags them a little along
            if (pointer.active) {
                const dx = f.x - pointer.x;
                const dy = f.y - pointer.y;
                const distance = Math.hypot(dx, dy);
                if (distance < HOVER_RADIUS) {
                    const strength = 1 - distance / HOVER_RADIUS;
                    const nx = distance < 1 ? 0 : dx / distance;
                    const ny = distance < 1 ? 0 : dy / distance;
                    f.vx += (nx * HOVER_PUSH + pointer.vx * HOVER_DRAG) * strength * strength * dt * 6;
                    f.vy += (ny * HOVER_PUSH + pointer.vy * HOVER_DRAG) * strength * strength * dt * 6;
                    f.hover = Math.max(f.hover, strength);
                }
            }

            // 2. The usual fall and sway, plus the push (which fades out)
            f.drift += dt * 0.8;
            f.x += (Math.sin(f.drift) * f.sway + f.vx) * dt;
            f.y += (f.speed + f.vy) * dt;
            f.vx *= settle;
            f.vy *= settle;
            f.hover = Math.max(0, f.hover - HOVER_FADE * dt);
            f.burst = Math.max(0, f.burst - BURST_FADE * dt);

            // 3. A flake that left the bottom starts again at the top; the sides wrap round
            if (f.y > height + 10 || f.y < -200) {
                Object.assign(f, makeFlake(false));
            }
            if (f.x < -10) f.x = width + 10;
            if (f.x > width + 10) f.x = -10;

            // 4. Colour: calm -> cyan near the pointer -> periwinkle after a click. They also
            //    shine a little brighter and bigger while they react.
            let rgb = mix(set.base, set.hover, f.hover);
            rgb = mix(rgb, set.burst, f.burst);
            const lively = Math.max(f.hover, f.burst);
            const alpha = Math.min(1, f.alpha + 0.4 * lively);
            g.fillStyle = "rgba(" + Math.round(rgb[0]) + "," + Math.round(rgb[1]) + "," + Math.round(rgb[2]) + "," + alpha + ")";
            g.beginPath();
            g.arc(f.x, f.y, f.r * (1 + 0.5 * lively), 0, Math.PI * 2);
            g.fill();
        }
        frame = requestAnimationFrame(draw);
    }

    function refresh() {
        if (wanted()) {
            if (!flakes.length || canvas.clientWidth !== width) resize();
            if (!frame) { last = 0; frame = requestAnimationFrame(draw); }
        } else if (frame) {
            cancelAnimationFrame(frame);
            frame = 0;
            g.clearRect(0, 0, width, height);
        }
    }

    document.addEventListener("aic:palette", refresh);
    document.addEventListener("aic:theme", refresh);
    document.addEventListener("aic:motion", refresh);
    document.addEventListener("aic:settings", refresh);       // "Extra effects" switched on or off
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("resize", A.util.debounce(function () {
        if (wanted()) resize();
    }, 200));

    // The pointer (passive: the snow never blocks scrolling or a click)
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", function (event) {
        // A finger that lifts leaves no pointer behind; a mouse stays where it is
        if (event.pointerType === "touch") onLeave();
    }, { passive: true });
    window.addEventListener("pointercancel", onLeave, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("blur", onLeave);

    // Settings (js/settings.js) set the fx-fancy class a little after start-up
    new MutationObserver(refresh).observe(root, { attributes: true, attributeFilter: ["class", "data-palette"] });

    refresh();
})();
