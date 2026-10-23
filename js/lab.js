/* =========================================================
   AI COMPASS — THE AI LAB
   Two real experiments, built from scratch (no libraries):
    1. "Teach the machine": a tiny neural network that learns,
       live in your browser, to tell two kinds of dots apart.
    2. "Next-word predictor": a tiny language model that counts
       which words follow which, just like a (very) mini chatbot.
   Sections of this file:
    1. Translations          5. Neural network: drawing
    2. Small helpers         6. Neural network: controls
    3. The lab card + tabs   7. Next-word predictor
    4. Neural network: math  8. Start-up, openLab, commands
   Other files can call AICompass.openLab("classifier" | "predictor").
   ========================================================= */

(function () {
"use strict";

const AIC = window.AICompass;
const mount = document.querySelector('[data-feature="lab"]');
if (!AIC || !mount) return;

const t = AIC.t;

/* =========================================================
   1. TRANSLATIONS
   ========================================================= */
AIC.addTranslations({
    en: {
        // Card and tabs
        "lab.tablistLabel": "AI Lab experiments",
        "lab.tabNN": "Teach the machine",
        "lab.tabNNSub": "NEURAL NETWORK",
        "lab.tabLM": "Next-word predictor",
        "lab.tabLMSub": "LANGUAGE MODEL",
        "lab.live": "RUNS 100% IN YOUR BROWSER",

        // Board
        "lab.classGroup": "Class of the next dot",
        "lab.classA": "Class A",
        "lab.classB": "Class B",
        "lab.undo": "Undo",
        "lab.clear": "Clear",
        "lab.undoLabel": "Undo the last change to the dots",
        "lab.clearLabel": "Remove all dots",
        "lab.boardLabel": "Training board. Arrow keys move the cursor, Enter adds a dot, A or B picks the class, Backspace undoes.",
        "lab.emptyTitle": "The board is empty",
        "lab.emptyText": "Click to add dots, or pick an example below",
        "lab.emptyTextTouch": "Tap to add dots, or pick an example below",
        "lab.presetsLabel": "EXAMPLES",
        "lab.presetClusters": "Two clusters",
        "lab.presetCircle": "Circle",
        "lab.presetXor": "XOR",
        "lab.presetSpiral": "Spiral",
        "lab.hintMouse": "<strong>Click</strong> to add a dot of the chosen class. <strong>Shift + click</strong> or <strong>right-click</strong> adds the other class. Hold and drag to paint.",
        "lab.hintTouch": "<strong>Tap</strong> the board to add a dot of the chosen class.",
        "lab.legendBoundary": "Boundary (50 / 50)",
        "lab.legendWrong": "Wrong guess",
        "lab.readout": "x {x}  y {y}  →  {cls} {pct}%",

        // Run buttons and status
        "lab.train": "Train",
        "lab.pause": "Pause",
        "lab.step": "Step",
        "lab.stepLabel": "Train for one epoch",
        "lab.reset": "Reset",
        "lab.resetLabel": "Reset the network to random weights",
        "lab.statsTitle": "LIVE STATS",
        "lab.statusReady": "READY",
        "lab.statusTraining": "TRAINING",
        "lab.statusPaused": "PAUSED",
        "lab.statusDone": "LEARNED",
        "lab.statEpoch": "EPOCH",
        "lab.statLoss": "LOSS",
        "lab.statAccuracy": "ACCURACY",
        "lab.statPoints": "DOTS",
        "lab.pointsSplit": "A {a} · B {b}",
        "lab.chartTitle": "LOSS OVER TIME",
        "lab.chartEmpty": "Press Train and watch the loss fall",
        "lab.chartLabel": "Loss chart. Loss right now: {loss}.",
        "lab.chartLabelEmpty": "Loss chart. No training yet.",

        // Settings
        "lab.settings": "SETTINGS",
        "lab.lr": "Learning rate",
        "lab.lrHint": "How big each learning step is",
        "lab.optimizer": "Optimizer",
        "lab.optHint": "The rule for changing the weights",
        "lab.optAdam": "Adam",
        "lab.optSgd": "SGD + momentum",
        "lab.speed": "Speed",
        "lab.speedSlow": "Slow",
        "lab.speedNormal": "Normal",
        "lab.speedFast": "Fast",
        "lab.neurons": "Hidden neurons",
        "lab.neuronsHint": "More neurons can draw more complex shapes",
        "lab.layer2": "Second hidden layer",
        "lab.layer2Hint": "Combines simple shapes into new ones",

        // Network diagram
        "lab.diagramTitle": "THE NETWORK, LIVE",
        "lab.params": "{n} {params}",
        "lab.pluralParams": "parameter|parameters",
        "lab.diagramHow": "Each square is a <strong>neuron</strong>. The tiny picture inside shows how it reacts to every spot of the board: purple means negative, cyan means positive. The lines are the <strong>weights</strong> that connect them. Watch them change while it learns!",
        "lab.legendPos": "positive weight",
        "lab.legendNeg": "negative weight",
        "lab.nnInput": "INPUT",
        "lab.nnHidden": "LAYER {n}",
        "lab.nnOutput": "OUTPUT",
        "lab.nnOutputHint": "P(B)",
        "lab.diagramLabel": "Network diagram: 2 inputs → {hidden} hidden neurons → 1 output; {params} in total. Cyan lines are positive weights, purple lines are negative, thicker lines are stronger.",

        // Messages
        "lab.toastEmpty": "Add some dots first, or pick an example",
        "lab.toastLearned": "Learned it! 100% accuracy after {n} {epochs}",
        "lab.pluralEpochs": "epoch|epochs",
        "lab.toastOneClass": "Add dots of both classes, so there is something to tell apart",
        "lab.toastMax": "That's plenty of dots! (maximum {n})",
        "lab.srStatus": "Epoch {epoch}. Loss {loss}. Accuracy {acc}%.",
        "lab.srAdded": "Added a dot: {cls}. {n} {points} in total.",
        "lab.pluralPoints": "dot|dots",
        "lab.srPreset": "Loaded the example {name}: {n} {points}.",
        "lab.srCleared": "All dots removed.",
        "lab.srUndo": "Undone. {n} {points} left.",
        "lab.srTraining": "Training started.",
        "lab.srPaused": "Training paused.",

        // Explanation
        "lab.explainTitle": "What's happening?",
        "lab.explain1Title": "You give examples",
        "lab.explain1Text": "Every dot is an example with an answer: purple (A) or cyan (B). Together they are the <strong>training data</strong>.",
        "lab.explain2Title": "The network guesses",
        "lab.explain2Text": "For every spot on the board it calculates a guess. The background shows it: the stronger the colour, the surer it is. The glowing line is where it's 50 / 50.",
        "lab.explain3Title": "It measures the mistake",
        "lab.explain3Text": "The <strong>loss</strong> is a score for how wrong the guesses are. Lower is better: 0 would mean perfect and completely sure.",
        "lab.explain4Title": "It adjusts and repeats",
        "lab.explain4Text": "It nudges every <strong>weight</strong> (the lines in the diagram) a tiny bit to make the loss smaller. One pass over all the dots is one <strong>epoch</strong>. Thousands of tiny nudges = learning!",
        "lab.tipsTitle": "TRY THIS",
        "lab.tip1": "Load <strong>XOR</strong>, set 2 neurons and train. Then try 8. What changes?",
        "lab.tip2": "The <strong>spiral</strong> is tricky. Turn on the second layer and watch the boundary curl.",
        "lab.tip3": "Set the learning rate to <strong>1</strong>: the steps get so big that learning goes wild.",
        "lab.tip4": "Put a purple dot deep inside the cyan area. Does the network bend just to fit it? That's called <strong>overfitting</strong>.",
        "lab.underHood": "Under the hood: 2 inputs (x and y) → hidden neurons with <em>tanh</em> → 1 output with a <em>sigmoid</em> (a probability from 0 to 1). It learns with binary cross-entropy loss and the Adam or SGD optimizer: the same ideas big AI uses, just tiny.",

        // Next-word predictor
        "lab.lmPromptLabel": "Start a sentence, and the model will guess the next word",
        "lab.lmPlaceholder": "Type here… for example “My friends and I”",
        "lab.lmClear": "Clear the text",
        "lab.lmStarters": "TRY:",
        "lab.lmStartersGroup": "Example beginnings",
        "lab.lmStarter1": "Artificial intelligence can",
        "lab.lmStarter2": "My friends and I",
        "lab.lmStarter3": "At school we",
        "lab.lmStarter4": "I like to",
        "lab.lmStarter5": "The robot",
        "lab.lmNext": "NEXT WORD",
        "lab.lmComplete": "FINISHING THE WORD",
        "lab.q": "“{w}”",
        "lab.pluralTimes": "time|times",
        "lab.lmCtxStart": "Start of a sentence: words that usually come first",
        "lab.lmCtxFirst": "{word} at the start of a sentence: seen {n} {times}",
        "lab.lmCtxTri": "Looking at the last two words {words}: seen {n} {times}",
        "lab.lmCtxOne": "Looking at the last word {word}: seen {n} {times}",
        "lab.lmCtxBi": "Never saw {pair} together, so I back off to just {word} (seen {n} {times})",
        "lab.lmCtxUni": "I've never seen {word}, so I suggest common words",
        "lab.lmCtxComplete": "Words that start with {prefix}",
        "lab.lmEnd": "end of sentence",
        "lab.lmPickLabel": "Add {word}: {pct} likely",
        "lab.lmPickEndLabel": "End the sentence: {pct} likely",
        "lab.lmLegend": "The bar shows how likely the model thinks each word is. The pink line shows its chance to be picked at the current creativity.",
        "lab.lmAuto": "Auto-write",
        "lab.lmStop": "Stop",
        "lab.lmAutoLabel": "Let the model write up to 12 words",
        "lab.lmTemp": "Creativity (temperature)",
        "lab.lmTemp0": "always the top word",
        "lab.lmTemp1": "predictable",
        "lab.lmTemp2": "balanced",
        "lab.lmTemp3": "creative",
        "lab.lmTemp4": "chaotic!",
        "lab.lmTokensTitle": "HOW EXPECTED WAS EACH WORD?",
        "lab.lmTokensHint": "Bright = the model expected it. Dim = a surprise. Dashed = a word it has never seen.",
        "lab.lmTokensEmpty": "Start typing to see your text through the model's eyes.",
        "lab.lmTokenNew": "new",
        "lab.lmStatsTitle": "WHAT IT KNOWS",
        "lab.pluralSentences": "sentence|sentences",
        "lab.pluralWords": "different word|different words",
        "lab.pluralPairs": "word pair|word pairs",
        "lab.pluralTriples": "three-word chain|three-word chains",
        "lab.lmTeachTitle": "TEACH IT A SENTENCE",
        "lab.lmTeachLabel": "Your sentence",
        "lab.lmTeachPlaceholder": "e.g. My cat likes to sleep on the keyboard",
        "lab.lmTeachButton": "Teach",
        "lab.lmTeachCount": "Your sentences in the model: {n}",
        "lab.lmTeachNone": "The model only knows what it has read. Add a sentence and it learns it instantly.",
        "lab.lmTeachForget": "Forget mine",
        "lab.lmTeachError": "Write at least two words.",
        "lab.lmTeachToast": "Learned it! Now type the start of your sentence.",
        "lab.lmTeachForgot": "Your sentences are forgotten",
        "lab.lmTeachFull": "Memory is full: forget your sentences first",
        "lab.lmUnknown": "I don't know most of these words, so I can only suggest common ones. Try a starter!",
        "lab.lmSrTop": "Top guess: {word}, {pct}.",
        "lab.lmSrDone": "Finished writing.",
        "lab.lmExplainTitle": "How does it work?",
        "lab.lmExplain1Title": "It counts",
        "lab.lmExplain1Text": "The model read a small collection of simple sentences and counted which word came after each word and each <strong>pair</strong> of words.",
        "lab.lmExplain2Title": "It looks back",
        "lab.lmExplain2Text": "To make a guess, it looks at your last two words. If it never saw that pair, it <strong>backs off</strong> and looks at just the last word.",
        "lab.lmExplain3Title": "It picks a word",
        "lab.lmExplain3Text": "Every possible word gets a probability. Low creativity always takes the top word; high creativity rolls a weighted dice, so unlikely words get a chance too.",
        "lab.lmRealTitle": "Just like ChatGPT… only much, much smaller",
        "lab.lmRealText": "Real chatbots work on the same idea: predict the next word (more precisely, the next <strong>token</strong>, a word or a piece of a word) again and again. But they use huge neural networks trained on billions of sentences, and they look at thousands of previous words, not just two. Ours is tiny, so it often says silly things, and it only knows the sentences it was given.",

        // Command palette
        "lab.cmdGroup": "AI Lab",
        "lab.cmdNN": "Teach the machine: train a neural network",
        "lab.cmdLM": "Next-word predictor: a mini language model"
    },
    ru: {
        "lab.tablistLabel": "Эксперименты AI-лаборатории",
        "lab.tabNN": "Обучи машину",
        "lab.tabNNSub": "НЕЙРОСЕТЬ",
        "lab.tabLM": "Предсказатель слов",
        "lab.tabLMSub": "ЯЗЫКОВАЯ МОДЕЛЬ",
        "lab.live": "РАБОТАЕТ ПРЯМО В ТВОЁМ БРАУЗЕРЕ",

        "lab.classGroup": "Класс следующей точки",
        "lab.classA": "Класс A",
        "lab.classB": "Класс B",
        "lab.undo": "Отменить",
        "lab.clear": "Очистить",
        "lab.undoLabel": "Отменить последнее изменение точек",
        "lab.clearLabel": "Удалить все точки",
        "lab.boardLabel": "Поле для обучения. Стрелки двигают курсор, Enter ставит точку, A или B выбирают класс, Backspace отменяет.",
        "lab.emptyTitle": "Поле пока пустое",
        "lab.emptyText": "Нажми, чтобы поставить точки, или выбери пример ниже",
        "lab.emptyTextTouch": "Коснись, чтобы поставить точки, или выбери пример ниже",
        "lab.presetsLabel": "ПРИМЕРЫ",
        "lab.presetClusters": "Две группы",
        "lab.presetCircle": "Круг",
        "lab.presetXor": "XOR",
        "lab.presetSpiral": "Спираль",
        "lab.hintMouse": "<strong>Нажми</strong>, чтобы поставить точку выбранного класса. <strong>Shift + клик</strong> или <strong>правая кнопка</strong> ставят точку другого класса. Зажми и веди, чтобы рисовать.",
        "lab.hintTouch": "<strong>Коснись</strong> поля, чтобы поставить точку выбранного класса.",
        "lab.legendBoundary": "Граница (50 / 50)",
        "lab.legendWrong": "Ошибка сети",
        "lab.readout": "x {x}  y {y}  →  {cls} {pct}%",

        "lab.train": "Обучать",
        "lab.pause": "Пауза",
        "lab.step": "Шаг",
        "lab.stepLabel": "Обучить на одну эпоху",
        "lab.reset": "Сброс",
        "lab.resetLabel": "Сбросить сеть к случайным весам",
        "lab.statsTitle": "ПОКАЗАТЕЛИ",
        "lab.statusReady": "ГОТОВА",
        "lab.statusTraining": "ОБУЧАЕТСЯ",
        "lab.statusPaused": "ПАУЗА",
        "lab.statusDone": "ОБУЧЕНА",
        "lab.statEpoch": "ЭПОХА",
        "lab.statLoss": "ОШИБКА",
        "lab.statAccuracy": "ТОЧНОСТЬ",
        "lab.statPoints": "ТОЧКИ",
        "lab.pointsSplit": "A {a} · B {b}",
        "lab.chartTitle": "ОШИБКА СО ВРЕМЕНЕМ",
        "lab.chartEmpty": "Нажми «Обучать» и смотри, как падает ошибка",
        "lab.chartLabel": "График ошибки. Сейчас ошибка: {loss}.",
        "lab.chartLabelEmpty": "График ошибки. Обучение ещё не начиналось.",

        "lab.settings": "НАСТРОЙКИ",
        "lab.lr": "Скорость обучения",
        "lab.lrHint": "Насколько большой каждый шаг обучения",
        "lab.optimizer": "Оптимизатор",
        "lab.optHint": "Правило, по которому меняются веса",
        "lab.optAdam": "Adam",
        "lab.optSgd": "SGD с моментом",
        "lab.speed": "Скорость показа",
        "lab.speedSlow": "Медленно",
        "lab.speedNormal": "Обычно",
        "lab.speedFast": "Быстро",
        "lab.neurons": "Скрытые нейроны",
        "lab.neuronsHint": "Чем больше нейронов, тем сложнее формы",
        "lab.layer2": "Второй скрытый слой",
        "lab.layer2Hint": "Собирает из простых форм новые",

        "lab.diagramTitle": "СЕТЬ В РЕАЛЬНОМ ВРЕМЕНИ",
        "lab.params": "{n} {params}",
        "lab.pluralParams": "параметр|параметра|параметров",
        "lab.diagramHow": "Каждый квадратик — это <strong>нейрон</strong>. Картинка внутри показывает, как он реагирует на каждое место поля: фиолетовый — отрицательно, голубой — положительно. Линии — это <strong>веса</strong>, которые их соединяют. Посмотри, как они меняются во время обучения!",
        "lab.legendPos": "положительный вес",
        "lab.legendNeg": "отрицательный вес",
        "lab.nnInput": "ВХОД",
        "lab.nnHidden": "СЛОЙ {n}",
        "lab.nnOutput": "ВЫХОД",
        "lab.nnOutputHint": "P(B)",
        "lab.diagramLabel": "Схема сети: 2 входа → {hidden} скрытых нейронов → 1 выход; всего {params}. Голубые линии — положительные веса, фиолетовые — отрицательные, чем толще линия, тем сильнее вес.",

        "lab.toastEmpty": "Сначала добавь точки или выбери пример",
        "lab.toastLearned": "Получилось! 100% точности за {n} {epochs}",
        "lab.pluralEpochs": "эпоху|эпохи|эпох",
        "lab.toastOneClass": "Добавь точки обоих классов, чтобы сети было что различать",
        "lab.toastMax": "Точек уже очень много! (максимум {n})",
        "lab.srStatus": "Эпоха {epoch}. Ошибка {loss}. Точность {acc}%.",
        "lab.srAdded": "Добавлена точка: {cls}. Всего {n} {points}.",
        "lab.pluralPoints": "точка|точки|точек",
        "lab.srPreset": "Загружен пример «{name}»: {n} {points}.",
        "lab.srCleared": "Все точки удалены.",
        "lab.srUndo": "Отменено. Осталось точек: {n}.",
        "lab.srTraining": "Обучение началось.",
        "lab.srPaused": "Обучение на паузе.",

        "lab.explainTitle": "Что здесь происходит?",
        "lab.explain1Title": "Ты даёшь примеры",
        "lab.explain1Text": "Каждая точка — это пример с ответом: фиолетовый (A) или голубой (B). Все вместе они — <strong>обучающие данные</strong>.",
        "lab.explain2Title": "Сеть угадывает",
        "lab.explain2Text": "Для каждого места на поле сеть вычисляет свой ответ. Его показывает цвет фона: чем ярче, тем увереннее сеть. Светящаяся линия — там, где 50 на 50.",
        "lab.explain3Title": "Она измеряет ошибку",
        "lab.explain3Text": "<strong>Ошибка</strong> (по-английски loss) — число, которое показывает, насколько ответы неверны. Чем меньше, тем лучше: 0 означал бы идеальные и полностью уверенные ответы.",
        "lab.explain4Title": "Подстраивается и повторяет",
        "lab.explain4Text": "Сеть чуть-чуть меняет каждый <strong>вес</strong> (линии на схеме), чтобы ошибка стала меньше. Один проход по всем точкам — это одна <strong>эпоха</strong>. Тысячи маленьких шагов — это и есть обучение!",
        "lab.tipsTitle": "ПОПРОБУЙ",
        "lab.tip1": "Загрузи <strong>XOR</strong>, поставь 2 нейрона и обучи сеть. Потом попробуй 8. Что изменилось?",
        "lab.tip2": "<strong>Спираль</strong> — сложная задача. Включи второй слой и посмотри, как закручивается граница.",
        "lab.tip3": "Поставь скорость обучения <strong>1</strong>: шаги станут такими большими, что обучение пойдёт вразнос.",
        "lab.tip4": "Поставь фиолетовую точку глубоко в голубой зоне. Станет ли сеть изгибаться ради одной точки? Это называется <strong>переобучение</strong>.",
        "lab.underHood": "Под капотом: 2 входа (x и y) → скрытые нейроны с функцией <em>tanh</em> → 1 выход с <em>сигмоидой</em> (вероятность от 0 до 1). Сеть учится с функцией потерь «бинарная кросс-энтропия» и оптимизатором Adam или SGD — это те же идеи, что и в больших ИИ, только в миниатюре.",

        "lab.lmPromptLabel": "Начни предложение, а модель угадает следующее слово",
        "lab.lmPlaceholder": "Пиши здесь… например, «Мы с друзьями»",
        "lab.lmClear": "Очистить текст",
        "lab.lmStarters": "ПОПРОБУЙ:",
        "lab.lmStartersGroup": "Готовые начала предложений",
        "lab.lmStarter1": "Искусственный интеллект может",
        "lab.lmStarter2": "Мы с друзьями",
        "lab.lmStarter3": "В школе мы",
        "lab.lmStarter4": "Я люблю",
        "lab.lmStarter5": "Робот",
        "lab.lmNext": "СЛЕДУЮЩЕЕ СЛОВО",
        "lab.lmComplete": "ДОПИСЫВАЕМ СЛОВО",
        "lab.q": "«{w}»",
        "lab.pluralTimes": "раз|раза|раз",
        "lab.lmCtxStart": "Начало предложения: слова, с которых обычно начинают",
        "lab.lmCtxFirst": "{word} в начале предложения: встречалось {n} {times}",
        "lab.lmCtxTri": "Смотрю на два последних слова {words}: встречались {n} {times}",
        "lab.lmCtxOne": "Смотрю на последнее слово {word}: встречалось {n} {times}",
        "lab.lmCtxBi": "Сочетание {pair} мне не встречалось, поэтому смотрю только на {word} (встречалось {n} {times})",
        "lab.lmCtxUni": "Слово {word} мне незнакомо, поэтому предлагаю частые слова",
        "lab.lmCtxComplete": "Слова, которые начинаются на {prefix}",
        "lab.lmEnd": "конец предложения",
        "lab.lmPickLabel": "Добавить {word}: вероятность {pct}",
        "lab.lmPickEndLabel": "Закончить предложение: вероятность {pct}",
        "lab.lmLegend": "Полоска показывает, насколько вероятно слово по мнению модели. Розовая линия — шанс, что его выберут при текущей креативности.",
        "lab.lmAuto": "Дописать",
        "lab.lmStop": "Стоп",
        "lab.lmAutoLabel": "Пусть модель допишет до 12 слов",
        "lab.lmTemp": "Креативность (температура)",
        "lab.lmTemp0": "всегда самое вероятное слово",
        "lab.lmTemp1": "предсказуемо",
        "lab.lmTemp2": "сбалансированно",
        "lab.lmTemp3": "творчески",
        "lab.lmTemp4": "хаотично!",
        "lab.lmTokensTitle": "НАСКОЛЬКО ОЖИДАЕМО КАЖДОЕ СЛОВО?",
        "lab.lmTokensHint": "Ярко — модель ожидала это слово. Тускло — сюрприз. Пунктир — слово, которого она никогда не видела.",
        "lab.lmTokensEmpty": "Начни печатать — и увидишь свой текст глазами модели.",
        "lab.lmTokenNew": "новое",
        "lab.lmStatsTitle": "ЧТО ОНА ЗНАЕТ",
        "lab.pluralSentences": "предложение|предложения|предложений",
        "lab.pluralWords": "разное слово|разных слова|разных слов",
        "lab.pluralPairs": "пара слов|пары слов|пар слов",
        "lab.pluralTriples": "тройка слов|тройки слов|троек слов",
        "lab.lmTeachTitle": "НАУЧИ НОВОЙ ФРАЗЕ",
        "lab.lmTeachLabel": "Твоё предложение",
        "lab.lmTeachPlaceholder": "например: Мой кот любит спать на клавиатуре",
        "lab.lmTeachButton": "Научить",
        "lab.lmTeachCount": "Твоих предложений в модели: {n}",
        "lab.lmTeachNone": "Модель знает только то, что прочитала. Добавь предложение — и она сразу его выучит.",
        "lab.lmTeachForget": "Забыть мои",
        "lab.lmTeachError": "Напиши хотя бы два слова.",
        "lab.lmTeachToast": "Запомнила! Теперь напечатай начало своей фразы.",
        "lab.lmTeachForgot": "Твои предложения забыты",
        "lab.lmTeachFull": "Память заполнена: сначала забудь свои предложения",
        "lab.lmUnknown": "Я не знаю большинства этих слов, поэтому могу предложить только частые. Попробуй готовое начало!",
        "lab.lmSrTop": "Лучший вариант: {word}, {pct}.",
        "lab.lmSrDone": "Текст дописан.",
        "lab.lmExplainTitle": "Как это работает?",
        "lab.lmExplain1Title": "Считает",
        "lab.lmExplain1Text": "Модель прочитала небольшой набор простых предложений и посчитала, какое слово шло после каждого слова и каждой <strong>пары</strong> слов.",
        "lab.lmExplain2Title": "Смотрит назад",
        "lab.lmExplain2Text": "Чтобы угадать, она смотрит на два последних слова. Если такая пара ей не встречалась, она <strong>отступает</strong> и смотрит только на последнее слово.",
        "lab.lmExplain3Title": "Выбирает слово",
        "lab.lmExplain3Text": "Каждое возможное слово получает вероятность. При низкой креативности модель всегда берёт самое вероятное слово, а при высокой бросает «взвешенный кубик» — и шанс получают даже редкие слова.",
        "lab.lmRealTitle": "Как ChatGPT… только намного меньше",
        "lab.lmRealText": "Настоящие чат-боты работают по той же идее: снова и снова предсказывают следующее слово (точнее, следующий <strong>токен</strong> — слово или кусочек слова). Но они используют огромные нейросети, обученные на миллиардах предложений, и смотрят на тысячи предыдущих слов, а не на два. Наша модель крошечная, поэтому часто говорит глупости и знает только те предложения, которые ей дали.",

        "lab.cmdGroup": "AI-лаборатория",
        "lab.cmdNN": "Обучи машину: тренируй нейросеть",
        "lab.cmdLM": "Предсказатель слов: мини языковая модель"
    }
});

/* =========================================================
   2. SMALL HELPERS
   ========================================================= */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Picks the right word form for a number.
// English: "dot|dots". Russian: "точка|точки|точек" (1 / 2-4 / 5+).
function plural(n, key) {
    const forms = t(key).split("|");
    if (AIC.lang === "ru") {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11) return forms[0];
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
        return forms[2] || forms[1];
    }
    return n === 1 ? forms[0] : forms[1];
}

// Numbers in the style of the current language ("0.25" or "0,25")
const numberFormats = {};
function fmt(value, digits) {
    const id = AIC.lang + digits;
    if (!numberFormats[id]) {
        numberFormats[id] = new Intl.NumberFormat(AIC.lang === "ru" ? "ru-RU" : "en-US", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }
    return numberFormats[id].format(value);
}

function percent(p) {
    if (p > 0 && p < 0.01) return "<1%";
    return Math.round(p * 100) + "%";
}

function quote(word) {
    return t("lab.q", { w: word });
}

// Big decorative animations are skipped in reduced-motion and calm mode
function calmMode() {
    return AIC.reducedMotion || Boolean(AIC.effects && AIC.effects.calm) ||
        document.documentElement.classList.contains("fx-calm");
}

function announce(region, text) {
    if (!region) return;
    // A tiny change makes screen readers repeat the same sentence too
    region.textContent = region.textContent === text ? text + " " : text;
}

// "#9b6dff", "155, 109, 255" or "rgb(1, 2, 3)" -> [r, g, b]
function toRGB(value, fallback) {
    value = (value || "").trim();
    let match = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (match) {
        let hex = match[1];
        if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
        return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
    }
    match = value.match(/(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/);
    if (match) return [Number(match[1]), Number(match[2]), Number(match[3])];
    return fallback;
}

function rgba(color, alpha) {
    return "rgba(" + Math.round(color[0]) + "," + Math.round(color[1]) + "," + Math.round(color[2]) + "," + alpha + ")";
}

// All canvas colours come from the CSS variables, so both themes work
let colors = {};
function readColors() {
    colors = {
        a: toRGB(AIC.cssVar("--accent-rgb"), [155, 109, 255]),
        b: toRGB(AIC.cssVar("--accent-2-rgb"), [80, 227, 255]),
        pink: toRGB(AIC.cssVar("--accent-3-rgb"), [255, 106, 213]),
        base: toRGB(AIC.cssVar("--surface-solid"), [16, 22, 42]),
        text: toRGB(AIC.cssVar("--text"), [238, 241, 255]),
        dim: toRGB(AIC.cssVar("--text-dim"), [125, 137, 168]),
        danger: toRGB(AIC.cssVar("--danger"), [255, 92, 122]),
        light: document.documentElement.getAttribute("data-theme") === "light"
    };
    colors.mono = AIC.cssVar("--font-mono") || "monospace";
}

// Gives a canvas a sharp backing size (device pixel ratio capped at 2)
function fitCanvas(canvas, width, height) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(width * dpr));
    const h = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }
    return dpr;
}

