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
    if (!A) return;

    const mount = document.querySelector('[data-feature="glossary"]');
    const t = A.t;
    const esc = A.escapeHTML;

    // Without any filter, only the first few cards are shown,
    // so the page doesn't get too long. "Show all" shows the rest.
    const PREVIEW_COUNT = 12;

    // ---------- 1. Categories ----------
    const CATEGORIES = ["basics", "learning", "generative", "ethics"];

    // ---------- 2. The terms ----------
    // id: short name used in code and links. cat: category.
    // related: ids of other terms. aliases: other ways to write the term
    // (they are only used for searching, they are never shown).
    // An alias ending in "*" matches any word that starts like it.
    const TERMS = [
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
    ];

    // Terms by id. Object.create(null) makes an empty object without built-in
    // names, so an id like "constructor" can never find something by accident.
    const BY_ID = Object.create(null);
    TERMS.forEach(function (term) { BY_ID[term.id] = term; });

    // ---------- 3. Translations ----------
    const dictionary = {
        en: {
            "glossary.kicker": "Bilingual AI dictionary",
            "glossary.searchLabel": "Search the glossary",
            "glossary.searchPlaceholder": "Search, e.g. “bias” or “robot”",
            "glossary.searchPlaceholderShort": "Search terms…",
            "glossary.searchHint": "Results update as you type. Press Enter to open the first result, or Escape to clear the search.",
            "glossary.clear": "Clear search",
            "glossary.random": "Random term",
            "glossary.randomLabel": "Show a random term",
            "glossary.randomAnnounce": "Random term: {term}",
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
            "glossary.count.one": "Showing {n} of {total} terms",
            "glossary.count.few": "Showing {n} of {total} terms",
            "glossary.count.many": "Showing {n} of {total} terms",
            "glossary.explored": "Explored",
            "glossary.exploredLabel": "Terms you have opened: {n} of {total}",
            "glossary.exploredBadge": "You have already explored this term",
            "glossary.allExplored": "Every glossary term explored — great work!",
            "glossary.reset": "Reset filters",
            "glossary.gridLabel": "Glossary terms",
            "glossary.more": "Example & related",
            "glossary.moreLabel": "Example & related: {term}",
            "glossary.example": "Everyday example",
            "glossary.related": "Related terms",
            "glossary.altCode": "RU",
            "glossary.altLabel": "In Russian:",
            "glossary.emptyQuery": "Nothing found for “{query}”",
            "glossary.emptyFilters": "No terms match these filters",
            "glossary.emptyHint": "Try another word, check the spelling or reset the filters.",
            "glossary.suggest": "Did you mean:",
            "glossary.showAll.one": "Show all {n} terms",
            "glossary.showAll.few": "Show all {n} terms",
            "glossary.showAll.many": "Show all {n} terms",
            "glossary.showLess": "Show fewer terms",
            "glossary.cmdGroup": "Glossary",
            "glossary.cmdTitle": "Glossary: {term}"
        },
        ru: {
            "glossary.kicker": "Двуязычный словарь ИИ",
            "glossary.searchLabel": "Поиск по словарю",
            "glossary.searchPlaceholder": "Например, «нейросеть»",
            "glossary.searchPlaceholderShort": "Найти термин…",
            "glossary.searchHint": "Результаты обновляются, пока ты печатаешь. Нажми Enter, чтобы открыть первый результат, или Escape, чтобы очистить поиск.",
            "glossary.clear": "Очистить поиск",
            "glossary.random": "Случайный термин",
            "glossary.randomLabel": "Показать случайный термин",
            "glossary.randomAnnounce": "Случайный термин: {term}",
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
            "glossary.count.one": "Показан {n} термин из {total}",
            "glossary.count.few": "Показано {n} термина из {total}",
            "glossary.count.many": "Показано {n} терминов из {total}",
            "glossary.explored": "Изучено",
            "glossary.exploredLabel": "Открытые тобой термины: {n} из {total}",
            "glossary.exploredBadge": "Этот термин уже изучен",
            "glossary.allExplored": "Все термины словаря изучены — отличная работа!",
            "glossary.reset": "Сбросить фильтры",
            "glossary.gridLabel": "Термины словаря",
            "glossary.more": "Пример и связанные термины",
            "glossary.moreLabel": "Пример и связанные термины: {term}",
            "glossary.example": "Пример из жизни",
            "glossary.related": "Связанные термины",
            "glossary.altCode": "EN",
            "glossary.altLabel": "По-английски:",
            "glossary.emptyQuery": "По запросу «{query}» ничего не найдено",
            "glossary.emptyFilters": "С такими фильтрами терминов нет",
            "glossary.emptyHint": "Попробуй другое слово, проверь написание или сбрось фильтры.",
            "glossary.suggest": "Возможно, имелось в виду:",
            "glossary.showAll.one": "Показать все {n} термин",
            "glossary.showAll.few": "Показать все {n} термина",
            "glossary.showAll.many": "Показать все {n} терминов",
            "glossary.showLess": "Показать меньше терминов",
            "glossary.cmdGroup": "Словарь",
            "glossary.cmdTitle": "Словарь: {term}"
        }
    };

    // The words of every term become translations too: "glossary.term.ai.name", ...
    TERMS.forEach(function (term) {
        ["en", "ru"].forEach(function (lang) {
            const key = "glossary.term." + term.id + ".";
            dictionary[lang][key + "name"] = term[lang].name;
            dictionary[lang][key + "def"] = term[lang].def;
            dictionary[lang][key + "ex"] = term[lang].ex;
        });
    });
    A.addTranslations(dictionary);

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

    function termName(term) {
        return t("glossary.term." + term.id + ".name");
    }

    function termDef(term) {
        return t("glossary.term." + term.id + ".def");
    }

    // A short public description of a term, in the current language
    function info(term) {
        return {
            id: term.id,
            term: termName(term),
            definition: termDef(term),
            example: t("glossary.term." + term.id + ".ex"),
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

    // ---------- 7. Public API (works even without the glossary on the page) ----------
    // Until the glossary is built, showing a term can only scroll to the section.
    let showTerm = function () {
        A.scrollToSection("glossary");
        return false;
    };

    const api = {
        // find("What is a neural network?") -> { id, term, definition, ... } or null
        find: find,
        // A random term: { id, term, definition, ... }
        random: function () { return info(randomTerm()); },
        // A term by its id: { id, term, definition, ... } or null
        term: function (id) { return BY_ID[id] ? info(BY_ID[id]) : null; },
        // All term ids, in the order they are defined
        ids: TERMS.map(function (term) { return term.id; }),
        // Scrolls to the glossary and highlights a term
        show: function (id, options) { return showTerm(id, options); }
    };
    A.glossary = api;

    // ---------- 8. Ctrl+K palette: one command per term ----------
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
            run: function () { showTerm(term.id, { focus: true }); }
        });
    });

    // Without the glossary on the page, there is nothing more to build
    if (!mount) return;

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
    const root = mount.querySelector(".gl");
    const ui = {
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
    const cards = Object.create(null);
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
        card.ex.textContent = t("glossary.term." + term.id + ".ex");
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
        const card = cards[id];
        if (!card) return false;
        options = options || {};

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

    // ---------- 17. Language changes: same search, same open cards ----------
    A.onLanguageChange(function () {
        // Quietly forget the last announcement (it was in the old language)
        clearTimeout(liveTimer);
        ui.live.textContent = "";
        buildLetters();
        sortCards();
        render(false);
        updateExplored();
    });

    // ---------- 18. Start ----------
    showTerm = show;
    buildLetters();
    sortCards();
    render(false);
    updateExplored();

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
})();
