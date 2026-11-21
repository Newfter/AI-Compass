/* =========================================================
   AI COMPASS — THE LOOKS OF THE SITE (the register)
   A look is the colours of the whole site. There are ten, and one is on:

        everyday             Like my device · Dark · Light · Paper & Ink
        seasons and places   Arctic Blue · Cherry Blossom · Tropical Lagoon ·
                             Autumn Maple · Deep Forest · Deep Space

   The visitor chooses the look in Settings (js/settings.js draws its picker
   from A.mode.list()). Ctrl+K has "Next look", the Pro terminal has "look".

   How it is built: Dark and Light are the two themes of core.js
   (<html data-theme="dark|light">, saved as "aic:theme"). Every other look is
   a palette on top of one of them: <html data-palette="lagoon"> together with
   the theme it is built on, saved as "aic:palette". The colours of a palette
   are in a css file of its own (css/arctic-blue.css, css/lagoon.css); a
   palette without a css file simply shows its base theme. "Like my device" is
   not a palette: js/settings.js then picks Dark or Light for the device.
   The small script in the <head> of index.html restores the palette before
   the first paint. This file knows every look, and keeps the palette, its
   base theme and the colour of the phone's address bar in step.

   To add an eleventh look:
     1. its colours in a new css file (copy css/lagoon.css), linked in
        index.html after the other palettes;
     2. an entry in PALETTES and in LOOKS below, and its id in ORDER;
     3. its name ("core.mode...") in js/content/page.js and its sentence
        ("settings.lookAbout.<id>") in js/content/settings.js, in English
        and in Russian;
     4. its id and base theme in the table of the <head> script of index.html
        (dev/tests/looks.test.js checks that the table and PALETTES agree).
   Settings, Ctrl+K and the Pro terminal then show it by themselves.

   API:  A.mode.current      the look that is on: "dark", "light" or a palette's id
         A.mode.set(id)      switches to it; false for an id that is not a look
         A.mode.cycle()      the next look, with a toast
         A.mode.list()       every look in the order of the picker:
                             [{ id, base, group, icon, name, effect, swatch }]
         A.mode.info(id)     one of them, or null
         A.mode.copying      true while this tab copies a look chosen in another tab
         A.palette.name (or null) / set(name or null) / on
                             (only while the page starts: js/palette.js, the
                             Ctrl+K window, takes the name A.palette later.
                             Use A.mode.)
   ========================================================= */
