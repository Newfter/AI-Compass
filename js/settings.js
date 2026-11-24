/* =========================================================
   AI COMPASS — SETTINGS
   One window for every preference, so the site is comfortable for
   every learner: the account, the design (Simple or Pro), the look
   (ten of them: like the device, dark, light and the palettes of
   js/arctic-blue.js), the language, the text size, the line spacing,
   an easy-to-read font, underlined links, high contrast, less
   transparency, calm motion, and the voice and speed for reading
   lessons aloud. The design and the look are chosen here and nowhere
   else: the menu bar only has the gear button that opens this window.
   Every change works at once on the whole page, and is remembered
   in this browser. The small script in the <head> of index.html puts
   the saved settings on the page before it is drawn (no flash); this
   file puts them there again, so nothing depends on that script.
   Press ? (or use Ctrl+K) for the keyboard shortcuts window.

   Sections of this file:
    1. Settings
    2. Small helpers
    3. The saved settings
    4. Applying the settings to the page
    5. The look: like the device, dark, light or a palette
    6. The easy-to-read font
    7. Reading aloud: voices and speed
    8. Building the settings window
    9. Drawing the controls
   10. Opening and closing a window
   11. The keyboard shortcuts window
   12. Changes, keys and links
   13. Ctrl+K commands and the public API

   Progress event (A.track, see README.md): "settings.change" { name, value },
   once for every real change of a setting, wherever it was changed (this
   window, Ctrl+K, the Pro terminal, another tab): language, look ("system",
   "dark", "light" or a palette's id), theme ("dark", "light" or "system"),
   design, textSize, lineSpacing, easyFont, underlineLinks, contrast,
   reduceTransparency, fancy, voiceEn, voiceRu and speechRate. For calm
   mode core.js sends it itself (name "calm"). The language and the theme
   also have core's own events: language.change and theme.change.
   Other features use AICompass.settings (see the last section).
   Every text (English and Russian) and the list of keyboard shortcuts
   are in js/content/settings.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="settings"]');
    const data = A && A.content.get("settings");
    if (!A || !mount || !data) return;

    const t = A.t;
    const esc = A.escapeHTML;
    const root = document.documentElement;

    /* =========================================================
       1. SETTINGS
       ========================================================= */

    // Saved as "aic:settings" = { v: 1, ... }. The script in the <head> of index.html
    // reads the same object before the page is drawn: keep the names the same there.
    const STORAGE_KEY = "settings";
    const VERSION = 1;

    // The text size steps: --text-scale on <html> (style.css). 1 is the normal size.
    const TEXT_SIZES = [1, 1.125, 1.25, 1.5];
    // Reading-aloud speeds: 1 is the voice's normal speed
    const SPEECH_RATES = [0.75, 1, 1.25, 1.5];
    const LINE_SPACINGS = ["normal", "relaxed"];

    // Every setting of this file, as it is when nothing was saved
    // (and after "Reset to defaults", except followSystem)
    const DEFAULTS = Object.freeze({
        followSystem: false,        // the look "Like my device": dark or light, as the device is
        textSize: 1,
        lineSpacing: "normal",
        easyFont: false,
        underlineLinks: false,
        contrast: false,
        reduceTransparency: false,
        fancy: false,               // the decorative effects: moving background, "decoding" titles, tilting cards
        design: "simple",           // the site's design: "simple" (for beginners) or "pro" (rich, for experts)
        voiceEn: "",                // the voiceURI of the chosen voice; "" = automatic
        voiceRu: "",
        speechRate: 1
    });

    // The class on <html> for each on / off setting (css/settings.css, part 1)
    const PAGE_CLASSES = {
        easyFont: "st-font",
        underlineLinks: "st-underline",
        contrast: "st-contrast",
        reduceTransparency: "st-solid",
        fancy: "fx-fancy"
    };
    const DESIGNS = ["simple", "pro"];
    const PRO_CLASS = "design-pro";           // on <html> with the Pro design (css/pro.css)
    const RELAXED_CLASS = "st-relaxed";      // line spacing: relaxed
    const LARGE_TEXT_CLASS = "st-large-text"; // any text size above 100%

    // Settings that change the size of the text: everything that measures the
    // page must measure again after them
    const LAYOUT_SETTINGS = ["textSize", "lineSpacing", "easyFont"];

    // The easy-to-read fonts, from Google Fonts (both under the SIL Open Font License).
    // Atkinson Hyperlegible has no Russian letters, so Russian pages use Andika, a font
    // made for people who are learning to read. One small stylesheet describes both;
    // the browser then downloads only the letters that the page really shows.
    // The <head> script of index.html has the same address: keep the two the same.
    const FONT_URL = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Andika:wght@400;700&display=swap";
    const FONT_FAMILY = { en: "Atkinson Hyperlegible", ru: "Andika" };
    const FONT_LINK_ID = "st-font-css";     // the font's <link> when the <head> script added it

    // Kinds of <input> that type no text: "?" opens the shortcuts window there too
    const NO_TEXT_INPUTS = ["radio", "checkbox", "range", "button", "submit", "reset", "color", "file"];

    const LIGHT_QUERY = "(prefers-color-scheme: light)";   // the device is in light mode
    const CLOSE_MS = 220;            // the windows' closing animation (css/settings.css)
    const HASH = "#settings";        // the page's address with this at the end opens the window
    // The groups the window can open at: A.settings.open("look"), a button with
    // data-open-settings="design", the address #settings-account
    const SECTIONS = ["account", "design", "look"];
    const VOICE_NAME_MAX = 300;      // a saved voice name longer than this is not a real one

    // "Like my device" is a look too, but not one of the register (js/arctic-blue.js):
    // this file keeps it (section 5). Its card in the picker shows half dark, half light.
    const SYSTEM_ICON = "🌗";
    // Without js/arctic-blue.js (it failed to load) the site still has its two themes
    const PLAIN_LOOKS = [
        { id: "dark", base: "dark", group: "everyday", icon: "🌙", text: "core.modeDark" },
        { id: "light", base: "light", group: "everyday", icon: "☀️", text: "core.modeLight" }
    ];
    // The two parts of the picker, and a colour as the register writes it ("#0d2a4f")
    const LOOK_GROUPS = [
        { id: "everyday", title: "settings.lookEveryday" },
        { id: "nature", title: "settings.lookNature" }
    ];
    const HEX_COLOUR = /^#[0-9a-f]{3,8}$/i;

    // The name of each setting, for messages like "High contrast: on".
    // Every public setting (see the API in section 13) is in this list.
    const LABELS = {
        language: "settings.language",
        look: "settings.look",
        theme: "settings.theme",
        textSize: "settings.textSize",
        lineSpacing: "settings.lineSpacing",
        easyFont: "settings.easyFont",
        underlineLinks: "settings.underline",
        contrast: "settings.contrast",
        reduceTransparency: "settings.solid",
        fancy: "settings.fancy",
        design: "settings.design",
        calm: "settings.calm",
        voiceEn: "settings.voiceEn",
        voiceRu: "settings.voiceRu",
        speechRate: "settings.speed"
    };

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */

    function isBoolean(value) {
        return value === true || value === false;
    }

    function isVoiceName(value) {
        return typeof value === "string" && value.length <= VOICE_NAME_MAX;
    }

    // Macs (and iPhones, iPads) write ⌘ where other computers write Ctrl (A.isMac)
    const isMac = A.isMac;

    // 1.125 -> "112.5%" (Russian: "112,5%")
    function percentText(scale) {
        return A.format.number(scale * 100) + "%";
    }

    // 1.25 -> "1.25×" (Russian: "1,25×")
    function speedText(rate) {
        return t("settings.speedValue", { n: A.format.number(rate) });
    }

    // Does a key pressed here type text (a text box, a drop-down list)? A.dom.isTyping
    // says yes for every <input>, also for a radio button or a slider, which type nothing
    function typesText(element) {
        if (!A.dom.isTyping(element)) return false;
        return !(element.tagName === "INPUT" && NO_TEXT_INPUTS.indexOf(element.type) !== -1);
    }

    // Adds or removes a class on <html>, only when it really changes
    function setPageClass(name, on) {
        if (root.classList.contains(name) !== on) root.classList.toggle(name, on);
    }

    /* =========================================================
       3. THE SAVED SETTINGS
       Each value is checked on its own: one broken value falls back
       to its default and the others are kept.
       ========================================================= */
    const CHECKS = {
        followSystem: isBoolean,
        textSize: function (value) { return TEXT_SIZES.indexOf(value) !== -1; },
        lineSpacing: function (value) { return LINE_SPACINGS.indexOf(value) !== -1; },
        easyFont: isBoolean,
        underlineLinks: isBoolean,
        contrast: isBoolean,
        reduceTransparency: isBoolean,
        fancy: isBoolean,
        design: function (value) { return DESIGNS.indexOf(value) !== -1; },
        voiceEn: isVoiceName,
        voiceRu: isVoiceName,
        speechRate: function (value) { return SPEECH_RATES.indexOf(value) !== -1; }
    };

    function loadSaved() {
        const saved = A.storage.get(STORAGE_KEY, null);
        const result = Object.assign({}, DEFAULTS);
        if (!saved || typeof saved !== "object" || saved.v !== VERSION) return result;
        Object.keys(CHECKS).forEach(function (name) {
            if (CHECKS[name](saved[name])) result[name] = saved[name];
        });
        return result;
    }

    const prefs = loadSaved();
    // A palette and "Like my device" cannot both be on (section 5): the palette wins,
    // as it does in the <head> script. The next save writes it down.
    if (prefs.followSystem && paletteOn()) prefs.followSystem = false;
    let canSave = null;     // false when the browser refuses to save (storage blocked); null: not known yet

    function save() {
        canSave = A.storage.set(STORAGE_KEY, Object.assign({ v: VERSION }, prefs));
    }

    // Can this browser save? Known after the first save; before that, core knows
    function storageWorks() {
        if (canSave === null) canSave = A.storage.available();
        return canSave;
    }

    // The value of a setting, by its public name (see the API in section 13)
    function get(name) {
        if (name === "language") return A.lang;
        if (name === "look") return paletteOn() || (prefs.followSystem ? "system" : A.theme);
        if (name === "theme") return prefs.followSystem ? "system" : A.theme;
        if (name === "calm") return A.motion.calm;
        if (name === "followSystem" || !Object.prototype.hasOwnProperty.call(DEFAULTS, name)) return undefined;
        return prefs[name];
    }

    /* =========================================================
       4. APPLYING THE SETTINGS TO THE PAGE
       The text size is --text-scale on <html> (and the class
       st-large-text above 100%); the other settings are classes on
       <html> that css/settings.css styles. Only real changes are
       written, so applying the same settings again costs nothing (the
       <head> script usually did most of it already).
       ========================================================= */
    function applyToPage() {
        const scale = prefs.textSize === 1 ? "" : String(prefs.textSize);
        if (root.style.getPropertyValue("--text-scale") !== scale) {
            if (scale) root.style.setProperty("--text-scale", scale);
            else root.style.removeProperty("--text-scale");
        }
        setPageClass(LARGE_TEXT_CLASS, prefs.textSize > 1);
        setPageClass(RELAXED_CLASS, prefs.lineSpacing === "relaxed");
        Object.keys(PAGE_CLASSES).forEach(function (name) {
            setPageClass(PAGE_CLASSES[name], prefs[name]);
        });
        setPageClass(PRO_CLASS, prefs.design === "pro");
        if (prefs.easyFont) loadFont();
    }

    /* =========================================================
       5. THE LOOK: LIKE THE DEVICE, DARK, LIGHT OR A PALETTE
       The look is one choice, saved in three places that were there before
       it (nothing was renamed, so every visitor's choice keeps working):
       - core's theme, "dark" or "light" (A.setTheme, "aic:theme");
       - a palette on top of it, like "lagoon" (js/arctic-blue.js, A.mode,
         "aic:palette"); plain Dark and Light have none;
       - "Like my device", kept here (followSystem): this file then picks
         dark or light from the device's setting, now and whenever the
         device changes it.
       So the look that is on is: the palette if there is one, else
       "system" if it follows the device, else the theme.
       ========================================================= */
    let themeByThisFile = false;     // true while this file switches the look itself

    function deviceTheme() {
        return A.media(LIGHT_QUERY).matches ? "light" : "dark";
    }

    // The palette that is on ("arctic", "lagoon"...), or "" for a plain theme
    function paletteOn() {
        const look = A.mode ? A.mode.current : "";
        return look === "dark" || look === "light" ? "" : look;
    }

    // Every look for the picker: "Like my device" first, then the register's looks
    // (A.mode.list(): { id, base, group, icon, name, effect, swatch }, texts already translated)
    function lookList() {
        const system = { id: "system", base: "", group: "everyday", icon: SYSTEM_ICON, name: t("settings.themeSystem"), effect: "", swatch: null };
        const register = A.mode ? A.mode.list() : PLAIN_LOOKS.map(function (look) {
            return Object.assign({ name: t(look.text), effect: "", swatch: null }, look);
        });
        return [system].concat(register);
    }

    function lookInfo(id) {
        return lookList().find(function (look) { return look.id === id; }) || null;
    }

    function followDevice() {
        // A palette is only shown on the theme it is built on: it does not follow the device
        if (!prefs.followSystem || paletteOn()) return;
        themeByThisFile = true;
        try {
            A.setTheme(deviceTheme());
        } finally {
            themeByThisFile = false;     // also if something went wrong
        }
    }

    // Switches the look. Returns false for an id that is not a look.
    function setLook(id) {
        if (!lookInfo(id)) return false;
        const follow = id === "system";
        // Another tab copies each saved value as it arrives. "Like my device" is saved first
        // when it goes on and last when it goes off, so that tab never shows a look in between.
        if (follow && !prefs.followSystem) {
            prefs.followSystem = true;
            save();
        }
        themeByThisFile = true;
        try {
            const look = follow ? deviceTheme() : id;
            if (A.mode) A.mode.set(look);       // a palette comes with its theme; a plain theme clears the palette
            else A.setTheme(look);
        } finally {
            themeByThisFile = false;     // also if something went wrong
        }
        if (!follow && prefs.followSystem) {
            prefs.followSystem = false;
            save();
        }
        changed("theme");
        changed("look");
        return true;
    }

    // The device switched between light and dark mode
    A.onMedia(LIGHT_QUERY, function () {
        followDevice();
        repaint();      // the note "Your device is in dark mode now"
    }, { immediate: false });

    /* =========================================================
       6. THE EASY-TO-READ FONT
       Loaded only once somebody turns it on. If it fails (no internet),
       the page keeps its normal font, the window says so, and turning
       the setting on again (or the connection coming back) tries again.
       When the setting was already on, the <head> script of index.html
       has asked for the font's stylesheet before the page was drawn
       (a <link> with the id FONT_LINK_ID): this file then uses that one.
       ========================================================= */
    const font = { state: "idle" };      // "idle", "loading", "ready" or "failed"

    function loadFont() {
        if (font.state === "loading" || font.state === "ready") return;
        font.state = "loading";
        repaint();
        fontStylesheet().then(function () {
            font.state = "ready";
            fontArrived();
        }, function () {
            font.state = "failed";
            repaint();
            if (settingsWindow.isOpen) A.announce(t("settings.easyFontError"));
        });
    }

    // The font's stylesheet: the <link> of the <head> script (its data-state says
    // "ready" or "failed" once it is done), or else a new one through core
    function fontStylesheet() {
        const early = document.getElementById(FONT_LINK_ID);
        if (!early) return A.loadStyle(FONT_URL);
        return new Promise(function (resolve, reject) {
            function check() {
                const state = early.getAttribute("data-state");
                if (state === "ready") {
                    resolve();
                } else if (state === "failed") {
                    early.remove();     // the next try asks core for a new one
                    reject(new Error("Could not load " + FONT_URL));
                }
            }
            early.addEventListener("load", check);
            early.addEventListener("error", check);
            check();        // it may be done already
        });
    }

    // The new letters have other widths: once the font of the page's language is
    // here, everything that measures the page measures again
    function fontArrived() {
        repaint();
        if (!prefs.easyFont || font.state !== "ready" || !document.fonts || !document.fonts.load) return;
        document.fonts.load('1rem "' + FONT_FAMILY[A.lang] + '"').then(function () {
            A.layoutChanged();
        }, function () { /* the page keeps its normal font */ });
    }

    window.addEventListener("online", function () {
        if (prefs.easyFont && font.state === "failed") loadFont();
    });

    /* =========================================================
       7. READING ALOUD: VOICES AND SPEED
       The browser's own voices (speechSynthesis). For the lessons' "Listen"
       button (js/lessons.js): A.settings.voice(lang) is the voice to read
       with, A.settings.get("speechRate") the speed.
       ========================================================= */
    const canSpeak = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
    const VOICE_SETTING = { en: "voiceEn", ru: "voiceRu" };
    const SPEECH_LANG = { en: "en-US", ru: "ru-RU" };
    let samplePlaying = false;

    // The voices this device has for a language ("en" or "ru")
    function voicesFor(lang) {
        if (!canSpeak) return [];
        return window.speechSynthesis.getVoices().filter(function (voice) {
            return Boolean(voice.lang) && voice.lang.toLowerCase().indexOf(lang) === 0;
        });
    }

    // The voice to read a language with: the chosen one; "automatic" is the
    // device's first voice for the language; null when it has none (the browser decides)
    function voiceFor(lang) {
        const list = voicesFor(lang === "ru" ? "ru" : "en");
        const wanted = prefs[VOICE_SETTING[lang === "ru" ? "ru" : "en"]];
        return list.find(function (voice) { return voice.voiceURI === wanted; }) || list[0] || null;
    }

    // "Listen": a short sentence in the voice's own language, at the chosen speed
    function playSample(lang) {
        if (!canSpeak) return;
        stopSample();
        const utterance = new window.SpeechSynthesisUtterance(data.voiceSamples[lang]);
        utterance.lang = SPEECH_LANG[lang];
        const voice = voiceFor(lang);
        if (voice) utterance.voice = voice;
        utterance.rate = prefs.speechRate;
        utterance.onend = function () { samplePlaying = false; };
        utterance.onerror = function (event) {
            samplePlaying = false;
            if (event.error === "interrupted" || event.error === "canceled") return;
            if (settingsWindow.isOpen) A.announce(t("settings.voiceFailed"));
            A.toast(t("settings.voiceFailed"), "🔇");
        };
        samplePlaying = true;
        window.speechSynthesis.speak(utterance);
    }

    function stopSample() {
        if (!samplePlaying) return;
        samplePlaying = false;
        window.speechSynthesis.cancel();
    }

    /* =========================================================
       8. BUILDING THE SETTINGS WINDOW
       Built the first time it opens. Texts with data-i18n are translated
       again by core.js when the language changes; section 9 redraws the
       rest. A row of options is a group of real radio buttons (the arrow
       keys move between them), drawn as segmented buttons; an on / off
       setting is a switch button (.ui-switch from css/components.css).
       ========================================================= */
    const ICONS = {
        // A cog with six teeth (the same as the button in the menu bar, index.html)
        gear: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="' +
            'M9.56 4.49L9.84 1.83A10.4 10.4 0 0 1 14.16 1.83L14.44 4.49A7.9 7.9 0 0 1 17.29 6.13L19.73 5.04A10.4 10.4 0 0 1 21.89 8.79L19.73 10.36A7.9 7.9 0 0 1 19.73 13.64L21.89 15.21A10.4 10.4 0 0 1 19.73 18.96L17.29 17.87A7.9 7.9 0 0 1 14.44 19.51L14.16 22.17A10.4 10.4 0 0 1 9.84 22.17L9.56 19.51A7.9 7.9 0 0 1 6.71 17.87L4.27 18.96A10.4 10.4 0 0 1 2.11 15.21L4.27 13.64A7.9 7.9 0 0 1 4.27 10.36L2.11 8.79A10.4 10.4 0 0 1 4.27 5.04L6.71 6.13A7.9 7.9 0 0 1 9.56 4.49Z" ' +
            'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
        close: '<svg class="st-close-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
        lock: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
        keyboard: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 10h1M10 10h1M13.5 10h1M17 10h.5M7.5 14h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        play: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
        // The tick on the chosen card (the design, the look): the choice is not shown by colour alone
        tick: '<svg class="st-tick" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        // Three lines, close together or further apart (the line spacing options)
        linesNormal: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 8h16M4 12h16M4 16h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        linesRelaxed: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };

    // A translated text that core.js translates again by itself (data-i18n)
    function text(key, className, tag) {
        return A.i18nHTML(key, className, tag);
    }

    // A row of options: a group of radio buttons with a name above them.
    // options: [{ value, html }]; hintKey: an optional text under the row.
    // A row that is alone in its group has no name of its own (labelKey: null): the
    // group's title names it (titleId is the id of that title).
    function optionRow(name, labelKey, options, hintKey, extraClass, titleId) {
        const id = "st-" + name;
        return '<div class="st-row st-seg' + (extraClass ? " " + extraClass : "") + '" data-setting="' + name + '" ' +
                'role="radiogroup" aria-labelledby="' + (labelKey ? id + "-name" : titleId) + '"' +
                (hintKey ? ' aria-describedby="' + id + '-hint"' : "") + ">" +
                (labelKey ? '<span class="st-row-name" id="' + id + '-name" data-i18n="' + labelKey + '">' + t(labelKey) + "</span>" : "") +
                '<div class="st-seg-options">' +
                    options.map(function (option) {
                        return '<label class="st-seg-option">' +
                            '<input type="radio" name="' + id + '" value="' + esc(option.value) + '">' +
                            '<span class="st-seg-face">' + option.html + "</span></label>";
                    }).join("") +
                "</div>" +
                (hintKey ? '<p class="st-hint" id="' + id + '-hint" data-i18n="' + hintKey + '">' + t(hintKey) + "</p>" : "") +
            "</div>";
    }

    // An on / off setting: the whole row is one switch button
    function switchRow(name, labelKey, hintKey) {
        const id = "st-" + name;
        return '<button type="button" class="st-row st-toggle ui-switch" role="switch" aria-checked="false" ' +
                'data-setting="' + name + '" aria-labelledby="' + id + '-name" aria-describedby="' + id + '-hint ' + id + '-note">' +
                '<span class="st-toggle-text">' +
                    '<span class="st-row-name" id="' + id + '-name" data-i18n="' + labelKey + '">' + t(labelKey) + "</span>" +
                    '<span class="st-hint" id="' + id + '-hint" data-i18n="' + hintKey + '">' + t(hintKey) + "</span>" +
                    // A note that only some switches show (loading the font, the device's own setting)
                    '<span class="st-note" id="' + id + '-note" hidden></span>' +
                "</span>" +
                '<span class="ui-switch-track" aria-hidden="true"><span class="ui-switch-knob"></span></span>' +
            "</button>";
    }

    // A voice for one language: a drop-down list and a "Listen" button
    function voiceRow(lang) {
        const id = "st-voice-" + lang;
        const label = lang === "ru" ? "settings.voiceRu" : "settings.voiceEn";
        const listenLabel = lang === "ru" ? "settings.voiceTryRu" : "settings.voiceTryEn";
        return '<div class="st-row st-voice" data-lang="' + lang + '">' +
                '<label class="st-row-name" for="' + id + '" data-i18n="' + label + '">' + t(label) + "</label>" +
                '<div class="st-voice-line">' +
                    '<span class="st-select"><select id="' + id + '" data-setting="' + VOICE_SETTING[lang] + '" aria-describedby="' + id + '-note"></select></span>' +
                    '<button type="button" class="btn btn-ghost btn-small st-listen" data-action="listen" data-lang="' + lang + '" ' +
                        'data-i18n-attr="aria-label:' + listenLabel + '" aria-label="' + esc(t(listenLabel)) + '">' +
                        ICONS.play + text("settings.voiceTry") + "</button>" +
                "</div>" +
                '<p class="st-note" id="' + id + '-note" hidden></p>' +
            "</div>";
    }

    function group(titleKey, id, rows) {
        return '<section class="st-group" aria-labelledby="' + id + '">' +
                '<h3 class="st-group-title" id="' + id + '" data-i18n="' + titleKey + '">' + t(titleKey) + "</h3>" +
                rows.join("") +
            "</section>";
    }

    // A few big cards to choose from (the design): real radio buttons again, each with
    // a name and one line that says what it is. The group's title (titleId) names the row.
    // options: [{ value, icon, nameKey, aboutKey }]
    function cardRow(name, titleId, options) {
        const id = "st-" + name;
        return '<div class="st-row st-cards" data-setting="' + name + '" role="radiogroup" aria-labelledby="' + titleId + '">' +
                options.map(function (option) {
                    const own = id + "-" + option.value;
                    return '<label class="st-card">' +
                        '<input type="radio" name="' + id + '" value="' + esc(option.value) + '" ' +
                            'aria-labelledby="' + own + '-name" aria-describedby="' + own + '-about">' +
                        '<span class="st-card-face">' +
                            '<span class="st-card-head">' +
                                '<span class="st-card-icon" aria-hidden="true">' + option.icon + "</span>" +
                                '<span class="st-card-name" id="' + own + '-name" data-i18n="' + option.nameKey + '">' + t(option.nameKey) + "</span>" +
                                ICONS.tick +
                            "</span>" +
                            '<span class="st-card-about" id="' + own + '-about" data-i18n="' + option.aboutKey + '">' + t(option.aboutKey) + "</span>" +
                        "</span></label>";
                }).join("") +
            "</div>";
    }

    // The five preview colours of a look, as custom properties on one pane of its
    // preview: css/settings.css draws the preview from them, so a new look needs no
    // new CSS here. Only a real colour gets into the page.
    const SWATCH_PROPERTIES = { bg: "--look-bg", surface: "--look-surface", accent: "--look-accent", accent2: "--look-accent-2", text: "--look-text" };

    function swatchStyle(swatch) {
        if (!swatch) return "";
        const parts = Object.keys(SWATCH_PROPERTIES).filter(function (name) {
            return HEX_COLOUR.test(swatch[name]);
        }).map(function (name) {
            return SWATCH_PROPERTIES[name] + ":" + swatch[name];
        });
        return parts.length ? ' style="' + parts.join(";") + '"' : "";
    }

    // One card of the look picker: a small picture of a page in the look's colours
    // (a card with two lines of "text" and two accent dots), the icon and the name.
    // "Like my device" shows two halves: dark and light.
    function lookCardHTML(look, list) {
        const panes = look.id !== "system" ? [look.swatch] : ["dark", "light"].map(function (id) {
            const plain = list.find(function (other) { return other.id === id; });
            return plain ? plain.swatch : null;
        });
        return '<label class="st-look">' +
                '<input type="radio" name="st-look" value="' + esc(look.id) + '">' +
                '<span class="st-look-face">' +
                    '<span class="st-look-preview" aria-hidden="true">' +
                        panes.map(function (swatch) {
                            return '<span class="st-look-pane"' + swatchStyle(swatch) + ">" +
                                '<span class="st-look-card"><span class="st-look-line"></span><span class="st-look-line"></span></span>' +
                                '<span class="st-look-dots"><span class="st-look-dot"></span><span class="st-look-dot"></span></span>' +
                            "</span>";
                        }).join("") +
                    "</span>" +
                    '<span class="st-look-label">' +
                        '<span class="st-look-icon" aria-hidden="true">' + esc(look.icon) + "</span>" +
                        '<span class="st-look-name">' + esc(look.name) + "</span>" +
                    "</span>" +
                    ICONS.tick +
                "</span>" +
            "</label>";
    }

    // The look picker: one group of radio buttons for every look (the arrow keys go
    // through all of them), drawn as cards in two parts with a small heading each.
    // Under the cards: one sentence about the chosen look, and the notes of section 9.
    function lookPicker(titleId) {
        const list = lookList();
        return '<div class="st-row st-looks" data-setting="look" role="radiogroup" aria-labelledby="' + titleId + '" aria-describedby="st-look-about">' +
                LOOK_GROUPS.map(function (part, index) {
                    // The last part also takes a look whose group is not in LOOK_GROUPS
                    const earlier = LOOK_GROUPS.slice(0, index).map(function (other) { return other.id; });
                    const cards = list.filter(function (look) {
                        return index < LOOK_GROUPS.length - 1 ? look.group === part.id : earlier.indexOf(look.group) === -1;
                    });
                    if (!cards.length) return "";
                    const id = "st-look-part-" + part.id;
                    return '<div class="st-look-part" role="group" aria-labelledby="' + id + '">' +
                            '<p class="st-look-heading" id="' + id + '" data-i18n="' + part.title + '">' + t(part.title) + "</p>" +
                            '<div class="st-look-grid">' + cards.map(function (look) { return lookCardHTML(look, list); }).join("") + "</div>" +
                        "</div>";
                }).join("") +
                '<p class="st-look-about" id="st-look-about"></p>' +
                // The chosen look has an animation that cannot be seen now
                '<div class="st-look-effect" hidden>' +
                    '<p class="st-note st-look-effect-text"></p>' +
                    '<button type="button" class="btn btn-ghost btn-small st-look-effect-button" data-action="effects-on" ' +
                        'data-i18n="settings.lookEffectButton" data-i18n-attr="aria-label:settings.lookEffectButtonLabel" ' +
                        'aria-label="' + esc(t("settings.lookEffectButtonLabel")) + '">' + t("settings.lookEffectButton") + "</button>" +
                "</div>" +
                // "Like my device": which theme the device has now
                '<p class="st-note st-theme-note" id="st-theme-note" hidden></p>' +
            "</div>";
    }

    let ui = null;     // the window's parts, once it is built

    function buildSettings() {
        if (ui) return ui;

        // The text size options show a letter that grows (--st-step: 0, 1, 2, 3) and the percentage
        const sizeOptions = TEXT_SIZES.map(function (scale, index) {
            return {
                value: String(scale),
                html: '<span class="st-size-letter" style="--st-step: ' + index + '" aria-hidden="true">A</span>' +
                    '<span class="st-size-value" data-value="' + scale + '">' + percentText(scale) + "</span>"
            };
        });
        const speedOptions = SPEECH_RATES.map(function (rate) {
            return { value: String(rate), html: '<span class="st-speed-value" data-value="' + rate + '">' + speedText(rate) + "</span>" };
        });

        const sound = canSpeak
            ? [voiceRow("en"), voiceRow("ru"), optionRow("speechRate", "settings.speed", speedOptions, null, "st-seg-grid")]
            : ['<p class="st-hint st-sound-none" data-i18n="settings.soundNone">' + t("settings.soundNone") + "</p>"];

        // At the start of the mount: the shortcuts window, if it was built first, stays
        // after it, so it is drawn on top when it opens from this window
        mount.insertAdjacentHTML("afterbegin",
            '<div class="st-layer st-settings-layer" hidden>' +
                '<section class="st-panel st-settings-panel" role="dialog" aria-modal="true" aria-labelledby="st-title" aria-describedby="st-intro">' +
                    '<header class="st-head">' +
                        '<span class="st-head-icon" aria-hidden="true">' + ICONS.gear + "</span>" +
                        '<div class="st-head-text">' +
                            text("settings.kicker", "st-kicker", "p") +
                            '<h2 class="st-title" id="st-title" tabindex="-1" data-i18n="settings.title">' + t("settings.title") + "</h2>" +
                        "</div>" +
                        '<button type="button" class="st-close" data-action="close" ' +
                            'data-i18n-attr="aria-label:settings.close,title:settings.close" aria-label="' + esc(t("settings.close")) + '" title="' + esc(t("settings.close")) + '">' +
                            '<kbd class="st-close-key" aria-hidden="true">Esc</kbd>' + ICONS.close + "</button>" +
                    "</header>" +
                    '<div class="st-body">' +
                        '<p class="st-intro" id="st-intro" data-i18n="settings.intro">' + t("settings.intro") + "</p>" +

                        // The learner's account on this device: js/profiles.js draws it in here
                        // (A.profiles.mount, called by paint() below) and shows the section
                        '<section class="st-group st-account" id="st-group-account" data-account-mount hidden></section>' +

                        // The design: two cards, each says in one line what it is
                        group("settings.groupDesign", "st-group-design", [
                            cardRow("design", "st-group-design", [
                                { value: "simple", icon: "🌱", nameKey: "settings.designSimple", aboutKey: "settings.designSimpleAbout" },
                                { value: "pro", icon: "🛰️", nameKey: "settings.designPro", aboutKey: "settings.designProAbout" }
                            ])
                        ]) +

                        // The look: the colours of the whole site (the looks of js/arctic-blue.js)
                        group("settings.groupLook", "st-group-look", [lookPicker("st-group-look")]) +

                        group("settings.groupLanguage", "st-group-language", [
                            optionRow("language", null, [
                                { value: "en", html: '<span lang="en">English</span>' },
                                { value: "ru", html: '<span lang="ru">Русский</span>' }
                            ], null, "st-seg-alone", "st-group-language")
                        ]) +

                        // The sample card shows the settings of the groups under it; it is only for looking at
                        '<div class="st-preview" aria-hidden="true" inert>' +
                            text("settings.preview", "st-preview-label", "p") +
                            text("settings.previewTitle", "st-preview-title", "p") +
                            '<p class="st-preview-text">' + text("settings.previewText") + " " +
                                '<a href="#lessons" tabindex="-1" data-i18n="settings.previewLink">' + t("settings.previewLink") + "</a></p>" +
                            text("settings.previewButton", "btn btn-primary btn-small st-preview-button") +
                        "</div>" +

                        group("settings.groupReading", "st-group-reading", [
                            optionRow("textSize", "settings.textSize", sizeOptions, "settings.textSizeHint", "st-seg-grid st-seg-sizes"),
                            optionRow("lineSpacing", "settings.lineSpacing", [
                                { value: "normal", html: ICONS.linesNormal + text("settings.lineNormal") },
                                { value: "relaxed", html: ICONS.linesRelaxed + text("settings.lineRelaxed") }
                            ], "settings.lineSpacingHint"),
                            switchRow("easyFont", "settings.easyFont", "settings.easyFontHint"),
                            switchRow("underlineLinks", "settings.underline", "settings.underlineHint")
                        ]) +

                        group("settings.groupComfort", "st-group-comfort", [
                            switchRow("contrast", "settings.contrast", "settings.contrastHint"),
                            switchRow("reduceTransparency", "settings.solid", "settings.solidHint"),
                            switchRow("calm", "settings.calm", "settings.calmHint"),
                            switchRow("fancy", "settings.fancy", "settings.fancyHint")
                        ]) +

                        group("settings.groupSound", "st-group-sound", [
                            '<p class="st-hint st-group-hint" data-i18n="settings.soundHint">' + t("settings.soundHint") + "</p>"
                        ].concat(sound)) +

                        // "Install the app", where this browser can: js/platform.js draws it in here
                        // (A.platform.mountInstall, called by paint() below) and shows the section
                        '<section class="st-group st-app" data-app-mount hidden></section>' +

                        '<footer class="st-foot">' +
                            '<p class="st-privacy">' + ICONS.lock + text("settings.privacy") + "</p>" +
                            '<p class="st-privacy st-no-save" hidden>' + ICONS.lock + text("settings.noStorage") + "</p>" +
                            '<div class="st-foot-buttons">' +
                                '<button type="button" class="btn btn-ghost btn-small st-keys-button" data-action="shortcuts">' +
                                    ICONS.keyboard + text("settings.shortcuts") + '<kbd aria-hidden="true">?</kbd></button>' +
                                '<button type="button" class="btn btn-ghost btn-small st-reset" data-action="reset" aria-describedby="st-reset-note">' +
                                    '<span class="st-reset-label">' + esc(t("settings.reset")) + "</span></button>" +
                            "</div>" +
                            '<p class="st-hint" id="st-reset-note" data-i18n="settings.resetNote">' + t("settings.resetNote") + "</p>" +
                        "</footer>" +
                    "</div>" +
                "</section>" +
            "</div>");

        const layer = mount.querySelector(".st-settings-layer");
        ui = {
            layer: layer,
            panel: layer.querySelector(".st-panel"),
            title: layer.querySelector(".st-title"),
            body: layer.querySelector(".st-body"),
            account: layer.querySelector("[data-account-mount]"),
            switches: Array.from(layer.querySelectorAll(".st-toggle")),
            looks: Array.from(layer.querySelectorAll(".st-look")),
            lookAbout: layer.querySelector(".st-look-about"),
            lookEffect: layer.querySelector(".st-look-effect"),
            lookEffectText: layer.querySelector(".st-look-effect-text"),
            lookEffectButton: layer.querySelector(".st-look-effect-button"),
            themeNote: layer.querySelector(".st-theme-note"),
            fontNote: layer.querySelector("#st-easyFont-note"),
            calmNote: layer.querySelector("#st-calm-note"),
            noSave: layer.querySelector(".st-no-save"),
            reset: layer.querySelector(".st-reset"),
            resetLabel: layer.querySelector(".st-reset-label"),
            voices: Array.from(layer.querySelectorAll(".st-voice")),
            app: layer.querySelector("[data-app-mount]")
        };

        // Every radio button and drop-down list
        ui.panel.addEventListener("change", function (event) {
            const input = event.target;
            const row = input.closest("[data-setting]");
            if (!row) return;
            const name = row.getAttribute("data-setting");
            let value = input.value;
            if (name === "textSize" || name === "speechRate") value = Number(value);
            if (!set(name, value)) return;
            if (name === "look") lookPicked();
            else say(name);
        });

        // The switches and the buttons
        ui.panel.addEventListener("click", function (event) {
            const target = event.target.closest("[data-setting].st-toggle, [data-action]");
            if (!target) return;
            const action = target.getAttribute("data-action");
            if (action === "close") settingsWindow.close();
            else if (action === "shortcuts") shortcutsWindow.open();
            else if (action === "listen") playSample(target.getAttribute("data-lang"));
            else if (action === "effects-on") effectsOn();
            else if (!action) {
                const name = target.getAttribute("data-setting");
                if (set(name, !get(name))) say(name);
            }
        });

        // "Reset to defaults" needs a second press (A.confirmPress)
        ui.confirmReset = A.confirmPress(ui.reset, {
            onArm: function () {
                paintReset();
                A.announce(t("settings.resetAsk"));
            },
            onDisarm: paintReset,
            onConfirm: function () {
                reset();
                A.announce(t("settings.resetDone"));
            }
        });

        closeOnBackdrop(layer, function () { settingsWindow.close(); });
        return ui;
    }

    // A click on the dimmed area around a window closes it, but only when the press
    // also started there, and not as the second click of a double-click
    function closeOnBackdrop(layer, close) {
        let pressedOutside = false;
        layer.addEventListener("pointerdown", function (event) {
            pressedOutside = event.target === layer;
        });
        layer.addEventListener("click", function (event) {
            if (event.target === layer && pressedOutside && event.detail <= 1) close();
        });
    }

    /* =========================================================
       9. DRAWING THE CONTROLS
       paint() shows the current settings in the window. It runs when the
       window opens and after every change, wherever the change came from
       (a Ctrl+K command, the Pro terminal, another tab, the device...).
       ========================================================= */
    function repaint() {
        if (settingsWindow.isOpen) paint();
    }

    function checkRadio(name, value) {
        ui.panel.querySelectorAll('input[name="st-' + name + '"]').forEach(function (input) {
            const on = input.value === value;
            if (input.checked !== on) input.checked = on;
        });
    }

    function paint() {
        if (!ui) return;
        // The account group draws itself (the first call builds it, later ones refresh it)
        if (A.profiles && typeof A.profiles.mount === "function") A.profiles.mount(ui.account);
        checkRadio("language", A.lang);
        checkRadio("textSize", String(prefs.textSize));
        checkRadio("lineSpacing", prefs.lineSpacing);
        checkRadio("design", prefs.design);
        if (canSpeak) checkRadio("speechRate", String(prefs.speechRate));
        paintLook();

        ui.switches.forEach(function (button) {
            A.dom.setAttr(button, "aria-checked", String(get(button.getAttribute("data-setting")) === true));
        });

        // The font: loading, or could not be loaded
        const fontKey = !prefs.easyFont ? "" : font.state === "loading" ? "settings.easyFontLoading" : font.state === "failed" ? "settings.easyFontError" : "";
        A.dom.setHidden(ui.fontNote, !fontKey);
        A.dom.setText(ui.fontNote, fontKey ? t(fontKey) : "");
        ui.fontNote.classList.toggle("is-problem", font.state === "failed");

        // Calm mode: the device may already ask for less motion
        A.dom.setHidden(ui.calmNote, !A.motion.reduced);
        A.dom.setText(ui.calmNote, A.motion.reduced ? t("settings.calmDevice") : "");

        A.dom.setHidden(ui.noSave, storageWorks());
        paintReset();
        paintNumbers();
        paintVoices();
        // "Install the app" draws itself too (js/platform.js), only where there is something to offer
        if (A.platform && typeof A.platform.mountInstall === "function") A.platform.mountInstall(ui.app);
    }

    // The look picker: the chosen card, the names in the page's language, one sentence
    // about the chosen look, and the notes under it
    function paintLook() {
        const id = get("look");
        const list = lookList();
        checkRadio("look", id);
        ui.looks.forEach(function (card) {
            const value = card.querySelector("input").value;
            const look = list.find(function (other) { return other.id === value; });
            if (look) A.dom.setText(card.querySelector(".st-look-name"), look.name);
        });
        const about = "settings.lookAbout." + id;
        A.dom.setText(ui.lookAbout, A.has(about) ? t(about) : "");

        const note = effectNote(list.find(function (look) { return look.id === id; }));
        A.dom.setHidden(ui.lookEffect, !note.text);
        A.dom.setText(ui.lookEffectText, note.text);
        A.dom.setHidden(ui.lookEffectButton, !note.button);

        // "Like my device": which theme the device has now
        A.dom.setHidden(ui.themeNote, id !== "system");
        A.dom.setText(ui.themeNote, id !== "system" ? "" : t(deviceTheme() === "light" ? "settings.themeNowLight" : "settings.themeNowDark"));
    }

    // The chosen look has an animation (snow, bubbles...) that cannot be seen now: the
    // note says why, and whether its button can change that. { text: "" } = no note.
    function effectNote(look) {
        if (!look || !look.effect) return { text: "", button: false };
        // Motion is off: the animation stays paused whatever "Extra effects" says
        if (A.motion.calm) return { text: t("settings.lookEffectCalm", { effect: look.effect }), button: false };
        if (A.motion.reduced) return { text: t("settings.lookEffectDevice", { effect: look.effect }), button: false };
        if (!prefs.fancy) return { text: t("settings.lookEffectOff", { effect: look.effect }), button: true };
        return { text: "", button: false };
    }

    // A look was chosen in the picker: the usual toast of a changed setting (screen
    // readers read toasts too), and the note about its animation, if there is one now
    function lookPicked() {
        const look = lookInfo(get("look"));
        A.toast(changeMessage("look"), look ? look.icon : "");
        const note = effectNote(look);
        if (note.text) A.announce(note.text);
    }

    // The "Turn on" button of that note: "Extra effects" goes on and the note goes away,
    // so the chosen look takes the focus that its button had
    function effectsOn() {
        set("fancy", true);
        say("fancy");
        const chosen = ui.panel.querySelector('input[name="st-look"]:checked');
        if (chosen) chosen.focus({ preventScroll: true });
    }

    function paintReset() {
        A.dom.setText(ui.resetLabel, t(ui.confirmReset && ui.confirmReset.armed ? "settings.resetAsk" : "settings.reset"));
        ui.reset.classList.toggle("is-armed", Boolean(ui.confirmReset && ui.confirmReset.armed));
    }

    // Percentages and speeds are numbers: written the local way ("112,5%" in Russian)
    function paintNumbers() {
        ui.panel.querySelectorAll(".st-size-value").forEach(function (element) {
            A.dom.setText(element, percentText(Number(element.getAttribute("data-value"))));
        });
        ui.panel.querySelectorAll(".st-speed-value").forEach(function (element) {
            A.dom.setText(element, speedText(Number(element.getAttribute("data-value"))));
        });
    }

    // The voices of each language. The browser may find its voices a moment later
    // ("voiceschanged", listened to while the window is open).
    function paintVoices() {
        ui.voices.forEach(function (row) {
            const lang = row.getAttribute("data-lang");
            const select = row.querySelector("select");
            const note = row.querySelector(".st-note");
            const list = voicesFor(lang);
            const wanted = prefs[VOICE_SETTING[lang]];

            const options = [{ value: "", label: t("settings.voiceAuto") }].concat(list.map(function (voice) {
                return { value: voice.voiceURI, label: voice.name + " · " + voice.lang };
            }));
            const html = options.map(function (option) {
                return '<option value="' + esc(option.value) + '">' + esc(option.label) + "</option>";
            }).join("");
            // Rebuilt only when the list (or the language of "Automatic") changed,
            // so an open drop-down list is not closed under the mouse
            if (select.getAttribute("data-list") !== html) {
                select.innerHTML = html;
                select.setAttribute("data-list", html);
            }
            const value = list.some(function (voice) { return voice.voiceURI === wanted; }) ? wanted : "";
            if (select.value !== value) select.value = value;

            A.dom.setHidden(note, list.length > 0);
            A.dom.setText(note, list.length ? "" : t("settings.voiceNone"));
        });
    }

    // A short message for screen readers after a change made in the window
    function say(name) {
        A.announce(changeMessage(name));
    }

    function changeMessage(name) {
        const setting = t(LABELS[name]);
        const value = get(name);
        if (value === true) return t("settings.saidOn", { setting: setting });
        if (value === false) return t("settings.saidOff", { setting: setting });
        return t("settings.saidValue", { setting: setting, value: valueText(name, value) });
    }

    function valueText(name, value) {
        if (name === "language") return value === "ru" ? "Русский" : "English";
        if (name === "look") {
            const look = lookInfo(value);
            return look ? look.name : String(value);
        }
        if (name === "theme") return t(value === "system" ? "settings.themeSystem" : value === "light" ? "settings.themeLight" : "settings.themeDark");
        if (name === "textSize") return percentText(value);
        if (name === "speechRate") return speedText(value);
        if (name === "lineSpacing") return t(value === "relaxed" ? "settings.lineRelaxed" : "settings.lineNormal");
        if (name === "design") return t(value === "pro" ? "settings.designPro" : "settings.designSimple");
        if (name === "voiceEn" || name === "voiceRu") {
            const voice = voiceFor(name === "voiceRu" ? "ru" : "en");
            return value && voice ? voice.name : t("settings.voiceAuto");
        }
        return String(value);
    }

    /* =========================================================
       10. OPENING AND CLOSING A WINDOW
       Both windows (settings and shortcuts) are pop-up windows of the
       page (see "overlays" in core.js): while one is open, core stops
       the page from scrolling, makes the rest of the page unreachable,
       keeps Tab inside and closes it with Esc. A Ctrl+K command or a
       jump to another section closes it too.
       makeWindow() gives each one the same open() and close():
         id           the window's id for A.overlays
         parts()      builds the window the first time, returns { layer, panel }
         firstFocus() the element that gets the focus when it opens
         scrollBox()  the part that scrolls: it starts at the top every time
         onOpen, onClose   what else to do
         fallback     the button that gets the focus back if the opener can't
       ========================================================= */
    function makeWindow(options) {
        const win = { open: false, opener: null, timer: 0 };

        const overlay = A.overlays.register(options.id, {
            root: function () { return options.parts().layer; },
            element: function () { return options.parts().panel; },
            modal: true,
            close: function () { close(); }
        });

        // opener (optional): the button that gets the focus back when the window closes.
        // Without it, that is whatever has the focus now.
        function open(opener) {
            const parts = options.parts();
            if (win.open) {
                options.firstFocus().focus({ preventScroll: true });
                return;
            }
            clearTimeout(win.timer);
            win.open = true;
            // Where the focus goes back to. Opened again while it was still closing:
            // the focus is still inside, so the place from before stays.
            const active = opener && typeof opener.focus === "function" ? opener : document.activeElement;
            if (!parts.layer.contains(active)) win.opener = active && active !== document.body ? active : null;
            if (options.onOpen) options.onOpen();
            parts.layer.hidden = false;
            parts.layer.classList.remove("is-closing");
            // Only now: a hidden box keeps the place it was scrolled to last time
            options.scrollBox().scrollTop = 0;
            overlay.opened();       // before the focus moves in (core makes the rest inert)
            A.dom.replay(parts.layer, "is-open");
            options.firstFocus().focus({ preventScroll: true });
        }

        function close() {
            if (!win.open) return;
            const parts = options.parts();
            win.open = false;
            if (options.onClose) options.onClose();
            parts.layer.classList.remove("is-open");
            parts.layer.classList.add("is-closing");
            // Core gives the focus back as soon as the page can take it (see core.js)
            const opener = win.opener;
            win.opener = null;
            overlay.closed(function () { giveFocusBack(opener, parts.layer, options.fallback); });
            win.timer = setTimeout(function () {
                if (win.open) return;
                parts.layer.hidden = true;
                parts.layer.classList.remove("is-closing");
            }, A.motion.ok() ? CLOSE_MS : 0);
        }

        return {
            open: open,
            close: close,
            toggle: function () {
                if (win.open) close();
                else open();
            },
            get isOpen() { return win.open; }
        };
    }

    // The focus goes back to where it was (if it still can), or else to a button.
    // A part of the page may have been drawn again while the window was open (the Pro
    // control panel is, when the look changes): A.dom.findAgain finds the new button.
    function giveFocusBack(target, layer, fallback) {
        target = A.dom.findAgain(target);
        if (target && typeof target.focus === "function" &&
            !target.closest("[inert], [hidden]") && target.getClientRects().length > 0) {
            target.focus({ preventScroll: true });
        }
        const active = document.activeElement;
        if (!active || active === document.body || layer.contains(active)) {
            const button = fallback && fallback();
            if (button && !button.hidden) button.focus({ preventScroll: true });
            else if (active && layer.contains(active)) active.blur();
        }
    }

    const toggleButton = document.getElementById("settings-toggle");

    const settingsWindow = makeWindow({
        id: "settings",
        parts: buildSettings,
        // The title takes the focus: screen readers read the window's name,
        // and the next Tab goes to the first control
        firstFocus: function () { return ui.title; },
        scrollBox: function () { return ui.body; },
        fallback: function () { return toggleButton; },
        onOpen: function () {
            paint();
            if (toggleButton) toggleButton.setAttribute("aria-expanded", "true");
            if (canSpeak) window.speechSynthesis.addEventListener("voiceschanged", paintVoices);
        },
        onClose: function () {
            ui.confirmReset.disarm();
            stopSample();
            if (toggleButton) toggleButton.setAttribute("aria-expanded", "false");
            if (canSpeak) window.speechSynthesis.removeEventListener("voiceschanged", paintVoices);
            // Opened from a link ending in #settings: the address goes back to normal,
            // so reloading the page doesn't open the window again
            if (addressSection() !== null) {
                try {
                    history.replaceState(history.state, "", window.location.pathname + window.location.search);
                } catch (error) {
                    // a page opened from a file may refuse this: nothing else depends on it
                }
            }
        }
    });

    // Opens the settings window. section: "account", "design" or "look" opens it at that
    // group (anything else: at the top). opener: the button that gets the focus back when
    // the window closes (without it: whatever has the focus now).
    function openSettings(section, opener) {
        settingsWindow.open(opener);
        if (SECTIONS.indexOf(section) !== -1) showSection(section);
    }

    // Scrolls the window to one of its groups and puts the focus there: on the chosen
    // option of the design or the look, on the first control of the account group
    function showSection(name) {
        const part = name === "account" ? ui.account : ui.body.querySelector("#st-group-" + name).parentElement;
        if (part.hidden) return;        // the account group, when js/profiles.js has not drawn it
        const gap = 12;                 // a little of what is above stays in view
        ui.body.scrollTop += part.getBoundingClientRect().top - ui.body.getBoundingClientRect().top - gap;
        const target = (name !== "account" && part.querySelector("input:checked")) || A.dom.focusable(part)[0];
        if (target) target.focus({ preventScroll: true });
    }

    /* =========================================================
       11. THE KEYBOARD SHORTCUTS WINDOW
       The list is data in js/content/settings.js. Keys are drawn as <kbd>,
       with Ctrl or ⌘ depending on the computer.
       ========================================================= */
    let keysUi = null;

    function keyHTML(key) {
        if (key === "…") return '<span class="st-keys-more">…</span>';
        let label = key;
        if (key === "mod") label = isMac ? "⌘" : "Ctrl";
        else if (A.has("settings.key." + key)) label = t("settings.key." + key);
        return "<kbd>" + esc(label) + "</kbd>";
    }

    // One way to press a shortcut: keys together ("Ctrl + K") or one after another
    function comboHTML(keys, sequence) {
        return '<span class="st-keys-combo' + (sequence ? " is-sequence" : "") + '">' +
            keys.map(keyHTML).join(sequence ? "" : '<span class="st-keys-plus" aria-hidden="true">+</span>') +
            "</span>";
    }

    function shortcutsHTML() {
        return data.shortcuts.map(function (part, index) {
            const id = "st-keys-group-" + index;
            return '<section class="st-keys-group" aria-labelledby="' + id + '">' +
                '<h3 class="st-keys-group-title" id="' + id + '">' + esc(t(part.title, { shortcut: isMac ? "⌘K" : "Ctrl+K" })) + "</h3>" +
                '<dl class="st-keys-list">' +
                    part.items.map(function (item) {
                        const ways = item.keys.map(function (keys) { return comboHTML(keys, item.sequence); });
                        return '<div class="st-keys-row">' +
                            "<dt>" + ways.join('<span class="st-keys-or">' + esc(t("settings.keysOr")) + "</span>") + "</dt>" +
                            "<dd>" + esc(t(item.does)) + "</dd>" +
                        "</div>";
                    }).join("") +
                "</dl>" +
            "</section>";
        }).join("");
    }

    function buildShortcuts() {
        if (keysUi) return keysUi;
        const box = document.createElement("div");
        box.className = "st-layer st-keys-layer";
        box.hidden = true;
        box.innerHTML =
            '<section class="st-panel st-keys-panel" role="dialog" aria-modal="true" aria-labelledby="st-keys-title" aria-describedby="st-keys-intro">' +
                '<header class="st-head">' +
                    '<span class="st-head-icon" aria-hidden="true">' + ICONS.keyboard + "</span>" +
                    '<div class="st-head-text">' +
                        '<h2 class="st-title" id="st-keys-title" data-i18n="settings.keysTitle">' + t("settings.keysTitle") + "</h2>" +
                    "</div>" +
                    '<button type="button" class="st-close" data-action="close" ' +
                        'data-i18n-attr="aria-label:settings.keysClose,title:settings.keysClose" aria-label="' + esc(t("settings.keysClose")) + '" title="' + esc(t("settings.keysClose")) + '">' +
                        '<kbd class="st-close-key" aria-hidden="true">Esc</kbd>' + ICONS.close + "</button>" +
                "</header>" +
                // The list scrolls on small screens: it takes the focus, so the arrow keys scroll it.
                // The first line scrolls with it, so the header stays small on a phone.
                '<div class="st-keys-body" tabindex="0" role="region" aria-labelledby="st-keys-title">' +
                    '<p class="st-intro" id="st-keys-intro" data-i18n="settings.keysIntro">' + t("settings.keysIntro") + "</p>" +
                    '<div class="st-keys-groups"></div>' +
                "</div>" +
            "</section>";
        mount.appendChild(box);

        keysUi = {
            layer: box,
            panel: box.querySelector(".st-panel"),
            body: box.querySelector(".st-keys-body"),
            groups: box.querySelector(".st-keys-groups"),
            lang: ""        // the language the list was drawn in
        };
        keysUi.panel.addEventListener("click", function (event) {
            if (event.target.closest('[data-action="close"]')) shortcutsWindow.close();
        });
        closeOnBackdrop(box, function () { shortcutsWindow.close(); });
        return keysUi;
    }

    function paintShortcuts() {
        if (!keysUi || keysUi.lang === A.lang) return;
        keysUi.lang = A.lang;
        keysUi.groups.innerHTML = shortcutsHTML();
    }

    const shortcutsWindow = makeWindow({
        id: "shortcuts",
        parts: buildShortcuts,
        firstFocus: function () { return keysUi.body; },
        scrollBox: function () { return keysUi.body; },
        fallback: function () { return null; },
        onOpen: paintShortcuts
    });

    /* =========================================================
       12. CHANGES, KEYS AND LINKS
       ========================================================= */

    // Changes a setting by its public name. Returns false for a value that isn't
    // one of the choices (nothing changes then).
    function set(name, value) {
        if (name === "language") {
            if (value !== "en" && value !== "ru") return false;
            if (value !== A.lang) A.setLanguage(value);     // core translates the page again
            return true;
        }
        if (name === "look") return setLook(value);
        if (name === "theme") {
            // The older name of the plain looks: a palette that is on steps aside
            if (value !== "system" && value !== "dark" && value !== "light") return false;
            return setLook(value);
        }
        if (name === "calm") {
            if (!isBoolean(value)) return false;
            A.motion.setCalm(value);       // core saves it (section 12 hears about it)
            return true;
        }
        if (name === "followSystem" || !CHECKS[name] || !CHECKS[name](value)) return false;
        if (prefs[name] === value) return true;
        prefs[name] = value;
        // The Pro design comes with the extra effects, the simple one without them
        // ("Extra effects" can still be switched on or off by hand after that)
        let fancyChanged = false;
        if (name === "design" && prefs.fancy !== (value === "pro")) {
            prefs.fancy = value === "pro";
            fancyChanged = true;
        }
        save();
        applyToPage();
        if (LAYOUT_SETTINGS.indexOf(name) !== -1 || name === "design") A.layoutChanged();
        changed(name);
        if (fancyChanged) changed("fancy");
        return true;
    }

    // Back to the defaults: every setting of the Reading, Comfort and Reading aloud
    // groups. The language, the look and the design stay as they are (and the account).
    function reset() {
        Object.keys(DEFAULTS).forEach(function (name) {
            if (name !== "followSystem" && name !== "design") set(name, DEFAULTS[name]);
        });
        set("calm", false);
    }

    // The value of every setting the last time it was reported, so a change is
    // reported once, and setting the same value again reports nothing
    const reported = {};
    Object.keys(LABELS).forEach(function (name) { reported[name] = get(name); });

    // A setting may have changed, here or elsewhere: if it really did, the rest of
    // the page hears about it (A.settings.onChange, and the progress event
    // "settings.change", which core sends itself for calm mode), and the open
    // window shows it
    function changed(name) {
        const value = get(name);
        if (reported[name] === value) return;
        reported[name] = value;
        if (name !== "calm") A.track("settings.change", { name: name, value: value });
        A.emit("settings", { name: name, value: value });
        repaint();
    }

    // Changes made elsewhere (core's buttons, Ctrl+K commands) count too
    A.onLanguageChange(function () {
        changed("language");
        if (prefs.easyFont) fontArrived();      // Russian pages use the other font
        if (shortcutsWindow.isOpen) paintShortcuts();
    });

    // The theme or the palette changed (js/arctic-blue.js sends "theme" for a palette too).
    // Picked by hand somewhere else (a Ctrl+K command, the Pro terminal, Compass Bot)?
    // Then the look stops following the device. Not when this tab only copies the look
    // that another tab chose: that tab has saved what "Like my device" is now.
    A.onThemeChange(function () {
        const copied = Boolean(A.mode && A.mode.copying);
        if (!themeByThisFile && !copied && prefs.followSystem) {
            prefs.followSystem = false;
            save();
        }
        changed("theme");
        changed("look");
    });

    // Another tab switched "Like my device" on or off: this tab shows the same look.
    // Only this one value is taken over, and only in memory (the other tab has saved it).
    // The theme and the palette arrive by themselves (js/arctic-blue.js copies them).
    window.addEventListener("storage", function (event) {
        if (event.key !== "aic:" + STORAGE_KEY) return;
        const saved = A.storage.get(STORAGE_KEY, null);
        if (!saved || typeof saved !== "object" || saved.v !== VERSION || !isBoolean(saved.followSystem)) return;
        if (saved.followSystem === prefs.followSystem) return;
        prefs.followSystem = saved.followSystem;
        followDevice();
        changed("theme");
        changed("look");
    });

    A.motion.onChange(function () {
        changed("calm");
        repaint();      // also when only the device's own setting changed (the note under "Calm motion")
    });

    // "?" opens (and closes) the shortcuts window, unless you are typing text somewhere
    // (on a radio button, a switch or a slider it works too).
    // On a Russian keyboard "?" is Shift+7, and event.key is "?" there too. The key
    // that has "/" and "?" on an English keyboard (event.code "Slash") counts with Shift.
    document.addEventListener("keydown", function (event) {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
        const question = event.key === "?" || (event.code === "Slash" && event.shiftKey);
        if (!question || typesText(event.target)) return;
        event.preventDefault();
        shortcutsWindow.toggle();
    });

    // The gear button in the menu bar
    if (toggleButton) {
        toggleButton.setAttribute("aria-haspopup", "dialog");
        toggleButton.setAttribute("aria-expanded", "false");
        toggleButton.addEventListener("click", function () { settingsWindow.open(toggleButton); });
        toggleButton.hidden = false;
    }

    // Every other element with data-open-settings opens the window too: the "Settings"
    // button of the phone menu, the line about the Pro design on the home page. Its
    // value may name a group to open at: data-open-settings="design".
    document.addEventListener("click", function (event) {
        const button = event.target.closest && event.target.closest("[data-open-settings]");
        if (!button) return;
        event.preventDefault();
        let opener = button;
        // In the phone menu: the menu closes first (its buttons are hidden then), and
        // the menu's own button is where the focus goes back to
        const menuButton = document.getElementById("menu-toggle");
        if (menuButton && button.closest("#nav-links") && A.overlays.isOpen("menu")) {
            A.overlays.close("menu");
            opener = menuButton;
        }
        openSettings(button.getAttribute("data-open-settings"), opener);
    });
    // They start hidden in index.html: without this file they could do nothing
    document.querySelectorAll("[data-open-settings][hidden]").forEach(function (button) {
        button.setAttribute("aria-haspopup", "dialog");
        button.hidden = false;
    });

    // A link to the page ending in #settings opens the window; #settings-account,
    // #settings-design and #settings-look open it at that group. Nothing on the page has
    // such an id, so core's pages (js/core.js, "Pages") leave these addresses alone.
    // Returns "" for the plain address, the group's name, or null for any other address.
    function addressSection() {
        const hash = window.location.hash;
        if (hash === HASH) return "";
        const section = hash.indexOf(HASH + "-") === 0 ? hash.slice(HASH.length + 1) : "";
        return SECTIONS.indexOf(section) !== -1 ? section : null;
    }

    function openFromAddress() {
        const section = addressSection();
        if (section !== null) openSettings(section);
    }
    window.addEventListener("hashchange", openFromAddress);
    // Once every script has run, so the whole page is ready behind the window
    A.ready(openFromAddress);

    // Start: the settings go on the page (again, after the <head> script) and the
    // look follows the device, if that was chosen
    applyToPage();
    followDevice();

    /* =========================================================
       13. CTRL+K COMMANDS AND THE PUBLIC API
       ========================================================= */
    const GROUP = "settings.cmdGroup";

    A.registerCommand({
        id: "settings-open",
        group: GROUP,
        icon: "⚙️",
        title: function () { return t("settings.cmdOpen"); },
        keywords: "settings preferences options accessibility text size font contrast voice account " +
            "настройки параметры доступность размер текста шрифт контраст голос аккаунт",
        run: function () { settingsWindow.open(); }
    });

    // The look picker (core's own command "Next look" goes to the next look at once)
    A.registerCommand({
        id: "settings-look",
        group: GROUP,
        icon: "🎨",
        title: function () { return t("settings.cmdLook"); },
        keywords: "look theme palette colours colors appearance skin dark light paper arctic blossom lagoon autumn forest space " +
            "оформление тема палитра цвета вид тёмное светлое бумага арктика вишня лагуна осень лес космос",
        run: function () { openSettings("look"); }
    });

    A.registerCommand({
        id: "settings-shortcuts",
        group: GROUP,
        icon: "⌨️",
        title: function () { return t("settings.cmdShortcuts"); },
        keywords: "keyboard shortcuts keys hotkeys help клавиши горячие сочетания клавиатура помощь",
        keepOverlays: true,
        run: function () { shortcutsWindow.open(); }
    });

    // Bigger / smaller text: one step at a time, with a toast that says the new size
    function stepTextSize(step) {
        const index = TEXT_SIZES.indexOf(prefs.textSize) + step;
        if (index < 0 || index >= TEXT_SIZES.length) {
            A.toast(t(step > 0 ? "settings.atLargest" : "settings.atSmallest"), "🔤");
            return;
        }
        set("textSize", TEXT_SIZES[index]);
        A.toast(changeMessage("textSize"), "🔤");
    }

    A.registerCommand({
        id: "settings-text-bigger",
        group: GROUP,
        icon: "🔠",
        title: function () { return t("settings.cmdBigger"); },
        keywords: "bigger larger text font size zoom increase крупнее больше текст шрифт размер увеличить",
        keepOverlays: true,
        run: function () { stepTextSize(1); }
    });

    A.registerCommand({
        id: "settings-text-smaller",
        group: GROUP,
        icon: "🔡",
        title: function () { return t("settings.cmdSmaller"); },
        keywords: "smaller text font size decrease reset мельче меньше текст шрифт размер уменьшить",
        keepOverlays: true,
        run: function () { stepTextSize(-1); }
    });

    // An on / off setting: the title says what running it will do
    function switchCommand(name, labelKey, icon, keywords) {
        A.registerCommand({
            id: "settings-" + name,
            group: GROUP,
            icon: icon,
            title: function () {
                return t(get(name) ? "settings.cmdTurnOff" : "settings.cmdTurnOn", { setting: t(labelKey) });
            },
            keywords: keywords,
            keepOverlays: true,
            run: function () {
                set(name, !get(name));
                A.toast(changeMessage(name), icon);
            }
        });
    }

    switchCommand("contrast", "settings.contrast", "🔆",
        "high contrast accessibility readable высокий контраст доступность яркость");
    switchCommand("easyFont", "settings.easyFont", "🔤",
        "easy read font dyslexia readable atkinson удобный шрифт дислексия читаемый andika");
    switchCommand("underlineLinks", "settings.underline", "🔗",
        "underline links подчёркивать подчеркнуть ссылки");
    switchCommand("reduceTransparency", "settings.solid", "🌫️",
        "reduce transparency solid glass background прозрачность сплошной фон стекло");

    // The design: simple or Pro
    A.registerCommand({
        id: "settings-design",
        group: GROUP,
        icon: "🛰️",
        title: function () {
            return t(prefs.design === "pro" ? "settings.cmdDesignSimple" : "settings.cmdDesignPro");
        },
        keywords: "design pro professional expert simple beginner mode look дизайн про профессиональный эксперт простой новичок режим вид",
        keepOverlays: true,
        run: function () {
            set("design", prefs.design === "pro" ? "simple" : "pro");
            A.toast(changeMessage("design"), prefs.design === "pro" ? "🛰️" : "🌱");
        }
    });

    // Line spacing: relaxed or normal
    A.registerCommand({
        id: "settings-lineSpacing",
        group: GROUP,
        icon: "↕️",
        title: function () {
            return t(prefs.lineSpacing === "relaxed" ? "settings.cmdTurnOff" : "settings.cmdTurnOn", { setting: t("settings.cmdRelaxed") });
        },
        keywords: "line spacing relaxed height межстрочный интервал строки свободный",
        keepOverlays: true,
        run: function () {
            set("lineSpacing", prefs.lineSpacing === "relaxed" ? "normal" : "relaxed");
            A.toast(changeMessage("lineSpacing"), "↕️");
        }
    });

    // The look like the device's, or back to the plain theme it has now
    A.registerCommand({
        id: "settings-theme-system",
        group: GROUP,
        icon: "🖥️",
        title: function () {
            return t(prefs.followSystem ? "settings.cmdTurnOff" : "settings.cmdTurnOn", { setting: t("settings.cmdSystemTheme") });
        },
        keywords: "look theme system device auto automatic dark light оформление тема система устройство автоматически тёмное светлое",
        keepOverlays: true,
        run: function () {
            set("look", prefs.followSystem ? A.theme : "system");
            A.toast(changeMessage("look"), "🖥️");
        }
    });

    // AICompass.settings: other features read and change the settings here.
    //   get(name)            the value of a setting (names below)
    //   set(name, value)     changes it; returns false for a value that isn't allowed
    //   onChange(callback)   callback({ name, value }) after every change, wherever it
    //                        came from; returns a function that stops listening
    //   reset()              the Reading, Comfort and Reading aloud settings back to normal
    //   open(section, opener) / close() / isOpen      the settings window. section
    //                        (optional): "account", "design" or "look" opens it at that
    //                        group. opener (optional): the button that gets the focus
    //                        back when the window closes.
    //   shortcuts()          opens the keyboard shortcuts window
    //   voice(lang)          the voice to read "en" or "ru" with (a SpeechSynthesisVoice),
    //                        or null: let the browser choose
    // Names and values:
    //   language "en" | "ru"                   calm true | false
    //   look "system" | "dark" | "light" | a palette's id ("arctic", "lagoon"...: the
    //        looks of js/arctic-blue.js). The one choice of how the site is coloured.
    //   theme "dark" | "light" | "system"      the older name of the plain looks: with a
    //        palette on it is the theme under the palette; setting it clears the palette
    //   textSize 1 | 1.125 | 1.25 | 1.5        lineSpacing "normal" | "relaxed"
    //   easyFont, underlineLinks, contrast, reduceTransparency, fancy   true | false
    //   design "simple" | "pro"
    //   voiceEn, voiceRu   a voice's voiceURI, "" for automatic
    //   speechRate 0.75 | 1 | 1.25 | 1.5  (for SpeechSynthesisUtterance.rate)
    A.feature("settings", {
        get: get,
        set: set,
        onChange: function (callback) { return A.on("settings", callback); },
        reset: reset,
        open: openSettings,
        close: function () { settingsWindow.close(); },
        get isOpen() { return settingsWindow.isOpen; },
        shortcuts: function () { shortcutsWindow.open(); },
        voice: voiceFor
    });
})();
