/* =========================================================
   AI COMPASS — TEXTS: LESSON PLANS AND WORKSHEETS, LESSONS 7-12
   The teacher kit's plans and worksheets for the "Deep dive" track, in
   English and in Russian. Lessons 1-6 are in js/content/teachers-basics.js,
   and its header explains every part of a plan and every kind of task.
   This file is big, so js/teachers-kit.js loads it only when a teacher
   opens a plan or a worksheet.
   To change a text, change it in both languages: English and Russian
   must keep the same parts, in the same order, with the same number of
   items (a match task's pairs, a table's rows, the gaps in [brackets]).
   The quiz questions are only named here, by their id: their texts stay
   in js/content/quiz-bank.js.
   ========================================================= */

window.AICompass.content.set("teachers-plans", {
    // ----- Lesson 7: How Computers See -----
    7: {
        exit: "q34",
        quiz: ["q32", "q33", "m11"],
        en: {
            objectives: [
                "explain how a picture becomes a grid of numbers (pixels, greyscale and RGB);",
                "describe how a filter slides over a picture to find edges (a convolution);",
                "explain how a CNN builds up from edges to objects, and why vision models can be fooled."
            ],
            warmup: "Zoom into a photo as far as you can. What do you see in the end?",
            warmupNote: "If you can, zoom into a photo on the projector until the squares appear. Then ask: how could a computer store each square?",
            reading: "Students look for what 0 and 255 mean, what a filter does, and what an adversarial example is.",
            activity: {
                title: "Mini-lab “Pixel detective”",
                steps: [
                    "Students open the mini-lab in lesson 7 and pick the shape “Square”.",
                    "They try the three filters (vertical edges, horizontal edges, blur) and read the sentence under the result each time.",
                    "They point at one square of the result and check its sum by hand: multiply square by square, then add up.",
                    "They fill in the worksheet's table for the other shapes, then paint a picture of their own."
                ]
            },
            extension: "Fast finishers paint a picture that the vertical-edge filter finds but the horizontal-edge filter misses completely, and explain why it works.",
            discussion: [
                "Face unlock works well in daylight but worse in the dark. Why might that be?",
                "Nobody writes a CNN's filters by hand. Where do they come from?",
                "A few stickers on a stop sign can make a model misread it. What does that mean for cars that read road signs?",
                "A vision model finds patterns, not meaning. What is the difference?"
            ],
            exit: "In one sentence, explain what a filter does to a picture.",
            easier: "Before the mini-lab, draw a small grid of 0s and 1s and a 3 × 3 vertical-edge filter on the board, and work out two squares of the result together.",
            harder: "Students work out by hand what the blur filter gives at a corner of the square, as a fraction, and check it in the mini-lab.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "To a computer, a picture is a grid of tiny squares called [pixels].",
                        "In a greyscale picture, 0 means black and [255] means white.",
                        "A colour pixel has three numbers: red, green and [blue].",
                        "Sliding a small filter over a picture and adding up the products is called a [convolution].",
                        "Tiny changes to a picture that fool a model are called [adversarial] examples."
                    ],
                    extra: ["yellow"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Pixel detective” in lesson 7. For each shape and filter, write how many squares of the result found an edge.",
                    table: {
                        head: ["Shape", "Vertical edges", "Horizontal edges"],
                        rows: [
                            ["Square", "[32]", "[32]"],
                            ["Plus", "[56]", "[56]"],
                            ["Digit 7", "[51]", "[64]"]
                        ]
                    },
                    items: [
                        "Why is the result 10 × 10 when the picture is 12 × 12? [The 3 × 3 window has to fit inside the picture, so there is one place fewer on every side.]",
                        "What does an edge filter give where the picture is all one colour? [0]"
                    ]
                },
                {
                    type: "order",
                    items: [
                        "Simple edges and spots of colour",
                        "Corners and textures",
                        "Parts, like eyes or wheels",
                        "Whole objects, like “cat” or “bicycle”"
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["A 12-megapixel photo is about 36 million numbers.", true, "12 million pixels × 3 numbers (red, green and blue) = about 36 million."],
                        ["Programmers write every filter of a CNN by hand.", false, "The network learns the numbers of its filters from large sets of labelled photos."],
                        ["In 2012, a CNN called AlexNet won a big photo-recognition contest by a wide margin.", true, "It won ImageNet, a contest to sort photos into 1,000 categories, and helped start the deep learning boom."],
                        ["Bad lighting and unusual angles can confuse a vision model.", true, "It finds patterns, not meaning, so pictures unlike its training photos can fool it."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["pixel", "one tiny square of a picture, stored as a number"],
                        ["RGB", "the three numbers of a colour pixel: red, green and blue"],
                        ["filter", "a small grid of numbers that slides over a picture"],
                        ["CNN", "a neural network that uses many filters, in layers"],
                        ["adversarial example", "a picture changed on purpose to fool a model"]
                    ]
                },
                {
                    type: "explain",
                    text: "In 2014, researchers added a faint pattern of noise to a photo of a panda. People still saw a panda, but the network said “gibbon”. Explain why this matters.",
                    answer: "The network finds number patterns, not meaning, so tiny changes that people can't even see can change its answer completely, and it can be very sure of the wrong answer. Systems where safety is at stake, like cars that read road signs, must be tested very carefully.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "объяснить, как картинка превращается в сетку чисел (пиксели, оттенки серого, RGB);",
                "описать, как фильтр скользит по картинке и находит края (свёртка);",
                "объяснить, как свёрточная сеть переходит от краёв к целым предметам и почему модели зрения можно обмануть."
            ],
            warmup: "Увеличь фотографию на телефоне до предела. Что видно в самом конце?",
            warmupNote: "По возможности увеличить фото на проекторе, пока не появятся квадратики. Затем спросить: как компьютер может хранить каждый квадратик?",
            reading: "Ученики ищут, что означают числа 0 и 255, что делает фильтр и что такое состязательный пример.",
            activity: {
                title: "Мини-лаборатория «Пиксельный детектив»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 7 и выбирают фигуру «Квадрат».",
                    "Пробуют три фильтра (вертикальные края, горизонтальные края, размытие) и каждый раз читают фразу под результатом.",
                    "Наводят на одну клетку результата и проверяют её сумму вручную: перемножить клетки попарно и сложить.",
                    "Заполняют таблицу в рабочем листе для других фигур, а потом рисуют свою картинку."
                ]
            },
            extension: "Кто закончил раньше, рисует картинку, которую фильтр вертикальных краёв находит, а фильтр горизонтальных совсем не замечает, и объясняет почему.",
            discussion: [
                "Разблокировка по лицу днём работает хорошо, а в темноте хуже. Почему так может быть?",
                "Фильтры свёрточной сети никто не пишет вручную. Откуда они берутся?",
                "Несколько наклеек на знаке «Стоп» могут заставить модель неправильно его прочитать. Что это значит для машин, которые читают дорожные знаки?",
                "Модель зрения находит узоры, а не смысл. В чём разница?"
            ],
            exit: "Объясни в одном предложении, что фильтр делает с картинкой.",
            easier: "Перед мини-лабораторией нарисовать на доске маленькую сетку из 0 и 1 и фильтр вертикальных краёв 3 × 3 и вместе посчитать две клетки результата.",
            harder: "Вручную посчитать, что фильтр размытия даёт в углу квадрата (в виде дроби), и проверить в мини-лаборатории.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Для компьютера картинка — это сетка крошечных квадратиков — [пикселей].",
                        "В чёрно-белой картинке 0 означает чёрный цвет, а [255] — белый.",
                        "У цветного пикселя три числа: красный, зелёный и [синий].",
                        "Когда маленький фильтр скользит по картинке, а произведения складываются, это называется [свёрткой].",
                        "Крошечные изменения картинки, которые обманывают модель, называют [состязательными] примерами."
                    ],
                    extra: ["жёлтый"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Пиксельный детектив» в уроке 7. Для каждой фигуры и каждого фильтра запиши, сколько клеток результата нашли край.",
                    table: {
                        head: ["Фигура", "Вертикальные края", "Горизонтальные края"],
                        rows: [
                            ["Квадрат", "[32]", "[32]"],
                            ["Плюс", "[56]", "[56]"],
                            ["Цифра 7", "[51]", "[64]"]
                        ]
                    },
                    items: [
                        "Почему результат 10 × 10, если картинка 12 × 12? [Окно 3 × 3 должно целиком помещаться в картинке, поэтому с каждой стороны получается на одно место меньше.]",
                        "Что даёт фильтр краёв там, где вся картинка одного цвета? [0]"
                    ]
                },
                {
                    type: "order",
                    items: [
                        "Простые края и пятна цвета",
                        "Уголки и текстуры",
                        "Глаза, колёса и другие части",
                        "Целые предметы: «кошка», «велосипед»"
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Фото на 12 мегапикселей — это около 36 миллионов чисел.", true, "12 миллионов пикселей × 3 числа (красный, зелёный и синий) = около 36 миллионов."],
                        ["Программисты пишут каждый фильтр свёрточной сети вручную.", false, "Сеть сама подбирает числа своих фильтров на больших наборах фотографий с подписями."],
                        ["В 2012 году свёрточная сеть AlexNet с большим отрывом выиграла крупный конкурс по распознаванию фотографий.", true, "Она выиграла ImageNet — конкурс, где фото нужно было разложить по 1000 категорий, — и помогла начаться буму глубокого обучения."],
                        ["Плохое освещение и необычный ракурс могут сбить модель зрения с толку.", true, "Она находит узоры, а не смысл, поэтому картинки, непохожие на обучающие, могут её обмануть."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["пиксель", "один крошечный квадратик картинки, который хранится как число"],
                        ["RGB", "три числа цветного пикселя: красный, зелёный и синий"],
                        ["фильтр", "маленькая сетка чисел, которая скользит по картинке"],
                        ["свёрточная нейронная сеть", "нейросеть, в которой много фильтров, расположенных слоями"],
                        ["состязательный пример", "картинка, которую нарочно изменили, чтобы обмануть модель"]
                    ]
                },
                {
                    type: "explain",
                    text: "В 2014 году исследователи добавили к фотографии панды едва заметный узор из шума. Люди по-прежнему видели панду, а нейросеть сказала: «гиббон». Объясни, почему это важно.",
                    answer: "Нейросеть находит узоры из чисел, а не смысл, поэтому крошечные изменения, которых человек даже не видит, могут полностью поменять её ответ — и она может быть очень уверена в неправильном ответе. Системы, от которых зависит безопасность, например машины, читающие дорожные знаки, нужно проверять очень тщательно.",
                    lines: 5
                }
            ]
        }
    },

    // ----- Lesson 8: Learning by Trial and Error -----
    8: {
        exit: "q37",
        quiz: ["q36", "q38", "m14"],
        en: {
            objectives: [
                "describe reinforcement learning with the words agent, environment, action and reward;",
                "explain the balance between exploration and exploitation, with an everyday example;",
                "explain how an agent learns what each move is worth, and what reward hacking is."
            ],
            warmup: "How did you learn your favourite game: by reading the rules, or by trying, failing and trying again?",
            warmupNote: "Most students learned by playing. Link this to rewards (points, levels, a win): that is reinforcement learning.",
            reading: "Students look for the meaning of agent, environment and reward, and for the story of the boat that never finished the race.",
            activity: {
                title: "Mini-lab “Three slot machines”",
                steps: [
                    "Students open the mini-lab in lesson 8. Each machine gives a star with its own hidden chance.",
                    "In pairs, they plan before they pull: how many pulls will they spend exploring?",
                    "They use all their pulls, fill in the worksheet's table, and read the hidden chances at the end.",
                    "They switch on the robot player, play again, and compare their stars with the robot's."
                ]
            },
            extension: "Fast finishers explain the robot's strategy in their own words, and say when it would beat a human player.",
            discussion: [
                "When do you explore and when do you exploit in your own life? Give an example.",
                "The robot explores 1 time in 10. Would exploring more often help it or hurt it? Why?",
                "An agent found a loophole and scored points without finishing the race. Where else could a badly designed reward cause trouble?",
                "Chatbots are trained partly with feedback from people. Whose feedback should count?"
            ],
            exit: "Give one example of reward hacking (from the lesson, or your own idea), and say how you would fix the reward.",
            easier: "Play the slot machines as a class first: one student pulls, the class votes which machine to try next, and you keep score on the board.",
            harder: "Students design a reward for a robot vacuum cleaner, find a loophole in their own reward (a way to score without cleaning), and fix it.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "In reinforcement learning, the learner is called an [agent].",
                        "It acts in an [environment], such as a game or a room.",
                        "After its actions it gets a [reward]: a number that says how well it did.",
                        "Trying something new to learn more is called [exploration].",
                        "Using what already works is called [exploitation]."
                    ],
                    extra: ["label"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Three slot machines” in lesson 8 and play a whole game. Fill in the table as you play.",
                    table: {
                        head: ["Machine", "Pulls", "Stars", "Stars ÷ pulls"],
                        rows: [
                            ["A", "", "", ""],
                            ["B", "", "", ""],
                            ["C", "", "", ""]
                        ]
                    },
                    items: [
                        "Which machine was the best, and what was its hidden chance? [It changes every game, but the best machine always has a 75% chance.]",
                        "How many stars would pulling only the best machine give on average? [About 22.5 (30 × 75%).]",
                        "Did your “stars ÷ pulls” match the hidden chances? Why not exactly? [Roughly; with only a few pulls, luck still plays a big part.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["Exploration", "Exploitation"],
                    items: [
                        ["Ordering your favourite pizza again", 1],
                        ["Trying a café that just opened", 0],
                        ["Listening to a playlist of songs you already love", 1],
                        ["Taking a new route to school to see if it is faster", 0],
                        ["Playing the game level you always win", 1],
                        ["Going to a taster session for a new sport", 0]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["In reinforcement learning, someone shows the agent the right move every time.", false, "Nobody shows it the right moves: it finds out which actions bring the most reward over time."],
                        ["Q-values are the agent's scores for how good each action is in each situation.", true, "At first they are guesses; after each try, the agent nudges them towards what actually happened."],
                        ["A move with no reward right now can still be a great move.", true, "It can lead to a big reward later, so the agent learns to plan ahead."],
                        ["An agent that only exploits always finds the best choice.", false, "It can get stuck with “good enough” and never find something better."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["agent", "the learner: a game character, a robot or a program"],
                        ["environment", "the world the agent acts in, like a game"],
                        ["reward", "a number that says how well the agent did"],
                        ["deep reinforcement learning", "using a neural network to estimate how good each move is"],
                        ["RLHF", "training a chatbot with rewards based on what people preferred"]
                    ]
                },
                {
                    type: "explain",
                    text: "In a boat-racing game, an agent got points for hitting targets. It went round in circles in a lagoon and never finished the race. What went wrong, and how would you fix it?",
                    answer: "The agent chased the reward it got (points for targets), not what the designers meant (winning the race). This is reward hacking. A better reward would give points for finishing the race, and for finishing fast, not just for hitting targets.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "описать обучение с подкреплением словами «агент», «среда», «действие» и «награда»;",
                "объяснить на бытовом примере, как сочетать исследование и использование;",
                "объяснить, как агент узнаёт, сколько стоит каждый ход, и что такое взлом награды."
            ],
            warmup: "Как проще научиться новой игре: прочитать правила или пробовать, ошибаться и пробовать снова? А как было с твоей любимой игрой?",
            warmupNote: "Большинство учились, играя. Связать это с наградами — очками, уровнями, победой: это и есть обучение с подкреплением.",
            reading: "Ученики ищут, что значат слова «агент», «среда» и «награда», и историю о лодке, которая так и не закончила гонку.",
            activity: {
                title: "Мини-лаборатория «Три игровых автомата»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 8. Каждый автомат даёт звезду со своей скрытой вероятностью.",
                    "Пары заранее решают, сколько попыток потратить на исследование.",
                    "Используют все попытки, заполняют таблицу в рабочем листе и в конце читают скрытые вероятности.",
                    "Включают робота-игрока, играют снова и сравнивают свои звёзды со звёздами робота."
                ]
            },
            extension: "Кто закончил раньше, своими словами объясняет стратегию робота и рассуждает, когда она обыграет человека.",
            discussion: [
                "Когда в жизни ты исследуешь, а когда используешь проверенное? Приведи пример.",
                "Робот исследует в 1 случае из 10. Поможет ли ему исследовать чаще или навредит? Почему?",
                "Агент нашёл лазейку и набирал очки, не заканчивая гонку. Где ещё плохо придуманная награда может привести к беде?",
                "Чат-ботов отчасти обучают по отзывам людей. Чьи отзывы должны учитываться?"
            ],
            exit: "Приведи пример взлома награды (из урока или свой) и напиши, как исправить награду.",
            easier: "Сначала сыграть в автоматы всем классом: один ученик нажимает, класс голосует, какой автомат пробовать дальше, а счёт ведётся на доске.",
            harder: "Придумать награду для робота-пылесоса, найти в ней лазейку (как набрать очки, не убирая) и исправить её.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "В обучении с подкреплением ученика называют [агентом].",
                        "Он действует в [среде] — например, в игре или в комнате.",
                        "После своих действий он получает [награду] — число, которое показывает, насколько хорошо он справился.",
                        "Пробовать новое, чтобы узнать больше, называется [исследованием].",
                        "Выбирать то, что уже работает, называется [использованием]."
                    ],
                    extra: ["меткой"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Три игровых автомата» в уроке 8 и сыграй целую игру. Заполняй таблицу по ходу игры.",
                    table: {
                        head: ["Автомат", "Попытки", "Звёзды", "Звёзды ÷ попытки"],
                        rows: [
                            ["A", "", "", ""],
                            ["B", "", "", ""],
                            ["C", "", "", ""]
                        ]
                    },
                    items: [
                        "Какой автомат оказался лучшим и какая у него была скрытая вероятность? [В каждой игре это разные автоматы, но у лучшего всегда вероятность 75%.]",
                        "Сколько звёзд в среднем дала бы игра только на лучшем автомате? [Около 22,5 (30 × 75%).]",
                        "Совпало ли твоё «звёзды ÷ попытки» со скрытыми вероятностями? Почему не точно? [Примерно; когда попыток мало, многое решает удача.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["Исследование", "Использование"],
                    items: [
                        ["Снова заказать любимую пиццу", 1],
                        ["Сходить в только что открывшееся кафе", 0],
                        ["Слушать плейлист из любимых песен", 1],
                        ["Поехать в школу новой дорогой: вдруг она быстрее", 0],
                        ["Играть уровень, который всегда проходишь", 1],
                        ["Сходить на пробное занятие в новую секцию", 0]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["В обучении с подкреплением агенту каждый раз показывают правильный ход.", false, "Правильных ходов ему никто не показывает: он сам выясняет, какие действия со временем приносят больше награды."],
                        ["Q-значения — это оценки агента: насколько хорошо каждое действие в каждой ситуации.", true, "Сначала это догадки; после каждой попытки агент немного сдвигает их к тому, что получилось на самом деле."],
                        ["Ход, который не приносит награды прямо сейчас, всё равно может быть отличным.", true, "Он может привести к большой награде позже, поэтому агент учится думать наперёд."],
                        ["Агент, который только использует проверенное, всегда находит лучший вариант.", false, "Он может застрять на «достаточно хорошем» и так и не найти лучшего."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["агент", "тот, кто учится: персонаж игры, робот или программа"],
                        ["среда", "мир, в котором действует агент, например игра"],
                        ["награда", "число, которое показывает, насколько хорошо справился агент"],
                        ["глубокое обучение с подкреплением", "нейросеть оценивает, насколько хорош каждый ход"],
                        ["RLHF", "обучение чат-бота с наградой за ответы, которые больше понравились людям"]
                    ]
                },
                {
                    type: "explain",
                    text: "В гонке на лодках агент получал очки за попадание в мишени. Он кружил в лагуне и так и не закончил гонку. Что пошло не так и как это исправить?",
                    answer: "Агент гнался за наградой, которую получал (очки за мишени), а не за тем, чего хотели разработчики (победы в гонке). Это взлом награды. Лучше давать очки за то, что лодка закончила гонку, и за скорость, а не только за мишени.",
                    lines: 5
                }
            ]
        }
    },

    // ----- Lesson 9: How Chatbots Write -----
    9: {
        exit: "q42",
        quiz: ["q40", "q41", "m15"],
        en: {
            objectives: [
                "explain how text becomes tokens, and tokens become numbers;",
                "describe next-token prediction, and how temperature changes the choice of the next word;",
                "explain what attention does, and why a chatbot can sound sure and still be wrong."
            ],
            warmup: "Your phone's keyboard suggests the next word. How do you think it knows what to suggest?",
            warmupNote: "Students may say that it remembers what they type. Lead to the idea of probabilities: the keyboard guesses the likeliest next word. Chatbots do the same, with a much bigger model.",
            reading: "Students look for how “unbelievable” is cut into tokens, what “it” means in the robot sentence, and what the T in GPT stands for.",
            activity: {
                title: "Mini-lab “Temperature dial”",
                steps: [
                    "Students open the mini-lab in lesson 9 and read the start of the sentence and the six possible next words.",
                    "At temperature 1.0 they press “Generate 10” and note which words were picked.",
                    "They turn the dial to 0.2 and to 2.0, write the probabilities into the worksheet's table, and press “Generate 10” each time.",
                    "They open “Show the maths” and follow one row of the table: the score, the score ÷ T, then the probability."
                ]
            },
            extension: "Fast finishers predict, before trying, what the probabilities will look like at temperature 0.5, then check.",
            discussion: [
                "Why does a chatbot sometimes give a different answer to the same question?",
                "Would you want a low or a high temperature for a chatbot that helps with homework? For one that writes song lyrics?",
                "A chatbot picks likely words, not checked facts. What does that mean for how you use it?",
                "Russian often needs more tokens than English for the same text. Why might that matter?"
            ],
            exit: "Explain in your own words what “next-token prediction” means.",
            easier: "Write the robot sentence on the board, and let students draw an arrow from “it” to the word it means, first with “heavy”, then with “clumsy”.",
            harder: "Students work out the softmax by hand for three scores of their own at temperature 1 (with e ≈ 2.718 and a calculator) and check that the probabilities add up to 100%.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "A chatbot first cuts the text into [tokens]: short words, parts of words and punctuation marks.",
                        "In English, 100 tokens are roughly [75] words.",
                        "A whole answer is next-token [prediction], repeated token by token.",
                        "[Attention] lets the model look back at earlier tokens and weigh how much each one matters.",
                        "How much text a model can look back at is called its context [window]."
                    ],
                    extra: ["database"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Temperature dial” in lesson 9. Set the temperature and fill in the table.",
                    table: {
                        head: ["Temperature", "Probability of “park”", "Probability of “moon”"],
                        rows: [
                            ["0.2", "[98.1%]", "[less than 1%]"],
                            ["1.0", "[51.7%]", "[1.4%]"],
                            ["2.0", "[33.6%]", "[5.6%]"]
                        ]
                    },
                    items: [
                        "Why does a high temperature give more variety? [Dividing the scores by a bigger number brings them closer together, so the unlikely words get a bigger chance.]"
                    ]
                },
                {
                    type: "order",
                    items: [
                        "It cuts your message into tokens.",
                        "It turns each token into a number.",
                        "It gives every token in its vocabulary a probability.",
                        "It picks one token and adds it to the text.",
                        "It repeats, token by token, until the answer is done."
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["token", "a piece of text with its own number"],
                        ["next-token prediction", "guessing the next piece of text, again and again"],
                        ["attention", "weighing how much each earlier word matters"],
                        ["transformer", "a kind of model built on attention: the T in GPT"],
                        ["temperature", "a setting that makes the choice of words safer or more surprising"],
                        ["hallucination", "a confident answer that is made up"]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["A chatbot reads whole words the way you do.", false, "It cuts text into tokens, often parts of words, and turns each one into a number."],
                        ["Transformers were introduced in 2017, in a paper called “Attention Is All You Need”.", true, "Researchers at Google wrote it, and most big chatbots of the 2020s are built on this idea."],
                        ["At a low temperature, a chatbot almost always picks the most likely token.", true, "That is safe but a bit dull; a high temperature gives unlikely tokens more chances."],
                        ["If you ask a chatbot for its sources, the sources are always real.", false, "Sometimes the sources are made up too: open them and check."]
                    ]
                },
                {
                    type: "explain",
                    text: "Chatbots are made in two big steps. Name them, and say what the chatbot learns in each one.",
                    answer: "First, pre-training: the model learns to predict the next token from a huge amount of text. Then fine-tuning: it is trained on examples of good answers and with feedback from people, so that it becomes helpful and polite.",
                    lines: 4
                }
            ]
        },
        ru: {
            objectives: [
                "объяснить, как текст превращается в токены, а токены — в числа;",
                "описать предсказание следующего токена и то, как температура меняет выбор слова;",
                "объяснить, что делает механизм внимания и почему чат-бот может звучать уверенно и всё же ошибаться."
            ],
            warmup: "Клавиатура в телефоне подсказывает следующее слово. Как ты думаешь, откуда она знает, что подсказать?",
            warmupNote: "Ученики могут сказать, что клавиатура запоминает их слова. Подвести к идее вероятностей: клавиатура угадывает самое вероятное следующее слово. Чат-боты делают то же самое, только модель у них гораздо больше.",
            reading: "Ученики ищут, как слово «невероятный» режется на токены, что означает «он» во фразе про робота и что значит буква T в GPT.",
            activity: {
                title: "Мини-лаборатория «Регулятор температуры»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 9 и читают начало фразы и шесть возможных следующих слов.",
                    "При температуре 1,0 нажимают «Сгенерировать 10» и записывают, какие слова выпали.",
                    "Ставят регулятор на 0,2 и на 2,0, записывают вероятности в таблицу рабочего листа и каждый раз нажимают «Сгенерировать 10».",
                    "Открывают «Показать математику» и прослеживают одну строку таблицы: оценка, оценка ÷ T, затем вероятность."
                ]
            },
            extension: "Кто закончил раньше, до проверки предсказывает, как будут выглядеть вероятности при температуре 0,5, а потом проверяет.",
            discussion: [
                "Почему чат-бот иногда по-разному отвечает на один и тот же вопрос?",
                "Какая температура нужна чат-боту, который помогает с домашкой, — низкая или высокая? А чат-боту, который пишет тексты песен?",
                "Чат-бот выбирает вероятные слова, а не проверенные факты. Что это значит для того, как им пользоваться?",
                "Для русского текста часто нужно больше токенов, чем для английского того же объёма. Почему это может быть важно?"
            ],
            exit: "Объясни своими словами, что значит «предсказание следующего токена».",
            easier: "Записать на доске фразу из урока: «Робот уронил чемодан, потому что он был тяжёлым» — и предложить нарисовать стрелку от «он» к слову, которое он обозначает: сначала с «тяжёлым», потом с «неуклюжим».",
            harder: "Вручную посчитать softmax для трёх своих оценок при температуре 1 (e ≈ 2,718, с калькулятором) и проверить, что вероятности в сумме дают 100%.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Сначала чат-бот режет текст на [токены]: короткие слова, части слов и знаки препинания.",
                        "В английском 100 токенов — это примерно [75] слов.",
                        "Целый ответ — это [предсказание] следующего токена, повторённое токен за токеном.",
                        "Механизм [внимания] позволяет модели оглядываться на прежние токены и взвешивать, насколько важен каждый.",
                        "Сколько текста модель может охватить, называют её контекстным [окном]."
                    ],
                    extra: ["базой"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Регулятор температуры» в уроке 9. Ставь нужную температуру и заполни таблицу.",
                    table: {
                        head: ["Температура", "Вероятность «парк»", "Вероятность «космос»"],
                        rows: [
                            ["0,2", "[98,1%]", "[меньше 1%]"],
                            ["1,0", "[51,7%]", "[1,4%]"],
                            ["2,0", "[33,6%]", "[5,6%]"]
                        ]
                    },
                    items: [
                        "Почему при высокой температуре слова разнообразнее? [Деление на большее число сближает оценки, и у маловероятных слов становится больше шансов.]"
                    ]
                },
                {
                    type: "order",
                    items: [
                        "Чат-бот режет сообщение на токены.",
                        "Превращает каждый токен в число.",
                        "Даёт каждому токену из словаря вероятность.",
                        "Выбирает один токен и добавляет его к тексту.",
                        "Повторяет это, токен за токеном, пока ответ не готов."
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["токен", "кусочек текста со своим номером"],
                        ["предсказание следующего токена", "угадывать следующий кусочек текста снова и снова"],
                        ["механизм внимания", "взвешивает, насколько важно каждое прежнее слово"],
                        ["трансформер", "модель, построенная на внимании: та самая буква T в GPT"],
                        ["температура", "настройка, от которой выбор слов осторожнее или неожиданнее"],
                        ["галлюцинация", "уверенный ответ, который на самом деле выдуман"]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Чат-бот читает целые слова так же, как ты.", false, "Он режет текст на токены, часто на части слов, и превращает каждый в число."],
                        ["Трансформеры появились в 2017 году, в статье «Attention Is All You Need».", true, "Её написали исследователи Google, и на этой идее построено большинство крупных чат-ботов 2020-х."],
                        ["При низкой температуре чат-бот почти всегда выбирает самый вероятный токен.", true, "Это надёжно, но скучновато; при высокой температуре у маловероятных токенов больше шансов."],
                        ["Если попросить у чат-бота источники, они всегда будут настоящими.", false, "Иногда источники тоже выдуманы: открывай их и проверяй."]
                    ]
                },
                {
                    type: "explain",
                    text: "Чат-ботов делают в два больших шага. Назови их и напиши, чему чат-бот учится на каждом.",
                    answer: "Сначала предобучение: модель учится предсказывать следующий токен на огромном количестве текстов. Потом дообучение: её учат на примерах хороших ответов и по отзывам людей, чтобы она стала полезной и вежливой.",
                    lines: 4
                }
            ]
        }
    },

    // ----- Lesson 10: Creative AI -----
    10: {
        exit: "q47",
        quiz: ["q45", "q48", "m17"],
        en: {
            objectives: [
                "explain that generative AI learns patterns from examples and uses them to make something new;",
                "describe, as an intuition, how a diffusion model turns noise into a picture, step by step;",
                "discuss consent, copyright, labels and deepfakes, and use AI as an honest creative partner."
            ],
            warmup: "Imagine a picture of a cat astronaut, painted in watercolour. Could you tell whether a person or an AI made it? How?",
            warmupNote: "Collect ideas; many old “tells” no longer work. Keep the question open for the discussion about labels and watermarks.",
            reading: "Students look for how a diffusion model makes a picture, what a GAN is, and the story of the Pope's puffer jacket.",
            activity: {
                title: "Mini-lab “From noise to picture”",
                steps: [
                    "Students open the mini-lab in lesson 10 and pick a prompt.",
                    "They press “Remove noise” one step at a time and, after each step, describe what they see.",
                    "They press “New noise”, play all the steps again with the same prompt, and compare the two pictures.",
                    "Pairs read the note under the mini-lab and explain how a real diffusion model is different from this illustration."
                ]
            },
            extension: "Fast finishers write a picture prompt in layers (the subject, a style, the light or mood, the details) and explain what each layer would change.",
            discussion: [
                "Is it fair to train image generators on artists' work without asking them? What would be fairer?",
                "Should every AI-made picture carry a label or a watermark? Who should check?",
                "When you show work that AI helped with, how should you say so?",
                "Why was the picture of the Pope in a puffer jacket a warning, even though it was a joke?"
            ],
            exit: "Write one question you would ask before sharing a surprising picture.",
            easier: "Run the mini-lab on the projector: the class calls out what they see after each step, and you write the words on the board.",
            harder: "Students compare a GAN (the forger and the detective) with a diffusion model (removing noise) in a short paragraph: what each network does, and how it learns.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Generative AI learns the [patterns] of its examples instead of keeping a copy of each one.",
                        "Many of today's image generators are [diffusion] models.",
                        "To make a picture, the model starts from pure random [noise] and removes it step by step.",
                        "Your [prompt] guides every step, so the shapes you asked for appear.",
                        "Some tools add an invisible [watermark] to show that a picture was made by AI."
                    ],
                    extra: ["copies"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “From noise to picture” in lesson 10. Pick a prompt and remove the noise one step at a time.",
                    table: {
                        head: ["Steps done", "Noise left", "What you see"],
                        rows: [
                            ["0", "[100%]", ""],
                            ["3", "[70%]", ""],
                            ["6", "[40%]", ""],
                            ["10", "[0%]", ""]
                        ]
                    },
                    items: [
                        "Press “New noise” and play the steps again with the same prompt. What happens? [You get a different version of the picture: different noise gives a different picture.]",
                        "How is a real diffusion model different from this mini-lab? [A real model never sees the finished picture: at every step it predicts the noise itself, guided by the prompt.]"
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["The same prompt can give different pictures.", true, "Starting from different noise gives a different picture."],
                        ["Every AI tool adds a label or a watermark to its pictures.", false, "Not all of them do, and editing can remove some marks."],
                        ["By 2025, courts in several countries were hearing cases about training AI on artists' work.", true, "The rules are still being worked out."],
                        ["A GAN is the newest kind of image generator.", false, "GANs came first, in 2014; many of today's image generators are diffusion models."]
                    ]
                },
                {
                    type: "sort",
                    groups: ["A creative partner", "Crossing a line"],
                    items: [
                        ["Brainstorming ideas for a poster", 0],
                        ["Making a background for your own game", 0],
                        ["Sharing a fake photo of a classmate as a joke", 1],
                        ["Handing in an AI picture as your own drawing for art class", 1],
                        ["Trying out several styles, then drawing your favourite yourself", 0],
                        ["Selling copies of an artist's style under the artist's name", 1]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["diffusion model", "makes a picture by removing noise step by step"],
                        ["GAN", "two networks compete: a forger and a detective"],
                        ["watermark", "a hidden mark that shows a picture was made by AI"],
                        ["deepfake", "a fake picture, video or voice of a real person"],
                        ["prompt", "the text that tells the model what to make"]
                    ]
                },
                {
                    type: "explain",
                    text: "Explain, step by step, how a diffusion model makes a new picture from a prompt.",
                    answer: "In training, it saw pictures with more and more noise added and learned to guess which part of a noisy picture is noise. To make a picture, it starts from pure random noise and removes a little at each step. The prompt guides every step, so the shapes that appear are the ones you asked for.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "объяснить, что генеративный ИИ выучивает закономерности на примерах и создаёт по ним новое;",
                "на уровне интуиции описать, как диффузионная модель шаг за шагом превращает шум в картинку;",
                "обсудить согласие авторов, авторское право, пометки и дипфейки и честно использовать ИИ как творческого напарника."
            ],
            warmup: "Представь картинку: кот-космонавт, нарисованный акварелью. Можно ли понять, кто её сделал — человек или ИИ? Как?",
            warmupNote: "Собрать идеи: многие старые «признаки» уже не работают. Оставить вопрос открытым для обсуждения пометок и водяных знаков.",
            reading: "Ученики ищут, как диффузионная модель создаёт картинку, что такое GAN и историю про Папу Римского в пуховике.",
            activity: {
                title: "Мини-лаборатория «Из шума — в картинку»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 10 и выбирают запрос.",
                    "Нажимают «Убрать шум» по одному шагу и после каждого шага описывают, что видят.",
                    "Нажимают «Новый шум», снова проходят все шаги с тем же запросом и сравнивают две картинки.",
                    "Пары читают пояснение под мини-лабораторией и объясняют, чем настоящая диффузионная модель отличается от этой иллюстрации."
                ]
            },
            extension: "Кто закончил раньше, пишет запрос для картинки слоями (предмет, стиль, свет или настроение, детали) и объясняет, что меняет каждый слой.",
            discussion: [
                "Честно ли обучать генераторы картинок на работах художников, не спросив их? Как было бы честнее?",
                "Нужна ли каждой картинке от ИИ пометка или водяной знак? Кто должен это проверять?",
                "Если в работе помогал ИИ, как об этом сказать?",
                "Почему картинка с Папой Римским в пуховике стала предупреждением, хотя это была шутка?"
            ],
            exit: "Напиши один вопрос, который стоит задать себе, прежде чем делиться удивительной картинкой.",
            easier: "Показать мини-лабораторию на проекторе: после каждого шага класс называет, что видит, а слова записываются на доске.",
            harder: "Сравнить в коротком тексте GAN (фальшивомонетчик и детектив) и диффузионную модель (очистка от шума): что делает каждая сеть и как она учится.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Генеративный ИИ выучивает [закономерности] своих примеров, а не хранит копию каждого.",
                        "Многие современные генераторы картинок — это [диффузионные] модели.",
                        "Чтобы создать картинку, модель начинает с чистого случайного [шума] и убирает его шаг за шагом.",
                        "Твой [запрос] направляет каждый шаг, поэтому появляются именно те формы, о которых ты просишь.",
                        "Некоторые сервисы добавляют невидимый [водяной] знак, чтобы было понятно, что картинку создал ИИ."
                    ],
                    extra: ["копии"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Из шума — в картинку» в уроке 10. Выбери запрос и убирай шум по одному шагу.",
                    table: {
                        head: ["Пройдено шагов", "Осталось шума", "Что видно"],
                        rows: [
                            ["0", "[100%]", ""],
                            ["3", "[70%]", ""],
                            ["6", "[40%]", ""],
                            ["10", "[0%]", ""]
                        ]
                    },
                    items: [
                        "Нажми «Новый шум» и снова пройди шаги с тем же запросом. Что получится? [Другой вариант картинки: другой шум даёт другую картинку.]",
                        "Чем настоящая диффузионная модель отличается от этой мини-лаборатории? [Настоящая модель не видит готовой картинки: на каждом шаге она сама предсказывает шум, ориентируясь на запрос.]"
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["По одному и тому же запросу могут получиться разные картинки.", true, "Если начать с другого шума, получится другая картинка."],
                        ["Каждый ИИ-сервис добавляет к своим картинкам пометку или водяной знак.", false, "Так делают не все, а при редактировании некоторые метки можно удалить."],
                        ["К 2025 году суды в нескольких странах рассматривали дела об обучении ИИ на работах художников.", true, "Правила всё ещё складываются."],
                        ["GAN — самый новый вид генераторов картинок.", false, "GAN появились раньше, в 2014 году; многие современные генераторы — диффузионные модели."]
                    ]
                },
                {
                    type: "sort",
                    groups: ["Творческий напарник", "Так нельзя"],
                    items: [
                        ["Придумать идеи для плаката", 0],
                        ["Сделать фон для своей игры", 0],
                        ["Выложить ради шутки поддельное фото одноклассника", 1],
                        ["Сдать на ИЗО картинку от ИИ как свой рисунок", 1],
                        ["Попробовать несколько стилей, а потом нарисовать понравившийся своими руками", 0],
                        ["Продавать подделки в стиле художника под его именем", 1]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["диффузионная модель", "создаёт картинку, убирая шум шаг за шагом"],
                        ["GAN", "соревнуются две сети: фальшивомонетчик и детектив"],
                        ["водяной знак", "скрытая метка, которая показывает, что картинку создал ИИ"],
                        ["дипфейк", "поддельное фото, видео или голос реального человека"],
                        ["запрос (промпт)", "текст, который говорит модели, что создать"]
                    ]
                },
                {
                    type: "explain",
                    text: "Объясни по шагам, как диффузионная модель создаёт новую картинку по запросу.",
                    answer: "Во время обучения она видела картинки, к которым добавляли всё больше шума, и училась угадывать, какая часть зашумлённой картинки — шум. Чтобы создать картинку, она начинает с чистого случайного шума и на каждом шаге убирает его понемногу. Запрос направляет каждый шаг, поэтому появляются именно те формы, о которых просили.",
                    lines: 5
                }
            ]
        }
    },

    // ----- Lesson 11: Can You Trust AI? -----
    11: {
        exit: "q50",
        quiz: ["q51", "q52", "q53"],
        en: {
            objectives: [
                "name three ways AI goes wrong: bias, hallucination and overconfidence;",
                "explain why one accuracy number is not enough, and how testing by group and red teaming help;",
                "protect their own data, and describe how laws such as the EU AI Act sort AI uses by risk."
            ],
            warmup: "A face-unlock system is right 95% of the time. Would you trust it? What else would you want to know?",
            warmupNote: "Most students will say yes. Leave the question open: the exit ticket asks it again at the end.",
            reading: "Students look for the three ways AI goes wrong, what the Gender Shades study found, and what “social scoring” is.",
            activity: {
                title: "Mini-lab “Fair or not?”",
                steps: [
                    "Students open the mini-lab in lesson 11: four short cases.",
                    "In pairs, they discuss each case and agree on an answer before they click.",
                    "In the face-unlock case, they split the results by skin tone and compare the numbers.",
                    "For each case, they write on the worksheet what would help."
                ]
            },
            extension: "Fast finishers invent a fifth case from school life (for example, an AI that marks homework), and write what could go wrong and how to test it.",
            discussion: [
                "Who should decide whether an AI is fair enough to use: the company, the government or the people it affects?",
                "Why is it dangerous to punish a student because an AI detector said their essay was written by AI?",
                "What would you never type into a chatbot? Has this lesson changed your answer?",
                "The EU AI Act bans “social scoring”. Why do you think lawmakers banned it?"
            ],
            exit: "Give one way to test an AI fairly, other than looking at one accuracy number.",
            easier: "Work through the first case together on the projector, then let pairs do the other three.",
            harder: "Students design a fair test for an AI that understands spoken commands: which groups of speakers they would include, which unusual situations they would try, and which results they would report.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "A model trained on past decisions can learn their unfairness: this is called [bias].",
                        "When an AI says it is 99% sure and is still wrong, it is [overconfident].",
                        "Good testers split the results by [group], such as age, skin tone or accent.",
                        "When people try on purpose to make an AI fail, it is called [red] teaming.",
                        "Making AI do what people really intend is called [alignment]."
                    ],
                    extra: ["speed"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Fair or not?” in lesson 11. For each case, write the letter of the right answer and one thing that would help.",
                    table: {
                        head: ["Case", "Right answer", "What would help"],
                        rows: [
                            ["A loan app", "[B]", "[Check the decisions for each group, take out stand-ins like the postcode, and let people ask a human to look again.]"],
                            ["A job filter", "[A]", "[Compare the marks for women and men, fix the training data, and let people make the final choice.]"],
                            ["A face-unlock test", "[C]", "[Test with many different people, report the results for each group, and close the gaps before the launch.]"],
                            ["An essay checker", "[C]", "[Never punish anyone on a detector's word alone: talk with the student, and look at their drafts and notes.]"]
                        ]
                    },
                    items: [
                        "In the face-unlock test, how often was it right for people with lighter skin, and for people with darker skin? [98% and 68%]"
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["hallucination", "a made-up fact, quote or source"],
                        ["bias", "unfairness learned from past data"],
                        ["red teaming", "trying on purpose to make an AI fail"],
                        ["social scoring", "scoring people for how they behave and treating them worse for it: banned in the EU"],
                        ["overconfidence", "sounding very sure while being wrong"]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["In the 2018 Gender Shades study, some systems were wrong up to about 35% of the time for darker-skinned women.", true, "For lighter-skinned men they were wrong less than 1% of the time. After the study, the companies improved their systems."],
                        ["The EU AI Act bans every use of AI in schools.", false, "It sorts uses by risk: AI that marks exams is “high-risk” and must meet strict requirements; only a few uses, such as social scoring, are banned."],
                        ["Under the AI Act, people must be told when they are talking to an AI system.", true, "The Act also says that deepfakes must be labelled as made or changed by AI."],
                        ["If an app lets you switch off training on your chats, doing so helps protect your privacy.", true, "The lesson suggests it, along with deleting old chats and checking which apps can use your location, microphone and contacts."]
                    ]
                },
                {
                    type: "sort",
                    groups: ["Almost no extra rules", "High-risk: strict rules"],
                    items: [
                        ["A spam filter", 0],
                        ["AI that sorts job applications", 1],
                        ["A video game", 0],
                        ["AI that marks exams", 1],
                        ["AI that decides who gets a loan", 1],
                        ["A photo app that blurs the background", 0]
                    ]
                },
                {
                    type: "explain",
                    text: "Your friend wants a chatbot's help with a private problem. What advice from the lesson would you give?",
                    answer: "Don't type anything you wouldn't tell a stranger: no passwords, address, phone number, private photos or secrets, yours or a friend's. Change the names and details first. If the app allows it, switch off training on your chats, and delete old chats.",
                    lines: 4
                }
            ]
        },
        ru: {
            objectives: [
                "назвать три вида ошибок ИИ: предвзятость, галлюцинации и излишнюю уверенность;",
                "объяснить, почему одного числа точности мало и как помогают проверка по группам и ред-тиминг;",
                "защищать свои данные и описать, как законы вроде Закона ЕС об ИИ делят применения ИИ по уровню риска."
            ],
            warmup: "Разблокировка по лицу права в 95% случаев. Можно ли ей доверять? Что ещё хотелось бы узнать?",
            warmupNote: "Большинство ответит «да». Оставить вопрос открытым: билет на выход в конце урока задаёт его снова.",
            reading: "Ученики ищут три вида ошибок ИИ, что обнаружило исследование Gender Shades и что такое «социальный рейтинг».",
            activity: {
                title: "Мини-лаборатория «Честно или нет?»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 11: четыре коротких случая.",
                    "В парах обсуждают каждый случай и договариваются об ответе до нажатия.",
                    "В случае с разблокировкой по лицу разделяют результаты по цвету кожи и сравнивают числа.",
                    "Для каждого случая записывают в рабочий лист, что помогло бы."
                ]
            },
            extension: "Кто закончил раньше, придумывает пятый случай из школьной жизни (например, ИИ, который проверяет домашние задания) и пишет, что может пойти не так и как это проверить.",
            discussion: [
                "Кто должен решать, достаточно ли ИИ справедлив, чтобы им пользоваться: компания, государство или люди, которых это касается?",
                "Почему опасно наказывать ученика из-за того, что ИИ-детектор назвал его сочинение написанным ИИ?",
                "Чего никогда не стоит писать чат-боту? Поменялся ли твой ответ после этого урока?",
                "Закон ЕС об ИИ запрещает «социальный рейтинг». Как ты думаешь, почему?"
            ],
            exit: "Назови один способ честно проверить ИИ — кроме одного числа точности.",
            easier: "Разобрать первый случай вместе на проекторе, а остальные три дать парам.",
            harder: "Придумать честную проверку для ИИ, который понимает голосовые команды: каких говорящих включить в проверку, какие необычные ситуации попробовать и какие результаты сообщить.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Модель, обученная на прошлых решениях, может перенять их несправедливость: это называется [предвзятостью].",
                        "Когда ИИ уверен на 99% и всё равно ошибается, он [излишне] уверен.",
                        "Хорошие проверяющие разбивают результаты по [группам]: по возрасту, цвету кожи, акценту.",
                        "Когда люди нарочно пытаются заставить ИИ ошибиться, это называют [ред-тимингом].",
                        "Добиться, чтобы ИИ делал то, чего люди действительно хотят, — задача [согласования] ИИ с целями людей."
                    ],
                    extra: ["скоростью"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Честно или нет?» в уроке 11. Для каждого случая запиши букву правильного ответа и что помогло бы.",
                    table: {
                        head: ["Случай", "Правильный ответ", "Что помогло бы"],
                        rows: [
                            ["Кредит через приложение", "[B]", "[Проверить решения для каждой группы, убрать «заменители» вроде индекса, дать людям попросить, чтобы решение пересмотрел человек.]"],
                            ["Отбор резюме", "[A]", "[Сравнить оценки для женщин и мужчин, исправить обучающие данные, оставить окончательное решение за людьми.]"],
                            ["Проверка разблокировки по лицу", "[C]", "[Проверять на снимках самых разных людей, сообщать результат для каждой группы и устранить разрыв до выпуска.]"],
                            ["Проверка сочинений", "[C]", "[Никогда не наказывать только по слову детектора: поговорить с учеником, посмотреть его черновики и заметки.]"]
                        ]
                    },
                    items: [
                        "Как часто проверка разблокировки по лицу была права для людей со светлой кожей и для людей с тёмной кожей? [98% и 68%]"
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["предвзятость", "несправедливость, выученная на прошлых данных"],
                        ["галлюцинация", "выдуманный факт, цитата или источник"],
                        ["излишняя уверенность", "звучать очень уверенно и при этом ошибаться"],
                        ["социальный рейтинг", "оценивать поведение людей и ухудшать к ним отношение за это; в ЕС запрещено"],
                        ["ред-тиминг", "нарочно пытаться заставить ИИ ошибиться"]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["В исследовании Gender Shades 2018 года некоторые системы ошибались с темнокожими женщинами примерно в 35% случаев.", true, "Со светлокожими мужчинами они ошибались меньше чем в 1% случаев. После исследования компании улучшили свои системы."],
                        ["Закон ЕС об ИИ запрещает любое использование ИИ в школах.", false, "Он делит применения по уровню риска: ИИ, который проверяет экзамены, относится к «высокому риску» и должен соответствовать строгим требованиям; запрещены лишь немногие применения, например социальный рейтинг."],
                        ["По Закону ЕС об ИИ людям должны сообщать, что они говорят с системой ИИ.", true, "А дипфейки по этому закону нужно помечать как созданные или изменённые ИИ."],
                        ["Если приложение позволяет отключить обучение на твоих чатах, это помогает защитить приватность.", true, "Урок советует это, а ещё удалять старые чаты и проверять, каким приложениям доступны геолокация, микрофон и контакты."]
                    ]
                },
                {
                    type: "sort",
                    groups: ["Почти без особых правил", "Высокий риск: строгие правила"],
                    items: [
                        ["Спам-фильтр", 0],
                        ["ИИ, который сортирует резюме соискателей", 1],
                        ["Видеоигра", 0],
                        ["ИИ, который проверяет экзамены", 1],
                        ["ИИ, который решает, кому дать кредит", 1],
                        ["Фотоприложение, которое размывает фон", 0]
                    ]
                },
                {
                    type: "explain",
                    text: "Друг хочет попросить у чат-бота помощи с личной проблемой. Что из урока стоит ему посоветовать?",
                    answer: "Не писать ничего, чего не стоит рассказывать незнакомцу: никаких паролей, адреса, телефона, личных фото и секретов — своих и чужих. Сначала поменять имена и подробности. Если приложение позволяет, отключить обучение на своих чатах и удалять старые чаты.",
                    lines: 4
                }
            ]
        }
    },

    // ----- Lesson 12: Your AI Toolkit -----
    12: {
        exit: "q56",
        quiz: ["q54", "q55", "q57"],
        en: {
            objectives: [
                "write a good prompt with a role, context, a clear task, an example and a format;",
                "check an AI answer: open the sources, compare with trusted ones, and notice when it sounds too sure;",
                "use AI as a tutor, not a ghostwriter, and explain why doing the thinking yourself matters."
            ],
            warmup: "What could AI help you with in your homework, and what should it never do for you?",
            warmupNote: "Collect both lists on the board. Keep them: they are the start of your class rules at the end of the lesson.",
            reading: "Students look for the five ingredients of a good prompt, three warning signs in an answer, and the difference between a tutor and a ghostwriter.",
            activity: {
                title: "Mini-lab “Prompt makeover”",
                steps: [
                    "Students open the mini-lab in lesson 12: a vague prompt, “Tell me about volcanoes.”",
                    "They add the ingredients one at a time and, after each one, note what changed in the answer and on the quality meter.",
                    "They take the ingredients out one at a time to find which one changes the answer most.",
                    "Pairs write a five-ingredient prompt of their own for a topic from another subject."
                ]
            },
            extension: "Fast finishers turn a ghostwriter prompt (“Write my essay about volcanoes”) into a tutor prompt that asks for hints and feedback instead.",
            discussion: [
                "Asking a chatbot “Are you sure?” isn't a real check. Why not?",
                "Where is the line between getting help and cheating? Does it depend on the task?",
                "Why does working things out yourself, even with mistakes, help you remember?",
                "Which human skills will matter most in a future with AI? Why?"
            ],
            exit: "Write a tutor prompt for something you are stuck on in another subject.",
            easier: "Give the five ingredients as sentence starters: “You are…”, “I am… and I need it for…”, “Explain…”, “For example…”, “Answer as…”.",
            harder: "Give students a printed chatbot answer that you prepared, with a few claims in it. They check it against two trusted sources and mark every claim as confirmed, wrong or not found.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "A good prompt can have a [role], context, a clear task, an example and a format.",
                        "For anything that matters, ask for sources, then [open] them and check.",
                        "A good habit: find important facts in at least [two] trusted places.",
                        "Use AI as a [tutor], not a ghostwriter.",
                        "Be extra careful when an answer sounds very [sure] but gives no evidence."
                    ],
                    extra: ["copy"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Prompt makeover” in lesson 12. Add the ingredients one at a time and fill in the table.",
                    table: {
                        head: ["Ingredients added", "Prompt quality"],
                        rows: [
                            ["0 (the vague prompt)", "[Vague]"],
                            ["1", "[A start]"],
                            ["2", "[Getting clearer]"],
                            ["3", "[Good]"],
                            ["4", "[Very good]"],
                            ["5", "[Excellent]"]
                        ]
                    },
                    items: [
                        "The meter only counts ingredients. Does a simple question always need all five? [No: a simple question can stay simple. Add the ingredients that help.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["Tutor", "Ghostwriter"],
                    items: [
                        ["“Give me a hint for the next step, then check my answer.”", 0],
                        ["“Write my history essay for tomorrow.”", 1],
                        ["“Quiz me on these words before my test.”", 0],
                        ["“Solve all my maths homework and show only the answers.”", 1],
                        ["“Here is my draft: what could I explain more clearly?”", 0],
                        ["“Rewrite this article so that nobody notices it's copied.”", 1]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["role", "“You are a friendly geography tutor.”"],
                        ["context", "“I'm 14 and I have a test next week.”"],
                        ["clear task", "“Explain why some volcanoes explode.”"],
                        ["example", "“Like this: an earthquake is like a ruler you bend until it snaps.”"],
                        ["format", "“Answer as a short list of bullet points.”"]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["If a chatbot gives a source, the source must be real.", false, "Chatbots can invent sources that look real: open them and check."],
                        ["Asking “Are you sure?” is a reliable way to check a chatbot's answer.", false, "It may repeat its mistake, or swap a right answer for a wrong one. Check with a source instead."],
                        ["In 2024, the Nobel Prize in Physics went to John Hopfield and Geoffrey Hinton.", true, "Their discoveries laid the foundations of machine learning with neural networks."],
                        ["Every school has the same rules about using AI.", false, "Every school sets its own rules: ask your teacher what is allowed, and say when AI helped you."]
                    ]
                },
                {
                    type: "explain",
                    text: "Why does doing the thinking yourself matter, even when AI could give you the answer? Give two reasons.",
                    answer: "Working things out yourself, even with mistakes along the way, helps you remember better than reading a ready-made answer, and you learn the skill, not just one answer. Also, handing in AI's work as your own is against the rules at many schools.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "составлять хороший промпт с ролью, контекстом, чёткой задачей, примером и форматом;",
                "проверять ответ ИИ: открывать источники, сравнивать с надёжными и замечать, когда ответ звучит слишком уверенно;",
                "пользоваться ИИ как репетитором, а не гострайтером, и объяснять, почему важно думать самостоятельно."
            ],
            warmup: "С чем ИИ мог бы помочь тебе в домашних заданиях, а чего он никогда не должен делать за тебя?",
            warmupNote: "Записать оба списка на доске и сохранить: в конце урока из них получатся правила класса.",
            reading: "Ученики ищут пять составляющих хорошего промпта, три тревожных признака в ответе и разницу между репетитором и гострайтером.",
            activity: {
                title: "Мини-лаборатория «Преображение промпта»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 12: расплывчатый промпт «Расскажи о вулканах».",
                    "Добавляют составляющие по одной и после каждой отмечают, что изменилось в ответе и на шкале качества.",
                    "Убирают составляющие по одной, чтобы найти ту, что меняет ответ сильнее всего.",
                    "Пары пишут свой промпт из пяти составляющих на тему из другого предмета."
                ]
            },
            extension: "Кто закончил раньше, превращает промпт-«гострайтер» («Напиши за меня сочинение о вулканах») в промпт-«репетитор», который просит подсказки и отзыв.",
            discussion: [
                "Спросить чат-бота «Ты уверен?» — это не настоящая проверка. Почему?",
                "Где граница между помощью и списыванием? Зависит ли она от задания?",
                "Почему то, до чего доходишь сам, даже с ошибками, лучше запоминается?",
                "Какие человеческие навыки будут важнее всего в будущем с ИИ? Почему?"
            ],
            exit: "Напиши промпт-«репетитор» для трудного задания по другому предмету.",
            easier: "Дать пять составляющих как начала фраз: «Ты — …», «Мне … лет, это нужно для …», «Объясни …», «Например: …», «Ответь в виде …».",
            harder: "Дать распечатанный ответ чат-бота с несколькими утверждениями (подготовленный заранее). Ученики сверяют его с двумя надёжными источниками и помечают каждое утверждение: подтвердилось, неверно или не нашлось.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "В хорошем промпте может быть [роль], контекст, чёткая задача, пример и формат.",
                        "Для всего важного проси источники, а потом [открывай] их и проверяй.",
                        "Полезная привычка: находить важные факты как минимум в [двух] надёжных местах.",
                        "Пользуйся ИИ как [репетитором], а не гострайтером.",
                        "Особая осторожность нужна, когда ответ звучит очень [уверенно], но доказательств нет."
                    ],
                    extra: ["копией"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Преображение промпта» в уроке 12. Добавляй составляющие по одной и заполни таблицу.",
                    table: {
                        head: ["Добавлено составляющих", "Качество промпта"],
                        rows: [
                            ["0 (расплывчатый промпт)", "[Расплывчато]"],
                            ["1", "[Начало есть]"],
                            ["2", "[Уже яснее]"],
                            ["3", "[Хорошо]"],
                            ["4", "[Очень хорошо]"],
                            ["5", "[Отлично]"]
                        ]
                    },
                    items: [
                        "Шкала просто считает составляющие. Всегда ли простому вопросу нужны все пять? [Нет: простой вопрос может оставаться простым. Добавляй то, что помогает.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["Репетитор", "Гострайтер"],
                    items: [
                        ["«Дай подсказку к следующему шагу, а потом проверь мой ответ»", 0],
                        ["«Напиши за меня сочинение по истории на завтра»", 1],
                        ["«Погоняй меня по этим словам перед контрольной»", 0],
                        ["«Реши всю домашку по математике и покажи только ответы»", 1],
                        ["«Вот мой черновик: что можно объяснить понятнее?»", 0],
                        ["«Перепиши эту статью, чтобы никто не заметил, что она списана»", 1]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["роль", "«Ты — дружелюбный репетитор по географии»"],
                        ["пример", "«Как здесь: землетрясение — как линейка, которую гнут, пока она не сломается»"],
                        ["формат", "«Ответь коротким списком»"],
                        ["контекст", "«Мне 14, и на следующей неделе у меня контрольная»"],
                        ["чёткая задача", "«Объясни, почему одни вулканы взрываются»"]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Если чат-бот назвал источник, этот источник точно существует.", false, "Чат-боты могут выдумывать источники, которые выглядят настоящими: открывай и проверяй."],
                        ["Спросить «Ты уверен?» — надёжный способ проверить ответ чат-бота.", false, "Он может повторить ошибку или заменить верный ответ неверным. Проверяй по источнику."],
                        ["В 2024 году Нобелевскую премию по физике получили Джон Хопфилд и Джеффри Хинтон.", true, "Их открытия заложили основы машинного обучения с помощью нейросетей."],
                        ["Во всех школах одинаковые правила использования ИИ.", false, "Каждая школа устанавливает свои правила: спроси учителя, что можно, и говори, когда тебе помогал ИИ."]
                    ]
                },
                {
                    type: "explain",
                    text: "Почему важно думать самостоятельно, даже когда ИИ мог бы дать готовый ответ? Приведи две причины.",
                    answer: "То, до чего доходишь сам, даже с ошибками по пути, запоминается лучше, чем прочитанный готовый ответ, — и ты учишься навыку, а не одному ответу. Кроме того, во многих школах сдавать работу ИИ как свою — против правил.",
                    lines: 5
                }
            ]
        }
    }
});
