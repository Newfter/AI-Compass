/* =========================================================
   AI COMPASS — THE THREE LOOKS: DARK, LIGHT, ARCTIC BLUE
   One button ([data-mode-toggle], in the menu bar and in the phone menu)
   shows the look that is on, and a click goes to the next one:

        Dark  ->  Light  ->  Arctic Blue  ->  Dark ...

   How it is built: Dark and Light are the two themes of core.js
   (<html data-theme="dark|light">). Arctic Blue is a palette on top of the
   dark theme (css/arctic-blue.css), switched on with data-palette="arctic".
   The palette is saved as "aic:palette"; the small script in the <head> of
   index.html restores it before the first paint. This file keeps the buttons,
   the colour of the phone's address bar and the canvases in step with it.

   API:  A.mode.current  A.mode.set("dark" | "light" | "arctic")  A.mode.cycle()
         A.palette.on / set(on) / toggle()
   ========================================================= */
(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;                                   // core.js failed to load

    const root = document.documentElement;
    const KEY = "palette";                            // saved as "aic:palette"
    const NAME = "arctic";

    // The order of a click, and what each look shows on the button
    const ORDER = ["dark", "light", "arctic"];
    const LOOKS = {
        dark:   { icon: "🌙", text: "core.modeDark" },
        light:  { icon: "☀️", text: "core.modeLight" },
        arctic: { icon: "❄️", text: "core.modeArctic" }
    };

    // Colour of the address bar for Arctic Blue: --bg of css/arctic-blue.css
    const BAR = { dark: "#04101c", light: "#eef7fd" };

    function isOn() {
        return root.getAttribute("data-palette") === NAME;
    }

    function current() {
        return isOn() ? "arctic" : (A.theme === "light" ? "light" : "dark");
    }

    function next(mode) {
        return ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    }

    // The two <meta name="theme-color"> tags carry data-dark / data-light, which core.js
    // reads on every theme change. Keep the originals, and swap them while the palette is on.
    function updateBar() {
        document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
            ["dark", "light"].forEach(function (mode) {
                const original = "data-" + mode + "-original";
                if (!meta.hasAttribute(original)) meta.setAttribute(original, meta.getAttribute("data-" + mode) || "");
                meta.setAttribute("data-" + mode, isOn() ? BAR[mode] : meta.getAttribute(original));
            });
            const shown = root.getAttribute("data-theme") === "light" ? "light" : "dark";
            meta.setAttribute("content", meta.getAttribute("data-" + shown));
        });
    }

    // Draws the button(s): the icon and the name of the look that is on
    function updateButtons() {
        const mode = current();
        const look = LOOKS[mode];
        const name = A.t(look.text);
        const label = A.t("core.modeLabel", { mode: name, next: A.t(LOOKS[next(mode)].text) });
        document.querySelectorAll("[data-mode-toggle]").forEach(function (button) {
            const icon = button.querySelector(".mode-icon");
            const text = button.querySelector(".mode-label");
            if (icon && icon.textContent !== look.icon) icon.textContent = look.icon;
            if (text && text.textContent !== name) text.textContent = name;
            button.setAttribute("data-mode", mode);
            button.setAttribute("aria-label", label);
            button.setAttribute("title", label);
        });
    }

    function setPalette(on, quiet) {
        on = on === true;
        const changed = on !== isOn();
        if (on) {
            root.setAttribute("data-palette", NAME);
            A.storage.set(KEY, NAME);
        } else {
            root.removeAttribute("data-palette");
            A.storage.remove(KEY);
        }
        updateBar();
        updateButtons();
        if (!changed) return;
        // Canvases (neural background, AI Lab) redraw on the "theme" event. No progress
        // event (track) is sent. "palette" in the detail says that this event is ours.
        document.dispatchEvent(new CustomEvent("aic:palette", { detail: { palette: on ? NAME : "default" } }));
        A.emit("theme", { theme: A.theme, palette: on ? NAME : "default" });
    }

    function setMode(mode) {
        if (ORDER.indexOf(mode) === -1) return;
        if (mode === "arctic") {
            A.setTheme("dark");                       // Arctic Blue is built on the dark theme
            setPalette(true);
        } else {
            setPalette(false);
            A.setTheme(mode);
        }
        updateBar();
        updateButtons();
    }

    function cycle() {
        const mode = next(current());
        setMode(mode);
        A.toast(A.t("core.modeToast", { mode: A.t(LOOKS[mode].text) }), LOOKS[mode].icon);
        if (A.announce) A.announce(A.t("core.modeToast", { mode: A.t(LOOKS[mode].text) }));
    }

    // The buttons: one click handler for all of them (the menu bar and the phone menu)
    document.addEventListener("click", function (event) {
        const button = event.target.closest && event.target.closest("[data-mode-toggle]");
        if (!button) return;
        event.preventDefault();
        cycle();
    });

    // Someone else changed the theme (Settings, Compass Bot, the Pro terminal): the look
    // they asked for is the plain theme, so Arctic Blue steps aside. Our own events carry "palette".
    A.on("theme", function (detail) {
        if (detail && detail.palette !== undefined) return;
        if (isOn()) setPalette(false, true);
        else { updateBar(); updateButtons(); }
    });

    A.onLanguageChange(updateButtons);

    // Another tab changed it
    window.addEventListener("storage", function (event) {
        if (event.key !== "aic:" + KEY) return;
        setPalette(A.storage.get(KEY, null) === NAME, true);
    });

    // The saved choice (the <head> script has already set the attribute; this also covers
    // a browser where it could not read the storage then, and syncs buttons and address bar)
    setPalette(A.storage.get(KEY, null) === NAME, true);

    // Buttons are in the page already, but their texts need the translations: draw again when ready
    A.ready(updateButtons);

    A.mode = { get current() { return current(); }, set: setMode, cycle: cycle };
    A.palette = { get on() { return isOn(); }, set: setPalette, toggle: function () { setMode(isOn() ? "dark" : "arctic"); } };
})();
