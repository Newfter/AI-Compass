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

    // Picks the right plural form. English has two (1 milestone / 2 milestones),
    // Russian has three (1 событие / 2 события / 5 событий).
    function pluralForm(n) {
        if (A.lang !== "ru") return n === 1 ? "one" : "many";
        const lastDigit = n % 10;
        const lastTwo = n % 100;
        if (lastDigit === 1 && lastTwo !== 11) return "one";
        if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return "few";
        return "many";
    }

    // Animations are skipped when the device asks for less motion
    // or when "calm mode" (from effects.js) is on
    function motionOK() {
        return !A.reducedMotion && !document.documentElement.classList.contains("fx-calm");
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // A translated piece of text. data-i18n lets core.js re-translate it by itself.
    function text(key, className, tag) {
        tag = tag || "span";
        return "<" + tag + (className ? ' class="' + className + '"' : "") + ' data-i18n="' + key + '">' + t(key) + "</" + tag + ">";
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

    // The glossary (js/glossary.js) may be missing: then there are no term buttons
    function glossaryTerm(id) {
        return A.glossary && A.glossary.term ? A.glossary.term(id) : null;
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
        return { el: element, node: element.querySelector(".tl-node"), key: element.getAttribute("data-key"), on: false };
    });

    // ---------- 5. The line that fills as you scroll ----------
    let nodes = [];             // the visible milestones and where their dots are
    let lineTop = 0;            // where the line starts (the first dot)
    let lineLength = 0;         // from the first dot to the last one
    let shown = 0;              // how much of the line is filled now (px)
    let frame = 0;
    let lastTime = 0;
    let jump = true;            // the first frame jumps straight to the right place
    let inView = false;
    let hudText = "";

    // The filter bar sticks under the menu only while its chips fit in one row.
    // It also tells the CSS how much room focused buttons need above them.
    function measureBar() {
        const chip = filters.querySelector(".tl-chip");
        const twoRows = bar.offsetHeight > chip.offsetHeight * 1.5 + 20;
        root.classList.toggle("is-stacked", twoRows);
        const sticky = getComputedStyle(bar).position === "sticky";
        root.style.setProperty("--tl-bar-room", sticky ? bar.offsetHeight + 12 + "px" : "0px");
    }

    // Measures where every visible dot is (after a resize, a filter or a new language)
    function measure() {
        measureBar();
        nodes = items.filter(function (item) {
            return item.el.offsetParent !== null;
        }).map(function (item) {
            return { item: item, y: offsetWithin(item.node, wrap) + item.node.offsetHeight / 2 };
        });

        lineTop = nodes.length ? nodes[0].y : 0;
        lineLength = nodes.length ? nodes[nodes.length - 1].y - lineTop : 0;
        line.style.top = lineTop + "px";
        line.style.height = lineLength + "px";
        // Hidden milestones are switched off, and checked again when they come back
        items.forEach(function (item) {
            if (item.el.offsetParent === null) {
                item.on = null;
                item.el.classList.remove("is-reached");
            }
        });
        jump = true;
        requestUpdate();
    }

    function requestUpdate() {
        if (!frame) frame = requestAnimationFrame(update);
    }

    function update(now) {
        frame = 0;
        const top = wrap.getBoundingClientRect().top;
        const target = clamp(window.innerHeight * READ_LINE - top - lineTop, 0, lineLength);

        // The fill glides smoothly after the scroll position (unless motion is off)
        if (jump || !inView || !motionOK()) {
            shown = target;
        } else {
            const seconds = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
            shown += (target - shown) * (1 - Math.exp(-seconds * 10));
            if (Math.abs(target - shown) < 0.5) shown = target;
        }
        jump = false;
        lastTime = now;

        fill.style.transform = "scaleY(" + (lineLength > 0 ? shown / lineLength : 0).toFixed(4) + ")";
        head.style.transform = "translate3d(0, " + shown.toFixed(1) + "px, 0)";
        head.classList.toggle("is-end", lineLength > 0 && shown >= lineLength - 0.5);

        // Light up every dot the line has reached
        let reached = 0;
        let lastReached = null;
        nodes.forEach(function (node) {
            const on = node.y - lineTop <= shown + 2;
            if (on !== node.item.on) {
                node.item.on = on;
                node.item.el.classList.toggle("is-reached", on);
            }
            if (on) {
                reached++;
                lastReached = node.item;
            }
        });

        // The read-out in the bar (only written when it changes)
        const year = lastReached ? t("timeline." + lastReached.key + ".year") : "—";
        const count = String(reached).padStart(2, "0") + "/" + String(nodes.length).padStart(2, "0");
        if (year + count !== hudText) {
            hudText = year + count;
            hudYear.textContent = year;
            hudCount.textContent = count;
        }

        if (shown !== target) {
            frame = requestAnimationFrame(update);
        } else {
            lastTime = 0;
        }
    }

    // Only follow the scroll while the timeline is on (or near) the screen
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            inView = entries[0].isIntersecting;
            requestUpdate();
        }, { rootMargin: "120px 0px" }).observe(wrap);
    } else {
        inView = true;
    }

    window.addEventListener("scroll", function () {
        if (inView) requestUpdate();
    }, { passive: true });

    window.addEventListener("resize", measure);
    if ("ResizeObserver" in window) {
        let lastHeight = 0;
        new ResizeObserver(function () {
            const height = wrap.offsetHeight;
            if (height !== lastHeight) {
                lastHeight = height;
                measure();
            }
        }).observe(wrap);
    }

    // Coming back to the tab: catch up at once
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            jump = true;
            requestUpdate();
        }
    });

    // ---------- 6. Era filter ----------
    let currentEra = "all";
    let filterToken = 0;
    let running = [];

    // Browsers try to keep what you are looking at in place when content above it
    // changes ("scroll anchoring"). That would fight our own scrolling, so it is
    // switched off for a moment while milestones appear and disappear.
    function pauseScrollAnchoring() {
        const html = document.documentElement;
        html.style.overflowAnchor = "none";
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { html.style.overflowAnchor = ""; });
        });
    }

    // Tells screen readers how many milestones are shown now
    function announce() {
        const count = EVENTS.filter(function (event) { return currentEra === "all" || event.era === currentEra; }).length;
        live.textContent = t("timeline.showing." + pluralForm(count), { n: count });
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
            pauseScrollAnchoring();
            leaving.forEach(function (section) { section.hidden = true; });
            entering.forEach(function (section) { section.hidden = false; });

            // If you were reading further down, go back to the start of the timeline,
            // just under the bar (or under the menu, where the bar doesn't stick)
            const barStyle = getComputedStyle(bar);
            const space = barStyle.position === "sticky"
                ? parseFloat(barStyle.top) + bar.offsetHeight + 24
                : (parseFloat(A.cssVar("--nav-height")) || 76) + 24;
            const wrapTop = wrap.getBoundingClientRect().top;
            if (wrapTop < space) {
                window.scrollTo({
                    top: window.scrollY + wrapTop - space,
                    behavior: motionOK() ? "smooth" : "auto"
                });
            }

            measure();

            // The new milestones rise in one after another
            if (motionOK()) {
                let index = 0;
                entering.forEach(function (section) {
                    Array.prototype.forEach.call(section.querySelectorAll(".tl-era-head, .tl-item"), function (element) {
                        running.push(element.animate(
                            [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }],
                            { duration: 520, delay: Math.min(index++, 8) * 70, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
                        ));
                    });
                });
            }

            announce();
        }

        if (motionOK() && leaving.length) {
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
        if (getComputedStyle(bar).position !== "sticky") return;
        const barBottom = bar.getBoundingClientRect().bottom;
        const top = element.getBoundingClientRect().top;
        if (top < barBottom + 8) {
            window.scrollBy({ top: top - barBottom - 16, behavior: motionOK() ? "smooth" : "auto" });
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
    const wideQuery = window.matchMedia("(min-width: 900px)");

    function updateSides() {
        root.classList.toggle("is-wide", wideQuery.matches);
    }

    if (wideQuery.addEventListener) wideQuery.addEventListener("change", updateSides);
    else if (wideQuery.addListener) wideQuery.addListener(updateSides);

    // Measuring waits for the next frame: by then every feature has built its
    // part of the page, so the browser lays the page out only once
    let measureQueued = false;
    function measureSoon() {
        if (measureQueued) return;
        measureQueued = true;
        requestAnimationFrame(function () {
            measureQueued = false;
            measure();
        });
    }

    // ---------- 9. Language changes ----------
    // core.js has already translated every [data-i18n] text; we only update our extras
    A.onLanguageChange(function () {
        updateTermButtons();
        // Quietly forget the last announcement (it was in the old language)
        live.textContent = "";
        hudText = "";
        measureSoon();
    });

    // Calm mode (effects.js) switched on or off
    document.addEventListener("aic:effects", function () {
        jump = true;
        requestUpdate();
    });

    // ---------- 10. Start ----------
    updateSides();
    measureSoon();

    // Web fonts change the height of texts a little: measure again once they are ready
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener("load", measure);
})();
