/* =========================================================
   AI COMPASS — TEXTS AND DATA: MY PATH (the personal learning plan)
   The texts of the "My path" page and of its study window, in English
   and in Russian (informal "ты"), then the data (at the bottom): who can
   be learning, the stages of the path, the guided courses, the memory
   boxes.
   Used by js/learn.js (the page) and js/learn-play.js (the study
   window: the level check, the memory check, the guided steps and
   "Explain it back").
   The steps of the guided courses are not here: each course has its
   own file in js/content/courses/, loaded when it is opened.
   To change a text, change it here, in both languages.
   Numbers and names in {braces} are filled in by the scripts.
   ========================================================= */

// The menu link, the page's title, and the card on the home page
window.AICompass.addTranslations({
    en: {
        "nav.learn": "My path",
        "learn.label": "YOUR PERSONAL PLAN",
        "learn.title": "My learning path",
        "learn.subtitle": "Say who is learning and get a path that fits: small daily steps, practice with feedback, and reviews that come back just before you would forget.",

        "learn.home.kicker": "My path",
        "learn.home.newTitle": "Not sure where to start?",
        "learn.home.newText": "Answer three questions and get your own path, from the very first idea to the maths inside.",
        "learn.home.newButton": "Build my path",
        "learn.home.orText": "Want a plan made just for you?",
        "learn.home.title": "Your plan for today",
        "learn.home.button": "Start today's session",
        "learn.home.doneTitle": "Done for today",
        "learn.home.doneText": "Come back tomorrow: that is when the next review works best.",
        "learn.home.doneButton": "Open my path",
        "learn.home.steps.one": "{n} step left",
        "learn.home.steps.many": "{n} steps left"
    },
    ru: {
        "nav.learn": "Мой путь",
        "learn.label": "ТВОЙ ЛИЧНЫЙ ПЛАН",
        "learn.title": "Мой путь в ИИ",
        "learn.subtitle": "Скажи, кто учится, и получи путь по своему уровню: маленькие шаги каждый день, практика с объяснениями и повторения, которые приходят как раз перед тем, как ты забудешь.",

        "learn.home.kicker": "Мой путь",
        "learn.home.newTitle": "Не знаешь, с чего начать?",
        "learn.home.newText": "Ответь на три вопроса и получи свой путь: от самой первой идеи до математики внутри.",
        "learn.home.newButton": "Построить мой путь",
        "learn.home.orText": "Хочешь план именно для тебя?",
        "learn.home.title": "Твой план на сегодня",
        "learn.home.button": "Начать занятие",
        "learn.home.doneTitle": "На сегодня всё",
        "learn.home.doneText": "Возвращайся завтра: именно тогда повторение работает лучше всего.",
        "learn.home.doneButton": "Открыть мой путь",
        "learn.home.steps.one": "Остался {n} шаг",
        "learn.home.steps.few": "Осталось {n} шага",
        "learn.home.steps.many": "Осталось {n} шагов"
    }
});

// The setup: three questions
window.AICompass.addTranslations({
    en: {
        "learn.setup.kicker": "Question {n} of 3",
        "learn.setup.whoTitle": "Who is learning?",
        "learn.setup.whoText": "Pick the one that fits best. You can change it at any time.",
        "learn.who.kid": "Young explorer",
        "learn.who.kid.age": "about 8 to 11 years old",
        "learn.who.kid.text": "Tiny steps, simple words and a Listen button on every step.",
        "learn.who.teen": "Student",
        "learn.who.teen.age": "about 12 to 17",
        "learn.who.teen.text": "Short lessons, experiments and a daily plan that fits around school.",
        "learn.who.adult": "Adult beginner",
        "learn.who.adult.age": "any age",
        "learn.who.adult.text": "From the first idea to using AI with confidence at work and at home.",
        "learn.who.teacher": "Teacher or parent",
        "learn.who.teacher.age": "learning it to teach it",
        "learn.who.teacher.text": "Learn it yourself first, then take the ready lesson plans to your class.",
        "learn.who.pro": "Pro or developer",
        "learn.who.pro.age": "you code or work with data",
        "learn.who.pro.text": "Skip ahead with a level check, then do the maths by hand: neurons, gradients, metrics, attention.",

        "learn.setup.startTitle": "Where do you want to start?",
        "learn.setup.startText": "Nothing is locked: this only decides where your path begins.",
        "learn.start.zero": "From zero",
        "learn.start.zero.text": "I have never learned how AI works. Start with what a program and data are.",
        "learn.start.some": "I know a little",
        "learn.start.some.text": "I have used chatbots and heard the words. Start with the basics.",
        "learn.start.check": "Find my level",
        "learn.start.check.text": "A check of about 8 questions, 2 minutes. No grades: it only places you on the path.",

        "learn.setup.goalTitle": "How much time on a learning day?",
        "learn.setup.goalText": "Little and often works better than one long evening.",
        "learn.goal.5": "5 minutes",
        "learn.goal.5.text": "A quick memory check and one small step.",
        "learn.goal.10": "10 minutes",
        "learn.goal.10.text": "A memory check, a lesson and one experiment.",
        "learn.goal.20": "20 minutes",
        "learn.goal.20.text": "The full session, with explaining it back.",

        "learn.setup.back": "Back",
        "learn.setup.finish": "Build my path",
        "learn.setup.finishCheck": "Start the level check",
        "learn.setup.privacy": "Your answers stay in this browser. No account, and nothing is sent anywhere.",
        "learn.setup.ready": "Your path is ready. It starts at “{stage}”.",
        "learn.setup.changed": "Saved. Your path now starts at “{stage}”."
    },
    ru: {
        "learn.setup.kicker": "Вопрос {n} из 3",
        "learn.setup.whoTitle": "Кто учится?",
        "learn.setup.whoText": "Выбери то, что подходит больше всего. Это можно поменять в любой момент.",
        "learn.who.kid": "Юный исследователь",
        "learn.who.kid.age": "примерно 8–11 лет",
        "learn.who.kid.text": "Крошечные шаги, простые слова и кнопка «Слушать» на каждом шаге.",
        "learn.who.teen": "Школьник",
        "learn.who.teen.age": "примерно 12–17 лет",
        "learn.who.teen.text": "Короткие уроки, эксперименты и план на день, который не мешает школе.",
        "learn.who.adult": "Взрослый новичок",
        "learn.who.adult.age": "любой возраст",
        "learn.who.adult.text": "От первой идеи до уверенной работы с ИИ на работе и дома.",
        "learn.who.teacher": "Учитель или родитель",
        "learn.who.teacher.age": "учусь, чтобы объяснять",
        "learn.who.teacher.text": "Сначала разберись сам, а потом возьми готовые планы уроков в свой класс.",
        "learn.who.pro": "Профи или разработчик",
        "learn.who.pro.age": "пишешь код или работаешь с данными",
        "learn.who.pro.text": "Проверь уровень и иди дальше: математика своими руками — нейроны, градиенты, метрики, внимание.",

        "learn.setup.startTitle": "С чего ты хочешь начать?",
        "learn.setup.startText": "Ничего не закрыто: этот ответ только решает, где начинается твой путь.",
        "learn.start.zero": "С нуля",
        "learn.start.zero.text": "Я никогда не изучал, как работает ИИ. Начнём с того, что такое программа и данные.",
        "learn.start.some": "Кое-что знаю",
        "learn.start.some.text": "Я пользовался чат-ботами и слышал эти слова. Начнём с основ.",
        "learn.start.check": "Найти мой уровень",
        "learn.start.check.text": "Проверка примерно из 8 вопросов, 2 минуты. Без оценок: она только выбирает место на пути.",

        "learn.setup.goalTitle": "Сколько времени в учебный день?",
        "learn.setup.goalText": "Понемногу, но часто — лучше, чем один длинный вечер.",
        "learn.goal.5": "5 минут",
        "learn.goal.5.text": "Быстрая проверка памяти и один маленький шаг.",
        "learn.goal.10": "10 минут",
        "learn.goal.10.text": "Проверка памяти, урок и один эксперимент.",
        "learn.goal.20": "20 минут",
        "learn.goal.20.text": "Полное занятие, с объяснением своими словами.",

        "learn.setup.back": "Назад",
        "learn.setup.finish": "Построить мой путь",
        "learn.setup.finishCheck": "Начать проверку уровня",
        "learn.setup.privacy": "Твои ответы остаются в этом браузере. Без аккаунта, ничего никуда не отправляется.",
        "learn.setup.ready": "Твой путь готов. Он начинается с этапа «{stage}».",
        "learn.setup.changed": "Сохранено. Теперь твой путь начинается с этапа «{stage}»."
    }
});

