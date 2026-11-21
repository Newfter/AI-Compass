/* =========================================================
   AI COMPASS — TEXTS: LEARNER ACCOUNTS ON THIS DEVICE
   Every text of js/profiles.js in English and in Russian (informal "ты"):
   the "Account" group of the Settings window, the greeting on the home
   page, the messages after each action and the Ctrl+K command.
   At the end: the pictures a learner can choose (data, not texts).
   To change a text, change it here (in both languages).

   Russian never shows the reader's gender, and it says "аккаунт" where
   English says "learner" (the Russian word for a learner has a gender).
   A {name} in a text is the name a learner typed: js/profiles.js shows
   every text as plain text, never as HTML.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- The group in Settings: no account yet -----
        "profiles.title": "Account",
        "profiles.intro": "Add your name and a picture. Your progress, look and settings are then kept under your own account on this device. No email and no password.",
        "profiles.create": "Create my account",
        "profiles.load": "Load an account from a file",
        "profiles.unavailable": "Accounts cannot be kept here, because this browser does not save data (this happens in a private window, for example).",

        // ----- The small form: a name and a picture -----
        "profiles.formCreate": "Create my account",
        "profiles.formAdd": "Add another learner",
        "profiles.formEdit": "Edit my account",
        "profiles.name": "Your name or nickname",
        "profiles.nameHint": "A nickname is enough. Do not use your full name.",
        "profiles.picture": "Choose a picture",
        "profiles.addHint": "A new learner starts from zero. The progress of “{name}” stays safe in its own account.",
        "profiles.submitCreate": "Create",
        "profiles.submitSave": "Save",
        "profiles.cancel": "Cancel",

        // ----- The group in Settings: with an account -----
        "profiles.cardNote": "Your progress is saved on this device.",
        "profiles.edit": "Edit",
        "profiles.export": "Save to a file",
        "profiles.others": "Other learners on this device",
        "profiles.learners": "Learners on this device",
        "profiles.switch": "Switch",
        "profiles.switchTo": "Switch to {name}",
        "profiles.delete": "Delete",
        "profiles.deleteNamed": "Delete the account “{name}”",
        "profiles.add": "Add another learner",
        "profiles.loadShort": "Load from a file",
        "profiles.honest": "Anyone who uses this device can open these accounts. They are not protected by a password. To move to another device, save your account to a file and load it there.",
        "profiles.deleteMine": "Delete this account",
        "profiles.deleteSure": "Sure? Press again to delete",
        "profiles.deleteWarning": "This erases the account “{name}” and all its progress from this device. It cannot be undone. To keep it, save it to a file first.",

        // The online account (shown only when online accounts are switched on)
        "profiles.online": "Online account",
        "profiles.onlineHint": "It keeps your progress on the internet too, with a Google account.",
        "profiles.onlineOpen": "Open",
        "profiles.onlineLock": "Sign out of the online account first. While you are signed in, accounts on this device cannot be added, switched, loaded or deleted.",

        // ----- What happened (the line in the group, and a toast) -----
        "profiles.created": "Your account is ready. Hi, {name}!",
        "profiles.edited": "Your account was changed.",
        "profiles.switched": "Now learning as {name}",
        "profiles.added": "The new account is ready. Now learning as {name}.",
        "profiles.guestKept": "What was on this device before is kept in the account “{name}”.",
        "profiles.exported": "Saved to the file {file}. Keep it in a safe place.",
        "profiles.imported": "The account “{name}” was loaded. It is in the list now.",
        "profiles.skipped": "{n} entry could not be read and was skipped.|{n} entries could not be read and were skipped.",
        "profiles.deleted": "The account “{name}” was deleted.",
        "profiles.deletedNext": "The account “{name}” was deleted. Now learning as {next}.",
        "profiles.deletedLast": "The account “{name}” was deleted. This device has no account now.",
        "profiles.otherTab": "The account was changed in another tab. Now learning as {name}.",
        "profiles.otherTabNone": "The account was changed in another tab.",
        "profiles.swapping": "Switching accounts…",

        // ----- What could not be done, and why -----
        "profiles.error.nameEmpty": "Type a name first.",
        "profiles.error.nameLong": "This name is too long. Use up to {max} letters.",
        "profiles.error.nameTaken": "There is already an account called “{name}”. Choose another name.",
        "profiles.error.full": "This device already has {max} accounts. Delete one to add another.",
        "profiles.error.noSpace": "The storage of this browser is full. Nothing was changed and nothing is lost. To free some space, save an account to a file and then delete it here.",
        "profiles.error.stuck": "The storage of this browser is full, so the change of account could not be finished. Nothing is lost, but nothing new is saved until it is finished. Free some space on the device, then open the site again.",
        "profiles.error.busy": "The accounts are being changed in another tab. Try again in a moment.",
        "profiles.error.online": "Sign out of the online account first.",
        "profiles.error.notFound": "This account is no longer on this device.",
        "profiles.error.damaged": "The saved data of this account cannot be read, so it cannot be opened.",
        "profiles.error.failed": "That did not work. Reload the page and try again.",
        "profiles.error.unavailable": "Accounts cannot be kept here, because this browser does not save data.",
        "profiles.error.fileBig": "This file is too big. An AI Compass account file is never larger than 3 MB.",
        "profiles.error.fileRead": "The file could not be read.",
        "profiles.error.fileWrong": "This is not an AI Compass account file.",
        "profiles.error.fileJourney": "This is a My Compass progress file. Load it in My Compass, not here.",
        "profiles.error.fileNewer": "This file comes from a newer version of AI Compass. Reload the page and try again.",

        // ----- Outside Settings -----
        "profiles.hello": "Hi, {name}!",
        "profiles.helloLabel": "Hi, {name}! Open your account in Settings",
        "profiles.cmd": "Account: create or switch",

        // Names given by the site itself
        "profiles.guest": "Guest",
        "profiles.defaultName": "Account",

        // The pictures (what a screen reader says for each)
        "profiles.avatar.fox": "Fox",
        "profiles.avatar.panda": "Panda",
        "profiles.avatar.cat": "Cat",
        "profiles.avatar.dog": "Dog",
        "profiles.avatar.lion": "Lion",
        "profiles.avatar.frog": "Frog",
        "profiles.avatar.penguin": "Penguin",
        "profiles.avatar.owl": "Owl",
        "profiles.avatar.turtle": "Turtle",
        "profiles.avatar.octopus": "Octopus",
        "profiles.avatar.unicorn": "Unicorn",
        "profiles.avatar.bee": "Bee",
        "profiles.avatar.rocket": "Rocket",
        "profiles.avatar.star": "Star",
        "profiles.avatar.rainbow": "Rainbow",
        "profiles.avatar.robot": "Robot"
    },

    ru: {
        // ----- Группа в настройках: аккаунта ещё нет -----
        "profiles.title": "Аккаунт",
        "profiles.intro": "Добавь имя и картинку. Тогда твой прогресс, оформление и настройки будут храниться в твоём аккаунте на этом устройстве. Без почты и без пароля.",
        "profiles.create": "Создать мой аккаунт",
        "profiles.load": "Загрузить аккаунт из файла",
        "profiles.unavailable": "Здесь аккаунты не сохранятся: этот браузер не хранит данные (так бывает, например, в приватном окне).",

        // ----- Маленькая форма: имя и картинка -----
        "profiles.formCreate": "Создать мой аккаунт",
        "profiles.formAdd": "Добавить ещё один аккаунт",
        "profiles.formEdit": "Изменить мой аккаунт",
        "profiles.name": "Твоё имя или ник",
        "profiles.nameHint": "Хватит и ника. Полное имя писать не нужно.",
        "profiles.picture": "Выбери картинку",
        "profiles.addHint": "Новый аккаунт начинается с нуля. Прогресс аккаунта «{name}» останется в сохранности.",
        "profiles.submitCreate": "Создать",
        "profiles.submitSave": "Сохранить",
        "profiles.cancel": "Отмена",

        // ----- Группа в настройках: аккаунт есть -----
        "profiles.cardNote": "Твой прогресс сохраняется на этом устройстве.",
        "profiles.edit": "Изменить",
        "profiles.export": "Сохранить в файл",
        "profiles.others": "Другие аккаунты на этом устройстве",
        "profiles.learners": "Аккаунты на этом устройстве",
        "profiles.switch": "Перейти",
        "profiles.switchTo": "Перейти в аккаунт «{name}»",
        "profiles.delete": "Удалить",
        "profiles.deleteNamed": "Удалить аккаунт «{name}»",
        "profiles.add": "Добавить ещё один аккаунт",
        "profiles.loadShort": "Загрузить из файла",
        "profiles.honest": "Эти аккаунты может открыть любой, кто пользуется этим устройством: пароля у них нет. Чтобы перейти на другое устройство, сохрани аккаунт в файл и загрузи его там.",
        "profiles.deleteMine": "Удалить этот аккаунт",
        "profiles.deleteSure": "Точно? Нажми ещё раз",
        "profiles.deleteWarning": "Аккаунт «{name}» и весь его прогресс будут стёрты с этого устройства. Вернуть их будет нельзя. Чтобы не потерять аккаунт, сначала сохрани его в файл.",

        // Онлайн-аккаунт (виден, только когда онлайн-аккаунты включены)
        "profiles.online": "Онлайн-аккаунт",
        "profiles.onlineHint": "Он хранит твой прогресс ещё и в интернете, через аккаунт Google.",
        "profiles.onlineOpen": "Открыть",
        "profiles.onlineLock": "Сначала выйди из онлайн-аккаунта. Пока вход выполнен, аккаунты на этом устройстве нельзя добавлять, менять, загружать и удалять.",

        // ----- Что произошло (строка в группе и всплывающее сообщение) -----
        "profiles.created": "Аккаунт создан. Привет, {name}!",
        "profiles.edited": "Аккаунт изменён.",
        "profiles.switched": "Теперь учится {name}",
        "profiles.added": "Новый аккаунт создан. Теперь учится {name}.",
        "profiles.guestKept": "То, что было на этом устройстве раньше, сохранено в аккаунте «{name}».",
        "profiles.exported": "Сохранено в файл {file}. Храни его в надёжном месте.",
        "profiles.imported": "Аккаунт «{name}» загружен. Он появился в списке.",
        "profiles.skipped": "{n} запись не прочиталась и пропущена.|{n} записи не прочитались и пропущены.|{n} записей не прочитались и пропущены.",
        "profiles.deleted": "Аккаунт «{name}» удалён.",
        "profiles.deletedNext": "Аккаунт «{name}» удалён. Теперь учится {next}.",
        "profiles.deletedLast": "Аккаунт «{name}» удалён. На этом устройстве больше нет аккаунтов.",
        "profiles.otherTab": "Аккаунт сменили в другой вкладке. Теперь учится {name}.",
        "profiles.otherTabNone": "Аккаунт сменили в другой вкладке.",
        "profiles.swapping": "Меняем аккаунт…",

        // ----- Что не получилось и почему -----
        "profiles.error.nameEmpty": "Сначала напиши имя.",
        "profiles.error.nameLong": "Имя слишком длинное: можно не больше {max} знаков.",
        "profiles.error.nameTaken": "Аккаунт с именем «{name}» уже есть. Выбери другое имя.",
        "profiles.error.full": "На этом устройстве уже {max} аккаунтов. Удали один, чтобы добавить новый.",
        "profiles.error.noSpace": "В хранилище браузера не хватило места. Ничего не изменилось и ничего не пропало. Чтобы освободить место, сохрани какой-нибудь аккаунт в файл и удали его здесь.",
        "profiles.error.stuck": "В хранилище браузера не хватило места, и смена аккаунта не закончилась. Ничего не пропало, но новое не сохранится, пока она не закончится. Освободи место на устройстве и открой сайт заново.",
        "profiles.error.busy": "Аккаунты сейчас меняются в другой вкладке. Попробуй ещё раз чуть позже.",
        "profiles.error.online": "Сначала выйди из онлайн-аккаунта.",
        "profiles.error.notFound": "Этого аккаунта на устройстве уже нет.",
        "profiles.error.damaged": "Сохранённые данные этого аккаунта не читаются, поэтому открыть его не получится.",
        "profiles.error.failed": "Не получилось. Обнови страницу и попробуй ещё раз.",
        "profiles.error.unavailable": "Здесь аккаунты не сохранятся: этот браузер не хранит данные.",
        "profiles.error.fileBig": "Файл слишком большой: файл аккаунта AI Compass не бывает больше 3 МБ.",
        "profiles.error.fileRead": "Не получилось прочитать файл.",
        "profiles.error.fileWrong": "Это не файл аккаунта AI Compass.",
        "profiles.error.fileJourney": "Это файл прогресса из «Моего компаса». Его загружают в «Моём компасе», а не здесь.",
        "profiles.error.fileNewer": "Этот файл создан в более новой версии AI Compass. Обнови страницу и попробуй ещё раз.",

        // ----- Вне настроек -----
        "profiles.hello": "Привет, {name}!",
        "profiles.helloLabel": "Привет, {name}! Открыть аккаунт в настройках",
        "profiles.cmd": "Аккаунт: создать или сменить",

        // Имена, которые даёт сам сайт
        "profiles.guest": "Гость",
        "profiles.defaultName": "Аккаунт",

        // Картинки (что произносит программа чтения с экрана)
        "profiles.avatar.fox": "Лиса",
        "profiles.avatar.panda": "Панда",
        "profiles.avatar.cat": "Кот",
        "profiles.avatar.dog": "Собака",
        "profiles.avatar.lion": "Лев",
        "profiles.avatar.frog": "Лягушка",
        "profiles.avatar.penguin": "Пингвин",
        "profiles.avatar.owl": "Сова",
        "profiles.avatar.turtle": "Черепаха",
        "profiles.avatar.octopus": "Осьминог",
        "profiles.avatar.unicorn": "Единорог",
        "profiles.avatar.bee": "Пчела",
        "profiles.avatar.rocket": "Ракета",
        "profiles.avatar.star": "Звезда",
        "profiles.avatar.rainbow": "Радуга",
        "profiles.avatar.robot": "Робот"
    }
});

// ----- The pictures -----
// Sixteen friendly emoji that every device can draw (all of them are older than 2020).
// "id" is the end of the text key above ("profiles.avatar.fox"); "emoji" is what is
// saved with the account and shown on the page. The first one is the picture of an
// account whose file names a picture this list does not have.
// Never remove a picture or change its emoji: saved accounts use them.
window.AICompass.content.set("profiles", {
    avatars: [
        { id: "fox", emoji: "🦊" },
        { id: "panda", emoji: "🐼" },
        { id: "cat", emoji: "🐱" },
        { id: "dog", emoji: "🐶" },
        { id: "lion", emoji: "🦁" },
        { id: "frog", emoji: "🐸" },
        { id: "penguin", emoji: "🐧" },
        { id: "owl", emoji: "🦉" },
        { id: "turtle", emoji: "🐢" },
        { id: "octopus", emoji: "🐙" },
        { id: "unicorn", emoji: "🦄" },
        { id: "bee", emoji: "🐝" },
        { id: "rocket", emoji: "🚀" },
        { id: "star", emoji: "⭐" },
        { id: "rainbow", emoji: "🌈" },
        { id: "robot", emoji: "🤖" }
    ]
});
