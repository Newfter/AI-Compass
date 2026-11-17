/* =========================================================
   AI COMPASS — GUIDED COURSE: USE AI WELL
   A stage of "My path" for everyone who uses a chatbot: four guided
   steps about working with AI, not about how it is built.
     s1  Ask so that AI understands
     s2  Check before you trust
     s3  A tutor, not a ghostwriter
     s4  Keep yourself safe
   The screens are shown one by one by js/learn-play.js. How a screen is
   written is explained at the top of js/content/courses/zero.js:
   - in a "choice", the FIRST option is the right one;
   - "card": the task also becomes a card of the memory check, and two of
     them ("probes" in js/content/learn.js) are asked by the level check.
     A card must make sense alone;
   - "prompts" (on an info screen): ready requests for a chatbot, each
     shown in a box with a Copy button: [{ label, text }]. The learner
     fills in what stands in [square brackets].
   No chatbot, company or product is named in this course, on purpose:
   the habits it teaches work with any of them.
   The names of the steps are in js/content/learn.js ("learn.unit.s1"...).
   ========================================================= */

window.AICompass.content.set("course.skills", {
    units: {
        /* ----- s1. Ask so that AI understands ----- */
        s1: {
            steps: [
                {
                    type: "info", icon: "💬",
                    en: {
                        title: "A chatbot cannot read your mind",
                        text: [
                            "A chatbot is a program that answers your messages. It has learned a lot about the world from a huge amount of text, but it does not know you. It cannot see your homework, and it does not know how old you are or what you already know.",
                            "It has only your words, so everything it needs must be in your message. A message to a chatbot is called a **prompt**: it is your request, the thing you ask it to do."
                        ],
                        note: "Most chatbots have a minimum age. Often it is 13, and under 18 you may need a parent's permission. If you are under the minimum age, use a chatbot only together with an adult."
                    },
                    ru: {
                        title: "Чат-бот не умеет читать мысли",
                        text: [
                            "Чат-бот — это программа, которая отвечает на твои сообщения. Он многое узнал о мире из огромного количества текстов, но тебя он не знает. Он не видит твоего домашнего задания и понятия не имеет, сколько тебе лет и что ты уже знаешь.",
                            "У него есть только твои слова, поэтому всё нужное должно быть в твоём сообщении. Сообщение чат-боту называют **запросом**: это твоя просьба, то, что ему нужно сделать. По-английски запрос — prompt, поэтому говорят и «промпт»."
                        ],
                        note: "Большинством чат-ботов можно пользоваться только с определённого возраста. Часто это 13 лет, а до 18 может понадобиться разрешение родителей. Если тебе меньше лет, чем нужно, пользуйся чат-ботом только вместе со взрослым."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "You need help with a school talk about volcanoes. Which request is most likely to get a useful answer?",
                        options: [
                            "“I am 12. I am giving a 3-minute talk on volcanoes to my class. Give me 5 surprising facts in simple words.”",
                            "“Tell me about volcanoes.”",
                            "“Hello!!! Please, please help me! I need something very, very good about volcanoes. Thank you so much!!!”",
                            "“Write something good about volcanoes.”"
                        ],
                        hint: "Imagine you are the chatbot. Which message tells you exactly what is needed?",
                        why: "The best request says who is asking and why, what to do and how the answer should look. The long polite one has many words, but it still does not say exactly what is needed. Being polite is fine, but it is not enough."
                    },
                    ru: {
                        q: "Тебе нужна помощь со школьным докладом о вулканах. На какой запрос чат-бот, скорее всего, даст полезный ответ?",
                        options: [
                            "«Мне 12 лет. Готовлю для класса доклад о вулканах на 3 минуты. Напиши 5 удивительных фактов простыми словами»",
                            "«Расскажи о вулканах»",
                            "«Привет!!! Пожалуйста, помоги мне! Мне нужно что-нибудь очень-очень хорошее о вулканах. Спасибо большое!!!»",
                            "«Напиши что-нибудь хорошее о вулканах»"
                        ],
                        hint: "Представь, что чат-бот — это ты. Из какого сообщения понятно, что именно нужно?",
                        why: "В лучшем запросе сказано, кто спрашивает и зачем, что сделать и в каком виде нужен ответ. В длинном вежливом сообщении слов много, но что именно нужно, из него так и не понять. Вежливость не мешает, но её одной мало."
                    }
                },
                {
                    type: "info", icon: "🧱",
                    en: {
                        title: "Four parts of a good request",
                        text: [
                            "You can build a good request from four parts. Not every request needs all four. But when an answer disappoints you, one of them is often missing.",
                            "Here is one request, split into its parts:"
                        ],
                        example: [
                            "**Context** (who you are and why you need the answer): “I am 10. I am making a birthday card for my grandmother, who loves her garden.”",
                            "**Task** (what the chatbot should do): “Write a poem for her.”",
                            "**Format** (how the answer should look: its length, a list, a table): “Four lines that rhyme.”",
                            "**Limits** (what the chatbot should avoid): “Do not mention her age.”"
                        ],
                        note: "Your age or what you already know is enough to say who you are. Never type your full name, your address or a password into a chatbot.",
                        prompts: [
                            {
                                label: "A request with all four parts. Replace the words in brackets with your own.",
                                text: "I am [who you are] and I need this for [what it is for]. Please [what to do]. Give the answer as [how it should look]. Do not [what not to do]."
                            }
                        ]
                    },
                    ru: {
                        title: "Четыре части хорошего запроса",
                        text: [
                            "Хороший запрос можно собрать из четырёх частей. Все четыре нужны не всегда. Но если ответ разочаровал, часто не хватает одной из них.",
                            "Вот один запрос, разобранный по частям:"
                        ],
                        example: [
                            "**Контекст** (кто ты и зачем тебе ответ): «Мне 10 лет. Я делаю открытку на день рождения бабушке, которая очень любит свой сад».",
                            "**Задача** (что нужно сделать чат-боту): «Напиши для неё стихотворение».",
                            "**Формат** (в каком виде нужен ответ: длина, список, таблица): «Четыре строки в рифму».",
                            "**Ограничения** (чего чат-боту нужно избегать): «Не упоминай её возраст»."
                        ],
                        note: "О себе достаточно написать, сколько тебе лет или что ты уже знаешь. Никогда не пиши чат-боту своё полное имя, адрес или пароль.",
                        prompts: [
                            {
                                label: "Запрос со всеми четырьмя частями. Замени слова в скобках своими.",
                                text: "О себе: [кто ты]. Мне это нужно для [чего]. Пожалуйста, [что сделать]. Ответ нужен такой: [длина и вид]. Не нужно [чего избегать]."
                            }
                        ]
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "Here is one request, line by line. Which part of a request is each line?",
                        pairs: [
                            ["“I am 12 and have a test on Friday”", "Context"],
                            ["“Explain how volcanoes erupt”", "Task"],
                            ["“In 5 short steps”", "Format"],
                            ["“Do not use difficult words”", "Limits"]
                        ],
                        why: "Who is asking and why: context. What to do: task. How the answer should look: format. What to avoid: limits."
                    },
                    ru: {
                        q: "Вот один запрос, разбитый на строки. Какая часть запроса в каждой строке?",
                        pairs: [
                            ["«Мне 12 лет, в пятницу у меня контрольная»", "Контекст"],
                            ["«Объясни, как извергаются вулканы»", "Задача"],
                            ["«В 5 коротких пунктах»", "Формат"],
                            ["«Не используй сложные слова»", "Ограничения"]
                        ],
                        why: "Кто спрашивает и зачем — контекст. Что сделать — задача. В каком виде нужен ответ — формат. Чего избегать — ограничения."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Is the request clear, or too vague? A vague request makes the chatbot guess what you want.",
                        groups: ["Clear", "Too vague"],
                        items: [
                            ["“Explain to a 10-year-old in 5 sentences why the sky is blue”", 0],
                            ["“Help with homework”", 1],
                            ["“Find the grammar mistakes in the text below and explain each one”", 0],
                            ["“Write something interesting”", 1],
                            ["“Make it better”", 1],
                            ["“Give me 3 names for a blog about cats, each no longer than 3 words”", 0]
                        ],
                        why: "A clear request says exactly what to do, and often how long the answer should be and who it is for. A vague one leaves questions unanswered. Which homework? Interesting for whom? Better in what way?"
                    },
                    ru: {
                        q: "Запрос понятный или слишком расплывчатый? Расплывчатый запрос заставляет чат-бота гадать, что тебе нужно.",
                        groups: ["Понятный", "Слишком расплывчатый"],
                        items: [
                            ["«Объясни ребёнку 10 лет в 5 предложениях, почему небо голубое»", 0],
                            ["«Помоги с домашним заданием»", 1],
                            ["«Найди грамматические ошибки в тексте ниже и объясни каждую»", 0],
                            ["«Напиши что-нибудь интересное»", 1],
                            ["«Сделай получше»", 1],
                            ["«Придумай 3 названия для блога о кошках, каждое не длиннее 3 слов»", 0]
                        ],
                        why: "В понятном запросе точно сказано, что сделать, а часто ещё и какой длины нужен ответ и для кого он. Расплывчатый оставляет вопросы без ответа. Какое задание? Интересное для кого? Получше в чём?"
                    }
                },
                {
                    type: "info", icon: "🔁",
                    en: {
                        title: "The first answer is a draft",
                        text: [
                            "Think of a chatbot's first answer as a draft: a first try that can be improved. If it is not what you need, write back: “shorter”, “give an example”, “I did not understand step 2: explain it another way”.",
                            "Inside one chat (one conversation) the chatbot can see the earlier messages, so you do not have to start again. A new chat usually starts from zero."
                        ],
                        example: [
                            "You: What is a fraction?",
                            "Chatbot: A fraction is a ratio of two whole numbers: a numerator and a denominator …",
                            "You: I did not understand “ratio”. I am 9: explain it with a pizza."
                        ]
                    },
                    ru: {
                        title: "Первый ответ — это черновик",
                        text: [
                            "Считай первый ответ чат-бота черновиком — первой попыткой, которую можно улучшить. Если ответ не подходит, напиши об этом: «короче», «приведи пример», «мне непонятен шаг 2, объясни по-другому».",
                            "Внутри одного чата (одного разговора) чат-бот видит предыдущие сообщения, поэтому начинать заново не нужно. А новый чат обычно начинается с нуля."
                        ],
                        example: [
                            "Ты: Что такое дробь?",
                            "Чат-бот: Дробь — это отношение двух целых чисел: числителя и знаменателя …",
                            "Ты: Мне непонятно слово «отношение». Мне 9 лет — объясни на примере пиццы."
                        ]
                    }
                },
                {
                    type: "choice", card: "s1a",
                    en: {
                        q: "A chatbot's explanation is too hard for you. What is the best thing to do next?",
                        options: [
                            "Say which part you did not understand and ask for a simpler explanation with an example",
                            "Send the same question again, word for word, until the answer gets simpler",
                            "Open a new chat and ask the same question there, hoping for a better answer",
                            "Give up: if the first answer was too hard, the chatbot cannot explain it any better"
                        ],
                        hint: "What does the chatbot still not know after its first answer?",
                        why: "When you say what was hard, the chatbot can explain exactly that part in a new way. The same question, in this chat or in a new one, may get a different answer, but the chatbot still does not know what you did not understand."
                    },
                    ru: {
                        q: "Объяснение чат-бота оказалось для тебя слишком сложным. Что лучше всего сделать дальше?",
                        options: [
                            "Написать, что именно непонятно, и попросить объяснить проще и с примером",
                            "Отправлять тот же вопрос слово в слово, пока ответ не станет проще",
                            "Открыть новый чат и задать тот же вопрос там в надежде на ответ получше",
                            "Сдаться: раз первый ответ слишком сложный, проще чат-бот объяснить не сможет"
                        ],
                        hint: "Чего чат-бот всё ещё не знает после своего первого ответа?",
                        why: "Когда ты говоришь, что именно было трудно, чат-бот может по-новому объяснить как раз это место. На тот же вопрос, в этом чате или в новом, может прийти другой ответ, но чат-бот так и не узнает, что тебе было непонятно."
                    }
                },
                {
                    type: "info", icon: "🎯",
                    en: {
                        title: "Two more tricks",
                        text: [
                            "**Show an example** of what you want: “Here is a riddle I like: What has hands but cannot clap? A clock. Write 3 more like it.” The chatbot usually notices the pattern and follows it.",
                            "**Let it ask you first**: “Before you answer, ask me 3 questions about what I need.” Its questions often show what was missing from your request."
                        ]
                    },
                    ru: {
                        title: "Ещё два приёма",
                        text: [
                            "**Покажи пример** того, что тебе нужно: «Вот загадка, которая мне нравится: зимой и летом одним цветом (ёлка). Напиши ещё 3 такие же». Чат-бот обычно замечает, как устроен пример, и пишет по тому же образцу.",
                            "**Пусть сначала спросит тебя**: «Прежде чем отвечать, задай мне 3 вопроса о том, что мне нужно». Его вопросы часто показывают, чего не хватало в твоём запросе."
                        ]
                    }
                },
                {
                    type: "choice", card: "s1b",
                    en: {
                        q: "Look at this request: “I am 12 and I am preparing a talk for my class. Explain what a black hole is. Do not use formulas.” Which part of a good request is missing?",
                        options: [
                            "The format: how the answer should look",
                            "The context: who is asking and why",
                            "The task: what the chatbot should do",
                            "The limits: what the chatbot should avoid"
                        ],
                        hint: "Read the request sentence by sentence and name the part each one gives. Which part gets no sentence?",
                        why: "The four parts are context, task, format and limits. This request has context (12, a talk for the class), a task (explain) and a limit (no formulas). It does not say how long the answer should be or what form it should take."
                    },
                    ru: {
                        q: "Посмотри на запрос: «Мне 12 лет, я готовлю доклад для класса. Объясни, что такое чёрная дыра. Не используй формулы». Какой части хорошего запроса в нём не хватает?",
                        options: [
                            "Формата: в каком виде нужен ответ",
                            "Контекста: кто спрашивает и зачем",
                            "Задачи: что чат-боту нужно сделать",
                            "Ограничений: чего чат-боту избегать"
                        ],
                        hint: "Прочитай запрос по предложениям и про каждое скажи, какая это часть. Какой части не досталось ни одного предложения?",
                        why: "Четыре части — это контекст, задача, формат и ограничения. Здесь есть контекст (12 лет, доклад для класса), задача (объясни) и ограничение (без формул). А какой длины и в каком виде нужен ответ, не сказано."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Why can the same question get a different answer each time?",
                        answer: [
                            "A chatbot does not keep ready-made answers. It writes a new one each time, word by word, and its choice of words is a little random.",
                            "That helps when you want ideas, such as a name or the first line of a story: ask again, or ask for three versions and choose the best one.",
                            "It also means that two answers can disagree. So an answer is not automatically a fact: the next step of your path is about that."
                        ]
                    },
                    ru: {
                        q: "Почему на один и тот же вопрос чат-бот может каждый раз отвечать по-разному?",
                        answer: [
                            "У чат-бота нет готовых ответов. Он каждый раз пишет новый, слово за словом, и выбирает слова немного случайно.",
                            "Это удобно, когда нужны идеи, например название или первая строчка рассказа: спроси ещё раз или попроси три варианта и выбери лучший.",
                            "А ещё это значит, что два ответа могут противоречить друг другу. Так что ответ чат-бота — ещё не факт. Об этом — следующий шаг твоего пути."
                        ]
                    }
                },
                {
                    type: "choice", card: "s1c",
                    en: {
                        q: "You want a chatbot to write quiz questions in exactly the style your teacher uses. What is the best thing to do?",
                        options: [
                            "Give it one of your teacher's questions as an example",
                            "Write “in my teacher's style” and nothing more",
                            "Write the whole request in capital letters",
                            "Ask the same thing in several chats"
                        ],
                        hint: "The chatbot has never met your teacher. How can it find out what the questions look like?",
                        why: "The chatbot does not know your teacher, so “in my teacher's style” tells it nothing. One real example shows the style, and the chatbot can follow the pattern. Capital letters and new chats add no information."
                    },
                    ru: {
                        q: "Ты хочешь, чтобы чат-бот составил вопросы для теста точно в стиле твоего учителя. Что лучше всего сделать?",
                        options: [
                            "Дать чат-боту один вопрос учителя как образец",
                            "Написать «в стиле моего учителя» и больше ничего",
                            "Написать весь запрос заглавными буквами",
                            "Отправить тот же запрос в несколько чатов"
                        ],
                        hint: "Чат-бот никогда не видел твоего учителя. Откуда ему узнать, как выглядят его вопросы?",
                        why: "Чат-бот не знает твоего учителя, поэтому слова «в стиле моего учителя» ему ничего не говорят. Один настоящий пример показывает стиль, и чат-бот может писать по этому образцу. От заглавных букв и новых чатов он больше знать не станет."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A chatbot cannot read your mind. Put everything it needs into your request (your **prompt**).",
                            "Build a request from four parts: **context**, **task**, **format** and **limits**. When an answer disappoints you, look for the missing one.",
                            "The first answer is a draft. Write back and say exactly what to change.",
                            "Show an example of what you want, or let the chatbot ask you questions first."
                        ]
                    },
                    ru: {
                        points: [
                            "Чат-бот не умеет читать мысли. Всё, что ему нужно, должно быть в твоём **запросе**.",
                            "Собирай запрос из четырёх частей: это **контекст**, **задача**, **формат** и **ограничения**. Если ответ разочаровал, ищи ту, которой не хватает.",
                            "Первый ответ — это черновик. Отвечай чат-боту и говори, что именно изменить.",
                            "Покажи пример того, что тебе нужно, или попроси чат-бота сначала задать тебе вопросы."
                        ]
                    }
                }
            ]
        },

        /* ----- s2. Check before you trust ----- */
        s2: {
            steps: [
                {
                    type: "info", icon: "🎭",
                    en: {
                        title: "Fluent is not the same as true",
                        text: [
                            "A chatbot's answers are fluent: they are easy to read and sound confident. Inside a chatbot is a **language model**. It learned from a huge amount of text, and it writes an answer by guessing which word comes next, again and again.",
                            "It does not lie on purpose. It simply has no built-in check for truth. So a wrong date, a book that does not exist or a made-up quote can sound just as confident as a true fact.",
                            "A confident answer that is made up or wrong is called a **hallucination**."
                        ],
                        note: "A chatbot is often right. That is exactly why its mistakes are easy to miss."
                    },
                    ru: {
                        title: "Складно — не значит верно",
                        text: [
                            "Чат-бот отвечает складно: текст читается легко и звучит уверенно. Внутри у него работает **языковая модель**. Она училась на огромном количестве текстов и пишет ответ так: снова и снова угадывает, какое слово идёт дальше.",
                            "Она не обманывает нарочно. В ней просто нет проверки на правду. Поэтому неверная дата, несуществующая книга или выдуманная цитата могут звучать так же уверенно, как настоящий факт.",
                            "Уверенный ответ, который выдуман или неверен, называется **галлюцинацией**."
                        ],
                        note: "Чат-бот часто отвечает верно. Как раз поэтому его ошибки легко пропустить."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A chatbot gives you a quote, with the author's name and the year. What do these exact details prove?",
                        options: ["Nothing yet: a model can make up a name, a year and a quote", "The quote is real: made-up quotes never have exact details", "The chatbot found this quote in a book or on some website", "The author really said this, though maybe in other words"],
                        hint: "Think about how a language model writes. Does it look for the quote in a book, or does it guess words that fit?",
                        why: "A name and a year are just what you expect next to a quote, so a model can write them even when the quote is made up. Exact details make an answer look checked, but they prove nothing until you find the quote in a real book or article."
                    },
                    ru: {
                        q: "Чат-бот приводит цитату, называет автора и год. Что доказывают такие точные детали?",
                        options: ["Пока ничего: модель может выдумать и имя, и год, и цитату", "Цитата настоящая: у выдуманных не бывает таких точных деталей", "Чат-бот нашёл эту цитату в какой-то книге или на сайте", "Автор и правда это говорил, пусть даже другими словами"],
                        hint: "Вспомни, как пишет языковая модель. Она ищет цитату в книге или угадывает подходящие слова?",
                        why: "Имя и год — как раз то, что ждёшь увидеть рядом с цитатой, поэтому модель может написать их, даже если цитата выдумана. С точными деталями ответ выглядит проверенным, но они ничего не доказывают, пока не найдёшь цитату в настоящей книге или статье."
                    }
                },
                {
                    type: "info", icon: "🧪",
                    en: {
                        title: "Three quick checks",
                        text: ["A **source** is where a fact comes from: a book, an article, a website. When a fact from a chatbot matters to you, use three checks:"],
                        example: [
                            "1. **Ask for the source** and open it yourself.",
                            "2. **Find a second source** that does not just repeat the first: a textbook, an encyclopedia, an official website.",
                            "3. **Ask yourself: can this be true?** Estimate it with numbers you know."
                        ],
                        note: "Another chatbot is not a second source: it guesses words too.",
                        prompts: [{ label: "Ask for the source", text: "Where does this come from? Name the source so that I can open it and check. If you are not sure, say so." }]
                    },
                    ru: {
                        title: "Три быстрые проверки",
                        text: ["**Источник** — это то, откуда взят факт: книга, статья, сайт. Если факт от чат-бота для тебя важен, сделай три проверки:"],
                        example: [
                            "1. **Попроси назвать источник** и открой его: посмотри своими глазами.",
                            "2. **Найди второй источник**, который не просто повторяет первый: учебник, энциклопедию, официальный сайт.",
                            "3. **Спроси себя: может ли это быть правдой?** Прикинь по числам, которые знаешь."
                        ],
                        note: "Другой чат-бот — не второй источник: он тоже угадывает слова.",
                        prompts: [{ label: "Спроси про источник", text: "Откуда эта информация? Назови источник, чтобы можно было открыть его и проверить. Если точно не знаешь, так и скажи." }]
                    }
                },
                {
                    type: "number", answer: 900, card: "s2a",
                    en: {
                        q: "A chatbot says: “A person takes about 100,000 breaths every hour.” Check it. A calm adult takes about 15 breaths a minute. How many breaths is that in one hour?",
                        hint: "How many minutes are there in one hour?",
                        why: "15 × 60 = 900 breaths in an hour. The chatbot's number is more than a hundred times bigger, so it cannot be right. An estimate with numbers you know catches a mistake like this in seconds."
                    },
                    ru: {
                        q: "Чат-бот пишет: «Человек делает около 100 000 вдохов в час». Проверь. Взрослый в покое делает примерно 15 вдохов в минуту. Сколько это вдохов за один час?",
                        hint: "Сколько минут в одном часе?",
                        why: "15 × 60 = 900 вдохов в час. Число чат-бота больше в сто с лишним раз, значит, оно не может быть верным. Прикидка по знакомым числам ловит такую ошибку за несколько секунд."
                    }
                },
                {
                    type: "info", icon: "⚖️",
                    en: {
                        title: "The more harm a mistake can do, the more you check",
                        text: [
                            "You do not have to check everything. Ask yourself one question: what happens if this answer is wrong?",
                            "A name for a cat: nothing happens, so use it as it is. A fact for a school report: a mistake would spoil your work, so check it.",
                            "Health, money, the law, safety: a mistake can do real harm. Never rely on a chatbot alone here. Ask a doctor, another specialist or an adult you trust."
                        ]
                    },
                    ru: {
                        title: "Чем больше вреда от ошибки, тем строже проверка",
                        text: [
                            "Проверять всё подряд не нужно. Задай себе один вопрос: что случится, если этот ответ неверный?",
                            "Кличка для кота: ничего не случится, бери как есть. Факт для школьного доклада: ошибка испортит работу, так что проверь его.",
                            "Здоровье, деньги, законы, безопасность: ошибка может навредить всерьёз. Здесь нельзя полагаться только на чат-бота. Спроси врача, другого специалиста или взрослого, которому доверяешь."
                        ]
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Here are things you might ask a chatbot. What do you do with its answer each time?",
                        groups: ["Use it as it is", "Check it first", "Ask a specialist"],
                        items: [
                            ["A name for your cat", 0],
                            ["A date for a history report", 1],
                            ["How much medicine to take", 2],
                            ["A rhyme for a birthday card", 0],
                            ["The number of people in a country, for a presentation", 1],
                            ["Whether a wild mushroom is safe to eat", 2]
                        ],
                        why: "A name or a rhyme cannot be false: you only decide whether you like it. A date and a number are facts, so you check them in a source. With medicine and wild mushrooms a mistake can harm you, so the answer must come from a doctor or another person who knows."
                    },
                    ru: {
                        q: "Вот о чём можно спросить чат-бота. Что делать с его ответом в каждом случае?",
                        groups: ["Брать как есть", "Сначала проверить", "Спросить специалиста"],
                        items: [
                            ["Кличка для кота", 0],
                            ["Дата для доклада по истории", 1],
                            ["Сколько лекарства принять", 2],
                            ["Рифма для открытки ко дню рождения", 0],
                            ["Число жителей страны для презентации", 1],
                            ["Можно ли есть гриб, найденный в лесу", 2]
                        ],
                        why: "Кличка и рифма не бывают неверными: важно только, нравятся ли они тебе. Дата и число жителей — это факты, их проверяют по источнику. А с лекарствами и лесными грибами ошибка может навредить, поэтому тут нужен ответ врача или другого знающего человека."
                    }
                },
                {
                    type: "info", icon: "🔗",
                    en: {
                        title: "A source can be made up too",
                        text: [
                            "Ask for a source, and a chatbot will often name one. But it writes the title of a book or a web address the same way as everything else: by guessing what comes next. So a link may lead to a page that does not exist, or to a page that says something else.",
                            "Some chatbots can search the web and show real links. That is better, but your job stays the same: open the page and find the fact there. If it is not there, the fact is still not checked."
                        ],
                        note: "If a page looks strange, or asks for a password or for money, close it and tell an adult you trust."
                    },
                    ru: {
                        title: "Источник тоже можно выдумать",
                        text: [
                            "Попроси источник — и чат-бот часто его назовёт. Но название книги или адрес сайта он пишет так же, как всё остальное: угадывает, что идёт дальше. Поэтому ссылка может вести на страницу, которой нет, или на страницу, где написано другое.",
                            "Некоторые чат-боты умеют искать в интернете и показывают настоящие ссылки. Это лучше, но твоя задача прежняя: открыть страницу и найти там этот факт. Если его там нет, факт пока не проверен."
                        ],
                        note: "Если страница выглядит странно, требует пароль или просит денег, закрой её и расскажи взрослому, которому доверяешь."
                    }
                },
                {
                    type: "choice", card: "s2b",
                    en: {
                        q: "A chatbot gives you a fact and a link to its source. What is the best way to check the fact?",
                        options: ["Open the link and see whether the page really says this", "Ask the chatbot “Are you sure?” and trust its second answer", "Look at the address: if it looks official, the fact is true", "Count the details: the more there are, the truer the answer is"],
                        hint: "The chatbot wrote both the fact and the link. Which check looks at something the chatbot did not write?",
                        why: "A chatbot can make up a link, and a real link can lead to a page that says something else. Only the page itself shows what it says. An official-looking address and many details prove nothing, and “Are you sure?” only brings more words from the same chatbot."
                    },
                    ru: {
                        q: "Чат-бот сообщает факт и даёт ссылку на источник. Как лучше всего проверить этот факт?",
                        options: ["Открыть ссылку и посмотреть, правда ли там так написано", "Спросить чат-бота «Это точно?» и поверить второму ответу", "Посмотреть на адрес: если он выглядит официально, факт верный", "Посчитать детали: чем их больше, тем правдивее ответ"],
                        hint: "И факт, и ссылку написал чат-бот. Какая из проверок опирается на то, что написал не он?",
                        why: "Ссылку чат-бот может выдумать, а настоящая ссылка может вести на страницу, где написано другое. Что там на самом деле, покажет только сама страница. Официальный на вид адрес и множество деталей ничего не доказывают, а на вопрос «Это точно?» отвечает всё тот же чат-бот."
                    }
                },
                {
                    type: "reveal", icon: "🤔",
                    en: {
                        q: "Why not simply ask the chatbot: “Are you sure?”",
                        answer: [
                            "Because it writes this reply the same way as the first one: by guessing what comes next. How confident it sounds does not tell you whether it is true.",
                            "It may find a real mistake. But it may also apologise and change a right answer to a wrong one, or repeat the mistake just as confidently. From inside the chat you cannot tell which happened.",
                            "A real check comes from outside the chat: a source you open, a calculation you do, a person who knows."
                        ]
                    },
                    ru: {
                        q: "Почему бы просто не спросить чат-бота: «Это точно?»",
                        answer: [
                            "Потому что этот ответ он пишет так же, как и первый: угадывает, что идёт дальше. По тому, как уверенно звучит текст, нельзя понять, правда ли это.",
                            "Иногда он и правда находит ошибку. Но бывает, что он извиняется и меняет верный ответ на неверный или так же уверенно повторяет ошибку. Изнутри чата не понять, какой из этих случаев тебе достался.",
                            "Настоящая проверка — за пределами чата: источник, который можно открыть, расчёт, который можно сделать, человек, который в этом разбирается."
                        ]
                    }
                },
                {
                    type: "choice", card: "s2c",
                    en: {
                        q: "What is a “hallucination” of an AI model?",
                        options: ["An answer that sounds confident but is made up or wrong", "A lie that a chatbot tells you on purpose, to trick you", "A picture that a model draws when you ask it for one", "A virus that gets into a chatbot and stops it working"],
                        why: "A language model writes the words that are likely to come next and has no built-in check for truth. So a made-up fact, quote or source can come out in the same confident voice as a true one. The model has no plan to trick you, and nothing is broken."
                    },
                    ru: {
                        q: "Что такое «галлюцинация» модели ИИ?",
                        options: ["Ответ, который звучит уверенно, но выдуман или неверен", "Ложь, которую чат-бот говорит нарочно, чтобы тебя обмануть", "Картинка, которую модель рисует, когда её об этом просят", "Вирус, который попадает в чат-бот и мешает ему работать"],
                        why: "Языковая модель пишет слова, которые правдоподобно продолжают текст, а проверки на правду в ней нет. Поэтому выдуманный факт, цитата или источник могут прозвучать так же уверенно, как настоящие. Обманывать тебя модель не собирается, и ничего не сломалось."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "You need a fact for a school report. Put the steps in a sensible order.",
                        items: ["Ask the chatbot for the fact and for its source", "Open that source and find the fact there", "Find the same fact in a second source", "Write it in your own words and name your sources"],
                        hint: "You can open a source only when you know which one it is. And you write last, when the fact is checked.",
                        why: "First the fact and its source, then a look into that source, then a second source. Your own text comes last, so that you write only what you have checked. And when you name your sources, your reader can check you, just as you checked the chatbot."
                    },
                    ru: {
                        q: "Тебе нужен факт для школьного доклада. Расставь шаги в разумном порядке.",
                        items: ["Узнать у чат-бота факт и его источник", "Открыть этот источник и найти в нём факт", "Найти тот же факт во втором источнике", "Записать своими словами и указать источники"],
                        hint: "Открыть источник можно, только когда знаешь, какой именно. А писать стоит в самом конце, когда факт проверен.",
                        why: "Сначала факт и его источник, потом проверка по этому источнику, потом второй источник. Свой текст — в самом конце, чтобы в него попало только проверенное. А когда источники указаны, читатель может проверить тебя так же, как ты проверяешь чат-бота."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Fluent is not the same as true. A confident answer that is made up or wrong is called a **hallucination**.",
                            "Three checks: ask for the source and open it, find a second source, and ask yourself whether this can be true.",
                            "The more harm a mistake can do, the more you check. For health, money, the law and safety, ask a specialist or an adult you trust.",
                            "A real check comes from outside the chat: a source, a calculation, a person who knows."
                        ]
                    },
                    ru: {
                        points: [
                            "Складно — не значит верно. Уверенный ответ, который выдуман или неверен, называется **галлюцинацией**.",
                            "Три проверки: попросить источник и открыть его, найти второй источник, спросить себя, может ли это быть правдой.",
                            "Чем больше вреда от ошибки, тем строже проверка. Когда речь о здоровье, деньгах, законах или безопасности, спроси специалиста или взрослого, которому доверяешь.",
                            "Настоящая проверка — за пределами чата: источник, расчёт, знающий человек."
                        ]
                    }
                }
            ]
        },

        /* ----- s3. A tutor, not a ghostwriter ----- */
        s3: {
            steps: [
                {
                    type: "info", icon: "✍️",
                    en: {
                        title: "Two ways to use a chatbot for learning",
                        text: [
                            "You can use a chatbot as a **ghostwriter**: someone who writes instead of you. You type “Write my essay”, and a finished text appears. Now you have a text, but your brain has had almost no practice.",
                            "Or you can use it as a **tutor**: a teacher who works with one student at a time, asks questions, gives hints and explains mistakes. You type “Ask me questions until I understand.”",
                            "The second way is slower. But it is the one that builds your own skill, because the thinking stays with you."
                        ],
                        note: "Sometimes you only need a result: a packing list for a trip, a name for a pet. Then it is fine to let a chatbot do the work. Here we talk about the times when the goal is to learn."
                    },
                    ru: {
                        title: "Два способа пользоваться чат-ботом в учёбе",
                        text: [
                            "Первый способ: чат-бот — **тот, кто пишет за тебя**. Просишь: «Напиши за меня сочинение» — и появляется готовый текст. Текст у тебя есть, а вот мозг почти не тренировался.",
                            "Второй способ: чат-бот — **репетитор**, то есть учитель, который занимается с одним учеником, задаёт вопросы, подсказывает и объясняет ошибки. Просишь: «Задавай мне вопросы, пока я не пойму».",
                            "С репетитором выходит медленнее. Зато именно так растёт твоё собственное умение, ведь думаешь по-прежнему ты."
                        ],
                        note: "Иногда нужен только результат: список вещей в поездку, кличка для питомца. Тогда пусть работу делает чат-бот — это нормально. Здесь речь о случаях, когда цель — научиться."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Tutor or ghostwriter? What does each request turn the chatbot into?",
                        groups: ["Tutor", "Ghostwriter"],
                        items: [
                            ["“Give me a hint, not the answer”", 0],
                            ["“Write my essay about spring”", 1],
                            ["“Quiz me on fractions, one question at a time”", 0],
                            ["“Solve these 10 problems so that I can copy them”", 1],
                            ["“Rewrite this so that the teacher thinks I wrote it”", 1],
                            ["“Here is my solution: where is my mistake?”", 0]
                        ],
                        why: "After a tutor request the thinking is still yours: you solve, you answer, you correct. After a ghostwriter request the thinking has been done for you, and all that is left is to copy."
                    },
                    ru: {
                        q: "Репетитор или тот, кто пишет за тебя? Кем становится чат-бот после каждого запроса?",
                        groups: ["Репетитор", "Пишет за тебя"],
                        items: [
                            ["«Дай подсказку, а не ответ»", 0],
                            ["«Напиши за меня сочинение о весне»", 1],
                            ["«Проверь меня по дробям: задавай по одному вопросу»", 0],
                            ["«Реши эти 10 задач, а я всё перепишу»", 1],
                            ["«Перепиши это так, чтобы учитель поверил, что текст мой»", 1],
                            ["«Вот моё решение. Где у меня ошибка?»", 0]
                        ],
                        why: "Когда чат-бот — репетитор, думаешь по-прежнему ты: решаешь, отвечаешь, исправляешь. А когда он пишет за тебя, всё уже обдумано и остаётся только переписать."
                    }
                },
                {
                    type: "info", icon: "💭",
                    en: {
                        title: "The trap: reading feels like knowing",
                        text: [
                            "A chatbot usually explains clearly, and its answer comes in seconds. You read it, every step makes sense, and it feels as if you know the topic now.",
                            "But following someone else's steps is much easier than finding them yourself. So this feeling can trick you, and it has a name: the **illusion of knowing**.",
                            "There is an honest test. Close the chat, then explain the topic or solve a similar task from memory. What you can do without looking is what you really know."
                        ],
                        note: "This is why this site asks you a question after each new idea, and brings some questions back days later."
                    },
                    ru: {
                        title: "Ловушка: читаешь — и кажется, что знаешь",
                        text: [
                            "Чат-бот обычно объясняет понятно и отвечает за несколько секунд. Читаешь — каждый шаг ясен, и кажется, что тему ты уже знаешь.",
                            "Но следить за чужим объяснением гораздо легче, чем находить каждый шаг без подсказки. У этого обманчивого чувства есть название: **иллюзия знания**.",
                            "Есть честная проверка. Закрой чат, а потом объясни тему или реши похожую задачу по памяти. Что можешь сделать не подглядывая, то ты и знаешь на самом деле."
                        ],
                        note: "Поэтому этот сайт задаёт вопрос после каждой новой мысли, а часть вопросов возвращает через несколько дней."
                    }
                },
                {
                    type: "choice", card: "s3a",
                    en: {
                        q: "You read a chatbot's clear explanation, and everything seems obvious. How can you find out whether you have really learned it?",
                        options: [
                            "Close it and explain the idea from memory, in your own words",
                            "Read the explanation once more, slowly and carefully",
                            "Ask the chatbot: “Have I understood everything correctly?”",
                            "Save the chat so that you can open it again later"
                        ],
                        hint: "Which of these would show you a gap in your knowledge, if there is one?",
                        why: "Only a try without the answer in front of you shows what you can really do. Rereading makes the text familiar, and familiar feels like known: this is the illusion of knowing. The chatbot cannot look into your head, and a saved chat keeps the knowledge in the chat, not in your memory."
                    },
                    ru: {
                        q: "Ты читаешь понятное объяснение чат-бота, и всё кажется очевидным. Как проверить, знаешь ли ты тему на самом деле?",
                        options: [
                            "Закрыть чат и пересказать мысль по памяти, своими словами",
                            "Перечитать объяснение ещё раз, медленно и внимательно",
                            "Спросить чат-бота: «Скажи, я всё правильно понимаю?»",
                            "Сохранить чат, чтобы потом можно было открыть его снова"
                        ],
                        hint: "Что из этого покажет пробел в знаниях, если он есть?",
                        why: "Только когда пробуешь без ответа перед глазами, видно, что ты умеешь на самом деле. От перечитывания текст становится знакомым, а знакомое кажется выученным: это и есть иллюзия знания. Заглянуть тебе в голову чат-бот не может, а сохранённый чат — это знания в чате, но не в твоей памяти."
                    }
                },
                {
                    type: "info", icon: "🧰",
                    en: {
                        title: "Three requests that turn a chatbot into a tutor",
                        text: ["Copy one, put your own words in place of the square brackets and try it. If the chatbot still tells you too much, write back: “Only a hint, please.”"],
                        note: "Even as a tutor, a chatbot can make mistakes. If a hint or a correction looks strange, check it in your textbook or ask your teacher.",
                        prompts: [
                            {
                                label: "A hint, not the answer",
                                text: "I am solving this problem: [the problem]. Do not give me the answer. Give me one small hint and wait for my try."
                            },
                            {
                                label: "Quiz me",
                                text: "Ask me 5 questions about [topic], one at a time. After each of my answers, say what was right and what was missing."
                            },
                            {
                                label: "Check my explanation",
                                text: "Here is how I understand [topic]: [your explanation]. What is right, what is wrong, and what did I miss?"
                            }
                        ]
                    },
                    ru: {
                        title: "Три запроса, которые делают из чат-бота репетитора",
                        text: ["Скопируй любой запрос, впиши своё вместо квадратных скобок и попробуй. Если чат-бот всё равно рассказывает слишком много, напиши ему: «Только подсказку, пожалуйста»."],
                        note: "Чат-бот может ошибаться и в роли репетитора. Если подсказка или исправление выглядят странно, сверься с учебником или спроси учителя.",
                        prompts: [
                            {
                                label: "Подсказка, а не ответ",
                                text: "Я решаю такую задачу: [задача]. Не говори мне ответ. Дай одну небольшую подсказку и подожди, пока я попробую."
                            },
                            {
                                label: "Проверь меня",
                                text: "Задай мне 5 вопросов по теме [тема], по одному. После каждого моего ответа говори, что было верно и чего не хватило."
                            },
                            {
                                label: "Проверь моё объяснение",
                                text: "Вот как я понимаю тему [тема]: [твоё объяснение]. Что здесь верно, что неверно и что упущено?"
                            }
                        ]
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "What does each request give you?",
                        pairs: [
                            ["“I am stuck. Give me one small hint”", "You get past the hard part and solve the rest yourself"],
                            ["“Quiz me, one question at a time”", "You practise pulling answers out of your memory"],
                            ["“Here is my solution. Find my mistake”", "You see where your thinking went wrong"],
                            ["“Explain it with an example from everyday life”", "A hard idea turns into a picture you can imagine"]
                        ],
                        why: "Four kinds of help, and none of them does the work for you. After an explanation, remember the honest test: close it and say the idea in your own words."
                    },
                    ru: {
                        q: "Что даёт тебе каждый запрос?",
                        pairs: [
                            ["«Дальше не получается. Дай одну небольшую подсказку»", "Трудное место позади, а остальное решаешь без подсказок"],
                            ["«Проверь меня: задавай по одному вопросу»", "Тренируешься доставать ответы из памяти"],
                            ["«Вот моё решение. Найди в нём ошибку»", "Видишь, где рассуждение пошло не туда"],
                            ["«Объясни на примере из обычной жизни»", "Сложная мысль превращается в понятную картинку"]
                        ],
                        why: "Четыре вида помощи, и ни один не делает работу за тебя. А после объяснения не забудь про честную проверку: закрой чат и перескажи мысль своими словами."
                    }
                },
                {
                    type: "info", icon: "🤝",
                    en: {
                        title: "Honest use",
                        text: [
                            "Rules about AI differ from school to school, from job to job and even from task to task. One teacher lets you ask a chatbot for comments on your draft. Another wants you to write the whole essay with no AI at all.",
                            "Three questions help you each time:"
                        ],
                        example: [
                            "1. **Is it allowed here?** If you do not know, ask.",
                            "2. **Can I say openly how I used it?** For example: “A chatbot quizzed me before the test.”",
                            "3. **Is the work I hand in really mine?** The words and the main ideas should be yours."
                        ],
                        note: "If you want to hide how you used AI, that is a warning sign."
                    },
                    ru: {
                        title: "Пользоваться честно",
                        text: [
                            "Правила насчёт ИИ везде разные: они зависят от школы, от работы и даже от задания. Один учитель разрешает показать чат-боту черновик и попросить замечания. Другой ждёт, что ты напишешь всё сочинение совсем без ИИ.",
                            "Каждый раз помогают три вопроса:"
                        ],
                        example: [
                            "1. **Здесь это разрешено?** Если не знаешь, спроси.",
                            "2. **Могу ли я открыто сказать, как мне помогал ИИ?** Например: «Перед контрольной чат-бот задавал мне вопросы».",
                            "3. **Работа, которую я сдаю, действительно моя?** Слова и главные мысли в ней должны быть твоими."
                        ],
                        note: "Если хочется скрыть, как ты пользуешься ИИ, — это тревожный знак."
                    }
                },
                {
                    type: "choice", card: "s3b",
                    en: {
                        q: "Your teacher has not said whether you may use AI for an essay. What is the honest thing to do?",
                        options: [
                            "Ask the teacher first, and then say openly how you used it",
                            "Use it and say nothing, because nobody has forbidden it",
                            "Let it write the essay, and then change a few of the words",
                            "Use it only in ways that the teacher will not be able to notice"
                        ],
                        hint: "Which of these could you tell your teacher about without leaving anything out?",
                        why: "When a rule is not clear, the honest thing is to ask, not to decide for the teacher. If AI is allowed, say openly how it helped: then you have nothing to hide. Staying silent, changing a few words and using it secretly have one thing in common: you hope the teacher will not find out."
                    },
                    ru: {
                        q: "Учитель не сказал, можно ли пользоваться ИИ, когда пишешь сочинение. Как поступить честно?",
                        options: [
                            "Сначала спросить учителя, а потом открыто рассказать, как помогал ИИ",
                            "Пользоваться и молчать, ведь никто этого не запрещал",
                            "Поручить сочинение ИИ, а потом заменить в нём несколько слов",
                            "Пользоваться только так, чтобы учитель не смог ничего заметить"
                        ],
                        hint: "О каком из этих поступков можно рассказать учителю, ничего не утаивая?",
                        why: "Когда правило неясно, честный поступок — спросить, а не решать за учителя. Если ИИ разрешён, открыто расскажи, как он помог: тогда скрывать нечего. Молчать, заменить несколько слов, пользоваться тайком — у этих поступков общее одно: расчёт на то, что учитель не узнает."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "A chatbot can write an essay in less than a minute. What do you lose if you let it?",
                        answer: [
                            "The practice. At school the essay itself was never the goal. The goal is what happens in your head while you write: you find out what you want to say, choose the words and notice what you do not understand yet.",
                            "A text that you did not write gives you none of this.",
                            "And one day you will need the skill itself: in an exam, at a job interview, in a real conversation. No chatbot will do the thinking for you there."
                        ]
                    },
                    ru: {
                        q: "Чат-бот может написать сочинение меньше чем за минуту. Что ты теряешь, если поручишь это ему?",
                        answer: [
                            "Тренировку. В школе само сочинение никогда не было целью. Цель — то, что происходит в голове, пока пишешь: ты выясняешь, что хочешь сказать, подбираешь слова и замечаешь, чего пока не понимаешь.",
                            "Текст, написанный не тобой, ничего из этого не даёт.",
                            "А однажды понадобится само умение: на экзамене, на собеседовании, в живом разговоре. Там чат-бот за тебя не подумает."
                        ]
                    }
                },
                {
                    type: "order", card: "s3c",
                    en: {
                        q: "You have a hard problem to solve and a chatbot that can help. Put the steps in the order that teaches you the most.",
                        items: [
                            "Try to solve the problem yourself, without the chatbot",
                            "Ask for one hint about the place where you got stuck",
                            "Finish the solution yourself, using the hint",
                            "Ask the chatbot to check your finished solution and explain any mistakes"
                        ],
                        hint: "A hint helps most when you already know where you are stuck. And a check needs a finished solution.",
                        why: "Your own try shows exactly where you are stuck, so a small hint is often enough to get you past that place. The check comes last, when there is a finished solution of your own. Asking for the answer at the start would skip every step that teaches you."
                    },
                    ru: {
                        q: "У тебя трудная задача и чат-бот, который может помочь. Расставь шаги так, чтобы научиться как можно большему.",
                        items: [
                            "Попробовать решить задачу без чат-бота",
                            "Попросить одну подсказку там, где не получается",
                            "С этой подсказкой довести решение до конца своими силами",
                            "Попросить чат-бота проверить готовое решение и объяснить ошибки"
                        ],
                        hint: "Подсказка полезнее всего, когда уже понятно, где именно не получается. А проверить можно только готовое решение.",
                        why: "Собственная попытка показывает, где именно не получается, поэтому небольшой подсказки часто хватает, чтобы пройти это место. Проверка идёт последней, когда уже есть твоё готовое решение. А если сразу попросить ответ, пропадут все шаги, которые чему-то учат."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Which request makes a chatbot work as a tutor?",
                        options: [
                            "“Ask me questions about the water cycle, one at a time, and correct my answers.”",
                            "“Write a one-page report about the water cycle for me.”",
                            "“Summarise the water cycle so that I do not have to read the chapter.”",
                            "“Give me the answers to my homework questions about the water cycle.”"
                        ],
                        hint: "After which request do you still have to think?",
                        why: "Only the request for questions leaves the work to you: you recall, you answer, and the chatbot corrects you. The other three ask for something finished: a report, a summary, the answers. You would get a text, but no practice."
                    },
                    ru: {
                        q: "Какой запрос делает из чат-бота репетитора?",
                        options: [
                            "«Задавай мне по одному вопросу о круговороте воды и поправляй мои ответы»",
                            "«Напиши за меня доклад о круговороте воды на одну страницу»",
                            "«Перескажи коротко параграф о круговороте воды, чтобы мне его не читать»",
                            "«Дай ответы на вопросы из домашнего задания о круговороте воды»"
                        ],
                        hint: "После какого запроса думать всё ещё приходится тебе?",
                        why: "Только просьба задавать вопросы оставляет работу тебе: ты вспоминаешь и отвечаешь, а чат-бот поправляет. В трёх других запросах просят готовое: доклад, пересказ, ответы. Текст у тебя будет, а тренировки не будет."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A chatbot can be a **tutor** or a **ghostwriter**. A tutor request leaves the thinking to you, and that is what builds your skill.",
                            "Reading a clear answer feels like knowing: this is the **illusion of knowing**. So test yourself: close the chat and explain the topic from memory.",
                            "Three tutor requests: “A hint, not the answer”, “Quiz me” and “Check my explanation”.",
                            "Honest use: it is allowed, you can say openly how you used AI, and the work you hand in is really yours."
                        ]
                    },
                    ru: {
                        points: [
                            "Чат-бот может быть **репетитором**, а может **писать за тебя**. С репетитором думаешь по-прежнему ты, и именно так растёт твоё умение.",
                            "Когда читаешь понятный ответ, кажется, что уже знаешь: это **иллюзия знания**. Поэтому проверяй себя: закрой чат и объясни тему по памяти.",
                            "Три запроса, которые делают из чат-бота репетитора: «Подсказка, а не ответ», «Проверь меня» и «Проверь моё объяснение».",
                            "Пользоваться честно: ИИ разрешён, о его помощи можно сказать открыто, и сданная работа действительно твоя."
                        ]
                    }
                }
            ]
        },

        /* ----- s4. Keep yourself safe ----- */
        s4: {
            steps: [
                {
                    type: "info", icon: "🔒",
                    en: {
                        title: "What you type leaves your device",
                        text: [
                            "Most chatbots do not work inside your phone or computer. When you press “Send”, your message travels over the internet to the computers of the company that owns the chatbot.",
                            "There it is usually stored. People who work for the company may read some messages, and your chats may become examples that later AI models learn from. How much of this happens depends on the service and on its settings.",
                            "So treat a chat like a postcard, not like a diary. A postcard has no envelope, so other people can read it too. Type only what you would let a stranger read."
                        ]
                    },
                    ru: {
                        title: "Сообщения уходят с твоего устройства",
                        text: [
                            "Большинство чат-ботов работает не внутри твоего телефона или компьютера. Когда ты нажимаешь «Отправить», сообщение уходит через интернет на компьютеры компании, которой принадлежит чат-бот.",
                            "Там оно обычно хранится. Часть сообщений могут читать сотрудники компании, а твои чаты могут стать примерами, на которых учатся следующие модели ИИ. Что именно из этого происходит, зависит от сервиса и его настроек.",
                            "Поэтому относись к чату как к открытке, а не как к личному дневнику. У открытки нет конверта, так что прочитать её могут и чужие люди. Пиши только то, что не страшно показать постороннему."
                        ]
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Is it safe to send this to a chatbot, or should you never send it?",
                        groups: ["Safe to send", "Never send"],
                        items: [
                            ["A question about volcanoes", 0],
                            ["Your password", 1],
                            ["A maths problem from your textbook", 0],
                            ["Your home address", 1],
                            ["A photo of a passport or a bank card", 1],
                            ["Your own poem about autumn that you want to improve", 0],
                            ["A friend's secret", 1]
                        ],
                        why: "A question, a textbook problem and your own poem have nothing private in them. A password, an address, a document or a bank card can cause real trouble if a stranger gets it. A friend's secret is not yours, so do not share it. If you have already sent something like this, tell an adult you trust, and change the password."
                    },
                    ru: {
                        q: "Это безопасно отправлять чат-боту или нельзя никогда?",
                        groups: ["Безопасно отправлять", "Нельзя никогда"],
                        items: [
                            ["Вопрос о вулканах", 0],
                            ["Твой пароль", 1],
                            ["Задача по математике из учебника", 0],
                            ["Твой домашний адрес", 1],
                            ["Фото паспорта или банковской карты", 1],
                            ["Твоё стихотворение об осени, которое хочется улучшить", 0],
                            ["Секрет друга", 1]
                        ],
                        why: "В вопросе, задаче из учебника и твоём стихотворении нет ничего личного. А пароль, адрес, документ или банковская карта в чужих руках могут обернуться настоящими неприятностями. Секрет друга — не твой: передавать его нельзя. Если что-то из этого уже отправлено, расскажи взрослому, которому доверяешь, а пароль смени."
                    }
                },
                {
                    type: "choice", card: "s4a",
                    en: {
                        q: "Which of these is safe to send to a chatbot?",
                        options: [
                            "A paragraph of your own essay about rivers",
                            "The password to your email account",
                            "Your full name, home address and school",
                            "Screenshots of a friend's private messages"
                        ],
                        hint: "Which one has nothing private in it: nothing about you and nothing about anyone else?",
                        why: "What you send to a chatbot is usually stored on a company's computers, and people who work there may read some of it. An essay about rivers has nothing private in it. A password, your name with your address, and a friend's private messages must stay out of a chat."
                    },
                    ru: {
                        q: "Что из этого безопасно отправить чат-боту?",
                        options: [
                            "Абзац из твоего сочинения о реках",
                            "Пароль от твоей электронной почты",
                            "Твои имя и фамилию, домашний адрес и школу",
                            "Скриншоты личной переписки друга"
                        ],
                        hint: "В каком из вариантов нет ничего личного — ни о тебе, ни о других людях?",
                        why: "Всё, что ты отправляешь чат-боту, обычно хранится на компьютерах компании, и часть сообщений могут читать её сотрудники. В сочинении о реках нет ничего личного. А паролю, имени вместе с адресом и личной переписке друга в чате не место."
                    }
                },
                {
                    type: "info", icon: "🎭",
                    en: {
                        title: "Seeing is no longer proof",
                        text: [
                            "AI can make a photo, a video or a voice recording of something that never happened. For example, a real person “says” words they never said. A fake like this is called a **deepfake**. A short recording can be enough to copy a voice.",
                            "Some fakes have mistakes you can see: strange hands, letters that make no sense, a blurry edge around a face. But a good fake may have none. So check the source, not the pixels: where it comes from, not how it looks. Ask yourself two questions:"
                        ],
                        example: [
                            "1. Who published this?",
                            "2. Do trusted news sources report it too?"
                        ],
                        note: "Not sure which news sources can be trusted? Ask an adult you trust: a parent or a teacher."
                    },
                    ru: {
                        title: "Увидеть своими глазами — уже не доказательство",
                        text: [
                            "ИИ умеет создавать поддельные фото, видео и записи голоса: на них — то, чего никогда не было. Например, настоящий человек «говорит» слова, которых не произносил. Такая подделка называется **дипфейком**. Чтобы скопировать голос, бывает достаточно короткой записи.",
                            "У некоторых подделок есть заметные ошибки: странные руки, бессмысленные надписи, размытый контур лица. Но у хорошей подделки их может и не быть. Поэтому проверяй источник, а не пиксели: не как это выглядит, а откуда взялось. Задай себе два вопроса:"
                        ],
                        example: [
                            "1. Кто это опубликовал?",
                            "2. Сообщают ли об этом надёжные источники новостей?"
                        ],
                        note: "Не знаешь, какие источники новостей надёжные? Спроси взрослого, которому доверяешь: родителей или учителя."
                    }
                },
                {
                    type: "choice", card: "s4b",
                    en: {
                        q: "You see a shocking video of a famous person saying something terrible. What is the best first step?",
                        options: [
                            "Before you believe or share it, check whether trusted news sources report it",
                            "Share it at once, so that your friends learn about it as soon as possible",
                            "Look closely at the hands and the face: if they look normal, the video is real",
                            "Believe it: a photo can be faked, but a whole video with a voice cannot"
                        ],
                        hint: "A good fake may have no visible mistakes. What can you check, apart from the video itself?",
                        why: "AI can fake a video of a real person, and a good fake can look normal. If a famous person really said this, trusted news sources would very likely report it. Until you have checked, do not share it."
                    },
                    ru: {
                        q: "Тебе попалось шокирующее видео: известный человек говорит что-то ужасное. Что разумнее всего сделать первым делом?",
                        options: [
                            "Прежде чем верить и пересылать, проверить, сообщают ли об этом надёжные источники новостей",
                            "Сразу переслать всем друзьям, чтобы они узнали об этом как можно раньше",
                            "Присмотреться к рукам и лицу: если они выглядят нормально, видео настоящее",
                            "Поверить: фотографию подделать можно, а целое видео с голосом — нельзя"
                        ],
                        hint: "У хорошей подделки может не быть заметных ошибок. Что можно проверить, кроме самого видео?",
                        why: "ИИ умеет подделывать видео с настоящими людьми, и хорошая подделка может выглядеть нормально. Если бы известный человек и правда такое сказал, об этом, скорее всего, сообщили бы надёжные источники новостей. Пока не проверишь, не пересылай."
                    }
                },
                {
                    type: "info", icon: "📞",
                    en: {
                        title: "The trick with a familiar voice",
                        text: [
                            "A scammer is a person who tricks others to get their money. With a copied voice, a scammer can call you or send a voice message. It sounds like someone from your family: “I am in trouble. Send money now, and tell nobody.”",
                            "Hurry, secrecy and money together are a stop sign. Send nothing. Hang up and call that family member yourself, on the number you already know. Then tell an adult you trust."
                        ],
                        note: "Some families agree on a secret code word for calls like this: a word that only the family knows."
                    },
                    ru: {
                        title: "Уловка со знакомым голосом",
                        text: [
                            "Мошенник — это человек, который обманом выманивает чужие деньги. Скопировав голос, он может позвонить или прислать голосовое сообщение. Звучит оно так, будто говорит кто-то из твоей семьи: «Я в беде. Срочно пришли деньги и никому не говори».",
                            "Спешка, тайна и деньги вместе — это знак «стоп». Ничего не отправляй. Положи трубку и позвони этому родственнику по номеру, который у тебя уже есть. Потом расскажи обо всём взрослому, которому доверяешь."
                        ],
                        note: "Некоторые семьи заранее договариваются о секретном кодовом слове для таких звонков: его знают только свои."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A voice message that sounds like your brother says: “I am in trouble. Send money right now and tell nobody.” What is the best thing to do?",
                        options: [
                            "Call him on the number you know, and tell an adult",
                            "Send the money at once: it is his voice, so it must be him",
                            "Reply to the message and ask: “Is this really you?”",
                            "Do nothing for now, and wait to see whether another message comes"
                        ],
                        hint: "A voice can be copied. How can you make sure that you reach your real brother?",
                        why: "A voice can be copied, and a scammer who is asked “Is this really you?” will simply answer “yes”. Waiting checks nothing, and if your brother really is in trouble, it does not help him. Calling back works because you choose the number, so you reach your real brother. And an adult can help you decide what to do next."
                    },
                    ru: {
                        q: "Приходит голосовое сообщение, и голос в нём — как у твоего брата: «Я в беде. Срочно пришли деньги и никому не говори». Как лучше всего поступить?",
                        options: [
                            "Позвонить брату по номеру, который знаешь, и рассказать взрослому",
                            "Сразу отправить деньги: голос его, значит, это точно он",
                            "Ответить на сообщение и спросить: «Это правда ты?»",
                            "Пока ничего не делать и подождать, не придёт ли ещё сообщение"
                        ],
                        hint: "Голос можно скопировать. Как убедиться, что на связи настоящий брат?",
                        why: "Голос можно скопировать, а на вопрос «Это правда ты?» мошенник просто ответит «да». Ждать бесполезно: так ничего не проверишь, а брату, если он и правда в беде, это не поможет. Перезвонить — надёжный способ: номер выбираешь ты, поэтому попадаешь к настоящему брату. А взрослый поможет решить, что делать дальше."
                    }
                },
                {
                    type: "info", icon: "⚖️",
                    en: {
                        title: "AI can be unfair",
                        text: [
                            "An AI model learns from examples made by people. If the examples are one-sided or unfair, the model can learn that too: it may work worse for some groups of people, or prefer some people over others. This is called **bias**.",
                            "A real case: a program for choosing workers was trained on the job applications that one company had received over ten years. Most came from men, so the program began to rate women's applications lower. The company stopped the project.",
                            "So when AI helps to decide something about a person (a grade, a job, a loan), it is fair to ask why, and to ask a human to look at the decision again."
                        ]
                    },
                    ru: {
                        title: "ИИ бывает несправедливым",
                        text: [
                            "Модель ИИ учится на примерах, которые создали люди. Если примеры однобокие или несправедливые, модель может это перенять: хуже работать с некоторыми группами людей или отдавать одним предпочтение перед другими. Это называется **предвзятостью**.",
                            "Случай из жизни: программу для отбора работников обучали на анкетах, которые одна компания получила за десять лет. Большинство анкет прислали мужчины, и программа стала оценивать анкеты женщин ниже. Компания закрыла этот проект.",
                            "Поэтому, когда ИИ помогает принять решение о человеке (оценка, работа, кредит), справедливо спросить, почему так вышло, и попросить, чтобы это решение перепроверили люди."
                        ]
                    }
                },
                {
                    type: "reveal", icon: "🤔",
                    en: {
                        q: "A chatbot gives you an answer, and you use it. Who is responsible for what happens next?",
                        answer: [
                            "You are. A chatbot does not decide to hand in your homework, send your message or sign your name. You do.",
                            "The company that built a chatbot is responsible for how it works. But if you publish, send or hand in something, you are responsible for it, wherever the words came from.",
                            "“The chatbot said so” does not undo a mistake. That is why checking is your job, not the chatbot's."
                        ]
                    },
                    ru: {
                        q: "Чат-бот даёт ответ, и ты им пользуешься. Кто отвечает за то, что будет дальше?",
                        answer: [
                            "Ты. Сдать ли домашнюю работу, отправить ли сообщение, поставить ли подпись — решает не чат-бот, а ты.",
                            "Компания, которая создала чат-бот, отвечает за то, как он работает. Но если ты что-то публикуешь, отправляешь или сдаёшь, отвечать за это тебе, откуда бы ни взялись слова.",
                            "Фраза «так сказал чат-бот» ошибку не исправит. Вот почему проверка — твоя работа, а не работа чат-бота."
                        ]
                    }
                },
                {
                    type: "match", card: "s4c",
                    en: {
                        q: "Match each risk with the habit that protects you.",
                        pairs: [
                            ["A fact from a chatbot that may be made up", "Find the same fact in a second source, such as a textbook"],
                            ["A shocking video that may be fake", "Find out who published it and whether trusted news sources report it"],
                            ["An urgent call that asks for money", "Hang up and call back on a number you know"],
                            ["Chats that are stored on a company's computers", "Type no passwords, addresses or secrets"]
                        ],
                        why: "A chatbot can make a fact up, so a second source has to confirm it. A fake video can look perfect, so you check where it comes from. A voice can be copied, so you call back yourself, on a number you know. And what you never typed, nobody can read."
                    },
                    ru: {
                        q: "Соедини каждый риск с привычкой, которая от него защищает.",
                        pairs: [
                            ["Факт от чат-бота, возможно, выдуманный", "Найти тот же факт во втором источнике, например в учебнике"],
                            ["Шокирующее видео, возможно, поддельное", "Узнать, кто его опубликовал и сообщают ли о нём надёжные источники новостей"],
                            ["Срочный звонок с просьбой о деньгах", "Положить трубку и перезвонить по знакомому номеру"],
                            ["Чаты, которые хранятся на компьютерах компании", "Не писать паролей, адресов и секретов"]
                        ],
                        why: "Чат-бот может выдумать факт, поэтому нужен второй источник. Поддельное видео может выглядеть безупречно, поэтому проверяй, откуда оно взялось. Голос можно скопировать, поэтому звонить нужно тебе, по знакомому номеру. А то, чего ты не пишешь в чат, никто не прочитает."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A chatbot is friendly, always there and never tired. Which statement about it is true?",
                        options: [
                            "It is a program that guesses the next words: it sounds kind, but it is not a person",
                            "It is a real friend who understands you better than the people around you",
                            "It keeps everything you tell it secret, like a diary that only you can open",
                            "It always knows what is best for you, because it has read so many texts"
                        ],
                        hint: "Think about how a chatbot writes its answers, and where your messages go.",
                        why: "A chatbot can be useful, and talking to it can even feel good. But its kind words are text written by a program: it is not a person, your chats are not secret, and it can be wrong. If something hurts or frightens you, tell a person you trust: a parent, a teacher, a friend."
                    },
                    ru: {
                        q: "Чат-бот дружелюбный, всегда на связи и никогда не устаёт. Какое утверждение о нём верно?",
                        options: [
                            "Это программа, которая угадывает следующие слова: звучит по-доброму, но это не человек",
                            "Это настоящий друг, который понимает тебя лучше, чем все люди вокруг",
                            "Он хранит в тайне всё, что ты ему пишешь, как личный дневник под замком",
                            "Он всегда знает, как для тебя лучше, ведь он прочитал так много текстов"
                        ],
                        hint: "Вспомни, как чат-бот пишет ответы и куда уходят твои сообщения.",
                        why: "Чат-бот бывает полезен, а иногда с ним даже приятно поговорить. Но его добрые слова — это текст, который пишет программа: чат-бот не человек, твои чаты не тайна, и он может ошибаться. Если тебе больно или страшно, расскажи человеку, которому доверяешь: родителям, учителю, другу."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A chat is a postcard, not a diary: no passwords, addresses, documents or other people's secrets.",
                            "A photo, a voice or a video is not proof: AI can fake them, and such a fake is called a **deepfake**. Check who published it and whether trusted news sources report it.",
                            "Hurry, secrecy and money together are a stop sign: hang up and call back on a number you know.",
                            "You are responsible for what you do with an AI answer, so checking is your job. AI can be wrong, and it can be unfair (this is called **bias**)."
                        ]
                    },
                    ru: {
                        points: [
                            "Чат — это открытка, а не личный дневник: никаких паролей, адресов, документов и чужих секретов.",
                            "Фото, голос и видео — ещё не доказательство: ИИ умеет их подделывать, и такая подделка называется **дипфейком**. Проверяй, кто это опубликовал и сообщают ли об этом надёжные источники новостей.",
                            "Спешка, тайна и деньги вместе — знак «стоп»: положи трубку и перезвони по номеру, который знаешь.",
                            "За то, что ты делаешь с ответом ИИ, отвечаешь ты, поэтому проверка — твоя работа. ИИ может ошибаться и бывает несправедливым (это называется **предвзятостью**)."
                        ]
                    }
                }
            ]
        }
    }
});
