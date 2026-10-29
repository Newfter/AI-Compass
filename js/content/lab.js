/* =========================================================
   AI COMPASS — TEXTS: THE AI LAB (the section and its hub)
   Every word of the lab's section and hub in English and in Russian
   (informal "ты"), the catalogue of experiments and their icons.
   Used by js/lab.js (and the lab section of index.html).
   Each experiment has its own texts in js/content/lab/<id>.js, loaded
   with it; only what the picker and the Ctrl+K palette show before an
   experiment opens (its title, hook and big idea) lives here.
   To change a text, change it here (in both languages).
   Sections:
    1. The section on the page
    2. The hub: picker, header, loading, errors, commands
    3. The experiments' names in the picker
    4. The icons (an SVG sprite)
    5. The catalogue: which experiments, in which order
   ========================================================= */

/* ===== 1. THE SECTION ON THE PAGE (index.html) =====
   The subtitle says how many experiments there are: {n} comes from the
   catalogue below (js/lab.js registers it as the text value "labExperimentCount").
   "lab.subtitle" alone is the fallback without a number. */
window.AICompass.addTranslations({
    en: {
        "lab.label": "HANDS-ON EXPERIMENTS",
        "lab.title": "The AI Lab",
        "lab.subtitle": "Real machine learning, running right here in your browser. Teach a model, test it, and watch it think.",
        "lab.subtitle.one": "{n} real machine-learning experiment, running right here in your browser. Teach a model, test it, and watch it think.",
        "lab.subtitle.many": "{n} real machine-learning experiments, running right here in your browser. Teach a model, test it, and watch it think."
    },
    ru: {
        "lab.label": "ЭКСПЕРИМЕНТЫ СВОИМИ РУКАМИ",
        "lab.title": "ИИ-лаборатория",
        "lab.subtitle": "Настоящее машинное обучение прямо в твоём браузере. Обучи модель, проверь её и посмотри, как она «думает».",
        "lab.subtitle.one": "{n} настоящий эксперимент с машинным обучением прямо в твоём браузере. Обучи модель, проверь её и посмотри, как она «думает».",
        "lab.subtitle.few": "{n} настоящих эксперимента с машинным обучением прямо в твоём браузере. Обучи модель, проверь её и посмотри, как она «думает».",
        "lab.subtitle.many": "{n} настоящих экспериментов с машинным обучением прямо в твоём браузере. Обучи модель, проверь её и посмотри, как она «думает»."
    }
});

