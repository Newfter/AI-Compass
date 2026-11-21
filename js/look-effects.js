/* =========================================================
   AI COMPASS — THE ANIMATIONS OF THE NEW LOOKS
   One small engine draws the gentle animation of whichever new look is on, on
   <canvas id="look-effects">: petals for Cherry Blossom, leaves for Autumn
   Maple, fireflies for Deep Forest, stars for Deep Space. Paper & Ink has
   none: it is the calm look for reading. (Arctic Blue and Tropical Lagoon
   have their own files, js/arctic-snow.js and js/lagoon-bubbles.js.)

   The animation of a look is a SCENE: a small object that says how many
   particles it wants, how one is born, how it moves and how it is drawn
   (part 3). The ENGINE (parts 1, 2 and 4) owns everything else, once, for
   every scene:
   - it runs only while the look that is on has a scene, "Extra effects" is
     on, motion is allowed and the tab is visible. Otherwise it draws
     nothing, holds no timer, no animation frame and no listener for the
     pointer, and the canvas is empty;
   - the size of the canvas (sharp, but never more than 2 device pixels for
     one pixel) and the number of particles (fewer on a phone, never more
     than 60);
   - the pointer (mouse, finger or pen), listened to on the window: the
     canvas itself never takes a click or a scroll (css/looks.css);
   - time steps that never jump, and fewer particles on a device that
     cannot keep up;
   - a scene that throws is switched off for the rest of the visit, the
     error is reported once, and the page goes on.
   Nothing is saved, nothing is loaded, no text is shown.

   THE PARTS OF THIS FILE
    1. The engine: settings and state
    2. The kit: the tools a scene moves and draws with
    3. The scenes, one per look, each between two marker lines
    4. The engine: size and particles, the pointer, the loop, when it runs
    5. Start, and the public API
   Other files may read AICompass.lookEffects (see the last part).
   The styles (the canvas, and the rule that shows it for a look) are in
   css/looks.css.
   ========================================================= */
