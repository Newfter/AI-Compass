/* =========================================================
   AI COMPASS — COMMAND PALETTE (Ctrl + K)
   A quick search window for the whole site, like in code editors.
   Open it with Ctrl+K (Cmd+K on a Mac), the "/" key, or the
   search button in the menu. Type a few letters, pick a result
   with the arrow keys and press Enter.

   Sections of this file:
    1. Translations
    2. Building the window
    3. Fuzzy search (how results are found and scored)
    4. Collecting and grouping results
    5. Drawing the results
    6. Keyboard and mouse
    7. Opening, closing and running a command
    8. Shortcuts and start-up
   The list of commands lives in AICompass.commands: every
   feature adds its own with AICompass.registerCommand().
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="palette"]');
    if (!A || !mount) return;

    const t = A.t;
    const esc = A.escapeHTML;

    // Every text (English and Russian) is in js/content/palette.js

    const RECENT_KEY = "palette.recent";
    const RECENT_MAX = 5;
    const GROUP_PREVIEW = 6;     // with an empty search, show at most 6 items per group

    // Correct word for a number: "1 result / 2 results", "1 результат / 2 результата / 5 результатов"
    function plural(n, forms) {
        const list = forms.split("|");
        if (A.lang === "ru") {
            const mod10 = n % 10;
            const mod100 = n % 100;
            if (mod10 === 1 && mod100 !== 11) return list[0];
            if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return list[1];
            return list[2] || list[1];
        }
        return n === 1 ? list[0] : list[1];
    }

    /* =========================================================
       2. BUILDING THE WINDOW
       The search box is a "combobox": the focus stays in the box,
       and aria-activedescendant tells screen readers which result
       is selected in the "listbox".
       ========================================================= */
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");

    mount.innerHTML =
        '<div class="cp-overlay" hidden>' +
            '<div class="cp-dialog" role="dialog" aria-modal="true" aria-labelledby="cp-title">' +
                '<h2 class="sr-only" id="cp-title" data-i18n="palette.title">' + t("palette.title") + "</h2>" +
                '<div class="cp-search">' +
                    '<svg class="cp-search-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
                        '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/>' +
                        '<path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
                    '<input class="cp-input" id="cp-input" type="text" role="combobox" aria-expanded="true" ' +
                        'aria-controls="cp-list" aria-autocomplete="list" autocomplete="off" autocapitalize="off" ' +
                        'spellcheck="false" enterkeyhint="go" ' +
                        'data-i18n-attr="aria-label:palette.inputLabel,placeholder:palette.placeholder" ' +
                        'aria-label="' + esc(t("palette.inputLabel")) + '" placeholder="' + esc(t("palette.placeholder")) + '">' +
                    '<button type="button" class="cp-close" data-i18n-attr="aria-label:palette.close,title:palette.close" ' +
                        'aria-label="' + esc(t("palette.close")) + '" title="' + esc(t("palette.close")) + '">' +
                        '<kbd class="cp-close-key" aria-hidden="true">Esc</kbd>' +
                        '<svg class="cp-close-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
                            '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
                    "</button>" +
                "</div>" +
                '<p class="cp-note" hidden></p>' +
                '<div class="cp-body">' +
                    '<div class="cp-empty" hidden>' +
                        '<span class="cp-empty-icon" aria-hidden="true">🔭</span>' +
                        '<p class="cp-empty-title"></p>' +
                        '<p class="cp-empty-hint" data-i18n="palette.emptyHint">' + t("palette.emptyHint") + "</p>" +
                    "</div>" +
                    '<div class="cp-list" id="cp-list" role="listbox" data-i18n-attr="aria-label:palette.listLabel" ' +
                        'aria-label="' + esc(t("palette.listLabel")) + '"></div>' +
                "</div>" +
                '<footer class="cp-foot">' +
                    '<span class="cp-hint"><kbd>↑</kbd><kbd>↓</kbd> <span data-i18n="palette.hintMove">' + t("palette.hintMove") + "</span></span>" +
                    '<span class="cp-hint"><kbd>Enter</kbd> <span data-i18n="palette.hintOpen">' + t("palette.hintOpen") + "</span></span>" +
                    '<span class="cp-hint"><kbd>Esc</kbd> <span data-i18n="palette.hintClose">' + t("palette.hintClose") + "</span></span>" +
                    '<span class="cp-count" aria-hidden="true"></span>' +
                "</footer>" +
                '<p class="sr-only" aria-live="polite" aria-atomic="true"></p>' +
            "</div>" +
        "</div>";

    const ui = {
        overlay: mount.querySelector(".cp-overlay"),
        dialog: mount.querySelector(".cp-dialog"),
        input: mount.querySelector(".cp-input"),
        close: mount.querySelector(".cp-close"),
        note: mount.querySelector(".cp-note"),
        empty: mount.querySelector(".cp-empty"),
        emptyTitle: mount.querySelector(".cp-empty-title"),
        list: mount.querySelector(".cp-list"),
        count: mount.querySelector(".cp-count"),
        status: mount.querySelector('[aria-live="polite"]')
    };

    const state = {
        open: false,
        items: [],          // the results, in the order they are shown
        active: -1,         // which result is selected
        lastFocus: null,    // where the focus goes back to on close
        hideTimer: 0,
        statusTimer: 0,
        scroll: null,       // saved page scroll style while open
        pointer: { x: -1, y: -1 },
        expanded: {}        // big groups opened with "Show N more" (until the palette closes)
    };

    /* =========================================================
       3. FUZZY SEARCH
       Each result gets a score: the higher, the better.
       - the query at the start of a word  ("les" in "Lessons")     best
       - in a hidden keyword (both languages, "тема" -> theme)       good
       - in a title prefix  ("lesson" in "Open lesson: ...")        good
       - first letters / close letters     ("ml" -> "Machine Learning",
                                             "ntwrk" -> "Network")  okay
       - inside a word                      ("work" in "Network")   weak
       Prefixes like "Glossary: " are skipped by the letter search, and
       letters may not be scattered all over a title. Results far below
       the best one are dropped. Matched letters are highlighted.
       ========================================================= */

    const SCORE = {
        wordStart: 1000,    // at the start of a word of the title
        keyword: 600,       // at the start of a hidden keyword
        prefix: 520,        // at the start of a word in "Glossary: " / "Open lesson: "
        group: 450,         // the group's name ("glossary" finds every term)
        letters: 300,       // letters in order (see sequenceMatch)
        inside: 250,        // inside a word (3+ letters only)
        keep: 0.4           // results below 40% of the best one are dropped
    };

    // Lower case, "ё" -> "е". Every character stays in its place,
    // so letter positions still match the original title.
    function fold(text) {
        return String(text || "").split("").map(function (char) {
            const lower = char.toLowerCase();
            if (lower.length !== 1) return char;
            return lower === "ё" ? "е" : lower;
        }).join("");
    }

    function isWordStart(text, index) {
        return index === 0 || /[\s\-–—:,.()«»“”"'/&]/.test(text.charAt(index - 1));
    }

    function range(from, to) {
        const list = [];
        for (let i = from; i < to; i++) list.push(i);
        return list;
    }

    // Where the real name starts: "Glossary: Bias" -> at "Bias" (0 if there is no prefix)
    function nameStart(title) {
        const index = title.indexOf(": ");
        return index > 0 && index < 40 && index + 2 < title.length ? index + 2 : 0;
    }

    // 1) The whole query as one piece of the title (every place it appears; the best one wins)
    function substringMatch(query, text, start) {
        let best = null;
        let index = text.indexOf(query);
        while (index !== -1) {
            let score = 0;
            if (isWordStart(text, index) && index >= start) {
                score = SCORE.wordStart - Math.min(index - start, 40) * 2;
                if (index === start) score += 100;                          // the very beginning of the name
                if (query.length === text.length - start) score += 100;     // the whole name
            } else if (isWordStart(text, index)) {
                score = SCORE.prefix;
            } else if (query.length >= 3) {
                score = SCORE.inside - Math.min(index, 40);
            }
            if (score && (!best || score > best.score)) {
                best = { score: score, positions: range(index, index + query.length) };
            }
            index = text.indexOf(query, index + 1);
        }
        return best;
    }

    // 2) Letters in order, but close together: each letter must start a word
    //    or come right after the previous one (at most one letter skipped).
    //    "ml" -> "Machine Learning", "ntwrk" -> "Network", but not "lab" -> "G-l-oss-a-ry: B-ias".
    function sequenceMatch(query, text, start) {
        const letters = query.replace(/ /g, "");
        if (letters.length < 2) return null;

        // Tries every allowed place for each letter (titles are short, so this is quick)
        function place(i, previous) {
            if (i === letters.length) return [];
            const char = letters.charAt(i);
            for (let j = Math.max(start, previous + 1); j < text.length; j++) {
                if (text.charAt(j) !== char) continue;
                const close = i > 0 && j - previous <= 2;
                if (!close && !isWordStart(text, j)) continue;
                const rest = place(i + 1, j);
                if (rest) return [j].concat(rest);
            }
            return null;
        }

        const positions = place(0, -10);
        if (!positions) return null;

        // Points: word starts and letters side by side are good, a skipped letter is not
        let score = SCORE.letters;
        positions.forEach(function (p, k) {
            if (isWordStart(text, p)) score += 50;
            if (k > 0) score += p - positions[k - 1] === 1 ? 15 : -10;
        });
        return { score: score - Math.min(positions[0] - start, 20), positions: positions };
    }

    function titleMatch(query, title, start) {
        return substringMatch(query, title, start) || sequenceMatch(query, title, start);
    }

    // Keywords are hidden words (English + Russian) that also find a command
    function keywordScore(query, keywords) {
        if (!keywords) return 0;
        let best = 0;
        let index = keywords.indexOf(query);
        while (index !== -1) {
            if (isWordStart(keywords, index)) {
                const end = index + query.length;
                const wholeWord = end === keywords.length || keywords.charAt(end) === " ";
                best = Math.max(best, SCORE.keyword + (wholeWord ? 50 : 0));
            } else if (query.length >= 3) {
                best = Math.max(best, SCORE.inside - 50);
            }
            index = keywords.indexOf(query, index + 1);
        }
        return best;
    }

    // The group's name: "glossary" / "словарь" lists every term
    function groupScore(word, group) {
        const index = group.indexOf(word);
        return index !== -1 && isWordStart(group, index) ? SCORE.group : 0;
    }

    // Score of one item for the whole query (several words: every word must match)
    function scoreItem(item, query) {
        const title = item.folded;
        const start = item.start;
        let best = null;

        // The whole query as one piece ("neural network" in "Neural network")
        const whole = titleMatch(query, title, start);

        // Every word on its own: the best of title, keywords and group name.
        // Matched title letters are highlighted even when a keyword scored more.
        const words = query.split(" ").filter(Boolean);
        let total = 0;
        const positions = [];
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const inTitle = words.length === 1 ? whole : titleMatch(word, title, start);
            const score = Math.max(inTitle ? inTitle.score : 0,
                keywordScore(word, item.keywords), groupScore(word, item.groupFolded));
            if (!score) {
                total = 0;
                break;
            }
            total += score;
            if (inTitle) inTitle.positions.forEach(function (p) { positions.push(p); });
        }
        if (total) best = { score: total / words.length, positions: positions };

        if (whole && (!best || whole.score > best.score)) best = { score: whole.score, positions: whole.positions };
        return best;
    }

    // Typed with the wrong keyboard layout? "ntcn" -> "тест", "руддщ" -> "hello"
    const LAYOUT_EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`";
    const LAYOUT_RU = "йцукенгшщзхъфывапролджэячсмитьбюё";

    function switchLayout(text) {
        return text.split("").map(function (char) {
            let index = LAYOUT_EN.indexOf(char);
            if (index !== -1) return LAYOUT_RU.charAt(index);
            index = LAYOUT_RU.indexOf(char);
            if (index !== -1) return LAYOUT_EN.charAt(index);
            return char;
        }).join("");
    }

    /* =========================================================
       4. COLLECTING AND GROUPING RESULTS
       ========================================================= */

    // Reads AICompass.commands fresh every time the palette opens,
    // so commands added later by other features are included.
    function collectCommands() {
        const list = [];
        (A.commands || []).forEach(function (command, order) {
            if (!command || typeof command.run !== "function") return;
            let title = "";
            try {
                title = typeof command.title === "function" ? command.title() : String(command.title || "");
            } catch (error) {
                title = "";
            }
            if (!title) title = String(command.id || "");
            const groupName = command.group ? t(command.group) : t("palette.other");
            const folded = fold(title);
            list.push({
                id: String(command.id || "cmd-" + order),
                icon: command.icon || "•",
                title: title,
                folded: folded,
                start: nameStart(folded),
                keywords: fold(command.keywords || ""),
                groupKey: command.group || "palette.other",
                groupName: groupName,
                groupFolded: fold(groupName),
                order: order,
                run: command.run,
                remember: true
            });
        });
        return list;
    }

    function getRecent() {
        const saved = A.storage.get(RECENT_KEY, []);
        return Array.isArray(saved) ? saved.filter(function (id) { return typeof id === "string"; }) : [];
    }

    function remember(id) {
        const list = getRecent().filter(function (item) { return item !== id; });
        list.unshift(id);
        A.storage.set(RECENT_KEY, list.slice(0, RECENT_MAX));
    }

    // Puts items into groups: [{ key, label, items, more }]
    function groupItems(items, keepOrder) {
        const groups = [];
        const byKey = {};
        items.forEach(function (item) {
            let group = byKey[item.groupKey];
            if (!group) {
                group = { key: item.groupKey, label: item.groupName, items: [], best: -Infinity, more: 0 };
                byKey[item.groupKey] = group;
                groups.push(group);
            }
            group.items.push(item);
            group.best = Math.max(group.best, item.score || 0);
        });
        if (!keepOrder) {
            groups.forEach(function (group) {
                group.items.sort(function (a, b) { return b.score - a.score || a.order - b.order; });
            });
            groups.sort(function (a, b) { return b.best - a.best; });
        }
        return groups;
    }

    // Empty search: "Recent" first, then every group (each one shortened)
    function browseGroups(commands) {
        const byId = {};
        commands.forEach(function (item) { byId[item.id] = item; });

        const recent = getRecent().map(function (id) { return byId[id]; }).filter(Boolean);
        const recentIds = recent.map(function (item) { return item.id; });

        const groups = [];
        if (recent.length) {
            groups.push({ key: "palette.recent", label: t("palette.recent"), items: recent, more: 0 });
        }
        groupItems(commands.filter(function (item) {
            return recentIds.indexOf(item.id) === -1;
        }), true).forEach(function (group) {
            // Big groups show a few items and a "Show N more" row (until it is chosen)
            if (group.items.length > GROUP_PREVIEW + 1 && !state.expanded[group.key]) {
                group.more = group.items.length - GROUP_PREVIEW;
                group.items = group.items.slice(0, GROUP_PREVIEW);
            }
            groups.push(group);
        });
        return groups;
    }

    function rank(commands, query) {
        const found = [];
        commands.forEach(function (item) {
            const match = scoreItem(item, query);
            if (match) {
                found.push(Object.assign({}, item, { score: match.score, positions: match.positions }));
            }
        });
        // Keep only results that are close to the best one, so a few good
        // matches are not buried under many weak ones
        const top = found.reduce(function (max, item) { return Math.max(max, item.score); }, 0);
        return found.filter(function (item) { return item.score >= top * SCORE.keep; });
    }

    // Everything the palette shows for a search: { groups, note, nothing }
    function search(rawQuery) {
        const commands = collectCommands();
        const query = fold(rawQuery).replace(/\s+/g, " ").trim();
        if (!query) return { groups: browseGroups(commands), note: "", nothing: false };

        let found = rank(commands, query);
        let note = "";

        // Nothing? Maybe the keyboard was in the other language
        if (!found.length) {
            const other = switchLayout(query);
            if (other !== query) {
                const again = rank(commands, other);
                if (again.length) {
                    found = again;
                    note = t("palette.layout", { query: other });
                }
            }
        }

        // A glossary term mentioned anywhere in the search ("what is a transformer?")
        if (A.glossary && typeof A.glossary.find === "function" && query.length >= 2) {
            let term = null;
            try {
                term = A.glossary.find(rawQuery);
            } catch (error) {
                term = null;
            }
            const termCommand = term && term.id ? commands.find(function (item) { return item.id === "glossary-" + term.id; }) : null;
            if (termCommand) {
                // The glossary has its own command for this term: make sure it is in the results
                if (!found.some(function (item) { return item.id === termCommand.id; })) {
                    found.push(Object.assign({}, termCommand, { score: 450, positions: [] }));
                }
            } else if (term && term.id) {
                const title = String(term.term || "");
                found.push({
                    id: "glossary-term-" + term.id,
                    icon: "📖",
                    title: title,
                    folded: fold(title),
                    start: 0,
                    sub: String(term.definition || ""),
                    groupKey: "palette.glossaryGroup",
                    groupName: t("palette.glossaryGroup"),
                    score: 500,
                    positions: [],
                    order: 9998,
                    remember: false,
                    run: function () { A.glossary.show(term.id, { focus: true }); }
                });
            }
        }

        const nothing = !found.length;

        // Always offer to ask Compass Bot. It joins the bot's own group
        // (so there is only one "Compass Bot" heading) and is always its last item.
        const text = String(rawQuery).trim();
        if (A.assistant && typeof A.assistant.ask === "function" && text.length >= 2) {
            const title = t("palette.askBot", { query: text.slice(0, 80) });
            found.push({
                id: "ask-bot",
                icon: "🤖",
                title: title,
                folded: fold(title),
                start: 0,
                groupKey: "assistant.cmdGroup",
                groupName: t("palette.askGroup"),
                score: -1,
                positions: [],
                order: 9999,
                remember: false,
                run: function () { A.assistant.ask(text); }
            });
        }

        return { groups: groupItems(found, false), note: note, nothing: nothing };
    }

    /* =========================================================
       5. DRAWING THE RESULTS
       ========================================================= */

    // Title with the matched letters wrapped in <mark>
    function highlight(title, positions) {
        if (!positions || !positions.length) return esc(title);
        const marked = {};
        positions.forEach(function (p) { marked[p] = true; });
        let html = "";
        let open = false;
        for (let i = 0; i < title.length; i++) {
            if (marked[i] && !open) {
                html += "<mark>";
                open = true;
            } else if (!marked[i] && open) {
                html += "</mark>";
                open = false;
            }
            html += esc(title.charAt(i));
        }
        return html + (open ? "</mark>" : "");
    }

    function render() {
        const query = ui.input.value;
        const result = search(query);
        const items = [];
        let html = "";

        result.groups.forEach(function (group, groupIndex) {
            const labelId = "cp-group-" + groupIndex;
            html += '<div class="cp-group" role="group" aria-labelledby="' + labelId + '">' +
                '<div class="cp-group-label" id="' + labelId + '" role="presentation">' +
                    "<span>" + esc(group.label) + "</span>" +
                "</div>";

            // A big group (empty search) ends with a "Show N more" row that opens it fully
            const rows = group.items.slice();
            if (group.more) {
                rows.push({ id: "more-" + group.key, more: group.key, icon: "⌄", title: t("palette.more", { n: group.more }) });
            }
            rows.forEach(function (item) {
                const index = items.length;
                items.push(item);
                html += '<div class="cp-item' + (item.more ? " cp-more" : "") + '" role="option" id="cp-option-' + index +
                    '" data-index="' + index + '" aria-selected="false">' +
                    '<span class="cp-icon" aria-hidden="true"></span>' +
                    '<span class="cp-text">' +
                        '<span class="cp-title">' + highlight(item.title, item.positions) + "</span>" +
                        (item.sub ? '<span class="cp-sub">' + esc(item.sub) + "</span>" : "") +
                    "</span>" +
                    '<span class="cp-enter" aria-hidden="true">↵</span>' +
                    "</div>";
            });
            html += "</div>";
        });

        ui.list.innerHTML = html;
        // Icons are added as plain text (they could be anything)
        ui.list.querySelectorAll(".cp-item").forEach(function (element, index) {
            element.querySelector(".cp-icon").textContent = items[index].icon;
        });

        state.items = items;

        // Empty state and the "other keyboard layout" note
        ui.empty.hidden = !result.nothing;
        if (result.nothing) ui.emptyTitle.textContent = t("palette.empty", { query: query.trim() });
        ui.note.hidden = !result.note;
        ui.note.textContent = result.note;
        ui.list.hidden = !items.length;

        // How many results (shown in the footer, and read out a moment later)
        const commandCount = items.filter(function (item) { return item.id !== "ask-bot" && !item.more; }).length;
        const countText = plural(commandCount, t("palette.count")).replace("{n}", commandCount);
        ui.count.textContent = countText;
        clearTimeout(state.statusTimer);
        state.statusTimer = setTimeout(function () {
            ui.status.textContent = result.nothing ? ui.emptyTitle.textContent : countText;
        }, 450);

        setActive(items.length ? 0 : -1, false);
    }

    function setActive(index, scroll) {
        const previous = ui.list.querySelector(".cp-item.is-active");
        if (previous) {
            previous.classList.remove("is-active");
            previous.setAttribute("aria-selected", "false");
        }
        state.active = index;
        if (index < 0 || index >= state.items.length) {
            ui.input.removeAttribute("aria-activedescendant");
            return;
        }
        const element = ui.list.querySelector('[data-index="' + index + '"]');
        if (!element) return;
        element.classList.add("is-active");
        element.setAttribute("aria-selected", "true");
        ui.input.setAttribute("aria-activedescendant", element.id);
        if (scroll) {
            // Keep the group title visible above the first item of a group
            const label = element.previousElementSibling;
            const target = label && label.classList.contains("cp-group-label") ? label : element;
            const box = ui.list;
            const top = target.offsetTop - box.offsetTop;
            const bottom = element.offsetTop - box.offsetTop + element.offsetHeight;
            if (top < box.scrollTop) box.scrollTop = top - 4;
            else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight + 4;
        }
    }

    function move(step) {
        const count = state.items.length;
        if (!count) return;
        let next = state.active + step;
        if (next < 0) next = count - 1;          // wrap around
        if (next >= count) next = 0;
        setActive(next, true);
    }

    /* =========================================================
       6. KEYBOARD AND MOUSE
       ========================================================= */

    ui.input.addEventListener("input", render);

    ui.dialog.addEventListener("keydown", function (event) {
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                move(1);
                break;
            case "ArrowUp":
                event.preventDefault();
                move(-1);
                break;
            case "Home":
                if (!state.items.length) return;
                event.preventDefault();
                setActive(0, true);
                break;
            case "End":
                if (!state.items.length) return;
                event.preventDefault();
                setActive(state.items.length - 1, true);
                break;
            case "PageDown":
                event.preventDefault();
                setActive(Math.min(state.items.length - 1, state.active + 5), true);
                break;
            case "PageUp":
                event.preventDefault();
                setActive(Math.max(0, state.active - 5), true);
                break;
            case "Enter":
                if (event.target === ui.close) return;   // the close button handles its own Enter
                event.preventDefault();
                if (state.items[state.active]) runItem(state.items[state.active]);
                break;
            case "Escape":
                event.preventDefault();
                event.stopPropagation();
                close();
                break;
            case "Tab":
                trapFocus(event);
                break;
        }
    });

    // The mouse selects what it points at (only when it really moves,
    // not when the list scrolls under a still mouse)
    ui.list.addEventListener("pointermove", function (event) {
        if (event.clientX === state.pointer.x && event.clientY === state.pointer.y) return;
        state.pointer.x = event.clientX;
        state.pointer.y = event.clientY;
        const element = event.target.closest(".cp-item");
        if (!element) return;
        const index = Number(element.getAttribute("data-index"));
        if (index !== state.active) setActive(index, false);
    });

    ui.list.addEventListener("click", function (event) {
        const element = event.target.closest(".cp-item");
        if (!element) return;
        const item = state.items[Number(element.getAttribute("data-index"))];
        if (item) runItem(item);
    });

    // Keep the focus in the search box when the list is clicked
    ui.list.addEventListener("mousedown", function (event) {
        event.preventDefault();
    });

    ui.close.addEventListener("click", function () { close(); });

    // A click on the dark area around the window closes it
    ui.overlay.addEventListener("mousedown", function (event) {
        if (event.target === ui.overlay) close();
    });

    function trapFocus(event) {
        const items = [ui.input, ui.close].filter(function (element) {
            return element.getClientRects().length > 0;
        });
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    // If the focus somehow leaves the window, bring it back
    document.addEventListener("focusin", function (event) {
        if (state.open && !ui.dialog.contains(event.target)) {
            ui.input.focus({ preventScroll: true });
        }
    });

    /* =========================================================
       7. OPENING, CLOSING AND RUNNING A COMMAND
       ========================================================= */

    function lockScroll() {
        const body = document.body;
        const gap = window.innerWidth - document.documentElement.clientWidth;
        state.scroll = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
        body.style.overflow = "hidden";
        if (gap > 0) body.style.paddingRight = gap + "px";
    }

    function unlockScroll() {
        if (!state.scroll) return;
        document.body.style.overflow = state.scroll.overflow;
        document.body.style.paddingRight = state.scroll.paddingRight;
        state.scroll = null;
    }

    // Phones: keep the window over the part of the screen you can see.
    // The page area can be bigger than the screen (on-screen keyboard,
    // or something on the page that is too wide); then the layer follows the screen.
    function fitOverlay() {
        const viewport = window.visualViewport;
        const style = ui.overlay.style;
        const differs = state.open && viewport && (
            Math.abs(viewport.width - window.innerWidth) > 1 ||
            Math.abs(viewport.height - window.innerHeight) > 1 ||
            Math.abs(viewport.offsetLeft) > 1 || Math.abs(viewport.offsetTop) > 1
        );
        ["left", "top", "width", "height"].forEach(function (name) { style.removeProperty(name); });
        if (!differs) return;
        style.left = Math.round(viewport.offsetLeft) + "px";
        style.top = Math.round(viewport.offsetTop) + "px";
        style.width = Math.round(viewport.width) + "px";
        style.height = Math.round(viewport.height) + "px";
    }

    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", fitOverlay);
        window.visualViewport.addEventListener("scroll", fitOverlay);
    }
    window.addEventListener("resize", fitOverlay, { passive: true });

    function setTriggersExpanded(open) {
        document.querySelectorAll("[data-open-palette]").forEach(function (button) {
            button.setAttribute("aria-expanded", String(open));
        });
    }

    function open() {
        if (state.open) {
            ui.input.focus({ preventScroll: true });
            return;
        }
        clearTimeout(state.hideTimer);
        state.open = true;
        const active = document.activeElement;
        state.lastFocus = active && active !== document.body ? active : null;

        lockScroll();
        state.expanded = {};
        ui.input.value = "";
        ui.overlay.hidden = false;
        ui.overlay.classList.remove("is-closing");
        fitOverlay();
        render();
        ui.list.scrollTop = 0;
        setTriggersExpanded(true);

        // Draw once in the hidden state, then animate in
        void ui.overlay.offsetWidth;
        ui.overlay.classList.add("is-open");
        ui.input.focus({ preventScroll: true });
    }

    function close() {
        if (!state.open) return;
        state.open = false;
        ui.overlay.classList.remove("is-open");
        ui.overlay.classList.add("is-closing");
        unlockScroll();
        setTriggersExpanded(false);
        clearTimeout(state.statusTimer);
        ui.status.textContent = "";

        state.hideTimer = setTimeout(function () {
            if (state.open) return;
            ui.overlay.hidden = true;
            ui.overlay.classList.remove("is-closing");
            fitOverlay();
            ui.list.innerHTML = "";
            state.items = [];
        }, A.reducedMotion ? 0 : 180);

        // Focus goes back to where it was before (if that is still possible).
        // Something hidden in the meantime (a link in the mobile menu, say)
        // cannot take it, so then the focus goes to the search button.
        const target = state.lastFocus;
        state.lastFocus = null;
        if (target && target.isConnected && typeof target.focus === "function" && !target.closest("[inert]")) {
            target.focus({ preventScroll: true });
        }
        const active = document.activeElement;
        if (!active || active === document.body || ui.dialog.contains(active)) {
            const trigger = document.querySelector("[data-open-palette]");
            if (trigger) trigger.focus({ preventScroll: true });
            else if (active && ui.dialog.contains(active)) active.blur();
        }
    }

    function toggle() {
        if (state.open) close();
        else open();
    }

    // "Show N more": open the whole group in place; the selection moves
    // to the first item that was hidden before
    function expandGroup(item) {
        const index = state.items.indexOf(item);
        state.expanded[item.more] = true;
        const scroll = ui.list.scrollTop;
        render();
        ui.list.scrollTop = scroll;
        setActive(Math.max(0, Math.min(index, state.items.length - 1)), true);
    }

    // Close first (so focus and scrolling are back to normal), then run
    function runItem(item) {
        if (item.more) {
            expandGroup(item);
            return;
        }
        if (item.remember) remember(item.id);
        close();
        setTimeout(function () {
            try {
                item.run();
            } catch (error) {
                if (window.console) console.warn("AI Compass palette: command failed", item.id, error);
            }
        }, 10);
    }

    /* =========================================================
       8. SHORTCUTS AND START-UP
       ========================================================= */

    function isTyping(element) {
        if (!element || !element.closest) return false;
        return Boolean(element.isContentEditable || element.closest("input, textarea, select, [contenteditable='true']"));
    }

    document.addEventListener("keydown", function (event) {
        // Ctrl+K / Cmd+K (event.code also works with a Russian keyboard layout)
        const isK = event.key === "k" || event.key === "K" || event.code === "KeyK";
        if (isK && (event.ctrlKey || event.metaKey) && !event.altKey) {
            event.preventDefault();
            toggle();
            return;
        }
        // "/" when you are not typing somewhere. On a Russian keyboard the same
        // key types "." — event.code ("Slash") still names the physical key.
        const isSlash = event.key === "/" || (event.code === "Slash" && !event.shiftKey);
        if (isSlash && !event.ctrlKey && !event.metaKey && !event.altKey &&
            !state.open && !event.defaultPrevented && !isTyping(event.target)) {
            event.preventDefault();
            open();
        }
    });

    // The search button in the menu (and any other [data-open-palette] button)
    document.addEventListener("click", function (event) {
        const trigger = event.target.closest && event.target.closest("[data-open-palette]");
        if (!trigger) return;
        event.preventDefault();
        open();
    });

    document.querySelectorAll("[data-open-palette]").forEach(function (button) {
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-expanded", "false");
        // Show the Mac shortcut on Macs
        const key = button.querySelector(".palette-kbd");
        if (key && isMac) key.textContent = "⌘ K";
    });

    // New language: redraw the results in place, keeping the search text and selection
    A.onLanguageChange(function () {
        if (!state.open) return;
        const active = state.active;
        render();
        if (active >= 0 && active < state.items.length) setActive(active, true);
    });

    // Other features can open the palette too
    A.palette = {
        open: open,
        close: close,
        toggle: toggle,
        get isOpen() { return state.open; }
    };
})();
