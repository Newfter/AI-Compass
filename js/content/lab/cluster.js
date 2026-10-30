/* =========================================================
   AI COMPASS — TEXTS AND DATA: "FINDING GROUPS" (k-means, js/lab/cluster.js)
   Keys: lab.cluster.*  The shared words (Play, Step, Reset...) are lab.kit.*
   in js/content/lab/kit.js. Plurals: "one|other" (English), "one|few|many"
   (Russian). The presets (the examples) are at the end, as generator settings.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- In the lab's list of experiments -----
        "lab.cluster.title": "Finding groups",
        "lab.cluster.hook": "Nobody tells the computer the answers. Watch k-means find the groups in a cloud of points by itself.",
        "lab.cluster.idea": "Unsupervised learning: finding groups",

        // ----- The examples -----
        "lab.cluster.preset.three": "Three clear groups",
        "lab.cluster.preset.five": "Five groups",
        "lab.cluster.preset.sizes": "Different sizes",
        "lab.cluster.preset.stretched": "Stretched",
        "lab.cluster.preset.moons": "Two moons",
        "lab.cluster.preset.shop": "Shop customers",
        "lab.cluster.about.three": "Three groups that your eyes find at once. The computer has no eyes, only the numbers of the points. Can it find them?",
        "lab.cluster.about.five": "Five groups, but k starts at 3. How many centres does this data really need? The elbow chart can tell you.",
        "lab.cluster.about.sizes": "One big, loose group and two small, tight ones. Watch the borders between them.",
        "lab.cluster.about.stretched": "Three long, thin groups side by side. k-means looks for round groups: what will it do with these?",
        "lab.cluster.about.moons": "Two crescents that hook into each other. You see two groups at once. Will k-means?",
        "lab.cluster.about.shop": "Each point is a customer of a shop: how often they come and how much they spend in a month. Find the groups, then give them names.",
        "lab.cluster.about.own": "Your own points. Click or tap the board to add more.",
        "lab.cluster.about.edited": "“{preset}”, plus {points} of your own.",

        // ----- What a finished run shows (under the board) -----
        "lab.cluster.lesson.three": "k-means found all three groups. But you chose k\u00a0=\u00a03: the computer can't tell by itself how many groups to look for.",
        "lab.cluster.lesson.bad": "A bad result: one centre took two groups, so the centres don't match the groups you see. The run got stuck because of where it started, and a new start can fix it.",
        "lab.cluster.lesson.five": "Five centres for five groups. The elbow chart pointed the way.",
        "lab.cluster.lesson.sizes": "Look at the borders: the big, loose group lost its outer points to the small groups. k-means draws every border halfway between two centres, so it works best with groups of about the same size and spread.",
        "lab.cluster.lesson.stretched": "k-means measures the straight distance to a centre, so it looks for round groups, and it usually cuts long groups like these across. Cut that way, the pieces even have a lower inertia than the real groups!",
        "lab.cluster.lesson.moons": "k-means split the moons with a straight border, so each group got pieces of both. It expects round groups. Other methods, such as DBSCAN, follow the shapes.",
        "lab.cluster.lesson.shop": "The computer found the groups, but who are these customers? Give the groups names under the board: people decide what the groups mean.",
        "lab.cluster.lesson.otherK": "k-means always looks for exactly k groups, here {k}, even if the data has more or fewer. The elbow chart helps you choose k.",

        // ----- The board -----
        "lab.cluster.canvas": "The board: points, and the centres that k-means places",
        "lab.cluster.boardRole": "board",
        "lab.cluster.boardHelp": "Click or tap the board to add a point. With the keyboard: the arrow keys move a cursor (Shift jumps), Enter adds a point.",
        "lab.cluster.emptyBoard": "Click or tap to add points",
        "lab.cluster.undo": "Undo",
        "lab.cluster.clear": "Clear",
        "lab.cluster.legendPoint": "Point",
        "lab.cluster.legendCentre": "Centre",
        "lab.cluster.empty": "The board is empty. Click or tap it to add points, or pick an example.",
        "lab.cluster.tooFew": "k-means needs at least as many points as centres. Add points, or make k smaller than {k}.",
        "lab.cluster.full": "That's the limit: {max} points. Undo or Clear makes room.",
        "lab.cluster.phaseReady": "No centres yet",
        "lab.cluster.phaseStart": "The centres are placed",
        "lab.cluster.phaseAssign": "Iteration {n} · points join the nearest centre",
        "lab.cluster.phaseUpdate": "Iteration {n} · centres move to the middle",
        "lab.cluster.phaseDone": "Done: nothing changes any more",

        // ----- Shop customers: the axes and the names -----
        "lab.cluster.money": "${n}",
        "lab.cluster.visitsAxis": "Visits per month →",
        "lab.cluster.moneyAxis": "Money spent per month →",
        "lab.cluster.namesTitle": "Name the groups",
        "lab.cluster.namesHelp": "The computer found the groups, but it doesn't know what they mean. Who are these customers? Give each group a name.",
        "lab.cluster.groupName": "Group {n}",
        "lab.cluster.groupDetails": "{customers}: about {place}",
        "lab.cluster.namePlaceholder": "Type a name",

        // ----- Buttons and settings -----
        "lab.cluster.newStart": "New start",
        "lab.cluster.k": "k: how many groups",
        "lab.cluster.kHint": "You choose k, not the computer.",
        "lab.cluster.start": "Starting centres",
        "lab.cluster.startRandom": "Random points",
        "lab.cluster.startPlus": "k-means++",
        "lab.cluster.startHint": "k-means++ spreads the first centres out: the farther a point is from the centres so far, the likelier it is to be the next one.",
        "lab.cluster.regions": "Show regions",
        "lab.cluster.regionsHint": "Each coloured area holds the spots nearest to one centre.",
        "lab.cluster.distances": "Show distances",
        "lab.cluster.distancesHint": "A line from each point to its centre. Inertia adds up their lengths, squared.",

        // ----- Live numbers and the elbow chart -----
        "lab.cluster.iteration": "Iteration",
        "lab.cluster.inertia": "Inertia",
        "lab.cluster.changed": "Changed group",
        "lab.cluster.elbowTitle": "The elbow chart",
        "lab.cluster.chart": "Inertia for each k from 1 to 8, the best of 5 runs each",
        "lab.cluster.bestOf": "Best of 5 runs",
        "lab.cluster.thisRun": "This run",
        "lab.cluster.kAxis": "k",
        "lab.cluster.chartEmpty": "No points yet",
        "lab.cluster.elbowHint": "More centres mean less inertia, so the lowest point isn't the answer. Look for the elbow: the k where the line stops falling steeply. After it, extra centres only cut real groups in two.",

        // ----- "What's happening?" -----
        "lab.cluster.step1": "Nobody told the computer the answers. It only sees {points}.",
        "lab.cluster.step2": "It places {centres}: its first guesses.",
        "lab.cluster.step3": "Every point joins its nearest centre. Points that changed group: <strong>{changed}</strong>.",
        "lab.cluster.step4": "Each centre moves to the middle of its group. Inertia (how spread out the groups are): <strong>{inertia}</strong>.",
        "lab.cluster.step5": "Repeat until nothing changes. Then people decide what the groups mean.",
        "lab.cluster.doneNote": "Finished: in iteration {n} no point changed group, so the centres won't move again.",
        "lab.cluster.realWorld": "Shops group their customers this way, music apps group songs for their {recommendation}, and scientists group stars and genes. Finding groups in {data} without being given any answers is one kind of {unsupervised}.",
        "lab.cluster.termRecommendation": "recommendations",
        "lab.cluster.termData": "data",
        "lab.cluster.termUnsupervised": "unsupervised learning",

        // ----- "Try this" -----
        "lab.cluster.ch1": "Use the elbow chart to find the right k for “Five groups”, then run k-means to the end.",
        "lab.cluster.ch1Why": "Up to k\u00a0=\u00a05, every extra centre takes a big bite out of the inertia; after 5 the line is almost flat, because extra centres only split real groups. That bend is the elbow. Real data rarely has one this clear, so people also look at the groups themselves.",
        "lab.cluster.ch2": "On “Three clear groups” with k\u00a0=\u00a03, pick “Random points” and press “New start” until you get a bad result: two centres in one group, and one centre for two groups.",
        "lab.cluster.ch2Why": "k-means only improves its start, step by step, so a bad start can end in a bad answer. k-means++ starts with the centres far apart, which makes this rare. Real programs also run k-means several times and keep the result with the lowest inertia.",
        "lab.cluster.ch3": "Try to separate “Two moons” with k\u00a0=\u00a02.",
        "lab.cluster.ch3Why": "It can't be done: every point joins its nearest centre, so the border between two groups is always a straight line, and no straight line separates these moons. k-means expects round groups. Other methods, such as DBSCAN, follow the shapes: they chain together points that sit close to each other.",
        "lab.cluster.ch4": "Find the groups of “Shop customers” and give every group a name.",
        "lab.cluster.ch4Why": "The computer found the groups from the numbers alone; their meaning came from you. Shops do the same: people look at the groups and decide, for example, which offer suits which customers.",

        // ----- Screen readers: messages and the board in words -----
        "lab.cluster.saidStart": "{centres} placed.",
        "lab.cluster.saidAssign": "Every point joined its nearest centre. Points that changed group: {changed}.",
        "lab.cluster.saidUpdate": "The centres moved to the middle of their groups. Inertia: {inertia}.",
        "lab.cluster.saidDone": "Finished in iteration {n}: no point changed group. Inertia: {inertia}.",
        "lab.cluster.saidCleared": "The board is empty.",
        "lab.cluster.saidUndone": "Undone. {points} on the board.",
        "lab.cluster.saidCursor": "Cursor: {place}.",
        "lab.cluster.saidAdded": "Point added: {place}. {points} on the board.",
        "lab.cluster.place": "{x} across, {y} up",
        "lab.cluster.shopPlace": "{visits} and {money} a month",
        "lab.cluster.describeEmpty": "The board is empty. Click or tap it to add points.",
        "lab.cluster.describeNoGroups": "{points} on the board, with no groups yet.",
        "lab.cluster.describeGroups": "{points} {groups}.",
        "lab.cluster.describeGroup": "Group {n}{name}: {points}, centre at {place}.",
        "lab.cluster.quoted": "“{name}”",

        // ----- Counted words -----
        "lab.cluster.nPoints": "{n}\u00a0point|{n}\u00a0points",
        "lab.cluster.nPointsSees": "{n}\u00a0point|{n}\u00a0points",
        "lab.cluster.nCentres": "{n}\u00a0centre|{n}\u00a0centres",
        "lab.cluster.nCustomers": "{n}\u00a0customer|{n}\u00a0customers",
        "lab.cluster.nVisits": "{n}\u00a0visit|{n}\u00a0visits",
        "lab.cluster.inGroups": "in {n}\u00a0group|in {n}\u00a0groups"
    },
    ru: {
        // ----- В списке экспериментов лаборатории -----
        "lab.cluster.title": "Поиск групп",
        "lab.cluster.hook": "Компьютеру никто не подсказывает ответы. Посмотри, как k-means сам находит группы в облаке точек.",
        "lab.cluster.idea": "Обучение без учителя: поиск групп",

        // ----- Примеры -----
        "lab.cluster.preset.three": "Три чёткие группы",
        "lab.cluster.preset.five": "Пять групп",
        "lab.cluster.preset.sizes": "Разные размеры",
        "lab.cluster.preset.stretched": "Вытянутые",
        "lab.cluster.preset.moons": "Два полумесяца",
        "lab.cluster.preset.shop": "Покупатели",
        "lab.cluster.about.three": "Три группы, которые глаза находят сразу. А у компьютера глаз нет, только числа — координаты точек. Найдёт ли он их?",
        "lab.cluster.about.five": "Пять групп, а k для начала равно 3. Сколько центров на самом деле нужно этим данным? Подскажет график «локтя».",
        "lab.cluster.about.sizes": "Одна большая рыхлая группа и две маленькие плотные. Следи за границами между ними.",
        "lab.cluster.about.stretched": "Три длинные узкие группы рядом друг с другом. k-means ищет круглые группы: что он сделает с такими?",
        "lab.cluster.about.moons": "Два полумесяца, зацепившиеся друг за друга. Ты сразу видишь две группы. А k-means?",
        "lab.cluster.about.shop": "Каждая точка — покупатель магазина: как часто он приходит и сколько тратит за месяц. Найди группы, а потом дай им названия.",
        "lab.cluster.about.own": "Твои собственные точки. Нажимай на поле, чтобы добавить ещё.",
        "lab.cluster.about.edited": "«{preset}» и ещё {points} от тебя.",

        // ----- Что показывает законченный запуск (под полем) -----
        "lab.cluster.lesson.three": "k-means нашёл все три группы. Но k\u00a0=\u00a03 выбрал ты: сам компьютер не знает, сколько групп искать.",
        "lab.cluster.lesson.bad": "Неудачный результат: один центр захватил сразу две группы, и центры не совпадают с группами, которые видишь ты. Запуск застрял из-за того, откуда он начался, и новый старт может это исправить.",
        "lab.cluster.lesson.five": "Пять центров для пяти групп. График «локтя» подсказал верно.",
        "lab.cluster.lesson.sizes": "Посмотри на границы: большая рыхлая группа отдала свои крайние точки маленьким. k-means проводит каждую границу посередине между двумя центрами, поэтому лучше всего справляется с группами примерно одного размера и разброса.",
        "lab.cluster.lesson.stretched": "k-means измеряет расстояние до центра по прямой и поэтому ищет круглые группы, а такие длинные группы обычно разрезает поперёк. И у таких кусков инерция даже меньше, чем у настоящих групп!",
        "lab.cluster.lesson.moons": "k-means разделил полумесяцы прямой границей, и каждой группе достались куски обоих. Он ожидает круглые группы. Другие методы, например DBSCAN, следуют за формой.",
        "lab.cluster.lesson.shop": "Компьютер нашёл группы, но кто эти покупатели? Дай группам названия под полем: что значат группы, решают люди.",
        "lab.cluster.lesson.otherK": "k-means всегда ищет ровно k групп, здесь {k}, даже если в данных их больше или меньше. Выбрать k помогает график «локтя».",

        // ----- Поле -----
        "lab.cluster.canvas": "Поле: точки и центры, которые ставит k-means",
        "lab.cluster.boardRole": "поле",
        "lab.cluster.boardHelp": "Нажми на поле, чтобы добавить точку. С клавиатуры: стрелки двигают курсор (с Shift — прыжками), Enter добавляет точку.",
        "lab.cluster.emptyBoard": "Нажми, чтобы добавить точки",
        "lab.cluster.undo": "Отменить",
        "lab.cluster.clear": "Очистить",
        "lab.cluster.legendPoint": "Точка",
        "lab.cluster.legendCentre": "Центр",
        "lab.cluster.empty": "Поле пустое. Нажми на него, чтобы добавить точки, или выбери пример.",
        "lab.cluster.tooFew": "Точек должно быть не меньше, чем центров. Добавь точки или сделай k меньше {k}.",
        "lab.cluster.full": "Это предел: {max} точек. Освободить место можно кнопками «Отменить» и «Очистить».",
        "lab.cluster.phaseReady": "Центров пока нет",
        "lab.cluster.phaseStart": "Центры расставлены",
        "lab.cluster.phaseAssign": "Итерация {n} · точки выбирают ближайший центр",
        "lab.cluster.phaseUpdate": "Итерация {n} · центры переезжают в середину",
        "lab.cluster.phaseDone": "Готово: больше ничего не меняется",

        // ----- Покупатели: оси и названия групп -----
        "lab.cluster.money": "{n}\u00a0$",
        "lab.cluster.visitsAxis": "Визиты в месяц →",
        "lab.cluster.moneyAxis": "Траты в месяц →",
        "lab.cluster.namesTitle": "Назови группы",
        "lab.cluster.namesHelp": "Компьютер нашёл группы, но не знает, что они значат. Кто эти покупатели? Дай каждой группе название.",
        "lab.cluster.groupName": "Группа {n}",
        "lab.cluster.groupDetails": "{customers}: примерно {place}",
        "lab.cluster.namePlaceholder": "Введи название",

        // ----- Кнопки и настройки -----
        "lab.cluster.newStart": "Новый старт",
        "lab.cluster.k": "k — сколько групп искать",
        "lab.cluster.kHint": "k выбираешь ты, а не компьютер.",
        "lab.cluster.start": "Первые центры",
        "lab.cluster.startRandom": "Случайные точки",
        "lab.cluster.startPlus": "k-means++",
        "lab.cluster.startHint": "k-means++ расставляет первые центры подальше друг от друга: чем дальше точка от уже выбранных центров, тем вероятнее, что следующим центром станет она.",
        "lab.cluster.regions": "Показать области",
        "lab.cluster.regionsHint": "В каждой цветной области — места, которые ближе всего к одному центру.",
        "lab.cluster.distances": "Показать расстояния",
        "lab.cluster.distancesHint": "Линия от каждой точки к её центру. Инерция — это сумма квадратов их длин.",

        // ----- Показатели и график «локтя» -----
        "lab.cluster.iteration": "Итерация",
        "lab.cluster.inertia": "Инерция",
        "lab.cluster.changed": "Сменили группу",
        "lab.cluster.elbowTitle": "График «локтя»",
        "lab.cluster.chart": "Инерция для каждого k от 1 до 8, лучшая из 5 попыток",
        "lab.cluster.bestOf": "Лучшая из 5 попыток",
        "lab.cluster.thisRun": "Этот запуск",
        "lab.cluster.kAxis": "k",
        "lab.cluster.chartEmpty": "Точек пока нет",
        "lab.cluster.elbowHint": "Чем больше центров, тем меньше инерция, так что самая низкая точка — не ответ. Ищи «локоть»: то k, после которого линия перестаёт круто падать. Дальше лишние центры только разрезают настоящие группы надвое.",

        // ----- «Что здесь происходит?» -----
        "lab.cluster.step1": "Ответов компьютеру никто не подсказывал. Он видит только {points}.",
        "lab.cluster.step2": "Он ставит {centres}: это его первые догадки.",
        "lab.cluster.step3": "Каждая точка присоединяется к ближайшему центру. Сменили группу: <strong>{changed}</strong>.",
        "lab.cluster.step4": "Каждый центр переезжает в середину своей группы. Инерция (насколько разбросаны группы): <strong>{inertia}</strong>.",
        "lab.cluster.step5": "Всё повторяется, пока ничего не перестанет меняться. А что значат группы, решают уже люди.",
        "lab.cluster.doneNote": "Готово: на итерации {n} ни одна точка не сменила группу, так что центры больше не сдвинутся.",
        "lab.cluster.realWorld": "Так магазины делят покупателей на группы, музыкальные сервисы группируют песни для {recommendation}, а учёные — звёзды и гены. Поиск групп в {data} без готовых ответов — один из видов {unsupervised}.",
        "lab.cluster.termRecommendation": "рекомендаций",
        "lab.cluster.termData": "данных",
        "lab.cluster.termUnsupervised": "обучения без учителя",

        // ----- «Попробуй» -----
        "lab.cluster.ch1": "Найди с помощью графика «локтя» правильное k для примера «Пять групп» и доведи k-means до конца.",
        "lab.cluster.ch1Why": "До k\u00a0=\u00a05 каждый новый центр сильно уменьшает инерцию, а после 5 линия почти не падает: лишние центры только делят настоящие группы. Этот изгиб и есть «локоть». В настоящих данных он редко бывает таким чётким, поэтому люди смотрят ещё и на сами группы.",
        "lab.cluster.ch2": "В примере «Три чёткие группы» при k\u00a0=\u00a03 выбери «Случайные точки» и жми «Новый старт», пока не получится неудачный результат: два центра в одной группе и один центр на две группы.",
        "lab.cluster.ch2Why": "k-means только улучшает свой старт шаг за шагом, поэтому плохое начало может закончиться плохим ответом. k-means++ ставит первые центры далеко друг от друга, и так случается редко. А настоящие программы запускают k-means несколько раз и оставляют результат с самой маленькой инерцией.",
        "lab.cluster.ch3": "Попробуй разделить «Два полумесяца» при k\u00a0=\u00a02.",
        "lab.cluster.ch3Why": "Ничего не выйдет: каждая точка выбирает ближайший центр, поэтому граница между двумя группами всегда прямая, а эти полумесяцы прямой линией не разделить. k-means ожидает круглые группы. Другие методы, например DBSCAN, следуют за формой: они связывают в цепочку точки, которые лежат близко друг к другу.",
        "lab.cluster.ch4": "Найди группы в примере «Покупатели» и дай название каждой группе.",
        "lab.cluster.ch4Why": "Компьютер нашёл группы только по числам, а смысл им дал ты. В магазинах так и делают: люди смотрят на группы и решают, например, какое предложение подойдёт каким покупателям.",

        // ----- Программа чтения с экрана: сообщения и поле словами -----
        "lab.cluster.saidStart": "На поле {centres}.",
        "lab.cluster.saidAssign": "Каждая точка присоединилась к ближайшему центру. Сменили группу: {changed}.",
        "lab.cluster.saidUpdate": "Центры переехали в середину своих групп. Инерция: {inertia}.",
        "lab.cluster.saidDone": "Готово на итерации {n}: ни одна точка не сменила группу. Инерция: {inertia}.",
        "lab.cluster.saidCleared": "Поле пустое.",
        "lab.cluster.saidUndone": "Отменено. На поле {points}.",
        "lab.cluster.saidCursor": "Курсор: {place}.",
        "lab.cluster.saidAdded": "Точка добавлена: {place}. На поле {points}.",
        "lab.cluster.place": "{x} слева направо, {y} снизу вверх",
        "lab.cluster.shopPlace": "{visits} и {money} в месяц",
        "lab.cluster.describeEmpty": "Поле пустое. Нажми на него, чтобы добавить точки.",
        "lab.cluster.describeNoGroups": "На поле {points}, групп пока нет.",
        "lab.cluster.describeGroups": "{points} {groups}.",
        "lab.cluster.describeGroup": "Группа {n}{name}: {points}, центр: {place}.",
        "lab.cluster.quoted": "«{name}»",

        // ----- Слова при числах -----
        "lab.cluster.nPoints": "{n}\u00a0точка|{n}\u00a0точки|{n}\u00a0точек",
        "lab.cluster.nPointsSees": "{n}\u00a0точку|{n}\u00a0точки|{n}\u00a0точек",
        "lab.cluster.nCentres": "{n}\u00a0центр|{n}\u00a0центра|{n}\u00a0центров",
        "lab.cluster.nCustomers": "{n}\u00a0покупатель|{n}\u00a0покупателя|{n}\u00a0покупателей",
        "lab.cluster.nVisits": "{n}\u00a0визит|{n}\u00a0визита|{n}\u00a0визитов",
        "lab.cluster.inGroups": "в {n}\u00a0группе|в {n}\u00a0группах|в {n}\u00a0группах"
    }
});

/* ----- The presets -----
   Every preset is made from its seed, so it is the same every time. Points
   live in a square from 0 to 1 (y goes up).
     seed     makes the points
     start    the seed of the first run's starting centres: one with which both kinds
              of start find the best answer, at k and at lessonK (checked by the test)
     k        the k the preset starts with. "Five groups" starts with 3 on purpose:
              finding 5 with the elbow chart is challenge 1
     lessonK  the k its lesson (lab.cluster.lesson.<id>) is about
     blobs    groups shaped like a bell curve: a centre (x, y), sd = how far they
              spread, n = how many points; a stretched group also has sd2 (how far
              across) and angle (turned by that many degrees)
     moons    two half circles that hook into each other: n points, noise = how fuzzy
     axes     Shop customers only: what the square means. x is visits per month
              (0 to 20), y is money spent per month (0 to $500)
   dev/tests/cluster.math.js checks each lesson against these exact points. */
