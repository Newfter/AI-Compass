# AI Compass

AI Compass is a free website that teaches teenagers about artificial intelligence, in English and in Russian. It has short lessons with mini-labs, two live AI experiments, a quiz, a glossary, a history timeline, a chat helper (Compass Bot) and a search window for the whole site (Ctrl+K).

It is plain HTML, CSS and JavaScript: no libraries, no frameworks, no build step. The files in this folder are exactly what visitors get.

This guide is for the people who look after the site. It explains how the code is organised and how to make the most common changes.

- [Run it on your computer](#run-it-on-your-computer)
- [The folder map](#the-folder-map)
- [How the pieces talk](#how-the-pieces-talk)
- [Recipes](#recipes): [change a text](#change-a-text-in-both-languages), [add a lesson](#add-a-lesson), [add a quiz question](#add-a-quiz-question), [add a glossary term](#add-a-glossary-term), [add a timeline milestone](#add-a-timeline-milestone), [add a fact or a joke to Compass Bot](#add-a-fun-fact-or-a-joke-to-compass-bot), [add a Ctrl+K command](#add-a-command-to-the-ctrlk-palette)
- [House rules](#house-rules)
- [Before you merge: a test checklist](#before-you-merge-a-test-checklist)
- [Credits](#credits)


## Run it on your computer

You need Python 3. To check that you have it, type `python3 --version` in a terminal (on Windows: `py --version`); if it prints no version, install Python from python.org. Then open a terminal in this folder and start a small web server:

```sh
python3 -m http.server 8000
```

On Windows, type `py -m http.server 8000` instead. Then open **http://localhost:8000** in your browser. Stop the server with Ctrl+C.

After you change a file, reload the page. If you still see the old version, do a hard reload (Ctrl+F5, or Cmd+Shift+R on a Mac).

**Why not just double-click `index.html`?** Then the browser opens it as a file (an address starting with `file://`). It mostly works, but it is not how visitors see the site:
- browsers have their own, stricter rules for pages opened from files, and these rules are different in every browser;
- saved progress and settings belong to the address, so what you save at `file://...` is not there at `http://localhost:8000` (and the other way round).

A local server shows you the site the way GitHub Pages serves it.


## The folder map

| File | What it is for |
| --- | --- |
| `index.html` | The page: the menu, the first screen (the "hero"), one `<section>` for each part of the site, and the list of styles and scripts. Each part has an empty `<div data-feature="...">` that its script fills. A small script in the `<head>` applies the saved theme and calm mode before the page is drawn. |
| `style.css` | What the whole page shares: the design tokens (colours, fonts and sizes of both themes), buttons, cards, the menu, the hero, the section frames, toasts, the phone layout and calm mode. |
| `css/components.css` | Small visual parts that several features share, each written once as a `ui-...` class: corner brackets, the light that scans along a card, sliders, on/off switches, filter chips, answer options and progress rings. |
| `css/effects.css` | The visual effects and the neural network background. |
| `css/lessons.css` | The lessons: progress panel, the tracks and their cards, the lesson reader, the first six mini-labs and the certificates. |
| `css/lessons-labs.css` | The mini-labs that have their own file in `js/lessons/`. It loads with the first of them, not with the page. |
| `css/lab.css` | The AI Lab. |
| `css/quiz.css` | The quiz. |
| `css/glossary.css` | The glossary. |
| `css/timeline.css` | The history timeline. |
| `css/assistant.css` | Compass Bot. |
| `css/palette.css` | The Ctrl+K command palette. |
| `js/core.js` | The toolkit that every other script uses (`window.AICompass`, called `A`): saved settings, texts and languages, the theme, calm mode, pop-up windows, scrolling to sections, Ctrl+K commands and toasts. It is loaded first. |
| `js/effects.js` | Small touches: the scroll progress bar, cards that rise in, numbers that count up, typewriter words, tilting cards, the mouse spotlight, magnetic buttons, ripples, the section mini-map and confetti. |
| `js/neural-bg.js` | The animated "brain" drawn behind the page. |
| `js/lessons.js` | The lessons: the list of lessons and tracks, progress panel, lesson cards, the lesson reader, the first six mini-labs, reading aloud and the certificates. |
| `js/lessons/` | One file per newer mini-lab (`pixels.js`, `slots.js`, `temperature.js`, `noise.js`, `fairness.js`, `prompt.js`). `js/lessons.js` loads a file the first time its lesson opens. |
| `js/lab.js` | The AI Lab: "Teach the machine" (a tiny neural network) and the "Next-word predictor" (a tiny language model). |
| `js/quiz.js` | The AI Challenge: the six modes (Classic, Timed, Daily challenge, Myth or fact, Lesson review, My mistakes), points, streaks, ranks, the saved results and the quiz's API. |
| `js/glossary.js` | The glossary: search with "did you mean?", categories, the A–Z strip, term cards and a random term. |
| `js/timeline.js` | "A Short History of AI": the era chips and the line that fills as you scroll. |
| `js/assistant.js` | Compass Bot, the chat helper in the corner. |
| `js/palette.js` | The Ctrl+K search window. |
| `js/content/page.js` | The texts of the menu, the hero, About and the footer. |
| `js/content/effects.js` | The texts of the visual effects. |
| `js/content/neural-bg.js` | The texts of the neural network background. |
| `js/content/lessons.js` | The texts of the tracks, the reader's buttons, the certificates and lessons 1-6 (with their mini-labs). |
| `js/content/lessons-deep.js` | The texts of the "Deep dive" lessons (7 and on) and of their mini-labs. |
| `js/content/lab.js` | The AI Lab texts, and the sentences the next-word predictor learns from. |
| `js/content/quiz.js` | The quiz's buttons and messages, the list of questions with their tags, the "Myth or fact" statements and the ranks. |
| `js/content/quiz-bank.js` | The texts of the 60 questions and 20 "Myth or fact" statements, one block per lesson. Not in `index.html`: the quiz loads it when it is needed. |
| `js/content/glossary.js` | The glossary texts, the categories and every term. |
| `js/content/timeline.js` | The timeline texts, the eras and every milestone. |
| `js/content/assistant.js` | Compass Bot's texts, fun facts and jokes, and its "brain" (the words it listens for and its answers). |
| `js/content/palette.js` | The texts of the Ctrl+K palette. |
| `README.md` | This guide. |


## How the pieces talk

```
index.html
 ├─ style.css, css/*.css      how everything looks
 ├─ js/core.js                the toolkit "A" (loaded first)
 ├─ js/content/*.js           every text, in English and Russian, and the lists
 │                            (lessons, questions, terms, milestones...)
 └─ js/lessons.js, ...        the features: each one fills its <div data-feature="...">
```

All scripts are loaded with `defer`, so they run in the order `index.html` lists them, once the page's HTML has been read.

**The toolkit `A`.** `js/core.js` builds `window.AICompass`. Every other file starts with `const A = window.AICompass;` and uses it for the things every part needs:

```js
A.t("quiz.title")                                  // "The AI Challenge" (or the Russian text)
A.plural("lessons.hud.count", 3, { total: 7 })     // "3 of 7 lessons completed"
A.storage.set("lessons.textSize", "l")             // saved in the browser as "aic:lessons.textSize"
A.navigate("glossary")                             // scrolls to the glossary
A.toast("Light mode on", "☀️")                     // a small pop-up message
if (A.motion.ok()) { /* animate */ }               // false in calm mode and with "reduce motion"
```

The full list is at the top of `js/core.js` ("THE TOOLKIT AT A GLANCE"). If you need something small (a random number, a debounce, a colour), look there before you write your own.

**Features live in mounts.** `index.html` has an empty `<div data-feature="quiz"></div>` in the quiz section. `js/quiz.js` finds it and builds the quiz inside it:

```js
const A = window.AICompass;
const mount = document.querySelector('[data-feature="quiz"]');
const data = A && A.content.get("quiz");      // the questions and ranks (js/content/quiz.js)
if (!A || !mount || !data) return;
```

**Texts live in `js/content/`.** No words are written in the feature scripts. Every text has a key and an English and a Russian version:

```js
window.AICompass.addTranslations({
    en: { "quiz.title": "The AI Challenge" },
    ru: { "quiz.title": "ИИ-испытание" }
});
```

In `index.html`, an element with `data-i18n` gets its text from the same place, and it changes by itself when the language changes. The English text written in the HTML is only what shows before the scripts run:

```html
<h2 data-i18n="quiz.title">The AI Challenge</h2>
```

The lists sit in the same files, as data: `A.content.set("quiz", { questions: [...], myths: [...], ranks: [...] })` in `js/content/quiz.js`, read with `A.content.get("quiz")` in `js/quiz.js`. (The list of lessons is the exception: it is at the top of `js/lessons.js`, because each lesson is tied to the code of its mini-lab.)

**Numbers come from the data.** Nothing says "6 lessons" or "12 questions" by hand. The scripts count the data and share the number: `A.setTextValue("quizQuestionCount", QUESTIONS.length)`. Texts then have a form for each kind of number, and the toolkit picks the right one:

```js
"quiz.subtitle.one": "{n} question. Take the daily challenge, race the clock or bust a few myths.",
"quiz.subtitle.many": "{n} questions. Take the daily challenge, race the clock or bust a few myths."
```

A text for one exact number can be added too: `"quiz.subtitle.60"` would be used only for exactly 60 (to write "Sixty questions").

Russian has three forms: `.one` (1, 21, 31...), `.few` (2–4, 22–24...) and `.many` (5–20, 25...).

**Features talk to each other through their API.** The last section of each feature file shares a few functions with `A.feature(...)`: `A.lessons.open(3)`, `A.glossary.show("bias")`, `A.quiz.start()`, `A.lab.open("predictor")`, `A.assistant.open()`, `A.palette.open()`. For example, the timeline's "In the glossary" buttons call `A.glossary.show(id, { focus: true })`. The quiz shares the most: `A.quiz.start(mode, options)`, `A.quiz.question(id)`, `A.quiz.bank()`, `A.quiz.stats()` and `A.quiz.ready()`, described at the end of `js/quiz.js`.

**Pop-up windows** (the lesson reader, Compass Bot, the Ctrl+K palette, the phone menu) register with `A.overlays`. Core then treats them all the same way: a window that covers the page locks the page behind it, Esc closes the window on top, and the focus goes back to where it was.

**Design tokens.** The colours, fonts, sizes, shadows and layers are CSS variables in section 1 of `style.css`, with one set for the dark theme and one for the light theme (`data-theme="light"` on `<html>`). Use them instead of writing a colour again: `color: var(--text-muted);`, `background: rgba(var(--accent-rgb), 0.12);`.

**Shared components.** A visual part that several features use (corner brackets, sliders, on/off switches, chips...) is written once in `css/components.css`, as a `ui-...` class. A feature adds that class next to its own one in its HTML template, for example `<input class="lsn-range ui-range" type="range">`, and changes only the custom properties listed at the top of that file.

**Screen sizes.** Every CSS file uses the same few widths (breakpoints), listed at the top of `style.css`. The three main ones are also in `js/core.js` as `A.breakpoints`: change both together.


## Progress events

Every part of the site reports what the learner just did with `A.track(type, detail)`. Core sends it as the `"activity"` event with `{ type, detail, time }`, so any feature can listen:

```js
A.on("activity", function (activity) {
    if (activity.type === "lesson.complete") { /* activity.detail.n is the lesson number */ }
});
```

Nothing leaves the browser: these events are only for features on the same page (for example "My Compass", which will count them).

| Part | Event | Detail | When |
| --- | --- | --- | --- |
| Lessons | `lesson.open` | `{ n }` | every time a lesson is shown |
| | `lesson.complete` | `{ n }` | the first time a lesson is marked as done |
| | `lesson.check` | `{ n, correct }` | a "check yourself" question is answered |
| | `track.complete` | `{ track }` | the last lesson of a track is done (`"basics"` or `"deep"`) |
| | `certificate.make` | `{ track }` | a certificate is downloaded (`"basics"`, `"deep"` or `"all"`: the full course) |
| Quiz | `quiz.answer` | `{ id, correct, mode }` | a question is answered (`id` is a question, `"q7"`, or a "Myth or fact" statement, `"m3"`) |
| | `quiz.finish` | `{ mode, score, total, points, timed, seconds, answerSeconds, lesson }` | a game ends. `mode`: `"classic"`, `"timed"`, `"daily"`, `"myth"`, `"lesson"` or `"mistakes"`; `score`: right answers; `seconds`: from the first question to the end; `answerSeconds`: only the time spent answering; `lesson`: only in Lesson review |
| | `daily.complete` | `{ date, score, total, streak }` | the daily challenge is finished (once a day; `date` is `"2026-01-15"`, `streak` the days in a row) |
| AI Lab | `lab.use` | `{ exp }` | a tab is chosen, training starts, or auto-write starts |
| | `lab.milestone` | `{ exp, kind, ... }` | the classifier has learned (`kind: "learned"`, `epochs`) or the predictor was taught (`kind: "taught"`, `sentences`) |
| Glossary | `glossary.explore` | `{ id }` | a term is opened |
| Timeline | `timeline.era` | `{ era }` | the timeline's line reaches an era for the first time |
| Compass Bot | `bot.ask` | `{ typed: true }` or `{ intent }` | a typed question, or a chip |
| Ctrl+K | `palette.run` | `{ id }` | a command is run |
| Core | `language.change` | `{ lang }` | the language changes |
| | `theme.change` | `{ theme }` | the theme changes |
| | `settings.change` | `{ name, value }` | a setting changes (today: `name: "calm"`) |

**Adding an event:** call `A.track("part.something", { ... })` where it happens, list it in your file's header, and add a row here. Listeners must not count the same thing twice: the same event can come many times (for example `lesson.open`).

**Loading files on demand:** `A.loadScript(src)` and `A.loadStyle(href)` load a file the first time it is needed and return a Promise; asking again for the same file reuses the first load, and a failed load can be tried again.


## Recipes

Each recipe was tried on a copy of the site. After any change: reload, switch the language with the RU / EN button, and look at the browser console (F12, then Console) for red errors.

### Change a text (in both languages)

**File:** the content file of that part of the site (`js/content/page.js` for the menu, hero, About and footer). Search for the words you want to change; every text appears once in the English part and once in the Russian part.

Example: the first button on the page. In `js/content/page.js`, English part:

```js
        "hero.ctaLessons": "Start learning",
```

and in the Russian part:

```js
        "hero.ctaLessons": "Начать обучение",
```

Change both, for example to `"Start now"` and `"Начни прямо сейчас"`. If the text is also written in `index.html` (search for `data-i18n="hero.ctaLessons"`), change the English text there too, so the page shows the same words before the scripts run:

```html
<a href="#lessons" class="btn btn-primary" data-i18n="hero.ctaLessons">Start now</a>
```

Good to know:
- Words in curly brackets, like `{n}` or `{term}`, are filled in by the code. Keep them in both languages.
- Some texts contain small HTML tags like `<strong>` or `<em>`. Keep them.
- Russian texts speak to the reader with "ты": "Начни", "Проверь себя".

**Check:** the button shows the new words in English and in Russian.

### Add a lesson

The lessons come in tracks: "Basics" (lessons 1-6) and "Deep dive" (7 and on). A lesson needs one entry in `js/lessons.js`, its texts in `js/content/lessons-deep.js` and a mini-lab. Add new lessons at the end, in the last track: saved progress remembers lessons by their number, so don't change the order of the ones that exist.

**1. The entry.** In `js/lessons.js`, section 2, add it at the end of `LESSONS`:

```js
        {
            number: 13, track: "deep", icon: "🗨️", level: "beginner", minutes: 3, rgb: "--accent-2-rgb",
            sections: 2, notes: { 2: "tip" }, lab: "words", correct: 1,
            tryIt: "lab", tryIcon: "🔮",
            keywords: "prompt prompting ask chatbot questions промпт запрос чат-бот вопросы"
        }
```

- `number`: the next number. `track`: the track it belongs to (`"basics"` or `"deep"`, the ids in `TRACKS` just above). `icon`: the emoji on the card. `minutes`: the reading time on the card.
- `level`: `"beginner"` or `"intermediate"`.
- `rgb`: the lesson's colour: `"--accent-rgb"` (violet), `"--accent-2-rgb"` (cyan) or `"--accent-3-rgb"` (pink).
- `sections`: how many parts the text has (`s1`, `s2`, ...).
- `notes`: which parts have a small box, and its kind: `"fact"`, `"example"` or `"tip"`.
- `lab`: which mini-lab it shows: one of the six in `js/lessons.js` (`"sort"`, `"fit"`, `"neuron"`, `"words"`, `"day"`, `"dilemmas"`), or the name of a mini-lab with its own file (step 3).
- `correct`: which answer to "Check yourself" is right: 0, 1 or 2 (for `a1`, `a2`, `a3`).
- `tryIt`: where the "Try it" button goes: a section (`"timeline"`, `"glossary"`, `"quiz"`, `"lab"`) or an experiment of the AI Lab (`"classifier"`, `"predictor"`, ...; while the AI Lab doesn't have that experiment yet, the button opens the AI Lab). `tryIcon`: its emoji.
- `keywords`: extra words (both languages) that find the lesson in the Ctrl+K search.

**2. The texts.** In `js/content/lessons-deep.js`, copy the block of lesson 7 to the end of the file and change `l7` to `l13` and `w7` to `w13`. Every key starts with `lessons.l13.` (the lesson) or `lessons.w13.` (its mini-lab). Each part needs `.h` (title) and `.p` (text), each box needs `.note`, and there are always three key ideas, a tip and three answers:

```js
// Lesson 13 — Talking to AI (an example made up for this guide)
window.AICompass.addTranslations({
    en: {
        "lessons.l13.title": "Talking to AI",
        "lessons.l13.desc": "How to ask a chatbot good questions — and check its answers.",
        "lessons.l13.s1.h": "Say what you need",
        "lessons.l13.s1.p": "A chatbot only knows what you type. Say what you need, who it is for and how long the answer should be: <em>“Explain photosynthesis to a 14-year-old in five sentences”</em> works much better than <em>“photosynthesis”</em>.",
        "lessons.l13.s2.h": "Check before you trust",
        "lessons.l13.s2.p": "Chatbots can sound sure and still be wrong. A <strong data-term='hallucination'>hallucination</strong> looks just like a true answer. Compare important answers with a textbook or a trusted website, and never type in passwords or private details.",
        "lessons.l13.s2.note": "If an answer matters (homework, health, money), check it in a second place.",
        "lessons.l13.key1": "A clear, detailed question gets a more useful answer.",
        "lessons.l13.key2": "Chatbots can be confidently wrong: check what matters.",
        "lessons.l13.key3": "Never share passwords or private details with a chatbot.",
        "lessons.l13.tip": "See how a language model picks its next word, live in the AI Lab.",
        "lessons.l13.tipBtn": "Open the AI Lab",
        "lessons.l13.q": "Which question will probably get the most useful answer?",
        "lessons.l13.a1": "“Volcanoes”",
        "lessons.l13.a2": "“Explain in five sentences, for a 14-year-old, why volcanoes erupt”",
        "lessons.l13.a3": "“Tell me everything you know”",
        "lessons.l13.explain": "The second question says what you need, who it is for and how long the answer should be. The first is too short to know what you want, and the third is far too wide.",
        "lessons.w13.title": "Be the language model",
        "lessons.w13.intro": "A chatbot writes one word at a time. Pick the next word yourself and see how the “temperature” changes the choice."
    },
    ru: {
        // the same keys, in Russian (see below)
    }
});
```

`<strong data-term='hallucination'>` is a glossary word: the reader turns it into a button that shows its meaning (when the glossary has that id; until then it stays bold text).

<details>
<summary>The Russian part of this example</summary>

```js
    ru: {
        "lessons.l13.title": "Как говорить с ИИ",
        "lessons.l13.desc": "Как задавать чат-боту хорошие вопросы — и проверять его ответы.",
        "lessons.l13.s1.h": "Скажи, что тебе нужно",
        "lessons.l13.s1.p": "Чат-бот знает только то, что ты напишешь. Скажи, что тебе нужно, для кого и какой длины должен быть ответ: <em>«Объясни фотосинтез четырнадцатилетнему в пяти предложениях»</em> работает гораздо лучше, чем просто <em>«фотосинтез»</em>.",
        "lessons.l13.s2.h": "Проверяй, прежде чем верить",
        "lessons.l13.s2.p": "Чат-бот может говорить уверенно и всё равно ошибаться. <strong data-term='hallucination'>Галлюцинация</strong> выглядит точно так же, как верный ответ. Сверяй важные ответы с учебником или надёжным сайтом и никогда не вводи пароли и личные данные.",
        "lessons.l13.s2.note": "Если ответ важен (домашка, здоровье, деньги), проверь его ещё в одном месте.",
        "lessons.l13.key1": "На понятный подробный вопрос ты получишь более полезный ответ.",
        "lessons.l13.key2": "Чат-бот может уверенно ошибаться: проверяй то, что важно.",
        "lessons.l13.key3": "Никогда не сообщай чат-боту пароли и личные данные.",
        "lessons.l13.tip": "Посмотри в ИИ-лаборатории, как языковая модель выбирает следующее слово.",
        "lessons.l13.tipBtn": "Открыть ИИ-лабораторию",
        "lessons.l13.q": "На какой вопрос ты, скорее всего, получишь самый полезный ответ?",
        "lessons.l13.a1": "«Вулканы»",
        "lessons.l13.a2": "«Объясни в пяти предложениях для четырнадцатилетнего, почему извергаются вулканы»",
        "lessons.l13.a3": "«Расскажи всё, что знаешь»",
        "lessons.l13.explain": "Во втором вопросе сказано, что нужно, для кого и какой длины должен быть ответ. Первый слишком короткий, чтобы понять, чего ты хочешь, а третий слишком широкий.",
        "lessons.w13.title": "Побудь языковой моделью",
        "lessons.w13.intro": "Чат-бот пишет по одному слову. Выбери следующее слово сам и посмотри, как «температура» меняет выбор."
    }
```

</details>

**3. A new mini-lab (only if none of the others fits).** Give it its own file, `js/lessons/<name>.js`, and put `lab: "<name>"` in the entry. `js/lessons.js` loads the file (and `css/lessons-labs.css`) the first time the lesson opens, shows "Loading…" meanwhile, and a "Try again" button if it can't be loaded:

```js
(function () {
    "use strict";
    const A = window.AICompass;
    if (!A || !A.lessons) return;

    A.lessons.defineLab("<name>", {
        // Draws the lab inside host (an empty <div>). Runs when the lesson opens, and again after a language change.
        build: function (host, api) {
            host.innerHTML = '<button type="button" class="btn btn-primary btn-small" data-fid="w13-go">' + api.text("go") + "</button>";
            host.querySelector("button").addEventListener("click", function () {
                api.state.clicks = (api.state.clicks || 0) + 1;   // api.state survives closing the reader
                api.announce(api.plural("clicked", api.state.clicks));   // "lessons.w13.clicked.one" / ".many"
            });
        },
        destroy: function (host) { /* optional: stop timers */ },
        theme: function (host) { /* optional: the theme changed (redraw a <canvas>) */ }
    });
})();
```

The whole contract (what `api` has, and the rules: listeners only inside `host`, a `data-fid` on every button, `event.preventDefault()` for arrow keys, no `data-action`, `data-option` or `data-goto` attributes because the reader's own buttons use them, numbers formatted with `A.format` before they go into a text, no `{placeholders}` in the intro) is at the top of `js/lessons.js`, in "A MINI-LAB IN ITS OWN FILE". The mini-labs in `js/lessons/` are complete examples (`prompt.js` is the shortest); their styles go in `css/lessons-labs.css`, one section and one class prefix per lab.

That's all: the track's cards, the lesson map, the counts ("0 of 7 done"), the hero number, the section subtitle, the certificates, the Ctrl+K command and the site search follow the list by themselves. (Numbers in texts come from the data: the subtitle says "13 short lessons"; to spell a number out, add an exact key such as `"lessons.subtitle.13"`, in both languages.)

**Check:** there are 13 cards (7 in "Deep dive") and the hero says 13; open the lesson (click its card, or go to `http://localhost:8000/#lesson-13`) and look at every part, the box, the glossary word, the mini-lab, the three key ideas and the three answers; pick the right answer (it says "Correct!" and the panel counts 1 more); try the "Try it" button; press Ctrl+K and type the lesson's title. Do it again in Russian, and once on a phone (the "Deep dive" cards fold away there until you open one).

### Add a quiz question

**Files:** the texts in `js/content/quiz-bank.js`, the entry in `js/content/quiz.js`.

**1. The texts.** In `js/content/quiz-bank.js`, find the block of the lesson (`// ----- Lesson 5: ...`) and add the texts at the end of both parts, English and Russian (with "ты"). Use the next free number: there are 60 questions, so the next one is `q61`. For a multiple-choice question, write four options and put the right one **first** (`o1`): the quiz shuffles the options in every game. The explanation says why the right answer is right, and why the tempting wrong one is wrong.

English part:

```js
        "quiz.q61.text": "What does a recommendation system do?",
        "quiz.q61.o1": "Suggests videos, songs or products from what you and similar people liked",
        "quiz.q61.o2": "Blocks every advert on a website",
        "quiz.q61.o3": "Makes your internet connection faster",
        "quiz.q61.o4": "Keeps your passwords safe",
        "quiz.q61.explain": "Recommendation systems learn from what you watch, play and buy, and from what similar people like, to guess what you will enjoy next.",
```

Russian part:

```js
        "quiz.q61.text": "Что делает рекомендательная система?",
        "quiz.q61.o1": "Советует видео, песни или товары по тому, что нравилось тебе и похожим людям",
        "quiz.q61.o2": "Блокирует всю рекламу на сайте",
        "quiz.q61.o3": "Ускоряет твой интернет",
        "quiz.q61.o4": "Защищает твои пароли",
        "quiz.q61.explain": "Рекомендательные системы учатся на том, что ты смотришь, слушаешь и покупаешь, и на том, что нравится похожим людям, — и угадывают, что тебе понравится дальше.",
```

A true-or-false question has only `.text` and `.explain`, and the explanation starts with "True." or "False." ("Верно." / "Неверно.").

**2. The entry.** In `js/content/quiz.js`, add a line to `questions`, under the other questions of the lesson:

```js
        { key: "q61", lesson: 5, topic: "everyday", difficulty: 1, type: "choice", correct: 0 },
```

- `lesson`: the lesson that explains it (1-12), or `"timeline"` for the history. Its "Learn more" button opens that lesson.
- `topic`: one of the `quiz.topic.…` texts (`basics`, `ml`, `data`, `nn`, `genai`, `hallucination`, `bias`, `privacy`, `everyday`, `history`, `responsible`, `vision`, `rl`, `language`, `creative`, `safety`, `prompting`). Other features find questions by topic.
- `difficulty`: 1 easy, 2 medium, 3 hard. A Classic game takes 4 easy, 5 medium and 3 hard questions, from every pair of lessons; the daily challenge 2 easy, 2 medium and 1 hard.
- `type`: `"choice"` (four options, `correct: 0`) or `"truefalse"` (`correct: 0` means "True", `1` means "False").

Good questions have one clearly right answer, wrong answers that sound possible (no "all of the above"), options of about the same length, and nothing that could change next year. Don't change the key or the meaning of a question that exists: "My mistakes" remembers questions by their key.

The `ranks` at the bottom are shares of right answers (`0.65` = 65 %), so they work for any number of questions.

**A "Myth or fact" statement** works the same way: its texts go in the last block of `js/content/quiz-bank.js` (`"quiz.m21.text"`, and a one-sentence `"quiz.m21.explain"` without "True" or "False"), and its entry in `myths`: `{ key: "m21", lesson: 6, fact: false }` (`fact: false` for a myth, `true` for a fact). Keep about as many myths as facts.

**Check:** the quiz subtitle and the hero say 61; open Lesson review, pick the lesson, and play it to the end: the new question shows its four options and its explanation. Do it again in Russian. Answer the new question wrong once: "My mistakes" then offers it for review.

### Add a glossary term

**File:** `js/content/glossary.js`, at the bottom. Put the term in the block of its category (`basics`, `learning`, `generative` or `ethics`); the glossary sorts the cards A–Z by itself, in each language.

```js
        {
            id: "synthetic-data", cat: "learning", icon: "🧪", related: ["data", "dataset", "training", "privacy"],
            en: {
                name: "Synthetic data",
                aliases: ["generated data"],
                def: "Data that a computer program makes up instead of collecting it from the real world. It is used to train AI when real data is rare, expensive or private.",
                ex: "A self-driving car company can create millions of computer-made street scenes, even rare dangers like a deer on the road at night, to train its AI safely."
            },
            ru: {
                name: "Синтетические данные",
                aliases: ["сгенерированные данные"],
                def: "Данные, которые придумала компьютерная программа, а не собрали в реальном мире. На них обучают ИИ, когда настоящих данных мало, они дорогие или личные.",
                ex: "Компания, которая делает беспилотные автомобили, может создать миллионы компьютерных уличных сцен — даже редкие опасности вроде оленя на ночной дороге, — чтобы безопасно обучать свой ИИ."
            }
        },
```

- `id`: a short name in small letters with dashes. It is used in links (`#term-synthetic-data`) and in saved data, so don't change it later.
- `related`: the ids of other terms (they become buttons on the card).
- `aliases`: other ways to write the term; they are only used by the search.
- `def`: the definition. `ex`: an everyday example.

**Check:** the card is there and the count on the "Learning" chip went up by one; the search finds it by its name and by its alias; open it and click a related term; `http://localhost:8000/#term-synthetic-data` opens it; ask Compass Bot "what is synthetic data?". Do it again in Russian.

### Add a timeline milestone

**File:** `js/content/timeline.js`.

**1. The texts**, in both parts (`.year`, `.title`, `.text` and `.why`). Use the next free number in the key:

```js
        "timeline.e16.year": "1986",
        "timeline.e16.title": "Neural networks learn from their mistakes",
        "timeline.e16.text": "David Rumelhart, Geoffrey Hinton and Ronald Williams showed how a neural network with several layers can learn: after each wrong answer, a method called backpropagation adjusts every connection a little. The idea was older, but their paper made it famous.",
        "timeline.e16.why": "Backpropagation is still how almost every neural network is trained today.",
```

```js
        "timeline.e16.year": "1986",
        "timeline.e16.title": "Нейросети учатся на своих ошибках",
        "timeline.e16.text": "Дэвид Румельхарт, Джеффри Хинтон и Рональд Уильямс показали, как учится нейросеть из нескольких слоёв: после каждого неверного ответа метод обратного распространения ошибки немного подправляет каждую связь. Сама идея появилась раньше, но знаменитой её сделала их статья.",
        "timeline.e16.why": "Почти все нейросети и сегодня обучаются методом обратного распространения ошибки.",
```

**2. The entry.** At the bottom, in `events`, add a line **where it belongs in time**: the order of the list is the order on the page (the number in the key doesn't matter). This one goes between the "AI winters" (`e5`) and Deep Blue (`e6`):

```js
        { key: "e5", era: "ups", icon: "❄️", datetime: "", terms: [] },
        { key: "e16", era: "ups", icon: "🔁", datetime: "1986", terms: ["neural-network", "training"] },
        { key: "e6", era: "ups", icon: "♟️", datetime: "1997", terms: ["algorithm"] },
```

- `era`: `"early"`, `"ups"`, `"deep"` or `"gen"`.
- `datetime`: the year, or `""` when the milestone is not one year (like "1970s–80s").
- `terms`: glossary ids; each becomes an "In the glossary" button.

**Check:** the milestone sits between 1970s–80s and 1997; the "Ups & downs" chip shows it; its glossary buttons open the right terms. Do it again in Russian.

### Add a fun fact or a joke to Compass Bot

**File:** `js/content/assistant.js`. The facts and jokes are numbered, and the bot counts them by itself. Add the next number after `"assistant.fact13"`, once in the English part and once in the Russian part.

```js
        "assistant.fact14": "The word <strong>“algorithm”</strong> comes from the name of al-Khwarizmi, a Persian mathematician who worked in Baghdad about 1,200 years ago.",
```

```js
        "assistant.fact14": "Слово <strong>«алгоритм»</strong> происходит от имени аль-Хорезми — персидского математика, который работал в Багдаде около 1200 лет назад.",
```

A joke works the same way, after `"assistant.joke5"`:

```js
        "assistant.joke6": "Why did the robot go on holiday? It needed to <strong>recharge its batteries</strong> 🔋",
```

```js
        "assistant.joke6": "Зачем робот поехал в отпуск? Ему нужно было <strong>подзарядить батарейки</strong> 🔋",
```

Don't skip a number: the bot stops counting at the first missing one. Only add facts you have checked.

**Check:** ask the bot "tell me a fun fact" (or press its "Fun fact" button) until the new one comes up. It shows every fact once, in a random order, before it repeats one. Do it again in Russian ("расскажи интересный факт").

### Add a command to the Ctrl+K palette

Each feature adds its own commands in its last section. A command has an `id` (unique), a `group` (the text key of its heading in the palette), an `icon`, a `title` (a function, so it follows the language), `keywords` for the search (both languages) and `run`.

Example: "Glossary: a random term". In `js/glossary.js`, section 17, after the loop that adds one command per term:

```js
    // Ctrl+K palette: a random term
    A.registerCommand({
        id: "glossary-random",
        group: "glossary.cmdGroup",
        icon: "🎲",
        title: function () { return t("glossary.cmdRandom"); },
        keywords: "glossary random term surprise словарь случайный термин",
        run: function () { show(randomTerm().id, { focus: true }); }
    });
```

and its text in `js/content/glossary.js`, next to `"glossary.cmdTitle"`, in both parts:

```js
        "glossary.cmdRandom": "Glossary: a random term"
```

```js
        "glossary.cmdRandom": "Словарь: случайный термин"
```

(Mind the commas: the line before the new one now needs a comma at its end.)

Running a command first closes the windows in the way (the palette itself, the lesson reader...). A quick action that should leave them open, like switching calm mode, says `keepOverlays: true`.

**Check:** press Ctrl+K, type "random" (in Russian: "случайный"), press Enter: a random term opens and gets the focus.


## House rules

These keep the code easy to read, as if one person wrote it all.

- **The same shape in every script.** A header comment says what the file does and lists its numbered sections. Then come, in this order: "Settings" (the numbers you may want to change, each with a short comment), "Small helpers" (only what `js/core.js` doesn't have), the feature itself, and at the end the Ctrl+K commands and the public API (`A.feature(...)`).
- **Comments** are plain English for a beginner: what a block does and why. No need to explain obvious lines.
- **Style:** 4 spaces to indent, double quotes, semicolons. Keep the style of the file you are in.
- **Every text in both languages**, in `js/content/`. Russian uses the informal "ты".
- **No hard-coded counts.** Never write "6 lessons" or "12 questions": count the data and use `{n}` and the plural forms (see [How the pieces talk](#how-the-pieces-talk)).
- **No numbers out of nowhere.** A time, a size or a limit goes in the Settings block with a name (`const RESET_CONFIRM_TIME = 4000;`). Colours and sizes in CSS use the design tokens, and screen widths use the breakpoints at the top of `style.css`.
- **Use the toolkit.** If `js/core.js` already does it (saving, plurals, pop-up windows, scrolling, random numbers...), use it instead of writing it again.
- **Saved data.** Use `A.storage` (it adds the `aic:` prefix). Don't rename a saved key: people would lose their progress. If you really must, move the value with `A.storage.migrate(oldKey, newKey)`.
- **Respect calm mode.** Before an animation, check `A.motion.ok()`.
- **No libraries, no build step, no `import` / `export`.** Every script is a plain `<script defer>` in `index.html`.


## Before you merge: a test checklist

Open the site on a local server and go through this list for the parts you changed:

- [ ] **Both languages.** Switch with the RU / EN button. Every new text changes, and no English is left on the Russian page.
- [ ] **Both themes.** Switch light / dark. Everything is readable; nothing disappears.
- [ ] **A phone.** In the browser's developer tools (F12), turn on the device toolbar (Ctrl+Shift+M) and pick a width of 360 px. Nothing sticks out to the side, and the menu works.
- [ ] **Keyboard only.** Put the mouse away. Tab reaches every button and you can see where the focus is; Enter and Space work; Esc closes the lesson reader, Compass Bot and the palette; Ctrl+K opens the palette.
- [ ] **Calm mode.** Press Ctrl+K and run "Calm mode: pause animations". Nothing big moves any more, and everything still works. Run it again to turn the animations back on.
- [ ] **The console.** Press F12, open Console and reload: no red errors.
- [ ] **Links into the page.** `#lesson-4`, `#term-bias` and `#quiz` at the end of the address open the right place.
- [ ] **Saved progress.** Finish a lesson, change the language and the theme, reload: everything is remembered.


## Credits

AI Compass is a CAS (Creativity, Activity, Service) project made by two students. The code was written with Claude, Anthropic's AI assistant; the students plan the site, check the facts, test it and look after it.
