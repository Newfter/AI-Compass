/* =========================================================
   AI COMPASS — GUIDED COURSE: UNDER THE HOOD
   Stage 4 of "My path": eight guided steps for people who code or work
   with data. The real maths of machine learning, done by hand with
   small numbers. In the order of the course:
     p1  A neuron by hand
     p2  Gradient descent by hand
     p5  Backpropagation by hand
     p6  Overfitting, and how to catch it
     p3  Measure a classifier
     p4  Tokens, embeddings and attention
     p7  Cross-entropy by hand
     p8  How a model picks the next token
   The screens are shown one by one by js/learn-play.js. How a screen is
   written is explained at the top of js/content/courses/zero.js:
   - in a "choice", the FIRST option is the right one;
   - a "number" has its "answer" (and a "tolerance" when rounding is fine,
     and "share": true when the answer is a share or a probability from 0 to 1:
     then "50%" counts as 0.5);
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
                    type: "number", share: true, answer: 0.5, card: "p1b",
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

        /* ----- p5. Backpropagation by hand ----- */
        p5: {
            steps: [
                {
                    type: "info", icon: "🧱", mono: true,
                    en: {
                        title: "A network is a chain of functions",
                        text: [
                            "A neural network is a chain of functions: each one takes the result of the one before it. **Backpropagation** is the chain rule, applied to this chain from the loss backwards, reusing every intermediate result.",
                            "On the tiny network below you will do one training step by hand: a **forward pass** from the input to the loss, a **backward pass** from the loss to the weights, and an update of both weights."
                        ],
                        example: ["z = w₁·x", "h = ReLU(z)", "ŷ = w₂·h", "L = (ŷ − y)²", "x = 2, y = 10, w₁ = 1, w₂ = 3"],
                        note: "x is the input, y is the target, ŷ is the prediction, L is the loss (the squared error). ReLU(z) = max(0, z). The network has no biases, to keep the arithmetic short."
                    },
                    ru: {
                        title: "Нейросеть — это цепочка функций",
                        text: [
                            "Нейросеть — это цепочка функций: каждая берёт результат предыдущей. **Обратное распространение ошибки** (backpropagation) — это цепное правило, применённое к такой цепочке с конца: от функции потерь назад. Каждый промежуточный результат при этом используется повторно.",
                            "На крошечной сети ниже ты вручную сделаешь один шаг обучения: **прямой проход** от входа к функции потерь, **обратный проход** от функции потерь к весам и обновление обоих весов."
                        ],
                        example: ["z = w₁·x", "h = ReLU(z)", "ŷ = w₂·h", "L = (ŷ − y)²", "x = 2, y = 10, w₁ = 1, w₂ = 3"],
                        note: "x — вход, y — правильный ответ, ŷ — предсказание, L — функция потерь (квадрат ошибки). ReLU(z) = max(0; z). Смещений в этой сети нет, чтобы считать было проще."
                    }
                },
                {
                    type: "number", answer: 6,
                    en: {
                        q: "Start the forward pass: z = w₁·x, h = ReLU(z), ŷ = w₂·h. With x = 2, w₁ = 1 and w₂ = 3, what is the prediction ŷ?",
                        hint: "Go link by link: first z, then h = max(0, z), then ŷ.",
                        why: "z = 1·2 = 2, h = ReLU(2) = 2, ŷ = 3·2 = 6. Keep z and h: the backward pass will need them."
                    },
                    ru: {
                        q: "Начни прямой проход: z = w₁·x, h = ReLU(z), ŷ = w₂·h. Чему равно предсказание ŷ при x = 2, w₁ = 1 и w₂ = 3?",
                        hint: "Иди звено за звеном: сначала z, затем h = max(0; z), затем ŷ.",
                        why: "z = 1·2 = 2, h = ReLU(2) = 2, ŷ = 3·2 = 6. Запомни z и h: они понадобятся на обратном проходе."
                    }
                },
                {
                    type: "number", answer: 16,
                    en: {
                        q: "The forward pass ends with the loss. With ŷ = 6 and the target y = 10, what is L = (ŷ − y)²?",
                        hint: "First the difference ŷ − y, then its square.",
                        why: "(6 − 10)² = (−4)² = 16. The forward pass is done, and every result is stored: z = 2, h = 2, ŷ = 6, L = 16."
                    },
                    ru: {
                        q: "Прямой проход заканчивается функцией потерь. Чему равно L = (ŷ − y)² при ŷ = 6 и правильном ответе y = 10?",
                        hint: "Сначала разность ŷ − y, затем её квадрат.",
                        why: "(6 − 10)² = (−4)² = 16. Прямой проход закончен, и все его результаты сохранены: z = 2, h = 2, ŷ = 6, L = 16."
                    }
                },
                {
                    type: "info", icon: "⛓️", mono: true,
                    en: {
                        title: "Backwards, one local derivative at a time",
                        text: [
                            "To train the network we need to know how each weight affects L. Every link of the chain has a simple **local derivative**: how its output changes when one of its inputs changes.",
                            "The gradient of a weight is the product of the local derivatives along the path from the loss back to that weight."
                        ],
                        example: ["∂L/∂ŷ = 2·(ŷ − y)", "∂ŷ/∂w₂ = h", "∂ŷ/∂h = w₂", "∂h/∂z = ReLU′(z) = 1 if z > 0, else 0", "∂z/∂w₁ = x"],
                        note: "∂ works like the d in dL/dw, but for a function of several variables: ∂L/∂w₂ is how L changes when only w₂ changes. If several paths lead from the loss to a weight, the products along these paths are added."
                    },
                    ru: {
                        title: "Назад, по одной локальной производной за раз",
                        text: [
                            "Чтобы обучать сеть, нужно знать, как каждый вес влияет на L. У каждого звена цепочки есть простая **локальная производная**: она показывает, как меняется выход звена, когда меняется один из его входов.",
                            "Градиент по весу — это произведение локальных производных вдоль пути от функции потерь назад к этому весу."
                        ],
                        example: ["∂L/∂ŷ = 2·(ŷ − y)", "∂ŷ/∂w₂ = h", "∂ŷ/∂h = w₂", "∂h/∂z = ReLU′(z) = 1, если z > 0, иначе 0", "∂z/∂w₁ = x"],
                        note: "Знак ∂ работает так же, как d в dL/dw, но для функции нескольких переменных: ∂L/∂w₂ показывает, как меняется L, когда меняется только w₂. Если от функции потерь к весу ведёт несколько путей, произведения вдоль этих путей складываются."
                    }
                },
                {
                    type: "number", answer: -8,
                    en: {
                        q: "The backward pass starts at the loss. With ŷ = 6 and y = 10, what is ∂L/∂ŷ = 2·(ŷ − y)?",
                        hint: "Be careful with the sign: ŷ is smaller than y.",
                        why: "2·(6 − 10) = 2·(−4) = −8. The minus sign says that the loss falls when ŷ grows. Every gradient in this network starts with this −8: it is computed once and reused."
                    },
                    ru: {
                        q: "Обратный проход начинается с функции потерь. Чему равно ∂L/∂ŷ = 2·(ŷ − y) при ŷ = 6 и y = 10?",
                        hint: "Не потеряй знак: ŷ меньше, чем y.",
                        why: "2·(6 − 10) = 2·(−4) = −8. Минус означает, что функция потерь падает, когда ŷ растёт. Каждый градиент в этой сети начинается с множителя −8: его считают один раз и используют повторно."
                    }
                },
                {
                    type: "number", answer: -16, card: "p5a",
                    en: {
                        q: "A tiny network: h = ReLU(w₁·x), ŷ = w₂·h, L = (ŷ − y)². With x = 2, y = 10, w₁ = 1 and w₂ = 3, what is the gradient of the last weight, ∂L/∂w₂?",
                        hint: "∂L/∂w₂ = ∂L/∂ŷ · h. You need ŷ and h from the forward pass.",
                        why: "Forward: h = ReLU(1·2) = 2, ŷ = 3·2 = 6. Backward: ∂L/∂ŷ = 2·(6 − 10) = −8 and ∂ŷ/∂w₂ = h = 2. So ∂L/∂w₂ = −8·2 = −16: the loss falls when w₂ grows."
                    },
                    ru: {
                        q: "Крошечная сеть: h = ReLU(w₁·x), ŷ = w₂·h, L = (ŷ − y)². Чему равен градиент по последнему весу, ∂L/∂w₂, при x = 2, y = 10, w₁ = 1 и w₂ = 3?",
                        hint: "∂L/∂w₂ = ∂L/∂ŷ · h. Понадобятся ŷ и h из прямого прохода.",
                        why: "Прямой проход: h = ReLU(1·2) = 2, ŷ = 3·2 = 6. Обратный: ∂L/∂ŷ = 2·(6 − 10) = −8 и ∂ŷ/∂w₂ = h = 2. Значит, ∂L/∂w₂ = −8·2 = −16: функция потерь падает, когда w₂ растёт."
                    }
                },
                {
                    type: "number", answer: -48, card: "p5b",
                    en: {
                        q: "A tiny network: h = ReLU(w₁·x), ŷ = w₂·h, L = (ŷ − y)². With x = 2, y = 10, w₁ = 1 and w₂ = 3, what is the gradient of the first weight, ∂L/∂w₁?",
                        hint: "∂L/∂w₁ = ∂L/∂ŷ · w₂ · ReLU′(z) · x, where z = w₁·x.",
                        why: "Forward: z = 1·2 = 2, h = 2, ŷ = 3·2 = 6. Backward: ∂L/∂ŷ = 2·(6 − 10) = −8, ∂ŷ/∂h = w₂ = 3, ReLU′(z) = 1 (because z > 0), ∂z/∂w₁ = x = 2. The product along the path: −8·3·1·2 = −48. The first factor, −8, is shared with ∂L/∂w₂: it is computed once."
                    },
                    ru: {
                        q: "Крошечная сеть: h = ReLU(w₁·x), ŷ = w₂·h, L = (ŷ − y)². Чему равен градиент по первому весу, ∂L/∂w₁, при x = 2, y = 10, w₁ = 1 и w₂ = 3?",
                        hint: "∂L/∂w₁ = ∂L/∂ŷ · w₂ · ReLU′(z) · x, где z = w₁·x.",
                        why: "Прямой проход: z = 1·2 = 2, h = 2, ŷ = 3·2 = 6. Обратный: ∂L/∂ŷ = 2·(6 − 10) = −8, ∂ŷ/∂h = w₂ = 3, ReLU′(z) = 1 (так как z > 0), ∂z/∂w₁ = x = 2. Произведение вдоль пути: −8·3·1·2 = −48. Первый множитель, −8, общий с ∂L/∂w₂: его считают один раз."
                    }
                },
                {
                    type: "choice", card: "p5c",
                    en: {
                        q: "A neuron computes h = ReLU(z) with z = w·x. For one training example, z is negative. What gradient does the weight w get from this example?",
                        options: ["Zero: the slope of ReLU is 0 there, so nothing flows back", "The same as for a positive z: ReLU matters only in the forward pass", "A negative one, equal to z: the neuron passes its input back", "A very large one: the whole error goes to this single weight"],
                        hint: "Which local derivative lies on the path through this neuron?",
                        why: "For z < 0 the neuron outputs 0 and its local derivative ReLU′(z) is 0. The gradient of w is a product that contains this zero, so this example does not move w. A neuron whose z is negative for every example stops learning: this is a **dead ReLU**."
                    },
                    ru: {
                        q: "Нейрон вычисляет h = ReLU(z), где z = w·x. На одном из обучающих примеров z отрицательно. Какой градиент получит вес w от этого примера?",
                        options: ["Нулевой: наклон ReLU там равен 0, и назад ничего не проходит", "Такой же, как при положительном z: ReLU влияет только на прямой проход", "Отрицательный, равный z: нейрон передаёт назад свой вход", "Очень большой: вся ошибка достаётся одному этому весу"],
                        hint: "Какая локальная производная стоит на пути через этот нейрон?",
                        why: "При z < 0 нейрон выдаёт 0, и его локальная производная ReLU′(z) равна 0. Градиент по весу w — произведение, в котором есть этот ноль, поэтому такой пример не сдвигает w. Нейрон, у которого z отрицательно на всех примерах, перестаёт учиться: это **мёртвый нейрон** (dead ReLU)."
                    }
                },
                {
                    type: "number", answer: 3.16,
                    en: {
                        q: "Now update the weights by gradient descent: w ← w − η · gradient, with the learning rate η = 0.01. At the moment w₂ = 3 and its gradient is −16. What is the new w₂?",
                        hint: "Subtracting a negative number is the same as adding. Which way does w₂ move?",
                        why: "3 − 0.01·(−16) = 3 + 0.16 = 3.16. The gradient is negative, so the step raises w₂. That raises ŷ, which was below the target."
                    },
                    ru: {
                        q: "Теперь обнови веса градиентным спуском: w ← w − η · градиент, где скорость обучения η = 0,01. Сейчас w₂ = 3, а его градиент равен −16. Чему равно новое w₂?",
                        hint: "Вычесть отрицательное число — значит прибавить. В какую сторону сдвинется w₂?",
                        why: "3 − 0,01·(−16) = 3 + 0,16 = 3,16. Градиент отрицательный, поэтому шаг увеличивает w₂. От этого растёт ŷ, которое было ниже правильного ответа."
                    }
                },
                {
                    type: "number", answer: 1.48,
                    en: {
                        q: "The same update for the other weight: w₁ = 1, its gradient is −48, and η = 0.01. What is the new w₁?",
                        hint: "w ← w − η · gradient, with the same η.",
                        why: "1 − 0.01·(−48) = 1 + 0.48 = 1.48. We computed both gradients with the old weights and only then updated both weights. The gradient of w₁ is three times as large, so w₁ moved three times as far."
                    },
                    ru: {
                        q: "То же обновление для другого веса: w₁ = 1, его градиент равен −48, а η = 0,01. Чему равно новое w₁?",
                        hint: "w ← w − η · градиент, и η та же.",
                        why: "1 − 0,01·(−48) = 1 + 0,48 = 1,48. Оба градиента мы посчитали по старым весам и только потом обновили оба веса. Градиент по w₁ втрое больше, поэтому w₁ и сдвинулось втрое дальше."
                    }
                },
                {
                    type: "info", icon: "📉", mono: true,
                    en: {
                        title: "Did the step help?",
                        text: ["Check with one more forward pass, now with the new weights w₁ = 1.48 and w₂ = 3.16. One training step moved the prediction from 6 to about 9.35 and cut the loss from 16 to about 0.42:"],
                        example: ["z = 1.48·2 = 2.96", "h = ReLU(2.96) = 2.96", "ŷ = 3.16·2.96 ≈ 9.35", "L = (9.35 − 10)² ≈ 0.42"],
                        note: "Deep learning libraries do exactly this for millions or billions of weights: one forward pass, then one backward pass that gives every gradient. The method is called reverse-mode automatic differentiation."
                    },
                    ru: {
                        title: "Помог ли этот шаг?",
                        text: ["Проверим ещё одним прямым проходом, уже с новыми весами w₁ = 1,48 и w₂ = 3,16. Один шаг обучения сдвинул предсказание с 6 примерно до 9,35 и уменьшил функцию потерь с 16 примерно до 0,42:"],
                        example: ["z = 1,48·2 = 2,96", "h = ReLU(2,96) = 2,96", "ŷ = 3,16·2,96 ≈ 9,35", "L = (9,35 − 10)² ≈ 0,42"],
                        note: "Библиотеки глубокого обучения делают ровно то же для миллионов и миллиардов весов: один прямой проход, затем один обратный, который даёт все градиенты. Метод называется автоматическим дифференцированием в обратном режиме (reverse-mode automatic differentiation)."
                    }
                },
                {
                    type: "choice", card: "p5d",
                    en: {
                        q: "Why does backpropagation run backwards, from the loss towards the inputs?",
                        options: ["One backward pass gives every gradient for about the cost of two forward passes", "The gradients of the early layers do not depend on what the later layers do", "A pass in the forward direction would give the gradients the wrong sign", "Only the last layer needs training, so the computation has to start there"],
                        hint: "Count the passes: how many would it take to find the gradients of a million weights one at a time?",
                        why: "Every gradient is built from the loss backwards, so the weights of the early layers all share the factors of the later layers. A backward pass computes each shared factor once. Going forwards, or testing the weights one by one with small changes, would need about one pass per weight."
                    },
                    ru: {
                        q: "Почему обратное распространение ошибки идёт назад — от функции потерь к входам?",
                        options: ["Один обратный проход даёт все градиенты примерно по цене двух прямых", "Градиенты ранних слоёв не зависят от того, что происходит в поздних слоях", "При проходе в прямом направлении у градиентов получился бы неверный знак", "Обучать нужно только последний слой, поэтому расчёт начинают с него"],
                        hint: "Посчитай проходы: сколько их нужно, чтобы найти градиенты миллиона весов по одному?",
                        why: "Каждый градиент строится от функции потерь назад, поэтому в градиенты по весам ранних слоёв входят одни и те же множители от поздних слоёв. Обратный проход считает каждый общий множитель один раз. Если идти вперёд или по очереди чуть менять веса, понадобится примерно по проходу на каждый вес."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Suppose a gradient is multiplied by about 0.25 in each of 10 layers on its way back (0.25 is the largest slope of the sigmoid). What reaches the first layer?",
                        options: ["Almost nothing: about one millionth of the gradient", "A huge gradient: it grows in every layer", "The same gradient: the depth does not change it", "A gradient whose sign flips in every layer"],
                        hint: "Multiply step by step: 0.25⁵ is already about 0.001.",
                        why: "0.25¹⁰ = (0.25⁵)² ≈ 0.001² = 0.000001: one millionth. This is the **vanishing gradient** problem: it can make the early layers of a deep network learn extremely slowly. What helps: ReLU-like activations (slope 1 where the neuron is active), residual connections (shortcuts around layers) and normalisation."
                    },
                    ru: {
                        q: "Пусть по пути назад градиент в каждом из 10 слоёв умножается примерно на 0,25 (это наибольший наклон сигмоиды). Что дойдёт до первого слоя?",
                        options: ["Почти ничего: около одной миллионной градиента", "Огромный градиент: он растёт в каждом слое", "Тот же градиент: глубина его не меняет", "Градиент, знак которого меняется в каждом слое"],
                        hint: "Умножай по шагам: 0,25⁵ — это уже около 0,001.",
                        why: "0,25¹⁰ = (0,25⁵)² ≈ 0,001² = 0,000001: одна миллионная. Это **затухание градиента** (vanishing gradient): из-за него ранние слои глубокой сети могут учиться крайне медленно. Что помогает: активации вроде ReLU (наклон 1 там, где нейрон активен), остаточные связи в обход слоёв (residual connections) и нормализация."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "The **forward pass** computes the chain from the input to the loss and stores every intermediate value.",
                            "The **backward pass** is the chain rule: local derivatives are multiplied from the loss back, as in `∂L/∂w₁ = ∂L/∂ŷ · ∂ŷ/∂h · ∂h/∂z · ∂z/∂w₁`.",
                            "One backward pass gives the gradient of every weight, for about the cost of two forward passes.",
                            "A gradient can be lost. A ReLU with z < 0 passes back 0 (a dead ReLU if z < 0 for every example). Many small factors multiply to almost nothing (a vanishing gradient)."
                        ]
                    },
                    ru: {
                        points: [
                            "**Прямой проход** вычисляет цепочку от входа до функции потерь и сохраняет каждое промежуточное значение.",
                            "**Обратный проход** — это цепное правило: локальные производные перемножаются от функции потерь назад, например `∂L/∂w₁ = ∂L/∂ŷ · ∂ŷ/∂h · ∂h/∂z · ∂z/∂w₁`.",
                            "Один обратный проход даёт градиент каждого веса примерно по цене двух прямых проходов.",
                            "Градиент можно потерять. ReLU при z < 0 передаёт назад 0 (если так на всех примерах, это мёртвый нейрон). Много малых множителей даёт в произведении почти ноль (затухание градиента)."
                        ]
                    }
                }
            ]
        },

        /* ----- p6. Overfitting, and how to catch it ----- */
        p6: {
            steps: [
                {
                    type: "info", icon: "📊",
                    en: {
                        title: "Two losses, not one",
                        text: [
                            "Training makes the loss small on the examples the model learns from: this is the **training loss**.",
                            "But the model is built to work on new examples. So the loss is also measured on examples that were held back, which the model never trains on: this is the **validation loss**.",
                            "Only the validation loss tells you how the model does on new data. Here are both for one model after 1, 5, 10, 20 and 40 epochs:"
                        ],
                        table: { head: ["Epoch", "Training loss", "Validation loss"], rows: [["1", "0.90", "0.95"], ["5", "0.40", "0.50"], ["10", "0.20", "0.42"], ["20", "0.08", "0.55"], ["40", "0.02", "0.80"]] },
                        note: "An **epoch** is one full pass over all the training examples."
                    },
                    ru: {
                        title: "Потери: два числа, а не одно",
                        text: [
                            "Обучение уменьшает функцию потерь на примерах, на которых модель учится: это **потери на обучении** (training loss).",
                            "Но работать модели предстоит с новыми примерами. Поэтому потери считают ещё и на отложенных примерах, на которых модель никогда не учится: это **потери на валидации** (validation loss).",
                            "Только потери на валидации показывают, как модель справляется с новыми данными. Вот оба числа для одной модели после 1, 5, 10, 20 и 40 эпох:"
                        ],
                        table: { head: ["Эпоха", "Потери на обучении", "Потери на валидации"], rows: [["1", "0,90", "0,95"], ["5", "0,40", "0,50"], ["10", "0,20", "0,42"], ["20", "0,08", "0,55"], ["40", "0,02", "0,80"]] },
                        note: "**Эпоха** — это один полный проход по всем обучающим примерам."
                    }
                },
                {
                    type: "number", answer: 10, card: "p6a",
                    en: {
                        table: { head: ["Epoch", "Training loss", "Validation loss"], rows: [["1", "0.90", "0.95"], ["5", "0.40", "0.50"], ["10", "0.20", "0.42"], ["20", "0.08", "0.55"], ["40", "0.02", "0.80"]] },
                        q: "The table shows the loss of one model on its training examples and on held-back validation examples. At which of these epochs is the model best on new data?",
                        hint: "Which of the two losses is measured on examples the model has not learned from?",
                        why: "The validation loss is measured on examples the model did not train on, and it is lowest at epoch 10 (0.42). After that it rises, although the training loss keeps falling. Keeping the weights of that epoch and stopping the training is called **early stopping**."
                    },
                    ru: {
                        table: { head: ["Эпоха", "Потери на обучении", "Потери на валидации"], rows: [["1", "0,90", "0,95"], ["5", "0,40", "0,50"], ["10", "0,20", "0,42"], ["20", "0,08", "0,55"], ["40", "0,02", "0,80"]] },
                        q: "В таблице — потери одной модели на обучающих примерах и на отложенных валидационных. На какой из этих эпох модель лучше всего справляется с новыми данными?",
                        hint: "В каком из двух столбцов — потери на примерах, на которых модель не училась?",
                        why: "Потери на валидации считают на примерах, на которых модель не училась, и на эпохе 10 они наименьшие (0,42). Дальше они растут, хотя потери на обучении продолжают падать. Оставить веса этой эпохи и прекратить обучение — это **ранняя остановка** (early stopping)."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "From epoch 10 to epoch 40 the training loss kept falling, from 0.20 to 0.02, while the validation loss kept rising, from 0.42 to 0.80. What is happening?",
                        options: ["Overfitting: the model is memorising its training examples, noise included", "Underfitting: the model is too simple to learn the pattern in the data", "The learning rate is too low, so the model has almost stopped learning", "There are too few held-back examples, so the rise is just random noise"],
                        hint: "Look at the two losses one at a time: on which examples is the model still getting better?",
                        why: "The model keeps improving on the examples it trains on and gets worse on examples it has never trained on. It is learning the details and the random noise of its training examples, which do not help on new data: this is **overfitting**. **Underfitting** is the opposite: even the training loss stays high."
                    },
                    ru: {
                        q: "С эпохи 10 по эпоху 40 потери на обучении продолжали падать, с 0,20 до 0,02, а потери на валидации всё это время росли, с 0,42 до 0,80. Что происходит?",
                        options: ["Переобучение: модель заучивает обучающие примеры вместе с шумом", "Недообучение: модель слишком проста, чтобы уловить закономерность", "Скорость обучения слишком мала, и модель почти перестала учиться", "Отложенных примеров слишком мало, и этот рост — просто случайный шум"],
                        hint: "Рассмотри потери на обучении и на валидации по отдельности: на каких примерах модель всё ещё становится лучше?",
                        why: "На своих обучающих примерах модель становится всё лучше, а на тех, на которых не училась, — всё хуже. Она заучивает подробности и случайный шум обучающих примеров, а на новых данных они не помогают: это **переобучение** (overfitting). **Недообучение** (underfitting) — наоборот: высокими остаются даже потери на обучении."
                    }
                },
                {
                    type: "info", icon: "✂️",
                    en: {
                        title: "Split the data into three parts",
                        text: [
                            "You have just used the validation loss to choose an epoch. But a score is an honest estimate for new data only if the examples it was measured on played no part in any choice: neither in fitting the weights nor in picking a setting.",
                            "So the data is split into three parts before training, and each part has one job:"
                        ],
                        example: ["**Training set**: for fitting the weights.", "**Validation set**: for choosing the hyperparameters and the moment to stop.", "**Test set**: for reporting the result, once, at the very end."],
                        note: "**Hyperparameters** are the settings that gradient descent does not learn: for example the learning rate or the number of layers."
                    },
                    ru: {
                        title: "Раздели данные на три части",
                        text: [
                            "Только что мы выбрали эпоху по потерям на валидации. Но результат — честная оценка качества на новых данных, только если примеры, на которых он получен, не участвовали ни в одном решении: ни в подборе весов, ни в выборе настроек.",
                            "Поэтому до обучения данные делят на три части, и у каждой своя задача:"
                        ],
                        example: ["**Обучающая выборка**: по ней подбирают веса.", "**Валидационная выборка**: по ней выбирают гиперпараметры и момент остановки.", "**Тестовая выборка**: её используют один раз, в самом конце, чтобы сообщить результат."],
                        note: "**Гиперпараметры** — это настройки, которые градиентный спуск не подбирает: например, скорость обучения или число слоёв."
                    }
                },
                {
                    type: "number", answer: 1400,
                    en: {
                        q: "A dataset has 2000 examples. You hold back 15% for validation and 15% for testing. How many examples are left for training?",
                        hint: "What share is left when both parts are held back?",
                        why: "100% − 15% − 15% = 70%, and 70% of 2000 is 0.7·2000 = 1400. The other 600 examples (300 for validation, 300 for testing) never train the model: that is the price of an honest score."
                    },
                    ru: {
                        q: "В наборе данных 2000 примеров. Ты откладываешь 15% на валидацию и 15% на тест. Сколько примеров остаётся для обучения?",
                        hint: "Какая доля останется, если отложить обе части?",
                        why: "100% − 15% − 15% = 70%, а 70% от 2000 — это 0,7·2000 = 1400. Остальные 600 примеров (300 на валидацию и 300 на тест) в обучении не участвуют: это плата за честный результат."
                    }
                },
                {
                    type: "choice", card: "p6b",
                    en: {
                        q: "You train a model 50 times, each time with different hyperparameters, and keep the version with the best score on the test set. What is wrong with reporting that score as the result on new data?",
                        options: ["It is too optimistic: the test set helped to choose, so it is no longer unseen data", "Nothing is wrong: choosing the best settings is exactly what a test set is for", "It is too pessimistic: on truly new data the model will score higher than that", "Only the score on the training set is honest, so only that one may be reported"],
                        hint: "Did the test set take part in a decision?",
                        why: "The best of 50 scores is partly luck: some settings suit these particular test examples by chance. Picking by the test score makes that luck part of the result, so on truly new data the score will usually be lower. Choose on the validation set, and use the test set once, at the very end."
                    },
                    ru: {
                        q: "Модель обучили 50 раз с разными гиперпараметрами и оставили вариант с лучшим результатом на тестовой выборке. Что не так, если представить этот результат как качество на новых данных?",
                        options: ["Он завышен: тестовая выборка помогала выбирать и перестала быть новыми данными", "Всё в порядке: тестовая выборка как раз и нужна, чтобы выбирать лучшие настройки", "Он занижен: на действительно новых данных модель покажет результат ещё выше", "Честен только результат на обучающей выборке, и сообщать можно только его"],
                        hint: "Участвовала ли тестовая выборка в каком-нибудь решении?",
                        why: "Лучший из 50 результатов — отчасти везение: какие-то настройки случайно подошли именно этим тестовым примерам. Если выбирать по тестовой выборке, это везение попадает в результат, поэтому на действительно новых данных он обычно ниже. Выбирай по валидационной выборке, а тестовую используй один раз, в самом конце."
                    }
                },
                {
                    type: "info", icon: "🧲", mono: true,
                    en: {
                        title: "Regularisation: make large weights cost something",
                        text: [
                            "To fit individual examples and their noise, a model often needs large weights. **Regularisation** means changing the training so that such memorising gets harder.",
                            "A very common kind, the **L2 penalty**, puts a price on large weights. To the usual loss `L_data` it adds the sum of all the squared weights, multiplied by a small number λ. Training now minimises the loss together with the penalty, so the model keeps a large weight only if it really helps."
                        ],
                        example: ["L_total = L_data + λ·Σw²", "Σw² = w₁² + w₂² + …"],
                        note: "λ is a hyperparameter: it sets the price. Another common regulariser is **dropout**: at each training step a random share of the neurons is switched off, so the network cannot rely on any single one."
                    },
                    ru: {
                        title: "Регуляризация: пусть большие веса чего-то стоят",
                        text: [
                            "Чтобы подогнаться под отдельные примеры и их шум, модели часто нужны большие веса. **Регуляризация** — это изменения в обучении, которые мешают такой зубрёжке.",
                            "Очень распространённый вид регуляризации — **L2-штраф**: он назначает цену за большие веса. К обычной функции потерь `L_data` он прибавляет сумму квадратов всех весов, умноженную на небольшое число λ. Обучение теперь уменьшает потери вместе со штрафом, и модель оставляет большой вес, только если он действительно помогает."
                        ],
                        example: ["L_total = L_data + λ·Σw²", "Σw² = w₁² + w₂² + …"],
                        note: "λ — гиперпараметр: он задаёт цену. Ещё один распространённый способ регуляризации — **dropout** (дропаут): на каждом шаге обучения случайная часть нейронов отключается, и сеть не может полагаться ни на один из них."
                    }
                },
                {
                    type: "number", answer: 0.25, card: "p6c",
                    en: {
                        q: "A model has two weights: w = (3, −4). An L2 penalty adds λ·Σw² to the loss: λ times the sum of the squared weights. With λ = 0.01, how much does it add?",
                        hint: "Square each weight first.",
                        why: "The squares are 3² = 9 and (−4)² = 16. Their sum is 25, and 0.01·25 = 0.25. The sign of a weight does not matter, only its size, and the square makes large weights cost much more than small ones."
                    },
                    ru: {
                        q: "У модели два веса: w = (3; −4). L2-штраф прибавляет к функции потерь λ·Σw²: сумму квадратов весов, умноженную на λ. Сколько он прибавит при λ = 0,01?",
                        hint: "Сначала возведи каждый вес в квадрат.",
                        why: "Квадраты весов: 3² = 9 и (−4)² = 16. Их сумма равна 25, а 0,01·25 = 0,25. Знак веса не важен, важна только его величина, а из-за квадрата большие веса обходятся гораздо дороже маленьких."
                    }
                },
                {
                    type: "number", answer: 1,
                    en: {
                        q: "For one weight the L2 penalty is λ·w², so its gradient with respect to w is 2λw. What is this gradient for w = 5 and λ = 0.1?",
                        hint: "Put the numbers into 2·λ·w.",
                        why: "2·0.1·5 = 1. In the update w ← w − η · gradient (η is the learning rate) the penalty therefore subtracts η·2λw: at every step it takes the same small fraction off each weight and pulls it towards zero. So L2 regularisation is also called **weight decay**: with plain gradient descent the two are the same thing."
                    },
                    ru: {
                        q: "L2-штраф за один вес равен λ·w², поэтому его градиент по w равен 2λw. Чему равен этот градиент при w = 5 и λ = 0,1?",
                        hint: "Подставь числа в 2·λ·w.",
                        why: "2·0,1·5 = 1. В обновлении w ← w − η · градиент (η — скорость обучения) штраф вычитает из веса η·2λw: на каждом шаге он отнимает у каждого веса одну и ту же малую долю и тянет его к нулю. Поэтому L2-регуляризацию называют ещё **затуханием весов** (weight decay): при обычном градиентном спуске это одно и то же."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "A model overfits. Which of these changes fight overfitting, and which make it worse?",
                        groups: ["Fights overfitting", "Makes it worse"],
                        items: [
                            ["Collect more training examples, and more varied ones", 0],
                            ["Cut the training set in half", 1],
                            ["Stop early: keep the epoch with the lowest validation loss", 0],
                            ["Train for many more epochs after the validation loss starts to rise", 1],
                            ["Remove dropout and weight decay from the model", 1],
                            ["Add dropout or an L2 penalty", 0]
                        ],
                        why: "The changes that fight overfitting all make memorising harder or less useful: more varied examples, a price on large weights, neurons switched off at random, stopping in time. Fewer examples, extra epochs and no regularisation make memorising easier."
                    },
                    ru: {
                        q: "Модель переобучается. Какие из этих изменений борются с переобучением, а какие его усиливают?",
                        groups: ["Борется с переобучением", "Усиливает его"],
                        items: [
                            ["Собрать больше обучающих примеров, причём более разнообразных", 0],
                            ["Убрать половину обучающей выборки", 1],
                            ["Остановиться раньше: взять эпоху с наименьшими потерями на валидации", 0],
                            ["Учить ещё много эпох после того, как потери на валидации начали расти", 1],
                            ["Убрать из модели dropout и затухание весов", 1],
                            ["Добавить dropout или L2-штраф", 0]
                        ],
                        why: "Все средства от переобучения затрудняют зубрёжку или делают её менее полезной: более разнообразные примеры, плата за большие веса, случайно отключённые нейроны, своевременная остановка. Меньше примеров, лишние эпохи и отказ от регуляризации зубрёжку облегчают."
                    }
                },
                {
                    type: "choice", card: "p6d",
                    en: {
                        q: "A model has a training loss of 0.45 and a validation loss of 0.47. Both are too high for the task. What is the problem, and what should you do?",
                        options: ["Underfitting: use a bigger model or train it for longer", "Overfitting: add dropout or a stronger L2 penalty", "Validation examples leaked into training: remove them", "The validation set is too large: move some of it into training"],
                        hint: "First compare the two losses with each other: is there a gap between them?",
                        why: "The two losses are almost equal, so there is no sign of memorising: the model is as bad on its own training examples as on new ones. It is too simple, or has trained too little, to learn the pattern: this is **underfitting**. A bigger model or longer training can help. More regularisation or more data would not."
                    },
                    ru: {
                        q: "У модели потери на обучающей выборке 0,45, а на валидационной — 0,47. Оба значения слишком велики для задачи. В чём проблема и что с ней делать?",
                        options: ["Недообучение: взять модель побольше или учить её дольше", "Переобучение: добавить dropout или усилить L2-штраф", "Валидационные примеры попали в обучающие: убрать их оттуда", "Валидационная выборка слишком велика: перенести часть в обучающую"],
                        hint: "Сначала сравни два значения потерь между собой: есть ли между ними разрыв?",
                        why: "Потери почти равны, значит, признаков зубрёжки нет: на своих обучающих примерах модель так же плоха, как на новых. Она слишком проста или училась слишком мало, чтобы уловить закономерность: это **недообучение**. Помочь может модель побольше или более долгое обучение. А добавлять регуляризацию или данные бесполезно."
                    }
                },
                {
                    type: "reveal", icon: "🤔",
                    en: {
                        q: "A model has 99% accuracy on its validation set and still fails in production, with real users. How can that be?",
                        answer: [
                            "The world may differ from the data. New users, new devices or a new season bring examples unlike the ones the model was trained and validated on. This is **distribution shift**.",
                            "The validation set may not have been truly unseen. Perhaps it included copies of training examples, or the data contained information from the future, which does not exist yet when the model has to answer. This is **data leakage**, and it makes the score look better than it is.",
                            "The number may have hidden the problem. If only 1% of the cases are positive, a model that always answers “no” is 99% accurate and finds nothing."
                        ]
                    },
                    ru: {
                        q: "У модели accuracy 99% на валидационной выборке, но в продакшене, на реальных пользователях, она всё равно подводит. Как такое может быть?",
                        answer: [
                            "Мир может отличаться от данных. Новые пользователи, новые устройства или новый сезон приносят примеры, не похожие на те, на которых модель обучали и проверяли. Это **сдвиг распределения** (distribution shift).",
                            "Валидационная выборка могла не быть по-настоящему новой. Возможно, в неё попали копии обучающих примеров или в данных были сведения из будущего, которых ещё нет в тот момент, когда модель должна ответить. Это **утечка данных** (data leakage): из-за неё результат выглядит лучше, чем на самом деле.",
                            "Число могло скрывать проблему. Если положительных случаев всего 1%, модель, которая всегда отвечает «нет», получает accuracy 99% и не находит ничего."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Judge a model by its loss on held-back examples, not its training loss: only examples it never trained on show how it does on new data.",
                            "Training loss falls while validation loss rises: **overfitting**. Both stay high: **underfitting**.",
                            "Train to fit the weights, validate to choose, test once to report.",
                            "An L2 penalty `λ·Σw²`, dropout, more varied data and early stopping all fight overfitting."
                        ]
                    },
                    ru: {
                        points: [
                            "Суди о модели по потерям на отложенных примерах, а не на обучающих: только примеры, на которых она не училась, показывают, как она справляется с новыми данными.",
                            "Потери на обучении падают, а на валидации растут — это **переобучение**. И те и другие остаются высокими — **недообучение**.",
                            "Обучающая выборка — чтобы подбирать веса, валидационная — чтобы выбирать, тестовая — чтобы один раз сообщить результат.",
                            "С переобучением борются L2-штраф `λ·Σw²`, dropout, более разнообразные данные и ранняя остановка."
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
                    type: "number", share: true, answer: 0.8, tolerance: 0.005,
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
                    type: "number", share: true, answer: 0.5, card: "p4c",
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
        },

        /* ----- p7. Cross-entropy by hand ----- */
        p7: {
            steps: [
                {
                    type: "info", icon: "🎯", mono: true,
                    en: {
                        title: "A classifier answers with probabilities",
                        text: [
                            "A neural classifier gives every class a score, called a **logit**, and softmax turns the logits into probabilities. For a photo and the classes cat, dog and fox, the answer might be p = (0.7, 0.2, 0.1).",
                            "The loss has to say in one number how bad this answer is. It should be small when the true class (what the photo really shows) gets a high probability. The usual choice is the **cross-entropy**: minus the natural logarithm (ln) of the probability given to the true class."
                        ],
                        example: ["L = −ln p(true class)", "photo of a cat: L = −ln 0.7 ≈ 0.36", "photo of a fox: L = −ln 0.1 ≈ 2.30"],
                        note: "The full formula compares the target y with the prediction p: `L = −Σ_i y_i·ln p_i`. Here `y_i` is 1 for the true class and 0 for the others, so only one term of the sum is left."
                    },
                    ru: {
                        title: "Классификатор отвечает вероятностями",
                        text: [
                            "Нейросеть-классификатор выдаёт для каждого класса оценку — **логит** (logit), а softmax превращает логиты в вероятности. Например, для фотографии и классов «кошка», «собака» и «лиса» ответ может быть таким: p = (0,7; 0,2; 0,1).",
                            "Функция потерь должна одним числом показать, насколько плох этот ответ. Она должна быть малой, когда правильный класс (то, что на самом деле на фото) получил высокую вероятность. Обычно берут **кросс-энтропию** (cross-entropy): минус натуральный логарифм (ln) вероятности правильного класса."
                        ],
                        example: ["L = −ln p(правильный класс)", "на фото кошка: L = −ln 0,7 ≈ 0,36", "на фото лиса: L = −ln 0,1 ≈ 2,30"],
                        note: "Полная формула сравнивает правильный ответ y с предсказанием p: `L = −Σ_i y_i·ln p_i`. Здесь `y_i` равно 1 для правильного класса и 0 для остальных, так что от суммы остаётся одно слагаемое."
                    }
                },
                {
                    type: "info", icon: "📋",
                    en: {
                        title: "What a probability costs: −ln p",
                        text: [
                            "The table shows the loss for different probabilities of the true class. The loss is 0 only when p = 1, and it grows without limit as p falls towards 0.",
                            "Being unsure is cheap: 0.69 at p = 0.5. Being confident and wrong is expensive: if the true class got only 0.01, the loss is 4.61."
                        ],
                        table: { head: ["p (true class)", "−ln p"], rows: [["1", "0"], ["0.9", "0.11"], ["0.5", "0.69"], ["0.25", "1.39"], ["0.1", "2.30"], ["0.01", "4.61"]] },
                        note: "Every halving of p adds the same amount to the loss, ln 2 ≈ 0.693: falling from 0.02 to 0.01 costs as much as falling from 1 to 0.5."
                    },
                    ru: {
                        title: "Сколько стоит вероятность: −ln p",
                        text: [
                            "В таблице — функция потерь при разных вероятностях правильного класса. Она равна 0, только когда p = 1, и растёт без предела, когда p приближается к 0.",
                            "Неуверенность стоит недорого: 0,69 при p = 0,5. Уверенная ошибка стоит дорого: если правильному классу досталось всего 0,01, функция потерь равна 4,61."
                        ],
                        table: { head: ["p (правильный класс)", "−ln p"], rows: [["1", "0"], ["0,9", "0,11"], ["0,5", "0,69"], ["0,25", "1,39"], ["0,1", "2,30"], ["0,01", "4,61"]] },
                        note: "Каждое уменьшение p вдвое прибавляет к функции потерь одно и то же число, ln 2 ≈ 0,693: падение с 0,02 до 0,01 стоит столько же, сколько падение с 1 до 0,5."
                    }
                },
                {
                    type: "number", answer: 0.69, tolerance: 0.005, card: "p7a",
                    en: {
                        q: "A model gives the true class the probability 0.5. What is its cross-entropy loss −ln(0.5), to two decimal places?",
                        hint: "−ln(0.5) = ln 2. It is the natural logarithm, not the base-10 one, and the result is positive.",
                        why: "−ln(0.5) = ln(1 / 0.5) = ln 2 ≈ 0.693, so 0.69. This is the loss of a fifty-fifty answer between two classes: the answer of a model that always says 0.5 and has learned nothing. So a loss that stays near 0.69 in a two-class task is a warning sign."
                    },
                    ru: {
                        q: "Модель дала правильному классу вероятность 0,5. Чему равна кросс-энтропия −ln(0,5)? Ответ округли до сотых.",
                        hint: "−ln(0,5) = ln 2. Это натуральный логарифм, а не десятичный, и результат положительный.",
                        why: "−ln(0,5) = ln(1 / 0,5) = ln 2 ≈ 0,693, то есть 0,69. Столько стоит ответ «пятьдесят на пятьдесят» при двух классах: его даёт модель, которая всегда отвечает 0,5 и ничему не научилась. Поэтому, если при двух классах функция потерь держится около 0,69, это тревожный знак."
                    }
                },
                {
                    type: "number", answer: 0.69, tolerance: 0.01,
                    en: {
                        table: { head: ["p (true class)", "−ln p"], rows: [["1", "0"], ["0.9", "0.11"], ["0.5", "0.69"], ["0.25", "1.39"], ["0.1", "2.30"], ["0.01", "4.61"]] },
                        q: "The loss of a batch is usually the mean loss of its examples. Three examples get the true-class probabilities 0.5, 0.25 and 1. What is the mean loss, to two decimal places? Use the table.",
                        hint: "Look up −ln p for each of the three probabilities, add the results and divide by 3.",
                        why: "(0.69 + 1.39 + 0) / 3 = 2.08 / 3 ≈ 0.69. In exact form: (ln 2 + 2·ln 2 + 0) / 3 = ln 2. The mean is the same as for three fifty-fifty answers, although one answer was perfect: one number does not show how the loss is spread over the examples."
                    },
                    ru: {
                        table: { head: ["p (правильный класс)", "−ln p"], rows: [["1", "0"], ["0,9", "0,11"], ["0,5", "0,69"], ["0,25", "1,39"], ["0,1", "2,30"], ["0,01", "4,61"]] },
                        q: "Функцию потерь для пачки (batch) обычно считают как среднее по её примерам. В трёх примерах правильный класс получил вероятности 0,5; 0,25 и 1. Чему равно это среднее? Ответ округли до сотых. Используй таблицу.",
                        hint: "Найди в таблице −ln p для каждой из трёх вероятностей, сложи результаты и раздели на 3.",
                        why: "(0,69 + 1,39 + 0) / 3 = 2,08 / 3 ≈ 0,69. Точное значение: (ln 2 + 2·ln 2 + 0) / 3 = ln 2. Среднее такое же, как у трёх ответов «пятьдесят на пятьдесят», хотя один ответ был идеальным: одно число не показывает, как потери распределены по примерам."
                    }
                },
                {
                    type: "number", answer: 4.61, tolerance: 0.01,
                    en: {
                        table: { head: ["p (true class)", "−ln p"], rows: [["1", "0"], ["0.9", "0.11"], ["0.5", "0.69"], ["0.25", "1.39"], ["0.1", "2.30"], ["0.01", "4.61"]] },
                        q: "A model gives 0.99 to class A and 0.01 to class B. The true class is B. What is the loss? Use the table.",
                        hint: "Only the probability of the true class goes into L = −ln p.",
                        why: "−ln(0.01) ≈ 4.61. The 0.99 for the wrong class is not in the formula: only the 0.01 of the true class counts. One confident mistake costs more than six fifty-fifty answers together: 6 · 0.69 = 4.14."
                    },
                    ru: {
                        table: { head: ["p (правильный класс)", "−ln p"], rows: [["1", "0"], ["0,9", "0,11"], ["0,5", "0,69"], ["0,25", "1,39"], ["0,1", "2,30"], ["0,01", "4,61"]] },
                        q: "Модель дала классу A вероятность 0,99, а классу B — 0,01. Правильный класс — B. Чему равна функция потерь? Используй таблицу.",
                        hint: "В формулу L = −ln p входит только вероятность правильного класса.",
                        why: "−ln(0,01) ≈ 4,61. Вероятность 0,99 у неправильного класса в формулу не входит: учитывается только 0,01 у правильного. Одна уверенная ошибка стоит дороже шести ответов «пятьдесят на пятьдесят», вместе взятых: 6 · 0,69 = 4,14."
                    }
                },
                {
                    type: "info", icon: "🧮", mono: true,
                    en: {
                        title: "Why not accuracy?",
                        text: [
                            "Why not train a model on accuracy itself, the share of right answers? A tiny shift of a weight almost never changes any answer, so accuracy stays the same. Its gradient is zero almost everywhere, and gradient descent gets no direction.",
                            "Cross-entropy changes smoothly with the probabilities, so it does give a direction. And together with softmax it has a very simple gradient with respect to the logits z: the prediction minus the target."
                        ],
                        example: ["∂L/∂z = p − y"],
                        note: "y is the **one-hot** target: 1 for the true class and 0 for the others. With three classes and the first one true, y = (1, 0, 0)."
                    },
                    ru: {
                        title: "Почему не accuracy?",
                        text: [
                            "Почему бы не обучать модель прямо по accuracy — доле правильных ответов? Крошечный сдвиг веса почти никогда не меняет ни одного ответа, так что accuracy остаётся прежней. Её градиент почти везде равен нулю, и градиентный спуск не знает, в каком направлении шагать.",
                            "Кросс-энтропия плавно меняется вместе с вероятностями, поэтому направление она даёт. А в паре с softmax у неё очень простой градиент по логитам z: предсказание минус правильный ответ."
                        ],
                        example: ["∂L/∂z = p − y"],
                        note: "y — правильный ответ в виде **one-hot-вектора**: 1 для правильного класса и 0 для остальных. Если классов три и правильный — первый, то y = (1; 0; 0)."
                    }
                },
                {
                    type: "number", answer: -0.3, card: "p7b",
                    en: {
                        q: "Softmax gives p = (0.7, 0.2, 0.1), and the true class is the first one. The gradient of the cross-entropy with respect to the logits is p − y (y is 1 for the true class, 0 for the others). What is the gradient's first component?",
                        hint: "Write out y for the three classes first. Then subtract it from p, and keep the sign.",
                        why: "Here y = (1, 0, 0): this is the one-hot target. So the first component is 0.7 − 1 = −0.3, and the whole gradient is (−0.3, 0.2, 0.1). A step against this gradient pushes the logit of the true class up and the other two down, each in proportion to its error."
                    },
                    ru: {
                        q: "Softmax выдал p = (0,7; 0,2; 0,1), а правильный класс — первый. Градиент кросс-энтропии по логитам равен p − y (y равно 1 у правильного класса и 0 у остальных). Чему равна первая компонента градиента?",
                        hint: "Сначала выпиши y для трёх классов. Потом вычти его из p и не потеряй знак.",
                        why: "Здесь y = (1; 0; 0): это one-hot-вектор правильного ответа. Поэтому первая компонента равна 0,7 − 1 = −0,3, а весь градиент — (−0,3; 0,2; 0,1). Шаг против этого градиента поднимает логит правильного класса и опускает два других, каждый пропорционально своей ошибке."
                    }
                },
                {
                    type: "info", icon: "🎲", mono: true,
                    en: {
                        title: "Perplexity: the loss as a number of choices",
                        text: [
                            "A language model is a classifier too. Its classes are all the tokens it can output, its **vocabulary**, and the true class is the token that really comes next. Its loss L is the mean cross-entropy per token.",
                            "**Perplexity** turns L back into a number of choices: the model is as unsure as if it had to pick among that many equally likely tokens. If the vocabulary has V tokens and the model gives each the same probability, its perplexity is exactly V."
                        ],
                        example: ["perplexity = e^L", "p = 1/V for every token:", "L = ln V, perplexity = V"],
                        note: "Because of the natural logarithm, L is measured in **nats** (with a base-2 logarithm it would be bits). A lower perplexity is better, and the smallest possible value is 1, when L = 0."
                    },
                    ru: {
                        title: "Перплексия: функция потерь как число вариантов",
                        text: [
                            "Языковая модель — тоже классификатор. Её классы — все токены, которые она может выдать, то есть её **словарь** (vocabulary), а правильный класс — токен, который на самом деле идёт следующим. Её функция потерь L — средняя кросс-энтропия на токен.",
                            "**Перплексия** (perplexity) превращает L обратно в число вариантов: модель сомневается так, будто выбирает из стольких же равновероятных токенов. Если в словаре V токенов и модель даёт каждому одинаковую вероятность, её перплексия равна ровно V."
                        ],
                        example: ["перплексия = e^L", "p = 1/V у каждого токена:", "L = ln V, перплексия = V"],
                        note: "Из-за натурального логарифма L измеряется в **натах** (nats); с логарифмом по основанию 2 получились бы биты. Чем ниже перплексия, тем лучше; её наименьшее возможное значение — 1, при L = 0."
                    }
                },
                {
                    type: "number", answer: 4, tolerance: 0.02, card: "p7c",
                    en: {
                        q: "Perplexity is e raised to the mean cross-entropy. A language model has a mean cross-entropy of ln 4 ≈ 1.39 nats per token. What is its perplexity?",
                        hint: "e^(ln a) = a: the exponential and the natural logarithm undo each other.",
                        why: "e^(ln 4) = 4. On average the model is as unsure as if it chose among 4 equally likely tokens at every step."
                    },
                    ru: {
                        q: "Перплексия — это e в степени, равной средней кросс-энтропии. У языковой модели средняя кросс-энтропия равна ln 4 ≈ 1,39 ната на токен. Чему равна её перплексия?",
                        hint: "e^(ln a) = a: экспонента и натуральный логарифм — взаимно обратные функции.",
                        why: "e^(ln 4) = 4. В среднем модель сомневается так, будто на каждом шаге выбирает из 4 равновероятных токенов."
                    }
                },
                {
                    type: "choice", card: "p7d",
                    en: {
                        q: "A model that knows nothing yet spreads its probability evenly over a vocabulary of 50,000 tokens. What cross-entropy loss should you see at the very start of training?",
                        options: ["About 10.8: the natural logarithm of 50,000", "About 0: the probability of one token, 1 / 50,000", "About 1: the sum of all the probabilities", "About 50,000: the size of the vocabulary"],
                        hint: "What probability does the true token get? Put it into L = −ln p.",
                        why: "With V tokens, each gets p = 1/V, so L = −ln(1/V) = ln V = ln 50,000 ≈ 10.8. (50,000 itself is the perplexity e^L.) This is a quick check of a new training run: if a freshly initialised model starts far from ln V, look for a bug first."
                    },
                    ru: {
                        q: "Модель ещё ничего не знает и распределяет вероятность поровну по словарю из 50 000 токенов. Какое значение кросс-энтропии стоит ожидать в самом начале обучения?",
                        options: ["Около 10,8: натуральный логарифм 50 000", "Около 0: вероятность одного токена, 1 / 50 000", "Около 1: сумма всех вероятностей", "Около 50 000: размер словаря"],
                        hint: "Какую вероятность получает правильный токен? Подставь её в L = −ln p.",
                        why: "Когда токенов V, каждый получает p = 1/V, поэтому L = −ln(1/V) = ln V = ln 50 000 ≈ 10,8. (А 50 000 — это перплексия e^L.) Так удобно проверять новый запуск обучения: если у только что инициализированной модели функция потерь далека от ln V, сначала стоит поискать ошибку в коде."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Why do deep learning libraries usually compute the cross-entropy straight from the logits and not from the probabilities after softmax?",
                        options: ["Because it is numerically more stable: no ln(0) and no overflow of e^z", "Because softmax has no derivative, so the model could not learn", "Because logits lie between 0 and 1, and probabilities do not", "Because the loss computed from logits always comes out smaller"],
                        hint: "What happens to ln p if a tiny probability is rounded down to exactly 0?",
                        why: "A tiny probability can be rounded down to exactly 0, and ln(0) makes the loss infinite. A large logit can make e^z overflow. Libraries compute ln p directly from the logits (log-softmax), subtracting the largest logit first. So give such a loss function raw logits, not the output of softmax."
                    },
                    ru: {
                        q: "Почему библиотеки глубокого обучения обычно считают кросс-энтропию сразу по логитам, а не по вероятностям после softmax?",
                        options: ["Потому что так численно устойчивее: нет ln(0) и переполнения e^z", "Потому что у softmax нет производной, а значит, модель не смогла бы учиться", "Потому что логиты лежат между 0 и 1, а вероятности — нет", "Потому что по логитам функция потерь всегда получается меньше"],
                        hint: "Что будет с ln p, если крошечная вероятность округлится ровно до 0?",
                        why: "Крошечная вероятность может округлиться ровно до 0, и функция потерь из-за ln(0) станет бесконечной. А при большом логите может переполниться e^z. Библиотеки считают ln p напрямую по логитам (log-softmax), сначала вычитая наибольший логит. Поэтому в такую функцию потерь передавай сами логиты, а не результат softmax."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Cross-entropy for one example: `L = −ln p(true class)`. For a batch, take the mean over its examples.",
                            "A confident mistake is expensive: p = 0.5 costs 0.69, but p = 0.01 costs 4.61.",
                            "With softmax, the gradient with respect to the logits is `p − y`: the prediction minus the one-hot target.",
                            "**Perplexity** is `e^L`. A model that knows nothing yet starts near `L = ln V`, where V is the number of classes or tokens."
                        ]
                    },
                    ru: {
                        points: [
                            "Кросс-энтропия для одного примера: `L = −ln p(правильный класс)`. Для пачки берут среднее по её примерам.",
                            "Уверенная ошибка стоит дорого: p = 0,5 обходится в 0,69, а p = 0,01 — уже в 4,61.",
                            "С softmax градиент по логитам равен `p − y`: предсказание минус one-hot-вектор правильного ответа.",
                            "**Перплексия** равна `e^L`. Модель, которая ещё ничего не знает, начинает примерно с `L = ln V`, где V — число классов или токенов."
                        ]
                    }
                }
            ]
        },

        /* ----- p8. How a model picks the next token ----- */
        p8: {
            steps: [
                {
                    type: "info", icon: "🎲",
                    en: {
                        title: "The model gives a distribution, not a word",
                        text: ["A language model does not output the next word directly. It gives a probability to every token in its vocabulary (all the tokens it can output): a **probability distribution** over the next token. Here is one for the prompt “The cat sat on the …”:"],
                        table: { side: true, head: ["Next token", "Probability"], rows: [["mat", "0.5"], ["sofa", "0.2"], ["floor", "0.15"], ["roof", "0.1"], ["moon", "0.05"]] },
                        example: [
                            "A **decoding rule** (also called a decoding strategy) turns the distribution into one token. The two simplest rules:",
                            "**Greedy decoding**: always take the most likely token. Here that is “mat”, every time.",
                            "**Sampling**: draw a token at random with these probabilities. The token “mat” comes up about half the time, “moon” about once in twenty draws."
                        ],
                        note: "The chosen token is added to the text, and everything repeats for the next position. A real vocabulary has tens of thousands of tokens or more; this toy one has five, to keep the sums short."
                    },
                    ru: {
                        title: "Модель выдаёт распределение, а не слово",
                        text: ["Языковая модель не выдаёт следующее слово напрямую. Она назначает вероятность каждому токену своего словаря (это все токены, которые она может выдать): получается **распределение вероятностей** следующего токена. Вот пример для запроса «Кошка села на …»:"],
                        table: { side: true, head: ["Следующий токен", "Вероятность"], rows: [["коврик", "0,5"], ["диван", "0,2"], ["пол", "0,15"], ["крышу", "0,1"], ["луну", "0,05"]] },
                        example: [
                            "**Правило декодирования** (его ещё называют стратегией декодирования) превращает распределение в один токен. Два самых простых правила:",
                            "**Жадное декодирование** (greedy decoding): всегда брать самый вероятный токен. Здесь это каждый раз «коврик».",
                            "**Сэмплирование** (sampling): выбирать токен случайно, с этими вероятностями. Токен «коврик» выпадает примерно в половине случаев, а «луну» — примерно в одном из двадцати."
                        ],
                        note: "Выбранный токен дописывается к тексту, и всё повторяется для следующей позиции. В настоящем словаре десятки тысяч токенов, а то и больше; в этом учебном их пять, чтобы считать было проще."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Greedy decoding always takes the most likely token. What is its typical weakness in long texts?",
                        options: ["It gives repetitive text that can get stuck in a loop", "It is much slower than drawing a token at random", "It often picks one of the least likely tokens", "It only works with a much larger context window"],
                        hint: "Nothing in this rule is random: the same text so far always gives the same next token. What does that do to a long text?",
                        why: "Greedy decoding is deterministic: no random draw can break a repeating pattern. Once a phrase has appeared, the model can rate repeating it as even more likely, and then the same phrase comes back again and again. Sampling sometimes takes a less likely token, which keeps the text varied."
                    },
                    ru: {
                        q: "Жадное декодирование всегда берёт самый вероятный токен. В чём его типичная слабость на длинных текстах?",
                        options: ["Оно даёт однообразный текст, который может зациклиться", "Оно работает намного медленнее, чем случайный выбор токена", "Оно часто выбирает один из наименее вероятных токенов", "Оно работает только при гораздо большем контекстном окне"],
                        hint: "В этом правиле нет ничего случайного: один и тот же текст всегда даёт один и тот же следующий токен. Чем это обернётся в длинном тексте?",
                        why: "Жадное декодирование — детерминированное правило: в нём нет случайности, которая могла бы прервать повтор. Если фраза уже встречалась, модель может счесть её повтор ещё более вероятным, и тогда одна и та же фраза возвращается снова и снова. Сэмплирование иногда берёт менее вероятный токен, и текст остаётся разнообразным."
                    }
                },
                {
                    type: "info", icon: "✂️", mono: true,
                    en: {
                        title: "Top-k: keep the k best, then renormalise",
                        text: [
                            "Sampling from the whole distribution has the opposite weakness. A real distribution has a long tail of unlikely tokens. Each of them is rare, but together they can come up quite often, and one strange token can send the rest of the text in the wrong direction.",
                            "**Top-k sampling** cuts the tail off: set a number k, keep the k most likely tokens and drop the rest. Then divide each kept probability by their sum, so that they add up to 1 again: this is called **renormalising**. Only then draw a token."
                        ],
                        example: ["k = 2: keep mat (0.5) and sofa (0.2)", "their sum: 0.5 + 0.2 = 0.7", "sofa: 0.2 / 0.7 ≈ 0.29", "mat: 0.5 / 0.7 ≈ ?"],
                        note: "The tokens “floor”, “roof” and “moon” now have probability 0: they can no longer be drawn. You will work out the new probability of “mat” on the next screen."
                    },
                    ru: {
                        title: "Top-k: оставь k лучших и перенормируй",
                        text: [
                            "У сэмплирования из всего распределения слабость противоположная. У настоящего распределения длинный хвост маловероятных токенов. Каждый из них выпадает редко, но все вместе они могут выпадать довольно часто, а один странный токен может увести весь дальнейший текст не туда.",
                            "**Сэмплирование top-k** отрезает этот хвост: задай число k, оставь k самых вероятных токенов, а остальные отбрось. Потом раздели каждую из оставшихся вероятностей на их сумму, чтобы вместе они снова давали 1: это называется **перенормировкой**. И только после этого выбирай токен случайно."
                        ],
                        example: ["k = 2: остаются коврик (0,5) и диван (0,2)", "их сумма: 0,5 + 0,2 = 0,7", "диван: 0,2 / 0,7 ≈ 0,29", "коврик: 0,5 / 0,7 ≈ ?"],
                        note: "У токенов «пол», «крышу» и «луну» вероятность теперь 0: выпасть они уже не могут. А новую вероятность токена «коврик» посчитай на следующем экране."
                    }
                },
                {
                    type: "number", share: true, answer: 0.71, tolerance: 0.005, card: "p8a",
                    en: {
                        q: "A language model's next-token probabilities are 0.5, 0.2, 0.15, 0.1 and 0.05. With top-k sampling and k = 2, what is the probability of the most likely token after renormalising, to two decimal places?",
                        hint: "Which tokens are left when k = 2? Their probabilities have to add up to 1 again.",
                        why: "Top-k with k = 2 keeps only the two most likely tokens: 0.5 and 0.2. Their sum is 0.7, and dividing by it makes them add up to 1 again: 0.5 / 0.7 ≈ 0.71 and 0.2 / 0.7 ≈ 0.29. The other three tokens can no longer be drawn. With k = 1 only the top token would stay: greedy decoding again."
                    },
                    ru: {
                        q: "Языковая модель выдала вероятности вариантов следующего токена: 0,5; 0,2; 0,15; 0,1 и 0,05. Применяем сэмплирование top-k при k = 2. Какой станет вероятность самого вероятного токена после перенормировки? Ответ округли до сотых.",
                        hint: "Какие токены остаются при k = 2? Их вероятности в сумме снова должны давать 1.",
                        why: "Top-k при k = 2 оставляет только два самых вероятных токена: 0,5 и 0,2. Их сумма равна 0,7, и после деления на неё вероятности снова дают в сумме 1: 0,5 / 0,7 ≈ 0,71 и 0,2 / 0,7 ≈ 0,29. Остальные три токена выпасть уже не могут. При k = 1 остался бы только главный токен: это снова жадное декодирование."
                    }
                },
                {
                    type: "info", icon: "🧮",
                    en: {
                        title: "Top-p: keep the smallest set that reaches p",
                        text: [
                            "**Top-p sampling**, also called **nucleus sampling**, does not fix the number of tokens. It fixes a share of the probability: a threshold p that you set, for example 0.9.",
                            "Sort the tokens from the most likely to the least likely and add up their probabilities one by one. Stop as soon as the sum reaches or passes p. Keep the tokens you have counted, drop the rest, renormalise and draw a token."
                        ],
                        table: { side: true, head: ["Next token", "Probability", "Sum so far"], rows: [["mat", "0.5", "0.5"], ["sofa", "0.2", "0.7"], ["floor", "0.15", "0.85"], ["roof", "0.1", "0.95"], ["moon", "0.05", "1"]] },
                        note: "With p = 0.9 the sum first reaches the threshold at “roof” (0.95). So four tokens stay, and only “moon” is dropped. The kept set is called the nucleus."
                    },
                    ru: {
                        title: "Top-p: оставь наименьший набор, сумма которого достигает p",
                        text: [
                            "**Сэмплирование top-p**, или **nucleus sampling**, фиксирует не число токенов, а долю вероятности: порог p, который задаёшь ты, например 0,9.",
                            "Расположи токены от самого вероятного к наименее вероятному и складывай их вероятности по одной. Остановись, как только сумма достигнет или превысит p. Оставь токены, которые вошли в сумму, остальные отбрось, перенормируй вероятности и выбери токен случайно."
                        ],
                        table: { side: true, head: ["Следующий токен", "Вероятность", "Накопленная сумма"], rows: [["коврик", "0,5", "0,5"], ["диван", "0,2", "0,7"], ["пол", "0,15", "0,85"], ["крышу", "0,1", "0,95"], ["луну", "0,05", "1"]] },
                        note: "При p = 0,9 сумма впервые достигает порога на токене «крышу» (0,95). Поэтому остаются четыре токена, а отбрасывается только «луну». Оставшийся набор называют ядром (nucleus)."
                    }
                },
                {
                    type: "number", answer: 3, card: "p8b",
                    en: {
                        q: "A language model's next-token probabilities, sorted from the largest, are 0.5, 0.2, 0.15, 0.1 and 0.05. With top-p (nucleus) sampling and p = 0.8, how many tokens stay as candidates?",
                        hint: "Add up the probabilities, starting with the largest. After which token does the sum first reach 0.8?",
                        why: "0.5 + 0.2 = 0.7 is still below 0.8. Adding 0.15 gives 0.85, so the threshold is reached and 3 tokens stay. The token that takes the sum past p is kept too: the set has to cover at least p. The 3 kept probabilities are then renormalised: each is divided by 0.85."
                    },
                    ru: {
                        q: "Языковая модель выдала вероятности вариантов следующего токена, по убыванию: 0,5; 0,2; 0,15; 0,1 и 0,05. Применяем сэмплирование top-p (nucleus sampling) с порогом p = 0,8. Сколько токенов останется в числе кандидатов?",
                        hint: "Складывай вероятности, начиная с самой большой. После какого токена сумма впервые достигнет 0,8?",
                        why: "0,5 + 0,2 = 0,7 — это ещё меньше 0,8. Прибавляем 0,15 и получаем 0,85: порог достигнут, остаются 3 токена. Токен, с которым сумма переходит через p, тоже остаётся: сумма набора должна быть не меньше p. Затем 3 оставшиеся вероятности перенормируют: каждую делят на 0,85."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Top-k keeps the same number of tokens at every step. Why can top-p fit better?",
                        options: ["The number of tokens adapts: few when the model is sure, many when it is unsure", "It always keeps more tokens than top-k, which makes the text more varied", "Temperature becomes useless: the shape of the distribution stops mattering", "The output becomes deterministic: one prompt always gives the same text"],
                        hint: "Try p = 0.9 in two cases: the top token has 0.95, or five tokens have 0.2 each. How many tokens stay?",
                        why: "With p = 0.9, a top token at 0.95 stays alone, while five tokens at 0.2 each all stay: the set follows the shape of the distribution. A fixed k = 2 would add a weak token in the first case and throw away three good ones in the second. The two rules can also be used together."
                    },
                    ru: {
                        q: "Top-k на каждом шаге оставляет одно и то же число токенов. Почему top-p может подходить лучше?",
                        options: ["Число токенов подстраивается: мало, когда модель уверена, и много, когда она сомневается", "Токенов всегда остаётся больше, чем при top-k, и текст получается разнообразнее", "Температура становится бесполезной: форма распределения перестаёт что-либо значить", "Результат становится детерминированным: один запрос всегда даёт один и тот же текст"],
                        hint: "Примени p = 0,9 в двух случаях: у главного токена 0,95 или у пяти токенов по 0,2. Сколько токенов останется?",
                        why: "При p = 0,9 главный токен с вероятностью 0,95 остаётся один, а пять токенов по 0,2 остаются все: набор повторяет форму распределения. Фиксированное k = 2 в первом случае добавило бы слабый токен, а во втором отбросило бы три хороших. Оба правила можно применять и вместе."
                    }
                },
                {
                    type: "info", icon: "🌡️", mono: true,
                    en: {
                        title: "Temperature reshapes the distribution",
                        text: [
                            "Top-k and top-p cut the distribution. **Temperature** reshapes it. The model first computes a raw score for every token, its **logit**, and softmax turns the logits z into the probabilities p.",
                            "The temperature T is a positive number that you set: every logit is divided by T before softmax. T = 1 changes nothing.",
                            "T below 1 stretches the gaps between the logits: at T = 0.5 the logits (2, 1, 0) become (4, 2, 0). The distribution gets sharper, and the text more predictable. T above 1 shrinks the gaps: the distribution gets flatter, and the text more varied, with more strange tokens."
                        ],
                        example: ["p = softmax(z / T)", "p_i = e^(z_i / T) / Σ_j e^(z_j / T)", "z = (2, 1, 0)", "T = 1: p ≈ (0.67, 0.24, 0.09)", "T = 0.5: p ≈ (0.87, 0.12, 0.02)", "T = 2: p ≈ (0.51, 0.31, 0.19)"],
                        note: "The order of the tokens never changes: at every T above 0 the largest logit keeps the largest probability. Only the gap between it and the others grows or shrinks."
                    },
                    ru: {
                        title: "Температура меняет форму распределения",
                        text: [
                            "Top-k и top-p обрезают распределение, а **температура** меняет его форму. Сначала модель вычисляет для каждого токена сырую оценку — **логит** (logit), а softmax превращает логиты z в вероятности p.",
                            "Температура T — положительное число, которое задаёшь ты: перед softmax каждый логит делится на T. При T = 1 ничего не меняется.",
                            "Температура ниже 1 растягивает разрывы между логитами: при T = 0,5 логиты (2; 1; 0) превращаются в (4; 2; 0). Распределение становится острее, а текст — предсказуемее. Температура выше 1 сжимает разрывы: распределение сглаживается, текст становится разнообразнее, а странные токены выпадают чаще."
                        ],
                        example: ["p = softmax(z / T)", "p_i = e^(z_i / T) / Σ_j e^(z_j / T)", "z = (2; 1; 0)", "T = 1: p ≈ (0,67; 0,24; 0,09)", "T = 0,5: p ≈ (0,87; 0,12; 0,02)", "T = 2: p ≈ (0,51; 0,31; 0,19)"],
                        note: "Порядок токенов не меняется: при любом T больше 0 у самого большого логита остаётся самая большая вероятность. Растёт или сокращается только его отрыв от остальных."
                    }
                },
                {
                    type: "choice", card: "p8c",
                    en: {
                        q: "A language model samples the next token from softmax(z / T): z are its logits, T is the temperature. What happens as T goes down towards 0?",
                        options: ["Sampling comes close to greedy decoding: the top token takes almost everything", "The distribution turns uniform: every token becomes equally likely", "The distribution stays the same: dividing all the logits by T changes nothing", "The text gets more random: unlikely tokens are drawn more and more often"],
                        hint: "Divide the logits (2, 1, 0) by a small T, such as 0.1. What happens to the gaps between them?",
                        why: "A tiny T makes the gaps between the logits huge, so softmax gives almost everything to the largest one: for the logits (2, 1, 0) and T = 0.1 the top token gets more than 0.9999. That is why many tools treat a temperature of 0 as greedy decoding. A very large T does the opposite: the distribution gets close to uniform."
                    },
                    ru: {
                        q: "Языковая модель выбирает следующий токен сэмплированием из softmax(z / T): z — её логиты, T — температура. Что происходит, когда T уменьшается и стремится к 0?",
                        options: ["Выходит почти жадное декодирование: главный токен забирает практически всё", "Распределение становится равномерным: все токены одинаково вероятны", "Распределение не меняется: деление всех логитов на T ни на что не влияет", "Текст становится случайнее: маловероятные токены выпадают всё чаще"],
                        hint: "Раздели логиты (2; 1; 0) на маленькое T, например на 0,1. Что станет с разрывами между ними?",
                        why: "При крошечном T разрывы между логитами огромны, и softmax отдаёт почти всё самому большому: для логитов (2; 1; 0) при T = 0,1 главный токен получает больше 0,9999. Поэтому многие инструменты понимают температуру 0 как жадное декодирование. Очень большое T действует наоборот: распределение становится почти равномерным."
                    }
                },
                {
                    type: "number", share: true, answer: 0.9,
                    en: {
                        q: "Two tokens have the logits (ln 3, 0). At T = 1 softmax gives them the probabilities (0.75, 0.25), because e^(ln 3) = 3 and e⁰ = 1. What is the probability of the first token at T = 0.5?",
                        hint: "Dividing by 0.5 doubles the logits: (2·ln 3, 0). What is e^(2·ln 3)?",
                        why: "The logits become (2·ln 3, 0), and e^(2·ln 3) = 3² = 9, so the first probability is 9 / (9 + 1) = 0.9. Halving T squares the ratio of the two probabilities: from 3 : 1 to 9 : 1. At T = 2 the ratio would shrink to √3 : 1, and the first probability to about 0.63."
                    },
                    ru: {
                        q: "У двух токенов логиты (ln 3; 0). При T = 1 softmax даёт им вероятности (0,75; 0,25), потому что e^(ln 3) = 3, а e⁰ = 1. Какой станет вероятность первого токена при T = 0,5?",
                        hint: "Деление на 0,5 удваивает логиты: (2·ln 3; 0). Чему равно e^(2·ln 3)?",
                        why: "Логиты превращаются в (2·ln 3; 0), а e^(2·ln 3) = 3² = 9, поэтому вероятность первого токена равна 9 / (9 + 1) = 0,9. Уменьшив T вдвое, мы возвели в квадрат отношение двух вероятностей: было 3 : 1, стало 9 : 1. При T = 2 отношение уменьшилось бы до √3 : 1, а первая вероятность — примерно до 0,63."
                    }
                },
                {
                    type: "choice", card: "p8d",
                    en: {
                        q: "You lower the temperature of a language model from 1 to 0.2. What does that do to its answers?",
                        options: ["They get more predictable, but a likely answer can still be false", "They become factually correct, because the likeliest answer is the true one", "They get checked: at a low temperature the model verifies its facts", "They get more random, because unlikely tokens are drawn more often"],
                        hint: "Temperature only rescales the scores that the model has already computed. Does it change what the model knows?",
                        why: "A low temperature keeps the model close to its most likely continuations, so the answers vary less from run to run. But likely is not the same as true: if the top continuation is a mistake, a low temperature repeats that mistake reliably. Nothing in sampling checks the facts."
                    },
                    ru: {
                        q: "Ты понижаешь температуру языковой модели с 1 до 0,2. Что это меняет в её ответах?",
                        options: ["Они становятся предсказуемее, но вероятный ответ по-прежнему может быть неверным", "Они становятся достоверными, ведь самый вероятный ответ и есть правильный", "Они проходят проверку: при низкой температуре модель перепроверяет факты", "Они становятся случайнее, потому что маловероятные токены выпадают чаще"],
                        hint: "Температура лишь масштабирует оценки, которые модель уже вычислила. Меняет ли она то, что модель знает?",
                        why: "При низкой температуре модель держится самых вероятных продолжений, и ответы меньше меняются от запуска к запуску. Но вероятное не значит верное: если самое вероятное продолжение ошибочно, низкая температура заставит модель повторять эту ошибку раз за разом. Фактов сэмплирование не проверяет."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A language model outputs a **probability distribution** over the next token. A decoding rule picks one token: greedy decoding takes the top one, sampling draws at random.",
                            "**Top-k** keeps a fixed number of tokens. **Top-p** keeps the smallest set of top tokens whose probabilities add up to p or more, so the number of tokens follows the distribution. Both renormalise before sampling.",
                            "Temperature: `softmax(z / T)`. T below 1 sharpens the distribution, T above 1 flattens it, and T → 0 gives greedy decoding.",
                            "Predictable is not the same as true: a low temperature does not check the facts."
                        ]
                    },
                    ru: {
                        points: [
                            "Языковая модель выдаёт **распределение вероятностей** следующего токена. Правило декодирования выбирает один токен: жадное берёт самый вероятный, сэмплирование выбирает случайно.",
                            "**Top-k** оставляет фиксированное число токенов. **Top-p** оставляет наименьший набор самых вероятных токенов с суммой вероятностей не меньше p, поэтому число токенов зависит от распределения. Оба правила перенормируют вероятности перед выбором.",
                            "Температура: `softmax(z / T)`. При T меньше 1 распределение становится острее, при T больше 1 сглаживается, а при T → 0 получается жадное декодирование.",
                            "Предсказуемое не значит верное: низкая температура не проверяет факты."
                        ]
                    }
                }
            ]
        }
    }
});
