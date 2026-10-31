/* =========================================================
   AI COMPASS — TEXTS: THE MAIN PAGE
   Every word in English and in Russian (informal "ты").
   The menu, the hero, the section titles of the page, About and the footer.
   Used by index.html (data-i18n) and js/core.js.
   To change a text, change it here (in both languages).
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        "core.skip": "Skip to content",
        "core.searchLabel": "Search the site (Ctrl + K)",
        "core.journeyLabel": "My Compass: your progress",
        "core.settingsLabel": "Settings",
        "core.themeLabel": "Switch light / dark theme",
        "core.langLabel": "RU — switch to Russian",
        "core.themeQuick": "Light / dark theme",        // the same two buttons in the phone menu
        "core.langQuick": "Русский",                    // written in the language it switches to
        "core.langQuickCode": "ru",
        "core.menuLabel": "Open menu",
        "core.menuClose": "Close menu",
        "core.navMain": "Main menu",
        "core.navFooter": "Footer links",
        "core.pageTitle": "AI Compass | Explore Artificial Intelligence",
        "core.pageDescription": "AI Compass — a free bilingual platform for learning about Artificial Intelligence: lessons, live AI experiments, a quiz, a glossary and more.",
        "core.toastLight": "Light mode on",
        "core.toastDark": "Dark mode on",
        "core.toastLang": "Language: English",

        "nav.lessons": "Lessons",
        "nav.lab": "AI Lab",
        "nav.quiz": "Quiz",
        "nav.glossary": "Glossary",
        "nav.timeline": "History",
        "nav.about": "About",

        "hero.label": "YOUR AI JOURNEY STARTS HERE",
        "hero.titleStart": "Navigate the World of",
        "hero.titleAccent": "AI",
        "hero.subtitle": "A free, interactive guide to Artificial Intelligence for",
        "hero.rotator": "students|teachers|parents|everyone",
        "hero.ctaLessons": "Start learning",
        "hero.ctaLab": "Try the AI Lab",
        // The words under the hero numbers. The numbers come from the data, so each
        // label has a form for every number (.one, .many; Russian also .few). The
        // plain key is the label while the number is not known yet.
        "hero.statLessons": "interactive lessons",
        "hero.statLessons.one": "interactive lesson",
        "hero.statLessons.many": "interactive lessons",
        "hero.statDemos": "live AI experiments",
        "hero.statDemos.one": "live AI experiment",
        "hero.statDemos.many": "live AI experiments",
        "hero.statQuiz": "quiz questions",
        "hero.statQuiz.one": "quiz question",
        "hero.statQuiz.many": "quiz questions",
        "hero.statLanguages": "languages",
        "hero.statLanguages.one": "language",
        "hero.statLanguages.many": "languages",
        "hero.scrollHint": "Scroll to the lessons",

        "about.label": "OUR MISSION",
        "about.title": "About AI Compass",
        "about.text": "AI Compass is your starting point for exploring the world of Artificial Intelligence. It was made by students as a CAS project, to help anyone understand how AI works, how to use it wisely, and how to think about it critically.",
        "about.value1Title": "Free for everyone",
        "about.value1Text": "No sign-up, no ads, no cost. Just open it and learn.",
        "about.value2Title": "Bilingual",
        "about.value2Text": "Everything is available in English and Russian.",
        "about.value3Title": "Learn by doing",
        "about.value3Text": "Experiments, quizzes and an assistant make ideas stick.",

        "footer.tagline": "Made for curious minds.",
        "footer.cas": "A student CAS project.",
        "footer.top": "Back to top ↑",

        "cmd.groupNavigate": "Go to",
        "cmd.groupActions": "Actions",
        "cmd.home": "Home",
        "cmd.toggleTheme": "Switch light / dark theme",
        "cmd.toggleLang": "Language — switch to Russian"
    },
    ru: {
        "core.skip": "Перейти к содержанию",
        "core.searchLabel": "Поиск по сайту (Ctrl + K)",
        "core.journeyLabel": "Мой компас: твой прогресс",
        "core.settingsLabel": "Настройки",
        "core.themeLabel": "Сменить светлую / тёмную тему",
        "core.langLabel": "EN — переключить на английский",
        "core.themeQuick": "Сменить тему",
        "core.langQuick": "English",
        "core.langQuickCode": "en",
        "core.menuLabel": "Открыть меню",
        "core.menuClose": "Закрыть меню",
        "core.navMain": "Главное меню",
        "core.navFooter": "Ссылки в подвале сайта",
        "core.pageTitle": "AI Compass | Исследуй искусственный интеллект",
        "core.pageDescription": "AI Compass — бесплатная платформа на двух языках для знакомства с искусственным интеллектом: уроки, живые ИИ-эксперименты, тест, словарь и многое другое.",
        "core.toastLight": "Включена светлая тема",
        "core.toastDark": "Включена тёмная тема",
        "core.toastLang": "Язык: русский",

        "nav.lessons": "Уроки",
        "nav.lab": "ИИ-лаборатория",
        "nav.quiz": "Тест",
        "nav.glossary": "Словарь",
        "nav.timeline": "История",
        "nav.about": "О проекте",

        "hero.label": "ТВОЁ ПУТЕШЕСТВИЕ В МИР ИИ НАЧИНАЕТСЯ ЗДЕСЬ",
        "hero.titleStart": "Исследуй мир",
        "hero.titleAccent": "ИИ",
        "hero.subtitle": "Бесплатный интерактивный путеводитель по искусственному интеллекту для",
        "hero.rotator": "школьников|учителей|родителей|всех",
        "hero.ctaLessons": "Начать обучение",
        "hero.ctaLab": "Открыть ИИ-лабораторию",
        "hero.statLessons": "интерактивных уроков",
        "hero.statLessons.one": "интерактивный урок",
        "hero.statLessons.few": "интерактивных урока",
        "hero.statLessons.many": "интерактивных уроков",
        "hero.statDemos": "живых ИИ-эксперимента",
        "hero.statDemos.one": "живой ИИ-эксперимент",
        "hero.statDemos.few": "живых ИИ-эксперимента",
        "hero.statDemos.many": "живых ИИ-экспериментов",
        "hero.statQuiz": "вопросов в тесте",
        "hero.statQuiz.one": "вопрос в тесте",
        "hero.statQuiz.few": "вопроса в тесте",
        "hero.statQuiz.many": "вопросов в тесте",
        "hero.statLanguages": "языка",
        "hero.statLanguages.one": "язык",
        "hero.statLanguages.few": "языка",
        "hero.statLanguages.many": "языков",
        "hero.scrollHint": "Прокрутить к урокам",

        "about.label": "НАША МИССИЯ",
        "about.title": "Об AI Compass",
        "about.text": "AI Compass — твоя отправная точка для изучения мира искусственного интеллекта. Его создали школьники в рамках проекта CAS, чтобы помочь каждому понять, как работает ИИ, как пользоваться им с умом и как оценивать его критически.",
        "about.value1Title": "Бесплатно для всех",
        "about.value1Text": "Без регистрации, рекламы и оплаты. Просто открой и учись.",
        "about.value2Title": "На двух языках",
        "about.value2Text": "Всё доступно на английском и русском.",
        "about.value3Title": "Учись на практике",
        "about.value3Text": "Эксперименты, тесты и чат-бот помогают лучше запомнить материал.",

        "footer.tagline": "Создано для любознательных умов.",
        "footer.cas": "Школьный проект CAS.",
        "footer.top": "Наверх ↑",

        "cmd.groupNavigate": "Перейти",
        "cmd.groupActions": "Действия",
        "cmd.home": "Главная",
        "cmd.toggleTheme": "Сменить светлую / тёмную тему",
        "cmd.toggleLang": "Язык — переключить на английский"
    }
});
