/* =========================================================
   AI COMPASS — LAB: INSIDE A CHATBOT
   A chatbot is a pipeline of simple steps, repeated at an enormous scale.
   Four views follow a text through it:
     Tokens     the text is cut into pieces from a vocabulary (byte-pair
                encoding, learned here from one page of text)
     Meaning    every piece is a list of numbers (an embedding)
     Context    attention lets the words take meaning from each other
     Next word  scores become chances, and weighted dice pick a word
   Texts and data: js/content/lab/chatbot.js. Styles: css/lab/chatbot.css.
   Tests: dev/tests/chatbot.test.js and dev/tests/chatbot.math.js.

   Sections:
    1. Settings
    2. Small helpers
    3. Tokens: byte-pair encoding
    4. Meaning: word vectors and the map
    5. Context: attention
    6. Next word: chances and dice
    7. Drawing the map of words
    8. Drawing attention
    9. View 1: tokens
   10. View 2: meaning
   11. View 3: context
   12. View 4: next word
   13. The experiment (A.lab.define)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lab || !A.lab.define) return;

    const t = A.t;
    const kit = A.labKit;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
    const VIEWS = ["tokens", "meaning", "context", "next"];
    const SAVE_VERSION = 1;          // ctx.store "settings" = { v: 1, view, text, word } (null: not changed)
    // View 1: tokens
    const TEXT_LIMIT = 300;          // characters in the text box
    const MAX_MERGES = 400;          // merges the tokenizer may learn
    const CHOICES = ["en", "ru", "both"];   // what it may learn from
    const START_CHOICE = "both";
    const PLAY_SPEED = 25;           // merges per second while "Play" runs
    const TRAIN_BUDGET = 8;          // ms of training per frame, so the page stays smooth
    const CHIP_COLORS = 6;           // token chips take turns with this many colours
    const SPACE_MARK = "▁";          // a word start, shown the way SentencePiece shows it
    const NEWLINE_MARK = "↵";
    const IDS_SHOWN = 10;            // token numbers listed in "What's happening?"

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    let lastId = 0;                  // for element ids (a page may hold this experiment twice)

    function newId(name) {
        lastId += 1;
        return "ch-" + name + "-" + lastId;
    }

    // el("p", "ch-note") or el("span", "ch-mark", "▁")
    function el(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    // Writes a text, but only when it changed. Our texts may hold simple HTML (<strong>).
    function write(element, text) {
        if (text.indexOf("<") === -1 && text.indexOf("&") === -1) {
            if (element.firstElementChild || element.textContent !== text) element.textContent = text;
        } else if (element.innerHTML !== text) {
            element.innerHTML = text;
        }
    }

    // A translated text that core writes again by itself after a language change
    function setKey(element, key) {
        element.setAttribute("data-i18n", key);
        write(element, t(key));
    }

    function textEl(tag, className, key) {
        const element = el(tag, className);
        setKey(element, key);
        return element;
    }

    // t() with safe {placeholders}: numbers are written the local way and words are escaped,
    // because the texts may hold HTML and the words may be anything somebody typed
    function tx(key, values) {
        const safe = {};
        Object.keys(values).forEach(function (name) {
            const value = values[name];
            safe[name] = typeof value === "number" ? kit.number(value) : A.escapeHTML(value);
        });
        return t(key, safe);
    }

    // A text without its HTML tags (for screen-reader messages)
    function plain(text) {
        return String(text).replace(/<[^>]*>/g, "");
    }

    function decimals(value, digits) {
        return A.format.number(value, { digits: digits });
    }

    function percent(share, digits) {
        return A.format.percent(share, { digits: digits || 0 });
    }

    // A box with a title (h4: the hub's stage title is an h3) around related parts
    function panel(titleKey, children) {
        const element = el("section", "ch-panel");
        const title = textEl("h4", "ch-title", titleKey);
        title.id = newId("title");
        element.setAttribute("aria-labelledby", title.id);
        element.appendChild(title);
        children.forEach(function (child) { element.appendChild(child.element || child); });
        return element;
    }

    // "Real chatbots …. This is called a [term]." under every view
    function ideaLine(key, term, termKey) {
        const line = el("p", "ch-idea");
        line.appendChild(textEl("span", "", key));
        line.append(" ", kit.termLink(term, termKey), ".");
        return line;
    }

    // A text box with its label and hint.
    // TODO(kit): kit.textInput — the kit has no text box yet, so this one copies its fields.
    function textBox(labelKey, hintKey, value, onInput) {
        const id = newId("text");
        const element = el("div", "lk-field ch-textbox");
        const label = textEl("label", "lk-label", labelKey);
        label.htmlFor = id;
        const input = el("textarea", "ch-input");
        input.id = id;
        input.rows = 2;
        input.maxLength = TEXT_LIMIT;
        input.spellcheck = false;
        input.value = value;
        const help = textEl("p", "lk-help", hintKey);
        help.id = id + "-hint";
        input.setAttribute("aria-describedby", help.id);
        input.addEventListener("input", onInput);
        element.append(label, input, help);
        return { element: element, input: input };
    }

    // A thin bar that fills up while something is being worked out.
    // TODO(kit): kit.progress — the kit has no progress bar yet.
    function progressBar(labelKey) {
        const element = el("div", "ch-progress");
        const label = textEl("span", "ch-progress-text", labelKey);
        label.id = newId("progress");
        const track = el("div", "ch-progress-track");
        track.setAttribute("role", "progressbar");
        track.setAttribute("aria-labelledby", label.id);
        track.setAttribute("aria-valuemin", "0");
        track.setAttribute("aria-valuemax", "100");
        const fill = el("div", "ch-progress-fill");
        track.appendChild(fill);
        element.append(label, track);
        return {
            element: element,
            set: function (share) {
                const value = Math.round(A.util.clamp(share, 0, 1) * 100);
                fill.style.width = value + "%";
                track.setAttribute("aria-valuenow", String(value));
            }
        };
    }

    // A short animation: onFrame(share) on every frame, share going from 0 to 1 in ms
    // (fast at first, then slowing down), then onDone(). With animations off (calm mode,
    // reduced motion) it jumps to the end at once. finish() jumps to the end now.
    function tween(ms, onFrame, onDone) {
        let frame = 0;
        let started = 0;
        let done = false;

        function end() {
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
            done = true;
            onFrame(1);
            if (onDone) onDone();
        }

        function tick(now) {
            frame = 0;
            if (!started) started = now;
            const share = (now - started) / ms;
            if (share >= 1) {
                end();
                return;
            }
            onFrame(A.util.easeOut(share));
            frame = requestAnimationFrame(tick);
        }

        if (A.motion.ok()) frame = requestAnimationFrame(tick);
        else end();
        return {
            finish: function () { if (!done) end(); },
            running: function () { return !done; }
        };
    }

    // How a token looks: the space of a word start as a small ▁ (the way SentencePiece
    // shows it) and a new line as ↵
    function shown(token) {
        return token.replace(/ /g, SPACE_MARK).replace(/\n/g, NEWLINE_MARK);
    }

    // How a screen reader says a token: "space the"
    function spoken(token) {
        return token.replace(/ /g, " " + t("lab.chatbot.tok.spaceWord") + " ")
            .replace(/\n/g, " " + t("lab.chatbot.tok.newlineWord") + " ").trim();
    }

    // A token in a chip: the marks (▁ ↵) faint, the letters as they are
    function paintToken(chip, token) {
        if (chip.getAttribute("data-token") === token) return;
        chip.setAttribute("data-token", token);
        chip.textContent = "";
        token.split(/([ \n])/).forEach(function (part) {
            if (part === " " || part === "\n") chip.appendChild(el("span", "ch-mark", shown(part)));
            else if (part) chip.appendChild(document.createTextNode(part));
        });
    }

    // A token inside a sentence, as HTML: <span class="ch-q">▁th</span>
    function tokenHTML(token) {
        return '<span class="ch-q">' + A.escapeHTML(shown(token)) + "</span>";
    }

    /* =========================================================
       3. TOKENS: BYTE-PAIR ENCODING
       ========================================================= */
    // The words of a text, each with the space in front of it: "I like it" ->
    // [" I", " like", " it"]. A space is added before the first word too (SentencePiece
    // does the same), so every word starts alike. Joining the words gives " " + text.
    function splitWords(text) {
        return text ? (" " + text).split(/(?= )/) : [];
    }

    // Glues every a that stands right before a b into one piece ab (left to right)
    function glue(parts, a, b) {
        const out = [];
        for (let i = 0; i < parts.length; i++) {
            if (i < parts.length - 1 && parts[i] === a && parts[i + 1] === b) {
                out.push(a + b);
                i += 1;
            } else {
                out.push(parts[i]);
            }
        }
        return out;
    }

    // A tokenizer that learns from a text. At first every character is a token. Each merge
    // counts every pair of neighbouring tokens in all the words, and glues the most common
    // pair into a new, longer token (a tie goes to the pair seen first). That is byte-pair
    // encoding (Sennrich et al., 2016), here on characters instead of bytes.
    //   model.base       the characters, in the order they first appear
    //   model.merges[i]  { a, b, count, token, id }: merge i + 1
    //   model.vocab      token -> its number (the characters first, then the new tokens)
    //   model.sizes[m]   how many tokens the vocabulary has after m merges
    //   model.learn(ms)  learns merges for about ms milliseconds (Infinity: all of them)
    function tokenizer(text, maxMerges) {
        const counts = new Map();
        splitWords(text).forEach(function (word) { counts.set(word, (counts.get(word) || 0) + 1); });
        const words = [];
        counts.forEach(function (count, word) { words.push({ parts: Array.from(word), count: count }); });
        const model = { base: [], vocab: new Map(), merges: [], ranks: new Map(), sizes: [], done: false };
        words.forEach(function (word) {
            word.parts.forEach(function (ch) {
                if (model.vocab.has(ch)) return;
                model.vocab.set(ch, model.vocab.size);
                model.base.push(ch);
            });
        });
        model.sizes.push(model.vocab.size);

        function learnOne() {
            const pairs = new Map();            // "a\u0000b" -> { a, b, count }, in the order first seen
            words.forEach(function (word) {
                for (let i = 0; i < word.parts.length - 1; i++) {
                    const key = word.parts[i] + "\u0000" + word.parts[i + 1];
                    const pair = pairs.get(key);
                    if (pair) pair.count += word.count;
                    else pairs.set(key, { a: word.parts[i], b: word.parts[i + 1], count: word.count });
                }
            });
            let best = null;
            pairs.forEach(function (pair) {
                if (!best || pair.count > best.count) best = pair;
            });
            if (!best) return false;            // every word is one token already
            best.token = best.a + best.b;
            if (!model.vocab.has(best.token)) model.vocab.set(best.token, model.vocab.size);
            best.id = model.vocab.get(best.token);
            if (!model.ranks.has(best.a)) model.ranks.set(best.a, new Map());
            if (!model.ranks.get(best.a).has(best.b)) model.ranks.get(best.a).set(best.b, model.merges.length);
            model.merges.push(best);
            model.sizes.push(model.vocab.size);
            words.forEach(function (word) {
                if (word.parts.indexOf(best.a) !== -1) word.parts = glue(word.parts, best.a, best.b);
            });
            return true;
        }

        model.learn = function (ms) {
            const started = performance.now();
            while (!model.done) {
                if (model.merges.length >= maxMerges || !learnOne()) model.done = true;
                else if (performance.now() - started >= ms) break;
            }
            return model.done;
        };
        return model;
    }

    // Cuts a text into tokens with the first `limit` merges: in each word, the pair that
    // was learned first is glued, again and again, until no learned pair is left.
    // Joining the tokens always gives back " " + text.
    function encode(model, text, limit) {
        const tokens = [];
        splitWords(text).forEach(function (word) {
            let parts = Array.from(word);
            while (parts.length > 1) {
                let best = -1;
                let bestRank = limit;
                for (let i = 0; i < parts.length - 1; i++) {
                    const next = model.ranks.get(parts[i]);
                    const rank = next ? next.get(parts[i + 1]) : undefined;
                    if (rank !== undefined && rank < bestRank) {
                        bestRank = rank;
                        best = i;
                    }
                }
                if (best === -1) break;
                parts = glue(parts, parts[best], parts[best + 1]);
            }
            parts.forEach(function (part) { tokens.push(part); });
        });
        return tokens;
    }

    // A token's number in the vocabulary, or -1 for a character the tokenizer never saw
    function tokenId(model, token) {
        return model.vocab.has(token) ? model.vocab.get(token) : -1;
    }

    // The trained tokenizers stay for the whole visit: training each takes a moment
    const tokenizers = {};

    function tokenizerFor(choice, data) {
        if (!tokenizers[choice]) {
            const text = choice === "both" ? data.corpus.en.join(" ") + " " + data.corpus.ru.join(" ") : data.corpus[choice].join(" ");
            tokenizers[choice] = tokenizer(text, MAX_MERGES);
        }
        return tokenizers[choice];
    }

    /* =========================================================
       9. VIEW 1: TOKENS
       ========================================================= */
    function tokensView(app) {
        const data = app.data;
        const root = el("div", "ch-view");
        const ui = kit.layout(root, { side: true });
        let choice = START_CHOICE;
        let model = tokenizerFor(choice, data);
        let merges = 0;                       // merges asked for (the slider)
        let shownMerges = 0;                  // merges the tokens on screen were cut with
        let edited = app.saved.text !== null; // false: the box holds the example sentence
        let state = "ready";                  // "ready" | "running" | "paused" | "done"
        let tokens = [];                      // the tokens of the text box: { text, id }
        let active = -1;                      // the token shown in the info line
        let flash = null;                     // the token that a merge has just made
        let fairId = data.fairPairs[0].id;
        let typed = 0;                        // a frame that will cut the typed text
        let resumeTraining = false;
        let resumePlay = false;
        let sayTrained = false;               // announce the end of a training somebody chose

        // ----- Your text and its tokens -----
        const box = textBox("lab.chatbot.tok.text", "lab.chatbot.tok.textHint", edited ? app.saved.text : example(), onType);
        const input = box.input;
        const listLabel = textEl("span", "lk-label", "lab.chatbot.tok.list");
        listLabel.id = newId("list");
        const list = el("div", "ch-tokens ch-data");
        list.setAttribute("role", "listbox");
        list.setAttribute("aria-labelledby", listLabel.id);
        list.tabIndex = 0;
        const chips = [];                     // the chip elements, used again and again
        const info = el("p", "ch-tok-info");
        const listField = el("div", "lk-field");
        listField.append(listLabel, list, info);
        const stats = {
            chars: kit.stat({ labelKey: "lab.chatbot.tok.chars", value: 0 }),
            tokens: kit.stat({ labelKey: "lab.chatbot.tok.tokens", value: 0 }),
            perToken: kit.stat({ labelKey: "lab.chatbot.tok.perToken", format: function (v) { return decimals(v, 2); } }),
            vocab: kit.stat({ labelKey: "lab.chatbot.tok.vocab", value: 0 })
        };

        // ----- Training -----
        const training = kit.segmented({
            labelKey: "lab.chatbot.tok.training",
            options: CHOICES.map(function (value) { return { value: value, labelKey: "lab.chatbot.tok." + value }; }),
            value: choice,
            onChange: setChoice
        });
        const progress = progressBar("lab.chatbot.tok.learning");
        const slider = kit.slider({
            labelKey: "lab.chatbot.tok.merges", min: 0, max: MAX_MERGES, step: 1, value: 0,
            hintKey: "lab.chatbot.tok.mergesHint",
            format: function (n) { return t("lab.chatbot.tok.mergesValue", { n: kit.number(n), max: kit.number(MAX_MERGES) }); },
            onInput: function (value) {
                playLoop.stop();
                merges = value;
                setState(merges === 0 ? "ready" : merges >= MAX_MERGES ? "done" : "paused");
                update();
            }
        });
        const playButton = kit.button("lab.kit.play", { icon: "play", variant: "primary", onClick: togglePlay });
        const stepButton = kit.button("lab.chatbot.tok.learnOne", { icon: "step", onClick: stepOnce });
        const status = kit.status("ready");
        const mergeLine = el("p", "ch-merge-line");

        // ----- Fair for every language? -----
        const fairChips = kit.chips({
            labelKey: "lab.chatbot.tok.pair",
            options: data.fairPairs.map(function (pair) { return { value: pair.id, labelKey: "lab.chatbot.tok.pair." + pair.id }; }),
            value: fairId,
            onChange: function (id) {
                fairId = id;
                update();
            }
        });
        const fairBars = kit.bars(null, { format: function (n) { return A.plural("lab.chatbot.tok.tokenCount", n); } });
        const fairRows = { en: el("div", "ch-fair-tokens ch-data"), ru: el("div", "ch-fair-tokens ch-data") };
        fairRows.en.setAttribute("aria-hidden", "true");      // the bars above say the same in words
        fairRows.ru.setAttribute("aria-hidden", "true");
        const verdict = el("p", "ch-verdict");
        const fair = panel("lab.chatbot.tok.fair", [fairChips, fairBars, fairRows.en, fairRows.ru, verdict,
            textEl("p", "ch-small", "lab.chatbot.tok.fairWhy")]);

        // ----- The training text -----
        const corpusToggle = kit.toggle({ labelKey: "lab.chatbot.tok.showCorpus", onChange: paintCorpus });
        const corpusTitle = textEl("h4", "ch-title", "lab.chatbot.tok.corpus");
        corpusTitle.id = newId("corpus");
        const corpusText = el("div", "ch-corpus-text ch-data");
        const corpus = el("section", "ch-corpus");
        corpus.setAttribute("aria-labelledby", corpusTitle.id);
        corpus.tabIndex = 0;                  // it scrolls: the keyboard must reach it
        corpus.hidden = true;
        corpus.append(corpusTitle, corpusText);

        const explain = kit.explain({ steps: [
            { key: "lab.chatbot.tok.step1" }, { key: "lab.chatbot.tok.step2" }, { key: "lab.chatbot.tok.step3" },
            { key: "lab.chatbot.tok.step4" }, { key: "lab.chatbot.tok.whole" }
        ] });

        ui.main.append(box.element, listField, kit.row([stats.chars, stats.tokens, stats.perToken, stats.vocab], { grid: true }));
        ui.side.append(training.element, progress.element, slider.element, kit.toolbar([playButton, stepButton, status]), mergeLine);
        ui.bottom.append(fair, corpusToggle.element, corpus, ideaLine("lab.chatbot.tok.ideaLine", "token", "lab.chatbot.tok.term"), explain.element);

        // ----- Learning, a few merges per frame -----
        const trainLoop = kit.loop({
            rate: Infinity,
            budget: TRAIN_BUDGET,
            update: function () {
                if (model.learn(TRAIN_BUDGET)) trainLoop.stop();
            },
            draw: function () {
                if (model.done && sayTrained) app.ctx.announce(t("lab.chatbot.tok.trained", { n: kit.number(model.merges.length) }));
                if (model.done) sayTrained = false;
                // The tokens on screen wait for merges that weren't learned yet
                if (model.done || merges > shownMerges) update();
                else paintProgress();
            }
        });

        // ----- "Play": one more merge, PLAY_SPEED times a second -----
        const playLoop = kit.loop({
            rate: PLAY_SPEED,
            update: function () {
                if (merges < MAX_MERGES && merges < model.merges.length) {
                    merges += 1;
                    flash = model.merges[merges - 1].token;
                }
            },
            draw: function (step) {
                if (merges >= MAX_MERGES) {
                    playLoop.stop();
                    setState("done");
                }
                if (step.steps) {
                    slider.set(merges);
                    update();
                }
            }
        });

        function example() {
            return data.sampleText[A.lang] || data.sampleText.en;
        }

        function setChoice(value) {
            choice = value;
            model = tokenizerFor(choice, data);
            sayTrained = !model.done;
            if (!model.done) trainLoop.start();
            paintCorpus();
            update();
        }

        function setState(next) {
            state = next;
            status.set(next);
            playButton.setLabel(next === "running" ? "lab.kit.pause" : "lab.kit.play");
            playButton.setIcon(next === "running" ? "pause" : "play");
            // A disabled button drops the keyboard focus: hand it to Play (which starts again)
            if (next === "done" && document.activeElement === stepButton.element) playButton.element.focus();
            stepButton.setDisabled(next === "done");
        }

        function togglePlay() {
            if (state === "running") {
                playLoop.stop();
                setState("paused");
                return;
            }
            if (merges >= MAX_MERGES) {
                merges = 0;
                slider.set(0);
            }
            setState("running");
            playLoop.start();
            update();
        }

        function stepOnce() {
            playLoop.stop();
            if (merges < MAX_MERGES && merges < model.merges.length) {
                merges += 1;
                flash = model.merges[merges - 1].token;
                slider.set(merges);
            }
            setState(merges >= MAX_MERGES ? "done" : merges === 0 ? "ready" : "paused");
            update();
            app.ctx.announce(plain(mergeText(Math.min(merges, model.merges.length))));
        }

        // The typed text is cut again at most once per frame
        function onType() {
            edited = true;
            if (!typed) typed = requestAnimationFrame(retype);
        }

        function retype() {
            typed = 0;
            update();
            app.save({ text: input.value });
        }

        function stopWork() {
            if (typed) {
                cancelAnimationFrame(typed);
                retype();
            }
            trainLoop.stop();
            if (playLoop.running()) {
                playLoop.stop();
                setState("paused");
            }
        }

        // "Merge 12: ▁t + h appeared 87 times → new token ▁th"
        function mergeText(m) {
            const merge = model.merges[m - 1];
            if (!merge) return t("lab.chatbot.tok.mergeNone");
            return t("lab.chatbot.tok.merge", {
                n: kit.number(m), a: tokenHTML(merge.a), b: tokenHTML(merge.b),
                times: A.plural("lab.chatbot.tok.times", merge.count), token: tokenHTML(merge.token)
            });
        }

        // ----- The tokens: chips in a list box (Tab reaches it, the arrow keys move) -----
        function paintChips() {
            while (chips.length < tokens.length) {
                const chip = el("span", "ch-tok");
                chip.id = newId("tok");
                chip.setAttribute("role", "option");
                chip.setAttribute("data-i", String(chips.length));
                chips.push(chip);
            }
            tokens.forEach(function (token, i) {
                const chip = chips[i];
                if (chip.parentNode !== list) list.appendChild(chip);
                paintToken(chip, token.text);
                chip.className = "ch-tok ch-c" + (i % CHIP_COLORS) + (token.id < 0 ? " ch-tok-unknown" : "")
                    + (flash !== null && token.text === flash ? " ch-tok-new" : "");
                chip.setAttribute("aria-selected", String(i === active));
                chip.setAttribute("aria-label", token.id < 0
                    ? t("lab.chatbot.tok.chipUnknown", { token: spoken(token.text) })
                    : t("lab.chatbot.tok.chip", { token: spoken(token.text), id: String(token.id) }));
            });
            for (let i = tokens.length; i < chips.length; i++) {
                if (chips[i].parentNode) chips[i].remove();
            }
        }

        function showInfo(index) {
            if (chips[active]) chips[active].setAttribute("aria-selected", "false");
            active = index >= 0 && index < tokens.length ? index : -1;
            if (active >= 0) {
                chips[active].setAttribute("aria-selected", "true");
                list.setAttribute("aria-activedescendant", chips[active].id);
            } else {
                list.removeAttribute("aria-activedescendant");
            }
            const token = tokens[active];
            if (!tokens.length) write(info, t("lab.chatbot.tok.empty"));
            else if (!token) write(info, t("lab.chatbot.tok.infoIdle"));
            else if (token.id < 0) write(info, tx("lab.chatbot.tok.infoUnknown", { token: shown(token.text) }));
            else write(info, tx("lab.chatbot.tok.info", { token: shown(token.text), id: String(token.id) }));
        }

        function chipIndex(target) {
            const chip = target && target.closest ? target.closest(".ch-tok") : null;
            return chip && chip.parentNode === list ? Number(chip.getAttribute("data-i")) : -1;
        }

        list.addEventListener("pointerover", function (event) {
            const index = chipIndex(event.target);
            if (index !== -1) showInfo(index);
        });
        list.addEventListener("pointerleave", function () {
            if (document.activeElement !== list) showInfo(-1);
        });
        list.addEventListener("click", function (event) { showInfo(chipIndex(event.target)); });
        list.addEventListener("focus", function () {
            if (active === -1 && tokens.length) showInfo(0);
        });
        list.addEventListener("keydown", function (event) {
            const last = tokens.length - 1;
            let next = -1;
            if (event.key === "ArrowRight" || event.key === "ArrowDown") next = Math.min(last, active + 1);
            else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = Math.max(0, active - 1);
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = last;
            if (next === -1 || last === -1) return;
            event.preventDefault();
            showInfo(next);
            chips[next].scrollIntoView({ block: "nearest" });
        });

        // A row of small chips (the sentences of "Fair for every language?")
        function miniChips(row, list) {
            row.textContent = "";
            list.forEach(function (token, i) {
                const chip = el("span", "ch-tok ch-tok-mini ch-c" + (i % CHIP_COLORS) + (tokenId(model, token) < 0 ? " ch-tok-unknown" : ""));
                paintToken(chip, token);
                row.appendChild(chip);
            });
        }

        function paintFair(m) {
            const pair = data.fairPairs.filter(function (p) { return p.id === fairId; })[0];
            const en = encode(model, pair.en, m);
            const ru = encode(model, pair.ru, m);
            fairBars.update([
                { labelKey: "lab.chatbot.tok.english", value: en.length, colorIndex: 0 },
                { labelKey: "lab.chatbot.tok.russian", value: ru.length, colorIndex: 1 }
            ]);
            miniChips(fairRows.en, en);
            miniChips(fairRows.ru, ru);
            if (ru.length > en.length) write(verdict, tx("lab.chatbot.tok.verdictMore", { ratio: decimals(ru.length / en.length, 1) }));
            else write(verdict, t(ru.length < en.length ? "lab.chatbot.tok.verdictFewer" : "lab.chatbot.tok.verdictSame"));
            return ru.length < en.length;
        }

        function paintCorpus() {
            corpus.hidden = !corpusToggle.checked();
            if (corpus.hidden) return;
            const paragraphs = choice === "both" ? data.corpus.en.concat(data.corpus.ru) : data.corpus[choice];
            if (corpusText.getAttribute("data-choice") === choice) return;
            corpusText.setAttribute("data-choice", choice);
            corpusText.textContent = "";
            paragraphs.forEach(function (text) { corpusText.appendChild(el("p", "", text)); });
        }

        function paintProgress() {
            progress.element.hidden = model.done;
            progress.set(model.merges.length / MAX_MERGES);
        }

        // Everything on screen follows the numbers
        function update() {
            const m = Math.min(merges, model.merges.length);
            shownMerges = m;
            const text = input.value;
            tokens = encode(model, text, m).map(function (token) { return { text: token, id: tokenId(model, token) }; });
            if (active >= tokens.length) active = -1;
            paintChips();
            showInfo(active);
            flash = null;

            const chars = Array.from(text).length;
            const perToken = tokens.length ? chars / tokens.length : 0;
            stats.chars.set(chars);
            stats.tokens.set(tokens.length);
            stats.perToken.set(tokens.length ? perToken : null);
            stats.vocab.set(model.sizes[m]);
            write(mergeLine, mergeText(m));
            paintProgress();
            const ruFewer = paintFair(m);

            // What's happening? Step 2 shows the pair that would be glued next
            const next = model.merges[m];
            const pair = next || model.merges[m - 1];
            explain.setValues(0, { base: model.base.length });
            if (pair) explain.setValues(1, { a: shown(pair.a), b: shown(pair.b), times: A.plural("lab.chatbot.tok.times", pair.count) });
            explain.setValues(2, { merges: m, chars: chars, tokens: tokens.length, perToken: decimals(perToken, 2) });
            const ids = tokens.slice(0, IDS_SHOWN).map(function (token) { return token.id < 0 ? "?" : String(token.id); });
            explain.setValues(3, { ids: ids.length ? ids.join(", ") + (tokens.length > IDS_SHOWN ? ", …" : "") : "—" });
            explain.setStep(state === "ready" ? 0 : state === "running" ? 1 : 2);
            if (m >= MAX_MERGES) explain.setText("lab.chatbot.tok.step2Done", { merges: m });
            else if (next && next.count === 1) explain.setText("lab.chatbot.tok.step2Once", { a: shown(next.a), b: shown(next.b) });
            else explain.setText(null);

            app.challenges.check({ ruFewer: ruFewer });
        }

        return {
            element: root,
            show: function () {
                root.hidden = false;
                if (!model.done) trainLoop.start();
                update();
            },
            hide: function () {
                stopWork();
                root.hidden = true;
            },
            pause: function () {
                resumeTraining = trainLoop.running();
                resumePlay = playLoop.running();
                trainLoop.stop();
                playLoop.stop();
                if (typed) {
                    cancelAnimationFrame(typed);
                    retype();
                }
            },
            resume: function () {
                if (resumeTraining) trainLoop.start();
                if (resumePlay && state === "running") playLoop.start();
                resumeTraining = false;
                resumePlay = false;
            },
            language: function () {
                if (!edited) input.value = example();
                update();
            },
            theme: function () {},
            destroy: function () {
                trainLoop.stop();
                playLoop.stop();
                if (typed) cancelAnimationFrame(typed);
                typed = 0;
            }
        };
    }

    /* =========================================================
       13. THE EXPERIMENT
       ========================================================= */
    // The icons of the pipeline strip (24 x 24, currentColor, like the kit's)
    function icon(paths) {
        return '<svg class="lk-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' + paths + "</svg>";
    }

    const ICONS = {
        text: icon('<path d="M5 6.5h14M5 11h14M5 15.5h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
        tokens: icon('<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="8" width="6" height="8" rx="2"/><rect x="10.5" y="8" width="4.5" height="8" rx="2"/><rect x="17" y="8" width="4.5" height="8" rx="2"/></g>'),
        meaning: icon('<g fill="currentColor"><circle cx="6.5" cy="8" r="2.2"/><circle cx="16" cy="6" r="2.2"/><circle cx="11" cy="16.5" r="2.2"/><circle cx="18.5" cy="15" r="1.6"/></g>'),
        context: icon('<path d="M6 15.5C6 7 18 7 18 15.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="6" cy="17.5" r="2.2" fill="currentColor"/><circle cx="18" cy="17.5" r="2.2" fill="currentColor"/>'),
        next: "dice"
    };

    const BUILDERS = { tokens: tokensView };

    // Saved settings can be old, broken or edited by hand: everything is checked
    function savedIsGood(value, dims) {
        return value.v === SAVE_VERSION && VIEWS.indexOf(value.view) !== -1
            && (value.text === null || (typeof value.text === "string" && value.text.length <= TEXT_LIMIT))
            && (value.word === null || (Array.isArray(value.word) && value.word.length === dims && value.word.every(function (x) {
                return typeof x === "number" && x >= 0 && x <= 1;
            })));
    }

    A.lab.define("chatbot", {
        // The maths, for dev/tests/chatbot.math.js (the hub doesn't use it)
        maths: {
            splitWords: splitWords, tokenizer: tokenizer, encode: encode
        },

        create: function (stage, ctx) {
            const data = A.content.get("lab.chatbot");
            const saved = ctx.store.get("settings", null, function (value) { return savedIsGood(value, data.dims.length); })
                || { v: SAVE_VERSION, view: VIEWS[0], text: null, word: null };
            const app = {
                ctx: ctx,
                data: data,
                saved: saved,
                challenges: null,
                save: function (changes) {
                    Object.assign(saved, changes);
                    ctx.store.set("settings", saved);
                }
            };
            const views = {};
            let current = null;

            // ----- The pipeline strip: Text → Tokens → Meaning → Context → Next word -----
            const ui = kit.layout(stage);
            const pipe = el("div", "ch-pipe");
            const start = el("span", "ch-pipe-start");
            start.innerHTML = ICONS.text;
            start.appendChild(textEl("span", "", "lab.chatbot.pipeStart"));
            const steps = kit.segmented({
                labelKey: "lab.chatbot.pipe",
                hideLabel: true,
                options: VIEWS.filter(function (name) { return BUILDERS[name]; }).map(function (name) {
                    return { value: name, labelKey: "lab.chatbot.view." + name, icon: ICONS[name] };
                }),
                value: BUILDERS[saved.view] ? saved.view : VIEWS[0],
                onChange: function (name) {
                    show(name);
                    app.save({ view: name });
                }
            });
            pipe.append(start, steps.element);
            const stageLine = el("p", "ch-stage-line");
            ui.top.append(pipe, stageLine);

            app.challenges = kit.challenges({ ctx: ctx, items: [
                { key: "lab.chatbot.ch1", insightKey: "lab.chatbot.ch1Why", check: function (info) { return info.ruFewer; } },
                { key: "lab.chatbot.ch2", insightKey: "lab.chatbot.ch2Why", check: function (info) { return info.robot; } },
                { key: "lab.chatbot.ch3", insightKey: "lab.chatbot.ch3Why", check: function (info) { return info.itRobot; } },
                { key: "lab.chatbot.ch4", insightKey: "lab.chatbot.ch4Why", check: function (info) { return info.boringSilly; } }
            ] });
            ui.bottom.appendChild(app.challenges.element);

            // The views are built the first time they are shown, and keep their state
            function show(name) {
                if (current) views[current].hide();
                current = name;
                if (!views[name]) {
                    views[name] = BUILDERS[name](app);
                    ui.main.appendChild(views[name].element);
                }
                setKey(stageLine, "lab.chatbot.stage." + name);
                views[name].show();
            }

            function each(method) {
                Object.keys(views).forEach(function (name) { views[name][method](); });
            }

            show(steps.value());

            // ----- The controller: the hub calls these -----
            return {
                pause: function () { each("pause"); },
                resume: function () { views[current].resume(); },
                language: function () {
                    kit.relabel(stage);
                    each("language");
                },
                theme: function () {
                    kit.colors.invalidate();
                    each("theme");
                },
                destroy: function () { each("destroy"); }
            };
        }
    });
})();
