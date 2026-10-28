/* =========================================================
   AI COMPASS — AI LAB EXPERIMENT: THE NEXT-WORD PREDICTOR
   A tiny language model, built from scratch: it counts which words
   follow which in a small collection of sentences, then guesses the
   next word of your text, just like a (very) mini chatbot. You can
   let it write by itself, turn its creativity (the temperature) up
   or down, and teach it sentences of your own.

   The lab hub (js/lab.js) loads this file when the experiment opens,
   after the lab kit and js/content/lab/predictor.js (every text, in
   English and Russian, and the sentences it learns from). The file
   registers the experiment with AICompass.lab.define("predictor",
   { create }) (the last section). create(stage, hub) builds it in the
   hub's stage and returns its controller; the hub then calls pause()
   and resume() (off screen, hidden browser tab), language(), theme()
   and destroy().

   Between two openings (on the same visit) it keeps your text. Saved:
   the creativity as "lab.temperature", your sentences as
   "lab.taught.en" and "lab.taught.ru". Progress events (through the
   hub): "lab.use" when auto-write starts, "lab.milestone"
   { kind: "taught", sentences } when you teach it a sentence.

   Sections of this file:
    1. Settings                   4. The maths
    2. Small helpers              5. The panel
    3. The experiment's HTML      6. Opening and closing: AICompass.lab.define
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const data = A && A.content.get("lab.predictor");     // the sentences it learns from (js/content/lab/predictor.js)
    if (!A || !A.lab || !A.lab.define || !data) return;

    const t = A.t;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
    const DISCOUNT = 0.3;                 // how much of every count is set aside for words never seen there
    const CANDIDATES = 5;                 // rows of candidate words
    const CHOICES = 20;                   // the most likely words that take part in the draw (creativity, auto-write)
    const MATCH_LIMIT = 400;              // "finishing the word": at most this many words that start with your letters
    const MAX_TEXT = 400;                 // characters in the text box, at most
    const MAX_TOKENS = 40;                // the token view shows the last 40 words
    const MAX_TAUGHT = 50;                // sentences you can teach (in each language)
    const MAX_TEACH = 140;                // characters in a sentence you teach, at most
    const TEMPERATURE = { min: 0, max: 2, step: 0.1, start: 0.7 };   // the creativity slider (yours is saved as "lab.temperature")
    const AUTO_WORDS = 12;                // auto-write adds up to 12 words...
    const AUTO_STOP = MAX_TEXT - 40;      // ...and stops early when the text is this long
    const AUTO_PAUSE = { pick: 260, next: 160 };        // ms: the chosen word lights up, then the next word is chosen
    const AUTO_PAUSE_CALM = { pick: 200, next: 120 };   // the same with animations off (the words appear at once)
    const LETTER_MS = 30;                 // auto-write types a letter every 30 ms...
    const LETTER_RANDOM = 25;             // ...plus up to 25 ms at random, like a person
    const SR_PAUSE = 900;                 // ms: screen readers hear the top guess after this pause in typing

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */
    // The experiment's own element (".lab-lm", made by create()): everything it
    // touches is inside it. null while the experiment is closed.
    let root = null;

    // Shortcuts to elements inside the experiment
    function $(selector) {
        return root.querySelector(selector);
    }

    function $$(selector) {
        return Array.prototype.slice.call(root.querySelectorAll(selector));
    }

    // The filled part of a slider: .ui-range (css/components.css) colours the line from the start up to --fill
    function updateRangeFill(range) {
        const min = Number(range.min);
        const max = Number(range.max);
        range.style.setProperty("--fill", (((Number(range.value) - min) / (max - min)) * 100).toFixed(1) + "%");
    }

    // A word in quotes, the way the language writes them: “word” or «слово»
    function quote(word) {
        return t("lab.q", { w: word });
    }

    /* =========================================================
       3. THE EXPERIMENT'S HTML
       ========================================================= */
    // Small pictures for the buttons
    const icons = {
        sparkle: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z" fill="currentColor"/><circle cx="19" cy="19" r="1.6" fill="currentColor"/></svg>',
        stop: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>',
        close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
    };

    // The whole experiment. create() puts it in the hub's stage, and its empty
    // data-i18n holders get their texts at that moment.
    function predictorHTML() {
        const starters = [1, 2, 3, 4, 5].map((n) =>
            '<button type="button" class="chip lab-starter" data-starter="' + n + '" data-i18n="lab.lmStarter' + n + '"></button>').join("");

        const candidates = Array.from({ length: CANDIDATES }, (item, i) =>
            '<li class="lab-cand-item" hidden>' +
                '<button type="button" class="lab-cand" data-index="' + i + '">' +
                    '<span class="lab-cand-fill" aria-hidden="true"></span>' +
                    '<span class="lab-cand-pick" aria-hidden="true"></span>' +
                    '<span class="lab-cand-rank mono" aria-hidden="true">' + (i + 1) + '</span>' +
                    '<span class="lab-cand-word"></span>' +
                    '<span class="lab-cand-pct mono"></span>' +
                '</button>' +
            '</li>').join("");

        const steps = [1, 2, 3].map((n) =>
            '<li class="lab-step-card">' +
                '<span class="lab-step-num mono" aria-hidden="true">0' + n + '</span>' +
                '<h4 data-i18n="lab.lmExplain' + n + 'Title"></h4>' +
                '<p data-i18n="lab.lmExplain' + n + 'Text"></p>' +
            '</li>').join("");

        const stats = ["sentences", "words", "pairs", "triples"].map((name) =>
            '<div class="lab-lm-stat"><strong class="mono gradient-text" data-lmstat="' + name + '">0</strong><span data-lmstat-label="' + name + '"></span></div>').join("");

        return '<div class="lab-lm">' +
            '<div class="lab-lm-main">' +
                '<label class="lab-lm-label" for="lab-lm-input" data-i18n="lab.lmPromptLabel"></label>' +
                '<div class="lab-lm-field">' +
                    '<textarea id="lab-lm-input" class="lab-lm-input" rows="3" maxlength="' + MAX_TEXT + '" spellcheck="false" autocomplete="off" autocapitalize="sentences" data-i18n-attr="placeholder:lab.lmPlaceholder"></textarea>' +
                    '<button type="button" class="lab-lm-clear" data-i18n-attr="aria-label:lab.lmClear,title:lab.lmClear">' + icons.close + '</button>' +
                '</div>' +
                '<div class="lab-starters" role="group" aria-labelledby="lab-starters-title">' +
                    '<span class="lab-mini-label mono" id="lab-starters-title" data-i18n="lab.lmStarters"></span>' +
                    starters +
                '</div>' +
                '<p class="lab-lm-notice" hidden><span data-i18n="lab.lmUnknown"></span></p>' +
                '<div class="lab-box lab-predict">' +
                    '<div class="lab-box-head">' +
                        '<span class="lab-mini-label mono" data-lm="mode"></span>' +
                    '</div>' +
                    '<p class="lab-lm-context" data-lm="context"></p>' +
                    '<ol class="lab-cands">' + candidates + '</ol>' +
                    '<p class="lab-cands-legend" data-i18n="lab.lmLegend"></p>' +
                '</div>' +
                '<div class="lab-lm-controls">' +
                    '<button type="button" class="btn btn-primary lab-auto" data-action="auto" aria-describedby="lab-auto-hint">' +
                        '<span class="lab-auto-icon"></span><span class="lab-auto-text"></span>' +
                    '</button>' +
                    '<span class="sr-only" id="lab-auto-hint"></span>' +
                    '<div class="lab-temp">' +
                        '<div class="lab-range-head">' +
                            '<label for="lab-temp" data-i18n="lab.lmTemp"></label>' +
                            '<output class="lab-range-value mono" for="lab-temp" data-out="temp"></output>' +
                        '</div>' +
                        '<input type="range" id="lab-temp" class="lab-range lab-range-temp ui-range" min="' + TEMPERATURE.min + '" max="' + TEMPERATURE.max + '" step="' + TEMPERATURE.step + '" value="' + TEMPERATURE.start + '">' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="lab-lm-side">' +
                '<section class="lab-box lab-tokens-box" aria-labelledby="lab-tokens-title">' +
                    '<div class="lab-box-head"><h3 class="lab-mini-label mono" id="lab-tokens-title" data-i18n="lab.lmTokensTitle"></h3></div>' +
                    '<div class="lab-tokens" data-lm="tokens"></div>' +
                    '<p class="lab-box-note" data-i18n="lab.lmTokensHint"></p>' +
                '</section>' +
                '<section class="lab-box" aria-labelledby="lab-knows-title">' +
                    '<div class="lab-box-head"><h3 class="lab-mini-label mono" id="lab-knows-title" data-i18n="lab.lmStatsTitle"></h3></div>' +
                    '<div class="lab-lm-stats">' + stats + '</div>' +
                '</section>' +
                '<section class="lab-box" aria-labelledby="lab-teach-title">' +
                    '<div class="lab-box-head"><h3 class="lab-mini-label mono" id="lab-teach-title" data-i18n="lab.lmTeachTitle"></h3></div>' +
                    '<form class="lab-teach" novalidate>' +
                        '<label class="sr-only" for="lab-teach-input" data-i18n="lab.lmTeachLabel"></label>' +
                        '<input type="text" id="lab-teach-input" class="lab-teach-input" maxlength="' + MAX_TEACH + '" autocomplete="off" aria-describedby="lab-teach-status" data-i18n-attr="placeholder:lab.lmTeachPlaceholder">' +
                        '<button type="submit" class="btn btn-ghost btn-small lab-teach-btn" data-i18n="lab.lmTeachButton"></button>' +
                    '</form>' +
                    '<p class="lab-teach-status" id="lab-teach-status" aria-live="polite"></p>' +
                    '<button type="button" class="lab-link-btn" data-action="forget" hidden data-i18n="lab.lmTeachForget"></button>' +
                '</section>' +
            '</div>' +

            '<section class="lab-explain" aria-labelledby="lab-explain-lm">' +
                '<h3 class="lab-explain-title" id="lab-explain-lm"><span class="lab-explain-icon" aria-hidden="true">?</span><span data-i18n="lab.lmExplainTitle"></span></h3>' +
                '<ol class="lab-steps lab-steps-3">' + steps + '</ol>' +
                '<div class="lab-real">' +
                    '<span class="lab-real-icon" aria-hidden="true">🤖</span>' +
                    '<div><h4 data-i18n="lab.lmRealTitle"></h4><p data-i18n="lab.lmRealText"></p></div>' +
                '</div>' +
            '</section>' +
            '<p class="sr-only" aria-live="polite" data-live="lm"></p>' +
        '</div>';
    }
    /* =========================================================
       4. THE MATHS
       A word-level "n-gram" language model. "Training" it is counting:
       which word follows each word (pairs, "bigrams") and each two words
       (triples, "trigrams") in the example sentences.
       To guess the next word it looks at the last two words of the text:
       - every word seen after them gets (its count - DISCOUNT) / (all counts);
       - the share the discounts set aside goes to all the other words, in
         proportion to their chance after only the last word ("backoff"),
         which in turn backs off to how common each word is overall.
       So every word the model knows has a chance above 0, and the chances
       add up to 1. The temperature then decides how adventurous the pick is.
       ========================================================= */
    // The sentences it learns from (both languages) are in js/content/lab/predictor.js
    const CORPUS = data.corpus;

    // Every sentence is read as START START word word ... END,
    // so the model also learns how sentences begin and end
    const START = "<s>";
    const END = "</s>";
    const WORD_RE = /[\p{L}\p{N}'’-]+/gu;        // a word: letters of any alphabet, digits, ' and -
    const WORD_END = /[\p{L}\p{N}'’-]+$/u;       // the same kind of word, at the very end of a text
    const HAS_LETTER = /[\p{L}\p{N}]/u;          // ("-" or "'" alone is not a word)

    // Splits text into words (keeps letters of every alphabet, digits, ' and -)
    function wordsOf(text) {
        return (String(text).match(WORD_RE) || []).filter((word) => HAS_LETTER.test(word));
    }

    // Does the text end in the middle of a word (a word still being typed)?
    // "I like piz" and "AI-" do; "I like pizza ", "pizza." and "pizza 🍕" do not.
    function endsMidWord(text) {
        const tail = text.match(WORD_END);
        return Boolean(tail) && HAS_LETTER.test(tail[0]);
    }

    // Counts that "word" came after "key" (one word, or two words joined by a space)
    function addCount(map, key, word) {
        let context = map.get(key);
        if (!context) {
            context = { total: 0, counts: new Map() };
            map.set(key, context);
        }
        context.total++;
        context.counts.set(word, (context.counts.get(word) || 0) + 1);
    }

    // "Training" this model = counting. It also remembers how each word is usually
    // written ("AI", "Friday"), and counts the different pairs and triples it saw
    // (the "What it knows" box).
    function buildModel(sentences) {
        const unigrams = new Map();
        const bigrams = new Map();
        const trigrams = new Map();
        const casing = new Map();
        const pairs = new Set();
        const triples = new Set();
        let total = 0;
        let sentenceCount = 0;

        sentences.forEach((sentence) => {
            const original = wordsOf(sentence);
            if (!original.length) return;
            sentenceCount++;
            const lower = original.map((word) => word.toLowerCase());

            // Remember how words are written in the middle of a sentence ("AI", "I", "Friday")
            original.forEach((word, i) => {
                if (i === 0) return;
                let forms = casing.get(lower[i]);
                if (!forms) casing.set(lower[i], forms = new Map());
                forms.set(word, (forms.get(word) || 0) + 1);
            });

            const tokens = [START, START].concat(lower, [END]);
            for (let i = 2; i < tokens.length; i++) {
                const word = tokens[i];
                unigrams.set(word, (unigrams.get(word) || 0) + 1);
                total++;
                addCount(bigrams, tokens[i - 1], word);
                addCount(trigrams, tokens[i - 2] + " " + tokens[i - 1], word);
                if (word !== END && tokens[i - 1] !== START) {
                    pairs.add(tokens[i - 1] + " " + word);
                    if (tokens[i - 2] !== START) triples.add(tokens[i - 2] + " " + tokens[i - 1] + " " + word);
                }
            }
        });

        const unigramDist = new Map();
        unigrams.forEach((count, word) => unigramDist.set(word, count / total));

        const bestCasing = new Map();
        casing.forEach((forms, word) => {
            let best = word;
            let bestCount = 0;
            forms.forEach((count, form) => {
                if (count > bestCount) {
                    best = form;
                    bestCount = count;
                }
            });
            bestCasing.set(word, best);
        });

        return {
            unigrams: unigrams,
            unigramDist: unigramDist,
            bigrams: bigrams,
            trigrams: trigrams,
            casing: bestCasing,
            stats: {
                sentences: sentenceCount,
                words: unigrams.size - (unigrams.has(END) ? 1 : 0),
                pairs: pairs.size,
                triples: triples.size
            }
        };
    }

    // "Backoff": words seen after this context share most of the probability;
    // a small part is left for all other words, using the shorter context.
    function backoff(context, lower) {
        if (!context) return lower;
        const result = new Map();
        let seenLowerMass = 0;
        context.counts.forEach((count, word) => {
            result.set(word, (count - DISCOUNT) / context.total);
            seenLowerMass += lower.get(word) || 0;
        });
        const leftover = (DISCOUNT * context.counts.size) / context.total;
        const unseenMass = 1 - seenLowerMass;
        if (unseenMass > 1e-9) {
            lower.forEach((p, word) => {
                if (!context.counts.has(word)) result.set(word, (leftover * p) / unseenMass);
            });
        } else {
            let sum = 0;
            result.forEach((p) => { sum += p; });
            result.forEach((p, word) => result.set(word, p / sum));
        }
        return result;
    }

    // The chance of every word after "previous" (the words so far, in lower case).
    // level: 3 = it knows the last two words together, 2 = only the last word, 1 = neither.
    function predictNext(model, previous) {
        const p1 = previous.length ? previous[previous.length - 1] : START;
        const p2 = previous.length > 1 ? previous[previous.length - 2] : START;
        const bigram = model.bigrams.get(p1);
        const trigram = model.trigrams.get(p2 + " " + p1);
        const dist = backoff(trigram, backoff(bigram, model.unigramDist));
        return {
            dist: dist,
            level: trigram ? 3 : (bigram ? 2 : 1),
            p1: p1,
            p2: p2,
            count: trigram ? trigram.total : (bigram ? bigram.total : 0),
            oneCount: bigram ? bigram.total : 0
        };
    }

    // The chance of ONE word after "previous": exactly the number predictNext() gives
    // (the same sums in the same order), without making the whole list of every word.
    // The token view needs it for every word you typed, at every key press.
    function probOf(model, previous, word) {
        const p1 = previous.length ? previous[previous.length - 1] : START;
        const p2 = previous.length > 1 ? previous[previous.length - 2] : START;
        const bigram = model.bigrams.get(p1);
        const trigram = model.trigrams.get(p2 + " " + p1);
        const unigram = (w) => model.unigramDist.get(w);
        const afterOne = (w) => backoffOne(bigram, unigram, w);
        return backoffOne(trigram, afterOne, word) || 0;
    }

    // backoff() for one word. lower(word) is the shorter context's chance of a word
    // (undefined for a word it does not have, like Map.get). Gives undefined for a word
    // that backoff() would leave out of its list.
    function backoffOne(context, lower, word) {
        if (!context) return lower(word);
        if (context.seenLowerMass === undefined) {
            // Worked out once for each context (the model is made again when it changes)
            let seenLowerMass = 0;
            let keptSum = 0;
            context.counts.forEach((count, seen) => {
                seenLowerMass += lower(seen) || 0;
                keptSum += (count - DISCOUNT) / context.total;
            });
            context.seenLowerMass = seenLowerMass;
            context.keptSum = keptSum;
        }
        const count = context.counts.get(word);
        const unseenMass = 1 - context.seenLowerMass;
        if (unseenMass > 1e-9) {
            if (count) return (count - DISCOUNT) / context.total;
            const p = lower(word);
            if (p === undefined) return undefined;
            const leftover = (DISCOUNT * context.counts.size) / context.total;
            return (leftover * p) / unseenMass;
        }
        // The rare case where the seen words already have all of the shorter list's
        // probability: backoff() keeps only them, scaled up so they add up to 1
        return count ? ((count - DISCOUNT) / context.total) / context.keptSum : undefined;
    }

    // The most likely words first (filter: only the words it accepts)
    function topWords(dist, limit, filter) {
        const list = [];
        dist.forEach((p, word) => {
            if (word !== START && (!filter || filter(word))) list.push({ word: word, p: p });
        });
        list.sort((a, b) => b.p - a.p);
        return list.slice(0, limit);
    }

    // Temperature T: every chance p becomes p^(1/T), then they are scaled to add up to 1.
    // T below 1 sharpens the list towards the top word, above 1 flattens it (more
    // surprising picks), and near 0 it always picks the top word.
    function pickChances(list, temperature) {
        if (!list.length) return [];
        if (temperature < 0.05) return list.map((item, i) => (i === 0 ? 1 : 0));
        const weights = list.map((item) => Math.pow(item.p, 1 / temperature));
        const sum = weights.reduce((a, b) => a + b, 0) || 1;
        return weights.map((weight) => weight / sum);
    }
    /* =========================================================
       5. THE PANEL
       ========================================================= */
    // ----- State of the predictor -----
    const lm = {
        lang: A.lang,            // the language of the sentences it learned
        model: null,             // the counts (buildModel)
        taught: [],              // your own sentences (saved as "lab.taught.en" and "lab.taught.ru")
        temperature: TEMPERATURE.start,
        starter: null,           // { n, text } when the text came from a starter button
        writer: null,            // the auto-write job while it runs
        shown: [],               // candidates on screen right now
        mode: "next",            // "next" word, or "complete" (finishing the word being typed)
        lastResult: null,        // the last analysis (the creativity slider uses it again)
        srTimer: 0,              // the short wait before screen readers hear the top guess
        text: "",                // the text in the box, kept while the experiment is closed...
        teachText: ""            // ...and the sentence you were writing to teach it
    };

    // The predictor's elements (findElements() finds them)
    let lmEls = null;

    let hub = null;              // what the hub gave this opening: track(), announce()... (see create)
    let paused = false;          // the hub said pause(): off screen, or the browser tab is hidden
    let languageStale = false;   // the language changed while paused: catch up in resume()

    // Your creativity setting (rounded to the slider's 0.1 steps; anything but a number gets the start value)
    const savedTemp = A.storage.get("lab.temperature", TEMPERATURE.start);
    lm.temperature = typeof savedTemp === "number" && isFinite(savedTemp) ?
        A.util.clamp(Math.round(savedTemp * 10) / 10, TEMPERATURE.min, TEMPERATURE.max) : TEMPERATURE.start;

    // The model for the current language: the example sentences plus yours
    // (a saved value that is not a list of sentences is ignored)
    function loadModel() {
        lm.lang = A.lang;
        const taught = A.storage.get("lab.taught." + lm.lang, []);
        lm.taught = Array.isArray(taught) ? taught.filter((s) => typeof s === "string").slice(0, MAX_TAUGHT) : [];
        lm.model = buildModel(CORPUS[lm.lang].concat(lm.taught));
    }

    // Looks at the text: which words come before, and is the last word finished?
    function readText(text) {
        const cut = Math.max(text.lastIndexOf("."), text.lastIndexOf("!"), text.lastIndexOf("?"), text.lastIndexOf("…"));
        const sentence = text.slice(cut + 1);
        const previous = wordsOf(sentence).map((word) => word.toLowerCase());
        let partial = "";
        if (endsMidWord(text) && previous.length) partial = previous.pop();
        return { previous: previous, partial: partial };
    }

    // How a word should be written: "ai" -> "AI", capital letter at the start of a sentence
    function displayWord(word, atStart) {
        let shown = lm.model.casing.get(word) || word;
        if (atStart) shown = shown.charAt(0).toUpperCase() + shown.slice(1);
        return shown;
    }

    // Works out the candidates for the current text
    function analyse() {
        const text = lmEls.input.value;
        const state = readText(text);
        const model = lm.model;

        // Still typing a word? Then suggest ways to finish it, like a phone keyboard
        if (state.partial) {
            const prediction = predictNext(model, state.previous);
            let sum = 0;
            const matches = topWords(prediction.dist, MATCH_LIMIT, (word) => {
                const ok = word !== END && word.startsWith(state.partial);
                if (ok) sum += prediction.dist.get(word);
                return ok;
            });
            if (matches.length) {
                matches.forEach((item) => { item.p = item.p / (sum || 1); });
                return { mode: "complete", state: state, list: matches.slice(0, CHOICES), prediction: prediction };
            }
            state.previous.push(state.partial);
            state.partial = "";
        }
        const prediction = predictNext(model, state.previous);
        return { mode: "next", state: state, list: topWords(prediction.dist, CHOICES), prediction: prediction };
    }

    function contextText(result) {
        if (result.mode === "complete") return t("lab.lmCtxComplete", { prefix: quote(result.state.partial + "…") });
        const prediction = result.prediction;
        const cased = (word) => lm.model.casing.get(word) || word;
        const p1 = cased(prediction.p1);
        const p2 = cased(prediction.p2);
        if (prediction.p1 === START) return t("lab.lmCtxStart");
        if (prediction.level === 3) {
            const n = prediction.count;
            if (prediction.p2 === START) return t("lab.lmCtxFirst", { word: quote(p1), n: n, times: A.plural("lab.pluralTimes", n) });
            return t("lab.lmCtxTri", { words: quote(p2 + " " + p1), n: n, times: A.plural("lab.pluralTimes", n) });
        }
        if (prediction.level === 2) {
            const n = prediction.oneCount;
            if (prediction.p2 === START) return t("lab.lmCtxOne", { word: quote(p1), n: n, times: A.plural("lab.pluralTimes", n) });
            return t("lab.lmCtxBi", { pair: quote(p2 + " " + p1), word: quote(p1), n: n, times: A.plural("lab.pluralTimes", n) });
        }
        return t("lab.lmCtxUni", { word: quote(prediction.p1) });
    }

    // Draws the candidate rows, the context line and the token view
    function renderPredictor() {
        if (!lm.model) return;
        const result = analyse();
        lm.mode = result.mode;
        const atStart = result.state.previous.length === 0;
        const chances = pickChances(result.list, lm.temperature);
        lm.shown = result.list.slice(0, CANDIDATES).map((item, i) => ({ word: item.word, p: item.p, chance: chances[i] }));
        lm.lastResult = result;

        lmEls.mode.textContent = t(result.mode === "complete" ? "lab.lmComplete" : "lab.lmNext");
        lmEls.context.textContent = contextText(result);

        lmEls.items.forEach((item, i) => {
            const data = lm.shown[i];
            item.hidden = !data;
            if (!data) return;
            const button = item.querySelector(".lab-cand");
            const isEnd = data.word === END;
            const shown = isEnd ? "⏎ " + t("lab.lmEnd") : displayWord(data.word, atStart);
            button.classList.toggle("is-end", isEnd);
            button.querySelector(".lab-cand-word").textContent = shown;
            button.querySelector(".lab-cand-pct").textContent = A.format.percent(data.p);
            button.querySelector(".lab-cand-fill").style.transform = "scaleX(" + Math.max(0.015, data.p).toFixed(4) + ")";
            button.querySelector(".lab-cand-pick").style.transform = "scaleX(" + (data.chance || 0).toFixed(4) + ")";
            button.setAttribute("aria-label", isEnd ?
                t("lab.lmPickEndLabel", { pct: A.format.percent(data.p) }) :
                t("lab.lmPickLabel", { word: quote(shown), pct: A.format.percent(data.p) }));
        });

        renderTokens();
        updateTempOutput();

        // Screen readers hear the top guess after a short pause in typing
        clearTimeout(lm.srTimer);
        lm.srTimer = setTimeout(() => {
            const top = lm.shown[0];
            if (!top || lm.writer) return;
            const word = top.word === END ? t("lab.lmEnd") : quote(displayWord(top.word, atStart));
            A.announce(t("lab.lmSrTop", { word: word, pct: A.format.percent(top.p) }), { region: lmEls.live });
        }, SR_PAUSE);
    }

    // Shows each word coloured by how much the model expected it
    function renderTokens() {
        const text = lmEls.input.value;
        const tokens = [];
        let unknown = 0;
        let known = 0;
        const sentences = text.split(/[.!?…]+/);
        const typingLast = endsMidWord(text);
        sentences.forEach((sentence, s) => {
            const original = wordsOf(sentence);
            const previous = [];
            original.forEach((word, i) => {
                const lower = word.toLowerCase();
                const typing = typingLast && s === sentences.length - 1 && i === original.length - 1;
                const p = lm.model.unigrams.has(lower) ? probOf(lm.model, previous, lower) : 0;
                if (!typing) {
                    if (p === 0) unknown++;
                    else known++;
                }
                tokens.push({ word: word, p: p, typing: typing });
                previous.push(lower);
            });
        });

        lmEls.notice.hidden = !(known + unknown >= 2 && unknown / (known + unknown) > 0.5);

        const box = lmEls.tokens;
        if (!tokens.length) {
            box.textContent = "";
            const empty = document.createElement("p");
            empty.className = "lab-tokens-empty";
            empty.textContent = t("lab.lmTokensEmpty");
            box.appendChild(empty);
            return;
        }
        const note = box.querySelector(".lab-tokens-empty");
        if (note) note.remove();

        // The chips already in the box are kept and only get their new word and colour.
        // New chips are added at the end: only they fade in, so nothing flickers.
        const shown = tokens.slice(-MAX_TOKENS);
        const chips = box.children;
        const added = document.createDocumentFragment();
        shown.forEach((token, i) => {
            let chip = chips[i];
            if (!chip) {
                chip = document.createElement("span");
                chip.className = "lab-tok";
                chip.appendChild(document.createElement("span"));
                const value = document.createElement("small");
                value.className = "mono";
                chip.appendChild(value);
                added.appendChild(chip);
            }
            fillChip(chip, token);
        });
        while (chips.length > shown.length) box.lastElementChild.remove();
        box.appendChild(added);
    }

    // Puts a word and its chance into a chip (only what changed is written)
    function fillChip(chip, token) {
        let value;
        let glow = "";
        if (token.typing) {
            value = "…";
        } else if (token.p === 0) {
            value = t("lab.lmTokenNew");
        } else {
            value = A.format.percent(token.p);
            // log scale: 100% -> 1, 10% -> 0.67, 1% -> 0.33, 0.1% -> 0
            glow = A.util.clamp((Math.log10(token.p) + 3) / 3, 0, 1).toFixed(3);
        }
        const word = chip.firstElementChild;
        const small = chip.lastElementChild;
        A.dom.setText(word, token.word);      // only a real change is written
        A.dom.setText(small, value);
        chip.classList.toggle("is-typing", token.typing);
        chip.classList.toggle("is-new", !token.typing && token.p === 0);
        if (chip.style.getPropertyValue("--p") !== glow) chip.style.setProperty("--p", glow);
    }

    function renderLmStats() {
        const stats = lm.model.stats;
        const labels = { sentences: "lab.pluralSentences", words: "lab.pluralWords", pairs: "lab.pluralPairs", triples: "lab.pluralTriples" };
        Object.keys(labels).forEach((name) => {
            $('[data-lmstat="' + name + '"]').textContent = A.format.number(stats[name]);
            $('[data-lmstat-label="' + name + '"]').textContent = A.plural(labels[name], stats[name]);
        });
        lmEls.teachStatus.textContent = lm.taught.length ?
            t("lab.lmTeachCount", { n: lm.taught.length }) : t("lab.lmTeachNone");
        lmEls.teachStatus.classList.remove("is-error");
        lmEls.forget.hidden = lm.taught.length === 0;
    }

    function tempWord(value) {
        if (value < 0.05) return t("lab.lmTemp0");
        if (value < 0.5) return t("lab.lmTemp1");
        if (value < 1.05) return t("lab.lmTemp2");
        if (value < 1.5) return t("lab.lmTemp3");
        return t("lab.lmTemp4");
    }

    function updateTempOutput() {
        const text = A.format.number(lm.temperature, 1) + " · " + tempWord(lm.temperature);
        lmEls.tempOut.textContent = text;
        lmEls.temp.setAttribute("aria-valuetext", text);
        updateRangeFill(lmEls.temp);
    }

    function updateAutoButton() {
        const writing = Boolean(lm.writer);
        lmEls.auto.querySelector(".lab-auto-icon").innerHTML = writing ? icons.stop : icons.sparkle;
        lmEls.auto.querySelector(".lab-auto-text").textContent = t(writing ? "lab.lmStop" : "lab.lmAuto");
        lmEls.auto.classList.toggle("is-writing", writing);
        lmEls.field.classList.toggle("is-writing", writing);
    }

    // Adds a word to the text (or finishes the word being typed)
    function insertWord(word) {
        const input = lmEls.input;
        let text = input.value;
        const state = readText(text);
        // The half-typed word at the end of the text (null when the last word is finished)
        const typed = state.partial ? text.match(WORD_END) : null;

        if (word === END) {
            input.value = text.replace(/[\s,;:]+$/, "") + ". ";
        } else if (lm.mode === "complete" && typed) {
            // replace the half-typed word
            const keepCapital = typed[0].charAt(0) !== typed[0].charAt(0).toLowerCase();
            input.value = text.slice(0, text.length - typed[0].length) + displayWord(word, state.previous.length === 0 || keepCapital) + " ";
        } else {
            if (text && !/\s$/.test(text)) text += " ";
            input.value = text + displayWord(word, state.previous.length === 0 && !state.partial) + " ";
        }
        if (input.value.length > MAX_TEXT) input.value = input.value.slice(0, MAX_TEXT);
        input.scrollTop = input.scrollHeight;
        renderPredictor();
    }

    // ----- Auto-write: the model writes up to AUTO_WORDS words by itself -----
    // finishWord: true = a word that is half typed gets finished (the Stop button),
    // false = it is taken back (for example when you click a candidate instead).
    function stopAuto(announceDone, finishWord) {
        const job = lm.writer;
        if (!job) return;
        job.cancelled = true;
        clearTimeout(job.timer);
        lm.writer = null;
        lmEls.items.forEach((item) => item.querySelector(".lab-cand").classList.remove("is-picked"));

        // Stopped in the middle of typing a word? Only fix the text if you didn't edit it yourself.
        const input = lmEls.input;
        if (job.typing && input.value === job.base + job.typed) {
            input.value = finishWord ? job.base + job.word : job.base;
            input.scrollTop = input.scrollHeight;
            renderPredictor();
        }
        updateAutoButton();
        if (announceDone) A.announce(t("lab.lmSrDone"), { region: lmEls.live });
    }

    function startAuto() {
        if (lm.writer) {
            stopAuto(true, true);
            return;
        }
        hub.track("use");
        // base = the text before the current word, word = the word being typed, typed = the letters so far;
        // next = the step that waits for its timer (pause() holds it, resume() runs it)
        const job = { cancelled: false, count: 0, timer: 0, next: null, held: false, typing: false, base: "", word: "", typed: "" };
        lm.writer = job;
        updateAutoButton();

        // The first new word needs a space before it ("piz" + " " + "next", "pizza." + " " + "Then")
        const input = lmEls.input;
        if (input.value && !/\s$/.test(input.value) && input.value.length < MAX_TEXT) input.value += " ";
        renderPredictor();

        const calm = !A.motion.ok();

        // Every wait between two steps goes through here, so that pause() can hold the
        // job (holdAuto) and resume() can go on with the step that waits (continueAuto)
        function later(step, ms) {
            job.next = step;
            job.timer = setTimeout(() => {
                job.timer = 0;
                job.next = null;
                step();
            }, ms);
        }

        function nextWord() {
            if (job.cancelled) return;
            if (job.count >= AUTO_WORDS || input.value.length > AUTO_STOP) {
                stopAuto(true);
                return;
            }
            const result = analyse();
            const chances = pickChances(result.list, lm.temperature);
            if (!result.list.length) {
                stopAuto(true);
                return;
            }
            const choice = result.list[A.util.sampleWeighted(chances)].word;
            job.count++;

            // Light up the chosen candidate for a moment, so you can see the "decision"
            const shownIndex = lm.shown.findIndex((item) => item.word === choice);
            if (shownIndex >= 0) lmEls.items[shownIndex].querySelector(".lab-cand").classList.add("is-picked");

            later(() => {
                if (job.cancelled) return;
                lmEls.items.forEach((item) => item.querySelector(".lab-cand").classList.remove("is-picked"));
                if (choice === END) {
                    insertWord(END);
                    stopAuto(true);
                    return;
                }
                const atStart = readText(input.value).previous.length === 0;
                typeOut(displayWord(choice, atStart) + " ", () => {
                    job.typing = false;
                    renderPredictor();
                    later(nextWord, calm ? AUTO_PAUSE_CALM.next : AUTO_PAUSE.next);
                });
            }, calm ? AUTO_PAUSE_CALM.pick : AUTO_PAUSE.pick);
        }

        // Letters appear one by one, like someone typing
        function typeOut(text, done) {
            if (calm) {
                input.value += text;
                input.scrollTop = input.scrollHeight;
                done();
                return;
            }
            job.typing = true;
            job.base = input.value;
            job.word = text;
            job.typed = "";
            let i = 0;
            (function typeLetter() {
                if (job.cancelled) return;
                input.value += text.charAt(i);
                job.typed += text.charAt(i);
                input.scrollTop = input.scrollHeight;
                i++;
                if (i < text.length) later(typeLetter, LETTER_MS + A.util.random(0, LETTER_RANDOM));
                else done();
            })();
        }

        nextWord();
    }

    // pause(): the job waits where it is (a half-typed word stays)...
    function holdAuto() {
        const job = lm.writer;
        if (!job || !job.timer) return;
        clearTimeout(job.timer);
        job.timer = 0;
        job.held = true;
    }

    // ...and resume() goes on with the step that was waiting
    function continueAuto() {
        const job = lm.writer;
        if (!job || !job.held) return;
        job.held = false;
        const step = job.next;
        job.next = null;
        if (step) step();
    }

    // ----- Teaching the model your own sentences -----
    function teachSentence(event) {
        event.preventDefault();
        const sentence = lmEls.teachInput.value.trim().replace(/\s+/g, " ");
        if (wordsOf(sentence).length < 2) {
            lmEls.teachStatus.textContent = t("lab.lmTeachError");
            lmEls.teachStatus.classList.add("is-error");
            lmEls.teachInput.focus();
            return;
        }
        if (lm.taught.length >= MAX_TAUGHT) {
            lmEls.teachStatus.textContent = t("lab.lmTeachFull");
            lmEls.teachStatus.classList.add("is-error");
            return;
        }
        lm.taught.push(sentence.slice(0, MAX_TEACH));
        A.storage.set("lab.taught." + lm.lang, lm.taught);
        hub.track("milestone", { kind: "taught", sentences: lm.taught.length });
        lm.model = buildModel(CORPUS[lm.lang].concat(lm.taught));
        lmEls.teachInput.value = "";
        renderLmStats();
        renderPredictor();
        A.toast(t("lab.lmTeachToast"), "🧠");
    }

    function forgetSentences() {
        lm.taught = [];
        A.storage.remove("lab.taught." + lm.lang);
        lm.model = buildModel(CORPUS[lm.lang]);
        renderLmStats();
        renderPredictor();
        lmEls.teachInput.focus();
        A.toast(t("lab.lmTeachForgot"), "🧹");
    }

    // ----- Typing, buttons and the slider -----
    function clearText() {
        stopAuto(false);
        lmEls.input.value = "";
        lm.starter = null;
        renderPredictor();
        lmEls.input.focus();
    }

    function useStarter(n) {
        stopAuto(false);
        lmEls.input.value = t("lab.lmStarter" + n) + " ";
        lm.starter = { n: n, text: lmEls.input.value };
        renderPredictor();
    }

    function onTemperature() {
        lm.temperature = A.util.clamp(Number(lmEls.temp.value) || 0, TEMPERATURE.min, TEMPERATURE.max);
        A.storage.set("lab.temperature", lm.temperature);
        // only the "chance to be picked" lines change
        if (lm.lastResult) {
            const chances = pickChances(lm.lastResult.list, lm.temperature);
            lmEls.items.forEach((item, i) => {
                if (lm.shown[i]) {
                    lm.shown[i].chance = chances[i];
                    item.querySelector(".lab-cand-pick").style.transform = "scaleX(" + (chances[i] || 0).toFixed(4) + ")";
                }
            });
        }
        updateTempOutput();
    }

    function setUpPredictor() {
        lmEls.temp.value = String(lm.temperature);
        lmEls.input.addEventListener("input", () => {
            stopAuto(false);
            if (lm.starter && !lmEls.input.value.startsWith(lm.starter.text)) lm.starter = null;
            renderPredictor();
        });
        lmEls.clear.addEventListener("click", clearText);
        $$(".lab-starter").forEach((button) => {
            button.addEventListener("click", () => useStarter(Number(button.getAttribute("data-starter"))));
        });
        lmEls.items.forEach((item, i) => {
            item.querySelector(".lab-cand").addEventListener("click", () => {
                const data = lm.shown[i];
                if (!data) return;
                stopAuto(false);
                insertWord(data.word);
            });
        });
        lmEls.auto.addEventListener("click", startAuto);
        lmEls.temp.addEventListener("input", onTemperature);
        lmEls.teachForm.addEventListener("submit", teachSentence);
        lmEls.forget.addEventListener("click", forgetSentences);
    }

    /* =========================================================
       6. OPENING AND CLOSING: AICompass.lab.define
       The hub calls create() each time the experiment opens, and the
       controller's destroy() when it closes. The model and your text
       stay in this file's memory in between.
       ========================================================= */
    // ----- Language: update the text that JavaScript writes, keep everything else -----
    function refreshTexts() {
        // An old message must not stay behind in the old language, not even one on its way
        // (core writes a message 80 ms after it is said): this cancels it and empties the line
        A.announce("", { region: lmEls.live, delay: 0 });
        updateAutoButton();
        lmEls.autoHint.textContent = t("lab.lmAutoLabel", { n: AUTO_WORDS });
        renderLmStats();
        updateTempOutput();
    }

    // The predictor switches to the sentences of the new language (and your own ones in it).
    // If the text is exactly a starter, it becomes the same starter in the new language.
    // Anything you wrote or picked yourself stays as it is.
    function refreshLanguage() {
        languageStale = false;
        const keepStarter = lm.starter && lmEls.input.value.trim() === lm.starter.text.trim();
        loadModel();
        if (keepStarter) {
            lmEls.input.value = t("lab.lmStarter" + lm.starter.n) + " ";
            lm.starter.text = lmEls.input.value;
        } else {
            lm.starter = null;
        }
        refreshTexts();
        renderPredictor();
    }

    // Core has already translated every data-i18n text: the experiment only redoes what its
    // JavaScript writes, and while paused that waits until resume().
    function languageChanged() {
        stopAuto(false);     // the model must not go on writing in the old language
        if (paused) languageStale = true;
        else refreshLanguage();
    }

    function findElements() {
        lmEls = {
            input: $("#lab-lm-input"),
            clear: $(".lab-lm-clear"),
            mode: $('[data-lm="mode"]'),
            context: $('[data-lm="context"]'),
            tokens: $('[data-lm="tokens"]'),
            notice: $(".lab-lm-notice"),
            items: $$(".lab-cand-item"),
            auto: $(".lab-auto"),
            temp: $("#lab-temp"),
            tempOut: $('[data-out="temp"]'),
            teachForm: $(".lab-teach"),
            teachInput: $("#lab-teach-input"),
            teachStatus: $(".lab-teach-status"),
            forget: $('[data-action="forget"]'),
            live: $('[data-live="lm"]'),
            field: $(".lab-lm-field"),
            autoHint: $("#lab-auto-hint")
        };
    }

    // Builds the experiment in the hub's stage (an empty element) and returns its controller
    function create(stage, context) {
        hub = context;
        paused = false;
        stage.innerHTML = predictorHTML();
        root = stage.firstElementChild;
        findElements();
        // The HTML has empty text holders: they are filled in this once
        // (after that, core keeps them in the right language)
        A.applyTranslations(root);
        setUpPredictor();

        // Your text from last time comes back. The model is made again only for another
        // language (a starter in the box then becomes the same starter in the new one).
        lmEls.input.value = lm.text;
        lmEls.teachInput.value = lm.teachText;
        if (!lm.model || lm.lang !== A.lang) {
            refreshLanguage();
        } else {
            refreshTexts();
            renderPredictor();
        }

        return {
            pause: pause,
            resume: resume,
            language: languageChanged,
            theme: function () {},       // nothing to redraw: every colour comes from the CSS
            destroy: destroy
        };
    }

    // Off screen or a hidden browser tab: no timers (auto-write waits where it is)
    // Off screen, auto-write waits where it is (resume() goes on with it). A hidden
    // browser tab stops it, as it always did: nobody would see it type.
    function pause() {
        paused = true;
        clearTimeout(lm.srTimer);
        if (document.hidden) stopAuto(false);
        else holdAuto();
    }

    function resume() {
        paused = false;
        if (languageStale) refreshLanguage();
        continueAuto();
    }

    // Closing: stop auto-write (a half-typed word is taken back) and keep your text.
    // The hub empties the stage afterwards.
    function destroy() {
        stopAuto(false);
        clearTimeout(lm.srTimer);
        lm.text = lmEls.input.value;
        lm.teachText = lmEls.teachInput.value;
        root = null;
        lmEls = null;
        hub = null;
        paused = false;
        languageStale = false;
    }

    A.lab.define("predictor", {
        create: create,
        // The pure maths, for the checks in Node (the page doesn't use this)
        maths: {
            START: START,
            END: END,
            wordsOf: wordsOf,
            endsMidWord: endsMidWord,
            buildModel: buildModel,
            predictNext: predictNext,
            probOf: probOf,
            topWords: topWords,
            pickChances: pickChances,
            corpus: CORPUS
        }
    });
})();
