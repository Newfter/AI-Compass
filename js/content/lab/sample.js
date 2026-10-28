/* =========================================================
   AI COMPASS — TEXTS: "GUESS THE LINE" (the sample experiment, js/lab/sample.js)
   Keys: lab.sample.*  The shared words (Play, Step, Loss...) are lab.kit.*
   in js/content/lab/kit.js. Plurals: "one|other" (English), "one|few|many" (Russian).
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        "lab.sample.title": "Guess the line",
        "lab.sample.hook": "Watch the computer slide a line onto the dots, one small step at a time.",
        "lab.sample.idea": "Gradient descent",
        "lab.sample.canvas": "The dots and the line that the computer is fitting",
        "lab.sample.chart": "The loss after each step",
        "lab.sample.describe": "{n} dots. The line is {line}. The loss is {loss}.",
        "lab.sample.dots": "Dots",
        "lab.sample.line": "The line",
        "lab.sample.errors": "Errors",
        "lab.sample.newDots": "New dots",
        "lab.sample.rateHint": "How big each step is.",
        "lab.sample.step1": "The line is <strong>y = {a}·x + {b}</strong>. The thin lines show how far it is from each dot.",
        "lab.sample.step2": "The <strong>loss</strong> is the average of the squared distances (each distance times itself): <strong>{loss}</strong>. Smaller is better.",
        "lab.sample.step3": "The gradient (<strong>{ga}</strong> for a, <strong>{gb}</strong> for b) points uphill: it says how fast the loss grows when a or b grows. Each step moves a and b a little the other way, downhill: by the learning rate times the gradient.",
        "lab.sample.fit": "The line has stopped moving: no straight line fits these dots better.",
        "lab.sample.blown": "The line flew away! The steps were too big. Make the learning rate smaller and press Reset.",
        "lab.sample.doneFit": "Done after {n} step. The loss is {loss}.|Done after {n} steps. The loss is {loss}.",
        "lab.sample.doneBlown": "The loss exploded: the learning rate is too big.",
        "lab.sample.ch1": "Fit the line: get the loss under 0.01.",
        "lab.sample.ch1Why": "Many small downhill steps add up. That is what training a model means.",
        "lab.sample.ch2": "Push the learning rate to the top and press Play.",
        "lab.sample.ch2Why": "A step that is too big jumps past the bottom of the valley, further every time. That's why the learning rate matters.",
        "lab.sample.ideaLine": "Finding the bottom by small steps downhill is called",
        "lab.sample.term": "gradient descent"
    },
    ru: {
        "lab.sample.title": "Угадай прямую",
        "lab.sample.hook": "Посмотри, как компьютер шаг за шагом подгоняет прямую к точкам.",
        "lab.sample.idea": "Градиентный спуск",
        "lab.sample.canvas": "Точки и прямая, которую подбирает компьютер",
        "lab.sample.chart": "Ошибка после каждого шага",
        "lab.sample.describe": "Точек: {n}. Прямая: {line}. Ошибка: {loss}.",
        "lab.sample.dots": "Точки",
        "lab.sample.line": "Прямая",
        "lab.sample.errors": "Промахи",
        "lab.sample.newDots": "Новые точки",
        "lab.sample.rateHint": "Насколько большой каждый шаг.",
        "lab.sample.step1": "Прямая сейчас такая: <strong>y = {a}·x + {b}</strong>. Тонкие линии показывают, насколько она промахивается мимо каждой точки.",
        "lab.sample.step2": "<strong>Ошибка</strong> — это среднее квадратов этих промахов: <strong>{loss}</strong>. Чем меньше, тем лучше.",
        "lab.sample.step3": "Градиент (<strong>{ga}</strong> для a и <strong>{gb}</strong> для b) показывает направление «вверх по склону»: как быстро растёт ошибка, когда растёт a или b. На каждом шаге компьютер чуть-чуть сдвигает a и b в обратную сторону, вниз: на скорость обучения, умноженную на градиент.",
        "lab.sample.fit": "Прямая больше не двигается: никакая другая прямая не ляжет на эти точки лучше.",
        "lab.sample.blown": "Прямая улетела! Шаги были слишком большими. Уменьши скорость обучения и нажми «Сброс».",
        "lab.sample.doneFit": "Готово за {n} шаг. Ошибка: {loss}.|Готово за {n} шага. Ошибка: {loss}.|Готово за {n} шагов. Ошибка: {loss}.",
        "lab.sample.doneBlown": "Ошибка взлетела: скорость обучения слишком большая.",
        "lab.sample.ch1": "Подгони прямую: сделай ошибку меньше 0,01.",
        "lab.sample.ch1Why": "Много маленьких шагов вниз складываются в большой путь. Это и есть обучение модели.",
        "lab.sample.ch2": "Поставь скорость обучения на максимум и нажми «Пуск».",
        "lab.sample.ch2Why": "Слишком большой шаг перепрыгивает дно долины, и каждый раз всё дальше. Вот почему так важна скорость обучения.",
        "lab.sample.ideaLine": "Искать самое низкое место маленькими шагами вниз — это",
        "lab.sample.term": "градиентный спуск"
    }
});
