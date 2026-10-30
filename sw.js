/* =========================================================
   AI COMPASS — SERVICE WORKER (the site without a connection)

   WHAT IS A SERVICE WORKER?
   A small script that the browser keeps for a website. It sits between the
   page and the internet: every file the page asks for (the page itself, its
   styles, scripts, icons and fonts) passes through it first. It can fetch
   the file from the internet, or answer with a copy it saved earlier. That
   is how the site keeps working without a connection, and why it can be
   installed as an app. js/platform.js asks the browser to start it.

   WHAT THIS ONE DOES
   - The site's own files: the internet first. Online, you always get the
     newest version of every file, and each answer is saved as the copy for
     later. Without a connection, or when the internet takes longer than
     about 4 seconds, the saved copy answers instead.
   - Google Fonts never change: the saved copy answers at once, and a fresh
     one is fetched in the background for next time.
   - When it starts for the first time ("install"), it saves the app shell:
     the page and every style, script and icon that index.html loads, so the
     very first visit without a connection already works. Parts that are
     loaded later, only when they are needed, are saved the first time they
     are used.
   - A page that was never saved, without a connection: a small "You're
     offline" page, in English or Russian.

   YOU NEVER NEED TO CHANGE THIS FILE WHEN YOU EDIT THE SITE.
   It reads the list of files to save from index.html itself, and online it
   always asks the internet first, so whatever you publish reaches everyone
   on their next visit. There is no version number to remember. (Only a
   change to the way this file itself works needs a new CACHE_VERSION.)

   Sections of this file:
    1. Settings
    2. Small helpers
    3. Install: saving the app shell
    4. Activate: old copies out, open pages taken over
    5. Saving what the first page loaded
    6. Answering the page's requests
    7. The offline page (its texts, in both languages)
   ========================================================= */
"use strict";

// ---------- 1. Settings ----------
const CACHE_VERSION = 1;                 // only for a change to the way this file saves files
const NETWORK_TIMEOUT = 4000;            // ms without an answer before the saved copy is used
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
// The <link> tags whose file the page needs (not "canonical", "alternate" or "preconnect")
const LINKS_TO_SAVE = ["stylesheet", "icon", "apple-touch-icon", "manifest"];
// js/platform.js sends this message with the files the first page loaded (section 5)
const SAVE_MESSAGE = "save-files";

// The folder the site lives in, e.g. https://newfter.github.io/AI-Compass/
const SCOPE = self.registration.scope;
// All saved copies are kept in one "cache" with this name. Other sites on the same
// address (newfter.github.io/<another project>/) have their own, so the name has the
// folder in it, and section 4 only ever deletes this site's old caches.
const CACHE_PREFIX = "ai-compass-v";
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION + " " + SCOPE;

// ---------- 2. Small helpers ----------
// A copy worth keeping: a complete, normal answer (not an error page like 404, not a
// redirect). Fonts may come as "opaque" answers that can't be checked: they are kept
// too, because Google Fonts files never change.
function isGoodCopy(response, isFont) {
    if (!response) return false;
    if (isFont && response.type === "opaque") return true;
    return response.status === 200 && !response.redirected &&
        (response.type === "basic" || response.type === "cors");
}

function isFontAddress(address) {
    return FONT_HOSTS.indexOf(new URL(address).hostname) !== -1;
}

function isSiteAddress(address) {
    return address.indexOf(SCOPE) === 0;
}

// A page is saved once, under its address without "?..." and without "index.html":
// /AI-Compass/?lang=ru, /AI-Compass/index.html and /AI-Compass/ are the same page
function pageKey(address) {
    const url = new URL(address);
    return url.origin + url.pathname.replace(/index\.html$/, "");
}

function saveCopy(key, response) {
    return caches.open(CACHE_NAME)
        .then(function (cache) { return cache.put(key, response); })
        .catch(function () { /* the browser's storage is full or blocked: no copy, no problem */ });
}

