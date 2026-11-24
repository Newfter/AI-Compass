/* =========================================================
   AI COMPASS — TEXTS: THE APP, OFFLINE USE AND SHARING
   Every word in English and in Russian (informal "ты").
   Used by js/platform.js: the "Install the app" box in the footer of index.html,
   the "The app" group of the settings window and the Ctrl+K commands.
   Two pages have their texts inside them instead, because they must work without
   the site's scripts: the offline page (section 7 of sw.js) and 404.html.
   To change a text, change it here (in both languages).
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // The button in the footer and in the settings window
        "platform.install": "Install the app",
        "platform.installed": "AI Compass is installed. Find it with your other apps.",
        "platform.alreadyInstalled": "AI Compass is already installed on this device.",
        "platform.installMenu": "To install AI Compass, open your browser's menu and look for “Install” or “Add to Home screen”.",

        // Where to tap, in browsers that can install the site but have no install window of their own.
        // iPhones and iPads: Safari, and since iOS 16.4 Chrome, Edge and the others too
        "platform.iosHelp": "On an iPhone or iPad: tap the Share button (a square with an arrow; if you don't see it, tap ⋯ first). Then choose “Add to Home Screen”.",
        // iPhones and iPads with an older system, and a page opened inside another app (a chat...)
        "platform.iosSafariHelp": "Open this page in Safari. There, tap the Share button (a square with an arrow), then choose “Add to Home Screen”.",
        // Safari 17 or newer on a Mac
        "platform.macHelp": "In Safari on a Mac: open the File menu at the top of the screen and choose “Add to Dock”.",
        // Firefox on Android phones and tablets
        "platform.firefoxHelp": "In Firefox: tap the menu ⋮ and look for “Install” or “Add to Home screen” (it may be inside “Save”).",

        // The group in the settings window (shown only where the site can be installed)
        "platform.settingsTitle": "The app",
        "platform.settingsHint": "Put AI Compass on this device like any other app: it gets its own icon and works even without the internet.",

        // The connection drops or comes back
        "platform.offline": "You're offline. Everything you've opened still works.",
        "platform.online": "You're back online.",

        // AICompass.share(): what is shared by default, and the copy fallback
        "platform.shareTitle": "AI Compass",
        "platform.shareText": "AI Compass: learn how AI works, free and without sign-up. Short lessons, experiments and a personal path, in English and Russian.",
        "platform.copied": "Link copied. Paste it anywhere to share it.",
        "platform.copyFailed": "Couldn't copy the link: {url}",

        // Ctrl+K commands
        "platform.cmdInstall": "Install AI Compass as an app",
        "platform.cmdShare": "Share AI Compass with a friend",
        "platform.cmdPrint": "Print this page (an open lesson prints as a handout)"
    },
    ru: {
        "platform.install": "Установить приложение",
        "platform.installed": "AI Compass установлен. Ищи его среди своих приложений.",
        "platform.alreadyInstalled": "AI Compass уже установлен на этом устройстве.",
        "platform.installMenu": "Чтобы установить AI Compass, открой меню браузера и найди «Установить» или «Добавить на главный экран».",

        "platform.iosHelp": "На iPhone или iPad: нажми кнопку «Поделиться» (квадрат со стрелкой; если её не видно, сначала нажми ⋯). Затем выбери «На экран „Домой“».",
        "platform.iosSafariHelp": "Открой эту страницу в Safari. Там нажми кнопку «Поделиться» (квадрат со стрелкой), а затем выбери «На экран „Домой“».",
        "platform.macHelp": "В Safari на Mac: открой меню «Файл» вверху экрана и выбери «Добавить в Dock».",
        "platform.firefoxHelp": "В Firefox: нажми меню ⋮ и найди «Установить» или «Добавить на домашний экран» (это может быть в разделе «Сохранить»).",

        "platform.settingsTitle": "Приложение",
        "platform.settingsHint": "Поставь AI Compass на это устройство, как обычное приложение: у него будет свой значок, и он будет работать даже без интернета.",

        "platform.offline": "Нет подключения к интернету. Всё, что уже открыто, продолжает работать.",
        "platform.online": "Ты снова в сети.",

        "platform.shareTitle": "AI Compass",
        "platform.shareText": "AI Compass: узнай, как работает ИИ, бесплатно и без регистрации. Короткие уроки, эксперименты и личный путь, на русском и английском.",
        "platform.copied": "Ссылка скопирована. Вставь её куда угодно, чтобы поделиться.",
        "platform.copyFailed": "Не получилось скопировать ссылку: {url}",

        "platform.cmdInstall": "Установить AI Compass как приложение",
        "platform.cmdShare": "Поделиться AI Compass с другом",
        "platform.cmdPrint": "Распечатать страницу (открытый урок печатается как раздаточный материал)"
    }
});
