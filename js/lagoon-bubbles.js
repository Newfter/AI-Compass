/* =========================================================
   AI COMPASS — LAGOON BUBBLES
   Bubbles that rise slowly through <canvas id="lagoon-bubbles">, only while the
   Tropical Lagoon palette is on (css/lagoon.css shows the canvas only then, and
   only with "Extra effects" on and motion allowed). It draws nothing and runs no
   timer otherwise, stops while the tab is hidden, and never takes a click
   (pointer-events: none).

   The bubbles react to the pointer (mouse, finger or pen):
   - moving it: nearby bubbles are pushed aside and carried a little in the
     direction it moves, and turn lime while it is close;
   - a click or tap: a splash that throws the bubbles outwards and flashes them
     coral, then they calm down and rise again.
   The pointer events are listened to on the window, so nothing on the page is
   blocked by the canvas.
   ========================================================= */
(function () {
    "use strict";

    const A = window.AICompass;
    const canvas = document.getElementById("lagoon-bubbles");
    if (!A || !canvas || !canvas.getContext) return;

    const root = document.documentElement;
    const g = canvas.getContext("2d");

    // How the bubbles react
    const HOVER_RADIUS = 130;          // px around the pointer
    const HOVER_PUSH = 240;            // how hard the pointer pushes a bubble aside (px/s)
    const HOVER_DRAG = 0.35;           // how much of the pointer's own movement a bubble takes along
    const SPLASH_RADIUS = 280;         // px around a click
    const SPLASH_PUSH = 440;           // how hard a click throws a bubble away (px/s)
    const SETTLE = 2.0;                // how fast the push fades (higher = quicker)
    const HOVER_FADE = 2.0;            // how fast the lime glow fades (per second)
    const SPLASH_FADE = 0.9;           // how fast the coral flash fades (per second)

    // Colours as [r, g, b]: calm (aqua), near the pointer (lime), after a click (coral)
    const COLOURS = { base: [140, 255, 232], hover: [196, 242, 58], burst: [255, 120, 96] };

    let bubbles = [];
    let width = 0;
    let height = 0;
    let ratio = 1;
    let frame = 0;
    let last = 0;

    // The pointer: where it is, and how fast it moved lately (px/s, fading)
    const pointer = { x: 0, y: 0, active: false, vx: 0, vy: 0, time: 0 };

    function wanted() {
        return root.getAttribute("data-palette") === "lagoon"
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
        // About one bubble per 30,000 px² of screen, at most 55 (fewer on phones)
        const count = Math.min(55, Math.round(width * height / 30000));
        bubbles = [];
        for (let i = 0; i < count; i++) bubbles.push(makeBubble(true));
    }

    function makeBubble(anywhere) {
        const r = 3 + Math.random() * 13;
        return {
            x: Math.random() * width,
            y: anywhere ? Math.random() * height : height + r + Math.random() * 60,
            r: r,
            speed: 14 + Math.random() * 30 + (16 - r) * 1.2,   // small bubbles rise faster
            wobble: Math.random() * Math.PI * 2,
            sway: 6 + Math.random() * 12,
            alpha: 0.3 + Math.random() * 0.4,
            vx: 0,                                       // push from the pointer (px/s), fades out
            vy: 0,
            hover: 0,                                    // 0..1: lime glow near the pointer
            burst: 0                                     // 0..1: coral flash after a click
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
        if (!bubbles.length) return;
        const now = performance.now();
        const dt = Math.max((now - pointer.time) / 1000, 0.008);
        if (pointer.active) {
            // Speed of the pointer, smoothed so one jumpy event does not throw the bubbles
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
        if (!wanted() || !bubbles.length) return;
        onMove(event);
        for (const b of bubbles) {
            const dx = b.x - event.clientX;
            const dy = b.y - event.clientY;
            const distance = Math.hypot(dx, dy);
            if (distance > SPLASH_RADIUS) continue;
            const strength = 1 - distance / SPLASH_RADIUS;
            // Straight away from the click (a random push for a bubble right under it)
            const angle = distance < 1 ? Math.random() * Math.PI * 2 : Math.atan2(dy, dx);
            b.vx += Math.cos(angle) * SPLASH_PUSH * strength;
            b.vy += Math.sin(angle) * SPLASH_PUSH * strength;
            b.burst = Math.max(b.burst, 0.35 + 0.65 * strength);
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
        const settle = Math.exp(-SETTLE * dt);

        // The pointer's own movement fades when it stops moving
        pointer.vx *= Math.exp(-6 * dt);
        pointer.vy *= Math.exp(-6 * dt);

        g.clearRect(0, 0, width, height);
        for (const b of bubbles) {
            // 1. The pointer pushes the bubbles that are close, and drags them a little along
            if (pointer.active) {
                const dx = b.x - pointer.x;
                const dy = b.y - pointer.y;
                const distance = Math.hypot(dx, dy);
                if (distance < HOVER_RADIUS) {
                    const strength = 1 - distance / HOVER_RADIUS;
                    const nx = distance < 1 ? 0 : dx / distance;
                    const ny = distance < 1 ? 0 : dy / distance;
                    b.vx += (nx * HOVER_PUSH + pointer.vx * HOVER_DRAG) * strength * strength * dt * 6;
                    b.vy += (ny * HOVER_PUSH + pointer.vy * HOVER_DRAG) * strength * strength * dt * 6;
                    b.hover = Math.max(b.hover, strength);
                }
            }

            // 2. The usual rise and wobble, plus the push (which fades out)
            b.wobble += dt * 1.1;
            b.x += (Math.sin(b.wobble) * b.sway + b.vx) * dt;
            b.y += (-b.speed + b.vy) * dt;
            b.vx *= settle;
            b.vy *= settle;
            b.hover = Math.max(0, b.hover - HOVER_FADE * dt);
            b.burst = Math.max(0, b.burst - SPLASH_FADE * dt);

            // 3. A bubble that reached the top starts again at the bottom; the sides wrap round
            if (b.y < -b.r - 20 || b.y > height + 300) Object.assign(b, makeBubble(false));
            if (b.x < -b.r) b.x = width + b.r;
            if (b.x > width + b.r) b.x = -b.r;

            // 4. Colour: calm aqua -> lime near the pointer -> coral after a click
            let rgb = mix(COLOURS.base, COLOURS.hover, b.hover);
            rgb = mix(rgb, COLOURS.burst, b.burst);
            const lively = Math.max(b.hover, b.burst);
            const alpha = Math.min(1, b.alpha + 0.4 * lively);
            const colour = Math.round(rgb[0]) + "," + Math.round(rgb[1]) + "," + Math.round(rgb[2]);
            const radius = b.r * (1 + 0.25 * lively);

            // A bubble: a thin ring, a faint fill and a small shine at the top left
            g.beginPath();
            g.arc(b.x, b.y, radius, 0, Math.PI * 2);
            g.fillStyle = "rgba(" + colour + "," + (alpha * 0.12) + ")";
            g.fill();
            g.lineWidth = 1.2;
            g.strokeStyle = "rgba(" + colour + "," + alpha + ")";
            g.stroke();
            g.beginPath();
            g.arc(b.x, b.y, radius * 0.66, Math.PI * 1.15, Math.PI * 1.5);
            g.strokeStyle = "rgba(255,255,255," + Math.min(1, alpha + 0.15) + ")";
            g.stroke();
        }
        frame = requestAnimationFrame(draw);
    }

    function refresh() {
        if (wanted()) {
            if (!bubbles.length || canvas.clientWidth !== width) resize();
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

    // The pointer (passive: the bubbles never block scrolling or a click)
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
