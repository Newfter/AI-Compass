/* =========================================================
   AI COMPASS — TEXTS: THE LAB KIT
   The words that the lab kit (js/lab/kit.js) shows itself, and the
   shared words that every experiment can reuse ("Play", "Step",
   "Learning rate"...), in English and in Russian (informal "ты").
   Keys: lab.kit.*   To change a text, change it here in both languages.
   Plurals are written "one|other" in English and "one|few|many" in Russian.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- Buttons that most experiments have -----
        "lab.kit.play": "Play",
        "lab.kit.pause": "Pause",
        "lab.kit.step": "Step",
        "lab.kit.reset": "Reset",
        "lab.kit.start": "Start",
        "lab.kit.stop": "Stop",
        "lab.kit.newRandom": "New random",
        "lab.kit.shuffle": "Shuffle",
        "lab.kit.showMore": "Show more",
        "lab.kit.showLess": "Show less",

        // ----- Speeds -----
        "lab.kit.speed": "Speed",
        "lab.kit.speedSlow": "Slow",
        "lab.kit.speedNormal": "Normal",
        "lab.kit.speedFast": "Fast",
        "lab.kit.speedWatch": "Watch",
        "lab.kit.speedTurbo": "Turbo",

        // ----- Names of the usual parts of an experiment -----
        "lab.kit.presets": "Examples",
        "lab.kit.settings": "Settings",
        "lab.kit.numbers": "Live numbers",
        "lab.kit.canvasLabel": "The experiment's picture",

        // ----- Words of machine learning that several experiments show -----
        "lab.kit.learningRate": "Learning rate",
        "lab.kit.loss": "Loss",
        "lab.kit.accuracy": "Accuracy",
        "lab.kit.epoch": "Epoch",
        "lab.kit.stepCount": "Steps",

        // ----- States -----
        "lab.kit.ready": "Ready",
        "lab.kit.running": "Running",
        "lab.kit.paused": "Paused",
        "lab.kit.finished": "Finished",
        "lab.kit.busy": "Working…",
        "lab.kit.done": "Done!",

        // ----- "What's happening?" -----
        "lab.kit.whatsHappening": "What's happening?",

        // ----- "Try this" challenges -----
        "lab.kit.tryThis": "Try this",
        "lab.kit.challengeCount": "{done} of {total}",
        "lab.kit.challengeDone": "Challenge done: {text}",
        "lab.kit.allDone": "Every challenge done. Nice work!",
        "lab.kit.stateDone": "Done.",
        "lab.kit.stateOpen": "Not done yet.",

        // ----- Hints -----
        "lab.kit.hintInfo": "Note",
        "lab.kit.hintTip": "Tip",
        "lab.kit.hintWarn": "Careful",
        "lab.kit.dismiss": "Hide this note",

        // ----- Numbers that go up or down (stat tiles) -----
        "lab.kit.trendUp": "going up",
        "lab.kit.trendDown": "going down",
        "lab.kit.trendFlat": "not changing",

        // ----- Charts (screen readers hear the summary) -----
        "lab.kit.chart": "Chart",
        "lab.kit.chartEmpty": "No data yet",
        "lab.kit.chartValues": "{n} value|{n} values",
        "lab.kit.chartSummary": "{name}: {count}, the latest is {last}, the lowest {min}, the highest {max}."
    },
    ru: {
        // ----- Кнопки, которые есть почти в каждом эксперименте -----
        "lab.kit.play": "Пуск",
        "lab.kit.pause": "Пауза",
        "lab.kit.step": "Шаг",
        "lab.kit.reset": "Сброс",
        "lab.kit.start": "Старт",
        "lab.kit.stop": "Стоп",
        "lab.kit.newRandom": "Новый случай",
        "lab.kit.shuffle": "Перемешать",
        "lab.kit.showMore": "Показать ещё",
        "lab.kit.showLess": "Свернуть",

        // ----- Скорости -----
        "lab.kit.speed": "Скорость",
        "lab.kit.speedSlow": "Медленно",
        "lab.kit.speedNormal": "Обычно",
        "lab.kit.speedFast": "Быстро",
        "lab.kit.speedWatch": "Наглядно",
        "lab.kit.speedTurbo": "Турбо",

        // ----- Названия обычных частей эксперимента -----
        "lab.kit.presets": "Примеры",
        "lab.kit.settings": "Настройки",
        "lab.kit.numbers": "Показатели",
        "lab.kit.canvasLabel": "Картинка эксперимента",

        // ----- Слова машинного обучения, которые встречаются в нескольких экспериментах -----
        "lab.kit.learningRate": "Скорость обучения",
        "lab.kit.loss": "Ошибка",
        "lab.kit.accuracy": "Точность",
        "lab.kit.epoch": "Эпоха",
        "lab.kit.stepCount": "Шаги",

        // ----- Состояния -----
        "lab.kit.ready": "Готово к запуску",
        "lab.kit.running": "Идёт",
        "lab.kit.paused": "На паузе",
        "lab.kit.finished": "Закончено",
        "lab.kit.busy": "Секунду…",
        "lab.kit.done": "Готово!",

        // ----- «Что происходит?» -----
        "lab.kit.whatsHappening": "Что здесь происходит?",

        // ----- Задания «Попробуй» -----
        "lab.kit.tryThis": "Попробуй",
        "lab.kit.challengeCount": "{done} из {total}",
        "lab.kit.challengeDone": "Задание выполнено: {text}",
        "lab.kit.allDone": "Все задания выполнены. Отличная работа!",
        "lab.kit.stateDone": "Выполнено.",
        "lab.kit.stateOpen": "Ещё не выполнено.",

        // ----- Подсказки -----
        "lab.kit.hintInfo": "Заметка",
        "lab.kit.hintTip": "Совет",
        "lab.kit.hintWarn": "Осторожно",
        "lab.kit.dismiss": "Скрыть заметку",

        // ----- Числа, которые растут или падают (плитки с показателями) -----
        "lab.kit.trendUp": "растёт",
        "lab.kit.trendDown": "падает",
        "lab.kit.trendFlat": "не меняется",

        // ----- Графики (программа чтения с экрана слышит краткое описание) -----
        "lab.kit.chart": "График",
        "lab.kit.chartEmpty": "Данных пока нет",
        "lab.kit.chartValues": "{n} значение|{n} значения|{n} значений",
        "lab.kit.chartSummary": "{name}: {count}, последнее — {last}, самое маленькое — {min}, самое большое — {max}."
    }
});
