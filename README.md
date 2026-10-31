# AI Compass

AI Compass is a free website that teaches teenagers about artificial intelligence, in English and in Russian. It has short lessons with mini-labs, an AI Lab of live experiments (small, real models that learn in your browser), a quiz, a glossary, a history timeline, a chat helper (Compass Bot), a search window for the whole site (Ctrl+K), My Compass, where learners see their XP, level, badges and streak, and Settings (bigger text, high contrast, an easy-to-read font and more).

It is plain HTML, CSS and JavaScript: no libraries, no frameworks, no build step. The files in this folder are exactly what visitors get.

This guide is for the people who look after the site. It explains how the code is organised and how to make the most common changes.

- [Run it on your computer](#run-it-on-your-computer)
- [The folder map](#the-folder-map)
- [How the pieces talk](#how-the-pieces-talk)
- [The app, offline use, sharing, printing and search engines](#the-app-offline-use-sharing-printing-and-search-engines)
- [Recipes](#recipes): [change a text](#change-a-text-in-both-languages), [add a lesson](#add-a-lesson), [add a quiz question](#add-a-quiz-question), [add a glossary term](#add-a-glossary-term), [add a timeline milestone](#add-a-timeline-milestone), [add a fact or a joke to Compass Bot](#add-a-fun-fact-or-a-joke-to-compass-bot), [help Compass Bot find an answer](#help-compass-bot-find-an-answer), [add a Ctrl+K command](#add-a-command-to-the-ctrlk-palette), [add an AI Lab experiment](#add-an-ai-lab-experiment)
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
| `index.html` | The page: the menu, the first screen (the "hero"), one `<section>` for each part of the site, and the list of styles and scripts. Each part has an empty `<div data-feature="...">` that its script fills. A small script in the `<head>` applies the saved theme, calm mode and settings (text size, line spacing, font, contrast...) before the page is drawn, so nothing flashes. |
| `style.css` | What the whole page shares: the design tokens (colours, fonts and sizes of both themes), buttons, cards, the menu, the hero, the section frames, toasts, the phone layout and calm mode. |
| `css/components.css` | Small visual parts that several features share, each written once as a `ui-...` class: corner brackets, the light that scans along a card, sliders, on/off switches, filter chips, answer options and progress rings. |
| `css/effects.css` | The visual effects and the neural network background. |
| `css/lessons.css` | The lessons: progress panel, the tracks and their cards, the lesson reader, the first six mini-labs and the certificates. |
| `css/lessons-labs.css` | The mini-labs that have their own file in `js/lessons/`. It loads with the first of them, not with the page. |
| `css/lab.css` | The AI Lab: the lab's card, the picker of experiments (a grid of cards, or a rail while one is open), the header above the open experiment, loading and errors. Section 1 keeps the height of each experiment while it loads, so the page below doesn't jump. |
| `css/lab/` | The styles of each AI Lab experiment (`<id>.css`) and of the lab kit (`kit.css`). The lab loads them when an experiment opens. |
| `css/quiz.css` | The quiz. |
| `css/glossary.css` | The glossary. |
| `css/timeline.css` | The history timeline. |
| `css/assistant.css` | Compass Bot. |
| `css/palette.css` | The Ctrl+K command palette. |
| `css/journey.css` | My Compass: the button in the menu, the badge picture in a toast, and the dashboard window. |
| `css/settings.css` | The Settings window and the keyboard shortcuts window, and what the settings change on the whole page: bigger text, relaxed lines, the easy-to-read font, underlined links, high contrast and solid surfaces. It comes after the other styles. |
| `css/print.css` | The page on paper (used only when printing): black on white, an open lesson as a handout, the certificate on one A4 page. |
| `css/teachers.css` | The "For teachers" section. |
| `css/teachers-kit.css` | The teacher kit: the window with the lesson plan, the worksheet and the answer key, how they look on paper, and the classroom quiz. It loads with the kit, not with the page. |
| `js/core.js` | The toolkit that every other script uses (`window.AICompass`, called `A`): saved settings, texts and languages, the theme, calm mode, pop-up windows, scrolling to sections, Ctrl+K commands and toasts. It is loaded first. |
| `js/effects.js` | Small touches: the scroll progress bar, cards that rise in, numbers that count up, typewriter words, tilting cards, the mouse spotlight, magnetic buttons, ripples, the section mini-map and confetti. |
| `js/neural-bg.js` | The animated "brain" drawn behind the page. |
| `js/lessons.js` | The lessons: the list of lessons and tracks, progress panel, lesson cards, the lesson reader, the first six mini-labs, reading aloud and the certificates. |
| `js/lessons/` | One file per newer mini-lab (`pixels.js`, `slots.js`, `temperature.js`, `noise.js`, `fairness.js`, `prompt.js`). `js/lessons.js` loads a file the first time its lesson opens. |
| `js/lab.js` | The AI Lab's hub: the picker, loading an experiment's files when it opens (or a moment before), links like `#lab/maze`, the Ctrl+K commands, remembering the last experiment, and the progress events. |
| `js/lab/` | The experiments, one file each, loaded when they open: `draw.js` ("Draw and teach": your drawings teach two models, nearest neighbours and a small neural network), `cluster.js` ("Finding groups": k-means finds groups in a cloud of points with no answers given, and the elbow chart helps choose how many), `classifier.js` ("Teach the machine", a tiny neural network), `descent.js` ("Down the hill": three balls race down a hill of error, the way a model learns by gradient descent), `predictor.js` (the next-word predictor, a tiny language model), `chatbot.js` ("Inside a chatbot": tokens, word meanings, attention and the dice that pick the next word), `vision.js` ("How computers see": 3 × 3 filters slide over a picture to find edges, then a tiny convolutional network shows what it sees), `maze.js` (a robot that learns from rewards), `evolve.js` (cars that learn to drive by evolution), `bias.js` ("Bias detective": a model trained on unfair past decisions learns to be unfair, and twins with the same skill show it). `kit.js` is the lab kit (`A.labKit`) they are all built from: buttons, sliders, charts, canvases, a frame loop, seeded random numbers, saved settings and "Try this" challenges. `sample.js` ("Guess the line") is a small, complete experiment to copy; it is not in the lab. |
| `js/quiz.js` | The AI Challenge: the six modes (Classic, Timed, Daily challenge, Myth or fact, Lesson review, My mistakes), points, streaks, ranks, the saved results and the quiz's API. |
| `js/glossary.js` | The glossary: the term of the day, search with "did you mean?", categories, the A–Z strip, term cards, a random term, and the flashcard boxes ("{n} cards to study today"). |
| `js/glossary-cards.js` | The flashcards window. It is loaded the first time someone studies. |
| `js/timeline.js` | "A Short History of AI": the era and theme chips, the folded milestones, and the line that fills as you scroll. |
| `js/assistant.js` | Compass Bot, the chat helper in the corner: its prepared answers, answers looked up in the site, follow-ups ("tell me more") and "quiz me". |
| `js/palette.js` | The Ctrl+K search window. |
| `js/search.js` | The site search (`A.search`): finds things in the lessons, glossary, timeline, quiz, AI Lab and page texts, in the current language, with typos, synonyms and the wrong keyboard layout. The Ctrl+K palette and Compass Bot use it. |
| `js/journey.js` | My Compass: counts XP from the progress events, and keeps the level, the badges and the streak in this browser. It also draws the button in the menu. |
| `js/journey-panel.js` | The My Compass window (the dashboard). It is loaded the first time the window opens. |
| `js/settings.js` | The Settings window (the gear in the menu, Ctrl+K or `#settings`): language, theme, text size, line spacing, font, underlined links, contrast, transparency, calm motion and the read-aloud voice and speed, saved in this browser (`A.settings`). Also the keyboard shortcuts window (press `?`). |
| `js/platform.js` | The app around the site: starts the offline copy (`sw.js`), the "Install the app" button, the offline / back online messages, `?lang=` in the address, sharing (`A.share`) and the Share and Print commands. |
| `js/teachers.js` | The "For teachers" section: the course at a glance, three buttons for each lesson (plan, worksheet, answer key) and the classroom quiz button. It stays small: it loads the teacher kit the first time one of them is opened. |
| `js/teachers-kit.js` | The teacher kit: the window that shows a lesson plan, a worksheet or an answer key (with Print and Copy as text), and the classroom quiz for the projector (teams, a timer, big type). Not in `index.html`: `js/teachers.js` loads it when it is needed. |
| `js/content/page.js` | The texts of the menu, the hero, About and the footer. |
| `js/content/effects.js` | The texts of the visual effects. |
| `js/content/neural-bg.js` | The texts of the neural network background. |
| `js/content/lessons.js` | The texts of the tracks, the reader's buttons, the certificates and lessons 1-6 (with their mini-labs). |
| `js/content/lessons-deep.js` | The texts of the "Deep dive" lessons (7 and on) and of their mini-labs. |
| `js/content/lab.js` | The AI Lab's texts, each experiment's title, hook and big idea (the picker shows them before the experiment loads), the icons, and the catalogue: which experiments the lab shows, in which order. |
| `js/content/lab/` | Each experiment's own texts (`<id>.js`, loaded with it) and the lab kit's texts (`kit.js`). `predictor.js` also has the sentences the next-word predictor learns from. |
| `js/content/quiz.js` | The quiz's buttons and messages, the list of questions with their tags, the "Myth or fact" statements and the ranks. |
| `js/content/quiz-bank.js` | The texts of the 60 questions and 20 "Myth or fact" statements, one block per lesson. Not in `index.html`: the quiz loads it when it is needed. |
| `js/content/glossary.js` | The glossary texts. |
| `js/content/glossary-terms.js` | The glossary's categories and every term. |
| `js/content/timeline.js` | The timeline texts, the eras, the themes and every milestone (with its lesson and lab experiment). |
| `js/content/assistant.js` | Compass Bot's texts, fun facts and jokes, and its "brain" (the words it listens for and its answers). |
| `js/content/palette.js` | The texts of the Ctrl+K palette. |
| `js/content/search.js` | The search's texts and word lists: little words it skips (also words that only judge, like "good" or "лучше"), words that mean the same thing ("нейросеть" = "neural network"), words that point back to the sentence before ("This is called..."), and the parts of the page it searches. |
| `js/content/journey.js` | My Compass: its texts, the XP table, the levels and the badges. |
| `js/content/settings.js` | The texts of the Settings and keyboard shortcuts windows, and the list of every keyboard shortcut of the site. |
| `js/content/platform.js` | The texts of installing, the offline messages and sharing. |
| `js/content/teachers.js` | The texts of the "For teachers" section. |
| `js/content/teachers-kit.js` | The texts of the teacher kit's window and of the classroom quiz. Loaded with the kit. |
| `js/content/teachers-basics.js` | The lesson plans and worksheets of lessons 1-6, in both languages. Its header explains every part of a plan and every kind of task. Loaded the first time a teacher opens one of them. |
| `js/content/teachers-deep.js` | The same for the "Deep dive" lessons (7 and on). |
| `sw.js` | The service worker: the copy of the site that works without a connection. You never need to change it when you edit the site. |
| `manifest.webmanifest` | The app's name, colours and icons, used when the site is installed as an app. |
| `404.html` | The page GitHub Pages shows for an address that doesn't exist, however deep, in both languages. |
| `robots.txt`, `sitemap.xml` | For search engines: everything may be read, and the site's three addresses (plain, `?lang=en`, `?lang=ru`). |
| `images/` | The app icons, the browser tab's icon, and the picture shown when a link is shared (`og-image.png`, 1200 × 630). |
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

**Features talk to each other through their API.** The last section of each feature file shares a few functions with `A.feature(...)`: `A.lessons.open(3)`, `A.glossary.show("bias")`, `A.quiz.start()`, `A.lab.open("predictor")`, `A.timeline.show("e3")`, `A.assistant.open()`, `A.palette.open()`. For example, the timeline's "In the glossary" buttons call `A.glossary.show(id, { focus: true })`. The quiz shares the most: `A.quiz.start(mode, options)`, `A.quiz.question(id)`, `A.quiz.bank()`, `A.quiz.stats()` and `A.quiz.ready()`, described at the end of `js/quiz.js`.

**Pop-up windows** (the lesson reader, Compass Bot, the Ctrl+K palette, the phone menu, the menu bar's "More" list) register with `A.overlays`. Core then treats them all the same way: a window that covers the page locks the page behind it, Esc closes the window on top, and the focus goes back to where it was.

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

Nothing leaves the browser: these events are only for features on the same page (for example "My Compass", which turns them into XP with the table in `js/content/journey.js`).

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
| AI Lab | `lab.use` | `{ exp }` | an experiment is opened; also when training starts (Teach the machine) or auto-write starts (the predictor) |
| | `lab.milestone` | `{ exp, kind, ... }` | the classifier has learned (`kind: "learned"`, `epochs`) or the predictor was taught (`kind: "taught"`, `sentences`) |
| | `lab.challenge` | `{ exp, n, done, total }` | a "Try this" challenge is reached (`n` counts from 1; `done` of the `total` are reached now). It can come again for the same `n` after the experiment resets its challenges. |
| Glossary | `glossary.explore` | `{ id }` | a term is opened |
| | `flashcard.review` | `{ id, box, correct }` | a flashcard is answered (`box` is the box the card is in now, 1–5) |
| | `flashcard.finish` | `{ deck, cards, correct }` | a study session ends (`deck` is `"all"`, a category like `"vision"` or a lesson like `"lesson-7"`; `cards` were answered, `correct` of them known) |
| Timeline | `timeline.era` | `{ era }` | the reader reaches an era for the first time: the line has lit one of its milestones while the end of the lit line, or that milestone, is on screen (never just because the page loaded, or because the page jumped past the timeline) |
| Compass Bot | `bot.ask` | `{ typed: true }` or `{ intent }` | a typed question, or a chip |
| | `bot.quiz` | `{ correct }` | a "quiz me" question in the chat is answered |
| | `bot.feedback` | `{ helpful }` | 👍 (`true`) or 👎 (`false`) under an answer from the site |
| Ctrl+K | `palette.run` | `{ id }` | a command is run |
| Search | `search.open` | `{ type, id, from }` | a text found by the search is opened: a palette row (`from: "palette"`) or a source under a bot answer (`from: "bot"`) |
| Settings | `settings.change` | `{ name, value }` | a setting really changes, wherever it was changed (the settings window, Ctrl+K, the buttons in the menu bar). `name` is `language` (`"en"`, `"ru"`), `theme` (`"dark"`, `"light"` or `"system"`), `textSize` (1, 1.125, 1.25 or 1.5), `lineSpacing` (`"normal"`, `"relaxed"`), `easyFont`, `underlineLinks`, `contrast` or `reduceTransparency` (true, false), `voiceEn` or `voiceRu` (a voice, `""` for automatic) or `speechRate` (0.75, 1, 1.25 or 1.5) |
| Platform | `app.install` | `{}` | the site was installed as an app |
| | `app.share` | `{ via }` | something was shared: `via` is `"share"` (the device's share window) or `"copy"` (the link was copied) |
| For teachers | `teacher.open` | `{ what, n }` | a lesson plan, a worksheet, an answer key or the classroom quiz is opened (`what`: `"plan"`, `"worksheet"`, `"answers"` or `"quiz"`; `n`: the lesson, not sent for the quiz) |
| Core | `language.change` | `{ lang }` | the language changes |
| | `theme.change` | `{ theme }` | the theme changes |
| | `settings.change` | `{ name: "calm", value }` | calm mode is switched on (`true`) or off (`false`) |
| My Compass | `journey.open` | `{}` | the window opens |
| | `journey.export` | `{ how }` | the progress is saved to a file (`how: "file"`) or copied as text (`how: "text"`) |

My Compass also sends its own event, `"journey"`, after a new level (`{ type: "level", level, name }`) or a new badge (`{ type: "badge", id, name }`), and offers `A.journey`: `xp()`, `level()`, `badges()`, `streak()`, `open()`, `export()` and `import(data)`.

**Adding an event:** call `A.track("part.something", { ... })` where it happens, list it in your file's header, and add a row here. Listeners must not count the same thing twice: the same event can come many times (for example `lesson.open`).

**Loading files on demand:** `A.loadScript(src)` and `A.loadStyle(href)` load a file the first time it is needed and return a Promise; asking again for the same file reuses the first load, and a failed load can be tried again. Also list every such file with `A.keepOffline(files)` when your feature starts (a path or a list of paths): the offline copy saves them ahead, so they work without a connection even if they were never opened.


## The app, offline use, sharing, printing and search engines

**The offline copy (`sw.js`).** Once the page has loaded, `js/platform.js` starts a *service worker*: a small script the browser keeps for the site, which sees every file the page asks for. Online it always asks the server first, so everyone gets what you published on their next visit (and you see your change on a normal reload). Every answer is saved, and without a connection (or when the server takes more than about 4 seconds) the saved copy answers instead. The first visit saves the page and every file `index.html` loads. Then, at a quiet moment, it also saves the files loaded only when they are needed (the quiz questions, the lab experiments, the lesson mini-labs, the flashcards, the teacher kit: each feature lists them with `A.keepOffline`), so after one visit the whole site works offline. On later visits, only the copies made before the site was last published are fetched again. When the browser is set to save data, those files are saved only once they are used. A page that was never saved shows a small "You're offline" page.

- **You never need to change `sw.js` when you edit the site.** It reads its list of files from `index.html`. Only a change to the way `sw.js` itself works needs a higher `CACHE_VERSION` at its top (the old copies are then deleted).
- **To try it:** open the site on a local server, then F12 → Application → Service workers: it should say "activated and is running". Tick "Offline" (there, or in the Network tab) and reload: the site still works. "Unregister" and "Clear site data" (Application → Storage) remove the worker and the copy.
- It never starts when you open `index.html` as a file (`file://`), and not in browsers driven by a test program (`navigator.webdriver`), so automatic tests always see exactly the files on the server.

**Install the app.** When the browser offers to install the site (Chrome, Edge, Samsung Internet), an "Install the app" button appears in the footer and a command in Ctrl+K. Safari on iPhones and iPads never offers it: there the button shows how to do it with Share → "Add to Home Screen". The app's name, colours and icons are in `manifest.webmanifest`.

**Links in a language.** An address ending in `?lang=ru` or `?lang=en` opens the site in that language, and saves it like the RU / EN button does (the script at the top of `index.html` does it before the page is drawn). Share links use it, and so do search engines.

**Sharing.** `A.share({ title, text, url })` opens the device's share window (phones, tablets); where there is none, it copies the text and the link and says so. Every part is optional: `A.share()` shares the site itself. Call it from a click (browsers allow sharing and copying only right after one). It returns a Promise of what happened: `"shared"`, `"copied"`, `"cancelled"` or `"failed"`. `A.platform.link("quiz")` is the site's public address in the current language, with a part:

```js
// For example after a quiz round, with a text "quiz.shareResult" added to js/content/quiz.js
A.share({ text: A.t("quiz.shareResult", { score: 10 }), url: A.platform.link("quiz") });
```

**Printing.** Ctrl+P (or "Print this page" in Ctrl+K) prints the page in black on white, without the menu, the effects, the buttons, the AI Lab and the quiz. An open lesson prints alone, as a handout; the certificate, while it is shown, prints alone on one A4 page. The rules are in `css/print.css`: look at the print preview in both themes after changing a feature's layout.

**Search engines and shared links.** The top of `index.html` tells search engines and chat apps about the site: a description, the canonical address (added by the script at the top of `index.html`, for the address that was opened: with `?lang=` it names that language's page) and the language versions (`hreflang`), Open Graph and Twitter tags (the title, text and picture shown when a link is shared), and the JSON-LD at the end of `<head>`, which describes the site and the lessons as a free course. `robots.txt` and `sitemap.xml` help search engines find the pages. To check: https://validator.schema.org for the JSON-LD, and F12 → Application → Manifest for the app.

**If the site ever moves** (a new address, or the repository is renamed), change the address in all these places:
- `index.html`: the `hreflang` links, `og:url` (the canonical address is made from it) and `og:image`, and every address in the JSON-LD;
- `robots.txt` and `sitemap.xml`;
- `404.html`: `SITE_FOLDER` and the `<base>` tag (both are the folder, `/AI-Compass/`);
- `css/print.css`: the address printed at the bottom of every page.

**The pictures** in `images/` are PNG files of fixed sizes: `icon-192.png` and `icon-512.png` (the app), `icon-maskable-512.png` (the app on Android, which cuts it into a circle: keep the drawing inside the middle 80 %), `apple-touch-icon.png` (180 × 180, iPhones), `favicon-32.png` (the browser tab) and `og-image.png` (1200 × 630, shared links). To change one, replace it with a picture of the same size and name. The pictures are saved with 256 colours, which looks the same here and takes less than half the space: do the same with a new one, with a free tool such as pngquant or tinypng.com (but not for `favicon-32.png`, which is tiny anyway).


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

**4. Search engines.** In `index.html`, add the lesson to `"syllabusSections"` in the JSON-LD at the end of `<head>` (its number, its English title and description, and its reading time, `"PT3M"` for 3 minutes), and add its minutes to `"courseWorkload"`. This is the only list of lessons that doesn't count itself: search engines read it without running any script.

**5. Its lesson plan and worksheet.** The "For teachers" section gives every lesson a lesson plan, a worksheet and an answer key. In `js/content/teachers-deep.js`, copy the block of lesson 7 (`7: { ... }`) to the end of the list, change `7` to `13`, and write the plan and the tasks of the new lesson in both parts, `en` and `ru` (see [Change a lesson plan or a worksheet](#change-a-lesson-plan-or-a-worksheet)). Its `exit` and `quiz` name questions of the quiz by their id: add the lesson's quiz questions first. Without a plan, the lesson's buttons in "For teachers" open a window that says the lesson plans didn't load.

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

### Change a lesson plan or a worksheet

**Files:** `js/content/teachers-basics.js` (lessons 1-6) and `js/content/teachers-deep.js` (7 and on). Each lesson has one block, with an English part (`en`) and a Russian part (`ru`). The header of `js/content/teachers-basics.js` explains every part of a plan and every kind of task.

Change the text in both parts. They must keep the same shape: the same tasks in the same order, and the same number of items in each list, of pairs in a "match" task, of rows in a table and of gaps in [brackets]. A gap's answer goes between the brackets: the worksheet shows an empty line there, and the answer key shows the answer.

The worksheet's last task, the quick quiz (`quiz: ["q14", "q16", "m1"]`), and the plan's exit ticket question (`exit: "q13"`) are only named by their id: their texts are the quiz's, in `js/content/quiz-bank.js`, so a change there shows up in the worksheets too.

**Check:** in "For teachers", open the lesson's plan, worksheet and answer key, in both languages. Press Print and look at the preview: only the sheet, in black on white, with the site's name and the page numbers at the bottom. A worksheet is copied for a whole class, so try to keep it on two pages (one sheet of paper, both sides).


### Add a glossary term

**File:** `js/content/glossary-terms.js`. Put the term in the block of its category: `basics`, `learning`, `vision` (computer vision), `trial` (trial and error), `language` (language models), `generative` or `ethics`. The glossary sorts the cards A–Z by itself, in each language, and every count follows by itself (the subtitle, the chips, the flashcards).

```js
        {
            id: "synthetic-data", cat: "learning", icon: "🧪", lessons: [2], lab: "",
            related: ["data", "dataset", "training", "privacy"],
            en: {
                name: "Synthetic data",
                aliases: ["generated data"],
                short: "Data that a computer program makes up instead of collecting it from the real world.",
                def: "Data that a computer program makes up instead of collecting it from the real world. It is used to train AI when real data is rare, expensive or private.",
                ex: "A self-driving car company can create millions of computer-made street scenes, even rare dangers like a deer on the road at night, to train its AI safely."
            },
            ru: {
                name: "Синтетические данные",
                aliases: ["сгенерированные данные"],
                short: "Данные, которые придумала компьютерная программа, а не собрали в реальном мире.",
                def: "Данные, которые придумала компьютерная программа, а не собрали в реальном мире. На них обучают ИИ, когда настоящих данных мало, они дорогие или личные.",
                ex: "Компания, которая делает беспилотные автомобили, может создать миллионы компьютерных уличных сцен — даже редкие опасности вроде оленя на ночной дороге, — чтобы безопасно обучать свой ИИ."
            }
        },
```

- `id`: a short name in small letters with dashes. It is used in links (`#term-synthetic-data`), in the flashcards and in saved data, so don't change it later.
- `icon`: an emoji that no other term uses.
- `lessons`: the numbers of the lessons that teach it, and `lab`: the AI Lab experiment that shows it (`"classifier"`, `"maze"`, ...) or `""`. The opened card links to them, and the flashcards have a deck for each lesson.
- `related`: the ids of other terms (they become buttons on the card). A relation goes both ways: add `"synthetic-data"` to the `related` of `data`, `dataset`, `training` and `privacy` too.
- `aliases`: other ways to write the term; they are only used by the search. An alias that ends in `*` finds every word that starts like it.
- `short`: the definition in one plain sentence. It is on the card, on the back of a flashcard and in Compass Bot. `def`: the full explanation, shown when the card is opened. `ex`: an everyday example.
- A link may also use a second id for a narrower word: `sameAs` at the top of the file sends it to the term that explains it (`"k-means": "clustering"`).

**Check:** the card is there, and the counts in the subtitle and on the "Learning" chip went up by one; the search finds it by its name and by its alias; open it, follow its lesson link, and click a related term (that card lists it back); `http://localhost:8000/#term-synthetic-data` opens it; ask Compass Bot "what is synthetic data?". Do it again in Russian.

### Add a timeline milestone

**File:** `js/content/timeline.js`. Every date, name and number must be checked in two good sources: the timeline is a history lesson.

**1. The texts**, in both parts (`.year`, `.title`, `.text` and `.why`). Use the next free number in the key. "Why it mattered" is one sentence:

```js
        "timeline.e30.year": "1997",
        "timeline.e30.title": "Neural networks get a longer memory",
        "timeline.e30.text": "Sepp Hochreiter and Jürgen Schmidhuber described LSTM (long short-term memory), a neural network that can keep information over many steps of a sequence. About twenty years later, LSTMs helped phones recognise speech and translate text.",
        "timeline.e30.why": "It made neural networks much better at sequences such as speech and text, long before the Transformer.",
```

```js
        "timeline.e30.year": "1997",
        "timeline.e30.title": "У нейросетей появляется долгая память",
        "timeline.e30.text": "Зепп Хохрайтер и Юрген Шмидхубер описали LSTM («долгая краткосрочная память») — нейросеть, которая удерживает информацию на протяжении многих шагов последовательности. Примерно через двадцать лет LSTM помогали телефонам распознавать речь и переводить тексты.",
        "timeline.e30.why": "Нейросети стали гораздо лучше работать с последовательностями, например с речью и текстом, — задолго до трансформера.",
```

**2. The entry.** At the bottom, in `events`, add a line **where it belongs in time**: the order of the list is the order on the page (the number in the key doesn't matter). This one goes after Deep Blue (`e6`, 1997) and before the robot car race (`e21`, 2005):

```js
        { key: "e6", era: "ups", icon: "♟️", datetime: "1997", major: true, themes: ["games"], terms: ["algorithm"], lesson: 1 },
        { key: "e30", era: "ups", icon: "🧵", datetime: "1997", themes: ["learning", "language"], terms: ["neural-network"], lesson: 3 },
        { key: "e21", era: "ups", icon: "🚗", datetime: "2005", themes: ["robots"], terms: ["robot", "computer-vision"], lesson: 5 },
```

- `era`: `"early"`, `"ups"`, `"deep"` or `"gen"`.
- `datetime`: the year, or `""` when the milestone is not one year (like "1970s–80s").
- `major: true`: shown in full. Leave it out and the milestone starts folded (its year and title; a click opens it). Keep about 3 main ones per era, so the page stays short on a phone.
- `themes`: the theme chips that show it (`learning`, `games`, `language`, `images`, `robots`, `science`, `society`).
- `terms`: glossary ids; each becomes an "In the glossary" button (an id the glossary doesn't have yet is left out).
- `lesson`, `lab`: the lesson number and the AI Lab experiment that teach the idea (left out when there is none). The link appears once the site has that lesson or experiment.

**Check:** the milestone sits between 1997 and 2005, folded; "Open all" in "Ups & downs" counts one more; the "Ups & downs", "Learning" and "Language" chips count it; open it: its lesson link and its glossary button work. Do it again in Russian.

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

Example: "Glossary: a random term". In `js/glossary.js`, section 19, after the loop that adds one command per term:

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

### Add an AI Lab experiment

An experiment is three files of its own and a few lines in `js/content/lab.js`. The lab loads an experiment's files the first time it opens, so `index.html` doesn't list them. Before you start, read the header of `js/lab.js` (what the lab gives an experiment and what it expects back) and "The kit at a glance" at the top of `js/lab/kit.js`.

**1. Copy the sample.** "Guess the line" is a small, complete experiment made of kit parts. Copy its three files, named with your experiment's id (small letters, digits and "-"), for example `spam`:

| Copy | to |
| --- | --- |
| `js/lab/sample.js` | `js/lab/spam.js` |
| `css/lab/sample.css` | `css/lab/spam.css` |
| `js/content/lab/sample.js` | `js/content/lab/spam.js` |

In the copies, replace `sample` with `spam` (in `A.lab.define("spam", ...)` and in every `lab.sample.` text key), and the class prefix `smp-` with a short prefix of your own. Then turn the copy into your experiment, step by step. Keep what the lab relies on: `create(stage, ctx)` builds everything inside `stage` and returns `{ pause, resume, language, theme, destroy }`, and `destroy()` stops every loop and listener.

**2. Its name in the picker.** The picker shows an experiment's title, a one-line hook and its big idea before its files load, so these three texts go in `js/content/lab.js`, section 3, instead of the experiment's own text file. Move them there, in both parts:

```js
        "lab.spam.title": "Spam filter",
        "lab.spam.hook": "Mark a few messages as spam, and watch a filter learn which words give them away.",
        "lab.spam.idea": "Probability",
```

```js
        "lab.spam.title": "Спам-фильтр",
        "lab.spam.hook": "Отметь несколько сообщений как спам и посмотри, как фильтр учится узнавать их по словам.",
        "lab.spam.idea": "Вероятность",
```

(Mind the commas: every line of a part ends with one, except the last.)

**3. Its icon.** In section 4, add a `<symbol>` to the sprite. Draw it like the others (24 × 24, lines of 1.75 px in `currentColor`), with a comment that says what it shows:

```js
        // An envelope
        '<symbol id="lab-icon-spam" viewBox="0 0 24 24">' +
            '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
                '<rect x="3" y="5" width="18" height="14" rx="2"/>' +
                '<path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>' +
            '</g>' +
        '</symbol>' +
```

(The pieces are joined with `+`: the last `'</symbol>'` of the sprite has none.)

**4. Its place in the lab.** In section 5, add one entry to the catalogue, at its place on the learning path (first steps, networks, language, vision, learning by reward, evolution, ethics). Mind the commas between the entries:

```js
    {
        id: "spam",
        icon: "lab-icon-spam",
        titleKey: "lab.spam.title",
        hookKey: "lab.spam.hook",
        ideaKey: "lab.spam.idea",
        level: 1,
        emoji: "📨",
        keywords: "lab spam filter email messages probability лаборатория спам фильтр почта сообщения вероятность"
    },
```

The picker, the numbers of experiments on the page, the Ctrl+K command and the link `#lab/spam` all come from this entry.

**5. The first paint.** The page counts the experiments by itself, but before the scripts run it shows what `index.html` says. There, add one to the hero's number of experiments (`data-count` and the number after it) and to the number in the lab's subtitle.

**6. Its height while it loads (optional).** Until an experiment's files arrive, the lab keeps a box of about its height, so the page below doesn't jump; without your numbers, it keeps a default height. Open your experiment and run this in the console (F12):

```js
[document.querySelector('[data-feature="lab"]').offsetHeight, document.querySelector(".lab-stage").offsetHeight]
```

In `css/lab.css`, section 1, copy the two rules of another experiment (`[data-lab-last="maze"]` and `[data-loading="maze"]`), with your id and these two numbers (the card, then the stage), rounded up. Section 8 has the same rules for smaller screens: measure again at those widths (the device toolbar, Ctrl+Shift+M) and add yours there too.

**Check:** go to `http://localhost:8000/#lab/spam`: your experiment opens, with its icon and title above it. Close it: its card is in the grid, with the hook and the idea, and the subtitle counts one more experiment. Ctrl+K finds it by its title. While it is open, switch the language, the theme and calm mode: it follows. Open another experiment and come back: nothing appears twice, and the console has no red errors.


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
- **Font sizes in rem** (px ÷ 16: `0.875rem` is 14 px), so the text size setting reaches them. Only a letter or an emoji in a box of fixed size keeps px, with the comment `/* px: a glyph in a tile of fixed size */`.
- **A new keyboard shortcut** goes into the list at the end of `js/content/settings.js`, so the `?` window shows it.
- **No libraries, no build step, no `import` / `export`.** Every script is a plain `<script defer>` in `index.html`.


## Before you merge: a test checklist

Open the site on a local server and go through this list for the parts you changed:

- [ ] **Both languages.** Switch with the RU / EN button. Every new text changes, and no English is left on the Russian page.
- [ ] **Both themes.** Switch light / dark. Everything is readable; nothing disappears.
- [ ] **A phone.** In the browser's developer tools (F12), turn on the device toolbar (Ctrl+Shift+M) and pick a width of 360 px. Nothing sticks out to the side, and the menu works.
- [ ] **Keyboard only.** Put the mouse away. Tab reaches every button and you can see where the focus is; Enter and Space work; Esc closes the lesson reader, Compass Bot and the palette; Ctrl+K opens the palette.
- [ ] **Bigger text.** Open Settings (the gear in the menu) and choose the biggest text size. At 360 px, nothing sticks out to the side and no word is cut.
- [ ] **Calm mode.** Press Ctrl+K and run "Calm mode: pause animations". Nothing big moves any more, and everything still works. Run it again to turn the animations back on.
- [ ] **Printing** (the teacher kit). Open a lesson plan or a worksheet from "For teachers" and press Print: the preview shows only the sheet, in black on white, in both themes.
- [ ] **The console.** Press F12, open Console and reload: no red errors.
- [ ] **Links into the page.** `#lesson-4`, `#term-bias` and `#quiz` at the end of the address open the right place.
- [ ] **Saved progress.** Finish a lesson, change the language and the theme, reload: everything is remembered.
- [ ] **Offline** (if you added a file to `index.html`, or a file loaded on demand: list that one with `A.keepOffline`). Load the page, wait a few seconds, then in F12 → Network tick "Offline" and reload: everything still works, also the parts you didn't open.
- [ ] **Printing** (if you changed a layout). Ctrl+P: the preview is black on white, and an open lesson prints as a handout.


## Credits

AI Compass is a CAS (Creativity, Activity, Service) project made by two students. The code was written with Claude, Anthropic's AI assistant; the students plan the site, check the facts, test it and look after it.
