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
        "lab.maze.idea": "Reinforcement learning",

        "lab.evolve.title": "Evolution garage",
        "lab.evolve.hook": "These cars start out crashing. Watch good driving evolve, generation after generation.",
        "lab.evolve.idea": "Learning by evolution",

        "lab.chatbot.title": "Inside a chatbot",
        "lab.chatbot.hook": "See what a chatbot does with your words: tokens, meanings, attention and weighted dice.",
        "lab.chatbot.idea": "Large language models",

        "lab.draw.title": "Draw and teach",
        "lab.draw.hook": "Teach the computer your own drawings, then test it on new ones.",
        "lab.draw.idea": "Training data and generalisation",

        "lab.descent.title": "Down the hill: gradient descent",
        "lab.descent.hook": "Race three balls down a hill of error, and see why the size of each step decides everything.",
        "lab.descent.idea": "Gradient descent: how models learn",

        "lab.vision.title": "How computers see",
        "lab.vision.hook": "Slide a 3\u00a0×\u00a03 filter over a picture: it finds edges, blurs and sharpens. Then look through the eyes of a tiny neural network.",
        "lab.vision.idea": "Convolution: how computers find edges and shapes"
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
        "lab.maze.idea": "Обучение с подкреплением",

        "lab.evolve.title": "Гараж эволюции",
        "lab.evolve.hook": "Сначала машинки врезаются в стены. Смотри, как вождение улучшается с каждым поколением.",
        "lab.evolve.idea": "Обучение эволюцией",

        "lab.chatbot.title": "Внутри чат-бота",
        "lab.chatbot.hook": "Посмотри, что чат-бот делает с твоими словами: токены, смыслы, внимание и взвешенные кубики.",
        "lab.chatbot.idea": "Большие языковые модели",

        "lab.draw.title": "Нарисуй и научи",
        "lab.draw.hook": "Научи компьютер узнавать твои рисунки — а потом проверь его на новых.",
        "lab.draw.idea": "Обучающие данные и обобщение",

        "lab.descent.title": "Вниз с горы: градиентный спуск",
        "lab.descent.hook": "Устрой гонку трёх шариков вниз по склону ошибки и узнай, почему всё решает размер шага.",
        "lab.descent.idea": "Градиентный спуск: как учатся модели",

        "lab.vision.title": "Как видит компьютер",
        "lab.vision.hook": "Проведи фильтром 3\u00a0×\u00a03 по картинке: он находит края, размывает и добавляет резкость. А потом посмотри глазами маленькой нейросети.",
        "lab.vision.idea": "Свёртка: как компьютер находит края и формы"
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
        '</symbol>' +
        // A strand of DNA: two lines that twist around each other, with rungs between them
        '<symbol id="lab-icon-evolve" viewBox="0 0 24 24">' +
            '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M7 3c0 4.5 10 4.5 10 9s-10 4.5-10 9"/>' +
                '<path d="M17 3c0 4.5-10 4.5-10 9s10 4.5 10 9"/>' +
                '<path d="M8.5 5h7M8.5 19h7M8 12h8"/>' +
            '</g>' +
        '</symbol>' +
        // A speech bubble with three token chips in a row inside it
        '<symbol id="lab-icon-chatbot" viewBox="0 0 24 24">' +
            '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4.5 3.5V17H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>' +
                '<rect x="6" y="9" width="3.4" height="3" rx="1"/>' +
                '<rect x="10.3" y="9" width="3.4" height="3" rx="1"/>' +
                '<rect x="14.6" y="9" width="3.4" height="3" rx="1"/>' +
            '</g>' +
        '</symbol>' +
        // A pencil, and the pixels its line becomes
        '<symbol id="lab-icon-draw" viewBox="0 0 24 24">' +
            '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M9.6 14.4l.6-3.4 8.1-8.1a1.9 1.9 0 0 1 2.8 2.8L13 13.8z"/>' +
                '<path d="M10.2 11l2.8 2.8"/>' +
            '</g>' +
            '<rect x="6.2" y="15.3" width="3" height="3" rx=".6" fill="currentColor"/>' +
            '<rect x="3" y="15.3" width="3" height="3" rx=".6" fill="currentColor"/>' +
            '<rect x="3" y="18.5" width="3" height="3" rx=".6" fill="currentColor" opacity=".5"/>' +
        '</symbol>' +
        // A valley, a ball on its left wall, and an arrow down the slope
        '<symbol id="lab-icon-descent" viewBox="0 0 24 24">' +
            '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M3 4c1.6 9.5 4.6 15 9 15s7.4-5.5 9-15"/>' +
                '<path d="M12 9.4c.9 1.7 1.6 3.5 1.9 5.5M12.3 13.4l1.6 1.5 1.3-1.8"/>' +
            '</g>' +
            '<circle cx="7.75" cy="10.4" r="2.2" fill="currentColor"/>' +
        '</symbol>' +
        // An eye inside a camera's frame; its pupil is one square pixel
        '<symbol id="lab-icon-vision" viewBox="0 0 24 24">' +
            '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M3 7.5V5a2 2 0 0 1 2-2h2.5M16.5 3H19a2 2 0 0 1 2 2v2.5M21 16.5V19a2 2 0 0 1-2 2h-2.5M7.5 21H5a2 2 0 0 1-2-2v-2.5"/>' +
                '<path d="M6 12c1.5-2.8 3.7-4.3 6-4.3s4.5 1.5 6 4.3c-1.5 2.8-3.7 4.3-6 4.3S7.5 14.8 6 12z"/>' +
            '</g>' +
            '<rect x="10.25" y="10.25" width="3.5" height="3.5" rx=".6" fill="currentColor"/>' +
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
        id: "draw",
        icon: "lab-icon-draw",
        titleKey: "lab.draw.title",
        hookKey: "lab.draw.hook",
        ideaKey: "lab.draw.idea",
        level: 1,
        emoji: "✏️",
        keywords: "lab draw and teach drawing doodle sketch picture image recognition classifier classes training data examples test generalisation generalization overfitting mnist pixels nearest neighbours k-nn neural network focus лаборатория нарисуй и научи рисунок рисовать картинка изображение распознавание классификатор классы обучающие данные примеры тест обобщение переобучение пиксели ближайшие соседи нейросеть"
    },
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
        id: "descent",
        icon: "lab-icon-descent",
        titleKey: "lab.descent.title",
        hookKey: "lab.descent.hook",
        ideaKey: "lab.descent.idea",
        level: 3,
        emoji: "⛰️",
        keywords: "lab down the hill gradient descent loss error slope gradient learning rate step size optimizer momentum adam local minimum saddle point landscape valley ball training parameters лаборатория вниз с горы градиентный спуск ошибка функция потерь склон градиент скорость обучения размер шага оптимизатор импульс адам локальный минимум седловая точка ландшафт долина шарик обучение параметры"
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
        id: "chatbot",
        icon: "lab-icon-chatbot",
        titleKey: "lab.chatbot.title",
        hookKey: "lab.chatbot.hook",
        ideaKey: "lab.chatbot.idea",
        level: 3,
        emoji: "🔍",
        keywords: "lab inside a chatbot chatgpt chat bot language model llm gpt transformer token tokens tokenizer bpe byte pair encoding embedding embeddings word vectors meaning attention context next word temperature top-k top-p sampling probability лаборатория внутри чат-бота чат-бот языковая модель трансформер токен токены токенизатор эмбеддинг векторы смысл внимание контекст следующее слово температура вероятность"
    },
    {
        id: "vision",
        icon: "lab-icon-vision",
        titleKey: "lab.vision.title",
        hookKey: "lab.vision.hook",
        ideaKey: "lab.vision.idea",
        level: 2,
        emoji: "👁️",
        keywords: "lab how computers see computer vision convolution filter kernel edges edge detection blur sharpen emboss sobel pixels picture image photo relu max pooling cnn convolutional neural network feature map лаборатория как видит компьютер компьютерное зрение свёртка фильтр ядро края границы размытие резкость тиснение пиксели картинка изображение фото пулинг свёрточная нейросеть карта признаков"
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
    },
    {
        id: "evolve",
        icon: "lab-icon-evolve",
        titleKey: "lab.evolve.title",
        hookKey: "lab.evolve.hook",
        ideaKey: "lab.evolve.idea",
        level: 2,
        emoji: "🧬",
        keywords: "lab evolution evolve garage cars driving neuroevolution genetic algorithm mutation crossover generation fitness natural selection neural network лаборатория эволюция гараж машинки вождение нейроэволюция генетический алгоритм мутация скрещивание поколение приспособленность естественный отбор нейросеть"
    }
]);