(function () {
    "use strict";

    const A = window.AICompass;
    const canvas = document.getElementById("look-effects");
    if (!A || !canvas || !canvas.getContext) return;
    const g = canvas.getContext("2d");
    if (!g) return;

    const root = document.documentElement;

    // ---------- 1. THE ENGINE: SETTINGS AND STATE ----------
    const MAX_PARTICLES = 60;          // never more than this, whatever a scene asks for
    const LAPTOP_AREA = 1366 * 768;    // a scene's "count" is meant for a screen of this size (in px²)
    const MAX_RATIO = 2;               // device pixels for one CSS pixel, at most
    const MAX_PIXELS = 4000000;        // a huge screen gets a less sharp canvas instead of a slow one
    const MAX_STEP = 0.05;             // seconds: the longest time step (a tab that wakes up must not make particles jump)
    const RESIZE_WAIT = 200;           // ms of quiet after a resize before the canvas is measured again
    const SLOW_FRAME = 40;             // ms between two frames: more than this is a slow frame (under 25 pictures a second)
    const SLOW_FOR = 2000;             // ms of slow frames before the engine draws half the particles...
    const MAX_HALVINGS = 2;            // ...which it does at most twice in a visit
    const PAUSE = 250;                 // ms: a gap this long is a pause (the page was busy), not a slow device
    const POINTER_FADE = 6;            // how fast the pointer's own speed fades when it stops (per second)
    const NEAR_FADE = 2.2;             // how fast "near the pointer" fades from a particle (per second)
    const BURST_FADE = 0.9;            // how fast the flash of a press fades (per second)
    const MAX_SPRITES = 48;            // soft dots kept ready for kit.glow (one per colour)

    const SCENES = {};                 // the id of a look -> its scene (part 3)
    const broken = {};                 // the id of a look -> true: its scene threw, it stays off for this visit

    let scene = null;                  // the scene that is on the canvas, or null
    let sceneId = "";                  // its look's id, "" for none
    let particles = [];
    let fresh = false;                 // true: the scene has just come on, its particles are not born yet
    let width = 0;                     // the size of the canvas on the page, in CSS pixels
    let height = 0;
    let ratio = 1;                     // device pixels for one CSS pixel on the canvas
    let frame = 0;                     // the animation frame that is asked for, 0 for none
    let last = 0;                      // the time of the frame before, 0 right after a start
    let resizeTimer = 0;
    let listening = false;             // true while the pointer and the window's size are listened to
    let slowTime = 0;                  // ms of slow frames in a row (fast frames take it down again)
    let watchFrom = 0;                 // slow frames count from this time on (not while the page starts)
    let halvings = 0;                  // how often the number of particles was halved

    // The pointer: where it is, and how fast it moved lately (px per second, fading)
    const pointer = { x: 0, y: 0, active: false, vx: 0, vy: 0, time: 0 };

    // ---------- 2. THE KIT: THE TOOLS A SCENE MOVES AND DRAWS WITH ----------
    // Every function of a scene gets the kit. A particle "p" is a plain object. The engine
    // owns these fields of it; a scene may read them all and write x and y:
    //     p.x, p.y       where it is, in CSS pixels (0, 0 is the top left corner of the screen)
    //     p.vx, p.vy     the push it got from the pointer or from a press (px per second).
    //                    The engine adds it to x and y after move(), and lets it fade out.
    //     p.near         0..1: how close the pointer is (1 = right under it); fades by itself
    //     p.burst        0..1: the flash of a press nearby; fades by itself
    //     p.age          seconds since it was born
    // Everything else on p belongs to the scene (its size, its speed, its colour...).
    const sprites = new Map();         // "r,g,b" -> a small canvas with a soft dot of that colour

    function makeSprite(rgb) {
        const size = 64;
        const sprite = document.createElement("canvas");
        sprite.width = size;
        sprite.height = size;
        const pen = sprite.getContext("2d");
        const light = pen.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        light.addColorStop(0, kit.rgba(rgb, 1));
        light.addColorStop(0.22, kit.rgba(rgb, 0.5));
        light.addColorStop(0.55, kit.rgba(rgb, 0.13));
        light.addColorStop(1, kit.rgba(rgb, 0));
        pen.fillStyle = light;
        pen.fillRect(0, 0, size, size);
        return sprite;
    }

    const kit = {
        width: 0,                      // the size of the screen, in CSS pixels
        height: 0,
        time: 0,                       // seconds this scene has been running
        dt: 0,                         // seconds since the frame before (never more than 0.05)
        pointer: pointer,              // { x, y, active, vx, vy }: read it, never change it
        state: {},                     // the scene's own notes (a shooting star on its way...); empty when the scene starts

        // ----- Numbers -----
        // A number from min up to max
        rand: function (min, max) {
            return min + Math.random() * (max - min);
        },

        // One item of a list, by chance
        pick: function (list) {
            return list[Math.floor(Math.random() * list.length)];
        },

        // A value that swings smoothly between -1 and 1 (to sway left and right). rate: how fast
        // (1 is one full swing in about 6 seconds); phase: a number of the particle's own, so
        // that they do not all swing together.
        swing: function (rate, phase) {
            return Math.sin(kit.time * rate + (phase || 0));
        },

        // The same between 0 and 1 (to twinkle, to glow and dim)
        pulse: function (rate, phase) {
            return 0.5 + 0.5 * Math.sin(kit.time * rate + (phase || 0));
        },

        // ----- Where a particle is -----
        // Puts a particle on the screen: "anywhere", or just outside one edge: "top", "bottom",
        // "left", "right", or "edge" (one of the four, by chance). margin: how far outside, in px.
        place: function (p, where, margin) {
            const m = margin || 0;
            const side = where === "edge" ? kit.pick(["top", "bottom", "left", "right"]) : where;
            p.x = side === "left" ? -m : side === "right" ? width + m : Math.random() * width;
            p.y = side === "top" ? -m : side === "bottom" ? height + m : Math.random() * height;
        },

        // The particle starts again: the scene's born(p, kit, false) gives it new values
        respawn: function (p) {
            p.vx = p.vy = p.near = p.burst = p.age = 0;
            scene.born(p, kit, false);
        },

        // true when the particle has left the screen by more than margin px
        outside: function (p, margin) {
            const m = margin || 0;
            return p.x < -m || p.x > width + m || p.y < -m || p.y > height + m;
        },

        // A particle that leaves through the left edge comes back in at the right, and the
        // other way round (for things that fall or rise)
        wrapSides: function (p, margin) {
            const m = margin || 0;
            if (p.x < -m) p.x = width + m;
            else if (p.x > width + m) p.x = -m;
        },

        // The same on all four edges (for things that wander)
        wrapAround: function (p, margin) {
            const m = margin || 0;
            kit.wrapSides(p, m);
            if (p.y < -m) p.y = height + m;
            else if (p.y > height + m) p.y = -m;
        },

        // Moves a particle a part of the way to the point x, y: fast when it is far, slower as
        // it arrives (a star drifting back to its place). rate: how eager (2 is gentle).
        towards: function (p, x, y, rate) {
            const part = 1 - Math.exp(-rate * kit.dt);
            p.x += (x - p.x) * part;
            p.y += (y - p.y) * part;
        },

        // ----- Colours: a colour is [red, green, blue], each 0..255 -----
        // Between two colours: amount 0 gives a, 1 gives b
        mix: function (a, b, amount) {
            const t = amount < 0 ? 0 : amount > 1 ? 1 : amount;
            return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        },

        // The colour as the canvas wants it, alpha 0 (invisible) to 1 (solid)
        rgba: function (rgb, alpha) {
            const a = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
            return "rgba(" + Math.round(rgb[0]) + "," + Math.round(rgb[1]) + "," + Math.round(rgb[2]) + "," + a + ")";
        },

        // ----- Drawing -----
        // A soft round light (the halo of a star, a firefly): its centre, how far it reaches in
        // px, its colour and its strength 0..1. Much faster than a canvas shadow or a new
        // gradient: a small picture of the light is made once per colour and copied.
        glow: function (pen, x, y, radius, rgb, alpha) {
            if (!(alpha > 0) || !(radius > 0)) return;
            // (colours are rounded to steps of 8, so a colour that changes slowly needs few pictures)
            const key = (Math.round(rgb[0]) >> 3) + "," + (Math.round(rgb[1]) >> 3) + "," + (Math.round(rgb[2]) >> 3);
            let sprite = sprites.get(key);
            if (!sprite) {
                if (sprites.size >= MAX_SPRITES) sprites.clear();
                sprite = makeSprite(rgb);
                sprites.set(key, sprite);
            }
            const before = pen.globalAlpha;
            pen.globalAlpha = before * Math.min(1, alpha);
            pen.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
            pen.globalAlpha = before;
        },

        // Moves the pen to x, y and turns it by angle (in radians): after this, 0, 0 is the
        // centre of the particle. squash (optional, -1..1) flattens what is drawn along its
        // height: let it swing and a petal flips. The engine puts the pen back after draw().
        turn: function (pen, x, y, angle, squash) {
            pen.translate(x, y);
            if (angle) pen.rotate(angle);
            if (squash !== undefined) pen.scale(1, squash);
        }
    };

    // ---------- 3. THE SCENES ----------
    // One scene per look, in the order of the picker. A scene is one object:
    //
    //     SCENES.<id> = {
    //         count: 40,                  how many particles on a laptop screen. The engine makes
    //                                     fewer on a smaller screen and never more than 60.
    //         least: 12,                  (optional) the fewest, for the smallest screens
    //         pointer: { radius: 120, push: 200, drag: 0.35 },
    //                                     (optional) particles closer to the pointer than radius
    //                                     (px) are pushed away with this strength (px per second;
    //                                     a negative push pulls them in), and carried along with
    //                                     the pointer's own movement (drag, 0..1). p.near says how
    //                                     close the pointer is.
    //         press: { radius: 260, push: 420 },
    //                                     (optional) a press (click or tap) throws the particles
    //                                     around it outwards, and sets their p.burst
    //         settle: 2,                  (optional) how fast a push fades out (per second)
    //
    //         start(kit) {},              (optional) once when the scene comes on, and after the
    //                                     screen changed its size: prepare kit.state
    //         born(p, kit, first) {},     gives a particle its place and its own values. first is
    //                                     true at the start (anywhere on the screen), false when a
    //                                     particle starts again (at an edge)
    //         move(p, dt, kit) {},        moves one particle by dt seconds
    //         draw(p, pen, kit) {},       draws one particle. pen is the canvas's 2D context,
    //                                     measured in CSS pixels
    //         behind(pen, kit) {},        (optional) once per frame, before the particles
    //         front(pen, kit) {},         (optional) once per frame, after the particles
    //         pressed(x, y, kit) {}       (optional) a press at x, y: something of the scene's own
    //     };
    //
    // The engine calls every function with "this" set to the scene, so a scene keeps its own
    // constants (colours, speeds) as properties and reads them with "this.". It clears the
    // canvas before every frame and puts the pen back after every call (place, turn, alpha),
    // so a scene never needs save() and restore(). A scene has no timers, no listeners and
    // no loop of its own: kit.time, kit.dt, kit.pointer and pressed() are all it needs.

    // ===== LOOK: paper =====
    // no scene: Paper & Ink is the calm look for reading, nothing moves
    // ===== END LOOK: paper =====

    // ===== LOOK: blossom =====
    // Cherry Blossom: a few petals fall slowly from above. Each is a small petal (a pointed
    // base, a round tip with a notch) in one of three pinks, or white with a thin rose edge;
    // the near ones are bigger and a little faster than the far ones. A petal sways, rocks
    // with its sway, turns slowly, and now and then flips over. Near the pointer the petals
    // swirl aside. A press is a small gust: the petals around it are lifted and flutter,
    // then they fall again.
    SCENES.blossom = {
        count: 18,                                           // about half the bubbles of Tropical Lagoon
        least: 5,
        pointer: { radius: 110, push: 140, drag: 0.4 },
        press: { radius: 220, push: 45 },                    // a gust is a lift (see move), not a scatter
        settle: 1.5,
        // The fill of a petal, its thin edge, and how solid the fill is: three pinks, and a
        // white one (on the pale page it is its edge that shows)
        tints: [
            { fill: [247, 170, 196], edge: [224, 110, 150], solid: 1 },
            { fill: [243, 143, 178], edge: [212, 90, 136], solid: 1 },
            { fill: [251, 196, 212], edge: [228, 126, 160], solid: 1 },
            { fill: [255, 255, 255], edge: [220, 116, 152], solid: 1.6 }
        ],

        born(p, kit, first) {
            kit.place(p, first ? "anywhere" : "top", 24);    // later ones come in from above
            p.depth = Math.random();                         // 0 far (small, pale, slow) to 1 near
            p.size = 4.5 + 3.5 * p.depth;                    // half its length, in px
            p.fall = 17 + 19 * p.depth + kit.rand(0, 6);     // px per second
            p.sway = kit.rand(12, 30);                       // px to each side
            p.rate = kit.rand(0.45, 0.95);
            p.phase = kit.rand(0, 6.28);
            p.angle = kit.rand(0, 6.28);
            p.spin = kit.rand(0.12, 0.5) * (Math.random() < 0.5 ? -1 : 1);     // radians per second
            p.flip = kit.rand(0, 6.28);                      // where it is in its flip
            p.flipRate = kit.rand(0.3, 0.7);
            p.tint = kit.pick(this.tints);
        },

        move(p, dt, kit) {
            // A gust (p.burst, after a press) lifts the petal before it falls again
            p.y += (p.fall - 200 * p.burst) * dt;
            p.x += Math.cos(kit.time * p.rate + p.phase) * p.sway * p.rate * dt;
            // Near the pointer it swirls: a little way around it
            if (p.near > 0 && kit.pointer.active) {
                const dx = p.x - kit.pointer.x;
                const dy = p.y - kit.pointer.y;
                const far = Math.hypot(dx, dy) || 1;
                const swirl = 70 * p.near * Math.sign(p.spin) * dt;
                p.x -= dy / far * swirl;
                p.y += dx / far * swirl;
            }
            // ...and it turns and flips faster there, and in a gust
            const lively = 1 + 5 * p.near + 8 * p.burst;
            p.angle += p.spin * lively * dt;
            p.flip += p.flipRate * lively * dt;
            if (p.y > kit.height + 24) kit.respawn(p);
            kit.wrapSides(p, 24);
        },

        draw(p, pen, kit) {
            const s = p.size;
            const alpha = Math.min(1, p.age * 2) * (0.4 + 0.2 * p.depth);
            // The squash stays near 1 or -1 (the petal lies open) and passes 0 quickly: a flip
            const wave = Math.sin(p.flip);
            const squash = (wave < 0 ? -1 : 1) * Math.max(0.08, Math.pow(Math.abs(wave), 0.4));
            kit.turn(pen, p.x, p.y, p.angle + 0.45 * kit.swing(p.rate, p.phase), squash);
            pen.beginPath();
            pen.moveTo(-s, 0);                                                   // the pointed base
            pen.bezierCurveTo(-s * 0.35, -s * 0.8, s * 0.7, -s * 0.78, s, -s * 0.2);
            pen.quadraticCurveTo(s * 0.84, -s * 0.03, s * 0.72, 0);              // the notch of the tip
            pen.quadraticCurveTo(s * 0.84, s * 0.03, s, s * 0.2);
            pen.bezierCurveTo(s * 0.7, s * 0.78, -s * 0.35, s * 0.8, -s, 0);
            pen.fillStyle = kit.rgba(p.tint.fill, alpha * p.tint.solid);
            pen.fill();
            pen.strokeStyle = kit.rgba(p.tint.edge, alpha * 0.8);
            pen.lineWidth = 0.8;
            pen.stroke();
        }
    };
    // ===== END LOOK: blossom =====

    // ===== LOOK: autumn =====
    // Autumn Maple: a few big leaves fall slowly from above, in amber, maple red, gold and
    // one brown. Two in three are maple leaves with five points, the others plain oval
    // ones; each has a stem. A leaf sways wide and slowly, drifts a little with the breeze
    // and turns as it falls; the near ones are bigger and a little faster. Near the pointer
    // the leaves are blown aside. A press is a gust: the leaves around it whirl upward,
    // then they fall again. Leaves, not confetti: few and fairly large.
    SCENES.autumn = {
        count: 14,
        least: 5,
        pointer: { radius: 120, push: 170, drag: 0.4 },
        press: { radius: 240, push: 60 },                    // a gust is a lift (see move), not a scatter
        settle: 1.4,
        // The fill of a leaf, and a darker tone for its stem and midrib
        tints: [
            { fill: [240, 150, 60], vein: [150, 78, 24] },
            { fill: [214, 84, 52], vein: [128, 40, 26] },
            { fill: [240, 190, 84], vein: [156, 110, 36] },
            { fill: [156, 98, 58], vein: [96, 56, 30] }
        ],
        // The outline of a maple leaf: its upper half, from the base to the tip (the leaf
        // lies along x from -1 to 1; the lower half is the same, mirrored)
        maple: [[-0.5, 0], [-0.78, 0.5], [-0.22, 0.32], [0.16, 0.95], [0.34, 0.3], [1, 0]],

        born(p, kit, first) {
            kit.place(p, first ? "anywhere" : "top", 34);    // later ones come in from above
            p.depth = Math.random();                         // 0 far (small, pale, slow) to 1 near
            p.size = 9 + 7 * p.depth;                        // half its length, in px
            p.fall = 20 + 20 * p.depth + kit.rand(0, 8);     // px per second
            p.sway = kit.rand(26, 54);                       // px to each side: wide
            p.rate = kit.rand(0.3, 0.65);                    // ...and slow
            p.phase = kit.rand(0, 6.28);
            p.drift = kit.rand(-8, 20);                      // the breeze: mostly to the right
            p.angle = kit.rand(0, 6.28);
            p.spin = kit.rand(0.2, 0.7) * (Math.random() < 0.5 ? -1 : 1);     // radians per second
            p.oval = Math.random() < 0.34;
            p.tint = kit.pick(this.tints);
        },

        move(p, dt, kit) {
            // A gust (p.burst, after a press) whirls the leaf upward before it falls again
            p.y += (p.fall - 230 * p.burst) * dt;
            p.x += (Math.cos(kit.time * p.rate + p.phase) * p.sway * p.rate + p.drift) * dt;
            // ...and it turns faster near the pointer and in a gust
            p.angle += p.spin * (1 + 4 * p.near + 9 * p.burst) * dt;
            if (p.y > kit.height + 34) kit.respawn(p);
            kit.wrapSides(p, 34);
        },

        draw(p, pen, kit) {
            const s = p.size;
            const alpha = Math.min(1, p.age * 2) * (0.36 + 0.2 * p.depth);
            // The squash swings between 0.1 and 1: the leaf tilts towards us and away
            kit.turn(pen, p.x, p.y, p.angle, 0.55 + 0.45 * kit.swing(p.rate * 1.3, p.phase));
            pen.beginPath();
            if (p.oval) {
                pen.moveTo(-s, 0);
                pen.quadraticCurveTo(-s * 0.1, -s * 0.8, s, 0);
                pen.quadraticCurveTo(-s * 0.1, s * 0.8, -s, 0);
            } else {
                const shape = this.maple;
                pen.moveTo(shape[0][0] * s, 0);
                for (let i = 1; i < shape.length; i++) pen.lineTo(shape[i][0] * s, -shape[i][1] * s);
                for (let i = shape.length - 2; i > 0; i--) pen.lineTo(shape[i][0] * s, shape[i][1] * s);
                pen.closePath();
            }
            pen.fillStyle = kit.rgba(p.tint.fill, alpha);
            pen.fill();
            pen.strokeStyle = kit.rgba(p.tint.vein, alpha);
            pen.lineWidth = 1;
            pen.beginPath();                                 // the stem and the midrib
            pen.moveTo(-s * 1.4, 0);
            pen.lineTo(s * 0.6, 0);
            pen.stroke();
        }
    };
    // ===== END LOOK: autumn =====

    // ===== LOOK: forest =====
    // Deep Forest: fireflies. Small warm lights with a soft glow wander on smooth curving
    // paths and slowly brighten and dim, each at its own pace; a few are close and bright,
    // most are far and faint. They are curious: near the pointer they come a little closer
    // and circle it, but never crowd it. A press makes the ones around it flare and scatter,
    // then they go back to wandering. Few on purpose: twenty fireflies are magic, eighty are
    // a screensaver.
    SCENES.forest = {
        count: 20,
        least: 7,
        pointer: { radius: 170, push: -34, drag: 0 },        // a negative push: they come closer
        press: { radius: 220, push: 300 },
        settle: 1.6,
        light: [255, 226, 130],

        born(p, kit) {
            kit.place(p, "anywhere");
            p.depth = Math.random() < 0.25 ? 1 : Math.random() * 0.6;     // one in four is close
            p.size = 1.3 + 1.7 * p.depth;
            p.speed = kit.rand(9, 22);                       // px per second
            p.heading = kit.rand(0, 6.28);                   // where it flies to (radians)
            p.turn = kit.rand(0.3, 0.9);                     // how fast the heading wanders
            p.rate = kit.rand(0.4, 1.1);                     // how fast it glows and dims
            p.phase = kit.rand(0, 6.28);
            p.side = Math.random() < 0.5 ? -1 : 1;           // which way round it circles the pointer
        },

        move(p, dt, kit) {
            p.heading += kit.swing(p.turn, p.phase) * 0.9 * dt;
            p.x += Math.cos(p.heading) * p.speed * dt;
            p.y += Math.sin(p.heading) * p.speed * dt;
            // Near the pointer it circles it, and it backs away when it gets too close
            if (p.near > 0 && kit.pointer.active) {
                const dx = p.x - kit.pointer.x;
                const dy = p.y - kit.pointer.y;
                const far = Math.hypot(dx, dy) || 1;
                const round = 46 * p.near * p.side * dt;
                p.x -= dy / far * round;
                p.y += dx / far * round;
                if (far < 46) {
                    p.x += dx / far * 60 * dt;
                    p.y += dy / far * 60 * dt;
                }
            }
            kit.wrapAround(p, 20);
        },

        draw(p, pen, kit) {
            const glow = (0.2 + 0.8 * kit.pulse(p.rate, p.phase)) * Math.min(1, p.age);
            const alpha = Math.min(1, glow * (0.35 + 0.65 * p.depth) + 0.5 * p.near + 0.8 * p.burst);
            kit.glow(pen, p.x, p.y, p.size * 7, this.light, alpha * 0.5);
            pen.fillStyle = kit.rgba(this.light, alpha);
            pen.beginPath();
            pen.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            pen.fill();
        }
    };
    // ===== END LOOK: forest =====

    // ===== LOOK: space =====
    // Deep Space: stars that stay where they are and twinkle, each at its own pace; a few are
    // bright. Every 8 to 15 seconds a shooting star crosses a part of the sky. Stars near the
    // pointer brighten and are nudged a little. A press makes a small ripple of light: the
    // stars around it scatter, then drift back to their places.
    SCENES.space = {
        count: 60,
        least: 18,
        pointer: { radius: 130, push: 70, drag: 0.08 },
        press: { radius: 230, push: 300 },
        settle: 2.4,
        // Star-white, a warm pink-white, a cool blue-white; right under the pointer; after a press
        tints: [[238, 234, 255], [238, 234, 255], [255, 220, 240], [178, 236, 255]],
        near: [255, 255, 255],
        flash: [130, 232, 240],

        start(kit) {
            kit.state.wait = kit.rand(3, 7);       // seconds until the first shooting star
            kit.state.streak = null;               // the shooting star that is on its way
            kit.state.ripples = [];                // the rings of light of the last presses
        },

        born(p, kit) {
            kit.place(p, "anywhere");
            p.homeX = p.x;                         // a star has a place of its own: it drifts back to it
            p.homeY = p.y;
            p.bright = Math.random() < 0.16;       // about one star in six is a bright one
            p.size = p.bright ? kit.rand(1.5, 2.1) : kit.rand(0.7, 1.3);
            p.rate = kit.rand(0.5, 1.7);           // how fast it twinkles
            p.phase = kit.rand(0, 6.28);
            p.tint = kit.pick(this.tints);
        },

        move(p, dt, kit) {
            kit.towards(p, p.homeX, p.homeY, 1.8);
        },

        draw(p, pen, kit) {
            const twinkle = 0.3 + 0.7 * kit.pulse(p.rate, p.phase);
            const lively = Math.max(p.near, p.burst);
            // A small star stays dim (a bright dot beside a word would look like a full stop)
            const alpha = Math.min(1, (p.bright ? 0.85 : 0.45) * twinkle + 0.5 * lively) * Math.min(1, p.age);
            const rgb = kit.mix(kit.mix(p.tint, this.near, p.near), this.flash, p.burst);
            if (p.bright || lively > 0.05) kit.glow(pen, p.x, p.y, p.size * (4 + 5 * lively), rgb, alpha * 0.55);
            pen.fillStyle = kit.rgba(rgb, alpha);
            pen.beginPath();
            pen.arc(p.x, p.y, p.size * (1 + 0.4 * lively), 0, Math.PI * 2);
            pen.fill();
            if (!p.bright) return;
            // A bright star has four thin rays, which grow and shrink as it twinkles
            const ray = p.size * (2 + 4 * twinkle + 3 * lively);
            pen.fillStyle = kit.rgba(rgb, alpha * 0.22);
            pen.fillRect(p.x - ray, p.y - 0.4, ray * 2, 0.8);
            pen.fillRect(p.x - 0.4, p.y - ray, 0.8, ray * 2);
            pen.fillStyle = kit.rgba(rgb, alpha * 0.3);
            pen.fillRect(p.x - ray / 2, p.y - 0.4, ray, 0.8);
            pen.fillRect(p.x - 0.4, p.y - ray / 2, 0.8, ray);
        },

        // Behind the stars: the ripples of light, and now and then a shooting star
        behind(pen, kit) {
            const state = kit.state;
            state.ripples = state.ripples.filter(function (ripple) { return ripple.age < 1; });
            for (const ripple of state.ripples) {
                ripple.age += kit.dt / 0.9;                              // a ripple lasts 0.9 seconds
                const fade = Math.max(0, 1 - ripple.age);
                pen.strokeStyle = kit.rgba(this.flash, 0.5 * fade * fade);
                pen.lineWidth = 1.5;
                pen.beginPath();
                pen.arc(ripple.x, ripple.y, 8 + 130 * ripple.age, 0, Math.PI * 2);
                pen.stroke();
                kit.glow(pen, ripple.x, ripple.y, 46, this.flash, 0.35 * fade * fade);
            }

            state.wait -= kit.dt;
            if (state.wait <= 0 && !state.streak) {
                const angle = kit.rand(0.28, 0.6);                       // how steeply it falls (radians)
                const side = Math.random() < 0.5 ? -1 : 1;               // to the left or to the right
                state.streak = {
                    x: kit.rand(0.2, 0.8) * kit.width, y: kit.rand(0.04, 0.38) * kit.height,
                    dx: Math.cos(angle) * side, dy: Math.sin(angle),
                    speed: kit.rand(520, 760), life: kit.rand(0.6, 0.9), age: 0
                };
                state.wait = kit.rand(8, 15);
            }
            const streak = state.streak;
            if (!streak) return;
            streak.age += kit.dt;
            if (streak.age >= streak.life) {
                state.streak = null;
                return;
            }
            const gone = streak.speed * streak.age;                      // px it has flown
            const tail = Math.min(170, gone);
            const headX = streak.x + streak.dx * gone;
            const headY = streak.y + streak.dy * gone;
            const fade = Math.sin(Math.PI * streak.age / streak.life);   // it lights up, then burns out
            const line = pen.createLinearGradient(headX - streak.dx * tail, headY - streak.dy * tail, headX, headY);
            line.addColorStop(0, kit.rgba(this.tints[3], 0));
            line.addColorStop(1, kit.rgba(this.near, 0.85 * fade));
            pen.strokeStyle = line;
            pen.lineWidth = 1.6;
            pen.lineCap = "round";
            pen.beginPath();
            pen.moveTo(headX - streak.dx * tail, headY - streak.dy * tail);
            pen.lineTo(headX, headY);
            pen.stroke();
            kit.glow(pen, headX, headY, 9, this.near, 0.8 * fade);
        },

        pressed(x, y, kit) {
            if (kit.state.ripples.length < 4) kit.state.ripples.push({ x: x, y: y, age: 0 });
        }
    };
    // ===== END LOOK: space =====

    // ---------- 4. THE ENGINE ----------
    // ----- Which scene should be on -----
    // The scene of the look that is on, when it may move: "Extra effects" on and motion allowed
    // (no calm mode, and the device does not ask for less motion). "" for none.
    function wantedId() {
        const id = root.getAttribute("data-palette") || "";
        if (!Object.prototype.hasOwnProperty.call(SCENES, id) || broken[id]) return "";
        return root.classList.contains("fx-fancy") && A.motion.ok() ? id : "";
    }

    // ----- Size and particles -----
    // Fits the canvas to its size on the page. true when the size has changed.
    function measure() {
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;
        let newRatio = A.canvas.pixelRatio(MAX_RATIO);
        if (newWidth * newHeight * newRatio * newRatio > MAX_PIXELS) {
            newRatio = Math.max(1, Math.sqrt(MAX_PIXELS / (newWidth * newHeight)));
        }
        if (newWidth === width && newHeight === height && newRatio === ratio) return false;
        width = newWidth;
        height = newHeight;
        ratio = newRatio;
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        return true;
    }

    // How many particles the scene gets on this screen: its count for a laptop, scaled by
    // the screen's area, never more than the scene asked for or than MAX_PARTICLES
    function targetCount() {
        const wanted = Math.max(0, Math.min(MAX_PARTICLES, Math.round(Number(scene.count) || 0)));
        const least = Math.min(wanted, Math.max(0, Math.round(Number(scene.least) || 0)));
        const scaled = Math.round(wanted * width * height / LAPTOP_AREA);
        return Math.ceil(Math.max(least, Math.min(wanted, scaled)) / Math.pow(2, halvings));
    }

    // Starts the scene's picture from nothing: at the start, and after the screen changed its size
    function populate() {
        particles = [];
        kit.width = width;
        kit.height = height;
        kit.time = 0;
        kit.dt = 0;
        kit.state = {};
        if (scene.start) scene.start(kit);
        const total = targetCount();
        for (let i = 0; i < total; i++) {
            const p = { x: 0, y: 0, vx: 0, vy: 0, near: 0, burst: 0, age: 0 };
            scene.born(p, kit, true);
            particles.push(p);
        }
    }

    // ----- The pointer -----
    function onMove(event) {
        const now = performance.now();
        const dt = Math.max((now - pointer.time) / 1000, 0.008);
        if (pointer.active) {
            // The speed of the pointer, smoothed so that one jumpy event does not throw the particles
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

    function onUp(event) {
        // A finger that lifts leaves no pointer behind; a mouse stays where it is
        if (event.pointerType === "touch") onLeave();
    }

    // A press: the particles around it are thrown outwards and flash, and the scene may add
    // something of its own (a ripple)
    function onDown(event) {
        if (!scene || !frame || fresh) return;
        onMove(event);
        const x = event.clientX;
        const y = event.clientY;
        try {
            const press = scene.press;
            if (press && press.radius > 0) {
                for (const p of particles) {
                    const dx = p.x - x;
                    const dy = p.y - y;
                    const distance = Math.hypot(dx, dy);
                    if (distance > press.radius) continue;
                    const strength = 1 - distance / press.radius;
                    // Straight away from the press (any direction for a particle right under it)
                    const angle = distance < 1 ? Math.random() * Math.PI * 2 : Math.atan2(dy, dx);
                    p.vx += Math.cos(angle) * (press.push || 0) * strength;
                    p.vy += Math.sin(angle) * (press.push || 0) * strength;
                    p.burst = Math.max(p.burst, 0.35 + 0.65 * strength);
                }
            }
            if (scene.pressed) scene.pressed(x, y, kit);
        } catch (error) {
            fail(error);
        }
    }

    // The pointer pushes the particles that are close, and carries them a little along
    function pushFromPointer(p, reach, dt) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= reach.radius) return;
        const strength = 1 - distance / reach.radius;
        const nx = distance < 1 ? 0 : dx / distance;
        const ny = distance < 1 ? 0 : dy / distance;
        const part = strength * strength * dt * 6;
        p.vx += (nx * (reach.push || 0) + pointer.vx * (reach.drag || 0)) * part;
        p.vy += (ny * (reach.push || 0) + pointer.vy * (reach.drag || 0)) * part;
        p.near = Math.max(p.near, strength);
    }

    // The window changed its size, a phone was turned, or the window moved to a sharper
    // screen: measure again once things are quiet, and start the picture again if the canvas
    // really has another size. (A phone's address bar sliding away is no such change: the
    // canvas is as tall as the screen with the bar hidden, see css/looks.css.)
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resizeTimer = 0;
            if (!scene || !frame || fresh) return;
            try {
                if (measure()) populate();
            } catch (error) {
                fail(error);
            }
        }, RESIZE_WAIT);
    }

    // The engine listens to the pointer and to the window's size only while a scene runs.
    // All passive: the animation never holds up a scroll or a click.
    let stopRatioWatch = null;

    function listen(on) {
        if (on === listening) return;
        listening = on;
        const change = on ? window.addEventListener.bind(window) : window.removeEventListener.bind(window);
        const passive = { passive: true };
        change("pointermove", onMove, passive);
        change("pointerdown", onDown, passive);
        change("pointerup", onUp, passive);
        change("pointercancel", onLeave, passive);
        change("blur", onLeave);
        change("resize", onResize, passive);
        change("orientationchange", onResize, passive);
        if (on) {
            root.addEventListener("pointerleave", onLeave, passive);
            stopRatioWatch = A.onPixelRatioChange(onResize);
        } else {
            root.removeEventListener("pointerleave", onLeave, passive);
            if (stopRatioWatch) stopRatioWatch();
            stopRatioWatch = null;
            onLeave();
        }
    }

    // ----- The loop -----
    // The pen as every scene function finds it: CSS pixels, nothing see-through, nothing turned
    function resetPen() {
        g.setTransform(ratio, 0, 0, ratio, 0, 0);
        g.globalAlpha = 1;
        g.globalCompositeOperation = "source-over";
    }

    // A device that cannot keep up gets half the particles (at most twice): better a few
    // stars that move smoothly than many that stutter. gap: ms since the frame before.
    function watchSpeed(now, gap) {
        if (halvings >= MAX_HALVINGS || now < watchFrom || gap <= 0 || gap > PAUSE) return;
        if (gap > SLOW_FRAME) slowTime += gap;
        else slowTime = Math.max(0, slowTime - gap);
        if (slowTime < SLOW_FOR) return;
        slowTime = 0;
        halvings += 1;
        particles.length = Math.ceil(particles.length / 2);
    }

    function draw(now) {
        frame = 0;
        if (!scene) return;
        try {
            if (!last) {
                // The first frame after a start: the canvas is on the page now and can be measured
                if (measure() || fresh) {
                    if (!width || !height) {
                        // Not shown (its rule in css/looks.css is missing, or the stylesheet did
                        // not load): nothing to draw on. The next change tries again.
                        halt();
                        return;
                    }
                    populate();
                }
                fresh = false;
                watchFrom = now + 1000;
            }
            const gap = last ? Math.max(0, now - last) : 0;           // (a clock never runs backwards; if one did, nothing moves)
            const dt = Math.min(gap / 1000, MAX_STEP);
            last = now;
            watchSpeed(now, gap);

            kit.dt = dt;
            kit.time += dt;
            const settle = Math.exp(-(scene.settle || 2) * dt);
            const pointerFade = Math.exp(-POINTER_FADE * dt);
            pointer.vx *= pointerFade;
            pointer.vy *= pointerFade;
            const reach = pointer.active && scene.pointer && scene.pointer.radius > 0 ? scene.pointer : null;

            resetPen();
            g.clearRect(0, 0, width, height);
            if (scene.behind) {
                scene.behind(g, kit);
                resetPen();
            }
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (reach) pushFromPointer(p, reach, dt);
                scene.move(p, dt, kit);
                // The push from the pointer or a press, which fades out
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vx *= settle;
                p.vy *= settle;
                p.near = Math.max(0, p.near - NEAR_FADE * dt);
                p.burst = Math.max(0, p.burst - BURST_FADE * dt);
                p.age += dt;
                scene.draw(p, g, kit);
                resetPen();
            }
            if (scene.front) {
                scene.front(g, kit);
                resetPen();
            }
        } catch (error) {
            fail(error);
            return;
        }
        frame = requestAnimationFrame(draw);
    }

    // ----- When it runs -----
    // Stops the loop and empties the canvas. The particles stay, for a tab that comes back.
    function halt() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
        clearTimeout(resizeTimer);
        resizeTimer = 0;
        listen(false);
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Lets the scene go: its particles, its notes, the pictures of its lights and the memory
    // of the canvas (a canvas as big as the screen is heavy: it shrinks to one pixel)
    function forget() {
        scene = null;
        sceneId = "";
        particles = [];
        fresh = false;
        kit.state = {};
        sprites.clear();
        if (width || height) {
            width = 0;
            height = 0;
            canvas.width = 1;
            canvas.height = 1;
        }
    }

    // A scene threw: it is switched off for the rest of the visit and the error is reported
    // once, the way A.util.attempt reports. The page goes on.
    function fail(error) {
        if (sceneId) broken[sceneId] = true;
        halt();
        forget();
        A.util.attempt(function () { throw error; });
    }

    // Looks at the page and does what it asks for now: run the scene of the look that is on,
    // wait while the tab is hidden, or stop. Called on every change that matters.
    function refresh() {
        const id = wantedId();
        if (!id) {
            if (sceneId || frame) {
                halt();
                forget();
            }
            return;
        }
        if (id !== sceneId) {
            halt();
            forget();
            scene = SCENES[id];
            sceneId = id;
            fresh = true;
        }
        if (document.hidden) {
            // The tab is in the background: nothing is drawn. The particles wait for it.
            if (frame || listening) halt();
            return;
        }
        if (!frame) {
            last = 0;
            listen(true);
            frame = requestAnimationFrame(draw);
        }
    }

    // ---------- 5. START, AND THE PUBLIC API ----------
    document.addEventListener("aic:palette", refresh);                // another look
    document.addEventListener("aic:theme", refresh);                  // the theme under the look
    document.addEventListener("aic:motion", refresh);                 // calm mode, or the device asks for less motion
    document.addEventListener("aic:settings", refresh);               // "Extra effects" switched on or off
    document.addEventListener("visibilitychange", refresh);           // the tab went to the background, or came back
    // The classes and the palette of <html> say the same things (the script in the <head> of
    // index.html and js/settings.js set them): watching them misses no change
    new MutationObserver(refresh).observe(root, { attributes: true, attributeFilter: ["class", "data-palette", "data-theme"] });
    // The device's own "less motion" setting, asked directly as well. While an animation of
    // the site asks "may I move?" in every frame, Chromium never tells js/core.js that the
    // setting changed (a read at the wrong moment swallows the browser's "change" event), so
    // "aic:motion" and the class can stay away. This list belongs to the engine alone and
    // nobody reads it, so its event always comes; refresh() then asks A.motion.ok() as always.
    A.onMedia(window.matchMedia(A.queries.reducedMotion), refresh, { immediate: false });

    refresh();

    // For other files, the tests and the browser's console:
    //     AICompass.lookEffects.running     true while an animation runs
    //     AICompass.lookEffects.scene       the id of the look whose scene is on ("" for none)
    //     AICompass.lookEffects.particles   how many particles it draws now
    //     AICompass.lookEffects.max         never more than this (60)
    A.feature("lookEffects", {
        get running() { return frame !== 0; },
        get scene() { return sceneId; },
        get particles() { return particles.length; },
        max: MAX_PARTICLES
    });
})();