(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;                                   // core.js failed to load

    const root = document.documentElement;
    const KEY = "palette";                            // saved as "aic:palette"

    // Every palette: the theme it is built on, and the colour of the phone's address bar
    // (its --bg). The <head> script of index.html has the same ids and base themes.
    const PALETTES = {
        paper:   { base: "light", bar: "#f6efe0" },
        arctic:  { base: "dark",  bar: "#061a33" },     // css/arctic-blue.css
        blossom: { base: "light", bar: "#fef6f8" },
        lagoon:  { base: "dark",  bar: "#032a30" },     // css/lagoon.css
        autumn:  { base: "dark",  bar: "#1c120d" },
        forest:  { base: "dark",  bar: "#0a1c14" },
        space:   { base: "dark",  bar: "#100b2d" }
    };

    // The order of the picker in Settings, and of A.mode.cycle()
    const ORDER = ["dark", "light", "paper", "arctic", "blossom", "lagoon", "autumn", "forest", "space"];

    // The five colours of a look's small preview in Settings
    function colours(bg, surface, accent, accent2, text) {
        return { bg: bg, surface: surface, accent: accent, accent2: accent2, text: text };
    }

    // What the site shows about each look:
    //   icon     one emoji
    //   text     the key of its name (js/content/page.js)
    //   group    the part of the picker it is in: "everyday" or "nature"
    //   effect   the key of the words for its animation ("falling snow"), or null: it has none
    //   swatch   the preview: the page, a card, the two accent colours, the text
    const LOOKS = {
        dark:    { icon: "🌙", text: "core.modeDark",    group: "everyday", effect: null,
                   swatch: colours("#050b14", "#0d1729", "#8f7bff", "#5fe3cf", "#eef1ff") },      // style.css
        light:   { icon: "☀️", text: "core.modeLight",   group: "everyday", effect: null,
                   swatch: colours("#f2f5fa", "#ffffff", "#5a44de", "#08766a", "#12162b") },      // style.css
        paper:   { icon: "📜", text: "core.modePaper",   group: "everyday", effect: null,
                   swatch: colours("#f6efe0", "#fcf7ec", "#1f4b99", "#0c6e72", "#211a14") },
        arctic:  { icon: "❄️", text: "core.modeArctic",  group: "nature",   effect: "core.effectSnow",
                   swatch: colours("#061a33", "#0d2a4f", "#4db8ff", "#9be9ff", "#f0f9ff") },      // css/arctic-blue.css
        blossom: { icon: "🌸", text: "core.modeBlossom", group: "nature",   effect: "core.effectPetals",
                   swatch: colours("#fef6f8", "#ffffff", "#b12b5a", "#36701e", "#2d1a25") },
        lagoon:  { icon: "🌴", text: "core.modeLagoon",  group: "nature",   effect: "core.effectBubbles",
                   swatch: colours("#032a30", "#07434b", "#00d9b8", "#c4f23a", "#effffc") },      // css/lagoon.css
        autumn:  { icon: "🍁", text: "core.modeAutumn",  group: "nature",   effect: "core.effectLeaves",
                   swatch: colours("#1c120d", "#2b1c14", "#ffa64d", "#f5cf6b", "#fff3e6") },
        forest:  { icon: "🌲", text: "core.modeForest",  group: "nature",   effect: "core.effectFireflies",
                   swatch: colours("#0a1c14", "#12291e", "#8fe07a", "#ffd86b", "#eefaf0") },
        space:   { icon: "🌌", text: "core.modeSpace",   group: "nature",   effect: "core.effectStars",
                   swatch: colours("#100b2d", "#1a1345", "#b79bff", "#5fe1e8", "#f5f3ff") }
    };

    // true while this file sets the theme itself: the palette must not step aside then
    let stepping = false;
    // true while this tab copies the look that another tab chose (nobody picked it here)
    let copying = false;

    function isPalette(name) {
        return typeof name === "string" && Object.prototype.hasOwnProperty.call(PALETTES, name);
    }

    // The palette that is on, or null
    function paletteName() {
        const name = root.getAttribute("data-palette");
        return isPalette(name) ? name : null;
    }

    function isOn() {
        return paletteName() !== null;
    }

    // The look that is on: the palette, or else the plain theme
    function current() {
        return paletteName() || (A.theme === "light" ? "light" : "dark");
    }

    function next(mode) {
        return ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    }

    // The saved palette, or null (also for a saved name that this file does not know)
    function savedPalette() {
        const name = A.storage.get(KEY, null);
        return isPalette(name) ? name : null;
    }

    // What the rest of the site may know about a look. A copy, with the texts in the
    // language of the page: nobody can change the register by accident.
    function info(id) {
        if (ORDER.indexOf(id) === -1) return null;
        const look = LOOKS[id];
        return {
            id: id,
            base: isPalette(id) ? PALETTES[id].base : id,
            group: look.group,
            icon: look.icon,
            name: A.t(look.text),
            effect: look.effect ? A.t(look.effect) : "",       // "" = no animation
            swatch: Object.assign({}, look.swatch)
        };
    }

    function list() {
        return ORDER.map(info);
    }

    // The two <meta name="theme-color"> tags carry data-dark / data-light, which core.js
    // reads on every theme change. Keep the originals, and swap them while a palette is on
    // (a palette has one colour: it is only shown on the theme it is built on).
    function updateBar() {
        const palette = paletteName();
        document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
            ["dark", "light"].forEach(function (theme) {
                const original = "data-" + theme + "-original";
                if (!meta.hasAttribute(original)) meta.setAttribute(original, meta.getAttribute("data-" + theme) || "");
                meta.setAttribute("data-" + theme, palette ? PALETTES[palette].bar : meta.getAttribute(original));
            });
            const shown = root.getAttribute("data-theme") === "light" ? "light" : "dark";
            meta.setAttribute("content", meta.getAttribute("data-" + shown));
        });
    }

    // Puts a look on the page: a theme, and a palette on top of it (or null for none).
    // The palette's attribute goes first and the events come last, so whoever listens
    // to the theme never sees half a change (the new theme with the old palette).
    function show(theme, palette) {
        const before = paletteName();
        // Like core's setTheme: the class "theme-switching" (style.css) turns the transitions
        // off while the browser works out the new colours, or about a thousand buttons,
        // links and cards would each fade
        const quiet = A.motion.ok() && (palette !== before || theme !== A.theme);
        if (quiet) root.classList.add("theme-switching");
        if (palette) root.setAttribute("data-palette", palette);
        else root.removeAttribute("data-palette");
        stepping = true;
        try {
            A.setTheme(theme);                        // core saves it and tells the page
        } finally {
            stepping = false;
        }
        if (quiet) {
            void getComputedStyle(root).color;        // work out the new colours now
            root.classList.remove("theme-switching");
        }
        updateBar();
        if (palette === before) return;
        // Canvases (the neural background, the AI Lab, the snow, the bubbles) redraw on these
        // events. No progress event (track) is sent. "palette" in the detail says that this
        // "theme" event is ours.
        document.dispatchEvent(new CustomEvent("aic:palette", { detail: { palette: palette || "default" } }));
        A.emit("theme", { theme: A.theme, palette: palette || "default" });
    }

    // Switches to a look and saves it. A palette comes with the theme it is built on;
    // plain "dark" and "light" clear the palette.
    // Another tab copies each saved value as it arrives (see "storage" below), so the order
    // of saving matters: a new palette is saved before its theme (the palette alone says
    // which theme it needs), and a palette is forgotten only after the new theme is saved.
    function setMode(id) {
        if (ORDER.indexOf(id) === -1) return false;
        if (isPalette(id)) {
            A.storage.set(KEY, id);
            show(PALETTES[id].base, id);
        } else {
            show(id, null);
            A.storage.remove(KEY);
        }
        return true;
    }

    // name: a palette's id, or null / anything else for no palette (the theme stays)
    function setPalette(name) {
        setMode(isPalette(name) ? name : A.theme);
    }

    function cycle() {
        const look = info(next(current()));
        setMode(look.id);
        // Screen readers read the toast too (the toasts are a live region)
        A.toast(A.t("core.modeToast", { mode: look.name }), look.icon);
    }

    // Someone else changed the theme (Compass Bot, an old button): the look they asked for
    // is the plain theme, so the palette steps aside. Our own events carry "palette".
    A.on("theme", function (detail) {
        if (stepping || (detail && detail.palette !== undefined)) return;
        if (isOn()) setMode(A.theme);
        else updateBar();
    });

    // Another tab chose a look: this tab shows the same one. Nothing new is saved here (the
    // other tab has saved it), and "copying" tells js/settings.js that nobody picked the look
    // in this tab.
    window.addEventListener("storage", function (event) {
        if (event.key !== "aic:" + KEY && event.key !== "aic:theme") return;
        const palette = savedPalette();
        const saved = A.storage.get("theme", null);
        const theme = palette ? PALETTES[palette].base : saved === "light" || saved === "dark" ? saved : A.theme;
        if (palette === paletteName() && theme === A.theme) return;
        copying = true;
        try {
            show(theme, palette);
        } finally {
            copying = false;
        }
    });

    // Start: the saved palette. The <head> script has usually put it on the page already.
    // This also covers a browser where it could not read the storage then, and a page or
    // a saved theme that is not the palette's base theme (a palette has colours for that
    // theme only): the base theme goes on and is saved, so the two always fit.
    (function () {
        const palette = savedPalette();
        const base = palette ? PALETTES[palette].base : "";
        if (palette && (A.theme !== base || A.storage.get("theme", null) !== base)) show(base, palette);
        else if (root.getAttribute("data-palette") !== palette) show(A.theme, palette);
        else updateBar();
    })();

    A.mode = {
        get current() { return current(); },
        get copying() { return copying; },
        set: setMode,
        cycle: cycle,
        list: list,
        info: info
    };
    A.palette = { get name() { return paletteName(); }, get on() { return isOn(); }, set: setPalette };
})();
