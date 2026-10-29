/* =========================================================
   AI COMPASS — SETTINGS
   One window for every preference, so the site is comfortable for
   every learner: the language, the theme (dark, light or like the
   device), the text size, the line spacing, an easy-to-read font,
   underlined links, high contrast, less transparency, calm motion,
   and the voice and speed for reading lessons aloud.
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
    5. The theme: dark, light or like the device
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
   window, Ctrl+K, the buttons in the menu bar): language, theme ("dark",
   "light" or "system"), textSize, lineSpacing, easyFont, underlineLinks,
   contrast, reduceTransparency, voiceEn, voiceRu and speechRate. For calm
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
    const TEST_KEY = "settings.test";     // only to find out whether the browser can save
    const VERSION = 1;

    // The text size steps: --text-scale on <html> (style.css). 1 is the normal size.
    const TEXT_SIZES = [1, 1.125, 1.25, 1.5];
    // Reading-aloud speeds: 1 is the voice's normal speed
    const SPEECH_RATES = [0.75, 1, 1.25, 1.5];
    const LINE_SPACINGS = ["normal", "relaxed"];

    // Every setting of this file, as it is when nothing was saved
    // (and after "Reset to defaults", except followSystem)
    const DEFAULTS = Object.freeze({
        followSystem: false,        // the theme follows the device's light / dark mode
        textSize: 1,
        lineSpacing: "normal",
        easyFont: false,
        underlineLinks: false,
        contrast: false,
        reduceTransparency: false,
        voiceEn: "",                // the voiceURI of the chosen voice; "" = automatic
        voiceRu: "",
        speechRate: 1
    });

    // The class on <html> for each on / off setting (css/settings.css, part 1)
    const PAGE_CLASSES = {
        easyFont: "st-font",
        underlineLinks: "st-underline",
        contrast: "st-contrast",
        reduceTransparency: "st-solid"
    };
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
    const VOICE_NAME_MAX = 300;      // a saved voice name longer than this is not a real one

    // The name of each setting, for messages like "High contrast: on".
    // Every public setting (see the API in section 13) is in this list.
    const LABELS = {
        language: "settings.language",
        theme: "settings.theme",
        textSize: "settings.textSize",
        lineSpacing: "settings.lineSpacing",
        easyFont: "settings.easyFont",
        underlineLinks: "settings.underline",
        contrast: "settings.contrast",
        reduceTransparency: "settings.solid",
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

    // Macs (and iPhones, iPads) write ⌘ where other computers write Ctrl.
    // js/palette.js asks the same question.  TODO(core): share it as A.platform.isMac
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");

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
    let canSave = null;     // false when the browser refuses to save (storage blocked); null: not known yet

    function save() {
        canSave = A.storage.set(STORAGE_KEY, Object.assign({ v: VERSION }, prefs));
    }

    // Can this browser save? Known after the first save; before that, the window
    // asks once with a small test value (written and removed at once)
    function storageWorks() {
        if (canSave === null) {
            canSave = A.storage.set(TEST_KEY, true);
            A.storage.remove(TEST_KEY);
        }
        return canSave;
    }

    // The value of a setting, by its public name (see the API in section 13)
    function get(name) {
        if (name === "language") return A.lang;
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
        if (prefs.easyFont) loadFont();
    }

    /* =========================================================
       5. THE THEME: DARK, LIGHT OR LIKE THE DEVICE
       Core knows two themes (A.setTheme). "Like my device" is kept here
       (followSystem): this file then picks dark or light from the
       device's setting, now and whenever the device changes it.
       ========================================================= */
    let themeByThisFile = false;     // true while this file switches the theme itself

    function deviceTheme() {
        return A.media(LIGHT_QUERY).matches ? "light" : "dark";
    }

    function followDevice() {
        if (!prefs.followSystem) return;
        themeByThisFile = true;
        try {
            A.setTheme(deviceTheme());
        } finally {
            themeByThisFile = false;     // also if something went wrong
        }
    }

    // The device switched between light and dark mode
    A.onMedia(LIGHT_QUERY, function () {
        followDevice();
        repaint();      // the hint "Your device is in dark mode now"
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
        // Three lines, close together or further apart (the line spacing options)
        linesNormal: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 8h16M4 12h16M4 16h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        linesRelaxed: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };

    // A translated text that core.js translates again by itself (data-i18n)
    function text(key, className, tag) {
        return A.i18nHTML(key, className, tag);
    }

    // A row of options: a group of radio buttons with a name above them.
    // options: [{ value, html }]; hintKey: an optional text under the row
    function optionRow(name, labelKey, options, hintKey, extraClass) {
        const id = "st-" + name;
        return '<div class="st-row st-seg' + (extraClass ? " " + extraClass : "") + '" data-setting="' + name + '" ' +
                'role="radiogroup" aria-labelledby="' + id + '-name"' +
                (hintKey ? ' aria-describedby="' + id + '-hint"' : "") + ">" +
                '<span class="st-row-name" id="' + id + '-name" data-i18n="' + labelKey + '">' + t(labelKey) + "</span>" +
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

                        // The sample card shows the settings; it is only for looking at
                        '<div class="st-preview" aria-hidden="true" inert>' +
                            text("settings.preview", "st-preview-label", "p") +
                            text("settings.previewTitle", "st-preview-title", "p") +
                            '<p class="st-preview-text">' + text("settings.previewText") + " " +
                                '<a href="#lessons" tabindex="-1" data-i18n="settings.previewLink">' + t("settings.previewLink") + "</a></p>" +
                            text("settings.previewButton", "btn btn-primary btn-small st-preview-button") +
                        "</div>" +

                        group("settings.groupLanguage", "st-group-language", [
                            optionRow("language", "settings.language", [
                                { value: "en", html: '<span lang="en">English</span>' },
                                { value: "ru", html: '<span lang="ru">Русский</span>' }
                            ]),
                            optionRow("theme", "settings.theme", [
                                { value: "dark", html: text("settings.themeDark") },
                                { value: "light", html: text("settings.themeLight") },
                                { value: "system", html: text("settings.themeSystem") }
                            ], null, "st-seg-wrap") +
                            '<p class="st-note st-theme-note" id="st-theme-note" hidden></p>'
                        ]) +

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
                            switchRow("calm", "settings.calm", "settings.calmHint")
                        ]) +

                        group("settings.groupSound", "st-group-sound", [
                            '<p class="st-hint st-group-hint" data-i18n="settings.soundHint">' + t("settings.soundHint") + "</p>"
                        ].concat(sound)) +

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
            switches: Array.from(layer.querySelectorAll(".st-toggle")),
            themeNote: layer.querySelector(".st-theme-note"),
            fontNote: layer.querySelector("#st-easyFont-note"),
            calmNote: layer.querySelector("#st-calm-note"),
            noSave: layer.querySelector(".st-no-save"),
            reset: layer.querySelector(".st-reset"),
            resetLabel: layer.querySelector(".st-reset-label"),
            voices: Array.from(layer.querySelectorAll(".st-voice"))
        };

        // Every radio button and drop-down list
        ui.panel.addEventListener("change", function (event) {
            const input = event.target;
            const row = input.closest("[data-setting]");
            if (!row) return;
            const name = row.getAttribute("data-setting");
            let value = input.value;
            if (name === "textSize" || name === "speechRate") value = Number(value);
            if (set(name, value)) say(name);
        });

        // The switches and the buttons
        ui.panel.addEventListener("click", function (event) {
            const target = event.target.closest("[data-setting].st-toggle, [data-action]");
            if (!target) return;
            const action = target.getAttribute("data-action");
            if (action === "close") settingsWindow.close();
            else if (action === "shortcuts") shortcutsWindow.open();
            else if (action === "listen") playSample(target.getAttribute("data-lang"));
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
       (the sun / moon button, a Ctrl+K command, the device...).
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
        checkRadio("language", A.lang);
        checkRadio("theme", get("theme"));
        checkRadio("textSize", String(prefs.textSize));
        checkRadio("lineSpacing", prefs.lineSpacing);
        if (canSpeak) checkRadio("speechRate", String(prefs.speechRate));

        ui.switches.forEach(function (button) {
            A.dom.setAttr(button, "aria-checked", String(get(button.getAttribute("data-setting")) === true));
        });

        // "Like my device": which theme the device has now
        A.dom.setHidden(ui.themeNote, !prefs.followSystem);
        if (prefs.followSystem) A.dom.setText(ui.themeNote, t(deviceTheme() === "light" ? "settings.themeNowLight" : "settings.themeNowDark"));

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
        if (name === "theme") return t(value === "system" ? "settings.themeSystem" : value === "light" ? "settings.themeLight" : "settings.themeDark");
        if (name === "textSize") return percentText(value);
        if (name === "speechRate") return speedText(value);
        if (name === "lineSpacing") return t(value === "relaxed" ? "settings.lineRelaxed" : "settings.lineNormal");
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

        function open() {
            const parts = options.parts();
            if (win.open) {
                options.firstFocus().focus({ preventScroll: true });
                return;
            }
            clearTimeout(win.timer);
            win.open = true;
            // Where the focus goes back to. Opened again while it was still closing:
            // the focus is still inside, so the place from before stays.
            const active = document.activeElement;
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

    // The focus goes back to where it was (if it still can), or else to a button
    function giveFocusBack(target, layer, fallback) {
        if (target && target.isConnected && typeof target.focus === "function" &&
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
            if (window.location.hash === HASH) {
                try {
                    history.replaceState(history.state, "", window.location.pathname + window.location.search);
                } catch (error) {
                    // a page opened from a file may refuse this: nothing else depends on it
                }
            }
        }
    });

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
        if (name === "theme") {
            if (value !== "system" && value !== "dark" && value !== "light") return false;
            const follow = value === "system";
            if (follow !== prefs.followSystem) {
                prefs.followSystem = follow;
                save();
            }
            if (follow) followDevice();
            else A.setTheme(value);
            changed("theme");
            return true;
        }
        if (name === "calm") {
            if (!isBoolean(value)) return false;
            A.motion.setCalm(value);       // core saves it (section 12 hears about it)
            return true;
        }
        if (name === "followSystem" || !CHECKS[name] || !CHECKS[name](value)) return false;
        if (prefs[name] === value) return true;
        prefs[name] = value;
        save();
        applyToPage();
        if (LAYOUT_SETTINGS.indexOf(name) !== -1) A.layoutChanged();
        changed(name);
        return true;
    }

    // Back to the defaults: every setting of the Reading, Comfort and Reading aloud
    // groups. The language and the theme stay as they are.
    function reset() {
        Object.keys(DEFAULTS).forEach(function (name) {
            if (name !== "followSystem") set(name, DEFAULTS[name]);
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

    // The theme changed. Picked by hand (the sun / moon button, a Ctrl+K command,
    // Compass Bot)? Then it stops following the device.
    A.onThemeChange(function () {
        if (!themeByThisFile && prefs.followSystem) {
            prefs.followSystem = false;
            save();
        }
        changed("theme");
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
        toggleButton.addEventListener("click", function () { settingsWindow.open(); });
        toggleButton.hidden = false;
    }

    // A link to the page ending in #settings opens the window
    function openFromAddress() {
        if (window.location.hash === HASH) settingsWindow.open();
    }
    window.addEventListener("hashchange", openFromAddress);
    // Once every script has run, so the whole page is ready behind the window
    A.ready(openFromAddress);

    // Start: the settings go on the page (again, after the <head> script) and the
    // theme follows the device, if that was chosen
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
        keywords: "settings preferences options accessibility text size font contrast voice " +
            "настройки параметры доступность размер текста шрифт контраст голос",
        run: function () { settingsWindow.open(); }
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

    // The theme like the device's, or back to the theme it has now
    A.registerCommand({
        id: "settings-theme-system",
        group: GROUP,
        icon: "🖥️",
        title: function () {
            return t(prefs.followSystem ? "settings.cmdTurnOff" : "settings.cmdTurnOn", { setting: t("settings.cmdSystemTheme") });
        },
        keywords: "theme system device auto automatic dark light тема система устройство автоматически тёмная светлая",
        keepOverlays: true,
        run: function () {
            set("theme", prefs.followSystem ? A.theme : "system");
            A.toast(changeMessage("theme"), "🖥️");
        }
    });

    // AICompass.settings: other features read and change the settings here.
    //   get(name)            the value of a setting (names below)
    //   set(name, value)     changes it; returns false for a value that isn't allowed
    //   onChange(callback)   callback({ name, value }) after every change, wherever it
    //                        came from; returns a function that stops listening
    //   reset()              the Reading, Comfort and Reading aloud settings back to normal
    //   open() / close() / isOpen      the settings window
    //   shortcuts()          opens the keyboard shortcuts window
    //   voice(lang)          the voice to read "en" or "ru" with (a SpeechSynthesisVoice),
    //                        or null: let the browser choose
    // Names and values:
    //   language "en" | "ru"      theme "dark" | "light" | "system"      calm true | false
    //   textSize 1 | 1.125 | 1.25 | 1.5        lineSpacing "normal" | "relaxed"
    //   easyFont, underlineLinks, contrast, reduceTransparency   true | false
    //   voiceEn, voiceRu   a voice's voiceURI, "" for automatic
    //   speechRate 0.75 | 1 | 1.25 | 1.5  (for SpeechSynthesisUtterance.rate)
    A.feature("settings", {
        get: get,
        set: set,
        onChange: function (callback) { return A.on("settings", callback); },
        reset: reset,
        open: function () { settingsWindow.open(); },
        close: function () { settingsWindow.close(); },
        get isOpen() { return settingsWindow.isOpen; },
        shortcuts: function () { shortcutsWindow.open(); },
        voice: voiceFor
    });
})();
