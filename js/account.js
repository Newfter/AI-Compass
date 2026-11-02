/* =========================================================
   AI COMPASS — ACCOUNTS (sign in with Google, progress saved online)
   The site works without an account, and keeps everything in the browser.
   With an account (a Google sign-in through Supabase, a free database
   service), the same progress is also saved online, so it follows the
   learner to any device, and the Knowledge Challenge (js/challenge.js) can
   put their best result on the leaderboard. This file:
     - shows the account button in the menu bar and the account window
       (sign in, the nickname other people see, sign out, delete the account);
     - signs in with Google and keeps the session between visits;
     - when a person signs in, merges the progress saved online with the
       progress of this browser (nothing is ever lost from either side);
     - afterwards saves the progress online a few seconds after every change,
       and writes a diary of results (events) for the dashboard;
     - offers A.account to the other features (section 12).
   Everything needs js/config.js to name the project (docs/ACCOUNTS-SETUP.md).
   Without it, this file only hides its button: the site is the same as before.
   The browser only ever holds the public "anon" key; who may read and write
   what is decided by the database itself (supabase/schema.sql).

   Sections of this file:
    1. Settings
    2. Small helpers
    3. The library (js/vendor/supabase.js) and the client
    4. The session: who is signed in
    5. Merging the progress of this browser with the saved one
    6. Saving the progress online (a few seconds after each change)
    7. The diary of results (events)
    8. The menu bar button
    9. The account window
   10. Sign in, sign out, delete
   11. Links, the Ctrl+K commands
   12. The public API (A.account)
   Every text (English and Russian) is in js/content/account.js
   ========================================================= */