// The page once the path exists: who is learning, today's session, the path, the memory
window.AICompass.addTranslations({
    en: {
        "learn.me.as": "Learning as",
        "learn.me.goal": "{n} min a day",
        "learn.me.change": "Change",
        "learn.me.streak.one": "{n} day in a row",
        "learn.me.streak.many": "{n} days in a row",
        "learn.me.days.one": "{n} learning day",
        "learn.me.days.many": "{n} learning days",
        "learn.me.noDays": "Your first learning day",
        "learn.me.kidTip": "Tip: press “Listen” on any step and the site reads it to you.",
        "learn.me.proTip": "Tip: the Pro design shows more numbers on this page.",
        "learn.me.proButton": "Switch to Pro",
        "learn.me.teacherTip": "Teaching a class? Every lesson has a ready plan, a worksheet and an answer key.",
        "learn.me.teacherButton": "Open “For teachers”",

        "learn.today.title": "Today's session",
        "learn.today.about": "About {n} minutes",
        "learn.today.progress": "{done} of {total} steps done",
        "learn.today.start": "Start",
        "learn.today.go": "Go",
        "learn.today.done": "Done",
        "learn.today.review": "Memory check",
        "learn.today.review.text.one": "{n} card is ready. Answer it from memory.",
        "learn.today.review.text.many": "{n} cards are ready. Answer them from memory.",
        "learn.today.next": "Your next step",
        "learn.today.next.none": "You have finished every step of the path. Keep your memory strong with the checks.",
        "learn.today.lab": "Try it with your hands",
        "learn.today.lab.text": "“{title}” in the AI Lab",
        "learn.today.explain": "Explain it back",
        "learn.today.explain.text": "Lesson {n}, “{title}”, in your own words",
        "learn.today.allTitle": "Done for today!",
        "learn.today.allText": "Come back tomorrow: that is when the next review works best.",
        "learn.today.tomorrow.one": "Tomorrow {n} card will be ready.",
        "learn.today.tomorrow.many": "Tomorrow {n} cards will be ready.",
        "learn.today.more": "Practise a little more",

        "learn.path.title": "Your path",
        "learn.path.text": "Five stages, from the very first idea to the maths inside. Everything is open: the marker only shows the best next step.",
        "learn.path.stage": "Stage {n}",
        "learn.path.count": "{done} of {total}",
        "learn.path.next": "Next step",
        "learn.path.show": "Show the steps",
        "learn.path.hide": "Hide the steps",
        "learn.path.state.start": "Start here",
        "learn.path.state.progress": "In progress",
        "learn.path.state.done": "Done",
        "learn.path.state.known": "You know this",
        "learn.path.state.later": "Later",
        "learn.path.explained": "Explained in your own words",
        "learn.path.kind.guide": "Step by step · {n} min",
        "learn.path.kind.lesson": "Lesson {number} · {n} min",
        "learn.path.kind.test.one": "{n} question · about 3 min",
        "learn.path.kind.test.many": "{n} questions · about 3 min",
        "learn.path.test": "Stage test",
        "learn.path.testText": "Mixed questions from this stage. {pass} right answers out of {total} earn the stage star.",
        "learn.path.testBest": "Best: {score} of {total}",
        "learn.path.star": "Stage star earned",
        "learn.path.optional": "Optional for you: skim it or skip it.",

        "learn.stage.zero": "Start from zero",
        "learn.stage.zero.text": "What a program is, how everything becomes numbers, and the two ways to make a computer smart. No knowledge needed.",
        "learn.stage.basics": "The basics",
        "learn.stage.basics.text": "What AI is, how machines learn, neural networks, chatbots and safety.",
        "learn.stage.deep": "Deep dive",
        "learn.stage.deep.text": "How AI sees, plays, writes and creates, and when you can trust it.",
        "learn.stage.world": "AI in your world",
        "learn.stage.world.text": "Data, the apps that choose for you, and planning your own AI project.",
        "learn.stage.pro": "Under the hood",
        "learn.stage.pro.text": "The real maths, done by hand: a neuron, gradient descent, measuring a model, attention.",

        "learn.unit.z1": "What is a program?",
        "learn.unit.z1.text": "A computer follows instructions, one by one.",
        "learn.unit.z2": "Everything is numbers",
        "learn.unit.z2.text": "How letters, pictures and sounds live inside a computer.",
        "learn.unit.z3": "Rules or examples?",
        "learn.unit.z3.text": "Two ways to make a computer do a task.",
        "learn.unit.z4": "How learning works: you and the machine",
        "learn.unit.z4.text": "Why you forget, and how to make knowledge stay.",
        "learn.unit.p1": "A neuron by hand",
        "learn.unit.p1.text": "Weighted sums, activations and counting parameters.",
        "learn.unit.p2": "Gradient descent by hand",
        "learn.unit.p2.text": "Take the steps yourself and watch the learning rate bite.",
        "learn.unit.p3": "Measure a classifier",
        "learn.unit.p3.text": "Confusion matrix, precision, recall, F1 and the accuracy trap.",
        "learn.unit.p4": "Tokens, embeddings and attention",
        "learn.unit.p4.text": "Dot products, softmax and why transformers scale as n².",

        "learn.skills.title": "What you remember",
        "learn.skills.text": "Every answer moves a card to a stronger or a weaker box. Strong cards come back less often, weak ones sooner.",
        "learn.skills.inMemory": "Cards in memory",
        "learn.skills.due": "Ready today",
        "learn.skills.strong": "Strong",
        "learn.skills.empty": "Finish a lesson or a guided step and its questions will appear here, ready to review the next day.",
        "learn.skills.practise": "Practise",
        "learn.skills.practiseTopic": "Practise “{topic}”",
        "learn.skills.state.new": "New",
        "learn.skills.state.learning": "Learning",
        "learn.skills.state.strong": "Strong",
        "learn.skills.cards.one": "{n} card",
        "learn.skills.cards.many": "{n} cards",
        "learn.skills.boxes": "Memory boxes",
        "learn.skills.box": "Box {n}",
        "learn.skills.boxWait.one": "back after {n} day",
        "learn.skills.boxWait.many": "back after {n} days",
        "learn.skills.forecast": "Reviews in the next 14 days",
        "learn.skills.accuracy": "Right answers so far",
        "learn.skills.reviewNow": "Start the memory check",
        "learn.topic.foundations": "Foundations",
        "learn.topic.maths": "The maths inside"
    },
    ru: {
        "learn.me.as": "Учится",
        "learn.me.goal": "{n} мин в день",
        "learn.me.change": "Изменить",
        "learn.me.streak.one": "{n} день подряд",
        "learn.me.streak.few": "{n} дня подряд",
        "learn.me.streak.many": "{n} дней подряд",
        "learn.me.days.one": "{n} учебный день",
        "learn.me.days.few": "{n} учебных дня",
        "learn.me.days.many": "{n} учебных дней",
        "learn.me.noDays": "Твой первый учебный день",
        "learn.me.kidTip": "Совет: нажми «Слушать» на любом шаге, и сайт прочитает его вслух.",
        "learn.me.proTip": "Совет: в дизайне «Про» на этой странице больше чисел.",
        "learn.me.proButton": "Включить «Про»",
        "learn.me.teacherTip": "Ведёте класс? У каждого урока есть готовый план, рабочий лист и ответы.",
        "learn.me.teacherButton": "Открыть раздел «Учителям»",

        "learn.today.title": "Занятие на сегодня",
        "learn.today.about": "Примерно {n} минут",
        "learn.today.progress": "Сделано шагов: {done} из {total}",
        "learn.today.start": "Начать",
        "learn.today.go": "Вперёд",
        "learn.today.done": "Готово",
        "learn.today.review": "Проверка памяти",
        "learn.today.review.text.one": "Готова {n} карточка. Ответь по памяти.",
        "learn.today.review.text.few": "Готовы {n} карточки. Ответь по памяти.",
        "learn.today.review.text.many": "Готово {n} карточек. Ответь по памяти.",
        "learn.today.next": "Твой следующий шаг",
        "learn.today.next.none": "Все шаги пути пройдены. Поддерживай память проверками.",
        "learn.today.lab": "Попробуй своими руками",
        "learn.today.lab.text": "«{title}» в ИИ-лаборатории",
        "learn.today.explain": "Объясни своими словами",
        "learn.today.explain.text": "Урок {n}, «{title}»: расскажи, как понимаешь",
        "learn.today.allTitle": "На сегодня всё!",
        "learn.today.allText": "Возвращайся завтра: именно тогда повторение работает лучше всего.",
        "learn.today.tomorrow.one": "Завтра будет готова {n} карточка.",
        "learn.today.tomorrow.few": "Завтра будут готовы {n} карточки.",
        "learn.today.tomorrow.many": "Завтра будет готово {n} карточек.",
        "learn.today.more": "Потренироваться ещё немного",

        "learn.path.title": "Твой путь",
        "learn.path.text": "Пять этапов: от самой первой идеи до математики внутри. Всё открыто: метка только показывает лучший следующий шаг.",
        "learn.path.stage": "Этап {n}",
        "learn.path.count": "{done} из {total}",
        "learn.path.next": "Следующий шаг",
        "learn.path.show": "Показать шаги",
        "learn.path.hide": "Скрыть шаги",
        "learn.path.state.start": "Начни здесь",
        "learn.path.state.progress": "В процессе",
        "learn.path.state.done": "Пройдено",
        "learn.path.state.known": "Ты это знаешь",
        "learn.path.state.later": "Позже",
        "learn.path.explained": "Объяснено своими словами",
        "learn.path.kind.guide": "Шаг за шагом · {n} мин",
        "learn.path.kind.lesson": "Урок {number} · {n} мин",
        "learn.path.kind.test.one": "{n} вопрос · около 3 мин",
        "learn.path.kind.test.few": "{n} вопроса · около 3 мин",
        "learn.path.kind.test.many": "{n} вопросов · около 3 мин",
        "learn.path.test": "Тест этапа",
        "learn.path.testText": "Вопросы вперемешку из этого этапа. Правильных ответов для звезды этапа: {pass} из {total}.",
        "learn.path.testBest": "Лучший результат: {score} из {total}",
        "learn.path.star": "Звезда этапа получена",
        "learn.path.optional": "Для тебя необязательно: пролистай или пропусти.",

        "learn.stage.zero": "С нуля",
        "learn.stage.zero.text": "Что такое программа, как всё превращается в числа и два способа сделать компьютер умным. Знать ничего не нужно.",
        "learn.stage.basics": "Основы",
        "learn.stage.basics.text": "Что такое ИИ, как учатся машины, нейросети, чат-боты и безопасность.",
        "learn.stage.deep": "Погружение",
        "learn.stage.deep.text": "Как ИИ видит, играет, пишет и творит — и когда ему можно доверять.",
        "learn.stage.world": "ИИ вокруг тебя",
        "learn.stage.world.text": "Данные, приложения, которые выбирают за тебя, и план собственного ИИ-проекта.",
        "learn.stage.pro": "Под капотом",
        "learn.stage.pro.text": "Настоящая математика своими руками: нейрон, градиентный спуск, оценка модели, внимание.",

        "learn.unit.z1": "Что такое программа?",
        "learn.unit.z1.text": "Компьютер выполняет инструкции, одну за другой.",
        "learn.unit.z2": "Всё — это числа",
        "learn.unit.z2.text": "Как буквы, картинки и звуки живут внутри компьютера.",
        "learn.unit.z3": "Правила или примеры?",
        "learn.unit.z3.text": "Два способа научить компьютер делать задачу.",
        "learn.unit.z4": "Как устроено обучение: ты и машина",
        "learn.unit.z4.text": "Почему ты забываешь и как сделать, чтобы знания остались.",
        "learn.unit.p1": "Нейрон своими руками",
        "learn.unit.p1.text": "Взвешенные суммы, функции активации и подсчёт параметров.",
        "learn.unit.p2": "Градиентный спуск своими руками",
        "learn.unit.p2.text": "Сделай шаги сам и посмотри, как кусается скорость обучения.",
        "learn.unit.p3": "Измерь классификатор",
        "learn.unit.p3.text": "Матрица ошибок, точность, полнота, F1 и ловушка accuracy.",
        "learn.unit.p4": "Токены, эмбеддинги и внимание",
        "learn.unit.p4.text": "Скалярные произведения, softmax и почему трансформеры растут как n².",

        "learn.skills.title": "Что ты помнишь",
        "learn.skills.text": "Каждый ответ переносит карточку в коробку посильнее или послабее. Сильные карточки приходят реже, слабые — раньше.",
        "learn.skills.inMemory": "Карточек в памяти",
        "learn.skills.due": "Готово сегодня",
        "learn.skills.strong": "Сильные",
        "learn.skills.empty": "Пройди урок или шаг пути — его вопросы появятся здесь и будут готовы к повторению на следующий день.",
        "learn.skills.practise": "Тренировать",
        "learn.skills.practiseTopic": "Тренировать тему «{topic}»",
        "learn.skills.state.new": "Новое",
        "learn.skills.state.learning": "Учу",
        "learn.skills.state.strong": "Крепко",
        "learn.skills.cards.one": "{n} карточка",
        "learn.skills.cards.few": "{n} карточки",
        "learn.skills.cards.many": "{n} карточек",
        "learn.skills.boxes": "Коробки памяти",
        "learn.skills.box": "Коробка {n}",
        "learn.skills.boxWait.one": "вернётся через {n} день",
        "learn.skills.boxWait.few": "вернётся через {n} дня",
        "learn.skills.boxWait.many": "вернётся через {n} дней",
        "learn.skills.forecast": "Повторения на ближайшие 14 дней",
        "learn.skills.accuracy": "Правильных ответов за всё время",
        "learn.skills.reviewNow": "Начать проверку памяти",
        "learn.topic.foundations": "Самые основы",
        "learn.topic.maths": "Математика внутри"
    }
});

