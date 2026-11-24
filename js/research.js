/* =========================================================
   AI COMPASS — THE RESEARCH LAB (page #research)
   The place where a researcher works: three parts, shown as tabs.
     Experiments  the experiment station (js/research/station.js, built by
                  another engineer): loaded when its tab opens, once its
                  "ready" flag in js/content/research.js is set
     Bench        precise calculators: a grid of tools in four groups, one
                  open at a time (js/research/<id>.js and its texts)
     Notebook     the lab notebook, kept in this browser (A.storage
                  "research.notebook"), with export and import
   The address follows the tab and the open tool, and Back / Forward work:
     #research                     the last tab used
     #research/bench               the grid of tools
     #research/bench/<id>          a tool
     #research/station[/<more>]    the station (<more> is the station's own)
     #research/notebook            the notebook
   Built only when the page is first shown. Texts and the catalogue:
   js/content/research.js. Styles: css/research.css. How to add a tool:
   S/r9/research/TOOL-GUIDE.md (and README.md, "Adding a bench tool").

   Sections:
    1. Settings and the catalogue
    2. Small helpers
    3. The address
    4. Building the page: the header and the tabs
    5. The bench: the grid of tools
    6. Loading files: the kits, a tool, the station
    7. A tool's life: ctx, opening, closing
    8. The experiment station
    9. The notebook: entries, limits, saving
   10. The notebook tab
   11. The notebook: export and import
   12. Following the language, the look and the screen
   13. Commands and AICompass.research
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const t = A.t;
    const section = document.getElementById("research");
    const mount = section ? section.querySelector('[data-feature="research"]') : null;

    /* =========================================================
       1. SETTINGS AND THE CATALOGUE
       ========================================================= */
    const PAGE = "research";
    const PREFIX = "#research";
    const TABS = ["station", "bench", "notebook"];
    const TAB_KEY = "research.tab";                  // the last tab used (A.storage)
    const NOTEBOOK_KEY = "research.notebook";        // { v: 1, entries: [...] }
    const NOTEBOOK_VERSION = 1;
    const FILE_MARK = "ai-compass-research-notebook";    // "app" in an exported JSON file
    const LIMITS = {
        entries: 300,          // entries in the notebook; when it is full, a new one is refused (nothing old is dropped)
        title: 200,            // characters of a title (one line)
        text: 4000,            // characters of an entry's notes
        rows: 40,              // rows of a tool's table (inputs, results), each
        rowName: 120,          // characters of a row's name...
        rowValue: 400,         // ...and of its value
        fileBytes: 2 * 1024 * 1024     // an imported file, at most
    };
    const VALID_ID = /^[a-z0-9-]{1,40}$/;            // a tool's id
    const ENTRY_ID = /^[A-Za-z0-9_-]{1,64}$/;        // an entry's id
    const EARLIEST = Date.UTC(2000, 0, 1);           // an entry's time must be between these
    const LATEST = Date.UTC(2100, 0, 1);
    const ROUTE_CHARS = /[^A-Za-z0-9_./-]/g;         // what the station's own address may hold
    const URL_LIFE = 60000;                          // ms an exported file's address stays valid

    // The lab kit (js/lab/kit.js) is shared with the AI Lab: the same file names, so it loads once
    const KIT_FILES = {
        labStyle: "css/lab/kit.css",
        labTexts: "js/content/lab/kit.js",
        labCode: "js/lab/kit.js",
        maths: "js/research/math.js",
        code: "js/research/kit.js"
    };
    const TOOL_FILES = { code: "js/research/{id}.js", texts: "js/content/research/{id}.js", style: "css/research/{id}.css" };
    // engine: the training code that station.js loads itself (A.researchEngine); listed here
    // only so that it is saved for offline use with the station
    const STATION_FILES = { code: "js/research/station.js", texts: "js/content/research/station.js", style: "css/research/station.css", engine: "js/research/engine.js" };
    // What a tool's or the station's create() must return
    const LIFE_CYCLE = ["language", "theme", "destroy"];

    const DATA = A.content.get("research") || {};
    const GROUPS = Array.isArray(DATA.groups) ? DATA.groups : ["stats", "scale", "theory", "sims"];
    const TOOLS = (Array.isArray(DATA.tools) ? DATA.tools : []).filter(function (entry) {
        return entry && typeof entry.id === "string" && VALID_ID.test(entry.id) && entry.id !== "station";
    });
    const byId = Object.create(null);
    TOOLS.forEach(function (entry) { byId[entry.id] = entry; });
    const STATION = DATA.station || {};
    const STATION_READY = STATION.ready === true;
    const KEYWORDS = DATA.keywords || {};
    const ICONS = DATA.icons || {};

    function isReady(id) {
        return Boolean(byId[id] && byId[id].ready === true);
    }

    function readyTools() {
        return TOOLS.filter(function (entry) { return entry.ready === true; });
    }

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    function report(error) {
        if (typeof window.reportError === "function") window.reportError(error);
        else console.error(error);
    }

    function el(tag, className, attributes) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        Object.keys(attributes || {}).forEach(function (name) { element.setAttribute(name, attributes[name]); });
        return element;
    }

    function fileOf(pattern, id) {
        return pattern.replace("{id}", id);
    }

    function toolName(id) {
        return byId[id] ? t(byId[id].name) : id;
    }

    // A tool's picture: its line drawing from the catalogue (our own markup, never typed text)
    function iconSVG(id, size) {
        const paths = ICONS[byId[id] ? byId[id].icon : id] || "";
        return '<svg viewBox="0 0 24 24" width="' + (size || 22) + '" height="' + (size || 22) + '" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + paths + "</svg>";
    }

    const UI_ICONS = {
        back: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M14.5 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        station: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6L5 18a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 14h9"/></svg>',
        bench: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h4M8 15h2M12 15h4"/></svg>',
        notebook: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z"/><path d="M6 3v18M4 7h4M4 12h4M4 17h4M10 8h5M10 12h5"/></svg>'
    };

    // Is the element on the screen right now (and the browser tab visible)?
    function onScreenNow(element) {
        if (document.hidden || !element) return false;
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < window.innerHeight;
    }

    function pageIsOpen() {
        return Boolean(section) && section.classList.contains("page-current");
    }

    // Saved things of a tool (or of the station), under "research.<id>.<name>".
    // check(value) must say yes, or get() gives the fallback: saved data can be old or edited by hand.
    function makeStore(id) {
        const base = "research." + id + ".";
        return {
            get: function (name, fallback, check) {
                const value = A.storage.get(base + name, undefined);
                if (value === undefined) return fallback;
                if (check) {
                    try {
                        if (!check(value)) return fallback;
                    } catch (error) {
                        return fallback;
                    }
                }
                return value;
            },
            set: function (name, value) { return A.storage.set(base + name, value); },
            remove: function (name) { A.storage.remove(base + name); }
        };
    }

    /* =========================================================
       3. THE ADDRESS
       readAddress() -> null (not the lab) or { tab, tool, route, known }.
       Clicks on the tabs, the cards and "All tools" add a step to the
       browser's history (pushState), so Back and Forward go through them;
       an address that only gets more exact ("#research" -> "#research/bench")
       is replaced. Core's own page switch looks for an element with the
       address as its id, which "#research/bench" is not: this file shows the
       page itself (showPage).
       ========================================================= */
    let lastAddress = "";          // the address this file last followed or wrote
    let followed = false;          // an address was followed once (the page has loaded)

    function readAddress() {
        const hash = window.location.hash;
        if (hash !== PREFIX && hash.indexOf(PREFIX + "/") !== 0) return null;
        let rest = hash.slice(PREFIX.length + 1);
        try {
            rest = decodeURIComponent(rest);
        } catch (error) {
            rest = "";
        }
        const parts = rest.split("/");
        const tab = TABS.indexOf(parts[0]) !== -1 ? parts[0] : null;
        return {
            tab: tab,
            tool: tab === "bench" ? (parts[1] || "") : "",
            route: tab === "station" ? cleanRoute(parts.slice(1).join("/")) : "",
            known: !parts[0] || tab !== null
        };
    }

    function cleanRoute(text) {
        return String(text || "").replace(ROUTE_CHARS, "").replace(/^\/+|\/+$/g, "").slice(0, 200);
    }

    // The address of what shows now in a tab
    function addressFor(tab) {
        if (tab === "bench" && tool.id) return PREFIX + "/bench/" + tool.id;
        if (tab === "station" && station.route) return PREFIX + "/station/" + station.route;
        return PREFIX + "/" + tab;
    }

    function writeAddress(hash, push) {
        lastAddress = hash;
        if (window.location.hash === hash) return;
        try {
            if (push) history.pushState(history.state, "", hash);
            else history.replaceState(history.state, "", hash);
        } catch (error) {
            // a page opened from a file may refuse this: the lab works without it
        }
    }

    // Shows the page (core's A.navigate) without a step in the history for "#research"
    function showPage(focus) {
        if (pageIsOpen()) return false;
        const wanted = window.location.hash;
        try {
            history.replaceState(history.state, "", PREFIX);
        } catch (error) {
            // see writeAddress
        }
        A.navigate(PAGE, { focus: focus !== false });
        try {
            history.replaceState(history.state, "", wanted);
        } catch (error) {
            // see writeAddress
        }
        return true;
    }

    // The tab that "#research" alone opens: the last one used, else the station when it
    // is ready, else the bench
    function defaultTab() {
        if (built && currentTab) return currentTab;
        const saved = A.storage.get(TAB_KEY, "");
        if (TABS.indexOf(saved) !== -1) return saved;
        return STATION_READY ? "station" : "bench";
    }

    // The address changed (a link, Back, Forward, a bookmark): show what it names
    function follow() {
        const address = readAddress();
        if (!address) return;
        lastAddress = window.location.hash;
        ensureBuilt();
        const pageChanged = showPage(true);
        let tab = address.tab || defaultTab();
        if (tab === "bench") {
            if (address.tool) {
                if (isReady(address.tool)) {
                    openTool(address.tool, {});
                } else {
                    closeTool({});
                    showNotice(byId[address.tool] ? t("research.bench.notReady", { title: toolName(address.tool) }) : t("research.bench.unknown", { id: address.tool.slice(0, 40) }));
                }
            } else if (address.tab === "bench") {
                closeTool({});      // "#research/bench" is the grid
            }
        }
        if (tab === "station" && address.tab === "station") setStationRoute(address.route);
        selectTab(tab, {});
        // "#research" becomes "#research/bench" (or what shows), without a new step
        writeAddress(addressFor(tab), false);
        // A "#research" link while the page is open already: the focus goes to the tab it shows
        // (never when the page loads: the reader starts at the top, like on every page)
        if (followed && !pageChanged && address.tab === null && tabButtons[tab]) tabButtons[tab].focus({ preventScroll: true });
        followed = true;
    }

    function onAddressChange() {
        if (window.location.hash === lastAddress) return;
        // Another page: remembered, so that coming back to the same lab address is followed
        if (!readAddress()) {
            lastAddress = window.location.hash;
            updateVisibility();
            return;
        }
        follow();
    }

    /* =========================================================
       4. BUILDING THE PAGE: THE HEADER AND THE TABS
       ========================================================= */
    let built = false;
    let currentTab = null;
    const tabButtons = {};
    const tabPanels = {};
    let ui = null;

    function ensureBuilt() {
        if (built || !mount) return;
        built = true;
        mount.textContent = "";
        const hub = el("div", "rs-hub");

        // The bar: the three tabs, and the quiet exam link
        const bar = el("div", "rs-bar");
        const tablist = el("div", "rs-tabs", { role: "tablist", "data-i18n-attr": "aria-label:research.tabs", "aria-label": t("research.tabs") });
        TABS.forEach(function (name) {
            const button = el("button", "rs-tab", { type: "button", role: "tab", id: "rs-tab-" + name, "aria-controls": "rs-panel-" + name, "data-tab": name });
            button.innerHTML = UI_ICONS[name];
            const label = el("span", "rs-tab-label", { "data-i18n": "research.tab." + name });
            label.textContent = t("research.tab." + name);
            button.appendChild(label);
            if (name === "notebook") {
                const count = el("span", "rs-tab-count", { "aria-hidden": "true" });
                const spoken = el("span", "sr-only rs-tab-count-text");
                button.append(count, spoken);
            }
            if (name === "station" && !STATION_READY) button.classList.add("is-soon");
            button.addEventListener("click", function () {
                selectTab(name, { push: true });
            });
            tablist.appendChild(button);
            tabButtons[name] = button;
        });
        tablist.addEventListener("keydown", function (event) {
            const index = TABS.indexOf(document.activeElement && document.activeElement.getAttribute("data-tab"));
            if (index === -1) return;
            let next = -1;
            if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
            else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = TABS.length - 1;
            if (next === -1) return;
            event.preventDefault();
            selectTab(TABS[next], { push: true, focus: true });
        });
        const exam = el("a", "rs-exam", { href: "#learn", "data-i18n": "research.exam" });
        exam.textContent = t("research.exam");
        exam.hidden = true;
        exam.addEventListener("click", function (event) {
            if (!(A.learn && typeof A.learn.exam === "function")) return;     // the link goes to My path
            event.preventDefault();
            A.learn.exam(exam);
        });
        bar.append(tablist, exam);
        hub.appendChild(bar);

        TABS.forEach(function (name) {
            const panel = el("div", "rs-panel rs-panel-" + name, { id: "rs-panel-" + name, role: "tabpanel", "aria-labelledby": "rs-tab-" + name, "data-panel": name });
            panel.hidden = true;
            hub.appendChild(panel);
            tabPanels[name] = panel;
        });
        mount.appendChild(hub);
        ui = { hub: hub, exam: exam };

        buildBench(tabPanels.bench);
        buildStationTab(tabPanels.station);
        buildNotebook(tabPanels.notebook);
        updateExamLink();
        updateCount();

        A.whenVisible(tabPanels.bench, function (visible) {
            onScreen.bench = visible;
            updateVisibility();
        });
        A.whenVisible(tabPanels.station, function (visible) {
            onScreen.station = visible;
            updateVisibility();
        });
        currentTab = null;
        selectTab(defaultTab(), {});
    }

    // The exam link shows only once My path has an exam (A.learn.exam), built by another feature
    function updateExamLink() {
        if (!ui) return;
        A.dom.setHidden(ui.exam, !(A.learn && typeof A.learn.exam === "function"));
    }

    // Shows one tab. options: push (true: a new step in the history, false: replace;
    // left out: the address is not touched), focus (move the focus to the tab)
    function selectTab(name, options) {
        if (TABS.indexOf(name) === -1) return;
        ensureBuilt();
        const settings = options || {};
        const changed = currentTab !== name;
        currentTab = name;
        if (changed) A.storage.set(TAB_KEY, name);
        TABS.forEach(function (other) {
            const on = other === name;
            tabButtons[other].setAttribute("aria-selected", String(on));
            tabButtons[other].tabIndex = on ? 0 : -1;
            A.dom.setHidden(tabPanels[other], !on);
        });
        if (name === "station") ensureStation();
        if (name === "notebook") renderNotebook();
        if (settings.push !== undefined) writeAddress(addressFor(name), settings.push);
        if (settings.focus) tabButtons[name].focus();
        updateVisibility();
        A.layoutChanged();
    }

    /* =========================================================
       5. THE BENCH: THE GRID OF TOOLS
       Four groups of cards, from the catalogue. A ready tool's card is a
       link (#research/bench/<id>): a click opens the tool in place, and the
       grid gives way to a bar with "All tools", the tool's name and a list
       to switch to another one. A tool that is not ready says "Coming soon",
       cannot be opened and loads nothing.
       ========================================================= */
    let bench = null;

    function buildBench(panel) {
        const home = el("div", "rs-bench-home");
        const head = el("div", "rs-bench-head");
        const intro = el("p", "rs-intro", { "data-i18n": "research.bench.intro" });
        intro.textContent = t("research.bench.intro");
        const readyLine = el("p", "rs-ready");
        head.append(intro, readyLine);
        const notice = el("p", "rs-notice", { role: "status" });
        notice.hidden = true;
        const groups = el("div", "rs-groups");
        home.append(head, notice, groups);

        // The open tool: its bar, its line of description and its stage
        const view = el("div", "rs-tool");
        view.hidden = true;
        const toolBar = el("div", "rs-tool-bar");
        const back = el("button", "rs-btn rs-back", { type: "button" });
        back.innerHTML = UI_ICONS.back;
        const backText = el("span", "", { "data-i18n": "research.bench.all" });
        backText.textContent = t("research.bench.all");
        back.appendChild(backText);
        back.addEventListener("click", function () { closeTool({ push: true, focus: true }); });
        const heading = el("div", "rs-tool-heading");
        const icon = el("span", "rs-tool-icon", { "aria-hidden": "true" });
        const title = el("h3", "rs-tool-title", { tabindex: "-1" });
        heading.append(icon, title);
        const switchBox = el("div", "rs-switch");
        const switchLabel = el("label", "sr-only", { for: "rs-switch-select", "data-i18n": "research.bench.switch" });
        switchLabel.textContent = t("research.bench.switch");
        const select = el("select", "rs-switch-select", { id: "rs-switch-select" });
        select.addEventListener("change", function () {
            if (isReady(select.value)) openTool(select.value, { push: true });
        });
        switchBox.append(switchLabel, select);
        toolBar.append(back, heading, switchBox);
        const desc = el("p", "rs-tool-desc");
        const stage = el("div", "rs-stage");
        view.append(toolBar, desc, stage);

        panel.append(home, view);
        bench = { home: home, readyLine: readyLine, notice: notice, groups: groups, view: view, title: title, icon: icon, desc: desc, stage: stage, select: select, back: back };
        renderGrid();
    }

    function renderGrid() {
        if (!bench) return;
        const focusedTool = document.activeElement && bench.groups.contains(document.activeElement)
            ? document.activeElement.closest("[data-tool]") && document.activeElement.closest("[data-tool]").getAttribute("data-tool") : null;
        bench.groups.textContent = "";
        A.dom.setText(bench.readyLine, t("research.bench.ready", { ready: readyTools().length, total: TOOLS.length }));
        GROUPS.forEach(function (group) {
            const tools = TOOLS.filter(function (entry) { return entry.group === group; });
            if (!tools.length) return;
            const box = el("section", "rs-group", { "aria-labelledby": "rs-group-" + group, "data-group": group });
            const title = el("h3", "rs-group-title", { id: "rs-group-" + group });
            const name = el("span", "rs-group-name");
            name.textContent = t("research.bench.group." + group);
            const count = el("span", "rs-group-count");
            count.textContent = A.format.number(tools.filter(function (entry) { return entry.ready === true; }).length) + "/" + A.format.number(tools.length);
            title.append(name, count);
            const list = el("ul", "rs-cards", { role: "list" });
            tools.forEach(function (entry) { list.appendChild(card(entry)); });
            box.append(title, list);
            bench.groups.appendChild(box);
        });
        // A tool's list of the ready ones, to switch
        bench.select.textContent = "";
        readyTools().forEach(function (entry) {
            const option = el("option", "", { value: entry.id });
            option.textContent = t(entry.name);
            bench.select.appendChild(option);
        });
        if (tool.id) bench.select.value = tool.id;
        if (focusedTool) {
            const again = bench.groups.querySelector('[data-tool="' + focusedTool + '"] .rs-card-link');
            if (again) again.focus({ preventScroll: true });
        }
    }

    function card(entry) {
        const ready = entry.ready === true;
        const item = el("li", "rs-card" + (ready ? " is-ready" : " is-soon"), { "data-tool": entry.id });
        const top = el("div", "rs-card-top");
        const icon = el("span", "rs-card-icon", { "aria-hidden": "true" });
        icon.innerHTML = iconSVG(entry.id, 22);
        const descId = "rs-desc-" + entry.id;
        let name;
        if (ready) {
            name = el("a", "rs-card-link", { href: PREFIX + "/bench/" + entry.id, "aria-describedby": descId });
            name.addEventListener("click", function (event) {
                if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;   // a new tab: the browser does it
                event.preventDefault();
                openTool(entry.id, { push: true, focus: true });
            });
        } else {
            name = el("span", "rs-card-name");
        }
        name.textContent = t(entry.name);
        top.append(icon, name);
        const desc = el("p", "rs-card-desc", { id: descId });
        desc.textContent = t(entry.desc);
        item.append(top, desc);
        // The foot: the units of My path behind the tool (by their titles), and "Coming soon"
        const units = (entry.units || []).filter(unitExists);
        if (units.length || !ready) {
            const foot = el("div", "rs-card-foot");
            if (units.length) {
                const line = el("p", "rs-card-units");
                line.textContent = t("research.bench.units", { list: units.map(function (id) { return t("learn.unit." + id); }).join(" · ") });
                foot.appendChild(line);
            }
            if (!ready) {
                const soon = el("span", "rs-soon");
                soon.textContent = t("research.bench.soon");
                foot.appendChild(soon);
            }
            item.appendChild(foot);
        }
        return item;
    }

    // Does this copy of the site have that unit of My path? Asked of the registry in
    // js/content/learn.js (the units of the courses that are stages of the path, and the
    // practice units), never of the network: a unit that is still being written simply
    // isn't shown, and appears by itself once it exists.
    function unitExists(id) {
        const learn = A.content.get("learn");
        if (!learn || !learn.courses) return false;
        const courses = (learn.stages || []).map(function (stage) { return stage.course; }).filter(Boolean).concat(["practice"]);
        return courses.some(function (name) {
            const course = learn.courses[name];
            return Boolean(course && Array.isArray(course.units) && course.units.some(function (unit) { return unit.id === id; }));
        });
    }

    function showNotice(text) {
        if (!bench) return;
        A.dom.setText(bench.notice, text);
        A.dom.setHidden(bench.notice, false);
    }

    function hideNotice() {
        if (bench) A.dom.setHidden(bench.notice, true);
    }

    /* =========================================================
       6. LOADING FILES: THE KITS, A TOOL, THE STATION
       The lab kit (its styles, texts and code), the maths and the bench kit
       load once, before the first tool or the station. Then the tool's
       texts, its code, and its styles if the catalogue says it has some.
       Scripts run in the order they were asked for. core's A.loadScript
       loads a file once and tries again after a failure.
       ========================================================= */
    const specs = Object.create(null);     // what A.research.define() was given, by id

    function define(id, spec) {
        if (!spec || typeof spec.create !== "function") {
            report(new Error("A.research.define(\"" + id + "\"): the spec needs a create(stage, ctx) function"));
            return;
        }
        specs[id] = spec;
    }

    function loadKits() {
        return Promise.all([
            A.loadStyle(KIT_FILES.labStyle),
            A.loadScript(KIT_FILES.labTexts),
            A.loadScript(KIT_FILES.labCode),
            A.loadScript(KIT_FILES.maths),
            A.loadScript(KIT_FILES.code)
        ]).then(function () {
            if (!A.labKit || !A.researchKit || !A.researchMath) throw new Error("The research kits did not load");
        });
    }

    function loadFiles(id, files, withStyle) {
        const kits = loadKits();
        const style = withStyle ? A.loadStyle(fileOf(files.style, id)) : Promise.resolve();
        const texts = A.loadScript(fileOf(files.texts, id));
        const code = Promise.all([kits, texts]).then(function () {
            return specs[id] ? null : A.loadScript(fileOf(files.code, id));
        });
        return Promise.all([style, code]).then(function () {
            if (!specs[id]) throw new Error(fileOf(files.code, id) + " did not call A.research.define(\"" + id + "\", ...)");
            return specs[id];
        });
    }

    // Saved ahead for offline use: the kits, every READY tool, and the station once it is
    // ready (a file that isn't there yet must not be asked for)
    A.keepOffline([KIT_FILES.labStyle, KIT_FILES.labTexts, KIT_FILES.labCode, KIT_FILES.maths, KIT_FILES.code]);
    readyTools().forEach(function (entry) {
        A.keepOffline([fileOf(TOOL_FILES.code, entry.id), fileOf(TOOL_FILES.texts, entry.id)]);
        if (entry.css === true) A.keepOffline(fileOf(TOOL_FILES.style, entry.id));
    });
    if (STATION_READY) {
        A.keepOffline([STATION_FILES.code, STATION_FILES.texts, STATION_FILES.engine]);
        if (STATION.css === true) A.keepOffline(STATION_FILES.style);
    }

    /* =========================================================
       7. A TOOL'S LIFE: CTX, OPENING, CLOSING
       One tool lives at a time. create(stage, ctx) builds it and returns
       its controller { language(), theme(), destroy() } (optionally pause()
       and resume(): called when it leaves the screen and comes back).
       What every tool (and the station) gets in ctx:
         id, title()              its id and its name in the current language
         store                    get(name, fallback, check) / set / remove: "research.<id>.<name>"
         note(entry)              adds { title, inputs, results, text } to the notebook -> { ok, id } or { ok: false, reason, max }
         announce(text)           a message for screen readers (never a flood)
         learn(unitId, opener)    opens that unit of My path (A.learn.step); false if there is none
         visible()                is it on the screen right now?
         onClose(callback)        called when the tool closes (the bench kit uses it)
         openNotebook(opener)     shows the notebook tab
       ========================================================= */
    const tool = { id: null, status: "grid", live: null };      // status: grid, loading, ready, error
    let loadToken = 0;
    const onScreen = { bench: false, station: false };

    function makeCtx(id, record) {
        const ctx = {
            id: id,
            title: function () { return id === "station" ? t("research.tab.station") : toolName(id); },
            store: makeStore(id),
            note: function (entry) { return addFromTool(id, entry); },
            announce: function (text, options) { record.announcer.say(String(text || ""), options); },
            learn: function (unitId, opener) {
                if (!(A.learn && typeof A.learn.step === "function")) return false;
                return A.learn.step(unitId, opener || document.activeElement) !== false;
            },
            visible: function () { return isLive(record) && record.onScreenNow(); },
            onClose: function (callback) {
                if (typeof callback === "function") record.cleanups.push(callback);
            },
            openNotebook: function () {
                showPage(false);
                selectTab("notebook", { push: true, focus: true });
            }
        };
        // The station also gets its own part of the address (section 8)
        if (id === "station") {
            ctx.route = station.route;
            ctx.setRoute = function (rest, options) {
                station.route = cleanRoute(rest);
                ctx.route = station.route;
                if (pageIsOpen() && currentTab === "station") writeAddress(addressFor("station"), !(options && options.replace));
            };
        }
        return ctx;
    }

    function isLive(record) {
        return record === tool.live || record === station.live;
    }

    function call(record, name, value) {
        if (!record || !record.controller || typeof record.controller[name] !== "function") return;
        try {
            record.controller[name](value);
        } catch (error) {
            report(error);
        }
    }

    // Builds a tool or the station in its stage. Returns the record, or null if create() failed.
    function start(id, spec, stage, tab) {
        const element = el("div", "rs-live", { "data-live": id });
        stage.textContent = "";
        stage.removeAttribute("aria-busy");
        stage.appendChild(element);
        const record = {
            id: id,
            tab: tab,
            element: element,
            controller: null,
            cleanups: [],
            paused: false,
            announcer: A.labKit.announcer(),
            // A bench tool counts as on screen when any of it is (its title and question too):
            // on a narrow phone its live part can start below the first screen, and a job must
            // not wait there while the reader is looking at the tool
            onScreenNow: function () {
                return pageIsOpen() && currentTab === tab && onScreenNow(element.closest(".rs-tool") || element);
            }
        };
        record.ctx = makeCtx(id, record);
        if (tab === "bench") tool.live = record;
        else station.live = record;
        try {
            record.controller = spec.create(element, record.ctx) || {};
        } catch (error) {
            report(error);
            finish(record);
            return null;
        }
        LIFE_CYCLE.forEach(function (name) {
            if (typeof record.controller[name] !== "function") report(new Error("research " + id + ": the controller has no " + name + "()"));
        });
        updateVisibility();
        return record;
    }

    // Ends a tool's (or the station's) life: destroy(), then whatever asked to be told
    function finish(record) {
        if (!record) return;
        if (tool.live === record) tool.live = null;
        if (station.live === record) station.live = null;
        record.announcer.cancel();
        call(record, "destroy");
        record.cleanups.splice(0).forEach(function (callback) {
            try {
                callback();
            } catch (error) {
                report(error);
            }
        });
    }

    function teardownTool() {
        loadToken++;
        finish(tool.live);
        if (bench) {
            bench.stage.textContent = "";
            bench.stage.removeAttribute("aria-busy");
        }
    }

    function stageMessage(stage, kind, titleKey, textKey, retry) {
        stage.textContent = "";
        const box = el("div", "rs-stage-msg rs-stage-" + kind, kind === "error" ? { role: "alert" } : { role: "status" });
        if (kind === "loading") {
            stage.setAttribute("aria-busy", "true");
            const line = el("p", "rs-loading");
            line.textContent = t(titleKey);
            box.appendChild(line);
        } else {
            stage.removeAttribute("aria-busy");
            const head = el("h4", "rs-stage-title");
            head.textContent = t(titleKey);
            const text = el("p", "rs-stage-text");
            text.textContent = t(textKey);
            box.append(head, text);
            if (retry) {
                const button = el("button", "rs-btn rs-btn-primary", { type: "button" });
                button.textContent = t("research.bench.retry");
                button.addEventListener("click", retry);
                box.appendChild(button);
            }
        }
        stage.appendChild(box);
    }

    // Opens a ready tool in the bench. how:
    //   push    true / false: write the address (a new step / replace); left out: leave it
    //   focus   move the focus to the tool's title
    //   go      show the page first (from a command, the terminal, another feature)
    // Opening the tool that is open (or loading) changes nothing.
    function openTool(id, how) {
        const options = how || {};
        if (!isReady(id)) return false;
        ensureBuilt();
        if (options.go) showPage(false);
        hideNotice();
        const entry = byId[id];
        const again = tool.id === id && (tool.status === "loading" || tool.status === "ready");
        tool.id = id;
        if (currentTab !== "bench") selectTab("bench", {});
        A.dom.setHidden(bench.home, true);
        A.dom.setHidden(bench.view, false);
        bench.icon.innerHTML = iconSVG(id, 26);
        A.dom.setText(bench.title, t(entry.name));
        A.dom.setText(bench.desc, t(entry.desc));
        bench.select.value = id;
        bench.view.setAttribute("data-tool", id);
        if (!again) {
            teardownTool();
            tool.status = "loading";
            bench.stage.setAttribute("data-tool", id);
            stageMessage(bench.stage, "loading", "research.bench.loading");
            load(id);
        }
        if (options.push !== undefined) writeAddress(addressFor("bench"), options.push);
        if (options.focus) bench.title.focus({ preventScroll: !options.go });
        if (options.go || options.focus) {
            const top = bench.view.getBoundingClientRect().top;
            if (top < 0 || top > window.innerHeight * 0.6) bench.view.scrollIntoView({ block: "start" });
        }
        updateVisibility();
        return true;
    }

    function load(id) {
        const token = loadToken;
        loadFiles(id, TOOL_FILES, byId[id].css === true).then(function (spec) {
            if (token !== loadToken || tool.id !== id) return;
            const record = start(id, spec, bench.stage, "bench");
            if (!record) {
                tool.status = "error";
                stageMessage(bench.stage, "error", "research.bench.errorTitle", "research.bench.errorText", function () { retryTool(id); });
                return;
            }
            tool.status = "ready";
            record.announcer.say(t("research.bench.opened", { title: toolName(id) }));
            A.layoutChanged();
        }, function (error) {
            if (token !== loadToken || tool.id !== id) return;
            report(error);
            tool.status = "error";
            stageMessage(bench.stage, "error", "research.bench.errorTitle", "research.bench.errorText", function () { retryTool(id); });
        });
    }

    function retryTool(id) {
        if (tool.id !== id) return;
        bench.title.focus({ preventScroll: true });
        teardownTool();
        tool.status = "loading";
        stageMessage(bench.stage, "loading", "research.bench.loading");
        load(id);
    }

    // Back to the grid. how: push (the address), focus (the card of the tool that was open)
    function closeTool(how) {
        const options = how || {};
        const was = tool.id;
        teardownTool();
        tool.id = null;
        tool.status = "grid";
        if (bench) {
            A.dom.setHidden(bench.view, true);
            A.dom.setHidden(bench.home, false);
            bench.view.removeAttribute("data-tool");
        }
        if (options.push !== undefined) writeAddress(addressFor("bench"), options.push);
        if (options.focus && was && bench) {
            const link = bench.groups.querySelector('[data-tool="' + was + '"] .rs-card-link');
            if (link) link.focus();
        }
        updateVisibility();
    }

    /* =========================================================
       8. THE EXPERIMENT STATION
       One "ready" flag in js/content/research.js. Until it is set, the tab
       calmly says that the station is being set up and asks for no file.
       Once it is set, the station's files load when its tab first opens
       (js/content/research/station.js, js/research/station.js and, with
       css: true, css/research/station.css), and the station registers like
       a tool: A.research.define("station", { create(stage, ctx) }). It stays
       alive while the page is open. Its ctx has, besides a tool's:
         route                  the address after "#research/station/" ("" for none)
         setRoute(rest, { replace })   the station opened something: the address follows
       and its controller may have route(rest): the address changed
       (Back, Forward, a link), show what it names.
       ========================================================= */
    const station = { status: "idle", live: null, route: "", stage: null };

    function buildStationTab(panel) {
        // Not "rs-stage": that is the bench's stage, and the station lives on in its hidden
        // tab while a tool is open, so one class for both would mix up their parts
        station.stage = el("div", "rs-station-stage");
        panel.appendChild(station.stage);
        if (!STATION_READY) {
            station.status = "soon";
            const box = el("div", "rs-soon-box");
            const icon = el("span", "rs-soon-icon", { "aria-hidden": "true" });
            icon.innerHTML = UI_ICONS.station;
            const head = el("h3", "rs-soon-title", { "data-i18n": "research.station.soonTitle" });
            head.textContent = t("research.station.soonTitle");
            const text = el("p", "rs-soon-text", { "data-i18n": "research.station.soonText" });
            text.textContent = t("research.station.soonText");
            const button = el("button", "rs-btn", { type: "button" });
            const label = el("span", "", { "data-i18n": "research.station.toBench" });
            label.textContent = t("research.station.toBench");
            button.appendChild(label);
            button.addEventListener("click", function () { selectTab("bench", { push: true, focus: true }); });
            box.append(icon, head, text, button);
            station.stage.appendChild(box);
        }
    }

    function ensureStation() {
        if (!STATION_READY || !station.stage) return;
        if (station.status === "loading" || station.status === "ready") return;
        station.status = "loading";
        stageMessage(station.stage, "loading", "research.station.loading");
        loadFiles("station", STATION_FILES, STATION.css === true).then(function (spec) {
            const record = start("station", spec, station.stage, "station");
            if (!record) {
                station.status = "error";
                stageMessage(station.stage, "error", "research.station.errorTitle", "research.station.errorText", retryStation);
                return;
            }
            station.status = "ready";
            A.layoutChanged();
        }, function (error) {
            report(error);
            station.status = "error";
            stageMessage(station.stage, "error", "research.station.errorTitle", "research.station.errorText", retryStation);
        });
    }

    function retryStation() {
        station.status = "idle";
        ensureStation();
    }

    // The address names another place of the station (Back, Forward, a link)
    function setStationRoute(route) {
        if (route === station.route) return;
        station.route = route;
        if (station.live) {
            station.live.ctx.route = route;
            call(station.live, "route", route);
        }
    }

    /* =========================================================
       9. THE NOTEBOOK: ENTRIES, LIMITS, SAVING
       Saved under one key, "research.notebook": { v: 1, entries: [...] }.
       An entry: { id, time, title, text, tool, inputs, results, edited }
         id        letters, digits, "-" and "_" (made here: "n" + time + chance)
         time      when it was written (ms since 1970); edited: when it last changed
         title     one line, 1 to 200 characters
         text      the notes, at most 4,000 characters ("" for none)
         tool      the id of the tool that sent it ("" for a note of the learner's)
         inputs, results   the tool's table: [[name, value]], at most 40 rows of text
       The limit: 300 entries. A full notebook refuses a new entry with a
       message (it never drops an old one). With storage blocked, A.storage
       keeps everything for this visit and the tab says so.
       ========================================================= */
    let notebook = null;        // { entries: [...] }, newest first, read on first use

    function cleanText(value, max) {
        return String(value === undefined || value === null ? "" : value).slice(0, max);
    }

    function cleanLine(value, max) {
        return String(value === undefined || value === null ? "" : value).replace(/\s+/g, " ").trim().slice(0, max);
    }

    function newId() {
        return "n" + Date.now().toString(36) + Math.floor(Math.random() * 1e9).toString(36);
    }

    // Checks one entry strictly. -> { entry } or { problem: "research.nb.err.<name>" }
    function checkEntry(raw) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { problem: "shape" };
        if (typeof raw.id !== "string" || !ENTRY_ID.test(raw.id)) return { problem: "id" };
        if (typeof raw.time !== "number" || !isFinite(raw.time) || raw.time < EARLIEST || raw.time > LATEST) return { problem: "time" };
        if (raw.edited !== undefined && (typeof raw.edited !== "number" || !isFinite(raw.edited) || raw.edited < EARLIEST || raw.edited > LATEST)) return { problem: "time" };
        if (typeof raw.title !== "string" || !raw.title.trim() || raw.title.length > LIMITS.title || /[\r\n]/.test(raw.title)) return { problem: "title" };
        if (raw.text !== undefined && (typeof raw.text !== "string" || raw.text.length > LIMITS.text)) return { problem: "text" };
        if (raw.tool !== undefined && (typeof raw.tool !== "string" || (raw.tool !== "" && !VALID_ID.test(raw.tool)))) return { problem: "tool" };
        const rowsOk = function (rows) {
            return rows === undefined || (Array.isArray(rows) && rows.length <= LIMITS.rows && rows.every(function (row) {
                return Array.isArray(row) && row.length === 2 && typeof row[0] === "string" && typeof row[1] === "string" &&
                    row[0].length <= LIMITS.rowName && row[1].length <= LIMITS.rowValue;
            }));
        };
        if (!rowsOk(raw.inputs) || !rowsOk(raw.results)) return { problem: "rows" };
        // Only the known fields are kept: anything else in the file is dropped
        const entry = { id: raw.id, time: raw.time, title: raw.title.trim(), text: raw.text || "", tool: raw.tool || "" };
        if (raw.edited !== undefined) entry.edited = raw.edited;
        if (raw.inputs && raw.inputs.length) entry.inputs = raw.inputs.map(function (row) { return [row[0], row[1]]; });
        if (raw.results && raw.results.length) entry.results = raw.results.map(function (row) { return [row[0], row[1]]; });
        return { entry: entry };
    }

    function byTime(a, b) {
        return b.time - a.time || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0);
    }

    function loadNotebook() {
        if (notebook) return notebook;
        const saved = A.storage.get(NOTEBOOK_KEY, null);
        const entries = [];
        const seen = new Set();
        if (saved && saved.v === NOTEBOOK_VERSION && Array.isArray(saved.entries)) {
            // Our own data, but it may have been edited by hand: a broken entry is left out
            saved.entries.forEach(function (raw) {
                const checked = checkEntry(raw);
                if (checked.entry && !seen.has(checked.entry.id) && entries.length < LIMITS.entries) {
                    seen.add(checked.entry.id);
                    entries.push(checked.entry);
                }
            });
        }
        entries.sort(byTime);
        notebook = { entries: entries };
        return notebook;
    }

    function saveNotebook() {
        const ok = A.storage.set(NOTEBOOK_KEY, { v: NOTEBOOK_VERSION, entries: notebook.entries });
        updateCount();
        return ok;
    }

    function rowsFrom(rows) {
        if (!Array.isArray(rows)) return undefined;
        const clean = rows.filter(Array.isArray).slice(0, LIMITS.rows).map(function (row) {
            return [cleanLine(row[0], LIMITS.rowName), cleanText(row[1], LIMITS.rowValue)];
        });
        return clean.length ? clean : undefined;
    }

    // Adds an entry -> { ok: true, id } or { ok: false, reason: "full", max }
    function addEntry(fields) {
        loadNotebook();
        if (notebook.entries.length >= LIMITS.entries) return { ok: false, reason: "full", max: LIMITS.entries };
        const entry = {
            id: newId(),
            time: Date.now(),
            title: cleanLine(fields.title, LIMITS.title) || t("research.nb.new"),
            text: cleanText(fields.text, LIMITS.text),
            tool: typeof fields.tool === "string" && VALID_ID.test(fields.tool) ? fields.tool : ""
        };
        const inputs = rowsFrom(fields.inputs);
        const results = rowsFrom(fields.results);
        if (inputs) entry.inputs = inputs;
        if (results) entry.results = results;
        notebook.entries.unshift(entry);
        saveNotebook();
        if (built && currentTab === "notebook") renderNotebook();
        return { ok: true, id: entry.id };
    }

    // ctx.note(entry) of a tool: the tool's id goes with it
    function addFromTool(id, fields) {
        return addEntry(Object.assign({}, fields || {}, { tool: id === "station" ? "station" : id }));
    }

    function entryById(id) {
        loadNotebook();
        return notebook.entries.find(function (entry) { return entry.id === id; }) || null;
    }

    // The number next to "Notebook" in its tab
    function updateCount() {
        if (!built) return;
        const n = loadNotebook().entries.length;
        const button = tabButtons.notebook;
        A.dom.setText(button.querySelector(".rs-tab-count"), n ? A.format.number(n) : "");
        A.dom.setText(button.querySelector(".rs-tab-count-text"), n ? ", " + A.plural("research.tab.count", n) : "");
    }

    /* =========================================================
       10. THE NOTEBOOK TAB
       New note (title and notes), the list newest first, a search box,
       edit in place, delete with a second press. Every word of an entry is
       shown as text, never as HTML.
       ========================================================= */
    let nb = null;
    let editing = null;          // the id being edited, or "new"
    let query = "";

    function buildNotebook(panel) {
        const intro = el("p", "rs-intro", { "data-i18n": "research.nb.intro" });
        intro.textContent = t("research.nb.intro");
        const blocked = el("p", "rs-blocked", { role: "note" });
        blocked.hidden = true;
        const toolbar = el("div", "rs-nb-toolbar");
        const newButton = el("button", "rs-btn rs-btn-primary rs-nb-new", { type: "button" });
        newButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
        const newLabel = el("span", "", { "data-i18n": "research.nb.new" });
        newLabel.textContent = t("research.nb.new");
        newButton.appendChild(newLabel);
        newButton.addEventListener("click", function () { startEdit("new"); });
        const searchBox = el("div", "rs-nb-search");
        const searchLabel = el("label", "sr-only", { for: "rs-nb-search", "data-i18n": "research.nb.search" });
        searchLabel.textContent = t("research.nb.search");
        const search = el("input", "rs-input rs-nb-search-input", { id: "rs-nb-search", type: "search", autocomplete: "off", spellcheck: "false", "data-i18n-attr": "placeholder:research.nb.searchHint" });
        search.placeholder = t("research.nb.searchHint");
        search.addEventListener("input", function () {
            query = search.value;
            renderList();
        });
        searchBox.append(searchLabel, search);
        const files = el("div", "rs-nb-files");
        const exportMd = el("button", "rs-btn rs-btn-sm", { type: "button", "data-i18n": "research.nb.exportMd" });
        exportMd.textContent = t("research.nb.exportMd");
        exportMd.addEventListener("click", function () { exportFile("md"); });
        const exportJson = el("button", "rs-btn rs-btn-sm", { type: "button", "data-i18n": "research.nb.exportJson" });
        exportJson.textContent = t("research.nb.exportJson");
        exportJson.addEventListener("click", function () { exportFile("json"); });
        const importButton = el("button", "rs-btn rs-btn-sm", { type: "button", "data-i18n": "research.nb.import" });
        importButton.textContent = t("research.nb.import");
        const fileInput = el("input", "rs-nb-file", { type: "file", accept: ".json,application/json", tabindex: "-1", "aria-hidden": "true" });
        fileInput.hidden = true;
        importButton.addEventListener("click", function () { fileInput.click(); });
        fileInput.addEventListener("change", function () {
            const file = fileInput.files && fileInput.files[0];
            fileInput.value = "";
            if (file) importFile(file);
        });
        files.append(exportMd, exportJson, importButton, fileInput);
        toolbar.append(newButton, searchBox, files);
        const message = el("p", "rs-nb-msg", { role: "status" });
        const editor = el("div", "rs-nb-editor-slot");
        const count = el("p", "rs-nb-count");
        const listBox = el("div", "rs-nb-list");
        panel.append(intro, blocked, toolbar, message, editor, count, listBox);
        nb = { blocked: blocked, toolbar: toolbar, newButton: newButton, search: search, message: message, editor: editor, count: count, list: listBox, exportMd: exportMd, exportJson: exportJson };
    }

    function say(text, tone) {
        if (!nb) return;
        A.dom.setText(nb.message, text || "");
        nb.message.setAttribute("data-tone", tone || "info");
        A.dom.setHidden(nb.message, !text);
    }

    function renderNotebook() {
        if (!nb) return;
        loadNotebook();
        A.dom.setHidden(nb.blocked, A.storage.available());
        A.dom.setText(nb.blocked, t("research.nb.blocked"));
        renderList();
    }

    function words(text) {
        return String(text || "").toLowerCase().split(/\s+/).filter(Boolean);
    }

    function haystack(entry) {
        const parts = [entry.title, entry.text, entry.tool ? toolName(entry.tool) : "", entry.tool];
        (entry.inputs || []).concat(entry.results || []).forEach(function (row) { parts.push(row[0], row[1]); });
        return parts.join(" \n ").toLowerCase();
    }

    function matching() {
        const wanted = words(query);
        if (!wanted.length) return notebook.entries.slice();
        return notebook.entries.filter(function (entry) {
            const text = haystack(entry);
            return wanted.every(function (word) { return text.indexOf(word) !== -1; });
        });
    }

    function timeText(time) {
        return A.format.date(time, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    function renderList() {
        if (!nb) return;
        const all = loadNotebook().entries;
        const shown = matching();
        const q = query.trim();
        if (q) A.dom.setText(nb.count, t("research.nb.match", { n: A.format.number(shown.length), total: A.format.number(all.length), q: q.slice(0, 80) }));
        else A.dom.setText(nb.count, A.plural("research.nb.count", all.length, { max: A.format.number(LIMITS.entries) }));
        const focusId = document.activeElement && nb.list.contains(document.activeElement) && document.activeElement.closest("[data-id]")
            ? document.activeElement.closest("[data-id]").getAttribute("data-id") : null;
        const focusAction = focusId ? document.activeElement.getAttribute("data-action") : null;
        // An entry being edited keeps its form (and what is typed in it) through a new drawing
        const kept = editing && editing !== "new" ? nb.list.querySelector('form[data-id="' + editing + '"]') : null;
        const focusInKept = kept && kept.contains(document.activeElement) ? document.activeElement : null;
        nb.list.textContent = "";
        if (!all.length) {
            const empty = el("p", "rs-nb-empty");
            empty.textContent = t("research.nb.empty");
            nb.list.appendChild(empty);
        } else if (!shown.length) {
            const none = el("p", "rs-nb-empty");
            none.textContent = t("research.nb.noMatch", { q: q.slice(0, 80) });
            nb.list.appendChild(none);
        }
        shown.forEach(function (entry) {
            if (editing !== entry.id) {
                nb.list.appendChild(entryCard(entry));
            } else if (kept) {
                kept.relabel();
                nb.list.appendChild(kept);
            } else {
                nb.list.appendChild(editorFor(entry));
            }
        });
        if (focusInKept && focusInKept.isConnected) focusInKept.focus({ preventScroll: true });
        else if (focusId) {
            const again = nb.list.querySelector('[data-id="' + focusId + '"] [data-action="' + (focusAction || "edit") + '"]') ||
                nb.list.querySelector('[data-id="' + focusId + '"] [data-action="edit"]');
            if (again) again.focus({ preventScroll: true });
        }
        renderNewEditor();
        A.layoutChanged();
    }

    function rowsTable(captionKey, rows) {
        const table = el("table", "rs-entry-table");
        const caption = el("caption");
        caption.textContent = t(captionKey);
        table.appendChild(caption);
        const body = el("tbody");
        rows.forEach(function (row) {
            const line = el("tr");
            const name = el("th", "", { scope: "row" });
            name.textContent = row[0];
            const value = el("td");
            value.textContent = row[1];
            line.append(name, value);
            body.appendChild(line);
        });
        table.appendChild(body);
        return table;
    }

    function entryCard(entry) {
        const item = el("article", "rs-entry" + (entry.tool ? " is-tool" : ""), { "data-id": entry.id, "aria-labelledby": "rs-entry-" + entry.id });
        const head = el("header", "rs-entry-head");
        const title = el("h4", "rs-entry-title", { id: "rs-entry-" + entry.id });
        title.textContent = entry.title;
        const meta = el("p", "rs-entry-meta");
        const time = el("time", "rs-entry-time", { datetime: new Date(entry.time).toISOString() });
        time.textContent = timeText(entry.time);
        meta.appendChild(time);
        if (entry.tool) {
            const from = el("span", "rs-entry-tool");
            from.textContent = t("research.nb.from", { tool: entry.tool === "station" ? t("research.tab.station") : toolName(entry.tool) });
            meta.appendChild(from);
        }
        head.append(title, meta);
        item.appendChild(head);
        if (entry.text) {
            const text = el("p", "rs-entry-text");
            text.textContent = entry.text;
            item.appendChild(text);
        }
        if (entry.inputs || entry.results) {
            const tables = el("div", "rs-entry-tables");
            if (entry.inputs) tables.appendChild(rowsTable("research.nb.inputs", entry.inputs));
            if (entry.results) tables.appendChild(rowsTable("research.nb.results", entry.results));
            item.appendChild(tables);
        }
        const actions = el("div", "rs-entry-actions");
        const edit = el("button", "rs-btn rs-btn-sm", { type: "button", "data-action": "edit", "aria-label": t("research.nb.editLabel", { title: entry.title }) });
        edit.textContent = t("research.nb.edit");
        edit.addEventListener("click", function () { startEdit(entry.id); });
        const remove = el("button", "rs-btn rs-btn-sm rs-btn-danger", { type: "button", "data-action": "delete", "aria-label": t("research.nb.deleteLabel", { title: entry.title }) });
        remove.textContent = t("research.nb.delete");
        A.confirmPress(remove, {
            onArm: function () {
                remove.textContent = t("research.nb.deleteAsk");
                remove.setAttribute("aria-label", t("research.nb.deleteAsk"));
                remove.classList.add("is-armed");
                A.announce(t("research.nb.deleteAsk"));
            },
            onDisarm: function () {
                remove.textContent = t("research.nb.delete");
                remove.setAttribute("aria-label", t("research.nb.deleteLabel", { title: entry.title }));
                remove.classList.remove("is-armed");
            },
            onConfirm: function () { deleteEntry(entry.id); }
        });
        actions.append(edit, remove);
        item.appendChild(actions);
        return item;
    }

    function deleteEntry(id) {
        loadNotebook();
        const shown = matching();
        const index = shown.findIndex(function (entry) { return entry.id === id; });
        notebook.entries = notebook.entries.filter(function (entry) { return entry.id !== id; });
        saveNotebook();
        // Signed in, the copy in the account loses it too (js/account.js)
        A.emit("removed", { key: NOTEBOOK_KEY, items: [id] });
        if (editing === id) editing = null;
        renderList();
        say(t("research.nb.deleted"), "info");
        A.announce(t("research.nb.deleted"));
        // The focus goes to the next entry (or the one before, or "New note")
        const rest = matching();
        const next = rest[Math.min(index, rest.length - 1)];
        const target = next ? nb.list.querySelector('[data-id="' + next.id + '"] [data-action="edit"]') : null;
        (target || nb.newButton).focus({ preventScroll: true });
    }

    // ----- Writing and editing an entry -----
    function startEdit(id) {
        if (id === "new") {
            loadNotebook();
            if (notebook.entries.length >= LIMITS.entries) {
                say(t("research.nb.full", { max: A.format.number(LIMITS.entries) }), "bad");
                return;
            }
        }
        editing = id;
        say("", "info");
        renderList();
        const box = id === "new" ? nb.editor : nb.list.querySelector('[data-id="' + id + '"]');
        const input = box && box.querySelector(".rs-nb-title-input");
        if (input) {
            input.focus();
            if (id === "new") input.scrollIntoView({ block: "nearest" });
        }
    }

    function renderNewEditor() {
        if (!nb) return;
        const open = editing === "new";
        if (!open) {
            nb.editor.textContent = "";
            return;
        }
        if (nb.editor.firstChild) {              // already open: keep what is typed
            nb.editor.firstChild.relabel();
            return;
        }
        nb.editor.appendChild(editorFor(null));
    }

    // The form for a new entry (entry: null) or an entry being edited
    function editorFor(entry) {
        const form = el("form", "rs-nb-editor", entry ? { "data-id": entry.id } : { "data-new": "" });
        form.setAttribute("novalidate", "");
        const key = entry ? entry.id : "new";
        const titleId = "rs-nb-title-" + key;
        const textId = "rs-nb-text-" + key;
        const titleLabel = el("label", "rs-label", { for: titleId });
        titleLabel.textContent = t("research.nb.fieldTitle");
        const title = el("input", "rs-input rs-nb-title-input", { id: titleId, type: "text", autocomplete: "off" });
        title.value = entry ? entry.title : "";
        const textLabel = el("label", "rs-label", { for: textId });
        textLabel.textContent = t("research.nb.fieldText");
        const text = el("textarea", "rs-input rs-nb-text-input", { id: textId, rows: entry && entry.text.length > 300 ? "10" : "5" });
        text.value = entry ? entry.text : "";
        const counter = el("p", "rs-nb-counter", { id: textId + "-count" });
        const problem = el("p", "rs-nb-problem", { role: "alert" });
        problem.hidden = true;
        text.setAttribute("aria-describedby", counter.id);
        function count() {
            A.dom.setText(counter, t("research.nb.textCount", { n: A.format.number(text.value.length), max: A.format.number(LIMITS.text) }));
            counter.classList.toggle("is-over", text.value.length > LIMITS.text);
        }
        text.addEventListener("input", count);
        count();
        const actions = el("div", "rs-nb-editor-actions");
        const save = el("button", "rs-btn rs-btn-primary", { type: "submit" });
        save.textContent = t("research.nb.save");
        const cancel = el("button", "rs-btn", { type: "button" });
        cancel.textContent = t("research.nb.cancel");
        cancel.addEventListener("click", function () { stopEdit(entry ? entry.id : null); });
        actions.append(save, cancel);
        form.append(titleLabel, title, textLabel, text, counter, problem, actions);
        // After a language switch: the same form, its words in the new language
        form.relabel = function () {
            titleLabel.textContent = t("research.nb.fieldTitle");
            textLabel.textContent = t("research.nb.fieldText");
            save.textContent = t("research.nb.save");
            cancel.textContent = t("research.nb.cancel");
            problem.hidden = true;
            count();
        };
        form.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                event.preventDefault();
                stopEdit(entry ? entry.id : null);
            }
        });
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const cleanTitle = title.value.replace(/\s+/g, " ").trim();
            let wrong = "";
            if (!cleanTitle) wrong = t("research.nb.titleNeeded");
            else if (cleanTitle.length > LIMITS.title) wrong = t("research.nb.titleLong", { max: A.format.number(LIMITS.title) });
            else if (text.value.length > LIMITS.text) wrong = t("research.nb.textLong", { max: A.format.number(LIMITS.text), n: A.format.number(text.value.length) });
            if (wrong) {
                A.dom.setText(problem, wrong);
                problem.hidden = false;
                (cleanTitle && cleanTitle.length <= LIMITS.title ? text : title).focus();
                return;
            }
            if (entry) {
                const stored = entryById(entry.id);
                if (stored) {
                    stored.title = cleanTitle;
                    stored.text = text.value;
                    stored.edited = Date.now();
                    saveNotebook();
                }
                editing = null;
                renderList();
                say(t("research.nb.saved"), "good");
                const again = nb.list.querySelector('[data-id="' + entry.id + '"] [data-action="edit"]');
                if (again) again.focus({ preventScroll: true });
            } else {
                const answer = addEntry({ title: cleanTitle, text: text.value, tool: "" });
                if (!answer.ok) {
                    A.dom.setText(problem, t("research.nb.full", { max: A.format.number(LIMITS.entries) }));
                    problem.hidden = false;
                    return;
                }
                editing = null;
                nb.editor.textContent = "";
                query = "";
                nb.search.value = "";
                renderList();
                say(t("research.nb.added"), "good");
                const first = nb.list.querySelector('[data-id="' + answer.id + '"] [data-action="edit"]');
                (first || nb.newButton).focus({ preventScroll: true });
            }
        });
        return form;
    }

    function stopEdit(id) {
        editing = null;
        nb.editor.textContent = "";
        renderList();
        const target = id ? nb.list.querySelector('[data-id="' + id + '"] [data-action="edit"]') : nb.newButton;
        if (target) target.focus({ preventScroll: true });
    }

    /* =========================================================
       11. THE NOTEBOOK: EXPORT AND IMPORT
       Export: Markdown (to read and to paste into a paper's notes) or JSON
       (to move the notebook to another browser). Import takes such a JSON
       file and checks everything in it: its size (2 MB at most), that it is
       a notebook file of this site in a version we know, at most 300 entries,
       and each entry in full (section 9). The first problem refuses the whole
       file and says which entry it is. Entries that are already here (the
       same id) are skipped; the others are added, if the notebook has room.
       ========================================================= */
    function today() {
        const date = new Date();
        const pad = function (n) { return (n < 10 ? "0" : "") + n; };
        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    }

    function mdCell(text) {
        return String(text).replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\s*[\r\n]+\s*/g, " ").trim() || " ";
    }

    function markdown() {
        const lines = ["# " + t("research.nb.mdTitle"), "", t("research.nb.mdExported", { date: A.format.date(Date.now()) }), ""];
        loadNotebook().entries.forEach(function (entry) {
            lines.push("## " + entry.title.replace(/^#+\s*/, ""), "");
            let meta = timeText(entry.time);
            if (entry.tool) meta += " · " + t("research.nb.from", { tool: entry.tool === "station" ? t("research.tab.station") : toolName(entry.tool) });
            lines.push("*" + meta + "*", "");
            if (entry.text) lines.push(entry.text, "");
            [["research.nb.inputs", entry.inputs], ["research.nb.results", entry.results]].forEach(function (pair) {
                if (!pair[1]) return;
                lines.push("**" + t(pair[0]) + "**", "", "| " + t("research.nb.mdName") + " | " + t("research.nb.mdValue") + " |", "| --- | --- |");
                pair[1].forEach(function (row) { lines.push("| " + mdCell(row[0]) + " | " + mdCell(row[1]) + " |"); });
                lines.push("");
            });
        });
        return lines.join("\n");
    }

    function exportFile(kind) {
        const name = "research-notebook-" + today() + "." + kind;
        const text = kind === "md" ? markdown() : JSON.stringify({
            app: FILE_MARK,
            v: NOTEBOOK_VERSION,
            exported: new Date().toISOString(),
            entries: loadNotebook().entries
        }, null, 2);
        const address = URL.createObjectURL(new Blob([text], { type: kind === "md" ? "text/markdown;charset=utf-8" : "application/json" }));
        const link = el("a", "", { href: address, download: name });
        link.hidden = true;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(address); }, URL_LIFE);
        say(t("research.nb.exported", { name: name }), "good");
    }

    // Reads a notebook file. -> { entries } or { error: text }
    function readFileText(text) {
        let data;
        try {
            data = JSON.parse(text);
        } catch (error) {
            return { error: t("research.nb.err.notJson") };
        }
        if (!data || typeof data !== "object" || Array.isArray(data) || data.app !== FILE_MARK) return { error: t("research.nb.err.notNotebook") };
        if (typeof data.v !== "number") return { error: t("research.nb.err.notNotebook") };
        if (data.v > NOTEBOOK_VERSION) return { error: t("research.nb.err.version") };
        if (data.v !== NOTEBOOK_VERSION || !Array.isArray(data.entries)) return { error: t("research.nb.err.notNotebook") };
        if (data.entries.length > LIMITS.entries) return { error: t("research.nb.err.tooMany", { n: A.format.number(data.entries.length), max: A.format.number(LIMITS.entries) }) };
        const entries = [];
        const seen = new Set();
        for (let i = 0; i < data.entries.length; i++) {
            const checked = checkEntry(data.entries[i]);
            let problem = checked.problem ? t("research.nb.err." + checked.problem, { max: A.format.number(checked.problem === "title" ? LIMITS.title : checked.problem === "text" ? LIMITS.text : LIMITS.rows) }) : "";
            if (!problem && seen.has(checked.entry.id)) problem = t("research.nb.err.twice");
            if (problem) return { error: t("research.nb.err.entry", { n: A.format.number(i + 1), problem: problem }) };
            seen.add(checked.entry.id);
            entries.push(checked.entry);
        }
        return { entries: entries };
    }

    function importFile(file) {
        if (!(file.size <= LIMITS.fileBytes)) {
            say(t("research.nb.err.tooBig"), "bad");
            return;
        }
        file.text().then(function (text) {
            const read = readFileText(text);
            if (read.error) {
                say(read.error, "bad");
                return;
            }
            loadNotebook();
            const have = new Set(notebook.entries.map(function (entry) { return entry.id; }));
            const fresh = read.entries.filter(function (entry) { return !have.has(entry.id); });
            if (!fresh.length) {
                say(t("research.nb.importNone"), "info");
                return;
            }
            const total = notebook.entries.length + fresh.length;
            if (total > LIMITS.entries) {
                say(t("research.nb.importFull", { n: A.format.number(total), max: A.format.number(LIMITS.entries) }), "bad");
                return;
            }
            notebook.entries = notebook.entries.concat(fresh).sort(byTime);
            saveNotebook();
            renderList();
            say(t("research.nb.importDone", { added: A.format.number(fresh.length), total: A.format.number(read.entries.length), same: A.format.number(read.entries.length - fresh.length) }), "good");
        }, function () {
            say(t("research.nb.err.read"), "bad");
        });
    }

    /* =========================================================
       12. FOLLOWING THE LANGUAGE, THE LOOK AND THE SCREEN
       ========================================================= */
    // pause() / resume() (optional) when a tool or the station leaves the screen and comes back
    function updateVisibility() {
        [tool.live, station.live].forEach(function (record) {
            if (!record || !record.controller) return;
            const visible = pageIsOpen() && currentTab === record.tab && onScreen[record.tab] && !document.hidden;
            if (!visible && !record.paused) {
                record.paused = true;
                call(record, "pause");
            } else if (visible && record.paused) {
                record.paused = false;
                call(record, "resume");
            }
        });
    }

    A.onLanguageChange(function () {
        if (!built) return;
        renderGrid();
        if (tool.id && bench) {
            A.dom.setText(bench.title, toolName(tool.id));
            A.dom.setText(bench.desc, t(byId[tool.id].desc));
        }
        if (tool.status === "loading") stageMessage(bench.stage, "loading", "research.bench.loading");
        else if (tool.status === "error") stageMessage(bench.stage, "error", "research.bench.errorTitle", "research.bench.errorText", function () { retryTool(tool.id); });
        if (station.status === "loading") stageMessage(station.stage, "loading", "research.station.loading");
        else if (station.status === "error") stageMessage(station.stage, "error", "research.station.errorTitle", "research.station.errorText", retryStation);
        updateCount();
        if (currentTab === "notebook") renderNotebook();     // the other tabs draw it when it opens
        say("", "info");
        call(tool.live, "language");
        call(station.live, "language");
    });

    A.onThemeChange(function () {
        call(tool.live, "theme");
        call(station.live, "theme");
    });

    // A look (Arctic Blue, Lagoon...) can change the colours without changing the theme
    A.on("settings", function (detail) {
        if (detail && detail.name === "look") {
            call(tool.live, "theme");
            call(station.live, "theme");
        }
    });

    document.addEventListener("visibilitychange", updateVisibility);

    // The page was shown (by the menu, a command, another feature): build it, and give the
    // address its tab ("#research" -> "#research/bench")
    A.on("page", function (detail) {
        if (!detail || detail.id !== PAGE) {
            // Another page shows: a later lab address (a link, Back) must be followed, even
            // the one this file wrote last
            lastAddress = "";
            updateVisibility();
            return;
        }
        ensureBuilt();
        updateExamLink();
        setTimeout(function () {
            if (pageIsOpen() && window.location.hash === PREFIX) writeAddress(addressFor(currentTab || defaultTab()), false);
            updateVisibility();
        }, 0);
        updateVisibility();
    });

    A.on("feature", function (detail) {
        if (detail && detail.name === "learn") updateExamLink();
    });

    window.addEventListener("popstate", onAddressChange);
    window.addEventListener("hashchange", onAddressChange);
    // On page load, once every script has run (core showed the home page for "#research/...")
    A.ready(function () {
        updateExamLink();
        if (readAddress()) follow();
        else if (pageIsOpen()) ensureBuilt();
    });

    /* =========================================================
       13. COMMANDS AND AICompass.research
       Ctrl+K: "Research lab" comes from SECTIONS in js/core.js; here one
       command per READY tool ("Bench: Error bars and sample size").
       ========================================================= */
    readyTools().forEach(function (entry) {
        A.registerCommand({
            id: "research-" + entry.id,
            group: "research.cmdGroup",
            icon: "🔬",
            title: function () { return t("research.cmdBench", { title: t(entry.name) }); },
            keywords: [entry.id, KEYWORDS[entry.id] || ""].join(" "),
            run: function () { openTool(entry.id, { push: true, go: true, focus: true }); }
        });
    });

    // AICompass.research: what tools, the terminal (js/pro.js) and other features use
    //   define(id, spec)          a tool's file (or the station's) registers itself
    //   open(where, options)      shows the page: where = "bench" | "station" | "notebook" | a tool id
    //                             (nothing: the last tab). options.focus: true moves the focus there
    //   openTool(id, options)     opens a ready tool (false for an unknown or unready one)
    //   tools()                   the catalogue: [{ id, ready, group, name, desc, units }]
    //   note(entry)               adds an entry ({ title, text }) -> { ok, id } or { ok: false, reason, max }
    //   entries()                 a copy of the notebook's entries, newest first
    //   current()                 { tab, tool }: what shows now
    function open(where, options) {
        const settings = options || {};
        ensureBuilt();
        if (where && byId[where]) {
            if (!isReady(where)) return false;
            return openTool(where, { push: true, go: true, focus: settings.focus !== false });
        }
        const tab = TABS.indexOf(where) !== -1 ? where : defaultTab();
        showPage(settings.focus !== false && !where);
        if (tab === "bench" && where === "bench" && tool.id) closeTool({});
        selectTab(tab, { push: true, focus: Boolean(where) && settings.focus !== false });
        return true;
    }

    A.feature("research", {
        define: define,
        open: open,
        openTool: function (id, options) {
            return openTool(id, { push: true, go: true, focus: !(options && options.focus === false) });
        },
        tools: function () {
            return TOOLS.map(function (entry) {
                return { id: entry.id, ready: entry.ready === true, group: entry.group, name: entry.name, desc: entry.desc, units: (entry.units || []).slice() };
            });
        },
        // (a title longer than a title may be keeps its start; the whole line goes into the notes)
        note: function (entry) {
            const fields = Object.assign({}, entry || {}, { tool: "" });
            const title = cleanLine(fields.title, LIMITS.text);
            if (title.length > LIMITS.title) {
                fields.text = title + (fields.text ? "\n\n" + fields.text : "");
                fields.title = title.slice(0, 120) + "…";
            }
            return addEntry(fields);
        },
        entries: function () { return JSON.parse(JSON.stringify(loadNotebook().entries)); },
        current: function () { return { tab: currentTab, tool: tool.id }; },
        limits: Object.freeze(Object.assign({}, LIMITS))
    });
})();
