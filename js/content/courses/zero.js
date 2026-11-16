/* =========================================================
   AI COMPASS — GUIDED COURSE: START FROM ZERO
   Stage 0 of "My path": four guided steps for someone who has never
   learned how computers or AI work. Nothing is assumed.
     z1  What is a program?
     z2  Everything is numbers
     z3  Rules or examples?
     z4  How learning works: you and the machine
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
                        options: ["Наденет носки поверх ботинок", "Поменяет шаги местами, потому что так разумнее", "Остановится и спросит, что ты имел в виду"],
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
        }
    }
});
