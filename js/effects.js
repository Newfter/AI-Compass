/* =========================================================
   AI COMPASS — VISUAL EFFECTS
   Small touches that make the page feel alive:
    1. scroll progress bar at the top
    2. reveal on scroll                [data-reveal]
    3. numbers that count up           [data-count]
    4. "decoding" text                 [data-scramble] and .section-label
    5. typewriter words                [data-rotator]
    6. 3D tilt with a glare            [data-tilt]  (+ a glowing border on .card)
    7. soft spotlight under the cursor
    8. magnetic main buttons           .btn-primary
    9. ripple when you press a button
   10. section mini-map on the right (big screens)
   11. calm mode: a command that pauses all animations
   Everything respects the "reduce motion" setting of the device.
   ========================================================= */

(function () {
    "use strict";

    const AIC = window.AICompass;
    if (!AIC) return;

    const root = document.documentElement;
    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const hasObserver = "IntersectionObserver" in window;

    // Every text (English and Russian) is in js/content/effects.js

    // ---------- Small helpers ----------
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function isOnScreen(element) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
    }

    // Sorts elements in the order they appear on the page
    function pageOrder(a, b) {
        if (a === b) return 0;
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    }

    function onMediaChange(query, callback) {
        if (query.addEventListener) query.addEventListener("change", callback);
        else if (query.addListener) query.addListener(callback);
    }

    // ---------- Motion settings ----------
    // AIC.motion (core) knows both: "calm mode" (our own switch, saved in the browser)
    // and "reduced motion" (the device settings).
    function motionOK() {
        return AIC.motion.ok();
    }

    // Tilt, magnet and spotlight only make sense with a real mouse
    function fineOK() {
        return motionOK() && finePointerQuery.matches;
    }

    function updateModeClasses() {
        root.classList.toggle("fx-fine", fineOK());
        root.classList.toggle("reveal-ready", motionOK() && hasObserver);
    }

    // Lists of everything the effects are working on
    const revealPending = new Set();
    const revealTimes = new WeakMap();                                    // when each card starts to appear
    const itemDelays = new WeakMap();
    const counters = new Map();
    const scrambleTargets = new Set();
    const scramblePending = new Set();
    const scrambleRuns = new Map();
    const rotators = new Map();

    // Four "zones" watch the page:
    // - screenObserver: remembers what has already been on screen.
    //   Something you have seen is never hidden again (no blinking).
    // - armObserver: a bit bigger than the screen. Things entering it get ready
    //   (hidden, or set to 0) just before you can see them.
    // - viewObserver: the screen minus a bottom strip. Things entering it animate in.
    // - counterObserver: the whole screen. A number starts counting as soon as
    //   any part of it can be seen, so you never look at a "0" that waits.
    // Content far away from the screen is never hidden, so the page always works.
    // (They are created in this order, so they also run in this order.)
    const NEAR_ZONE = 0.1;                                                 // 10% of the screen height
    const seenOnScreen = new WeakSet();
    const screenObserver = hasObserver ? new IntersectionObserver(onScreenSeen, { threshold: 0 }) : null;
    const armObserver = hasObserver ? new IntersectionObserver(onNear, { rootMargin: "10% 0px 10% 0px", threshold: 0 }) : null;
    const viewObserver = hasObserver ? new IntersectionObserver(onEnterView, { rootMargin: "0px 0px -8% 0px", threshold: 0 }) : null;
    const counterObserver = hasObserver ? new IntersectionObserver(onCounterView, { threshold: 0 }) : null;
    const scrambleObserver = hasObserver ? new IntersectionObserver(onScrambleView, { threshold: 0.2 }) : null;
    const rotatorObserver = hasObserver ? new IntersectionObserver(onRotatorView) : null;

    /* =========================================================
       1. SCROLL PROGRESS BAR (+ section mini-map)
       ========================================================= */
    const progressWrap = document.querySelector(".scroll-progress");
    const progressBar = progressWrap ? progressWrap.querySelector("span") : null;
    let progressQueued = false;
    let lastWidth = "";

    function updateProgress() {
        progressQueued = false;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;

        if (progressBar) {
            const width = (progress * 100).toFixed(2) + "%";
            if (width !== lastWidth) {
                lastWidth = width;
                progressBar.style.width = width;
            }
            progressWrap.classList.toggle("is-active", progress > 0.002);
        }

        updateRail(progress, max - window.scrollY < 4);

        // At the very bottom, show anything that is on screen but too small to trigger
        if (max - window.scrollY < 6) {
            revealPending.forEach((element) => {
                if (isOnScreen(element)) reveal(element, nextStagger());
            });
            counters.forEach((counter, element) => {
                if (counter.waiting) startIfVisible(element, counter, false);
            });
        }
    }

    function queueProgress() {
        if (progressQueued) return;
        progressQueued = true;
        requestAnimationFrame(updateProgress);
    }

    window.addEventListener("scroll", queueProgress, { passive: true });
    window.addEventListener("resize", queueProgress);
    if ("ResizeObserver" in window) {
        new ResizeObserver(queueProgress).observe(document.body);            // the page got taller or shorter
    }

    /* =========================================================
       2. REVEAL ON SCROLL  [data-reveal]
       data-reveal=""        slide up (default)
       data-reveal="left"    slide in from the left ("right", "zoom", "fade" also work)
       data-reveal="stagger" children appear one by one (lists do this by default)
       ========================================================= */
    let staggerIndex = 0;
    let lastRevealAt = 0;

    // Returns true when the element is new and waits to be revealed
    function registerReveal(element) {
        if (element.classList.contains("revealed") || revealPending.has(element)) return false;
        if (!viewObserver || !motionOK()) {
            element.classList.add("revealed");
            return false;
        }
        revealPending.add(element);
        screenObserver.observe(element);
        armObserver.observe(element);
        viewObserver.observe(element);
        return true;
    }

    // Is the element inside a fixed layer (a chat panel, a toast, a modal)?
    // Such a layer never scrolls, so its content can't "scroll into view".
    function inFixedLayer(element) {
        let node = element;
        while (node.offsetParent) node = node.offsetParent;               // climb to the outermost positioned box
        return node !== document.body && getComputedStyle(node).position === "fixed";
    }

    // Backup timers for hidden elements that sit on screen but don't animate in
    const fallbackTimers = new Map();

    function clearFallback(element) {
        if (!fallbackTimers.has(element)) return;
        clearTimeout(fallbackTimers.get(element));
        fallbackTimers.delete(element);
    }

    // Something can be seen (even one pixel of it)
    function onScreenSeen(entries) {
        entries.forEach((entry) => {
            const element = entry.target;
            if (!revealPending.has(element)) {
                screenObserver.unobserve(element);
                return;
            }
            if (!entry.isIntersecting) {
                clearFallback(element);
                return;
            }
            seenOnScreen.add(element);

            // Visible but not hidden (e.g. the page moved under it): leave it as it is
            if (!element.classList.contains("fx-armed")) {
                showNow(element);
                return;
            }

            // Hidden, but already peeking onto the screen:
            // - in a fixed panel it will never scroll further in, so it appears now
            // - anywhere else it appears by itself if you stop scrolling for a moment
            if (inFixedLayer(element)) {
                reveal(element, nextStagger());
            } else if (!fallbackTimers.has(element)) {
                fallbackTimers.set(element, setTimeout(() => {
                    fallbackTimers.delete(element);
                    if (revealPending.has(element) && isOnScreen(element)) reveal(element, 0);
                }, 1400));
            }
        });
    }

    // Is the element on the screen or just next to it?
    function isNear(element) {
        const zone = window.innerHeight * NEAR_ZONE;
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight + zone && rect.bottom > -zone;
    }

    // New elements that are already close to the screen are hidden at once
    // (before the browser paints them), so they don't flash before animating in.
    // All sizes are read first and classes added after, which is faster.
    // While the page starts, every feature adds its content one after another:
    // measuring after each one would make the browser lay out the whole page
    // many times, so they wait in a list and are all measured once, just before
    // the first frame is painted.
    let armQueue = [];

    function armIfNear(elements) {
        if (armQueue) {
            elements.forEach((element) => armQueue.push(element));
            return;
        }
        const near = elements.filter(isNear);
        near.forEach((element) => element.classList.add("fx-armed"));
    }

    requestAnimationFrame(() => {
        const waiting = armQueue;
        armQueue = null;
        armIfNear(waiting.filter((element) => element.isConnected && revealPending.has(element) && !element.classList.contains("revealed")));
    });

    // Something came close to the screen (or went far away again)
    function onNear(entries) {
        entries.forEach((entry) => {
            const element = entry.target;
            let stillNeeded = false;

            if (revealPending.has(element)) {
                stillNeeded = true;
                if (!entry.isIntersecting) {
                    element.classList.remove("fx-armed");
                } else if (!element.classList.contains("fx-armed")) {
                    // Measure now: during very fast scrolling the entry can be a frame old
                    if (seenOnScreen.has(element) || isOnScreen(element)) {
                        // Already visible (e.g. the page opened at #quiz): hiding it now
                        // would make it blink, so just keep it as it is
                        stillNeeded = showNow(element);
                    } else {
                        element.classList.add("fx-armed");
                    }
                }
            }

            // Counters drop to 0 when close, and show the real number when far away
            const counter = counters.get(element);
            if (counter && counter.waiting) {
                stillNeeded = true;
                if (!entry.isIntersecting) {
                    counter.armed = false;
                    counter.shown = counter.target;
                    writeCounter(element, counter, counter.shown);
                } else if (!counter.armed) {
                    if (isOnScreen(element) && !hiddenByCard(element)) {
                        // Already visible with its real number: don't jump back to 0
                        stopWaiting(element, counter);
                        stillNeeded = revealPending.has(element);
                    } else {
                        counter.armed = true;
                        counter.shown = 0;
                        writeCounter(element, counter, 0);
                    }
                }
            }

            if (!stillNeeded) armObserver.unobserve(element);
        });
    }

    // Elements that appear at the same moment come in one after another
    function nextStagger() {
        const now = performance.now();
        if (now - lastRevealAt > 160) staggerIndex = 0;
        lastRevealAt = now;
        return Math.min(staggerIndex++, 6) * 90;
    }

    function isStaggerList(element) {
        const mode = element.getAttribute("data-reveal");
        const isList = element.tagName === "UL" || element.tagName === "OL";
        return (mode === "stagger" || (isList && !mode)) && element.children.length > 1 && element.children.length <= 30;
    }

    function reveal(element, delay) {
        // Only hidden ("armed") elements animate in. Anything the visitor can
        // already see just stays as it is, so nothing ever blinks.
        if (element.classList.contains("revealed") || !element.classList.contains("fx-armed") || !motionOK()) {
            showNow(element);
            return;
        }

        revealPending.delete(element);
        element.classList.remove("fx-armed");
        clearFallback(element);
        if (screenObserver) screenObserver.unobserve(element);
        if (viewObserver) viewObserver.unobserve(element);
        const counter = counters.get(element);
        if (armObserver && !(counter && counter.waiting)) armObserver.unobserve(element);

        const items = isStaggerList(element) ? Array.prototype.slice.call(element.children) : null;
        element.style.setProperty("--fx-delay", delay + "ms");
        revealTimes.set(element, performance.now() + delay);

        if (items) {
            const step = Math.min(85, 720 / items.length);
            element.classList.add("fx-reveal-list");
            items.forEach((item, index) => {
                const itemDelay = Math.round(index * step);
                item.style.setProperty("--fx-item-delay", itemDelay + "ms");
                itemDelays.set(item, itemDelay);
            });
        }

        element.classList.add("revealed", "fx-reveal-run");

        // Labels inside decode and numbers inside count as they appear
        scrambleWithin(element, delay + 140);
        startCountersWithin(element, true);

        // Clean up when the animation is over, so the element's own styles take over again
        const total = delay + 1000 + (items ? 720 : 0);
        setTimeout(() => {
            element.classList.remove("fx-reveal-run", "fx-reveal-list");
            element.style.removeProperty("--fx-delay");
            if (items) items.forEach((item) => item.style.removeProperty("--fx-item-delay"));
        }, total);
    }

    // Mark as revealed without any animation.
    // Returns true when the element is also a counter that still waits to count.
    function showNow(element) {
        revealPending.delete(element);
        element.classList.remove("fx-armed");
        element.classList.add("revealed");
        clearFallback(element);
        scrambleWithin(element, 0);
        startCountersWithin(element, false);

        if (screenObserver) screenObserver.unobserve(element);
        if (viewObserver) viewObserver.unobserve(element);
        const counter = counters.get(element);
        const counting = Boolean(counter && counter.waiting);
        if (!counting && armObserver) armObserver.unobserve(element);
        return counting;
    }

    function revealAll() {
        revealPending.forEach((element) => {
            element.classList.add("revealed");
            element.classList.remove("fx-armed");
            clearFallback(element);
            if (viewObserver) viewObserver.unobserve(element);
            if (armObserver) armObserver.unobserve(element);
            if (screenObserver) screenObserver.unobserve(element);
        });
        revealPending.clear();
        document.querySelectorAll("[data-reveal]:not(.revealed)").forEach((element) => element.classList.add("revealed"));
    }

    // Elements scrolled into view animate in, top to bottom
    function onEnterView(entries) {
        const visible = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
        visible.sort(pageOrder);

        visible.forEach((element) => {
            if (revealPending.has(element)) reveal(element, nextStagger());
            else viewObserver.unobserve(element);
        });
    }

    // Never leave content hidden when it gets keyboard focus
    document.addEventListener("focusin", (event) => {
        let element = event.target instanceof Element ? event.target.closest("[data-reveal]") : null;
        while (element) {
            if (revealPending.has(element)) reveal(element, 0);
            element = element.parentElement ? element.parentElement.closest("[data-reveal]") : null;
        }
    });

    // Printing shows everything at once
    window.addEventListener("beforeprint", () => {
        revealAll();
        finishAllCounters();
        stopAllScrambles();
    });

    // Safety net: a moment after loading, show anything on screen that is still hidden
    window.addEventListener("load", () => {
        setTimeout(() => {
            revealPending.forEach((element) => {
                const rect = element.getBoundingClientRect();
                if (rect.width > 0 && rect.top < window.innerHeight && rect.bottom > 0) reveal(element, 0);
            });
        }, 2500);
    });

    /* =========================================================
       3. COUNT-UP NUMBERS  [data-count="12"]
       Optional: data-count-prefix="+" data-count-suffix="%".
       Changing data-count later animates to the new number.
       The real number stays in the page (good for screen readers)
       and only drops to 0 just before it scrolls into view.
       ========================================================= */
    function decimalsOf(text) {
        const part = String(text).split(".")[1];
        return part ? Math.min(part.length, 3) : 0;
    }

    function formatNumber(value, decimals) {
        const locale = AIC.lang === "ru" ? "ru-RU" : "en-US";
        const fixed = Number(value.toFixed(decimals));
        if (Math.abs(fixed) >= 10000) {
            return fixed.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        }
        const text = fixed.toFixed(decimals);
        return AIC.lang === "ru" ? text.replace(".", ",") : text;
    }

    function writeCounter(element, counter, value) {
        const prefix = element.getAttribute("data-count-prefix") || "";
        const suffix = element.getAttribute("data-count-suffix") || "";
        element.textContent = prefix + formatNumber(value, counter.decimals) + suffix;
    }

    function stopCounter(counter) {
        clearTimeout(counter.timer);
        cancelAnimationFrame(counter.raf);
        counter.timer = 0;
        counter.raf = 0;
    }

    function registerCounter(element) {
        const raw = element.getAttribute("data-count");
        const value = parseFloat(raw);
        if (!isFinite(value)) return;

        let counter = counters.get(element);
        if (counter) {
            // The number changed: count from the old one to the new one
            counter.decimals = decimalsOf(raw);
            if (value === counter.target) return;
            counter.target = value;
            if (counter.waiting) {
                if (!counter.armed) writeCounter(element, counter, value);
                return;
            }
            if (motionOK()) startCounter(element, counter, 0);
            else writeCounter(element, counter, value);
            return;
        }

        counter = { target: value, shown: value, decimals: decimalsOf(raw), raf: 0, timer: 0, waiting: false, armed: false };
        counters.set(element, counter);
        writeCounter(element, counter, value);

        if (motionOK() && counterObserver) {
            counter.waiting = true;                 // counts up when it scrolls into view
            armObserver.observe(element);
            counterObserver.observe(element);
            // Close to the screen already? Start from 0 (the page isn't painted yet)
            if (isNear(element)) {
                counter.armed = true;
                counter.shown = 0;
                writeCounter(element, counter, 0);
            }
        }
    }

    // Is the number inside a card that is still hidden, waiting to animate in?
    function hiddenByCard(element) {
        return Boolean(element.closest("[data-reveal].fx-armed:not(.revealed)"));
    }

    // The real number is already on screen: keep it and stop waiting
    function stopWaiting(element, counter) {
        counter.waiting = false;
        counter.armed = false;
        if (counter.shown !== counter.target) {
            counter.shown = counter.target;
            writeCounter(element, counter, counter.target);
        }
        if (counterObserver) counterObserver.unobserve(element);
        if (armObserver && !revealPending.has(element)) armObserver.unobserve(element);
    }

    // A waiting number that can be seen starts counting.
    // "fresh" means its card has just appeared, so the visitor hasn't seen the number yet.
    function startIfVisible(element, counter, fresh, knownVisible) {
        if (!counter.waiting || hiddenByCard(element)) return;
        if (!knownVisible && !isOnScreen(element)) return;
        if (counter.armed || fresh) startCounter(element, counter, counterDelay(element));
        else stopWaiting(element, counter);
    }

    function startCountersWithin(container, fresh) {
        counters.forEach((counter, element) => {
            if (counter.waiting && container.contains(element)) startIfVisible(element, counter, fresh, false);
        });
    }

    // Any part of a number came onto the screen
    function onCounterView(entries) {
        entries.forEach((entry) => {
            const element = entry.target;
            const counter = counters.get(element);
            if (!counter || !counter.waiting) {
                counterObserver.unobserve(element);
                return;
            }
            if (entry.isIntersecting) startIfVisible(element, counter, false, true);
        });
    }

    // Fonts and translations can move numbers onto the screen after loading:
    // make sure no visible number is left waiting at 0
    function checkCounters() {
        counters.forEach((counter, element) => {
            if (counter.waiting && counter.armed) startIfVisible(element, counter, false, false);
        });
    }

    document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(checkCounters));
    window.addEventListener("load", checkCounters);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(checkCounters);

    // Start counting when the card around the number has appeared
    // (only the time that is still left: the card may have appeared long ago)
    function counterDelay(element) {
        let wait = 0;
        const host = element.closest("[data-reveal]");
        if (host && host.classList.contains("fx-reveal-run")) {
            let item = element;
            while (item.parentElement && item.parentElement !== host) item = item.parentElement;
            const appearsAt = (revealTimes.get(host) || 0) + (itemDelays.get(item) || 0);
            wait = Math.max(0, appearsAt - performance.now());
        }
        return 150 + wait;
    }

    function startCounter(element, counter, delay) {
        if (counter.waiting) {
            counter.waiting = false;
            if (counterObserver) counterObserver.unobserve(element);
            if (armObserver && !revealPending.has(element)) armObserver.unobserve(element);
            if (!counter.armed) counter.shown = 0;          // first count always starts at 0
            counter.armed = false;
        }
        stopCounter(counter);

        const from = counter.shown;
        const to = counter.target;
        if (from === to || !motionOK()) {
            counter.shown = to;
            writeCounter(element, counter, to);
            return;
        }

        const duration = clamp(700 + Math.abs(to - from) * 12, 900, 1800);
        counter.timer = setTimeout(() => {
            counter.timer = 0;
            const start = performance.now();
            const tick = (now) => {
                // (the frame time can be a hair earlier than "start", so keep it at 0 or more)
                const progress = clamp((now - start) / duration, 0, 1);
                const eased = 1 - Math.pow(2, -10 * progress);              // fast start, soft landing
                counter.shown = progress >= 1 ? to : from + (to - from) * eased;
                writeCounter(element, counter, counter.decimals ? counter.shown : Math.round(counter.shown));
                counter.raf = progress < 1 ? requestAnimationFrame(tick) : 0;
            };
            counter.raf = requestAnimationFrame(tick);
        }, delay);
    }

    function finishAllCounters() {
        counters.forEach((counter, element) => {
            stopCounter(counter);
            if (armObserver) armObserver.unobserve(element);
            if (counterObserver) counterObserver.unobserve(element);
            counter.waiting = false;
            counter.armed = false;
            counter.shown = counter.target;
            writeCounter(element, counter, counter.target);
        });
    }

    /* =========================================================
       4. TEXT DECODE ("SCRAMBLE")  [data-scramble] and .section-label
       Random letters (Latin + Cyrillic + symbols) settle into the
       real text, left to right. Runs on load, after a language
       change and (for [data-scramble]) when you hover it.
       ========================================================= */
    const SCRAMBLE_SELECTOR = "[data-scramble], .section-label";
    const GLYPHS_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ0123456789#%&*+=<>/\\|{}[]?!$@";
    const GLYPHS_LOWER = "abcdefghijklmnopqrstuvwxyzабвгдежзиклмнопрстуфхцчшщэюя0123456789#%&*+=<>/\\|{}?!";

    function randomGlyph(original) {
        if (/\s/.test(original)) return original;
        const lower = original !== original.toUpperCase();
        const set = lower ? GLYPHS_LOWER : GLYPHS_UPPER;
        return set.charAt(Math.floor(Math.random() * set.length));
    }

    function registerScramble(element) {
        if (scrambleTargets.has(element)) return;
        scrambleTargets.add(element);
        scramblePending.add(element);
        if (scrambleObserver) scrambleObserver.observe(element);
    }

    // Wait until the card around the text has been revealed
    function hostShown(element) {
        const host = element.closest("[data-reveal]");
        return !host || host.classList.contains("revealed") || !root.classList.contains("reveal-ready");
    }

    function onScrambleView(entries) {
        entries.forEach((entry) => {
            const element = entry.target;
            if (entry.isIntersecting && scramblePending.has(element) && hostShown(element)) {
                scramblePending.delete(element);
                scramble(element, 0);
            }
        });
    }

    function scrambleWithin(container, delay) {
        scramblePending.forEach((element) => {
            if (container.contains(element) && isOnScreen(element)) {
                scramblePending.delete(element);
                scramble(element, delay);
            }
        });
    }

    function restoreWidth(run) {
        if (run.lockedWidth !== null) {
            run.element.style.width = run.lockedWidth;
            run.element.classList.remove("fx-scramble-lock");
        }
        run.element.classList.remove("fx-scrambling", "fx-scramble-clip");
    }

    // Stops a running decode and puts the real text back
    function stopScramble(element) {
        const run = scrambleRuns.get(element);
        if (!run) return;
        clearTimeout(run.timer);
        cancelAnimationFrame(run.raf);
        if (run.visual && run.visual.parentNode === element) element.innerHTML = run.finalHTML;
        restoreWidth(run);
        scrambleRuns.delete(element);
    }

    function stopAllScrambles() {
        Array.from(scrambleRuns.keys()).forEach(stopScramble);
    }

    function scramble(element, delay) {
        stopScramble(element);
        if (!motionOK() || !element.isConnected) return;

        const run = { element: element, timer: 0, raf: 0, visual: null, finalHTML: "", lockedWidth: null };
        scrambleRuns.set(element, run);
        run.timer = setTimeout(() => beginScramble(run), delay || 0);
    }

    function beginScramble(run) {
        const element = run.element;
        run.timer = 0;

        const text = element.textContent;
        // Skip empty or long text, and anything with links or buttons inside
        if (!text.trim() || text.length > 140 || element.querySelector("a, button, input, select, textarea, img, svg")) {
            scrambleRuns.delete(element);
            return;
        }

        run.finalHTML = element.innerHTML;
        const letters = Array.from(text);

        // Gradient text (background-clip: text) can't show see-through letters
        const style = getComputedStyle(element);
        if (/text/.test(style.backgroundClip + " " + style.webkitBackgroundClip)) element.classList.add("fx-scramble-clip");

        // Short one-line texts keep their exact width, so nothing around them jumps
        if (style.display.indexOf("inline-") === 0 && element.getClientRects().length === 1) {
            run.lockedWidth = element.style.width;
            element.style.width = element.offsetWidth + "px";
            element.classList.add("fx-scramble-lock");
        }

        // What you see is hidden from screen readers; they read the real text
        const visual = document.createElement("span");
        const settled = document.createElement("span");
        const noise = document.createElement("span");
        const label = document.createElement("span");
        visual.setAttribute("aria-hidden", "true");
        noise.className = "fx-scramble-noise";
        label.className = "sr-only";
        label.textContent = text;
        visual.append(settled, noise);
        element.textContent = "";
        element.append(visual, label);
        element.classList.add("fx-scrambling");
        run.visual = visual;

        const duration = clamp(380 + letters.length * 32, 600, 1300);
        const start = performance.now();
        let noiseLetters = [];
        let lastShuffle = 0;

        const tick = (now) => {
            // Someone else changed the text meanwhile (e.g. a new language): stop quietly
            if (visual.parentNode !== element) {
                restoreWidth(run);
                scrambleRuns.delete(element);
                return;
            }

            const progress = clamp((now - start) / duration, 0, 1);
            const done = Math.floor(clamp((progress - 0.15) / 0.85, 0, 1) * letters.length);

            if (now - lastShuffle > 55) {
                lastShuffle = now;
                noiseLetters = letters.map(randomGlyph);
            }

            settled.textContent = letters.slice(0, done).join("");
            noise.textContent = noiseLetters.slice(done).join("");

            if (progress < 1) {
                run.raf = requestAnimationFrame(tick);
            } else {
                element.innerHTML = run.finalHTML;
                restoreWidth(run);
                scrambleRuns.delete(element);
            }
        };
        run.raf = requestAnimationFrame(tick);
    }

    // Hovering a [data-scramble] text decodes it again.
    // We remember which text the mouse is on, so it only replays when the mouse
    // really comes in from outside. (While decoding, the letters are swapped
    // under the resting mouse; the browser reports that as a new "pointerover",
    // which must not start the effect again.)
    let hoveredScramble = null;

    document.addEventListener("pointerover", (event) => {
        if (event.pointerType === "touch") return;
        const element = event.target instanceof Element ? event.target.closest("[data-scramble]") : null;
        if (element === hoveredScramble) return;
        hoveredScramble = element;
        if (!element || !fineOK() || scrambleRuns.has(element)) return;
        scramble(element, 0);
    });

    /* =========================================================
       5. TYPEWRITER WORDS  [data-rotator="hero.rotator"]
       The translation "students|teachers|parents|everyone" is
       typed and deleted word by word, in the current language.
       ========================================================= */
    // The text around the word can wrap differently when the page is resized
    const rotatorResize = "ResizeObserver" in window ? new ResizeObserver(() => rotators.forEach(updateRotatorLine)) : null;

    function registerRotator(element) {
        if (rotators.has(element)) return;
        const key = element.getAttribute("data-rotator");
        if (!key) return;

        const text = document.createElement("span");
        const caret = document.createElement("span");
        const label = document.createElement("span");
        text.className = "fx-rotator-text";
        text.setAttribute("aria-hidden", "true");
        caret.className = "fx-rotator-caret";
        caret.setAttribute("aria-hidden", "true");
        label.className = "sr-only";

        element.textContent = "";
        element.append(text, caret, label);
        element.classList.add("fx-rotator");

        const rotator = { element: element, key: key, text: text, label: label, words: [], wordsKey: "", word: 0, letters: 0, deleting: false, timer: 0, onScreen: true };
        rotators.set(element, rotator);
        setRotatorWords(rotator);
        if (rotatorObserver) rotatorObserver.observe(element);
        if (rotatorResize && element.parentElement) rotatorResize.observe(element.parentElement);
    }

    // When the word starts a new line of its own, it is centred on that line.
    // (When it shares a line, it stays left-aligned right after the text before it.)
    function updateRotatorLine(rotator) {
        const element = rotator.element;
        let before = element.previousSibling;
        while (before && before.nodeType === 3 && !before.textContent.trim()) before = before.previousSibling;

        let alone = true;
        if (before && (before.nodeType === 1 || before.nodeType === 3)) {
            const range = document.createRange();
            range.selectNodeContents(before);
            const rects = range.getClientRects();
            const last = rects[rects.length - 1];
            if (last) {
                const box = element.getBoundingClientRect();
                alone = box.top + box.height / 2 > last.bottom;           // our middle is below their last line
            }
        }
        element.classList.toggle("fx-rotator-alone", alone);
    }

    function setRotatorWords(rotator) {
        const words = AIC.t(rotator.key).split("|").map((word) => word.trim()).filter(Boolean);
        const wordsKey = words.join("|");
        if (wordsKey === rotator.wordsKey) return;                          // same language, keep typing

        rotator.words = words.length ? words : [""];
        rotator.wordsKey = wordsKey;
        rotator.label.textContent = rotator.words.join(", ");             // screen readers hear all the words
        clearTimeout(rotator.timer);
        rotator.timer = 0;
        rotator.word = 0;
        rotator.letters = 0;
        rotator.deleting = false;
        if (motionOK()) measureRotator(rotator);
        renderRotator(rotator);
        updateRotator(rotator);
    }

    // Reserve room for the longest word, so the line doesn't jump while typing
    function measureRotator(rotator) {
        const probe = document.createElement("span");
        probe.className = "fx-rotator-probe";
        rotator.element.appendChild(probe);
        let widest = 0;
        rotator.words.forEach((word) => {
            probe.textContent = word;
            widest = Math.max(widest, probe.getBoundingClientRect().width);
        });
        probe.remove();

        const fontSize = parseFloat(getComputedStyle(rotator.element).fontSize) || 16;
        if (widest > 0) rotator.element.style.minWidth = (widest / fontSize + 0.35).toFixed(3) + "em";
        updateRotatorLine(rotator);
    }

    function renderRotator(rotator) {
        const letters = Array.from(rotator.words[rotator.word] || "");
        rotator.text.textContent = letters.slice(0, rotator.letters).join("") || "\u200B";   // an invisible character keeps the line height
    }

    function rotatorShouldRun(rotator) {
        return motionOK() && rotator.onScreen && !document.hidden && rotator.words[0] !== "";
    }

    function updateRotator(rotator) {
        if (!motionOK()) {
            // No typing: just show the last word ("everyone"), no reserved space needed
            clearTimeout(rotator.timer);
            rotator.timer = 0;
            rotator.text.textContent = rotator.words[rotator.words.length - 1];
            rotator.element.classList.add("is-static");
            rotator.element.style.minWidth = "";
            return;
        }

        if (rotator.element.classList.contains("is-static")) {
            rotator.element.classList.remove("is-static");
            rotator.letters = 0;
            rotator.deleting = false;
            measureRotator(rotator);
            renderRotator(rotator);
        }

        if (rotatorShouldRun(rotator)) {
            if (!rotator.timer) rotator.timer = setTimeout(() => rotatorStep(rotator), 300);
        } else {
            clearTimeout(rotator.timer);
            rotator.timer = 0;
        }
    }

    function rotatorStep(rotator) {
        rotator.timer = 0;
        if (!rotatorShouldRun(rotator)) return;

        const length = Array.from(rotator.words[rotator.word]).length;
        let wait;

        if (!rotator.deleting) {
            rotator.letters = Math.min(length, rotator.letters + 1);
            if (rotator.letters >= length) {
                rotator.deleting = true;
                wait = 2100;                                                // hold the full word
            } else {
                wait = 65 + Math.random() * 60;                             // human-like typing
            }
        } else {
            rotator.letters = Math.max(0, rotator.letters - 1);
            if (rotator.letters === 0) {
                rotator.deleting = false;
                rotator.word = (rotator.word + 1) % rotator.words.length;
                wait = 420;
            } else {
                wait = 34;
            }
        }

        renderRotator(rotator);
        rotator.element.classList.toggle("is-typing", wait < 400);           // solid caret while typing
        rotator.timer = setTimeout(() => rotatorStep(rotator), wait);
    }

    function onRotatorView(entries) {
        entries.forEach((entry) => {
            const rotator = rotators.get(entry.target);
            if (!rotator) return;
            rotator.onScreen = entry.isIntersecting;
            updateRotator(rotator);
        });
    }

    // Fonts arrive a little later and change the word widths
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => rotators.forEach((rotator) => {
            if (motionOK()) measureRotator(rotator);
        }));
    }

    /* =========================================================
       6-8. POINTER EFFECTS (mouse only)
       tilt + glare on [data-tilt], glowing border on .card,
       spotlight under the cursor, magnetic .btn-primary
       ========================================================= */
    const spotlight = document.createElement("div");
    spotlight.className = "fx-spotlight";
    spotlight.setAttribute("aria-hidden", "true");
    document.body.appendChild(spotlight);

    const pointer = { x: 0, y: 0, smoothX: 0, smoothY: 0, inside: false, started: false };
    const tiltMemory = new WeakMap();
    let litHost = null;
    let litRect = null;
    let magnetButton = null;
    let magnetRect = null;
    let pointerFrame = 0;
    let lastPointerTime = 0;

    function requestPointerFrame() {
        if (!pointerFrame) pointerFrame = requestAnimationFrame(pointerStep);
    }

    function onPointerMove(event) {
        if (event.pointerType === "touch" || !fineOK()) return;
        pointer.x = event.clientX;
        pointer.y = event.clientY;

        if (!pointer.started) {
            pointer.started = true;
            pointer.smoothX = pointer.x;
            pointer.smoothY = pointer.y;
        }
        if (!pointer.inside) {
            pointer.inside = true;
            spotlight.classList.add("is-visible");
        }

        const target = event.target instanceof Element ? event.target : null;

        let host = target ? target.closest("[data-tilt], .card") : null;
        if (host && !canLight(host)) host = null;
        if (host !== litHost) {
            if (litHost) unlight(litHost);
            if (host) light(host);
        }

        const button = target ? target.closest(".btn-primary") : null;
        if (button !== magnetButton) {
            if (magnetButton) releaseMagnet(magnetButton);
            if (button && !button.disabled && button.getAttribute("aria-disabled") !== "true") grabMagnet(button);
        }

        requestPointerFrame();
    }

    function pointerStep(now) {
        pointerFrame = 0;
        const dt = lastPointerTime ? Math.min(0.05, (now - lastPointerTime) / 1000) : 0.016;
        lastPointerTime = now;

        // The spotlight follows the cursor with a soft delay
        const follow = 1 - Math.exp(-dt * 9);
        pointer.smoothX += (pointer.x - pointer.smoothX) * follow;
        pointer.smoothY += (pointer.y - pointer.smoothY) * follow;
        spotlight.style.transform = "translate3d(" + pointer.smoothX.toFixed(1) + "px," + pointer.smoothY.toFixed(1) + "px,0) translate(-50%,-50%)";

        if (litHost) updateLit();
        if (magnetButton) updateMagnet();

        const moving = Math.abs(pointer.x - pointer.smoothX) + Math.abs(pointer.y - pointer.smoothY) > 0.5;
        if (moving) requestPointerFrame();
        else lastPointerTime = 0;
    }

    // Elements that can't hold a glare: images, form fields and scrolling boxes
    // (in a scrolling box the glare would scroll away with the content)
    const cannotLight = new WeakSet();

    function canLight(host) {
        if (cannotLight.has(host)) return false;
        if (glareOf(host)) return true;
        const style = getComputedStyle(host);
        const scrolls = /(auto|scroll)/.test(style.overflowX + " " + style.overflowY);
        if (scrolls || /^(IMG|CANVAS|VIDEO|INPUT|TEXTAREA|SELECT)$/.test(host.tagName)) {
            cannotLight.add(host);
            return false;
        }
        return true;
    }

    // The glare is a light layer added inside the card the first time you hover it
    function glareOf(host) {
        for (let i = host.children.length - 1; i >= 0; i--) {
            if (host.children[i].classList.contains("fx-glare")) return host.children[i];
        }
        return null;
    }

    function createGlare(host) {
        const style = getComputedStyle(host);
        if (style.position === "static") host.style.position = "relative";

        const glare = document.createElement("span");
        glare.className = "fx-glare";
        glare.setAttribute("aria-hidden", "true");

        // Sit exactly on top of the card's border (unless the card clips its content)
        const border = parseFloat(style.borderTopWidth) || 0;
        if (border && style.overflow === "visible") {
            ["top", "right", "bottom", "left"].forEach((side) => {
                glare.style[side] = -border + "px";
            });
        }
        host.appendChild(glare);
        return glare;
    }

    function light(host) {
        litHost = host;
        litRect = null;
        let glare = glareOf(host);
        if (!glare) glare = createGlare(host);
        glare.classList.toggle("fx-glare-full", host.hasAttribute("data-tilt"));
        host.classList.add("fx-lit");
        if (host.hasAttribute("data-tilt")) startTilt(host);
    }

    function unlight(host) {
        if (litHost === host) {
            litHost = null;
            litRect = null;
        }
        host.classList.remove("fx-lit");
        if (tiltMemory.has(host)) stopTilt(host);
    }

    function updateLit() {
        const host = litHost;
        if (!host.isConnected) {
            unlight(host);
            return;
        }
        if (!litRect) litRect = host.getBoundingClientRect();
        if (!litRect.width || !litRect.height) return;

        const x = clamp((pointer.x - litRect.left) / litRect.width, 0, 1);
        const y = clamp((pointer.y - litRect.top) / litRect.height, 0, 1);

        const glare = glareOf(host);
        if (glare) {
            glare.style.setProperty("--fx-x", (x * 100).toFixed(1) + "%");
            glare.style.setProperty("--fx-y", (y * 100).toFixed(1) + "%");
        }

        if (host.hasAttribute("data-tilt")) {
            // Small cards tilt more, big cards tilt less
            const maxTilt = clamp(2600 / litRect.width, 3, 9);
            const rotateX = (0.5 - y) * 2 * maxTilt * 0.8;
            const rotateY = (x - 0.5) * 2 * maxTilt;
            const depth = Math.round(Math.max(700, litRect.width * 2.2));
            host.style.transform = "perspective(" + depth + "px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) scale3d(1.02, 1.02, 1.02)";
        }
    }

    // Tilt: we add a quick transform transition to the card's own transitions,
    // and put everything back the way it was when the mouse leaves.
    function joinTransitions(base, extra) {
        return base ? base + ", " + extra : extra;
    }

    function startTilt(host) {
        let memory = tiltMemory.get(host);
        if (!memory) {
            const style = getComputedStyle(host);
            const hasOwn = style.transitionProperty !== "none" && /[1-9]/.test(style.transitionDuration);
            memory = {
                transition: host.style.transition,
                transform: host.style.transform,
                base: hasOwn ? style.transition : "",
                timer: 0
            };
            tiltMemory.set(host, memory);
        }
        clearTimeout(memory.timer);
        memory.timer = 0;
        host.style.transition = joinTransitions(memory.base, "transform 0.2s cubic-bezier(0.03, 0.98, 0.52, 0.99)");
        host.classList.add("fx-tilting");
    }

    function stopTilt(host) {
        const memory = tiltMemory.get(host);
        if (!memory) return;
        host.classList.remove("fx-tilting");
        host.style.transition = joinTransitions(memory.base, "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)");
        host.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        clearTimeout(memory.timer);
        memory.timer = setTimeout(() => {
            host.style.transform = memory.transform;
            host.style.transition = memory.transition;
            tiltMemory.delete(host);
        }, 720);
    }

    // Magnet: the button leans a few pixels towards the cursor
    function grabMagnet(button) {
        magnetButton = button;
        magnetRect = null;
        button.classList.add("fx-magnet");
    }

    function releaseMagnet(button) {
        if (magnetButton === button) {
            magnetButton = null;
            magnetRect = null;
        }
        button.classList.remove("fx-magnet");
        button.style.removeProperty("--fx-mx");
        button.style.removeProperty("--fx-my");
    }

    function updateMagnet() {
        const button = magnetButton;
        if (!button.isConnected || button.disabled) {
            releaseMagnet(button);
            return;
        }
        if (!magnetRect) magnetRect = button.getBoundingClientRect();
        const dx = pointer.x - (magnetRect.left + magnetRect.width / 2);
        const dy = pointer.y - (magnetRect.top + magnetRect.height / 2);
        button.style.setProperty("--fx-mx", clamp(dx * 0.2, -8, 8).toFixed(2) + "px");
        button.style.setProperty("--fx-my", clamp(dy * 0.28, -6, 6).toFixed(2) + "px");
    }

    function resetPointerEffects() {
        pointer.inside = false;
        hoveredScramble = null;
        spotlight.classList.remove("is-visible");
        if (litHost) unlight(litHost);
        if (magnetButton) releaseMagnet(magnetButton);
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerMove, { passive: true });
    window.addEventListener("pointerout", (event) => {
        if (!event.relatedTarget) resetPointerEffects();               // the mouse left the window
    });
    window.addEventListener("blur", resetPointerEffects);
    window.addEventListener("scroll", () => {
        litRect = null;
        magnetRect = null;
    }, { passive: true });

    /* =========================================================
       9. RIPPLE when a button is pressed
       ========================================================= */
    const RIPPLE_SELECTOR = ".btn, .icon-button, .chip";

    // Only real controls ripple (a .chip can also be a plain label)
    function rippleTarget(event) {
        if (!(event.target instanceof Element)) return null;
        const element = event.target.closest(RIPPLE_SELECTOR);
        if (!element || element.disabled || element.getAttribute("aria-disabled") === "true") return null;
        return element.matches("button, a[href], [role='button'], label") ? element : null;
    }

    function ripple(element, x, y) {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const originalPosition = element.style.position;
        if (getComputedStyle(element).position === "static") element.style.position = "relative";

        const size = Math.hypot(Math.max(x - rect.left, rect.right - x), Math.max(y - rect.top, rect.bottom - y)) * 2;
        const box = document.createElement("span");
        const wave = document.createElement("span");
        box.className = "fx-ripple";
        box.setAttribute("aria-hidden", "true");
        wave.style.width = size + "px";
        wave.style.height = size + "px";
        wave.style.left = (x - rect.left - size / 2) + "px";
        wave.style.top = (y - rect.top - size / 2) + "px";
        box.appendChild(wave);
        element.appendChild(box);

        setTimeout(() => {
            box.remove();
            if (!element.querySelector(".fx-ripple")) element.style.position = originalPosition;
        }, 700);
    }

    document.addEventListener("pointerdown", (event) => {
        if (!motionOK() || event.button > 0) return;
        const element = rippleTarget(event);
        if (element) ripple(element, event.clientX, event.clientY);
    }, { passive: true });

    // Keyboard presses (Enter / Space) ripple from the middle
    document.addEventListener("click", (event) => {
        if (event.detail !== 0 || !motionOK()) return;
        const element = rippleTarget(event);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        ripple(element, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    /* =========================================================
       10. SECTION MINI-MAP (right edge, big screens only)
       ========================================================= */
    const RAIL_KEYS = {
        home: "cmd.home",
        lessons: "nav.lessons",
        lab: "nav.lab",
        quiz: "nav.quiz",
        glossary: "nav.glossary",
        timeline: "nav.timeline",
        about: "nav.about"
    };
    let railNav = null;
    let railFill = null;
    let railPercent = null;
    let lastRailScale = "";
    const railLinks = [];
    let railSections = [];
    // Same rule as in css/effects.css: wide screens with a mouse
    const railQuery = window.matchMedia("(min-width: 1360px) and (min-height: 560px) and (hover: hover) and (pointer: fine)");
    onMediaChange(railQuery, queueProgress);

    function buildRail() {
        railSections = Array.prototype.slice.call(document.querySelectorAll("main section[id]")).filter((section) => RAIL_KEYS[section.id]);
        if (railSections.length < 2) return;

        railNav = document.createElement("nav");
        railNav.className = "fx-rail";
        railNav.setAttribute("data-i18n-attr", "aria-label:effects.railLabel");
        railNav.setAttribute("aria-label", AIC.t("effects.railLabel"));

        const track = document.createElement("span");
        track.className = "fx-rail-track";
        track.setAttribute("aria-hidden", "true");
        railFill = document.createElement("span");
        railFill.className = "fx-rail-fill";
        track.appendChild(railFill);

        const list = document.createElement("ol");
        list.className = "fx-rail-list";

        railSections.forEach((section, index) => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.className = "fx-rail-link";
            link.href = "#" + section.id;
            link.innerHTML =
                '<span class="fx-rail-dot" aria-hidden="true"></span>' +
                '<span class="fx-rail-label">' +
                    '<span class="fx-rail-number" aria-hidden="true">' + String(index + 1).padStart(2, "0") + "</span>" +
                    '<span data-i18n="' + RAIL_KEYS[section.id] + '"></span>' +
                "</span>";
            link.querySelector("[data-i18n]").textContent = AIC.t(RAIL_KEYS[section.id]);
            item.appendChild(link);
            list.appendChild(item);
            railLinks.push(link);
        });

        // A tiny read-out of how much of the page you have scrolled
        railPercent = document.createElement("span");
        railPercent.className = "fx-rail-percent";
        railPercent.setAttribute("aria-hidden", "true");
        railPercent.textContent = "0%";

        railNav.append(track, list, railPercent);
        document.body.appendChild(railNav);
    }

    function updateRail(progress, atBottom) {
        if (!railNav || !railSections.length || !railQuery.matches) return;   // hidden: nothing to update

        // Which section is under the "reading line" (40% down the screen)?
        const line = window.innerHeight * 0.4;
        const tops = railSections.map((section) => section.getBoundingClientRect().top);
        let active = 0;
        tops.forEach((top, index) => {
            if (top <= line) active = index;
        });

        let fill;
        if (atBottom) {
            active = railSections.length - 1;
            fill = 1;
        } else {
            const next = tops[active + 1];
            const part = next === undefined ? 0 : clamp((line - tops[active]) / Math.max(1, next - tops[active]), 0, 1);
            fill = (active + part) / (railSections.length - 1);
        }

        // Only touch the page when something really changed
        const scale = "scaleY(" + clamp(fill, 0, 1).toFixed(4) + ")";
        if (scale !== lastRailScale) {
            lastRailScale = scale;
            railFill.style.transform = scale;
        }
        const percent = Math.round(progress * 100) + "%";
        if (railPercent.textContent !== percent) railPercent.textContent = percent;

        railLinks.forEach((link, index) => {
            link.classList.toggle("is-passed", index < active);
            const current = index === active;
            if (current !== link.hasAttribute("aria-current")) {
                if (current) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            }
        });
    }

    /* =========================================================
       11. CALM MODE (command palette: "Calm mode: pause animations")
       ========================================================= */
    function onMotionChange() {
        updateModeClasses();
        if (!motionOK()) {
            revealAll();
            finishAllCounters();
            stopAllScrambles();
        }
        if (!fineOK()) resetPointerEffects();
        rotators.forEach(updateRotator);
        document.dispatchEvent(new CustomEvent("aic:effects", { detail: { calm: AIC.motion.calm } }));
    }

    function setCalm(value) {
        AIC.motion.setCalm(value);
    }

    AIC.registerCommand({
        id: "effects-calm",
        group: "cmd.groupActions",
        icon: "🧘",
        title: function () { return AIC.t(AIC.motion.calm ? "effects.calmOff" : "effects.calmOn"); },
        keywords: "calm motion animation animations effects pause reduce accessibility спокойный режим анимации анимация эффекты движение пауза",
        keepOverlays: true,
        run: function () {
            const calm = AIC.motion.toggleCalm();
            AIC.toast(AIC.t(calm ? "effects.toastCalmOn" : "effects.toastCalmOff"), calm ? "🧘" : "✨");
        }
    });

    AIC.motion.onChange(onMotionChange);
    onMediaChange(finePointerQuery, onMotionChange);

    /* =========================================================
       FINDING ELEMENTS (now, and when other features add more later)
       ========================================================= */
    function each(container, selector, callback) {
        if (container.matches && container.matches(selector)) callback(container);
        container.querySelectorAll(selector).forEach(callback);
    }

    function scan(container) {
        const fresh = [];
        each(container, "[data-reveal]", (element) => {
            if (registerReveal(element)) fresh.push(element);
        });
        if (fresh.length) armIfNear(fresh);
        each(container, "[data-count]", registerCounter);
        each(container, SCRAMBLE_SELECTOR, registerScramble);
        each(container, "[data-rotator]", registerRotator);
    }

    // Forget elements that were removed from the page
    function prune() {
        revealPending.forEach((element) => {
            if (!element.isConnected) {
                revealPending.delete(element);
                clearFallback(element);
                if (viewObserver) viewObserver.unobserve(element);
                if (armObserver) armObserver.unobserve(element);
                if (screenObserver) screenObserver.unobserve(element);
            }
        });
        counters.forEach((counter, element) => {
            if (!element.isConnected) {
                stopCounter(counter);
                counters.delete(element);
                if (counterObserver) counterObserver.unobserve(element);
                if (armObserver) armObserver.unobserve(element);
            }
        });
        scrambleTargets.forEach((element) => {
            if (!element.isConnected) {
                stopScramble(element);
                scrambleTargets.delete(element);
                scramblePending.delete(element);
                if (scrambleObserver) scrambleObserver.unobserve(element);
            }
        });
        rotators.forEach((rotator, element) => {
            if (!element.isConnected) {
                clearTimeout(rotator.timer);
                rotators.delete(element);
                if (rotatorObserver) rotatorObserver.unobserve(element);
            }
        });
    }

    let pruneTimer = 0;
    const mutations = new MutationObserver((records) => {
        let removed = false;
        records.forEach((record) => {
            if (record.type === "attributes") {
                const element = record.target;
                if (!element.hasAttribute(record.attributeName)) return;
                if (record.attributeName === "data-count") registerCounter(element);
                else if (record.attributeName === "data-reveal" && registerReveal(element)) armIfNear([element]);
                else if (record.attributeName === "data-scramble") registerScramble(element);
                return;
            }
            record.addedNodes.forEach((node) => {
                if (node.nodeType === 1) scan(node);
            });
            if (record.removedNodes.length) removed = true;
        });

        if (removed && !pruneTimer) {
            pruneTimer = setTimeout(() => {
                pruneTimer = 0;
                prune();
            }, 2000);
        }
    });

    /* =========================================================
       LANGUAGE CHANGES
       Core has already put the new text in place; we decode it
       again and restart the typewriter with the new words.
       ========================================================= */
    AIC.onLanguageChange(() => {
        prune();

        scrambleTargets.forEach((element) => {
            stopScramble(element);
            if (!motionOK()) return;
            scramblePending.add(element);
            if (hostShown(element) && isOnScreen(element)) {
                scramblePending.delete(element);
                scramble(element, 60);
            }
        });

        rotators.forEach(setRotatorWords);

        // Decimal commas differ between languages
        counters.forEach((counter, element) => {
            if (!counter.raf && !counter.timer && !counter.waiting) writeCounter(element, counter, counter.target);
        });
    });

    document.addEventListener("visibilitychange", () => rotators.forEach(updateRotator));

    /* =========================================================
       12. CONFETTI (for big moments: every lesson done, a new best quiz score)
       AICompass.effects.confetti()                    two bursts from the bottom corners
       AICompass.effects.confetti({ origin: element }) one burst from the middle of an element
       Options: count (pieces), duration (ms). Nothing happens when animations are off.
       ========================================================= */
    const CONFETTI_COLORS = ["--accent", "--accent-2", "--accent-3", "--success", "--warning"];
    let party = null;

    function stopConfetti() {
        if (!party) return;
        cancelAnimationFrame(party.frame);
        party.canvas.remove();
        party = null;
    }

    function confetti(options) {
        const settings = options || {};
        if (!motionOK() || document.hidden) return;
        stopConfetti();

        const canvas = document.createElement("canvas");
        canvas.className = "fx-confetti";
        canvas.setAttribute("aria-hidden", "true");
        const width = window.innerWidth;
        const height = window.innerHeight;
        const context = AIC.canvas.fit(canvas, width, height);
        if (!context) return;
        document.body.appendChild(canvas);

        const colors = CONFETTI_COLORS.map((name) => AIC.cssVar(name)).filter(Boolean);
        const origin = settings.origin && settings.origin.getBoundingClientRect ? settings.origin.getBoundingClientRect() : null;
        const count = settings.count || (origin ? (width < 600 ? 90 : 150) : 180);
        const pieces = [];
        for (let i = 0; i < count; i++) {
            let x, y, angle, speed;
            if (origin) {
                // One round burst, thrown a little upwards
                x = origin.left + origin.width / 2;
                y = origin.top + origin.height / 2;
                angle = Math.random() * Math.PI * 2;
                speed = 220 + Math.random() * 560;
            } else {
                // Two cannons in the bottom corners, aiming up and inwards
                const fromLeft = i % 2 === 0;
                x = fromLeft ? -10 : width + 10;
                y = height * 0.85;
                angle = ((fromLeft ? -62 : -118) + (Math.random() - 0.5) * 46) * Math.PI / 180;
                speed = 660 + Math.random() * 600;
            }
            pieces.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (origin ? 260 : 0),
                size: 5 + Math.random() * 8,
                shape: i % 3,                     // 0 square, 1 circle, 2 paper strip
                turn: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 14,
                color: colors[i % colors.length] || "#9b6dff"
            });
        }

        const duration = settings.duration || 3000;
        const start = performance.now();
        party = { canvas: canvas, frame: 0 };
        let last = start;

        function frame(now) {
            const dt = Math.min(0.05, (now - last) / 1000);   // the same speed at 60 Hz and 120 Hz
            last = now;
            const age = now - start;
            context.clearRect(0, 0, width, height);
            context.globalAlpha = AIC.util.clamp((duration - age) / 700, 0, 1);

            let alive = 0;
            pieces.forEach((piece) => {
                // Gravity pulls down, the air slows everything down
                piece.vy += 1000 * dt;
                piece.vx *= 1 - 1.4 * dt;
                piece.vy *= 1 - 1.1 * dt;
                piece.x += piece.vx * dt;
                piece.y += piece.vy * dt;
                piece.turn += piece.spin * dt;
                if (piece.y > height + 30) return;
                alive++;

                context.save();
                context.translate(piece.x, piece.y);
                context.rotate(piece.turn);
                context.fillStyle = piece.color;
                if (piece.shape === 1) {
                    context.beginPath();
                    context.arc(0, 0, piece.size * 0.38, 0, Math.PI * 2);
                    context.fill();
                } else if (piece.shape === 2) {
                    // Squashing the width looks like a strip of paper flipping over
                    const flip = Math.abs(Math.cos(piece.turn * 1.7));
                    context.fillRect(-piece.size / 2 * flip, -piece.size * 0.3, piece.size * flip, piece.size * 0.6);
                } else {
                    context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
                }
                context.restore();
            });

            if (alive > 0 && age < duration && !document.hidden) party.frame = requestAnimationFrame(frame);
            else stopConfetti();
        }
        party.frame = requestAnimationFrame(frame);
    }

    /* =========================================================
       Tools for other features, e.g.
       if (AICompass.effects) AICompass.effects.scramble(element);
       ========================================================= */
    AIC.effects = {
        get calm() { return AIC.motion.calm; },
        setCalm: setCalm,
        refresh: function (container) { scan(container || document.body); },
        reveal: function (element) { if (element) reveal(element, 0); },
        scramble: function (element) { if (element) scramble(element, 0); },
        confetti: confetti,
        stopConfetti: stopConfetti
    };

    /* ---------- Start ---------- */
    updateModeClasses();
    buildRail();
    scan(document.body);
    mutations.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-count", "data-reveal", "data-scramble"]
    });
    updateProgress();

})();
