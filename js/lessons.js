/* =========================================================
   AI COMPASS — LESSONS
   Six interactive lessons. This file builds:
   1. a progress panel (ring, lesson map, continue / reset)
   2. a grid of lesson cards
   3. a full-screen lesson reader with a mini-lab, key ideas,
      a "check yourself" question and previous / next buttons
   4. a downloadable certificate when every lesson is done
   It also adds "Open lesson" commands to the Ctrl+K palette
   and window.AICompass.openLesson(number) for other features.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="lessons"]');
    if (!A || !mount) return;

    const t = A.t;
    const esc = A.escapeHTML;
    const TOTAL = 6;

    // ---------- 1. The six lessons ----------
    // The texts live in the translations below (keys "lessons.l1.title", ...).
    // rgb: which accent colour the lesson uses. lab: which mini-lab it shows.
    // correct: index (0, 1 or 2) of the right answer to "Check yourself".
    // notes: which sections have a small highlighted box, and its type.
    const LESSONS = [
        {
            number: 1, icon: "🤖", level: "beginner", minutes: 4, rgb: "--accent-rgb",
            sections: 4, notes: { 1: "fact", 2: "example" }, lab: "sort", correct: 1,
            tryIt: "timeline", tryIcon: "🕰️",
            keywords: "what is ai artificial intelligence basics что такое ии искусственный интеллект основы"
        },
        {
            number: 2, icon: "📊", level: "beginner", minutes: 5, rgb: "--accent-2-rgb",
            sections: 4, notes: { 2: "tip" }, lab: "fit", correct: 2,
            tryIt: "classifier", tryIcon: "🧪",
            keywords: "machine learning training data model машинное обучение данные модель"
        },
        {
            number: 3, icon: "🧠", level: "intermediate", minutes: 6, rgb: "--accent-3-rgb",
            sections: 4, notes: { 3: "example" }, lab: "neuron", correct: 0,
            tryIt: "classifier", tryIcon: "🧪",
            keywords: "neural networks neuron deep learning нейронные сети нейрон глубокое обучение нейросеть"
        },
        {
            number: 4, icon: "💬", level: "intermediate", minutes: 6, rgb: "--accent-rgb",
            sections: 4, notes: { 3: "example" }, lab: "words", correct: 2,
            tryIt: "predictor", tryIcon: "🔮",
            keywords: "generative ai chatbots llm chatgpt генеративный ии чат-боты чатбот языковая модель"
        },
        {
            number: 5, icon: "📱", level: "beginner", minutes: 4, rgb: "--accent-2-rgb",
            sections: 4, notes: { 1: "fact" }, lab: "day", correct: 1,
            tryIt: "glossary", tryIcon: "📖",
            keywords: "everyday life phone recommendations повседневная жизнь телефон рекомендации"
        },
        {
            number: 6, icon: "⚖️", level: "intermediate", minutes: 5, rgb: "--accent-3-rgb",
            sections: 4, notes: { 2: "tip" }, lab: "dilemmas", correct: 0,
            tryIt: "quiz", tryIcon: "🏆",
            keywords: "ethics safety bias deepfakes privacy этика безопасность предвзятость дипфейки приватность"
        }
    ];

    // ---------- 2. Translations: interface ----------
    A.addTranslations({
        en: {
            "lessons.hud.label": "Your progress",
            "lessons.hud.count.one": "{n} of {total} lessons completed",
            "lessons.hud.count.many": "{n} of {total} lessons completed",
            "lessons.hud.left.one": "{n} lesson to go",
            "lessons.hud.left.many": "{n} lessons to go",
            "lessons.hud.upNext": "Up next: {title}",
            "lessons.hud.allDone": "All lessons completed — amazing work! 🏆",
            "lessons.hud.start": "Start with lesson 1",
            "lessons.hud.continue": "Continue: lesson {n}",
            "lessons.hud.reset": "Reset progress",
            "lessons.hud.resetConfirm": "Sure? Click again",
            "lessons.hud.resetAsk": "Press the button again to reset all lesson progress.",
            "lessons.hud.pathLabel": "Lesson map",
            "lessons.hud.nodeTodo": "Lesson {n}: {title}",
            "lessons.hud.nodeDone": "Lesson {n}: {title} (completed)",

            "lessons.card.open": "Open lesson",
            "lessons.card.review": "Review lesson",
            "lessons.card.openLabel": "Open lesson {n}: {title}",
            "lessons.card.reviewLabel": "Review lesson {n}: {title} (completed)",
            "lessons.card.done": "Completed",
            "lessons.card.next": "Up next",
            "lessons.card.minutes": "{n} min",
            "lessons.level.beginner": "Beginner",
            "lessons.level.intermediate": "Intermediate",

            "lessons.reader.crumb": "Lesson {n} / {total}",
            "lessons.reader.close": "Close lesson",
            "lessons.reader.prev": "Previous",
            "lessons.reader.next": "Next",
            "lessons.reader.prevLabel": "Previous lesson: {title}",
            "lessons.reader.nextLabel": "Next lesson: {title}",
            "lessons.reader.firstLesson": "This is the first lesson",
            "lessons.reader.finish": "Finish",
            "lessons.reader.finishTitle": "All lessons",
            "lessons.reader.finishLabel": "Finish and go back to all lessons",
            "lessons.reader.complete": "Mark as complete",
            "lessons.reader.completed": "Completed",
            "lessons.reader.undo": "Undo",
            "lessons.reader.undoLabel": "Completed · Undo: mark this lesson as not completed",
            "lessons.reader.toc": "In this lesson",
            "lessons.reader.listen": "Listen",
            "lessons.reader.stop": "Stop",
            "lessons.reader.listenLabel": "Read the lesson aloud",
            "lessons.reader.noSpeech": "Reading aloud isn't available in this browser",
            "lessons.reader.textSize": "Text size: {size}",
            "lessons.reader.size.s": "small",
            "lessons.reader.size.m": "medium",
            "lessons.reader.size.l": "large",
            "lessons.reader.keys": "← → lessons · Esc close",
            "lessons.reader.miniLab": "Mini-lab",
            "lessons.reader.keyIdeas": "Key ideas",
            "lessons.reader.tryIt": "Try it on this site",
            "lessons.reader.check": "Check yourself",
            "lessons.note.fact": "Fun fact",
            "lessons.note.example": "Example",
            "lessons.note.tip": "Good to know",

            "lessons.check.letters": "A|B|C",
            "lessons.check.correct": "Correct!",
            "lessons.check.wrong": "Not quite.",
            "lessons.check.rightAnswer": "The right answer is: “{answer}”.",
            "lessons.check.retry": "Try again",
            "lessons.check.autoDone": "✓ This lesson is marked as complete.",

            "lessons.toast.done": "Lesson complete: {title}",
            "lessons.toast.undone": "Lesson marked as not completed",
            "lessons.toast.all": "All 6 lessons completed! You're an AI explorer now.",
            "lessons.toast.reset": "Lesson progress reset",
            "lessons.toast.cert": "Certificate downloaded!",

            "lessons.cert.button": "Get your certificate",
            "lessons.cert.title": "Your AI Compass certificate",
            "lessons.cert.intro": "Every lesson is done! Type your name and download your personal certificate.",
            "lessons.cert.nameLabel": "Name on the certificate",
            "lessons.cert.placeholder": "Your name",
            "lessons.cert.download": "Download PNG",
            "lessons.cert.preview": "Certificate preview for {name}",
            "lessons.cert.heading": "Certificate of completion",
            "lessons.cert.for": "for successfully completing all six AI Compass lessons",
            "lessons.cert.defaultName": "AI Explorer",
            "lessons.cert.date": "Issued on {date}",
            "lessons.cert.lessons": "lessons",

            "lessons.cmdGroup": "Lessons",
            "lessons.cmdOpen": "Open lesson: {title}",
            "lessons.cmdContinue": "Continue learning"
        },
        ru: {
            "lessons.hud.label": "Твой прогресс",
            "lessons.hud.count.one": "Пройден {n} урок из {total}",
            "lessons.hud.count.few": "Пройдено {n} урока из {total}",
            "lessons.hud.count.many": "Пройдено {n} уроков из {total}",
            "lessons.hud.left.one": "Остался {n} урок",
            "lessons.hud.left.few": "Осталось {n} урока",
            "lessons.hud.left.many": "Осталось {n} уроков",
            "lessons.hud.upNext": "Дальше: {title}",
            "lessons.hud.allDone": "Все уроки пройдены — это потрясающе! 🏆",
            "lessons.hud.start": "Начать с урока 1",
            "lessons.hud.continue": "Продолжить: урок {n}",
            "lessons.hud.reset": "Сбросить прогресс",
            "lessons.hud.resetConfirm": "Точно? Нажми ещё раз",
            "lessons.hud.resetAsk": "Нажми кнопку ещё раз, чтобы сбросить весь прогресс уроков.",
            "lessons.hud.pathLabel": "Карта уроков",
            "lessons.hud.nodeTodo": "Урок {n}: {title}",
            "lessons.hud.nodeDone": "Урок {n}: {title} (пройден)",

            "lessons.card.open": "Открыть урок",
            "lessons.card.review": "Повторить урок",
            "lessons.card.openLabel": "Открыть урок {n}: {title}",
            "lessons.card.reviewLabel": "Повторить урок {n}: {title} (пройден)",
            "lessons.card.done": "Пройден",
            "lessons.card.next": "Следующий",
            "lessons.card.minutes": "{n} мин",
            "lessons.level.beginner": "Начальный",
            "lessons.level.intermediate": "Средний",

            "lessons.reader.crumb": "Урок {n} / {total}",
            "lessons.reader.close": "Закрыть урок",
            "lessons.reader.prev": "Назад",
            "lessons.reader.next": "Дальше",
            "lessons.reader.prevLabel": "Предыдущий урок: {title}",
            "lessons.reader.nextLabel": "Следующий урок: {title}",
            "lessons.reader.firstLesson": "Это первый урок",
            "lessons.reader.finish": "Готово",
            "lessons.reader.finishTitle": "Все уроки",
            "lessons.reader.finishLabel": "Закончить и вернуться ко всем урокам",
            "lessons.reader.complete": "Отметить пройденным",
            "lessons.reader.completed": "Пройден",
            "lessons.reader.undo": "Отменить",
            "lessons.reader.undoLabel": "Пройден · Отменить: снять отметку о прохождении",
            "lessons.reader.toc": "В этом уроке",
            "lessons.reader.listen": "Слушать",
            "lessons.reader.stop": "Стоп",
            "lessons.reader.listenLabel": "Прочитать урок вслух",
            "lessons.reader.noSpeech": "Чтение вслух недоступно в этом браузере",
            "lessons.reader.textSize": "Размер текста: {size}",
            "lessons.reader.size.s": "мелкий",
            "lessons.reader.size.m": "средний",
            "lessons.reader.size.l": "крупный",
            "lessons.reader.keys": "← → уроки · Esc закрыть",
            "lessons.reader.miniLab": "Мини-лаборатория",
            "lessons.reader.keyIdeas": "Главное",
            "lessons.reader.tryIt": "Попробуй на сайте",
            "lessons.reader.check": "Проверь себя",
            "lessons.note.fact": "Интересный факт",
            "lessons.note.example": "Пример",
            "lessons.note.tip": "Полезно знать",

            "lessons.check.letters": "А|Б|В",
            "lessons.check.correct": "Верно!",
            "lessons.check.wrong": "Не совсем.",
            "lessons.check.rightAnswer": "Правильный ответ: «{answer}».",
            "lessons.check.retry": "Попробовать ещё раз",
            "lessons.check.autoDone": "✓ Урок отмечен как пройденный.",

            "lessons.toast.done": "Урок пройден: {title}",
            "lessons.toast.undone": "Отметка о прохождении снята",
            "lessons.toast.all": "Все 6 уроков пройдены! Теперь ты настоящий исследователь ИИ.",
            "lessons.toast.reset": "Прогресс уроков сброшен",
            "lessons.toast.cert": "Сертификат скачан!",

            "lessons.cert.button": "Получить сертификат",
            "lessons.cert.title": "Твой сертификат AI Compass",
            "lessons.cert.intro": "Все уроки пройдены! Введи своё имя и скачай личный сертификат.",
            "lessons.cert.nameLabel": "Имя на сертификате",
            "lessons.cert.placeholder": "Твоё имя",
            "lessons.cert.download": "Скачать PNG",
            "lessons.cert.preview": "Предпросмотр сертификата: {name}",
            "lessons.cert.heading": "Сертификат о прохождении",
            "lessons.cert.for": "за успешное прохождение всех шести уроков AI Compass",
            "lessons.cert.defaultName": "Исследователь ИИ",
            "lessons.cert.date": "Дата выдачи: {date}",
            "lessons.cert.lessons": "уроков",

            "lessons.cmdGroup": "Уроки",
            "lessons.cmdOpen": "Открыть урок: {title}",
            "lessons.cmdContinue": "Продолжить обучение"
        }
    });

    // ---------- 3. Translations: lesson 1 — What is AI? ----------
    A.addTranslations({
        en: {
            "lessons.l1.title": "What is AI?",
            "lessons.l1.desc": "What artificial intelligence really is — and what it isn't.",
            "lessons.l1.s1.h": "A simple definition",
            "lessons.l1.s1.p": "<strong>Artificial Intelligence (AI)</strong> is the ability of a computer system to do tasks that usually need human intelligence: recognising faces, understanding speech, translating languages or making decisions. AI doesn't think like a person. It finds <strong>patterns in data</strong> and uses them to make predictions — like guessing which word you'll type next.",
            "lessons.l1.s1.note": "The term “artificial intelligence” was invented in 1955 by computer scientist John McCarthy, for a summer workshop at Dartmouth College in 1956. So AI is older than the Internet!",
            "lessons.l1.s2.h": "Rules vs. learning",
            "lessons.l1.s2.p": "Classic programs follow rules that a programmer writes by hand: <em>“if the temperature is below 0 °C, show a snowflake”</em>. Most modern AI works differently: it <strong>learns its own rules from examples</strong>. Instead of describing what a cat looks like, you show the computer thousands of cat photos, and it figures out the pattern by itself.",
            "lessons.l1.s2.note": "Nobody tells a spam filter every trick that scammers use. It learns to spot new tricks from millions of emails that people marked as spam.",
            "lessons.l1.s3.h": "Narrow AI vs. general AI",
            "lessons.l1.s3.p": "Today's AI is <strong>narrow</strong>: each system is built for a certain kind of task. A chess program can beat any human champion, but it can't recognise a cat. Even chatbots that can talk about almost anything still make mistakes that a child wouldn't. <strong>Artificial General Intelligence (AGI)</strong> — an AI that could learn any intellectual task a human can — doesn't exist yet, and experts disagree about when, or whether, it will arrive.",
            "lessons.l1.s4.h": "Why it matters to you",
            "lessons.l1.s4.p": "AI already decides which videos you see, makes your photos look better and helps doctors find diseases. Knowing the basics helps you use it wisely, notice its mistakes — and maybe one day build AI yourself.",
            "lessons.l1.key1": "AI means computer systems doing tasks that normally need human intelligence.",
            "lessons.l1.key2": "Modern AI learns patterns from data instead of only following hand-written rules.",
            "lessons.l1.key3": "All AI today is limited: human-level general AI (AGI) doesn't exist yet.",
            "lessons.l1.tip": "AI has a long history. See how it grew from one question in 1950 to the AI in your pocket.",
            "lessons.l1.tipBtn": "Open the AI history",
            "lessons.l1.q": "Which of these is the best example of AI?",
            "lessons.l1.a1": "A lamp that turns on when you flip a switch",
            "lessons.l1.a2": "A translation app that learned from millions of translated texts",
            "lessons.l1.a3": "An alarm clock that rings at 7:00 every morning",
            "lessons.l1.explain": "The translation app learned patterns from huge amounts of data. The lamp and the alarm clock just follow simple, fixed rules — no learning involved."
        },
        ru: {
            "lessons.l1.title": "Что такое ИИ?",
            "lessons.l1.desc": "Что такое искусственный интеллект на самом деле — и чем он не является.",
            "lessons.l1.s1.h": "Простое определение",
            "lessons.l1.s1.p": "<strong>Искусственный интеллект (ИИ)</strong> — это способность компьютерной системы выполнять задачи, для которых обычно нужен человеческий интеллект: узнавать лица, понимать речь, переводить тексты или принимать решения. ИИ не думает как человек. Он находит <strong>закономерности в данных</strong> и использует их, чтобы делать прогнозы — например, угадывать, какое слово ты напечатаешь следующим.",
            "lessons.l1.s1.note": "Термин «искусственный интеллект» придумал в 1955 году учёный Джон Маккарти — для летнего семинара в Дартмутском колледже в 1956 году. Так что ИИ старше интернета!",
            "lessons.l1.s2.h": "Правила или обучение",
            "lessons.l1.s2.p": "Обычные программы следуют правилам, которые программист пишет вручную: <em>«если температура ниже 0 °C, покажи снежинку»</em>. Большинство современных систем ИИ работают иначе: они <strong>сами выводят правила из примеров</strong>. Вместо того чтобы описывать, как выглядит кошка, компьютеру показывают тысячи фотографий кошек, и он сам находит закономерность.",
            "lessons.l1.s2.note": "Спам-фильтру никто не объясняет все уловки мошенников. Он сам учится замечать новые уловки на миллионах писем, которые люди отметили как спам.",
            "lessons.l1.s3.h": "Узкий ИИ и общий ИИ",
            "lessons.l1.s3.p": "Сегодняшний ИИ — <strong>узкий</strong>: каждая система создана для определённого типа задач. Шахматная программа обыграет любого чемпиона, но не узнает кошку на фото. Даже чат-боты, которые могут говорить почти о чём угодно, всё ещё делают ошибки, которых не допустил бы ребёнок. <strong>Общий искусственный интеллект (AGI)</strong> — ИИ, способный научиться любой интеллектуальной задаче, как человек, — пока не существует, и эксперты спорят, когда он появится и появится ли вообще.",
            "lessons.l1.s4.h": "Почему это важно для тебя",
            "lessons.l1.s4.p": "ИИ уже решает, какие видео ты увидишь, улучшает твои фото и помогает врачам находить болезни. Зная основы, ты сможешь пользоваться им с умом, замечать его ошибки — а может, однажды и сам создашь ИИ.",
            "lessons.l1.key1": "ИИ — это компьютерные системы, которые решают задачи, обычно требующие человеческого интеллекта.",
            "lessons.l1.key2": "Современный ИИ находит закономерности в данных, а не только следует правилам, написанным вручную.",
            "lessons.l1.key3": "Любой сегодняшний ИИ ограничен: общего ИИ уровня человека (AGI) пока нет.",
            "lessons.l1.tip": "У ИИ долгая история. Посмотри, как он прошёл путь от одного вопроса в 1950 году до ИИ в твоём кармане.",
            "lessons.l1.tipBtn": "Открыть историю ИИ",
            "lessons.l1.q": "Что из этого — лучший пример ИИ?",
            "lessons.l1.a1": "Лампа, которая включается, когда нажимаешь выключатель",
            "lessons.l1.a2": "Приложение-переводчик, обученное на миллионах переведённых текстов",
            "lessons.l1.a3": "Будильник, который звонит каждое утро в 7:00",
            "lessons.l1.explain": "Переводчик нашёл закономерности в огромном количестве данных. Лампа и будильник просто следуют простым фиксированным правилам — никакого обучения."
        }
    });

    // ---------- 4. Translations: lesson 2 — Machine Learning ----------
    A.addTranslations({
        en: {
            "lessons.l2.title": "Machine Learning",
            "lessons.l2.desc": "How computers learn from examples instead of instructions.",
            "lessons.l2.s1.h": "Learning from examples",
            "lessons.l2.s1.p": "<strong>Machine learning (ML)</strong> is the most common way to build AI today. Instead of programming every rule, we give the computer lots of <strong>examples</strong>, and it finds the patterns by itself. To build a spam filter, for example, you show it thousands of emails labelled “spam” or “not spam”. It starts to notice clues: words like “FREE!!!”, strange links or unknown senders.",
            "lessons.l2.s2.h": "Training and testing",
            "lessons.l2.s2.p": "Learning happens step by step. During <strong>training</strong>, the model guesses an answer, measures how wrong it was (the <strong>error</strong>) and adjusts itself a tiny bit to be less wrong. This repeats thousands or even millions of times. Then comes <strong>testing</strong>: the model gets new examples it has never seen, to check that it really learned the pattern instead of just memorising the answers.",
            "lessons.l2.s2.note": "When a model memorises its training examples but fails on new ones, it's called overfitting — like learning test answers by heart without understanding the topic.",
            "lessons.l2.s3.h": "Three ways to learn",
            "lessons.l2.s3.p": "<strong>Supervised learning:</strong> every example comes with the right answer (a label), like photos tagged “cat” or “dog”. <strong>Unsupervised learning:</strong> there are no labels, and the model finds groups by itself, like sorting songs by how similar they sound. <strong>Reinforcement learning:</strong> the model learns by trial and error, getting rewards for good moves — that's how AI learned to play Go and many video games.",
            "lessons.l2.s4.h": "Data is everything",
            "lessons.l2.s4.p": "A model is only as good as its data. If the examples are too few, messy or one-sided, the model learns the wrong pattern. Imagine a model that learns to recognise wolves, but every wolf photo in its training data has snow in the background. It might decide that <em>snow</em> means “wolf” — and call a husky in the snow a wolf!",
            "lessons.l2.key1": "Machine learning models learn patterns from examples (data) instead of hand-written rules.",
            "lessons.l2.key2": "Training: guess, measure the error, adjust, repeat. Testing: check on new, unseen data.",
            "lessons.l2.key3": "Too little or one-sided data makes the model learn the wrong lessons.",
            "lessons.l2.tip": "Be the teacher! In the AI Lab you can give a classifier your own examples and watch it learn.",
            "lessons.l2.tipBtn": "Open the classifier",
            "lessons.l2.q": "Why do we test a model on examples it has never seen before?",
            "lessons.l2.a1": "To make the training go faster",
            "lessons.l2.a2": "Because the training examples are deleted after training",
            "lessons.l2.a3": "To check it learned the pattern, not just memorised the answers",
            "lessons.l2.explain": "A model that only memorised its training data fails on anything new. Testing on unseen data shows whether it really learned the general pattern."
        },
        ru: {
            "lessons.l2.title": "Машинное обучение",
            "lessons.l2.desc": "Как компьютеры учатся на примерах, а не по инструкциям.",
            "lessons.l2.s1.h": "Обучение на примерах",
            "lessons.l2.s1.p": "<strong>Машинное обучение (МО)</strong> — самый распространённый способ создавать ИИ сегодня. Вместо того чтобы прописывать каждое правило, компьютеру дают много <strong>примеров</strong>, и он сам находит закономерности. Например, чтобы создать спам-фильтр, ему показывают тысячи писем с пометками «спам» и «не спам». Он начинает замечать подсказки: слова вроде «БЕСПЛАТНО!!!», странные ссылки или незнакомых отправителей.",
            "lessons.l2.s2.h": "Обучение и проверка",
            "lessons.l2.s2.p": "Обучение идёт шаг за шагом. Во время <strong>обучения</strong> модель угадывает ответ, измеряет, насколько ошиблась (это <strong>ошибка</strong>), и чуть-чуть подстраивает себя, чтобы ошибаться меньше. Так повторяется тысячи и даже миллионы раз. Потом идёт <strong>проверка</strong>: модель получает новые примеры, которых раньше не видела, — так мы убеждаемся, что она действительно поняла закономерность, а не просто запомнила ответы.",
            "lessons.l2.s2.note": "Когда модель зазубривает обучающие примеры, но ошибается на новых, это называют переобучением — как выучить ответы к контрольной наизусть, не понимая темы.",
            "lessons.l2.s3.h": "Три способа учиться",
            "lessons.l2.s3.p": "<strong>Обучение с учителем:</strong> к каждому примеру прилагается правильный ответ (метка), например фото с подписями «кошка» или «собака». <strong>Обучение без учителя:</strong> меток нет, и модель сама находит группы — например, сортирует песни по тому, насколько похоже они звучат. <strong>Обучение с подкреплением:</strong> модель учится методом проб и ошибок и получает «награды» за удачные ходы — так ИИ научился играть в го и во многие видеоигры.",
            "lessons.l2.s4.h": "Данные решают всё",
            "lessons.l2.s4.p": "Модель хороша настолько, насколько хороши её данные. Если примеров мало, они неаккуратные или однобокие, модель выучит не ту закономерность. Представь модель, которая учится узнавать волков, но на всех фото волков в её данных есть снег. Она может решить, что <em>снег</em> означает «волк», — и назвать волком хаски на снегу!",
            "lessons.l2.key1": "Модели машинного обучения находят закономерности в примерах (данных), а не следуют правилам, написанным вручную.",
            "lessons.l2.key2": "Обучение: угадать, измерить ошибку, подправить, повторить. Проверка: тест на новых, незнакомых данных.",
            "lessons.l2.key3": "Если данных мало или они однобокие, модель усвоит неправильный урок.",
            "lessons.l2.tip": "Побудь учителем! В ИИ-лаборатории можно дать классификатору свои примеры и посмотреть, как он учится.",
            "lessons.l2.tipBtn": "Открыть классификатор",
            "lessons.l2.q": "Зачем проверять модель на примерах, которых она никогда не видела?",
            "lessons.l2.a1": "Чтобы обучение шло быстрее",
            "lessons.l2.a2": "Потому что после обучения примеры удаляются",
            "lessons.l2.a3": "Чтобы убедиться, что она поняла закономерность, а не просто запомнила ответы",
            "lessons.l2.explain": "Модель, которая просто запомнила обучающие данные, ошибается на всём новом. Проверка на незнакомых данных показывает, усвоила ли она общую закономерность."
        }
    });

    // ---------- 5. Translations: lesson 3 — Neural Networks ----------
    A.addTranslations({
        en: {
            "lessons.l3.title": "Neural Networks",
            "lessons.l3.desc": "The brain-inspired idea behind modern AI, explained simply.",
            "lessons.l3.s1.h": "Inspired by the brain",
            "lessons.l3.s1.p": "Your brain has about <strong>86 billion neurons</strong> — cells that pass signals to each other. <strong>Artificial neural networks</strong> borrow this idea, very loosely: they're made of simple maths units, called artificial neurons, connected in layers. A neural network is far simpler than a real brain. The similarity is mostly in the name!",
            "lessons.l3.s2.h": "What one neuron does",
            "lessons.l3.s2.p": "An artificial neuron takes some numbers as <strong>inputs</strong>, multiplies each one by a <strong>weight</strong> (how important that input is), adds everything up together with a <strong>bias</strong>, and then passes the result through an <strong>activation function</strong> that decides how strongly the neuron “fires”. That's it — mostly just multiplying and adding! The power comes from connecting thousands, millions or even billions of them.",
            "lessons.l3.s3.h": "Layers upon layers",
            "lessons.l3.s3.p": "Neurons are arranged in layers. The <strong>input layer</strong> receives the data, for example the pixels of a photo. The <strong>hidden layers</strong> in the middle transform it step by step. The <strong>output layer</strong> gives the answer, such as “cat: 92%, dog: 8%”. In image recognition, early layers tend to detect simple things like edges, middle layers combine them into shapes, and later layers recognise whole objects. Networks with many layers are called <strong>deep neural networks</strong>, and training them is called <strong>deep learning</strong>.",
            "lessons.l3.s3.note": "Face unlock, voice assistants, translation apps and chatbots all run on deep neural networks.",
            "lessons.l3.s4.h": "How a network learns",
            "lessons.l3.s4.p": "At first, all the weights are random, so the answers are nonsense. During training, the network compares its answer with the correct one, and an algorithm called <strong>backpropagation</strong> works out how to nudge every weight to reduce the error. After millions of tiny nudges, the weights hold everything the network has learned. The biggest modern networks have billions of weights, also called <strong>parameters</strong>.",
            "lessons.l3.key1": "A neural network is made of many simple artificial neurons arranged in layers.",
            "lessons.l3.key2": "Each neuron multiplies its inputs by weights, adds them up and applies an activation function.",
            "lessons.l3.key3": "Learning means adjusting the weights, little by little, to make fewer mistakes.",
            "lessons.l3.tip": "The classifier in the AI Lab learns from examples you give it — a hands-on way to see what “training” means.",
            "lessons.l3.tipBtn": "Open the classifier",
            "lessons.l3.q": "What does a “weight” do in an artificial neuron?",
            "lessons.l3.a1": "It shows how important each input is",
            "lessons.l3.a2": "It measures how heavy the computer is",
            "lessons.l3.a3": "It stores the photo the network is looking at",
            "lessons.l3.explain": "Each input is multiplied by its weight. A big weight makes that input matter more, and a negative weight pushes the answer the other way. Training is all about finding good weights."
        },
        ru: {
            "lessons.l3.title": "Нейронные сети",
            "lessons.l3.desc": "Идея, вдохновлённая мозгом, на которой держится современный ИИ, — простыми словами.",
            "lessons.l3.s1.h": "Вдохновлено мозгом",
            "lessons.l3.s1.p": "В твоём мозге около <strong>86 миллиардов нейронов</strong> — клеток, которые передают друг другу сигналы. <strong>Искусственные нейронные сети</strong> заимствуют эту идею, но очень приблизительно: они состоят из простых математических блоков — искусственных нейронов, соединённых в слои. Нейросеть гораздо проще настоящего мозга. Сходство в основном в названии!",
            "lessons.l3.s2.h": "Что делает один нейрон",
            "lessons.l3.s2.p": "Искусственный нейрон получает несколько чисел — <strong>входы</strong>, умножает каждое на <strong>вес</strong> (насколько этот вход важен), складывает всё вместе со <strong>смещением</strong>, а затем пропускает результат через <strong>функцию активации</strong>, которая решает, насколько сильно нейрон «сработает». И всё — в основном это просто умножение и сложение! Вся сила в том, что таких нейронов соединяют тысячи, миллионы и даже миллиарды.",
            "lessons.l3.s3.h": "Слой за слоем",
            "lessons.l3.s3.p": "Нейроны расположены слоями. <strong>Входной слой</strong> получает данные, например пиксели фотографии. <strong>Скрытые слои</strong> посередине шаг за шагом их преобразуют. <strong>Выходной слой</strong> выдаёт ответ, например «кошка: 92%, собака: 8%». При распознавании изображений первые слои обычно находят простые вещи вроде границ и линий, средние собирают из них формы, а последние узнают целые объекты. Сети с большим количеством слоёв называют <strong>глубокими нейронными сетями</strong>, а их обучение — <strong>глубоким обучением</strong>.",
            "lessons.l3.s3.note": "Разблокировка по лицу, голосовые помощники, переводчики и чат-боты — всё это работает на глубоких нейронных сетях.",
            "lessons.l3.s4.h": "Как сеть учится",
            "lessons.l3.s4.p": "Сначала все веса случайные, поэтому ответы получаются бессмысленными. Во время обучения сеть сравнивает свой ответ с правильным, а алгоритм <strong>обратного распространения ошибки</strong> вычисляет, как подправить каждый вес, чтобы ошибка уменьшилась. После миллионов крошечных поправок в весах оказывается всё, чему научилась сеть. У самых больших современных сетей миллиарды весов — их ещё называют <strong>параметрами</strong>.",
            "lessons.l3.key1": "Нейронная сеть состоит из множества простых искусственных нейронов, расположенных слоями.",
            "lessons.l3.key2": "Каждый нейрон умножает входы на веса, складывает их и применяет функцию активации.",
            "lessons.l3.key3": "Учиться — значит понемногу подстраивать веса, чтобы ошибаться всё реже.",
            "lessons.l3.tip": "Классификатор в ИИ-лаборатории учится на твоих примерах — так можно своими руками увидеть, что такое «обучение».",
            "lessons.l3.tipBtn": "Открыть классификатор",
            "lessons.l3.q": "Что делает «вес» в искусственном нейроне?",
            "lessons.l3.a1": "Показывает, насколько важен каждый вход",
            "lessons.l3.a2": "Измеряет, сколько весит компьютер",
            "lessons.l3.a3": "Хранит фотографию, на которую смотрит сеть",
            "lessons.l3.explain": "Каждый вход умножается на свой вес. Большой вес делает вход важнее, а отрицательный тянет ответ в другую сторону. Обучение — это и есть поиск хороших весов."
        }
    });

    // ---------- 6. Translations: lesson 4 — Generative AI & Chatbots ----------
    A.addTranslations({
        en: {
            "lessons.l4.title": "Generative AI & Chatbots",
            "lessons.l4.desc": "How chatbots and image generators create brand-new content.",
            "lessons.l4.s1.h": "AI that creates",
            "lessons.l4.s1.p": "Most of the AI we've met so far <em>sorts</em> or <em>predicts</em>: spam or not spam, cat or dog. <strong>Generative AI</strong> <em>creates</em> new content — text, images, music, code and even video. Chatbots such as ChatGPT, Gemini or Claude, and image generators that turn a sentence into a picture, are all generative AI.",
            "lessons.l4.s2.h": "Predicting the next word",
            "lessons.l4.s2.p": "Chatbots run on <strong>large language models (LLMs)</strong>. An LLM was trained on a huge amount of text to do one thing extremely well: <strong>predict what comes next</strong>. Text is split into small pieces called <strong>tokens</strong> — whole words or parts of words. Given “The cat sat on the…”, the model calculates a probability for every possible next token, picks one, adds it to the text and repeats — token by token, very fast. Extra training with feedback from people then teaches it to follow instructions and be helpful.",
            "lessons.l4.s3.h": "Why chatbots make things up",
            "lessons.l4.s3.p": "An LLM doesn't look facts up in a database (unless it's connected to a search tool). It produces text that <em>sounds</em> likely. Usually that text is right, but sometimes the model confidently invents facts, quotes or sources that don't exist. This is called a <strong>hallucination</strong>. That's why you should always double-check important information — especially for schoolwork.",
            "lessons.l4.s3.note": "Ask a chatbot for book sources, and it may give you a perfect-looking title and author for a book that was never written.",
            "lessons.l4.s4.h": "Using it wisely",
            "lessons.l4.s4.p": "Generative AI is great for brainstorming ideas, explaining a hard topic in a new way, practising a language or getting feedback on your writing. It's a bad idea to copy its answers into homework (you don't learn, and it's often against school rules), to trust facts without checking, or to share personal information. Tip: a clear prompt gets better answers — say what you need, give some context and name the format you want.",
            "lessons.l4.key1": "Generative AI creates new text, images, sound, code and video.",
            "lessons.l4.key2": "Chatbots are built on LLMs that predict the next token, again and again.",
            "lessons.l4.key3": "They can “hallucinate”, so always check important facts.",
            "lessons.l4.tip": "Prediction is at the heart of generative AI. Try the predictor in the AI Lab and see how a model makes its guesses.",
            "lessons.l4.tipBtn": "Open the predictor",
            "lessons.l4.q": "Why can a chatbot confidently say something false?",
            "lessons.l4.a1": "It gets tired after answering lots of questions",
            "lessons.l4.a2": "Someone secretly types wrong answers into it",
            "lessons.l4.a3": "It generates likely-sounding text and doesn't automatically check facts",
            "lessons.l4.explain": "An LLM predicts which words are likely to come next. Likely-sounding isn't the same as true, so it can “hallucinate” facts. Always check important information."
        },
        ru: {
            "lessons.l4.title": "Генеративный ИИ и чат-боты",
            "lessons.l4.desc": "Как чат-боты и генераторы картинок создают совершенно новый контент.",
            "lessons.l4.s1.h": "ИИ, который создаёт",
            "lessons.l4.s1.p": "Большая часть ИИ, о котором мы говорили, <em>сортирует</em> или <em>предсказывает</em>: спам или не спам, кошка или собака. <strong>Генеративный ИИ</strong> <em>создаёт</em> новое — тексты, изображения, музыку, код и даже видео. Чат-боты вроде ChatGPT, Gemini или Claude и генераторы, превращающие фразу в картинку, — всё это генеративный ИИ.",
            "lessons.l4.s2.h": "Угадать следующее слово",
            "lessons.l4.s2.p": "Чат-боты работают на <strong>больших языковых моделях (LLM)</strong>. LLM обучили на огромном количестве текстов делать одну вещь очень хорошо: <strong>предсказывать, что будет дальше</strong>. Текст разбивается на маленькие кусочки — <strong>токены</strong>: целые слова или их части. Получив «Кот сел на…», модель вычисляет вероятность каждого возможного следующего токена, выбирает один, добавляет его к тексту и повторяет — токен за токеном, очень быстро. Затем дополнительное обучение с оценками от людей учит модель выполнять инструкции и быть полезной.",
            "lessons.l4.s3.h": "Почему чат-боты выдумывают",
            "lessons.l4.s3.p": "LLM не ищет факты в базе данных (если только её не подключили к поиску). Она создаёт текст, который <em>звучит</em> правдоподобно. Обычно он верный, но иногда модель уверенно выдумывает факты, цитаты или источники, которых не существует. Это называется <strong>галлюцинацией</strong>. Поэтому важную информацию всегда нужно перепроверять — особенно для учёбы.",
            "lessons.l4.s3.note": "Попроси чат-бота назвать книги-источники — и он может выдать идеальное на вид название и автора книги, которую никто никогда не писал.",
            "lessons.l4.s4.h": "Как пользоваться с умом",
            "lessons.l4.s4.p": "Генеративный ИИ отлично помогает придумывать идеи, объяснять сложную тему по-новому, тренировать иностранный язык или получать отзыв на свой текст. А вот плохая идея — копировать его ответы в домашку (ты ничему не научишься, и часто это против школьных правил), верить фактам без проверки или делиться личной информацией. Совет: чем понятнее запрос (промпт), тем лучше ответ — скажи, что тебе нужно, дай немного контекста и укажи нужный формат.",
            "lessons.l4.key1": "Генеративный ИИ создаёт новые тексты, изображения, звук, код и видео.",
            "lessons.l4.key2": "Чат-боты работают на LLM, которые снова и снова предсказывают следующий токен.",
            "lessons.l4.key3": "Они могут «галлюцинировать», поэтому важные факты всегда проверяй.",
            "lessons.l4.tip": "Предсказание — сердце генеративного ИИ. Попробуй предсказатель в ИИ-лаборатории и посмотри, как модель делает свои догадки.",
            "lessons.l4.tipBtn": "Открыть предсказатель",
            "lessons.l4.q": "Почему чат-бот может уверенно сказать неправду?",
            "lessons.l4.a1": "Он устаёт, ответив на много вопросов",
            "lessons.l4.a2": "Кто-то тайно вписывает в него неверные ответы",
            "lessons.l4.a3": "Он создаёт правдоподобный текст и не проверяет факты автоматически",
            "lessons.l4.explain": "LLM предсказывает, какие слова вероятнее всего будут дальше. Правдоподобно — не значит правдиво, поэтому модель может «галлюцинировать». Важную информацию всегда проверяй."
        }
    });

    // ---------- 7. Translations: lesson 5 — AI in Everyday Life ----------
    A.addTranslations({
        en: {
            "lessons.l5.title": "AI in Everyday Life",
            "lessons.l5.desc": "The hidden AI you use every day — probably without noticing.",
            "lessons.l5.s1.h": "AI in your pocket",
            "lessons.l5.s1.p": "Your smartphone is packed with AI: <strong>face unlock</strong>, the keyboard that <strong>predicts your next word</strong>, <strong>voice assistants</strong> like Siri, Gemini or Alexa, and a camera that blurs the background or brightens night photos automatically. Many of these run right on your phone, without even needing the Internet.",
            "lessons.l5.s1.note": "Many phones have a special chip just for AI, often called a neural processing unit (NPU). It runs AI tasks quickly without draining the battery.",
            "lessons.l5.s2.h": "What you watch and hear",
            "lessons.l5.s2.p": "YouTube, TikTok, Netflix and Spotify all use <strong>recommendation systems</strong>. They learn from what you watch, like, skip and replay, and compare you with millions of other users to guess what you'll enjoy next. That's why your feed feels made just for you — because, in a way, it is.",
            "lessons.l5.s3.h": "AI around the world",
            "lessons.l5.s3.p": "<strong>Maps</strong> predict traffic and find the fastest route. <strong>Banks</strong> use AI to spot unusual payments that might be fraud. <strong>Doctors</strong> use AI tools to help find signs of disease in X-rays and scans. <strong>Translators</strong> help people talk across languages, and some <strong>cars</strong> can stay in their lane and brake automatically. Scientists even used AI (AlphaFold) to predict the 3D shapes of proteins — work that won the Nobel Prize in Chemistry in 2024.",
            "lessons.l5.s4.h": "The other side of the feed",
            "lessons.l5.s4.p": "Recommendation systems are designed to keep you watching for as long as possible. They can also create a <strong>filter bubble</strong>, where you mostly see things that match what you already like or believe. Knowing that an algorithm chooses your feed puts you back in control: search for new topics, follow different voices, and take breaks when scrolling stops being fun.",
            "lessons.l5.key1": "You already use AI daily: face unlock, predictive text, maps, recommendations, spam filters.",
            "lessons.l5.key2": "Recommendation systems learn from your behaviour to keep you interested.",
            "lessons.l5.key3": "Knowing how feeds work helps you escape filter bubbles and stay in control.",
            "lessons.l5.tip": "Algorithm, training data, neural network… Look up the key words behind everyday AI in the glossary.",
            "lessons.l5.tipBtn": "Open the glossary",
            "lessons.l5.q": "Why does your video feed seem to know what you like?",
            "lessons.l5.a1": "A person at the company picks every video for you by hand",
            "lessons.l5.a2": "A recommendation system learns from what you watch, like and skip",
            "lessons.l5.a3": "It's completely random — you just get lucky",
            "lessons.l5.explain": "Recommendation systems find patterns in your behaviour and in the behaviour of similar users, then predict what will keep you watching."
        },
        ru: {
            "lessons.l5.title": "ИИ в повседневной жизни",
            "lessons.l5.desc": "Скрытый ИИ, которым ты пользуешься каждый день, — скорее всего, даже не замечая.",
            "lessons.l5.s1.h": "ИИ в твоём кармане",
            "lessons.l5.s1.p": "Твой смартфон полон ИИ: <strong>разблокировка по лицу</strong>, клавиатура, которая <strong>подсказывает следующее слово</strong>, <strong>голосовые помощники</strong> вроде Siri, Алисы или Gemini и камера, которая сама размывает фон и осветляет ночные снимки. Многое из этого работает прямо на телефоне, даже без интернета.",
            "lessons.l5.s1.note": "Во многих телефонах есть специальный чип для ИИ — его часто называют нейропроцессором (NPU). Он быстро выполняет задачи ИИ и бережёт заряд батареи.",
            "lessons.l5.s2.h": "Что ты смотришь и слушаешь",
            "lessons.l5.s2.p": "YouTube, TikTok, Netflix и Spotify используют <strong>рекомендательные системы</strong>. Они учатся на том, что ты смотришь, лайкаешь, пропускаешь и пересматриваешь, и сравнивают тебя с миллионами других пользователей, чтобы угадать, что тебе понравится дальше. Поэтому лента кажется созданной специально для тебя — и в каком-то смысле так и есть.",
            "lessons.l5.s3.h": "ИИ вокруг нас",
            "lessons.l5.s3.p": "<strong>Карты</strong> предсказывают пробки и находят самый быстрый маршрут. <strong>Банки</strong> с помощью ИИ замечают подозрительные платежи, которые могут оказаться мошенничеством. <strong>Врачи</strong> используют ИИ, чтобы находить признаки болезней на рентгеновских снимках и томограммах. <strong>Переводчики</strong> помогают людям общаться на разных языках, а некоторые <strong>автомобили</strong> умеют держаться в полосе и тормозить сами. Учёные даже использовали ИИ (AlphaFold), чтобы предсказывать трёхмерную форму белков, — эта работа получила Нобелевскую премию по химии в 2024 году.",
            "lessons.l5.s4.h": "Обратная сторона ленты",
            "lessons.l5.s4.p": "Рекомендательные системы созданы, чтобы удерживать твоё внимание как можно дольше. Они также могут создать <strong>информационный пузырь</strong> — когда ты видишь в основном то, что совпадает с твоими вкусами и взглядами. Понимая, что ленту выбирает алгоритм, ты возвращаешь себе контроль: ищи новые темы, подписывайся на разных людей и делай перерывы, когда листать уже не весело.",
            "lessons.l5.key1": "Ты уже каждый день пользуешься ИИ: разблокировка по лицу, подсказки клавиатуры, карты, рекомендации, спам-фильтры.",
            "lessons.l5.key2": "Рекомендательные системы учатся на твоём поведении, чтобы удерживать твоё внимание.",
            "lessons.l5.key3": "Понимая, как устроены ленты, легче выбраться из информационного пузыря и сохранить контроль.",
            "lessons.l5.tip": "Алгоритм, обучающие данные, нейросеть… Найди ключевые слова повседневного ИИ в словаре.",
            "lessons.l5.tipBtn": "Открыть словарь",
            "lessons.l5.q": "Почему лента видео будто знает, что тебе нравится?",
            "lessons.l5.a1": "Сотрудник компании вручную подбирает для тебя каждое видео",
            "lessons.l5.a2": "Рекомендательная система учится на том, что ты смотришь, лайкаешь и пропускаешь",
            "lessons.l5.a3": "Всё совершенно случайно — тебе просто везёт",
            "lessons.l5.explain": "Рекомендательные системы находят закономерности в твоём поведении и в поведении похожих пользователей, а затем предсказывают, что удержит тебя у экрана."
        }
    });

    // ---------- 8. Translations: lesson 6 — AI Ethics & Safety ----------
    A.addTranslations({
        en: {
            "lessons.l6.title": "AI Ethics & Safety",
            "lessons.l6.desc": "Bias, deepfakes and privacy — and how to use AI responsibly.",
            "lessons.l6.s1.h": "When AI is unfair",
            "lessons.l6.s1.p": "AI learns from data created by people, so it can also learn people's unfairness. This is called <strong>bias</strong>. In 2018, news reports revealed that Amazon had dropped an experimental hiring tool because it was biased against women: it had learned from ten years of CVs that mostly came from men. Researchers have also found that some face-recognition systems make far more mistakes with darker-skinned women than with lighter-skinned men. Fixing bias needs diverse data, careful testing and people checking the results.",
            "lessons.l6.s2.h": "Deepfakes and misinformation",
            "lessons.l6.s2.p": "Generative AI can create realistic fake photos, videos and voices, called <strong>deepfakes</strong>. They can be fun in films and memes, but they're also used to spread lies and to scam people — for example, by faking a relative's voice on the phone to ask for money. Before you share something shocking, stop and check: <strong>Who posted it? Do trusted news sources report it?</strong> Fakes keep getting better, so checking the source matters more than looking for glitches.",
            "lessons.l6.s2.note": "Scammers can copy a voice from just a few seconds of audio. Agree on a secret family code word to use in emergencies.",
            "lessons.l6.s3.h": "Protect your privacy",
            "lessons.l6.s3.p": "AI systems learn from huge amounts of data, including things people post online. What you type into an AI tool may be stored and even used to train future models. Never share passwords, your home address, private photos or secrets with a chatbot, and check the privacy settings of the apps you use.",
            "lessons.l6.s4.h": "Humans stay in charge",
            "lessons.l6.s4.p": "When AI makes a mistake, the people who build and use it are responsible. That's why important decisions — in medicine, in courts or in hiring — should always be checked by a human. Governments are making rules too: the European Union's <strong>AI Act</strong>, adopted in 2024, is one of the world's first big laws on AI. And you have a role: use AI honestly, say when it helped you with schoolwork, and keep thinking for yourself.",
            "lessons.l6.key1": "AI can copy unfairness (bias) from the data it learns from.",
            "lessons.l6.key2": "Deepfakes are getting realistic: check the source before you share.",
            "lessons.l6.key3": "Protect your privacy, and keep humans responsible for important decisions.",
            "lessons.l6.tip": "Time to test yourself! Take the AI Challenge and see how much you already know.",
            "lessons.l6.tipBtn": "Take the quiz",
            "lessons.l6.q": "Why can an AI system be unfair (biased)?",
            "lessons.l6.a1": "It learned from data that contained human unfairness or was one-sided",
            "lessons.l6.a2": "Computers have their own opinions about people",
            "lessons.l6.a3": "AI is always programmed to be unfair on purpose",
            "lessons.l6.explain": "AI copies patterns from its training data — including unfair ones. Diverse data, testing and human checks help reduce bias."
        },
        ru: {
            "lessons.l6.title": "Этика и безопасность ИИ",
            "lessons.l6.desc": "Предвзятость, дипфейки и приватность — и как пользоваться ИИ ответственно.",
            "lessons.l6.s1.h": "Когда ИИ несправедлив",
            "lessons.l6.s1.p": "ИИ учится на данных, созданных людьми, поэтому может перенять и человеческую несправедливость. Это называется <strong>предвзятостью</strong>. В 2018 году журналисты рассказали, что Amazon отказалась от экспериментальной системы подбора сотрудников, потому что та была предвзята к женщинам: она училась на резюме за десять лет, и почти все они были от мужчин. Исследователи также выяснили, что некоторые системы распознавания лиц гораздо чаще ошибаются с темнокожими женщинами, чем со светлокожими мужчинами. Чтобы бороться с предвзятостью, нужны разнообразные данные, тщательная проверка и люди, которые контролируют результаты.",
            "lessons.l6.s2.h": "Дипфейки и дезинформация",
            "lessons.l6.s2.p": "Генеративный ИИ умеет создавать реалистичные поддельные фото, видео и голоса — <strong>дипфейки</strong>. Они бывают забавными в фильмах и мемах, но их используют и для распространения лжи и мошенничества — например, подделывают голос родственника по телефону, чтобы попросить денег. Прежде чем делиться чем-то шокирующим, остановись и проверь: <strong>кто это опубликовал? Пишут ли об этом надёжные СМИ?</strong> Подделки становятся всё лучше, поэтому проверка источника важнее, чем поиск «глюков» на картинке.",
            "lessons.l6.s2.note": "Мошенникам бывает достаточно нескольких секунд записи, чтобы скопировать голос. Договорись с семьёй о секретном кодовом слове на экстренный случай.",
            "lessons.l6.s3.h": "Береги свою приватность",
            "lessons.l6.s3.p": "Системы ИИ учатся на огромных объёмах данных, включая то, что люди публикуют в интернете. Всё, что ты пишешь ИИ-сервису, может сохраняться и даже использоваться для обучения будущих моделей. Никогда не сообщай чат-боту пароли, домашний адрес, личные фото или секреты и проверяй настройки приватности в приложениях.",
            "lessons.l6.s4.h": "Решают люди",
            "lessons.l6.s4.p": "Когда ИИ ошибается, отвечают люди, которые его создают и используют. Поэтому важные решения — в медицине, в суде или при приёме на работу — всегда должен проверять человек. Государства тоже вводят правила: <strong>Закон об ИИ</strong> Европейского союза (AI Act), принятый в 2024 году, — один из первых в мире больших законов об ИИ. А у тебя своя роль: используй ИИ честно, говори, когда он помогал тебе с учёбой, и продолжай думать своей головой.",
            "lessons.l6.key1": "ИИ может перенять несправедливость (предвзятость) из данных, на которых учится.",
            "lessons.l6.key2": "Дипфейки становятся всё реалистичнее: проверяй источник, прежде чем делиться.",
            "lessons.l6.key3": "Береги свою приватность, а ответственность за важные решения оставляй людям.",
            "lessons.l6.tip": "Пора проверить себя! Пройди ИИ-испытание и посмотри, сколько ты уже знаешь.",
            "lessons.l6.tipBtn": "Пройти тест",
            "lessons.l6.q": "Почему система ИИ может быть несправедливой (предвзятой)?",
            "lessons.l6.a1": "Она училась на данных, в которых была человеческая несправедливость или однобокость",
            "lessons.l6.a2": "У компьютеров есть своё мнение о людях",
            "lessons.l6.a3": "ИИ всегда специально программируют быть несправедливым",
            "lessons.l6.explain": "ИИ копирует закономерности из обучающих данных — в том числе несправедливые. Разнообразные данные, проверки и контроль людей помогают уменьшить предвзятость."
        }
    });

    // ---------- 9. Translations: the six mini-labs ----------
    A.addTranslations({
        en: {
            // Mini-lab 1: AI or not AI?
            "lessons.w1.title": "AI or not AI?",
            "lessons.w1.intro": "Decide for each one: does it use AI, or does it just follow fixed rules?",
            "lessons.w1.ai": "AI",
            "lessons.w1.not": "Not AI",
            "lessons.w1.i1": "🧮 A calculator adds 245\u00a0+\u00a078",
            "lessons.w1.i2": "🔓 Your phone unlocks when it sees your face",
            "lessons.w1.i3": "📬 Junk mail disappears from your inbox by itself",
            "lessons.w1.i4": "⏲️ A microwave stops after exactly 2 minutes",
            "lessons.w1.i5": "🎵 A music app suggests songs you might like",
            "lessons.w1.e1": "Not AI. It follows exact rules that a programmer wrote. Nothing is learned.",
            "lessons.w1.e2": "AI! A neural network learned to recognise faces and checks that it's really you.",
            "lessons.w1.e3": "AI! Spam filters learn from millions of emails that people marked as spam.",
            "lessons.w1.e4": "Not AI. It's a simple timer counting down — no patterns, no learning.",
            "lessons.w1.e5": "AI! A recommendation system finds patterns in what you and similar listeners play.",
            "lessons.w1.right": "Right!",
            "lessons.w1.wrong": "Not quite.",
            "lessons.w1.score": "Score: {score} of {total}",
            "lessons.w1.perfect": "Perfect! You can spot AI anywhere. 🕵️",
            "lessons.w1.good": "Nice try! Read the explanations, then try again.",
            "lessons.w1.reset": "Try again",

            // Mini-lab 2: watch a model learn
            "lessons.w2.title": "Watch a model learn",
            "lessons.w2.intro": "The dots are examples: hours of study and test scores. The model is a straight line. Each training step nudges the line to make the error smaller.",
            "lessons.w2.hours": "Hours of study",
            "lessons.w2.score": "Test score",
            "lessons.w2.chart": "Chart of test scores against hours of study, with the model's line and its errors.",
            "lessons.w2.lossChart": "Chart showing how the average error changes with each training step.",
            "lessons.w2.lossTitle": "Error over time",
            "lessons.w2.data": "Examples",
            "lessons.w2.model": "Model",
            "lessons.w2.residual": "Error",
            "lessons.w2.step": "Train 1 step",
            "lessons.w2.auto": "Auto-train",
            "lessons.w2.pause": "Pause",
            "lessons.w2.reset": "Reset",
            "lessons.w2.steps": "Step {n}",
            "lessons.w2.error": "Average error: {e} points",
            "lessons.w2.predict.one": "Prediction for 10 hours: {n} point",
            "lessons.w2.predict.many": "Prediction for 10 hours: {n} points",
            "lessons.w2.start": "The line starts in the wrong place. Press “Train 1 step” or “Auto-train”.",
            "lessons.w2.learning": "Each step moves the line a little closer to the dots. Watch the error go down!",
            "lessons.w2.done": "The error has stopped shrinking — the model has learned the trend! 🎯",
            "lessons.w2.fake": "Pretend data, made up for this demo.",

            // Mini-lab 3: play with a neuron
            "lessons.w3.title": "Play with a neuron",
            "lessons.w3.intro": "This neuron decides: “Should I go to the park?” Move the sliders and watch the maths.",
            "lessons.w3.inputs": "Inputs (0 to 1)",
            "lessons.w3.params": "Weights and bias",
            "lessons.w3.x1": "☀️ How sunny is it?",
            "lessons.w3.x2": "📚 How much homework is done?",
            "lessons.w3.w1": "Weight: sunshine",
            "lessons.w3.w2": "Weight: homework",
            "lessons.w3.b": "Bias: general mood",
            "lessons.w3.output": "Output",
            "lessons.w3.yes": "Go to the park! 🌳",
            "lessons.w3.no": "Stay home today 🏠",
            "lessons.w3.decision": "The neuron's decision: {answer}",
            "lessons.w3.diagram": "Diagram: two inputs connected to one neuron. The thicker the line, the bigger the weight.",
            "lessons.w3.explain": "The activation function (here, a sigmoid) squeezes any number into a value between 0 and 1. Above 50%, the neuron says “yes”.",
            "lessons.w3.try": "Try this: make the homework weight negative. What happens to the decision?",
            "lessons.w3.reset": "Reset",

            // Mini-lab 4: be the language model
            "lessons.w4.title": "Be the language model",
            "lessons.w4.intro": "A language model gives every possible next word a probability, then picks one. The “temperature” setting controls how adventurous that pick is.",
            "lessons.w4.prompt": "After school, I like to",
            "lessons.w4.word1": "play",
            "lessons.w4.word2": "read",
            "lessons.w4.word3": "sleep",
            "lessons.w4.word4": "draw",
            "lessons.w4.word5": "dance",
            "lessons.w4.word6": "code",
            "lessons.w4.probs": "Next-word probabilities",
            "lessons.w4.temp": "🌡️ Temperature",
            "lessons.w4.low": "predictable",
            "lessons.w4.high": "creative",
            "lessons.w4.tempLow": "Low temperature: the model almost always picks the most likely word.",
            "lessons.w4.tempMid": "Medium temperature: usually a likely word, with a bit of variety.",
            "lessons.w4.tempHigh": "High temperature: surprising words win more often — more creative, but also more nonsense.",
            "lessons.w4.generate": "Generate next word",
            "lessons.w4.clear": "Clear",
            "lessons.w4.history": "Picks so far",
            "lessons.w4.empty": "Press the button to let the model pick a word.",
            "lessons.w4.picked": "The model picked “{word}” (chance: {p}).",
            "lessons.w4.note": "The numbers are made up for this demo, but real chatbots work the same way — with tens or even hundreds of thousands of possible tokens.",

            // Mini-lab 5: spot the hidden AI
            "lessons.w5.title": "Spot the hidden AI",
            "lessons.w5.intro": "Here's an ordinary day. Tap each moment to reveal the AI hiding inside it.",
            "lessons.w5.m1": "Unlock your phone with your face",
            "lessons.w5.m2": "Check when the bus will arrive",
            "lessons.w5.m3": "Text a friend",
            "lessons.w5.m4": "Check your email",
            "lessons.w5.m5": "Take a photo of the sunset",
            "lessons.w5.m6": "Watch a few videos",
            "lessons.w5.a1": "Face recognition: a neural network checks that the face in front of the camera matches yours.",
            "lessons.w5.a2": "Arrival-time prediction: map apps learn from traffic data sent by many phones and vehicles.",
            "lessons.w5.a3": "Predictive text and autocorrect: a language model guesses your next word.",
            "lessons.w5.a4": "Spam filter: a model trained on millions of emails hides scams and junk.",
            "lessons.w5.a5": "Computational photography: AI combines several shots and balances light and colour.",
            "lessons.w5.a6": "Recommendation system: it predicts which video will keep you watching.",
            "lessons.w5.hint": "Tap to reveal",
            "lessons.w5.aiLabel": "Hidden AI:",
            "lessons.w5.found": "Found: {n} of {total}",
            "lessons.w5.all": "All found! AI is everywhere — now you know where to look. 👀",
            "lessons.w5.reset": "Start over",

            // Mini-lab 6: what would you do?
            "lessons.w6.title": "What would you do?",
            "lessons.w6.intro": "Three real-life situations. Pick what you'd do, and find out why it matters.",
            "lessons.w6.situation": "Situation {n}",
            "lessons.w6.s1": "📹 A video shows a famous person saying something shocking. It already has 2 million views.",
            "lessons.w6.s1o1": "Share it right away — everyone's talking about it",
            "lessons.w6.s1o2": "Check whether trusted news sources report it",
            "lessons.w6.s1o3": "Comment “FAKE!!!” without checking",
            "lessons.w6.s1f1": "Popular doesn't mean true. Deepfakes spread fast because people share before checking.",
            "lessons.w6.s1f2": "Checking the source is the best defence against deepfakes and fake news.",
            "lessons.w6.s1f3": "Calling something fake without checking can spread misinformation too. Check first.",
            "lessons.w6.s2": "📝 A chatbot gives you a perfect quote for your history essay — and even names the book it's from.",
            "lessons.w6.s2o1": "Paste it in — chatbots know everything",
            "lessons.w6.s2o2": "Find the book or source to check that the quote is real",
            "lessons.w6.s2o3": "Change a few words so nobody notices",
            "lessons.w6.s2f1": "Chatbots can make up quotes and even whole books. Never use them as a source without checking.",
            "lessons.w6.s2f2": "Real sources can be found. If you can't find the original, don't use the quote.",
            "lessons.w6.s2f3": "Rewording doesn't make it true, and passing off AI text as your own is often against school rules.",
            "lessons.w6.s3": "🤳 A fun AI app wants your full name, your school and 20 selfies to turn you into a cartoon.",
            "lessons.w6.s3o1": "Upload everything — it's just for fun",
            "lessons.w6.s3o2": "Upload a friend's photos instead",
            "lessons.w6.s3o3": "Read what the app does with your data, and share as little as possible",
            "lessons.w6.s3f1": "Your face and personal details are valuable data. Once uploaded, you may never get them back.",
            "lessons.w6.s3f2": "Never upload someone else's photos without their permission — that's their privacy.",
            "lessons.w6.s3f3": "Check the privacy policy and reviews, and never share more than the app really needs.",
            "lessons.w6.best": "Smart choice!",
            "lessons.w6.notBest": "Think again.",
            "lessons.w6.better": "A better choice:",
            "lessons.w6.score": "Responsible choices: {n} of {total}",
            "lessons.w6.reset": "Start over"
        },
        ru: {
            // Мини-лаборатория 1: ИИ или не ИИ?
            "lessons.w1.title": "ИИ или не ИИ?",
            "lessons.w1.intro": "Реши для каждого примера: здесь работает ИИ или просто фиксированные правила?",
            "lessons.w1.ai": "ИИ",
            "lessons.w1.not": "Не ИИ",
            "lessons.w1.i1": "🧮 Калькулятор складывает 245\u00a0+\u00a078",
            "lessons.w1.i2": "🔓 Телефон разблокируется, когда видит твоё лицо",
            "lessons.w1.i3": "📬 Спам сам исчезает из входящих",
            "lessons.w1.i4": "⏲️ Микроволновка выключается ровно через 2 минуты",
            "lessons.w1.i5": "🎵 Музыкальное приложение советует песни, которые тебе понравятся",
            "lessons.w1.e1": "Не ИИ. Он выполняет точные правила, которые написал программист. Ничему не учится.",
            "lessons.w1.e2": "ИИ! Нейросеть научилась распознавать лица и проверяет, действительно ли это ты.",
            "lessons.w1.e3": "ИИ! Спам-фильтры учатся на миллионах писем, которые люди отметили как спам.",
            "lessons.w1.e4": "Не ИИ. Это простой таймер с обратным отсчётом — никаких закономерностей и обучения.",
            "lessons.w1.e5": "ИИ! Рекомендательная система находит закономерности в том, что слушаешь ты и люди с похожими вкусами.",
            "lessons.w1.right": "Верно!",
            "lessons.w1.wrong": "Не совсем.",
            "lessons.w1.score": "Верно: {score} из {total}",
            "lessons.w1.perfect": "Идеально! Теперь ты узнаешь ИИ где угодно. 🕵️",
            "lessons.w1.good": "Неплохо! Прочитай объяснения и попробуй ещё раз.",
            "lessons.w1.reset": "Пройти заново",

            // Мини-лаборатория 2: как учится модель
            "lessons.w2.title": "Посмотри, как учится модель",
            "lessons.w2.intro": "Точки — это примеры: часы подготовки и баллы за тест. Модель — прямая линия. Каждый шаг обучения чуть-чуть сдвигает линию, чтобы ошибка стала меньше.",
            "lessons.w2.hours": "Часы подготовки",
            "lessons.w2.score": "Баллы за тест",
            "lessons.w2.chart": "График баллов за тест в зависимости от часов подготовки, с линией модели и её ошибками.",
            "lessons.w2.lossChart": "График: как меняется средняя ошибка с каждым шагом обучения.",
            "lessons.w2.lossTitle": "Ошибка по шагам",
            "lessons.w2.data": "Примеры",
            "lessons.w2.model": "Модель",
            "lessons.w2.residual": "Ошибка",
            "lessons.w2.step": "1 шаг обучения",
            "lessons.w2.auto": "Автообучение",
            "lessons.w2.pause": "Пауза",
            "lessons.w2.reset": "Сбросить",
            "lessons.w2.steps": "Шаг {n}",
            "lessons.w2.error": "Средняя ошибка: {e} балла",
            "lessons.w2.predict.one": "Прогноз для 10 часов: {n} балл",
            "lessons.w2.predict.few": "Прогноз для 10 часов: {n} балла",
            "lessons.w2.predict.many": "Прогноз для 10 часов: {n} баллов",
            "lessons.w2.start": "Сначала линия стоит не на месте. Нажми «1 шаг обучения» или «Автообучение».",
            "lessons.w2.learning": "Каждый шаг немного приближает линию к точкам. Следи, как падает ошибка!",
            "lessons.w2.done": "Ошибка перестала уменьшаться — модель уловила закономерность! 🎯",
            "lessons.w2.fake": "Данные придуманы для этой демонстрации.",

            // Мини-лаборатория 3: поиграй с нейроном
            "lessons.w3.title": "Поиграй с нейроном",
            "lessons.w3.intro": "Этот нейрон решает: «Пойти ли в парк?» Двигай ползунки и следи за вычислениями.",
            "lessons.w3.inputs": "Входы (от 0 до 1)",
            "lessons.w3.params": "Веса и смещение",
            "lessons.w3.x1": "☀️ Насколько солнечно?",
            "lessons.w3.x2": "📚 Сколько домашки сделано?",
            "lessons.w3.w1": "Вес: солнце",
            "lessons.w3.w2": "Вес: домашка",
            "lessons.w3.b": "Смещение: настроение",
            "lessons.w3.output": "Выход",
            "lessons.w3.yes": "Идём в парк! 🌳",
            "lessons.w3.no": "Сегодня лучше дома 🏠",
            "lessons.w3.decision": "Решение нейрона: {answer}",
            "lessons.w3.diagram": "Схема: два входа соединены с одним нейроном. Чем толще линия, тем больше вес.",
            "lessons.w3.explain": "Функция активации (здесь — сигмоида) превращает любое число в значение от 0 до 1. Если больше 50%, нейрон говорит «да».",
            "lessons.w3.try": "Попробуй: сделай вес домашки отрицательным. Как изменится решение?",
            "lessons.w3.reset": "Сбросить",

            // Мини-лаборатория 4: побудь языковой моделью
            "lessons.w4.title": "Побудь языковой моделью",
            "lessons.w4.intro": "Языковая модель даёт каждому возможному следующему слову вероятность, а потом выбирает одно. «Температура» определяет, насколько смелым будет этот выбор.",
            "lessons.w4.prompt": "После школы я люблю",
            "lessons.w4.word1": "играть",
            "lessons.w4.word2": "читать",
            "lessons.w4.word3": "спать",
            "lessons.w4.word4": "рисовать",
            "lessons.w4.word5": "танцевать",
            "lessons.w4.word6": "программировать",
            "lessons.w4.probs": "Вероятности следующего слова",
            "lessons.w4.temp": "🌡️ Температура",
            "lessons.w4.low": "предсказуемо",
            "lessons.w4.high": "креативно",
            "lessons.w4.tempLow": "Низкая температура: модель почти всегда выбирает самое вероятное слово.",
            "lessons.w4.tempMid": "Средняя температура: обычно вероятное слово, но с небольшим разнообразием.",
            "lessons.w4.tempHigh": "Высокая температура: неожиданные слова побеждают чаще — креативнее, но и бессмыслицы больше.",
            "lessons.w4.generate": "Сгенерировать слово",
            "lessons.w4.clear": "Очистить",
            "lessons.w4.history": "Выбор модели",
            "lessons.w4.empty": "Нажми кнопку, чтобы модель выбрала слово.",
            "lessons.w4.picked": "Модель выбрала «{word}» (вероятность: {p}).",
            "lessons.w4.note": "Числа придуманы для демонстрации, но настоящие чат-боты работают так же — только вариантов (токенов) у них десятки и даже сотни тысяч.",

            // Мини-лаборатория 5: найди скрытый ИИ
            "lessons.w5.title": "Найди скрытый ИИ",
            "lessons.w5.intro": "Вот самый обычный день. Нажимай на каждый момент, чтобы найти спрятанный в нём ИИ.",
            "lessons.w5.m1": "Разблокировать телефон по лицу",
            "lessons.w5.m2": "Узнать, когда придёт автобус",
            "lessons.w5.m3": "Написать другу",
            "lessons.w5.m4": "Проверить почту",
            "lessons.w5.m5": "Сфотографировать закат",
            "lessons.w5.m6": "Посмотреть пару видео",
            "lessons.w5.a1": "Распознавание лиц: нейросеть проверяет, совпадает ли лицо перед камерой с твоим.",
            "lessons.w5.a2": "Прогноз времени прибытия: карты учатся на данных о движении от множества телефонов и машин.",
            "lessons.w5.a3": "Подсказки и автозамена: языковая модель угадывает твоё следующее слово.",
            "lessons.w5.a4": "Спам-фильтр: модель, обученная на миллионах писем, прячет мошеннические и мусорные письма.",
            "lessons.w5.a5": "Вычислительная фотография: ИИ объединяет несколько кадров и выравнивает свет и цвета.",
            "lessons.w5.a6": "Рекомендательная система: она предсказывает, какое видео удержит тебя у экрана.",
            "lessons.w5.hint": "Нажми, чтобы узнать",
            "lessons.w5.aiLabel": "Скрытый ИИ:",
            "lessons.w5.found": "Найдено: {n} из {total}",
            "lessons.w5.all": "Всё найдено! ИИ повсюду — теперь ты знаешь, где его искать. 👀",
            "lessons.w5.reset": "Начать заново",

            // Мини-лаборатория 6: а как поступишь ты?
            "lessons.w6.title": "А как поступишь ты?",
            "lessons.w6.intro": "Три жизненные ситуации. Выбери, что сделаешь, и узнай, почему это важно.",
            "lessons.w6.situation": "Ситуация {n}",
            "lessons.w6.s1": "📹 В видео известный человек говорит что-то шокирующее. У ролика уже 2 миллиона просмотров.",
            "lessons.w6.s1o1": "Сразу поделиться — все же это обсуждают",
            "lessons.w6.s1o2": "Проверить, пишут ли об этом надёжные СМИ",
            "lessons.w6.s1o3": "Написать в комментариях «ФЕЙК!!!», ничего не проверив",
            "lessons.w6.s1f1": "Популярное не значит правдивое. Дипфейки распространяются быстро, потому что люди делятся, не проверив.",
            "lessons.w6.s1f2": "Проверка источника — лучшая защита от дипфейков и фейковых новостей.",
            "lessons.w6.s1f3": "Называть что-то фейком без проверки — тоже способ распространять дезинформацию. Сначала проверь.",
            "lessons.w6.s2": "📝 Чат-бот дал тебе идеальную цитату для доклада по истории — и даже назвал книгу, из которой она взята.",
            "lessons.w6.s2o1": "Вставить её — чат-боты всё знают",
            "lessons.w6.s2o2": "Найти книгу или источник и убедиться, что цитата настоящая",
            "lessons.w6.s2o3": "Поменять пару слов, чтобы никто не заметил",
            "lessons.w6.s2f1": "Чат-боты могут выдумывать цитаты и даже целые книги. Не используй их как источник без проверки.",
            "lessons.w6.s2f2": "Настоящий источник можно найти. Если оригинал не находится, не используй цитату.",
            "lessons.w6.s2f3": "Перефразирование не делает цитату правдой, а выдавать текст ИИ за свой часто запрещено школьными правилами.",
            "lessons.w6.s3": "🤳 Весёлое ИИ-приложение просит твоё полное имя, школу и 20 селфи, чтобы превратить тебя в мультяшку.",
            "lessons.w6.s3o1": "Загрузить всё — это же просто развлечение",
            "lessons.w6.s3o2": "Загрузить фотографии друга вместо своих",
            "lessons.w6.s3o3": "Прочитать, что приложение делает с данными, и поделиться минимумом",
            "lessons.w6.s3f1": "Твоё лицо и личные данные — ценная информация. После загрузки вернуть их обратно может быть невозможно.",
            "lessons.w6.s3f2": "Никогда не загружай чужие фото без разрешения — это приватность другого человека.",
            "lessons.w6.s3f3": "Изучи политику конфиденциальности и отзывы и никогда не давай больше, чем приложению действительно нужно.",
            "lessons.w6.best": "Отличный выбор!",
            "lessons.w6.notBest": "Подумай ещё раз.",
            "lessons.w6.better": "Вариант получше:",
            "lessons.w6.score": "Ответственных решений: {n} из {total}",
            "lessons.w6.reset": "Начать заново"
        }
    });

    // ---------- 10. Small helpers ----------

    // Picks the right plural form. English has two forms (1 lesson / 2 lessons),
    // Russian has three (1 урок / 2 урока / 5 уроков).
    function plural(key, n, values) {
        let form = n === 1 ? "one" : "many";
        if (A.lang === "ru") {
            const lastDigit = n % 10;
            const lastTwo = n % 100;
            if (lastDigit === 1 && lastTwo !== 11) form = "one";
            else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) form = "few";
            else form = "many";
        }
        return t(key + "." + form, Object.assign({ n: n }, values || {}));
    }

    // 3 -> "03"
    function pad(n) {
        return String(n).padStart(2, "0");
    }

    // Numbers the local way: 0.5 in English, 0,5 in Russian, with a real minus sign
    function formatNumber(value, digits) {
        if (Math.abs(value) < 0.5 * Math.pow(10, -digits)) value = 0;
        return value.toLocaleString(A.lang === "ru" ? "ru-RU" : "en-US", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        }).replace("-", "−");
    }

    function formatPercent(value) {
        return Math.round(value * 100) + "%";
    }

    function lessonKey(n, part) {
        return "lessons.l" + n + "." + part;
    }

    function lessonTitle(n) {
        return t(lessonKey(n, "title"));
    }

    // Redraws a part of the page from scratch, but keeps the keyboard focus on
    // the "same" button afterwards (buttons are matched by data-fid).
    function redraw(box, html) {
        const active = document.activeElement;
        const fid = active && box.contains(active) ? active.getAttribute("data-fid") : null;
        box.innerHTML = html;
        if (fid) {
            const again = box.querySelector('[data-fid="' + fid + '"]');
            if (again) again.focus({ preventScroll: true });
        }
    }

    // Screen readers read text put into an aria-live element
    function announce(live, text) {
        if (!live) return;
        live.textContent = "";
        setTimeout(function () { live.textContent = text; }, 60);
    }

    // ---------- 11. Saved progress ----------
    const savedCompleted = A.storage.get("lessons.completed", []);
    const completed = new Set(
        (Array.isArray(savedCompleted) ? savedCompleted : []).filter(function (n) {
            return Number.isInteger(n) && n >= 1 && n <= TOTAL;
        })
    );

    const checkAnswers = {};   // lesson number -> chosen option (this visit only)
    const labState = {};       // lesson number -> state of its mini-lab

    function saveCompleted() {
        A.storage.set("lessons.completed", Array.from(completed).sort(function (a, b) { return a - b; }));
    }

    // The first lesson that is not completed yet (0 when all are done)
    function nextLesson() {
        for (let n = 1; n <= TOTAL; n++) {
            if (!completed.has(n)) return n;
        }
        return 0;
    }

    // ---------- 12. Progress panel + cards (built once) ----------
    function cardHTML(lesson) {
        const n = lesson.number;
        return `
            <article class="lsn-card card" id="lesson-card-${n}" data-lesson="${n}" data-reveal data-tilt style="--lsn-rgb: var(${lesson.rgb});">
                <span class="lsn-card-glow" aria-hidden="true"></span>
                <div class="lsn-card-top">
                    <span class="lsn-card-num" aria-hidden="true">${pad(n)}</span>
                    <span class="lsn-badge mono" data-ref="badge" hidden></span>
                </div>
                <div class="lsn-card-icon" aria-hidden="true">
                    <span>${lesson.icon}</span>
                    <span class="lsn-card-tick">✓</span>
                </div>
                <h3 class="lsn-card-title" data-i18n="lessons.l${n}.title">${lessonTitle(n)}</h3>
                <p class="lsn-card-desc" data-i18n="lessons.l${n}.desc">${t(lessonKey(n, "desc"))}</p>
                <div class="lsn-card-meta">
                    <span class="chip lsn-level lsn-level-${lesson.level}">
                        <span class="lsn-dot" aria-hidden="true"></span>
                        <span data-i18n="lessons.level.${lesson.level}">${t("lessons.level." + lesson.level)}</span>
                    </span>
                    <span class="chip"><span aria-hidden="true">⏱</span><span data-ref="minutes"></span></span>
                </div>
                <button type="button" class="btn btn-ghost btn-small lsn-card-open" data-open="${n}">
                    <span data-ref="openText"></span>
                    <span class="lsn-arrow" aria-hidden="true">→</span>
                </button>
            </article>`;
    }

    mount.innerHTML = `
        <div class="lsn-hud card" data-reveal>
            <span class="lsn-hud-corners" aria-hidden="true"></span>
            <div class="lsn-ring" aria-hidden="true">
                <svg viewBox="0 0 100 100" focusable="false">
                    <defs>
                        <linearGradient id="lsn-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" class="lsn-stop-a"></stop>
                            <stop offset="1" class="lsn-stop-b"></stop>
                        </linearGradient>
                    </defs>
                    <circle class="lsn-ring-ticks" cx="50" cy="50" r="48"></circle>
                    <circle class="lsn-ring-track" cx="50" cy="50" r="40" pathLength="100"></circle>
                    <circle class="lsn-ring-fill" cx="50" cy="50" r="40" pathLength="100" data-ref="ringFill"></circle>
                </svg>
                <span class="lsn-ring-value"><span data-ref="percent">0</span><small>%</small></span>
            </div>
            <div class="lsn-hud-info">
                <p class="lsn-hud-label mono" data-i18n="lessons.hud.label">${t("lessons.hud.label")}</p>
                <p class="lsn-hud-count" data-ref="count"></p>
                <p class="lsn-hud-sub" data-ref="sub"></p>
            </div>
            <div class="lsn-hud-actions">
                <button type="button" class="btn btn-primary btn-small" data-ref="continue"></button>
                <button type="button" class="btn btn-primary btn-small lsn-cert-toggle" data-ref="certToggle" aria-expanded="false" aria-controls="lsn-cert" hidden>
                    <span aria-hidden="true">🏆</span>
                    <span data-i18n="lessons.cert.button">${t("lessons.cert.button")}</span>
                </button>
                <button type="button" class="btn btn-ghost btn-small lsn-reset" data-ref="reset"></button>
            </div>
            <ol class="lsn-path" data-ref="path"></ol>
            <p class="sr-only" aria-live="polite" data-ref="live"></p>
        </div>

        <section class="lsn-cert card" id="lsn-cert" aria-labelledby="lsn-cert-title" hidden>
            <div class="lsn-cert-form">
                <p class="lsn-hud-label mono">🏆 AI Compass</p>
                <h3 class="lsn-cert-title" id="lsn-cert-title" data-i18n="lessons.cert.title">${t("lessons.cert.title")}</h3>
                <p class="lsn-cert-intro" data-i18n="lessons.cert.intro">${t("lessons.cert.intro")}</p>
                <label class="lsn-field-label" for="lsn-cert-name" data-i18n="lessons.cert.nameLabel">${t("lessons.cert.nameLabel")}</label>
                <input class="lsn-input" id="lsn-cert-name" type="text" maxlength="40" autocomplete="name" spellcheck="false"
                       data-i18n-attr="placeholder:lessons.cert.placeholder" placeholder="${esc(t("lessons.cert.placeholder"))}">
                <button type="button" class="btn btn-primary" data-ref="certDownload">
                    <span aria-hidden="true">⬇</span>
                    <span data-i18n="lessons.cert.download">${t("lessons.cert.download")}</span>
                </button>
            </div>
            <div class="lsn-cert-preview">
                <canvas width="1600" height="1100" role="img" data-ref="certCanvas"></canvas>
            </div>
        </section>

        <div class="lsn-grid">${LESSONS.map(cardHTML).join("")}</div>
    `;

    function ref(root, name) {
        return root.querySelector('[data-ref="' + name + '"]');
    }

    const hud = {
        root: mount.querySelector(".lsn-hud"),
        ringFill: ref(mount, "ringFill"),
        percent: ref(mount, "percent"),
        count: ref(mount, "count"),
        sub: ref(mount, "sub"),
        continueButton: ref(mount, "continue"),
        certToggle: ref(mount, "certToggle"),
        reset: ref(mount, "reset"),
        path: ref(mount, "path"),
        live: ref(mount, "live")
    };

    const cert = {
        root: mount.querySelector(".lsn-cert"),
        input: mount.querySelector("#lsn-cert-name"),
        download: ref(mount, "certDownload"),
        canvas: ref(mount, "certCanvas")
    };

    const grid = mount.querySelector(".lsn-grid");
    const cards = Array.prototype.slice.call(grid.querySelectorAll(".lsn-card"));

    // The lesson map: one round button per lesson, joined by glowing lines
    hud.path.innerHTML = LESSONS.map(function (lesson) {
        return `
            <li class="lsn-step" data-step="${lesson.number}">
                <button type="button" class="lsn-node" data-open="${lesson.number}">
                    <span class="lsn-node-num" aria-hidden="true">${lesson.number}</span>
                    <span class="lsn-node-check" aria-hidden="true">✓</span>
                </button>
                <span class="lsn-step-label" aria-hidden="true" data-i18n="lessons.l${lesson.number}.title">${lessonTitle(lesson.number)}</span>
            </li>`;
    }).join("");

    const steps = Array.prototype.slice.call(hud.path.querySelectorAll(".lsn-step"));

    // ---------- 13. Updating the panel and the cards ----------
    let ringValue = 0;
    let ringFrame = 0;
    let ringStarted = false;
    let resetArmed = false;
    let resetTimer = 0;

    // Animates the percentage in the middle of the ring
    function setRing(target) {
        cancelAnimationFrame(ringFrame);
        hud.ringFill.style.strokeDashoffset = String(100 - target);
        if (A.reducedMotion) {
            ringValue = target;
            hud.percent.textContent = String(target);
            return;
        }
        const from = ringValue;
        const start = performance.now();
        function step(now) {
            const progress = Math.min(1, (now - start) / 900);
            const eased = 1 - Math.pow(1 - progress, 3);
            ringValue = Math.round(from + (target - from) * eased);
            hud.percent.textContent = String(ringValue);
            if (progress < 1) ringFrame = requestAnimationFrame(step);
        }
        ringFrame = requestAnimationFrame(step);
    }

    function updateHUD() {
        const done = completed.size;
        const next = nextLesson();
        const percent = Math.round((done / TOTAL) * 100);

        hud.root.classList.toggle("is-complete", done === TOTAL);
        hud.count.textContent = plural("lessons.hud.count", done, { total: TOTAL });
        hud.sub.textContent = done === TOTAL
            ? t("lessons.hud.allDone")
            : plural("lessons.hud.left", TOTAL - done) + " · " + t("lessons.hud.upNext", { title: lessonTitle(next) });

        // Buttons
        hud.continueButton.hidden = done === TOTAL;
        hud.continueButton.innerHTML = esc(done === 0 ? t("lessons.hud.start") : t("lessons.hud.continue", { n: next })) +
            ' <span class="lsn-arrow" aria-hidden="true">→</span>';
        hud.certToggle.hidden = done !== TOTAL;
        if (done !== TOTAL) toggleCertificate(false);
        hud.reset.hidden = done === 0;
        hud.reset.classList.toggle("is-armed", resetArmed);
        hud.reset.textContent = (resetArmed ? "⚠ " : "↺ ") + t(resetArmed ? "lessons.hud.resetConfirm" : "lessons.hud.reset");

        // The lesson map
        hud.path.setAttribute("aria-label", t("lessons.hud.pathLabel"));
        steps.forEach(function (step, index) {
            const n = index + 1;
            const isDone = completed.has(n);
            step.classList.toggle("is-done", isDone);
            step.classList.toggle("is-next", n === next);
            step.classList.toggle("is-linked", isDone && completed.has(n - 1));
            const node = step.querySelector(".lsn-node");
            node.setAttribute("aria-label", t(isDone ? "lessons.hud.nodeDone" : "lessons.hud.nodeTodo", { n: n, title: lessonTitle(n) }));
            node.title = lessonTitle(n);
        });

        if (ringStarted) setRing(percent);
    }

    function updateCards() {
        const next = nextLesson();
        cards.forEach(function (card) {
            const n = Number(card.getAttribute("data-lesson"));
            const lesson = LESSONS[n - 1];
            const isDone = completed.has(n);
            const isNext = n === next;
            card.classList.toggle("is-done", isDone);
            card.classList.toggle("is-next", isNext);

            const badge = ref(card, "badge");
            badge.hidden = !isDone && !isNext;
            badge.textContent = isDone ? "✓ " + t("lessons.card.done") : t("lessons.card.next");

            ref(card, "minutes").textContent = t("lessons.card.minutes", { n: lesson.minutes });
            ref(card, "openText").textContent = t(isDone ? "lessons.card.review" : "lessons.card.open");
            card.querySelector("[data-open]").setAttribute("aria-label",
                t(isDone ? "lessons.card.reviewLabel" : "lessons.card.openLabel", { n: n, title: lessonTitle(n) }));
        });
    }

    function updateProgress() {
        updateHUD();
        updateCards();
        if (reader.open) updateReaderChrome();
    }

    // Start the ring animation the first time the panel scrolls into view
    if ("IntersectionObserver" in window) {
        const ringObserver = new IntersectionObserver(function (entries) {
            if (entries.some(function (entry) { return entry.isIntersecting; })) {
                ringObserver.disconnect();
                ringStarted = true;
                setRing(Math.round((completed.size / TOTAL) * 100));
            }
        }, { threshold: 0.3 });
        ringObserver.observe(hud.root);
    } else {
        ringStarted = true;
    }

    // Pause the decorative CSS loops while the lessons are off screen (saves battery)
    let mountVisible = true;

    function updatePaused() {
        mount.classList.toggle("is-paused", !mountVisible || reader.open);
    }

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            mountVisible = entries[entries.length - 1].isIntersecting;
            updatePaused();
        }).observe(mount);
    }

    // ---------- 14. Completing lessons ----------
    function setCompleted(n, isDone) {
        const before = completed.size;
        if (isDone) completed.add(n);
        else completed.delete(n);
        saveCompleted();
        updateProgress();

        if (!isDone) {
            A.toast(t("lessons.toast.undone"), "↩️");
            return;
        }
        // The very last lesson gets one big message instead of two small ones
        if (completed.size === TOTAL && before < TOTAL) {
            launchConfetti();
            A.toast(t("lessons.toast.all"), "🏆");
        } else {
            A.toast(t("lessons.toast.done", { title: lessonTitle(n) }), "✅");
        }
    }

    // Reset needs two clicks, so progress is not lost by accident
    function onResetClick() {
        if (!resetArmed) {
            resetArmed = true;
            updateHUD();
            announce(hud.live, t("lessons.hud.resetAsk"));
            clearTimeout(resetTimer);
            resetTimer = setTimeout(function () {
                resetArmed = false;
                updateHUD();
            }, 4000);
            return;
        }
        clearTimeout(resetTimer);
        resetArmed = false;
        completed.clear();
        saveCompleted();
        Object.keys(checkAnswers).forEach(function (key) { delete checkAnswers[key]; });
        Object.keys(labState).forEach(function (key) { delete labState[key]; });
        updateProgress();
        A.toast(t("lessons.toast.reset"), "↺");
        hud.continueButton.focus();
    }

    // ---------- 15. Confetti when every lesson is done ----------
    function launchConfetti() {
        if (A.reducedMotion) return;
        const canvas = document.createElement("canvas");
        canvas.className = "lsn-confetti";
        canvas.setAttribute("aria-hidden", "true");
        document.body.appendChild(canvas);

        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        const ctx = canvas.getContext("2d");
        ctx.scale(ratio, ratio);

        const colors = ["--accent", "--accent-2", "--accent-3", "--success", "--warning"].map(function (name) {
            return A.cssVar(name) || "#9b6dff";
        });

        // Two bursts: one from each bottom corner
        const pieces = [];
        for (let i = 0; i < 180; i++) {
            const fromLeft = i % 2 === 0;
            const angle = ((fromLeft ? -62 : -118) + (Math.random() - 0.5) * 46) * Math.PI / 180;
            const speed = 11 + Math.random() * 10;
            pieces.push({
                x: fromLeft ? -10 : width + 10,
                y: height * 0.85,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 6 + Math.random() * 7,
                spin: Math.random() * Math.PI,
                spinSpeed: (Math.random() - 0.5) * 0.35,
                color: colors[i % colors.length],
                shape: i % 3
            });
        }

        const start = performance.now();
        const duration = 3000;
        let last = start;

        function frame(now) {
            const elapsed = now - start;
            const dt = Math.min(3, (now - last) / 16.7);   // keeps the speed the same on 60 Hz and 120 Hz screens
            last = now;
            ctx.clearRect(0, 0, width, height);
            ctx.globalAlpha = Math.max(0, Math.min(1, (duration - elapsed) / 700));
            pieces.forEach(function (piece) {
                piece.vy += 0.32 * dt;
                piece.vx *= Math.pow(0.985, dt);
                piece.vy *= Math.pow(0.985, dt);
                piece.x += piece.vx * dt;
                piece.y += piece.vy * dt;
                piece.spin += piece.spinSpeed * dt;
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate(piece.spin);
                ctx.fillStyle = piece.color;
                if (piece.shape === 1) {
                    ctx.beginPath();
                    ctx.arc(0, 0, piece.size / 2.6, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.shape === 2 ? piece.size / 5 : piece.size / 2);
                }
                ctx.restore();
            });
            if (elapsed < duration) requestAnimationFrame(frame);
            else canvas.remove();
        }
        requestAnimationFrame(frame);
    }

    // ---------- 16. The certificate ----------
    let certFrame = 0;

    function toggleCertificate(force) {
        const show = typeof force === "boolean" ? force : cert.root.hidden;
        if (show && completed.size !== TOTAL) return;
        cert.root.hidden = !show;
        hud.certToggle.setAttribute("aria-expanded", String(show));
        if (show) {
            drawCertificate();
            cert.root.scrollIntoView({ behavior: A.reducedMotion ? "auto" : "smooth", block: "nearest" });
        }
    }

    function scheduleCertificate() {
        if (cert.root.hidden) return;
        cancelAnimationFrame(certFrame);
        certFrame = requestAnimationFrame(drawCertificate);
    }

    function roundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }

    // Writes text and makes the font smaller until it fits the given width
    function fitText(ctx, text, x, y, maxWidth, weight, size, family) {
        let fontSize = size;
        ctx.font = weight + " " + fontSize + "px " + family;
        while (ctx.measureText(text).width > maxWidth && fontSize > 12) {
            fontSize -= 2;
            ctx.font = weight + " " + fontSize + "px " + family;
        }
        ctx.fillText(text, x, y);
    }

    // Splits text into lines that are each at most maxWidth wide
    function splitLines(ctx, text, maxWidth) {
        const lines = [];
        let line = "";
        text.split(" ").forEach(function (word) {
            const test = line ? line + " " + word : word;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        });
        lines.push(line);
        return lines;
    }

    // Writes text on two centred lines. If it needs more lines, the font gets
    // a little smaller until it fits (no words are ever cut off).
    function wrapText(ctx, text, x, y, maxWidth, weight, size, family) {
        let fontSize = size;
        let lines;
        do {
            ctx.font = weight + " " + fontSize + "px " + family;
            lines = splitLines(ctx, text, maxWidth);
            fontSize -= 1;
        } while (lines.length > 2 && fontSize >= 14);
        const lineHeight = Math.round((fontSize + 1) * 1.28);
        lines.forEach(function (line, index) {
            ctx.fillText(line, x, y + index * lineHeight);
        });
    }

    function drawCertificate() {
        const canvas = cert.canvas;
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const H = canvas.height;
        const color = {
            bg: A.cssVar("--bg") || "#060812",
            text: A.cssVar("--text") || "#eef1ff",
            muted: A.cssVar("--text-muted") || "#aab5d0",
            accent: A.cssVar("--accent") || "#9b6dff",
            accent2: A.cssVar("--accent-2") || "#50e3ff",
            success: A.cssVar("--success") || "#3ee6a0",
            rgb: A.cssVar("--accent-rgb") || "155, 109, 255",
            rgb2: A.cssVar("--accent-2-rgb") || "80, 227, 255"
        };
        const fonts = {
            display: A.cssVar("--font-display") || "sans-serif",
            body: A.cssVar("--font-body") || "sans-serif",
            mono: A.cssVar("--font-mono") || "monospace"
        };
        const name = cert.input.value.trim() || t("lessons.cert.defaultName");
        const gradient = ctx.createLinearGradient(0, 0, W, H);
        gradient.addColorStop(0, color.accent);
        gradient.addColorStop(1, color.accent2);

        ctx.save();
        ctx.clearRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";

        // Background with two soft glows and a fine grid
        ctx.fillStyle = color.bg;
        ctx.fillRect(0, 0, W, H);
        let glow = ctx.createRadialGradient(260, 160, 0, 260, 160, 900);
        glow.addColorStop(0, "rgba(" + color.rgb + ", 0.30)");
        glow.addColorStop(1, "rgba(" + color.rgb + ", 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
        glow = ctx.createRadialGradient(W - 220, H - 160, 0, W - 220, H - 160, 800);
        glow.addColorStop(0, "rgba(" + color.rgb2 + ", 0.20)");
        glow.addColorStop(1, "rgba(" + color.rgb2 + ", 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = "rgba(" + color.rgb + ", 0.07)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= W; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y <= H; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Frames and corner brackets
        roundedRect(ctx, 36, 36, W - 72, H - 72, 40);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
        roundedRect(ctx, 60, 60, W - 120, H - 120, 28);
        ctx.strokeStyle = "rgba(" + color.rgb2 + ", 0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.strokeStyle = color.accent2;
        ctx.lineWidth = 5;
        [[84, 84, 1, 1], [W - 84, 84, -1, 1], [84, H - 84, 1, -1], [W - 84, H - 84, -1, -1]].forEach(function (c) {
            ctx.beginPath();
            ctx.moveTo(c[0], c[1] + 56 * c[3]);
            ctx.lineTo(c[0], c[1]);
            ctx.lineTo(c[0] + 56 * c[2], c[1]);
            ctx.stroke();
        });

        // Brand and heading
        ctx.fillStyle = color.accent2;
        ctx.font = "600 30px " + fonts.mono;
        if ("letterSpacing" in ctx) ctx.letterSpacing = "8px";
        ctx.fillText("🧭 AI COMPASS", W / 2, 168);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
        ctx.fillStyle = gradient;
        fitText(ctx, t("lessons.cert.heading").toUpperCase(), W / 2, 268, 1280, "700", 58, fonts.display);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

        // The name, with a glow
        ctx.save();
        ctx.shadowColor = "rgba(" + color.rgb + ", 0.55)";
        ctx.shadowBlur = 36;
        ctx.fillStyle = color.text;
        fitText(ctx, name, W / 2, 448, 1240, "700", 100, fonts.display);
        ctx.restore();
        const line = ctx.createLinearGradient(W / 2 - 380, 0, W / 2 + 380, 0);
        line.addColorStop(0, "rgba(" + color.rgb2 + ", 0)");
        line.addColorStop(0.5, color.accent2);
        line.addColorStop(1, "rgba(" + color.rgb + ", 0)");
        ctx.fillStyle = line;
        ctx.fillRect(W / 2 - 380, 492, 760, 3);

        ctx.fillStyle = color.muted;
        fitText(ctx, t("lessons.cert.for"), W / 2, 566, 1240, "500", 34, fonts.body);

        // The six lessons with check marks
        LESSONS.forEach(function (lesson, index) {
            const x = W / 2 + (index - 2.5) * 190;
            const y = 700;
            ctx.beginPath();
            ctx.arc(x, y, 54, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + color.rgb + ", 0.14)";
            ctx.fill();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.font = "46px " + fonts.body;
            ctx.textBaseline = "middle";
            ctx.fillStyle = color.text;
            ctx.fillText(lesson.icon, x, y + 3);
            ctx.beginPath();
            ctx.arc(x + 40, y - 40, 17, 0, Math.PI * 2);
            ctx.fillStyle = color.success;
            ctx.fill();
            ctx.fillStyle = color.bg;
            ctx.font = "700 20px " + fonts.body;
            ctx.fillText("✓", x + 40, y - 39);
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = color.muted;
            wrapText(ctx, lessonTitle(lesson.number), x, y + 92, 176, "600", 19, fonts.body);
        });

        // Date and seal
        const locale = A.lang === "ru" ? "ru-RU" : "en-GB";
        const date = new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
        ctx.textAlign = "left";
        ctx.fillStyle = color.muted;
        ctx.font = "500 26px " + fonts.mono;
        ctx.fillText(t("lessons.cert.date", { date: date }), 132, H - 128);

        // The round "6/6" seal sits low enough to leave space under the lesson names
        const sealX = W - 220;
        const sealY = H - 168;
        ctx.textAlign = "center";
        ctx.beginPath();
        ctx.arc(sealX, sealY, 78, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + color.rgb2 + ", 0.10)";
        ctx.fill();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sealX, sealY, 65, 0, Math.PI * 2);
        ctx.setLineDash([4, 8]);
        ctx.strokeStyle = color.accent2;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = gradient;
        ctx.font = "700 40px " + fonts.display;
        ctx.fillText("6/6", sealX, sealY + 7);
        ctx.fillStyle = color.muted;
        fitText(ctx, t("lessons.cert.lessons").toUpperCase(), sealX, sealY + 36, 100, "600", 16, fonts.mono);
        ctx.restore();

        canvas.setAttribute("aria-label", t("lessons.cert.preview", { name: name }));
    }

    function downloadCertificate() {
        drawCertificate();
        function save(url, isBlob) {
            const link = document.createElement("a");
            link.href = url;
            link.download = "ai-compass-certificate.png";
            document.body.appendChild(link);
            link.click();
            link.remove();
            if (isBlob) setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
            A.toast(t("lessons.toast.cert"), "🏆");
        }
        try {
            if (cert.canvas.toBlob) {
                cert.canvas.toBlob(function (blob) {
                    if (blob) save(URL.createObjectURL(blob), true);
                    else save(cert.canvas.toDataURL("image/png"), false);
                }, "image/png");
            } else {
                save(cert.canvas.toDataURL("image/png"), false);
            }
        } catch (error) {}
    }

    cert.input.value = A.storage.get("lessons.certName", "") || "";
    cert.input.addEventListener("input", function () {
        A.storage.set("lessons.certName", cert.input.value);
        scheduleCertificate();
    });
    cert.download.addEventListener("click", downloadCertificate);

    // ---------- 17. Clicks on the panel and the cards ----------
    hud.root.addEventListener("click", function (event) {
        const node = event.target.closest("[data-open]");
        if (node) {
            openLesson(Number(node.getAttribute("data-open")), node);
            return;
        }
        if (event.target.closest('[data-ref="continue"]')) {
            openLesson(nextLesson() || 1, hud.continueButton);
        } else if (event.target.closest('[data-ref="certToggle"]')) {
            toggleCertificate();
        } else if (event.target.closest('[data-ref="reset"]')) {
            onResetClick();
        }
    });

    // A click anywhere on a card opens it (the button is the keyboard way in)
    grid.addEventListener("click", function (event) {
        const card = event.target.closest(".lsn-card");
        if (!card) return;
        const selection = window.getSelection ? String(window.getSelection()) : "";
        if (selection && !event.target.closest("button")) return;   // the user is selecting text
        openLesson(Number(card.getAttribute("data-lesson")), card.querySelector("[data-open]"));
    });

    // A soft light follows the mouse over a card
    grid.addEventListener("pointermove", function (event) {
        if (event.pointerType !== "mouse") return;
        const card = event.target.closest(".lsn-card");
        if (!card) return;
        const box = card.getBoundingClientRect();
        card.style.setProperty("--mx", Math.round(event.clientX - box.left) + "px");
        card.style.setProperty("--my", Math.round(event.clientY - box.top) + "px");
    });

    // ---------- 18. Mini-lab 1: AI or not AI? ----------
    const SORT_ANSWERS = ["not", "ai", "ai", "not", "ai"];

    // Every mini-lab gets a view (redrawn) and a hidden live region (for screen readers)
    function labShell(box) {
        box.innerHTML = '<div class="lsn-lab-view"></div><p class="sr-only" aria-live="polite"></p>';
        return { view: box.firstElementChild, live: box.lastElementChild };
    }

    function mountSortLab(box, state) {
        const shell = labShell(box);

        function choiceButton(index, value, pick) {
            const label = value === "ai" ? "🤖 " + t("lessons.w1.ai") : "⚙️ " + t("lessons.w1.not");
            return `<button type="button" class="lsn-pill" data-sort="${value}" data-i="${index}" data-fid="w1-${index}-${value}"
                        aria-pressed="${pick === value}"${pick ? ' aria-disabled="true"' : ""}>${label}</button>`;
        }

        function draw() {
            let score = 0;
            let answered = 0;
            const rows = SORT_ANSWERS.map(function (answer, index) {
                const pick = state.answers[index];
                const isRight = pick === answer;
                if (pick) {
                    answered += 1;
                    if (isRight) score += 1;
                }
                const stateClass = pick ? (isRight ? "is-right" : "is-wrong") : "";
                const feedback = pick
                    ? `<p class="lsn-sort-feedback"><strong>${isRight ? "✓ " + t("lessons.w1.right") : "✗ " + t("lessons.w1.wrong")}</strong> ${t("lessons.w1.e" + (index + 1))}</p>`
                    : "";
                return `
                    <li class="lsn-sort-item ${stateClass}">
                        <p class="lsn-sort-text" id="lsn-sort-${index}">${t("lessons.w1.i" + (index + 1))}</p>
                        <div class="lsn-sort-buttons" role="group" aria-labelledby="lsn-sort-${index}">
                            ${choiceButton(index, "ai", pick)}
                            ${choiceButton(index, "not", pick)}
                        </div>
                        ${feedback}
                    </li>`;
            }).join("");

            let summary = t("lessons.w1.score", { score: score, total: SORT_ANSWERS.length });
            if (answered === SORT_ANSWERS.length) {
                summary += " — " + t(score === SORT_ANSWERS.length ? "lessons.w1.perfect" : "lessons.w1.good");
            }
            redraw(shell.view, `
                <ol class="lsn-sort">${rows}</ol>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-score">${summary}</p>
                    ${answered ? `<button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w1-reset">↺ ${t("lessons.w1.reset")}</button>` : ""}
                </div>`);
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-sort]");
            if (button) {
                const index = Number(button.getAttribute("data-i"));
                if (state.answers[index]) return;
                state.answers[index] = button.getAttribute("data-sort");
                draw();
                const isRight = state.answers[index] === SORT_ANSWERS[index];
                announce(shell.live, t(isRight ? "lessons.w1.right" : "lessons.w1.wrong") + " " + t("lessons.w1.e" + (index + 1)));
                return;
            }
            if (event.target.closest('[data-lab="reset"]')) {
                state.answers = SORT_ANSWERS.map(function () { return null; });
                draw();
                const first = shell.view.querySelector("[data-sort]");
                if (first) first.focus({ preventScroll: true });
            }
        };

        draw();
        return null;
    }

    // ---------- 19. Mini-lab 2: watch a model learn (a line learns with gradient descent) ----------
    // Pretend data: hours of study -> test score
    const FIT_HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const FIT_SCORES = [33, 45, 46, 58, 56, 69, 71, 78, 85];
    const FIT_START = { a: -0.2, b: 0.6 };   // the line starts sloping the wrong way
    const FIT_RATE = 0.6;                     // the "learning rate": how big each nudge is

    // Average error of the line "score = a * hours + b", in points (root mean square)
    function fitError(a, b) {
        let total = 0;
        FIT_HOURS.forEach(function (hours, i) {
            const diff = a * (hours / 10) + b - FIT_SCORES[i] / 100;
            total += diff * diff;
        });
        return Math.sqrt(total / FIT_HOURS.length) * 100;
    }

    // One step of gradient descent: find which way makes the error smaller, move a little
    function fitStep(state) {
        let slopeA = 0;
        let slopeB = 0;
        FIT_HOURS.forEach(function (hours, i) {
            const x = hours / 10;
            const diff = state.a * x + state.b - FIT_SCORES[i] / 100;
            slopeA += (2 * diff * x) / FIT_HOURS.length;
            slopeB += (2 * diff) / FIT_HOURS.length;
        });
        state.a -= FIT_RATE * slopeA;
        state.b -= FIT_RATE * slopeB;
        state.step += 1;
        const error = fitError(state.a, state.b);
        const previous = state.history[state.history.length - 1];
        state.history.push(error);
        state.done = Math.abs(previous - error) < 0.005 || state.step >= 300;
    }

    function freshFit() {
        return { a: FIT_START.a, b: FIT_START.b, step: 0, history: [fitError(FIT_START.a, FIT_START.b)], done: false, running: false };
    }

    function mountFitLab(box, state) {
        const shell = labShell(box);
        const view = shell.view;

        // Chart sizes (in SVG units)
        const left = 46;
        const right = 326;
        const top = 14;
        const bottom = 190;
        const sx = function (hours) { return left + (hours / 10) * (right - left); };
        const sy = function (score) { return bottom - (score / 100) * (bottom - top); };
        const lossLeft = 30;
        const lossRight = 292;
        const lossTop = 10;
        const lossBottom = 84;
        const lossMax = 25;

        let gridLines = "";
        let labels = "";
        [0, 25, 50, 75, 100].forEach(function (score) {
            gridLines += `<line x1="${left}" x2="${right}" y1="${sy(score)}" y2="${sy(score)}"/>`;
            labels += `<text x="${left - 8}" y="${sy(score) + 3.5}" text-anchor="end">${score}</text>`;
        });
        [0, 2, 4, 6, 8, 10].forEach(function (hours) {
            gridLines += `<line x1="${sx(hours)}" x2="${sx(hours)}" y1="${top}" y2="${bottom}"/>`;
            labels += `<text x="${sx(hours)}" y="${bottom + 15}" text-anchor="middle">${hours}</text>`;
        });
        const points = FIT_HOURS.map(function (hours, i) {
            return `<circle cx="${sx(hours)}" cy="${sy(FIT_SCORES[i])}" r="5"/>`;
        }).join("");

        view.innerHTML = `
            <div class="lsn-fit">
                <figure class="lsn-fit-chart">
                    <svg viewBox="0 0 340 230" role="img" aria-label="${esc(t("lessons.w2.chart"))}">
                        <defs>
                            <clipPath id="lsn-fit-clip"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}"/></clipPath>
                        </defs>
                        <g class="lsn-chart-grid">${gridLines}</g>
                        <g class="lsn-chart-labels">${labels}</g>
                        <text class="lsn-chart-title" x="${(left + right) / 2}" y="224" text-anchor="middle">${t("lessons.w2.hours")}</text>
                        <text class="lsn-chart-title" transform="translate(11 ${(top + bottom) / 2}) rotate(-90)" text-anchor="middle">${t("lessons.w2.score")}</text>
                        <g class="lsn-fit-residuals" data-residuals clip-path="url(#lsn-fit-clip)"></g>
                        <line class="lsn-fit-line" data-line clip-path="url(#lsn-fit-clip)"/>
                        <g class="lsn-fit-points">${points}</g>
                    </svg>
                    <figcaption class="lsn-legend">
                        <span><i class="lsn-key-dot" aria-hidden="true"></i>${t("lessons.w2.data")}</span>
                        <span><i class="lsn-key-line" aria-hidden="true"></i>${t("lessons.w2.model")}</span>
                        <span><i class="lsn-key-dash" aria-hidden="true"></i>${t("lessons.w2.residual")}</span>
                    </figcaption>
                </figure>
                <div class="lsn-fit-side">
                    <p class="lsn-stat-step mono" data-stat="step"></p>
                    <p class="lsn-stat-big" data-stat="error"></p>
                    <p class="lsn-stat-small" data-stat="predict"></p>
                    <figure class="lsn-loss">
                        <figcaption class="mono">${t("lessons.w2.lossTitle")}</figcaption>
                        <svg viewBox="0 0 300 92" role="img" aria-label="${esc(t("lessons.w2.lossChart"))}">
                            <defs>
                                <linearGradient id="lsn-loss-fill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0" class="lsn-stop-a"></stop>
                                    <stop offset="1" class="lsn-stop-fade"></stop>
                                </linearGradient>
                            </defs>
                            <line class="lsn-loss-axis" x1="${lossLeft}" x2="${lossRight}" y1="${lossBottom}" y2="${lossBottom}"/>
                            <line class="lsn-loss-axis" x1="${lossLeft}" x2="${lossLeft}" y1="${lossTop}" y2="${lossBottom}"/>
                            <text class="lsn-loss-tick" x="${lossLeft - 5}" y="${lossTop + 4}" text-anchor="end">${lossMax}</text>
                            <text class="lsn-loss-tick" x="${lossLeft - 5}" y="${lossBottom}" text-anchor="end">0</text>
                            <path class="lsn-loss-area" data-loss-area/>
                            <polyline class="lsn-loss-line" data-loss/>
                            <circle class="lsn-loss-dot" r="3.5" data-loss-dot/>
                        </svg>
                    </figure>
                </div>
                <div class="lsn-lab-actions">
                    <button type="button" class="btn btn-primary btn-small" data-lab="step" data-fid="w2-step"><span aria-hidden="true">➕</span> ${t("lessons.w2.step")}</button>
                    <button type="button" class="btn btn-ghost btn-small" data-lab="auto" data-fid="w2-auto"></button>
                    <button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w2-reset"><span aria-hidden="true">↺</span> ${t("lessons.w2.reset")}</button>
                </div>
                <p class="lsn-lab-status" data-status></p>
                <p class="lsn-lab-small">${t("lessons.w2.fake")}</p>
            </div>`;

        const line = view.querySelector("[data-line]");
        const residuals = view.querySelector("[data-residuals]");
        const lossLine = view.querySelector("[data-loss]");
        const lossArea = view.querySelector("[data-loss-area]");
        const lossDot = view.querySelector("[data-loss-dot]");
        const autoButton = view.querySelector('[data-lab="auto"]');
        const status = view.querySelector("[data-status]");
        let frame = 0;
        let lastTime = 0;

        function update() {
            const model = function (hours) { return (state.a * (hours / 10) + state.b) * 100; };
            line.setAttribute("x1", sx(0));
            line.setAttribute("y1", sy(model(0)).toFixed(1));
            line.setAttribute("x2", sx(10));
            line.setAttribute("y2", sy(model(10)).toFixed(1));
            residuals.innerHTML = FIT_HOURS.map(function (hours, i) {
                return `<line x1="${sx(hours)}" x2="${sx(hours)}" y1="${sy(FIT_SCORES[i])}" y2="${sy(model(hours)).toFixed(1)}"/>`;
            }).join("");

            const error = state.history[state.history.length - 1];
            view.querySelector('[data-stat="step"]').textContent = t("lessons.w2.steps", { n: state.step });
            view.querySelector('[data-stat="error"]').textContent = t("lessons.w2.error", { e: formatNumber(error, 1) });
            view.querySelector('[data-stat="predict"]').textContent = plural("lessons.w2.predict", Math.round(model(10)));

            // The error curve
            const maxSteps = Math.max(60, state.history.length - 1);
            const lx = function (i) { return lossLeft + (i / maxSteps) * (lossRight - lossLeft); };
            const ly = function (value) { return lossBottom - (Math.min(value, lossMax) / lossMax) * (lossBottom - lossTop); };
            const coords = state.history.map(function (value, i) { return lx(i).toFixed(1) + "," + ly(value).toFixed(1); });
            lossLine.setAttribute("points", coords.join(" "));
            lossArea.setAttribute("d", "M" + lx(0) + "," + lossBottom + " L" + coords.join(" L") + " L" + lx(state.history.length - 1).toFixed(1) + "," + lossBottom + " Z");
            lossDot.setAttribute("cx", lx(state.history.length - 1).toFixed(1));
            lossDot.setAttribute("cy", ly(error).toFixed(1));

            autoButton.innerHTML = state.running
                ? '<span aria-hidden="true">⏸</span> ' + esc(t("lessons.w2.pause"))
                : '<span aria-hidden="true">▶</span> ' + esc(t("lessons.w2.auto"));
            status.textContent = t(state.done ? "lessons.w2.done" : state.step === 0 ? "lessons.w2.start" : "lessons.w2.learning");
            status.classList.toggle("is-done", state.done);
        }

        function stepOnce() {
            fitStep(state);
            if (state.done && state.running) {
                state.running = false;
                announce(shell.live, t("lessons.w2.done"));
            }
            update();
        }

        function loop(now) {
            if (!state.running) return;
            if (now - lastTime >= 70) {
                lastTime = now;
                stepOnce();
            }
            if (state.running) frame = requestAnimationFrame(loop);
        }

        function setRunning(on) {
            cancelAnimationFrame(frame);
            if (on && state.done) Object.assign(state, freshFit());   // learned already: start again
            state.running = on;
            if (on) frame = requestAnimationFrame(loop);
            update();
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-lab]");
            if (!button) return;
            const action = button.getAttribute("data-lab");
            if (action === "step") {
                if (state.running) setRunning(false);
                stepOnce();
                announce(shell.live, t("lessons.w2.steps", { n: state.step }) + ". " +
                    t("lessons.w2.error", { e: formatNumber(state.history[state.history.length - 1], 1) }) +
                    (state.done ? " " + t("lessons.w2.done") : ""));
            } else if (action === "auto") {
                setRunning(!state.running);
            } else if (action === "reset") {
                cancelAnimationFrame(frame);
                Object.assign(state, freshFit());
                update();
            }
        };

        update();
        if (state.running) frame = requestAnimationFrame(loop);
        return function () { cancelAnimationFrame(frame); };
    }

    // ---------- 20. Mini-lab 3: play with a neuron ----------
    // Starts on "Go to the park!" (z = 0.35), so the "Try this" hint can flip it
    const NEURON_START = { x1: 0.9, x2: 0.2, w1: 1.5, w2: 2.5, b: -1.5 };
    const NEURON_SLIDERS = [
        { key: "x1", min: 0, max: 1, step: 0.05, digits: 2, label: "lessons.w3.x1" },
        { key: "x2", min: 0, max: 1, step: 0.05, digits: 2, label: "lessons.w3.x2" },
        { key: "w1", min: -3, max: 3, step: 0.1, digits: 1, label: "lessons.w3.w1" },
        { key: "w2", min: -3, max: 3, step: 0.1, digits: 1, label: "lessons.w3.w2" },
        { key: "b", min: -3, max: 3, step: 0.1, digits: 1, label: "lessons.w3.b" }
    ];

    function mountNeuronLab(box, state) {
        const shell = labShell(box);
        const view = shell.view;

        function sliderHTML(slider) {
            const id = "lsn-neuron-" + slider.key;
            return `
                <div class="lsn-slider">
                    <label for="${id}">${t(slider.label)}</label>
                    <output for="${id}" class="mono" data-value="${slider.key}"></output>
                    <input class="lsn-range" type="range" id="${id}" data-key="${slider.key}" data-fid="w3-${slider.key}"
                           min="${slider.min}" max="${slider.max}" step="${slider.step}" value="${state[slider.key]}">
                </div>`;
        }

        view.innerHTML = `
            <div class="lsn-neuron">
                <svg class="lsn-neuron-svg" viewBox="0 0 360 196" role="img" aria-label="${esc(t("lessons.w3.diagram"))}">
                    <line class="lsn-edge" data-edge="1" x1="62" y1="50" x2="214" y2="98"/>
                    <line class="lsn-edge" data-edge="2" x1="62" y1="146" x2="214" y2="98"/>
                    <line class="lsn-edge-out" x1="246" y1="98" x2="290" y2="98"/>
                    <g class="lsn-edge-tag" transform="translate(132 64)">
                        <rect x="-23" y="-12" width="46" height="24" rx="8"/>
                        <text text-anchor="middle" y="4.5" data-tag="1"></text>
                    </g>
                    <g class="lsn-edge-tag" transform="translate(132 132)">
                        <rect x="-23" y="-12" width="46" height="24" rx="8"/>
                        <text text-anchor="middle" y="4.5" data-tag="2"></text>
                    </g>
                    <text class="lsn-svg-emoji" x="22" y="56" text-anchor="middle">☀️</text>
                    <text class="lsn-svg-emoji" x="22" y="152" text-anchor="middle">📚</text>
                    <circle class="lsn-in-node" cx="62" cy="50" r="22"/>
                    <circle class="lsn-in-node" cx="62" cy="146" r="22"/>
                    <text class="lsn-in-value" x="62" y="54.5" text-anchor="middle" data-in="1"></text>
                    <text class="lsn-in-value" x="62" y="150.5" text-anchor="middle" data-in="2"></text>
                    <circle class="lsn-neuron-glow" cx="226" cy="98" r="46"/>
                    <circle class="lsn-neuron-core" cx="226" cy="98" r="30"/>
                    <text class="lsn-neuron-sigma" x="226" y="94" text-anchor="middle">Σ</text>
                    <text class="lsn-neuron-z" x="226" y="113" text-anchor="middle" data-z></text>
                    <rect class="lsn-out-box" x="290" y="76" width="62" height="44" rx="12"/>
                    <text class="lsn-out-value" x="321" y="104" text-anchor="middle" data-out></text>
                </svg>
                <div class="lsn-neuron-controls">
                    <fieldset class="lsn-fieldset">
                        <legend class="mono">${t("lessons.w3.inputs")}</legend>
                        ${NEURON_SLIDERS.slice(0, 2).map(sliderHTML).join("")}
                    </fieldset>
                    <fieldset class="lsn-fieldset">
                        <legend class="mono">${t("lessons.w3.params")}</legend>
                        ${NEURON_SLIDERS.slice(2).map(sliderHTML).join("")}
                    </fieldset>
                </div>
                <div class="lsn-neuron-result">
                    <p class="lsn-formula mono" data-formula></p>
                    <div class="lsn-meter" aria-hidden="true"><span data-meter></span><i></i></div>
                    <div class="lsn-neuron-verdict">
                        <p class="lsn-verdict" data-verdict></p>
                        <button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w3-reset"><span aria-hidden="true">↺</span> ${t("lessons.w3.reset")}</button>
                    </div>
                </div>
                <p class="lsn-lab-hint"><span aria-hidden="true">💡</span> ${t("lessons.w3.try")}</p>
                <p class="lsn-lab-small">${t("lessons.w3.explain")}</p>
            </div>`;

        let lastAnswer = null;

        function update(shouldAnnounce) {
            const z = state.w1 * state.x1 + state.w2 * state.x2 + state.b;
            const output = 1 / (1 + Math.exp(-z));   // the sigmoid activation function

            [1, 2].forEach(function (i) {
                const weight = state["w" + i];
                const edge = view.querySelector('[data-edge="' + i + '"]');
                edge.style.strokeWidth = (1.5 + Math.abs(weight) * 2.2).toFixed(1);
                edge.style.opacity = (0.3 + Math.min(1, Math.abs(weight) / 3) * 0.7).toFixed(2);
                edge.classList.toggle("is-negative", weight < 0);
                view.querySelector('[data-tag="' + i + '"]').textContent = formatNumber(weight, 1);
                view.querySelector('[data-in="' + i + '"]').textContent = formatNumber(state["x" + i], 2);
            });
            view.querySelector("[data-z]").textContent = "z=" + formatNumber(z, 2);
            view.querySelector("[data-out]").textContent = formatPercent(output);
            view.querySelector(".lsn-neuron-svg").style.setProperty("--lsn-out", output.toFixed(3));

            NEURON_SLIDERS.forEach(function (slider) {
                const text = formatNumber(state[slider.key], slider.digits);
                view.querySelector('[data-value="' + slider.key + '"]').textContent = text;
                view.querySelector('[data-key="' + slider.key + '"]').setAttribute("aria-valuetext", text);
            });

            const bias = state.b < 0 ? "− " + formatNumber(-state.b, 1) : "+ " + formatNumber(state.b, 1);
            view.querySelector("[data-formula]").textContent =
                "z = " + formatNumber(state.x1, 2) + " × " + formatNumber(state.w1, 1) +
                " + " + formatNumber(state.x2, 2) + " × " + formatNumber(state.w2, 1) +
                " " + bias + " = " + formatNumber(z, 2) + "   →   σ(z) = " + formatPercent(output);
            view.querySelector("[data-meter]").style.width = (output * 100).toFixed(1) + "%";

            const isYes = output >= 0.5;
            const verdict = view.querySelector("[data-verdict]");
            verdict.textContent = t("lessons.w3.output") + ": " + t(isYes ? "lessons.w3.yes" : "lessons.w3.no");
            verdict.classList.toggle("is-yes", isYes);
            if (shouldAnnounce && lastAnswer !== null && lastAnswer !== isYes) {
                announce(shell.live, t("lessons.w3.decision", { answer: t(isYes ? "lessons.w3.yes" : "lessons.w3.no") }));
            }
            lastAnswer = isYes;
        }

        box.oninput = function (event) {
            const key = event.target.getAttribute("data-key");
            if (!key) return;
            state[key] = parseFloat(event.target.value);
            update(true);
        };

        box.onclick = function (event) {
            if (!event.target.closest('[data-lab="reset"]')) return;
            Object.assign(state, NEURON_START);
            NEURON_SLIDERS.forEach(function (slider) {
                view.querySelector('[data-key="' + slider.key + '"]').value = state[slider.key];
            });
            update(true);
        };

        update(false);
        return null;
    }

    // ---------- 21. Mini-lab 4: be the language model ----------
    // How much the model "likes" each word (made-up scores called logits)
    const WORD_LOGITS = [2.2, 1.5, 1.2, 0.8, 0.4, -0.2];

    // Softmax with temperature: turns the scores into probabilities that add up to 1
    function wordProbabilities(temperature) {
        const scaled = WORD_LOGITS.map(function (logit) { return logit / temperature; });
        const highest = Math.max.apply(null, scaled);
        const exps = scaled.map(function (value) { return Math.exp(value - highest); });
        const sum = exps.reduce(function (total, value) { return total + value; }, 0);
        return exps.map(function (value) { return value / sum; });
    }

    function mountWordsLab(box, state) {
        const shell = labShell(box);
        const view = shell.view;
        const word = function (i) { return t("lessons.w4.word" + (i + 1)); };

        view.innerHTML = `
            <div class="lsn-words">
                <p class="lsn-sentence">
                    <span class="lsn-sentence-prompt">${t("lessons.w4.prompt")}</span>
                    <span class="lsn-blank" data-blank></span><span class="lsn-cursor" aria-hidden="true"></span>
                </p>
                <p class="lsn-lab-sub mono">${t("lessons.w4.probs")}</p>
                <ol class="lsn-bars">
                    ${WORD_LOGITS.map(function (logit, i) {
                        return `
                            <li class="lsn-bar" data-row="${i}">
                                <span class="lsn-bar-word">${word(i)}</span>
                                <span class="lsn-bar-track" aria-hidden="true"><span class="lsn-bar-fill"></span></span>
                                <span class="lsn-bar-value mono"></span>
                            </li>`;
                    }).join("")}
                </ol>
                <div class="lsn-slider lsn-temp">
                    <label for="lsn-temp">${t("lessons.w4.temp")}</label>
                    <output for="lsn-temp" class="mono" data-temp-value></output>
                    <input class="lsn-range" type="range" id="lsn-temp" data-fid="w4-temp" min="0.2" max="2" step="0.1" value="${state.temp}">
                    <div class="lsn-temp-scale" aria-hidden="true"><span>❄ ${t("lessons.w4.low")}</span><span>${t("lessons.w4.high")} 🔥</span></div>
                </div>
                <p class="lsn-temp-note" data-temp-note></p>
                <div class="lsn-lab-actions">
                    <button type="button" class="btn btn-primary btn-small" data-lab="generate" data-fid="w4-generate"><span aria-hidden="true">✨</span> ${t("lessons.w4.generate")}</button>
                    <button type="button" class="btn btn-ghost btn-small" data-lab="clear" data-fid="w4-clear"><span aria-hidden="true">↺</span> ${t("lessons.w4.clear")}</button>
                </div>
                <div class="lsn-history">
                    <p class="lsn-lab-sub mono">${t("lessons.w4.history")}</p>
                    <ol class="lsn-history-list" data-history></ol>
                </div>
                <p class="lsn-lab-small">${t("lessons.w4.note")}</p>
            </div>`;

        const blank = view.querySelector("[data-blank]");
        const rows = Array.prototype.slice.call(view.querySelectorAll(".lsn-bar"));

        function updateBars() {
            const probabilities = wordProbabilities(state.temp);
            rows.forEach(function (row, i) {
                row.querySelector(".lsn-bar-fill").style.width = (probabilities[i] * 100).toFixed(1) + "%";
                row.querySelector(".lsn-bar-value").textContent = formatPercent(probabilities[i]);
                row.classList.toggle("is-picked", state.last === i);
            });
            const temperature = formatNumber(state.temp, 1);
            view.querySelector("[data-temp-value]").textContent = temperature;
            view.querySelector("#lsn-temp").setAttribute("aria-valuetext", temperature);
            let note = "lessons.w4.tempMid";
            if (state.temp < 0.6) note = "lessons.w4.tempLow";
            else if (state.temp > 1.3) note = "lessons.w4.tempHigh";
            view.querySelector("[data-temp-note]").textContent = t(note);
        }

        function updateSentence() {
            blank.textContent = state.last === null ? "…" : word(state.last);
            blank.classList.toggle("is-filled", state.last !== null);
            const list = view.querySelector("[data-history]");
            list.innerHTML = state.history.length
                ? state.history.map(function (i, index) {
                    return `<li class="lsn-history-chip${index === 0 ? " is-new" : ""}">${word(i)}</li>`;
                }).join("")
                : `<li class="lsn-history-empty">${t("lessons.w4.empty")}</li>`;
        }

        function generate() {
            const probabilities = wordProbabilities(state.temp);
            let roll = Math.random();
            let picked = probabilities.length - 1;
            for (let i = 0; i < probabilities.length; i++) {
                roll -= probabilities[i];
                if (roll <= 0) {
                    picked = i;
                    break;
                }
            }
            state.last = picked;
            state.history.unshift(picked);
            state.history = state.history.slice(0, 10);
            updateBars();
            updateSentence();
            // Restart the little "pop" animation on the new word
            blank.classList.remove("is-pop");
            void blank.offsetWidth;
            blank.classList.add("is-pop");
            announce(shell.live, t("lessons.w4.picked", { word: word(picked), p: formatPercent(probabilities[picked]) }));
        }

        box.oninput = function (event) {
            if (event.target.id !== "lsn-temp") return;
            state.temp = parseFloat(event.target.value);
            updateBars();
        };

        box.onclick = function (event) {
            const button = event.target.closest("[data-lab]");
            if (!button) return;
            if (button.getAttribute("data-lab") === "generate") {
                generate();
            } else {
                state.history = [];
                state.last = null;
                updateBars();
                updateSentence();
            }
        };

        updateBars();
        updateSentence();
        return null;
    }

    // ---------- 22. Mini-lab 5: spot the hidden AI ----------
    const DAY_MOMENTS = [
        { time: "07:00", icon: "📱" },
        { time: "08:10", icon: "🚌" },
        { time: "12:30", icon: "⌨️" },
        { time: "16:00", icon: "📧" },
        { time: "19:00", icon: "📸" },
        { time: "21:00", icon: "🎬" }
    ];

    function mountDayLab(box, state) {
        const shell = labShell(box);

        function draw() {
            const found = state.found.filter(Boolean).length;
            const items = DAY_MOMENTS.map(function (moment, i) {
                const isOpen = state.open[i];
                return `
                    <li class="lsn-moment${isOpen ? " is-open" : ""}${state.found[i] ? " is-found" : ""}">
                        <span class="lsn-moment-time mono" aria-hidden="true">${moment.time}</span>
                        <div class="lsn-moment-card">
                            <button type="button" class="lsn-moment-button" data-moment="${i}" data-fid="w5-${i}"
                                    aria-expanded="${isOpen}" aria-controls="lsn-moment-${i}">
                                <span class="lsn-moment-icon" aria-hidden="true">${moment.icon}</span>
                                <span class="lsn-moment-text"><span class="sr-only">${moment.time} — </span>${t("lessons.w5.m" + (i + 1))}</span>
                                <span class="lsn-moment-hint mono" aria-hidden="true">${isOpen ? "🤖" : t("lessons.w5.hint")}</span>
                            </button>
                            <p class="lsn-moment-ai" id="lsn-moment-${i}"${isOpen ? "" : " hidden"}>
                                <strong>${t("lessons.w5.aiLabel")}</strong> ${t("lessons.w5.a" + (i + 1))}
                            </p>
                        </div>
                    </li>`;
            }).join("");

            redraw(shell.view, `
                <ol class="lsn-day">${items}</ol>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-score">
                        <span class="lsn-progress-mini" aria-hidden="true"><span style="width: ${(found / DAY_MOMENTS.length) * 100}%"></span></span>
                        ${t("lessons.w5.found", { n: found, total: DAY_MOMENTS.length })}
                    </p>
                    ${found ? `<button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w5-reset">↺ ${t("lessons.w5.reset")}</button>` : ""}
                </div>
                ${found === DAY_MOMENTS.length ? `<p class="lsn-lab-win">${t("lessons.w5.all")}</p>` : ""}`);
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-moment]");
            if (button) {
                const i = Number(button.getAttribute("data-moment"));
                const wasFound = state.found.filter(Boolean).length;
                state.open[i] = !state.open[i];
                state.found[i] = true;
                draw();
                const found = state.found.filter(Boolean).length;
                if (found === DAY_MOMENTS.length && wasFound < found) announce(shell.live, t("lessons.w5.all"));
                else if (wasFound < found) announce(shell.live, t("lessons.w5.found", { n: found, total: DAY_MOMENTS.length }));
                return;
            }
            if (event.target.closest('[data-lab="reset"]')) {
                state.open = DAY_MOMENTS.map(function () { return false; });
                state.found = DAY_MOMENTS.map(function () { return false; });
                draw();
                const first = shell.view.querySelector("[data-moment]");
                if (first) first.focus({ preventScroll: true });
            }
        };

        draw();
        return null;
    }

    // ---------- 23. Mini-lab 6: what would you do? ----------
    const DILEMMA_BEST = [1, 1, 2];   // the most responsible option in each situation

    function mountDilemmaLab(box, state) {
        const shell = labShell(box);

        function draw() {
            let good = 0;
            let answered = 0;
            const items = DILEMMA_BEST.map(function (best, s) {
                const key = "lessons.w6.s" + (s + 1);
                const chosen = state.choices[s];
                const hasChosen = chosen !== null;
                if (hasChosen) {
                    answered += 1;
                    if (chosen === best) good += 1;
                }
                const options = [0, 1, 2].map(function (o) {
                    let stateClass = "";
                    if (hasChosen) {
                        if (o === best) stateClass = " is-best";
                        else if (o === chosen) stateClass = " is-chosen";
                        else stateClass = " is-dim";
                    }
                    return `<button type="button" class="lsn-choice${stateClass}" data-s="${s}" data-o="${o}" data-fid="w6-${s}-${o}"
                                aria-pressed="${chosen === o}"${hasChosen ? ' aria-disabled="true"' : ""}>${t(key + "o" + (o + 1))}</button>`;
                }).join("");

                let feedback = "";
                if (hasChosen) {
                    const isBest = chosen === best;
                    feedback = `
                        <div class="lsn-dilemma-feedback ${isBest ? "is-good" : "is-bad"}">
                            <p><strong>${isBest ? "✓ " + t("lessons.w6.best") : "✗ " + t("lessons.w6.notBest")}</strong> ${t(key + "f" + (chosen + 1))}</p>
                            ${isBest ? "" : `<p><strong>${t("lessons.w6.better")}</strong> ${t(key + "o" + (best + 1))}. ${t(key + "f" + (best + 1))}</p>`}
                        </div>`;
                }
                return `
                    <li class="lsn-dilemma">
                        <p class="lsn-dilemma-tag mono">${t("lessons.w6.situation", { n: s + 1 })}</p>
                        <p class="lsn-dilemma-text" id="lsn-dilemma-${s}">${t(key)}</p>
                        <div class="lsn-dilemma-options" role="group" aria-labelledby="lsn-dilemma-${s}">${options}</div>
                        ${feedback}
                    </li>`;
            }).join("");

            redraw(shell.view, `
                <ol class="lsn-dilemmas">${items}</ol>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-score">${t("lessons.w6.score", { n: good, total: DILEMMA_BEST.length })}</p>
                    ${answered ? `<button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w6-reset">↺ ${t("lessons.w6.reset")}</button>` : ""}
                </div>`);
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-s]");
            if (button) {
                const s = Number(button.getAttribute("data-s"));
                if (state.choices[s] !== null) return;
                state.choices[s] = Number(button.getAttribute("data-o"));
                draw();
                const key = "lessons.w6.s" + (s + 1);
                const isBest = state.choices[s] === DILEMMA_BEST[s];
                announce(shell.live, t(isBest ? "lessons.w6.best" : "lessons.w6.notBest") + " " + t(key + "f" + (state.choices[s] + 1)));
                return;
            }
            if (event.target.closest('[data-lab="reset"]')) {
                state.choices = DILEMMA_BEST.map(function () { return null; });
                draw();
                const first = shell.view.querySelector("[data-s]");
                if (first) first.focus({ preventScroll: true });
            }
        };

        draw();
        return null;
    }

    // Which mini-lab each lesson uses, and how a fresh one starts
    const LAB_TYPES = {
        sort: { mount: mountSortLab, fresh: function () { return { answers: SORT_ANSWERS.map(function () { return null; }) }; } },
        fit: { mount: mountFitLab, fresh: freshFit },
        neuron: { mount: mountNeuronLab, fresh: function () { return Object.assign({}, NEURON_START); } },
        words: { mount: mountWordsLab, fresh: function () { return { temp: 1, history: [], last: null }; } },
        day: {
            mount: mountDayLab,
            fresh: function () {
                return { open: DAY_MOMENTS.map(function () { return false; }), found: DAY_MOMENTS.map(function () { return false; }) };
            }
        },
        dilemmas: { mount: mountDilemmaLab, fresh: function () { return { choices: DILEMMA_BEST.map(function () { return null; }) }; } }
    };

    function mountLab(n, box) {
        const type = LAB_TYPES[LESSONS[n - 1].lab];
        if (!labState[n]) labState[n] = type.fresh();
        return type.mount(box, labState[n]);
    }

    // ---------- 24. The lesson reader (a full-screen dialog) ----------
    const reader = {
        open: false,
        lesson: 0,
        opener: null,
        closeTimer: 0,
        scrollRatio: 0,
        cleanupLab: null,
        inerted: [],
        previousHash: "",
        renderedLang: ""
    };

    const SIZES = ["s", "m", "l"];
    let textSize = A.storage.get("lessons.textSize", "m");
    if (SIZES.indexOf(textSize) === -1) textSize = "m";

    const readerEl = document.createElement("div");
    readerEl.className = "lsn-reader";
    readerEl.hidden = true;
    readerEl.setAttribute("data-size", textSize);
    readerEl.innerHTML = `
        <div class="lsn-reader-backdrop" data-action="close"></div>
        <div class="lsn-reader-panel" role="dialog" aria-modal="true" aria-labelledby="lsn-reader-title">
            <div class="lsn-reader-progress" aria-hidden="true"><span data-ref="progress"></span></div>
            <header class="lsn-reader-top">
                <div class="lsn-reader-where">
                    <span class="lsn-reader-pulse" aria-hidden="true"></span>
                    <p class="lsn-reader-crumb mono" data-ref="crumb"></p>
                    <p class="lsn-reader-keys mono" data-ref="keys"></p>
                </div>
                <div class="lsn-reader-tools">
                    <button type="button" class="lsn-tool lsn-tool-listen" data-action="listen" data-fid="listen">
                        <span class="lsn-wave" aria-hidden="true"><i></i><i></i><i></i></span>
                        <span data-ref="listenText"></span>
                    </button>
                    <button type="button" class="lsn-tool" data-action="size" data-fid="size">
                        <span aria-hidden="true">A<small>A</small></span>
                    </button>
                    <button type="button" class="lsn-tool lsn-tool-close" data-action="close" data-fid="close">
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
                    </button>
                </div>
            </header>
            <div class="lsn-reader-scroll" data-ref="scroll">
                <div class="lsn-reader-layout">
                    <nav class="lsn-toc" aria-labelledby="lsn-toc-title">
                        <p class="lsn-toc-title mono" id="lsn-toc-title" data-ref="tocTitle"></p>
                        <ol class="lsn-toc-list" data-ref="toc"></ol>
                    </nav>
                    <article class="lsn-article" data-ref="article"></article>
                </div>
            </div>
            <footer class="lsn-reader-foot">
                <button type="button" class="btn btn-ghost lsn-nav lsn-nav-prev" data-action="prev" data-fid="prev">
                    <span class="lsn-nav-arrow" aria-hidden="true">←</span>
                    <span class="lsn-nav-copy"><span class="lsn-nav-small mono"></span><span class="lsn-nav-title"></span></span>
                </button>
                <button type="button" class="btn btn-primary lsn-complete" data-action="complete" data-fid="complete">
                    <span data-ref="completeText"></span>
                </button>
                <button type="button" class="btn btn-ghost lsn-nav lsn-nav-next" data-action="next" data-fid="next">
                    <span class="lsn-nav-copy"><span class="lsn-nav-small mono"></span><span class="lsn-nav-title"></span></span>
                    <span class="lsn-nav-arrow" aria-hidden="true">→</span>
                </button>
            </footer>
        </div>`;
    document.body.appendChild(readerEl);

    const panel = readerEl.querySelector(".lsn-reader-panel");
    const parts = {
        progress: ref(readerEl, "progress"),
        crumb: ref(readerEl, "crumb"),
        keys: ref(readerEl, "keys"),
        listen: readerEl.querySelector('[data-action="listen"]'),
        listenText: ref(readerEl, "listenText"),
        size: readerEl.querySelector('[data-action="size"]'),
        close: readerEl.querySelector(".lsn-tool-close"),
        scroll: ref(readerEl, "scroll"),
        tocTitle: ref(readerEl, "tocTitle"),
        toc: ref(readerEl, "toc"),
        article: ref(readerEl, "article"),
        prev: readerEl.querySelector('[data-action="prev"]'),
        next: readerEl.querySelector('[data-action="next"]'),
        complete: readerEl.querySelector('[data-action="complete"]'),
        completeText: ref(readerEl, "completeText")
    };

    // The full text of one lesson
    function articleHTML(n) {
        const lesson = LESSONS[n - 1];
        let html = `
            <header class="lsn-article-head">
                <div class="lsn-article-icon" aria-hidden="true">${lesson.icon}</div>
                <div class="lsn-article-chips">
                    <span class="chip lsn-level lsn-level-${lesson.level}"><span class="lsn-dot" aria-hidden="true"></span>${t("lessons.level." + lesson.level)}</span>
                    <span class="chip"><span aria-hidden="true">⏱</span>${t("lessons.card.minutes", { n: lesson.minutes })}</span>
                    <span class="chip lsn-chip-done" data-ref="doneChip" hidden>✓ ${t("lessons.card.done")}</span>
                </div>
                <h2 class="lsn-article-title" id="lsn-reader-title" tabindex="-1" data-fid="title" data-speak>${lessonTitle(n)}</h2>
                <p class="lsn-article-lead" data-speak>${t(lessonKey(n, "desc"))}</p>
            </header>`;

        for (let i = 1; i <= lesson.sections; i++) {
            const note = lesson.notes[i];
            const noteIcon = { fact: "✨", example: "🔎", tip: "💡" }[note];
            html += `
                <section class="lsn-part" id="lsn-part-s${i}" data-part="s${i}">
                    <h3 class="lsn-part-title" tabindex="-1" data-fid="part-s${i}"><span class="lsn-part-num mono" aria-hidden="true">${pad(i)}</span><span data-speak>${t(lessonKey(n, "s" + i + ".h"))}</span></h3>
                    <p class="lsn-part-text" data-speak>${t(lessonKey(n, "s" + i + ".p"))}</p>
                    ${note ? `
                    <aside class="lsn-note lsn-note-${note}">
                        <p class="lsn-note-label mono"><span aria-hidden="true">${noteIcon}</span> ${t("lessons.note." + note)}</p>
                        <p data-speak>${t(lessonKey(n, "s" + i + ".note"))}</p>
                    </aside>` : ""}
                </section>`;
        }

        html += `
            <section class="lsn-part lsn-lab" id="lsn-part-lab" data-part="lab" aria-labelledby="lsn-lab-title">
                <div class="lsn-lab-head">
                    <p class="lsn-lab-label mono"><span class="lsn-lab-led" aria-hidden="true"></span>${t("lessons.reader.miniLab")}</p>
                    <h3 class="lsn-lab-title" id="lsn-lab-title" tabindex="-1" data-fid="part-lab">${t("lessons.w" + n + ".title")}</h3>
                    <p class="lsn-lab-intro">${t("lessons.w" + n + ".intro")}</p>
                </div>
                <div class="lsn-lab-body" data-ref="lab"></div>
            </section>

            <section class="lsn-part lsn-keys" id="lsn-part-keys" data-part="keys">
                <h3 class="lsn-part-title" tabindex="-1" data-fid="part-keys"><span class="lsn-part-num mono" aria-hidden="true">✦</span><span data-speak>${t("lessons.reader.keyIdeas")}</span></h3>
                <ul class="lsn-keys-list">
                    ${[1, 2, 3].map(function (k) {
                        return `<li><span class="lsn-key-num mono" aria-hidden="true">${pad(k)}</span><span data-speak>${t(lessonKey(n, "key" + k))}</span></li>`;
                    }).join("")}
                </ul>
            </section>

            <aside class="lsn-try" aria-labelledby="lsn-try-label">
                <span class="lsn-try-icon" aria-hidden="true">${lesson.tryIcon}</span>
                <div class="lsn-try-body">
                    <p class="lsn-try-label mono" id="lsn-try-label">${t("lessons.reader.tryIt")}</p>
                    <p class="lsn-try-text">${t(lessonKey(n, "tip"))}</p>
                </div>
                <button type="button" class="btn btn-primary btn-small" data-action="try" data-fid="try">${t(lessonKey(n, "tipBtn"))} <span class="lsn-arrow" aria-hidden="true">→</span></button>
            </aside>

            <section class="lsn-part lsn-check" id="lsn-part-check" data-part="check" aria-labelledby="lsn-check-title">
                <h3 class="lsn-part-title" id="lsn-check-title" tabindex="-1" data-fid="part-check"><span class="lsn-part-num mono" aria-hidden="true">?</span><span>${t("lessons.reader.check")}</span></h3>
                <p class="lsn-check-question" id="lsn-check-question">${t(lessonKey(n, "q"))}</p>
                <div class="lsn-options" role="group" aria-labelledby="lsn-check-question" data-ref="options"></div>
                <div class="lsn-feedback" aria-live="polite" data-ref="feedback"></div>
            </section>`;
        return html;
    }

    // The "In this lesson" list on the left
    function tocHTML(n) {
        const lesson = LESSONS[n - 1];
        const items = [];
        for (let i = 1; i <= lesson.sections; i++) {
            items.push({ part: "s" + i, num: pad(i), text: t(lessonKey(n, "s" + i + ".h")) });
        }
        items.push({ part: "lab", num: "🧪", text: t("lessons.reader.miniLab") });
        items.push({ part: "keys", num: "✦", text: t("lessons.reader.keyIdeas") });
        items.push({ part: "check", num: "?", text: t("lessons.reader.check") });
        return items.map(function (item) {
            return `<li><button type="button" class="lsn-toc-link" data-goto="${item.part}" data-fid="toc-${item.part}">
                        <span class="lsn-toc-num mono" aria-hidden="true">${item.num}</span><span>${item.text}</span>
                    </button></li>`;
        }).join("");
    }

    // ----- "Check yourself" -----
    function renderCheck() {
        const n = reader.lesson;
        const lesson = LESSONS[n - 1];
        const options = ref(parts.article, "options");
        const feedback = ref(parts.article, "feedback");
        if (!options || !feedback) return;
        const chosen = checkAnswers[n];
        const answered = chosen !== undefined;
        const letters = t("lessons.check.letters").split("|");

        redraw(options, [0, 1, 2].map(function (i) {
            let stateClass = "";
            let mark = letters[i] || String(i + 1);
            if (answered) {
                if (i === lesson.correct) {
                    stateClass = " is-correct";
                    mark = "✓";
                } else if (i === chosen) {
                    stateClass = " is-wrong";
                    mark = "✗";
                } else {
                    stateClass = " is-dim";
                }
            }
            return `<button type="button" class="lsn-option${stateClass}" data-option="${i}" data-fid="option-${i}"
                        aria-pressed="${chosen === i}"${answered ? ' aria-disabled="true"' : ""}>
                        <span class="lsn-option-mark mono" aria-hidden="true">${mark}</span>
                        <span class="lsn-option-text">${t(lessonKey(n, "a" + (i + 1)))}</span>
                    </button>`;
        }).join(""));

        if (!answered) {
            feedback.innerHTML = "";
            return;
        }
        const isRight = chosen === lesson.correct;
        const rightAnswer = t(lessonKey(n, "a" + (lesson.correct + 1)));
        feedback.innerHTML = `
            <div class="lsn-feedback-box ${isRight ? "is-correct" : "is-wrong"}">
                <p class="lsn-feedback-title"><span aria-hidden="true">${isRight ? "🎉" : "🤔"}</span> ${t(isRight ? "lessons.check.correct" : "lessons.check.wrong")}</p>
                ${isRight ? "" : `<p>${t("lessons.check.rightAnswer", { answer: rightAnswer })}</p>`}
                <p>${t(lessonKey(n, "explain"))}</p>
                ${isRight && completed.has(n) ? `<p class="lsn-feedback-done">${t("lessons.check.autoDone")}</p>` : ""}
                ${isRight ? "" : `<button type="button" class="btn btn-ghost btn-small" data-action="retry" data-fid="retry">↺ ${t("lessons.check.retry")}</button>`}
            </div>`;
    }

    function answerCheck(choice) {
        const n = reader.lesson;
        if (checkAnswers[n] !== undefined) return;
        checkAnswers[n] = choice;
        // A right answer completes the lesson automatically
        if (choice === LESSONS[n - 1].correct && !completed.has(n)) setCompleted(n, true);
        renderCheck();
    }

    function retryCheck() {
        delete checkAnswers[reader.lesson];
        renderCheck();
        const first = parts.article.querySelector("[data-option]");
        if (first) first.focus({ preventScroll: true });
    }

    // ----- Building and updating the reader -----
    function stopLab(pause) {
        if (pause && labState[reader.lesson]) labState[reader.lesson].running = false;
        if (reader.cleanupLab) reader.cleanupLab();
        reader.cleanupLab = null;
    }

    function renderLessonContent() {
        const n = reader.lesson;
        reader.renderedLang = A.lang;
        stopLab(false);
        panel.style.setProperty("--lsn-rgb", "var(" + LESSONS[n - 1].rgb + ")");
        parts.article.innerHTML = articleHTML(n);
        parts.toc.innerHTML = tocHTML(n);
        reader.cleanupLab = mountLab(n, ref(parts.article, "lab"));
        renderCheck();
    }

    // Previous / next buttons. After the last lesson, "next" becomes "Finish".
    function setNavButton(button, target, kind) {
        const exists = target >= 1 && target <= TOTAL;
        const isFinish = kind === "next" && !exists;
        button.setAttribute("aria-disabled", String(!exists && !isFinish));
        button.classList.toggle("is-finish", isFinish);
        button.querySelector(".lsn-nav-small").textContent = t(isFinish ? "lessons.reader.finish" : "lessons.reader." + kind);
        button.querySelector(".lsn-nav-title").textContent = exists ? lessonTitle(target) : isFinish ? t("lessons.reader.finishTitle") : "";
        if (exists) button.setAttribute("aria-label", t("lessons.reader." + kind + "Label", { title: lessonTitle(target) }));
        else button.setAttribute("aria-label", t(isFinish ? "lessons.reader.finishLabel" : "lessons.reader.firstLesson"));
    }

    // Everything around the text: top bar, buttons, labels
    function updateReaderChrome() {
        const n = reader.lesson;
        if (!n) return;
        const isDone = completed.has(n);

        parts.crumb.textContent = t("lessons.reader.crumb", { n: pad(n), total: pad(TOTAL) });
        parts.keys.textContent = t("lessons.reader.keys");
        parts.tocTitle.textContent = t("lessons.reader.toc");
        parts.close.setAttribute("aria-label", t("lessons.reader.close"));
        parts.close.title = t("lessons.reader.close");

        parts.listen.hidden = !canSpeak;
        parts.listen.classList.toggle("is-on", speech.active);
        parts.listen.title = t("lessons.reader.listenLabel");
        parts.listenText.textContent = t(speech.active ? "lessons.reader.stop" : "lessons.reader.listen");

        const sizeLabel = t("lessons.reader.textSize", { size: t("lessons.reader.size." + textSize) });
        parts.size.setAttribute("aria-label", sizeLabel);
        parts.size.title = sizeLabel;

        setNavButton(parts.prev, n - 1, "prev");
        setNavButton(parts.next, n + 1, "next");

        // When the lesson is done, the button says so and shows a visible "Undo",
        // so nobody un-completes a lesson by accident without knowing it
        parts.complete.classList.toggle("is-done", isDone);
        if (isDone) {
            parts.completeText.innerHTML = '<span aria-hidden="true">✓</span> ' + esc(t("lessons.reader.completed")) +
                '<span class="lsn-complete-undo"><span aria-hidden="true">↩</span> ' + esc(t("lessons.reader.undo")) + "</span>";
            parts.complete.setAttribute("aria-label", t("lessons.reader.undoLabel"));
        } else {
            parts.completeText.textContent = t("lessons.reader.complete");
            parts.complete.removeAttribute("aria-label");
        }
        const chip = ref(parts.article, "doneChip");
        if (chip) chip.hidden = !isDone;
    }

    // Reading progress bar + highlight of the current part in the list
    let scrollFrame = 0;

    function onReaderScroll() {
        const box = parts.scroll;
        const max = box.scrollHeight - box.clientHeight;
        const ratio = max > 0 ? Math.min(1, box.scrollTop / max) : 1;
        reader.scrollRatio = ratio;
        parts.progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";

        const limit = box.getBoundingClientRect().top + box.clientHeight * 0.35;
        const sections = parts.article.querySelectorAll("[data-part]");
        let active = sections.length ? sections[0].getAttribute("data-part") : "";
        sections.forEach(function (section) {
            if (section.getBoundingClientRect().top <= limit) active = section.getAttribute("data-part");
        });
        if (ratio > 0.985 && sections.length) active = sections[sections.length - 1].getAttribute("data-part");
        parts.toc.querySelectorAll("[data-goto]").forEach(function (link) {
            if (link.getAttribute("data-goto") === active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
    }

    parts.scroll.addEventListener("scroll", function () {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(function () {
            scrollFrame = 0;
            onReaderScroll();
        });
    }, { passive: true });

    function goToPart(name) {
        const target = parts.article.querySelector('[data-part="' + name + '"]');
        if (!target) return;
        const box = parts.scroll;
        const top = target.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 18;
        box.scrollTo({ top: top, behavior: A.reducedMotion ? "auto" : "smooth" });
        const heading = target.querySelector("[tabindex='-1']");
        if (heading) heading.focus({ preventScroll: true });
    }

    // Shows lesson n in the (already open) reader
    function showLesson(n) {
        stopSpeaking();
        stopLab(true);
        reader.lesson = n;
        renderLessonContent();
        updateReaderChrome();
        parts.scroll.scrollTop = 0;
        onReaderScroll();
        setHash("#lesson-" + n);
        if (!A.reducedMotion) {
            parts.article.classList.remove("is-entering");
            void parts.article.offsetWidth;   // restart the fade-in animation
            parts.article.classList.add("is-entering");
        }
        const title = parts.article.querySelector("#lsn-reader-title");
        if (title) title.focus({ preventScroll: true });
    }

    function goRelative(step) {
        const target = reader.lesson + step;
        if (target >= 1 && target <= TOTAL) showLesson(target);
    }

    function toggleComplete() {
        setCompleted(reader.lesson, !completed.has(reader.lesson));
        renderCheck();
    }

    function cycleTextSize() {
        textSize = SIZES[(SIZES.indexOf(textSize) + 1) % SIZES.length];
        A.storage.set("lessons.textSize", textSize);
        readerEl.setAttribute("data-size", textSize);
        updateReaderChrome();
        onReaderScroll();
    }

    // Moves the keyboard focus to the heading of a page section (without scrolling)
    function focusSectionHeading(sectionId) {
        const section = document.getElementById(sectionId);
        const heading = section && section.querySelector("h1, h2");
        if (!heading) return;
        if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
    }

    // "Try it on this site": close the reader and jump to the right place
    function runTryIt() {
        const target = LESSONS[reader.lesson - 1].tryIt;
        closeReader({ restoreFocus: false });
        requestAnimationFrame(function () {
            const sectionId = target === "classifier" || target === "predictor" ? "lab" : target;
            focusSectionHeading(sectionId);
            if (sectionId === "lab" && typeof A.openLab === "function") A.openLab(target);
            else if (sectionId === "quiz" && typeof A.startQuiz === "function") A.startQuiz();
            else A.scrollToSection(sectionId);
        });
    }

    // ----- Keeping the page still and the focus inside while the reader is open -----
    function lockPage() {
        const gap = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        if (gap > 0) document.body.style.paddingRight = gap + "px";
        reader.inerted = [];
        document.querySelectorAll('body > header, body > main, body > footer, body > .skip-link, [data-feature="assistant"]').forEach(function (element) {
            if (!element.inert) {
                element.inert = true;
                reader.inerted.push(element);
            }
        });
    }

    function unlockPage() {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        reader.inerted.forEach(function (element) { element.inert = false; });
        reader.inerted = [];
    }

    function focusableIn(root) {
        return Array.prototype.slice.call(root.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(function (element) {
            return !element.disabled && !element.closest("[hidden]") && element.getClientRects().length > 0;
        });
    }

    function trapFocus(event) {
        const items = focusableIn(panel);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (!panel.contains(active)) {
            event.preventDefault();
            first.focus();
        } else if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function setHash(hash) {
        try {
            history.replaceState(history.state, "", hash || window.location.pathname + window.location.search);
        } catch (error) {}
    }

    function scrollCardIntoView(n) {
        const card = document.getElementById("lesson-card-" + n);
        if (!card) return;
        const box = card.getBoundingClientRect();
        const top = window.scrollY + box.top - Math.max(0, (window.innerHeight - box.height) / 2);
        window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }

    // Can the keyboard focus go back to this element when the reader closes?
    function canTakeFocus(element) {
        return Boolean(element && element.isConnected && typeof element.focus === "function" &&
            element !== document.body && element !== document.documentElement &&
            !readerEl.contains(element) && !element.closest("[inert], [hidden]") &&
            element.getClientRects().length > 0);
    }

    function openLesson(number, opener) {
        const n = Number(number);
        if (!Number.isInteger(n) || n < 1 || n > TOTAL) return;
        if (reader.open) {
            if (n !== reader.lesson) showLesson(n);
            return;
        }
        clearTimeout(reader.closeTimer);
        reader.open = true;
        reader.opener = canTakeFocus(opener) ? opener : null;
        // Without a button to come back to, closing returns to the lesson's card
        if (!reader.opener) scrollCardIntoView(n);
        const hash = window.location.hash;
        reader.previousHash = /^#lesson-\d$/.test(hash) ? "" : hash;

        wrapPaletteCommands();
        lockPage();
        document.body.classList.add("lsn-reading");
        readerEl.hidden = false;
        readerEl.classList.remove("is-closing");
        void readerEl.offsetWidth;   // lets the opening animation start from the beginning
        readerEl.classList.add("is-open");
        updatePaused();
        showLesson(n);
    }

    // options.restoreFocus = false: another part of the page takes the focus
    // options.keepHash = true: leave the address bar alone (the Back button changed it)
    function closeReader(options) {
        if (!reader.open) return;
        const settings = options || {};
        reader.open = false;
        stopSpeaking();
        stopLab(true);
        readerEl.classList.remove("is-open");
        document.body.classList.remove("lsn-reading");
        updatePaused();
        unlockPage();
        if (!settings.keepHash) setHash(reader.previousHash);

        const finish = function () {
            readerEl.hidden = true;
            readerEl.classList.remove("is-closing");
        };
        if (A.reducedMotion) {
            finish();
        } else {
            readerEl.classList.add("is-closing");
            reader.closeTimer = setTimeout(finish, 260);
        }

        if (settings.restoreFocus !== false) {
            // Back to the button that opened the reader. If there is none, go to the
            // card of the lesson you were reading (scrolled into view, so the focus ring is visible).
            if (canTakeFocus(reader.opener)) {
                reader.opener.focus({ preventScroll: true });
            } else {
                const card = mount.querySelector("#lesson-card-" + reader.lesson + " [data-open]");
                if (card) {
                    scrollCardIntoView(reader.lesson);
                    card.focus({ preventScroll: true });
                }
            }
        }
    }

    // ----- Clicks and keys inside the reader -----
    readerEl.addEventListener("click", function (event) {
        const target = event.target.closest("[data-action], [data-option], [data-goto]");
        if (!target || !readerEl.contains(target)) return;
        if (target.getAttribute("aria-disabled") === "true") return;

        if (target.hasAttribute("data-option")) {
            answerCheck(Number(target.getAttribute("data-option")));
            return;
        }
        if (target.hasAttribute("data-goto")) {
            goToPart(target.getAttribute("data-goto"));
            return;
        }
        switch (target.getAttribute("data-action")) {
            case "close": closeReader(); break;
            case "prev": goRelative(-1); break;
            case "next":
                if (reader.lesson === TOTAL) closeReader();
                else goRelative(1);
                break;
            case "complete": toggleComplete(); break;
            case "listen":
                if (speech.active) stopSpeaking();
                else startSpeaking();
                break;
            case "size": cycleTextSize(); break;
            case "try": runTryIt(); break;
            case "retry": retryCheck(); break;
        }
    });

    document.addEventListener("keydown", function (event) {
        if (!reader.open) return;
        // Only react when the focus is in the reader (or lost on the page body),
        // so a palette or another dialog on top keeps its own keys.
        const target = event.target;
        if (!readerEl.contains(target) && target !== document.body && target !== document.documentElement) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeReader();
        } else if (event.key === "Tab") {
            trapFocus(event);
        } else if ((event.key === "ArrowLeft" || event.key === "ArrowRight") &&
                   !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
            const tag = target.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
            event.preventDefault();
            goRelative(event.key === "ArrowLeft" ? -1 : 1);
        }
    });

    // ---------- 25. Reading aloud (the browser's built-in speech) ----------
    const canSpeak = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
    const speech = { active: false, session: 0, element: null, warnedAt: 0 };

    function markSpeaking(element) {
        if (speech.element) speech.element.classList.remove("is-speaking");
        speech.element = element;
        if (!element) return;
        element.classList.add("is-speaking");
        const box = parts.scroll.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        if (rect.top < box.top + 40 || rect.bottom > box.bottom - 40) {
            element.scrollIntoView({ block: "center", behavior: A.reducedMotion ? "auto" : "smooth" });
        }
    }

    function stopSpeaking() {
        if (!canSpeak) return;
        const wasActive = speech.active;
        speech.active = false;
        speech.session += 1;
        if (wasActive) window.speechSynthesis.cancel();
        markSpeaking(null);
        if (reader.lesson) updateReaderChrome();
    }

    function startSpeaking() {
        if (!canSpeak) return;
        stopSpeaking();
        window.speechSynthesis.cancel();

        // Split the lesson into sentences: short pieces are read more reliably
        const chunks = [];
        parts.article.querySelectorAll("[data-speak]").forEach(function (element) {
            const text = element.textContent.replace(/\s+/g, " ").trim();
            (text.match(/[^.!?…]+[.!?…]*["»”)]*\s*/g) || [text]).forEach(function (sentence) {
                if (sentence.trim()) chunks.push({ element: element, text: sentence.trim() });
            });
        });

        const langCode = A.lang === "ru" ? "ru" : "en";
        const voice = window.speechSynthesis.getVoices().filter(function (item) {
            return item.lang && item.lang.toLowerCase().indexOf(langCode) === 0;
        })[0] || null;

        speech.active = true;
        speech.session += 1;
        const session = speech.session;
        let index = 0;
        let started = false;

        function next() {
            if (session !== speech.session) return;
            if (index >= chunks.length) {
                stopSpeaking();
                return;
            }
            const chunk = chunks[index];
            index += 1;
            markSpeaking(chunk.element);
            const utterance = new window.SpeechSynthesisUtterance(chunk.text);
            utterance.lang = langCode === "ru" ? "ru-RU" : "en-US";
            if (voice) utterance.voice = voice;
            utterance.onstart = function () { started = true; };
            utterance.onend = next;
            utterance.onerror = function (event) {
                if (session !== speech.session) return;
                if (event.error === "interrupted" || event.error === "canceled") return;
                stopSpeaking();
                // Only warn once every few seconds, even if the button is pressed again
                if (!started && Date.now() - speech.warnedAt > 5000) {
                    speech.warnedAt = Date.now();
                    A.toast(t("lessons.reader.noSpeech"), "🔇");
                }
            };
            window.speechSynthesis.speak(utterance);
        }

        next();
        updateReaderChrome();
    }

    // ---------- 26. Commands for the Ctrl+K palette + API for other features ----------
    LESSONS.forEach(function (lesson) {
        A.registerCommand({
            id: "lesson-" + lesson.number,
            group: "lessons.cmdGroup",
            icon: lesson.icon,
            title: function () { return t("lessons.cmdOpen", { title: lessonTitle(lesson.number) }); },
            keywords: "lesson урок " + lesson.number + " " + lesson.keywords,
            // The palette gives the focus back before running a command, so the
            // focused element is where the reader returns to when it closes
            run: function () { openLesson(lesson.number, document.activeElement); }
        });
    });

    A.registerCommand({
        id: "lessons-continue",
        group: "lessons.cmdGroup",
        icon: "▶️",
        title: function () { return t("lessons.cmdContinue"); },
        keywords: "continue next lesson learning продолжить следующий урок обучение",
        run: function () { openLesson(nextLesson() || 1, document.activeElement); }
    });

    // Other features open a lesson with AICompass.openLesson(3).
    // Closing the reader brings the focus back to the button they used.
    A.openLesson = function (number) {
        openLesson(number, document.activeElement);
    };

    A.closeLesson = function () {
        closeReader({ restoreFocus: false });
    };

    // While the reader is open, anything that takes you to another part of the page
    // would happen hidden behind it. So these close the reader first:
    // 1) AICompass.scrollToSection(), used by the lab, quiz, glossary and assistant
    let handingOver = false;   // true while another feature takes over from the reader
    const coreScrollToSection = A.scrollToSection;
    A.scrollToSection = function (id) {
        if (reader.open || handingOver) {
            closeReader({ restoreFocus: false });   // does nothing if it is already closed
            focusSectionHeading(id);
        }
        return coreScrollToSection.apply(A, arguments);
    };

    // 2) Ctrl+K commands that go somewhere, like "Go to Glossary" or "Ask Compass Bot",
    //    and the glossary / assistant functions the palette calls directly.
    //    Quick actions (theme, language...) and the lesson commands keep the reader open.
    //    This runs every time the reader opens, so things added later are included.
    const KEEP_READER_GROUPS = ["cmd.groupActions", "lessons.cmdGroup"];

    // Wraps owner[name] so it closes the reader before it runs
    function closeReaderFirst(owner, name, sectionId) {
        const original = owner && owner[name];
        if (typeof original !== "function" || original.lsnClosesReader) return;
        const wrapped = function () {
            if (!reader.open) return original.apply(this, arguments);
            closeReader({ restoreFocus: false });
            // The focus goes to the section's heading, or back to the button that opened
            // the reader. The feature can still move it (for example into its own text box).
            if (sectionId) focusSectionHeading(sectionId);
            else if (canTakeFocus(reader.opener)) reader.opener.focus({ preventScroll: true });
            handingOver = true;
            try {
                return original.apply(this, arguments);
            } finally {
                handingOver = false;
            }
        };
        wrapped.lsnClosesReader = true;
        owner[name] = wrapped;
    }

    function wrapPaletteCommands() {
        (A.commands || []).forEach(function (command) {
            if (!command || KEEP_READER_GROUPS.indexOf(command.group) !== -1) return;
            const section = /^go-([a-z]+)$/.exec(String(command.id || ""));
            closeReaderFirst(command, "run", section ? section[1] : "");
        });
        closeReaderFirst(A.glossary, "show", "glossary");
        if (A.assistant) {
            ["open", "ask", "toggle"].forEach(function (name) { closeReaderFirst(A.assistant, name); });
        }
    }

    A.lessons = LESSONS.map(function (lesson) {
        return {
            number: lesson.number,
            icon: lesson.icon,
            title: function () { return lessonTitle(lesson.number); },
            description: function () { return t(lessonKey(lesson.number, "desc")); }
        };
    });

    // ---------- 27. Language and theme changes ----------
    A.onLanguageChange(function () {
        updateHUD();
        updateCards();
        if (!cert.root.hidden) drawCertificate();
        // Core also sends this event once when the page starts: nothing to redo then
        if (!reader.open || reader.renderedLang === A.lang) return;

        // Re-draw the open lesson in the new language, keeping its place, answers and focus
        const ratio = reader.scrollRatio;
        const active = document.activeElement;
        const focusWasInside = Boolean(active) && readerEl.contains(active);
        const fid = focusWasInside ? active.getAttribute("data-fid") : null;
        stopSpeaking();
        renderLessonContent();
        updateReaderChrome();
        const box = parts.scroll;
        box.scrollTop = ratio * (box.scrollHeight - box.clientHeight);
        onReaderScroll();
        if (focusWasInside && !active.isConnected) {
            const again = fid ? readerEl.querySelector('[data-fid="' + fid + '"]') : null;
            const target = again || parts.article.querySelector("#lsn-reader-title");
            if (target) target.focus({ preventScroll: true });
        }
    });

    A.onThemeChange(function () {
        scheduleCertificate();
    });

    // Fonts arrive a little later: redraw the certificate with them
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(scheduleCertificate);
    }

    // ---------- 28. Start ----------
    updateHUD();
    updateCards();

    // A link like index.html#lesson-3 opens that lesson
    function lessonFromHash() {
        const match = /^#lesson-([1-6])$/.exec(window.location.hash);
        return match ? Number(match[1]) : 0;
    }

    // The Back / Forward buttons change the hash: open the lesson, or close the reader
    window.addEventListener("hashchange", function () {
        const n = lessonFromHash();
        if (n) openLesson(n, document.activeElement);
        else if (reader.open) closeReader({ keepHash: true });
    });

    function openFromHash() {
        const n = lessonFromHash();
        if (n) openLesson(n);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", openFromHash);
    } else {
        openFromHash();
    }
})();
