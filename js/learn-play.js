/* =========================================================
   AI COMPASS — THE STUDY WINDOW (part of "My path")
   One pop-up window for everything you DO on the path:
   - a set of cards: the memory check, extra practice, a stage test and
     the level check ("Find my level");
   - a guided step: a few screens with one small idea each, and a task
     right after it (choose, put in order, sort, match, type a number);
   - "Explain it back": write a lesson in your own words, then compare
     with its three key ideas.
   js/learn.js loads this file the first time it is needed and gives it
   "host": everything the window needs (the cards, the memory, the
   courses). The window itself saves nothing.

   A request (the first argument of open()):
     { mode: "cards", kind: "review" | "more" | "topic", topic, cards: [ids] }
     { mode: "cards", kind: "test", stage, cards: [ids] }
     { mode: "cards", kind: "place", probes: [{ stage, cards: [ids] }] }
     { mode: "guide", unit: "z1" }
     { mode: "explain", lesson: 3 }

   A task (a card, or a step of a guided course), in the current language:
     choice   { q, options, correct (0 when left out), keepOrder, why, hint }
     order    { q, items (in the right order), why, hint }
     sort     { q, groups: [names], items: [[text, number of its group]], why }
     match    { q, pairs: [[left, right]], why }
     number   { q, answer, tolerance, unit, why, hint }
   Screens of a guided step that are not tasks:
     info     { icon, title, text }
     reveal   { q, answer }          think first, then look
     recap    { points }             the last screen: what to remember
   Any screen can also show, above its question: "text" (paragraphs),
   "pixels" ({ rows: ["090", ...], numbers }), "table" ({ head, rows, side })
   and "example" (lines in a box; "mono": true for code and formulas).
   An info screen can end with "prompts": ready requests for a chatbot, each
   with a Copy button ([{ label, text }]; text: one line or a list of lines).
   In the texts of a course, **two stars** make bold and `backticks` code.

   Sections of this file:
    1. Settings and small helpers
    2. Building the window
    3. Screens, buttons and the keyboard
    4. Reading aloud
    5. The tasks
    6. Cards: the memory check, practice, a stage test, the level check
    7. A guided step
    8. Explain it back
    9. Opening and closing
   Texts: js/content/learn.js ("learn.play.", "learn.task.", "learn.review."...).
   Styles: css/learn-play.css.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A) return;

    const t = A.t;
    const esc = A.escapeHTML;
    const num = A.format.number;

    // ---------- 1. Settings and small helpers ----------
    const WINDOW_ID = "learn-play";
    const CLOSE_MS = 220;            // the closing animation (css/learn-play.css)
    const GUIDE_TRIES = 2;           // a guided task: after this many wrong tries the answer is shown
    const CARD_TRIES = 1;            // a card: one try, because it tests the memory
    const EXPLAIN_MIN = 20;          // letters an explanation needs before it is compared
    const WRONG_FLASH = 650;         // ms a wrong pair stays red in a "match" task
    const PROMPT_LINE = 46;          // about how many letters of a ready request fit on one line
    const PROMPT_ROWS_MIN = 2;       // a ready request shows at least this many lines...
    const PROMPT_ROWS_MAX = 7;       // ...and at most this many, until the window has measured its text
    const PROMPT_EDGE = 2;           // px: the field's two borders, added to the height of its text
    const TASKS = ["choice", "order", "sort", "match", "number"];
    const CLOSE_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

    function isTask(step) {
        return TASKS.indexOf(step.type) !== -1;
    }

    // One text or a list of texts -> a list
    function list(value) {
        if (Array.isArray(value)) return value;
        return value === undefined || value === null || value === "" ? [] : [value];
    }

    // A browser may break a line right after a slash, which would cut a fraction such as
    // ∂L/∂w in two. So a short word with a slash stays on one line (in code and formulas).
    function keepFractions(html) {
        return html.replace(/[^\s<>`*]*[^\s<>`*\/]\/[^\s<>`*\/][^\s<>`*]*/g, function (word) {
            return word.length <= 18 ? '<span class="lpw-nobreak">' + word + "</span>" : word;
        });
    }

    // A text of a course or of a card: **bold** and `code`, everything else as written.
    // formula: the whole text is a line of formulas (an example in the code font).
    function rich(text, formula) {
        const safe = esc(String(text));
        return (formula ? keepFractions(safe) : safe)
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/`(.+?)`/g, function (all, code) {
                return "<code>" + (formula ? code : keepFractions(code)) + "</code>";
            });
    }

    // The same text without the marks (for reading aloud and for screen readers)
    function plain(text) {
        return String(text).replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1");
    }

    function paragraphs(value, className) {
        return list(value).map(function (line) {
            return '<p class="' + className + '" data-speak>' + rich(line) + "</p>";
        }).join("");
    }

    // A small picture made of pixels: rows of digits, 0 (black) to 9 (white).
    // With "numbers", every pixel shows its brightness from 0 to 255.
    function pixelsHTML(picture, label) {
        const rows = picture.rows || [];
        const width = rows.reduce(function (max, row) { return Math.max(max, row.length); }, 0);
        let cells = "";
        rows.forEach(function (row) {
            for (let i = 0; i < width; i++) {
                const level = Math.max(0, Math.min(9, Number(row.charAt(i)) || 0));
                const value = Math.round(level / 9 * 255);
                cells += '<span class="lpw-pixel' + (level >= 5 ? " is-light" : "") + '" style="--v:' + value + '">' +
                    (picture.numbers ? num(value) : "") + "</span>";
            }
        });
        return '<div class="lpw-pixels' + (picture.numbers ? " has-numbers" : "") + '" style="--cols:' + width + '"' +
            (label ? ' role="img" aria-label="' + esc(label) + '"' : ' aria-hidden="true"') + ">" + cells + "</div>";
    }

    // A small table: { head: [...], rows: [[...]], side: true (the first cell of a row is its name) }
    function tableHTML(table) {
        const head = list(table.head).length
            ? "<thead><tr>" + table.head.map(function (cell) { return '<th scope="col">' + rich(cell) + "</th>"; }).join("") + "</tr></thead>"
            : "";
        const body = (table.rows || []).map(function (row) {
            return "<tr>" + row.map(function (cell, index) {
                return table.side && index === 0 ? '<th scope="row">' + rich(cell) + "</th>" : "<td>" + rich(cell) + "</td>";
            }).join("") + "</tr>";
        }).join("");
        return '<div class="lpw-table-box"><table class="lpw-table">' + head + "<tbody>" + body + "</tbody></table></div>";
    }

    // Ready requests for a chatbot: [{ label, text }], each in a box with a Copy button
    function promptsHTML(prompts) {
        return list(prompts).map(function (item) {
            const lines = list(item.text);
            const text = lines.join("\n");
            const rows = Math.max(PROMPT_ROWS_MIN, Math.min(PROMPT_ROWS_MAX, Math.ceil(text.length / PROMPT_LINE) + lines.length - 1));
            return '<div class="lpw-bot lpw-ready">' +
                '<p class="lpw-bot-title" data-speak>' + rich(item.label) + "</p>" +
                '<textarea class="lpw-prompt" rows="' + rows + '" readonly aria-label="' + esc(plain(item.label)) + '">' + esc(text) + "</textarea>" +
                '<p class="lpw-bot-row"><button type="button" class="btn btn-ghost btn-small" data-act="copy">' + esc(t("learn.explain.botCopy")) + "</button>" +
                    '<span class="lpw-copy-state" role="status"></span></p>' +
            "</div>";
        }).join("");
    }

    // What a screen shows above its question: paragraphs, a picture, a table, an example, a note
    function contextHTML(step) {
        let html = paragraphs(step.text, "lpw-text");
        if (step.pixels) html += pixelsHTML(step.pixels, step.pixelsLabel);
        if (step.table) html += tableHTML(step.table);
        if (list(step.example).length) {
            html += '<div class="lpw-example' + (step.mono ? " mono" : "") + '">' + list(step.example).map(function (line) {
                return "<p data-speak>" + rich(line, step.mono) + "</p>";
            }).join("") + "</div>";
        }
        if (step.note) html += '<p class="lpw-note" data-speak>' + rich(step.note) + "</p>";
        html += promptsHTML(step.prompts);
        return html;
    }

    // "12", "0,5", "-3", "85 %" -> a number, or null when it is not one
    function readNumber(text) {
        const clean = String(text).replace(/\s+/g, "").replace(/[−–]/g, "-").replace(",", ".").replace(/%$/, "");
        return /^-?(\d+\.?\d*|\.\d+)$/.test(clean) ? Number(clean) : null;
    }

    function create(host) {
        const data = host.data;
        let root = null;
        let parts = null;
        let overlay = null;
        let isOpen = false;
        let opener = null;
        let closeTimer = 0;
        let run = 0;             // a new number for every session: what an older session still loads is ignored
        let session = null;      // the session on screen (cards, a guided step or an explanation)
        let task = null;         // the task on screen: { giveUp(), key(event) }, or null
        let actions = {};        // what the buttons of the screen do: { name: function (button) }

        // ---------- 2. Building the window ----------
        function build() {
            root = document.createElement("div");
            root.className = "lpw";
            root.hidden = true;
            root.innerHTML =
                '<div class="lpw-backdrop"></div>' +
                '<div class="lpw-window" role="dialog" aria-modal="true" aria-labelledby="lpw-kicker" tabindex="-1">' +
                    '<header class="lpw-head">' +
                        '<p class="lpw-kicker mono" id="lpw-kicker"></p>' +
                        '<p class="lpw-count mono"></p>' +
                        '<button type="button" class="lpw-listen" data-act="listen" aria-pressed="false" hidden>' +
                            '<span class="lpw-listen-icon" aria-hidden="true">🔊</span><span class="lpw-listen-text"></span></button>' +
                        '<button type="button" class="lpw-close" data-act="close">' + CLOSE_ICON + "</button>" +
                    "</header>" +
                    '<div class="lpw-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span></span></div>' +
                    '<div class="lpw-body"></div>' +
                    '<footer class="lpw-foot"></footer>' +
                    '<p class="lpw-legend mono" aria-hidden="true"></p>' +
                "</div>";
            document.body.appendChild(root);
            const find = function (selector) { return root.querySelector(selector); };
            parts = {
                window: find(".lpw-window"), kicker: find(".lpw-kicker"), count: find(".lpw-count"),
                listen: find(".lpw-listen"), listenIcon: find(".lpw-listen-icon"), listenText: find(".lpw-listen-text"),
                close: find(".lpw-close"), bar: find(".lpw-bar"), barFill: find(".lpw-bar span"),
                body: find(".lpw-body"), foot: find(".lpw-foot"), keys: find(".lpw-legend")
            };
            root.addEventListener("click", onClick);
            document.addEventListener("keydown", onKey);
            window.addEventListener("resize", function () {
                if (!isOpen) return;
                liftToasts();
                fitPrompts();
            });
            // (a font that arrives after the first screen changes how tall its text is)
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(function () { if (isOpen) fitPrompts(); });
            }

            // The window is a pop-up of the page (see "overlays" in js/core.js): while it is
            // open, core stops the page from scrolling, keeps Tab inside and closes it with Esc.
            overlay = A.overlays.register(WINDOW_ID, {
                root: root,
                element: parts.window,
                modal: true,
                closeOnNavigate: true,
                close: function (reason) {
                    close({ focusBack: reason === "escape" || reason === "close" });
                }
            });
        }

        // ---------- 3. Screens, buttons and the keyboard ----------
        function say(text) {
            if (typeof A.announce === "function") A.announce(plain(text));
        }

        // The bar at the top: the name of the session, "3 of 8" and the progress
        function setChrome(options) {
            A.dom.setText(parts.kicker, options.kicker || "");
            A.dom.setText(parts.count, options.count || "");
            const share = options.progress;
            A.dom.setHidden(parts.bar, share === undefined);
            if (share !== undefined) {
                const clean = Math.max(0, Math.min(1, share));
                parts.barFill.style.setProperty("--done", clean.toFixed(3));
                parts.bar.setAttribute("aria-valuenow", String(Math.round(clean * 100)));
                parts.bar.setAttribute("aria-label", options.count || options.kicker || "");
            }
            parts.close.setAttribute("aria-label", t("learn.play.close"));
            parts.close.title = t("learn.play.close");
            A.dom.setText(parts.keys, t("learn.play.keys"));
        }

        // The buttons under the screen: [{ act, label, primary }]
        function setButtons(buttons) {
            parts.foot.innerHTML = buttons.map(function (button) {
                return '<button type="button" class="btn ' + (button.primary ? "btn-primary" : "btn-ghost") + '" data-act="' + button.act + '">' +
                    esc(button.label) + "</button>";
            }).join("");
            A.dom.setHidden(parts.foot, !buttons.length);
            liftToasts();
        }

        // Pop-up messages ("Level 2!") appear just above the buttons of the window, so
        // they never cover them: --toast-bottom, see "toasts" in style.css. The bar of
        // buttons is one or two rows tall, so its place is measured (with offsetTop:
        // unlike getBoundingClientRect, it is not moved by the opening animation).
        function liftToasts() {
            const toasts = document.getElementById("toast-stack");
            if (!toasts) return;
            if (!isOpen) {
                toasts.style.removeProperty("--toast-bottom");
                return;
            }
            const top = parts.window.offsetTop + (parts.foot.hidden
                ? parts.window.offsetHeight
                : parts.window.clientTop + parts.foot.offsetTop);
            const gap = Math.max(12, Math.round(window.innerHeight - top) + 12);
            toasts.style.setProperty("--toast-bottom", "calc(" + gap + "px - env(safe-area-inset-bottom, 0px))");
        }

        function focusButton(act) {
            const button = parts.foot.querySelector('[data-act="' + act + '"]');
            if (button) button.focus({ preventScroll: true });
        }

        // The keyboard focus goes to the heading of the screen, so it is read first
        function focusScreen() {
            const target = parts.body.querySelector("[data-focus]") || parts.window;
            if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
        }

        // Shows a screen: { kicker, count, progress, html, buttons, actions }
        function screen(options) {
            stopSpeaking();
            task = null;
            actions = options.actions || {};
            setChrome(options);
            parts.body.innerHTML = options.html;
            parts.body.scrollTop = 0;
            fitPrompts();
            setButtons(options.buttons || []);
            updateListen();
            focusScreen();
        }

        // A ready request of a guided screen is as tall as its text, so that nothing
        // has to be scrolled inside a small box (the "rows" of the field are only a start)
        function fitPrompts() {
            Array.prototype.forEach.call(parts.body.querySelectorAll(".lpw-ready .lpw-prompt"), function (field) {
                const rows = field.rows;
                field.style.height = "auto";
                field.rows = 1;                 // (so that the text is measured, not the rows it started with)
                const height = field.scrollHeight;
                field.rows = rows;
                // (a window that is not on screen yet measures 0: then the rows stay)
                if (height) field.style.height = (height + PROMPT_EDGE) + "px";
            });
        }

        function saveNote() {
            return '<p class="lpw-save-note"><span aria-hidden="true">' + (host.canSave() ? "🔒" : "⚠️") + "</span> " +
                esc(t(host.canSave() ? "learn.play.saved" : "learn.play.notSaved")) + "</p>";
        }

        function loading() {
            screen({
                kicker: sessionTitle(),
                html: '<p class="lpw-loading" data-focus tabindex="-1" role="status">' + esc(t("learn.play.loading")) + "</p>"
            });
        }

        function loadError(retry) {
            screen({
                kicker: sessionTitle(),
                html: '<div class="lpw-end"><span class="lpw-end-icon" aria-hidden="true">📡</span>' +
                    '<h3 class="lpw-end-title" data-focus tabindex="-1">' + esc(t("learn.play.loadError")) + "</h3></div>",
                buttons: [{ act: "retry", label: t("learn.play.tryLoad"), primary: true }],
                actions: { retry: retry }
            });
        }

        function onClick(event) {
            const button = event.target.closest("[data-act]");
            if (!button || !root.contains(button) || button.getAttribute("aria-disabled") === "true") return;
            const act = button.getAttribute("data-act");
            if (act === "close") close({ focusBack: true });
            else if (act === "listen") toggleSpeaking();
            else if (act === "copy") copyPrompt(button);
            else if (typeof actions[act] === "function") actions[act](button);
        }

        // "Copy the prompt": copies the ready request in the same box, and says how it went
        function copyPrompt(button) {
            const box = button.closest(".lpw-bot");
            const field = box && box.querySelector(".lpw-prompt");
            const state = box && box.querySelector(".lpw-copy-state");
            if (!field) return;
            const tell = function (ok) { A.dom.setText(state, t(ok ? "learn.explain.botCopied" : "learn.explain.botFailed")); };
            const byHand = function () {
                field.focus();
                field.select();
                let ok = false;
                try { ok = document.execCommand("copy"); } catch (error) { ok = false; }
                tell(ok);
            };
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                navigator.clipboard.writeText(field.value).then(function () { tell(true); }, byHand);
            } else {
                byHand();
            }
        }

        // 1-9 choose an answer; Enter presses the main button of the screen
        function onKey(event) {
            if (!isOpen || A.overlays.top() !== WINDOW_ID) return;
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            const typing = A.dom.isTyping(event.target);
            if (!typing && task && task.key && task.key(event)) {
                event.preventDefault();
                return;
            }
            if (event.key !== "Enter" || typing) return;
            if (event.target.closest && event.target.closest("button, a, summary, input, textarea, select, label")) return;
            const main = parts.foot.querySelector('.btn-primary:not([aria-disabled="true"])');
            if (main) {
                event.preventDefault();
                main.click();
            }
        }

        // ---------- 4. Reading aloud ----------
        // The browser's own voice reads what is on the screen (every part marked data-speak)
        const canSpeak = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
        const speech = { active: false, session: 0 };

        function updateListen() {
            const texts = canSpeak && parts.body.querySelector("[data-speak]");
            A.dom.setHidden(parts.listen, !texts);
            parts.listen.setAttribute("aria-pressed", String(speech.active));
            parts.listen.classList.toggle("is-on", speech.active);
            A.dom.setText(parts.listenIcon, speech.active ? "⏹" : "🔊");
            A.dom.setText(parts.listenText, t(speech.active ? "learn.play.stop" : "learn.play.listen"));
        }

        function stopSpeaking() {
            if (!canSpeak) return;
            const wasActive = speech.active;
            speech.active = false;
            speech.session += 1;
            if (wasActive) window.speechSynthesis.cancel();
            if (parts) updateListen();
        }

        function startSpeaking() {
            if (!canSpeak) return;
            stopSpeaking();
            window.speechSynthesis.cancel();
            const chunks = [];
            parts.body.querySelectorAll("[data-speak]").forEach(function (element) {
                if (element.closest("[hidden]")) return;
                const text = element.textContent.replace(/\s+/g, " ").trim();
                if (text) chunks.push(text);
            });
            if (!chunks.length) return;
            const langCode = A.lang === "ru" ? "ru" : "en";
            const voice = (A.settings && A.settings.voice(langCode)) || window.speechSynthesis.getVoices().filter(function (item) {
                return item.lang && item.lang.toLowerCase().indexOf(langCode) === 0;
            })[0] || null;
            const rate = A.settings ? A.settings.get("speechRate") : 1;
            speech.active = true;
            speech.session += 1;
            const mine = speech.session;
            let index = 0;
            let started = false;
            const next = function () {
                if (mine !== speech.session) return;
                if (index >= chunks.length) {
                    stopSpeaking();
                    return;
                }
                const utterance = new window.SpeechSynthesisUtterance(chunks[index]);
                index += 1;
                utterance.lang = langCode === "ru" ? "ru-RU" : "en-US";
                if (voice) utterance.voice = voice;
                if (rate) utterance.rate = rate;
                utterance.onstart = function () { started = true; };
                utterance.onend = next;
                utterance.onerror = function (event) {
                    if (mine !== speech.session) return;
                    if (event.error === "interrupted" || event.error === "canceled") return;
                    stopSpeaking();
                    if (!started && A.has("lessons.reader.noSpeech")) A.toast(t("lessons.reader.noSpeech"), "🔇");
                };
                window.speechSynthesis.speak(utterance);
            };
            next();
            updateListen();
        }

        function toggleSpeaking() {
            if (speech.active) stopSpeaking();
            else startSpeaking();
        }

        // ---------- 5. The tasks ----------
        // The line under a question that says what to do
        function taskHint(step) {
            if (step.type === "order") return t("learn.task.order");
            if (step.type === "sort") return t("learn.task.sort");
            if (step.type === "match") return t("learn.task.match");
            if (step.type === "number") return t("learn.task.number");
            return "";
        }

        // The box under a task: "right", "wrong", "hint" (a wrong try that can be tried
        // again) or "shown" (the learner asked to see the answer)
        function feedbackHTML(kind, title, lines) {
            const mark = { right: "✓", wrong: "✗", hint: "💡", shown: "👀" }[kind];
            return '<div class="lpw-feedback is-' + kind + '">' +
                '<p class="lpw-feedback-title"><span class="lpw-feedback-mark" aria-hidden="true">' + mark + "</span> " + esc(title) + "</p>" +
                lines.filter(Boolean).map(function (line) { return '<p class="lpw-feedback-text" data-speak>' + line + "</p>"; }).join("") +
            "</div>";
        }

        // Brings the feedback into view (the body of the window scrolls, not the page)
        function revealFeedback(feedback) {
            if (typeof feedback.scrollIntoView !== "function") return;
            feedback.scrollIntoView({ block: "nearest", behavior: A.motion.ok() ? "smooth" : "auto" });
        }

        // Puts a task into "box". settings: { tries, done(result, feedback) }.
        // done gets { correct (right on the first try), solved (right in the end),
        // shown (the learner pressed "Show the answer"), answer (a text to show, or "") }
        // and the element for the feedback.
        // Returns { giveUp(), key(event) }: "I don't know" and the number keys.
        function mountTask(box, step, settings) {
            const tries = settings.tries;
            let wrong = 0;          // wrong tries so far
            let over = false;
            let shown = false;      // "Show the answer" was pressed
            box.innerHTML = '<div class="lpw-task-area"></div><div class="lpw-task-feedback"></div>';
            const area = box.firstChild;
            const feedback = box.lastChild;

            function end(solved, answer) {
                if (over) return;
                over = true;
                box.classList.add("is-over");
                settings.done({ correct: solved && wrong === 0, solved: solved, shown: shown && !solved, answer: answer || "" }, feedback);
            }

            // A wrong try that can be tried again: says so, with the hint of the task
            function tryAgain() {
                const hint = step.hint || t("learn.play.retry");
                feedback.innerHTML = feedbackHTML("hint", t("learn.play.wrong"), [rich(hint)]);
                revealFeedback(feedback);
                say(t("learn.play.wrong") + ". " + hint);
            }

            function focusFirst(selector) {
                const element = area.querySelector(selector);
                if (element) element.focus({ preventScroll: true });
            }

            // The number keys: 1 presses the first button of the list, 2 the second...
            function numberKey(event, selector) {
                const place = "123456789".indexOf(event.key);
                if (place === -1 || over) return false;
                const buttons = area.querySelectorAll(selector);
                if (place >= buttons.length) return false;
                buttons[place].click();
                return true;
            }

            // ----- Choose one answer -----
            function choiceTask() {
                const right = typeof step.correct === "number" ? step.correct : 0;
                let order = step.options.map(function (_, index) { return index; });
                if (!step.keepOrder) order = A.util.shuffle(order);
                area.innerHTML = '<div class="lpw-options" role="group">' + order.map(function (index, place) {
                    return '<button type="button" class="ui-option lpw-option" data-option="' + index + '">' +
                        '<span class="lpw-option-key mono" aria-hidden="true">' + num(place + 1) + "</span>" +
                        '<span class="lpw-option-text" data-speak>' + rich(step.options[index]) + "</span></button>";
                }).join("") + "</div>";
                const buttons = Array.prototype.slice.call(area.querySelectorAll(".lpw-option"));
                const isLocked = function (button) { return button.getAttribute("aria-disabled") === "true"; };
                const reveal = function () {
                    buttons.forEach(function (button) {
                        button.setAttribute("aria-disabled", "true");
                        if (Number(button.getAttribute("data-option")) === right) button.classList.add("is-correct");
                        else if (!button.classList.contains("is-wrong")) button.classList.add("is-dim");
                    });
                };
                area.addEventListener("click", function (event) {
                    const button = event.target.closest(".lpw-option");
                    if (!button || over || isLocked(button)) return;
                    if (Number(button.getAttribute("data-option")) === right) {
                        reveal();
                        end(true);
                        return;
                    }
                    wrong += 1;
                    button.classList.add("is-wrong");
                    button.setAttribute("aria-disabled", "true");
                    const open = buttons.filter(function (item) { return !isLocked(item); }).length;
                    if (wrong >= tries || open <= 1) {
                        reveal();
                        end(false);
                    } else {
                        tryAgain();
                    }
                });
                return {
                    giveUp: function () {
                        wrong += 1;
                        reveal();
                        end(false);
                    },
                    key: function (event) { return numberKey(event, ".lpw-option"); }
                };
            }

            // ----- Type a number -----
            function numberTask() {
                const tolerance = typeof step.tolerance === "number" ? step.tolerance : 0;
                const answerText = num(step.answer) + (step.unit ? " " + step.unit : "");
                area.innerHTML = '<form class="lpw-number" novalidate>' +
                    '<label class="lpw-label" for="lpw-number">' + esc(t("learn.task.numberLabel")) + "</label>" +
                    '<span class="lpw-number-row">' +
                        // ("±": many phone keypads for numbers have no minus key; see needsSign in js/learn.js)
                        (step.signed ? '<button type="button" class="btn btn-ghost btn-small lpw-number-sign" aria-label="' + esc(t("learn.task.sign")) + '" title="' + esc(t("learn.task.sign")) + '">±</button>' : "") +
                        '<input class="lpw-input" id="lpw-number" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="14">' +
                        (step.unit ? '<span class="lpw-number-unit">' + esc(step.unit) + "</span>" : "") +
                        '<button type="submit" class="btn btn-primary btn-small lpw-number-check">' + esc(t("learn.play.check")) + "</button>" +
                    "</span>" +
                "</form>";
                const form = area.firstChild;
                const input = form.querySelector("input");
                const signButton = form.querySelector(".lpw-number-sign");
                const lock = function (state) {
                    input.readOnly = true;
                    input.classList.add("is-" + state);
                    form.querySelector(".lpw-number-check").hidden = true;
                    if (signButton) signButton.hidden = true;
                };
                if (signButton) {
                    signButton.addEventListener("click", function () {
                        if (over || input.readOnly) return;
                        const typed = input.value.trim();
                        input.value = /^[-−–]/.test(typed) ? typed.replace(/^[-−–]\s*/, "") : "−" + typed;
                        input.focus();
                        input.setSelectionRange(input.value.length, input.value.length);
                    });
                }
                form.addEventListener("submit", function (event) {
                    event.preventDefault();
                    if (over) return;
                    const value = readNumber(input.value);
                    if (value === null) {
                        A.dom.replay(input, "is-shaking");
                        input.focus();
                        return;
                    }
                    if (Math.abs(value - step.answer) <= tolerance + 1e-9) {
                        lock("right");
                        end(true);
                        return;
                    }
                    wrong += 1;
                    if (wrong >= tries) {
                        lock("wrong");
                        end(false, answerText);
                    } else {
                        tryAgain();
                        input.select();
                    }
                });
                return {
                    giveUp: function () {
                        wrong += 1;
                        input.value = num(step.answer);
                        lock("shown");
                        end(false, answerText);
                    },
                    key: function () { return false; }
                };
            }

            // ----- Put the lines in the right order -----
            function orderTask() {
                const all = step.items.map(function (_, index) { return index; });
                let pool = A.util.shuffle(all);
                // A shuffle that changes nothing would give the answer away: turn it round
                if (all.length > 1 && pool.every(function (value, index) { return value === index; })) pool.reverse();
                let placed = [];
                let kept = 0;        // the lines at the start that are right (after a wrong try they stay)
                const draw = function (state) {       // "": still solving; "right" or "shown": the end
                    const rows = placed.map(function (item, index) {
                        const mark = state || (index < kept ? "kept" : "");
                        return '<li class="lpw-order-item' + (mark ? " is-" + mark : "") + '"><span class="lpw-order-num mono" aria-hidden="true">' + num(index + 1) + "</span>" +
                            "<span data-speak>" + rich(step.items[item]) + "</span></li>";
                    }).join("");
                    const picks = pool.map(function (item) {
                        return '<button type="button" class="ui-option lpw-order-pick" data-item="' + item + '"><span data-speak>' + rich(step.items[item]) + "</span></button>";
                    }).join("");
                    area.innerHTML =
                        (rows ? '<ol class="lpw-order-list">' + rows + "</ol>" : "") +
                        (picks ? '<div class="lpw-order-pool" role="group">' + picks + "</div>" : "") +
                        (!state && placed.length > kept
                            ? '<p class="lpw-order-tools"><button type="button" class="lp-link" data-order="reset">' + esc(t("learn.task.orderReset")) + "</button></p>"
                            : "");
                };
                const showAnswer = function (state) {
                    placed = all.slice();
                    pool = [];
                    draw(state);
                };
                const check = function () {
                    if (placed.every(function (value, index) { return value === index; })) {
                        showAnswer("right");
                        end(true);
                        return;
                    }
                    wrong += 1;
                    if (wrong >= tries) {
                        showAnswer("shown");
                        end(false);
                        return;
                    }
                    kept = 0;
                    while (kept < placed.length && placed[kept] === kept) kept += 1;
                    pool = A.util.shuffle(placed.slice(kept));
                    placed = placed.slice(0, kept);
                    draw("");
                    tryAgain();
                    focusFirst(".lpw-order-pick");
                };
                area.addEventListener("click", function (event) {
                    if (over) return;
                    if (event.target.closest("[data-order]")) {
                        pool = pool.concat(placed.slice(kept));
                        placed = placed.slice(0, kept);
                        draw("");
                        focusFirst(".lpw-order-pick");
                        return;
                    }
                    const pick = event.target.closest(".lpw-order-pick");
                    if (!pick) return;
                    const item = Number(pick.getAttribute("data-item"));
                    pool = pool.filter(function (value) { return value !== item; });
                    placed.push(item);
                    feedback.innerHTML = "";
                    if (pool.length) {
                        draw("");
                        focusFirst(".lpw-order-pick");
                    } else {
                        check();
                    }
                });
                draw("");
                return {
                    giveUp: function () {
                        wrong += 1;
                        showAnswer("shown");
                        end(false);
                    },
                    key: function (event) { return numberKey(event, ".lpw-order-pick"); }
                };
            }

            // ----- Put each one in the right group -----
            function sortTask() {
                const queue = A.util.shuffle(step.items.map(function (_, index) { return index; }));
                let at = 0;
                const rows = [];
                const rowHTML = function (item, ok) {
                    return '<li class="' + (ok ? "is-right" : "is-wrong") + '"><span class="lpw-sort-mark" aria-hidden="true">' + (ok ? "✓" : "✗") + "</span>" +
                        '<span class="lpw-sort-line">' + rich(item[0]) + ' <span class="lpw-sort-arrow" aria-hidden="true">→</span> <strong>' + rich(step.groups[item[1]]) + "</strong></span></li>";
                };
                const draw = function () {
                    const left = queue.length - at;
                    let html = "";
                    if (left > 0) {
                        html += '<p class="lpw-sort-left mono">' + esc(t("learn.task.sortLeft", { n: num(left) })) + "</p>" +
                            '<p class="lpw-sort-item" tabindex="-1" data-speak>' + rich(step.items[queue[at]][0]) + "</p>" +
                            '<div class="lpw-sort-groups" role="group">' + step.groups.map(function (group, index) {
                                return '<button type="button" class="ui-option lpw-sort-group" data-group="' + index + '">' +
                                    '<span class="lpw-option-key mono" aria-hidden="true">' + num(index + 1) + "</span><span data-speak>" + rich(group) + "</span></button>";
                            }).join("") + "</div>";
                    }
                    if (rows.length) html += '<ul class="lpw-sort-done">' + rows.join("") + "</ul>";
                    area.innerHTML = html;
                };
                const answer = function (group) {
                    if (over || at >= queue.length) return;
                    const item = step.items[queue[at]];
                    const ok = item[1] === group;
                    if (!ok) wrong += 1;
                    rows.unshift(rowHTML(item, ok));
                    say(t(ok ? "learn.play.right" : "learn.play.wrong") + " " + item[0] + ": " + step.groups[item[1]]);
                    at += 1;
                    draw();
                    if (at >= queue.length) end(wrong === 0);
                    else focusFirst(".lpw-sort-item");
                };
                area.addEventListener("click", function (event) {
                    const button = event.target.closest(".lpw-sort-group");
                    if (button) answer(Number(button.getAttribute("data-group")));
                });
                draw();
                return {
                    giveUp: function () {
                        wrong += 1;
                        while (at < queue.length) {
                            rows.unshift(rowHTML(step.items[queue[at]], true));
                            at += 1;
                        }
                        draw();
                        end(false);
                    },
                    key: function (event) { return numberKey(event, ".lpw-sort-group"); }
                };
            }

            // ----- Find the pairs -----
            function matchTask() {
                const rights = A.util.shuffle(step.pairs.map(function (_, index) { return index; }));
                const chosen = { left: -1, right: -1 };
                let matched = 0;
                const itemHTML = function (side, index, text) {
                    return '<button type="button" class="ui-option lpw-match-item" data-side="' + side + '" data-pair="' + index + '" aria-pressed="false">' +
                        "<span data-speak>" + rich(text) + "</span></button>";
                };
                area.innerHTML = '<div class="lpw-match">' +
                    '<div class="lpw-match-col" role="group">' + step.pairs.map(function (pair, index) { return itemHTML("left", index, pair[0]); }).join("") + "</div>" +
                    '<div class="lpw-match-col" role="group">' + rights.map(function (index) { return itemHTML("right", index, step.pairs[index][1]); }).join("") + "</div>" +
                "</div>";
                const find = function (side, index) {
                    return area.querySelector('[data-side="' + side + '"][data-pair="' + index + '"]');
                };
                const choose = function (side, index) {
                    const before = find(side, chosen[side]);
                    if (before) {
                        before.classList.remove("is-chosen");
                        before.setAttribute("aria-pressed", "false");
                    }
                    chosen[side] = index;
                    const now = find(side, index);
                    if (now) {
                        now.classList.add("is-chosen");
                        now.setAttribute("aria-pressed", "true");
                    }
                };
                const showPairs = function () {
                    area.innerHTML = '<ul class="lpw-pairs">' + step.pairs.map(function (pair) {
                        return "<li><span data-speak>" + rich(pair[0]) + '</span><span class="lpw-pairs-arrow" aria-hidden="true">→</span><span data-speak>' + rich(pair[1]) + "</span></li>";
                    }).join("") + "</ul>";
                };
                area.addEventListener("click", function (event) {
                    const button = event.target.closest(".lpw-match-item");
                    if (!button || over || button.getAttribute("aria-disabled") === "true") return;
                    const side = button.getAttribute("data-side");
                    const index = Number(button.getAttribute("data-pair"));
                    choose(side, chosen[side] === index ? -1 : index);
                    if (chosen.left === -1 || chosen.right === -1) return;
                    const left = find("left", chosen.left);
                    const right = find("right", chosen.right);
                    const ok = chosen.left === chosen.right;
                    choose("left", -1);
                    choose("right", -1);
                    if (ok) {
                        [left, right].forEach(function (item) {
                            item.classList.add("is-correct");
                            item.setAttribute("aria-disabled", "true");
                        });
                        matched += 1;
                        if (matched === step.pairs.length) {
                            showPairs();
                            end(true);
                        } else {
                            say(t("learn.play.right"));
                            focusFirst('.lpw-match-item[data-side="left"]:not([aria-disabled="true"])');
                        }
                    } else {
                        wrong += 1;
                        [left, right].forEach(function (item) {
                            A.dom.replay(item, "is-wrong");
                            setTimeout(function () { item.classList.remove("is-wrong"); }, WRONG_FLASH);
                        });
                        say(t("learn.play.wrong"));
                    }
                });
                return {
                    giveUp: function () {
                        wrong += 1;
                        showPairs();
                        end(false);
                    },
                    key: function () { return false; }
                };
            }

            const types = { choice: choiceTask, number: numberTask, order: orderTask, sort: sortTask, match: matchTask };
            const made = types[step.type]();
            return {
                giveUp: function () {
                    if (over) return;
                    shown = true;
                    made.giveUp();
                },
                key: made.key
            };
        }

        // ---------- 6. Cards: the memory check, practice, a stage test, the level check ----------
        // The name of the session, shown at the top of the window
        function sessionTitle() {
            if (!session) return "";
            const request = session.request;
            if (session.mode === "guide") return session.info.title;
            if (session.mode === "explain") return t("learn.explain.title");
            if (request.kind === "place") return t("learn.place.title");
            if (request.kind === "test") return t("learn.review.test", { stage: host.stageName(request.stage) });
            if (request.kind === "topic") return t("learn.review.practice", { topic: host.topicName(request.topic) });
            if (request.kind === "more") return t("learn.review.more");
            return t("learn.review.title");
        }

        function celebrate() {
            if (A.motion.ok() && A.effects && typeof A.effects.confetti === "function") A.effects.confetti();
        }

        // What the buttons of the end screens do
        function endActions() {
            return {
                path: function () {
                    close({ focusBack: false });
                    host.showPath();
                },
                done: function () { close({ focusBack: true }); },
                more: function () { host.moreCards(opener); },
                lesson: function (button) {
                    const n = Number(button.getAttribute("data-n"));
                    close({ focusBack: false });
                    host.openLesson(n);
                },
                unit: function (button) { host.openUnit(button.getAttribute("data-unit"), opener); },
                test: function () { host.openTest(session.request.stage, opener); }
            };
        }

        function startCards(request) {
            const place = request.kind === "place";
            const queue = [];
            if (place) {
                (request.probes || []).forEach(function (probe) {
                    probe.cards.forEach(function (id) { queue.push({ id: id, stage: probe.stage }); });
                });
            } else {
                (request.cards || []).forEach(function (id) { queue.push({ id: id, stage: "" }); });
            }
            session = {
                mode: "cards", request: request, kind: request.kind, queue: queue, index: 0,
                right: 0, total: 0, missed: [], seen: {}, scores: {}, asked: {}, start: "", show: null
            };
            if (!queue.length) {
                showEmpty();
                return;
            }
            loading();
            const mine = run;
            host.loadCards(queue.map(function (item) { return item.id; })).then(function () {
                if (mine !== run) return;
                // A card that cannot be shown (its question is gone) is left out
                session.queue = session.queue.filter(function (item) { return Boolean(host.card(item.id)); });
                if (!session.queue.length) showEmpty();
                else if (place) showPlaceIntro();
                else showCard();
            }, function () {
                if (mine === run) loadError(function () { startCards(request); });
            });
        }

        // Nothing to ask: no card is ready (or there are no cards yet)
        function showEmpty() {
            session.show = showEmpty;
            const memory = host.memory();
            const lines = [t(memory.total ? "learn.review.emptyText" : "learn.review.emptyNew")];
            if (memory.total && !memory.due && memory.next) lines.push(t("learn.review.nextWhen", { when: host.whenText(memory.next) }));
            const buttons = [];
            if (memory.total && session.kind === "review") buttons.push({ act: "more", label: t("learn.review.again") });
            buttons.push({ act: "path", label: t("learn.play.backToPath"), primary: true });
            screen({
                kicker: sessionTitle(),
                html: '<div class="lpw-end"><span class="lpw-end-icon" aria-hidden="true">🌤️</span>' +
                    '<h3 class="lpw-end-title" data-focus tabindex="-1">' + esc(t("learn.review.emptyTitle")) + "</h3>" +
                    lines.map(function (line) { return '<p class="lpw-text" data-speak>' + esc(line) + "</p>"; }).join("") + "</div>",
                buttons: buttons,
                actions: endActions()
            });
        }

        function showCard() {
            session.show = showCard;
            const item = session.queue[session.index];
            const card = host.card(item.id);
            if (!card) {
                nextCard();
                return;
            }
            const total = session.queue.length;
            const from = card.from + (card.topic && card.topic !== card.from ? " · " + card.topic : "");
            const hint = taskHint(card);
            screen({
                kicker: sessionTitle(),
                count: t("learn.play.step", { n: num(session.index + 1), total: num(total) }),
                progress: session.index / total,
                html: '<div class="lpw-step lpw-card">' +
                        '<p class="lpw-from mono">' + esc(from) + "</p>" +
                        contextHTML(card) +
                        '<h3 class="lpw-q" data-focus tabindex="-1" data-speak>' + rich(card.q) + "</h3>" +
                        (hint ? '<p class="lpw-task-kind">' + esc(hint) + "</p>" : "") +
                        '<div class="lpw-task"></div>' +
                    "</div>",
                buttons: [{ act: "giveup", label: t("learn.play.dontKnow") }],
                actions: { giveup: function () { if (task) task.giveUp(); } }
            });
            task = mountTask(parts.body.querySelector(".lpw-task"), card, {
                tries: CARD_TRIES,
                done: function (result, feedback) { cardAnswered(item, card, result, feedback); }
            });
        }

        function cardAnswered(item, card, result, feedback) {
            let back = null;
            if (!session.seen[item.id]) {
                // The first answer to a card is the one that counts
                session.seen[item.id] = true;
                session.total += 1;
                if (result.correct) session.right += 1;
                else session.missed.push(item.id);
                if (session.kind === "place") {
                    // The level check only places you: it does not move the memory
                    session.asked[item.stage] = (session.asked[item.stage] || 0) + 1;
                    session.scores[item.stage] = (session.scores[item.stage] || 0) + (result.correct ? 1 : 0);
                } else {
                    back = host.answer(item.id, result.correct);
                    // A missed card comes once more at the end, so the session ends with it right
                    if (!result.correct && session.kind !== "test") session.queue.push({ id: item.id, stage: "" });
                }
            }
            const lines = [];
            if (!result.solved && result.answer) lines.push(esc(t("learn.play.answerWas", { answer: result.answer })));
            if (card.why) lines.push(rich(card.why));
            if (back) {
                lines.push('<span class="lpw-back">' + esc(back.wait === 1 ? t("learn.review.backTomorrow") : A.plural("learn.review.back", back.wait)) + "</span>");
            }
            const kind = result.solved ? "right" : (result.shown ? "shown" : "wrong");
            const title = t("learn.play." + kind);
            feedback.innerHTML = feedbackHTML(kind, title, lines);
            say(title + " " + (card.why || ""));
            const last = session.index >= session.queue.length - 1;
            actions = { next: nextCard };
            setButtons([{ act: "next", label: t(last ? "learn.play.finish" : "learn.play.next"), primary: true }]);
            updateListen();
            focusButton("next");
            revealFeedback(feedback);
        }

        // The level check stops after the first stage with a wrong answer: the path starts there
        function placeStops(stage) {
            const more = session.queue.slice(session.index).some(function (item) { return item.stage === stage; });
            return !more && (session.scores[stage] || 0) < (session.asked[stage] || 0);
        }

        function nextCard() {
            const item = session.queue[session.index];
            session.index += 1;
            const place = session.kind === "place";
            if (place && item && placeStops(item.stage)) finishPlace();
            else if (session.index < session.queue.length) showCard();
            else if (place) finishPlace();
            else finishCards();
        }

        // The cards that were missed, each with a way back to where it is taught
        function missedHTML() {
            const rows = session.missed.map(function (id) {
                const card = host.card(id);
                if (!card) return "";
                let link = "";
                if (card.lesson) {
                    link = '<button type="button" class="lp-link" data-act="lesson" data-n="' + card.lesson + '">' +
                        esc(t("learn.review.openLesson", { n: num(card.lesson) })) + "</button>";
                } else if (card.unitId) {
                    link = '<button type="button" class="lp-link" data-act="unit" data-unit="' + esc(card.unitId) + '">' +
                        esc(t("learn.review.openUnit", { title: card.from })) + "</button>";
                }
                return '<li><span class="lpw-missed-q">' + rich(card.q) + "</span>" + link + "</li>";
            }).join("");
            if (!rows) return "";
            return '<div class="lpw-missed"><p class="lpw-mini mono">' + esc(t("learn.review.missedTitle")) + "</p><ul>" + rows + "</ul></div>";
        }

        function finishCards() {
            host.finishCards(session.request, { right: session.right, total: session.total });
            if (session.kind === "test") {
                session.passed = session.right >= host.testPass() && session.total >= data.test.questions;
                if (session.passed) celebrate();
                showTestEnd();
            } else {
                showCardsEnd();
            }
        }

        function showCardsEnd() {
            session.show = showCardsEnd;
            const review = session.kind === "review";
            const perfect = session.total > 0 && session.right === session.total;
            const memory = host.memory();
            let next = "";
            if (memory.due) next = A.plural("learn.today.review.text", memory.due);
            else if (memory.next) next = t("learn.review.nextWhen", { when: host.whenText(memory.next) });
            screen({
                kicker: sessionTitle(),
                progress: 1,
                html: '<div class="lpw-end">' +
                        '<span class="lpw-end-icon" aria-hidden="true">' + (perfect ? "🌟" : "🧠") + "</span>" +
                        '<h3 class="lpw-end-title" data-focus tabindex="-1">' + esc(t(review ? "learn.review.endTitle" : "learn.review.endPractice")) + "</h3>" +
                        '<p class="lpw-score mono">' + esc(t("learn.review.score", { right: num(session.right), total: num(session.total) })) + "</p>" +
                        (perfect ? '<p class="lpw-text" data-speak>' + esc(t("learn.review.perfect")) + "</p>" : "") +
                        missedHTML() +
                        (next ? '<p class="lpw-next" data-speak>' + esc(next) + "</p>" : "") +
                        saveNote() +
                    "</div>",
                buttons: [
                    { act: "more", label: t("learn.review.again") },
                    { act: "path", label: t("learn.play.backToPath"), primary: true }
                ],
                actions: endActions()
            });
        }

        function showTestEnd() {
            session.show = showTestEnd;
            const values = {
                score: num(session.right), total: num(session.total),
                pass: num(host.testPass()), stage: host.stageName(session.request.stage)
            };
            const passed = session.passed;
            screen({
                kicker: sessionTitle(),
                progress: 1,
                html: '<div class="lpw-end' + (passed ? " is-pass" : "") + '">' +
                        '<span class="lpw-end-icon" aria-hidden="true">' + (passed ? "⭐" : "🧗") + "</span>" +
                        '<h3 class="lpw-end-title" data-focus tabindex="-1">' + esc(t(passed ? "learn.test.passTitle" : "learn.test.failTitle", values)) + "</h3>" +
                        '<p class="lpw-text" data-speak>' + esc(t(passed ? "learn.test.passText" : "learn.test.failText", values)) + "</p>" +
                        missedHTML() +
                        saveNote() +
                    "</div>",
                buttons: passed
                    ? [{ act: "path", label: t("learn.play.backToPath"), primary: true }]
                    : [{ act: "path", label: t("learn.play.backToPath") }, { act: "test", label: t("learn.test.again"), primary: true }],
                actions: endActions()
            });
        }

        // ----- The level check -----
        function showPlaceIntro() {
            session.show = showPlaceIntro;
            screen({
                kicker: sessionTitle(),
                html: '<div class="lpw-end"><span class="lpw-end-icon" aria-hidden="true">🎯</span>' +
                    '<h3 class="lpw-end-title" data-focus tabindex="-1">' + esc(t("learn.place.title")) + "</h3>" +
                    '<p class="lpw-text" data-speak>' + esc(A.plural("learn.place.intro", session.queue.length)) + "</p></div>",
                buttons: [{ act: "begin", label: t("learn.place.begin"), primary: true }],
                actions: { begin: showCard }
            });
        }

        function finishPlace() {
            session.start = host.finishPlacement(session.scores, session.asked);
            showPlaceEnd();
        }

        function showPlaceEnd() {
            session.show = showPlaceEnd;
            const start = session.start;
            const lines = (session.request.probes || []).filter(function (probe) {
                return session.asked[probe.stage];
            }).map(function (probe) {
                return "<li>" + esc(t("learn.place.line", {
                    stage: host.stageName(probe.stage),
                    score: num(session.scores[probe.stage] || 0),
                    total: num(session.asked[probe.stage])
                })) + "</li>";
            }).join("");
            screen({
                kicker: sessionTitle(),
                progress: 1,
                html: '<div class="lpw-end">' +
                        '<span class="lpw-end-icon" aria-hidden="true">🧭</span>' +
                        '<h3 class="lpw-end-title" data-focus tabindex="-1">' + esc(t("learn.place.resultTitle", { stage: host.stageName(start) })) + "</h3>" +
                        '<p class="lpw-text" data-speak>' + esc(t("learn.place.result." + start)) + "</p>" +
                        (lines ? '<ul class="lpw-lines mono">' + lines + "</ul>" : "") +
                        (start === "zero" ? '<p class="lpw-next" data-speak>' + esc(t("learn.place.stopped")) + "</p>" : "") +
                        saveNote() +
                    "</div>",
                buttons: [{ act: "path", label: t("learn.place.see"), primary: true }],
                actions: endActions()
            });
        }

        // ---------- 7. A guided step ----------
        function startGuide(request) {
            const info = host.unit(request.unit);
            if (!info) {
                close({ focusBack: true });
                return;
            }
            session = { mode: "guide", request: request, info: info, steps: null, index: 0, scored: {}, first: 0, tasks: 0, added: 0, show: null };
            loading();
            const mine = run;
            host.loadCourse(info.course).then(function (course) {
                if (mine !== run) return;
                const unit = course.units ? course.units[info.id] : null;
                if (!unit || !Array.isArray(unit.steps) || !unit.steps.length) throw new Error("the step has no screens");
                session.steps = unit.steps;
                session.tasks = unit.steps.filter(isTask).length;
                showStep();
            }).catch(function () {
                if (mine === run) loadError(function () { startGuide(request); });
            });
        }

        function showStep() {
            session.show = showStep;
            const index = session.index;
            const total = session.steps.length;
            const step = host.localStep(session.steps[index]);
            if (step.type === "number") step.signed = host.signed(session.info.id);
            const last = index === total - 1;
            const back = index > 0 ? [{ act: "back", label: t("learn.setup.back") }] : [];
            const goOn = { act: "next", label: t(last ? "learn.play.finish" : "learn.play.continue"), primary: true };
            const common = {
                kicker: sessionTitle(),
                count: t("learn.play.step", { n: num(index + 1), total: num(total) }),
                progress: index / total
            };
            const move = {
                back: function () {
                    session.index -= 1;
                    showStep();
                },
                next: function () {
                    if (last) {
                        finishGuide();
                    } else {
                        session.index += 1;
                        showStep();
                    }
                }
            };
            const icon = step.icon ? '<span class="lpw-info-icon" aria-hidden="true">' + step.icon + "</span>" : "";

            if (step.type === "info") {
                screen(Object.assign(common, {
                    html: '<div class="lpw-step lpw-info">' + icon +
                        '<h3 class="lpw-title" data-focus tabindex="-1" data-speak>' + rich(step.title) + "</h3>" +
                        contextHTML(step) + "</div>",
                    buttons: back.concat([goOn]),
                    actions: move
                }));
                return;
            }

            if (step.type === "recap") {
                screen(Object.assign(common, {
                    html: '<div class="lpw-step lpw-recap"><span class="lpw-info-icon" aria-hidden="true">📌</span>' +
                        '<h3 class="lpw-title" data-focus tabindex="-1" data-speak>' + esc(t("learn.task.recap")) + "</h3>" +
                        '<ul class="lpw-points">' + list(step.points).map(function (point) { return "<li data-speak>" + rich(point) + "</li>"; }).join("") + "</ul></div>",
                    buttons: back.concat([goOn]),
                    actions: move
                }));
                return;
            }

            if (step.type === "reveal") {
                move.reveal = function () {
                    const answer = parts.body.querySelector(".lpw-reveal");
                    answer.hidden = false;
                    actions = move;
                    setButtons(back.concat([goOn]));
                    updateListen();
                    focusButton("next");
                    say(answer.textContent);
                    revealFeedback(answer);
                };
                screen(Object.assign(common, {
                    html: '<div class="lpw-step lpw-reveal-step">' + icon +
                        contextHTML(step) +
                        '<h3 class="lpw-q" data-focus tabindex="-1" data-speak>' + rich(step.q) + "</h3>" +
                        '<p class="lpw-task-kind">' + esc(t("learn.task.reveal")) + "</p>" +
                        '<div class="lpw-reveal" hidden>' + paragraphs(step.answer, "lpw-text") + "</div></div>",
                    buttons: back.concat([{ act: "reveal", label: t("learn.task.revealButton"), primary: true }]),
                    actions: move
                }));
                return;
            }

            // A task
            const hint = taskHint(step);
            move.giveup = function () { if (task) task.giveUp(); };
            screen(Object.assign(common, {
                html: '<div class="lpw-step">' + icon +
                    contextHTML(step) +
                    '<h3 class="lpw-q" data-focus tabindex="-1" data-speak>' + rich(step.q) + "</h3>" +
                    (hint ? '<p class="lpw-task-kind">' + esc(hint) + "</p>" : "") +
                    '<div class="lpw-task"></div></div>',
                buttons: back.concat([{ act: "giveup", label: t("learn.play.show") }]),
                actions: move
            }));
            task = mountTask(parts.body.querySelector(".lpw-task"), step, {
                tries: GUIDE_TRIES,
                done: function (result, feedback) {
                    // Only the first time a task is done counts (you can go back and do it again)
                    if (!session.scored[index]) {
                        session.scored[index] = true;
                        if (result.correct) session.first += 1;
                    }
                    const lines = [];
                    if (!result.solved && result.answer) lines.push(esc(t("learn.play.answerWas", { answer: result.answer })));
                    if (step.why) lines.push(rich(step.why));
                    const kind = result.solved ? "right" : (result.shown ? "shown" : "wrong");
                    const title = t("learn.play." + kind);
                    feedback.innerHTML = feedbackHTML(kind, title, lines);
                    say(title + " " + (step.why || ""));
                    actions = move;
                    setButtons(back.concat([goOn]));
                    updateListen();
                    focusButton("next");
                    revealFeedback(feedback);
                }
            });
        }

        function finishGuide() {
            session.added = host.finishUnit(session.info.id, { first: session.first, total: session.tasks });
            session.info = host.unit(session.info.id);
            if (session.tasks && session.first === session.tasks) celebrate();
            showGuideEnd();
        }

        function showGuideEnd() {
            session.show = showGuideEnd;
            const info = session.info;
            const all = session.tasks > 0 && session.first === session.tasks;
            const actionsNow = endActions();
            actionsNow.again = function () {
                session.index = 0;
                showStep();
            };
            actionsNow.nextunit = function () { host.openUnit(info.next.id, opener); };
            actionsNow.stagetest = function () { host.openTest(info.stage, opener); };
            const back = { act: "path", label: t("learn.play.backToPath") };
            screen({
                kicker: sessionTitle(),
                progress: 1,
                html: '<div class="lpw-end is-pass">' +
                        '<span class="lpw-end-icon" aria-hidden="true">' + (all ? "🌟" : "🎉") + "</span>" +
                        '<h3 class="lpw-end-title" data-focus tabindex="-1">' + esc(t("learn.guide.doneTitle")) + "</h3>" +
                        (session.tasks ? '<p class="lpw-score mono">' + esc(all ? t("learn.guide.doneAll") : t("learn.guide.doneFirst", { right: num(session.first), total: num(session.tasks) })) + "</p>" : "") +
                        (session.added ? '<p class="lpw-text" data-speak>' + esc(A.plural("learn.guide.cards", session.added)) + "</p>" : "") +
                        '<p class="lpw-again"><button type="button" class="lp-link" data-act="again">' + esc(t("learn.guide.again")) + "</button></p>" +
                        saveNote() +
                    "</div>",
                buttons: info.next
                    ? [back, { act: "nextunit", label: t("learn.guide.nextUnit", { title: info.next.title }), primary: true }]
                    : info.test
                        ? [back, { act: "stagetest", label: t("learn.guide.toTest"), primary: true }]
                        : [{ act: "path", label: t("learn.play.backToPath"), primary: true }],
                actions: actionsNow
            });
        }

        // ---------- 8. Explain it back ----------
        function startExplain(request) {
            const info = host.explainInfo(request.lesson);
            if (!info) {
                close({ focusBack: true });
                return;
            }
            session = { mode: "explain", request: request, info: info, text: info.saved ? info.saved.text : "", score: 0, show: null };
            showExplainWrite();
        }

        function explainFrom() {
            return t("learn.review.fromLesson", { n: num(session.info.n) }) + " · " + session.info.title;
        }

        function showExplainWrite() {
            session.show = showExplainWrite;
            const info = session.info;
            const lead = t("learn.explain.lead");
            screen({
                kicker: sessionTitle(),
                html: '<div class="lpw-step lpw-explain">' +
                        '<p class="lpw-from mono">' + esc(explainFrom()) + "</p>" +
                        '<h3 class="lpw-q" data-focus tabindex="-1" data-speak>' + esc(info.prompt) + "</h3>" +
                        (info.prompt !== lead ? '<p class="lpw-text" data-speak>' + esc(lead) + "</p>" : "") +
                        '<label class="lpw-label" for="lpw-explain">' + esc(t("learn.explain.label")) + "</label>" +
                        '<textarea class="lpw-textarea" id="lpw-explain" rows="6" maxlength="1200" placeholder="' + esc(t("learn.explain.placeholder")) + '">' + esc(session.text) + "</textarea>" +
                        '<p class="lpw-error" role="alert" hidden>' + esc(t("learn.explain.tooShort")) + "</p>" +
                    "</div>",
                buttons: [{ act: "compare", label: t("learn.explain.compare"), primary: true }],
                actions: {
                    compare: function () {
                        const field = parts.body.querySelector(".lpw-textarea");
                        session.text = field.value.trim();
                        if (session.text.length < EXPLAIN_MIN) {
                            parts.body.querySelector(".lpw-error").hidden = false;
                            field.focus();
                            return;
                        }
                        showExplainCheck();
                    }
                }
            });
            const field = parts.body.querySelector(".lpw-textarea");
            field.addEventListener("input", function () {
                session.text = field.value;
                parts.body.querySelector(".lpw-error").hidden = true;
            });
        }

        function showExplainCheck() {
            session.show = showExplainCheck;
            const info = session.info;
            screen({
                kicker: sessionTitle(),
                html: '<div class="lpw-step lpw-explain">' +
                        '<p class="lpw-from mono">' + esc(explainFrom()) + "</p>" +
                        '<h3 class="lpw-q" data-focus tabindex="-1" data-speak>' + esc(t("learn.explain.checkTitle")) + "</h3>" +
                        '<p class="lpw-text" data-speak>' + esc(t("learn.explain.checkText")) + "</p>" +
                        '<div class="lpw-yours"><p class="lpw-mini mono">' + esc(t("learn.explain.yours")) + '</p><p class="lpw-yours-text">' + esc(session.text) + "</p></div>" +
                        '<ul class="lpw-keys">' + info.keys.map(function (key, index) {
                            return '<li><label class="lpw-key"><input type="checkbox" data-key="' + (index + 1) + '"><span data-speak>' + esc(key) + "</span></label></li>";
                        }).join("") + "</ul>" +
                    "</div>",
                buttons: [
                    { act: "edit", label: t("learn.explain.edit") },
                    { act: "save", label: t("learn.explain.save"), primary: true }
                ],
                actions: {
                    edit: showExplainWrite,
                    save: function () {
                        session.score = parts.body.querySelectorAll(".lpw-key input:checked").length;
                        host.saveExplain(info.n, session.text, session.score);
                        if (session.score === info.keys.length) celebrate();
                        showExplainEnd();
                    }
                }
            });
        }

        function showExplainEnd() {
            session.show = showExplainEnd;
            const info = session.info;
            const prompt = t("learn.explain.prompt", { title: info.title, text: session.text, k1: info.keys[0], k2: info.keys[1], k3: info.keys[2] });
            const score = Math.max(0, Math.min(3, session.score));
            // A second opinion: a prompt for the learner's own chatbot. Young explorers are
            // not sent to a chatbot: they are asked to tell it to a person they know.
            const second = host.who() === "kid"
                ? '<div class="lpw-bot">' +
                    '<p class="lpw-bot-title"><span aria-hidden="true">🧑‍🤝‍🧑</span> ' + esc(t("learn.explain.kidTitle")) + "</p>" +
                    '<p class="lpw-text" data-speak>' + esc(t("learn.explain.kidText")) + "</p>" +
                  "</div>"
                : '<div class="lpw-bot">' +
                    '<p class="lpw-bot-title"><span aria-hidden="true">💬</span> ' + esc(t("learn.explain.botTitle")) + "</p>" +
                    '<p class="lpw-text">' + esc(t("learn.explain.botText")) + "</p>" +
                    '<textarea class="lpw-prompt" rows="6" readonly aria-label="' + esc(t("learn.explain.botCopy")) + '">' + esc(prompt) + "</textarea>" +
                    '<p class="lpw-bot-row"><button type="button" class="btn btn-ghost btn-small" data-act="copy">' + esc(t("learn.explain.botCopy")) + "</button>" +
                        '<span class="lpw-copy-state" role="status"></span></p>' +
                  "</div>";
            screen({
                kicker: sessionTitle(),
                html: '<div class="lpw-end lpw-explain-end' + (score === 3 ? " is-pass" : "") + '">' +
                        '<span class="lpw-end-icon" aria-hidden="true">' + (score === 3 ? "🌟" : "🗣️") + "</span>" +
                        '<h3 class="lpw-end-title" data-focus tabindex="-1" data-speak>' + esc(t("learn.explain.result." + score)) + "</h3>" +
                        (score < 3 ? '<p class="lpw-again"><button type="button" class="lp-link" data-act="keys">' + esc(t("learn.explain.openLesson")) + "</button></p>" : "") +
                        second +
                        saveNote() +
                    "</div>",
                buttons: [
                    { act: "edit", label: t("learn.explain.edit") },
                    { act: "done", label: t("learn.explain.done"), primary: true }
                ],
                actions: {
                    edit: showExplainWrite,
                    done: function () { close({ focusBack: true }); },
                    keys: function () {
                        close({ focusBack: false });
                        host.openLesson(info.n, { part: "keys" });
                    }
                }
            });
        }

        // ---------- 9. Opening and closing ----------
        // Opens the window on a request (from: the button that asked, it gets the focus back)
        function open(request, from) {
            if (!root) build();
            run += 1;
            stopSpeaking();
            if (!isOpen) {
                // Other windows in the way close first. An open lesson stays open under
                // this window, so "Explain it back" can start inside a lesson.
                A.overlays.closeAll({ except: ["lesson-reader"], reason: "navigate" });
                clearTimeout(closeTimer);
                opener = from && from !== document.body ? from : null;
                isOpen = true;
                root.hidden = false;
                root.classList.remove("is-closing");
                overlay.opened();
            }
            root.classList.toggle("is-kid", host.who() === "kid");
            root.setAttribute("data-mode", request.mode);
            if (request.mode === "guide") startGuide(request);
            else if (request.mode === "explain") startExplain(request);
            else startCards(request);
        }

        // The button that opened the window. The page may have been drawn again since
        // (a finished step changes it): then the button that took its place.
        function focusTarget() {
            const button = A.dom.findAgain(opener);
            if (button && button.getClientRects().length) return button;
            return typeof host.focusFallback === "function" ? host.focusFallback() : null;
        }

        // options.focusBack: the focus goes back to the button that opened the window
        function close(options) {
            if (!isOpen) return;
            isOpen = false;
            liftToasts();
            run += 1;
            stopSpeaking();
            task = null;
            session = null;
            actions = {};
            root.classList.add("is-closing");
            // (core calls this a frame later: by then the page behind may have been drawn again)
            overlay.closed(options && options.focusBack ? function () {
                const target = focusTarget();
                if (target) target.focus({ preventScroll: true });
            } : null);
            closeTimer = setTimeout(function () {
                root.hidden = true;
                root.classList.remove("is-closing");
                parts.body.innerHTML = "";
            }, A.motion.ok() ? CLOSE_MS : 0);
            if (typeof host.closed === "function") host.closed();
        }

        // Another language: the screen is drawn again in it
        A.onLanguageChange(function () {
            if (!isOpen || !session) return;
            if (session.mode === "guide") session.info = host.unit(session.info.id) || session.info;
            if (session.mode === "explain") session.info = host.explainInfo(session.info.n) || session.info;
            if (typeof session.show === "function") session.show();
        });

        return {
            open: open,
            close: function () { close({ focusBack: true }); },
            isOpen: function () { return isOpen; }
        };
    }

    A.feature("learnPlay", { create: create });
})();
