/* AI Compass: counts visits once a day per device, without personal data (privacy.html,
   hello() in supabase/schema.sql). Off while js/config.js is empty, on localhost, file: or
   for robots (unless ?count-test=1), with Do Not Track or Global Privacy Control, and
   without storage. Plain pages load it too. */
(function () {
    "use strict";
    var KEY = "aic-visitor"; // no "aic:": local accounts and sync never copy it
    var c = window.AICompassConfig || {}, nav = navigator, loc = location, store, me;
    var url = String(c.supabaseUrl || "").replace(/\/+$/, ""), key = c.supabaseAnonKey;

    function day() { return new Date().toISOString().slice(0, 10); } // in UTC
    function save() { store.setItem(KEY, JSON.stringify(me)); }

    function newId() {
        var cr = window.crypto, b = new Uint8Array(16), id = "", i;
        if (cr && cr.randomUUID) return cr.randomUUID();
        for (i = 0; i < 16; i++) b[i] = Math.random() * 256;
        if (cr && cr.getRandomValues) cr.getRandomValues(b);
        b[6] = b[6] & 15 | 64; b[8] = b[8] & 63 | 128;
        for (i = 0; i < 16; i++) id += (i > 3 && i < 11 && i % 2 === 0 ? "-" : "") + (b[i] + 256).toString(16).slice(1);
        return id;
    }

    function send() {
        try {
            var today = day(), app = !!window.AICompass, mm = window.matchMedia;
            var body = { visitor: me.id, lang: /^ru/i.test(document.documentElement.lang) ? "ru" : "en", app: app, page: !app };
            body.installed = !!(mm && mm("(display-mode: standalone)").matches) || !!nav.standalone;
            body.signed_in = /access_token/.test(store.getItem("aic-auth") || "");
            fetch(url + "/rest/v1/rpc/hello", {
                method: "POST", keepalive: true, body: JSON.stringify(body),
                headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" }
            }).then(function (answer) {
                if (answer.ok) { me.last = today; save(); }
            }).catch(function () { /* next page tries again */ });
        } catch (e) { /* never break a page */ }
    }

    try {
        if (!url || !key || /^(1|yes)$/.test(nav.doNotTrack) || nav.globalPrivacyControl) return;
        if (!/[?&]count-test=1\b/.test(loc.search) &&
            (nav.webdriver || loc.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1])$/.test(loc.hostname))) return;
        store = localStorage;
        try { me = JSON.parse(store.getItem(KEY)); } catch (e) { /* damaged */ }
        var renew = new Date(me && /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(me.id) ? me.made : NaN);
        renew.setUTCMonth(renew.getUTCMonth() + 13);
        if (!(renew > new Date())) me = { id: newId(), made: day(), last: "" };
        if (me.last === day()) return;
        save(); // throws if storage is blocked
        (window.requestIdleCallback || function (run) { setTimeout(run, 2000); })(send, { timeout: 5000 });
    } catch (e) { /* never break a page */ }
})();