function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// A random number with a bell-curve shape (for natural-looking clusters)
function randomNormal() {
    let u = 0;
    while (u === 0) u = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

const icons = {
    play: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>',
    step: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 5.5v13l9-6.5z" fill="currentColor"/><rect x="16" y="5.5" width="2.6" height="13" rx="1" fill="currentColor"/></svg>',
    reset: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.1-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4.5 3.5v4.5H9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    undo: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 7H4.5V2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 7a8 8 0 1 1-1 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z" fill="currentColor"/><circle cx="19" cy="19" r="1.6" fill="currentColor"/></svg>',
    stop: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    clusters: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="7" cy="8" r="2.2" class="lab-ic-a"/><circle cx="9.5" cy="5" r="1.6" class="lab-ic-a"/><circle cx="17" cy="16" r="2.2" class="lab-ic-b"/><circle cx="14.5" cy="19" r="1.6" class="lab-ic-b"/></svg>',
    circle: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" class="lab-ic-b-stroke" stroke-width="2.4" stroke-dasharray="3 2.6"/><circle cx="12" cy="12" r="3" class="lab-ic-a"/></svg>',
    xor: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2" class="lab-ic-a"/><rect x="13" y="13" width="8" height="8" rx="2" class="lab-ic-a"/><rect x="13" y="3" width="8" height="8" rx="2" class="lab-ic-b"/><rect x="3" y="13" width="8" height="8" rx="2" class="lab-ic-b"/></svg>',
    spiral: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 12c0-1.5 2-1.5 2 0s-1.6 3-3.5 3S7 13 7 11s2-5 5-5 6 2 6 6-3 7.5-7 7.5" fill="none" class="lab-ic-a-stroke" stroke-width="2.2" stroke-linecap="round"/></svg>'
};

/* =========================================================
   3. THE LAB CARD AND ITS TWO TABS
   ========================================================= */
const TABS = ["classifier", "predictor"];

mount.innerHTML =
    '<div class="lab card" data-reveal>' +
        '<span class="lab-corners" aria-hidden="true"></span>' +
        '<div class="lab-top">' +
            '<div class="lab-tabs" role="tablist" data-active="classifier" data-i18n-attr="aria-label:lab.tablistLabel">' +
                '<span class="lab-tab-glow" aria-hidden="true"></span>' +
                tabButton("classifier", "🧠", "lab.tabNN", "lab.tabNNSub") +
                tabButton("predictor", "💬", "lab.tabLM", "lab.tabLMSub") +
            '</div>' +
            '<p class="lab-live mono"><span class="lab-live-dot" aria-hidden="true"></span><span data-i18n="lab.live"></span></p>' +
        '</div>' +
        '<div class="lab-panel" role="tabpanel" id="lab-panel-classifier" aria-labelledby="lab-tab-classifier" data-panel="classifier">' +
            classifierHTML() +
        '</div>' +
        '<div class="lab-panel" role="tabpanel" id="lab-panel-predictor" aria-labelledby="lab-tab-predictor" data-panel="predictor" hidden>' +
            predictorHTML() +
        '</div>' +
    '</div>';

function tabButton(name, icon, titleKey, subKey) {
    return '<button type="button" class="lab-tab" role="tab" id="lab-tab-' + name + '" aria-controls="lab-panel-' + name + '" data-tab="' + name + '">' +
        '<span class="lab-tab-icon" aria-hidden="true">' + icon + '</span>' +
        '<span class="lab-tab-text"><span class="lab-tab-title" data-i18n="' + titleKey + '"></span>' +
        '<span class="lab-tab-sub mono" data-i18n="' + subKey + '"></span></span>' +
    '</button>';
}

function classifierHTML() {
    const lrOptions = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1].map((value) =>
        '<option value="' + value + '">' + value + '</option>').join("");

    const steps = [1, 2, 3, 4].map((n) =>
        '<li class="lab-step-card">' +
            '<span class="lab-step-num mono" aria-hidden="true">0' + n + '</span>' +
            '<h4 data-i18n="lab.explain' + n + 'Title"></h4>' +
            '<p data-i18n="lab.explain' + n + 'Text"></p>' +
        '</li>').join("");

    const tips = [1, 2, 3, 4].map((n) => '<li data-i18n="lab.tip' + n + '"></li>').join("");

    return '<div class="lab-nn">' +
        // ----- Left: the board -----
        '<div class="lab-nn-stage">' +
            '<div class="lab-toolbar">' +
                '<div class="lab-classpick" role="group" data-i18n-attr="aria-label:lab.classGroup">' +
                    '<button type="button" class="lab-class lab-class-a" data-class="0" aria-pressed="true">' +
                        '<span class="lab-dot lab-dot-a" aria-hidden="true"></span><span data-i18n="lab.classA"></span>' +
                    '</button>' +
                    '<button type="button" class="lab-class lab-class-b" data-class="1" aria-pressed="false">' +
                        '<span class="lab-dot lab-dot-b" aria-hidden="true"></span><span data-i18n="lab.classB"></span>' +
                    '</button>' +
                '</div>' +
                '<div class="lab-edit">' +
                    '<button type="button" class="lab-tool" data-action="undo" data-i18n-attr="aria-label:lab.undoLabel,title:lab.undoLabel">' + icons.undo + '<span data-i18n="lab.undo"></span></button>' +
                    '<button type="button" class="lab-tool" data-action="clear" data-i18n-attr="aria-label:lab.clearLabel,title:lab.clearLabel">' + icons.trash + '<span data-i18n="lab.clear"></span></button>' +
                '</div>' +
            '</div>' +
            '<div class="lab-board" tabindex="0" role="application" data-i18n-attr="aria-label:lab.boardLabel">' +
                '<canvas class="lab-board-canvas" aria-hidden="true"></canvas>' +
                '<span class="lab-board-corners" aria-hidden="true"></span>' +
                '<span class="lab-scan" aria-hidden="true"></span>' +
                '<div class="lab-board-empty" aria-hidden="true">' +
                    '<span class="lab-empty-icon">✦</span>' +
                    '<strong data-i18n="lab.emptyTitle"></strong>' +
                    '<span class="lab-hint-mouse" data-i18n="lab.emptyText"></span>' +
                    '<span class="lab-hint-touch" data-i18n="lab.emptyTextTouch"></span>' +
                '</div>' +
                '<div class="lab-readout mono" aria-hidden="true" hidden></div>' +
            '</div>' +
            '<div class="lab-presets" role="group" aria-labelledby="lab-presets-title">' +
                '<span class="lab-mini-label mono" id="lab-presets-title" data-i18n="lab.presetsLabel"></span>' +
                ["clusters", "circle", "xor", "spiral"].map((name) =>
                    '<button type="button" class="chip lab-preset" data-preset="' + name + '">' + icons[name] +
                    '<span data-i18n="lab.preset' + name.charAt(0).toUpperCase() + name.slice(1) + '"></span></button>').join("") +
            '</div>' +
            '<ul class="lab-legend">' +
                '<li><span class="lab-dot lab-dot-a" aria-hidden="true"></span><span data-i18n="lab.classA"></span></li>' +
                '<li><span class="lab-dot lab-dot-b" aria-hidden="true"></span><span data-i18n="lab.classB"></span></li>' +
                '<li><span class="lab-legend-line" aria-hidden="true"></span><span data-i18n="lab.legendBoundary"></span></li>' +
                '<li><span class="lab-legend-ring" aria-hidden="true"></span><span data-i18n="lab.legendWrong"></span></li>' +
            '</ul>' +
            '<p class="lab-hint"><span class="lab-hint-mouse" data-i18n="lab.hintMouse"></span><span class="lab-hint-touch" data-i18n="lab.hintTouch"></span></p>' +
        '</div>' +

        // ----- Right: buttons, stats, settings and the network diagram -----
        '<div class="lab-nn-side">' +
            '<div class="lab-run">' +
                '<button type="button" class="btn btn-primary lab-train" data-action="train" aria-pressed="false">' +
                    '<span class="lab-train-icon"></span><span class="lab-train-text"></span>' +
                '</button>' +
                '<button type="button" class="btn btn-ghost" data-action="step" data-i18n-attr="title:lab.stepLabel">' + icons.step + '<span data-i18n="lab.step"></span></button>' +
                '<button type="button" class="btn btn-ghost" data-action="reset" data-i18n-attr="title:lab.resetLabel">' + icons.reset + '<span data-i18n="lab.reset"></span></button>' +
            '</div>' +

            '<div class="lab-box lab-statbox">' +
                '<div class="lab-box-head">' +
                    '<span class="lab-mini-label mono" data-i18n="lab.statsTitle"></span>' +
                    '<span class="lab-status mono" data-status="ready"><span class="lab-status-dot" aria-hidden="true"></span><span class="lab-status-text"></span></span>' +
                '</div>' +
                '<dl class="lab-stats">' +
                    '<div class="lab-stat"><dt class="mono" data-i18n="lab.statEpoch"></dt><dd class="mono" data-stat="epoch">0</dd></div>' +
                    '<div class="lab-stat"><dt class="mono" data-i18n="lab.statLoss"></dt><dd class="mono" data-stat="loss">—</dd></div>' +
                    '<div class="lab-stat"><dt class="mono" data-i18n="lab.statAccuracy"></dt><dd class="mono" data-stat="acc">—</dd>' +
                        '<span class="lab-acc-bar" aria-hidden="true"><span data-stat="accbar"></span></span></div>' +
                    '<div class="lab-stat"><dt class="mono" data-i18n="lab.statPoints"></dt><dd class="mono" data-stat="points">0</dd>' +
                        '<span class="lab-stat-sub mono" data-stat="split"></span></div>' +
                '</dl>' +
                '<div class="lab-chart">' +
                    '<div class="lab-chart-head"><span class="lab-mini-label mono" data-i18n="lab.chartTitle"></span></div>' +
                    '<div class="lab-chart-wrap">' +
                        '<canvas class="lab-chart-canvas" role="img"></canvas>' +
                        '<span class="lab-chart-empty" data-i18n="lab.chartEmpty"></span>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="lab-box lab-settings">' +
                '<div class="lab-box-head"><span class="lab-mini-label mono" data-i18n="lab.settings"></span></div>' +
                '<div class="lab-fields">' +
                    '<div class="lab-field">' +
                        '<label for="lab-lr" data-i18n="lab.lr"></label>' +
                        '<span class="lab-select"><select id="lab-lr" aria-describedby="lab-lr-hint">' + lrOptions + '</select></span>' +
                        '<small id="lab-lr-hint" data-i18n="lab.lrHint"></small>' +
                    '</div>' +
                    '<div class="lab-field">' +
                        '<label for="lab-opt" data-i18n="lab.optimizer"></label>' +
                        '<span class="lab-select"><select id="lab-opt" aria-describedby="lab-opt-hint">' +
                            '<option value="adam" data-i18n="lab.optAdam"></option>' +
                            '<option value="sgd" data-i18n="lab.optSgd"></option>' +
                        '</select></span>' +
                        '<small id="lab-opt-hint" data-i18n="lab.optHint"></small>' +
                    '</div>' +
                    '<div class="lab-field lab-field-wide">' +
                        '<div class="lab-range-head">' +
                            '<label for="lab-neurons" data-i18n="lab.neurons"></label>' +
                            '<output class="lab-range-value mono" for="lab-neurons" data-out="neurons">8</output>' +
                        '</div>' +
                        '<input type="range" id="lab-neurons" class="lab-range" min="2" max="16" step="1" value="8" aria-describedby="lab-neurons-hint">' +
                        '<small id="lab-neurons-hint" data-i18n="lab.neuronsHint"></small>' +
                    '</div>' +
                    '<div class="lab-field">' +
                        '<span class="lab-field-label" id="lab-speed-label" data-i18n="lab.speed"></span>' +
                        '<div class="lab-seg" role="group" aria-labelledby="lab-speed-label">' +
                            '<button type="button" data-speed="slow" aria-pressed="false" data-i18n="lab.speedSlow"></button>' +
                            '<button type="button" data-speed="normal" aria-pressed="true" data-i18n="lab.speedNormal"></button>' +
                            '<button type="button" data-speed="fast" aria-pressed="false" data-i18n="lab.speedFast"></button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="lab-field">' +
                        '<span class="lab-field-label" aria-hidden="true">&nbsp;</span>' +
                        '<button type="button" class="lab-switch" role="switch" aria-checked="false" aria-describedby="lab-layer-hint">' +
                            '<span class="lab-switch-track" aria-hidden="true"><span class="lab-switch-knob"></span></span>' +
                            '<span data-i18n="lab.layer2"></span>' +
                        '</button>' +
                        '<small id="lab-layer-hint" data-i18n="lab.layer2Hint"></small>' +
                    '</div>' +
                '</div>' +
            '</div>' +

        '</div>' +

        // ----- Full width: the live network diagram -----
        '<div class="lab-box lab-diagram">' +
            '<div class="lab-box-head">' +
                '<span class="lab-mini-label mono" data-i18n="lab.diagramTitle"></span>' +
                '<span class="lab-params mono" data-out="params"></span>' +
            '</div>' +
            '<div class="lab-diagram-body">' +
                '<div class="lab-diagram-wrap"><canvas class="lab-diagram-canvas" role="img"></canvas></div>' +
                '<div class="lab-diagram-info">' +
                    '<p data-i18n="lab.diagramHow"></p>' +
                    '<p class="lab-diagram-legend">' +
                        '<span><span class="lab-wline lab-wline-pos" aria-hidden="true"></span><span data-i18n="lab.legendPos"></span></span>' +
                        '<span><span class="lab-wline lab-wline-neg" aria-hidden="true"></span><span data-i18n="lab.legendNeg"></span></span>' +
                    '</p>' +
                '</div>' +
            '</div>' +
        '</div>' +

        // ----- Below: the explanation -----
        '<section class="lab-explain" aria-labelledby="lab-explain-nn">' +
            '<h3 class="lab-explain-title" id="lab-explain-nn"><span class="lab-explain-icon" aria-hidden="true">?</span><span data-i18n="lab.explainTitle"></span></h3>' +
            '<ol class="lab-steps">' + steps + '</ol>' +
            '<div class="lab-tips">' +
                '<p class="lab-mini-label mono" data-i18n="lab.tipsTitle"></p>' +
                '<ul>' + tips + '</ul>' +
            '</div>' +
            '<p class="lab-hood" data-i18n="lab.underHood"></p>' +
        '</section>' +
        '<p class="sr-only" aria-live="polite" data-live="nn"></p>' +
    '</div>';
}