// The saved copy, or undefined
function savedCopy(key) {
    return caches.open(CACHE_NAME)
        .then(function (cache) { return cache.match(key, { ignoreVary: true }); })
        .catch(function () { return undefined; });
}

// The site's own files are always fetched with "no-cache": the browser asks the server
// whether the file changed (a quick "not modified" when it didn't), instead of using
// its own short-term copy. So a change you publish is seen on the very next visit.
function fetchFresh(request) {
    return fetch(new Request(request, { cache: "no-cache" }));
}

// Fetches a file and saves it (for the app shell and section 5)
function fetchAndSave(address) {
    const isFont = isFontAddress(address);
    const answer = isFont ? fetch(address) : fetchFresh(address);
    return answer.then(function (response) {
        if (!isGoodCopy(response, isFont)) throw new Error("Not saved: " + address);
        return saveCopy(address, response.clone()).then(function () { return response; });
    });
}

// ---------- 3. Install: saving the app shell ----------
// The files that index.html loads by itself, read from its own text: the src="..." of
// every <script> and the href="..." of the <link> tags in LINKS_TO_SAVE, when they
// point to a file of this site, e.g. ./css/quiz.css or ./js/content/quiz.js.
// (HTML comments are left out first: they may mention tags.)
function filesOfPage(html) {
    const files = [];
    const code = html.replace(/<!--[\s\S]*?-->/g, "");
    (code.match(/<(?:script|link)\b[^>]*>/gi) || []).forEach(function (tag) {
        const isLink = /^<link/i.test(tag);
        const rel = (/\brel="([^"]*)"/i.exec(tag) || [])[1];
        if (isLink && LINKS_TO_SAVE.indexOf(rel) === -1) return;
        const address = (/\b(?:src|href)="([^"]+)"/i.exec(tag) || [])[1];
        if (!address) return;
        const url = new URL(address, SCOPE).href;
        if (isSiteAddress(url) && files.indexOf(url) === -1) files.push(url);
    });
    return files;
}

// The icons named in the manifest (the home screen and the install window use them)
function iconsOfManifest(text, manifestAddress) {
    try {
        const manifest = JSON.parse(text);
        return (manifest.icons || []).map(function (icon) { return new URL(icon.src, manifestAddress).href; });
    } catch (error) {
        return [];
    }
}

function saveAppShell() {
    // index.html first: it says what else to save. Without it, the install fails and
    // the browser simply tries again on a later visit.
    return fetchFresh(SCOPE).then(function (response) {
        if (!isGoodCopy(response, false)) throw new Error("The page could not be loaded");
        return saveCopy(pageKey(SCOPE), response.clone()).then(function () { return response.text(); });
    }).then(function (html) {
        // Each file on its own: one missing file must not stop the others
        return Promise.all(filesOfPage(html).map(function (address) {
            return fetchAndSave(address).then(function (response) {
                if (!/\.webmanifest$/.test(address)) return null;
                return response.text().then(function (text) {
                    return Promise.all(iconsOfManifest(text, address).map(function (icon) {
                        return fetchAndSave(icon).catch(function () {});
                    }));
                });
            }).catch(function () {});
        }));
    });
}

self.addEventListener("install", function (event) {
    event.waitUntil(saveAppShell().then(function () {
        // Take over at once, without waiting for the old version's tabs to close: see section 4
        return self.skipWaiting();
    }));
});

// ---------- 4. Activate: old copies out, open pages taken over ----------
// Usually a new version of a service worker waits until every tab of the site is
// closed before it takes over (skipWaiting and clients.claim skip that wait). The wait
// protects sites whose worker answers from its saved copies first: an open page could
// suddenly get files of a newer version than the page itself. This worker asks the
// internet first, so every page gets the newest files anyway, and taking over at once
// is safe. It also means that a change to this file reaches visitors on their next
// visit, not only after they have closed every tab.
self.addEventListener("activate", function (event) {
    event.waitUntil(caches.keys().then(function (names) {
        // The saved copies of older versions of this file, for this site only
        return Promise.all(names.filter(function (name) {
            return name.indexOf(CACHE_PREFIX) === 0 && name.slice(-SCOPE.length) === SCOPE && name !== CACHE_NAME;
        }).map(function (name) { return caches.delete(name); }));
    }).then(function () {
        return self.clients.claim();
    }));
});

