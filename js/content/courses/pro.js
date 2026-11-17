/* =========================================================
   AI COMPASS — GUIDED COURSE: UNDER THE HOOD
   Stage 4 of "My path": four guided steps for people who code or work
   with data. The real maths of machine learning, done by hand with
   small numbers.
     p1  A neuron by hand
     p2  Gradient descent by hand
     p3  Measure a classifier
     p4  Tokens, embeddings and attention
   The screens are shown one by one by js/learn-play.js. How a screen is
   written is explained at the top of js/content/courses/zero.js:
   - in a "choice", the FIRST option is the right one;
   - a "number" has its "answer" (and a "tolerance" when rounding is fine);
   - "card": the task also becomes a card of the memory check, and two of
     them ("probes" in js/content/learn.js) are asked by the level check.
     A card must make sense alone, so each one repeats what it needs;
   - "mono": true shows the example in the code font (for formulas).
   Russian writes decimals with a comma and separates the parts of a
   vector with a semicolon: (0,5; −1). The window accepts both "0.5" and
   "0,5" as an answer.
   Every number in this file was checked with a small script.
   ========================================================= */

window.AICompass.content.set("course.pro", {
    units: {
        /* ----- p1. A neuron by hand ----- */
        p1: {
            steps: [
                {
                    type: "info", icon: "🧮", mono: true,
                    en: {
                        title: "A neuron is a weighted sum",
                        text: [
                            "Forget the biology. An artificial neuron multiplies each input `x` by a weight `w`, adds a bias `b`, and passes the result through an activation function `f`.",
                            "That is all. A network is this small formula, repeated."
                        ],
                        example: ["z = w₁·x₁ + w₂·x₂ + … + b", "a = f(z)"]
                    },
                    ru: {
                        title: "Нейрон — это взвешенная сумма",
                        text: [
                            "Забудь про биологию. Искусственный нейрон умножает каждый вход `x` на вес `w`, прибавляет смещение `b` и пропускает результат через функцию активации `f`.",
                            "И всё. Нейросеть — это та же маленькая формула, повторённая много раз."
                        ],
                        example: ["z = w₁·x₁ + w₂·x₂ + … + b", "a = f(z)"]
                    }
                },
                {
                    type: "number", answer: -1,
                    en: {
                        q: "Compute z for this neuron: x = (2, 3), w = (0.5, −1), b = 1.",
                        hint: "z = 0.5·2 + (−1)·3 + 1",
                        why: "1 − 3 + 1 = −1. Every neuron of every network does exactly this."
                    },
                    ru: {
                        q: "Вычисли z для такого нейрона: x = (2; 3), w = (0,5; −1), b = 1.",
                        hint: "z = 0,5·2 + (−1)·3 + 1",
                        why: "1 − 3 + 1 = −1. Ровно это делает каждый нейрон любой сети."
                    }
                },
                {
                    type: "info", icon: "⚡", mono: true,
                    en: {
                        title: "Activation functions",
                        text: ["An activation function decides what the neuron passes on. Two common ones:"],
                        example: ["ReLU(z) = max(0, z)", "σ(z) = 1 / (1 + e^(−z))"],
                        note: "ReLU cuts negative values to zero. The sigmoid σ squashes any number into the range from 0 to 1."
                    },
                    ru: {
                        title: "Функции активации",
                        text: ["Функция активации решает, что нейрон передаст дальше. Две распространённые:"],
                        example: ["ReLU(z) = max(0; z)", "σ(z) = 1 / (1 + e^(−z))"],
                        note: "ReLU обрезает отрицательные значения до нуля. Сигмоида σ сжимает любое число в диапазон от 0 до 1."
                    }
                },
                {
                    type: "number", answer: 0, card: "p1a",
                    en: {
                        q: "A neuron computes z = −1. What does it output after ReLU?",
                        hint: "ReLU(z) = max(0, z)",
                        why: "max(0, −1) = 0: the neuron stays silent. A positive z, such as 2.5, would pass through unchanged."
                    },
                    ru: {
                        q: "Нейрон получил z = −1. Что он выдаст после ReLU?",
                        hint: "ReLU(z) = max(0; z)",
                        why: "max(0; −1) = 0: нейрон молчит. Положительное z, например 2,5, прошло бы без изменений."
                    }
                },
                {
                    type: "number", answer: 0.5, card: "p1b",
                    en: {
                        q: "What is σ(0), the sigmoid of zero?",
                        hint: "σ(z) = 1 / (1 + e^(−z)), and e⁰ = 1.",
                        why: "1 / (1 + 1) = 0.5. Zero is the sigmoid's midpoint: a positive z pushes the output towards 1, a negative z towards 0."
                    },
                    ru: {
                        q: "Чему равна σ(0), сигмоида от нуля?",
                        hint: "σ(z) = 1 / (1 + e^(−z)), а e⁰ = 1.",
                        why: "1 / (1 + 1) = 0,5. Ноль — середина сигмоиды: положительное z тянет выход к 1, отрицательное — к 0."
                    }
                },
                {
                    type: "info", icon: "🧱", mono: true,
                    en: {
                        title: "Counting parameters",
                        text: ["In a dense (fully connected) layer every neuron is connected to every input. With n inputs and m neurons, that gives n·m weights and one bias per neuron."],
                        example: ["parameters = n·m + m"]
                    },
                    ru: {
                        title: "Считаем параметры",
                        text: ["В полносвязном слое каждый нейрон соединён с каждым входом. При n входах и m нейронах получается n·m весов и по одному смещению на нейрон."],
                        example: ["параметров = n·m + m"]
                    }
                },
                {
                    type: "number", answer: 15, card: "p1c",
                    en: {
                        q: "A dense layer has 4 inputs and 3 neurons. How many parameters does it have?",
                        hint: "Weights: 4 × 3. Plus one bias for each neuron.",
                        why: "12 weights + 3 biases = 15. A model “with 7 billion parameters” is the same count, only bigger."
                    },
                    ru: {
                        q: "В полносвязном слое 4 входа и 3 нейрона. Сколько у него параметров?",
                        hint: "Весов: 4 × 3. И по одному смещению на каждый нейрон.",
                        why: "12 весов + 3 смещения = 15. Модель «на 7 миллиардов параметров» — это тот же подсчёт, только больше."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A neuron outputs 1 if z > 0 and 0 otherwise. Its weights are w = (1, 1), its bias is b = −1.5, and each input is 0 or 1. Which logic gate is it?",
                        options: ["AND", "OR", "XOR", "NOT"],
                        hint: "Try all four input pairs: (0, 0), (0, 1), (1, 0), (1, 1).",
                        why: "Only (1, 1) gives z = 0.5 > 0. With b = −0.5 the same neuron becomes OR."
                    },
                    ru: {
                        q: "Нейрон выдаёт 1, если z > 0, и 0 в остальных случаях. Его веса w = (1; 1), смещение b = −1,5, а каждый вход равен 0 или 1. Какой это логический элемент?",
                        options: ["И (AND)", "ИЛИ (OR)", "Исключающее ИЛИ (XOR)", "НЕ (NOT)"],
                        hint: "Проверь все четыре пары входов: (0; 0), (0; 1), (1; 0), (1; 1).",
                        why: "Только (1; 1) даёт z = 0,5 > 0. С b = −0,5 тот же нейрон превращается в ИЛИ."
                    }
                },
                {
                    type: "choice", card: "p1d",
                    en: {
                        q: "Why can't a single neuron compute XOR?",
                        options: ["XOR is not linearly separable: no single straight line splits its outputs", "A neuron cannot have negative weights", "XOR needs more than two inputs"],
                        why: "One neuron draws one straight line (a hyperplane). XOR's ones sit on opposite corners, so you need at least one hidden layer. This limit, described in 1969, cooled interest in neural networks for years."
                    },
                    ru: {
                        q: "Почему один нейрон не может вычислить XOR?",
                        options: ["XOR линейно неразделим: его выходы не разделить одной прямой", "У нейрона не бывает отрицательных весов", "Для XOR нужно больше двух входов"],
                        why: "Один нейрон проводит одну прямую (гиперплоскость). Единицы XOR лежат в противоположных углах, поэтому нужен хотя бы один скрытый слой. Это ограничение описали в 1969 году, и интерес к нейросетям остыл на годы."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Why does a network need a non-linear activation between its layers?",
                        options: ["Without it, any stack of layers equals a single linear layer", "It makes training use less memory", "It keeps every weight between 0 and 1"],
                        why: "W₂·(W₁·x) = (W₂·W₁)·x: a product of matrices is just another matrix. The non-linearity is what lets depth add power."
                    },
                    ru: {
                        q: "Зачем сети нелинейная функция активации между слоями?",
                        options: ["Без неё любая стопка слоёв равна одному линейному слою", "С ней обучение тратит меньше памяти", "Она держит все веса между 0 и 1"],
                        why: "W₂·(W₁·x) = (W₂·W₁)·x: произведение матриц — это просто ещё одна матрица. Именно нелинейность позволяет глубине добавлять возможности."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A neuron: `a = f(w·x + b)`.",
                            "`ReLU(z) = max(0, z)`, and `σ(0) = 0.5`.",
                            "A dense layer with n inputs and m neurons has `n·m + m` parameters.",
                            "One neuron separates with one straight line: AND and OR yes, XOR no.",
                            "Depth helps only with a non-linear activation between the layers."
                        ]
                    },
                    ru: {
                        points: [
                            "Нейрон: `a = f(w·x + b)`.",
                            "`ReLU(z) = max(0; z)`, а `σ(0) = 0,5`.",
                            "В полносвязном слое с n входами и m нейронами `n·m + m` параметров.",
                            "Один нейрон разделяет одной прямой: И и ИЛИ — да, XOR — нет.",
                            "Глубина помогает только с нелинейной активацией между слоями."
                        ]
                    }
                }
            ]
        },

        /* ----- p2. Gradient descent by hand ----- */
        p2: {
            steps: [
                {
                    type: "info", icon: "🎯", mono: true,
                    en: {
                        title: "The loss says how wrong the model is",
                        text: ["Training means finding the parameters that make a **loss function** small. Take the smallest possible model: one parameter `w` and this loss:"],
                        example: ["L(w) = (w − 3)²"],
                        note: "The minimum is at w = 3. Pretend we do not know that, and find it step by step."
                    },
                    ru: {
                        title: "Функция потерь показывает, насколько модель ошибается",
                        text: ["Обучение — это поиск параметров, при которых **функция потерь** мала. Возьмём самую маленькую модель: один параметр `w` и такую функцию потерь:"],
                        example: ["L(w) = (w − 3)²"],
                        note: "Минимум находится в точке w = 3. Сделаем вид, что мы этого не знаем, и найдём его шаг за шагом."
                    }
                },
                {
                    type: "info", icon: "⛷️", mono: true,
                    en: {
                        title: "Follow the slope downhill",
                        text: ["The gradient `dL/dw` says how the loss changes when `w` grows. So we step against it. The size of the step is set by the **learning rate** `η`."],
                        example: ["dL/dw = 2·(w − 3)", "w ← w − η · dL/dw"]
                    },
                    ru: {
                        title: "Иди по склону вниз",
                        text: ["Градиент `dL/dw` показывает, как меняется функция потерь, когда `w` растёт. Поэтому мы шагаем против него. Размер шага задаёт **скорость обучения** `η`."],
                        example: ["dL/dw = 2·(w − 3)", "w ← w − η · dL/dw"]
                    }
                },
                {
                    type: "number", answer: 4,
                    en: {
                        q: "L(w) = (w − 3)². What is the gradient dL/dw at w = 5?",
                        hint: "dL/dw = 2·(w − 3)",
                        why: "2·(5 − 3) = 4. It is positive: the loss grows when w grows, so w has to go down."
                    },
                    ru: {
                        q: "L(w) = (w − 3)². Чему равен градиент dL/dw в точке w = 5?",
                        hint: "dL/dw = 2·(w − 3)",
                        why: "2·(5 − 3) = 4. Он положительный: функция потерь растёт вместе с w, значит, w нужно уменьшать."
                    }
                },
                {
                    type: "number", answer: 4.6, tolerance: 0.001, card: "p2a",
                    en: {
                        q: "L(w) = (w − 3)², w = 5, learning rate η = 0.1. What is w after one step of gradient descent?",
                        hint: "w ← w − η·dL/dw, and dL/dw = 2·(w − 3) = 4.",
                        why: "5 − 0.1·4 = 4.6: a small step towards 3."
                    },
                    ru: {
                        q: "L(w) = (w − 3)², w = 5, скорость обучения η = 0,1. Чему равно w после одного шага градиентного спуска?",
                        hint: "w ← w − η·dL/dw, а dL/dw = 2·(w − 3) = 4.",
                        why: "5 − 0,1·4 = 4,6: небольшой шаг в сторону 3."
                    }
                },
                {
                    type: "number", answer: 4.28, tolerance: 0.005,
                    en: {
                        q: "Take a second step from w = 4.6, with the same η = 0.1. What is w now?",
                        hint: "The gradient at 4.6 is 2·(4.6 − 3) = 3.2.",
                        why: "4.6 − 0.1·3.2 = 4.28. The steps get smaller as the slope flattens: here every step removes 20% of the remaining distance to 3."
                    },
                    ru: {
                        q: "Сделай второй шаг из точки w = 4,6 с той же η = 0,1. Чему теперь равно w?",
                        hint: "Градиент в точке 4,6 равен 2·(4,6 − 3) = 3,2.",
                        why: "4,6 − 0,1·3,2 = 4,28. Шаги уменьшаются, потому что склон становится положе: здесь каждый шаг убирает 20% оставшегося расстояния до 3."
                    }
                },
                {
                    type: "choice", card: "p2b",
                    en: {
                        q: "L(w) = (w − 3)², start at w = 5, but now the learning rate is η = 1. What happens?",
                        options: ["w jumps between 5 and 1 forever", "w lands exactly on 3 in one step", "w slowly drifts towards 3", "w grows without limit"],
                        hint: "Take two steps by hand.",
                        why: "5 − 1·4 = 1, then 1 − 1·(−4) = 5, and so on: every step overshoots by exactly the distance it started with. With η = 0.5 one step would land on 3; with η above 1 the jumps grow."
                    },
                    ru: {
                        q: "L(w) = (w − 3)², начинаем с w = 5, но теперь скорость обучения η = 1. Что произойдёт?",
                        options: ["w будет вечно прыгать между 5 и 1", "w попадёт точно в 3 за один шаг", "w будет медленно ползти к 3", "w будет расти без предела"],
                        hint: "Сделай два шага вручную.",
                        why: "5 − 1·4 = 1, затем 1 − 1·(−4) = 5 и так далее: каждый шаг перелетает минимум ровно на то расстояние, с которого начал. При η = 0,5 хватило бы одного шага до 3; при η больше 1 прыжки растут."
                    }
                },
                {
                    type: "number", answer: 0.6, tolerance: 0.005,
                    en: {
                        q: "L(w) = (w − 3)². Now η = 1.1 and w = 5. What is w after one step?",
                        hint: "5 − 1.1·4",
                        why: "5 − 4.4 = 0.6. That is 2.4 away from the minimum: further than the 2 we started with. Every step multiplies the distance by −1.2. This is divergence, and it is what “the loss exploded” means in practice."
                    },
                    ru: {
                        q: "L(w) = (w − 3)². Теперь η = 1,1 и w = 5. Чему равно w после одного шага?",
                        hint: "5 − 1,1·4",
                        why: "5 − 4,4 = 0,6. Это на 2,4 от минимума — дальше, чем 2, с которых мы начали. Каждый шаг умножает расстояние на −1,2. Это расходимость: именно это на практике значит «функция потерь взорвалась»."
                    }
                },
                {
                    type: "info", icon: "🔗", mono: true,
                    en: {
                        title: "With data: the chain rule",
                        text: ["A real loss depends on data. Take one example, x = 2 with the target y = 10, the model `ŷ = w·x` and the squared error. The chain rule carries the gradient through the model:"],
                        example: ["L = (w·x − y)²", "dL/dw = 2·(w·x − y)·x"]
                    },
                    ru: {
                        title: "С данными: цепное правило",
                        text: ["Настоящая функция потерь зависит от данных. Возьмём один пример: x = 2 с правильным ответом y = 10, модель `ŷ = w·x` и квадрат ошибки. Цепное правило проводит градиент сквозь модель:"],
                        example: ["L = (w·x − y)²", "dL/dw = 2·(w·x − y)·x"]
                    }
                },
                {
                    type: "number", answer: -16, card: "p2c",
                    en: {
                        q: "One example: x = 2, y = 10. The model is ŷ = w·x with w = 3, and the loss is L = (w·x − y)². What is dL/dw?",
                        hint: "dL/dw = 2·(w·x − y)·x",
                        why: "2·(6 − 10)·2 = −16. It is negative, so the update w − η·(−16) moves w up, towards the true value 5."
                    },
                    ru: {
                        q: "Один пример: x = 2, y = 10. Модель ŷ = w·x с w = 3, функция потерь L = (w·x − y)². Чему равно dL/dw?",
                        hint: "dL/dw = 2·(w·x − y)·x",
                        why: "2·(6 − 10)·2 = −16. Градиент отрицательный, поэтому шаг w − η·(−16) увеличивает w — в сторону верного значения 5."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Why is the gradient usually computed on a small batch of examples and not on the whole dataset?",
                        options: ["Each step is far cheaper, and many noisy steps beat a few exact ones", "The gradient of the whole dataset points the wrong way", "A small batch has no noise at all"],
                        why: "A step on 32 examples costs a tiny fraction of a pass over millions of them. This is stochastic gradient descent (SGD), and its noise often even helps."
                    },
                    ru: {
                        q: "Почему градиент обычно считают по небольшой пачке примеров, а не по всему набору данных?",
                        options: ["Каждый шаг гораздо дешевле, а много шумных шагов лучше нескольких точных", "Градиент по всему набору указывает не туда", "В маленькой пачке совсем нет шума"],
                        why: "Шаг по 32 примерам стоит крошечную долю прохода по миллионам. Это стохастический градиентный спуск (SGD), и его шум часто даже помогает."
                    }
                },
                {
                    type: "choice", card: "p2d",
                    en: {
                        q: "During training the loss swings up and down wildly and then turns into NaN. What should you try first?",
                        options: ["Lower the learning rate", "Add more layers", "Train for more epochs"],
                        why: "A swinging, exploding loss means the steps are too big: each one overshoots the minimum by more than the last. Lower the learning rate (or clip the gradients)."
                    },
                    ru: {
                        q: "Во время обучения функция потерь сильно скачет вверх-вниз, а потом превращается в NaN. Что стоит попробовать первым?",
                        options: ["Уменьшить скорость обучения", "Добавить слоёв", "Учить больше эпох"],
                        why: "Скачущая и «взрывающаяся» функция потерь значит, что шаги слишком большие: каждый перелетает минимум сильнее предыдущего. Уменьши скорость обучения (или ограничь градиенты)."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Gradient descent: `w ← w − η·dL/dw`.",
                            "A learning rate that is too small is slow; one that is too large oscillates or diverges.",
                            "The chain rule carries the gradient through the model: for `L = (w·x − y)²`, `dL/dw = 2·(w·x − y)·x`.",
                            "Mini-batches give cheaper, noisier steps: this is SGD."
                        ]
                    },
                    ru: {
                        points: [
                            "Градиентный спуск: `w ← w − η·dL/dw`.",
                            "Слишком маленькая скорость обучения — медленно; слишком большая — колебания или расходимость.",
                            "Цепное правило проводит градиент сквозь модель: для `L = (w·x − y)²` получаем `dL/dw = 2·(w·x − y)·x`.",
                            "Мини-пачки дают более дешёвые и шумные шаги: это SGD."
                        ]
                    }
                }
            ]
        },

        /* ----- p3. Measure a classifier ----- */
        p3: {
            steps: [
                {
                    type: "info", icon: "🧾",
                    en: {
                        title: "Four kinds of outcome",
                        text: ["A spam filter checked 100 messages. Compare what it said with the truth:"],
                        table: { side: true, head: ["", "Really spam", "Really not spam"], rows: [["Filter said “spam”", "30", "10"], ["Filter said “not spam”", "5", "55"]] },
                        note: "30 true positives (TP), 10 false positives (FP: good mail in the spam folder), 5 false negatives (FN: spam that got through) and 55 true negatives (TN). This table is called a confusion matrix."
                    },
                    ru: {
                        title: "Четыре вида исходов",
                        text: ["Спам-фильтр проверил 100 писем. Сравним его ответы с тем, что было на самом деле:"],
                        table: { side: true, head: ["", "На самом деле спам", "На самом деле не спам"], rows: [["Фильтр сказал «спам»", "30", "10"], ["Фильтр сказал «не спам»", "5", "55"]] },
                        note: "30 истинно положительных (TP), 10 ложноположительных (FP: хорошие письма в папке «Спам»), 5 ложноотрицательных (FN: спам, который прошёл) и 55 истинно отрицательных (TN). Такая таблица называется матрицей ошибок."
                    }
                },
                {
                    type: "number", answer: 85, unit: "%", card: "p3a",
                    en: {
                        table: { side: true, head: ["", "Really spam", "Really not spam"], rows: [["Filter said “spam”", "30", "10"], ["Filter said “not spam”", "5", "55"]] },
                        q: "Accuracy is the share of all answers that were right. What is the accuracy of this spam filter, in percent?",
                        hint: "(TP + TN) / all = (30 + 55) / 100",
                        why: "85 of the 100 answers were right: 85%."
                    },
                    ru: {
                        table: { side: true, head: ["", "На самом деле спам", "На самом деле не спам"], rows: [["Фильтр сказал «спам»", "30", "10"], ["Фильтр сказал «не спам»", "5", "55"]] },
                        q: "Accuracy — это доля правильных ответов среди всех. Чему она равна у этого спам-фильтра, в процентах?",
                        hint: "(TP + TN) / все = (30 + 55) / 100",
                        why: "85 ответов из 100 были верными: 85%."
                    }
                },
                {
                    type: "number", answer: 75, unit: "%", card: "p3b",
                    en: {
                        table: { side: true, head: ["", "Really spam", "Really not spam"], rows: [["Filter said “spam”", "30", "10"], ["Filter said “not spam”", "5", "55"]] },
                        q: "Precision = TP / (TP + FP): of everything the filter called spam, how much really was spam? Answer in percent.",
                        hint: "30 / (30 + 10)",
                        why: "30 / 40 = 75%. One in four flagged messages was a good one."
                    },
                    ru: {
                        table: { side: true, head: ["", "На самом деле спам", "На самом деле не спам"], rows: [["Фильтр сказал «спам»", "30", "10"], ["Фильтр сказал «не спам»", "5", "55"]] },
                        q: "Точность (precision) = TP / (TP + FP): какая доля писем, которые фильтр назвал спамом, действительно была спамом? Ответ в процентах.",
                        hint: "30 / (30 + 10)",
                        why: "30 / 40 = 75%. Каждое четвёртое письмо, помеченное как спам, было хорошим."
                    }
                },
                {
                    type: "number", answer: 86, tolerance: 0.5, unit: "%", card: "p3c",
                    en: {
                        table: { side: true, head: ["", "Really spam", "Really not spam"], rows: [["Filter said “spam”", "30", "10"], ["Filter said “not spam”", "5", "55"]] },
                        q: "Recall = TP / (TP + FN): of all the real spam, how much did the filter catch? Answer in percent, rounded to a whole number.",
                        hint: "30 / (30 + 5)",
                        why: "30 / 35 ≈ 85.7%, so about 86%. Five spam messages got through."
                    },
                    ru: {
                        table: { side: true, head: ["", "На самом деле спам", "На самом деле не спам"], rows: [["Фильтр сказал «спам»", "30", "10"], ["Фильтр сказал «не спам»", "5", "55"]] },
                        q: "Полнота (recall) = TP / (TP + FN): какую долю настоящего спама фильтр поймал? Ответ в процентах, округли до целого.",
                        hint: "30 / (30 + 5)",
                        why: "30 / 35 ≈ 85,7%, то есть около 86%. Пять спам-писем прошли."
                    }
                },
                {
                    type: "info", icon: "⚖️", mono: true,
                    en: {
                        title: "F1: one number for both",
                        text: ["Precision and recall pull in different directions, so they are often combined into the F1 score, their harmonic mean. It is high only when both are high."],
                        example: ["F1 = 2·P·R / (P + R)"]
                    },
                    ru: {
                        title: "F1: одно число вместо двух",
                        text: ["Точность и полнота тянут в разные стороны, поэтому их часто объединяют в F1-меру — их среднее гармоническое. Она высока, только когда высоки обе."],
                        example: ["F1 = 2·P·R / (P + R)"]
                    }
                },
                {
                    type: "number", answer: 0.8, tolerance: 0.005,
                    en: {
                        q: "For the filter, P = 0.75 and R = 6/7 ≈ 0.857. What is its F1 score, to two decimal places?",
                        hint: "2·0.75·0.857 / (0.75 + 0.857)",
                        why: "≈ 1.286 / 1.607 ≈ 0.80. In exact fractions it is 36/45 = 0.8."
                    },
                    ru: {
                        q: "У фильтра P = 0,75 и R = 6/7 ≈ 0,857. Чему равна его F1-мера с точностью до двух знаков после запятой?",
                        hint: "2·0,75·0,857 / (0,75 + 0,857)",
                        why: "≈ 1,286 / 1,607 ≈ 0,80. В точных дробях это 36/45 = 0,8."
                    }
                },
                {
                    type: "choice", card: "p3d",
                    en: {
                        q: "You raise a spam filter's threshold: now it flags a message only when it is very sure. What usually happens?",
                        options: ["Precision goes up, recall goes down", "Precision and recall both go up", "Recall goes up, precision goes down", "Nothing changes"],
                        why: "Fewer good messages are flagged (fewer FP), but more spam slips through (more FN). You pick the threshold by asking which mistake costs more."
                    },
                    ru: {
                        q: "Ты поднимаешь порог спам-фильтра: теперь он помечает письмо, только когда очень уверен. Что обычно происходит?",
                        options: ["Точность растёт, полнота падает", "Растут и точность, и полнота", "Полнота растёт, точность падает", "Ничего не меняется"],
                        why: "Хороших писем помечается меньше (меньше FP), но больше спама проскакивает (больше FN). Порог выбирают, решив, какая ошибка обходится дороже."
                    }
                },
                {
                    type: "choice", card: "p3e",
                    en: {
                        q: "1% of all payments are fraud. A “model” that always answers “not fraud” has which accuracy, and which recall for fraud?",
                        options: ["99% accuracy and 0% recall", "1% accuracy and 100% recall", "50% accuracy and 50% recall"],
                        why: "It is right about the 99% of honest payments and catches no fraud at all. On imbalanced data, accuracy alone is a trap: look at precision and recall."
                    },
                    ru: {
                        q: "1% всех платежей — мошенничество. «Модель», которая всегда отвечает «не мошенничество», получит какую accuracy и какую полноту по мошенничеству?",
                        options: ["Accuracy 99% и полнота 0%", "Accuracy 1% и полнота 100%", "Accuracy 50% и полнота 50%"],
                        why: "Она права насчёт 99% честных платежей и не ловит ни одного мошенника. На несбалансированных данных одной accuracy доверять нельзя: смотри на точность и полноту."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Which mistake is worse here?",
                        groups: ["Missing a real case (FN)", "A false alarm (FP)"],
                        items: [
                            ["A cancer screening test", 0],
                            ["A spam filter for work mail", 1],
                            ["A smoke detector", 0],
                            ["A tool that fails students for cheating", 1]
                        ],
                        why: "When a missed case is dangerous, tune for recall. When a false alarm hurts someone, tune for precision. Choosing the metric is a decision about people, not only about maths."
                    },
                    ru: {
                        q: "Какая ошибка здесь хуже?",
                        groups: ["Пропустить настоящий случай (FN)", "Ложная тревога (FP)"],
                        items: [
                            ["Скрининг на рак", 0],
                            ["Спам-фильтр рабочей почты", 1],
                            ["Датчик дыма", 0],
                            ["Программа, которая ставит «незачёт» за списывание", 1]
                        ],
                        why: "Когда пропущенный случай опасен, настраивай на полноту. Когда ложная тревога бьёт по человеку — на точность. Выбор метрики — это решение о людях, а не только математика."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Why must the test set stay untouched until the very end?",
                        options: ["Every choice you make by looking at it leaks its information into the model", "The test set is too small to learn anything from", "Test data is always noisier than training data"],
                        why: "Tune on a separate validation set. Once you tune on the test set, its score is no longer an honest estimate of how the model does on new data."
                    },
                    ru: {
                        q: "Почему тестовую выборку нельзя трогать до самого конца?",
                        options: ["Каждое решение, принятое с оглядкой на неё, переносит её информацию в модель", "Тестовая выборка слишком мала, чтобы чему-то по ней научиться", "Тестовые данные всегда более шумные, чем обучающие"],
                        why: "Настраивай модель на отдельной валидационной выборке. Как только ты настраиваешься по тестовой, её результат перестаёт быть честной оценкой того, как модель поведёт себя на новых данных."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "`Accuracy = (TP + TN) / all`, `Precision = TP / (TP + FP)`, `Recall = TP / (TP + FN)`.",
                            "`F1 = 2·P·R / (P + R)`: high only when both are high.",
                            "The threshold trades precision for recall.",
                            "On imbalanced data, accuracy misleads.",
                            "Keep the test set untouched until the end."
                        ]
                    },
                    ru: {
                        points: [
                            "`Accuracy = (TP + TN) / все`, `Precision = TP / (TP + FP)`, `Recall = TP / (TP + FN)`.",
                            "`F1 = 2·P·R / (P + R)`: высока, только когда высоки обе.",
                            "Порог меняет точность на полноту.",
                            "На несбалансированных данных accuracy обманывает.",
                            "Не трогай тестовую выборку до самого конца."
                        ]
                    }
                }
            ]
        },

        /* ----- p4. Tokens, embeddings and attention ----- */
        p4: {
            steps: [
                {
                    type: "info", icon: "🔤",
                    en: {
                        title: "From text to vectors",
                        text: [
                            "A language model never sees letters. The text is cut into **tokens** (words or pieces of words). Each token has a number, and that number picks a row from a big table of vectors: its **embedding**.",
                            "Training moves these vectors so that tokens used in similar ways end up pointing in similar directions."
                        ]
                    },
                    ru: {
                        title: "От текста к векторам",
                        text: [
                            "Языковая модель никогда не видит букв. Текст режется на **токены** (слова или их части). У каждого токена есть номер, и по этому номеру из большой таблицы берётся вектор — его **эмбеддинг**.",
                            "Обучение сдвигает эти векторы так, что токены, которые употребляются похоже, смотрят в похожие стороны."
                        ]
                    }
                },
                {
                    type: "number", answer: 5, card: "p4a",
                    en: {
                        q: "The dot product measures how much two vectors point the same way. For a = (1, 2) and b = (3, 1), what is a·b?",
                        hint: "a·b = a₁·b₁ + a₂·b₂",
                        why: "1·3 + 2·1 = 5."
                    },
                    ru: {
                        q: "Скалярное произведение показывает, насколько два вектора смотрят в одну сторону. Для a = (1; 2) и b = (3; 1) чему равно a·b?",
                        hint: "a·b = a₁·b₁ + a₂·b₂",
                        why: "1·3 + 2·1 = 5."
                    }
                },
                {
                    type: "info", icon: "📐", mono: true,
                    en: {
                        title: "Cosine similarity",
                        text: ["The dot product also grows with the length of the vectors. Dividing by the lengths leaves only the angle: this is the cosine similarity."],
                        example: ["cos(a, b) = a·b / (|a|·|b|)"],
                        note: "1 means the same direction, 0 means perpendicular (unrelated), −1 means opposite."
                    },
                    ru: {
                        title: "Косинусное сходство",
                        text: ["Скалярное произведение растёт ещё и с длиной векторов. Если поделить на длины, останется только угол: это косинусное сходство."],
                        example: ["cos(a, b) = a·b / (|a|·|b|)"],
                        note: "1 — одно направление, 0 — векторы перпендикулярны (не связаны), −1 — противоположные."
                    }
                },
                {
                    type: "number", answer: 0, card: "p4b",
                    en: {
                        q: "What is the cosine similarity of a = (1, 0) and b = (0, 1)?",
                        hint: "Start with the dot product.",
                        why: "a·b = 1·0 + 0·1 = 0, so the cosine is 0: the vectors are perpendicular. For (2, 0) and (5, 0) it would be 1: the same direction, whatever the lengths."
                    },
                    ru: {
                        q: "Чему равно косинусное сходство векторов a = (1; 0) и b = (0; 1)?",
                        hint: "Начни со скалярного произведения.",
                        why: "a·b = 1·0 + 0·1 = 0, значит, косинус равен 0: векторы перпендикулярны. Для (2; 0) и (5; 0) получилась бы 1: направление одно, какой бы ни была длина."
                    }
                },
                {
                    type: "info", icon: "🎚️", mono: true,
                    en: {
                        title: "Softmax turns scores into probabilities",
                        text: ["A model produces a score for every possible next token. Softmax turns the scores into probabilities: all positive, adding up to 1. A higher score gets a bigger share, and the gaps are stretched."],
                        example: ["softmax(z_i) = e^(z_i) / Σ_j e^(z_j)"]
                    },
                    ru: {
                        title: "Softmax превращает оценки в вероятности",
                        text: ["Модель выдаёт оценку для каждого возможного следующего токена. Softmax превращает оценки в вероятности: все положительные, в сумме 1. Чем выше оценка, тем больше доля, причём разрывы растягиваются."],
                        example: ["softmax(z_i) = e^(z_i) / Σ_j e^(z_j)"]
                    }
                },
                {
                    type: "number", answer: 0.5, card: "p4c",
                    en: {
                        q: "Two tokens have the scores (2, 2). What probability does softmax give to the first one?",
                        hint: "e² / (e² + e²)",
                        why: "Equal scores get equal shares: 0.5. Softmax depends on the differences between the scores, not on their size: (100, 100) also gives 0.5."
                    },
                    ru: {
                        q: "У двух токенов оценки (2; 2). Какую вероятность softmax даст первому?",
                        hint: "e² / (e² + e²)",
                        why: "Равные оценки — равные доли: 0,5. Softmax зависит от разницы между оценками, а не от их величины: (100; 100) тоже даёт 0,5."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Three tokens have the scores (5, 1, 1). Roughly what probability does softmax give to the first one?",
                        options: ["About 0.96", "About 0.71", "Exactly 0.5", "About 0.33"],
                        hint: "e⁵ ≈ 148.4 and e¹ ≈ 2.72.",
                        why: "148.4 / (148.4 + 2.72 + 2.72) ≈ 0.96. A gap of 4 in the scores becomes near certainty. (0.71 would be the plain share 5/7: softmax is far sharper.)"
                    },
                    ru: {
                        q: "У трёх токенов оценки (5; 1; 1). Какую примерно вероятность softmax даст первому?",
                        options: ["Около 0,96", "Около 0,71", "Ровно 0,5", "Около 0,33"],
                        hint: "e⁵ ≈ 148,4, а e¹ ≈ 2,72.",
                        why: "148,4 / (148,4 + 2,72 + 2,72) ≈ 0,96. Разрыв в 4 единицы превращается почти в уверенность. (0,71 — это обычная доля 5/7: softmax гораздо резче.)"
                    }
                },
                {
                    type: "info", icon: "👀", mono: true,
                    en: {
                        title: "Attention in one line",
                        text: ["In a transformer every token asks: which other tokens matter to me? It compares its **query** vector with the **key** of every token (dot products), turns those scores into weights with softmax, and takes the weighted average of the tokens' **values**."],
                        example: ["Attention(Q, K, V) = softmax(Q·K^T / √d) · V"]
                    },
                    ru: {
                        title: "Внимание в одну строку",
                        text: ["В трансформере каждый токен спрашивает: какие другие токены для меня важны? Он сравнивает свой вектор-**запрос** с **ключом** каждого токена (скалярные произведения), превращает эти оценки в веса с помощью softmax и берёт взвешенное среднее **значений** токенов."],
                        example: ["Attention(Q, K, V) = softmax(Q·K^T / √d) · V"]
                    }
                },
                {
                    type: "choice", card: "p4d",
                    en: {
                        q: "A sequence has n tokens, and every token attends to every token. How does the number of attention scores grow with n?",
                        options: ["Like n²", "Like n", "Like log n", "Like 2ⁿ"],
                        why: "n queries times n keys gives n² scores. Double the context and attention costs four times as much: one reason long contexts are expensive."
                    },
                    ru: {
                        q: "В последовательности n токенов, и каждый токен смотрит на каждый. Как растёт число оценок внимания с ростом n?",
                        options: ["Как n²", "Как n", "Как log n", "Как 2ⁿ"],
                        why: "n запросов на n ключей — это n² оценок. Удвой контекст, и внимание подорожает вчетверо: это одна из причин, почему длинный контекст стоит дорого."
                    }
                },
                {
                    type: "number", answer: 16,
                    en: {
                        q: "A context of 1,000 tokens needs 1 million attention scores in each attention head. How many million does a context of 4,000 tokens need?",
                        hint: "4 times the tokens, so 4² times the scores.",
                        why: "4,000² = 16,000,000: sixteen million, which is 16 times more for 4 times the text."
                    },
                    ru: {
                        q: "Контексту в 1000 токенов нужен 1 миллион оценок внимания в каждой голове внимания. Сколько миллионов нужно контексту в 4000 токенов?",
                        hint: "Токенов в 4 раза больше, значит, оценок больше в 4² раз.",
                        why: "4000² = 16 000 000: шестнадцать миллионов — в 16 раз больше при тексте в 4 раза длиннее."
                    }
                },
                {
                    type: "choice", card: "p4e",
                    en: {
                        q: "Before softmax, a language model divides its scores by a temperature T. Compared with T = 1, what does T = 0.2 do?",
                        options: ["It sharpens the distribution: the top token wins more often", "It makes every token equally likely", "It changes which token has the highest score"],
                        why: "Dividing by a small T stretches the gaps between the scores, so softmax concentrates on the top one. A high T flattens the distribution: more surprising text, and more mistakes."
                    },
                    ru: {
                        q: "Перед softmax языковая модель делит оценки на температуру T. Что делает T = 0,2 по сравнению с T = 1?",
                        options: ["Делает распределение острее: главный токен побеждает чаще", "Делает все токены одинаково вероятными", "Меняет то, у какого токена самая высокая оценка"],
                        why: "Деление на маленькое T растягивает разрывы между оценками, и softmax сосредоточивается на самой высокой. Большое T сглаживает распределение: текст неожиданнее, ошибок больше."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Attention is a weighted average, so by itself it ignores word order. How does a transformer tell “dog bites man” from “man bites dog”?",
                        options: ["Information about each token's position is added to the model's input", "The tokens are sorted alphabetically first", "It reads the sentence twice"],
                        why: "The position has to be injected: as positional encodings added to the embeddings, or as rotations applied inside attention (RoPE)."
                    },
                    ru: {
                        q: "Внимание — это взвешенное среднее, поэтому само по себе оно не замечает порядка слов. Как трансформер отличает «собака кусает человека» от «человек кусает собаку»?",
                        options: ["К входу модели добавляется информация о позиции каждого токена", "Токены сначала сортируют по алфавиту", "Он читает предложение дважды"],
                        why: "Позицию приходится добавлять отдельно: как позиционные кодировки, прибавленные к эмбеддингам, или как повороты внутри внимания (RoPE)."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Text → tokens → numbers → embedding vectors.",
                            "The dot product and the cosine measure how similar two vectors are.",
                            "Softmax turns scores into probabilities and depends only on their differences.",
                            "`Attention(Q, K, V) = softmax(Q·K^T / √d) · V`, and its cost grows like n².",
                            "Temperature reshapes the distribution; position has to be added separately."
                        ]
                    },
                    ru: {
                        points: [
                            "Текст → токены → номера → векторы-эмбеддинги.",
                            "Скалярное произведение и косинус показывают, насколько похожи два вектора.",
                            "Softmax превращает оценки в вероятности и зависит только от разницы между ними.",
                            "`Attention(Q, K, V) = softmax(Q·K^T / √d) · V`, а его стоимость растёт как n².",
                            "Температура меняет форму распределения; позицию нужно добавлять отдельно."
                        ]
                    }
                }
            ]
        }
    }
});
