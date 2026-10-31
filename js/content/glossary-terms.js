/* =========================================================
   AI COMPASS — DATA: THE GLOSSARY TERMS
   The categories and every term, in English and in Russian.
   The glossary's other texts (buttons, labels, messages) are in
   js/content/glossary.js; this second file keeps that one short.
   Used by js/glossary.js (and by any feature that reads the terms
   with AICompass.content.get("glossary")).
   To change a term, change it here (in both languages).
   ========================================================= */

// The categories (in the order of their chips) and the terms
// (js/glossary.js reads them with AICompass.content.get("glossary")).
// Every category has its name in js/content/glossary.js: "glossary.cat.basics", ...
window.AICompass.content.set("glossary", {
    categories: ["basics", "learning", "vision", "trial", "language", "generative", "ethics"],

    // Other ids that lead to a term. Links on the site may use them
    // (#term-genetic-algorithm, A.glossary.show("k-means")): the glossary opens
    // the term on the right, whose card explains the narrower word too.
    sameAs: {
        "genetic-algorithm": "evolutionary-algorithm",
        "neuroevolution": "evolutionary-algorithm",
        "k-means": "clustering"
    },

    // id: short name used in code, in links (#term-ai) and in saved progress, so
    //   it never changes. cat: its category. icon: the emoji on its card (each one
    //   is used once).
    // lessons: the numbers of the lessons that teach it (the card links to them;
    //   a lesson the site doesn't have yet is left out). lab: the id of the AI Lab
    //   experiment that shows it, or "" (the card links to it once the lab has it).
    // related: the ids of other terms. Every relation goes both ways: if "bias"
    //   lists "dataset", then "dataset" lists "bias".
    // en / ru: the term in each language.
    //   name: as shown (an abbreviation in brackets can be searched too).
    //   aliases: other ways to write it, only used for searching (never shown).
    //     An alias ending in "*" matches any word that starts like it.
    //   short: the definition in one plain sentence (on the card, on the back of
    //     a flashcard, and "in simple words" in Compass Bot).
    //   def: the full explanation (when the card is opened). ex: an everyday example.
    terms: [
        // ===== Basics =====
        {
            id: "ai", cat: "basics", icon: "🤖", lessons: [1], lab: "",
            related: ["ml", "algorithm", "agi", "turing-test", "expert-system", "automation"],
            en: {
                name: "Artificial intelligence (AI)",
                aliases: ["artificial intelligence"],
                short: "Computer systems that can do tasks that usually need human intelligence.",
                def: "Computer systems that can do tasks that usually need human intelligence, such as understanding language, recognising images, making decisions or solving problems.",
                ex: "Your phone unlocking when it recognises your face, or a map app finding the fastest way home: both are examples of AI."
            },
            ru: {
                name: "Искусственный интеллект (ИИ)",
                aliases: ["искусственный интеллект"],
                short: "Компьютерные системы, которые умеют решать задачи, обычно требующие человеческого интеллекта.",
                def: "Компьютерные системы, которые выполняют задачи, обычно требующие человеческого интеллекта: понимают речь, узнают изображения, принимают решения и решают проблемы.",
                ex: "Телефон, который разблокируется, узнав твоё лицо, или навигатор, который ищет самый быстрый путь домой, — это примеры ИИ."
            }
        },
        {
            id: "algorithm", cat: "basics", icon: "📋", lessons: [5], lab: "",
            related: ["ai", "model", "automation", "recommendation", "expert-system", "filter-bubble"],
            en: {
                name: "Algorithm",
                aliases: [],
                short: "A clear, step-by-step set of instructions for solving a problem.",
                def: "A clear, step-by-step set of instructions for solving a problem or doing a task. A computer follows an algorithm exactly, one step at a time.",
                ex: "A pancake recipe is an algorithm for people. A video app uses algorithms to decide which video to show you next."
            },
            ru: {
                name: "Алгоритм",
                aliases: [],
                short: "Чёткая пошаговая инструкция для решения задачи.",
                def: "Чёткая пошаговая инструкция для решения задачи. Компьютер выполняет алгоритм точно, шаг за шагом.",
                ex: "Рецепт блинов — это алгоритм для человека. А видеосервис с помощью алгоритмов решает, какое видео показать тебе следующим."
            }
        },
        {
            id: "data", cat: "basics", icon: "📊", lessons: [2], lab: "classifier",
            related: ["dataset", "privacy", "recommendation", "unsupervised", "clustering", "proxy"],
            en: {
                name: "Data",
                aliases: [],
                short: "Facts and information a computer can store and use, such as numbers, words, pictures and clicks.",
                def: "Facts and information a computer can store and use: numbers, words, pictures, sounds, clicks and much more. AI learns from data.",
                ex: "Every photo you take, every song you skip and every step your phone counts is data."
            },
            ru: {
                name: "Данные",
                aliases: [],
                short: "Факты и информация, которые компьютер может хранить и использовать: числа, слова, картинки, клики.",
                def: "Факты и информация, которые компьютер может хранить и использовать: числа, слова, картинки, звуки, клики и многое другое. ИИ учится на данных.",
                ex: "Каждое твоё фото, каждая пропущенная песня и каждый шаг, который считает телефон, — это данные."
            }
        },
        {
            id: "dataset", cat: "basics", icon: "🗂️", lessons: [2, 7], lab: "draw",
            related: ["data", "training", "supervised", "bias", "overfitting", "data-augmentation"],
            en: {
                name: "Dataset",
                aliases: ["data set", "training data"],
                short: "A large, organised collection of examples used to train or test an AI model.",
                def: "A large, organised collection of examples used to train or test an AI model, for example thousands of labelled photos.",
                ex: "To teach an AI to spot cats, researchers might collect a dataset of 100,000 photos, each labelled “cat” or “not a cat”."
            },
            ru: {
                name: "Набор данных (датасет)",
                aliases: ["обучающие данные", "обучающая выборка"],
                short: "Большая упорядоченная коллекция примеров, на которой обучают или проверяют модель ИИ.",
                def: "Большая упорядоченная коллекция примеров, на которой обучают или проверяют модель ИИ, например тысячи подписанных фотографий.",
                ex: "Чтобы научить ИИ находить кошек, исследователи могут собрать датасет из 100 000 фото с подписями «кошка» или «не кошка»."
            }
        },
        {
            id: "model", cat: "basics", icon: "🧩", lessons: [2], lab: "classifier",
            related: ["training", "parameters", "algorithm", "ml", "overfitting", "generalization"],
            en: {
                name: "Model",
                aliases: ["AI model"],
                short: "A program that has learned patterns from data and uses them to make predictions or create something new.",
                def: "What an AI system becomes after training: a program that has learned patterns from data and uses them to make predictions or create something new.",
                ex: "A spam filter's model has learned what junk mail usually looks like, so it can sort new emails it has never seen before."
            },
            ru: {
                name: "Модель",
                aliases: ["модель ИИ"],
                short: "Программа, которая нашла закономерности в данных и с их помощью делает прогнозы или создаёт новое.",
                def: "То, чем становится система ИИ после обучения: программа, которая нашла закономерности в данных и использует их, чтобы делать прогнозы или создавать что-то новое.",
                ex: "Модель спам-фильтра выучила, как обычно выглядит спам, поэтому сортирует даже письма, которых раньше никогда не видела."
            }
        },
        {
            id: "robot", cat: "basics", icon: "🦾", lessons: [8], lab: "maze",
            related: ["automation", "computer-vision", "agent"],
            en: {
                name: "Robot",
                aliases: ["robotics"],
                short: "A machine that can sense its surroundings and move or act in the physical world.",
                def: "A machine that can sense its surroundings and move or act in the physical world. Some robots use AI, but many simply follow a fixed program.",
                ex: "A robot vacuum cleaner uses its sensors to map your room and steer around the furniture."
            },
            ru: {
                name: "Робот",
                aliases: ["робототехника"],
                short: "Машина, которая воспринимает окружающий мир и может двигаться или действовать в нём.",
                def: "Машина, которая может воспринимать окружающий мир и двигаться или действовать в нём. Некоторые роботы используют ИИ, но многие просто выполняют заданную программу.",
                ex: "Робот-пылесос с помощью датчиков составляет карту комнаты и объезжает мебель."
            }
        },
        {
            id: "automation", cat: "basics", icon: "⚙️", lessons: [5], lab: "",
            related: ["robot", "algorithm", "ai"],
            en: {
                name: "Automation",
                aliases: ["automate", "automated"],
                short: "Using machines or software to do tasks by themselves, with little or no human help.",
                def: "Using machines or software to do tasks automatically, with little or no human help. AI makes it possible to automate more and more complex tasks.",
                ex: "Self-checkout machines, automatic email replies and factory robots that build cars are all examples of automation."
            },
            ru: {
                name: "Автоматизация",
                aliases: ["автоматически"],
                short: "Использование машин и программ, чтобы задачи выполнялись сами, почти без участия человека.",
                def: "Использование машин или программ, чтобы задачи выполнялись сами, почти без участия человека. ИИ позволяет автоматизировать всё более сложные задачи.",
                ex: "Кассы самообслуживания, автоответы на письма и роботы, которые собирают машины на заводе, — всё это автоматизация."
            }
        },
        {
            id: "nlp", cat: "basics", icon: "🗣️", lessons: [4], lab: "predictor",
            related: ["llm", "token", "embedding"],
            en: {
                name: "Natural language processing (NLP)",
                aliases: ["natural language", "language processing"],
                short: "The area of AI that works with human language: understanding, translating and creating text or speech.",
                def: "The area of AI that works with human language: understanding, translating, summarising and creating text or speech.",
                ex: "Voice assistants, spell-checkers and translation apps all rely on natural language processing."
            },
            ru: {
                name: "Обработка естественного языка (NLP)",
                aliases: ["обработка языка", "естественный язык"],
                short: "Область ИИ, которая работает с человеческим языком: понимает, переводит и создаёт текст или речь.",
                def: "Область ИИ, которая работает с человеческим языком: понимает, переводит, кратко пересказывает и создаёт текст или речь.",
                ex: "Голосовые помощники, проверка орфографии и онлайн-переводчики работают благодаря обработке естественного языка."
            }
        },
        {
            id: "turing-test", cat: "basics", icon: "🎭", lessons: [], lab: "",
            related: ["ai", "chatbot", "agi"],
            en: {
                name: "Turing test",
                aliases: ["imitation game", "Alan Turing"],
                short: "Alan Turing's 1950 test: a machine passes if people chatting with it in text can't reliably tell it from a human.",
                def: "A test suggested by Alan Turing in 1950: if a person chatting in text can't reliably tell whether they are talking to a machine or a human, the machine passes.",
                ex: "Imagine texting two mystery chat partners: one is a person, the other a computer. If you can't tell which is which, the computer has passed the Turing test."
            },
            ru: {
                name: "Тест Тьюринга",
                aliases: ["игра в имитацию", "Алан Тьюринг"],
                short: "Тест Алана Тьюринга 1950 года: машина проходит его, если человек в переписке не может надёжно отличить её от человека.",
                def: "Тест, который Алан Тьюринг предложил в 1950 году: если человек в переписке не может надёжно отличить машину от человека, машина проходит тест.",
                ex: "Представь, что переписываешься с двумя незнакомцами: один — человек, другой — компьютер. Если ты не можешь понять, кто есть кто, компьютер прошёл тест Тьюринга."
            }
        },
        {
            id: "recommendation", cat: "basics", icon: "🎯", lessons: [5], lab: "cluster",
            related: ["algorithm", "data", "privacy", "filter-bubble", "unsupervised", "clustering"],
            en: {
                name: "Recommendation system",
                aliases: ["recommendation algorithm", "recommendations", "recommender"],
                short: "An AI system that suggests things you might like, based on what you and similar people chose before.",
                def: "An AI system that suggests things you might like, based on what you and people similar to you have watched, bought or clicked before.",
                ex: "The “For you” feed in a video app and the songs a music app suggests are picked by recommendation systems."
            },
            ru: {
                name: "Рекомендательная система",
                aliases: ["рекомендации", "рекомендательный алгоритм"],
                short: "Система ИИ, которая предлагает то, что может тебе понравиться, по тому, что раньше выбирали ты и похожие на тебя люди.",
                def: "Система ИИ, которая предлагает то, что может тебе понравиться, на основе того, что ты и похожие на тебя люди раньше смотрели, покупали или лайкали.",
                ex: "Ленту «Для вас» в видеоприложении и песни, которые советует музыкальный сервис, подбирают рекомендательные системы."
            }
        },
        {
            id: "expert-system", cat: "basics", icon: "📜", lessons: [1], lab: "",
            related: ["ai", "algorithm"],
            en: {
                name: "Expert system",
                aliases: ["rule-based system", "rule-based AI"],
                short: "An early kind of AI that makes decisions by following many if-then rules written down by human experts.",
                def: "An early kind of AI that answers questions in one narrow field by following a large set of “if …, then …” rules collected from human experts. Expert systems were a big part of AI in the 1970s and 1980s. Most of them couldn't learn: every rule had to be written by hand.",
                ex: "A car-repair expert system might ask: “Does the engine turn over?” If it doesn't and the lights are dim, it suggests checking the battery."
            },
            ru: {
                name: "Экспертная система",
                aliases: ["система на правилах"],
                short: "Ранний вид ИИ, который принимает решения, следуя множеству правил «если…, то…», записанных со слов специалистов.",
                def: "Ранний вид ИИ, который отвечает на вопросы в одной узкой области, следуя большому набору правил «если …, то …», собранных у специалистов. Экспертные системы были важной частью ИИ в 1970-х и 1980-х годах. Большинство из них не умели учиться: каждое правило приходилось записывать вручную.",
                ex: "Экспертная система для ремонта машин может спросить: «Двигатель проворачивается?» Если нет, а фары горят тускло, она советует проверить аккумулятор."
            }
        },

        // ===== Learning =====
        {
            id: "ml", cat: "learning", icon: "📈", lessons: [2], lab: "classifier",
            related: ["ai", "model", "deep-learning", "supervised", "unsupervised"],
            en: {
                name: "Machine learning (ML)",
                aliases: ["machine learning"],
                short: "A way of building AI in which the computer learns patterns from examples instead of following rules written by a programmer.",
                def: "A way of building AI where the computer learns patterns from examples (data) instead of being given exact rules by a programmer.",
                ex: "Instead of writing a rule for every kind of spam, engineers show a program thousands of spam and normal emails, and it learns the difference itself."
            },
            ru: {
                name: "Машинное обучение",
                aliases: [],
                short: "Способ создавать ИИ, при котором компьютер учится на примерах, а не получает готовые правила от программиста.",
                def: "Способ создавать ИИ, при котором компьютер сам находит закономерности в примерах (данных), а не получает от программиста точные правила.",
                ex: "Вместо того чтобы писать правило для каждого вида спама, инженеры показывают программе тысячи обычных писем и спама, и она сама учится их различать."
            }
        },
        {
            id: "training", cat: "learning", icon: "🏋️", lessons: [2, 3], lab: "classifier",
            related: ["dataset", "model", "parameters", "loss", "overfitting", "fine-tuning"],
            en: {
                name: "Training",
                aliases: ["trained", "train a model", "train the model", "train models", "train an AI", "train AI"],
                short: "The process in which a model learns from examples by making guesses and correcting its mistakes again and again.",
                def: "The process of teaching a model: it makes guesses on example data, measures its mistakes and adjusts itself again and again to make fewer of them.",
                ex: "It's like practising free throws in basketball: shoot, see how far you missed, adjust, and repeat — thousands of times."
            },
            ru: {
                name: "Обучение модели",
                aliases: ["обучение", "тренировка модели", "обучить модель"],
                short: "Процесс, в котором модель учится на примерах: делает догадки и снова и снова исправляет свои ошибки.",
                def: "Процесс, в котором модель учится: она делает догадки на примерах, измеряет свои ошибки и снова и снова подстраивается, чтобы ошибаться реже.",
                ex: "Это как тренировать штрафные броски в баскетболе: бросаешь, смотришь, насколько промахнулся, поправляешься — и так тысячи раз."
            }
        },
        {
            id: "neural-network", cat: "learning", icon: "🧠", lessons: [3], lab: "classifier",
            related: ["neuron", "deep-learning", "transformer", "cnn", "backpropagation", "black-box"],
            en: {
                name: "Neural network",
                aliases: ["neural net", "artificial neural network"],
                short: "An AI model made of many simple connected units (neurons), arranged in layers, that learn patterns together.",
                def: "A type of AI model loosely inspired by the brain: many simple connected units (neurons), arranged in layers, pass numbers to each other and together learn to spot patterns.",
                ex: "The neural network in a photo app can learn to tell dogs from cats after seeing lots of labelled pictures of both."
            },
            ru: {
                name: "Нейронная сеть (нейросеть)",
                aliases: ["искусственная нейронная сеть"],
                short: "Модель ИИ из множества простых связанных элементов (нейронов), собранных в слои, которые вместе учатся находить закономерности.",
                def: "Тип модели ИИ, устройство которого в общих чертах навеяно мозгом: множество простых связанных элементов (нейронов), собранных в слои, передают друг другу числа и вместе учатся находить закономерности.",
                ex: "Нейросеть в приложении для фото может научиться отличать собак от кошек, увидев много подписанных снимков тех и других."
            }
        },
        {
            id: "neuron", cat: "learning", icon: "🔘", lessons: [3], lab: "classifier",
            related: ["neural-network", "parameters", "deep-learning"],
            en: {
                name: "Artificial neuron",
                aliases: ["neuron", "perceptron"],
                short: "The tiny building block of a neural network: it weighs its input numbers, adds them up and passes a signal on.",
                def: "The tiny building block of a neural network. It takes in numbers, multiplies each one by a weight, adds them up and passes a signal on.",
                ex: "A neuron deciding “Should I go outside?” might give “Is it sunny?” a big weight and “Is it cold?” a negative one, then add everything up."
            },
            ru: {
                name: "Искусственный нейрон",
                aliases: ["нейрон", "перцептрон", "персептрон"],
                short: "Маленький строительный блок нейросети: он умножает входные числа на веса, складывает их и передаёт сигнал дальше.",
                def: "Маленький строительный блок нейросети. Он получает числа, умножает каждое на свой вес, складывает их и передаёт сигнал дальше.",
                ex: "Нейрон, который решает «Пойти ли гулять?», может дать большой вес вопросу «Солнечно ли?» и отрицательный — вопросу «Холодно ли?», а потом всё сложить."
            }
        },
        {
            id: "deep-learning", cat: "learning", icon: "🌊", lessons: [3, 7], lab: "classifier",
            related: ["neural-network", "ml", "neuron", "computer-vision"],
            en: {
                name: "Deep learning",
                aliases: [],
                short: "Machine learning with neural networks that have many layers.",
                def: "Machine learning with neural networks that have many layers (“deep” networks). It powers today's image recognition, speech recognition and chatbots.",
                ex: "When your phone turns your voice into text, a deep-learning model is doing the listening."
            },
            ru: {
                name: "Глубокое обучение",
                aliases: [],
                short: "Машинное обучение с помощью нейросетей из многих слоёв.",
                def: "Машинное обучение с помощью нейросетей из многих слоёв («глубоких» сетей). На нём работают современное распознавание изображений и речи, а также чат-боты.",
                ex: "Когда телефон превращает твой голос в текст, тебя «слушает» модель глубокого обучения."
            }
        },
        {
            id: "parameters", cat: "learning", icon: "🎚️", lessons: [3], lab: "descent",
            related: ["neuron", "model", "training", "backpropagation", "black-box"],
            en: {
                name: "Parameters (weights)",
                aliases: ["parameter", "weights"],
                short: "The numbers inside a model that change during training and store what it has learned.",
                def: "The numbers inside a model that change during training. They store everything the model has learned. Large language models have billions of them.",
                ex: "Imagine a mixing desk with millions of tiny sliders: training slowly moves every slider until the music sounds right."
            },
            ru: {
                name: "Параметры (веса)",
                aliases: ["параметры модели", "веса модели", "веса нейросети"],
                short: "Числа внутри модели, которые меняются при обучении и хранят всё, чему она научилась.",
                def: "Числа внутри модели, которые меняются во время обучения. В них хранится всё, чему модель научилась. У больших языковых моделей их миллиарды.",
                ex: "Представь микшерный пульт с миллионами крошечных ползунков: обучение понемногу двигает каждый из них, пока музыка не зазвучит правильно."
            }
        },
        {
            id: "supervised", cat: "learning", icon: "🏷️", lessons: [2], lab: "draw",
            related: ["unsupervised", "reinforcement", "dataset", "ml"],
            en: {
                name: "Supervised learning",
                aliases: [],
                short: "Learning from examples that come with the right answers (labels).",
                def: "Learning from examples that come with the right answers (labels). The model compares its guesses with the answers and gets better.",
                ex: "Showing a model thousands of emails already marked “spam” or “not spam”, so it learns to sort new ones."
            },
            ru: {
                name: "Обучение с учителем",
                aliases: [],
                short: "Обучение на примерах, к которым приложены правильные ответы (метки).",
                def: "Обучение на примерах с готовыми правильными ответами (метками). Модель сравнивает свои догадки с ответами и становится точнее.",
                ex: "Модели показывают тысячи писем с пометками «спам» и «не спам», и она учится сортировать новые."
            }
        },
        {
            id: "unsupervised", cat: "learning", icon: "🫧", lessons: [2], lab: "cluster",
            related: ["clustering", "data", "recommendation", "supervised", "ml"],
            en: {
                name: "Unsupervised learning",
                aliases: [],
                short: "Learning from data without answers, by finding hidden patterns and groups on its own.",
                def: "Learning from data without any answers given. The model looks for hidden patterns and groups similar things together on its own.",
                ex: "A shop's AI might discover groups of customers with similar shopping habits, without anyone telling it what the groups are."
            },
            ru: {
                name: "Обучение без учителя",
                aliases: [],
                short: "Обучение на данных без готовых ответов: модель сама ищет скрытые закономерности и группы.",
                def: "Обучение на данных без готовых ответов. Модель сама ищет скрытые закономерности и объединяет похожее в группы.",
                ex: "ИИ магазина может сам обнаружить группы покупателей с похожими привычками, хотя никто не говорил ему, какие это группы."
            }
        },
        {
            id: "overfitting", cat: "learning", icon: "📝", lessons: [2], lab: "draw",
            related: ["generalization", "data-augmentation", "training", "dataset", "model"],
            en: {
                name: "Overfitting",
                aliases: ["overfit", "overfitted"],
                short: "When a model memorises its training examples so closely that it does badly on new data.",
                def: "When a model memorises its training examples too closely, including their random noise, and then does badly on new data it hasn't seen.",
                ex: "Like a student who learns last year's test answers word for word, then gets stuck when the questions are slightly different."
            },
            ru: {
                name: "Переобучение",
                aliases: ["переобученная модель"],
                short: "Когда модель так точно запоминает обучающие примеры, что плохо справляется с новыми данными.",
                def: "Когда модель слишком точно запоминает обучающие примеры вместе со случайными деталями и «шумом», а потом плохо справляется с новыми данными.",
                ex: "Как ученик, который зазубрил ответы прошлогодней контрольной слово в слово и растерялся, когда вопросы немного изменили."
            }
        },
        {
            id: "generalization", cat: "learning", icon: "🌍", lessons: [2], lab: "draw",
            related: ["overfitting", "data-augmentation", "model"],
            en: {
                name: "Generalisation",
                aliases: ["generalization", "generali*"],
                short: "A model's ability to work well on new examples it has never seen, not just on its training data.",
                def: "A model's ability to do well on new examples, not just on the ones it was trained on. Generalisation is the real goal of machine learning: a model that only remembers its training data is overfitting.",
                ex: "A student who understands how to solve equations can solve new ones in a test. A student who memorised the answers to the textbook exercises can't — that's the difference between generalising and overfitting."
            },
            ru: {
                name: "Обобщение",
                aliases: ["обобщающая способность", "обобща*"],
                short: "Способность модели хорошо работать на новых примерах, которых она никогда не видела, а не только на обучающих.",
                def: "Способность модели хорошо справляться с новыми примерами, а не только с теми, на которых она училась. Обобщение — настоящая цель машинного обучения: модель, которая только запомнила обучающие данные, переобучилась.",
                ex: "Ученик, который понял, как решать уравнения, решит и новые на контрольной. А тот, кто вызубрил ответы к упражнениям из учебника, — нет. В этом и разница между обобщением и переобучением."
            }
        },
        {
            id: "loss", cat: "learning", icon: "📉", lessons: [3], lab: "descent",
            related: ["gradient-descent", "learning-rate", "backpropagation", "training"],
            en: {
                name: "Loss function",
                aliases: ["loss", "cost function"],
                short: "A score that measures how wrong a model's answers are; training tries to make it as small as possible.",
                def: "A formula that turns all of a model's mistakes into one number, called the loss: the bigger the mistakes, the bigger the loss. Training means searching for the parameters that make the loss as small as possible.",
                ex: "In darts, you could score each throw by its distance from the bullseye. Adding up the distances gives a loss: a better player gets a smaller number."
            },
            ru: {
                name: "Функция потерь",
                aliases: ["потери", "функция ошибки"],
                short: "Число, которое показывает, насколько ошибается модель; обучение старается сделать его как можно меньше.",
                def: "Формула, которая превращает все ошибки модели в одно число — потери: чем больше ошибки, тем больше потери. Обучение — это поиск таких параметров, при которых потери как можно меньше.",
                ex: "В дартсе каждый бросок можно оценить расстоянием до центра мишени. Сумма этих расстояний — это и есть потери: у игрока получше число меньше."
            }
        },
        {
            id: "gradient-descent", cat: "learning", icon: "⛰️", lessons: [3], lab: "descent",
            related: ["loss", "learning-rate", "backpropagation", "evolutionary-algorithm"],
            en: {
                name: "Gradient descent",
                aliases: [],
                short: "A way to train a model by changing its parameters, step by step, in the direction that makes the loss smaller.",
                def: "The most common way to train a model. It works out in which direction each parameter should change to make the loss a little smaller, takes a small step that way, and repeats this thousands of times.",
                ex: "Imagine walking down a hill in thick fog. You can't see the valley, but you can feel which way the ground slopes. Step by step downhill, you get lower and lower. The gradient is that slope."
            },
            ru: {
                name: "Градиентный спуск",
                aliases: [],
                short: "Способ обучать модель: шаг за шагом менять её параметры в ту сторону, где потери становятся меньше.",
                def: "Самый распространённый способ обучать модель. Он вычисляет, в какую сторону изменить каждый параметр, чтобы потери стали чуть меньше, делает туда маленький шаг и повторяет это тысячи раз.",
                ex: "Представь, что спускаешься с холма в густом тумане. Долины не видно, но ты чувствуешь, куда наклонена земля. Шаг за шагом вниз — и ты всё ниже и ниже. Градиент — это и есть такой наклон."
            }
        },
        {
            id: "learning-rate", cat: "learning", icon: "👣", lessons: [], lab: "descent",
            related: ["gradient-descent", "loss"],
            en: {
                name: "Learning rate",
                aliases: ["step size"],
                short: "A setting that controls how big a step a model takes each time it adjusts its parameters during training.",
                def: "A setting chosen by the people who train a model: how big a step gradient descent takes each time it adjusts the parameters. Too small, and training is very slow; too big, and the model jumps past the best values and may never settle.",
                ex: "Think of tuning a guitar string: tiny turns of the peg take forever, but huge turns keep sending the note too high and then too low."
            },
            ru: {
                name: "Скорость обучения",
                aliases: ["шаг обучения"],
                short: "Настройка, которая определяет, насколько большой шаг делает модель, когда меняет параметры при обучении.",
                def: "Настройка, которую выбирают люди, обучающие модель: насколько большой шаг делает градиентный спуск, когда меняет параметры. Слишком маленький шаг — обучение идёт очень медленно; слишком большой — модель проскакивает лучшие значения и может так и не успокоиться.",
                ex: "Это как настраивать гитарную струну: крошечными поворотами колка можно возиться вечно, а от больших звук всё время уходит то слишком высоко, то слишком низко."
            }
        },
        {
            id: "backpropagation", cat: "learning", icon: "↩️", lessons: [3], lab: "classifier",
            related: ["neural-network", "gradient-descent", "loss", "parameters"],
            en: {
                name: "Backpropagation",
                aliases: ["backprop", "back-propagation"],
                short: "The method a neural network uses to work out how much each weight was to blame for a mistake.",
                def: "The method that tells a neural network how to improve. After a wrong answer, it goes backwards through the network, layer by layer, and works out how much each weight added to the mistake. Gradient descent then nudges every weight a little.",
                ex: "After a lost football match, a coach replays the video backwards from the goal you let in: who lost the ball, who was out of position? Then each player fixes their own part a little."
            },
            ru: {
                name: "Обратное распространение ошибки",
                aliases: ["обратное распространение", "бэкпроп"],
                short: "Способ, которым нейросеть выясняет, насколько каждый вес виноват в ошибке.",
                def: "Способ, который подсказывает нейросети, как стать лучше. После неверного ответа он проходит по сети в обратную сторону, слой за слоем, и вычисляет, какой вклад в ошибку внёс каждый вес. Затем градиентный спуск немного подправляет каждый вес.",
                ex: "После проигранного матча тренер прокручивает запись назад от пропущенного гола: кто потерял мяч, кто был не на своём месте? И каждый игрок немного исправляет свою часть."
            }
        },
        {
            id: "clustering", cat: "learning", icon: "🍇", lessons: [2], lab: "cluster",
            related: ["unsupervised", "recommendation", "data", "embedding"],
            en: {
                name: "Clustering",
                aliases: ["cluster analysis", "k-means", "clusters"],
                short: "Grouping similar things together without being told what the groups are.",
                def: "An unsupervised learning task: the computer sorts examples into groups (clusters) of similar things without being told what the groups are. A popular method, k-means, places k group centres, gives every point to the nearest centre, moves each centre to the middle of its points and repeats until nothing changes.",
                ex: "A music app can group songs by tempo, energy and mood without anyone naming the groups. Later, people might call one of them “workout songs”."
            },
            ru: {
                name: "Кластеризация",
                aliases: ["кластерный анализ", "k-means", "метод k-средних", "кластеры"],
                short: "Объединение похожих объектов в группы, когда никто заранее не говорит, какие это группы.",
                def: "Задача обучения без учителя: компьютер раскладывает примеры по группам (кластерам) похожих, хотя ему не говорят, какие группы должны быть. Популярный метод k-средних (k-means) ставит k центров групп, относит каждую точку к ближайшему центру, сдвигает каждый центр в середину его точек и повторяет это, пока картина не перестанет меняться.",
                ex: "Музыкальное приложение может разложить песни на группы по темпу, энергии и настроению, и никто не будет заранее называть эти группы. Потом люди, может быть, назовут одну из них «песни для тренировки»."
            }
        },
        {
            id: "evolutionary-algorithm", cat: "learning", icon: "🧬", lessons: [], lab: "evolve",
            related: ["gradient-descent", "reinforcement"],
            en: {
                name: "Evolutionary algorithm",
                aliases: ["genetic algorithm", "neuroevolution"],
                short: "A way of solving problems that copies evolution: the best of many tries are kept, mixed and slightly changed, generation after generation.",
                def: "A way of finding good solutions by copying evolution. It starts with many random tries, keeps the best ones, mixes them, changes them a little at random, and repeats this for many generations. Genetic algorithms are the best-known kind. When the tries are neural networks, it is called neuroevolution.",
                ex: "Plant breeders keep the seeds of the sweetest tomatoes and cross the plants, year after year. In a game, the same idea can evolve little cars: the ones that drive furthest become the parents of the next generation."
            },
            ru: {
                name: "Эволюционный алгоритм",
                aliases: ["генетический алгоритм", "нейроэволюция"],
                short: "Способ решать задачи по образцу эволюции: из множества попыток отбирают лучшие, скрещивают их и немного меняют — поколение за поколением.",
                def: "Способ находить хорошие решения по образцу эволюции. Сначала берут много случайных вариантов, оставляют лучшие, смешивают их, случайно немного меняют — и повторяют это много поколений подряд. Самый известный вид — генетические алгоритмы. Если варианты — это нейросети, такой подход называют нейроэволюцией.",
                ex: "Селекционеры год за годом оставляют семена самых сладких помидоров и скрещивают растения. В игре по тому же принципу можно «вывести» машинки: те, что проехали дальше всех, становятся родителями следующего поколения."
            }
        },

        // ===== Computer vision =====
        {
            id: "computer-vision", cat: "vision", icon: "👁️", lessons: [5, 7], lab: "vision",
            related: ["pixel", "cnn", "adversarial-example", "deep-learning", "robot", "multimodal"],
            en: {
                name: "Computer vision",
                aliases: ["image recognition", "face recognition", "facial recognition"],
                short: "The area of AI that helps computers find and recognise things in photos and videos.",
                def: "The area of AI that helps computers “see”: find and recognise objects, faces, text and movement in photos and videos.",
                ex: "When your gallery app groups photos by the people in them, or a self-driving car spots a pedestrian, that's computer vision."
            },
            ru: {
                name: "Компьютерное зрение",
                aliases: ["распознавание изображений", "распознавание лиц"],
                short: "Область ИИ, которая учит компьютеры находить и узнавать то, что есть на фото и видео.",
                def: "Область ИИ, которая учит компьютеры «видеть»: находить и узнавать предметы, лица, текст и движение на фото и видео.",
                ex: "Когда галерея в телефоне группирует фото по людям или беспилотный автомобиль замечает пешехода — это компьютерное зрение."
            }
        },
        {
            id: "pixel", cat: "vision", icon: "🟦", lessons: [7], lab: "vision",
            related: ["computer-vision", "convolution", "cnn"],
            en: {
                name: "Pixel",
                aliases: ["RGB", "megapixel*"],
                short: "One tiny square of a digital picture, stored as numbers that say how bright it is or what colour it has.",
                def: "One tiny square dot of a digital image. To a computer, a picture is just a grid of pixels, and each pixel is stored as numbers: in a greyscale picture one brightness, usually from 0 (black) to 255 (white); in a colour picture three numbers, for red, green and blue (RGB).",
                ex: "A 12-megapixel phone photo has about 12 million pixels. Zoom in far enough and you'll see the little squares."
            },
            ru: {
                name: "Пиксель",
                aliases: ["RGB", "мегапиксел*"],
                short: "Крошечный квадратик цифровой картинки, который хранится как числа: насколько он яркий или какого он цвета.",
                def: "Крошечная квадратная точка цифрового изображения. Для компьютера картинка — это просто сетка пикселей, а каждый пиксель хранится как числа: на чёрно-белой картинке (в оттенках серого) — одна яркость, обычно от 0 (чёрный) до 255 (белый), а на цветной — три числа: красный, зелёный и синий (RGB).",
                ex: "Фото с телефона на 12 мегапикселей — это около 12 миллионов пикселей. Если сильно увеличить снимок, станут видны маленькие квадратики."
            }
        },
        {
            id: "convolution", cat: "vision", icon: "🔍", lessons: [7], lab: "vision",
            related: ["pixel", "cnn"],
            en: {
                name: "Convolution",
                aliases: ["image filter", "convolution filter", "convolutional filter"],
                short: "Sliding a small grid of numbers (a filter) across a picture to find patterns such as edges.",
                def: "A way of finding patterns in a picture: a small grid of numbers, called a filter, slides over the image. At every spot it multiplies the pixels under it by its own numbers and adds the results up. Where the pattern it looks for is, for example an edge, the result is large.",
                ex: "The blur and sharpen effects in a photo editor are convolutions with simple filters. A filter that compares each pixel's left and right neighbours lights up vertical edges."
            },
            ru: {
                name: "Свёртка",
                aliases: ["фильтр изображения", "свёрточный фильтр"],
                short: "Скольжение маленькой сетки чисел (фильтра) по картинке, чтобы найти узоры, например края.",
                def: "Способ искать узоры на картинке: маленькая сетка чисел — фильтр — скользит по изображению. В каждом месте она умножает пиксели под собой на свои числа и складывает результаты. Там, где есть искомый узор, например край, получается большое число.",
                ex: "Эффекты «размытие» и «резкость» в фоторедакторе — это свёртки с простыми фильтрами. А фильтр, который сравнивает соседей каждого пикселя слева и справа, подсвечивает вертикальные края."
            }
        },
        {
            id: "cnn", cat: "vision", icon: "🧱", lessons: [7], lab: "vision",
            related: ["convolution", "pixel", "computer-vision", "neural-network", "adversarial-example"],
            en: {
                name: "Convolutional neural network (CNN)",
                aliases: ["convolutional network", "ConvNet"],
                short: "A neural network for pictures whose layers use convolutions to find patterns, from edges up to whole objects.",
                def: "A neural network built for images. Its first layers use convolutions to find simple patterns such as edges; the next layers combine them into shapes, then parts, then whole objects. During training, the network learns its filters by itself.",
                ex: "Apps that tell you which plant or animal is in your photo often use networks like this."
            },
            ru: {
                name: "Свёрточная нейронная сеть (CNN)",
                aliases: ["свёрточная нейросеть", "свёрточная сеть"],
                short: "Нейросеть для изображений, слои которой с помощью свёрток находят узоры — от краёв до целых предметов.",
                def: "Нейросеть, созданная для работы с изображениями. Её первые слои с помощью свёрток находят простые узоры, например края; следующие слои складывают их в формы, затем в части, а потом в целые предметы. Фильтры сеть подбирает сама во время обучения.",
                ex: "Приложения, которые по фото узнают растение или животное, часто используют такие сети."
            }
        },
        {
            id: "adversarial-example", cat: "vision", icon: "🐼", lessons: [7], lab: "",
            related: ["computer-vision", "cnn", "red-teaming"],
            en: {
                name: "Adversarial example",
                aliases: ["adversarial attack", "adversarial image"],
                short: "An input changed very slightly, often invisibly to people, so that an AI model makes a mistake.",
                def: "An input that has been changed on purpose, often so slightly that people don't notice, to make an AI model give a wrong answer. It shows that models can rely on patterns very different from the ones people use.",
                ex: "In a famous 2014 experiment, researchers added a faint pattern of noise to a photo of a panda. To people it still looked like a panda, but the model became very sure it was a gibbon."
            },
            ru: {
                name: "Состязательный пример",
                aliases: ["состязательная атака"],
                short: "Входные данные, изменённые совсем чуть-чуть (часто незаметно для людей), чтобы модель ИИ ошиблась.",
                def: "Входные данные, которые нарочно изменили — часто так слабо, что человек ничего не заметит, — чтобы модель ИИ дала неверный ответ. Такие примеры показывают, что модели могут опираться совсем не на те признаки, что люди.",
                ex: "В известном эксперименте 2014 года исследователи добавили к фото панды едва заметный «шум». Люди по-прежнему видели панду, а модель была уверена, что это гиббон."
            }
        },
        {
            id: "data-augmentation", cat: "vision", icon: "🔄", lessons: [], lab: "draw",
            related: ["dataset", "overfitting", "generalization"],
            en: {
                name: "Data augmentation",
                aliases: ["augmentation", "augmented data"],
                short: "Making more training examples from the ones you have, for example by flipping, turning or shifting pictures.",
                def: "Making extra training examples from the ones you already have, by changing them in ways that don't change their meaning: flipping, turning, shifting or zooming a picture, or adding a little noise. It helps a model generalise instead of memorising.",
                ex: "If you have 20 drawings of cats, you can turn each one a little to the left and to the right and shift it up and down. Now the model sees hundreds of cat drawings."
            },
            ru: {
                name: "Аугментация данных",
                aliases: ["аугментация", "расширение данных"],
                short: "Создание новых обучающих примеров из уже имеющихся, например отражением, поворотом или сдвигом картинок.",
                def: "Создание дополнительных обучающих примеров из тех, что уже есть: их меняют так, чтобы смысл остался прежним, — отражают, поворачивают, сдвигают или увеличивают картинку, добавляют немного шума. Это помогает модели обобщать, а не зазубривать.",
                ex: "Если у тебя 20 рисунков кошек, каждый можно немного повернуть влево и вправо и сдвинуть вверх и вниз. И вот модель видит уже сотни рисунков кошек."
            }
        },

        // ===== Trial and error =====
        {
            id: "reinforcement", cat: "trial", icon: "🎮", lessons: [2, 8], lab: "maze",
            related: ["supervised", "agent", "reward", "q-learning", "rlhf", "evolutionary-algorithm"],
            en: {
                name: "Reinforcement learning",
                aliases: ["RL"],
                short: "Learning by trial and error: an AI tries actions and gets rewards or penalties for the results.",
                def: "Learning by trial and error. The AI tries actions, gets rewards for good results and penalties for bad ones, and slowly finds a strategy that earns the most reward.",
                ex: "That's how a computer can learn a video game: at first it presses buttons at random, notices what earns points and keeps getting better — a bit like training a dog with treats."
            },
            ru: {
                name: "Обучение с подкреплением",
                aliases: [],
                short: "Обучение методом проб и ошибок: ИИ пробует действия и получает за результат награду или штраф.",
                def: "Обучение методом проб и ошибок. ИИ пробует действия, получает «награду» за хорошие результаты и «штраф» за плохие и постепенно находит стратегию, которая приносит больше всего наград.",
                ex: "Так компьютер может научиться видеоигре: сначала жмёт кнопки наугад, замечает, что приносит очки, и играет всё лучше — немного похоже на дрессировку собаки с лакомствами."
            }
        },
        {
            id: "agent", cat: "trial", icon: "🕹️", lessons: [8], lab: "maze",
            related: ["reinforcement", "reward", "exploration", "q-learning", "robot", "reward-hacking"],
            en: {
                name: "Agent",
                aliases: ["AI agent"],
                short: "An AI that acts on its own to reach a goal: it notices what is happening, chooses an action and sees the result.",
                def: "In AI, anything that acts to reach a goal: it observes its surroundings (its environment), chooses an action, sees what happens and chooses again. In reinforcement learning, the agent is the learner. By 2025, people also called chatbots that can use tools, search the web or click through websites to finish a task “AI agents”.",
                ex: "A robot vacuum is a simple agent: it senses walls and dirt, decides where to go next, and its goal is a clean floor. In a video game, a character controlled by an AI is an agent too."
            },
            ru: {
                name: "Агент",
                aliases: ["ИИ-агент", "агент ИИ"],
                short: "ИИ, который сам действует ради цели: замечает, что происходит, выбирает действие и видит результат.",
                def: "В ИИ — тот, кто действует ради цели: наблюдает за окружающим миром (средой), выбирает действие, смотрит, что получилось, и выбирает снова. В обучении с подкреплением агент — это ученик. К 2025 году «ИИ-агентами» стали называть и чат-ботов, которые умеют пользоваться инструментами, искать в интернете или кликать по сайтам, чтобы выполнить задачу.",
                ex: "Робот-пылесос — простой агент: он замечает стены и грязь, решает, куда ехать дальше, а его цель — чистый пол. В видеоигре персонаж, которым управляет ИИ, — тоже агент."
            }
        },
        {
            id: "reward", cat: "trial", icon: "🍪", lessons: [8], lab: "maze",
            related: ["reinforcement", "agent", "reward-hacking", "q-learning", "rlhf", "exploration"],
            en: {
                name: "Reward",
                aliases: ["reward signal"],
                short: "The score an agent gets after an action, telling it how good the result was.",
                def: "In reinforcement learning, a number the agent gets after an action: positive for a good result, negative (a penalty) for a bad one. Nobody tells the agent the right action; it learns only from rewards, and its goal is to collect as much reward as possible over time.",
                ex: "A dog learning a trick gets a treat when it gets it right. In a game, the points an AI player scores work as its reward."
            },
            ru: {
                name: "Награда",
                aliases: ["вознаграждение"],
                short: "Очки, которые агент получает после действия: они показывают, насколько хорош был результат.",
                def: "В обучении с подкреплением — число, которое агент получает после действия: положительное за хороший результат и отрицательное (штраф) за плохой. Правильное действие агенту никто не подсказывает: он учится только по наградам, и его цель — набрать как можно больше награды за всё время.",
                ex: "Собака, которая учит трюк, получает лакомство, когда всё делает правильно. В игре очки, которые набирает ИИ-игрок, работают как его награда."
            }
        },
        {
            id: "exploration", cat: "trial", icon: "🗺️", lessons: [8], lab: "maze",
            related: ["agent", "q-learning", "reward"],
            en: {
                name: "Exploration vs. exploitation",
                aliases: ["exploration", "exploitation", "explore or exploit", "epsilon-greedy"],
                short: "The choice an agent faces between trying something new (exploring) and using what already works (exploiting).",
                def: "The choice every learning agent faces: try something new to find out whether it's better (exploration), or use what has worked best so far (exploitation). Only exploiting can miss the best option; only exploring wastes time. A simple rule is to explore now and then, for example 1 time in 10, and exploit the rest of the time.",
                ex: "At your favourite café, do you order your usual (exploit) or try something new on the menu (explore)? If you never try anything new, you'll never find out there's something you'd like even more."
            },
            ru: {
                name: "Исследование и использование",
                aliases: ["исследование или использование", "исследовать или использовать"],
                short: "Выбор агента: попробовать что-то новое (исследование) или делать то, что уже работает (использование).",
                def: "Выбор, перед которым стоит любой обучающийся агент: попробовать что-то новое, чтобы узнать, не лучше ли оно (исследование), или делать то, что пока работало лучше всего (использование). Кто только использует, может упустить лучший вариант; кто только исследует, тратит время зря. Простое правило — иногда исследовать, например в 1 случае из 10, а в остальное время использовать.",
                ex: "В любимом кафе ты заказываешь то же, что всегда (использование), или пробуешь новое блюдо из меню (исследование)? Если никогда не пробовать новое, так и не узнаешь, что есть что-то ещё вкуснее."
            }
        },
        {
            id: "q-learning", cat: "trial", icon: "🔢", lessons: [8], lab: "maze",
            related: ["reinforcement", "reward", "agent", "exploration"],
            en: {
                name: "Q-learning",
                aliases: ["Q-value", "Q-table"],
                short: "A reinforcement learning method in which an agent learns a score (a Q-value) for every action in every situation.",
                def: "A reinforcement learning method. The agent keeps a score, a Q-value, for each action in each situation: how much reward it expects if it takes that action and plays well afterwards. After every step, it updates that score using the reward it just got and the best score of the situation it landed in. Over many tries, the scores show the best action everywhere.",
                ex: "Picture a robot in a maze with a scoreboard on every square: one score each for going up, down, left and right. At first every score is zero. When the robot reaches the exit, the move that got it there scores higher; over many runs, good scores spread back from the exit, until the robot can simply follow the highest numbers."
            },
            ru: {
                name: "Q-обучение",
                aliases: ["Q-learning", "Q-значение", "Q-таблица"],
                short: "Метод обучения с подкреплением, в котором агент выучивает оценку (Q-значение) каждого действия в каждой ситуации.",
                def: "Метод обучения с подкреплением. Агент хранит оценку — Q-значение — для каждого действия в каждой ситуации: сколько награды он ожидает получить, если сделает это действие, а дальше будет действовать хорошо. После каждого шага он обновляет эту оценку с учётом полученной награды и лучшей оценки ситуации, в которую попал. За много попыток оценки начинают показывать лучшее действие в любом месте.",
                ex: "Представь робота в лабиринте и табло в каждой клетке: по оценке для шага вверх, вниз, влево и вправо. Сначала все оценки нулевые. Когда робот добирается до выхода, ход, который туда привёл, получает оценку выше; за много забегов хорошие оценки расходятся от выхода назад, и в конце робот просто идёт по самым большим числам."
            }
        },
        {
            id: "reward-hacking", cat: "trial", icon: "🕳️", lessons: [8], lab: "",
            related: ["reward", "agent", "alignment"],
            en: {
                name: "Reward hacking",
                aliases: ["specification gaming", "reward gaming"],
                short: "When an AI finds a loophole that earns lots of reward without doing what its designers really wanted.",
                def: "When an agent finds a way to get a high reward without doing what the people who designed the reward actually wanted. The AI isn't cheating on purpose: it does exactly what the reward measures, and the reward measured the wrong thing.",
                ex: "In a 2016 experiment by OpenAI, an AI playing the boat-racing game CoastRunners was rewarded for points. It found it could score more by circling in a lagoon, hitting the same targets again and again, than by finishing the race."
            },
            ru: {
                name: "Взлом награды",
                aliases: ["reward hacking"],
                short: "Когда ИИ находит лазейку, которая приносит много награды, но не делает того, чего на самом деле хотели создатели.",
                def: "Когда агент находит способ получать высокую награду, не делая того, чего на самом деле хотели люди, придумавшие награду. ИИ не жульничает нарочно: он делает ровно то, что измеряет награда, а она измеряла не то.",
                ex: "В эксперименте OpenAI 2016 года ИИ играл в гонки на катерах CoastRunners и получал награду за очки. Он обнаружил, что очков выйдет больше, если кружить в лагуне и сбивать одни и те же мишени снова и снова, чем если доехать до финиша."
            }
        },
        {
            id: "rlhf", cat: "trial", icon: "👍", lessons: [8, 9], lab: "",
            related: ["reinforcement", "reward", "fine-tuning", "chatbot", "alignment"],
            en: {
                name: "Reinforcement learning from human feedback (RLHF)",
                aliases: ["human feedback", "learning from human feedback"],
                short: "A way to make a chatbot more helpful: people rate its answers, and those ratings become its reward in reinforcement learning.",
                def: "A way to make a language model more helpful and polite after its main training. People compare pairs of its answers and pick the better one; a second model learns to predict their choices; then the language model is trained with reinforcement learning to give answers that this judge would score highly.",
                ex: "Imagine a chef who cooks two versions of every dish while tasters say which one they prefer. Soon the chef can guess what the tasters like and keeps improving the recipes to please them."
            },
            ru: {
                name: "Обучение с подкреплением на основе отзывов людей (RLHF)",
                aliases: ["отзывы людей", "обратная связь от людей", "обучение на отзывах людей"],
                short: "Способ сделать чат-бота полезнее: люди оценивают его ответы, и эти оценки становятся наградой при обучении с подкреплением.",
                def: "Способ после основного обучения сделать языковую модель полезнее и вежливее. Люди сравнивают пары её ответов и выбирают лучший; вторая модель учится предсказывать их выбор; а затем языковую модель обучают с подкреплением давать ответы, которые этот «судья» оценил бы высоко.",
                ex: "Представь повара, который готовит каждое блюдо в двух вариантах, а дегустаторы говорят, какой вкуснее. Скоро повар начинает угадывать их вкусы и улучшает рецепты, чтобы им угодить."
            }
        },

        // ===== Language models =====
        {
            id: "llm", cat: "language", icon: "📚", lessons: [4, 9], lab: "chatbot",
            related: ["token", "next-token", "transformer", "chatbot", "nlp", "generative-ai"],
            en: {
                name: "Large language model (LLM)",
                aliases: ["language model", "large language model", "GPT"],
                short: "A huge neural network trained on enormous amounts of text to predict the next token.",
                def: "A huge neural network trained on enormous amounts of text to predict the next word (token). This simple skill lets it answer questions, write and translate.",
                ex: "The AI behind chatbots like ChatGPT is a large language model."
            },
            ru: {
                name: "Большая языковая модель (LLM)",
                aliases: ["языковая модель", "большая языковая модель", "БЯМ"],
                short: "Огромная нейросеть, обученная на гигантском количестве текстов предсказывать следующий токен.",
                def: "Огромная нейросеть, обученная на гигантском количестве текстов предсказывать следующее слово (токен). Этот простой навык позволяет ей отвечать на вопросы, писать тексты и переводить.",
                ex: "За чат-ботами вроде ChatGPT стоит большая языковая модель."
            }
        },
        {
            id: "token", cat: "language", icon: "🔤", lessons: [4, 9], lab: "chatbot",
            related: ["llm", "nlp", "next-token", "context-window", "embedding", "prompt"],
            en: {
                name: "Token",
                aliases: ["tokens"],
                short: "A small piece of text, such as a word or part of a word, that a language model reads and writes.",
                def: "A small piece of text — a word, part of a word or a punctuation mark — that a language model reads and writes. Models measure text in tokens.",
                ex: "A long word like “unbelievable” might be split into tokens such as “un”, “believ” and “able”."
            },
            ru: {
                name: "Токен",
                aliases: [],
                short: "Маленький кусочек текста, например слово или часть слова, который читает и пишет языковая модель.",
                def: "Маленький кусочек текста — слово, часть слова или знак препинания, — который читает и пишет языковая модель. Объём текста модели считают в токенах.",
                ex: "Длинное слово «невероятный» модель может разбить на токены вроде «не», «вероят» и «ный»."
            }
        },
        {
            id: "transformer", cat: "language", icon: "⚡", lessons: [9], lab: "chatbot",
            related: ["llm", "attention", "neural-network"],
            en: {
                name: "Transformer",
                aliases: ["attention is all you need"],
                short: "A neural network design from 2017 that uses attention to work out how the words of a text relate.",
                def: "A neural network design from 2017 that uses “attention” to look at all the words of a text at once and work out how they relate. Most modern language models are built on it.",
                ex: "The “T” in GPT stands for “Transformer”."
            },
            ru: {
                name: "Трансформер",
                aliases: [],
                short: "Архитектура нейросети 2017 года, которая с помощью механизма внимания выясняет, как связаны слова текста.",
                def: "Архитектура нейросети, появившаяся в 2017 году. С помощью механизма «внимания» она смотрит сразу на все слова текста и выясняет, как они связаны. На ней построено большинство современных языковых моделей.",
                ex: "Буква «T» в названии GPT означает «Transformer» — трансформер."
            }
        },
        {
            id: "next-token", cat: "language", icon: "➡️", lessons: [4, 9], lab: "predictor",
            related: ["llm", "token", "temperature", "attention", "hallucination", "reasoning-model"],
            en: {
                name: "Next-token prediction",
                aliases: ["next word prediction", "predict the next word", "predicting the next word", "autocomplete"],
                short: "What a language model does: it gives every possible next token a probability, picks one, and repeats.",
                def: "The basic skill at the heart of every language model. Given a text, it gives every token it knows a probability of coming next, picks one, adds it to the text and does the same again. A whole answer is written this way, one token at a time.",
                ex: "The word suggestions above your phone's keyboard are a tiny version of this: after “See you”, it might offer “tomorrow”, “soon” and “later”."
            },
            ru: {
                name: "Предсказание следующего токена",
                aliases: ["предсказание следующего слова", "автодополнение"],
                short: "То, что делает языковая модель: даёт каждому возможному следующему токену вероятность, выбирает один и повторяет.",
                def: "Главный навык, на котором держится любая языковая модель. Получив текст, она даёт каждому известному ей токену вероятность оказаться следующим, выбирает один, добавляет его к тексту и делает то же самое снова. Так, по одному токену, пишется весь ответ.",
                ex: "Подсказки слов над клавиатурой телефона — крошечная версия того же: после «До» он может предложить «завтра», «встречи» и «свидания»."
            }
        },
        {
            id: "attention", cat: "language", icon: "🔦", lessons: [9], lab: "chatbot",
            related: ["transformer", "next-token", "context-window"],
            en: {
                name: "Attention",
                aliases: ["attention mechanism", "self-attention"],
                short: "The part of a transformer that lets each word look at the other words and decide which of them matter for its meaning.",
                def: "The key idea inside transformers. For every word (token), the model looks back at the other words of the text and works out which ones matter for understanding it, giving them more weight. That's how it keeps track of what “it” or “she” refers to, even many words later.",
                ex: "In “The robot dropped the box because it was heavy”, attention helps the model link “it” to “the box”. Change “heavy” to “clumsy”, and “it” now points to the robot."
            },
            ru: {
                name: "Механизм внимания",
                aliases: ["внимание", "самовнимание"],
                short: "Часть трансформера, которая позволяет каждому слову «посмотреть» на остальные и решить, какие из них важны для его смысла.",
                def: "Главная идея внутри трансформеров. Для каждого слова (токена) модель просматривает остальные слова текста и выясняет, какие из них важны, чтобы его понять, — им она придаёт больший вес. Так модель следит, к чему относятся «он» или «она», даже через много слов.",
                ex: "Во фразе «Робот уронил чемодан, потому что он был тяжёлым» внимание помогает модели понять, что «он» — это чемодан. Замени «тяжёлым» на «неуклюжим» — и «он» уже указывает на робота."
            }
        },
        {
            id: "temperature", cat: "language", icon: "🌡️", lessons: [4, 9], lab: "chatbot",
            related: ["next-token", "hallucination"],
            en: {
                name: "Temperature",
                aliases: ["sampling temperature"],
                short: "A setting that controls how predictable or surprising a language model's choice of words is.",
                def: "A setting that changes how a language model picks the next token. At a low temperature it almost always takes the most likely token, so its answers are predictable and repeat themselves. At a higher temperature less likely tokens get more of a chance, so answers are more varied and surprising, but also more often odd or wrong.",
                ex: "Ask for the start of a story at a low temperature and you'll get almost the same one every time. Turn it up and every story is different; at very high values the sentences stop making sense."
            },
            ru: {
                name: "Температура",
                aliases: ["температура генерации"],
                short: "Настройка, которая определяет, насколько предсказуемо или неожиданно языковая модель выбирает слова.",
                def: "Настройка, которая меняет то, как языковая модель выбирает следующий токен. При низкой температуре она почти всегда берёт самый вероятный токен, поэтому ответы предсказуемые и повторяются. При высокой у менее вероятных токенов больше шансов, поэтому ответы разнообразнее и неожиданнее, но и чаще бывают странными или неверными.",
                ex: "Попроси начало рассказа при низкой температуре — и почти каждый раз получишь одно и то же. Подними её — и все рассказы будут разными, а при очень высоких значениях предложения перестанут иметь смысл."
            }
        },
        {
            id: "embedding", cat: "language", icon: "📍", lessons: [], lab: "chatbot",
            related: ["token", "clustering", "nlp"],
            en: {
                name: "Embedding",
                aliases: ["word embedding", "word vector"],
                short: "A list of numbers that stands for a word, picture or other thing, so that similar things get similar numbers.",
                def: "A way of turning a word (or a token, a picture, a song) into a list of numbers, like a point on a map with many directions. Things with similar meanings end up close together, so the computer can measure how alike two things are. Language models turn every token into an embedding before working with it.",
                ex: "On such a map, “cat” lands near “kitten” and “dog”, and far from “bicycle”. A music app can use the same trick to find songs that sound like your favourites."
            },
            ru: {
                name: "Эмбеддинг (векторное представление)",
                aliases: ["вектор слова"],
                short: "Список чисел, который обозначает слово, картинку или что-то ещё так, что у похожего получаются похожие числа.",
                def: "Способ превратить слово (или токен, картинку, песню) в список чисел — как точку на карте, у которой много направлений. Близкие по смыслу вещи оказываются рядом, поэтому компьютер может измерить, насколько две вещи похожи. Языковая модель превращает каждый токен в эмбеддинг, прежде чем с ним работать.",
                ex: "На такой карте «кошка» оказывается рядом с «котёнком» и «собакой» и далеко от «велосипеда». Музыкальное приложение может тем же способом находить песни, похожие на твои любимые."
            }
        },
        {
            id: "context-window", cat: "language", icon: "📏", lessons: [9], lab: "",
            related: ["token", "attention", "prompt"],
            en: {
                name: "Context window",
                aliases: ["context length"],
                short: "The amount of text, measured in tokens, that a language model can take into account at once.",
                def: "The longest stretch of text, counted in tokens, that a language model can look at at one time: your messages, its own answers and any documents you give it. Whatever doesn't fit is invisible to it, which is why a very long chat can “forget” its beginning.",
                ex: "It's like reading a long story through a window that shows only the last few pages. By 2025, some models' windows held hundreds of thousands of tokens — as much as a whole novel, or more."
            },
            ru: {
                name: "Контекстное окно",
                aliases: ["окно контекста", "длина контекста"],
                short: "Объём текста в токенах, который языковая модель может учитывать одновременно.",
                def: "Самый длинный кусок текста (в токенах), который языковая модель может видеть за один раз: твои сообщения, её собственные ответы и документы, которые ты ей даёшь. Всё, что не помещается, для неё невидимо, поэтому в очень длинной переписке модель может «забыть» её начало.",
                ex: "Это как читать длинную историю через окошко, в котором видны только последние несколько страниц. К 2025 году у некоторых моделей в окно помещались сотни тысяч токенов — целый роман или даже больше."
            }
        },
        {
            id: "fine-tuning", cat: "language", icon: "🔧", lessons: [9], lab: "",
            related: ["training", "rlhf"],
            en: {
                name: "Fine-tuning",
                aliases: ["fine-tune"],
                short: "Extra training that takes a model that has already learned a lot and adjusts it for a particular job.",
                def: "Extra training for a model that has already learned from lots of general data, using a smaller set of examples for one particular task or style. Chatbots are built this way: first pre-training on huge amounts of text, then fine-tuning to follow instructions and give helpful answers.",
                ex: "A great all-round athlete who starts training for one sport doesn't learn to run from scratch, but sharpens the skills for that sport. A general language model can be fine-tuned in the same way to answer like a helpful assistant."
            },
            ru: {
                name: "Дообучение",
                aliases: ["файнтюнинг", "тонкая настройка"],
                short: "Дополнительное обучение, которое подстраивает уже многое знающую модель под конкретную задачу.",
                def: "Дополнительное обучение модели, которая уже училась на большом объёме общих данных: её учат на меньшем наборе примеров для одной задачи или одного стиля. Так делают чат-ботов: сначала предварительное обучение на огромном количестве текстов, затем дообучение, чтобы модель выполняла инструкции и давала полезные ответы.",
                ex: "Разносторонний спортсмен, который начинает готовиться к одному виду спорта, не учится заново бегать, а оттачивает навыки для этого вида. Так и общую языковую модель можно дообучить отвечать как полезный помощник."
            }
        },
        {
            id: "reasoning-model", cat: "language", icon: "🤔", lessons: [], lab: "",
            related: ["chatbot", "hallucination", "next-token"],
            en: {
                name: "Reasoning model",
                aliases: ["thinking model"],
                short: "A language model trained to work through a problem step by step before it gives its final answer.",
                def: "A language model trained to write out its working before it answers: it can break a problem into steps, check them and try another way if something doesn't add up. This makes it better at maths, coding and puzzles, but slower. The first widely used ones appeared in 2024. They still make mistakes, so their answers need checking too.",
                ex: "Like solving a maths problem on scrap paper before writing down the answer, instead of shouting out the first number that comes to mind."
            },
            ru: {
                name: "Рассуждающая модель",
                aliases: ["модель рассуждений", "думающая модель"],
                short: "Языковая модель, которую научили решать задачу шаг за шагом, прежде чем дать окончательный ответ.",
                def: "Языковая модель, которую обучили перед ответом расписывать ход решения: она может разбить задачу на шаги, проверить их и попробовать другой путь, если что-то не сходится. Поэтому она лучше справляется с математикой, программированием и головоломками, но отвечает медленнее. Первые широко известные такие модели появились в 2024 году. Они тоже ошибаются, поэтому их ответы нужно проверять.",
                ex: "Как решать задачу по математике сначала на черновике, а не выкрикивать первое число, которое пришло в голову."
            }
        },

        // ===== Generative AI =====
        {
            id: "generative-ai", cat: "generative", icon: "✨", lessons: [4, 10], lab: "predictor",
            related: ["llm", "prompt", "diffusion", "gan", "multimodal", "deepfake"],
            en: {
                name: "Generative AI",
                aliases: ["generative artificial intelligence", "GenAI"],
                short: "AI that creates new text, images, music, video or code from patterns it has learned.",
                def: "AI that creates new content — text, images, music, video or code — based on patterns it learned from huge numbers of examples.",
                ex: "Asking an app to draw “a cat astronaut in watercolour” and getting a brand-new picture is generative AI at work."
            },
            ru: {
                name: "Генеративный ИИ",
                aliases: ["генеративный искусственный интеллект", "генеративные нейросети"],
                short: "ИИ, который создаёт новые тексты, картинки, музыку, видео или код по выученным закономерностям.",
                def: "ИИ, который создаёт новый контент — тексты, картинки, музыку, видео или код — на основе закономерностей, выученных на огромном количестве примеров.",
                ex: "Ты просишь приложение нарисовать «кота-космонавта акварелью» и получаешь совершенно новую картинку — это работа генеративного ИИ."
            }
        },
        {
            id: "chatbot", cat: "generative", icon: "💬", lessons: [4, 9], lab: "chatbot",
            related: ["llm", "prompt", "turing-test", "hallucination", "rlhf", "reasoning-model"],
            en: {
                name: "Chatbot",
                aliases: ["chat bot", "ChatGPT", "AI assistant"],
                short: "A program you can have a conversation with by typing or speaking.",
                def: "A program you can have a conversation with by typing or speaking. Modern chatbots run on large language models; the first ones followed simple rules.",
                ex: "ELIZA (1966) was one of the first chatbots. Today millions of people chat with AI assistants every day."
            },
            ru: {
                name: "Чат-бот",
                aliases: ["чатбот", "ИИ-ассистент", "ИИ-помощник"],
                short: "Программа, с которой можно переписываться или разговаривать.",
                def: "Программа, с которой можно переписываться или разговаривать. Современные чат-боты работают на больших языковых моделях, а первые следовали простым правилам.",
                ex: "ELIZA (1966) была одним из первых чат-ботов. Сегодня миллионы людей каждый день общаются с ИИ-помощниками."
            }
        },
        {
            id: "prompt", cat: "generative", icon: "⌨️", lessons: [4, 10, 12], lab: "",
            related: ["chatbot", "generative-ai", "token", "context-window", "multimodal"],
            en: {
                name: "Prompt",
                aliases: ["prompting", "prompt engineering"],
                short: "The instruction or question you give to a generative AI.",
                def: "The instruction or question you give to a generative AI. Clear, specific prompts with some context usually get much better results.",
                ex: "“Explain photosynthesis to a 13-year-old in three short bullet points” works far better than just typing “photosynthesis”."
            },
            ru: {
                name: "Промпт (запрос)",
                aliases: ["промт", "запрос к ИИ"],
                short: "Инструкция или вопрос, который ты даёшь генеративному ИИ.",
                def: "Инструкция или вопрос, который ты даёшь генеративному ИИ. Чёткие и конкретные запросы с контекстом обычно дают гораздо лучший результат.",
                ex: "Запрос «Объясни фотосинтез 13-летнему в трёх коротких пунктах» сработает гораздо лучше, чем просто «фотосинтез»."
            }
        },
        {
            id: "hallucination", cat: "generative", icon: "🌀", lessons: [4, 9, 11], lab: "",
            related: ["chatbot", "next-token", "temperature", "reasoning-model"],
            en: {
                name: "Hallucination",
                aliases: ["hallucinat*"],
                short: "When an AI confidently gives an answer that sounds right but is false or made up.",
                def: "When an AI confidently gives an answer that sounds right but is false or made up, such as a fake fact, quote or source.",
                ex: "A chatbot might invent a book and an author that don't exist. That's why you should check important facts in reliable sources."
            },
            ru: {
                name: "Галлюцинация",
                aliases: ["галлюцинир*"],
                short: "Когда ИИ уверенно выдаёт правдоподобный, но ложный или выдуманный ответ.",
                def: "Когда ИИ уверенно выдаёт ответ, который звучит правдоподобно, но на самом деле ложный или выдуманный: несуществующий факт, цитату или источник.",
                ex: "Чат-бот может придумать книгу и автора, которых не существует. Поэтому важные факты всегда проверяй в надёжных источниках."
            }
        },
        {
            id: "diffusion", cat: "generative", icon: "🌫️", lessons: [10], lab: "",
            related: ["generative-ai", "gan", "watermark"],
            en: {
                name: "Diffusion model",
                aliases: ["image generator", "text-to-image"],
                short: "An image generator that learns to remove noise step by step, turning random speckles into a picture that matches a prompt.",
                def: "A kind of generative model behind many image generators. During training it sees pictures with more and more random noise added, and learns to undo the noise one small step at a time. To make a new image, it starts from pure noise and removes it step by step, guided by your text prompt.",
                ex: "Imagine a photo slowly disappearing under TV-like static. A diffusion model learns to play that film backwards. Give it fresh static and the prompt “a cat in a spacesuit”, and a new picture appears out of the noise."
            },
            ru: {
                name: "Диффузионная модель",
                aliases: ["генератор изображений", "генератор картинок"],
                short: "Генератор изображений, который учится шаг за шагом убирать шум и превращает случайную «рябь» в картинку по запросу.",
                def: "Вид генеративной модели, на котором работают многие генераторы изображений. Во время обучения она видит картинки, к которым добавляют всё больше случайного шума, и учится убирать этот шум по одному маленькому шагу. Чтобы создать новую картинку, она начинает с чистого шума и шаг за шагом убирает его, ориентируясь на твой текстовый запрос.",
                ex: "Представь фотографию, которая постепенно исчезает под «рябью», как в старом телевизоре. Диффузионная модель учится прокручивать этот фильм назад. Дай ей новую «рябь» и запрос «кот в скафандре» — и из шума проступит новая картинка."
            }
        },
        {
            id: "gan", cat: "generative", icon: "🕵️", lessons: [10], lab: "",
            related: ["generative-ai", "diffusion", "deepfake"],
            en: {
                name: "Generative adversarial network (GAN)",
                aliases: [],
                short: "Two neural networks trained against each other: one makes fakes, the other tries to catch them, and both get better.",
                def: "An idea from 2014 for generating images: two neural networks compete. The generator makes fake images; the discriminator tries to tell them from real ones. Each improves by beating the other, until the fakes look real. GANs led image generation for several years, before diffusion models took over.",
                ex: "Think of a forger and a detective: every time the detective spots a fake, the forger learns to make better ones, and the detective learns to look closer."
            },
            ru: {
                name: "Генеративно-состязательная сеть (GAN)",
                aliases: [],
                short: "Две нейросети, которые учатся друг против друга: одна делает подделки, другая их разоблачает, и обе становятся лучше.",
                def: "Идея 2014 года для создания изображений: соревнуются две нейросети. Генератор делает поддельные картинки, а дискриминатор пытается отличить их от настоящих. Каждая становится лучше, обыгрывая другую, пока подделки не начнут выглядеть как настоящие. Несколько лет GAN были главным способом генерировать картинки, а потом их место заняли диффузионные модели.",
                ex: "Это как фальшивомонетчик и детектив: каждый раз, когда детектив находит подделку, фальшивомонетчик учится делать её лучше, а детектив — смотреть внимательнее."
            }
        },
        {
            id: "multimodal", cat: "generative", icon: "🖼️", lessons: [], lab: "",
            related: ["generative-ai", "prompt", "computer-vision"],
            en: {
                name: "Multimodal AI",
                aliases: ["multimodal*"],
                short: "AI that can work with more than one kind of data, such as text, images and sound, in the same conversation.",
                def: "AI that understands or creates more than one kind of data, such as text, images, sound or video, and can connect them. By 2025, many chatbots could look at a photo, listen to speech and answer in text or with a voice.",
                ex: "You take a photo of what's in your fridge and ask what you could cook. The AI has to recognise the food in the picture and then write a recipe in words."
            },
            ru: {
                name: "Мультимодальный ИИ",
                aliases: ["мультимодальн*"],
                short: "ИИ, который может работать сразу с несколькими видами данных — текстом, картинками, звуком — в одном разговоре.",
                def: "ИИ, который понимает или создаёт несколько видов данных — текст, изображения, звук или видео — и может связывать их между собой. К 2025 году многие чат-боты умели рассмотреть фото, послушать речь и ответить текстом или голосом.",
                ex: "Ты фотографируешь содержимое холодильника и спрашиваешь, что можно приготовить. ИИ должен узнать продукты на снимке, а потом написать рецепт словами."
            }
        },

        // ===== Ethics & Safety =====
        {
            id: "bias", cat: "ethics", icon: "⚖️", lessons: [6, 11], lab: "bias",
            related: ["dataset", "proxy", "black-box", "ai-act"],
            en: {
                name: "Bias",
                aliases: ["biased", "algorithmic bias"],
                short: "When an AI system treats some people or groups unfairly, often because of unbalanced training data.",
                def: "When an AI system treats some people or groups unfairly, often because its training data was unbalanced or reflected human prejudices.",
                ex: "A face-recognition system trained mostly on photos of people with light skin can make more mistakes with people who have darker skin."
            },
            ru: {
                name: "Предвзятость",
                aliases: ["предвзятый", "предвзятость алгоритмов"],
                short: "Когда система ИИ несправедлива к каким-то людям или группам, часто из-за однобоких данных для обучения.",
                def: "Когда система ИИ относится к каким-то людям или группам несправедливо — часто потому, что данные для обучения были однобокими или отражали человеческие предрассудки.",
                ex: "Система распознавания лиц, обученная в основном на фото людей со светлой кожей, может чаще ошибаться с людьми с тёмной кожей."
            }
        },
        {
            id: "deepfake", cat: "ethics", icon: "🎬", lessons: [6, 10], lab: "",
            related: ["generative-ai", "privacy", "gan", "watermark", "ai-act"],
            en: {
                name: "Deepfake",
                aliases: ["deep fake"],
                short: "A fake video, image or voice recording made with AI that shows someone saying or doing something they never did.",
                def: "A fake video, image or voice recording made with AI that makes someone appear to say or do something they never did.",
                ex: "A video of a celebrity “saying” something they never said. Check the source, look for strange details and think before you share."
            },
            ru: {
                name: "Дипфейк",
                aliases: [],
                short: "Поддельное видео, фото или запись голоса, созданные ИИ, где человек говорит или делает то, чего никогда не было.",
                def: "Поддельное видео, фото или запись голоса, созданные с помощью ИИ, где человек будто бы говорит или делает то, чего на самом деле никогда не было.",
                ex: "Видео, где знаменитость «говорит» то, чего никогда не говорила. Проверяй источник, ищи странные детали и не спеши делиться."
            }
        },
        {
            id: "privacy", cat: "ethics", icon: "🔒", lessons: [6, 11], lab: "",
            related: ["data", "deepfake", "recommendation"],
            en: {
                name: "Privacy",
                aliases: ["personal data", "data privacy"],
                short: "Your right to control your personal information and who can see it.",
                def: "Your right to control your personal information. AI systems often collect and use lots of data, so it matters what you share and who can see it.",
                ex: "Before pasting your address, a password or a friend's photo into an AI app, ask yourself: where could this information end up?"
            },
            ru: {
                name: "Конфиденциальность (приватность)",
                aliases: ["личные данные", "персональные данные"],
                short: "Твоё право контролировать информацию о себе и то, кто может её видеть.",
                def: "Твоё право контролировать информацию о себе. Системы ИИ часто собирают и используют много данных, поэтому важно, чем ты делишься и кто может это увидеть.",
                ex: "Прежде чем вставить в ИИ-приложение свой адрес, пароль или фото друга, спроси себя: куда может попасть эта информация?"
            }
        },
        {
            id: "black-box", cat: "ethics", icon: "⬛", lessons: [], lab: "",
            related: ["bias", "parameters", "neural-network", "red-teaming"],
            en: {
                name: "Black box",
                aliases: ["explainability", "explainable AI"],
                short: "A system whose inner workings are hard to see or explain, even for the people who built it.",
                def: "A system whose inner workings are hard to see or explain. Even the people who build large neural networks often can't say exactly why a network gave a particular answer.",
                ex: "If an AI turns down someone's loan application, that person should be able to find out why. That's why researchers work on “explainable AI”."
            },
            ru: {
                name: "Чёрный ящик",
                aliases: ["объяснимый ИИ", "объяснимость"],
                short: "Система, внутреннее устройство которой трудно увидеть или объяснить, даже её создателям.",
                def: "Система, внутреннее устройство которой трудно увидеть или объяснить. Даже создатели больших нейросетей часто не могут точно сказать, почему сеть дала именно такой ответ.",
                ex: "Если ИИ отказал человеку в кредите, тот должен иметь возможность узнать почему. Поэтому учёные работают над «объяснимым ИИ»."
            }
        },
        {
            id: "agi", cat: "ethics", icon: "🌌", lessons: [1], lab: "",
            related: ["ai", "turing-test", "alignment"],
            en: {
                name: "Artificial general intelligence (AGI)",
                aliases: ["general AI", "strong AI"],
                short: "A possible future AI that could learn almost any mental task a human can; it doesn't exist yet.",
                def: "A possible future AI that could learn and do almost any mental task a human can. It doesn't exist yet, and experts disagree about whether and when it will.",
                ex: "Today's AI is mostly “narrow”: a chess program can't drive a car. An AGI could switch between very different tasks, just as people do."
            },
            ru: {
                name: "Общий искусственный интеллект (AGI)",
                aliases: ["сильный ИИ", "общий ИИ", "универсальный ИИ"],
                short: "Возможный ИИ будущего, способный научиться почти любой умственной задаче человека; пока его не существует.",
                def: "Возможный ИИ будущего, который мог бы научиться почти любой умственной задаче, доступной человеку. Пока его не существует, и эксперты спорят, появится ли он и когда.",
                ex: "Сегодняшний ИИ в основном «узкий»: шахматная программа не умеет водить машину. Общий ИИ мог бы переключаться между совершенно разными задачами, как это делают люди."
            }
        },
        {
            id: "red-teaming", cat: "ethics", icon: "🚩", lessons: [11], lab: "",
            related: ["adversarial-example", "black-box", "alignment"],
            en: {
                name: "Red teaming",
                aliases: ["red team"],
                short: "Testing an AI by trying hard, on purpose, to make it fail or misbehave, so the problems can be fixed.",
                def: "Testing an AI system by deliberately trying to make it fail: to give harmful answers, leak private information or be tricked into breaking its rules. The testers play the attacker, so the problems can be fixed before real users find them. Many AI companies do it before releasing new models. The name comes from military exercises, where the “red team” plays the enemy.",
                ex: "It's like a fire drill for AI, or a game studio paying players to hunt for glitches before launch. A red teamer might try sneaky questions to get a chatbot to explain something dangerous."
            },
            ru: {
                name: "Ред-тиминг",
                aliases: ["редтиминг", "красная команда"],
                short: "Проверка ИИ, при которой его нарочно изо всех сил пытаются заставить ошибиться или нарушить правила, чтобы исправить проблемы.",
                def: "Проверка системы ИИ, при которой специально пытаются заставить её ошибиться: дать вредный ответ, выдать личную информацию или обманом нарушить свои правила. Проверяющие играют роль нападающих, чтобы проблемы исправили раньше, чем их найдут настоящие пользователи. Многие компании, создающие ИИ, проводят ред-тиминг перед выпуском новых моделей. Название пришло из военных учений, где «красная команда» играет за противника.",
                ex: "Это как учебная пожарная тревога для ИИ или игровая студия, которая перед выходом игры платит игрокам за поиск багов. Участник ред-тиминга может задавать чат-боту хитрые вопросы, чтобы тот объяснил что-то опасное."
            }
        },
        {
            id: "alignment", cat: "ethics", icon: "🤝", lessons: [11], lab: "",
            related: ["agi", "reward-hacking", "rlhf", "red-teaming"],
            en: {
                name: "AI alignment",
                aliases: ["alignment", "aligned AI", "value alignment"],
                short: "Making sure an AI tries to do what people really intend and value, not just what they literally said.",
                def: "The work of making AI systems pursue the goals people really intend, in safe and honest ways — not just what their instructions or rewards literally say. It matters more as AI gets more capable, and it is an open research problem: nobody has a complete solution yet.",
                ex: "In old stories, a genie grants wishes word for word, with terrible results. Alignment research tries to make sure AI understands what you mean, not just what you say."
            },
            ru: {
                name: "Согласование ИИ",
                aliases: ["согласование ИИ с целями людей", "выравнивание ИИ", "элайнмент"],
                short: "Работа над тем, чтобы ИИ стремился к тому, чего люди на самом деле хотят, а не только к буквальному смыслу их слов.",
                def: "Работа над тем, чтобы системы ИИ добивались целей, которые люди действительно имеют в виду, причём безопасно и честно, — а не только того, что буквально сказано в их инструкциях или наградах. Чем способнее становится ИИ, тем это важнее. Это нерешённая научная задача: полного решения пока нет ни у кого.",
                ex: "В старых сказках джинн исполняет желания слово в слово — и получается беда. Исследователи согласования хотят, чтобы ИИ понимал, что ты имеешь в виду, а не только что ты говоришь."
            }
        },
        {
            id: "ai-act", cat: "ethics", icon: "🏛️", lessons: [6, 11], lab: "",
            related: ["bias", "watermark", "deepfake"],
            en: {
                name: "EU AI Act",
                aliases: ["AI Act", "European AI Act"],
                short: "The European Union's law on artificial intelligence, adopted in 2024 and often called the world's first broad AI law.",
                def: "The European Union's law on artificial intelligence, adopted in 2024 and often described as the world's first broad AI law. It sorts AI systems by risk: a few uses are banned, high-risk uses (for example in hiring, schools or medicine) must follow strict rules, and people must be told when they are talking to an AI or looking at AI-made media. Its rules start to apply step by step, over several years.",
                ex: "Under the law, a system that gives people scores for their social behaviour to decide how they are treated is banned, and a chatbot on a shop's website must make clear that you aren't talking to a person."
            },
            ru: {
                name: "Закон ЕС об ИИ (AI Act)",
                aliases: ["закон Евросоюза об ИИ", "закон об искусственном интеллекте"],
                short: "Закон Европейского союза об искусственном интеллекте, принятый в 2024 году; его часто называют первым в мире широким законом об ИИ.",
                def: "Закон Европейского союза об искусственном интеллекте, принятый в 2024 году. Его часто называют первым в мире широким законом об ИИ. Он делит системы ИИ по уровню риска: некоторые применения запрещены, для применений с высоким риском (например, при приёме на работу, в школах или в медицине) действуют строгие правила, а людям должны сообщать, что они общаются с ИИ или видят созданный ИИ контент. Его правила вступают в силу постепенно, в течение нескольких лет.",
                ex: "По этому закону запрещена система, которая ставит людям баллы за поведение в обществе, чтобы решать, как с ними обращаться, а чат-бот на сайте магазина должен давать понять, что ты общаешься не с человеком."
            }
        },
        {
            id: "proxy", cat: "ethics", icon: "🏘️", lessons: [11], lab: "bias",
            related: ["bias", "data"],
            en: {
                name: "Proxy",
                aliases: ["proxy variable", "proxy feature"],
                short: "A piece of data that indirectly gives away something else, so a model can learn a bias it was never shown directly.",
                def: "A piece of data that a model uses in place of something it wasn't given, because the two often go together. Removing a sensitive column, such as gender or ethnic background, doesn't make a model fair if other columns, like a postcode, can act as proxies for it.",
                ex: "A loan model never sees anyone's background, but it does see where they live. If people from one group mostly live in certain neighbourhoods, the postcode becomes a proxy, and the old unfairness slips back in."
            },
            ru: {
                name: "Косвенный признак (прокси)",
                aliases: ["прокси-признак", "прокси-переменная"],
                short: "Данные, которые косвенно выдают что-то другое, поэтому модель может перенять предвзятость, которую ей никто прямо не показывал.",
                def: "Данные, которые модель использует вместо того, чего ей не дали, потому что одно часто идёт рука об руку с другим. Если убрать из данных чувствительный признак, например пол или происхождение, модель ещё не станет справедливой: его могут заменить другие признаки, скажем почтовый индекс.",
                ex: "Модель, которая решает, выдавать ли кредит, не знает происхождения людей, но знает, где они живут. Если люди из одной группы живут в основном в определённых районах, индекс становится косвенным признаком — и старая несправедливость возвращается."
            }
        },
        {
            id: "filter-bubble", cat: "ethics", icon: "🔁", lessons: [5], lab: "",
            related: ["recommendation", "algorithm"],
            en: {
                name: "Filter bubble",
                aliases: ["echo chamber"],
                short: "When recommendation algorithms keep showing you more of what you already like or believe, so you rarely see anything else.",
                def: "When the algorithms of apps and sites keep showing you things like the ones you already clicked, liked or agreed with, so different views and topics slowly disappear from your feed. The name was made popular by Eli Pariser in 2011. Researchers still argue about how strong the effect really is.",
                ex: "Watch a few videos about one football club and soon your feed is full of that club. You can step out of the bubble on purpose: search for other views, follow different people or clear your watch history."
            },
            ru: {
                name: "Пузырь фильтров",
                aliases: ["информационный пузырь", "фильтр-пузырь", "эхо-камера"],
                short: "Когда рекомендательные алгоритмы показывают тебе всё больше похожего на то, что тебе уже нравится, и другое почти перестаёт попадаться.",
                def: "Когда алгоритмы приложений и сайтов всё время подсовывают тебе то, что похоже на уже понравившееся, и другие темы и взгляды постепенно исчезают из ленты. Это название сделал популярным Эли Паризер в 2011 году. Учёные до сих пор спорят, насколько силён этот эффект на самом деле.",
                ex: "Посмотри несколько видео об одном футбольном клубе — и скоро вся лента будет про этот клуб. Из пузыря можно выйти нарочно: искать другие мнения, подписываться на разных людей или очистить историю просмотров."
            }
        },
        {
            id: "watermark", cat: "ethics", icon: "💧", lessons: [10], lab: "",
            related: ["deepfake", "diffusion", "ai-act"],
            en: {
                name: "AI watermark",
                aliases: ["watermark"],
                short: "A hidden or visible mark added to AI-made pictures, audio, video or text to show that AI created them.",
                def: "A mark added to content made by AI, so that people or programs can tell where it came from. Some watermarks are visible, like a small label; others are hidden in the pixels or sounds and can only be found by a special program. They help, but they aren't perfect: some can be removed or damaged by editing the file.",
                ex: "By 2025, some image generators added an invisible watermark to every picture they made, and some apps showed a label such as “AI-generated” on posts."
            },
            ru: {
                name: "Водяной знак ИИ",
                aliases: ["водяной знак", "маркировка ИИ-контента"],
                short: "Видимая или скрытая метка на картинках, звуке, видео или тексте, созданных ИИ, которая показывает их происхождение.",
                def: "Метка, которую добавляют к контенту, созданному ИИ, чтобы люди или программы могли узнать, откуда он взялся. Бывают видимые водяные знаки, например маленькая надпись, а бывают скрытые — в пикселях или звуке, их находит только специальная программа. Они помогают, но не идеальны: некоторые можно удалить или испортить, если отредактировать файл.",
                ex: "К 2025 году некоторые генераторы изображений добавляли в каждую картинку невидимый водяной знак, а некоторые приложения помечали публикации надписью вроде «Создано ИИ»."
            }
        }
    ]
});