function predictorHTML() {
    const starters = [1, 2, 3, 4, 5].map((n) =>
        '<button type="button" class="chip lab-starter" data-starter="' + n + '" data-i18n="lab.lmStarter' + n + '"></button>').join("");

    const candidates = [0, 1, 2, 3, 4].map((i) =>
        '<li class="lab-cand-item" hidden>' +
            '<button type="button" class="lab-cand" data-index="' + i + '">' +
                '<span class="lab-cand-fill" aria-hidden="true"></span>' +
                '<span class="lab-cand-pick" aria-hidden="true"></span>' +
                '<span class="lab-cand-rank mono" aria-hidden="true">' + (i + 1) + '</span>' +
                '<span class="lab-cand-word"></span>' +
                '<span class="lab-cand-pct mono"></span>' +
            '</button>' +
        '</li>').join("");

    const steps = [1, 2, 3].map((n) =>
        '<li class="lab-step-card">' +
            '<span class="lab-step-num mono" aria-hidden="true">0' + n + '</span>' +
            '<h4 data-i18n="lab.lmExplain' + n + 'Title"></h4>' +
            '<p data-i18n="lab.lmExplain' + n + 'Text"></p>' +
        '</li>').join("");

    const stats = ["sentences", "words", "pairs", "triples"].map((name) =>
        '<div class="lab-lm-stat"><strong class="mono" data-lmstat="' + name + '">0</strong><span data-lmstat-label="' + name + '"></span></div>').join("");

    return '<div class="lab-lm">' +
        '<div class="lab-lm-main">' +
            '<label class="lab-lm-label" for="lab-lm-input" data-i18n="lab.lmPromptLabel"></label>' +
            '<div class="lab-lm-field">' +
                '<textarea id="lab-lm-input" class="lab-lm-input" rows="3" maxlength="400" spellcheck="false" autocomplete="off" autocapitalize="sentences" data-i18n-attr="placeholder:lab.lmPlaceholder"></textarea>' +
                '<button type="button" class="lab-lm-clear" data-i18n-attr="aria-label:lab.lmClear,title:lab.lmClear">' + icons.close + '</button>' +
            '</div>' +
            '<div class="lab-starters" role="group" aria-labelledby="lab-starters-title">' +
                '<span class="lab-mini-label mono" id="lab-starters-title" data-i18n="lab.lmStarters"></span>' +
                starters +
            '</div>' +
            '<p class="lab-lm-notice" hidden><span data-i18n="lab.lmUnknown"></span></p>' +
            '<div class="lab-box lab-predict">' +
                '<div class="lab-box-head">' +
                    '<span class="lab-mini-label mono" data-lm="mode"></span>' +
                '</div>' +
                '<p class="lab-lm-context" data-lm="context"></p>' +
                '<ol class="lab-cands">' + candidates + '</ol>' +
                '<p class="lab-cands-legend" data-i18n="lab.lmLegend"></p>' +
            '</div>' +
            '<div class="lab-lm-controls">' +
                '<button type="button" class="btn btn-primary lab-auto" data-action="auto" aria-describedby="lab-auto-hint">' +
                    '<span class="lab-auto-icon"></span><span class="lab-auto-text"></span>' +
                '</button>' +
                '<span class="sr-only" id="lab-auto-hint" data-i18n="lab.lmAutoLabel"></span>' +
                '<div class="lab-temp">' +
                    '<div class="lab-range-head">' +
                        '<label for="lab-temp" data-i18n="lab.lmTemp"></label>' +
                        '<output class="lab-range-value mono" for="lab-temp" data-out="temp"></output>' +
                    '</div>' +
                    '<input type="range" id="lab-temp" class="lab-range lab-range-temp" min="0" max="2" step="0.1" value="0.7">' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<div class="lab-lm-side">' +
            '<section class="lab-box lab-tokens-box" aria-labelledby="lab-tokens-title">' +
                '<div class="lab-box-head"><h3 class="lab-mini-label mono" id="lab-tokens-title" data-i18n="lab.lmTokensTitle"></h3></div>' +
                '<div class="lab-tokens" data-lm="tokens"></div>' +
                '<p class="lab-box-note" data-i18n="lab.lmTokensHint"></p>' +
            '</section>' +
            '<section class="lab-box" aria-labelledby="lab-knows-title">' +
                '<div class="lab-box-head"><h3 class="lab-mini-label mono" id="lab-knows-title" data-i18n="lab.lmStatsTitle"></h3></div>' +
                '<div class="lab-lm-stats">' + stats + '</div>' +
            '</section>' +
            '<section class="lab-box" aria-labelledby="lab-teach-title">' +
                '<div class="lab-box-head"><h3 class="lab-mini-label mono" id="lab-teach-title" data-i18n="lab.lmTeachTitle"></h3></div>' +
                '<form class="lab-teach" novalidate>' +
                    '<label class="sr-only" for="lab-teach-input" data-i18n="lab.lmTeachLabel"></label>' +
                    '<input type="text" id="lab-teach-input" class="lab-teach-input" maxlength="140" autocomplete="off" aria-describedby="lab-teach-status" data-i18n-attr="placeholder:lab.lmTeachPlaceholder">' +
                    '<button type="submit" class="btn btn-ghost btn-small lab-teach-btn" data-i18n="lab.lmTeachButton"></button>' +
                '</form>' +
                '<p class="lab-teach-status" id="lab-teach-status" aria-live="polite"></p>' +
                '<button type="button" class="lab-link-btn" data-action="forget" hidden data-i18n="lab.lmTeachForget"></button>' +
            '</section>' +
        '</div>' +

        '<section class="lab-explain" aria-labelledby="lab-explain-lm">' +
            '<h3 class="lab-explain-title" id="lab-explain-lm"><span class="lab-explain-icon" aria-hidden="true">?</span><span data-i18n="lab.lmExplainTitle"></span></h3>' +
            '<ol class="lab-steps lab-steps-3">' + steps + '</ol>' +
            '<div class="lab-real">' +
                '<span class="lab-real-icon" aria-hidden="true">🤖</span>' +
                '<div><h4 data-i18n="lab.lmRealTitle"></h4><p data-i18n="lab.lmRealText"></p></div>' +
            '</div>' +
        '</section>' +
        '<p class="sr-only" aria-live="polite" data-live="lm"></p>' +
    '</div>';
}

