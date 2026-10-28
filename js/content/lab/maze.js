/* =========================================================
   AI COMPASS — TEXTS AND PRESETS: "ROBOT IN A MAZE" (js/lab/maze.js)
   Keys: lab.maze.*  The shared words (Play, Step, Speed...) are lab.kit.*
   in js/content/lab/kit.js. Plurals: "one|other" (English), "one|few|many" (Russian).
   The presets (the example mazes) are at the end of this file.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- The experiment -----
        "lab.maze.title": "Robot in a maze",
        "lab.maze.hook": "Nobody shows the robot the way. It tries, gets rewards and penalties, and slowly learns which move is worth most in each square.",
        "lab.maze.idea": "Reinforcement learning",

        // ----- The board -----
        "lab.maze.canvas": "The maze board. The arrow keys move the cursor; Enter picks a square.",
        "lab.maze.canvasEdit": "The maze board, edit mode. The arrow keys move the cursor; Enter or Space paints with the chosen tile.",
        "lab.maze.describe": "A {cols} × {rows} maze. Episode {episode}. {robot} {last} {best}",
        "lab.maze.describeRobot": "The robot is in row {row}, column {col}.",
        "lab.maze.describeLast": "Last episode: {moves}, {end}.",
        "lab.maze.describeNone": "No episode has finished yet.",
        "lab.maze.describeBest": "Best path from the start: {moves}.",
        "lab.maze.describeNoBest": "The robot doesn't know a whole path from the start yet.",
        "lab.maze.moves": "{n} move|{n} moves",
        "lab.maze.endBig": "reached the big battery",
        "lab.maze.endSmall": "reached the small battery",
        "lab.maze.endPit": "fell into a pit",
        "lab.maze.endLimit": "ran out of moves",

        // ----- Tiles, the legend and the edit tools -----
        "lab.maze.empty": "empty",
        "lab.maze.wall": "Wall",
        "lab.maze.pit": "Pit",
        "lab.maze.small": "Small battery",
        "lab.maze.big": "Big battery",
        "lab.maze.start": "Start",
        "lab.maze.eraser": "Eraser",
        "lab.maze.withReward": "{name} {r}",
        "lab.maze.moveCost": "Each move {r}",

        // ----- Buttons and switches -----
        "lab.maze.runEpisode": "Run 1 episode",
        "lab.maze.bestPath": "Show the best path",
        "lab.maze.forget": "Forget everything",
        "lab.maze.edit": "Edit the maze",
        "lab.maze.tool": "Paint with",
        "lab.maze.alpha": "α: learning rate",
        "lab.maze.alphaHint": "How much one try changes a score.",
        "lab.maze.gamma": "γ: how much the future counts",
        "lab.maze.gammaHint": "0: only the next reward matters. Close to 1: rewards far ahead count almost fully.",
        "lab.maze.epsilon": "ε: how often to explore",
        "lab.maze.epsilonHint": "The share of random moves.",
        "lab.maze.slippery": "Slippery floor",
        "lab.maze.slipperyHint": "One move in five slides sideways.",
        "lab.maze.layer": "Show what it learned",
        "lab.maze.layerHint": "Colour: how good a square is. Arrow: the best move from there.",
        "lab.maze.shrink": "ε shrinks over time",
        "lab.maze.shrinkHint": "After each episode ε × {k}, but not below {floor}: the robot explores at first, then uses what it knows.",

        // ----- Presets -----
        "lab.maze.presetFirst": "First steps",
        "lab.maze.presetCliff": "The cliff",
        "lab.maze.presetFar": "Near or far?",
        "lab.maze.presetMaze": "Maze",
        "lab.maze.presetMine": "My maze",
        "lab.maze.aboutFirst": "A small room with three walls. The robot learns the way in about 20 episodes.",
        "lab.maze.aboutCliff": "The short way runs right along a row of pits. Train the robot, then switch on the slippery floor.",
        "lab.maze.aboutFar": "A small battery nearby, a big one farther away. Which one is worth it? That depends on γ.",
        "lab.maze.aboutMaze": "A real maze with dead ends and two pits. Turbo helps.",
        "lab.maze.aboutMine": "Your own maze. Press “Edit the maze” to change it.",

        // ----- Live numbers and charts -----
        "lab.maze.statEpisode": "Episode",
        "lab.maze.statMoves": "Moves this episode",
        "lab.maze.statFound": "Found a battery (last 20)",
        "lab.maze.statBest": "Best path, moves",
        "lab.maze.chartMoves": "Moves per episode",
        "lab.maze.chartReward": "Reward per episode",
        "lab.maze.episode": "Episode",
        "lab.maze.chartMovesAvg": "Moves per episode (the average of the last 10)",
        "lab.maze.chartRewardAvg": "Reward per episode (the average of the last 10)",

        // ----- The inspector (the selected square) -----
        "lab.maze.inspector": "Selected square",
        "lab.maze.cell": "Row {row}, column {col}: {tile}.",
        "lab.maze.scores": "The scores of its 4 moves",
        "lab.maze.up": "Up",
        "lab.maze.right": "Right",
        "lab.maze.down": "Down",
        "lab.maze.left": "Left",
        "lab.maze.noScores": "The episode ends here, so this square has no scores.",
        "lab.maze.wallNote": "A wall: the robot is never here.",
        "lab.maze.stepHint": "Press Step to see one update with real numbers.",
        "lab.maze.lastMove": "Last move: from row {row}, column {col}, it chose {dir} ({how}). Reward: {r}.",
        "lab.maze.slipped": "It slipped and went {dir}.",
        "lab.maze.howRandom": "a random move",
        "lab.maze.howBest": "the best move it knows",
        "lab.maze.dirUp": "up",
        "lab.maze.dirRight": "right",
        "lab.maze.dirDown": "down",
        "lab.maze.dirLeft": "left",

        // ----- Messages -----
        "lab.maze.cellBest": "Best move: {dir}.",
        "lab.maze.cellNew": "Not explored yet.",
        "lab.maze.cellScores": "Scores: up {up}, right {right}, down {down}, left {left}.",
        "lab.maze.episodeDone": "Episode {n} is over: {moves}, {end}.",
        "lab.maze.forgotten": "The robot forgot everything it had learned.",
        "lab.maze.pathBig": "The best path leads to the big battery: {moves}.",
        "lab.maze.pathSmall": "The best path leads to the small battery: {moves}.",
        "lab.maze.pathPit": "The best path so far ends in a pit. The robot needs more practice.",
        "lab.maze.pathLoop": "The robot's best moves go round in a circle: it doesn't know the way yet.",
        "lab.maze.pathUnknown": "The robot hasn't learned anything here yet: train it first.",
        "lab.maze.editAsk": "Changing the maze makes the robot forget everything it has learned. Press “Edit the maze” again to go ahead.",
        "lab.maze.editAskMine": "There is room for one maze of your own: changing this example replaces your saved “My maze”, and the robot starts learning from scratch. Press “Edit the maze” again to go ahead.",
        "lab.maze.editHelp": "Pick a tile, then click or drag on the board (tap on a phone). With the keyboard: the arrow keys and Enter. The start can be moved, but not erased.",
        "lab.maze.editOn": "Edit mode. The robot forgot what it had learned.",
        "lab.maze.editOff": "Editing done.",
        "lab.maze.noWay": "In this maze the robot can't reach any battery from the start.",

        // ----- "What's happening?" -----
        "lab.maze.step1": "The robot sees which square it is in: that is its <strong>state</strong>.",
        "lab.maze.step2": "It picks a move: usually the one with the best score so far, but sometimes a random one, to explore (ε = {eps}). {how}",
        "lab.maze.step3": "It gets a reward: <strong>{reward}</strong>. {why}",
        "lab.maze.step4": "It updates the score of that move: new = old + α × (reward + γ × best next score − old). Here: <strong>{old} → {new}</strong>.",
        "lab.maze.step5": "After many tries, the colours and arrows show the way: that map is what it has learned.",
        "lab.maze.howRandomLong": "This time it explored: a random move.",
        "lab.maze.howBestLong": "This time it took the best move it knows.",
        "lab.maze.whyMove": "Each move costs {cost}, so a shorter way is better.",
        "lab.maze.whyWall": "It bumped into a wall or the edge of the board and stayed where it was (the move still costs {cost}).",
        "lab.maze.whyEnd": "{tile}: {bonus}, plus {cost} for the move. The episode is over.",
        "lab.maze.whyLimit": "Out of moves: the episode is over.",
        "lab.maze.formula": "Q = {old} + {alpha} × ({r} + {gamma} × {next} − {oldAgain}) {eq} {new}",
        "lab.maze.stepSay": "Chose {dir}, reward {r}. The score of that move: {old} → {new}.",

        // ----- The big idea and the real world -----
        "lab.maze.ideaLine": "Learning from rewards by trial and error is called",
        "lab.maze.term": "reinforcement learning",
        "lab.maze.realWorld": "Game AIs, robots that learn to walk and recommendation systems all learn from rewards like this.",
        "lab.maze.toyLine": "This robot learns a score for every move in every square and keeps the scores in a table. This way of learning is called",
        "lab.maze.termQ": "Q-learning",
        "lab.maze.toyLine2": "Real systems use a neural network instead of a table, because their worlds have far too many states.",

        // ----- "Try this" -----
        "lab.maze.ch1": "In “First steps”, train until the best path is as short as it can be.",
        "lab.maze.ch1Why": "Every move costs a little, so the shortest way earns the most. Nobody showed the robot the way: it found it by trial and error.",
        "lab.maze.ch2": "In “The cliff”, switch on the slippery floor and train (Turbo helps): the best path should keep away from the pits.",
        "lab.maze.ch2Why": "On a slippery floor, a path right next to the pits sometimes slides in (−10). A path one row further away is a little longer but much safer, so the robot learned to play it safe.",
        "lab.maze.ch3": "In “Near or far?”, find a γ that makes the robot go for the big battery. (Press Forget after you change γ.)",
        "lab.maze.ch3Why": "γ says how much future rewards count. With γ = 0.5, +10 six moves away is worth only about 0.1 now: less than +2 two moves away (about 0.85). With γ = 0.95 the far battery is worth about 7.2: patience pays.",
        "lab.maze.ch4": "In “Near or far?”, set γ to 0.9, ε to 0 and switch off “ε shrinks”. Press Forget and train 30 episodes. Does the robot find the big battery?",
        "lab.maze.ch4Why": "With ε = 0 the robot stops trying new things as soon as something works: it grabs the first battery it finds and stops looking. Curiosity helps: set ε to 1 and switch on “ε shrinks” (explore a lot at first, then less and less), press Forget and train again."
    },
    ru: {
        // ----- Эксперимент -----
        "lab.maze.title": "Робот в лабиринте",
        "lab.maze.hook": "Никто не показывает роботу дорогу. Он пробует, получает награды и штрафы и постепенно узнаёт, какой ход в какой клетке выгоднее всего.",
        "lab.maze.idea": "Обучение с подкреплением",

        // ----- Поле -----
        "lab.maze.canvas": "Поле лабиринта. Стрелки двигают курсор, Enter выбирает клетку.",
        "lab.maze.canvasEdit": "Поле лабиринта, режим редактирования. Стрелки двигают курсор, Enter или пробел рисуют выбранной плиткой.",
        "lab.maze.describe": "Лабиринт {cols} × {rows}. Эпизод {episode}. {robot} {last} {best}",
        "lab.maze.describeRobot": "Робот в строке {row}, столбце {col}.",
        "lab.maze.describeLast": "Последний эпизод: {moves}, {end}.",
        "lab.maze.describeNone": "Ни один эпизод ещё не закончился.",
        "lab.maze.describeBest": "Лучший путь от старта: {moves}.",
        "lab.maze.describeNoBest": "Целого пути от старта робот пока не знает.",
        "lab.maze.moves": "{n} ход|{n} хода|{n} ходов",
        "lab.maze.endBig": "дошёл до большой батарейки",
        "lab.maze.endSmall": "дошёл до маленькой батарейки",
        "lab.maze.endPit": "упал в яму",
        "lab.maze.endLimit": "ходы закончились",

        // ----- Плитки, легенда и инструменты редактора -----
        "lab.maze.empty": "пусто",
        "lab.maze.wall": "Стена",
        "lab.maze.pit": "Яма",
        "lab.maze.small": "Маленькая батарейка",
        "lab.maze.big": "Большая батарейка",
        "lab.maze.start": "Старт",
        "lab.maze.eraser": "Ластик",
        "lab.maze.withReward": "{name} {r}",
        "lab.maze.moveCost": "Каждый ход {r}",

        // ----- Кнопки и переключатели -----
        "lab.maze.runEpisode": "Один эпизод",
        "lab.maze.bestPath": "Показать лучший путь",
        "lab.maze.forget": "Забыть всё",
        "lab.maze.edit": "Изменить лабиринт",
        "lab.maze.tool": "Чем рисовать",
        "lab.maze.alpha": "α: скорость обучения",
        "lab.maze.alphaHint": "Насколько одна попытка меняет оценку.",
        "lab.maze.gamma": "γ: насколько важно будущее",
        "lab.maze.gammaHint": "0 — важна только ближайшая награда. Около 1 — далёкие награды почти так же важны.",
        "lab.maze.epsilon": "ε: как часто пробовать новое",
        "lab.maze.epsilonHint": "Доля случайных ходов.",
        "lab.maze.slippery": "Скользкий пол",
        "lab.maze.slipperyHint": "В одном ходе из пяти робота заносит вбок.",
        "lab.maze.layer": "Показывать, что он выучил",
        "lab.maze.layerHint": "Цвет — насколько хороша клетка. Стрелка — лучший ход из неё.",
        "lab.maze.shrink": "ε уменьшается со временем",
        "lab.maze.shrinkHint": "После каждого эпизода ε × {k}, но не меньше {floor}: сначала робот исследует, потом пользуется тем, что знает.",

        // ----- Примеры -----
        "lab.maze.presetFirst": "Первые шаги",
        "lab.maze.presetCliff": "Обрыв",
        "lab.maze.presetFar": "Близко или далеко?",
        "lab.maze.presetMaze": "Лабиринт",
        "lab.maze.presetMine": "Мой лабиринт",
        "lab.maze.aboutFirst": "Маленькая комната с тремя стенами. Робот выучит дорогу примерно за 20 эпизодов.",
        "lab.maze.aboutCliff": "Короткий путь идёт прямо вдоль ряда ям. Потренируй робота, а потом включи скользкий пол.",
        "lab.maze.aboutFar": "Маленькая батарейка рядом, большая — подальше. Какая выгоднее? Это зависит от γ.",
        "lab.maze.aboutMaze": "Настоящий лабиринт с тупиками и двумя ямами. Включи «Турбо».",
        "lab.maze.aboutMine": "Твой собственный лабиринт. Чтобы изменить его, нажми «Изменить лабиринт».",

        // ----- Показатели и графики -----
        "lab.maze.statEpisode": "Эпизод",
        "lab.maze.statMoves": "Ходов в эпизоде",
        "lab.maze.statFound": "Нашёл батарейку (из 20)",
        "lab.maze.statBest": "Лучший путь, ходов",
        "lab.maze.chartMoves": "Ходов за эпизод",
        "lab.maze.chartReward": "Награда за эпизод",
        "lab.maze.episode": "Эпизод",
        "lab.maze.chartMovesAvg": "Ходов за эпизод (среднее за 10 последних)",
        "lab.maze.chartRewardAvg": "Награда за эпизод (среднее за 10 последних)",

        // ----- Инспектор (выбранная клетка) -----
        "lab.maze.inspector": "Выбранная клетка",
        "lab.maze.cell": "Строка {row}, столбец {col}: {tile}.",
        "lab.maze.scores": "Оценки четырёх ходов",
        "lab.maze.up": "Вверх",
        "lab.maze.right": "Вправо",
        "lab.maze.down": "Вниз",
        "lab.maze.left": "Влево",
        "lab.maze.noScores": "Здесь эпизод заканчивается, поэтому у этой клетки нет оценок.",
        "lab.maze.wallNote": "Стена: робот здесь не бывает.",
        "lab.maze.stepHint": "Нажми «Шаг», чтобы увидеть одно обновление с настоящими числами.",
        "lab.maze.lastMove": "Последний ход: из строки {row}, столбца {col} робот выбрал «{dir}» ({how}). Награда: {r}.",
        "lab.maze.slipped": "Его занесло, и он пошёл {dir}.",
        "lab.maze.howRandom": "случайный ход",
        "lab.maze.howBest": "лучший из известных ходов",
        "lab.maze.dirUp": "вверх",
        "lab.maze.dirRight": "вправо",
        "lab.maze.dirDown": "вниз",
        "lab.maze.dirLeft": "влево",

        // ----- Сообщения -----
        "lab.maze.cellBest": "Лучший ход: {dir}.",
        "lab.maze.cellNew": "Ещё не исследована.",
        "lab.maze.cellScores": "Оценки: вверх {up}, вправо {right}, вниз {down}, влево {left}.",
        "lab.maze.episodeDone": "Эпизод {n} окончен: {moves}, {end}.",
        "lab.maze.forgotten": "Робот забыл всё, чему научился.",
        "lab.maze.pathBig": "Лучший путь ведёт к большой батарейке: {moves}.",
        "lab.maze.pathSmall": "Лучший путь ведёт к маленькой батарейке: {moves}.",
        "lab.maze.pathPit": "Лучший путь пока кончается в яме. Роботу нужно больше тренироваться.",
        "lab.maze.pathLoop": "Лучшие ходы водят робота по кругу: дороги он пока не знает.",
        "lab.maze.pathUnknown": "Робот здесь пока ничему не научился: сначала потренируй его.",
        "lab.maze.editAsk": "Если изменить лабиринт, робот забудет всё, чему научился. Нажми «Изменить лабиринт» ещё раз, чтобы продолжить.",
        "lab.maze.editAskMine": "Свой лабиринт можно сохранить только один: если изменить этот пример, он займёт место твоего «Моего лабиринта», а робот начнёт учиться с нуля. Нажми «Изменить лабиринт» ещё раз, чтобы продолжить.",
        "lab.maze.editHelp": "Выбери плитку и щёлкай или веди мышью по полю (на телефоне — касайся). С клавиатуры: стрелки и Enter. Старт можно переставить, но не стереть.",
        "lab.maze.editOn": "Режим редактирования. Робот забыл всё, чему научился.",
        "lab.maze.editOff": "Редактирование закончено.",
        "lab.maze.noWay": "В этом лабиринте от старта не добраться ни до одной батарейки.",

        // ----- «Что здесь происходит?» -----
        "lab.maze.step1": "Робот видит, в какой он клетке: это его <strong>состояние</strong>.",
        "lab.maze.step2": "Он выбирает ход: обычно тот, у которого пока лучшая оценка, но иногда случайный, чтобы исследовать (ε = {eps}). {how}",
        "lab.maze.step3": "Он получает награду: <strong>{reward}</strong>. {why}",
        "lab.maze.step4": "Он обновляет оценку этого хода: новая = старая + α × (награда + γ × лучшая следующая оценка − старая). Здесь: <strong>{old} → {new}</strong>.",
        "lab.maze.step5": "После многих попыток цвета и стрелки показывают дорогу: эта карта и есть то, чему он научился.",
        "lab.maze.howRandomLong": "В этот раз он исследовал: сделал случайный ход.",
        "lab.maze.howBestLong": "В этот раз он сделал лучший из известных ходов.",
        "lab.maze.whyMove": "Каждый ход стоит {cost}, так что короткий путь лучше.",
        "lab.maze.whyWall": "Он упёрся в стену или в край поля и остался на месте (а ход всё равно стоит {cost}).",
        "lab.maze.whyEnd": "{tile}: {bonus} и ещё {cost} за ход. Эпизод окончен.",
        "lab.maze.whyLimit": "Ходы закончились: эпизод окончен.",
        "lab.maze.formula": "Q = {old} + {alpha} × ({r} + {gamma} × {next} − {oldAgain}) {eq} {new}",
        "lab.maze.stepSay": "Выбрал ход {dir}, награда {r}. Оценка этого хода: {old} → {new}.",

        // ----- Главная идея и настоящий мир -----
        "lab.maze.ideaLine": "Учиться на наградах методом проб и ошибок — это",
        "lab.maze.term": "обучение с подкреплением",
        "lab.maze.realWorld": "Так учатся игровые ИИ, роботы, которые осваивают ходьбу, и рекомендательные системы.",
        "lab.maze.toyLine": "Наш робот учится оценивать каждый ход в каждой клетке и хранит оценки в таблице. Такой способ обучения — это",
        "lab.maze.termQ": "Q-обучение",
        "lab.maze.toyLine2": "Настоящие системы вместо таблицы используют нейросеть: в их мирах слишком много состояний.",

        // ----- «Попробуй» -----
        "lab.maze.ch1": "В «Первых шагах» тренируй робота, пока лучший путь не станет самым коротким.",
        "lab.maze.ch1Why": "Каждый ход немного стоит, поэтому самый короткий путь приносит больше всего. Никто не показывал роботу дорогу: он нашёл её методом проб и ошибок.",
        "lab.maze.ch2": "В «Обрыве» включи скользкий пол и потренируй робота (поможет «Турбо»): лучший путь должен держаться подальше от ям.",
        "lab.maze.ch2Why": "На скользком полу путь вплотную к ямам иногда кончается падением (−10). Путь на ряд дальше чуть длиннее, зато гораздо безопаснее, и робот научился не рисковать.",
        "lab.maze.ch3": "В «Близко или далеко?» подбери такое γ, чтобы робот шёл к большой батарейке. (Изменив γ, нажми «Забыть всё».)",
        "lab.maze.ch3Why": "γ показывает, насколько важны будущие награды. При γ = 0,5 награда +10 в шести ходах сейчас стоит всего около 0,1 — меньше, чем +2 в двух ходах (около 0,85). При γ = 0,95 дальняя батарейка стоит около 7,2: терпение окупается.",
        "lab.maze.ch4": "В «Близко или далеко?» поставь γ = 0,9, ε = 0 и выключи «ε уменьшается со временем». Нажми «Забыть всё» и потренируй робота 30 эпизодов. Найдёт ли он большую батарейку?",
        "lab.maze.ch4Why": "При ε = 0 робот перестаёт пробовать новое, как только что-то сработало: он хватается за первую найденную батарейку и больше не ищет. Помогает любопытство: поставь ε = 1 и включи «ε уменьшается со временем» (сначала много исследовать, потом всё меньше), нажми «Забыть всё» и потренируй снова."
    }
});

/* ----- The presets (the example mazes) -----
   Each maze is a list of rows, one letter per square:
     .  empty      #  wall      x  pit (−10, the episode ends)
     b  small battery (+2, ends)      B  big battery (+10, ends)      S  the start (exactly one)
   At most 12 columns and 9 rows. Every move costs −0.1 (js/lab/maze.js, Settings).
   seed: the random numbers of this preset (the same seed always trains the same way).
   alpha, gamma, epsilon, shrink, slippery: the settings that the preset switches to.
   rewards (optional): other rewards for this maze only, e.g. rewards: { small: 3 }.
   The checks in dev/tests/maze.math.js show that each preset teaches its lesson. */
