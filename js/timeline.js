/* =========================================================
   AI COMPASS — TIMELINE ("A Short History of AI")
   About 30 milestones of AI, from 1950 to today:
   - era chips (All, Early ideas, Ups & downs, ...) in a bar that
     sticks under the menu while you read; each chip fills up as the
     line passes the milestones of its era;
   - theme chips (Learning, Games, Language, ...) with counts; the
     two filters work together;
   - a glowing line that fills as you scroll; every milestone lights
     up when the line reaches it, and a small read-out in the bar
     shows the year and how many milestones you have passed;
   - every era shows its main milestones in full; the others start
     folded (year and title) and open with a click, one by one or
     all of an era at once ("Open all 4");
   - "Why it mattered", links to the lesson and the lab experiment
     that teach the idea, and "In the glossary" buttons.
   The timeline sits far down the page, so it is only built when it
   comes near the screen (or when the browser has a quiet moment).
   Sections of this file:
    1. Settings
    2. Small helpers
    3. Building the timeline
    4. The line that fills as you scroll
    5. Filters: eras and themes
    6. Folded milestones
    7. Links, glossary buttons and keyboard focus
    8. Showing one milestone (for the site search)
    9. Language and motion changes
   10. Start, and AICompass.timeline
   The eras, the themes, the milestones and every text (English and
   Russian) are in js/content/timeline.js.
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
    const THEMES = data.themes;     // [{ id, icon }]
    const EVENTS = data.events;     // [{ key, era, icon, datetime, major, themes, terms, lesson, lab, today }]
    const BY_KEY = new Map(EVENTS.map(function (event) { return [event.key, event]; }));

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
    const FADE_OUT_MS = 240;            // a new filter: the milestones that go fade out,
    const RISE_IN_MS = 520;             // then the new ones rise in
    const RISE_STAGGER_MS = 70;         // one after another (this much later each)
    const RISE_STAGGER_MAX = 8;         // but never more than 8 steps later
    const OPEN_MS = 320;                // a folded milestone opens: its text fades in this fast
    const OPEN_ALL_MIN = 2;             // an era gets "Open all" from 2 folded milestones (one opens by itself)
    const CARD_SPACE = 16;              // px: a milestone we scroll to stays at least this far below the bar
    const SPOTLIGHT_MS = 2600;          // ms: how long a shown milestone glows (the CSS animation takes 2.4 s)
    const FOCUS_DELAY = 80;             // ms: a shown milestone takes the focus this much later (the palette closes first)

    // ---------- 2. Small helpers ----------
    // The filters: an era ("all" or an era id) and a theme ("all" or a theme id)
    const filter = { era: "all", theme: "all" };

    function inFilter(event, era, theme) {
        return (era === "all" || event.era === era) && (theme === "all" || event.themes.indexOf(theme) !== -1);
    }

    function shownNow(event) {
        return inFilter(event, filter.era, filter.theme);
    }

    // How many milestones a filter shows
    function countIn(era, theme) {
        return EVENTS.filter(function (event) { return inFilter(event, era, theme); }).length;
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

    // The title of a lesson, or "" when the site doesn't have that lesson (yet)
    function lessonTitle(number) {
        return A.lessons && typeof A.lessons.title === "function" ? A.lessons.title(number) : "";
    }

    function lessonLabel(number) {
        return t("timeline.lessonLink", { n: A.format.number(number), title: lessonTitle(number) });
    }

    // An AI Lab experiment: { title, href } or null when the lab doesn't have it.
    // The lab with many experiments lists them (AICompass.lab.list); the first lab had
    // only two, "classifier" and "predictor", and no list (then the link has no title).
    function labExperiment(id) {
        if (!A.lab || typeof A.lab.open !== "function") return null;
        if (typeof A.lab.list === "function") {
            const found = A.lab.list().filter(function (experiment) { return experiment.id === id; })[0];
            return found ? { title: t(found.titleKey), href: "#lab/" + id } : null;
        }
        return id === "classifier" || id === "predictor" ? { title: "", href: "#lab" } : null;
    }

    function labLabel(id) {
        const experiment = labExperiment(id);
        return experiment && experiment.title ? t("timeline.labLink", { title: experiment.title }) : t("timeline.labLinkPlain");
    }

    // ---------- 3. Building the timeline ----------
    function chipHTML(era) {
        return '<button class="chip tl-chip ui-chip" type="button" data-era="' + era + '" aria-pressed="' + (era === "all") + '">' +
            '<span class="tl-chip-dot ui-chip-dot" aria-hidden="true"></span>' +
            text("timeline.era." + era) +
            '<span class="tl-chip-count ui-chip-count mono">' + A.format.number(countIn(era, "all")) + "</span>" +
        "</button>";
    }

    // A theme chip (theme null: "All themes")
    function themeChipHTML(theme) {
        const id = theme ? theme.id : "all";
        return '<button class="chip tl-theme ui-chip" type="button" data-tl-theme="' + id + '" aria-pressed="' + (id === "all") + '">' +
            (theme ? '<span class="tl-theme-icon" aria-hidden="true">' + theme.icon + "</span>" : "") +
            text("timeline.theme." + id) +
            '<span class="tl-theme-count ui-chip-count mono">' + A.format.number(countIn("all", id)) + "</span>" +
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

    // "Learn more": the lesson and the lab experiment that teach the idea (only the
    // ones the site has). Real links (#lesson-3, #lab/vision), opened by those features.
    function linksHTML(event) {
        const links = [];
        if (event.lesson && lessonTitle(event.lesson)) {
            links.push('<a class="tl-link" href="#lesson-' + event.lesson + '" data-lesson="' + event.lesson + '">' +
                '<span class="tl-link-icon" aria-hidden="true">📘</span>' +
                '<span class="tl-link-text">' + esc(lessonLabel(event.lesson)) + "</span>" +
            "</a>");
        }
        const experiment = event.lab && labExperiment(event.lab);
        if (experiment) {
            links.push('<a class="tl-link" href="' + experiment.href + '" data-lab="' + event.lab + '">' +
                '<span class="tl-link-icon" aria-hidden="true">🧪</span>' +
                '<span class="tl-link-text">' + esc(labLabel(event.lab)) + "</span>" +
            "</a>");
        }
        if (!links.length) return "";
        return '<div class="tl-links">' +
            text("timeline.learnMore", "tl-links-label mono") +
            links.join("") +
        "</div>";
    }

    // One milestone: its dot on the line, a big "ghost" year, and its card.
    // On wide screens the cards take turns on the left and on the right.
    // A main milestone shows everything; the others start folded: the year and a
    // title that is a button, which opens the rest.
    function eventHTML(event, index) {
        const side = index % 2 === 0 ? "left" : "right";
        const k = "timeline." + event.key + ".";
        const yearTag = event.datetime ? 'time datetime="' + event.datetime + '"' : "span";
        const yearEnd = event.datetime ? "time" : "span";
        const titleId = "tl-title-" + event.key;
        const bodyId = "tl-body-" + event.key;

        const title = event.major
            ? '<h4 class="tl-title" id="' + titleId + '" data-i18n="' + k + 'title">' + t(k + "title") + "</h4>"
            : '<h4 class="tl-title" id="' + titleId + '">' +
                '<button class="tl-fold" type="button" aria-expanded="false" aria-controls="' + bodyId + '">' +
                    text(k + "title", "tl-fold-text") +
                    '<span class="tl-fold-icon" aria-hidden="true"></span>' +
                "</button>" +
            "</h4>";

        return '<li class="tl-item is-' + side + (event.major ? " is-major" : " is-minor is-folded") + (event.today ? " is-today" : "") + '" data-key="' + event.key + '" data-reveal="fade">' +
            '<div class="tl-node" aria-hidden="true"><span class="tl-node-icon">' + event.icon + "</span></div>" +
            '<p class="tl-ghost" aria-hidden="true" data-i18n="' + k + 'year">' + t(k + "year") + "</p>" +
            '<article class="tl-card card" aria-labelledby="' + titleId + '">' +
                '<div class="tl-meta">' +
                    "<" + yearTag + ' class="tl-year mono" data-scramble data-i18n="' + k + 'year">' + t(k + "year") + "</" + yearEnd + ">" +
                    text("timeline.era." + event.era, "tl-era-tag mono") +
                "</div>" +
                title +
                '<div class="tl-body" id="' + bodyId + '"' + (event.major ? "" : " hidden") + ">" +
                    text(k + "text", "tl-text", "p") +
                    '<div class="tl-why">' +
                        '<p class="tl-why-label mono"><span aria-hidden="true">✦</span> ' + text(event.today ? "timeline.whyNow" : "timeline.why") + "</p>" +
                        text(k + "why", "tl-why-text", "p") +
                    "</div>" +
                    linksHTML(event) +
                    termsHTML(event) +
                "</div>" +
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
                // "Open all 4" / "Main ones only": updateOpenAll() writes it
                '<button class="btn btn-ghost btn-small tl-openall" type="button" aria-expanded="false" hidden>' +
                    '<span class="tl-openall-text"></span>' +
                    '<span class="tl-fold-icon" aria-hidden="true"></span>' +
                "</button>" +
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
                // While a theme is chosen, the bar says which (a click shows every theme again)
                '<button class="chip tl-theme-tag" type="button" hidden>' +
                    '<span class="tl-theme-tag-icon" aria-hidden="true"></span>' +
                    '<span class="tl-theme-tag-name"></span>' +
                    '<span class="tl-theme-tag-x" aria-hidden="true">✕</span>' +
                "</button>" +
                // A small read-out: the year the line has reached, and how many milestones
                '<div class="tl-hud" aria-hidden="true">' +
                    '<span class="tl-hud-dot"></span>' +
                    '<span class="tl-hud-year">—</span>' +
                    '<span class="tl-hud-count mono">00/' + EVENTS.length + "</span>" +
                "</div>" +
            "</div>" +
            '<div class="tl-themes" role="group" data-i18n-attr="aria-label:timeline.themeLabel" aria-label="' + esc(t("timeline.themeLabel")) + '">' +
                '<span class="tl-themes-title mono" aria-hidden="true" data-i18n="timeline.themesTitle">' + t("timeline.themesTitle") + "</span>" +
                [null].concat(THEMES).map(themeChipHTML).join("") +
            "</div>" +
            '<p class="sr-only tl-live" aria-live="polite" aria-atomic="true"></p>' +
            // Both filters together may leave nothing
            '<div class="tl-empty card" hidden>' +
                text("timeline.empty", "tl-empty-text", "p") +
                '<button class="btn btn-ghost btn-small tl-reset" type="button">' + text("timeline.clearFilters") + "</button>" +
            "</div>" +

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
    let bar = null;             // the bar with the era chips, the theme tag and the read-out
    let filters = null;         // the era chips
    const chips = {};           // era id (and "all") -> its chip
    let themeRow = null;        // the theme chips
    const themeChips = {};      // theme id (and "all") -> its chip
    let themeTag = null;        // the chosen theme, in the bar
    let live = null;            // the screen reader announcement
    let empty = null;           // "No milestones match both filters."
    let wrap = null;            // the line and the eras
    let line = null;            // the line, with its fill and its bright "comet" head
    let fill = null;
    let head = null;
    let hudYear = null;         // the read-out: the year...
    let hudCount = null;        // ...and "06/29"
    let sections = [];          // the eras: { el, era, head, openAll, items }
    let items = [];             // the milestones: { el, node, card, title, fold, body, key, event, section, on, visible, open }
    const itemByKey = new Map();

    // Builds the timeline and starts everything that follows it
    function build() {
        mount.innerHTML = timelineHTML();

        root = mount.querySelector(".tl");
        bar = root.querySelector(".tl-bar");
        filters = root.querySelector(".tl-filters");
        themeRow = root.querySelector(".tl-themes");
        themeTag = root.querySelector(".tl-theme-tag");
        live = root.querySelector(".tl-live");
        empty = root.querySelector(".tl-empty");
        wrap = root.querySelector(".tl-wrap");
        line = root.querySelector(".tl-line");
        fill = root.querySelector(".tl-fill");
        head = root.querySelector(".tl-head");
        hudYear = root.querySelector(".tl-hud-year");
        hudCount = root.querySelector(".tl-hud-count");
        filters.querySelectorAll(".tl-chip").forEach(function (chip) { chips[chip.getAttribute("data-era")] = chip; });
        themeRow.querySelectorAll(".tl-theme").forEach(function (chip) { themeChips[chip.getAttribute("data-tl-theme")] = chip; });

        sections = Array.prototype.map.call(root.querySelectorAll(".tl-era"), function (element) {
            return {
                el: element,
                era: element.getAttribute("data-era"),
                head: element.querySelector(".tl-era-head"),
                openAll: element.querySelector(".tl-openall"),
                items: []
            };
        });
        items = Array.prototype.map.call(root.querySelectorAll(".tl-item"), function (element) {
            const key = element.getAttribute("data-key");
            const event = BY_KEY.get(key);
            const item = {
                el: element,
                node: element.querySelector(".tl-node"),
                card: element.querySelector(".tl-card"),
                title: element.querySelector(".tl-title"),
                fold: element.querySelector(".tl-fold"),        // null for a main milestone
                body: element.querySelector(".tl-body"),
                key: key,
                event: event,
                section: sections[ERAS.indexOf(event.era)],
                // on: the line has reached its dot (null while filtered out: checked again when
                // it comes back); visible: not filtered out; open: its text is shown
                on: false,
                visible: true,
                open: Boolean(event.major)
            };
            item.section.items.push(item);
            itemByKey.set(key, item);
            return item;
        });

        filters.addEventListener("click", onChipClick);
        themeRow.addEventListener("click", onThemeClick);
        themeTag.addEventListener("click", onThemeTagClick);
        empty.addEventListener("click", onResetClick);
        wrap.addEventListener("click", onWrapClick);
        wrap.addEventListener("focusin", onFocusIn);

        sections.forEach(updateOpenAll);

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
    //               a filter, a milestone opening, a new language, web fonts...). It only
    //               READS the page: where the timeline is and where every visible dot sits.
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
    const drawn = { fill: "", head: "", end: null, hud: "", progress: {} };  // what is on screen now

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
        // No milestone shown (both filters together match none): no line, no glowing head
        line.hidden = !layout.nodes.length;
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

    // Is a dot on the screen now? (From the saved numbers: nothing is read.)
    function onScreen(node) {
        const y = layout.wrapTop + node.y;
        return y >= scroll.y && y <= scroll.y + scroll.viewport;
    }

    // Draws the line, the dots, the era chips and the read-out (only what changed)
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
        const perEra = {};
        layout.nodes.forEach(function (node) {
            const item = node.item;
            const era = item.event.era;
            const on = node.y - layout.lineTop <= shown + DOT_REACH;
            if (on !== item.on) {
                item.on = on;
                item.el.classList.toggle("is-reached", on);
            }
            // An era counts as visited once the reader really got there: one of its lit
            // dots is on the screen. (The first dot is lit before anyone scrolled to it,
            // and a jump past the timeline, to "About" for example, lights every dot
            // without showing any: neither counts.)
            if (on && !visitedEras.has(era) && onScreen(node)) trackEra(era);
            const count = perEra[era] || (perEra[era] = { reached: 0, total: 0 });
            count.total++;
            if (on) {
                count.reached++;
                reached++;
                lastReached = item;
            }
        });

        // Each era chip fills up as the line passes its milestones ("All": the whole line).
        // They stay empty until the line has moved (the first dot is lit from the start).
        Object.keys(chips).forEach(function (era) {
            const count = era === "all" ? { reached: reached, total: layout.nodes.length } : perEra[era];
            const progress = shown > 0 && count && count.total ? (count.reached / count.total).toFixed(3) : "0";
            if (progress !== drawn.progress[era]) {
                drawn.progress[era] = progress;
                chips[era].style.setProperty("--tl-progress", progress);
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

    // The first time the reader reaches an era, it counts as visited (for "My Compass")
    const visitedEras = new Set();

    function trackEra(era) {
        if (visitedEras.has(era)) return;
        visitedEras.add(era);
        A.track("timeline.era", { era: era });
    }

    // ---------- 5. Filters: eras and themes ----------
    let filterToken = 0;        // a newer click makes older animations give up
    let running = [];           // the filter's animations that are still running
    let pendingSwap = null;     // a filter change waiting for its fade-out (see setFilter)

    function onChipClick(event) {
        const chip = event.target.closest(".tl-chip");
        if (chip) setFilter(chip.getAttribute("data-era"), filter.theme);
    }

    function onThemeClick(event) {
        const chip = event.target.closest(".tl-theme");
        if (chip) setFilter(filter.era, chip.getAttribute("data-tl-theme"));
    }

    // The theme in the bar: every theme again. The tag disappears, so the focus
    // moves to the era chip next to it.
    function onThemeTagClick() {
        setFilter(filter.era, "all");
        chips[filter.era].focus({ preventScroll: true });
    }

    // "Clear the filters": everything again. The button disappears, so the focus
    // moves to "All themes", just above it.
    function onResetClick(event) {
        if (!event.target.closest(".tl-reset")) return;
        setFilter("all", "all");
        themeChips.all.focus({ preventScroll: true });
        requestAnimationFrame(function () { keepClearOfBar(themeChips.all); });
    }

    // Tells screen readers how many milestones are shown now
    function announce() {
        A.announce(A.plural("timeline.showing", countIn(filter.era, filter.theme)), { region: live });
    }

    // The chips: which are chosen, and how many milestones each would show together
    // with the other filter. A chip that would show nothing is dimmed (it still works).
    function updateChips() {
        Object.keys(chips).forEach(function (era) {
            const count = countIn(era, filter.theme);
            chips[era].setAttribute("aria-pressed", String(era === filter.era));
            chips[era].querySelector(".tl-chip-count").textContent = A.format.number(count);
            chips[era].classList.toggle("is-zero", count === 0);
        });
        Object.keys(themeChips).forEach(function (theme) {
            const count = countIn(filter.era, theme);
            themeChips[theme].setAttribute("aria-pressed", String(theme === filter.theme));
            themeChips[theme].querySelector(".tl-theme-count").textContent = A.format.number(count);
            themeChips[theme].classList.toggle("is-zero", count === 0);
        });
        updateThemeTag();
    }

    function updateThemeTag() {
        const theme = THEMES.filter(function (entry) { return entry.id === filter.theme; })[0];
        themeTag.hidden = !theme;
        if (!theme) return;
        const name = t("timeline.theme." + theme.id);
        themeTag.querySelector(".tl-theme-tag-icon").textContent = theme.icon;
        themeTag.querySelector(".tl-theme-tag-name").textContent = name;
        themeTag.setAttribute("aria-label", t("timeline.themeClear", { theme: name }));
    }

    // Shows the milestones of an era ("all": every era) and of a theme ("all": every theme).
    // options.instant: no animation and no scrolling back (the caller scrolls).
    function setFilter(era, theme, options) {
        if (era === filter.era && theme === filter.theme) return;
        const instant = Boolean(options && options.instant);
        filter.era = era;
        filter.theme = theme;
        const token = ++filterToken;
        updateChips();

        // Stop animations from a previous click
        running.forEach(function (animation) { animation.cancel(); });
        running = [];
        pendingSwap = null;

        // What goes: whole eras, or single milestones of an era that stays
        const leaving = [];
        sections.forEach(function (section) {
            if (section.el.hidden) return;
            const stays = section.items.some(function (item) { return shownNow(item.event); });
            if (!stays) {
                leaving.push(section.el);
            } else {
                section.items.forEach(function (item) {
                    if (!item.el.hidden && !shownNow(item.event)) leaving.push(item.el);
                });
            }
        });

        // quick: finish now, without animations or scrolling (show() calls it
        // when a fade-out is still running)
        function swap(quick) {
            if (token !== filterToken) return;
            pendingSwap = null;
            const calm = instant || quick;
            // The room to leave above the timeline: under the bar, or under the menu
            // where the bar doesn't stick
            let space = A.layout.navHeight() + FILTER_SPACE;
            if (layout && layout.barSticky) space += BAR_GAP + layout.barHeight;

            A.dom.pauseScrollAnchoring();
            // What comes in: whole eras, or single milestones of an era that was there
            const entering = [];
            sections.forEach(function (section) {
                const wasHidden = section.el.hidden;
                section.el.hidden = !section.items.some(function (item) { return shownNow(item.event); });
                if (wasHidden && !section.el.hidden) entering.push(section.head);
                section.items.forEach(function (item) {
                    const hide = !shownNow(item.event);
                    if (!hide && !section.el.hidden && (item.el.hidden || wasHidden)) entering.push(item.el);
                    item.el.hidden = hide;
                });
                updateOpenAll(section);
            });
            setSides();
            empty.hidden = countIn(filter.era, filter.theme) > 0;

            // If you were reading further down, go back to the start of the timeline.
            // (Read after the change: the first era's margin can move the timeline.)
            if (!calm) {
                const top = (empty.hidden ? wrap : empty).getBoundingClientRect().top;
                if (top < space) {
                    window.scrollTo({ top: window.scrollY + top - space, behavior: A.motion.ok() ? "smooth" : "auto" });
                }
            }
            // The dots moved: core measures again in the next frame
            A.layoutChanged();

            // The new milestones rise in one after another
            if (!calm && A.motion.ok()) {
                entering.forEach(function (element, index) {
                    running.push(element.animate(
                        [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }],
                        { duration: RISE_IN_MS, delay: Math.min(index, RISE_STAGGER_MAX) * RISE_STAGGER_MS, easing: A.motion.ease, fill: "backwards" }
                    ));
                });
            }

            announce();
        }

        if (!instant && A.motion.ok() && leaving.length) {
            // The milestones that go fade away first, then the new ones come in
            const fades = leaving.map(function (element) {
                return element.animate(
                    [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-14px) scale(0.98)" }],
                    { duration: FADE_OUT_MS, easing: "ease-in", fill: "forwards" }
                );
            });
            running = fades.slice();
            pendingSwap = swap;
            Promise.all(fades.map(function (animation) { return animation.finished; })).then(function () {
                if (token !== filterToken) return;
                swap();
                fades.forEach(function (animation) { animation.cancel(); });
            }).catch(function () {
                // Cancelled by a newer click (that click takes over), or finished early by show()
            });
        } else {
            swap();
        }
    }

    // A filter change still fading out finishes at once (show() needs the page as it will be)
    function finishFilter() {
        if (!pendingSwap) return;
        const swap = pendingSwap;
        running.forEach(function (animation) { animation.cancel(); });
        running = [];
        swap(true);
    }

    // On wide screens the cards take turns left and right: after a filter, the
    // milestones that are shown take turns again
    function setSides() {
        let index = 0;
        items.forEach(function (item) {
            if (item.el.hidden || item.section.el.hidden) return;
            const left = index++ % 2 === 0;
            item.el.classList.toggle("is-left", left);
            item.el.classList.toggle("is-right", !left);
        });
    }

    // ---------- 6. Folded milestones ----------
    // Opens (or folds) a milestone that is not a main one. options.animate: its text
    // fades in. The line is measured again in the next frame (the dots below moved).
    function setOpen(item, open, options) {
        if (item.event.major || item.open === open) return;
        item.open = open;
        item.el.classList.toggle("is-folded", !open);
        item.fold.setAttribute("aria-expanded", String(open));
        item.body.hidden = !open;
        if (open && options && options.animate && A.motion.ok()) {
            item.body.animate(
                [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }],
                { duration: OPEN_MS, easing: A.motion.ease }
            );
        }
        A.layoutChanged();
    }

    // The milestones of an era that start folded and that the filters show now
    function extrasOf(section) {
        return section.items.filter(function (item) { return !item.event.major && shownNow(item.event); });
    }

    // The era's "Open all 4" button, shown from 2 such milestones. Once all of them
    // are open it says "Main ones only" and folds them again.
    function updateOpenAll(section) {
        const extras = extrasOf(section);
        const button = section.openAll;
        button.hidden = extras.length < OPEN_ALL_MIN;
        if (button.hidden) return;
        const allOpen = extras.every(function (item) { return item.open; });
        const era = t("timeline.era." + section.era);
        button.setAttribute("aria-expanded", String(allOpen));
        button.setAttribute("aria-controls", extras.map(function (item) { return item.body.id; }).join(" "));
        button.classList.toggle("is-open", allOpen);
        button.querySelector(".tl-openall-text").textContent = allOpen
            ? t("timeline.foldAll")
            : A.plural("timeline.openAll", extras.length);
        button.setAttribute("aria-label", allOpen
            ? t("timeline.foldAllLabel", { era: era })
            : A.plural("timeline.openAllLabel", extras.length, { era: era }));
    }

    function toggleAll(section) {
        const extras = extrasOf(section);
        const open = extras.some(function (item) { return !item.open; });
        extras.forEach(function (item) { setOpen(item, open, { animate: true }); });
        updateOpenAll(section);
    }

    // ---------- 7. Links, glossary buttons and keyboard focus ----------
    // One listener for every button and link of the eras and milestones
    function onWrapClick(event) {
        const target = event.target;
        const fold = target.closest(".tl-fold");
        if (fold) {
            const item = itemByKey.get(fold.closest(".tl-item").getAttribute("data-key"));
            setOpen(item, !item.open, { animate: true });
            updateOpenAll(item.section);
            return;
        }
        const openAll = target.closest(".tl-openall");
        if (openAll) {
            toggleAll(sections.filter(function (section) { return section.openAll === openAll; })[0]);
            return;
        }
        // "In the glossary" buttons open the term there (the glossary scrolls to it)
        const term = target.closest(".tl-term");
        if (term) {
            if (A.glossary) A.glossary.show(term.getAttribute("data-term"), { focus: true });
            return;
        }
        // A lesson or a lab experiment. A plain click opens it here; the address
        // works too (a new tab, a copied link).
        const link = target.closest(".tl-link");
        if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        if (link.hasAttribute("data-lesson") && A.lessons) {
            event.preventDefault();
            A.lessons.open(Number(link.getAttribute("data-lesson")), link);
        } else if (link.hasAttribute("data-lab") && A.lab) {
            event.preventDefault();
            A.lab.open(link.getAttribute("data-lab"), { focus: true });
        }
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
        // A milestone's title gets the focus from show(), which has scrolled already
        if (element.classList.contains("tl-title")) return;
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

    // The lesson and experiment names come from those features, in the current language
    function updateLinks() {
        root.querySelectorAll(".tl-link").forEach(function (link) {
            link.querySelector(".tl-link-text").textContent = link.hasAttribute("data-lesson")
                ? lessonLabel(Number(link.getAttribute("data-lesson")))
                : labLabel(link.getAttribute("data-lab"));
        });
    }

    // ---------- 8. Showing one milestone (for the site search) ----------
    let spotItem = null;        // the milestone that glows now
    let spotTimer = 0;

    // Makes a milestone glow for a moment
    function spotlight(item) {
        if (spotItem && spotItem !== item) spotItem.card.classList.remove("is-spotlight");
        clearTimeout(spotTimer);
        spotItem = item;
        A.dom.replay(item.card, "is-spotlight");
        spotTimer = setTimeout(function () {
            item.card.classList.remove("is-spotlight");
            spotItem = null;
        }, SPOTLIGHT_MS);
    }

    // Scrolls so the milestone's card is in the middle of the room under the menu
    // (and the stuck bar), or near the top of it when the card is taller than that
    function scrollToItem(item) {
        let top = 0;
        for (let element = item.card; element; element = element.offsetParent) top += element.offsetTop;
        let cover = A.layout.navHeight();
        if (window.getComputedStyle(bar).position === "sticky") cover += BAR_GAP + bar.offsetHeight;
        const height = item.card.offsetHeight;
        const room = window.innerHeight - cover;
        const y = height + 2 * CARD_SPACE < room ? top - cover - (room - height) / 2 : top - cover - CARD_SPACE;
        window.scrollTo({ top: Math.max(0, y), behavior: A.motion.ok() ? "smooth" : "auto" });
    }

    // Scrolls to a milestone, opens it and makes it glow. Filters that hide it are
    // cleared first. options.focus also moves the keyboard focus to its title.
    // Returns false for a key the timeline doesn't have.
    function show(key, options) {
        if (!BY_KEY.has(key)) return false;
        const settings = options || {};

        // Build the timeline first, and the parts of the page above it, so the card's
        // place is known. Windows in the way (the palette, the phone menu...) close.
        ensure();
        A.buildParts(mount);
        A.overlays.closeAll({ navigating: true, reason: "navigate" });

        const item = itemByKey.get(key);
        finishFilter();
        if (!shownNow(item.event)) {
            // Scroll anchoring would fight our own scrolling to the card, so it waits
            A.dom.pauseScrollAnchoring();
            setFilter("all", "all", { instant: true });
        }
        setOpen(item, true);
        updateOpenAll(item.section);

        // Show it at once (no fade-in) so it can glow straight away
        if (A.effects && A.effects.reveal) {
            A.effects.reveal(item.section.head);
            A.effects.reveal(item.el);
        }
        scrollToItem(item);
        spotlight(item);

        if (settings.focus) {
            if (!item.title.hasAttribute("tabindex")) item.title.setAttribute("tabindex", "-1");
            // A short delay, so the palette or menu can close first
            setTimeout(function () { item.title.focus({ preventScroll: true }); }, FOCUS_DELAY);
        }
        return true;
    }

    // ---------- 9. Language and motion changes ----------
    // core.js has already translated every [data-i18n] text; we only update our extras
    function onLanguageChange() {
        updateTermButtons();
        updateLinks();
        updateChips();
        sections.forEach(updateOpenAll);
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

    // ---------- 10. Start, and AICompass.timeline ----------
    // Built when it comes near the screen, when the browser has a quiet moment after
    // the page loaded, or at once for a link to a place in the page (#timeline).
    // css/timeline.css keeps its room meanwhile, so nothing below it jumps.
    // ensure() builds it at once if it is not built yet.
    const ensure = A.whenNeeded(mount, build);

    // Other features use AICompass.timeline: the site search shows a milestone it found;
    // My Compass counts the eras (the "timeline.era" event says which one you reached).
    A.feature("timeline", {
        // show("e3", { focus: true }) -> true, or false for a key the timeline doesn't have
        show: show,
        // The era ids, in their order: ["early", "ups", "deep", "gen"]
        eras: function () { return ERAS.slice(); }
    });
})();
