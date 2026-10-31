/* =========================================================
   AI COMPASS — TEXTS: LESSON PLANS AND WORKSHEETS, LESSONS 1-6
   The teacher kit's plans and worksheets for the "Basics" track, in
   English and in Russian. Lessons 7-12 are in js/content/teachers-deep.js.
   This file is big, so js/teachers-kit.js loads it only when a teacher
   opens a plan or a worksheet.

   Every lesson has:
       exit    a question from the quiz bank (js/content/quiz-bank.js) for the
               exit ticket: the plan shows it with its answer
       quiz    questions from the quiz bank for the worksheet's last task,
               "Quick quiz" (q... a question, m... a "Myth or fact" statement)
       en, ru  the plan and the worksheet in each language, with the same parts:
           objectives  three things students can do by the end of the lesson
           warmup      the warm-up question, and warmupNote: how to run it
           reading     what students look for while they read the lesson
           activity    { title, steps }: the mini-lab, step by step
           extension   a task for students who finish early
           discussion  three or four questions for the class
           exit        one open question for the exit ticket
           easier, harder   the differentiation: an easier and a harder task
           tasks       the worksheet (see below)

   The worksheet's tasks (the answer key shows the answers):
       { type: "fill", items: ["... [answer] ..."], extra: ["word"] }
           sentences with a gap; the words for the gaps (and the extra ones)
           are shown in a box, in alphabetical order
       { type: "match", pairs: [["term", "meaning"], ...] }
           the meanings are shown in alphabetical order, with letters
       { type: "truefalse", items: [["statement", true or false, "why"], ...] }
       { type: "sort", groups: ["group 1", "group 2"], items: [["thing", 0 or 1], ...] }
           0 means the first group, 1 the second
       { type: "order", items: ["first step", "second step", ...] }
           written here in the right order; shown in alphabetical order
       { type: "explain", text: "the question", answer: "a good answer", lines: 4 }
       { type: "lab", text: "what to do", table: { head: [...], rows: [[...]] }, items: ["question [answer]"] }
           a cell or a gap in [brackets] is left empty on the worksheet and
           filled in on the answer key; an empty cell "" stays empty on both
   The quick quiz is added at the end by js/teachers-kit.js.

   Russian: the plan is written for the teacher in the usual style of
   Russian lesson plans ("Ученики читают..."); the worksheet speaks to
   the student with "ты", like the rest of the site.
   To change a text, change it in both languages: English and Russian
   must keep the same parts, in the same order, with the same number of
   items (a match task's pairs, a table's rows, the gaps in [brackets]).
   The quiz questions are only named here, by their id: their texts stay
   in js/content/quiz-bank.js.
   ========================================================= */

