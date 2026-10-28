/* =========================================================
   AI COMPASS — COMPASS BOT (the floating assistant)
   A friendly chat helper in the bottom-right corner: a glowing round
   button, a short "Ask me" hint on the first visits, and a chat window
   (above the button on computers, an almost full-screen sheet on
   phones). Its answers can have buttons that open a lesson, start the
   quiz, open the lab, show a glossary word or go to a part of the page.

   Important: Compass Bot is NOT a real AI. It is a small
   "rule-based" chatbot, like ELIZA from 1966: it looks for
   keywords in your message and picks a prepared answer.
   The chat window says this honestly, too.

   Sections of this file:
    1. Settings
    2. Small helpers
    3. Answers the bot can give (drawn in the current language)
    4. The bot's "brain": finding what the person wants
    5. Building the chat window
    6. Showing messages
    7. Typing dots and the reply queue
    8. Buttons inside messages (actions)
    9. Opening and closing the chat
   10. Saving the chat for this tab (sessionStorage)
   11. Little extras: the "Ask me" hint, the resting orb, eyes that follow you
   12. Language and start-up
   13. Ctrl+K commands and the public API
   Other features use AICompass.assistant (see the last section).
   Every text (English and Russian) is in js/content/assistant.js,
   and so are the bot's word lists and simple answers (its "brain").
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="assistant"]');
    if (!A || !mount) return;

    const t = A.t;
    const esc = A.escapeHTML;

    // The bot's word lists and simple answers (its "brain"): js/content/assistant.js
    const brain = A.content.get("assistant");
    if (!brain) return;

    /* =========================================================
       1. SETTINGS
       ========================================================= */

    const MAX_MESSAGES = 80;              // a longer chat forgets its oldest messages
    const MAX_LENGTH = 300;               // letters in one message
    const SESSION_KEY = "assistant.chat"; // the chat in sessionStorage ("aic:assistant.chat")
    const TYPING_MS = 500;                // the bot "types" this long before a short answer...
    const TYPING_EXTRA_MS = 400;          // ...and up to this much longer before a long one
    const TYPING_LETTER_MS = 1.1;         // (that is, this much longer for each letter of the answer)
    const NEXT_REPLY_MS = 150;            // a short pause between two answers in the queue
    const ACTION_DELAY_MS = 650;          // time to read "Starting the quiz!" before the bot does it
    const CLOSE_MS = 320;                 // the window's closing animation (css/assistant.css)
    const TIP_DELAY_MS = 2200;            // the "Ask me" hint appears this long after the page loads...
    const TIP_SECONDS = 10;               // ...and stays this long,
    const TIP_VISITS = 3;                 // on the first 3 visits only
    const ORB_START_SECONDS = 12;         // the orb moves this long after the page loads...
    const ORB_WAKE_SECONDS = 5;           // ...and this long after the mouse or the focus was on it
    const SHEET_CLOSE_PX = 90;            // phones: pull the sheet down this far to close it,
    const FLICK_PX = 24;                  // ...or flick it down at least this far,
    const FLICK_SPEED = 0.5;              // ...this fast (pixels per millisecond)
    const SHEET_GAP_PX = 16;              // phones: the room left above the sheet
    const TYPO_MIN_LETTERS = 7;           // keywords this long may have one typo in a message
    const UNKNOWN_WORD_MAX = 40;          // a word the bot doesn't know is quoted back cut to this many letters
    const ANSWER_TOP_GAP = 12;            // a new answer is scrolled to this far below the top of the chat
    const WHEEL_LINE_PX = 16;             // a mouse wheel that scrolls by lines: pixels per line
    const QUIET_REDRAW_MS = 300;          // after a language change, screen readers ignore the chat this long
    const EYES_REACH_PX = 260;            // the orb's eyes follow the mouse: with the mouse this far away (or more)...
    const EYES_MOVE_PX = 3.2;             // ...they move this far from the middle

    /* =========================================================
       2. SMALL HELPERS
       (only what core.js does not have)
       ========================================================= */

    // "Machine-Learning?!" -> "machine learning" (also "ё" -> "е")
    function normalise(text) {
        return String(text || "")
            .toLowerCase()
            .replace(/ё/g, "е")
            .replace(/[^\p{L}\p{N}]+/gu, " ")
            .trim();
    }

    // Plain text from a piece of HTML, without running anything inside it
    function plainText(html) {
        const text = String(html || "");
        if (text.indexOf("<") === -1 && text.indexOf("&") === -1) return text;
        try {
            return new DOMParser().parseFromString(text, "text/html").body.textContent || "";
        } catch (error) {
            return text.replace(/<[^>]*>/g, "");
        }
    }

    // Short "14:05" time for message bubbles
    function clockTime(timestamp) {
        return A.format.date(timestamp, { hour: "2-digit", minute: "2-digit" });
    }

    // A saved number as a whole number, 0 or more. A chat saved in this tab may
    // be broken or come from another version of the site: a strange value
    // becomes 0 (and never reaches the page as HTML).
    function whole(value) {
        return Number.isInteger(value) && value >= 0 ? value : 0;
    }

    // How many texts the dictionary has for a list: assistant.fact1, assistant.fact2...
    // (add one in both languages and the bot uses it)
    function textCount(prefix) {
        let count = 0;
        while (A.has(prefix + (count + 1))) count++;
        return count;
    }

    // Text number n of such a list, or the first one if there is no text n
    // (a fact saved before a fact was removed, or a broken value)
    function listText(prefix, n) {
        return A.has(prefix + whole(n)) ? t(prefix + whole(n)) : t(prefix + 1);
    }

    // ----- Lessons (AICompass.lessons, if the lessons are on the page) -----
    function lessonName(number) {
        const title = A.lessons ? A.util.attempt(function () { return A.lessons.title(number); }, "") : "";
        return title
            ? t("assistant.lessonName", { n: number, title: esc(title) })
            : t("assistant.lessonNameShort", { n: number });
    }

    function lessonTotal() {
        return A.lessons ? A.lessons.count : 0;
    }

    // Is there a lesson with this number? (Without the lessons on the page any
    // number is fine: the button then simply goes to the lessons section.)
    function lessonExists(number) {
        return number >= 1 && (!A.lessons || number <= A.lessons.count);
    }

    // The word for a number of lessons: "lesson" / "lessons", "урок" / "урока" / "уроков"
    function lessonWord(n) {
        return A.plural("assistant.lessonWords", n);
    }

    // ----- Glossary (AICompass.glossary, if the glossary is on the page) -----

    // Always returns { id, term, definition } as plain text, or null
    function cleanTerm(found) {
        if (!found || !found.id) return null;
        return {
            id: String(found.id),
            term: plainText(found.term),
            definition: plainText(found.definition)
        };
    }

    function glossaryFind(text) {
        if (!A.glossary || !text) return null;
        return cleanTerm(A.util.attempt(function () { return A.glossary.find(text); }, null));
    }

    function glossaryRandom() {
        if (!A.glossary) return null;
        return cleanTerm(A.util.attempt(function () { return A.glossary.random(); }, null));
    }

    // A stored term in the current language (the glossary may know it by id)
    function glossaryRefresh(saved) {
        if (A.glossary) {
            const fresh = cleanTerm(A.util.attempt(function () { return A.glossary.term(saved.id); }, null));
            if (fresh) return fresh;
        }
        const again = glossaryFind(saved.term);
        return again && again.id === saved.id ? again : saved;
    }

    // ----- Site sections (AICompass.sections: id, name and icon) -----
    function sectionInfo(id) {
        return A.sections.find(function (section) { return section.id === id; }) || null;
    }

    /* =========================================================
       3. ANSWERS THE BOT CAN GIVE
       A saved message only remembers WHICH answer it was (and a few
       numbers). The text is made here, in the current language,
       so the whole chat can switch language later.
       Each answer returns { html, actions }.
       ========================================================= */

    // Buttons that can appear under an answer
    function lessonAction(n) {
        return { act: "lesson", arg: n, icon: "📘", label: t("assistant.act.lesson", { n: n }) };
    }
    function labAction(tab) {
        return tab === "predictor"
            ? { act: "lab", arg: "predictor", icon: "💬", label: t("assistant.act.predictor") }
            : { act: "lab", arg: "classifier", icon: "🧠", label: t("assistant.act.classifier") };
    }
    function sectionAction(id) {
        const section = sectionInfo(id) || sectionInfo("home");
        return { act: "section", arg: id, icon: section.icon, label: t("assistant.act.section", { section: t(section.key) }) };
    }
    function quizAction() {
        return { act: "quiz", arg: "", icon: "🏆", label: t("assistant.act.quiz") };
    }
    function askAction(intent, labelKey, icon) {
        return { act: "ask", arg: intent, icon: icon, label: t(labelKey) };
    }
    function termAction(id) {
        return { act: "glossary", arg: id, icon: "📖", label: t("assistant.act.showTerm") };
    }
    function langAction(lang) {
        return { act: "lang", arg: lang, icon: lang === "ru" ? "🇷🇺" : "🇬🇧", label: t("assistant.act.lang." + lang) };
    }
    function themeAction(theme) {
        return theme === "light"
            ? { act: "theme", arg: "light", icon: "☀️", label: t("assistant.act.theme.light") }
            : { act: "theme", arg: "dark", icon: "🌙", label: t("assistant.act.theme.dark") };
    }

    // A button described in the content file: { lesson: 4 }, { lab: "classifier" },
    // { section: "timeline" }, { quiz: true } or { ask: "fact", label, icon }
    function buttonFrom(spec) {
        if (spec.lesson) return lessonAction(spec.lesson);
        if (spec.lab) return labAction(spec.lab);
        if (spec.section) return sectionAction(spec.section);
        if (spec.quiz) return quizAction();
        if (spec.ask) return askAction(spec.ask, spec.label, spec.icon);
        return null;
    }

    // A simple answer from the content file: a text and its buttons
    function simpleReply(spec) {
        return function () {
            return { html: t(spec.text), actions: (spec.buttons || []).map(buttonFrom).filter(Boolean) };
        };
    }

    const REPLIES = {};
    Object.keys(brain.replies).forEach(function (id) {
        REPLIES[id] = simpleReply(brain.replies[id]);
    });

    // Answers that are built from the message's data
    Object.assign(REPLIES, {
        greeting: function (data) {
            return { html: t("assistant.r.greeting" + ((whole(data.v) % 3) + 1)) };
        },
        history: function () {
            return {
                html: t("assistant.r.fact", { fact: t("assistant.fact1") }),
                actions: [sectionAction("timeline"), askAction("fact", "assistant.act.fact", "💡")]
            };
        },

        recommend: function (data) {
            const n = whole(data.n);
            const done = whole(data.done);
            if (!n) {
                const total = lessonTotal();
                return { html: t("assistant.r.recAll", { total: total, lessons: lessonWord(total) }), actions: [quizAction()] };
            }
            if (!done) {
                return { html: t("assistant.r.recStart", { lesson: lessonName(n) }), actions: [lessonAction(n)] };
            }
            return {
                html: t("assistant.r.recNext", {
                    count: done,
                    lessons: lessonWord(done),
                    total: lessonTotal(),
                    lesson: lessonName(n)
                }),
                actions: [lessonAction(n)]
            };
        },
        lessonOpen: function (data) {
            const n = whole(data.n);
            return { html: t("assistant.r.lessonOpen", { lesson: lessonName(n) }), actions: [lessonAction(n)] };
        },
        lessonOffer: function (data) {
            const n = whole(data.n);
            return { html: t("assistant.r.lessonOffer", { lesson: lessonName(n) }), actions: [lessonAction(n)] };
        },
        lessonMissing: function () {
            const total = lessonTotal();
            return {
                html: t("assistant.r.lessonMissing", { total: total, lessons: lessonWord(total) }),
                actions: [sectionAction("lessons")]
            };
        },
        themeOffer: function (data) {
            return { html: t("assistant.r.themeOffer"), actions: [themeAction(data.to)] };
        },
        nav: function (data) {
            const section = sectionInfo(data.id) || sectionInfo("home");
            return {
                html: t("assistant.r.nav", { section: t(section.key), icon: section.icon }),
                actions: [sectionAction(data.id)]
            };
        },
        langNow: function (data) {
            return { html: t("assistant.r.langNow." + (data.l === "ru" ? "ru" : "en")) };
        },
        langSame: function (data) {
            return { html: t("assistant.r.langSame." + (data.l === "ru" ? "ru" : "en")) };
        },
        langInfo: function () {
            return { html: t("assistant.r.langInfo"), actions: [langAction(A.lang === "ru" ? "en" : "ru")] };
        },
        fact: function (data) {
            return {
                html: t("assistant.r.fact", { fact: listText("assistant.fact", data.n) }),
                actions: [askAction("fact", "assistant.act.fact", "💡")]
            };
        },
        joke: function (data) {
            return {
                html: t("assistant.r.joke", { joke: listText("assistant.joke", data.n) }),
                actions: [askAction("joke", "assistant.act.joke", "😄")]
            };
        },
        defineRandom: function (data) {
            const term = glossaryRefresh(data);
            return {
                html: t("assistant.r.defineRandom", { term: esc(term.term), definition: esc(term.definition) }) +
                    "<br><br>" + t("assistant.r.defineHint"),
                actions: [termAction(term.id), askAction("define", "assistant.act.word", "🔀")]
            };
        },
        glossary: function (data) {
            const term = glossaryRefresh(data);
            return {
                html: t("assistant.r.glossary", { term: esc(term.term), definition: esc(term.definition) }),
                actions: [termAction(term.id)]
            };
        },
        notFound: function (data) {
            return { html: t("assistant.r.notFound", { word: esc(data.word) }), actions: [sectionAction("glossary")] };
        },
        fallback: function (data) {
            return { html: t("assistant.r.fallback" + (data.v ? 2 : 1)) + "<br><br>" + t("assistant.r.tryList") };
        }
    });

    // Turns a saved bot message into { html, actions } in the current language
    function renderReply(message) {
        const make = REPLIES[message.reply] || REPLIES.fallback;
        const view = A.util.attempt(function () { return make(message.data || {}); }, null) ||
            { html: t("assistant.r.fallback1") };
        view.actions = view.actions || [];

        // "By the way, the site is also in Russian" (only once per chat,
        // and hidden again once the site is in that language)
        const hint = message.data && message.data.hint;
        if ((hint === "ru" || hint === "en") && A.lang !== hint) {
            view.html += '<span class="cb-hint">' + t("assistant.r.hint." + hint) + "</span>";
            view.actions.push(langAction(hint));
        }
        return view;
    }

    /* =========================================================
       4. THE BOT'S "BRAIN": FINDING WHAT THE PERSON WANTS
       The word lists are in js/content/assistant.js (brain.intents and
       the others); here is how a message is matched against them.
       ========================================================= */

    // Someone in danger or in deep distress gets a calm answer that points
    // to trusted adults and helplines. This is checked before anything else.

    function needsSupport(tokens) {
        if (anyIn(brain.crisisWords, tokens, true)) return true;
        return anyIn(brain.distressWords, tokens, true) && !anyIn(brain.aiTopicWords, tokens, true);
    }

    function isCommand(tokens) {
        return tokens.length <= 3 || anyIn(brain.commandWords, tokens, true);
    }

    // How many letters differ between two short words ("lerning" vs "learning" = 1)
    function editDistance(a, b) {
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

    // Does one word of a keyword match one word of the message?
    // Long keywords (7+ letters) may have one typo in the message ("lerning" =
    // "learning"), unless "strict" is on. The real words in brain.notTypos are
    // never typos: "neural" is not "neutral", "feeling" is not "feelings".
    function wordMatches(pattern, token, strict) {
        if (!token) return false;
        if (pattern.charAt(pattern.length - 1) === "*") return token.indexOf(pattern.slice(0, -1)) === 0;
        if (token === pattern) return true;
        if (strict || pattern.length < TYPO_MIN_LETTERS || Math.abs(token.length - pattern.length) > 1) return false;
        if (brain.notTypos.indexOf(token) !== -1) return false;
        return editDistance(token, pattern) <= 1;
    }

    // Is this phrase somewhere in the message (as whole words in a row)?
    function phraseIn(phrase, tokens, strict) {
        const words = phrase.split(" ");
        for (let i = 0; i + words.length <= tokens.length; i++) {
            let all = true;
            for (let k = 0; k < words.length; k++) {
                if (!wordMatches(words[k], tokens[i + k], strict)) {
                    all = false;
                    break;
                }
            }
            if (all) return true;
        }
        return false;
    }

    function anyIn(list, tokens, strict) {
        return list.some(function (phrase) { return phraseIn(phrase, tokens, strict); });
    }

    function scoreWords(intent, tokens) {
        let score = 0;
        intent.words.forEach(function (entry) {
            const weak = entry.charAt(0) === "?";
            const phrase = weak ? entry.slice(1) : entry;
            if (phraseIn(phrase, tokens, intent.strict)) {
                score += weak ? 0.5 : phrase.split(" ").length;
            }
        });
        return score;
    }

    // Which section is mentioned? (or "")
    function findSection(tokens) {
        const ids = Object.keys(brain.sectionWords);
        for (let i = 0; i < ids.length; i++) {
            if (anyIn(brain.sectionWords[ids[i]], tokens, true)) return ids[i];
        }
        return "";
    }

    // "Go to the glossary" = 2 points. Just "glossary" = 1 point (only in short messages).
    function navScore(tokens) {
        const section = findSection(tokens);
        if (!section) return 0;
        const verb = anyIn(brain.navVerbs, tokens, true);
        if (!verb && tokens.length > 3) return 0;
        return verb ? 2 : 1;
    }

    // The points of one intent for this message
    function intentScore(intent, tokens) {
        if (intent.id === "nav") return navScore(tokens);
        // In a message about AI, "language" is not about the site ("How does AI
        // understand human language?"), unless a word like "switch", "Russian"
        // or "site" is next to it (brain.languageWords.context)
        if (intent.id === "language" && anyIn(brain.aiTopicWords, tokens, true) &&
            !anyIn(brain.languageWords.context, tokens, true)) {
            return 0;
        }
        return scoreWords(intent, tokens);
    }

    // The intent with the most points (on a tie, the one higher in the list),
    // as { intent, score }, or null when no keyword matched
    function bestIntent(tokens) {
        let best = null;
        brain.intents.forEach(function (intent) {
            const score = intentScore(intent, tokens);
            if (score > 0 && (!best || score > best.score)) best = { intent: intent, score: score };
        });
        return best;
    }

    // ----- Small talk at the start: "Hi! How does AI work?" -----

    function isSmallTalk(id) {
        return brain.smallTalk.indexOf(id) !== -1;
    }

    // The small talk the message starts with: { id: "thanks", length: 2 } for
    // "thank you, what is a token?" (the longest phrase wins), or null
    function smallTalkStart(tokens) {
        let found = null;
        brain.intents.forEach(function (intent) {
            if (!isSmallTalk(intent.id)) return;
            intent.words.forEach(function (entry) {
                const words = entry.replace(/^\?/, "").split(" ");
                const fits = words.every(function (word, i) { return wordMatches(word, tokens[i], intent.strict); });
                if (fits && (!found || words.length > found.length)) found = { id: intent.id, length: words.length };
            });
        });
        return found;
    }

    // - "Thanks for the joke!", "спасибо большое за помощь": a thank-you FOR
    //   something ("for" / "за" in the next 3 words) is a thank-you.
    // - "Hi! How does AI work?": when small talk wins, the bot answers the
    //   2+ words after it instead, if it understands them (and they are not
    //   small talk too: "ok, got it").
    // Returns a plan, or null to keep the best intent.
    function smallTalkPlan(best, tokens) {
        const start = smallTalkStart(tokens);
        if (!start) return null;
        const rest = tokens.slice(start.length);
        if (start.id === "thanks" && anyIn(brain.thanksFor, rest.slice(0, 3), true)) {
            return { kind: "intent", id: "thanks", tokens: tokens };
        }
        if (!isSmallTalk(best.intent.id) || rest.length < 2) return null;
        const plan = understand(rest.join(" "));
        if (plan.kind === "fallback" || (plan.kind === "intent" && isSmallTalk(plan.id))) return null;
        return plan;
    }

    // ----- "What is X?" / "Define X" -----

    function startsWithPhrase(text, phrase) {
        return text === phrase || text.indexOf(phrase + " ") === 0;
    }

    function defineRequest(norm) {
        let text = norm;
        // Skip polite words at the start: "please define ..." / "ну что такое ..."
        let changed = true;
        while (changed) {
            changed = false;
            brain.fillers.forEach(function (word) {
                if (text.indexOf(word + " ") === 0) {
                    text = text.slice(word.length + 1);
                    changed = true;
                }
            });
        }

        let explicit = false;
        let rest = null;
        brain.defineExplicit.some(function (phrase) {
            if (startsWithPhrase(text, phrase)) {
                explicit = true;
                rest = text.slice(phrase.length);
                return true;
            }
            return false;
        });
        if (rest === null) {
            brain.defineQuestion.some(function (phrase) {
                if (startsWithPhrase(text, phrase)) {
                    rest = text.slice(phrase.length);
                    return true;
                }
                return false;
            });
        }
        if (rest === null) return null;

        // Tidy the subject: "the word overfitting mean" -> "overfitting"
        let subject = rest.trim().replace(/^(the word|the term|word|term|слово|термин)\s+/, "");
        brain.endings.forEach(function (ending) {
            if (subject.length > ending.length && subject.slice(-(ending.length + 1)) === " " + ending) {
                subject = subject.slice(0, -(ending.length + 1));
            }
        });
        return { explicit: explicit, subject: subject.trim() };
    }

    // "tokens" and "token", "нейросети" and "нейросеть" count as the same word
    function sameWord(a, b) {
        if (a === b) return true;
        let shared = 0;
        while (shared < a.length && shared < b.length && a.charAt(shared) === b.charAt(shared)) shared++;
        return shared >= 4 && shared >= Math.min(a.length, b.length) - 2;
    }

    // Does the glossary term name the WHOLE subject of the question?
    // "what is a token" -> "Token": yes.
    // "what are the risks of AI" -> "Artificial intelligence": no, the question is about risks.
    function termCovers(term, subject) {
        const termWords = normalise(term.term).split(" ");
        return normalise(subject).split(" ").every(function (word) {
            return !word || brain.coverSkip.indexOf(word) !== -1 ||
                termWords.some(function (termWord) { return sameWord(word, termWord); });
        });
    }

    // ----- Picking an answer for each intent -----
    // Facts and jokes come out of a shuffled "bag", so none repeats before
    // all of them were told
    function nextFromBag(name, count) {
        // A saved bag keeps only numbers that exist (texts may have been removed)
        let bag = (Array.isArray(chat.bags[name]) ? chat.bags[name] : []).filter(function (n) {
            return whole(n) >= 1 && n <= count;
        });
        if (!bag.length) {
            const all = [];
            for (let i = 1; i <= count; i++) all.push(i);
            bag = A.util.shuffle(all);
            // Never the same item twice in a row
            if (bag[0] === chat.last[name] && bag.length > 1) {
                bag.push(bag.shift());
            }
        }
        const n = bag.shift();
        chat.bags[name] = bag;
        chat.last[name] = n;
        return n;
    }

    // The first lesson that is not finished (n: 0 when all are) and how many are
    function recommendAnswer() {
        if (!A.lessons) return { reply: "recommend", data: { n: 1, done: 0 } };
        return { reply: "recommend", data: { n: A.lessons.next(), done: A.lessons.completed().length } };
    }

    function defineRandomAnswer() {
        const term = glossaryRandom();
        if (!term) return { reply: "noGlossary" };
        return { reply: "defineRandom", data: term, fillInput: true };
    }

    function themeAnswer(tokens) {
        const dark = anyIn(brain.themeWords.dark, tokens, true);
        const light = anyIn(brain.themeWords.light, tokens, true);
        let target = A.theme === "dark" ? "light" : "dark";
        if (dark && !light) target = "dark";
        if (light && !dark) target = "light";
        // "too bright" means: make it dark
        if (anyIn(brain.themeWords.tooBright, tokens, true)) target = "dark";
        if (anyIn(brain.themeWords.tooDark, tokens, true)) target = "light";
        return {
            reply: target === "dark" ? "themeDark" : "themeLight",
            pre: function () { A.setTheme(target); }
        };
    }

    function languageAnswer(tokens) {
        let target = "";
        if (anyIn(brain.languageWords.ru, tokens, true)) target = "ru";
        else if (anyIn(brain.languageWords.en, tokens, true)) target = "en";
        else if (anyIn(brain.languageWords.change, tokens, true)) {
            target = A.lang === "en" ? "ru" : "en";
        }
        if (!target) return { reply: "langInfo" };
        if (target === A.lang) return { reply: "langSame", data: { l: target } };
        return {
            reply: "langNow",
            data: { l: target },
            pre: function () { A.setLanguage(target); }
        };
    }

    // What happens for each intent: { reply, data, pre, auto, fillInput }
    // pre  = do something right before the answer appears (theme, language)
    // auto = press a button automatically just after the answer (go to the quiz...)
    function answerFor(id, tokens) {
        tokens = tokens || [];
        switch (id) {
            case "theme": return themeAnswer(tokens);
            case "language": return languageAnswer(tokens);
            case "quiz": return { reply: "quiz", auto: { act: "quiz", arg: "" } };
            case "lab": {
                const predictor = anyIn(brain.predictorWords, tokens);
                const tab = predictor ? "predictor" : "classifier";
                return { reply: "lab", data: { tab: tab }, auto: { act: "lab", arg: tab } };
            }
            case "recommend": return recommendAnswer();
            case "nav": {
                const section = findSection(tokens) || "home";
                return { reply: "nav", data: { id: section }, auto: { act: "section", arg: section } };
            }
            case "fact": return { reply: "fact", data: { n: nextFromBag("fact", textCount("assistant.fact")) } };
            case "joke": return { reply: "joke", data: { n: nextFromBag("joke", textCount("assistant.joke")) } };
            case "define": return defineRandomAnswer();
            case "greeting": return { reply: "greeting", data: { v: A.util.randomInt(0, 2) } };
            default: return REPLIES[id] ? { reply: id } : { reply: "fallback", data: { v: A.util.randomInt(0, 1) } };
        }
    }

    // Answers that DO something (start the quiz, switch the theme...) only do it
    // when the message sounds like a command. Otherwise the person gets a button.
    // "start the quiz" -> starts it; "how many questions does the quiz have?" -> a button
    function commandOrOffer(job, tokens) {
        if (!job.auto && !job.pre) return job;
        if (job.reply === "nav" || isCommand(tokens)) return job;   // "go to ..." checks its own verbs
        switch (job.reply) {
            case "lessonOpen": return { reply: "lessonOffer", data: job.data };
            case "quiz": return { reply: "quizOffer" };
            case "lab": return { reply: "labOffer", data: job.data };
            case "themeDark":
            case "themeLight": {
                // The button offers a real change (not the theme that is already on)
                let to = job.reply === "themeDark" ? "dark" : "light";
                if (to === A.theme) to = to === "dark" ? "light" : "dark";
                return { reply: "themeOffer", data: { to: to } };
            }
            case "langNow": return { reply: "langInfo" };
            default: return { reply: job.reply, data: job.data };
        }
    }

    // ----- Thinking, in two steps -----
    // 1. understand(text): what does the message ask for? It returns a "plan":
    //      { kind: "support" }              someone may be in danger
    //      { kind: "lesson", n, tokens }    "lesson 3" (a lesson that exists)
    //      { kind: "lessonMissing" }        "lesson 9"
    //      { kind: "defineRandom" }         "define", with no word after it
    //      { kind: "glossary", term }       a word from the glossary
    //      { kind: "notFound", word }       "what is X?", and X is unknown
    //      { kind: "intent", id, tokens }   one of brain.intents
    //      { kind: "fallback" }             no idea
    //    It never picks anything at random, so it can also be tried on a part
    //    of the message (see smallTalkPlan).
    // 2. answer(plan): the answer itself (a random greeting, the next fact...).

    function understand(text) {
        const norm = normalise(text);
        const tokens = norm ? norm.split(" ") : [];
        if (!tokens.length) return { kind: "fallback" };

        // Someone who may be in danger always comes first
        if (needsSupport(tokens)) return { kind: "support" };

        // "lesson 3", "урок 3", "3 урок" and "к уроку 3" open that lesson.
        // A count is not a lesson number: "5 уроков", "3 урока" (5 lessons, 3 lessons).
        const lessonMatch = norm.match(/(?:^|\s)(?:lesson|урок|урока|уроку|уроке|уроком)\s+(\d+)(?:\s|$)/) ||
            norm.match(/(?:^|\s)(\d+)\s+(?:lesson|урок|уроку|уроке|уроком)(?:\s|$)/);
        if (lessonMatch) {
            const n = Number(lessonMatch[1]);
            return lessonExists(n) ? { kind: "lesson", n: n, tokens: tokens } : { kind: "lessonMissing" };
        }

        const best = bestIntent(tokens);

        // "What is X?" — the glossary may know X.
        // A clear keyword match (2+ points, e.g. "what is machine learning")
        // keeps the bot's own longer answer, unless the person said "define".
        // A weak match keeps it too when the glossary word is only part of the
        // question: "what are the risks of AI?" is about risks, not about "AI".
        const define = defineRequest(norm);
        if (define) {
            if (!define.subject) return { kind: "defineRandom" };
            const strongMatch = best && best.score >= 2;
            if (define.explicit || !strongMatch) {
                const term = glossaryFind(define.subject);
                if (term && (define.explicit || !best || termCovers(term, define.subject))) {
                    return { kind: "glossary", term: term };
                }
                if (!best && define.subject.split(" ").length <= 3) {
                    return { kind: "notFound", word: define.subject.slice(0, UNKNOWN_WORD_MAX) };
                }
            }
        }

        if (best) return smallTalkPlan(best, tokens) || { kind: "intent", id: best.intent.id, tokens: tokens };

        // No keyword at all: maybe it's just a word from the glossary ("overfitting")
        const term = glossaryFind(text);
        if (term) return { kind: "glossary", term: term };

        return { kind: "fallback" };
    }

    function answer(plan) {
        switch (plan.kind) {
            case "support": return { reply: "support", calm: true };
            case "lesson": {
                const job = { reply: "lessonOpen", data: { n: plan.n }, auto: { act: "lesson", arg: plan.n } };
                return commandOrOffer(job, plan.tokens);
            }
            case "lessonMissing": return { reply: "lessonMissing" };
            case "defineRandom": return defineRandomAnswer();
            case "glossary": return { reply: "glossary", data: plan.term };
            case "notFound": return { reply: "notFound", data: { word: plan.word } };
            case "intent": return commandOrOffer(answerFor(plan.id, plan.tokens), plan.tokens);
            default: return { reply: "fallback", data: { v: A.util.randomInt(0, 1) } };
        }
    }

    // The main "thinking" step: message in, answer out
    function think(text) {
        return answer(understand(text));
    }

    /* =========================================================
       5. BUILDING THE CHAT WINDOW
       ========================================================= */

    // Little SVG icons
    const ICONS = {
        close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
        reset: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        send: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4.5 12.5l14-7.5-4.5 15-3-6.2-6.5-1.3z" fill="currentColor"/></svg>',
        info: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.8v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.2" fill="currentColor"/></svg>',
        chevron: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };

    // The orb (used by the launcher and, smaller, by the header)
    function orbHTML(extraClass) {
        return '<span class="cb-orb ' + (extraClass || "") + '" aria-hidden="true">' +
            '<span class="cb-orb-halo"></span>' +
            '<span class="cb-orb-ring"></span>' +
            '<span class="cb-orb-core"></span>' +
            '<span class="cb-orb-face"><span class="cb-eye"></span><span class="cb-eye"></span></span>' +
            "</span>";
    }

    mount.innerHTML =
        '<div class="cb-root">' +
            // "Ask me" hint next to the button (first visits only)
            '<div class="cb-tip" hidden>' +
                '<button type="button" class="cb-tip-text" data-i18n="assistant.tip">' + t("assistant.tip") + "</button>" +
                '<button type="button" class="cb-tip-close" data-i18n-attr="aria-label:assistant.tipClose,title:assistant.tipClose" ' +
                    'aria-label="' + esc(t("assistant.tipClose")) + '" title="' + esc(t("assistant.tipClose")) + '">' + ICONS.close + "</button>" +
            "</div>" +

            // The glowing round button
            '<button type="button" class="cb-launcher" aria-expanded="false" aria-controls="cb-panel" aria-haspopup="dialog" ' +
                'data-i18n-attr="aria-label:assistant.launcher,title:assistant.launcher" ' +
                'aria-label="' + esc(t("assistant.launcher")) + '" title="' + esc(t("assistant.launcher")) + '">' +
                orbHTML("cb-orb--launcher") +
                '<span class="cb-launcher-close" aria-hidden="true">' + ICONS.chevron + "</span>" +
                '<span class="cb-launcher-dot" aria-hidden="true"></span>' +
            "</button>" +

            // Dark layer behind the chat on phones
            '<div class="cb-backdrop" hidden></div>' +

            // The chat window
            '<section class="cb-panel" id="cb-panel" role="dialog" aria-labelledby="cb-title" aria-describedby="cb-disclaimer" hidden>' +
                '<span class="cb-grabber" aria-hidden="true"></span>' +
                '<header class="cb-head">' +
                    orbHTML("cb-orb--head") +
                    '<div class="cb-head-text">' +
                        '<h2 class="cb-title" id="cb-title" data-i18n="assistant.name">' + t("assistant.name") + "</h2>" +
                        '<p class="cb-status"><span class="cb-status-dot" aria-hidden="true"></span>' +
                            '<span class="cb-status-text" data-i18n="assistant.status">' + t("assistant.status") + "</span></p>" +
                    "</div>" +
                    '<div class="cb-head-actions">' +
                        '<button type="button" class="cb-icon-btn cb-reset" data-i18n-attr="aria-label:assistant.reset,title:assistant.reset" ' +
                            'aria-label="' + esc(t("assistant.reset")) + '" title="' + esc(t("assistant.reset")) + '">' + ICONS.reset + "</button>" +
                        '<button type="button" class="cb-icon-btn cb-close" data-i18n-attr="aria-label:assistant.close,title:assistant.close" ' +
                            'aria-label="' + esc(t("assistant.close")) + '" title="' + esc(t("assistant.close")) + '">' + ICONS.close + "</button>" +
                    "</div>" +
                "</header>" +

                '<p class="cb-disclaimer" id="cb-disclaimer">' +
                    '<span class="cb-disclaimer-icon" aria-hidden="true">' + ICONS.info + "</span>" +
                    '<span data-i18n="assistant.disclaimer">' + t("assistant.disclaimer") + "</span>" +
                "</p>" +

                '<div class="cb-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" ' +
                    'data-i18n-attr="aria-label:assistant.logLabel" aria-label="' + esc(t("assistant.logLabel")) + '"></div>' +

                '<div class="cb-chips" role="group" data-i18n-attr="aria-label:assistant.chipsLabel" aria-label="' + esc(t("assistant.chipsLabel")) + '">' +
                    brain.chips.map(function (chip) {
                        return '<button type="button" class="cb-chip" data-intent="' + chip.intent + '">' +
                            '<span aria-hidden="true">' + chip.icon + "</span>" +
                            '<span data-i18n="' + chip.key + '">' + t(chip.key) + "</span></button>";
                    }).join("") +
                "</div>" +

                '<form class="cb-form" autocomplete="off">' +
                    '<label class="sr-only" for="cb-input" data-i18n="assistant.inputLabel">' + t("assistant.inputLabel") + "</label>" +
                    '<input class="cb-input" id="cb-input" type="text" maxlength="' + MAX_LENGTH + '" enterkeyhint="send" spellcheck="true" ' +
                        'data-i18n-attr="placeholder:assistant.placeholder" placeholder="' + esc(t("assistant.placeholder")) + '">' +
                    '<button type="submit" class="cb-send" disabled data-i18n-attr="aria-label:assistant.send,title:assistant.send" ' +
                        'aria-label="' + esc(t("assistant.send")) + '" title="' + esc(t("assistant.send")) + '">' + ICONS.send + "</button>" +
                "</form>" +
            "</section>" +
        "</div>";

    const ui = {
        root: mount.querySelector(".cb-root"),
        tip: mount.querySelector(".cb-tip"),
        tipText: mount.querySelector(".cb-tip-text"),
        tipClose: mount.querySelector(".cb-tip-close"),
        launcher: mount.querySelector(".cb-launcher"),
        backdrop: mount.querySelector(".cb-backdrop"),
        panel: mount.querySelector(".cb-panel"),
        statusText: mount.querySelector(".cb-status-text"),
        reset: mount.querySelector(".cb-reset"),
        close: mount.querySelector(".cb-close"),
        log: mount.querySelector(".cb-log"),
        chips: mount.querySelector(".cb-chips"),
        form: mount.querySelector(".cb-form"),
        input: mount.querySelector(".cb-input"),
        send: mount.querySelector(".cb-send")
    };

    /* =========================================================
       6. SHOWING MESSAGES
       ========================================================= */

    // The conversation for this tab: messages + "bags" for facts and jokes
    const chat = {
        messages: [],
        bags: {},
        last: {},
        hinted: false,
        nextId: 1
    };

    const state = {
        open: false,
        busy: false,
        queue: [],
        generation: 0,    // goes up on "new chat", so old replies are dropped
        hideTimer: 0,
        tipTimer: 0,
        typingRow: null,
        prefill: "",      // the "Define " text the bot put in the message box
        focusBefore: null // where the focus was when the chat opened
    };

    function fillBotRow(row, message) {
        const view = renderReply(message);
        row.querySelector(".cb-text").innerHTML = view.html;
        const box = row.querySelector(".cb-actions");
        box.innerHTML = "";
        box.hidden = !view.actions.length;
        view.actions.forEach(function (action) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "cb-action";
            button.setAttribute("data-act", action.act);
            button.setAttribute("data-arg", String(action.arg));
            button.innerHTML = '<span class="cb-action-icon" aria-hidden="true"></span><span class="cb-action-label"></span>';
            button.querySelector(".cb-action-icon").textContent = action.icon || "→";
            button.querySelector(".cb-action-label").textContent = action.label;
            box.appendChild(button);
        });
    }

    function buildRow(message, animate) {
        const row = document.createElement("div");
        row.className = "cb-msg cb-msg--" + (message.from === "user" ? "user" : "bot") + (animate ? " is-new" : "");
        row.setAttribute("data-id", String(message.id));

        const time = '<time class="cb-time" aria-hidden="true" datetime="' + new Date(message.time).toISOString() + '">' +
            clockTime(message.time) + "</time>";

        if (message.from === "user") {
            row.innerHTML =
                '<div class="cb-msg-body">' +
                    '<div class="cb-bubble"><span class="sr-only" data-i18n="assistant.youSaid">' + t("assistant.youSaid") + "</span> " +
                    '<span class="cb-user-text"></span></div>' + time +
                "</div>";
            // User text is always added as plain text, never as HTML
            row.querySelector(".cb-user-text").textContent = message.text;
        } else {
            row.innerHTML =
                '<span class="cb-avatar" aria-hidden="true"></span>' +
                '<div class="cb-msg-body">' +
                    '<div class="cb-bubble"><span class="sr-only" data-i18n="assistant.botSaid">' + t("assistant.botSaid") + "</span> " +
                    '<div class="cb-text"></div><div class="cb-actions"></div></div>' + time +
                "</div>";
            fillBotRow(row, message);
        }
        return row;
    }

    function scrollLogTo(top, smooth) {
        const log = ui.log;
        if (smooth && A.motion.ok() && typeof log.scrollTo === "function") {
            log.scrollTo({ top: top, behavior: "smooth" });
        } else {
            log.scrollTop = top;
        }
    }

    function scrollToEnd(smooth) {
        scrollLogTo(ui.log.scrollHeight, smooth);
    }

    // A new answer: show it from its start (with the question above it, if it fits).
    // Short answers simply scroll to the end; long ones are not cut off at the top.
    function scrollToAnswer(row, smooth) {
        const log = ui.log;
        const before = row.previousElementSibling;
        const anchor = before && before.classList.contains("cb-msg--user") ? before : row;
        const end = log.scrollHeight - log.clientHeight;
        // offsetTop is measured inside the log (it is position: relative in the CSS)
        const top = Math.max(0, Math.min(end, anchor.offsetTop - ANSWER_TOP_GAP));
        scrollLogTo(top, smooth);
    }

    function addMessage(message, animate) {
        chat.messages.push(message);
        // Keep the chat short enough for the browser's storage
        while (chat.messages.length > MAX_MESSAGES) {
            chat.messages.shift();
            const first = ui.log.querySelector(".cb-msg");
            if (first) first.remove();
        }
        const row = buildRow(message, animate && A.motion.ok());
        if (state.typingRow && state.typingRow.parentNode === ui.log) {
            ui.log.insertBefore(row, state.typingRow);
        } else {
            ui.log.appendChild(row);
        }
        if (message.from === "bot") scrollToAnswer(row, animate);
        else scrollToEnd(animate);
        save();
        return row;
    }

    function addUserMessage(text) {
        return addMessage({ id: chat.nextId++, from: "user", text: String(text).slice(0, MAX_LENGTH), time: Date.now() }, true);
    }

    function addBotMessage(reply, data, animate) {
        return addMessage({ id: chat.nextId++, from: "bot", reply: reply, data: data || {}, time: Date.now() }, animate);
    }

    function renderAll() {
        ui.log.innerHTML = "";
        chat.messages.forEach(function (message) {
            ui.log.appendChild(buildRow(message, false));
        });
        if (state.typingRow) ui.log.appendChild(state.typingRow);
        scrollToEnd(false);
    }

    // On language change: redraw the bot's answers in the new language,
    // quietly (so screen readers don't read the whole chat again)
    function retranslateMessages() {
        ui.log.setAttribute("aria-live", "off");
        ui.log.querySelectorAll(".cb-msg--bot").forEach(function (row) {
            const id = Number(row.getAttribute("data-id"));
            const message = chat.messages.find(function (item) { return item.id === id; });
            if (message) fillBotRow(row, message);
        });
        setTimeout(function () { ui.log.setAttribute("aria-live", "polite"); }, QUIET_REDRAW_MS);
    }

    /* =========================================================
       7. TYPING DOTS AND THE REPLY QUEUE
       The bot "types" for a moment (longer answers take longer),
       then the answer appears. Several questions wait in a queue.
       ========================================================= */

    function setTyping(on) {
        ui.root.classList.toggle("is-typing", on);
        ui.statusText.textContent = t(on ? "assistant.statusTyping" : "assistant.status");
        ui.statusText.setAttribute("data-i18n", on ? "assistant.statusTyping" : "assistant.status");

        if (on && !state.typingRow) {
            const row = document.createElement("div");
            row.className = "cb-msg cb-msg--bot cb-typing";
            row.setAttribute("aria-hidden", "true");
            row.innerHTML = '<span class="cb-avatar"></span><div class="cb-msg-body"><div class="cb-bubble">' +
                '<span class="cb-dots"><span></span><span></span><span></span></span></div></div>';
            state.typingRow = row;
            ui.log.appendChild(row);
            scrollToEnd(true);
        } else if (!on && state.typingRow) {
            state.typingRow.remove();
            state.typingRow = null;
        }
    }

    // A bit longer for long answers (see TYPING_MS in the settings)
    function typingDelay(job) {
        const view = renderReply({ reply: job.reply, data: job.data || {} });
        const length = plainText(view.html).length;
        return Math.round(TYPING_MS + Math.min(TYPING_EXTRA_MS, length * TYPING_LETTER_MS));
    }

    function enqueue(job) {
        job.generation = state.generation;
        state.queue.push(job);
        if (!state.busy) nextJob();
    }

    function nextJob() {
        const job = state.queue.shift();
        if (!job) {
            state.busy = false;
            setTyping(false);
            return;
        }
        state.busy = true;
        setTyping(true);
        setTimeout(function () {
            if (job.generation !== state.generation) return;   // the chat was restarted
            setTyping(false);
            deliver(job);
            setTimeout(function () {
                // A restarted chat has its own queue now: leave it alone
                if (job.generation === state.generation) nextJob();
            }, NEXT_REPLY_MS);
        }, typingDelay(job));
    }

    function deliver(job) {
        if (typeof job.pre === "function") A.util.attempt(job.pre);
        addBotMessage(job.reply, job.data, true);

        // "Define a word": help the person by starting the sentence for them,
        // and put the cursor at its end so they can type the word right away
        if (job.fillInput && !ui.input.value) {
            ui.input.value = t("assistant.prefillDefine");
            state.prefill = ui.input.value;
            updateSendButton();
            if (state.open && ui.panel.contains(document.activeElement)) {
                ui.input.focus({ preventScroll: true });
                const end = ui.input.value.length;
                A.util.attempt(function () { ui.input.setSelectionRange(end, end); });
            }
        }
        // "Start the quiz": a moment to read the answer, then the bot does it
        // (not if the chat was restarted in the meantime)
        if (job.auto) {
            const action = job.auto;
            setTimeout(function () {
                if (job.generation === state.generation) runAction(action);
            }, ACTION_DELAY_MS);
        }
    }

    // A message typed by the person
    function sendText(text) {
        const clean = String(text || "").trim().slice(0, MAX_LENGTH);
        if (!clean) return;
        addUserMessage(clean);
        const job = think(clean);
        A.track("bot.ask", { typed: true });

        // Typed in the "other" alphabet? Offer the other language once
        // (not when the person is already talking about languages).
        if (job.reply === "langNow" || job.reply === "langSame" || job.reply === "langInfo") chat.hinted = true;
        // (never under a serious answer like "talk to a trusted adult")
        if (!chat.hinted && !job.calm) {
            const cyrillic = /[а-яё]/i.test(clean);
            // Names like "ELIZA", "ChatGPT" or "LLM" are written in Latin letters
            // in Russian too, so they don't count as English words
            const englishWords = (clean.match(/[a-z]{3,}/gi) || []).filter(function (word) {
                return word !== word.toUpperCase() && brain.latinNames.indexOf(word.toLowerCase()) === -1;
            });
            const latin = englishWords.length > 0 && !cyrillic;
            const hint = cyrillic && A.lang === "en" ? "ru" : (latin && A.lang === "ru" ? "en" : "");
            if (hint) {
                job.data = Object.assign({}, job.data, { hint: hint });
                chat.hinted = true;
            }
        }
        enqueue(job);
    }

    // A chip or "Another fact" button: shows its label as the person's message
    function sendIntent(intent, label) {
        addUserMessage(label);
        A.track("bot.ask", { intent: intent });
        enqueue(answerFor(intent, []));
    }

    /* =========================================================
       8. BUTTONS INSIDE MESSAGES (ACTIONS)
       They use the other features' public APIs (AICompass.lessons, .quiz,
       .lab, .glossary). If a feature is missing from the page, the bot
       simply goes to its section.
       ========================================================= */

    const LEAVING = ["lesson", "quiz", "lab", "glossary", "section"];

    function runAction(action) {
        // The chat would cover the place we go to (on phones all of it, on computers
        // the right side), so it closes first. The conversation is kept, and the
        // round button opens it again.
        if (LEAVING.indexOf(action.act) !== -1 && state.open) closePanel(true);

        switch (action.act) {
            case "lesson": {
                const n = Number(action.arg) || 1;
                // When the reader closes, the focus comes back to the round button
                if (A.lessons) A.util.attempt(function () { A.lessons.open(n, ui.launcher); });
                else A.navigate("lessons");
                break;
            }
            case "quiz":
                if (A.quiz) A.util.attempt(function () { A.quiz.start(); });
                else A.navigate("quiz");
                break;
            case "lab":
                if (A.lab) A.util.attempt(function () { A.lab.open(action.arg === "predictor" ? "predictor" : "classifier"); });
                else A.navigate("lab");
                break;
            case "glossary":
                // { focus: true }: the keyboard focus moves to the term card too
                if (A.glossary) A.util.attempt(function () { A.glossary.show(action.arg, { focus: true }); });
                else A.navigate("glossary");
                break;
            case "section":
                // Scrolls there and moves the keyboard focus to the section's heading,
                // so Tab continues from there
                A.navigate(sectionInfo(action.arg) ? action.arg : "home");
                break;
            case "lang": {
                const target = action.arg === "ru" ? "ru" : "en";
                chat.hinted = true;
                if (target === A.lang) {
                    enqueue({ reply: "langSame", data: { l: target } });
                } else {
                    enqueue({ reply: "langNow", data: { l: target }, pre: function () { A.setLanguage(target); } });
                }
                break;
            }
            case "theme": {
                const theme = action.arg === "light" ? "light" : "dark";
                enqueue({
                    reply: theme === "dark" ? "themeDark" : "themeLight",
                    pre: function () { A.setTheme(theme); }
                });
                break;
            }
            case "ask": {
                // The person "says" the button's text, then the bot answers
                const labels = { fact: "assistant.act.fact", joke: "assistant.act.joke", define: "assistant.act.word" };
                sendIntent(action.arg, action.label || t(labels[action.arg] || "assistant.chip.fact"));
                break;
            }
        }
    }

    ui.log.addEventListener("click", function (event) {
        const button = event.target.closest(".cb-action");
        if (!button || !ui.log.contains(button)) return;
        const act = button.getAttribute("data-act");
        const arg = button.getAttribute("data-arg");
        const label = button.querySelector(".cb-action-label").textContent;
        runAction({ act: act, arg: act === "lesson" ? Number(arg) : arg, label: label });
    });

    ui.chips.addEventListener("click", function (event) {
        const chip = event.target.closest(".cb-chip");
        if (!chip) return;
        const info = brain.chips.find(function (item) { return item.intent === chip.getAttribute("data-intent"); });
        if (info) sendIntent(info.intent, t(info.key));
    });

    // On short screens the chips sit in one row that scrolls sideways.
    // A normal mouse wheel (up / down) scrolls that row too.
    ui.chips.addEventListener("wheel", function (event) {
        const chips = ui.chips;
        if (chips.scrollWidth <= chips.clientWidth + 1) return;            // everything fits
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;      // already sideways
        const step = event.deltaMode === 1 ? event.deltaY * WHEEL_LINE_PX : event.deltaY;
        const before = chips.scrollLeft;
        chips.scrollLeft = before + step;
        if (chips.scrollLeft !== before) event.preventDefault();
    }, { passive: false });

    // ----- Typing and sending -----
    function updateSendButton() {
        ui.send.disabled = !ui.input.value.trim();
    }

    ui.input.addEventListener("input", updateSendButton);

    ui.form.addEventListener("submit", function (event) {
        event.preventDefault();
        const text = ui.input.value;
        if (!text.trim()) return;
        ui.input.value = "";
        updateSendButton();
        sendText(text);
        ui.input.focus({ preventScroll: true });
    });

    // Arrow Up in an empty box brings back your last message (like a terminal)
    ui.input.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowUp" || ui.input.value) return;
        for (let i = chat.messages.length - 1; i >= 0; i--) {
            if (chat.messages[i].from === "user") {
                event.preventDefault();
                ui.input.value = chat.messages[i].text;
                updateSendButton();
                break;
            }
        }
    });

    ui.reset.addEventListener("click", function () {
        state.generation++;
        state.queue = [];
        state.busy = false;
        setTyping(false);
        chat.messages = [];
        chat.hinted = false;
        ui.log.innerHTML = "";
        addBotMessage("welcome", {}, true);
        ui.input.focus({ preventScroll: true });
    });

    /* =========================================================
       9. OPENING AND CLOSING THE CHAT
       Desktop: a window above the button (the page stays usable).
       Phones: an almost full-screen sheet that acts like a modal.
       ========================================================= */

    // Phones (640 px wide or less) get the sheet
    function isSheet() {
        return A.media(A.queries.phone).matches;
    }

    // The chat is a pop-up window of the page (see "overlays" in core.js).
    // - Phones: a modal sheet. Core stops the page from scrolling, makes the
    //   rest of the page unreachable, keeps Tab inside, closes it with Esc and
    //   when the page goes to another section.
    // - Desktop: a window next to the page, which stays usable. Esc closes it
    //   only while the focus is in the chat or on the round button.
    // The options are functions, so they follow the screen width (see applyMode).
    const overlay = A.overlays.register("assistant", {
        root: ui.root,           // the round button, the hint, the backdrop and the chat
        element: ui.panel,
        modal: isSheet,
        closeOnNavigate: isSheet,
        escape: function () { return isSheet() ? "anywhere" : "inside"; },
        // After Esc or a close the focus goes back to the round button. When the
        // page moves on ("navigate", "command"), the place you go to takes it.
        close: function (reason) {
            closePanel(reason !== "navigate" && reason !== "command");
        }
    });

    // Phones: keep the sheet exactly over the part of the screen you can see.
    // The visible part can be smaller than the page's "layout" area: when the
    // on-screen keyboard is open, or when something on the page is too wide.
    const SHEET_PROPS = ["--cb-sheet-h", "--cb-sheet-b", "--cb-sheet-l", "--cb-sheet-w"];

    function fitToViewport() {
        const viewport = window.visualViewport;
        const differs = viewport && (
            Math.abs(viewport.height - window.innerHeight) > 1 ||
            Math.abs(viewport.width - window.innerWidth) > 1 ||
            Math.abs(viewport.offsetLeft) > 1 || Math.abs(viewport.offsetTop) > 1
        );
        if (!state.open || !isSheet() || !differs) {
            // The normal CSS size is right
            SHEET_PROPS.forEach(function (name) { ui.panel.style.removeProperty(name); });
            return;
        }
        const below = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
        ui.panel.style.setProperty("--cb-sheet-h", Math.round(viewport.height - SHEET_GAP_PX) + "px");
        ui.panel.style.setProperty("--cb-sheet-b", Math.round(below) + "px");
        ui.panel.style.setProperty("--cb-sheet-l", Math.round(viewport.offsetLeft) + "px");
        ui.panel.style.setProperty("--cb-sheet-w", Math.round(viewport.width) + "px");
    }

    // Sheet or window: set up the chat for the current width. Runs when the chat
    // opens, and when the width crosses 640 px.
    function applyMode() {
        const sheet = isSheet();
        if (sheet) ui.panel.setAttribute("aria-modal", "true");
        else ui.panel.removeAttribute("aria-modal");
        ui.backdrop.hidden = !(state.open && sheet);
        overlay.update();        // core reads modal, closeOnNavigate and escape again
        fitToViewport();
    }

    function openPanel() {
        clearTimeout(state.hideTimer);
        if (state.open) {
            ui.input.focus({ preventScroll: true });
            return;
        }
        state.open = true;
        state.focusBefore = document.activeElement;

        dismissTip(true);
        if (!chat.messages.length) addBotMessage("welcome", {}, false);

        ui.panel.hidden = false;
        ui.root.classList.add("is-open");
        ui.launcher.setAttribute("aria-expanded", "true");
        overlay.opened();        // before the focus moves in (see core.js)
        applyMode();
        scrollToEnd(false);

        // Let the browser draw the hidden state first, then animate in
        A.dom.replay(ui.panel, "is-visible");
        ui.backdrop.classList.add("is-visible");
        ui.input.focus({ preventScroll: true });
    }

    function closePanel(restoreFocus) {
        if (!state.open) return;
        state.open = false;
        const wasInside = ui.panel.contains(document.activeElement);
        const focusBefore = state.focusBefore;
        state.focusBefore = null;
        ui.panel.classList.remove("is-visible");
        ui.backdrop.classList.remove("is-visible");
        ui.root.classList.remove("is-open");
        ui.launcher.setAttribute("aria-expanded", "false");
        // The round button is part of this window (its root), so it takes the
        // focus back at once (at the end). But when a window that shuts out the
        // page stays open under the chat (the lesson reader, opened before the
        // chat), the round button becomes unreachable with the rest of the page.
        // Then the focus goes back to where it was in that window: core calls
        // this function once the page is updated (see overlays in core.js).
        overlay.closed(function () {
            if (!ui.launcher.closest("[inert]")) return;
            if (focusBefore && focusBefore.isConnected && !focusBefore.closest("[inert]")) {
                focusBefore.focus({ preventScroll: true });
            }
        });

        state.hideTimer = setTimeout(function () {
            if (state.open) return;
            ui.panel.hidden = true;
            ui.backdrop.hidden = true;
            fitToViewport();
        }, A.motion.ok() ? CLOSE_MS : 0);

        // Focus goes back to the round button (unless a window stays open under the chat)
        if ((restoreFocus !== false || wasInside) && !A.overlays.hasModal()) {
            ui.launcher.focus({ preventScroll: true });
        }
    }

    function togglePanel() {
        if (state.open) closePanel(true);
        else openPanel();
    }

    ui.launcher.addEventListener("click", togglePanel);
    ui.close.addEventListener("click", function () { closePanel(true); });
    ui.backdrop.addEventListener("click", function () { closePanel(true); });

    // The width crossed 640 px (a phone turned, a window resized): sheet <-> window
    A.onMedia(A.queries.phone, applyMode, { immediate: false });

    A.onResize(fitToViewport, { viewport: true });

    // ----- Phones: pull the sheet down by its top edge to close it -----
    const drag = { id: null, startY: 0, lastY: 0, lastTime: 0, speed: 0, distance: 0 };

    ui.panel.addEventListener("pointerdown", function (event) {
        if (!state.open || !isSheet() || drag.id !== null || event.button > 0) return;
        // Only the handle and the header (but not its buttons) start a drag
        if (!event.target.closest(".cb-grabber, .cb-head") || event.target.closest("button")) return;
        drag.id = event.pointerId;
        drag.startY = drag.lastY = event.clientY;
        drag.lastTime = event.timeStamp;
        drag.speed = 0;
        drag.distance = 0;
        ui.panel.classList.add("is-dragging");
        try {
            ui.panel.setPointerCapture(event.pointerId);
        } catch (error) {
            // The browser can refuse (the finger already left): the drag still works
        }
    });

    ui.panel.addEventListener("pointermove", function (event) {
        if (event.pointerId !== drag.id) return;
        const time = Math.max(1, event.timeStamp - drag.lastTime);
        drag.speed = (event.clientY - drag.lastY) / time;            // pixels per millisecond
        drag.lastY = event.clientY;
        drag.lastTime = event.timeStamp;
        drag.distance = Math.max(0, event.clientY - drag.startY);  // only downwards
        ui.panel.style.transform = "translateY(" + drag.distance + "px)";
    });

    function endDrag(event) {
        if (event.pointerId !== drag.id) return;
        drag.id = null;
        ui.panel.classList.remove("is-dragging");
        ui.panel.style.transform = "";
        // Far enough, or a quick flick down: close. Otherwise it slides back.
        const flick = drag.distance > FLICK_PX && drag.speed > FLICK_SPEED;
        if (event.type === "pointerup" && (drag.distance > SHEET_CLOSE_PX || flick)) closePanel(true);
    }

    ui.panel.addEventListener("pointerup", endDrag);
    ui.panel.addEventListener("pointercancel", endDrag);

    /* =========================================================
       10. SAVING THE CHAT FOR THIS TAB (sessionStorage)
       It survives a page reload, but is forgotten when the tab closes.
       ========================================================= */

    function save() {
        A.storage.session.set(SESSION_KEY, {
            v: 1,
            messages: chat.messages,
            bags: chat.bags,
            last: chat.last,
            hinted: chat.hinted
        });
    }

    // Does a saved message look like one this file wrote? (Its time must be a
    // real date too: a broken one would stop the whole chat from starting.)
    function isSavedMessage(message) {
        if (!message || typeof message.id !== "number" || typeof message.time !== "number") return false;
        if (isNaN(new Date(message.time).getTime())) return false;
        return message.from === "user" ? typeof message.text === "string" : typeof message.reply === "string";
    }

    function load() {
        const saved = A.storage.session.get(SESSION_KEY, null);
        if (!saved || saved.v !== 1 || !Array.isArray(saved.messages)) return;

        chat.messages = saved.messages.filter(isSavedMessage).slice(-MAX_MESSAGES);
        chat.bags = saved.bags && typeof saved.bags === "object" ? saved.bags : {};
        chat.last = saved.last && typeof saved.last === "object" ? saved.last : {};
        chat.hinted = Boolean(saved.hinted);
        chat.nextId = chat.messages.reduce(function (max, message) { return Math.max(max, message.id); }, 0) + 1;
    }

    /* =========================================================
       11. LITTLE EXTRAS: THE "ASK ME" HINT, THE RESTING ORB, EYES THAT FOLLOW YOU
       ========================================================= */

    // ----- The "Ask me" hint -----
    // Shown on the first few visits (until it is closed or the chat is opened).
    // It hides by itself after a few seconds, and while the footer is on
    // screen, so it never sits on top of the page's links for long.
    let footerVisible = false;

    // ----- The orb rests when nobody needs it -----
    // Its four loops (float, breathe, spin, blink) keep the computer busy at
    // every scroll position, so they only run while the orb is "awake"
    // (.is-awake): for a while after the page loads, while the mouse is over
    // it, and for a few seconds when it gets the keyboard focus or shows the
    // hint. The rest of the time they wait, still, where they are
    // (css/assistant.css, section 1).
    const orb = { timer: 0, hovered: false };

    function wakeOrb(seconds) {
        clearTimeout(orb.timer);
        ui.root.classList.add("is-awake");
        orb.timer = setTimeout(function () {
            if (!orb.hovered) ui.root.classList.remove("is-awake");
        }, seconds * 1000);
    }

    ui.launcher.addEventListener("pointerenter", function () {
        orb.hovered = true;
        wakeOrb(ORB_WAKE_SECONDS);
    });
    ui.launcher.addEventListener("pointerleave", function () {
        orb.hovered = false;
        wakeOrb(ORB_WAKE_SECONDS);
    });
    ui.launcher.addEventListener("focus", function () { wakeOrb(ORB_WAKE_SECONDS); });

    function showTipLater() {
        if (A.storage.get("assistant.tipDismissed", false)) return;
        const visits = Number(A.storage.get("assistant.tipVisits", 0)) || 0;
        if (visits >= TIP_VISITS) return;
        state.tipTimer = setTimeout(function () {
            // Not now (and this visit does not count): the chat is open, the footer
            // is on screen, or a window such as the lesson reader covers the page
            if (state.open || footerVisible || A.overlays.hasModal() || ui.root.closest("[inert]")) return;
            A.storage.set("assistant.tipVisits", visits + 1);
            ui.tip.hidden = false;
            ui.root.classList.add("has-tip");
            A.dom.replay(ui.tip, "is-visible");
            wakeOrb(TIP_SECONDS);
            // Hide again later, without remembering it (it may come back next visit)
            state.tipTimer = setTimeout(function () { dismissTip(false); }, TIP_SECONDS * 1000);
        }, TIP_DELAY_MS);
    }

    const footer = document.querySelector(".footer, footer");
    if (footer) {
        A.whenVisible(footer, function (visible) {
            footerVisible = visible;
            if (visible && !ui.tip.hidden) dismissTip(false);
        });
    }

    function dismissTip(remember) {
        clearTimeout(state.tipTimer);
        if (remember) A.storage.set("assistant.tipDismissed", true);
        ui.root.classList.remove("has-tip");
        if (ui.tip.hidden) return;
        const tipHadFocus = ui.tip.contains(document.activeElement);
        ui.tip.classList.remove("is-visible");
        ui.tip.hidden = true;
        if (tipHadFocus && !state.open) ui.launcher.focus({ preventScroll: true });
    }

    ui.tipText.addEventListener("click", openPanel);
    ui.tipClose.addEventListener("click", function () { dismissTip(true); });

    // ----- The orb's eyes follow the mouse (only with a mouse, and with motion on) -----
    const finePointer = A.media(A.queries.finePointer);
    const look = { x: 0, y: 0, frame: 0, center: null };

    // The button's centre is measured once and again only after a resize
    A.onResize(function () { look.center = null; });

    function updateLook() {
        look.frame = 0;
        if (!look.center) {
            const rect = ui.launcher.getBoundingClientRect();
            look.center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
        const dx = look.x - look.center.x;
        const dy = look.y - look.center.y;
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, distance / EYES_REACH_PX) * EYES_MOVE_PX;
        ui.launcher.style.setProperty("--look-x", (dx / distance * reach).toFixed(2) + "px");
        ui.launcher.style.setProperty("--look-y", (dy / distance * reach).toFixed(2) + "px");
    }

    document.addEventListener("pointermove", function (event) {
        if (state.open || !finePointer.matches || !A.motion.ok() || document.hidden) return;
        look.x = event.clientX;
        look.y = event.clientY;
        if (!look.frame) look.frame = requestAnimationFrame(updateLook);
    }, { passive: true });

    /* =========================================================
       12. LANGUAGE AND START-UP
       ========================================================= */

    // The window's labels are translated by core (data-i18n).
    // Here we redraw the answers and the typing status.
    A.onLanguageChange(function () {
        retranslateMessages();
        ui.statusText.textContent = t(state.busy ? "assistant.statusTyping" : "assistant.status");
        // "Define " the bot typed for you (and you didn't change) -> "Что такое "
        if (state.prefill && ui.input.value === state.prefill) {
            ui.input.value = t("assistant.prefillDefine");
            state.prefill = ui.input.value;
        }
    });

    // Start: bring back this tab's chat, then wake the orb and plan the hint
    load();
    if (chat.messages.length) renderAll();
    updateSendButton();
    wakeOrb(ORB_START_SECONDS);
    showTipLater();

    /* =========================================================
       13. CTRL+K COMMANDS AND THE PUBLIC API
       ========================================================= */

    A.registerCommand({
        id: "assistant-open",
        group: "assistant.cmdGroup",
        icon: "🤖",
        title: function () { return t("assistant.cmdOpen"); },
        keywords: "assistant chat bot compass help ask question talk помощник чат бот помощь спросить вопрос поговорить",
        run: function () { openPanel(); }
    });

    A.registerCommand({
        id: "assistant-fact",
        group: "assistant.cmdGroup",
        icon: "💡",
        title: function () { return t("assistant.cmdFact"); },
        keywords: "fun fact did you know trivia interesting интересный факт знаешь ли ты",
        run: function () {
            openPanel();
            sendIntent("fact", t("assistant.chip.fact"));
        }
    });

    A.registerCommand({
        id: "assistant-joke",
        group: "assistant.cmdGroup",
        icon: "😄",
        title: function () { return t("assistant.cmdJoke"); },
        keywords: "joke funny laugh humor шутка анекдот смешно юмор",
        run: function () {
            openPanel();
            sendIntent("joke", t("assistant.chip.joke"));
        }
    });

    // Other features (like the Ctrl+K palette) can talk to Compass Bot:
    // AICompass.assistant.open(), .close(), .toggle(), .ask("what is AI?") and .isOpen
    A.feature("assistant", {
        open: openPanel,
        close: function () { closePanel(true); },
        toggle: togglePanel,
        ask: function (text) {
            openPanel();
            sendText(text);
        },
        get isOpen() { return state.open; }
    });
})();