// ---------- 5. Saving what the first page loaded ----------
// On the very first visit the page loads before this worker exists, so its fonts (and
// any part opened quickly) never pass through it. js/platform.js then sends the list
// of files the page has loaded, and the ones of this site or of Google Fonts that are
// not saved yet are saved now.
self.addEventListener("message", function (event) {
    const message = event.data || {};
    if (message.type !== SAVE_MESSAGE || !Array.isArray(message.files)) return;
    event.waitUntil(Promise.all(message.files.map(function (address) {
        if (typeof address !== "string" || !/^https?:/.test(address)) return null;
        if (!isSiteAddress(address) && !isFontAddress(address)) return null;
        return savedCopy(address).then(function (saved) {
            return saved ? null : fetchAndSave(address).catch(function () {});
        });
    })));
});

// ---------- 6. Answering the page's requests ----------
self.addEventListener("fetch", function (event) {
    const request = event.request;
    // Only reading files; sending data, or asking for a part of a file, goes straight on
    if (request.method !== "GET" || request.headers.has("range")) return;
    if (isSiteAddress(request.url)) {
        event.respondWith(internetFirst(event));
    } else if (isFontAddress(request.url)) {
        event.respondWith(savedFirst(event));
    }
    // Anything else (another website) is not touched
});

// The site's own files: the internet's answer when it comes in time, otherwise the
// saved copy (or, for a page that was never saved, the offline page)
function internetFirst(event) {
    const request = event.request;
    const isPage = request.mode === "navigate";
    const key = isPage ? pageKey(request.url) : request;
    const fromInternet = fetchFresh(request);

    // Every good answer replaces the saved copy, even one that comes too late to be
    // shown now (waitUntil keeps this worker awake until it is saved)
    event.waitUntil(fromInternet.then(function (response) {
        return isGoodCopy(response, false) ? saveCopy(key, response.clone()) : null;
    }).catch(function () {}));

    return new Promise(function (resolve) {
        let answered = false;
        function answer(response) {
            if (answered) return;
            answered = true;
            resolve(response);
        }

        // In time: the internet's answer, whatever it is (a 404 is the real answer too)
        fromInternet.then(answer, function () {
            // No connection: the saved copy, the offline page, or "failed" as usual
            savedCopy(key).then(function (saved) {
                if (saved) answer(saved);
                else answer(isPage ? offlinePage() : Response.error());
            });
        });

        // Too slow: the saved copy, if there is one (otherwise keep waiting)
        setTimeout(function () {
            if (answered) return;
            savedCopy(key).then(function (saved) {
                if (saved) answer(saved);
            });
        }, NETWORK_TIMEOUT);
    });
}

// Google Fonts: the saved copy at once, and a fresh one in the background for next
// time ("stale while revalidate"). Never saved yet: wait for the internet.
function savedFirst(event) {
    const request = event.request;
    const fresh = fetch(request).then(function (response) {
        if (!isGoodCopy(response, true)) return response;
        return saveCopy(request, response.clone()).then(function () { return response; });
    });
    event.waitUntil(fresh.catch(function () {}));
    return savedCopy(request).then(function (saved) {
        return saved || fresh;
    }).catch(function () {
        return Response.error();
    });
}

// ---------- 7. The offline page ----------
// Shown for a page that was never saved, without a connection. It has its own texts
// here, because without a connection the site's text files may be missing. A small
// script inside picks the language (?lang= in the address, else the saved one, else the
// device's) and the saved theme, like the site does.
const OFFLINE_TEXTS = {
    en: {
        title: "You're offline",
        text: "This page isn't saved on this device yet, and there's no connection right now. Everything you've already opened still works.",
        retry: "Try again",
        home: "Go to the home page"
    },
    ru: {
        title: "Нет подключения к интернету",
        text: "Эта страница ещё не сохранена на этом устройстве, а интернета сейчас нет. Всё, что уже было открыто, работает и без него.",
        retry: "Попробовать снова",
        home: "На главную"
    }
};

