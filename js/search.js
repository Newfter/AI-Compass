/* =========================================================
   AI COMPASS — SITE SEARCH (AICompass.search)
   Finds things in the site's own texts, in the current language:
   lesson sections, glossary terms, history milestones, quiz
   questions, lab experiments and the parts of the page. The Ctrl+K
   palette shows what it finds, and Compass Bot answers from it.

   How it works, in short:
   - Sources ("adapters") turn the content tables into documents.
     They read A.content and the features' APIs, never the page.
   - The first search builds an index for the current language: every
     word, cut down to its stem ("networks" → "network", "сетями" →
     "сет"), with the documents it is in. After a language change, the
     next search builds the other language too; both are kept.
   - A query is cut the same way and extended with synonyms, typo fixes
     and (while you type) word completions. Then the documents are scored
     with BM25, the formula classic search engines use.
   - Nothing leaves the browser: no network, no saved data.

   The API (AICompass.search):
     query(text, options) -> [result]   finds documents. options:
         limit    how many results (8 by default)
         types    only these sources, e.g. ["glossary", "lessons"]
         prefix   false when the text is complete; by default the last
                  word may be the start of a word you are still typing
         boost    { type: factor }: scores of that source times the factor,
                  e.g. { timeline: 1.4 } for a "who invented...?" question
       A result: { type, id, title, titleHTML, snippet, section, label,
                   icon, keepOverlays, score, match, open(from) }
         snippet, titleHTML  safe HTML: the text escaped, then the found
                             words wrapped in <mark>
         section             where it is ("Lesson 3 · Neural Networks")
         label               a short name for a link ("Glossary · Token")
         match               0..1: how much of the query it covers
         open(from)          goes there; "from" says who asked ("palette")
       The list also has "switched": the text that was searched instead
       when only the other keyboard layout found something ("ntcn" →
       "тест"), otherwise ""; and "words": how many words of the query
       counted (little words like "the" don't).
     register(type, adapter)   adds a source, or replaces the one of that type
     ready() -> Promise        builds the index a little at a time, when the
                               page is idle; then every query is instant
                               (query() itself finishes a build that is not done)
     open(type, id, from)      opens a document; false if there is no such one
     passage(type, id, options) -> { text, from, to, count } or null
                               1-3 whole sentences of a document, for Compass Bot:
                               the best ones for options.query (a sentence that
                               points back, "This is called bias.", never starts them),
                               or sentences options.from (up to options.to) of options.count
     document(type, id) -> { type, id, title, section, label, icon, text } or null
     refresh()                 forgets the indexes: the next query builds them again
     info() -> { lang, documents, words, buildMs, phases, queryMs, types }
                               what the current index holds (for tests)

   A source (adapter) is a function that returns the documents, or an object
   { icon, keepOverlays, version(), documents() }:
     version()    a number or text that changes when the documents change
                  (their count, for example): the index is built again then.
                  A feature that registers late does the same.
     documents()  [{ id, title, section, text, keywords, name, heading,
                     label, icon, weight, open() }] in the current language:
       id         unique within the source
       title      the result's title (each word counts x3)
       name       a term's name and its other names (x4, instead of the title)
       heading    the heading it sits under, like the lesson of a section (x2)
       text       the body (x1); snippets and passages come from it
       keywords   more words to find it by (x1), never shown
       section    where it is, shown with the title
       label      a short name for links (the section, if not given)
       weight     its score is multiplied by this (1 if not given)
       open()     goes there
   The built-in sources (section 8):
     lessons    every section of every lesson, and each lesson's key ideas
                ("lessons.l<n>.s<k>.h/.p/.note", A.lessons for the count):
                opens the lesson (at that section once A.lessons supports it)
     glossary   every term (A.content "glossary": name, other names,
                definition, example): opens the term
     timeline   every milestone (A.content "timeline": year, title, text,
                why it matters): goes to the milestone on the timeline
     quiz       every question with its explanation (A.content "quiz"):
                opens the lesson it belongs to, the timeline or the quiz
     lab        every experiment in the lab catalogue (A.lab.list() and
                A.content "lab.catalogue": title, hook, big idea), only if
                the lab has a catalogue: opens the experiment
     pages      the hero, About and the section headers (the "pages" list
                in js/content/search.js): goes to the section

   Events: A.track("search.open", { type, id, from }) when a result is opened.
   The texts and the word lists (synonyms, little words to skip) are in
   js/content/search.js.

   Sections of this file:
    1. Settings
    2. Small helpers
    3. Words: cleaning, splitting, stems
    4. Sources
    5. Building the index (a little at a time)
    6. Understanding a query
    7. Scoring
    8. Snippets and passages
    9. The built-in sources
   10. Public API
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const lists = A && A.content.get("search");
    if (!A || !lists) return;

    const t = A.t;
    const esc = A.escapeHTML;

    /* =========================================================
       1. SETTINGS
       ========================================================= */

    // ----- Scoring with BM25 -----
    // A document gets points for every query word it contains: more for rare
    // words (found in few documents) and for words that come up often in it;
    // but each repeat counts less than the one before, and long texts are
    // scaled down, so a short definition can beat a long lesson.
    const K1 = 1.2;             // how fast repeats of a word stop adding points (the usual value)
    const B = 0.75;             // how much long texts are scaled down (0: not at all, 1: fully)
    const BOOST = {             // one word counts this many times, depending on where it is
        name: 4,                // a glossary term's name ("Token")
        title: 3,               // the result's title
        heading: 2,             // the heading it sits under
        text: 1,
        keywords: 1
    };
    const FIELDS = Object.keys(BOOST);
    // Words found another way count a little less than the words you typed
    const WEIGHT = {
        exact: 1,
        synonym: 0.8,           // "нейросеть" for "neural network"
        typo: 0.7,              // "neural" for "nueral"
        prefix: 0.7             // "neuron" for "neu", while you are typing
    };
    const PHRASE_BONUS = 0.3;   // +30% when the query's words stand together, in the same order
    const PHRASE_GAP = 2;       // "together": at most one other word between them
    const PHRASE_CHECKS = 40;   // only the best 40 documents are checked for that
    const SUMMARY_WEIGHT = 0.8; // a lesson's key ideas repeat the words of its sections in a few
                                // lines: they count 80 %, so the section that explains comes first

    // ----- Typos, completions, stems -----
    const TYPO_MIN = 5;         // a word of 5+ letters may have a typo: one letter wrong,
                                // missing or extra, or two letters swapped
    const TYPO_FIXES = 3;       // at most 3 site words are tried for one typo
    const TYPO_BATCH = 300;     // words added to the typo index in one step of the build
    const PREFIX_MIN = 3;       // the last word is completed once it has 3 letters
    const PREFIX_MAX = 24;      // at most 24 completions ("neu" → neural, neuron, ...)
    const STEM_MIN = 3;         // a stem keeps at least 3 letters
    const LONG_STEM = 6;        // "labelled" → "label": "ll" is made single only in long words
    const QUERY_WORDS = 12;     // only the first 12 words of a query count

    // ----- Results -----
    const LIMIT = 8;            // results when the caller does not say
    const SNIPPET_MAX = 150;    // letters in a snippet: a longer sentence is cut around the match,
    const SNIPPET_LATE = 60;    // ...and so is one whose first match comes after this many letters,
    const SNIPPET_LEAD = 24;    // ...keeping about this many letters before the first match
    const PASSAGE_MAX = 260;    // letters in a passage for the bot (whole sentences only;
                                // "This is called bias." may go past it: see passageOf)
    const PASSAGE_SENTENCES = 3;

    // ----- Building a little at a time (see ready()) -----
    const SLICE_MS = 8;         // work at most 8 ms in a row, so the page stays smooth
    const SLICE_WAIT_MS = 50;   // the next step waits for an idle moment, but at most 50 ms

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */

    // A.content.set() merges objects, so a list stored there can come back as
    // { 0: ..., 1: ... }. This turns either form (or nothing) into an array.
    function listOf(value) {
        if (Array.isArray(value)) return value;
        if (!value || typeof value !== "object") return [];
        return Object.keys(value).filter(function (key) { return /^\d+$/.test(key); })
            .sort(function (a, b) { return a - b; })
            .map(function (key) { return value[key]; });
    }

    // The texts of some keys, joined with a space (missing keys are skipped)
    function texts(keys) {
        return listOf(keys).filter(function (key) { return A.has(key); })
            .map(function (key) { return t(key); }).join(" ");
    }

    /* =========================================================
       3. WORDS: CLEANING, SPLITTING, STEMS
       ========================================================= */

    // A word is a run of letters and digits, in any alphabet. A hyphenated word
    // ("чат-бот", "real-world") counts as its parts; documents also keep it
    // written together ("чатбот"), so both spellings find it.
    const WORD = /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu;
    const CYRILLIC = /[а-я]/;
    const DIGIT = /\d/;
    const TAG = /<\/?[a-z][^>]*>/gi;              // an HTML tag (not "a < b")
    // Letters that are written in another way before the words are split:
    // "ё" is "е", apostrophes go (network's → networks, don't → dont), other hyphens are "-"
    const SWAP = /[ё'’ʼ`‐‑]/g;
    const SWAP_TO = { "ё": "е", "'": "", "’": "", "ʼ": "", "`": "", "‐": "-", "‑": "-" };

    function swap(letter) {
        return SWAP_TO[letter];
    }

    // Lower case, with the letters above swapped
    function clean(text) {
        return String(text || "").toLowerCase().replace(SWAP, swap);
    }

    // Texts may hold a little HTML (<strong>, <em>, <kbd>): only the words count
    function plain(text) {
        const value = String(text || "");
        return (value.indexOf("<") === -1 ? value : value.replace(TAG, "")).replace(/\s+/g, " ").trim();
    }

    // The words of a text, cleaned. joined: also hyphenated words written together.
    function split(text, joined) {
        const found = clean(text).match(WORD) || [];
        const out = [];
        for (let i = 0; i < found.length; i++) {
            const word = found[i];
            if (word.indexOf("-") === -1) {
                out.push(word);
                continue;
            }
            const parts = word.split("-");
            out.push.apply(out, parts);
            if (joined) out.push(parts.join(""));
        }
        return out;
    }

    // Little words that are skipped: "the", "что" (js/content/search.js)
    const STOP = new Set(listOf(lists.stopWords && lists.stopWords.en)
        .concat(listOf(lists.stopWords && lists.stopWords.ru)).map(clean));

    // Words that point back to the sentence before: "This is called bias." (section 8)
    const LEANS_BACK = new Set(listOf(lists.leansBack && lists.leansBack.en)
        .concat(listOf(lists.leansBack && lists.leansBack.ru)).map(clean));

    // ----- Stems: the end of a word is cut off, so different forms match -----
    // This is a light version of what search engines do. It doesn't need to be
    // perfect: the query and the texts are cut the same way, so they still meet.

    // English: first a plural ending, then one suffix, then a silent "e"
    const EN_KEEP = new Set([          // words that only look like they have an ending
        "bias", "news", "always", "series", "species", "lens", "canvas", "alias", "atlas",
        "apply", "reply", "supply", "only", "early", "family"
    ]);
    const EN_SUFFIXES = [              // the first one that fits is cut (and "add" is added)
        { end: "ation", add: "ate" },                  // generation → generate
        { end: "tion", add: "t" },                     // prediction → predict
        { end: "ied", add: "y" },                      // studied → study
        { end: "ing", add: "", undouble: true },       // learning → learn, running → run
        { end: "ed", add: "", undouble: true },        // trained → train, stopped → stop
        { end: "ly", add: "" },                        // quickly → quick
        { end: "er", add: "", undouble: true }         // computer → comput(e), bigger → big
    ];

    const DOUBLES = "bdfgmnprt";        // these letters, doubled at the end, become single

    function stemEnglish(word) {
        if (word.length <= STEM_MIN || EN_KEEP.has(word)) return word;
        let w = word;
        // 1. Plurals: studies → study, classes → class, boxes → box, networks → network
        //    (but not "bus", "this", "class": an "s" after s, u or i stays)
        if (w.endsWith("ies") && w.length > STEM_MIN + 2) w = w.slice(0, -3) + "y";
        else if (w.endsWith("sses")) w = w.slice(0, -2);
        else if (w.endsWith("xes") || w.endsWith("ches") || w.endsWith("shes") || w.endsWith("zzes")) w = w.slice(0, -2);
        else if (w.endsWith("s") && "sui".indexOf(w.charAt(w.length - 2)) === -1) w = w.slice(0, -1);
        if (EN_KEEP.has(w)) return w;                  // applies → apply (and not "app")
        // 2. One suffix, if at least 3 letters stay
        for (let i = 0; i < EN_SUFFIXES.length; i++) {
            const rule = EN_SUFFIXES[i];
            if (w.length - rule.end.length >= STEM_MIN && w.endsWith(rule.end)) {
                w = w.slice(0, -rule.end.length) + rule.add;
                // a doubled last letter becomes single: runn → run, labell → label
                const last = w.charAt(w.length - 1);
                if (rule.undouble && last === w.charAt(w.length - 2) &&
                    (DOUBLES.indexOf(last) !== -1 || (last === "l" && w.length >= LONG_STEM))) {
                    w = w.slice(0, -1);
                }
                break;
            }
        }
        // 3. A silent "e": make → mak, so "make" and "making" meet
        if (w.length > STEM_MIN && w.endsWith("e")) w = w.slice(0, -1);
        return w;
    }

    // Russian: "ся" goes, then one ending: the longest that leaves 3+ letters
    // (обучение, обучения, обучать → обуч; нейросетями, нейросеть → нейросет)
    const RU_REFLEXIVE = ["ся", "сь"];             // учится → учит
    const RU_ENDINGS = [
        // nouns made from adjectives and verbs: сложность, обучение, распознавание
        "остями", "остям", "остях", "остью", "остей", "ость", "ости",
        "ениями", "ениям", "ениях", "ением", "ение", "ения", "ению", "ении", "ений",
        "аниями", "аниям", "аниях", "анием", "ание", "ания", "анию", "ании", "аний",
        // adjectives: искусственного, машинному, нейронными, языковая
        "ого", "его", "ому", "ему", "ыми", "ими",
        "ая", "яя", "ое", "ее", "ые", "ие", "ый", "ий", "ой", "ую", "юю", "ых", "их", "ым", "им",
        // nouns: моделями, данных, сетью, токенов
        "ами", "ями", "иям", "иях", "ией", "ием", "ах", "ях", "ам", "ям", "ов", "ев", "ей",
        "ом", "ию", "ия", "ии", "ью", "ья", "ье",
        // verbs: работает, обучать, учить
        "ает", "яет", "ует", "ают", "яют", "уют", "ать", "ять", "ить", "ешь", "ишь", "ете", "ите",
        // one letter
        "а", "я", "ы", "и", "у", "ю", "е", "о", "ь", "й"
    ];
    // The endings by their length, so a word is compared with each length only once
    const RU_BY_LENGTH = [];
    RU_ENDINGS.forEach(function (end) {
        (RU_BY_LENGTH[end.length] = RU_BY_LENGTH[end.length] || new Set()).add(end);
    });

    function stemRussian(word) {
        let w = word;
        for (let i = 0; i < RU_REFLEXIVE.length; i++) {
            if (w.length - RU_REFLEXIVE[i].length > STEM_MIN && w.endsWith(RU_REFLEXIVE[i])) {
                w = w.slice(0, -RU_REFLEXIVE[i].length);
                break;
            }
        }
        for (let n = Math.min(RU_BY_LENGTH.length - 1, w.length - STEM_MIN); n > 0; n--) {
            if (RU_BY_LENGTH[n] && RU_BY_LENGTH[n].has(w.slice(-n))) return w.slice(0, -n);
        }
        return w;
    }

    const stemCache = new Map();       // word → stem: the same words come up again and again

    function stem(word) {
        let result = stemCache.get(word);
        if (result === undefined) {
            if (DIGIT.test(word)) result = word;                    // "3", "gpt4" stay as they are
            else if (CYRILLIC.test(word)) result = stemRussian(word);
            else result = stemEnglish(word);
            stemCache.set(word, result);
        }
        return result;
    }

    // True when two words differ by one letter: one wrong, missing or extra,
    // or two neighbours swapped ("nueral" / "neural")
    function oneEditApart(a, b) {
        if (a === b) return true;
        if (Math.abs(a.length - b.length) > 1) return false;
        let i = 0;
        while (i < a.length && i < b.length && a[i] === b[i]) i++;
        if (a.length === b.length) {
            if (a.slice(i + 1) === b.slice(i + 1)) return true;                   // one letter wrong
            return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2);
        }
        return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
    }

    /* =========================================================
       4. SOURCES
       ========================================================= */
    const sources = [];        // { type, icon, keepOverlays, version, documents }, in the order added
    let changes = 0;           // goes up when a source or a feature arrives: the index is rebuilt

    function register(type, adapter) {
        if (!type || !adapter) return false;
        const spec = typeof adapter === "function" ? { documents: adapter } : adapter;
        if (typeof spec.documents !== "function") return false;
        const source = {
            type: String(type),
            icon: spec.icon || "🔎",
            keepOverlays: spec.keepOverlays,
            version: typeof spec.version === "function" ? spec.version : function () { return 0; },
            documents: spec.documents
        };
        const at = sources.findIndex(function (item) { return item.type === source.type; });
        if (at === -1) sources.push(source);
        else sources[at] = source;
        changes++;
        return true;
    }

    // A feature that registers late (the lab's catalogue, for example) may bring documents
    A.on("feature", function () { changes++; });

    // Changes whenever the documents may have changed: the index is out of date then
    function signature() {
        return changes + "|" + sources.map(function (source) {
            return String(A.util.attempt(source.version, "?"));
        }).join("|");
    }

    /* =========================================================
       5. BUILDING THE INDEX (A LITTLE AT A TIME)
       One index per language:
         docs       every document, its words cut to stems, field by field
         postings   stem → { idf, docs: [document numbers], weights: [...] }
                    idf: how rare the word is; weight: how much it counts
                    in that document (BM25F: boost / length of the field)
         words      every word as written (cleaned) → its stem
         sorted     the same words in alphabetical order, for completions
         typos      every word of 5+ letters with one letter left out → the
                    word (or words) it came from ("neral" → "neural"), to fix
                    typos quickly
       The build is a list of small tasks. ready() runs them a few at a time
       when the page is idle; query() runs all that are left at once.
       ========================================================= */
    const indexes = {};        // lang → the finished index
    let builder = null;        // the build in progress (one at a time)

    function startBuild(lang, sig) {
        if (builder) builder.resolve();          // whoever waited for the old one may go on
        const build = {
            lang: lang,
            signature: sig,
            ms: 0,
            tasks: [collect],
            phases: {},
            next: 0,
            index: {
                lang: lang, signature: sig, docs: [], byKey: new Map(), postings: new Map(),
                words: new Map(), sorted: [], typos: new Map(), buildMs: 0, maxIdf: 0
            }
        };
        build.promise = new Promise(function (resolve) { build.resolve = resolve; });
        builder = build;
        return build;
    }

    // Does up to "budget" ms of work (Infinity: all of it); true once the index is ready
    function work(build, budget) {
        const start = performance.now();
        while (build.next < build.tasks.length) {
            if (A.lang !== build.lang) {             // the language changed: this index is no use now
                if (builder === build) builder = null;
                build.resolve();
                return false;
            }
            const task = build.tasks[build.next++];
            const before = performance.now();
            task(build);
            const phase = task.phase || task.name;
            build.phases[phase] = (build.phases[phase] || 0) + performance.now() - before;
            if (performance.now() - start >= budget) break;
        }
        build.ms += performance.now() - start;
        if (build.next < build.tasks.length) return false;
        build.index.buildMs = Math.round(build.ms * 10) / 10;
        build.index.phases = {};
        Object.keys(build.phases).forEach(function (phase) {
            build.index.phases[phase] = Math.round(build.phases[phase] * 10) / 10;
        });
        indexes[build.lang] = build.index;
        if (builder === build) builder = null;
        build.resolve();
        return true;
    }

    // Task 1: every source gives its documents; then one task per document follows
    function collect(build) {
        const index = build.index;
        sources.forEach(function (source, order) {
            listOf(A.util.attempt(source.documents, [])).forEach(function (item) {
                if (!item || item.id === undefined || !item.title || typeof item.open !== "function") return;
                const doc = {
                    type: source.type,
                    order: order,
                    id: String(item.id),
                    title: plain(item.title),
                    section: plain(item.section),
                    label: plain(item.label || item.section),
                    icon: item.icon || source.icon,
                    text: plain(item.text),
                    keepOverlays: item.keepOverlays || source.keepOverlays,
                    open: item.open,
                    weight: Number(item.weight) > 0 ? Number(item.weight) : 1,
                    named: Boolean(item.name),
                    raw: {
                        name: plain(listOf([].concat(item.name || [])).join(" ")),
                        heading: plain(item.heading),
                        keywords: plain(listOf([].concat(item.keywords || [])).join(" "))
                    },
                    sentences: null
                };
                index.byKey.set(doc.type + ":" + doc.id, index.docs.length);
                index.docs.push(doc);
            });
        });
        index.docs.forEach(function (doc) {
            const task = function () { prepare(doc, index); };
            task.phase = "prepare";
            build.tasks.push(task);
        });
        build.tasks.push(weigh, vocabulary, prepareLists);
    }

    // Task 2: one document's words, field by field, cut to stems
    // (and every new word goes into the vocabulary)
    function prepare(doc, index) {
        const raw = doc.raw;
        const fieldTexts = {
            name: raw.name,
            title: raw.name ? "" : doc.title,          // a term's name takes the title's place
            heading: raw.heading,
            text: doc.text,
            keywords: raw.keywords
        };
        doc.fields = {};
        doc.sequence = [];        // every stem in reading order, for the phrase bonus
        FIELDS.forEach(function (field) {
            const stems = [];
            const found = split(fieldTexts[field], true);
            for (let i = 0; i < found.length; i++) {
                const word = found[i];
                if (STOP.has(word)) continue;
                const s = stem(word);
                stems.push(s);
                if (!index.words.has(word)) index.words.set(word, s);
            }
            doc.fields[field] = stems;
            doc.sequence.push.apply(doc.sequence, stems);
            doc.sequence.push("");                      // a phrase does not run from one field into the next
        });
        doc.raw = null;
    }

    // Task 3: how much every stem counts in every document, and how rare it is
    function weigh(build) {
        const index = build.index;
        const docs = index.docs;
        // the average length of each field (over the documents that have it)
        const average = {};
        FIELDS.forEach(function (field) {
            let total = 0, count = 0;
            docs.forEach(function (doc) {
                if (doc.fields[field].length) { total += doc.fields[field].length; count++; }
            });
            average[field] = count ? total / count : 1;
        });
        docs.forEach(function (doc, number) {
            const weights = new Map();
            FIELDS.forEach(function (field) {
                const stems = doc.fields[field];
                if (!stems.length) return;
                // BM25F: a word counts "boost" times, a little less in a field longer than usual
                const value = BOOST[field] / (1 - B + B * stems.length / average[field]);
                stems.forEach(function (s) { weights.set(s, (weights.get(s) || 0) + value); });
            });
            weights.forEach(function (weight, s) {
                let posting = index.postings.get(s);
                if (!posting) {
                    posting = { idf: 0, docs: [], weights: [] };
                    index.postings.set(s, posting);
                }
                posting.docs.push(number);
                posting.weights.push(weight);
            });
            doc.fields = null;
        });
        // idf: a word in few documents says more about them than one in many
        const n = docs.length;
        index.postings.forEach(function (posting) {
            const df = posting.docs.length;
            posting.idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
        });
        index.maxIdf = Math.log(1 + (n + 0.5) / 0.5);    // a word that is nowhere
    }

    // Task 4: the vocabulary in alphabetical order; then the typo index, in a few steps
    function vocabulary(build) {
        const index = build.index;
        index.sorted = Array.from(index.words.keys()).sort();
        for (let from = 0; from < index.sorted.length; from += TYPO_BATCH) {
            build.tasks.push(typoTask(index, from, Math.min(index.sorted.length, from + TYPO_BATCH)));
        }
    }

    // Task 5: words from..to of the vocabulary, each with one letter left out
    // ("neural" → eural, nural, neral, neual, neurl, neura). Most of these short
    // forms come from one word only: then the word itself is kept, not a list.
    function typoTask(index, from, to) {
        const task = function () {
            const typos = index.typos;
            for (let i = from; i < to; i++) {
                const word = index.sorted[i];
                if (word.length < TYPO_MIN || DIGIT.test(word)) continue;
                for (let k = 0; k < word.length; k++) {
                    const short = word.slice(0, k) + word.slice(k + 1);
                    const found = typos.get(short);
                    if (found === undefined) typos.set(short, word);
                    else if (typeof found === "string") {
                        if (found !== word) typos.set(short, [found, word]);
                    } else if (found[found.length - 1] !== word) found.push(word);
                }
            }
        };
        task.phase = "typos";
        return task;
    }

    // The index for the current language, up to date (built now if needed)
    function current() {
        const lang = A.lang;
        const sig = signature();
        const done = indexes[lang];
        if (done && done.signature === sig) return done;
        const build = builder && builder.lang === lang && builder.signature === sig ? builder : startBuild(lang, sig);
        work(build, Infinity);
        return indexes[lang];
    }

    // Builds the index in steps of at most SLICE_MS, at idle moments
    function ready() {
        const lang = A.lang;
        const sig = signature();
        const done = indexes[lang];
        if (done && done.signature === sig) return Promise.resolve();
        if (builder && builder.lang === lang && builder.signature === sig) return builder.promise;
        const build = startBuild(lang, sig);
        const step = function (deadline) {
            if (builder !== build) return;            // finished by a query, or replaced
            const idle = deadline && !deadline.didTimeout ? deadline.timeRemaining() : SLICE_MS;
            if (!work(build, A.util.clamp(idle, 1, SLICE_MS)) && builder === build) later(step);
        };
        later(step);
        return build.promise;
    }

    function later(step) {
        if (window.requestIdleCallback) window.requestIdleCallback(step, { timeout: SLICE_WAIT_MS });
        else setTimeout(step, 1);
    }

    /* =========================================================
       6. UNDERSTANDING A QUERY
       The query becomes a list of "concepts": one for each word that
       counts, or one for a few words that are together in the synonym
       list ("neural network"). Each concept has alternatives, each a
       list of stems with a weight:
         "nueral netwrk" → [neural network (typo), нейросеть (synonym), ...]
         "chatgpt"       → [chatgpt, chatbot (synonym), large language model (synonym)]
         "neu" (typing)  → [neu, neural (prefix), neuron (prefix), ...]
       "AI" is left out when another word of the query is on the site: every
       text is about AI, so it would not help to find the right one.
       ========================================================= */
    let phrases = null;        // [{ stems, groups }] from the synonym list, longest first
    let groups = null;         // group number → [stems of each phrase in it]
    let related = null;        // stem → [stems of each phrase it also looks for]
    let everywhere = null;     // "ai", "ии"...: skipped in a query with other words (as stems)

    function phraseStems(text) {
        return split(text, false).filter(function (word) { return !STOP.has(word); }).map(stem);
    }

    // The word lists are cut into stems once, by the first build (the last task)
    function prepareLists() {
        if (phrases) return;
        const byText = new Map();
        groups = listOf(lists.synonyms).map(function (group, number) {
            return listOf(group).map(phraseStems).filter(function (stems) {
                if (!stems.length) return false;
                const key = stems.join(" ");
                if (!byText.has(key)) byText.set(key, { stems: stems, groups: [] });
                byText.get(key).groups.push(number);
                return true;
            });
        });
        phrases = Array.from(byText.values()).sort(function (a, b) { return b.stems.length - a.stems.length; });
        everywhere = new Set(listOf(lists.everywhere).map(function (text) { return phraseStems(text).join(" "); }));
        // one-way links: each target brings its whole synonym group ("chatbot" → "чат-бот" too)
        related = new Map();
        Object.keys(lists.related || {}).forEach(function (word) {
            const targets = [];
            const seen = new Set();
            const add = function (stems) {
                const key = stems.join(" ");
                if (stems.length && !seen.has(key)) { seen.add(key); targets.push(stems); }
            };
            listOf(lists.related[word]).map(phraseStems).forEach(function (stems) {
                const entry = byText.get(stems.join(" "));
                if (!entry) return add(stems);
                entry.groups.forEach(function (number) { groups[number].forEach(add); });
            });
            related.set(stem(clean(word)), targets);
        });
    }

    // Site words one typo away from "word", the most common first (as stems)
    function typoFixes(index, word) {
        const found = new Set();
        const consider = function (candidates) {        // a word, or a list of words, or nothing
            [].concat(candidates || []).forEach(function (candidate) {
                if (oneEditApart(word, candidate)) found.add(candidate);
            });
        };
        consider(index.typos.get(word));                                // a letter missing in "word"
        for (let k = 0; k < word.length; k++) {
            const short = word.slice(0, k) + word.slice(k + 1);
            if (index.words.has(short)) consider(short);                // a letter too many in "word"
            consider(index.typos.get(short));                           // a letter wrong, or two swapped
        }
        const stems = [];
        found.forEach(function (candidate) {
            const s = index.words.get(candidate);
            if (stems.indexOf(s) === -1) stems.push(s);
        });
        return stems.sort(function (a, b) {
            return index.postings.get(b).docs.length - index.postings.get(a).docs.length;
        }).slice(0, TYPO_FIXES);
    }

    // Site words that start with "start", as stems ("neu" → neural, neuron)
    function completions(index, start) {
        const sorted = index.sorted;
        let low = 0, high = sorted.length;
        while (low < high) {                              // binary search: the first word >= start
            const middle = (low + high) >> 1;
            if (sorted[middle] < start) low = middle + 1;
            else high = middle;
        }
        const stems = [];
        for (let i = low; i < sorted.length && stems.length < PREFIX_MAX && sorted[i].startsWith(start); i++) {
            const s = index.words.get(sorted[i]);
            if (stems.indexOf(s) === -1) stems.push(s);
        }
        return stems;
    }

    // The synonym phrase that starts at items[i], if any (the longest one)
    function phraseAt(items, i) {
        for (let p = 0; p < phrases.length; p++) {
            const phrase = phrases[p];
            const length = phrase.stems.length;
            if (i + length > items.length) continue;
            let fits = true;
            for (let k = 0; k < length && fits; k++) {
                const item = items[i + k];
                fits = !item.stop && item.options.indexOf(phrase.stems[k]) !== -1;
            }
            if (fits) return phrase;
        }
        return null;
    }

    function understand(index, text, settings) {
        prepareLists();
        const typing = settings.prefix !== false && !/\s$/.test(text);
        const all = split(text, false).slice(0, QUERY_WORDS);
        // The words that count. A little word ("the") is skipped, unless it is the
        // last one and you may still be typing it ("the" → "theory").
        const items = [];
        all.forEach(function (word, i) {
            const partial = typing && i === all.length - 1 && word.length >= PREFIX_MIN && !DIGIT.test(word);
            const stop = STOP.has(word);
            if (stop && !partial) return;
            const item = { word: word, stem: stem(word), stop: stop, partial: partial, fixes: [], more: [] };
            if (!stop && !index.postings.has(item.stem) && word.length >= TYPO_MIN && !DIGIT.test(word)) {
                item.fixes = typoFixes(index, word);
            }
            item.options = (stop ? [] : [item.stem]).concat(item.fixes);
            if (partial) {
                item.more = completions(index, word).filter(function (s) { return item.options.indexOf(s) === -1; });
            }
            items.push(item);
        });

        let concepts = [];
        for (let i = 0; i < items.length;) {
            const phrase = phraseAt(items, i);
            const span = phrase ? phrase.stems.length : 1;
            const concept = phrase ? phraseConcept(items.slice(i, i + span), phrase) : wordConcept(items[i]);
            const typed = items.slice(i, i + span).map(function (item) { return item.stem; }).join(" ");
            concept.everywhere = everywhere.has(typed);
            if (concept.alternatives.length) concepts.push(concept);
            i += span;
        }
        // "AI" is left out when another word of the query is on the site
        // ("how does AI recognise faces?"), but not while that word is still
        // being typed ("ai w" keeps finding AI)
        const others = concepts.filter(function (concept) { return !concept.everywhere; });
        const onSite = others.some(function (concept) {
            return concept.alternatives.some(function (alternative) {
                return alternative.stems.every(function (s) { return index.postings.has(s); });
            });
        });
        if (onSite) concepts = others;
        // For the phrase bonus: what each word may be, in the order typed
        const order = items.map(function (item) { return item.options.concat(item.more); });
        return { concepts: concepts, order: order };
    }

    // A few words that are in the synonym list: every phrase of their group(s)
    function phraseConcept(items, phrase) {
        const typed = items.every(function (item, k) { return item.stem === phrase.stems[k]; });
        const alternatives = [];
        const seen = new Set();
        phrase.groups.forEach(function (number) {
            groups[number].forEach(function (stems) {
                const key = stems.join(" ");
                if (seen.has(key)) return;
                seen.add(key);
                const same = key === phrase.stems.join(" ");
                alternatives.push({ stems: stems, weight: same ? (typed ? WEIGHT.exact : WEIGHT.typo) : WEIGHT.synonym });
            });
        });
        return { span: items.length, alternatives: alternatives };
    }

    // One word: itself, its typo fixes, its one-way links and (while typing) its completions
    function wordConcept(item) {
        const alternatives = [];
        if (!item.stop) alternatives.push({ stems: [item.stem], weight: WEIGHT.exact });
        item.fixes.forEach(function (s) { alternatives.push({ stems: [s], weight: WEIGHT.typo }); });
        (related.get(item.stem) || []).forEach(function (stems) {
            alternatives.push({ stems: stems, weight: WEIGHT.synonym });
        });
        item.more.forEach(function (s) { alternatives.push({ stems: [s], weight: WEIGHT.prefix }); });
        return { span: 1, alternatives: alternatives };
    }

    /* =========================================================
       7. SCORING
       Each concept gives a document the points of its best alternative:
       BM25 for each stem (idf x weight x (K1 + 1) / (weight + K1)),
       averaged over the alternative's stems, times the alternative's
       weight, times the number of query words the concept stands for.
       "match" adds up the idf of the concepts a document has, out of all.
       Then the best documents get the phrase bonus.
       ========================================================= */
    function rank(index, text, settings) {
        const plan = understand(index, text, settings);
        if (!plan.concepts.length) return [];
        const allowed = settings.types ? new Set(listOf(settings.types)) : null;
        const docs = index.docs;
        const totals = new Map();             // document number → { score, covered }
        let fullWeight = 0;

        plan.concepts.forEach(function (concept) {
            const best = new Map();           // document number → { value, part }
            let weight = 0;                   // how much this concept counts for "match"
            concept.alternatives.forEach(function (alternative) {
                const sums = new Map();
                const counts = new Map();
                alternative.stems.forEach(function (s) {
                    const posting = index.postings.get(s);
                    if (!posting) return;
                    weight = Math.max(weight, posting.idf);
                    for (let i = 0; i < posting.docs.length; i++) {
                        const number = posting.docs[i];
                        if (allowed && !allowed.has(docs[number].type)) continue;
                        const w = posting.weights[i];
                        sums.set(number, (sums.get(number) || 0) + posting.idf * w * (K1 + 1) / (w + K1));
                        counts.set(number, (counts.get(number) || 0) + 1);
                    }
                });
                const size = alternative.stems.length;
                sums.forEach(function (sum, number) {
                    // the best score of any form of the concept, and the best share of it found
                    // (a name that holds "neural network" AND "neural net" covers it fully)
                    const value = alternative.weight * concept.span * sum / size;
                    const part = alternative.weight * counts.get(number) / size;
                    const old = best.get(number);
                    if (!old) {
                        best.set(number, { value: value, part: part });
                    } else {
                        old.value = Math.max(old.value, value);
                        old.part = Math.max(old.part, part);
                    }
                });
            });
            weight = weight || index.maxIdf;  // nowhere on the site: the match goes down
            fullWeight += weight;
            best.forEach(function (found, number) {
                const total = totals.get(number) || { score: 0, covered: 0 };
                total.score += found.value;
                total.covered += weight * found.part;
                totals.set(number, total);
            });
        });

        const found = [];
        const boost = settings.boost || {};
        totals.forEach(function (total, number) {
            const doc = docs[number];
            const factor = Number(boost[doc.type]) || 1;
            found.push({ doc: doc, number: number, score: total.score * factor * doc.weight, match: total.covered / fullWeight });
        });
        sortFound(found);

        // The phrase bonus: the query's words next to each other, in order
        const pairs = [];
        for (let i = 0; i + 1 < plan.order.length; i++) {
            if (plan.order[i].length && plan.order[i + 1].length) pairs.push([plan.order[i], plan.order[i + 1]]);
        }
        if (pairs.length) {
            found.slice(0, PHRASE_CHECKS).forEach(function (item) {
                item.score *= 1 + PHRASE_BONUS * phraseShare(item.doc.sequence, pairs);
            });
            sortFound(found);
        }
        found.marks = marksOf(index, plan);
        found.words = plan.concepts.length;
        return found;
    }

    function sortFound(found) {
        found.sort(function (a, b) {
            return b.score - a.score || a.doc.order - b.doc.order || a.number - b.number;
        });
    }

    // The share of word pairs that stand together (in order) somewhere in the document
    function phraseShare(sequence, pairs) {
        let together = 0;
        pairs.forEach(function (pair) {
            for (let j = 0; j < sequence.length; j++) {
                if (!sequence[j] || pair[0].indexOf(sequence[j]) === -1) continue;
                for (let gap = 1; gap <= PHRASE_GAP && j + gap < sequence.length; gap++) {
                    if (!sequence[j + gap]) break;                  // the end of a field
                    if (pair[1].indexOf(sequence[j + gap]) !== -1) {
                        together++;
                        return;
                    }
                }
            }
        });
        return together / pairs.length;
    }

    // Every stem the query looks for, to mark them in titles and snippets.
    // marks.forms: for each stem, the forms of the query's concepts it is in
    // ({ concept, form, part }), so that valueOf counts each concept once
    function marksOf(index, plan) {
        const marks = new Set();
        marks.forms = new Map();
        let form = 0;
        plan.concepts.forEach(function (concept, number) {
            // a concept is worth the idf of its rarest form, whichever form a text uses
            let idf = 0;
            concept.alternatives.forEach(function (alternative) {
                alternative.stems.forEach(function (s) {
                    const posting = index.postings.get(s);
                    if (posting) idf = Math.max(idf, posting.idf);
                });
            });
            concept.alternatives.forEach(function (alternative) {
                const part = idf * alternative.weight / alternative.stems.length;
                alternative.stems.forEach(function (s) {
                    marks.add(s);
                    if (!marks.forms.has(s)) marks.forms.set(s, []);
                    marks.forms.get(s).push({ concept: number, form: form, part: part });
                });
                form++;
            });
        });
        return marks;
    }

    /* =========================================================
       8. SNIPPETS AND PASSAGES
       Safe HTML: the text is escaped first, and only then are the found
       words wrapped in <mark>. Nothing from the content goes into the page
       as HTML.
       ========================================================= */

    // The sentences of a document's text (worked out once, when first needed).
    // A sentence ends with . ! ? or … before a capital letter, a digit or a quote.
    function sentencesOf(doc) {
        if (!doc.sentences) {
            doc.sentences = doc.text ? doc.text.replace(/([.!?…])\s+(?=[\p{Lu}\p{N}"“«(])/gu, "$1\n").split("\n") : [];
        }
        return doc.sentences;
    }

    // The text as safe HTML, with every word whose stem is in "marks" in <mark>
    function markHTML(text, marks) {
        const part = /[\p{L}\p{N}]+/gu;
        let html = "", last = 0, match;
        while ((match = part.exec(text))) {
            const word = clean(match[0]);
            if (STOP.has(word) || !marks.has(stem(word))) continue;
            html += esc(text.slice(last, match.index)) + "<mark>" + esc(match[0]) + "</mark>";
            last = match.index + match[0].length;
        }
        return html + esc(text.slice(last));
    }

    // How well a piece of text answers the query. Each concept of the query counts
    // once, by the best of its forms in the text: the word typed counts more than a
    // synonym ("перцептрон" more than the "Perceptron" of "Mark I Perceptron"), and a
    // phrase by the share of its words.
    function valueOf(text, marks) {
        if (!marks.forms) return 0;
        const seen = new Set();
        const sums = new Map();              // form → the part of it found
        const best = new Map();              // concept → its best form
        split(text, false).forEach(function (word) {
            const s = stem(word);
            if (STOP.has(word) || !marks.has(s) || seen.has(s)) return;
            seen.add(s);
            marks.forms.get(s).forEach(function (form) {
                const sum = (sums.get(form.form) || 0) + form.part;
                sums.set(form.form, sum);
                best.set(form.concept, Math.max(best.get(form.concept) || 0, sum));
            });
        });
        let value = 0;
        best.forEach(function (part) { value += part; });
        return value;
    }

    // A one-sentence snippet: the best sentence, cut around the first match if it is long
    function snippetOf(index, doc, marks) {
        const sentences = sentencesOf(doc);
        if (!sentences.length) return "";
        // The sentence with the most (and rarest) query words. For a term whose name
        // already shows them, the first sentence (its definition) gets that much extra.
        const lead = doc.named ? valueOf(doc.title, marks) : 0;
        let best = 0, bestValue = -1;
        sentences.forEach(function (sentence, i) {
            const value = valueOf(sentence, marks) + (i === 0 ? lead : 0);
            if (value > bestValue) { best = i; bestValue = value; }
        });
        let text = sentences[best];
        // Where the first word you typed is: a snippet often shows on one line,
        // so a long sentence (or a late match) starts a few words before it
        const part = /[\p{L}\p{N}]+/gu;
        let first = 0, match;
        while ((match = part.exec(text))) {
            const word = clean(match[0]);
            if (!STOP.has(word) && marks.has(stem(word))) { first = match.index; break; }
        }
        if (text.length > SNIPPET_MAX || first > SNIPPET_LATE) {
            let start = Math.max(0, first - SNIPPET_LEAD);
            if (start > 0) start = text.indexOf(" ", start) + 1 || start;          // start at a word
            let end = Math.min(text.length, start + SNIPPET_MAX);
            if (end < text.length) end = text.lastIndexOf(" ", end) > start ? text.lastIndexOf(" ", end) : end;
            text = (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
        }
        return markHTML(text, marks);
    }

    // Does a sentence start with a word that points back ("This is called bias.")?
    function leansBack(sentence) {
        const first = split(sentence, false)[0];
        return Boolean(first) && LEANS_BACK.has(first);
    }

    // 1-3 whole sentences of a document (at most PASSAGE_MAX letters, or one sentence;
    // a sentence that points back can make an answer for a query a little longer).
    // options.from/to: those sentences; options.query: the best ones for it.
    function passageOf(index, doc, options) {
        const sentences = sentencesOf(doc);
        const count = sentences.length;
        if (!count) return null;
        const grow = function (from) {          // as many sentences from "from" as fit
            let to = from + 1, length = sentences[from].length;
            while (to < count && to - from < PASSAGE_SENTENCES && length + 1 + sentences[to].length <= PASSAGE_MAX) {
                length += 1 + sentences[to].length;
                to++;
            }
            return to;
        };
        let from = 0, to;
        if (options.from !== undefined) {
            from = A.util.clamp(Math.round(Number(options.from)) || 0, 0, count);
            if (from >= count) return { text: "", from: count, to: count, count: count };
            to = options.to !== undefined ? A.util.clamp(Math.round(Number(options.to)) || 0, from + 1, count) : grow(from);
        } else {
            // A term whose name shows the query words starts with its definition
            // (even when its example repeats more of them: "what is a chatbot?").
            // Otherwise: the window of sentences that holds the most (and rarest)
            // query words; on a tie the earlier one, so a passage rather starts
            // at the beginning.
            const marks = options.query ? rank(index, String(options.query), { prefix: false }).marks || new Set() : new Set();
            to = grow(0);
            if (!doc.named || valueOf(doc.title, marks) === 0) {
                let bestValue = -1;
                for (let start = 0; start < count; start++) {
                    // "This is called bias." never starts a passage: the student would
                    // not see what "this" is. When it comes right after the sentences
                    // that fit, it is added (even past PASSAGE_MAX) if it holds more
                    // of the query words.
                    if (start > 0 && leansBack(sentences[start])) continue;
                    let end = grow(start);
                    let value = valueOf(sentences.slice(start, end).join(" "), marks);
                    if (end < count && end - start < PASSAGE_SENTENCES && leansBack(sentences[end])) {
                        const longer = valueOf(sentences.slice(start, end + 1).join(" "), marks);
                        if (longer > value) { end++; value = longer; }
                    }
                    if (value > bestValue) { bestValue = value; from = start; to = end; }
                }
            }
        }
        return { text: sentences.slice(from, to).join(" "), from: from, to: to, count: count };
    }

    /* =========================================================
       9. THE BUILT-IN SOURCES
       In the order of importance: when two results score the same,
       the one from the earlier source comes first.
       ========================================================= */

    // ----- Glossary: every term -----
    function glossaryTerms() {
        return listOf((A.content.get("glossary") || {}).terms);
    }

    register("glossary", {
        icon: "📖",
        version: function () { return glossaryTerms().length; },
        documents: function () {
            return glossaryTerms().map(function (term) {
                const words = term && (term[A.lang] || term.en);
                if (!words || !words.name) return null;
                return {
                    id: term.id,
                    title: words.name,
                    name: [words.name].concat(listOf(words.aliases)).join(" ").replace(/\*/g, ""),
                    text: (words.def || "") + " " + (words.ex || ""),
                    keywords: A.has("glossary.cat." + term.cat) ? t("glossary.cat." + term.cat) : "",
                    section: t("search.glossary"),
                    label: t("search.glossaryLabel", { title: words.name }),
                    open: function () {
                        if (A.glossary) A.glossary.show(term.id, { focus: true });
                        else A.navigate("glossary");
                    }
                };
            });
        }
    });

    // ----- Lessons: every section, and each lesson's key ideas -----
    function lessonCount() {
        return A.lessons && A.lessons.count ? A.lessons.count : 0;
    }

    // TODO(lessons): A.lessons.open(n, opener, { part: "s2" }) should open the lesson at that
    // part (js/lessons.js has goToPart inside). Today the third argument is ignored, so the
    // lesson opens at its top.
    function openLesson(n, part) {
        if (A.lessons) A.lessons.open(n, null, { part: part });
    }

    register("lessons", {
        icon: "📚",
        keepOverlays: ["lesson-reader"],      // an open reader stays open and shows the lesson
        version: lessonCount,
        documents: function () {
            const docs = [];
            for (let n = 1; n <= lessonCount(); n++) {
                const key = "lessons.l" + n + ".";
                if (!A.has(key + "title")) continue;
                const lessonTitle = t(key + "title");
                const section = t("search.lesson", { n: A.format.number(n), title: lessonTitle });
                // section: where it is ("Lesson 3 · Neural Networks");
                // label: the part itself ("Lesson 3 · Inspired by the brain")
                const name = function (title) { return t("search.lesson", { n: A.format.number(n), title: title }); };
                for (let k = 1; A.has(key + "s" + k + ".h"); k++) {
                    const part = key + "s" + k + ".";
                    docs.push({
                        id: "l" + n + "-s" + k,
                        title: t(part + "h"),
                        heading: lessonTitle,
                        text: t(part + "p") + (A.has(part + "note") ? " " + t(part + "note") : ""),
                        keywords: section + (k === 1 && A.has(key + "desc") ? " " + t(key + "desc") : ""),
                        section: section,
                        label: name(t(part + "h")),
                        open: openLesson.bind(null, n, "s" + k)
                    });
                }
                if (A.has(key + "key1")) {
                    docs.push({
                        id: "l" + n + "-keys",
                        title: t("search.keyIdeas"),
                        heading: lessonTitle,
                        text: texts([key + "key1", key + "key2", key + "key3"]),
                        keywords: section,
                        section: section,
                        label: name(t("search.keyIdeas")),
                        weight: SUMMARY_WEIGHT,
                        open: openLesson.bind(null, n, "keys")
                    });
                }
            }
            return docs;
        }
    });

    // ----- Timeline: every milestone -----
    function milestones() {
        return listOf((A.content.get("timeline") || {}).events);
    }

    // A.timeline.show(key, { focus: true }) scrolls to the milestone and focuses it. Without
    // the timeline's API (or for a key it doesn't have), this goes to the history section and
    // then to the milestone's heading (js/timeline.js gives it the id "tl-title-<key>").
    function openMilestone(key) {
        if (A.timeline && A.timeline.show && A.timeline.show(key, { focus: true })) return true;
        A.navigate("timeline", { focus: false });            // closes windows, builds the timeline
        const heading = document.getElementById("tl-title-" + key);
        if (!heading || !heading.getClientRects().length) return A.dom.focusHeading("timeline");
        heading.scrollIntoView({ behavior: A.motion.ok() ? "smooth" : "auto", block: "center" });
        if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
        return true;
    }

    register("timeline", {
        icon: "🕰️",
        version: function () { return milestones().length; },
        documents: function () {
            const names = {};
            glossaryTerms().forEach(function (term) {
                const words = term && (term[A.lang] || term.en);
                if (words) names[term.id] = words.name;
            });
            return milestones().map(function (event) {
                const k = "timeline." + (event && event.key) + ".";
                if (!A.has(k + "title")) return null;
                const year = A.has(k + "year") ? t(k + "year") : "";
                return {
                    id: event.key,
                    title: t(k + "title"),
                    heading: year,
                    text: texts([k + "text", k + "why"]),
                    keywords: listOf(event.terms).map(function (id) { return names[id] || ""; }).join(" "),
                    section: t("search.timeline", { year: year }),
                    open: openMilestone.bind(null, event.key)
                };
            });
        }
    });

    // ----- Quiz: every question with its explanation -----
    // Their texts are in the quiz's own file (js/content/quiz-bank.js), loaded the first
    // time they are needed. Until then the quiz has no documents: the first search asks
    // for the file, and the index is built again once it is here (its version changes).
    function questions() {
        return listOf((A.content.get("quiz") || {}).questions);
    }

    function questionTexts() {
        const first = questions()[0];
        return Boolean(first && A.has("quiz." + first.key + ".text"));
    }

    // A question leads to what explains it: its lesson, or the timeline, or else the quiz
    function openQuestion(question) {
        const lesson = Number(question.lesson);
        if (Number.isInteger(lesson) && lesson >= 1 && lesson <= lessonCount()) return openLesson(lesson);
        A.navigate(question.lesson === "timeline" ? "timeline" : "quiz");
    }

    register("quiz", {
        icon: "🏆",
        version: function () { return questions().length + (questionTexts() ? "" : " without texts"); },
        documents: function () {
            if (!questionTexts() && A.quiz && typeof A.quiz.ready === "function") {
                A.util.attempt(function () { A.quiz.ready().catch(function () {}); });
            }
            return questions().map(function (question) {
                const k = "quiz." + (question && question.key) + ".";
                if (!A.has(k + "text")) return null;
                const topic = A.has("quiz.topic." + question.topic) ? t("quiz.topic." + question.topic) : "";
                // A true-or-false statement may be false: it never shows as if it were a fact
                const statement = t(k + "text");
                // the right answer is found too, but never shown in a snippet
                const answer = question.type === "truefalse"
                    ? (question.correct === 0 ? "quiz.true" : "quiz.false")
                    : k + "o" + ((Number(question.correct) || 0) + 1);
                return {
                    id: question.key,
                    title: question.type === "truefalse" ? t("search.trueFalse", { text: statement }) : statement,
                    heading: topic,
                    text: A.has(k + "explain") ? t(k + "explain") : "",
                    keywords: A.has(answer) ? t(answer) : "",
                    section: t("search.quiz", { topic: topic || t("nav.quiz") }),
                    open: openQuestion.bind(null, question)
                };
            });
        }
    });

    // ----- AI Lab: every experiment of the catalogue, if the lab has one -----
    function experiments() {
        return A.lab && typeof A.lab.list === "function" ? listOf(A.util.attempt(A.lab.list, [])) : [];
    }

    register("lab", {
        icon: "🧪",
        version: function () { return experiments().length; },
        documents: function () {
            const catalogue = {};
            listOf(A.content.get("lab.catalogue")).forEach(function (entry) {
                if (entry && entry.id) catalogue[entry.id] = entry;
            });
            return experiments().map(function (item) {
                const entry = (item && catalogue[item.id]) || {};
                const titleKey = (item && item.titleKey) || entry.titleKey;
                if (!titleKey || !A.has(titleKey)) return null;
                const title = t(titleKey);
                return {
                    id: item.id,
                    title: title,
                    text: texts([entry.hookKey, entry.ideaKey]),
                    section: t("search.lab"),
                    label: t("search.labLabel", { title: title }),
                    open: function () { A.lab.open(item.id, { focus: true }); }
                };
            });
        }
    });

    // ----- The page: the hero, About and the section headers -----
    register("pages", {
        icon: "🧭",
        version: function () { return listOf(lists.pages).length; },
        documents: function () {
            return listOf(lists.pages).map(function (page) {
                const title = texts(page && page.title);
                if (!title) return null;
                const info = A.sections.find(function (section) { return section.id === page.id; });
                const name = info && A.has(info.key) ? t(info.key) : title;
                return {
                    id: page.id,
                    title: title,
                    heading: name,
                    text: texts(page.text),
                    keywords: texts(page.keywords),
                    section: t("search.page", { name: name }),
                    icon: info ? info.icon : undefined,
                    open: function () { A.navigate(page.id); }
                };
            });
        }
    });

    /* =========================================================
       10. PUBLIC API
       ========================================================= */
    let lastQueryMs = 0;

    function query(text, options) {
        const settings = options || {};
        const started = performance.now();
        const limit = Math.max(1, Math.round(Number(settings.limit)) || LIMIT);
        const index = current();
        let typed = String(text || "");
        let found = index ? rank(index, typed, settings) : [];
        let switched = "";
        // Nothing found: maybe it was typed with the other keyboard layout ("ytqhjctnm" → "нейросеть")
        if (index && !found.length && /\p{L}/u.test(typed)) {
            const other = A.switchLayout(typed.toLowerCase());
            if (other !== typed.toLowerCase()) {
                const again = rank(index, other, settings);
                if (again.length) {
                    found = again;
                    switched = other.trim();
                }
            }
        }
        const marks = found.marks || new Set();
        const results = found.slice(0, limit).map(function (item) {
            const doc = item.doc;
            return {
                type: doc.type,
                id: doc.id,
                title: doc.title,
                titleHTML: markHTML(doc.title, marks),
                snippet: snippetOf(index, doc, marks),
                section: doc.section,
                label: doc.label,
                icon: doc.icon,
                keepOverlays: doc.keepOverlays,
                score: Math.round(item.score * 1000) / 1000,
                match: Math.round(item.match * 100) / 100,
                open: function (from) { return openDoc(doc, from); }
            };
        });
        results.switched = switched;
        results.words = found.words || 0;
        lastQueryMs = Math.round((performance.now() - started) * 100) / 100;
        return results;
    }

    function openDoc(doc, from) {
        A.track("search.open", { type: doc.type, id: doc.id, from: from || "" });
        A.util.attempt(doc.open);
        return true;
    }

    // A document of the current language's index, by its source and id
    function find(type, id) {
        const index = current();
        const number = index ? index.byKey.get(type + ":" + id) : undefined;
        return number === undefined ? null : { index: index, doc: index.docs[number] };
    }

    A.feature("search", {
        query: query,
        register: register,
        ready: ready,
        open: function (type, id, from) {
            const found = find(type, id);
            return found ? openDoc(found.doc, from) : false;
        },
        passage: function (type, id, options) {
            const found = find(type, id);
            return found ? passageOf(found.index, found.doc, options || {}) : null;
        },
        document: function (type, id) {
            const found = find(type, id);
            if (!found) return null;
            const doc = found.doc;
            return { type: doc.type, id: doc.id, title: doc.title, section: doc.section, label: doc.label, icon: doc.icon, text: doc.text };
        },
        refresh: function () {
            Object.keys(indexes).forEach(function (lang) { delete indexes[lang]; });
            changes++;
        },
        info: function () {
            const index = indexes[A.lang];
            const types = {};
            if (index) index.docs.forEach(function (doc) { types[doc.type] = (types[doc.type] || 0) + 1; });
            return {
                lang: A.lang,
                documents: index ? index.docs.length : 0,
                words: index ? index.postings.size : 0,
                buildMs: index ? index.buildMs : 0,
                phases: index ? index.phases : {},
                queryMs: lastQueryMs,
                types: types
            };
        }
    });
})();
