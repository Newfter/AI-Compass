/* =========================================================
   AI COMPASS — LEARNER ACCOUNTS ON THIS DEVICE
   A family computer, a classroom tablet: several learners, one browser.
   Each learner gets an account with a name and a picture, and with it
   their own progress, look, language and settings. There is no server,
   no email and no password: everything stays in this browser. An account
   can be saved to a file and loaded on another device.
   This file draws the group "Account" at the top of the Settings window
   (A.profiles.mount), the greeting on the home page and a Ctrl+K command.
   Every text is in js/content/profiles.js, the styles are in css/profiles.css.

   THE ONE RULE
   Every feature of the site saves under keys that start with "aic:".
   Those "live" keys ALWAYS belong to the active account (or to nobody
   yet, when there is no account). So no feature has to know that accounts
   exist. Switching accounts moves the live keys into the old account's
   box, moves the new account's box into the live keys and reloads the
   page. This file runs before every feature (see index.html), so they all
   start with the right learner's data.

   WHAT IS SAVED (outside "aic:", with the browser's storage used directly)
     aicp:index      { v, active, gen, list: [{ id, name, avatar, created }], swap, trash }
                       active  the id of the account that owns the live keys, or null
                       gen     a counter: +1 each time the owner of the live keys changes
                       swap    the plan of a swap that is running (below), or null
                       trash   ids whose boxes are rubbish and must still be removed
     aicp:data:<id>  the box of an account that is NOT active:
                     { v, profile, saved, keys: { "<key without aic:>": "<its text>" } }
                     It carries a copy of the profile, so the list can be built
                     again from the boxes if the index is ever lost.
     aicp:notice     (sessionStorage) what to tell the learner after the reload
     aicp:tab        (sessionStorage) the "gen" this tab showed last. A tab that
                     slept through a swap then knows that what its sessionStorage
                     kept under "aic:" (the chat with Compass Bot) was the last
                     learner's, and clears it before any feature reads it.
   Personal keys: every "aic:" key except "aic:account.*" (the online
   account's own notes) and "aic:probe". There is no list of known keys:
   new features add keys all the time.

   THE SWAP (the part that must never lose anything)
   What can go wrong: a feature saves "one last time" while the page closes
   and writes the OLD learner's data over the NEW learner's keys (My Compass
   does that on "pagehide"); another open tab does the same a second later;
   the browser runs out of space in the middle; the tab dies in the middle.
   So a switch from A to B goes like this. After each step the storage is
   in a state that the next page load can read and finish:
     0. One at a time. The whole swap holds a Web Lock ("aicp:swap"), so two
        tabs never swap, tidy up or recover at the same moment.
     1. The features save what they hold in memory (a "pagehide" event).
     2. The plan goes into the index: { from: A, to: B, stage: "saving" }.
        Then this page FREEZES (A.storage.freeze): it cannot write "aic:"
        keys any more. Other tabs see the plan (the "storage" event): they
        let their features save too, then they freeze as well and wait.
        The swap does not guess when they are done: every page holds a
        second lock ("aicp:live") for as long as it may save, and gives it
        up when it freezes. The swap goes on when it has that lock alone
        (at least 250 ms, and at most 3 s for a tab that is asleep).
     3. Every live key is copied into A's box. The box is read back and
        compared: the same keys with the same texts. A test write then
        checks that B's data will fit. If anything fails here, the box and
        the plan are removed, the page reloads and the learner is told.
        Nothing was changed.
     4. Only now the plan says "restoring". The live keys are removed and
        B's keys are written from its box (a new account gets the "seed":
        the language, the look and the settings of the screen). The "aic:"
        keys of sessionStorage (the chat with Compass Bot) were A's: cleared.
     5. The commit is ONE write of the index: active = B, gen + 1, no plan,
        trash = [B]. Then B's box is removed: its data is live now.
     6. The page reloads. Its last saves go nowhere, because it is frozen.
   If B's keys cannot be written in step 4 (the storage is full after all, or
   B's box cannot be read any more), A's keys are put back, the plan goes, the
   page reloads and the learner is told: nothing was changed. They come back
   from A's box, or, when A has no box (see the next lines), from the copy
   that step 3 read a moment before.
   A new account (add) is the same with the seed in place of a box, and it
   joins the list in step 5. Deleting the active account writes no box in
   step 3 and takes the account off the list in step 5.
   When the live keys belong to NOBODY (a device that was used before it had
   accounts, and now an account from a file is switched to), there is no "A".
   Then step 3 first makes one: if the live keys hold anything at all that a
   learner would miss (hasProgress, section 4), they become an account
   called "Guest", which joins the list and is the "A" of this swap. That is
   decided in step 3 and not earlier, because only then has every tab saved.

   IF THE TAB DIES IN THE MIDDLE (start-up recovery, section 9)
     before step 2         nothing has happened
     the plan says saving  the live keys are complete and still A's. The
                           half-made box and the plan are removed. A stays.
     it says restoring     A's box is complete and checked, and B's box is
                           still there. Steps 4 and 5 are done again.
     after the commit      B is active. Its box is named in "trash": removed.
   In each case every account has all of its data exactly once.
   (Step 4 trusts nobody about A's box: every time, before the live keys are
   replaced, it reads the box once more. If the box is gone, nothing is
   replaced and the swap is undone: the live keys are A's only copy then.
   And a plan whose B is an account of the list without a box is old news
   that came back: that swap was finished long ago, B's data is live. Such
   a plan is neither undone nor done again; only its commit is. Section 9,
   cameBack.)
   (The test value of step 3 can be megabytes. If a page died right after
   writing it, the next start removes it.)
   A page that finds a plan cannot know if that swap is dead or still
   running in another tab. So it freezes, waits for the lock (it is free
   once the other tab has finished or died), looks again a moment later,
   finishes the job if the plan is still there, and reloads.
   An index that cannot be read: nothing is deleted. The list is built
   again from the boxes, and the live keys belong to nobody.

   OTHER TABS
   A tab that did not start the swap must stop saving before the live keys
   change owner. Four things make sure of it: the "storage" event; the lock
   "aicp:live" (the swap waits until the tab has given it up); a look at
   the index whenever the tab is shown again; and a check before EVERY save
   of the site (A.storage.set and remove are wrapped in section 9): if the
   index is not the one this page knows, the page stops saving first.
   When the swap is over, the tab reloads into the new account by itself.

   A TAB THAT WAS AWAY (section 9, "A page that was away")
   All four rest on what the tab sees in the storage, and a tab that did
   not run for a while sees the past: the browser brings it the other tabs'
   changes as messages, and it has not read them yet. A phone stops a tab
   in the background. When such a tab goes on, a timer that is overdue can
   run before the messages are read, and save (in a test with a stopped
   tab: 2 times of 6). The end of one task that took more than 3 seconds
   does the same (every time). By then the swap has waited its 3 seconds,
   and the live keys are the next learner's.
   So a page saves by itself only for 2 seconds after the last moment at
   which it knew that it had read everything. It knows that from the
   browser: twice a second it asks the browser a question (which locks are
   held?), and the answer comes after everything that was waiting for the
   page when it asked. Later than those 2 seconds the page keeps its saves
   back, reads its messages and looks at the index again. Then it writes
   them, a quarter of a second late; or, when the owner has changed, it
   freezes and reloads, and they are gone with it. A.storage.get answers
   with what is kept back, so no feature has to know.
   (At first the page's own timer was the proof that the page runs. It is
   none: after a long task the browser gives the page one waiting change,
   then the timers that are due, then the rest. In a test with two long
   tasks in a row and that timer between them, the save at the end of the
   second task went into the next learner's keys. Section 9, tick.)
   For the same reason the swap, and a page that finishes a swap that was
   left behind, take one turn through the browser (browserTurn) after
   their waits and before they read what they are going to move.
   All this runs on a device without accounts too: a tab can be older than
   the first account, sleep while two accounts are made in another tab, and
   wake up with a save. In a test that save went into the second learner's
   keys, six times of six. (Such a page holds no lock and asks the browser
   nothing: its own timer is all it has. And when it closes, it writes
   what it kept back: as far as it knows, there is nobody else.)

   What is left, said honestly:
     - A tab that is busy or asleep for more than about 2 seconds when
       another tab starts a swap cannot save what it still held in memory
       (My Compass saves 0.4 s after a reward, so that is very little). It
       is lost; it is not written into the other account.
     - On a device with accounts, a page that was away for 2 seconds and
       is closed in the quarter of a second after it loses what it saved
       in that quarter.
     - A tab that the system stops for seconds inside one task, between
       its look at the index and the write behind it, writes when it goes
       on. No page can prevent that.
     - A swap needs room for one more copy of the active account's data.
       When the browser's storage is nearly full, the switch is refused
       and nothing changes. For the same reason a file is loaded only
       while there is room to switch to its account afterwards: an account
       that could never be opened would only take the room of the others.
   A browser without Web Locks (before 2022, and every browser when the
   site is opened over plain http) uses the plan itself as the lock ("by"
   says who works on it and "at" when, section 7). There the swap cannot
   ask the other tabs if they have stopped saving, and a page cannot ask
   the browser anything. So the swap waits 2.8 seconds for the other tabs
   (a switch takes 3 seconds in such a browser), and a page takes it as
   the proof that it runs when its own timer comes on time (section 1,
   NOLOCK_SETTLE_MS, says how the two fit together). Four rules keep a tab
   that sees the past from doing harm there:
     - A tab that comes to its own swap seconds late (it was asleep between
       the plan and the move) moves nothing and starts again, because the
       other tabs may be taking its plan over at that very moment.
     - A plan that looks left behind is taken over only when it is seen
       twice, with a moment in between in which the tab really ran and
       was told of no change by another tab. A tab that was away for
       seconds reads the other tabs' changes one after the other, and the
       first one is the plan of a swap that is long finished. Taking that
       plan over at once wrote the old index over the new one and undid a
       finished swap: one learner's box was removed, and the other's data
       carried the wrong name.
     - A tab finishes or undoes a plan only while its own note in the plan
       is fresh (2 seconds). After that it waits for the plan again.
     - A tab that hung in the middle of the move itself (the system stopped
       it there for seconds) writes nothing more when it goes on: another
       tab has taken its plan over by then. Going on undid what that tab
       had done: in a test, a learner's box was removed by the one tab and
       the live keys were replaced by the other, and the data was nowhere.
   What such a browser cannot rule out: a tab that hangs for seconds inside
   one single write of the move (that one write still comes, late); and a
   tab that is busy for 3 seconds in several tasks in a row just when
   another tab swaps, and saves at the end (its timer can come on time
   between two of those tasks, above all in the background, where timers
   run once a second; and it has no browser to ask).

   BOXES ARE DELETED IN ONE PLACE ONLY (dropBox), and only when the index
   says that the box is rubbish: the box of the active account, or of an
   account that has left the list. The box of a listed account that is not
   active is its only copy, and nothing in this file can delete it.

   "DELETE" ASKS TWICE, AND THE SECOND PRESS MUST BE AIMED (section 12)
   An account is deleted for good, so "Delete" needs a second press. A child
   presses twice without thinking: on the wrong button, and again when
   "nothing happened". So the second press never counts when it is only the
   first one repeated. The question "Sure?" appears below its warning, away
   from the finger (the window scrolls if it has to). A press at the same
   place, or the same key again within half a second, does nothing. A press
   anywhere else takes the question back.

   Sections of this file:
    1. Settings
    2. Small helpers
    3. Names and pictures
    4. The browser's storage, used directly
    5. The index and the boxes
    6. This page: whose data it shows, freezing, the veil
    7. One at a time: the locks
    8. The swap
    9. Other tabs, start-up and recovery
   10. The actions: create, add, switch, edit, delete
   11. An account as a file: save and load
   12. The group in the Settings window
   13. The greeting on the home page, the Ctrl+K command, messages after a reload
   14. The public API and the start

   Other features use AICompass.profiles (see section 14).
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const t = A.t;
    const esc = A.escapeHTML;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
    const INDEX_KEY = "aicp:index";
    const BOX_PREFIX = "aicp:data:";
    const NOTICE_KEY = "aicp:notice";       // in sessionStorage
    const TAB_KEY = "aicp:tab";             // in sessionStorage: the "gen" this tab showed last
    const ROOM_KEY = "aicp:room";           // a test value: is there room for the new owner's data?
    const PROBE_KEY = "aicp:probe";         // a test value: does the browser save at all?
    const LOCK_NAME = "aicp:swap";
    const LIVE_PREFIX = "aic:";             // the prefix of core.js (A.storage)
    const INDEX_VERSION = 1;

    const MAX_ACCOUNTS = 8;                 // accounts on one device
    const NAME_MAX = 24;                    // characters of a name
    // What a new account takes over from the screen, so the site does not jump to
    // English or to another look under a child's hands. Everything else starts empty.
    const SEED_KEYS = ["language", "theme", "palette", "settings", "motion.calm"];
    // Keys that are not progress ("effects.calm" is the old name of "motion.calm")
    const LOOK_KEYS = SEED_KEYS.concat(["effects.calm"]);
    // Keys that a visit writes by itself, before anybody has done anything: Compass Bot
    // showed its hint "Ask me", or the hint was closed (js/assistant.js).
    // LOOK_KEYS and VISIT_KEYS answer one question only: is there anything here that
    // must become the account "Guest"? (hasProgress, section 4). A key that is missing
    // from them costs nothing but a "Guest" too many; no key is ever lost over it.
    const VISIT_KEYS = ["assistant.tipVisits", "assistant.tipDismissed"];

    const LIVE_LOCK = "aicp:live";          // held by every page for as long as it may save (section 7)
    const SETTLE_MS = 250;          // the swap waits at least this long for the other tabs to save and freeze
    const LIVE_WAIT_MS = 3000;      // ...and at most this long for a tab that does not answer
    const LIVE_MARGIN_MS = 500;     // a tab that answers this close to the end of the wait saves nothing more
    const FLUSH_WINDOW_MS = 150;    // a tab the swap does not wait for may save only in this first part of SETTLE_MS
    const GRANT_SETTLE_MS = 60;     // after waiting for a lock: the other tab's last writes arrive
    const RECOVER_WAIT_MS = 500;    // a plan must still be there after this wait before another page finishes it
    const ROOM_MARGIN = 2048;       // characters kept free on top of what the new owner needs
    // Without Web Locks (old browsers): a plan nobody touched for STALE_MS is dead. A tab
    // that takes it over says so in the plan, waits CLAIM_MS and checks that it still has
    // it. A tab that waits for a plan to end looks again every POLL_MS.
    const STALE_MS = 5000;
    const CLAIM_MS = 600;
    const POLL_MS = 300;
    // ...and a tab that has taken a plan over finishes or undoes it only while its own
    // note in the plan is younger than LATE_MS (tooLate, section 9).
    const LATE_MS = 2000;
    // A page that did not run for AWAY_MS may have missed a whole swap of another tab
    // (that swap waits LIVE_WAIT_MS for it, then goes on): it keeps its saves back until
    // it has looked at the index again (section 9). A timer every TURN_MS tells it that
    // it runs. Where the browser cannot be asked, that timer counts only when it is not
    // more than TURN_LATE_MS late. LOOK_MS: the browser needs a moment to bring the page
    // the other tabs' changes.
    const AWAY_MS = 2000;
    const TURN_MS = 500;
    const TURN_LATE_MS = 150;
    const HIDDEN_TURN_MS = 1000;    // a page in the background: the browser lets its timers run once a second
    const LOOK_MS = 200;
    const LOOK_MAX_MS = 1000;       // ...and an answer of the browser is not waited for longer than this
    // Without Web Locks the swap cannot ask the other tabs if they have stopped saving:
    // it waits a fixed time for them. A tab that has not read the plan yet saves by
    // itself for AWAY_MS after its timer last came on time, and that was at most
    // TURN_MS + TURN_LATE_MS after the plan was written: from then on the tab was
    // busy, or it would have read the plan. The wait is longer than the three together.
    // (It was a quarter of a second at first. In a test, a tab that was busy for a
    // second and a half then saved into the next learner's keys.)
    const NOLOCK_SETTLE_MS = AWAY_MS + TURN_MS + TURN_LATE_MS + 150;
    const NOLOCK_FLUSH_MS = NOLOCK_SETTLE_MS - 600;     // a tab that hears of the plan this early still saves what it holds in memory
    // The tab that swaps comes to its move NOLOCK_SETTLE_MS after its plan. Later than
    // NOLOCK_LATE_MS after the plan (it was stopped meanwhile) it moves nothing, and a
    // move that takes longer than MOVE_MS writes nothing more (onTime, section 4). So
    // its last write comes 4.7 s after the plan at the latest. No other tab touches a
    // plan earlier than 5.3 s after it was last written (STALE_MS, and a second look
    // POLL_MS later).
    const NOLOCK_LATE_MS = NOLOCK_SETTLE_MS + 700;
    const MOVE_MS = 1200;

    // An account file: { app, kind, v, exported, profile: { name, avatar }, keys }
    const FILE_APP = "ai-compass";
    const FILE_KIND = "account";
    const FILE_VERSION = 1;
    const JOURNEY_APP = "ai-compass-journey";       // the progress file of My Compass: another kind
    const FILE_MAX = 3 * 1024 * 1024;               // bytes
    const FILE_KEYS_MAX = 500;                      // keys in one file
    const FILE_VALUE_MAX = 1000000;                 // characters of one value
    const FILE_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/;     // what a key of the site looks like
    const FILE_SPARE = 1024;        // characters a loaded file leaves free on top of what a switch to it needs
    const URL_LIFE = 10000;         // ms: how long the address of a downloaded file is kept

    const CONFIRM_MS = 8000;        // a "Delete" button waits this long for its second press:
                                    // there is a warning to read first
    const STATUS_DELAY = 80;        // ms: a screen reader reads a line that was empty a moment ago
    const SHIELD_MS = 500;          // when the group has moved under the finger, a press at the same place
    const SHIELD_PX = 30;           // (closer than this many px) does nothing for this long (section 12)
    const ASK_SHIELD_MS = 1000;     // ...and so does a press where a "Sure?" stood whose time has just run out
    const VIEW_EDGE = 12;           // px between a "Sure?" that was scrolled into view and the edge of the window
    const KEEP_PX = 24;             // px kept between that "Sure?" and the finger that pressed "Delete"
    const AVATAR_MAX = 16;          // a saved picture longer than this (in code units) is not one emoji
    const NUMBER_MAX = 1000;        // a name that is taken gets " 2", " 3"... at most up to this
    const ID_LENGTH = 12;           // letters and digits of a new account's id
    const SCROLL_GAP = 12;          // px left above the group when the Settings window opens at the account

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    function isObject(value) {
        return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function isCount(value) {
        return typeof value === "number" && isFinite(value) && value >= 0;
    }

    const ID_PATTERN = /^[a-z0-9]{6,24}$/;

    function isId(value) {
        return typeof value === "string" && ID_PATTERN.test(value);
    }

    // A new id: random letters and digits
    function newId() {
        const letters = "abcdefghijklmnopqrstuvwxyz0123456789";
        let id = "";
        try {
            const bytes = new Uint8Array(ID_LENGTH);
            window.crypto.getRandomValues(bytes);
            bytes.forEach(function (byte) { id += letters.charAt(byte % letters.length); });
        } catch (error) {
            id = "";
            while (id.length < ID_LENGTH) id += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return id;
    }

    function wait(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    // The time by a clock that goes on while this page is stopped, and that nobody can
    // set: for "how long did this page not run?" (sections 7 and 9)
    const steadyClock = Boolean(window.performance) && typeof window.performance.now === "function";

    function clock() {
        return steadyClock ? window.performance.now() : Date.now();
    }

    // An error in this file must never stop the site: it is reported in the console
    function guarded(callback, fallback) {
        return A.util.attempt(callback, fallback);
    }

    function later(callback) {
        setTimeout(function () { guarded(callback); }, 0);
    }

    function fail(code, extra) {
        return Object.assign({ ok: false, error: code }, extra);
    }

    // A list of saved texts by key. It has no prototype, so a key like "__proto__"
    // is an ordinary key and can never change how the object behaves.
    function newMap() {
        return Object.create(null);
    }

    function toMap(value) {
        const map = newMap();
        if (!isObject(value)) return map;
        Object.keys(value).forEach(function (key) {
            if (typeof value[key] === "string") map[key] = value[key];
        });
        return map;
    }

    // The same keys with the same texts?
    function sameKeys(a, b) {
        const names = Object.keys(a);
        if (names.length !== Object.keys(b).length) return false;
        return names.every(function (name) { return typeof b[name] === "string" && a[name] === b[name]; });
    }

    // How many characters the keys take as live keys
    function sizeOf(keys) {
        return Object.keys(keys).reduce(function (sum, key) {
            return sum + LIVE_PREFIX.length + key.length + keys[key].length;
        }, 0);
    }

    function union(list, more) {
        const all = list.slice();
        more.forEach(function (item) {
            if (all.indexOf(item) === -1) all.push(item);
        });
        return all;
    }

    function findProfile(list, id) {
        if (!id) return null;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) return list[i];
        }
        return null;
    }

    /* =========================================================
       3. NAMES AND PICTURES
       A name is typed by a child or comes from a file: it is cleaned
       here and, everywhere in this file, shown as plain text.
       ========================================================= */
    // Characters nobody can see, as ranges of character codes (they cannot be seen
    // in this file either, so they are written as numbers):
    //   - control characters;
    //   - marks that turn the direction of the text around (061C is the Arabic one);
    //   - blanks that are not spaces (00AD, 034F, 115F, 1160, 17B4, 17B5, 180E, 2800,
    //     3164, FFA0, 1D159...). Children know them from games: a name made of them
    //     looks like no name at all, and its row in the list would have no name;
    //   - halves of a character that takes two code units (D800 to DFFF: a whole
    //     character never has such a code).
    const HIDDEN = [
        [0x0000, 0x001f], [0x007f, 0x009f], [0x00ad, 0x00ad], [0x034f, 0x034f], [0x061c, 0x061c],
        [0x115f, 0x1160], [0x17b4, 0x17b5], [0x180e, 0x180e],
        [0x200b, 0x200b], [0x200e, 0x200f], [0x202a, 0x202e], [0x2060, 0x206f],
        [0x2800, 0x2800], [0x3164, 0x3164], [0xfeff, 0xfeff], [0xffa0, 0xffa0],
        [0xd800, 0xdfff], [0x1d159, 0x1d159], [0x1d173, 0x1d17a]
    ];
    // Marks that glue two letters or two emoji together: useless at the end of a name
    const JOINERS = [[0x200c, 0x200d]];
    // Marks that only change the character before them (the joiners, and the ones
    // that choose how an emoji is drawn). They stay inside a name, where an emoji
    // needs them; a name made of nothing else shows nothing.
    const SILENT = JOINERS.concat([[0xfe00, 0xfe0f], [0xe0000, 0xe01ef]]);

    // char: one whole character (an element of Array.from(text))
    function inRanges(char, ranges) {
        const code = char.codePointAt(0);
        return ranges.some(function (range) { return code >= range[0] && code <= range[1]; });
    }

    // Line breaks become spaces, and the characters nobody can see go. What is left
    // is a name only if at least one character of it can be seen.
    function cleanName(value) {
        let text = typeof value === "string" ? value : "";
        try {
            text = text.normalize("NFC");
        } catch (error) {
            // a very old browser: the name stays as it was typed
        }
        const chars = Array.from(text.replace(/\s+/g, " ")).filter(function (char) {
            return !inRanges(char, HIDDEN);
        });
        const shows = chars.some(function (char) { return char !== " " && !inRanges(char, SILENT); });
        return shows ? chars.join("").replace(/ {2,}/g, " ").trim() : "";
    }

    // The first "max" characters (an emoji counts as one and is never cut in half).
    // A cut can leave a space or a joining mark at the end: they go.
    function cutName(text, max) {
        const chars = Array.from(text).slice(0, max);
        while (chars.length && (chars[chars.length - 1] === " " || inRanges(chars[chars.length - 1], JOINERS))) chars.pop();
        return chars.join("");
    }

    // Two names are the same when only capital letters differ
    function nameKey(name) {
        return name.toLowerCase();
    }

    // The name to show for an account (a damaged entry may have none)
    function nameOf(profile) {
        return profile.name || t("profiles.defaultName");
    }

    function nameTaken(name, list, exceptId) {
        const key = nameKey(name);
        return list.some(function (other) {
            return other.id !== exceptId && nameKey(nameOf(other)) === key;
        });
    }

    // A typed name: 1 to 24 characters, not the name of another account.
    // Returns { name } or { error, name }.
    function checkName(raw, list, exceptId) {
        const name = cleanName(raw);
        if (!name) return { error: "nameEmpty" };
        if (Array.from(name).length > NAME_MAX) return { error: "nameLong" };
        if (nameTaken(name, list, exceptId)) return { error: "nameTaken", name: name };
        return { name: name };
    }

    // A name the site chooses itself (from a file, or "Guest"): when it is taken
    // it gets " 2", " 3"...
    function uniqueName(base, list) {
        const name = cutName(base, NAME_MAX);
        if (!nameTaken(name, list)) return name;
        for (let n = 2; n <= NUMBER_MAX; n++) {
            const ending = " " + n;
            const next = cutName(name, NAME_MAX - ending.length) + ending;
            if (!nameTaken(next, list)) return next;
        }
        return name;
    }

    // The pictures: [{ id, emoji }] from js/content/profiles.js (that file runs after
    // this one, so the list is asked for when it is needed, not at the start)
    function avatars() {
        const data = A.content.get("profiles");
        return data && Array.isArray(data.avatars) ? data.avatars : [];
    }

    function isAvatar(value) {
        return avatars().some(function (avatar) { return avatar.emoji === value; });
    }

    function firstAvatar() {
        const list = avatars();
        return list.length ? list[0].emoji : "";
    }

    // The picture to show: a picture this list does not have becomes the first one
    function avatarOf(profile) {
        return isAvatar(profile.avatar) ? profile.avatar : firstAvatar();
    }

    // A picture that no account of the list uses yet, so brothers and sisters
    // start with different ones
    function freeAvatar(list) {
        const free = avatars().filter(function (avatar) {
            return !list.some(function (profile) { return profile.avatar === avatar.emoji; });
        })[0];
        return free ? free.emoji : firstAvatar();
    }

    function makeProfile(name, avatar, list) {
        return { id: newId(), name: name, avatar: isAvatar(avatar) ? avatar : freeAvatar(list), created: Date.now() };
    }

    /* =========================================================
       4. THE BROWSER'S STORAGE, USED DIRECTLY
       A.storage adds "aic:" and can be frozen; the accounts' own data
       must stay outside both. Every call is wrapped: some browsers
       block storage, and a full storage refuses to save.
       ========================================================= */
    // ----- A move that hangs (only in a browser without Web Locks) -----
    // With Web Locks a tab keeps the lock for as long as its move takes (section 8),
    // also when the system stops it in the middle. Without them the plan is the lock,
    // and a plan that nobody touched for STALE_MS is taken over by another tab. A tab
    // that hung in the middle of its move for that long, and then went on where it
    // was, wrote the rest of its move over what the other tab had done since. In a
    // test the other tab had undone the swap and removed the old owner's box, and the
    // tab that went on then replaced the live keys: that learner's data was nowhere.
    // So every write of a move first asks if the move began more than MOVE_MS ago
    // (onTime). If so, this tab writes nothing more. What it leaves behind is what a
    // tab leaves that died at that write, and whoever finds the plan finishes it.
    const LATE = {};            // thrown by onTime(), caught by moving() (section 8)
    let moveFrom = null;        // when this tab's move began, by clock(); null: it is not moving

    function onTime() {
        if (moveFrom !== null && clock() - moveFrom > MOVE_MS && !lockManager()) throw LATE;
    }

    function rawGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function rawSet(key, text) {
        onTime();
        try {
            window.localStorage.setItem(key, text);
            return true;
        } catch (error) {
            return false;
        }
    }

    function rawRemove(key) {
        onTime();
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            // nothing to do: what could not be removed is found again at the next start
        }
    }

    // Can accounts work here? Yes when the browser saves, and also when its storage
    // is full but accounts exist already (they can still be shown and switched).
    function storageWorks() {
        try {
            const store = window.localStorage;
            if (store.getItem(INDEX_KEY) !== null) return true;
            store.setItem(PROBE_KEY, "1");
            store.removeItem(PROBE_KEY);
            return true;
        } catch (error) {
            return false;
        }
    }

    // A personal key: it moves with its account
    function isPersonal(fullKey) {
        return fullKey.indexOf(LIVE_PREFIX) === 0 &&
            fullKey.indexOf(LIVE_PREFIX + "account.") !== 0 &&
            fullKey !== LIVE_PREFIX + "probe";
    }

    // Every live personal key with its text, or null if the storage could not be
    // read completely (then nothing may be done with it: half a copy is worse than none)
    function readLive() {
        try {
            const store = window.localStorage;
            const names = [];
            for (let i = 0; i < store.length; i++) names.push(store.key(i));
            const keys = newMap();
            names.forEach(function (name) {
                if (name === null || !isPersonal(name)) return;
                const text = store.getItem(name);
                if (text === null) throw new Error("A saved value went away while it was read");
                keys[name.slice(LIVE_PREFIX.length)] = text;
            });
            return keys;
        } catch (error) {
            return null;
        }
    }

    // Puts "keys" in the place of every live personal key. False if the browser refused.
    function writeLive(keys) {
        try {
            const store = window.localStorage;
            const old = [];
            for (let i = 0; i < store.length; i++) {
                const name = store.key(i);
                if (name !== null && isPersonal(name)) old.push(name);
            }
            old.forEach(function (name) {
                onTime();
                store.removeItem(name);
            });
            Object.keys(keys).forEach(function (key) {
                if (!isPersonal(LIVE_PREFIX + key)) return;
                onTime();
                store.setItem(LIVE_PREFIX + key, keys[key]);
            });
            return true;
        } catch (error) {
            if (error === LATE) throw error;        // (a move that hangs: see the top of this section)
            return false;
        }
    }

    // Is there room for "extra" more characters (and a little more)? Asked with a
    // test value, removed at once.
    function hasRoom(extra) {
        onTime();
        let fits = false;
        try {
            window.localStorage.setItem(ROOM_KEY, "x".repeat(Math.max(0, extra) + ROOM_MARGIN));
            fits = true;
        } catch (error) {
            // the storage is full
        }
        rawRemove(ROOM_KEY);
        return fits;
    }

    // The "aic:" keys of sessionStorage (the chat with Compass Bot...) belong to
    // the learner who leaves
    function clearSession() {
        try {
            const store = window.sessionStorage;
            const names = [];
            for (let i = 0; i < store.length; i++) names.push(store.key(i));
            names.forEach(function (name) {
                if (name !== null && isPersonal(name)) store.removeItem(name);
            });
        } catch (error) {
            // no session storage: nothing to clear
        }
    }

    // A tab keeps its sessionStorage for as long as it lives, also while the browser
    // has put it to sleep or brings it back after a restart. If the live keys changed
    // owner in the meantime (another "gen"), what this tab kept was the last learner's:
    // it is cleared before any feature reads it.
    function ownSession(gen) {
        try {
            const store = window.sessionStorage;
            const last = store.getItem(TAB_KEY);
            if (last !== null && last !== String(gen)) clearSession();
            if (last !== String(gen)) store.setItem(TAB_KEY, String(gen));
        } catch (error) {
            // no session storage: nothing was kept
        }
    }

    function pickKeys(keys, names) {
        const picked = newMap();
        names.forEach(function (name) {
            if (typeof keys[name] === "string") picked[name] = keys[name];
        });
        return picked;
    }

    // Is there anything in the live keys that a learner would miss? (Asked only when
    // the live keys have no owner: must they become the account "Guest"?)
    // The answer is yes for nearly everything: when in doubt, it is kept. It is no
    // only when every key is one of these:
    //   - the language, the look and the settings of the screen (LOOK_KEYS);
    //   - what a visit writes by itself (VISIT_KEYS);
    //   - an empty value: nothing, 0, "", no, an empty list, or an object that holds
    //     only such values. My Compass saves { xp: 0, awarded: {}, ... } on every
    //     first visit; "v" is the version of a format and does not count.
    // So a brand-new device gets no "Guest", and a device where somebody has done
    // anything at all gets one. A value that cannot be read counts as something.
    function hasWeight(value) {
        if (Array.isArray(value)) return value.length > 0;
        if (isObject(value)) {
            return Object.keys(value).some(function (name) {
                return name !== "v" && hasWeight(value[name]);
            });
        }
        return Boolean(value);
    }

    function hasProgress(keys) {
        return Object.keys(keys).some(function (key) {
            if (LOOK_KEYS.indexOf(key) !== -1 || VISIT_KEYS.indexOf(key) !== -1) return false;
            try {
                return hasWeight(JSON.parse(keys[key]));
            } catch (error) {
                return true;
            }
        });
    }

    /* =========================================================
       5. THE INDEX AND THE BOXES
       What is read from the storage is checked piece by piece: a value
       that is not what it should be is left out, never trusted.
       ========================================================= */
    function emptyIndex() {
        return { v: INDEX_VERSION, active: null, gen: 0, list: [], swap: null, trash: [] };
    }

    function normalProfile(value) {
        if (!isObject(value) || !isId(value.id)) return null;
        return {
            id: value.id,
            name: cutName(cleanName(value.name), NAME_MAX),
            avatar: typeof value.avatar === "string" && value.avatar.length <= AVATAR_MAX ? value.avatar : "",
            created: isCount(value.created) ? value.created : 0
        };
    }

    // The plan of a swap, or null when it is not a plan this file can follow
    function normalPlan(value, listed) {
        if (!isObject(value) || (value.stage !== "saving" && value.stage !== "restoring")) return null;
        const profile = value.profile ? normalProfile(value.profile) : null;
        const from = value.from === null || value.from === undefined ? null : value.from;
        const to = value.to === null || value.to === undefined ? null : value.to;
        if (from !== null && !listed[from]) return null;
        if (to !== null && !listed[to] && !(profile && profile.id === to)) return null;
        return {
            id: typeof value.id === "string" ? value.id : "",
            by: typeof value.by === "string" ? value.by : "",
            at: isCount(value.at) ? value.at : 0,
            stage: value.stage,
            from: from,
            to: to,
            drop: value.drop === true,
            guest: value.guest === true,
            seed: toMap(value.seed),
            profile: profile
        };
    }

    function normalIndex(value) {
        if (!isObject(value) || value.v !== INDEX_VERSION || !Array.isArray(value.list)) return null;
        const listed = newMap();
        const list = [];
        value.list.forEach(function (entry) {
            const profile = normalProfile(entry);
            if (!profile || listed[profile.id]) return;
            listed[profile.id] = true;
            list.push(profile);
        });
        return {
            v: INDEX_VERSION,
            active: isId(value.active) && listed[value.active] ? value.active : null,
            gen: isCount(value.gen) ? value.gen : 0,
            list: list,
            swap: normalPlan(value.swap, listed),
            trash: Array.isArray(value.trash) ? value.trash.filter(isId) : []
        };
    }

    // The saved text of the index -> { index } (null when it cannot be read),
    // { missing: true } when there is none, { foreign: true } when a newer
    // version of the site wrote it (then this version changes nothing)
    function parseIndexText(text) {
        if (text === null || text === undefined) return { index: emptyIndex(), missing: true };
        let value;
        try {
            value = JSON.parse(text);
        } catch (error) {
            return { index: null };
        }
        if (isObject(value) && typeof value.v === "number" && value.v > INDEX_VERSION) return { index: null, foreign: true };
        return { index: normalIndex(value) };
    }

    // The index as the storage has it right now (a new object each time), or null
    function readIndexNow() {
        let text;
        try {
            text = window.localStorage.getItem(INDEX_KEY);
        } catch (error) {
            return null;
        }
        return parseIndexText(text).index;
    }

    function boxKey(id) {
        return BOX_PREFIX + id;
    }

    // The saved text of a box: null when there is none, undefined when the storage
    // did not answer. Those two must never be mixed up: "this account has no box" lets
    // it start empty, and whatever box it has is then removed as rubbish.
    function boxText(id) {
        try {
            return window.localStorage.getItem(boxKey(id));
        } catch (error) {
            return undefined;
        }
    }

    // The ids of every box in the storage
    function boxIds() {
        const ids = [];
        try {
            const store = window.localStorage;
            for (let i = 0; i < store.length; i++) {
                const name = store.key(i);
                if (name === null || name.indexOf(BOX_PREFIX) !== 0) continue;
                const id = name.slice(BOX_PREFIX.length);
                if (isId(id)) ids.push(id);
            }
        } catch (error) {
            // unreadable storage: no boxes to speak of
        }
        return ids;
    }

    // The saved text of a box -> { profile, saved, keys }, or null when it cannot be read
    function parseBox(text, id) {
        if (typeof text !== "string") return null;
        let value;
        try {
            value = JSON.parse(text);
        } catch (error) {
            return null;
        }
        if (!isObject(value) || value.v !== 1 || !isObject(value.keys)) return null;
        const names = Object.keys(value.keys);
        const keys = newMap();
        for (let i = 0; i < names.length; i++) {
            if (typeof value.keys[names[i]] !== "string") return null;
            keys[names[i]] = value.keys[names[i]];
        }
        const profile = normalProfile(Object.assign({}, isObject(value.profile) ? value.profile : {}, { id: id }));
        return { profile: profile, saved: isCount(value.saved) ? value.saved : 0, keys: keys };
    }

    // Writes the box of an account and reads it back: true only when the storage
    // now holds exactly these keys with exactly these texts
    function writeBox(profile, keys) {
        let text;
        try {
            text = JSON.stringify({
                v: 1,
                profile: { id: profile.id, name: profile.name, avatar: profile.avatar, created: profile.created },
                saved: Date.now(),
                keys: keys
            });
        } catch (error) {
            return false;
        }
        if (!rawSet(boxKey(profile.id), text)) return false;
        const back = parseBox(rawGet(boxKey(profile.id)), profile.id);
        return Boolean(back) && sameKeys(back.keys, keys);
    }

    // THE ONLY PLACE THAT DELETES A BOX. It does so only when the index says the box
    // is rubbish: no swap is running, and the account is the active one (its data is
    // live) or is not in the list any more. The box of a listed account that is not
    // active is its only copy.
    function dropBox(index, id) {
        if (index.swap) return;
        if (id !== index.active && findProfile(index.list, id)) return;
        rawRemove(boxKey(id));
    }

    /* =========================================================
       6. THIS PAGE: WHOSE DATA IT SHOWS, FREEZING, THE VEIL
       ========================================================= */
    const state = {
        available: false,       // can accounts work in this browser?
        foreign: false,         // the index was written by a newer version of the site
        index: emptyIndex(),    // the index as this page last read it
        seenText: null,         // its saved text (to see at once when another tab changed it)
        mine: { active: null, gen: 0 },     // the owner of the live keys when this page loaded them
        token: newId(),         // this page's name in a plan
        halted: false,          // frozen: this page saves nothing more and will reload
        swapping: false,        // this page runs a swap right now
        settling: false,        // this page waits for a swap (its own dead one, or another tab's) to end
        atStart: false,         // ...and found the plan when it loaded
        stuck: false,           // a swap could not be finished (no space); the next start tries again
        stuckSaid: false,       // ...and the learner was told
        pageReady: false,       // every script has run (A.ready)
        busy: false,            // an action of this page is running
        leaving: false,         // the page is reloading
        guarding: false         // inside the check before a save (section 9)
    };

    function usable() {
        return state.available && !state.foreign;
    }

    function activeProfile() {
        return findProfile(state.index.list, state.index.active);
    }

    // Saves the index. On success this page knows the new index too.
    function writeIndex(index) {
        const text = JSON.stringify(index);
        if (!rawSet(INDEX_KEY, text)) return false;
        state.index = index;
        state.seenText = text;
        holdLive();         // (the first account of this device: from now on swaps can happen)
        return true;
    }

    // "Save what you hold in memory, now": My Compass and the online account wait a
    // moment before they save, and save at once when the page closes (pagehide)
    function flushFeatures() {
        try {
            window.dispatchEvent(new Event("pagehide"));
        } catch (error) {
            // a browser without new Event(): the features keep their own timers
        }
    }

    // From now on this page saves nothing: the live keys change owner, or may have.
    // It tells the other tabs so, by giving up the lock "aicp:live" (section 7).
    function halt() {
        if (state.halted) return;
        state.halted = true;
        A.storage.freeze();
        letHeldGo();        // (what a page that was away kept back stays in its memory too: section 9)
        letGoLive();
    }

    // A calm veil over the page while a swap runs: nothing can be pressed
    let veil = null;

    function contentReady() {
        return A.has("profiles.title") && avatars().length > 0;
    }

    function showVeil() {
        if (veil || !document.body) return;
        veil = document.createElement("div");
        veil.className = "pf-veil";
        veil.setAttribute("role", "status");
        veil.setAttribute("data-overlay-keep", "");      // stays reachable over an open window (core.js)
        veil.tabIndex = -1;
        veil.innerHTML = '<p class="pf-veil-text"></p>';
        document.body.appendChild(veil);
        paintVeil();
        try {
            veil.focus({ preventScroll: true });
        } catch (error) {
            // the focus stays where it was
        }
    }

    function paintVeil() {
        if (veil && contentReady()) A.dom.setText(veil.firstChild, t("profiles.swapping"));
    }

    function hideVeil() {
        if (veil) veil.remove();
        veil = null;
    }

    // While a swap runs, no key press reaches the page either
    window.addEventListener("keydown", function (event) {
        if (!veil || event.ctrlKey || event.metaKey || event.altKey) return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }, true);

    /* =========================================================
       7. ONE AT A TIME: THE LOCKS
       Two Web Locks. The browser frees both by itself when a tab dies.
         "aicp:swap"  withLock(work) runs "work" while no other tab swaps,
                      tidies up, recovers or changes the index.
         "aicp:live"  every page holds it, together with the others, for
                      as long as it may save, and gives it up when it
                      freezes. A swap asks for it alone, so it gets it
                      when every other page has really stopped saving.
                      (Only on a device that has accounts: see holdLive.)
       Old browsers without Web Locks rely on the plan in the index
       ("by", "at") and on a fixed wait instead.
       ========================================================= */
    function lockManager() {
        try {
            const locks = window.navigator.locks;
            return locks && typeof locks.request === "function" ? locks : null;
        } catch (error) {
            return null;
        }
    }

    const NOT_FREE = {};

    function withLock(work) {
        const locks = lockManager();
        // (Without Web Locks: a moment first. A press that waited behind a long task is
        // handled before the other tabs' changes that waited with it: "work" would
        // change an index that is old news. With Web Locks the browser's answer
        // comes after those changes.)
        if (!locks) return wait(GRANT_SETTLE_MS).then(work);
        let started = false;
        function run() {
            started = true;
            return work();
        }
        return locks.request(LOCK_NAME, { ifAvailable: true }, function (lock) {
            return lock ? run() : NOT_FREE;
        }).then(function (result) {
            if (result !== NOT_FREE) return result;
            // Another tab is at work: wait for it, then a moment more, so that its
            // last writes have reached this tab
            return locks.request(LOCK_NAME, function () {
                return wait(GRANT_SETTLE_MS).then(run);
            });
        }).catch(function (error) {
            if (started) throw error;
            return work();          // the browser refused the lock itself: go on without it
        });
    }

    // Runs "work" once nobody else works on the plan in the index: with Web Locks
    // when the lock is free (and keeps it until the Promise that "work" returns has
    // ended), without them when the plan is gone or was left alone for too long and
    // this tab has taken it over.
    function whenFree(work) {
        const locks = lockManager();
        if (!locks) {
            pollUntilFree(work);
            return;
        }
        let started = false;
        locks.request(LOCK_NAME, function () {
            return wait(GRANT_SETTLE_MS).then(function () {
                started = true;
                return work();
            });
        }).catch(function (error) {
            if (started) guarded(function () { throw error; });     // reported in the console
            else pollUntilFree(work);
        });
    }

    // ----- "I may still save": the lock every page holds -----
    let liveHeld = false;       // this page holds "aicp:live": a swap in another tab waits for it
    let liveAsked = false;
    let releaseLive = null;

    // A device that never had an account has no index, and nothing can be swapped
    // there: its pages take no lock at all. (Most visitors never make an account,
    // and some browsers do not keep a page that holds a lock ready for the Back
    // button: such a page loads again instead of coming back at once.)
    function holdLive() {
        const locks = lockManager();
        if (!locks || liveAsked || state.halted || state.seenText === null) return;
        liveAsked = true;
        function over() {
            liveAsked = false;
            liveHeld = false;
            releaseLive = null;
        }
        try {
            locks.request(LIVE_LOCK, { mode: "shared" }, function () {
                if (state.halted) return undefined;         // too late: this page saves nothing any more
                liveHeld = true;
                return new Promise(function (resolve) { releaseLive = resolve; });
            }).then(over, over);
        } catch (error) {
            over();
        }
    }

    function letGoLive() {
        liveHeld = false;
        if (releaseLive) releaseLive();
    }

    // Runs "work" once every other page has stopped saving: this page gets the lock
    // "aicp:live" alone only when they have all let go of it. It waits at least
    // SETTLE_MS (for a tab that could not take the lock), and at most LIVE_WAIT_MS
    // for a tab that does not answer (the browser has put it to sleep): such a tab
    // keeps its saves back when it wakes up, until it has read the other tabs' changes
    // and looked at the index (section 9, "A page that was away").
    // Returns a Promise of what "work" returns.
    function whenOthersStopped(work, fresh) {
        const from = clock();
        const locks = lockManager();
        if (!locks || typeof window.AbortController !== "function") {
            // (fresh: the swap has only just written its plan. Without Web Locks that
            // takes the long wait: NOLOCK_SETTLE_MS in section 1 says why. A page that
            // finishes a plan that was left behind takes the short one: every other tab
            // saw that plan seconds ago, or was away and keeps its saves back.)
            const settle = !locks && fresh ? NOLOCK_SETTLE_MS : SETTLE_MS;
            // (a wait that took longer than it should: this page was stopped meanwhile,
            // and what the other tabs saved in that time has not reached it yet. A
            // moment for it.)
            return wait(settle).then(function () {
                return clock() - from > settle + 100 ? wait(GRANT_SETTLE_MS) : null;
            }).then(work);
        }
        const least = wait(SETTLE_MS);
        const control = new window.AbortController();
        const timer = setTimeout(function () { control.abort(); }, LIVE_WAIT_MS);
        let granted = false;
        return locks.request(LIVE_LOCK, { signal: control.signal }, function () {
            granted = true;
            clearTimeout(timer);
            // (the last saves of the other tabs are on their way to this one: a moment for
            // them, and one turn through the browser, in case this very page was stopped
            // during that moment: section 9, browserTurn)
            return Promise.all([least, wait(GRANT_SETTLE_MS)]).then(browserTurn).then(work);
        }).catch(function (error) {
            clearTimeout(timer);
            if (granted) throw error;       // "work" itself failed
            // no answer in time: go on, as a browser without locks does
            return least.then(browserTurn).then(work);
        });
    }

    // How many changes of other tabs (of any saved value) this page has been told about
    // (the "storage" event, section 9): while the number grows, the page is still
    // reading news, and what it sees may not be the last word
    let heard = 0;

    function pollUntilFree(work) {
        // The plan that looked dead at the last look, and when: { id, by, at, heard, since }
        let suspect = null;
        function look() {
            const index = readIndexNow();
            const plan = index && index.swap;
            if (!plan) {
                guarded(work);
                return;
            }
            // (A plan whose time lies far in the future is not fresh either: somebody set
            // the clock of the device back. It would keep every page waiting until then.)
            const age = Date.now() - plan.at;
            if (age < STALE_MS && age > -STALE_MS) {
                suspect = null;
                setTimeout(look, POLL_MS);
                return;
            }
            // Nobody touched the plan for a long time. Is the tab that wrote it gone? Or was
            // THIS tab away (asleep, or busy for seconds), and is only now reading, one
            // after the other, what the other tabs wrote meanwhile? Then the plan is old
            // news: its swap is long finished, and taking it over would write an old index
            // over the new one and undo a swap that is done. So the same plan must be
            // seen twice, with a wait in between during which this tab really ran and
            // was told of no change at all.
            const waited = suspect ? clock() - suspect.since : 0;
            const again = Boolean(suspect) && suspect.id === plan.id && suspect.by === plan.by &&
                suspect.at === plan.at && suspect.heard === heard;
            if (!again || waited > AWAY_MS) {
                suspect = { id: plan.id, by: plan.by, at: plan.at, heard: heard, since: clock() };
                setTimeout(look, POLL_MS);
                return;
            }
            suspect = null;
            // The tab that wrote it is gone. This tab takes it over, and checks a moment
            // later that no other tab did too.
            plan.by = state.token;
            plan.at = Date.now();
            if (!writeIndex(index)) {
                setTimeout(look, POLL_MS);
                return;
            }
            const claimed = clock();
            setTimeout(function () {
                const now = readIndexNow();
                // (stopped for seconds since the claim: what this tab sees may be old again)
                if (clock() - claimed <= AWAY_MS && now && now.swap && now.swap.by === state.token) guarded(work);
                else look();
            }, CLAIM_MS);
        }
        look();
    }

    /* =========================================================
       8. THE SWAP
       runSwap() is the whole of it for the tab that starts one. The steps
       after the wait (doSaving, doRestoring, commit) run in one go, with
       nothing in between that waits. recover() (section 9) uses the same
       steps for a swap that another page left unfinished.
       A request: { to: id or null, profile: a brand-new account or null, drop: true
       when the active account is being deleted }.
       ========================================================= */

    // The keys the new owner gets: its box, or the seed for a brand-new account and
    // for "nobody". null when its box is there but cannot be read, or when the storage
    // did not answer: then it is left alone.
    function targetKeys(index, plan) {
        if (plan.to === null || plan.profile) return plan.seed;
        const text = boxText(plan.to);
        if (text === undefined) return null;
        if (text === null) return findProfile(index.list, plan.to) ? plan.seed : null;   // never saved: it starts empty
        const box = parseBox(text, plan.to);
        return box ? box.keys : null;
    }

    // Removes the boxes the index calls rubbish. quiet: the caller saves the index itself.
    function emptyTrash(index, quiet) {
        if (!index.trash.length) return;
        index.trash.forEach(function (id) { dropBox(index, id); });
        index.trash = [];
        if (!quiet) writeIndex(index);
    }

    // The live keys have no owner, and another learner's keys are about to take their
    // place. If they hold anything a learner would miss, they first become the account
    // "Guest", so they are never thrown away. (It may be a ninth account: keeping
    // progress matters more.) This is decided in step 3 and not when the swap begins:
    // only now has every other tab saved what it still held in memory.
    // False when "Guest" was needed and the index could not be saved.
    function adoptGuest(index, live) {
        const plan = index.swap;
        if (index.active || !hasProgress(live)) return true;
        const others = plan.profile ? index.list.concat([plan.profile]) : index.list;
        const guest = makeProfile(uniqueName(t("profiles.guest"), others), null, others);
        index.list.push(guest);
        index.active = guest.id;
        plan.from = guest.id;
        plan.guest = true;
        // ("at" stays the moment the swap began: by it, a tab that wakes up only now
        // knows that it is too late to save)
        if (writeIndex(index)) {
            state.mine.active = guest.id;
            return true;
        }
        index.list.pop();
        index.active = null;
        plan.from = null;
        plan.guest = false;
        return false;
    }

    // The name of the account "Guest" that this swap made, or ""
    function guestOf(index, plan) {
        const guest = plan.guest ? findProfile(index.list, plan.from) : null;
        return guest ? guest.name : "";
    }

    function runSwap(index, request) {
        flushFeatures();                                    // step 1
        const live = readLive();
        if (!live) return fail("failed");
        const plan = {
            id: newId(),
            by: state.token,
            at: Date.now(),
            stage: "saving",
            from: index.active,             // null: nobody (see adoptGuest)
            to: request.to,
            drop: request.drop === true,
            guest: false,
            seed: pickKeys(live, SEED_KEYS),
            profile: request.profile || null
        };
        if (!targetKeys(index, plan)) return fail("damaged");
        emptyTrash(index, true);            // old rubbish first: this swap writes a box of its own
        index.swap = plan;
        if (!writeIndex(index)) return fail("noSpace");     // step 2 (nothing was changed if it fails)
        state.swapping = true;
        halt();
        showVeil();

        return whenOthersStopped(function () {
            return carryOut(plan.id);                       // steps 3 to 5
        }, true).then(function (outcome) {
            if (outcome.result === "stuck") {
                becomeStuck();
                return fail("noSpace");
            }
            if (outcome.result !== "done") {
                // Refused: nothing was moved. This page is frozen, so it starts again.
                const refusal = { kind: "refused", error: outcome.error || "busy" };
                if (outcome.guest) refusal.guest = outcome.guest;
                later(function () { leave(refusal, false); });
                return fail(outcome.error || "busy");
            }
            const notice = noticeFor(outcome);
            later(function () { leave(notice, true); });    // step 6
            return { ok: true };
        }).catch(function (error) {
            // Something nobody planned for. This page is frozen, so it starts again:
            // the next start finds the plan, if it is still there, and finishes or
            // undoes the swap (section 9).
            guarded(function () { throw error; });          // reported in the console
            later(function () { leave({ kind: "refused", error: "failed" }, false); });
            return fail("failed");
        });
    }

    function carryOut(planId) {
        const index = readIndexNow();
        const plan = index && index.swap;
        // Without Web Locks another tab may have taken the plan over: then it is theirs
        if (!plan || plan.id !== planId || plan.by !== state.token) return { result: "lost", error: "busy" };
        // ...or it may be taking it over at this very moment, when this tab comes to
        // its own swap seconds late (it was asleep between the plan and the move). Its
        // note in the index would arrive after this tab's commit and undo a swap that
        // is done: the wrong learner's box would go. So a late tab moves nothing. It
        // starts again, and its plan is undone like any plan that was left behind.
        if (!lockManager() && Date.now() - plan.at > NOLOCK_LATE_MS) return { result: "lost", error: "busy" };
        return moving(function () { return doSaving(index); });
    }

    // Runs the steps of a move in one go ("work" answers what became of the swap). In
    // a browser without Web Locks a move that hung for seconds in the middle stops
    // where it is (onTime, section 4): for the caller its plan is lost to another tab.
    function moving(work) {
        moveFrom = clock();
        try {
            return work();
        } catch (error) {
            if (error !== LATE) throw error;
            return { result: "lost", error: "busy" };
        } finally {
            moveFrom = null;
        }
    }

    // Step 3: the old owner's keys go into its box, checked. Then step 4.
    function doSaving(index) {
        const plan = index.swap;
        const live = readLive();
        if (!live) return abortSaving(index, "failed");
        const target = targetKeys(index, plan);
        if (!target) return abortSaving(index, "damaged");
        if (!plan.from && !adoptGuest(index, live)) return abortSaving(index, "noSpace");
        if (plan.from && !plan.drop) {
            const owner = findProfile(index.list, plan.from);
            if (!owner || !writeBox(owner, live)) return abortSaving(index, "noSpace");
        }
        if (!hasRoom(sizeOf(target) - sizeOf(live))) return abortSaving(index, "noSpace");
        plan.stage = "restoring";
        plan.at = Date.now();
        if (!writeIndex(index)) {
            plan.stage = "saving";
            return abortSaving(index, "noSpace");
        }
        return doRestoring(index, live);
    }

    // The swap stops while the plan says "saving": the live keys are complete and
    // still belong to the old owner. Its half-made box and the plan go. First the
    // index (it names the box as rubbish), then the box. (If "Guest" was made for
    // this swap, it stays: the live keys are its keys now, and the learner is told.)
    function abortSaving(index, error) {
        const plan = index.swap;
        index.swap = null;
        if (plan.from && !plan.drop) index.trash = union(index.trash, [plan.from]);
        if (writeIndex(index)) emptyTrash(index);
        return { result: "refused", error: error, guest: guestOf(index, plan) };
    }

    // Step 4: the new owner's keys take the place of the live keys. Then step 5.
    // This can be done again from the start at any time: both boxes are still there.
    // mine: the live keys as step 3 read them a moment ago (a page that finishes a
    // swap after a crash has none).
    function doRestoring(index, mine) {
        const plan = index.swap;
        // The old owner's box is the only other copy of what the live keys hold: before
        // they are replaced, it must be there and readable. Step 3 has checked it; but
        // a tab that saw the past (above all without Web Locks) may have undone this
        // very swap since, and removed the box as rubbish. Then nothing is replaced:
        // the live keys are still the old owner's, and the swap stops as in step 3.
        // (A storage that does not answer right now is another thing: nothing is touched.)
        if (plan.from && !plan.drop) {
            const text = boxText(plan.from);
            if (text === undefined) return { result: "stuck" };
            if (!parseBox(text, plan.from)) {
                plan.stage = "saving";
                plan.at = Date.now();
                return writeIndex(index) ? abortSaving(index, "failed") : { result: "stuck" };
            }
        }
        const target = targetKeys(index, plan);
        if (target && writeLive(target)) {
            clearSession();
            return commit(index);
        }
        // The new owner's keys could not be written (or its box cannot be read): back
        // to the old owner. Its keys come from its box, which is complete. An account
        // that is being deleted has no box, and neither have keys that belong to
        // nobody: they come back from "mine". (Without that, a deletion that met a full
        // storage would leave every page frozen, on every start, until there is room.)
        // Then the swap stops as in step 3.
        let old = mine || null;
        if (plan.from && !plan.drop) {
            const box = parseBox(rawGet(boxKey(plan.from)), plan.from);
            old = box ? box.keys : null;
        }
        if (old && writeLive(old)) {
            plan.stage = "saving";
            plan.at = Date.now();
            if (writeIndex(index)) return abortSaving(index, target ? "noSpace" : "damaged");
        }
        return { result: "stuck" };
    }

    // Step 5: one write of the index makes the new owner the active account
    function commit(index) {
        const plan = index.swap;
        const from = findProfile(index.list, plan.from);
        const to = plan.profile || findProfile(index.list, plan.to);
        const outcome = {
            result: "done",
            drop: plan.drop,
            added: Boolean(plan.profile),
            from: from ? from.name : "",
            to: to ? to.name : null,
            guest: guestOf(index, plan)
        };
        const rubbish = [];
        if (plan.profile) index.list.push(plan.profile);            // a brand-new account joins the list
        else if (plan.to) rubbish.push(plan.to);                    // its box: the data is live now
        if (plan.drop && plan.from) {
            index.list = index.list.filter(function (profile) { return profile.id !== plan.from; });
            rubbish.push(plan.from);
        }
        index.active = plan.to;
        index.gen = index.gen + 1;
        index.swap = null;
        index.trash = union(index.trash, rubbish);
        if (!writeIndex(index)) return { result: "stuck" };         // the plan is still saved: the next start finishes
        emptyTrash(index);
        return outcome;
    }

    // What to tell the learner after the reload
    function noticeFor(outcome) {
        let notice = { kind: "switched", name: outcome.to };
        if (outcome.drop) notice = { kind: "deleted", name: outcome.from, next: outcome.to };
        else if (outcome.added) notice = { kind: "added", name: outcome.to };
        if (outcome.guest) notice.guest = outcome.guest;
        return notice;
    }

    // A swap could not be finished and could not be undone (the storage is full
    // or broken). Nothing is lost: the plan and the boxes are still saved. This page
    // stays frozen and says so; the next start tries again.
    function becomeStuck() {
        state.stuck = true;
        state.swapping = false;
        hideVeil();
        sayStuck();
    }

    // Said once, and only when the page and its texts are ready (section 14 calls
    // this again then, for a swap that got stuck while the page was loading)
    function sayStuck() {
        if (!state.stuck || state.stuckSaid || !state.pageReady || !contentReady()) return;
        state.stuckSaid = true;
        render(false);
        A.toast(t("profiles.error.stuck"), "⚠️");
    }

    // Reloads the page. home: to the home page, at the top.
    function leave(notice, home) {
        if (state.leaving) return;
        state.leaving = true;
        if (notice) {
            if (home) notice.home = true;
            try {
                window.sessionStorage.setItem(NOTICE_KEY, JSON.stringify(notice));
            } catch (error) {
                // no session storage: the page reloads without a message
            }
        }
        if (home) {
            try {
                history.replaceState(history.state, "", window.location.pathname + window.location.search);
                history.scrollRestoration = "manual";       // the browser would scroll back down (set back after the reload)
            } catch (error) {
                // a page opened from a file may refuse this: it reloads where it is
            }
        }
        window.location.reload();
    }

    /* =========================================================
       9. OTHER TABS, START-UP AND RECOVERY
       ========================================================= */

    // The index is not the one this page knows. Called from the "storage" event, when
    // the tab is shown again, and before a save (inWrite). Returns a function to call
    // after that save, or null.
    function indexChanged(text, inWrite) {
        state.seenText = text;
        const parsed = parseIndexText(text);
        if (parsed.foreign) {
            state.foreign = true;
            later(changed);
            return null;
        }
        if (!parsed.index) return null;         // unreadable right now: the next page load repairs it
        const index = parsed.index;
        state.index = index;

        if (index.swap) {
            if (state.halted) {
                settle();
                return null;
            }
            // A swap has just started in another tab. In its first moments the live keys
            // still belong to the learner of this page: what waits in memory is saved now.
            // How long is "its first moments"? While this page holds the lock "aicp:live"
            // the swap waits for it (almost LIVE_WAIT_MS); without the lock, not long.
            // (A browser without Web Locks: most of the swap's fixed wait.)
            const age = Date.now() - index.swap.at;
            const patience = liveHeld ? LIVE_WAIT_MS - LIVE_MARGIN_MS : lockManager() ? FLUSH_WINDOW_MS : NOLOCK_FLUSH_MS;
            const early = index.swap.stage === "saving" && index.gen === state.mine.gen && age >= 0 && age < patience;
            if (early) {
                // (A plan this young is not old news, also for a page that was away: the
                // swap still waits for it. What it kept back is its own learner's: it is
                // written first, and what the features save now is not kept back again.)
                letHeldGo();
                lastTurn = clock();
                flushFeatures();
            }
            if (early && inWrite) {
                return function () {            // the save that is under way belongs to it too
                    halt();
                    settle();
                };
            }
            halt();
            settle();
            return null;
        }

        if (state.halted) {
            if (!state.settling) leaveAsWatcher();
            return null;
        }
        // "Create my account" in another tab gives the same live keys an owner: nothing
        // to reload. Any other change of owner means this page shows somebody else's data.
        const sameOwner = index.gen === state.mine.gen &&
            (index.active === state.mine.active || state.mine.active === null);
        if (!sameOwner) {
            halt();
            leaveAsWatcher();
            return null;
        }
        state.mine.active = index.active;
        holdLive();         // (another tab made the first account of this device)
        later(changed);
        return null;
    }

    function recheck() {
        if (!state.available || state.swapping || state.leaving) return;
        let text;
        try {
            text = window.localStorage.getItem(INDEX_KEY);
        } catch (error) {
            return;
        }
        if (text !== state.seenText) indexChanged(text, false);
    }

    // Waits until nobody works on the plan, finishes it if it is still there, reloads
    function settle() {
        if (state.settling) return;
        state.settling = true;
        showVeil();
        whenFree(function () {
            return abandonedPlan().then(recover).then(function (outcome) {
                if (outcome && (outcome.result === "late" || outcome.result === "lost")) {
                    // (without Web Locks: this tab came too late to its turn, or hung in
                    // the middle of it. It waits again.)
                    state.settling = false;
                    settle();
                    return;
                }
                const after = readIndexNow();
                if ((outcome && outcome.result === "stuck") || (after && after.swap)) {
                    state.settling = false;
                    becomeStuck();
                    return;
                }
                // This page was opened in the middle of its own unfinished swap: it tells the
                // learner what became of it. A tab that only watched says "in another tab".
                if (state.atStart && outcome && outcome.result === "done") leave(noticeFor(outcome), false);
                else leaveAsWatcher();
            }).catch(function (error) {
                // Nothing was deleted (dropBox sees to that). The page stays frozen and says so.
                guarded(function () { throw error; });      // reported in the console
                state.settling = false;
                becomeStuck();
            });
        });
    }

    // This page has the lock, and the index still holds a plan. Was it really left
    // behind? The page that had the lock before wrote its last changes a moment ago,
    // and they may still be on their way to this tab. So the plan counts as left
    // behind only if it is still there after a wait. Promise of the index, or null.
    function abandonedPlan() {
        const first = readIndexNow();
        if (!first || !first.swap) return Promise.resolve(null);
        return wait(RECOVER_WAIT_MS).then(function () {
            // (a page that was stopped during this wait would look before it has read
            // anything new: one turn through the browser first, where it can be asked)
            return lockManager() ? browserTurn() : null;
        }).then(function () {
            const index = readIndexNow();
            return index && index.swap ? index : null;
        });
    }

    // A swap that its page did not finish (start-up recovery, see the top of this
    // file). Promise of what became of it, or of null when there was none.
    function recover(index) {
        if (!index) return Promise.resolve(null);
        if (tooLate(index.swap)) return Promise.resolve({ result: "late" });
        if (index.swap.stage === "saving") {
            return Promise.resolve(moving(function () {
                return cameBack(index) ? commit(index) : abortSaving(index, "busy");
            }));
        }
        // The live keys are half moved. They are written again from the boxes, once
        // no other page can save in between.
        return whenOthersStopped(function () {
            const now = readIndexNow();
            if (!now || !now.swap) return null;
            if (tooLate(now.swap)) return { result: "late" };
            return moving(function () {
                if (cameBack(now)) return commit(now);
                return now.swap.stage === "saving" ? abortSaving(now, "busy") : doRestoring(now);
            });
        });
    }

    // Is this a plan that came back? A box goes only after the commit of the swap
    // that made its account the owner of the live keys. So when the new owner of a
    // plan is an account of the list and has no box, that swap was finished long ago.
    // The plan is old news, written once more by a tab that saw the past (the top of
    // this file says how that can happen), and the live keys are the new owner's,
    // with all it has earned since. Undoing such a plan would remove the old owner's
    // box, its only copy. Carrying it out again would write over the live keys (with
    // the seed: there is no box). So neither is done. Only the commit is, once more,
    // and nothing moves.
    // While the plan says saving, one more thing must be true: the old owner's box is
    // there and holds something else than the live keys. (A swap that really died
    // at that stage left no box, or a box that says what the live keys say.)
    function cameBack(index) {
        const plan = index.swap;
        if (plan.profile || plan.to === null || !findProfile(index.list, plan.to) || boxText(plan.to) !== null) return false;
        if (plan.stage === "restoring") return true;
        if (!plan.from || plan.drop) return false;
        const box = parseBox(boxText(plan.from), plan.from);
        const live = readLive();
        return Boolean(box) && Boolean(live) && !sameKeys(box.keys, live);
    }

    // Without Web Locks the plan itself is the lock, and this tab holds it only while
    // its own note in the plan ("by", "at": written by pollUntilFree) is fresh. Later
    // than LATE_MS another tab may be taking the plan over (see carryOut), or may have
    // finished it long ago while this tab was stopped: then what this tab sees is old,
    // and acting on it would undo what the others did. So it does nothing and waits for
    // the plan again.
    function tooLate(plan) {
        return !lockManager() && (plan.by !== state.token || Date.now() - plan.at > LATE_MS);
    }

    // This tab did not swap, but the swap is over (or the owner changed in another
    // way): it reloads, and says so if the owner is a different one now
    function leaveAsWatcher() {
        const index = readIndexNow() || emptyIndex();
        const moved = index.gen !== state.mine.gen || index.active !== state.mine.active;
        if (!moved) {
            leave(null, false);
            return;
        }
        clearSession();
        const active = findProfile(index.list, index.active);
        leave({ kind: "otherTab", name: active ? active.name : null }, false);
    }

    // ----- A page that was away -----
    // Everything above trusts what this page sees in the storage. A page that did not
    // run for a while must not: the browser brings it the other tabs' changes as
    // messages, and a page that was stopped (a phone does that to a tab in the
    // background) or that was busy with one long task has not read them yet. When it
    // goes on, a timer that is overdue can run first: it sees the old index, and it
    // saves. Meanwhile a swap in another tab has waited LIVE_WAIT_MS for this page and
    // has gone on without it: that save would land in the next learner's keys.
    // So a page that did not run for AWAY_MS keeps its saves back until it has read its
    // messages and looked at the index again. A.storage.get answers with what is kept
    // back, so the features notice nothing. Then the saves are written, a moment late.
    // If the owner has changed, the page freezes as always, and what it kept back stays
    // in its memory and goes with the reload: lost, but not in another learner's keys.
    // (On every device, with accounts or without: a tab can be older than the first
    // account, and sleep while two accounts are made in another tab.)
    let turning = 0;            // the timer that says "this page runs"
    let lastTick = 0;           // when that timer last ran (by clock(), section 2)
    let lastTurn = 0;           // the last moment at which this page had read everything that was waiting for it
    let held = null;            // while saves are kept back, a Map: key -> its JSON text, or null for "removed"
    let looking = null;         // Promise: the look at the index that ends the keeping back is over
    let realStore = null;       // get, set and remove of A.storage as core.js made them (guardSaves)
    let closing = false;        // a page that knows of no account is closing: it keeps nothing back (start, section 9)

    // The browser, when it can be asked a question (browserTurn). Only a page that
    // knows of accounts asks: on a device without accounts no page touches Web Locks
    // at all (holdLive, section 7, says why).
    function asker() {
        const locks = lockManager();
        return locks && state.seenText !== null && typeof locks.query === "function" ? locks : null;
    }

    function startTurns() {
        if (turning) return;
        lastTick = clock();
        lastTurn = lastTick;
        turning = setInterval(tick, TURN_MS);
    }

    // "This page runs." But a timer that runs is not a page that has read what the
    // other tabs wrote. After a long task the browser gives the page ONE of the changes
    // that wait for it, then the timers that are due (this one among them), and only
    // then the rest. In a test, tab 2 was busy for 1.4 s; meanwhile tab 1 saved one key
    // and began a swap; then this timer ran in tab 2, and a second task of 1.9 s came
    // right behind it and ended with a save. Tab 2 believed that it had been running
    // all the time, and it had not read the plan: its save went into the next
    // learner's keys. So a turn of this timer counts only with a proof:
    //   - the browser has answered a question that was asked in this turn. Its answer
    //     comes after everything that was waiting for the page when it asked;
    //   - where the browser cannot be asked: the timer came on time, so the page was
    //     free when it was due. (A weaker proof: a short task can hide in front of
    //     it. The wait of a swap without Web Locks allows for that, section 1.)
    // A page that knows of no account takes the timer's word as it is. Before one of
    // its saves can reach a second learner, two accounts must be made in another tab,
    // one after the other: a person needs longer for that than AWAY_MS.
    function tick() {
        const now = clock();
        const punctual = state.seenText === null || now - lastTick <= (document.hidden ? HIDDEN_TURN_MS : TURN_MS) + TURN_LATE_MS;
        lastTick = now;
        if (now - lastTurn > AWAY_MS) {
            lookAgain();
            return;
        }
        function counts() {
            if (now > lastTurn) lastTurn = now;
        }
        const locks = asker();
        if (!locks) {
            if (punctual) counts();
            return;
        }
        try {
            // (a browser that refuses the question: the timer's own word must do)
            Promise.resolve(locks.query()).then(counts, function () {
                if (punctual) counts();
            });
        } catch (error) {
            if (punctual) counts();
        }
    }

    // One turn through the browser, when it can be asked a question: its answer comes
    // after the messages that were waiting for this page. (Where it cannot be asked:
    // one more wait.) If the page was stopped again meanwhile: once more.
    // Promise of the moment the question was asked, if the browser answered it: what
    // the page knows now is as new as that moment. Of null otherwise.
    function browserTurn() {
        const from = clock();
        const locks = asker();
        let answer = null;
        let answered = false;
        if (locks) {
            try {
                // (a browser that refuses the question is given the wait instead)
                answer = Promise.resolve(locks.query()).then(function () { answered = true; }, function () { return wait(LOOK_MS); });
            } catch (error) {
                answer = null;
            }
        }
        const turn = answer ? Promise.race([answer, wait(LOOK_MAX_MS)]) : wait(LOOK_MS);
        return turn.then(function () {
            if (clock() - from > AWAY_MS) return browserTurn();
            return answered ? from : null;
        });
    }

    function lookAgain() {
        if (held || closing || state.halted || !realStore) return;
        const mine = new Map();
        held = mine;
        looking = wait(LOOK_MS).then(browserTurn).then(null, function () {
            return null;        // (the browser refused the question: by now the page has run for a while anyway)
        }).then(function (asked) {
            lastTurn = Math.max(lastTurn, typeof asked === "number" ? asked : clock());
            if (held !== mine) return;      // let go already: the page froze, or a swap began that still waits for it
            guarded(recheck);               // may freeze this page: then halt() has let the saves go, into its memory
            if (held === mine) letHeldGo();
        });
    }

    // Keeps one save back. It answers what A.storage would answer: false only for a
    // value that cannot be made into JSON at all.
    function keep(name, key, value) {
        if (name === "remove") {
            held.set(key, null);
            return undefined;
        }
        let text;
        try {
            text = JSON.stringify(value);
        } catch (error) {
            return false;
        }
        // (JSON has no text for "undefined": nobody could read that back, so the key is empty)
        held.set(key, typeof text === "string" ? text : null);
        return true;
    }

    // Writes what was kept back: each key once, with its last value. On a page that
    // is frozen by now, A.storage keeps it in memory instead, like every save there.
    function letHeldGo() {
        const list = held;
        held = null;
        if (!list) return;
        list.forEach(function (text, key) {
            if (text === null) realStore.remove.call(A.storage, key);
            else realStore.set.call(A.storage, key, JSON.parse(text));
        });
    }

    // The live keys as this page has them: with what it is keeping back (for a file)
    function liveAsHere() {
        const keys = readLive();
        if (!keys || !held) return keys;
        held.forEach(function (text, key) {
            if (!isPersonal(LIVE_PREFIX + key)) return;
            if (text === null) delete keys[key];
            else keys[key] = text;
        });
        return keys;
    }

    // ----- Before every save of the site -----
    // A.storage.set and A.storage.remove first look at the index. If another tab
    // changed it, this page deals with that before the save (it may freeze, and then
    // the save stays in memory). It costs one small read per save.
    function beforeSave() {
        if (state.halted || state.guarding || !state.available) return null;
        // (no timer has run for a long time: this page was away, and a save is the first thing it does)
        if (turning && clock() - lastTurn > AWAY_MS) lookAgain();
        let text;
        try {
            text = window.localStorage.getItem(INDEX_KEY);
        } catch (error) {
            return null;
        }
        if (text === state.seenText) return null;
        state.guarding = true;
        try {
            return guarded(function () { return indexChanged(text, true); }, null);
        } finally {
            state.guarding = false;
        }
    }

    function guardSaves() {
        realStore = { get: A.storage.get, set: A.storage.set, remove: A.storage.remove };
        ["set", "remove"].forEach(function (name) {
            A.storage[name] = function (key, value) {
                const after = beforeSave();
                // (a page that was away keeps the save back for a moment: see above)
                const result = held ? keep(name, key, value) : realStore[name].apply(A.storage, arguments);
                if (after) after();
                return result;
            };
        });
        // ...and reads what it keeps back, as if it were saved
        A.storage.get = function (key, fallback) {
            if (held && held.has(key)) {
                const text = held.get(key);
                return text === null ? fallback : JSON.parse(text);
            }
            return realStore.get.apply(A.storage, arguments);
        };
    }

    // ----- Start-up -----
    // The list of accounts, built again from the boxes (the index could not be read).
    // Nothing is deleted. A box that cannot be read stays where it is.
    function rebuildIndex(ids) {
        const index = emptyIndex();
        index.gen = Date.now();         // not the number any open page knows: they all reload
        ids.forEach(function (id) {
            const box = parseBox(rawGet(boxKey(id)), id);
            if (box && box.profile) index.list.push(box.profile);
        });
        index.list.sort(function (a, b) { return a.created - b.created || (a.id < b.id ? -1 : 1); });
        return index;
    }

    // Small repairs at the start, with the lock: rubbish boxes go (a box of the
    // active account too: its data is live, the live keys win), and a box that is
    // in no list (a load from a file that was cut off) joins the list
    function tidy() {
        recheck();
        if (state.halted || !usable()) return;
        const index = parseIndexText(state.seenText).index;
        if (!index || index.swap) return;
        let found = false;
        boxIds().forEach(function (id) {
            if (findProfile(index.list, id) || index.trash.indexOf(id) !== -1) return;
            const box = parseBox(rawGet(boxKey(id)), id);
            if (!box || !box.profile) return;
            index.list.push(box.profile);
            found = true;
        });
        if (found && !writeIndex(index)) return;
        emptyTrash(index);
        if (index.active) dropBox(index, index.active);
        if (found) changed();
    }

    function start() {
        if (!storageWorks() || typeof A.storage.freeze !== "function") return;
        state.available = true;

        const text = rawGet(INDEX_KEY);
        const parsed = parseIndexText(text);
        if (parsed.foreign) {
            state.foreign = true;
            return;
        }
        // The test value of hasRoom(), if a page died between writing it and removing
        // it. It can be megabytes, and it would take the learners' room until the next swap.
        rawRemove(ROOM_KEY);
        const boxes = boxIds();
        if (!parsed.index || (parsed.missing && boxes.length)) {
            const rebuilt = rebuildIndex(boxes);
            if (!writeIndex(rebuilt)) {
                state.index = rebuilt;
                state.seenText = text;
            }
        } else {
            state.index = parsed.index;
            state.seenText = text;
        }
        state.mine = { active: state.index.active, gen: state.index.gen };
        ownSession(state.mine.gen);

        guardSaves();
        startTurns();
        window.addEventListener("storage", function (event) {
            heard += 1;
            if (event.key === INDEX_KEY || event.key === null) recheck();
        });
        // A page that was away keeps its saves back for a moment, and if it closes in
        // that moment, they are gone. That is the price of never writing into another
        // learner's keys. A page that knows of no account at all does not pay it: when
        // it closes, it writes what it kept back, and what the features save in their
        // last moment is written at once, as it was before this site had accounts.
        // (This listener was added before any feature's: it runs first. flushFeatures
        // sends a "pagehide" of its own, which is not the page closing.)
        window.addEventListener("pagehide", function (event) {
            if (event.isTrusted === false || state.seenText !== null) return;
            closing = true;
            letHeldGo();
        });
        // A page that comes back (from the browser's back button, from another tab,
        // from sleep) may have missed that event, and the browser may have taken its lock
        window.addEventListener("pageshow", function () {
            closing = false;
            recheck();
            holdLive();
        });
        window.addEventListener("focus", recheck);
        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) recheck();
        });

        if (state.index.swap) {
            // A swap is unfinished, or runs in another tab right now. Either way no
            // feature of this page may save: it loads data that may be half moved.
            state.atStart = true;
            halt();
            settle();
            return;
        }
        holdLive();
        const index = state.index;
        const untidy = index.trash.length > 0 || boxes.some(function (id) {
            return id === index.active || !findProfile(index.list, id);
        });
        if (untidy) withLock(function () { guarded(tidy); }).catch(function () {});
    }

    /* =========================================================
       10. THE ACTIONS: CREATE, ADD, SWITCH, EDIT, DELETE
       Each one returns a Promise of { ok: true, ... } or
       { ok: false, error: "<code>" } and never throws. The codes:
       unavailable, busy, online, failed, nameEmpty, nameLong, nameTaken,
       full, notFound, noSpace, damaged (and for files, section 11:
       fileBig, fileWrong, fileJourney, fileNewer).
       ========================================================= */

    // While someone is signed in to the online account (js/account.js), that account
    // follows the live progress: the learner on this device must not change under it
    function signedInOnline() {
        return guarded(function () {
            const account = A.account;
            return Boolean(account && account.enabled && account.signedIn());
        }, false);
    }

    // Runs an action with the lock and with a fresh copy of the index to change
    function act(work) {
        if (!usable()) return Promise.resolve(fail("unavailable"));
        if (state.busy || state.halted) return Promise.resolve(fail("busy"));
        state.busy = true;
        return withLock(function () {
            // (a page that was away a moment ago, or was stopped while it waited for the
            // lock, first looks at the index again: section 9)
            if (turning && clock() - lastTurn > AWAY_MS) lookAgain();
            return Promise.resolve(held ? looking : null).then(function () {
                recheck();
                if (state.halted || !usable()) return fail("busy");
                letHeldGo();        // (...and writes what it kept back before anything is moved)
                const index = parseIndexText(state.seenText).index;
                return index && !index.swap ? work(index) : fail("busy");
            });
        }).then(null, function (error) {
            guarded(function () { throw error; });      // reported in the console
            return fail("failed");
        }).then(function (result) {
            if (!state.swapping) state.busy = false;
            return result;
        });
    }

    // The first account: the progress that is already here becomes its progress.
    // Only the index is written; nothing moves and nothing reloads.
    function createFirst(index, name, avatar) {
        const checked = checkName(name, index.list);
        if (checked.error) return fail(checked.error, { name: checked.name });
        if (index.list.length >= MAX_ACCOUNTS) return fail("full");
        const profile = makeProfile(checked.name, avatar, index.list);
        index.list.push(profile);
        index.active = profile.id;
        if (!writeIndex(index)) return fail("noSpace");
        state.mine.active = profile.id;
        changed();
        return { ok: true, id: profile.id };
    }

    // One more learner: a new account with empty progress and the look of the screen
    function addAccount(index, name, avatar) {
        if (signedInOnline()) return fail("online");
        const checked = checkName(name, index.list);
        if (checked.error) return fail(checked.error, { name: checked.name });
        if (index.list.length >= MAX_ACCOUNTS) return fail("full");
        const profile = makeProfile(checked.name, avatar, index.list);
        return runSwap(index, { to: profile.id, profile: profile });
    }

    function create(name, avatar) {
        return act(function (index) {
            return index.active ? addAccount(index, name, avatar) : createFirst(index, name, avatar);
        });
    }

    function add(name, avatar) {
        return act(function (index) {
            // Nobody owns the live keys and there is no progress in them: the new
            // account simply takes them
            if (!index.active && !hasProgress(readLive() || newMap())) return createFirst(index, name, avatar);
            return addAccount(index, name, avatar);
        });
    }

    function switchTo(id) {
        return act(function (index) {
            if (!findProfile(index.list, id)) return fail("notFound");
            if (id === index.active) return { ok: true };
            if (signedInOnline()) return fail("online");
            return runSwap(index, { to: id });
        });
    }

    // The name and the picture. No reload: features read the name from A.profiles.
    function rename(id, name, avatar) {
        return act(function (index) {
            const profile = findProfile(index.list, id);
            if (!profile) return fail("notFound");
            const checked = checkName(name, index.list, id);
            if (checked.error) return fail(checked.error, { name: checked.name });
            profile.name = checked.name;
            if (isAvatar(avatar)) profile.avatar = avatar;
            if (!writeIndex(index)) return fail("noSpace");
            changed();
            return { ok: true };
        });
    }

    function remove(id) {
        return act(function (index) {
            if (!findProfile(index.list, id)) return fail("notFound");
            if (signedInOnline()) return fail("online");
            if (id === index.active) {
                // The next account of the list takes over (one whose box can be read),
                // or nobody: then the device keeps its language, look and settings
                const next = index.list.filter(function (other) {
                    return other.id !== id && targetKeys(index, { to: other.id, seed: newMap() });
                })[0];
                return runSwap(index, { to: next ? next.id : null, drop: true });
            }
            // Another account: first the index (it names the box as rubbish), then the box
            index.list = index.list.filter(function (other) { return other.id !== id; });
            index.trash = union(index.trash, [id]);
            if (!writeIndex(index)) return fail("noSpace");
            emptyTrash(index);
            changed();
            return { ok: true };
        });
    }

    /* =========================================================
       11. AN ACCOUNT AS A FILE: SAVE AND LOAD
       A file is data from outside: it is checked strictly, nothing in
       it is ever run or shown as HTML, and it becomes a NEW account in
       the list. It never writes over the live data.
       ========================================================= */

    // "ai-compass-<name>.json": letters and digits of any alphabet, the rest becomes "-"
    function fileName(name) {
        let safe = "";
        try {
            safe = name.replace(new RegExp("[^\\p{L}\\p{N}]+", "gu"), "-");
        } catch (error) {
            safe = name.replace(/[^A-Za-z0-9]+/g, "-");     // a browser that does not know \p{L}
        }
        safe = safe.replace(/^-+|-+$/g, "").toLowerCase();
        return "ai-compass-" + (safe || "account") + ".json";
    }

    // The account as a file has it. Returns { ok, file, text, data } and downloads
    // nothing: the button in Settings does that (section 12).
    // No id: the active account, after asking the features to save.
    function exportData(id) {
        if (!usable()) return fail("unavailable");
        recheck();
        if (state.halted) return fail("busy");
        const index = state.index;
        const wanted = id === undefined || id === null ? index.active : id;
        const profile = findProfile(index.list, wanted);
        if (!profile) return fail("notFound");
        let keys;
        if (wanted === index.active) {
            flushFeatures();
            keys = liveAsHere();
        } else {
            // (no box at all: the account was never saved and is empty. A storage that
            // did not answer is another thing: an empty file would look like a saved one.)
            const text = boxText(wanted);
            const box = parseBox(text, wanted);
            keys = box ? box.keys : text === null ? newMap() : null;
        }
        if (!keys) return fail("damaged");
        const data = {
            app: FILE_APP,
            kind: FILE_KIND,
            v: FILE_VERSION,
            exported: new Date().toISOString(),
            profile: { name: nameOf(profile), avatar: avatarOf(profile) },
            keys: keys
        };
        return { ok: true, file: fileName(nameOf(profile)), text: JSON.stringify(data, null, 2), data: data };
    }

    function byteLength(text) {
        try {
            return new Blob([text]).size;
        } catch (error) {
            return text.length * 3;
        }
    }

    function isJSON(text) {
        try {
            JSON.parse(text);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Checks the text of a file (or an object). Returns { name, avatar, keys, skipped }
    // or { error }. Only keys with a plain name and a text that is valid JSON are kept.
    function readAccountFile(input) {
        let data = input;
        if (typeof input === "string") {
            if (input.length > FILE_MAX || byteLength(input) > FILE_MAX) return { error: "fileBig" };
            try {
                data = JSON.parse(input);
            } catch (error) {
                return { error: "fileWrong" };
            }
        }
        if (!isObject(data)) return { error: "fileWrong" };
        if (data.app === JOURNEY_APP) return { error: "fileJourney" };
        if (data.app !== FILE_APP || data.kind !== FILE_KIND) return { error: "fileWrong" };
        if (data.v !== FILE_VERSION) return { error: typeof data.v === "number" && data.v > FILE_VERSION ? "fileNewer" : "fileWrong" };
        if (!isObject(data.keys)) return { error: "fileWrong" };

        const keys = newMap();
        let kept = 0;
        let skipped = 0;
        Object.keys(data.keys).forEach(function (key) {
            const value = data.keys[key];
            const good = kept < FILE_KEYS_MAX && FILE_KEY_PATTERN.test(key) &&
                key.indexOf("account.") !== 0 && key !== "probe" &&
                typeof value === "string" && value.length <= FILE_VALUE_MAX && isJSON(value);
            if (!good) {
                skipped++;
                return;
            }
            keys[key] = value;
            kept++;
        });
        const profile = isObject(data.profile) ? data.profile : {};
        return {
            name: cutName(cleanName(profile.name), NAME_MAX),
            avatar: profile.avatar,
            keys: keys,
            skipped: skipped
        };
    }

    // The box of a file's account is written: is there still room to switch to it?
    // A switch puts the keys of the learner who leaves into a box (one more copy of
    // them) and the new owner's keys in their place. An account that fits as a box
    // but can never be opened would sit in the list for nothing, and it would take
    // the room that the learner who is here now needs for new progress.
    function roomToOpen(keys) {
        const mine = readLive() || newMap();
        return hasRoom(JSON.stringify(mine).length + Math.max(0, sizeOf(keys) - sizeOf(mine)) + FILE_SPARE);
    }

    // Adds the account of a file to the list (it is not opened: the learner decides).
    // Returns a Promise of { ok, id, name, skipped }.
    function importData(input) {
        const file = guarded(function () { return readAccountFile(input); }, { error: "fileWrong" });
        if (file.error) return Promise.resolve(fail(file.error));
        return act(function (index) {
            if (signedInOnline()) return fail("online");
            if (index.list.length >= MAX_ACCOUNTS) return fail("full");
            const profile = {
                id: newId(),
                name: uniqueName(file.name || t("profiles.defaultName"), index.list),
                avatar: isAvatar(file.avatar) ? file.avatar : firstAvatar(),
                created: Date.now()
            };
            // First the box, then the index: a box that is in no list yet loses nothing.
            // In between: is there room to open this account afterwards? (roomToOpen)
            if (!writeBox(profile, file.keys) || !roomToOpen(file.keys) ||
                !writeIndex(Object.assign({}, index, { list: index.list.concat([profile]) }))) {
                dropBox(index, profile.id);
                return fail("noSpace");
            }
            changed();
            return { ok: true, id: profile.id, name: profile.name, skipped: file.skipped };
        });
    }

    /* =========================================================
       12. THE GROUP IN THE SETTINGS WINDOW
       js/settings.js calls A.profiles.mount(section) every time the window
       opens and after every change of a setting: the first call builds
       the group, later ones only look if anything changed (a signature).
       The group has a line that says what happened, and below it one of:
       a sentence (storage blocked), the start (no account yet), the
       account with the other learners, or the small form.
       Names are put in with esc() or as text, never as HTML.
       ========================================================= */
    const ui = {
        root: null,         // the <section> of the Settings window
        title: null,
        line: null,         // the line that says what happened (role="status")
        offerBox: null,
        body: null,
        file: null,         // the hidden <input type="file">
        signature: "",      // what the group shows now
        form: null,         // { mode: "create" | "add" | "edit", name, avatar, error, sending }
        offer: null,        // the id of an account that was just loaded: "Switch to NAME"
        status: null,       // { parts, kind }: the line's message
        lineTimer: 0,
        closed: false       // the window was closed since the group was last drawn
    };
    let confirmers = [];    // the "Delete" buttons that wait for a second press (A.confirmPress)

    // A text of the content file inside an element. Core translates it again by
    // itself when the language changes (data-i18n).
    function label(tag, className, key, attributes) {
        return "<" + tag + ' class="' + className + '"' + (attributes || "") + ' data-i18n="' + key + '">' + esc(t(key)) + "</" + tag + ">";
    }

    function button(action, key, className, attributes) {
        return label("button", className, key, ' type="button" data-pf="' + action + '"' + (attributes || ""));
    }

    function partText(part) {
        return part.count === undefined ? t(part.key, part.values) : A.plural(part.key, part.count, part.values);
    }

    function partsText(parts) {
        return parts.map(partText).join(" ");
    }

    // The message for a refusal: { ok: false, error, name }
    function problemParts(result) {
        const key = "profiles.error." + result.error;
        return [{
            key: A.has(key) ? key : "profiles.error.failed",
            values: { name: result.name || "", max: result.error === "full" ? MAX_ACCOUNTS : NAME_MAX }
        }];
    }

    function groupOnScreen() {
        return Boolean(ui.root) && ui.root.getClientRects().length > 0;
    }

    // Says what happened, in words: in the group's own line (or under the form's
    // name field, for a refusal while the form is open) and as a toast. When the
    // line is on screen, a screen reader reads the line; the toast then stays
    // silent for it, so nothing is read twice.
    function say(parts, kind, icon) {
        const text = partsText(parts);
        if (ui.form && kind === "problem" && groupOnScreen()) {
            ui.form.error = parts;
            paintFormError();
        } else {
            ui.status = { parts: parts, kind: kind };
            paintStatus(true);
        }
        A.toast(text, icon || (kind === "problem" ? "⚠️" : "✅"));
        if (!groupOnScreen()) return;
        const stack = document.getElementById("toast-stack");
        if (stack && stack.lastElementChild) stack.lastElementChild.setAttribute("aria-hidden", "true");
    }

    // fresh: a new message. The line is emptied first, so the same words are read again.
    function paintStatus(fresh) {
        const line = ui.line;
        if (!line) return;
        const status = ui.status;
        line.classList.toggle("is-problem", Boolean(status) && status.kind === "problem");
        if (!fresh) {
            if (!ui.lineTimer) A.dom.setText(line, status ? partsText(status.parts) : "");
            return;
        }
        clearTimeout(ui.lineTimer);
        line.textContent = "";
        ui.lineTimer = setTimeout(function () {
            ui.lineTimer = 0;
            A.dom.setText(line, ui.status ? partsText(ui.status.parts) : "");
        }, STATUS_DELAY);
    }

    function paintFormError() {
        const form = ui.form;
        const box = ui.root && ui.root.querySelector("[data-pf-error]");
        const input = ui.root && ui.root.querySelector("[data-pf-name]");
        if (!form || !box || !input) return;
        A.dom.setText(box, form.error ? partsText(form.error) : "");
        if (form.error) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
    }

    // ----- What the group shows -----
    function onlineState() {
        return guarded(function () {
            const account = A.account;
            if (!account || !account.enabled) return 0;
            return account.signedIn() ? 2 : 1;
        }, 0);
    }

    function signature() {
        if (ui.form) return JSON.stringify(["form", ui.form.mode, usable(), state.stuck]);
        return JSON.stringify([usable(), state.stuck, state.seenText, A.lang, ui.offer, onlineState()]);
    }

    function removeButton(profile, key, className, locked) {
        return '<button type="button" class="' + className + '" data-pf="remove" data-id="' + esc(profile.id) + '" data-label="' + key + '"' +
            ' aria-label="' + esc(t("profiles.deleteNamed", { name: nameOf(profile) })) + '"' +
            ' aria-describedby="pf-warning-' + esc(profile.id) + '"' + locked + ">" +
            '<span class="pf-remove-label">' + esc(t(key)) + "</span></button>";
    }

    // What "Delete" will erase. It stands BEFORE its button: when it shows, the
    // button (the question by then) is pushed down, away from the finger that has
    // just pressed it (see paintRemove).
    function warningLine(profile) {
        return '<p class="pf-warning st-note is-problem" id="pf-warning-' + esc(profile.id) + '" hidden></p>';
    }

    function personRow(profile, locked) {
        const name = nameOf(profile);
        return '<li class="pf-person">' +
                '<span class="pf-person-who">' +
                    '<span class="pf-pic" aria-hidden="true">' + esc(avatarOf(profile)) + "</span>" +
                    '<span class="pf-person-name">' + esc(name) + "</span>" +
                "</span>" +
                warningLine(profile) +
                '<span class="pf-person-buttons">' +
                    button("switch", "profiles.switch", "btn btn-ghost btn-small",
                        ' data-id="' + esc(profile.id) + '" aria-label="' + esc(t("profiles.switchTo", { name: name })) + '"' + locked) +
                    removeButton(profile, "profiles.delete", "pf-quiet pf-remove", locked) +
                "</span>" +
            "</li>";
    }

    function othersRow(titleKey, others, locked) {
        if (!others.length) return "";
        return '<div class="st-row pf-others">' +
                label("p", "st-row-name", titleKey, ' id="pf-others-title"') +
                '<ul class="pf-list" aria-labelledby="pf-others-title">' +
                    others.map(function (profile) { return personRow(profile, locked); }).join("") +
                "</ul>" +
            "</div>";
    }

    // The online account (js/account.js): one row, only when online accounts are on
    function onlineRow() {
        const online = onlineState();
        if (!online) return "";
        return '<div class="st-row pf-online">' +
                label("p", "st-row-name", "profiles.online") +
                label("p", "st-hint", "profiles.onlineHint") +
                (online === 2 ? label("p", "st-note pf-online-note", "profiles.onlineLock") : "") +
                button("online", "profiles.onlineOpen", "btn btn-ghost btn-small") +
            "</div>";
    }

    function startHTML(index, locked) {
        return '<div class="st-row pf-start">' +
                label("p", "pf-intro", "profiles.intro") +
                button("create", "profiles.create", "btn btn-primary pf-main") +
                button("load", "profiles.load", "pf-quiet", locked) +
            "</div>" +
            othersRow("profiles.learners", index.list, locked) +
            (index.list.length ? '<div class="st-row pf-more">' + label("p", "st-hint pf-honest", "profiles.honest") + "</div>" : "") +
            onlineRow();
    }

    function accountHTML(index, active, locked) {
        const others = index.list.filter(function (profile) { return profile.id !== active.id; });
        return '<div class="st-row pf-card">' +
                '<span class="pf-pic pf-pic-big" aria-hidden="true">' + esc(avatarOf(active)) + "</span>" +
                '<div class="pf-card-text">' +
                    '<p class="pf-card-name" tabindex="-1" data-pf-card-name>' + esc(nameOf(active)) + "</p>" +
                    label("p", "st-hint", "profiles.cardNote") +
                "</div>" +
                '<div class="pf-buttons">' +
                    button("edit", "profiles.edit", "btn btn-ghost btn-small") +
                    button("export", "profiles.export", "btn btn-ghost btn-small") +
                "</div>" +
            "</div>" +
            othersRow("profiles.others", others, locked) +
            '<div class="st-row pf-more">' +
                '<div class="pf-buttons">' +
                    button("add", "profiles.add", "btn btn-ghost btn-small", locked) +
                    button("load", "profiles.loadShort", "pf-quiet", locked) +
                "</div>" +
                label("p", "st-hint pf-honest", "profiles.honest") +
            "</div>" +
            onlineRow() +
            '<div class="st-row pf-end">' +
                warningLine(active) +
                removeButton(active, "profiles.deleteMine", "pf-quiet pf-remove", locked) +
            "</div>";
    }

    function formHTML(form) {
        const titleKey = form.mode === "create" ? "profiles.formCreate" : form.mode === "add" ? "profiles.formAdd" : "profiles.formEdit";
        const submitKey = form.mode === "edit" ? "profiles.submitSave" : "profiles.submitCreate";
        const active = activeProfile();
        return '<form class="st-row pf-form" data-pf-form novalidate aria-labelledby="pf-form-title">' +
                label("p", "st-row-name pf-form-title", titleKey, ' id="pf-form-title"') +
                (form.mode === "add" && active
                    ? '<p class="st-hint" data-pf-add-hint>' + esc(t("profiles.addHint", { name: nameOf(active) })) + "</p>"
                    : "") +
                label("label", "pf-label", "profiles.name", ' for="pf-name"') +
                '<input class="pf-input" id="pf-name" data-pf-name type="text" maxlength="' + NAME_MAX + '" value="' + esc(form.name) + '" ' +
                    'autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false" enterkeyhint="done" ' +
                    'aria-describedby="pf-name-hint pf-error">' +
                label("p", "st-hint", "profiles.nameHint", ' id="pf-name-hint"') +
                '<p class="pf-error st-note is-problem" id="pf-error" data-pf-error role="alert"></p>' +
                '<fieldset class="pf-pics">' +
                    label("legend", "pf-label", "profiles.picture") +
                    '<div class="pf-grid">' +
                        avatars().map(function (avatar) {
                            const key = "profiles.avatar." + avatar.id;
                            return '<label class="pf-pic-option">' +
                                '<input type="radio" name="pf-avatar" value="' + esc(avatar.emoji) + '"' +
                                    (avatar.emoji === form.avatar ? " checked" : "") +
                                    ' aria-label="' + esc(t(key)) + '" title="' + esc(t(key)) + '"' +
                                    ' data-i18n-attr="aria-label:' + key + ",title:" + key + '">' +
                                '<span class="pf-pic-face" aria-hidden="true">' + esc(avatar.emoji) + "</span>" +
                            "</label>";
                        }).join("") +
                    "</div>" +
                "</fieldset>" +
                '<div class="pf-buttons pf-form-buttons">' +
                    label("button", "btn btn-primary", submitKey, ' type="submit"') +
                    button("cancel", "profiles.cancel", "btn btn-ghost") +
                "</div>" +
            "</form>";
    }

    function bodyHTML() {
        if (!usable()) return label("p", "st-row st-hint pf-plain", "profiles.unavailable");
        if (state.stuck) return label("p", "st-row st-note is-problem pf-plain", "profiles.error.stuck");
        if (ui.form) return formHTML(ui.form);
        const index = state.index;
        const active = activeProfile();
        const locked = onlineState() === 2 ? " disabled" : "";
        return active ? accountHTML(index, active, locked) : startHTML(index, locked);
    }

    // "Switch to NAME", right after an account was loaded from a file
    function paintOffer() {
        const profile = ui.form ? null : findProfile(state.index.list, ui.offer);
        const show = Boolean(profile) && profile.id !== state.index.active && usable() && !state.stuck;
        ui.offerBox.innerHTML = show
            ? '<button type="button" class="btn btn-primary btn-small" data-pf="switch" data-pf-offer data-id="' + esc(profile.id) + '"' +
                (onlineState() === 2 ? " disabled" : "") + ">" + esc(t("profiles.switchTo", { name: nameOf(profile) })) + "</button>"
            : "";
        A.dom.setHidden(ui.offerBox, !show);
    }

    // ----- "Delete": the second press -----
    // The first press shows what will be erased and arms the button for a few
    // seconds. It is painted in place: drawing the group again would lose the state.
    // A child taps twice: on the wrong button, and again when "nothing happened". So
    // the second press must be aimed at the question, never just repeated:
    //   - the warning shows ABOVE the question (it stands before the button in the
    //     page), so the question is pushed down: where "Delete" was pressed there is
    //     now the warning, which cannot be pressed;
    //   - while a row asks, the question is the only button of the row, on a line of
    //     its own: "Switch" would slide to where "Delete" was, and a second press
    //     would open the account (.is-asking in css/profiles.css);
    //   - if the question is out of sight after that, or under the finger after
    //     all, the window scrolls it to a better place (placeQuestion, below);
    //   - "Switch" is back when the question is answered, when its time has run out,
    //     and when anything else is pressed (a phone has no Esc key);
    //   - when its time has run out, a press where it stood does nothing for a
    //     moment: the finger may be on its way to it (shieldBox, below);
    //   - a key has no place on the screen, only a time: for half a second after the
    //     question appeared a key does not answer it (Enter pressed twice in a hurry,
    //     or a worn key that counts one press twice).
    function paintRemove(control, id, armed) {
        const profile = findProfile(state.index.list, id);
        const name = profile ? nameOf(profile) : "";
        const warning = t("profiles.deleteWarning", { name: name });
        A.dom.setText(control.querySelector(".pf-remove-label"), t(armed ? "profiles.deleteSure" : control.getAttribute("data-label")));
        A.dom.setAttr(control, "aria-label", armed ? t("profiles.deleteSure") : t("profiles.deleteNamed", { name: name }));
        control.classList.toggle("is-armed", armed);
        const row = control.closest(".pf-person");
        if (row) row.classList.toggle("is-asking", armed);
        const line = document.getElementById("pf-warning-" + id);
        if (line) {
            A.dom.setText(line, armed ? warning : "");
            A.dom.setHidden(line, !armed);
        }
        if (armed) A.announce(warning + " " + t("profiles.deleteSure"));
    }

    function bindRemoveButtons() {
        confirmers = [];
        ui.body.querySelectorAll('[data-pf="remove"]').forEach(function (control) {
            const id = control.getAttribute("data-id");
            let armedAt = 0;
            const confirmer = A.confirmPress(control, {
                timeout: CONFIRM_MS,
                enabled: function () { return !state.busy && !state.halted; },
                onArm: function () {
                    armedAt = askedAt = Date.now();
                    disarmAll(confirmer);
                    paintRemove(control, id, true);
                    placeQuestion(control);
                    // The warning has moved things: the second tap of a double tap
                    // must not count as the second press (see shield() below). And if
                    // the question could not get away from the finger (a very low
                    // window), a press at that very place never answers it: the
                    // learner presses the question somewhere else.
                    shield(underLastPress(control) ? CONFIRM_MS + ASK_SHIELD_MS : SHIELD_MS);
                },
                onDisarm: function () {
                    // Nobody answered and its time has run out (a little less counts
                    // too: clocks are not exact)
                    if (Date.now() - armedAt >= CONFIRM_MS - 100) shieldBox(control);
                    paintRemove(control, id, false);
                },
                onConfirm: function () { removeNow(id); }
            });
            confirmers.push(confirmer);
        });
    }

    // Takes every question back (but not the one of "except"). True if there was one.
    function disarmAll(except) {
        let any = false;
        confirmers.forEach(function (confirmer) {
            if (confirmer === except || !confirmer.armed) return;
            any = true;
            confirmer.disarm();
        });
        return any;
    }

    // ----- Drawing -----
    function render(force) {
        if (!ui.root || !contentReady()) return;
        const now = signature();
        if (!force && now === ui.signature) return;
        ui.signature = now;
        ui.body.innerHTML = bodyHTML();
        bindRemoveButtons();
        paintOffer();
        paintStatus(false);
        paintFormError();
    }

    function focusIn(selector) {
        const target = ui.root && ui.root.querySelector(selector);
        if (!target) return false;
        target.focus({ preventScroll: false });
        return true;
    }

    // The window was closed: the next time it opens the group starts plain,
    // without an old message or a half-filled form
    function forget() {
        ui.form = null;
        ui.offer = null;
        ui.status = null;
        clearTimeout(ui.lineTimer);
        ui.lineTimer = 0;
        if (ui.line) ui.line.textContent = "";
    }

    function build(element) {
        ui.root = element;
        ui.signature = "";
        element.classList.add("pf");
        element.setAttribute("aria-labelledby", "pf-title");
        element.innerHTML =
            label("h3", "st-group-title", "profiles.title", ' id="pf-title" tabindex="-1"') +
            '<p class="pf-status st-note" role="status"></p>' +
            '<div class="pf-offer" hidden></div>' +
            '<div class="pf-body"></div>' +
            '<input type="file" class="pf-file" accept=".json,application/json" tabindex="-1" hidden>';
        ui.title = element.querySelector(".st-group-title");
        ui.line = element.querySelector(".pf-status");
        ui.offerBox = element.querySelector(".pf-offer");
        ui.body = element.querySelector(".pf-body");
        ui.file = element.querySelector(".pf-file");
        element.addEventListener("click", onClick);
        element.addEventListener("submit", onSubmit);
        element.addEventListener("input", onInput);
        element.addEventListener("change", onChange);
        element.hidden = false;
    }

    // A.profiles.mount(element): called by js/settings.js. It must be cheap and
    // must never throw: the whole Settings window is drawn by the same function.
    function mount(element) {
        guarded(function () {
            if (!element || !contentReady()) return;
            if (ui.root !== element) build(element);
            if (ui.closed) {
                ui.closed = false;
                forget();
            }
            render(false);
        });
    }

    // ----- A double tap must not press what has moved under the finger -----
    // When the form opens or closes, or a row leaves the list, everything below
    // moves, and the second tap of a double tap would land on another button (even
    // on one of the next group: "Pro design"). So for a moment after such a change,
    // a press at the same place inside the Settings window does nothing.
    // A key press has no place on the screen (detail 0), so it is never stopped by
    // its place. Only on a "Sure?" that has just appeared it is stopped, by the time.
    // (SHIELD_MS and SHIELD_PX are in section 1.)
    let lastPress = null;       // { x, y }: where the mouse or the finger pressed last
    let shielded = null;        // { x, y, until }
    let shieldedBox = null;     // { left, top, right, bottom, until }: where a "Sure?" stood
    let askedAt = 0;            // when a "Sure?" last began to ask

    function shield(ms) {
        if (lastPress) shielded = { x: lastPress.x, y: lastPress.y, until: Date.now() + (ms || SHIELD_MS) };
    }

    // The time of a "Sure?" has run out: "Switch" and "Delete" are back in its place.
    // A finger that was on its way to the question would press one of them.
    function shieldBox(control) {
        const box = control.getBoundingClientRect();
        shieldedBox = { left: box.left, top: box.top, right: box.right, bottom: box.bottom, until: Date.now() + ASK_SHIELD_MS };
    }

    // The part of the Settings window that scrolls (null: the page itself does)
    function scrollBox(element) {
        let box = element.parentElement;
        while (box && box !== document.body && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
        return box && box !== document.body ? box : null;
    }

    // Where the question stands after the first press. Usually nothing is to be
    // done: the warning has pushed it down, away from the finger. Two cases are left:
    //   - It is out of sight now (with big letters the warning is long, and "Delete"
    //     is often pressed near the lower edge of what the window shows). The window
    //     scrolls just far enough to show it at its lower edge, with the warning
    //     above it. If that is where the finger is, it stops above the finger.
    //   - It is in sight, but where the finger is (another question, above this one,
    //     has just closed, and everything moved up by about one warning). The window
    //     scrolls it to just below the finger: then the warning is under the finger,
    //     as usual. If there is no room for that, it goes above the finger.
    function placeQuestion(control) {
        const box = scrollBox(control);
        const area = box ? box.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
        const top = Math.max(area.top, 0);
        // The lower edge: as far from the edge of the window as the last thing in the
        // window is (on a phone that keeps clear of the bar at the bottom of the screen)
        const bottom = Math.min(area.bottom, window.innerHeight) - Math.max(VIEW_EDGE, box ? parseFloat(getComputedStyle(box).paddingBottom) || 0 : 0);
        const now = control.getBoundingClientRect();
        const inSight = now.top >= top && now.bottom <= Math.min(area.bottom, window.innerHeight);
        // The finger, if it pressed in the column of the question (elsewhere it cannot meet it)
        const finger = lastPress && lastPress.x > now.left - KEEP_PX && lastPress.x < now.right + KEEP_PX ? lastPress.y : null;
        const close = finger !== null && finger > now.top - KEEP_PX && finger < now.bottom + KEEP_PX;
        if (inSight && !close) return;
        let goal;       // where the upper edge of the question goes (null: above the finger)
        if (inSight) {
            goal = finger + KEEP_PX;
            const room = box ? box.scrollTop : window.scrollY;     // what scrolls can come down this far
            if (goal + now.height > bottom || goal - now.top > room) goal = null;
        } else {
            goal = bottom - now.height;
            if (finger !== null && finger > goal - KEEP_PX) goal = null;
        }
        if (goal === null) goal = Math.max(finger - KEEP_PX - now.height, top);
        const move = now.top - goal;
        if (box) box.scrollTop += move;
        else window.scrollBy(0, move);
    }

    // True if the last press was at a place where "control" is now
    function underLastPress(control) {
        if (!lastPress) return false;
        const box = control.getBoundingClientRect();
        return lastPress.x >= box.left && lastPress.x <= box.right && lastPress.y >= box.top && lastPress.y <= box.bottom;
    }

    window.addEventListener("click", function (event) {
        const target = event.target;
        if (event.detail) {
            const here = { x: event.clientX, y: event.clientY };
            const same = shielded && Date.now() < shielded.until &&
                Math.abs(here.x - shielded.x) < SHIELD_PX && Math.abs(here.y - shielded.y) < SHIELD_PX;
            const stood = shieldedBox && Date.now() < shieldedBox.until &&
                here.x >= shieldedBox.left && here.x <= shieldedBox.right &&
                here.y >= shieldedBox.top && here.y <= shieldedBox.bottom;
            const panel = ui.root && (ui.root.closest('[role="dialog"]') || ui.root);
            if ((same || stood) && panel && panel.contains(target)) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            lastPress = here;
        } else {
            lastPress = null;       // a key: what it does has no place that a finger could press again
        }
        // A press anywhere but on a "Sure?" takes that question back (with the keyboard
        // too). The press itself goes on to whatever it was meant for.
        const onQuestion = Boolean(target) && typeof target.closest === "function" && Boolean(target.closest(".pf-remove.is-armed"));
        // A key on a question that has only just appeared is the same press once more
        // (see paintRemove): it is no answer, and the question goes on asking
        if (onQuestion && !event.detail && Date.now() - askedAt < SHIELD_MS) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        if (!onQuestion && disarmAll() && event.detail) shield();
    }, true);

    // ----- The form -----
    function openForm(mode) {
        const active = activeProfile();
        ui.form = {
            mode: mode,
            name: mode === "edit" && active ? nameOf(active) : "",
            avatar: mode === "edit" && active ? avatarOf(active) : freeAvatar(state.index.list),
            error: null,
            sending: false
        };
        ui.status = null;       // an old message would read as if it were about this form
        disarmAll();
        render(true);
        shield();
        const input = ui.root.querySelector("[data-pf-name]");
        if (!input) return;
        input.focus();
        if (mode === "edit") input.select();
    }

    // back: the focus returns to the button that opened the form
    function closeForm(back) {
        const form = ui.form;
        if (!form) return;
        ui.form = null;
        render(true);
        shield();
        if (back && !focusIn('[data-pf="' + form.mode + '"]')) ui.title.focus();
    }

    function submitForm() {
        const form = ui.form;
        if (!form || form.sending) return;
        const input = ui.root.querySelector("[data-pf-name]");
        const picked = ui.root.querySelector('input[name="pf-avatar"]:checked');
        const name = input ? input.value : form.name;
        const avatar = picked ? picked.value : form.avatar;
        const active = activeProfile();
        form.sending = true;
        const action = form.mode === "create" ? create(name, avatar)
            : form.mode === "add" ? add(name, avatar)
            : rename(active ? active.id : "", name, avatar);
        action.then(function (result) {
            form.sending = false;
            if (!result.ok) {
                if (ui.form !== form) return;
                refused(result);
                if (/^name/.test(result.error)) focusIn("[data-pf-name]");
                return;
            }
            if (state.swapping) return;         // a new learner: the page reloads
            if (ui.form === form) ui.form = null;
            const now = activeProfile();
            const done = form.mode === "edit"
                ? [{ key: "profiles.edited" }]
                : [{ key: "profiles.created", values: { name: now ? nameOf(now) : "" } }];
            say(done, "done", form.mode === "edit" ? "✅" : "👋");
            render(true);
            shield();
            if (form.mode === "edit") focusIn('[data-pf="edit"]');
            else focusIn("[data-pf-card-name]");
        });
    }

    // ----- The buttons -----
    // An action was refused: the learner is told why. (A page that is about to
    // reload says it after the reload instead, see leave() and section 13.)
    function refused(result) {
        if (!state.halted) say(problemParts(result), "problem");
    }

    function switchNow(id) {
        switchTo(id).then(function (result) {
            if (!result.ok) refused(result);
        });
    }

    function removeNow(id) {
        const profile = findProfile(state.index.list, id);
        const name = profile ? nameOf(profile) : "";
        remove(id).then(function (result) {
            if (!result.ok) {
                refused(result);
                return;
            }
            if (state.swapping) return;         // it was the active account: the page reloads
            say([{ key: "profiles.deleted", values: { name: name } }], "done", "🗑️");
            render(true);
            shield();
            ui.title.focus();
        });
    }

    function download(name, text) {
        const address = URL.createObjectURL(new Blob([text], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = address;
        link.download = name;
        link.hidden = true;
        ui.root.appendChild(link);          // inside the window: the rest of the page is inert
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(address); }, URL_LIFE);
    }

    function exportNow() {
        const result = exportData();
        if (!result.ok) {
            say(problemParts(result), "problem");
            return;
        }
        download(result.file, result.text);
        say([{ key: "profiles.exported", values: { file: result.file } }], "done", "💾");
    }

    function loaded(result) {
        if (!result.ok) {
            say(problemParts(result), "problem");
            return;
        }
        const parts = [{ key: "profiles.imported", values: { name: result.name } }];
        if (result.skipped) parts.push({ key: "profiles.skipped", count: result.skipped });
        ui.offer = result.id;
        ui.form = null;
        say(parts, "done", "📂");
        render(true);
        focusIn("[data-pf-offer]");
    }

    function fileChosen() {
        const file = ui.file.files && ui.file.files[0];
        ui.file.value = "";
        if (!file) return;
        if (file.size > FILE_MAX) {
            loaded(fail("fileBig"));
            return;
        }
        file.text().then(function (text) {
            return importData(text);
        }, function () {
            return fail("fileRead");
        }).then(loaded);
    }

    function onClick(event) {
        const control = event.target.closest("[data-pf]");
        if (!control || control.disabled || !ui.root.contains(control)) return;
        const action = control.getAttribute("data-pf");
        if (action === "remove") return;            // A.confirmPress listens on the button itself
        if (state.busy || state.halted) return;
        if (action === "create" || action === "edit") {
            openForm(action);
        } else if (action === "add") {
            if (state.index.list.length >= MAX_ACCOUNTS) say(problemParts(fail("full")), "problem");
            else openForm("add");
        } else if (action === "cancel") {
            closeForm(true);
        } else if (action === "switch") {
            switchNow(control.getAttribute("data-id"));
        } else if (action === "export") {
            exportNow();
        } else if (action === "load") {
            ui.file.value = "";
            ui.file.click();
        } else if (action === "online") {
            guarded(function () { A.account.open(); });
        }
    }

    function onSubmit(event) {
        if (!event.target.matches("[data-pf-form]")) return;
        event.preventDefault();
        submitForm();
    }

    function onInput(event) {
        if (!ui.form || !event.target.matches("[data-pf-name]")) return;
        ui.form.name = event.target.value;
        if (ui.form.error) {
            ui.form.error = null;
            paintFormError();
        }
    }

    function onChange(event) {
        if (event.target === ui.file) fileChosen();
        else if (ui.form && event.target.name === "pf-avatar") ui.form.avatar = event.target.value;
    }

    // Esc: first it takes back a "Delete" that waits for its second press, then it
    // closes the form. Only the next Esc closes the Settings window.
    // The key is ours when the focus is in the group, and also when it is nowhere:
    // a press on an empty spot takes the focus away (the armed button itself often
    // moves from under the pointer), and the learner still means "take that back".
    // An armed "Delete" is taken back from anywhere in the Settings window.
    // (This listener runs before core's: core leaves a key alone that was handled.)
    function settingsOnTop() {
        return guarded(function () { return A.overlays.top() === "settings"; }, false);
    }

    window.addEventListener("keydown", function (event) {
        if (event.key !== "Escape" && event.key !== "Esc") return;
        if (event.defaultPrevented || event.isComposing || !ui.root) return;
        const target = event.target;
        const inGroup = ui.root.contains(target);
        const nowhere = !inGroup && (target === document.body || target === document.documentElement) && groupOnScreen() && settingsOnTop();
        const panel = ui.root.closest('[role="dialog"]');
        const inWindow = inGroup || nowhere || (Boolean(panel) && panel.contains(target) && settingsOnTop());
        if (inWindow && disarmAll()) {
            event.preventDefault();
        } else if ((inGroup || nowhere) && ui.form) {
            event.preventDefault();
            closeForm(true);
        }
    }, true);

    // The Settings window closed (core tells every window that opens or closes)
    A.on("overlay", function (detail) {
        if (!ui.root || !detail || !Array.isArray(detail.open)) return;
        if (detail.open.indexOf("settings") === -1) {
            ui.closed = true;
            disarmAll();
        }
    });

    // The online account signed in or out: buttons lock or unlock
    A.on("account", function () { render(false); });

    /* =========================================================
       13. THE GREETING ON THE HOME PAGE, THE CTRL+K COMMAND,
           MESSAGES AFTER A RELOAD
       ========================================================= */

    // Opens the Settings window at the account. (A.settings.open may learn to do
    // this itself from its argument; doing it here as well does no harm.)
    function openAccount() {
        const settings = A.settings;
        if (!settings || typeof settings.open !== "function") return;
        settings.open("account");
        if (!ui.root || !groupOnScreen()) return;
        ui.title.focus({ preventScroll: true });
        // The part of the window that scrolls: the group goes to its top
        const box = scrollBox(ui.root);
        if (box) box.scrollTop += ui.root.getBoundingClientRect().top - box.getBoundingClientRect().top - SCROLL_GAP;
    }

    // "Hi, NAME!" at the top of the home page: a button that opens the account.
    // It is built here (index.html knows nothing about accounts) and waits, with its
    // room already taken, until the texts are loaded.
    let hello = null;

    function buildHello() {
        const place = document.querySelector(".hero-text");
        if (!place || hello) return;
        hello = document.createElement("button");
        hello.type = "button";
        hello.className = "pf-hello is-waiting";
        hello.hidden = !activeProfile();
        hello.innerHTML = '<span class="pf-hello-pic" aria-hidden="true"></span><span class="pf-hello-text"></span>';
        hello.addEventListener("click", openAccount);
        place.insertBefore(hello, place.firstChild);
    }

    function paintHello() {
        if (!hello || !contentReady()) return;
        const active = usable() ? activeProfile() : null;
        A.dom.setHidden(hello, !active);
        if (!active) return;
        const name = nameOf(active);
        A.dom.setText(hello.firstChild, avatarOf(active));
        A.dom.setText(hello.lastChild, t("profiles.hello", { name: name }));
        A.dom.setAttr(hello, "aria-label", t("profiles.helloLabel", { name: name }));
        hello.classList.remove("is-waiting");
    }

    // The accounts changed (here or in another tab): everything that shows them follows
    function changed() {
        paintHello();
        render(false);
        A.emit("profiles", { active: api.active, list: api.list() });
    }

    A.on("language", function () {
        paintHello();
        paintVeil();
        render(false);
        // An open form is not drawn again (the learner may be typing): core has
        // translated its plain texts, the two with a name in them follow here
        const hint = ui.root && ui.root.querySelector("[data-pf-add-hint]");
        const active = activeProfile();
        if (hint && active) A.dom.setText(hint, t("profiles.addHint", { name: nameOf(active) }));
        paintFormError();
    });

    A.registerCommand({
        id: "profiles-open",
        group: "settings.cmdGroup",
        icon: "👤",
        title: function () { return t("profiles.cmd"); },
        keywords: "account profile learner user name nickname picture avatar switch create family class " +
            "аккаунт профиль ученик пользователь имя ник картинка аватар сменить создать семья класс",
        run: openAccount
    });

    // ----- After a reload: what happened -----
    function takeNotice() {
        try {
            const text = window.sessionStorage.getItem(NOTICE_KEY);
            if (text === null) return null;
            window.sessionStorage.removeItem(NOTICE_KEY);
            const notice = JSON.parse(text);
            return isObject(notice) ? notice : null;
        } catch (error) {
            return null;
        }
    }

    function noticeName(value) {
        return typeof value === "string" && value ? cutName(cleanName(value), NAME_MAX) : t("profiles.defaultName");
    }

    function showNotice(notice) {
        const name = noticeName(notice.name);
        if (notice.kind === "refused") {
            openAccount();
            say(problemParts(fail(typeof notice.error === "string" ? notice.error : "failed")), "problem");
        } else if (notice.kind === "switched") {
            A.toast(t("profiles.switched", { name: name }), "👋");
        } else if (notice.kind === "added") {
            A.toast(t("profiles.added", { name: name }), "👋");
        } else if (notice.kind === "deleted") {
            if (typeof notice.next === "string") A.toast(t("profiles.deletedNext", { name: name, next: noticeName(notice.next) }), "🗑️");
            else A.toast(t("profiles.deletedLast", { name: name }), "🗑️");
        } else if (notice.kind === "otherTab") {
            if (typeof notice.name === "string") A.toast(t("profiles.otherTab", { name: name }), "👋");
            else A.toast(t("profiles.otherTabNone"), "👋");
        }
        if (typeof notice.guest === "string" && notice.guest) A.toast(t("profiles.guestKept", { name: noticeName(notice.guest) }), "📦");
    }

    // A tab in the background shows its message when the learner comes back to it
    function whenVisible(callback) {
        if (!document.hidden) {
            callback();
            return;
        }
        document.addEventListener("visibilitychange", function shown() {
            if (document.hidden) return;
            document.removeEventListener("visibilitychange", shown);
            callback();
        });
    }

    /* =========================================================
       14. THE PUBLIC API AND THE START
       AICompass.profiles:
         available            false when the browser blocks storage (accounts cannot work)
         active               { id, name, avatar } of the learner whose data is live, or null
         list()               every account: [{ id, name, avatar, active }]
         onChange(callback)   callback({ active, list }) after every change, here or in
                              another tab; returns a function that stops listening
         create(name, avatar)       the first account: the progress here becomes its progress
         add(name, avatar)          one more learner, with empty progress (the page reloads)
         switchTo(id)               (the page reloads)
         rename(id, name, avatar)   the name and the picture (avatar may be left out)
         remove(id)                 deletes an account for good (the page reloads if it was active)
         importData(textOrObject)   an account file becomes a new account of the list
             each returns a Promise of { ok: true, ... } or { ok: false, error: "<code>" }
         exportData(id)             -> { ok, file, text, data }: the account as a file has it
                                    (no id: the active account)
         open()               opens the Settings window at the account
         mount(element)       draws the group into the Settings window (js/settings.js)
         max, nameMax         8 accounts, 24 characters
       A picture is one of the emoji of js/content/profiles.js.
       ========================================================= */
    function publicProfile(profile, active) {
        const copy = { id: profile.id, name: nameOf(profile), avatar: avatarOf(profile) };
        if (active !== undefined) copy.active = active;
        return copy;
    }

    const api = {
        get available() { return usable(); },
        get active() {
            const active = usable() ? activeProfile() : null;
            return active ? publicProfile(active) : null;
        },
        list: function () {
            if (!usable()) return [];
            return state.index.list.map(function (profile) {
                return publicProfile(profile, profile.id === state.index.active);
            });
        },
        onChange: function (callback) { return A.on("profiles", callback); },
        create: create,
        add: add,
        switchTo: switchTo,
        rename: rename,
        remove: remove,
        exportData: exportData,
        importData: importData,
        open: openAccount,
        mount: mount,
        max: MAX_ACCOUNTS,
        nameMax: NAME_MAX
    };

    A.feature("profiles", api);

    // First of all, before any feature loads its data: is a swap unfinished?
    start();
    buildHello();

    // The message of the swap that reloaded this page. A page that is about to
    // reload once more (it found a plan) leaves the message for the next load.
    const notice = state.halted ? null : takeNotice();

    A.ready(function () {
        state.pageReady = true;
        paintHello();
        paintVeil();
        sayStuck();
        if (!notice) return;
        if (notice.home === true) {
            // The swap asked the browser not to scroll back down; from now on it may again
            window.addEventListener("load", function () {
                setTimeout(function () {
                    try {
                        history.scrollRestoration = "auto";
                    } catch (error) {
                        // nothing depends on it
                    }
                }, 0);
            });
        }
        whenVisible(function () { showNotice(notice); });
    });
})();