function offlinePage() {
    const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#060812">
<title>AI Compass</title>
<style>
    /* The site's colours (style.css): the dark theme, then the light one */
    :root { --bg: #060812; --card: rgba(16, 22, 42, 0.9); --text: #eef1ff; --muted: #aab5d0; --border: rgba(143, 130, 255, 0.42); --ring: #50e3ff; color-scheme: dark; }
    [data-theme="light"] { --bg: #f4f6fd; --card: rgba(255, 255, 255, 0.92); --text: #12162b; --muted: #4a5470; --border: rgba(90, 70, 200, 0.4); --ring: #07728f; color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px; color: var(--text);
        font-family: Manrope, system-ui, -apple-system, "Segoe UI", Arial, sans-serif; line-height: 1.6;
        background: radial-gradient(ellipse at 20% 10%, rgba(155, 109, 255, 0.18), transparent 50%), radial-gradient(ellipse at 85% 80%, rgba(80, 227, 255, 0.1), transparent 45%), var(--bg); }
    main { width: min(100%, 460px); padding: 36px 26px; text-align: center; border: 1px solid var(--border); border-radius: 22px; background: var(--card); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3); }
    svg { display: block; width: 88px; height: 88px; margin: 0 auto 18px; }
    h1 { margin: 0 0 10px; font-family: Unbounded, Manrope, system-ui, sans-serif; font-size: 1.45rem; line-height: 1.25; }
    p { margin: 0 0 26px; color: var(--muted); }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
    button, a { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 10px 20px; border-radius: 14px; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
    button { border: 1px solid rgba(190, 170, 255, 0.35); background: linear-gradient(115deg, #7446ea, #3d5ee8); color: #fff; }
    a { border: 1px solid var(--border); background: transparent; color: var(--text); }
    :focus-visible { outline: 2px solid var(--ring); outline-offset: 3px; }
</style>
</head>
<body>
<main>
    <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b69aff"/><stop offset="1" stop-color="#70edff"/></linearGradient></defs>
        <circle cx="50" cy="50" r="43" fill="none" stroke="url(#g)" stroke-width="6"/>
        <path d="M50 14 L58 50 L50 86 L42 50 Z" fill="url(#g)"/>
        <path d="M14 50 L50 42 L86 50 L50 58 Z" fill="url(#g)" opacity="0.55"/>
        <path d="M50 14 L58 50 L42 50 Z" fill="#ff6ad5"/>
        <circle cx="50" cy="50" r="6" fill="#0b1020" stroke="url(#g)" stroke-width="3"/>
    </svg>
    <h1 data-text="title">${OFFLINE_TEXTS.en.title}</h1>
    <p data-text="text">${OFFLINE_TEXTS.en.text}</p>
    <div class="actions">
        <button type="button" data-text="retry">${OFFLINE_TEXTS.en.retry}</button>
        <a href="${SCOPE}" data-text="home">${OFFLINE_TEXTS.en.home}</a>
    </div>
</main>
<script>
    (function () {
        var texts = ${JSON.stringify(OFFLINE_TEXTS)};
        function saved(key) {
            try { return JSON.parse(localStorage.getItem("aic:" + key)); } catch (error) { return null; }
        }
        var lang = String(new URLSearchParams(location.search).get("lang") || saved("language") || "").toLowerCase();
        if (lang !== "en" && lang !== "ru") lang = /^ru\\b/i.test(navigator.language || "") ? "ru" : "en";
        document.documentElement.lang = lang;
        document.querySelectorAll("[data-text]").forEach(function (element) {
            element.textContent = texts[lang][element.getAttribute("data-text")];
        });
        if (saved("theme") === "light") document.documentElement.setAttribute("data-theme", "light");
        document.querySelector("button").addEventListener("click", function () { location.reload(); });
    })();
</script>
</body>
</html>`;
    return new Response(html, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
