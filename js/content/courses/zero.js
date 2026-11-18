/* =========================================================
   AI COMPASS — GUIDED COURSE: START FROM ZERO
   Stage 0 of "My path": five guided steps for someone who has never
   learned how computers or AI work. Nothing is assumed.
     z1  What is a program?
     z2  Everything is numbers
     z3  Rules or examples?
     z4  How learning works: you and the machine
     z5  Train your first model
   Each step is a list of small screens, shown one by one by
   js/learn-play.js: a short idea ("info"), then a task right away
   ("choice", "number", "order", "sort", "match"), a question to think
   about ("reveal"), and at the end what to remember ("recap").
   Every screen has its texts in English ("en") and Russian ("ru").
   - In a "choice", the FIRST option is the right one (the window mixes them).
   - In an "order", the items are written in the right order.
   - In a "sort", every item is [text, the number of its group (from 0)].
   - "card": the task also becomes a card of the memory check. Its name is the
     step's name plus a letter (z1a, z1b...); a card must make sense alone.
     How many cards a step has is written in js/content/learn.js ("cards").
   - **two stars** make bold, `backticks` make code.
   The names of the steps are in js/content/learn.js ("learn.unit.z1"...).
   ========================================================= */

window.AICompass.content.set("course.zero", {
    units: {
        /* ----- z1. What is a program? ----- */
        z1: {
            steps: [
                {
                    type: "info", icon: "🍳",
                    en: {
                        title: "A computer follows instructions",
                        text: [
                            "A computer is very fast, but it has no ideas of its own. It does exactly what its instructions say, one step after another.",
                            "A list of instructions for a computer is called a **program**."
                        ],
                        example: ["A recipe is a program for a cook:", "1. Boil the water.", "2. Put in the pasta.", "3. Wait 10 minutes."]
                    },
                    ru: {
                        title: "Компьютер выполняет инструкции",
                        text: [
                            "Компьютер очень быстрый, но своих идей у него нет. Он делает ровно то, что написано в инструкциях, шаг за шагом.",
                            "Список инструкций для компьютера называется **программой**."
                        ],
                        example: ["Рецепт — это программа для повара:", "1. Вскипяти воду.", "2. Положи макароны.", "3. Подожди 10 минут."]
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Write a program for making tea: put the steps in the right order.",
                        items: ["Fill the kettle with water", "Switch the kettle on", "Wait until the water boils", "Pour the water into the cup"],
                        hint: "What has to be true before you can switch the kettle on?",
                        why: "The order matters. A computer never swaps steps and never skips one: change the order and you get a different result."
                    },
                    ru: {
                        q: "Напиши программу «как заварить чай»: расставь шаги по порядку.",
                        items: ["Налей воду в чайник", "Включи чайник", "Подожди, пока вода закипит", "Налей воду в чашку"],
                        hint: "Что должно быть сделано до того, как включать чайник?",
                        why: "Порядок важен. Компьютер никогда не меняет шаги местами и ни одного не пропускает: изменишь порядок — получишь другой результат."
                    }
                },
                {
                    type: "info", icon: "🧦",
                    en: {
                        title: "Computers take everything literally",
                        text: [
                            "A person understands what you mean. A computer does only what you say.",
                            "A mistake in a program is called a **bug**. The computer did not “go wrong”: it followed wrong instructions."
                        ]
                    },
                    ru: {
                        title: "Компьютер понимает всё буквально",
                        text: [
                            "Человек догадается, что ты имеешь в виду. Компьютер делает только то, что сказано.",
                            "Ошибка в программе называется **багом**. Компьютер не «ошибся»: он выполнил неправильные инструкции."
                        ]
                    }
                },
                {
                    type: "choice", card: "z1a",
                    en: {
                        q: "A robot gets this program: “1. Put on your shoes. 2. Put on your socks.” What will it do?",
                        options: ["Put the socks on over the shoes", "Swap the steps, because that makes more sense", "Stop and ask what you meant"],
                        hint: "Does a computer think about what makes sense?",
                        why: "A computer follows its instructions exactly as written, even when they are silly. Putting the steps in the right order is the programmer's job."
                    },
                    ru: {
                        q: "Робот получил программу: «1. Надень ботинки. 2. Надень носки». Что он сделает?",
                        options: ["Наденет носки поверх ботинок", "Поменяет шаги местами, потому что так разумнее", "Остановится и спросит, что имелось в виду"],
                        hint: "Думает ли компьютер о том, что разумно?",
                        why: "Компьютер выполняет инструкции точно так, как они написаны, даже если они глупые. Расставить шаги правильно — работа программиста."
                    }
                },
                {
                    type: "info", icon: "🔀",
                    en: {
                        title: "Programs can choose: IF … THEN",
                        text: ["A program can check something and then decide what to do. This is written as a **rule**: IF something is true, THEN do this."],
                        example: ["IF it is raining, THEN take an umbrella.", "IF the password is right, THEN open the door."]
                    },
                    ru: {
                        title: "Программа умеет выбирать: ЕСЛИ … ТО",
                        text: ["Программа может что-то проверить и решить, что делать дальше. Это записывают как **правило**: ЕСЛИ что-то верно, ТО сделай вот это."],
                        example: ["ЕСЛИ идёт дождь, ТО возьми зонт.", "ЕСЛИ пароль верный, ТО открой дверь."]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A game has the rule: “IF the player has 100 points or more, THEN show ‘You win!’”. The player has 80 points. What happens?",
                        options: ["Nothing is shown yet", "“You win!” is shown", "The game adds the missing 20 points"],
                        hint: "Is 80 “100 or more”?",
                        why: "80 is less than 100, so the IF part is not true, and the THEN part does not run."
                    },
                    ru: {
                        q: "В игре есть правило: «ЕСЛИ у игрока 100 очков или больше, ТО покажи „Победа!“». У игрока 80 очков. Что произойдёт?",
                        options: ["Пока ничего не покажется", "Покажется «Победа!»", "Игра добавит недостающие 20 очков"],
                        hint: "80 — это «100 или больше»?",
                        why: "80 меньше 100, значит, условие ЕСЛИ не выполнено, и часть ТО не срабатывает."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Can a computer follow it exactly, or is it too vague?",
                        groups: ["A clear rule", "Too vague"],
                        items: [
                            ["IF the light is red, THEN stop", 0],
                            ["Add 2 to the number", 0],
                            ["Make the picture nicer", 1],
                            ["IF the box is empty, THEN show 0", 0],
                            ["Pick the good photos", 1],
                            ["Be careful on the road", 1]
                        ],
                        why: "A computer needs steps it can check exactly. “Nicer”, “good” and “careful” mean something to you, but nobody has told the computer what they mean."
                    },
                    ru: {
                        q: "Компьютер сможет выполнить это точно или это слишком расплывчато?",
                        groups: ["Чёткое правило", "Слишком расплывчато"],
                        items: [
                            ["ЕСЛИ свет красный, ТО остановись", 0],
                            ["Прибавь к числу 2", 0],
                            ["Сделай картинку красивее", 1],
                            ["ЕСЛИ коробка пустая, ТО покажи 0", 0],
                            ["Выбери хорошие фотографии", 1],
                            ["Будь осторожен на дороге", 1]
                        ],
                        why: "Компьютеру нужны шаги, которые можно проверить точно. «Красивее», «хорошие» и «осторожен» понятны тебе, но компьютеру никто не объяснил, что это значит."
                    }
                },
                {
                    type: "reveal", icon: "🐱",
                    en: {
                        q: "Try to think of rules that would recognise a cat in any photo. What would they be?",
                        answer: [
                            "“IF it has pointed ears and whiskers, THEN it is a cat”? A fox has those too. And a cat can be seen from behind, in the dark, or half hidden under a blanket.",
                            "People tried to write such rules for many years, and it did not work: there are too many cases. This is exactly the kind of task that **AI** solves in a different way: it learns from examples. Step 3 of this stage shows how."
                        ]
                    },
                    ru: {
                        q: "Попробуй придумать правила, по которым можно узнать кошку на любой фотографии. Какими они были бы?",
                        answer: [
                            "«ЕСЛИ есть острые уши и усы, ТО это кошка»? У лисы они тоже есть. А ещё кошка может сидеть спиной, в темноте или наполовину под одеялом.",
                            "Такие правила пытались написать много лет, и ничего не вышло: случаев слишком много. Именно такие задачи **ИИ** решает по-другому: он учится на примерах. Как именно — в шаге 3 этого этапа."
                        ]
                    }
                },
                {
                    type: "choice", card: "z1b",
                    en: {
                        q: "What is a program?",
                        options: ["A list of exact instructions that a computer follows step by step", "A computer that can think for itself", "A very fast calculator hidden behind the screen"],
                        why: "A program is instructions, written by people. The computer only carries them out, one after another."
                    },
                    ru: {
                        q: "Что такое программа?",
                        options: ["Список точных инструкций, которые компьютер выполняет шаг за шагом", "Компьютер, который умеет думать сам", "Очень быстрый калькулятор, спрятанный за экраном"],
                        why: "Программа — это инструкции, которые написали люди. Компьютер только выполняет их, одну за другой."
                    }
                },
                {
                    type: "choice", card: "z1c",
                    en: {
                        q: "Which of these can a computer follow exactly?",
                        options: ["IF the number is bigger than 10, THEN show “big”", "Show “big” when the number feels big", "Decide which numbers are nice"],
                        why: "“Bigger than 10” can be checked exactly. “Feels big” and “nice” cannot: a computer needs a precise rule."
                    },
                    ru: {
                        q: "Что из этого компьютер сможет выполнить точно?",
                        options: ["ЕСЛИ число больше 10, ТО покажи «большое»", "Покажи «большое», когда число кажется большим", "Реши, какие числа симпатичные"],
                        why: "«Больше 10» можно проверить точно. «Кажется большим» и «симпатичные» — нельзя: компьютеру нужно точное правило."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A **program** is a list of exact instructions. The computer follows them step by step, in order.",
                            "A computer takes everything literally. A mistake in the instructions is called a **bug**.",
                            "Programs choose with rules: **IF** something is true, **THEN** do this.",
                            "Some tasks are too hard to write rules for, like recognising a cat. That is where AI comes in."
                        ]
                    },
                    ru: {
                        points: [
                            "**Программа** — это список точных инструкций. Компьютер выполняет их шаг за шагом, по порядку.",
                            "Компьютер понимает всё буквально. Ошибка в инструкциях называется **багом**.",
                            "Программа выбирает с помощью правил: **ЕСЛИ** что-то верно, **ТО** сделай вот это.",
                            "Для некоторых задач правила написать слишком трудно, например чтобы узнать кошку. Тут и нужен ИИ."
                        ]
                    }
                }
            ]
        },

        /* ----- z2. Everything is numbers ----- */
        z2: {
            steps: [
                {
                    type: "info", icon: "🔢",
                    en: {
                        title: "Inside a computer there are only numbers",
                        text: [
                            "A computer cannot see, hear or read. Inside, it works only with numbers.",
                            "So everything it works with has to become numbers first: letters, pictures, sounds, videos."
                        ]
                    },
                    ru: {
                        title: "Внутри компьютера — только числа",
                        text: [
                            "Компьютер не умеет видеть, слышать или читать. Внутри он работает только с числами.",
                            "Поэтому всё, с чем он работает, сначала превращается в числа: буквы, картинки, звуки, видео."
                        ]
                    }
                },
                {
                    type: "info", icon: "🔤",
                    en: {
                        title: "Letters become numbers",
                        text: ["Give every letter a number. Then any word is a list of numbers."],
                        example: ["A = 1, B = 2, C = 3, D = 4, E = 5 …", "CAB → 3, 1, 2"],
                        note: "Real computers use a much longer table of the same kind. It has a number for every letter of every language, and even for every emoji."
                    },
                    ru: {
                        title: "Буквы становятся числами",
                        text: ["Дадим каждой букве число. Тогда любое слово — это список чисел."],
                        example: ["А = 1, Б = 2, В = 3, Г = 4, Д = 5 …", "ДВА → 5, 3, 1"],
                        note: "Настоящие компьютеры пользуются такой же таблицей, только гораздо длиннее. В ней есть число для каждой буквы каждого языка и даже для каждого эмодзи."
                    }
                },
                {
                    type: "number", answer: 5,
                    en: {
                        q: "The code is A = 1, B = 2, C = 3, and so on down the alphabet. Which number does the letter E get?",
                        hint: "Count along the alphabet: A, B, C, D, E.",
                        why: "A, B, C, D, E: the fifth letter gets the number 5."
                    },
                    ru: {
                        q: "Код такой: А = 1, Б = 2, В = 3 и так далее по алфавиту. Какое число получит буква Д?",
                        hint: "Посчитай по алфавиту: А, Б, В, Г, Д.",
                        why: "А, Б, В, Г, Д: пятая буква получает число 5."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "With the code A = 1, B = 2, C = 3, D = 4, how does the computer keep the word BAD?",
                        options: ["2, 1, 4", "1, 2, 4", "4, 1, 2", "2, 4, 1"],
                        hint: "Take the letters one by one: B, then A, then D.",
                        why: "B is 2, A is 1, D is 4. The order of the numbers is the order of the letters."
                    },
                    ru: {
                        q: "С кодом А = 1, Б = 2, В = 3, Г = 4 как компьютер хранит слово БАГ?",
                        options: ["2, 1, 4", "1, 2, 4", "4, 1, 2", "2, 4, 1"],
                        hint: "Бери буквы по одной: Б, потом А, потом Г.",
                        why: "Б — это 2, А — это 1, Г — это 4. Числа идут в том же порядке, что и буквы."
                    }
                },
                {
                    type: "info", icon: "🖼️",
                    pixels: { rows: ["090", "909", "090"], numbers: true },
                    en: {
                        title: "Pictures become numbers",
                        text: [
                            "Look very closely at a screen and you will see tiny squares: **pixels**. Each pixel is one number that says how bright it is: 0 is black, 255 is white, and the numbers in between are greys.",
                            "This tiny picture is 3 pixels wide and 3 pixels tall, so for the computer it is just 9 numbers."
                        ],
                        pixelsLabel: "A picture of 3 by 3 pixels with the number of each pixel: five black pixels (0) form an X, four white pixels (255) are between them."
                    },
                    ru: {
                        title: "Картинки становятся числами",
                        text: [
                            "Если посмотреть на экран совсем близко, видны крошечные квадратики — **пиксели**. Каждый пиксель — это одно число, его яркость: 0 — чёрный, 255 — белый, а числа между ними — оттенки серого.",
                            "Эта крошечная картинка — 3 пикселя в ширину и 3 в высоту, так что для компьютера это просто 9 чисел."
                        ],
                        pixelsLabel: "Картинка 3 на 3 пикселя с числом каждого пикселя: пять чёрных пикселей (0) образуют крестик, между ними четыре белых (255)."
                    }
                },
                {
                    type: "number", answer: 100, card: "z2a",
                    en: {
                        q: "A black-and-white picture is 10 pixels wide and 10 pixels tall. How many numbers does the computer need to keep it?",
                        hint: "One number for each pixel. How many pixels are there?",
                        why: "10 × 10 = 100 pixels, one number each. A phone photo has millions of pixels, and a colour pixel needs three numbers: how much red, green and blue."
                    },
                    ru: {
                        q: "Чёрно-белая картинка — 10 пикселей в ширину и 10 в высоту. Сколько чисел нужно компьютеру, чтобы её хранить?",
                        hint: "Одно число на каждый пиксель. Сколько всего пикселей?",
                        why: "10 × 10 = 100 пикселей, по одному числу на каждый. В фотографии с телефона миллионы пикселей, а цветному пикселю нужно три числа: сколько в нём красного, зелёного и синего."
                    }
                },
                {
                    type: "choice", card: "z2b",
                    en: {
                        q: "In a black-and-white picture, a pixel has the number 0. What colour is it?",
                        options: ["Black", "White", "Grey", "Red"],
                        why: "0 means no light at all: black. 255 is the brightest: white."
                    },
                    ru: {
                        q: "В чёрно-белой картинке у пикселя число 0. Какого он цвета?",
                        options: ["Чёрный", "Белый", "Серый", "Красный"],
                        why: "0 значит «света нет совсем» — это чёрный. 255 — самый яркий, белый."
                    }
                },
                {
                    type: "info", icon: "🎵",
                    en: {
                        title: "Sounds become numbers too",
                        text: [
                            "A sound is the air shaking. A microphone measures that shaking thousands of times every second and writes each measurement down as a number.",
                            "So a song is a very long list of numbers. And a video is many pictures in a row, plus the sound."
                        ]
                    },
                    ru: {
                        title: "Звуки тоже становятся числами",
                        text: [
                            "Звук — это дрожание воздуха. Микрофон измеряет это дрожание тысячи раз в секунду и записывает каждое измерение числом.",
                            "Получается, песня — это очень длинный список чисел. А видео — это много картинок подряд и звук."
                        ]
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "What does the computer turn each one into?",
                        pairs: [
                            ["A word", "A number for every letter"],
                            ["A photo", "A number for every pixel"],
                            ["A song", "Thousands of measurements a second"],
                            ["A video", "Many pictures in a row"]
                        ],
                        why: "Different things, the same trick: measure it and write the numbers down."
                    },
                    ru: {
                        q: "Во что компьютер превращает каждое из них?",
                        pairs: [
                            ["Слово", "Число для каждой буквы"],
                            ["Фотография", "Число для каждого пикселя"],
                            ["Песня", "Тысячи измерений в секунду"],
                            ["Видео", "Много картинок подряд"]
                        ],
                        why: "Вещи разные, а приём один: измерить и записать числами."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Why does this matter for AI?",
                        answer: [
                            "Because one and the same method can then work with texts, pictures and sounds: for the computer they are all lists of numbers.",
                            "An AI model takes numbers in, calculates, and gives numbers out. A photo of a cat goes in as numbers, and what comes out is a number too: for example 0.97, which means “97% sure this is a cat”."
                        ]
                    },
                    ru: {
                        q: "Почему это важно для ИИ?",
                        answer: [
                            "Потому что тогда один и тот же способ годится и для текстов, и для картинок, и для звуков: для компьютера всё это списки чисел.",
                            "Модель ИИ получает числа, считает и выдаёт числа. Фотография кошки попадает в неё числами, и на выходе тоже число: например, 0,97 — это значит «на 97% уверена, что это кошка»."
                        ]
                    }
                },
                {
                    type: "choice", card: "z2c",
                    en: {
                        q: "Why can the same AI method work with text, pictures and sound?",
                        options: ["Because inside the computer all of them are numbers", "Because computers understand pictures the way people do", "Because every file has the same size"],
                        why: "Letters, pixels and sound measurements all become numbers. A model takes numbers in and gives numbers out."
                    },
                    ru: {
                        q: "Почему один и тот же способ ИИ работает и с текстом, и с картинками, и со звуком?",
                        options: ["Потому что внутри компьютера всё это числа", "Потому что компьютер понимает картинки так же, как человек", "Потому что все файлы одного размера"],
                        why: "Буквы, пиксели и измерения звука — всё становится числами. Модель получает числа и выдаёт числа."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Inside a computer everything is numbers.",
                            "Letters: a number for each letter. Pictures: a number for each **pixel** (0 is black, 255 is white). Sounds: thousands of measurements a second.",
                            "An AI model takes numbers in and gives numbers out."
                        ]
                    },
                    ru: {
                        points: [
                            "Внутри компьютера всё — числа.",
                            "Буквы: число для каждой буквы. Картинки: число для каждого **пикселя** (0 — чёрный, 255 — белый). Звуки: тысячи измерений в секунду.",
                            "Модель ИИ получает числа и выдаёт числа."
                        ]
                    }
                }
            ]
        },

        /* ----- z3. Rules or examples? ----- */
        z3: {
            steps: [
                {
                    type: "info", icon: "📏",
                    en: {
                        title: "Way 1: write the rules",
                        text: [
                            "The classic way to make a computer do a task: a person thinks of the rules and writes them down as a program.",
                            "This works well when the rules are few and clear, like in a calculator."
                        ],
                        example: ["IF the message has the word “prize”, THEN move it to spam."]
                    },
                    ru: {
                        title: "Способ 1: написать правила",
                        text: [
                            "Обычный способ научить компьютер задаче: человек придумывает правила и записывает их в виде программы.",
                            "Это хорошо работает, когда правил мало и они чёткие, как в калькуляторе."
                        ],
                        example: ["ЕСЛИ в письме есть слово «приз», ТО отправь его в спам."]
                    }
                },
                {
                    type: "info", icon: "📚",
                    en: {
                        title: "Way 2: show examples",
                        text: [
                            "The other way: do not write the rules at all. Show the computer many examples with the right answers and let it find the pattern itself.",
                            "This is called **machine learning**, and it is how today's AI is made."
                        ]
                    },
                    ru: {
                        title: "Способ 2: показать примеры",
                        text: [
                            "Другой способ: правила вообще не писать. Показать компьютеру много примеров с правильными ответами — и пусть сам найдёт закономерность.",
                            "Это называется **машинным обучением**. Именно так делают сегодняшний ИИ."
                        ]
                    }
                },
                {
                    type: "number", answer: 18,
                    en: {
                        q: "Be the machine. Nobody tells you the rule: find it from the examples. What comes out for 9?",
                        table: { head: ["In", "Out"], rows: [["2", "4"], ["5", "10"], ["7", "14"], ["9", "?"]] },
                        hint: "Compare each “out” with its “in”. How many times bigger is it?",
                        why: "9 × 2 = 18. The rule was “multiply by 2”, and nobody told you: you found it from three examples. Machine learning does the same, with millions of examples."
                    },
                    ru: {
                        q: "Побудь машиной. Правило тебе никто не скажет: найди его по примерам. Что получится из 9?",
                        table: { head: ["Вход", "Выход"], rows: [["2", "4"], ["5", "10"], ["7", "14"], ["9", "?"]] },
                        hint: "Сравни каждый «выход» с его «входом». Во сколько раз он больше?",
                        why: "9 × 2 = 18. Правило было «умножь на 2», и тебе его никто не говорил: хватило трёх примеров, чтобы его найти. Машинное обучение делает то же самое, только примеров — миллионы."
                    }
                },
                {
                    type: "number", answer: 13, card: "z3a",
                    en: {
                        q: "Find the rule from the examples. What comes out for 10?",
                        table: { head: ["In", "Out"], rows: [["1", "4"], ["2", "5"], ["6", "9"], ["10", "?"]] },
                        hint: "This time, try adding.",
                        why: "10 + 3 = 13. The rule is “add 3”. After the first example alone (1 → 4) it could also have been “multiply by 4”. The more examples, the surer the rule."
                    },
                    ru: {
                        q: "Найди правило по примерам. Что получится из 10?",
                        table: { head: ["Вход", "Выход"], rows: [["1", "4"], ["2", "5"], ["6", "9"], ["10", "?"]] },
                        hint: "На этот раз попробуй прибавлять.",
                        why: "10 + 3 = 13. Правило — «прибавь 3». По одному первому примеру (1 → 4) это могло быть и «умножь на 4». Чем больше примеров, тем надёжнее правило."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Rules or examples: which way fits the task better?",
                        groups: ["Write the rules", "Learn from examples"],
                        items: [
                            ["Add up the prices in a shop", 0],
                            ["Recognise a face in a photo", 1],
                            ["Sort names from A to Z", 0],
                            ["Tell a happy review from an angry one", 1],
                            ["Count the days until a birthday", 0],
                            ["Understand spoken words", 1]
                        ],
                        why: "Exact tasks with clear steps: rules. Tasks where even people cannot explain the rule (how do you know it is your friend's face?): examples."
                    },
                    ru: {
                        q: "Правила или примеры: что лучше подходит для задачи?",
                        groups: ["Написать правила", "Учить на примерах"],
                        items: [
                            ["Сложить цены в магазине", 0],
                            ["Узнать лицо на фотографии", 1],
                            ["Расставить имена по алфавиту", 0],
                            ["Отличить довольный отзыв от сердитого", 1],
                            ["Посчитать дни до дня рождения", 0],
                            ["Понять устную речь", 1]
                        ],
                        why: "Точные задачи с чёткими шагами — правила. Задачи, где правило не объяснит даже человек (как ты узнаёшь лицо друга?), — примеры."
                    }
                },
                {
                    type: "info", icon: "🧪",
                    en: {
                        title: "What learning produces: a model",
                        text: [
                            "After learning from the examples, the computer keeps what it found: the pattern. This is called a **model**.",
                            "Then you can give the model something new, which it has never seen, and it gives its best answer."
                        ],
                        example: ["Examples → learning → a model", "Something new → the model → an answer"]
                    },
                    ru: {
                        title: "Что получается после обучения: модель",
                        text: [
                            "Поучившись на примерах, компьютер сохраняет то, что нашёл, — закономерность. Это называется **моделью**.",
                            "Потом модели можно дать что-то новое, чего она ещё не видела, и она даст свой лучший ответ."
                        ],
                        example: ["Примеры → обучение → модель", "Что-то новое → модель → ответ"]
                    }
                },
                {
                    type: "choice", card: "z3b",
                    en: {
                        q: "A model learned to recognise apples, but every example photo showed a red apple. You show it a green apple. What is most likely?",
                        options: ["It may get it wrong: it has never seen a green apple", "It will know, because it understands what an apple is", "It will ask you for help"],
                        hint: "What does a model know about the world, apart from its examples?",
                        why: "A model knows only what was in its examples. One-sided examples make a one-sided model. Remember this: it explains many of AI's mistakes."
                    },
                    ru: {
                        q: "Модель училась узнавать яблоки, но на всех примерах были красные яблоки. Ты показываешь ей зелёное. Что скорее всего произойдёт?",
                        options: ["Она может ошибиться: зелёных яблок она не видела", "Она узнает его, потому что понимает, что такое яблоко", "Она попросит тебя помочь"],
                        hint: "Что модель знает о мире, кроме своих примеров?",
                        why: "Модель знает только то, что было в её примерах. Однобокие примеры — однобокая модель. Запомни это: так объясняются многие ошибки ИИ."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Put the steps of machine learning in order.",
                        items: ["Collect many examples with the right answers", "Let the computer look for the pattern", "Test the model on examples it has not seen", "Use the model on new things"],
                        hint: "A model is tested before it is used, and it can only be tested once it has learned.",
                        why: "The test on new examples matters: a model that only remembers its examples has learned nothing useful."
                    },
                    ru: {
                        q: "Расставь по порядку шаги машинного обучения.",
                        items: ["Собрать много примеров с правильными ответами", "Дать компьютеру найти закономерность", "Проверить модель на примерах, которых она не видела", "Использовать модель на новом"],
                        hint: "Модель проверяют до того, как использовать, а проверить её можно только после обучения.",
                        why: "Проверка на новых примерах важна: модель, которая просто запомнила свои примеры, ничему полезному не научилась."
                    }
                },
                {
                    type: "choice", card: "z3c",
                    en: {
                        q: "What is machine learning?",
                        options: ["The computer finds the pattern itself from many examples", "A person writes every rule by hand", "The computer copies the answers from the internet"],
                        why: "In machine learning nobody writes the rules. The computer gets examples with the right answers and finds the pattern. The result is a model."
                    },
                    ru: {
                        q: "Что такое машинное обучение?",
                        options: ["Компьютер сам находит закономерность по множеству примеров", "Человек пишет каждое правило вручную", "Компьютер списывает ответы из интернета"],
                        why: "В машинном обучении правила никто не пишет. Компьютер получает примеры с правильными ответами и находит закономерность. Результат — модель."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "There are two ways to make a computer do a task: write the **rules**, or show **examples**.",
                            "Learning from examples is called **machine learning**. What it produces is a **model**.",
                            "More examples make the pattern surer. One-sided examples make a one-sided model.",
                            "A model must be tested on examples it has not seen."
                        ]
                    },
                    ru: {
                        points: [
                            "Научить компьютер задаче можно двумя способами: написать **правила** или показать **примеры**.",
                            "Обучение на примерах называется **машинным обучением**. Его результат — **модель**.",
                            "Чем больше примеров, тем надёжнее закономерность. Однобокие примеры — однобокая модель.",
                            "Модель нужно проверять на примерах, которых она не видела."
                        ]
                    }
                }
            ]
        },

        /* ----- z4. How learning works: you and the machine ----- */
        z4: {
            steps: [
                {
                    type: "info", icon: "🧠",
                    en: {
                        title: "Your brain learns from examples too",
                        text: [
                            "You did not learn what a dog is from a rule. You saw many dogs, and someone said “dog” each time. Your brain found the pattern.",
                            "A model learns in a similar way: from examples and from its mistakes. So what helps you learn is worth knowing, and it is also how this site is built."
                        ]
                    },
                    ru: {
                        title: "Твой мозг тоже учится на примерах",
                        text: [
                            "Что такое собака, ты знаешь не из правила. В детстве тебе много раз показывали собак и говорили «собака». Мозг сам нашёл закономерность.",
                            "Модель учится похоже: на примерах и на своих ошибках. Поэтому полезно знать, что помогает учиться тебе. На этом же построен и этот сайт."
                        ]
                    }
                },
                {
                    type: "info", icon: "📉",
                    en: {
                        title: "Why you forget",
                        text: [
                            "New knowledge fades fast. Without a reminder, much of what you read today will be hard to recall in a week.",
                            "This is normal: the brain lets go of what it does not use. The trick is to use it at the right moments."
                        ]
                    },
                    ru: {
                        title: "Почему мы забываем",
                        text: [
                            "Новые знания быстро тускнеют. Без напоминаний многое из прочитанного сегодня через неделю будет трудно вспомнить.",
                            "Это нормально: мозг отпускает то, чем не пользуется. Хитрость в том, чтобы пользоваться знанием в нужные моменты."
                        ]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "You want to remember a lesson for a long time. What works best?",
                        options: ["Close the page and try to recall the main ideas", "Read the lesson two more times", "Highlight the important sentences"],
                        hint: "Which one makes your brain work the hardest?",
                        why: "Pulling an answer out of your memory makes the memory stronger. Rereading and highlighting feel good, but they do much less. That is why this site keeps asking you questions."
                    },
                    ru: {
                        q: "Ты хочешь запомнить урок надолго. Что работает лучше всего?",
                        options: ["Закрыть страницу и попробовать вспомнить главные мысли", "Прочитать урок ещё два раза", "Выделить важные предложения маркером"],
                        hint: "Что из этого заставляет мозг работать сильнее всего?",
                        why: "Когда ты достаёшь ответ из памяти, память становится крепче. Перечитывать и выделять приятно, но пользы от этого гораздо меньше. Поэтому сайт всё время задаёт тебе вопросы."
                    }
                },
                {
                    type: "info", icon: "🗓️",
                    en: {
                        title: "Come back at the right time",
                        text: [
                            "The best moment to recall something is just before you would forget it. After each successful recall the memory lasts longer, so the breaks can grow.",
                            "This is called **spaced repetition**. The memory check on this site does it for you: after each right answer a question comes back after a longer break. A wrong answer brings it back the next day."
                        ],
                        example: ["1 day → 2 days → 4 days → 8 days → …"]
                    },
                    ru: {
                        title: "Возвращайся в нужный момент",
                        text: [
                            "Лучше всего вспоминать что-то как раз перед тем, как оно забудется. После каждого удачного вспоминания память держится дольше, поэтому перерывы можно увеличивать.",
                            "Это называется **интервальным повторением**. Проверка памяти на этом сайте делает это за тебя: после каждого верного ответа вопрос возвращается через более долгий перерыв. А после ошибки — уже на следующий день."
                        ],
                        example: ["1 день → 2 дня → 4 дня → 8 дней → …"]
                    }
                },
                {
                    type: "number", answer: 16,
                    en: {
                        q: "You answer a card right every time. It came back after 1, 2, 4 and 8 days. After how many days will it come back next?",
                        hint: "Each break is twice as long as the one before.",
                        why: "The breaks double: 1, 2, 4, 8, 16. A handful of short checks keeps an idea for months."
                    },
                    ru: {
                        q: "Ты каждый раз отвечаешь на карточку верно. Она возвращалась через 1, 2, 4 и 8 дней. Через сколько дней она вернётся в следующий раз?",
                        hint: "Каждый перерыв вдвое длиннее предыдущего.",
                        why: "Перерывы удваиваются: 1, 2, 4, 8, 16. Несколько коротких проверок — и мысль остаётся с тобой на месяцы."
                    }
                },
                {
                    type: "choice", card: "z4a",
                    en: {
                        q: "In the memory check you answer a card wrong. When does it come back?",
                        options: ["Tomorrow", "In a month", "Never"],
                        why: "A wrong answer sends the card back to the first box. It returns the next day, so you can fix it while it is fresh."
                    },
                    ru: {
                        q: "В проверке памяти ты даёшь неверный ответ на карточку. Когда она вернётся?",
                        options: ["Завтра", "Через месяц", "Никогда"],
                        why: "После ошибки карточка возвращается в первую коробку. Она придёт на следующий день, чтобы исправить ошибку, пока всё свежо."
                    }
                },
                {
                    type: "info", icon: "🗣️",
                    en: {
                        title: "Explain it to someone",
                        text: [
                            "If you can explain an idea in your own simple words, you understand it. If you get stuck, you have found the exact place to read again.",
                            "On this site it is called “Explain it back”: after a lesson you write two or three sentences and compare them with the lesson's key ideas."
                        ]
                    },
                    ru: {
                        title: "Объясни кому-нибудь",
                        text: [
                            "Если ты можешь объяснить мысль своими простыми словами, значит, ты её понимаешь. А место, где объяснение запинается, — как раз то, что стоит перечитать.",
                            "На этом сайте это называется «Объясни своими словами»: после урока ты пишешь два-три предложения и сравниваешь их с главными мыслями урока."
                        ]
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Does it build a strong memory, or does it only feel like learning?",
                        groups: ["Builds memory", "Only feels like learning"],
                        items: [
                            ["Answering questions from memory", 0],
                            ["Rereading the same page", 1],
                            ["Explaining it to a friend", 0],
                            ["Highlighting sentences", 1],
                            ["Coming back after a few days", 0],
                            ["Cramming it all in one long evening", 1]
                        ],
                        why: "Recall it, explain it, space it out. The other three are comfortable, and that is the problem: the brain does little work."
                    },
                    ru: {
                        q: "Это укрепляет память или только кажется учёбой?",
                        groups: ["Укрепляет память", "Только кажется учёбой"],
                        items: [
                            ["Отвечать на вопросы по памяти", 0],
                            ["Перечитывать ту же страницу", 1],
                            ["Объяснять другу", 0],
                            ["Выделять предложения маркером", 1],
                            ["Возвращаться через несколько дней", 0],
                            ["Зубрить всё за один долгий вечер", 1]
                        ],
                        why: "Вспоминай, объясняй, делай перерывы. Остальные три способа удобные, и в этом их беда: мозг почти не работает."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "You and a model learn in similar ways. Find the pairs.",
                        pairs: [
                            ["You see many examples", "The model gets training data"],
                            ["You fix your mistakes", "The model adjusts itself after a mistake"],
                            ["You take a test", "The model is checked on new examples"]
                        ],
                        why: "One big difference: you understand what things mean. A model only finds patterns in numbers."
                    },
                    ru: {
                        q: "Ты и модель учитесь похоже. Найди пары.",
                        pairs: [
                            ["Ты видишь много примеров", "Модель получает данные для обучения"],
                            ["Ты исправляешь ошибки", "Модель подстраивается после ошибки"],
                            ["Ты пишешь контрольную", "Модель проверяют на новых примерах"]
                        ],
                        why: "Одно большое отличие: ты понимаешь смысл. Модель только находит закономерности в числах."
                    }
                },
                {
                    type: "choice", card: "z4b",
                    en: {
                        q: "What is spaced repetition?",
                        options: ["Coming back to an idea after longer and longer breaks", "Repeating an idea ten times in a row", "Reading the lesson right before sleep"],
                        why: "You recall the idea just before you would forget it, and each time the break grows: 1, 2, 4, 8 days and more."
                    },
                    ru: {
                        q: "Что такое интервальное повторение?",
                        options: ["Возвращаться к мысли через всё более долгие перерывы", "Повторить мысль десять раз подряд", "Читать урок прямо перед сном"],
                        why: "Ты вспоминаешь мысль как раз перед тем, как она забудется, и перерыв каждый раз растёт: 1, 2, 4, 8 дней и дальше."
                    }
                },
                {
                    type: "choice", card: "z4c",
                    en: {
                        q: "Which is the best sign that you really understand an idea?",
                        options: ["You can explain it in your own simple words", "You have read about it three times", "It looks familiar when you see it"],
                        why: "Familiar is not the same as known. Explaining it shows the gaps at once."
                    },
                    ru: {
                        q: "Какой признак лучше всего показывает, что ты действительно понимаешь мысль?",
                        options: ["Ты можешь объяснить её своими простыми словами", "Текст о ней прочитан три раза", "Она кажется знакомой, когда ты её видишь"],
                        why: "«Знакомо» не значит «знаю». Когда объясняешь, пробелы видны сразу."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "You and a model both learn from examples and from mistakes.",
                            "Recalling from memory beats rereading.",
                            "**Spaced repetition**: come back after 1, 2, 4, 8 … days, just before you would forget.",
                            "Explaining in your own words shows what you really know."
                        ]
                    },
                    ru: {
                        points: [
                            "И ты, и модель учитесь на примерах и на ошибках.",
                            "Вспоминать по памяти полезнее, чем перечитывать.",
                            "**Интервальное повторение**: возвращайся через 1, 2, 4, 8 … дней — как раз перед тем, как забудешь.",
                            "Объяснение своими словами показывает, что ты знаешь на самом деле."
                        ]
                    }
                }
            ]
        },

        /* ----- z5. Train your first model ----- */
        z5: {
            steps: [
                {
                    type: "info", icon: "📏",
                    en: {
                        title: "A tiny model: one rule, one number",
                        text: [
                            "A model can be tiny: just one rule with one number in it. The rule below is a model like that. It sorts messages into spam and not spam, and the letter T stands for its number.",
                            "In machine learning, nobody writes T by hand: it has to be found from examples. A number that a model learns from examples is called a **parameter**."
                        ],
                        example: ["IF a message has more than T exclamation marks, THEN it is spam.", "Otherwise it is not spam."],
                        note: "Spam means messages that nobody asked for, like adverts sent to thousands of people."
                    },
                    ru: {
                        title: "Крошечная модель: одно правило, одно число",
                        text: [
                            "Модель может быть совсем крошечной: одно правило, а в нём одно число. Правило ниже — как раз такая модель. Она делит сообщения на спам и не спам, а буква T обозначает её число.",
                            "В машинном обучении число T никто не вписывает вручную: его нужно найти по примерам. Число, которое модель находит по примерам, называется **параметром**."
                        ],
                        example: ["ЕСЛИ в сообщении больше T восклицательных знаков, ТО это спам.", "Иначе это не спам."],
                        note: "Спам — это сообщения, которых никто не просил: например, реклама, которую рассылают тысячам людей."
                    }
                },
                {
                    type: "info", icon: "📋",
                    en: {
                        title: "Six examples with the right answers",
                        text: [
                            "To find T, the model needs examples. The table below shows six messages: the number of exclamation marks in each one, and whether it really is spam. A person has checked every message and written down the right answer.",
                            "The examples that a model learns from are called its **training data**."
                        ],
                        table: { head: ["Exclamation marks", "It really is"], rows: [["0", "not spam"], ["1", "not spam"], ["3", "not spam"], ["4", "spam"], ["6", "spam"], ["9", "spam"]] }
                    },
                    ru: {
                        title: "Шесть примеров с правильными ответами",
                        text: [
                            "Чтобы найти T, модели нужны примеры. В таблице ниже шесть сообщений: сколько в каждом восклицательных знаков и спам ли это на самом деле. Каждое сообщение проверил человек и записал правильный ответ.",
                            "Примеры, на которых учится модель, называются её **обучающими данными**."
                        ],
                        table: { head: ["Восклицательных знаков", "На самом деле"], rows: [["0", "не спам"], ["1", "не спам"], ["3", "не спам"], ["4", "спам"], ["6", "спам"], ["9", "спам"]] }
                    }
                },
                {
                    type: "number", answer: 2,
                    en: {
                        q: "Start with a guess: T = 0. Now the model says “spam” when a message has more than 0 exclamation marks, and “not spam” otherwise. On how many of the six examples is it wrong?",
                        table: { head: ["Exclamation marks", "It really is"], rows: [["0", "not spam"], ["1", "not spam"], ["3", "not spam"], ["4", "spam"], ["6", "spam"], ["9", "spam"]] },
                        hint: "Which messages have more than 0 exclamation marks? Are all of them really spam?",
                        why: "On 2. The messages with 1 and 3 exclamation marks are not spam, but the model calls them spam. Its other four answers are right. That includes the message with 0 marks: 0 is not more than 0, so the model says “not spam”."
                    },
                    ru: {
                        q: "Начнём наугад: T = 0. Теперь модель говорит «спам», если в сообщении больше 0 восклицательных знаков, а иначе — «не спам». На скольких из шести примеров она ошибётся?",
                        table: { head: ["Восклицательных знаков", "На самом деле"], rows: [["0", "не спам"], ["1", "не спам"], ["3", "не спам"], ["4", "спам"], ["6", "спам"], ["9", "спам"]] },
                        hint: "В каких сообщениях больше 0 восклицательных знаков? Все ли они на самом деле спам?",
                        why: "На 2. Сообщения с 1 и 3 восклицательными знаками — не спам, а модель называет их спамом. Остальные четыре её ответа верны. Среди них и ответ про сообщение с 0 знаков: 0 не больше 0, поэтому модель говорит «не спам»."
                    }
                },
                {
                    type: "number", answer: 1,
                    en: {
                        q: "Try another number: T = 5. Now the model says “spam” only when a message has more than 5 exclamation marks. How many mistakes does it make on the six examples?",
                        table: { head: ["Exclamation marks", "It really is"], rows: [["0", "not spam"], ["1", "not spam"], ["3", "not spam"], ["4", "spam"], ["6", "spam"], ["9", "spam"]] },
                        hint: "Go through the table row by row. Does the message have more than 5 marks? Does the model's answer match what the message really is?",
                        why: "Just 1. The message with 4 exclamation marks is spam, but 4 is not more than 5, so the model lets it through. That is better than with T = 0, but still not perfect."
                    },
                    ru: {
                        q: "Попробуй другое число: T = 5. Теперь модель говорит «спам», только если в сообщении больше 5 восклицательных знаков. Сколько ошибок она сделает на шести примерах?",
                        table: { head: ["Восклицательных знаков", "На самом деле"], rows: [["0", "не спам"], ["1", "не спам"], ["3", "не спам"], ["4", "спам"], ["6", "спам"], ["9", "спам"]] },
                        hint: "Пройди по таблице строку за строкой. В сообщении больше 5 знаков? Совпадает ли ответ модели с тем, что есть на самом деле?",
                        why: "Всего 1. Сообщение с 4 восклицательными знаками — спам, но 4 не больше 5, поэтому модель его пропускает. Это лучше, чем при T = 0, но ещё не идеально."
                    }
                },
                {
                    type: "number", answer: 3, card: "z5a",
                    en: {
                        q: "A model says “spam” when a message has more than T exclamation marks, and “not spam” otherwise. The table shows six messages with the right answers. For which whole number T is the model right about all six?",
                        table: { head: ["Exclamation marks", "It really is"], rows: [["0", "not spam"], ["1", "not spam"], ["3", "not spam"], ["4", "spam"], ["6", "spam"], ["9", "spam"]] },
                        hint: "Find the place in the table where “not spam” ends and “spam” begins. The last “not spam” message must not have more than T marks. The first “spam” message must have more than T.",
                        why: "T = 3. Then the messages with 4, 6 and 9 marks are called spam, and the ones with 0, 1 and 3 are not: no mistakes. With T = 2 the message with 3 marks would be called spam too, and with T = 4 the spam message with 4 marks would get through. T is the model's parameter: a number found from examples."
                    },
                    ru: {
                        q: "Модель говорит «спам», если в сообщении больше T восклицательных знаков, а иначе — «не спам». В таблице — шесть сообщений с правильными ответами. При каком целом числе T модель даст верный ответ для всех шести?",
                        table: { head: ["Восклицательных знаков", "На самом деле"], rows: [["0", "не спам"], ["1", "не спам"], ["3", "не спам"], ["4", "спам"], ["6", "спам"], ["9", "спам"]] },
                        hint: "Найди в таблице место, где кончается «не спам» и начинается «спам». В последнем сообщении «не спам» знаков должно быть не больше T, а в первом сообщении «спам» — больше T.",
                        why: "T = 3. Тогда сообщения с 4, 6 и 9 знаками модель назовёт спамом, а с 0, 1 и 3 — нет: ни одной ошибки. При T = 2 спамом оказалось бы и сообщение с 3 знаками, а при T = 4 модель пропустила бы спам с 4 знаками. T — это параметр модели: число, которое она находит по примерам."
                    }
                },
                {
                    type: "info", icon: "🔁",
                    en: {
                        title: "That was training",
                        text: [
                            "You did it: your first model is trained! That is what **training** is: try a number, count the mistakes, try another, and keep the one with the fewest mistakes.",
                            "A computer does the same, only with far more numbers. A big model can have millions or even billions of parameters and learn from millions of examples.",
                            "And the computer does not guess blindly. It looks at the mistakes, moves every parameter a little so that the mistakes get smaller, and repeats this again and again. Most of today's AI models learn like this."
                        ]
                    },
                    ru: {
                        title: "Это и было обучение",
                        text: [
                            "Получилось: твоя первая модель обучена! Вот что такое **обучение**: пробуем число, считаем ошибки, пробуем другое и оставляем то, с которым ошибок меньше всего.",
                            "Компьютер делает то же самое, только чисел у него гораздо больше. У большой модели могут быть миллионы и даже миллиарды параметров, а учиться она может на миллионах примеров.",
                            "И компьютер не гадает вслепую. Он смотрит на ошибки, чуть-чуть сдвигает каждый параметр, чтобы ошибки стали меньше, и повторяет это снова и снова. Так учится большинство сегодняшних моделей ИИ."
                        ]
                    }
                },
                {
                    type: "choice", card: "z5b",
                    en: {
                        q: "What does it mean to “train” an AI model?",
                        options: [
                            "To find the parameters: the numbers that give the fewest mistakes on its examples",
                            "To write all of its rules and numbers by hand, as a programmer writes a program",
                            "To make the computer faster, so that the model gives its answers sooner",
                            "To copy all the training data into its memory, so that it can look the answers up"
                        ],
                        hint: "A model has numbers inside it. Where do they come from?",
                        why: "Training is a search for the model's parameters: the numbers with which it makes the fewest mistakes on its examples. Nobody writes them by hand. And the model does not need to keep the examples: what it keeps is the numbers it has found."
                    },
                    ru: {
                        q: "Что значит «обучить» модель ИИ?",
                        options: [
                            "Найти параметры — числа, с которыми она меньше всего ошибается на своих примерах",
                            "Вписать в неё все правила и числа вручную, как программист пишет программу",
                            "Ускорить работу компьютера, чтобы модель быстрее выдавала ответы",
                            "Скопировать в её память все обучающие данные, чтобы искать в них ответы"
                        ],
                        hint: "Внутри модели есть числа. Откуда они берутся?",
                        why: "Обучение — это поиск параметров модели: чисел, с которыми она делает меньше всего ошибок на своих примерах. Вручную их никто не пишет. А сами примеры модель может и не хранить: она хранит числа, которые нашла."
                    }
                },
                {
                    type: "info", icon: "🆕",
                    en: {
                        title: "The real test: a new message",
                        text: [
                            "Your model with T = 3 makes no mistakes on its six examples. But a model is made for new messages, the ones it has never seen. Here comes one.",
                            "A friend writes: “Happy birthday!!!!!” That is 5 exclamation marks, and 5 is more than 3. So the model says: spam.",
                            "Wrong: it is a greeting from a friend! The model was perfect on its six examples, and it still fails on a new one."
                        ]
                    },
                    ru: {
                        title: "Настоящая проверка: новое сообщение",
                        text: [
                            "Твоя модель с T = 3 не ошибается ни на одном из шести примеров. Но модель нужна для новых сообщений — тех, которых она не видела. Вот одно из них.",
                            "Друг пишет: «С днём рождения!!!!!» Это 5 восклицательных знаков, а 5 больше 3. Значит, модель говорит: спам.",
                            "Ошибка: это же поздравление от друга! На своих шести примерах модель не ошиблась ни разу — и всё равно промахнулась на новом."
                        ]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Why did the model call the birthday message spam?",
                        options: [
                            "Its six examples had no friendly message with more than 3 exclamation marks",
                            "The computer made a mistake when it counted the exclamation marks",
                            "T = 3 was the wrong choice: another whole number fits the six examples better",
                            "A model can never be right about a message that it has not seen"
                        ],
                        hint: "Think of the six examples. Were the messages with more than 3 exclamation marks spam or not spam?",
                        why: "A model knows only what was in its examples. In them, every message with more than 3 exclamation marks was spam, so the model learned “more than 3 marks means spam”. It counted correctly, and T = 3 fits the six examples best. The trouble was the examples: too few and too one-sided."
                    },
                    ru: {
                        q: "Почему модель назвала поздравление спамом?",
                        options: [
                            "В шести примерах не было дружеских сообщений, где больше 3 восклицательных знаков",
                            "Компьютер ошибся, когда считал восклицательные знаки в сообщении",
                            "T = 3 выбрано неудачно: другое целое число лучше подходит к шести примерам",
                            "Модель не может дать верный ответ на сообщение, которого не видела"
                        ],
                        hint: "Вспомни шесть примеров. Сообщения, в которых больше 3 восклицательных знаков, были спамом или нет?",
                        why: "Модель знает только то, что было в её примерах. А в них каждое сообщение, где больше 3 восклицательных знаков, было спамом, вот она и выучила: «больше 3 знаков — значит, спам». Посчитала она верно, и T = 3 подходит к шести примерам лучше всего. Дело в самих примерах: их было мало, и они были однобокими."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "How would you make this model better?",
                        answer: [
                            "Give it more examples, and more kinds of them: friendly messages with many exclamation marks too.",
                            "Let it look at more than one clue: with exclamation marks alone, it cannot tell a happy friend from an advert. The words (“free”, “win”), the sender and the links help too. Real spam filters can use thousands of clues, each with its own parameter.",
                            "And always test it on examples it has never seen. In the AI Lab, the experiment “Build a spam filter” lets you teach a filter that looks at the words, and test it on new messages."
                        ]
                    },
                    ru: {
                        q: "Как сделать эту модель лучше?",
                        answer: [
                            "Дать ей больше примеров, и притом разных: например, дружеские сообщения, в которых много восклицательных знаков.",
                            "Научить её смотреть не на один признак, а на многие: по одним восклицательным знакам не отличить радостного друга от рекламы. Помогут ещё слова («бесплатно», «выиграй»), отправитель и ссылки. Настоящие спам-фильтры могут учитывать тысячи признаков, и у каждого свой параметр.",
                            "И обязательно проверять её на примерах, которых она не видела. В ИИ-лаборатории есть эксперимент «Собери спам-фильтр»: там можно обучить фильтр, который смотрит на слова, и проверить его на новых сообщениях."
                        ]
                    }
                },
                {
                    type: "choice", card: "z5c",
                    en: {
                        q: "A model makes no mistakes on the examples it was trained on. What does that say about new examples?",
                        options: [
                            "Not much: it has to be tested on examples it has never seen",
                            "It will get new examples right too: it has learned the rule",
                            "It will get most new examples wrong: it has never seen them",
                            "It is ready to use: a test on new examples would add nothing"
                        ],
                        hint: "The model has already seen its training examples. What about the new ones?",
                        why: "The model has already seen its training examples, so getting them right proves little. On new ones it may do well or badly: only a test on examples it has never seen can show which."
                    },
                    ru: {
                        q: "Модель не ошибается ни на одном из примеров, на которых её обучали. Что это говорит о новых примерах?",
                        options: [
                            "Мало что: её нужно проверить на примерах, которых она не видела",
                            "На новых примерах она тоже не ошибётся: правило она уже выучила",
                            "На большинстве новых примеров она ошибётся: она ведь их не видела",
                            "Модель готова к работе: проверка на новых примерах ничего не добавит"
                        ],
                        hint: "Свои обучающие примеры модель уже видела. А новые?",
                        why: "Свои обучающие примеры модель уже видела, поэтому верные ответы на них мало что доказывают. С новыми она может справиться и хорошо, и плохо: это покажет только проверка на примерах, которых она не видела."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A model is a rule with numbers in it. The numbers are called **parameters**: they are not written by hand but found from examples.",
                            "**Training** is a search for the parameters: try them on the **training data**, count the mistakes and keep the ones that give fewer mistakes.",
                            "A model is only as good as its examples.",
                            "The real test is on examples the model has never seen."
                        ]
                    },
                    ru: {
                        points: [
                            "Модель — это правило с числами. Эти числа называются **параметрами**: их не пишут вручную, а находят по примерам.",
                            "**Обучение** — это поиск параметров: пробуем их на **обучающих данных**, считаем ошибки и оставляем те, с которыми ошибок меньше.",
                            "Какие примеры — такая и модель.",
                            "Настоящая проверка — на примерах, которых модель не видела."
                        ]
                    }
                }
            ]
        }
    }
});