// How the site teaches, and what it gives that a chatbot alone does not
window.AICompass.addTranslations({
    en: {
        "learn.method.title": "How AI Compass teaches",
        "learn.method.text": "Reading about AI is not the same as learning it. These six habits are what make knowledge stay, and the site does the planning for you.",
        "learn.method.1": "Find your level",
        "learn.method.1.text": "A short check decides where you start, so nothing is too easy or too hard.",
        "learn.method.2": "Small steps every day",
        "learn.method.2.text": "A plan for today that takes 5 to 20 minutes. Little and often beats one long evening.",
        "learn.method.3": "Learn by doing",
        "learn.method.3.text": "Every idea comes with something to try: a guided step, a mini-lab or a real experiment.",
        "learn.method.4": "Recall, don't reread",
        "learn.method.4.text": "Pulling an answer out of your memory is what makes it stay. Every answer gets an explanation.",
        "learn.method.5": "Explain it back",
        "learn.method.5.text": "Say it in your own words and compare with the key ideas. If you can explain it, you know it.",
        "learn.method.6": "Come back at the right time",
        "learn.method.6.text": "What you learned returns after 1, 2, 4, 8 days and more: just before you would forget it.",

        "learn.why.title": "Why learn here, and not only with a chatbot?",
        "learn.why.lead": "Chatbots are great at answering questions. Learning needs more than answers. Here is the difference, and how to use both.",
        "learn.why.colBot": "A chatbot alone",
        "learn.why.colHere": "AI Compass",
        "learn.why.1.bot": "Answers what you ask. You have to know what to ask.",
        "learn.why.1.here": "A path from zero: what to learn first, next and after that.",
        "learn.why.2.bot": "Writes a new answer every time, and can sound sure while being wrong.",
        "learn.why.2.here": "Lessons written once, the same for everyone, and open for anyone to check and correct.",
        "learn.why.3.bot": "Tells you. Reading an answer feels like learning, but it fades in days.",
        "learn.why.3.here": "You do it: experiments, guided steps and questions with feedback.",
        "learn.why.4.bot": "Does not check what you still remember next week.",
        "learn.why.4.here": "Reviews come back on schedule, just before you would forget.",
        "learn.why.5.bot": "Rarely tells you that you are not ready for a topic yet.",
        "learn.why.5.here": "A level check, stage tests and a memory map show what is strong and what is not.",
        "learn.why.6.bot": "Usually needs the internet and often an account, and what you type goes to a company's servers.",
        "learn.why.6.here": "Free, no account, works offline, and your progress stays in your browser.",
        "learn.why.bothTitle": "Use both, the smart way",
        "learn.why.bothText": "After a lesson, explain it back in your own words. Then copy our ready prompt and let a chatbot check your explanation against the lesson's key ideas. You get a patient study partner, and you already know what a right answer looks like."
    },
    ru: {
        "learn.method.title": "Как учит AI Compass",
        "learn.method.text": "Читать про ИИ и выучить ИИ — не одно и то же. Знания остаются благодаря шести привычкам, а планирование сайт берёт на себя.",
        "learn.method.1": "Найди свой уровень",
        "learn.method.1.text": "Короткая проверка решает, с чего начать, чтобы не было ни слишком легко, ни слишком трудно.",
        "learn.method.2": "Маленькие шаги каждый день",
        "learn.method.2.text": "План на сегодня занимает от 5 до 20 минут. Понемногу, но часто — лучше одного длинного вечера.",
        "learn.method.3": "Учись делая",
        "learn.method.3.text": "К каждой идее есть что попробовать: шаг с заданием, мини-лаборатория или настоящий эксперимент.",
        "learn.method.4": "Вспоминай, а не перечитывай",
        "learn.method.4.text": "Знание остаётся, когда достаёшь ответ из памяти. К каждому ответу есть объяснение.",
        "learn.method.5": "Объясни своими словами",
        "learn.method.5.text": "Расскажи по-своему и сравни с главными идеями. Если можешь объяснить — значит, знаешь.",
        "learn.method.6": "Возвращайся вовремя",
        "learn.method.6.text": "Изученное возвращается через 1, 2, 4, 8 дней и дальше: как раз перед тем, как ты забудешь.",

        "learn.why.title": "Зачем учиться здесь, а не только с чат-ботом?",
        "learn.why.lead": "Чат-боты отлично отвечают на вопросы. Но чтобы научиться, одних ответов мало. Вот в чём разница — и как пользоваться и тем и другим.",
        "learn.why.colBot": "Только чат-бот",
        "learn.why.colHere": "AI Compass",
        "learn.why.1.bot": "Отвечает на то, что спросишь. Нужно уже знать, о чём спрашивать.",
        "learn.why.1.here": "Путь с нуля: что учить сначала, что потом и что после этого.",
        "learn.why.2.bot": "Каждый раз пишет новый ответ и может звучать уверенно, даже ошибаясь.",
        "learn.why.2.here": "Уроки написаны один раз, одинаковы для всех и открыты: любой может проверить и поправить.",
        "learn.why.3.bot": "Рассказывает. Кажется, что прочитать — значит выучить, но через пару дней всё забывается.",
        "learn.why.3.here": "Делаешь сам: эксперименты, шаги с заданиями и вопросы с объяснениями.",
        "learn.why.4.bot": "Не проверяет, что ты помнишь через неделю.",
        "learn.why.4.here": "Повторения приходят по расписанию — как раз перед тем, как ты забудешь.",
        "learn.why.5.bot": "Редко скажет, что тебе пока рано браться за тему.",
        "learn.why.5.here": "Проверка уровня, тесты этапов и карта памяти показывают, что крепко, а что нет.",
        "learn.why.6.bot": "Обычно нужен интернет и часто аккаунт, а всё, что ты пишешь, уходит на серверы компании.",
        "learn.why.6.here": "Бесплатно, без аккаунта, работает без интернета, а прогресс остаётся в твоём браузере.",
        "learn.why.bothTitle": "Пользуйся и тем и другим — с умом",
        "learn.why.bothText": "После урока объясни его своими словами. Потом скопируй наш готовый запрос, и пусть чат-бот сверит твоё объяснение с главными идеями урока. Получится терпеливый напарник по учёбе — а ты уже знаешь, как выглядит правильный ответ."
    }
});