/* ===== 2. THE HUB: PICKER, HEADER, LOADING, ERRORS, COMMANDS ===== */
window.AICompass.addTranslations({
    en: {
        // The picker: a grid of experiment cards (a rail while one is open)
        "lab.hub.pickerLabel": "Choose an experiment",
        "lab.live": "RUNS 100% IN YOUR BROWSER",
        "lab.hub.levelWord": "Level",
        "lab.hub.level1": "Level 1 of 3",
        "lab.hub.level2": "Level 2 of 3",
        "lab.hub.level3": "Level 3 of 3",
        "lab.hub.stateNew": "New",
        "lab.hub.stateTried": "Tried",
        // {done} of {total} "Try this" challenges done; {challenges} is the word that suits {total}
        "lab.hub.stateChallenges": "{done} / {total} {challenges}",
        "lab.hub.pluralChallenges": "challenge|challenges",

        // The header above an open experiment
        "lab.hub.all": "All experiments",
        "lab.hub.prev": "Previous experiment: {title}",
        "lab.hub.next": "Next experiment: {title}",
        "lab.hub.prevNone": "This is the first experiment",
        "lab.hub.nextNone": "This is the last experiment",

        // Loading, errors, links
        "lab.hub.loading": "Loading the experiment…",
        "lab.hub.errorTitle": "This experiment didn't load",
        "lab.hub.errorText": "Check your internet connection, then try again.",
        "lab.hub.retry": "Try again",
        "lab.hub.opened": "Opened: {title}",
        // A link like #lab/something names no experiment: {id} is that name
        "lab.hub.unknown": "There's no experiment called “{id}”. Here are all of them.",

        // Command palette: one command per experiment
        "lab.cmdGroup": "AI Lab",
        "lab.cmdOpen": "Open lab: {title}"
    },
    ru: {
        "lab.hub.pickerLabel": "Выбери эксперимент",
        "lab.live": "РАБОТАЕТ ПРЯМО В ТВОЁМ БРАУЗЕРЕ",
        "lab.hub.levelWord": "Уровень",
        "lab.hub.level1": "Уровень 1 из 3",
        "lab.hub.level2": "Уровень 2 из 3",
        "lab.hub.level3": "Уровень 3 из 3",
        "lab.hub.stateNew": "Новый",
        "lab.hub.stateTried": "Знакомый",
        "lab.hub.stateChallenges": "{done} / {total} {challenges}",
        "lab.hub.pluralChallenges": "задание|задания|заданий",

        "lab.hub.all": "Все эксперименты",
        "lab.hub.prev": "Предыдущий эксперимент: {title}",
        "lab.hub.next": "Следующий эксперимент: {title}",
        "lab.hub.prevNone": "Это первый эксперимент",
        "lab.hub.nextNone": "Это последний эксперимент",

        "lab.hub.loading": "Загружаю эксперимент…",
        "lab.hub.errorTitle": "Эксперимент не загрузился",
        "lab.hub.errorText": "Проверь подключение к интернету и попробуй ещё раз.",
        "lab.hub.retry": "Попробовать ещё раз",
        "lab.hub.opened": "Открыт эксперимент: {title}",
        "lab.hub.unknown": "Эксперимента «{id}» не нашлось. Вот все эксперименты лаборатории.",

        "lab.cmdGroup": "ИИ-лаборатория",
        "lab.cmdOpen": "Открыть в лаборатории: {title}"
    }
});

/* ===== 3. THE EXPERIMENTS' NAMES IN THE PICKER =====
   For each experiment of the catalogue: its title, a one-line hook that makes
   you want to try it, and its big idea (the tag on its card). */
window.AICompass.addTranslations({
    en: {
        "lab.classifier.title": "Teach the machine",
        "lab.classifier.hook": "Place dots, press Train, and watch a neural network learn to tell them apart.",
        "lab.classifier.idea": "Neural networks",

        "lab.predictor.title": "Next-word predictor",
        "lab.predictor.hook": "Type a few words and see how a tiny language model guesses what comes next.",
        "lab.predictor.idea": "Language models",

        "lab.maze.title": "Robot in a maze",
        "lab.maze.hook": "Nobody shows the robot the way. Watch it learn from rewards and penalties.",
        "lab.maze.idea": "Reinforcement learning"
    },
    ru: {
        "lab.classifier.title": "Обучи машину",
        "lab.classifier.hook": "Расставь точки, нажми «Обучать» и смотри, как нейросеть учится их различать.",
        "lab.classifier.idea": "Нейросети",

        "lab.predictor.title": "Предсказатель слов",
        "lab.predictor.hook": "Напиши пару слов и посмотри, как крошечная языковая модель угадывает следующее.",
        "lab.predictor.idea": "Языковые модели",

        "lab.maze.title": "Робот в лабиринте",
        "lab.maze.hook": "Никто не показывает роботу дорогу. Смотри, как он учится на наградах и штрафах.",
        "lab.maze.idea": "Обучение с подкреплением"
    }
});

/* ===== 4. THE ICONS (an SVG sprite) =====
   One <symbol> per experiment, drawn like the site's other line icons:
   24 x 24, strokes of 1.75 px in currentColor (the card gives the colour).
   js/lab.js puts the sprite in the lab's card once; a catalogue entry names
   its symbol in "icon". */