// Shortcuts to elements inside the lab
const labCard = mount.querySelector(".lab");
const $ = (selector) => mount.querySelector(selector);
const $$ = (selector) => Array.prototype.slice.call(mount.querySelectorAll(selector));

/* =========================================================
   4. NEURAL NETWORK: THE MATH
   2 inputs (x, y) -> hidden layer(s) with tanh -> 1 output with sigmoid.
   The output is the probability that a spot belongs to class B.
   ========================================================= */
const MAX_POINTS = 400;
const SPEEDS = { slow: 0.34, normal: 2, fast: 8 };   // training steps per frame
const savedSettings = AIC.storage.get("lab.nn", {}) || {};

const settings = {
    lr: [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1].indexOf(savedSettings.lr) >= 0 ? savedSettings.lr : 0.03,
    optimizer: savedSettings.optimizer === "sgd" ? "sgd" : "adam",
    speed: SPEEDS[savedSettings.speed] ? savedSettings.speed : "normal",
    hidden: clamp(Math.round(Number(savedSettings.hidden) || 8), 2, 16),
    twoLayers: savedSettings.twoLayers === true
};

function saveSettings() {
    AIC.storage.set("lab.nn", settings);
}

// Builds a network with small random weights
function createNetwork() {
    const sizes = settings.twoLayers ? [2, settings.hidden, settings.hidden, 1] : [2, settings.hidden, 1];
    const layers = [];
    for (let l = 1; l < sizes.length; l++) {
        const nIn = sizes[l - 1];
        const nOut = sizes[l];
        const count = nIn * nOut;
        const layer = {
            nIn: nIn,
            nOut: nOut,
            W: new Float64Array(count),        // weights: W[j * nIn + i] connects input i to neuron j
            b: new Float64Array(nOut),         // biases
            gW: new Float64Array(count),       // gradients (how to change each weight)
            gb: new Float64Array(nOut),
            mW: new Float64Array(count),       // optimizer memory
            vW: new Float64Array(count),
            mb: new Float64Array(nOut),
            vb: new Float64Array(nOut),
            a: new Float64Array(nOut),         // the neurons' outputs ("activations")
            d: new Float64Array(nOut)          // the neurons' share of the error
        };
        const scale = Math.sqrt(1 / nIn);
        for (let i = 0; i < count; i++) layer.W[i] = randomNormal() * scale;
        layers.push(layer);
    }
    return { sizes: sizes, layers: layers, t: 0 };
}

function countParams(net) {
    return net.layers.reduce((sum, layer) => sum + layer.W.length + layer.b.length, 0);
}

// Forward pass: send (x, y) through the network and get P(class B)
const inputs = new Float64Array(2);

function forward(net, x, y) {
    inputs[0] = x;
    inputs[1] = y;
    const layers = net.layers;
    const last = layers.length - 1;
    let previous = inputs;
    for (let l = 0; l <= last; l++) {
        const layer = layers[l];
        const W = layer.W;
        const nIn = layer.nIn;
        for (let j = 0; j < layer.nOut; j++) {
            let z = layer.b[j];
            const row = j * nIn;
            for (let i = 0; i < nIn; i++) z += W[row + i] * previous[i];
            layer.a[j] = l === last ? 1 / (1 + Math.exp(-z)) : Math.tanh(z);
        }
        previous = layer.a;
    }
    return layers[last].a[0];
}

// One epoch: look at every dot, measure the error (binary cross-entropy),
// work out how each weight should change (backpropagation), then change it.
function trainStep() {
    const net = nn.net;
    const points = nn.points;
    const layers = net.layers;
    const last = layers.length - 1;
    if (!points.length) return null;

    layers.forEach((layer) => {
        layer.gW.fill(0);
        layer.gb.fill(0);
    });

    let loss = 0;
    for (let k = 0; k < points.length; k++) {
        const point = points[k];
        const out = forward(net, point.x, point.y);
        const safe = clamp(out, 1e-7, 1 - 1e-7);
        loss -= point.label === 1 ? Math.log(safe) : Math.log(1 - safe);

        // With sigmoid + cross-entropy the output error is simply (guess - answer)
        layers[last].d[0] = out - point.label;

        // Go backwards through the layers
        for (let l = last; l >= 0; l--) {
            const layer = layers[l];
            const previous = l === 0 ? inputs : layers[l - 1].a;
            const nIn = layer.nIn;
            for (let j = 0; j < layer.nOut; j++) {
                const delta = layer.d[j];
                const row = j * nIn;
                layer.gb[j] += delta;
                for (let i = 0; i < nIn; i++) layer.gW[row + i] += delta * previous[i];
            }
            if (l > 0) {
                const below = layers[l - 1];
                for (let i = 0; i < nIn; i++) {
                    let sum = 0;
                    for (let j = 0; j < layer.nOut; j++) sum += layer.W[j * nIn + i] * layer.d[j];
                    below.d[i] = sum * (1 - below.a[i] * below.a[i]);   // tanh slope
                }
            }
        }
    }

    applyGradients(net, points.length);
    nn.epoch++;
    loss /= points.length;

    // Safety net: if numbers ever explode, start again with fresh weights
    if (!isFinite(loss)) {
        nn.net = createNetwork();
        return null;
    }
    recordLoss(loss);
    return loss;
}

// The optimizer decides how far to move each weight
function applyGradients(net, count) {
    const lr = settings.lr;
    net.t++;

    if (settings.optimizer === "adam") {
        // Adam: keeps a running average of the gradient and of its size
        const beta1 = 0.9;
        const beta2 = 0.999;
        const fix1 = 1 - Math.pow(beta1, net.t);
        const fix2 = 1 - Math.pow(beta2, net.t);
        const adam = (w, g, m, v) => {
            for (let i = 0; i < w.length; i++) {
                const grad = g[i] / count;
                m[i] = beta1 * m[i] + (1 - beta1) * grad;
                v[i] = beta2 * v[i] + (1 - beta2) * grad * grad;
                w[i] -= lr * (m[i] / fix1) / (Math.sqrt(v[i] / fix2) + 1e-8);
            }
        };
        net.layers.forEach((layer) => {
            adam(layer.W, layer.gW, layer.mW, layer.vW);
            adam(layer.b, layer.gb, layer.mb, layer.vb);
        });
    } else {
        // SGD with momentum: like a ball rolling downhill that keeps some speed
        const sgd = (w, g, velocity) => {
            for (let i = 0; i < w.length; i++) {
                velocity[i] = 0.9 * velocity[i] - lr * (g[i] / count);
                w[i] += velocity[i];
            }
        };
        net.layers.forEach((layer) => {
            sgd(layer.W, layer.gW, layer.mW);
            sgd(layer.b, layer.gb, layer.mb);
        });
    }
}

function resetOptimizer(net) {
    net.t = 0;
    net.layers.forEach((layer) => {
        layer.mW.fill(0);
        layer.vW.fill(0);
        layer.mb.fill(0);
        layer.vb.fill(0);
    });
}

// ----- Example datasets (coordinates go from -1 to 1) -----
function makePreset(name) {
    const points = [];
    const edge = (value) => clamp(value, -0.96, 0.96);

    if (name === "clusters") {
        for (let i = 0; i < 60; i++) {
            points.push({ x: edge(-0.42 + randomNormal() * 0.17), y: edge(0.38 + randomNormal() * 0.17), label: 0 });
            points.push({ x: edge(0.42 + randomNormal() * 0.17), y: edge(-0.38 + randomNormal() * 0.17), label: 1 });
        }
    } else if (name === "circle") {
        for (let i = 0; i < 70; i++) {
            let angle = Math.random() * Math.PI * 2;
            let radius = Math.sqrt(Math.random()) * 0.4;
            points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle), label: 0 });
            angle = Math.random() * Math.PI * 2;
            radius = 0.62 + Math.random() * 0.3;
            points.push({ x: edge(radius * Math.cos(angle)), y: edge(radius * Math.sin(angle)), label: 1 });
        }
    } else if (name === "xor") {
        while (points.length < 140) {
            const x = Math.random() * 1.86 - 0.93;
            const y = Math.random() * 1.86 - 0.93;
            if (Math.abs(x) < 0.1 || Math.abs(y) < 0.1) continue;
            points.push({ x: x, y: y, label: x * y > 0 ? 0 : 1 });
        }
    } else {
        // Two spirals wound around each other
        const perArm = 80;
        for (let arm = 0; arm < 2; arm++) {
            for (let i = 0; i < perArm; i++) {
                const step = i / perArm;
                const radius = 0.08 + step * 0.84;
                const angle = step * 3.2 * Math.PI + arm * Math.PI;
                points.push({
                    x: edge(radius * Math.cos(angle) + randomNormal() * 0.025),
                    y: edge(radius * Math.sin(angle) + randomNormal() * 0.025),
                    label: arm
                });
            }
        }
    }
    return points;
}

// ----- Everything the classifier remembers -----
const nn = {
    points: [],
    undo: [],
    net: createNetwork(),
    training: false,
    learned: false,          // reached 100% (training pauses by itself)
    epoch: 0,
    loss: null,
    acc: null,
    preds: new Float32Array(0),
    lossHistory: { values: [], stride: 1, counter: 0 },
    selected: 0,             // class of the next dot: 0 = A, 1 = B
    hover: null,             // mouse position on the board
    cursor: null,            // keyboard cursor on the board
    stroke: null,            // mouse "painting" in progress
    tap: null,               // touch tap in progress
    stepBudget: 0,
    lastStats: 0,
    lastAnnounce: 0,
    lastDiagram: 0,
    autoStarted: false,
    dirty: { net: true, board: true, diagram: true, chart: true, stats: true }
};

// Keeps up to 200 loss values; when full it keeps every second one
function recordLoss(loss) {
    const history = nn.lossHistory;
    history.counter++;
    if (history.counter % history.stride !== 0) return;
    history.values.push(loss);
    if (history.values.length > 200) {
        history.values = history.values.filter((value, index) => index % 2 === 0);
        history.stride *= 2;
    }
    nn.dirty.chart = true;
}

function clearLossHistory() {
    nn.lossHistory = { values: [], stride: 1, counter: 0 };
    nn.dirty.chart = true;
}

/* =========================================================
   5. NEURAL NETWORK: DRAWING
   ========================================================= */
const GRID = 50;          // the heatmap is calculated on a 50 x 50 grid, then smoothly scaled up
const MINI = 16;          // each neuron's mini-map is 16 x 16

const heat = {
    canvas: document.createElement("canvas"),
    probs: new Float32Array(GRID * GRID),
    segments: []
};
heat.canvas.width = GRID;
heat.canvas.height = GRID;
heat.ctx = heat.canvas.getContext("2d");
heat.image = heat.ctx.createImageData(GRID, GRID);

const atlas = { canvas: document.createElement("canvas"), columns: 0 };
atlas.ctx = atlas.canvas.getContext("2d");

const board = {
    el: $(".lab-board"),
    canvas: $(".lab-board-canvas"),
    readout: $(".lab-readout"),
    size: 0,
    dpr: 1,
    sprites: null
};
board.ctx = board.canvas.getContext("2d");

const chart = { wrap: $(".lab-chart-wrap"), canvas: $(".lab-chart-canvas"), w: 0, h: 0, dpr: 1 };
chart.ctx = chart.canvas.getContext("2d");

const diagram = { wrap: $(".lab-diagram-wrap"), canvas: $(".lab-diagram-canvas"), w: 0, h: 0, dpr: 1 };
diagram.ctx = diagram.canvas.getContext("2d");

// Colour for a value from -1 (class A, purple) to +1 (class B, cyan)
function paint(data, index, value, strength) {
    const target = value < 0 ? colors.a : colors.b;
    const amount = Math.pow(Math.min(1, Math.abs(value)), 0.85) * strength;
    const base = colors.base;
    data[index] = base[0] + (target[0] - base[0]) * amount;
    data[index + 1] = base[1] + (target[1] - base[1]) * amount;
    data[index + 2] = base[2] + (target[2] - base[2]) * amount;
    data[index + 3] = 255;
}

// Asks the network about every spot of the board, every neuron and every dot
function refreshNetwork() {
    const net = nn.net;
    const data = heat.image.data;
    const strength = colors.light ? 0.5 : 0.62;

    // 1. Big heatmap
    for (let gy = 0; gy < GRID; gy++) {
        const y = 1 - ((gy + 0.5) / GRID) * 2;
        for (let gx = 0; gx < GRID; gx++) {
            const x = ((gx + 0.5) / GRID) * 2 - 1;
            let p = forward(net, x, y);
            if (!(p >= 0 && p <= 1)) p = 0.5;
            const cell = gy * GRID + gx;
            heat.probs[cell] = p;
            paint(data, cell * 4, p * 2 - 1, strength);
        }
    }
    heat.ctx.putImageData(heat.image, 0, 0);
    heat.segments = contour(heat.probs, GRID, 0.5);

    // 2. One mini-map per neuron (inputs, hidden neurons and the output)
    const columns = net.sizes.reduce((sum, n) => sum + n, 0);
    if (atlas.columns !== columns) {
        atlas.columns = columns;
        atlas.canvas.width = columns * MINI;
        atlas.canvas.height = MINI;
        atlas.image = atlas.ctx.createImageData(columns * MINI, MINI);
    }
    const mini = atlas.image.data;
    const rowWidth = columns * MINI;
    const last = net.layers.length - 1;
    for (let gy = 0; gy < MINI; gy++) {
        const y = 1 - ((gy + 0.5) / MINI) * 2;
        for (let gx = 0; gx < MINI; gx++) {
            const x = ((gx + 0.5) / MINI) * 2 - 1;
            forward(net, x, y);
            let column = 0;
            const put = (value) => {
                paint(mini, (gy * rowWidth + column * MINI + gx) * 4, value, 0.85);
                column++;
            };
            put(x);
            put(y);
            for (let l = 0; l <= last; l++) {
                const layer = net.layers[l];
                for (let j = 0; j < layer.nOut; j++) put(l === last ? layer.a[j] * 2 - 1 : layer.a[j]);
            }
        }
    }
    atlas.ctx.putImageData(atlas.image, 0, 0);

    // 3. The network's guess for every dot, the loss and the accuracy
    const points = nn.points;
    if (nn.preds.length !== points.length) nn.preds = new Float32Array(points.length);
    let loss = 0;
    let correct = 0;
    for (let k = 0; k < points.length; k++) {
        const point = points[k];
        const p = forward(net, point.x, point.y);
        nn.preds[k] = p;
        const safe = clamp(p, 1e-7, 1 - 1e-7);
        loss -= point.label === 1 ? Math.log(safe) : Math.log(1 - safe);
        if ((p >= 0.5 ? 1 : 0) === point.label) correct++;
    }
    nn.loss = points.length ? loss / points.length : null;
    nn.acc = points.length ? correct / points.length : null;
}

