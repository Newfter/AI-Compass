/* =========================================================
   AI COMPASS — CORE
   Loaded before every other script. It builds window.AICompass,
   the toolkit that every feature file uses (called "A" there).
   The words themselves live in js/content/ (one file per part of the site).

   THE PARTS OF THIS FILE
    1. storage       saving settings in the browser
    2. events        A.on / A.emit (the "aic:..." events)
    3. texts         translations, plurals, values inside texts, number formats, language
    4. theme         light / dark and the colour of the address bar
    5. motion        reduced motion (device) + calm mode (our own switch),
                     and numbers that count up
    6. helpers       small tools: maths and easing, page elements, buttons that
                     need a second press, colours, canvas
    7. screen        media queries, visibility, resizing, the pixel ratio, layout sizes
    8. announce      messages for screen readers
    9. overlays      pop-up windows: scroll lock, focus, the Esc key
   10. navigation    the page sections, A.navigate, one scroll pipeline, parts
                     built when needed, the menu bar
   11. commands      the command list of the Ctrl+K palette
   12. features      how feature files share their API and content
   13. toasts        small pop-up messages
       the toolkit   window.AICompass itself, and the built-in commands
   14. start-up      translating the page, the theme and language buttons

   THE TOOLKIT AT A GLANCE (each one is explained where it is written)
    1  A.storage.get(key, fallback) / set(key, value) / remove(key) / migrate(old, new)
       A.storage.session: the same, forgotten when the tab closes
    2  A.on(name, callback) -> stop()      A.emit(name, detail)
       names: language, theme, motion, overlay, section, feature (sent as "aic:" + name)
    3  A.t(key, values)   A.has(key)   A.plural(key, n, values)   A.pluralForm(n)
       A.addTranslations({ en, ru })   A.applyTranslations(element)   A.i18nHTML(key, className, tag)
       A.setTextValue(name, value)   A.textValue(name): a {name} that any text can show
       in the HTML: data-i18n="key", data-i18n-attr="aria-label:key", data-i18n-plural="name"
       A.format.number(n, options)   A.format.percent(share, options)   A.format.date(date, options)
       A.lang   A.locale   A.setLanguage(lang)   A.toggleLanguage()   A.onLanguageChange(callback)
    4  A.theme   A.setTheme(theme)   A.toggleTheme()   A.onThemeChange(callback)
    5  A.motion.ok() / reduced / calm / setCalm(on) / toggleCalm() / onChange(callback) / ease
       A.reducedMotion (the device setting only)
       A.countUp(element, from, to, ms, { format, ease, done }) -> { finish(), stop(), value }
    6  A.util.clamp / lerp / easeOut / random / randomInt / pick / shuffle /
              sampleWeighted / debounce / frameThrottle
       A.dom.focusable / focusHeading / pauseScrollAnchoring / replay / fromHTML
       A.confirmPress(button, { onArm, onDisarm, onConfirm, enabled, timeout })
           -> { armed, disarm() }: a button that needs a second press
       A.colors.parse / rgb(cssName) / rgba(color, alpha) / mix(a, b, amount)
       A.canvas.pixelRatio / fit / roundRect   A.cssVar(name)   A.escapeHTML(text)
    7  A.breakpoints   A.queries   A.media(query)   A.onMedia(query, callback)
       A.whenVisible(element, callback, options)   A.onResize(callback, options)
       A.onPixelRatioChange(callback)   A.layout.px / navHeight
    8  A.announce(text, options)
    9  A.overlays.register(id, options) -> { opened(), closed(), close(reason) }
       A.overlays.closeAll / isOpen / top / hasModal / onChange / update
       (while a window locks the page, <body> gets --scrollbar-gap for the fixed bars)
   10  A.sections   A.navigate(id, options)   A.onScroll(callback)   A.onLayout(callback)
       A.layoutChanged()   A.onSection(callback)   A.whenNeeded(element, build, options)
       A.buildParts(target)   A.whenIdle(callback)
   11  A.registerCommand(command)   A.runCommand(id or command)   A.commands
   12  A.feature(name, api)   A.whenFeature(name) -> Promise   A.ready(callback)
       A.content.set(name, data) / get(name)
   13  A.toast(text, icon)
   ========================================================= */

