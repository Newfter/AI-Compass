/* =========================================================
   AI COMPASS — TEXTS AND DATA: "HOW COMPUTERS SEE" (js/lab/vision.js)
   Keys: lab.vision.*  The shared words (Play, Step, Pause...) are
   lab.kit.* in js/content/lab/kit.js.
   Plurals: "one|other" (English), "one|few|many" (Russian).
   The data at the end (A.content "lab.vision"): the preset pictures,
   the ready filters and the hand-set filters of the tiny network.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // The lab catalogue
        "lab.vision.title": "How computers see",
        "lab.vision.hook": "Slide a 3\u00a0×\u00a03 filter over a picture: it finds edges, blurs and sharpens. Then look through the eyes of a tiny neural network.",
        "lab.vision.idea": "Convolution: how computers find edges and shapes",

        // The three views
        "lab.vision.view": "Show",
        "lab.vision.viewFilter": "Filters",
        "lab.vision.viewStep": "Step by step",
        "lab.vision.viewCnn": "What a CNN sees",

        // The pictures
        "lab.vision.picture": "Picture",
        "lab.vision.picShapes": "Shapes",
        "lab.vision.picHouse": "House",
        "lab.vision.picChecker": "Checkerboard",
        "lab.vision.picLetters": "Letters AI",
        "lab.vision.picFace": "Face",
        "lab.vision.picStripes": "Stripes",
        "lab.vision.picDraw": "Draw",
        "lab.vision.picPhoto": "Your photo",
        "lab.vision.picResult": "The result",
        "lab.vision.photo": "Use your own photo",
        "lab.vision.photoNote": "Your photo never leaves this browser, and it isn't saved.",
        "lab.vision.photoError": "That file couldn't be opened as a picture. Try an ordinary photo or a screenshot.",
        "lab.vision.photoReady": "Your photo is ready: {w}\u00a0×\u00a0{h} pixels in shades of grey.",
        "lab.vision.drawHint": "Draw with the mouse, a pen or a finger. Using the keyboard? Pick one of the ready pictures: the pad needs a pointer.",
        "lab.vision.clear": "Clear",
        "lab.vision.cleared": "The pad is empty.",
        "lab.vision.padRole": "drawing pad",
        "lab.vision.pictureRole": "picture",
        "lab.vision.pictureSay": "Picture: {name}.",

        // The picture and its feature map
        "lab.vision.inputCaption": "Picture · {w}\u00a0×\u00a0{h}",
        "lab.vision.outputCaption": "Feature map · {w}\u00a0×\u00a0{h}",
        "lab.vision.inputLabel": "The picture. The arrow keys move the magnifier.",
        "lab.vision.inputLabelDraw": "The drawing pad. Draw with the mouse, a pen or a finger; the arrow keys move the magnifier.",
        "lab.vision.outputLabel": "The feature map: the picture after the filter",
        "lab.vision.describeInput": "{name}: {w}\u00a0×\u00a0{h} pixels, average brightness {mean} of 255.",
        "lab.vision.describeOutput": "The feature map: {w}\u00a0×\u00a0{h} pixels, from {min} to {max}.",
        "lab.vision.legendNegative": "below 0",
        "lab.vision.legendZero": "0",
        "lab.vision.legendPositive": "above 0",
        "lab.vision.legendBlack": "0 black",
        "lab.vision.legendWhite": "255 white",
        "lab.vision.legendGray": "Shades: 0 is black, 255 and more is white.",
        "lab.vision.legendColors": "Colours: red below 0, grey at 0, cyan above 0.",
        "lab.vision.statIn": "Picture brightness",
        "lab.vision.statOut": "Map brightness",

        // The magnifier
        "lab.vision.loupeTitle": "The computer sees numbers",
        "lab.vision.loupeWhere": "Row {row}, column {col}",
        "lab.vision.loupeHelp": "Point at the picture, or click it and use the arrow keys.",
        "lab.vision.loupeSay": "Row {row}, column {col}: {value}.",
        "lab.vision.loupeOutside": "Outside the picture",

        // The filter
        "lab.vision.filterTitle": "The filter",
        "lab.vision.filters": "Ready filters",
        "lab.vision.fIdentity": "Identity",
        "lab.vision.fBlur": "Blur",
        "lab.vision.fSoftBlur": "Soft blur",
        "lab.vision.fSharpen": "Sharpen",
        "lab.vision.fVertical": "Vertical edges",
        "lab.vision.fHorizontal": "Horizontal edges",
        "lab.vision.fOutline": "Outline",
        "lab.vision.fEmboss": "Emboss",
        "lab.vision.numbers": "The filter's 9 numbers",
        "lab.vision.numbersHelp": "Each from −10 to 10. Type a number, or use the arrow keys.",
        "lab.vision.cell": "Filter number, row {row}, column {col}",
        "lab.vision.divisor": "Divide by",
        "lab.vision.sum": "The 9 numbers add up to {sum}.",
        "lab.vision.sumDivided": "The 9 numbers add up to {raw}, divided by {divisor}: {sum}.",
        "lab.vision.filterSay": "Filter: {name}.",
        "lab.vision.edges": "Edges of the picture",
        "lab.vision.edgesSame": "Same size",
        "lab.vision.edgesValid": "Only full windows",
        "lab.vision.edgesHelp": "Same size: pixels outside the picture count as 0. Only full windows: the map is 2 px smaller.",
        "lab.vision.relu": "ReLU: negatives become 0",
        "lab.vision.pool": "Max pooling 2\u00a0×\u00a02",
        "lab.vision.poolHelp": "Keeps the strongest value of each 2\u00a0×\u00a02 block: the map gets half as wide.",
        "lab.vision.applyAgain": "Apply again",
        "lab.vision.backToPicture": "Back to the picture",
        "lab.vision.applied": "The filter has been applied once: the picture is now the result.|The filter has been applied {n} times: the picture is now the result.",
        "lab.vision.appliedSay": "Applied again. The picture is now {w}\u00a0×\u00a0{h}.",
        "lab.vision.backSay": "Back to the original picture.",
        "lab.vision.tooSmall": "The map is too small to apply the filter again.",

        // Step by step
        "lab.vision.stepLabel": "The picture shrunk to 16\u00a0×\u00a016 and its feature map. The arrow keys move the window.",
        "lab.vision.stepRole": "sliding window",
        "lab.vision.stepIn": "Picture 16\u00a0×\u00a016",
        "lab.vision.stepOut": "Feature map {w}\u00a0×\u00a0{h}",
        "lab.vision.stepOutShort": "Map {w}\u00a0×\u00a0{h}",
        "lab.vision.stepWhere": "Window at row {row}, column {col}",
        "lab.vision.stepCount": "Pixel {n} of {total}",
        "lab.vision.stepDone": "The whole map is done.",
        "lab.vision.stepSay": "Row {row}, column {col}: {value}.",
        "lab.vision.stepDescribe": "The window is at row {row}, column {col} of the 16\u00a0×\u00a016 picture. The sum there is {value}. {n} of {total} pixels of the map are done.",
        "lab.vision.eqPixels": "Pixels",
        "lab.vision.eqFilter": "Filter",
        "lab.vision.eqProducts": "Products",
        "lab.vision.eqRelu": "after ReLU: {value}",
        "lab.vision.eqOutside": "Pixels outside the picture count as 0.",
        "lab.vision.eqMap": "This number goes into the lit-up pixel of the feature map.",
        "lab.vision.calmNote": "Calm mode is on, so there's no Play: move the window with Step or the arrow keys.",
        "lab.vision.poolStepNote": "Max pooling works on the finished map: you can see it under “Filters”.",

        // What a CNN sees
        "lab.vision.cnnTitle": "A tiny convolutional network",
        "lab.vision.cnnPicture": "The picture · {w}\u00a0×\u00a0{h}",
        "lab.vision.layer1": "Layer 1: 4 edge filters, then ReLU and max pooling → 4 maps of {w}\u00a0×\u00a0{h}",
        "lab.vision.layer2": "Layer 2: 3 filters that each look at all 4 maps, then ReLU and max pooling → 3 maps of {w}\u00a0×\u00a0{h}",
        "lab.vision.mapsHelp": "Brighter means a stronger answer. Click a map to see its filter.",
        "lab.vision.mapVertical": "Vertical edges",
        "lab.vision.mapHorizontal": "Horizontal edges",
        "lab.vision.mapRising": "Slanted edges /",
        "lab.vision.mapFalling": "Slanted edges \\",
        "lab.vision.mapCorners": "Corners ┌",
        "lab.vision.mapEnds": "Line ends",
        "lab.vision.mapCurves": "Curves",
        "lab.vision.aboutVertical": "Looks for edges where the picture gets brighter to the right. The opposite edges give negative numbers, and ReLU turns them into 0.",
        "lab.vision.aboutHorizontal": "Looks for edges where the picture gets brighter downwards. The opposite edges give negative numbers, and ReLU turns them into 0.",
        "lab.vision.aboutRising": "Looks for slanted edges like /, where the picture gets brighter towards the bottom right.",
        "lab.vision.aboutFalling": "Looks for slanted edges like \\, where the picture gets brighter towards the bottom left.",
        "lab.vision.aboutCorners": "Looks for ┌ corners: a vertical edge that runs down from here and a horizontal edge that runs to the right. The ends of thick lines have corners too, so it answers there as well.",
        "lab.vision.aboutEnds": "Looks for places where an edge stops: the ends of lines, and the corners of shapes, where one edge stops and another begins.",
        "lab.vision.aboutCurves": "Looks for edges that bend away from a straight line. It answers at corners too (they are the sharpest bends) and a little on slanted lines: filters set by hand are clumsy.",
        "lab.vision.aboutLayer2": "A layer-2 filter has 3\u00a0×\u00a03\u00a0×\u00a04 numbers: one 3\u00a0×\u00a03 grid for each map of layer 1. It sees only about 10\u00a0×\u00a010 pixels of the picture, so it finds small bends, not whole circles. Deeper layers see more.",
        "lab.vision.filterOf": "The filter of “{name}”",
        "lab.vision.onMap": "On “{name}”",
        "lab.vision.pickMap": "Click a map to see its filter.",
        "lab.vision.tryFilter": "Try this filter",
        "lab.vision.mapSay": "{name}: its filter is shown.",
        "lab.vision.honest": "These filters were set by hand. A real CNN learns its filters from millions of labelled pictures. Its first layer often ends up looking like these edge detectors, while deeper layers respond to textures, parts and whole objects.",
        "lab.vision.crossCorrelation": "In maths, this sliding sum is called cross-correlation, but neural networks call it convolution anyway.",

        // The line with glossary links
        "lab.vision.ideaLine": "The sliding sum is called a {convolution}. Filters like these are the eyes of {vision}: a convolutional {network} stacks them in layers and learns their numbers itself.",
        "lab.vision.termConvolution": "convolution",
        "lab.vision.termVision": "computer vision",
        "lab.vision.termNetwork": "neural network",

        // "What's happening?"
        "lab.vision.step1": "The picture is a grid of {w}\u00a0×\u00a0{h} numbers: 0 is black and 255 is white.",
        "lab.vision.step2": "The filter is 9 numbers. It slides over every pixel, multiplies the 9 pixels under it by its 9 numbers and adds them up. That is one new pixel: {sum}.",
        "lab.vision.step3": "A filter with negative numbers on one side and positive numbers on the other finds edges: it is bright where the brightness changes.",
        "lab.vision.step4": "ReLU keeps only the positive answers. Pooling keeps the strongest answer in each 2\u00a0×\u00a02 block and makes the map smaller.",
        "lab.vision.step5": "A convolutional network stacks layers like this, from edges to shapes to objects, and learns the filter numbers itself.",
        "lab.vision.realWorld": "In the real world: phone cameras that find faces, medical scans, self-driving cars reading road signs and the apps that name a plant from a photo all build on this idea.",

        // "Try this"
        "lab.vision.ch1": "<strong>Vertical edges only.</strong> Make a filter that finds the vertical edges of the Checkerboard, but not its horizontal ones.",
        "lab.vision.ch1Why": "A filter that takes the left column away from the right column only notices changes from left to right. Along a horizontal edge, left and right are the same, so it answers 0.",
        "lab.vision.ch2": "<strong>Brighter.</strong> Make the picture brighter with a filter alone, with max pooling off.",
        "lab.vision.ch2Why": "When the filter's numbers add up to more than 1, every flat area comes out brighter: 9 pixels of 100, times numbers that add up to 1.5, give 150.",
        "lab.vision.ch3": "<strong>Blur 3 times.</strong> Pick “Letters AI” and a blur filter, then press “Apply again” 3 times in a row.",
        "lab.vision.ch3Why": "Each blur mixes every pixel with its neighbours and throws a little detail away. Sharpen can make the edges crisper again, but it can't bring back what was lost: those numbers are gone.",
        "lab.vision.ch4": "<strong>The roof.</strong> In “What a CNN sees”, with the House picture, find the layer-1 map that lights up the roof, and click it.",
        "lab.vision.ch4Why": "The roof's slopes are slanted edges, so the two diagonal filters answer there, each on its own side of the roof. Deeper layers put maps like these together: two slopes that meet at the top make a roof."
    },
    ru: {
        // The lab catalogue
        "lab.vision.title": "Как видит компьютер",
        "lab.vision.hook": "Проведи фильтром 3\u00a0×\u00a03 по картинке: он находит края, размывает и добавляет резкость. А потом посмотри глазами маленькой нейросети.",
        "lab.vision.idea": "Свёртка: как компьютер находит края и формы",

        // The three views
        "lab.vision.view": "Показать",
        "lab.vision.viewFilter": "Фильтры",
        "lab.vision.viewStep": "По шагам",
        "lab.vision.viewCnn": "Что видит нейросеть",

        // The pictures
        "lab.vision.picture": "Картинка",
        "lab.vision.picShapes": "Фигуры",
        "lab.vision.picHouse": "Дом",
        "lab.vision.picChecker": "Шахматная доска",
        "lab.vision.picLetters": "Буквы AI",
        "lab.vision.picFace": "Лицо",
        "lab.vision.picStripes": "Полоски",
        "lab.vision.picDraw": "Нарисовать",
        "lab.vision.picPhoto": "Твоё фото",
        "lab.vision.picResult": "Результат",
        "lab.vision.photo": "Загрузить своё фото",
        "lab.vision.photoNote": "Твоё фото не покидает этот браузер и нигде не сохраняется.",
        "lab.vision.photoError": "Этот файл не открывается как картинка. Попробуй обычное фото или снимок экрана.",
        "lab.vision.photoReady": "Фото готово: {w}\u00a0×\u00a0{h} пикселей в оттенках серого.",
        "lab.vision.drawHint": "Рисуй мышью, стилусом или пальцем. Работаешь с клавиатуры? Выбери одну из готовых картинок: для рисования нужен указатель.",
        "lab.vision.clear": "Стереть",
        "lab.vision.cleared": "Поле для рисования пустое.",
        "lab.vision.padRole": "поле для рисования",
        "lab.vision.pictureRole": "картинка",
        "lab.vision.pictureSay": "Картинка: {name}.",

        // The picture and its feature map
        "lab.vision.inputCaption": "Картинка · {w}\u00a0×\u00a0{h}",
        "lab.vision.outputCaption": "Карта признаков · {w}\u00a0×\u00a0{h}",
        "lab.vision.inputLabel": "Картинка. Стрелки двигают лупу.",
        "lab.vision.inputLabelDraw": "Поле для рисования. Рисуй мышью, стилусом или пальцем; стрелки двигают лупу.",
        "lab.vision.outputLabel": "Карта признаков: картинка после фильтра",
        "lab.vision.describeInput": "{name}: {w}\u00a0×\u00a0{h} пикселей, средняя яркость {mean} из 255.",
        "lab.vision.describeOutput": "Карта признаков: {w}\u00a0×\u00a0{h} пикселей, значения от {min} до {max}.",
        "lab.vision.legendNegative": "меньше 0",
        "lab.vision.legendZero": "0",
        "lab.vision.legendPositive": "больше 0",
        "lab.vision.legendBlack": "0 — чёрный",
        "lab.vision.legendWhite": "255 — белый",
        "lab.vision.legendGray": "Оттенки: 0 — чёрный, 255 и больше — белый.",
        "lab.vision.legendColors": "Цвета: красный — меньше 0, серый — 0, бирюзовый — больше 0.",
        "lab.vision.statIn": "Яркость картинки",
        "lab.vision.statOut": "Яркость карты",

        // The magnifier
        "lab.vision.loupeTitle": "Компьютер видит числа",
        "lab.vision.loupeWhere": "Строка {row}, столбец {col}",
        "lab.vision.loupeHelp": "Наведи указатель на картинку или нажми на неё и двигай лупу стрелками.",
        "lab.vision.loupeSay": "Строка {row}, столбец {col}: {value}.",
        "lab.vision.loupeOutside": "За краем картинки",

        // The filter
        "lab.vision.filterTitle": "Фильтр",
        "lab.vision.filters": "Готовые фильтры",
        "lab.vision.fIdentity": "Без изменений",
        "lab.vision.fBlur": "Размытие",
        "lab.vision.fSoftBlur": "Мягкое размытие",
        "lab.vision.fSharpen": "Резкость",
        "lab.vision.fVertical": "Вертикальные края",
        "lab.vision.fHorizontal": "Горизонтальные края",
        "lab.vision.fOutline": "Контур",
        "lab.vision.fEmboss": "Тиснение",
        "lab.vision.numbers": "9 чисел фильтра",
        "lab.vision.numbersHelp": "Каждое от −10 до 10. Впиши число или меняй его стрелками.",
        "lab.vision.cell": "Число фильтра: строка {row}, столбец {col}",
        "lab.vision.divisor": "Разделить на",
        "lab.vision.sum": "Сумма 9 чисел: {sum}.",
        "lab.vision.sumDivided": "Сумма 9 чисел: {raw}, после деления на {divisor}: {sum}.",
        "lab.vision.filterSay": "Фильтр: {name}.",
        "lab.vision.edges": "Края картинки",
        "lab.vision.edgesSame": "Тот же размер",
        "lab.vision.edgesValid": "Только полные окна",
        "lab.vision.edgesHelp": "«Тот же размер»: пиксели за краем картинки считаются нулями. «Только полные окна»: карта на 2 пикселя меньше.",
        "lab.vision.relu": "ReLU: минусы становятся нулями",
        "lab.vision.pool": "Макс-пулинг 2\u00a0×\u00a02",
        "lab.vision.poolHelp": "Оставляет самое сильное значение в каждом квадрате 2\u00a0×\u00a02: карта становится вдвое уже.",
        "lab.vision.applyAgain": "Применить ещё раз",
        "lab.vision.backToPicture": "Вернуть картинку",
        "lab.vision.applied": "Фильтр применён {n} раз: теперь картинка — это результат.|Фильтр применён {n} раза: теперь картинка — это результат.|Фильтр применён {n} раз: теперь картинка — это результат.",
        "lab.vision.appliedSay": "Применено ещё раз. Теперь картинка {w}\u00a0×\u00a0{h}.",
        "lab.vision.backSay": "Вернулась исходная картинка.",
        "lab.vision.tooSmall": "Карта слишком маленькая, чтобы применить фильтр ещё раз.",

        // Step by step
        "lab.vision.stepLabel": "Картинка, уменьшенная до 16\u00a0×\u00a016, и её карта признаков. Стрелки двигают окно.",
        "lab.vision.stepRole": "скользящее окно",
        "lab.vision.stepIn": "Картинка 16\u00a0×\u00a016",
        "lab.vision.stepOut": "Карта признаков {w}\u00a0×\u00a0{h}",
        "lab.vision.stepOutShort": "Карта {w}\u00a0×\u00a0{h}",
        "lab.vision.stepWhere": "Окно: строка {row}, столбец {col}",
        "lab.vision.stepCount": "Пиксель {n} из {total}",
        "lab.vision.stepDone": "Вся карта готова.",
        "lab.vision.stepSay": "Строка {row}, столбец {col}: {value}.",
        "lab.vision.stepDescribe": "Окно стоит на строке {row}, столбце {col} картинки 16\u00a0×\u00a016. Сумма здесь: {value}. Готово пикселей карты: {n} из {total}.",
        "lab.vision.eqPixels": "Пиксели",
        "lab.vision.eqFilter": "Фильтр",
        "lab.vision.eqProducts": "Произведения",
        "lab.vision.eqRelu": "после ReLU: {value}",
        "lab.vision.eqOutside": "Пиксели за краем картинки считаются нулями.",
        "lab.vision.eqMap": "Это число попадает в подсвеченный пиксель карты признаков.",
        "lab.vision.calmNote": "Включён спокойный режим, поэтому «Пуска» нет: двигай окно кнопкой «Шаг» или стрелками.",
        "lab.vision.poolStepNote": "Макс-пулинг работает с готовой картой: его видно в режиме «Фильтры».",

        // What a CNN sees
        "lab.vision.cnnTitle": "Маленькая свёрточная сеть",
        "lab.vision.cnnPicture": "Картинка · {w}\u00a0×\u00a0{h}",
        "lab.vision.layer1": "Слой 1: 4 фильтра краёв, потом ReLU и макс-пулинг → 4 карты {w}\u00a0×\u00a0{h}",
        "lab.vision.layer2": "Слой 2: 3 фильтра, каждый смотрит на все 4 карты, потом ReLU и макс-пулинг → 3 карты {w}\u00a0×\u00a0{h}",
        "lab.vision.mapsHelp": "Чем светлее, тем сильнее ответ. Нажми на карту, чтобы увидеть её фильтр.",
        "lab.vision.mapVertical": "Вертикальные края",
        "lab.vision.mapHorizontal": "Горизонтальные края",
        "lab.vision.mapRising": "Наклонные края /",
        "lab.vision.mapFalling": "Наклонные края \\",
        "lab.vision.mapCorners": "Углы ┌",
        "lab.vision.mapEnds": "Концы линий",
        "lab.vision.mapCurves": "Изгибы",
        "lab.vision.aboutVertical": "Ищет края, где картинка становится светлее вправо. Обратные края дают отрицательные числа, и ReLU превращает их в нули.",
        "lab.vision.aboutHorizontal": "Ищет края, где картинка становится светлее вниз. Обратные края дают отрицательные числа, и ReLU превращает их в нули.",
        "lab.vision.aboutRising": "Ищет наклонные края вроде /, где картинка светлеет вниз и вправо.",
        "lab.vision.aboutFalling": "Ищет наклонные края вроде \\, где картинка светлеет вниз и влево.",
        "lab.vision.aboutCorners": "Ищет углы ┌: вертикальный край уходит отсюда вниз, а горизонтальный — вправо. У концов толстых линий тоже есть углы, поэтому он отвечает и там.",
        "lab.vision.aboutEnds": "Ищет места, где край обрывается: концы линий и углы фигур, где один край кончается, а другой начинается.",
        "lab.vision.aboutCurves": "Ищет края, которые сворачивают с прямой. Отвечает и на углах (это самые резкие изгибы), и немного на наклонных линиях: фильтры, заданные вручную, неуклюжие.",
        "lab.vision.aboutLayer2": "У фильтра второго слоя 3\u00a0×\u00a03\u00a0×\u00a04 числа: своя сетка 3\u00a0×\u00a03 для каждой карты первого слоя. Он видит всего около 10\u00a0×\u00a010 пикселей картинки, поэтому находит маленькие изгибы, а не целые круги. Более глубокие слои видят больше.",
        "lab.vision.filterOf": "Фильтр карты «{name}»",
        "lab.vision.onMap": "На карте «{name}»",
        "lab.vision.pickMap": "Нажми на карту, чтобы увидеть её фильтр.",
        "lab.vision.tryFilter": "Попробовать этот фильтр",
        "lab.vision.mapSay": "{name}: показан фильтр этой карты.",
        "lab.vision.honest": "Эти фильтры мы задали вручную. Настоящая свёрточная сеть подбирает фильтры сама, обучаясь на миллионах подписанных картинок. Её первый слой часто становится похож на эти детекторы краёв, а более глубокие слои откликаются на текстуры, части предметов и целые предметы.",
        "lab.vision.crossCorrelation": "В математике такую скользящую сумму называют взаимной корреляцией, но в нейросетях её всё равно называют свёрткой.",

        // The line with glossary links
        "lab.vision.ideaLine": "Скользящая сумма называется {convolution}. Такие фильтры — глаза {vision}: свёрточная {network} складывает их слоями и сама подбирает их числа.",
        "lab.vision.termConvolution": "свёрткой",
        "lab.vision.termVision": "компьютерного зрения",
        "lab.vision.termNetwork": "нейросеть",

        // "What's happening?"
        "lab.vision.step1": "Картинка — это таблица из {w}\u00a0×\u00a0{h} чисел: 0 — чёрный, 255 — белый.",
        "lab.vision.step2": "Фильтр — это 9 чисел. Он проходит по каждому пикселю, умножает 9 пикселей под собой на свои 9 чисел и всё складывает. Получается один новый пиксель: {sum}.",
        "lab.vision.step3": "Фильтр с отрицательными числами с одной стороны и положительными с другой находит края: он светится там, где меняется яркость.",
        "lab.vision.step4": "ReLU оставляет только положительные ответы. Пулинг оставляет самый сильный ответ в каждом квадрате 2\u00a0×\u00a02 и уменьшает карту.",
        "lab.vision.step5": "Свёрточная сеть складывает такие слои стопкой: от краёв к формам, от форм к предметам. А числа фильтров она подбирает сама, когда учится.",
        "lab.vision.realWorld": "В жизни: камеры телефонов, которые находят лица, проверка медицинских снимков, беспилотные машины, читающие дорожные знаки, и приложения, которые узнают растение по фото, — всё это построено на этой идее.",

        // "Try this"
        "lab.vision.ch1": "<strong>Только вертикальные края.</strong> Сделай фильтр, который находит вертикальные края «Шахматной доски», но не горизонтальные.",
        "lab.vision.ch1Why": "Фильтр, который вычитает левый столбец из правого, замечает только перемены слева направо. Вдоль горизонтального края слева и справа одно и то же, поэтому он отвечает 0.",
        "lab.vision.ch2": "<strong>Ярче.</strong> Сделай картинку ярче одним только фильтром, без макс-пулинга.",
        "lab.vision.ch2Why": "Если числа фильтра в сумме больше 1, каждый ровный участок становится светлее: 9 пикселей по 100, умноженные на числа с суммой 1,5, дают 150.",
        "lab.vision.ch3": "<strong>Размой 3 раза.</strong> Выбери «Буквы AI» и фильтр размытия, а потом нажми «Применить ещё раз» 3 раза подряд.",
        "lab.vision.ch3Why": "Каждое размытие смешивает пиксель с соседями и выбрасывает немного деталей. Резкость сделает края чётче, но потерянное не вернёт: этих чисел больше нет.",
        "lab.vision.ch4": "<strong>Крыша.</strong> В режиме «Что видит нейросеть» с картинкой «Дом» найди карту первого слоя, на которой светится крыша, и нажми на неё.",
        "lab.vision.ch4Why": "Скаты крыши — наклонные края, поэтому на них отвечают два диагональных фильтра, каждый на своём скате. Более глубокие слои складывают такие карты вместе: два ската, которые сходятся наверху, — это крыша."
    }
});

/* ----- The data: pictures, ready filters and the tiny network -----
   Pictures are drawn by js/lab/vision.js at 96 x 96 (0 black, 255 white):
   a background, then each shape on top. Shapes: rect (x, y, w, h), circle
   (x, y, r), polygon (points), line (from, to, width), arc (centre x, y,
   radius r, from and to in degrees clockwise from "right", width),
   checker (cells of size px), stripes (diagonal, a period of px).
   Filters: 9 numbers row by row (top left first), then "divide by".
   The network: layer 1 has a 3 x 3 filter per map; layer 2 has one 3 x 3
   grid for each of the 4 layer-1 maps (vertical, horizontal, /, \). */