window.AICompass.content.set("teachers-plans", {
    // ----- Lesson 1: What is AI? -----
    1: {
        exit: "q13",
        quiz: ["q14", "q16", "m1"],
        en: {
            objectives: [
                "explain in their own words what AI is;",
                "tell a program that follows hand-written rules from a system that learned from examples;",
                "explain why all AI today is narrow, and what general AI (AGI) would be."
            ],
            warmup: "Name one thing from your day so far that you think uses AI. What makes you think so?",
            warmupNote: "Write the answers on the board without correcting them. At the end of the lesson, sort the list together: AI, or just fixed rules?",
            reading: "Students look for the difference between following rules and learning from examples, and for the year the term “artificial intelligence” was invented.",
            activity: {
                title: "Mini-lab “AI or not AI?”",
                steps: [
                    "Students work in pairs and scroll to the mini-lab at the end of lesson 1.",
                    "Before clicking anything, each pair writes down its guess for every example: AI or not AI.",
                    "Then they choose the answers on screen and read every explanation.",
                    "Each pair picks the example they argued about most and prepares one sentence: what clue shows that a system learned from data?"
                ]
            },
            extension: "Fast finishers invent two examples of their own, one with AI and one without, and swap them with another pair.",
            discussion: [
                "A calculator always gives the right answer, but it isn't AI. Why not?",
                "Is a chatbot that can talk about almost anything an example of general AI? Why, or why not?",
                "Which AI in your life would you miss most if it stopped working tomorrow?",
                "Experts disagree about whether general AI will ever exist. Why is it so hard to predict?"
            ],
            exit: "Write your own one-sentence definition of AI, and give one example from your life.",
            easier: "Before the reading, cut the worksheet's sorting task into cards to sort into two piles, and give a sentence starter for the definition: “AI is when a computer…”.",
            harder: "Students find a device at home or at school that is sold as “smart” and decide, with reasons, whether it learns from data or only follows fixed rules.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "AI is the ability of a computer system to do tasks that usually need human [intelligence].",
                        "Classic programs follow [rules] that a programmer writes by hand.",
                        "Most modern AI learns from [examples] and finds the patterns by itself.",
                        "Today's AI is [narrow]: each system is built for a certain kind of task.",
                        "An AI that could learn any intellectual task a human can would be called artificial [general] intelligence."
                    ],
                    extra: ["feelings"]
                },
                {
                    type: "sort",
                    groups: ["AI", "Not AI"],
                    items: [
                        ["A photo app that finds every picture of your dog", 0],
                        ["A traffic light that changes every 60 seconds", 1],
                        ["A keyboard that suggests your next word", 0],
                        ["A washing machine that runs a 40-minute programme", 1],
                        ["A map app that predicts how long your trip will take in traffic", 0],
                        ["A spreadsheet that adds up a column of numbers", 1]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["AI finds patterns in data and uses them to make predictions.", true, "That is how the lesson defines it: patterns in the data, and predictions from them."],
                        ["A spam filter has to be told every trick that scammers use.", false, "It learns to spot new tricks from millions of emails that people marked as spam."],
                        ["Experts agree that general AI (AGI) will arrive within ten years.", false, "AGI doesn't exist yet, and experts disagree about when, or whether, it will arrive."],
                        ["AI already helps doctors find diseases.", true, "The lesson gives this as one of the ways AI already matters in your life."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["artificial intelligence", "computer systems that do tasks which usually need human intelligence"],
                        ["rule-based program", "does exactly the steps a programmer wrote"],
                        ["narrow AI", "built for one kind of task"],
                        ["general AI (AGI)", "could learn any intellectual task a human can; it doesn't exist yet"],
                        ["training data", "the examples a system learns its patterns from"]
                    ]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “AI or not AI?” at the end of lesson 1 and answer every example. Then write:",
                    items: [
                        "Which of its examples are not AI? [The calculator and the microwave]",
                        "What do all the AI examples have in common? [They learned patterns from lots of data: faces, emails, what people listen to.]"
                    ]
                },
                {
                    type: "explain",
                    text: "In your own words, explain the difference between a program that follows rules and an AI that learns. Give an example of each.",
                    answer: "A rule-based program does exactly what a programmer wrote, like a weather app that shows a snowflake below 0 °C. An AI learns its own rules from many examples, like a spam filter trained on emails that people marked as spam, so it can also handle cases nobody wrote a rule for.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "своими словами объяснить, что такое ИИ;",
                "отличить программу, которая выполняет правила, написанные вручную, от системы, которая научилась на примерах;",
                "объяснить, почему весь сегодняшний ИИ — узкий и чем был бы общий ИИ (AGI)."
            ],
            warmup: "Назови одну вещь из сегодняшнего дня, в которой, по-твоему, работает ИИ. Почему ты так думаешь?",
            warmupNote: "Записать ответы на доске, не исправляя их. В конце урока вернуться к списку и вместе разобрать: где ИИ, а где просто заданные правила?",
            reading: "Ученики ищут, чем выполнение правил отличается от обучения на примерах и в каком году появился термин «искусственный интеллект».",
            activity: {
                title: "Мини-лаборатория «ИИ или не ИИ?»",
                steps: [
                    "Ученики работают в парах и находят мини-лабораторию в конце урока 1.",
                    "Прежде чем нажимать, каждая пара записывает свой ответ для каждого примера: ИИ или не ИИ.",
                    "Потом выбирают ответы на экране и читают все объяснения.",
                    "Каждая пара выбирает пример, о котором спорила дольше всего, и готовит одно предложение: по какому признаку видно, что система училась на данных?"
                ]
            },
            extension: "Кто закончил раньше, придумывает два своих примера — один с ИИ, другой без — и обменивается ими с другой парой.",
            discussion: [
                "Калькулятор всегда считает правильно, но это не ИИ. Почему?",
                "Чат-бот, который может говорить почти о чём угодно, — это общий ИИ? Почему да или почему нет?",
                "Без какого ИИ в твоей жизни было бы труднее всего, если бы он завтра перестал работать?",
                "Эксперты спорят, появится ли когда-нибудь общий ИИ. Почему это так трудно предсказать?"
            ],
            exit: "Напиши своё определение ИИ в одном предложении и приведи пример из своей жизни.",
            easier: "Перед чтением разрезать задание рабочего листа «Распредели» на карточки, чтобы разложить их на две стопки, и дать начало фразы для определения: «ИИ — это когда компьютер…».",
            harder: "Найти дома или в школе устройство, которое продают как «умное», и с доводами решить: учится ли оно на данных или только выполняет заданные правила.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "ИИ — это способность компьютерной системы выполнять задачи, для которых обычно нужен человеческий [интеллект].",
                        "Обычные программы следуют [правилам], которые программист пишет вручную.",
                        "Большинство современных систем ИИ учатся на [примерах] и сами находят закономерности.",
                        "Сегодняшний ИИ — [узкий]: каждая система создана для определённого типа задач.",
                        "ИИ, который мог бы научиться любой умственной задаче, доступной человеку, называют [общим] искусственным интеллектом."
                    ],
                    extra: ["чувствам"]
                },
                {
                    type: "sort",
                    groups: ["ИИ", "Не ИИ"],
                    items: [
                        ["Фотоприложение находит все снимки твоей собаки", 0],
                        ["Светофор переключается каждые 60 секунд", 1],
                        ["Клавиатура подсказывает следующее слово", 0],
                        ["Стиральная машина выполняет программу на 40 минут", 1],
                        ["Навигатор предсказывает, сколько времени займёт дорога с учётом пробок", 0],
                        ["Электронная таблица складывает столбец чисел", 1]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["ИИ находит закономерности в данных и использует их, чтобы делать предсказания.", true, "Так ИИ определяется в уроке: закономерности в данных — и предсказания по ним."],
                        ["Спам-фильтру нужно заранее рассказать обо всех уловках мошенников.", false, "Он сам учится замечать новые уловки на миллионах писем, которые люди отметили как спам."],
                        ["Эксперты согласны, что общий ИИ (AGI) появится в ближайшие десять лет.", false, "Общего ИИ пока нет, и эксперты спорят, когда он появится и появится ли вообще."],
                        ["ИИ уже помогает врачам находить болезни.", true, "Урок приводит это как один из примеров того, что ИИ уже есть в твоей жизни."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["искусственный интеллект", "компьютерные системы, которые выполняют задачи, обычно требующие человеческого интеллекта"],
                        ["программа на правилах", "выполняет ровно те шаги, которые написал программист"],
                        ["узкий ИИ", "создан для одного типа задач"],
                        ["общий ИИ (AGI)", "мог бы научиться любой умственной задаче, как человек; пока не существует"],
                        ["обучающие данные", "примеры, на которых система находит закономерности"]
                    ]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «ИИ или не ИИ?» в конце урока 1 и ответь на все примеры. Потом напиши:",
                    items: [
                        "Какие примеры в ней — не ИИ? [Калькулятор и микроволновка]",
                        "Что общего у всех примеров с ИИ? [Они научились на большом количестве данных: лицах, письмах, том, что слушают люди.]"
                    ]
                },
                {
                    type: "explain",
                    text: "Объясни своими словами, чем программа, которая следует правилам, отличается от ИИ, который учится. Приведи пример того и другого.",
                    answer: "Программа на правилах делает ровно то, что написал программист, — например, приложение погоды показывает снежинку ниже 0 °C. ИИ сам выводит правила из множества примеров — как спам-фильтр, обученный на письмах, которые люди отметили как спам, — поэтому справляется и со случаями, для которых никто не писал правил.",
                    lines: 5
                }
            ]
        }
    },

    // ----- Lesson 2: Machine Learning -----
    2: {
        exit: "q17",
        quiz: ["q2", "q18", "m2"],
        en: {
            objectives: [
                "explain how machine learning differs from writing rules by hand;",
                "describe training (guess, measure the error, adjust, repeat) and explain why a model is tested on new examples;",
                "tell supervised, unsupervised and reinforcement learning apart, and explain why the data matters."
            ],
            warmup: "How do people learn to recognise a dog, even a breed they have never seen? From a list of rules, or from seeing lots of dogs?",
            warmupNote: "Lead to the idea that nobody gave us rules: we learned from examples. That is the idea behind machine learning.",
            reading: "Students look for the four steps of training, and for the story of the wolves and the snow.",
            activity: {
                title: "Mini-lab “Watch a model learn”",
                steps: [
                    "Students open the mini-lab in lesson 2 and, before training, write down the average error and the prediction for 10 hours.",
                    "They press “Train 1 step” five times and watch the line and the error chart after each press.",
                    "Then they press “Auto-train” and wait until the training stops by itself.",
                    "Pairs compare their numbers and explain why the error stopped going down before it reached zero."
                ]
            },
            extension: "Fast finishers press “Reset”, guess how many steps the training will need, and check.",
            discussion: [
                "Why is learning test answers by heart not the same as understanding the topic? What has this got to do with overfitting?",
                "A model learned to recognise wolves from photos that all had snow in them. How would you fix its training data?",
                "Which kind of learning (supervised, unsupervised or reinforcement) would you use to teach a robot dog to fetch a ball? Why?",
                "Who decides which examples a model learns from, and why does that matter?"
            ],
            exit: "Give one example of data that is too one-sided, and say what a model might wrongly learn from it.",
            easier: "Students work in pairs: one reads aloud, the other presses the buttons. Give them a ready table to copy the numbers into.",
            harder: "Students design a tiny dataset for a spam filter (six messages with labels), including one example that could trick the model, and explain why it could.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "In machine learning, the computer finds [patterns] in examples by itself.",
                        "During training, the model guesses, measures its [error] and adjusts itself a tiny bit.",
                        "In [testing], the model gets new examples it has never seen.",
                        "When a model memorises its training examples but fails on new ones, it is called [overfitting].",
                        "In supervised learning, every example comes with the right answer, called a [label]."
                    ],
                    extra: ["rules"]
                },
                {
                    type: "order",
                    items: [
                        "The model guesses an answer.",
                        "It measures how wrong the guess was.",
                        "It adjusts itself a tiny bit to be less wrong.",
                        "It repeats this thousands of times.",
                        "It is tested on new examples it has never seen."
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["supervised learning", "every example comes with the right answer"],
                        ["unsupervised learning", "no labels: the model finds groups by itself"],
                        ["reinforcement learning", "learning by trial and error, with rewards"],
                        ["overfitting", "memorising the examples instead of learning the pattern"]
                    ]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Watch a model learn” in lesson 2 and fill in the table.",
                    table: {
                        head: ["", "Average error", "Prediction for 10 hours"],
                        rows: [
                            ["Before training (step 0)", "[23.5 points]", "[40 points]"],
                            ["When “Auto-train” has stopped", "[about 2.7 points]", "[90 points]"]
                        ]
                    },
                    items: [
                        "Why can't the error go all the way down to 0? [The dots don't lie exactly on one straight line, so no line can go through all of them.]"
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["A model is only as good as its data.", true, "Too few, messy or one-sided examples teach it the wrong pattern."],
                        ["During training, a model changes itself in one big jump.", false, "It adjusts itself a tiny bit at a time, thousands or even millions of times."],
                        ["A spam filter can learn from thousands of emails labelled “spam” or “not spam”.", true, "That is supervised learning: every example has a label."],
                        ["AI learned to play Go with reinforcement learning.", true, "It learned by trial and error, with rewards for good moves."]
                    ]
                },
                {
                    type: "explain",
                    text: "A model learned to recognise wolves, but every wolf photo in its training data had snow in it. Explain what went wrong, and how you would fix it.",
                    answer: "The model learned that snow means “wolf” instead of learning what a wolf looks like, so it calls a husky in the snow a wolf. To fix it, add photos of wolves without snow and of other animals in the snow, so snow is no longer a clue.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "объяснить, чем машинное обучение отличается от правил, написанных вручную;",
                "описать обучение (угадать, измерить ошибку, подправить, повторить) и объяснить, зачем модель проверяют на новых примерах;",
                "различать обучение с учителем, без учителя и с подкреплением и объяснять, почему так важны данные."
            ],
            warmup: "Как люди учатся узнавать собак — даже незнакомой породы? По списку правил или потому, что видели много разных собак?",
            warmupNote: "Подвести к мысли, что правил никто не давал: мы учимся на примерах. На этом и построено машинное обучение.",
            reading: "Ученики ищут четыре шага обучения и историю про волков и снег.",
            activity: {
                title: "Мини-лаборатория «Посмотри, как учится модель»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 2 и до обучения записывают среднюю ошибку и прогноз для 10 часов.",
                    "Пять раз нажимают «1 шаг обучения» и после каждого нажатия смотрят на линию и график ошибки.",
                    "Потом нажимают «Автообучение» и ждут, пока обучение остановится само.",
                    "Пары сравнивают числа и объясняют, почему ошибка перестала уменьшаться, не дойдя до нуля."
                ]
            },
            extension: "Кто закончил раньше, нажимает «Сбросить», угадывает, сколько шагов понадобится на обучение, и проверяет.",
            discussion: [
                "Почему выучить ответы наизусть — не то же самое, что понять тему? Как это связано с переобучением?",
                "Модель училась узнавать волков по фото, на которых всегда был снег. Как исправить её обучающие данные?",
                "Какой способ обучения — с учителем, без учителя или с подкреплением — подойдёт, чтобы научить робота-собаку приносить мяч? Почему?",
                "Кто решает, на каких примерах учится модель, и почему это важно?"
            ],
            exit: "Приведи пример однобоких данных и напиши, какой неправильный вывод может сделать из них модель.",
            easier: "Работать в парах: один читает вслух, другой нажимает кнопки. Дать готовую таблицу, куда переписывать числа.",
            harder: "Составить маленький набор данных для спам-фильтра — шесть сообщений с метками, — включив один пример, который может обмануть модель, и объяснить почему.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "При машинном обучении компьютер сам находит [закономерности] в примерах.",
                        "Во время обучения модель угадывает, измеряет свою [ошибку] и чуть-чуть подстраивает себя.",
                        "Во время [проверки] модель получает новые примеры, которых раньше не видела.",
                        "Когда модель зазубривает обучающие примеры, но ошибается на новых, это называют [переобучением].",
                        "При обучении с учителем к каждому примеру прилагается правильный ответ — [метка]."
                    ],
                    extra: ["правила"]
                },
                {
                    type: "order",
                    items: [
                        "Модель угадывает ответ.",
                        "Она измеряет, насколько ошиблась.",
                        "Она чуть-чуть подстраивает себя, чтобы ошибаться меньше.",
                        "Это повторяется тысячи раз.",
                        "Её проверяют на новых примерах, которых она не видела."
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["обучение с учителем", "к каждому примеру прилагается правильный ответ"],
                        ["обучение без учителя", "меток нет: модель сама находит группы"],
                        ["обучение с подкреплением", "обучение методом проб и ошибок, с наградами"],
                        ["переобучение", "зубрёжка примеров вместо понимания закономерности"]
                    ]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Посмотри, как учится модель» в уроке 2 и заполни таблицу.",
                    table: {
                        head: ["", "Средняя ошибка", "Прогноз для 10 часов"],
                        rows: [
                            ["До обучения (шаг 0)", "[23,5 балла]", "[40 баллов]"],
                            ["Когда «Автообучение» остановилось", "[около 2,7 балла]", "[90 баллов]"]
                        ]
                    },
                    items: [
                        "Почему ошибка не может опуститься до 0? [Точки не лежат точно на одной прямой, поэтому никакая линия не пройдёт через все.]"
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Модель хороша настолько, насколько хороши её данные.", true, "Если примеров мало, они неаккуратные или однобокие, модель выучит не ту закономерность."],
                        ["Во время обучения модель меняется сразу, одним большим скачком.", false, "Она подстраивает себя понемногу — тысячи и даже миллионы раз."],
                        ["Спам-фильтр может учиться на тысячах писем с пометками «спам» и «не спам».", true, "Это обучение с учителем: у каждого примера есть метка."],
                        ["Играть в го ИИ научился с помощью обучения с подкреплением.", true, "Он учился методом проб и ошибок и получал награды за удачные ходы."]
                    ]
                },
                {
                    type: "explain",
                    text: "Модель училась узнавать волков, но на всех фото волков в её данных был снег. Объясни, что пошло не так и как это исправить.",
                    answer: "Модель решила, что снег означает «волк», вместо того чтобы понять, как выглядит волк, — и называет волком хаски на снегу. Чтобы это исправить, нужно добавить фото волков без снега и других животных на снегу: тогда снег перестанет быть подсказкой.",
                    lines: 5
                }
            ]
        }
    },

    // ----- Lesson 3: Neural Networks -----
    3: {
        exit: "q23",
        quiz: ["q20", "q22", "m3"],
        en: {
            objectives: [
                "describe a neural network as many simple artificial neurons arranged in layers;",
                "explain what one neuron does with its inputs, weights, bias and activation function;",
                "explain that learning means adjusting the weights, little by little, to make the error smaller."
            ],
            warmup: "Your brain has about 86 billion neurons. What do you think one neuron does on its own?",
            warmupNote: "Collect guesses. Then explain that an artificial neuron is much simpler: it mostly multiplies and adds numbers. The power comes from connecting very many of them.",
            reading: "Students look for the four things one neuron does, and for the names of the three kinds of layers.",
            activity: {
                title: "Mini-lab “Play with a neuron”",
                steps: [
                    "Students open the mini-lab in lesson 3 and read the neuron's question: “Should I go to the park?”",
                    "They read the sum under the sliders and check it with a calculator: multiply each input by its weight, then add the bias.",
                    "They fill in the worksheet's table: change one slider at a time and write down the output and the decision.",
                    "Pairs explain what a negative weight does to the decision."
                ]
            },
            extension: "Fast finishers find settings where the neuron says “yes” with no sun at all, and explain which slider made the difference.",
            discussion: [
                "Artificial neural networks were inspired by the brain. In what ways are they different from a real brain?",
                "Why do the biggest networks need so much data and computing power to train?",
                "Early layers find edges, later layers find whole objects. Why might building up step by step work better than looking for a cat in one go?",
                "If nobody sets the weights by hand, who is responsible when a network makes a mistake?"
            ],
            exit: "Name the three kinds of layers in a neural network, and say what each one does.",
            easier: "Give the neuron's sum as a line with a gap: 0.90 × 1.5 + 0.20 × 2.5 − 1.5 = ___, and allow a calculator.",
            harder: "Students design a neuron of their own on paper, with three inputs for a decision of their own (for example, “Should I go to football practice?”), choose the weights and the bias, and explain each choice.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "An artificial neuron multiplies each input by a [weight].",
                        "It adds everything up together with a [bias].",
                        "Then an [activation] function decides how strongly the neuron fires.",
                        "In the middle, [hidden] layers transform the data step by step.",
                        "Networks with many layers are called [deep] neural networks."
                    ],
                    extra: ["random"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Play with a neuron” in lesson 3. Press “Reset” before each row, change only the slider named in the first column, and fill in the table.",
                    table: {
                        head: ["What you change", "Output", "Decision"],
                        rows: [
                            ["Nothing (the starting values)", "[59%]", "[Go to the park]"],
                            ["“How much homework is done?” to 1.00", "[91%]", "[Go to the park]"],
                            ["“How sunny is it?” to 0.00", "[27%]", "[Stay home today]"],
                            ["“Weight: homework” to −2.5", "[34%]", "[Stay home today]"]
                        ]
                    },
                    items: [
                        "What does a negative weight do? [It pushes the decision towards “no”: the more of that input, the lower the output.]"
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["input", "a number the neuron receives, such as how sunny it is"],
                        ["weight", "how important an input is"],
                        ["bias", "a number added to the sum, like a general mood"],
                        ["activation function", "decides how strongly the neuron fires"],
                        ["backpropagation", "works out how to nudge every weight to make the error smaller"]
                    ]
                },
                {
                    type: "order",
                    items: [
                        "First, the input layer receives the pixels of a photo.",
                        "Early layers detect simple things, like edges.",
                        "Middle layers combine them into shapes.",
                        "Later layers recognise whole objects.",
                        "Finally, the output layer gives the answer, such as “cat: 92%”."
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Neural networks are made of simple maths units connected in layers.", true, "Each artificial neuron is a small piece of maths; the power comes from connecting very many of them."],
                        ["Programmers set every weight of a neural network by hand.", false, "Training sets them: an algorithm nudges every weight, little by little, to make fewer mistakes."],
                        ["The biggest modern networks have billions of weights.", true, "The weights are also called parameters, and the biggest networks have billions of them."],
                        ["Face unlock and voice assistants run on deep neural networks.", true, "The lesson names face unlock, voice assistants, translation apps and chatbots."]
                    ]
                },
                {
                    type: "explain",
                    text: "In your own words, explain how a neural network learns. Use the words “weights” and “error”.",
                    answer: "At first the weights are random, so the answers are nonsense. In training, the network compares its answer with the right one, and backpropagation works out how to nudge every weight so that the error gets smaller. After millions of tiny nudges, the weights hold what the network has learned.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "описать нейросеть как множество простых искусственных нейронов, расположенных слоями;",
                "объяснить, что один нейрон делает с входами, весами, смещением и функцией активации;",
                "объяснить, что учиться — значит понемногу подстраивать веса, чтобы ошибка становилась меньше."
            ],
            warmup: "В мозге человека около 86 миллиардов нейронов. Как ты думаешь, что делает один нейрон сам по себе?",
            warmupNote: "Собрать догадки. Затем пояснить: искусственный нейрон намного проще — в основном он умножает и складывает числа. Сила появляется, когда их соединяют очень много.",
            reading: "Ученики ищут четыре действия, которые выполняет один нейрон, и названия трёх видов слоёв.",
            activity: {
                title: "Мини-лаборатория «Поиграй с нейроном»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 3 и читают вопрос нейрона: «Пойти ли в парк?»",
                    "Читают вычисление под ползунками и проверяют его на калькуляторе: умножить каждый вход на его вес и прибавить смещение.",
                    "Заполняют таблицу в рабочем листе: меняют по одному ползунку и записывают выход и решение.",
                    "Пары объясняют, что отрицательный вес делает с решением."
                ]
            },
            extension: "Кто закончил раньше, ищет настройки, при которых нейрон говорит «да» совсем без солнца, и объясняет, какой ползунок всё решил.",
            discussion: [
                "Искусственные нейросети придуманы по мотивам мозга. Чем они отличаются от настоящего мозга?",
                "Почему самым большим сетям для обучения нужно так много данных и вычислений?",
                "Первые слои находят края, последние — целые предметы. Почему собирать картину по шагам может быть удобнее, чем искать кошку сразу?",
                "Если веса никто не задаёт вручную, кто отвечает за ошибку нейросети?"
            ],
            exit: "Назови три вида слоёв нейросети и напиши, что делает каждый.",
            easier: "Дать сумму нейрона строкой с пропуском: 0,90 × 1,5 + 0,20 × 2,5 − 1,5 = ___ — и разрешить калькулятор.",
            harder: "Придумать на бумаге свой нейрон с тремя входами для своего решения (например, «Идти ли на тренировку?»), выбрать веса и смещение и объяснить каждый выбор.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Искусственный нейрон умножает каждый вход на его [вес].",
                        "Затем он складывает всё вместе со [смещением].",
                        "Потом функция [активации] решает, насколько сильно нейрон сработает.",
                        "Посередине [скрытые] слои шаг за шагом преобразуют данные.",
                        "Сети с большим числом слоёв называют [глубокими] нейронными сетями."
                    ],
                    extra: ["случайными"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Поиграй с нейроном» в уроке 3. Перед каждой строкой нажимай «Сбросить», меняй только ползунок из первого столбца и заполни таблицу.",
                    table: {
                        head: ["Что меняем", "Выход", "Решение"],
                        rows: [
                            ["Ничего (начальные значения)", "[59%]", "[Идём в парк]"],
                            ["«Сколько домашки сделано?» — до 1,00", "[91%]", "[Идём в парк]"],
                            ["«Насколько солнечно?» — до 0,00", "[27%]", "[Сегодня лучше дома]"],
                            ["«Вес: домашка» — до −2,5", "[34%]", "[Сегодня лучше дома]"]
                        ]
                    },
                    items: [
                        "Что делает отрицательный вес? [Тянет решение к «нет»: чем больше этого входа, тем меньше выход.]"
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["вход", "число, которое получает нейрон, например насколько солнечно"],
                        ["вес", "насколько важен вход"],
                        ["смещение", "число, которое прибавляется к сумме, — как общее настроение"],
                        ["функция активации", "решает, насколько сильно сработает нейрон"],
                        ["обратное распространение ошибки", "вычисляет, как подправить каждый вес, чтобы ошибка уменьшилась"]
                    ]
                },
                {
                    type: "order",
                    items: [
                        "Сначала входной слой получает пиксели фотографии.",
                        "Первые слои находят простые вещи, например края.",
                        "Средние слои собирают из них формы.",
                        "Последние слои узнают целые предметы.",
                        "Наконец, выходной слой выдаёт ответ, например «кошка: 92%»."
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Нейросети состоят из простых математических блоков, соединённых в слои.", true, "Каждый искусственный нейрон — маленький кусочек математики; сила в том, что их соединяют очень много."],
                        ["Программисты задают каждый вес нейросети вручную.", false, "Веса подбирает обучение: алгоритм понемногу подправляет каждый вес, чтобы ошибок было меньше."],
                        ["У самых больших современных сетей миллиарды весов.", true, "Веса ещё называют параметрами, и у самых больших сетей их миллиарды."],
                        ["Разблокировка по лицу и голосовые помощники работают на глубоких нейросетях.", true, "Урок называет разблокировку по лицу, голосовых помощников, переводчики и чат-ботов."]
                    ]
                },
                {
                    type: "explain",
                    text: "Объясни своими словами, как учится нейросеть. Используй слова «веса» и «ошибка».",
                    answer: "Сначала веса случайные, и ответы бессмысленные. Во время обучения сеть сравнивает свой ответ с правильным, а обратное распространение ошибки вычисляет, как подправить каждый вес, чтобы ошибка уменьшилась. После миллионов крошечных поправок в весах хранится всё, чему сеть научилась.",
                    lines: 5
                }
            ]
        }
    },

    // ----- Lesson 4: Generative AI & Chatbots -----
    4: {
        exit: "q25",
        quiz: ["q24", "q26", "m5"],
        en: {
            objectives: [
                "explain that generative AI creates new content, and give examples;",
                "describe how a large language model writes: it predicts the next token, again and again;",
                "explain what a hallucination is, and use chatbots wisely: check the facts and keep personal data private."
            ],
            warmup: "Have you ever asked a chatbot something and got a wrong answer? What happened?",
            warmupNote: "Expect stories of confident mistakes. Keep them for the discussion about hallucinations.",
            reading: "Students look for what “LLM” and “token” mean, and for why a chatbot can invent facts.",
            activity: {
                title: "Mini-lab “Be the language model”",
                steps: [
                    "Students open the mini-lab in lesson 4: the start of a sentence, “After school, I like to…”, and six possible next words with their chances.",
                    "At temperature 1.0 they press “Generate next word” ten times and keep a tally of the words they get.",
                    "They move the temperature to the lowest and then to the highest setting, and fill in the worksheet's table.",
                    "Pairs explain why a chatbot can give a different answer each time you ask."
                ]
            },
            extension: "Fast finishers write a sentence start of their own and invent six next words with chances that add up to 100%.",
            discussion: [
                "Why does a chatbot sound so sure, even when it is wrong?",
                "When is it fine to use a chatbot for schoolwork, and when is it not?",
                "What should you never type into a chatbot? Why?",
                "Low or high temperature: which would you want for a maths answer, and which for a poem?"
            ],
            exit: "In one sentence, explain what a hallucination is, and give one way to catch one.",
            easier: "Before the mini-lab, play the game on paper: the class suggests next words for “After school, I like to…”, and you tally them on the board as chances.",
            harder: "Students write two prompts for the same task, one vague and one clear (what you need, some context, the format), and explain which would get the better answer and why.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Generative AI creates new [content]: text, images, music, code and even video.",
                        "Chatbots run on large [language] models (LLMs).",
                        "Text is split into small pieces called [tokens].",
                        "The model calculates a [probability] for every possible next token.",
                        "When a chatbot confidently invents facts, it is called a [hallucination]."
                    ],
                    extra: ["database"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Be the language model” in lesson 4. Move the temperature slider and fill in the table.",
                    table: {
                        head: ["Temperature", "Chance of “play”", "Chance of “code”"],
                        rows: [
                            ["0.2 (the lowest)", "[96%]", "[less than 1%]"],
                            ["1.0", "[42%]", "[4%]"],
                            ["2.0 (the highest)", "[28%]", "[9%]"]
                        ]
                    },
                    items: [
                        "What happens to the unlikely words when the temperature goes up? [Their chances grow, so surprising words are picked more often.]"
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["A chatbot looks every fact up in a database before it answers.", false, "Unless it is connected to a search tool, it writes text that sounds likely, from the patterns it learned."],
                        ["A chatbot writes its answer one token at a time.", true, "It picks a next token, adds it to the text and repeats, very fast."],
                        ["A clear prompt that says what you need, gives some context and names the format gets better answers.", true, "That is the lesson's tip for using generative AI well."],
                        ["It is safe to tell a chatbot your password, because it is only a program.", false, "What you type may be stored. Never share passwords or other personal information."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["generative AI", "AI that creates new text, images, sound, code or video"],
                        ["hallucination", "a confident answer that is made up"],
                        ["LLM", "a large language model, trained on a huge amount of text"],
                        ["prompt", "what you type to tell the AI what you want"],
                        ["token", "a small piece of text: a word or a part of a word"]
                    ]
                },
                {
                    type: "sort",
                    groups: ["A good use", "A bad idea"],
                    items: [
                        ["Brainstorming ideas for a story", 0],
                        ["Copying its answer into your homework", 1],
                        ["Asking it to explain a hard topic in a new way", 0],
                        ["Trusting a fact without checking it", 1],
                        ["Practising a foreign language", 0],
                        ["Telling it your home address", 1]
                    ]
                },
                {
                    type: "explain",
                    text: "Explain to a younger student how a chatbot writes its answer, step by step.",
                    answer: "It splits the text into tokens (words or parts of words). Then it works out a probability for every possible next token, picks one, adds it to the text and repeats, token by token, very fast. Extra training with feedback from people taught it to follow instructions and be helpful.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "объяснить, что генеративный ИИ создаёт новое, и привести примеры;",
                "описать, как пишет большая языковая модель: снова и снова предсказывает следующий токен;",
                "объяснить, что такое галлюцинация, и пользоваться чат-ботами с умом: проверять факты и не делиться личными данными."
            ],
            warmup: "Бывало, что чат-бот отвечал тебе неправильно? Что произошло?",
            warmupNote: "Скорее всего, прозвучат истории об уверенных ошибках. Их стоит запомнить для обсуждения галлюцинаций.",
            reading: "Ученики ищут, что значат слова «LLM» и «токен» и почему чат-бот может выдумывать факты.",
            activity: {
                title: "Мини-лаборатория «Побудь языковой моделью»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 4: начало фразы «После школы я люблю…» и шесть возможных следующих слов с их вероятностями.",
                    "При температуре 1,0 десять раз нажимают «Сгенерировать слово» и отмечают, какие слова выпали.",
                    "Ставят температуру сначала на самое низкое, потом на самое высокое значение и заполняют таблицу в рабочем листе.",
                    "Пары объясняют, почему чат-бот может каждый раз отвечать по-разному."
                ]
            },
            extension: "Кто закончил раньше, придумывает своё начало фразы и шесть следующих слов с вероятностями, которые в сумме дают 100%.",
            discussion: [
                "Почему чат-бот звучит так уверенно, даже когда ошибается?",
                "Когда пользоваться чат-ботом для учёбы нормально, а когда нет?",
                "Что никогда не стоит писать чат-боту? Почему?",
                "Низкая или высокая температура: какую выбрать для решения задачи по математике, а какую — для стихотворения?"
            ],
            exit: "Объясни в одном предложении, что такое галлюцинация, и назови один способ её поймать.",
            easier: "До мини-лаборатории сыграть в эту игру на бумаге: класс предлагает продолжения фразы «После школы я люблю…», а на доске подсчитываются голоса — получаются вероятности.",
            harder: "Написать два запроса для одной задачи — расплывчатый и понятный (что нужно, контекст, формат) — и объяснить, какой даст ответ лучше и почему.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Генеративный ИИ создаёт новый [контент]: тексты, изображения, музыку, код и даже видео.",
                        "Чат-боты работают на больших [языковых] моделях (LLM).",
                        "Текст разбивается на маленькие кусочки — [токены].",
                        "Модель вычисляет [вероятность] каждого возможного следующего токена.",
                        "Когда чат-бот уверенно выдумывает факты, это называется [галлюцинацией]."
                    ],
                    extra: ["базой данных"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Побудь языковой моделью» в уроке 4. Двигай ползунок температуры и заполни таблицу.",
                    table: {
                        head: ["Температура", "Вероятность «играть»", "Вероятность «программировать»"],
                        rows: [
                            ["0,2 (самая низкая)", "[96%]", "[меньше 1%]"],
                            ["1,0", "[42%]", "[4%]"],
                            ["2,0 (самая высокая)", "[28%]", "[9%]"]
                        ]
                    },
                    items: [
                        "Что происходит с маловероятными словами, когда температура растёт? [Их шансы растут, поэтому неожиданные слова выбираются чаще.]"
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Прежде чем ответить, чат-бот ищет каждый факт в базе данных.", false, "Если его не подключили к поиску, он пишет текст, который звучит правдоподобно, по выученным закономерностям."],
                        ["Чат-бот пишет ответ по одному токену за раз.", true, "Он выбирает следующий токен, добавляет его к тексту и повторяет — очень быстро."],
                        ["На понятный запрос, где сказано, что нужно, есть контекст и назван формат, чат-бот отвечает лучше.", true, "Это совет из урока о том, как пользоваться генеративным ИИ."],
                        ["Чат-боту можно сказать свой пароль: это ведь просто программа.", false, "Всё, что ты пишешь, может сохраняться. Никогда не сообщай пароли и другие личные данные."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["генеративный ИИ", "ИИ, который создаёт новые тексты, изображения, звук, код или видео"],
                        ["галлюцинация", "уверенный ответ, который на самом деле выдуман"],
                        ["LLM", "большая языковая модель, обученная на огромном количестве текстов"],
                        ["запрос (промпт)", "то, что ты пишешь ИИ, чтобы объяснить, чего хочешь"],
                        ["токен", "маленький кусочек текста: слово или часть слова"]
                    ]
                },
                {
                    type: "sort",
                    groups: ["Хорошая идея", "Плохая идея"],
                    items: [
                        ["Придумать идеи для рассказа", 0],
                        ["Скопировать ответ в домашнее задание", 1],
                        ["Попросить объяснить сложную тему по-новому", 0],
                        ["Поверить факту без проверки", 1],
                        ["Потренировать иностранный язык", 0],
                        ["Сообщить ему свой домашний адрес", 1]
                    ]
                },
                {
                    type: "explain",
                    text: "Объясни младшему школьнику, как чат-бот пишет ответ, шаг за шагом.",
                    answer: "Он разбивает текст на токены — слова или части слов. Потом вычисляет вероятность каждого возможного следующего токена, выбирает один, добавляет к тексту и повторяет — токен за токеном, очень быстро. А дополнительное обучение с отзывами людей научило его выполнять просьбы и быть полезным.",
                    lines: 5
                }
            ]
        }
    },

    // ----- Lesson 5: AI in Everyday Life -----
    5: {
        exit: "q27",
        quiz: ["q9", "q29", "m8"],
        en: {
            objectives: [
                "find the AI hidden in everyday apps and devices;",
                "explain how a recommendation system learns from what you watch, like and skip;",
                "explain what a filter bubble is, and name ways to stay in control of a feed."
            ],
            warmup: "Think about your day so far. Where might AI have helped you without you noticing?",
            warmupNote: "List the answers. Many students think only of chatbots: the lesson shows how much AI hides in ordinary apps.",
            reading: "Students look for three places where AI hides in a phone, and for what a filter bubble is.",
            activity: {
                title: "Mini-lab “Spot the hidden AI”",
                steps: [
                    "Students open the mini-lab in lesson 5: an ordinary day in six moments.",
                    "Before tapping a moment, they guess what AI hides in it and write the guess on the worksheet.",
                    "Then they tap the moment, read the answer and check their guess.",
                    "Pairs add one more moment from their own day, with the AI hidden in it."
                ]
            },
            extension: "Fast finishers draw their own day as a timeline with at least four moments of hidden AI.",
            discussion: [
                "Your feed is designed to keep you watching. When is that good for you, and when isn't it?",
                "Have you ever noticed a filter bubble in your own feed? What could break it?",
                "Banks use AI to spot fraud, and doctors use it to read scans. What should happen when the AI is wrong?",
                "Which hidden AI in your day would you switch off if you could? Why?"
            ],
            exit: "Name one app you use that recommends things, and one thing it might have learned about you.",
            easier: "Give students the names of the six kinds of hidden AI (face recognition, arrival-time prediction, predictive text, spam filter, computational photography, recommendation system) to match with the moments.",
            harder: "Students write a short guide for a younger student: three signs that a feed is choosing for you, and three ways to take back control.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Many phones have a special chip for AI, often called a neural processing [unit] (NPU).",
                        "Video and music apps use [recommendation] systems to guess what you will enjoy next.",
                        "These systems learn from what you watch, like, skip and [replay].",
                        "A [filter] bubble is when you mostly see things that match what you already like or believe.",
                        "Scientists used AlphaFold to predict the 3D shapes of [proteins]."
                    ],
                    extra: ["passwords"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Spot the hidden AI” in lesson 5. For each moment, write your guess first, then tap the moment and write the answer.",
                    table: {
                        head: ["Moment", "My guess", "The hidden AI"],
                        rows: [
                            ["Unlock your phone with your face", "", "[Face recognition]"],
                            ["Check when the bus will arrive", "", "[Arrival-time prediction]"],
                            ["Text a friend", "", "[Predictive text and autocorrect]"],
                            ["Check your email", "", "[A spam filter]"],
                            ["Take a photo of the sunset", "", "[Computational photography]"],
                            ["Watch a few videos", "", "[A recommendation system]"]
                        ]
                    }
                },
                {
                    type: "sort",
                    groups: ["Usually uses AI", "Just fixed rules"],
                    items: [
                        ["A video app's “Up next” suggestions", 0],
                        ["A bank flagging an unusual payment", 0],
                        ["A doorbell that rings when you press it", 1],
                        ["A camera that brightens a night photo by itself", 0],
                        ["A kitchen timer", 1],
                        ["A light that switches on at 7 p.m. every day", 1]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Many AI features on a phone work right on the phone, without the Internet.", true, "Many of them run on the phone itself; special AI chips help."],
                        ["Recommendation systems compare you with millions of other users.", true, "They look for people with similar tastes to guess what you will enjoy."],
                        ["A map app's arrival time is just the distance divided by the speed limit.", false, "Map apps learn from traffic data sent by many phones and vehicles, so they can predict delays."],
                        ["AlphaFold's work on proteins won a Nobel Prize in 2024.", true, "It was part of the 2024 Nobel Prize in Chemistry."]
                    ]
                },
                {
                    type: "explain",
                    text: "Explain how your video feed seems to “know” what you like. Use the word “pattern”.",
                    answer: "The app notes what you watch, like, skip and replay, and compares it with millions of other users. It finds patterns, such as “people who watched this also watched that”, and recommends the videos that are most likely to keep you watching.",
                    lines: 4
                },
                {
                    type: "explain",
                    text: "Write three things you can do to stay in control of your feed.",
                    answer: "Search for new topics; follow people with different interests and views; take a break when scrolling stops being fun. Remembering that an algorithm picks what you see helps too.",
                    lines: 3
                }
            ]
        },
        ru: {
            objectives: [
                "находить ИИ, скрытый в обычных приложениях и устройствах;",
                "объяснить, как рекомендательная система учится на том, что ты смотришь, лайкаешь и пропускаешь;",
                "объяснить, что такое информационный пузырь, и назвать способы сохранить контроль над лентой."
            ],
            warmup: "Вспомни сегодняшний день. Где ИИ мог помочь тебе незаметно?",
            warmupNote: "Записать ответы. Многие вспоминают только чат-ботов, а урок показывает, сколько ИИ спрятано в обычных приложениях.",
            reading: "Ученики ищут три места, где ИИ прячется в телефоне, и что такое информационный пузырь.",
            activity: {
                title: "Мини-лаборатория «Найди скрытый ИИ»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 5: обычный день из шести моментов.",
                    "Прежде чем нажать на момент, угадывают, какой ИИ в нём скрыт, и записывают догадку в рабочий лист.",
                    "Потом нажимают на момент, читают ответ и проверяют догадку.",
                    "Пары добавляют ещё один момент из своего дня — со скрытым в нём ИИ."
                ]
            },
            extension: "Кто закончил раньше, рисует свой день в виде ленты времени, где не меньше четырёх моментов со скрытым ИИ.",
            discussion: [
                "Лента устроена так, чтобы удерживать твоё внимание как можно дольше. Когда это тебе на пользу, а когда нет?",
                "Встречался ли тебе информационный пузырь в собственной ленте? Что может его разрушить?",
                "Банки с помощью ИИ ловят мошенников, а врачи — читают снимки. Что должно происходить, когда ИИ ошибается?",
                "Какой скрытый ИИ из своего дня хочется выключить? Почему?"
            ],
            exit: "Назови приложение с рекомендациями, которым ты пользуешься, и одну вещь, которую оно могло о тебе узнать.",
            easier: "Дать названия шести видов скрытого ИИ (распознавание лиц, прогноз времени прибытия, подсказки при наборе текста, спам-фильтр, вычислительная фотография, рекомендательная система), чтобы соединить их с моментами дня.",
            harder: "Написать короткую памятку для младшего школьника: три признака того, что лента выбирает за тебя, и три способа вернуть себе контроль.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Во многих телефонах есть отдельный чип для ИИ — его часто называют [нейропроцессором] (NPU).",
                        "Видеосервисы и музыкальные приложения используют [рекомендательные] системы, чтобы угадать, что тебе понравится.",
                        "Эти системы учатся на том, что ты смотришь, лайкаешь, пропускаешь и [пересматриваешь].",
                        "Информационный [пузырь] — это когда ты видишь в основном то, что совпадает с твоими вкусами и взглядами.",
                        "С помощью AlphaFold учёные предсказали трёхмерную форму [белков]."
                    ],
                    extra: ["паролей"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Найди скрытый ИИ» в уроке 5. Для каждого момента сначала запиши свою догадку, потом нажми на момент и запиши ответ.",
                    table: {
                        head: ["Момент", "Моя догадка", "Скрытый ИИ"],
                        rows: [
                            ["Разблокировать телефон по лицу", "", "[Распознавание лиц]"],
                            ["Узнать, когда придёт автобус", "", "[Прогноз времени прибытия]"],
                            ["Написать другу", "", "[Подсказки и автозамена]"],
                            ["Проверить почту", "", "[Спам-фильтр]"],
                            ["Сфотографировать закат", "", "[Вычислительная фотография]"],
                            ["Посмотреть пару видео", "", "[Рекомендательная система]"]
                        ]
                    }
                },
                {
                    type: "sort",
                    groups: ["Обычно с ИИ", "Просто заданные правила"],
                    items: [
                        ["Подборка «Смотреть дальше» в видеоприложении", 0],
                        ["Банк замечает подозрительный платёж", 0],
                        ["Дверной звонок, который звенит, когда на него нажимают", 1],
                        ["Камера, которая сама осветляет ночной снимок", 0],
                        ["Кухонный таймер", 1],
                        ["Свет, который включается каждый день в 19:00", 1]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Многие функции ИИ в телефоне работают прямо на нём, без интернета.", true, "Многое работает на самом телефоне, а помогают в этом специальные чипы для ИИ."],
                        ["Рекомендательные системы сравнивают тебя с миллионами других пользователей.", true, "Они ищут людей с похожими вкусами, чтобы угадать, что тебе понравится."],
                        ["Навигатор считает время в пути просто как расстояние, делённое на разрешённую скорость.", false, "Карты учатся на данных о движении от множества телефонов и машин, поэтому предсказывают задержки."],
                        ["Работа AlphaFold над белками получила Нобелевскую премию в 2024 году.", true, "Она стала частью Нобелевской премии по химии 2024 года."]
                    ]
                },
                {
                    type: "explain",
                    text: "Объясни, как твоя видеолента «узнаёт», что тебе нравится. Используй слово «закономерность».",
                    answer: "Приложение запоминает, что ты смотришь, лайкаешь, пропускаешь и пересматриваешь, и сравнивает это с миллионами других пользователей. Оно находит закономерности — например, «кто смотрел это, смотрел и то» — и рекомендует видео, которые скорее всего удержат твоё внимание.",
                    lines: 4
                },
                {
                    type: "explain",
                    text: "Напиши три вещи, которые помогут тебе сохранить контроль над своей лентой.",
                    answer: "Искать новые темы; подписываться на людей с другими интересами и взглядами; делать перерыв, когда листать ленту становится неинтересно. Помогает и просто помнить, что ленту выбирает алгоритм.",
                    lines: 3
                }
            ]
        }
    },

    // ----- Lesson 6: AI Ethics & Safety -----
    6: {
        exit: "q30",
        quiz: ["q12", "q31", "m10"],
        en: {
            objectives: [
                "explain how AI can learn bias from its data, with a real example;",
                "check a suspicious video or picture before sharing it;",
                "protect their privacy when using AI tools, and explain why people stay responsible for decisions made with AI."
            ],
            warmup: "A video shows a famous person saying something shocking. How could you tell whether it is real?",
            warmupNote: "Collect strategies. Point out that looking for glitches gets harder as fakes improve; checking the source works better, which is the lesson's advice.",
            reading: "Students look for the example of the biased hiring tool, and for the lesson's advice on deepfakes and privacy.",
            activity: {
                title: "Mini-lab “What would you do?”",
                steps: [
                    "Students open the mini-lab in lesson 6 and read the three situations.",
                    "For each one, pairs agree on a choice before they click, and note why.",
                    "They click their choice and read the feedback; if it wasn't the best choice, they read the better one.",
                    "The class votes on which situation is the hardest in real life, and why."
                ]
            },
            extension: "Fast finishers write a situation of their own, with three choices and the feedback for each.",
            discussion: [
                "If an AI learned to be unfair from human decisions, who should fix it, and how?",
                "Should AI-made videos always be labelled? Who should make sure they are?",
                "Which important decisions should always be checked by a person? Why those?",
                "Some families agree on a secret code word for emergency calls. How does that help against voice scams?"
            ],
            exit: "Write one thing you will check before you share a shocking video.",
            easier: "Read the situations aloud, and let students vote with A, B and C cards before you discuss each one.",
            harder: "Students write a short class policy for using AI tools safely: what never to share, how to check AI-made content, and when to say that AI helped.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "When AI learns people's unfairness from its data, it is called [bias].",
                        "Realistic fake photos, videos and voices made by AI are called [deepfakes].",
                        "Fakes keep getting better, so checking the [source] matters more than looking for glitches.",
                        "Never share [passwords], your home address or private photos with a chatbot.",
                        "Important decisions, in medicine, in courts or in hiring, should always be checked by a [human]."
                    ],
                    extra: ["filters"]
                },
                {
                    type: "truefalse",
                    items: [
                        ["News reports in 2018 revealed that Amazon had dropped an experimental hiring tool that was biased against women.", true, "It had learned from ten years of CVs that mostly came from men."],
                        ["Some face-recognition systems make far more mistakes with darker-skinned women than with lighter-skinned men.", true, "Researchers found this; lesson 11 tells the story of their study."],
                        ["What you type into an AI tool always disappears when you close it.", false, "It may be stored, and even used to train future models."],
                        ["The European Union adopted its AI Act in 2024.", true, "It is one of the world's first big laws on AI."]
                    ]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “What would you do?” in lesson 6. For each situation, write the best choice, and why it is the best.",
                    items: [
                        "A shocking video that everyone is sharing: [Check whether trusted news sources report it: popular doesn't mean true.]",
                        "A chatbot's “perfect quote” for your essay: [Find the book or source and check that the quote is real: chatbots can make up quotes.]",
                        "A fun app that wants your name, your school and lots of selfies: [Read what the app does with your data and share as little as possible: your face and details are valuable data.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["Fine to ask a chatbot", "Keep it private"],
                    items: [
                        ["“How do volcanoes work?”", 0],
                        ["Your password", 1],
                        ["“Can you explain fractions with an example?”", 0],
                        ["Your home address", 1],
                        ["Ideas for a birthday party", 0],
                        ["A private photo of a friend", 1]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["bias", "unfairness that an AI learns from its data"],
                        ["deepfake", "a realistic fake photo, video or voice made by AI"],
                        ["privacy", "your right to keep personal information to yourself"],
                        ["AI Act", "the European Union's law on AI, adopted in 2024"],
                        ["code word", "a secret family word to check who is calling in an emergency"]
                    ]
                },
                {
                    type: "explain",
                    text: "Explain how an AI system can become unfair even if nobody programs it to be. Use the hiring tool from the lesson as your example.",
                    answer: "AI learns from data made by people. The hiring tool learned from ten years of CVs that mostly came from men, so it learned to prefer CVs like theirs and became biased against women. Nobody programmed this: it copied a pattern in the data.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "объяснить на реальном примере, как ИИ может перенять предвзятость из данных;",
                "проверять подозрительное видео или фото, прежде чем им делиться;",
                "защищать свою приватность при работе с ИИ и объяснять, почему за решения, принятые с помощью ИИ, отвечают люди."
            ],
            warmup: "На видео известный человек говорит что-то шокирующее. Как понять, настоящее ли это видео?",
            warmupNote: "Собрать способы проверки. Подчеркнуть: искать «глюки» всё труднее, потому что подделки становятся лучше, — надёжнее проверять источник. Это и советует урок.",
            reading: "Ученики ищут пример предвзятой системы подбора сотрудников и советы урока о дипфейках и приватности.",
            activity: {
                title: "Мини-лаборатория «А как поступишь ты?»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 6 и читают три ситуации.",
                    "Для каждой пары договариваются о выборе ещё до нажатия и записывают почему.",
                    "Нажимают свой вариант и читают отзыв; если выбор был не лучшим — читают, какой лучше.",
                    "Класс голосует, какая ситуация труднее всего в реальной жизни, и объясняет почему."
                ]
            },
            extension: "Кто закончил раньше, придумывает свою ситуацию с тремя вариантами и отзывом на каждый.",
            discussion: [
                "Если ИИ научился несправедливости на решениях людей, кто должен это исправлять и как?",
                "Нужно ли всегда помечать видео, созданные ИИ? Кто должен за этим следить?",
                "Какие важные решения всегда должен проверять человек? Почему именно эти?",
                "Некоторые семьи договариваются о секретном кодовом слове для экстренных звонков. Как это помогает против мошенников с поддельным голосом?"
            ],
            exit: "Напиши, что ты проверишь, прежде чем поделиться шокирующим видео.",
            easier: "Читать ситуации вслух и давать классу проголосовать карточками A, B и C, прежде чем обсуждать каждую.",
            harder: "Составить короткие правила класса о безопасной работе с ИИ: чем никогда не делиться, как проверять то, что создал ИИ, и когда говорить, что помог ИИ.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Когда ИИ перенимает из данных человеческую несправедливость, это называется [предвзятостью].",
                        "Реалистичные поддельные фото, видео и голоса, созданные ИИ, называют [дипфейками].",
                        "Подделки становятся всё лучше, поэтому проверить [источник] важнее, чем искать «глюки».",
                        "Никогда не сообщай чат-боту [пароли], домашний адрес и личные фото.",
                        "Важные решения — в медицине, в суде, при приёме на работу — всегда должен проверять [человек]."
                    ],
                    extra: ["фильтр"]
                },
                {
                    type: "truefalse",
                    items: [
                        ["В 2018 году журналисты рассказали, что Amazon отказалась от экспериментальной системы подбора сотрудников, предвзятой к женщинам.", true, "Она училась на резюме за десять лет, и почти все они были от мужчин."],
                        ["Некоторые системы распознавания лиц гораздо чаще ошибаются с темнокожими женщинами, чем со светлокожими мужчинами.", true, "Это обнаружили исследователи; об их работе рассказывает урок 11."],
                        ["Всё, что ты пишешь ИИ-сервису, исчезает, как только ты его закрываешь.", false, "Это может сохраняться и даже использоваться для обучения будущих моделей."],
                        ["Европейский союз принял свой Закон об ИИ в 2024 году.", true, "Это один из первых в мире больших законов об ИИ."]
                    ]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «А как поступишь ты?» в уроке 6. Для каждой ситуации напиши лучший выбор и почему он лучший.",
                    items: [
                        "Шокирующее видео, которым все делятся: [Проверить, пишут ли о нём надёжные новостные источники: популярное не значит правдивое.]",
                        "«Идеальная цитата» от чат-бота для сочинения: [Найти книгу или источник и проверить, что цитата настоящая: чат-боты могут выдумывать цитаты.]",
                        "Забавное приложение просит имя, школу и много селфи: [Прочитать, что приложение делает с данными, и делиться как можно меньшим: лицо и личные данные — ценная информация.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["Можно спросить у чат-бота", "Это личное"],
                    items: [
                        ["«Как устроены вулканы?»", 0],
                        ["Твой пароль", 1],
                        ["«Объясни дроби на примере»", 0],
                        ["Твой домашний адрес", 1],
                        ["Идеи для дня рождения", 0],
                        ["Личное фото друга", 1]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["предвзятость", "несправедливость, которую ИИ перенимает из данных"],
                        ["дипфейк", "реалистичная подделка фото, видео или голоса, созданная ИИ"],
                        ["приватность", "твоё право держать личную информацию при себе"],
                        ["Закон об ИИ", "закон Европейского союза об ИИ, принятый в 2024 году"],
                        ["кодовое слово", "секретное семейное слово, чтобы проверить, кто звонит в экстренной ситуации"]
                    ]
                },
                {
                    type: "explain",
                    text: "Объясни, как система ИИ может стать несправедливой, даже если никто её так не программировал. Используй пример системы подбора сотрудников из урока.",
                    answer: "ИИ учится на данных, созданных людьми. Система подбора сотрудников училась на резюме за десять лет, и почти все они были от мужчин, поэтому она стала предпочитать похожие резюме и оказалась предвзятой к женщинам. Никто этого не программировал: она повторила закономерность из данных.",
                    lines: 5
                }
            ]
        }
    }
});
