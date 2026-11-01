/* =========================================================
   AI COMPASS — TEXTS: THE APP, OFFLINE USE AND SHARING
   Every word in English and in Russian (informal "ты").
   Used by js/platform.js and the "Install the app" button in the footer of index.html.
   Two pages have their texts inside them instead, because they must work without
   the site's scripts: the offline page (section 6 of sw.js) and 404.html.
   To change a text, change it here (in both languages).
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // The button in the footer and the help for iPhones and iPads
        "platform.install": "Install the app",
        "platform.iosHelp": "On an iPhone or iPad: tap the Share button (a square with an arrow), then “Add to Home Screen”.",
        "platform.installed": "AI Compass is installed. Find it with your other apps.",
        "platform.alreadyInstalled": "AI Compass is already installed on this device.",
        "platform.installMenu": "To install AI Compass, open your browser's menu and look for “Install” or “Add to Home screen”.",

        // The connection drops or comes back
        "platform.offline": "You're offline. Everything you've opened still works.",
        "platform.online": "You're back online.",

        // AICompass.share(): what is shared by default, and the copy fallback
        "platform.shareTitle": "AI Compass",
        "platform.shareText": "AI Compass: a free, interactive guide to Artificial Intelligence for teenagers, in English and Russian.",
        "platform.copied": "Link copied. Paste it anywhere to share it.",
        "platform.copyFailed": "Couldn't copy the link: {url}",

        // Ctrl+K commands
        "platform.cmdInstall": "Install AI Compass as an app",
        "platform.cmdShare": "Share AI Compass with a friend",
        "platform.cmdPrint": "Print this page (an open lesson prints as a handout)"
    },
    ru: {
        "platform.install": "Установить приложение",
        "platform.iosHelp": "На iPhone или iPad: нажми кнопку «Поделиться» (квадрат со стрелкой), а затем «На экран „Домой“».",
        "platform.installed": "AI Compass установлен. Ищи его среди своих приложений.",
        "platform.alreadyInstalled": "AI Compass уже установлен на этом устройстве.",
        "platform.installMenu": "Чтобы установить AI Compass, открой меню браузера и найди «Установить» или «Добавить на главный экран».",

        "platform.offline": "Нет подключения к интернету. Всё, что уже открыто, продолжает работать.",
        "platform.online": "Ты снова в сети.",

        "platform.shareTitle": "AI Compass",
        "platform.shareText": "AI Compass — бесплатный интерактивный путеводитель по искусственному интеллекту для подростков, на русском и английском.",
        "platform.copied": "Ссылка скопирована. Вставь её куда угодно, чтобы поделиться.",
        "platform.copyFailed": "Не получилось скопировать ссылку: {url}",

        "platform.cmdInstall": "Установить AI Compass как приложение",
        "platform.cmdShare": "Поделиться AI Compass с другом",
        "platform.cmdPrint": "Распечатать страницу (открытый урок печатается как раздаточный материал)"
    }
});