window.AICompass.content.set("lab.cluster", {
    presets: [
        {
            id: "three", seed: 3, start: 1, k: 3, lessonK: 3,
            blobs: [
                { x: 0.2, y: 0.72, sd: 0.06, n: 50 },
                { x: 0.3, y: 0.26, sd: 0.06, n: 50 },
                { x: 0.78, y: 0.4, sd: 0.06, n: 50 }
            ]
        },
        {
            id: "five", seed: 5, start: 6, k: 3, lessonK: 5,
            blobs: [
                { x: 0.2, y: 0.76, sd: 0.055, n: 36 },
                { x: 0.52, y: 0.84, sd: 0.055, n: 36 },
                { x: 0.82, y: 0.66, sd: 0.055, n: 36 },
                { x: 0.3, y: 0.3, sd: 0.055, n: 36 },
                { x: 0.7, y: 0.22, sd: 0.055, n: 36 }
            ]
        },
        {
            id: "sizes", seed: 7, start: 1, k: 3, lessonK: 3,
            blobs: [
                { x: 0.36, y: 0.5, sd: 0.14, n: 120 },
                { x: 0.8, y: 0.78, sd: 0.035, n: 25 },
                { x: 0.8, y: 0.22, sd: 0.035, n: 25 }
            ]
        },
        {
            id: "stretched", seed: 9, start: 2, k: 3, lessonK: 3,
            blobs: [
                { x: 0.5, y: 0.3, sd: 0.25, sd2: 0.022, n: 50 },
                { x: 0.5, y: 0.5, sd: 0.25, sd2: 0.022, n: 50 },
                { x: 0.5, y: 0.7, sd: 0.25, sd2: 0.022, n: 50 }
            ]
        },
        {
            id: "moons", seed: 11, start: 1, k: 2, lessonK: 2,
            moons: { n: 160, noise: 0.08 }
        },
        {
            id: "shop", seed: 13, start: 1, k: 3, lessonK: 3,
            axes: { visits: 20, visitsStep: 5, money: 500, moneyStep: 100 },
            blobs: [
                { x: 0.7, y: 0.13, sd: 0.07, sd2: 0.04, n: 45 },
                { x: 0.4, y: 0.45, sd: 0.07, n: 60 },
                { x: 0.15, y: 0.8, sd: 0.05, sd2: 0.07, angle: 90, n: 30 }
            ]
        }
    ]
});
