/* =========================================================
   AI COMPASS — NEURAL NETWORK BACKGROUND
   Draws a living "brain" behind the page on <canvas id="neural-bg">:
   - glowing nodes (neurons) drift slowly; near ones look bigger
   - nodes that are close are joined by thin lines (synapses)
   - now and then a bright signal runs along a line, and the
     neuron it reaches may fire the next one (a chain reaction)
   - nodes near your mouse or finger are pulled in and light up
   - a click or tap sends a ripple and makes nearby neurons fire
   It stays dim on purpose, so text on top is always easy to read.
   ========================================================= */

(function () {
"use strict";

const AIC = window.AICompass;
const canvas = document.getElementById("neural-bg");
if (!AIC || !canvas || !canvas.getContext) return;

const ctx = canvas.getContext("2d");
if (!ctx) return;

// Every text (English and Russian) is in js/content/neural-bg.js

// ---------- Settings you can play with ----------
const MIN_NODES = 40;            // on phones
const MAX_NODES = 110;           // on big screens
const AREA_PER_NODE = 12500;     // one node for every 12 500 square pixels
const MIN_SPEED = 5;             // drifting speed, pixels per second
const MAX_SPEED = 15;
const MOUSE_RADIUS = 200;        // how far the cursor "reaches"
const MOUSE_PULL = 95;           // how strongly nodes are pulled to the cursor
const PARALLAX = 0.12;           // how much near nodes move when you scroll
const MAX_PULSES = 28;           // signals travelling at the same time
const MAX_PIXELS = 3500000;      // canvas size limit for huge screens (keeps it smooth)
const ALPHA_LEVELS = 16;         // lines are grouped by brightness to draw faster
const ALPHA_STEP = 0.035;
const COLOR_LEVELS = 3;          // purple, a mix, cyan
const SECRET_CODE = "ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight KeyB KeyA";

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

// ---------- State ----------
let width = 0;
let height = 0;
let dpr = 1;
let linkDistance = 140;
let quality = 1;                 // goes down a little on slow devices
const nodes = [];
let pulses = [];
let rings = [];
let look = null;                 // colours for the current theme
const buckets = [];              // line segments grouped by colour + brightness

let running = false;
let rafId = 0;
let lastTime = 0;
let spawnTimer = 0.8;
let stormTime = 0;
let intensity = 1;
let lastScrollY = window.scrollY;
let slowFrames = 0;
let frameCount = 0;
let secretKeys = [];

const mouse = { x: 0, y: 0, active: false, power: 0, releaseTimer: 0 };

// ---------- Small helpers ----------
function random(min, max) {
    return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mix(a, b, amount) {
    return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * amount));
}

function rgba(colour, alpha) {
    return "rgba(" + colour[0] + "," + colour[1] + "," + colour[2] + "," + alpha + ")";
}

function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// Reads "155, 109, 255" from a CSS variable and turns it into [155, 109, 255]
function readColour(name, fallback) {
    const parts = AIC.cssVar(name).split(",").map((part) => parseFloat(part));
    return parts.length === 3 && parts.every((n) => isFinite(n)) ? parts : fallback;
}

function calmMode() {
    return AIC.motion.calm;
}

function motionAllowed() {
    return !reducedMotionQuery.matches && !calmMode();
}

// ---------- Colours and glow images for the current theme ----------
// A "sprite" is a tiny pre-drawn glowing dot. Copying it is much
// faster than drawing a new glow for every node in every frame.
function makeSprite(colour, light, hot) {
    const size = 64;
    const sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    const g = sprite.getContext("2d");
    const glow = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    const core = light ? colour : mix(colour, [255, 255, 255], hot ? 0.75 : 0.55);

    glow.addColorStop(0, rgba(core, 1));
    glow.addColorStop(0.08, rgba(colour, 1));
    glow.addColorStop(0.16, rgba(colour, light ? 0.5 : 0.55));
    glow.addColorStop(0.34, rgba(colour, light ? 0.07 : 0.14));
    glow.addColorStop(1, rgba(colour, 0));
    g.fillStyle = glow;
    g.fillRect(0, 0, size, size);
    return sprite;
}

function buildLook() {
    const light = AIC.theme === "light";
    const purple = readColour("--accent-rgb", [155, 109, 255]);
    const cyan = readColour("--accent-2-rgb", [80, 227, 255]);
    const colours = [purple, mix(purple, cyan, 0.5), cyan];

    look = {
        light: light,
        strength: light ? 0.72 : 1,          // everything is softer on a light page
        sprites: colours.map((colour) => makeSprite(colour, light, false)),
        pulseSprite: makeSprite(cyan, light, true),
        lineStyles: [],
        cursorStyle: rgba(cyan, 1),
        pulseColour: light ? cyan : mix(cyan, [255, 255, 255], 0.35),
        ringStyle: rgba(cyan, 1)
    };

    colours.forEach((colour) => {
        for (let level = 0; level < ALPHA_LEVELS; level++) {
            look.lineStyles.push(rgba(colour, ((level + 0.5) * ALPHA_STEP).toFixed(3)));
        }
    });
}

// ---------- Nodes ----------
function makeNode(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const depth = random(0.35, 1);                       // 1 = close to you, 0.35 = far away
    const speed = random(MIN_SPEED, MAX_SPEED) * (0.5 + 0.5 * depth);

    return {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        ex: 0,                                           // extra speed from the cursor or a click
        ey: 0,
        z: depth,
        size: random(1, 1.9),
        hue: clamp(x / Math.max(1, width) + random(-0.3, 0.3), 0, 1),   // purple on the left, cyan on the right
        phase: random(0, Math.PI * 2),
        twinkle: random(0.5, 1.3),
        fire: 0,                                         // 1 right after the neuron fires
        near: 0,                                         // 1 right under the cursor
        fade: 1                                          // 0 when it is outside the screen
    };
}

function baseCount() {
    return clamp(Math.round(width * height / AREA_PER_NODE), MIN_NODES, MAX_NODES);
}

function syncNodeCount() {
    const target = Math.max(24, Math.round(baseCount() * quality));

    while (nodes.length < target) {
        nodes.push(makeNode(random(0, width), random(0, height)));
    }

    if (nodes.length > target) {
        const removed = nodes.splice(target);
        pulses = pulses.filter((pulse) => removed.indexOf(pulse.from) === -1 && removed.indexOf(pulse.to) === -1);
    }
}

// Every node closer than linkDistance, except one we came from
function neighbours(node, except) {
    const list = [];
    const max = linkDistance * linkDistance;

    nodes.forEach((other) => {
        if (other === node || other === except || other.fade < 0.5) return;
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        if (dx * dx + dy * dy < max) list.push(other);
    });
    return list;
}

// ---------- Canvas size ----------
function resize() {
    const rect = canvas.getBoundingClientRect();
    const newWidth = Math.max(1, Math.round(rect.width || window.innerWidth));
    const newHeight = Math.max(1, Math.round(rect.height || window.innerHeight));
    let ratio = Math.min(window.devicePixelRatio || 1, 2);

    if (newWidth * newHeight * ratio * ratio > MAX_PIXELS) {
        ratio = Math.max(1, Math.sqrt(MAX_PIXELS / (newWidth * newHeight)));
    }

    if (newWidth === width && newHeight === height && ratio === dpr) return;

    // Stretch the existing network to the new size, so it stays even
    if (width && height) {
        nodes.forEach((node) => {
            node.x *= newWidth / width;
            node.y *= newHeight / height;
        });
    }

    width = newWidth;
    height = newHeight;
    dpr = ratio;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    // Lines get longer when nodes are further apart
    linkDistance = clamp(Math.sqrt(width * height / baseCount()) * 1.45, 100, 170);
    syncNodeCount();

    if (!running) drawStill();
}

let resizeQueued = false;
window.addEventListener("resize", () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
        resizeQueued = false;
        resize();
    });
});

