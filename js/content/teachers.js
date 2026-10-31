/* =========================================================
   AI COMPASS — TEXTS AND DATA: FOR TEACHERS (the section)
   The texts of the "For teachers" section, its menu link and its
   commands, in English and in Russian, plus a little data (at the
   bottom). Used by js/teachers.js, which is loaded with the page.

   The teacher kit itself (the windows with the plans, the worksheets
   and the classroom quiz) has its texts in three more files, loaded
   only when a teacher opens something:
       js/content/teachers-kit.js     the kit's buttons, headings and messages
       js/content/teachers-basics.js  the plans and worksheets of lessons 1-6
       js/content/teachers-deep.js    the plans and worksheets of lessons 7-12

   Russian: the texts for teachers are written in the usual style of
   Russian lesson plans (no "ты" or "вы": "Ученики читают...",
   "Открыть урок"); the texts for students use "ты", like the rest
   of the site.
   To change a text, change it here (in both languages).
   Numbers in {braces} are filled in by js/teachers.js from the data.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // The link in the menu bar and the footer, the section map, "Go to" commands
        "nav.teachers": "Teachers",

        // The top of the section (index.html)
        "teachers.label": "FOR TEACHERS",
        "teachers.title": "Ready for your classroom",
        "teachers.subtitle": "A lesson plan, a printable worksheet and an answer key for every lesson, and a quiz for the projector. Free to print and share.",

        // The course at a glance
        "teachers.overview": "The course at a glance",
        "teachers.fact.lessons.one": "{n} lesson",
        "teachers.fact.lessons.many": "{n} lessons",
        "teachers.fact.tracks.one": "in {n} track: {names}",
        "teachers.fact.tracks.many": "in {n} tracks: {names}",
        "teachers.fact.ages": "Ages {from}–{to}",
        "teachers.fact.agesText": "Written for teenagers. No knowledge of AI or coding needed.",
        "teachers.fact.minutes": "{from}–{to} min",
        "teachers.fact.minutesText": "of reading per lesson, plus a mini-lab and a check question.",
        "teachers.fact.free": "Free",
        "teachers.fact.freeText": "No sign-up, no ads, nothing to install.",
        "teachers.fact.offline": "Works offline",
        "teachers.fact.offlineText": "Open each part once with the internet on: after that it works without it.",
        "teachers.fact.private": "Private",
        "teachers.fact.privateText": "No accounts and no tracking: nothing students do here is sent anywhere.",
        "teachers.and": " and ",
        "teachers.quoted": "“{name}”",

        // The grid of lessons
        "teachers.kit.title": "Plans and worksheets",
        "teachers.kit.text.one": "Every plan fills one {n}-minute class: a warm-up, the lesson on the site, a hands-on activity, a discussion and an exit ticket.",
        "teachers.kit.text.many": "Every plan fills one {n}-minute class: a warm-up, the lesson on the site, a hands-on activity, a discussion and an exit ticket.",
        "teachers.track": "Track {n}",
        "teachers.lessonN": "Lesson {n}",
        "teachers.minutes.one": "{n} min",
        "teachers.minutes.many": "{n} min",
        "teachers.plan": "Lesson plan",
        "teachers.worksheet": "Worksheet",
        "teachers.answers": "Answer key",
        "teachers.planFor": "Lesson plan: {title}",
        "teachers.worksheetFor": "Worksheet: {title}",
        "teachers.answersFor": "Answer key: {title}",

        // The classroom quiz
        "teachers.quiz.title": "Classroom quiz",
        "teachers.quiz.text": "Questions in big type for the projector, with a timer and team scores if you want them. Press Space to reveal each answer.",
        "teachers.quiz.questions.one": "{n} question",
        "teachers.quiz.questions.many": "{n} questions",
        "teachers.quiz.myths.one": "{n} myth or fact",
        "teachers.quiz.myths.many": "{n} myths or facts",
        "teachers.quiz.run": "Run a classroom quiz",

        // Using AI honestly
        "teachers.honest.title": "Using AI honestly in class",
        "teachers.honest.text": "Many students already use chatbots for homework. Lesson {n} shows them how to use AI as a tutor, not a ghostwriter: ask for explanations and hints, check every answer, and say when AI helped. It works best with class rules that you agree on before the first assignment.",
        "teachers.honest.open": "Open lesson {n}: {title}",

        // While the kit loads, or when it can't
        "teachers.loading": "Opening…",
        "teachers.loadError": "The teacher kit didn't load. It needs the internet the first time.",

        // Command palette (Ctrl+K)
        "teachers.cmdGroup": "For teachers",
        "teachers.cmd.plan": "Lesson plan {n}: {title}",
        "teachers.cmd.quiz": "Classroom quiz"
    },
    ru: {
        "nav.teachers": "Учителям",

        "teachers.label": "УЧИТЕЛЯМ",
        "teachers.title": "Всё готово для урока",
        "teachers.subtitle": "К каждому уроку — план, рабочий лист для печати и ответы к нему, а ещё викторина для проектора. Всё бесплатно: можно печатать и делиться.",

        "teachers.overview": "Курс коротко",
        "teachers.fact.lessons.one": "{n} урок",
        "teachers.fact.lessons.few": "{n} урока",
        "teachers.fact.lessons.many": "{n} уроков",
        "teachers.fact.tracks.one": "в {n} курсе: {names}",
        "teachers.fact.tracks.few": "в {n} курсах: {names}",
        "teachers.fact.tracks.many": "в {n} курсах: {names}",
        "teachers.fact.ages": "{from}–{to} лет",
        "teachers.fact.agesText": "Для подростков. Знать заранее про ИИ или программирование не нужно.",
        "teachers.fact.minutes": "{from}–{to} мин",
        "teachers.fact.minutesText": "чтения на урок, плюс мини-лаборатория и вопрос для самопроверки.",
        "teachers.fact.free": "Бесплатно",
        "teachers.fact.freeText": "Без регистрации, рекламы и установки.",
        "teachers.fact.offline": "Работает офлайн",
        "teachers.fact.offlineText": "Достаточно один раз открыть нужные разделы с интернетом — дальше всё работает и без него.",
        "teachers.fact.private": "Приватно",
        "teachers.fact.privateText": "Ни аккаунтов, ни слежки: ничего из того, что делают ученики, никуда не отправляется.",
        "teachers.and": " и ",
        "teachers.quoted": "«{name}»",

        "teachers.kit.title": "Планы и рабочие листы",
        "teachers.kit.text.one": "Каждый план рассчитан на урок в {n} минуту: разминка, урок на сайте, практика, обсуждение и билет на выход.",
        "teachers.kit.text.few": "Каждый план рассчитан на урок в {n} минуты: разминка, урок на сайте, практика, обсуждение и билет на выход.",
        "teachers.kit.text.many": "Каждый план рассчитан на урок в {n} минут: разминка, урок на сайте, практика, обсуждение и билет на выход.",
        "teachers.track": "Курс {n}",
        "teachers.lessonN": "Урок {n}",
        "teachers.minutes.one": "{n} мин",
        "teachers.minutes.few": "{n} мин",
        "teachers.minutes.many": "{n} мин",
        "teachers.plan": "План урока",
        "teachers.worksheet": "Рабочий лист",
        "teachers.answers": "Ответы",
        "teachers.planFor": "План урока: {title}",
        "teachers.worksheetFor": "Рабочий лист: {title}",
        "teachers.answersFor": "Ответы к рабочему листу: {title}",

        "teachers.quiz.title": "Викторина для класса",
        "teachers.quiz.text": "Крупные вопросы для проектора, а по желанию — таймер и счёт команд. Пробел открывает ответ.",
        "teachers.quiz.questions.one": "{n} вопрос",
        "teachers.quiz.questions.few": "{n} вопроса",
        "teachers.quiz.questions.many": "{n} вопросов",
        "teachers.quiz.myths.one": "{n} миф или факт",
        "teachers.quiz.myths.few": "{n} мифа или факта",
        "teachers.quiz.myths.many": "{n} мифов или фактов",
        "teachers.quiz.run": "Запустить викторину",

        "teachers.honest.title": "Честно об ИИ на уроке",
        "teachers.honest.text": "Многие ученики уже делают домашние задания с чат-ботами. Урок {n} учит пользоваться ИИ как репетитором, а не как исполнителем, который сделает работу за ученика: просить объяснение и подсказку, проверять каждый ответ и честно говорить, где помог ИИ. Лучше всего это работает вместе с правилами класса, о которых договорились до первого задания.",
        "teachers.honest.open": "Открыть урок {n}: {title}",

        "teachers.loading": "Открываю…",
        "teachers.loadError": "Материалы для учителя не загрузились: в первый раз нужен интернет.",

        "teachers.cmdGroup": "Учителям",
        "teachers.cmd.plan": "План урока {n}: {title}",
        "teachers.cmd.quiz": "Викторина для класса"
    }
});

// A little data for the section and the kit
// (js/teachers.js and js/teachers-kit.js read it with AICompass.content.get("teachers")).
window.AICompass.content.set("teachers", {
    // The name and the address printed at the bottom of every plan and worksheet
    siteName: "AI Compass",
    siteUrl: "https://newfter.github.io/AI-Compass/",

    // The ages the course is written for
    ages: { from: 12, to: 16 },

    // The steps of every lesson plan, in order, with their minutes
    // (they add up to the length of the class, shown in the section)
    planSteps: [
        { id: "warmup", minutes: 5 },
        { id: "reading", minutes: 10 },
        { id: "activity", minutes: 15 },
        { id: "discussion", minutes: 10 },
        { id: "exit", minutes: 5 }
    ],

    // The lesson about using AI honestly (the note in the section links to it)
    honestLesson: 12
});