// The study window: shared buttons and messages
window.AICompass.addTranslations({
    en: {
        "learn.play.close": "Close",
        "learn.play.check": "Check",
        "learn.play.next": "Next",
        "learn.play.continue": "Continue",
        "learn.play.finish": "Finish",
        "learn.play.retry": "Try again",
        "learn.play.show": "Show the answer",
        "learn.play.listen": "Listen",
        "learn.play.stop": "Stop",
        "learn.play.step": "{n} of {total}",
        "learn.play.right": "Correct!",
        "learn.play.wrong": "Not quite",
        "learn.play.answerWas": "The answer: {answer}",
        "learn.play.dontKnow": "I don't know yet",
        "learn.play.loading": "Loading…",
        "learn.play.loadError": "This part didn't load. Check your connection and try again.",
        "learn.play.tryLoad": "Try again",
        "learn.play.saved": "Your answers are saved only in this browser.",
        "learn.play.notSaved": "This browser doesn't save progress: it will be gone when you close the page.",
        "learn.play.backToPath": "Back to my path",
        "learn.play.keys": "1–9 answer · Enter continue · Esc close",
        "learn.keysGroup": "My path: steps and checks",
        "learn.do.answer": "Choose an answer, a group or the next item",
        "learn.do.next": "Go on (press the main button of the screen)",

        "learn.task.order": "Tap the lines in the right order.",
        "learn.task.orderReset": "Start again",
        "learn.task.sort": "Put each one in the right group.",
        "learn.task.match": "Tap one on the left, then its pair on the right.",
        "learn.task.number": "Type a number.",
        "learn.task.numberLabel": "Your answer",
        "learn.task.reveal": "Think for a moment, then look.",
        "learn.task.revealButton": "Show me",
        "learn.task.sortLeft": "{n} left to sort",
        "learn.task.recap": "What to remember"
    },
    ru: {
        "learn.play.close": "Закрыть",
        "learn.play.check": "Проверить",
        "learn.play.next": "Дальше",
        "learn.play.continue": "Продолжить",
        "learn.play.finish": "Завершить",
        "learn.play.retry": "Попробовать ещё раз",
        "learn.play.show": "Показать ответ",
        "learn.play.listen": "Слушать",
        "learn.play.stop": "Стоп",
        "learn.play.step": "{n} из {total}",
        "learn.play.right": "Верно!",
        "learn.play.wrong": "Не совсем",
        "learn.play.answerWas": "Ответ: {answer}",
        "learn.play.dontKnow": "Пока не знаю",
        "learn.play.loading": "Загрузка…",
        "learn.play.loadError": "Эта часть не загрузилась. Проверь соединение и попробуй ещё раз.",
        "learn.play.tryLoad": "Попробовать ещё раз",
        "learn.play.saved": "Твои ответы хранятся только в этом браузере.",
        "learn.play.notSaved": "Этот браузер не сохраняет прогресс: он пропадёт, когда ты закроешь страницу.",
        "learn.play.backToPath": "Вернуться к моему пути",
        "learn.play.keys": "1–9 — ответ · Enter — дальше · Esc — закрыть",
        "learn.keysGroup": "Мой путь: шаги и проверки",
        "learn.do.answer": "Выбрать ответ, группу или следующий пункт",
        "learn.do.next": "Дальше (нажать главную кнопку экрана)",

        "learn.task.order": "Нажимай строки в правильном порядке.",
        "learn.task.orderReset": "Начать заново",
        "learn.task.sort": "Положи каждое в нужную группу.",
        "learn.task.match": "Нажми слева, а потом его пару справа.",
        "learn.task.number": "Введи число.",
        "learn.task.numberLabel": "Твой ответ",
        "learn.task.reveal": "Подумай немного, а потом посмотри.",
        "learn.task.revealButton": "Показать",
        "learn.task.sortLeft": "Осталось разложить: {n}",
        "learn.task.recap": "Что запомнить"
    }
});

