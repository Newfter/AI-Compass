/* =========================================================
   AI COMPASS — TEXTS AND DATA: GLOSSARY
   Every word in English and in Russian (informal "ты"),
   then the categories and the terms themselves (at the bottom).
   Used by js/glossary.js (and the glossary section of index.html).
   To change a text, change it here (in both languages).
   ========================================================= */

// The section's title and subtitle on the page (index.html)
window.AICompass.addTranslations({
    en: {
        "glossary.label": "SPEAK THE LANGUAGE",
        "glossary.title": "AI Glossary",
        "glossary.subtitle": "The key words of Artificial Intelligence, explained simply."
    },
    ru: {
        "glossary.label": "ГОВОРИ НА ЯЗЫКЕ ИИ",
        "glossary.title": "Словарь ИИ",
        "glossary.subtitle": "Главные слова искусственного интеллекта простыми словами."
    }
});

// The glossary's own texts
window.AICompass.addTranslations({
    en: {
        // The search box and the buttons next to it
        "glossary.kicker": "Bilingual AI dictionary",
        "glossary.searchLabel": "Search the glossary",
        "glossary.searchPlaceholder": "Search, e.g. “bias” or “robot”",
        "glossary.searchPlaceholderShort": "Search terms…",
        "glossary.searchHint": "Results update as you type. Press Enter to open the first result, or Escape to clear the search.",
        "glossary.clear": "Clear search",
        "glossary.random": "Random term",
        "glossary.randomLabel": "Show a random term",
        "glossary.randomAnnounce": "Random term: {term}",

        // Filters: category chips and the alphabet strip
        "glossary.filters": "Filters",
        "glossary.filtersActive": "active filters:",
        "glossary.catsLabel": "Filter by category",
        "glossary.cat.all": "All",
        "glossary.cat.basics": "Basics",
        "glossary.cat.learning": "Learning",
        "glossary.cat.generative": "Generative AI",
        "glossary.cat.ethics": "Ethics & Safety",
        "glossary.lettersLabel": "Filter by first letter",
        "glossary.lettersAll": "A–Z",
        "glossary.lettersAllLabel": "All letters",
        "glossary.letterLabel": "Terms starting with {letter}",

        // Counts, progress and the reset button ({n} and {total} come from js/glossary.js)
        "glossary.count.one": "Showing {n} of {total} terms",
        "glossary.count.many": "Showing {n} of {total} terms",
        "glossary.explored": "Explored",
        "glossary.exploredLabel": "Terms you have opened: {n} of {total}",
        "glossary.exploredBadge": "You have already explored this term",
        "glossary.allExplored": "Every glossary term explored — great work!",
        "glossary.reset": "Reset filters",

        // The term cards
        "glossary.gridLabel": "Glossary terms",
        "glossary.more": "Example & related",
        "glossary.moreLabel": "Example & related: {term}",
        "glossary.example": "Everyday example",
        "glossary.related": "Related terms",
        "glossary.altCode": "RU",
        "glossary.altLabel": "In Russian:",

        // When nothing is found
        "glossary.emptyQuery": "Nothing found for “{query}”",
        "glossary.emptyFilters": "No terms match these filters",
        "glossary.emptyHint": "Try another word, check the spelling or reset the filters.",
        "glossary.suggest": "Did you mean:",

        // The "show all" button under the cards
        "glossary.showAll.one": "Show all {n} terms",
        "glossary.showAll.many": "Show all {n} terms",
        "glossary.showLess": "Show fewer terms",

        // Command palette (Ctrl+K): one command per term
        "glossary.cmdGroup": "Glossary",
        "glossary.cmdTitle": "Glossary: {term}"
    },
    ru: {
        // The search box and the buttons next to it
        "glossary.kicker": "Двуязычный словарь ИИ",
        "glossary.searchLabel": "Поиск по словарю",
        "glossary.searchPlaceholder": "Например, «нейросеть»",
        "glossary.searchPlaceholderShort": "Найти термин…",
        "glossary.searchHint": "Результаты обновляются, пока ты печатаешь. Нажми Enter, чтобы открыть первый результат, или Escape, чтобы очистить поиск.",
        "glossary.clear": "Очистить поиск",
        "glossary.random": "Случайный термин",
        "glossary.randomLabel": "Показать случайный термин",
        "glossary.randomAnnounce": "Случайный термин: {term}",

        // Filters: category chips and the alphabet strip
        "glossary.filters": "Фильтры",
        "glossary.filtersActive": "включено фильтров:",
        "glossary.catsLabel": "Фильтр по категориям",
        "glossary.cat.all": "Все",
        "glossary.cat.basics": "Основы",
        "glossary.cat.learning": "Обучение",
        "glossary.cat.generative": "Генеративный ИИ",
        "glossary.cat.ethics": "Этика и безопасность",
        "glossary.lettersLabel": "Фильтр по первой букве",
        "glossary.lettersAll": "А–Я",
        "glossary.lettersAllLabel": "Все буквы",
        "glossary.letterLabel": "Термины на букву {letter}",

        // Counts, progress and the reset button ({n} and {total} come from js/glossary.js)
        "glossary.count.one": "Показан {n} термин из {total}",
        "glossary.count.few": "Показано {n} термина из {total}",
        "glossary.count.many": "Показано {n} терминов из {total}",
        "glossary.explored": "Изучено",
        "glossary.exploredLabel": "Открытые тобой термины: {n} из {total}",
        "glossary.exploredBadge": "Этот термин уже изучен",
        "glossary.allExplored": "Все термины словаря изучены — отличная работа!",
        "glossary.reset": "Сбросить фильтры",

        // The term cards
        "glossary.gridLabel": "Термины словаря",
        "glossary.more": "Пример и связанные термины",
        "glossary.moreLabel": "Пример и связанные термины: {term}",
        "glossary.example": "Пример из жизни",
        "glossary.related": "Связанные термины",
        "glossary.altCode": "EN",
        "glossary.altLabel": "По-английски:",

        // When nothing is found
        "glossary.emptyQuery": "По запросу «{query}» ничего не найдено",
        "glossary.emptyFilters": "С такими фильтрами терминов нет",
        "glossary.emptyHint": "Попробуй другое слово, проверь написание или сбрось фильтры.",
        "glossary.suggest": "Возможно, имелось в виду:",

        // The "show all" button under the cards
        "glossary.showAll.one": "Показать все {n} термин",
        "glossary.showAll.few": "Показать все {n} термина",
        "glossary.showAll.many": "Показать все {n} терминов",
        "glossary.showLess": "Показать меньше терминов",

        // Command palette (Ctrl+K): one command per term
        "glossary.cmdGroup": "Словарь",
        "glossary.cmdTitle": "Словарь: {term}"
    }
});

