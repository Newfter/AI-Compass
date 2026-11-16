/* =========================================================
   AI COMPASS — TEXTS: LESSON PLANS AND WORKSHEETS, LESSONS 13-15
   The teacher kit's plans and worksheets for the "AI in your world"
   track, in English and in Russian. Lessons 1-6 are in
   js/content/teachers-basics.js (its header explains every part of a
   plan and every kind of task), lessons 7-12 in teachers-deep.js.
   This file is big, so js/teachers-kit.js loads it only when a teacher
   opens a plan or a worksheet.
   To change a text, change it in both languages: English and Russian
   must keep the same parts, in the same order, with the same number of
   items (a match task's pairs, a table's rows, the gaps in [brackets]).
   The quiz questions are only named here, by their id: their texts stay
   in js/content/quiz-bank.js.
   ========================================================= */

window.AICompass.content.set("teachers-plans", {
    // ----- Lesson 13: Data: The Fuel of AI -----
    13: {
        exit: "q63",
        quiz: ["q61", "q62", "m21"],
        en: {
            objectives: [
                "explain where training data and labels come from, including the people who label it;",
                "find common problems in a dataset (missing, wrong, repeated and impossible values) and say why they matter;",
                "explain why a model is tested on a test set it never learned from, and recognise overfitting."
            ],
            warmup: "Your phone suggests the next word as you type. Where did it learn which word usually comes next?",
            warmupNote: "Collect answers on the board (books, websites, your own messages...). Point out that every answer is a kind of data, and ask who decided what went into it.",
            reading: "Students look for three ways data is collected, four kinds of messy data, and what a test set is for.",
            activity: {
                title: "Mini-lab “Data detective”",
                steps: [
                    "Students open the mini-lab in lesson 13 and read the table before tapping anything.",
                    "In pairs, they write down which rows they think are broken, and why.",
                    "They tap the rows and read each explanation, until all four problems are found.",
                    "They fill in the worksheet's table, then discuss: what would a model learn from each problem if nobody fixed it?"
                ]
            },
            extension: "Fast finishers open “Grow a decision tree” in the AI Lab, choose “Cycling days”, and compare a tree 2 levels deep with one 6 levels deep: which is better on new days, and why?",
            discussion: [
                "Many people who label data for AI are paid very little. Should users of AI care? Why?",
                "A face dataset has mostly photos of one group of people. Who might the model work worse for?",
                "Is it fair for an app to use what you clicked to train its AI? What would make it fair?",
                "Why can a model be 99% right on its training data and still be bad?"
            ],
            exit: "In one sentence, explain why a model is tested on examples it has never seen.",
            easier: "Before the mini-lab, show a short class list on the board with one obvious mistake (a 150-year-old student) and find it together.",
            harder: "Students design a small dataset of their own (8 rows about a school topic), hide three problems in it, and swap it with another pair to clean.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "All the examples a model learns from are its [dataset].",
                        "The right answer attached to an example, like “cat”, is called a [label].",
                        "Finding and fixing mistakes in data before training is called data [cleaning].",
                        "Examples put aside to check the model fairly are the [test] set.",
                        "A model that is great on training data but worse on new data has [overfitted]."
                    ],
                    extra: ["pixel"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Data detective” in lesson 13. For each broken row, write what is wrong with it.",
                    table: {
                        head: ["Row", "What is wrong"],
                        rows: [
                            ["2 (Ben)", "[Impossible age: 150]"],
                            ["4 (Leo)", "[Typo: “dgo” instead of “dog”]"],
                            ["5 (Sam)", "[The hours are missing]"],
                            ["6 (Mira)", "[A duplicate of row 3]"]
                        ]
                    },
                    items: [
                        "How many good rows are left after cleaning? [7]",
                        "What would a model learn from row 4 if nobody fixed it? [That there is a pet called “dgo”, with one fan.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["A problem to clean", "Fine as it is"],
                    items: [
                        ["A student's height is written as 1,700 cm", 0],
                        ["The same survey answer appears three times", 0],
                        ["Two students both like cats", 1],
                        ["A photo labelled “dog” shows a cat", 0],
                        ["One student spends 4 hours outside a day", 1],
                        ["The age column is empty for one student", 0]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Labels for training data are often added by people, one example at a time.", true, "People draw boxes, sort photos and mark answers, often for little pay."],
                        ["A model can tell a mistake in its data from a fact.", false, "It learns from both, which is why data is cleaned first."],
                        ["Testing a model on its training data is a fair test.", false, "It may simply have memorised them; only new examples show what it learned."],
                        ["A dataset made mostly of one group of people can make a model work worse for others.", true, "A model's bias often starts in its data."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["label", "the right answer attached to an example"],
                        ["dataset", "all the examples a model learns from"],
                        ["test set", "examples kept aside to check the model"],
                        ["data cleaning", "fixing missing, wrong and repeated values"],
                        ["overfitting", "learning the details of the training data instead of the rule"]
                    ]
                },
                {
                    type: "explain",
                    text: "A model for spotting skin cancer partly learned that “a ruler in the photo” means a worrying spot. Explain how this could happen, and how it could have been caught.",
                    answer: "Doctors often photograph worrying spots next to a ruler, so in the training photos rulers and worrying spots went together. The model learned the ruler as a shortcut. Testing it on photos without rulers, or checking which parts of the picture it pays attention to, would show the problem.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "объяснить, откуда берутся обучающие данные и метки, в том числе кто их размечает;",
                "находить типичные проблемы в наборе данных (пропуски, ошибки, повторы, невозможные значения) и объяснять, чем они опасны;",
                "объяснить, зачем модель проверяют на проверочном наборе, на котором она не училась, и узнавать переобучение."
            ],
            warmup: "Телефон подсказывает следующее слово, пока ты печатаешь. Где он узнал, какое слово обычно идёт следующим?",
            warmupNote: "Собрать ответы на доске (книги, сайты, свои сообщения...). Подчеркнуть, что каждый ответ — это данные, и спросить, кто решал, что в них попадёт.",
            reading: "Ученики ищут три способа собрать данные, четыре вида грязных данных и зачем нужен проверочный набор.",
            activity: {
                title: "Мини-лаборатория «Детектив данных»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 13 и сначала читают таблицу, ничего не нажимая.",
                    "В парах записывают, какие строки, по их мнению, сломаны и почему.",
                    "Нажимают на строки и читают объяснения, пока не найдут все четыре проблемы.",
                    "Заполняют таблицу в рабочем листе и обсуждают: чему научилась бы модель из каждой проблемы, если бы её никто не исправил?"
                ]
            },
            extension: "Кто закончил раньше, открывает в лаборатории ИИ «Вырасти дерево решений», выбирает «Дни для велопрогулки» и сравнивает дерево глубиной 2 уровня с деревом глубиной 6: какое лучше на новых днях и почему?",
            discussion: [
                "Многим людям, которые размечают данные для ИИ, платят очень мало. Должно ли это волновать пользователей ИИ? Почему?",
                "В наборе лиц в основном фото людей одной группы. Для кого модель может работать хуже?",
                "Честно ли, что приложение обучает свой ИИ на твоих нажатиях? Что сделало бы это честным?",
                "Почему модель может угадывать 99% обучающих данных и всё равно быть плохой?"
            ],
            exit: "Объясни в одном предложении, зачем модель проверяют на примерах, которых она не видела.",
            easier: "Перед мини-лабораторией показать на доске короткий список класса с одной очевидной ошибкой (ученику 150 лет) и найти её вместе.",
            harder: "Ученики придумывают свой маленький набор данных (8 строк на школьную тему), прячут в нём три проблемы и обмениваются с другой парой для очистки.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Все примеры, на которых учится модель, — это её [набор] данных.",
                        "Правильный ответ, прикреплённый к примеру, например «кошка», называется [меткой].",
                        "Поиск и исправление ошибок в данных до обучения называется [очисткой] данных.",
                        "Примеры, отложенные для честной проверки модели, — это [проверочный] набор.",
                        "Модель, которая отлично работает на обучающих данных, но хуже на новых, [переобучилась]."
                    ],
                    extra: ["пикселем"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Детектив данных» в уроке 13. Для каждой сломанной строки напиши, что с ней не так.",
                    table: {
                        head: ["Строка", "Что не так"],
                        rows: [
                            ["2 (Борис)", "[Невозможный возраст: 150]"],
                            ["4 (Лёва)", "[Опечатка: «сбоака» вместо «собака»]"],
                            ["5 (Саша)", "[Не заполнены часы]"],
                            ["6 (Мира)", "[Повтор строки 3]"]
                        ]
                    },
                    items: [
                        "Сколько хороших строк остаётся после очистки? [7]",
                        "Чему научилась бы модель из строки 4, если бы её никто не исправил? [Что есть питомец «сбоака», у которого один поклонник.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["Проблема, которую надо исправить", "Всё в порядке"],
                    items: [
                        ["Рост ученика записан как 1700 см", 0],
                        ["Один и тот же ответ в опросе встречается трижды", 0],
                        ["Двум ученикам нравятся кошки", 1],
                        ["На фото с меткой «собака» — кошка", 0],
                        ["Один ученик проводит на улице 4 часа в день", 1],
                        ["У одного ученика пустая графа «возраст»", 0]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Метки для обучающих данных часто ставят люди, по одному примеру за раз.", true, "Люди обводят предметы рамками, сортируют фото и отмечают ответы, часто за небольшие деньги."],
                        ["Модель может отличить ошибку в данных от факта.", false, "Она учится на том и другом, поэтому данные сначала очищают."],
                        ["Проверять модель на её обучающих данных — честная проверка.", false, "Она могла их просто запомнить; только новые примеры показывают, чему она научилась."],
                        ["Если в наборе данных в основном люди одной группы, для других модель может работать хуже.", true, "Предвзятость модели часто начинается в её данных."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["метка", "правильный ответ, прикреплённый к примеру"],
                        ["набор данных", "все примеры, на которых учится модель"],
                        ["проверочный набор", "примеры, отложенные для проверки модели"],
                        ["очистка данных", "исправление пропусков, ошибок и повторов"],
                        ["переобучение", "заучивание подробностей обучающих данных вместо правила"]
                    ]
                },
                {
                    type: "explain",
                    text: "Модель для поиска рака кожи отчасти выучила, что «линейка на фото» означает тревожное пятно. Объясни, как это могло случиться и как это можно было заметить.",
                    answer: "Врачи часто фотографируют тревожные пятна рядом с линейкой, поэтому на обучающих фото линейка и тревожное пятно шли вместе. Модель выучила линейку как обходной признак. Проверка на фото без линеек или проверка того, на какие части картинки модель смотрит, показала бы проблему.",
                    lines: 5
                }
            ]
        }
    },

    // ----- Lesson 14: How Apps Choose for You -----
    14: {
        exit: "q67",
        quiz: ["q65", "q66", "m22"],
        en: {
            objectives: [
                "explain what a recommendation system does and name its two big ideas (more of the same, people like you);",
                "list signals an app reads, and explain why actions say more than likes;",
                "explain how a filter bubble forms, and name at least three ways to widen their own feed."
            ],
            warmup: "Open your memory, not your phone: what were the first three things on your video or music app's home page today? Why do you think they were there?",
            warmupNote: "Collect a few answers. Ask whether two students in the class would see the same home page, and why not.",
            reading: "Students look for the two big ideas behind recommendations, five signals an app reads, and three ways to take control of a feed.",
            activity: {
                title: "Mini-lab “What the app sees”",
                steps: [
                    "Students open the mini-lab in lesson 14 and switch on one signal at a time, reading the meter and the guess.",
                    "They fill in the worksheet's table for each combination.",
                    "They switch on “Watched to the end” and “Scrolled away after 2 seconds” together and read what the app says about mixed signals.",
                    "In pairs, they decide which single signal they think real apps trust most, and why."
                ]
            },
            extension: "Fast finishers open “Why your feed looks like that” in the AI Lab. In “The feed bubble”, they run the feed with no surprises, then with 30% surprises, and compare the variety after 40 rounds.",
            discussion: [
                "Apps are usually built to keep you watching. Is that the same as showing you what's good for you?",
                "Is a filter bubble always bad? When might “more of the same” be useful?",
                "Would you like a button that shows why a video was recommended to you? What would you want it to say?",
                "Which of your habits (searching, skipping, watching late) do you think shapes your feed most?"
            ],
            exit: "In one sentence, explain how watching a video to the end changes what you are shown next.",
            easier: "Before the mini-lab, act out a feed: one student is “the app” and shows three picture cards, another “watches” one, and the app shows more of that kind next time.",
            harder: "Students write a short guide for a younger student: “How to get a more varied feed in 5 steps”, using the words signal, recommendation system and filter bubble correctly.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "A model that guesses what you will watch next is a [recommendation] system.",
                        "Recommending what people with tastes like yours enjoyed is called [collaborative] filtering.",
                        "Watching to the end, skipping and searching are all [signals] an app reads.",
                        "When a feed narrows to more and more of the same, it is called a filter [bubble]."
                    ],
                    extra: ["convolution"]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “What the app sees” in lesson 14. Switch on the signals in each row (and only those) and write what the meter says.",
                    table: {
                        head: ["Signals switched on", "The meter says"],
                        rows: [
                            ["Watched to the end", "[More]"],
                            ["Watched to the end + Sent it to a friend", "[Lots more]"],
                            ["Scrolled away after 2 seconds", "[Much less]"],
                            ["Pressed like", "[A bit more]"],
                            ["Watched it at 1 a.m.", "[No change]"]
                        ]
                    },
                    items: [
                        "Which single signal pulls the meter down the most? [Scrolling away after 2 seconds]",
                        "Watching late doesn't change the meter. What does the app guess from it instead? [That you're awake late, so it may show you more videos at night.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["More of the same", "People like you"],
                    items: [
                        ["You watched a cooking video, so here is another cooking video", 0],
                        ["You listened to one band, so here are more songs by that band", 0],
                        ["People who bought this book also bought that one", 1],
                        ["Viewers with a history like yours loved this space video", 1],
                        ["Listeners like you also play this new singer", 1],
                        ["You searched for football boots, so here are more football boots", 0]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Two people using the same app usually see the same home page.", false, "Recommendations are made for each person separately, from their own signals."],
                        ["A long watch usually tells an app more than a like.", true, "What you do is a stronger signal than what you say."],
                        ["Collaborative filtering needs to know what each video is about.", false, "It only needs to know who liked what."],
                        ["Tapping “Not interested” can change your feed.", true, "It is a direct signal to show less of that kind of thing."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["recommendation system", "guesses what you'll like and shows the best guesses first"],
                        ["signal", "something you do that the app learns from"],
                        ["filter bubble", "a feed that narrows to more and more of the same"],
                        ["autoplay", "the next video starts by itself"],
                        ["collaborative filtering", "recommending what similar people liked"]
                    ]
                },
                {
                    type: "explain",
                    text: "Explain, step by step, how a feed can shrink into a filter bubble even though nobody planned it.",
                    answer: "You can only watch what the app shows. Each video you watch is a signal that makes the app show more of the same. So you watch more of it, which sends more of the same signal, and the loop repeats until other topics almost disappear. Searching for new things and tapping “Not interested” break the loop.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "объяснить, что делает рекомендательная система, и назвать две её главные идеи (ещё того же, люди как ты);",
                "перечислить сигналы, которые читает приложение, и объяснить, почему действия говорят больше лайков;",
                "объяснить, как образуется пузырь фильтров, и назвать хотя бы три способа расширить свою ленту."
            ],
            warmup: "Вспомни, не открывая телефон: какие три первые вещи были сегодня на главной странице твоего видео- или музыкального приложения? Почему, как ты думаешь, именно они?",
            warmupNote: "Собрать несколько ответов. Спросить, увидели бы два ученика класса одинаковую главную страницу и почему нет.",
            reading: "Ученики ищут две главные идеи рекомендаций, пять сигналов, которые читает приложение, и три способа взять ленту под контроль.",
            activity: {
                title: "Мини-лаборатория «Что видит приложение»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 14 и включают сигналы по одному, читая шкалу и догадку.",
                    "Заполняют таблицу в рабочем листе для каждого сочетания.",
                    "Включают вместе «Просмотр до конца» и «Пролистывание через 2 секунды» и читают, что приложение говорит о противоречивых сигналах.",
                    "В парах решают, какому одному сигналу, по их мнению, настоящие приложения доверяют больше всего, и почему."
                ]
            },
            extension: "Кто закончил раньше, открывает в лаборатории ИИ «Почему твоя лента такая». В части «Пузырь ленты» запускает ленту без сюрпризов, потом с 30% сюрпризов и сравнивает разнообразие после 40 раундов.",
            discussion: [
                "Приложения обычно сделаны так, чтобы удерживать тебя подольше. Это то же самое, что показывать тебе полезное?",
                "Всегда ли пузырь фильтров — это плохо? Когда «ещё того же» может пригодиться?",
                "Нужна ли тебе кнопка, которая показывает, почему тебе порекомендовали видео? Что она должна говорить?",
                "Какие твои привычки (поиск, пропуски, просмотр допоздна), по-твоему, сильнее всего влияют на ленту?"
            ],
            exit: "Объясни в одном предложении, как досмотр видео до конца меняет то, что тебе покажут дальше.",
            easier: "Перед мини-лабораторией разыграть ленту: один ученик — «приложение» и показывает три карточки с картинками, другой «смотрит» одну, и в следующий раз приложение показывает больше такого.",
            harder: "Ученики пишут короткую памятку для младшего школьника «Как сделать ленту разнообразнее за 5 шагов», правильно используя слова сигнал, рекомендательная система и пузырь фильтров.",
            tasks: [
                {
                    type: "fill",
                    items: [
                        "Модель, которая угадывает, что ты посмотришь дальше, — это [рекомендательная] система.",
                        "Рекомендации того, что понравилось людям с похожими вкусами, называются [коллаборативной] фильтрацией.",
                        "Досмотр до конца, пропуски и поиски — это [сигналы], которые читает приложение.",
                        "Когда лента сжимается до всё большего количества одного и того же, это называется [пузырём] фильтров."
                    ],
                    extra: ["свёрткой"]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Что видит приложение» в уроке 14. Включи сигналы из каждой строки (и только их) и запиши, что показывает шкала.",
                    table: {
                        head: ["Включённые сигналы", "Шкала показывает"],
                        rows: [
                            ["Просмотр до конца", "[Больше]"],
                            ["Просмотр до конца + Отправка другу", "[Намного больше]"],
                            ["Пролистывание через 2 секунды", "[Гораздо меньше]"],
                            ["Лайк", "[Чуть больше]"],
                            ["Просмотр в час ночи", "[Без изменений]"]
                        ]
                    },
                    items: [
                        "Какой один сигнал сильнее всего опускает шкалу? [Пролистывание через 2 секунды]",
                        "Просмотр ночью не меняет шкалу. Что приложение догадывается вместо этого? [Что ты не спишь допоздна, поэтому оно может больше показывать тебе видео ночью.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["Ещё того же", "Люди как ты"],
                    items: [
                        ["После видео о готовке — ещё одно видео о готовке", 0],
                        ["После песен одной группы — ещё песни этой группы", 0],
                        ["Те, кто купил эту книгу, купили и ту", 1],
                        ["Зрителям с похожей на твою историей очень понравилось это видео о космосе", 1],
                        ["Слушатели как ты также включают этого нового певца", 1],
                        ["После поиска футбольных бутс — ещё футбольные бутсы", 0]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Два человека в одном приложении обычно видят одинаковую главную страницу.", false, "Рекомендации делаются для каждого человека отдельно, по его собственным сигналам."],
                        ["Долгий просмотр обычно говорит приложению больше, чем лайк.", true, "То, что ты делаешь, — более сильный сигнал, чем то, что ты говоришь."],
                        ["Коллаборативной фильтрации нужно знать, о чём каждое видео.", false, "Ей нужно знать только, кому что понравилось."],
                        ["Кнопка «Не интересно» может изменить твою ленту.", true, "Это прямой сигнал показывать меньше такого."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["рекомендательная система", "угадывает, что тебе понравится, и показывает лучшие догадки первыми"],
                        ["сигнал", "то, что ты делаешь и на чём учится приложение"],
                        ["пузырь фильтров", "лента, которая сжимается до одного и того же"],
                        ["автовоспроизведение", "следующее видео включается само"],
                        ["коллаборативная фильтрация", "рекомендации того, что понравилось похожим людям"]
                    ]
                },
                {
                    type: "explain",
                    text: "Объясни по шагам, как лента может сжаться в пузырь фильтров, хотя никто этого не планировал.",
                    answer: "Смотреть можно только то, что показывает приложение. Каждое просмотренное видео — сигнал, после которого приложение показывает больше того же. Ты смотришь больше этого, посылаешь ещё больше такого же сигнала, и петля повторяется, пока другие темы почти не исчезнут. Поиск нового и кнопка «Не интересно» разрывают петлю.",
                    lines: 5
                }
            ]
        }
    },

    // ----- Lesson 15: Plan Your Own AI Project -----
    15: {
        exit: "q71",
        quiz: ["q69", "q70", "m23"],
        en: {
            objectives: [
                "decide whether a problem needs AI or a simple rule;",
                "plan the data for a project: varied examples of every answer, with correct labels, and a test set;",
                "explain why one accuracy score isn't enough, and how to be honest with users about a model's limits."
            ],
            warmup: "Think of a small problem at school or at home that annoys you. Could a computer help? Would it need to learn, or just follow a rule?",
            warmupNote: "Write a few problems on the board and sort them together into “a rule is enough” and “it would need examples”. Keep the list for the extension task.",
            reading: "Students look for when AI is worth using, what makes good training examples, and why accuracy can fool you.",
            activity: {
                title: "Mini-lab “Project planner”",
                steps: [
                    "Students open the mini-lab in lesson 15 and read the project: a leaf-health app.",
                    "For each of the four decisions, they discuss the options in pairs before choosing.",
                    "They read the feedback, go back to change any choice marked in orange, and reach the final plan.",
                    "They fill in the worksheet's table with the strong choice for each step, and one sentence on why."
                ]
            },
            extension: "Fast finishers pick a problem from the warm-up that needs examples, and write a one-page plan with the same four decisions: data, labels, testing, and what users are told.",
            discussion: [
                "A model is right 95% of the time. Is that good enough for sorting recycling? For checking medicine doses? Why the difference?",
                "Which is worse for a leaf-health app: calling a sick leaf healthy, or a healthy leaf sick?",
                "Why might a project that works well at home fail in a real school?",
                "Should every AI app say clearly that it is AI? Why?"
            ],
            exit: "In one sentence, explain why a model that always answers “healthy” could still score 95%.",
            easier: "Run the mini-lab together on the projector, voting on each decision with hands up, and reading each piece of feedback aloud.",
            harder: "Students train a real model on their own photos with a free tool such as Teachable Machine, keep some photos aside as a test set, and report the results and the mistakes.",
            tasks: [
                {
                    type: "order",
                    items: [
                        "Pick a real problem",
                        "Check whether a simple rule is enough",
                        "Collect varied examples of every answer",
                        "Put about 1 example in 5 aside as a test set",
                        "Test it and study its mistakes",
                        "Tell users how sure it is and what to do if it is wrong"
                    ]
                },
                {
                    type: "lab",
                    text: "Open the mini-lab “Project planner” in lesson 15. For each decision, write the strong choice.",
                    table: {
                        head: ["Decision", "The strong choice"],
                        rows: [
                            ["Which photos to train on", "[600 photos of many plants, healthy and sick, in different light]"],
                            ["Who decides which leaves are sick", "[A gardener or biology teacher checks the labels]"],
                            ["How to test it", "[On 1 photo in 5, put aside before training]"],
                            ["What to tell users", "[How sure it is, and “ask an expert if it says sick”]"]
                        ]
                    },
                    items: [
                        "Why are 5,000 photos of healthy leaves a bad choice? [There are no sick leaves, so it can never learn what “sick” looks like.]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["A simple rule is enough", "It needs AI (examples)"],
                    items: [
                        ["Turn the lights off at 10 p.m.", 0],
                        ["Paper always goes in the blue bin", 0],
                        ["Tell a sick leaf from a healthy one in a photo", 1],
                        ["Recognise a bird from its song", 1],
                        ["Read a sign-language letter from a hand photo", 1],
                        ["Remind me when a library book is due", 0]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Every project is better with AI than with a simple rule.", false, "If a rule works, it is easier to build, check and explain."],
                        ["Free tools let you train a model on your own photos without writing code.", true, "For example, Google's Teachable Machine runs in the browser."],
                        ["A high accuracy score always means a model is useful.", false, "It can hide that the model misses exactly the cases that matter."],
                        ["Telling users a model can be wrong makes them trust it for the right reasons.", true, "Honesty about limits keeps people safe when it is wrong."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["test set", "examples put aside to check the model"],
                        ["label", "the right answer for an example"],
                        ["accuracy", "the share of answers a model gets right"],
                        ["false positive", "a false alarm: “sick” for a healthy leaf"],
                        ["false negative", "a miss: “healthy” for a sick leaf"]
                    ]
                },
                {
                    type: "explain",
                    text: "Of 100 test leaves, 95 are healthy. A model that always answers “healthy” scores 95%. Explain why it is useless, and what you would check instead.",
                    answer: "It never finds a single sick leaf, which is the whole point of the app. Instead of only the accuracy, I would check how many sick leaves it finds and how many it misses, and make sure the test set has enough sick leaves to tell.",
                    lines: 5
                }
            ]
        },
        ru: {
            objectives: [
                "решать, нужен ли для задачи ИИ или достаточно простого правила;",
                "планировать данные проекта: разнообразные примеры каждого ответа с правильными метками и проверочный набор;",
                "объяснять, почему одной точности мало и как честно говорить пользователям о границах модели."
            ],
            warmup: "Вспомни небольшую проблему в школе или дома, которая тебя раздражает. Мог бы помочь компьютер? Ему пришлось бы учиться или хватило бы правила?",
            warmupNote: "Записать несколько проблем на доске и вместе разделить их на «хватит правила» и «нужны примеры». Сохранить список для задания на расширение.",
            reading: "Ученики ищут, когда стоит использовать ИИ, какими должны быть хорошие обучающие примеры и почему точность может обмануть.",
            activity: {
                title: "Мини-лаборатория «Планировщик проекта»",
                steps: [
                    "Ученики открывают мини-лабораторию в уроке 15 и читают проект: приложение для проверки здоровья листьев.",
                    "Для каждого из четырёх решений сначала обсуждают варианты в парах, потом выбирают.",
                    "Читают отзыв, возвращаются и меняют решения, отмеченные оранжевым, и доходят до итогового плана.",
                    "Заполняют таблицу в рабочем листе: сильный выбор для каждого шага и одно предложение — почему."
                ]
            },
            extension: "Кто закончил раньше, выбирает из разминки задачу, которой нужны примеры, и пишет план на одну страницу с теми же четырьмя решениями: данные, метки, проверка и что сказать пользователям.",
            discussion: [
                "Модель права в 95% случаев. Достаточно ли этого для сортировки мусора? А для проверки доз лекарств? В чём разница?",
                "Что хуже для приложения о листьях: назвать больной лист здоровым или здоровый — больным?",
                "Почему проект, который хорошо работает дома, может не сработать в настоящей школе?",
                "Должно ли каждое ИИ-приложение ясно говорить, что оно — ИИ? Почему?"
            ],
            exit: "Объясни в одном предложении, почему модель, которая всегда отвечает «здоров», может получить 95%.",
            easier: "Пройти мини-лабораторию вместе на проекторе: голосовать за каждое решение поднятием рук и читать каждый отзыв вслух.",
            harder: "Ученики обучают настоящую модель на своих фото в бесплатном инструменте вроде Teachable Machine, откладывают часть фото для проверки и рассказывают о результатах и ошибках.",
            tasks: [
                {
                    type: "order",
                    items: [
                        "Выбрать настоящую задачу",
                        "Проверить, не хватит ли простого правила",
                        "Собрать разнообразные примеры каждого ответа",
                        "Отложить примерно каждый пятый пример для проверки",
                        "Проверить её и изучить ошибки",
                        "Сказать пользователям, насколько она уверена и что делать, если она ошибается"
                    ]
                },
                {
                    type: "lab",
                    text: "Открой мини-лабораторию «Планировщик проекта» в уроке 15. Для каждого решения запиши сильный выбор.",
                    table: {
                        head: ["Решение", "Сильный выбор"],
                        rows: [
                            ["На каких фото обучать", "[600 фото разных растений, здоровых и больных, при разном освещении]"],
                            ["Кто решает, какие листья больны", "[Метки проверит садовник или учитель биологии]"],
                            ["Как проверять", "[На каждом пятом фото, отложенном до обучения]"],
                            ["Что сказать пользователям", "[Насколько оно уверено и «если болен — спроси специалиста»]"]
                        ]
                    },
                    items: [
                        "Почему 5000 фото здоровых листьев — плохой выбор? [Там нет больных листьев, поэтому модель никогда не узнает, как выглядит «болен».]"
                    ]
                },
                {
                    type: "sort",
                    groups: ["Хватит простого правила", "Нужен ИИ (примеры)"],
                    items: [
                        ["Выключать свет в 10 вечера", 0],
                        ["Бумага всегда идёт в синий контейнер", 0],
                        ["Отличить больной лист от здорового по фото", 1],
                        ["Узнать птицу по её песне", 1],
                        ["Прочитать букву жестового языка по фото руки", 1],
                        ["Напомнить, когда сдавать библиотечную книгу", 0]
                    ]
                },
                {
                    type: "truefalse",
                    items: [
                        ["Любой проект лучше сделать с ИИ, чем с простым правилом.", false, "Если правило работает, его легче сделать, проверить и объяснить."],
                        ["Бесплатные инструменты позволяют обучить модель на своих фото без кода.", true, "Например, Teachable Machine от Google работает прямо в браузере."],
                        ["Высокая точность всегда означает, что модель полезна.", false, "Она может скрывать, что модель пропускает как раз важные случаи."],
                        ["Если сказать пользователям, что модель может ошибаться, они будут доверять ей по правильным причинам.", true, "Честность о границах защищает людей, когда модель ошибается."]
                    ]
                },
                {
                    type: "match",
                    pairs: [
                        ["проверочный набор", "примеры, отложенные для проверки модели"],
                        ["метка", "правильный ответ для примера"],
                        ["точность", "доля верных ответов модели"],
                        ["ложное срабатывание", "ложная тревога: «болен» для здорового листа"],
                        ["пропуск", "ошибка: «здоров» для больного листа"]
                    ]
                },
                {
                    type: "explain",
                    text: "Из 100 проверочных листьев 95 здоровы. Модель, которая всегда отвечает «здоров», получает 95%. Объясни, почему она бесполезна и что стоило бы проверить вместо этого.",
                    answer: "Она не находит ни одного больного листа, а ради этого приложение и делают. Вместо одной точности я бы проверил, сколько больных листьев она находит и сколько пропускает, и убедился бы, что в проверочном наборе достаточно больных листьев.",
                    lines: 5
                }
            ]
        }
    }
});