(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const t = A.t;

    /* ---------- 1. Settings ---------- */
    const CONFIG = window.AICompassConfig || {};
    const URL = String(CONFIG.supabaseUrl || "").replace(/\/+$/, "");
    const ANON_KEY = String(CONFIG.supabaseAnonKey || "");
    const ENABLED = /^https?:\/\//.test(URL) && ANON_KEY.length > 8;

    const LIBRARY = "js/vendor/supabase.js";   // supabase-js, loaded only when accounts are on
    const AUTH_KEY = "aic-auth";                // where supabase-js keeps the session (localStorage)
    const SYNC_DELAY = 4000;                    // ms after the last change before the progress is saved online
    const RETRY_DELAY = 30000;                  // ms before a failed save is tried again
    const PUSH_MAX_CHARS = 200000;              // a saved value longer than this is not sent (the database refuses it too)
    const EVENT_BATCH = 2000;                   // ms: results that come together are sent in one request
    const QUEUE_MAX = 500;                      // results waiting to be sent while offline: the oldest go first
    const RELOAD_GUARD = 30000;                 // ms: the page reloads at most once per this, after a merge
    const STATUS_TICK = 60000;                  // ms: "saved 3 minutes ago" is redrawn this often
    const CLOSE_MS = 220;                       // the closing animation (css/account.css)
    const HASH = "#account";                    // a link ending in this opens the window

    // The results that go into the diary (the dashboard in My Compass shows them)
    const EVENT_TYPES = ["lesson.complete", "lesson.check", "quiz.finish", "daily.complete", "certificate.make",
        "lab.use", "lab.challenge", "flashcard.finish", "timeline.era"];

    // What this file keeps in the browser
    const STORE = {
        snapshot: "account.synced",     // { key: "the JSON text saved online last" }
        queue: "account.queue",         // the results waiting to be sent
        reloaded: "account.reloaded",   // (tab only) when the page last reloaded after a merge
        returnTo: "account.returnTo"    // (tab only) where to go after signing in
    };

    /* ---------- 2. Small helpers ---------- */
    function esc(text) {
        return A.escapeHTML(String(text));
    }

    function isObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function same(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    // The error code of a database call ("nickname_taken"), or its text
    function errorCode(error) {
        if (!error) return "";
        const message = String(error.message || error.error_description || error.msg || error);
        return /^[a-z_]+$/.test(message) ? message : message;
    }

    function online() {
        return navigator.onLine !== false;
    }

    // "just now", "5 minutes ago", "on 3 November 2026"
    function whenText(time) {
        const ago = Date.now() - time;
        if (ago < 90000) return t("account.when.now");
        if (ago < 3600000) return A.plural("account.when.minutes", Math.round(ago / 60000));
        if (ago < 86400000) return A.plural("account.when.hours", Math.round(ago / 3600000));
        return t("account.when.date", { date: A.format.date(time) });
    }

    // The ids of the lab experiments (their challenge progress is saved per experiment)
    function labIds() {
        return A.util.attempt(function () {
            return A.lab && typeof A.lab.list === "function" ? A.lab.list().map(function (e) { return e.id; }) : [];
        }, []);
    }

    /* ---------- 3. The library and the client ---------- */
    let client = null;          // the supabase-js client, once the library has loaded
    let clientLoading = null;   // the Promise of loading it
    let leaving = false;        // the page is closing: requests may outlive it (keepalive)

    // fetch, with "keepalive" while the page is closing, so the last save still arrives
    function fetchForClient(url, options) {
        const settings = Object.assign({}, options || {});
        if (leaving) settings.keepalive = true;
        return window.fetch(url, settings);
    }

    function loadClient() {
        if (client) return Promise.resolve(client);
        if (!ENABLED) return Promise.reject(new Error("accounts_off"));
        if (!clientLoading) {
            clientLoading = A.loadScript(LIBRARY).then(function () {
                const lib = window.supabase;
                if (!lib || typeof lib.createClient !== "function") throw new Error("library_missing");
                client = lib.createClient(URL, ANON_KEY, {
                    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: AUTH_KEY },
                    global: { fetch: fetchForClient }
                });
                return client;
            });
            clientLoading.catch(function () { clientLoading = null; });    // the next try loads again
        }
        return clientLoading;
    }

    // Calls a database function. Resolves with its result; rejects with an Error whose
    // message is the code ("not_signed_in", "nickname_taken" ...) or the text
    function rpc(name, args) {
        return loadClient().then(function (c) {
            return c.rpc(name, args || {}).then(function (result) {
                if (result.error) throw Object.assign(new Error(errorCode(result.error)), { status: result.status, raw: result.error });
                return result.data;
            });
        });
    }

    /* ---------- 4. The session: who is signed in ---------- */
    let user = null;            // { id, email, nickname, nicknameChosen } or null
    let session = null;         // the supabase-js session
    let signingIn = false;      // the Google page is opening

    function emitAccount(type, extra) {
        A.emit("account", Object.assign({ type: type, user: publicUser() }, extra || {}));
    }

    // What other features may know (no e-mail address)
    function publicUser() {
        return user ? { id: user.id, nickname: user.nickname, nicknameChosen: user.nicknameChosen } : null;
    }

    function watchAuth() {
        return loadClient().then(function (c) {
            c.auth.onAuthStateChange(function (event, newSession) {
                if (event === "SIGNED_OUT" || !newSession) {
                    const was = Boolean(user);
                    session = null;
                    becomeNobody();
                    if (was) emitAccount("signout");
                    return;
                }
                const first = !session || session.user.id !== newSession.user.id;
                session = newSession;
                if (first) becomeUser(newSession);
            });
        });
    }

    // Somebody signed in (now, or on an earlier visit): their profile, the merge, the saving
    function becomeUser(newSession) {
        const authUser = newSession.user;
        user = { id: authUser.id, email: authUser.email || "", nickname: "", nicknameChosen: true };
        paintButton();
        return rpc("my_profile").then(function (profile) {
            if (!user || user.id !== profile.id) return;
            user.nickname = profile.nickname;
            user.nicknameChosen = Boolean(profile.nickname_chosen);
            paintButton();
            emitAccount("signin");
            const fresh = takeReturn();
            if (fresh.justSignedIn) {
                if (user.nicknameChosen) A.toast(t("account.toast.signedIn", { name: user.nickname }), "👤");
                else A.toast(t("account.toast.welcome"), "👋");
            }
            return mergeProgress().then(function (merged) {
                if (!user) return;
                startSaving();
                flushEvents();
                if (merged.reload) {
                    A.storage.session.set(STORE.reloaded, Date.now());
                    A.storage.session.set(STORE.returnTo, fresh.returnTo || "");
                    A.storage.session.set("account.mergedToast", true);
                    window.location.reload();
                    return;
                }
                if (A.storage.session.get("account.mergedToast", false)) {
                    A.storage.session.remove("account.mergedToast");
                    A.toast(t("account.toast.merged"), "☁️");
                }
                arrive(fresh.returnTo, fresh.justSignedIn);
            });
        }).catch(function (error) {
            A.util.attempt(function () { console.warn("AI Compass accounts:", error); });
            paintButton();
            refreshWindow();
        });
    }

    function becomeNobody() {
        user = null;
        stopSaving();
        paintButton();
        refreshWindow();
    }

    // Did the page just come back from Google? The address had ?code=, or the tab remembers
    function takeReturn() {
        const returnTo = A.storage.session.get(STORE.returnTo, null);
        A.storage.session.remove(STORE.returnTo);
        return { justSignedIn: returnTo !== null, returnTo: returnTo || "" };
    }

    // Where the page goes once the profile is known. returnTo is where the sign-in started:
    // a section ("#challenge") is shown, or a window's link ("#journey") opens My Compass.
    // Going to a section closes every window, so the nickname prompt of a first sign-in
    // comes after it, and My Compass waits until the nickname is chosen (the prompt first).
    function arrive(returnTo, justSignedIn) {
        const id = String(returnTo || "").replace(/^#/, "");
        A.ready(function () {
            if (!user) return;
            const ok = /^[a-z][a-z0-9-]*$/.test(id);
            const section = ok && document.getElementById(id);
            if (section) A.navigate(id);
            if (justSignedIn && !user.nicknameChosen) openWindow(null, { chooseName: true });
            else if (ok && !section && !window.location.hash) window.location.hash = "#" + id;
            else if (justSignedIn && window.location.hash === HASH) openWindow(null);
            refreshWindow();
        });
    }

    /* ---------- 5. Merging the progress of this browser with the saved one ----------
       Each saved key has its own rule, so that a lesson finished on the phone and
       another on the laptop both count. The merged value goes to this browser and
       online. When a key other than My Compass changed in this browser, the page
       reloads once, because the lessons, the quiz and the glossary read their
       progress when they start. */
    function unionList(a, b) {
        const out = [];
        [].concat(Array.isArray(a) ? a : [], Array.isArray(b) ? b : []).forEach(function (item) {
            if (out.indexOf(item) === -1) out.push(item);
        });
        return out;
    }

    function laterDate(a, b) {
        return String(a || "") >= String(b || "") ? a : b;
    }

    // quiz.bests: { v, modes: { classic: { points, correct, total, date } }, lessons: { "3": {...} } }
    function mergeBests(local, saved) {
        if (!isObject(saved)) return local;
        if (!isObject(local)) return saved;
        const out = { v: 1, modes: {}, lessons: {} };
        ["modes", "lessons"].forEach(function (part) {
            const a = isObject(local[part]) ? local[part] : {};
            const b = isObject(saved[part]) ? saved[part] : {};
            Object.keys(a).concat(Object.keys(b)).forEach(function (id) {
                if (!(id in a)) { out[part][id] = b[id]; return; }
                if (!(id in b)) { out[part][id] = a[id]; return; }
                const pa = Number(a[id] && a[id].points) || 0;
                const pb = Number(b[id] && b[id].points) || 0;
                out[part][id] = pa > pb ? a[id] : pb > pa ? b[id] : (laterDate(a[id].date, b[id].date) === a[id].date ? a[id] : b[id]);
            });
        });
        return out;
    }

    // quiz.daily: { v, last, correct, total, marks, streak, best, days }: the newer day wins,
    // the records are the higher of the two
    function mergeDaily(local, saved) {
        if (!isObject(saved)) return local;
        if (!isObject(local)) return saved;
        const newer = laterDate(local.last, saved.last) === local.last ? local : saved;
        const out = Object.assign({}, newer);
        out.best = Math.max(Number(local.best) || 0, Number(saved.best) || 0);
        out.days = Math.max(Number(local.days) || 0, Number(saved.days) || 0);
        return out;
    }

    // { v, items: { q7: { box, due } } } (quiz mistakes) and
    // { v, cards: { pixel: { box, due } }, newToday } (flashcards): the card reviewed later wins
    function mergeBoxes(part) {
        return function (local, saved) {
            if (!isObject(saved)) return local;
            if (!isObject(local)) return saved;
            const out = Object.assign({}, local);
            const a = isObject(local[part]) ? local[part] : {};
            const b = isObject(saved[part]) ? saved[part] : {};
            const items = {};
            Object.keys(a).concat(Object.keys(b)).forEach(function (id) {
                if (!(id in a)) { items[id] = b[id]; return; }
                if (!(id in b)) { items[id] = a[id]; return; }
                const da = a[id] && a[id].due, db = b[id] && b[id].due;
                items[id] = (typeof da === "number" && typeof db === "number" ? da >= db : laterDate(da, db) === da) ? a[id] : b[id];
            });
            out[part] = items;
            return out;
        };
    }

    // lab.<id>.challenges: { v, total, done: [] }
    function mergeChallenges(local, saved) {
        if (!isObject(saved)) return local;
        if (!isObject(local)) return saved;
        return { v: 1, total: Math.max(Number(local.total) || 0, Number(saved.total) || 0), done: unionList(local.done, saved.done) };
    }

    // The My Compass progress: the one with more XP is the base; what the other one earned
    // (awards, badges, active days) is added, with the base reward of each award key.
    function mergeJourney(local, saved) {
        if (!isObject(saved)) return local;
        if (!isObject(local)) return saved;
        const base = (Number(local.xp) || 0) >= (Number(saved.xp) || 0) ? local : saved;
        const other = base === local ? saved : local;
        const out = JSON.parse(JSON.stringify(base));
        out.awarded = isObject(out.awarded) ? out.awarded : {};
        out.badges = isObject(out.badges) ? out.badges : {};
        out.days = isObject(out.days) ? out.days : {};
        out.best = isObject(out.best) ? out.best : {};
        out.facts = isObject(out.facts) ? out.facts : {};
        const rules = A.util.attempt(function () { return A.content.get("journey").rules; }, null) || {};
        let extra = 0;
        Object.keys(isObject(other.awarded) ? other.awarded : {}).forEach(function (key) {
            const count = Number(other.awarded[key]) || 0;
            if (key in out.awarded) {
                out.awarded[key] = Math.max(out.awarded[key], count);
                return;
            }
            out.awarded[key] = count;
            const kind = key.split(/[:@]/)[0];
            const rule = rules[kind] || (kind === "quiz" ? rules.quiz : null);
            if (rule && rule.xp) extra += rule.xp * (rule.perDay ? Math.min(count, rule.perDay) : 1);
        });
        out.xp = (Number(out.xp) || 0) + extra;
        Object.keys(isObject(other.badges) ? other.badges : {}).forEach(function (id) {
            out.badges[id] = id in out.badges ? (laterDate(out.badges[id], other.badges[id]) === out.badges[id] ? other.badges[id] : out.badges[id]) : other.badges[id];
        });
        Object.keys(isObject(other.days) ? other.days : {}).forEach(function (day) {
            out.days[day] = Math.max(Number(out.days[day]) || 0, Number(other.days[day]) || 0);
        });
        Object.keys(isObject(other.best) ? other.best : {}).forEach(function (key) {
            out.best[key] = Math.max(Number(out.best[key]) || 0, Number(other.best[key]) || 0);
        });
        Object.keys(isObject(other.facts) ? other.facts : {}).forEach(function (key) {
            out.facts[key] = Math.max(Number(out.facts[key]) || 0, Number(other.facts[key]) || 0);
        });
        out.active = Math.max(Number(out.active) || 0, Number(other.active) || 0);
        if (isObject(other.streak) && isObject(out.streak) && laterDate(other.streak.last, out.streak.last) === other.streak.last && other.streak.last !== out.streak.last) {
            out.streak = Object.assign({}, other.streak);
        }
        return out;
    }

    // Every saved key that follows the learner, with its merge rule
    function trackedKeys() {
        const keys = {
            "lessons.completed": unionList,
            "glossary.explored": unionList,
            "lab.tried": unionList,
            "quiz.bests": mergeBests,
            "quiz.daily": mergeDaily,
            "quiz.mistakes": mergeBoxes("items"),
            "glossary.cards": mergeBoxes("cards"),
            "journey": mergeJourney
        };
        labIds().forEach(function (id) { keys["lab." + id + ".challenges"] = mergeChallenges; });
        return keys;
    }

    // Reads the saved rows, merges each key, writes the results. Resolves { reload }
    function mergeProgress() {
        return loadClient().then(function (c) {
            return c.from("user_progress").select("key,value,updated_at");
        }).then(function (result) {
            if (result.error) throw new Error(errorCode(result.error));
            const saved = {};
            (result.data || []).forEach(function (row) { saved[row.key] = row.value; });
            const rules = trackedKeys();
            const snapshot = {};
            const toPush = [];
            let reload = false;
            let journeyMerged = null;
            Object.keys(rules).forEach(function (key) {
                const local = A.storage.get(key, undefined);
                const online = key in saved ? saved[key] : undefined;
                let merged;
                if (online === undefined) merged = local;
                else if (local === undefined) merged = online;
                else merged = rules[key](local, online);
                if (merged === undefined) return;
                if (!same(merged, local)) {
                    if (key === "journey") journeyMerged = merged;
                    else {
                        A.storage.set(key, merged);
                        reload = true;
                    }
                }
                if (!same(merged, online)) toPush.push({ key: key, value: merged });
                snapshot[key] = JSON.stringify(merged);
            });
            if (journeyMerged) {
                const ok = A.util.attempt(function () {
                    return A.journey && A.journey.import(Object.assign({ app: "ai-compass-journey" }, journeyMerged)).ok;
                }, false);
                if (!ok) {
                    // My Compass refused the merged progress: this browser's stays, and goes online
                    const local = A.storage.get("journey", undefined);
                    snapshot.journey = JSON.stringify(local);
                    toPush.forEach(function (row, i) { if (row.key === "journey") toPush[i] = { key: "journey", value: local }; });
                }
            }
            A.storage.set(STORE.snapshot, snapshot);
            // Nothing new in this browser since the last reload: never reload twice in a row
            const lastReload = A.storage.session.get(STORE.reloaded, 0);
            if (reload && Date.now() - lastReload < RELOAD_GUARD) reload = false;
            return push(toPush).then(function () { return { reload: reload }; }, function () { return { reload: reload }; });
        });
    }

    /* ---------- 6. Saving the progress online ---------- */
    let syncTimer = 0;
    let syncing = false;
    let saveState = { status: "never", time: 0 };    // status: never | saving | ok | offline | failed
    let statusTimer = 0;

    function setSaveState(status) {
        saveState = { status: status, time: status === "ok" ? Date.now() : saveState.time };
        refreshWindow();
    }

    function startSaving() {
        if (!statusTimer) statusTimer = setInterval(refreshWindow, STATUS_TICK);
    }

    function stopSaving() {
        clearTimeout(syncTimer);
        syncTimer = 0;
        clearInterval(statusTimer);
        statusTimer = 0;
        saveState = { status: "never", time: 0 };
    }

    function saveSoon(delay) {
        if (!user) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(saveNow, delay === undefined ? SYNC_DELAY : delay);
    }

    // The keys whose value changed since they were last saved online
    function changedRows() {
        const snapshot = A.storage.get(STORE.snapshot, {});
        const rows = [];
        Object.keys(trackedKeys()).forEach(function (key) {
            const value = A.storage.get(key, undefined);
            if (value === undefined) return;
            const text = JSON.stringify(value);
            if (text.length > PUSH_MAX_CHARS || snapshot[key] === text) return;
            rows.push({ key: key, value: value });
        });
        return rows;
    }

    // Sends rows to user_progress and remembers what was sent
    function push(rows) {
        if (!rows.length || !user) return Promise.resolve(true);
        return loadClient().then(function (c) {
            const sent = rows.map(function (row) { return { user_id: user.id, key: row.key, value: row.value }; });
            return c.from("user_progress").upsert(sent, { onConflict: "user_id,key" });
        }).then(function (result) {
            if (result.error) throw new Error(errorCode(result.error));
            const snapshot = A.storage.get(STORE.snapshot, {});
            rows.forEach(function (row) { snapshot[row.key] = JSON.stringify(row.value); });
            A.storage.set(STORE.snapshot, snapshot);
            return true;
        });
    }

    function saveNow() {
        clearTimeout(syncTimer);
        syncTimer = 0;
        if (!user || syncing) return Promise.resolve(false);
        const rows = changedRows();
        if (!rows.length) {
            if (saveState.status !== "ok") setSaveState(online() ? "ok" : "offline");
            return Promise.resolve(true);
        }
        if (!online()) {
            setSaveState("offline");
            return Promise.resolve(false);
        }
        syncing = true;
        setSaveState("saving");
        return push(rows).then(function () {
            syncing = false;
            setSaveState("ok");
            emitAccount("saved");
            return true;
        }, function () {
            syncing = false;
            setSaveState(online() ? "failed" : "offline");
            saveSoon(RETRY_DELAY);
            return false;
        });
    }

    /* ---------- 7. The diary of results (events) ---------- */
    let eventTimer = 0;
    let flushing = false;

    function queueEvent(activity) {
        if (EVENT_TYPES.indexOf(activity.type) === -1) return;
        const queue = A.storage.get(STORE.queue, []);
        const list = Array.isArray(queue) ? queue : [];
        list.push({ type: activity.type, detail: activity.detail || {}, at: new Date(activity.time || Date.now()).toISOString() });
        while (list.length > QUEUE_MAX) list.shift();
        A.storage.set(STORE.queue, list);
        clearTimeout(eventTimer);
        eventTimer = setTimeout(flushEvents, EVENT_BATCH);
    }

    function flushEvents() {
        clearTimeout(eventTimer);
        eventTimer = 0;
        if (!user || flushing || !online()) return Promise.resolve(false);
        const queue = A.storage.get(STORE.queue, []);
        if (!Array.isArray(queue) || !queue.length) return Promise.resolve(true);
        flushing = true;
        const batch = queue.slice(0, 50);
        return loadClient().then(function (c) {
            return c.from("events").insert(batch.map(function (e) { return { user_id: user.id, type: e.type, detail: e.detail, at: e.at }; }));
        }).then(function (result) {
            flushing = false;
            if (result.error) {
                // A result the database refuses (an unknown type) would block the rest: drop it
                if (result.status >= 400 && result.status < 500 && result.status !== 401) {
                    A.storage.set(STORE.queue, A.storage.get(STORE.queue, []).slice(batch.length));
                }
                return false;
            }
            const rest = A.storage.get(STORE.queue, []);
            A.storage.set(STORE.queue, Array.isArray(rest) ? rest.slice(batch.length) : []);
            if (rest.length > batch.length) flushEvents();
            return true;
        }, function () {
            flushing = false;
            return false;
        });
    }

    /* ---------- 8. The menu bar button ---------- */
    const button = document.getElementById("account-toggle");
    const quick = document.getElementById("account-quick");

    function setUpButton() {
        if (!ENABLED) return;
        [button, quick].forEach(function (element) {
            if (!element) return;
            element.setAttribute("aria-haspopup", "dialog");
            element.setAttribute("aria-expanded", "false");
            element.addEventListener("click", function () { openWindow(element); });
            element.hidden = false;
        });
        paintButton();
    }

    function paintButton() {
        if (!ENABLED) return;
        const name = user ? (user.nickname || "…") : "";
        const label = user ? t("account.navLabelIn", { name: name }) : t("account.navLabelOut");
        if (button) {
            button.classList.toggle("is-signed-in", Boolean(user));
            A.dom.setAttr(button, "aria-label", label);
            A.dom.setAttr(button, "title", label);
            const badge = button.querySelector(".ac-nav-letter");
            if (badge) A.dom.setText(badge, user ? name.charAt(0).toUpperCase() : "");
        }
        if (quick) {
            const text = quick.querySelector(".ac-quick-text");
            if (text) A.dom.setText(text, user ? name : t("account.navSignIn"));
        }
    }

    /* ---------- 9. The account window ---------- */
    let ui = null;              // the window's parts, once built
    let overlay = null;         // its record in A.overlays
    let win = { open: false, opener: null, timer: 0 };
    let deletePress = null;
    let nameMessage = "";       // under the nickname field: "", "saved", "invalid", "taken", "failed"
    let signInMessage = "";     // "", "offline", "failed"

    const ICONS = {
        user: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        close: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
        google: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853"/><path d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.5H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.5l3.3-2.6z" fill="#FBBC05"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6z" fill="#EA4335"/></svg>',
        check: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        cloud: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5 4 4 0 0 1 17.5 18H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
        warning: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3l10 18H2L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v5M12 18v.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
    };

    function mount() {
        let box = document.querySelector('[data-feature="account"]');
        if (!box) {
            box = document.createElement("div");
            box.setAttribute("data-feature", "account");
            document.body.appendChild(box);
        }
        return box;
    }

    function build() {
        if (ui) return ui;
        const root = A.dom.fromHTML(
            '<div class="st-layer ac-layer" hidden>' +
                '<section class="st-panel ac-panel" role="dialog" aria-modal="true" aria-labelledby="ac-title" aria-describedby="ac-intro">' +
                    '<header class="st-head">' +
                        '<span class="st-head-icon" aria-hidden="true">' + ICONS.user + "</span>" +
                        '<div class="st-head-text">' +
                            '<p class="st-kicker" data-i18n="account.kicker"></p>' +
                            '<h2 class="st-title" id="ac-title" tabindex="-1" data-i18n="account.title"></h2>' +
                        "</div>" +
                        '<button type="button" class="st-close" data-action="close" data-i18n-attr="aria-label:account.close,title:account.close">' +
                            '<kbd class="st-close-key" aria-hidden="true">Esc</kbd>' + ICONS.close + "</button>" +
                    "</header>" +
                    '<div class="st-body ac-body" data-ref="body"></div>' +
                "</section>" +
            "</div>"
        );
        mount().appendChild(root);
        ui = { layer: root, panel: root.querySelector(".ac-panel"), title: root.querySelector("#ac-title"), body: root.querySelector("[data-ref=body]") };
        root.addEventListener("mousedown", function (event) {
            if (event.target === root) closeWindow();
        });
        root.addEventListener("click", onClick);
        root.addEventListener("submit", onSubmit);
        overlay = A.overlays.register("account", {
            root: root,
            element: ui.panel,
            modal: true,
            holdFocus: function () { ui.title.focus({ preventScroll: true }); },
            close: function () { closeWindow(); }
        });
        A.applyTranslations(root);
        return ui;
    }

    // The window's contents: signed out, or signed in
    function render(options) {
        if (!ui) return;
        const focusName = document.activeElement && ui.layer.contains(document.activeElement) ? document.activeElement.getAttribute("data-focus") : null;
        let html;
        if (!user) {
            html = '<p class="st-intro" id="ac-intro" data-i18n="account.out.intro"></p>' +
                '<div class="ac-signin">' +
                    '<button type="button" class="btn btn-primary ac-google" data-action="signin" data-focus="signin"' + (signingIn ? " disabled" : "") + ">" +
                        ICONS.google + '<span data-i18n="' + (signingIn ? "account.out.working" : "account.out.button") + '"></span></button>' +
                    (signInMessage ? '<p class="st-note is-problem ac-problem" role="alert">' + ICONS.warning + '<span data-i18n="account.out.' + signInMessage + '"></span></p>' : "") +
                "</div>" +
                '<section class="st-group" aria-labelledby="ac-what">' +
                    '<h3 class="st-group-title" id="ac-what" data-i18n="account.out.what"></h3>' +
                    '<ul class="ac-list">' +
                        '<li>' + ICONS.check + '<span data-i18n="account.out.what1"></span></li>' +
                        '<li>' + ICONS.check + '<span data-i18n="account.out.what2"></span></li>' +
                        '<li>' + ICONS.check + '<span data-i18n="account.out.what3"></span></li>' +
                    "</ul>" +
                "</section>" +
                '<p class="st-privacy ac-privacy">' + ICONS.cloud + '<span data-i18n="account.out.privacy"></span></p>' +
                '<p class="st-hint" data-i18n="account.out.noAccount"></p>';
        } else {
            const chosen = user.nicknameChosen;
            html = '<p class="st-intro ac-hello" id="ac-intro">' + ICONS.check + '<span><strong data-i18n="account.in.hello"></strong> ' +
                    '<span class="ac-email">' + esc(t("account.in.email", { email: user.email })) + "</span></span></p>" +
                '<form class="st-group ac-name" data-ref="nameForm" novalidate>' +
                    '<label class="st-group-title" for="ac-nickname" data-i18n="account.in.nickname"></label>' +
                    (chosen ? "" : '<p class="st-hint ac-choose" data-i18n="account.in.nicknameChoose"></p>') +
                    '<div class="ac-name-row">' +
                        '<input class="ac-input" id="ac-nickname" data-ref="name" data-focus="name" type="text" autocomplete="nickname" maxlength="20" spellcheck="false" value="' + esc(user.nickname) + '">' +
                        '<button type="submit" class="btn btn-primary btn-small" data-focus="savename"><span data-i18n="account.in.save"></span></button>' +
                    "</div>" +
                    '<p class="st-hint" data-i18n="account.in.nicknameHint"></p>' +
                    '<p class="st-note ac-name-note' + (nameMessage && nameMessage !== "saved" ? " is-problem" : "") + '" data-ref="nameNote" role="status"' + (nameMessage ? "" : " hidden") + ">" +
                        (nameMessage ? '<span data-i18n="account.in.' + (nameMessage === "saved" ? "saved" : "nickname" + nameMessage.charAt(0).toUpperCase() + nameMessage.slice(1)) + '"></span>' : "") +
                    "</p>" +
                "</form>" +
                '<section class="st-group" aria-labelledby="ac-sync-title">' +
                    '<h3 class="st-group-title" id="ac-sync-title" data-i18n="account.in.sync"></h3>' +
                    '<p class="ac-sync' + (saveState.status === "failed" ? " is-problem" : "") + '" data-ref="sync">' + ICONS.cloud + "<span>" + esc(syncText()) + "</span></p>" +
                    '<div class="st-foot-buttons ac-buttons">' +
                        '<button type="button" class="btn btn-ghost btn-small" data-action="save" data-focus="save"' + (saveState.status === "saving" ? " disabled" : "") + '><span data-i18n="account.in.syncButton"></span></button>' +
                        '<button type="button" class="btn btn-ghost btn-small" data-action="compass" data-focus="compass"><span data-i18n="account.in.compass"></span></button>' +
                        '<button type="button" class="btn btn-ghost btn-small" data-action="challenge" data-focus="challenge"><span data-i18n="account.in.challenge"></span></button>' +
                    "</div>" +
                "</section>" +
                '<section class="st-group ac-leave">' +
                    '<div class="st-foot-buttons ac-buttons">' +
                        '<button type="button" class="btn btn-ghost btn-small" data-action="signout" data-focus="signout"><span data-i18n="account.in.signOut"></span></button>' +
                    "</div>" +
                    '<p class="st-hint" data-i18n="account.in.signOutNote"></p>' +
                "</section>" +
                '<section class="st-group ac-danger">' +
                    '<div class="st-foot-buttons ac-buttons">' +
                        '<button type="button" class="btn btn-ghost btn-small ac-delete" data-ref="delete" data-focus="delete"><span data-ref="deleteLabel" data-i18n="account.in.danger"></span></button>' +
                    "</div>" +
                    '<p class="st-hint" data-i18n="account.in.dangerNote"></p>' +
                "</section>";
        }
        ui.body.innerHTML = html;
        A.applyTranslations(ui.body);
        ui.body.querySelectorAll("[data-ref]").forEach(function (element) { ui[element.getAttribute("data-ref")] = element; });
        if (user && ui.delete) setUpDelete();
        if (options && options.chooseName && ui.name) {
            ui.name.focus({ preventScroll: true });
            ui.name.select();
        } else if (focusName) {
            const again = ui.body.querySelector('[data-focus="' + focusName + '"]');
            if (again) again.focus({ preventScroll: true });
            else if (!ui.layer.contains(document.activeElement)) ui.title.focus({ preventScroll: true });
        }
    }

    function syncText() {
        switch (saveState.status) {
            case "saving": return t("account.in.syncNow");
            case "ok": return t("account.in.syncOk", { when: whenText(saveState.time) });
            case "offline": return t("account.in.syncOffline");
            case "failed": return t("account.in.syncFailed");
            default: return t("account.in.syncNever");
        }
    }

    function refreshWindow() {
        if (ui && win.open) render();
    }

    function setUpDelete() {
        deletePress = A.confirmPress(ui.delete, {
            onArm: function () {
                ui.delete.classList.add("is-armed");
                ui.deleteLabel.setAttribute("data-i18n", "account.in.dangerAsk");
                ui.deleteLabel.textContent = t("account.in.dangerAsk");
                A.announce(t("account.in.dangerAsk"));
            },
            onDisarm: function () {
                if (!ui.delete.isConnected) return;
                ui.delete.classList.remove("is-armed");
                ui.deleteLabel.setAttribute("data-i18n", "account.in.danger");
                ui.deleteLabel.textContent = t("account.in.danger");
            },
            onConfirm: deleteAccount
        });
    }

    function onClick(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;
        const action = target.getAttribute("data-action");
        if (action === "close") closeWindow();
        else if (action === "signin") signIn();
        else if (action === "signout") signOut();
        else if (action === "save") saveNow();
        else if (action === "compass") {
            closeWindow(true);
            if (A.journey) A.journey.open();
        } else if (action === "challenge") {
            closeWindow(true);
            A.navigate("challenge");
        }
    }

    function onSubmit(event) {
        if (!ui || !ui.nameForm || event.target !== ui.nameForm) return;
        event.preventDefault();
        setNickname(ui.name.value);
    }

    function openWindow(opener, options) {
        if (!ENABLED) return Promise.resolve(false);
        build();
        if (win.open) {
            render(options);
            ui.title.focus({ preventScroll: true });
            return Promise.resolve(true);
        }
        clearTimeout(win.timer);
        win.open = true;
        const active = opener || document.activeElement;
        if (!ui.layer.contains(active)) win.opener = active && active !== document.body ? active : null;
        [button, quick].forEach(function (b) { if (b) b.setAttribute("aria-expanded", "true"); });
        nameMessage = "";
        render();
        ui.layer.hidden = false;
        ui.layer.classList.remove("is-closing");
        ui.body.scrollTop = 0;
        overlay.opened();
        A.dom.replay(ui.layer, "is-open");
        if (options && options.chooseName && ui.name) {
            ui.name.focus({ preventScroll: true });
            ui.name.select();
        } else {
            ui.title.focus({ preventScroll: true });
        }
        return Promise.resolve(true);
    }

    // keepFocus: the caller moves the focus somewhere else
    function closeWindow(keepFocus) {
        if (!win.open) return;
        win.open = false;
        if (deletePress) deletePress.disarm();
        [button, quick].forEach(function (b) { if (b) b.setAttribute("aria-expanded", "false"); });
        ui.layer.classList.remove("is-open");
        ui.layer.classList.add("is-closing");
        const opener = win.opener;
        win.opener = null;
        overlay.closed(keepFocus ? null : function () { giveFocusBack(opener); });
        if (window.location.hash === HASH) {
            A.util.attempt(function () { history.replaceState(history.state, "", window.location.pathname + window.location.search); });
        }
        win.timer = setTimeout(function () {
            if (win.open) return;
            ui.layer.hidden = true;
            ui.layer.classList.remove("is-closing");
        }, A.motion.ok() ? CLOSE_MS : 0);
    }

    function giveFocusBack(target) {
        if (target && target.isConnected && typeof target.focus === "function" && !target.closest("[inert], [hidden]") && target.getClientRects().length > 0) {
            target.focus({ preventScroll: true });
        }
        const active = document.activeElement;
        if ((!active || active === document.body || ui.layer.contains(active)) && button && !button.hidden) {
            button.focus({ preventScroll: true });
        }
    }

    /* ---------- 10. Sign in, sign out, delete ---------- */
    // Opens Google's sign-in page. returnTo: a "#section" to show afterwards
    function signIn(returnTo) {
        if (!ENABLED || signingIn) return Promise.resolve(false);
        if (!online()) {
            signInMessage = "offline";
            refreshWindow();
            return Promise.resolve(false);
        }
        signingIn = true;
        signInMessage = "";
        refreshWindow();
        const target = typeof returnTo === "string" ? returnTo : "";
        A.storage.session.set(STORE.returnTo, target);
        return loadClient().then(function (c) {
            return c.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin + window.location.pathname,
                    queryParams: { prompt: "select_account" }
                }
            });
        }).then(function (result) {
            if (result.error) throw result.error;
            return true;      // the browser is leaving for Google
        }).catch(function () {
            signingIn = false;
            signInMessage = "failed";
            A.storage.session.remove(STORE.returnTo);
            refreshWindow();
            return false;
        });
    }

    function signOut() {
        if (!client) return Promise.resolve(false);
        return saveNow().then(function () {
            return client.auth.signOut();
        }).then(function () {
            A.storage.remove(STORE.snapshot);
            A.storage.remove(STORE.queue);
            A.toast(t("account.toast.signedOut"), "👋");
            return true;
        }, function () { return false; });
    }

    function setNickname(name) {
        if (!user) return Promise.resolve(false);
        return rpc("set_nickname", { name: String(name || "") }).then(function (result) {
            user.nickname = result.nickname;
            user.nicknameChosen = true;
            nameMessage = "saved";
            paintButton();
            refreshWindow();
            emitAccount("nickname");
            A.announce(t("account.in.saved"));
            return true;
        }, function (error) {
            const code = error.message;
            nameMessage = code === "nickname_taken" ? "taken" : code === "nickname_invalid" ? "invalid" : "failed";
            refreshWindow();
            return false;
        });
    }

    function deleteAccount() {
        if (!user) return Promise.resolve(false);
        return rpc("delete_my_account").then(function () {
            A.storage.remove(STORE.snapshot);
            A.storage.remove(STORE.queue);
            return client.auth.signOut().catch(function () {});
        }).then(function () {
            becomeNobody();
            closeWindow();
            A.toast(t("account.in.deleted"), "🗑️");
            return true;
        }, function () {
            A.toast(t("account.in.deleteFailed"), "⚠️");
            return false;
        });
    }

    /* ---------- 11. Links, the Ctrl+K commands ---------- */
    if (ENABLED) {
        A.keepOffline(LIBRARY);
        setUpButton();
        watchAuth().catch(function () {
            // The library didn't load (offline on a first visit): the button still opens the window,
            // which offers to try again
        });

        A.on("activity", function (activity) {
            if (!activity || typeof activity.type !== "string" || !user) return;
            queueEvent(activity);
            saveSoon();
        });

        // Leaving the page: what is waiting goes now
        function flush() {
            if (!user) return;
            leaving = true;
            saveNow();
            flushEvents();
            setTimeout(function () { leaving = false; }, 0);
        }
        window.addEventListener("pagehide", flush);
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) flush();
        });
        window.addEventListener("online", function () {
            if (!user) return;
            saveSoon(1000);
            flushEvents();
        });
        window.addEventListener("offline", function () {
            if (user) setSaveState("offline");
        });

        A.onLanguageChange(function () {
            paintButton();
            refreshWindow();
        });

        A.registerCommand({
            id: "account-open",
            group: "account.cmdGroup",
            icon: "👤",
            title: function () { return t(user ? "account.cmd.open" : "account.cmd.signIn"); },
            keywords: "account sign in login google profile nickname sign out logout аккаунт войти вход профиль ник выйти выход",
            run: function () { openWindow(button); }
        });

        function openFromLink() {
            if (window.location.hash === HASH) openWindow(button);
        }
        window.addEventListener("hashchange", openFromLink);
        A.ready(openFromLink);
    }

    /* ---------- 12. The public API ---------- */
    A.feature("account", {
        enabled: ENABLED,
        // The signed-in person: { id, nickname, nicknameChosen } or null (never the e-mail)
        user: publicUser,
        signedIn: function () { return Boolean(user); },
        // Opens Google's sign-in page; returnTo: a "#section" to show afterwards
        signIn: signIn,
        signOut: signOut,
        open: function (options) { return openWindow(document.activeElement, options); },
        setNickname: setNickname,
        // A database function (supabase/schema.sql); rejects with an Error whose message is the code
        rpc: rpc,
        // The supabase-js client (a Promise), for the features that read their own tables
        client: loadClient,
        // Saves the progress online now
        save: saveNow,
        // { status: "never" | "saving" | "ok" | "offline" | "failed", time }
        saveState: function () { return Object.assign({}, saveState); },
        // The diary of results, newest first (a Promise of rows { type, detail, at })
        history: function (limit) {
            if (!user) return Promise.resolve([]);
            return loadClient().then(function (c) {
                return c.from("events").select("type,detail,at").order("at", { ascending: false }).limit(limit || 200);
            }).then(function (result) {
                if (result.error) throw new Error(errorCode(result.error));
                return result.data || [];
            });
        },
        onChange: function (callback) {
            return A.on("account", callback);
        }
    });
})();
