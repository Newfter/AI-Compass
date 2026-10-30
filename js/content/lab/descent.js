/* =========================================================
   AI COMPASS — TEXTS: "DOWN THE HILL" (gradient descent, js/lab/descent.js)
   Keys: lab.descent.*  The shared words (Play, Step, Loss, Learning rate...)
   are lab.kit.* in js/content/lab/kit.js. Plurals: "one|other" (English),
   "one|few|many" (Russian).
   Below the texts: the presets, a good race for each landscape
   (A.content "lab.descent").
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- The lab's catalogue -----
        "lab.descent.title": "Down the hill: gradient descent",
        "lab.descent.hook": "Race three balls down a hill of error, and see why the size of each step decides everything.",
        "lab.descent.idea": "Gradient descent: how models learn",

        // ----- Words used everywhere -----
        "lab.descent.ball": "Ball {n}",
        "lab.descent.pair": "({x}, {y})",

        // ----- The landscapes -----
        "lab.descent.landscape": "Landscape",
        "lab.descent.land.bowl": "Bowl",
        "lab.descent.land.valley": "Long valley",
        "lab.descent.land.banana": "Banana",
        "lab.descent.land.valleys": "Two valleys",
        "lab.descent.land.saddle": "Saddle",
        "lab.descent.land.bumpy": "Bumpy",
        "lab.descent.about.bowl": "The model's error is x² + y²: a round bowl, with its lowest point in the middle at (0, 0).",
        "lab.descent.about.valley": "The error is ½(x² + 20y²): a long, narrow valley, 20 times steeper across than along.",
        "lab.descent.about.banana": "Rosenbrock's “banana”: a bent valley with a very flat floor, lowest at (1, 1). Its heights go from 0 to about 2,500, so the colours follow a log scale.",
        "lab.descent.about.valleys": "A wide bowl with two dips: a deep one and a shallower one. The shallow one is a trap: a <em>local minimum</em>.",
        "lab.descent.about.saddle": "Down along y, up along x: a saddle. The middle is flat, but it isn't a dip. The lowest points are at (0, ±√5).",
        "lab.descent.about.bumpy": "A bowl covered in small bumps: lots of little dips around the real lowest point at (0, 0).",

        // ----- The controls -----
        "lab.descent.ridge": "Start on the ridge",
        "lab.descent.onRidge": "The start is now exactly on the ridge, where y = 0.",
        "lab.descent.view": "View",
        "lab.descent.viewMap": "Map",
        "lab.descent.view3d": "3-D",
        "lab.descent.noisy": "Noisy gradients",
        "lab.descent.noisyHint": "Adds a little randomness to every slope, like learning from small random batches of data.",
        "lab.descent.balls": "The balls",
        "lab.descent.optimizer": "Optimizer",
        "lab.descent.opt.gd": "Gradient descent",
        "lab.descent.opt.momentum": "Momentum",
        "lab.descent.opt.adam": "Adam",
        "lab.descent.gradLength": "Slope",

        // ----- The map, the 3-D view and the chart -----
        "lab.descent.sceneMap": "Map of “{land}”: the error as colours from low to high, with contour lines",
        "lab.descent.scene3d": "3-D view of “{land}”: the error as the height of a surface",
        "lab.descent.describeMap": "The start is at {start}, where the loss is {height} and the slope {slope}. Drag on the map or use the arrow keys to move it; Enter starts the race.",
        "lab.descent.describe3d": "The surface is turned {yaw}° and tilted {tilt}°: drag it or use the arrow keys to turn it. The start is at {start}, where the loss is {height}.",
        "lab.descent.describeBall": "{ball} ({opt}, learning rate {rate}) is at {at}, loss {loss}.",
        "lab.descent.mark.start": "start",
        "lab.descent.mark.arrow": "downhill, and how steep",
        "lab.descent.mark.lowest": "lowest point",
        "lab.descent.mark.dip": "another dip (a local minimum)",
        "lab.descent.mark.saddle": "flat spot (a saddle)",
        "lab.descent.low": "low",
        "lab.descent.high": "high",
        "lab.descent.chartTitle": "The loss after each step",
        "lab.descent.chart": "A chart of each ball's loss after each step",
        "lab.descent.lossLog": "Loss (log scale)",

        // ----- A ball's state, on its card -----
        "lab.descent.state.waiting": "At the start.",
        "lab.descent.state.moving": "Rolling downhill…",
        "lab.descent.state.loose": "The noise is shaking it…",
        "lab.descent.state.arrived": "At the lowest point.",
        "lab.descent.state.jiggleLowest": "Settled at the lowest point. The noise keeps it jiggling around the bottom, so its loss stays a little above 0.",
        "lab.descent.state.local": "Stuck in a local minimum: a dip, but not the lowest one.",
        "lab.descent.state.jiggleLocal": "Settled in a local minimum, a dip that isn't the lowest. The noise keeps it jiggling there.",
        "lab.descent.state.saddle": "Stuck on a flat spot (a saddle), not in a dip.",
        "lab.descent.state.exploded": "Exploded: its steps were too big.",
        "lab.descent.state.limit": "Out of steps, and not at the bottom yet.",

        // ----- News when a ball stops (read out by screen readers) -----
        "lab.descent.arrived": "{ball} reached the lowest point in {n} step.|{ball} reached the lowest point in {n} steps.",
        "lab.descent.stuckLocal": "{ball} got stuck in a local minimum after {n} step.|{ball} got stuck in a local minimum after {n} steps.",
        "lab.descent.stuckSaddle": "{ball} stopped on a flat spot (a saddle) after {n} step.|{ball} stopped on a flat spot (a saddle) after {n} steps.",
        "lab.descent.exploded": "{ball} exploded after {n} step: its steps were too big.|{ball} exploded after {n} steps: its steps were too big.",
        "lab.descent.limit": "{ball} ran out of steps after {n} step, still on its way down.|{ball} ran out of steps after {n} steps, still on its way down.",

        // ----- Notes under the map -----
        "lab.descent.explodedNote": "{ball} flew off the map: its steps were too big. Each step jumped over the bottom and landed higher up than before. Try a smaller learning rate.",
        "lab.descent.noBalls": "All the balls are off. Switch one on to race.",
        "lab.descent.shaken": "The noise can shake a stuck ball loose. Press Play to go on.",

        // ----- The idea in one sentence (with glossary links) -----
        "lab.descent.ideaLine": "Here a tiny model has just two numbers, x and y, and the height of the ground is its error: the {loss}. {training} means finding the numbers where the error is lowest, and {gd} gets there in small steps downhill. A real {nn} does the same with millions of numbers, its {parameters}.",
        "lab.descent.termLoss": "loss",
        "lab.descent.termTraining": "Training",
        "lab.descent.termGD": "gradient descent",
        "lab.descent.termNN": "neural network",
        "lab.descent.termParameters": "parameters",

        // ----- What's happening? -----
        "lab.descent.step1": "The height is the error (the <strong>loss</strong>) of a model with just two numbers, x and y. Lower is better. Where {ball} is now, the loss is <strong>{loss}</strong>.",
        "lab.descent.step2": "The <strong>gradient</strong> here is <strong>{grad}</strong>, {length} long. It points uphill, the steepest way up, so the ball steps the other way.",
        "lab.descent.step3": "One step of plain gradient descent: new = old − learning rate × gradient = {old} − {rate} × {grad} = <strong>{next}</strong>.",
        "lab.descent.step4": "<strong>Momentum</strong> remembers its last steps, like a heavy ball rolling: steps the same way add up, and steps that flip back and forth cancel out. <strong>Adam</strong> also sizes its steps separately for each direction, so it moves about as fast along a flat direction as along a steep one.",
        "lab.descent.step5": "Real neural networks do exactly this, with millions or even billions of numbers instead of two. Their landscape has that many directions, so nobody can draw it, but every step is the same idea: a little way downhill.",

        // ----- Try this -----
        "lab.descent.ch1": "On “Bowl”, find a learning rate that makes plain gradient descent explode.",
        "lab.descent.ch1Why": "On the bowl, each step multiplies x and y by (1 − 2 × learning rate). Above 1, that number is below −1: every step jumps across the bottom and lands farther out than before (at exactly 1 the ball bounces between two points forever). A step that is too big doesn't just slow training down: it ruins it.",
        "lab.descent.ch2": "On “Long valley”, race plain descent and momentum with the same learning rate. Does momentum need at most half the steps?",
        "lab.descent.ch2Why": "The valley is 20 times steeper across than along. Plain descent must keep its steps small because of the steep walls (above 0.05 it zigzags from wall to wall, above 0.1 it flies out), so it crawls along the gentle floor. Momentum's speed builds up along the floor, step after step, like a ball rolling down a long slope.",
        "lab.descent.ch3": "On “Two valleys”, find a start from which plain descent ends up in the shallower valley. Drag the start on the map.",
        "lab.descent.ch3Why": "Gradient descent only feels the slope right under it. It rolls into the nearest dip and stays there, even when a deeper one is close by: a local minimum. Another start, noise or momentum can help, but nothing guarantees the deepest point.",
        "lab.descent.ch4": "On “Saddle”, start on the ridge and watch plain descent stop at the flat spot. Then switch on noisy gradients and watch it escape.",
        "lab.descent.ch4Why": "On the ridge the slope has no sideways part, so plain descent slides to the flat middle and stops there, although the ground goes down on both sides. A little noise pushes it off the ridge, and then it rolls down. Training on small random batches of data gives exactly this kind of noise, and it helps real networks get past flat spots."
    },
    ru: {
        // ----- The lab's catalogue -----
        "lab.descent.title": "Вниз с горы: градиентный спуск",
        "lab.descent.hook": "Устрой гонку трёх шариков вниз по склону ошибки и узнай, почему всё решает размер шага.",
        "lab.descent.idea": "Градиентный спуск: как учатся модели",

        // ----- Words used everywhere -----
        "lab.descent.ball": "Шарик {n}",
        "lab.descent.pair": "({x}; {y})",

        // ----- The landscapes -----
        "lab.descent.landscape": "Местность",
        "lab.descent.land.bowl": "Чаша",
        "lab.descent.land.valley": "Длинная долина",
        "lab.descent.land.banana": "Банан",
        "lab.descent.land.valleys": "Две долины",
        "lab.descent.land.saddle": "Седло",
        "lab.descent.land.bumpy": "Кочки",
        "lab.descent.about.bowl": "Ошибка модели равна x² + y²: круглая чаша, самая низкая точка в середине, в (0; 0).",
        "lab.descent.about.valley": "Ошибка равна ½(x² + 20y²): длинная узкая долина, поперёк она в 20 раз круче, чем вдоль.",
        "lab.descent.about.banana": "«Банан» Розенброка: изогнутая долина с очень пологим дном, самая низкая точка — (1; 1). Высоты тут от 0 до примерно 2500, поэтому цвета идут по логарифмической шкале.",
        "lab.descent.about.valleys": "Широкая чаша с двумя ямками: глубокой и помельче. Мелкая — ловушка, <em>локальный минимум</em>.",
        "lab.descent.about.saddle": "Вдоль y вниз, вдоль x вверх: это седло. Середина плоская, но это не ямка. Самые низкие точки — (0; ±√5).",
        "lab.descent.about.bumpy": "Чаша в мелких кочках: много маленьких ямок вокруг настоящей самой низкой точки (0; 0).",

        // ----- The controls -----
        "lab.descent.ridge": "Старт на гребне",
        "lab.descent.onRidge": "Теперь старт ровно на гребне, там, где y = 0.",
        "lab.descent.view": "Вид",
        "lab.descent.viewMap": "Карта",
        "lab.descent.view3d": "3D",
        "lab.descent.noisy": "Шумные градиенты",
        "lab.descent.noisyHint": "Добавляет к каждому наклону немного случайности, как при обучении на маленьких случайных пачках данных.",
        "lab.descent.balls": "Шарики",
        "lab.descent.optimizer": "Оптимизатор",
        "lab.descent.opt.gd": "Градиентный спуск",
        "lab.descent.opt.momentum": "Инерция",
        "lab.descent.opt.adam": "Adam",
        "lab.descent.gradLength": "Наклон",

        // ----- The map, the 3-D view and the chart -----
        "lab.descent.sceneMap": "Карта «{land}»: ошибка цветом, от низкой к высокой, и линии уровня",
        "lab.descent.scene3d": "Объёмный вид «{land}»: ошибка как высота поверхности",
        "lab.descent.describeMap": "Старт в точке {start}, там ошибка {height}, а наклон {slope}. Двигай старт по карте пальцем, мышью или стрелками; Enter запускает гонку.",
        "lab.descent.describe3d": "Поверхность повёрнута на {yaw}° и наклонена на {tilt}°: поворачивай её мышью, пальцем или стрелками. Старт в точке {start}, там ошибка {height}.",
        "lab.descent.describeBall": "{ball} ({opt}, скорость обучения {rate}) в точке {at}, ошибка {loss}.",
        "lab.descent.mark.start": "старт",
        "lab.descent.mark.arrow": "вниз по склону и крутизна",
        "lab.descent.mark.lowest": "самая низкая точка",
        "lab.descent.mark.dip": "другая ямка (локальный минимум)",
        "lab.descent.mark.saddle": "плоская точка (седло)",
        "lab.descent.low": "низко",
        "lab.descent.high": "высоко",
        "lab.descent.chartTitle": "Ошибка после каждого шага",
        "lab.descent.chart": "График ошибки каждого шарика после каждого шага",
        "lab.descent.lossLog": "Ошибка (лог. шкала)",

        // ----- A ball's state, on its card -----
        "lab.descent.state.waiting": "На старте.",
        "lab.descent.state.moving": "Катится вниз…",
        "lab.descent.state.loose": "Шум его раскачивает…",
        "lab.descent.state.arrived": "В самой низкой точке.",
        "lab.descent.state.jiggleLowest": "Устроился в самой низкой точке. Шум не даёт ему замереть, он дрожит около дна, поэтому его ошибка чуть больше 0.",
        "lab.descent.state.local": "Застрял в локальном минимуме: это ямка, но не самая глубокая.",
        "lab.descent.state.jiggleLocal": "Устроился в локальном минимуме, в ямке, которая не самая глубокая. Шум не даёт ему замереть.",
        "lab.descent.state.saddle": "Застрял в плоской точке (седле), а это не ямка.",
        "lab.descent.state.exploded": "Взорвался: шаги были слишком большими.",
        "lab.descent.state.limit": "Шаги кончились, а до дна он так и не добрался.",

        // ----- News when a ball stops (read out by screen readers) -----
        "lab.descent.arrived": "{ball} добрался до самой низкой точки за {n} шаг.|{ball} добрался до самой низкой точки за {n} шага.|{ball} добрался до самой низкой точки за {n} шагов.",
        "lab.descent.stuckLocal": "{ball} застрял в локальном минимуме после {n} шага.|{ball} застрял в локальном минимуме после {n} шагов.|{ball} застрял в локальном минимуме после {n} шагов.",
        "lab.descent.stuckSaddle": "{ball} остановился в плоской точке (седле) после {n} шага.|{ball} остановился в плоской точке (седле) после {n} шагов.|{ball} остановился в плоской точке (седле) после {n} шагов.",
        "lab.descent.exploded": "{ball} взорвался после {n} шага: шаги были слишком большими.|{ball} взорвался после {n} шагов: шаги были слишком большими.|{ball} взорвался после {n} шагов: шаги были слишком большими.",
        "lab.descent.limit": "{ball} сделал {n} шаг — это предел, а до дна он так и не докатился.|{ball} сделал {n} шага — это предел, а до дна он так и не докатился.|{ball} сделал {n} шагов — это предел, а до дна он так и не докатился.",

        // ----- Notes under the map -----
        "lab.descent.explodedNote": "{ball} улетел с карты: шаги были слишком большими. Каждый шаг перепрыгивал через дно и оказывался выше, чем раньше. Попробуй скорость обучения поменьше.",
        "lab.descent.noBalls": "Все шарики выключены. Включи хотя бы один, чтобы начать гонку.",
        "lab.descent.shaken": "Шум может вытряхнуть застрявший шарик. Нажми «Пуск», чтобы продолжить.",

        // ----- The idea in one sentence (with glossary links) -----
        "lab.descent.ideaLine": "Здесь у крошечной модели всего два числа, x и y, а высота местности — её {loss}. {training} — это поиск чисел, при которых ошибка меньше всего, и {gd} идёт к ним маленькими шагами вниз по склону. Настоящая {nn} делает то же самое с миллионами чисел — своими {parameters}.",
        "lab.descent.termLoss": "ошибка",
        "lab.descent.termTraining": "Обучение",
        "lab.descent.termGD": "градиентный спуск",
        "lab.descent.termNN": "нейросеть",
        "lab.descent.termParameters": "параметрами",

        // ----- What's happening? -----
        "lab.descent.step1": "Высота — это ошибка модели, у которой всего два числа: x и y. Чем ниже, тем лучше. Там, где сейчас {ball}, ошибка равна <strong>{loss}</strong>.",
        "lab.descent.step2": "<strong>Градиент</strong> здесь равен <strong>{grad}</strong>, его длина {length}. Он смотрит в гору, туда, где подъём круче всего, поэтому шарик шагает в обратную сторону.",
        "lab.descent.step3": "Один шаг обычного градиентного спуска: новое = старое − скорость обучения × градиент = {old} − {rate} × {grad} = <strong>{next}</strong>.",
        "lab.descent.step4": "<strong>Инерция</strong> помнит прошлые шаги, как тяжёлый катящийся шар (этот способ так и называют: метод тяжёлого шарика). Шаги в одну сторону складываются, а шаги туда-обратно гасят друг друга. <strong>Adam</strong> ещё и подбирает размер шага отдельно для каждого направления, поэтому по пологому направлению он идёт почти так же быстро, как по крутому.",
        "lab.descent.step5": "Настоящие нейросети делают ровно то же самое, только у них не два числа, а миллионы или даже миллиарды. У их «местности» столько же направлений, и нарисовать её невозможно, но каждый шаг устроен так же: чуть-чуть вниз по склону.",

        // ----- Try this -----
        "lab.descent.ch1": "На «Чаше» найди скорость обучения, при которой обычный градиентный спуск взрывается.",
        "lab.descent.ch1Why": "На чаше каждый шаг умножает x и y на (1 − 2 × скорость обучения). Если скорость больше 1, это число меньше −1: каждый шаг перепрыгивает через дно и улетает дальше, чем был (а ровно при 1 шарик вечно прыгает между двумя точками). Слишком большой шаг не просто замедляет обучение — он его ломает.",
        "lab.descent.ch2": "На «Длинной долине» устрой гонку обычного спуска и инерции с одинаковой скоростью обучения. Хватит ли инерции половины шагов?",
        "lab.descent.ch2Why": "Долина в 20 раз круче поперёк, чем вдоль. Обычному спуску приходится делать маленькие шаги из-за крутых стенок (больше 0,05 — и он мечется от стенки к стенке, больше 0,1 — вылетает), поэтому вдоль пологого дна он ползёт. А инерция набирает скорость вдоль дна шаг за шагом, как шар, который катится по длинному склону.",
        "lab.descent.ch3": "На «Двух долинах» найди старт, с которого обычный спуск скатывается в мелкую долину. Перетащи старт по карте.",
        "lab.descent.ch3Why": "Градиентный спуск чувствует только наклон прямо под собой. Он скатывается в ближайшую ямку и остаётся в ней, даже если рядом есть глубже: это локальный минимум. Другой старт, шум или инерция могут помочь, но найти самую глубокую точку не гарантирует ничто.",
        "lab.descent.ch4": "На «Седле» начни с гребня и посмотри, как обычный спуск застревает в плоской точке. Потом включи шумные градиенты и посмотри, как он вырывается.",
        "lab.descent.ch4Why": "На гребне у наклона нет поперечной части, поэтому обычный спуск съезжает в плоскую середину и останавливается, хотя по обе стороны земля уходит вниз. Немного шума сталкивает его с гребня, и он скатывается. Обучение на маленьких случайных пачках данных даёт как раз такой шум, и он помогает настоящим нейросетям проходить плоские места."
    }
});

// ----- The presets: a good race for each landscape -----
// start: where the balls start [x, y]; speed: "watch" (20 steps a second) or "fast" (500);
// balls: the three cards, { on, opt: "gd" | "momentum" | "adam", rate }. Each rate is a place
// on the learning-rate slider (10 places per power of ten: 0.01, 0.013, 0.016, 0.02, 0.025,
// 0.032, 0.04, 0.05, 0.063, 0.079, 0.1, ...). dev/tests/descent.math.js checks what each race shows.
window.AICompass.content.set("lab.descent", {
    presets: {
        // a calm ball, a bold ball that zigzags to the bottom; push one above 1 to see it explode
        bowl: {
            start: [1.6, 1.2],
            speed: "watch",
            balls: [
                { on: true, opt: "gd", rate: 0.1 },
                { on: true, opt: "gd", rate: 0.79 },
                { on: false, opt: "adam", rate: 0.1 }
            ]
        },
        // the same learning rate: momentum gets there in less than half the steps
        valley: {
            start: [-2.6, 0.9],
            speed: "watch",
            balls: [
                { on: true, opt: "gd", rate: 0.02 },
                { on: true, opt: "momentum", rate: 0.02 },
                { on: false, opt: "adam", rate: 0.05 }
            ]
        },
        // plain descent crawls along the flat floor and runs out of steps; the others get there
        banana: {
            start: [-1.5, 2.5],
            speed: "fast",
            balls: [
                { on: true, opt: "gd", rate: 0.001 },
                { on: true, opt: "momentum", rate: 0.001 },
                { on: true, opt: "adam", rate: 0.1 }
            ]
        },
        // both reach the deep dip, passing the shallow one; drag the start to the left to get trapped
        valleys: {
            start: [-1, 2.6],
            speed: "watch",
            balls: [
                { on: true, opt: "gd", rate: 0.2 },
                { on: true, opt: "momentum", rate: 0.05 },
                { on: false, opt: "adam", rate: 0.1 }
            ]
        },
        // just off the ridge: the balls slow down near the flat spot, then roll away from it
        saddle: {
            start: [-2.4, 0.3],
            speed: "watch",
            balls: [
                { on: true, opt: "gd", rate: 0.1 },
                { on: true, opt: "momentum", rate: 0.05 },
                { on: false, opt: "adam", rate: 0.05 }
            ]
        },
        // plain descent stops in the first little dip; the heavy ball rolls over the bumps
        bumpy: {
            start: [-2.6, -2.2],
            speed: "watch",
            balls: [
                { on: true, opt: "gd", rate: 0.1 },
                { on: true, opt: "momentum", rate: 0.05 },
                { on: false, opt: "adam", rate: 0.1 }
            ]
        }
    }
});
