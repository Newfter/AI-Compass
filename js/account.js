/* =========================================================
   AI COMPASS — ACCOUNTS: SIGN IN WITH GOOGLE, PROGRESS KEPT FOREVER
   The site works without an account and keeps everything in the browser.
   With an account (a Google sign-in through Supabase, a free database
   service) the same progress is also kept online: it follows the learner
   to every device and is not lost with the browser's storage. This file:
     - draws the online account at the top of Settings → Account. That is
       the ONE place for it: the menu bar button, the phone menu, links
       ending in #account, the Ctrl+K command, My Compass and the Knowledge
       Challenge all open it there (section 12);
     - signs in with Google and keeps the session between visits;
     - keeps ALL progress in sync (sections 4-7): a merge on every sign-in
       and every visit, then a save a few seconds after each change and
       when the tab is hidden or closed;
     - signs out the way the learner chooses (keep the progress on this
       device, or remove it: the safe choice on a shared computer);
     - invites a signed-out learner to sign in: one friendly prompt after
       real progress (at most once a week), and a quiet line next to the
       progress in My path and My Compass (section 12);
     - writes a diary of results (events) for the dashboard in My Compass.
   Everything needs js/config.js to name the project (docs/ACCOUNTS-SETUP.md).
   Without it this file does nothing at all: the site is the same as before.
   The browser only ever holds the public "anon" key; who may read and write
   what is decided by the database itself (supabase/schema.sql).

   HOW THE PROGRESS IS KEPT IN SYNC
   Online, every row of user_progress is { v: 2, e, d, t, r }: d the data,
   e its "epoch" (a number that goes up when the learner deliberately removes
   something), t the time of the learner's choice (only for choices), r the
   id of the removal that set e. Rows (section 5):
     - one row per kind of progress, with a rule that never loses work done
       on either device (section 4: union of finished items, the best score,
       the more advanced card, every learning day...);
     - "lab.challenges": the lab experiments' challenges, one row for all;
     - "prefs": the look, the language, the design, calm motion, the text
       sizes: the latest change wins (each choice keeps the time it was made);
     - "bundle": every other personal key, also of features added later:
       gaps are filled both ways; a key changed on this device since the last
       sync wins, one changed only on the other device is taken from there.
   The browser remembers what each row was when it was last synced
   ("account.synced"). That is how it knows what changed here since, and
   what changed online since (writes say "only if the row is still as I last
   saw it", so two devices or two tabs never write over each other: the
   second one reads again, merges again, writes again).
   A deliberate removal (Reset progress, Start over, a deleted note, a
   mistake cleared from "My mistakes", a key removed while signed in) is
   remembered ("account.pending") and sent with a higher epoch: "replace the
   online copy with this one" (a reset), or "without these items". A device
   that sees a higher epoch than it last synced keeps the online copy plus
   only what it did itself since its last sync, so a reset is never undone by
   an old copy on another device, and nothing new is lost either.
   Sign-out asks: keep the progress on this device, or remove it (the
   default). Removing waits until everything is saved online.

   Sections of this file:
    1. Settings
    2. Small helpers
    3. The library, the client and the database calls
    4. The merge rules
    5. What is synced: the rows of user_progress
    6. Noticing changes on this device
    7. Syncing: the merge, the save, the retries, the other tabs
    8. The session: who is signed in
    9. Sign in, sign out, delete, the nickname
   10. The diary of results (events)
   11. Settings → Account: the card
   12. The way in: the buttons, links and commands; the invitation; the lines
   13. Texts that change with accounts on, the start, the public API (A.account)
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
    const TABLE = URL + "/rest/v1/user_progress";
    const LOCK_NAME = "aic-account-sync";       // one sync at a time in this browser (Web Locks)
    const SYNC_DELAY = 4000;                    // ms after the last change before it is saved online
    const SYNC_LONGEST = 30000;                 // ms: a stream of changes is saved at least this often
    const RETRY_DELAYS = [5000, 20000, 60000, 180000];   // ms: a failed save is tried again after these
    const ROUNDS = 3;                           // a row that changed online meanwhile: read, merge, write again
    const PUSH_MAX_CHARS = 200000;              // a row longer than this stays on this device (the database takes 256 KB)
    const BUNDLE_ITEM_MAX = 50000;              // a key of the "bundle" longer than this stays on this device
    const SNAPSHOT_TEXT_MAX = 100000;           // longer synced texts are remembered as a fingerprint only
    const KEEPALIVE_MAX = 60000;                // characters sent while the page closes (browsers allow 64 KB)
    const RELOAD_GUARD = 30000;                 // ms: the page reloads at most once per this, after a merge
    const STATUS_TICK = 30000;                  // ms: "saved 3 minutes ago" is redrawn this often
    const EVENT_BATCH = 2000;                   // ms: results that come together are sent in one request
    const QUEUE_MAX = 500;                      // results waiting to be sent while offline: the oldest go first
    const BUSY_POLL = 2000;                     // ms: how often a waiting reload or invitation looks again
    const NUDGE_GAP = 7 * 86400000;             // the invitation comes back after a week at the earliest
    const NUDGE_DELAY = 1200;                   // ms after the progress (the celebration comes first)
    const TOAST_WAIT = 500;                     // ms: while a toast is on the screen the invitation looks again this often
    const QUIZ_QUIET = 120000;                  // ms after a quiz answer during which a game counts as running
    const HASH = "#account";                    // a link ending in this opens Settings → Account
    const DAY_STARTS_AT = 4;                    // like My Compass and My path: a day starts at 4 a.m.
    const JOURNEY_DAYS_KEPT = 42;               // js/journey.js keeps the XP of each day this long
    const LEARN_DAYS_KEPT = 400;                // js/learn.js lists the learning days this long
    const NOTEBOOK_MAX = 300;                   // entries in the research notebook (js/research.js)
    const MAX_XP = 1000000;                     // the limits of js/journey.js
    const MAX_COUNT = 100000;

    // The results that go into the diary (the dashboard in My Compass shows them;
    // supabase/schema.sql accepts exactly these)
    const EVENT_TYPES = ["lesson.complete", "lesson.check", "quiz.finish", "daily.complete", "certificate.make",
        "lab.use", "lab.challenge", "flashcard.finish", "timeline.era"];
    // Real progress: after it, a signed-out learner is invited to sign in
    const NUDGE_AFTER = ["lesson.complete", "learn.unit", "learn.test", "learn.review", "quiz.finish", "daily.complete"];
    // Windows in which the learner is doing a task: no reload while one is open
    const TASK_WINDOWS = ["learn-play", "flashcards", "classroom-quiz", "lesson-reader"];

    // What this file keeps in the browser (keys "account.*" are never synced)
    const STORE = {
        synced: "account.synced",       // { v, owner, learner, at, rows: { row: { e, u, h, s, l, t, r, lh } } }
        pending: "account.pending",     // { owner, rows: { row: { id, all } or { id, items } } }
        times: "account.times",         // { choice: when it was last changed on this device }
        queue: "account.queue",         // the results waiting to be sent
        nudge: "account.nudge",         // { n: progress seen, seen: n when last shown, at: when }
        leave: "account.leave",         // "remove" or "keep": the last sign-out choice on this device
        merged: "account.merged",       // { at, tab, print }: a merge changed this device's progress
        wiped: "account.wiped",         // { at, tab }: progress removed at sign-out (other tabs reload)
        reloaded: "account.reloaded",   // (tab only) when the page last reloaded after a merge
        returnTo: "account.returnTo",   // (tab only) where to go after signing in
        notice: "account.notice"        // (tab only) what to say after a reload
    };

    // Keys that belong to this device only, never synced: the account's own notes,
    // things in progress, the last tab or command used, Compass Bot's chat
    const DEVICE_ONLY = /^(?:account\.|assistant\.|challenge\.attempt$|invite$|pro\.timer$|research\.tab$|lab\.last$|palette\.recent$|probe$|effects\.calm$)/;
    const CHALLENGES_KEY = /^lab\.([a-z0-9][a-z0-9-]{0,40})\.challenges$/;
    // What stays on the device after "Remove my progress from this device": the look
    // and the language (not progress; the next person starts from the same screen)
    const SEED_KEYS = ["language", "theme", "palette", "settings", "motion.calm"];
    const SETTING_FIELDS = ["design", "fancy", "textSize", "lineSpacing", "easyFont", "underlineLinks",
        "contrast", "reduceTransparency", "speechRate"];

    const TAB = Math.random().toString(36).slice(2, 10);

    /* ---------- 2. Small helpers ---------- */
    function esc(text) {
        return A.escapeHTML(String(text));
    }

    function isObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    function has(object, key) {
        return isObject(object) && Object.prototype.hasOwnProperty.call(object, key);
    }

    function whole(value) {
        return Number.isInteger(value) && value >= 0;
    }

    function num(value) {
        return typeof value === "number" && isFinite(value) ? value : 0;
    }

    function keep(value) {
        return value;
    }

    // JSON with the names of every object sorted: the same value always gives the same text
    function stable(value) {
        if (value === undefined) return "";
        return JSON.stringify(value, function (name, part) {
            if (!isObject(part)) return part;
            const out = {};
            Object.keys(part).sort().forEach(function (key) { out[key] = part[key]; });
            return out;
        });
    }

    function sameValue(a, b) {
        return stable(a) === stable(b);
    }

    function parse(text) {
        try {
            return text === undefined || text === "" ? undefined : JSON.parse(text);
        } catch (error) {
            return undefined;
        }
    }

    // A short fingerprint of a text (53 bits): "has it changed?" without keeping the text
    function fingerprint(text) {
        let h1 = 0xdeadbeef ^ text.length;
        let h2 = 0x41c6ce57 ^ text.length;
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            h1 = Math.imul(h1 ^ code, 2654435761);
            h2 = Math.imul(h2 ^ code, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
    }

    function printOf(value) {
        return fingerprint(stable(value));
    }

    function newId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function online() {
        return navigator.onLine !== false;
    }

    function errorCode(error) {
        if (!error) return "";
        return String(error.message || error.error_description || error.msg || error);
    }

    function pad(number) {
        return (number < 10 ? "0" : "") + number;
    }

    // The learner's day (it starts at 4 a.m.), as days since 1970 (js/learn.js) ...
    function dayNumber(time) {
        const date = new Date(time - DAY_STARTS_AT * 3600000);
        return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
    }

    // ... and as "2026-01-15" (js/journey.js)
    function dayText(time) {
        const date = new Date(time - DAY_STARTS_AT * 3600000);
        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    }

    function dayOfText(text) {
        const parts = String(text).split("-");
        return Math.round(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) / 86400000);
    }

    // "just now", "5 minutes ago", "on 3 November 2026"
    function whenText(time) {
        const ago = Date.now() - time;
        if (ago < 90000) return t("account.when.now");
        if (ago < 3600000) return A.plural("account.when.minutes", Math.round(ago / 60000));
        if (ago < 86400000) return A.plural("account.when.hours", Math.round(ago / 3600000));
        return t("account.when.date", { date: A.format.date(time) });
    }

    // Every "aic:" key of this browser's storage, without the "aic:"
    function liveKeys() {
        const out = [];
        try {
            const store = window.localStorage;
            for (let i = 0; i < store.length; i++) {
                const name = store.key(i);
                if (name && name.indexOf("aic:") === 0) out.push(name.slice(4));
            }
        } catch (error) {
            // storage blocked: nothing to list
        }
        return out;
    }

    // The session supabase-js keeps between visits (read directly: it is known
    // before the library has loaded), or null
    function storedSession() {
        try {
            const value = JSON.parse(window.localStorage.getItem(AUTH_KEY) || "null");
            const inner = value && value.currentSession ? value.currentSession : value;
            return inner && inner.refresh_token && inner.user && inner.user.id ? inner : null;
        } catch (error) {
            return null;
        }
    }

    /* ---------- 3. The library, the client and the database calls ---------- */
    let client = null;          // the supabase-js client, once the library has loaded
    let clientLoading = null;   // the Promise of loading it
    let leaving = false;        // the page is hidden or closing: requests must outlive it (keepalive)

    // fetch, with "keepalive" while the page is closing, so the last request still arrives
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

    // A fresh access token (supabase-js renews an old one first)
    function token() {
        return loadClient().then(function (c) {
            return c.auth.getSession();
        }).then(function (result) {
            const current = result && result.data && result.data.session;
            if (!current || !user || current.user.id !== user.id) throw new Error("not_signed_in");
            session = current;
            return current.access_token;
        });
    }

    // One request to the table user_progress (PostgREST). Resolves { status, data }
    function rest(method, query, body, accessToken, keepalive) {
        const options = {
            method: method,
            headers: {
                apikey: ANON_KEY,
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json",
                Prefer: "return=representation"
            },
            cache: "no-store",
            keepalive: Boolean(keepalive)
        };
        if (body !== undefined) options.body = JSON.stringify(body);
        return window.fetch(TABLE + query, options).then(function (response) {
            return response.text().then(function (text) {
                return { status: response.status, data: parse(text) };
            });
        });
    }

    function failed(response) {
        const code = response.data && (response.data.code || response.data.message) ? String(response.data.code || response.data.message) : "";
        return Object.assign(new Error("http_" + response.status + (code ? "_" + code : "")), { status: response.status, code: code });
    }

    // An online row as this file reads it: { e, d, t, r, updated_at }
    function readEnvelope(row) {
        const value = row.value;
        if (isObject(value) && value.v === 2 && whole(value.e)) {
            return { e: value.e, d: value.d === undefined ? null : value.d, t: num(value.t), r: typeof value.r === "string" ? value.r : "", updated_at: row.updated_at };
        }
        return { e: 0, d: value, t: 0, r: "", updated_at: row.updated_at };     // a row written before envelopes
    }

    // Reads rows (keys: some of them; none: all). Resolves { key: row or null }
    function readRows(accessToken, keys) {
        let query = "?select=key,value,updated_at";
        if (keys) query += "&key=in." + encodeURIComponent("(" + keys.map(function (key) { return '"' + key + '"'; }).join(",") + ")");
        return rest("GET", query, undefined, accessToken, false).then(function (response) {
            if (response.status !== 200 || !Array.isArray(response.data)) throw failed(response);
            const out = {};
            if (keys) keys.forEach(function (key) { out[key] = null; });
            response.data.forEach(function (row) { out[row.key] = readEnvelope(row); });
            return out;
        });
    }

    // Writes one row only if it is still as last seen: a row that is there is changed
    // only while its updated_at is the same, a missing row is added only if nobody added
    // it meanwhile. Resolves { updated_at } or { conflict: true }
    function writeRow(accessToken, key, seen, value, keepalive) {
        const request = seen && seen.updated_at
            ? rest("PATCH", "?key=eq." + encodeURIComponent(key) + "&updated_at=eq." + encodeURIComponent(seen.updated_at),
                { value: value }, accessToken, keepalive)
            : rest("POST", "", { user_id: user.id, key: key, value: value }, accessToken, keepalive);
        return request.then(function (response) {
            if (response.status === 409) return { conflict: true };
            if (response.status === 200 || response.status === 201) {
                const row = Array.isArray(response.data) ? response.data[0] : null;
                return row && row.updated_at ? { updated_at: row.updated_at } : { conflict: true };
            }
            throw failed(response);
        });
    }

    /* ---------- 4. The merge rules ----------
       A rule says how two copies of one kind of progress become one, so that the
       work done on either device is never lost. a is this device's copy (it wins a tie).
         ok(value)           is this a value of that kind (anything else is left out)
         merge(a, b, ta, tb) the two copies together (ta, tb: when a choice was made)
         fresh(now, synced)  what "now" has that "synced" (the copy synced last time)
                             has not: only that survives a reset on another device
         drop(value, items)  the value without some items (a deliberate removal)
         items(value)        optional: the ids of its items (what drop takes)
         tidy(value)         optional: the value as the feature itself keeps it
         delta(cloud, now, synced)  optional, for counters: the online copy plus
                             what this device added since its last sync (XP) */
    function unionList(a, b, numeric) {
        const out = [];
        const seen = new Set();
        a.concat(b).forEach(function (item) {
            const id = typeof item + ":" + String(item);
            if (seen.has(id)) return;
            seen.add(id);
            out.push(item);
        });
        if (numeric) out.sort(function (x, y) { return x - y; });
        return out;
    }

    function wholeFresh(now, synced) {
        return sameValue(now, synced) ? undefined : now;
    }

    // A list of finished things: lessons, explored terms, tried experiments
    function listRule(numeric) {
        return {
            ok: Array.isArray,
            merge: function (a, b) { return unionList(a, b, numeric); },
            fresh: function (now, synced) {
                const old = new Set(synced.map(String));
                const out = now.filter(function (item) { return !old.has(String(item)); });
                return out.length ? out : undefined;
            },
            drop: function (value, items) {
                const gone = new Set(items.map(String));
                return value.filter(function (item) { return !gone.has(String(item)); });
            },
            items: function (value) { return value.map(String); }
        };
    }

    // A value with lists of items by id ({ v, items: { q7: ... } }). parts: { name: pick },
    // pick(a, b) chooses between the two copies of one item
    function itemsRule(parts, more) {
        const names = Object.keys(parts);
        const extra = more || {};
        function part(value, name) {
            return isObject(value[name]) ? value[name] : {};
        }
        return {
            ok: isObject,
            merge: function (a, b) {
                const out = Object.assign({}, b, a);
                names.forEach(function (name) {
                    const pa = part(a, name);
                    const merged = Object.assign({}, part(b, name));
                    Object.keys(pa).forEach(function (id) {
                        merged[id] = has(merged, id) ? parts[name](pa[id], merged[id]) : pa[id];
                    });
                    out[name] = merged;
                });
                if (extra.join) extra.join(out, a, b);
                return out;
            },
            fresh: function (now, synced) {
                let any = false;
                const out = Object.assign({}, now);
                names.forEach(function (name) {
                    const pn = part(now, name);
                    const ps = part(synced, name);
                    const kept = {};
                    Object.keys(pn).forEach(function (id) {
                        if (has(ps, id) && sameValue(pn[id], ps[id])) return;
                        kept[id] = pn[id];
                        any = true;
                    });
                    out[name] = kept;
                });
                return any ? out : undefined;
            },
            drop: function (value, items) {
                const out = Object.assign({}, value);
                names.forEach(function (name) {
                    const kept = Object.assign({}, part(value, name));
                    items.forEach(function (id) { delete kept[String(id)]; });
                    out[name] = kept;
                });
                return out;
            },
            items: function (value) {
                return unionList([], [].concat.apply([], names.map(function (name) { return Object.keys(part(value, name)); })), false);
            },
            tidy: extra.tidy
        };
    }

    function compareDue(a, b) {
        if (typeof a === "number" && typeof b === "number") return a - b;
        return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
    }

    // A card in a box (quiz mistakes, flashcards): the more advanced one
    function boxPick(a, b) {
        if (!isObject(a)) return b;
        if (!isObject(b)) return a;
        if (num(a.box) !== num(b.box)) return num(a.box) > num(b.box) ? a : b;
        return compareDue(a.due, b.due) >= 0 ? a : b;
    }

    // A My path card [box, due day, times seen, times right]: the more advanced one,
    // with the higher counts of the two
    function memoryPick(a, b) {
        if (!Array.isArray(a)) return b;
        if (!Array.isArray(b)) return a;
        const win = num(a[0]) !== num(b[0]) ? (num(a[0]) > num(b[0]) ? a : b) : (num(a[1]) >= num(b[1]) ? a : b);
        return [win[0], win[1], Math.max(num(a[2]), num(b[2])), Math.max(num(a[3]), num(b[3]))];
    }

    // The best game of a quiz mode or lesson: more points, or the later one
    function gamePick(a, b) {
        if (!isObject(a)) return b;
        if (!isObject(b)) return a;
        if (num(a.points) !== num(b.points)) return num(a.points) > num(b.points) ? a : b;
        return String(a.date || "") >= String(b.date || "") ? a : b;
    }

    // A finished guided step [first day, best first-try score, questions]
    function stepPick(a, b) {
        if (!Array.isArray(a)) return b;
        if (!Array.isArray(b)) return a;
        const best = num(a[1]) >= num(b[1]) ? a : b;
        return [Math.min(num(a[0]), num(b[0])), best[1], best[2]];
    }

    // A stage test [best right answers, questions, star, last day]
    function testPick(a, b) {
        if (!Array.isArray(a)) return b;
        if (!Array.isArray(b)) return a;
        const best = num(a[0]) !== num(b[0]) ? (num(a[0]) > num(b[0]) ? a : b) : (num(a[1]) >= num(b[1]) ? a : b);
        return [best[0], best[1], a[2] === true || b[2] === true, Math.max(num(a[3]), num(b[3]))];
    }

    // A lesson explained back [day, score 0-3, text]: the higher score, or the later one
    function explainPick(a, b) {
        if (!Array.isArray(a)) return b;
        if (!Array.isArray(b)) return a;
        if (num(a[1]) !== num(b[1])) return num(a[1]) > num(b[1]) ? a : b;
        return num(a[0]) >= num(b[0]) ? a : b;
    }

    // A day of My path { r, n, l, e, f }: everything done that day, on either device
    function dayPick(a, b) {
        if (!isObject(a)) return b;
        if (!isObject(b)) return a;
        const out = Object.assign({}, b);
        Object.keys(a).forEach(function (name) {
            if (a[name] || !out[name]) out[name] = a[name];
        });
        return out;
    }

    // My path's learning days: the days older than js/learn.js lists are only counted
    function tidyLearnDays(value) {
        const days = isObject(value.days) ? value.days : {};
        const oldest = dayNumber(Date.now()) - LEARN_DAYS_KEPT;
        let before = whole(value.before) ? value.before : 0;
        const kept = {};
        Object.keys(days).forEach(function (key) {
            const record = days[key];
            if (!whole(Number(key)) || !isObject(record)) return;
            if (Number(key) >= oldest) kept[key] = record;
            else if (record.r || record.n || record.l || record.e) before += 1;
        });
        return Object.assign({}, value, { v: 1, days: kept, before: before });
    }

    // The qualifying exam's better result: a bigger share right, then less time
    function examBetter(a, b) {
        const okA = isObject(a) && whole(a.right) && whole(a.total) && a.total > 0;
        const okB = isObject(b) && whole(b.right) && whole(b.total) && b.total > 0;
        if (!okA) return okB ? b : null;
        if (!okB) return a;
        const x = a.right * b.total;
        const y = b.right * a.total;
        if (x !== y) return x > y ? a : b;
        return num(a.seconds) <= num(b.seconds) ? a : b;
    }

    function laterRow(a, b) {
        if (!isObject(a)) return isObject(b) ? b : null;
        if (!isObject(b)) return a;
        return num(a.day) >= num(b.day) ? a : b;
    }

    function byTime(a, b) {
        return num(b.time) - num(a.time) || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0);
    }

    function entryTime(entry) {
        return Math.max(num(entry.edited), num(entry.time));
    }

    // ----- My Compass (js/journey.js): XP is a counter, so it is added, not merged -----
    function journeyRewards() {
        return A.util.attempt(function () { return A.content.get("journey").rules; }, null) || {};
    }

    function journeyShape(value) {
        const out = Object.assign({}, value);
        ["awarded", "badges", "days", "best", "facts"].forEach(function (name) {
            out[name] = isObject(value[name]) ? Object.assign({}, value[name]) : {};
        });
        out.xp = Math.min(MAX_XP, num(value.xp));
        out.active = Math.min(MAX_COUNT, num(value.active));
        return out;
    }

    // As js/journey.js keeps it: the XP of the last 6 weeks of days, today's daily limits
    function tidyJourney(value) {
        const out = journeyShape(value);
        const today = dayText(Date.now());
        const now = dayOfText(today);
        Object.keys(out.days).forEach(function (day) {
            if (!(now - dayOfText(day) < JOURNEY_DAYS_KEPT)) delete out.days[day];
        });
        Object.keys(out.awarded).forEach(function (key) {
            const at = key.indexOf("@");
            if (at !== -1 && key.slice(at + 1) !== today) delete out.awarded[key];
        });
        return out;
    }

    function laterStreak(a, b) {
        if (!isObject(b) || !b.last) return a;
        if (!isObject(a) || !a.last) return b;
        if (a.last !== b.last) return String(a.last) > String(b.last) ? a : b;
        return num(a.days) >= num(b.days) ? a : b;
    }

    // Two histories that never met (a first sync): the one with more XP is the base;
    // the rewards the other one earned and the base has not are added with their XP
    function mergeJourney(a, b) {
        const base = num(a.xp) >= num(b.xp) ? a : b;
        const other = base === a ? b : a;
        const out = journeyShape(base);
        const rewards = journeyRewards();
        const today = dayText(Date.now());
        let extra = 0;
        Object.keys(other.awarded).forEach(function (key) {
            const count = num(other.awarded[key]);
            if (has(out.awarded, key)) {
                out.awarded[key] = Math.max(num(out.awarded[key]), count);
                return;
            }
            out.awarded[key] = count;
            const at = key.indexOf("@");
            if (at !== -1 && key.slice(at + 1) !== today) return;
            const reward = rewards[key.split(/[:@]/)[0]];
            if (reward && reward.xp) extra += reward.xp * (reward.perDay ? Math.min(count, reward.perDay) : 1);
        });
        out.xp = Math.min(MAX_XP, out.xp + extra);
        Object.keys(other.days).forEach(function (day) {
            out.days[day] = Math.max(num(out.days[day]), num(other.days[day]));
        });
        Object.keys(other.badges).forEach(function (id) {
            if (!has(out.badges, id) || String(other.badges[id]) < String(out.badges[id])) out.badges[id] = other.badges[id];
        });
        ["best", "facts"].forEach(function (name) {
            Object.keys(other[name]).forEach(function (key) {
                out[name][key] = Math.max(num(out[name][key]), num(other[name][key]));
            });
        });
        out.active = Math.max(out.active, num(other.active));
        out.streak = laterStreak(out.streak, other.streak);
        if (isObject(out.streak) && num(out.best.streak) < num(out.streak.days)) out.best.streak = out.streak.days;
        return out;
    }

    // The online copy plus what this device earned since it last synced
    function deltaJourney(cloud, now, synced) {
        const out = journeyShape(cloud);
        out.xp = Math.min(MAX_XP, out.xp + Math.max(0, num(now.xp) - num(synced.xp)));
        Object.keys(now.awarded).forEach(function (key) {
            const count = num(now.awarded[key]);
            if (has(synced.awarded, key) && count <= num(synced.awarded[key])) return;
            out.awarded[key] = Math.max(num(out.awarded[key]), count);
        });
        let newDays = 0;
        Object.keys(now.days).forEach(function (day) {
            const added = num(now.days[day]) - num(synced.days[day]);
            if (added <= 0) return;
            if (!(num(synced.days[day]) > 0) && !(num(out.days[day]) > 0)) newDays += 1;
            out.days[day] = Math.min(MAX_XP, num(out.days[day]) + added);
        });
        out.active = Math.min(MAX_COUNT, out.active + newDays);
        Object.keys(now.badges).forEach(function (id) {
            if (!has(synced.badges, id) && !has(out.badges, id)) out.badges[id] = now.badges[id];
        });
        ["best", "facts"].forEach(function (name) {
            Object.keys(now[name]).forEach(function (key) {
                if (num(now[name][key]) <= num(synced[name][key])) return;
                out[name][key] = Math.max(num(out[name][key]), num(now[name][key]));
            });
        });
        if (!sameValue(now.streak, synced.streak)) out.streak = laterStreak(now.streak, out.streak);
        if (isObject(out.streak) && num(out.best.streak) < num(out.streak.days)) out.best.streak = out.streak.days;
        return out;
    }

    const RULES = {
        numbers: listRule(true),
        list: listRule(false),
        bests: itemsRule({ modes: gamePick, lessons: gamePick }),
        daily: {
            // quiz.daily: the newer day is the base, the records are the higher of the two
            ok: isObject,
            merge: function (a, b) {
                const newer = String(a.last || "") >= String(b.last || "") ? a : b;
                return Object.assign({}, newer, { best: Math.max(num(a.best), num(b.best)), days: Math.max(num(a.days), num(b.days)) });
            },
            fresh: wholeFresh,
            drop: keep
        },
        mistakes: itemsRule({ items: boxPick }),
        cards: itemsRule({ cards: boxPick }, {
            join: function (out, a, b) {
                const x = isObject(a.newToday) ? a.newToday : null;
                const y = isObject(b.newToday) ? b.newToday : null;
                if (x && y) out.newToday = x.day === y.day ? { day: x.day, count: Math.max(num(x.count), num(y.count)) } : (num(x.day) > num(y.day) ? x : y);
            }
        }),
        journey: {
            ok: function (value) { return isObject(value) && typeof value.xp === "number"; },
            merge: mergeJourney,
            delta: deltaJourney,
            fresh: wholeFresh,
            drop: keep,
            tidy: tidyJourney
        },
        profile: {
            // learn.profile: who is learning, where to start, minutes a day is a choice (the
            // later choice wins); the level check and the first day are kept from either copy
            ok: function (value) { return isObject(value) && value.v === 1 && typeof value.who === "string"; },
            timed: true,
            merge: function (a, b, ta, tb) {
                const win = num(ta) >= num(tb) ? a : b;
                const other = win === a ? b : a;
                const out = Object.assign({}, win);
                if (whole(a.since) && whole(b.since)) out.since = Math.min(a.since, b.since);
                if (!isObject(out.placed) && isObject(other.placed)) out.placed = other.placed;
                return out;
            },
            fresh: wholeFresh,
            drop: keep
        },
        memory: itemsRule({ items: memoryPick }),
        units: itemsRule({ done: stepPick, tests: testPick }),
        explain: itemsRule({ lessons: explainPick }),
        days: itemsRule({ days: dayPick }, {
            join: function (out, a, b) { out.before = Math.max(num(a.before), num(b.before)); },
            tidy: tidyLearnDays
        }),
        exam: {
            ok: isObject,
            merge: function (a, b) {
                return { v: 1, best: examBetter(a.best, b.best), attempts: Math.max(num(a.attempts), num(b.attempts)), last: laterRow(a.last, b.last) };
            },
            fresh: wholeFresh,
            drop: keep
        },
        placed: {
            ok: isObject,
            merge: function (a, b) { return num(a.day) >= num(b.day) ? a : b; },
            fresh: wholeFresh,
            drop: keep
        },
        notebook: {
            // research.notebook: every entry of both, by id; the same entry: the later edit
            ok: function (value) { return isObject(value) && Array.isArray(value.entries); },
            merge: function (a, b) {
                const byId = {};
                b.entries.concat(a.entries).forEach(function (entry) {
                    if (!isObject(entry) || typeof entry.id !== "string") return;
                    const have = byId[entry.id];
                    if (!have || entryTime(entry) >= entryTime(have)) byId[entry.id] = entry;
                });
                const entries = Object.keys(byId).map(function (id) { return byId[id]; }).sort(byTime).slice(0, NOTEBOOK_MAX);
                return Object.assign({}, b, a, { entries: entries });
            },
            fresh: function (now, synced) {
                const old = {};
                synced.entries.forEach(function (entry) { if (isObject(entry)) old[entry.id] = stable(entry); });
                const entries = now.entries.filter(function (entry) { return isObject(entry) && old[entry.id] !== stable(entry); });
                return entries.length ? Object.assign({}, now, { entries: entries }) : undefined;
            },
            drop: function (value, ids) {
                const gone = new Set(ids.map(String));
                return Object.assign({}, value, { entries: value.entries.filter(function (entry) { return !isObject(entry) || !gone.has(String(entry.id)); }) });
            },
            items: function (value) {
                return value.entries.filter(isObject).map(function (entry) { return String(entry.id); });
            }
        },
        challenges: {
            // { "<experiment>": { v, total, done: [] } }: the challenges done in each
            ok: isObject,
            merge: function (a, b) {
                const out = Object.assign({}, b);
                Object.keys(a).forEach(function (id) {
                    const x = a[id];
                    const y = out[id];
                    out[id] = !isObject(y) ? x : !isObject(x) ? y : {
                        v: 1,
                        total: Math.max(num(x.total), num(y.total)),
                        done: unionList(Array.isArray(x.done) ? x.done : [], Array.isArray(y.done) ? y.done : [], false)
                    };
                });
                return out;
            },
            fresh: function (now, synced) {
                const out = {};
                let any = false;
                Object.keys(now).forEach(function (id) {
                    if (has(synced, id) && sameValue(now[id], synced[id])) return;
                    out[id] = now[id];
                    any = true;
                });
                return any ? out : undefined;
            },
            drop: function (value, ids) {
                const out = Object.assign({}, value);
                ids.forEach(function (id) { delete out[String(id)]; });
                return out;
            },
            items: function (value) { return Object.keys(value); }
        }
    };

    /* ---------- 5. What is synced: the rows of user_progress ----------
       Each row: key (online), read() its value on this device (undefined: none),
       write(value) puts a value here (undefined removes it), and its rule. */
    const PROGRESS = {
        "lessons.completed": RULES.numbers,     // finished lessons: all of both
        "glossary.explored": RULES.list,        // explored terms: all of both
        "lab.tried": RULES.list,                // tried experiments: all of both
        "quiz.bests": RULES.bests,              // the best game of each mode and lesson
        "quiz.daily": RULES.daily,              // the daily challenge: the newer day, the longer records
        "quiz.mistakes": RULES.mistakes,        // "My mistakes": each card, the more advanced
        "glossary.cards": RULES.cards,          // flashcards: each card, the more advanced
        "journey": RULES.journey,               // My Compass: XP added, rewards, badges and days of both
        "learn.profile": RULES.profile,         // My path's three answers: the later choice
        "learn.memory": RULES.memory,           // My path's memory cards: each, the more advanced
        "learn.units": RULES.units,             // guided steps and stage tests: every one, the best result
        "learn.explain": RULES.explain,         // "Explain it back": the best explanation of each lesson
        "learn.days": RULES.days,               // the learning days: every day of both
        "learn.exam": RULES.exam,               // the exam: the best result, the most attempts
        "learn.placed": RULES.placed,           // the level check before the questions: the later one
        "research.notebook": RULES.notebook     // the notebook: every entry, the later edit of each
    };

    function storageRow(key, rule) {
        return {
            key: key,
            rule: rule,
            read: function () { return A.storage.get(key, undefined); },
            write: function (value) {
                if (value === undefined) A.storage.remove(key);
                else A.storage.set(key, value);
            }
        };
    }

    // The lab experiments' challenges: "lab.<id>.challenges" here, one row online
    const challengesRow = {
        key: "lab.challenges",
        rule: RULES.challenges,
        read: function () {
            const out = {};
            let any = false;
            liveKeys().forEach(function (key) {
                const match = CHALLENGES_KEY.exec(key);
                if (!match) return;
                const value = A.storage.get(key, undefined);
                if (value === undefined) return;
                out[match[1]] = value;
                any = true;
            });
            return any ? out : undefined;
        },
        write: function (value) {
            const map = isObject(value) ? value : {};
            liveKeys().forEach(function (key) {
                const match = CHALLENGES_KEY.exec(key);
                if (match && !has(map, match[1])) A.storage.remove(key);
            });
            Object.keys(map).forEach(function (id) {
                if (/^[a-z0-9][a-z0-9-]{0,40}$/.test(id)) A.storage.set("lab." + id + ".challenges", map[id]);
            });
        }
    };

    // ----- The choices: the latest change wins -----
    function settingsObject() {
        const saved = A.storage.get("settings", null);
        return isObject(saved) && saved.v === 1 ? saved : null;
    }

    function setSetting(name, value) {
        const next = Object.assign({ v: 1 }, settingsObject() || {});
        if (value === null) delete next[name];
        else next[name] = value;
        A.storage.set("settings", next);
    }

    function plainKey(key) {
        return {
            read: function () {
                const value = A.storage.get(key, null);
                return value === undefined ? null : value;
            },
            write: function (value) {
                if (value === null) A.storage.remove(key);
                else A.storage.set(key, value);
            }
        };
    }

    // The look: the theme, a palette, or "like my device". One choice, so two devices
    // never end up with half of each other's look (and with "like my device" the theme
    // follows the device, so it is not part of the choice)
    function readLook() {
        const theme = A.storage.get("theme", null);
        const palette = A.storage.get("palette", null);
        const saved = settingsObject();
        const follow = Boolean(saved && saved.followSystem === true);
        if (theme === null && palette === null && !follow) return null;
        if (follow && !palette) return { follow: true };
        return { theme: theme, palette: palette };
    }

    function writeLook(look) {
        if (!isObject(look)) return;
        if (look.follow) {
            A.storage.remove("palette");
            setSetting("followSystem", true);
            return;
        }
        if (look.palette) A.storage.set("palette", look.palette);
        else A.storage.remove("palette");
        if (look.theme) A.storage.set("theme", look.theme);
        const saved = settingsObject();
        if (saved && saved.followSystem) setSetting("followSystem", false);
    }

    const CHOICES = [
        Object.assign({ name: "language", keys: ["language"] }, plainKey("language")),
        { name: "look", keys: ["theme", "palette", "settings"], read: readLook, write: writeLook },
        Object.assign({ name: "calm", keys: ["motion.calm"] }, plainKey("motion.calm")),
        Object.assign({ name: "lessons.textSize", keys: ["lessons.textSize"] }, plainKey("lessons.textSize")),
        Object.assign({ name: "lessons.certName", keys: ["lessons.certName"] }, plainKey("lessons.certName"))
    ].concat(SETTING_FIELDS.map(function (field) {
        return {
            name: "settings." + field,
            keys: ["settings"],
            read: function () {
                const saved = settingsObject();
                return saved && has(saved, field) ? saved[field] : null;
            },
            write: function (value) { setSetting(field, value); }
        };
    }));
    const CHOICE_KEYS = ["language", "theme", "palette", "settings", "motion.calm", "lessons.textSize", "lessons.certName"];

    function readTimes() {
        const times = A.storage.get(STORE.times, null);
        return isObject(times) ? times : {};
    }

    function readChoices() {
        const out = {};
        CHOICES.forEach(function (choice) {
            out[choice.name] = A.util.attempt(choice.read, null);
        });
        return out;
    }

    const prefsRow = {
        key: "prefs",
        custom: true,
        read: function () {
            const times = readTimes();
            const out = { c: readChoices(), t: {} };
            CHOICES.forEach(function (choice) { if (times[choice.name]) out.t[choice.name] = times[choice.name]; });
            return out;
        }
    };

    // ----- Everything else: the bundle -----
    function inBundle(key) {
        return !DEVICE_ONLY.test(key) && !has(PROGRESS, key) && !CHALLENGES_KEY.test(key) && CHOICE_KEYS.indexOf(key) === -1;
    }

    function readBundle() {
        const out = {};
        liveKeys().forEach(function (key) {
            if (!inBundle(key)) return;
            let text = null;
            try {
                text = window.localStorage.getItem("aic:" + key);
            } catch (error) {
                return;
            }
            if (text === null || text.length > BUNDLE_ITEM_MAX) return;
            const value = parse(text);
            if (value !== undefined) out[key] = value;
        });
        return out;
    }

    const bundleRow = { key: "bundle", custom: true, read: readBundle };

    function allRows() {
        return Object.keys(PROGRESS).map(function (key) { return storageRow(key, PROGRESS[key]); })
            .concat([challengesRow, prefsRow, bundleRow]);
    }

    // The row a key of this device belongs to, and the item it is in that row
    function rowOfKey(key) {
        if (has(PROGRESS, key)) return { row: key, item: null };
        const lab = CHALLENGES_KEY.exec(key);
        if (lab) return { row: challengesRow.key, item: lab[1] };
        if (CHOICE_KEYS.indexOf(key) !== -1 || DEVICE_ONLY.test(key)) return null;
        return { row: bundleRow.key, item: key };
    }

    /* ---------- 6. Noticing changes on this device ----------
       Every save of a feature goes through A.storage. A change of a choice (the
       look, the language...) gets its time; a removal while signed in is a
       deliberate one (section 7); and the save online is planned. Features that
       reset or remove items inside a value say so: A.emit("removed", { key, all })
       or A.emit("removed", { key, items: [...] }). */
    let applying = false;       // this file is writing merged values: they are not the learner's changes

    function applyingWrites(work) {
        applying = true;
        try {
            return work();
        } finally {
            applying = false;
        }
    }

    function choicesOf(key) {
        return CHOICES.filter(function (choice) { return choice.keys.indexOf(key) !== -1; });
    }

    // ----- Progress that changed under a feature -----
    // Most features read their progress once, when the page starts, and later save what
    // they hold in memory. When the saved copy has changed under them meanwhile (this file
    // wrote merged progress and the page could not load again yet, or another tab saved),
    // that save would write over it. So such a save counts as what the feature changed
    // since (base: what it held before), put on top of what is saved. My path and My
    // Compass read their progress again themselves before they save.
    const REREAD = /^(?:journey|learn\.(?:profile|memory|units|explain|days|exam))$/;
    const held = {};            // key -> { v: what the feature of this page holds }
    const heldChoices = {};     // choice -> { before, after }: merged in, the page not loaded again yet

    function holdBase(key, value) {
        if (has(PROGRESS, key) && !REREAD.test(key) && !has(held, key)) held[key] = { v: value };
    }

    function rebase(rule, base, written, stored) {
        const now = checkedValue(rule, written);
        const there = checkedValue(rule, stored);
        if (now === undefined || there === undefined) return written;
        const before = checkedValue(rule, base);
        const fresh = before === undefined ? now : rule.fresh(now, before);
        let out = fresh === undefined ? there : rule.merge(fresh, there, 0, 0);
        if (before !== undefined && rule.items) {
            const kept = new Set(rule.items(now));
            const gone = rule.items(before).filter(function (id) { return !kept.has(id); });
            if (gone.length) out = rule.drop(out, gone);
        }
        return out;
    }

    // A save of a feature whose progress changed under it: what it changed, on top
    function rebasedValue(key, value) {
        const base = held[key].v;
        const merged = A.util.attempt(function () { return rebase(PROGRESS[key], base, value, A.storage.get(key, undefined)); }, value);
        if (sameValue(merged, value)) {
            delete held[key];
            return value;
        }
        held[key] = { v: value };
        stale = true;           // the page shows less than is saved: it loads again when it can
        return merged;
    }

    function profileChoice() {
        const value = A.storage.get("learn.profile", null);
        return isObject(value) ? stable({ who: value.who, start: value.start, goal: value.goal }) : "";
    }

    function watchStorage() {
        const real = { set: A.storage.set, remove: A.storage.remove };
        function wrap(name) {
            return function (key) {
                const watch = !applying && !A.storage.frozen && typeof key === "string" && !DEVICE_ONLY.test(key);
                const choices = watch ? choicesOf(key) : [];
                const before = {};
                choices.forEach(function (choice) { before[choice.name] = stable(A.util.attempt(choice.read, null)); });
                const profileBefore = watch && key === "learn.profile" ? profileChoice() : null;
                const args = Array.prototype.slice.call(arguments);
                if (watch && has(held, key)) {
                    if (name === "set") args[1] = rebasedValue(key, args[1]);
                    else delete held[key];
                }
                const result = real[name].apply(A.storage, args);
                if (watch) {
                    A.util.attempt(function () { noticeChange(key, name === "remove", choices, before, profileBefore); });
                }
                return result;
            };
        }
        A.storage.set = wrap("set");
        A.storage.remove = wrap("remove");
    }

    // While the page starts, the site writes down what it shows (the language it found,
    // the base theme of a palette): that is no choice of the learner's, so it gets no time,
    // and a new device still takes the account's choices
    let started = false;
    A.ready(function () {
        setTimeout(function () { started = true; }, 0);
    });

    function noticeChange(key, removed, choices, before, profileBefore) {
        const changed = !started ? [] : choices.filter(function (choice) {
            const value = stable(A.util.attempt(choice.read, null));
            if (value === before[choice.name]) return false;
            const kept = heldChoices[choice.name];
            if (kept && value === kept.before) {
                // A feature saved the choice it held before a merge (the page has not loaded
                // again yet): no choice of the learner's. The merged one stays.
                applyingWrites(function () { A.util.attempt(function () { choice.write(kept.after); }); });
                return false;
            }
            delete heldChoices[choice.name];
            return true;
        });
        const profileChanged = started && profileBefore !== null && profileChoice() !== profileBefore;
        if (changed.length || profileChanged) {
            const times = readTimes();
            const now = Date.now();
            changed.forEach(function (choice) { times[choice.name] = now; });
            if (profileChanged) times["learn.profile"] = now;
            A.storage.set(STORE.times, times);
        }
        if (removed) {
            const target = rowOfKey(key);
            if (target) recordRemoval(target.row, target.item === null ? null : [target.item]);
        }
        saveSoon();
    }

    // The id of the person signed in on this device (known before the library loads), or ""
    function sessionOwner() {
        if (user) return user.id;
        const stored = storedSession();
        return stored ? stored.user.id : "";
    }

    function readPending() {
        const pending = A.storage.get(STORE.pending, null);
        return isObject(pending) && isObject(pending.rows) ? pending : { owner: "", rows: {} };
    }

    // A deliberate removal while signed in: items null means the whole value (a reset)
    function recordRemoval(rowKey, items) {
        const owner = sessionOwner();
        if (!owner) return;         // signed out: the next sign-in merges as usual (nothing is lost)
        const pending = readPending();
        if (pending.owner !== owner) {
            pending.owner = owner;
            pending.rows = {};
        }
        const now = pending.rows[rowKey];
        if (!items) pending.rows[rowKey] = { id: newId(), all: true };
        else if (!(now && now.all)) {
            const before = now && Array.isArray(now.items) ? now.items : [];
            pending.rows[rowKey] = { id: newId(), items: unionList(before, items.map(String), false) };
        }
        A.storage.set(STORE.pending, pending);
        saveSoon();
    }

    function pendingFor(rowKey) {
        const pending = readPending();
        if (!user || pending.owner !== user.id) return null;
        const entry = pending.rows[rowKey];
        return isObject(entry) && typeof entry.id === "string" ? entry : null;
    }

    function clearPending(rowKey, id) {
        const pending = readPending();
        if (pending.rows[rowKey] && pending.rows[rowKey].id === id) {
            delete pending.rows[rowKey];
            A.storage.set(STORE.pending, pending);
        }
    }

    /* ---------- 7. Syncing: the merge, the save, the retries, the other tabs ---------- */
    let saveState = { status: "never", time: 0 };     // never | checking | saving | ok | offline | failed
    let syncTimer = 0;
    let firstChange = 0;        // when the oldest change that is not saved yet happened
    let retries = 0;
    let statusTimer = 0;
    let syncing = 0;            // syncs running in this tab
    let stale = false;          // another tab merged new progress in: this page shows an old copy
    let needFull = false;       // the last merge did not finish: the next save is a merge
    let reloading = false;

    function readSnapshot() {
        const snapshot = A.storage.get(STORE.synced, null);
        return isObject(snapshot) && snapshot.v === 2 && isObject(snapshot.rows) ? snapshot : { v: 2, owner: "", at: 0, rows: {} };
    }

    // The local learner whose progress is on this device now (js/profiles.js), or ""
    function localLearner() {
        return A.util.attempt(function () {
            const active = A.profiles ? A.profiles.active : null;
            return active && active.id ? String(active.id) : "";
        }, "") || "";
    }

    // The snapshot also says whose progress on this device it was taken of
    function writeSnapshot(snapshot) {
        snapshot.learner = localLearner();
        A.storage.set(STORE.synced, snapshot);
    }

    // One sync at a time in this browser (Web Locks); without them, the writes that
    // check updated_at still keep two tabs from writing over each other
    function withLock(work) {
        if (navigator.locks && typeof navigator.locks.request === "function") {
            return navigator.locks.request(LOCK_NAME, function () { return work(); });
        }
        return Promise.resolve().then(work);
    }

    // "Save what you hold in memory, now": My Compass waits a moment before it saves
    let flushingFeatures = false;
    function flushFeatures() {
        flushingFeatures = true;
        try {
            window.dispatchEvent(new Event("pagehide"));
        } catch (error) {
            // an old browser: the features keep their own timers
        } finally {
            flushingFeatures = false;
        }
    }

    function checkedValue(rule, value) {
        if (value === undefined || value === null || !A.util.attempt(function () { return rule.ok(value); }, false)) return undefined;
        return rule.tidy ? rule.tidy(value) : value;
    }

    // Is there nothing in "now" that "synced" did not have?
    function nothingNew(rule, now, synced) {
        if (rule.delta) return sameValue(rule.tidy(rule.delta(synced, now, synced)), rule.tidy(synced));
        return rule.fresh(now, synced) === undefined;
    }

    // When a choice was made on this device. A device another person was signed in on
    // before (foreignAt: when they last synced): only the choices made after that count
    function choiceTime(time, foreign, foreignAt) {
        const when = num(time);
        return foreign && when <= num(foreignAt) ? 0 : when;
    }

    // One row of progress: this device's value, the online row, what was synced last
    // (snap: this person's; foreign: another person's, signed in here before, who last
    // synced at foreignAt). Returns { local, data, epoch, time, reset }
    function combine(row, onlineRow, snap, foreign, foreignAt, pending) {
        const rule = row.rule;
        const raw = row.read();
        const now = checkedValue(rule, raw);
        const cloud = onlineRow ? checkedValue(rule, onlineRow.d) : undefined;
        const synced = snap && snap.s !== undefined ? checkedValue(rule, parse(snap.s)) : undefined;
        const other = foreign && foreign.s !== undefined ? checkedValue(rule, parse(foreign.s)) : undefined;
        const newer = Boolean(onlineRow && snap && onlineRow.e > snap.e);
        const times = readTimes();
        const localTime = rule.timed ? choiceTime(times[row.key], foreign, foreignAt) : 0;
        const cloudTime = onlineRow ? num(onlineRow.t) : 0;
        let out;
        if (pending && pending.all) {
            out = now;                                  // a reset here: the online copy follows it
        } else if (other !== undefined && now !== undefined) {
            // This device's copy was left by the person signed in here before: only what
            // was done here since they last synced joins this person's online copy
            if (nothingNew(rule, now, other)) out = cloud;
            else if (rule.delta) out = rule.delta(cloud !== undefined ? cloud : {}, now, other);
            else {
                const fresh = rule.fresh(now, other);
                out = fresh === undefined ? cloud : cloud === undefined ? fresh : rule.merge(fresh, cloud, localTime, cloudTime);
            }
        } else if (snap && cloud !== undefined && snap.l === printOf(raw)) {
            out = cloud;                                // nothing changed here since the last sync
        } else if (rule.delta && synced !== undefined && cloud !== undefined && now !== undefined) {
            out = rule.delta(cloud, now, synced);       // a counter: the online copy + what was earned here
        } else {
            let mine = now;
            // Removed on another device since the last sync: only what is new here stays
            if (newer && mine !== undefined && synced !== undefined) mine = rule.fresh(mine, synced);
            out = mine === undefined ? cloud : cloud === undefined ? mine : rule.merge(mine, cloud, localTime, cloudTime);
        }
        if (pending && pending.items && out !== undefined) out = rule.drop(out, pending.items);
        if (out !== undefined && rule.tidy) out = rule.tidy(out);
        const base = Math.max(onlineRow ? onlineRow.e : 0, snap ? snap.e : 0);
        return {
            local: out,
            changed: !sameValue(out, now),
            data: out === undefined ? null : out,
            epoch: pending ? base + 1 : Math.max(base, 1),
            time: rule.timed ? Math.max(localTime, cloudTime) : 0,
            reset: pending ? pending.id : (onlineRow ? onlineRow.r : "")
        };
    }

    // The choices: the later change wins; a device that never chose takes the account's.
    // Two devices that never chose keep their own (no device ever flips the other's look
    // back); the same time with another value here: the value saved online with it wins.
    function combinePrefs(onlineRow, snap, foreign, foreignAt) {
        const cloud = onlineRow && isObject(onlineRow.d) ? onlineRow.d : {};
        const times = readTimes();
        const mine = readChoices();
        const data = Object.assign({}, cloud);
        const sets = {};
        let timesChanged = false;
        CHOICES.forEach(function (choice) {
            const name = choice.name;
            const value = mine[name];
            const localTime = choiceTime(times[name], foreign && !snap, foreignAt);
            const there = isObject(cloud[name]) && cloud[name].v !== null && cloud[name].v !== undefined ? cloud[name] : null;
            if (!there) {
                if (value !== null) data[name] = { v: value, t: localTime };
                return;
            }
            const thereTime = num(there.t);
            if (value === null || thereTime > localTime || (thereTime > 0 && thereTime === localTime && !sameValue(value, there.v))) {
                if (!sameValue(value, there.v)) sets[name] = there.v;
                if (num(times[name]) !== num(there.t)) {
                    times[name] = num(there.t);
                    timesChanged = true;
                }
                return;
            }
            if (localTime > num(there.t) && !sameValue(value, there.v)) data[name] = { v: value, t: localTime };
        });
        return {
            changed: Object.keys(sets).length > 0,
            apply: function () {
                CHOICES.forEach(function (choice) {
                    if (!has(sets, choice.name)) return;
                    const before = stable(A.util.attempt(choice.read, null));
                    A.util.attempt(function () { choice.write(sets[choice.name]); });
                    if (!has(heldChoices, choice.name)) heldChoices[choice.name] = { before: before };
                    heldChoices[choice.name].after = sets[choice.name];
                });
                if (timesChanged) A.storage.set(STORE.times, times);
            },
            data: data,
            epoch: Math.max(onlineRow ? onlineRow.e : 0, 1),
            time: 0,
            reset: onlineRow ? onlineRow.r : ""
        };
    }

    // Every other key: gaps are filled both ways; a key changed here since the last
    // sync wins, one changed only online is taken; removed keys go on both sides
    function combineBundle(onlineRow, snap, foreign, pending) {
        const now = readBundle();
        const cloud = onlineRow && isObject(onlineRow.d) ? onlineRow.d : {};
        const synced = snap && snap.s !== undefined && isObject(parse(snap.s)) ? parse(snap.s) : null;
        const prints = snap && isObject(snap.lh) ? snap.lh : null;
        const before = foreign && foreign.s !== undefined && isObject(parse(foreign.s)) ? parse(foreign.s) : null;
        const newer = Boolean(onlineRow && snap && onlineRow.e > snap.e);
        const removed = pending && Array.isArray(pending.items) ? pending.items : [];
        const data = Object.assign({}, cloud);
        const sets = {};
        const removes = [];
        Object.keys(now).concat(Object.keys(cloud)).forEach(function (key) {
            if (has(sets, key) || removes.indexOf(key) !== -1) return;
            if (removed.indexOf(key) !== -1) {
                delete data[key];
                if (has(now, key)) removes.push(key);
                return;
            }
            const here = has(now, key);
            const there = has(cloud, key);
            const hereText = here ? stable(now[key]) : "";
            const thereText = there ? stable(cloud[key]) : "";
            const changedHere = !prints || !has(prints, key) || fingerprint(hereText) !== prints[key];
            const changedThere = !synced || !has(synced, key) || stable(synced[key]) !== thereText;
            const leftBehind = before && here && has(before, key) && stable(before[key]) === hereText;
            if (!here) {
                sets[key] = cloud[key];
                return;
            }
            if (!there) {
                if (leftBehind || (newer && !changedHere && synced && has(synced, key))) removes.push(key);
                else data[key] = now[key];
                return;
            }
            if (hereText === thereText) return;
            if (leftBehind || (snap && !changedHere && changedThere)) sets[key] = cloud[key];
            else if (snap && changedHere) data[key] = now[key];
            // (a first sync and both differ: each side keeps its own)
        });
        // The row must fit in the database: the biggest keys stay on this device
        while (stable(data).length > PUSH_MAX_CHARS) {
            let biggest = "";
            Object.keys(data).forEach(function (key) {
                if (!biggest || stable(data[key]).length > stable(data[biggest]).length) biggest = key;
            });
            if (!biggest) break;
            delete data[biggest];
        }
        const base = Math.max(onlineRow ? onlineRow.e : 0, snap ? snap.e : 0);
        return {
            changed: Object.keys(sets).length > 0 || removes.length > 0,
            apply: function () {
                Object.keys(sets).forEach(function (key) { A.storage.set(key, sets[key]); });
                removes.forEach(function (key) { A.storage.remove(key); });
            },
            data: data,
            epoch: pending ? base + 1 : Math.max(base, 1),
            time: 0,
            reset: pending ? pending.id : (onlineRow ? onlineRow.r : "")
        };
    }

    function combineRow(row, onlineRow, snapshot) {
        const mine = snapshot.owner === user.id;
        const snap = mine ? snapshot.rows[row.key] : undefined;
        // Another person's snapshot tells what they left on this device; after a switch of
        // the local learner (js/profiles.js) the progress here is not theirs any more
        const theirs = !mine && snapshot.owner && String(snapshot.learner || "") === localLearner();
        const foreign = theirs ? snapshot.rows[row.key] : undefined;
        let pending = row.key === prefsRow.key ? null : pendingFor(row.key);
        // A removal whose write arrived although its answer did not: it is done
        if (pending && onlineRow && onlineRow.r === pending.id) {
            clearPending(row.key, pending.id);
            pending = null;
        }
        const foreignAt = foreign ? num(snapshot.at) : 0;
        if (row.key === prefsRow.key) return combinePrefs(onlineRow, snap, foreign, foreignAt);
        if (row.key === bundleRow.key) return combineBundle(onlineRow, snap, foreign, pending);
        const result = combine(row, onlineRow, snap, foreign, foreignAt, pending);
        result.apply = function () { row.write(result.local); };
        result.pending = pending;
        return result;
    }

    function envelope(result) {
        const value = { v: 2, e: result.epoch, d: result.data };
        if (result.time) value.t = result.time;
        if (result.reset) value.r = result.reset;
        return value;
    }

    function sameAsOnline(onlineRow, value) {
        if (!onlineRow) return value.d === null;
        return onlineRow.e === value.e && sameValue(onlineRow.d, value.d) && num(onlineRow.t) === num(value.t) &&
            String(onlineRow.r || "") === String(value.r || "");
    }

    // What this device remembers of a row after a sync
    // What this device has of a row, as fingerprints: taken when the value to sync is made,
    // so that a change made while it is on its way still counts as a change
    function localPrints(row) {
        const out = { l: printOf(row.read()) };
        if (row.key === bundleRow.key) {
            const now = readBundle();
            out.lh = {};
            Object.keys(now).forEach(function (key) { out.lh[key] = printOf(now[key]); });
        }
        return out;
    }

    function remember(snapshot, row, value, updatedAt, local) {
        const text = stable(value.d);
        const entry = { e: value.e, u: updatedAt, h: fingerprint(text), l: local.l };
        if (text.length <= SNAPSHOT_TEXT_MAX) entry.s = text;
        if (value.t) entry.t = value.t;
        if (value.r) entry.r = value.r;
        if (local.lh) entry.lh = local.lh;
        snapshot.rows[row.key] = entry;
    }

    // The online row as the snapshot says it was (null: there was none; undefined:
    // not known well enough, it must be read)
    function assumedOnline(snap) {
        if (!snap) return null;
        if (snap.s === undefined || !snap.u) return undefined;
        return { e: snap.e, d: parse(snap.s), t: num(snap.t), r: snap.r || "", updated_at: snap.u };
    }

    // The rows that changed on this device since they were last synced
    function dirtyRows(snapshot) {
        const mine = snapshot.owner === (user && user.id);
        const pending = readPending();
        return allRows().filter(function (row) {
            const snap = mine ? snapshot.rows[row.key] : undefined;
            if (pending.owner === (user && user.id) && pending.rows[row.key]) return true;
            const value = row.read();
            if (!snap) return value !== undefined && !(isObject(value) && !Object.keys(value).length);
            return printOf(value) !== snap.l;
        });
    }

    // Syncs rows: known holds rows read just now ({ key: row or null }); any other row is
    // taken to be as the snapshot remembers it, and the write itself checks that.
    // Resolves { changed: [keys changed on this device] }
    function syncRows(rows, known, accessToken) {
        const changed = [];
        let round = 0;
        function pass(list, rowsKnown) {
            round += 1;
            let snapshot = readSnapshot();
            const plan = [];
            // Every row is merged first: a snapshot of the person signed in here before is
            // used for that (what they left behind), then forgotten
            const results = list.map(function (row) {
                const onlineRow = has(rowsKnown, row.key) ? rowsKnown[row.key] : assumedOnline(snapshot.owner === user.id ? snapshot.rows[row.key] : undefined);
                return { row: row, onlineRow: onlineRow || null, result: combineRow(row, onlineRow || null, snapshot) };
            });
            if (snapshot.owner !== user.id) snapshot = { v: 2, owner: user.id, at: 0, rows: {} };
            results.forEach(function (item) {
                const row = item.row;
                const onlineRow = item.onlineRow;
                const result = item.result;
                if (result.changed) {
                    // (what the feature holds in memory now differs from what is saved)
                    if (has(PROGRESS, row.key)) holdBase(row.key, row.read());
                    applyingWrites(result.apply);
                    if (changed.indexOf(row.key) === -1) changed.push(row.key);
                }
                const value = envelope(result);
                const local = localPrints(row);
                if (sameAsOnline(onlineRow, value)) {
                    if (onlineRow && onlineRow.updated_at) remember(snapshot, row, value, onlineRow.updated_at, local);
                    else if (!onlineRow) delete snapshot.rows[row.key];
                    if (result.pending) clearPending(row.key, result.pending.id);
                    return;
                }
                if (!onlineRow && emptyData(value.d)) return;            // nothing to keep online yet
                if (stable(value).length > PUSH_MAX_CHARS) return;      // too big: it stays on this device
                if (refused[row.key] === printOf(value)) return;        // the database said no to this very value
                plan.push({ row: row, onlineRow: onlineRow, value: value, pending: result.pending, local: local });
            });
            snapshot.owner = user.id;
            writeSnapshot(snapshot);
            return Promise.all(plan.map(function (step) {
                return writeRow(accessToken, step.row.key, step.onlineRow, step.value, false).then(function (answer) {
                    return Object.assign(step, answer);
                }, function (error) {
                    return Object.assign(step, { error: error });
                });
            })).then(function (steps) {
                const latest = readSnapshot();
                latest.owner = user.id;
                const conflicts = [];
                let problem = null;
                steps.forEach(function (step) {
                    if (step.error) {
                        // A value the database refuses (too big, too many keys) is not sent again
                        // until it changes; any other problem is tried again later
                        if ([400, 403, 413, 422].indexOf(step.error.status) !== -1) refused[step.row.key] = printOf(step.value);
                        else problem = problem || step.error;
                        return;
                    }
                    if (step.conflict) {
                        conflicts.push(step.row);
                        return;
                    }
                    remember(latest, step.row, step.value, step.updated_at, step.local);
                    if (step.pending) clearPending(step.row.key, step.pending.id);
                });
                latest.at = Date.now();
                writeSnapshot(latest);
                if (problem) throw problem;
                if (!conflicts.length) return { changed: changed };
                if (round >= ROUNDS) throw new Error("conflict");
                return readRows(accessToken, conflicts.map(function (row) { return row.key; })).then(function (fresh) {
                    return pass(conflicts, fresh);
                });
            });
        }
        return pass(rows, known || {});
    }

    const refused = {};         // row -> the fingerprint of a value the database refused

    function emptyData(data) {
        return data === null || (isObject(data) && !Object.keys(data).length);
    }

    function setSaveState(status) {
        saveState = { status: status, time: status === "ok" ? Date.now() : saveState.time };
        paintState();
    }

    // The merge: every row is read and merged (on every sign-in and every visit)
    function fullSync() {
        if (!user) return Promise.resolve({ ok: false, changed: [] });
        const who = user.id;
        syncing += 1;
        if (saveState.status !== "ok") setSaveState("checking");
        else setSaveState("saving");
        return withLock(function () {
            if (!user || user.id !== who) return { ok: false, changed: [] };
            flushFeatures();
            return token().then(function (accessToken) {
                return readRows(accessToken, null).then(function (known) {
                    allRows().forEach(function (row) { if (!has(known, row.key)) known[row.key] = null; });
                    return syncRows(allRows(), known, accessToken);
                });
            }).then(function (result) {
                return { ok: true, changed: result.changed };
            });
        }).then(function (result) {
            syncing -= 1;
            if (result.ok) needFull = false;
            savedFine();
            return result;
        }, function (error) {
            syncing -= 1;
            needFull = true;
            saveFailed(error);
            return { ok: false, changed: [] };
        });
    }

    // The save: only the rows that changed here (a few seconds after a change)
    function saveNow() {
        clearTimeout(syncTimer);
        syncTimer = 0;
        firstChange = 0;
        if (!user) return Promise.resolve(false);
        if (!online()) {
            setSaveState("offline");
            return Promise.resolve(false);
        }
        const who = user.id;
        syncing += 1;
        return withLock(function () {
            if (!user || user.id !== who) return false;
            const snapshot = readSnapshot();
            const rows = dirtyRows(snapshot);
            if (!rows.length) return true;
            setSaveState("saving");
            return token().then(function (accessToken) {
                const unknown = rows.filter(function (row) {
                    return assumedOnline(snapshot.owner === user.id ? snapshot.rows[row.key] : undefined) === undefined;
                }).map(function (row) { return row.key; });
                return (unknown.length ? readRows(accessToken, unknown) : Promise.resolve({})).then(function (known) {
                    return syncRows(rows, known, accessToken);
                }).then(function (result) {
                    if (!result.changed.length) return result;
                    // Another device saved meanwhile: all of it is merged now, so that the
                    // page loads again only once
                    return readRows(accessToken, null).then(function (all) {
                        allRows().forEach(function (row) { if (!has(all, row.key)) all[row.key] = null; });
                        return syncRows(allRows(), all, accessToken);
                    }).then(function (more) {
                        return { changed: unionList(result.changed, more.changed, false) };
                    });
                });
            }).then(function (result) {
                // The page shows the merged progress after loading again (when the learner
                // is not in the middle of something)
                if (result.changed.length) afterMerge(result, "merged", false);
                return true;
            });
        }).then(function (ok) {
            syncing -= 1;
            if (ok) savedFine();
            return ok;
        }, function (error) {
            syncing -= 1;
            saveFailed(error);
            return false;
        });
    }

    function savedFine() {
        retries = 0;
        if (!user) return;
        if (!syncing) setSaveState("ok");
        emitAccount("saved");
    }

    function saveFailed(error) {
        A.util.attempt(function () { console.warn("AI Compass accounts: saving failed", error); });
        if (!user) return;
        setSaveState(online() ? "failed" : "offline");
        const delay = RETRY_DELAYS[Math.min(retries, RETRY_DELAYS.length - 1)];
        retries += 1;
        if (online()) planSave(delay);
    }

    function planSave(delay) {
        clearTimeout(syncTimer);
        syncTimer = setTimeout(syncLater, Math.max(0, delay));
    }

    // A planned save: a merge when the last merge did not finish (offline at the start)
    function syncLater() {
        syncTimer = 0;
        if (!needFull) return saveNow();
        firstChange = 0;
        return fullSync().then(function (result) {
            if (result.ok) afterMerge(result, "merged", true);
            return result.ok;
        });
    }

    // A change: saved a few seconds later (a stream of changes at least every 30 seconds)
    function saveSoon() {
        if (!user) return;
        const now = Date.now();
        if (!firstChange) firstChange = now;
        planSave(Math.min(SYNC_DELAY, SYNC_LONGEST - (now - firstChange)));
    }

    // The page is hidden or closing: what changed goes now, in requests that outlive
    // the page (keepalive). No lock and no waiting: the writes check updated_at, so they
    // never write over a newer row (the next visit merges what did not arrive).
    function saveOnLeave() {
        if (!user || !session || A.storage.frozen) return;
        leaving = true;
        flushEvents();
        const accessToken = session.access_token;
        const snapshot = readSnapshot();
        if (snapshot.owner && snapshot.owner !== user.id) return;
        let budget = KEEPALIVE_MAX;
        dirtyRows(snapshot).forEach(function (row) {
            const onlineRow = assumedOnline(snapshot.rows[row.key]);
            if (onlineRow === undefined) return;            // not known well enough: the next visit
            const result = combineRow(row, onlineRow, snapshot);
            const value = envelope(result);
            if (sameAsOnline(onlineRow, value)) return;
            const local = localPrints(row);
            const size = stable(value).length;
            if (size > budget) return;
            budget -= size;
            writeRow(accessToken, row.key, onlineRow, value, true).then(function (answer) {
                if (answer.conflict) return;
                const latest = readSnapshot();
                if (latest.owner && latest.owner !== user.id) return;
                latest.owner = user.id;
                remember(latest, row, value, answer.updated_at, local);
                latest.at = Date.now();
                writeSnapshot(latest);
                if (result.pending) clearPending(row.key, result.pending.id);
            }).catch(function () {
                // the next visit sends it
            });
        });
    }

    // Is the learner in the middle of something? (no reload, no invitation then)
    let quizAnswerAt = 0;
    function busy(strict) {
        if (A.util.attempt(function () { return A.dom.isTyping(document.activeElement); }, false)) return true;
        if (quizAnswerAt && Date.now() - quizAnswerAt < QUIZ_QUIET) return true;
        if (A.storage.get("challenge.attempt", undefined) !== undefined) return true;
        const top = A.util.attempt(function () { return A.overlays.top(); }, null);
        if (strict) return Boolean(top);
        return TASK_WINDOWS.some(function (id) { return A.util.attempt(function () { return A.overlays.isOpen(id); }, false); });
    }

    // When this page was loaded by reloadSoon (0: the learner opened or reloaded it)
    const reloadedAt = num(A.util.attempt(function () { return A.storage.session.get(STORE.reloaded, 0); }, 0));
    A.util.attempt(function () { A.storage.session.remove(STORE.reloaded); });

    // After a merge that changed this device's progress, the page loads again once, so
    // every feature reads the merged progress (they read it when they start)
    function reloadSoon(notice) {
        if (reloading) return;
        reloading = true;
        if (notice) A.storage.session.set(STORE.notice, notice);
        (function go() {
            if (busy(false)) {
                setTimeout(go, BUSY_POLL);
                return;
            }
            A.storage.session.set(STORE.reloaded, Date.now());
            window.location.reload();
        })();
    }

    // guarded: a merge that runs by itself (when the page opens, a retry); one that follows
    // the learner's own progress can never repeat in a loop
    function afterMerge(result, notice, guarded) {
        if (!result.changed.length) return false;
        // The same merged progress as the last reload: the features have it, a reload
        // would not show more (and must never repeat on every visit)
        const print = fingerprint(result.changed.map(function (key) {
            const row = allRows().filter(function (r) { return r.key === key; })[0];
            return key + "=" + (row ? printOf(row.read()) : "");
        }).join("|"));
        const last = A.storage.get(STORE.merged, null);
        A.storage.set(STORE.merged, { at: Date.now(), tab: TAB, print: print });
        if (last && last.print === print) return false;
        // This page itself came from such a reload a moment ago: no second one now (never a
        // loop); it loads again when the learner comes back to it
        if (guarded && reloadedAt && Date.now() - reloadedAt < RELOAD_GUARD) {
            stale = true;
            return false;
        }
        reloadSoon(notice);
        return true;
    }

    // Another tab merged new progress in, or removed it at sign-out
    function watchTabs() {
        window.addEventListener("storage", function (event) {
            // Another tab saved progress: the features of this page still hold the copy before
            if (event.key && event.key.indexOf("aic:") === 0 && event.oldValue !== event.newValue) {
                holdBase(event.key.slice(4), event.oldValue === null ? undefined : parse(event.oldValue));
            }
            if (event.key === AUTH_KEY) {
                if (event.newValue && !watching) watchAuth().catch(function () {});
                paintAll();
                return;
            }
            if (event.key === "aic:" + STORE.wiped && event.newValue) {
                const value = parse(event.newValue);
                if (value && value.tab === TAB) return;
                A.storage.freeze();         // the progress of the person before must not come back from this tab
                window.location.reload();
                return;
            }
            if (event.key === "aic:" + STORE.merged && event.newValue) {
                const value = parse(event.newValue);
                if (!value || value.tab === TAB) return;
                stale = true;
                if (document.hidden) reloadSoon("");
            }
        });
    }

    /* ---------- 8. The session: who is signed in ---------- */
    let user = null;            // { id, email, nickname, nicknameChosen } or null
    let session = null;         // the supabase-js session
    let signingIn = false;      // the Google page is opening
    let watching = false;

    function emitAccount(type, extra) {
        A.emit("account", Object.assign({ type: type, user: publicUser() }, extra || {}));
    }

    // What other features may know (no e-mail address)
    function publicUser() {
        return user ? { id: user.id, nickname: user.nickname, nicknameChosen: user.nicknameChosen } : null;
    }

    function hasSession() {
        return ENABLED && (Boolean(user) || Boolean(storedSession()));
    }

    function watchAuth() {
        return loadClient().then(function (c) {
            if (watching) return;
            watching = true;
            c.auth.onAuthStateChange(function (event, newSession) {
                if (event === "SIGNED_OUT" || !newSession) {
                    const was = Boolean(user);
                    session = null;
                    becomeNobody();
                    if (was) emitAccount("signout");
                    return;
                }
                session = newSession;
                if (user && user.id === newSession.user.id) return;
                user = { id: newSession.user.id, email: newSession.user.email || "", nickname: "", nicknameChosen: true };
                // (supabase-js waits for its callbacks, which must not call it again: the rest runs after)
                setTimeout(function () { becomeUser(user.id); }, 0);
            });
        });
    }

    // Somebody signed in (now, or on an earlier visit): the profile, the merge, the saving
    function becomeUser(who) {
        if (!user || user.id !== who) return Promise.resolve();
        const back = takeReturn();
        saveState = { status: "checking", time: readSnapshot().owner === user.id ? readSnapshot().at : 0 };
        paintAll();
        if (!statusTimer) statusTimer = setInterval(paintState, STATUS_TICK);
        const profile = rpc("my_profile").then(function (data) {
            if (!user || user.id !== who || !data) return;
            user.nickname = data.nickname;
            user.nicknameChosen = Boolean(data.nickname_chosen);
        }, function (error) {
            A.util.attempt(function () { console.warn("AI Compass accounts:", error); });
        }).then(function () {
            if (!user || user.id !== who) return;
            paintAll();
            emitAccount("signin");
        });
        return Promise.all([profile, fullSync()]).then(function (results) {
            if (!user || user.id !== who) return;
            flushEvents();
            const result = results[1];
            if (result.ok && afterMerge(result, "merged", true)) {
                if (back.justSignedIn) A.storage.session.set(STORE.returnTo, back.returnTo || "");
                return;
            }
            if (back.justSignedIn) {
                if (user.nicknameChosen) A.toast(t("account.toast.signedIn", { name: user.nickname }), "👤");
                else A.toast(t("account.toast.welcome"), "👋");
            }
            arrive(back.returnTo, back.justSignedIn);
        });
    }

    function becomeNobody() {
        user = null;
        clearTimeout(syncTimer);
        syncTimer = 0;
        clearInterval(statusTimer);
        statusTimer = 0;
        saveState = { status: "never", time: 0 };
        paintAll();
    }

    // Did the page just come back from Google? The tab remembers where it started
    function takeReturn() {
        const returnTo = A.storage.session.get(STORE.returnTo, null);
        A.storage.session.remove(STORE.returnTo);
        return { justSignedIn: returnTo !== null, returnTo: returnTo || "" };
    }

    // Where the page goes once the account is known. returnTo is where the sign-in
    // started: a section ("#challenge") is shown, a window's link ("#journey") opens it,
    // and a sign-in from Settings shows the account again, saved
    function arrive(returnTo, justSignedIn) {
        A.ready(function () {
            if (!user) return;
            const id = String(returnTo || "").replace(/^#/, "");
            const ok = /^[a-z][a-z0-9-]*$/.test(id);
            const section = ok && document.getElementById(id);
            if (section) A.navigate(id);
            if (!justSignedIn) return;
            if (!user.nicknameChosen) openAccount({ chooseName: true });
            else if (ok && !section && !window.location.hash) window.location.hash = "#" + id;
            else if (!ok) openAccount();
        });
    }

    /* ---------- 9. Sign in, sign out, delete, the nickname ---------- */
    let signInMessage = "";     // "", "offline", "failed"
    let leaveMessage = "";      // "", "working", "unsaved"
    let nameMessage = "";       // "", "saved", "invalid", "taken", "failed"

    // Opens Google's sign-in page. returnTo: a "#section" to show afterwards
    function signIn(returnTo) {
        if (!ENABLED || signingIn) return Promise.resolve(false);
        if (!online()) {
            signInMessage = "offline";
            paintCard();
            return Promise.resolve(false);
        }
        signingIn = true;
        signInMessage = "";
        hideNudge();
        paintCard();
        A.storage.session.set(STORE.returnTo, typeof returnTo === "string" ? returnTo : "");
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
            paintCard();
            return false;
        });
    }

    // "Remove my progress from this device" (the default) or keep it
    function leaveChoice() {
        return A.storage.get(STORE.leave, "remove") === "keep" ? "keep" : "remove";
    }

    // Signs out. options.remove: true removes this person's progress from this device
    // (after everything is saved online), false keeps it; without it, the choice shown
    function signOut(options) {
        if (!user || leaveMessage === "working") return Promise.resolve(false);
        const remove = options && typeof options.remove === "boolean" ? options.remove : leaveChoice() === "remove";
        A.storage.set(STORE.leave, remove ? "remove" : "keep");
        leaveMessage = "working";
        paintCard();
        return fullSync().then(function (result) {
            if (!result.ok && remove) {
                // Removing what is not saved would lose it: stay signed in
                leaveMessage = "unsaved";
                paintCard();
                return false;
            }
            return finishSignOut(remove);
        });
    }

    function finishSignOut(remove) {
        const c = client;
        clearTimeout(syncTimer);
        const out = c ? c.auth.signOut({ scope: "local" }).catch(function () {}) : Promise.resolve();
        return out.then(function () {
            A.util.attempt(function () { window.localStorage.removeItem(AUTH_KEY); });
            leaveMessage = "";
            if (remove) {
                wipeDevice();
                A.storage.session.set(STORE.notice, "removed");    // before the freeze, which stops every write
                A.storage.freeze();
                window.location.reload();
                return true;
            }
            session = null;
            if (user) {
                becomeNobody();
                emitAccount("signout");
            }
            A.toast(t("account.toast.kept"), "👋");
            return true;
        });
    }

    // Everything of the person who signed out leaves this device, except the look and
    // the language. Other tabs hear of it and reload (section 7).
    function wipeDevice() {
        const stay = SEED_KEYS.concat([STORE.leave]);
        A.util.attempt(function () {
            const store = window.localStorage;
            const names = [];
            for (let i = 0; i < store.length; i++) {
                const name = store.key(i);
                if (name && name.indexOf("aic:") === 0 && stay.indexOf(name.slice(4)) === -1) names.push(name);
            }
            names.forEach(function (name) { store.removeItem(name); });
            store.removeItem(AUTH_KEY);
            store.setItem("aic:" + STORE.wiped, JSON.stringify({ at: Date.now(), tab: TAB }));
        });
        A.util.attempt(function () {
            const store = window.sessionStorage;
            const names = [];
            for (let i = 0; i < store.length; i++) {
                const name = store.key(i);
                if (name && name.indexOf("aic:") === 0) names.push(name);
            }
            names.forEach(function (name) { store.removeItem(name); });
        });
    }

    function setNickname(name) {
        if (!user) return Promise.resolve(false);
        return rpc("set_nickname", { name: String(name || "") }).then(function (result) {
            user.nickname = result.nickname;
            user.nicknameChosen = true;
            nameMessage = "saved";
            paintAll();
            emitAccount("nickname");
            A.announce(t("account.in.saved"));
            return true;
        }, function (error) {
            const code = error.message;
            nameMessage = code === "nickname_taken" ? "taken" : code === "nickname_invalid" ? "invalid" : "failed";
            paintCard();
            return false;
        });
    }

    // The account and everything saved online go; the progress on this device stays
    function deleteAccount() {
        if (!user) return Promise.resolve(false);
        return rpc("delete_my_account").then(function () {
            [STORE.synced, STORE.pending, STORE.queue].forEach(function (key) { A.storage.remove(key); });
            return client.auth.signOut({ scope: "local" }).catch(function () {});
        }).then(function () {
            A.util.attempt(function () { window.localStorage.removeItem(AUTH_KEY); });
            session = null;
            if (user) {
                becomeNobody();
                emitAccount("signout");
            }
            A.toast(t("account.in.deleted"), "🗑️");
            return true;
        }, function () {
            A.toast(t("account.in.deleteFailed"), "⚠️");
            return false;
        });
    }

    /* ---------- 10. The diary of results (events) ---------- */
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
        const who = user.id;
        return loadClient().then(function (c) {
            return c.from("events").insert(batch.map(function (e) { return { user_id: who, type: e.type, detail: e.detail, at: e.at }; }));
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

    function readHistory(limit) {
        if (!user) return Promise.resolve([]);
        return loadClient().then(function (c) {
            return c.from("events").select("type,detail,at").order("at", { ascending: false }).limit(limit || 200);
        }).then(function (result) {
            if (result.error) throw new Error(errorCode(result.error));
            return result.data || [];
        });
    }

    /* ---------- 11. Settings → Account: the card ----------
       js/profiles.js draws the group "Account" of the Settings window and gives
       this file the place at its top (A.account.mount). Signed out: an invitation
       to sign in. Signed in: the nickname, whether everything is saved, the
       nickname field, sign out, delete, and what is kept and who sees it. */
    const ICONS = {
        google: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853"/><path d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.5H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.5l3.3-2.6z" fill="#FBBC05"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6z" fill="#EA4335"/></svg>',
        check: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        cloud: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5 4 4 0 0 1 17.5 18H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
        cloudUp: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5 4 4 0 0 1 17.5 18H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 15.5v-5M9.6 12.6L12 10.2l2.4 2.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        device: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 18h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        warning: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3l10 18H2L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v5M12 18v.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
        lock: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
    };

    let card = null;            // the place in Settings → Account (A.account.mount)
    let cardReturn = "";        // where a sign-in started from this card goes back to
    let deletePress = null;

    function mountCard(element) {
        if (!element) return;
        if (!ENABLED) {
            element.hidden = true;
            return;
        }
        if (card !== element) {
            card = element;
            element.addEventListener("click", onCardClick);
            element.addEventListener("submit", onCardSubmit);
            element.addEventListener("change", onCardChange);
        }
        element.hidden = false;
        paintCard();
    }

    function cardShown() {
        return Boolean(card && card.isConnected);
    }

    function privacyHTML() {
        return '<details class="ac-privacy">' +
                '<summary>' + ICONS.lock + "<span>" + esc(t("account.privacy.title")) + "</span></summary>" +
                '<ul class="ac-privacy-list">' +
                    ["nickname", "email", "progress", "delete"].map(function (name) {
                        return "<li>" + ICONS.check + "<span>" + esc(t("account.privacy." + name)) + "</span></li>";
                    }).join("") +
                "</ul>" +
            "</details>";
    }

    function outHTML() {
        const blocked = !A.storage.available();
        const problem = blocked ? "blocked" : signInMessage;
        return '<div class="ac-card ac-card-out">' +
                '<div class="ac-card-head">' +
                    '<span class="ac-card-icon" aria-hidden="true">' + ICONS.cloudUp + "</span>" +
                    '<h4 class="ac-card-title" id="ac-card-title" tabindex="-1">' + esc(t("account.card.title")) + "</h4>" +
                "</div>" +
                '<p class="ac-card-text">' + esc(t("account.card.text")) + "</p>" +
                '<button type="button" class="btn btn-primary ac-google" data-ac="signin" data-focus="signin"' + (signingIn || blocked ? " disabled" : "") + ">" +
                    ICONS.google + "<span>" + esc(t(signingIn ? "account.card.working" : "account.card.button")) + "</span></button>" +
                (problem ? '<p class="st-note is-problem ac-problem" role="alert">' + ICONS.warning + "<span>" + esc(t("account.card." + problem)) + "</span></p>" : "") +
                '<p class="ac-card-note">' + esc(t("account.card.note")) + "</p>" +
                privacyHTML() +
            "</div>";
    }

    function waitHTML() {
        const problem = saveState.status === "failed" || saveState.status === "offline";
        return '<div class="ac-card ac-card-wait">' +
                '<p class="ac-state' + (problem ? " is-problem" : "") + '" role="status">' + (problem ? ICONS.warning : ICONS.cloud) +
                    "<span>" + esc(t(problem ? "account.wait.failed" : "account.wait.text")) + "</span>" +
                    (problem ? ' <button type="button" class="ac-link" data-ac="reconnect" data-focus="reconnect">' + esc(t("account.state.retry")) + "</button>" : "") +
                "</p>" +
            "</div>";
    }

    function stateClass() {
        const status = saveState.status;
        if (status === "ok" || (status === "never" && saveState.time)) return "ac-state is-ok";
        if (status === "failed" || status === "offline") return "ac-state is-problem";
        return "ac-state is-busy";
    }

    function stateHTML() {
        const status = saveState.status;
        let icon = ICONS.cloud;
        let text;
        if (status === "ok" || (status === "never" && saveState.time)) {
            icon = ICONS.check;
            text = t("account.state.ok", { when: whenText(saveState.time || Date.now()) });
        } else if (status === "offline" || status === "failed") {
            icon = ICONS.warning;
            text = t("account.state." + status);
        } else {
            text = t(status === "checking" ? "account.state.checking" : "account.state.saving");
        }
        return '<span class="ac-state-icon">' + icon + "</span><span data-ac-state-text>" + esc(text) + "</span>" +
            (status === "failed" ? ' <button type="button" class="ac-link" data-ac="retry" data-focus="retry">' + esc(t("account.state.retry")) + "</button>" : "");
    }

    function inHTML() {
        const name = user.nickname || "…";
        const remove = leaveChoice() === "remove";
        const nameNote = nameMessage
            ? t("account.in." + (nameMessage === "saved" ? "saved" : "nickname" + nameMessage.charAt(0).toUpperCase() + nameMessage.slice(1)))
            : "";
        return '<div class="ac-card ac-card-in">' +
                '<div class="ac-who">' +
                    '<span class="ac-avatar" aria-hidden="true">' + esc(name.charAt(0).toUpperCase()) + "</span>" +
                    '<div class="ac-who-text">' +
                        '<h4 class="ac-who-name" id="ac-card-title" tabindex="-1">' + esc(name) + "</h4>" +
                        (user.email ? '<p class="ac-who-mail">' + esc(t("account.in.google", { email: user.email })) + "</p>" : "") +
                    "</div>" +
                "</div>" +
                '<p class="' + stateClass() + '" data-ac-state role="status">' + stateHTML() + "</p>" +
                '<form class="ac-name" data-ac-form novalidate>' +
                    '<label class="ac-label" for="ac-nickname">' + esc(t("account.in.nickname")) + "</label>" +
                    (user.nicknameChosen ? "" : '<p class="st-note ac-choose">' + esc(t("account.in.nicknameChoose")) + "</p>") +
                    '<div class="ac-name-row">' +
                        '<input class="ac-input" id="ac-nickname" data-focus="name" type="text" autocomplete="nickname" maxlength="20" spellcheck="false" value="' + esc(user.nickname) + '" aria-describedby="ac-nickname-hint">' +
                        '<button type="submit" class="btn btn-ghost btn-small" data-focus="savename">' + esc(t("account.in.save")) + "</button>" +
                    "</div>" +
                    '<p class="st-hint" id="ac-nickname-hint">' + esc(t("account.in.nicknameHint")) + "</p>" +
                    '<p class="st-note ac-name-note' + (nameMessage && nameMessage !== "saved" ? " is-problem" : "") + '" role="status"' + (nameNote ? "" : " hidden") + ">" + esc(nameNote) + "</p>" +
                "</form>" +
                '<div class="ac-buttons">' +
                    (A.challenge || document.getElementById("challenge")
                        ? '<button type="button" class="btn btn-ghost btn-small" data-ac="challenge" data-focus="challenge">' + esc(t("account.in.challenge")) + "</button>"
                        : "") +
                    '<button type="button" class="btn btn-ghost btn-small" data-ac="compass" data-focus="compass">' + esc(t("account.in.compass")) + "</button>" +
                "</div>" +
                '<div class="ac-leave">' +
                    '<label class="ac-check">' +
                        '<input type="checkbox" data-ac-wipe data-focus="wipe"' + (remove ? " checked" : "") + ' aria-describedby="ac-wipe-hint">' +
                        "<span>" + esc(t("account.leave.remove")) + "</span>" +
                    "</label>" +
                    '<p class="st-hint" id="ac-wipe-hint" data-ac-wipe-hint>' + esc(t(remove ? "account.leave.removeHint" : "account.leave.keepHint")) + "</p>" +
                    '<button type="button" class="btn btn-ghost btn-small ac-signout" data-ac="signout" data-focus="signout"' + (leaveMessage === "working" ? " disabled" : "") + ">" +
                        esc(t(leaveMessage === "working" ? "account.leave.working" : "account.in.signOut")) + "</button>" +
                    (leaveMessage === "unsaved" ? '<p class="st-note is-problem" role="alert">' + esc(t("account.leave.unsaved")) + "</p>" : "") +
                "</div>" +
                privacyHTML() +
                '<div class="ac-danger">' +
                    '<button type="button" class="btn btn-ghost btn-small ac-delete" data-ac="delete" data-focus="delete"><span data-ac-delete-label>' +
                        esc(t("account.in.danger")) + "</span></button>" +
                    '<p class="st-hint">' + esc(t("account.in.dangerNote")) + "</p>" +
                "</div>" +
            "</div>";
    }

    // What the card shows (the save line is painted on its own, paintState)
    function cardSignature() {
        return stable([A.lang, user ? [user.nickname, user.nicknameChosen, user.email] : hasSession() ? "wait" : "out",
            saveState.status === "failed" || saveState.status === "offline", signingIn, signInMessage, leaveMessage,
            nameMessage, leaveChoice(), A.storage.available(), Boolean(A.challenge)]);
    }

    // Draws the card again, keeping the focus, an open "privacy" and what is being typed
    let cardDrawn = "";
    function paintCard(force) {
        if (!cardShown()) return;
        const now = cardSignature();
        if (!force && now === cardDrawn && card.firstChild) {
            paintState();
            return;
        }
        cardDrawn = now;
        const active = document.activeElement;
        const inside = active && card.contains(active);
        const focusName = inside ? active.getAttribute("data-focus") : null;
        const input = card.querySelector("#ac-nickname");
        const typing = input && active === input ? { value: input.value, start: input.selectionStart, end: input.selectionEnd } : null;
        const details = card.querySelector(".ac-privacy");
        const open = Boolean(details && details.open);
        if (deletePress) {
            deletePress.disarm();
            deletePress = null;
        }
        card.innerHTML = !user && !hasSession() ? outHTML() : !user ? waitHTML() : inHTML();
        if (open) {
            const again = card.querySelector(".ac-privacy");
            if (again) again.open = true;
        }
        const del = card.querySelector('[data-ac="delete"]');
        if (del) setUpDelete(del);
        if (typing) {
            const field = card.querySelector("#ac-nickname");
            if (field) {
                field.value = typing.value;
                field.focus({ preventScroll: true });
                A.util.attempt(function () { field.setSelectionRange(typing.start, typing.end); });
            }
        } else if (focusName) {
            const target = card.querySelector('[data-focus="' + focusName + '"]');
            if (target && !target.disabled) target.focus({ preventScroll: true });
            else {
                const title = card.querySelector("#ac-card-title");
                if (title) title.focus({ preventScroll: true });
            }
        }
    }

    // Only the line "All progress saved" (drawing the whole card would disturb typing)
    function paintState() {
        if (!cardShown()) return;
        const line = card.querySelector("[data-ac-state]");
        if (!line) return;
        const active = document.activeElement;
        const hadFocus = active && line.contains(active);
        line.className = stateClass();
        line.innerHTML = stateHTML();
        if (hadFocus) {
            const retry = line.querySelector('[data-ac="retry"]');
            const title = card.querySelector("#ac-card-title");
            (retry || title).focus({ preventScroll: true });
        }
    }

    function setUpDelete(element) {
        const label = element.querySelector("[data-ac-delete-label]");
        deletePress = A.confirmPress(element, {
            onArm: function () {
                element.classList.add("is-armed");
                label.textContent = t("account.in.dangerAsk");
                A.announce(t("account.in.dangerAsk"));
            },
            onDisarm: function () {
                if (!element.isConnected) return;
                element.classList.remove("is-armed");
                label.textContent = t("account.in.danger");
            },
            onConfirm: deleteAccount
        });
    }

    function onCardClick(event) {
        const target = event.target.closest("[data-ac]");
        if (!target || !card.contains(target)) return;
        const action = target.getAttribute("data-ac");
        if (action === "signin") {
            const back = cardReturn && A.settings && A.settings.isOpen ? cardReturn : "";
            signIn(back);
        } else if (action === "signout") {
            signOut();
        } else if (action === "retry") {
            retries = 0;
            fullSync().then(function (result) { if (result.ok) afterMerge(result, "merged", false); });
        } else if (action === "reconnect") {
            saveState = { status: "checking", time: 0 };
            paintCard();
            watchAuth().catch(function () {
                saveState = { status: online() ? "failed" : "offline", time: 0 };
                paintCard();
            });
        } else if (action === "compass") {
            if (A.settings) A.settings.close();
            if (A.journey && typeof A.journey.open === "function") A.journey.open();
            else window.location.hash = "#journey";
        } else if (action === "challenge") {
            if (A.settings) A.settings.close();
            A.navigate("challenge");
        }
    }

    function onCardSubmit(event) {
        if (!event.target.matches("[data-ac-form]")) return;
        event.preventDefault();
        const input = card.querySelector("#ac-nickname");
        setNickname(input ? input.value : "");
    }

    function onCardChange(event) {
        if (!event.target.matches("[data-ac-wipe]")) return;
        const remove = event.target.checked;
        A.storage.set(STORE.leave, remove ? "remove" : "keep");
        const hint = card.querySelector("[data-ac-wipe-hint]");
        if (hint) A.dom.setText(hint, t(remove ? "account.leave.removeHint" : "account.leave.keepHint"));
    }

    /* ---------- 12. The way in: the buttons, links and commands; the invitation; the lines ---------- */
    const button = document.getElementById("account-toggle");
    const quick = document.getElementById("account-quick");

    // Opens Settings → Account. options: { returnTo: "#section" after a sign-in started
    // there, chooseName: put the cursor in the nickname field, opener: gets the focus back }
    function openAccount(options) {
        const opts = isObject(options) ? options : {};
        cardReturn = typeof opts.returnTo === "string" ? opts.returnTo : "";
        const settings = A.settings;
        if (!settings || typeof settings.open !== "function") return false;
        settings.open("account", opts.opener || document.activeElement);
        if (!cardShown()) return true;
        const target = opts.chooseName ? card.querySelector("#ac-nickname")
            : card.querySelector('[data-ac="signin"]:not([disabled])') || card.querySelector("#ac-card-title");
        if (target) {
            target.focus({ preventScroll: true });
            if (opts.chooseName) A.util.attempt(function () { target.select(); });
        }
        return true;
    }

    function paintButtons() {
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
            A.dom.setAttr(quick, "aria-label", label);
        }
    }

    function setUpButtons() {
        [button, quick].forEach(function (element) {
            if (!element) return;
            element.setAttribute("aria-haspopup", "dialog");
            element.addEventListener("click", function () { openAccount({ opener: element }); });
            element.hidden = false;
        });
        paintButtons();
    }

    function paintAll() {
        paintButtons();
        paintCard();
        paintLines();
        if (hasSession()) hideNudge();
    }

    // ----- The line next to the progress (My path, My Compass) -----
    // "Your progress is saved only on this device. Sign in to keep it forever."
    const lines = [];

    function addLine(element, returnTo) {
        if (!element) return;
        if (!ENABLED) {
            element.hidden = true;
            return;
        }
        if (lines.some(function (line) { return line.element === element; })) return;
        const line = { element: element, returnTo: typeof returnTo === "string" ? returnTo : "" };
        lines.push(line);
        element.classList.add("ac-line");
        element.addEventListener("click", function (event) {
            if (event.target.closest("[data-ac-line]")) openAccount({ returnTo: line.returnTo, opener: event.target.closest("button") });
        });
        paintLine(line);
    }

    function paintLine(line) {
        const show = ENABLED && !hasSession() && A.storage.available();
        A.dom.setHidden(line.element, !show);
        if (!show) return;
        const text = t("account.line.text") + "|" + t("account.line.button");
        if (line.element.getAttribute("data-ac-painted") === text) return;
        line.element.setAttribute("data-ac-painted", text);
        line.element.innerHTML = '<span class="ac-line-icon" aria-hidden="true">' + ICONS.device + "</span>" +
            '<span class="ac-line-text">' + esc(t("account.line.text")) + "</span> " +
            '<button type="button" class="ac-link" data-ac-line>' + esc(t("account.line.button")) + "</button>";
    }

    function paintLines() {
        lines.forEach(function (line) {
            if (line.element.isConnected) paintLine(line);
        });
    }

    // ----- The invitation: one friendly prompt after real progress -----
    // Signed out, with storage that works: after a finished lesson, a path step or a
    // quiz, "Keep your progress forever". Never while a window (a lesson, a test, the
    // exam) is open, a quiz is running or something is being typed; then it waits. It
    // comes back after a week at the earliest, and only after new progress.
    let nudge = null;
    let nudgeTimer = 0;

    function readNudge() {
        const state = A.storage.get(STORE.nudge, null);
        return isObject(state) ? state : { n: 0, seen: 0, at: 0 };
    }

    function nudgeWanted() {
        if (!ENABLED || hasSession() || signingIn || !A.storage.available()) return false;
        const state = readNudge();
        return num(state.n) > num(state.seen) && (!state.at || Date.now() - num(state.at) >= NUDGE_GAP);
    }

    function noteProgress() {
        if (!ENABLED || hasSession() || !A.storage.available()) return;
        const state = readNudge();
        state.n = num(state.n) + 1;
        A.storage.set(STORE.nudge, state);
        clearTimeout(nudgeTimer);
        nudgeTimer = setTimeout(tryNudge, NUDGE_DELAY);
    }

    // A toast is on the screen ("Lesson complete!"): the celebration comes first, and
    // on a phone the two would cover each other
    function toastShowing() {
        return A.util.attempt(function () {
            return Array.prototype.some.call(document.querySelectorAll(".toast"), function (toast) {
                return toast.getClientRects().length > 0;
            });
        }, false);
    }

    function tryNudge() {
        clearTimeout(nudgeTimer);
        nudgeTimer = 0;
        if (nudge || !nudgeWanted()) return;
        if (document.hidden || busy(true)) {
            nudgeTimer = setTimeout(tryNudge, BUSY_POLL);
            return;
        }
        if (toastShowing()) {
            nudgeTimer = setTimeout(tryNudge, TOAST_WAIT);
            return;
        }
        showNudge();
    }

    function showNudge() {
        const state = readNudge();
        state.at = Date.now();
        state.seen = num(state.n);
        A.storage.set(STORE.nudge, state);
        const returnTo = /^#[a-z][a-z0-9-]*$/.test(window.location.hash) ? window.location.hash : "";
        nudge = A.dom.fromHTML(
            '<section class="ac-nudge" role="region" aria-labelledby="ac-nudge-text">' +
                '<span class="ac-nudge-icon" aria-hidden="true">' + ICONS.cloudUp + "</span>" +
                '<p class="ac-nudge-text" id="ac-nudge-text" role="status">' + esc(t("account.nudge.text")) + "</p>" +
                '<div class="ac-nudge-buttons">' +
                    '<button type="button" class="btn btn-primary btn-small" data-nudge="yes">' + ICONS.google + "<span>" + esc(t("account.nudge.yes")) + "</span></button>" +
                    '<button type="button" class="btn btn-ghost btn-small" data-nudge="no">' + esc(t("account.nudge.no")) + "</button>" +
                "</div>" +
            "</section>"
        );
        nudge.addEventListener("click", function (event) {
            const choice = event.target.closest("[data-nudge]");
            if (!choice) return;
            const yes = choice.getAttribute("data-nudge") === "yes";
            hideNudge(true);
            if (yes) signIn(returnTo);
        });
        nudge.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                event.stopPropagation();
                hideNudge(true);
            }
        });
        document.body.appendChild(nudge);
        A.dom.replay(nudge, "is-in");
    }

    // focusBack: the learner closed it with the keyboard: the focus goes to the page
    function hideNudge(focusBack) {
        clearTimeout(nudgeTimer);
        nudgeTimer = 0;
        if (!nudge) return;
        const hadFocus = nudge.contains(document.activeElement);
        nudge.remove();
        nudge = null;
        if (focusBack && hadFocus) {
            const main = document.querySelector("main") || document.body;
            if (main !== document.body && !main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
            main.focus({ preventScroll: true });
        }
    }

    /* ---------- 13. Texts that change with accounts on, the start, the public API ---------- */
    // With accounts on, progress is no longer saved "only in this browser": a few texts of
    // other features say so (js/content/account.js, "textsOn"). Features whose texts load
    // later (the teachers' kit) get them too.
    function useTextsOn() {
        const texts = A.util.attempt(function () { return A.content.get("account").textsOn; }, null);
        if (!isObject(texts)) return;
        const add = A.addTranslations;
        add.call(A, texts);
        A.addTranslations = function () {
            const result = add.apply(A, arguments);
            add.call(A, texts);
            return result;
        };
    }

    // After a reload: what happened
    function showNotice() {
        const notice = A.storage.session.get(STORE.notice, "");
        A.storage.session.remove(STORE.notice);
        if (notice === "merged") A.toast(t("account.toast.merged"), "☁️");
        else if (notice === "removed") A.toast(t("account.toast.removed"), "👋");
    }

    if (ENABLED) {
        useTextsOn();
        watchStorage();
        watchTabs();
        A.keepOffline(LIBRARY);
        setUpButtons();
        if (storedSession() || /[?&]code=/.test(window.location.search) || A.storage.session.get(STORE.returnTo, null) !== null) {
            watchAuth().catch(function () {
                // The library didn't load (offline on a first visit): the card offers to try again
                saveState = { status: online() ? "failed" : "offline", time: 0 };
                paintCard();
            });
        }

        A.on("activity", function (activity) {
            if (!activity || typeof activity.type !== "string") return;
            if (activity.type === "quiz.answer") quizAnswerAt = Date.now();
            if (activity.type === "quiz.finish" || activity.type === "daily.complete") quizAnswerAt = 0;
            if (user) queueEvent(activity);
            if (NUDGE_AFTER.indexOf(activity.type) !== -1) noteProgress();
        });

        A.on("removed", function (detail) {
            if (!isObject(detail) || typeof detail.key !== "string" || !has(PROGRESS, detail.key)) return;
            recordRemoval(detail.key, detail.all || !Array.isArray(detail.items) ? null : detail.items);
        });

        // An open window hides the invitation (it never shows over one)
        A.on("overlay", function () {
            if (nudge && A.util.attempt(function () { return A.overlays.top(); }, null)) hideNudge(false);
        });

        // Leaving the page, or hiding it on a phone: what waits goes now
        window.addEventListener("pagehide", function (event) {
            if (event.isTrusted === false || flushingFeatures) return;
            saveOnLeave();
        });
        window.addEventListener("pageshow", function () { leaving = false; });
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                saveOnLeave();
                if (stale) reloadSoon("");
                return;
            }
            leaving = false;
            if (stale) reloadSoon("");
        });
        window.addEventListener("online", function () {
            if (!user) return;
            retries = 0;
            if (saveState.status === "offline" || saveState.status === "failed") setSaveState("saving");
            planSave(1000);
            flushEvents();
        });
        window.addEventListener("offline", function () {
            if (user) setSaveState("offline");
        });

        A.onLanguageChange(function () {
            paintButtons();
            paintCard();
            lines.forEach(function (line) { line.element.removeAttribute("data-ac-painted"); });
            paintLines();
            if (nudge) {
                hideNudge(false);
            }
        });

        A.registerCommand({
            id: "account-open",
            group: "account.cmdGroup",
            icon: "👤",
            title: function () { return t(user ? "account.cmd.open" : "account.cmd.signIn"); },
            keywords: "account sign in login google profile nickname sign out logout save progress forever " +
                "аккаунт войти вход профиль ник выйти выход сохранить прогресс навсегда",
            run: function () { openAccount({ opener: button }); }
        });

        // A link ending in #account opens Settings → Account
        const openFromLink = function () {
            if (window.location.hash !== HASH) return;
            A.util.attempt(function () { history.replaceState(history.state, "", window.location.pathname + window.location.search); });
            openAccount({});
        };
        window.addEventListener("hashchange", openFromLink);
        A.ready(function () {
            openFromLink();
            showNotice();
            paintAll();
        });
    }

    A.feature("account", {
        enabled: ENABLED,
        // The signed-in person: { id, nickname, nicknameChosen } or null (never the e-mail)
        user: publicUser,
        signedIn: function () { return Boolean(user); },
        // Signed in, or a session kept from an earlier visit that is still being checked
        hasSession: hasSession,
        // Opens Google's sign-in page; returnTo: a "#section" to show afterwards
        signIn: signIn,
        // options.remove: remove this person's progress from this device (default: the choice shown)
        signOut: signOut,
        // Opens Settings → Account; options: { returnTo, chooseName, opener }
        open: openAccount,
        setNickname: setNickname,
        // A database function (supabase/schema.sql); rejects with an Error whose message is the code
        rpc: rpc,
        // The supabase-js client (a Promise), for the features that read their own tables
        client: loadClient,
        // Saves what changed now; sync(): the full merge with what is saved online
        save: saveNow,
        sync: fullSync,
        // { status: "never" | "checking" | "saving" | "ok" | "offline" | "failed", time }
        saveState: function () { return Object.assign({}, saveState); },
        // The diary of results, newest first (a Promise of rows { type, detail, at })
        history: readHistory,
        onChange: function (callback) {
            return A.on("account", callback);
        },
        // js/profiles.js: the place for the card at the top of Settings → Account
        mount: mountCard,
        // My path, My Compass: "Your progress is saved only on this device" (signed out)
        line: addLine
    });
})();