// The study window: the memory check, practice, the stage test, the level check
window.AICompass.addTranslations({
    en: {
        "learn.review.title": "Memory check",
        "learn.review.practice": "Practice: {topic}",
        "learn.review.more": "Extra practice",
        "learn.review.test": "Stage test: {stage}",
        "learn.review.fromLesson": "Lesson {n}",
        "learn.review.backTomorrow": "This card comes back tomorrow.",
        "learn.review.back.one": "This card comes back in {n} day.",
        "learn.review.back.many": "This card comes back in {n} days.",
        "learn.review.endTitle": "Memory check done",
        "learn.review.endPractice": "Practice done",
        "learn.review.score": "{right} of {total} right",
        "learn.review.perfect": "All right, from memory. That is how knowledge stays.",
        "learn.review.missedTitle": "Worth another look",
        "learn.review.openLesson": "Open lesson {n}",
        "learn.review.openUnit": "Open “{title}”",
        "learn.review.nextWhen": "The next cards are ready {when}.",
        "learn.review.emptyTitle": "Nothing is ready right now",
        "learn.review.emptyText": "Cards come back when it is time to remember them. That is the whole trick.",
        "learn.review.emptyNew": "Finish a lesson or a guided step first: its questions become your cards.",
        "learn.review.again": "Practise more cards",
        "learn.when.today": "today",
        "learn.when.tomorrow": "tomorrow",
        "learn.when.days.one": "in {n} day",
        "learn.when.days.many": "in {n} days",

        "learn.test.passTitle": "Stage star earned!",
        "learn.test.passText": "{score} of {total}. You know “{stage}”. The path moves on.",
        "learn.test.failTitle": "Not yet: {score} of {total}",
        "learn.test.failText": "{pass} right answers earn the star. Look at the cards below, then try again: the questions will be different.",
        "learn.test.again": "Try the test again",

        "learn.place.title": "Find my level",
        "learn.place.intro": "About 8 questions. Don't guess: “I don't know yet” is a fine answer, and it makes the path fit you better.",
        "learn.place.begin": "Begin",
        "learn.place.resultTitle": "Your path starts at “{stage}”",
        "learn.place.line": "{stage}: {score} of {total}",
        "learn.place.result.zero": "We will start from the very beginning: what a program is and how computers learn. Small steps, nothing assumed.",
        "learn.place.result.basics": "You have the first ideas. The basics will make them solid.",
        "learn.place.result.deep": "The basics are in place. Time to look inside: how AI sees, plays and writes.",
        "learn.place.result.world": "You know how AI works. Now see what it does with data and with you, and plan a project.",
        "learn.place.result.pro": "You know the ideas well. Next comes the maths, done by hand.",
        "learn.place.stopped": "No need for more questions: the path will start from the beginning.",
        "learn.place.see": "See my path"
    },
    ru: {
        "learn.review.title": "Проверка памяти",
        "learn.review.practice": "Тренировка: {topic}",
        "learn.review.more": "Дополнительная тренировка",
        "learn.review.test": "Тест этапа: {stage}",
        "learn.review.fromLesson": "Урок {n}",
        "learn.review.backTomorrow": "Эта карточка вернётся завтра.",
        "learn.review.back.one": "Эта карточка вернётся через {n} день.",
        "learn.review.back.few": "Эта карточка вернётся через {n} дня.",
        "learn.review.back.many": "Эта карточка вернётся через {n} дней.",
        "learn.review.endTitle": "Проверка памяти пройдена",
        "learn.review.endPractice": "Тренировка окончена",
        "learn.review.score": "Верно: {right} из {total}",
        "learn.review.perfect": "Всё верно, и по памяти. Именно так знания и остаются.",
        "learn.review.missedTitle": "Стоит посмотреть ещё раз",
        "learn.review.openLesson": "Открыть урок {n}",
        "learn.review.openUnit": "Открыть «{title}»",
        "learn.review.nextWhen": "Следующие карточки будут готовы {when}.",
        "learn.review.emptyTitle": "Сейчас повторять нечего",
        "learn.review.emptyText": "Карточки возвращаются, когда их пора вспомнить. В этом и весь фокус.",
        "learn.review.emptyNew": "Сначала пройди урок или шаг пути: его вопросы станут твоими карточками.",
        "learn.review.again": "Потренироваться ещё",
        "learn.when.today": "сегодня",
        "learn.when.tomorrow": "завтра",
        "learn.when.days.one": "через {n} день",
        "learn.when.days.few": "через {n} дня",
        "learn.when.days.many": "через {n} дней",

        "learn.test.passTitle": "Звезда этапа получена!",
        "learn.test.passText": "{score} из {total}. Ты знаешь этап «{stage}». Путь идёт дальше.",
        "learn.test.failTitle": "Пока нет: {score} из {total}",
        "learn.test.failText": "Для звезды нужно правильных ответов: {pass}. Посмотри карточки ниже и попробуй ещё раз: вопросы будут другими.",
        "learn.test.again": "Пройти тест ещё раз",

        "learn.place.title": "Найти мой уровень",
        "learn.place.intro": "Примерно 8 вопросов. Не угадывай: «Пока не знаю» — хороший ответ, с ним путь подойдёт тебе лучше.",
        "learn.place.begin": "Начать",
        "learn.place.resultTitle": "Твой путь начинается с этапа «{stage}»",
        "learn.place.line": "{stage}: {score} из {total}",
        "learn.place.result.zero": "Начнём с самого начала: что такое программа и как учатся компьютеры. Маленькими шагами, ничего знать заранее не нужно.",
        "learn.place.result.basics": "Первые идеи у тебя уже есть. Основы сделают их прочными.",
        "learn.place.result.deep": "Основы на месте. Пора заглянуть внутрь: как ИИ видит, играет и пишет.",
        "learn.place.result.world": "Ты знаешь, как работает ИИ. Теперь посмотри, что он делает с данными и с тобой, и спланируй проект.",
        "learn.place.result.pro": "Идеи ты знаешь хорошо. Дальше — математика своими руками.",
        "learn.place.stopped": "Больше вопросов не нужно: путь начнётся с самого начала.",
        "learn.place.see": "Посмотреть мой путь"
    }
});

