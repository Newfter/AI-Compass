/* =========================================================
   AI COMPASS — TEXTS AND TRACKS: "EVOLUTION GARAGE" (js/lab/evolve.js)
   Keys: lab.evolve.*  The shared words (Play, Step, Speed...) are lab.kit.*
   in js/content/lab/kit.js. Plurals: "one|other" (English), "one|few|many" (Russian).

   THE TRACKS ("lab.evolve" content)
   tracks: [{ id, titleKey, noteKey, seed, width, points }]
     points  the centre line's control points, [x, y] in world units (the world is
             1000 × 640), in the driving direction; the start line is at the first one.
             The experiment smooths them into a closed curve (Catmull-Rom).
     width   the road's width, in world units
     seed    the random numbers of this track's cars: the same seed always gives the
             same evolution, so the track always tells the same story
   With the default settings (40 cars, mutation rate 10 %, size 0.3, no crossover)
   these seeds give the first full lap in generation 6 (Oval), 25 (Snake),
   46 (Hairpin) and 26 (Grand Prix). dev/tests/evolve.math.js checks them.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        "lab.evolve.title": "Evolution garage",
        "lab.evolve.hook": "Nobody teaches these cars to drive. Watch good driving evolve by itself, generation after generation.",
        "lab.evolve.idea": "Learning by evolution",

        // ----- The pictures (screen readers hear these) -----
        "lab.evolve.canvas": "The race track and the cars",
        "lab.evolve.brainCanvas": "The best car's brain: 6 inputs, 8 hidden neurons and 2 outputs",
        "lab.evolve.chart": "The best and the average fitness of each generation",
        "lab.evolve.describe": "Generation {gen} on {track}. {driving}. The best car so far drove {result}.",
        "lab.evolve.describeStart": "Generation {gen} on {track}. {driving}. No car has passed a gate yet.",
        "lab.evolve.describeChampion": "The champion drives alone on {track}. So far it drove {result}.",
        "lab.evolve.describeDraw": "Drawing mode: draw one closed loop on the field with the mouse or a finger.",
        "lab.evolve.drivingCount": "{n} of {total} cars still driving|{n} of {total} cars still driving",

        // ----- Results and times -----
        "lab.evolve.laps": "{n} lap|{n} laps",
        "lab.evolve.gates": "{n} gate|{n} gates",
        "lab.evolve.lapsAndGates": "{laps} and {gates}",
        "lab.evolve.seconds": "{s} s",

        // ----- On the track (canvas text) -----
        "lab.evolve.hud": "Generation {n} · {time}",
        "lab.evolve.hudOver": "Generation {n} is over",
        "lab.evolve.hudChampion": "The champion · {time}",
        "lab.evolve.drawHere": "Draw a closed loop here",

        // ----- Legends -----
        "lab.evolve.leader": "The leader and its 5 sensors",
        "lab.evolve.others": "The others: brighter = further",
        "lab.evolve.stopped": "Crashed or stopped",
        "lab.evolve.plus": "Weight above 0",
        "lab.evolve.minus": "Weight below 0",

        // ----- Controls -----
        "lab.evolve.stepTitle": "Watch: one tick. Fast and Turbo: one whole generation.",
        "lab.evolve.champion": "Watch the champion",
        "lab.evolve.back": "Back to evolution",
        "lab.evolve.startOver": "Start over",
        "lab.evolve.track": "Track",
        "lab.evolve.population": "Cars per generation",
        "lab.evolve.populationHint": "Changes from the next generation.",
        "lab.evolve.rate": "Mutation rate",
        "lab.evolve.rateHint": "How many of a child's 74 numbers change.",
        "lab.evolve.size": "Mutation size",
        "lab.evolve.sizeHint": "How big each change is.",
        "lab.evolve.crossover": "Mix two parents (crossover)",
        "lab.evolve.crossoverHint": "Each number of a child comes from one of two parents.",
        "lab.evolve.keep": "Keep the brains when I change the track",
        "lab.evolve.keepHint": "The cars try the new track with what they have learned.",

        // ----- Stats -----
        "lab.evolve.generation": "Generation",
        "lab.evolve.driving": "Still driving",
        "lab.evolve.bestFitness": "Best fitness",
        "lab.evolve.bestLap": "Best lap",
        "lab.evolve.fitness": "Fitness",
        "lab.evolve.best": "Best",
        "lab.evolve.average": "Average",

        // ----- The tracks -----
        "lab.evolve.oval": "Oval",
        "lab.evolve.ovalNote": "Wide and easy: the first full lap comes after a few generations.",
        "lab.evolve.snake": "Snake",
        "lab.evolve.snakeNote": "S-bends: the cars must learn to steer both ways.",
        "lab.evolve.hairpin": "Hairpin",
        "lab.evolve.hairpinNote": "A tight U-turn after a long straight. A fast car slides into the wall: the cars must learn to slow down first. Hard!",
        "lab.evolve.grandPrix": "Grand Prix",
        "lab.evolve.grandPrixNote": "A bit of everything: a chicane, a hairpin and long curves.",
        "lab.evolve.mine": "My track",
        "lab.evolve.mineNote": "The track you drew.",
        "lab.evolve.draw": "Draw a track…",

        // ----- Drawing a track -----
        "lab.evolve.drawHint": "Draw one closed loop on the field with your mouse or finger. The start line goes where you begin, and the cars drive the way you draw. (Drawing needs a mouse or a touch screen; everything else works with the keyboard too.)",
        "lab.evolve.cancel": "Cancel",
        "lab.evolve.drawTap": "That was only a tap. Press, draw all the way round, and let go near where you started.",
        "lab.evolve.drawShort": "That loop is too small for a race. Draw a bigger one.",
        "lab.evolve.drawOutside": "The road would leave the field. Keep your loop a little away from the edges.",
        "lab.evolve.drawTight": "The curves are too tight for the cars. Try wider curves.",
        "lab.evolve.drawCross": "The road runs into itself. Draw a loop that doesn't cross itself, with some room between its parts.",
        "lab.evolve.drawSaved": "Your track is saved as “My track”. Press Play!",

        // ----- The best brain -----
        "lab.evolve.brainTitle": "Look inside the best brain",
        "lab.evolve.speed": "speed",
        "lab.evolve.steer": "steer",
        "lab.evolve.gas": "gas",
        "lab.evolve.brainCaption": "74 numbers decide how this car drives: 64 weights (the lines; thicker means bigger) and 10 biases, one in each neuron that computes. A brighter circle holds a bigger value.",

        // ----- Messages (screen readers hear these) -----
        "lab.evolve.genDone": "Generation {n}: the best car drove {result}.",
        "lab.evolve.firstLap": "A car drove a full lap in generation {n}!",
        "lab.evolve.championDone": "The champion drove {result} in {time}.",
        "lab.evolve.trackChosen": "Track: {track}. Press Play to start.",
        "lab.evolve.newStart": "New random brains: generation 1.",

        // ----- "What's happening?" -----
        "lab.evolve.step1": "Every car has 5 sensors that measure how far the walls are. The leader sees <strong>{rays}</strong> (1 means no wall in range).",
        "lab.evolve.step2": "A tiny brain (a neural network with 74 numbers) turns the sensors into steering and gas. In generation 1 the numbers are random, so most cars crash or never get going.",
        "lab.evolve.step3": "We score each car by how far it got: the gates it passed in order, plus a bonus for finishing fast. This score is its <strong>fitness</strong>. The best so far: <strong>{best}</strong>.",
        "lab.evolve.step4": "The best cars become parents. Their children copy their numbers with small random changes (<strong>mutations</strong>: {rate} of the numbers change). The best 2 are copied unchanged, so the record is never lost.",
        "lab.evolve.step5": "Generation after generation, good driving <strong>evolves</strong>. Nobody wrote a rule like “brake before a turn”: the cars that happened to do it got further and had more children.",
        "lab.evolve.ideaLine": "Trying random changes and keeping the best is called a {gaLink}. Here it tunes the 74 {paramsLink} of a tiny {nnLink}: this is called neuroevolution.",
        "lab.evolve.gaTerm": "genetic algorithm",
        "lab.evolve.paramsTerm": "parameters",
        "lab.evolve.nnTerm": "neural network",
        "lab.evolve.real": "In the real world, evolution-style search designs things like antennas, the gaits of walking robots and game bots. Real self-driving cars are not trained like this: they mostly learn from huge amounts of recorded driving, and engineers test them very carefully.",
        "lab.evolve.transfer": "These brains learned on {from}. Here on {to}, the best car drove {result}. A brain that has only ever seen one track can learn that track instead of learning to drive, and then fail on a new one. This is called {overfitLink}. The usual cure is variety: train the cars on several different tracks.",
        "lab.evolve.overfitTerm": "overfitting",

        // ----- "Try this" -----
        "lab.evolve.ch1": "On “Oval”, evolve a car that finishes a full lap.",
        "lab.evolve.ch1Why": "Nobody told the car how to steer. Random changes plus “the cars that get furthest become parents” were enough.",
        "lab.evolve.ch2": "Set the mutation rate to 0 (with crossover off) and press Start over. Can evolution still improve the best car?",
        "lab.evolve.ch2Why": "Evolution is stuck: without mutations every child is an exact copy of a parent, so nothing new can appear. New numbers come only from mutations. (Crossover can mix old numbers into new brains for a while, but it never makes a new number.)",
        "lab.evolve.ch3": "Let the cars learn for a few generations, then set the mutation size to its maximum. Watch the average fitness.",
        "lab.evolve.ch3Why": "Changes that big break good brains: the children of good drivers crash. Only the 2 best, copied unchanged, keep the record.",
        "lab.evolve.ch4": "Train the cars until one finishes a lap. Then turn on “Keep the brains” and switch to another track. Do they still drive?",
        "lab.evolve.ch4Why": "A brain that learned one track by heart can get lost on a new one. This is called overfitting."
    },
    ru: {
        "lab.evolve.title": "Гараж эволюции",
        "lab.evolve.hook": "Никто не учит эти машинки водить. Смотри, как хорошее вождение появляется само, поколение за поколением.",
        "lab.evolve.idea": "Обучение эволюцией",

        // ----- Картинки (их слышат программы экранного доступа) -----
        "lab.evolve.canvas": "Гоночная трасса и машинки",
        "lab.evolve.brainCanvas": "Мозг лучшей машинки: 6 входов, 8 скрытых нейронов и 2 выхода",
        "lab.evolve.chart": "Лучшая и средняя приспособленность в каждом поколении",
        "lab.evolve.describe": "Поколение {gen}, трасса «{track}». {driving}. Лучшая машинка пока проехала {result}.",
        "lab.evolve.describeStart": "Поколение {gen}, трасса «{track}». {driving}. Пока ни одна машинка не проехала ни одной отметки.",
        "lab.evolve.describeChampion": "Чемпион едет один по трассе «{track}». Пока он проехал {result}.",
        "lab.evolve.describeDraw": "Режим рисования: нарисуй мышкой или пальцем одну замкнутую петлю на поле.",
        "lab.evolve.drivingCount": "{n} из {total} ещё едет|{n} из {total} ещё едут|{n} из {total} ещё едут",

        // ----- Результаты и время -----
        "lab.evolve.laps": "{n} круг|{n} круга|{n} кругов",
        "lab.evolve.gates": "{n} отметку|{n} отметки|{n} отметок",
        "lab.evolve.lapsAndGates": "{laps} и {gates}",
        "lab.evolve.seconds": "{s} с",

        // ----- На трассе (текст на картинке) -----
        "lab.evolve.hud": "Поколение {n} · {time}",
        "lab.evolve.hudOver": "Поколение {n} закончилось",
        "lab.evolve.hudChampion": "Чемпион · {time}",
        "lab.evolve.drawHere": "Нарисуй здесь замкнутую петлю",

        // ----- Легенды -----
        "lab.evolve.leader": "Лидер и его 5 датчиков",
        "lab.evolve.others": "Остальные: чем ярче, тем дальше",
        "lab.evolve.stopped": "Разбились или встали",
        "lab.evolve.plus": "Вес больше 0",
        "lab.evolve.minus": "Вес меньше 0",

        // ----- Управление -----
        "lab.evolve.stepTitle": "«Наглядно»: один шаг. «Быстро» и «Турбо»: целое поколение.",
        "lab.evolve.champion": "Смотреть чемпиона",
        "lab.evolve.back": "Назад к эволюции",
        "lab.evolve.startOver": "Начать заново",
        "lab.evolve.track": "Трасса",
        "lab.evolve.population": "Машинок в поколении",
        "lab.evolve.populationHint": "Изменится со следующего поколения.",
        "lab.evolve.rate": "Частота мутаций",
        "lab.evolve.rateHint": "Сколько из 74 чисел потомка меняется.",
        "lab.evolve.size": "Сила мутаций",
        "lab.evolve.sizeHint": "Насколько сильно меняется каждое число.",
        "lab.evolve.crossover": "Смешивать двух родителей (кроссовер)",
        "lab.evolve.crossoverHint": "Каждое число потомка берётся у одного из двух родителей.",
        "lab.evolve.keep": "Оставить мозги при смене трассы",
        "lab.evolve.keepHint": "Машинки поедут по новой трассе с тем, чему уже научились.",

        // ----- Показатели -----
        "lab.evolve.generation": "Поколение",
        "lab.evolve.driving": "Ещё едут",
        "lab.evolve.bestFitness": "Рекорд",
        "lab.evolve.bestLap": "Лучший круг",
        "lab.evolve.fitness": "Приспособленность",
        "lab.evolve.best": "Лучшая",
        "lab.evolve.average": "Средняя",

        // ----- Трассы -----
        "lab.evolve.oval": "Овал",
        "lab.evolve.ovalNote": "Широкая и простая: первый полный круг получится уже через несколько поколений.",
        "lab.evolve.snake": "Змейка",
        "lab.evolve.snakeNote": "Сплошные S-образные повороты: машинкам нужно научиться рулить в обе стороны.",
        "lab.evolve.hairpin": "Шпилька",
        "lab.evolve.hairpinNote": "Крутой разворот в конце длинной прямой. На большой скорости машинку занесёт в стену: придётся научиться сначала тормозить. Сложно!",
        "lab.evolve.grandPrix": "Гран-при",
        "lab.evolve.grandPrixNote": "Всего понемногу: шикана, шпилька и длинные повороты.",
        "lab.evolve.mine": "Моя трасса",
        "lab.evolve.mineNote": "Твоя собственная трасса.",
        "lab.evolve.draw": "Нарисовать трассу…",

        // ----- Рисуем трассу -----
        "lab.evolve.drawHint": "Нарисуй мышкой или пальцем одну замкнутую петлю на поле. Старт будет там, где ты начнёшь, а поедут машинки туда, куда ты рисуешь. (Рисовать можно только мышкой или пальцем, а всё остальное работает и с клавиатуры.)",
        "lab.evolve.cancel": "Отмена",
        "lab.evolve.drawTap": "Это было просто касание. Нажми и, не отпуская, обведи петлю до самого начала.",
        "lab.evolve.drawShort": "Эта петля слишком маленькая для гонки. Нарисуй побольше.",
        "lab.evolve.drawOutside": "Дорога вылезает за край поля. Рисуй чуть дальше от краёв.",
        "lab.evolve.drawTight": "Повороты слишком крутые для машинок. Попробуй плавнее.",
        "lab.evolve.drawCross": "Дорога наезжает сама на себя. Нарисуй петлю без пересечений и с запасом места между её частями.",
        "lab.evolve.drawSaved": "Трасса сохранена как «Моя трасса». Жми «Пуск»!",

        // ----- Мозг лучшей машинки -----
        "lab.evolve.brainTitle": "Заглянуть в мозг лучшей машинки",
        "lab.evolve.speed": "скорость",
        "lab.evolve.steer": "руль",
        "lab.evolve.gas": "газ",
        "lab.evolve.brainCaption": "74 числа решают, как едет эта машинка: 64 веса (линии; чем толще, тем больше вес) и 10 смещений, по одному в каждом нейроне, который считает. Чем ярче кружок, тем больше в нём число.",

        // ----- Сообщения (их слышат программы экранного доступа) -----
        "lab.evolve.genDone": "Поколение {n}: лучшая машинка проехала {result}.",
        "lab.evolve.firstLap": "В поколении {n} машинка проехала полный круг!",
        "lab.evolve.championDone": "Чемпион проехал {result} за {time}.",
        "lab.evolve.trackChosen": "Трасса «{track}». Нажми «Пуск», чтобы начать.",
        "lab.evolve.newStart": "Новые случайные мозги: поколение 1.",

        // ----- «Что происходит?» -----
        "lab.evolve.step1": "У каждой машинки 5 датчиков: они измеряют, далеко ли стены. Лидер сейчас видит <strong>{rays}</strong> (1 значит, что стены рядом нет).",
        "lab.evolve.step2": "Крошечный мозг (нейросеть из 74 чисел) превращает показания датчиков в руль и газ. В первом поколении все числа случайные, поэтому почти все машинки разбиваются или даже не трогаются с места.",
        "lab.evolve.step3": "Каждую машинку мы оцениваем по тому, как далеко она уехала: сколько отметок проехала по порядку, плюс бонус за быстрый финиш. Эта оценка называется <strong>приспособленностью</strong>. Лучшая пока: <strong>{best}</strong>.",
        "lab.evolve.step4": "Лучшие машинки становятся родителями. Их потомки копируют их числа с небольшими случайными изменениями (<strong>мутациями</strong>: меняется {rate} чисел). Двух лучших копируем без изменений, поэтому рекорд не теряется.",
        "lab.evolve.step5": "Поколение за поколением хорошее вождение <strong>эволюционирует</strong>. Никто не писал правило «тормози перед поворотом»: просто машинки, которые случайно так делали, уезжали дальше, и у них было больше потомков.",
        "lab.evolve.ideaLine": "Искать решение случайными изменениями, оставляя лучших, — это {gaLink}. Здесь он подбирает 74 {paramsLink} крошечной {nnLink}: это называется нейроэволюцией.",
        "lab.evolve.gaTerm": "генетический алгоритм",
        "lab.evolve.paramsTerm": "параметра",
        "lab.evolve.nnTerm": "нейросети",
        "lab.evolve.real": "В реальном мире поиском в духе эволюции придумывают антенны, походку шагающих роботов и ботов для игр. Но настоящие беспилотные автомобили так не обучают: в основном они учатся на огромном количестве записанных поездок, а инженеры очень тщательно их проверяют.",
        "lab.evolve.transfer": "Эти мозги учились на трассе «{from}». Здесь, на трассе «{to}», лучшая машинка проехала {result}. Мозг, который видел только одну трассу, может выучить именно её, а не научиться водить, и тогда на новой трассе он теряется. Это называется {overfitLink}. Обычное лекарство — разнообразие: тренируй машинки на нескольких разных трассах.",
        "lab.evolve.overfitTerm": "переобучением",

        // ----- «Попробуй» -----
        "lab.evolve.ch1": "На «Овале» выведи машинку, которая проедет полный круг.",
        "lab.evolve.ch1Why": "Никто не объяснял машинке, как рулить. Хватило случайных изменений и правила «родителями становятся те, кто уехал дальше всех».",
        "lab.evolve.ch2": "Поставь частоту мутаций на 0 (кроссовер выключен) и нажми «Начать заново». Сможет ли эволюция улучшить лучшую машинку?",
        "lab.evolve.ch2Why": "Эволюция застряла: без мутаций каждый потомок — точная копия родителя, и новому взяться неоткуда. Новые числа появляются только из мутаций. (Кроссовер может какое-то время смешивать старые числа в новые мозги, но нового числа он не создаёт.)",
        "lab.evolve.ch3": "Дай машинкам поучиться несколько поколений, потом поставь силу мутаций на максимум. Следи за средней приспособленностью.",
        "lab.evolve.ch3Why": "Такие сильные изменения ломают хорошие мозги: потомки хороших водителей разбиваются. Рекорд держится только благодаря двум лучшим, которых копируют без изменений.",
        "lab.evolve.ch4": "Тренируй машинки, пока одна не проедет круг. Потом включи «Оставить мозги» и выбери другую трассу. Поедут ли они?",
        "lab.evolve.ch4Why": "Мозг, который выучил одну трассу наизусть, может растеряться на новой. Это называется переобучением."
    }
});

window.AICompass.content.set("lab.evolve", {
    tracks: [
        {
            id: "oval",
            titleKey: "lab.evolve.oval",
            noteKey: "lab.evolve.ovalNote",
            seed: 14,
            width: 120,
            points: [
                [500, 510], [550, 510], [600, 510], [650, 510], [700, 510], [750, 503], [797, 483], [837, 452], [867, 411], [885, 363],
                [890, 313], [881, 262], [859, 216], [826, 178], [784, 150], [736, 133], [685, 130], [635, 130], [585, 130], [535, 130],
                [485, 130], [435, 130], [385, 130], [335, 130], [284, 131], [234, 142], [189, 165], [152, 200], [126, 244], [112, 293],
                [111, 343], [124, 393], [150, 437], [186, 472], [231, 497], [280, 509], [331, 510], [381, 510], [431, 510]
            ]
        },
        {
            id: "snake",
            titleKey: "lab.evolve.snake",
            noteKey: "lab.evolve.snakeNote",
            seed: 5,
            width: 95,
            points: [
                [330, 560], [380, 560], [430, 560], [480, 560], [530, 560], [580, 560], [630, 560], [680, 560], [730, 560], [779, 548],
                [818, 516], [838, 470], [840, 419], [838, 368], [817, 322], [777, 291], [728, 280], [680, 265], [648, 227], [632, 178],
                [597, 143], [549, 131], [502, 147], [471, 185], [455, 232], [421, 268], [373, 280], [326, 265], [294, 228], [278, 179],
                [243, 143], [194, 131], [146, 145], [108, 178], [89, 225], [88, 276], [88, 326], [88, 376], [88, 426], [91, 477],
                [115, 522], [155, 552], [205, 560], [255, 560]
            ]
        },
        {
            id: "hairpin",
            titleKey: "lab.evolve.hairpin",
            noteKey: "lab.evolve.hairpinNote",
            seed: 17,
            width: 90,
            points: [
                [600, 400], [650, 400], [700, 400], [750, 400], [800, 400], [849, 394], [887, 363], [900, 315], [882, 270], [841, 243],
                [791, 240], [741, 240], [691, 240], [641, 240], [591, 240], [540, 238], [495, 216], [464, 176], [427, 141], [381, 120],
                [331, 116], [282, 128], [240, 157], [210, 198], [195, 246], [193, 297], [193, 347], [195, 398], [211, 446], [243, 486],
                [285, 513], [335, 525], [385, 519], [431, 497], [466, 461], [498, 422], [544, 401]
            ]
        },
        {
            id: "grandPrix",
            titleKey: "lab.evolve.grandPrix",
            noteKey: "lab.evolve.grandPrixNote",
            seed: 8,
            width: 95,
            points: [
                [330, 575], [380, 575], [430, 575], [480, 575], [530, 575], [580, 575], [630, 575], [680, 575], [730, 575], [780, 573],
                [824, 550], [851, 509], [855, 459], [845, 410], [824, 364], [829, 314], [852, 268], [854, 218], [834, 172], [795, 142],
                [746, 134], [696, 134], [646, 136], [602, 159], [578, 202], [575, 252], [575, 302], [573, 351], [553, 396], [513, 426],
                [464, 433], [418, 415], [385, 378], [375, 330], [375, 280], [375, 230], [364, 181], [330, 146], [282, 134], [232, 143],
                [192, 174], [172, 220], [170, 271], [170, 321], [170, 371], [170, 421], [170, 472], [183, 520], [217, 557], [265, 574]
            ]
        }
    ]
});