// ---------- Signals (neurons firing) ----------
function spawnPulse(from, to, depth) {
    const limit = stormTime > 0 ? MAX_PULSES * 2.5 : MAX_PULSES;
    if (pulses.length >= limit) return;

    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    pulses.push({
        from: from,
        to: to,
        depth: depth,
        t: 0,
        duration: clamp(distance / random(150, 240), 0.25, 1.2)
    });
}

function spawnRandomPulse() {
    for (let tries = 0; tries < 8; tries++) {
        const node = pick(nodes);
        if (!node || node.fade < 0.95) continue;
        if (node.x < 0 || node.x > width || node.y < 0 || node.y > height) continue;

        const list = neighbours(node, null);
        if (list.length) {
            node.fire = Math.max(node.fire, 0.6);
            spawnPulse(node, pick(list), 0);
            return;
        }
    }
}

// When a signal arrives, the next neuron may pass it on
function chainReaction(pulse) {
    const chances = [0.75, 0.55, 0.35, 0.2];
    const chance = stormTime > 0 ? 0.92 : (chances[pulse.depth] || 0);
    if (Math.random() > chance) return;

    const list = neighbours(pulse.to, pulse.from);
    const count = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < count && list.length; i++) {
        const next = list.splice(Math.floor(Math.random() * list.length), 1)[0];
        spawnPulse(pulse.to, next, pulse.depth + 1);
    }
}