// The study window: the guided steps and "Explain it back"
window.AICompass.addTranslations({
    en: {
        "learn.guide.doneTitle": "Step complete!",
        "learn.guide.doneFirst": "{right} of {total} right on the first try.",
        "learn.guide.doneAll": "Every answer right on the first try!",
        "learn.guide.cards.one": "{n} question went into your memory check. It comes back tomorrow.",
        "learn.guide.cards.many": "{n} questions went into your memory check. They come back tomorrow.",
        "learn.guide.nextUnit": "Next: {title}",
        "learn.guide.again": "Do this step again",

        "learn.explain.title": "Explain it back",
        "learn.explain.lead": "If you can explain it simply, you understand it. Write two or three sentences in your own words, as if to a friend.",
        "learn.explain.label": "Your explanation",
        "learn.explain.placeholder": "Write here…",
        "learn.explain.tooShort": "Write at least one full sentence first.",
        "learn.explain.compare": "Compare with the key ideas",
        "learn.explain.checkTitle": "Did your explanation include these ideas?",
        "learn.explain.checkText": "Be honest: tick only the ones you really covered.",
        "learn.explain.yours": "You wrote",
        "learn.explain.save": "Save",
        "learn.explain.result.0": "None yet, and that is useful to know. Read the key ideas again and try once more in a day or two.",
        "learn.explain.result.1": "One of three. Read the other two ideas again, then try once more in a day or two.",
        "learn.explain.result.2": "Two of three: nearly there. One idea is worth another look.",
        "learn.explain.result.3": "All three: you really know this lesson.",
        "learn.explain.openLesson": "Open the lesson's key ideas",
        "learn.explain.edit": "Rewrite my explanation",
        "learn.explain.done": "Done",
        "learn.explain.botTitle": "Want a second opinion?",
        "learn.explain.botText": "Copy this prompt into any chatbot. It will check your explanation against the lesson's key ideas. Don't paste anything private.",
        "learn.explain.botCopy": "Copy the prompt",
        "learn.explain.botCopied": "Copied. Paste it into your chatbot.",
        "learn.explain.botFailed": "Couldn't copy. Select the text and copy it yourself.",
        "learn.explain.prompt": "I am learning about “{title}”. Here is my explanation, in my own words:\n\n“{text}”\n\nThe key ideas of the lesson are:\n1. {k1}\n2. {k2}\n3. {k3}\n\nCompare my explanation with these key ideas. In a few short sentences, tell me what I got right, what I missed and what I got wrong. Do not flatter me and do not add new topics.",
        "learn.explain.readerButton": "Explain it back (1 minute)",
        "learn.explain.readerText": "The best way to check that you understood.",
        "learn.explain.none": "Finish a lesson first, then explain it back here.",

        "learn.explain.l1": "Explain to a friend what AI is, and name one thing people call AI that isn't.",
        "learn.explain.l2": "Explain how a computer can learn from examples instead of being given the rules.",
        "learn.explain.l3": "Explain what one neuron in a neural network does, and what training changes.",
        "learn.explain.l4": "Explain how a chatbot writes an answer, and why it can be wrong while sounding sure.",
        "learn.explain.l5": "Name two places where you meet AI on a normal day, and explain what it does there.",
        "learn.explain.l6": "Explain what bias in AI is, and one thing you can do to use AI responsibly.",
        "learn.explain.l7": "Explain how a picture becomes numbers, and how a network finds shapes in it.",
        "learn.explain.l8": "Explain how an AI can learn to play a game from rewards alone.",
        "learn.explain.l9": "Explain what a token is, and how a language model chooses the next one.",
        "learn.explain.l10": "Explain how a picture can appear out of noise, and one question that creative AI raises.",
        "learn.explain.l11": "Explain two ways AI gets things wrong, and how a model should be tested.",
        "learn.explain.l12": "Explain what makes a good prompt, and how you check an AI's answer.",
        "learn.explain.l13": "Explain why a model is tested on examples it has never seen.",
        "learn.explain.l14": "Explain why a feed can shrink into a bubble, and one way to get out of it.",
        "learn.explain.l15": "Explain the steps from an idea to a tested AI model, in the right order."
    },
    ru: {
        "learn.guide.doneTitle": "Шаг пройден!",
        "learn.guide.doneFirst": "С первой попытки верно: {right} из {total}.",
        "learn.guide.doneAll": "Все ответы верны с первой попытки!",
        "learn.guide.cards.one": "{n} вопрос попал в твою проверку памяти. Он вернётся завтра.",
        "learn.guide.cards.few": "{n} вопроса попали в твою проверку памяти. Они вернутся завтра.",
        "learn.guide.cards.many": "{n} вопросов попали в твою проверку памяти. Они вернутся завтра.",
        "learn.guide.nextUnit": "Дальше: {title}",
        "learn.guide.again": "Пройти этот шаг ещё раз",

        "learn.explain.title": "Объясни своими словами",
        "learn.explain.lead": "Если можешь объяснить просто — значит, понимаешь. Напиши два-три предложения своими словами, как будто рассказываешь другу.",
        "learn.explain.label": "Твоё объяснение",
        "learn.explain.placeholder": "Пиши здесь…",
        "learn.explain.tooShort": "Сначала напиши хотя бы одно полное предложение.",
        "learn.explain.compare": "Сравнить с главными идеями",
        "learn.explain.checkTitle": "Есть ли в твоём объяснении эти идеи?",
        "learn.explain.checkText": "Только честно: отмечай то, что действительно есть в твоём тексте.",
        "learn.explain.yours": "Твой текст",
        "learn.explain.save": "Сохранить",
        "learn.explain.result.0": "Пока ни одной — и это полезно знать. Перечитай главные идеи и попробуй ещё раз через день-два.",
        "learn.explain.result.1": "Одна из трёх. Перечитай две другие идеи и попробуй ещё раз через день-два.",
        "learn.explain.result.2": "Две из трёх: почти получилось. На одну идею стоит посмотреть ещё раз.",
        "learn.explain.result.3": "Все три: ты действительно знаешь этот урок.",
        "learn.explain.openLesson": "Открыть главные идеи урока",
        "learn.explain.edit": "Переписать объяснение",
        "learn.explain.done": "Готово",
        "learn.explain.botTitle": "Хочешь второе мнение?",
        "learn.explain.botText": "Скопируй этот запрос в любой чат-бот. Он сверит твоё объяснение с главными идеями урока. Не вставляй ничего личного.",
        "learn.explain.botCopy": "Скопировать запрос",
        "learn.explain.botCopied": "Скопировано. Вставь запрос в свой чат-бот.",
        "learn.explain.botFailed": "Не получилось скопировать. Выдели текст и скопируй его сам.",
        "learn.explain.prompt": "Я изучаю тему «{title}». Вот моё объяснение своими словами:\n\n«{text}»\n\nГлавные идеи урока:\n1. {k1}\n2. {k2}\n3. {k3}\n\nСравни моё объяснение с этими идеями. В нескольких коротких предложениях скажи, что у меня верно, что я упустил и в чём ошибся. Не хвали без причины и не добавляй новых тем.",
        "learn.explain.readerButton": "Объясни своими словами (1 минута)",
        "learn.explain.readerText": "Лучший способ проверить своё понимание.",
        "learn.explain.none": "Сначала пройди урок, а потом объясни его здесь.",

        "learn.explain.l1": "Объясни другу, что такое ИИ, и назови одну вещь, которую называют ИИ, хотя это не он.",
        "learn.explain.l2": "Объясни, как компьютер может учиться на примерах, а не получать готовые правила.",
        "learn.explain.l3": "Объясни, что делает один нейрон в нейросети и что меняется при обучении.",
        "learn.explain.l4": "Объясни, как чат-бот пишет ответ и почему он может ошибаться, звуча уверенно.",
        "learn.explain.l5": "Назови два места, где ты встречаешь ИИ в обычный день, и объясни, что он там делает.",
        "learn.explain.l6": "Объясни, что такое предвзятость ИИ, и назови одну вещь, которая помогает пользоваться ИИ ответственно.",
        "learn.explain.l7": "Объясни, как картинка превращается в числа и как нейросеть находит в ней формы.",
        "learn.explain.l8": "Объясни, как ИИ может научиться играть в игру, получая только награды.",
        "learn.explain.l9": "Объясни, что такое токен и как языковая модель выбирает следующий.",
        "learn.explain.l10": "Объясни, как картинка может появиться из шума, и назови один вопрос, который ставит творческий ИИ.",
        "learn.explain.l11": "Объясни два способа, которыми ИИ ошибается, и как нужно проверять модель.",
        "learn.explain.l12": "Объясни, из чего состоит хороший запрос и как проверить ответ ИИ.",
        "learn.explain.l13": "Объясни, почему модель проверяют на примерах, которых она никогда не видела.",
        "learn.explain.l14": "Объясни, почему лента может сжаться в пузырь, и назови один способ из него выбраться.",
        "learn.explain.l15": "Объясни по порядку шаги от идеи до проверенной ИИ-модели."
    }
});

