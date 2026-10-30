/* =========================================================
   AI COMPASS — PLATFORM (the app, offline use, sharing)
   What makes the site a good web app, around the lessons:
   - The offline copy. Once the page has loaded, this file starts sw.js, the
     "service worker": a small script that keeps a copy of the site in the
     browser, so it opens and works without a connection (sw.js explains how).
   - "Install the app". When the browser offers to install the site as an app,
     a button appears in the footer and a command in Ctrl+K. iPhones and iPads
     never offer it: there the button shows how to do it with Share.
   - A short message when the connection drops and when it comes back.
   - Links ending in ?lang=ru or ?lang=en open the site in that language. The
     script in the <head> of index.html does that; this file finishes the job
     when the browser can't save the language.
   - AICompass.share(...): the phone's share window, or the link copied.
   Printing needs no JavaScript (css/print.css). What search engines and chat
   apps read is in the <head> of index.html; the app's name and icons are in
   manifest.webmanifest.

   Sections of this file:
    1. Settings
    2. The language asked for in the address
    3. The offline copy (the service worker)
    4. Offline and back online
    5. Installing the app
    6. Sharing
    7. Ctrl+K commands and the public API
   Other features use AICompass.share and AICompass.platform (see the last section).
   Progress events (A.track): "app.install" {} once the app is installed,
   "app.share" { via: "share" or "copy" } when something was shared.
   Nothing is saved by this file, and nothing is sent anywhere.
   Every text (English and Russian) is in js/content/platform.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const t = A.t;

    /* =========================================================
       1. SETTINGS
       ========================================================= */

    // The service worker's file, next to index.html. A service worker looks after the
    // folder its file is in, so this one covers the whole site (and only this site).
    const WORKER_FILE = "sw.js";
    // The message that asks the service worker to save the files this page has already
    // loaded (sw.js, section 5, listens for it)
    const SAVE_MESSAGE = "save-files";
    // Where the "Install the app" button and the iPhone help are (the footer of index.html)
    const INSTALL_BOX_ID = "install-app";
    const INSTALL_HELP_ID = "install-help";

    /* =========================================================
       2. THE LANGUAGE ASKED FOR IN THE ADDRESS
       The script in the <head> of index.html saves ?lang=ru / ?lang=en as the
       language and takes it out of the address. If the browser could not save
       it (storage blocked), the address still has it: switch here. This file
       runs before the other features, so they draw themselves in it.
       ========================================================= */
    function languageInAddress() {
        const lang = String(new URLSearchParams(window.location.search).get("lang") || "").toLowerCase();
        return lang === "en" || lang === "ru" ? lang : null;
    }

    const askedLanguage = languageInAddress();
    if (askedLanguage && askedLanguage !== A.lang) A.setLanguage(askedLanguage);

    // While the address keeps ?lang=, it follows the language buttons, so that a
    // reload (or a copied address) shows the language chosen last
    A.onLanguageChange(function (lang) {
        if (!languageInAddress()) return;
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        A.util.attempt(function () { history.replaceState(history.state, "", url.href); });
    });

    /* =========================================================
       3. THE OFFLINE COPY (THE SERVICE WORKER)
       Started once the page has loaded, at a quiet moment, so it never slows
       the start. Nothing happens on file:// (index.html opened by a double
       click) or in browsers without service workers, and a failure is simply
       ignored: the site works the same, only without the offline copy.
       Browsers driven by a test program (navigator.webdriver is true) get no
       service worker either: a test run must see exactly the files on the
       server, every time (the regression harness relies on this).
       ========================================================= */
    function canUseWorker() {
        return "serviceWorker" in navigator &&
            (window.location.protocol === "https:" || window.location.protocol === "http:") &&
            !navigator.webdriver;
    }

    // The addresses of the page and of every file it has loaded so far (styles,
    // scripts, fonts, icons...), as the browser lists them
    function loadedFiles() {
        const files = [window.location.href];
        performance.getEntriesByType("resource").forEach(function (entry) { files.push(entry.name); });
        return files;
    }

    function startWorker() {
        if (!canUseWorker()) return;
        // Without a worker in charge, this page was loaded straight from the internet
        // (the first visit, or a "hard" reload)
        const loadedWithoutWorker = !navigator.serviceWorker.controller;
        navigator.serviceWorker.register(WORKER_FILE).then(function () {
            if (!loadedWithoutWorker) return null;
            // The worker saved the app shell when it started. It also saves what this
            // page has loaded since (the fonts, a part opened already), so a first visit
            // without a connection looks exactly like this one.
            return navigator.serviceWorker.ready.then(function (registration) {
                if (registration.active) registration.active.postMessage({ type: SAVE_MESSAGE, files: loadedFiles() });
            });
        }).catch(function () { /* no offline copy, nothing else changes */ });
    }

    A.whenIdle(startWorker);

    /* =========================================================
       4. OFFLINE AND BACK ONLINE
       A toast (read out politely by screen readers) when the connection drops
       and when it comes back, and once at the start if the page was opened
       without a connection (from the offline copy).
       ========================================================= */
    function sayOffline() {
        A.toast(t("platform.offline"), "📴");
    }

    window.addEventListener("offline", sayOffline);
    window.addEventListener("online", function () {
        A.toast(t("platform.online"), "📶");
    });

    A.ready(function () {
        if (navigator.onLine === false) sayOffline();
    });

    /* =========================================================
       5. INSTALLING THE APP
       Chrome, Edge and Samsung Internet send "beforeinstallprompt" when the
       site can be installed: the button and the command appear, and pressing
       one shows the browser's own install window. Safari on iPhones and iPads
       never sends it: there the button shows the help text below it instead.
       Nothing is shown when the site already runs as the installed app.
       ========================================================= */
    const installBox = document.getElementById(INSTALL_BOX_ID);
    const installButton = installBox && installBox.querySelector("button");
    const installHelp = document.getElementById(INSTALL_HELP_ID);

    // Opened from the home screen, as the installed app
    const runsAsApp = A.media("(display-mode: standalone)").matches || window.navigator.standalone === true;
    // iPhones and iPads (an iPad says "Macintosh", but has a touch screen)
    const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    const showsHelp = isAppleMobile && !runsAsApp;

    let offer = null;           // the browser's offer to install (the event), kept until it is used
    let installed = runsAsApp;  // true once the app is installed (or runs as the app)
    let commandAdded = false;

    function showInstall(show) {
        if (installBox) A.dom.setHidden(installBox, !show);
        if (!show) showHelp(false);
        if (show) addInstallCommand();
    }

    // The iPhone help below the button (the button says whether it is open)
    function showHelp(show) {
        if (!installHelp || !installButton) return;
        A.dom.setHidden(installHelp, !show);
        if (showsHelp) A.dom.setAttr(installButton, "aria-expanded", String(show));
    }

    // What the button and the command do. The result says what happened:
    // "accepted" or "dismissed" (the browser's window), "help" (iPhone), "installed"
    // (nothing to do) or "unavailable" (the browser offers nothing now).
    function install() {
        if (offer) {
            const asked = offer;
            offer = null;
            showInstall(false);   // an offer can be used only once
            asked.prompt();
            return asked.userChoice.then(function (choice) {
                return choice && choice.outcome === "accepted" ? "accepted" : "dismissed";
            }, function () {
                return "dismissed";
            });
        }
        if (installed) {
            A.toast(t("platform.alreadyInstalled"), "📲");
            return Promise.resolve("installed");
        }
        if (showsHelp) {
            showHelp(true);
            return Promise.resolve("help");
        }
        A.toast(t("platform.installMenu"), "📲");
        return Promise.resolve("unavailable");
    }

    window.addEventListener("beforeinstallprompt", function (event) {
        // No banner from the browser: our button and command offer it instead
        event.preventDefault();
        offer = event;
        showInstall(true);
    });

    window.addEventListener("appinstalled", function () {
        offer = null;
        installed = true;
        showInstall(false);
        A.toast(t("platform.installed"), "🎉");
        A.track("app.install", {});
    });

    if (installButton) {
        // On iPhones the button opens the help: it says so, and whether the help is open
        if (showsHelp) {
            installButton.setAttribute("aria-controls", INSTALL_HELP_ID);
            installButton.setAttribute("aria-expanded", "false");
        }
        installButton.addEventListener("click", function () {
            // On iPhones the button opens and closes the help
            if (showsHelp && installHelp && !installHelp.hidden) showHelp(false);
            else install();
        });
    }

    if (showsHelp) showInstall(true);

    /* =========================================================
       6. SHARING
       AICompass.share({ title, text, url }) shares a text and a link:
       - with the device's share window, where there is one (phones, tablets,
         some computers);
       - otherwise it copies "text link" and says so in a toast.
       Every part is optional: AICompass.share() shares the site itself.
       It returns a Promise with what happened: "shared", "copied", "cancelled"
       (the share window was closed) or "failed". Call it from a click: browsers
       allow sharing and copying only right after one.
       ========================================================= */

    // The address to share: the site in the current language, with an optional part,
    // e.g. link("quiz") -> https://newfter.github.io/AI-Compass/?lang=ru#quiz.
    // It starts from <link rel="canonical"> (the <head> script of index.html adds it), the
    // public address, so a copy of the site opened on your own computer still shares the real one.
    function link(hash) {
        const canonical = document.querySelector('link[rel="canonical"]');
        const base = (canonical && canonical.href ? canonical.href : window.location.href).split(/[?#]/)[0];
        const part = hash ? "#" + String(hash).replace(/^#/, "") : "";
        return base + "?lang=" + A.lang + part;
    }

    function share(options) {
        const settings = options || {};
        const data = {
            title: settings.title || t("platform.shareTitle"),
            text: settings.text || t("platform.shareText"),
            url: settings.url || link()
        };
        const canShare = typeof navigator.share === "function" &&
            (typeof navigator.canShare !== "function" || navigator.canShare(data));
        if (!canShare) return copy(data);

        return navigator.share(data).then(function () {
            A.track("app.share", { via: "share" });
            return "shared";
        }, function (error) {
            // The share window was closed without sharing: nothing else to do
            if (error && error.name === "AbortError") return "cancelled";
            // Not allowed here (for example not right after a click): copy instead
            return copy(data);
        });
    }

    function copy(data) {
        const text = [data.text, data.url].filter(Boolean).join(" ");
        return writeClipboard(text).then(function () {
            A.toast(t("platform.copied"), "🔗");
            A.track("app.share", { via: "copy" });
            return "copied";
        }, function () {
            A.toast(t("platform.copyFailed", { url: data.url }), "⚠️");
            return "failed";
        });
    }

    // The clipboard: the modern way first, then the old one
    function writeClipboard(text) {
        const modern = navigator.clipboard && typeof navigator.clipboard.writeText === "function"
            ? navigator.clipboard.writeText(text)
            : Promise.reject(new Error("No clipboard"));
        return modern.catch(function () {
            if (!copyTheOldWay(text)) throw new Error("Could not copy");
        });
    }

    // Older browsers: select the text in a hidden text box and run "copy". The box goes
    // next to the focused element (inside an open window, the rest of the page can't
    // take the focus), and the focus goes back where it was.
    function copyTheOldWay(text) {
        const focused = document.activeElement;
        const place = focused && focused !== document.body && focused.parentNode ? focused.parentNode : document.body;
        const box = document.createElement("textarea");
        box.className = "sr-only";
        box.value = text;
        box.setAttribute("readonly", "");
        box.setAttribute("aria-hidden", "true");
        box.tabIndex = -1;
        place.appendChild(box);
        box.select();
        const copied = A.util.attempt(function () { return document.execCommand("copy"); }, false);
        box.remove();
        if (focused && typeof focused.focus === "function") focused.focus({ preventScroll: true });
        return copied;
    }

    /* =========================================================
       7. CTRL+K COMMANDS AND THE PUBLIC API
       ========================================================= */

    // "Install the app" appears only once the site can be installed (section 5)
    function addInstallCommand() {
        if (commandAdded) return;
        commandAdded = true;
        A.registerCommand({
            id: "app-install",
            group: "cmd.groupActions",
            icon: "📲",
            title: function () { return t("platform.cmdInstall"); },
            keywords: "install app application home screen offline download pwa установить приложение экран домой офлайн скачать",
            // The browser's install window opens over the page; on iPhones the
            // command goes down to the help in the footer
            keepOverlays: !showsHelp,
            run: function () {
                install();
                if (showsHelp && installBox && !installBox.hidden) {
                    installBox.scrollIntoView({ block: "center", behavior: A.motion.ok() ? "smooth" : "auto" });
                    if (installButton) installButton.focus({ preventScroll: true });
                }
            }
        });
    }

    A.registerCommand({
        id: "app-share",
        group: "cmd.groupActions",
        icon: "🔗",
        title: function () { return t("platform.cmdShare"); },
        keywords: "share link send friend copy address поделиться ссылка отправить другу скопировать адрес",
        keepOverlays: true,
        run: function () { share(); }
    });

    // An open lesson prints as a clean handout (css/print.css), so the reader stays open
    A.registerCommand({
        id: "app-print",
        group: "cmd.groupActions",
        icon: "🖨️",
        title: function () { return t("platform.cmdPrint"); },
        keywords: "print printer paper handout pdf печать распечатать принтер бумага раздаточный материал",
        keepOverlays: true,
        run: function () { window.print(); }
    });

    // AICompass.share({ title, text, url }) -> Promise of "shared" | "copied" | "cancelled" | "failed"
    //     (see section 6), for example the quiz result:
    //     A.share({ text: "I scored 10 of 12 in the AI Challenge!", url: A.platform.link("quiz") });
    A.feature("share", share);

    // AICompass.platform:
    //   link(part)    the site's public address in the current language, e.g. link("quiz")
    //   install()     the browser's install window (iPhones: the help), Promise of what happened
    //   canInstall()  true while the browser offers to install (or on iPhones and iPads)
    //   installed     true when the site runs as the installed app, or was just installed
    A.feature("platform", {
        link: link,
        install: install,
        canInstall: function () { return Boolean(offer) || (showsHelp && !installed); },
        get installed() { return installed; }
    });
})();