// The categories (in the order of their chips) and the terms
// (js/glossary.js reads them with AICompass.content.get("glossary")).
// Every category has its name above: "glossary.cat.basics", ...
window.AICompass.content.set("glossary", {
    categories: ["basics", "learning", "generative", "ethics"],

    // id: short name used in code and links (#term-ai). cat: its category.
    // icon: the emoji on its card. related: the ids of other terms.
    // en / ru: the term in each language. name: as shown (an abbreviation in brackets
    // can be searched too). aliases: other ways to write it, only used for searching
    // (never shown). An alias ending in "*" matches any word that starts like it.
    // def: the definition. ex: an everyday example.
    terms: [
        // ===== Basics =====
        {
            id: "ai", cat: "basics", icon: "🤖", related: ["ml", "algorithm", "agi", "turing-test"],
            en: {
                name: "Artificial intelligence (AI)",
                aliases: ["artificial intelligence"],
                def: "Computer systems that can do tasks that usually need human intelligence, such as understanding language, recognising images, making decisions or solving problems.",
                ex: "Your phone unlocking when it recognises your face, or a map app finding the fastest way home: both are examples of AI."
            },
            ru: {
                name: "Искусственный интеллект (ИИ)",
                aliases: ["искусственный интеллект"],
                def: "Компьютерные системы, которые выполняют задачи, обычно требующие человеческого интеллекта: понимают речь, узнают изображения, принимают решения и решают проблемы.",
                ex: "Телефон, который разблокируется, узнав твоё лицо, или навигатор, который ищет самый быстрый путь домой, — это примеры ИИ."
            }
        },
        {
            id: "algorithm", cat: "basics", icon: "📋", related: ["ai", "model", "data"],
            en: {
                name: "Algorithm",
                aliases: [],
                def: "A clear, step-by-step set of instructions for solving a problem or doing a task. A computer follows an algorithm exactly, one step at a time.",
                ex: "A pancake recipe is an algorithm for people. A video app uses algorithms to decide which video to show you next."
            },
            ru: {
                name: "Алгоритм",
                aliases: [],
                def: "Чёткая пошаговая инструкция для решения задачи. Компьютер выполняет алгоритм точно, шаг за шагом.",
                ex: "Рецепт блинов — это алгоритм для человека. А видеосервис с помощью алгоритмов решает, какое видео показать тебе следующим."
            }
        },
        {
            id: "data", cat: "basics", icon: "📊", related: ["dataset", "training", "privacy"],
            en: {
                name: "Data",
                aliases: [],
                def: "Facts and information a computer can store and use: numbers, words, pictures, sounds, clicks and much more. AI learns from data.",
                ex: "Every photo you take, every song you skip and every step your phone counts is data."
            },
            ru: {
                name: "Данные",
                aliases: [],
                def: "Факты и информация, которые компьютер может хранить и использовать: числа, слова, картинки, звуки, клики и многое другое. ИИ учится на данных.",
                ex: "Каждое твоё фото, каждая пропущенная песня и каждый шаг, который считает телефон, — это данные."
            }
        },
        {
            id: "dataset", cat: "basics", icon: "🗂️", related: ["data", "training", "supervised", "bias"],
            en: {
                name: "Dataset",
                aliases: ["data set", "training data"],
                def: "A large, organised collection of examples used to train or test an AI model, for example thousands of labelled photos.",
                ex: "To teach an AI to spot cats, researchers might collect a dataset of 100,000 photos, each labelled “cat” or “not a cat”."
            },
            ru: {
                name: "Набор данных (датасет)",
                aliases: ["обучающие данные", "обучающая выборка"],
                def: "Большая упорядоченная коллекция примеров, на которой обучают или проверяют модель ИИ, например тысячи подписанных фотографий.",
                ex: "Чтобы научить ИИ находить кошек, исследователи могут собрать датасет из 100 000 фото с подписями «кошка» или «не кошка»."
            }
        },
        {
            id: "model", cat: "basics", icon: "🧩", related: ["training", "parameters", "algorithm"],
            en: {
                name: "Model",
                aliases: ["AI model"],
                def: "What an AI system becomes after training: a program that has learned patterns from data and uses them to make predictions or create something new.",
                ex: "A spam filter's model has learned what junk mail usually looks like, so it can sort new emails it has never seen before."
            },
            ru: {
                name: "Модель",
                aliases: ["модель ИИ"],
                def: "То, чем становится система ИИ после обучения: программа, которая нашла закономерности в данных и использует их, чтобы делать прогнозы или создавать что-то новое.",
                ex: "Модель спам-фильтра выучила, как обычно выглядит спам, поэтому сортирует даже письма, которых раньше никогда не видела."
            }
        },
        {
            id: "robot", cat: "basics", icon: "🦾", related: ["automation", "computer-vision", "ai"],
            en: {
                name: "Robot",
                aliases: ["robotics"],
                def: "A machine that can sense its surroundings and move or act in the physical world. Some robots use AI, but many simply follow a fixed program.",
                ex: "A robot vacuum cleaner uses its sensors to map your room and steer around the furniture."
            },
            ru: {
                name: "Робот",
                aliases: ["робототехника"],
                def: "Машина, которая может воспринимать окружающий мир и двигаться или действовать в нём. Некоторые роботы используют ИИ, но многие просто выполняют заданную программу.",
                ex: "Робот-пылесос с помощью датчиков составляет карту комнаты и объезжает мебель."
            }
        },
        {
            id: "automation", cat: "basics", icon: "⚙️", related: ["robot", "algorithm", "ai"],
            en: {
                name: "Automation",
                aliases: ["automate", "automated"],
                def: "Using machines or software to do tasks automatically, with little or no human help. AI makes it possible to automate more and more complex tasks.",
                ex: "Self-checkout machines, automatic email replies and factory robots that build cars are all examples of automation."
            },
            ru: {
                name: "Автоматизация",
                aliases: ["автоматически"],
                def: "Использование машин или программ, чтобы задачи выполнялись сами, почти без участия человека. ИИ позволяет автоматизировать всё более сложные задачи.",
                ex: "Кассы самообслуживания, автоответы на письма и роботы, которые собирают машины на заводе, — всё это автоматизация."
            }
        },
        {
            id: "computer-vision", cat: "basics", icon: "👁️", related: ["deep-learning", "neural-network", "deepfake"],
            en: {
                name: "Computer vision",
                aliases: ["image recognition", "face recognition", "facial recognition"],
                def: "The area of AI that helps computers “see”: find and recognise objects, faces, text and movement in photos and videos.",
                ex: "When your gallery app groups photos by the people in them, or a self-driving car spots a pedestrian, that's computer vision."
            },
            ru: {
                name: "Компьютерное зрение",
                aliases: ["распознавание изображений", "распознавание лиц"],
                def: "Область ИИ, которая учит компьютеры «видеть»: находить и узнавать предметы, лица, текст и движение на фото и видео.",
                ex: "Когда галерея в телефоне группирует фото по людям или беспилотный автомобиль замечает пешехода — это компьютерное зрение."
            }
        },
        {
            id: "nlp", cat: "basics", icon: "🗣️", related: ["llm", "chatbot", "token"],
            en: {
                name: "Natural language processing (NLP)",
                aliases: ["natural language", "language processing"],
                def: "The area of AI that works with human language: understanding, translating, summarising and creating text or speech.",
                ex: "Voice assistants, spell-checkers and translation apps all rely on natural language processing."
            },
            ru: {
                name: "Обработка естественного языка (NLP)",
                aliases: ["обработка языка", "естественный язык"],
                def: "Область ИИ, которая работает с человеческим языком: понимает, переводит, кратко пересказывает и создаёт текст или речь.",
                ex: "Голосовые помощники, проверка орфографии и онлайн-переводчики работают благодаря обработке естественного языка."
            }
        },
        {
            id: "turing-test", cat: "basics", icon: "🎭", related: ["ai", "chatbot", "agi"],
            en: {
                name: "Turing test",
                aliases: ["imitation game", "Alan Turing"],
                def: "A test suggested by Alan Turing in 1950: if a person chatting in text can't reliably tell whether they are talking to a machine or a human, the machine passes.",
                ex: "Imagine texting two mystery chat partners: one is a person, the other a computer. If you can't tell which is which, the computer has passed the Turing test."
            },
            ru: {
                name: "Тест Тьюринга",
                aliases: ["игра в имитацию", "Алан Тьюринг"],
                def: "Тест, который Алан Тьюринг предложил в 1950 году: если человек в переписке не может надёжно отличить машину от человека, машина проходит тест.",
                ex: "Представь, что переписываешься с двумя незнакомцами: один — человек, другой — компьютер. Если ты не можешь понять, кто есть кто, компьютер прошёл тест Тьюринга."
            }
        },
        {
            id: "recommendation", cat: "basics", icon: "🎯", related: ["algorithm", "data", "privacy", "bias"],
            en: {
                name: "Recommendation system",
                aliases: ["recommendation algorithm", "recommendations", "recommender"],
                def: "An AI system that suggests things you might like, based on what you and people similar to you have watched, bought or clicked before.",
                ex: "The “For you” feed in a video app and the songs a music app suggests are picked by recommendation systems."
            },
            ru: {
                name: "Рекомендательная система",
                aliases: ["рекомендации", "рекомендательный алгоритм"],
                def: "Система ИИ, которая предлагает то, что может тебе понравиться, на основе того, что ты и похожие на тебя люди раньше смотрели, покупали или лайкали.",
                ex: "Ленту «Для вас» в видеоприложении и песни, которые советует музыкальный сервис, подбирают рекомендательные системы."
            }
        },

        // ===== How AI learns =====
        {
            id: "ml", cat: "learning", icon: "📈", related: ["ai", "training", "model", "deep-learning"],
            en: {
                name: "Machine learning (ML)",
                aliases: ["machine learning"],
                def: "A way of building AI where the computer learns patterns from examples (data) instead of being given exact rules by a programmer.",
                ex: "Instead of writing a rule for every kind of spam, engineers show a program thousands of spam and normal emails, and it learns the difference itself."
            },
            ru: {
                name: "Машинное обучение",
                aliases: [],
                def: "Способ создавать ИИ, при котором компьютер сам находит закономерности в примерах (данных), а не получает от программиста точные правила.",
                ex: "Вместо того чтобы писать правило для каждого вида спама, инженеры показывают программе тысячи обычных писем и спама, и она сама учится их различать."
            }
        },
        {
            id: "training", cat: "learning", icon: "🏋️", related: ["dataset", "model", "parameters", "overfitting"],
            en: {
                name: "Training",
                aliases: ["trained", "train a model", "train the model", "train models", "train an AI", "train AI"],
                def: "The process of teaching a model: it makes guesses on example data, measures its mistakes and adjusts itself again and again to make fewer of them.",
                ex: "It's like practising free throws in basketball: shoot, see how far you missed, adjust, and repeat — thousands of times."
            },
            ru: {
                name: "Обучение модели",
                aliases: ["обучение", "тренировка модели", "обучить модель"],
                def: "Процесс, в котором модель учится: она делает догадки на примерах, измеряет свои ошибки и снова и снова подстраивается, чтобы ошибаться реже.",
                ex: "Это как тренировать штрафные броски в баскетболе: бросаешь, смотришь, насколько промахнулся, поправляешься — и так тысячи раз."
            }
        },
        {
            id: "neural-network", cat: "learning", icon: "🧠", related: ["neuron", "deep-learning", "parameters", "transformer"],
            en: {
                name: "Neural network",
                aliases: ["neural net", "artificial neural network"],
                def: "A type of AI model loosely inspired by the brain: many simple connected units (neurons), arranged in layers, pass numbers to each other and together learn to spot patterns.",
                ex: "The neural network in a photo app can learn to tell dogs from cats after seeing lots of labelled pictures of both."
            },
            ru: {
                name: "Нейронная сеть (нейросеть)",
                aliases: ["искусственная нейронная сеть"],
                def: "Тип модели ИИ, устройство которого в общих чертах навеяно мозгом: множество простых связанных элементов (нейронов), собранных в слои, передают друг другу числа и вместе учатся находить закономерности.",
                ex: "Нейросеть в приложении для фото может научиться отличать собак от кошек, увидев много подписанных снимков тех и других."
            }
        },
        {
            id: "neuron", cat: "learning", icon: "🔘", related: ["neural-network", "parameters", "deep-learning"],
            en: {
                name: "Artificial neuron",
                aliases: ["neuron", "perceptron"],
                def: "The tiny building block of a neural network. It takes in numbers, multiplies each one by a weight, adds them up and passes a signal on.",
                ex: "A neuron deciding “Should I go outside?” might give “Is it sunny?” a big weight and “Is it cold?” a negative one, then add everything up."
            },
            ru: {
                name: "Искусственный нейрон",
                aliases: ["нейрон", "перцептрон", "персептрон"],
                def: "Маленький строительный блок нейросети. Он получает числа, умножает каждое на свой вес, складывает их и передаёт сигнал дальше.",
                ex: "Нейрон, который решает «Пойти ли гулять?», может дать большой вес вопросу «Солнечно ли?» и отрицательный — вопросу «Холодно ли?», а потом всё сложить."
            }
        },
        {
            id: "deep-learning", cat: "learning", icon: "🌊", related: ["neural-network", "ml", "computer-vision"],
            en: {
                name: "Deep learning",
                aliases: [],
                def: "Machine learning with neural networks that have many layers (“deep” networks). It powers today's image recognition, speech recognition and chatbots.",
                ex: "When your phone turns your voice into text, a deep-learning model is doing the listening."
            },
            ru: {
                name: "Глубокое обучение",
                aliases: [],
                def: "Машинное обучение с помощью нейросетей из многих слоёв («глубоких» сетей). На нём работают современное распознавание изображений и речи, а также чат-боты.",
                ex: "Когда телефон превращает твой голос в текст, тебя «слушает» модель глубокого обучения."
            }
        },
        {
            id: "parameters", cat: "learning", icon: "🎚️", related: ["neuron", "training", "llm"],
            en: {
                name: "Parameters (weights)",
                aliases: ["parameter", "weights"],
                def: "The numbers inside a model that change during training. They store everything the model has learned. Large language models have billions of them.",
                ex: "Imagine a mixing desk with millions of tiny sliders: training slowly moves every slider until the music sounds right."
            },
            ru: {
                name: "Параметры (веса)",
                aliases: ["параметры модели", "веса модели", "веса нейросети"],
                def: "Числа внутри модели, которые меняются во время обучения. В них хранится всё, чему модель научилась. У больших языковых моделей их миллиарды.",
                ex: "Представь микшерный пульт с миллионами крошечных ползунков: обучение понемногу двигает каждый из них, пока музыка не зазвучит правильно."
            }
        },
        {
            id: "supervised", cat: "learning", icon: "🏷️", related: ["dataset", "unsupervised", "reinforcement"],
            en: {
                name: "Supervised learning",
                aliases: [],
                def: "Learning from examples that come with the right answers (labels). The model compares its guesses with the answers and gets better.",
                ex: "Showing a model thousands of emails already marked “spam” or “not spam”, so it learns to sort new ones."
            },
            ru: {
                name: "Обучение с учителем",
                aliases: [],
                def: "Обучение на примерах с готовыми правильными ответами (метками). Модель сравнивает свои догадки с ответами и становится точнее.",
                ex: "Модели показывают тысячи писем с пометками «спам» и «не спам», и она учится сортировать новые."
            }
        },
        {
            id: "unsupervised", cat: "learning", icon: "🫧", related: ["supervised", "data", "recommendation"],
            en: {
                name: "Unsupervised learning",
                aliases: [],
                def: "Learning from data without any answers given. The model looks for hidden patterns and groups similar things together on its own.",
                ex: "A shop's AI might discover groups of customers with similar shopping habits, without anyone telling it what the groups are."
            },
            ru: {
                name: "Обучение без учителя",
                aliases: [],
                def: "Обучение на данных без готовых ответов. Модель сама ищет скрытые закономерности и объединяет похожее в группы.",
                ex: "ИИ магазина может сам обнаружить группы покупателей с похожими привычками, хотя никто не говорил ему, какие это группы."
            }
        },
        {
            id: "reinforcement", cat: "learning", icon: "🎮", related: ["supervised", "training", "robot"],
            en: {
                name: "Reinforcement learning",
                aliases: ["RL"],
                def: "Learning by trial and error. The AI tries actions, gets rewards for good results and penalties for bad ones, and slowly finds a strategy that earns the most reward.",
                ex: "That's how a computer can learn a video game: at first it presses buttons at random, notices what earns points and keeps getting better — a bit like training a dog with treats."
            },
            ru: {
                name: "Обучение с подкреплением",
                aliases: [],
                def: "Обучение методом проб и ошибок. ИИ пробует действия, получает «награду» за хорошие результаты и «штраф» за плохие и постепенно находит стратегию, которая приносит больше всего наград.",
                ex: "Так компьютер может научиться видеоигре: сначала жмёт кнопки наугад, замечает, что приносит очки, и играет всё лучше — немного похоже на дрессировку собаки с лакомствами."
            }
        },
        {
            id: "overfitting", cat: "learning", icon: "📝", related: ["training", "dataset", "model"],
            en: {
                name: "Overfitting",
                aliases: ["overfit", "overfitted"],
                def: "When a model memorises its training examples too closely, including their random noise, and then does badly on new data it hasn't seen.",
                ex: "Like a student who learns last year's test answers word for word, then gets stuck when the questions are slightly different."
            },
            ru: {
                name: "Переобучение",
                aliases: ["переобученная модель"],
                def: "Когда модель слишком точно запоминает обучающие примеры вместе со случайными деталями и «шумом», а потом плохо справляется с новыми данными.",
                ex: "Как ученик, который зазубрил ответы прошлогодней контрольной слово в слово и растерялся, когда вопросы немного изменили."
            }
        },

        // ===== Generative AI =====
        {
            id: "generative-ai", cat: "generative", icon: "✨", related: ["llm", "prompt", "deepfake", "hallucination"],
            en: {
                name: "Generative AI",
                aliases: ["generative artificial intelligence", "GenAI"],
                def: "AI that creates new content — text, images, music, video or code — based on patterns it learned from huge numbers of examples.",
                ex: "Asking an app to draw “a cat astronaut in watercolour” and getting a brand-new picture is generative AI at work."
            },
            ru: {
                name: "Генеративный ИИ",
                aliases: ["генеративный искусственный интеллект", "генеративные нейросети"],
                def: "ИИ, который создаёт новый контент — тексты, картинки, музыку, видео или код — на основе закономерностей, выученных на огромном количестве примеров.",
                ex: "Ты просишь приложение нарисовать «кота-космонавта акварелью» и получаешь совершенно новую картинку — это работа генеративного ИИ."
            }
        },
        {
            id: "llm", cat: "generative", icon: "📚", related: ["token", "transformer", "chatbot", "hallucination"],
            en: {
                name: "Large language model (LLM)",
                aliases: ["language model", "large language model", "GPT"],
                def: "A huge neural network trained on enormous amounts of text to predict the next word (token). This simple skill lets it answer questions, write and translate.",
                ex: "The AI behind chatbots like ChatGPT is a large language model."
            },
            ru: {
                name: "Большая языковая модель (LLM)",
                aliases: ["языковая модель", "большая языковая модель", "БЯМ"],
                def: "Огромная нейросеть, обученная на гигантском количестве текстов предсказывать следующее слово (токен). Этот простой навык позволяет ей отвечать на вопросы, писать тексты и переводить.",
                ex: "За чат-ботами вроде ChatGPT стоит большая языковая модель."
            }
        },
        {
            id: "chatbot", cat: "generative", icon: "💬", related: ["llm", "nlp", "prompt", "turing-test"],
            en: {
                name: "Chatbot",
                aliases: ["chat bot", "ChatGPT", "AI assistant"],
                def: "A program you can have a conversation with by typing or speaking. Modern chatbots run on large language models; the first ones followed simple rules.",
                ex: "ELIZA (1966) was one of the first chatbots. Today millions of people chat with AI assistants every day."
            },
            ru: {
                name: "Чат-бот",
                aliases: ["чатбот", "ИИ-ассистент", "ИИ-помощник"],
                def: "Программа, с которой можно переписываться или разговаривать. Современные чат-боты работают на больших языковых моделях, а первые следовали простым правилам.",
                ex: "ELIZA (1966) была одним из первых чат-ботов. Сегодня миллионы людей каждый день общаются с ИИ-помощниками."
            }
        },
        {
            id: "prompt", cat: "generative", icon: "⌨️", related: ["chatbot", "generative-ai", "llm"],
            en: {
                name: "Prompt",
                aliases: ["prompting", "prompt engineering"],
                def: "The instruction or question you give to a generative AI. Clear, specific prompts with some context usually get much better results.",
                ex: "“Explain photosynthesis to a 13-year-old in three short bullet points” works far better than just typing “photosynthesis”."
            },
            ru: {
                name: "Промпт (запрос)",
                aliases: ["промт", "запрос к ИИ"],
                def: "Инструкция или вопрос, который ты даёшь генеративному ИИ. Чёткие и конкретные запросы с контекстом обычно дают гораздо лучший результат.",
                ex: "Запрос «Объясни фотосинтез 13-летнему в трёх коротких пунктах» сработает гораздо лучше, чем просто «фотосинтез»."
            }
        },
        {
            id: "token", cat: "generative", icon: "🔤", related: ["llm", "prompt", "nlp"],
            en: {
                name: "Token",
                aliases: ["tokens"],
                def: "A small piece of text — a word, part of a word or a punctuation mark — that a language model reads and writes. Models measure text in tokens.",
                ex: "A long word like “unbelievable” might be split into tokens such as “un”, “believ” and “able”."
            },
            ru: {
                name: "Токен",
                aliases: [],
                def: "Маленький кусочек текста — слово, часть слова или знак препинания, — который читает и пишет языковая модель. Объём текста модели считают в токенах.",
                ex: "Длинное слово «невероятный» модель может разбить на токены вроде «не», «вероят» и «ный»."
            }
        },
        {
            id: "hallucination", cat: "generative", icon: "🌀", related: ["llm", "chatbot", "bias"],
            en: {
                name: "Hallucination",
                aliases: ["hallucinat*"],
                def: "When an AI confidently gives an answer that sounds right but is false or made up, such as a fake fact, quote or source.",
                ex: "A chatbot might invent a book and an author that don't exist. That's why you should check important facts in reliable sources."
            },
            ru: {
                name: "Галлюцинация",
                aliases: ["галлюцинир*"],
                def: "Когда ИИ уверенно выдаёт ответ, который звучит правдоподобно, но на самом деле ложный или выдуманный: несуществующий факт, цитату или источник.",
                ex: "Чат-бот может придумать книгу и автора, которых не существует. Поэтому важные факты всегда проверяй в надёжных источниках."
            }
        },
        {
            id: "transformer", cat: "generative", icon: "⚡", related: ["llm", "neural-network", "token"],
            en: {
                name: "Transformer",
                aliases: ["attention is all you need"],
                def: "A neural network design from 2017 that uses “attention” to look at all the words of a text at once and work out how they relate. Most modern language models are built on it.",
                ex: "The “T” in GPT stands for “Transformer”."
            },
            ru: {
                name: "Трансформер",
                aliases: ["механизм внимания"],
                def: "Архитектура нейросети, появившаяся в 2017 году. С помощью механизма «внимания» она смотрит сразу на все слова текста и выясняет, как они связаны. На ней построено большинство современных языковых моделей.",
                ex: "Буква «T» в названии GPT означает «Transformer» — трансформер."
            }
        },

        // ===== Ethics & Safety =====
        {
            id: "bias", cat: "ethics", icon: "⚖️", related: ["dataset", "black-box", "privacy"],
            en: {
                name: "Bias",
                aliases: ["biased", "algorithmic bias"],
                def: "When an AI system treats some people or groups unfairly, often because its training data was unbalanced or reflected human prejudices.",
                ex: "A face-recognition system trained mostly on photos of people with light skin can make more mistakes with people who have darker skin."
            },
            ru: {
                name: "Предвзятость",
                aliases: ["предвзятый", "предвзятость алгоритмов"],
                def: "Когда система ИИ относится к каким-то людям или группам несправедливо — часто потому, что данные для обучения были однобокими или отражали человеческие предрассудки.",
                ex: "Система распознавания лиц, обученная в основном на фото людей со светлой кожей, может чаще ошибаться с людьми с тёмной кожей."
            }
        },
        {
            id: "deepfake", cat: "ethics", icon: "🎬", related: ["generative-ai", "privacy", "computer-vision"],
            en: {
                name: "Deepfake",
                aliases: ["deep fake"],
                def: "A fake video, image or voice recording made with AI that makes someone appear to say or do something they never did.",
                ex: "A video of a celebrity “saying” something they never said. Check the source, look for strange details and think before you share."
            },
            ru: {
                name: "Дипфейк",
                aliases: [],
                def: "Поддельное видео, фото или запись голоса, созданные с помощью ИИ, где человек будто бы говорит или делает то, чего на самом деле никогда не было.",
                ex: "Видео, где знаменитость «говорит» то, чего никогда не говорила. Проверяй источник, ищи странные детали и не спеши делиться."
            }
        },
        {
            id: "privacy", cat: "ethics", icon: "🔒", related: ["data", "deepfake", "recommendation"],
            en: {
                name: "Privacy",
                aliases: ["personal data", "data privacy"],
                def: "Your right to control your personal information. AI systems often collect and use lots of data, so it matters what you share and who can see it.",
                ex: "Before pasting your address, a password or a friend's photo into an AI app, ask yourself: where could this information end up?"
            },
            ru: {
                name: "Конфиденциальность (приватность)",
                aliases: ["личные данные", "персональные данные"],
                def: "Твоё право контролировать информацию о себе. Системы ИИ часто собирают и используют много данных, поэтому важно, чем ты делишься и кто может это увидеть.",
                ex: "Прежде чем вставить в ИИ-приложение свой адрес, пароль или фото друга, спроси себя: куда может попасть эта информация?"
            }
        },
        {
            id: "black-box", cat: "ethics", icon: "⬛", related: ["neural-network", "bias", "parameters"],
            en: {
                name: "Black box",
                aliases: ["explainability", "explainable AI"],
                def: "A system whose inner workings are hard to see or explain. Even the people who build large neural networks often can't say exactly why a network gave a particular answer.",
                ex: "If an AI turns down someone's loan application, that person should be able to find out why. That's why researchers work on “explainable AI”."
            },
            ru: {
                name: "Чёрный ящик",
                aliases: ["объяснимый ИИ", "объяснимость"],
                def: "Система, внутреннее устройство которой трудно увидеть или объяснить. Даже создатели больших нейросетей часто не могут точно сказать, почему сеть дала именно такой ответ.",
                ex: "Если ИИ отказал человеку в кредите, тот должен иметь возможность узнать почему. Поэтому учёные работают над «объяснимым ИИ»."
            }
        },
        {
            id: "agi", cat: "ethics", icon: "🌌", related: ["ai", "turing-test", "black-box"],
            en: {
                name: "Artificial general intelligence (AGI)",
                aliases: ["general AI", "strong AI"],
                def: "A possible future AI that could learn and do almost any mental task a human can. It doesn't exist yet, and experts disagree about whether and when it will.",
                ex: "Today's AI is mostly “narrow”: a chess program can't drive a car. An AGI could switch between very different tasks, just as people do."
            },
            ru: {
                name: "Общий искусственный интеллект (AGI)",
                aliases: ["сильный ИИ", "общий ИИ", "универсальный ИИ"],
                def: "Возможный ИИ будущего, который мог бы научиться почти любой умственной задаче, доступной человеку. Пока его не существует, и эксперты спорят, появится ли он и когда.",
                ex: "Сегодняшний ИИ в основном «узкий»: шахматная программа не умеет водить машину. Общий ИИ мог бы переключаться между совершенно разными задачами, как это делают люди."
            }
        }
    ]
});
