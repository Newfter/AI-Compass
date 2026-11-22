/* =========================================================
   AI COMPASS — INVITES (challenge a friend)
   How one learner brings the next one, without accounts:
   - A result (the quiz, the qualifying exam, a certificate) is shared
     as a short text with a link. The link carries the result, for
     example .../go/quiz.html?s=8-10 ("8 of 10").
   - The pages in go/ are tiny: a chat app reads their title ("Can you
     beat my score in the AI Challenge?") for the link's preview, and a
     person is sent straight on to the site, at ...?friend=quiz.8-10.
     (tools/build-pages.js writes them.)
   - This file reads "friend" from the address and shows a small card:
     "A friend got 8 of 10. Can you beat that?" with one button.
   - After the friend's quiz, a message says who did better.
   - It also points the two footer links ("Lessons to read", "AI words
     A–Z") at the plain pages in the current language.

   Sections of this file:
    1. Settings
    2. The link and what is sent
    3. Reading a shared link
    4. The card
    5. Who did better
    6. The footer links to the plain pages
    7. The public API
   Nothing is sent anywhere: the result travels inside the link itself.
   A result in a link is only what the sender's link says (it is not checked).
   Saved: the friend's quiz score, until the tab is closed (sessionStorage "aic:invite").
   Every text (English and Russian) is in js/content/invite.js; the card's
   look is css/invite.css (loaded only when a card is shown).
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const t = A.t;

    /* =========================================================
       1. SETTINGS
       ========================================================= */

    // The part of the address that carries a friend's result: ?friend=quiz.8-10
    const PARAM = "friend";
    // The small pages a shared link opens first (in go/ and ru/go/)
    const PAGES = { quiz: "quiz", exam: "exam", cert: "certificate" };
    // Where each kind of invite leads on the site, and its emoji on the card
    const TARGETS = { quiz: "quiz", exam: "learn", cert: "lessons" };
    const ICONS = { quiz: "🎯", exam: "🎓", cert: "🏆" };
    // The certificates that exist (js/lessons.js) and the quiz modes with a result to compare
    const CERTIFICATES = ["basics", "deep", "world", "all"];
    const QUIZ_MODES = ["classic", "timed", "daily", "myth"];
    // The friend's quiz score is kept here until the tab is closed
    const KEEP_KEY = "aic:invite";
    const CARD_STYLE = "./css/invite.css";
    // The message "who did better" waits until the result screen is drawn
    const VERDICT_DELAY = 1200;

    const number = function (value) { return A.format.number(value); };

    /* =========================================================
       2. THE LINK AND WHAT IS SENT
       ========================================================= */

    // The site's public address (the same start as A.platform.link), so a copy of the
    // site opened on your own computer still shares the real one
    function siteAddress() {
        const canonical = document.querySelector('link[rel="canonical"]');
        const address = canonical && canonical.href ? canonical.href : window.location.href;
        return address.split(/[?#]/)[0].replace(/index\.html$/, "");
    }

    // link("quiz", "8-10") -> https://newfter.github.io/AI-Compass/go/quiz.html?s=8-10
    // (in Russian: .../ru/go/quiz.html?s=8-10)
    function link(kind, value) {
        return siteAddress() + (A.lang === "ru" ? "ru/" : "") + "go/" + PAGES[kind] + ".html?s=" + encodeURIComponent(value);
    }

    // share("quiz", { right: 8, total: 10, text: "..." })     the quiz writes its own text
    // share("exam", { right: 26, total: 30, honours: true })
    // share("cert", { track: "basics", name: "Basics" })
    // Returns what A.share returns: a Promise of "shared", "copied", "cancelled" or "failed".
    function share(kind, data) {
        const details = data || {};
        if (!PAGES[kind] || typeof A.share !== "function") return Promise.resolve("failed");
        let value;
        let text = details.text;
        if (kind === "cert") {
            value = details.track;
            text = text || t("invite.cert.text", { name: details.name });
        } else {
            value = Math.round(details.right) + "-" + Math.round(details.total);
            text = text || t(details.honours ? "invite.exam.textHonours" : "invite.exam.text",
                { score: number(details.right), total: number(details.total) });
        }
        A.track("invite.share", { kind: kind });
        return A.share({ text: text, url: link(kind, value) });
    }

    /* =========================================================
       3. READING A SHARED LINK
       ========================================================= */

    // "quiz.8-10" -> { kind: "quiz", right: 8, total: 10 }; "cert.basics" -> { kind: "cert", track: "basics" }
    // Anything else (a broken or made-up link) gives null: no card.
    function parse(raw) {
        const text = String(raw || "");
        const score = /^(quiz|exam)\.(\d{1,3})-(\d{1,3})$/.exec(text);
        if (score) {
            const right = Number(score[2]);
            const total = Number(score[3]);
            return total >= 1 && right <= total ? { kind: score[1], right: right, total: total } : null;
        }
        const certificate = /^cert\.([a-z]{1,12})$/.exec(text);
        if (certificate && CERTIFICATES.indexOf(certificate[1]) !== -1) return { kind: "cert", track: certificate[1] };
        return null;
    }

    // Takes ?friend=... out of the address (so a reload or a copied address doesn't repeat it)
    function readAddress() {
        return A.util.attempt(function () {
            const params = new URLSearchParams(window.location.search);
            const raw = params.get(PARAM);
            if (raw === null) return null;
            params.delete(PARAM);
            const rest = params.toString();
            history.replaceState(history.state, "", window.location.pathname + (rest ? "?" + rest : "") + window.location.hash);
            return parse(raw);
        }, null);
    }

    function keep(invite) {
        A.util.attempt(function () { sessionStorage.setItem(KEEP_KEY, invite.right + "-" + invite.total); });
    }

    function kept() {
        return A.util.attempt(function () {
            return parse("quiz." + (sessionStorage.getItem(KEEP_KEY) || ""));
        }, null);
    }

    function forget() {
        A.util.attempt(function () { sessionStorage.removeItem(KEEP_KEY); });
    }

    /* =========================================================
       4. THE CARD
       ========================================================= */

    let card = null;
    let stopLanguage = null;

    function certificateName(track) {
        return track === "all" ? t("lessons.cert.all") : t("lessons.track." + track + ".title");
    }

    function closeCard() {
        if (!card) return;
        card.remove();
        card = null;
        if (stopLanguage) stopLanguage();
        stopLanguage = null;
    }

    // The button of the card: the quiz starts right away; the exam and the certificates
    // need the path and the lessons first, so their pages open
    function accept(invite) {
        closeCard();
        if (invite.kind === "quiz" && A.quiz && typeof A.quiz.start === "function") {
            A.quiz.start("classic");
        } else if (typeof A.navigate === "function") {
            A.navigate(TARGETS[invite.kind]);
        } else {
            window.location.hash = "#" + TARGETS[invite.kind];
        }
    }

    function showCard(invite) {
        closeCard();
        // The look of the card is loaded only now: most visitors never see one
        if (!document.querySelector('link[href="' + CARD_STYLE + '"]')) {
            const style = document.createElement("link");
            style.rel = "stylesheet";
            style.href = CARD_STYLE;
            document.head.appendChild(style);
        }

        card = document.createElement("aside");
        card.className = "invite-card";
        card.setAttribute("data-kind", invite.kind);
        card.innerHTML = '<span class="invite-icon" aria-hidden="true"></span>' +
            '<p class="invite-text"></p>' +
            '<button type="button" class="btn btn-primary btn-small invite-go"></button>' +
            '<button type="button" class="invite-close"><span aria-hidden="true">×</span></button>';
        card.querySelector(".invite-icon").textContent = ICONS[invite.kind];

        function fill() {
            card.setAttribute("aria-label", t("invite.label"));
            card.querySelector(".invite-text").textContent = invite.kind === "cert"
                ? t("invite.cert.banner", { name: certificateName(invite.track) })
                : t("invite." + invite.kind + ".banner", { score: number(invite.right), total: number(invite.total) });
            card.querySelector(".invite-go").textContent = t("invite." + invite.kind + ".go");
            card.querySelector(".invite-close").setAttribute("aria-label", t("invite.close"));
        }
        fill();
        stopLanguage = A.on("language", fill);

        card.querySelector(".invite-go").addEventListener("click", function () { accept(invite); });
        card.querySelector(".invite-close").addEventListener("click", closeCard);
        document.body.appendChild(card);
    }

    const arrived = readAddress();
    if (arrived) {
        if (arrived.kind === "quiz") keep(arrived);
        showCard(arrived);
        A.track("invite.open", { kind: arrived.kind });
    }

    /* =========================================================
       5. WHO DID BETTER
       After a quiz in this tab, the result is compared with the friend's
       (as shares of right answers: the two quizzes may differ in length).
       ========================================================= */

    A.on("activity", function (activity) {
        if (!activity || activity.type !== "quiz.finish") return;
        const friend = kept();
        const mine = activity.detail || {};
        if (!friend || QUIZ_MODES.indexOf(mine.mode) === -1 || !(mine.total >= 1)) return;

        closeCard();
        const myShare = mine.score / mine.total;
        const friendShare = friend.right / friend.total;
        const outcome = myShare > friendShare ? "won" : (myShare === friendShare ? "tied" : "lost");
        // Beaten or level: the challenge is over. Behind: it stays, for another try.
        if (outcome !== "lost") forget();

        const text = t("invite.quiz." + outcome, {
            mine: t("invite.score", { score: number(mine.score), total: number(mine.total) }),
            theirs: t("invite.score", { score: number(friend.right), total: number(friend.total) })
        });
        setTimeout(function () {
            A.toast(text, { won: "🏅", tied: "🤝", lost: "💪" }[outcome]);
        }, VERDICT_DELAY);
    });

    /* =========================================================
       6. THE FOOTER LINKS TO THE PLAIN PAGES
       <a data-plain="lessons"> in the footer of index.html leads to lessons/
       in English and to ru/lessons/ in Russian (the pages search engines read).
       ========================================================= */

    function pointPlainLinks() {
        Array.prototype.forEach.call(document.querySelectorAll("a[data-plain]"), function (anchor) {
            anchor.setAttribute("href", "./" + (A.lang === "ru" ? "ru/" : "") + anchor.getAttribute("data-plain") + "/");
        });
    }
    pointPlainLinks();
    A.on("language", pointPlainLinks);

    /* =========================================================
       7. THE PUBLIC API
       ========================================================= */

    // The card's look is saved for offline use with the rest of the site
    if (typeof A.keepOffline === "function") A.keepOffline([CARD_STYLE]);

    // AICompass.invite:
    //   share(kind, data)   shares a result with a link that challenges a friend (section 2)
    //   link(kind, value)   only the link
    //   parse(text)         what a link's "friend" part says, or null
    A.feature("invite", { share: share, link: link, parse: parse });
})();
