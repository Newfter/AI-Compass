/* =========================================================
   AI COMPASS — GLOSSARY FLASHCARDS (the study window)
   "Study with flashcards" opens this window. It shows one term at a time:
   think of what it means, flip the card (click, tap, Space or Enter) to
   see the definition, then say "I knew it" or "Not yet" (with the buttons
   or the arrow keys → and ←).
   - choose the deck: all terms, a category, or the terms of a lesson;
   - the card turns over (in calm mode its two sides cross-fade instead);
   - screen readers hear every new card and the back of the card;
   - at the end: how it went, your boxes, and when the next cards come.
   js/glossary.js keeps the boxes (the Leitner system: which card comes
   back when, saved in this browser) and loads this file the first time
   someone studies, so the page doesn't load it at start-up. This file
   only shows the window and passes the answers on.
   Sections of this file:
    1. Settings
    2. Building the window
    3. Decks
    4. Showing a card
    5. Flipping the card
    6. Answering
    7. The end of a session (or nothing to study)
    8. Opening and closing
    9. Keys and buttons
   10. Language changes
   It publishes AICompass.glossaryCards = { create(host) }: js/glossary.js
   calls create() once, with everything the window needs ("host", see
   section 15 of js/glossary.js).
   Texts: "glossary.fc.*" in js/content/glossary.js. Styles: section 12
   of css/glossary.css.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const t = A.t;
    const esc = A.escapeHTML;
    const text = A.i18nHTML;    // a text that core.js translates again by itself

    // ---------- 1. Settings ----------
    const WINDOW_ID = "flashcards";   // the window's id for A.overlays
    const CLOSE_MS = 220;             // ms: the closing animation (css: .gl-fc.is-closing)
    const TURN_MS = 520;              // ms: the card turns over
    const FADE_MS = 220;              // ms: calm mode: the two sides cross-fade instead
    const NEXT_MS = 320;              // ms: the next card slides in...
    const NEXT_SHIFT = 40;            // px: ...from this far to the side (calm mode: it fades in)

    const ICON_CLOSE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

    let host = null;      // from js/glossary.js: the boxes, the terms and their words
    let root = null;      // the window (with its backdrop)
    let parts = null;     // the parts of the window we update
    let overlay = null;   // the window's record in A.overlays
    let isOpen = false;
    let opener = null;    // the element that had the focus when the window opened
    let closeTimer = 0;

    // The study session
    const session = {
        deck: "all",      // "all", a category id or "lesson-7"
        cards: [],        // the term ids of this session, in order
        index: 0,         // the card on show
        flipped: false,   // its back is showing
        seen: false,      // its back has been seen: the answer buttons show from then on
        knew: 0,          // answers so far: "I knew it"...
        missed: 0,        // ...and "Not yet"
        last: null        // the last answer: { id, knew, box }
    };

    // ---------- 2. Building the window ----------
    function create(givenHost) {
        host = givenHost;
        build();
        listen();
        A.onLanguageChange(onLanguageChange);
        return {
            open: open,
            isOpen: function () { return isOpen; }
        };
    }

    // The boxes at the end of a session: new cards, then box 1 to box 5
    function boxesHTML() {
        let html = "";
        for (let box = 0; box <= host.settings.boxDays.length; box++) {
            html += '<li class="gl-fc-box" data-box="' + (box || "new") + '">' +
                '<span class="gl-fc-box-num mono" aria-hidden="true"></span>' +
                '<span class="gl-fc-box-name" aria-hidden="true"></span>' +
                '<span class="gl-fc-box-when" aria-hidden="true"></span>' +
                '<span class="gl-fc-box-say sr-only"></span>' +
            "</li>";
        }
        return html;
    }

    function build() {
        root = document.createElement("div");
        root.className = "gl-fc";
        root.hidden = true;
        root.innerHTML =
            '<div class="gl-fc-backdrop"></div>' +
            '<div class="gl-fc-panel" role="dialog" aria-modal="true" aria-labelledby="gl-fc-title">' +
                '<div class="gl-fc-head">' +
                    '<h2 class="gl-fc-title" id="gl-fc-title"><span class="gl-fc-title-icon" aria-hidden="true">🃏</span>' + text("glossary.fc.title") + "</h2>" +
                    '<label class="gl-fc-deck">' +
                        text("glossary.fc.deck", "gl-fc-deck-label mono") +
                        '<span class="gl-fc-select-box"><select class="gl-fc-select"></select></span>' +
                    "</label>" +
                    '<button class="gl-fc-close" type="button" data-i18n-attr="aria-label:glossary.fc.close,title:glossary.fc.close"' +
                        ' aria-label="' + esc(t("glossary.fc.close")) + '" title="' + esc(t("glossary.fc.close")) + '">' + ICON_CLOSE + "</button>" +
                "</div>" +

                // Studying: the progress, the card and the answer buttons
                '<div class="gl-fc-study">' +
                    '<div class="gl-fc-progress">' +
                        '<p class="gl-fc-count mono"></p>' +
                        '<span class="gl-fc-bar" aria-hidden="true"><span></span></span>' +
                    "</div>" +
                    '<div class="gl-fc-stage">' +
                        '<button class="gl-fc-card" type="button" aria-describedby="gl-fc-hint">' +
                            '<span class="gl-fc-inner">' +
                                '<span class="gl-fc-face gl-fc-front">' +
                                    '<span class="gl-fc-tag mono"></span>' +
                                    '<span class="gl-fc-icon" aria-hidden="true"></span>' +
                                    '<span class="gl-fc-name"></span>' +
                                    '<span class="gl-fc-think" aria-hidden="true">' + text("glossary.fc.think") + "</span>" +
                                "</span>" +
                                '<span class="gl-fc-face gl-fc-back" aria-hidden="true">' +
                                    '<span class="gl-fc-tag gl-fc-back-name mono"></span>' +
                                    '<span class="gl-fc-short"></span>' +
                                "</span>" +
                            "</span>" +
                        "</button>" +
                    "</div>" +
                    '<p class="sr-only" id="gl-fc-hint" data-i18n="glossary.fc.flipHint">' + esc(t("glossary.fc.flipHint")) + "</p>" +
                    '<div class="gl-fc-answers">' +
                        '<button class="btn btn-ghost gl-fc-no" type="button"><kbd class="gl-fc-key" aria-hidden="true">←</kbd>' + text("glossary.fc.no") + "</button>" +
                        '<button class="btn btn-primary gl-fc-yes" type="button">' + text("glossary.fc.yes") + '<kbd class="gl-fc-key" aria-hidden="true">→</kbd></button>' +
                    "</div>" +
                    '<p class="gl-fc-moved" aria-hidden="true"></p>' +
                    '<p class="gl-fc-keys mono" aria-hidden="true">' + text("glossary.fc.keys") + "</p>" +
                "</div>" +

                // The end of a session (or nothing to study today)
                '<div class="gl-fc-end" hidden>' +
                    '<p class="gl-fc-end-icon" aria-hidden="true"></p>' +
                    '<h3 class="gl-fc-end-title" tabindex="-1"></h3>' +
                    '<p class="gl-fc-end-text"></p>' +
                    '<p class="gl-fc-end-missed"></p>' +
                    '<div class="gl-fc-boxes">' +
                        '<p class="gl-label mono">' + text("glossary.fc.boxesTitle") + "</p>" +
                        '<ol class="gl-fc-box-list">' + boxesHTML() + "</ol>" +
                        '<p class="gl-fc-how">' + text("glossary.fc.how") + "</p>" +
                    "</div>" +
                    '<p class="gl-fc-next"></p>' +
                    '<div class="gl-fc-end-actions">' +
                        '<button class="btn btn-primary gl-fc-again" type="button"></button>' +
                        '<button class="btn btn-ghost gl-fc-done" type="button">' + text("glossary.fc.closeButton") + "</button>" +
                    "</div>" +
                "</div>" +

                '<p class="gl-fc-note"></p>' +
            "</div>";
        document.body.appendChild(root);

        const find = function (selector) { return root.querySelector(selector); };
        parts = {
            backdrop: find(".gl-fc-backdrop"),
            panel: find(".gl-fc-panel"),
            select: find(".gl-fc-select"),
            close: find(".gl-fc-close"),
            study: find(".gl-fc-study"),
            count: find(".gl-fc-count"),
            bar: find(".gl-fc-bar span"),
            card: find(".gl-fc-card"),
            inner: find(".gl-fc-inner"),
            front: find(".gl-fc-front"),
            back: find(".gl-fc-back"),
            tag: find(".gl-fc-front .gl-fc-tag"),
            icon: find(".gl-fc-icon"),
            name: find(".gl-fc-name"),
            backName: find(".gl-fc-back-name"),
            short: find(".gl-fc-short"),
            answers: find(".gl-fc-answers"),
            no: find(".gl-fc-no"),
            yes: find(".gl-fc-yes"),
            moved: find(".gl-fc-moved"),
            end: find(".gl-fc-end"),
            endIcon: find(".gl-fc-end-icon"),
            endTitle: find(".gl-fc-end-title"),
            endText: find(".gl-fc-end-text"),
            endMissed: find(".gl-fc-end-missed"),
            boxes: Array.prototype.slice.call(root.querySelectorAll(".gl-fc-box")),
            next: find(".gl-fc-next"),
            again: find(".gl-fc-again"),
            done: find(".gl-fc-done"),
            note: find(".gl-fc-note")
        };

        // The window is a pop-up of the page (see "overlays" in js/core.js). While it is
        // open, core stops the page from scrolling, makes the rest of the page unreachable,
        // keeps Tab inside, and closes it with Esc, when the page goes to another section
        // and when a Ctrl+K command runs. We only report when it opens and closes.
        overlay = A.overlays.register(WINDOW_ID, {
            root: root,
            element: parts.panel,
            modal: true,
            closeOnNavigate: true,
            // Esc and a plain close give the focus back to the button that opened the
            // window. After "navigate" or "command" the place you go to takes it.
            close: function (reason) {
                close({ focusBack: reason === "escape" || reason === "close" });
            }
        });
    }

    // ---------- 3. Decks ----------
    function option(value, label) {
        return '<option value="' + esc(value) + '">' + esc(label) + "</option>";
    }

    // The deck menu: all terms, the categories, and the lessons this site has
    // (a lesson it doesn't have yet only shows when a feature asked for its deck)
    function fillDecks() {
        const lessons = host.lessonDecks().filter(function (lesson) {
            return lesson.title || session.deck === "lesson-" + lesson.n;
        });
        let html = option("all", t("glossary.fc.deckAll")) +
            '<optgroup label="' + esc(t("glossary.fc.deckCats")) + '">' +
                host.categories.map(function (cat) { return option(cat, t("glossary.cat." + cat)); }).join("") +
            "</optgroup>";
        if (lessons.length) {
            html += '<optgroup label="' + esc(t("glossary.fc.deckLessons")) + '">' +
                lessons.map(function (lesson) {
                    const n = A.format.number(lesson.n);
                    return option("lesson-" + lesson.n, lesson.title
                        ? t("glossary.fc.deckLesson", { n: n, title: lesson.title })
                        : t("glossary.fc.deckLessonNumber", { n: n }));
                }).join("") +
            "</optgroup>";
        }
        parts.select.innerHTML = html;
        parts.select.value = session.deck;
    }

    // Starts a session on the current deck: the cards due again and today's new cards
    // (or, with extraNew, the next new cards after today's are done)
    function start(extraNew) {
        const plan = host.plan(session.deck);
        let cards = plan.review.concat(plan.fresh);
        if (!cards.length && extraNew) cards = plan.unseen.slice(0, host.settings.newPerDay);
        session.cards = cards.slice(0, host.settings.sessionMax);
        session.index = 0;
        session.knew = 0;
        session.missed = 0;
        session.last = null;
        fillMoved();
        if (!session.cards.length) {
            showEnd();
            return;
        }
        parts.study.hidden = false;
        parts.end.hidden = true;
        showCard(0);
    }

    // The keyboard focus goes into what shows: the card, or the end's title
    function focusView() {
        if (!parts.study.hidden) parts.card.focus({ preventScroll: true });
        else parts.endTitle.focus({ preventScroll: true });
    }

    // ---------- 4. Showing a card ----------
    function currentTerm() {
        return host.term(session.cards[session.index]);
    }

    // The words on the card (again after a language change)
    function fillCard() {
        const id = session.cards[session.index];
        const term = host.term(id);
        const name = host.name(term);
        const box = host.boxOf(id);
        parts.card.setAttribute("data-cat", term.cat);
        A.dom.setText(parts.tag, box ? t("glossary.fc.inBox", { n: box }) : t("glossary.fc.new"));
        A.dom.setText(parts.icon, term.icon);
        A.dom.setText(parts.name, name);
        A.dom.setText(parts.backName, name);
        A.dom.setText(parts.short, host.short(term));
        // The card is a button: screen readers hear its front, or its back once flipped
        parts.card.setAttribute("aria-label", session.flipped
            ? t("glossary.fc.sayBack", { term: name, short: host.short(term) })
            : parts.tag.textContent + ": " + name);
        A.dom.setText(parts.count, t("glossary.fc.progress", {
            n: A.format.number(session.index + 1),
            total: A.format.number(session.cards.length)
        }));
        parts.bar.style.transform = "scaleX(" + (session.index / session.cards.length).toFixed(3) + ")";
    }

    // Shows the card session.index, front side up.
    // direction: 1 or -1, the side it slides in from (0: no animation)
    function showCard(direction) {
        session.flipped = false;
        session.seen = false;
        // Straight to the front, without turning, so the next card's answer never shows
        parts.card.classList.remove("is-flipped");
        parts.front.setAttribute("aria-hidden", "false");
        parts.back.setAttribute("aria-hidden", "true");
        // The answer buttons wait, out of sight (they keep their place) and out of the
        // way of Tab, until the back has been seen
        root.classList.remove("is-seen");
        parts.answers.inert = true;
        fillCard();
        if (!direction || !parts.card.animate) return;
        if (A.motion.ok()) {
            parts.card.animate(
                [{ opacity: 0, transform: "translateX(" + direction * NEXT_SHIFT + "px)" }, { opacity: 1, transform: "none" }],
                { duration: NEXT_MS, easing: A.motion.ease }
            );
        } else {
            parts.card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: "ease" });
        }
    }

    // ---------- 5. Flipping the card ----------
    function flip() {
        session.flipped = !session.flipped;
        const term = currentTerm();
        parts.card.classList.toggle("is-flipped", session.flipped);
        parts.front.setAttribute("aria-hidden", String(session.flipped));
        parts.back.setAttribute("aria-hidden", String(!session.flipped));
        if (session.flipped && !session.seen) {
            session.seen = true;
            root.classList.add("is-seen");      // the answer buttons appear
            parts.answers.inert = false;
        }
        fillCard();
        turn(session.flipped);
        // The focus stays on the card, so screen readers hear the back from here
        if (session.flipped) {
            A.announce(t("glossary.fc.sayBack", { term: host.name(term), short: host.short(term) }));
        }
    }

    // The card turns over (the class "is-flipped" holds where it ends). In calm mode
    // there is no turning: the side that comes fades in over the side that goes.
    function turn(toBack) {
        if (!parts.inner.animate) return;
        if (A.motion.ok()) {
            const from = toBack ? 0 : 180;
            parts.inner.animate(
                [{ transform: "rotateY(" + from + "deg)" }, { transform: "rotateY(" + (180 - from) + "deg)" }],
                { duration: TURN_MS, easing: A.motion.ease }
            );
            return;
        }
        const coming = toBack ? parts.back : parts.front;
        const going = toBack ? parts.front : parts.back;
        coming.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: "ease" });
        // "visibility: visible" keeps the side that goes on screen while it fades out
        going.animate([{ opacity: 1, visibility: "visible" }, { opacity: 0, visibility: "visible" }], { duration: FADE_MS, easing: "ease" });
    }

    // ---------- 6. Answering ----------
    // "back next session", "back tomorrow", "back in 3 days": when a card in this box returns
    function whenText(box) {
        const days = host.settings.boxDays[box - 1];
        if (!days) return t("glossary.fc.whenSession");
        if (days === 1) return t("glossary.fc.whenTomorrow");
        return A.plural("glossary.fc.whenDays", days);
    }

    // What happened to the last card: "Pixel: box 3, back in 3 days."
    function movedText() {
        const last = session.last;
        if (!last) return "";
        const name = host.name(host.term(last.id));
        return last.knew
            ? t("glossary.fc.movedUp", { term: name, box: A.format.number(last.box), when: whenText(last.box) })
            : t("glossary.fc.movedBack", { term: name });
    }

    function fillMoved() {
        A.dom.setText(parts.moved, movedText());
    }

    function answer(knew) {
        if (!session.seen || parts.study.hidden) return;
        const id = session.cards[session.index];
        const result = host.answer(id, knew);
        if (knew) session.knew++;
        else session.missed++;
        session.last = { id: id, knew: knew, box: result.box };
        fillMoved();
        session.index++;

        if (session.index >= session.cards.length) {
            host.finished(session.deck, session.cards.length, session.knew);
            showEnd();
            parts.endTitle.focus({ preventScroll: true });
            return;
        }
        // The focus goes to the card before the answer buttons hide (it would be lost with them)
        if (document.activeElement !== parts.card) parts.card.focus({ preventScroll: true });
        showCard(knew ? 1 : -1);
        const name = host.name(currentTerm());
        A.announce(movedText() + " " + t("glossary.fc.sayCard", {
            n: A.format.number(session.index + 1),
            total: A.format.number(session.cards.length),
            term: name
        }));
    }

    // ---------- 7. The end of a session (or nothing to study) ----------
    let againNew = false;      // the "again" button starts new cards (not the cards due)

    function showEnd() {
        const plan = host.plan(session.deck);
        const answered = session.knew + session.missed;
        parts.study.hidden = true;
        parts.end.hidden = false;

        A.dom.setText(parts.endIcon, !answered ? "✅" : session.missed ? "💪" : "🏆");
        A.dom.setText(parts.endTitle, t(answered ? "glossary.fc.doneTitle" : "glossary.fc.emptyTitle"));
        let line = t("glossary.fc.emptyText");
        if (answered) {
            line = session.missed
                ? A.plural("glossary.fc.doneScore", answered, { k: A.format.number(session.knew) })
                : t("glossary.fc.donePerfect");
        }
        A.dom.setText(parts.endText, line);
        A.dom.setText(parts.endMissed, session.missed ? A.plural("glossary.fc.doneMissed", session.missed) : "");
        A.dom.setHidden(parts.endMissed, !session.missed);

        // The boxes of this deck
        parts.boxes.forEach(function (item, box) {
            const n = plan.boxes[box];
            const name = box ? t("glossary.box", { n: A.format.number(box) }) : t("glossary.boxNew");
            const when = box ? (box === 1 ? t("glossary.boxEvery") : A.plural("glossary.boxAfter", host.settings.boxDays[box - 1])) : "";
            A.dom.setText(item.querySelector(".gl-fc-box-num"), A.format.number(n));
            A.dom.setText(item.querySelector(".gl-fc-box-name"), name);
            A.dom.setText(item.querySelector(".gl-fc-box-when"), when);
            A.dom.setText(item.querySelector(".gl-fc-box-say"), name + (when ? ", " + when : "") + ": " + A.plural("glossary.boxCards", n));
            item.classList.toggle("is-empty", n === 0);
        });

        // When the next cards come, and what you can do now
        let next = "";
        if (!plan.total) {
            if (!plan.unseen.length) next = t("glossary.fc.allInBoxes") + " ";
            if (plan.next) next += t("glossary.fc.next", { when: host.dayText(plan.next) });
        }
        A.dom.setText(parts.next, next.trim());
        A.dom.setHidden(parts.next, !next);

        againNew = !plan.total && plan.unseen.length > 0;
        if (plan.total) {
            A.dom.setText(parts.again, A.plural("glossary.fc.more", Math.min(plan.total, host.settings.sessionMax)));
        } else if (againNew) {
            A.dom.setText(parts.again, A.plural("glossary.fc.learnNew", Math.min(plan.unseen.length, host.settings.newPerDay)));
        }
        A.dom.setHidden(parts.again, !plan.total && !againNew);
    }

    // ---------- 8. Opening and closing ----------
    // Opens the window on a deck and starts studying (from = the element with the focus)
    function open(deck, from) {
        if (isOpen) {
            // Already open: switch to the deck asked for
            if (deck !== session.deck) {
                session.deck = deck;
                parts.select.value = deck;
                start();
                focusView();
            }
            return;
        }
        // Other windows in the way close first. An open lesson stays open under the
        // cards, so a lesson can send you here and you come back to it afterwards.
        A.overlays.closeAll({ except: ["lesson-reader"], reason: "navigate" });
        clearTimeout(closeTimer);
        opener = from && from !== document.body ? from : null;
        session.deck = deck;
        fillDecks();
        fillNote();
        isOpen = true;
        root.hidden = false;
        root.classList.remove("is-closing");
        overlay.opened();
        start();
        focusView();
    }

    // Where the focus goes back to: the element that opened the window if it is still
    // on screen, otherwise the glossary's study button
    function focusTarget() {
        if (opener && opener.isConnected && opener.getClientRects().length) return opener;
        return host.fallbackFocus();
    }

    // options.focusBack: the focus goes back (after Esc, the close button...)
    function close(options) {
        if (!isOpen) return;
        isOpen = false;
        root.classList.add("is-closing");
        overlay.closed(options && options.focusBack ? focusTarget() : null);
        closeTimer = setTimeout(function () {
            root.hidden = true;
            root.classList.remove("is-closing");
        }, A.motion.ok() ? CLOSE_MS : 0);
    }

    // "Your cards are saved only in this browser" (or that this browser doesn't save)
    function fillNote() {
        A.dom.setText(parts.note, t(host.canSave() ? "glossary.cardsSaved" : "glossary.cardsNotSaved"));
    }

    // ---------- 9. Keys and buttons ----------
    function listen() {
        parts.card.addEventListener("click", flip);
        parts.no.addEventListener("click", function () { answer(false); fillNote(); });
        parts.yes.addEventListener("click", function () { answer(true); fillNote(); });

        // ← "Not yet" and → "I knew it", once the back has been seen
        // (not in the deck menu: there the arrows choose a deck)
        parts.panel.addEventListener("keydown", function (event) {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (event.target === parts.select || parts.study.hidden || !session.seen) return;
            event.preventDefault();
            answer(event.key === "ArrowRight");
            fillNote();
        });

        parts.select.addEventListener("change", function () {
            session.deck = parts.select.value;
            start();
        });

        parts.again.addEventListener("click", function () {
            start(againNew);
            focusView();
        });

        parts.done.addEventListener("click", function () { close({ focusBack: true }); });
        parts.close.addEventListener("click", function () { close({ focusBack: true }); });
        parts.backdrop.addEventListener("click", function () { close({ focusBack: true }); });
    }

    // ---------- 10. Language changes ----------
    // The fixed texts (data-i18n) are translated by core.js; the rest is written again
    function onLanguageChange() {
        fillDecks();
        fillNote();
        if (!isOpen) return;
        if (!parts.study.hidden) {
            fillCard();
            fillMoved();
        } else {
            showEnd();
        }
    }

    A.feature("glossaryCards", { create: create });
})();