// "Marching squares": finds the line where the probability is exactly 0.5
function contour(values, size, level) {
    const segments = [];
    const lerp = (a, b) => (level - a) / (b - a);
    for (let j = 0; j < size - 1; j++) {
        for (let i = 0; i < size - 1; i++) {
            const tl = values[j * size + i];
            const tr = values[j * size + i + 1];
            const br = values[(j + 1) * size + i + 1];
            const bl = values[(j + 1) * size + i];
            let code = 0;
            if (tl > level) code |= 8;
            if (tr > level) code |= 4;
            if (br > level) code |= 2;
            if (bl > level) code |= 1;
            if (code === 0 || code === 15) continue;

            const top = [i + lerp(tl, tr), j];
            const right = [i + 1, j + lerp(tr, br)];
            const bottom = [i + lerp(bl, br), j + 1];
            const left = [i, j + lerp(tl, bl)];
            const centre = (tl + tr + br + bl) / 4 > level;
            const add = (p, q) => segments.push(p[0], p[1], q[0], q[1]);

            switch (code) {
                case 1: case 14: add(left, bottom); break;
                case 2: case 13: add(bottom, right); break;
                case 3: case 12: add(left, right); break;
                case 4: case 11: add(top, right); break;
                case 6: case 9: add(top, bottom); break;
                case 7: case 8: add(left, top); break;
                case 5:
                    if (centre) { add(left, top); add(bottom, right); } else { add(top, right); add(left, bottom); }
                    break;
                case 10:
                    if (centre) { add(top, right); add(left, bottom); } else { add(left, top); add(bottom, right); }
                    break;
            }
        }
    }
    return segments;
}

// Converts board coordinates (-1..1) to pixels and back
function toPx(value, size) {
    return ((value + 1) / 2) * size;
}

function toPy(value, size) {
    return (1 - (value + 1) / 2) * size;
}

// Pre-drawn glowing dots: much faster than drawing a glow for every dot every frame
function dotRadius() {
    return clamp(board.size * 0.0115, 3.6, 7);
}

function makeSprites() {
    const r = dotRadius();
    const dpr = board.dpr;
    const make = (color) => {
        const glow = colors.light ? r * 0.7 : r * 1.5;
        const half = r + glow + 2;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = Math.ceil(half * 2 * dpr);
        const g = canvas.getContext("2d");
        g.scale(dpr, dpr);
        const gradient = g.createRadialGradient(half, half, r * 0.6, half, half, half);
        gradient.addColorStop(0, rgba(color, colors.light ? 0.35 : 0.55));
        gradient.addColorStop(1, rgba(color, 0));
        g.fillStyle = gradient;
        g.fillRect(0, 0, half * 2, half * 2);
        g.beginPath();
        g.arc(half, half, r, 0, Math.PI * 2);
        g.fillStyle = rgba(color, 1);
        g.fill();
        g.lineWidth = Math.max(1.2, r * 0.32);
        g.strokeStyle = rgba(colors.base, 0.95);
        g.stroke();
        // a tiny highlight makes the dots look like glass beads
        g.beginPath();
        g.arc(half - r * 0.3, half - r * 0.32, r * 0.32, 0, Math.PI * 2);
        g.fillStyle = "rgba(255,255,255,0.35)";
        g.fill();
        return { canvas: canvas, half: half };
    };
    board.sprites = [make(colors.a), make(colors.b)];
}

function drawBoard() {
    const size = board.size;
    if (!size) return;
    const ctx = board.ctx;
    ctx.setTransform(board.dpr, 0, 0, board.dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // 1. The heatmap: what the network thinks about every spot
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(heat.canvas, 0, 0, size, size);

    // 2. A faint grid, like graph paper
    ctx.lineWidth = 1;
    for (let k = -0.75; k <= 0.76; k += 0.25) {
        const isAxis = Math.abs(k) < 0.01;
        ctx.strokeStyle = rgba(colors.text, isAxis ? (colors.light ? 0.16 : 0.12) : (colors.light ? 0.07 : 0.05));
        const px = Math.round(toPx(k, size)) + 0.5;
        const py = Math.round(toPy(k, size)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, size);
        ctx.moveTo(0, py);
        ctx.lineTo(size, py);
        ctx.stroke();
    }

    // 3. The glowing decision boundary (where the network is 50 / 50)
    const segments = heat.segments;
    if (segments.length) {
        const scale = size / GRID;
        ctx.beginPath();
        for (let s = 0; s < segments.length; s += 4) {
            ctx.moveTo((segments[s] + 0.5) * scale, (segments[s + 1] + 0.5) * scale);
            ctx.lineTo((segments[s + 2] + 0.5) * scale, (segments[s + 3] + 0.5) * scale);
        }
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = rgba(colors.text, colors.light ? 0.12 : 0.16);
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.strokeStyle = rgba(colors.text, colors.light ? 0.75 : 0.9);
        ctx.lineWidth = 1.7;
        ctx.stroke();
    }

    // 4. The dots, with a red ring around the ones the network gets wrong
    const r = dotRadius();
    const points = nn.points;
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = rgba(colors.danger, 0.95);
    ctx.setLineDash([2.5, 2.2]);
    ctx.beginPath();
    for (let k = 0; k < points.length; k++) {
        const point = points[k];
        const guess = nn.preds[k] >= 0.5 ? 1 : 0;
        if (k < nn.preds.length && guess !== point.label) {
            const x = toPx(point.x, size);
            const y = toPy(point.y, size);
            ctx.moveTo(x + r + 3.5, y);
            ctx.arc(x, y, r + 3.5, 0, Math.PI * 2);
        }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    if (board.sprites) {
        for (let k = 0; k < points.length; k++) {
            const point = points[k];
            const sprite = board.sprites[point.label];
            const half = sprite.half;
            ctx.drawImage(sprite.canvas, toPx(point.x, size) - half, toPy(point.y, size) - half, half * 2, half * 2);
        }
    }

    // 5. Where the next dot would go (mouse or keyboard)
    const spot = nn.cursor || nn.hover;
    if (spot && board.sprites) {
        const x = toPx(spot.x, size);
        const y = toPy(spot.y, size);
        const sprite = board.sprites[spot.label];
        ctx.globalAlpha = 0.5;
        ctx.drawImage(sprite.canvas, x - sprite.half, y - sprite.half, sprite.half * 2, sprite.half * 2);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = rgba(colors.text, 0.7);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, r + 8, 0, Math.PI * 2);
        ctx.stroke();

        if (nn.cursor) {
            // keyboard: dashed guides across the board
            ctx.setLineDash([3, 5]);
            ctx.strokeStyle = rgba(colors.text, 0.35);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, y - r - 10);
            ctx.moveTo(x, y + r + 10);
            ctx.lineTo(x, size);
            ctx.moveTo(0, y);
            ctx.lineTo(x - r - 10, y);
            ctx.moveTo(x + r + 10, y);
            ctx.lineTo(size, y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    updateReadout();
}

// Small text in the corner of the board: position and the network's guess there
function updateReadout() {
    const spot = nn.cursor || nn.hover;
    if (!spot) {
        board.readout.hidden = true;
        return;
    }
    const p = forward(nn.net, spot.x, spot.y);
    const isB = p >= 0.5;
    board.readout.hidden = false;
    board.readout.textContent = t("lab.readout", {
        x: fmt(spot.x, 2),
        y: fmt(spot.y, 2),
        cls: isB ? "B" : "A",
        pct: Math.round((isB ? p : 1 - p) * 100)
    });
    board.readout.classList.toggle("is-b", isB);
}

// ----- The loss chart -----
function drawChart() {
    if (!chart.w) return;
    const ctx = chart.ctx;
    const w = chart.w;
    const h = chart.h;
    const values = nn.lossHistory.values;
    ctx.setTransform(chart.dpr, 0, 0, chart.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // faint guide lines
    ctx.strokeStyle = rgba(colors.text, colors.light ? 0.08 : 0.06);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 1; k < 4; k++) {
        const y = Math.round((h * k) / 4) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();

    labCard.querySelector(".lab-chart-empty").hidden = values.length > 1;
    if (values.length < 2) {
        chart.canvas.setAttribute("aria-label", t("lab.chartLabelEmpty"));
        return;
    }

    let max = 0.1;
    for (let i = 0; i < values.length; i++) if (values[i] > max) max = values[i];
    const pad = 5;
    const xAt = (i) => (i / (values.length - 1)) * (w - 8) + 1;
    const yAt = (v) => h - pad - (Math.min(v, max) / max) * (h - pad * 2);

    // area under the line
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(values[0]));
    for (let i = 1; i < values.length; i++) ctx.lineTo(xAt(i), yAt(values[i]));
    ctx.lineTo(xAt(values.length - 1), h);
    ctx.lineTo(xAt(0), h);
    ctx.closePath();
    const fill = ctx.createLinearGradient(0, 0, 0, h);
    fill.addColorStop(0, rgba(colors.a, colors.light ? 0.22 : 0.32));
    fill.addColorStop(1, rgba(colors.a, 0));
    ctx.fillStyle = fill;
    ctx.fill();

    // the line itself
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(values[0]));
    for (let i = 1; i < values.length; i++) ctx.lineTo(xAt(i), yAt(values[i]));
    const stroke = ctx.createLinearGradient(0, 0, w, 0);
    stroke.addColorStop(0, rgba(colors.a, 1));
    stroke.addColorStop(1, rgba(colors.b, 1));
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // a glowing dot at the newest value
    const lastX = xAt(values.length - 1);
    const lastY = yAt(values[values.length - 1]);
    ctx.fillStyle = rgba(colors.b, 0.25);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(colors.b, 1);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2.8, 0, Math.PI * 2);
    ctx.fill();
}

// ----- The live network diagram -----
function drawDiagram() {
    if (!diagram.w) return;
    const ctx = diagram.ctx;
    const w = diagram.w;
    const h = diagram.h;
    const net = nn.net;
    const sizes = net.sizes;
    const columns = sizes.length;
    ctx.setTransform(diagram.dpr, 0, 0, diagram.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Where every neuron goes
    const top = 30;
    const bottom = 8;
    const maxNodes = Math.max.apply(null, sizes);
    const available = h - top - bottom;
    const slot = Math.min(available / maxNodes, 46);
    const node = clamp(slot * 0.74, 10, 30);
    const left = 26;
    const right = 40;
    const xs = sizes.map((n, c) => left + node / 2 + (c * (w - left - right - node)) / (columns - 1));
    const ys = sizes.map((n) => {
        const list = [];
        const start = top + (available - n * slot) / 2 + slot / 2;
        for (let k = 0; k < n; k++) list.push(start + k * slot);
        return list;
    });
    const outputSize = node * 1.3;

    // Connections: colour = sign of the weight, thickness = its size
    ctx.lineCap = "round";
    net.layers.forEach((layer, l) => {
        const x1 = xs[l] + node / 2;
        const x2 = xs[l + 1] - (l + 1 === columns - 1 ? outputSize : node) / 2;
        const mid = (x1 + x2) / 2;
        for (let j = 0; j < layer.nOut; j++) {
            for (let i = 0; i < layer.nIn; i++) {
                const weight = layer.W[j * layer.nIn + i];
                const strength = Math.min(1, Math.abs(weight) / 2.5);
                ctx.strokeStyle = rgba(weight >= 0 ? colors.b : colors.a, 0.12 + strength * 0.75);
                ctx.lineWidth = 0.4 + strength * 4.2;
                ctx.beginPath();
                ctx.moveTo(x1, ys[l][i]);
                ctx.bezierCurveTo(mid, ys[l][i], mid, ys[l + 1][j], x2, ys[l + 1][j]);
                ctx.stroke();
            }
        }
    });

    // Neurons, each showing its own mini-map of what it reacts to
    let atlasColumn = 0;
    sizes.forEach((n, c) => {
        const isOutput = c === columns - 1;
        const s = isOutput ? outputSize : node;
        for (let k = 0; k < n; k++) {
            const x = xs[c] - s / 2;
            const y = ys[c][k] - s / 2;
            ctx.save();
            roundRectPath(ctx, x, y, s, s, Math.min(6, s * 0.25));
            ctx.clip();
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(atlas.canvas, atlasColumn * MINI, 0, MINI, MINI, x, y, s, s);
            ctx.restore();
            roundRectPath(ctx, x, y, s, s, Math.min(6, s * 0.25));
            ctx.strokeStyle = rgba(colors.text, isOutput ? 0.55 : 0.25);
            ctx.lineWidth = isOutput ? 1.5 : 1;
            ctx.stroke();
            atlasColumn++;
        }
    });

    // Labels
    ctx.font = "600 10px " + colors.mono;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rgba(colors.dim, 1);
    sizes.forEach((n, c) => {
        let label;
        if (c === 0) label = t("lab.nnInput");
        else if (c === columns - 1) label = t("lab.nnOutput");
        else label = t("lab.nnHidden", { n: c });
        ctx.fillText(label, clamp(xs[c], 22, w - 22), 12);
    });
    ctx.font = "600 11px " + colors.mono;
    ctx.textAlign = "right";
    ctx.fillStyle = rgba(colors.text, 0.75);
    ctx.fillText("x", xs[0] - node / 2 - 6, ys[0][0]);
    ctx.fillText("y", xs[0] - node / 2 - 6, ys[0][1]);
    ctx.textAlign = "left";
    ctx.fillText(t("lab.nnOutputHint"), xs[columns - 1] + outputSize / 2 + 5, ys[columns - 1][0]);
}

function updateDiagramLabel() {
    const params = countParams(nn.net);
    const hidden = settings.twoLayers ? settings.hidden + " + " + settings.hidden : String(settings.hidden);
    const paramsText = t("lab.params", { n: params, params: plural(params, "lab.pluralParams") });
    $('[data-out="params"]').textContent = paramsText;
    diagram.canvas.setAttribute("aria-label", t("lab.diagramLabel", { hidden: hidden, params: paramsText }));
}

/* =========================================================
   6. NEURAL NETWORK: CONTROLS, STATS AND THE ANIMATION LOOP
   ========================================================= */
const nnLive = $('[data-live="nn"]');
const trainButton = $(".lab-train");
const statEls = {
    epoch: $('[data-stat="epoch"]'),
    loss: $('[data-stat="loss"]'),
    acc: $('[data-stat="acc"]'),
    accBar: $('[data-stat="accbar"]'),
    points: $('[data-stat="points"]'),
    split: $('[data-stat="split"]'),
    status: $(".lab-status"),
    statusText: $(".lab-status-text")
};

let activeTab = "classifier";
let labOnScreen = false;
let pageVisible = !document.hidden;
let frame = 0;

function wantsTraining() {
    return nn.training && labOnScreen && pageVisible && activeTab === "classifier";
}

function schedule() {
    if (!frame) frame = requestAnimationFrame(tick);
}

// The animation loop: train a little, then redraw whatever changed
function tick(now) {
    frame = 0;
    const dirty = nn.dirty;

    if (wantsTraining()) {
        nn.stepBudget += SPEEDS[settings.speed];
        let steps = Math.floor(nn.stepBudget);
        nn.stepBudget -= steps;
        while (steps-- > 0) trainStep();
        dirty.net = true;
    }

    if (dirty.net) {
        refreshNetwork();
        dirty.net = false;
        dirty.board = true;
        dirty.diagram = true;
        dirty.stats = true;
        checkLearned();
    }
    if (dirty.board) {
        drawBoard();
        dirty.board = false;
    }
    // The diagram and the numbers don't need 60 updates a second
    if (dirty.diagram && (!nn.training || now - nn.lastDiagram > 45)) {
        drawDiagram();
        dirty.diagram = false;
        nn.lastDiagram = now;
    }
    if (dirty.chart) {
        drawChart();
        dirty.chart = false;
    }
    if (dirty.stats && (!nn.training || now - nn.lastStats > 110)) {
        updateStats();
        dirty.stats = false;
        nn.lastStats = now;
    }

    // Tell screen-reader users how it's going, but not too often
    if (wantsTraining() && now - nn.lastAnnounce > 6000) {
        nn.lastAnnounce = now;
        announceStats();
    }

    if (wantsTraining() || dirty.diagram || dirty.stats) schedule();
}

function updateStats() {
    const points = nn.points;
    const countB = points.reduce((sum, point) => sum + point.label, 0);
    statEls.epoch.textContent = fmt(nn.epoch, 0);
    statEls.loss.textContent = nn.loss === null ? "—" : fmt(nn.loss, 3);
    statEls.acc.textContent = nn.acc === null ? "—" : Math.round(nn.acc * 100) + "%";
    statEls.accBar.style.transform = "scaleX(" + (nn.acc || 0) + ")";
    statEls.accBar.parentElement.classList.toggle("is-full", nn.acc === 1);
    statEls.points.textContent = fmt(points.length, 0);
    statEls.split.textContent = t("lab.pointsSplit", { a: points.length - countB, b: countB });

    const values = nn.lossHistory.values;
    if (values.length > 1) {
        chart.canvas.setAttribute("aria-label", t("lab.chartLabel", { loss: fmt(values[values.length - 1], 3) }));
    }
    updateStatus();
}

function updateStatus() {
    let status = "ready";
    if (nn.training) status = "training";
    else if (nn.learned) status = "done";
    else if (nn.epoch > 0) status = "paused";
    const keys = { ready: "lab.statusReady", training: "lab.statusTraining", paused: "lab.statusPaused", done: "lab.statusDone" };
    statEls.status.setAttribute("data-status", status);
    statEls.statusText.textContent = t(keys[status]);
    labCard.classList.toggle("is-training", nn.training);
}

function announceStats() {
    if (nn.loss === null) return;
    announce(nnLive, t("lab.srStatus", {
        epoch: fmt(nn.epoch, 0),
        loss: fmt(nn.loss, 3),
        acc: Math.round(nn.acc * 100)
    }));
}

function updateTrainButton() {
    trainButton.querySelector(".lab-train-icon").innerHTML = nn.training ? icons.pause : icons.play;
    trainButton.querySelector(".lab-train-text").textContent = t(nn.training ? "lab.pause" : "lab.train");
    trainButton.setAttribute("aria-pressed", String(nn.training));
    updateStatus();
}

// When every dot is right and the loss is tiny, training pauses by itself
function checkLearned() {
    if (!nn.training || nn.learned || nn.acc !== 1 || nn.loss === null || nn.loss > 0.025) return;
    const hasBoth = nn.points.some((p) => p.label === 0) && nn.points.some((p) => p.label === 1);
    if (!hasBoth) return;
    nn.training = false;
    nn.learned = true;
    updateTrainButton();
    AIC.toast(t("lab.toastLearned", { n: fmt(nn.epoch, 0), epochs: plural(nn.epoch, "lab.pluralEpochs") }), "🎯");
    announceStats();
}

function setTraining(on) {
    if (on && !nn.points.length) {
        AIC.toast(t("lab.toastEmpty"), "✦");
        return;
    }
    if (on && !(nn.points.some((p) => p.label === 0) && nn.points.some((p) => p.label === 1))) {
        AIC.toast(t("lab.toastOneClass"), "⚖️");
    }
    nn.training = on;
    if (on) nn.learned = false;
    updateTrainButton();
    announce(nnLive, t(on ? "lab.srTraining" : "lab.srPaused"));
    schedule();
}

function resetNetwork() {
    nn.net = createNetwork();
    nn.epoch = 0;
    nn.learned = false;
    nn.stepBudget = 0;
    clearLossHistory();
    nn.dirty.net = true;
    updateDiagramLabel();
    updateStatus();
    schedule();
}

// ----- Dots -----
function pushUndo() {
    nn.undo.push(nn.points.slice());
    if (nn.undo.length > 60) nn.undo.shift();
}

function pointsChanged() {
    nn.learned = false;
    nn.dirty.net = true;
    $(".lab-board-empty").hidden = nn.points.length > 0;
    $('[data-action="undo"]').disabled = nn.undo.length === 0;
    $('[data-action="clear"]').disabled = nn.points.length === 0;
    if (!nn.points.length && nn.training) {
        nn.training = false;
        updateTrainButton();
    }
    schedule();
}

function addPoint(x, y, label) {
    if (nn.points.length >= MAX_POINTS) {
        if (!nn.maxWarned) AIC.toast(t("lab.toastMax", { n: MAX_POINTS }), "✋");
        nn.maxWarned = true;
        return false;
    }
    nn.points.push({ x: clamp(x, -1, 1), y: clamp(y, -1, 1), label: label });
    return true;
}

function className(label) {
    return t(label === 1 ? "lab.classB" : "lab.classA");
}

function announceAdded(label) {
    const n = nn.points.length;
    announce(nnLive, t("lab.srAdded", { cls: className(label), n: n, points: plural(n, "lab.pluralPoints") }));
}

function selectClass(label) {
    nn.selected = label;
    $$(".lab-class").forEach((button) => {
        button.setAttribute("aria-pressed", String(Number(button.getAttribute("data-class")) === label));
    });
    if (nn.hover) nn.hover.label = label;
    if (nn.cursor) nn.cursor.label = label;
    nn.dirty.board = true;
    schedule();
}

function loadPreset(name) {
    pushUndo();
    nn.points = makePreset(name);
    nn.maxWarned = false;
    pointsChanged();
    resetNetwork();
    $$(".lab-preset").forEach((chip) => chip.classList.toggle("active", chip.getAttribute("data-preset") === name));
    const n = nn.points.length;
    announce(nnLive, t("lab.srPreset", {
        name: t("lab.preset" + name.charAt(0).toUpperCase() + name.slice(1)),
        n: n,
        points: plural(n, "lab.pluralPoints")
    }));
    setTraining(true);
}

function clearPresetMark() {
    $$(".lab-preset").forEach((chip) => chip.classList.remove("active"));
}

// ----- Mouse, touch and pen on the board -----
function eventToBoard(event) {
    const rect = board.el.getBoundingClientRect();
    return {
        x: clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
        y: clamp(1 - ((event.clientY - rect.top) / rect.height) * 2, -1, 1)
    };
}

function labelFor(event) {
    // Shift-click or right-click adds the other class
    return event.shiftKey || event.button === 2 ? 1 - nn.selected : nn.selected;
}

board.el.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.button !== 2) return;
    const spot = eventToBoard(event);
    const label = labelFor(event);

    if (event.pointerType === "touch") {
        // On phones we wait for the finger to lift, so you can still scroll over the board
        nn.tap = { id: event.pointerId, x: event.clientX, y: event.clientY, spot: spot, label: label };
        return;
    }

    event.preventDefault();
    nn.cursor = null;
    pushUndo();
    clearPresetMark();
    if (addPoint(spot.x, spot.y, label)) announceAdded(label);
    nn.stroke = { id: event.pointerId, last: spot, label: label };
    try {
        board.el.setPointerCapture(event.pointerId);
    } catch (error) {}
    pointsChanged();
});

