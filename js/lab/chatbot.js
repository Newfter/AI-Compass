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
    const TEXT_LIMIT = 300;          // characters in the text box (its hint says 300 too)
    const MAX_MERGES = 400;          // merges the tokenizer may learn (the texts say 400 too)
    const CHOICES = ["en", "ru", "both"];   // what it may learn from
    const START_CHOICE = "both";
    const PLAY_SPEED = 25;           // merges per second while "Play" runs
    const TRAIN_BUDGET = 5;          // ms of learning per frame (one merge may run over): the frame stays near 8 ms
    const QUICK_MERGES = 3;          // this many missing merges are learned at once; more, a few per frame
    const CHIP_COLORS = 6;           // token chips take turns with this many colours
    const SPACE_MARK = "▁";          // a word start, shown the way SentencePiece shows it
    const NEWLINE_MARK = "↵";
    const IDS_SHOWN = 10;            // token numbers listed in "What's happening?"
    // View 2: meaning
    const START_WORD = "dog";
    const NEIGHBOURS = 5;            // nearest words listed
    const ROBOT_GOAL = 0.9;          // challenge 2: at least this similar to "robot"
    const PCA_ROUNDS = 200;          // rounds of power iteration (it settles long before)
    const WORD_STEP = 0.05;          // the sliders of your own word
    const PICK_RADIUS = 28;          // a click this close to a word on the map chooses it (px)
    // View 3: context. Every word has 7 numbers ("features"): 1 for its role, 0 for the others.
    const FEATURES = ["doer", "thing", "pronoun", "descDoer", "descThing", "verb", "other"];
    // Two layers of attention, set by hand. A rule [from, to, amount] gives feature "to" of
    // the query (what a word looks for), the key (what it offers) or the value (what it
    // passes on) amount × the word's feature "from".
    //   Layer 1: a pronoun looks for a word that describes something, and takes in what it describes.
    //   Layer 2: a word that now carries "describes the doer" looks for the doer (or the thing).
    const LAYERS = [
        {
            query: [["pronoun", "descDoer", 3], ["pronoun", "descThing", 3]],
            key: [["descDoer", "descDoer", 3], ["descThing", "descThing", 3]],
            value: [["descDoer", "descDoer", 1], ["descThing", "descThing", 1]]
        },
        {
            query: [["descDoer", "doer", 4], ["descThing", "thing", 4]],
            key: [["doer", "doer", 3], ["thing", "thing", 3]],
            value: [["doer", "doer", 1], ["thing", "thing", 1]]
        }
    ];
    const ARC_MS = 450;              // the attention lines glide to their new thickness
    // View 4: next word
    const TEMPERATURE = { min: 0, max: 2, step: 0.05, value: 1 };
    const TOP_K_MAX = 7;             // top-k from 1 to this (0: off); a prompt has 8 words, so 8 would keep all
    const TOP_P = { min: 0.5, step: 0.05 };     // top-p from min to 1 (1: off)
    const DICE_SEED = 7;             // the first dice of a prompt (+ the prompt's number), so a lesson can repeat it
    const ROLL_MS = 900;             // the needle runs to where the dice landed
    const ENDINGS = 20;              // "Write 20 endings" (the texts say 20 too)
    const LABEL_SHARE = 0.08;        // a part of the dice bar this big shows its word
    const BORING_ROLLS = 3;          // challenge 4: the same word this many rolls in a row...
    const SILLY_GOAL = 0.05;         // ...then the silly word gets at least this chance

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
    // (plain: true keeps the title but drops the box)
    function panel(titleKey, children, plain) {
        const element = el("section", plain ? "ch-panel ch-plain" : "ch-panel");
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
    // reduced motion) it jumps to the end at once. finish() jumps to the end now; cancel()
    // stops it where it is.
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
            cancel: function () {
                if (frame) cancelAnimationFrame(frame);
                frame = 0;
                done = true;
            },
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
    //   model.learn(ms)  learns merges for about ms milliseconds (0: just one, Infinity: all)
    //   model.done       true when it may not (or cannot) learn any more
    function tokenizer(text, maxMerges) {
        const counts = new Map();
        splitWords(text).forEach(function (word) { counts.set(word, (counts.get(word) || 0) + 1); });
        const words = [];
        counts.forEach(function (count, word) { words.push({ parts: Array.from(word), count: count }); });
        const model = { base: [], vocab: new Map(), merges: [], ranks: new Map(), sizes: [], done: maxMerges < 1 };
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
                model.done = !learnOne() || model.merges.length >= maxMerges;
                if (performance.now() - started >= ms) break;
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
       4. MEANING: WORD VECTORS AND THE MAP
       ========================================================= */
    function dot(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
        return sum;
    }

    // Cosine similarity: 1 when two lists of numbers point the same way, 0 when they have
    // nothing in common. A list of zeros points nowhere: 0.
    function cosine(a, b) {
        const size = Math.sqrt(dot(a, a) * dot(b, b));
        return size > 0 ? dot(a, b) / size : 0;
    }

    // The words most similar to a list of numbers, the most similar first: [{ word, sim }].
    // skip: ids of words to leave out.
    function nearest(words, vector, count, skip) {
        return words.filter(function (word) { return !skip || skip.indexOf(word.id) === -1; })
            .map(function (word) { return { word: word, sim: cosine(vector, word.vector) }; })
            .sort(function (x, y) { return y.sim - x.sim; })
            .slice(0, count);
    }

    // Word maths: a − b + c, and the words nearest to the result, leaving out a, b and c
    // themselves (word2vec's tests are scored the same way)
    function wordMaths(words, a, b, c) {
        const vector = a.vector.map(function (x, i) { return x - b.vector[i] + c.vector[i]; });
        const list = nearest(words, vector, 3, [a.id, b.id, c.id]);
        return { vector: vector, list: list, answer: list[0] };
    }

    // The two directions in which the words differ the most (principal component analysis).
    // Power iteration: multiply a guess by the covariance matrix again and again, and it
    // turns towards the strongest direction. That direction is then taken out of the matrix
    // (deflation), and the next one is found the same way.
    function pca(vectors, count) {
        const n = vectors.length;
        const d = vectors[0].length;
        const mean = [];
        for (let j = 0; j < d; j++) mean.push(vectors.reduce(function (sum, v) { return sum + v[j]; }, 0) / n);
        const matrix = [];
        for (let i = 0; i < d; i++) {
            matrix.push([]);
            for (let j = 0; j < d; j++) {
                let sum = 0;
                vectors.forEach(function (v) { sum += (v[i] - mean[i]) * (v[j] - mean[j]); });
                matrix[i].push(sum / n);
            }
        }
        const components = [];
        for (let k = 0; k < count; k++) {
            let v = mean.map(function (x, i) { return 1 + i / d; });     // any start will do
            for (let round = 0; round < PCA_ROUNDS; round++) {
                const next = matrix.map(function (row) { return dot(row, v); });
                const size = Math.sqrt(dot(next, next));
                if (!(size > 0)) break;
                v = next.map(function (x) { return x / size; });
            }
            // Its biggest number is made positive, so the map never comes out mirrored
            let big = 0;
            v.forEach(function (x, i) { if (Math.abs(x) > Math.abs(v[big])) big = i; });
            if (v[big] < 0) v = v.map(function (x) { return -x; });
            const value = dot(v, matrix.map(function (row) { return dot(row, v); }));
            components.push({ vector: v, value: value });
            for (let i = 0; i < d; i++) {
                for (let j = 0; j < d; j++) matrix[i][j] -= value * v[i] * v[j];
            }
        }
        return { mean: mean, components: components };
    }

    // Where a list of numbers lands on the map: how far it goes along each direction
    function project(map, vector) {
        const centred = vector.map(function (x, i) { return x - map.mean[i]; });
        return map.components.map(function (component) { return dot(centred, component.vector); });
    }

    // The words of the data: { id, en, ru, group (a number), vector, at (on the map) }
    function makeWords(data) {
        return data.words.map(function (row) {
            return { id: row[0], en: row[1], ru: row[2], group: data.groups.indexOf(row[3]), vector: row[4], at: null };
        });
    }

    function nameOf(word) {
        return word[A.lang] || word.en;
    }

    /* =========================================================
       5. CONTEXT: ATTENTION
       ========================================================= */
    // A word's first numbers: 1 for its role, 0 for every other feature
    function oneHot(role) {
        return FEATURES.map(function (feature) { return feature === role ? 1 : 0; });
    }

    // x × W, with W written as rules [from, to, amount]
    function times(x, rules) {
        const out = FEATURES.map(function () { return 0; });
        rules.forEach(function (rule) { out[FEATURES.indexOf(rule[1])] += rule[2] * x[FEATURES.indexOf(rule[0])]; });
        return out;
    }

    // Softmax: turns scores into shares that add up to 1. (Taking the biggest score away
    // first changes nothing, but keeps e^score from growing too big.)
    function softmax(scores) {
        const top = Math.max.apply(null, scores);
        const powers = scores.map(function (score) { return Math.exp(score - top); });
        const total = powers.reduce(function (sum, p) { return sum + p; }, 0);
        return powers.map(function (p) { return p / total; });
    }

    // One layer of attention, for every word at once:
    //   q = x·Wq: what the word looks for     k = x·Wk: what it offers     v = x·Wv: what it passes on
    //   score(i, j) = q_i · k_j ÷ √d          weights of word i = softmax of its scores
    //   output_i = Σ_j weight(i, j) × v_j     the new numbers of word i = x_i + output_i
    function attentionLayer(xs, layer) {
        const root = Math.sqrt(FEATURES.length);
        const q = xs.map(function (x) { return times(x, layer.query); });
        const k = xs.map(function (x) { return times(x, layer.key); });
        const v = xs.map(function (x) { return times(x, layer.value); });
        const dots = q.map(function (qi) { return k.map(function (kj) { return dot(qi, kj); }); });
        const scores = dots.map(function (row) { return row.map(function (s) { return s / root; }); });
        const weights = scores.map(softmax);
        const outputs = weights.map(function (row) {
            return FEATURES.map(function (feature, n) {
                return row.reduce(function (sum, w, j) { return sum + w * v[j][n]; }, 0);
            });
        });
        const next = xs.map(function (x, i) { return x.map(function (value, n) { return value + outputs[i][n]; }); });
        return { q: q, k: k, v: v, dots: dots, scores: scores, weights: weights, outputs: outputs, next: next };
    }

    // Both layers for a sentence, given the role of each word: [layer 1, layer 2]
    function attention(roles) {
        const first = attentionLayer(roles.map(oneHot), LAYERS[0]);
        return [first, attentionLayer(first.next, LAYERS[1])];
    }

    /* =========================================================
       6. NEXT WORD: CHANCES AND DICE
       ========================================================= */
    // The chances after temperature T: softmax(score ÷ T). T = 0 always picks the top word.
    function withTemperature(scores, temperature) {
        if (!(temperature > 0)) {
            const top = scores.indexOf(Math.max.apply(null, scores));
            return scores.map(function (score, i) { return i === top ? 1 : 0; });
        }
        return softmax(scores.map(function (score) { return score / temperature; }));
    }

    // Only the words in keep keep their chance, scaled back up so that they add up to 1
    function keepOnly(chances, keep) {
        let total = 0;
        chances.forEach(function (p, i) { if (keep[i]) total += p; });
        return chances.map(function (p, i) { return keep[i] && total > 0 ? p / total : 0; });
    }

    // Top-k keeps the k most likely words (k = 0: off). Top-p then keeps the most likely
    // words until their chances add up to p (p = 1: off): the smallest such group.
    function cutTail(chances, k, p) {
        const order = chances.map(function (x, i) { return i; }).sort(function (a, b) { return chances[b] - chances[a] || a - b; });
        let kept = k > 0 ? keepOnly(chances, chances.map(function (x, i) { return order.indexOf(i) < k; })) : chances;
        if (p < 1) {
            const keep = chances.map(function () { return false; });
            let sum = 0;
            order.forEach(function (i) {
                if (sum >= p - 1e-9 || !(kept[i] > 0)) return;
                keep[i] = true;
                sum += kept[i];
            });
            kept = keepOnly(kept, keep);
        }
        return kept;
    }

    // The three steps of view 4: softmax of the scores, after temperature, after top-k and top-p
    function chances(scores, temperature, k, p) {
        const warm = withTemperature(scores, temperature);
        return { plain: softmax(scores), warm: warm, final: cutTail(warm, k, p) };
    }

    // The dice: a number u from 0 to 1 lands on the word whose part of the bar holds it
    function pick(chances, u) {
        let sum = 0;
        let last = 0;
        for (let i = 0; i < chances.length; i++) {
            if (!(chances[i] > 0)) continue;
            sum += chances[i];
            last = i;
            if (u < sum) return i;
        }
        return last;                      // rounding can leave the sum a hair below 1
    }

    /* =========================================================
       7. DRAWING THE MAP OF WORDS
       ========================================================= */
    const SHAPES = ["dot", "square", "triangle", "diamond", "ring"];     // one per group of words
    const SPREAD = 11;               // words drawn closer than this (px) are nudged apart

    function overlaps(a, b) {
        return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    }

    // An arrow from one point to another, bent a little to one side (bend: 0 = straight)
    function drawArrow(g, from, to, color, bend, dashed) {
        const mx = (from.x + to.x) / 2 - (to.y - from.y) * bend;
        const my = (from.y + to.y) / 2 + (to.x - from.x) * bend;
        const angle = Math.atan2(to.y - my, to.x - mx);
        g.strokeStyle = color;
        g.fillStyle = color;
        g.lineWidth = 2;
        g.setLineDash(dashed ? [6, 5] : []);
        g.beginPath();
        g.moveTo(from.x, from.y);
        g.quadraticCurveTo(mx, my, to.x - 9 * Math.cos(angle), to.y - 9 * Math.sin(angle));
        g.stroke();
        g.setLineDash([]);
        g.beginPath();
        g.moveTo(to.x, to.y);
        g.lineTo(to.x - 11 * Math.cos(angle - 0.4), to.y - 11 * Math.sin(angle - 0.4));
        g.lineTo(to.x - 11 * Math.cos(angle + 0.4), to.y - 11 * Math.sin(angle + 0.4));
        g.closePath();
        g.fill();
    }

    // The map. scene = { words, bounds, name(word), chosen (an id), focus: { id: 2 or 1 }
    // (2: the label must show, 1: it comes before the others), points: [{ at, label }] (places that are no word: your word,
    // the steps of word maths), lines: [[from, to]] and arrows: [{ from, to, color, dashed }]
    // between words and points }. Returns where each word was drawn, for clicks.
    function drawMap(view, scene) {
        const g = view.ctx;
        const c = kit.colors();
        const pad = 26;
        const b = scene.bounds;
        function pixel(at) {
            return {
                x: A.util.clamp(pad + ((at[0] - b.x0) / (b.x1 - b.x0 || 1)) * (view.width - 2 * pad), 8, view.width - 8),
                y: A.util.clamp(view.height - pad - ((at[1] - b.y0) / (b.y1 - b.y0 || 1)) * (view.height - 2 * pad), 8, view.height - 8)
            };
        }
        g.clearRect(0, 0, view.width, view.height);
        kit.drawGrid(g, view.width, view.height, 32);
        const spots = scene.words.map(function (word) {
            const p = pixel(word.at);
            return { word: word, x: p.x, y: p.y };
        });
        // Words with (almost) the same two numbers would hide each other: they are nudged apart
        // a little, on the screen only
        for (let round = 0; round < 30; round++) {
            let moved = false;
            spots.forEach(function (a, i) {
                spots.slice(i + 1).forEach(function (b, n) {
                    let dx = b.x - a.x;
                    let dy = b.y - a.y;
                    let d = Math.hypot(dx, dy);
                    if (d >= SPREAD) return;
                    if (d < 0.01) {
                        dx = Math.cos(i + n);       // the same spot: any direction will do
                        dy = Math.sin(i + n);
                        d = 1;
                    }
                    const push = (SPREAD - d) / 2 / d;
                    a.x -= dx * push;
                    a.y -= dy * push;
                    b.x += dx * push;
                    b.y += dy * push;
                    moved = true;
                });
            });
            if (!moved) break;
        }
        const spotOf = {};
        spots.forEach(function (spot) { spotOf[spot.word.id] = spot; });
        function place(thing) {
            return thing.id ? spotOf[thing.id] : pixel(thing.at);
        }

        // Lines to the nearest words, and the arrows of word maths, under the points
        g.lineWidth = 1.5;
        g.strokeStyle = kit.alpha(c.accent2, 0.6);
        scene.lines.forEach(function (line) {
            const from = place(line[0]);
            const to = place(line[1]);
            g.beginPath();
            g.moveTo(from.x, from.y);
            g.lineTo(to.x, to.y);
            g.stroke();
        });
        scene.arrows.forEach(function (arrow) { drawArrow(g, place(arrow.from), place(arrow.to), arrow.color, 0.18, arrow.dashed); });

        spots.forEach(function (spot) {
            const color = c.series[spot.word.group];
            const chosen = spot.word.id === scene.chosen;
            if (chosen) {
                g.beginPath();
                g.arc(spot.x, spot.y, 12, 0, Math.PI * 2);
                g.fillStyle = kit.alpha(color, 0.28);
                g.fill();
            }
            kit.marker(g, SHAPES[spot.word.group], spot.x, spot.y, chosen ? 6.5 : 4.5, color);
        });
        // A place that is no word: a dashed ring around a small dot
        const points = scene.points.map(function (point) { return { p: pixel(point.at), label: point.label }; });
        points.forEach(function (point) {
            g.beginPath();
            g.arc(point.p.x, point.p.y, 11, 0, Math.PI * 2);
            g.setLineDash([3, 3]);
            g.lineWidth = 2;
            g.strokeStyle = c.text;
            g.stroke();
            g.setLineDash([]);
            if (point.label) kit.marker(g, "dot", point.p.x, point.p.y, 3.5, c.text);
        });

        // The labels: the important ones first, the others only where there is room
        const taken = spots.map(function (spot) { return { x: spot.x - 6, y: spot.y - 6, w: 12, h: 12 }; });
        const labels = spots.map(function (spot) {
            return { x: spot.x, y: spot.y, text: scene.name(spot.word), rank: scene.focus[spot.word.id] || 0 };
        });
        points.forEach(function (point) {
            taken.push({ x: point.p.x - 11, y: point.p.y - 11, w: 22, h: 22 });
            if (point.label) labels.unshift({ x: point.p.x + 4, y: point.p.y, text: point.label, rank: 3 });
        });
        // Important labels first; among equals, a word near an edge first (it has the fewest
        // places for its label)
        function room(label) {
            return Math.min(label.x, view.width - label.x, label.y, view.height - label.y);
        }
        labels.sort(function (p, q) { return q.rank - p.rank || room(p) - room(q); });
        g.textBaseline = "middle";
        g.lineJoin = "round";
        labels.forEach(function (label) {
            g.font = label.rank ? kit.font(13, 700, "body") : kit.font(12, 500, "body");
            const w = g.measureText(label.text).width;
            const h = 16;
            // Where the label may go: right, left, above, below, then the four corners
            const middle = A.util.clamp(label.x - w / 2, 2, view.width - w - 2);
            const places = [[label.x + 9, label.y - h / 2], [label.x - 9 - w, label.y - h / 2], [middle, label.y - 10 - h], [middle, label.y + 10],
                [label.x + 6, label.y - 3 - h], [label.x + 6, label.y + 3], [label.x - 6 - w, label.y - 3 - h], [label.x - 6 - w, label.y + 3]];
            let spot = null;
            places.forEach(function (place) {
                const box = { x: place[0], y: place[1], w: w, h: h };
                const inside = box.x >= 2 && box.y >= 2 && box.x + w <= view.width - 2 && box.y + h <= view.height - 2;
                if (!spot && inside && !taken.some(function (other) { return overlaps(other, box); })) spot = box;
            });
            if (!spot && label.rank < 2) return;
            spot = spot || { x: A.util.clamp(places[0][0], 2, view.width - w - 2), y: places[0][1], w: w, h: h };
            taken.push({ x: spot.x - 5, y: spot.y, w: w + 10, h: h });      // with some air on both sides
            g.lineWidth = 3;
            g.strokeStyle = c.surface;
            g.strokeText(label.text, spot.x, spot.y + h / 2);
            g.fillStyle = label.rank ? c.text : c.muted;
            g.fillText(label.text, spot.x, spot.y + h / 2);
        });
        return spots;
    }

    /* =========================================================
       8. DRAWING ATTENTION
       ========================================================= */
    const CHIP_HEIGHT = 30;

    // Where the word chips go. Wide: one row, with room for the arcs above it. Narrow: the
    // chosen word on the left, every word in a column on the right (a "fan"). The fan is
    // sized for the chosen word, so the layout remembers which word that was (chosen).
    function chipLayout(g, texts, chosen, width) {
        g.font = kit.font(13, 600, "body");
        const widths = texts.map(function (text) { return Math.ceil(g.measureText(text).width) + 18; });
        const total = widths.reduce(function (sum, w) { return sum + w + 6; }, -6);
        if (total <= width - 24) {
            let x = Math.round((width - total) / 2);
            const chips = widths.map(function (w) {
                const chip = { x: x, y: 150, w: w, h: CHIP_HEIGHT };
                x += w + 6;
                return chip;
            });
            return { fan: false, height: 196, chips: chips, chosen: chosen };
        }
        const height = texts.length * 32 + 14;
        const widest = Math.max.apply(null, widths);
        const column = Math.max(widths[chosen] + 46, Math.min(width * 0.42, width - widest - 56));
        // The fan sits in the middle of a wide stage (the shares need about 40 px after a chip)
        const shift = Math.max(0, Math.floor((width - (column + widest + 48)) / 2));
        return {
            fan: true,
            chosen: chosen,
            height: height,
            from: { x: 8 + shift, y: (height - CHIP_HEIGHT) / 2, w: widths[chosen], h: CHIP_HEIGHT },
            chips: widths.map(function (w, i) { return { x: column + shift, y: 8 + i * 32, w: w, h: CHIP_HEIGHT - 2 }; })
        };
    }

    function paintChip(g, c, chip, text, chosen, top) {
        const r = 8;
        g.beginPath();
        g.moveTo(chip.x + r, chip.y);
        g.arcTo(chip.x + chip.w, chip.y, chip.x + chip.w, chip.y + chip.h, r);
        g.arcTo(chip.x + chip.w, chip.y + chip.h, chip.x, chip.y + chip.h, r);
        g.arcTo(chip.x, chip.y + chip.h, chip.x, chip.y, r);
        g.arcTo(chip.x, chip.y, chip.x + chip.w, chip.y, r);
        g.closePath();
        g.fillStyle = chosen ? kit.alpha(c.accent2, 0.25) : top ? kit.alpha(c.accent, 0.22) : c.surface;
        g.fill();
        g.lineWidth = chosen || top ? 2 : 1;
        g.strokeStyle = chosen ? c.accent2 : top ? c.accent : kit.alpha(c.text, 0.3);
        g.stroke();
        g.font = kit.font(13, 600, "body");
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillStyle = c.text;
        g.fillText(text, chip.x + chip.w / 2, chip.y + chip.h / 2 + 1);
    }

    // The sentence as chips, and a line from the chosen word to every word: the thicker and
    // brighter the line, the more of its attention goes there.
    // scene = { layout, texts, chosen, weights, top (the word with the most attention) }
    function drawAttention(view, scene) {
        const g = view.ctx;
        const c = kit.colors();
        const shape = scene.layout;
        const most = Math.max.apply(null, scene.weights) || 1;
        const labels = [];
        g.clearRect(0, 0, view.width, view.height);
        g.lineCap = "round";
        scene.weights.forEach(function (w, i) {
            const to = shape.chips[i];
            g.strokeStyle = kit.alpha(c.accent2, 0.2 + (0.8 * w) / most);
            g.lineWidth = 1 + 10 * w;
            g.beginPath();
            if (shape.fan) {
                const x0 = shape.from.x + shape.from.w;
                const y0 = shape.from.y + shape.from.h / 2;
                const y1 = to.y + to.h / 2;
                const middle = (x0 + to.x) / 2;
                g.moveTo(x0, y0);
                g.bezierCurveTo(middle, y0, middle, y1, to.x, y1);
                labels.push({ x: to.x + to.w + 8, y: y1, align: "left" });
            } else if (i === scene.chosen) {
                // A small loop: the attention a word gives to itself
                g.arc(to.x + to.w / 2, to.y - 12, 10, 0.7 * Math.PI, 2.3 * Math.PI);
                labels.push({ x: to.x + to.w / 2, y: to.y - 32, align: "center" });
            } else {
                const from = shape.chips[scene.chosen];
                const x0 = from.x + from.w / 2;
                const x1 = to.x + to.w / 2;
                const h = Math.min(105, 18 + Math.abs(x1 - x0) * 0.4);
                g.moveTo(x0, from.y - 2);
                g.quadraticCurveTo((x0 + x1) / 2, from.y - 2 - 2 * h, x1, to.y - 2);
                labels.push({ x: (x0 + x1) / 2, y: from.y - h - 11, align: "center" });
            }
            g.stroke();
        });
        shape.chips.forEach(function (chip, i) {
            paintChip(g, c, chip, scene.texts[i], i === scene.chosen && !shape.fan, i === scene.top);
        });
        if (shape.fan) paintChip(g, c, shape.from, scene.texts[scene.chosen], true, false);
        // The shares: all of them in the fan; in the row only the big ones (6% or more)
        g.font = kit.font(12, 700);
        g.lineWidth = 3;
        labels.forEach(function (label, i) {
            const w = scene.weights[i];
            if (!shape.fan && w < 0.06 && i !== scene.top) return;
            g.textAlign = label.align;
            g.strokeStyle = c.surface;
            g.strokeText(percent(w), label.x, label.y);
            g.fillStyle = i === scene.top ? c.text : c.muted;
            g.fillText(percent(w), label.x, label.y);
        });
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
        // (no first value: the first numbers appear at once, without counting up)
        const stats = {
            chars: kit.stat({ labelKey: "lab.chatbot.tok.chars" }),
            tokens: kit.stat({ labelKey: "lab.chatbot.tok.tokens" }),
            perToken: kit.stat({ labelKey: "lab.chatbot.tok.perToken", format: function (v) { return decimals(v, 2); } }),
            vocab: kit.stat({ labelKey: "lab.chatbot.tok.vocab" })
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

        // ----- Learning: only when the view needs merges that aren't learned yet -----
        // Opening the view learns nothing. A few missing merges are learned at once; more
        // start the whole training, a few merges per frame with the progress bar. Each
        // tokenizer stays trained for the rest of the visit.
        const trainLoop = kit.loop({
            rate: Infinity,
            budget: TRAIN_BUDGET,
            update: function () {
                if (model.learn(TRAIN_BUDGET)) trainLoop.stop();
            },
            draw: function () {
                if (model.done) app.ctx.announce(t("lab.chatbot.tok.trained", { n: kit.number(model.merges.length) }));
                // Only the bar moves, until the merges the tokens wait for are there (redrawing
                // everything each frame would cost more than the learning)
                if (model.done || (shownMerges < merges && model.merges.length > merges)) update();
                else paintProgress();
            }
        });

        // Makes sure the first `count` merges are (or will soon be) learned
        function need(count) {
            const goal = Math.min(count, MAX_MERGES);
            while (!model.done && model.merges.length < goal && goal - model.merges.length <= QUICK_MERGES) model.learn(0);
            if (!model.done && model.merges.length < goal) trainLoop.start();
        }

        // ----- "Play": one more merge, PLAY_SPEED times a second -----
        const playLoop = kit.loop({
            rate: PLAY_SPEED,
            update: function () {
                need(merges + 1);
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
            trainLoop.stop();                 // the other tokenizer goes on later, if it's needed
            model = tokenizerFor(choice, data);
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
            need(merges + 1);
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
            else if (token.id < 0) write(info, t("lab.chatbot.tok.infoUnknown", { token: tokenHTML(token.text) }));
            else write(info, t("lab.chatbot.tok.info", { token: tokenHTML(token.text), id: String(token.id) }));
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

        // The same message in two languages. A tokenizer that learned mostly from one language
        // cuts the other into more, shorter pieces, so its speakers pay for more tokens and
        // fit less text into the model's memory (Petrov et al., 2023, "Language Model
        // Tokenizers Introduce Unfairness Between Languages").
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
            // A ratio below 1.1 would read "1.0×", like "the same": a small difference gets words
            const ratio = ru.length / en.length;
            if (ratio >= 1.1) write(verdict, tx("lab.chatbot.tok.verdictMore", { ratio: decimals(ratio, 1) }));
            else if (ru.length > en.length) write(verdict, t("lab.chatbot.tok.verdictLittle"));
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
            progress.element.hidden = !trainLoop.running();
            progress.set(model.merges.length / MAX_MERGES);
        }

        // Everything on screen follows the numbers
        function update() {
            need(merges + 1);                 // + 1: "What's happening?" shows the next pair
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
            explain.setValues(2, {
                merges: m, chars: A.plural("lab.chatbot.tok.charCount", chars),
                tokens: A.plural("lab.chatbot.tok.tokenCount", tokens.length), perToken: decimals(perToken, 2)
            });
            const ids = tokens.slice(0, IDS_SHOWN).map(function (token) { return token.id < 0 ? "?" : String(token.id); });
            explain.setValues(3, { ids: ids.length ? ids.join(", ") + (tokens.length > IDS_SHOWN ? ", …" : "") : "—" });
            explain.setStep(state === "ready" ? 0 : state === "running" ? 1 : 2);
            if (m >= MAX_MERGES) explain.setText("lab.chatbot.tok.step2Done", { times: A.plural("lab.chatbot.tok.times", m) });
            else if (next && next.count === 1) explain.setText("lab.chatbot.tok.step2Once", { a: shown(next.a), b: shown(next.b) });
            else explain.setText(null);

            // Challenge 1 counts only with "Russian only": its lesson is that the training text
            // decides the vocabulary. (With "Both", one pair is a token cheaper in Russian at
            // exactly 24 merges, for a moment, which teaches nothing.)
            app.challenges.check({ ruFewer: ruFewer && choice === "ru" });
        }

        return {
            element: root,
            show: function () {
                root.hidden = false;
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
                if (!root.hidden) update();       // show() updates a hidden view
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
       10. VIEW 2: MEANING
       ========================================================= */
    function meaningView(app) {
        const data = app.data;
        const words = makeWords(data);
        const byId = {};
        words.forEach(function (word) { byId[word.id] = word; });
        // The map is worked out once: every word at its two numbers
        const map = pca(words.map(function (word) { return word.vector; }), 2);
        words.forEach(function (word) { word.at = project(map, word.vector); });
        const xs = words.map(function (word) { return word.at[0]; });
        const ys = words.map(function (word) { return word.at[1]; });
        const bounds = { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
        const root = el("div", "ch-view");
        const ui = kit.layout(root, { side: true });
        let mode = "word";                    // "word" | "maths" | "own"
        let chosen = START_WORD;
        let sum = data.arithmetic[0].slice(0, 3);       // [start from, take away, add]
        let own = app.saved.word ? app.saved.word.slice() : data.dims.map(function () { return 0; });
        let scene = null;                     // what the map shows
        let spots = [];                       // where the words were drawn (for clicks)

        function wordOptions() {
            return words.map(function (word) { return { value: word.id, labelKey: function () { return nameOf(word); } }; });
        }

        function sumText(ids) {
            return nameOf(byId[ids[0]]) + " − " + nameOf(byId[ids[1]]) + " + " + nameOf(byId[ids[2]]);
        }

        function barOf(item) {
            return { label: nameOf(item.word), value: item.sim, colorIndex: item.word.group };
        }

        // "dog 99.5%, cat 98.2%" (for screen readers)
        function listOf(items) {
            return items.map(function (item) { return nameOf(item.word) + " " + percent(item.sim); }).join(", ");
        }

        // ----- The map -----
        const modes = kit.segmented({
            labelKey: "lab.chatbot.mean.mode",
            options: ["word", "maths", "own"].map(function (value) {
                return { value: value, labelKey: "lab.chatbot.mean.mode." + value };
            }),
            value: mode,
            onChange: function (value) {
                mode = value;
                render();
            }
        });
        const mapView = kit.canvas(ui.main, { aspect: 4 / 3, minHeight: 300, maxHeight: 520, labelKey: "lab.chatbot.mean.map" });
        ui.main.append(
            kit.legend(data.groups.map(function (group, i) {
                return { labelKey: "lab.chatbot.mean.group." + group, colorIndex: i, shape: SHAPES[i] };
            })).element,
            textEl("p", "ch-small", "lab.chatbot.mean.mapNote")
        );

        // ----- A word: its numbers and the words nearest to it -----
        const wordSelect = kit.select({
            labelKey: "lab.chatbot.mean.word", options: wordOptions(), value: chosen,
            onChange: function (id) {
                chosen = id;
                render();
            }
        });
        const numbers = kit.bars(null, { max: 1, format: function (v) { return decimals(v, 2); } });
        const near = kit.bars(null, { max: 1, format: function (v) { return percent(v, 1); } });
        const wordPart = el("div", "ch-mode");
        wordPart.append(wordSelect.element, panel("lab.chatbot.mean.numbers", [numbers], true), panel("lab.chatbot.mean.nearest", [near], true));

        // ----- Word maths: a − b + c -----
        const presets = kit.chips({
            labelKey: "lab.chatbot.mean.presets",
            options: data.arithmetic.map(function (example, i) { return { value: i, labelKey: function () { return sumText(example); } }; }),
            value: 0,
            onChange: function (i) {
                sum = data.arithmetic[i].slice(0, 3);
                sumSelects.forEach(function (select, n) { select.set(sum[n]); });
                render();
                sayAnswer();
            }
        });
        const sumSelects = ["a", "b", "c"].map(function (name, n) {
            return kit.select({
                labelKey: "lab.chatbot.mean." + name, options: wordOptions(), value: sum[n],
                onChange: function (id) {
                    sum[n] = id;
                    const same = data.arithmetic.filter(function (example) { return example.slice(0, 3).join() === sum.join(); })[0];
                    presets.set(same ? data.arithmetic.indexOf(same) : null);
                    render();
                    sayAnswer();
                }
            });
        });
        const answer = el("p", "ch-answer");
        const answerSim = el("p", "ch-small");
        const candidates = kit.bars(null, { max: 1, format: function (v) { return percent(v, 1); } });
        const mathsPart = el("div", "ch-mode");
        mathsPart.append(presets.element, kit.row(sumSelects), answer, answerSim,
            panel("lab.chatbot.mean.candidates", [candidates], true), textEl("p", "ch-small", "lab.chatbot.mean.mathsNote"));

        // ----- Your own word: 10 sliders -----
        const ownSliders = data.dims.map(function (dim, n) {
            return kit.slider({
                labelKey: "lab.chatbot.mean.dim." + dim, min: 0, max: 1, step: WORD_STEP, value: own[n],
                format: function (v) { return decimals(v, 2); },
                onInput: function (v) {
                    own[n] = v;
                    render();
                },
                onChange: function () { app.save({ word: own.slice() }); }
            });
        });
        own = ownSliders.map(function (slider) { return slider.value(); });
        const sliderBox = el("div", "ch-sliders");
        ownSliders.forEach(function (slider) { sliderBox.appendChild(slider.element); });
        const clear = kit.button("lab.chatbot.mean.ownClear", {
            icon: "reset",
            variant: "subtle",
            onClick: function () {
                own = own.map(function () { return 0; });
                ownSliders.forEach(function (slider) { slider.set(0); });
                render();
                app.save({ word: null });
            }
        });
        const ownEmpty = textEl("p", "ch-small", "lab.chatbot.mean.ownEmpty");
        const ownNear = kit.bars(null, { max: 1, format: function (v) { return percent(v, 1); } });
        const ownPart = el("div", "ch-mode");
        ownPart.append(panel("lab.chatbot.mean.own", [sliderBox, kit.toolbar([clear])], true),
            panel("lab.chatbot.mean.nearest", [ownEmpty, ownNear], true));

        const explain = kit.explain({ steps: [
            { key: "lab.chatbot.mean.step1" }, { key: "lab.chatbot.mean.step2" }, { key: "lab.chatbot.mean.step3" },
            { key: "lab.chatbot.mean.step4", values: { result: "" } }
        ] });
        ui.top.appendChild(modes.element);
        ui.side.append(wordPart, mathsPart, ownPart);
        ui.bottom.append(ideaLine("lab.chatbot.mean.ideaLine", "embedding", "lab.chatbot.mean.term"), explain.element);

        // ----- A click on the map chooses the nearest word -----
        function spotAt(event) {
            const box = mapView.canvas.getBoundingClientRect();
            const x = event.clientX - box.left;
            const y = event.clientY - box.top;
            let best = null;
            let distance = PICK_RADIUS;
            spots.forEach(function (spot) {
                const d = Math.hypot(spot.x - x, spot.y - y);
                if (d < distance) {
                    best = spot;
                    distance = d;
                }
            });
            return best;
        }

        mapView.canvas.addEventListener("click", function (event) {
            const spot = spotAt(event);
            if (!spot) return;
            chosen = spot.word.id;
            wordSelect.set(chosen);
            mode = "word";
            modes.set(mode);
            render();
        });
        mapView.canvas.addEventListener("pointermove", function (event) {
            mapView.canvas.style.cursor = spotAt(event) ? "pointer" : "";
        });
        mapView.onResize(draw);

        function draw() {
            if (scene && mapView.width) spots = drawMap(mapView, scene);
        }

        function sayAnswer() {
            const result = wordMaths(words, byId[sum[0]], byId[sum[1]], byId[sum[2]]);
            app.ctx.announce(t("lab.chatbot.mean.answerSaid", {
                a: nameOf(byId[sum[0]]), b: nameOf(byId[sum[1]]), c: nameOf(byId[sum[2]]), answer: nameOf(result.answer.word)
            }));
        }

        // Everything on screen follows the numbers
        function render() {
            wordPart.hidden = mode !== "word";
            mathsPart.hidden = mode !== "maths";
            ownPart.hidden = mode !== "own";
            const word = byId[chosen];
            const close = nearest(words, word.vector, NEIGHBOURS, [word.id]);
            const parts = sum.map(function (id) { return byId[id]; });
            const result = wordMaths(words, parts[0], parts[1], parts[2]);
            const empty = own.every(function (x) { return x === 0; });
            const ownClose = empty ? [] : nearest(words, own, NEIGHBOURS);

            numbers.update(data.dims.map(function (dim, n) {
                return { labelKey: "lab.chatbot.mean.dim." + dim, value: word.vector[n], colorIndex: word.group };
            }));
            near.update(close.map(barOf));
            write(answer, tx("lab.chatbot.mean.answer", { word: nameOf(result.answer.word) }));
            write(answerSim, tx("lab.chatbot.mean.answerSim", { sim: percent(result.answer.sim, 1) }));
            candidates.update(result.list.map(barOf));
            ownEmpty.hidden = !empty;
            ownNear.update(ownClose.map(barOf));

            // The map: lines to the nearest words, the arrows of word maths, or your word
            const c = kit.colors();
            scene = { words: words, bounds: bounds, name: nameOf, chosen: null, focus: {}, points: [], lines: [], arrows: [] };
            let focus = "";
            if (mode === "word") {
                scene.chosen = word.id;
                scene.focus[word.id] = 2;
                close.forEach(function (item, i) {
                    scene.focus[item.word.id] = i === 0 ? 2 : 1;
                    scene.lines.push([word, item.word]);
                });
                focus = t("lab.chatbot.mean.describeWord", { word: nameOf(word), list: listOf(close) });
            } else if (mode === "maths") {
                // a → a − b (a place that is no word) → a − b + c, which lands next to the answer
                parts.concat(result.answer.word).forEach(function (part) { scene.focus[part.id] = 2; });
                const middle = { at: project(map, parts[0].vector.map(function (x, i) { return x - parts[1].vector[i]; })), label: nameOf(parts[0]) + " − " + nameOf(parts[1]) };
                const end = { at: project(map, result.vector) };
                scene.points.push(middle, end);
                scene.arrows.push({ from: parts[0], to: middle, color: c.danger, dashed: true }, { from: middle, to: end, color: c.success, dashed: false });
                focus = t("lab.chatbot.mean.describeMaths", { a: nameOf(parts[0]), b: nameOf(parts[1]), c: nameOf(parts[2]), answer: nameOf(result.answer.word) });
            } else if (!empty) {
                const mine = { at: project(map, own), label: t("lab.chatbot.mean.ownPoint") };
                scene.points.push(mine);
                ownClose.slice(0, 3).forEach(function (item, i) {
                    scene.focus[item.word.id] = i === 0 ? 2 : 1;
                    scene.lines.push([mine, item.word]);
                });
                focus = t("lab.chatbot.mean.describeOwn", { list: listOf(ownClose.slice(0, 3)) });
            }
            draw();
            mapView.describe(t("lab.chatbot.mean.describe", { count: A.plural("lab.chatbot.mean.wordCount", words.length), focus: focus }));

            // What's happening? Step 1: the word's biggest numbers ("animal 1, pet 1, big 0.45")
            const top = data.dims.map(function (dim, n) { return { dim: dim, value: word.vector[n] }; })
                .filter(function (item) { return item.value > 0; })
                .sort(function (p, q) { return q.value - p.value; })
                .slice(0, 3)
                .map(function (item) { return t("lab.chatbot.mean.dim." + item.dim) + " " + kit.number(item.value); });
            explain.setValues(0, { word: nameOf(word), top: top.join(", ") });
            explain.setValues(1, { word: nameOf(word), near: nameOf(close[0].word), sim: percent(close[0].sim, 1) });
            explain.setValues(2, {
                a: nameOf(parts[0]), b: nameOf(parts[1]), c: nameOf(parts[2]),
                answer: nameOf(result.answer.word), sim: percent(result.answer.sim, 1)
            });
            explain.setValues(3, { result: empty ? t("lab.chatbot.mean.step4Empty")
                : t("lab.chatbot.mean.step4Near", { near: nameOf(ownClose[0].word), sim: percent(ownClose[0].sim, 1) }) });
            explain.setStep(mode === "word" ? 1 : mode === "maths" ? 2 : 3);

            app.challenges.check({ robot: !empty && ownClose[0].word.id === "robot" && ownClose[0].sim >= ROBOT_GOAL });
        }

        return {
            element: root,
            show: function () {
                root.hidden = false;
                render();
            },
            hide: function () { root.hidden = true; },
            pause: function () {},
            resume: function () {},
            language: render,
            theme: render,
            destroy: function () { mapView.destroy(); }
        };
    }

    /* =========================================================
       11. VIEW 3: CONTEXT
       ========================================================= */
    function contextView(app) {
        const data = app.data;
        const root = el("div", "ch-view");
        const ui = kit.layout(root, { side: true });
        let pairId = data.sentences[0].id;
        let last = 0;                         // which of the two last words
        let layer = 1;
        let chosen = -1;                      // the word that looks (-1: the pronoun)
        let words = [];                       // { text (as shown), name (no comma), role }
        let pronoun = 0;
        let layers = null;                    // attention() of the sentence
        let shown = null;                     // the shares on the canvas now (they glide)
        let target = -1;                      // the word that gets the most attention (-1: an even split)
        let arc = null;                       // the glide
        let layout = null;

        function pair() {
            const sentences = data.sentences.filter(function (item) { return item.id === pairId; })[0];
            return sentences[A.lang] || sentences.en;
        }

        // ----- The parts -----
        const pairs = kit.segmented({
            labelKey: "lab.chatbot.ctx.sentence",
            options: data.sentences.map(function (item) { return { value: item.id, labelKey: "lab.chatbot.ctx.pair." + item.id }; }),
            value: pairId,
            onChange: function (id) {
                pairId = id;
                chosen = -1;
                build(false);
                kit.relabel(lastWord.element);
            }
        });
        const lastWord = kit.segmented({
            labelKey: "lab.chatbot.ctx.lastWord",
            options: [0, 1].map(function (i) { return { value: i, labelKey: function () { return pair().last[i][0]; } }; }),
            value: last,
            onChange: function (i) {
                last = i;
                build(true, true);
                say();
            }
        });
        const layerChoice = kit.segmented({
            labelKey: "lab.chatbot.ctx.layer",
            options: [{ value: 1, labelKey: "lab.chatbot.ctx.layer1" }, { value: 2, labelKey: "lab.chatbot.ctx.layer2" }],
            value: layer,
            onChange: function (n) {
                layer = n;
                render(true);
                say();
            }
        });
        const wordChoice = kit.select({
            labelKey: "lab.chatbot.ctx.word",
            options: [],
            onChange: function (i) {
                chosen = i;
                render(true);
            }
        });
        const view = kit.canvas(ui.main, { height: 196, labelKey: "lab.chatbot.ctx.canvas" });
        const summary = el("p", "ch-summary");
        ui.main.append(summary, textEl("p", "ch-small", "lab.chatbot.ctx.lookBack"));

        // ----- "Show the maths": the table of one word's scores, and its new numbers -----
        const mathsToggle = kit.toggle({ labelKey: "lab.chatbot.ctx.showMaths", onChange: function () { render(false); } });
        const maths = el("div", "ch-maths");
        const formula = el("p", "ch-small");
        const query = el("p", "ch-line");
        const table = el("table", "ch-table");
        const caption = el("caption");
        const headRow = el("tr");
        ["colWord", "colDot", "colScore", "colExp", "colWeight"].forEach(function (key, n) {
            const cell = textEl("th", n === 1 || n === 3 ? "ch-wide" : "", "lab.chatbot.ctx." + key);
            cell.scope = "col";
            headRow.appendChild(cell);
        });
        const head = el("thead");
        head.appendChild(headRow);
        const body = el("tbody");
        table.append(caption, head, body);
        const sumLine = el("p", "ch-line");
        const output = el("p", "ch-line");
        const newTitle = el("h4", "ch-title");
        const newBars = kit.bars(null, { max: 2, format: function (v) { return decimals(v, 2); } });
        maths.append(formula, query, table, sumLine, output, newTitle, newBars.element);

        const explain = kit.explain({ steps: [
            { key: "lab.chatbot.ctx.step1" }, { key: "lab.chatbot.ctx.step2" }, { key: "lab.chatbot.ctx.step3" },
            { key: "lab.chatbot.ctx.step4", values: { d: String(FEATURES.length) } }
        ] });
        explain.setText("lab.chatbot.ctx.handmade");
        ui.side.append(pairs.element, lastWord.element, layerChoice.element, wordChoice.element, mathsToggle.element);
        ui.bottom.append(maths, ideaLine("lab.chatbot.ctx.ideaLine", "transformer", "lab.chatbot.ctx.term"), explain.element);

        // A click on a chip makes that word look
        view.canvas.addEventListener("click", function (event) {
            if (!layout) return;
            const box = view.canvas.getBoundingClientRect();
            const x = event.clientX - box.left;
            const y = event.clientY - box.top;
            layout.chips.forEach(function (chip, i) {
                if (x >= chip.x && x <= chip.x + chip.w && y >= chip.y && y <= chip.y + chip.h) {
                    chosen = i;
                    wordChoice.set(i);
                    render(true);
                }
            });
        });
        view.onResize(function () {
            layout = null;
            draw();
        });

        // The sentence in the current language, and its attention in both layers. The chosen
        // word stays chosen: at its place when only the last word was swapped (keepPlace), or
        // as the first word with the same role after a language switch (the words differ).
        function build(glide, keepPlace) {
            const role = words[chosen] ? words[chosen].role : "pronoun";
            const place = chosen;
            const sentence = pair();
            words = sentence.words.concat([[sentence.last[last][0] + sentence.end, sentence.last[last][1]]]).map(function (word) {
                return { text: word[0], name: word[0].replace(/[.,!?]+$/, ""), role: word[1] };
            });
            pronoun = words.map(function (word) { return word.role; }).indexOf("pronoun");
            const same = words.map(function (word) { return word.role; }).indexOf(role);
            if (keepPlace && place >= 0 && place < words.length) chosen = place;
            else chosen = chosen === -1 || same === -1 ? pronoun : same;
            layers = attention(words.map(function (word) { return word.role; }));
            wordChoice.setOptions(words.map(function (word, i) { return { value: i, label: word.name }; }), chosen);
            layout = null;
            render(glide);
        }

        function draw() {
            if (!view.width || !shown) return;
            if (!layout || layout.chosen !== chosen) {
                layout = chipLayout(view.ctx, words.map(function (word) { return word.text; }), chosen, view.width);
                if (view.box.style.height !== layout.height + "px") view.box.style.height = layout.height + "px";
            }
            drawAttention(view, { layout: layout, texts: words.map(function (word) { return word.text; }), chosen: chosen, weights: shown, top: target });
        }

        function topOf(list) {
            return list.indexOf(Math.max.apply(null, list));
        }

        // "box 72%, robot 3%, …": the biggest shares first
        function sharesText(row, count) {
            return row.map(function (w, j) { return { w: w, j: j }; })
                .sort(function (p, q) { return q.w - p.w; })
                .slice(0, count)
                .map(function (item) { return words[item.j].name + " " + percent(item.w); }).join(", ");
        }

        // "describes the doer 3, pronoun 1"
        function featureText(vector) {
            const parts = [];
            vector.forEach(function (x, n) {
                if (Math.abs(x) >= 0.005) parts.push(t("lab.chatbot.ctx.feature." + FEATURES[n]) + " " + decimals(x, 2));
            });
            return parts.length ? parts.join(", ") : t("lab.chatbot.ctx.nothing");
        }

        // A word whose query is all zeros asks nothing: every score is 0 and its attention is
        // split evenly, so no word may be named as the one it points to
        function asksNothing(result) {
            return result.q[chosen].every(function (x) { return x === 0; });
        }

        function say() {
            const result = layers[layer - 1];
            const row = result.weights[chosen];
            const top = topOf(row);
            if (asksNothing(result)) app.ctx.announce(t("lab.chatbot.ctx.saidEven", { layer: String(layer), word: words[chosen].name }));
            else app.ctx.announce(t("lab.chatbot.ctx.said", { layer: String(layer), word: words[chosen].name, target: words[top].name, weight: percent(row[top]) }));
        }

        function render(glide) {
            const result = layers[layer - 1];
            const row = result.weights[chosen];
            const even = asksNothing(result);
            const top = even ? -1 : topOf(row);
            const name = words[chosen].name;
            target = top;
            // The lines glide from the old shares to the new ones (or jump there)
            if (arc) arc.cancel();
            arc = null;
            if (glide && shown && shown.length === row.length) {
                const from = shown.slice();
                arc = tween(ARC_MS, function (share) {
                    shown = from.map(function (w, j) { return w + (row[j] - w) * share; });
                    draw();
                });
            } else {
                shown = row;
                draw();
            }
            if (even) write(summary, tx("lab.chatbot.ctx.summaryEven", { layer: String(layer), word: name, weight: percent(row[0]) }));
            else write(summary, tx("lab.chatbot.ctx.summary", { layer: String(layer), word: name, weight: percent(row[top]), target: words[top].name }));
            view.describe(t("lab.chatbot.ctx.describe", {
                sentence: words.map(function (word) { return word.text; }).join(" "), layer: String(layer), word: name,
                list: even ? t("lab.chatbot.ctx.evenList", { weight: percent(row[0]) }) : sharesText(row, 3)
            }));

            maths.hidden = !mathsToggle.checked();
            if (!maths.hidden) {
                write(formula, tx("lab.chatbot.ctx.formula", { d: String(FEATURES.length), word: name }));
                write(query, !even ? tx("lab.chatbot.ctx.query", { word: name, list: featureText(result.q[chosen]) }) : tx("lab.chatbot.ctx.noQuery", { word: name }));
                write(caption, tx("lab.chatbot.ctx.tableCaption", { word: name, layer: String(layer) }));
                body.textContent = "";
                words.forEach(function (word, j) {
                    const tableRow = el("tr", j === top ? "is-top" : "");
                    const score = result.scores[chosen][j];
                    [word.name, decimals(result.dots[chosen][j], 2), decimals(score, 2), decimals(Math.exp(score), 2), percent(row[j], 1)].forEach(function (text, n) {
                        const cell = el(n === 0 ? "th" : "td", n === 1 || n === 3 ? "ch-wide" : "", text);
                        if (n === 0) cell.scope = "row";
                        tableRow.appendChild(cell);
                    });
                    body.appendChild(tableRow);
                });
                write(sumLine, tx("lab.chatbot.ctx.sum", { sum: percent(row.reduce(function (sum, w) { return sum + w; }, 0), 1) }));
                write(output, tx("lab.chatbot.ctx.output", { list: featureText(result.outputs[chosen]) }));
                write(newTitle, tx("lab.chatbot.ctx.newVector", { word: name }));
                newBars.update(FEATURES.map(function (feature, n) {
                    return { labelKey: "lab.chatbot.ctx.feature." + feature, value: result.next[chosen][n], colorIndex: n };
                }));
            }

            // What's happening? Steps 2 and 3 follow the pronoun
            const first = layers[0].weights[pronoun];
            const second = layers[1].weights[pronoun];
            explain.setValues(1, { pronoun: words[pronoun].name, adjective: words[words.length - 1].name, weight1: percent(first[words.length - 1]) });
            explain.setValues(2, { pronoun: words[pronoun].name, target: words[topOf(second)].name, weight2: percent(second[topOf(second)]) });
            explain.setStep(!maths.hidden ? 3 : layer);

            const doer = words.map(function (word) { return word.role; }).indexOf("doer");
            app.challenges.check({ itRobot: pairId === "robot" && layer === 2 && chosen === pronoun && second[doer] > 0.5 });
        }

        return {
            element: root,
            show: function () {
                root.hidden = false;
                if (!layers) build(false);
                else render(false);
            },
            hide: function () {
                if (arc) arc.finish();
                root.hidden = true;
            },
            pause: function () { if (arc) arc.finish(); },
            resume: function () {},
            language: function () {
                if (arc) arc.cancel();        // build() draws the new sentence at once
                build(false);
            },
            theme: draw,
            destroy: function () {
                if (arc) arc.cancel();
                view.destroy();
            }
        };
    }

    /* =========================================================
       12. VIEW 4: NEXT WORD
       ========================================================= */
    function nextView(app) {
        const data = app.data;
        const root = el("div", "ch-view");
        const ui = kit.layout(root, { side: true });
        let promptIndex = 0;
        let temperature = TEMPERATURE.value;
        let topK = 0;
        let topP = 1;
        let dice = kit.rng(DICE_SEED);
        let rolls = [];                       // { word (its number), u (where the dice landed), boring }
        let endings = null;                   // "Write 20 endings": { counts, chances }
        let boringDone = false;               // challenge 4, first half
        let needle = null;                    // the needle's run, only while it runs
        let needleAt = 0;
        let probs = null;                     // chances() of the words now
        let step = 0;                         // the step of "What's happening?" last touched

        function prompt() {
            return data.prompts[promptIndex];
        }

        function word(i) {
            return prompt().words[i][A.lang === "ru" ? 1 : 0];
        }

        function boring() {
            return temperature === 0 || topK === 1;
        }

        // ----- The prompt and the dice -----
        const prompts = kit.chips({
            labelKey: "lab.chatbot.next.prompt",
            options: data.prompts.map(function (item, i) { return { value: i, labelKey: "lab.chatbot.next.prompt." + item.id }; }),
            value: promptIndex,
            onChange: function (i) {
                promptIndex = i;
                dice = kit.rng(DICE_SEED + i);
                clear();
            }
        });
        const promptLine = el("p", "ch-prompt");
        const bar = el("div", "ch-dice");
        bar.setAttribute("role", "img");
        bar.setAttribute("data-i18n-attr", "aria-label:lab.chatbot.next.diceLabel");
        bar.setAttribute("aria-label", t("lab.chatbot.next.diceLabel"));
        const parts = data.prompts[0].words.map(function () { return bar.appendChild(el("span", "ch-dice-part")); });
        const needleMark = bar.appendChild(el("span", "ch-needle"));
        const scale = el("div", "ch-dice-scale");
        scale.setAttribute("aria-hidden", "true");
        scale.append(el("span", "", "0"), el("span", "", "1"));
        const rollButton = kit.button("lab.chatbot.next.roll", { icon: "dice", variant: "primary", onClick: roll });
        const undoButton = kit.button("lab.chatbot.next.undo", { icon: "undo", onClick: undo });
        const twentyButton = kit.button("lab.chatbot.next.twenty", { icon: "sparkle", onClick: writeEndings });
        const newDice = kit.button("lab.chatbot.next.newDice", {
            icon: "shuffle",
            variant: "subtle",
            onClick: function () {
                dice = kit.rng(kit.newSeed());
                clear();
            }
        });
        const rollLine = el("p", "ch-summary");
        const history = el("p", "ch-small");
        const endingBars = kit.bars(null, { max: ENDINGS, format: function (n) { return t("lab.chatbot.next.endingsCount", { n: kit.number(n), max: kit.number(ENDINGS) }); } });
        const endingPanel = panel("lab.chatbot.next.endings", [endingBars]);

        // ----- The settings, and the chances after each step -----
        const sliders = [
            kit.slider({
                labelKey: "lab.chatbot.next.temperature", min: TEMPERATURE.min, max: TEMPERATURE.max, step: TEMPERATURE.step,
                value: temperature, hintKey: "lab.chatbot.next.temperatureHint",
                format: function (v) { return decimals(v, 2); },
                onInput: function (v) { change(1, function () { temperature = v; }); }
            }),
            kit.slider({
                labelKey: "lab.chatbot.next.topK", min: 0, max: TOP_K_MAX, step: 1, value: topK, hintKey: "lab.chatbot.next.topKHint",
                format: function (v) { return v === 0 ? t("lab.chatbot.next.off") : String(v); },
                onInput: function (v) { change(2, function () { topK = v; }); }
            }),
            kit.slider({
                labelKey: "lab.chatbot.next.topP", min: TOP_P.min, max: 1, step: TOP_P.step, value: topP, hintKey: "lab.chatbot.next.topPHint",
                format: function (v) { return v >= 1 ? t("lab.chatbot.next.off") : decimals(v, 2); },
                onInput: function (v) { change(2, function () { topP = v; }); }
            })
        ];
        const steps = ["panel1", "panel2", "panel3"].map(function (key) {
            const list = kit.bars(null, { max: 1, format: function (v) { return percent(v, 1); } });
            const sum = el("p", "ch-small ch-sum");
            return { bars: list, sum: sum, element: panel("lab.chatbot.next." + key, [list, sum]) };
        });
        const stepRow = el("div", "ch-steps");
        steps.forEach(function (item) { stepRow.appendChild(item.element); });

        const link = el("p", "ch-idea");
        const anchor = textEl("a", "", "lab.chatbot.next.predictorLink");
        anchor.href = "#lab/predictor";
        link.append(textEl("span", "", "lab.chatbot.next.predictor"), " ", anchor);
        const explain = kit.explain({ steps: [
            { key: "lab.chatbot.next.step1" }, { key: "lab.chatbot.next.step2" }, { key: "lab.chatbot.next.step3" },
            { key: "lab.chatbot.next.step4" }, { key: "lab.chatbot.next.step5" }
        ] });
        explain.setText("lab.chatbot.next.wholeWords");

        ui.top.appendChild(prompts.element);
        ui.main.append(promptLine, panel("lab.chatbot.next.dice", [bar, scale, kit.toolbar([rollButton, undoButton, twentyButton, newDice]), rollLine, history]), endingPanel);
        ui.side.append(sliders[0].element, sliders[1].element, sliders[2].element);
        ui.bottom.append(stepRow, link, ideaLine("lab.chatbot.next.ideaLine", "llm", "lab.chatbot.next.term"), explain.element);

        // A setting changed: the old 20 endings no longer match it
        function change(explainStep, apply) {
            apply();
            step = explainStep;
            endings = null;
            render();
        }

        function clear() {
            if (needle) needle.cancel();
            needle = null;
            rolls = [];
            endings = null;
            needleAt = 0;
            step = 0;
            render();
        }

        function roll() {
            if (needle) needle.finish();
            const u = dice.next();
            const chosen = pick(probs.final, u);
            const from = needleAt;
            needleAt = u;
            rolls.push({ word: chosen, u: u, boring: boring() });
            const lastRolls = rolls.slice(-BORING_ROLLS);
            if (lastRolls.length === BORING_ROLLS && lastRolls.every(function (r) { return r.boring && r.word === chosen; })) boringDone = true;
            step = 3;
            // The needle runs to u; the word shows when it gets there. With animations off the
            // run ends inside tween() itself, before tween() returns: then there is no run to
            // keep (a finished run kept in `needle` would make render() wait for it forever).
            const run = tween(ROLL_MS, function (share) { needleMark.style.left = ((from + (u - from) * share) * 100).toFixed(2) + "%"; }, function () {
                needle = null;
                render();
                app.ctx.announce(t("lab.chatbot.next.said", { word: word(chosen) }));
            });
            needle = run.running() ? run : null;
            if (needle) render();
        }

        function undo() {
            if (needle) needle.finish();
            rolls.pop();
            needleAt = rolls.length ? rolls[rolls.length - 1].u : 0;
            // Undo may leave the focus on a button that is about to be disabled: Roll takes it
            if (!rolls.length && document.activeElement === undoButton.element) rollButton.element.focus();
            render();
        }

        function writeEndings() {
            if (needle) needle.finish();
            const counts = probs.final.map(function () { return 0; });
            for (let n = 0; n < ENDINGS; n++) counts[pick(probs.final, dice.next())] += 1;
            endings = { counts: counts, chances: probs.final.slice() };
            if (boring() && counts.indexOf(ENDINGS) !== -1) boringDone = true;     // 20 times the same word
            step = 3;
            render();
            const most = counts.indexOf(Math.max.apply(null, counts));
            app.ctx.announce(t("lab.chatbot.next.endingsSaid", { word: word(most), times: A.plural("lab.chatbot.tok.times", counts[most]) }));
        }

        // Everything on screen follows the numbers
        function render() {
            const item = prompt();
            const scores = item.words.map(function (w) { return w[2]; });
            probs = chances(scores, temperature, topK, topP);
            const last = rolls[rolls.length - 1];
            const shownRoll = needle ? rolls[rolls.length - 2] : last;     // while the needle runs

            // The three steps, each adding up to 100%
            [probs.plain, probs.warm, probs.final].forEach(function (list, n) {
                steps[n].bars.update(list.map(function (p, i) {
                    const extra = n === 0 ? ' <span class="ch-score">' + tx("lab.chatbot.next.score", { score: decimals(scores[i], 1) }) + "</span>" : "";
                    return { label: A.escapeHTML(word(i)) + extra, value: p, colorIndex: i };
                }));
                write(steps[n].sum, tx("lab.chatbot.next.sum", { sum: percent(list.reduce(function (sum, p) { return sum + p; }, 0)) }));
            });

            // The dice: one bar made of the final chances
            parts.forEach(function (part, i) {
                const share = probs.final[i];
                part.style.width = (share * 100).toFixed(3) + "%";
                part.style.background = "var(--lk-series-" + (i + 1) + ")";
                write(part, share >= LABEL_SHARE ? word(i) : "");
                part.classList.toggle("is-picked", Boolean(shownRoll) && shownRoll.word === i);
            });
            needleMark.hidden = !rolls.length;
            if (!needle) needleMark.style.left = (needleAt * 100).toFixed(2) + "%";

            promptLine.textContent = item[A.lang] || item.en;
            promptLine.append(" ", el("span", shownRoll ? "ch-prompt-next" : "ch-prompt-gap", shownRoll ? word(shownRoll.word) : "…"));
            write(rollLine, shownRoll ? tx("lab.chatbot.next.rolled", { u: decimals(shownRoll.u, 2), word: word(shownRoll.word) }) : t("lab.chatbot.next.rollHint"));
            const done = needle ? rolls.slice(0, -1) : rolls;
            history.hidden = !done.length;
            write(history, tx("lab.chatbot.next.history", { list: done.map(function (r) { return word(r.word); }).join(", ") }));
            undoButton.setDisabled(!rolls.length);

            endingPanel.hidden = !endings;
            if (endings) {
                endingBars.update(endings.counts.map(function (n, i) {
                    const chance = ' <span class="ch-score">' + tx("lab.chatbot.next.endingsChance", { p: percent(endings.chances[i]) }) + "</span>";
                    return { label: A.escapeHTML(word(i)) + chance, value: n, colorIndex: i };
                }).filter(function (row, i) { return endings.counts[i] > 0 || endings.chances[i] > 0; }));
            }

            // What's happening?
            const kept = probs.final.filter(function (p) { return p > 0; }).length;
            explain.setValues(0, { top: word(0), p: percent(probs.plain[0]) });
            explain.setValues(1, { temp: decimals(temperature, 2) });
            explain.setValues(2, { kept: kept, total: scores.length });
            explain.setValues(3, { last: shownRoll ? t("lab.chatbot.next.step4Last", { u: decimals(shownRoll.u, 2), word: word(shownRoll.word) }) : t("lab.chatbot.next.step4None") });
            explain.setValues(4, { text: (item[A.lang] || item.en) + " " + (shownRoll ? word(shownRoll.word) : "…") });
            explain.setStep(step);

            app.challenges.check({ boringSilly: boringDone && probs.final[scores.length - 1] >= SILLY_GOAL });
        }

        return {
            element: root,
            show: function () {
                root.hidden = false;
                render();
            },
            hide: function () {
                if (needle) needle.finish();
                root.hidden = true;
            },
            pause: function () { if (needle) needle.finish(); },
            resume: function () {},
            language: render,
            theme: function () {},
            destroy: function () { if (needle) needle.cancel(); }
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

    const BUILDERS = { tokens: tokensView, meaning: meaningView, context: contextView, next: nextView };

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
            splitWords: splitWords, tokenizer: tokenizer, encode: encode,
            cosine: cosine, nearest: nearest, wordMaths: wordMaths, pca: pca, project: project, makeWords: makeWords,
            softmax: softmax, attention: attention, FEATURES: FEATURES,
            withTemperature: withTemperature, cutTail: cutTail, chances: chances, pick: pick
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
