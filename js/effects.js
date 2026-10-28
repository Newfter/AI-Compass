/* =========================================================
   AI COMPASS — VISUAL EFFECTS
   Small touches that make the page feel alive: a scroll progress bar,
   cards that rise in, numbers that count up, "decoding" text, typewriter
   words, tilting cards with a glare, a soft spotlight under the mouse,
   magnetic buttons, ripples, a section mini-map and confetti.
   Calm mode and the device's "reduce motion" setting switch the moving
   ones off (A.motion in core.js).
   Sections of this file:
    1. Settings
    2. Small helpers
    3. Motion: calm mode, reduced motion and a real mouse
    4. Watching the screen (what is near it, what is on it)
    5. Scroll progress bar (+ everything that follows the scroll)
    6. Reveal on scroll               [data-reveal]
    7. Numbers that count up          [data-count]
    8. "Decoding" text                [data-scramble] and .section-label
    9. Typewriter words               [data-rotator]
   10. Pointer effects (a real mouse only): 3D tilt with a glare on
       [data-tilt], a glowing border on .card, a spotlight under the
       cursor and magnetic main buttons (.btn-primary)
   11. Ripple when you press a button
   12. Section mini-map on the right (big screens)
   13. Confetti (for big moments)
   14. Finding elements (now, and when other features add more later)
   15. Language changes
   16. Start
   17. Ctrl+K command (calm mode) and the public API
   Other features use AICompass.effects (see the last section).
   Every text (English and Russian) is in js/content/effects.js
   The styles are in css/effects.css
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const t = A.t;
    const root = document.documentElement;
    const finePointerQuery = A.media(A.queries.finePointer);
    const hasObserver = "IntersectionObserver" in window;

    /* =========================================================
       1. SETTINGS
       Values you may want to change.
       ========================================================= */
    const NEAR_ZONE = 0.1;                    // "near the screen": up to 10% of the screen height above or below it
    const BOTTOM_ZONE = 6;                    // px: this close to the end counts as "at the very bottom"
    const SCRAMBLE_SELECTOR = "[data-scramble], .section-label";       // the texts that "decode"
    // The random letters shown while a text decodes (Latin, Cyrillic, digits, symbols)
    const GLYPHS_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ0123456789#%&*+=<>/\\|{}[]?!$@";
    const GLYPHS_LOWER = "abcdefghijklmnopqrstuvwxyzабвгдежзиклмнопрстуфхцчшщэюя0123456789#%&*+=<>/\\|{}?!";
    const RIPPLE_SELECTOR = ".btn, .icon-button, .chip";                // what ripples when it is pressed
    const CONFETTI_COLORS = ["--accent", "--accent-2", "--accent-3", "--success", "--warning"];   // theme colours of the pieces

    /* =========================================================
       2. SMALL HELPERS (core.js has the rest: A.util, A.format, A.canvas...)
       ========================================================= */
    // Sorts elements in the order they appear on the page
    function pageOrder(a, b) {
        if (a === b) return 0;
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    }

    // The container itself (when it matches) and everything inside it that matches
    function findAll(container, selector) {
        const found = Array.from(container.querySelectorAll(selector));
        if (container.matches && container.matches(selector)) found.unshift(container);
        return found;
    }

    /* =========================================================
       3. MOTION: CALM MODE, REDUCED MOTION AND A REAL MOUSE
       A.motion (core) knows both: "calm mode" (our own switch, saved in
       the browser) and "reduced motion" (the device settings).
       A.motion.ok() is false for either.
       ========================================================= */
    // Tilt, magnet and spotlight only make sense with a real mouse
    function fineOK() {
        return A.motion.ok() && finePointerQuery.matches;
    }

    function updateModeClasses() {
        root.classList.toggle("fx-fine", fineOK());
        root.classList.toggle("reveal-ready", A.motion.ok() && hasObserver);
    }

    // Calm mode or "reduce motion" was switched, or a mouse came or went:
    // what still waits appears at once, and the moving things stop
    function onMotionChange() {
        updateModeClasses();
        if (!A.motion.ok()) {
            revealAll();
            finishAllCounters();
            stopAllScrambles();
        }
        if (!fineOK()) resetPointerEffects();
        rotators.forEach(updateRotator);
        // (older code listens for this event; new code uses A.motion.onChange)
        document.dispatchEvent(new CustomEvent("aic:effects", { detail: { calm: A.motion.calm } }));
    }

    // The hero rises in with pure CSS when the page opens (css/effects.css).
    // Switching animations off and on again would start that entrance again,
    // so the first switch marks it as over.
    function endHeroEntrance() {
        document.querySelectorAll(".hero").forEach((hero) => hero.classList.add("fx-entered"));
    }

    A.motion.onChange(() => {
        endHeroEntrance();
        onMotionChange();
    });
    A.onMedia(finePointerQuery, onMotionChange, { immediate: false });

    /* =========================================================
       4. WATCHING THE SCREEN
       Which waiting elements are near the screen, and which are on it.
       Reveal (6), numbers (7) and decoding texts (8) all use these lists
       and observers.
       ========================================================= */
    // Lists of everything the effects are working on
    const revealPending = new Set();
    const revealTimes = new WeakMap();                                    // when each card starts to appear
    const itemDelays = new WeakMap();
    const counters = new Map();
    const scrambleTargets = new Set();
    const scramblePending = new Set();
    const scrambleRuns = new Map();
    const rotators = new Map();

    // Five observers ("zones") watch the page:
    // - screenObserver: remembers what has already been on screen.
    //   Something you have seen is never hidden again (no blinking).
    // - armObserver: a bit bigger than the screen (NEAR_ZONE). Things entering it
    //   get ready (hidden, or set to 0) just before you can see them.
    // - viewObserver: the screen minus a bottom strip. Things entering it animate in.
    // - counterObserver: the whole screen. A number starts counting as soon as
    //   any part of it can be seen, so you never look at a "0" that waits.
    // - scrambleObserver: the whole screen. A text decodes once a fifth of it can be seen.
    // The observers tell us where things are after each frame, so we never
    // measure the page ourselves (that would make the browser lay it out again).
    // Something already on the screen is never hidden: it simply stays visible.
    // Content far away from the screen is never hidden either, so the page always works.
    const seenOnScreen = new WeakSet();
    const onScreenNow = new WeakSet();                                     // waiting cards, numbers and texts on screen right now
    const screenObserver = hasObserver ? new IntersectionObserver(onScreenSeen, { threshold: 0 }) : null;
    const armObserver = hasObserver ? new IntersectionObserver(onNear, { rootMargin: NEAR_ZONE * 100 + "% 0px", threshold: 0 }) : null;
    const viewObserver = hasObserver ? new IntersectionObserver(onEnterView, { rootMargin: "0px 0px -8% 0px", threshold: 0 }) : null;
    const counterObserver = hasObserver ? new IntersectionObserver(onCounterView, { threshold: 0 }) : null;
    const scrambleObserver = hasObserver ? new IntersectionObserver(onScrambleView, { threshold: [0, 0.2] }) : null;

    /* =========================================================
       5. SCROLL PROGRESS BAR (+ everything that follows the scroll)
       Core measures the page and calls onPageScroll(info) once per
       frame while it scrolls (A.onScroll). We only WRITE here and use
       core's numbers: measuring the page in every frame would make the
       browser lay it out again and again.
       ========================================================= */
    const progressWrap = document.querySelector(".scroll-progress");
    let lastProgress = "";
    let lastScroll = null;                    // core's latest numbers

    function atPageBottom() {
        return Boolean(lastScroll) && lastScroll.max - lastScroll.y < BOTTOM_ZONE;
    }

    function updateProgress(progress) {
        if (!progressWrap) return;
        // css/effects.css squeezes the bar with scaleX(--fx-progress): no new layout needed
        const value = progress.toFixed(4);
        if (value !== lastProgress) {
            lastProgress = value;
            progressWrap.style.setProperty("--fx-progress", value);
        }
        progressWrap.classList.toggle("is-active", progress > 0.002);
    }

    function onPageScroll(info) {
        lastScroll = info;
        updateProgress(info.progress);
        updateRail(info);

        // The lit card and the magnetic button moved: measure them again on the next mouse move
        litRect = null;
        magnetRect = null;

        // At the very bottom, show anything that is on screen but too small to trigger
        // (the observers below keep onScreenNow up to date, so nothing is measured here)
        if (atPageBottom()) {
            revealPending.forEach((element) => {
                if (onScreenNow.has(element)) reveal(element, nextStagger());
            });
            counters.forEach((counter, element) => {
                if (counter.waiting && onScreenNow.has(element)) startIfVisible(element, counter, false, true);
            });
        }
    }

    A.onScroll(onPageScroll);


    /* =========================================================
       6. REVEAL ON SCROLL  [data-reveal]
       data-reveal=""        slide up (default)
       data-reveal="left"    slide in from the left ("right", "zoom", "fade" also work)
       data-reveal="stagger" children appear one by one (lists do this by default)
       ========================================================= */
    let staggerIndex = 0;
    let lastRevealAt = 0;

    // A new element waits to be revealed. Nothing is hidden yet: the observers
    // first tell us where it is (see onNear).
    function registerReveal(element) {
        if (element.classList.contains("revealed") || revealPending.has(element)) return;
        if (!viewObserver || !A.motion.ok()) {
            element.classList.add("revealed");
            return;
        }
        revealPending.add(element);
        screenObserver.observe(element);
        armObserver.observe(element);
        viewObserver.observe(element);
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
                onScreenNow.delete(element);
                clearFallback(element);
                return;
            }
            seenOnScreen.add(element);
            onScreenNow.add(element);

            // Visible but not hidden (e.g. the page moved under it): leave it as it is
            if (!element.classList.contains("fx-armed")) {
                showNow(element);
                return;
            }

            // Hidden, but already peeking onto the screen:
            // - at the very bottom of the page, or in a fixed panel, it will never
            //   scroll further in, so it appears now
            // - anywhere else it appears by itself if you stop scrolling for a moment
            if (atPageBottom() || inFixedLayer(element)) {
                reveal(element, nextStagger());
            } else if (!fallbackTimers.has(element)) {
                fallbackTimers.set(element, setTimeout(() => {
                    fallbackTimers.delete(element);
                    if (revealPending.has(element) && onScreenNow.has(element)) reveal(element, 0);
                }, 1400));
            }
        });
    }

    // The arm zone is the screen plus NEAR_ZONE above and below it.
    // Was the element on the screen itself in that frame (not only next to it)?
    // The entry knows where it was, so nothing has to be measured.
    function onScreenIn(entry) {
        const zone = entry.rootBounds;
        if (!zone) return true;                           // unknown: say "visible", so it is never hidden
        const screenHeight = zone.height / (1 + 2 * NEAR_ZONE);
        const screenTop = zone.top + screenHeight * NEAR_ZONE;
        const rect = entry.boundingClientRect;
        return rect.width > 0 && rect.bottom > screenTop && rect.top < screenTop + screenHeight;
    }

    // Something came close to the screen (or went far away again).
    // New elements are only ever hidden here: when they are near the screen
    // but not on it yet, so nobody sees them disappear.
    function onNear(entries) {
        entries.forEach((entry) => {
            const element = entry.target;
            const visible = entry.isIntersecting && onScreenIn(entry);
            let stillNeeded = false;

            if (revealPending.has(element)) {
                stillNeeded = true;
                if (!entry.isIntersecting) {
                    element.classList.remove("fx-armed");
                } else if (!element.classList.contains("fx-armed")) {
                    if (seenOnScreen.has(element) || visible) {
                        // Already visible (the page opened at #quiz, or it was added
                        // on screen): hiding it now would make it blink, so keep it as it is
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
                    if (visible && !hiddenByCard(element)) {
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
        if (element.classList.contains("revealed") || !element.classList.contains("fx-armed") || !A.motion.ok()) {
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
                if (onScreenNow.has(element)) reveal(element, 0);
            });
        }, 2500);
    });

    /* =========================================================
       7. COUNT-UP NUMBERS  [data-count="12"]
       Optional: data-count-prefix="+" data-count-suffix="%".
       Changing data-count later animates to the new number.
       The real number stays in the page (good for screen readers)
       and only drops to 0 just before it scrolls into view.
       ========================================================= */
    function decimalsOf(text) {
        const part = String(text).split(".")[1];
        return part ? Math.min(part.length, 3) : 0;
    }

    // Written the local way ("1,5" in Russian), with exactly the decimals of data-count.
    // Thousands are only grouped from 10,000 on ("9999", but "12,345" / "12 345").
    // (Only a real change is written: the page then has nothing new to lay out.)
    function writeCounter(element, counter, value) {
        const prefix = element.getAttribute("data-count-prefix") || "";
        const suffix = element.getAttribute("data-count-suffix") || "";
        const text = prefix + A.format.number(value, { digits: counter.decimals, grouping: "min2" }) + suffix;
        if (element.textContent !== text) element.textContent = text;
    }

    function stopCounter(counter) {
        clearTimeout(counter.timer);
        cancelAnimationFrame(counter.raf);
        counter.timer = 0;
        counter.raf = 0;
    }

    // Returns true when the number is new and waits to count up
    function registerCounter(element) {
        const raw = element.getAttribute("data-count");
        const value = parseFloat(raw);
        if (!isFinite(value)) return false;

        let counter = counters.get(element);
        if (counter) {
            // The number changed: count from the old one to the new one
            counter.decimals = decimalsOf(raw);
            if (value === counter.target) return false;
            counter.target = value;
            if (counter.waiting) {
                if (!counter.armed) writeCounter(element, counter, value);
                return false;
            }
            if (A.motion.ok()) startCounter(element, counter, 0);
            else writeCounter(element, counter, value);
            return false;
        }

        counter = { target: value, shown: value, decimals: decimalsOf(raw), raf: 0, timer: 0, waiting: false, armed: false };
        counters.set(element, counter);
        writeCounter(element, counter, value);

        if (!A.motion.ok() || !counterObserver) return false;
        counter.waiting = true;                     // counts up when it scrolls into view
        armObserver.observe(element);
        counterObserver.observe(element);
        return true;
    }

    // New numbers inside the hero, which rises in with CSS: those that haven't
    // appeared yet drop to 0 now (nobody sees it) and count up when their turn comes.
    // All of them are checked first and changed after, so the browser only has
    // to bring the page up to date once.
    function registerCounters(elements) {
        const fresh = elements.filter(registerCounter);
        fresh.filter((element) => entranceWait(element) > 0).forEach((element) => {
            const counter = counters.get(element);
            counter.armed = true;
            counter.shown = 0;
            writeCounter(element, counter, 0);
        });
    }

    // The hero is on screen from the start, so it never waits for JavaScript:
    // index.html marks its blocks as "revealed" and css/effects.css lets them
    // rise in one after another from the very first frame.
    // How long until the part around this element starts to appear?
    // (0 when it can be seen already, or when it isn't part of such an entrance)
    function entranceWait(element) {
        const host = element.closest("[data-reveal].revealed");
        if (!host || revealTimes.has(host) || !host.getAnimations) return 0;
        let wait = 0;
        host.getAnimations({ subtree: true }).forEach((animation) => {
            const effect = animation.effect;
            const time = animation.currentTime;
            if (!effect || !effect.target || !effect.target.contains(element) || time === null) return;
            const delay = effect.getTiming().delay;
            if (time < delay) wait = Math.max(wait, delay - time);
        });
        return wait;
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
        if (!knownVisible && !onScreenNow.has(element)) return;
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
            if (entry.isIntersecting) {
                onScreenNow.add(element);
                startIfVisible(element, counter, false, true);
            } else {
                onScreenNow.delete(element);
            }
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
        return 150 + Math.max(wait, entranceWait(element));
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
        if (from === to || !A.motion.ok()) {
            counter.shown = to;
            writeCounter(element, counter, to);
            return;
        }

        const duration = A.util.clamp(700 + Math.abs(to - from) * 12, 900, 1800);
        counter.timer = setTimeout(() => {
            counter.timer = 0;
            const start = performance.now();
            const tick = (now) => {
                // (the frame time can be a hair earlier than "start", so keep it at 0 or more)
                const progress = A.util.clamp((now - start) / duration, 0, 1);
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
       8. TEXT DECODE ("SCRAMBLE")  [data-scramble] and .section-label
       Random letters (Latin + Cyrillic + symbols) settle into the
       real text, left to right. Runs on load, after a language
       change and (for [data-scramble]) when you hover it.
       ========================================================= */
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

    // A text came onto the screen (or left it). It decodes once a fifth of it can be seen.
    function onScrambleView(entries) {
        entries.forEach((entry) => {
            const element = entry.target;
            if (entry.isIntersecting) onScreenNow.add(element);
            else onScreenNow.delete(element);
            if (entry.isIntersecting && entry.intersectionRatio >= 0.2 && scramblePending.has(element) && hostShown(element)) {
                scramblePending.delete(element);
                scramble(element, 0);
            }
        });
    }

    function scrambleWithin(container, delay) {
        scramblePending.forEach((element) => {
            if (container.contains(element) && onScreenNow.has(element)) {
                scramblePending.delete(element);
                scramble(element, delay);
            }
        });
    }

    // Gives the element back its own size (and the rest of its look)
    function restoreSize(run) {
        if (run.lockedSize) {
            run.element.style.width = run.lockedSize.width;
            run.element.style.height = run.lockedSize.height;
            run.lockedSize = null;
        }
        run.element.classList.remove("fx-scrambling", "fx-scramble-clip", "fx-scramble-lock");
    }

    // Stops a running decode and puts the real text back
    function stopScramble(element) {
        const run = scrambleRuns.get(element);
        if (!run) return;
        clearTimeout(run.timer);
        cancelAnimationFrame(run.raf);
        if (run.visual && run.visual.parentNode === element) element.innerHTML = run.finalHTML;
        restoreSize(run);
        scrambleRuns.delete(element);
    }

    function stopAllScrambles() {
        Array.from(scrambleRuns.keys()).forEach(stopScramble);
    }

    function scramble(element, delay) {
        stopScramble(element);
        if (!A.motion.ok() || !element.isConnected) return;

        const run = { element: element, timer: 0, raf: 0, visual: null, finalHTML: "", lockedSize: null };
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

        // Everything is read before anything changes (one layout, not several)
        const style = getComputedStyle(element);
        const gradientText = /text/.test(style.backgroundClip + " " + style.webkitBackgroundClip);
        const width = style.width;                    // the real size, even while its card is still zooming in
        const height = style.height;
        const shortLine = style.display.indexOf("inline-") === 0 && element.getClientRects().length === 1;

        // Gradient text (background-clip: text) can't show see-through letters
        if (gradientText) element.classList.add("fx-scramble-clip");

        // The box keeps its exact size while the letters change, so nothing
        // around it moves (PERF-06). Short one-line texts also stay on one line.
        // (Plain inline text has no box size of its own: its size reads "auto".)
        run.lockedSize = { width: element.style.width, height: element.style.height };
        if (width.endsWith("px")) element.style.width = width;
        if (height.endsWith("px")) element.style.height = height;
        if (shortLine) element.classList.add("fx-scramble-lock");

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

        const duration = A.util.clamp(380 + letters.length * 32, 600, 1300);
        const start = performance.now();
        let noiseLetters = [];
        let lastShuffle = 0;

        const tick = (now) => {
            // Someone else changed the text meanwhile (e.g. a new language): stop quietly
            if (visual.parentNode !== element) {
                restoreSize(run);
                scrambleRuns.delete(element);
                return;
            }

            const progress = A.util.clamp((now - start) / duration, 0, 1);
            const done = Math.floor(A.util.clamp((progress - 0.15) / 0.85, 0, 1) * letters.length);

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
                restoreSize(run);
                scrambleRuns.delete(element);
            }
        };
        // The first random letters go in right away: an empty box, even for one frame, would blink
        tick(start);
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
       9. TYPEWRITER WORDS  [data-rotator="hero.rotator"]
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

        const rotator = { element: element, key: key, text: text, label: label, words: [], wordsKey: "", word: 0, letters: 0, deleting: false, timer: 0, visible: true, measureQueued: false, stopWatching: null };
        rotators.set(element, rotator);
        setRotatorWords(rotator);
        // Types only while it can be seen (on screen, and the browser tab is open)
        rotator.stopWatching = A.whenVisible(element, (visible) => {
            rotator.visible = visible;
            updateRotator(rotator);
        });
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
        const words = t(rotator.key).split("|").map((word) => word.trim()).filter(Boolean);
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
        if (A.motion.ok()) measureSoon(rotator);
        renderRotator(rotator);
        updateRotator(rotator);
    }

    // Measuring needs an up-to-date layout of the page. In the next frame,
    // every feature has finished changing the page (at start-up, or after a
    // language switch), so the browser lays it out once instead of twice.
    function measureSoon(rotator) {
        if (rotator.measureQueued) return;
        rotator.measureQueued = true;
        requestAnimationFrame(() => {
            rotator.measureQueued = false;
            if (A.motion.ok() && rotator.element.isConnected) measureRotator(rotator);
        });
    }

    // Reserve room for the longest word, so the line doesn't jump while typing.
    // Every word gets a hidden copy; all copies are added first and measured
    // together, so the browser lays out the page once, not once per word.
    function measureRotator(rotator) {
        const probes = rotator.words.map((word) => {
            const probe = document.createElement("span");
            probe.className = "fx-rotator-probe";
            probe.textContent = word;
            return probe;
        });
        rotator.element.append(...probes);
        const widest = Math.max(0, ...probes.map((probe) => probe.getBoundingClientRect().width));
        probes.forEach((probe) => probe.remove());

        const fontSize = parseFloat(getComputedStyle(rotator.element).fontSize) || 16;
        if (widest > 0) rotator.element.style.minWidth = (widest / fontSize + 0.35).toFixed(3) + "em";
        updateRotatorLine(rotator);
    }

    function renderRotator(rotator) {
        const letters = Array.from(rotator.words[rotator.word] || "");
        rotator.text.textContent = letters.slice(0, rotator.letters).join("") || "\u200B";   // an invisible character keeps the line height
    }

    function rotatorShouldRun(rotator) {
        return A.motion.ok() && rotator.visible && rotator.words[0] !== "";
    }

    function updateRotator(rotator) {
        if (!A.motion.ok()) {
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
            measureSoon(rotator);
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

    // Fonts arrive a little later and change the word widths
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => rotators.forEach(measureSoon));
    }

    /* =========================================================
       10. POINTER EFFECTS (a real mouse only)
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

    // The glare is a light layer added inside the card the first time you hover it:
    //   .fx-glare            fades in and out (on tilt cards: a soft light all over it)
    //     .fx-glare-ring     the card's border, cut out with a mask
    //       .fx-glare-spot   a light spot that follows the cursor along the border
    const glares = new WeakMap();                                          // card → { glare, spot, inset }

    function glareOf(host) {
        const record = glares.get(host);
        return record && record.glare.parentNode === host ? record : null;  // the card may have rebuilt its content
    }

    function createGlare(host) {
        const style = getComputedStyle(host);
        if (style.position === "static") host.style.position = "relative";

        const glare = document.createElement("span");
        glare.className = "fx-glare";
        glare.setAttribute("aria-hidden", "true");
        glare.innerHTML = '<span class="fx-glare-ring"><span class="fx-glare-spot"></span></span>';

        // Sit exactly on top of the card's border (unless the card clips its content:
        // then the glare sits inside the border, "inset" pixels from the card's edge)
        const border = parseFloat(style.borderTopWidth) || 0;
        let inset = border;
        if (border && style.overflow === "visible") {
            inset = 0;
            ["top", "right", "bottom", "left"].forEach((side) => {
                glare.style[side] = -border + "px";
            });
        }
        host.appendChild(glare);

        const record = { glare: glare, spot: glare.querySelector(".fx-glare-spot"), inset: inset };
        glares.set(host, record);
        return record;
    }

    function light(host) {
        litHost = host;
        litRect = null;
        const record = glareOf(host) || createGlare(host);
        record.glare.classList.toggle("fx-glare-full", host.hasAttribute("data-tilt"));
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

        const x = A.util.clamp((pointer.x - litRect.left) / litRect.width, 0, 1);
        const y = A.util.clamp((pointer.y - litRect.top) / litRect.height, 0, 1);

        // The light on the border moves with a transform: nothing is painted again
        const record = glareOf(host);
        if (record) {
            const left = x * (litRect.width - record.inset * 2);
            const top = y * (litRect.height - record.inset * 2);
            record.spot.style.transform = "translate(" + left.toFixed(1) + "px," + top.toFixed(1) + "px)";
        }

        if (host.hasAttribute("data-tilt")) {
            // Tilt cards are small: the cursor position goes on the card itself, for the
            // soft light of its glare and for the card's own styles (0% to 100%)
            host.style.setProperty("--fx-x", (x * 100).toFixed(1) + "%");
            host.style.setProperty("--fx-y", (y * 100).toFixed(1) + "%");

            // Small cards tilt more, big cards tilt less
            const maxTilt = A.util.clamp(2600 / litRect.width, 3, 9);
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
        host.style.transition = joinTransitions(memory.base, "transform 0.7s var(--ease)");     // the site's curve (style.css)
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
        button.style.setProperty("--fx-mx", A.util.clamp(dx * 0.2, -8, 8).toFixed(2) + "px");
        button.style.setProperty("--fx-my", A.util.clamp(dy * 0.28, -6, 6).toFixed(2) + "px");
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

    /* =========================================================
       11. RIPPLE when a button is pressed
       ========================================================= */
    // Only real controls ripple (a .chip can also be a plain label)
    function rippleTarget(event) {
        if (!(event.target instanceof Element)) return null;
        const element = event.target.closest(RIPPLE_SELECTOR);
        if (!element || element.disabled || element.getAttribute("aria-disabled") === "true") return null;
        return element.matches("button, a[href], [role='button'], label") ? element : null;
    }

    // The ripple needs its button to be "position: relative". We set that while
    // ripples play and put the button's own value back after the LAST one
    // (quick presses overlap: the second must not remember our "relative")
    const rippleHolds = new WeakMap();                                     // button → { position, count }

    function holdPosition(element) {
        let hold = rippleHolds.get(element);
        if (!hold) {
            hold = { position: element.style.position, count: 0 };
            if (getComputedStyle(element).position === "static") element.style.position = "relative";
            rippleHolds.set(element, hold);
        }
        hold.count++;
    }

    function releasePosition(element) {
        const hold = rippleHolds.get(element);
        if (!hold) return;
        hold.count--;
        if (hold.count > 0) return;
        element.style.position = hold.position;
        rippleHolds.delete(element);
    }

    function ripple(element, x, y) {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        holdPosition(element);

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
            releasePosition(element);
        }, 700);
    }

    document.addEventListener("pointerdown", (event) => {
        if (!A.motion.ok() || event.button > 0) return;
        const element = rippleTarget(event);
        if (element) ripple(element, event.clientX, event.clientY);
    }, { passive: true });

    // Keyboard presses (Enter / Space) ripple from the middle
    document.addEventListener("click", (event) => {
        if (event.detail !== 0 || !A.motion.ok()) return;
        const element = rippleTarget(event);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        ripple(element, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    /* =========================================================
       12. SECTION MINI-MAP (right edge, big screens only)
       One dot per page section (A.sections in core.js has their names).
       Core decides which section you are in, so the map always agrees
       with the menu bar: onPageScroll() passes its numbers on to us.
       ========================================================= */
    const rail = {
        nav: null,
        fill: null,
        percent: null,
        links: [],
        ids: [],                  // the section ids, in the order of the dots
        shown: true,              // false while the CSS hides the map (small screens, touch) or the tab is hidden
                                  // (true until the first check, so the map is right in the very first frame)
        info: null,               // core's last scroll numbers
        active: -1,
        scale: ""
    };

    function buildRail() {
        const sections = A.sections.filter((section) => document.getElementById(section.id));
        if (sections.length < 2) return;

        const nav = document.createElement("nav");
        nav.className = "fx-rail";
        nav.setAttribute("data-i18n-attr", "aria-label:effects.railLabel");
        nav.setAttribute("aria-label", t("effects.railLabel"));

        const track = document.createElement("span");
        track.className = "fx-rail-track";
        track.setAttribute("aria-hidden", "true");
        rail.fill = document.createElement("span");
        rail.fill.className = "fx-rail-fill";
        track.appendChild(rail.fill);

        const list = document.createElement("ol");
        list.className = "fx-rail-list";

        sections.forEach((section, index) => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.className = "fx-rail-link";
            link.href = "#" + section.id;
            link.innerHTML =
                '<span class="fx-rail-dot" aria-hidden="true"></span>' +
                '<span class="fx-rail-label">' +
                    '<span class="fx-rail-number" aria-hidden="true">' + String(index + 1).padStart(2, "0") + "</span>" +
                    '<span data-i18n="' + section.key + '"></span>' +
                "</span>";
            link.querySelector("[data-i18n]").textContent = t(section.key);
            item.appendChild(link);
            list.appendChild(item);
            rail.links.push(link);
            rail.ids.push(section.id);
        });

        // A tiny read-out of how much of the page you have scrolled
        rail.percent = document.createElement("span");
        rail.percent.className = "fx-rail-percent";
        rail.percent.setAttribute("aria-hidden", "true");
        rail.percent.textContent = "0%";

        nav.append(track, list, rail.percent);
        document.body.appendChild(nav);
        rail.nav = nav;

        // css/effects.css decides where the map is shown. While it is hidden, it isn't updated;
        // when it appears, it catches up with the last numbers.
        A.whenVisible(nav, (visible) => {
            rail.shown = visible;
            if (visible && rail.info) updateRail(rail.info);
        });
    }

    function updateRail(info) {
        rail.info = info;
        if (!rail.nav || !rail.shown) return;

        // Only touch the page when something really changed
        const scale = "scaleY(" + info.fill.toFixed(4) + ")";
        if (scale !== rail.scale) {
            rail.scale = scale;
            rail.fill.style.transform = scale;
        }
        const percent = Math.round(info.progress * 100) + "%";
        if (rail.percent.textContent !== percent) rail.percent.textContent = percent;

        const active = Math.max(0, rail.ids.indexOf(info.section));
        if (active === rail.active) return;
        rail.active = active;
        rail.links.forEach((link, index) => {
            link.classList.toggle("is-passed", index < active);
            if (index === active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
        });
    }

    /* =========================================================
       13. CONFETTI (for big moments: every lesson done, a new best quiz score)
       AICompass.effects.confetti()                    two bursts from the bottom corners
       AICompass.effects.confetti({ origin: element }) one burst from the middle of an element
       Options: count (pieces), duration (ms). Nothing happens when animations are off.
       ========================================================= */
    let party = null;

    function stopConfetti() {
        if (!party) return;
        cancelAnimationFrame(party.frame);
        party.canvas.remove();
        party = null;
    }

    function confetti(options) {
        const settings = options || {};
        if (!A.motion.ok() || document.hidden) return;
        stopConfetti();

        const canvas = document.createElement("canvas");
        canvas.className = "fx-confetti";
        canvas.setAttribute("aria-hidden", "true");
        const width = window.innerWidth;
        const height = window.innerHeight;
        const context = A.canvas.fit(canvas, width, height);
        if (!context) return;
        document.body.appendChild(canvas);

        const colors = CONFETTI_COLORS.map((name) => A.cssVar(name)).filter(Boolean);
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
                color: colors[i % colors.length]
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
            context.globalAlpha = A.util.clamp((duration - age) / 700, 0, 1);

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
       14. FINDING ELEMENTS (now, and when other features add more later)
       ========================================================= */
    function scan(container) {
        findAll(container, "[data-reveal]").forEach(registerReveal);
        registerCounters(findAll(container, "[data-count]"));
        findAll(container, SCRAMBLE_SELECTOR).forEach(registerScramble);
        findAll(container, "[data-rotator]").forEach(registerRotator);
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
                rotator.stopWatching();
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
                if (record.attributeName === "data-count") registerCounters([element]);
                else if (record.attributeName === "data-reveal") registerReveal(element);
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
       15. LANGUAGE CHANGES
       Core has already put the new text in place; we decode it
       again and restart the typewriter with the new words.
       ========================================================= */
    A.onLanguageChange(() => {
        prune();

        // Texts on screen decode again. (The observer's last word is used:
        // measuring here would lay out the whole page in the middle of the switch.)
        const toDecode = [];
        scrambleTargets.forEach((element) => {
            stopScramble(element);
            if (!A.motion.ok()) return;
            scramblePending.add(element);
            if (hostShown(element) && onScreenNow.has(element)) {
                scramblePending.delete(element);
                toDecode.push(element);
            }
        });
        // They start once the new language has been drawn
        if (toDecode.length) requestAnimationFrame(() => toDecode.forEach((element) => scramble(element, 60)));

        rotators.forEach(setRotatorWords);

        // Decimal commas differ between languages
        counters.forEach((counter, element) => {
            if (!counter.raf && !counter.timer && !counter.waiting) writeCounter(element, counter, counter.target);
        });
    });

    /* =========================================================
       16. START
       ========================================================= */
    updateModeClasses();
    buildRail();
    scan(document.body);
    mutations.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-count", "data-reveal", "data-scramble"]
    });

    /* =========================================================
       17. CTRL+K COMMAND (CALM MODE) AND THE PUBLIC API
       Other features use AICompass.effects, for example:
           if (AICompass.effects) AICompass.effects.confetti();
       ========================================================= */
    A.registerCommand({
        id: "effects-calm",
        group: "cmd.groupActions",
        icon: "🧘",
        title: function () { return t(A.motion.calm ? "effects.calmOff" : "effects.calmOn"); },
        keywords: "calm motion animation animations effects pause reduce accessibility спокойный режим анимации анимация эффекты движение пауза",
        keepOverlays: true,
        run: function () {
            const calm = A.motion.toggleCalm();
            A.toast(t(calm ? "effects.toastCalmOn" : "effects.toastCalmOff"), calm ? "🧘" : "✨");
        }
    });

    A.feature("effects", {
        // true while calm mode is on (core keeps the setting: A.motion.calm)
        get calm() { return A.motion.calm; },
        // calm mode on (true) or off (false)
        setCalm: function (value) { A.motion.setCalm(value); },
        // looks for effects inside container (the whole page without one). Rarely
        // needed: new elements are found by themselves (section 14)
        refresh: function (container) { scan(container || document.body); },
        // shows a [data-reveal] element now, with its animation (the glossary uses it)
        reveal: function (element) { if (element) reveal(element, 0); },
        // decodes a text again
        scramble: function (element) { if (element) scramble(element, 0); },
        // confetti for big moments (lessons, quiz): see section 13
        confetti: confetti,
        stopConfetti: stopConfetti
    });

})();