(function () {
    "use strict";

    const root = document.documentElement;
    // Every storage key starts with this. The theme script in index.html reads "aic:theme" itself.
    const PREFIX = "aic:";

    // Errors in one listener must not stop the others: report them and go on
    function report(error) {
        if (typeof window.reportError === "function") window.reportError(error);
        else if (window.console) console.error(error);
    }

    function safeCall(callback, value) {
        try {
            callback(value);
        } catch (error) {
            report(error);
        }
    }

    /* =========================================================
       1. STORAGE
       Some browsers block storage (private mode, strict settings),
       so every call is wrapped. Values are saved as JSON under "aic:<key>".
       ========================================================= */
    function makeStore(area) {
        return {
            get: function (key, fallback) {
                try {
                    const value = window[area].getItem(PREFIX + key);
                    return value === null ? fallback : JSON.parse(value);
                } catch (error) {
                    return fallback;
                }
            },
            set: function (key, value) {
                try {
                    window[area].setItem(PREFIX + key, JSON.stringify(value));
                    return true;
                } catch (error) {
                    return false;
                }
            },
            remove: function (key) {
                try {
                    window[area].removeItem(PREFIX + key);
                } catch (error) {}
            }
        };
    }

    const storage = makeStore("localStorage");

    // The same, but forgotten when the tab is closed
    storage.session = makeStore("sessionStorage");

    // Moves a value saved under an old name to its new name
    storage.migrate = function (oldKey, newKey) {
        const value = storage.get(oldKey, undefined);
        if (value === undefined) return;
        if (storage.get(newKey, undefined) === undefined) storage.set(newKey, value);
        storage.remove(oldKey);
    };

    /* =========================================================
       2. EVENTS
       Every event of the site is "aic:" + a name, sent on document:
       language, theme, motion, overlay, section, feature.
       ========================================================= */
    function emit(name, detail) {
        document.dispatchEvent(new CustomEvent(PREFIX + name, { detail: detail }));
    }

    // Listens to an event. Returns a function that stops listening.
    function on(name, callback) {
        const listener = function (event) { callback(event.detail); };
        document.addEventListener(PREFIX + name, listener);
        return function () { document.removeEventListener(PREFIX + name, listener); };
    }

    /* =========================================================
       3. TEXTS: TRANSLATIONS, PLURALS, VALUES INSIDE TEXTS, NUMBERS
       ========================================================= */
    const LANGUAGES = ["en", "ru"];

    // How numbers and dates are written. English dates are day-month-year.
    const LOCALES = { en: "en-GB", ru: "ru-RU" };

    const translations = { en: {}, ru: {} };

    const state = {
        lang: storage.get("language", "en") === "ru" ? "ru" : "en",
        theme: root.getAttribute("data-theme") === "light" ? "light" : "dark"
    };

    function addTranslations(dictionary) {
        LANGUAGES.forEach(function (lang) {
            Object.assign(translations[lang], dictionary[lang] || {});
        });
    }

    // The text of a key in the current language (English if it is missing)
    function lookup(key) {
        const text = translations[state.lang][key];
        return text === undefined ? translations.en[key] : text;
    }

    // ----- Values inside texts -----
    // Some texts show a number or a word that comes from the data, like the number of
    // lessons. The feature that knows it registers it once, by name:
    //     A.setTextValue("lessonCount", LESSONS.length);
    //     A.setTextValue("questionCount", function () { return A.plural("quiz.questionCount", QUESTIONS.length); });
    // Then any text can say {lessonCount}: t(), A.plural() and the data-i18n elements of
    // the page fill it in, also after a language change. A function is asked again each
    // time, so it can answer in the current language ("12 questions" / "12 вопросов").
    // Numbers are written the local way (A.format.number). Values passed to t() itself
    // win over these. Pick a name that says what it is ("lessonCount", not "n"): it fills
    // that {name} in every text. A text that depends on a number names it on its element,
    // and gets the plural form that suits it (see plural() below):
    //     <span data-i18n="hero.statLessons" data-i18n-plural="lessonCount">lessons</span>
    const textValues = {
        languageCount: LANGUAGES.length       // for texts like "2 languages"
    };

    function textValue(name) {
        if (!Object.prototype.hasOwnProperty.call(textValues, name)) return undefined;
        const value = textValues[name];
        return typeof value === "function" ? value() : value;
    }

    function setTextValue(name, value) {
        // The same number or word again: nothing to redo (a function may answer differently now)
        if (textValues[name] === value && typeof value !== "function") return;
        textValues[name] = value;
        // Texts already on the page are filled in again (at start-up core translates them anyway)
        if (pageReady) applyTranslations(document);
    }

    // Fills in {placeholders}: fill("{n} lessons", { n: 3 }) -> "3 lessons".
    // A placeholder that "values" doesn't have takes a registered text value, if there is one.
    function fill(text, values) {
        if (text.indexOf("{") === -1) return text;
        return text.replace(/\{(\w+)\}/g, function (match, name) {
            if (values && Object.prototype.hasOwnProperty.call(values, name)) return values[name];
            const value = textValue(name);
            if (value === undefined) return match;
            return typeof value === "number" ? formatNumber(value) : value;
        });
    }

    // t("quiz.title") returns the text in the current language.
    // Optional values fill in {placeholders}: t("quiz.q.counter", { n: 3, total: 12 }) -> "Question 3 / 12"
    // (a value set with setTextValue() fills its {name} without being passed)
    function t(key, values) {
        const text = lookup(key);
        return text === undefined ? key : fill(text, values);
    }

    // Which form a number needs: "one", "few" or "many".
    // English: 1 lesson / 2 lessons. Russian: 1 урок / 2 урока / 5 уроков (and 1,5 урока).
    function pluralForm(n) {
        const value = Math.abs(Number(n)) || 0;
        if (state.lang !== "ru") return value === 1 ? "one" : "many";
        if (!Number.isInteger(value)) return "few";
        const lastDigit = value % 10;
        const lastTwo = value % 100;
        if (lastDigit === 1 && lastTwo !== 11) return "one";
        if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return "few";
        return "many";
    }

    const FORM_INDEX = { one: 0, few: 1, many: 2 };

    // The right text for a number. A dictionary can write it in two ways:
    //   with one key per form:  "quiz.points.one": "{n} point", "quiz.points.many": "{n} points"
    //                           (Russian also has ".few")
    //   or in one key:          "lab.dots": "dot|dots"   (Russian: "точка|точки|точек")
    // {n} is filled in with the number, written the local way (values can replace it).
    function plural(key, n, values) {
        const form = pluralForm(n);
        const forms = lookup(key);
        let text;
        if (typeof forms === "string" && forms.indexOf("|") !== -1) {
            const list = forms.split("|");
            text = list[Math.min(FORM_INDEX[form], list.length - 1)];
        } else {
            text = lookup(key + "." + form);
            if (text === undefined) text = lookup(key + ".many");
            if (text === undefined) text = lookup(key + ".one");
            if (text === undefined) return key;
        }
        return fill(text, Object.assign({ n: formatNumber(n) }, values));
    }

    // A translated piece of HTML that core re-translates by itself when the language changes:
    // i18nHTML("quiz.q.next", "qz-label") -> <span class="qz-label" data-i18n="quiz.q.next">Next question</span>
    function i18nHTML(key, className, tag) {
        tag = tag || "span";
        return "<" + tag + (className ? ' class="' + className + '"' : "") + ' data-i18n="' + key + '">' + t(key) + "</" + tag + ">";
    }

    // ----- Numbers and dates, written the local way -----
    const formatters = {};

    function formatter(kind, options) {
        const id = kind + state.lang + JSON.stringify(options);
        if (!formatters[id]) {
            formatters[id] = kind === "date"
                ? new Intl.DateTimeFormat(LOCALES[state.lang], options)
                : new Intl.NumberFormat(LOCALES[state.lang], options);
        }
        return formatters[id];
    }

    // 1280.5 -> "1,280.5" in English, "1 280,5" in Russian. Negative numbers get a real minus "−".
    // options (or just a number = the decimals):
    //   digits     exact number of decimals (otherwise up to maxDigits, which is 3)
    //   grouping   false: never "1,280"; "min2": only from 10,000 on
    //   compact    true: "1.2M" / "1,2 млн"
    //   minus      false: keep the plain "-"
    function formatNumber(value, options) {
        const settings = typeof options === "number" ? { digits: options } : (options || {});
        let number = Number(value);
        if (!isFinite(number)) return String(value);

        // Fast path: whole numbers below 1000 look the same in both languages ("−42"), and the
        // page's first Intl formatter is slow to make (about 45 ms on a slow phone)
        if (Number.isInteger(number) && Math.abs(number) < 1000 && !settings.compact && !settings.digits) {
            const text = String(number);
            return settings.minus === false ? text : text.replace("-", "−");
        }

        const intl = {};
        if (settings.compact) {
            intl.notation = "compact";
            intl.maximumFractionDigits = settings.digits === undefined ? 1 : settings.digits;
        } else if (settings.digits !== undefined) {
            intl.minimumFractionDigits = settings.digits;
            intl.maximumFractionDigits = settings.digits;
        } else {
            intl.maximumFractionDigits = settings.maxDigits === undefined ? 3 : settings.maxDigits;
        }
        // A number that rounds to zero must not show as "−0"
        if (Math.abs(number) < 0.5 * Math.pow(10, -intl.maximumFractionDigits)) number = 0;
        if (settings.grouping === false || (settings.grouping === "min2" && Math.abs(number) < 10000)) {
            intl.useGrouping = false;
        }

        const text = formatter("number", intl).format(number);
        return settings.minus === false ? text : text.replace("-", "−");
    }

    // 0.25 -> "25%". A small share above zero shows as "<1%" (small: false turns that off).
    function formatPercent(share, options) {
        const settings = options || {};
        if (settings.small !== false && share > 0 && share < 0.01) return "<1%";
        return formatNumber(share * 100, { digits: settings.digits || 0, grouping: false }) + "%";
    }

    // A date: "27 October 2026" / "27 октября 2026 г."
    function formatDate(date, options) {
        return formatter("date", options || { day: "numeric", month: "long", year: "numeric" }).format(date);
    }

    // ----- Translating the page -----
    // Puts a text into an element, but only touches the page when the text really
    // changes. The texts are our own and may contain simple HTML (like <strong>);
    // plain texts are compared and set as text, which is much faster than HTML.
    function setText(element, text) {
        if (text.indexOf("<") === -1 && text.indexOf("&") === -1) {
            if (element.firstElementChild || element.textContent !== text) element.textContent = text;
        } else if (element.innerHTML !== text) {
            element.innerHTML = text;
        }
    }

    // The text of a data-i18n element, with its {placeholders} filled in. With
    // data-i18n-plural="name" it is the plural form that suits the text value "name".
    function elementText(element, key) {
        const countName = element.getAttribute("data-i18n-plural");
        const count = countName ? Number(textValue(countName)) : NaN;
        if (isFinite(count)) {
            const forms = plural(key, count);
            if (forms !== key) return forms;
        }
        const text = lookup(key);
        return text === undefined ? undefined : fill(text);
    }

    // Updates every element with data-i18n="key" (its content)
    // and data-i18n-attr="aria-label:key,placeholder:key" (its attributes).
    function applyTranslations(scope) {
        scope = scope || document;

        scope.querySelectorAll("[data-i18n]").forEach(function (element) {
            const text = elementText(element, element.getAttribute("data-i18n"));
            if (text !== undefined) setText(element, text);
        });

        scope.querySelectorAll("[data-i18n-attr]").forEach(function (element) {
            element.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
                const parts = pair.split(":");
                if (parts.length !== 2) return;
                const name = parts[0].trim();
                const text = t(parts[1].trim());
                if (element.getAttribute(name) !== text) element.setAttribute(name, text);
            });
        });
    }

    function setLanguage(lang) {
        if (LANGUAGES.indexOf(lang) === -1) return;
        const changed = lang !== state.lang;
        state.lang = lang;
        storage.set("language", lang);
        // Writing the same value would still make the browser restyle the whole page
        if (root.lang !== lang) root.lang = lang;
        applyTranslations(document);

        // The browser tab title and the page description follow the language too
        document.title = t("core.pageTitle");
        const description = document.querySelector('meta[name="description"]');
        if (description) description.setAttribute("content", t("core.pageDescription"));

        const button = document.getElementById("language-toggle");
        if (button) button.textContent = lang === "en" ? "RU" : "EN";

        // Features redraw their texts. At start-up nothing changed, so nothing is sent:
        // every feature already drew itself in the saved language.
        if (changed) emit("language", { lang: lang });
    }

    /* =========================================================
       4. THEME
       ========================================================= */
    // The colour of the browser's address bar on phones. Both colours are
    // written once, on <meta name="theme-color" data-dark data-light> in index.html.
    function updateThemeMeta() {
        const meta = document.querySelector('meta[name="theme-color"]');
        const color = meta && meta.getAttribute("data-" + state.theme);
        if (color) meta.setAttribute("content", color);
    }

    function setTheme(theme) {
        if (theme !== "light" && theme !== "dark") return;
        const changed = theme !== state.theme;
        state.theme = theme;
        storage.set("theme", theme);
        if (changed && motionOK()) {
            // Only the page background fades to the new theme. The class "theme-switching"
            // (style.css) turns every other transition off while the browser works out the
            // new colours, or about a thousand buttons, links and cards would each fade.
            root.classList.add("theme-switching");
            root.setAttribute("data-theme", theme);
            void getComputedStyle(root).color;      // work out the new colours now
            root.classList.remove("theme-switching");
        } else {
            root.setAttribute("data-theme", theme);
        }
        updateThemeMeta();
        if (changed) emit("theme", { theme: theme });
    }

    /* =========================================================
       5. MOTION
       Animations run only when motion.ok(): the device does not ask
       for reduced motion AND calm mode (our own switch) is off.
       <html> gets the class "fx-calm" in calm mode and "fx-motion-off"
       whenever animations should stop, so the CSS can follow.
       ========================================================= */
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    storage.migrate("effects.calm", "motion.calm");   // the old name of the setting
    let calm = storage.get("motion.calm", false) === true;

    function motionOK() {
        return !calm && !reducedMotionQuery.matches;
    }

    function updateMotionClasses() {
        root.classList.toggle("fx-calm", calm);
        root.classList.toggle("fx-motion-off", !motionOK());
    }

    function motionChanged() {
        updateMotionClasses();
        emit("motion", { ok: motionOK(), calm: calm, reduced: reducedMotionQuery.matches });
    }

    function setCalm(value) {
        value = Boolean(value);
        if (value === calm) return;
        calm = value;
        storage.set("motion.calm", calm);
        motionChanged();
    }

    const motion = {
        ok: motionOK,
        get reduced() { return reducedMotionQuery.matches; },
        get calm() { return calm; },
        setCalm: setCalm,
        toggleCalm: function () {
            setCalm(!calm);
            return calm;
        },
        onChange: function (callback) { return on("motion", callback); },
        // The site's easing curve, for animations started from JavaScript
        get ease() { return cssVar("--ease"); }
    };

    // ----- Numbers that count up -----
    // countUp(element, from, to, duration, options) counts the number shown in "element"
    // from "from" to "to" in "duration" milliseconds: fast at first, then slowing down.
    //     A.countUp(scoreElement, 0, 120, 900);
    // On every animation frame it writes A.format.number(Math.round(value)). Options:
    //     format(value)    returns the text to show instead (decimals, a "%" sign...)
    //     ease(progress)   another curve from 0..1 to 0..1 (default A.util.easeOut)
    //     done()           runs once, when the number has arrived
    // With animations off (A.motion.ok() is false, or turns false meanwhile) the end
    // value is written at once. A new count-up on the same element replaces the running
    // one. When the element has left the page, the count-up ends by itself.
    // Returns { finish(), stop(), value }:
    //     finish()   jumps to the end value and runs done (if it hasn't run yet)
    //     stop()     stops where it is, without done
    //     value      the number it has reached so far (not rounded)
    const runningCounts = new Map();     // element -> its count-up

    function countUp(element, from, to, duration, options) {
        const settings = options || {};
        const format = settings.format || function (value) { return formatNumber(Math.round(value)); };
        const ease = settings.ease || util.easeOut;
        const start = performance.now();
        let frame = 0;
        let ended = false;

        const counter = {
            value: from,
            finish: function () {
                if (ended) return;
                stop();
                write(to);
                if (settings.done) settings.done();
            },
            stop: stop
        };

        function write(value) {
            counter.value = value;
            const text = format(value);
            // Only a real change is written: the page then has nothing new to lay out
            if (element.textContent !== text) element.textContent = text;
        }

        function stop() {
            ended = true;
            cancelAnimationFrame(frame);
            if (runningCounts.get(element) === counter) runningCounts.delete(element);
        }

        function step(now) {
            // (the frame's time can be a hair earlier than "start": progress stays at 0 then)
            const progress = util.clamp((now - start) / duration, 0, 1);
            if (progress >= 1 || !element.isConnected) {
                counter.finish();
                return;
            }
            write(util.lerp(from, to, ease(progress)));
            frame = requestAnimationFrame(step);
        }

        const previous = runningCounts.get(element);
        if (previous) previous.stop();

        if (!motionOK() || !(duration > 0) || from === to) {
            counter.finish();
        } else {
            runningCounts.set(element, counter);
            frame = requestAnimationFrame(step);
        }
        return counter;
    }

    // Animations switched off (calm mode): every number that is counting jumps to its end
    on("motion", function (detail) {
        if (!detail.ok) runningCounts.forEach(function (counter) { counter.finish(); });
    });

    /* =========================================================
       6. HELPERS
       ========================================================= */
    const util = {
        clamp: function (value, min, max) {
            return Math.max(min, Math.min(max, value));
        },

        lerp: function (from, to, amount) {
            return from + (to - from) * amount;
        },

        // An animation curve: fast at first, then gently slowing down (a cubic "ease-out").
        // progress 0..1 -> 0..1: easeOut(0) = 0, easeOut(0.5) = 0.875, easeOut(1) = 1
        // Example: lerp(from, to, easeOut(progress)) moves a value from "from" to "to".
        easeOut: function (progress) {
            const p = util.clamp(progress, 0, 1);
            return 1 - Math.pow(1 - p, 3);
        },

        // A number from min up to max, with decimals (max itself never comes out).
        // Example: random(0.62, 0.92) -> 0.7731...   For whole numbers use randomInt.
        random: function (min, max) {
            return min + Math.random() * (max - min);
        },

        // A whole number from min to max (both included)
        randomInt: function (min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        },

        pick: function (list) {
            return list[Math.floor(Math.random() * list.length)];
        },

        // A shuffled copy of a list (the Fisher–Yates shuffle)
        shuffle: function (list) {
            const copy = list.slice();
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = copy[i];
                copy[i] = copy[j];
                copy[j] = temp;
            }
            return copy;
        },

        // A random position in a list of weights: [1, 3] returns 1 three times as often as 0
        sampleWeighted: function (weights) {
            let total = 0;
            weights.forEach(function (weight) { total += Math.max(0, weight); });
            let roll = Math.random() * total;
            let last = 0;
            for (let i = 0; i < weights.length; i++) {
                if (weights[i] <= 0) continue;
                last = i;
                roll -= weights[i];
                if (roll <= 0) return i;
            }
            return last;
        },

        // Runs a function once things have been quiet for "wait" milliseconds
        debounce: function (callback, wait) {
            let timer = 0;
            return function () {
                const self = this;
                const args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () { callback.apply(self, args); }, wait);
            };
        },

        // Runs a function at most once per screen frame
        frameThrottle: function (callback) {
            let queued = false;
            return function () {
                if (queued) return;
                queued = true;
                requestAnimationFrame(function () {
                    queued = false;
                    callback();
                });
            };
        }
    };

    // The browser's computed styles are read through one live object, so
    // features that read many variables in a row don't ask for a new one each time.
    let computedRoot = null;

    function cssVar(name) {
        if (!computedRoot) computedRoot = getComputedStyle(root);
        return computedRoot.getPropertyValue(name).trim();
    }

    function escapeHTML(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // ----- Page elements -----
    const FOCUSABLE = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, ' +
        'iframe, summary, [contenteditable="true"], [tabindex]';

    const dom = {
        // Everything inside a container that the Tab key can reach, in page order
        focusable: function (container) {
            if (!container) return [];
            return Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), function (element) {
                return !element.disabled && element.getAttribute("tabindex") !== "-1" &&
                    !element.closest("[hidden], [inert]") && element.getClientRects().length > 0;
            });
        },

        // Puts the keyboard focus on a section's heading, so the next Tab continues from there
        focusHeading: function (section) {
            const target = typeof section === "string" ? document.getElementById(section) : section;
            const heading = target && target.querySelector("h1, h2");
            if (!heading) return false;
            if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
            heading.focus({ preventScroll: true });
            return true;
        },

        // Browsers try to keep what you are looking at in place when content above it
        // changes ("scroll anchoring"). That would fight our own scrolling, so it is
        // switched off for a moment while content appears and disappears.
        pauseScrollAnchoring: function () {
            root.style.overflowAnchor = "none";
            requestAnimationFrame(function () {
                requestAnimationFrame(function () { root.style.overflowAnchor = ""; });
            });
        },

        // Plays a CSS animation (added with a class) again from the start
        replay: function (element, className) {
            if (!element) return;
            element.classList.remove(className);
            void element.offsetWidth;
            element.classList.add(className);
        },

        // Turns an HTML string into an element
        fromHTML: function (html) {
            const box = document.createElement("div");
            box.innerHTML = String(html).trim();
            return box.firstElementChild;
        }
    };

    // ----- Buttons that need a second press -----
    // For a button that loses something ("Reset progress", "Quit"): the first press only
    // arms it (the feature shows "Sure?"), a second press within a few seconds confirms.
    // The second click of a double-click (or double tap) and a held-down Enter key are not
    // a second press, so nothing is lost by accident.
    //   const reset = A.confirmPress(button, {
    //       onArm: function () { paint(); A.announce(t("lessons.hud.resetAsk")); },
    //       onDisarm: paint,             // after the wait, after disarm(), and just before onConfirm
    //       onConfirm: resetProgress,
    //       enabled: function () { return !busy; },   // optional: presses are ignored while false
    //       timeout: 4000                // optional: how long it stays armed (ms)
    //   });
    //   reset.armed      true between the two presses (paint the button from it)
    //   reset.disarm()   back to the first state, e.g. when the screen changes
    // A button that has left the page gets no more calls.
    const CONFIRM_TIME = 4000;

    function confirmPress(button, options) {
        const settings = options || {};
        let armed = false;
        let timer = 0;

        function disarm() {
            clearTimeout(timer);
            if (!armed) return;
            armed = false;
            if (settings.onDisarm && button.isConnected) settings.onDisarm();
        }

        button.addEventListener("click", function (event) {
            if (settings.enabled && !settings.enabled()) return;
            if (!armed) {
                armed = true;
                timer = setTimeout(disarm, settings.timeout || CONFIRM_TIME);
                if (settings.onArm) settings.onArm(event);
                return;
            }
            if (event.detail > 1) return;   // the second click of a double-click
            disarm();
            if (settings.onConfirm) settings.onConfirm(event);
        });

        // Holding Enter down repeats the click: only a new press counts
        button.addEventListener("keydown", function (event) {
            if (event.repeat && event.key === "Enter") event.preventDefault();
        });

        return {
            get armed() { return armed; },
            disarm: disarm
        };
    }

    // ----- Colours (for canvas drawings, which can't use CSS variables directly) -----
    // "#9b6dff", "155, 109, 255" or "rgb(155, 109, 255)" -> [155, 109, 255]
    function parseColor(value) {
        value = String(value || "").trim();
        let match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
        if (match) {
            let hex = match[1];
            if (hex.length === 3) hex = hex.replace(/./g, "$&$&");
            return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
        }
        match = /(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/.exec(value);
        return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
    }

    const colorCache = {};

    const colors = {
        parse: parseColor,

        // The colour of a CSS variable in the current theme, as [r, g, b]
        rgb: function (name, fallback) {
            const id = state.theme + name;
            if (!(id in colorCache)) colorCache[id] = parseColor(cssVar(name));
            return colorCache[id] || fallback || [0, 0, 0];
        },

        rgba: function (color, alpha) {
            return "rgba(" + Math.round(color[0]) + "," + Math.round(color[1]) + "," + Math.round(color[2]) + "," + alpha + ")";
        },

        // Mixes two [r, g, b] colours: amount 0 gives a, 1 gives b, 0.5 the colour halfway.
        // Returns a new [r, g, b] of whole numbers.
        // Example: mix([0, 0, 0], [255, 255, 255], 0.5) -> [128, 128, 128]
        mix: function (a, b, amount) {
            return [0, 1, 2].map(function (i) { return Math.round(util.lerp(a[i], b[i], amount)); });
        }
    };

    // ----- Canvas -----
    const canvas = {
        // Sharp on retina screens, but never more than 2x (faster)
        pixelRatio: function (max) {
            return Math.min(max || 2, window.devicePixelRatio || 1);
        },

        // Sizes a canvas for its size on the page (in CSS pixels), clears it,
        // and returns its 2D context, already scaled: draw in CSS pixels.
        fit: function (element, width, height, options) {
            const ratio = canvas.pixelRatio(options && options.maxRatio);
            element.width = Math.round(width * ratio);
            element.height = Math.round(height * ratio);
            const context = element.getContext("2d");
            if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
            return context;
        },

        // A rectangle with rounded corners (as a path: fill or stroke it afterwards)
        roundRect: function (context, x, y, width, height, radius) {
            const r = Math.max(0, Math.min(radius, width / 2, height / 2));
            context.beginPath();
            context.moveTo(x + r, y);
            context.arcTo(x + width, y, x + width, y + height, r);
            context.arcTo(x + width, y + height, x, y + height, r);
            context.arcTo(x, y + height, x, y, r);
            context.arcTo(x, y, x + width, y, r);
            context.closePath();
        }
    };

    /* =========================================================
       7. SCREEN: MEDIA QUERIES, VISIBILITY, RESIZING, PIXEL RATIO, LAYOUT
       ========================================================= */
    // Screen widths where the layout changes (the same numbers as in the CSS files)
    const breakpoints = { phone: 640, menu: 960, wide: 1360 };

    // Media queries that several files use
    const queries = {
        reducedMotion: "(prefers-reduced-motion: reduce)",
        finePointer: "(hover: hover) and (pointer: fine)",
        phone: "(max-width: " + breakpoints.phone + "px)",
        wideMenu: "(min-width: " + (breakpoints.menu + 1) + "px)"
    };

    const mediaLists = {};

    // One shared MediaQueryList per query
    function media(query) {
        if (!mediaLists[query]) mediaLists[query] = window.matchMedia(query);
        return mediaLists[query];
    }

    function listenMedia(list, listener) {
        if (list.addEventListener) list.addEventListener("change", listener);
        else if (list.addListener) list.addListener(listener);
    }

    // Calls callback(matches) now and whenever the query starts or stops matching.
    // { immediate: false } skips the first call. Returns a function that stops listening.
    function onMedia(query, callback, options) {
        const list = typeof query === "string" ? media(query) : query;
        const listener = function () { callback(list.matches); };
        listenMedia(list, listener);
        if (!options || options.immediate !== false) callback(list.matches);
        return function () {
            if (list.removeEventListener) list.removeEventListener("change", listener);
            else if (list.removeListener) list.removeListener(listener);
        };
    }

    listenMedia(reducedMotionQuery, motionChanged);

    // ----- Is it on screen? -----
    // whenVisible(element, callback) calls callback(true / false) once at the start and
    // whenever the element comes on or goes off screen, or the browser tab is hidden.
    // { pauseAnimations: true } also sets data-paused on the element while it can't be
    // seen: one CSS rule then pauses its animations. Returns a function that stops watching.
    const visibilityObservers = {};
    const visibilityWatchers = new Set();
    const hasIntersectionObserver = "IntersectionObserver" in window;

    function updateWatcher(watcher) {
        const visible = watcher.intersecting && !document.hidden;
        if (visible === watcher.visible) return;
        watcher.visible = visible;
        if (watcher.pause) watcher.element.toggleAttribute("data-paused", !visible);
        safeCall(watcher.callback, visible);
    }

    function visibilityObserver(rootMargin, threshold) {
        const id = rootMargin + "|" + threshold;
        if (!visibilityObservers[id]) {
            visibilityObservers[id] = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    visibilityWatchers.forEach(function (watcher) {
                        if (watcher.element !== entry.target || watcher.observerId !== id) return;
                        watcher.intersecting = entry.isIntersecting;
                        updateWatcher(watcher);
                    });
                });
            }, { rootMargin: rootMargin, threshold: threshold });
            visibilityObservers[id].id = id;
        }
        return visibilityObservers[id];
    }

    // The other watchers of the same element (with the same observer, if one is given)
    function otherWatchers(watcher, observerId) {
        return Array.from(visibilityWatchers).filter(function (other) {
            return other !== watcher && other.element === watcher.element &&
                (observerId === undefined || other.observerId === observerId);
        });
    }

    function whenVisible(element, callback, options) {
        const settings = options || {};
        const watcher = {
            element: element,
            callback: callback,
            pause: Boolean(settings.pauseAnimations),
            intersecting: true,
            visible: null,
            observerId: null
        };
        visibilityWatchers.add(watcher);

        if (hasIntersectionObserver) {
            const observer = visibilityObserver(settings.rootMargin || "0px", settings.threshold || 0);
            watcher.observerId = observer.id;
            watcher.observer = observer;
            // The observer reports the first state by itself, but only for an element it
            // doesn't watch yet. For one it already watches, starting again makes it report
            // once more (the other watchers get the same state, so nothing changes for them).
            if (otherWatchers(watcher, observer.id).length) observer.unobserve(element);
            observer.observe(element);
        } else {
            updateWatcher(watcher);          // old browsers: always "on screen"
        }

        return function () {
            visibilityWatchers.delete(watcher);
            const others = otherWatchers(watcher);
            if (watcher.pause) {
                // Another watcher that pauses this element decides from now on
                const pauser = others.find(function (other) { return other.pause && other.visible !== null; });
                element.toggleAttribute("data-paused", Boolean(pauser && !pauser.visible));
            }
            const stillWatched = others.some(function (other) { return other.observerId === watcher.observerId; });
            if (watcher.observer && !stillWatched) watcher.observer.unobserve(element);
        };
    }

    document.addEventListener("visibilitychange", function () {
        visibilityWatchers.forEach(updateWatcher);
    });

    // ----- Resizing -----
    // onResize(callback) calls callback once per frame after the window changed size.
    // { viewport: true } also follows the visible part of the screen on phones
    // (pinch zoom, the on-screen keyboard). Returns a function that stops listening.
    const resizeCallbacks = new Set();
    const viewportCallbacks = new Set();
    let resizeQueued = false;
    let viewportChanged = false;

    function runResize() {
        resizeQueued = false;
        const withViewport = viewportChanged;
        viewportChanged = false;
        resizeCallbacks.forEach(function (callback) { safeCall(callback); });
        if (withViewport) viewportCallbacks.forEach(function (callback) { safeCall(callback); });
    }

    function queueResize(fromViewport) {
        if (fromViewport === true) viewportChanged = true;
        if (resizeQueued) return;
        resizeQueued = true;
        requestAnimationFrame(runResize);
    }

    window.addEventListener("resize", function () { queueResize(true); }, { passive: true });
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", function () { queueResize(true); });
        window.visualViewport.addEventListener("scroll", function () {
            viewportChanged = true;
            if (viewportCallbacks.size) queueResize(true);
        });
    }

    function onResize(callback, options) {
        const set = options && options.viewport ? viewportCallbacks : resizeCallbacks;
        set.add(callback);
        return function () { set.delete(callback); };
    }

    // ----- Sharper (or less sharp) pixels -----
    // onPixelRatioChange(callback) calls callback(ratio) when the device pixel ratio changes
    // while the window keeps its size: the window moved to a retina screen, or the browser
    // zoom changed. A canvas then needs a new backing size, but no resize event comes.
    // A media query for the current ratio tells us; it is made again for each new ratio.
    //     A.onPixelRatioChange(function (ratio) { fitCanvases(); });
    // Returns a function that stops listening.
    const ratioCallbacks = new Set();
    let stopRatioQuery = null;

    function watchPixelRatio() {
        stopRatioQuery = onMedia("(resolution: " + (window.devicePixelRatio || 1) + "dppx)", function () {
            stopRatioQuery();
            watchPixelRatio();
            const ratio = window.devicePixelRatio || 1;
            ratioCallbacks.forEach(function (callback) { safeCall(callback, ratio); });
        }, { immediate: false });
    }

    function onPixelRatioChange(callback) {
        ratioCallbacks.add(callback);
        if (!stopRatioQuery) watchPixelRatio();
        return function () {
            ratioCallbacks.delete(callback);
            if (ratioCallbacks.size || !stopRatioQuery) return;
            stopRatioQuery();
            stopRatioQuery = null;
        };
    }

    // ----- Sizes from the CSS -----
    const layout = {
        // A CSS length variable as a number of pixels: px("--nav-height", 76) -> 76
        px: function (name, fallback) {
            const value = parseFloat(cssVar(name));
            return isFinite(value) ? value : fallback;
        },

        // Height of the menu bar at the top
        navHeight: function () {
            return layout.px("--nav-height", 76);
        }
    };

    /* =========================================================
       8. MESSAGES FOR SCREEN READERS
       announce("3 results") — screen readers read text put into a "live" element.
       A new message replaces one that is still waiting, and the same text
       twice is read twice. { region } uses a feature's own live element,
       { politeness: "assertive" } interrupts what is being read.
       ========================================================= */
    const liveRegions = {};
    const announceTimers = new WeakMap();

    function liveRegion(politeness) {
        if (!liveRegions[politeness]) {
            const region = document.createElement("div");
            region.className = "sr-only";
            region.setAttribute("aria-live", politeness);
            region.setAttribute("aria-atomic", "true");
            region.setAttribute("data-overlay-keep", "");
            document.body.appendChild(region);
            liveRegions[politeness] = region;
        }
        return liveRegions[politeness];
    }

    function announce(text, options) {
        const settings = options || {};
        const region = settings.region || liveRegion(settings.politeness === "assertive" ? "assertive" : "polite");
        clearTimeout(announceTimers.get(region));
        region.textContent = "";
        announceTimers.set(region, setTimeout(function () {
            region.textContent = text;
        }, settings.delay === undefined ? 80 : settings.delay));
    }

    /* =========================================================
       9. OVERLAYS (pop-up windows)
       Every window that opens above the page (the lesson reader, the command
       palette, the chat, the phone menu) registers here once. Then core does,
       for all of them in one place:
       - "modal" windows stop the page from scrolling and make everything else
         unreachable (inert), so the keyboard and screen readers stay inside;
         <body> then gets --scrollbar-gap, the width of the scrollbar that went
         away, so bars with position: fixed can keep their place (style.css .navbar);
       - Tab goes round inside the top modal window;
       - Esc closes the window on top (only that one);
       - A.navigate() and palette commands close the windows in the way first.

       A feature opens and closes its window itself and reports it:
           const overlay = A.overlays.register("palette", {
               element: dialogElement,           // the window (or a function returning it)
               close: function (reason) { ... }  // closes it; reason: "escape", "navigate", "command"...
           });
           overlay.opened();   // right after it opened
           overlay.closed();   // as soon as it starts closing (the animation may go on)

       Call opened() BEFORE moving the focus into the window, and closed() BEFORE
       giving the focus back: until then the other side is inert and can't take it.

       Options (each may also be a function, read again on every change):
           modal            true (default): lock scrolling, make the rest inert, trap Tab
           root             the element that stays reachable (default: element). Give the
                            whole widget when the window has parts next to it, like a
                            backdrop you can click or the button that opens it
           closeOnNavigate  close it when the page goes to another section (default: modal)
           escape           "anywhere" (default for modal), "inside" (only while the focus
                            is in root: default for the rest) or false
           scope            elements that count as "inside" instead of root
           lockScroll, inert, trapFocus   switch one part of "modal" on or off
           focusables       function returning the elements Tab goes round
                            (default: the ones in element)
           holdFocus        function called when the focus lands outside the top window
       ========================================================= */
    const overlayRecords = {};
    const overlayStack = [];                 // open windows, the top one last
    const inertByOverlays = new Set();
    let lockedBodyStyle = null;
    let lastOverlayState = "";

    function overlayValue(record, name, fallback) {
        let value = record.options[name];
        if (typeof value === "function") value = value();
        return value === undefined ? fallback : value;
    }

    function overlayElement(record) {
        return overlayValue(record, "element", null);
    }

    function overlayRoot(record) {
        return overlayValue(record, "root", null) || overlayElement(record);
    }

    function isModal(record) {
        return overlayValue(record, "modal", true) !== false;
    }

    function insideOverlay(record, node) {
        if (!node || !node.nodeType) return false;
        const scope = [].concat(overlayValue(record, "scope", null) || overlayRoot(record));
        return scope.some(function (element) { return Boolean(element) && element.contains(node); });
    }

    // The page behind a modal window must not scroll. The scrollbar's room is kept,
    // so the page doesn't jump sideways. Fixed bars (like the menu bar) are outside
    // the body's padding: they keep their place with the CSS variable --scrollbar-gap.
    function lockScroll(lock) {
        const body = document.body;
        if (lock && !lockedBodyStyle) {
            const gap = window.innerWidth - root.clientWidth;
            lockedBodyStyle = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
            body.style.overflow = "hidden";
            if (gap > 0) {
                body.style.paddingRight = gap + "px";
                body.style.setProperty("--scrollbar-gap", gap + "px");
            }
        } else if (!lock && lockedBodyStyle) {
            body.style.overflow = lockedBodyStyle.overflow;
            body.style.paddingRight = lockedBodyStyle.paddingRight;
            body.style.removeProperty("--scrollbar-gap");
            lockedBodyStyle = null;
        }
    }

    // Some elements must stay reachable under any window: toasts and screen-reader
    // messages (data-overlay-keep), and of course the windows themselves
    function staysActive(element, keep) {
        if (element.hasAttribute("data-overlay-keep") || /^(SCRIPT|STYLE|LINK|TEMPLATE|NOSCRIPT)$/.test(element.tagName)) return true;
        return keep.some(function (item) { return element === item || element.contains(item); });
    }

    // Makes everything inert except the windows in "keep" (and their parents).
    // Only takes inert away from elements that got it here.
    function updateInert(keep) {
        const next = new Set();
        keep.forEach(function (element) {
            for (let node = element; node.parentElement && node !== document.body; node = node.parentElement) {
                Array.prototype.forEach.call(node.parentElement.children, function (sibling) {
                    if (!staysActive(sibling, keep)) next.add(sibling);
                });
            }
        });
        inertByOverlays.forEach(function (element) {
            if (next.has(element)) return;
            element.inert = false;
            inertByOverlays.delete(element);
        });
        next.forEach(function (element) {
            if (element.inert) return;
            element.inert = true;
            inertByOverlays.add(element);
        });
    }

    function applyOverlays() {
        lockScroll(overlayStack.some(function (record) {
            return overlayValue(record, "lockScroll", isModal(record));
        }));

        // The top window that shuts out the page, and every window above it, stay usable
        const keep = [];
        let isolate = false;
        for (let i = overlayStack.length - 1; i >= 0 && !isolate; i--) {
            const record = overlayStack[i];
            const element = overlayRoot(record);
            if (element) keep.push(element);
            isolate = overlayValue(record, "inert", isModal(record));
        }
        updateInert(isolate ? keep : []);

        const detail = {
            top: overlays.top(),
            modal: overlays.hasModal(),
            open: overlayStack.map(function (record) { return record.id; })
        };
        const signature = JSON.stringify(detail);
        if (signature !== lastOverlayState) {
            lastOverlayState = signature;
            emit("overlay", detail);
        }
    }

    function overlayOpened(id) {
        const record = overlayRecords[id];
        if (!record) return;
        const index = overlayStack.indexOf(record);
        if (index !== -1) overlayStack.splice(index, 1);
        overlayStack.push(record);
        applyOverlays();
    }

    function overlayClosed(id) {
        const record = overlayRecords[id];
        const index = overlayStack.indexOf(record);
        if (index === -1) return;
        overlayStack.splice(index, 1);
        applyOverlays();
    }

    function closeOverlay(id, reason) {
        const record = overlayRecords[id];
        if (!record || overlayStack.indexOf(record) === -1) return false;
        try {
            record.options.close(reason || "close");
        } catch (error) {
            report(error);
        }
        // A window that forgot to report back is still taken off the stack,
        // so the page never stays locked
        overlayClosed(id);
        return true;
    }

    // Closes open windows, top first. options:
    //   except      an id or a list of ids to keep open
    //   navigating  true: only windows with closeOnNavigate
    //   reason      passed to each window's close()
    function closeAll(options) {
        const settings = options || {};
        const keep = [].concat(settings.except || []);
        let count = 0;
        overlayStack.slice().reverse().forEach(function (record) {
            if (keep.indexOf(record.id) !== -1) return;
            if (settings.navigating && !overlayValue(record, "closeOnNavigate", isModal(record))) return;
            if (closeOverlay(record.id, settings.reason || "close")) count++;
        });
        return count;
    }

    function register(id, options) {
        const record = { id: id, options: Object.assign({}, options) };
        overlayRecords[id] = record;
        return {
            id: id,
            opened: function () { overlayOpened(id); },
            closed: function () { overlayClosed(id); },
            close: function (reason) { return closeOverlay(id, reason); },
            // Changes options, or just re-reads them (e.g. after "modal" changed)
            update: function (changes) {
                if (changes) Object.assign(record.options, changes);
                if (overlayStack.indexOf(record) !== -1) applyOverlays();
            },
            get isOpen() { return overlayStack.indexOf(record) !== -1; }
        };
    }

    const overlays = {
        register: register,
        opened: overlayOpened,
        closed: overlayClosed,
        close: closeOverlay,
        closeAll: closeAll,
        update: function () { applyOverlays(); },
        isOpen: function (id) { return overlayStack.indexOf(overlayRecords[id]) !== -1; },
        // The id of the window on top, or null
        top: function () {
            return overlayStack.length ? overlayStack[overlayStack.length - 1].id : null;
        },
        // Is a modal window open (one that shuts out the page)?
        hasModal: function () { return overlayStack.some(isModal); },
        onChange: function (callback) { return on("overlay", callback); }
    };

    // ----- Keys: Esc closes the top window, Tab stays inside a modal one -----
    function onOverlayEscape(event) {
        for (let i = overlayStack.length - 1; i >= 0; i--) {
            const record = overlayStack[i];
            const mode = overlayValue(record, "escape", isModal(record) ? "anywhere" : "inside");
            if (mode === "anywhere" || (mode === "inside" && insideOverlay(record, event.target))) {
                event.preventDefault();
                event.stopPropagation();
                closeOverlay(record.id, "escape");
                return;
            }
            if (isModal(record)) return;      // nothing below a modal window gets the key
        }
    }

    function onOverlayTab(event) {
        const record = overlayStack[overlayStack.length - 1];
        if (!record || !overlayValue(record, "trapFocus", isModal(record))) return;
        const element = overlayElement(record);
        if (!element) return;
        const custom = record.options.focusables;
        const items = (typeof custom === "function" ? custom() : dom.focusable(element)).filter(Boolean);
        if (!items.length) return;

        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (!element.contains(active)) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }

    document.addEventListener("keydown", function (event) {
        if (!overlayStack.length || event.defaultPrevented || event.isComposing) return;
        if (event.key === "Escape" || event.key === "Esc") onOverlayEscape(event);
        else if (event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey) onOverlayTab(event);
    }, true);

    // If the focus somehow lands outside the top window, that window can take it back
    document.addEventListener("focusin", function (event) {
        const record = overlayStack[overlayStack.length - 1];
        if (!record || typeof record.options.holdFocus !== "function") return;
        if (insideOverlay(record, event.target)) return;
        record.options.holdFocus(event);
    });

    /* =========================================================
       10. NAVIGATION: SECTIONS, A.navigate, SCROLLING, PARTS BUILT WHEN NEEDED,
           AND THE MENU BAR
       ========================================================= */
    // The sections of the page, in order: their id, the name (a translation key) and an icon
    const SECTIONS = [
        { id: "home", key: "cmd.home", icon: "🏠" },
        { id: "lessons", key: "nav.lessons", icon: "📚" },
        { id: "lab", key: "nav.lab", icon: "🧪" },
        { id: "quiz", key: "nav.quiz", icon: "🏆" },
        { id: "glossary", key: "nav.glossary", icon: "📖" },
        { id: "timeline", key: "nav.timeline", icon: "🕰️" },
        { id: "about", key: "nav.about", icon: "💡" }
    ].map(Object.freeze);
    Object.freeze(SECTIONS);

    // Goes to a section: closes the windows in the way, scrolls there (smoothly
    // when animations are on) and moves the keyboard focus to its heading, so the
    // next Tab continues from there. options:
    //   focus: false          leave the focus alone (the caller moves it)
    //   keepOverlays: true    leave the windows open (or a list of ids to keep)
    //   block: "center"       where the section ends up (default: at the top)
    function navigate(id, options) {
        const settings = options || {};
        const target = document.getElementById(id);
        if (!target) return false;
        if (settings.keepOverlays !== true) {
            closeAll({ reason: "navigate", navigating: true, except: settings.keepOverlays });
        }
        buildParts(target);
        target.scrollIntoView({ behavior: motionOK() ? "smooth" : "auto", block: settings.block || "start" });
        if (settings.focus !== false) dom.focusHeading(target);
        return true;
    }

    // ----- Scrolling: one pipeline for the whole page -----
    // Everything that follows the scroll position runs in ONE animation frame, in two steps:
    // 1. onLayout(measure): only after the page changed size (resize, fonts, content
    //    appearing). Read positions here (getBoundingClientRect) and keep them.
    // 2. onScroll(update): every frame the page scrolls. Only write here, using the
    //    numbers it gets and the positions kept in step 1: reading the page here
    //    would make the browser lay it out again in every frame.
    // update(info) gets:
    //   y, viewport, max   the scroll position, the window height, the biggest scroll position
    //   progress           0..1, how far down the page you are
    //   atBottom           true at the very end of the page
    //   section, index     the current section: the last one whose top passed the
    //                      "reading line" 40% down the screen (the last one at the bottom)
    //   fill               0..1, how far along the sections you are (between two of them too)
    // onSection(callback) only runs when the current section changes: callback({ id, index }).
    const READING_LINE = 0.4;
    const scrolling = {
        queued: false,
        layoutDirty: true,
        y: 0,
        viewport: 0,
        max: 0,
        sections: [],               // { id, element, top } with top = position on the page
        info: null,
        layoutCallbacks: new Set(),
        scrollCallbacks: new Set(),
        navbar: null,
        links: []
    };

    function queueScrollFrame() {
        if (scrolling.queued) return;
        scrolling.queued = true;
        requestAnimationFrame(scrollFrame);
    }

    // The page may have changed size: measure again in the next frame
    function layoutChanged() {
        scrolling.layoutDirty = true;
        queueScrollFrame();
    }

    function measureLayout() {
        scrolling.layoutDirty = false;
        const y = window.scrollY;
        scrolling.y = y;
        scrolling.viewport = window.innerHeight;
        scrolling.max = Math.max(0, root.scrollHeight - scrolling.viewport);
        scrolling.sections.forEach(function (section) {
            section.top = section.element.getBoundingClientRect().top + y;
        });
        scrolling.layoutCallbacks.forEach(function (callback) { safeCall(callback); });
    }

    function scrollFrame() {
        scrolling.queued = false;
        if (scrolling.layoutDirty) measureLayout();

        const y = scrolling.y;
        const max = scrolling.max;
        const atBottom = max - y < 4;
        if (scrolling.navbar) scrolling.navbar.classList.toggle("scrolled", y > 10);

        const sections = scrolling.sections;
        let index = 0;
        let fill = 1;
        if (sections.length) {
            const line = y + scrolling.viewport * READING_LINE;
            sections.forEach(function (section, i) {
                if (section.top <= line) index = i;
            });
            if (atBottom) {
                index = sections.length - 1;
            } else if (sections.length > 1) {
                const next = sections[index + 1];
                const part = next ? util.clamp((line - sections[index].top) / Math.max(1, next.top - sections[index].top), 0, 1) : 0;
                fill = (index + part) / (sections.length - 1);
            }
        }

        const previous = scrolling.info;
        const info = {
            y: y,
            viewport: scrolling.viewport,
            max: max,
            progress: max > 0 ? util.clamp(y / max, 0, 1) : 0,
            atBottom: atBottom,
            section: sections.length ? sections[index].id : null,
            index: index,
            fill: util.clamp(fill, 0, 1)
        };
        scrolling.info = info;

        if (!previous || previous.section !== info.section) {
            scrolling.links.forEach(function (link) {
                link.classList.toggle("active", link.getAttribute("href") === "#" + info.section);
            });
            if (info.section) emit("section", { id: info.section, index: index });
        }
        scrolling.scrollCallbacks.forEach(function (callback) { safeCall(callback, info); });
    }

    function startScrolling() {
        scrolling.sections = SECTIONS.map(function (section) {
            return { id: section.id, element: document.getElementById(section.id), top: 0 };
        }).filter(function (section) { return section.element; });
        scrolling.navbar = document.getElementById("navbar");
        const navLinks = document.getElementById("nav-links");
        scrolling.links = navLinks ? Array.prototype.slice.call(navLinks.querySelectorAll("a")) : [];

        window.addEventListener("scroll", function () {
            // Read here, before anything is drawn: the page is laid out already
            scrolling.y = window.scrollY;
            queueScrollFrame();
        }, { passive: true });
        resizeCallbacks.add(layoutChanged);
        if ("ResizeObserver" in window) {
            new ResizeObserver(layoutChanged).observe(document.body);   // the page got taller or shorter
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutChanged);
        window.addEventListener("load", layoutChanged);
        // The first frame measures everything
        layoutChanged();
    }

    function onLayout(callback) {
        scrolling.layoutCallbacks.add(callback);
        layoutChanged();
        return function () { scrolling.layoutCallbacks.delete(callback); };
    }

    function onScroll(callback) {
        scrolling.scrollCallbacks.add(callback);
        if (scrolling.info) queueScrollFrame();
        return function () { scrolling.scrollCallbacks.delete(callback); };
    }

    function onSection(callback) {
        return on("section", callback);
    }

    // ----- Building a part of the page only when it is needed -----
    // Parts far down the page are built when they come near the screen, or when the
    // browser has a quiet moment after the page loaded, or when ensure() is called
    // (whichever comes first). Returns ensure(): call it before anything that needs
    // the part to be built (a command, a link to it...). options:
    //   eager: true     build right away
    //   margin          how close counts as "near" (default: one and a half screens)
    // Everything is built at once when the address points inside the page (#lab,
    // #term-bias...), and the parts above a section are built before jumping to it,
    // so the browser scrolls to the right place.
    let pageLoaded = document.readyState === "complete";
    const afterLoad = [];
    const waitingParts = new Set();     // { element, ensure } of the parts not built yet

    window.addEventListener("load", function () {
        pageLoaded = true;
        afterLoad.splice(0).forEach(function (callback) { callback(); });
    });

    function whenIdle(callback) {
        const start = function () {
            if (window.requestIdleCallback) window.requestIdleCallback(callback, { timeout: 2500 });
            else setTimeout(callback, 300);
        };
        if (pageLoaded) start();
        else afterLoad.push(start);
    }

    function whenNeeded(element, init, options) {
        const settings = options || {};
        let done = false;
        let observer = null;
        const part = { element: element, ensure: ensure };

        function ensure() {
            if (done) return;
            done = true;
            waitingParts.delete(part);
            if (observer) observer.disconnect();
            init();
            layoutChanged();
        }

        if (settings.eager || !element || !hasIntersectionObserver || location.hash.length > 1) {
            ensure();
            return ensure;
        }
        waitingParts.add(part);
        observer = new IntersectionObserver(function (entries) {
            if (entries.some(function (entry) { return entry.isIntersecting; })) ensure();
        }, { rootMargin: (settings.margin || "150%") + " 0px" });
        observer.observe(element);
        whenIdle(ensure);
        return ensure;
    }

    // Builds the parts that are still waiting: all of them, or only the ones above
    // "target" and inside it (enough to know where target is on the page)
    function buildParts(target) {
        waitingParts.forEach(function (part) {
            const element = part.element;
            if (!target || target === element || target.contains(element) ||
                (element.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)) {
                part.ensure();
            }
        });
    }

    // A link to a place on the page (#timeline, #term-bias): build what comes before it first
    document.addEventListener("click", function (event) {
        if (!waitingParts.size || !event.target.closest) return;
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        let id = link.getAttribute("href").slice(1);
        try {
            id = decodeURIComponent(id);
        } catch (error) {
            return;
        }
        const target = id && document.getElementById(id);
        if (target) buildParts(target);
    }, true);

    // ----- The menu on small screens (a window that doesn't shut out the page) -----
    function setUpMenu() {
        const menuButton = document.getElementById("menu-toggle");
        const navLinks = document.getElementById("nav-links");
        const navbar = document.getElementById("navbar");
        if (!menuButton || !navLinks || !navbar) return;

        function isOpen() {
            return menuButton.getAttribute("aria-expanded") === "true";
        }

        function setOpen(open) {
            menuButton.setAttribute("aria-expanded", String(open));
            navbar.classList.toggle("menu-open", open);
            // The button says "Open menu" or "Close menu"
            const key = open ? "core.menuClose" : "core.menuLabel";
            menuButton.setAttribute("data-i18n-attr", "aria-label:" + key);
            menuButton.setAttribute("aria-label", t(key));
            if (open) menu.opened();
            else menu.closed();
        }

        function closeMenu() {
            if (!isOpen()) return;
            // If the focus was on a link that is about to hide, give it back to the button
            const focusWasInside = navLinks.contains(document.activeElement);
            setOpen(false);
            if (focusWasInside) menuButton.focus({ preventScroll: true });
        }

        const menu = overlays.register("menu", {
            element: navLinks,
            scope: [navLinks, menuButton],
            modal: false,
            closeOnNavigate: true,
            escape: "anywhere",
            close: closeMenu
        });

        menuButton.addEventListener("click", function (event) {
            if (isOpen()) {
                closeMenu();
                return;
            }
            setOpen(true);
            // Opened with the keyboard (Enter / Space): go straight to the first link
            if (event.detail === 0) {
                const firstLink = navLinks.querySelector("a");
                if (firstLink) firstLink.focus();
            }
        });

        navLinks.querySelectorAll("a").forEach(function (link) {
            // The page is about to scroll to this link, so the focus stays on it
            link.addEventListener("click", function () {
                if (isOpen()) setOpen(false);
            });
        });

        // A tap or click anywhere outside the menu closes it
        document.addEventListener("pointerdown", function (event) {
            if (!isOpen()) return;
            if (navLinks.contains(event.target) || menuButton.contains(event.target)) return;
            closeMenu();
        }, true);

        // So does moving the keyboard focus somewhere else (e.g. Tab past the last link)
        function onFocusOut(event) {
            const next = event.relatedTarget;
            if (!isOpen() || !next) return;
            if (navLinks.contains(next) || menuButton.contains(next)) return;
            closeMenu();
        }
        navLinks.addEventListener("focusout", onFocusOut);
        menuButton.addEventListener("focusout", onFocusOut);

        // On a wide screen the links are always visible, so the menu state is reset
        // (without moving the focus: the links stay where they are)
        onMedia(queries.wideMenu, function (wide) {
            if (wide && isOpen()) setOpen(false);
        }, { immediate: false });
    }

    /* =========================================================
       11. COMMANDS (used by the Ctrl+K command palette)
       A command: { id, group, icon, title: function () { return "text"; }, keywords, run }
       Running one first closes the windows in the way (like navigate()).
       Quick actions that keep you where you are say keepOverlays: true
       (or a list of window ids to keep, like the lesson commands).
       ========================================================= */
    const commands = [];

    function registerCommand(command) {
        if (!command || commands.some(function (existing) { return existing.id === command.id; })) return;
        commands.push(command);
    }

    function runCommand(command) {
        const item = typeof command === "string"
            ? commands.find(function (existing) { return existing.id === command; })
            : command;
        if (!item || typeof item.run !== "function") return false;
        if (item.keepOverlays !== true) {
            closeAll({ reason: "command", navigating: true, except: item.keepOverlays });
        }
        item.run();
        return true;
    }

    /* =========================================================
       12. FEATURES AND CONTENT
       A feature shares its API with A.feature("glossary", api): it becomes
       A.glossary, and A.whenFeature("glossary") (a Promise) resolves with it.
       A.ready(callback) runs once every script has run and the page is ready.
       Content files (js/content/) keep data with A.content.set("quiz", {...}).
       ========================================================= */
    const featureAPIs = {};
    const featureWaiting = {};

    function feature(name, api) {
        featureAPIs[name] = api;
        window.AICompass[name] = api;
        (featureWaiting[name] || []).forEach(function (resolve) { resolve(api); });
        delete featureWaiting[name];
        emit("feature", { name: name });
        return api;
    }

    function whenFeature(name) {
        if (featureAPIs[name]) return Promise.resolve(featureAPIs[name]);
        return new Promise(function (resolve) {
            (featureWaiting[name] = featureWaiting[name] || []).push(resolve);
        });
    }

    let pageReady = false;
    const readyCallbacks = [];

    function ready(callback) {
        if (pageReady) setTimeout(function () { safeCall(callback); }, 0);
        else readyCallbacks.push(callback);
    }

    const contentStore = {};

    const content = {
        set: function (name, data) {
            contentStore[name] = Object.assign(contentStore[name] || {}, data);
            return contentStore[name];
        },
        get: function (name) {
            return contentStore[name];
        }
    };

    /* =========================================================
       13. TOASTS (small pop-up messages)
       ========================================================= */
    const TOAST_TIME = 3200;     // how long a toast stays on screen (ms)
    const TOAST_FADE = 400;      // its fade-out animation ("toast-out" in style.css)
    const MAX_TOASTS = 3;        // more at once would cover the page: the oldest leave early
    const toastTimers = new WeakMap();

    function hideToast(item) {
        if (item.classList.contains("toast-hide")) return;
        clearTimeout(toastTimers.get(item));
        item.classList.add("toast-hide");
        setTimeout(function () { item.remove(); }, TOAST_FADE);
    }

    function toast(message, icon) {
        const stack = document.getElementById("toast-stack");
        if (!stack) return;

        const item = document.createElement("div");
        item.className = "toast";
        item.innerHTML = '<span class="toast-icon" aria-hidden="true"></span><span class="toast-text"></span>';
        item.querySelector(".toast-icon").textContent = icon || "✨";
        item.querySelector(".toast-text").textContent = message;
        stack.appendChild(item);
        toastTimers.set(item, setTimeout(function () { hideToast(item); }, TOAST_TIME));

        // Many toasts in a row (a button pressed again and again): only the newest stay
        const showing = Array.prototype.filter.call(stack.children, function (other) {
            return !other.classList.contains("toast-hide");
        });
        showing.slice(0, -MAX_TOASTS).forEach(hideToast);
    }

    /* =========================================================
       THE PUBLIC TOOLKIT (window.AICompass)
       ========================================================= */
    window.AICompass = {
        // 1-2. storage and events
        storage: storage,
        on: on,
        emit: emit,

        // 3. texts
        addTranslations: addTranslations,
        applyTranslations: applyTranslations,
        t: t,
        has: function (key) { return lookup(key) !== undefined; },
        plural: plural,
        pluralForm: pluralForm,
        i18nHTML: i18nHTML,
        setTextValue: setTextValue,
        textValue: textValue,
        format: { number: formatNumber, percent: formatPercent, date: formatDate },
        get lang() { return state.lang; },
        get locale() { return LOCALES[state.lang]; },
        setLanguage: setLanguage,
        toggleLanguage: function () { setLanguage(state.lang === "en" ? "ru" : "en"); },
        onLanguageChange: function (callback) {
            return on("language", function (detail) { callback(detail.lang); });
        },

        // 4. theme
        get theme() { return state.theme; },
        setTheme: setTheme,
        toggleTheme: function () { setTheme(state.theme === "dark" ? "light" : "dark"); },
        onThemeChange: function (callback) {
            return on("theme", function (detail) { callback(detail.theme); });
        },

        // 5. motion (reducedMotion = only the device setting; use motion.ok())
        motion: motion,
        get reducedMotion() { return reducedMotionQuery.matches; },
        countUp: countUp,

        // 6. helpers
        util: util,
        dom: dom,
        colors: colors,
        canvas: canvas,
        cssVar: cssVar,
        escapeHTML: escapeHTML,
        confirmPress: confirmPress,

        // 7. screen
        breakpoints: breakpoints,
        queries: queries,
        media: media,
        onMedia: onMedia,
        whenVisible: whenVisible,
        onResize: onResize,
        onPixelRatioChange: onPixelRatioChange,
        layout: layout,

        // 8-9. screen readers and windows
        announce: announce,
        overlays: overlays,

        // 10. navigation and scrolling (scrollToSection is the older name of navigate)
        sections: SECTIONS,
        navigate: navigate,
        scrollToSection: navigate,
        onScroll: onScroll,
        onLayout: onLayout,
        layoutChanged: layoutChanged,
        onSection: onSection,
        whenNeeded: whenNeeded,
        buildParts: buildParts,
        whenIdle: whenIdle,

        // 11. commands
        commands: commands,
        registerCommand: registerCommand,
        runCommand: runCommand,

        // 12. features and content
        feature: feature,
        whenFeature: whenFeature,
        ready: ready,
        content: content,

        // 13. toasts
        toast: toast
    };

    // ---------- Built-in commands ----------
    SECTIONS.forEach(function (section) {
        registerCommand({
            id: "go-" + section.id,
            group: "cmd.groupNavigate",
            icon: section.icon,
            title: function () { return t(section.key); },
            keywords: section.id,
            run: function () { navigate(section.id); }
        });
    });

    registerCommand({
        id: "toggle-theme",
        group: "cmd.groupActions",
        icon: "🌓",
        title: function () { return t("cmd.toggleTheme"); },
        keywords: "theme dark light mode night тема тёмная светлая тёмный светлый ночной режим",
        keepOverlays: true,
        run: function () { window.AICompass.toggleTheme(); }
    });

    registerCommand({
        id: "toggle-language",
        group: "cmd.groupActions",
        icon: "🌐",
        title: function () { return t("cmd.toggleLang"); },
        keywords: "language english russian switch change translate язык русский английский сменить перевод",
        keepOverlays: true,
        run: function () { window.AICompass.toggleLanguage(); }
    });

    /* =========================================================
       14. START-UP
       ========================================================= */
    root.classList.add("js");
    updateMotionClasses();

    document.addEventListener("DOMContentLoaded", function () {
        // Every script has run, so every text is known: translate the page
        setLanguage(state.lang);
        updateThemeMeta();

        // Language and theme buttons
        const languageButton = document.getElementById("language-toggle");
        if (languageButton) {
            languageButton.addEventListener("click", function () {
                window.AICompass.toggleLanguage();
                toast(t("core.toastLang"), "🌐");
            });
        }

        const themeButton = document.getElementById("theme-toggle");
        if (themeButton) {
            themeButton.addEventListener("click", function () {
                window.AICompass.toggleTheme();
                const light = state.theme === "light";
                toast(t(light ? "core.toastLight" : "core.toastDark"), light ? "☀️" : "🌙");
            });
        }

        setUpMenu();
        startScrolling();

        pageReady = true;
        readyCallbacks.splice(0).forEach(function (callback) { safeCall(callback); });
    });

    // The page's first number formatter is slow to make: make it while the browser is idle
    // after loading, so a click or a part built later doesn't wait for it
    whenIdle(function () { formatter("number", { maximumFractionDigits: 3 }); });

})();
