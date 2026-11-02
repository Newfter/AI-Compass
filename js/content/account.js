/* =========================================================
   AI COMPASS — TEXTS: ACCOUNTS
   Every text of signing in, the account window, the nickname and the
   progress saved online (js/account.js), in English and Russian.
   Russian uses the informal "ты".
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- The menu bar button and the Ctrl+K commands -----
        "account.navSignIn": "Sign in",
        "account.navLabelOut": "Sign in with Google to save your progress online",
        "account.navLabelIn": "Your account: {name}",
        "account.cmdGroup": "Account",
        "account.cmd.signIn": "Sign in with Google",
        "account.cmd.open": "My account",
        "account.cmd.signOut": "Sign out",

        // ----- The window -----
        "account.kicker": "ACCOUNT",
        "account.title": "Your account",
        "account.close": "Close",
        "account.loadFailed": "The account tools couldn't load. Check your internet connection and try again.",

        // Signed out
        "account.out.intro": "Sign in with your Google account to keep your progress safe online, use it on any device, and play the Knowledge Challenge for the leaderboard.",
        "account.out.button": "Sign in with Google",
        "account.out.working": "Opening Google…",
        "account.out.what": "What is saved to your account",
        "account.out.what1": "Your finished lessons, quiz results, flashcards and lab experiments.",
        "account.out.what2": "Your My Compass level, badges and streak.",
        "account.out.what3": "Your Knowledge Challenge results and your best time.",
        "account.out.privacy": "Only your nickname is ever shown to other people. Your e-mail address is never shown anywhere on the site, and nobody but you can see your progress.",
        "account.out.noAccount": "You can keep learning without an account: everything still works and is saved in this browser.",
        "account.out.offline": "You're offline. Signing in needs an internet connection.",
        "account.out.failed": "Signing in didn't work. Please try again.",

        // Signed in
        "account.in.hello": "Signed in with Google",
        "account.in.email": "as {email} (only you can see this)",
        "account.in.nickname": "Your nickname on the leaderboard",
        "account.in.nicknameHint": "3 to 20 characters: letters, digits, spaces, _ . - This is the only thing other people see.",
        "account.in.nicknameChoose": "Pick the name other players will see. You can change it any time.",
        "account.in.save": "Save name",
        "account.in.saved": "Name saved",
        "account.in.nicknameInvalid": "Use 3 to 20 characters: letters, digits, spaces, _ . or -",
        "account.in.nicknameTaken": "Someone already has that name. Try another one.",
        "account.in.nicknameFailed": "The name couldn't be saved. Check your connection and try again.",
        "account.in.sync": "Your progress",
        "account.in.syncOk": "Saved to your account {when}.",
        "account.in.syncNow": "Saving…",
        "account.in.syncNever": "Not saved yet.",
        "account.in.syncOffline": "You're offline: your progress will be saved when you're back online.",
        "account.in.syncFailed": "Saving didn't work just now. The site will try again.",
        "account.in.syncButton": "Save now",
        "account.in.merged": "Progress from your other devices was added.",
        "account.in.compass": "Open My Compass",
        "account.in.challenge": "Knowledge Challenge",
        "account.in.signOut": "Sign out",
        "account.in.signOutNote": "Signing out keeps your progress in this browser and in your account.",
        "account.in.signedOut": "You're signed out",
        "account.in.danger": "Delete my account",
        "account.in.dangerAsk": "Really delete? Press again",
        "account.in.dangerNote": "Deletes your account, your saved progress and your challenge results from our database for good. What is saved in this browser stays here.",
        "account.in.deleted": "Your account and its data were deleted.",
        "account.in.deleteFailed": "The account couldn't be deleted just now. Check your connection and try again.",

        // Toasts
        "account.toast.signedIn": "Signed in as {name}",
        "account.toast.welcome": "Welcome! Pick your leaderboard name.",
        "account.toast.merged": "Your progress from other devices has been added",
        "account.toast.signedOut": "Signed out",

        // Not switched on (this copy of the site has no Supabase project)
        "account.off.title": "Accounts aren't switched on",
        "account.off.text": "This copy of AI Compass has no account service connected yet. Everything else works, and your progress is saved in this browser.",

        // ----- The account card in My Compass (js/journey-panel.js) -----
        "account.dash.title": "Your account",
        "account.dash.out": "Sign in with Google to keep this progress online, use it on any device, and play the Knowledge Challenge for the leaderboard.",
        "account.dash.signIn": "Sign in with Google",
        "account.dash.in": "Signed in as {name}",
        "account.dash.manage": "Manage account",
        "account.dash.challenge": "Knowledge Challenge",
        "account.dash.loading": "Loading your results…",
        "account.dash.failed": "Your results couldn't be loaded. Check your connection and try again.",
        "account.dash.retry": "Try again",
        "account.dash.best": "Personal best",
        "account.dash.bestNone": "No result yet",
        "account.dash.bestIn": "in {time}",
        "account.dash.place": "Place, all time",
        "account.dash.placeWeek": "Place, this week",
        "account.dash.placeOf": "of {players}",
        "account.dash.placeNone": "Not on the board yet",
        "account.dash.counted": "Attempts that count",
        "account.dash.countedOf": "of {n} finished",
        "account.dash.attempts": "Your challenge attempts",
        "account.dash.attemptsNone": "You haven't played the Knowledge Challenge yet. Twenty questions from the lessons, and your best result goes on the leaderboard.",
        "account.dash.attempt": "{correct} of {total} right in {time}",
        "account.dash.attemptAbandoned": "Not finished",
        "account.dash.attemptExpired": "Time ran out",
        "account.dash.tooFast": "too fast to count",
        "account.dash.diary": "Your saved results",
        "account.dash.diaryNone": "Your finished lessons, quiz results and other results will be listed here as you learn.",
        "account.dash.more": "Show all ({n})",
        "account.dash.less": "Show fewer",
        "account.dash.ev.lesson": "Finished lesson {n}: {title}",
        "account.dash.ev.lessonOnly": "Finished lesson {n}",
        "account.dash.ev.quiz": "Quiz, {mode}: {score} of {total} right",
        "account.dash.ev.daily": "Daily challenge: {score} of {total} right",
        "account.dash.ev.certificate": "Certificate earned: {name}",
        "account.dash.ev.flashcards": "Flashcards: {correct} of {cards} right",
        "account.dash.ev.lab": "AI Lab: tried “{name}”",
        "account.dash.ev.labChallenge": "AI Lab: challenge done in “{name}”",
        "account.dash.privacy": "Only you can see this list. Other people only ever see your nickname, on the leaderboard.",

        // Times
        "account.when.now": "just now",
        "account.when.minutes": "{n} minute ago|{n} minutes ago",
        "account.when.hours": "{n} hour ago|{n} hours ago",
        "account.when.date": "on {date}"
    },
    ru: {
        "account.navSignIn": "Войти",
        "account.navLabelOut": "Войти через Google, чтобы сохранять прогресс онлайн",
        "account.navLabelIn": "Твой аккаунт: {name}",
        "account.cmdGroup": "Аккаунт",
        "account.cmd.signIn": "Войти через Google",
        "account.cmd.open": "Мой аккаунт",
        "account.cmd.signOut": "Выйти",

        "account.kicker": "АККАУНТ",
        "account.title": "Твой аккаунт",
        "account.close": "Закрыть",
        "account.loadFailed": "Не удалось загрузить инструменты аккаунта. Проверь интернет и попробуй ещё раз.",

        "account.out.intro": "Войди через свой аккаунт Google, чтобы прогресс хранился онлайн, был доступен на любом устройстве, и чтобы играть в Проверку знаний на таблицу лидеров.",
        "account.out.button": "Войти через Google",
        "account.out.working": "Открываем Google…",
        "account.out.what": "Что сохраняется в аккаунте",
        "account.out.what1": "Пройденные уроки, результаты тестов, карточки и эксперименты лаборатории.",
        "account.out.what2": "Уровень, значки и серия дней в «Моём компасе».",
        "account.out.what3": "Результаты Проверки знаний и твоё лучшее время.",
        "account.out.privacy": "Другие люди видят только твой ник. Адрес электронной почты никогда не показывается на сайте, а твой прогресс не видит никто, кроме тебя.",
        "account.out.noAccount": "Учиться можно и без аккаунта: всё работает и сохраняется в этом браузере.",
        "account.out.offline": "Ты офлайн. Для входа нужен интернет.",
        "account.out.failed": "Войти не получилось. Попробуй ещё раз.",

        "account.in.hello": "Вход через Google",
        "account.in.email": "как {email} (это видишь только ты)",
        "account.in.nickname": "Твой ник в таблице лидеров",
        "account.in.nicknameHint": "От 3 до 20 знаков: буквы, цифры, пробелы, _ . - Это единственное, что видят другие.",
        "account.in.nicknameChoose": "Выбери имя, которое увидят другие игроки. Его можно поменять в любой момент.",
        "account.in.save": "Сохранить имя",
        "account.in.saved": "Имя сохранено",
        "account.in.nicknameInvalid": "Нужно от 3 до 20 знаков: буквы, цифры, пробелы, _ . или -",
        "account.in.nicknameTaken": "Такое имя уже занято. Попробуй другое.",
        "account.in.nicknameFailed": "Имя не сохранилось. Проверь интернет и попробуй ещё раз.",
        "account.in.sync": "Твой прогресс",
        "account.in.syncOk": "Сохранён в аккаунте {when}.",
        "account.in.syncNow": "Сохраняем…",
        "account.in.syncNever": "Пока не сохранён.",
        "account.in.syncOffline": "Ты офлайн: прогресс сохранится, когда появится интернет.",
        "account.in.syncFailed": "Сохранить сейчас не удалось. Сайт попробует ещё раз.",
        "account.in.syncButton": "Сохранить сейчас",
        "account.in.merged": "Прогресс с других устройств добавлен.",
        "account.in.compass": "Открыть Мой компас",
        "account.in.challenge": "Проверка знаний",
        "account.in.signOut": "Выйти",
        "account.in.signOutNote": "После выхода прогресс остаётся и в этом браузере, и в аккаунте.",
        "account.in.signedOut": "Выход из аккаунта выполнен",
        "account.in.danger": "Удалить мой аккаунт",
        "account.in.dangerAsk": "Точно удалить? Нажми ещё раз",
        "account.in.dangerNote": "Навсегда удаляет аккаунт, сохранённый прогресс и результаты Проверки знаний из нашей базы данных. То, что сохранено в этом браузере, остаётся здесь.",
        "account.in.deleted": "Аккаунт и его данные удалены.",
        "account.in.deleteFailed": "Удалить аккаунт сейчас не удалось. Проверь интернет и попробуй ещё раз.",

        "account.toast.signedIn": "Вход выполнен: {name}",
        "account.toast.welcome": "Добро пожаловать! Выбери имя для таблицы лидеров.",
        "account.toast.merged": "Прогресс с других устройств добавлен",
        "account.toast.signedOut": "Выход выполнен",

        "account.off.title": "Аккаунты не включены",
        "account.off.text": "К этой копии AI Compass пока не подключён сервис аккаунтов. Всё остальное работает, а прогресс сохраняется в этом браузере.",

        "account.dash.title": "Твой аккаунт",
        "account.dash.out": "Войди через Google, чтобы этот прогресс хранился онлайн, был доступен на любом устройстве, и чтобы играть в Проверку знаний на таблицу лидеров.",
        "account.dash.signIn": "Войти через Google",
        "account.dash.in": "Вход выполнен: {name}",
        "account.dash.manage": "Настроить аккаунт",
        "account.dash.challenge": "Проверка знаний",
        "account.dash.loading": "Загружаем твои результаты…",
        "account.dash.failed": "Не удалось загрузить результаты. Проверь интернет и попробуй ещё раз.",
        "account.dash.retry": "Попробовать ещё раз",
        "account.dash.best": "Лучший результат",
        "account.dash.bestNone": "Пока нет",
        "account.dash.bestIn": "за {time}",
        "account.dash.place": "Место за всё время",
        "account.dash.placeWeek": "Место на этой неделе",
        "account.dash.placeOf": "из {players}",
        "account.dash.placeNone": "Пока не в таблице",
        "account.dash.counted": "Попыток в зачёт",
        "account.dash.countedOf": "из {n} законченных",
        "account.dash.attempts": "Твои попытки в Проверке знаний",
        "account.dash.attemptsNone": "Проверка знаний ещё не пройдена. Двадцать вопросов по урокам, а лучший результат попадает в таблицу лидеров.",
        "account.dash.attempt": "{correct} из {total} за {time}",
        "account.dash.attemptAbandoned": "Не закончена",
        "account.dash.attemptExpired": "Время вышло",
        "account.dash.tooFast": "слишком быстро, не в зачёт",
        "account.dash.diary": "Твои сохранённые результаты",
        "account.dash.diaryNone": "Здесь будут появляться пройденные уроки, результаты тестов и другие результаты.",
        "account.dash.more": "Показать все ({n})",
        "account.dash.less": "Показать меньше",
        "account.dash.ev.lesson": "Пройден урок {n}: {title}",
        "account.dash.ev.lessonOnly": "Пройден урок {n}",
        "account.dash.ev.quiz": "Тест, {mode}: {score} из {total}",
        "account.dash.ev.daily": "Испытание дня: {score} из {total}",
        "account.dash.ev.certificate": "Получен сертификат: {name}",
        "account.dash.ev.flashcards": "Карточки: {correct} из {cards}",
        "account.dash.ev.lab": "Лаборатория: опыт «{name}»",
        "account.dash.ev.labChallenge": "Лаборатория: выполнено задание в опыте «{name}»",
        "account.dash.privacy": "Этот список видишь только ты. Другие люди видят только твой ник — в таблице лидеров.",

        "account.when.now": "только что",
        "account.when.minutes": "{n} минуту назад|{n} минуты назад|{n} минут назад",
        "account.when.hours": "{n} час назад|{n} часа назад|{n} часов назад",
        "account.when.date": "{date}"
    }
});

// With accounts switched on (js/config.js is filled in: the same test as js/account.js), a few
// texts of other features change, because progress is no longer saved "only in this browser".
// This file comes after those features' texts in index.html, so these versions win.
(function () {
    const config = window.AICompassConfig || {};
    const on = /^https?:\/\//.test(String(config.supabaseUrl || "")) && String(config.supabaseAnonKey || "").length > 8;
    if (!on) return;
    window.AICompass.addTranslations({
        en: {
            "about.value1Text": "No ads, no cost, and no sign-up needed. Sign in with Google only if you want your progress saved online.",
            "journey.privacy": "Your progress is saved in this browser. Signed in, a copy is kept in your account too, so it follows you to other devices. Other visitors never see it.",
            "lessons.hud.privacy": "Your progress is saved in this browser, and in your account when you are signed in.",
            "quiz.start.privacy": "Your best scores, daily streak and mistakes are saved in this browser, and in your account when you are signed in.",
            "glossary.cardsSaved": "Your cards are saved in this browser, and in your account when you are signed in.",
            "teachers.fact.privateText": "No tracking: students learn without an account, and nothing they do is sent anywhere. Signing in is optional, saves their own progress, and shows other people only a nickname."
        },
        ru: {
            "about.value1Text": "Без рекламы и оплаты, регистрация не нужна. Вход через Google — только если хочешь хранить прогресс онлайн.",
            "journey.privacy": "Твой прогресс хранится в этом браузере. После входа в аккаунт копия хранится и в нём — так прогресс будет с тобой на других устройствах. Другие посетители его не видят.",
            "lessons.hud.privacy": "Прогресс хранится в этом браузере, а после входа в аккаунт — и в нём.",
            "quiz.start.privacy": "Рекорды, серия дней и ошибки хранятся в этом браузере, а после входа в аккаунт — и в нём.",
            "glossary.cardsSaved": "Твои карточки хранятся в этом браузере, а после входа в аккаунт — и в нём.",
            "teachers.fact.privateText": "Никакой слежки: ученики учатся без аккаунта, и ничего из того, что они делают, никуда не отправляется. Вход — по желанию: он сохраняет только собственный прогресс, а другим виден лишь ник."
        }
    });
})();
