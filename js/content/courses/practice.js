/* =========================================================
   AI COMPASS — GUIDED PRACTICE OF THE LESSONS
   One short guided step for each lesson of the Lessons page (l1 for
   lesson 1 ... l15 for lesson 15). In My path it comes right after its
   lesson, and the end of every lesson has a button that opens it. The
   learner has just read the lesson: these steps do not teach it again,
   they make the learner use it (recall without looking, apply the ideas
   to new examples, catch a common myth, explain it in their own words),
   and their three cards bring the main ideas back days later.
   The screens are shown one by one by js/learn-play.js. How a screen is
   written is explained at the top of js/content/courses/zero.js:
   - in a "choice", the FIRST option is the right one;
   - "card": the task also becomes a card of the memory check. A card must
     make sense alone. Its topic on the memory map is the topic of its
     lesson ("topic" of the unit in js/content/learn.js).
   The names of the steps are in js/content/learn.js ("learn.unit.l1"...).
   ========================================================= */

window.AICompass.content.set("course.practice", {
    units: {
        /* ----- l1. What is AI? ----- */
        l1: {
            steps: [
                {
                    type: "info", icon: "🤖",
                    en: {
                        title: "A thinking job, done by a computer",
                        text: [
                            "Recognising, understanding, deciding: people need their intelligence for jobs like these. When a computer does them, we call it AI. Most AI today is not given a rule for every case: it finds patterns in lots of examples and uses them to make predictions.",
                            "Point a phone at a flower, and an app can tell you its name. Nobody wrote a rule for every flower in the world: the app learned from a huge number of flower photos, each with its name."
                        ]
                    },
                    ru: {
                        title: "Работа для ума, которую делает компьютер",
                        text: [
                            "Узнавать, понимать, принимать решения — для такой работы людям нужен интеллект. Когда её делает компьютер, это и называют ИИ. Правило на каждый случай ему обычно никто не пишет: он находит закономерности во множестве примеров и по ним делает прогнозы.",
                            "Наведи телефон на цветок — и приложение может подсказать, как он называется. Правило для каждого цветка на свете никто не писал: приложение училось на огромном количестве фотографий цветов с их названиями."
                        ]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "You type “Happy” and your phone keyboard suggests “birthday”. How did it come up with that word?",
                        options: ["In the texts it learned from, “Happy birthday” comes up a lot", "It understands that you are in a happy mood today", "Someone at the phone company chose the word for you", "It picked a word from the dictionary at random"],
                        hint: "What does AI look for in lots of examples?",
                        why: "The keyboard does not think like a person. It found a pattern in lots of texts and uses it to predict the next word. So if you are writing “Happy New Year”, its guess is wrong."
                    },
                    ru: {
                        q: "Ты печатаешь «С днём», и клавиатура телефона предлагает слово «рождения». Откуда она его взяла?",
                        options: ["В текстах, на которых она училась, часто встречается «С днём рождения»", "Она понимает, что у тебя сегодня праздничное настроение", "Сотрудник компании выбрал это слово специально для тебя", "Она взяла из словаря случайное слово"],
                        hint: "Что ИИ ищет во множестве примеров?",
                        why: "Клавиатура не думает как человек. Она нашла закономерность во множестве текстов и по ней угадывает следующее слово. Поэтому, если ты пишешь «С днём учителя», её догадка окажется неверной."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "Each of these does a job that usually needs human intelligence. Which ability does it use?",
                        pairs: [
                            ["A phone that unlocks when it sees you", "Recognising faces"],
                            ["A voice assistant that does what you say", "Understanding speech"],
                            ["An app that helps you read a menu in Chinese", "Translating languages"],
                            ["A video app that picks what you watch next", "Making decisions"]
                        ],
                        why: "People use their intelligence to recognise faces, understand speech, translate and decide. When a computer system does jobs like these, we call it AI."
                    },
                    ru: {
                        q: "Каждая из этих систем делает работу, для которой обычно нужен человеческий интеллект. Какое умение она использует?",
                        pairs: [
                            ["Телефон, который разблокируется, когда видит тебя", "Узнавать лица"],
                            ["Голосовой помощник, который выполняет то, что ты говоришь", "Понимать речь"],
                            ["Приложение, с которым можно прочитать меню на китайском", "Переводить с языка на язык"],
                            ["Приложение с видео, которое выбирает, что тебе показать дальше", "Принимать решения"]
                        ],
                        why: "Узнавать лица, понимать речь, переводить и принимать решения — для всего этого людям нужен интеллект. Когда такую работу делает компьютерная система, это ИИ."
                    }
                },
                {
                    type: "choice", card: "l1a",
                    en: {
                        q: "An app can tell which bird is singing just from the sound. It cannot chat with you, and it works without the Internet. Is it AI?",
                        options: ["Yes: it does a task that usually needs human intelligence", "No: a real AI has to be able to chat with you", "No: an AI always needs the Internet to do its work"],
                        why: "What makes it AI is the task: telling birds apart by their song usually takes a person who knows birds well. An AI does not have to chat, and it does not always need the Internet."
                    },
                    ru: {
                        q: "Приложение узнаёт, какая птица поёт, просто по звуку. Болтать с тобой оно не умеет и работает без интернета. Это ИИ?",
                        options: ["Да: для такой задачи обычно нужен человеческий интеллект", "Нет: настоящий ИИ обязательно умеет болтать с тобой", "Нет: без интернета никакой ИИ работать не может"],
                        why: "Это ИИ из-за самой задачи: различать птиц по пению обычно может только человек, который хорошо в них разбирается. Уметь болтать ИИ не обязательно, и интернет нужен ему не всегда."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Did it learn from examples, or does it follow a fixed rule that a person wrote?",
                        groups: ["Learned from examples", "Follows a fixed rule"],
                        items: [
                            ["A music app that suggests new songs you might like", 0],
                            ["A microwave that beeps when the time is up", 1],
                            ["An app that turns your handwriting into typed text", 0],
                            ["A door that opens when someone walks up to it", 1],
                            ["An app that writes subtitles while people in a video talk", 0],
                            ["A traffic light that turns green every minute", 1]
                        ],
                        why: "Songs people like, handwriting and speech vary too much for anyone to write a rule for every case, so these systems learn from lots of examples. The microwave, the door and the traffic light each follow one simple rule."
                    },
                    ru: {
                        q: "Как это работает: научилось на примерах или выполняет готовое правило, которое написал человек?",
                        groups: ["Научилось на примерах", "Выполняет готовое правило"],
                        items: [
                            ["Музыкальное приложение, которое советует новые песни тебе по вкусу", 0],
                            ["Микроволновка, которая пищит, когда время вышло", 1],
                            ["Приложение, которое превращает твой почерк в печатный текст", 0],
                            ["Дверь, которая открывается, когда к ней подходят", 1],
                            ["Приложение, которое пишет субтитры, пока люди в видео говорят", 0],
                            ["Светофор, который каждую минуту включает зелёный", 1]
                        ],
                        why: "Вкусы людей, почерк и речь слишком разные, чтобы написать правило на каждый случай, поэтому такие системы учатся на множестве примеров. А микроволновка, дверь и светофор выполняют по одному простому правилу."
                    }
                },
                {
                    type: "choice", card: "l1b",
                    en: {
                        q: "Two apps look for dogs in photos. App A got a rule from a programmer: “four legs and a tail”. App B learned from many photos labelled “dog” or “not a dog”. Which one works like most modern AI?",
                        options: ["App B: it found its own rules in the examples", "App A: a clever person wrote its rule by hand", "Both of them: they do exactly the same job"],
                        why: "Most modern AI learns its own rules from examples, like App B. App A's hand-written rule would even call a cat a dog: a cat has four legs and a tail too."
                    },
                    ru: {
                        q: "Два приложения ищут собак на фото. Приложению А программист дал правило: «четыре лапы и хвост». Приложение Б училось на множестве фото с подписями «собака» и «не собака». Какое из них работает как большинство систем ИИ сегодня?",
                        options: ["Приложение Б: оно само нашло правила в примерах", "Приложение А: его правило написал умный человек", "Оба: они ведь делают одну и ту же работу"],
                        why: "Большинство современных систем ИИ сами выводят правила из примеров, как приложение Б. А правило приложения А назовёт собакой даже кошку: у неё тоже четыре лапы и хвост."
                    }
                },
                {
                    type: "info", icon: "🔍",
                    en: {
                        title: "Talking about everything is not “general”",
                        text: [
                            "A chatbot can chat about dinosaurs, football and maths, so it may seem to know everything. But **general AI (AGI)** means something else: an AI that could learn any thinking task a person can.",
                            "Nobody has built AGI yet, and experts disagree about when, or whether, it will happen. Every AI today is **narrow**: it is built for a certain kind of task. Even chatbots make mistakes a child would not."
                        ]
                    },
                    ru: {
                        title: "Болтать обо всём — ещё не значит быть общим ИИ",
                        text: [
                            "Чат-бот может болтать о динозаврах, футболе и математике, и кажется, что он знает всё. Но **общий ИИ (AGI)** — это другое: ИИ, который мог бы научиться любой интеллектуальной задаче, как человек.",
                            "Такой ИИ пока никто не создал, и эксперты спорят, когда он появится и появится ли вообще. Любой сегодняшний ИИ — **узкий**: он создан для определённого типа задач. Даже чат-боты делают ошибки, которых не допустил бы ребёнок."
                        ]
                    }
                },
                {
                    type: "choice", card: "l1c",
                    en: {
                        q: "A classmate says: “Chatbots can talk about almost anything, so they are general AI (AGI).” Is that right?",
                        options: ["No: AGI does not exist yet, and chatbots still make mistakes a child would not", "Yes: if a bot can talk about any topic, that is exactly what AGI is", "No: chatbots are not AI at all, they only repeat answers people wrote"],
                        why: "AGI would be an AI that could learn any thinking task a person can, and it does not exist yet. Chatbots are AI, but narrow: talking about many topics is not the same as being able to learn anything."
                    },
                    ru: {
                        q: "Одноклассник говорит: «Чат-боты могут говорить почти о чём угодно, значит, это общий ИИ (AGI)». Это верно?",
                        options: ["Нет: общего ИИ пока нет, а чат-боты делают ошибки, которых не сделал бы ребёнок", "Да: если бот может говорить на любую тему, это и есть общий ИИ", "Нет: чат-боты вообще не ИИ, они лишь повторяют ответы, написанные людьми"],
                        why: "Общий ИИ (AGI) мог бы научиться любой интеллектуальной задаче, как человек, и его пока не существует. Чат-боты — это ИИ, но узкий: говорить на многие темы ещё не значит уметь научиться чему угодно."
                    }
                },
                {
                    type: "reveal", icon: "💬",
                    en: {
                        q: "Explain it to a friend: how is AI different from an ordinary program? Answer in your head or out loud, then compare.",
                        answer: [
                            "An ordinary program follows rules that a person wrote by hand, like a microwave that beeps when the time is up.",
                            "Most modern AI finds its own rules: it learns patterns from lots of examples. And every AI today is narrow: it is good only at its own kind of task."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: чем ИИ отличается от обычной программы? Ответь про себя или вслух, а потом сравни.",
                        answer: [
                            "Обычная программа выполняет правила, которые человек написал вручную, — как микроволновка, которая пищит, когда время вышло.",
                            "Большинство современных систем ИИ сами выводят правила: находят закономерности во множестве примеров. И любой ИИ сегодня — узкий: он хорош только в своём деле."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "**AI** is a computer system doing tasks that usually need human intelligence: recognising, understanding, translating, deciding.",
                            "Most modern AI learns its own rules: it finds patterns in lots of examples instead of only following rules written by hand.",
                            "Every AI today is **narrow**. **General AI (AGI)**, which could learn any thinking task a person can, does not exist yet."
                        ]
                    },
                    ru: {
                        points: [
                            "**ИИ** — это компьютерная система, которая решает задачи, для которых обычно нужен человеческий интеллект: узнаёт, понимает, переводит, принимает решения.",
                            "Большинство современных систем ИИ сами выводят правила: находят закономерности во множестве примеров, а не только выполняют правила, написанные вручную.",
                            "Любой сегодняшний ИИ — **узкий**. **Общего ИИ (AGI)**, который мог бы научиться любой интеллектуальной задаче, как человек, пока нет."
                        ]
                    }
                }
            ]
        },

        /* ----- l2. Machine Learning ----- */
        l2: {
            steps: [
                {
                    type: "info", icon: "🍪",
                    en: {
                        title: "Show it, don't tell it",
                        text: [
                            "In machine learning, nobody writes the rules for the task. People give the computer lots of examples, and it finds the patterns by itself, step by step.",
                            "Want a camera that spots burnt cookies? Don't try to describe “burnt” with rules. Show a model lots of cookie photos, each labelled “good” or “burnt”, and let it work out the difference."
                        ]
                    },
                    ru: {
                        title: "Не объясняй — покажи",
                        text: [
                            "В машинном обучении правила для задачи никто не пишет. Компьютеру дают много примеров, и он шаг за шагом находит в них закономерности.",
                            "Нужна камера, которая замечает подгоревшее печенье? Не пытайся описать «подгоревшее» правилами. Покажи модели много фото печенья с пометками «хорошее» или «подгоревшее» — и пусть она найдёт разницу."
                        ]
                    }
                },
                {
                    type: "choice", card: "l2a",
                    en: {
                        q: "A model learned to tell ripe bananas from unripe ones. Now it gets a banana photo it has never seen. How does it decide?",
                        options: ["It uses the patterns it found in its training examples", "It looks for the very same photo on the Internet", "It follows banana rules that a programmer typed in", "It asks a person who knows a lot about bananas"],
                        why: "A model learns patterns from examples instead of following hand-written rules. That is why it can handle a new photo: it looks for the same patterns in it."
                    },
                    ru: {
                        q: "Модель научилась отличать спелые бананы от неспелых. Теперь ей показывают фото банана, которого она раньше не видела. Как она решает?",
                        options: ["Пользуется закономерностями, которые нашла в обучающих примерах", "Ищет точно такое же фото в интернете", "Выполняет правила о бананах, которые ввёл программист", "Спрашивает человека, который хорошо разбирается в бананах"],
                        why: "Модель находит закономерности в примерах, а не выполняет правила, написанные вручную. Поэтому она справляется и с новым фото: ищет на нём те же закономерности."
                    }
                },
                {
                    type: "number", answer: 8,
                    en: {
                        q: "A model is learning to guess from a photo how many sweets are in a jar. It guesses 42, but there are really 50. By how many sweets is it wrong?",
                        hint: "Count up from 42 to 50.",
                        why: "50 − 42 = 8: that is the model's error. Its guess was too low, so it adjusts itself a tiny bit to guess a little higher next time."
                    },
                    ru: {
                        q: "Модель учится по фото угадывать, сколько конфет в банке. Она говорит 42, а на самом деле там 50. На сколько конфет она ошиблась?",
                        hint: "Посчитай от 42 до 50.",
                        why: "50 − 42 = 8 — это и есть ошибка модели. Её догадка оказалась слишком маленькой, поэтому она чуть-чуть подстраивает себя, чтобы в следующий раз угадывать немного больше."
                    }
                },
                {
                    type: "order", card: "l2b",
                    en: {
                        q: "Put the steps of training and testing a model in order.",
                        items: ["The model guesses an answer for an example", "It measures how wrong its guess was", "It adjusts itself a tiny bit to be less wrong", "It repeats this thousands of times", "It is tested on new examples it has never seen"],
                        hint: "A mistake can only be measured once there is a guess.",
                        why: "Guess, measure the error, adjust, repeat: that is training. Testing comes last, on new examples, to check how the model does on things it has never met."
                    },
                    ru: {
                        q: "Расставь по порядку шаги обучения и проверки модели.",
                        items: ["Модель угадывает ответ для примера", "Она измеряет, насколько ошиблась", "Она чуть-чуть подстраивает себя, чтобы ошибаться меньше", "Всё это повторяется тысячи раз", "Её проверяют на новых примерах, которых она не видела"],
                        hint: "Измерить ошибку можно только тогда, когда уже есть догадка.",
                        why: "Угадать, измерить ошибку, подправить, повторить — это обучение. Проверка идёт последней: на новых примерах видно, как модель справляется с тем, чего раньше не встречала."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "Match each example with its way of learning.",
                        pairs: [
                            ["Thousands of drawings, each with the animal's name written on it", "Supervised learning"],
                            ["Thousands of leaf photos with no names: the model puts similar ones together", "Unsupervised learning"],
                            ["A robot learning to walk gets points when it stays on its feet longer", "Reinforcement learning"]
                        ],
                        why: "A label with every example: supervised. No labels, so the model finds the groups itself: unsupervised. Trial and error with rewards: reinforcement."
                    },
                    ru: {
                        q: "Соедини каждый пример с его способом обучения.",
                        pairs: [
                            ["Тысячи рисунков, и на каждом подписано, какое это животное", "Обучение с учителем"],
                            ["Тысячи фото листьев без названий: модель собирает похожие вместе", "Обучение без учителя"],
                            ["Робот учится ходить и получает очки, когда дольше стоит на ногах", "Обучение с подкреплением"]
                        ],
                        why: "Метка у каждого примера — обучение с учителем. Меток нет, и модель сама ищет группы — обучение без учителя. Пробы и ошибки с наградами — обучение с подкреплением."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Which of these sentences about machine learning is a myth?",
                        options: ["People play no part in it: the computer teaches itself everything", "People often add the right answers, called labels, to the examples", "People choose which examples the model learns from", "People decide what the model should learn to do"],
                        hint: "Think about where the examples and their labels come from.",
                        why: "The computer finds the patterns itself, but people choose the task, collect the examples and often label them. So a model can only be as good as the examples people give it."
                    },
                    ru: {
                        q: "Какое из этих утверждений о машинном обучении — миф?",
                        options: ["Люди тут ни при чём: компьютер всему учится без их помощи", "Люди часто добавляют к примерам правильные ответы — метки", "Люди выбирают, на каких примерах будет учиться модель", "Люди решают, чему модель должна научиться"],
                        hint: "Подумай, откуда берутся примеры и их метки.",
                        why: "Закономерности компьютер находит без подсказок, но задачу ставят люди: они собирают примеры и часто расставляют метки. Поэтому модель может быть хороша только настолько, насколько хороши примеры, которые ей дали."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "You collect photos to teach a model to recognise dogs. Will each set help it learn well, or teach it a wrong lesson?",
                        groups: ["Helps it learn well", "Teaches a wrong lesson"],
                        items: [
                            ["Many breeds, big and small, in every colour", 0],
                            ["Photos of just one dog: your neighbour's poodle", 1],
                            ["Dogs indoors and outdoors, by day and at night", 0],
                            ["Photos where many of the labels are wrong", 1],
                            ["Dogs seen from the front, the side and the back", 0],
                            ["Every single dog photo taken on a beach", 1]
                        ],
                        why: "A model is only as good as its data. Too few photos, wrong labels or one-sided photos (one dog, only beaches) teach it the wrong pattern. Varied photos with correct labels help it find the right one."
                    },
                    ru: {
                        q: "Ты собираешь фото, чтобы научить модель узнавать собак. Поможет ли каждый набор ей хорошо учиться или научит неправильному?",
                        groups: ["Поможет хорошо учиться", "Научит неправильному"],
                        items: [
                            ["Много пород, больших и маленьких, всех окрасов", 0],
                            ["Фото только одной собаки — пуделя соседей", 1],
                            ["Собаки дома и на улице, днём и ночью", 0],
                            ["Фото, где у многих подписи перепутаны", 1],
                            ["Собаки спереди, сбоку и сзади", 0],
                            ["Все до одного фото собак сняты на пляже", 1]
                        ],
                        why: "Модель хороша настолько, насколько хороши её данные. Мало фото, ошибки в метках или однобокие фото (одна собака, только пляж) научат её не той закономерности. Разнообразные фото с верными метками помогут найти правильную."
                    }
                },
                {
                    type: "choice", card: "l2c",
                    en: {
                        q: "A voice assistant learned to understand speech only from recordings of adults. What will most likely happen when a young child talks to it?",
                        options: ["It may understand the child less well than it understands adults", "It will understand everyone equally well, because speech is speech", "It will understand children better, because they speak more simply"],
                        why: "A model learns only from its examples. Children's voices sound different, and there were none in its training data, so it may make more mistakes. Adding recordings of children would help."
                    },
                    ru: {
                        q: "Голосовой помощник учился понимать речь только на записях взрослых. Что, скорее всего, будет, когда с ним заговорит маленький ребёнок?",
                        options: ["Он может понимать ребёнка хуже, чем взрослых", "Он будет понимать всех одинаково, ведь речь есть речь", "Он поймёт ребёнка лучше, ведь дети говорят проще"],
                        why: "Модель учится только на своих примерах. Детские голоса звучат иначе, а в обучающих данных их не было, поэтому ошибок может быть больше. Помогли бы записи детских голосов."
                    }
                },
                {
                    type: "reveal", icon: "💬",
                    en: {
                        q: "Explain it to a friend: how does a computer learn from examples? Answer in your head or out loud, then compare.",
                        answer: [
                            "You give it lots of examples, and it practises: it guesses, measures its error and adjusts itself a tiny bit, thousands of times.",
                            "Then it is tested on new examples. And it can only be as good as the examples it learned from."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: как компьютер учится на примерах? Ответь про себя или вслух, а потом сравни.",
                        answer: [
                            "Ему дают много примеров, и он тренируется: угадывает, измеряет ошибку и чуть-чуть подстраивает себя — тысячи раз.",
                            "Потом его проверяют на новых примерах. И он может быть хорош только настолько, насколько хороши примеры, на которых он учился."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "**Machine learning**: a model finds patterns in lots of examples instead of following rules written by hand.",
                            "**Training**: guess, measure the error, adjust a tiny bit, repeat. **Testing**: check the model on new examples it has never seen.",
                            "A model is only as good as its data: too few, messy or one-sided examples teach it the wrong lesson."
                        ]
                    },
                    ru: {
                        points: [
                            "**Машинное обучение**: модель находит закономерности во множестве примеров, а не выполняет правила, написанные вручную.",
                            "**Обучение**: угадать, измерить ошибку, чуть-чуть подправить, повторить. **Проверка**: тест на новых примерах, которых модель не видела.",
                            "Модель хороша настолько, насколько хороши её данные: если примеров мало, они неаккуратные или однобокие, она усвоит неправильный урок."
                        ]
                    }
                }
            ]
        },

        /* ----- l3. Neural Networks ----- */
        l3: {
            steps: [
                {
                    type: "info", icon: "🧠",
                    en: {
                        title: "Many tiny calculators, working together",
                        text: [
                            "A neural network is built from lots of tiny maths units, artificial neurons, connected in layers. Each one mostly just multiplies and adds numbers. Together, after training, they can do surprising things.",
                            "When a video-call app blurs the messy room behind you, it often uses a neural network: layer by layer, the network works out which pixels belong to you and which to the room."
                        ]
                    },
                    ru: {
                        title: "Много крошечных калькуляторов вместе",
                        text: [
                            "Нейросеть собрана из множества крошечных математических блоков — искусственных нейронов, соединённых слоями. Каждый в основном просто умножает и складывает числа. Но вместе, после обучения, они способны на удивительные вещи.",
                            "Когда приложение для видеозвонков размывает беспорядок у тебя за спиной, оно часто использует нейросеть: слой за слоем сеть определяет, какие пиксели — это ты, а какие — комната."
                        ]
                    }
                },
                {
                    type: "order", card: "l3a",
                    en: {
                        q: "Put in order what one artificial neuron does.",
                        items: ["It takes in some numbers: its inputs", "It multiplies each input by that input's weight", "It adds all the results up, together with a bias", "Its activation function decides how strongly it “fires”"],
                        hint: "You can only add the results up once you have them.",
                        why: "Inputs, multiply by the weights, add up with the bias, then the activation function. That is all one neuron does: the power comes from connecting very many of them."
                    },
                    ru: {
                        q: "Расставь по порядку, что делает один искусственный нейрон.",
                        items: ["Получает несколько чисел — свои входы", "Умножает каждый вход на его вес", "Складывает все результаты вместе со смещением", "Функция активации решает, насколько сильно он «сработает»"],
                        hint: "Сложить результаты можно только тогда, когда они уже есть.",
                        why: "Входы, умножение на веса, сложение со смещением, потом функция активации. Вот и всё, что делает один нейрон: сила появляется, когда их соединяют очень много."
                    }
                },
                {
                    type: "number", answer: 15,
                    en: {
                        q: "An artificial neuron multiplies each input by its weight and adds everything up, together with a bias of 1. What sum does it get?",
                        table: { head: ["Input", "Weight"], rows: [["3", "2"], ["2", "4"]] },
                        hint: "First work out 3 × 2 and 2 × 4. Then add both results and the bias.",
                        why: "3 × 2 = 6 and 2 × 4 = 8, so 6 + 8 + 1 = 15. Next, the activation function decides how strongly the neuron fires with this sum."
                    },
                    ru: {
                        q: "Искусственный нейрон умножает каждый вход на его вес и складывает всё вместе со смещением, равным 1. Какая сумма получится?",
                        table: { head: ["Вход", "Вес"], rows: [["3", "2"], ["2", "4"]] },
                        hint: "Сначала посчитай 3 × 2 и 2 × 4. Потом сложи оба результата и смещение.",
                        why: "3 × 2 = 6 и 2 × 4 = 8, значит, 6 + 8 + 1 = 15. Дальше функция активации решает, насколько сильно нейрон сработает с такой суммой."
                    }
                },
                {
                    type: "choice", card: "l3b",
                    en: {
                        q: "One artificial neuron does only a very simple calculation. So how can a neural network recognise a face?",
                        options: ["Lots of simple neurons work on it together, layer by layer", "One special neuron in it is far smarter than all the others", "A programmer writes a rule for every face it should know", "It sends the photo to a person who checks the face"],
                        why: "No single neuron is clever. The power comes from connecting lots of them in layers: each layer passes its numbers on to the next, until the last layer gives the answer."
                    },
                    ru: {
                        q: "Один искусственный нейрон делает только очень простой расчёт. Как же тогда нейросеть узнаёт лицо?",
                        options: ["Много простых нейронов работают над этим вместе, слой за слоем", "Один особый нейрон в ней намного умнее всех остальных", "Программист пишет правило для каждого лица, которое она знает", "Она отправляет фото человеку, и тот проверяет лицо"],
                        why: "Ни один нейрон по отдельности не умён. Сила в том, что их очень много и они соединены слоями: каждый слой передаёт свои числа следующему, пока последний не выдаст ответ."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "A network is reading a photo of a handwritten number. Match each layer with its job.",
                        pairs: [
                            ["Input layer", "The pixels of the photo come in here"],
                            ["Hidden layers", "The numbers are changed here, step by step"],
                            ["Output layer", "The answer comes out here, like “7: 95%”"]
                        ],
                        why: "The data comes in at the input layer, the hidden layers in the middle transform it step by step, and the output layer gives the answer."
                    },
                    ru: {
                        q: "Сеть читает фото цифры, написанной от руки. Соедини каждый слой с его работой.",
                        pairs: [
                            ["Входной слой", "Сюда попадают пиксели фотографии"],
                            ["Скрытые слои", "Здесь шаг за шагом преобразуются числа"],
                            ["Выходной слой", "Отсюда выходит ответ, например «7: 95%»"]
                        ],
                        why: "Данные попадают во входной слой, скрытые слои посередине шаг за шагом их преобразуют, а выходной слой выдаёт ответ."
                    }
                },
                {
                    type: "info", icon: "📊",
                    en: {
                        title: "92% sure is not 100% right",
                        text: [
                            "The output layer can give its answer as percentages, like “cat: 92%, dog: 8%”. That means the network finds “cat” much more likely than “dog”.",
                            "It is not a promise. A network can be very sure and still be wrong, for example on a kind of photo it never saw in training."
                        ]
                    },
                    ru: {
                        title: "92% — это не обещание",
                        text: [
                            "Выходной слой может выдавать ответ в процентах, например «кошка: 92%, собака: 8%». Это значит, что «кошка» кажется сети гораздо вероятнее, чем «собака».",
                            "Но это не обещание. Сеть может быть очень уверена и всё равно ошибиться — например, на фото, непохожем на те, что были при обучении."
                        ]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A network looks at a photo of an animal and answers “dog: 97%, cat: 3%”. What does that tell you?",
                        options: ["It finds “dog” far more likely, but it can still be wrong", "The animal is certainly a dog: 97% is almost everything", "97 out of 100 people would say that it is a dog", "The animal in the photo is 97% dog and 3% cat"],
                        hint: "Think about what a percentage from a network can and cannot promise.",
                        why: "The percentages show how likely each answer looks to the network, not what is true. A network can be very sure and still be wrong, so check anything important."
                    },
                    ru: {
                        q: "Сеть смотрит на фото животного и отвечает: «собака: 97%, кошка: 3%». Что это значит?",
                        options: ["Собака кажется ей гораздо вероятнее, но сеть может ошибаться", "Это точно собака: 97% — это почти всё", "97 человек из 100 сказали бы, что это собака", "Животное на фото на 97% собака и на 3% кошка"],
                        hint: "Подумай, что проценты от сети могут обещать, а что нет.",
                        why: "Проценты показывают, насколько вероятным сети кажется каждый ответ, а не то, что правда. Сеть может быть очень уверена и всё равно ошибиться, поэтому важное лучше проверять."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Myth or fact? Sort these sentences.",
                        groups: ["Fact", "Myth"],
                        items: [
                            ["Face unlock and voice assistants run on neural networks", 0],
                            ["Neural networks are used only in science labs", 1],
                            ["The biggest networks have billions of weights", 0],
                            ["A big enough network never makes mistakes", 1],
                            ["Your brain has about 86 billion neurons", 0],
                            ["Neural networks can only work with pictures", 1]
                        ],
                        why: "Neural networks run in many everyday apps and work with pictures, sound and text. The biggest have billions of weights, and even they can make mistakes."
                    },
                    ru: {
                        q: "Миф или факт? Разложи эти утверждения.",
                        groups: ["Факт", "Миф"],
                        items: [
                            ["Разблокировка по лицу и голосовые помощники работают на нейросетях", 0],
                            ["Нейросети используют только в научных лабораториях", 1],
                            ["У самых больших сетей миллиарды весов", 0],
                            ["Достаточно большая сеть никогда не ошибается", 1],
                            ["В мозге человека около 86 миллиардов нейронов", 0],
                            ["Нейросети умеют работать только с картинками", 1]
                        ],
                        why: "Нейросети работают во многих привычных приложениях — с картинками, звуком и текстом. У самых больших из них миллиарды весов, но ошибаться могут даже они."
                    }
                },
                {
                    type: "choice", card: "l3c",
                    en: {
                        q: "A neural network is learning to recognise birds. What changes inside it during training?",
                        options: ["Its weights, nudged little by little to make fewer mistakes", "The number of its neurons, which grows after every photo", "A list of bird rules that programmers keep rewriting", "Nothing: it just stores every bird photo it is shown"],
                        why: "Learning means adjusting the weights: each one is nudged a tiny bit to reduce the error, millions of times. In the end, the weights hold everything the network has learned."
                    },
                    ru: {
                        q: "Нейросеть учится узнавать птиц. Что меняется у неё внутри во время обучения?",
                        options: ["Её веса: их понемногу подправляют, чтобы ошибок стало меньше", "Число её нейронов: оно растёт после каждого фото", "Список правил о птицах, который программисты всё время переписывают", "Ничего: она просто хранит каждое фото птицы, которое ей показали"],
                        why: "Учиться — значит подстраивать веса: каждый чуть-чуть подправляют, чтобы ошибка уменьшилась, и так миллионы раз. В итоге в весах оказывается всё, чему научилась сеть."
                    }
                },
                {
                    type: "reveal", icon: "💬",
                    en: {
                        q: "Explain it to a friend: what is a neural network, and how does it learn? Answer in your head or out loud, then compare.",
                        answer: [
                            "A neural network is lots of simple artificial neurons in layers, and each one mostly multiplies and adds numbers.",
                            "It learns by nudging its weights a tiny bit at a time, millions of times, until it makes fewer mistakes."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: что такое нейросеть и как она учится? Ответь про себя или вслух, а потом сравни.",
                        answer: [
                            "Нейросеть — это множество простых искусственных нейронов, расположенных слоями, и каждый в основном умножает и складывает числа.",
                            "Она учится, понемногу подправляя свои веса, — миллионы раз, пока не начнёт ошибаться реже."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A **neural network** is made of many simple artificial neurons arranged in layers: input, hidden and output.",
                            "One neuron multiplies its inputs by **weights**, adds them up with a bias and applies an activation function.",
                            "Learning means nudging the weights, little by little, to make fewer mistakes. Even a very sure network can be wrong."
                        ]
                    },
                    ru: {
                        points: [
                            "**Нейронная сеть** состоит из множества простых искусственных нейронов, расположенных слоями: входной, скрытые и выходной.",
                            "Один нейрон умножает входы на **веса**, складывает их вместе со смещением и применяет функцию активации.",
                            "Учиться — значит понемногу подстраивать веса, чтобы ошибаться всё реже. Даже очень уверенная сеть может ошибиться."
                        ]
                    }
                }
            ]
        },

        /* ----- l4. Generative AI & Chatbots: practice ----- */
        l4: {
            steps: [
                {
                    type: "info", icon: "💬",
                    en: {
                        title: "Something new, one piece at a time",
                        text: [
                            "Generative AI makes new things: stories, pictures, music, code, even videos. Ask for a story about a hamster who dreams of flying a plane, and you get one that nobody has ever written.",
                            "A chatbot writes it one **token** at a time: a word or a part of a word. Each time it picks one of the likely next tokens, again and again, very fast. But a likely answer is not always a true one."
                        ]
                    },
                    ru: {
                        title: "Новое — по кусочку",
                        text: [
                            "Генеративный ИИ создаёт новое: рассказы, картинки, музыку, код и даже видео. Попроси рассказ про хомяка, который мечтает стать лётчиком, — и получишь историю, которую ещё никто никогда не писал.",
                            "Чат-бот пишет её по одному **токену** — это слово или часть слова. Каждый раз он выбирает один из вероятных следующих токенов, и так снова и снова, очень быстро. Но вероятный ответ — не всегда верный."
                        ]
                    }
                },
                {
                    type: "sort", card: "l4a",
                    en: {
                        q: "Does this AI create something new, or does it sort or recognise what is already there?",
                        groups: ["Creates something new", "Sorts or recognises"],
                        items: [
                            ["Writes a new song about your cat", 0],
                            ["Finds your friend's face in your photos", 1],
                            ["Puts your photos into albums: pets, food, trips", 1],
                            ["Draws a castle on the Moon from one sentence", 0],
                            ["Tells you which bird is in your photo", 1],
                            ["Writes the code for a small new game", 0]
                        ],
                        why: "Generative AI makes something that did not exist before: a song, a picture, a program. Other AI works with what is already there: it sorts it or tells you what it is."
                    },
                    ru: {
                        q: "Этот ИИ создаёт что-то новое или сортирует и узнаёт то, что уже есть?",
                        groups: ["Создаёт новое", "Сортирует или узнаёт"],
                        items: [
                            ["Сочиняет новую песню про твою кошку", 0],
                            ["Находит лицо друга на твоих фото", 1],
                            ["Раскладывает фото по альбомам: питомцы, еда, поездки", 1],
                            ["Рисует замок на Луне по одной фразе", 0],
                            ["Определяет, какая птица на твоём фото", 1],
                            ["Пишет код для маленькой новой игры", 0]
                        ],
                        why: "Генеративный ИИ делает то, чего раньше не было: песню, картинку, программу. Другой ИИ работает с тем, что уже есть: сортирует это или говорит, что это такое."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "You ask an image generator for a cat in a spacesuit, and a picture appears. A friend says: “It just found that picture on the Internet.” What really happened?",
                        options: ["It made a new picture that did not exist before", "It found the closest matching picture online", "It copied the picture from a famous cartoon"],
                        hint: "What does the word “generative” tell you?",
                        why: "An image generator is generative AI: it creates a brand-new picture from your words. That is why it can show things nobody has ever photographed."
                    },
                    ru: {
                        q: "Ты просишь генератор картинок нарисовать кота в скафандре, и появляется картинка. Друг говорит: «Он просто нашёл эту картинку в интернете». Что произошло на самом деле?",
                        options: ["Он создал новую картинку, которой раньше не было", "Он нашёл в интернете самую похожую картинку", "Он скопировал картинку из известного мультфильма"],
                        hint: "Что подсказывает слово «генеративный»?",
                        why: "Генератор картинок — это генеративный ИИ: он создаёт по твоим словам совершенно новую картинку. Поэтому он может показать то, чего никто никогда не фотографировал."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Be the model. The text so far is “Once upon a…”. Which token is most likely to come next?",
                        options: ["time", "table", "quickly", "purple"],
                        hint: "Think of the first words of many fairy tales.",
                        why: "In the texts the model learned from, “Once upon a” is very often followed by “time”, so “time” gets the highest probability. The model picks what is likely, not what it has checked."
                    },
                    ru: {
                        q: "Побудь моделью. Текст пока такой: «Без труда не вытащишь и рыбку из…». Какой токен вероятнее всего будет следующим?",
                        options: ["пруда", "стола", "быстро", "зелёный"],
                        hint: "Вспомни эту пословицу целиком.",
                        why: "В текстах, на которых училась модель, после «Без труда не вытащишь и рыбку из» очень часто идёт «пруда», поэтому у «пруда» самая высокая вероятность. Модель выбирает вероятное, а не проверенное."
                    }
                },
                {
                    type: "order", card: "l4b",
                    en: {
                        q: "A chatbot writes its answer token by token. Put the steps for one new token in order.",
                        items: ["Look at all the text so far", "Work out how likely each possible next token is", "Pick one of the likely tokens", "Add it to the text and start again"],
                        hint: "What does the model need to know before it can guess?",
                        why: "The model looks at the text, gives every possible next token a probability, picks one and adds it. Then it does the same with the longer text, again and again, until the answer is ready."
                    },
                    ru: {
                        q: "Чат-бот пишет ответ токен за токеном. Расставь по порядку шаги для одного нового токена.",
                        items: ["Посмотреть на весь текст, который уже есть", "Вычислить вероятность каждого возможного следующего токена", "Выбрать один из вероятных токенов", "Добавить его к тексту и начать заново"],
                        hint: "Что модели нужно знать, прежде чем угадывать?",
                        why: "Модель смотрит на текст, вычисляет вероятность каждого возможного следующего токена, выбирает один и добавляет его. Потом делает то же самое с текстом, который стал длиннее, — снова и снова, пока ответ не будет закончен."
                    }
                },
                {
                    type: "info", icon: "📚",
                    en: {
                        title: "Why a chatbot can invent a book",
                        text: [
                            "While it was learning, a chatbot saw a huge number of book titles and author names. So it knows very well what a title and an author usually look like.",
                            "Ask it for a book about a dragon who loves maths, and it may make up a perfect-sounding title and author for a book that does not exist: a **hallucination**. It is not lying on purpose. It is doing what it always does: writing text that sounds likely."
                        ]
                    },
                    ru: {
                        title: "Почему чат-бот может выдумать книгу",
                        text: [
                            "Пока чат-бот учился, он видел огромное количество названий книг и имён авторов. Поэтому он прекрасно знает, как обычно выглядят название и автор.",
                            "Попроси его назвать книгу про дракона, который любит математику, — и он может сочинить идеальные на вид название и имя автора для книги, которой нет. Это **галлюцинация**. Чат-бот не врёт нарочно: он делает то же, что и всегда, — пишет текст, который звучит правдоподобно."
                        ]
                    }
                },
                {
                    type: "choice", card: "l4c",
                    en: {
                        q: "A chatbot gives you an important fact for your school project. It sounds very sure. What is the wise thing to do?",
                        options: ["Check it in a trusted book or on a trusted website", "Use it, because it sounds very sure", "Ask the chatbot again and trust it if it says the same", "Use it, because chatbots learned from so much text"],
                        why: "A chatbot can sound just as sure when it is wrong, and asking it again is not a real check. An important fact needs a source you can trust."
                    },
                    ru: {
                        q: "Чат-бот сообщает важный факт для твоего школьного проекта. Звучит очень уверенно. Как разумнее всего поступить?",
                        options: ["Проверить его в надёжной книге или на надёжном сайте", "Взять его: звучит ведь очень уверенно", "Спросить чат-бота ещё раз и поверить, если он повторит", "Взять его: чат-бот учился на огромном количестве текстов"],
                        why: "Чат-бот может звучать так же уверенно, когда ошибается, а переспросить его — ещё не проверка. Важный факт нужно сверить с источником, которому можно доверять."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "A clear prompt says what you need, gives some context and names the format you want. Match each part with a sentence from one clear prompt.",
                        pairs: [
                            ["What you need", "Give me ideas for party games."],
                            ["Some context", "My sister is turning 7 and loves dinosaurs."],
                            ["The format you want", "Write them as a list of five."]
                        ],
                        why: "Each part helps the chatbot guess better: about your party, it knows only what is in your prompt. Without the context, you might get games for grown-ups."
                    },
                    ru: {
                        q: "Понятный запрос (промпт) говорит, что тебе нужно, даёт немного контекста и называет нужный формат. Найди для каждой части фразу из одного понятного запроса.",
                        pairs: [
                            ["Что тебе нужно", "Придумай игры для праздника."],
                            ["Немного контекста", "Сестре исполняется 7 лет, она обожает динозавров."],
                            ["Нужный формат", "Напиши их списком из пяти пунктов."]
                        ],
                        why: "Каждая часть помогает чат-боту угадать лучше: о твоём празднике он знает только то, что есть в запросе. Без контекста можно получить игры для взрослых."
                    }
                },
                {
                    type: "reveal", icon: "🗣️",
                    en: {
                        q: "Explain it to a friend: how can a chatbot write a story that nobody has ever written?",
                        answer: [
                            "It learned from a huge amount of text which words usually come after which.",
                            "Then it writes one token at a time, each time picking a likely next one. Every piece is familiar, but together they make a new story."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: как чат-бот может написать историю, которую ещё никто никогда не писал?",
                        answer: [
                            "Он учился на огромном количестве текстов и узнал, какие слова обычно идут за какими.",
                            "Потом он пишет по одному токену и каждый раз выбирает вероятное продолжение. Каждый кусочек ему уже встречался, но вместе они складываются в новую историю."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "**Generative AI** creates new things: text, pictures, sound, code and video.",
                            "A chatbot runs on a **large language model (LLM)**. It writes token by token: it works out how likely each next token is, picks one and repeats.",
                            "A chatbot can sound sure and still make things up (a **hallucination**), so check important facts in a trusted source."
                        ]
                    },
                    ru: {
                        points: [
                            "**Генеративный ИИ** создаёт новое: тексты, картинки, звук, код и видео.",
                            "Чат-бот работает на **большой языковой модели (LLM)**. Она пишет токен за токеном: вычисляет, насколько вероятен каждый следующий токен, выбирает один и повторяет.",
                            "Чат-бот может звучать уверенно и всё равно выдумывать (это **галлюцинация**), поэтому важные факты проверяй в надёжном источнике."
                        ]
                    }
                }
            ]
        },

        /* ----- l5. AI in Everyday Life: practice ----- */
        l5: {
            steps: [
                {
                    type: "info", icon: "📱",
                    en: {
                        title: "AI you use without noticing",
                        text: [
                            "AI rarely looks like a robot. It hides inside things you use every day: your phone, your apps, your maps.",
                            "Listen to a few songs, skip one, play another twice, and soon a music app offers you a playlist “made for you”. It worked out your taste from what you did."
                        ]
                    },
                    ru: {
                        title: "ИИ, которого ты не замечаешь",
                        text: [
                            "ИИ редко похож на робота. Он прячется в вещах, которыми ты пользуешься каждый день: в телефоне, в приложениях, в картах.",
                            "Послушай несколько песен, одну пропусти, другую включи дважды — и вскоре музыкальное приложение предложит плейлист «специально для тебя». Твой вкус оно узнало по твоим же действиям."
                        ]
                    }
                },
                {
                    type: "match", card: "l5a",
                    en: {
                        q: "Each of these uses AI. Match it with what its AI does.",
                        pairs: [
                            ["Face unlock", "Recognises your face"],
                            ["A voice assistant", "Answers questions you ask out loud"],
                            ["A map app", "Predicts traffic and finds a fast route"],
                            ["A spam filter", "Keeps junk emails out of your inbox"]
                        ],
                        why: "You meet AI many times a day, often without noticing: it recognises your face, answers your questions, predicts traffic and sorts your emails."
                    },
                    ru: {
                        q: "Во всём этом есть ИИ. Найди, что он делает в каждом случае.",
                        pairs: [
                            ["Разблокировка по лицу", "Узнаёт твоё лицо"],
                            ["Голосовой помощник", "Отвечает на вопросы, заданные вслух"],
                            ["Приложение с картами", "Предсказывает пробки и ищет быстрый путь"],
                            ["Спам-фильтр", "Не пускает мусорные письма во входящие"]
                        ],
                        why: "Ты встречаешь ИИ много раз в день, часто даже не замечая: он узнаёт твоё лицо, отвечает на вопросы, предсказывает пробки и сортирует письма."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "You type “Happy” and your phone keyboard suggests “birthday”. Why that word?",
                        options: ["It learned to guess what often comes next", "It picks a word from the dictionary at random", "It suggests “birthday” after any word at all"],
                        hint: "Think of how a chatbot picks its next token.",
                        why: "The keyboard predicts the next word, a bit like a chatbot: it learned which words usually come after which. It does not know whose birthday it is."
                    },
                    ru: {
                        q: "Ты набираешь «С днём», а клавиатура телефона предлагает «рождения». Почему именно это слово?",
                        options: ["Она научилась угадывать, что часто идёт дальше", "Она выбирает случайное слово из словаря", "Она предлагает «рождения» после любого слова"],
                        hint: "Вспомни, как чат-бот выбирает следующий токен.",
                        why: "Клавиатура, примерно как чат-бот, предсказывает следующее слово: она выучила, какие слова обычно идут за какими. А у кого день рождения, она не знает."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Sam never presses “like” and says: “So the video app can't know what I enjoy.” Is that true?",
                        options: ["No: watching, skipping and replaying teach it too", "Yes: an app can only learn from likes", "Yes: without likes, everyone gets the same videos"],
                        hint: "What else does the app see you do?",
                        why: "A like is only one clue. The recommendation system also learns from what you watch to the end, what you skip and what you watch again."
                    },
                    ru: {
                        q: "Саша никогда не ставит лайки и говорит: «Значит, приложение с видео не может знать, что мне нравится». Так ли это?",
                        options: ["Нет: его учат и просмотры, и пропуски, и повторы", "Да: приложение учится только на лайках", "Да: без лайков всем показывают одни и те же видео"],
                        hint: "Что ещё приложение видит из того, что ты делаешь?",
                        why: "Лайк — лишь одна из подсказок. Рекомендательная система учится и на том, что ты досматриваешь до конца, пропускаешь и пересматриваешь."
                    }
                },
                {
                    type: "order", card: "l5b",
                    en: {
                        q: "How does a video app's recommendation system choose what to show you next? Put the steps in order, from what you do to what you see.",
                        items: ["You watch, like, skip or replay videos", "The system keeps track of what you did", "It finds people who enjoyed the same things", "It shows you what those people enjoyed"],
                        hint: "The system can only learn once it has some data about you.",
                        why: "Your actions are its data. It compares you with people who acted the same way and guesses you will enjoy what they enjoyed. Then your next click teaches it again."
                    },
                    ru: {
                        q: "Как рекомендательная система в приложении с видео выбирает, что показать тебе дальше? Расставь шаги по порядку: от того, что ты делаешь, до того, что ты видишь.",
                        items: ["Ты смотришь, лайкаешь, пропускаешь или пересматриваешь видео", "Система запоминает, что ты делаешь", "Она находит людей, которым нравится то же самое", "Она показывает тебе то, что понравилось этим людям"],
                        hint: "Система может учиться, только когда у неё есть данные о тебе.",
                        why: "Твои действия — это её данные. Она сравнивает тебя с людьми, которые вели себя так же, и угадывает, что тебе понравится то же, что и им. А твой следующий клик снова её учит."
                    }
                },
                {
                    type: "info", icon: "🎯",
                    en: {
                        title: "A feed has a goal",
                        text: [
                            "A recommendation system is built to keep you watching for as long as possible. So it picks what you will probably keep watching.",
                            "That is not always what is useful, true or good for you. And the more you watch of one kind, the more of that kind you usually get."
                        ]
                    },
                    ru: {
                        title: "У ленты есть цель",
                        text: [
                            "Рекомендательная система создана, чтобы удерживать тебя у экрана как можно дольше. Поэтому она выбирает то, что ты, скорее всего, будешь смотреть и дальше.",
                            "Это не всегда полезное, правдивое или хорошее для тебя. И чем больше ты смотришь чего-то одного, тем больше этого же тебе обычно показывают."
                        ]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Leo loves one football team. His feed is full of videos saying it is the best team ever, so he thinks everybody agrees. What is the mistake?",
                        options: ["His feed shows him only a small part of what people think", "A feed shows what most people think, so he is right", "Everyone gets the same feed, so everyone sees these videos", "A feed only shows videos that are true"],
                        hint: "Who chose the videos in Leo's feed, and how?",
                        why: "The feed learned what Leo likes and shows him more of it: a **filter bubble**. Fans of other teams may see very different videos."
                    },
                    ru: {
                        q: "Лёва обожает одну футбольную команду. Его лента полна видео о том, что это лучшая команда на свете, и ему кажется, что так думают все. В чём ошибка?",
                        options: ["Лента показывает ему лишь малую часть того, что думают люди", "Лента показывает мнение большинства, так что всё верно", "У всех одна и та же лента, так что все видят эти видео", "В ленте бывают только правдивые видео"],
                        hint: "Кто подобрал видео для ленты Лёвы и как?",
                        why: "Лента узнала, что нравится Лёве, и показывает ему больше того же — это **информационный пузырь**. Болельщики других команд могут видеть совсем другие видео."
                    }
                },
                {
                    type: "sort", card: "l5c",
                    en: {
                        q: "Does this keep you in control of your feed, or does it let the feed take over?",
                        groups: ["You stay in control", "The feed takes over"],
                        items: [
                            ["Searching for a topic that is new to you", 0],
                            ["Letting videos start one after another by themselves", 1],
                            ["Scrolling on even though you are bored", 1],
                            ["Following people who like different things", 0],
                            ["Watching only what the feed picks for you", 1],
                            ["Taking a break when it stops being fun", 0]
                        ],
                        why: "Searching, following different voices and taking breaks are your own choices. When you just let it run, the feed decides, and it is built to keep you watching."
                    },
                    ru: {
                        q: "Это помогает тебе управлять лентой или отдаёт управление ленте?",
                        groups: ["Управляешь ты", "Управляет лента"],
                        items: [
                            ["Искать новую для себя тему", 0],
                            ["Смотреть видео за видео, которые включаются сами", 1],
                            ["Листать дальше, хотя уже скучно", 1],
                            ["Подписываться на людей с другими увлечениями", 0],
                            ["Смотреть только то, что подбирает лента", 1],
                            ["Делать перерыв, когда становится не весело", 0]
                        ],
                        why: "Искать новое, подписываться на разных людей и делать перерывы — это твой выбор. А когда ты просто листаешь, решает лента. А она создана, чтобы удерживать тебя у экрана."
                    }
                },
                {
                    type: "reveal", icon: "🗣️",
                    en: {
                        q: "Explain it to a friend: why can two people open the same video app and see completely different videos?",
                        answer: [
                            "The recommendation system learns from what each of them watches, likes, skips and replays.",
                            "It compares each person with others who like similar things and guesses what will keep them watching. So every feed is made for one person."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: почему два человека открывают одно и то же приложение с видео, а видят совсем разные ролики?",
                        answer: [
                            "Рекомендательная система учится на том, что каждый из них смотрит, лайкает, пропускает и пересматривает.",
                            "Она сравнивает каждого с людьми, у которых похожие вкусы, и угадывает, что удержит его у экрана. Поэтому каждая лента сделана для одного человека."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "AI hides in everyday things: face unlock, your keyboard, maps, feeds and spam filters.",
                            "A **recommendation system** learns from what you watch, like, skip and replay, and it is built to keep you watching.",
                            "Search for new topics, follow different voices and take breaks to get out of a **filter bubble** and stay in control."
                        ]
                    },
                    ru: {
                        points: [
                            "ИИ прячется в обычных вещах: разблокировка по лицу, клавиатура, карты, ленты и спам-фильтры.",
                            "**Рекомендательная система** учится на том, что ты смотришь, лайкаешь, пропускаешь и пересматриваешь, и создана, чтобы удерживать тебя у экрана.",
                            "Ищи новые темы, подписывайся на разных людей и делай перерывы — так легче выбраться из **информационного пузыря** и сохранить контроль."
                        ]
                    }
                }
            ]
        },

        /* ----- l6. AI Ethics & Safety: practice ----- */
        l6: {
            steps: [
                {
                    type: "info", icon: "⚖️",
                    en: {
                        title: "Smart tools need careful people",
                        text: [
                            "AI learns from data that people made, so it can pick up their unfairness: this is called **bias**. AI can also make **deepfakes**: fakes that look real. And it may keep what you type.",
                            "Imagine a voice assistant that learned mostly from grown-ups' voices. It may understand your parents perfectly but keep mishearing you. Nobody meant to be unfair: the data was one-sided."
                        ]
                    },
                    ru: {
                        title: "Умным инструментам нужны внимательные люди",
                        text: [
                            "ИИ учится на данных, которые создали люди, поэтому может перенять и их несправедливость — это **предвзятость**. А ещё ИИ умеет делать **дипфейки** — подделки, которые выглядят как настоящие. И он может сохранять то, что ты пишешь.",
                            "Представь голосового помощника, который учился в основном на голосах взрослых. Родителей он может понимать отлично, а тебя — часто понимать неправильно. Никто не хотел быть несправедливым: просто данные были однобокими."
                        ]
                    }
                },
                {
                    type: "choice", card: "l6a",
                    en: {
                        q: "A team is building an AI that reads children's handwriting. Which training data will help it work fairly for every child?",
                        options: ["Writing from many children, neat and messy", "Lots of writing from the ten neatest children", "Writing from adults, because it is clearer", "One page of neat writing, copied many times"],
                        hint: "An AI can only learn from what is in its data.",
                        why: "An AI learns only from its data. If it sees all kinds of handwriting, it can learn to read everyone's. One-sided data, however much of it, teaches it to read only some children well."
                    },
                    ru: {
                        q: "Команда создаёт ИИ, который читает детский почерк. На каких данных его лучше обучить, чтобы он справедливо работал для каждого ребёнка?",
                        options: ["Почерк многих детей — и аккуратный, и неаккуратный", "Много страниц от десяти самых аккуратных детей", "Почерк взрослых: он ведь понятнее", "Одна аккуратная страница, скопированная много раз"],
                        hint: "ИИ может научиться только тому, что есть в его данных.",
                        why: "ИИ учится только на своих данных. Если он увидит самый разный почерк, то сможет научиться читать почерк всех детей. Однобокие данные, сколько бы их ни было, научат его хорошо читать почерк только некоторых."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "A team wants its new AI to be fair to everyone. Put their steps in order.",
                        items: ["Collect data from many different kinds of people", "Train the AI on that data", "Test it on different groups before anyone uses it", "Keep checking its results once people use it"],
                        hint: "What does an AI need before it can learn anything?",
                        why: "The AI copies what is in its data, so varied data comes first. Testing finds problems before they hurt anyone, and people keep checking, because some problems only show up later."
                    },
                    ru: {
                        q: "Команда хочет, чтобы её новый ИИ был справедлив ко всем. Расставь её шаги по порядку.",
                        items: ["Собрать данные о самых разных людях", "Обучить ИИ на этих данных", "Проверить его на разных группах людей до запуска", "Продолжать проверять результаты, когда им уже пользуются"],
                        hint: "Что нужно ИИ, прежде чем он сможет чему-то научиться?",
                        why: "ИИ копирует то, что есть в данных, поэтому сначала — разнообразные данные. Проверка находит проблемы, пока они никому не навредили, а люди продолжают следить за результатами, потому что некоторые проблемы видны только позже."
                    }
                },
                {
                    type: "choice", card: "l6b",
                    en: {
                        q: "Scammers can copy a person's voice from a short recording. How does a secret family code word help?",
                        options: ["A voice can be copied, but not the secret word", "It stops scammers from ever calling your phone", "It makes any copied voice sound like a robot", "It tells your phone to block fake voices"],
                        hint: "What can a fake copy, and what can it not?",
                        why: "A copied voice can sound just like someone in your family, but only your real family knows the code word. If a caller does not know it, end the call and tell an adult you trust."
                    },
                    ru: {
                        q: "Мошенники могут скопировать голос человека по короткой записи. Чем тут поможет секретное семейное кодовое слово?",
                        options: ["Голос скопировать можно, а секретное слово — нет", "Мошенники больше никогда не смогут позвонить", "Любой поддельный голос начнёт звучать как робот", "Телефон начнёт блокировать поддельные голоса"],
                        hint: "Что подделка может скопировать, а что — нет?",
                        why: "Поддельный голос может звучать точь-в-точь как голос кого-то из семьи, но кодовое слово знает только настоящая семья. Если звонящий его не знает, заканчивай разговор и расскажи взрослому, которому доверяешь."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Mia thinks her chats with a chatbot are as private as a locked diary. What is true?",
                        options: ["Her messages may be stored and used to train AI", "Her chats disappear the moment she closes the app", "Nobody but Mia can ever see what she typed", "Her messages stay only on her own phone"],
                        hint: "Where do your words go when you send them to a chatbot?",
                        why: "What you type may be stored and even used to train future models. So passwords, your address, private photos and secrets stay out of the chat."
                    },
                    ru: {
                        q: "Маша думает, что её переписка с чат-ботом так же надёжно скрыта, как дневник на замке. Что верно?",
                        options: ["Её сообщения могут сохраняться и идти на обучение ИИ", "Переписка исчезает, как только она закрывает приложение", "Никто, кроме Маши, никогда не увидит её сообщения", "Её сообщения хранятся только в её телефоне"],
                        hint: "Куда попадают твои слова, когда ты отправляешь их чат-боту?",
                        why: "То, что ты пишешь, может сохраняться и даже использоваться для обучения будущих моделей. Поэтому паролям, адресу, личным фото и секретам в переписке не место."
                    }
                },
                {
                    type: "info", icon: "🔍",
                    en: {
                        title: "Why a person checks",
                        text: [
                            "An AI can be right most of the time and still be badly wrong about one person. If it suggests a song you do not like, that hardly matters.",
                            "But when the decision is about someone's health, a job or a court case, one mistake can change a life. So a person should check the AI's answer, and the people who build and use the AI are responsible for it."
                        ]
                    },
                    ru: {
                        title: "Почему проверяет человек",
                        text: [
                            "ИИ может почти всегда отвечать верно и всё равно сильно ошибиться насчёт одного человека. Если он предложит песню, которая тебе не нравится, — ничего страшного.",
                            "Но когда речь о чьём-то здоровье, работе или деле в суде, одна ошибка может изменить жизнь. Поэтому ответ ИИ должен проверять человек, а отвечают за ИИ люди, которые его создают и используют."
                        ]
                    }
                },
                {
                    type: "sort", card: "l6c",
                    en: {
                        q: "Can an AI decide this alone, or should a person check it?",
                        groups: ["Fine for AI to decide", "A person should check"],
                        items: [
                            ["Which photo filter to suggest", 0],
                            ["Whether someone gets a job", 1],
                            ["Which medicine a patient gets", 1],
                            ["Which sticker to suggest in a chat", 0],
                            ["A decision in a court case", 1],
                            ["Which word to suggest as you type", 0]
                        ],
                        why: "Filters, stickers and word suggestions are small choices: a mistake costs little. Jobs, medicine and court cases change people's lives, so a person should check, and people stay responsible."
                    },
                    ru: {
                        q: "Это может решить ИИ или нужна проверка человека?",
                        groups: ["Может решить ИИ", "Нужна проверка человека"],
                        items: [
                            ["Какой фильтр предложить для фото", 0],
                            ["Возьмут ли человека на работу", 1],
                            ["Какое лекарство получит пациент", 1],
                            ["Какой стикер подсказать в чате", 0],
                            ["Решение по делу в суде", 1],
                            ["Какое слово подсказать, пока ты печатаешь", 0]
                        ],
                        why: "Фильтры, стикеры и подсказки слов — мелочи: ошибка стоит немного. Работа, лечение и суд меняют жизнь людей, поэтому такие решения должен проверять человек, а отвечают за них люди."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "Match each risk with what helps against it.",
                        pairs: [
                            ["Bias in an AI", "Data from many different kinds of people"],
                            ["A photo online that may be fake", "Checking who posted it"],
                            ["A chatbot keeping what you type", "Never typing passwords or your address"],
                            ["A mistake in a medical decision", "A doctor who checks the AI's advice"]
                        ],
                        why: "Each risk has its own protection: varied data against bias, checking the source against fakes, care with what you type, and a person who checks important decisions."
                    },
                    ru: {
                        q: "Найди для каждого риска то, что от него защищает.",
                        pairs: [
                            ["Предвзятость ИИ", "Данные о самых разных людях"],
                            ["Фото в сети, которое может быть подделкой", "Проверить, кто его опубликовал"],
                            ["Чат-бот сохраняет то, что ты пишешь", "Не писать пароли и свой адрес"],
                            ["Ошибка в решении о лечении", "Врач, который проверяет совет ИИ"]
                        ],
                        why: "У каждого риска своя защита: разнообразные данные — от предвзятости, проверка источника — от подделок, осторожность — когда пишешь чат-боту, и человек, который проверяет важные решения."
                    }
                },
                {
                    type: "reveal", icon: "🎬",
                    en: {
                        q: "Explain it to a friend: a film and a scammer can both use a deepfake. What is the difference?",
                        answer: [
                            "In a film, everyone knows the story is made up, so nobody is fooled.",
                            "A scammer makes a fake to trick people, for example to get their money. That is why you check where a video or a call really comes from."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: дипфейк могут использовать и в кино, и мошенники. В чём разница?",
                        answer: [
                            "В кино все знают, что история выдуманная, поэтому никого не обманывают.",
                            "Мошенник делает подделку, чтобы обмануть людей, например выманить деньги. Поэтому важно проверять, откуда на самом деле видео и кто на самом деле звонит."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "AI can copy unfairness, called **bias**, from its data. Varied data, testing and people checking help make it fairer.",
                            "**Deepfakes** look and sound more and more real: check where something comes from before you believe or share it.",
                            "Keep passwords, your address and secrets out of chats, and let a person check important decisions."
                        ]
                    },
                    ru: {
                        points: [
                            "ИИ может перенять из данных несправедливость — **предвзятость**. Разнообразные данные, проверки и контроль людей помогают сделать его справедливее.",
                            "**Дипфейки** выглядят и звучат всё реалистичнее: прежде чем верить или делиться, проверяй, откуда это взялось.",
                            "Не пиши в чатах пароли, адрес и секреты, а важные решения пусть проверяет человек."
                        ]
                    }
                }
            ]
        },

        /* ----- l7. How Computers See: practice ----- */
        l7: {
            steps: [
                {
                    type: "info", icon: "👁️",
                    en: {
                        title: "Seeing means finding patterns",
                        text: [
                            "A computer never sees a face or a cat: it gets a grid of numbers. Small filters slide over that grid and find edges, and layer by layer a network builds them into shapes and whole objects.",
                            "That is how a phone camera can draw a box around each face before you take a photo. It does not know what a face is: it has found the pattern that faces make in the numbers."
                        ]
                    },
                    ru: {
                        title: "Видеть — значит находить узоры",
                        text: [
                            "Компьютер никогда не видит лицо или кошку: он получает сетку чисел. По этой сетке скользят маленькие фильтры и находят края, а слой за слоем нейросеть собирает из них формы и целые предметы.",
                            "Так камера телефона может обвести рамкой каждое лицо ещё до того, как ты сделаешь снимок. Что такое лицо, она не знает: она нашла узор, который лица оставляют в числах."
                        ]
                    }
                },
                {
                    type: "number", answer: 36, card: "l7a",
                    en: {
                        q: "A tiny colour picture is 4 pixels wide and 3 pixels tall. How many numbers does the computer need to keep it?",
                        hint: "First count the pixels. Then think: how many numbers does one colour pixel have?",
                        why: "4 × 3 = 12 pixels, and each colour pixel has three numbers: how much red, green and blue light it has. 12 × 3 = 36 numbers."
                    },
                    ru: {
                        q: "Крошечная цветная картинка — 4 пикселя в ширину и 3 в высоту. Сколько чисел нужно компьютеру, чтобы её хранить?",
                        hint: "Сначала посчитай пиксели. А потом подумай: сколько чисел у одного цветного пикселя?",
                        why: "4 × 3 = 12 пикселей, и у каждого цветного пикселя три числа: сколько в нём красного, зелёного и синего света. 12 × 3 = 36 чисел."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "A colour pixel has three numbers: how much red, green and blue light it has. Here each one goes from 0 (none) to 255 (the most). What colour is each pixel?",
                        pairs: [
                            ["Red 0, green 0, blue 0", "Black"],
                            ["Red 255, green 255, blue 255", "White"],
                            ["Red 120, green 120, blue 120", "Grey"],
                            ["Red 0, green 0, blue 255", "Blue"]
                        ],
                        why: "No light at all gives black, and all three lights at full give white. The same amount of all three, somewhere in between, gives grey, and blue light alone gives blue."
                    },
                    ru: {
                        q: "У цветного пикселя три числа: сколько в нём красного, зелёного и синего света. Здесь каждое число — от 0 (совсем нет) до 255 (больше всего). Какого цвета каждый пиксель?",
                        pairs: [
                            ["Красный 0, зелёный 0, синий 0", "Чёрный"],
                            ["Красный 255, зелёный 255, синий 255", "Белый"],
                            ["Красный 120, зелёный 120, синий 120", "Серый"],
                            ["Красный 0, зелёный 0, синий 255", "Синий"]
                        ],
                        why: "Когда света нет совсем, получается чёрный, а когда все три на полную — белый. Если всех трёх поровну где-то посередине, выходит серый, а один только синий свет даёт синий."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A filter that finds edges slides over a picture of a black square on white paper. Where are its sums big?",
                        options: ["Along the sides of the square", "In the middle of the black square", "On the white paper, far from the square", "The same everywhere in the picture"],
                        hint: "Where does the picture change from one colour to another?",
                        why: "Where everything is one colour, the sum is zero or close to it. Only where black meets white is there an edge for the filter to find, so only there is the sum big."
                    },
                    ru: {
                        q: "Фильтр, который ищет края, скользит по картинке: чёрный квадрат на белой бумаге. Где его суммы большие?",
                        options: ["Вдоль сторон квадрата", "В середине чёрного квадрата", "На белой бумаге, вдали от квадрата", "Везде на картинке одинаковые"],
                        hint: "Где на картинке один цвет сменяется другим?",
                        why: "Там, где всё одного цвета, сумма нулевая или почти нулевая. Только там, где чёрное встречается с белым, есть край, который ищет фильтр, поэтому только там сумма большая."
                    }
                },
                {
                    type: "choice", card: "l7b",
                    en: {
                        q: "Some people think that programmers write the numbers in every filter of a convolutional neural network (CNN) by hand. What really happens?",
                        options: ["The network learns them from many labelled photos", "Programmers really do type in every number", "The numbers are copied from one photo of each object", "The camera sets them when it takes a photo"],
                        hint: "Think about how a model learns anything at all.",
                        why: "Nobody writes these filters by hand. While the network trains on labelled photos, it keeps adjusting their numbers until the filters find useful edges, textures and parts."
                    },
                    ru: {
                        q: "Некоторые думают, что числа в каждом фильтре свёрточной нейронной сети (CNN) программисты пишут вручную. Как на самом деле?",
                        options: ["Сеть сама подбирает их, обучаясь на подписанных фото", "Программисты и правда вписывают каждое число", "Их копируют с одной фотографии каждого предмета", "Их выставляет камера, когда делает снимок"],
                        hint: "Подумай, как модель вообще чему-то учится.",
                        why: "Эти фильтры никто не пишет вручную. Пока сеть учится на подписанных фото, она подстраивает их числа, и в итоге фильтры находят полезные края, текстуры и части."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "A CNN looks at a photo of a dog. Put what its layers usually find in order, from the first layer to the last.",
                        items: ["Short edges and spots of colour", "Corners, curves and furry textures", "Parts: ears, a nose, paws", "A whole dog"],
                        hint: "Each layer builds on what the layer before it found.",
                        why: "The first layer finds the simplest things. Each next layer combines what came before: edges into corners and textures, those into parts, and the parts into a whole dog."
                    },
                    ru: {
                        q: "Свёрточная сеть смотрит на фото собаки. Расставь по порядку, что обычно находят её слои, от первого к последнему.",
                        items: ["Короткие края и цветные пятна", "Углы, изгибы и пушистая текстура", "Части: уши, нос, лапы", "Собака целиком"],
                        hint: "Каждый слой опирается на то, что нашёл слой перед ним.",
                        why: "Первый слой находит самое простое. Каждый следующий собирает найденное раньше: края — в углы и текстуры, их — в части, а части — в целую собаку."
                    }
                },
                {
                    type: "info", icon: "🐄",
                    en: {
                        title: "When a pattern misleads",
                        text: [
                            "A model picks up any pattern that helps it get its training photos right. If every cow in those photos stood on green grass, “green all around” may become part of its cow pattern.",
                            "Show it a cow on a sandy beach, and it may miss the cow. You know what a cow is; the model only knows patterns."
                        ]
                    },
                    ru: {
                        title: "Когда узор подводит",
                        text: [
                            "Модель подхватывает любой узор, который помогает ей верно отвечать на обучающих фото. Если на всех этих фото коровы стояли на зелёной траве, «зелёное вокруг» может стать частью её узора «корова».",
                            "Покажи ей корову на песчаном пляже — и она может корову не заметить. Ты знаешь, что такое корова, а модель знает только узоры."
                        ]
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "A model learned to spot cats from thousands of clear daytime photos of real cats. Which new pictures might confuse it?",
                        groups: ["Might confuse it", "Likely fine"],
                        items: [
                            ["A photo of a cat in a very dark room", 0],
                            ["A clear daytime photo of a cat it has never seen", 1],
                            ["A cat photographed from straight above", 0],
                            ["A sunny photo of a cat sitting on a sofa", 1],
                            ["A cartoon drawing of a cat", 0],
                            ["A clear photo of a grey cat in a garden", 1],
                            ["A cat photo with a tiny change you cannot see, made to trick the model", 0]
                        ],
                        why: "Darkness, an odd angle, a drawing and a hidden trick (an **adversarial example**) can all confuse it. A new cat in a clear daytime photo shows the same patterns the model learned, even though it never saw that cat."
                    },
                    ru: {
                        q: "Модель научилась узнавать кошек по тысячам чётких дневных фото настоящих кошек. Какие новые картинки могут её запутать?",
                        groups: ["Может запутать", "Скорее всего, справится"],
                        items: [
                            ["Фото кошки в очень тёмной комнате", 0],
                            ["Чёткое дневное фото кошки, которую модель не видела", 1],
                            ["Кошка, снятая прямо сверху", 0],
                            ["Солнечное фото кошки на диване", 1],
                            ["Мультяшный рисунок кошки", 0],
                            ["Чёткое фото серой кошки в саду", 1],
                            ["Фото кошки с крошечной незаметной правкой, сделанной, чтобы обмануть модель", 0]
                        ],
                        why: "Темнота, необычный ракурс, рисунок и хитрая правка (**состязательный пример**) могут её запутать. А на чётком дневном фото новой кошки — те же узоры, что выучила модель, хоть эту кошку она и не видела."
                    }
                },
                {
                    type: "choice", card: "l7c",
                    en: {
                        q: "A vision model says it is very sure that a photo shows a sheep. What does that mean?",
                        options: ["It found patterns it learned for sheep", "There is surely a sheep in the photo", "The model understands what a sheep is", "A person has already checked the photo"],
                        why: "Vision models find patterns, not meaning. They can be very sure and still wrong, which is why systems where safety is at stake are tested so carefully."
                    },
                    ru: {
                        q: "Модель зрения сообщает, что очень уверена: на фото овца. Что это значит?",
                        options: ["Она нашла узоры, знакомые по овцам", "На фото точно есть овца", "Модель понимает, что такое овца", "Фото уже проверил человек"],
                        why: "Модели зрения находят узоры, а не смысл. Они могут быть очень уверены и всё равно ошибаться, поэтому системы, от которых зависит безопасность, проверяют особенно тщательно."
                    }
                },
                {
                    type: "reveal", icon: "💬",
                    en: {
                        q: "Explain it to a friend: how can a small grid of numbers find the edges in a photo?",
                        answer: [
                            "A filter is a small grid of numbers. It slides over the picture, and at each spot it multiplies the pixels under it by its own numbers and adds everything up.",
                            "Where the picture has an edge like the one the filter looks for, the sum is big; on a flat colour, it is about zero."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: как маленькая сетка чисел находит края на фотографии?",
                        answer: [
                            "Фильтр — это маленькая сетка чисел. Он скользит по картинке и в каждом месте умножает пиксели под собой на свои числа, а потом всё складывает.",
                            "Там, где на картинке есть край, похожий на тот, что ищет фильтр, сумма большая, а на ровном одноцветном месте — почти ноль."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "To a computer, a picture is a grid of numbers: one per pixel, or three (red, green, blue) for a colour pixel.",
                            "A filter slides over the picture, multiplying and adding up (a **convolution**), and its sum is big where its pattern is. A CNN learns its own filters from labelled photos, from edges up to whole objects.",
                            "Vision models find patterns, not meaning. Darkness, odd angles, unusual pictures and adversarial examples can fool them, even when they are very sure."
                        ]
                    },
                    ru: {
                        points: [
                            "Для компьютера картинка — сетка чисел: одно число на пиксель или три (красный, зелёный, синий) на цветной пиксель.",
                            "Фильтр скользит по картинке, умножает и складывает (это **свёртка**), и там, где есть его узор, сумма большая. Свёрточная сеть сама учит свои фильтры на подписанных фото — от краёв до целых предметов.",
                            "Модели зрения находят узоры, а не смысл. Темнота, необычный ракурс, непохожие картинки и состязательные примеры могут их обмануть, даже когда модель очень уверена."
                        ]
                    }
                }
            ]
        },

        /* ----- l8. Learning by Trial and Error: practice ----- */
        l8: {
            steps: [
                {
                    type: "info", icon: "🎯",
                    en: {
                        title: "Try, score, try again",
                        text: [
                            "In reinforcement learning, nobody tells the agent the right moves. It tries something, gets a reward (a number that says how well it did) and slowly works out which actions pay off over time.",
                            "It is like learning to throw a paper ball into a bin from across the room. Nobody gives you the perfect angle: you throw, see where the ball lands and change your throw a little each time."
                        ]
                    },
                    ru: {
                        title: "Попробуй, получи очки, попробуй снова",
                        text: [
                            "В обучении с подкреплением правильных ходов агенту никто не подсказывает. Он что-то пробует, получает награду — число, которое говорит, насколько хорошо вышло, — и постепенно выясняет, какие действия со временем окупаются.",
                            "Это похоже на то, как учатся попадать бумажным комком в корзину через всю комнату. Идеального угла никто не подскажет: бросаешь, смотришь, куда упал комок, и каждый раз чуть-чуть меняешь бросок."
                        ]
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "A program learns to play a snake game by trial and error. Match each part of reinforcement learning with the part of the game.",
                        pairs: [
                            ["Agent", "The program that steers the snake"],
                            ["Environment", "The board, with its apples and walls"],
                            ["Action", "Turning left or right, or going straight on"],
                            ["Reward", "Points for every apple the snake eats"]
                        ],
                        why: "The agent is the learner, the environment is the world it acts in, actions are what it can do there, and the reward is the number that says how well it did."
                    },
                    ru: {
                        q: "Программа учится играть в змейку методом проб и ошибок. Найди для каждой части обучения с подкреплением её место в игре.",
                        pairs: [
                            ["Агент", "Программа, которая управляет змейкой"],
                            ["Среда", "Поле с яблоками и стенами"],
                            ["Действие", "Повернуть налево, направо или двигаться прямо"],
                            ["Награда", "Очки за каждое съеденное яблоко"]
                        ],
                        why: "Агент — тот, кто учится, среда — мир, в котором он действует, действия — то, что он может там делать, а награда — число, которое говорит, насколько хорошо он справился."
                    }
                },
                {
                    type: "choice", card: "l8a",
                    en: {
                        q: "Which of these is an example of reinforcement learning?",
                        options: ["A drone gets points for each soft landing and works out how to land", "A model studies photos that are labelled “cat” or “dog”", "A translation program learns from sentences with their correct translations", "A spam filter learns from emails marked “spam” or “not spam”"],
                        hint: "Ask of each one: does the learner get the correct answers, or only a score?",
                        why: "Nobody shows the drone the right moves: it tries, gets points as its reward and finds out what works. The other three learn from examples that come with the correct answers."
                    },
                    ru: {
                        q: "Что из этого — пример обучения с подкреплением?",
                        options: ["Дрон получает очки за каждую мягкую посадку и учится садиться", "Модель изучает фото с подписями «кошка» или «собака»", "Программа-переводчик учится на предложениях с правильными переводами", "Спам-фильтр учится на письмах с пометкой «спам» или «не спам»"],
                        hint: "Спроси про каждый пример: ученику дают правильные ответы или только очки?",
                        why: "Правильных движений дрону никто не показывает: он пробует, получает очки — свою награду — и выясняет, что работает. Остальные три учатся на примерах, к которым уже приложены правильные ответы."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Is each choice exploration or exploitation?",
                        groups: ["Exploration: trying something new", "Exploitation: using what works"],
                        items: [
                            ["Ordering the pizza you always love", 1],
                            ["Trying a pizza topping that is new to you", 0],
                            ["Taking an unknown path in a game to see where it leads", 0],
                            ["Using the jump that always works on this level", 1],
                            ["Reading your favourite book again", 1],
                            ["Picking a book from a shelf you have never looked at", 0]
                        ],
                        why: "Trying something new to learn more is exploration; going back to what you know works is exploitation. You need both: mostly what works, plus a little exploring."
                    },
                    ru: {
                        q: "Это исследование или использование?",
                        groups: ["Исследование: пробовать новое", "Использование: брать то, что работает"],
                        items: [
                            ["Заказать пиццу, которую ты всегда любишь", 1],
                            ["Попробовать совсем новую для тебя начинку", 0],
                            ["Пойти в игре по незнакомой дорожке, чтобы посмотреть, куда она ведёт", 0],
                            ["Сделать прыжок, который на этом уровне всегда срабатывает", 1],
                            ["Перечитать любимую книгу", 1],
                            ["Взять книгу с незнакомой полки", 0]
                        ],
                        why: "Пробовать новое, чтобы узнать больше, — это исследование, а возвращаться к проверенному — использование. Нужно и то и другое: в основном то, что работает, и немного нового."
                    }
                },
                {
                    type: "choice", card: "l8b",
                    en: {
                        q: "An agent always picks the action that has worked best so far and never tries anything new. What can go wrong?",
                        options: ["It can get stuck and miss something better", "It never uses anything it has already learned", "It finds a loophole in its reward", "Nothing: this is always the best way to play"],
                        hint: "Think of a café you like. What if the new place next door is even better?",
                        why: "If it never explores, it may never find out that another action is even better. A good agent explores a small part of the time and uses the best-known choice the rest."
                    },
                    ru: {
                        q: "Агент всегда выбирает действие, которое пока сработало лучше всего, и никогда не пробует новое. Что может пойти не так?",
                        options: ["Он может застрять и упустить что-то получше", "Он никогда не пользуется тем, что уже узнал", "Он находит лазейку в своей награде", "Ничего: так играть всегда лучше всего"],
                        hint: "Вспомни любимое кафе. А что, если новое место по соседству ещё лучше?",
                        why: "Если агент никогда не исследует, он может так и не узнать, что другое действие ещё лучше. Хороший агент небольшую часть времени исследует, а в остальное время выбирает лучший известный вариант."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "How does an agent learn what each move is worth? Put the steps in order.",
                        items: ["Each move's score starts as a guess", "The agent tries a move and sees what happens", "It nudges that move's score a little towards the result", "After many tries, good moves have high scores"],
                        hint: "What does the agent have before it has tried anything?",
                        why: "These scores are often called Q-values. They start as guesses and get better with every try. A score counts what comes after too, so a move with no reward right now can still score high if it leads to a big reward later."
                    },
                    ru: {
                        q: "Как агент узнаёт, сколько стоит каждый ход? Расставь шаги по порядку.",
                        items: ["Оценка каждого хода сначала — просто догадка", "Агент делает ход и смотрит, что получилось", "Он немного сдвигает оценку этого хода к результату", "После многих попыток у хороших ходов высокие оценки"],
                        hint: "Что есть у агента, пока он ещё ничего не пробовал?",
                        why: "Эти оценки часто называют Q-значениями. Сначала это догадки, но с каждой попыткой они становятся точнее. Оценка учитывает и то, что будет потом, поэтому ход без награды прямо сейчас может получить высокую оценку, если ведёт к большой награде позже."
                    }
                },
                {
                    type: "choice", card: "l8c",
                    en: {
                        q: "A game agent finds a strange trick that earns lots of points but spoils the game. Why does it use the trick?",
                        options: ["It chases points, not what its makers meant", "It wants to annoy the people who made it", "It got bored of playing the normal way", "Someone secretly taught it the trick"],
                        why: "The agent is not being naughty or bored: it learns whatever brings the most reward. If the points have a loophole, it may find it. This is called reward hacking."
                    },
                    ru: {
                        q: "Игровой агент нашёл странный трюк: очков много, а игра испорчена. Почему он пользуется этим трюком?",
                        options: ["Он гонится за очками, а не за целью создателей", "Он хочет досадить тем, кто его сделал", "Ему надоело играть как обычно", "Кто-то тайком научил его этому трюку"],
                        why: "Агент не вредничает и не скучает: он просто учится тому, что приносит больше всего награды. Если в подсчёте очков есть лазейка, он может её найти. Это называется взломом награды."
                    }
                },
                {
                    type: "info", icon: "⚽",
                    en: {
                        title: "The agent sees only the number",
                        text: [
                            "A reward is what people want, written as a number. The agent never sees the wish itself, only whether the number goes up.",
                            "Reward a football robot for touching the ball, and it may learn to stand next to the ball and tap it again and again, without ever trying to score. The number went up, but the wish did not come true."
                        ]
                    },
                    ru: {
                        title: "Агент видит только число",
                        text: [
                            "Награда — это желание людей, записанное числом. Самого желания агент не видит — только то, растёт ли число.",
                            "Дай роботу-футболисту награду за каждое касание мяча — и он может научиться стоять рядом с мячом и касаться его снова и снова, даже не пытаясь забить гол. Число выросло, а желание так и не сбылось."
                        ]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "You want a robot to keep your bedroom tidy. Which reward would be the hardest for it to hack?",
                        options: ["Points when a person checks the room and finds it tidy", "Points for every toy it picks up from the floor", "Points for every minute it spends moving around", "Points whenever its camera sees no toys on the floor"],
                        hint: "For each reward, ask: could the robot get the points while the room stays messy?",
                        why: "The robot could drop a toy and pick it up again, drive in circles, or point its camera at the ceiling. A person checking the real result is much harder to fool."
                    },
                    ru: {
                        q: "Ты хочешь, чтобы робот поддерживал порядок в твоей комнате. Какую награду ему будет труднее всего взломать?",
                        options: ["Очки, когда человек проверит комнату и увидит порядок", "Очки за каждую игрушку, поднятую с пола", "Очки за каждую минуту, пока он ездит по комнате", "Очки, когда его камера не видит игрушек на полу"],
                        hint: "Про каждую награду спроси себя: может ли робот получить очки, а беспорядок останется?",
                        why: "Робот может уронить игрушку и поднять её снова, кружить по комнате или повернуть камеру к потолку. Человека, который проверяет настоящий результат, обмануть гораздо труднее."
                    }
                },
                {
                    type: "reveal", icon: "💬",
                    en: {
                        q: "Explain it to a friend: nobody shows a game agent the right moves, so how does it get good?",
                        answer: [
                            "It tries actions and gets a reward after them: a number that says how well it did. After each try it nudges its score for that action, so actions that lead to more reward, now or later, get higher scores.",
                            "It mostly uses its best-known actions, but sometimes tries new ones, in case they are even better."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: правильных ходов игровому агенту никто не показывает. Как же он становится сильнее?",
                        answer: [
                            "Он пробует действия и получает за них награду — число, которое говорит, насколько хорошо вышло. После каждой попытки он немного сдвигает оценку этого действия, и действия, которые ведут к большей награде сейчас или позже, получают более высокие оценки.",
                            "Чаще всего он выбирает лучшие известные действия, но иногда пробует новые: вдруг они ещё лучше."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "In **reinforcement learning** an agent learns by trial and error: it acts, gets a reward (a number) and finds out which actions bring the most reward over time. Nobody gives it the right answers.",
                            "A good agent mixes **exploration** (trying something new) with **exploitation** (using what works), for example exploring 1 time in 10.",
                            "An agent chases the number it gets, not what people meant: if the reward has a loophole, it may find it. That is **reward hacking**."
                        ]
                    },
                    ru: {
                        points: [
                            "В **обучении с подкреплением** агент учится методом проб и ошибок: действует, получает награду (число) и выясняет, какие действия приносят больше всего награды со временем. Правильных ответов ему никто не даёт.",
                            "Хороший агент сочетает **исследование** (пробовать новое) и **использование** (брать то, что работает) — например, исследует в 1 случае из 10.",
                            "Агент гонится за числом, которое получает, а не за тем, что имели в виду люди: если в награде есть лазейка, он может её найти. Это **взлом награды**."
                        ]
                    }
                }
            ]
        },

        /* ----- l9. How Chatbots Write: practice ----- */
        l9: {
            steps: [
                {
                    type: "info", icon: "💬",
                    en: {
                        title: "One guess after another",
                        text: [
                            "A chatbot writes its answer one small piece at a time. It guesses the next **token** (a short word or a part of a word), adds it, and guesses again, until the answer is done.",
                            "You play a tiny version of this game too. When a friend says “Could you pass the salt and …”, you can guess “pepper” before they finish."
                        ]
                    },
                    ru: {
                        title: "Догадка за догадкой",
                        text: [
                            "Чат-бот пишет ответ по маленькому кусочку. Он угадывает следующий **токен** — короткое слово или часть слова, — дописывает его и угадывает снова, пока ответ не будет готов.",
                            "Ты тоже играешь в маленькую версию этой игры. Когда друг говорит: «Передай, пожалуйста, соль и …», ты можешь угадать «перец» ещё до того, как он договорит."
                        ]
                    }
                },
                {
                    type: "choice", card: "l9a",
                    en: {
                        q: "You type “Why is the sky blue?” to a chatbot. What does the language model get?",
                        options: ["A list of numbers, one for each token", "One single number for the whole message", "Words it understands the way a person does", "A question it looks up in a list of answers"],
                        why: "The message is cut into tokens (short words, parts of words, punctuation marks), and each token has its own number in the model's vocabulary. So the model works with a list of numbers."
                    },
                    ru: {
                        q: "Ты пишешь чат-боту: «Почему небо голубое?» Что получает языковая модель?",
                        options: ["Список чисел, по одному на каждый токен", "Одно число на всё сообщение", "Слова, которые она понимает, как человек", "Вопрос, который она ищет в списке ответов"],
                        why: "Сообщение режут на токены — короткие слова, части слов, знаки препинания, — и у каждого токена есть свой номер в словаре модели. Так что модель работает со списком чисел."
                    }
                },
                {
                    type: "number", answer: 5, unit: "%",
                    en: {
                        q: "Say that after “Can I have a glass of”, a model gives “water” 60%, “milk” 25% and “juice” 10%. All the other tokens in its vocabulary share the rest. How many per cent is that?",
                        hint: "All the probabilities together make 100%.",
                        why: "60 + 25 + 10 = 95, so all the other tokens share the last 5%. That is small, but not zero: now and then an unlikely token can still be picked."
                    },
                    ru: {
                        q: "Допустим, после «Можно мне стакан» модель даёт «воды» 60%, «молока» 25% и «сока» 10%. Все остальные токены словаря делят остаток. Сколько это процентов?",
                        hint: "Все вероятности вместе дают 100%.",
                        why: "60 + 25 + 10 = 95, так что всем остальным токенам остаётся 5%. Это немного, но не ноль: иногда может выпасть и маловероятный токен."
                    }
                },
                {
                    type: "choice", card: "l9b",
                    en: {
                        q: "Some people think a chatbot finds a ready-made answer and shows it to you. How does it really write its answer?",
                        options: ["It predicts the next token, adds it, and repeats", "It looks up the answer in a huge list of ready answers", "It copies the best answer it can find on a website", "It writes all the words at once, then puts them in order"],
                        why: "A chatbot writes token by token: it guesses the next token, adds it to the text and guesses again. This is called next-token prediction."
                    },
                    ru: {
                        q: "Некоторые думают, что чат-бот находит готовый ответ и показывает его тебе. Как он на самом деле пишет ответ?",
                        options: ["Предсказывает следующий токен, дописывает его и повторяет", "Ищет ответ в огромном списке готовых ответов", "Копирует лучший ответ, который удалось найти на сайте", "Пишет все слова сразу, а потом расставляет их по порядку"],
                        why: "Чат-бот пишет токен за токеном: угадывает следующий токен, дописывает его к тексту и угадывает снова. Это называется предсказанием следующего токена."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A model is guessing the last word of this sentence: “It was snowing, so Ben put on his warm coat, his hat and his …” Which earlier words help it most with that guess?",
                        options: ["“snowing” and “warm coat”", "“Ben” and “his”", "“It” and “so”"],
                        hint: "Which words tell you what kind of thing comes next?",
                        why: "**Attention** lets the model weigh how much each earlier word matters for the next guess. “Snowing” and “warm coat” point to something like “gloves” or “scarf”; “Ben”, “his” and “so” tell it much less."
                    },
                    ru: {
                        q: "Модель угадывает последнее слово во фразе «На улице шёл снег, поэтому Маша надела тёплую куртку, шапку и …». Какие прежние слова помогают ей больше всего?",
                        options: ["«снег» и «тёплую куртку»", "«Маша» и «поэтому»", "«на» и «и»"],
                        hint: "Какие слова подсказывают, что за вещь будет дальше?",
                        why: "**Механизм внимания** позволяет модели взвесить, насколько каждое прежнее слово важно для следующей догадки. «Снег» и «тёплая куртка» подсказывают что-то вроде «варежки» или «шарф», а «Маша», «поэтому» и «и» говорят ей гораздо меньше."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "Match each term with what it means.",
                        pairs: [
                            ["Token", "A small piece of text with its own number"],
                            ["Temperature", "A setting for how adventurous the word choice is"],
                            ["Context window", "How much text the model can look back at"],
                            ["Hallucination", "A confident answer that is made up"]
                        ],
                        why: "A chatbot works with tokens, looks back as far as its context window allows, picks words more or less boldly depending on the temperature, and can hallucinate."
                    },
                    ru: {
                        q: "Найди, что означает каждый термин.",
                        pairs: [
                            ["Токен", "Кусочек текста со своим номером"],
                            ["Температура", "Настройка того, насколько смело модель выбирает слова"],
                            ["Контекстное окно", "Сколько текста модель может охватить взглядом"],
                            ["Галлюцинация", "Уверенный ответ, который выдуман"]
                        ],
                        why: "Чат-бот работает с токенами, оглядывается назад настолько, насколько позволяет контекстное окно, выбирает слова смелее или осторожнее в зависимости от температуры и может галлюцинировать."
                    }
                },
                {
                    type: "info", icon: "🔍",
                    en: {
                        title: "Likely is not the same as true",
                        text: [
                            "For a common question, the right answer appears in lots of text, so the most likely words are often right.",
                            "For a rare question, such as the history of a tiny village or the plot of a little-known book, the model may have seen almost nothing. It still writes the most likely-sounding words, and they may be invented."
                        ]
                    },
                    ru: {
                        title: "Вероятное — не значит верное",
                        text: [
                            "На частый вопрос правильный ответ встречается во множестве текстов, поэтому самые вероятные слова часто оказываются верными.",
                            "А на редкий вопрос — например, об истории крошечной деревни или о сюжете малоизвестной книги — модель могла почти ничего не видеть. Она всё равно пишет самые правдоподобные слова, и они могут оказаться выдуманными."
                        ]
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "A chatbot helps you with these. Which ones should you check in a second, trusted source?",
                        groups: ["Check it first", "No facts to check"],
                        items: [
                            ["The year a castle was built, for your homework", 0],
                            ["Ideas for a name for your new hamster", 1],
                            ["A quote from a famous scientist for your essay", 0],
                            ["A funny poem for a birthday card", 1],
                            ["The titles of three books about volcanoes for a project", 0],
                            ["Ideas for games at a party", 1]
                        ],
                        why: "Dates, quotes and book titles are facts, and a chatbot may make them up, even its sources. Names, poems and party ideas have no facts to get wrong: you only need to like them."
                    },
                    ru: {
                        q: "Чат-бот помогает тебе вот с этим. Что стоит проверить во втором надёжном источнике?",
                        groups: ["Сначала проверить", "Проверять нечего"],
                        items: [
                            ["Год постройки замка для домашнего задания", 0],
                            ["Варианты имени для нового хомяка", 1],
                            ["Цитата известного учёного для сочинения", 0],
                            ["Смешной стишок для поздравительной открытки", 1],
                            ["Названия трёх книг о вулканах для проекта", 0],
                            ["Идеи игр для праздника", 1]
                        ],
                        why: "Даты, цитаты и названия книг — это факты, и чат-бот может их выдумать, даже источники. А в именах, стишках и идеях для игр нет фактов, в которых можно ошибиться: тут главное, чтобы тебе понравилось."
                    }
                },
                {
                    type: "choice", card: "l9c",
                    en: {
                        q: "Why can a chatbot write something that sounds confident but is completely made up?",
                        options: ["It picks likely words, not checked facts", "It copies answers from websites that are wrong", "It makes things up on purpose to test you", "It only goes wrong when its temperature is high"],
                        why: "A language model is trained to guess likely next tokens, not to check facts. So a made-up answer can sound just as sure as a true one: check what matters in a trusted source."
                    },
                    ru: {
                        q: "Почему чат-бот может написать что-то уверенное, но полностью выдуманное?",
                        options: ["Он выбирает вероятные слова, а не проверенные факты", "Он копирует ответы с сайтов, где есть ошибки", "Он нарочно выдумывает, чтобы тебя проверить", "Он ошибается, только когда у него высокая температура"],
                        why: "Языковую модель учат угадывать вероятный следующий токен, а не проверять факты. Поэтому выдуманный ответ может звучать так же уверенно, как правдивый: важное проверяй в надёжном источнике."
                    }
                },
                {
                    type: "reveal", icon: "🗣️",
                    en: {
                        q: "Explain it to a friend: how does a chatbot write an answer, and why can it be wrong?",
                        answer: [
                            "It cuts your message into tokens and turns each one into a number. Then it guesses the next token again and again, adding one at a time, and attention helps it use the earlier words.",
                            "It picks likely words, not checked facts, so it can sound sure and still be wrong."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: как чат-бот пишет ответ и почему он может ошибаться?",
                        answer: [
                            "Он режет твоё сообщение на токены и превращает каждый в число. Потом снова и снова угадывает следующий токен и дописывает по одному, а механизм внимания помогает ему учитывать прежние слова.",
                            "Он выбирает вероятные слова, а не проверенные факты, поэтому может звучать уверенно и всё равно ошибаться."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A chatbot cuts text into **tokens** (short words, parts of words, punctuation marks) and turns each one into a number.",
                            "It writes by guessing the next token again and again, picking from probabilities; **attention** helps it use the earlier words.",
                            "It picks likely words, not checked facts, so it can **hallucinate**: check facts, dates and quotes in a second, trusted source."
                        ]
                    },
                    ru: {
                        points: [
                            "Чат-бот режет текст на **токены** (короткие слова, части слов, знаки препинания) и превращает каждый в число.",
                            "Он пишет, снова и снова угадывая следующий токен по вероятностям; **механизм внимания** помогает ему учитывать прежние слова.",
                            "Он выбирает вероятные слова, а не проверенные факты, поэтому может **галлюцинировать**: факты, даты и цитаты проверяй во втором надёжном источнике."
                        ]
                    }
                }
            ]
        },

        /* ----- l10. Creative AI: practice ----- */
        l10: {
            steps: [
                {
                    type: "info", icon: "🎨",
                    en: {
                        title: "Something new, made from patterns",
                        text: [
                            "**Generative AI** studies huge numbers of examples and picks up their patterns: what usually goes with what. Then it uses those patterns to make something that did not exist before: a story, a picture, a tune, a voice.",
                            "You can do this too. You know lots of fairy tales, so you could make up a new one: “Once upon a time”, a hero, a villain, a happy ending. You copy no single tale: you use the patterns they share."
                        ]
                    },
                    ru: {
                        title: "Новое — по выученным закономерностям",
                        text: [
                            "**Генеративный ИИ** изучает огромное количество примеров и выучивает их закономерности: что обычно с чем сочетается. А потом по ним создаёт то, чего раньше не было: историю, картинку, мелодию, голос.",
                            "Ты тоже так умеешь. Ты знаешь много сказок и можешь сочинить новую: «Жили-были», герой, злодей, счастливый конец. Ни одну сказку ты не копируешь, а пользуешься тем, что у них общее."
                        ]
                    }
                },
                {
                    type: "choice", card: "l10a",
                    en: {
                        q: "A music generator has learned from thousands of songs. You ask it for a brand-new song about your dog. What does it use to make it?",
                        options: ["Patterns it learned, like how songs are usually built", "One song it stored, with new words about a dog", "A song about a dog that it finds online", "Rules that a person wrote for every song"],
                        why: "Generative AI does not keep its examples to hand them back, and nobody writes rules for every song. It learns patterns from the examples and uses them to make a new song."
                    },
                    ru: {
                        q: "Музыкальный генератор учился на тысячах песен. Ты просишь его сочинить новую песню про твою собаку. Что он для этого использует?",
                        options: ["Закономерности, которые выучил: например, как обычно строится песня", "Одну сохранённую песню, только с новыми словами про собаку", "Песню про собаку, которую находит в интернете", "Правила, которые человек написал для каждой песни"],
                        why: "Генеративный ИИ не хранит примеры, чтобы выдавать их обратно, и никто не пишет правила для каждой песни. Он выучивает закономерности примеров и по ним создаёт новую песню."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "You ask a diffusion model for “a yellow duck on a blue pond”. Put what you would see in order, from the first step to the last.",
                        items: ["Pure noise: random dots, like static on an old TV", "Blurry patches of yellow and blue in the noise", "The rough shape of a duck shows through", "A clear, new picture of a duck on a pond"],
                        hint: "Where does a diffusion model start, every time?",
                        why: "It starts from pure random noise and removes a little at each step. The prompt guides every step, so the shapes that appear are a duck and a pond."
                    },
                    ru: {
                        q: "Ты просишь диффузионную модель нарисовать «жёлтую уточку на синем пруду». Расставь по порядку, что будет видно, от первого шага до последнего.",
                        items: ["Чистый шум: случайные точки, как помехи на старом телевизоре", "Размытые жёлтые и синие пятна среди шума", "Сквозь шум проступают очертания уточки", "Чёткая новая картинка: уточка на пруду"],
                        hint: "С чего диффузионная модель начинает каждый раз?",
                        why: "Она начинает с чистого случайного шума и на каждом шаге убирает его понемногу. Запрос направляет каждый шаг, поэтому проступают именно уточка и пруд."
                    }
                },
                {
                    type: "choice", card: "l10b",
                    en: {
                        q: "You give a diffusion model exactly the same prompt twice and get two different pictures. Why?",
                        options: ["Each time, it starts from different random noise", "Each time, it picks a different stored picture", "Each time, it searches the internet again", "It misread the prompt one of the two times"],
                        why: "A diffusion model starts every picture from fresh random noise. The prompt guides each step, but different noise grows into a different picture. That is why you can ask for variations."
                    },
                    ru: {
                        q: "Ты дважды даёшь диффузионной модели один и тот же запрос и получаешь две разные картинки. Почему?",
                        options: ["Каждый раз она начинает с другого случайного шума", "Каждый раз она берёт другую сохранённую картинку", "Каждый раз она заново ищет в интернете", "Один из двух раз она неправильно поняла запрос"],
                        why: "Диффузионная модель начинает каждую картинку с нового случайного шума. Запрос направляет каждый шаг, но из другого шума вырастает другая картинка. Поэтому и можно просить разные варианты."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "This picture prompt is built in layers: “a robot, comic style, on a rainy night, holding a yellow umbrella”. Match each part with its layer.",
                        pairs: [
                            ["“a robot”", "The subject"],
                            ["“comic style”", "The style"],
                            ["“on a rainy night”", "The light or mood"],
                            ["“holding a yellow umbrella”", "A detail"]
                        ],
                        why: "First what the picture shows, then how it is drawn, then its light and mood, and the details last. Change one layer at a time and compare: you learn what each word does."
                    },
                    ru: {
                        q: "Этот запрос к картинке собран слоями: «робот, в стиле комикса, дождливой ночью, с жёлтым зонтом». Сопоставь каждую часть с её слоем.",
                        pairs: [
                            ["«робот»", "Объект"],
                            ["«в стиле комикса»", "Стиль"],
                            ["«дождливой ночью»", "Свет или настроение"],
                            ["«с жёлтым зонтом»", "Деталь"]
                        ],
                        why: "Сначала — что изображено, потом — как нарисовано, затем свет и настроение, а в конце детали. Меняй по одному слою и сравнивай — так поймёшь, что делает каждое слово."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "You are making a poster for the school fair with AI. It is nearly right, but the sky is too dark. What is the best next step?",
                        options: ["Change only the light in the prompt, then compare", "Write a completely new prompt from the start", "Keep it as it is: the AI knows best", "Add five new details to the prompt at once"],
                        hint: "If the picture gets better, how will you know which change helped?",
                        why: "Change one thing at a time and compare: then you see what each change does. And the choices are yours, not the AI's: you decide what to keep and what to change."
                    },
                    ru: {
                        q: "Ты делаешь с ИИ плакат к школьной ярмарке. Он получился почти таким, как надо, но небо слишком тёмное. Что лучше всего сделать дальше?",
                        options: ["Изменить в запросе только свет и сравнить", "Написать совсем новый запрос с самого начала", "Оставить как есть: ИИ виднее", "Добавить в запрос сразу пять новых деталей"],
                        hint: "Если картинка станет лучше, как ты поймёшь, какое изменение помогло?",
                        why: "Меняй по одной вещи за раз и сравнивай: так видно, что даёт каждое изменение. И решаешь ты, а не ИИ: что оставить, а что поменять."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "You want to share these. Which are fine, and which are not okay?",
                        groups: ["Fine to share", "Not okay"],
                        items: [
                            ["A dragon picture you made with AI, saying that AI helped", 0],
                            ["A deepfake of a classmate dancing, made without asking them", 1],
                            ["An AI-made beach picture, posted as your holiday photo", 1],
                            ["A birthday song for your gran made with AI, and you tell her so", 0],
                            ["A fake of your teacher's voice saying silly things, without asking", 1],
                            ["A school poster made with AI help, with a note saying so", 0]
                        ],
                        why: "Saying that AI helped keeps your work honest. Posting an AI picture as a real photo fools people, and a fake of a real person needs their permission."
                    },
                    ru: {
                        q: "Ты хочешь поделиться вот этим. Что можно, а что нельзя?",
                        groups: ["Можно поделиться", "Так нельзя"],
                        items: [
                            ["Дракон, нарисованный с ИИ, и ты говоришь, что ИИ помогал", 0],
                            ["Дипфейк, где одноклассник танцует, сделанный без его согласия", 1],
                            ["Картинка пляжа от ИИ, которую ты выдаёшь за фото с каникул", 1],
                            ["Песня бабушке на день рождения, сделанная с ИИ, и ты ей об этом говоришь", 0],
                            ["Подделка голоса учителя со смешными фразами, без его согласия", 1],
                            ["Школьный плакат, сделанный с помощью ИИ, с пометкой об этом", 0]
                        ],
                        why: "Когда ты говоришь, что тебе помогал ИИ, всё честно. Картинка от ИИ, выданная за настоящее фото, обманывает людей, а для подделки с реальным человеком нужно его согласие."
                    }
                },
                {
                    type: "choice", card: "l10c",
                    en: {
                        q: "A surprising picture is going round your class chat. It has no AI label. What is the smart thing to do?",
                        options: ["Find out where it comes from: a missing label proves nothing", "Share it: no AI label means it is a real photo", "Share it: an AI picture would have odd mistakes", "Tell everyone it is fake: surprising pictures always are"],
                        why: "Some tools add a label or a watermark, but not all of them do, and editing can remove some marks. An AI picture can also look completely real. So find out where it comes from before you believe it or share it."
                    },
                    ru: {
                        q: "В чате класса ходит удивительная картинка. Пометки, что её создал ИИ, на ней нет. Как разумнее всего поступить?",
                        options: ["Выяснить, откуда она: отсутствие пометки ничего не доказывает", "Переслать: раз пометки ИИ нет, это настоящее фото", "Переслать: в картинке от ИИ были бы странные ошибки", "Сказать всем, что это подделка: удивительные картинки всегда фальшивые"],
                        why: "Некоторые сервисы добавляют пометку или водяной знак, но так делают не все, а часть меток можно убрать редактированием. И картинка от ИИ может выглядеть совсем как настоящая. Поэтому сначала выясни, откуда она, а потом уже верь или делись."
                    }
                },
                {
                    type: "reveal", icon: "🗣️",
                    en: {
                        q: "Explain it to a friend: image generators make new pictures, not copies. So why are many artists upset?",
                        answer: [
                            "The generators learned their patterns from huge collections of pictures, including work by artists who were never asked.",
                            "And in rare cases a model has made near-copies of pictures it was trained on. There have been court cases about this, and the rules are still being worked out."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: генераторы картинок создают новые картинки, а не копии. Почему же многие художники недовольны?",
                        answer: [
                            "Генераторы выучили закономерности на огромных коллекциях картинок, среди которых есть и работы художников, которых никто не спрашивал.",
                            "А в редких случаях модель выдавала почти точные копии картинок, на которых училась. Об этом уже были судебные дела, и правила всё ещё складываются."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "**Generative AI** learns patterns from huge numbers of examples and uses them to make something new.",
                            "A **diffusion model** starts from random noise and removes it step by step, guided by the prompt. New noise, new picture.",
                            "You make the choices and say when AI helped. A missing AI label proves nothing, and a fake of a real person needs their permission."
                        ]
                    },
                    ru: {
                        points: [
                            "**Генеративный ИИ** выучивает закономерности на огромном количестве примеров и создаёт по ним новое.",
                            "**Диффузионная модель** начинает со случайного шума и убирает его шаг за шагом, ориентируясь на запрос. Другой шум — другая картинка.",
                            "Решаешь ты, и ты же говоришь, когда тебе помогал ИИ. Отсутствие пометки ИИ ничего не доказывает, а подделка с реальным человеком — только с его согласия."
                        ]
                    }
                }
            ]
        },

        /* ----- l11. Can You Trust AI?: practice ----- */
        l11: {
            steps: [
                {
                    type: "info", icon: "🤔",
                    en: {
                        title: "Sounding sure is not the same as being right",
                        text: [
                            "An AI can go wrong in three ways. It can be **biased**: unfair to some people, because of the examples it learned from. It can **hallucinate**: make up a fact that sounds real. And it can be **overconfident**: very sure, and still wrong.",
                            "Think of a friend who never says “I don't know”. Ask about a film, a capital city or last night's match: they always answer in the same sure voice, right or wrong. You can still ask them things, but you check what matters."
                        ]
                    },
                    ru: {
                        title: "Звучит уверенно — не значит верно",
                        text: [
                            "ИИ может ошибаться тремя способами. Он бывает **предвзятым**: несправедливым к кому-то из-за примеров, на которых учился. Он может **галлюцинировать**: выдумать факт, который звучит как настоящий. И он бывает **слишком уверенным**: не сомневается — и всё равно ошибается.",
                            "Представь друга, который никогда не говорит «не знаю». Спроси про фильм, столицу или вчерашний матч — он всегда отвечает одинаково уверенно, верно или нет. Спрашивать его можно и дальше, но важное стоит проверять."
                        ]
                    }
                },
                {
                    type: "sort", card: "l11a",
                    en: {
                        q: "Sort these AI mistakes: is it bias, a hallucination or overconfidence?",
                        groups: ["Bias", "Hallucination", "Overconfidence"],
                        items: [
                            ["A chatbot names a book that was never written", 1],
                            ["A photo app trained mostly on adults' faces often misses children in family photos", 0],
                            ["A bird app is “99% sure” that a paper aeroplane is a seagull", 2],
                            ["A chatbot describes a museum in your town that does not exist", 1],
                            ["A dog-breed app is “98% sure” that a cat is a beagle", 2],
                            ["An AI that learned from past team picks keeps passing over girls who play just as well", 0]
                        ],
                        why: "Bias is unfairness to some people, learned from one-sided or unfair examples. A hallucination is something made up that sounds real. Overconfidence is being very sure and still wrong, often about things unlike the training examples."
                    },
                    ru: {
                        q: "Раздели ошибки ИИ: это предвзятость, галлюцинация или излишняя уверенность?",
                        groups: ["Предвзятость", "Галлюцинация", "Излишняя уверенность"],
                        items: [
                            ["Чат-бот называет книгу, которую никто никогда не писал", 1],
                            ["Фотоприложение, обученное в основном на лицах взрослых, часто не находит детей на семейных фото", 0],
                            ["Приложение для птиц «на 99% уверено», что бумажный самолётик — это чайка", 2],
                            ["Чат-бот рассказывает о музее в твоём городе, которого не существует", 1],
                            ["Приложение для пород собак «на 98% уверено», что кошка — это бигль", 2],
                            ["ИИ, обученный на прошлых отборах в команду, не берёт девочек, которые играют не хуже", 0]
                        ],
                        why: "Предвзятость — это несправедливость к кому-то, перенятая из однобоких или несправедливых примеров. Галлюцинация — выдумка, которая звучит как правда. Излишняя уверенность — когда ИИ не сомневается и всё равно ошибается, часто на том, что непохоже на обучающие примеры."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A team says: “We never told our AI anyone's gender or background, so it can't be biased.” What is wrong with this?",
                        options: ["It can still learn unfairness from past decisions in its data", "Nothing: an AI that is never told this can't be unfair", "Nothing: AI is maths, and maths is always fair", "Bias only appears if someone programs it in on purpose"],
                        hint: "Where does an AI learn its patterns from?",
                        why: "A model trained on past decisions learns their patterns, unfairness included, even if it was never told anyone's background. Other details in the data can give away which group a person belongs to."
                    },
                    ru: {
                        q: "Команда говорит: «Мы никогда не сообщали нашему ИИ, какого пола и происхождения люди, так что он не может быть предвзятым». Что здесь не так?",
                        options: ["Он всё равно может перенять из данных несправедливость прошлых решений", "Ничего: если ИИ этого не сообщали, он не может быть несправедливым", "Ничего: ИИ — это математика, а она всегда честная", "Предвзятость бывает, только если её нарочно запрограммировали"],
                        hint: "Откуда ИИ берёт свои закономерности?",
                        why: "Модель, обученная на прошлых решениях, перенимает их закономерности, в том числе несправедливые, даже если ей никогда не сообщали ничьего происхождения. Другие подробности в данных могут выдать, к какой группе относится человек."
                    }
                },
                {
                    type: "number", answer: 20, unit: "%",
                    en: {
                        q: "A voice assistant is tested on 100 people. It understands 88 of the 90 with the accent it heard most in training, but only 2 of the 10 with another accent. What percentage of those 10 does it understand?",
                        hint: "What part of 10 is 2? Write it as a percentage.",
                        why: "2 of 10 is 20%. Overall it understands 90 of 100 people, so it looks “90% accurate”, yet it fails 8 of the 10 people with another accent. That is why good tests split the results by group."
                    },
                    ru: {
                        q: "Голосового помощника проверяют на 100 людях. Из 90 человек с акцентом, который он чаще всего слышал при обучении, он понимает 88, а из 10 человек с другим акцентом — только 2. Сколько процентов из этих 10 он понимает?",
                        hint: "Какая часть от 10 — это 2? Запиши её в процентах.",
                        why: "2 из 10 — это 20%. Всего он понимает 90 человек из 100, то есть «точность 90%», но 8 из 10 человек с другим акцентом он не понимает. Поэтому хорошие проверки разбивают результаты по группам."
                    }
                },
                {
                    type: "choice", card: "l11b",
                    en: {
                        q: "A family puts an AI camera on their cat flap, so that it lets in only their own cat. It passed every test on sunny afternoons. What should they test next?",
                        options: ["Night-time, dim light and cats that look like theirs", "More sunny afternoons, just to be extra sure", "Nothing: it has passed every test so far", "Only their own cat, since it is the one that uses it"],
                        why: "Good tests try unusual situations, like dim light or a cat that looks similar. More sunny afternoons show nothing new, and testing only their own cat never shows whether a stranger gets in."
                    },
                    ru: {
                        q: "Семья поставила на кошачью дверцу камеру с ИИ: она должна пускать только их кошку. Солнечными днями она прошла все проверки. Что проверить дальше?",
                        options: ["Ночь, тусклый свет и кошек, похожих на их кошку", "Ещё несколько солнечных дней — для надёжности", "Ничего: все проверки уже пройдены", "Только их кошку: дверцей ведь пользуется она"],
                        why: "Хорошие проверки пробуют необычные ситуации — например, тусклый свет или похожую кошку. Новые солнечные дни ничего нового не покажут, а проверка только на своей кошке не скажет, пустит ли дверца чужую."
                    }
                },
                {
                    type: "info", icon: "⚖️",
                    en: {
                        title: "Look closer: why the rules depend on risk",
                        text: [
                            "If an AI picks a song you don't like, you just skip it. If an AI marks an exam wrongly or turns down someone's loan, it can change a life.",
                            "So the EU's **AI Act** sorts AI uses by how much harm they could do: the bigger the possible harm, the stricter the rules. A few uses are banned altogether."
                        ]
                    },
                    ru: {
                        title: "Присмотрись: почему правила зависят от риска",
                        text: [
                            "Если ИИ подобрал песню, которая тебе не нравится, ты её просто пропустишь. А если ИИ неверно оценил экзамен или отказал человеку в кредите, это может изменить жизнь.",
                            "Поэтому **Закон Евросоюза об ИИ** (AI Act) делит применения ИИ по тому, какой вред они могут причинить: чем больше возможный вред, тем строже правила. А некоторые применения запрещены совсем."
                        ]
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "How does the EU AI Act treat each of these uses of AI? Match them.",
                        pairs: [
                            ["A spell-checker", "Almost no extra rules"],
                            ["A chatbot", "People must be told it is an AI"],
                            ["AI that decides who gets a place at a school", "High-risk: careful tests and checks by people"],
                            ["Scoring people's everyday behaviour, then treating them worse for it", "Banned"]
                        ],
                        why: "A spell-checker can do little harm. People must be told when they are talking to an AI. A school place can shape a life, so it needs strict checks, and social scoring is banned."
                    },
                    ru: {
                        q: "Как Закон Евросоюза об ИИ относится к каждому из этих применений ИИ? Сопоставь.",
                        pairs: [
                            ["Проверка орфографии", "Почти никаких дополнительных правил"],
                            ["Чат-бот", "Людям нужно сообщать, что это ИИ"],
                            ["ИИ, который решает, кого принять в школу", "Высокий риск: тщательные проверки и контроль со стороны людей"],
                            ["Ставить людям баллы за повседневное поведение и из-за них хуже с ними обращаться", "Запрещено"]
                        ],
                        why: "Проверка орфографии почти не может навредить. Людям нужно сообщать, что они общаются с ИИ. Место в школе может повлиять на всю жизнь, поэтому нужны строгие проверки, а социальный рейтинг запрещён."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "What is fine to send to a chatbot, and what should you keep out?",
                        groups: ["Fine to send", "Keep it out"],
                        items: [
                            ["A question about why the sky is blue", 0],
                            ["Your password for a game", 1],
                            ["Ideas for a birthday party", 0],
                            ["Your home address", 1],
                            ["A photo of a page from your friend's diary", 1],
                            ["A maths problem you are stuck on", 0]
                        ],
                        why: "What you type may be stored, read by the company's staff or used to train future models. Questions and ideas are fine. Passwords, your address and other people's secrets stay out."
                    },
                    ru: {
                        q: "Что можно отправлять чат-боту, а что лучше оставить при себе?",
                        groups: ["Можно отправить", "Оставь при себе"],
                        items: [
                            ["Вопрос о том, почему небо голубое", 0],
                            ["Пароль от игры", 1],
                            ["Идеи для дня рождения", 0],
                            ["Твой домашний адрес", 1],
                            ["Фото страницы из дневника друга", 1],
                            ["Задача по математике, которая не получается", 0]
                        ],
                        why: "То, что ты пишешь, может сохраняться, читаться сотрудниками компании или идти на обучение будущих моделей. Вопросы и идеи — пожалуйста. А пароли, адрес и чужие секреты оставь при себе."
                    }
                },
                {
                    type: "choice", card: "l11c",
                    en: {
                        q: "You want a chatbot's advice about an argument with your best friend. What is the safest way to ask?",
                        options: ["Describe it, with the names and details changed", "Paste in your whole chat with your friend", "Give your friend's full name, so the advice fits", "Add the name of your school, so it gets the situation"],
                        why: "What you type may be stored, read by the company's staff or used to train future models. So keep private details out, yours and your friend's: with the names changed, the advice still works."
                    },
                    ru: {
                        q: "Тебе нужен совет чат-бота насчёт ссоры с лучшим другом. Как безопаснее всего спросить?",
                        options: ["Описать ссору, изменив имена и подробности", "Вставить всю вашу переписку с другом", "Назвать полное имя друга, чтобы совет был точнее", "Указать название школы, чтобы бот лучше понял ситуацию"],
                        why: "То, что ты пишешь, может сохраняться, читаться сотрудниками компании или идти на обучение будущих моделей. Поэтому личные подробности — свои и друга — не пиши: с другими именами совет всё равно подойдёт."
                    }
                },
                {
                    type: "reveal", icon: "🗣️",
                    en: {
                        q: "Explain it to a friend: when can you trust an AI's answer?",
                        answer: [
                            "Trust it, but check. AI can be biased, make things up and sound sure even when it is wrong.",
                            "A mistake in small things, like ideas for a game, costs little. Facts you will use and decisions about people are worth checking in a trusted source or with someone who knows."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: когда можно доверять ответу ИИ?",
                        answer: [
                            "Доверяй, но проверяй. ИИ бывает предвзятым, выдумывает и звучит уверенно, даже когда ошибается.",
                            "Ошибка в мелочах, например в идеях для игры, стоит недорого. А факты, которыми ты будешь пользоваться, и решения о людях стоит проверить по надёжному источнику или у того, кто разбирается."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "AI can be **biased**, can **hallucinate** and can be **overconfident**: trust it, but check.",
                            "One accuracy number is not enough: good tests split the results by group and try unusual cases, and **red teams** try to break the AI on purpose.",
                            "Keep private details out of chats, and know that laws like the EU **AI Act** sort AI uses by risk and ban a few."
                        ]
                    },
                    ru: {
                        points: [
                            "ИИ бывает **предвзятым**, может **галлюцинировать** и бывает **слишком уверенным**: доверяй, но проверяй.",
                            "Одного числа точности мало: хорошие проверки разбивают результаты по группам и пробуют необычные случаи, а **ред-тиминг** нарочно пытается сломать ИИ.",
                            "Не пиши в чатах личные подробности и помни: законы вроде **AI Act** делят применения ИИ по уровню риска, а некоторые запрещают."
                        ]
                    }
                }
            ]
        },

        /* ----- l12. Your AI Toolkit: practice ----- */
        l12: {
            steps: [
                {
                    type: "info", icon: "🛠️",
                    en: {
                        title: "Good tools need skilled hands",
                        text: [
                            "A chatbot is a powerful tool, and like any tool it works best in skilled hands. Three habits make the difference: ask clearly, check what matters, and keep the thinking yours.",
                            "Think of a map app on a family trip. It needs the exact address, not just “the seaside”. Someone still watches the road signs. And the family, not the app, decides where to stop for lunch."
                        ]
                    },
                    ru: {
                        title: "Хорошему инструменту — умелые руки",
                        text: [
                            "Чат-бот — мощный инструмент, а любой инструмент лучше всего работает в умелых руках. Всё решают три привычки: спрашивать ясно, проверять важное и думать своей головой.",
                            "Вспомни навигатор в семейной поездке. Ему нужен точный адрес, а не просто «на море». На дорожные знаки всё равно кто-то смотрит. А где остановиться пообедать, решает семья, а не навигатор."
                        ]
                    }
                },
                {
                    type: "match", card: "l12a",
                    en: {
                        q: "Here are four parts of one prompt to a chatbot. Match each part with its ingredient.",
                        pairs: [
                            ["“You are a patient guitar teacher.”", "Role"],
                            ["“I'm 11 and I've had my guitar for a week.”", "Context"],
                            ["“For example, a song as easy as Happy Birthday.”", "Example"],
                            ["“Put the songs in a short list with the chords.”", "Format"]
                        ],
                        why: "The role says who the chatbot should be, the context says who you are, the example shows the kind of answer you like, and the format says how it should look. Add the ingredients that help."
                    },
                    ru: {
                        q: "Вот четыре части одного промпта для чат-бота. Сопоставь каждую часть с её ингредиентом.",
                        pairs: [
                            ["«Ты — терпеливый учитель игры на гитаре»", "Роль"],
                            ["«Мне 11 лет, гитара у меня всего неделю»", "Контекст"],
                            ["«Например, что-то простое, как песенка про кузнечика»", "Пример"],
                            ["«Запиши песни коротким списком с аккордами»", "Формат"]
                        ],
                        why: "Роль говорит, кем быть чат-боту, контекст — кто ты, пример показывает, какой ответ тебе нравится, а формат — как оформить ответ. Добавляй те ингредиенты, которые помогают."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "You ask a chatbot for a birthday poem for your gran. It is nice, but too long and too serious. What is the best next step?",
                        options: ["Reply and say what to change: shorter and funnier", "Start a new chat and type the whole request again", "Keep it: a chatbot cannot change what it wrote", "Give up: the chatbot did not understand you"],
                        hint: "Does the chatbot need to start from zero, or just to know what to fix?",
                        why: "If an answer isn't quite right, don't start over: reply and say exactly what to change. Your first request is still there in the chat, so a short reply is enough."
                    },
                    ru: {
                        q: "Ты просишь чат-бота написать стихи бабушке на день рождения. Получилось мило, но слишком длинно и серьёзно. Что лучше всего сделать дальше?",
                        options: ["Ответить и сказать, что изменить: короче и веселее", "Начать новый чат и заново написать весь запрос", "Оставить так: чат-бот не может менять написанное", "Сдаться: чат-бот тебя не понял"],
                        hint: "Чат-боту нужно начинать с нуля или достаточно знать, что исправить?",
                        why: "Если ответ не совсем тот, не начинай сначала: ответь и скажи, что именно изменить. Первый запрос уже есть в чате, так что короткого ответа хватит."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "A chatbot gives you these answers. Which ones should you check in trusted places first?",
                        groups: ["Check it first", "Fine to use as it is"],
                        items: [
                            ["Whether a houseplant is safe for your cat", 0],
                            ["Ten funny names for a hamster", 1],
                            ["Ideas for a game at a birthday party", 1],
                            ["The exact number of people in your city, for a project", 0],
                            ["The latest news about your favourite football team", 0],
                            ["A rhyme for “moon” for your poem", 1]
                        ],
                        why: "Be extra careful with health, money and news, and with exact numbers, dates and quotes: check them in at least two trusted places. Names, game ideas and rhymes are fine as they are: you can judge them yourself."
                    },
                    ru: {
                        q: "Чат-бот дал тебе такие ответы. Какие из них сначала стоит проверить по надёжным источникам?",
                        groups: ["Сначала проверить", "Можно брать как есть"],
                        items: [
                            ["Не опасно ли комнатное растение для твоей кошки", 0],
                            ["Десять смешных кличек для хомяка", 1],
                            ["Идеи для игры на дне рождения", 1],
                            ["Точное число жителей твоего города — для проекта", 0],
                            ["Последние новости о твоей любимой футбольной команде", 0],
                            ["Рифма к слову «луна» для стихотворения", 1]
                        ],
                        why: "Особая осторожность — со здоровьем, деньгами и новостями, а ещё с точными числами, датами и цитатами: проверяй их хотя бы в двух надёжных местах. Клички, идеи для игр и рифмы можно брать как есть: их легко оценить самостоятельно."
                    }
                },
                {
                    type: "info", icon: "🔍",
                    en: {
                        title: "Look closer: why “Are you sure?” is not a check",
                        text: [
                            "Asking “Are you sure?” gives the chatbot no new evidence. It just picks likely words again.",
                            "So it may repeat its mistake, or politely swap a right answer for a wrong one. A real check uses something outside the chat: a trusted website, a textbook, your teacher."
                        ]
                    },
                    ru: {
                        title: "Присмотрись: почему «Ты уверен?» — не проверка",
                        text: [
                            "Вопрос «Ты уверен?» не даёт чат-боту никаких новых доказательств. Он просто снова подбирает вероятные слова.",
                            "Поэтому он может повторить ошибку или вежливо заменить правильный ответ неправильным. Настоящая проверка опирается на то, что вне чата: надёжный сайт, учебник, учителя."
                        ]
                    }
                },
                {
                    type: "choice", card: "l12b",
                    en: {
                        q: "For your history project, a chatbot gives you the exact year a castle was built, with no source. What is the best way to check it?",
                        options: ["Find the year in at least two trusted places", "Ask the chatbot “Are you sure?” and see", "Trust it: exact numbers are a sign it is right", "Ask the same question again and compare"],
                        why: "An exact date is a reason to be extra careful, and asking the chatbot again gives it no new evidence. A good habit: find important facts in at least two trusted places, like a museum website and a textbook."
                    },
                    ru: {
                        q: "Для проекта по истории чат-бот назвал тебе точный год постройки замка, но без источника. Как лучше всего это проверить?",
                        options: ["Найти этот год хотя бы в двух надёжных местах", "Спросить у чат-бота «Ты уверен?» и посмотреть", "Поверить: точные числа — признак верного ответа", "Задать тот же вопрос ещё раз и сравнить"],
                        why: "Точная дата — как раз повод для особой осторожности, а повторный вопрос не даёт чат-боту новых доказательств. Полезная привычка: находить важные факты хотя бы в двух надёжных местах, например на сайте музея и в учебнике."
                    }
                },
                {
                    type: "sort", card: "l12c",
                    en: {
                        q: "Is the AI used as a tutor or as a ghostwriter?",
                        groups: ["Tutor", "Ghostwriter"],
                        items: [
                            ["“Quiz me on these French words before my test.”", 0],
                            ["“Write my book report, so I can hand it in.”", 1],
                            ["“Finish my story for me: it's due tomorrow.”", 1],
                            ["“Explain fractions in a different way, with pizza.”", 0],
                            ["“Read my draft and tell me which part is unclear.”", 0],
                            ["“Do my science worksheet and give me all the answers.”", 1]
                        ],
                        why: "A tutor helps you learn: it explains, quizzes you and comments on your own work. A ghostwriter does the work for you, so it also does the learning instead of you, and at many schools that is against the rules."
                    },
                    ru: {
                        q: "ИИ здесь — репетитор или гострайтер?",
                        groups: ["Репетитор", "Гострайтер"],
                        items: [
                            ["«Погоняй меня по французским словам перед контрольной»", 0],
                            ["«Напиши за меня отзыв о книге — мне его сдавать»", 1],
                            ["«Допиши за меня рассказ: его сдавать завтра»", 1],
                            ["«Объясни дроби по-другому, на примере пиццы»", 0],
                            ["«Прочитай мой черновик и скажи, что в нём непонятно»", 0],
                            ["«Реши за меня все задания по физике и дай ответы»", 1]
                        ],
                        why: "Репетитор помогает учиться: объясняет, проверяет тебя, комментирует твою собственную работу. Гострайтер делает работу за тебя, а значит, и учится вместо тебя. Во многих школах это против правил."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A school could use an AI camera that checks which pupils look bored in class. Which question shows the skill of ethics?",
                        options: ["Should we do this at all, and is it fair?", "Can the camera also see the back row?", "How quickly can the AI check a whole class?", "Which camera gives the sharpest picture?"],
                        hint: "Which question is about right and wrong, not about how it works?",
                        why: "Ethics means asking not only “Can we?” but also “Should we?”. The other questions are only about making it work, not about whether it is fair or right."
                    },
                    ru: {
                        q: "Школа могла бы поставить камеру с ИИ, которая замечает, кому на уроке скучно. Какой вопрос показывает навык этики?",
                        options: ["Должны ли мы вообще так делать и справедливо ли это?", "Увидит ли камера ещё и задние парты?", "Как быстро ИИ проверит весь класс?", "Какая камера даёт самую чёткую картинку?"],
                        hint: "Какой вопрос — о том, правильно ли это, а не о том, как это работает?",
                        why: "Этика — это когда спрашиваешь не только «Можем ли мы?», но и «Должны ли?». Остальные вопросы — только о том, как всё устроить, а не о том, честно и правильно ли это."
                    }
                },
                {
                    type: "reveal", icon: "🗣️",
                    en: {
                        q: "Explain it to a friend: if AI can write your homework in seconds, why still do it yourself?",
                        answer: [
                            "Because the homework is not the point: the learning is. Working things out yourself, even with mistakes, helps you remember better than reading a ready-made answer.",
                            "And to use AI well later, you need your own thinking: to ask good questions, check answers and decide what is right."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: если ИИ может сделать домашку за секунды, зачем делать её самостоятельно?",
                        answer: [
                            "Потому что смысл домашки не в самой работе, а в том, чему ты научишься. Когда разбираешься самостоятельно, даже с ошибками, запоминаешь лучше, чем когда читаешь готовый ответ.",
                            "А чтобы потом хорошо пользоваться ИИ, нужна своя голова: задавать хорошие вопросы, проверять ответы и решать, что правильно."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A good **prompt** can have a role, context, a clear task, an example and a format. If the answer is not quite right, reply and say what to change.",
                            "Check what matters in at least two trusted places. “Are you sure?” is not a check, and exact numbers, dates and quotes need extra care.",
                            "Use AI as a **tutor**, not a **ghostwriter**: follow your school's rules, say when AI helped, and do the thinking yourself."
                        ]
                    },
                    ru: {
                        points: [
                            "В хорошем **промпте** может быть роль, контекст, чёткая задача, пример и формат. Если ответ не совсем тот, ответь и скажи, что изменить.",
                            "Проверяй важное хотя бы в двух надёжных местах. «Ты уверен?» — не проверка, а точные числа, даты и цитаты требуют особой осторожности.",
                            "Пользуйся ИИ как **репетитором**, а не **гострайтером**: соблюдай правила своей школы, говори, когда тебе помогал ИИ, и думай своей головой."
                        ]
                    }
                }
            ]
        },

        /* ----- l13. Data: The Fuel of AI: practice ----- */
        l13: {
            steps: [
                {
                    type: "info", icon: "📚",
                    en: {
                        title: "A model is only as good as its examples",
                        text: [
                            "A model has no other way to learn about the world: everything it knows comes from its examples, its **dataset**. It picks up their right answers and their mistakes alike. Whatever the examples never show, it can only guess.",
                            "It's like learning to spell from a single word list. If the list says “becuase”, you learn the mistake: you have never seen the word written any other way. And you can only guess a word that isn't on the list."
                        ]
                    },
                    ru: {
                        title: "Модель не лучше своих примеров",
                        text: [
                            "Другого способа узнать о мире у модели нет: всё, что она знает, взято из её примеров — из **набора данных**. Она перенимает и верные ответы, и ошибки. А о том, чего в примерах нет, она может только гадать.",
                            "Это как учиться правописанию по одному-единственному списку слов. Если там написано «пажалуйста», ты выучишь ошибку: по-другому это слово тебе не встречалось. А слово, которого в списке нет, придётся угадывать."
                        ]
                    }
                },
                {
                    type: "choice", card: "l13a",
                    en: {
                        q: "A team is training a model to name the bird singing in a recording. Besides the recording, what does each training example need?",
                        options: ["A label: the bird's name, often added by a person", "Nothing: the model will work out the names by itself", "The model's own guess about which bird it is", "A photo of the place where it was recorded"],
                        why: "Each example needs its right answer, its **label**: here, the bird's name. A model can't know names it was never shown, so people often listen and add the labels, one recording at a time."
                    },
                    ru: {
                        q: "Команда учит модель называть птицу, которая поёт на записи. Что, кроме самой записи, нужно каждому обучающему примеру?",
                        options: ["Метка с названием птицы — её часто ставит человек", "Ничего: названия модель выяснит самостоятельно", "Догадка самой модели о том, какая это птица", "Фото места, где сделана запись"],
                        why: "Каждому примеру нужен правильный ответ — **метка**: здесь это название птицы. Модель не может знать названий, которых ей никогда не показывали, поэтому метки часто ставят люди: слушают записи и подписывают их по одной."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "The data from a school weather station has four problems. Match each problem with its name.",
                        pairs: [
                            ["Thursday has no temperature at all", "Missing value"],
                            ["Friday's weather is “snwo”", "Typo"],
                            ["Monday's row is in the table twice", "Duplicate"],
                            ["Tuesday's temperature is 300 °C", "Impossible value"]
                        ],
                        why: "A model can't tell a mistake from a fact, so it would believe in a 300 °C day and a new kind of weather called “snwo”, and count Monday twice. That's why data is cleaned first: each problem is fixed, or the row is left out."
                    },
                    ru: {
                        q: "В данных школьной метеостанции четыре проблемы. Сопоставь каждую проблему с её названием.",
                        pairs: [
                            ["В четверг температура не записана", "Пропуск"],
                            ["Погода в пятницу: «снге»", "Опечатка"],
                            ["Строка за понедельник есть в таблице дважды", "Повтор"],
                            ["Во вторник температура 300 °C", "Невозможное значение"]
                        ],
                        why: "Модель не отличает ошибку от факта, поэтому поверила бы в день с температурой 300 °C и в новую погоду «снге», а понедельник посчитала бы дважды. Вот почему данные сначала очищают: каждую проблему исправляют или убирают такую строку."
                    }
                },
                {
                    type: "choice", card: "l13b",
                    en: {
                        q: "In a training set, some photos of dogs are labelled “cat” by mistake. Nobody fixes them. What may happen when a model learns from this set?",
                        options: ["It may learn the mistake and mix up dogs and cats", "Nothing: it will notice the mistakes and skip them", "Nothing: it learns from the photos, not the labels", "It will stop learning until someone fixes them"],
                        why: "A model can't tell a mistake from a fact: a wrong label looks just as true to it as a right one. That's why data is cleaned before training."
                    },
                    ru: {
                        q: "В обучающем наборе несколько фото собак по ошибке помечены как «кошка». Их никто не исправил. Что может случиться, когда модель будет учиться на этом наборе?",
                        options: ["Она может выучить ошибку и путать собак с кошками", "Ничего: она заметит ошибки и пропустит их", "Ничего: она учится по фото, а не по меткам", "Она перестанет учиться, пока ошибки не исправят"],
                        why: "Модель не отличает ошибку от факта: неверная метка для неё так же правдива, как верная. Поэтому данные очищают ещё до обучения."
                    }
                },
                {
                    type: "info", icon: "🔍",
                    en: {
                        title: "Look closer: learning the answers or learning the rule",
                        text: [
                            "Imagine someone who learns the answers to one practice test by heart. On that test they score 100%. On a new test with different questions they are stuck: they learned the answers, not how to work them out.",
                            "An **overfitted** model is just like that. It has learned every detail of its training examples, even the unimportant ones, but not the rule behind them. Only examples it has never seen can show the difference."
                        ]
                    },
                    ru: {
                        title: "Присмотрись: выучить ответы или выучить правило",
                        text: [
                            "Представь, что кто-то выучил наизусть ответы одной пробной контрольной. На ней у него 100%. А на новой контрольной с другими заданиями он теряется: выучены ответы, а не способ их найти.",
                            "**Переобученная** модель ведёт себя так же. Она запомнила все подробности обучающих примеров, даже неважные, но не правило, которое за ними стоит. Разницу покажут только примеры, которых она никогда не видела."
                        ]
                    }
                },
                {
                    type: "choice", card: "l13c",
                    en: {
                        q: "Two models learned from the same photos. Model A scores 100% on its training photos but 70% on the test set. Model B scores 90% on training and 88% on the test set. Which will probably do better on new photos?",
                        options: ["Model B, because its test score is higher", "Model A, because it got every training photo right", "Both the same, because they learned from the same photos"],
                        hint: "Which of the two scores comes from photos the model never learned from?",
                        why: "The test set holds examples the models never learned from, so its score is the fair guess for new photos. Model A's drop from 100% to 70% is a sign of overfitting: it learned the details, not the rule."
                    },
                    ru: {
                        q: "Две модели учились на одних и тех же фото. У модели А 100% на обучающих фото, но 70% на проверочном наборе. У модели Б 90% на обучающих и 88% на проверочном. Какая, скорее всего, лучше справится с новыми фото?",
                        options: ["Модель Б: у неё выше результат на проверке", "Модель А: она угадала все обучающие фото", "Одинаково: они ведь учились на одних и тех же фото"],
                        hint: "Какой из двух результатов получен на фото, на которых модель не училась?",
                        why: "В проверочный набор входят примеры, на которых модели не учились, поэтому результат на нём честно показывает, как они справятся с новыми фото. Падение модели А со 100% до 70% — признак переобучения: она выучила подробности, а не правило."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "A class is making a model that recognises flowers in photos. Put their steps in the right order.",
                        items: ["Collect flower photos and label each one", "Put some photos aside as the test set", "Train the model on the other photos", "Test the model on the photos put aside"],
                        hint: "When must the test photos be put aside: before the model learns, or after?",
                        why: "The test photos go aside before training, so the model never learns from them. That is what makes its score on them a fair guess for new photos."
                    },
                    ru: {
                        q: "Класс делает модель, которая узнаёт цветы на фото. Расставь шаги в правильном порядке.",
                        items: ["Собрать фото цветов и поставить каждому метку", "Отложить часть фото в проверочный набор", "Обучить модель на остальных фото", "Проверить модель на отложенных фото"],
                        hint: "Когда нужно отложить проверочные фото — до того, как модель учится, или после?",
                        why: "Проверочные фото откладывают до обучения, чтобы модель на них никогда не училась. Именно поэтому результат на них честно показывает, как она справится с новыми фото."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A class trains a model to tell apples from pears. In all their photos, test ones too, apples lie on a red plate and pears on a white one. The model gets almost every test photo right. Does this show it knows apples from pears?",
                        options: ["No: it may have learned “red plate means apple”", "No: it missed a few test photos, so it failed", "Yes: a high test score proves it learned the fruit", "Yes: a model always finds the thing that matters most"],
                        hint: "Apart from the fruit, what else is different in the apple photos and the pear photos?",
                        why: "The plate colour gives the right answer in every photo, so the model may have learned that **shortcut** instead of the fruit. The test photos have the same plates, so the test can't catch it. A pear on a red plate would."
                    },
                    ru: {
                        q: "Класс учит модель отличать яблоки от груш. На всех фото, и на проверочных тоже, яблоки лежат на красной тарелке, а груши — на белой. Модель угадывает почти все проверочные фото. Значит, она умеет отличать яблоки от груш?",
                        options: ["Нет: она могла выучить, что на красной тарелке — яблоко", "Нет: она ошиблась на нескольких фото, значит, провалилась", "Да: высокий результат на проверке доказывает, что она выучила фрукты", "Да: модель всегда находит то, что важнее всего"],
                        hint: "Чем, кроме самого фрукта, отличаются фото яблок от фото груш?",
                        why: "Цвет тарелки подсказывает верный ответ на каждом фото, поэтому модель могла выучить этот **обходной признак**, а не сами фрукты. На проверочных фото тарелки те же, так что проверка этого не заметит. А вот груша на красной тарелке — заметит."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "A team is collecting voices for an app that children will talk to. Is each step a good habit or a problem?",
                        groups: ["Good habit", "Problem"],
                        items: [
                            ["Asking parents before recording their children", 0],
                            ["Using recordings found online without asking anyone", 1],
                            ["Recording only adults, because it is easier", 1],
                            ["Writing down who is in the data and what is missing", 0],
                            ["Checking that children of all ages are included", 0],
                            ["Keeping each child's home address with the recording", 1]
                        ],
                        why: "Data is about people: ask first, and keep only what the app needs. An app that learned only from adults may understand children worse, because a model's **bias** starts in its data. Good datasets say where the data came from, who is in it and what is missing."
                    },
                    ru: {
                        q: "Команда собирает голоса для приложения, с которым будут разговаривать дети. Каждый шаг — хорошая привычка или проблема?",
                        groups: ["Хорошая привычка", "Проблема"],
                        items: [
                            ["Спросить разрешения у родителей, прежде чем записывать детей", 0],
                            ["Взять записи из интернета, никого не спросив", 1],
                            ["Записать только взрослых, потому что так проще", 1],
                            ["Описать, кто есть в данных и чего в них не хватает", 0],
                            ["Проверить, что в данных есть дети всех возрастов", 0],
                            ["Хранить вместе с записью домашний адрес ребёнка", 1]
                        ],
                        why: "Данные — это сведения о людях: сначала спроси, и храни только то, что нужно приложению. Приложение, которое училось только на голосах взрослых, может хуже понимать детей: **предвзятость** модели начинается в данных. В описании хорошего набора данных сказано, откуда данные, кто в них есть и чего не хватает."
                    }
                },
                {
                    type: "reveal", icon: "🗣️",
                    en: {
                        q: "Explain it to a friend: why do people say “garbage in, garbage out” about AI?",
                        answer: [
                            "A model learns only from its data, and it can't tell a mistake from a fact. So if the data has errors, gaps or shortcuts, the model learns those too.",
                            "That's why so much work goes into the data before training: collecting it fairly, labelling it carefully and cleaning it."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: почему про ИИ говорят «мусор на входе — мусор на выходе»?",
                        answer: [
                            "Модель учится только на своих данных и не отличает ошибку от факта. Если в данных есть ошибки, пробелы или обходные признаки, модель выучит и их.",
                            "Поэтому ещё до обучения много сил уходит на данные: их честно собирают, аккуратно размечают и очищают."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A model learns only from its examples, its **dataset**. Many examples need a **label**, the right answer, often added by people.",
                            "Messy data (missing, wrong, repeated or impossible values) teaches a model mistakes, and a model may learn a **shortcut** instead of the real thing. So data is cleaned and checked first.",
                            "A model is judged on a **test set** it never learned from. Great on training but much worse on the test means **overfitting**."
                        ]
                    },
                    ru: {
                        points: [
                            "Модель учится только на своих примерах — на **наборе данных**. Многим примерам нужна **метка**, правильный ответ, и её часто ставят люди.",
                            "Грязные данные (пропуски, ошибки, повторы, невозможные значения) учат модель ошибкам, а ещё она может выучить **обходной признак** вместо настоящего. Поэтому данные сначала очищают и проверяют.",
                            "Модель оценивают на **проверочном наборе**, на котором она не училась. Отлично на обучении, но гораздо хуже на проверке — это **переобучение**."
                        ]
                    }
                }
            ]
        },

        /* ----- l14. How Apps Choose for You: practice ----- */
        l14: {
            steps: [
                {
                    type: "info", icon: "📱",
                    en: {
                        title: "Your feed is a guess made just for you",
                        text: [
                            "An app has far more videos than your screen can show, so a **recommendation system** picks for you. From what you and people like you did before, it guesses how likely you are to watch each video, and puts the ones you will most likely watch at the top.",
                            "Think of a librarian who notices which books you finish and which you put back after one page, and remembers what readers like you enjoyed. Soon there is a shelf just for you. An app does the same, separately for every person who uses it."
                        ]
                    },
                    ru: {
                        title: "Твоя лента — догадка, сделанная для тебя",
                        text: [
                            "В приложении гораздо больше видео, чем помещается на экране, поэтому за тебя выбирает **рекомендательная система**. По тому, что делали раньше ты и похожие на тебя люди, она угадывает, насколько вероятно, что ты посмотришь каждое видео, и ставит наверх самые вероятные.",
                            "Представь библиотекаря, который замечает, какие книги ты дочитываешь, а какие откладываешь после первой страницы, и помнит, что понравилось похожим на тебя читателям. Скоро у него появляется полка специально для тебя. Приложение делает то же самое — отдельно для каждого, кто им пользуется."
                        ]
                    }
                },
                {
                    type: "choice", card: "l14a",
                    en: {
                        q: "Two friends open the same video app at the same moment, but their home pages show different videos. Why?",
                        options: ["The app guesses separately what each of them will watch", "The app shuffles its videos at random for every visit", "One of them has a newer phone with a better app"],
                        why: "A recommendation system makes a separate guess for each person, from what they watched, skipped and searched for before. Two friends have different histories, so they get different home pages, even at the same moment."
                    },
                    ru: {
                        q: "Двое друзей открывают одно и то же видеоприложение в одну и ту же минуту, но на главных страницах у них разные видео. Почему?",
                        options: ["Приложение отдельно угадывает, что посмотрит каждый из них", "Приложение каждый раз перемешивает видео случайно", "У одного из них телефон новее, а с ним и приложение лучше"],
                        why: "Рекомендательная система угадывает отдельно для каждого человека — по тому, что он раньше смотрел, пропускал и искал. У двух друзей разная история, поэтому и главные страницы разные, даже в одну и ту же минуту."
                    }
                },
                {
                    type: "sort", card: "l14b",
                    en: {
                        q: "Which big idea is the app using here: “more of the same” or “people like you”?",
                        groups: ["More of the same", "People like you"],
                        items: [
                            ["After a video about baking bread, it shows you another bread video", 0],
                            ["People who like the same cartoons as you loved a nature show, so it suggests the show to you", 1],
                            ["Shoppers who bought the same football boots as you also bought shin pads, so it shows you those", 1],
                            ["After a song by one band, it plays another song by the same band", 0],
                            ["Readers with a history like yours enjoyed a space adventure, so it suggests that book", 1],
                            ["After a book about dinosaurs, it suggests another book about dinosaurs", 0]
                        ],
                        why: "“More of the same” uses what a thing is about: bread, a band, dinosaurs. “People like you” uses what people with a history like yours chose. That second idea is called **collaborative filtering**."
                    },
                    ru: {
                        q: "Какую главную идею использует здесь приложение: «ещё того же» или «люди как ты»?",
                        groups: ["Ещё того же", "Люди как ты"],
                        items: [
                            ["После видео о выпечке хлеба тебе показывают ещё одно видео о хлебе", 0],
                            ["Людям, которым нравятся те же мультики, что и тебе, понравилась передача о природе — её советуют и тебе", 1],
                            ["Покупатели, которые купили такие же бутсы, как ты, брали и щитки — их показывают и тебе", 1],
                            ["После песни одной группы включается ещё одна песня той же группы", 0],
                            ["Читателям с похожей на твою историей понравилась повесть о космосе — её советуют тебе", 1],
                            ["После книги о динозаврах тебе советуют ещё одну книгу о динозаврах", 0]
                        ],
                        why: "Идея «ещё того же» опирается на то, о чём сама вещь: хлеб, группа, динозавры. Идея «люди как ты» — на то, что выбрали люди с похожей на твою историей. Эта вторая идея называется **коллаборативной фильтрацией**."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A music app knows nothing about a song: not its style, not its words, not even its title. But many people have played it. Which idea can still recommend it to you?",
                        options: ["“People like you”: it only needs to know who played it", "“More of the same”: it can tell the song is like the ones you play", "Neither: an app can't suggest a song it knows nothing about"],
                        hint: "Which of the two ideas has to know what the song itself is like?",
                        why: "“More of the same” has to know what the song is like. “People like you” only needs to know that people with a history like yours played it, so it works even when the app knows nothing else about the song."
                    },
                    ru: {
                        q: "Музыкальное приложение ничего не знает о песне: ни стиля, ни слов, ни даже названия. Зато её слушали многие. Какая идея всё равно может посоветовать её тебе?",
                        options: ["«Люди как ты»: достаточно знать, кто её слушал", "«Ещё того же»: видно, что песня похожа на твои любимые", "Никакая: нельзя советовать песню, о которой ничего не знаешь"],
                        hint: "Какой из двух идей нужно знать, какая песня сама по себе?",
                        why: "Идее «ещё того же» нужно знать, какая это песня. А идее «люди как ты» достаточно знать, что её слушали люди с похожей на твою историей, поэтому она работает, даже когда о песне больше ничего не известно."
                    }
                },
                {
                    type: "info", icon: "🔍",
                    en: {
                        title: "Look closer: the app only sees actions",
                        text: [
                            "A feed is not a mind-reader. The app can't see what you love or who is holding the phone: it only sees what happens on your account, signal by signal.",
                            "So if your little brother watches cartoons on your phone all afternoon, your feed may fill up with cartoons. To the app, they look like your choices."
                        ]
                    },
                    ru: {
                        title: "Присмотрись: приложение видит только действия",
                        text: [
                            "Лента не умеет читать мысли. Приложение не видит, что ты любишь и кто держит телефон: оно видит только то, что происходит в твоём аккаунте, сигнал за сигналом.",
                            "Поэтому если младший брат весь день смотрит мультики с твоего телефона, лента может заполниться мультиками. Для приложения это выглядит как твой выбор."
                        ]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Mia thinks her likes decide her feed. She likes news videos but scrolls past them in a few seconds. She never likes cat videos, but watches them to the end, often twice. What will her feed most likely show more of?",
                        options: ["Cat videos: watching to the end says more than a like", "News videos: a like is the strongest signal of all", "Neither: the app learns only from what she searches for"],
                        hint: "Does the app learn more from what Mia says or from what she does?",
                        why: "Apps learn more from what you do than from what you say. Watching to the end, and even twice, says “more of this” louder than a like, and a quick scroll is a strong “no”."
                    },
                    ru: {
                        q: "Мила думает, что её лента зависит от лайков. Видео с новостями она лайкает, но пролистывает за пару секунд. А видео с котиками не лайкает никогда, зато досматривает, часто дважды. Чего в её ленте, скорее всего, станет больше?",
                        options: ["Котиков: досмотр до конца говорит больше, чем лайк", "Новостей: лайк — самый сильный сигнал", "Ни того ни другого: приложение учится только на её поисках"],
                        hint: "Из чего приложение узнаёт больше: из того, что Мила говорит, или из того, что она делает?",
                        why: "Приложения узнают больше из того, что ты делаешь, чем из того, что ты говоришь. Досмотр до конца, да ещё дважды, говорит «ещё такого» громче лайка, а быстрое пролистывание — сильное «нет»."
                    }
                },
                {
                    type: "order", card: "l14c",
                    en: {
                        q: "Sam's feed slowly turns into a filter bubble. Put what happens in order.",
                        items: ["Sam watches a few videos about one game to the end", "The app guesses Sam wants more and shows more of that game", "Sam watches those too, because they're what the feed shows", "Sam's feed shows almost nothing else"],
                        hint: "The loop starts with something Sam does.",
                        why: "It's a loop: what you watch decides what you're shown, and you can only watch what you're shown. Each turn makes the feed narrower, until it is a **filter bubble**. Searching for new topics on purpose breaks the loop."
                    },
                    ru: {
                        q: "Лента Саши понемногу превращается в пузырь фильтров. Расставь события по порядку.",
                        items: ["Саша досматривает до конца несколько видео об одной игре", "Приложение угадывает, что Саше это интересно, и показывает больше видео об этой игре", "Саша смотрит и их — ведь именно их показывает лента", "В ленте почти не остаётся ничего другого"],
                        hint: "Петля начинается с того, что делает Саша.",
                        why: "Это петля: то, что ты смотришь, решает, что тебе покажут, а смотреть можно только показанное. С каждым кругом лента всё уже, пока не превратится в **пузырь фильтров**. Поиск новых тем разрывает петлю."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "You want to take charge of your feed. Match each wish with the control that helps.",
                        pairs: [
                            ["Stop after this video instead of getting the next one", "Turn off autoplay"],
                            ["See fewer videos of one kind", "Tap “Not interested”"],
                            ["Watch videos for a school project without them shaping your feed", "Pause your watch history"],
                            ["Bring a new topic into your feed", "Follow people who post about it"]
                        ],
                        why: "You have more control than it seems. Autoplay keeps you watching, so turning it off helps you stop. “Not interested” and following new people send the app new signals, and pausing your history stops new videos being added to it."
                    },
                    ru: {
                        q: "Ты хочешь управлять своей лентой. Сопоставь каждое желание с тем, что помогает.",
                        pairs: [
                            ["Остановиться после этого видео, а не смотреть следующее", "Выключить автовоспроизведение"],
                            ["Видеть меньше роликов одного вида", "Нажать «Не интересно»"],
                            ["Посмотреть видео для школьного проекта так, чтобы они не влияли на ленту", "Приостановить историю просмотров"],
                            ["Добавить в ленту новую тему", "Подписаться на тех, кто о ней рассказывает"]
                        ],
                        why: "Управления у тебя больше, чем кажется. Автовоспроизведение держит тебя у экрана, поэтому, если его выключить, легче остановиться. «Не интересно» и подписки на новых людей дают приложению новые сигналы, а на паузе история не пополняется новыми видео."
                    }
                },
                {
                    type: "reveal", icon: "🗣️",
                    en: {
                        q: "Explain it to a friend: your feed shows what you are most likely to watch. Why is that not always what is best for you?",
                        answer: [
                            "The app guesses what will keep you watching, from what you did before. But a video you are likely to watch is not always true, useful or good for you.",
                            "Apps are usually built to keep you watching. So it's worth choosing on purpose too: search for new things, and stop when you want to."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: лента показывает то, что ты скорее всего посмотришь. Почему это не всегда лучшее для тебя?",
                        answer: [
                            "Приложение угадывает, что удержит тебя у экрана, по твоим прошлым действиям. Но то, что ты скорее всего посмотришь, не всегда правдиво, полезно или хорошо для тебя.",
                            "Приложения обычно сделаны так, чтобы удерживать тебя подольше. Поэтому стоит выбирать и самостоятельно: искать новое и останавливаться, когда хочется."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A **recommendation system** guesses what you are likely to watch and puts its best guesses first, separately for each person.",
                            "Two big ideas: “more of the same”, and “people like you” (**collaborative filtering**), which works without knowing what a video is about.",
                            "Watching, skipping and searching are **signals**. A feed can narrow into a **filter bubble**, and you can widen it on purpose."
                        ]
                    },
                    ru: {
                        points: [
                            "**Рекомендательная система** угадывает, что ты скорее всего посмотришь, и ставит лучшие догадки первыми — отдельно для каждого.",
                            "Две главные идеи: «ещё того же» и «люди как ты» (**коллаборативная фильтрация**), которой не нужно знать, о чём видео.",
                            "Просмотры, пропуски и поиски — это **сигналы**. Лента может сжаться в **пузырь фильтров**, и ты можешь специально её расширить."
                        ]
                    }
                }
            ]
        },

        /* ----- l15. Plan Your Own AI Project: practice ----- */
        l15: {
            steps: [
                {
                    type: "info", icon: "📋",
                    en: {
                        title: "Plan first, then build",
                        text: [
                            "A good AI project has four parts: a real problem that no simple rule can solve, good examples with the right labels, an honest test, and care for the people who will use it.",
                            "Imagine your class wants to know which birds visit the school feeder. No simple rule tells a sparrow from a robin, so AI can help. You would need many labelled photos from that very feeder, a fair test, and an app that says when it isn't sure."
                        ]
                    },
                    ru: {
                        title: "Сначала план, потом модель",
                        text: [
                            "В хорошем ИИ-проекте четыре части: настоящая задача, которую не решить простым правилом, хорошие примеры с правильными метками, честная проверка и забота о людях, которые будут им пользоваться.",
                            "Допустим, твой класс хочет знать, какие птицы прилетают к школьной кормушке. Простым правилом воробья от синицы не отличить, так что ИИ может помочь. Понадобится много фото с метками, снятых у этой самой кормушки. А ещё — честная проверка и приложение, которое говорит, когда не уверено."
                        ]
                    }
                },
                {
                    type: "sort", card: "l15a",
                    en: {
                        q: "For which of these projects is a simple rule enough, and for which would AI really help?",
                        groups: ["A simple rule is enough", "AI would really help"],
                        items: [
                            ["Ring the school bell at 9:00 every morning", 0],
                            ["Tell a friend's handwriting from yours", 1],
                            ["Spot which drawings in a pile show a horse", 1],
                            ["Turn on the heating when the room is below 18 °C", 0],
                            ["Recognise your dog's bark among other dogs' barks", 1],
                            ["Remind you of your friends' birthdays", 0]
                        ],
                        why: "If you can write the rule down (“at 9:00, ring the bell”), use the rule: it's easier to build, check and explain. AI helps when the rule is hard to put into words but easy to show with examples, like what a horse looks like in a drawing."
                    },
                    ru: {
                        q: "Для каких из этих проектов хватит простого правила, а для каких действительно пригодится ИИ?",
                        groups: ["Хватит простого правила", "Пригодится ИИ"],
                        items: [
                            ["Давать школьный звонок каждое утро в 9:00", 0],
                            ["Отличать почерк друга от твоего", 1],
                            ["Находить в стопке рисунков те, где нарисована лошадь", 1],
                            ["Включать отопление, когда в комнате ниже 18 °C", 0],
                            ["Узнавать лай твоей собаки среди лая других собак", 1],
                            ["Напоминать о днях рождения друзей", 0]
                        ],
                        why: "Если правило можно записать («в 9:00 — звонок»), используй правило: его легче сделать, проверить и объяснить. ИИ помогает, когда правило трудно выразить словами, но легко показать на примерах — например, как выглядит лошадь на рисунке."
                    }
                },
                {
                    type: "choice", card: "l15b",
                    en: {
                        q: "Your app will recognise fruit in photos that families take at home with their own phones. All your training photos were taken in one bright classroom with one tablet. What is the biggest risk?",
                        options: ["It may do worse on home photos, which look different", "None: an apple looks the same in every photo", "None: lots of photos from one place make it reliable"],
                        why: "A model learns what its examples show. Home photos have other light, other backgrounds and other cameras, so collect examples from the real situation the app will work in."
                    },
                    ru: {
                        q: "Твоё приложение будет узнавать фрукты на фото, которые семьи снимают дома на свои телефоны. Все обучающие фото сняты в одном светлом классе на один планшет. В чём главный риск?",
                        options: ["На домашних фото оно может ошибаться чаще: они выглядят иначе", "Никакого: яблоко на любом фото выглядит одинаково", "Никакого: много фото из одного места делают его надёжным"],
                        why: "Модель учится тому, что показывают её примеры. На домашних фото другой свет, другой фон и другие камеры, поэтому примеры нужно собирать там, где приложение будет работать."
                    }
                },
                {
                    type: "number", answer: 200,
                    en: {
                        q: "You have 250 labelled photos. Before training, you put one photo in every five aside for the test. How many photos will the model learn from?",
                        hint: "First work out how many photos go into the test set.",
                        why: "One in five of 250 is 50 photos for the test. The model learns from the other 200 and never sees the 50 until it is tested."
                    },
                    ru: {
                        q: "У тебя 250 фото с метками. До обучения ты откладываешь для проверки каждое пятое фото. На скольких фото будет учиться модель?",
                        hint: "Сначала посчитай, сколько фото уйдёт в проверочный набор.",
                        why: "Каждое пятое из 250 — это 50 фото для проверки. Модель учится на остальных 200 и не видит эти 50 до самой проверки."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Leo's model gets some test photos wrong. To get a better score, he takes those photos out of the test set. What is wrong with this?",
                        options: ["The score no longer shows how it will do on real photos", "Nothing: a test should only hold photos it gets right", "Nothing: fewer test photos make a fairer test"],
                        hint: "What is a test for: a nice number, or the truth?",
                        why: "A test is there to show the truth before real users find it. The photos it gets wrong show exactly what to fix, like more examples or better labels. Hiding them hides the problem, but doesn't remove it."
                    },
                    ru: {
                        q: "Модель Лёвы ошибается на некоторых проверочных фото. Чтобы результат стал лучше, он убирает эти фото из проверочного набора. Что здесь не так?",
                        options: ["Результат больше не показывает, как она справится с настоящими фото", "Ничего: в проверке должны быть только фото, которые она угадывает", "Ничего: чем меньше проверочных фото, тем честнее проверка"],
                        hint: "Зачем нужна проверка: ради красивого числа или ради правды?",
                        why: "Проверка нужна, чтобы узнать правду раньше пользователей. Фото с ошибками как раз показывают, что исправить: добавить примеров или поправить метки. Если их спрятать, проблема спрячется, но не исчезнет."
                    }
                },
                {
                    type: "info", icon: "🔍",
                    en: {
                        title: "Look closer: not all mistakes cost the same",
                        text: [
                            "If a music app guesses wrong, you skip a song. If a plant app calls a sick plant healthy, you may lose the plant. Two models with the same score can make very different mistakes.",
                            "So before you decide how sure your model must be, decide which mistake would hurt more, and look at which mistakes it really makes."
                        ]
                    },
                    ru: {
                        title: "Присмотрись: ошибки обходятся по-разному",
                        text: [
                            "Если ошибётся музыкальное приложение, ты пропустишь песню. Если приложение для растений назовёт больное растение здоровым, растение может погибнуть. У двух моделей с одинаковым результатом ошибки могут быть совсем разными.",
                            "Поэтому прежде чем решать, насколько уверенной должна быть модель, реши, какая ошибка хуже, и посмотри, какие ошибки она делает на самом деле."
                        ]
                    }
                },
                {
                    type: "choice", card: "l15c",
                    en: {
                        q: "Two apps check whether the class hamster's water bottle is empty, and both are right 90% of the time in tests. App A sometimes misses an empty bottle. App B sometimes says “empty” when it isn't. Which should the class choose?",
                        options: ["App B: a false alarm only costs someone a quick look", "App A: it sends fewer messages, so it bothers people less", "Either: with the same score they are equally good"],
                        why: "A false alarm means a pupil checks the bottle and finds it full. A missed empty bottle means a thirsty hamster. Same score, different mistakes: always look at which mistakes a model makes."
                    },
                    ru: {
                        q: "Два приложения проверяют, пуста ли поилка хомяка в классе, и оба правы в 90% проверок. Приложение А иногда пропускает пустую поилку. Приложение Б иногда говорит «пусто», когда она полная. Какое стоит выбрать классу?",
                        options: ["Б: ложная тревога — это всего лишь лишний взгляд на поилку", "А: оно реже пишет и меньше отвлекает людей", "Любое: с одинаковым результатом они одинаково хороши"],
                        why: "Ложная тревога — это когда ученик заглянет в поилку и увидит, что она полная. А пропущенная пустая поилка — это хомяк без воды. Результат один, а ошибки разные: всегда смотри, какие именно ошибки делает модель."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Put the steps of an AI project in the right order.",
                        items: ["Pick a real problem and check that a simple rule can't solve it", "Collect varied examples and get their labels checked", "Put some examples aside, then train on the rest", "Test on the examples put aside and study the mistakes", "Tell users how sure it is and what to do if it's wrong"],
                        hint: "You can only tell users how sure the model is once you have tested it.",
                        why: "Problem first, then data, then an honest test, then the people. Each step needs the one before it: you can't test before you train, or promise anything before you test."
                    },
                    ru: {
                        q: "Расставь шаги ИИ-проекта в правильном порядке.",
                        items: ["Выбрать настоящую задачу и убедиться, что простое правило её не решит", "Собрать разнообразные примеры и проверить их метки", "Отложить часть примеров, а на остальных обучить модель", "Проверить модель на отложенных примерах и разобрать ошибки", "Сказать пользователям, насколько модель уверена и что делать при ошибке"],
                        hint: "Сказать пользователям, насколько модель уверена, можно только после проверки.",
                        why: "Сначала задача, потом данные, потом честная проверка, потом люди. Каждый шаг опирается на предыдущий: нельзя проверить модель до обучения или что-то обещать до проверки."
                    }
                },
                {
                    type: "reveal", icon: "🗣️",
                    en: {
                        q: "Explain it to a friend: before you share your AI app, what should you think about the people who will use it?",
                        answer: [
                            "Who will use it, and who could be hurt by its mistakes? Does it work equally well for all of them, and does it collect anything private it doesn't need?",
                            "Then be honest with them: say it's AI, how sure it is, and what to do when it might be wrong."
                        ]
                    },
                    ru: {
                        q: "Объясни другу: о чём стоит подумать, прежде чем делиться своим ИИ-приложением с другими людьми?",
                        answer: [
                            "Кто будет им пользоваться и кому могут навредить его ошибки? Одинаково ли хорошо оно работает для всех и не собирает ли личное, что ему не нужно?",
                            "А ещё нужна честность: скажи, что это ИИ, насколько оно уверено и что делать, если оно может ошибаться."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Start with a real problem. Use AI only when the rule is hard to write down but easy to show with examples.",
                            "Collect varied examples of every answer, from the real situation, with labels checked by someone who knows.",
                            "Test on examples put aside, look at which mistakes the model makes, and tell users honestly about its limits."
                        ]
                    },
                    ru: {
                        points: [
                            "Начинай с настоящей задачи. ИИ нужен, только когда правило трудно записать, но легко показать на примерах.",
                            "Собирай разнообразные примеры каждого ответа из настоящей ситуации, с метками, которые проверил знающий человек.",
                            "Проверяй на отложенных примерах, смотри, какие ошибки делает модель, и честно говори пользователям о её границах."
                        ]
                    }
                }
            ]
        }
    }
});
