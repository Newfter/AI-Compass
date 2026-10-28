# AI Compass

AI Compass is a free website that teaches teenagers about artificial intelligence, in English and in Russian. It has short lessons with mini-labs, two live AI experiments, a quiz, a glossary, a history timeline, a chat helper (Compass Bot) and a search window for the whole site (Ctrl+K).

It is plain HTML, CSS and JavaScript: no libraries, no frameworks, no build step. The files in this folder are exactly what visitors get.

This guide is for the people who look after the site. It explains how the code is organised and how to make the most common changes.

- [Run it on your computer](#run-it-on-your-computer)
- [The folder map](#the-folder-map)
- [How the pieces talk](#how-the-pieces-talk)
- [Recipes](#recipes): [change a text](#change-a-text-in-both-languages), [add a lesson](#add-a-lesson), [add a quiz question](#add-a-quiz-question), [add a glossary term](#add-a-glossary-term), [add a timeline milestone](#add-a-timeline-milestone), [add a fact or a joke to Compass Bot](#add-a-fun-fact-or-a-joke-to-compass-bot), [help Compass Bot find an answer](#help-compass-bot-find-an-answer), [add a Ctrl+K command](#add-a-command-to-the-ctrlk-palette)
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
| `css/lessons.css` | The lessons: progress panel, cards, the lesson reader, the mini-labs and the certificate. |
| `css/lab.css` | The AI Lab. |
| `css/quiz.css` | The quiz. |
| `css/glossary.css` | The glossary. |
| `css/timeline.css` | The history timeline. |
| `css/assistant.css` | Compass Bot. |
| `css/palette.css` | The Ctrl+K command palette. |
| `js/core.js` | The toolkit that every other script uses (`window.AICompass`, called `A`): saved settings, texts and languages, the theme, calm mode, pop-up windows, scrolling to sections, Ctrl+K commands and toasts. It is loaded first. |
| `js/effects.js` | Small touches: the scroll progress bar, cards that rise in, numbers that count up, typewriter words, tilting cards, the mouse spotlight, magnetic buttons, ripples, the section mini-map and confetti. |
| `js/neural-bg.js` | The animated "brain" drawn behind the page. |
| `js/lessons.js` | The lessons: progress panel, lesson cards, the lesson reader, the mini-labs, reading aloud and the certificate. |
| `js/lab.js` | The AI Lab: "Teach the machine" (a tiny neural network) and the "Next-word predictor" (a tiny language model). |
| `js/quiz.js` | The AI Challenge: questions, the timer, points, streaks, ranks and the best score. |
| `js/glossary.js` | The glossary: search with "did you mean?", categories, the A–Z strip, term cards and a random term. |
| `js/timeline.js` | "A Short History of AI": the era chips and the line that fills as you scroll. |
| `js/assistant.js` | Compass Bot, the chat helper in the corner: its prepared answers, answers looked up in the site, follow-ups ("tell me more") and "quiz me". |
| `js/palette.js` | The Ctrl+K search window. |
| `js/search.js` | The site search (`A.search`): finds things in the lessons, glossary, timeline, quiz, AI Lab and page texts, in the current language, with typos, synonyms and the wrong keyboard layout. The Ctrl+K palette and Compass Bot use it. |
| `js/content/page.js` | The texts of the menu, the hero, About and the footer. |
| `js/content/effects.js` | The texts of the visual effects. |
| `js/content/neural-bg.js` | The texts of the neural network background. |
| `js/content/lessons.js` | The lesson texts, the mini-lab texts and the reader's buttons. |
| `js/content/lab.js` | The AI Lab texts, and the sentences the next-word predictor learns from. |
| `js/content/quiz.js` | The quiz texts, the list of questions and the ranks. |
| `js/content/glossary.js` | The glossary texts, the categories and every term. |
| `js/content/timeline.js` | The timeline texts, the eras and every milestone. |
| `js/content/assistant.js` | Compass Bot's texts, fun facts and jokes, and its "brain" (the words it listens for and its answers). |
| `js/content/palette.js` | The texts of the Ctrl+K palette. |
| `js/content/search.js` | The search's texts and word lists: little words it skips (also words that only judge, like "good" or "лучше"), words that mean the same thing ("нейросеть" = "neural network"), words that point back to the sentence before ("This is called..."), and the parts of the page it searches. |
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

The lists sit in the same files, as data: `A.content.set("quiz", { questions: [...], ranks: [...] })` in `js/content/quiz.js`, read with `A.content.get("quiz")` in `js/quiz.js`. (The list of lessons is the exception: it is at the top of `js/lessons.js`, because each lesson is tied to the code of its mini-lab.)

**Numbers come from the data.** Nothing says "6 lessons" or "12 questions" by hand. The scripts count the data and share the number: `A.setTextValue("quizQuestionCount", QUESTIONS.length)`. Texts then have a form for each kind of number, and the toolkit picks the right one:

```js
"quiz.subtitle.12": "Twelve questions. How well do you really know AI?",   // only for exactly 12
"quiz.subtitle.one": "{n} question. How well do you really know AI?",
"quiz.subtitle.many": "{n} questions. How well do you really know AI?"
```

Russian has three forms: `.one` (1, 21, 31...), `.few` (2–4, 22–24...) and `.many` (5–20, 25...).

**Features talk to each other through their API.** The last section of each feature file shares a few functions with `A.feature(...)`: `A.lessons.open(3)`, `A.glossary.show("bias")`, `A.quiz.start()`, `A.lab.open("predictor")`, `A.assistant.open()`, `A.palette.open()`. For example, the timeline's "In the glossary" buttons call `A.glossary.show(id, { focus: true })`.

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
| | `certificate.make` | `{}` | the certificate is downloaded |
| Quiz | `quiz.answer` | `{ id, correct }` | a question is answered |
| | `quiz.finish` | `{ mode, score, total, points, timed, seconds }` | a round ends (`mode` is `"classic"` or `"timed"`, `score` is the number of right answers) |
| AI Lab | `lab.use` | `{ exp }` | a tab is chosen, training starts, or auto-write starts |
| | `lab.milestone` | `{ exp, kind, ... }` | the classifier has learned (`kind: "learned"`, `epochs`) or the predictor was taught (`kind: "taught"`, `sentences`) |
| Glossary | `glossary.explore` | `{ id }` | a term is opened |
| Timeline | `timeline.era` | `{ era }` | the timeline's line reaches an era for the first time |
| Compass Bot | `bot.ask` | `{ typed: true }` or `{ intent }` | a typed question, or a chip |
| | `bot.quiz` | `{ correct }` | a "quiz me" question in the chat is answered |
| | `bot.feedback` | `{ helpful }` | 👍 (`true`) or 👎 (`false`) under an answer from the site |
| Ctrl+K | `palette.run` | `{ id }` | a command is run |
| Search | `search.open` | `{ type, id, from }` | a text found by the search is opened: a palette row (`from: "palette"`) or a source under a bot answer (`from: "bot"`) |
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

A lesson needs one entry in `js/lessons.js` and its texts in `js/content/lessons.js`. Add new lessons at the end: saved progress remembers lessons by their number, so don't change the order of the ones that exist.

**1. The entry.** In `js/lessons.js`, section 2, add it at the end of `LESSONS`:

```js
        {
            number: 7, icon: "🗨️", level: "beginner", minutes: 3, rgb: "--accent-2-rgb",
            sections: 2, notes: { 2: "tip" }, lab: "words", correct: 1,
            tryIt: "predictor", tryIcon: "🔮",
            keywords: "prompt prompting ask chatbot questions промпт запрос чат-бот вопросы"
        }
```

- `number`: the next number. `icon`: the emoji on the card. `minutes`: the reading time on the card.
- `level`: `"beginner"` or `"intermediate"`.
- `rgb`: the lesson's colour: `"--accent-rgb"` (violet), `"--accent-2-rgb"` (cyan) or `"--accent-3-rgb"` (pink).
- `sections`: how many parts the text has (`s1`, `s2`, ...).
- `notes`: which parts have a small box, and its kind: `"fact"`, `"example"` or `"tip"`.
- `lab`: which mini-lab it shows. Reuse one of the six: `"sort"` (AI or not AI?), `"fit"` (watch a model learn), `"neuron"`, `"words"` (be the language model), `"day"` (spot the hidden AI) or `"dilemmas"` (what would you do?). A brand-new mini-lab needs new code in `js/lessons.js` (sections 10 to 15 show how the others are made).
- `correct`: which answer to "Check yourself" is right: 0, 1 or 2 (for `a1`, `a2`, `a3`).
- `tryIt`: where the "Try it on this site" button goes: `"timeline"`, `"glossary"`, `"quiz"`, `"classifier"` (Teach the machine) or `"predictor"` (Next-word predictor). `tryIcon`: its emoji.
- `keywords`: extra words (both languages) that find the lesson in the Ctrl+K search.

**2. The texts.** In `js/content/lessons.js`, add a block after the lesson 6 block. Every key starts with `lessons.l7.` (the lesson) or `lessons.w7.` (its mini-lab's title and intro). Each part needs `.h` (title) and `.p` (text), each box needs `.note`, and there are always three key ideas and three answers:

```js
// Lesson 7 — Talking to AI
window.AICompass.addTranslations({
    en: {
        "lessons.l7.title": "Talking to AI",
        "lessons.l7.desc": "How to ask a chatbot good questions — and check its answers.",
        "lessons.l7.s1.h": "Say what you need",
        "lessons.l7.s1.p": "A chatbot only knows what you type. Say what you need, who it is for and how long the answer should be: <em>“Explain photosynthesis to a 14-year-old in five sentences”</em> works much better than <em>“photosynthesis”</em>.",
        "lessons.l7.s2.h": "Check before you trust",
        "lessons.l7.s2.p": "Chatbots can sound sure and still be wrong. Compare important answers with a textbook or a trusted website, and never type in passwords or private details.",
        "lessons.l7.s2.note": "If an answer matters (homework, health, money), check it in a second place.",
        "lessons.l7.key1": "A clear, detailed question gets a more useful answer.",
        "lessons.l7.key2": "Chatbots can be confidently wrong: check what matters.",
        "lessons.l7.key3": "Never share passwords or private details with a chatbot.",
        "lessons.l7.tip": "See how a language model picks its next word, live in the AI Lab.",
        "lessons.l7.tipBtn": "Open the predictor",
        "lessons.l7.q": "Which question will probably get the most useful answer?",
        "lessons.l7.a1": "“Volcanoes”",
        "lessons.l7.a2": "“Explain in five sentences, for a 14-year-old, why volcanoes erupt”",
        "lessons.l7.a3": "“Tell me everything you know”",
        "lessons.l7.explain": "The second question says what you need, who it is for and how long the answer should be.",
        "lessons.w7.title": "Be the language model",
        "lessons.w7.intro": "A chatbot writes one word at a time. Pick the next word yourself and see how the “temperature” changes the choice."
    },
    ru: {
        // the same keys, in Russian (see below)
    }
});
```

<details>
<summary>The Russian part of this example</summary>

```js
    ru: {
        "lessons.l7.title": "Как говорить с ИИ",
        "lessons.l7.desc": "Как задавать чат-боту хорошие вопросы — и проверять его ответы.",
        "lessons.l7.s1.h": "Скажи, что тебе нужно",
        "lessons.l7.s1.p": "Чат-бот знает только то, что ты напишешь. Скажи, что тебе нужно, для кого и какой длины должен быть ответ: <em>«Объясни фотосинтез четырнадцатилетнему в пяти предложениях»</em> работает гораздо лучше, чем просто <em>«фотосинтез»</em>.",
        "lessons.l7.s2.h": "Проверяй, прежде чем верить",
        "lessons.l7.s2.p": "Чат-бот может говорить уверенно и всё равно ошибаться. Сверяй важные ответы с учебником или надёжным сайтом и никогда не вводи пароли и личные данные.",
        "lessons.l7.s2.note": "Если ответ важен (домашка, здоровье, деньги), проверь его ещё в одном месте.",
        "lessons.l7.key1": "На понятный подробный вопрос ты получишь более полезный ответ.",
        "lessons.l7.key2": "Чат-бот может уверенно ошибаться: проверяй то, что важно.",
        "lessons.l7.key3": "Никогда не сообщай чат-боту пароли и личные данные.",
        "lessons.l7.tip": "Посмотри в ИИ-лаборатории, как языковая модель выбирает следующее слово.",
        "lessons.l7.tipBtn": "Открыть предсказатель",
        "lessons.l7.q": "На какой вопрос ты, скорее всего, получишь самый полезный ответ?",
        "lessons.l7.a1": "«Вулканы»",
        "lessons.l7.a2": "«Объясни в пяти предложениях для четырнадцатилетнего, почему извергаются вулканы»",
        "lessons.l7.a3": "«Расскажи всё, что знаешь»",
        "lessons.l7.explain": "Во втором вопросе сказано, что нужно, для кого и какой длины должен быть ответ.",
        "lessons.w7.title": "Побудь языковой моделью",
        "lessons.w7.intro": "Чат-бот пишет по одному слову. Выбери следующее слово сам и посмотри, как «температура» меняет выбор."
    }
```

</details>

That's all: the cards, the progress panel, the hero number, the section subtitle, the Ctrl+K command and the certificate count the lessons by themselves. (The subtitle says "Six short lessons" only while there are exactly six; with seven it says "7 short lessons". To spell the number out, add `"lessons.subtitle.7"` next to `"lessons.subtitle.6"`, in both languages.)

**Check:** there are 7 cards and the hero says 7; open the lesson (click its card, or go to `http://localhost:8000/#lesson-7`) and look at every part, the box, the mini-lab, the three key ideas and the three answers; pick the right answer (it says "Correct!" and the panel counts 1 more); try the "Try it" button; press Ctrl+K and type the lesson's title. Do it again in Russian.

### Add a quiz question

**File:** `js/content/quiz.js`.

**1. The texts.** Add them after the last question's texts, in both parts. For a multiple-choice question, write four options and put the right one **first** (`o1`). The quiz shuffles the options in every game.

English part:

```js
        "quiz.q13.text": "What does a recommendation system do?",
        "quiz.q13.o1": "Suggests videos, songs or products from what you and similar people liked",
        "quiz.q13.o2": "Blocks every advert on a website",
        "quiz.q13.o3": "Makes your internet connection faster",
        "quiz.q13.o4": "Keeps your passwords safe",
        "quiz.q13.explain": "Recommendation systems learn from what you watch, play and buy, and from what similar people like, to guess what you will enjoy next.",
```

Russian part:

```js
        "quiz.q13.text": "Что делает рекомендательная система?",
        "quiz.q13.o1": "Советует видео, песни или товары по тому, что нравилось тебе и похожим людям",
        "quiz.q13.o2": "Блокирует всю рекламу на сайте",
        "quiz.q13.o3": "Ускоряет твой интернет",
        "quiz.q13.o4": "Защищает твои пароли",
        "quiz.q13.explain": "Рекомендательные системы учатся на том, что ты смотришь, слушаешь и покупаешь, и на том, что нравится похожим людям, — и угадывают, что тебе понравится дальше.",
```

**2. The entry.** At the bottom of the file, add a line to `questions`:

```js
        { key: "q13", type: "choice", topic: "everyday", correct: 0, learn: 5 }
```

- `type`: `"choice"` (four options, `correct: 0`) or `"truefalse"` (only `.text` and `.explain`; `correct: 0` means "True", `1` means "False").
- `topic`: one of the `quiz.topic.…` texts (`basics`, `ml`, `data`, `nn`, `genai`, `hallucination`, `bias`, `privacy`, `everyday`, `history`, `responsible`).
- `learn`: the number of the lesson that explains it, or `"timeline"`.

Below `questions` are the `ranks`: the number of right answers (`min`) you need for each rank. If you add several questions, check that these numbers still make sense.

**Check:** the quiz subtitle and the hero say 13; start a game and play it to the end (the questions come in a random order); the new question shows its four options and its explanation. Do it again in Russian.

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

### Help Compass Bot find an answer

Compass Bot answers in this order:

1. **A prepared answer** when the message clearly matches an intent (the word lists in `brain.intents`, `js/content/assistant.js`): greetings, jokes, "what is AI?"... Under it, "On the site" chips show where the site tells more (`brain.replySources`).
2. **An answer from the site**: otherwise it looks the question up with `A.search` in the lessons, the glossary and the timeline, and shows 1–3 sentences of the best text with its source. "When...?" questions look in the timeline first.
3. **"Not sure"**: when it is not sure, it says so and shows up to 3 places to look.

It is sure when the best text holds at least 70 % of the question's words (`SITE_CONFIDENT` in `js/assistant.js`), has a search score of at least 2.5 (`SITE_MIN_SCORE`) and is about the question: its title holds one of the words, or the question has 2 or more words. Without that last rule, "what is photosynthesis?" was answered with the glossary's "Prompt" (whose example asks about photosynthesis). The numbers were tuned on 129 questions with a known right source and 40 questions the site cannot answer (pizza, the weather...), looked up without the prepared answers: the search step gives 107 right answers and 6 wrong ones (13 without the title rule), and says "not sure" 11 times although its best text was right.

When the bot misses a question:

- **People use another word for the same thing:** add it to a line of `synonyms` in `js/content/search.js` (both languages), like `["deepfake", "deep fake", "дипфейк"]`.
- **A word only shapes the question** ("who *invented*...", "how does it *work*"): add it to `askWords` in `js/content/assistant.js`.
- **A prepared answer fits better:** add the words to its intent in `brain.intents`. A prepared answer wins over the site, so keep its words precise ("deep learning" is not in the neural network intent: the glossary explains it better).

**Check:** ask the question in both languages, with a typo, and once with "tell me more" after it. The source chip under the answer must open the right text.

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
