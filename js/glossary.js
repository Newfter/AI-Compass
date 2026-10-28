/* =========================================================
   AI COMPASS — GLOSSARY
   A bilingual A–Z dictionary of the key words of AI.
   This file builds:
   1. a search box (live filter, highlighted matches, "did you mean?")
   2. category chips with counts and an alphabet strip
   3. a grid of term cards that open to show an everyday
      example and related terms
   4. window.AICompass.glossary = { find, random, show, term }
      so other features (assistant, timeline...) can use it
   5. one Ctrl+K palette command per term
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="glossary"]');
    if (!A || !mount) return;

    const t = A.t;
    const esc = A.escapeHTML;

    // Without any filter, only the first few cards are shown,
    // so the page doesn't get too long. "Show all" shows the rest.
    const PREVIEW_COUNT = 12;

    // ---------- 1. The terms (from js/content/glossary.js) ----------
    // categories: the category ids, in the order of their chips.
    // terms: every term with its words in both languages (see the content file).
    const data = A.content.get("glossary");
    if (!data) return;
    const CATEGORIES = data.categories;
    const TERMS = data.terms;

    // Terms by id. Object.create(null) makes an empty object without built-in
    // names, so an id like "constructor" can never find something by accident.
    const BY_ID = Object.create(null);
    TERMS.forEach(function (term) { BY_ID[term.id] = term; });

    // ---------- 4. Small helpers ----------

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

    // A term's words in the current language
    function termName(term) {
        return term[A.lang].name;
    }

    function termDef(term) {
        return term[A.lang].def;
    }

    // A short public description of a term, in the current language
    function info(term) {
        return {
            id: term.id,
            term: termName(term),
            definition: termDef(term),
            example: term[A.lang].ex,
            category: t("glossary.cat." + term.cat),
            icon: term.icon
        };
    }

    // ---------- 5. Finding a term inside any text (for the assistant) ----------
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

    // Aliases are written without their "*" wherever people can see or type them
    function plainAlias(alias) {
        return alias.replace(/\*$/, "");
    }

    // Returns the term mentioned in the text (the longest match wins:
    // "generative AI" beats "AI"), or null when there is none.
    function find(text) {
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
        return best ? info(best.term) : null;
    }

    let lastRandom = "";

    function randomTerm() {
        let term;
        do {
            term = TERMS[Math.floor(Math.random() * TERMS.length)];
        } while (term.id === lastRandom && TERMS.length > 1);
        lastRandom = term.id;
        return term;
    }

    // ---------- 6. "Did you mean...?" ----------
    // The Levenshtein distance counts how many letters you must add, remove
    // or change to turn one word into another ("nueral" -> "neural" = 2).
    function distance(a, b) {
        if (Math.abs(a.length - b.length) > 3) return 99;
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
    // Every typed word must be close to a word of the term:
    // 1 typo allowed in short words, 2 in longer ones.
    function suggestions(query) {
        const typed = wordsOf(query).filter(function (word) { return word.length >= 3; });
        if (!typed.length) return [];
        const scored = [];

        TERMS.forEach(function (term) {
            let best = 99;
            spellings(term).forEach(function (words) {
                let total = 0;
                for (let i = 0; i < typed.length; i++) {
                    const q = typed[i];
                    let closest = 99;
                    words.forEach(function (word) {
                        closest = Math.min(closest, distance(q, word));
                        // Compare with the start of longer words too: "trnasf" ~ "transf(ormer)"
                        if (word.length > q.length) closest = Math.min(closest, distance(q, word.slice(0, q.length)) + 0.5);
                    });
                    if (closest > (q.length < 5 ? 1 : 2)) {
                        total = 99;
                        break;
                    }
                    total += closest;
                }
                best = Math.min(best, total);
            });
            if (best < 99) scored.push({ term: term, score: best });
        });

        scored.sort(function (a, b) { return a.score - b.score; });
        return scored.slice(0, 3).map(function (item) { return item.term; });
    }

    // ---------- 9. State ----------
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

    // ---------- 10. Building the page ----------
    const ICON_SEARCH = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    const ICON_CLOSE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
    const ICON_CHEVRON = '<svg class="gl-chevron" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ICON_RESET = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    // A translated piece of text. data-i18n lets core.js re-translate it by itself.
    function text(key, className) {
        return "<span" + (className ? ' class="' + className + '"' : "") + ' data-i18n="' + key + '">' + t(key) + "</span>";
    }

    function categoryChip(id) {
        return '<button class="chip gl-chip" type="button" data-cat="' + id + '" aria-pressed="' + (id === "all") + '">' +
            '<span class="gl-chip-dot" aria-hidden="true"></span>' +
            text("glossary.cat." + id) +
            '<span class="gl-chip-count mono">0</span>' +
        "</button>";
    }

    function cardHTML(term) {
        const id = term.id;
        return '<li class="gl-card card" id="term-' + id + '" data-id="' + id + '" data-cat="' + term.cat + '" data-reveal>' +
            '<div class="gl-card-top">' +
                '<span class="gl-icon" aria-hidden="true">' + term.icon + "</span>" +
                '<span class="gl-cat-tag mono">' + text("glossary.cat." + term.cat) + "</span>" +
                '<span class="gl-seen" data-i18n-attr="title:glossary.exploredBadge" title="' + esc(t("glossary.exploredBadge")) + '">' +
                    '<span aria-hidden="true">✓</span><span class="sr-only" data-i18n="glossary.exploredBadge">' + t("glossary.exploredBadge") + "</span>" +
                "</span>" +
            "</div>" +
            '<h3 class="gl-name" id="gl-name-' + id + '"></h3>' +
            '<p class="gl-alt">' +
                '<span class="gl-alt-code mono" aria-hidden="true" data-i18n="glossary.altCode">' + t("glossary.altCode") + "</span>" +
                '<span class="sr-only" data-i18n="glossary.altLabel">' + t("glossary.altLabel") + "</span> " +
                '<span class="gl-alt-text"></span>' +
            "</p>" +
            '<p class="gl-def"></p>' +
            '<button class="gl-toggle" type="button" aria-expanded="false" aria-controls="gl-more-' + id + '">' +
                text("glossary.more") + ICON_CHEVRON +
            "</button>" +
            '<div class="gl-more" id="gl-more-' + id + '">' +
                '<div class="gl-more-inner">' +
                    '<div class="gl-example">' +
                        '<p class="gl-label mono"><span aria-hidden="true">💡</span> ' + text("glossary.example") + "</p>" +
                        '<p class="gl-ex-text"></p>' +
                    "</div>" +
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

    // Builds the whole glossary (once: see "Start" below)
    function build() {
        mount.innerHTML =
            '<div class="gl">' +
                '<div class="gl-console card" data-reveal>' +
                    '<span class="gl-corner gl-corner-tl" aria-hidden="true"></span>' +
                    '<span class="gl-corner gl-corner-br" aria-hidden="true"></span>' +

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
                            '<span class="gl-filter-badge mono" hidden><span class="sr-only" data-i18n="glossary.filtersActive">' + t("glossary.filtersActive") + "</span> <span class=\"gl-filter-num\"></span></span>" +
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
                rels: Array.prototype.slice.call(card.querySelectorAll(".gl-rel"))
            };
        });

        listen();
        A.onLanguageChange(onLanguageChange);
        buildLetters();
        sortCards();
        render(false);
        updateExplored();
    }

    // ---------- 11. Searching and highlighting ----------
    // The text a term can be found by: its name, other names and definition
    // in the current language, plus its name in the other language.
    function haystack(term) {
        const here = term[A.lang];
        const there = term[otherLang()];
        return normalize([termName(term)].concat(here.aliases, termDef(term), there.name, there.aliases).map(plainAlias).join(" \n "));
    }

    function queryWords() {
        return wordsOf(state.query);
    }

    function matchesQuery(term, words) {
        if (!words.length) return true;
        const text = haystack(term);
        return words.every(function (word) { return text.indexOf(word) !== -1; });
    }

    // How well a found term fits the search (smaller is better):
    // 0 = its name starts with the search, 1 = the name contains it,
    // 2 = another name contains it, 3 = only the definition does
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

    // Puts the term's words (in the current language) into its card
    function fillCard(card, words) {
        const term = card.term;
        card.name.innerHTML = highlight(termName(term), words);
        card.def.innerHTML = highlight(termDef(term), words);
        card.alt.innerHTML = highlight(term[otherLang()].name, words);
        card.alt.setAttribute("lang", otherLang());
        card.ex.textContent = term[A.lang].ex;
        // Screen readers hear which term the button belongs to: "Example & related: Data"
        card.toggle.setAttribute("aria-label", t("glossary.moreLabel", { term: termName(term) }));
        card.rels.forEach(function (button) {
            button.querySelector(".gl-rel-name").textContent = termName(BY_ID[button.getAttribute("data-target")]);
        });
        card.el.classList.toggle("is-explored", state.explored.has(term.id));
    }

    // ---------- 12. Alphabet strip ----------
    let letterButtons = [];

    function buildLetters() {
        const letters = [];
        TERMS.forEach(function (term) {
            const letter = firstLetter(term);
            if (letters.indexOf(letter) === -1) letters.push(letter);
        });
        letters.sort(function (a, b) { return a.localeCompare(b, A.lang); });

        // A letter that doesn't exist in the new language is forgotten
        if (state.letter && letters.indexOf(state.letter) === -1) state.letter = "";

        ui.alpha.innerHTML =
            '<button class="gl-letter gl-letter-all" type="button" data-letter="" aria-pressed="' + (!state.letter) + '"' +
                ' aria-label="' + esc(t("glossary.lettersAllLabel")) + '">' + esc(t("glossary.lettersAll")) + "</button>" +
            letters.map(function (letter) {
                return '<button class="gl-letter" type="button" data-letter="' + esc(letter) + '" aria-pressed="' + (state.letter === letter) + '"' +
                    ' aria-label="' + esc(t("glossary.letterLabel", { letter: letter })) + '">' + esc(letter) + "</button>";
            }).join("");
        letterButtons = Array.prototype.slice.call(ui.alpha.querySelectorAll(".gl-letter"));
    }

    // ---------- 13. Sorting ----------
    let sorted = TERMS.slice();

    // A–Z in the current language (render() puts the cards in place)
    function sortCards() {
        sorted = TERMS.slice().sort(function (a, b) {
            return termName(a).localeCompare(termName(b), A.lang);
        });
    }

    // ---------- 14. Applying search + filters ----------
    let liveTimer = 0;
    const running = new WeakMap();

    function filtersActive() {
        return Boolean(state.query.trim()) || state.cat !== "all" || Boolean(state.letter);
    }

    // Puts the cards in this order on the page (only if it changed)
    let pageOrder = "";

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

    // animate: cards glide to their new places.
    // announce: screen readers hear the new count (only after something the user did).
    function render(animate, announce) {
        const words = queryWords();
        let byQuery = sorted.filter(function (term) { return matchesQuery(term, words); });

        // While searching, the best matches come first (then A–Z)
        if (words.length) {
            const score = {};
            byQuery.forEach(function (term) { score[term.id] = relevance(term, words); });
            byQuery = byQuery.slice().sort(function (a, b) { return score[a.id] - score[b.id]; });
        }

        // Counts on the category chips (search + letter, any category)
        const catCounts = { all: 0 };
        CATEGORIES.forEach(function (cat) { catCounts[cat] = 0; });
        byQuery.forEach(function (term) {
            if (state.letter && firstLetter(term) !== state.letter) return;
            catCounts.all++;
            catCounts[term.cat]++;
        });
        ui.cats.querySelectorAll(".gl-chip").forEach(function (chip) {
            const cat = chip.getAttribute("data-cat");
            chip.setAttribute("aria-pressed", String(state.cat === cat));
            chip.querySelector(".gl-chip-count").textContent = catCounts[cat];
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
            button.setAttribute("aria-pressed", String(state.letter === letter));
            button.disabled = Boolean(letter) && !letterCounts[letter] && state.letter !== letter;
        });

        // Which terms pass every filter
        const matches = byQuery.filter(function (term) {
            if (state.cat !== "all" && term.cat !== state.cat) return false;
            if (state.letter && firstLetter(term) !== state.letter) return false;
            return true;
        });
        const preview = !filtersActive() && !state.showAll;
        const visible = preview ? matches.slice(0, PREVIEW_COUNT) : matches;
        const visibleIds = new Set(visible.map(function (term) { return term.id; }));

        // Remember where cards are now, to animate them to their new place
        const before = new Map();
        const canAnimate = animate && A.motion.ok();
        if (canAnimate) {
            TERMS.forEach(function (term) {
                const el = cards[term.id].el;
                if (!el.hidden) before.set(el, el.getBoundingClientRect());
            });
        }

        TERMS.forEach(function (term) {
            const card = cards[term.id];
            card.el.hidden = !visibleIds.has(term.id);
            fillCard(card, words);
        });
        placeCards(visible.concat(sorted.filter(function (term) { return !visibleIds.has(term.id); })));

        // Counter, reset button, empty state and "show all"
        ui.count.textContent = A.plural("glossary.count", visible.length, { total: TERMS.length });
        ui.countBar.style.transform = "scaleX(" + (visible.length / TERMS.length).toFixed(3) + ")";
        ui.reset.hidden = !filtersActive();
        ui.clear.hidden = !state.query;
        const chosen = (state.cat !== "all" ? 1 : 0) + (state.letter ? 1 : 0);
        ui.filterBadge.hidden = chosen === 0;
        ui.filterNum.textContent = chosen;

        const nothing = matches.length === 0;
        ui.empty.hidden = !nothing;
        ui.grid.hidden = nothing;
        if (nothing) renderEmpty();

        ui.foot.hidden = filtersActive() || TERMS.length <= PREVIEW_COUNT;
        ui.moreBtn.setAttribute("aria-expanded", String(state.showAll));
        ui.moreText.textContent = state.showAll ? t("glossary.showLess") : A.plural("glossary.showAll", TERMS.length);

        // Tell screen readers the new count a moment after typing stops
        if (announce) {
            clearTimeout(liveTimer);
            liveTimer = setTimeout(function () {
                ui.live.textContent = nothing ? ui.emptyTitle.textContent : ui.count.textContent;
            }, 450);
        }

        markLooseRows();
        if (canAnimate) animateCards(before);
    }

    // Closed cards in a row are stretched to the same height, so it looks tidy.
    // Next to an open card that would leave big empty gaps, so cards that share
    // a row with an open card keep their own height instead ("loose").
    function markLooseRows() {
        const openTops = new Set();
        const shown = Array.prototype.filter.call(ui.grid.children, function (el) { return !el.hidden; });
        shown.forEach(function (el) {
            if (el.classList.contains("is-open")) openTops.add(el.offsetTop);
        });
        // (With no open card there is nothing to measure, which keeps the start-up fast)
        shown.forEach(function (el) {
            el.classList.toggle("is-loose", openTops.size > 0 && !el.classList.contains("is-open") && openTops.has(el.offsetTop));
        });
    }

    // FLIP animation: cards glide from their old place to the new one,
    // new cards fade and grow in. Only cards near the screen are animated.
    function animateCards(before) {
        let entering = 0;
        const screenBottom = window.innerHeight + 200;
        const ease = A.motion.ease;

        Array.prototype.forEach.call(ui.grid.children, function (el) {
            if (el.hidden) return;
            const now = el.getBoundingClientRect();
            if (now.bottom < -200 || now.top > screenBottom) return;

            const previous = running.get(el);
            if (previous) previous.cancel();

            const old = before.get(el);
            let animation = null;
            if (old) {
                const dx = old.left - now.left;
                const dy = old.top - now.top;
                if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                    animation = el.animate(
                        [{ transform: "translate(" + dx + "px, " + dy + "px)" }, { transform: "none" }],
                        { duration: 420, easing: ease }
                    );
                }
            } else {
                animation = el.animate(
                    [{ opacity: 0, transform: "translateY(14px) scale(0.96)" }, { opacity: 1, transform: "none" }],
                    { duration: 380, delay: Math.min(entering++, 8) * 35, easing: ease, fill: "backwards" }
                );
            }
            if (animation) running.set(el, animation);
        });
    }

    function renderEmpty() {
        const query = state.query.trim();
        ui.emptyTitle.textContent = query ? t("glossary.emptyQuery", { query: query }) : t("glossary.emptyFilters");

        const ideas = query ? suggestions(query) : [];
        ui.suggest.hidden = ideas.length === 0;
        ui.suggestList.innerHTML = ideas.map(function (term) {
            return '<button class="chip gl-rel gl-suggestion" type="button" data-target="' + term.id + '">' +
                '<span aria-hidden="true">' + term.icon + "</span><span>" + esc(termName(term)) + "</span>" +
            "</button>";
        }).join("");
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

    // ---------- 15. Opening cards ----------
    function setOpen(id, open) {
        const card = cards[id];
        if (!card) return;
        card.el.classList.toggle("is-open", open);
        card.toggle.setAttribute("aria-expanded", String(open));
        if (open) {
            state.open.add(id);
            if (!state.explored.has(id)) {
                state.explored.add(id);
                A.storage.set("glossary.explored", Array.from(state.explored));
                card.el.classList.add("is-explored");
                updateExplored();
                if (state.explored.size === TERMS.length) A.toast(t("glossary.allExplored"), "🏆");
            }
        } else {
            state.open.delete(id);
        }
        markLooseRows();
    }

    // A short glowing pulse around a card
    function spotlight(el) {
        el.classList.remove("is-spotlight");
        void el.offsetWidth;                         // restart the animation
        el.classList.add("is-spotlight");
        clearTimeout(el._glSpotTimer);
        el._glSpotTimer = setTimeout(function () { el.classList.remove("is-spotlight"); }, 2600);
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
        const y = height + 32 < room ? top - nav - (room - height) / 2 : top - nav - 16;
        window.scrollTo({ top: Math.max(0, y), behavior: A.motion.ok() ? "smooth" : "auto" });
    }

    // Scrolls to a term, opens it and makes it glow.
    // options.focus moves keyboard focus to it as well.
    function show(id, options) {
        if (!BY_ID[id]) return false;
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
            render(false);
        }
        if (!card.el.classList.contains("is-open")) setOpen(id, true);

        // Show it at once (no fade-in) so it can glow straight away
        if (A.effects && A.effects.reveal) A.effects.reveal(card.el);
        scrollToCard(card);
        spotlight(card.el);

        if (options.focus) {
            // A short delay, so the palette or menu can close first
            setTimeout(function () { card.toggle.focus({ preventScroll: true }); }, 80);
        }
        return true;
    }

    // ---------- 16. Events ----------
    // Wired up once, when the glossary is built
    function listen() {
        ui.input.addEventListener("input", function () {
            state.query = ui.input.value;
            render(true, true);
        });

        ui.input.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && ui.input.value) {
                event.preventDefault();
                event.stopPropagation();
                ui.input.value = "";
                state.query = "";
                render(true, true);
            } else if (event.key === "Enter") {
                event.preventDefault();
                const first = ui.grid.querySelector(".gl-card:not([hidden])");
                if (first && !ui.grid.hidden) show(first.getAttribute("data-id"), { focus: true });
            }
        });

        ui.clear.addEventListener("click", function () {
            ui.input.value = "";
            state.query = "";
            render(true, true);
            ui.input.focus();
        });

        ui.cats.addEventListener("click", function (event) {
            const chip = event.target.closest(".gl-chip");
            if (!chip) return;
            const cat = chip.getAttribute("data-cat");
            state.cat = state.cat === cat && cat !== "all" ? "all" : cat;
            render(true, true);
        });

        ui.alpha.addEventListener("click", function (event) {
            const button = event.target.closest(".gl-letter");
            if (!button || button.disabled) return;
            const letter = button.getAttribute("data-letter");
            state.letter = state.letter === letter ? "" : letter;
            render(true, true);
        });

        function onReset() {
            resetFilters();
            render(true, true);
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
                    { duration: 550, easing: A.motion.ease }
                );
            }
            // Focus stays on the button (so you can roll again); screen readers hear the term
            const term = randomTerm();
            show(term.id);
            clearTimeout(liveTimer);
            ui.live.textContent = t("glossary.randomAnnounce", { term: termName(term) });
        });

        ui.moreBtn.addEventListener("click", function () {
            const top = ui.moreBtn.getBoundingClientRect().top;
            state.showAll = !state.showAll;
            render(state.showAll, true);
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
            if (related) show(related.getAttribute("data-target"), { focus: true });
        });

        ui.suggestList.addEventListener("click", function (event) {
            const button = event.target.closest(".gl-suggestion");
            if (button) show(button.getAttribute("data-target"), { focus: true });
        });
    }

    // ---------- 17. Language changes: same search, same open cards ----------
    function onLanguageChange() {
        // Quietly forget the last announcement (it was in the old language)
        clearTimeout(liveTimer);
        ui.live.textContent = "";
        buildLetters();
        sortCards();
        render(false);
        updateExplored();
    }

    // ---------- 18. Start ----------
    // The glossary is far down the page, so it is built only when it comes near the
    // screen, when the browser has a quiet moment after loading, or as soon as
    // something needs it (ensure(): a palette command, a link to a term...).
    const ensure = A.whenNeeded(mount, build);

    // A link like index.html#term-neural-network opens that term
    function openFromHash() {
        const match = /^#term-([a-z-]+)$/.exec(window.location.hash);
        if (match && BY_ID[match[1]]) show(match[1]);
    }
    window.addEventListener("hashchange", openFromHash);
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { setTimeout(openFromHash, 100); });
    } else {
        openFromHash();
    }

    // ---------- 19. Ctrl+K palette: one command per term ----------
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

    // ---------- 20. Public API: AICompass.glossary ----------
    // The assistant, the palette and the timeline use it. find, random and term
    // work from the data alone; show(id, { focus }) scrolls to a term and opens it.
    A.feature("glossary", {
        // find("What is a neural network?") -> { id, term, definition, ... } or null
        find: find,
        // A random term: { id, term, definition, ... }
        random: function () { return info(randomTerm()); },
        // A term by its id: { id, term, definition, ... } or null
        term: function (id) { return BY_ID[id] ? info(BY_ID[id]) : null; },
        // All term ids, in the order they are defined
        ids: TERMS.map(function (term) { return term.id; }),
        // Scrolls to a term, opens it and makes it glow ({ focus: true } also focuses it)
        show: show
    });
})();
