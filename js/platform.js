/* =========================================================
   AI COMPASS — PLATFORM (the app, offline use, sharing)
   What makes the site a good web app, around the lessons:
   - The offline copy. Once the page has loaded, this file starts sw.js, the
     "service worker": a small script that keeps a copy of the site in the
     browser, so it opens and works without a connection (sw.js explains how).
     It also hands it the parts loaded on demand (A.offlineFiles in core.js),
     to save ahead: after one visit, the whole site works offline.
   - "Install the app": in the footer, in the settings window and in Ctrl+K.
     Where the browser has an install window of its own (Chrome, Edge...),
     the button opens it; where it has none (iPhones and iPads, Safari on a
     Mac, Firefox on Android), a short help says where to tap.
   - Keeping the progress: the browser is asked not to delete what the site
     saved, where it answers without asking the visitor.
   - A short message when the connection drops and when it comes back.
   - Links ending in ?lang=ru or ?lang=en open the site in that language. The
     script in the <head> of index.html does that; this file finishes the job
     when the browser can't save the language.
   - AICompass.share(...): the phone's share window, or the link copied.
   Printing needs no JavaScript (css/print.css). What search engines and chat
   apps read is in the <head> of index.html; the app's name, icons, pictures
   and shortcuts are in manifest.webmanifest.

   Sections of this file:
    1. Settings
    2. The language asked for in the address
    3. The offline copy (the service worker)
    4. Offline and back online
    5. Installing the app
    6. Keeping the progress on this device
    7. Sharing
    8. Ctrl+K commands and the public API
   Other features use AICompass.share and AICompass.platform (see the last section).
   Progress events (A.track): "app.install" {} once the app is installed,
   "app.share" { via: "share" or "copy" } when something was shared.
   Nothing is saved by this file, and nothing is sent anywhere.
   The install box and its group in the settings window are styled in
   css/platform.css. Every text (English and Russian) is in js/content/platform.js
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
    // Where the "Install the app" button and its help are (the footer of index.html)
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

    // The visitor asked the browser to use less data, or the connection is very slow:
    // then the parts loaded on demand are not saved ahead (only once they are used)
    function savingData() {
        const connection = navigator.connection;
        return Boolean(connection && (connection.saveData || /2g$/.test(connection.effectiveType || "")));
    }

    function startWorker() {
        // Firefox throws an error as soon as navigator.serviceWorker is read when the
        // site may not save anything (cookies blocked): then there is simply no worker
        let workers = null;
        try {
            if (canUseWorker()) workers = navigator.serviceWorker;
        } catch (error) {
            workers = null;
        }
        if (!workers) return;
        // Without a worker in charge, this page was loaded straight from the internet
        // (the first visit, or a "hard" reload)
        const loadedWithoutWorker = !workers.controller;
        workers.register(WORKER_FILE).then(function () {
            return workers.ready;
        }).then(function (registration) {
            const worker = registration.active;
            if (!worker) return;
            // The worker saved the app shell when it started. It also saves what this
            // page has loaded since (the fonts, a part opened already), so a first visit
            // without a connection looks exactly like this one. And on every visit, the
            // parts loaded on demand (the quiz questions, the lab experiments, the teacher
            // kit...), so the whole site works offline: only the ones not saved yet, or
            // saved before the site was last published, are fetched.
            const files = (loadedWithoutWorker ? loadedFiles() : []).concat(savingData() ? [] : A.offlineFiles());
            if (files.length) worker.postMessage({ type: SAVE_MESSAGE, files: files, update: true });
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
       Three places offer it, and they always agree: the box in the footer of
       index.html, the group "The app" in the settings window (js/settings.js
       leaves an empty place for it and calls mountInstall each time it draws
       the window) and a Ctrl+K command (section 8). No pop-up ever offers it:
       another part of the site owns the only pop-up nudge.
       - Chrome, Edge, Samsung Internet and the other browsers built on
         Chromium send "beforeinstallprompt" when the site can be installed:
         the button appears, and pressing it shows the browser's own window.
       - Browsers that can install a site but have no such window get a short
         help that says where to tap. The footer's button opens and closes it;
         the settings window shows it at once:
           iPhones and iPads: Share, then "Add to Home Screen" (Safari, and
             since iOS 16.4 Chrome, Edge and the others too; on an older
             system, or inside another app, it says to open Safari first);
           Safari 17 or newer on a Mac: File, then "Add to Dock";
           Firefox on Android: the menu ⋮, then "Install".
       - Firefox on a computer can't install a site: nothing is shown there.
         Nothing is shown either once the site runs as the installed app, or
         has just been installed.
       ========================================================= */
    const installBox = document.getElementById(INSTALL_BOX_ID);
    const installButton = installBox && installBox.querySelector("button");
    const installHelp = document.getElementById(INSTALL_HELP_ID);

    const agent = navigator.userAgent || "";
    // Opened from the home screen, the dock or the start menu, as the installed app
    const runsAsApp = A.media("(display-mode: standalone)").matches || window.navigator.standalone === true;
    // iPhones and iPads (an iPad says "Macintosh", but has a touch screen)
    const isAppleMobile = /iPhone|iPad|iPod/.test(agent) ||
        (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1);

    // The help for this browser (a text of js/content/platform.js), or "" when it needs none
    function helpForThisBrowser() {
        if (isAppleMobile) {
            // Every browser of an iPhone or iPad can add the site to the home screen since
            // iOS 16.4; before, only Safari could. The others write their own name in the
            // user agent, and a page shown inside another app (a chat, a social network)
            // has no "Safari/" in it at all.
            const system = /(?:iPhone OS|CPU OS) (\d+)_(\d+)/.exec(agent);
            const beforeIos164 = Boolean(system) && Number(system[1]) * 100 + Number(system[2]) < 1604;
            const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|GSA\//.test(agent);
            if (!/Safari\//.test(agent) || (otherBrowser && beforeIos164)) return "platform.iosSafariHelp";
            return "platform.iosHelp";
        }
        // Safari on a Mac (only Safari writes "Version/17.1 Safari/..."): "Add to Dock" since Safari 17
        const safari = /Macintosh/.test(agent) && !/Chrom|Edg|OPR|YaBrowser|Firefox/.test(agent) &&
            /Version\/(\d+)[\d.]* Safari\//.exec(agent);
        if (safari && Number(safari[1]) >= 17) return "platform.macHelp";
        if (/Android/.test(agent) && /Firefox\//.test(agent)) return "platform.firefoxHelp";
        return "";
    }

    const helpKey = runsAsApp ? "" : helpForThisBrowser();

    let offer = null;           // the browser's offer to install (the event), kept until it is used
    let installed = runsAsApp;  // true once the app is installed (or runs as the app)
    let helpOpen = false;       // the help under the footer's button is open
    let settingsGroup = null;   // the group "The app" of the settings window, once drawn
    let commandAdded = false;

    // What can be offered now: "window" (the browser's install window), "help" or "" (nothing)
    function offerKind() {
        if (installed) return "";
        if (offer) return "window";
        return helpKey ? "help" : "";
    }

    // Shows the offer as it is now, in every place
    function paintInstall() {
        const kind = offerKind();
        if (kind !== "help") helpOpen = false;
        if (installBox) A.dom.setHidden(installBox, !kind);
        if (installButton) {
            // With the help, the button opens and closes it, and says whether it is open
            if (kind === "help") {
                A.dom.setAttr(installButton, "aria-controls", INSTALL_HELP_ID);
                A.dom.setAttr(installButton, "aria-expanded", String(helpOpen));
            } else if (installButton.hasAttribute("aria-expanded")) {
                installButton.removeAttribute("aria-controls");
                installButton.removeAttribute("aria-expanded");
            }
        }
        if (installHelp) A.dom.setHidden(installHelp, !helpOpen);
        paintSettings(kind);
        if (kind) addInstallCommand();
    }

    // The help's text: the one for this browser (core translates it again when the language changes)
    if (installHelp && helpKey) {
        A.dom.setAttr(installHelp, "data-i18n", helpKey);
        A.dom.setText(installHelp, t(helpKey));
    }

    // The group "The app" of the settings window. js/settings.js leaves an empty, hidden
    // <section> for it and calls this each time it draws the window: the first call fills
    // it, and every call shows it only when there is something to offer.
    function mountInstall(group) {
        if (!group) return;
        if (group !== settingsGroup) {
            settingsGroup = group;
            group.setAttribute("aria-labelledby", "st-app-title");
            group.innerHTML =
                '<h3 class="st-group-title" id="st-app-title" data-i18n="platform.settingsTitle">' + t("platform.settingsTitle") + "</h3>" +
                '<p class="st-hint st-group-hint" id="st-app-hint" data-i18n="platform.settingsHint">' + t("platform.settingsHint") + "</p>" +
                '<div class="st-row st-app-row">' +
                    '<button type="button" class="btn btn-ghost btn-small st-app-install" aria-describedby="st-app-hint" hidden>' +
                        '<span aria-hidden="true">📲</span>' + A.i18nHTML("platform.install") + "</button>" +
                    (helpKey ? A.i18nHTML(helpKey, "st-app-help", "p") : "") +
                "</div>";
            group.querySelector(".st-app-install").addEventListener("click", function () { install(); });
        }
        paintSettings(offerKind());
    }

    function paintSettings(kind) {
        if (!settingsGroup) return;
        // A hidden button can't keep the focus: it goes to the window's title
        if (!kind && settingsGroup.contains(document.activeElement)) {
            const dialog = settingsGroup.closest('[role="dialog"]');
            const title = dialog && dialog.querySelector('[tabindex="-1"]');
            if (title) title.focus({ preventScroll: true });
        }
        A.dom.setHidden(settingsGroup, !kind);
        A.dom.setHidden(settingsGroup.querySelector(".st-app-install"), kind !== "window");
        const help = settingsGroup.querySelector(".st-app-help");
        if (help) A.dom.setHidden(help, kind !== "help");
    }

    // What the buttons and the command do. The result says what happened:
    // "accepted" or "dismissed" (the browser's window), "help" (the help is shown),
    // "installed" (nothing to do) or "unavailable" (the browser offers nothing now, or
    // didn't show its window because this didn't come right after a click).
    function install() {
        if (offer) {
            const asked = offer;
            offer = null;
            paintInstall();   // an offer can be used only once
            let shown;
            try {
                shown = Promise.resolve(asked.prompt());
            } catch (error) {
                shown = Promise.reject(error);
            }
            return shown.then(function () {
                return asked.userChoice.then(function (choice) {
                    return choice && choice.outcome === "accepted" ? "accepted" : "dismissed";
                }, function () {
                    return "dismissed";
                });
            }, function () {
                // The browser didn't show its window (it does so only right after a click):
                // the offer is still good, so the button comes back for the next try
                if (!offer && !installed) {
                    offer = asked;
                    paintInstall();
                }
                return "unavailable";
            });
        }
        if (installed) {
            A.toast(t("platform.alreadyInstalled"), "📲");
            return Promise.resolve("installed");
        }
        if (helpKey) {
            helpOpen = true;
            paintInstall();
            return Promise.resolve("help");
        }
        A.toast(t("platform.installMenu"), "📲");
        return Promise.resolve("unavailable");
    }

    window.addEventListener("beforeinstallprompt", function (event) {
        // No banner from the browser: our button and command offer it instead
        event.preventDefault();
        offer = event;
        paintInstall();
    });

    window.addEventListener("appinstalled", function () {
        offer = null;
        installed = true;
        paintInstall();
        A.toast(t("platform.installed"), "🎉");
        A.track("app.install", {});
        keepProgress();
    });

    if (installButton) {
        installButton.addEventListener("click", function () {
            if (offerKind() === "help") {
                helpOpen = !helpOpen;
                paintInstall();
            } else {
                install();
            }
        });
    }

    paintInstall();

    /* =========================================================
       6. KEEPING THE PROGRESS ON THIS DEVICE
       The progress is saved in this browser, and a browser may delete what a
       site saved: Safari after 7 days without a visit, the others when the
       device runs out of space. navigator.storage.persist() asks it to keep
       it. Browsers built on Chromium (Chrome, Edge, Samsung Internet...) and
       on Safari's engine (every browser of an iPhone) answer by themselves,
       without asking the visitor: yes for an installed app, for example.
       Firefox would ask the visitor instead, so it is never asked there.
       It is asked once per visit at most, at a good moment: when the site
       runs as the installed app (or has just been installed), or after the
       first real progress of the visit (a finished lesson, step, quiz...).
       Nothing is saved and nothing is sent.
       ========================================================= */
    // The progress events (A.track) that save something worth keeping
    const PROGRESS_EVENTS = ["lesson.complete", "learn.placement", "learn.unit", "learn.review", "learn.test",
        "quiz.finish", "daily.complete", "flashcard.finish", "challenge.finish"];
    // Chromium and Safari's engine (WebKit) write "AppleWebKit/"; Firefox doesn't
    const asksNobody = /AppleWebKit\//.test(agent) && !/Firefox\//.test(agent);
    let keepAsked = false;

    function keepProgress() {
        if (keepAsked || !asksNobody) return;
        keepAsked = true;
        try {
            const storage = navigator.storage;
            if (!storage || typeof storage.persist !== "function") return;
            const already = typeof storage.persisted === "function" ? storage.persisted() : false;
            Promise.resolve(already).then(function (kept) {
                return kept || storage.persist();
            }).catch(function () { /* not allowed here: nothing changes */ });
        } catch (error) {
            // Storage blocked: nothing to keep
        }
    }

    if (runsAsApp) A.whenIdle(keepProgress);

    A.on("activity", function (activity) {
        if (activity && PROGRESS_EVENTS.indexOf(activity.type) !== -1) keepProgress();
    });

    /* =========================================================
       7. SHARING
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
       8. CTRL+K COMMANDS AND THE PUBLIC API
       ========================================================= */

    // "Install the app" appears only once there is something to offer (section 5)
    function addInstallCommand() {
        if (commandAdded) return;
        commandAdded = true;
        A.registerCommand({
            id: "app-install",
            group: "cmd.groupActions",
            icon: "📲",
            title: function () { return t("platform.cmdInstall"); },
            keywords: "install app application home screen dock offline download pwa установить приложение экран домой док офлайн скачать",
            // The browser's install window opens over the page; where there is none,
            // the command goes down to the help in the footer
            keepOverlays: !helpKey,
            run: function () {
                install();
                if (helpKey && installBox && !installBox.hidden) {
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
    //     (see section 7), for example the quiz result:
    //     A.share({ text: "I scored 10 of 12 in the AI Challenge!", url: A.platform.link("quiz") });
    A.feature("share", share);

    // AICompass.platform:
    //   link(part)          the site's public address in the current language, e.g. link("quiz")
    //   install()           the browser's install window (or, where there is none, the help in
    //                       the footer), Promise of what happened (section 5)
    //   canInstall()        true while something can be offered: the browser's window or the help
    //   mountInstall(group) draws the group "The app" into the settings window (js/settings.js)
    //   installed           true when the site runs as the installed app, or was just installed
    A.feature("platform", {
        link: link,
        install: install,
        canInstall: function () { return offerKind() !== ""; },
        mountInstall: mountInstall,
        get installed() { return installed; }
    });
})();
