/* =========================================================
   AI COMPASS — TIMELINE ("A Short History of AI")
   This file builds:
   1. era filter chips (All, Early ideas, Ups & downs, ...)
      in a bar that sticks to the top while you read
   2. a vertical timeline: a glowing line fills up as you
      scroll, and every milestone lights up when the line
      reaches it
   3. "In the glossary" buttons that jump to the matching
      term in the glossary (js/glossary.js)
   All the texts are translations, so core.js switches the
   language by itself and nothing is lost.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="timeline"]');
    if (!A || !mount) return;

    const t = A.t;
    const esc = A.escapeHTML;

    // The line is "filled" up to this point of the screen (60% from the top)
    const READ_LINE = 0.6;
    const VIEW_MARGIN = "120px 0px";    // the line follows the scroll this close to the screen
    const GLIDE_SPEED = 10;             // how fast the fill catches up (higher = faster)
    const GLIDE_FIRST_STEP = 0.016;     // seconds: the first gliding step (one frame)
    const GLIDE_MAX_STEP = 0.05;        // seconds: the longest step (after a slow frame)
    const GLIDE_SNAP = 0.5;             // px: this close counts as "arrived"
    const BAR_GAP = 12;                 // px between the menu and the stuck bar (css/timeline.css)

    // ---------- 1. Eras and milestones ----------
    // key: the start of the translation keys ("timeline.e1.title", ...)
    // datetime: the year for the <time> element (empty if it is not one year)
    // terms: glossary terms to link to
    const ERAS = ["early", "ups", "deep", "gen"];

    const EVENTS = [
        { key: "e1", era: "early", icon: "🤔", datetime: "1950", terms: ["turing-test"] },
        { key: "e2", era: "early", icon: "🏫", datetime: "1956", terms: ["ai"] },
        { key: "e3", era: "early", icon: "🔗", datetime: "1958", terms: ["neuron"] },
        { key: "e4", era: "early", icon: "💬", datetime: "1966", terms: ["chatbot"] },
        { key: "e5", era: "ups", icon: "❄️", datetime: "", terms: [] },
        { key: "e6", era: "ups", icon: "♟️", datetime: "1997", terms: ["algorithm"] },
        { key: "e7", era: "ups", icon: "🎙️", datetime: "2011", terms: ["nlp"] },
        { key: "e8", era: "deep", icon: "🖼️", datetime: "2012", terms: ["deep-learning", "computer-vision"] },
        { key: "e9", era: "deep", icon: "🎨", datetime: "2014", terms: ["generative-ai", "deepfake"] },
        { key: "e10", era: "deep", icon: "⚫", datetime: "2016", terms: ["reinforcement"] },
        { key: "e11", era: "deep", icon: "⚡", datetime: "2017", terms: ["transformer"] },
        { key: "e12", era: "deep", icon: "🧬", datetime: "2020", terms: ["deep-learning"] },
        { key: "e13", era: "gen", icon: "🚀", datetime: "2022", terms: ["chatbot", "llm"] },
        { key: "e14", era: "gen", icon: "🏅", datetime: "2024", terms: ["neural-network"] },
        { key: "e15", era: "gen", icon: "📱", datetime: "", terms: ["bias", "privacy"], today: true }
    ];

    // Every text (English and Russian) is in js/content/timeline.js

    // ---------- 3. Small helpers ----------

    // A translated piece of text: <span class="..." data-i18n="key">text</span>.
    // data-i18n lets core.js re-translate it by itself.
    const text = A.i18nHTML;

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

    // ---------- 4. Building the page ----------
    function chipHTML(era) {
        const count = era === "all" ? EVENTS.length : EVENTS.filter(function (event) { return event.era === era; }).length;
        return '<button class="chip tl-chip" type="button" data-era="' + era + '" aria-pressed="' + (era === "all") + '">' +
            '<span class="tl-chip-dot" aria-hidden="true"></span>' +
            text("timeline.era." + era) +
            '<span class="tl-chip-count mono">' + count + "</span>" +
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

    mount.innerHTML =
        '<div class="tl">' +
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

    // Handy references
    const root = mount.querySelector(".tl");
    const bar = root.querySelector(".tl-bar");
    const filters = root.querySelector(".tl-filters");
    const live = root.querySelector(".tl-live");
    const wrap = root.querySelector(".tl-wrap");
    const line = root.querySelector(".tl-line");
    const fill = root.querySelector(".tl-fill");
    const head = root.querySelector(".tl-head");
    const hudYear = root.querySelector(".tl-hud-year");
    const hudCount = root.querySelector(".tl-hud-count");
    const sections = Array.prototype.slice.call(root.querySelectorAll(".tl-era"));
    const items = Array.prototype.slice.call(root.querySelectorAll(".tl-item")).map(function (element) {
        // on: the line has reached its dot (null: not known yet); visible: not filtered out
        return { el: element, node: element.querySelector(".tl-node"), key: element.getAttribute("data-key"), on: false, visible: true };
    });

    // ---------- 5. The line that fills as you scroll ----------
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
        const stacked = barHeight > firstChip.offsetHeight * 1.5 + 20;
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
            const on = node.y - layout.lineTop <= shown + 2;
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

    // Draws once in the next frame (after a change that is not a scroll)
    function redraw() {
        if (!frame) frame = requestAnimationFrame(nextStep);
    }

    A.onLayout(measure);
    A.onScroll(onScroll);

    // Only follow the scroll while the timeline is on (or near) the screen. Going off
    // screen (or to another browser tab) puts the line in place at once, so it is
    // right when you come back. Core reads the last report of the browser.
    A.whenVisible(wrap, function (visible) {
        inView = visible;
        if (!visible) jump = true;
        redraw();
    }, { rootMargin: VIEW_MARGIN });

    // The blinking HUD dot, the comet's ripple and the "today" ring pause while
    // the timeline is off screen (core sets data-paused, style.css pauses them)
    A.whenVisible(root, function () {}, { pauseAnimations: true });

    // ---------- 6. Era filter ----------
    let currentEra = "all";
    let filterToken = 0;
    let running = [];

    // Tells screen readers how many milestones are shown now
    function announce() {
        const count = EVENTS.filter(function (event) { return currentEra === "all" || event.era === currentEra; }).length;
        A.announce(A.plural("timeline.showing", count), { region: live });
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
            let space = A.layout.navHeight() + 24;
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
                            { duration: 520, delay: Math.min(index++, 8) * 70, easing: A.motion.ease, fill: "backwards" }
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
                    { duration: 240, easing: "ease-in", fill: "forwards" }
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

    filters.addEventListener("click", function (event) {
        const chip = event.target.closest(".tl-chip");
        if (chip) setEra(chip.getAttribute("data-era"));
    });

    // ---------- 7. Glossary buttons ----------
    root.addEventListener("click", function (event) {
        const button = event.target.closest(".tl-term");
        if (button && A.glossary) A.glossary.show(button.getAttribute("data-term"), { focus: true });
    });

    // Keyboard focus must never hide under the sticky bar. The CSS scroll-margin
    // helps when the browser scrolls by itself, but a button that is already on
    // screen is not scrolled at all, so we check where it ended up and move the page.
    function keepClearOfBar(element) {
        if (document.activeElement !== element) return;
        if (!layout || !layout.barSticky) return;
        const barBottom = bar.getBoundingClientRect().bottom;
        const top = element.getBoundingClientRect().top;
        if (top < barBottom + 8) {
            window.scrollBy({ top: top - barBottom - 16, behavior: A.motion.ok() ? "smooth" : "auto" });
        }
    }

    wrap.addEventListener("focusin", function (event) {
        const element = event.target;
        // Wait one frame, so the browser's own scrolling has happened first
        requestAnimationFrame(function () { keepClearOfBar(element); });
    });

    function updateTermButtons() {
        root.querySelectorAll(".tl-term").forEach(function (button) {
            const term = glossaryTerm(button.getAttribute("data-term"));
            if (!term) return;
            button.querySelector(".tl-term-name").textContent = term.term;
            button.setAttribute("aria-label", t("timeline.openTerm", { term: term.term }));
        });
    }

    // ---------- 8. Cards slide in from their own side on wide screens ----------
    // (the same 900px as the one-column layout in css/timeline.css)
    A.onMedia("(min-width: 900px)", function (matches) {
        wide = matches;
        root.classList.toggle("is-wide", matches);
    });

    // ---------- 9. Language changes ----------
    // core.js has already translated every [data-i18n] text; we only update our extras
    A.onLanguageChange(function () {
        updateTermButtons();
        // Quietly forget the last announcement (it was in the old language)
        A.announce("", { region: live, delay: 0 });
        // The read-out shows a year: the next drawing writes it in the new language
        drawn.hud = "";
        // The texts have new lengths: core measures (and draws) again in the next frame
        A.layoutChanged();
    });

    // Calm mode or the device's "reduce motion" setting changed
    A.motion.onChange(function () {
        jump = true;
        redraw();
    });

    // Core measures (and draws) once the page is laid out, again after web fonts
    // arrive and when the page has loaded.
})();
