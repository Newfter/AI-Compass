/* =========================================================
   AI COMPASS — TEXTS: ACCOUNTS
   Every text of the online account (js/account.js): the card in
   Settings → Account, saving, signing in and out, the invitation to sign
   in, the line next to the progress, and the "Your account" card of
   My Compass (js/journey-panel.js), in English and Russian.
   Russian uses the informal "ты".
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- The menu bar button and the Ctrl+K command -----
        "account.navSignIn": "Sign in",
        "account.navLabelOut": "Account: sign in to keep your progress forever",
        "account.navLabelIn": "Your account: {name}",
        "account.cmdGroup": "Account",
        "account.cmd.signIn": "Save my progress forever: sign in with Google",
        "account.cmd.open": "My account",

        // ----- Settings → Account, signed out: the invitation -----
        "account.card.title": "Save your progress forever",
        "account.card.text": "It's free with your Google account: your progress goes with you to every device you use, and other people only ever see your nickname.",
        "account.card.button": "Sign in with Google",
        "account.card.working": "Opening Google…",
        "account.card.note": "You can learn without an account.",
        "account.card.offline": "You're offline. Signing in needs the internet.",
        "account.card.failed": "Signing in didn't work. Please try again.",
        "account.card.blocked": "This browser doesn't let the site save anything (a private window, or strict settings), so signing in can't work here.",
        "account.wait.text": "Connecting to your account…",
        "account.wait.failed": "Your account can't be reached right now. Check the internet connection.",

        // ----- Signed in -----
        "account.in.google": "Google account: {email}. Only you see this.",
        "account.state.ok": "All progress saved · {when}",
        "account.state.saving": "Saving…",
        "account.state.checking": "Getting your saved progress…",
        "account.state.offline": "Offline: it will save when you're back",
        "account.state.failed": "Couldn't save",
        "account.state.retry": "Try again",
        "account.in.nickname": "Your nickname on the leaderboard",
        "account.in.nicknameHint": "3 to 20 characters: letters, digits, spaces, _ . - This is the only thing other people see.",
        "account.in.nicknameChoose": "Pick the name other players will see. You can change it any time.",
        "account.in.save": "Save name",
        "account.in.saved": "Name saved",
        "account.in.nicknameInvalid": "Use 3 to 20 characters: letters, digits, spaces, _ . or -",
        "account.in.nicknameTaken": "Someone already has that name. Try another one.",
        "account.in.nicknameFailed": "The name couldn't be saved. Check your connection and try again.",
        "account.in.challenge": "Knowledge Challenge",
        "account.in.compass": "My Compass",
        "account.leave.remove": "Remove my progress from this device",
        "account.leave.removeHint": "Best on a shared or school computer: the next person starts fresh. Your progress stays safe in your account; sign in again to get it back.",
        "account.leave.keepHint": "Your progress stays on this device, so anyone who uses it can continue it. Best only on your own device.",
        "account.in.signOut": "Sign out",
        "account.leave.working": "Saving, then signing out…",
        "account.leave.unsaved": "Your latest progress couldn't be saved yet, so you're still signed in. Try again when you're online.",
        "account.leave.unsavedKeep": "Your latest progress isn't in your account yet (maybe there's no internet), so you're still signed in. If you sign out anyway, it stays only on this device: sign in here again later to save it. It never goes into another person's account.",
        "account.leave.anyway": "Sign out anyway",
        "account.privacy.title": "What is kept, and who sees it",
        "account.privacy.nickname": "Other people only see your nickname, on the leaderboard.",
        "account.privacy.email": "Your e-mail address is never shown to other people.",
        "account.privacy.progress": "Your progress is private: only you can see it.",
        "account.privacy.delete": "You can delete your account and everything saved in it at any time, here in Settings.",
        "account.in.danger": "Delete my account",
        "account.in.dangerAsk": "Really delete? Press again",
        "account.in.dangerNote": "Deletes your account, your saved progress and your challenge results from our database for good. What is saved in this browser stays here.",
        "account.in.deleted": "Your account and its data were deleted.",
        "account.in.deleteFailed": "The account couldn't be deleted just now. Check your connection and try again.",

        // ----- Toasts -----
        "account.toast.signedIn": "Signed in as {name}",
        "account.toast.welcome": "Welcome! Pick your leaderboard name.",
        "account.toast.merged": "Your saved progress is here now.",
        "account.toast.kept": "Signed out. Your progress stays on this device too.",
        "account.toast.removed": "Signed out. Your progress was removed from this device and is safe in your account.",

        // ----- The invitation after real progress, and the line next to the progress (signed out) -----
        "account.nudge.text": "Keep your progress forever: sign in with Google",
        "account.nudge.yes": "Sign in",
        "account.nudge.no": "Not now",
        "account.line.text": "Your progress is saved only on this device. Sign in to keep it forever.",
        "account.line.button": "Sign in",

        // ----- My Compass: the "Your account" card (js/journey-panel.js, section 10) -----
        "account.dash.title": "Your account",
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

        // ----- "5 minutes ago" -----
        "account.when.now": "just now",
        "account.when.minutes": "{n} minute ago|{n} minutes ago",
        "account.when.hours": "{n} hour ago|{n} hours ago",
        "account.when.date": "on {date}"
    },
    ru: {
        // ----- The menu bar button and the Ctrl+K command -----
        "account.navSignIn": "Войти",
        "account.navLabelOut": "Аккаунт: войди, чтобы сохранить прогресс навсегда",
        "account.navLabelIn": "Твой аккаунт: {name}",
        "account.cmdGroup": "Аккаунт",
        "account.cmd.signIn": "Сохранить прогресс навсегда: войти через Google",
        "account.cmd.open": "Мой аккаунт",

        // ----- Settings → Account, signed out: the invitation -----
        "account.card.title": "Сохрани свой прогресс навсегда",
        "account.card.text": "Это бесплатно, с твоим аккаунтом Google: прогресс будет с тобой на любом твоём устройстве, а другие люди увидят только твой ник.",
        "account.card.button": "Войти через Google",
        "account.card.working": "Открываю Google…",
        "account.card.note": "Учиться можно и без аккаунта.",
        "account.card.offline": "Нет интернета. Чтобы войти, нужен интернет.",
        "account.card.failed": "Войти не получилось. Попробуй ещё раз.",
        "account.card.blocked": "Этот браузер не даёт сайту ничего сохранять (приватное окно или строгие настройки), поэтому войти здесь не получится.",
        "account.wait.text": "Подключаюсь к твоему аккаунту…",
        "account.wait.failed": "Сейчас не получается связаться с аккаунтом. Проверь интернет.",

        // ----- Signed in -----
        "account.in.google": "Аккаунт Google: {email}. Это видишь только ты.",
        "account.state.ok": "Весь прогресс сохранён · {when}",
        "account.state.saving": "Сохраняю…",
        "account.state.checking": "Загружаю сохранённый прогресс…",
        "account.state.offline": "Нет интернета: сохраню, когда он появится",
        "account.state.failed": "Не получилось сохранить",
        "account.state.retry": "Попробовать ещё раз",
        "account.in.nickname": "Твой ник в таблице лидеров",
        "account.in.nicknameHint": "От 3 до 20 знаков: буквы, цифры, пробелы, _ . - Это единственное, что видят другие.",
        "account.in.nicknameChoose": "Выбери имя, которое увидят другие игроки. Его можно поменять в любой момент.",
        "account.in.save": "Сохранить имя",
        "account.in.saved": "Имя сохранено",
        "account.in.nicknameInvalid": "Нужно от 3 до 20 знаков: буквы, цифры, пробелы, _ . или -",
        "account.in.nicknameTaken": "Такое имя уже занято. Попробуй другое.",
        "account.in.nicknameFailed": "Имя не сохранилось. Проверь интернет и попробуй ещё раз.",
        "account.in.challenge": "Проверка знаний",
        "account.in.compass": "Мой компас",
        "account.leave.remove": "Убрать мой прогресс с этого устройства",
        "account.leave.removeHint": "Лучше всего на общем или школьном компьютере: следующий человек начнёт с чистого листа. Прогресс останется в твоём аккаунте — войди снова, и он вернётся.",
        "account.leave.keepHint": "Прогресс останется на этом устройстве, и любой, кто им пользуется, сможет его продолжить. Подходит только для твоего собственного устройства.",
        "account.in.signOut": "Выйти",
        "account.leave.working": "Сохраняю и выхожу…",
        "account.leave.unsaved": "Последний прогресс пока не сохранился, поэтому выход не выполнен. Попробуй снова, когда будет интернет.",
        "account.leave.unsavedKeep": "Последний прогресс ещё не попал в твой аккаунт (может быть, нет интернета), поэтому выход не выполнен. Если всё равно выйти, он останется только на этом устройстве: войди здесь снова позже, чтобы сохранить его. В чужой аккаунт он не попадёт.",
        "account.leave.anyway": "Всё равно выйти",
        "account.privacy.title": "Что хранится и кто это видит",
        "account.privacy.nickname": "Другие люди видят только твой ник — в таблице лидеров.",
        "account.privacy.email": "Твой адрес почты никогда не видят другие люди.",
        "account.privacy.progress": "Твой прогресс — личный: его видишь только ты.",
        "account.privacy.delete": "Ты можешь в любой момент удалить аккаунт и всё, что в нём сохранено, — здесь, в настройках.",
        "account.in.danger": "Удалить мой аккаунт",
        "account.in.dangerAsk": "Точно удалить? Нажми ещё раз",
        "account.in.dangerNote": "Навсегда удаляет аккаунт, сохранённый прогресс и результаты Проверки знаний из нашей базы данных. То, что сохранено в этом браузере, остаётся здесь.",
        "account.in.deleted": "Аккаунт и его данные удалены.",
        "account.in.deleteFailed": "Удалить аккаунт сейчас не удалось. Проверь интернет и попробуй ещё раз.",

        // ----- Toasts -----
        "account.toast.signedIn": "Вход выполнен: {name}",
        "account.toast.welcome": "Добро пожаловать! Выбери имя для таблицы лидеров.",
        "account.toast.merged": "Твой сохранённый прогресс уже здесь.",
        "account.toast.kept": "Выход выполнен. Прогресс остался и на этом устройстве.",
        "account.toast.removed": "Выход выполнен. Прогресс убран с этого устройства и хранится в твоём аккаунте.",

        // ----- The invitation after real progress, and the line next to the progress (signed out) -----
        "account.nudge.text": "Сохрани прогресс навсегда: войди через Google",
        "account.nudge.yes": "Войти",
        "account.nudge.no": "Не сейчас",
        "account.line.text": "Твой прогресс сохранён только на этом устройстве. Войди, чтобы сохранить его навсегда.",
        "account.line.button": "Войти",

        // ----- My Compass: the "Your account" card (js/journey-panel.js, section 10) -----
        "account.dash.title": "Твой аккаунт",
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

        // ----- "5 minutes ago" -----
        "account.when.now": "только что",
        "account.when.minutes": "{n} минуту назад|{n} минуты назад|{n} минут назад",
        "account.when.hours": "{n} час назад|{n} часа назад|{n} часов назад",
        "account.when.date": "{date}"
    }
});

// With accounts switched on (js/config.js is filled in), progress is no longer saved
// "only in this browser", so a few texts of other features say so. js/account.js puts
// these in place (also for the texts of features that load later), and only then.
window.AICompass.content.set("account", {
    textsOn: {
        en: {
            "about.value1Text": "No ads, no cost, and no sign-up needed. Sign in with Google only if you want your progress kept forever, on every device.",
            "journey.privacy": "Your progress is saved in this browser. Signed in, it is kept in your account too, so it follows you to other devices. Other visitors never see it.",
            "lessons.hud.privacy": "Your progress is saved in this browser, and in your account when you are signed in.",
            "quiz.start.privacy": "Your best scores, daily streak and mistakes are saved in this browser, and in your account when you are signed in.",
            "glossary.cardsSaved": "Your cards are saved in this browser, and in your account when you are signed in.",
            "teachers.fact.privateText": "No tracking: students learn without an account, and nothing they do is sent anywhere. Signing in is optional, saves their own progress, and shows other people only a nickname.",
            "learn.setup.privacy": "Your answers are saved in this browser, and in your account if you sign in.",
            "learn.play.saved": "Your answers are saved in this browser, and in your account when you are signed in.",
            "lessons.cert.privacy": "Your name is saved in this browser, and in your account when you are signed in.",
            "research.nb.intro": "Results from the bench and your own notes, kept in this browser (and in your account when you are signed in). Export them to keep a copy.",
            "settings.privacy": "Your settings are saved in this browser, and in your account when you are signed in.",
            "teachers.cq.privacy": "These choices are kept in this browser, and in your account when you are signed in."
        },
        ru: {
            "about.value1Text": "Без рекламы и оплаты, регистрация не нужна. Вход через Google — только если хочешь сохранить прогресс навсегда и на всех устройствах.",
            "journey.privacy": "Твой прогресс хранится в этом браузере. После входа он хранится и в твоём аккаунте — так он будет с тобой на других устройствах. Другие посетители его не видят.",
            "lessons.hud.privacy": "Прогресс хранится в этом браузере, а после входа в аккаунт — и в нём.",
            "quiz.start.privacy": "Рекорды, серия дней и ошибки хранятся в этом браузере, а после входа в аккаунт — и в нём.",
            "glossary.cardsSaved": "Твои карточки хранятся в этом браузере, а после входа в аккаунт — и в нём.",
            "teachers.fact.privateText": "Никакой слежки: ученики учатся без аккаунта, и ничего из того, что они делают, никуда не отправляется. Вход — по желанию: он сохраняет только собственный прогресс, а другим виден лишь ник.",
            "learn.setup.privacy": "Твои ответы хранятся в этом браузере, а после входа в аккаунт — и в нём.",
            "learn.play.saved": "Твои ответы хранятся в этом браузере, а после входа в аккаунт — и в нём.",
            "lessons.cert.privacy": "Имя хранится в этом браузере, а после входа в аккаунт — и в нём.",
            "research.nb.intro": "Результаты со стенда и твои заметки хранятся в этом браузере (а после входа — и в аккаунте). Экспортируй их, чтобы сохранить копию.",
            "settings.privacy": "Настройки хранятся в этом браузере, а после входа в аккаунт — и в нём.",
            "teachers.cq.privacy": "Эти настройки хранятся в этом браузере, а после входа в аккаунт — и в нём."
        }
    }
});