board.el.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
        if (nn.tap && Math.hypot(event.clientX - nn.tap.x, event.clientY - nn.tap.y) > 10) nn.tap = null;
        return;
    }
    const spot = eventToBoard(event);
    nn.hover = { x: spot.x, y: spot.y, label: nn.stroke ? nn.stroke.label : (event.shiftKey ? 1 - nn.selected : nn.selected) };

    // Hold and drag to paint: a new dot every little while
    if (nn.stroke && nn.stroke.id === event.pointerId) {
        const last = nn.stroke.last;
        if (Math.hypot(spot.x - last.x, spot.y - last.y) > 0.07) {
            if (addPoint(spot.x, spot.y, nn.stroke.label)) {
                nn.stroke.last = spot;
                pointsChanged();
            }
        }
    }
    nn.dirty.board = true;
    schedule();
});

function endPointer(event) {
    if (nn.tap && nn.tap.id === event.pointerId && event.type === "pointerup") {
        const tap = nn.tap;
        nn.tap = null;
        pushUndo();
        clearPresetMark();
        if (addPoint(tap.spot.x, tap.spot.y, tap.label)) announceAdded(tap.label);
        pointsChanged();
    }
    if (event.type === "pointercancel") nn.tap = null;
    if (nn.stroke && nn.stroke.id === event.pointerId) {
        nn.stroke = null;
        if (nn.points.length) announceAdded(nn.points[nn.points.length - 1].label);
    }
}

board.el.addEventListener("pointerup", endPointer);
board.el.addEventListener("pointercancel", endPointer);
board.el.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    nn.hover = null;
    nn.dirty.board = true;
    schedule();
});
board.el.addEventListener("contextmenu", (event) => event.preventDefault());

// ----- Keyboard on the board -----
board.el.addEventListener("focus", () => {
    // Only show the keyboard cursor when the board was reached with the keyboard
    if (board.el.matches(":focus-visible") && !nn.cursor) {
        nn.cursor = { x: 0, y: 0, label: nn.selected };
        nn.dirty.board = true;
        schedule();
    }
});

board.el.addEventListener("blur", () => {
    nn.cursor = null;
    nn.dirty.board = true;
    schedule();
});

board.el.addEventListener("keydown", (event) => {
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if (event.ctrlKey || event.metaKey) {
        if (event.code === "KeyZ") {
            event.preventDefault();
            undo();
        }
        return;
    }
    if (moves[event.key]) {
        event.preventDefault();
        if (!nn.cursor) nn.cursor = { x: 0, y: 0, label: nn.selected };
        const amount = event.shiftKey ? 0.2 : 0.05;
        nn.cursor.x = clamp(nn.cursor.x + moves[event.key][0] * amount, -1, 1);
        nn.cursor.y = clamp(nn.cursor.y + moves[event.key][1] * amount, -1, 1);
        nn.dirty.board = true;
        schedule();
    } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!nn.cursor) nn.cursor = { x: 0, y: 0, label: nn.selected };
        pushUndo();
        clearPresetMark();
        if (addPoint(nn.cursor.x, nn.cursor.y, nn.selected)) announceAdded(nn.selected);
        pointsChanged();
    } else if (event.code === "KeyA" || event.code === "KeyB") {
        event.preventDefault();
        selectClass(event.code === "KeyA" ? 0 : 1);
    } else if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        undo();
    }
});

function undo() {
    if (!nn.undo.length) return;
    nn.points = nn.undo.pop();
    clearPresetMark();
    pointsChanged();
    const n = nn.points.length;
    announce(nnLive, t("lab.srUndo", { n: n, points: plural(n, "lab.pluralPoints") }));
}

// ----- Buttons and settings -----
$$(".lab-class").forEach((button) => {
    button.addEventListener("click", () => selectClass(Number(button.getAttribute("data-class"))));
});

$$(".lab-preset").forEach((chip) => {
    chip.addEventListener("click", () => loadPreset(chip.getAttribute("data-preset")));
});

$('[data-action="undo"]').addEventListener("click", undo);

$('[data-action="clear"]').addEventListener("click", () => {
    if (!nn.points.length) return;
    pushUndo();
    nn.points = [];
    clearPresetMark();
    pointsChanged();
    announce(nnLive, t("lab.srCleared"));
});

trainButton.addEventListener("click", () => setTraining(!nn.training));

$('[data-action="step"]').addEventListener("click", () => {
    if (!nn.points.length) {
        AIC.toast(t("lab.toastEmpty"), "✦");
        return;
    }
    if (nn.training) setTraining(false);
    trainStep();
    nn.dirty.net = true;
    schedule();
    // read out the new numbers once they are calculated
    requestAnimationFrame(() => requestAnimationFrame(announceStats));
});

$('[data-action="reset"]').addEventListener("click", resetNetwork);

const lrSelect = $("#lab-lr");
const optSelect = $("#lab-opt");
const neuronsRange = $("#lab-neurons");
const layerSwitch = $(".lab-switch");

lrSelect.value = String(settings.lr);
optSelect.value = settings.optimizer;
neuronsRange.value = String(settings.hidden);
layerSwitch.setAttribute("aria-checked", String(settings.twoLayers));
$$(".lab-seg button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.getAttribute("data-speed") === settings.speed));
});

lrSelect.addEventListener("change", () => {
    settings.lr = Number(lrSelect.value);
    saveSettings();
});

optSelect.addEventListener("change", () => {
    settings.optimizer = optSelect.value === "sgd" ? "sgd" : "adam";
    resetOptimizer(nn.net);
    saveSettings();
});

function updateRangeFill(range) {
    const min = Number(range.min);
    const max = Number(range.max);
    range.style.setProperty("--fill", (((Number(range.value) - min) / (max - min)) * 100).toFixed(1) + "%");
}

neuronsRange.addEventListener("input", () => {
    settings.hidden = Number(neuronsRange.value);
    $('[data-out="neurons"]').textContent = settings.hidden;
    updateRangeFill(neuronsRange);
    saveSettings();
    resetNetwork();
});

layerSwitch.addEventListener("click", () => {
    settings.twoLayers = !settings.twoLayers;
    layerSwitch.setAttribute("aria-checked", String(settings.twoLayers));
    saveSettings();
    resetNetwork();
});

$$(".lab-seg button").forEach((button) => {
    button.addEventListener("click", () => {
        settings.speed = button.getAttribute("data-speed");
        $$(".lab-seg button").forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
        saveSettings();
    });
});

$('[data-out="neurons"]').textContent = settings.hidden;
updateRangeFill(neuronsRange);

/* =========================================================
   7. NEXT-WORD PREDICTOR
   A word-level "n-gram" language model: it counts which word
   follows each word (bigrams) and each pair of words (trigrams).
   ========================================================= */