// Ctrl+K commands and small messages
window.AICompass.addTranslations({
    en: {
        "learn.cmdGroup": "My path",
        "learn.cmd.open": "Open my learning path",
        "learn.cmd.today": "Start today's session",
        "learn.cmd.review": "Start the memory check",
        "learn.cmd.level": "Find my level",
        "learn.cmd.explain": "Explain a lesson back",
        "learn.cmd.setup": "Change who is learning",
        "learn.toast.cards.one": "{n} new card for your memory check",
        "learn.toast.cards.many": "{n} new cards for your memory check",
        "learn.toast.session": "Today's session is complete!",
        "learn.noSave": "This browser doesn't keep what the site saves, so your path will be gone when you close the page."
    },
    ru: {
        "learn.cmdGroup": "Мой путь",
        "learn.cmd.open": "Открыть мой путь",
        "learn.cmd.today": "Начать занятие на сегодня",
        "learn.cmd.review": "Начать проверку памяти",
        "learn.cmd.level": "Найти мой уровень",
        "learn.cmd.explain": "Объяснить урок своими словами",
        "learn.cmd.setup": "Изменить, кто учится",
        "learn.toast.cards.one": "{n} новая карточка для проверки памяти",
        "learn.toast.cards.few": "{n} новые карточки для проверки памяти",
        "learn.toast.cards.many": "{n} новых карточек для проверки памяти",
        "learn.toast.session": "Занятие на сегодня пройдено!",
        "learn.noSave": "Этот браузер не хранит то, что сохраняет сайт, поэтому твой путь пропадёт, когда ты закроешь страницу."
    }
});

