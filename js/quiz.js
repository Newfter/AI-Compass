/* =========================================================
   AI COMPASS — THE AI CHALLENGE (QUIZ)
   Twelve questions about AI inside one glass card with three screens:
   1. START    rules, best score, "timed mode" switch
   2. QUESTION progress, score, streak, timer ring, answers, feedback
   3. RESULTS  score ring, rank, new best + confetti, answer review
   Keyboard: 1-4 answer, Enter goes to the next question.
   Other files can call window.AICompass.startQuiz().
   The language can change at any moment: the quiz keeps its place
   and simply re-writes its texts in the other language.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="quiz"]');
    if (!A || !mount) return;

    const t = A.t;

    // ---------- 1. Settings ----------
    const TIME_LIMIT = 20;          // seconds per question in timed mode
    const BASE_POINTS = 100;        // for every correct answer
    const SPEED_BONUS_MAX = 50;     // timed mode: a fast answer earns up to +50
    const STREAK_STEP = 10;         // 2 in a row: +10, 3 in a row: +20, ...
    const STREAK_BONUS_MAX = 50;    // ...but never more than +50
    const PRAISE_COUNT = 4;         // how many different "Correct!" messages we have
    const BOTTOM_SPACE = 104;       // px kept free at the bottom of the screen (assistant button)
    const TOP_SPACE = 84;           // px kept free at the top of the screen (navigation bar)
    const TIMER_LENGTH = 2 * Math.PI * 27;   // length of the timer ring (radius 27)
    const RESULT_LENGTH = 2 * Math.PI * 66;  // length of the results ring (radius 66)

    // ---------- 2. The questions ----------
    // The texts live in the translations below ("quiz.q1.text", "quiz.q1.o1", ...).
    // In the translations the FIRST option is always the right one,
    // so "correct" is 0 for every multiple-choice question. Don't worry:
    // the options are shuffled every game.
    // True/false questions: correct 0 means "True", 1 means "False".
    // learn: the lesson (1-6) that explains the topic, or "timeline".
    const QUESTIONS = [
        { key: "q1", type: "choice", topic: "basics", correct: 0, learn: 1 },
        { key: "q2", type: "choice", topic: "ml", correct: 0, learn: 2 },
        { key: "q3", type: "truefalse", topic: "data", correct: 1, learn: 2 },
        { key: "q4", type: "truefalse", topic: "nn", correct: 1, learn: 3 },
        { key: "q5", type: "choice", topic: "genai", correct: 0, learn: 4 },
        { key: "q6", type: "truefalse", topic: "hallucination", correct: 0, learn: 4 },
        { key: "q7", type: "choice", topic: "bias", correct: 0, learn: 6 },
        { key: "q8", type: "choice", topic: "privacy", correct: 0, learn: 6 },
        { key: "q9", type: "choice", topic: "everyday", correct: 0, learn: 5 },
        { key: "q10", type: "choice", topic: "history", correct: 0, learn: "timeline" },
        { key: "q11", type: "truefalse", topic: "history", correct: 0, learn: "timeline" },
        { key: "q12", type: "choice", topic: "responsible", correct: 0, learn: 6 }
    ];

    // Ranks by the number of correct answers (out of 12)
    const RANKS = [
        { id: "rookie", min: 0, emoji: "🌱" },
        { id: "explorer", min: 5, emoji: "🧭" },
        { id: "expert", min: 8, emoji: "🚀" },
        { id: "master", min: 11, emoji: "🧠" }
    ];

    // ---------- 3. Translations ----------
    A.addTranslations({
        en: {
            // Command palette
            "quiz.cmdGroup": "Quiz",
            "quiz.cmd.start": "Start the AI Challenge",
            "quiz.cmd.startTimed": "Start the AI Challenge in timed mode",

            // Start screen
            "quiz.start.kicker": "Mission briefing",
            "quiz.start.title": "Ready for the AI Challenge?",
            "quiz.start.text": "Twelve questions about how AI works, where it came from and how to use it wisely. After every answer you'll see a short explanation, so you learn while you play.",
            "quiz.start.questions.one": "question",
            "quiz.start.questions.many": "questions",
            "quiz.start.minutes.one": "minute",
            "quiz.start.minutes.many": "minutes",
            "quiz.start.bestRelaxed": "best score · no timer",
            "quiz.start.bestTimed": "best score · timed",
            "quiz.start.bestWith": "{label} · {correct}/{total}",
            "quiz.start.rulesTitle": "How it works",
            "quiz.start.rule1": "Multiple-choice and true-or-false questions on AI basics, history, safety and ethics",
            "quiz.start.rule2": "<strong>100 points</strong> for each correct answer, plus a <strong>streak bonus</strong> for correct answers in a row",
            "quiz.start.rule3": "Press <kbd>1</kbd>–<kbd>4</kbd> to answer and <kbd>Enter</kbd> for the next question",
            "quiz.start.rule3Touch": "Tap an answer to lock it in, then tap <strong>Next question</strong> to move on",
            "quiz.start.rule4": "Every answer comes with an explanation, and at the end you can review them all",
            "quiz.start.button": "Start the challenge",
            "quiz.timed.label": "Timed mode",
            "quiz.timed.desc": "{time} per question. Answer faster to earn up to +{bonus} bonus points.",
            "quiz.timed.on": "On",
            "quiz.timed.off": "Off",

            // Question screen
            "quiz.q.counter": "Question {n} / {total}",
            "quiz.q.score": "Score",
            "quiz.q.streak": "{n} in a row",
            "quiz.q.streakSr.one": "Streak: {n} correct answer in a row",
            "quiz.q.streakSr.many": "Streak: {n} correct answers in a row",
            "quiz.q.progressLabel": "Quiz progress",
            "quiz.q.progressText": "{n} of {total} answered",
            "quiz.q.type.choice": "Choose one answer",
            "quiz.q.type.truefalse": "True or false?",
            "quiz.q.srCorrect": "(correct answer)",
            "quiz.q.srPicked": "(your answer)",
            "quiz.q.next": "Next question",
            "quiz.q.finish": "See my results",
            "quiz.q.enterHint": "or press Enter",
            "quiz.q.quit": "Quit",
            "quiz.q.quitConfirm": "Sure? Press again",
            "quiz.q.quitHint": "Press the button again to end this game and go back to the start. Your answers won't be saved.",
            "quiz.q.timeLeft": "Time left: {time}",
            "quiz.true": "True",
            "quiz.false": "False",
            "quiz.seconds.one": "{n} second",
            "quiz.seconds.many": "{n} seconds",
            "quiz.points.one": "{n} point",
            "quiz.points.many": "{n} points",

            // Feedback after an answer
            "quiz.fb.correct1": "Correct!",
            "quiz.fb.correct2": "Exactly right!",
            "quiz.fb.correct3": "Nailed it!",
            "quiz.fb.correct4": "Spot on!",
            "quiz.fb.wrong": "Not quite.",
            "quiz.fb.timeout": "Time's up!",
            "quiz.fb.rightAnswer": "Right answer: {answer}",
            "quiz.fb.base": "+{n} for the right answer",
            "quiz.fb.speed": "+{n} speed bonus",
            "quiz.fb.streak": "+{n} streak bonus",
            "quiz.fb.streakLost": "Streak reset",
            "quiz.fb.noPoints": "No points this time",

            // Results screen
            "quiz.res.kicker": "Mission complete",
            "quiz.res.ringCaption": "correct",
            "quiz.res.ringSr": "{percent}% of your answers are correct",
            "quiz.res.correct": "Correct answers",
            "quiz.res.points": "Points",
            "quiz.res.bestStreak": "Best streak",
            "quiz.res.mode": "Mode",
            "quiz.res.modeTimed": "Timed",
            "quiz.res.modeRelaxed": "No timer",
            "quiz.res.newBest": "New best score!",
            "quiz.res.bestWas": "Your best without a timer: {points}",
            "quiz.res.bestWasTimed": "Your best in timed mode: {points}",
            "quiz.res.announce": "Challenge complete: {correct} of {total} correct, {points}. Your rank: {rank}.",
            "quiz.res.retry": "Try again",
            "quiz.res.copy": "Copy my result",
            "quiz.res.copiedLabel": "Copied!",
            "quiz.res.toStart": "Back to start",
            "quiz.res.copied": "Result copied. Challenge your friends!",
            "quiz.res.copyFailed": "Couldn't copy the result in this browser",
            "quiz.share.text": "🧭 AI Compass · The AI Challenge\nI got {correct} of {total} right ({percent}%) and scored {points}.\nMy rank: {emoji} {rank}\nCan you beat me?",

            "quiz.rank.rookie": "AI Rookie",
            "quiz.rank.rookieText": "Every expert started somewhere. Check out the lessons and try again: you'll improve faster than you think!",
            "quiz.rank.explorer": "AI Explorer",
            "quiz.rank.explorerText": "Nice work! You know the basics. A few more lessons and you'll be an expert.",
            "quiz.rank.expert": "AI Expert",
            "quiz.rank.expertText": "Impressive! You really understand how AI works.",
            "quiz.rank.master": "AI Master",
            "quiz.rank.masterText": "Outstanding! You could explain all of this to your friends.",

            // Review list
            "quiz.review.title": "Review your answers",
            "quiz.review.filterLabel": "Show questions",
            "quiz.review.all": "All ({n})",
            "quiz.review.mistakes": "Mistakes ({n})",
            "quiz.review.expand": "Expand all",
            "quiz.review.collapse": "Collapse all",
            "quiz.review.yourAnswer": "Your answer:",
            "quiz.review.rightAnswer": "Correct answer:",
            "quiz.review.noAnswer": "no answer, time ran out",
            "quiz.review.statusCorrect": "correct",
            "quiz.review.statusWrong": "wrong",
            "quiz.review.statusTimeout": "time ran out",
            "quiz.review.noMistakes": "No mistakes at all. A perfect run! 🎉",
            "quiz.review.lesson": "Learn more: lesson {n} · {title}",
            "quiz.review.lessonPlain": "Learn more in lesson {n}",
            "quiz.review.timeline": "Explore the history of AI",

            // Topics
            "quiz.topic.basics": "AI basics",
            "quiz.topic.ml": "Machine learning",
            "quiz.topic.data": "Training data",
            "quiz.topic.nn": "Neural networks",
            "quiz.topic.genai": "Generative AI",
            "quiz.topic.hallucination": "Hallucinations",
            "quiz.topic.bias": "Bias",
            "quiz.topic.privacy": "Privacy",
            "quiz.topic.everyday": "Everyday AI",
            "quiz.topic.history": "AI history",
            "quiz.topic.responsible": "Responsible use",

            // The questions (the first option is the right one)
            "quiz.q1.text": "What does “Artificial Intelligence” (AI) mean?",
            "quiz.q1.o1": "Computer systems that do tasks which usually need human intelligence",
            "quiz.q1.o2": "Any program that runs by itself, without a person controlling it all the time",
            "quiz.q1.o3": "Robots with real feelings that think exactly the way people do",
            "quiz.q1.o4": "Machines that know every fact and never make mistakes",
            "quiz.q1.explain": "AI means computer systems that do tasks we usually connect with human intelligence: understanding speech, recognising faces, translating text. Not every automatic program is AI: a timer that switches on the lights just follows fixed steps. And today's AI has no feelings, and it can definitely make mistakes.",

            "quiz.q2.text": "How is machine learning different from ordinary programming?",
            "quiz.q2.o1": "The computer learns patterns from examples, not just rules a person wrote",
            "quiz.q2.o2": "It's the same thing, just written in a newer and faster programming language",
            "quiz.q2.o3": "It only works on huge supercomputers, never on phones or laptops",
            "quiz.q2.o4": "The computer saves every example and later just looks up an exact match",
            "quiz.q2.explain": "In machine learning, we give the computer lots of examples (say, thousands of photos labelled “cat” or “dog”) and it works out the patterns itself, so it can handle new photos too. In ordinary programming, a person writes every rule. Machine learning runs on phones as well, for example in face unlock.",

            "quiz.q3.text": "If an AI learns from messy or wrong data, it will still give perfect answers.",
            "quiz.q3.explain": "False. There's a famous saying: “garbage in, garbage out”. An AI can only be as good as the data it learns from. Wrong, messy or one-sided data leads to wrong or unfair results.",

            "quiz.q4.text": "Artificial neural networks are exact digital copies of the human brain.",
            "quiz.q4.explain": "False. Neural networks were inspired by the way neurons in the brain pass signals to each other, but they are much simpler. They are layers of small maths units that adjust their connections while learning from data.",

            "quiz.q5.text": "How does a chatbot like ChatGPT write its answers?",
            "quiz.q5.o1": "It predicts a likely next word again and again, using patterns learned from text",
            "quiz.q5.o2": "It searches the internet and pastes in the web page that matches your question best",
            "quiz.q5.o3": "It picks a ready-made answer from a giant database of questions",
            "quiz.q5.o4": "A team of people quickly types each answer behind the scenes",
            "quiz.q5.explain": "Chatbots run on large language models. They build an answer one small piece of text (a “token”) at a time, each time predicting what is likely to come next. That's why they sound so fluent, but sounding confident is not the same as being right.",

            "quiz.q6.text": "An AI chatbot can confidently “quote” facts, books or sources that don't actually exist.",
            "quiz.q6.explain": "True. This is called an AI “hallucination”: the chatbot produces text that sounds believable but is made up. That's why you should always double-check important facts in reliable sources.",

            "quiz.q7.text": "A face-recognition system was trained mostly on photos of people with light skin. What is the most likely problem?",
            "quiz.q7.o1": "It may be less accurate for people with darker skin",
            "quiz.q7.o2": "It will work equally well for everyone, because all faces are similar",
            "quiz.q7.o3": "It will only recognise faces in bright, sunny photos",
            "quiz.q7.o4": "No problem: the AI fills in the gaps in its training data by itself",
            "quiz.q7.explain": "This is called AI bias. AI learns from its data, and it can't fill in what's missing by itself. If some groups of people are under-represented, the system can be less accurate or unfair to them. Researchers have found exactly this problem in real face-recognition systems, which is why diverse, balanced data matters.",

            "quiz.q8.text": "Which of these is the safest thing to type into an online AI chatbot?",
            "quiz.q8.o1": "A general question, like “How do volcanoes work?”",
            "quiz.q8.o2": "Your full name and school, so its answers fit you better",
            "quiz.q8.o3": "Your password, so it can tell you if it's strong enough",
            "quiz.q8.o4": "A screenshot of your group chat with your friends' messages",
            "quiz.q8.explain": "What you type into a chatbot may be stored and sometimes used to improve the AI. Never share passwords or personal details like your full name, address or school, and don't share other people's private messages either.",

            "quiz.q9.text": "Which of these everyday things usually uses AI?",
            "quiz.q9.o1": "Video recommendations on YouTube or TikTok",
            "quiz.q9.o2": "A pocket calculator doing long multiplication",
            "quiz.q9.o3": "A digital alarm clock that rings at a set time",
            "quiz.q9.o4": "A microwave counting down from two minutes",
            "quiz.q9.explain": "Recommendation systems learn from what you watch, like and skip, and guess what you'll want to see next. A calculator, an alarm clock and a microwave timer just follow fixed rules: they're useful, but they don't learn or adapt to you.",

            "quiz.q10.text": "Which scientist asked “Can machines think?” in a famous 1950 paper and suggested a test that is now named after him?",
            "quiz.q10.o1": "Alan Turing",
            "quiz.q10.o2": "Ada Lovelace",
            "quiz.q10.o3": "John McCarthy",
            "quiz.q10.o4": "Charles Babbage",
            "quiz.q10.explain": "In 1950 the British mathematician Alan Turing described the “imitation game”, now known as the Turing test: can a machine chat so well that you can't tell it apart from a human? The others are pioneers too: Babbage and Lovelace worked on early computer ideas in the 1800s, and McCarthy gave AI its name in the 1950s.",

            "quiz.q11.text": "IBM's computer Deep Blue beat world chess champion Garry Kasparov in 1997, 25 years before ChatGPT was released in 2022.",
            "quiz.q11.explain": "True. Deep Blue won their six-game match in 1997. It mostly relied on raw computing power, checking about 200 million chess positions per second. ChatGPT, released in November 2022, works very differently: it learned from huge amounts of text.",

            "quiz.q12.text": "What is the most responsible way to use AI for a school essay?",
            "quiz.q12.o1": "Use it for ideas, check its facts, write it yourself and say how it helped",
            "quiz.q12.o2": "Let it write the whole essay, then change a few words so it sounds like you",
            "quiz.q12.o3": "Trust its facts and quotes, because it has read millions of books",
            "quiz.q12.o4": "Use it however you like, as long as your teacher can't tell",
            "quiz.q12.explain": "AI can be a great study buddy, but you are responsible for your work. Follow your school's rules, check facts in reliable sources, keep thinking for yourself, and be honest about when and how AI helped you."
        },
        ru: {
            "quiz.cmdGroup": "Тест",
            "quiz.cmd.start": "Начать ИИ-испытание",
            "quiz.cmd.startTimed": "Начать ИИ-испытание на время",

            "quiz.start.kicker": "Брифинг миссии",
            "quiz.start.title": "Пройдёшь ИИ-испытание?",
            "quiz.start.text": "Двенадцать вопросов о том, как работает ИИ, откуда он взялся и как пользоваться им с умом. После каждого ответа появится короткое объяснение, так что ты учишься прямо во время игры.",
            "quiz.start.questions.one": "вопрос",
            "quiz.start.questions.few": "вопроса",
            "quiz.start.questions.many": "вопросов",
            "quiz.start.minutes.one": "минута",
            "quiz.start.minutes.few": "минуты",
            "quiz.start.minutes.many": "минут",
            "quiz.start.bestRelaxed": "рекорд · без таймера",
            "quiz.start.bestTimed": "рекорд · на время",
            "quiz.start.bestWith": "{label} · {correct}/{total}",
            "quiz.start.rulesTitle": "Как это работает",
            "quiz.start.rule1": "Вопросы с вариантами ответа и «верно или неверно» — об основах ИИ, его истории, безопасности и этике",
            "quiz.start.rule2": "<strong>100 очков</strong> за каждый верный ответ и <strong>бонус за серию</strong> верных ответов подряд",
            "quiz.start.rule3": "Нажимай <kbd>1</kbd>–<kbd>4</kbd>, чтобы ответить, и <kbd>Enter</kbd>, чтобы перейти к следующему вопросу",
            "quiz.start.rule3Touch": "Коснись ответа, чтобы выбрать его, а потом нажми <strong>«Следующий вопрос»</strong>",
            "quiz.start.rule4": "К каждому ответу есть объяснение, а в конце можно разобрать все вопросы",
            "quiz.start.button": "Начать испытание",
            "quiz.timed.label": "Режим на время",
            "quiz.timed.desc": "{time} на вопрос. Чем быстрее ответ, тем больше бонус — до +{bonus} очков.",
            "quiz.timed.on": "Вкл",
            "quiz.timed.off": "Выкл",

            "quiz.q.counter": "Вопрос {n} / {total}",
            "quiz.q.score": "Очки",
            "quiz.q.streak": "{n} подряд",
            "quiz.q.streakSr.one": "Серия: {n} верный ответ подряд",
            "quiz.q.streakSr.few": "Серия: {n} верных ответа подряд",
            "quiz.q.streakSr.many": "Серия: {n} верных ответов подряд",
            "quiz.q.progressLabel": "Прогресс теста",
            "quiz.q.progressText": "Отвечено: {n} из {total}",
            "quiz.q.type.choice": "Выбери один ответ",
            "quiz.q.type.truefalse": "Верно или неверно?",
            "quiz.q.srCorrect": "(правильный ответ)",
            "quiz.q.srPicked": "(твой ответ)",
            "quiz.q.next": "Следующий вопрос",
            "quiz.q.finish": "Узнать результат",
            "quiz.q.enterHint": "или нажми Enter",
            "quiz.q.quit": "Выйти",
            "quiz.q.quitConfirm": "Точно? Нажми ещё раз",
            "quiz.q.quitHint": "Нажми кнопку ещё раз, чтобы закончить игру и вернуться на старт. Ответы этой игры не сохранятся.",
            "quiz.q.timeLeft": "Осталось: {time}",
            "quiz.true": "Верно",
            "quiz.false": "Неверно",
            "quiz.seconds.one": "{n} секунда",
            "quiz.seconds.few": "{n} секунды",
            "quiz.seconds.many": "{n} секунд",
            "quiz.points.one": "{n} очко",
            "quiz.points.few": "{n} очка",
            "quiz.points.many": "{n} очков",

            "quiz.fb.correct1": "Верно!",
            "quiz.fb.correct2": "Точно!",
            "quiz.fb.correct3": "В яблочко!",
            "quiz.fb.correct4": "Именно так!",
            "quiz.fb.wrong": "Не совсем.",
            "quiz.fb.timeout": "Время вышло!",
            "quiz.fb.rightAnswer": "Правильный ответ: {answer}",
            "quiz.fb.base": "+{n} за верный ответ",
            "quiz.fb.speed": "+{n} за скорость",
            "quiz.fb.streak": "+{n} за серию",
            "quiz.fb.streakLost": "Серия прервана",
            "quiz.fb.noPoints": "В этот раз без очков",

            "quiz.res.kicker": "Миссия выполнена",
            "quiz.res.ringCaption": "верно",
            "quiz.res.ringSr": "Верных ответов: {percent}%",
            "quiz.res.correct": "Верные ответы",
            "quiz.res.points": "Очки",
            "quiz.res.bestStreak": "Лучшая серия",
            "quiz.res.mode": "Режим",
            "quiz.res.modeTimed": "На время",
            "quiz.res.modeRelaxed": "Без таймера",
            "quiz.res.newBest": "Новый рекорд!",
            "quiz.res.bestWas": "Твой рекорд без таймера: {points}",
            "quiz.res.bestWasTimed": "Твой рекорд в режиме на время: {points}",
            "quiz.res.announce": "Испытание пройдено: верно {correct} из {total}, {points}. Твоё звание: {rank}.",
            "quiz.res.retry": "Пройти ещё раз",
            "quiz.res.copy": "Скопировать результат",
            "quiz.res.copiedLabel": "Скопировано!",
            "quiz.res.toStart": "На старт",
            "quiz.res.copied": "Результат скопирован. Брось вызов друзьям!",
            "quiz.res.copyFailed": "В этом браузере не получилось скопировать результат",
            "quiz.share.text": "🧭 AI Compass · ИИ-испытание\nМой результат: {correct} из {total} ({percent}%), {points}.\nМоё звание: {emoji} {rank}\nСможешь лучше?",

            "quiz.rank.rookie": "Новичок в ИИ",
            "quiz.rank.rookieText": "Каждый эксперт когда-то начинал с нуля. Загляни в уроки и попробуй снова — результат вырастет быстрее, чем кажется!",
            "quiz.rank.explorer": "Исследователь ИИ",
            "quiz.rank.explorerText": "Неплохо! Основы ты уже знаешь. Ещё пара уроков — и ты эксперт.",
            "quiz.rank.expert": "Эксперт по ИИ",
            "quiz.rank.expertText": "Впечатляет! Ты действительно понимаешь, как работает ИИ.",
            "quiz.rank.master": "Мастер ИИ",
            "quiz.rank.masterText": "Потрясающе! Теперь ты можешь объяснить всё это друзьям.",

            "quiz.review.title": "Разбор ответов",
            "quiz.review.filterLabel": "Какие вопросы показать",
            "quiz.review.all": "Все ({n})",
            "quiz.review.mistakes": "Ошибки ({n})",
            "quiz.review.expand": "Развернуть все",
            "quiz.review.collapse": "Свернуть все",
            "quiz.review.yourAnswer": "Твой ответ:",
            "quiz.review.rightAnswer": "Правильный ответ:",
            "quiz.review.noAnswer": "нет ответа, время вышло",
            "quiz.review.statusCorrect": "верно",
            "quiz.review.statusWrong": "неверно",
            "quiz.review.statusTimeout": "время вышло",
            "quiz.review.noMistakes": "Ни одной ошибки. Идеально! 🎉",
            "quiz.review.lesson": "Подробнее: урок {n} · {title}",
            "quiz.review.lessonPlain": "Подробнее — в уроке {n}",
            "quiz.review.timeline": "Открыть историю ИИ",

            "quiz.topic.basics": "Основы ИИ",
            "quiz.topic.ml": "Машинное обучение",
            "quiz.topic.data": "Данные для обучения",
            "quiz.topic.nn": "Нейросети",
            "quiz.topic.genai": "Генеративный ИИ",
            "quiz.topic.hallucination": "Галлюцинации ИИ",
            "quiz.topic.bias": "Предвзятость",
            "quiz.topic.privacy": "Приватность",
            "quiz.topic.everyday": "ИИ вокруг нас",
            "quiz.topic.history": "История ИИ",
            "quiz.topic.responsible": "Ответственное использование",

            "quiz.q1.text": "Что означает «искусственный интеллект» (ИИ)?",
            "quiz.q1.o1": "Компьютерные системы для задач, которые обычно требуют человеческого ума",
            "quiz.q1.o2": "Любая программа, которая работает сама, без постоянного управления человеком",
            "quiz.q1.o3": "Роботы с настоящими чувствами, которые думают точно так же, как люди",
            "quiz.q1.o4": "Машины, которые знают все факты и никогда не ошибаются",
            "quiz.q1.explain": "ИИ — это компьютерные системы, которые решают задачи, обычно связанные с человеческим интеллектом: понимают речь, узнают лица, переводят тексты. Не каждая автоматическая программа — это ИИ: таймер, который включает свет, просто выполняет заданные шаги. А ещё у современного ИИ нет чувств, и он вполне может ошибаться.",

            "quiz.q2.text": "Чем машинное обучение отличается от обычного программирования?",
            "quiz.q2.o1": "Компьютер сам ищет закономерности в примерах, а не только выполняет правила",
            "quiz.q2.o2": "Это то же самое программирование, только на новом и более быстром языке",
            "quiz.q2.o3": "Оно работает только на огромных суперкомпьютерах, но не на телефонах",
            "quiz.q2.o4": "Компьютер запоминает все примеры подряд, а потом просто ищет точное совпадение",
            "quiz.q2.explain": "В машинном обучении компьютеру дают много примеров (скажем, тысячи фото с подписями «кошка» или «собака»), и он сам находит закономерности, поэтому справляется и с новыми фото. В обычном программировании каждое правило пишет человек. Машинное обучение есть и в телефонах — например, в разблокировке по лицу.",

            "quiz.q3.text": "Если ИИ учится на неаккуратных или ошибочных данных, он всё равно будет отвечать идеально.",
            "quiz.q3.explain": "Неверно. Есть известное выражение: «мусор на входе — мусор на выходе». ИИ хорош ровно настолько, насколько хороши данные, на которых он учился. Ошибочные, неаккуратные или однобокие данные приводят к неверным или несправедливым результатам.",

            "quiz.q4.text": "Искусственные нейронные сети — это точные цифровые копии человеческого мозга.",
            "quiz.q4.explain": "Неверно. Нейросети придумали, вдохновившись тем, как нейроны мозга передают друг другу сигналы, но устроены они гораздо проще. Это слои маленьких математических блоков, которые подстраивают связи между собой, обучаясь на данных.",

            "quiz.q5.text": "Как чат-бот вроде ChatGPT пишет свои ответы?",
            "quiz.q5.o1": "Он раз за разом предсказывает вероятное следующее слово по закономерностям из текстов",
            "quiz.q5.o2": "Он ищет в интернете и вставляет в ответ страницу, которая лучше всего подходит к вопросу",
            "quiz.q5.o3": "Он берёт готовый ответ из гигантской базы данных вопросов и ответов",
            "quiz.q5.o4": "Команда людей очень быстро печатает каждый ответ за кадром",
            "quiz.q5.explain": "Чат-боты работают на больших языковых моделях. Они составляют ответ по маленькому кусочку текста (по «токену») за раз и каждый раз предсказывают, что вероятнее всего будет дальше. Поэтому они звучат так гладко, но уверенный тон ещё не значит, что ответ верный.",

            "quiz.q6.text": "Чат-бот может уверенно «цитировать» факты, книги или источники, которых на самом деле не существует.",
            "quiz.q6.explain": "Верно. Это называют «галлюцинацией» ИИ: чат-бот выдаёт правдоподобный, но выдуманный текст. Поэтому важные факты всегда стоит перепроверять в надёжных источниках.",

            "quiz.q7.text": "Систему распознавания лиц обучали в основном на фотографиях людей со светлой кожей. Какая проблема наиболее вероятна?",
            "quiz.q7.o1": "Она может хуже узнавать людей с тёмной кожей",
            "quiz.q7.o2": "Она будет одинаково хорошо работать для всех: лица ведь похожи",
            "quiz.q7.o3": "Она будет узнавать лица только на ярких солнечных фото",
            "quiz.q7.o4": "Никакой: ИИ сам восполнит пробелы в данных, на которых учился",
            "quiz.q7.explain": "Это называют предвзятостью ИИ. ИИ учится на данных и сам не восполнит то, чего в них нет. Если каких-то групп людей в данных мало, система может работать для них хуже или несправедливо. Исследователи находили такую проблему в реальных системах распознавания лиц, поэтому так важны разнообразные данные.",

            "quiz.q8.text": "Что из этого безопаснее всего написать онлайн-чат-боту?",
            "quiz.q8.o1": "Общий вопрос, например «Как устроены вулканы?»",
            "quiz.q8.o2": "Своё полное имя и номер школы, чтобы ответы подходили именно тебе",
            "quiz.q8.o3": "Свой пароль, чтобы чат-бот проверил, достаточно ли он надёжный",
            "quiz.q8.o4": "Скриншот группового чата с сообщениями твоих друзей",
            "quiz.q8.explain": "То, что ты пишешь чат-боту, может сохраняться и иногда использоваться для улучшения ИИ. Никогда не делись паролями и личными данными — полным именем, адресом, номером школы — и не пересылай чужие личные сообщения.",

            "quiz.q9.text": "Что из этого в повседневной жизни обычно использует ИИ?",
            "quiz.q9.o1": "Рекомендации видео в YouTube или TikTok",
            "quiz.q9.o2": "Калькулятор, который перемножает длинные числа",
            "quiz.q9.o3": "Электронный будильник, который звонит в заданное время",
            "quiz.q9.o4": "Микроволновка, которая отсчитывает две минуты",
            "quiz.q9.explain": "Рекомендательные системы учатся на том, что ты смотришь, лайкаешь и пропускаешь, и угадывают, что тебе захочется увидеть дальше. Калькулятор, будильник и таймер микроволновки просто выполняют заданные правила: они полезны, но ничему не учатся и не подстраиваются под тебя.",

            "quiz.q10.text": "Какой учёный в знаменитой статье 1950 года задал вопрос «Могут ли машины мыслить?» и предложил тест, который теперь носит его имя?",
            "quiz.q10.o1": "Алан Тьюринг",
            "quiz.q10.o2": "Ада Лавлейс",
            "quiz.q10.o3": "Джон Маккарти",
            "quiz.q10.o4": "Чарльз Бэббидж",
            "quiz.q10.explain": "В 1950 году британский математик Алан Тьюринг описал «игру в имитацию» — теперь её называют тестом Тьюринга: сможет ли машина общаться так, что её не отличить от человека? Остальные — тоже пионеры: Бэббидж и Лавлейс работали над идеей компьютера ещё в XIX веке, а Маккарти в 1950-х дал ИИ его название.",

            "quiz.q11.text": "Компьютер Deep Blue от IBM обыграл чемпиона мира по шахматам Гарри Каспарова в 1997 году — за 25 лет до выхода ChatGPT в 2022 году.",
            "quiz.q11.explain": "Верно. Deep Blue выиграл матч из шести партий в 1997 году. Он брал в основном вычислительной мощью: перебирал около 200 миллионов шахматных позиций в секунду. ChatGPT, вышедший в ноябре 2022 года, устроен совсем иначе: он учился на огромном количестве текстов.",

            "quiz.q12.text": "Как ответственнее всего использовать ИИ при написании школьного эссе?",
            "quiz.q12.o1": "Брать идеи, проверять факты, писать текст самостоятельно и честно говорить, как помог ИИ",
            "quiz.q12.o2": "Поручить ему всё эссе, а потом заменить пару слов, чтобы текст звучал как твой",
            "quiz.q12.o3": "Доверять его фактам и цитатам — он ведь прочитал миллионы книг",
            "quiz.q12.o4": "Пользоваться им как угодно, лишь бы учитель не догадался",
            "quiz.q12.explain": "ИИ может быть отличным помощником в учёбе, но за свою работу отвечаешь ты. Соблюдай правила школы, проверяй факты в надёжных источниках, думай своей головой и честно говори, когда и как тебе помогал ИИ."
        }
    });

    // ---------- 4. Small helpers ----------

    // Picks the right plural form. English has two (1 point / 2 points),
    // Russian has three (1 очко / 2 очка / 5 очков).
    function pluralForm(n) {
        if (A.lang !== "ru") return n === 1 ? "one" : "many";
        const lastDigit = n % 10;
        const lastTwo = n % 100;
        if (lastDigit === 1 && lastTwo !== 11) return "one";
        if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return "few";
        return "many";
    }

    function plural(key, n, values) {
        return t(key + "." + pluralForm(n), Object.assign({ n: formatNumber(n) }, values || {}));
    }

    // 1280 -> "1,280" in English and "1 280" in Russian
    function formatNumber(n) {
        return Number(n).toLocaleString(A.lang === "ru" ? "ru-RU" : "en-US");
    }

    // Returns a shuffled copy of a list (the Fisher–Yates shuffle)
    function shuffle(list) {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = copy[i];
            copy[i] = copy[j];
            copy[j] = temp;
        }
        return copy;
    }

    // Animations are skipped when the device asks for less motion
    // or when "calm mode" (from effects.js) is on
    function motionOK() {
        return !A.reducedMotion && !document.documentElement.classList.contains("fx-calm");
    }

    // A translated piece of text. The data-i18n attribute lets core.js
    // re-translate it by itself when the language changes.
    function text(key, className) {
        return '<span' + (className ? ' class="' + className + '"' : "") + ' data-i18n="' + key + '">' + t(key) + "</span>";
    }

    // Turns an HTML string into an element
    function createElement(html) {
        const box = document.createElement("div");
        box.innerHTML = html.trim();
        return box.firstElementChild;
    }

    // Plays a CSS animation again from the start
    function replay(element, className) {
        if (!element) return;
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
    }

    function optionKey(question, original) {
        if (question.type === "truefalse") return original === 0 ? "quiz.true" : "quiz.false";
        return "quiz." + question.key + ".o" + (original + 1);
    }

    function rankFor(correct) {
        let rank = RANKS[0];
        RANKS.forEach((item) => {
            if (correct >= item.min) rank = item;
        });
        return rank;
    }

    function lessonTitle(number) {
        if (!Array.isArray(A.lessons)) return "";
        const lesson = A.lessons.find((item) => item.number === number);
        return lesson && typeof lesson.title === "function" ? lesson.title() : "";
    }

    // Is a pop-up window (lesson reader, command palette...) covering the page?
    function dialogOpen() {
        const dialogs = document.querySelectorAll('[aria-modal="true"], dialog[open]');
        for (let i = 0; i < dialogs.length; i++) {
            const dialog = dialogs[i];
            if (mount.contains(dialog)) continue;
            if (dialog.getClientRects().length > 0 && getComputedStyle(dialog).visibility !== "hidden") return true;
        }
        return false;
    }

    function isTypingField(element) {
        return Boolean(element && element.closest && (element.isContentEditable || element.closest("input, textarea, select")));
    }

    // Each mode has its own best score, because the timed mode can give more points
    // (speed bonus). The points are saved as a number, the details of that game next to it:
    //   no timer: "quiz.best" + "quiz.bestRun"     timed: "quiz.bestTimed" + "quiz.bestTimedRun"
    function bestKeys(timed) {
        return timed
            ? { points: "quiz.bestTimed", details: "quiz.bestTimedRun" }
            : { points: "quiz.best", details: "quiz.bestRun" };
    }

    function readBest(timed) {
        const keys = bestKeys(timed);
        const points = A.storage.get(keys.points, null);
        if (typeof points !== "number" || !isFinite(points)) return null;
        const details = A.storage.get(keys.details, null) || {};
        return {
            points: points,
            correct: typeof details.correct === "number" ? details.correct : null,
            total: typeof details.total === "number" ? details.total : QUESTIONS.length
        };
    }

    function saveBest(timed, details) {
        const keys = bestKeys(timed);
        A.storage.set(keys.points, details.points);
        A.storage.set(keys.details, details);
    }

    // Older versions kept one best score for both modes.
    // If that one came from a timed game, move it to the timed place.
    const oldRun = A.storage.get("quiz.bestRun", null);
    if (oldRun && oldRun.timed === true && readBest(true) === null && readBest(false) !== null) {
        saveBest(true, Object.assign({}, oldRun, { points: readBest(false).points }));
        A.storage.remove("quiz.best");
        A.storage.remove("quiz.bestRun");
    }

    // ---------- 5. The state of the quiz ----------
    const state = {
        screen: "start",              // "start", "question" or "results"
        timed: A.storage.get("quiz.timed", false) === true,   // the switch on the start screen
        gameTimed: false,             // was the current game started in timed mode?
        order: [],                    // question numbers in the order of this game
        optionOrders: [],             // for each question: the order of its options
        index: 0,                     // which question we are on
        answers: [],                  // what happened on each question
        points: 0,
        streak: 0,
        bestStreak: 0,
        result: null,                 // filled in when the game ends
        reviewFilter: "all"           // "all" or "mistakes"
    };

    // ---------- 6. The card that holds every screen ----------
    mount.innerHTML =
        '<div class="qz-card card" data-reveal>' +
            '<span class="qz-corners" aria-hidden="true"></span>' +
            '<div class="qz-stage"></div>' +
            '<p class="sr-only qz-live" aria-live="polite" aria-atomic="true"></p>' +
        "</div>";

    const card = mount.querySelector(".qz-card");
    const stage = mount.querySelector(".qz-stage");
    const live = mount.querySelector(".qz-live");

    let ui = {};                // shortcuts to the elements of the current screen
    let paintScreen = null;     // re-writes the texts of the current screen
    let busy = false;           // true while one screen fades into the next
    let swapTimer = 0;
    let resizeTimer = 0;
    let announceTimer = 0;
    let onScreen = false;       // is the quiz card visible?

    // Tell screen-reader users what just happened
    function announce(message) {
        clearTimeout(announceTimer);
        live.textContent = "";
        announceTimer = setTimeout(() => {
            live.textContent = message;
        }, 80);
    }

    function paint() {
        if (paintScreen) paintScreen();
    }

    // Stops the numbers that are counting up (score, percentage)
    function stopCounters() {
        if (scoreFrame) cancelAnimationFrame(scoreFrame);
        if (percentFrame) cancelAnimationFrame(percentFrame);
        scoreFrame = 0;
        percentFrame = 0;
    }

    // Swaps the current screen for a new one: the old one fades out,
    // the card smoothly changes its height and the new one slides in.
    function showScreen(build, options) {
        const settings = options || {};
        const oldScreen = stage.firstElementChild;
        const active = document.activeElement;
        const moveFocus = settings.focus && (settings.forceFocus || card.contains(active) || active === document.body);
        const animate = Boolean(oldScreen) && motionOK() && onScreen;

        clearTimeout(swapTimer);
        clearTimeout(resizeTimer);
        busy = true;

        const swap = () => {
            // Height on screen now (maybe in the middle of an earlier change),
            // then free the height again so the new screen can be measured
            const fromHeight = stage.getBoundingClientRect().height;
            stage.classList.remove("is-resizing");
            stage.style.height = "";
            stopCounters();
            ui = {};
            paintScreen = null;
            const screen = build();
            stage.replaceChildren(screen);
            paint();

            if (animate) {
                const toHeight = stage.getBoundingClientRect().height;
                stage.style.height = fromHeight + "px";
                void stage.offsetHeight;
                stage.classList.add("is-resizing");
                stage.style.height = toHeight + "px";
                screen.classList.add("qz-enter");
                resizeTimer = setTimeout(() => {
                    stage.classList.remove("is-resizing");
                    stage.style.height = "";
                    screen.classList.remove("qz-enter");
                }, 650);
            }

            busy = false;

            // Bring the top of the card back into view (e.g. after "Next" on a phone)
            if (settings.reveal) {
                const box = card.getBoundingClientRect();
                if (box.top < 0 || box.top > window.innerHeight * 0.8) {
                    card.scrollIntoView({ block: "start", behavior: motionOK() ? "smooth" : "auto" });
                }
            }

            if (moveFocus) {
                const target = screen.querySelector(settings.focus);
                if (target) target.focus({ preventScroll: true });
            }
            if (settings.after) settings.after();
        };

        if (animate) {
            oldScreen.classList.add("qz-leave");
            swapTimer = setTimeout(swap, 220);
        } else {
            swap();
        }
    }

    // ---------- 7. START screen ----------
    function buildStart() {
        // Rule 3 has two versions: keyboard shortcuts, or "tap" for touch screens.
        // CSS shows the one that fits the device.
        const rules = [
            ["🧩", "quiz.start.rule1"],
            ["🔥", "quiz.start.rule2"],
            ["⌨️", "quiz.start.rule3", "👆", "quiz.start.rule3Touch"],
            ["💡", "quiz.start.rule4"]
        ].map((rule, index) => {
            let content =
                '<span class="qz-rule-icon' + (rule[2] ? " qz-for-keys" : "") + '" aria-hidden="true">' + rule[0] + "</span>" +
                text(rule[1], "qz-rule-text" + (rule[2] ? " qz-for-keys" : ""));
            if (rule[2]) {
                content +=
                    '<span class="qz-rule-icon qz-for-touch" aria-hidden="true">' + rule[2] + "</span>" +
                    text(rule[3], "qz-rule-text qz-for-touch");
            }
            return '<li class="qz-rule" style="--i:' + index + '">' + content + "</li>";
        }).join("");

        const screen = createElement(
            '<div class="qz-screen qz-start">' +
                '<div class="qz-start-head">' +
                    '<div class="qz-orb" aria-hidden="true">' +
                        '<span class="qz-orb-ring"></span>' +
                        '<span class="qz-orb-ring qz-orb-ring-2"></span>' +
                        '<span class="qz-orb-sweep"></span>' +
                        '<span class="qz-orb-core">🏆</span>' +
                        '<span class="qz-orb-orbit"><span></span></span>' +
                    "</div>" +
                    '<div class="qz-start-intro">' +
                        '<p class="qz-kicker mono">' + text("quiz.start.kicker") + "</p>" +
                        '<h3 class="qz-start-title" tabindex="-1">' + text("quiz.start.title") + "</h3>" +
                        '<p class="qz-start-text">' + text("quiz.start.text") + "</p>" +
                    "</div>" +
                "</div>" +

                '<ul class="qz-tiles qz-start-tiles">' +
                    '<li class="qz-tile"><strong class="qz-tile-value">' + QUESTIONS.length + '</strong><span class="qz-tile-label" data-ref="questionsLabel"></span></li>' +
                    '<li class="qz-tile"><strong class="qz-tile-value">~5</strong><span class="qz-tile-label" data-ref="minutesLabel"></span></li>' +
                    '<li class="qz-tile qz-tile-best">' +
                        '<span class="qz-tile-icon" aria-hidden="true" data-ref="bestIcon"></span>' +
                        '<strong class="qz-tile-value" data-ref="bestValue"></strong>' +
                        '<span class="qz-tile-label" data-ref="bestLabel"></span>' +
                    "</li>" +
                "</ul>" +

                '<div class="qz-rules-box">' +
                    '<p class="qz-mini-title mono">' + text("quiz.start.rulesTitle") + "</p>" +
                    '<ul class="qz-rules">' + rules + "</ul>" +
                "</div>" +

                '<button class="qz-switch" type="button" role="switch" aria-checked="false" aria-labelledby="qz-timed-label" aria-describedby="qz-timed-desc">' +
                    '<span class="qz-switch-icon" aria-hidden="true">⏱️</span>' +
                    '<span class="qz-switch-text">' +
                        '<strong id="qz-timed-label">' + text("quiz.timed.label") + "</strong>" +
                        '<small id="qz-timed-desc" data-ref="timedDesc"></small>' +
                    "</span>" +
                    '<span class="qz-switch-state mono" aria-hidden="true" data-ref="timedState"></span>' +
                    '<span class="qz-switch-track" aria-hidden="true"><span class="qz-switch-thumb"></span></span>' +
                "</button>" +

                '<div class="qz-start-actions">' +
                    '<button class="btn btn-primary qz-start-button" type="button">' +
                        text("quiz.start.button") +
                        '<span class="qz-arrow" aria-hidden="true">→</span>' +
                    "</button>" +
                "</div>" +
            "</div>"
        );

        screen.querySelectorAll("[data-ref]").forEach((element) => {
            ui[element.getAttribute("data-ref")] = element;
        });
        ui.timedSwitch = screen.querySelector(".qz-switch");

        ui.timedSwitch.addEventListener("click", () => setTimed(!state.timed));
        screen.querySelector(".qz-start-button").addEventListener("click", () => startGame());

        paintScreen = paintStart;
        return screen;
    }

    function paintStart() {
        // The "best score" tile shows the record of the mode that is switched on
        const best = readBest(state.timed);
        const bestLabel = t(state.timed ? "quiz.start.bestTimed" : "quiz.start.bestRelaxed");
        ui.questionsLabel.textContent = t("quiz.start.questions." + pluralForm(QUESTIONS.length));
        ui.minutesLabel.textContent = t("quiz.start.minutes." + pluralForm(5));
        ui.bestValue.textContent = best ? formatNumber(best.points) : "—";
        ui.bestValue.parentNode.classList.toggle("is-empty", !best);
        ui.bestIcon.textContent = state.timed ? "⏱️" : "🌿";
        ui.bestLabel.textContent = best && best.correct !== null
            ? t("quiz.start.bestWith", { label: bestLabel, correct: best.correct, total: best.total })
            : bestLabel;
        ui.timedDesc.textContent = t("quiz.timed.desc", {
            time: plural("quiz.seconds", TIME_LIMIT),
            bonus: SPEED_BONUS_MAX
        });
        ui.timedState.textContent = t(state.timed ? "quiz.timed.on" : "quiz.timed.off");
        ui.timedSwitch.setAttribute("aria-checked", String(state.timed));
    }

    function setTimed(value) {
        state.timed = Boolean(value);
        A.storage.set("quiz.timed", state.timed);
        if (state.screen === "start" && ui.timedSwitch) paintStart();
    }

    // ---------- 8. QUESTION screen ----------
    function currentQuestion() {
        return QUESTIONS[state.order[state.index]];
    }

    function buildQuestion() {
        const question = currentQuestion();
        const order = state.optionOrders[state.index];
        const total = state.order.length;
        const isLast = state.index === total - 1;

        const options = order.map((original, position) =>
            '<button class="qz-option" type="button" data-position="' + position + '" style="--i:' + position + '">' +
                '<kbd class="qz-key" aria-hidden="true">' + (position + 1) + "</kbd>" +
                text(optionKey(question, original), "qz-option-text") +
                '<span class="qz-mark" aria-hidden="true"></span>' +
                '<span class="sr-only qz-sr-correct" data-i18n="quiz.q.srCorrect" hidden>' + t("quiz.q.srCorrect") + "</span>" +
                '<span class="sr-only qz-sr-picked" data-i18n="quiz.q.srPicked" hidden>' + t("quiz.q.srPicked") + "</span>" +
            "</button>"
        ).join("");

        let segments = "";
        for (let i = 0; i < total; i++) segments += '<span class="qz-seg"></span>';

        const timer = state.gameTimed
            ? '<div class="qz-timer" role="timer">' +
                  '<svg viewBox="0 0 64 64" aria-hidden="true">' +
                      '<circle class="qz-timer-track" cx="32" cy="32" r="27"></circle>' +
                      '<circle class="qz-timer-bar" cx="32" cy="32" r="27" stroke-dasharray="' + TIMER_LENGTH.toFixed(2) + '"></circle>' +
                  "</svg>" +
                  '<span class="qz-timer-num" aria-hidden="true">' + TIME_LIMIT + "</span>" +
                  '<span class="sr-only qz-timer-sr"></span>' +
              "</div>"
            : "";

        const screen = createElement(
            '<div class="qz-screen qz-question' + (question.type === "truefalse" ? " is-truefalse" : "") + '">' +
                '<div class="qz-hud">' +
                    '<div class="qz-hud-left">' +
                        '<span class="qz-counter mono" aria-hidden="true" data-ref="counter"></span>' +
                        '<span class="qz-topic">' + text("quiz.topic." + question.topic) + "</span>" +
                    "</div>" +
                    '<div class="qz-hud-right">' +
                        '<div class="qz-score">' +
                            '<span class="qz-score-label mono">' + text("quiz.q.score") + "</span>" +
                            '<strong class="qz-score-value" data-ref="score"></strong>' +
                            '<span class="qz-score-pop mono" aria-hidden="true" data-ref="scorePop"></span>' +
                        "</div>" +
                        '<div class="qz-streak" data-ref="streak" hidden>' +
                            '<span class="qz-flame" aria-hidden="true">🔥</span>' +
                            '<span class="qz-streak-text" aria-hidden="true" data-ref="streakText"></span>' +
                            '<span class="sr-only" data-ref="streakSr"></span>' +
                        "</div>" +
                        timer +
                    "</div>" +
                "</div>" +

                '<div class="qz-progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" data-i18n-attr="aria-label:quiz.q.progressLabel" aria-label="' + t("quiz.q.progressLabel") + '">' +
                    segments +
                "</div>" +

                '<div class="qz-type-row">' +
                    '<p class="qz-type mono">' + text("quiz.q.type." + question.type) + "</p>" +
                    '<button class="qz-quit" type="button" data-ref="quit">' +
                        '<span class="qz-quit-icon" aria-hidden="true">✕</span>' +
                        '<span data-ref="quitText"></span>' +
                    "</button>" +
                "</div>" +
                '<h3 class="qz-question-text" id="qz-question-text" tabindex="-1">' +
                    '<span class="sr-only" data-ref="counterSr"></span>' +
                    text("quiz." + question.key + ".text") +
                "</h3>" +

                '<div class="qz-options" role="group" aria-labelledby="qz-question-text">' + options + "</div>" +

                '<div class="qz-feedback" data-ref="feedback" hidden>' +
                    '<div class="qz-fb-head">' +
                        '<span class="qz-fb-icon" aria-hidden="true"></span>' +
                        '<strong class="qz-fb-title" data-ref="fbTitle"></strong>' +
                        '<span class="qz-fb-points mono" data-ref="fbPoints"></span>' +
                    "</div>" +
                    '<p class="qz-fb-answer" data-ref="fbAnswer" hidden></p>' +
                    '<p class="qz-fb-explain">' + text("quiz." + question.key + ".explain") + "</p>" +
                    '<ul class="qz-fb-bonus" data-ref="fbBonus"></ul>' +
                    '<div class="qz-fb-actions">' +
                        '<button class="btn btn-primary qz-next" type="button">' +
                            text(isLast ? "quiz.q.finish" : "quiz.q.next") +
                            '<span class="qz-arrow" aria-hidden="true">→</span>' +
                        "</button>" +
                        '<span class="qz-hint mono">' + text("quiz.q.enterHint") + "</span>" +
                    "</div>" +
                "</div>" +
            "</div>"
        );

        screen.querySelectorAll("[data-ref]").forEach((element) => {
            ui[element.getAttribute("data-ref")] = element;
        });
        ui.options = Array.prototype.slice.call(screen.querySelectorAll(".qz-option"));
        ui.segments = Array.prototype.slice.call(screen.querySelectorAll(".qz-seg"));
        ui.progress = screen.querySelector(".qz-progress");
        ui.next = screen.querySelector(".qz-next");
        ui.timer = screen.querySelector(".qz-timer");
        if (ui.timer) {
            ui.timerBar = ui.timer.querySelector(".qz-timer-bar");
            ui.timerNum = ui.timer.querySelector(".qz-timer-num");
            ui.timerSr = ui.timer.querySelector(".qz-timer-sr");
        }

        ui.options.forEach((button) => {
            button.addEventListener("click", () => answer(Number(button.getAttribute("data-position"))));
        });
        ui.next.addEventListener("click", goNext);
        ui.quit.addEventListener("click", pressQuit);
        disarmQuit();

        // Coming back to a question that is already answered (e.g. startQuiz() again)
        const record = state.answers[state.index];
        if (record) markOptions(record);

        paintScreen = paintQuestion;
        return screen;
    }

    function paintQuestion() {
        const total = state.order.length;
        const answered = state.answers.filter(Boolean).length;
        const record = state.answers[state.index];
        const question = currentQuestion();

        ui.counter.textContent = t("quiz.q.counter", { n: state.index + 1, total: total });
        ui.counterSr.textContent = t("quiz.q.counter", { n: state.index + 1, total: total }) + ". ";
        if (!scoreFrame) ui.score.textContent = formatNumber(state.points);

        // Streak counter: only shown from 2 correct answers in a row
        ui.streak.hidden = state.streak < 2;
        ui.streak.classList.toggle("is-hot", state.streak >= 4);
        ui.streakText.textContent = t("quiz.q.streak", { n: state.streak });
        ui.streakSr.textContent = plural("quiz.q.streakSr", state.streak);

        // Progress bar: one segment per question
        ui.progress.setAttribute("aria-valuenow", String(answered));
        ui.progress.setAttribute("aria-valuetext", t("quiz.q.progressText", { n: answered, total: total }));
        ui.segments.forEach((segment, index) => {
            const done = state.answers[index];
            segment.classList.toggle("is-correct", Boolean(done && done.correct));
            segment.classList.toggle("is-wrong", Boolean(done && !done.correct));
            segment.classList.toggle("is-current", index === state.index && !done);
        });

        if (ui.timerSr) {
            ui.timerSr.textContent = t("quiz.q.timeLeft", { time: plural("quiz.seconds", shownSeconds()) });
        }
        paintQuit();

        // Feedback after answering
        if (!record) return;
        ui.fbTitle.textContent = feedbackTitle(record);
        ui.fbPoints.textContent = record.points > 0 ? "+" + plural("quiz.points", record.points) : t("quiz.fb.noPoints");
        // True/false explanations already start with "True." or "False."
        const showRight = !record.correct && question.type !== "truefalse";
        ui.fbAnswer.hidden = !showRight;
        ui.fbAnswer.textContent = showRight ? t("quiz.fb.rightAnswer", { answer: t(optionKey(question, question.correct)) }) : "";

        const bonus = [];
        if (record.base) bonus.push(["base", t("quiz.fb.base", { n: record.base })]);
        if (record.speed) bonus.push(["speed", "⚡ " + t("quiz.fb.speed", { n: record.speed })]);
        if (record.streakBonus) bonus.push(["streak", "🔥 " + t("quiz.fb.streak", { n: record.streakBonus })]);
        if (record.lostStreak >= 2) bonus.push(["lost", t("quiz.fb.streakLost")]);
        ui.fbBonus.replaceChildren(...bonus.map((item) => {
            const chip = document.createElement("li");
            chip.className = "qz-bonus qz-bonus-" + item[0];
            chip.textContent = item[1];
            return chip;
        }));
        ui.fbBonus.hidden = bonus.length === 0;
    }

    function feedbackTitle(record) {
        if (record.timeout) return t("quiz.fb.timeout");
        return record.correct ? t("quiz.fb.correct" + record.praise) : t("quiz.fb.wrong");
    }

    // "Quit" needs two presses, so one accidental tap doesn't end the game.
    // After the first press the button asks "Sure?" for 4 seconds.
    let quitArmed = false;
    let quitTimer = 0;

    function pressQuit() {
        if (state.screen !== "question" || busy) return;
        if (quitArmed) {
            disarmQuit();
            backToStart();
            return;
        }
        quitArmed = true;
        paintQuit();
        announce(t("quiz.q.quitHint"));
        clearTimeout(quitTimer);
        quitTimer = setTimeout(disarmQuit, 4000);
    }

    function disarmQuit() {
        clearTimeout(quitTimer);
        quitArmed = false;
        paintQuit();
    }

    function paintQuit() {
        if (!ui.quit) return;
        ui.quit.classList.toggle("is-armed", quitArmed);
        ui.quitText.textContent = t(quitArmed ? "quiz.q.quitConfirm" : "quiz.q.quit");
    }

    // ---------- 9. The countdown (timed mode) ----------
    const timer = {
        active: false,
        remaining: 0,      // milliseconds left
        last: 0,
        frame: 0,
        checkedAt: 0,
        blocked: false,    // a pop-up window covers the page
        seconds: -1,
        warned: false
    };

    function shownSeconds() {
        return Math.max(0, Math.ceil(timer.remaining / 1000));
    }

    function startTimer() {
        stopTimer();
        timer.active = true;
        timer.remaining = TIME_LIMIT * 1000;
        timer.seconds = -1;
        timer.warned = false;
        drawTimer(true);
        resumeTimer();
    }

    function stopTimer() {
        timer.active = false;
        if (timer.frame) cancelAnimationFrame(timer.frame);
        timer.frame = 0;
    }

    function resumeTimer() {
        if (!timer.active || timer.frame || !onScreen || document.hidden) return;
        timer.last = performance.now();
        timer.frame = requestAnimationFrame(tickTimer);
    }

    function tickTimer(now) {
        timer.frame = 0;
        if (!timer.active) return;

        // Checking for pop-ups is a bit slow, so only every 300 ms
        if (now - timer.checkedAt > 300) {
            timer.checkedAt = now;
            timer.blocked = dialogOpen();
        }

        // The clock only runs while you can actually see the question
        const running = onScreen && !document.hidden && !timer.blocked;
        if (running) timer.remaining -= Math.min(100, Math.max(0, now - timer.last));
        timer.last = now;
        drawTimer(!running);

        if (timer.remaining <= 0) {
            stopTimer();
            answer(null);
            return;
        }

        // Off screen or in a hidden tab the loop stops; the observers start it again
        if (onScreen && !document.hidden) timer.frame = requestAnimationFrame(tickTimer);
    }

    function drawTimer(paused) {
        if (!ui.timer) return;
        const fraction = Math.max(0, timer.remaining) / (TIME_LIMIT * 1000);
        ui.timerBar.style.strokeDashoffset = (TIMER_LENGTH * (1 - fraction)).toFixed(2);
        ui.timer.classList.toggle("is-paused", Boolean(paused) && timer.active);

        const seconds = shownSeconds();
        if (seconds === timer.seconds) return;
        timer.seconds = seconds;
        ui.timerNum.textContent = String(seconds);
        ui.timerSr.textContent = t("quiz.q.timeLeft", { time: plural("quiz.seconds", seconds) });
        ui.timer.classList.toggle("is-warning", seconds <= 10 && seconds > 5);
        ui.timer.classList.toggle("is-danger", seconds <= 5);
        if (seconds <= 5 && seconds > 0 && timer.active) replay(ui.timerNum, "is-tick");

        if (seconds === 5 && !timer.warned && timer.active) {
            timer.warned = true;
            announce(t("quiz.q.timeLeft", { time: plural("quiz.seconds", 5) }));
        }
    }

    // ---------- 10. Answering ----------
    let scoreFrame = 0;

    // position: which button was chosen (0-3), or null when the time ran out
    function answer(position) {
        if (state.screen !== "question" || busy || state.answers[state.index]) return;

        const question = currentQuestion();
        const order = state.optionOrders[state.index];
        const picked = position === null ? null : order[position];
        if (position !== null && picked === undefined) return;

        const correct = picked === question.correct;
        const secondsLeft = state.gameTimed ? Math.max(0, timer.remaining) / 1000 : 0;
        stopTimer();

        const record = {
            picked: picked,
            correct: correct,
            timeout: position === null,
            base: 0,
            speed: 0,
            streakBonus: 0,
            points: 0,
            lostStreak: 0,
            praise: 1 + Math.floor(Math.random() * PRAISE_COUNT)
        };

        if (correct) {
            state.streak += 1;
            record.base = BASE_POINTS;
            if (state.gameTimed) record.speed = Math.round(SPEED_BONUS_MAX * Math.min(1, secondsLeft / TIME_LIMIT));
            if (state.streak >= 2) record.streakBonus = Math.min(STREAK_BONUS_MAX, (state.streak - 1) * STREAK_STEP);
            record.points = record.base + record.speed + record.streakBonus;
        } else {
            record.lostStreak = state.streak;
            state.streak = 0;
        }
        state.bestStreak = Math.max(state.bestStreak, state.streak);

        const oldPoints = state.points;
        state.points += record.points;
        state.answers[state.index] = record;

        // Where is the focus? Keyboard users get moved on to the "Next" button.
        const active = document.activeElement;
        const keepFocus = card.contains(active) || active === document.body || !active;

        markOptions(record, true);
        ui.feedback.hidden = false;
        ui.feedback.classList.remove("is-good", "is-bad", "is-timeout");
        ui.feedback.classList.add(record.timeout ? "is-timeout" : record.correct ? "is-good" : "is-bad");
        replay(ui.feedback, "is-in");
        replay(card, correct ? "is-flash-good" : "is-flash-bad");
        paint();

        if (record.points > 0) {
            animateScore(oldPoints, state.points);
            ui.scorePop.textContent = "+" + formatNumber(record.points);
            replay(ui.scorePop, "is-popping");
        }
        if (state.streak >= 2) replay(ui.streak, "is-bump");

        // The message for screen readers: result, points, right answer, explanation
        const parts = [feedbackTitle(record)];
        if (record.points > 0) parts.push("+" + plural("quiz.points", record.points) + ".");
        if (!record.correct && question.type !== "truefalse") {
            parts.push(t("quiz.fb.rightAnswer", { answer: t(optionKey(question, question.correct)) }) + ".");
        }
        parts.push(t("quiz." + question.key + ".explain"));
        announce(parts.join(" "));

        if (keepFocus) ui.next.focus({ preventScroll: true });

        // Make sure the explanation and the "Next" button can be seen.
        // The button stops above the assistant's round button in the bottom corner,
        // but we never scroll so far that the top of the explanation disappears.
        requestAnimationFrame(() => {
            if (!ui.next || !ui.next.isConnected) return;
            const box = ui.next.getBoundingClientRect();
            const feedbackTop = ui.feedback.getBoundingClientRect().top;
            const lowest = window.innerHeight - BOTTOM_SPACE;
            const distance = Math.min(box.bottom - lowest, feedbackTop - TOP_SPACE);
            if (box.bottom > lowest && distance > 0) {
                window.scrollBy({ top: distance, behavior: motionOK() ? "smooth" : "auto" });
            }
        });
    }

    // Colours the options: green for the right one, red for a wrong pick
    function markOptions(record, animate) {
        const question = currentQuestion();
        const order = state.optionOrders[state.index];
        ui.options.forEach((button, position) => {
            const original = order[position];
            const isRight = original === question.correct;
            const isPicked = original === record.picked;
            button.setAttribute("aria-disabled", "true");
            button.classList.add("is-locked");
            button.classList.toggle("is-correct", isRight);
            button.classList.toggle("is-wrong", isPicked && !isRight);
            button.classList.toggle("is-picked", isPicked);
            button.classList.toggle("is-dim", !isRight && !isPicked);
            button.querySelector(".qz-sr-correct").hidden = !isRight;
            button.querySelector(".qz-sr-picked").hidden = !isPicked;
            if (!animate) button.classList.add("no-anim");
        });
    }

    // The score counts up to its new value
    function animateScore(from, to) {
        if (scoreFrame) cancelAnimationFrame(scoreFrame);
        scoreFrame = 0;
        if (!ui.score) return;
        if (!motionOK()) {
            ui.score.textContent = formatNumber(to);
            return;
        }
        const element = ui.score;
        const start = performance.now();
        const duration = 700;
        const step = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = formatNumber(Math.round(from + (to - from) * eased));
            scoreFrame = progress < 1 && element.isConnected ? requestAnimationFrame(step) : 0;
        };
        scoreFrame = requestAnimationFrame(step);
    }

    function goNext() {
        if (state.screen !== "question" || busy || !state.answers[state.index]) return;
        if (state.index < state.order.length - 1) {
            state.index += 1;
            showScreen(buildQuestion, { focus: ".qz-question-text", reveal: true, after: beginQuestion });
        } else {
            finishGame();
        }
    }

    function beginQuestion() {
        if (state.gameTimed && !state.answers[state.index]) startTimer();
    }

    // ---------- 11. Starting and finishing a game ----------
    function startGame(options) {
        const settings = options || {};
        stopTimer();
        stopConfetti();
        state.gameTimed = state.timed;
        state.order = shuffle(QUESTIONS.map((question, index) => index));
        state.optionOrders = state.order.map((index) =>
            QUESTIONS[index].type === "truefalse" ? [0, 1] : shuffle([0, 1, 2, 3])
        );
        state.index = 0;
        state.answers = [];
        state.points = 0;
        state.streak = 0;
        state.bestStreak = 0;
        state.result = null;
        state.reviewFilter = "all";
        state.screen = "question";
        showScreen(buildQuestion, {
            focus: ".qz-question-text",
            forceFocus: settings.forceFocus,
            reveal: settings.reveal !== false,
            after: beginQuestion
        });
    }

    function finishGame() {
        stopTimer();
        const total = state.order.length;
        const correct = state.answers.filter((record) => record && record.correct).length;
        // Compare with the best score of the same mode (timed or not)
        const best = readBest(state.gameTimed);
        const isNewBest = state.points > 0 && (!best || state.points > best.points);

        if (isNewBest) {
            saveBest(state.gameTimed, {
                points: state.points,
                correct: correct,
                total: total,
                timed: state.gameTimed,
                date: new Date().toISOString().slice(0, 10)
            });
        }

        state.result = {
            correct: correct,
            total: total,
            percent: Math.round((correct / total) * 100),
            points: state.points,
            bestStreak: state.bestStreak,
            timed: state.gameTimed,
            isNewBest: isNewBest,
            previousBest: best ? best.points : null,
            rank: rankFor(correct)
        };
        state.screen = "results";
        ringShown = false;
        showScreen(buildResults, { focus: ".qz-res-title", reveal: true, after: animateResults });
    }

    function backToStart() {
        stopTimer();
        stopConfetti();
        state.screen = "start";
        showScreen(buildStart, { focus: ".qz-start-title", reveal: true });
    }

    // ---------- 12. RESULTS screen ----------
    function buildResults() {
        const result = state.result;
        const rank = result.rank;

        const review = state.order.map((questionIndex, position) => {
            const question = QUESTIONS[questionIndex];
            const record = state.answers[position];
            const status = record.timeout ? "timeout" : record.correct ? "correct" : "wrong";
            const statusKey = "quiz.review.status" + status.charAt(0).toUpperCase() + status.slice(1);
            const yourAnswer = record.timeout
                ? text("quiz.review.noAnswer", "qz-ri-value")
                : text(optionKey(question, record.picked), "qz-ri-value");
            const rightLine = record.correct
                ? ""
                : '<p class="qz-ri-line is-right">' + text("quiz.review.rightAnswer", "qz-ri-label") + " " + text(optionKey(question, question.correct), "qz-ri-value") + "</p>";

            let learn = "";
            if (typeof question.learn === "number" && typeof A.openLesson === "function") {
                learn = '<button class="btn btn-ghost btn-small qz-ri-learn" type="button" data-lesson="' + question.learn + '"><span aria-hidden="true">📚</span><span class="qz-ri-learn-text"></span></button>';
            } else if (question.learn === "timeline" && document.getElementById("timeline")) {
                learn = '<button class="btn btn-ghost btn-small qz-ri-learn" type="button" data-section="timeline"><span aria-hidden="true">🕰️</span>' + text("quiz.review.timeline") + "</button>";
            }

            return '<li class="qz-ri is-' + status + '" data-status="' + status + '">' +
                "<details>" +
                    "<summary>" +
                        '<span class="qz-ri-status" aria-hidden="true"></span>' +
                        '<span class="qz-ri-num mono" aria-hidden="true">' + String(position + 1).padStart(2, "0") + "</span>" +
                        '<span class="qz-ri-question">' + text("quiz." + question.key + ".text") +
                            '<span class="sr-only">, ' + text(statusKey) + "</span>" +
                        "</span>" +
                        '<span class="qz-ri-points mono" aria-hidden="true">' + (record.points ? "+" + record.points : "0") + "</span>" +
                        '<span class="qz-ri-chevron" aria-hidden="true"></span>' +
                    "</summary>" +
                    '<div class="qz-ri-body">' +
                        '<p class="qz-ri-line is-yours">' + text("quiz.review.yourAnswer", "qz-ri-label") + " " + yourAnswer + "</p>" +
                        rightLine +
                        '<p class="qz-ri-explain">' + text("quiz." + question.key + ".explain") + "</p>" +
                        learn +
                    "</div>" +
                "</details>" +
            "</li>";
        }).join("");

        const tiles = [
            ["correct", "quiz.res.correct", "✅"],
            ["points", "quiz.res.points", "⭐"],
            ["streak", "quiz.res.bestStreak", "🔥"],
            ["mode", "quiz.res.mode", result.timed ? "⏱️" : "🌿"]
        ].map((tile, index) =>
            '<li class="qz-tile qz-tile-' + tile[0] + '" style="--i:' + index + '">' +
                '<span class="qz-tile-icon" aria-hidden="true">' + tile[2] + "</span>" +
                '<strong class="qz-tile-value" data-ref="tile-' + tile[0] + '"></strong>' +
                text(tile[1], "qz-tile-label") +
            "</li>"
        ).join("");

        const screen = createElement(
            '<div class="qz-screen qz-results rank-' + rank.id + '">' +
                '<div class="qz-res-hero">' +
                    '<div class="qz-res-ring" data-ref="ring">' +
                        '<svg viewBox="0 0 160 160" aria-hidden="true">' +
                            "<defs>" +
                                '<linearGradient id="qz-ring-gradient" x1="0" y1="0" x2="1" y2="1">' +
                                    '<stop class="qz-stop-a" offset="0"></stop>' +
                                    '<stop class="qz-stop-b" offset="1"></stop>' +
                                "</linearGradient>" +
                            "</defs>" +
                            '<circle class="qz-res-ticks" cx="80" cy="80" r="77"></circle>' +
                            '<circle class="qz-res-track" cx="80" cy="80" r="66"></circle>' +
                            '<circle class="qz-res-bar" cx="80" cy="80" r="66" stroke="url(#qz-ring-gradient)" stroke-dasharray="' + RESULT_LENGTH.toFixed(2) + '" stroke-dashoffset="' + RESULT_LENGTH.toFixed(2) + '"></circle>' +
                        "</svg>" +
                        '<div class="qz-res-center" aria-hidden="true">' +
                            '<strong class="qz-res-percent"><span data-ref="percent">0</span><span class="qz-res-pct">%</span></strong>' +
                            '<span class="qz-res-caption mono">' + text("quiz.res.ringCaption") + "</span>" +
                        "</div>" +
                        '<span class="sr-only" data-ref="ringSr"></span>' +
                    "</div>" +
                    '<div class="qz-res-info">' +
                        '<p class="qz-kicker mono">' + text("quiz.res.kicker") + "</p>" +
                        '<h3 class="qz-res-title" tabindex="-1">' +
                            '<span class="qz-rank-emoji" aria-hidden="true">' + rank.emoji + "</span>" +
                            text("quiz.rank." + rank.id, "qz-rank-name") +
                        "</h3>" +
                        '<p class="qz-res-text">' + text("quiz.rank." + rank.id + "Text") + "</p>" +
                        '<p class="qz-best' + (result.isNewBest ? " is-new" : "") + '" data-ref="best">' +
                            '<span aria-hidden="true">' + (result.isNewBest ? "✨" : "🏅") + "</span>" +
                            '<span data-ref="bestText"></span>' +
                        "</p>" +
                    "</div>" +
                "</div>" +

                '<ul class="qz-tiles qz-res-tiles">' + tiles + "</ul>" +

                '<div class="qz-res-actions">' +
                    '<button class="btn btn-primary qz-retry" type="button"><span class="qz-retry-icon" aria-hidden="true">↻</span>' + text("quiz.res.retry") + "</button>" +
                    '<button class="btn btn-ghost qz-copy" type="button">' +
                        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
                        text("quiz.res.copy", "qz-copy-label") +
                        text("quiz.res.copiedLabel", "qz-copied-label") +
                    "</button>" +
                    '<button class="btn btn-ghost qz-to-start" type="button">' + text("quiz.res.toStart") + "</button>" +
                "</div>" +

                '<div class="qz-review">' +
                    '<div class="qz-review-head">' +
                        '<h4 class="qz-review-title">' + text("quiz.review.title") + "</h4>" +
                        '<div class="qz-review-tools">' +
                            '<div class="qz-filters" role="group" data-i18n-attr="aria-label:quiz.review.filterLabel" aria-label="' + t("quiz.review.filterLabel") + '">' +
                                '<button class="chip" type="button" data-filter="all" data-ref="filterAll"></button>' +
                                '<button class="chip" type="button" data-filter="mistakes" data-ref="filterMistakes"></button>' +
                            "</div>" +
                            '<button class="btn btn-ghost btn-small qz-expand" type="button" data-ref="expand"></button>' +
                        "</div>" +
                    "</div>" +
                    '<p class="qz-review-empty" data-ref="empty" hidden>' + text("quiz.review.noMistakes") + "</p>" +
                    '<ol class="qz-review-list" data-ref="reviewList">' + review + "</ol>" +
                "</div>" +
            "</div>"
        );

        screen.querySelectorAll("[data-ref]").forEach((element) => {
            ui[element.getAttribute("data-ref")] = element;
        });
        ui.items = Array.prototype.slice.call(screen.querySelectorAll(".qz-ri"));
        ui.copy = screen.querySelector(".qz-copy");

        screen.querySelector(".qz-retry").addEventListener("click", () => startGame());
        screen.querySelector(".qz-to-start").addEventListener("click", backToStart);
        ui.copy.addEventListener("click", copyResult);

        ui.filterAll.addEventListener("click", () => setFilter("all"));
        ui.filterMistakes.addEventListener("click", () => setFilter("mistakes"));
        ui.expand.addEventListener("click", toggleAll);

        // "toggle" doesn't bubble, so we listen while it travels down (capture)
        ui.reviewList.addEventListener("toggle", paintReviewTools, true);

        ui.reviewList.addEventListener("click", (event) => {
            const button = event.target.closest(".qz-ri-learn");
            if (!button) return;
            const lesson = Number(button.getAttribute("data-lesson"));
            if (lesson && typeof A.openLesson === "function") {
                // The lesson opens on top of the page. We hand over this button, so that
                // closing the lesson brings you right back here, to your review.
                // (Some browsers don't focus a clicked button, so we do it ourselves.)
                button.focus({ preventScroll: true });
                A.openLesson(lesson, button);
            } else if (button.getAttribute("data-section")) {
                A.scrollToSection(button.getAttribute("data-section"));
            }
        });

        paintScreen = paintResults;
        return screen;
    }

    function paintResults() {
        const result = state.result;
        ui.ringSr.textContent = t("quiz.res.ringSr", { percent: result.percent });
        if (!percentFrame) ui.percent.textContent = String(ringShown ? result.percent : 0);

        ui["tile-correct"].textContent = result.correct + " / " + result.total;
        ui["tile-points"].textContent = formatNumber(result.points);
        ui["tile-streak"].textContent = String(result.bestStreak);
        ui["tile-mode"].textContent = t(result.timed ? "quiz.res.modeTimed" : "quiz.res.modeRelaxed");

        // "New best score!" or the best score of this mode.
        // No best score yet (a first game with 0 points)? Then the badge stays hidden.
        const best = readBest(result.timed);
        ui.best.hidden = !result.isNewBest && !best;
        if (result.isNewBest) {
            ui.bestText.textContent = t("quiz.res.newBest");
        } else if (best) {
            ui.bestText.textContent = t(result.timed ? "quiz.res.bestWasTimed" : "quiz.res.bestWas", {
                points: plural("quiz.points", best.points)
            });
        }

        // "Learn more" buttons use the lesson titles in the current language
        ui.reviewList.querySelectorAll(".qz-ri-learn[data-lesson]").forEach((button) => {
            const n = Number(button.getAttribute("data-lesson"));
            const title = lessonTitle(n);
            button.querySelector(".qz-ri-learn-text").textContent = title
                ? t("quiz.review.lesson", { n: n, title: title })
                : t("quiz.review.lessonPlain", { n: n });
        });

        paintReviewTools();
    }

    // Filter chips, "Expand all" and the "no mistakes" message
    function paintReviewTools() {
        if (state.screen !== "results" || !ui.items) return;
        const mistakes = ui.items.filter((item) => item.getAttribute("data-status") !== "correct").length;
        ui.filterAll.textContent = t("quiz.review.all", { n: ui.items.length });
        ui.filterMistakes.textContent = t("quiz.review.mistakes", { n: mistakes });
        ui.filterAll.setAttribute("aria-pressed", String(state.reviewFilter === "all"));
        ui.filterMistakes.setAttribute("aria-pressed", String(state.reviewFilter === "mistakes"));

        const visible = ui.items.filter((item) => !item.hidden);
        ui.empty.hidden = visible.length > 0;
        ui.expand.hidden = visible.length === 0;
        const allOpen = visible.length > 0 && visible.every((item) => item.querySelector("details").open);
        ui.expand.textContent = t(allOpen ? "quiz.review.collapse" : "quiz.review.expand");
        ui.expand.setAttribute("data-open", String(allOpen));
    }

    function setFilter(filter) {
        state.reviewFilter = filter;
        ui.items.forEach((item) => {
            item.hidden = filter === "mistakes" && item.getAttribute("data-status") === "correct";
        });
        paintReviewTools();
    }

    function toggleAll() {
        const open = ui.expand.getAttribute("data-open") !== "true";
        ui.items.forEach((item) => {
            if (!item.hidden) item.querySelector("details").open = open;
        });
        paintReviewTools();
    }

    // The score ring fills up and the percentage counts up
    let percentFrame = 0;
    let ringShown = false;
    let confettiTimer = 0;

    function animateResults() {
        const result = state.result;
        const bar = stage.querySelector(".qz-res-bar");
        if (!bar || !result) return;
        const target = RESULT_LENGTH * (1 - result.percent / 100);
        bar.classList.toggle("is-empty", result.percent === 0);

        // A short summary for screen-reader users
        let summary = t("quiz.res.announce", {
            correct: result.correct,
            total: result.total,
            points: plural("quiz.points", result.points),
            rank: t("quiz.rank." + result.rank.id)
        });
        if (result.isNewBest) summary += " " + t("quiz.res.newBest");
        announce(summary);

        if (!motionOK()) {
            ringShown = true;
            bar.style.strokeDashoffset = target.toFixed(2);
            paint();
            return;
        }

        ringShown = false;
        void bar.getBoundingClientRect();   // the browser notes the "empty" ring first
        requestAnimationFrame(() => {
            bar.classList.add("is-animated");
            bar.style.strokeDashoffset = target.toFixed(2);
        });

        const element = ui.percent;
        const start = performance.now();
        const duration = 1400;
        const step = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = String(Math.round(result.percent * eased));
            if (progress < 1 && element.isConnected) {
                percentFrame = requestAnimationFrame(step);
            } else {
                percentFrame = 0;
                ringShown = true;
                if (element.isConnected) {
                    element.textContent = String(result.percent);
                    replay(ui.ring, "is-done");
                }
            }
        };
        percentFrame = requestAnimationFrame(step);

        if (result.isNewBest) {
            clearTimeout(confettiTimer);
            confettiTimer = setTimeout(() => {
                if (state.screen === "results" && ui.ring && ui.ring.isConnected) burstConfetti(ui.ring);
            }, 950);
        }
    }

    // ---------- 13. Confetti (only for a new best score) ----------
    let confetti = null;

    function confettiColors() {
        return ["--accent", "--accent-2", "--accent-3", "--success", "--warning"]
            .map((name) => A.cssVar(name))
            .filter(Boolean);
    }

    function burstConfetti(origin) {
        if (!motionOK() || document.hidden) return;
        stopConfetti();

        const canvas = document.createElement("canvas");
        canvas.className = "qz-confetti";
        canvas.setAttribute("aria-hidden", "true");
        const context = canvas.getContext("2d");
        if (!context) return;
        document.body.appendChild(canvas);

        // Sharp on retina screens, but never more than 2x (faster)
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        const box = origin.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;
        const count = width < 600 ? 90 : 150;
        const pieces = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 220 + Math.random() * 560;
            pieces.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 260,
                size: 5 + Math.random() * 7,
                shape: Math.random() < 0.3 ? "circle" : "strip",
                turn: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 14,
                color: i
            });
        }

        confetti = {
            canvas: canvas,
            context: context,
            width: width,
            height: height,
            pieces: pieces,
            colors: confettiColors(),
            start: performance.now(),
            last: performance.now(),
            frame: 0
        };
        confetti.frame = requestAnimationFrame(drawConfetti);
    }

    function drawConfetti(now) {
        const party = confetti;
        if (!party) return;
        const dt = Math.min(0.05, (now - party.last) / 1000);
        party.last = now;
        const age = (now - party.start) / 1000;
        const fade = age > 2.2 ? Math.max(0, 1 - (age - 2.2) / 0.9) : 1;
        const context = party.context;

        context.clearRect(0, 0, party.width, party.height);
        context.globalAlpha = fade;

        let alive = 0;
        party.pieces.forEach((piece) => {
            // Gravity pulls down, air slows everything down
            piece.vy += 980 * dt;
            piece.vx *= 1 - 1.6 * dt;
            piece.vy *= 1 - 1.1 * dt;
            piece.x += piece.vx * dt;
            piece.y += piece.vy * dt;
            piece.turn += piece.spin * dt;
            if (piece.y > party.height + 30) return;
            alive++;

            context.save();
            context.translate(piece.x, piece.y);
            context.rotate(piece.turn);
            context.fillStyle = party.colors[piece.color % party.colors.length] || "#9b6dff";
            if (piece.shape === "circle") {
                context.beginPath();
                context.arc(0, 0, piece.size * 0.38, 0, Math.PI * 2);
                context.fill();
            } else {
                // Squashing the width looks like a strip of paper flipping over
                const flip = Math.abs(Math.cos(piece.turn * 1.7));
                context.fillRect(-piece.size / 2 * flip, -piece.size * 0.3, piece.size * flip, piece.size * 0.6);
            }
            context.restore();
        });

        if (alive > 0 && fade > 0 && !document.hidden) {
            party.frame = requestAnimationFrame(drawConfetti);
        } else {
            stopConfetti();
        }
    }

    function stopConfetti() {
        clearTimeout(confettiTimer);
        if (!confetti) return;
        cancelAnimationFrame(confetti.frame);
        confetti.canvas.remove();
        confetti = null;
    }

    // ---------- 14. "Copy my result" ----------
    let copiedTimer = 0;

    function copyResult() {
        const result = state.result;
        if (!result) return;
        let message = t("quiz.share.text", {
            correct: result.correct,
            total: result.total,
            percent: result.percent,
            points: plural("quiz.points", result.points),
            rank: t("quiz.rank." + result.rank.id),
            emoji: result.rank.emoji
        });
        // On the real website, add a link to the quiz
        if (/^https?:$/.test(window.location.protocol)) {
            message += "\n" + window.location.origin + window.location.pathname + "#quiz";
        }

        const done = (ok) => {
            A.toast(t(ok ? "quiz.res.copied" : "quiz.res.copyFailed"), ok ? "📋" : "⚠️");
            if (!ok || !ui.copy) return;
            ui.copy.classList.add("is-copied");
            clearTimeout(copiedTimer);
            const button = ui.copy;
            copiedTimer = setTimeout(() => button.classList.remove("is-copied"), 2200);
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(message).then(
                () => done(true),
                () => done(copyWithTextarea(message))
            );
        } else {
            done(copyWithTextarea(message));
        }
    }

    // The old way of copying, for browsers without navigator.clipboard
    function copyWithTextarea(message) {
        const active = document.activeElement;
        const area = document.createElement("textarea");
        area.value = message;
        area.setAttribute("readonly", "");
        area.className = "qz-copy-area";
        document.body.appendChild(area);
        area.select();
        let ok = false;
        try {
            ok = document.execCommand("copy");
        } catch (error) {
            ok = false;
        }
        area.remove();
        if (active && typeof active.focus === "function") active.focus({ preventScroll: true });
        return ok;
    }

    // ---------- 15. Keyboard: 1-4 to answer, Enter for the next question ----------
    document.addEventListener("keydown", (event) => {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        if (state.screen !== "question" || busy) return;
        if (isTypingField(event.target) || dialogOpen()) return;

        // Only when the quiz is on screen (or has the focus)
        const focusInside = card.contains(document.activeElement);
        if (!focusInside && !onScreen) return;

        const answered = Boolean(state.answers[state.index]);

        if (!answered && /^[1-4]$/.test(event.key)) {
            const button = ui.options && ui.options[Number(event.key) - 1];
            if (!button) return;
            event.preventDefault();
            replay(button, "is-pressed");
            answer(Number(event.key) - 1);
            return;
        }

        if (answered && event.key === "Enter") {
            // Real buttons and links already react to Enter by themselves
            const target = event.target;
            const control = target.closest ? target.closest("a, button, summary, [role='button']") : null;
            if (control && !control.classList.contains("qz-option")) return;
            event.preventDefault();
            goNext();
        }
    });

    // ---------- 16. Watching visibility, language and theme ----------
    // The countdown and the decorations pause when the quiz is off screen
    function setOnScreen(value) {
        onScreen = value;
        mount.classList.toggle("is-paused", !value);
        if (value) resumeTimer();
    }

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const visible = entry.intersectionRect.height;
                const needed = Math.min(200, entry.boundingClientRect.height * 0.3);
                setOnScreen(entry.isIntersecting && visible >= needed);
            });
        }, { threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1] });
        observer.observe(card);
    } else {
        setOnScreen(true);
    }

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) resumeTimer();
    });

    // core.js has already translated every [data-i18n] element;
    // here we re-write the texts that contain numbers
    A.onLanguageChange(() => {
        paint();
        if (timer.active) {
            timer.seconds = -1;
            drawTimer(!timer.frame);
        }
    });

    // Confetti colours follow the theme
    A.onThemeChange(() => {
        if (confetti) confetti.colors = confettiColors();
    });

    // ---------- 17. Public API + Ctrl+K commands ----------
    // AICompass.startQuiz(): scrolls to the quiz and starts it.
    // A game that is already running just continues.
    // Optional: startQuiz({ timed: true }) to choose the mode.
    function startQuiz(options) {
        const settings = options || {};
        const wantsMode = typeof settings.timed === "boolean";
        if (wantsMode) setTimed(settings.timed);
        A.scrollToSection("quiz");

        const running = state.screen === "question" && state.answers.filter(Boolean).length < state.order.length;
        if (running && (!wantsMode || settings.timed === state.gameTimed)) {
            // Focus after the command palette (if any) has closed and given focus back
            setTimeout(() => {
                const heading = stage.querySelector(".qz-question-text");
                if (heading) heading.focus({ preventScroll: true });
            }, 80);
            return;
        }
        setTimeout(() => startGame({ forceFocus: true, reveal: false }), 80);
    }

    A.startQuiz = startQuiz;

    A.registerCommand({
        id: "quiz-start",
        group: "quiz.cmdGroup",
        icon: "🏆",
        title: () => t("quiz.cmd.start"),
        keywords: "quiz test challenge start play questions score тест викторина испытание вопросы начать играть",
        run: () => startQuiz()
    });

    A.registerCommand({
        id: "quiz-start-timed",
        group: "quiz.cmdGroup",
        icon: "⏱️",
        title: () => t("quiz.cmd.startTimed"),
        keywords: "quiz timed timer speed fast challenge тест таймер на время скорость быстро испытание",
        run: () => startQuiz({ timed: true })
    });

    // ---------- 18. Start ----------
    showScreen(buildStart);
})();