const CORPUS = {
    en: [
        "Artificial intelligence can help doctors find diseases early.",
        "Artificial intelligence can learn from examples.",
        "Artificial intelligence can write stories and poems.",
        "Artificial intelligence can make mistakes too.",
        "Artificial intelligence can translate text into many languages.",
        "Artificial intelligence is a tool made by people.",
        "A chatbot predicts the next word in a sentence.",
        "A chatbot can answer questions about history.",
        "A chatbot does not really understand feelings.",
        "Machine learning helps computers learn from data.",
        "Machine learning needs a lot of good data.",
        "A neural network learns by changing its weights.",
        "A neural network is inspired by the human brain.",
        "The robot can clean the floor by itself.",
        "The robot helps people in the factory.",
        "The robot is learning to walk.",
        "The robot can answer questions in many languages.",
        "We should always check what AI tells us.",
        "AI can be wrong, so we check the facts.",
        "AI helps scientists study the weather.",
        "AI can recognise faces in photos.",
        "AI can help us learn new things.",
        "At school we learn maths and science.",
        "At school we have lunch with our friends.",
        "At school we use computers in the lab.",
        "At school we talk about how AI works.",
        "My teacher explains new ideas very clearly.",
        "My teacher gives us interesting homework.",
        "I do my homework after school.",
        "I like science because it is full of surprises.",
        "I like to read books about space.",
        "I like to walk in the forest.",
        "I like to eat pizza with my friends.",
        "I like to eat apples and bananas.",
        "I like to learn new things with my friends.",
        "The students are working on a project about robots.",
        "Our class is learning about artificial intelligence.",
        "We have a test on Friday.",
        "The library is a quiet place to study.",
        "My friends and I play football after school.",
        "My friends and I like to watch funny videos.",
        "My friends and I build robots at the weekend.",
        "My friends and I want to learn about AI.",
        "My best friend is very good at drawing.",
        "My best friend lives next to the park.",
        "We go to the park with our friends.",
        "We like to play games together.",
        "Friends help each other with homework.",
        "I send messages to my friends every day.",
        "My phone has a very good camera.",
        "My phone can recognise my voice.",
        "The computer is very fast.",
        "The internet connects people all over the world.",
        "I use my laptop to make videos.",
        "We use apps to learn new languages.",
        "Video games can be very creative.",
        "Smart speakers can play music and answer questions.",
        "Programming is like giving a computer a recipe.",
        "I want to learn how to code.",
        "I want to build a robot that can talk.",
        "The sun is shining in the sky.",
        "The sun gives energy to plants.",
        "The trees in the park are green.",
        "The birds sing in the morning.",
        "The river flows to the sea.",
        "In winter the trees are covered with snow.",
        "In spring the flowers grow in the garden.",
        "The sky is blue and the weather is nice.",
        "Bees help flowers make seeds.",
        "For breakfast I eat eggs and toast.",
        "For lunch we eat soup and bread.",
        "My mum makes the best pancakes.",
        "We cook dinner together on Sunday.",
        "Pizza is my favourite food.",
        "Fruit and vegetables are good for you.",
        "I drink a glass of water every morning.",
        "The future of artificial intelligence is very exciting.",
        "The future will have many smart robots.",
        "Smart robots can help people at home.",
        "It is important to use AI wisely.",
        "Self-driving cars use cameras to see the road.",
        "We can use AI to learn new languages.",
        "The computer learns from the data we give it.",
        "Learning new things is fun."
    ],
    ru: [
        "Искусственный интеллект может помогать врачам находить болезни.",
        "Искусственный интеллект может учиться на примерах.",
        "Искусственный интеллект может писать стихи и рассказы.",
        "Искусственный интеллект может ошибаться.",
        "Искусственный интеллект может переводить тексты на разные языки.",
        "Искусственный интеллект — это инструмент, который создали люди.",
        "Чат-бот предсказывает следующее слово в предложении.",
        "Чат-бот может отвечать на вопросы по истории.",
        "Чат-бот на самом деле не понимает чувств.",
        "Машинное обучение помогает компьютерам учиться на данных.",
        "Машинному обучению нужно много хороших данных.",
        "Нейросеть учится, меняя свои веса.",
        "Нейросеть немного похожа на человеческий мозг.",
        "Робот умеет сам мыть пол.",
        "Робот помогает людям на заводе.",
        "Робот учится ходить.",
        "Робот может отвечать на вопросы на разных языках.",
        "Нужно всегда проверять, что говорит ИИ.",
        "ИИ может ошибаться, поэтому мы проверяем факты.",
        "ИИ помогает учёным изучать погоду.",
        "ИИ умеет узнавать лица на фотографиях.",
        "ИИ может помочь нам узнавать новое.",
        "В школе мы изучаем математику и физику.",
        "В школе мы обедаем с друзьями.",
        "В школе мы работаем на компьютерах.",
        "В школе мы обсуждаем, как работает ИИ.",
        "Мой учитель очень понятно объясняет новые темы.",
        "Мой учитель задаёт нам интересные домашние задания.",
        "Я делаю домашнее задание после школы.",
        "Я люблю биологию, потому что это очень интересно.",
        "Я люблю читать книги о космосе.",
        "Я люблю гулять в лесу.",
        "Я люблю есть пиццу с друзьями.",
        "Я люблю есть яблоки и бананы.",
        "Я люблю узнавать новое вместе с друзьями.",
        "Ученики делают проект о роботах.",
        "Наш класс изучает искусственный интеллект.",
        "В пятницу у нас контрольная.",
        "В библиотеке тихо и можно спокойно заниматься.",
        "Мы с друзьями играем в футбол после школы.",
        "Мы с друзьями любим смотреть смешные видео.",
        "Мы с друзьями собираем роботов по выходным.",
        "Мы с друзьями хотим узнать больше об ИИ.",
        "Мой лучший друг отлично рисует.",
        "Мой лучший друг живёт рядом с парком.",
        "Мы гуляем в парке с друзьями.",
        "Мы любим играть в игры вместе.",
        "Друзья помогают друг другу с домашним заданием.",
        "Я каждый день пишу сообщения друзьям.",
        "У моего телефона очень хорошая камера.",
        "Мой телефон узнаёт мой голос.",
        "Этот компьютер работает очень быстро.",
        "Интернет соединяет людей по всему миру.",
        "Я делаю видео на ноутбуке.",
        "Мы учим новые языки с помощью приложений.",
        "Видеоигры бывают очень творческими.",
        "Умная колонка может включать музыку и отвечать на вопросы.",
        "Программирование похоже на рецепт для компьютера.",
        "Я хочу научиться программировать.",
        "Я хочу построить робота, который умеет говорить.",
        "Солнце ярко светит на небе.",
        "Солнце даёт энергию растениям.",
        "Деревья в парке зелёные.",
        "Птицы поют по утрам.",
        "Река течёт к морю.",
        "Зимой деревья покрыты снегом.",
        "Весной в саду растут цветы.",
        "Небо голубое, и погода хорошая.",
        "Пчёлы опыляют цветы.",
        "На завтрак я ем яйца и тосты.",
        "На обед мы едим суп и хлеб.",
        "Моя мама печёт самые вкусные блины.",
        "По воскресеньям мы вместе готовим ужин.",
        "Пицца — моя любимая еда.",
        "Фрукты и овощи полезны для здоровья.",
        "Каждое утро я выпиваю стакан воды.",
        "У искусственного интеллекта большое будущее.",
        "В будущем будет много умных роботов.",
        "Умные роботы могут помогать людям дома.",
        "Важно пользоваться ИИ с умом.",
        "Беспилотные машины видят дорогу с помощью камер.",
        "Мы можем использовать ИИ, чтобы учить языки.",
        "Компьютер учится на данных, которые мы ему даём.",
        "Узнавать новое очень интересно."
    ]
};

const START = "<s>";
const END = "</s>";
const WORD_RE = /[\p{L}\p{N}'’-]+/gu;
const HAS_LETTER = /[\p{L}\p{N}]/u;
const MAX_TAUGHT = 50;
const AUTO_WORDS = 12;

// Splits text into words (keeps letters of every alphabet, digits, ' and -)
function wordsOf(text) {
    return (String(text).match(WORD_RE) || []).filter((word) => HAS_LETTER.test(word));
}

function addCount(map, key, word) {
    let context = map.get(key);
    if (!context) {
        context = { total: 0, counts: new Map() };
        map.set(key, context);
    }
    context.total++;
    context.counts.set(word, (context.counts.get(word) || 0) + 1);
}

// "Training" this model = counting
function buildModel(sentences) {
    const unigrams = new Map();
    const bigrams = new Map();
    const trigrams = new Map();
    const casing = new Map();
    const pairs = new Set();
    const triples = new Set();
    let total = 0;
    let sentenceCount = 0;

    sentences.forEach((sentence) => {
        const original = wordsOf(sentence);
        if (!original.length) return;
        sentenceCount++;
        const lower = original.map((word) => word.toLowerCase());

        // Remember how words are written in the middle of a sentence ("AI", "I", "Friday")
        original.forEach((word, i) => {
            if (i === 0) return;
            let forms = casing.get(lower[i]);
            if (!forms) casing.set(lower[i], forms = new Map());
            forms.set(word, (forms.get(word) || 0) + 1);
        });

        const tokens = [START, START].concat(lower, [END]);
        for (let i = 2; i < tokens.length; i++) {
            const word = tokens[i];
            unigrams.set(word, (unigrams.get(word) || 0) + 1);
            total++;
            addCount(bigrams, tokens[i - 1], word);
            addCount(trigrams, tokens[i - 2] + " " + tokens[i - 1], word);
            if (word !== END && tokens[i - 1] !== START) {
                pairs.add(tokens[i - 1] + " " + word);
                if (tokens[i - 2] !== START) triples.add(tokens[i - 2] + " " + tokens[i - 1] + " " + word);
            }
        }
    });

    const unigramDist = new Map();
    unigrams.forEach((count, word) => unigramDist.set(word, count / total));

    const bestCasing = new Map();
    casing.forEach((forms, word) => {
        let best = word;
        let bestCount = 0;
        forms.forEach((count, form) => {
            if (count > bestCount) {
                best = form;
                bestCount = count;
            }
        });
        bestCasing.set(word, best);
    });

    return {
        unigrams: unigrams,
        unigramDist: unigramDist,
        bigrams: bigrams,
        trigrams: trigrams,
        casing: bestCasing,
        stats: {
            sentences: sentenceCount,
            words: unigrams.size - (unigrams.has(END) ? 1 : 0),
            pairs: pairs.size,
            triples: triples.size
        }
    };
}

// "Backoff": words seen after this context share most of the probability;
// a small part is left for all other words, using the shorter context.
function backoff(context, lower) {
    if (!context) return lower;
    const discount = 0.5;
    const result = new Map();
    let seenLowerMass = 0;
    context.counts.forEach((count, word) => {
        result.set(word, (count - discount) / context.total);
        seenLowerMass += lower.get(word) || 0;
    });
    const leftover = (discount * context.counts.size) / context.total;
    const unseenMass = 1 - seenLowerMass;
    if (unseenMass > 1e-9) {
        lower.forEach((p, word) => {
            if (!context.counts.has(word)) result.set(word, (leftover * p) / unseenMass);
        });
    } else {
        let sum = 0;
        result.forEach((p) => { sum += p; });
        result.forEach((p, word) => result.set(word, p / sum));
    }
    return result;
}

function predictNext(model, previous) {
    const p1 = previous.length ? previous[previous.length - 1] : START;
    const p2 = previous.length > 1 ? previous[previous.length - 2] : START;
    const bigram = model.bigrams.get(p1);
    const trigram = model.trigrams.get(p2 + " " + p1);
    const dist = backoff(trigram, backoff(bigram, model.unigramDist));
    return {
        dist: dist,
        level: trigram ? 3 : (bigram ? 2 : 1),
        p1: p1,
        p2: p2,
        count: trigram ? trigram.total : (bigram ? bigram.total : 0),
        oneCount: bigram ? bigram.total : 0
    };
}

function topWords(dist, limit, filter) {
    const list = [];
    dist.forEach((p, word) => {
        if (word !== START && (!filter || filter(word))) list.push({ word: word, p: p });
    });
    list.sort((a, b) => b.p - a.p);
    return list.slice(0, limit);
}

// Temperature: low = sharpen towards the top word, high = flatten (more random)
function pickChances(list, temperature) {
    if (!list.length) return [];
    if (temperature < 0.05) return list.map((item, i) => (i === 0 ? 1 : 0));
    const weights = list.map((item) => Math.pow(item.p, 1 / temperature));
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    return weights.map((weight) => weight / sum);
}

function sampleIndex(chances) {
    let roll = Math.random();
    for (let i = 0; i < chances.length; i++) {
        roll -= chances[i];
        if (roll <= 0) return i;
    }
    return 0;
}

// ----- State of the predictor -----
const lm = {
    lang: AIC.lang,
    model: null,
    taught: [],
    temperature: 0.7,
    starter: null,           // { n, text } when the text came from a starter button
    writer: null,            // the auto-write job while it runs
    shown: [],               // candidates on screen right now
    mode: "next",
    srTimer: 0
};

const lmEls = {
    input: $("#lab-lm-input"),
    clear: $(".lab-lm-clear"),
    mode: $('[data-lm="mode"]'),
    context: $('[data-lm="context"]'),
    tokens: $('[data-lm="tokens"]'),
    notice: $(".lab-lm-notice"),
    items: $$(".lab-cand-item"),
    auto: $(".lab-auto"),
    temp: $("#lab-temp"),
    tempOut: $('[data-out="temp"]'),
    teachForm: $(".lab-teach"),
    teachInput: $("#lab-teach-input"),
    teachStatus: $(".lab-teach-status"),
    forget: $('[data-action="forget"]'),
    live: $('[data-live="lm"]'),
    field: $(".lab-lm-field")
};

const savedTemp = Number(AIC.storage.get("lab.temperature", 0.7));
lm.temperature = isFinite(savedTemp) ? clamp(Math.round(savedTemp * 10) / 10, 0, 2) : 0.7;
lmEls.temp.value = String(lm.temperature);

function loadModel() {
    lm.lang = AIC.lang;
    const taught = AIC.storage.get("lab.taught." + lm.lang, []);
    lm.taught = Array.isArray(taught) ? taught.filter((s) => typeof s === "string").slice(0, MAX_TAUGHT) : [];
    lm.model = buildModel(CORPUS[lm.lang].concat(lm.taught));
}

// Looks at the text: which words come before, and is the last word finished?
function readText(text) {
    const cut = Math.max(text.lastIndexOf("."), text.lastIndexOf("!"), text.lastIndexOf("?"), text.lastIndexOf("…"));
    const sentence = text.slice(cut + 1);
    const previous = wordsOf(sentence).map((word) => word.toLowerCase());
    const finished = text.trim() === "" || /[\s.,!?…;:]$/.test(text);
    let partial = "";
    if (!finished && previous.length) partial = previous.pop();
    return { previous: previous, partial: partial };
}

// How a word should be written: "ai" -> "AI", capital letter at the start of a sentence
function displayWord(word, atStart) {
    let shown = lm.model.casing.get(word) || word;
    if (atStart) shown = shown.charAt(0).toUpperCase() + shown.slice(1);
    return shown;
}

// Works out the candidates for the current text
function analyse() {
    const text = lmEls.input.value;
    const state = readText(text);
    const model = lm.model;

    // Still typing a word? Then suggest ways to finish it, like a phone keyboard
    if (state.partial) {
        const prediction = predictNext(model, state.previous);
        let sum = 0;
        const matches = topWords(prediction.dist, 400, (word) => {
            const ok = word !== END && word.startsWith(state.partial);
            if (ok) sum += prediction.dist.get(word);
            return ok;
        });
        if (matches.length) {
            matches.forEach((item) => { item.p = item.p / (sum || 1); });
            return { mode: "complete", state: state, list: matches.slice(0, 20), prediction: prediction };
        }
        state.previous.push(state.partial);
        state.partial = "";
    }
    const prediction = predictNext(model, state.previous);
    return { mode: "next", state: state, list: topWords(prediction.dist, 20), prediction: prediction };
}

function contextText(result) {
    if (result.mode === "complete") return t("lab.lmCtxComplete", { prefix: quote(result.state.partial + "…") });
    const prediction = result.prediction;
    const cased = (word) => lm.model.casing.get(word) || word;
    const p1 = cased(prediction.p1);
    const p2 = cased(prediction.p2);
    if (prediction.p1 === START) return t("lab.lmCtxStart");
    if (prediction.level === 3) {
        const n = prediction.count;
        if (prediction.p2 === START) return t("lab.lmCtxFirst", { word: quote(p1), n: n, times: plural(n, "lab.pluralTimes") });
        return t("lab.lmCtxTri", { words: quote(p2 + " " + p1), n: n, times: plural(n, "lab.pluralTimes") });
    }
    if (prediction.level === 2) {
        const n = prediction.oneCount;
        if (prediction.p2 === START) return t("lab.lmCtxOne", { word: quote(p1), n: n, times: plural(n, "lab.pluralTimes") });
        return t("lab.lmCtxBi", { pair: quote(p2 + " " + p1), word: quote(p1), n: n, times: plural(n, "lab.pluralTimes") });
    }
    return t("lab.lmCtxUni", { word: quote(prediction.p1) });
}

// Draws the 5 candidate rows, the context line and the token view
function renderPredictor() {
    if (!lm.model) return;
    const result = analyse();
    lm.mode = result.mode;
    const atStart = result.state.previous.length === 0;
    const chances = pickChances(result.list, lm.temperature);
    lm.shown = result.list.slice(0, 5).map((item, i) => ({ word: item.word, p: item.p, chance: chances[i] }));
    lm.lastResult = result;
    lm.lastChances = chances;

    lmEls.mode.textContent = t(result.mode === "complete" ? "lab.lmComplete" : "lab.lmNext");
    lmEls.context.textContent = contextText(result);

    lmEls.items.forEach((item, i) => {
        const data = lm.shown[i];
        item.hidden = !data;
        if (!data) return;
        const button = item.querySelector(".lab-cand");
        const isEnd = data.word === END;
        const shown = isEnd ? "⏎ " + t("lab.lmEnd") : displayWord(data.word, atStart);
        button.classList.toggle("is-end", isEnd);
        button.querySelector(".lab-cand-word").textContent = shown;
        button.querySelector(".lab-cand-pct").textContent = percent(data.p);
        button.querySelector(".lab-cand-fill").style.transform = "scaleX(" + Math.max(0.015, data.p).toFixed(4) + ")";
        button.querySelector(".lab-cand-pick").style.transform = "scaleX(" + (data.chance || 0).toFixed(4) + ")";
        button.setAttribute("aria-label", isEnd ?
            t("lab.lmPickEndLabel", { pct: percent(data.p) }) :
            t("lab.lmPickLabel", { word: quote(shown), pct: percent(data.p) }));
    });

    renderTokens();
    updateTempOutput();

    // Screen readers hear the top guess after a short pause in typing
    clearTimeout(lm.srTimer);
    lm.srTimer = setTimeout(() => {
        const top = lm.shown[0];
        if (!top || lm.writer) return;
        const word = top.word === END ? t("lab.lmEnd") : quote(displayWord(top.word, atStart));
        announce(lmEls.live, t("lab.lmSrTop", { word: word, pct: percent(top.p) }));
    }, 900);
}

// Shows each word coloured by how much the model expected it
function renderTokens() {
    const text = lmEls.input.value;
    const container = lmEls.tokens;
    container.textContent = "";

    const tokens = [];
    let unknown = 0;
    let known = 0;
    const sentences = text.split(/[.!?…]+/);
    const endsMidWord = text.trim() !== "" && !/[\s.,!?…;:]$/.test(text);
    sentences.forEach((sentence, s) => {
        const original = wordsOf(sentence);
        const previous = [];
        original.forEach((word, i) => {
            const lower = word.toLowerCase();
            const isLast = s === sentences.length - 1 && i === original.length - 1;
            const typing = isLast && endsMidWord;
            const p = lm.model.unigrams.has(lower) ? (predictNext(lm.model, previous).dist.get(lower) || 0) : 0;
            if (!typing) {
                if (p === 0) unknown++;
                else known++;
            }
            tokens.push({ word: word, p: p, typing: typing });
            previous.push(lower);
        });
    });

    lmEls.notice.hidden = !(known + unknown >= 2 && unknown / (known + unknown) > 0.5);

    if (!tokens.length) {
        const empty = document.createElement("p");
        empty.className = "lab-tokens-empty";
        empty.textContent = t("lab.lmTokensEmpty");
        container.appendChild(empty);
        return;
    }

    tokens.slice(-40).forEach((token) => {
        const chip = document.createElement("span");
        chip.className = "lab-tok";
        const word = document.createElement("span");
        word.textContent = token.word;
        const value = document.createElement("small");
        value.className = "mono";
        if (token.typing) {
            chip.classList.add("is-typing");
            value.textContent = "…";
        } else if (token.p === 0) {
            chip.classList.add("is-new");
            value.textContent = t("lab.lmTokenNew");
        } else {
            // log scale: 100% -> 1, 10% -> 0.67, 1% -> 0.33, 0.1% -> 0
            const glow = clamp((Math.log10(token.p) + 3) / 3, 0, 1);
            chip.style.setProperty("--p", glow.toFixed(3));
            value.textContent = percent(token.p);
        }
        chip.appendChild(word);
        chip.appendChild(value);
        container.appendChild(chip);
    });
}

function renderLmStats() {
    const stats = lm.model.stats;
    const labels = { sentences: "lab.pluralSentences", words: "lab.pluralWords", pairs: "lab.pluralPairs", triples: "lab.pluralTriples" };
    Object.keys(labels).forEach((name) => {
        $('[data-lmstat="' + name + '"]').textContent = fmt(stats[name], 0);
        $('[data-lmstat-label="' + name + '"]').textContent = plural(stats[name], labels[name]);
    });
    lmEls.teachStatus.textContent = lm.taught.length ?
        t("lab.lmTeachCount", { n: lm.taught.length }) : t("lab.lmTeachNone");
    lmEls.teachStatus.classList.remove("is-error");
    lmEls.forget.hidden = lm.taught.length === 0;
}

function tempWord(value) {
    if (value < 0.05) return t("lab.lmTemp0");
    if (value < 0.5) return t("lab.lmTemp1");
    if (value < 1.05) return t("lab.lmTemp2");
    if (value < 1.5) return t("lab.lmTemp3");
    return t("lab.lmTemp4");
}

function updateTempOutput() {
    const text = fmt(lm.temperature, 1) + " · " + tempWord(lm.temperature);
    lmEls.tempOut.textContent = text;
    lmEls.temp.setAttribute("aria-valuetext", text);
    updateRangeFill(lmEls.temp);
}

function updateAutoButton() {
    const writing = Boolean(lm.writer);
    lmEls.auto.querySelector(".lab-auto-icon").innerHTML = writing ? icons.stop : icons.sparkle;
    lmEls.auto.querySelector(".lab-auto-text").textContent = t(writing ? "lab.lmStop" : "lab.lmAuto");
    lmEls.auto.classList.toggle("is-writing", writing);
    lmEls.field.classList.toggle("is-writing", writing);
}

// Adds a word to the text (or finishes the word being typed)
function insertWord(word) {
    const input = lmEls.input;
    let text = input.value;
    const state = readText(text);

    if (word === END) {
        input.value = text.replace(/[\s,;:]+$/, "") + ". ";
    } else if (lm.mode === "complete" && state.partial) {
        // replace the half-typed word
        const typed = text.match(/[\p{L}\p{N}'’-]+$/u);
        const start = typed ? text.length - typed[0].length : text.length;
        const keepCapital = typed && typed[0].charAt(0) !== typed[0].charAt(0).toLowerCase();
        input.value = text.slice(0, start) + displayWord(word, state.previous.length === 0 || keepCapital) + " ";
    } else {
        if (text && !/\s$/.test(text)) text += " ";
        input.value = text + displayWord(word, state.previous.length === 0 && !state.partial) + " ";
    }
    if (input.value.length > 400) input.value = input.value.slice(0, 400);
    input.scrollTop = input.scrollHeight;
    renderPredictor();
}

// ----- Auto-write: the model writes up to 12 words by itself -----
function stopAuto(announceDone) {
    const job = lm.writer;
    if (!job) return;
    job.cancelled = true;
    clearTimeout(job.timer);
    lm.writer = null;
    lmEls.items.forEach((item) => item.querySelector(".lab-cand").classList.remove("is-picked"));
    updateAutoButton();
    if (announceDone) announce(lmEls.live, t("lab.lmSrDone"));
}

function startAuto() {
    if (lm.writer) {
        stopAuto(true);
        return;
    }
    const job = { cancelled: false, count: 0, timer: 0 };
    lm.writer = job;
    updateAutoButton();

    const input = lmEls.input;
    if (input.value.trim() && !/[\s.,!?…;:]$/.test(input.value)) input.value += " ";
    renderPredictor();

    const calm = calmMode();

    function nextWord() {
        if (job.cancelled) return;
        if (job.count >= AUTO_WORDS || input.value.length > 360) {
            stopAuto(true);
            return;
        }
        const result = analyse();
        const chances = pickChances(result.list, lm.temperature);
        if (!result.list.length) {
            stopAuto(true);
            return;
        }
        const choice = result.list[sampleIndex(chances)].word;
        job.count++;

        // Light up the chosen candidate for a moment, so you can see the "decision"
        const shownIndex = lm.shown.findIndex((item) => item.word === choice);
        if (shownIndex >= 0) lmEls.items[shownIndex].querySelector(".lab-cand").classList.add("is-picked");

        job.timer = setTimeout(() => {
            if (job.cancelled) return;
            lmEls.items.forEach((item) => item.querySelector(".lab-cand").classList.remove("is-picked"));
            if (choice === END) {
                insertWord(END);
                stopAuto(true);
                return;
            }
            const atStart = readText(input.value).previous.length === 0;
            typeOut(displayWord(choice, atStart) + " ", () => {
                renderPredictor();
                job.timer = setTimeout(nextWord, calm ? 120 : 160);
            });
        }, calm ? 200 : 260);
    }

    // Letters appear one by one, like someone typing
    function typeOut(text, done) {
        if (calm) {
            input.value += text;
            input.scrollTop = input.scrollHeight;
            done();
            return;
        }
        let i = 0;
        (function typeLetter() {
            if (job.cancelled) return;
            input.value += text.charAt(i);
            input.scrollTop = input.scrollHeight;
            i++;
            if (i < text.length) job.timer = setTimeout(typeLetter, 30 + Math.random() * 25);
            else done();
        })();
    }

    nextWord();
}

// ----- Teaching the model your own sentences -----
lmEls.teachForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const sentence = lmEls.teachInput.value.trim().replace(/\s+/g, " ");
    if (wordsOf(sentence).length < 2) {
        lmEls.teachStatus.textContent = t("lab.lmTeachError");
        lmEls.teachStatus.classList.add("is-error");
        lmEls.teachInput.focus();
        return;
    }
    if (lm.taught.length >= MAX_TAUGHT) {
        lmEls.teachStatus.textContent = t("lab.lmTeachFull");
        lmEls.teachStatus.classList.add("is-error");
        return;
    }
    lm.taught.push(sentence.slice(0, 140));
    AIC.storage.set("lab.taught." + lm.lang, lm.taught);
    lm.model = buildModel(CORPUS[lm.lang].concat(lm.taught));
    lmEls.teachInput.value = "";
    renderLmStats();
    renderPredictor();
    AIC.toast(t("lab.lmTeachToast"), "🧠");
});

lmEls.forget.addEventListener("click", () => {
    lm.taught = [];
    AIC.storage.remove("lab.taught." + lm.lang);
    lm.model = buildModel(CORPUS[lm.lang]);
    renderLmStats();
    renderPredictor();
    lmEls.teachInput.focus();
    AIC.toast(t("lab.lmTeachForgot"), "🧹");
});

// ----- Typing, buttons and the slider -----
lmEls.input.addEventListener("input", () => {
    stopAuto(false);
    if (lm.starter && !lmEls.input.value.startsWith(lm.starter.text)) lm.starter = null;
    renderPredictor();
});

lmEls.clear.addEventListener("click", () => {
    stopAuto(false);
    lmEls.input.value = "";
    lm.starter = null;
    renderPredictor();
    lmEls.input.focus();
});

$$(".lab-starter").forEach((button) => {
    button.addEventListener("click", () => {
        stopAuto(false);
        const n = Number(button.getAttribute("data-starter"));
        lmEls.input.value = t("lab.lmStarter" + n) + " ";
        lm.starter = { n: n, text: lmEls.input.value };
        renderPredictor();
    });
});

lmEls.items.forEach((item, i) => {
    item.querySelector(".lab-cand").addEventListener("click", () => {
        const data = lm.shown[i];
        if (!data) return;
        stopAuto(false);
        insertWord(data.word);
    });
});

lmEls.auto.addEventListener("click", startAuto);

lmEls.temp.addEventListener("input", () => {
    lm.temperature = clamp(Number(lmEls.temp.value) || 0, 0, 2);
    AIC.storage.set("lab.temperature", lm.temperature);
    // only the "chance to be picked" lines change
    if (lm.lastResult) {
        const chances = pickChances(lm.lastResult.list, lm.temperature);
        lmEls.items.forEach((item, i) => {
            if (lm.shown[i]) {
                lm.shown[i].chance = chances[i];
                item.querySelector(".lab-cand-pick").style.transform = "scaleX(" + (chances[i] || 0).toFixed(4) + ")";
            }
        });
    }
    updateTempOutput();
});

/* =========================================================
   8. START-UP: TABS, SIZES, LANGUAGE, THEME, openLab, COMMANDS
   ========================================================= */
const tabButtons = $$(".lab-tab");
const panels = $$(".lab-panel");
const tabList = $(".lab-tabs");

function selectTab(name, moveFocus) {
    if (TABS.indexOf(name) < 0) name = "classifier";
    activeTab = name;
    tabList.setAttribute("data-active", name);
    tabButtons.forEach((button) => {
        const on = button.getAttribute("data-tab") === name;
        button.setAttribute("aria-selected", String(on));
        button.tabIndex = on ? 0 : -1;
        if (on && moveFocus) button.focus();
    });
    panels.forEach((panel) => {
        const on = panel.getAttribute("data-panel") === name;
        panel.hidden = !on;
        if (on && !calmMode()) {
            panel.classList.remove("lab-panel-in");
            void panel.offsetWidth;    // restart the fade-in animation
            panel.classList.add("lab-panel-in");
        }
    });
    if (name !== "predictor") stopAuto(false);
    AIC.storage.set("lab.tab", name);
    measureAll();
    schedule();
}

tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => selectTab(button.getAttribute("data-tab"), false));
    button.addEventListener("keydown", (event) => {
        let next = -1;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabButtons.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabButtons.length) % tabButtons.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabButtons.length - 1;
        if (next < 0) return;
        event.preventDefault();
        selectTab(tabButtons[next].getAttribute("data-tab"), true);
    });
});