window.AICompass.content.set("lab.vision", {
    pictures: [
        { id: "shapes", labelKey: "lab.vision.picShapes", background: 20, shapes: [
            { type: "circle", x: 26, y: 28, r: 17, value: 235 },
            { type: "rect", x: 54, y: 12, w: 32, h: 32, value: 165 },
            { type: "polygon", points: [[48, 50], [78, 88], [18, 88]], value: 200 }
        ] },
        { id: "house", labelKey: "lab.vision.picHouse", background: 28, shapes: [
            { type: "rect", x: 0, y: 84, w: 96, h: 12, value: 70 },
            { type: "rect", x: 24, y: 46, w: 48, h: 38, value: 150 },
            { type: "polygon", points: [[14, 48], [48, 14], [82, 48]], value: 215 },
            { type: "rect", x: 42, y: 62, w: 12, h: 22, value: 55 },
            { type: "rect", x: 29, y: 54, w: 10, h: 10, value: 245 },
            { type: "rect", x: 57, y: 54, w: 10, h: 10, value: 245 }
        ] },
        { id: "checker", labelKey: "lab.vision.picChecker", background: 0, shapes: [
            { type: "checker", size: 12, value: 255 }
        ] },
        { id: "letters", labelKey: "lab.vision.picLetters", background: 15, shapes: [
            { type: "line", from: [16, 80], to: [32, 16], width: 8, value: 240 },
            { type: "line", from: [32, 16], to: [48, 80], width: 8, value: 240 },
            { type: "line", from: [22, 58], to: [42, 58], width: 7, value: 240 },
            { type: "line", from: [68, 18], to: [68, 78], width: 8, value: 240 },
            { type: "line", from: [58, 16], to: [78, 16], width: 7, value: 240 },
            { type: "line", from: [58, 80], to: [78, 80], width: 7, value: 240 }
        ] },
        { id: "face", labelKey: "lab.vision.picFace", background: 25, shapes: [
            { type: "circle", x: 48, y: 48, r: 38, value: 200 },
            { type: "circle", x: 35, y: 38, r: 5, value: 30 },
            { type: "circle", x: 61, y: 38, r: 5, value: 30 },
            { type: "arc", x: 48, y: 50, r: 20, from: 25, to: 155, width: 6, value: 30 }
        ] },
        { id: "stripes", labelKey: "lab.vision.picStripes", background: 35, shapes: [
            { type: "stripes", period: 16, value: 220 }
        ] }
    ],
    filters: [
        { id: "identity", labelKey: "lab.vision.fIdentity", numbers: [0, 0, 0, 0, 1, 0, 0, 0, 0], divisor: 1 },
        { id: "blur", labelKey: "lab.vision.fBlur", numbers: [1, 1, 1, 1, 1, 1, 1, 1, 1], divisor: 9 },
        { id: "softBlur", labelKey: "lab.vision.fSoftBlur", numbers: [1, 2, 1, 2, 4, 2, 1, 2, 1], divisor: 16 },
        { id: "sharpen", labelKey: "lab.vision.fSharpen", numbers: [0, -1, 0, -1, 5, -1, 0, -1, 0], divisor: 1 },
        { id: "vertical", labelKey: "lab.vision.fVertical", numbers: [-1, 0, 1, -2, 0, 2, -1, 0, 1], divisor: 1 },
        { id: "horizontal", labelKey: "lab.vision.fHorizontal", numbers: [-1, -2, -1, 0, 0, 0, 1, 2, 1], divisor: 1 },
        { id: "outline", labelKey: "lab.vision.fOutline", numbers: [-1, -1, -1, -1, 8, -1, -1, -1, -1], divisor: 1 },
        { id: "emboss", labelKey: "lab.vision.fEmboss", numbers: [-2, -1, 0, -1, 1, 1, 0, 1, 2], divisor: 1 }
    ],
    network: {
        // Sobel-style edge filters: each answers one way across its edges (brighter to the
        // right, downwards, towards the bottom right, towards the bottom left)
        layer1: [
            { id: "vertical", labelKey: "lab.vision.mapVertical", aboutKey: "lab.vision.aboutVertical",
                numbers: [-1, 0, 1, -2, 0, 2, -1, 0, 1] },
            { id: "horizontal", labelKey: "lab.vision.mapHorizontal", aboutKey: "lab.vision.aboutHorizontal",
                numbers: [-1, -2, -1, 0, 0, 0, 1, 2, 1] },
            { id: "rising", labelKey: "lab.vision.mapRising", aboutKey: "lab.vision.aboutRising",
                numbers: [-2, -1, 0, -1, 0, 1, 0, 1, 2] },
            { id: "falling", labelKey: "lab.vision.mapFalling", aboutKey: "lab.vision.aboutFalling",
                numbers: [0, -1, -2, 1, 0, -1, 2, 1, 0] }
        ],
        // One 3 x 3 grid per layer-1 map, in the order above
        layer2: [
            // ┌ corners: a vertical edge going down from here, a horizontal edge going right
            { id: "corners", labelKey: "lab.vision.mapCorners", aboutKey: "lab.vision.aboutCorners", grids: [
                [0, -2, 0, 0, 1, 0, 0, 1, 0],
                [0, 0, 0, -2, 1, 1, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0]
            ] },
            // edge ends: an edge here (2), minus the two cells along it (−1 each): a straight
            // edge gives 0, an edge that stops gives more
            { id: "ends", labelKey: "lab.vision.mapEnds", aboutKey: "lab.vision.aboutEnds", grids: [
                [0, -1, 0, 0, 2, 0, 0, -1, 0],
                [0, 0, 0, -1, 2, -1, 0, 0, 0],
                [0, 0, -1, 0, 2, 0, -1, 0, 0],
                [-1, 0, 0, 0, 2, 0, 0, 0, -1]
            ] },
            // bends: an edge here, minus the cells straight along it, plus the cells beside them
            { id: "curves", labelKey: "lab.vision.mapCurves", aboutKey: "lab.vision.aboutCurves", grids: [
                [1, -2, 1, 0, 2, 0, 1, -2, 1],
                [1, 0, 1, -2, 2, -2, 1, 0, 1],
                [0, 1, -2, 1, 2, 1, -2, 1, 0],
                [-2, 1, 0, 1, 2, 1, 0, 1, -2]
            ] }
        ]
    }
});