function updatePulses(dt) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnRandomPulse();
        spawnTimer = stormTime > 0 ? random(0.03, 0.09) : random(0.5, 1.3);
    }

    const maxStretch = linkDistance * linkDistance * 1.8;

    for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.t += dt / pulse.duration;

        // The two neurons drifted too far apart: the connection is broken
        const dx = pulse.to.x - pulse.from.x;
        const dy = pulse.to.y - pulse.from.y;
        if (dx * dx + dy * dy > maxStretch) {
            pulses.splice(i, 1);
            continue;
        }

        if (pulse.t >= 1) {
            pulses.splice(i, 1);
            pulse.to.fire = 1;
            chainReaction(pulse);
        }
    }

    for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].t += dt / rings[i].duration;
        if (rings[i].t >= 1) rings.splice(i, 1);
    }
}

// ---------- Moving everything forward by one frame ----------
function update(dt) {
    // The cursor's pull fades in and out smoothly
    mouse.power += ((mouse.active ? 1 : 0) - mouse.power) * Math.min(1, dt * 5);

    // Full brightness on the hero, a bit calmer while you read the sections
    const reading = clamp(window.scrollY / (height * 0.9), 0, 1);
    const targetIntensity = 1 - reading * 0.35 + (stormTime > 0 ? 0.45 : 0);
    intensity += (targetIntensity - intensity) * Math.min(1, dt * 3);

    // Scrolling moves near nodes more than far ones (depth / parallax)
    const scrollY = window.scrollY;
    const shift = clamp(scrollY - lastScrollY, -90, 90);
    lastScrollY = scrollY;

    const damping = Math.exp(-dt * 2.4);
    const margin = linkDistance;
    const reach = MOUSE_RADIUS * MOUSE_RADIUS;
    const boost = stormTime > 0 ? 2.2 : 1;

    nodes.forEach((node) => {
        // Pulled towards the cursor, but pushed back when too close (so they form a ring)
        node.near = 0;
        if (mouse.power > 0.01) {
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < reach && d2 > 1) {
                const distance = Math.sqrt(d2);
                const closeness = 1 - distance / MOUSE_RADIUS;
                const direction = distance > MOUSE_RADIUS * 0.22 ? 1 : -1.8;
                const force = MOUSE_PULL * closeness * mouse.power * direction * dt;
                node.near = closeness * mouse.power;
                node.ex += dx / distance * force;
                node.ey += dy / distance * force;
            }
        }

        node.ex *= damping;
        node.ey *= damping;
        node.x += (node.vx * boost + node.ex) * dt;
        node.y += (node.vy * boost + node.ey) * dt - shift * PARALLAX * node.z;

        // Leaving one side of the screen = coming back on the other side
        if (node.x < -margin) node.x += width + margin * 2;
        else if (node.x > width + margin) node.x -= width + margin * 2;
        if (node.y < -margin) node.y += height + margin * 2;
        else if (node.y > height + margin) node.y -= height + margin * 2;

        // Fade out outside the screen, so nothing "pops" when it wraps around
        const outside = Math.max(0, -node.x, node.x - width, -node.y, node.y - height);
        node.fade = 1 - outside / margin;
        node.fire = Math.max(0, node.fire - dt * 1.4);
    });

    stormTime = Math.max(0, stormTime - dt);
    updatePulses(dt);
}