window.AICompass.content.set("lab.maze", {
    presets: [
        {
            id: "first",
            labelKey: "lab.maze.presetFirst",
            aboutKey: "lab.maze.aboutFirst",
            seed: 11,
            alpha: 0.5, gamma: 0.9, epsilon: 0.2, shrink: false, slippery: false,
            maze: [
                "S....",
                ".#...",
                "...#.",
                ".#...",
                "....B"
            ]
        },
        {
            // The pits fill the bottom row. With a slippery floor, a path right above them
            // is risky, so the robot learns to walk one row higher. (The square next to the
            // start is solid floor, so the robot can step away from the start safely.)
            id: "cliff",
            labelKey: "lab.maze.presetCliff",
            aboutKey: "lab.maze.aboutCliff",
            seed: 5,
            alpha: 0.1, gamma: 0.9, epsilon: 0.2, shrink: false, slippery: false,
            maze: [
                "..........",
                "..........",
                "..........",
                "S.xxxxxxxB"
            ]
        },
        {
            // The small battery is 2 moves away, the big one 6. With γ = 0.5 the near one is
            // worth more; with γ above about 0.69 the far one is. ε starts at 1 and shrinks,
            // so the robot finds both batteries before it settles.
            id: "far",
            labelKey: "lab.maze.presetFar",
            aboutKey: "lab.maze.aboutFar",
            seed: 3,
            alpha: 0.5, gamma: 0.5, epsilon: 1, shrink: true, slippery: false,
            maze: [
                "....#..",
                ".....#.",
                "....S.b",
                ".....##",
                "B.....#"
            ]
        },
        {
            id: "maze",
            labelKey: "lab.maze.presetMaze",
            aboutKey: "lab.maze.aboutMaze",
            seed: 7,
            alpha: 0.5, gamma: 0.9, epsilon: 0.2, shrink: false, slippery: false,
            maze: [
                "S..#x....",
                "##.#####.",
                "x#.....#.",
                ".#####.#.",
                "...#.#.#.",
                ".#.#.#.#.",
                ".#...#.#.",
                ".#####.#.",
                "........B"
            ]
        }
    ]
});
