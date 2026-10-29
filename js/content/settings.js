/* =========================================================
   AI COMPASS — TEXTS: SETTINGS AND KEYBOARD SHORTCUTS
   Every word in English and in Russian (informal "ты").
   Used by js/settings.js: the Settings window, its Ctrl+K commands
   and the keyboard shortcuts window (press ?).
   At the end: the list of keyboard shortcuts and the sentences the
   voices read as a sample (data, not texts to translate).
   To change a text, change it here (in both languages).
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- The window -----
        "settings.title": "Settings",
        "settings.kicker": "MAKE IT YOURS",
        "settings.intro": "Every change works at once, on the whole site.",
        "settings.close": "Close settings",

        // The small sample card at the top: it shows the current settings
        "settings.preview": "PREVIEW",
        "settings.previewTitle": "How a neural network learns",
        "settings.previewText": "It looks at thousands of examples and adjusts its connections a little after each mistake, until its answers get better.",
        "settings.previewLink": "Read the lesson",
        "settings.previewButton": "Try it",

        // The groups
        "settings.groupLanguage": "Language and theme",
        "settings.groupReading": "Reading",
        "settings.groupComfort": "Comfort",
        "settings.groupSound": "Reading aloud",

        // Language and theme
        "settings.language": "Language",
        "settings.theme": "Theme",
        "settings.themeDark": "Dark",
        "settings.themeLight": "Light",
        "settings.themeSystem": "Like my device",
        "settings.themeNowDark": "Your device is in dark mode now.",
        "settings.themeNowLight": "Your device is in light mode now.",

        // Reading
        "settings.textSize": "Text size",
        "settings.textSizeHint": "Bigger letters on the whole site.",
        "settings.lineSpacing": "Line spacing",
        "settings.lineNormal": "Normal",
        "settings.lineRelaxed": "Relaxed",
        "settings.lineSpacingHint": "More room between the lines makes long texts easier to follow.",
        "settings.easyFont": "Easy-to-read font",
        "settings.easyFontHint": "Atkinson Hyperlegible: letters that are hard to mix up, like I, l and 1. It is downloaded from Google Fonts when you turn it on.",
        "settings.easyFontLoading": "Loading the font…",
        "settings.easyFontError": "The font could not be downloaded. Check your internet connection, then turn it off and on again.",
        "settings.underline": "Underline links",
        "settings.underlineHint": "Links stand out from the text without relying on colour.",

        // Comfort
        "settings.contrast": "High contrast",
        "settings.contrastHint": "Stronger text and borders, solid backgrounds and a clear focus frame.",
        "settings.solid": "Reduce transparency",
        "settings.solidHint": "Solid backgrounds instead of see-through glass.",
        "settings.calm": "Calm motion",
        "settings.calmHint": "Pauses the animations and the moving background.",
        "settings.calmDevice": "Your device already asks for less motion, so the animations stay paused.",

        // Reading aloud
        "settings.soundHint": "The voice and speed for the “Listen” button in the lessons.",
        "settings.voiceEn": "Voice for English",
        "settings.voiceRu": "Voice for Russian",
        "settings.voiceAuto": "Automatic",
        "settings.voiceNone": "This device has no voice for this language yet.",
        "settings.voiceTry": "Listen",
        "settings.voiceTryEn": "Listen to the English voice",
        "settings.voiceTryRu": "Listen to the Russian voice",
        "settings.voiceFailed": "The voice could not play on this device.",
        "settings.speed": "Speed",
        "settings.speedValue": "{n}×",
        "settings.soundNone": "Your browser can't read aloud, so these settings are not needed here.",

        // The bottom of the window
        "settings.privacy": "Your settings stay in this browser. Nothing is sent anywhere.",
        "settings.noStorage": "This browser doesn't let the site save settings, so they last until you close the page.",
        "settings.shortcuts": "Keyboard shortcuts",
        "settings.reset": "Reset to defaults",
        "settings.resetAsk": "Sure? Press again",
        "settings.resetNote": "The language and the theme stay as they are.",
        "settings.resetDone": "Settings are back to the defaults",

        // Messages for screen readers and toasts. {setting} is the name of a setting
        "settings.saidOn": "{setting}: on",
        "settings.saidOff": "{setting}: off",
        "settings.saidValue": "{setting}: {value}",

        // ----- Ctrl+K commands -----
        "settings.cmdGroup": "Settings",
        "settings.cmdOpen": "Settings",
        "settings.cmdShortcuts": "Keyboard shortcuts",
        "settings.cmdBigger": "Bigger text",
        "settings.cmdSmaller": "Smaller text",
        "settings.cmdTurnOn": "{setting}: turn on",
        "settings.cmdTurnOff": "{setting}: turn off",
        "settings.cmdRelaxed": "Relaxed line spacing",
        "settings.cmdSystemTheme": "Theme like my device",
        "settings.atLargest": "The text is already at its largest size",
        "settings.atSmallest": "The text is already at its normal size",

        // ----- The keyboard shortcuts window -----
        "settings.keysTitle": "Keyboard shortcuts",
        "settings.keysIntro": "Press ? at any time to open this list.",
        "settings.keysClose": "Close keyboard shortcuts",
        "settings.keysOr": "or",

        "settings.keysEverywhere": "Everywhere",
        "settings.keysLessons": "In a lesson",
        "settings.keysQuiz": "Quiz",
        "settings.keysLab": "AI Lab: Teach the machine",
        "settings.keysGlossary": "Glossary search",
        "settings.keysTimeline": "History",
        "settings.keysPalette": "Site search ({shortcut})",       // {shortcut}: Ctrl+K, or ⌘K on a Mac
        "settings.keysBot": "Compass Bot",

        // What each shortcut does
        "settings.do.palette": "Open the site search",
        "settings.do.help": "Show this list",
        "settings.do.escape": "Close the window on top",
        "settings.do.secret": "A surprise in the background (a famous code from old video games)",
        "settings.do.lessonMove": "Previous or next lesson",
        "settings.do.lessonClose": "Close the lesson",
        "settings.do.quizAnswer": "Choose the first, second, third… answer",
        "settings.do.quizNext": "Next question (after you answer)",
        "settings.do.labMove": "Move the cursor on the board (with Shift: faster)",
        "settings.do.labDot": "Put a dot under the cursor",
        "settings.do.labClass": "Choose class A or class B",
        "settings.do.labUndo": "Take back the last dot",
        "settings.do.labOther": "A dot of the other class",
        "settings.do.labTabs": "Switch between the experiments (on their tabs)",
        "settings.do.glossaryOpen": "Open the first term found",
        "settings.do.glossaryClear": "Clear the search",
        "settings.do.timelineMove": "Go through the eras and the “In the glossary” buttons",
        "settings.do.timelinePick": "Show one era, or open the term in the glossary",
        "settings.do.paletteMove": "Move through the results",
        "settings.do.paletteEnds": "Jump to the first or the last result",
        "settings.do.palettePage": "Jump a few results at a time",
        "settings.do.paletteRun": "Open the chosen result",
        "settings.do.botSend": "Send your message",
        "settings.do.botLast": "In an empty box: bring back your last message",
        "settings.do.botClose": "Close the chat",

        // Names of keys that are written as words
        "settings.key.shift": "Shift",
        "settings.key.esc": "Esc",
        "settings.key.enter": "Enter",
        "settings.key.space": "Space",
        "settings.key.tab": "Tab",
        "settings.key.backspace": "Backspace",
        "settings.key.delete": "Delete",
        "settings.key.home": "Home",
        "settings.key.end": "End",
        "settings.key.pageUp": "Page Up",
        "settings.key.pageDown": "Page Down",
        "settings.key.click": "click",
        "settings.key.rightClick": "right-click",
        "settings.key.arrows": "Arrow keys"
    },
    ru: {
        // ----- Окно -----
        "settings.title": "Настройки",
        "settings.kicker": "НАСТРОЙ ПОД СЕБЯ",
        "settings.intro": "Каждое изменение сразу работает на всём сайте.",
        "settings.close": "Закрыть настройки",

        "settings.preview": "ПРЕДПРОСМОТР",
        "settings.previewTitle": "Как учится нейросеть",
        "settings.previewText": "Она рассматривает тысячи примеров и после каждой ошибки чуть-чуть подстраивает свои связи, пока ответы не станут лучше.",
        "settings.previewLink": "Читать урок",
        "settings.previewButton": "Попробовать",

        "settings.groupLanguage": "Язык и тема",
        "settings.groupReading": "Чтение",
        "settings.groupComfort": "Комфорт",
        "settings.groupSound": "Чтение вслух",

        "settings.language": "Язык",
        "settings.theme": "Тема",
        "settings.themeDark": "Тёмная",
        "settings.themeLight": "Светлая",
        "settings.themeSystem": "Как на устройстве",
        "settings.themeNowDark": "Сейчас на твоём устройстве тёмная тема.",
        "settings.themeNowLight": "Сейчас на твоём устройстве светлая тема.",

        "settings.textSize": "Размер текста",
        "settings.textSizeHint": "Крупнее буквы на всём сайте.",
        "settings.lineSpacing": "Межстрочный интервал",
        "settings.lineNormal": "Обычный",
        "settings.lineRelaxed": "Свободный",
        "settings.lineSpacingHint": "Когда между строками больше места, в длинном тексте легче не сбиться.",
        "settings.easyFont": "Удобный для чтения шрифт",
        "settings.easyFontHint": "Andika: чёткие буквы, которые трудно перепутать. Шрифт скачивается из Google Fonts, когда ты его включаешь.",
        "settings.easyFontLoading": "Шрифт загружается…",
        "settings.easyFontError": "Не удалось скачать шрифт. Проверь подключение к интернету, потом выключи и снова включи его.",
        "settings.underline": "Подчёркивать ссылки",
        "settings.underlineHint": "Ссылки видны в тексте, даже если не различать цвета.",

        "settings.contrast": "Высокий контраст",
        "settings.contrastHint": "Более яркий текст и рамки, сплошной фон и чёткая рамка фокуса.",
        "settings.solid": "Меньше прозрачности",
        "settings.solidHint": "Сплошной фон вместо полупрозрачного «стекла».",
        "settings.calm": "Спокойный режим",
        "settings.calmHint": "Останавливает анимации и движущийся фон.",
        "settings.calmDevice": "Твоё устройство уже просит меньше движения, поэтому анимации и так остановлены.",

        "settings.soundHint": "Голос и скорость для кнопки «Слушать» в уроках.",
        "settings.voiceEn": "Голос для английского",
        "settings.voiceRu": "Голос для русского",
        "settings.voiceAuto": "Автоматически",
        "settings.voiceNone": "На этом устройстве пока нет голоса для этого языка.",
        "settings.voiceTry": "Послушать",
        "settings.voiceTryEn": "Послушать английский голос",
        "settings.voiceTryRu": "Послушать русский голос",
        "settings.voiceFailed": "На этом устройстве голос не заработал.",
        "settings.speed": "Скорость",
        "settings.speedValue": "{n}×",
        "settings.soundNone": "Твой браузер не умеет читать вслух, поэтому здесь эти настройки не нужны.",

        "settings.privacy": "Настройки хранятся только в этом браузере и никуда не отправляются.",
        "settings.noStorage": "Этот браузер не даёт сайту сохранять настройки, поэтому они действуют, пока открыта страница.",
        "settings.shortcuts": "Сочетания клавиш",
        "settings.reset": "Сбросить настройки",
        "settings.resetAsk": "Точно? Нажми ещё раз",
        "settings.resetNote": "Язык и тема останутся прежними.",
        "settings.resetDone": "Настройки сброшены",

        "settings.saidOn": "{setting}: вкл.",
        "settings.saidOff": "{setting}: выкл.",
        "settings.saidValue": "{setting}: {value}",

        "settings.cmdGroup": "Настройки",
        "settings.cmdOpen": "Настройки",
        "settings.cmdShortcuts": "Сочетания клавиш",
        "settings.cmdBigger": "Крупнее текст",
        "settings.cmdSmaller": "Мельче текст",
        "settings.cmdTurnOn": "{setting}: включить",
        "settings.cmdTurnOff": "{setting}: выключить",
        "settings.cmdRelaxed": "Свободный межстрочный интервал",
        "settings.cmdSystemTheme": "Тема как на устройстве",
        "settings.atLargest": "Текст уже самого крупного размера",
        "settings.atSmallest": "У текста уже обычный размер",

        "settings.keysTitle": "Сочетания клавиш",
        "settings.keysIntro": "Нажми ? в любой момент, чтобы открыть этот список.",
        "settings.keysClose": "Закрыть сочетания клавиш",
        "settings.keysOr": "или",

        "settings.keysEverywhere": "Везде",
        "settings.keysLessons": "В уроке",
        "settings.keysQuiz": "Тест",
        "settings.keysLab": "ИИ-лаборатория: «Обучи машину»",
        "settings.keysGlossary": "Поиск в словаре",
        "settings.keysTimeline": "История",
        "settings.keysPalette": "Поиск по сайту ({shortcut})",
        "settings.keysBot": "Compass Bot",

        "settings.do.palette": "Открыть поиск по сайту",
        "settings.do.help": "Показать этот список",
        "settings.do.escape": "Закрыть верхнее окно",
        "settings.do.secret": "Сюрприз на фоне (знаменитый код из старых видеоигр)",
        "settings.do.lessonMove": "Предыдущий или следующий урок",
        "settings.do.lessonClose": "Закрыть урок",
        "settings.do.quizAnswer": "Выбрать первый, второй, третий… ответ",
        "settings.do.quizNext": "Следующий вопрос (после ответа)",
        "settings.do.labMove": "Двигать курсор по полю (с Shift — быстрее)",
        "settings.do.labDot": "Поставить точку под курсором",
        "settings.do.labClass": "Выбрать класс A или класс B",
        "settings.do.labUndo": "Убрать последнюю точку",
        "settings.do.labOther": "Точка другого класса",
        "settings.do.labTabs": "Переключать эксперименты (на их вкладках)",
        "settings.do.glossaryOpen": "Открыть первый найденный термин",
        "settings.do.glossaryClear": "Очистить поиск",
        "settings.do.timelineMove": "Переходить по эпохам и кнопкам «В словаре»",
        "settings.do.timelinePick": "Показать одну эпоху или открыть термин в словаре",
        "settings.do.paletteMove": "Двигаться по результатам",
        "settings.do.paletteEnds": "Перейти к первому или последнему результату",
        "settings.do.palettePage": "Перескочить сразу на несколько результатов",
        "settings.do.paletteRun": "Открыть выбранный результат",
        "settings.do.botSend": "Отправить сообщение",
        "settings.do.botLast": "В пустом поле: вернуть твоё последнее сообщение",
        "settings.do.botClose": "Закрыть чат",

        "settings.key.shift": "Shift",
        "settings.key.esc": "Esc",
        "settings.key.enter": "Enter",
        "settings.key.space": "Пробел",
        "settings.key.tab": "Tab",
        "settings.key.backspace": "Backspace",
        "settings.key.delete": "Delete",
        "settings.key.home": "Home",
        "settings.key.end": "End",
        "settings.key.pageUp": "Page Up",
        "settings.key.pageDown": "Page Down",
        "settings.key.click": "клик",
        "settings.key.rightClick": "правый клик",
        "settings.key.arrows": "Стрелки"
    }
});

window.AICompass.content.set("settings", {
    // ----- The keyboard shortcuts window (press ?) -----
    // Each group has a title (a text key above) and its shortcuts. A shortcut has
    // "keys": the ways to press it (shown with "or" between them). Each way is a
    // list of keys pressed together ("+" between them), or, with "sequence: true",
    // one after another. How a key is written:
    //   "mod"                  Ctrl, or ⌘ on a Mac
    //   "shift", "esc", ...    a key with a name: the text "settings.key.<name>"
    //   "K", "/", "↑", "1"...  anything else is written as it is
    //   "…"                    plain text between the keys, not a key
    // "does" is the text key of what it does. The comment above each shortcut
    // says where the site handles that key, so the list can be checked.
    shortcuts: [
        {
            title: "settings.keysEverywhere",
            items: [
                // js/palette.js, 8 (Shortcuts): Ctrl+K / Cmd+K opens and closes it, "/" opens it
                { keys: [["mod", "K"], ["/"]], does: "settings.do.palette" },
                // js/settings.js, 12 (Changes, keys and links): "?" opens and closes this list
                { keys: [["?"]], does: "settings.do.help" },
                // js/core.js, 9 (Overlays): Esc closes the window on top
                { keys: [["esc"]], does: "settings.do.escape" },
                // js/neural-bg.js, 11: the "Konami code" starts a neural storm
                { keys: [["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"]], sequence: true, does: "settings.do.secret" }
            ]
        },
        {
            title: "settings.keysLessons",
            items: [
                // js/lessons.js, 16: ← and → while the lesson reader is open
                { keys: [["←"], ["→"]], does: "settings.do.lessonMove" },
                // js/core.js, 9 (Overlays): Esc closes the reader
                { keys: [["esc"]], does: "settings.do.lessonClose" }
            ]
        },
        {
            title: "settings.keysQuiz",
            items: [
                // js/quiz.js, 15: number keys answer (1 for the first answer...)
                { keys: [["1"], ["2"], ["3"], ["…"]], does: "settings.do.quizAnswer" },
                // js/quiz.js, 15: Enter goes on once the question is answered
                { keys: [["enter"]], does: "settings.do.quizNext" }
            ]
        },
        {
            title: "settings.keysLab",
            items: [
                // js/lab.js, onBoardKey: arrows move the cursor, Shift + arrows move it further
                { keys: [["arrows"], ["shift", "arrows"]], does: "settings.do.labMove" },
                // js/lab.js, onBoardKey: Enter or Space adds a dot
                { keys: [["enter"], ["space"]], does: "settings.do.labDot" },
                // js/lab.js, onBoardKey: A and B pick the class
                { keys: [["A"], ["B"]], does: "settings.do.labClass" },
                // js/lab.js, onBoardKey: Backspace, Delete or Ctrl+Z undo
                { keys: [["backspace"], ["delete"], ["mod", "Z"]], does: "settings.do.labUndo" },
                // js/lab.js, pointer handlers: Shift+click or a right click adds a dot of the other class
                { keys: [["shift", "click"], ["rightClick"]], does: "settings.do.labOther" },
                // js/lab.js, setUpTabs: arrows, Home and End on the experiment tabs
                { keys: [["←"], ["→"], ["home"], ["end"]], does: "settings.do.labTabs" }
            ]
        },
        {
            title: "settings.keysGlossary",
            items: [
                // js/glossary.js, 14 (Events): Enter in the search box opens the first card
                { keys: [["enter"]], does: "settings.do.glossaryOpen" },
                // js/glossary.js, 14 (Events): Esc in the search box clears it
                { keys: [["esc"]], does: "settings.do.glossaryClear" }
            ]
        },
        {
            title: "settings.keysTimeline",
            items: [
                // js/timeline.js has no keys of its own: the era chips and the term
                // buttons are normal buttons (5. Era filter, 6. Glossary buttons)
                { keys: [["tab"], ["shift", "tab"]], does: "settings.do.timelineMove" },
                { keys: [["enter"], ["space"]], does: "settings.do.timelinePick" }
            ]
        },
        {
            title: "settings.keysPalette",
            items: [
                // js/palette.js, 6 (Keyboard and mouse)
                { keys: [["↑"], ["↓"]], does: "settings.do.paletteMove" },
                { keys: [["home"], ["end"]], does: "settings.do.paletteEnds" },
                { keys: [["pageUp"], ["pageDown"]], does: "settings.do.palettePage" },
                { keys: [["enter"]], does: "settings.do.paletteRun" }
            ]
        },
        {
            title: "settings.keysBot",
            items: [
                // js/assistant.js, 8: the message box is a form (Enter sends it)
                { keys: [["enter"]], does: "settings.do.botSend" },
                // js/assistant.js, 8: Arrow Up in an empty box
                { keys: [["↑"]], does: "settings.do.botLast" },
                // js/core.js, 9 (Overlays): Esc closes the chat (on a computer: while you are in it)
                { keys: [["esc"]], does: "settings.do.botClose" }
            ]
        }
    ],

    // ----- What the voices read when you press "Listen" in the settings -----
    // Always in the voice's own language, whatever language the site is in.
    voiceSamples: {
        en: "Hi! This is how your lessons will sound.",
        ru: "Привет! Так будут звучать твои уроки."
    }
});