// ---------- Drawing ----------
function drawLinks(strength) {
    const total = COLOR_LEVELS * ALPHA_LEVELS;
    for (let k = 0; k < total; k++) {
        if (buckets[k]) buckets[k].length = 0;
        else buckets[k] = [];
    }

    const max = linkDistance;
    const max2 = max * max;
    const count = nodes.length;

    // Find every pair of close nodes and sort the line into a bucket
    for (let i = 0; i < count; i++) {
        const a = nodes[i];
        if (a.fade <= 0) continue;

        for (let j = i + 1; j < count; j++) {
            const b = nodes[j];
            if (b.fade <= 0) continue;
            const dx = b.x - a.x;
            if (dx > max || dx < -max) continue;
            const dy = b.y - a.y;
            if (dy > max || dy < -max) continue;
            const d2 = dx * dx + dy * dy;
            if (d2 > max2) continue;

            const closeness = 1 - Math.sqrt(d2) / max;
            let alpha = Math.pow(closeness, 1.5) * 0.26 * (0.55 + 0.45 * (a.z + b.z) / 2);
            alpha += (a.near + b.near) * 0.5 * closeness * 0.45;
            alpha += Math.max(a.fire, b.fire) * closeness * 0.5;
            alpha *= a.fade * b.fade * strength;
            if (alpha < 0.008) continue;

            const level = Math.min(ALPHA_LEVELS - 1, Math.floor(alpha / ALPHA_STEP));
            const colour = Math.round((a.hue + b.hue) * (COLOR_LEVELS - 1) / 2);
            buckets[colour * ALPHA_LEVELS + level].push(a.x, a.y, b.x, b.y);
        }
    }

    // One stroke() per bucket instead of one per line = much faster
    ctx.lineWidth = 1;
    for (let k = 0; k < total; k++) {
        const list = buckets[k];
        if (!list.length) continue;
        ctx.strokeStyle = look.lineStyles[k];
        ctx.beginPath();
        for (let p = 0; p < list.length; p += 4) {
            ctx.moveTo(list[p], list[p + 1]);
            ctx.lineTo(list[p + 2], list[p + 3]);
        }
        ctx.stroke();
    }
}

function drawCursorLinks(strength) {
    if (mouse.power < 0.02) return;
    ctx.lineWidth = 1;
    ctx.strokeStyle = look.cursorStyle;

    nodes.forEach((node) => {
        if (node.near < 0.02) return;
        ctx.globalAlpha = node.near * 0.42 * strength * node.fade;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
    });
    ctx.globalAlpha = 1;
}

