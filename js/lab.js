/* =========================================================
   AI COMPASS — THE AI LAB (the hub)
   The lab is a set of experiments: small, real models that learn live
   in your browser, each one teaching one big idea of AI. This file is
   the lab's hub. It owns:
    - the catalogue (js/content/lab.js) and the picker: a grid of
      experiment cards, or a compact rail while one is open;
    - loading: an experiment's files are loaded only when it opens, or a
      moment before, when its card is under the pointer or in focus (the lab
      kit first, once; then the experiment's styles, texts and code);
    - the life cycle: create, pause, resume, language, theme, destroy;
    - links like #lab/predictor, the Ctrl+K commands, remembering the
      last experiment, and the progress events.
   The experiments own only their stage: js/lab/<id>.js, with its styles
   in css/lab/<id>.css and its texts in js/content/lab/<id>.js.

   AN EXPERIMENT (js/lab/<id>.js) registers itself:
       A.lab.define("<id>", {
           create: function (stage, ctx) {      // builds it in stage (an empty element)
               ...
               return { pause, resume, language, theme, destroy };
           }
       });
     ctx.id            "<id>"
     ctx.store         A.labKit.store("<id>"): get(name, fallback, check) / set / remove ("lab.<id>.<name>")
     ctx.announce(text, { urgent })   a screen-reader message (the kit keeps them from flooding)
     ctx.track(kind, detail)          a progress event: A.track("lab." + kind, { exp: "<id>", ... })
     ctx.visible()     true while the stage is on screen and the browser tab is visible
   The hub calls pause() when the stage leaves the screen or the tab is hidden, resume()
   when it is back, language() and theme() after a switch, motion() (if the controller
   has one) after calm mode was switched, and destroy() before another experiment opens
   or the grid comes back. Then it empties the stage.

   AICompass.lab (what other features use)
     A.lab.define(id, spec)        an experiment's file registers it (see above)
     A.lab.open(id, { focus })     opens that experiment and scrolls to the lab. focus: true
                                   moves the keyboard focus to its title; without it, the focus
                                   goes to the lab's heading. An id that isn't in the catalogue
                                   shows the grid with a note, and returns false.
     A.lab.close()                 back to the grid of all experiments
     A.lab.list()                  [{ id, titleKey, hookKey, ideaKey, level }], in the catalogue's order
     A.lab.current()               the id of the experiment in the stage, or null
     A.openLab(id)                 the older name of A.lab.open (Compass Bot, the lessons)

   Saved: "lab.last" (the experiment that was open: it opens again on the next visit,
   once the lab comes near the screen) and "lab.tried" (the experiments you opened, for
   the "Tried" chips). The old two-tab lab saved "lab.tab": it becomes "lab.last" once.
   Progress events: "lab.use" { exp } when you open an experiment, and every
   ctx.track(kind, detail) as "lab.<kind>" { exp, ... } (README.md, "Progress events").

   Sections of this file:
    1. Settings                     6. The life cycle: ctx, pause / resume, destroy
    2. Small helpers                7. Opening and closing
    3. The catalogue                8. Building the lab
    4. The card: picker, header     9. Links: #lab and #lab/<id>
    5. Loading an experiment       10. Commands and AICompass.lab
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="lab"]');
    if (!A || !mount) return;

    const t = A.t;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
    // The lab kit: the shared controls, charts and helpers of every experiment.
    // It is loaded once, before the first experiment.
    const KIT_FILES = {
        style: "css/lab/kit.css",
        content: "js/content/lab/kit.js",
        script: "js/lab/kit.js"
    };

    // An experiment's three files ({id} is its id)
    const EXPERIMENT_FILES = {
        style: "css/lab/{id}.css",
        content: "js/content/lab/{id}.js",
        script: "js/lab/{id}.js"
    };

    // The controller's functions that every experiment must have
    const LIFE_CYCLE = ["pause", "resume", "language", "theme", "destroy"];

    const LEVELS = 3;                     // a card shows its level as 1 to 3 dots
    const LINK_PREFIX = "#lab/";          // a link like #lab/predictor opens that experiment
    const VALID_ID = /^[a-z0-9-]+$/;      // an experiment's id: small letters, digits and "-"
    // On a new visit, the last experiment opens once the lab is this close to the screen
    // (one screen away). Before that, nothing of it is loaded.
    const NEAR_MARGIN = "100% 0px";

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    // An error in an experiment must not break the hub: report it, and go on
    function report(error) {
        if (typeof window.reportError === "function") window.reportError(error);
        else console.error(error);
    }

    function fileOf(pattern, id) {
        return pattern.replace("{id}", id);
    }

    // Writes the address without a new step in the browser's history (Back stays useful)
    function setHash(hash) {
        if (window.location.hash === hash) return;
        try {
            history.replaceState(history.state, "", hash);
        } catch (error) {
            // Some browsers refuse this for a page opened from a file: the lab works without it
        }
    }

    // Is the element on screen right now (and the browser tab visible)?
    function onScreenNow(element) {
        if (document.hidden) return false;
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
    }

    // Small pictures of the hub's buttons (the experiments' icons are in js/content/lab.js)
    const ICONS = {
        grid: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/></g></svg>',
        prev: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M14.5 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        next: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };

    /* =========================================================
       3. THE CATALOGUE
       The list of experiments, in the order of the learning path
       (js/content/lab.js). A.content keeps a list as { 0: ..., 1: ... },
       so it is turned back into a list here, and every entry is checked.
       ========================================================= */
    const stored = A.content.get("lab.catalogue") || {};
    const byId = {};
    const CATALOGUE = Object.keys(stored)
        .sort(function (a, b) { return Number(a) - Number(b); })
        .map(function (key) { return stored[key]; })
        .filter(function (entry) {
            const ok = Boolean(entry) && typeof entry.id === "string" && VALID_ID.test(entry.id) &&
                typeof entry.titleKey === "string" && !byId[entry.id];
            if (!ok) {
                report(new Error("lab.catalogue: every entry needs its own id (a-z, 0-9, -) and a titleKey"));
                return false;
            }
            byId[entry.id] = entry;
            return true;
        });

    // The number of experiments: the hero's count and the lab's subtitle say it
    // (data-count-name and data-i18n-plural="labExperimentCount" in index.html)
    A.setTextValue("labExperimentCount", CATALOGUE.length);

    function levelOf(entry) {
        const level = Math.round(Number(entry.level));
        return isFinite(level) ? A.util.clamp(level, 1, LEVELS) : 1;
    }

    // ----- What is saved -----
    A.storage.migrate("lab.tab", "lab.last");     // the old lab's last tab ("classifier" / "predictor")

    function savedLast() {
        const id = A.storage.get("lab.last", null);
        return typeof id === "string" && byId[id] ? id : null;
    }

    function triedList() {
        const list = A.storage.get("lab.tried", []);
        return Array.isArray(list) ? list.filter(function (id) { return typeof id === "string" && byId[id]; }) : [];
    }

    function markTried(id) {
        const list = triedList();
        if (list.indexOf(id) === -1) A.storage.set("lab.tried", list.concat([id]));
    }

    // The "Try this" challenges an experiment has saved (the kit's format, see js/lab/kit.js):
    // { v: 1, total: 4, done: ["lab.<id>.ch1", ...] }. Anything else counts as none.
    function savedChallenges(id) {
        const saved = A.storage.get("lab." + id + ".challenges", null);
        if (!saved || saved.v !== 1 || !Array.isArray(saved.done) || typeof saved.total !== "number" || !(saved.total > 0)) return null;
        const total = Math.floor(saved.total);
        return { done: Math.min(saved.done.length, total), total: total };
    }

    // The chip on a card: "2 / 4 challenges" once one is done, else "Tried" or "New"
    function stateOf(id) {
        const challenges = savedChallenges(id);
        if (challenges && challenges.done > 0) {
            return {
                name: challenges.done === challenges.total ? "complete" : "challenges",
                text: t("lab.hub.stateChallenges", {
                    done: A.format.number(challenges.done),
                    total: A.format.number(challenges.total),
                    challenges: A.plural("lab.hub.pluralChallenges", challenges.total)
                })
            };
        }
        if (triedList().indexOf(id) !== -1) return { name: "tried", text: t("lab.hub.stateTried") };
        return { name: "new", text: t("lab.hub.stateNew") };
    }

    /* =========================================================
       4. THE CARD: PICKER, HEADER, STAGE
       The card is made once (build(), section 8). Its picker is one list
       of buttons: a grid of cards while no experiment is open, a rail of
       small cards above the stage while one is.
       ========================================================= */
    function cardHTML() {
        const sprite = (A.content.get("lab.icons") || {}).sprite || "";
        return '<div class="lab card ui-scan" data-reveal data-no-glare data-view="grid">' +
            '<span class="lab-corners ui-corners" aria-hidden="true"></span>' +
            '<svg class="lab-sprite" aria-hidden="true" focusable="false">' + sprite + '</svg>' +
            '<div class="lab-top">' +
                '<p class="lab-top-label mono" id="lab-picker-label" data-i18n="lab.hub.pickerLabel"></p>' +
                '<p class="lab-live mono"><span class="lab-live-dot" aria-hidden="true"></span><span data-i18n="lab.live"></span></p>' +
            '</div>' +
            '<p class="lab-notice" hidden></p>' +
            '<ul class="lab-picker" aria-labelledby="lab-picker-label">' + CATALOGUE.map(pickHTML).join("") + '</ul>' +
            '<div class="lab-head" hidden>' +
                '<div class="lab-head-text">' +
                    '<h3 class="lab-head-title" id="lab-head-title" tabindex="-1"></h3>' +
                    '<span class="lab-head-idea mono"></span>' +
                '</div>' +
                '<div class="lab-head-nav">' +
                    '<button type="button" class="btn btn-ghost btn-small lab-head-all" data-hub="all">' + ICONS.grid + '<span data-i18n="lab.hub.all"></span></button>' +
                    '<button type="button" class="lab-head-step" data-hub="prev">' + ICONS.prev + '</button>' +
                    '<button type="button" class="lab-head-step" data-hub="next">' + ICONS.next + '</button>' +
                '</div>' +
            '</div>' +
            '<div class="lab-stage" hidden></div>' +
        '</div>';
    }

    // One experiment's card: its name is its title; the hook, the big idea, the level and
    // its state describe it. tabindex -1: one card at a time is in the Tab order (see setUpPicker).
    function pickHTML(entry) {
        const id = "lab-pick-" + entry.id;
        const level = levelOf(entry);
        let dots = "";
        for (let i = 1; i <= LEVELS; i++) dots += '<i class="' + (i <= level ? "is-on" : "") + '"></i>';
        return '<li class="lab-pick-item">' +
            '<button type="button" class="lab-pick" id="' + id + '" data-exp="' + entry.id + '" tabindex="-1"' +
                ' aria-labelledby="' + id + '-title" aria-describedby="' + id + '-hook ' + id + '-idea ' + id + '-level ' + id + '-state">' +
                '<span class="lab-pick-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><use href="#' + (entry.icon || "") + '"></use></svg></span>' +
                '<span class="lab-pick-body">' +
                    '<span class="lab-pick-idea mono" id="' + id + '-idea" data-i18n="' + (entry.ideaKey || "") + '"></span>' +
                    '<span class="lab-pick-title" id="' + id + '-title" data-i18n="' + entry.titleKey + '"></span>' +
                    '<span class="lab-pick-hook" id="' + id + '-hook" data-i18n="' + (entry.hookKey || "") + '"></span>' +
                    '<span class="lab-pick-meta">' +
                        '<span class="lab-pick-level">' +
                            '<span class="lab-pick-level-word mono" aria-hidden="true" data-i18n="lab.hub.levelWord"></span>' +
                            '<span class="lab-pick-dots" aria-hidden="true">' + dots + '</span>' +
                            '<span class="sr-only" id="' + id + '-level" data-i18n="lab.hub.level' + level + '"></span>' +
                        '</span>' +
                        '<span class="lab-pick-state" id="' + id + '-state"></span>' +
                    '</span>' +
                '</span>' +
            '</button>' +
        '</li>';
    }

    // The card's parts (findElements() finds them once the card is made)
    let card = null;
    let picker = null;
    let picks = [];               // the cards' buttons, in the catalogue's order
    let head = null;
    let headTitle = null;
    let headIdea = null;
    let prevButton = null;
    let nextButton = null;
    let stage = null;
    let notice = null;

    function findElements() {
        card = mount.querySelector(".lab");
        picker = card.querySelector(".lab-picker");
        picks = Array.prototype.slice.call(picker.querySelectorAll(".lab-pick"));
        head = card.querySelector(".lab-head");
        headTitle = card.querySelector(".lab-head-title");
        headIdea = card.querySelector(".lab-head-idea");
        prevButton = card.querySelector('[data-hub="prev"]');
        nextButton = card.querySelector('[data-hub="next"]');
        stage = card.querySelector(".lab-stage");
        notice = card.querySelector(".lab-notice");
    }

    function pickOf(id) {
        return picks.find(function (button) { return button.getAttribute("data-exp") === id; }) || null;
    }

    // The chips: New / Tried / 2 of 4 challenges (they change with the language too)
    function updateStates() {
        picks.forEach(function (button) {
            const chip = button.querySelector(".lab-pick-state");
            const state = stateOf(button.getAttribute("data-exp"));
            chip.setAttribute("data-state", state.name);
            A.dom.setText(chip, state.text);
        });
    }

    // Grid (no experiment open) or rail (an experiment in the stage)
    function setView(view) {
        card.setAttribute("data-view", view);
        head.hidden = view !== "stage";
        stage.hidden = view !== "stage";
        picks.forEach(function (button) {
            if (view === "stage" && button.getAttribute("data-exp") === current) button.setAttribute("aria-current", "true");
            else button.removeAttribute("aria-current");
        });
        setRoving(pickOf(current) || picks[0]);
    }

    // One card at a time is in the Tab order: the open one, or the one you moved to
    // with the arrow keys
    function setRoving(button) {
        picks.forEach(function (other) { other.tabIndex = other === button ? 0 : -1; });
    }

    // The header above the stage: the experiment's title and big idea, and previous / next
    function showHeader(entry) {
        headTitle.setAttribute("data-i18n", entry.titleKey);
        headIdea.setAttribute("data-i18n", entry.ideaKey || "");
        A.applyTranslations(head);
        updateNav();
    }

    // Previous / next follow the catalogue's order. At the ends the button stays in the
    // Tab order but does nothing (aria-disabled), so the focus is never lost.
    function updateNav() {
        const index = CATALOGUE.indexOf(byId[current]);
        [[prevButton, CATALOGUE[index - 1], "lab.hub.prev", "lab.hub.prevNone"],
            [nextButton, CATALOGUE[index + 1], "lab.hub.next", "lab.hub.nextNone"]].forEach(function (item) {
            const button = item[0];
            const target = index >= 0 ? item[1] : null;
            const label = target ? t(item[2], { title: t(target.titleKey) }) : t(item[3]);
            button.setAttribute("aria-label", label);
            button.setAttribute("title", label);
            button.setAttribute("aria-disabled", String(!target));
        });
    }

    // While the files load: a skeleton of an experiment, with the stage's height kept
    function showSkeleton(id) {
        stage.setAttribute("data-loading", id);
        stage.setAttribute("aria-busy", "true");
        // The line comes first, so that it shows on a phone too; the blocks fill the height
        // the experiment will take (lab.css)
        stage.innerHTML =
            '<p class="lab-loading mono"><span class="lab-loading-dot" aria-hidden="true"></span><span data-i18n="lab.hub.loading"></span></p>' +
            '<div class="lab-skeleton" aria-hidden="true">' +
                '<div class="lab-skel-main"><span class="lab-skel lab-skel-bar"></span><span class="lab-skel lab-skel-board"></span></div>' +
                '<div class="lab-skel-side"><span class="lab-skel lab-skel-bar"></span><span class="lab-skel lab-skel-box"></span><span class="lab-skel lab-skel-box"></span></div>' +
                '<span class="lab-skel lab-skel-wide"></span>' +
                '<span class="lab-skel lab-skel-wide"></span>' +
            '</div>';
        A.applyTranslations(stage);
    }

    // The files didn't load (offline?) or the experiment failed to start: say so, with "Try again"
    function showError() {
        stage.removeAttribute("data-loading");
        stage.removeAttribute("aria-busy");
        stage.innerHTML =
            '<div class="lab-error" role="alert">' +
                '<p class="lab-error-title" data-i18n="lab.hub.errorTitle"></p>' +
                '<p class="lab-error-text" data-i18n="lab.hub.errorText"></p>' +
                '<button type="button" class="btn btn-primary btn-small lab-retry" data-hub="retry"><span data-i18n="lab.hub.retry"></span></button>' +
            '</div>';
        A.applyTranslations(stage);
    }

    // A link to an experiment that isn't in the catalogue: a note above the grid
    function showNotice(id) {
        notice.textContent = t("lab.hub.unknown", { id: id });
        notice.hidden = false;
        A.announce(notice.textContent);
    }

    function hideNotice() {
        notice.hidden = true;
        notice.textContent = "";
    }

    /* =========================================================
       5. LOADING AN EXPERIMENT
       The kit's three files load once (core's A.loadScript / A.loadStyle
       load a file only once, and try again after a failure). Then the
       experiment's styles (side by side) and texts, and then its code.
       Scripts run in the order they were asked for, so the texts are
       always there before the code that uses them.
       ========================================================= */
    const specs = {};

    function define(id, spec) {
        if (!spec || typeof spec.create !== "function") {
            report(new Error("A.lab.define(\"" + id + "\"): the spec needs a create(stage, ctx) function"));
            return;
        }
        specs[id] = spec;
    }

    function loadKit() {
        return Promise.all([
            A.loadStyle(KIT_FILES.style),
            A.loadScript(KIT_FILES.content),
            A.loadScript(KIT_FILES.script)
        ]);
    }

    // Resolves with the experiment's spec once all its files are in
    function loadExperiment(id) {
        const kit = loadKit();
        const style = A.loadStyle(fileOf(EXPERIMENT_FILES.style, id));
        const texts = A.loadScript(fileOf(EXPERIMENT_FILES.content, id));
        const code = Promise.all([kit, texts]).then(function () {
            return specs[id] ? null : A.loadScript(fileOf(EXPERIMENT_FILES.script, id));
        });
        return Promise.all([style, code]).then(function () {
            if (!A.labKit) throw new Error("The lab kit did not load");
            if (!specs[id]) throw new Error("js/lab/" + id + ".js did not call A.lab.define(\"" + id + "\", ...)");
            return specs[id];
        });
    }

    /* =========================================================
       6. THE LIFE CYCLE: CTX, PAUSE / RESUME, DESTROY
       ========================================================= */
    let current = null;           // the id of the experiment in the stage (null: the grid shows)
    // What the stage shows: "grid" (nothing), "waiting" (the last experiment, before the lab
    // comes near), "loading", "ready" or "error"
    let status = "grid";
    let loadToken = 0;            // each opening gets a new number: a load that ends late is dropped
    let live = null;              // the running experiment: { id, element, ctx, controller, announcer, paused }
    let onScreen = false;         // the stage is on screen and the browser tab is visible (A.whenVisible)

    // Calls one function of the running experiment; an error in it is reported, not thrown
    function call(name) {
        if (!live || !live.controller || typeof live.controller[name] !== "function") return;
        try {
            live.controller[name]();
        } catch (error) {
            report(error);
        }
    }

    // pause() when the stage can't be seen, resume() when it can again (each once)
    function updateVisibility() {
        if (!live || !live.controller) return;
        if (!onScreen && !live.paused) {
            live.paused = true;
            call("pause");
        } else if (onScreen && live.paused) {
            live.paused = false;
            call("resume");
        }
    }

    function onStageVisible(visible) {
        onScreen = visible;
        updateVisibility();
    }

    // Progress events of an experiment: "lab.<kind>" with its id
    function track(id, kind, detail) {
        if (A.track) A.track("lab." + kind, Object.assign({ exp: id }, detail));
        if (kind === "challenge") updateStates();
    }

    // Builds the experiment in the stage (its files are in)
    function start(id, spec) {
        const kit = A.labKit;
        const element = document.createElement("div");
        element.className = "lab-exp";
        element.setAttribute("data-exp", id);
        stage.removeAttribute("data-loading");
        stage.removeAttribute("aria-busy");
        stage.textContent = "";
        stage.appendChild(element);

        const record = { id: id, element: element, ctx: null, controller: null, announcer: kit.announcer(), paused: false };
        record.ctx = {
            id: id,
            store: kit.store(id),
            announce: function (text, options) { record.announcer.say(text, options); },
            track: function (kind, detail) { track(id, kind, detail); },
            visible: function () { return live === record && onScreen; }
        };
        // The stage may have appeared a moment ago: ask the page, not the last report
        // (so that ctx.visible() is right during create() already)
        onScreen = onScreenNow(stage);
        live = record;
        try {
            record.controller = spec.create(element, record.ctx) || {};
        } catch (error) {
            report(error);
            live = null;
            record.announcer.cancel();
            status = "error";
            showError();
            return false;
        }
        LIFE_CYCLE.forEach(function (name) {
            if (typeof record.controller[name] !== "function") report(new Error("lab " + id + ": the controller has no " + name + "()"));
        });
        status = "ready";
        updateVisibility();
        if (A.motion.ok()) A.dom.replay(element, "lab-panel-in");
        return true;
    }

    // Stops the experiment in the stage (or the loading of one) and empties the stage
    function teardown() {
        loadToken++;
        if (live) {
            const record = live;
            live = null;
            record.announcer.cancel();
            if (typeof record.controller.destroy === "function") {
                try {
                    record.controller.destroy();
                } catch (error) {
                    report(error);
                }
            }
        }
        stage.removeAttribute("data-loading");
        stage.removeAttribute("aria-busy");
        stage.textContent = "";
    }

    /* =========================================================
       7. OPENING AND CLOSING
       ========================================================= */
    // Opens an experiment in the stage. how:
    //   focus: true     move the keyboard focus to its title (opened by keyboard)
    //   go: true        scroll to the lab (commands, links, other features)
    //   reveal: true    scroll a little if the stage's header is out of view (opened from the grid)
    //   quiet: true     the page opens it by itself (the last experiment): no event,
    //                   no message, the address stays
    // Opening the experiment that is already open (or loading) changes nothing,
    // so a double click or two links in a row build it once.
    function open(id, how) {
        const options = how || {};
        const entry = byId[id];
        if (!entry) return false;
        ensure();
        hideNotice();
        const again = current === id && (status === "loading" || status === "ready");
        if (!again) {
            teardown();
            current = id;
            status = "loading";
            setView("stage");
            showHeader(entry);
            showSkeleton(id);
            revealInRail(pickOf(id));
            A.storage.set("lab.last", id);
            markTried(id);
            updateStates();
            if (!options.quiet && A.track) A.track("lab.use", { exp: id });
            load(id, entry, !options.quiet);
        }
        if (!options.quiet) setHash(LINK_PREFIX + id);
        if (options.go) {
            // The palette, a link, Compass Bot or a lesson: go to the lab. The focus goes to the
            // experiment's title (focus: true) or, as for any section, to the lab's heading.
            A.navigate("lab", { focus: false });
            if (options.focus) headTitle.focus({ preventScroll: true });
            else A.dom.focusHeading("lab");
        } else {
            if (options.reveal) revealHeader();
            if (options.focus) headTitle.focus({ preventScroll: options.reveal !== true });
        }
        return true;
    }

    function load(id, entry, sayOpened) {
        const token = loadToken;
        loadExperiment(id).then(function (spec) {
            if (token !== loadToken) return;          // closed, or another one opened meanwhile
            if (start(id, spec) && sayOpened) A.announce(t("lab.hub.opened", { title: t(entry.titleKey) }));
        }, function () {
            if (token !== loadToken) return;
            status = "error";
            showError();
        });
    }

    // Back to the grid. The focus goes back to the card of the experiment that was open,
    // if it was in the lab (or nowhere).
    function close(how) {
        const options = how || {};
        if (!card || !current) return;
        const id = current;
        const focused = document.activeElement;
        const hadFocus = !focused || focused === document.body || card.contains(focused);
        teardown();
        current = null;
        status = "grid";
        A.storage.remove("lab.last");
        setView("grid");
        setRoving(pickOf(id));
        if (!options.quiet) setHash("#lab");
        if (hadFocus && options.focus !== false) pickOf(id).focus({ preventScroll: true });
        // The grid is taller than the rail: keep the card you came from in view
        if (options.reveal) revealPick(pickOf(id));
    }

    // Previous / next in the catalogue's order
    function step(direction) {
        const index = CATALOGUE.indexOf(byId[current]);
        const target = CATALOGUE[index + direction];
        if (index < 0 || !target) return;
        open(target.id);
    }

    // ----- Keeping things in view -----
    function scrollBehavior() {
        return A.motion.ok() ? "smooth" : "auto";
    }

    // After the grid became a rail, the header may be out of view: bring the rail to the top
    function revealHeader() {
        const top = picker.getBoundingClientRect().top;
        if (top < A.layout.navHeight() || top > window.innerHeight * 0.5) {
            picker.scrollIntoView({ block: "start", behavior: scrollBehavior() });
        }
    }

    function revealPick(button) {
        const box = button.getBoundingClientRect();
        if (box.top < A.layout.navHeight() || box.bottom > window.innerHeight) {
            button.scrollIntoView({ block: "center", behavior: scrollBehavior() });
        }
    }

    // The rail scrolls sideways on narrow screens: the open experiment's card is shown
    function revealInRail(button) {
        if (!button || picker.scrollWidth <= picker.clientWidth) return;
        const left = button.offsetLeft - picker.offsetLeft;
        if (left < picker.scrollLeft || left + button.offsetWidth > picker.scrollLeft + picker.clientWidth) {
            picker.scrollLeft = Math.max(0, left - 16);
        }
    }

    /* =========================================================
       8. BUILDING THE LAB
       The lab sits far down the page, so its card is made only when it is
       needed (near the screen, a quiet moment after the page loaded, or
       when something opens it). An experiment's files load when it opens
       (or its card is about to be clicked): on a new visit, the last one
       opens once the lab is close to the screen; on a first visit, the grid
       shows.
       ========================================================= */
    // A double click counts as one click: the grid and the rail swap places when an
    // experiment opens or closes, so the second click would land on what came under the
    // pointer ("All experiments" twice would open the card that appears under it).
    // event.detail counts the clicks in a row (it is 0 for Enter or Space).
    function doubleClick(event) {
        return event.detail > 1;
    }

    // ----- The picker: click, Enter or Space opens; the arrow keys move between cards -----
    function setUpPicker() {
        picker.addEventListener("click", function (event) {
            const button = event.target.closest(".lab-pick");
            if (!button || doubleClick(event)) return;
            const fromGrid = status === "grid";
            // event.detail is 0 for a click made with the keyboard (Enter or Space)
            open(button.getAttribute("data-exp"), { focus: event.detail === 0, reveal: fromGrid });
        });
        picker.addEventListener("keydown", onPickerKey);
        // A card under the pointer (or a finger), or in focus, is about to be opened: its files
        // start loading now, so that the click finds them ready. Nothing runs until it opens.
        picker.addEventListener("pointerover", prefetch);
        picker.addEventListener("focusin", prefetch);
    }

    const prefetched = {};
    function prefetch(event) {
        const button = event.target.closest(".lab-pick");
        const id = button && button.getAttribute("data-exp");
        if (!id || prefetched[id] || specs[id]) return;
        prefetched[id] = true;
        // A file that fails is asked for again when the experiment opens (and says so then)
        loadExperiment(id).catch(function () { prefetched[id] = false; });
    }

    function onPickerKey(event) {
        const index = picks.indexOf(event.target.closest(".lab-pick"));
        if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
        const grid = card.getAttribute("data-view") === "grid";
        let next = -1;
        if (event.key === "ArrowRight") next = index + 1;
        else if (event.key === "ArrowLeft") next = index - 1;
        else if (event.key === "ArrowDown" && grid) next = index + columns();
        else if (event.key === "ArrowUp" && grid) next = index - columns();
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = picks.length - 1;
        else return;
        event.preventDefault();
        const target = picks[A.util.clamp(next, 0, picks.length - 1)];
        setRoving(target);
        target.focus();
        if (!grid) revealInRail(target);
    }

    // How many cards the grid shows in a row (the cards of the first row share its top)
    function columns() {
        const top = picks[0].offsetTop;
        return Math.max(1, picks.filter(function (button) { return button.offsetTop === top; }).length);
    }

    // ----- The header: all experiments, previous, next; the error's "Try again" -----
    function setUpHeader() {
        card.addEventListener("click", function (event) {
            const button = event.target.closest("[data-hub]");
            if (!button || doubleClick(event)) return;
            const action = button.getAttribute("data-hub");
            if (action === "all") close({ reveal: true });
            else if (action === "prev") step(-1);
            else if (action === "next") step(1);
            else if (action === "retry") retry();
        });
    }

    // "Try again" after an error: the files that failed are asked for again
    function retry() {
        if (!current || status !== "error") return;
        const id = current;
        // The button goes away with the message: the focus waits on the experiment's title
        if (stage.contains(document.activeElement)) headTitle.focus({ preventScroll: true });
        status = "loading";
        loadToken++;
        showSkeleton(id);
        load(id, byId[id], true);
    }

    // The language changed: core has translated every data-i18n text already
    function languageChanged() {
        updateStates();
        if (current) updateNav();
        call("language");
    }

    // ----- The last experiment opens when the lab comes near the screen -----
    function watchNear() {
        let stop = null;
        let done = false;
        stop = A.whenVisible(card, function (near) {
            if (!near || done) return;
            done = true;
            if (stop) stop();
            if (current && status === "waiting") open(current, { quiet: true });
        }, { rootMargin: NEAR_MARGIN });
        if (done) stop();
    }

    function build() {
        mount.removeAttribute("data-lab-last");      // only the empty mount needs it (see below)
        mount.innerHTML = cardHTML();
        findElements();
        // The HTML has empty text holders: they are filled in this once
        // (after that, core keeps them in the right language)
        A.applyTranslations(card);
        updateStates();
        setUpPicker();
        setUpHeader();

        // pause / resume follow the stage on screen and the browser tab
        // ({ pauseAnimations: true } also pauses the CSS animations in it). The card's own
        // animations (the light along its top, the "live" dot) stop too while it is out of view.
        A.whenVisible(stage, onStageVisible, { pauseAnimations: true });
        A.whenVisible(card, function () {}, { pauseAnimations: true });
        A.onLanguageChange(languageChanged);
        A.onThemeChange(function () { call("theme"); });
        A.motion.onChange(function () { call("motion"); });

        // A link like #lab or #lab/<id> decides itself (section 9). Otherwise the last
        // experiment waits in the stage (its header, a skeleton of its height) until
        // the lab comes near the screen; on a first visit the grid shows.
        const last = linkTarget() ? null : savedLast();
        if (last) {
            current = last;
            status = "waiting";
            setView("stage");
            showHeader(byId[last]);
            showSkeleton(last);
            watchNear();
        } else {
            setView("grid");
        }
    }

    // Until it is built, the empty mount keeps about the height of what it will show
    // (lab.css): the grid, or the last experiment
    const lastAtStart = savedLast();
    if (lastAtStart) mount.setAttribute("data-lab-last", lastAtStart);

    // The toolkit calls build() when the lab is needed; ensure() builds it at once if it is not built yet
    const ensure = A.whenNeeded(mount, build);

    /* =========================================================
       9. LINKS: #lab AND #lab/<id>
       #lab/<id> opens that experiment (on page load too), #lab shows the
       grid on page load. The address follows the open experiment with
       history.replaceState, so the Back button is not flooded.
       ========================================================= */
    // What the address asks for: { grid: true }, { id }, or null (not about the lab)
    function linkTarget() {
        const hash = window.location.hash;
        if (hash === "#lab") return { grid: true };
        if (hash.indexOf(LINK_PREFIX) !== 0) return null;
        let id = hash.slice(LINK_PREFIX.length);
        try {
            id = decodeURIComponent(id);
        } catch (error) {
            id = "";
        }
        return { id: id };
    }

    function followLink() {
        const target = linkTarget();
        if (!target) return;
        if (target.grid) {
            // A link to the section ("AI Lab" in the menu) while an experiment is open keeps
            // it open, and the address names it again
            if (current && status !== "waiting") setHash(LINK_PREFIX + current);
            return;
        }
        if (byId[target.id]) open(target.id, { go: true });
        else showUnknown(target.id);
    }

    // A link (or a feature) named an experiment that isn't in the catalogue: the grid,
    // with a note that says so. The address names what shows: #lab.
    function showUnknown(id) {
        ensure();
        close({ quiet: true, focus: false });
        setHash("#lab");
        showNotice(id);
        A.navigate("lab");
    }

    window.addEventListener("hashchange", followLink);
    // On page load, once every script has run (so a link to the lab finds the whole page ready)
    A.ready(function () {
        if (linkTarget()) followLink();
    });

    /* =========================================================
       10. COMMANDS AND AICompass.lab (what other features use)
       ========================================================= */
    // One Ctrl+K palette command per experiment: "Open lab: Teach the machine". Like every
    // section link, it moves the focus to the lab's heading (the experiment's title is next).
    CATALOGUE.forEach(function (entry) {
        A.registerCommand({
            id: "lab-" + entry.id,
            group: "lab.cmdGroup",
            icon: entry.emoji || "🧪",
            title: function () { return t("lab.cmdOpen", { title: t(entry.titleKey) }); },
            keywords: entry.keywords || "",
            run: function () { open(entry.id, { go: true }); }
        });
    });

    // AICompass.lab.open("predictor"), from Compass Bot, the lessons and the search.
    // An id that isn't in the catalogue shows the grid, with a note (false).
    function openLab(id, how) {
        const options = how || {};
        if (!byId[id]) {
            showUnknown(String(id));
            return false;
        }
        return open(id, { go: true, focus: options.focus === true });
    }

    A.feature("lab", {
        define: define,
        open: openLab,
        close: function () { close({ focus: false }); },
        list: function () {
            return CATALOGUE.map(function (entry) {
                return { id: entry.id, titleKey: entry.titleKey, hookKey: entry.hookKey, ideaKey: entry.ideaKey, level: levelOf(entry) };
            });
        },
        current: function () { return current; }
    });
    A.openLab = openLab;
})();