// The data of the path (js/learn.js reads it with AICompass.content.get("learn"))
window.AICompass.content.set("learn", {
    // Who can be learning: the first question of the setup.
    //   goal    the minutes a day suggested for them (the third question starts on it)
    //   start   where the second question starts: "zero", "some" or "check"
    // Texts: "learn.who.<id>" (the name), ".age" and ".text".
    profiles: [
        { id: "kid", icon: "🧒", goal: 5, start: "zero" },
        { id: "teen", icon: "🎒", goal: 10, start: "some" },
        { id: "adult", icon: "🧑", goal: 10, start: "some" },
        { id: "teacher", icon: "🍎", goal: 10, start: "some" },
        { id: "pro", icon: "💻", goal: 20, start: "check" }
    ],

    // The minutes a day to choose from, and how many cards a memory check has for each
    goals: [5, 10, 20],
    sessionCards: { 5: 5, 10: 8, 20: 12 },

    // The memory boxes (spaced repetition). A new card starts in box 1. A right answer
    // on its day moves a card one box up, a wrong one back to box 1 (an answer before
    // the card's day never moves it up). boxDays[0] is box 1: the card comes back after
    // 1 day, box 2 after 2 days... A card in box 4 or higher counts as "strong".
    boxDays: [1, 2, 4, 8, 16, 32],
    strongBox: 4,

    // The stages of the path, in order. A stage is a lesson track ("track": its
    // lessons, in order) or a guided course ("course": its units, in order).
    // Texts: "learn.stage.<id>" and ".text".
    stages: [
        { id: "zero", icon: "🐣", course: "zero" },
        { id: "basics", icon: "🌱", track: "basics" },
        { id: "deep", icon: "🤿", track: "deep" },
        { id: "world", icon: "🌍", track: "world" },
        { id: "pro", icon: "⚙️", course: "pro" }
    ],

    // The guided courses: the file with their steps (loaded when a unit opens), the
    // topic of their cards on the memory map ("learn.topic.<topic>"), and their units
    // in order (texts: "learn.unit.<id>" and ".text"; minutes: about how long one takes;
    // cards: how many of its tasks become cards of the memory check, named z1a, z1b...).
    // probes: the cards that the level check asks to see whether this stage is known.
    courses: {
        zero: {
            file: "js/content/courses/zero.js",
            topic: "foundations",
            units: [
                { id: "z1", icon: "🤖", minutes: 4, cards: 3 },
                { id: "z2", icon: "🔢", minutes: 4, cards: 3 },
                { id: "z3", icon: "🧩", minutes: 4, cards: 3 },
                { id: "z4", icon: "🧠", minutes: 5, cards: 3 }
            ]
        },
        pro: {
            file: "js/content/courses/pro.js",
            topic: "maths",
            probes: ["p2a", "p3b"],
            units: [
                { id: "p1", icon: "🧮", minutes: 6, cards: 4 },
                { id: "p2", icon: "📉", minutes: 7, cards: 4 },
                { id: "p3", icon: "🎯", minutes: 7, cards: 5 },
                { id: "p4", icon: "🔤", minutes: 7, cards: 5 }
            ]
        }
    },

    // The stage test: how many questions, and the share of right answers that earns the star
    test: { questions: 8, pass: 0.8 },

    // The level check: how many questions it asks about each stage it probes
    placement: { perStage: 2 },

    // Roughly how long each step of today's session takes (minutes), for "About 10 minutes"
    minutes: { review: 2, lab: 4, explain: 2 }
});

// The keys of the study window, in the keyboard shortcuts window (press ?).
// js/learn-play.js, 3 (onKey): the number keys press the answers of a task, Enter
// presses the main button of the screen. Esc is in the list's first group.
(function () {
    var data = window.AICompass.content.get("settings");
    if (!data || !Array.isArray(data.shortcuts)) return;
    data.shortcuts.push({
        title: "learn.keysGroup",
        items: [
            { keys: [["1"], ["2"], ["3"], ["…"]], does: "learn.do.answer" },
            { keys: [["enter"]], does: "learn.do.next" }
        ]
    });
})();