function drawPulses(strength) {
    const colour = look.pulseColour;
    ctx.lineCap = "round";

    pulses.forEach((pulse) => {
        const from = pulse.from;
        const to = pulse.to;
        const t = pulse.t * pulse.t * (3 - 2 * pulse.t);        // smooth start and stop
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;

        // The synapse the signal travels along lights up
        ctx.globalAlpha = 0.3 * strength * Math.sin(Math.PI * Math.min(1, pulse.t));
        ctx.strokeStyle = look.cursorStyle;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // A short bright tail behind the signal
        const tail = Math.max(0, t - 0.25);
        const tx = from.x + (to.x - from.x) * tail;
        const ty = from.y + (to.y - from.y) * tail;
        const trail = ctx.createLinearGradient(tx, ty, x, y);
        trail.addColorStop(0, rgba(colour, 0));
        trail.addColorStop(1, rgba(colour, 0.9));
        ctx.globalAlpha = Math.min(1, strength);
        ctx.strokeStyle = trail;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();

        // The glowing head
        const size = 26;
        ctx.drawImage(look.pulseSprite, x - size / 2, y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;
}

function drawNodes(time, strength) {
    nodes.forEach((node) => {
        if (node.fade <= 0.01) return;
        const twinkle = 0.78 + 0.22 * Math.sin(time * node.twinkle + node.phase);
        let alpha = (0.32 + 0.5 * node.z) * twinkle * strength + node.near * 0.6 + node.fire * 0.9;
        alpha = Math.min(1, alpha) * node.fade;

        const radius = node.size * (0.55 + 0.55 * node.z) + node.fire * 1.5 + node.near * 1.2;
        const size = radius * 17;
        ctx.globalAlpha = alpha;
        ctx.drawImage(look.sprites[Math.round(node.hue * (COLOR_LEVELS - 1))], node.x - size / 2, node.y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;
}

function drawRings(strength) {
    ctx.strokeStyle = look.ringStyle;
    ctx.lineWidth = 1.5;

    rings.forEach((ring) => {
        if (ring.t < 0) return;                                  // still waiting to start
        const fade = 1 - ring.t;
        ctx.globalAlpha = fade * fade * 0.5 * strength;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, 10 + ring.t * ring.size, 0, Math.PI * 2);
        ctx.stroke();
    });
    ctx.globalAlpha = 1;
}

function draw(time) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (!look) return;

    const strength = look.strength * intensity;
    drawLinks(strength);
    drawCursorLinks(strength);

    // In the dark theme glows are added together like real light
    ctx.globalCompositeOperation = look.light ? "source-over" : "lighter";
    drawPulses(strength);
    drawNodes(time, strength);
    drawRings(strength);
    ctx.globalCompositeOperation = "source-over";
}

// One calm picture, used when animations are off
function drawStill() {
    if (!look) buildLook();
    pulses = [];
    rings = [];
    mouse.power = 0;
    intensity = 0.85;
    nodes.forEach((node) => {
        node.near = 0;
        node.fire = 0;
    });
    draw(0);
}

// ---------- Animation loop ----------
// If the device can't keep up, use fewer nodes
function watchSpeed(rawDt) {
    frameCount++;
    if (frameCount < 90) return;
    if (rawDt > 1 / 35) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);

    if (slowFrames > 90 && quality > 0.5) {
        quality = Math.max(0.5, quality * 0.8);
        slowFrames = 0;
        syncNodeCount();
    }
}

function frame(now) {
    rafId = 0;
    if (!running) return;

    const rawDt = (now - lastTime) / 1000;
    const dt = clamp(rawDt, 0.001, 0.05);
    lastTime = now;

    update(dt);
    draw(now / 1000);
    watchSpeed(rawDt);
    rafId = requestAnimationFrame(frame);
}

function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    lastScrollY = window.scrollY;
    frameCount = 0;
    slowFrames = 0;
    rafId = requestAnimationFrame(frame);
}

function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
}

// Decide: animate, or show one still picture (tab hidden, reduced motion, calm mode)
function refresh() {
    if (motionAllowed() && !document.hidden) {
        start();
    } else {
        stop();
        if (!document.hidden) drawStill();
    }
}

// ---------- Mouse and touch ----------
function holdTouch() {
    clearTimeout(mouse.releaseTimer);
    mouse.releaseTimer = setTimeout(() => {
        mouse.active = false;
    }, 900);
}

function trackPointer(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
    if (event.pointerType === "touch") holdTouch();
}

window.addEventListener("pointermove", trackPointer, { passive: true });
window.addEventListener("pointerdown", trackPointer, { passive: true });
window.addEventListener("pointerup", (event) => {
    if (event.pointerType === "touch") holdTouch();
}, { passive: true });
window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) mouse.active = false;                  // left the window
});
window.addEventListener("blur", () => {
    mouse.active = false;
});