window.AICompass.content.set("lab.icons", {
    sprite:
        // A tiny neural network: 2 inputs, 2 hidden neurons, 1 output
        '<symbol id="lab-icon-network" viewBox="0 0 24 24">' +
            '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="4.5" cy="7" r="2"/><circle cx="4.5" cy="17" r="2"/>' +
                '<circle cx="12" cy="7" r="2"/><circle cx="12" cy="17" r="2"/>' +
                '<circle cx="19.5" cy="12" r="2"/>' +
                '<path d="M6.5 7H10M6.5 17H10M5.7 8.6l5.1 6.8M5.7 15.4l5.1-6.8M13.7 8.1l4.1 2.8M13.7 15.9l4.1-2.8"/>' +
            '</g>' +
        '</symbol>' +
        // A speech bubble with a sentence that goes on: the next word is a cursor
        '<symbol id="lab-icon-words" viewBox="0 0 24 24">' +
            '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M6 4h12a3 3 0 0 1 3 3v6.5a3 3 0 0 1-3 3h-6.5L7 20v-3.5H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"/>' +
                '<path d="M7.5 8.75h5.5M7.5 12.25h3"/>' +
                '<path d="M14 11v2.75"/>' +
            '</g>' +
        '</symbol>' +
        // A 3 x 3 maze: the robot (a dot) bottom left, the battery (a ring) top right
        '<symbol id="lab-icon-maze" viewBox="0 0 24 24">' +
            '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
                '<rect x="3" y="3" width="18" height="18" rx="3"/>' +
                '<path d="M9 3v6h6M3 15h6M15 15v6"/>' +
                '<circle cx="18" cy="6" r="1.5"/>' +
            '</g>' +
            '<circle cx="6" cy="18" r="1.6" fill="currentColor"/>' +
        '</symbol>'
});

/* ===== 5. THE CATALOGUE: WHICH EXPERIMENTS, IN WHICH ORDER =====
   The order is a learning path: first steps, then networks, language, vision,
   learning by reward, evolution, and ethics. The picker, the hero's number,
   the section's subtitle, the Ctrl+K commands, Compass Bot and links like
   #lab/predictor all come from this one list.
   ADDING AN EXPERIMENT: put its files in place (js/lab/<id>.js, css/lab/<id>.css,
   js/content/lab/<id>.js), add its title, hook and idea in section 3 above, and
   add ONE entry to this list, at its place on the path. Each entry:
     id          its name in its files and in links (#lab/<id>): small letters, digits, "-"
     icon        a symbol of the sprite in section 4
     titleKey    its name;  hookKey: one line that makes you want to try it;
     ideaKey     its big idea (the tag on its card)
     level       1 (first steps), 2 or 3 (advanced): the dots on its card
     emoji       its icon in the Ctrl+K palette
     keywords    more words the palette finds it by (both languages) */
window.AICompass.content.set("lab.catalogue", [
    {
        id: "classifier",
        icon: "lab-icon-network",
        titleKey: "lab.classifier.title",
        hookKey: "lab.classifier.hook",
        ideaKey: "lab.classifier.idea",
        level: 2,
        emoji: "🧠",
        keywords: "lab neural network train teach classifier dots points machine learning лаборатория нейросеть нейронная сеть обучить обучение машина точки классификатор"
    },
    {
        id: "predictor",
        icon: "lab-icon-words",
        titleKey: "lab.predictor.title",
        hookKey: "lab.predictor.hook",
        ideaKey: "lab.predictor.idea",
        level: 1,
        emoji: "💬",
        keywords: "lab next word predictor language model chatbot text autocomplete gpt лаборатория следующее слово предсказатель языковая модель чат-бот текст автодополнение"
    },
    {
        id: "maze",
        icon: "lab-icon-maze",
        titleKey: "lab.maze.title",
        hookKey: "lab.maze.hook",
        ideaKey: "lab.maze.idea",
        level: 2,
        emoji: "🤖",
        keywords: "lab maze robot reinforcement learning q-learning reward penalty trial and error agent лаборатория лабиринт робот обучение с подкреплением q-обучение награда штраф пробы ошибки агент"
    }
]);