// ----- Canvas sizes follow their boxes -----
function measureAll() {
    const boardSize = board.el.clientWidth;
    if (boardSize && boardSize !== board.size) {
        board.size = boardSize;
        board.dpr = fitCanvas(board.canvas, boardSize, boardSize);
        makeSprites();
        nn.dirty.board = true;
    } else if (boardSize) {
        const dpr = fitCanvas(board.canvas, boardSize, boardSize);
        if (dpr !== board.dpr) {
            board.dpr = dpr;
            makeSprites();
            nn.dirty.board = true;
        }
    }

    const chartW = chart.wrap.clientWidth;
    const chartH = chart.wrap.clientHeight;
    if (chartW && (chartW !== chart.w || chartH !== chart.h)) {
        chart.w = chartW;
        chart.h = chartH;
        chart.dpr = fitCanvas(chart.canvas, chartW, chartH);
        nn.dirty.chart = true;
    }

    const diagramW = diagram.wrap.clientWidth;
    const diagramH = diagram.wrap.clientHeight;
    if (diagramW && (diagramW !== diagram.w || diagramH !== diagram.h)) {
        diagram.w = diagramW;
        diagram.h = diagramH;
        diagram.dpr = fitCanvas(diagram.canvas, diagramW, diagramH);
        nn.dirty.diagram = true;
    }
    schedule();
}

if ("ResizeObserver" in window) {
    const resizer = new ResizeObserver(measureAll);
    [board.el, chart.wrap, diagram.wrap].forEach((element) => resizer.observe(element));
} else {
    window.addEventListener("resize", measureAll);
}

// ----- Pause when the lab is off screen or the browser tab is hidden -----
function onLabVisible(visible) {
    labOnScreen = visible;
    labCard.classList.toggle("is-offscreen", !visible);
    // The first time you scroll to the lab, the network starts learning by itself
    if (visible && !nn.autoStarted) {
        nn.autoStarted = true;
        if (!calmMode() && activeTab === "classifier" && nn.points.length && nn.epoch === 0) setTraining(true);
    }
    schedule();
}

if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
        entries.forEach((entry) => onLabVisible(entry.isIntersecting));
    }, { threshold: 0.05 }).observe(labCard);
} else {
    onLabVisible(true);
}

document.addEventListener("visibilitychange", () => {
    pageVisible = !document.hidden;
    if (document.hidden) stopAuto(false);
    schedule();
});

// ----- Theme: read the new colours and redraw everything -----
AIC.onThemeChange(() => {
    readColors();
    makeSprites();
    nn.dirty.net = true;
    nn.dirty.chart = true;
    schedule();
});

// ----- Language: update the text that JavaScript writes, keep everything else -----
function refreshTexts() {
    updateTrainButton();
    updateAutoButton();
    updateDiagramLabel();
    updateStats();
    renderLmStats();
    updateTempOutput();
    nn.dirty.diagram = true;
    nn.dirty.board = true;
    schedule();
}

AIC.onLanguageChange((lang) => {
    if (lang !== lm.lang) {
        stopAuto(false);
        // A sentence started with a starter button switches to the same starter in the new language
        const keepStarter = lm.starter && lmEls.input.value.startsWith(lm.starter.text);
        loadModel();
        if (keepStarter) {
            lmEls.input.value = t("lab.lmStarter" + lm.starter.n) + " ";
            lm.starter.text = lmEls.input.value;
        }
        AIC.applyTranslations(mount);
    }
    refreshTexts();
    renderPredictor();
});

// ----- Opening the lab from other parts of the site -----
AIC.openLab = function (tab) {
    selectTab(tab === "predictor" ? "predictor" : "classifier", false);
    AIC.scrollToSection("lab");
};

AIC.registerCommand({
    id: "lab-classifier",
    group: "lab.cmdGroup",
    icon: "🧠",
    title: function () { return t("lab.cmdNN"); },
    keywords: "lab neural network train teach classifier dots points machine learning лаборатория нейросеть нейронная сеть обучить обучение машина точки классификатор",
    run: function () { AIC.openLab("classifier"); }
});

AIC.registerCommand({
    id: "lab-predictor",
    group: "lab.cmdGroup",
    icon: "💬",
    title: function () { return t("lab.cmdLM"); },
    keywords: "lab next word predictor language model chatbot text autocomplete gpt лаборатория следующее слово предсказатель языковая модель чат-бот текст автодополнение",
    run: function () { AIC.openLab("predictor"); }
});

// ----- First draw -----
readColors();
loadModel();
nn.points = makePreset("spiral");
$$(".lab-preset").forEach((chip) => chip.classList.toggle("active", chip.getAttribute("data-preset") === "spiral"));
AIC.applyTranslations(mount);
pointsChanged();
updateDiagramLabel();
refreshTexts();
renderPredictor();
selectTab(AIC.storage.get("lab.tab", "classifier"), false);

})();