// A click or tap sends a ripple and makes the nearest neurons fire
function burst(x, y) {
    if (!running || !nodes.length) return false;

    rings.push({ x: x, y: y, t: 0, duration: 0.9, size: 150 });
    rings.push({ x: x, y: y, t: -0.2, duration: 1.1, size: 230 });

    // A small shock wave pushes nodes away from the click
    nodes.forEach((node) => {
        const dx = node.x - x;
        const dy = node.y - y;
        const distance = Math.hypot(dx, dy);
        if (distance > 1 && distance < 170) {
            const push = (1 - distance / 170) * 70;
            node.ex += dx / distance * push;
            node.ey += dy / distance * push;
        }
    });

    nodes
        .filter((node) => node.fade > 0.5)
        .map((node) => ({ node: node, d2: (node.x - x) * (node.x - x) + (node.y - y) * (node.y - y) }))
        .sort((a, b) => a.d2 - b.d2)
        .slice(0, 3)
        .forEach((item) => {
            if (item.d2 > 300 * 300) return;
            item.node.fire = 1;
            neighbours(item.node, null).slice(0, 3).forEach((next) => spawnPulse(item.node, next, 0));
        });
    return true;
}

document.addEventListener("click", (event) => {
    if (event.detail === 0) return;                                  // keyboard "clicks" have no position
    burst(event.clientX, event.clientY);
}, { passive: true });

// ---------- Neural storm (command palette + a secret code) ----------
function storm() {
    if (!running || !nodes.length) return false;
    stormTime = 3.5;
    for (let i = 0; i < 14; i++) {
        const node = pick(nodes);
        node.fire = 1;
        neighbours(node, null).slice(0, 2).forEach((next) => spawnPulse(node, next, 0));
    }
    rings.push({ x: width / 2, y: height / 2, t: 0, duration: 1.4, size: Math.max(width, height) * 0.6 });
    return true;
}

function runStorm(successKey) {
    if (storm()) AIC.toast(AIC.t(successKey), "⚡");
    else AIC.toast(AIC.t("neural.stormOff"), "💤");
}

AIC.registerCommand({
    id: "neural-storm",
    group: "cmd.groupActions",
    icon: "⚡",
    title: function () { return AIC.t("neural.cmdStorm"); },
    keywords: "neural network storm neurons fire brain background нейронная сеть шторм нейроны мозг фон",
    keepOverlays: true,
    run: function () { runStorm("neural.stormToast"); }
});

// The famous "Konami code": ↑ ↑ ↓ ↓ ← → ← → B A
document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;

    secretKeys.push(event.code);
    if (secretKeys.length > 10) secretKeys.shift();
    if (secretKeys.join(" ") === SECRET_CODE) {
        secretKeys = [];
        runStorm("neural.secret");
    }
});

// ---------- Reacting to the rest of the site ----------
AIC.onThemeChange(() => {
    buildLook();
    if (!running) drawStill();
});

document.addEventListener("visibilitychange", refresh);
document.addEventListener("aic:effects", refresh);                   // calm mode from js/effects.js

if (reducedMotionQuery.addEventListener) reducedMotionQuery.addEventListener("change", refresh);
else if (reducedMotionQuery.addListener) reducedMotionQuery.addListener(refresh);

// Other features can make the network react, e.g. after a correct answer:
// if (AICompass.neural) AICompass.neural.burst(x, y);
AIC.neural = {
    burst: function (x, y) { return burst(x, y); },
    storm: storm,
    get running() { return running; }
};

// ---------- Start ----------
buildLook();
resize();
refresh();

})();
