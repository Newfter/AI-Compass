/* =========================================================
   AI COMPASS — "MY COMPASS" TEXTS AND DATA
   Every text of "My Compass" (js/journey.js and js/journey-panel.js),
   in English and Russian, and its data:
    1. Texts: the menu bar button, the window, toasts, levels, badges
    2. Data:
       rules    how many XP each thing gives (the table below)
       levels   the XP you need for each of the 10 levels
       badges   the badges, in the order of the grid (the condition of
                each one is a small function in js/journey.js, section 6)
       icons    the line icons (inside a 24 x 24 picture)
   A text with "|" has a form for each kind of number: English "one|many",
   Russian "one|few|many" (1 день | 2 дня | 5 дней). {n} is the number.
   Russian texts never say "ты сделал" / "ты сделала": they are written so
   that they fit everybody ("Урок пройден", "Сделай перерыв...").
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- The menu bar button and the Ctrl+K command -----
        "journey.navLabel": "My Compass, level {level}",
        "journey.cmdGroup": "My Compass",
        "journey.cmd.open": "My Compass: my progress",

        // ----- The window -----
        "journey.label": "My Compass",
        "journey.title": "Your journey",
        "journey.close": "Close My Compass",
        "journey.loadFailed": "My Compass couldn't open. Check your internet connection and try again.",

        // ----- The level -----
        "journey.ringLabel": "Level",
        "journey.levelOf": "Level {level} of {max}",
        "journey.xp": "{n} XP",
        "journey.toNext": "{n} XP to the next level: {name}",
        "journey.topLevel": "This is the top level. Brilliant work!",
        "journey.ringText": "Level {level}, {name}. {percent} of the way to the next level.",
        "journey.ringTextTop": "Level {level}, {name}: the top level.",

        // ----- The numbers under the level -----
        "journey.stat.total": "XP in total",
        "journey.stat.streak": "day in a row|days in a row",
        "journey.stat.best": "best streak",
        "journey.stat.today": "XP today",
        "journey.stat.badges": "badge|badges",
        "journey.streakNote": "A streak counts the days in a row with any XP. Missed a day? It simply starts again, and your XP and badges always stay.",

        // ----- Next best step -----
        "journey.next.title": "Next best step",
        "journey.next.lessonStart": "Start with lesson {n}",
        "journey.next.lessonGo": "Continue with lesson {n}",
        "journey.next.lab": "Try an AI Lab experiment",
        "journey.next.labText": "Tried so far: {n} of {total}",
        "journey.next.quiz": "Take the AI Challenge",
        "journey.next.quizText": "See how much you already know",
        "journey.next.quizAgain": "Beat your quiz best",
        "journey.next.quizAgainText": "Your best so far: {score} of {total}",
        "journey.next.daily": "Today's challenge",
        "journey.next.dailyText": "A new one every day",
        "journey.next.term": "Word of the day: {term}",
        "journey.next.termText": "Open it in the glossary",
        "journey.next.history": "Travel through AI history",
        "journey.next.historyText": "Eras visited: {n} of {total}",
        "journey.next.done": "You've tried everything here! Replay the quiz or the lab whenever you like.",
        "journey.next.reward": "+{n} XP",

        // ----- Your progress, per part of the site -----
        "journey.areas.title": "Your progress",
        "journey.area.lessons": "Lessons",
        "journey.area.lab": "AI Lab experiments",
        "journey.area.words": "Glossary terms",
        "journey.area.history": "History eras",
        "journey.area.quiz": "Best quiz result",
        "journey.area.count": "{n} of {total}",
        "journey.area.quizNone": "Not played yet",

        // ----- Skills (the radar) -----
        "journey.skills.title": "Your skills",
        "journey.skills.caption": "Your skills, from 0 to 100%",
        "journey.skill.lessons": "Lessons",
        "journey.skill.lab": "Lab practice",
        "journey.skill.words": "Words",
        "journey.skill.history": "History",
        "journey.skill.quiz": "Quiz",
        "journey.skill.habit": "Consistency",
        "journey.skills.note": "Consistency counts the days with XP in the last {period}; {goal} fill it up.",
        "journey.days": "{n} day|{n} days",
        "journey.seconds": "{n} second|{n} seconds",

        // ----- Activity (the heatmap) -----
        "journey.activity.title": "Activity",
        "journey.activity.sub": "The last {n} week|The last {n} weeks",
        "journey.activity.grid": "XP per day. The arrow keys move between days.",
        "journey.activity.today": "Today, {date}",
        "journey.activity.day": "{date}: {n} XP",
        "journey.activity.none": "{date}: no XP",
        "journey.activity.daysWith": "day with XP|days with XP",
        "journey.activity.total": "XP in this {n} week|XP in these {n} weeks",
        "journey.activity.bestDay": "best day",
        "journey.activity.less": "Less",
        "journey.activity.more": "More",

        // ----- Badges -----
        "journey.badges.title": "Badges",
        "journey.badges.count": "{n} of {total}",
        "journey.badges.earned": "Earned on {date}",
        "journey.badges.locked": "Not earned yet",

        // ----- How to earn XP -----
        "journey.rules.title": "How to earn XP",
        "journey.rules.intro": "Everything you do here counts, but nothing pays twice.",
        "journey.rules.day": "A new day starts at {time}, so time after midnight still counts as the day before.",
        "journey.rule.lesson": "Finish a lesson (once for each lesson)",
        "journey.rule.check": "Answer a lesson's “Check yourself” right (once for each lesson)",
        "journey.rule.quiz": "Finish a quiz (once a day in each mode)",
        "journey.rule.quizBetter": "For each right answer above your best score in that mode",
        "journey.rule.lab": "Try an AI Lab experiment (once for each experiment)",
        "journey.rule.challenge": "Complete a lab challenge (once for each challenge)",
        "journey.rule.term": "Explore a glossary term (once for each term)",
        "journey.rule.era": "Reach a new era of AI history (once for each era)",
        "journey.rule.bot": "Ask Compass Bot a question (up to {n} a day)",
        "journey.rule.palette": "Run a command from the search window, Ctrl+K (up to {n} a day)",
        "journey.rule.daily": "Finish the daily challenge (once a day)",
        "journey.rule.certificate": "Get a certificate (once for each certificate)",

        // ----- Your data -----
        "journey.data.title": "Your data",
        "journey.privacy": "Your progress is saved only in this browser. Nobody else can see it, including us.",
        "journey.blocked": "This browser doesn't let websites save anything, so your progress will be gone when you close this page. Save it to a file to keep a copy.",
        "journey.export": "Save to a file",
        "journey.copy": "Copy as text",
        "journey.import": "Load progress",
        "journey.reset": "Start over",
        "journey.resetAsk": "Press again to erase",
        "journey.resetNote": "Starting over erases your XP, badges and streak in this browser. Finished lessons stay finished.",
        "journey.resetDone": "My Compass starts over",
        "journey.exported": "Progress saved to a file",
        "journey.copied": "Progress copied as text. Keep it somewhere safe.",
        "journey.copyFailed": "Couldn't copy. Select the text below and copy it yourself.",
        "journey.copyField": "Your progress as text",

        // ----- Loading progress -----
        "journey.import.intro": "Choose a file you saved, or paste the text you copied.",
        "journey.import.file": "Choose a file",
        "journey.import.paste": "Or paste the text here",
        "journey.import.check": "Check it",
        "journey.import.summary": "{xp}, {badges}, {streak}.",
        "journey.import.badges": "{n} badge|{n} badges",
        "journey.import.streak": "{n}-day best streak|{n}-day best streak",
        "journey.import.ask": "Replace the progress in this browser with this one?",
        "journey.import.replace": "Replace my progress",
        "journey.import.cancel": "Cancel",
        "journey.import.done": "Progress loaded: level {level}",
        "journey.import.empty": "Paste the text first, or choose a file.",
        "journey.import.notProgress": "This isn't a My Compass progress file or text.",
        "journey.import.newer": "This progress comes from a newer version of AI Compass, so it can't be loaded here.",
        "journey.import.damaged": "This progress is damaged, so it can't be loaded. Nothing was changed.",
        "journey.import.tooBig": "This file is too big to be a progress file.",

        // ----- Toasts -----
        "journey.toast.level": "Level {level}: {name}!",
        "journey.toast.badge": "New badge: {name}",
        "journey.toast.badges": "{n} new badge: {names}|{n} new badges: {names}",

        // ----- The 10 levels -----
        "journey.level.1": "Curious mind",
        "journey.level.2": "Explorer",
        "journey.level.3": "Pathfinder",
        "journey.level.4": "Data detective",
        "journey.level.5": "Pattern spotter",
        "journey.level.6": "Model trainer",
        "journey.level.7": "Neural navigator",
        "journey.level.8": "Algorithm ace",
        "journey.level.9": "AI mentor",
        "journey.level.10": "AI Compass master",

        // ----- Badges: the title, what it was for, and how to earn it -----
        "journey.badge.first-lesson": "First steps",
        "journey.badge.first-lesson.desc": "Your first lesson is finished.",
        "journey.badge.first-lesson.hint": "Finish any lesson.",
        "journey.badge.all-lessons": "Full course",
        "journey.badge.all-lessons.desc": "Every lesson is finished.",
        "journey.badge.all-lessons.hint": "Finish every lesson. There are {n}.",
        "journey.badge.certificate": "Certified",
        "journey.badge.certificate.desc": "Your certificate is ready.",
        "journey.badge.certificate.hint": "Finish every lesson, then download your certificate.",
        "journey.badge.perfect-quiz": "Flawless",
        "journey.badge.perfect-quiz.desc": "Every answer of a quiz was right.",
        "journey.badge.perfect-quiz.hint": "Get every answer right in one quiz.",
        "journey.badge.speedrunner": "Lightning round",
        "journey.badge.speedrunner.desc": "A timed quiz, fast and right.",
        "journey.badge.speedrunner.hint": "Finish a timed quiz in under {time} per question on average, with at least {share} of the answers right.",
        "journey.badge.lab-all": "Lab regular",
        "journey.badge.lab-all.desc": "Every AI Lab experiment tried.",
        "journey.badge.lab-all.hint": "Try every experiment in the AI Lab. There are {n}.",
        "journey.badge.trainer": "Machine teacher",
        "journey.badge.trainer.desc": "A model in the AI Lab learned something from you.",
        "journey.badge.trainer.hint": "Teach one of the AI Lab's models something new.",
        "journey.badge.challenges": "Challenge accepted",
        "journey.badge.challenges.desc": "{n} lab challenge done.|{n} lab challenges done.",
        "journey.badge.challenges.hint": "Complete {n} challenge in the AI Lab.|Complete {n} challenges in the AI Lab.",
        "journey.badge.terms-10": "Word collector",
        "journey.badge.terms-10.desc": "{n} glossary term explored.|{n} glossary terms explored.",
        "journey.badge.terms-10.hint": "Open {n} term in the glossary.|Open {n} terms in the glossary.",
        "journey.badge.terms-all": "Walking dictionary",
        "journey.badge.terms-all.desc": "Every glossary term explored.",
        "journey.badge.terms-all.hint": "Open every term in the glossary. There are {n}.",
        "journey.badge.eras-all": "Time traveller",
        "journey.badge.eras-all.desc": "Every era of AI history visited.",
        "journey.badge.eras-all.hint": "Scroll through the history of AI to the very end.",
        "journey.badge.all-rounder": "All-rounder",
        "journey.badge.all-rounder.desc": "XP from every part of AI Compass.",
        "journey.badge.all-rounder.hint": "Earn XP in the lessons, the AI Lab, the quiz, the glossary and the history.",
        "journey.badge.days-3": "Seedling",
        "journey.badge.days-3.desc": "{n} day of learning.|{n} days of learning.",
        "journey.badge.days-3.hint": "Earn XP on {n} different day.|Earn XP on {n} different days.",
        "journey.badge.days-7": "Sapling",
        "journey.badge.days-7.desc": "{n} day of learning.|{n} days of learning.",
        "journey.badge.days-7.hint": "Earn XP on {n} different day.|Earn XP on {n} different days.",
        "journey.badge.days-30": "Mighty tree",
        "journey.badge.days-30.desc": "{n} day of learning.|{n} days of learning.",
        "journey.badge.days-30.hint": "Earn XP on {n} different day.|Earn XP on {n} different days.",
        "journey.badge.welcome-back": "Welcome back",
        "journey.badge.welcome-back.desc": "Back after a break, and learning again.",
        "journey.badge.welcome-back.hint": "Take a break of {n} day or more, then come back. Rest is part of learning!|Take a break of {n} days or more, then come back. Rest is part of learning!",
        "journey.badge.bot-chat": "Hello, bot!",
        "journey.badge.bot-chat.desc": "Your first question to Compass Bot.",
        "journey.badge.bot-chat.hint": "Ask Compass Bot anything.",
        "journey.badge.palette": "Shortcut pro",
        "journey.badge.palette.desc": "{n} command run from the search window.|{n} commands run from the search window.",
        "journey.badge.palette.hint": "Run {n} command from the search window (Ctrl+K).|Run {n} commands from the search window (Ctrl+K).",
        "journey.badge.polyglot": "Bilingual",
        "journey.badge.polyglot.desc": "AI Compass, in both languages.",
        "journey.badge.polyglot.hint": "Switch the site to the other language.",
        "journey.badge.day-and-night": "Day and night",
        "journey.badge.day-and-night.desc": "Both themes tried.",
        "journey.badge.day-and-night.hint": "Light or dark? Try the other theme.",
        "journey.badge.zen": "Calm mind",
        "journey.badge.zen.desc": "Calm mode tried.",
        "journey.badge.zen.hint": "Turn on calm mode: press Ctrl+K and type “calm”.",
        "journey.badge.navigator": "Navigator",
        "journey.badge.navigator.desc": "You found My Compass.",
        "journey.badge.navigator.hint": "Open My Compass from the menu bar.",
        "journey.badge.backup": "Safe keeper",
        "journey.badge.backup.desc": "A copy of your progress is saved.",
        "journey.badge.backup.hint": "Save your progress to a file, or copy it as text."
    },
    ru: {
        // ----- Кнопка в меню и команда Ctrl+K -----
        "journey.navLabel": "Мой компас, уровень {level}",
        "journey.cmdGroup": "Мой компас",
        "journey.cmd.open": "Мой компас: мой прогресс",

        // ----- Окно -----
        "journey.label": "Мой компас",
        "journey.title": "Твой путь",
        "journey.close": "Закрыть «Мой компас»",
        "journey.loadFailed": "«Мой компас» не открылся. Проверь подключение к интернету и попробуй ещё раз.",

        // ----- Уровень -----
        "journey.ringLabel": "Уровень",
        "journey.levelOf": "Уровень {level} из {max}",
        "journey.xp": "{n} XP",
        "journey.toNext": "{n} XP до следующего уровня: «{name}»",
        "journey.topLevel": "Это высший уровень. Блестящая работа!",
        "journey.ringText": "Уровень {level}, «{name}». До следующего уровня пройдено {percent}.",
        "journey.ringTextTop": "Уровень {level}, «{name}»: это высший уровень.",

        // ----- Числа под уровнем -----
        "journey.stat.total": "XP всего",
        "journey.stat.streak": "день подряд|дня подряд|дней подряд",
        "journey.stat.best": "лучшая серия",
        "journey.stat.today": "XP сегодня",
        "journey.stat.badges": "значок|значка|значков",
        "journey.streakNote": "Серия — это дни подряд, в которые ты получаешь XP. Пропустишь день — серия просто начнётся заново, а XP и значки останутся с тобой.",

        // ----- Следующий шаг -----
        "journey.next.title": "Следующий шаг",
        "journey.next.lessonStart": "Начни с урока {n}",
        "journey.next.lessonGo": "Продолжи: урок {n}",
        "journey.next.lab": "Попробуй эксперимент в ИИ-лаборатории",
        "journey.next.labText": "Уже опробовано: {n} из {total}",
        "journey.next.quiz": "Пройди ИИ-испытание",
        "journey.next.quizText": "Проверь, сколько ты уже знаешь",
        "journey.next.quizAgain": "Побей свой рекорд в тесте",
        "journey.next.quizAgainText": "Твой рекорд: {score} из {total}",
        "journey.next.daily": "Задание дня",
        "journey.next.dailyText": "Каждый день новое",
        "journey.next.term": "Слово дня: {term}",
        "journey.next.termText": "Открой его в словаре",
        "journey.next.history": "Путешествие по истории ИИ",
        "journey.next.historyText": "Пройдено эпох: {n} из {total}",
        "journey.next.done": "Здесь опробовано всё! Возвращайся к тесту и лаборатории, когда захочешь.",
        "journey.next.reward": "+{n} XP",

        // ----- Прогресс по разделам -----
        "journey.areas.title": "Твой прогресс",
        "journey.area.lessons": "Уроки",
        "journey.area.lab": "Эксперименты ИИ-лаборатории",
        "journey.area.words": "Термины словаря",
        "journey.area.history": "Эпохи истории",
        "journey.area.quiz": "Лучший результат в тесте",
        "journey.area.count": "{n} из {total}",
        "journey.area.quizNone": "Тест ещё не пройден",

        // ----- Навыки (радар) -----
        "journey.skills.title": "Твои навыки",
        "journey.skills.caption": "Твои навыки, от 0 до 100 %",
        "journey.skill.lessons": "Уроки",
        "journey.skill.lab": "Практика",
        "journey.skill.words": "Словарь",
        "journey.skill.history": "История",
        "journey.skill.quiz": "Тест",
        "journey.skill.habit": "Регулярность",
        "journey.skills.note": "Регулярность — это дни с XP за последние {period}. Чтобы заполнить шкалу, хватит {goal}.",
        "journey.days": "{n} день|{n} дня|{n} дней",
        "journey.seconds": "{n} секунды|{n} секунд|{n} секунд",

        // ----- Активность (тепловая карта) -----
        "journey.activity.title": "Активность",
        "journey.activity.sub": "Последняя {n} неделя|Последние {n} недели|Последние {n} недель",
        "journey.activity.grid": "XP по дням. Стрелки на клавиатуре переходят от дня к дню.",
        "journey.activity.today": "Сегодня, {date}",
        "journey.activity.day": "{date}: {n} XP",
        "journey.activity.none": "{date}: без XP",
        "journey.activity.daysWith": "день с XP|дня с XP|дней с XP",
        "journey.activity.total": "XP за эту {n} неделю|XP за эти {n} недели|XP за эти {n} недель",
        "journey.activity.bestDay": "лучший день",
        "journey.activity.less": "Меньше",
        "journey.activity.more": "Больше",

        // ----- Значки -----
        "journey.badges.title": "Значки",
        "journey.badges.count": "{n} из {total}",
        "journey.badges.earned": "Получен {date}",
        "journey.badges.locked": "Ещё не получен",

        // ----- Как получить XP -----
        "journey.rules.title": "Как получить XP",
        "journey.rules.intro": "Здесь засчитывается всё, что ты делаешь, но ничто не засчитывается дважды.",
        "journey.rules.day": "Новый день начинается в {time}, поэтому время после полуночи засчитывается за предыдущий день.",
        "journey.rule.lesson": "Пройди урок (один раз за каждый урок)",
        "journey.rule.check": "Верно ответь на «Проверь себя» в уроке (один раз за каждый урок)",
        "journey.rule.quiz": "Пройди тест (раз в день в каждом режиме)",
        "journey.rule.quizBetter": "За каждый верный ответ сверх твоего рекорда в этом режиме",
        "journey.rule.lab": "Попробуй эксперимент в ИИ-лаборатории (один раз за каждый)",
        "journey.rule.challenge": "Выполни задание в лаборатории (один раз за каждое)",
        "journey.rule.term": "Изучи термин в словаре (один раз за каждый термин)",
        "journey.rule.era": "Дойди до новой эпохи в истории ИИ (один раз за каждую)",
        "journey.rule.bot": "Задай вопрос Compass Bot (до {n} в день)",
        "journey.rule.palette": "Выполни команду в окне поиска, Ctrl+K (до {n} в день)",
        "journey.rule.daily": "Выполни задание дня (раз в день)",
        "journey.rule.certificate": "Получи сертификат (один раз за каждый)",

        // ----- Твои данные -----
        "journey.data.title": "Твои данные",
        "journey.privacy": "Твой прогресс хранится только в этом браузере. Никто другой его не видит — даже мы.",
        "journey.blocked": "Этот браузер не разрешает сайтам ничего сохранять, поэтому прогресс пропадёт, когда ты закроешь страницу. Сохрани его в файл, чтобы осталась копия.",
        "journey.export": "Сохранить в файл",
        "journey.copy": "Скопировать как текст",
        "journey.import": "Загрузить прогресс",
        "journey.reset": "Начать заново",
        "journey.resetAsk": "Нажми ещё раз, чтобы стереть",
        "journey.resetNote": "Если начать заново, XP, значки и серия в этом браузере сотрутся. Пройденные уроки останутся пройденными.",
        "journey.resetDone": "«Мой компас» начинает заново",
        "journey.exported": "Прогресс сохранён в файл",
        "journey.copied": "Прогресс скопирован как текст. Сохрани его в надёжном месте.",
        "journey.copyFailed": "Не получилось скопировать. Выдели текст ниже и скопируй его вручную.",
        "journey.copyField": "Твой прогресс в виде текста",

        // ----- Загрузка прогресса -----
        "journey.import.intro": "Выбери сохранённый файл или вставь скопированный текст.",
        "journey.import.file": "Выбрать файл",
        "journey.import.paste": "Или вставь текст сюда",
        "journey.import.check": "Проверить",
        "journey.import.summary": "{xp}, {badges}, {streak}.",
        "journey.import.badges": "{n} значок|{n} значка|{n} значков",
        "journey.import.streak": "лучшая серия — {n} день|лучшая серия — {n} дня|лучшая серия — {n} дней",
        "journey.import.ask": "Заменить прогресс в этом браузере на загруженный?",
        "journey.import.replace": "Заменить мой прогресс",
        "journey.import.cancel": "Отмена",
        "journey.import.done": "Прогресс загружен: уровень {level}",
        "journey.import.empty": "Сначала вставь текст или выбери файл.",
        "journey.import.notProgress": "Это не файл и не текст прогресса «Моего компаса».",
        "journey.import.newer": "Этот прогресс сохранён более новой версией AI Compass, поэтому здесь его не загрузить.",
        "journey.import.damaged": "Этот прогресс повреждён, поэтому его не получится загрузить. Ничего не изменилось.",
        "journey.import.tooBig": "Этот файл слишком большой для файла прогресса.",

        // ----- Всплывающие сообщения -----
        "journey.toast.level": "Уровень {level}: «{name}»!",
        "journey.toast.badge": "Новый значок: «{name}»",
        "journey.toast.badges": "{n} новый значок: {names}|{n} новых значка: {names}|{n} новых значков: {names}",

        // ----- 10 уровней -----
        "journey.level.1": "Любопытный ум",
        "journey.level.2": "Исследователь",
        "journey.level.3": "Следопыт",
        "journey.level.4": "Детектив данных",
        "journey.level.5": "Ловец закономерностей",
        "journey.level.6": "Тренер моделей",
        "journey.level.7": "Нейронавигатор",
        "journey.level.8": "Ас алгоритмов",
        "journey.level.9": "Наставник по ИИ",
        "journey.level.10": "Мастер AI Compass",

        // ----- Значки: название, за что он и как его получить -----
        "journey.badge.first-lesson": "Первые шаги",
        "journey.badge.first-lesson.desc": "Первый урок пройден.",
        "journey.badge.first-lesson.hint": "Пройди любой урок.",
        "journey.badge.all-lessons": "Весь курс",
        "journey.badge.all-lessons.desc": "Все уроки пройдены.",
        "journey.badge.all-lessons.hint": "Пройди все уроки. Их {n}.",
        "journey.badge.certificate": "С сертификатом",
        "journey.badge.certificate.desc": "Твой сертификат готов.",
        "journey.badge.certificate.hint": "Пройди все уроки и скачай сертификат.",
        "journey.badge.perfect-quiz": "Без ошибок",
        "journey.badge.perfect-quiz.desc": "Все ответы в тесте верные.",
        "journey.badge.perfect-quiz.hint": "Ответь верно на все вопросы одного теста.",
        "journey.badge.speedrunner": "Молния",
        "journey.badge.speedrunner.desc": "Тест на время — быстро и верно.",
        "journey.badge.speedrunner.hint": "Пройди тест на время, тратя в среднем меньше {time} на вопрос, и ответь верно хотя бы на {share} вопросов.",
        "journey.badge.lab-all": "Завсегдатай лаборатории",
        "journey.badge.lab-all.desc": "Все эксперименты ИИ-лаборатории опробованы.",
        "journey.badge.lab-all.hint": "Попробуй все эксперименты ИИ-лаборатории. Их {n}.",
        "journey.badge.trainer": "Учитель машин",
        "journey.badge.trainer.desc": "Модель в ИИ-лаборатории научилась чему-то у тебя.",
        "journey.badge.trainer.hint": "Научи одну из моделей ИИ-лаборатории чему-нибудь новому.",
        "journey.badge.challenges": "Вызов принят",
        "journey.badge.challenges.desc": "{n} задание лаборатории выполнено.|{n} задания лаборатории выполнены.|{n} заданий лаборатории выполнено.",
        "journey.badge.challenges.hint": "Выполни {n} задание в ИИ-лаборатории.|Выполни {n} задания в ИИ-лаборатории.|Выполни {n} заданий в ИИ-лаборатории.",
        "journey.badge.terms-10": "Собиратель слов",
        "journey.badge.terms-10.desc": "{n} термин словаря изучен.|{n} термина словаря изучены.|{n} терминов словаря изучено.",
        "journey.badge.terms-10.hint": "Открой {n} термин в словаре.|Открой {n} термина в словаре.|Открой {n} терминов в словаре.",
        "journey.badge.terms-all": "Ходячий словарь",
        "journey.badge.terms-all.desc": "Все термины словаря изучены.",
        "journey.badge.terms-all.hint": "Открой все термины словаря. Их {n}.",
        "journey.badge.eras-all": "Путешественник во времени",
        "journey.badge.eras-all.desc": "Все эпохи истории ИИ пройдены.",
        "journey.badge.eras-all.hint": "Пролистай историю ИИ до самого конца.",
        "journey.badge.all-rounder": "Универсал",
        "journey.badge.all-rounder.desc": "XP из всех разделов AI Compass.",
        "journey.badge.all-rounder.hint": "Получи XP в уроках, ИИ-лаборатории, тесте, словаре и истории.",
        "journey.badge.days-3": "Росток",
        "journey.badge.days-3.desc": "{n} день учёбы.|{n} дня учёбы.|{n} дней учёбы.",
        "journey.badge.days-3.hint": "Получи XP в {n} разный день.|Получи XP в {n} разных дня.|Получи XP в {n} разных дней.",
        "journey.badge.days-7": "Деревце",
        "journey.badge.days-7.desc": "{n} день учёбы.|{n} дня учёбы.|{n} дней учёбы.",
        "journey.badge.days-7.hint": "Получи XP в {n} разный день.|Получи XP в {n} разных дня.|Получи XP в {n} разных дней.",
        "journey.badge.days-30": "Могучее дерево",
        "journey.badge.days-30.desc": "{n} день учёбы.|{n} дня учёбы.|{n} дней учёбы.",
        "journey.badge.days-30.hint": "Получи XP в {n} разный день.|Получи XP в {n} разных дня.|Получи XP в {n} разных дней.",
        "journey.badge.welcome-back": "С возвращением",
        "journey.badge.welcome-back.desc": "Снова учёба — после перерыва.",
        "journey.badge.welcome-back.hint": "Сделай перерыв на {n} день или больше и возвращайся. Отдых — тоже часть учёбы!|Сделай перерыв на {n} дня или больше и возвращайся. Отдых — тоже часть учёбы!|Сделай перерыв на {n} дней или больше и возвращайся. Отдых — тоже часть учёбы!",
        "journey.badge.bot-chat": "Привет, бот!",
        "journey.badge.bot-chat.desc": "Первый вопрос для Compass Bot.",
        "journey.badge.bot-chat.hint": "Задай Compass Bot любой вопрос.",
        "journey.badge.palette": "Мастер быстрых команд",
        "journey.badge.palette.desc": "{n} команда из окна поиска.|{n} команды из окна поиска.|{n} команд из окна поиска.",
        "journey.badge.palette.hint": "Выполни {n} команду из окна поиска (Ctrl+K).|Выполни {n} команды из окна поиска (Ctrl+K).|Выполни {n} команд из окна поиска (Ctrl+K).",
        "journey.badge.polyglot": "Полиглот",
        "journey.badge.polyglot.desc": "AI Compass на двух языках.",
        "journey.badge.polyglot.hint": "Переключи сайт на другой язык.",
        "journey.badge.day-and-night": "День и ночь",
        "journey.badge.day-and-night.desc": "Обе темы опробованы.",
        "journey.badge.day-and-night.hint": "Светлая или тёмная? Попробуй другую тему.",
        "journey.badge.zen": "Спокойствие",
        "journey.badge.zen.desc": "Спокойный режим опробован.",
        "journey.badge.zen.hint": "Включи спокойный режим: нажми Ctrl+K и набери «спокойный».",
        "journey.badge.navigator": "Штурман",
        "journey.badge.navigator.desc": "«Мой компас» найден.",
        "journey.badge.navigator.hint": "Открой «Мой компас» в меню сверху.",
        "journey.badge.backup": "Хранитель",
        "journey.badge.backup.desc": "Копия прогресса сохранена.",
        "journey.badge.backup.hint": "Сохрани прогресс в файл или скопируй его как текст."
    }
});

window.AICompass.content.set("journey", {
    // How many XP each thing gives. js/journey.js (section 5) turns every progress
    // event into one of these, with a key that makes sure nothing pays twice.
    //   xp       the reward
    //   perDay   (only for small rewards) how many times it can pay in one day
    // The order is the order of the list "How to earn XP" in the window.
    rules: {
        lesson:      { xp: 100 },            // a lesson finished: once for each lesson
        check:       { xp: 20 },             // a lesson's "Check yourself" right: once for each lesson
        quiz:        { xp: 20 },             // a quiz finished: once a day in each mode...
        quizBetter:  { xp: 5 },              // ...plus this for every right answer above your best in that mode
        daily:       { xp: 50 },             // the quiz's daily challenge: once a day (if the quiz has one)
        lab:         { xp: 20 },             // an AI Lab experiment tried: once for each experiment
        challenge:   { xp: 30 },             // a lab challenge done: once for each challenge
        term:        { xp: 5 },              // a glossary term opened: once for each term
        era:         { xp: 10 },             // a timeline era reached: once for each era
        bot:         { xp: 2, perDay: 10 },  // a question to Compass Bot: at most 10 a day
        palette:     { xp: 2, perDay: 10 },  // a Ctrl+K command: at most 10 a day
        certificate: { xp: 50 }              // a certificate made: once for each certificate
    },

    // The XP you need to reach each level (level 1 = 0 XP, level 10 = 2,700 XP).
    // The curve: 25 x (level - 1) x (level + 2). Each level asks for 50 XP more than
    // the one before: 100, 150, 200 ... 500. A learner who does everything on the site
    // once gets to level 6 or 7; the last levels need a few more visits.
    // The names are "journey.level.1" ... "journey.level.10" above.
    levels: [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700],

    // The badges, in the order of the grid. Each one has the texts
    // "journey.badge.<id>" (title), ".desc" (what it was for) and ".hint" (how to earn
    // it), and an icon from "icons" below (the same name as the id, unless "icon" says).
    // goal: the number in its texts ({n}): 10 terms, 3 days... Badges without a goal
    // that say {n} show a number from the site itself (the number of lessons, say).
    // When each badge is earned is written in js/journey.js, section 6.
    badges: [
        { id: "first-lesson" },
        { id: "all-lessons" },
        { id: "certificate" },
        { id: "perfect-quiz" },
        { id: "speedrunner" },
        { id: "lab-all" },
        { id: "trainer" },
        { id: "challenges", goal: 3 },
        { id: "terms-10", goal: 10 },
        { id: "terms-all" },
        { id: "eras-all" },
        { id: "all-rounder" },
        { id: "days-3", goal: 3 },
        { id: "days-7", goal: 7 },
        { id: "days-30", goal: 30 },
        { id: "welcome-back", goal: 7 },
        { id: "bot-chat" },
        { id: "palette", goal: 5 },
        { id: "polyglot" },
        { id: "day-and-night" },
        { id: "zen" },
        { id: "navigator" },
        { id: "backup" }
    ],

    // Line icons, drawn inside a 24 x 24 picture with 1.75 px lines
    // (js/journey.js puts each one in an <svg>). A part with class="jr-fill" is filled.
    icons: {
        // Badges
        "first-lesson": '<path d="M12 6.5C10 5 7.2 4.5 3.5 5v13c3.7-.5 6.5 0 8.5 1.5 2-1.5 4.8-2 8.5-1.5V5c-3.7-.5-6.5 0-8.5 1.5z"/><path d="M12 6.5v13"/>',
        "all-lessons": '<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c1.6 1.4 3.4 2 5.5 2s3.9-.6 5.5-2V11"/><path d="M21.5 9v5.5"/>',
        "certificate": '<circle cx="12" cy="9" r="5.5"/><path d="M9 13.8 7.5 20.5l4.5-2.2 4.5 2.2-1.5-6.7"/>',
        "perfect-quiz": '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
        "speedrunner": '<path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z"/>',
        "lab-all": '<path d="M9.5 3.5h5"/><path d="M10.5 3.5v6L5.2 18.6A1.6 1.6 0 0 0 6.6 21h10.8a1.6 1.6 0 0 0 1.4-2.4L13.5 9.5v-6"/><path d="M7.6 15h8.8"/>',
        "trainer": '<circle cx="5.5" cy="7" r="2"/><circle cx="5.5" cy="17" r="2"/><circle cx="18.5" cy="12" r="2.5"/><path d="M7.4 7.8 16.1 11M7.4 16.2 16.1 13"/>',
        "challenges": '<path d="M2.5 20.5 9.5 9l4 6.5 2-3 6 8z"/><path d="M9.5 9V3.5l4.5 1.8-4.5 1.7"/>',
        "terms-10": '<path d="M6.5 3.5h11v17L12 16.5l-5.5 4z"/><path d="M9.5 8h5"/>',
        "terms-all": '<path d="M4.5 4.5h4v15h-4zM8.5 4.5h4v15h-4z"/><path d="m13.6 5.6 3.9-1 3.6 14-3.9 1z"/>',
        "eras-all": '<path d="M6.5 3.5h11M6.5 20.5h11"/><path d="M7.5 3.5c0 4 4.5 5.5 4.5 8.5s-4.5 4.5-4.5 8.5M16.5 3.5c0 4-4.5 5.5-4.5 8.5s4.5 4.5 4.5 8.5"/>',
        "all-rounder": '<circle cx="12" cy="12" r="8.5"/><path d="m12 5.5 1.9 4.6 4.6 1.9-4.6 1.9-1.9 4.6-1.9-4.6-4.6-1.9 4.6-1.9z"/>',
        "days-3": '<path d="M12 20.5V12"/><path d="M12 12c0-3.6-2.4-6-6.5-6 0 3.6 2.4 6 6.5 6z"/><path d="M12 14.5c0-3 2.1-5 5.5-5 0 3-2.1 5-5.5 5z"/><path d="M8 20.5h8"/>',
        "days-7": '<circle cx="12" cy="9" r="5.5"/><path d="M12 14.5v6M9 20.5h6M12 17.5l-2.5-2"/>',
        "days-30": '<path d="M12 15c-4.4 0-7.5-2.3-7.5-5.5 0-2.4 1.7-4.2 4-4.7.9-1.5 2.1-2.3 3.5-2.3s2.6.8 3.5 2.3c2.3.5 4 2.3 4 4.7 0 3.2-3.1 5.5-7.5 5.5z"/><path d="M12 21v-9.5M9.5 9l2.5 2.5L14.5 9M8.5 21h7"/>',
        "welcome-back": '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5v10h13v-10"/><path d="M12 17.5s-3-1.8-3-3.8a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 3.8-3 3.8z"/>',
        "bot-chat": '<path d="M5.5 5h13a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H11L6.5 20v-3.5h-1a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M8.5 10.8h.01M12 10.8h.01M15.5 10.8h.01" class="jr-dots"/>',
        "palette": '<path d="M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15zm0 0v6m0 0h2.5a2.5 2.5 0 1 1-2.5 2.5V15zm0 0H9m0 0v2.5A2.5 2.5 0 1 1 6.5 15H9z"/>',
        "polyglot": '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5z"/>',
        "day-and-night": '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" class="jr-fill"/>',
        "zen": '<path d="M3.5 9c1.4 0 2.1-1.5 4.2-1.5S10.6 9 12 9s2.1-1.5 4.2-1.5S19.1 9 20.5 9"/><path d="M3.5 15c1.4 0 2.1-1.5 4.2-1.5S10.6 15 12 15s2.1-1.5 4.2-1.5S19.1 15 20.5 15"/>',
        "navigator": '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
        "backup": '<path d="M12 3.5 5 6.5v5c0 4.3 2.9 7.8 7 9 4.1-1.2 7-4.7 7-9v-5z"/><path d="m9 12 2.2 2.2 4.3-4.4"/>',

        // The window
        "level": '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 13.5 3.5-3.5 3.5 3.5"/>',
        "streak": '<path d="M12 21c-3.6 0-6-2.4-6-5.5 0-2.7 1.8-4.4 3.2-5.9.3 1.6 1.1 2.6 2.3 3-.5-3.4.8-6.4 3.3-8.1-.1 2.8 1.2 4.6 2.4 6.1 1 1.4 1.8 2.8 1.8 4.9 0 3.1-2.4 5.5-7 5.5z"/>',
        "calendar": '<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
        "spark": '<path d="m12 3 2.6 5.8 6.4.7-4.8 4.3 1.3 6.2L12 16.9 6.5 20l1.3-6.2L3 9.5l6.4-.7z"/>',
        "lock": '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
        "warning": '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17h.01"/>',
        "download": '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 19.5h15"/>',
        "copy": '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
        "upload": '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4.5 19.5h15"/>',
        "reset": '<path d="M4 12a8 8 0 1 0 2.3-5.6L4 8.5"/><path d="M4 4v4.5h4.5"/>',
        "close": '<path d="M6 6l12 12M18 6 6 18"/>',
        "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
        "check": '<path d="m5 12.5 4.5 4.5L19 7.5"/>'
    }
});
