/* =========================================================
   AI COMPASS — GLOSSARY
   A bilingual A–Z dictionary of the key words of AI:
   - a search box that filters the cards as you type, marks the
     matching words and offers "did you mean?" after a typo;
   - category chips with counts, and an alphabet strip;
   - term cards that open to show an everyday example and related
     terms (a term you opened counts as "explored");
   - one Ctrl+K palette command per term, and links like
     index.html#term-bias that open a term.
   The glossary sits far down the page, so it is only built when it
   comes near the screen (or when the browser has a quiet moment).
   Sections of this file:
    1. Settings
    2. The terms
    3. Small helpers
    4. Finding a term inside any text
    5. "Did you mean...?"
    6. State
    7. Building the glossary
    8. Searching
    9. Filling the cards
   10. Alphabet strip
   11. Sorting
   12. Showing the cards that match
   13. Opening cards
   14. Events
   15. Language changes
   16. Start
   17. Palette commands and the public API
   Other features use AICompass.glossary (see the last section).
   Every term and every text (English and Russian) is in
   js/content/glossary.js
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="glossary"]');
    const data = A && A.content.get("glossary");
    if (!A || !mount || !data) return;

    const t = A.t;
    const esc = A.escapeHTML;
    // A translated piece of text: <span class="..." data-i18n="key">text</span>.
    // data-i18n lets core.js re-translate it by itself.
    const text = A.i18nHTML;

    // ---------- 1. Settings ----------
    const PREVIEW_COUNT = 12;       // without a filter only this many cards show ("Show all" shows the rest)
    const MAX_SUGGESTIONS = 3;      // "did you mean?" offers at most this many terms.
    const SUGGEST_MIN_LETTERS = 3;  // It looks at typed words of at least 3 letters,
    const TYPOS_SHORT = 1;          // allows 1 typo in a short word
    const TYPOS_LONG = 2;           // and 2 in a word of
    const LONG_WORD = 5;            // 5 letters or more
    const NO_MATCH = 99;            // (the score of a term that is too far from the search)
    const ANNOUNCE_DELAY = 450;     // ms: screen readers hear the new count this long after typing stops
    const SPOTLIGHT_MS = 2600;      // ms: how long a shown term glows (the CSS animation takes 2.4 s)
    const FOCUS_DELAY = 80;         // ms: a shown term takes the focus this much later, so the palette or menu can close first
    const HASH_DELAY = 100;         // ms: a link to a term waits this long after the page is ready (when this file runs earlier)
    const CARD_SPACE = 16;          // px: a card we scroll to stays at least this far below the menu
    const GLIDE_MS = 420;           // ms: after a search or filter, cards glide to their new places,
    const GROW_IN_MS = 380;         // and new cards fade and grow in
    const GROW_STAGGER_MS = 35;     // one after another (this much later each)
    const GROW_STAGGER_MAX = 8;     // but never more than 8 steps later
    const ANIMATE_MARGIN = 200;     // px: only cards this close to the screen are animated
    const DICE_MS = 550;            // ms: the dice of the "Random" button spins this long

    // ---------- 2. The terms (from js/content/glossary-terms.js) ----------
    // categories: the category ids, in the order of their chips.
    // terms: every term with its words in both languages (see the content file).
    const CATEGORIES = data.categories;
    const TERMS = data.terms;

    // Terms by id. Object.create(null) makes an empty object without built-in
    // names, so an id like "constructor" can never find something by accident.
    const BY_ID = Object.create(null);
    TERMS.forEach(function (term) { BY_ID[term.id] = term; });

    // Other ids that lead to a term ("genetic-algorithm" -> "evolutionary-algorithm")
    const SAME_AS = Object.assign(Object.create(null), data.sameAs);

    // The section's subtitle says how many terms there are ("68 key words of ...")
    A.setTextValue("glossaryTermCount", TERMS.length);

    // The term an id names (its own id or one of SAME_AS), or undefined
    function termById(id) {
        return BY_ID[id] || BY_ID[SAME_AS[id]];
    }

    // A term's words in the current language
    function termName(term) {
        return term[A.lang].name;
    }

    // The full explanation (on an opened card)
    function termDef(term) {
        return term[A.lang].def;
    }

    // The definition in one plain sentence (on a closed card and on a flashcard)
    function termShort(term) {
        return term[A.lang].short;
    }

    // Aliases are written without their "*" wherever people can see or type them
    // (the "*" is for finding words: see section 4)
    function plainAlias(alias) {
        return alias.replace(/\*$/, "");
    }

    // A term as the public API gives it, in the current language (copies, so
    // nobody can change the glossary's own lists by accident)
    function info(term) {
        const words = term[A.lang];
        return {
            id: term.id,
            term: words.name,
            short: words.short,
            definition: words.def,
            example: words.ex,
            aliases: words.aliases.map(plainAlias),
            category: t("glossary.cat." + term.cat),
            categoryId: term.cat,
            icon: term.icon,
            lessons: term.lessons.slice(),
            lab: term.lab,
            related: term.related.slice()
        };
    }

    let lastRandom = "";

    // A random term, never the same one twice in a row
    function randomTerm() {
        let term;
        do {
            term = A.util.pick(TERMS);
        } while (term.id === lastRandom && TERMS.length > 1);
        lastRandom = term.id;
        return term;
    }

    // ---------- 3. Small helpers ----------

    // Lower case, and "ё" counts as "е", so "черный" also finds "чёрный"
    function normalize(text) {
        return String(text).toLowerCase().replace(/ё/g, "е");
    }

    // "What is a Neural Network?" -> ["what", "is", "a", "neural", "network"]
    function wordsOf(text) {
        return normalize(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    }

    function otherLang() {
        return A.lang === "ru" ? "en" : "ru";
    }

    // ---------- 4. Finding a term inside any text ----------
    // Used by find() (the assistant and the palette ask "which term does this
    // text mention?") and by the search box when plain searching finds nothing.

    // Russian words change their endings ("нейросеть", "нейросети", "нейросетей"),
    // so we cut common endings off and compare only the start of each word.
    const RU_ENDING = /(ами|ями|ого|его|ому|ему|ыми|ими|ых|их|ый|ий|ой|ей|ую|юю|ая|яя|ое|ее|ые|ие|ом|ем|ах|ях|ов|ев|ам|ям|а|я|о|е|ы|и|у|ю|ь|й)$/;

    function stem(word) {
        if (!/[а-я]/.test(word)) return word;
        const cut = word.replace(RU_ENDING, "");
        return cut.length >= 3 ? cut : word;
    }

    // What may follow a word's stem: a typical ending, and nothing else.
    // So "нейросет" finds "нейросети" and "model" finds "models",
    // but "вес" does not find "весна" and "data" does not find "database".
    const RU_TAIL = /^[аеиоуыэюяйьмхвг]{0,3}$/;
    const EN_TAIL = /^(s|es|ed|d|ing|ings|er|ers|ic|ics|al)?$/;

    // Short words (AI, ИИ) must match exactly; longer ones may have an ending.
    // A stem that ends in "*" (from an alias like "hallucinat*") may have any ending:
    // "hallucinat*" finds "hallucinate", "hallucinating" and "hallucination".
    function wordMatches(word, wordStem) {
        if (!word) return false;
        if (wordStem.slice(-1) === "*") return word.indexOf(wordStem.slice(0, -1)) === 0;
        if (wordStem.length <= 2) return word === wordStem;
        if (word.indexOf(wordStem) !== 0) return false;
        const tail = word.slice(wordStem.length);
        return /[а-я]/.test(wordStem) ? RU_TAIL.test(tail) : EN_TAIL.test(tail);
    }

    // Every way of writing every term, in both languages
    const PATTERNS = [];
    TERMS.forEach(function (term) {
        ["en", "ru"].forEach(function (lang) {
            const data = term[lang];
            const phrases = [data.name.replace(/\s*\([^)]*\)/g, "")];
            const inBrackets = data.name.match(/\(([^)]*)\)/);
            if (inBrackets) phrases.push(inBrackets[1]);
            data.aliases.forEach(function (alias) { phrases.push(alias); });

            phrases.forEach(function (phrase) {
                const stems = wordsOf(phrase).map(stem);
                if (!stems.length) return;
                // "word*": the last word is kept as it is, with its "*"
                if (/\*$/.test(phrase)) stems[stems.length - 1] = normalize(phrase).split(/\s+/).pop();
                PATTERNS.push({ term: term, stems: stems, score: stems.join(" ").length });
            });
        });
    });

    // The way of writing a term that the text mentions (the longest match wins:
    // "generative AI" beats "AI"): { term, stems, score }, or null when there is none
    function mentioned(text) {
        const words = wordsOf(text || "");
        if (!words.length) return null;

        let best = null;
        PATTERNS.forEach(function (pattern) {
            if (best && pattern.score <= best.score) return;
            for (let i = 0; i + pattern.stems.length <= words.length; i++) {
                const found = pattern.stems.every(function (wordStem, k) {
                    return wordMatches(words[i + k], wordStem);
                });
                if (found) {
                    best = pattern;
                    return;
                }
            }
        });
        return best;
    }

    // The term mentioned in a text, as the API gives it ({ id, term, ... }), or null
    function find(text) {
        const best = mentioned(text);
        return best ? info(best.term) : null;
    }

    // ---------- 5. "Did you mean...?" ----------
    // The Levenshtein distance counts how many letters you must add, remove
    // or change to turn one word into another ("nueral" -> "neural" = 2).
    function distance(a, b) {
        if (Math.abs(a.length - b.length) > TYPOS_LONG + 1) return NO_MATCH;
        let previous = [];
        for (let j = 0; j <= b.length; j++) previous.push(j);
        for (let i = 1; i <= a.length; i++) {
            const current = [i];
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                current.push(Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost));
            }
            previous = current;
        }
        return previous[b.length];
    }

    // Every way of writing a term, as lists of words: [["neural", "network"], ...]
    function spellings(term) {
        const list = [];
        ["en", "ru"].forEach(function (lang) {
            const data = term[lang];
            const inBrackets = data.name.match(/\(([^)]*)\)/);
            [data.name.replace(/\s*\([^)]*\)/g, ""), inBrackets ? inBrackets[1] : ""].concat(data.aliases).forEach(function (phrase) {
                const words = wordsOf(phrase);
                if (words.length) list.push(words);
            });
        });
        return list;
    }

    // Terms that look like a misspelled search, best first.
    // Every typed word must be close to a word of the term
    // (TYPOS_SHORT typos allowed in short words, TYPOS_LONG in longer ones).
    function suggestions(query) {
        const typed = wordsOf(query).filter(function (word) { return word.length >= SUGGEST_MIN_LETTERS; });
        if (!typed.length) return [];
        const scored = [];

        TERMS.forEach(function (term) {
            let best = NO_MATCH;
            spellings(term).forEach(function (words) {
                let total = 0;
                for (let i = 0; i < typed.length; i++) {
                    const q = typed[i];
                    let closest = NO_MATCH;
                    words.forEach(function (word) {
                        closest = Math.min(closest, distance(q, word));
                        // Compare with the start of longer words too: "trnasf" ~ "transf(ormer)"
                        if (word.length > q.length) closest = Math.min(closest, distance(q, word.slice(0, q.length)) + 0.5);
                    });
                    if (closest > (q.length < LONG_WORD ? TYPOS_SHORT : TYPOS_LONG)) {
                        total = NO_MATCH;
                        break;
                    }
                    total += closest;
                }
                best = Math.min(best, total);
            });
            if (best < NO_MATCH) scored.push({ term: term, score: best });
        });

        scored.sort(function (a, b) { return a.score - b.score; });
        return scored.slice(0, MAX_SUGGESTIONS).map(function (item) { return item.term; });
    }

    // ---------- 6. State ----------
    // The terms opened on earlier visits. The saved value is checked first:
    // if it is broken (not a list of term ids), we simply start again.
    function loadExplored() {
        const saved = A.storage.get("glossary.explored", []);
        if (!Array.isArray(saved)) return [];
        return saved.filter(function (id) {
            return typeof id === "string" && Boolean(BY_ID[id]);
        });
    }

    const state = {
        query: "",
        cat: "all",
        letter: "",
        showAll: false,
        open: new Set(),
        explored: new Set(loadExplored())
    };

    // ---------- 7. Building the glossary ----------
    const ICON_SEARCH = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    const ICON_CLOSE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
    const ICON_CHEVRON = '<svg class="gl-chevron" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ICON_RESET = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    function categoryChip(id) {
        return '<button class="chip gl-chip ui-chip" type="button" data-cat="' + id + '" aria-pressed="' + (id === "all") + '">' +
            '<span class="gl-chip-dot ui-chip-dot" aria-hidden="true"></span>' +
            text("glossary.cat." + id) +
            '<span class="gl-chip-count ui-chip-count mono">0</span>' +
        "</button>";
    }

    // The lessons and AI Lab experiments this site has, asked from their features when
    // the glossary is built: { lessons: { 3: { icon } }, labs: { vision: { icon, titleKey } } }.
    // A card links only to those (a lesson or an experiment the site doesn't have yet is left out).
    let site = { lessons: {}, labs: {} };

    function findSiteLinks() {
        const found = { lessons: {}, labs: {} };
        if (A.lessons && typeof A.lessons.list === "function") {
            A.lessons.list().forEach(function (lesson) {
                found.lessons[lesson.number] = { icon: lesson.icon };
            });
        }
        if (A.lab && typeof A.lab.list === "function") {
            A.lab.list().forEach(function (experiment) {
                found.labs[experiment.id] = { icon: experiment.icon, titleKey: experiment.titleKey };
            });
        }
        return found;
    }

    // "Learn it on this site": links to the term's lessons and lab experiment
    // (their texts are written by translateCard)
    function learnHTML(term) {
        const lessons = term.lessons.filter(function (n) { return site.lessons[n]; });
        const lab = term.lab && site.labs[term.lab] ? term.lab : "";
        if (!lessons.length && !lab) return "";
        const link = function (href, data, icon) {
            return '<li><a class="gl-learn-link" href="' + href + '" ' + data + ">" +
                '<span class="gl-learn-icon" aria-hidden="true">' + esc(icon) + "</span>" +
                '<span class="gl-learn-text"></span>' +
            "</a></li>";
        };
        return '<div class="gl-learn">' +
            '<p class="gl-label mono">' + text("glossary.learn") + "</p>" +
            '<ul class="gl-learn-list">' +
                lessons.map(function (n) {
                    return link("#lesson-" + n, 'data-lesson="' + n + '"', site.lessons[n].icon || "📘");
                }).join("") +
                (lab ? link("#lab/" + lab, 'data-lab="' + lab + '"', site.labs[lab].icon || "🧪") : "") +
            "</ul>" +
        "</div>";
    }

    function cardHTML(term) {
        const id = term.id;
        return '<li class="gl-card card' + (state.explored.has(id) ? " is-explored" : "") + '" id="term-' + id + '" data-id="' + id + '" data-cat="' + term.cat + '" data-reveal>' +
            '<div class="gl-card-top">' +
                '<span class="gl-icon" aria-hidden="true">' + term.icon + "</span>" +
                '<span class="gl-cat-tag mono">' + text("glossary.cat." + term.cat) + "</span>" +
                '<span class="gl-seen" data-i18n-attr="title:glossary.exploredBadge" title="' + esc(t("glossary.exploredBadge")) + '">' +
                    '<span aria-hidden="true">✓</span>' + text("glossary.exploredBadge", "sr-only") +
                "</span>" +
            "</div>" +
            '<h3 class="gl-name" id="gl-name-' + id + '"></h3>' +
            '<p class="gl-alt">' +
                '<span class="gl-alt-code mono" aria-hidden="true" data-i18n="glossary.altCode">' + t("glossary.altCode") + "</span>" +
                text("glossary.altLabel", "sr-only") + " " +
                '<span class="gl-alt-text"></span>' +
            "</p>" +
            // The short definition, or the full explanation while the card is open
            '<p class="gl-def" id="gl-def-' + id + '"></p>' +
            '<button class="gl-toggle" type="button" aria-expanded="false" aria-controls="gl-def-' + id + " gl-more-" + id + '">' +
                text("glossary.more") + ICON_CHEVRON +
            "</button>" +
            '<div class="gl-more" id="gl-more-' + id + '">' +
                '<div class="gl-more-inner">' +
                    '<div class="gl-example">' +
                        '<p class="gl-label mono"><span aria-hidden="true">💡</span> ' + text("glossary.example") + "</p>" +
                        '<p class="gl-ex-text"></p>' +
                    "</div>" +
                    learnHTML(term) +
                    '<div class="gl-related">' +
                        '<p class="gl-label mono">' + text("glossary.related") + "</p>" +
                        '<ul class="gl-rel-list">' +
                            term.related.filter(function (relId) { return BY_ID[relId]; }).map(function (relId) {
                                return '<li><button class="chip gl-rel" type="button" data-target="' + relId + '">' +
                                    '<span aria-hidden="true">' + BY_ID[relId].icon + "</span>" +
                                    '<span class="gl-rel-name"></span>' +
                                "</button></li>";
                            }).join("") +
                        "</ul>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</li>";
    }

    // The glossary's outer element, handy references to its parts, and every
    // card with the parts inside it (by term id). They are filled in by build().
    let root = null;
    let ui = null;
    const cards = Object.create(null);

    // Builds the whole glossary (once: see section 16, "Start")
    function build() {
        site = findSiteLinks();
        mount.innerHTML =
            '<div class="gl">' +
                '<div class="gl-console card ui-scan" data-reveal>' +
                    '<span class="gl-corner gl-corner-tl ui-corners" aria-hidden="true"></span>' +
                    '<span class="gl-corner gl-corner-br ui-corners" aria-hidden="true"></span>' +

                    '<div class="gl-console-head">' +
                        '<p class="gl-kicker mono"><span class="gl-kicker-dot" aria-hidden="true"></span>' + text("glossary.kicker") + "</p>" +
                        '<div class="gl-explored" role="img">' +
                            '<span class="gl-explored-label mono" aria-hidden="true">' + text("glossary.explored") + "</span>" +
                            '<span class="gl-explored-bar" aria-hidden="true"><span></span></span>' +
                            '<span class="gl-explored-num mono" aria-hidden="true"></span>' +
                        "</div>" +
                    "</div>" +

                    '<div class="gl-search-row">' +
                        '<div class="gl-search">' +
                            '<span class="gl-search-icon">' + ICON_SEARCH + "</span>" +
                            '<label class="sr-only" for="gl-search-input" data-i18n="glossary.searchLabel">' + t("glossary.searchLabel") + "</label>" +
                            '<input class="gl-input" id="gl-search-input" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" maxlength="60"' +
                                ' aria-describedby="gl-search-hint" aria-controls="gl-grid"' +
                                ' data-i18n-attr="placeholder:glossary.searchPlaceholder" placeholder="' + esc(t("glossary.searchPlaceholder")) + '">' +
                            '<button class="gl-clear" type="button" hidden data-i18n-attr="aria-label:glossary.clear,title:glossary.clear"' +
                                ' aria-label="' + esc(t("glossary.clear")) + '" title="' + esc(t("glossary.clear")) + '">' + ICON_CLOSE + "</button>" +
                        "</div>" +
                        // On phones the filters fold away behind this button
                        '<button class="btn btn-ghost gl-filter-toggle" type="button" aria-expanded="false" aria-controls="gl-filters"' +
                            ' data-i18n-attr="title:glossary.filters" title="' + esc(t("glossary.filters")) + '">' +
                            '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
                            text("glossary.filters", "sr-only") +
                            '<span class="gl-filter-badge mono" hidden>' + text("glossary.filtersActive", "sr-only") + ' <span class="gl-filter-num"></span></span>' +
                        "</button>" +
                        '<button class="btn btn-ghost gl-random" type="button" data-i18n-attr="title:glossary.randomLabel" title="' + esc(t("glossary.randomLabel")) + '">' +
                            '<span class="gl-dice" aria-hidden="true">🎲</span>' + text("glossary.random") +
                        "</button>" +
                    "</div>" +
                    '<p class="sr-only" id="gl-search-hint" data-i18n="glossary.searchHint">' + t("glossary.searchHint") + "</p>" +

                    '<div class="gl-filters" id="gl-filters">' +
                        '<div class="gl-cats" role="group" data-i18n-attr="aria-label:glossary.catsLabel" aria-label="' + esc(t("glossary.catsLabel")) + '">' +
                            ["all"].concat(CATEGORIES).map(categoryChip).join("") +
                        "</div>" +
                        '<div class="gl-alpha" role="group" data-i18n-attr="aria-label:glossary.lettersLabel" aria-label="' + esc(t("glossary.lettersLabel")) + '"></div>' +
                    "</div>" +

                    '<div class="gl-status">' +
                        '<p class="gl-count mono"></p>' +
                        '<span class="gl-count-bar" aria-hidden="true"><span></span></span>' +
                        '<button class="btn btn-ghost btn-small gl-reset" type="button" hidden>' + ICON_RESET + text("glossary.reset") + "</button>" +
                    "</div>" +
                    '<p class="sr-only gl-live" aria-live="polite" aria-atomic="true"></p>' +
                "</div>" +

                '<ul class="gl-grid" id="gl-grid" data-i18n-attr="aria-label:glossary.gridLabel" aria-label="' + esc(t("glossary.gridLabel")) + '">' +
                    TERMS.map(cardHTML).join("") +
                "</ul>" +

                '<div class="gl-empty card" hidden>' +
                    '<div class="gl-empty-orb" aria-hidden="true">🔭</div>' +
                    '<p class="gl-empty-title"></p>' +
                    '<p class="gl-empty-hint">' + text("glossary.emptyHint") + "</p>" +
                    '<div class="gl-suggest" hidden>' +
                        '<p class="gl-label mono">' + text("glossary.suggest") + "</p>" +
                        '<div class="gl-suggest-list"></div>' +
                    "</div>" +
                    '<button class="btn btn-primary btn-small gl-empty-reset" type="button">' + ICON_RESET + text("glossary.reset") + "</button>" +
                "</div>" +

                '<div class="gl-foot">' +
                    '<button class="btn btn-ghost gl-more-btn" type="button" aria-expanded="false" aria-controls="gl-grid">' +
                        '<span class="gl-more-text"></span>' + ICON_CHEVRON +
                    "</button>" +
                "</div>" +
            "</div>";

        // Handy references to the parts we update later
        root = mount.querySelector(".gl");
        ui = {
            console: root.querySelector(".gl-console"),
            input: root.querySelector(".gl-input"),
            clear: root.querySelector(".gl-clear"),
            random: root.querySelector(".gl-random"),
            filterToggle: root.querySelector(".gl-filter-toggle"),
            filterBadge: root.querySelector(".gl-filter-badge"),
            filterNum: root.querySelector(".gl-filter-num"),
            cats: root.querySelector(".gl-cats"),
            chips: Array.prototype.slice.call(root.querySelectorAll(".gl-chip")),
            alpha: root.querySelector(".gl-alpha"),
            count: root.querySelector(".gl-count"),
            countBar: root.querySelector(".gl-count-bar span"),
            reset: root.querySelector(".gl-reset"),
            live: root.querySelector(".gl-live"),
            grid: root.querySelector(".gl-grid"),
            empty: root.querySelector(".gl-empty"),
            emptyTitle: root.querySelector(".gl-empty-title"),
            suggest: root.querySelector(".gl-suggest"),
            suggestList: root.querySelector(".gl-suggest-list"),
            emptyReset: root.querySelector(".gl-empty-reset"),
            foot: root.querySelector(".gl-foot"),
            moreBtn: root.querySelector(".gl-more-btn"),
            moreText: root.querySelector(".gl-more-text"),
            explored: root.querySelector(".gl-explored"),
            exploredBar: root.querySelector(".gl-explored-bar span"),
            exploredNum: root.querySelector(".gl-explored-num")
        };

        // Every card and the parts inside it, by term id
        TERMS.forEach(function (term) {
            const card = ui.grid.querySelector('[data-id="' + term.id + '"]');
            cards[term.id] = {
                term: term,
                el: card,
                name: card.querySelector(".gl-name"),
                alt: card.querySelector(".gl-alt-text"),
                def: card.querySelector(".gl-def"),
                ex: card.querySelector(".gl-ex-text"),
                toggle: card.querySelector(".gl-toggle"),
                rels: Array.prototype.slice.call(card.querySelectorAll(".gl-rel")),
                learn: Array.prototype.slice.call(card.querySelectorAll(".gl-learn-link")),
                html: { name: "", def: "", alt: "" },   // what markCard() wrote last
                spotTimer: 0
            };
            translateCard(cards[term.id]);
        });

        listen();
        A.onLanguageChange(onLanguageChange);
        buildLetters();
        sortCards();
        render({ everyCard: true });
        updateExplored();
    }

    // ---------- 8. Searching: one matching function ----------
    // The text a term can be found by: its name, other names, short definition and
    // full explanation in the current language, plus its names in the other language.
    function haystack(term) {
        const here = term[A.lang];
        const there = term[otherLang()];
        return normalize([termName(term)].concat(here.aliases, termShort(term), termDef(term), there.name, there.aliases).map(plainAlias).join(" \n "));
    }

    function matchesQuery(term, words) {
        if (!words.length) return true;
        const text = haystack(term);
        return words.every(function (word) { return text.indexOf(word) !== -1; });
    }

    // How well a found term fits the search (smaller is better):
    // 0 = its name starts with the search, 1 = the name contains it,
    // 2 = another name contains it, 3 = only the definitions do
    function relevance(term, words) {
        const name = normalize(termName(term));
        const has = function (text) {
            return words.every(function (word) { return text.indexOf(word) !== -1; });
        };
        if (name.indexOf(words[0]) === 0 && has(name)) return 0;
        if (has(name)) return 1;
        const there = term[otherLang()];
        if (has(normalize([there.name].concat(term[A.lang].aliases, there.aliases).map(plainAlias).join(" \n ")))) return 2;
        return 3;
    }

    // The terms that contain every word, the best matches first (then A–Z)
    function containing(words) {
        const found = sorted.filter(function (term) { return matchesQuery(term, words); });
        const score = {};
        found.forEach(function (term) { score[term.id] = relevance(term, words); });
        return found.sort(function (a, b) { return score[a.id] - score[b.id]; });
    }

    // What the search box shows: { terms, words }, the terms in order and the words
    // to mark in them. The box, the assistant and the palette find terms the same way:
    //  1. the terms whose names or definition contain every typed word
    //     ("lea" finds "Machine learning");
    //  2. if there are none: the term the text mentions, found by find() like the
    //     assistant and the palette do ("what is a neural network?");
    //  3. if still none: 1 and 2 again for the other keyboard layout ("ntcn" = "тест").
    // A search without letters or digits ("(", "🤖") finds every term.
    function search(query) {
        const words = wordsOf(query);
        if (!words.length) return { terms: sorted, words: [] };

        const typed = normalize(query);
        const tries = [typed];
        const other = A.switchLayout(typed);
        if (other !== typed) tries.push(other);

        for (let i = 0; i < tries.length; i++) {
            const tryWords = wordsOf(tries[i]);
            const terms = containing(tryWords);
            if (terms.length) return { terms: terms, words: tryWords };
            const best = mentioned(tries[i]);
            if (best) return { terms: [best.term], words: best.stems.map(plainAlias) };
        }
        return { terms: [], words: words };
    }

    // A search only counts as a filter when it has words
    function queryActive() {
        return wordsOf(state.query).length > 0;
    }

    function filtersActive() {
        return queryActive() || state.cat !== "all" || Boolean(state.letter);
    }

    function firstLetter(term) {
        return termName(term).charAt(0).toLocaleUpperCase(A.lang);
    }

    // Wraps every search word found in the text in <mark>, safely escaped
    function highlight(raw, words) {
        if (!words.length) return esc(raw);
        const lower = normalize(raw);
        const ranges = [];
        words.forEach(function (word) {
            let from = lower.indexOf(word);
            while (from !== -1) {
                ranges.push([from, from + word.length]);
                from = lower.indexOf(word, from + word.length);
            }
        });
        if (!ranges.length) return esc(raw);

        // Sort and join overlapping pieces
        ranges.sort(function (a, b) { return a[0] - b[0]; });
        const merged = [ranges[0]];
        ranges.slice(1).forEach(function (range) {
            const last = merged[merged.length - 1];
            if (range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
            else merged.push(range);
        });

        let html = "";
        let position = 0;
        merged.forEach(function (range) {
            html += esc(raw.slice(position, range[0])) + "<mark>" + esc(raw.slice(range[0], range[1])) + "</mark>";
            position = range[1];
        });
        return html + esc(raw.slice(position));
    }

    // ---------- 9. Filling the cards ----------
    // The parts of a card that only change with the language
    function translateCard(card) {
        const term = card.term;
        card.alt.setAttribute("lang", otherLang());
        card.ex.textContent = term[A.lang].ex;
        // Screen readers hear which term the button belongs to: "Read more: Data"
        card.toggle.setAttribute("aria-label", t("glossary.moreLabel", { term: termName(term) }));
        card.rels.forEach(function (button) {
            button.querySelector(".gl-rel-name").textContent = termName(BY_ID[button.getAttribute("data-target")]);
        });
        // "Lesson 3: Neural Networks", "AI Lab: How computers see" (names from the lessons and the lab)
        card.learn.forEach(function (link) {
            const lesson = Number(link.getAttribute("data-lesson"));
            const lab = link.getAttribute("data-lab");
            link.querySelector(".gl-learn-text").textContent = lesson
                ? t("glossary.lessonLink", { n: A.format.number(lesson), title: A.lessons.title(lesson) })
                : t("glossary.labLink", { title: t(site.labs[lab].titleKey) });
        });
    }

    // The term's name, its name in the other language and its definition (the short one,
    // or the full explanation while the card is open), with the search words marked.
    // A part is only written when it changed: while you type, most of them stay the same.
    function markCard(card, words) {
        const term = card.term;
        setHTML(card, "name", highlight(termName(term), words));
        setHTML(card, "def", highlight(state.open.has(term.id) ? termDef(term) : termShort(term), words));
        setHTML(card, "alt", highlight(term[otherLang()].name, words));
    }

    function setHTML(card, part, html) {
        if (card.html[part] === html) return;
        card.html[part] = html;
        card[part].innerHTML = html;
    }

    // ---------- 10. Alphabet strip ----------
    let letterButtons = [];

    // One button per first letter in the current language, after an "all letters" button.
    // The buttons are reused when the language changes, so a focused one keeps the focus.
    function buildLetters() {
        const letters = [];
        TERMS.forEach(function (term) {
            const letter = firstLetter(term);
            if (letters.indexOf(letter) === -1) letters.push(letter);
        });
        letters.sort(function (a, b) { return a.localeCompare(b, A.lang); });

        // A letter that doesn't exist in the new language is forgotten
        if (state.letter && letters.indexOf(state.letter) === -1) state.letter = "";

        const wanted = [""].concat(letters);
        const focused = letterButtons.indexOf(document.activeElement);
        while (letterButtons.length > wanted.length) letterButtons.pop().remove();
        while (letterButtons.length < wanted.length) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "gl-letter";
            ui.alpha.appendChild(button);
            letterButtons.push(button);
        }
        wanted.forEach(function (letter, i) {
            const button = letterButtons[i];
            button.classList.toggle("gl-letter-all", !letter);
            button.setAttribute("data-letter", letter);
            button.setAttribute("aria-pressed", String(state.letter === letter));
            button.setAttribute("aria-label", letter ? t("glossary.letterLabel", { letter: letter }) : t("glossary.lettersAllLabel"));
            button.textContent = letter || t("glossary.lettersAll");
        });
        // The focused button was one too many for the new language: the last one takes the focus
        if (focused >= letterButtons.length) letterButtons[letterButtons.length - 1].focus({ preventScroll: true });
    }

    // ---------- 11. Sorting ----------
    let sorted = TERMS.slice();

    // A–Z in the current language (render() puts the cards in place)
    function sortCards() {
        sorted = TERMS.slice().sort(function (a, b) {
            return termName(a).localeCompare(termName(b), A.lang);
        });
    }

    // ---------- 12. Showing the cards that match the search and filters ----------
    const running = new WeakMap();      // the glide animation of each card
    let pageOrder = "";                 // the order of the cards on the page
    let shownIdeas = "";                // the "did you mean" suggestions on the page
    let markedWords = [];               // the search words marked in the cards now

    // Puts the cards in this order on the page (only if it changed)
    function placeCards(list) {
        const order = list.map(function (term) { return term.id; }).join(",");
        if (order === pageOrder) return;
        pageOrder = order;

        // Moving a focused element would make it lose focus, so remember it
        const active = document.activeElement;
        const fragment = document.createDocumentFragment();
        list.forEach(function (term) { fragment.appendChild(cards[term.id].el); });
        ui.grid.appendChild(fragment);
        if (active && active !== document.activeElement && ui.grid.contains(active)) {
            active.focus({ preventScroll: true });
        }
    }

    // Shows the cards that pass the search and the filters, and updates everything
    // around them. Only what changed is written, so typing stays fast. options:
    //   animate     cards glide to their new places
    //   announce    screen readers hear the new count (after something the user did)
    //   everyCard   refill the hidden cards too (the language changed)
    function render(options) {
        const settings = options || {};
        const found = search(state.query);
        const words = found.words;
        const byQuery = found.terms;
        markedWords = words;
        const active = filtersActive();

        // Counts on the category chips (search + letter, any category)
        const catCounts = { all: 0 };
        CATEGORIES.forEach(function (cat) { catCounts[cat] = 0; });
        byQuery.forEach(function (term) {
            if (state.letter && firstLetter(term) !== state.letter) return;
            catCounts.all++;
            catCounts[term.cat]++;
        });
        ui.chips.forEach(function (chip) {
            const cat = chip.getAttribute("data-cat");
            A.dom.setAttr(chip, "aria-pressed", String(state.cat === cat));
            A.dom.setText(chip.querySelector(".gl-chip-count"), catCounts[cat]);
            chip.classList.toggle("is-zero", catCounts[cat] === 0);
        });

        // Letters with no matching term (search + category) are switched off
        const letterCounts = {};
        byQuery.forEach(function (term) {
            if (state.cat !== "all" && term.cat !== state.cat) return;
            const letter = firstLetter(term);
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        });
        letterButtons.forEach(function (button) {
            const letter = button.getAttribute("data-letter");
            A.dom.setAttr(button, "aria-pressed", String(state.letter === letter));
            const off = Boolean(letter) && !letterCounts[letter] && state.letter !== letter;
            if (button.disabled !== off) button.disabled = off;
        });

        // Which terms pass every filter
        const matches = byQuery.filter(function (term) {
            if (state.cat !== "all" && term.cat !== state.cat) return false;
            if (state.letter && firstLetter(term) !== state.letter) return false;
            return true;
        });
        const preview = !active && !state.showAll;
        const visible = preview ? matches.slice(0, PREVIEW_COUNT) : matches;
        const visibleIds = new Set(visible.map(function (term) { return term.id; }));

        // Remember where cards are now, to animate them to their new place
        const before = new Map();
        const canAnimate = settings.animate && A.motion.ok();
        if (canAnimate) {
            TERMS.forEach(function (term) {
                const el = cards[term.id].el;
                if (!el.hidden) before.set(el, el.getBoundingClientRect());
            });
        }

        // Hidden cards keep their old marks until they are shown again
        TERMS.forEach(function (term) {
            const card = cards[term.id];
            const shown = visibleIds.has(term.id);
            A.dom.setHidden(card.el, !shown);
            if (shown || settings.everyCard) markCard(card, words);
        });
        placeCards(visible.concat(sorted.filter(function (term) { return !visibleIds.has(term.id); })));

        // Counter, reset button, empty state and "show all"
        A.dom.setText(ui.count, A.plural("glossary.count", visible.length, { total: TERMS.length }));
        ui.countBar.style.transform = "scaleX(" + (visible.length / TERMS.length).toFixed(3) + ")";
        A.dom.setHidden(ui.reset, !active);
        A.dom.setHidden(ui.clear, !state.query);
        const chosen = (state.cat !== "all" ? 1 : 0) + (state.letter ? 1 : 0);
        A.dom.setHidden(ui.filterBadge, chosen === 0);
        A.dom.setText(ui.filterNum, chosen);

        const nothing = matches.length === 0;
        A.dom.setHidden(ui.empty, !nothing);
        A.dom.setHidden(ui.grid, nothing);
        if (nothing) renderEmpty();

        A.dom.setHidden(ui.foot, active || TERMS.length <= PREVIEW_COUNT);
        A.dom.setAttr(ui.moreBtn, "aria-expanded", String(state.showAll));
        A.dom.setText(ui.moreText, state.showAll ? t("glossary.showLess") : A.plural("glossary.showAll", TERMS.length));

        // Screen readers hear the new count a moment after typing stops
        if (settings.announce) {
            A.announce(nothing ? ui.emptyTitle.textContent : ui.count.textContent, { region: ui.live, delay: ANNOUNCE_DELAY });
        }

        markLooseRows();
        if (canAnimate) animateCards(before);
    }

    // Closed cards in a row are stretched to the same height, so it looks tidy.
    // Next to an open card that would leave big empty gaps, so cards that share
    // a row with an open card keep their own height instead ("loose").
    function markLooseRows() {
        const shown = Array.prototype.filter.call(ui.grid.children, function (el) { return !el.hidden; });
        const openTops = new Set();
        shown.forEach(function (el) {
            if (el.classList.contains("is-open")) openTops.add(el.offsetTop);
        });
        // Read every position first, then change classes: reading after a change
        // would make the browser lay the page out again for every card.
        // (With no open card there is nothing to measure, which keeps typing fast.)
        const tops = openTops.size ? shown.map(function (el) { return el.offsetTop; }) : [];
        shown.forEach(function (el, i) {
            el.classList.toggle("is-loose", openTops.size > 0 && !el.classList.contains("is-open") && openTops.has(tops[i]));
        });
    }

    // FLIP animation: cards glide from their old place to the new one,
    // new cards fade and grow in. Only cards near the screen are animated.
    function animateCards(before) {
        // First read where every card is now (one layout for all of them)...
        const screenBottom = window.innerHeight + ANIMATE_MARGIN;
        const near = [];
        Array.prototype.forEach.call(ui.grid.children, function (el) {
            if (el.hidden) return;
            const now = el.getBoundingClientRect();
            if (now.bottom < -ANIMATE_MARGIN || now.top > screenBottom) return;
            near.push({ el: el, now: now, old: before.get(el) });
        });

        // ...then start the animations
        const ease = A.motion.ease;
        let entering = 0;
        near.forEach(function (item) {
            const previous = running.get(item.el);
            if (previous) previous.cancel();

            let animation = null;
            if (item.old) {
                const dx = item.old.left - item.now.left;
                const dy = item.old.top - item.now.top;
                if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                    animation = item.el.animate(
                        [{ transform: "translate(" + dx + "px, " + dy + "px)" }, { transform: "none" }],
                        { duration: GLIDE_MS, easing: ease }
                    );
                }
            } else {
                animation = item.el.animate(
                    [{ opacity: 0, transform: "translateY(14px) scale(0.96)" }, { opacity: 1, transform: "none" }],
                    { duration: GROW_IN_MS, delay: Math.min(entering++, GROW_STAGGER_MAX) * GROW_STAGGER_MS, easing: ease, fill: "backwards" }
                );
            }
            if (animation) running.set(item.el, animation);
        });
    }

    // "Nothing found" and the "did you mean?" buttons
    function renderEmpty() {
        const query = queryActive() ? state.query.trim() : "";
        A.dom.setText(ui.emptyTitle, query ? t("glossary.emptyQuery", { query: query }) : t("glossary.emptyFilters"));

        const ideas = query ? suggestions(query) : [];
        A.dom.setHidden(ui.suggest, ideas.length === 0);
        // The same suggestions as before (after a language change, say) keep their
        // buttons, so a focused one keeps the focus: only the names change
        const ids = ideas.map(function (term) { return term.id; }).join(",");
        if (ids !== shownIdeas) {
            shownIdeas = ids;
            ui.suggestList.innerHTML = ideas.map(function (term) {
                return '<button class="chip gl-rel gl-suggestion" type="button" data-target="' + term.id + '">' +
                    '<span aria-hidden="true">' + term.icon + '</span><span class="gl-suggestion-name"></span>' +
                "</button>";
            }).join("");
        }
        ui.suggestList.querySelectorAll(".gl-suggestion-name").forEach(function (name, i) {
            A.dom.setText(name, termName(ideas[i]));
        });
    }

    function updateExplored() {
        const n = state.explored.size;
        ui.exploredBar.style.transform = "scaleX(" + (n / TERMS.length).toFixed(3) + ")";
        ui.exploredNum.textContent = n + "/" + TERMS.length;
        ui.explored.setAttribute("aria-label", t("glossary.exploredLabel", { n: n, total: TERMS.length }));
        ui.explored.classList.toggle("is-complete", n === TERMS.length);
    }

    function resetFilters() {
        state.query = "";
        state.cat = "all";
        state.letter = "";
        ui.input.value = "";
    }

    // ---------- 13. Opening cards ----------
    function setOpen(id, open) {
        const card = cards[id];
        if (!card) return;
        card.el.classList.toggle("is-open", open);
        card.toggle.setAttribute("aria-expanded", String(open));
        if (open) state.open.add(id);
        else state.open.delete(id);
        markCard(card, markedWords);      // the short definition becomes the full one (and back)
        if (open) {
            A.track("glossary.explore", { id: id });
            if (!state.explored.has(id)) {
                state.explored.add(id);
                A.storage.set("glossary.explored", Array.from(state.explored));
                card.el.classList.add("is-explored");
                updateExplored();
                if (state.explored.size === TERMS.length) A.toast(t("glossary.allExplored"), "🏆");
            }
        }
        markLooseRows();
    }

    // A short glowing pulse around a card (from the start if it is already glowing)
    function spotlight(card) {
        A.dom.replay(card.el, "is-spotlight");
        clearTimeout(card.spotTimer);
        card.spotTimer = setTimeout(function () { card.el.classList.remove("is-spotlight"); }, SPOTLIGHT_MS);
    }

    // Scrolls so the whole card, at its opened size, is on screen
    // (centred if it fits, otherwise its top just under the menu)
    function scrollToCard(card) {
        let top = 0;
        for (let element = card.el; element; element = element.offsetParent) top += element.offsetTop;
        const inner = card.el.querySelector(".gl-more-inner");
        const height = card.el.offsetHeight + Math.max(0, inner.scrollHeight - inner.offsetHeight);
        const nav = A.layout.navHeight();
        const room = window.innerHeight - nav;
        const y = height + 2 * CARD_SPACE < room ? top - nav - (room - height) / 2 : top - nav - CARD_SPACE;
        window.scrollTo({ top: Math.max(0, y), behavior: A.motion.ok() ? "smooth" : "auto" });
    }

    // Scrolls to a term, opens it and makes it glow.
    // options.focus moves keyboard focus to it as well.
    // An id of SAME_AS shows its term ("k-means" shows "Clustering").
    function show(name, options) {
        const term = termById(name);
        if (!term) return false;
        const id = term.id;
        options = options || {};

        // Build the glossary first, and the parts of the page above it, so the card's
        // place is known. Windows in the way (the lesson reader, the phone menu...) close.
        ensure();
        A.buildParts(mount);
        A.overlays.closeAll({ navigating: true, reason: "navigate" });

        const card = cards[id];

        if (card.el.hidden) {
            // Hidden by a filter: clear the filters so it can be seen.
            // (Scroll anchoring would fight our own scrolling to the card, so it waits.)
            A.dom.pauseScrollAnchoring();
            if (filtersActive()) resetFilters();
            state.showAll = true;
            render();
        }
        if (!card.el.classList.contains("is-open")) setOpen(id, true);

        // Show it at once (no fade-in) so it can glow straight away
        if (A.effects && A.effects.reveal) A.effects.reveal(card.el);
        scrollToCard(card);
        spotlight(card);

        if (options.focus) {
            // A short delay, so the palette or menu can close first
            setTimeout(function () { card.toggle.focus({ preventScroll: true }); }, FOCUS_DELAY);
        }
        return true;
    }

    // ---------- 14. Events ----------
    // After something the user did: cards glide, and screen readers hear the count
    function update() {
        render({ animate: true, announce: true });
    }

    // Wired up once, when the glossary is built
    function listen() {
        ui.input.addEventListener("input", function () {
            state.query = ui.input.value;
            update();
        });

        ui.input.addEventListener("keydown", function (event) {
            // Enter or Escape that only ends typing with an input method (Chinese,
            // Japanese... keyboards) belongs to that, not to the search
            if (event.isComposing || event.keyCode === 229) return;
            if (event.key === "Escape" && ui.input.value) {
                event.preventDefault();
                event.stopPropagation();
                ui.input.value = "";
                state.query = "";
                update();
            } else if (event.key === "Enter") {
                event.preventDefault();
                const first = ui.grid.querySelector(".gl-card:not([hidden])");
                if (first && !ui.grid.hidden) show(first.getAttribute("data-id"), { focus: true });
            }
        });

        ui.clear.addEventListener("click", function () {
            ui.input.value = "";
            state.query = "";
            update();
            ui.input.focus();
        });

        ui.cats.addEventListener("click", function (event) {
            const chip = event.target.closest(".gl-chip");
            if (!chip) return;
            const cat = chip.getAttribute("data-cat");
            state.cat = state.cat === cat && cat !== "all" ? "all" : cat;
            update();
        });

        ui.alpha.addEventListener("click", function (event) {
            const button = event.target.closest(".gl-letter");
            if (!button || button.disabled) return;
            const letter = button.getAttribute("data-letter");
            state.letter = state.letter === letter ? "" : letter;
            update();
        });

        function onReset() {
            resetFilters();
            update();
            ui.input.focus({ preventScroll: true });
        }
        ui.reset.addEventListener("click", onReset);
        ui.emptyReset.addEventListener("click", onReset);

        // On phones the long example doesn't fit in the search box, so a shorter text
        // is shown there. data-i18n-attr tells core.js which text to use after a language change.
        // (A.onMedia calls this now, and again whenever the screen crosses the phone width.)
        A.onMedia(A.queries.phone, function (phone) {
            const key = phone ? "glossary.searchPlaceholderShort" : "glossary.searchPlaceholder";
            ui.input.setAttribute("data-i18n-attr", "placeholder:" + key);
            ui.input.placeholder = t(key);
        });

        // The light scanning the console's top edge and the floating orb of the empty
        // state loop forever: they pause while off screen (A.whenVisible sets data-paused).
        [ui.console, ui.empty].forEach(function (element) {
            A.whenVisible(element, function () {}, { pauseAnimations: true });
        });

        ui.filterToggle.addEventListener("click", function () {
            const open = !root.classList.contains("filters-open");
            root.classList.toggle("filters-open", open);
            ui.filterToggle.setAttribute("aria-expanded", String(open));
        });

        // The number of columns can change with the window size
        if ("ResizeObserver" in window) {
            let lastWidth = 0;
            new ResizeObserver(function (entries) {
                const width = Math.round(entries[0].contentRect.width);
                if (width !== lastWidth) {
                    lastWidth = width;
                    markLooseRows();
                }
            }).observe(ui.grid);
        }

        ui.random.addEventListener("click", function () {
            const dice = ui.random.querySelector(".gl-dice");
            if (A.motion.ok() && dice.animate) {
                dice.animate(
                    [{ transform: "rotate(0) scale(1)" }, { transform: "rotate(200deg) scale(1.25)" }, { transform: "rotate(360deg) scale(1)" }],
                    { duration: DICE_MS, easing: A.motion.ease }
                );
            }
            // Focus stays on the button (so you can roll again); screen readers hear the term
            const term = randomTerm();
            show(term.id);
            A.announce(t("glossary.randomAnnounce", { term: termName(term) }), { region: ui.live });
        });

        ui.moreBtn.addEventListener("click", function () {
            const top = ui.moreBtn.getBoundingClientRect().top;
            state.showAll = !state.showAll;
            render({ animate: state.showAll, announce: true });
            // Showing fewer: keep the button in the same place on screen
            if (!state.showAll) {
                window.scrollBy({ top: ui.moreBtn.getBoundingClientRect().top - top, behavior: "instant" });
            }
        });

        ui.grid.addEventListener("click", function (event) {
            const toggle = event.target.closest(".gl-toggle");
            if (toggle) {
                const id = toggle.closest(".gl-card").getAttribute("data-id");
                setOpen(id, !state.open.has(id));
                return;
            }
            const related = event.target.closest(".gl-rel");
            if (related) {
                show(related.getAttribute("data-target"), { focus: true });
                return;
            }
            // "Learn it on this site": the lesson or the experiment opens through its feature
            // (the link's own address, #lesson-3 or #lab/vision, works too, but the lesson
            // reader then can't give the focus back to the link when it closes)
            const learn = event.target.closest(".gl-learn-link");
            if (!learn || event.ctrlKey || event.metaKey || event.shiftKey || event.button) return;
            const lesson = Number(learn.getAttribute("data-lesson"));
            if (lesson && A.lessons && typeof A.lessons.open === "function") {
                event.preventDefault();
                A.lessons.open(lesson, learn);
            } else if (learn.getAttribute("data-lab") && A.lab && typeof A.lab.open === "function") {
                event.preventDefault();
                A.lab.open(learn.getAttribute("data-lab"), { focus: true });
            }
        });

        ui.suggestList.addEventListener("click", function (event) {
            const button = event.target.closest(".gl-suggestion");
            if (button) show(button.getAttribute("data-target"), { focus: true });
        });
    }

    // ---------- 15. Language changes: same search, same open cards ----------
    function onLanguageChange() {
        // Quietly forget the announcement still waiting (it is in the old language)
        A.announce("", { region: ui.live, delay: 0 });
        buildLetters();
        sortCards();
        TERMS.forEach(function (term) { translateCard(cards[term.id]); });
        render({ everyCard: true });
        updateExplored();
    }

    // ---------- 16. Start ----------
    // The glossary is far down the page, so it is built only when it comes near the
    // screen, when the browser has a quiet moment after loading, or as soon as
    // something needs it (ensure(): a palette command, a link to a term...).
    const ensure = A.whenNeeded(mount, build);

    // A link like index.html#term-neural-network opens that term
    // (an id of SAME_AS too: #term-k-means opens "Clustering")
    function openFromHash() {
        const match = /^#term-([a-z0-9-]+)$/.exec(window.location.hash);
        if (match && termById(match[1])) show(match[1]);
    }
    window.addEventListener("hashchange", openFromHash);
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { setTimeout(openFromHash, HASH_DELAY); });
    } else {
        openFromHash();
    }

    // ---------- 17. Palette commands and the public API ----------
    // Ctrl+K palette: one command per term ("Glossary: Neural network")
    TERMS.forEach(function (term) {
        const words = ["glossary", "словарь", "term", "термин", term.id];
        ["en", "ru"].forEach(function (lang) {
            words.push(term[lang].name);
            term[lang].aliases.forEach(function (alias) { words.push(plainAlias(alias)); });
        });

        A.registerCommand({
            id: "glossary-" + term.id,
            group: "glossary.cmdGroup",
            icon: term.icon,
            title: function () { return t("glossary.cmdTitle", { term: termName(term) }); },
            keywords: words.join(" "),
            run: function () { show(term.id, { focus: true }); }
        });
    });

    // AICompass.glossary: the assistant, the palette, the timeline, the lessons, the
    // lab, site search and My Compass use it. Everything works from the data alone
    // (before the glossary is built); show(id, { focus }) builds it if needed, scrolls
    // to the term and opens it.
    // A term is given as { id, term, short, definition, example, aliases, category,
    // categoryId, icon, lessons, lab, related }, in the current language.
    A.feature("glossary", {
        // find("What is a neural network?") -> a term, or null
        find: find,
        // A random term
        random: function () { return info(randomTerm()); },
        // A term by its id (or by an id of SAME_AS: "k-means" gives "clustering"), or null
        term: function (id) {
            const term = termById(id);
            return term ? info(term) : null;
        },
        // All term ids, in the order they are defined
        ids: TERMS.map(function (term) { return term.id; }),
        // Every term, in the order they are defined (for site search)
        terms: function () { return TERMS.map(info); },
        // The ids of the terms this visitor has opened (on any visit)
        explored: function () { return Array.from(state.explored); },
        // Scrolls to a term, opens it and makes it glow ({ focus: true } also focuses it)
        show: show
    });
})();
