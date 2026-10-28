/* =========================================================
   AI COMPASS — TIMELINE ("A Short History of AI")
   The milestones of AI, from 1950 to today:
   - era chips (All, Early ideas, Ups & downs, ...) in a bar that
     sticks under the menu while you read;
   - a glowing line that fills as you scroll; every milestone lights
     up when the line reaches it, and a small read-out in the bar
     shows the year and how many milestones you have passed;
   - "In the glossary" buttons that open the matching term in the
     glossary (js/glossary.js).
   The timeline sits far down the page, so it is only built when it
   comes near the screen (or when the browser has a quiet moment).
   Sections of this file:
    1. Settings
    2. Small helpers
    3. Building the timeline
    4. The line that fills as you scroll
    5. Era filter
    6. Glossary buttons and keyboard focus
    7. Language and motion changes
    8. Start
   The eras, the milestones and every text (English and Russian) are
   in js/content/timeline.js. The timeline has no API of its own; its
   term buttons use AICompass.glossary.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="timeline"]');
    const data = A && A.content.get("timeline");
    if (!A || !mount || !data) return;

    const t = A.t;
    const esc = A.escapeHTML;
    // A translated piece of text: <span class="..." data-i18n="key">text</span>.
    // data-i18n lets core.js re-translate it by itself.
    const text = A.i18nHTML;

    const ERAS = data.eras;         // ["early", "ups", "deep", "gen"]
    const EVENTS = data.events;     // { key, era, icon, datetime, terms, today }

    // ---------- 1. Settings ----------
    const READ_LINE = 0.6;              // the line is filled up to this point of the screen (60% down)
    const VIEW_MARGIN = "120px 0px";    // the line follows the scroll this close to the screen
    const GLIDE_SPEED = 10;             // how fast the fill catches up with the scroll (higher = faster)
    const GLIDE_FIRST_STEP = 0.016;     // seconds: the first gliding step (one frame)
    const GLIDE_MAX_STEP = 0.05;        // seconds: the longest step (after a slow frame)
    const GLIDE_SNAP = 0.5;             // px: this close to the scroll position counts as "arrived"
    const DOT_REACH = 2;                // px: a dot lights up this close to the end of the fill
    const WIDE_SCREEN = "(min-width: 900px)";  // two columns, and the bar may stick (css/timeline.css)
    const BAR_GAP = 12;                 // px between the menu and the stuck bar (css/timeline.css)
    const ONE_ROW_CHIPS = 1.5;          // the bar holds one row of chips while it is less than 1.5 chips
    const ONE_ROW_PADDING = 20;         // ...plus this (px) tall
    const FILTER_SPACE = 24;            // px left above the timeline when a filter scrolls back up
    const FOCUS_GAP = 8;                // px: a focused button closer than this to the stuck bar...
    const FOCUS_SPACE = 16;             // ...is scrolled to this far below it
    const FADE_OUT_MS = 240;            // a new era filter: the old milestones fade out,
    const RISE_IN_MS = 520;             // then the new ones rise in
    const RISE_STAGGER_MS = 70;         // one after another (this much later each)
    const RISE_STAGGER_MAX = 8;         // but never more than 8 steps later

    // ---------- 2. Small helpers ----------

    // How many milestones an era has ("all": every one)
    function countIn(era) {
        return EVENTS.filter(function (event) { return era === "all" || event.era === era; }).length;
    }

    // Distance from the top of an ancestor, ignoring animations (transforms)
    function offsetWithin(element, ancestor) {
        let y = 0;
        while (element && element !== ancestor) {
            y += element.offsetTop;
            element = element.offsetParent;
        }
        return y;
    }

    // A term of the glossary: { id, term (its name), definition, ... } or null.
    // js/glossary.js loads before this file and publishes AICompass.glossary at once
    // (before it builds its own part of the page). Without it there are no term buttons.
    function glossaryTerm(id) {
        return A.glossary ? A.glossary.term(id) : null;
    }

    // ---------- 3. Building the timeline ----------
    function chipHTML(era) {
        return '<button class="chip tl-chip ui-chip" type="button" data-era="' + era + '" aria-pressed="' + (era === "all") + '">' +
            '<span class="tl-chip-dot ui-chip-dot" aria-hidden="true"></span>' +
            text("timeline.era." + era) +
            '<span class="tl-chip-count ui-chip-count mono">' + countIn(era) + "</span>" +
        "</button>";
    }

    function termsHTML(event) {
        const terms = event.terms.filter(glossaryTerm);
        if (!terms.length) return "";
        return '<div class="tl-terms">' +
            '<span class="tl-terms-label mono"><span aria-hidden="true">📖</span> ' + text("timeline.inGlossary") + "</span>" +
            terms.map(function (id) {
                const term = glossaryTerm(id);
                return '<button class="chip tl-term" type="button" data-term="' + id + '" aria-label="' + esc(t("timeline.openTerm", { term: term.term })) + '">' +
                    '<span class="tl-term-name">' + esc(term.term) + "</span>" +
                    '<span class="tl-term-arrow" aria-hidden="true">↗</span>' +
                "</button>";
            }).join("") +
        "</div>";
    }

    // One milestone: its dot on the line, a big "ghost" year, and its card.
    // On wide screens the cards take turns on the left and on the right.
    function eventHTML(event, index) {
        const side = index % 2 === 0 ? "left" : "right";
        const k = "timeline." + event.key + ".";
        const yearTag = event.datetime ? 'time datetime="' + event.datetime + '"' : "span";
        const yearEnd = event.datetime ? "time" : "span";

        return '<li class="tl-item is-' + side + (event.today ? " is-today" : "") + '" data-key="' + event.key + '" data-reveal="fade">' +
            '<div class="tl-node" aria-hidden="true"><span class="tl-node-icon">' + event.icon + "</span></div>" +
            '<p class="tl-ghost" aria-hidden="true" data-i18n="' + k + 'year">' + t(k + "year") + "</p>" +
            '<article class="tl-card card" aria-labelledby="tl-title-' + event.key + '">' +
                '<div class="tl-meta">' +
                    "<" + yearTag + ' class="tl-year mono" data-scramble data-i18n="' + k + 'year">' + t(k + "year") + "</" + yearEnd + ">" +
                    text("timeline.era." + event.era, "tl-era-tag mono") +
                "</div>" +
                '<h4 class="tl-title" id="tl-title-' + event.key + '" data-i18n="' + k + 'title">' + t(k + "title") + "</h4>" +
                text(k + "text", "tl-text", "p") +
                '<div class="tl-why">' +
                    '<p class="tl-why-label mono"><span aria-hidden="true">✦</span> ' + text(event.today ? "timeline.whyNow" : "timeline.why") + "</p>" +
                    text(k + "why", "tl-why-text", "p") +
                "</div>" +
                termsHTML(event) +
            "</article>" +
        "</li>";
    }

    function eraHTML(era) {
        const k = "timeline.era." + era;
        return '<section class="tl-era" data-era="' + era + '" aria-labelledby="tl-era-' + era + '">' +
            '<header class="tl-era-head" data-reveal="zoom">' +
                text(k + ".num", "tl-era-num mono") +
                '<h3 class="tl-era-title" id="tl-era-' + era + '" data-i18n="' + k + '">' + t(k) + "</h3>" +
                text(k + ".range", "tl-era-range mono") +
                text(k + ".desc", "tl-era-desc", "p") +
            "</header>" +
            '<ol class="tl-list">' +
                EVENTS.map(function (event, index) {
                    return event.era === era ? eventHTML(event, index) : "";
                }).join("") +
            "</ol>" +
        "</section>";
    }

    function timelineHTML() {
        return '<div class="tl">' +
            '<div class="tl-bar">' +
                '<div class="tl-filters" role="group" data-i18n-attr="aria-label:timeline.filterLabel" aria-label="' + esc(t("timeline.filterLabel")) + '">' +
                    ["all"].concat(ERAS).map(chipHTML).join("") +
                "</div>" +
                // A small read-out: the year the line has reached, and how many milestones
                '<div class="tl-hud" aria-hidden="true">' +
                    '<span class="tl-hud-dot"></span>' +
                    '<span class="tl-hud-year">—</span>' +
                    '<span class="tl-hud-count mono">00/' + EVENTS.length + "</span>" +
                "</div>" +
            "</div>" +
            '<p class="sr-only tl-live" aria-live="polite" aria-atomic="true"></p>' +

            '<div class="tl-wrap">' +
                '<div class="tl-line" aria-hidden="true">' +
                    '<span class="tl-fill"></span>' +
                    '<span class="tl-head"></span>' +
                "</div>" +
                ERAS.map(eraHTML).join("") +
            "</div>" +
        "</div>";
    }

    // The parts of the timeline the code below works with (set by build())
    let root = null;            // .tl, everything
    let bar = null;             // the bar with the chips and the read-out
    let filters = null;         // the chips
    let live = null;            // the screen reader announcement
    let wrap = null;            // the line and the eras
    let line = null;            // the line, with its fill and its bright "comet" head
    let fill = null;
    let head = null;
    let hudYear = null;         // the read-out: the year...
    let hudCount = null;        // ...and "06/15"
    let sections = [];          // the eras (<section class="tl-era">)
    let items = [];             // the milestones: { el, node, key, on, visible }

    // Builds the timeline and starts everything that follows it
    function build() {
        mount.innerHTML = timelineHTML();

        root = mount.querySelector(".tl");
        bar = root.querySelector(".tl-bar");
        filters = root.querySelector(".tl-filters");
        live = root.querySelector(".tl-live");
        wrap = root.querySelector(".tl-wrap");
        line = root.querySelector(".tl-line");
        fill = root.querySelector(".tl-fill");
        head = root.querySelector(".tl-head");
        hudYear = root.querySelector(".tl-hud-year");
        hudCount = root.querySelector(".tl-hud-count");
        sections = Array.prototype.slice.call(root.querySelectorAll(".tl-era"));
        items = Array.prototype.slice.call(root.querySelectorAll(".tl-item")).map(function (element) {
            // on: the line has reached its dot (null while filtered out: checked again when
            // it comes back); visible: not filtered out
            return { el: element, node: element.querySelector(".tl-node"), key: element.getAttribute("data-key"), on: false, visible: true };
        });

        filters.addEventListener("click", onChipClick);
        root.addEventListener("click", onTermClick);
        wrap.addEventListener("focusin", onFocusIn);

        // Wide screens: two columns, cards slide in from their own side
        A.onMedia(WIDE_SCREEN, function (matches) {
            wide = matches;
            root.classList.toggle("is-wide", matches);
        });

        // The line: measured after size changes, drawn while the page scrolls (section 4)
        A.onLayout(measure);
        A.onScroll(onScroll);
        A.whenVisible(wrap, onVisible, { rootMargin: VIEW_MARGIN });

        // The blinking read-out dot, the comet's ripple and the "today" ring pause
        // while the timeline is off screen (core sets data-paused, style.css pauses them)
        A.whenVisible(root, function () {}, { pauseAnimations: true });

        A.onLanguageChange(onLanguageChange);
        A.motion.onChange(onMotionChange);
    }

    // ---------- 4. The line that fills as you scroll ----------
    // Core does the page's scroll work once per frame, in two phases (js/core.js):
    //   measure()   A.onLayout, only after the page changed size (a new window size,
    //               a filter, a new language, web fonts...). It only READS the page:
    //               where the timeline is and where every visible dot sits.
    //   onScroll()  A.onScroll, every frame the page scrolls. It only WRITES, from the
    //               saved numbers and core's scroll position (info.y), and reads nothing.
    // Reading and writing in separate phases lets the browser lay the page out once
    // per frame, instead of once for every feature that looks at the page.
    let layout = null;          // what measure() found: see measure()
    let layoutKey = "";         // the positions of the dots as text, to notice a change
    let layoutWritten = true;   // false: the line's new size and classes still need writing
    let scroll = null;          // core's latest scroll numbers ({ y, viewport, ... })
    let inView = false;         // the timeline is on (or near) the screen
    let wide = false;           // a wide screen (two columns; the bar may stick)
    let shown = 0;              // how much of the line is filled now (px)
    let target = 0;             // how much of it should be filled (px)
    let jump = true;            // go straight to the target, without gliding
    let lastTime = 0;           // when the line last moved (for gliding)
    let frame = 0;              // the next gliding step
    const drawn = { fill: "", head: "", end: null, hud: "" };  // what is on screen now

    // Reads where everything is. Runs in core's "read" phase: no writing here.
    function measure() {
        const barHeight = bar.offsetHeight;
        const firstChip = filters.firstElementChild;
        // The bar sticks under the menu only while its chips fit in one row
        const stacked = barHeight > firstChip.offsetHeight * ONE_ROW_CHIPS + ONE_ROW_PADDING;
        const nodes = [];
        items.forEach(function (item) {
            item.visible = item.el.offsetParent !== null;     // false: filtered out
            if (item.visible) nodes.push({ item: item, y: offsetWithin(item.node, wrap) + item.node.offsetHeight / 2 });
        });
        const lineTop = nodes.length ? nodes[0].y : 0;

        layout = {
            wrapTop: wrap.getBoundingClientRect().top + window.scrollY,    // on the page
            lineTop: lineTop,                                               // in the wrap
            lineLength: nodes.length ? nodes[nodes.length - 1].y - lineTop : 0,
            nodes: nodes,
            stacked: stacked,
            barSticky: wide && !stacked,
            barHeight: barHeight
        };

        // Only a real change of the dots makes the line jump (and gets written)
        const key = [barHeight, stacked, wide].concat(nodes.map(function (node) { return node.y; })).join(",");
        if (key !== layoutKey) {
            layoutKey = key;
            layoutWritten = false;
            jump = true;
            // Another script may be halfway through a change right now (an effect that
            // empties a text and refills it in its own next step, before anything is
            // drawn). So after every change, look once more in the next frame: the
            // line always ends up on what is really on the screen.
            A.layoutChanged();
        }
    }

    // Writes what measure() found (once per change, in core's "write" phase)
    function writeLayout() {
        layoutWritten = true;
        line.style.top = layout.lineTop + "px";
        line.style.height = layout.lineLength + "px";
        root.classList.toggle("is-stacked", layout.stacked);
        // How much room focused buttons need above them (see css/timeline.css)
        root.style.setProperty("--tl-bar-room", layout.barSticky ? layout.barHeight + BAR_GAP + "px" : "0px");
        // Hidden milestones are switched off, and checked again when they come back
        items.forEach(function (item) {
            if (!item.visible && item.on !== null) {
                item.on = null;
                item.el.classList.remove("is-reached");
            }
        });
    }

    // Core calls this once per frame while the page scrolls (and after measure())
    function onScroll(info) {
        scroll = info;
        const fresh = !layoutWritten;
        if (fresh) writeLayout();
        // While the line glides, its own next step draws it, with these numbers
        if ((inView || jump) && (fresh || !frame)) follow(performance.now());
    }

    // The timeline came on or near the screen, or went away (also: another browser tab)
    function onVisible(visible) {
        inView = visible;
        // Going away puts the line in place at once, so it is right when you come back
        if (!visible) jump = true;
        redraw();
    }

    // Moves the line towards the scroll position (now: the time in ms)
    function follow(now) {
        if (!layout || !scroll) return;
        // How far down the timeline the "reading line" (READ_LINE of the screen) is
        const readLine = scroll.y + scroll.viewport * READ_LINE;
        target = A.util.clamp(readLine - layout.wrapTop - layout.lineTop, 0, layout.lineLength);

        // The fill glides smoothly after the scroll position (unless motion is off)
        if (jump || !inView || !A.motion.ok()) {
            shown = target;
        } else {
            const seconds = lastTime ? A.util.clamp((now - lastTime) / 1000, 0, GLIDE_MAX_STEP) : GLIDE_FIRST_STEP;
            shown += (target - shown) * (1 - Math.exp(-seconds * GLIDE_SPEED));
            if (Math.abs(target - shown) < GLIDE_SNAP) shown = target;
        }
        jump = false;
        lastTime = now;
        draw();

        if (shown === target) {
            lastTime = 0;
        } else if (!frame) {
            frame = requestAnimationFrame(nextStep);
        }
    }

    function nextStep(now) {
        frame = 0;
        follow(now);
    }

    // Draws once in the next frame (after a change that is not a scroll)
    function redraw() {
        if (!frame) frame = requestAnimationFrame(nextStep);
    }

    // Draws the line, the dots and the read-out (only what changed)
    function draw() {
        const length = layout.lineLength;
        const fillTransform = "scaleY(" + (length > 0 ? shown / length : 0).toFixed(4) + ")";
        const headTransform = "translate3d(0, " + shown.toFixed(1) + "px, 0)";
        const atEnd = length > 0 && shown >= length - 0.5;
        if (fillTransform !== drawn.fill) {
            drawn.fill = fillTransform;
            fill.style.transform = fillTransform;
        }
        if (headTransform !== drawn.head) {
            drawn.head = headTransform;
            head.style.transform = headTransform;
        }
        // At the very end the comet rests on the last dot
        if (atEnd !== drawn.end) {
            drawn.end = atEnd;
            head.classList.toggle("is-end", atEnd);
        }

        // Light up every dot the line has reached
        let reached = 0;
        let lastReached = null;
        layout.nodes.forEach(function (node) {
            const on = node.y - layout.lineTop <= shown + DOT_REACH;
            if (on !== node.item.on) {
                node.item.on = on;
                node.item.el.classList.toggle("is-reached", on);
            }
            if (on) {
                reached++;
                lastReached = node.item;
            }
        });

        // The read-out in the bar: the year the line has reached, and how many milestones
        const year = lastReached ? t("timeline." + lastReached.key + ".year") : "—";
        const count = String(reached).padStart(2, "0") + "/" + String(layout.nodes.length).padStart(2, "0");
        if (year + count !== drawn.hud) {
            drawn.hud = year + count;
            hudYear.textContent = year;
            hudCount.textContent = count;
        }
    }

    // ---------- 5. Era filter ----------
    let currentEra = "all";
    let filterToken = 0;        // a newer click makes older animations give up
    let running = [];           // the filter's animations that are still running

    function onChipClick(event) {
        const chip = event.target.closest(".tl-chip");
        if (chip) setEra(chip.getAttribute("data-era"));
    }

    // Tells screen readers how many milestones are shown now
    function announce() {
        A.announce(A.plural("timeline.showing", countIn(currentEra)), { region: live });
    }

    function showsEra(section, era) {
        return era === "all" || section.getAttribute("data-era") === era;
    }

    function setEra(era) {
        if (era === currentEra) return;
        currentEra = era;
        const token = ++filterToken;

        filters.querySelectorAll(".tl-chip").forEach(function (chip) {
            chip.setAttribute("aria-pressed", String(chip.getAttribute("data-era") === era));
        });

        // Stop animations from a previous click
        running.forEach(function (animation) { animation.cancel(); });
        running = [];

        const leaving = sections.filter(function (section) { return !section.hidden && !showsEra(section, era); });
        const entering = sections.filter(function (section) { return section.hidden && showsEra(section, era); });

        function swap() {
            if (token !== filterToken) return;
            // The room to leave above the timeline: under the bar, or under the menu
            // where the bar doesn't stick
            let space = A.layout.navHeight() + FILTER_SPACE;
            if (layout && layout.barSticky) space += BAR_GAP + layout.barHeight;

            A.dom.pauseScrollAnchoring();
            leaving.forEach(function (section) { section.hidden = true; });
            entering.forEach(function (section) { section.hidden = false; });

            // If you were reading further down, go back to the start of the timeline.
            // (Read after the change: the first era's margin can move the timeline.)
            const wrapTop = wrap.getBoundingClientRect().top;
            if (wrapTop < space) {
                window.scrollTo({ top: window.scrollY + wrapTop - space, behavior: A.motion.ok() ? "smooth" : "auto" });
            }
            // The dots moved: core measures again in the next frame
            A.layoutChanged();

            // The new milestones rise in one after another
            if (A.motion.ok()) {
                let index = 0;
                entering.forEach(function (section) {
                    Array.prototype.forEach.call(section.querySelectorAll(".tl-era-head, .tl-item"), function (element) {
                        running.push(element.animate(
                            [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }],
                            { duration: RISE_IN_MS, delay: Math.min(index++, RISE_STAGGER_MAX) * RISE_STAGGER_MS, easing: A.motion.ease, fill: "backwards" }
                        ));
                    });
                });
            }

            announce();
        }

        if (A.motion.ok() && leaving.length) {
            // Old milestones fade away first, then the new ones come in
            const fades = leaving.map(function (section) {
                return section.animate(
                    [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-14px) scale(0.98)" }],
                    { duration: FADE_OUT_MS, easing: "ease-in", fill: "forwards" }
                );
            });
            running = fades.slice();
            Promise.all(fades.map(function (animation) { return animation.finished; })).then(function () {
                if (token !== filterToken) return;
                swap();
                fades.forEach(function (animation) { animation.cancel(); });
            }).catch(function () {
                // Cancelled by a newer click: that click takes over
            });
        } else {
            swap();
        }
    }

    // ---------- 6. Glossary buttons and keyboard focus ----------
    // "In the glossary" buttons open the term there (the glossary scrolls to it)
    function onTermClick(event) {
        const button = event.target.closest(".tl-term");
        if (button && A.glossary) A.glossary.show(button.getAttribute("data-term"), { focus: true });
    }

    // Keyboard focus must never hide under the sticky bar. The CSS scroll-margin
    // helps when the browser scrolls by itself, but a button that is already on
    // screen is not scrolled at all, so we check where it ended up and move the page.
    function keepClearOfBar(element) {
        if (document.activeElement !== element) return;
        if (!layout || !layout.barSticky) return;
        const barBottom = bar.getBoundingClientRect().bottom;
        const top = element.getBoundingClientRect().top;
        if (top < barBottom + FOCUS_GAP) {
            window.scrollBy({ top: top - barBottom - FOCUS_SPACE, behavior: A.motion.ok() ? "smooth" : "auto" });
        }
    }

    function onFocusIn(event) {
        const element = event.target;
        // Wait one frame, so the browser's own scrolling has happened first
        requestAnimationFrame(function () { keepClearOfBar(element); });
    }

    // The term names come from the glossary, in the current language
    function updateTermButtons() {
        root.querySelectorAll(".tl-term").forEach(function (button) {
            const term = glossaryTerm(button.getAttribute("data-term"));
            if (!term) return;
            button.querySelector(".tl-term-name").textContent = term.term;
            button.setAttribute("aria-label", t("timeline.openTerm", { term: term.term }));
        });
    }

    // ---------- 7. Language and motion changes ----------
    // core.js has already translated every [data-i18n] text; we only update our extras
    function onLanguageChange() {
        updateTermButtons();
        // Quietly forget the last announcement (it was in the old language)
        A.announce("", { region: live, delay: 0 });
        // The read-out shows a year: the next drawing writes it in the new language
        drawn.hud = "";
        // The texts have new lengths: core measures (and draws) again in the next frame
        A.layoutChanged();
    }

    // Calm mode or the device's "reduce motion" setting changed
    function onMotionChange() {
        jump = true;
        redraw();
    }

    // ---------- 8. Start ----------
    // Built when it comes near the screen, when the browser has a quiet moment after
    // the page loaded, or at once for a link to a place in the page (#timeline).
    // css/timeline.css keeps its room meanwhile, so nothing below it jumps.
    A.whenNeeded(mount, build);
})();
