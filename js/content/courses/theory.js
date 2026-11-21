/* =========================================================
   AI COMPASS — GUIDED COURSE: THEORY AT THE LIMIT
   The last stage of "My path", for PhD students and researchers: the
   mathematics under machine learning, with proofs in pieces. Twelve
   guided steps; each states its results with the conditions they need,
   has the learner put a proof or a derivation in order, and works the
   numbers by hand.
     t1   Generalisation bounds: how many examples are enough
     t2   Optimisation theory: how fast can descent go
     t3   Information theory of learning
     t4   High dimensions and random matrices
     t5   Kernels and the infinite-width limit
     t6   Statistical decision theory: what “best estimator” means
     t7   Diffusion as differential equations: scores, SDEs and ODEs
     t8   Reinforcement learning theory: contractions, gradients and regret
     t9   Transformers in theory: what attention can and cannot compute
     t10  Causality: from seeing to doing
     t11  Guarantees: differential privacy and certified robustness
     t12  Limits: what cannot be learned, computed or proved
   The screens are shown one by one by js/learn-play.js. How a screen is
   written is explained at the top of js/content/courses/zero.js:
   - in a "choice", the FIRST option is the right one;
   - "number": the learner types the answer; "tolerance" is how far off
     it may be. Some answers are negative, so on a phone the number
     tasks of this course get the "±" button. Russian texts write
     decimals with a comma;
   - "order": the steps of a proof or a derivation, in the right order;
   - "card": the task also becomes a card of the memory check. A card must
     make sense alone.
   The level check asks nothing about this stage: it is the last one, so a
   learner who knows every stage before it starts here anyway.
   No company, product or model is named in this course, on purpose.
   Every theorem is stated with its conditions; where a claim is only an
   observation, or still open, the texts say so.
   The names of the steps are in js/content/learn.js ("learn.unit.t1"...).
   ========================================================= */

window.AICompass.content.set("course.theory", {
    units: {
        /* ----- t1. Generalisation bounds: how many examples are enough ----- */
        t1: {
            steps: [
                {
                    type: "info", icon: "🎯", mono: true,
                    en: {
                        title: "One classifier, fixed in advance",
                        text: [
                            "A classifier h has a **true error** R(h) = P(h(x) ≠ y) on a fresh example from the data distribution, and an **empirical error** R̂(h): its share of mistakes on a sample of n examples drawn independently from that distribution. How far apart can the two be?",
                            "If h is fixed before the sample is drawn, its n mistakes are independent 0/1 variables with mean R(h), so **Hoeffding's inequality** applies. It assumes nothing else about the data.",
                            "Set the right-hand side equal to δ and solve for ε: the result is a guarantee that holds with probability at least 1 − δ. Such statements with an ε and a δ are the language of **PAC** learning: probably (1 − δ) approximately (ε) correct."
                        ],
                        example: ["X_1 … X_n independent, with values in [0, 1] and mean μ:", "P(|(X_1 + … + X_n)/n − μ| ≥ ε) ≤ 2·exp(−2·n·ε²)", "for h fixed in advance, with probability ≥ 1 − δ:", "|R(h) − R̂(h)| ≤ √(ln(2/δ) / (2n))", "n = 1000, δ = 0.05: √(ln 40 / 2000) ≈ 0.043"],
                        note: "The probability is over samples: R(h) is a fixed number, only R̂(h) is random. Halving ε takes four times as many examples; a δ ten times smaller only adds ln 10 ≈ 2.3 to ln(2/δ)."
                    },
                    ru: {
                        title: "Один классификатор, зафиксированный заранее",
                        text: [
                            "У классификатора h есть **истинная ошибка** R(h) = P(h(x) ≠ y) на новом примере из распределения данных и **эмпирическая ошибка** R̂(h) — доля его ошибок на выборке из n примеров, независимо взятых из того же распределения. Насколько могут расходиться эти два числа?",
                            "Если h зафиксирован до того, как получена выборка, его n ошибок — независимые величины со значениями 0 и 1 и средним R(h), и к ним применимо **неравенство Хёфдинга** (Hoeffding). Больше о данных оно ничего не предполагает.",
                            "Приравняем правую часть к δ и выразим ε: получится гарантия, которая выполняется с вероятностью не меньше 1 − δ. Такие утверждения с ε и δ — язык **PAC**-обучения (probably approximately correct): «вероятно (1 − δ) приближённо (ε) корректно»."
                        ],
                        example: ["X_1 … X_n независимы, со значениями в [0; 1] и средним μ:", "P(|(X_1 + … + X_n)/n − μ| ≥ ε) ≤ 2·exp(−2·n·ε²)", "для h, зафиксированного заранее, с вероятностью ≥ 1 − δ:", "|R(h) − R̂(h)| ≤ √(ln(2/δ) / (2n))", "n = 1000, δ = 0,05: √(ln 40 / 2000) ≈ 0,043"],
                        note: "Вероятность берётся по выборкам: R(h) — фиксированное число, случайна только R̂(h). Чтобы уменьшить ε вдвое, нужно вчетверо больше примеров, а уменьшение δ в десять раз добавляет к ln(2/δ) всего ln 10 ≈ 2,3."
                    }
                },
                {
                    type: "number", answer: 4612, tolerance: 1, card: "t1a",
                    en: {
                        q: "A classifier is fixed before n independent test examples are drawn. Hoeffding: P(|test error − true error| ≥ ε) ≤ 2·exp(−2·n·ε²). What is the smallest n for which this guarantees a deviation below 0.02 with probability ≥ 0.95?",
                        hint: "Require 2·exp(−2·n·ε²) ≤ 0.05 at ε = 0.02 and solve for n. A sample size is rounded up.",
                        why: "2·exp(−2·n·ε²) ≤ δ gives n ≥ ln(2/δ) / (2·ε²) = ln 40 / (2·0.0004) = 3.6889 / 0.0008 = 4611.1, so n = 4612. The factor 1/ε² is the price of precision: for ε = 0.01 the same formula asks for four times as many, 18,445."
                    },
                    ru: {
                        q: "Классификатор зафиксирован до выбора n независимых тестовых примеров. По Хёфдингу, P(|ошибка на тесте − истинная ошибка| ≥ ε) ≤ 2·exp(−2·n·ε²). При каком наименьшем n это гарантирует отклонение меньше 0,02 с вероятностью ≥ 0,95?",
                        hint: "Потребуй 2·exp(−2·n·ε²) ≤ 0,05 при ε = 0,02 и вырази n. Объём выборки округляют вверх.",
                        why: "Из 2·exp(−2·n·ε²) ≤ δ получаем n ≥ ln(2/δ) / (2·ε²) = ln 40 / (2·0,0004) = 3,6889 / 0,0008 = 4611,1, то есть n = 4612. Множитель 1/ε² — цена точности: при ε = 0,01 та же формула требует вчетверо больше примеров, 18 445."
                    }
                },
                {
                    type: "number", answer: 0.62, tolerance: 0.005,
                    en: {
                        q: "1000 binary classifiers answer every example by an independent fair coin flip, so each has true error 0.5. All are scored on the same 10 examples. What is the probability that at least one makes no error? Two decimal places.",
                        hint: "First the chance that one given classifier is right 10 times in a row; then the chance that none of the 1000 is. Do not round the first chance to one digit: the second decimal of the answer depends on it.",
                        why: "One guesser is right 10 times in a row with probability 0.5¹⁰ = 1/1024. None of the 1000 is: (1 − 1/1024)^1000 ≈ 0.376. At least one is: 1 − 0.376 ≈ 0.62. That one shows R̂ = 0 with a true error of 0.5, although for one fixed h and n = 10 Hoeffding bounds the chance of a deviation of 0.43 or more by 0.05."
                    },
                    ru: {
                        q: "1000 бинарных классификаторов отвечают на каждый пример независимым броском честной монеты (истинная ошибка 0,5). Их проверяют на одних и тех же 10 примерах. С какой вероятностью хотя бы один ни разу не ошибётся? Округли до сотых.",
                        hint: "Сначала найди вероятность того, что один данный классификатор ответит верно 10 раз подряд, затем — что это не удастся ни одному из 1000. Первую вероятность не округляй до одной значащей цифры: от неё зависит второй знак после запятой в ответе.",
                        why: "Один классификатор не ошибается 10 раз подряд с вероятностью 0,5¹⁰ = 1/1024. Ни одному из 1000 это не удаётся с вероятностью (1 − 1/1024)^1000 ≈ 0,376. Хотя бы одному — с вероятностью 1 − 0,376 ≈ 0,62. У него R̂ = 0 при истинной ошибке 0,5, хотя для заранее выбранного h при n = 10 по Хёфдингу P(отклонение ≥ 0,43) ≤ 0,05."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "From 200 classifiers you keep the one with the lowest error R̂ on a sample of n = 1000 examples and argue: “By Hoeffding, with probability 0.95 its true error is within 0.043 of its R̂.” What is wrong with this argument?",
                        options: ["Hoeffding needs h fixed independently of the sample, but this h was chosen by looking at that sample", "Hoeffding needs the number of mistakes to be close to normal, and n = 1000 is too small for that", "Hoeffding needs the 200 classifiers to err independently of each other, and they share one sample", "The value 0.043 is valid only for a true error near 0.5: for a small R(h) the bound breaks down"],
                        hint: "For which classifiers are the n mistakes on the sample independent draws with mean R(h)?",
                        why: "For an h fixed in advance, the n mistakes are independent with mean R(h). The winner is a function of the sample: its R̂ is the smallest of 200 sample errors and is biased downwards. Hoeffding needs no normality and no large n, asks for independence across examples, not across classifiers, and holds for every R(h)."
                    },
                    ru: {
                        q: "Из 200 классификаторов взяли тот, у которого наименьшая ошибка R̂ на выборке из n = 1000 примеров, и рассуждают: «По Хёфдингу, с вероятностью 0,95 его истинная ошибка отличается от R̂ не больше чем на 0,043». В чём ошибка?",
                        options: ["Неравенство требует, чтобы h не зависел от выборки, а этот h выбран по той же самой выборке", "Неравенство требует, чтобы число ошибок было почти нормальным, а n = 1000 для этого мало", "Неравенство требует, чтобы 200 классификаторов ошибались независимо, а выборка у них общая", "Число 0,043 верно лишь при истинной ошибке около 0,5: при малой R(h) оценка нарушается"],
                        hint: "Для каких классификаторов n ошибок на выборке — независимые величины со средним R(h)?",
                        why: "Если h зафиксирован заранее, его n ошибок независимы и имеют среднее R(h). Победитель же — функция выборки: его R̂ — наименьшая из 200 выборочных ошибок, она смещена вниз. Неравенству Хёфдинга не нужны ни нормальность, ни большое n, нужна независимость примеров, а не классификаторов, и оно верно при любой R(h)."
                    }
                },
                {
                    type: "info", icon: "🔗", mono: true,
                    en: {
                        title: "The union bound: paying for the choice",
                        text: [
                            "A classifier chosen after looking at the sample is still a member of the class H it was chosen from. So ask for more: a sample that is good for every h in H at once. The **union bound** says: the probability that at least one of several events happens is at most the sum of their probabilities.",
                            "For a finite class that adds up |H| copies of Hoeffding's bound. Setting the sum equal to δ gives a guarantee for all h in H simultaneously, so it covers the h you end up with, whatever rule picked it. The class costs only ln|H| under the root.",
                            "A test set reused to compare k models, each fixed without looking at it, is the same situation with |H| = k."
                        ],
                        example: ["P(some h in H has |R(h) − R̂(h)| ≥ ε) ≤ |H|·2·exp(−2·n·ε²)", "with probability ≥ 1 − δ, for all h in H at once:", "|R(h) − R̂(h)| ≤ √((ln|H| + ln(2/δ)) / (2n))", "|H| = 10⁶, n = 10,000, δ = 0.05: 0.0296 (one fixed h: 0.0136)"],
                        note: "If each new model is chosen after seeing earlier scores on the test set, the k models are no longer a fixed list: the union then has to cover every model that could have been chosen."
                    },
                    ru: {
                        title: "Оценка объединения: плата за выбор",
                        text: [
                            "Классификатор, подобранный по выборке, всё равно лежит в классе H, из которого его выбирали. Потребуем большего: пусть выборка будет хорошей сразу для всех h из H. **Оценка объединения** (union bound, неравенство Буля): вероятность того, что произойдёт хотя бы одно из нескольких событий, не больше суммы их вероятностей.",
                            "Для конечного класса складываются |H| оценок Хёфдинга. Приравняв сумму к δ, получаем гарантию сразу для всех h из H, а значит, и для того h, который в итоге выбран, каким бы правилом его ни выбирали. Класс стоит всего ln|H| под корнем.",
                            "Тестовая выборка, на которой сравнивают k моделей, зафиксированных без оглядки на неё, — тот же случай с |H| = k."
                        ],
                        example: ["P(найдётся h из H с |R(h) − R̂(h)| ≥ ε) ≤ |H|·2·exp(−2·n·ε²)", "с вероятностью ≥ 1 − δ сразу для всех h из H:", "|R(h) − R̂(h)| ≤ √((ln|H| + ln(2/δ)) / (2n))", "|H| = 10⁶, n = 10 000, δ = 0,05: 0,0296 (один заранее выбранный h: 0,0136)"],
                        note: "Если каждую новую модель выбирают, уже зная прежние результаты на тесте, то k моделей — уже не заранее заданный список: объединение придётся брать по всем моделям, которые могли быть выбраны."
                    }
                },
                {
                    type: "number", answer: 0.023, tolerance: 0.0005, card: "t1b",
                    en: {
                        q: "k = 1000 models, fixed in advance, share a test set of n = 10,000 examples. Union bound: P(some model has |test error − true error| ≥ ε) ≤ 2·k·exp(−2·n·ε²). For what ε is the right-hand side equal to 0.05? Three decimal places.",
                        hint: "Set the right-hand side equal to 0.05, take logarithms and solve for ε².",
                        why: "2·k·exp(−2·n·ε²) = δ gives ε = √(ln(2k/δ) / (2n)) = √(ln 40,000 / 20,000) = √(10.597 / 20,000) = √0.00053 = 0.023. For one model: √(ln 40 / 20,000) = 0.0136. A thousand candidates widen the bound only 1.7 times, since k enters through ln k."
                    },
                    ru: {
                        q: "У k = 1000 заранее заданных моделей общий тест из n = 10 000 примеров. Оценка объединения: P(хотя бы у одной |ошибка на тесте − истинная ошибка| ≥ ε) ≤ 2·k·exp(−2·n·ε²). При каком ε правая часть равна 0,05? Округли до тысячных.",
                        hint: "Приравняй правую часть к 0,05, прологарифмируй и вырази ε².",
                        why: "Из 2·k·exp(−2·n·ε²) = δ следует ε = √(ln(2k/δ) / (2n)) = √(ln 40 000 / 20 000) = √(10,597 / 20 000) = √0,00053 = 0,023. Для одной модели: √(ln 40 / 20 000) = 0,0136. Тысяча кандидатов расширяет границу всего в 1,7 раза: k входит через ln k."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Some h in a finite class H has true error R(h) = 0 (the realisable case). The learner returns any h in H with no errors on n independent examples. Order the proof that the returned h has R(h) ≤ ε with probability at least 1 − δ.",
                        items: ["Call h bad if R(h) > ε. A bad h is right on one random example with probability below 1 − ε", "So a bad h makes no error on n independent examples with probability below (1 − ε)^n ≤ e^(−ε·n)", "Summing over the bad classifiers, at most |H| of them: P(some bad h makes no error) < |H|·e^(−ε·n)", "This is at most δ as soon as n ≥ (ln|H| + ln(1/δ)) / ε", "Then, with probability at least 1 − δ, every error-free h, the returned one included, has R(h) ≤ ε"],
                        hint: "Each line uses a quantity that the line before it has just produced. Which line needs nothing before it?",
                        why: "Each step uses the previous one: one example, n examples, all bad classifiers, the choice of n. The result n ≥ (ln|H| + ln(1/δ)) / ε has 1/ε, not 1/ε²: a bad h gives itself away with a single mistake, which each example brings with probability above ε. No deviation of size ε has to be measured."
                    },
                    ru: {
                        q: "В конечном классе H есть h с истинной ошибкой R(h) = 0 (реализуемый случай). Алгоритм возвращает любой h из H без ошибок на n независимых примерах. Расставь шаги доказательства того, что с вероятностью ≥ 1 − δ у него R(h) ≤ ε.",
                        items: ["Назовём h плохим, если R(h) > ε. Плохой h верно отвечает на случайный пример с вероятностью меньше 1 − ε", "Значит, на n независимых примерах плохой h ни разу не ошибётся с вероятностью меньше (1 − ε)^n ≤ e^(−ε·n)", "Сумма по плохим h, которых не больше |H|: P(какой-то плохой h ни разу не ошибся) < |H|·e^(−ε·n)", "Это не больше δ, как только n ≥ (ln|H| + ln(1/δ)) / ε", "Тогда с вероятностью не меньше 1 − δ у каждого h без ошибок на выборке, включая возвращённый, R(h) ≤ ε"],
                        hint: "Каждая строка использует величину, которую только что дала предыдущая. Какой строке ничего не нужно до неё?",
                        why: "Каждый шаг опирается на предыдущий: один пример, n примеров, все плохие классификаторы, выбор n. В ответе n ≥ (ln|H| + ln(1/δ)) / ε стоит 1/ε, а не 1/ε²: плохой h выдаёт себя единственной ошибкой, а каждый пример даёт её с вероятностью больше ε. Измерять отклонение размера ε здесь не приходится."
                    }
                },
                {
                    type: "number", answer: 1152, tolerance: 1, card: "t1c",
                    en: {
                        q: "A finite class H, |H| = 1000, has an h with true error 0. With probability ≥ 1 − δ, any h in H with no errors on n ≥ (ln|H| + ln(1/δ)) / ε independent examples has true error ≤ ε. What is the smallest such n for ε = δ = 0.01?",
                        hint: "ln(1/δ) = ln 100. Add ln 1000, divide by ε and round up.",
                        why: "(ln 1000 + ln 100) / 0.01 = (6.908 + 4.605) / 0.01 = 1151.3, so n = 1152. Without a perfect h in the class, the union bound needs (ln 1000 + ln 200) / (2·0.01²) = 61,031 examples to guarantee |R(h) − R̂(h)| ≤ 0.01 for all h: 1/ε² in place of 1/ε."
                    },
                    ru: {
                        q: "Конечный класс H, |H| = 1000, содержит h с истинной ошибкой 0. С вероятностью ≥ 1 − δ у любого h из H без ошибок на n ≥ (ln|H| + ln(1/δ)) / ε независимых примерах истинная ошибка ≤ ε. Каково наименьшее такое n при ε = δ = 0,01?",
                        hint: "ln(1/δ) = ln 100. Прибавь ln 1000, раздели на ε и округли вверх.",
                        why: "(ln 1000 + ln 100) / 0,01 = (6,908 + 4,605) / 0,01 = 1151,3, то есть n = 1152. Если идеального h в классе нет, оценке объединения нужен (ln 1000 + ln 200) / (2·0,01²) = 61 031 пример, чтобы гарантировать |R(h) − R̂(h)| ≤ 0,01 для всех h: 1/ε² вместо 1/ε."
                    }
                },
                {
                    type: "info", icon: "📐", mono: true,
                    en: {
                        title: "Infinite classes: the VC dimension",
                        text: [
                            "For an infinite class ln|H| is useless. But on a finite set of points only the labellings matter. H **shatters** a set of k points when it realises all 2^k labellings of it. The **VC dimension** d of H is the size of the largest set that H shatters, or ∞ if there is no largest one.",
                            "So d ≥ k needs just one shattered set of k points, while d < k needs every set of k points to fail. The **Sauer–Shelah lemma**: for a finite d ≥ 1, on any n ≥ d points H realises at most (e·n/d)^d labellings, a polynomial in n in place of 2^n.",
                            "With that count in the role of |H| (the full proof needs one more idea, a second “ghost” sample) comes **uniform convergence**: with probability at least 1 − δ the gap |R(h) − R̂(h)| is small for all h in H at once, at most of the order shown below. Textbooks differ in the constants."
                        ],
                        example: ["thresholds, h(x) = 1 if x ≥ a: d = 1", "intervals, h(x) = 1 if a ≤ x ≤ b: d = 2", "half-spaces in R^m, h(x) = 1 if w·x + b ≥ 0: d = m + 1", "axis-aligned rectangles in the plane, h(x) = 1 inside: d = 4", "for n ≥ 2d: gap at most of the order of √((d·ln(n/d) + ln(1/δ)) / n)"]
                    },
                    ru: {
                        title: "Бесконечные классы: VC-размерность",
                        text: [
                            "Для бесконечного класса ln|H| бесполезен. Но на конечном наборе точек важны только разметки. H **разбивает** (shatters) набор из k точек, если реализует все 2^k его разметок. **Размерность Вапника — Червоненкиса** (VC-размерность) d класса H — размер наибольшего набора, который H разбивает, или ∞, если наибольшего нет.",
                            "Чтобы d ≥ k, достаточно одного разбиваемого набора из k точек; чтобы d < k, нужно, чтобы не разбивался ни один. **Лемма Зауэра — Шелаха** (Sauer–Shelah): при конечном d ≥ 1 на любых n ≥ d точках H реализует не больше (e·n/d)^d разметок — многочлен от n вместо 2^n.",
                            "Это число занимает место |H| (в полном доказательстве нужна ещё одна идея — вторая, «призрачная» выборка), и получается **равномерная сходимость** (uniform convergence): с вероятностью не меньше 1 − δ разрыв |R(h) − R̂(h)| мал сразу для всех h из H, не больше величины указанного ниже порядка. Константы в учебниках разные."
                        ],
                        example: ["пороги, h(x) = 1 при x ≥ a: d = 1", "отрезки, h(x) = 1 при a ≤ x ≤ b: d = 2", "полупространства в R^m, h(x) = 1 при w·x + b ≥ 0: d = m + 1", "прямоугольники со сторонами вдоль осей на плоскости, h(x) = 1 внутри: d = 4", "при n ≥ 2d: разрыв не больше величины порядка √((d·ln(n/d) + ln(1/δ)) / n)"]
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Does the class shatter the set of points, that is, realise every labelling of it?",
                        groups: ["Shatters it", "Does not shatter it"],
                        items: [["Thresholds, 1 if x ≥ a: the points 0 and 1", 1], ["Intervals, 1 if a ≤ x ≤ b: the points 0 and 1", 0], ["Half-planes, 1 if w·x + b ≥ 0: the three corners of a triangle", 0], ["Intervals, 1 if a ≤ x ≤ b: the points 0, 1 and 2", 1], ["Half-planes, 1 if w·x + b ≥ 0: three points on one line", 1], ["Axis-aligned rectangles: the points (0, 1), (1, 0), (0, −1), (−1, 0)", 0], ["Axis-aligned rectangles: the points (0, 0), (1, 0), (0, 1), (1, 1)", 1]],
                        why: "No threshold gives (1, 0), no interval gives (1, 0, 1), no half-plane splits the middle one of three collinear points from the outer two, and a rectangle that holds (0, 0) and (1, 1) holds the whole square. So d = 3 for half-planes means that some triple is shattered, not every triple."
                    },
                    ru: {
                        q: "Разбивает ли класс этот набор точек, то есть реализует ли каждую его разметку?",
                        groups: ["Разбивает", "Не разбивает"],
                        items: [["Пороги, 1 при x ≥ a: точки 0 и 1", 1], ["Отрезки, 1 при a ≤ x ≤ b: точки 0 и 1", 0], ["Полуплоскости, 1 при w·x + b ≥ 0: три вершины треугольника", 0], ["Отрезки, 1 при a ≤ x ≤ b: точки 0, 1 и 2", 1], ["Полуплоскости, 1 при w·x + b ≥ 0: три точки на одной прямой", 1], ["Прямоугольники вдоль осей: точки (0; 1), (1; 0), (0; −1), (−1; 0)", 0], ["Прямоугольники вдоль осей: точки (0; 0), (1; 0), (0; 1), (1; 1)", 1]],
                        why: "Порог не даёт разметку (1; 0), отрезок — (1; 0; 1), полуплоскость не отделит среднюю из трёх точек прямой от двух крайних, а прямоугольник, содержащий (0; 0) и (1; 1), содержит весь квадрат. Поэтому d = 3 у полуплоскостей значит, что разбивается какая-то тройка точек, а не любая."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge, on paper. On the real line, h_ω(x) = 1 if sin(ω·x) ≥ 0 and 0 otherwise: a class with one parameter ω. Prove that its VC dimension is infinite. Try the points x_j = 10^(−j), j = 1 … m, and a clever ω for each labelling.",
                        answer: [
                            "Take labels y_1 … y_m, each 0 or 1, and set ω = π·(1 + Σ_i (1 − y_i)·10^i). Then ω·x_j = π·(10^(−j) + Σ_i (1 − y_i)·10^(i−j)). Now sort the terms of the sum by i.",
                            "Terms with i > j are multiples of 10, so their total is an even integer: it adds a multiple of 2π and changes nothing. The term i = j adds π exactly when y_j = 0. The rest, c = 10^(−j) + the terms with i < j, satisfies 0 < c < 1/9, because c is at most 0.1 + 0.01 + … + 10^(−j).",
                            "So sin(ω·x_j) = sin(π·c) > 0 when y_j = 1, and sin(π + π·c) < 0 when y_j = 0: all 2^m labellings are realised, for every m. One parameter, infinite VC dimension: the number of parameters does not measure the capacity of a class."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой, на бумаге. На прямой h_ω(x) = 1, если sin(ω·x) ≥ 0, и 0 иначе: класс с одним параметром ω. Докажи, что его VC-размерность бесконечна. Попробуй точки x_j = 10^(−j), j = 1 … m, и хитрое ω для каждой разметки.",
                        answer: [
                            "Возьмём метки y_1 … y_m, каждая 0 или 1, и положим ω = π·(1 + Σ_i (1 − y_i)·10^i). Тогда ω·x_j = π·(10^(−j) + Σ_i (1 − y_i)·10^(i−j)). Разберём слагаемые суммы по i.",
                            "Слагаемые с i > j кратны 10, их сумма — чётное целое: она добавляет кратное 2π и ничего не меняет. Слагаемое с i = j добавляет π ровно тогда, когда y_j = 0. Остаток, c = 10^(−j) + слагаемые с i < j, удовлетворяет 0 < c < 1/9, потому что c не больше 0,1 + 0,01 + … + 10^(−j).",
                            "Поэтому sin(ω·x_j) = sin(π·c) > 0 при y_j = 1 и sin(π + π·c) < 0 при y_j = 0: реализуются все 2^m разметок, при любом m. Один параметр — и бесконечная VC-размерность: число параметров не измеряет ёмкость класса."
                        ]
                    }
                },
                {
                    type: "info", icon: "🚧", mono: true,
                    en: {
                        title: "Where these bounds stop",
                        text: [
                            "All these bounds hold for every data distribution, and the uniform ones for every way of picking h from H. That worst-case reach is their strength, and their limit.",
                            "An **over-parameterised** network has far more weights than training examples. Then both ln|H| (count the bits of the weights) and the VC dimension are typically far above n, and the guaranteed gap exceeds 1: it says nothing about errors that lie between 0 and 1. In experiments such networks fit even random labels.",
                            "Yet trained on real data the same networks generalise. A bound that sees only the class cannot explain that. Bounds through weight norms, PAC-Bayes bounds and bounds that depend on the training algorithm are partial answers; a full explanation is open research."
                        ],
                        example: ["10⁶ weights of 32 bits each: up to 2^(32·10⁶) classifiers", "ln of that count: 32·10⁶·ln 2 ≈ 2.2·10⁷", "even with one example per weight, n = 10⁶, and δ = 0.05:", "√((2.2·10⁷ + ln 40) / (2·10⁶)) ≈ 3.3"],
                        note: "Norm-based bounds measure the size of the weights instead of their number. PAC-Bayes bounds replace ln|H| by the KL divergence of a distribution over weights from a prior fixed before the data. Algorithm-dependent bounds use, for example, how little the result changes when one training example is replaced: stability."
                    },
                    ru: {
                        title: "Где эти оценки перестают работать",
                        text: [
                            "Все эти оценки верны для любого распределения данных, а равномерные — ещё и для любого способа выбрать h из H. В этой всеобщности и их сила, и их предел.",
                            "У **перепараметризованной** сети весов намного больше, чем обучающих примеров. Тогда и ln|H| (посчитай биты весов), и VC-размерность обычно намного больше n, а гарантированный разрыв больше 1: он ничего не говорит об ошибках, которые лежат между 0 и 1. В экспериментах такие сети запоминают даже случайные метки.",
                            "И всё же на реальных данных те же сети обобщают. Оценка, которая видит только класс, объяснить этого не может. Оценки через нормы весов, PAC-байесовские оценки и оценки, зависящие от алгоритма обучения, — частичные ответы; полного объяснения пока нет, это открытая область исследований."
                        ],
                        example: ["10⁶ весов по 32 бита: до 2^(32·10⁶) классификаторов", "логарифм этого числа: 32·10⁶·ln 2 ≈ 2,2·10⁷", "даже при одном примере на вес, n = 10⁶, и δ = 0,05:", "√((2,2·10⁷ + ln 40) / (2·10⁶)) ≈ 3,3"],
                        note: "Оценки через нормы измеряют величину весов, а не их число. PAC-байесовские оценки заменяют ln|H| на KL-дивергенцию распределения на весах относительно априорного, выбранного до данных. Оценки, зависящие от алгоритма, используют, например, то, как мало меняется результат при замене одного примера: устойчивость (stability)."
                    }
                },
                {
                    type: "choice", card: "t1d",
                    en: {
                        q: "A network always fits its n training examples perfectly, with real labels and with fair-coin labels alike. A bound on true minus training error holds for every distribution and depends only on the class, n and δ. What follows?",
                        options: ["The bound is at least 0.5: with coin labels the training error is 0 and the true error is 0.5", "The bound is small for the real labels and near 0.5 for the coin labels, as the test errors differ", "The bound is of the order of ln(1/δ)/n, as zero training error puts us in the realisable case", "The network must overfit the real labels too, since its capacity is the same in both runs"],
                        hint: "The bound cannot see the labels. Which of the two runs must it cover as well?",
                        why: "With fair-coin labels every classifier has true error 0.5, and the network reaches training error 0: a gap of 0.5. A bound that depends only on the class, n and δ is the same number in both runs, so it is at least 0.5 for the real labels too. An upper bound this weak does not show that the network overfits real data."
                    },
                    ru: {
                        q: "Сеть всегда обучается до нулевой ошибки на n примерах, будь метки настоящими или от честной монеты. Оценка разности истинной и обучающей ошибок верна при любом распределении и зависит лишь от класса, n и δ. Что отсюда следует?",
                        options: ["Оценка не меньше 0,5: с метками от монеты ошибка на обучении 0, а истинная ошибка равна 0,5", "Оценка мала для настоящих меток и близка к 0,5 для меток от монеты: ошибки на тесте разные", "Оценка порядка ln(1/δ)/n: нулевая ошибка на обучении означает реализуемый случай", "Сеть переобучается и на настоящих метках: её ёмкость в обоих запусках одна и та же"],
                        hint: "Оценка не видит меток. Какой из двух запусков она тоже должна покрывать?",
                        why: "С метками от монеты истинная ошибка любого классификатора равна 0,5, а ошибка сети на обучении 0: разрыв 0,5. Оценка, зависящая лишь от класса, n и δ, в обоих запусках одна, так что она не меньше 0,5 и для настоящих меток. Столь слабая верхняя оценка не доказывает переобучения на реальных данных."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "For an h fixed before the sample, with probability ≥ 1 − δ: `|R(h) − R̂(h)| ≤ √(ln(2/δ) / (2n))` (Hoeffding), so `n ≥ ln(2/δ) / (2ε²)` examples give precision ε. For an h chosen with the same sample this guarantee is void.",
                            "Union bound over a finite class H, or over k models fixed in advance that share a test set (|H| = k): with probability ≥ 1 − δ, `|R(h) − R̂(h)| ≤ √((ln|H| + ln(2/δ)) / (2n))` for all h at once. The class costs only ln|H|.",
                            "Realisable case (a perfect h exists, the learner returns an error-free one): `n ≥ (ln|H| + ln(1/δ)) / ε` examples are enough for R(h) ≤ ε with probability ≥ 1 − δ. 1/ε in place of 1/ε².",
                            "For infinite classes the VC dimension d does the work of ln|H|: for n ≥ 2d, a gap at most of the order of `√((d·ln(n/d) + ln(1/δ)) / n)`. For over-parameterised networks all these bounds typically exceed 1; why such networks generalise is open research."
                        ]
                    },
                    ru: {
                        points: [
                            "Для h, зафиксированного до выборки, с вероятностью ≥ 1 − δ: `|R(h) − R̂(h)| ≤ √(ln(2/δ) / (2n))` (неравенство Хёфдинга), поэтому точность ε дают `n ≥ ln(2/δ) / (2ε²)` примеров. Для h, выбранного по той же выборке, эта гарантия не действует.",
                            "Оценка объединения для конечного класса H или для k заранее заданных моделей на одной тестовой выборке (|H| = k): с вероятностью ≥ 1 − δ `|R(h) − R̂(h)| ≤ √((ln|H| + ln(2/δ)) / (2n))` сразу для всех h. Класс стоит всего ln|H|.",
                            "Реализуемый случай (идеальный h существует, алгоритм возвращает h без ошибок на выборке): `n ≥ (ln|H| + ln(1/δ)) / ε` примеров достаточно, чтобы R(h) ≤ ε с вероятностью ≥ 1 − δ. 1/ε вместо 1/ε².",
                            "Для бесконечных классов работу ln|H| выполняет VC-размерность d: при n ≥ 2d разрыв не больше величины порядка `√((d·ln(n/d) + ln(1/δ)) / n)`. Для перепараметризованных сетей все эти оценки обычно больше 1; почему такие сети обобщают — открытый вопрос."
                        ]
                    }
                }
            ]
        },

        /* ----- t2. Optimisation theory: how fast can descent go ----- */
        t2: {
            steps: [
                {
                    type: "info", icon: "📉", mono: true,
                    en: {
                        title: "Smoothness and the descent lemma",
                        text: [
                            "The question here: how fast does gradient descent with a fixed step η > 0 (third line below) provably minimise f, and under which conditions? Throughout, f is differentiable, f* is its infimum (assumed finite), and x* is a minimiser when one exists.",
                            "f is **L-smooth** when its gradient is Lipschitz with constant L (first line). For a twice differentiable f this means that all eigenvalues of the Hessian lie in [−L, L] at every point. Convexity is not assumed.",
                            "The **descent lemma** follows (second line): the graph of f lies below a paraboloid of curvature L that touches it at x, and this holds for every x. The whole theory of step sizes starts from this upper bound."
                        ],
                        example: ["‖∇f(x) − ∇f(y)‖ ≤ L·‖x − y‖ for all x, y", "f(y) ≤ f(x) + ∇f(x)·(y − x) + (L/2)·‖y − x‖² for all x, y", "gradient descent: x_(k+1) = x_k − η·∇f(x_k)"],
                        note: "Proof: f(y) − f(x) − ∇f(x)·(y − x) is the integral over t from 0 to 1 of (∇f(x + t·(y − x)) − ∇f(x))·(y − x), and by the Lipschitz condition the integrand is at most L·t·‖y − x‖². The integral of t is ½."
                    },
                    ru: {
                        title: "Гладкость и лемма о спуске",
                        text: [
                            "Главный вопрос: как быстро градиентный спуск с постоянным шагом η > 0 (третья строка ниже) гарантированно минимизирует f и при каких условиях? Всюду ниже f дифференцируема, f* — её точная нижняя грань (считаем её конечной), а x* — точка минимума, если она существует.",
                            "Функцию f называют **L-гладкой** (L-smooth), если её градиент липшицев с константой L (первая строка). Для дважды дифференцируемой f это значит, что все собственные значения гессиана в каждой точке лежат в [−L; L]. Выпуклость не предполагается.",
                            "Отсюда следует **лемма о спуске** (descent lemma, вторая строка): график f лежит под параболоидом кривизны L, который касается его в точке x, и так для каждой точки x. Вся теория выбора шага начинается с этой верхней оценки."
                        ],
                        example: ["‖∇f(x) − ∇f(y)‖ ≤ L·‖x − y‖ для всех x, y", "f(y) ≤ f(x) + ∇f(x)·(y − x) + (L/2)·‖y − x‖² для всех x, y", "градиентный спуск: x_(k+1) = x_k − η·∇f(x_k)"],
                        note: "Доказательство: f(y) − f(x) − ∇f(x)·(y − x) равно интегралу по t от 0 до 1 от (∇f(x + t·(y − x)) − ∇f(x))·(y − x), а подынтегральное выражение по условию Липшица не больше L·t·‖y − x‖². Интеграл от t равен ½."
                    }
                },
                {
                    type: "number", answer: 0.25, tolerance: 0.005,
                    en: {
                        q: "f is L-smooth with L = 4, f(x_0) − f* = 20, and gradient descent uses η = 0.4. Add up the decreases that the descent lemma guarantees over the first 1000 steps: what upper bound follows for the smallest ‖∇f(x_i)‖², i = 0 … 999?",
                        hint: "First put y = x_(i+1) and x = x_i into the lemma and find c in f(x_(i+1)) ≤ f(x_i) − c·‖∇f(x_i)‖². Then add these inequalities over all the steps.",
                        why: "With y − x = −η·∇f(x) the lemma gives f(x_(i+1)) ≤ f(x_i) − c·‖∇f(x_i)‖², c = η·(1 − L·η/2) = 0.4·(1 − 0.8) = 0.08. Adding up: 0.08·Σ‖∇f(x_i)‖² ≤ f(x_0) − f* = 20, so the smallest of the 1000 terms is at most 20/(0.08·1000) = 0.25. c is positive only for η < 2/L and largest at η = 1/L: 1/(2L) = 0.125, which gives 0.16."
                    },
                    ru: {
                        q: "f — L-гладкая с L = 4, f(x_0) − f* = 20, шаг градиентного спуска η = 0,4. Сложи оценки убывания f, которые лемма о спуске даёт на первых 1000 шагах: какая верхняя оценка получится для наименьшего из ‖∇f(x_i)‖², i = 0 … 999?",
                        hint: "Сначала подставь в лемму y = x_(i+1) и x = x_i и найди c в неравенстве f(x_(i+1)) ≤ f(x_i) − c·‖∇f(x_i)‖². Затем сложи эти неравенства по всем шагам.",
                        why: "При y − x = −η·∇f(x) лемма даёт f(x_(i+1)) ≤ f(x_i) − c·‖∇f(x_i)‖², где c = η·(1 − L·η/2) = 0,4·(1 − 0,8) = 0,08. Сложим: 0,08·Σ‖∇f(x_i)‖² ≤ f(x_0) − f* = 20, поэтому наименьшее из 1000 слагаемых не больше 20/(0,08·1000) = 0,25. Константа c положительна лишь при η < 2/L и наибольшая при η = 1/L: 1/(2L) = 0,125, что даёт 0,16."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "f is L-smooth and bounded below, η = 1/L. Find the flaw: (1) each iteration lowers f by at least ‖∇f(x_k)‖²/(2L); (2) so the sum of all ‖∇f(x_k)‖² is finite; (3) so ∇f(x_k) → 0; (4) so x_k converges to a minimiser.",
                        options: ["In (4): x_k need not converge at all, and a limit, if it exists, is only a stationary point", "In (1): without convexity the descent lemma does not guarantee that f decreases", "In (2): f being bounded below does not make the sum of the decreases finite", "In (3): the sum can be finite although ‖∇f(x_k)‖ stays above a positive constant"],
                        hint: "Test each claim on f(x) = ln(1 + e^(−x)), which is L-smooth and positive.",
                        why: "Claims 1 to 3 hold: the decreases telescope to at most f(x_0) − inf f. But ∇f(x_k) → 0 is all one gets. On f(x) = ln(1 + e^(−x)) (L = 1/4, f > 0) x_k runs off to infinity; elsewhere a limit can be a saddle point. A guarantee on the values f(x_k) needs more: convexity, or the PL condition of a later screen."
                    },
                    ru: {
                        q: "f — L-гладкая и ограничена снизу, η = 1/L. Найди ошибку: (1) каждая итерация уменьшает f хотя бы на ‖∇f(x_k)‖²/(2L); (2) значит, сумма всех ‖∇f(x_k)‖² конечна; (3) значит, ∇f(x_k) → 0; (4) значит, x_k сходится к точке минимума.",
                        options: ["В (4): x_k может вообще не сходиться, а предел, если он есть, лишь стационарная точка", "В (1): без выпуклости лемма о спуске не гарантирует, что f убывает", "В (2): из ограниченности f снизу не следует, что суммарное убывание f конечно", "В (3): сумма может быть конечной, даже если ‖∇f(x_k)‖ не опускается ниже положительной константы"],
                        hint: "Проверь каждый пункт на функции f(x) = ln(1 + e^(−x)): она L-гладкая и положительная.",
                        why: "Пункты 1–3 верны: сумма убываний телескопическая и не больше f(x_0) − inf f. Но ∇f(x_k) → 0 — это всё, что отсюда следует. У f(x) = ln(1 + e^(−x)) (L = 1/4, f > 0) x_k уходит в бесконечность, а у других функций предел бывает седловой точкой. Гарантия для значений f(x_k) требует большего: выпуклости или условия PL (о нём ниже)."
                    }
                },
                {
                    type: "info", icon: "🎯", mono: true,
                    en: {
                        title: "The exact case: a quadratic",
                        text: [
                            "On f(x) = (λ/2)·x² with λ > 0, gradient descent is plain arithmetic: every step multiplies x by 1 − η·λ. On f(x) = ½·x^T·A·x with a symmetric positive definite matrix A, the same happens separately along each eigenvector of A, with its own eigenvalue λ_i in place of λ.",
                            "So gradient descent converges from every starting point exactly when |1 − η·λ_i| < 1 for all i, that is, when 0 < η < 2/λ_max. At η = 2/λ_max the coordinate along the sharpest direction only flips its sign, forever; for a larger η its size is multiplied by η·λ_max − 1 > 1 at every step.",
                            "Here L = λ_max, and μ = λ_min is the curvature of the flattest direction. Their ratio κ = L/μ is the **condition number**. With η = 1/L the sharpest direction is minimised in a single step, while the coordinate along the flattest is multiplied by 1 − 1/κ at every step."
                        ],
                        example: ["f(x) = (λ/2)·x²: x_(k+1) = (1 − η·λ)·x_k", "converges exactly when |1 − η·λ| < 1, that is, 0 < η < 2/λ", "η = 1/L: factors 1 − λ_i/L, from 0 to 1 − 1/κ", "best fixed step η = 2/(L + μ): all factors at most (κ − 1)/(κ + 1) in size", "κ = 100: 0.99 for η = 1/L, 0.9802 for η = 2/(L + μ)"],
                        note: "An empirical finding, not a theorem: in full-batch gradient descent on neural networks (every step uses the whole training set), the largest Hessian eigenvalue of the loss tends to rise during training until it is about 2/η, and then to hover there. This is called the **edge of stability**."
                    },
                    ru: {
                        title: "Точный случай: квадратичная функция",
                        text: [
                            "На f(x) = (λ/2)·x² с λ > 0 градиентный спуск — простая арифметика: каждый шаг умножает x на 1 − η·λ. На f(x) = ½·x^T·A·x с симметричной положительно определённой матрицей A то же происходит отдельно вдоль каждого собственного вектора A, со своим собственным значением λ_i вместо λ.",
                            "Поэтому спуск сходится из любой начальной точки тогда и только тогда, когда |1 − η·λ_i| < 1 для всех i, то есть при 0 < η < 2/λ_max. При η = 2/λ_max координата вдоль самого крутого направления лишь меняет знак, и так без конца, а при большем η её модуль на каждом шаге умножается на η·λ_max − 1 > 1.",
                            "Здесь L = λ_max, а μ = λ_min — кривизна самого пологого направления. Их отношение κ = L/μ называют **числом обусловленности** (condition number). При η = 1/L вдоль самого крутого направления минимум достигается за один шаг, а координата вдоль самого пологого на каждом шаге умножается на 1 − 1/κ."
                        ],
                        example: ["f(x) = (λ/2)·x²: x_(k+1) = (1 − η·λ)·x_k", "сходится тогда и только тогда, когда |1 − η·λ| < 1, то есть 0 < η < 2/λ", "η = 1/L: множители 1 − λ_i/L, от 0 до 1 − 1/κ", "лучший постоянный шаг η = 2/(L + μ): все множители по модулю не больше (κ − 1)/(κ + 1)", "κ = 100: 0,99 при η = 1/L и 0,9802 при η = 2/(L + μ)"],
                        note: "Эмпирическое наблюдение, а не теорема: когда нейросети обучают градиентным спуском по всей выборке (full-batch), наибольшее собственное значение гессиана функции потерь обычно растёт, пока не окажется около 2/η, а затем держится на этом уровне. Это называют **границей устойчивости** (edge of stability)."
                    }
                },
                {
                    type: "number", answer: 0.04, tolerance: 0.0005, card: "t2a",
                    en: {
                        q: "Gradient descent x ← x − η·∇f(x) runs on f(x_1, x_2) = x_1² + 25·x_2². It converges to the minimum from every starting point exactly when 0 < η < c. What is c?",
                        hint: "Write down ∇f. By what factor does one step multiply x_1, and by what factor x_2?",
                        why: "∇f = (2·x_1, 50·x_2), so the Hessian eigenvalues are 2 and 50, not 1 and 25. A step multiplies x_1 by 1 − 2η and x_2 by 1 − 50η. Both factors are below 1 in size exactly when η < 2/λ_max = 2/50 = 0.04. The flat direction alone would allow any η below 1: the sharp direction decides."
                    },
                    ru: {
                        q: "Градиентный спуск x ← x − η·∇f(x) применяют к f(x_1, x_2) = x_1² + 25·x_2². Он сходится к минимуму из любой начальной точки тогда и только тогда, когда 0 < η < c. Чему равно c?",
                        hint: "Выпиши ∇f. На что один шаг умножает x_1 и на что x_2?",
                        why: "∇f = (2·x_1; 50·x_2), так что собственные значения гессиана равны 2 и 50, а не 1 и 25. Шаг умножает x_1 на 1 − 2η, а x_2 на 1 − 50η. Оба множителя по модулю меньше 1 тогда и только тогда, когда η < 2/λ_max = 2/50 = 0,04. Пологое направление само допускало бы любое η меньше 1: всё решает крутое."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A network is trained by full-batch gradient descent with η = 0.01. The largest Hessian eigenvalue of the loss rises to about 200 and stays there; the loss falls over long stretches, but not at every step. Which reading is correct?",
                        options: ["It is the edge of stability, 2/η = 200: observed in practice, not implied by the theorems above", "It cannot be right: once λ_max reaches 2/η, gradient descent diverges on every loss", "It is forced: on any L-smooth loss gradient descent provably drives λ_max to 2/η", "It reveals a bug: by the descent lemma the loss falls at every step for any η"],
                        hint: "Which theorem would this run contradict, and are that theorem's conditions met here?",
                        why: "2/η = 200. On an exact quadratic, λ_max > 2/η means divergence, but a network's loss is not quadratic: its Hessian changes along the path. The descent lemma guarantees a decrease at every step only for η < 2/L, and here η·λ_max ≈ 2. The hovering is an observation, so far explained only in part."
                    },
                    ru: {
                        q: "Сеть обучают градиентным спуском по всей выборке с η = 0,01. Наибольшее собственное значение гессиана функции потерь выросло примерно до 200 и держится там; потери в целом убывают, но не на каждом шаге. Как это понимать?",
                        options: ["Это граница устойчивости, 2/η = 200: эмпирическая закономерность, из теорем выше она не следует", "Так не бывает: как только λ_max достигает 2/η, градиентный спуск расходится на любой функции", "Так и должно быть: на любой L-гладкой функции спуск доказуемо приводит λ_max к 2/η", "Это ошибка в коде: по лемме о спуске потери убывают на каждом шаге при любом η"],
                        hint: "Какой теореме противоречил бы такой запуск и выполнены ли здесь её условия?",
                        why: "2/η = 200. На точной квадратичной функции λ_max > 2/η означает расходимость, но функция потерь сети не квадратична: её гессиан меняется вдоль траектории. Лемма о спуске гарантирует убывание на каждом шаге только при η < 2/L, а здесь η·λ_max ≈ 2. Такое поведение — наблюдение, пока объяснённое лишь отчасти."
                    }
                },
                {
                    type: "info", icon: "📊", mono: true,
                    en: {
                        title: "What each assumption buys",
                        text: [
                            "Beyond L-smoothness, the guarantee depends on the shape of f. A **convex** f lies above all its tangent planes. A **μ-strongly convex** f, μ > 0, lies above a paraboloid of curvature μ that touches it at any given point: a quadratic lower bound, just as smoothness is a quadratic upper bound.",
                            "The **Polyak–Łojasiewicz (PL) condition** asks for less: the gradient must be large wherever the value is far from optimal. It follows from μ-strong convexity, but needs no convexity, and it makes every stationary point a global minimum.",
                            "For example, f(x) = x² + 3·sin²x is not convex (its second derivative ranges from −4 to 8), yet it satisfies PL with μ = 1/8. The last three lines below are the guarantees for gradient descent with η = 1/L."
                        ],
                        example: ["convex: f(y) ≥ f(x) + ∇f(x)·(y − x) for all x, y", "μ-strongly convex: f(y) ≥ f(x) + ∇f(x)·(y − x) + (μ/2)·‖y − x‖²", "PL: ½·‖∇f(x)‖² ≥ μ·(f(x) − f*) for all x", "L-smooth: min over i < k of ‖∇f(x_i)‖² ≤ 2L·(f(x_0) − f*) / k", "L-smooth, convex, x* exists: f(x_k) − f* ≤ L·‖x_0 − x*‖² / (2k)", "L-smooth, PL: f(x_k) − f* ≤ (1 − μ/L)^k·(f(x_0) − f*)"],
                        note: "Why the convex bound holds: every step brings ‖x_i − x*‖² down by at least (2/L)·(f(x_(i+1)) − f*); these decreases telescope, and f(x_i) never rises. This bound is sublinear: halving it takes twice as many steps. The PL bound is linear: multiplied by 1 − μ/L per step, so about (L/μ)·ln(1/ε) steps shrink it by a factor of 1/ε."
                    },
                    ru: {
                        title: "Что даёт каждое предположение",
                        text: [
                            "Помимо L-гладкости, гарантия зависит от формы f. **Выпуклая** f лежит выше всех своих касательных плоскостей. **μ-сильно выпуклая** f (μ > 0) лежит выше параболоида кривизны μ, касающегося её в любой заданной точке: это квадратичная оценка снизу, так же как гладкость — квадратичная оценка сверху.",
                            "**Условие Поляка — Лоясевича** (Polyak–Łojasiewicz, PL) требует меньшего: чтобы градиент был велик везде, где значение далеко от оптимального. Оно следует из μ-сильной выпуклости, но выпуклости не требует, и при нём любая стационарная точка — глобальный минимум.",
                            "Например, f(x) = x² + 3·sin²x не выпукла (её вторая производная меняется от −4 до 8), но удовлетворяет PL с μ = 1/8. Три последние строки ниже — гарантии для градиентного спуска с η = 1/L."
                        ],
                        example: ["выпуклая: f(y) ≥ f(x) + ∇f(x)·(y − x) для всех x, y", "μ-сильно выпуклая: f(y) ≥ f(x) + ∇f(x)·(y − x) + (μ/2)·‖y − x‖²", "PL: ½·‖∇f(x)‖² ≥ μ·(f(x) − f*) для всех x", "L-гладкая: min по i < k от ‖∇f(x_i)‖² ≤ 2L·(f(x_0) − f*) / k", "L-гладкая, выпуклая, x* существует: f(x_k) − f* ≤ L·‖x_0 − x*‖² / (2k)", "L-гладкая, PL: f(x_k) − f* ≤ (1 − μ/L)^k·(f(x_0) − f*)"],
                        note: "Откуда оценка для выпуклых f: каждый шаг уменьшает ‖x_i − x*‖² хотя бы на (2/L)·(f(x_(i+1)) − f*), сумма телескопическая, а f(x_i) не растёт. Эта оценка сублинейна: чтобы уменьшить её вдвое, нужно вдвое больше шагов. Оценка для PL линейна: за шаг она умножается на 1 − μ/L, и около (L/μ)·ln(1/ε) шагов уменьшают её в 1/ε раз."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "f is L-smooth and μ-strongly convex: f(y) ≥ f(x) + ∇f(x)·(y − x) + (μ/2)·‖y − x‖² for all x, y. Order the proof that gradient descent with η = 1/L satisfies f(x_k) − f* ≤ (1 − μ/L)^k·(f(x_0) − f*).",
                        items: ["Minimise both sides of the strong convexity inequality over y: f* ≥ f(x) − ‖∇f(x)‖²/(2μ)", "Rearranged, this is the PL inequality: ‖∇f(x)‖² ≥ 2μ·(f(x) − f*) at every point x", "A step lowers f by at least ‖∇f(x_k)‖²/(2L), hence by PL by at least (μ/L)·(f(x_k) − f*)", "Subtracting f* from both sides: f(x_(k+1)) − f* ≤ (1 − μ/L)·(f(x_k) − f*)", "Applying this inequality k times, starting from x_0, gives the factor (1 − μ/L)^k"],
                        hint: "Which line uses nothing but the definition of strong convexity? After it, each line relies on the one before.",
                        why: "Strong convexity is used only once, to obtain the PL inequality; after that only PL and the descent lemma are at work. So the same linear rate holds for every L-smooth function with the PL condition, convex or not. Since μ ≤ L, the factor 1 − μ/L = 1 − 1/κ lies in [0, 1)."
                    },
                    ru: {
                        q: "f — L-гладкая и μ-сильно выпуклая: f(y) ≥ f(x) + ∇f(x)·(y − x) + (μ/2)·‖y − x‖² для всех x, y. Расставь шаги доказательства того, что градиентный спуск с η = 1/L даёт f(x_k) − f* ≤ (1 − μ/L)^k·(f(x_0) − f*).",
                        items: ["Минимизируем обе части неравенства сильной выпуклости по y: f* ≥ f(x) − ‖∇f(x)‖²/(2μ)", "После перестановки это неравенство PL: ‖∇f(x)‖² ≥ 2μ·(f(x) − f*) в каждой точке x", "Шаг уменьшает f хотя бы на ‖∇f(x_k)‖²/(2L), а значит, по PL — хотя бы на (μ/L)·(f(x_k) − f*)", "Вычитаем f* из обеих частей: f(x_(k+1)) − f* ≤ (1 − μ/L)·(f(x_k) − f*)", "Применяем это неравенство k раз, начиная с x_0: получаем множитель (1 − μ/L)^k"],
                        hint: "Какая строка использует только само определение сильной выпуклости? После неё каждая строка опирается на предыдущую.",
                        why: "Сильная выпуклость нужна один раз — чтобы получить неравенство PL; дальше работают только PL и лемма о спуске. Поэтому та же линейная скорость верна для любой L-гладкой функции с условием PL, выпуклой или нет. Так как μ ≤ L, множитель 1 − μ/L = 1 − 1/κ лежит в [0; 1)."
                    }
                },
                {
                    type: "number", answer: 1375, tolerance: 1, card: "t2b",
                    en: {
                        q: "f is L-smooth and μ-strongly convex, L = 50, μ = 0.5. Gradient descent with η = 1/L guarantees f(x_k) − f* ≤ (1 − μ/L)^k·(f(x_0) − f*). What is the smallest k for which this bound is at most (f(x_0) − f*)/10⁶?",
                        hint: "The factor in the bound is q^k with q = 1 − μ/L. Solve q^k ≤ 10^(−6) with logarithms; the estimate (L/μ)·ln 10⁶ replaces ln q by −μ/L and overshoots by a few steps.",
                        why: "μ/L = 0.01, so the bound is 0.99^k times the initial gap. 0.99^k ≤ 10^(−6) means k ≥ ln 10⁶ / (−ln 0.99) = 13.8155 / 0.0100503 = 1374.6, so k = 1375. The estimate κ·ln 10⁶ with κ = L/μ = 100 gives 1382: slightly more, because −ln(1 − 1/κ) > 1/κ. Each further factor of 10 costs about κ·ln 10 ≈ 230 more steps."
                    },
                    ru: {
                        q: "f — L-гладкая и μ-сильно выпуклая, L = 50, μ = 0,5. Градиентный спуск с η = 1/L гарантирует f(x_k) − f* ≤ (1 − μ/L)^k·(f(x_0) − f*). При каком наименьшем k эта оценка не больше (f(x_0) − f*)/10⁶?",
                        hint: "Множитель в оценке равен q^k, где q = 1 − μ/L. Реши q^k ≤ 10^(−6) с помощью логарифмов; прикидка (L/μ)·ln 10⁶ заменяет ln q на −μ/L и даёт на несколько шагов больше.",
                        why: "μ/L = 0,01, так что оценка — это 0,99^k·(f(x_0) − f*). 0,99^k ≤ 10^(−6) при k ≥ ln 10⁶ / (−ln 0,99) = 13,8155 / 0,0100503 = 1374,6, то есть k = 1375. Прикидка κ·ln 10⁶ с κ = L/μ = 100 даёт 1382: чуть больше, потому что −ln(1 − 1/κ) > 1/κ. Каждый следующий множитель 10 стоит ещё около κ·ln 10 ≈ 230 шагов."
                    }
                },
                {
                    type: "info", icon: "🚀", mono: true,
                    en: {
                        title: "Acceleration, and where it must stop",
                        text: [
                            "**Nesterov's accelerated gradient method** adds momentum to gradient descent, with a twist: it first extrapolates along its last move to a point y_k and takes the gradient step from there (first line below). With the right coefficients β_k the guarantees improve in order: 1/k² in place of 1/k, and √κ in place of κ.",
                            "No method of this kind can do better in order. For every k ≤ (d − 1)/2 there is a convex L-smooth quadratic on R^d for which every method whose iterates stay in x_0 + the span of the gradients seen so far obeys the lower bound of the last line.",
                            "In the strongly convex case a lower bound of the same kind shows that a number of steps of the order of √κ·ln(1/ε) is necessary when the dimension is large enough."
                        ],
                        example: ["y_k = x_k + β_k·(x_k − x_(k−1)), x_(k+1) = y_k − ∇f(y_k)/L", "convex: f(x_k) − f* ≤ 2·L·‖x_0 − x*‖² / (k + 1)²", "μ-strongly convex, β_k = (√κ − 1)/(√κ + 1): f(x_k) − f* ≤ 2·(1 − 1/√κ)^k·(f(x_0) − f*)", "κ = 100: 2·0.9^k ≤ 10^(−6) from k = 138 on; gradient descent with its 0.99^k needs k = 1375", "lower bound: f(x_k) − f* ≥ 3·L·‖x_0 − x*‖² / (32·(k + 1)²)"],
                        note: "These are worst cases over a whole class, in high dimension: on R^d the conjugate gradient method minimises any strictly convex quadratic in at most d steps. And methods that use more than gradients, such as Newton's method, are not bound by this limit."
                    },
                    ru: {
                        title: "Ускорение и его предел",
                        text: [
                            "**Ускоренный градиентный метод Нестерова** добавляет к градиентному спуску импульс, но с поправкой: сначала экстраполирует вдоль последнего перемещения в точку y_k и уже из неё делает градиентный шаг (первая строка ниже). При правильных коэффициентах β_k гарантии улучшаются по порядку: 1/k² вместо 1/k и √κ вместо κ.",
                            "Улучшить этот порядок методами такого рода нельзя. Для любого k ≤ (d − 1)/2 в R^d найдётся выпуклая L-гладкая квадратичная функция, на которой для любого метода, чьи точки лежат в x_0 + линейная оболочка уже вычисленных градиентов, верна нижняя оценка из последней строки.",
                            "В сильно выпуклом случае аналогичная нижняя оценка показывает, что при достаточно большой размерности необходимо порядка √κ·ln(1/ε) шагов."
                        ],
                        example: ["y_k = x_k + β_k·(x_k − x_(k−1)), x_(k+1) = y_k − ∇f(y_k)/L", "выпуклая: f(x_k) − f* ≤ 2·L·‖x_0 − x*‖² / (k + 1)²", "μ-сильно выпуклая, β_k = (√κ − 1)/(√κ + 1): f(x_k) − f* ≤ 2·(1 − 1/√κ)^k·(f(x_0) − f*)", "κ = 100: 2·0,9^k ≤ 10^(−6) начиная с k = 138; градиентному спуску с его 0,99^k нужно k = 1375", "нижняя оценка: f(x_k) − f* ≥ 3·L·‖x_0 − x*‖² / (32·(k + 1)²)"],
                        note: "Это оценки для худшей функции целого класса при большой размерности: в R^d метод сопряжённых градиентов минимизирует любую строго выпуклую квадратичную функцию не более чем за d шагов. А методы, которые используют не только градиенты, например метод Ньютона, этим пределом не связаны."
                    }
                },
                {
                    type: "number", answer: 89, tolerance: 0, card: "t2c",
                    en: {
                        q: "Convex L-smooth f, ‖x_0 − x*‖ = R: gradient descent with η = 1/L guarantees f(x_k) − f* ≤ L·R²/(2k), Nesterov's accelerated method 2·L·R²/(k + 1)². L = 10, R = 2. What is the smallest k at which Nesterov's bound is at most 0.01?",
                        hint: "Solve 2·L·R²/(k + 1)² ≤ 0.01 for k + 1, then round k up.",
                        why: "2·L·R² = 2·10·4 = 80, so (k + 1)² ≥ 80/0.01 = 8000, k + 1 ≥ 89.44, k ≥ 88.44: k = 89. Gradient descent's bound needs L·R²/(2·0.01) = 2000 steps. To make the bound another 100 times smaller, the accelerated method needs about 10 times as many steps, plain gradient descent 100 times as many."
                    },
                    ru: {
                        q: "Выпуклая L-гладкая f, ‖x_0 − x*‖ = R: градиентный спуск с η = 1/L гарантирует f(x_k) − f* ≤ L·R²/(2k), ускоренный метод Нестерова — 2·L·R²/(k + 1)². L = 10, R = 2. При каком наименьшем k оценка метода Нестерова не больше 0,01?",
                        hint: "Реши неравенство 2·L·R²/(k + 1)² ≤ 0,01 относительно k + 1, затем округли k вверх.",
                        why: "2·L·R² = 2·10·4 = 80, поэтому (k + 1)² ≥ 80/0,01 = 8000, k + 1 ≥ 89,44, k ≥ 88,44: k = 89. Оценке градиентного спуска нужно L·R²/(2·0,01) = 2000 шагов. Чтобы уменьшить оценку ещё в 100 раз, ускоренному методу нужно примерно в 10 раз больше шагов, а обычному спуску — в 100 раз."
                    }
                },
                {
                    type: "number", answer: 0.0526, tolerance: 0.00005, card: "t2d",
                    en: {
                        q: "SGD with a constant step on f(x) = (λ/2)·x²: x ← (1 − η·λ)·x − η·ξ, with gradient noise ξ, independent at every step, of mean 0 and variance σ². For λ = σ² = 1 and η = 0.1, at what variance does x settle? Four decimal places.",
                        hint: "In the stationary state the variance V is the same before and after a step. For independent x and ξ: Var(a·x + b·ξ) = a²·Var(x) + b²·Var(ξ).",
                        why: "Stationarity: V = (1 − η·λ)²·V + η²·σ², so V = η·σ²/(λ·(2 − η·λ)) = 0.1/1.9 = 0.0526. With η = 0.01 it is 0.01/1.99 = 0.00503: the floor is nearly proportional to η. A constant step forgets its start at the rate (1 − η·λ)^(2k) and then stalls at this floor; to get below it, the step has to shrink."
                    },
                    ru: {
                        q: "SGD с постоянным шагом на f(x) = (λ/2)·x²: x ← (1 − η·λ)·x − η·ξ, где шум градиента ξ на каждом шаге независимый, со средним 0 и дисперсией σ². λ = σ² = 1, η = 0,1. К чему стремится дисперсия x? Четыре знака после запятой.",
                        hint: "В стационарном режиме дисперсия V до шага и после него одна и та же. Для независимых x и ξ: Var(a·x + b·ξ) = a²·Var(x) + b²·Var(ξ).",
                        why: "Стационарность: V = (1 − η·λ)²·V + η²·σ², откуда V = η·σ²/(λ·(2 − η·λ)) = 0,1/1,9 = 0,0526. При η = 0,01 получается 0,01/1,99 = 0,00503: плато почти пропорционально η. С постоянным шагом начальная точка забывается со скоростью (1 − η·λ)^(2k), а затем процесс застревает на плато; чтобы опуститься ниже, шаг нужно уменьшать."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge, on paper. SGD on (λ/2)·x² with a decaying step: x_(t+1) = (1 − η_t·λ)·x_t − η_t·ξ_t, η_t = 1/(λ·t), t = 1, 2, …; the ξ_t are independent, with mean 0 and variance σ². Find E[x_(t+1)²] exactly. Idea: multiply by t.",
                        answer: [
                            "With η_t = 1/(λ·t): x_(t+1) = (1 − 1/t)·x_t − ξ_t/(λ·t). Multiply by t: t·x_(t+1) = (t − 1)·x_t − ξ_t/λ. So s_t = (t − 1)·x_t obeys s_(t+1) = s_t − ξ_t/λ, and s_1 = 0 whatever the start x_1 is.",
                            "Hence s_(t+1) = −(ξ_1 + … + ξ_t)/λ and x_(t+1) = −(ξ_1 + … + ξ_t)/(λ·t): this SGD simply averages the noise. So E[x_(t+1)²] = σ²/(λ²·t), exactly. There is no floor: the error falls as 1/t. For λ = σ² = 1 it is below 1/19 ≈ 0.0526, the floor of the constant step η = 0.1, as soon as t > 19.",
                            "In general: for μ-strongly convex problems, under the usual bounds on the gradient noise, steps η_t = c/t with c > 1/(2μ) give an expected squared distance to the minimiser of the order of 1/t. A smaller c is slower: for c = 1/(4λ) in this model, even the contribution of the start to E[x_t²] decays only as 1/√t."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой, на бумаге. SGD на (λ/2)·x² с убывающим шагом: x_(t+1) = (1 − η_t·λ)·x_t − η_t·ξ_t, η_t = 1/(λ·t), t = 1, 2, …; шумы ξ_t независимы, со средним 0 и дисперсией σ². Найди E[x_(t+1)²] точно. Идея: умножь на t.",
                        answer: [
                            "При η_t = 1/(λ·t): x_(t+1) = (1 − 1/t)·x_t − ξ_t/(λ·t). Умножим на t: t·x_(t+1) = (t − 1)·x_t − ξ_t/λ. Значит, s_t = (t − 1)·x_t подчиняется s_(t+1) = s_t − ξ_t/λ, причём s_1 = 0 при любой начальной точке x_1.",
                            "Поэтому s_(t+1) = −(ξ_1 + … + ξ_t)/λ и x_(t+1) = −(ξ_1 + … + ξ_t)/(λ·t): такой SGD просто усредняет шум. Отсюда E[x_(t+1)²] = σ²/(λ²·t), точно. Плато нет: ошибка убывает как 1/t. При λ = σ² = 1 она меньше 1/19 ≈ 0,0526, то есть плато постоянного шага η = 0,1, как только t > 19.",
                            "В общем случае: для μ-сильно выпуклых задач при обычных ограничениях на шум градиента шаги η_t = c/t с c > 1/(2μ) дают средний квадрат расстояния до точки минимума порядка 1/t. При меньшем c сходимость медленнее: при c = 1/(4λ) в этой модели даже вклад начальной точки в E[x_t²] убывает лишь как 1/√t."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Descent lemma for an L-smooth f: `f(y) ≤ f(x) + ∇f(x)·(y − x) + (L/2)·‖y − x‖²`. A gradient step η lowers f by at least η·(1 − L·η/2)·‖∇f(x)‖², at best ‖∇f(x)‖²/(2L) at η = 1/L. Without convexity or PL this gives small gradients only: for η = 1/L, min over i < k of ‖∇f(x_i)‖² ≤ 2L·(f(x_0) − f*)/k.",
                            "On a quadratic the coordinate along each eigenvector is multiplied by 1 − η·λ_i per step: convergence from every start exactly when η < 2/λ_max, and κ = L/μ sets the speed. That λ_max hovers near 2/η in full-batch training of networks (the edge of stability) is an observation, not a theorem.",
                            "With η = 1/L: a convex f has `f(x_k) − f* ≤ L·‖x_0 − x*‖²/(2k)`; PL or μ-strong convexity gives `f(x_k) − f* ≤ (1 − μ/L)^k·(f(x_0) − f*)`, about κ·ln(1/ε) steps. Nesterov's method reaches the orders 1/k² and √κ·ln(1/ε); in the worst case, in high dimension, no method built from gradients alone beats them.",
                            "SGD with a constant step η on (λ/2)·x², with gradient noise of variance σ², settles at the variance `η·σ²/(λ·(2 − η·λ))`: it is fast, but stops at a floor nearly proportional to η. Steps η_t = c/t with c > 1/(2λ) remove the floor: E[x_t²] then falls as 1/t."
                        ]
                    },
                    ru: {
                        points: [
                            "Лемма о спуске для L-гладкой f: `f(y) ≤ f(x) + ∇f(x)·(y − x) + (L/2)·‖y − x‖²`. Градиентный шаг η уменьшает f не меньше чем на η·(1 − L·η/2)·‖∇f(x)‖², в лучшем случае на ‖∇f(x)‖²/(2L) при η = 1/L. Без выпуклости и PL отсюда следует только малость градиента: при η = 1/L min по i < k от ‖∇f(x_i)‖² ≤ 2L·(f(x_0) − f*)/k.",
                            "На квадратичной функции координата вдоль каждого собственного вектора за шаг умножается на 1 − η·λ_i: спуск сходится из любой точки тогда и только тогда, когда η < 2/λ_max, а скорость задаёт κ = L/μ. То, что при обучении сетей по всей выборке λ_max держится около 2/η (граница устойчивости), — наблюдение, а не теорема.",
                            "При η = 1/L: для выпуклой f `f(x_k) − f* ≤ L·‖x_0 − x*‖²/(2k)`; PL или μ-сильная выпуклость дают `f(x_k) − f* ≤ (1 − μ/L)^k·(f(x_0) − f*)`, около κ·ln(1/ε) шагов. Метод Нестерова достигает порядков 1/k² и √κ·ln(1/ε); в худшем случае при большой размерности ни один метод, использующий только градиенты, их не улучшит.",
                            "SGD с постоянным шагом η на (λ/2)·x² с шумом градиента дисперсии σ² выходит на дисперсию `η·σ²/(λ·(2 − η·λ))`: это быстро, но дальше плато, почти пропорциональное η. Шаги η_t = c/t с c > 1/(2λ) убирают плато: E[x_t²] убывает как 1/t."
                        ]
                    }
                }
            ]
        },

        /* ----- t3. Information theory of learning ----- */
        t3: {
            steps: [
                {
                    type: "info", icon: "🎲", mono: true,
                    en: {
                        title: "Entropy, cross-entropy and KL divergence",
                        text: [
                            "Let p be a distribution on a finite set. The **surprisal** of an outcome x is log₂(1/p(x)) bits, and the **entropy** H(p) is its expectation under p: the uncertainty of one draw. A sure outcome gives 0 bits, a uniform choice among M outcomes log₂ M bits, the maximum for M outcomes.",
                            "If the data come from p but the predictions from a model q, the expected value of log₂(1/q(x)) is the **cross-entropy** H(p, q), the usual training loss. It splits into H(p), which no model can change, and the **KL divergence** KL(p ‖ q): the price of using q in place of p.",
                            "**Gibbs' inequality**: KL(p ‖ q) ≥ 0, with equality only for q = p. So H(p, q) ≥ H(p), the true distribution is the unique minimiser of the cross-entropy, and minimising the cross-entropy over a family of models is minimising KL(p ‖ q)."
                        ],
                        example: ["H(p) = −Σ_x p(x)·log₂ p(x)", "H(p, q) = −Σ_x p(x)·log₂ q(x) = H(p) + KL(p ‖ q)", "KL(p ‖ q) = Σ_x p(x)·log₂(p(x)/q(x)) ≥ 0", "fair coin: 1 bit; uniform over 8 outcomes: 3 bits", "coin with P(heads) = 0.9: 0.9·0.152 + 0.1·3.322 = 0.469 bits"],
                        note: "Terms with p(x) = 0 count as 0. If q(x) = 0 for an x with p(x) > 0, then H(p, q) and KL(p ‖ q) are infinite: one outcome that the model called impossible costs infinitely many bits. With ln in place of log₂ the unit is the nat: 1 nat = 1/ln 2 ≈ 1.4427 bits."
                    },
                    ru: {
                        title: "Энтропия, перекрёстная энтропия и KL-дивергенция",
                        text: [
                            "Пусть p — распределение на конечном множестве. **Собственная информация** (surprisal) исхода x равна log₂(1/p(x)) бит, а **энтропия** H(p) — её математическое ожидание по p: неопределённость одного испытания. Достоверный исход даёт 0 бит, равномерный выбор из M исходов — log₂ M бит, максимум для M исходов.",
                            "Если данные приходят из p, а предсказывает модель q, то математическое ожидание log₂(1/q(x)) — это **перекрёстная энтропия** (cross-entropy) H(p, q), обычная функция потерь. Она раскладывается на H(p), которую не изменит никакая модель, и **дивергенцию Кульбака — Лейблера** KL(p ‖ q): плату за то, что вместо p взято q.",
                            "**Неравенство Гиббса**: KL(p ‖ q) ≥ 0, причём равенство возможно только при q = p. Поэтому H(p, q) ≥ H(p), истинное распределение — единственный минимум перекрёстной энтропии, а минимизировать её по семейству моделей — то же, что минимизировать KL(p ‖ q)."
                        ],
                        example: ["H(p) = −Σ_x p(x)·log₂ p(x)", "H(p, q) = −Σ_x p(x)·log₂ q(x) = H(p) + KL(p ‖ q)", "KL(p ‖ q) = Σ_x p(x)·log₂(p(x)/q(x)) ≥ 0", "честная монета: 1 бит; равномерно по 8 исходам: 3 бита", "монета с P(орёл) = 0,9: 0,9·0,152 + 0,1·3,322 = 0,469 бита"],
                        note: "Слагаемые с p(x) = 0 считаются равными 0. Если q(x) = 0 при p(x) > 0, то H(p, q) и KL(p ‖ q) бесконечны: один исход, который модель считала невозможным, стоит бесконечно много бит. Если вместо log₂ взять ln, единицей станет нат: 1 нат = 1/ln 2 ≈ 1,4427 бита."
                    }
                },
                {
                    type: "number", answer: 0.74, tolerance: 0.005, card: "t3a",
                    en: {
                        q: "Data are fair coin flips: p = (0.5, 0.5). A model predicts q = (0.9, 0.1). By how many bits per flip does the cross-entropy H(p, q) exceed the entropy H(p), that is, KL(p ‖ q) = Σ_x p(x)·log₂(p(x)/q(x))? Two decimal places.",
                        hint: "Two terms, and one of them is negative: log₂(0.5/0.9) < 0. Only the sum has to come out non-negative.",
                        why: "KL(p ‖ q) = 0.5·log₂(0.5/0.9) + 0.5·log₂(0.5/0.1) = 0.5·(−0.848) + 0.5·2.322 = 0.737 ≈ 0.74 bits. Check: H(p, q) = 0.5·0.152 + 0.5·3.322 = 1.737 and H(p) = 1. The other direction differs: KL(q ‖ p) = 0.9·log₂ 1.8 + 0.1·log₂ 0.2 = 0.763 − 0.232 = 0.531 bits. KL is not symmetric."
                    },
                    ru: {
                        q: "Данные — броски честной монеты: p = (0,5; 0,5). Модель предсказывает q = (0,9; 0,1). На сколько бит на бросок перекрёстная энтропия H(p, q) больше энтропии H(p), то есть KL(p ‖ q) = Σ_x p(x)·log₂(p(x)/q(x))? Округли до сотых.",
                        hint: "Слагаемых два, и одно из них отрицательное: log₂(0,5/0,9) < 0. Неотрицательной обязана быть только сумма.",
                        why: "KL(p ‖ q) = 0,5·log₂(0,5/0,9) + 0,5·log₂(0,5/0,1) = 0,5·(−0,848) + 0,5·2,322 = 0,737 ≈ 0,74 бита. Проверка: H(p, q) = 0,5·0,152 + 0,5·3,322 = 1,737, а H(p) = 1. В обратную сторону иначе: KL(q ‖ p) = 0,9·log₂ 1,8 + 0,1·log₂ 0,2 = 0,763 − 0,232 = 0,531 бита. KL-дивергенция несимметрична."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Order the proof of Gibbs' inequality KL(p ‖ q) ≥ 0 for distributions p and q on a finite set. S is the set of outcomes x with p(x) > 0, and every sum runs over x in S.",
                        items: ["By definition, −KL(p ‖ q) = Σ p(x)·log₂(q(x)/p(x))", "The logarithm is concave, so by Jensen that average of logarithms is ≤ log₂ Σ p(x)·(q(x)/p(x))", "Inside this logarithm p(x) cancels, and what is left is Σ q(x), a sum over S only", "A sum of q over part of the outcomes is at most 1, so the logarithm is at most log₂ 1 = 0", "Hence KL(p ‖ q) ≥ 0. Equality needs q(x)/p(x) constant on S and Σ q(x) = 1 on S, so q = p"],
                        hint: "Start from the definition. Jensen for a concave f: the average of f(Z) is at most f of the average of Z.",
                        why: "Jensen is applied to Z = q(X)/p(X) with X drawn from p: E[log₂ Z] ≤ log₂ E[Z], and E[Z] = Σ q(x) over S ≤ 1. Both inequalities are equalities only when Z is constant and q puts all its mass on S, that is, when q = p. In nats the proof is the same, with ln."
                    },
                    ru: {
                        q: "Расставь шаги доказательства неравенства Гиббса KL(p ‖ q) ≥ 0 для распределений p и q на конечном множестве. S — множество исходов x с p(x) > 0, все суммы берутся по x из S.",
                        items: ["По определению −KL(p ‖ q) = Σ p(x)·log₂(q(x)/p(x))", "Логарифм вогнут, и по неравенству Йенсена это среднее логарифмов ≤ log₂ Σ p(x)·(q(x)/p(x))", "Под этим логарифмом p(x) сокращается, и остаётся Σ q(x) — сумма только по S", "Сумма q по части исходов не больше 1, поэтому логарифм не больше log₂ 1 = 0", "Значит, KL(p ‖ q) ≥ 0. Равенство требует q(x)/p(x) = const на S и Σ q(x) = 1 на S, то есть q = p"],
                        hint: "Начни с определения. Неравенство Йенсена для вогнутой f: среднее значений f(Z) не больше, чем f от среднего Z.",
                        why: "Неравенство Йенсена применено к Z = q(X)/p(X), где X взято из p: E[log₂ Z] ≤ log₂ E[Z], а E[Z] = Σ q(x) по S ≤ 1. Оба неравенства обращаются в равенства, только если Z постоянно и вся масса q лежит на S, то есть при q = p. В натах доказательство то же, с ln."
                    }
                },
                {
                    type: "info", icon: "📦", mono: true,
                    en: {
                        title: "Prediction is compression",
                        text: [
                            "**Perplexity** is 2 to the power of the loss in bits, or e to the power of the loss in nats: the number of equally likely options with the same uncertainty. Perplexity 16 means 4 bits per token: as uncertain as a fair choice among 16 tokens.",
                            "Bits are code lengths. **Kraft's inequality**: a binary **prefix code** (no codeword begins another) with lengths l(x) exists exactly when Σ_x 2^(−l(x)) ≤ 1. So a code acts as a model q(x) = 2^(−l(x)), and a model q gives a code with l(x) ≈ log₂(1/q(x)). **Arithmetic coding** builds such a code for whole sequences.",
                            "The coded length of a sequence is then almost exactly the model's total cross-entropy loss on it, in bits: minimising the loss is minimising the compressed size. **Source coding theorem**: for symbols drawn independently from p, no uniquely decodable code needs fewer than H(p) bits per symbol on average."
                        ],
                        example: ["perplexity = 2^(loss in bits) = e^(loss in nats)", "loss 1.5 nats per token = 2.164 bits: perplexity e^1.5 ≈ 4.48", "Kraft: Σ_x 2^(−l(x)) ≤ 1", "arithmetic coding with a model q, for a sequence x_1 … x_T:", "length ≤ Σ_t log₂(1/q(x_t | x_1 … x_(t−1))) + about 2 bits", "0.8 bits per character: 1,000,000 characters in 800,000 bits = 100,000 bytes"],
                        note: "A classifier is data too. One stored in exactly b bits is one of at most 2^b. If the format was fixed before the data, the finite-class bound on the generalisation gap, √((ln|H| + ln(2/δ)) / (2n)), holds with ln|H| ≤ b·ln 2. Shorter descriptions need fewer examples: the idea behind **minimum description length** (MDL)."
                    },
                    ru: {
                        title: "Предсказание — это сжатие",
                        text: [
                            "**Перплексия** (perplexity) — это 2 в степени потерь в битах, или e в степени потерь в натах: число равновероятных вариантов с той же неопределённостью. Перплексия 16 означает 4 бита на токен: неопределённость как при честном выборе из 16 токенов.",
                            "Биты — это длины кодов. **Неравенство Крафта**: двоичный **префиксный код** (ни одно слово не начало другого) с длинами l(x) существует ровно тогда, когда Σ_x 2^(−l(x)) ≤ 1. Код — это модель q(x) = 2^(−l(x)), а модель q — код с l(x) ≈ log₂(1/q(x)). **Арифметическое кодирование** строит такой код для целых последовательностей.",
                            "Длина кода последовательности тогда почти точно равна суммарной перекрёстной энтропии модели на ней, в битах: минимизировать потери — значит минимизировать сжатый размер. **Теорема о кодировании источника**: для символов, независимо взятых из p, ни один однозначно декодируемый код не тратит в среднем меньше H(p) бит на символ."
                        ],
                        example: ["перплексия = 2^(потери в битах) = e^(потери в натах)", "потери 1,5 ната на токен = 2,164 бита: перплексия e^1,5 ≈ 4,48", "Крафт: Σ_x 2^(−l(x)) ≤ 1", "арифметическое кодирование с моделью q, последовательность x_1 … x_T:", "длина ≤ Σ_t log₂(1/q(x_t | x_1 … x_(t−1))) + около 2 бит", "0,8 бита на символ: 1 000 000 символов в 800 000 бит = 100 000 байт"],
                        note: "Классификатор — тоже данные. Записанный ровно в b бит, он один из не более чем 2^b. Если формат записи выбран до данных, оценка разрыва обобщения для конечного класса, √((ln|H| + ln(2/δ)) / (2n)), верна с ln|H| ≤ b·ln 2. Короткое описание требует меньше примеров: это идея **принципа минимальной длины описания** (MDL)."
                    }
                },
                {
                    type: "number", answer: 90, tolerance: 1, card: "t3b",
                    en: {
                        q: "A language model's test loss is 2.0 nats per token; a token averages 4 characters. An arithmetic coder driven by this model stores 1,000,000 characters of such text in about how many kilobytes (1 kB = 8000 bits)? Whole number.",
                        hint: "Nats to bits: divide by ln 2. Then count the tokens, and only at the end turn bits into kilobytes.",
                        why: "2.0 nats = 2.0/ln 2 = 2.8854 bits per token. 1,000,000 characters are 250,000 tokens: 250,000·2.8854 = 721,350 bits ≈ 90,170 bytes ≈ 90 kB. That is 0.72 bits per character, 11 times less than one byte per character. The model's perplexity is e² ≈ 7.39 per token."
                    },
                    ru: {
                        q: "Потери языковой модели на тесте — 2,0 ната на токен, токен — в среднем 4 символа. Арифметический кодер с этой моделью запишет 1 000 000 символов такого текста примерно в сколько килобайт (1 КБ = 8000 бит)? Округли до целого.",
                        hint: "Переведи наты в биты: раздели на ln 2. Потом посчитай токены и только в конце переведи биты в килобайты.",
                        why: "2,0 ната = 2,0/ln 2 = 2,8854 бита на токен. 1 000 000 символов — это 250 000 токенов: 250 000·2,8854 = 721 350 бит ≈ 90 170 байт ≈ 90 КБ. Это 0,72 бита на символ — в 11 раз меньше, чем байт на символ. Перплексия модели e² ≈ 7,39 на токен."
                    }
                },
                {
                    type: "number", answer: 0.059, tolerance: 0.0005,
                    en: {
                        q: "With probability ≥ 1 − δ, every h in a finite class H has |true error − error on n independent examples| ≤ √((ln|H| + ln(2/δ)) / (2n)). Compute this bound for the values in the table. Three decimal places.",
                        table: { side: true, head: ["", "Value"], rows: [["Class H", "a different classifier for each file of exactly 1000 bits"], ["Examples, n", "100,000"], ["δ", "0.05"]] },
                        hint: "How many different files of exactly 1000 bits are there? Take the logarithm before you compute anything.",
                        why: "There are 2^1000 files, so ln|H| = 1000·ln 2 = 693.1, and ln(2/δ) = ln 40 = 3.7. The bound: √(696.8 / 200,000) = √0.003484 = 0.059. With 10⁶ bits the same n gives √(693,151 / 200,000) ≈ 1.86, which says nothing. The file format must be fixed before the data are seen."
                    },
                    ru: {
                        q: "С вероятностью ≥ 1 − δ для каждого h из конечного класса H |истинная ошибка − ошибка на n независимых примерах| ≤ √((ln|H| + ln(2/δ)) / (2n)). Вычисли эту оценку для значений из таблицы. Округли до тысячных.",
                        table: { side: true, head: ["", "Значение"], rows: [["Класс H", "свой классификатор для каждого файла длиной ровно 1000 бит"], ["Число примеров n", "100 000"], ["δ", "0,05"]] },
                        hint: "Сколько существует разных файлов длиной ровно 1000 бит? Возьми логарифм, прежде чем что-либо вычислять.",
                        why: "Файлов 2^1000, поэтому ln|H| = 1000·ln 2 = 693,1, а ln(2/δ) = ln 40 = 3,7. Оценка: √(696,8 / 200 000) = √0,003484 = 0,059. При 10⁶ бит то же n даёт √(693 151 / 200 000) ≈ 1,86 — такая оценка ничего не говорит. Формат файла нужно зафиксировать до того, как получены данные."
                    }
                },
                {
                    type: "info", icon: "🔗", mono: true,
                    en: {
                        title: "Mutual information and data processing",
                        text: [
                            "The **conditional entropy** H(X | Y) is the average over y of the entropy of p(x | y): the uncertainty left in X once Y is known. The **mutual information** I(X; Y) = H(X) − H(X | Y) is the number of bits of uncertainty that Y removes.",
                            "I(X; Y) is the KL divergence of the joint distribution from the product of the marginals. So, by Gibbs, it is non-negative, and it is zero exactly when X and Y are independent. It is symmetric: Y tells as much about X as X tells about Y.",
                            "**Data processing inequality**: if X → Y → Z is a **Markov chain** (given Y, Z is independent of X), then I(X; Z) ≤ I(X; Y). No processing of Y, deterministic or random, adds information about X."
                        ],
                        example: ["H(X | Y) = Σ_y p(y)·H(X | Y = y)", "I(X; Y) = H(X) − H(X | Y) = H(Y) − H(Y | X)", "I(X; Y) = KL(p(x, y) ‖ p(x)·p(y)) ≥ 0", "X a fair bit, Y = X with probability 0.9, flipped otherwise:", "I(X; Y) = H(Y) − H(Y | X) = 1 − 0.469 = 0.531 bits", "X → Y → Z: I(X; Z) ≤ I(X; Y)"],
                        note: "In a network, label → input → layer 1 → layer 2 → … is a Markov chain: each layer is computed from the one before. So no layer holds more information about the label than the input does."
                    },
                    ru: {
                        title: "Взаимная информация и обработка данных",
                        text: [
                            "**Условная энтропия** H(X | Y) — среднее по y от энтропии распределения p(x | y): неопределённость X, которая остаётся, когда Y известно. **Взаимная информация** I(X; Y) = H(X) − H(X | Y) — число бит неопределённости, которое снимает Y.",
                            "I(X; Y) — это KL-дивергенция совместного распределения относительно произведения маргинальных. Поэтому по неравенству Гиббса она неотрицательна и равна нулю тогда и только тогда, когда X и Y независимы. Она симметрична: Y говорит об X столько же, сколько X об Y.",
                            "**Неравенство обработки данных** (data processing inequality): если X → Y → Z — **марковская цепь** (при известном Y величина Z не зависит от X), то I(X; Z) ≤ I(X; Y). Никакая обработка Y, детерминированная или случайная, не добавляет информации об X."
                        ],
                        example: ["H(X | Y) = Σ_y p(y)·H(X | Y = y)", "I(X; Y) = H(X) − H(X | Y) = H(Y) − H(Y | X)", "I(X; Y) = KL(p(x, y) ‖ p(x)·p(y)) ≥ 0", "X — честный бит, Y = X с вероятностью 0,9, иначе бит перевёрнут:", "I(X; Y) = H(Y) − H(Y | X) = 1 − 0,469 = 0,531 бита", "X → Y → Z: I(X; Z) ≤ I(X; Y)"],
                        note: "В нейросети метка → вход → слой 1 → слой 2 → … — марковская цепь: каждый слой вычисляется по предыдущему. Поэтому ни один слой не содержит больше информации о метке, чем вход."
                    }
                },
                {
                    type: "number", answer: 0.31, tolerance: 0.005,
                    en: {
                        q: "X is a fair bit. If X = 0, then Y = 0. If X = 1, then Y is a fair bit, independent of everything else. What is I(X; Y) in bits? Two decimal places.",
                        hint: "Use I(X; Y) = H(Y) − H(Y | X). First find P(Y = 0), then average the entropy of Y over the two values of X.",
                        why: "P(Y = 1) = 0.5·0.5 = 0.25, so H(Y) = 0.75·log₂(4/3) + 0.25·2 = 0.311 + 0.5 = 0.811. H(Y | X) = 0.5·0 + 0.5·1 = 0.5. I(X; Y) = 0.811 − 0.5 = 0.311 ≈ 0.31 bits. The other way agrees: H(X) − H(X | Y) = 1 − 0.75·0.9183 = 0.311, since given Y = 0, X = 1 has probability 1/3."
                    },
                    ru: {
                        q: "X — честный бит. Если X = 0, то Y = 0. Если X = 1, то Y — честный бит, не зависящий ни от чего другого. Чему равна I(X; Y) в битах? Округли до сотых.",
                        hint: "Используй I(X; Y) = H(Y) − H(Y | X). Сначала найди P(Y = 0), потом усредни энтропию Y по двум значениям X.",
                        why: "P(Y = 1) = 0,5·0,5 = 0,25, поэтому H(Y) = 0,75·log₂(4/3) + 0,25·2 = 0,311 + 0,5 = 0,811. H(Y | X) = 0,5·0 + 0,5·1 = 0,5. I(X; Y) = 0,811 − 0,5 = 0,311 ≈ 0,31 бита. Другой путь даёт то же: H(X) − H(X | Y) = 1 − 0,75·0,9183 = 0,311, ведь при Y = 0 вероятность X = 1 равна 1/3."
                    }
                },
                {
                    type: "choice", card: "t3c",
                    en: {
                        q: "A network computes h = f(x) from the input x; y is the label. Argument: (1) y → x → h is a Markov chain. (2) Hence I(h; y) ≤ I(x; y). (3) Hence a linear probe on h cannot be more accurate than one on x. Which step is wrong?",
                        options: ["Step 3: mutual information ignores how hard decoding is; a probe may find in h what it misses in x", "Step 1: a Markov chain needs h to be a random function of x, and this f is deterministic", "Step 2: the inequality needs an invertible f; for other f it can go in either direction", "Step 2: processing bounds I(h; x), but it says nothing about a third variable such as y"],
                        hint: "Try to break each step with a small example. Which properties of f do the definition of a Markov chain and the data processing inequality really use?",
                        why: "Steps 1 and 2 are right: given x, h is fixed, so independent of y, and data processing holds for every f (with equality for an invertible one). But I(h; y) counts what an unrestricted decoder could extract. For independent fair bits a, b and y = a XOR b, a linear probe on x = (a, b) reaches at most 75%; on h = (a, b, a·b), 100%."
                    },
                    ru: {
                        q: "Сеть вычисляет h = f(x) по входу x; y — метка. Рассуждение: (1) y → x → h — марковская цепь. (2) Значит, I(h; y) ≤ I(x; y). (3) Значит, линейный зонд (linear probe) на h не может быть точнее, чем на x. Какой шаг неверен?",
                        options: ["Шаг 3: взаимная информация не учитывает сложность декодирования; зонд может найти в h то, чего не видит в x", "Шаг 1: в марковской цепи h должно быть случайной функцией x, а эта f детерминирована", "Шаг 2: неравенство требует обратимой f; для остальных f знак может быть любым", "Шаг 2: обработка ограничивает I(h; x), но ничего не говорит о третьей величине, такой как y"],
                        hint: "Попробуй опровергнуть каждый шаг маленьким примером. Какие свойства f на самом деле используют определение марковской цепи и неравенство обработки данных?",
                        why: "Шаги 1 и 2 верны: h при данном x фиксировано и не зависит от y, а неравенство обработки данных верно для любой f (для обратимой — с равенством). Но I(h; y) — то, что извлёк бы неограниченный декодер. Для независимых честных битов a, b и y = a XOR b линейный зонд на x = (a; b) даёт не больше 75%, а на h = (a; b; a·b) — 100%."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "X and Y are discrete random variables, p and q are distributions on the same finite set. Is the statement always true, or can it fail?",
                        groups: ["Always true", "Can fail"],
                        items: [["KL(p ‖ q) = KL(q ‖ p)", 1], ["H(p, q) ≥ H(p)", 0], ["H(X | Y = y) ≤ H(X) for every value y", 1], ["H(X | Y) ≤ H(X)", 0], ["I(X; Y) ≤ H(X)", 0], ["KL(p ‖ q) is finite", 1], ["I(X; f(Y)) ≤ I(X; Y) for every function f", 0]],
                        why: "KL is not symmetric, and it is infinite when q gives probability 0 to an outcome that p allows. Conditioning lowers entropy only on average: let Y be a fair bit, X = 0 if Y = 0, and X a fair bit if Y = 1; then H(X) = 0.811 but H(X | Y = 1) = 1. The rest: Gibbs, H(X | Y) ≥ 0 and the chain X → Y → f(Y)."
                    },
                    ru: {
                        q: "X и Y — дискретные случайные величины, p и q — распределения на одном и том же конечном множестве. Утверждение верно всегда или может нарушаться?",
                        groups: ["Верно всегда", "Может нарушаться"],
                        items: [["KL(p ‖ q) = KL(q ‖ p)", 1], ["H(p, q) ≥ H(p)", 0], ["H(X | Y = y) ≤ H(X) при каждом значении y", 1], ["H(X | Y) ≤ H(X)", 0], ["I(X; Y) ≤ H(X)", 0], ["KL(p ‖ q) конечна", 1], ["I(X; f(Y)) ≤ I(X; Y) для любой функции f", 0]],
                        why: "KL-дивергенция несимметрична и бесконечна, когда q даёт вероятность 0 исходу, возможному при p. Знание Y уменьшает энтропию X только в среднем: пусть Y — честный бит, X = 0 при Y = 0, а при Y = 1 X — честный бит; тогда H(X) = 0,811, но H(X | Y = 1) = 1. Остальное: неравенство Гиббса, H(X | Y) ≥ 0 и цепь X → Y → f(Y)."
                    }
                },
                {
                    type: "info", icon: "⚖️", mono: true,
                    en: {
                        title: "Fano's inequality: no information, no decision",
                        text: [
                            "Now the converse question: how much information does a decision need? Let X be uniform over M hypotheses and let Y be the data. Whatever rule g turns the data into a guess g(Y), **Fano's inequality** bounds its probability of error from below through I(X; Y) alone.",
                            "Reason: once Y is known, one more bit tells whether the guess is right, and if it is wrong, at most log₂ M more bits name the true hypothesis. So H(X | Y) ≤ 1 + P(error)·log₂ M, while H(X | Y) = log₂ M − I(X; Y) for a uniform X.",
                            "This is how lower bounds on sample size are proved. Choose M hypotheses that are hard to tell apart and bound the information in the data: n examples, independent and identically distributed given X, carry at most n times the information of one. Until that reaches about log₂ M bits, every algorithm fails often."
                        ],
                        example: ["X uniform over M hypotheses, any rule g:", "P(g(Y) ≠ X) ≥ 1 − (I(X; Y) + 1) / log₂ M", "M = 1024, I(X; Y) = 4 bits: P(error) ≥ 1 − 5/10 = 0.5", "Y_1 … Y_n independent given X, with the same distribution:", "I(X; Y_1 … Y_n) ≤ n·I(X; Y_1)"]
                    },
                    ru: {
                        title: "Неравенство Фано: нет информации — нет решения",
                        text: [
                            "Теперь обратный вопрос: сколько информации нужно для решения? Пусть X равномерно распределено на M гипотезах, а Y — данные. Каким бы правилом g ни строилась догадка g(Y), **неравенство Фано** ограничивает вероятность её ошибки снизу через одну лишь I(X; Y).",
                            "Причина: когда Y известно, ещё один бит сообщает, верна ли догадка, а если она неверна, не более log₂ M бит называют истинную гипотезу. Поэтому H(X | Y) ≤ 1 + P(ошибка)·log₂ M, а для равномерного X выполнено H(X | Y) = log₂ M − I(X; Y).",
                            "Так доказывают нижние оценки на объём выборки. Выбирают M трудноразличимых гипотез и ограничивают информацию в данных: n примеров, независимых и одинаково распределённых при заданном X, несут не более чем в n раз больше информации, чем один. Пока она не дойдёт примерно до log₂ M бит, любой алгоритм часто ошибается."
                        ],
                        example: ["X равномерно на M гипотезах, любое правило g:", "P(g(Y) ≠ X) ≥ 1 − (I(X; Y) + 1) / log₂ M", "M = 1024, I(X; Y) = 4 бита: P(ошибка) ≥ 1 − 5/10 = 0,5", "Y_1 … Y_n независимы при заданном X и одинаково распределены:", "I(X; Y_1 … Y_n) ≤ n·I(X; Y_1)"]
                    }
                },
                {
                    type: "number", answer: 400, tolerance: 0.5, card: "t3d",
                    en: {
                        q: "Fano: if X is uniform over M hypotheses, any estimator has P(error) ≥ 1 − (I + 1)/log₂ M, with I the bits of information about X in the data. M = 1024; n examples give I ≤ 0.02·n. Smallest n at which this allows P(error) ≤ 0.1?",
                        hint: "How many bits of information are needed before the right-hand side drops to 0.1? Then turn bits into examples.",
                        why: "log₂ 1024 = 10. The bound permits P(error) ≤ 0.1 only if 1 − (I + 1)/10 ≤ 0.1, so I ≥ 8 bits, and 0.02·n ≥ 8 gives n ≥ 400. With fewer examples every method, however much it computes, errs with probability above 0.1. Fano gives necessary sample sizes; generalisation bounds give sufficient ones."
                    },
                    ru: {
                        q: "Фано: если X равномерно на M гипотезах, то у любого правила P(ошибка) ≥ 1 − (I + 1)/log₂ M, где I — информация об X в данных, в битах. M = 1024; n примеров дают I ≤ 0,02·n. При каком наименьшем n это допускает P(ошибка) ≤ 0,1?",
                        hint: "Сколько бит информации нужно, чтобы правая часть опустилась до 0,1? Затем переведи биты в примеры.",
                        why: "log₂ 1024 = 10. Оценка допускает P(ошибка) ≤ 0,1, только если 1 − (I + 1)/10 ≤ 0,1, то есть I ≥ 8 бит, а из 0,02·n ≥ 8 следует n ≥ 400. При меньшем числе примеров любой метод, сколько бы он ни вычислял, ошибается с вероятностью больше 0,1. Неравенство Фано даёт необходимый объём выборки, а оценки обобщения — достаточный."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge, on paper. A prefix code fixed before the data describes each classifier h in L(h) bits. Prove: with probability ≥ 1 − δ, every h has |true error − error on n independent examples| ≤ √((L(h)·ln 2 + ln(2/δ)) / (2n)).",
                        answer: [
                            "Give every h its own share of δ: δ_h = δ·2^(−L(h)). Let D(h) be the gap between its two errors. Each h is fixed before the data, so by Hoeffding P(D(h) ≥ ε) ≤ 2·exp(−2·n·ε²). The right-hand side equals δ_h at ε_h = √(ln(2/δ_h) / (2n)) = √((L(h)·ln 2 + ln(2/δ)) / (2n)).",
                            "Union bound: P(D(h) ≥ ε_h for some h) ≤ Σ_h δ_h = δ·Σ_h 2^(−L(h)) ≤ δ. The last step is Kraft's inequality for the prefix code, and it works for infinitely many h too: only the sum of the shares matters, not the number of classifiers.",
                            "With equal lengths L(h) = b this is the finite-class bound with ln|H| = b·ln 2. In general 2^(−L(h)) acts as a prior over classifiers, chosen before the data: those with short descriptions get tighter guarantees. A code chosen after looking at the sample would break the proof."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой. Префиксный код выбран до данных; классификатор h он кодирует в L(h) бит. Докажи: с вероятностью ≥ 1 − δ для всех h |истинная ошибка − ошибка на n независимых примерах| ≤ √((L(h)·ln 2 + ln(2/δ)) / (2n)).",
                        answer: [
                            "Дадим каждому h свою долю δ: δ_h = δ·2^(−L(h)). Пусть D(h) — разрыв между двумя его ошибками. Каждый h зафиксирован до данных, поэтому по неравенству Хёфдинга P(D(h) ≥ ε) ≤ 2·exp(−2·n·ε²). Правая часть равна δ_h при ε_h = √(ln(2/δ_h) / (2n)) = √((L(h)·ln 2 + ln(2/δ)) / (2n)).",
                            "Оценка объединения: P(D(h) ≥ ε_h хотя бы для одного h) ≤ Σ_h δ_h = δ·Σ_h 2^(−L(h)) ≤ δ. Последний шаг — неравенство Крафта для префиксного кода, и он проходит даже для бесконечного числа h: важна только сумма долей, а не число классификаторов.",
                            "При одинаковых длинах L(h) = b это оценка для конечного класса с ln|H| = b·ln 2. В общем случае 2^(−L(h)) играет роль априорного распределения на классификаторах, выбранного до данных: у классификаторов с коротким описанием гарантии точнее. Код, выбранный после взгляда на выборку, разрушил бы доказательство."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "`H(p, q) = H(p) + KL(p ‖ q)` and `KL(p ‖ q) = Σ p·log₂(p/q) ≥ 0`, with zero only for q = p (Gibbs, from Jensen). KL is not symmetric, and it is infinite when q gives probability 0 to an outcome that p allows.",
                            "1 nat = 1/ln 2 ≈ 1.4427 bits; perplexity = 2^(bits) = e^(nats). An arithmetic coder driven by a model stores a text in almost exactly its total cross-entropy in bits, and no uniquely decodable code beats the entropy on average. A classifier of b bits: `ln|H| ≤ b·ln 2` in the finite-class bound.",
                            "`I(X; Y) = H(X) − H(X | Y) = KL(p(x, y) ‖ p(x)·p(y))` is non-negative and symmetric. Data processing: for a Markov chain X → Y → Z, `I(X; Z) ≤ I(X; Y)`. It bounds the information that is present, not what a given decoder can extract.",
                            "Fano: if X is uniform over M hypotheses, any decision rule has `P(error) ≥ 1 − (I(X; Y) + 1) / log₂ M`. With a bound on the bits per example, this gives a number of examples below which every algorithm fails often."
                        ]
                    },
                    ru: {
                        points: [
                            "`H(p, q) = H(p) + KL(p ‖ q)` и `KL(p ‖ q) = Σ p·log₂(p/q) ≥ 0`, причём ноль только при q = p (неравенство Гиббса, из неравенства Йенсена). KL-дивергенция несимметрична и бесконечна, когда q даёт вероятность 0 исходу, возможному при p.",
                            "1 нат = 1/ln 2 ≈ 1,4427 бита; перплексия = 2^(биты) = e^(наты). Арифметический кодер с моделью записывает текст в число бит, почти точно равное суммарной перекрёстной энтропии, и ни один однозначно декодируемый код в среднем не обходит энтропию. Классификатор из b бит: `ln|H| ≤ b·ln 2` в оценке для конечного класса.",
                            "`I(X; Y) = H(X) − H(X | Y) = KL(p(x, y) ‖ p(x)·p(y))` неотрицательна и симметрична. Неравенство обработки данных: для марковской цепи X → Y → Z `I(X; Z) ≤ I(X; Y)`. Оно ограничивает информацию, которая есть, а не ту, что извлечёт данный декодер.",
                            "Неравенство Фано: если X равномерно на M гипотезах, то у любого решающего правила `P(ошибка) ≥ 1 − (I(X; Y) + 1) / log₂ M`. Вместе с оценкой числа бит на пример оно даёт число примеров, ниже которого любой алгоритм часто ошибается."
                        ]
                    }
                }
            ]
        },

        /* ----- t4. High dimensions and random matrices ----- */
        t4: {
            steps: [
                {
                    type: "info", icon: "🌐", mono: true,
                    en: {
                        title: "High dimension: the mass sits in a thin shell",
                        text: [
                            "Scaling a body in R^d by a factor r multiplies its volume by r^d. So the part of a ball within a share 1 − ε of its radius holds only (1 − ε)^d of the volume: once d·ε is large, almost all of the ball is a thin layer under its surface.",
                            "A standard Gaussian x ~ N(0, I_d) does the same in its own way. ‖x‖² is a sum of d independent squares x_i², each with mean 1 and variance E[x_i⁴] − 1 = 2. So ‖x‖² has mean d and standard deviation √(2d), small next to d: the length ‖x‖ stays close to √d.",
                            "The density is highest at the origin, yet almost no sample lands near it: the volume at radius r grows as r^(d−1), and the product of the two peaks near √d. A Gaussian in high dimension is a **thin shell**, not a ball. How thin: that is your next task."
                        ],
                        example: ["ball of radius R: share of the volume inside radius (1 − ε)·R = (1 − ε)^d", "d = 100, ε = 0.05: 0.95¹⁰⁰ ≈ 0.006, so 99.4% lies in the outer 5%", "x ~ N(0, I_d): E[‖x‖²] = d, Var(‖x‖²) = 2d", "d = 10,000: ‖x‖² = 10,000 ± 141, so ‖x‖ is close to 100"],
                        note: "The same counting is the **curse of dimensionality**: a grid of spacing 0.1 on the cube [0, 1]^d has 10^d cells, so a method that needs a training point within a fixed distance of every query needs a number of samples exponential in d."
                    },
                    ru: {
                        title: "Высокая размерность: масса лежит в тонком слое",
                        text: [
                            "Если растянуть тело в R^d в r раз, его объём умножится на r^d. Поэтому часть шара в пределах доли 1 − ε его радиуса содержит лишь долю (1 − ε)^d объёма: когда d·ε велико, почти весь шар — это тонкий слой под поверхностью.",
                            "Стандартный гауссов вектор x ~ N(0, I_d) ведёт себя похоже. ‖x‖² — сумма d независимых квадратов x_i², у каждого среднее 1 и дисперсия E[x_i⁴] − 1 = 2. Значит, у ‖x‖² среднее d и стандартное отклонение √(2d), малое рядом с d: длина ‖x‖ держится около √d.",
                            "Плотность максимальна в нуле, но рядом с нулём почти нет точек выборки: объём на радиусе r растёт как r^(d−1), и произведение плотности на объём достигает максимума около √d. Гауссово распределение в высокой размерности — **тонкая оболочка** (thin shell), а не шар. Насколько тонкая — твоя следующая задача."
                        ],
                        example: ["шар радиуса R: доля объёма внутри радиуса (1 − ε)·R равна (1 − ε)^d", "d = 100, ε = 0,05: 0,95¹⁰⁰ ≈ 0,006, то есть 99,4% лежит во внешних 5%", "x ~ N(0, I_d): E[‖x‖²] = d, Var(‖x‖²) = 2d", "d = 10 000: ‖x‖² = 10 000 ± 141, так что ‖x‖ близка к 100"],
                        note: "Тот же подсчёт — **проклятие размерности** (curse of dimensionality): сетка с шагом 0,1 на кубе [0; 1]^d состоит из 10^d ячеек, так что методу, которому для каждого запроса нужна обучающая точка не дальше фиксированного расстояния, требуется число примеров, экспоненциальное по d."
                    }
                },
                {
                    type: "number", answer: 0.71, tolerance: 0.005, card: "t4a",
                    en: {
                        q: "x ~ N(0, I_d) with d = 20,000: ‖x‖² has mean d and standard deviation √(2d). Linearise the root: √(d + u) ≈ √d + u/(2·√d). What is the standard deviation of the length ‖x‖ in this approximation? Two decimal places.",
                        hint: "A deviation u of ‖x‖² moves ‖x‖ by about u/(2·√d). Take u equal to one standard deviation of ‖x‖².",
                        why: "√(2d) = √40,000 = 200 and 2·√d = 2·141.42 = 282.84, so the standard deviation of ‖x‖ is 200/282.84 = 0.71. In general √(2d)/(2·√d) = 1/√2 for every d: the radius √d of the shell grows with d, its thickness does not. The exact value tends to 1/√2 as d grows (it is 0.698 already at d = 10)."
                    },
                    ru: {
                        q: "x ~ N(0, I_d), d = 20 000: у ‖x‖² среднее d и стандартное отклонение √(2d). Линеаризуй корень: √(d + u) ≈ √d + u/(2·√d). Чему в этом приближении равно стандартное отклонение длины ‖x‖? Округли до сотых.",
                        hint: "Отклонение u величины ‖x‖² сдвигает ‖x‖ примерно на u/(2·√d). Возьми u равным одному стандартному отклонению ‖x‖².",
                        why: "√(2d) = √40 000 = 200, а 2·√d = 2·141,42 = 282,84, поэтому стандартное отклонение ‖x‖ равно 200/282,84 = 0,71. В общем виде √(2d)/(2·√d) = 1/√2 при любом d: радиус оболочки √d растёт с d, а её толщина — нет. Точное значение стремится к 1/√2 с ростом d (уже при d = 10 оно равно 0,698)."
                    }
                },
                {
                    type: "info", icon: "🧭", mono: true,
                    en: {
                        title: "Almost everything is almost orthogonal",
                        text: [
                            "Let u and v be independent random unit vectors in R^d, each uniform on the sphere. By symmetry their cosine u·v is distributed like one coordinate u_1. The d coordinates share one distribution and their squares add up to 1, so E[u_1²] = 1/d: the cosine has mean 0 and standard deviation exactly 1/√d.",
                            "Its tails are no heavier than Gaussian ones: a bound on the area of a spherical cap gives P(|u·v| ≥ ε) ≤ 2·exp(−d·ε²/2) for 0 < ε < 1. Two random directions in high dimension are almost orthogonal with overwhelming probability.",
                            "So far more than d almost orthogonal directions fit. Draw N such vectors independently: they form fewer than N²/2 pairs, so by the union bound P(some pair has |cos| ≥ ε) < N²·exp(−d·ε²/2). If that is at most 1, some set of N vectors has every pairwise |cos| below ε."
                        ],
                        example: ["u, v independent, uniform on the unit sphere of R^d:", "E[u·v] = 0, Var(u·v) = 1/d; d = 10,000: standard deviation 0.01", "P(|u·v| ≥ ε) ≤ 2·exp(−d·ε²/2); d = 10,000, ε = 0.1: at most 2·e^(−50)"],
                        note: "Exactly orthogonal directions: at most d. Almost orthogonal ones: a number exponential in d. This is the room that **superposition** uses: a network can store more features than it has dimensions, as directions that interfere only slightly."
                    },
                    ru: {
                        title: "Почти всё почти ортогонально",
                        text: [
                            "Пусть u и v — независимые случайные единичные векторы в R^d, каждый равномерно распределён на сфере. В силу симметрии их косинус u·v распределён как одна координата u_1. У всех d координат одно распределение, а сумма их квадратов равна 1, поэтому E[u_1²] = 1/d: у косинуса среднее 0 и стандартное отклонение ровно 1/√d.",
                            "Хвосты у него не тяжелее гауссовых: оценка площади сферической шапочки даёт P(|u·v| ≥ ε) ≤ 2·exp(−d·ε²/2) при 0 < ε < 1. Два случайных направления в высокой размерности почти ортогональны с подавляющей вероятностью.",
                            "Поэтому почти ортогональных направлений помещается гораздо больше, чем d. Возьмём N таких независимых векторов: пар меньше N²/2, и по оценке объединения (union bound) P(у какой-то пары |cos| ≥ ε) < N²·exp(−d·ε²/2). Если это не больше 1, найдётся набор из N векторов, у которого все попарные |cos| меньше ε."
                        ],
                        example: ["u, v независимы и равномерно распределены на единичной сфере в R^d:", "E[u·v] = 0, Var(u·v) = 1/d; d = 10 000: стандартное отклонение 0,01", "P(|u·v| ≥ ε) ≤ 2·exp(−d·ε²/2); d = 10 000, ε = 0,1: не больше 2·e^(−50)"],
                        note: "Строго ортогональных направлений не больше d, а почти ортогональных — экспоненциально много по d. Этим пользуется **суперпозиция** (superposition): сеть может хранить больше признаков, чем у неё измерений, в виде направлений, которые лишь слегка мешают друг другу."
                    }
                },
                {
                    type: "number", answer: 5527, tolerance: 1, card: "t4b",
                    en: {
                        q: "Independent uniform random unit vectors u, v in R^d: P(|u·v| ≥ ε) ≤ 2·exp(−d·ε²/2). N such vectors form fewer than N²/2 pairs. For which smallest d does the union bound show that N = 10⁶ of them can have all pairwise |cos| < 0.1?",
                        hint: "Bound the probability that some pair fails by the number of pairs times the bound for one pair, and ask for at most 1. A dimension is rounded up.",
                        why: "P(some pair has |cos| ≥ ε) < (N²/2)·2·exp(−d·ε²/2) = N²·exp(−d·ε²/2). This is at most 1 when d ≥ 4·ln N/ε² = 4·13.8155/0.01 = 5526.2, so d = 5527: then all pairs are fine with positive probability. Only 5527 orthogonal directions fit there, but at least a million almost orthogonal ones; doubling d squares the guaranteed N."
                    },
                    ru: {
                        q: "Независимые векторы u, v, равномерные на единичной сфере в R^d: P(|u·v| ≥ ε) ≤ 2·exp(−d·ε²/2). У N векторов меньше N²/2 пар. Наименьшее d, при котором по оценке объединения есть 10⁶ таких векторов со всеми попарными |cos| < 0,1?",
                        hint: "Оцени вероятность того, что подведёт хотя бы одна пара: число пар, умноженное на оценку для одной пары. Потребуй, чтобы это было не больше 1. Размерность округляют вверх.",
                        why: "P(есть пара с |cos| ≥ ε) < (N²/2)·2·exp(−d·ε²/2) = N²·exp(−d·ε²/2). Это не больше 1 при d ≥ 4·ln N/ε² = 4·13,8155/0,01 = 5526,2, то есть d = 5527: тогда с положительной вероятностью все пары хороши. Ортогональных направлений там 5527, а почти ортогональных — не меньше миллиона; удвоение d возводит гарантированное N в квадрат."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "True or false? Each statement can be checked with a formula from the screens before and a short calculation.",
                        groups: ["True", "False"],
                        items: [["Independent x, y ~ N(0, I_d) with d = 5000: the distance ‖x − y‖ is close to 100", 0], ["x ~ N(0, I_d) with d = 1000: P(‖x‖ ≤ 10) exceeds 0.5, because the density peaks at the origin", 1], ["Independent uniform unit vectors u, v in R^d with d = 2500: P(|u·v| ≥ 0.1) is above 0.01", 1], ["A ball in R^500 has more than 99% of its volume in the outer 1% of its radius", 0], ["With d = 10,000, at most 10,000 unit vectors of R^d can have all pairwise |cos| below 0.1", 1], ["A sub-cube holding 1% of the volume of the cube [0, 1]^100 has a side longer than 0.95", 0]],
                        why: "x − y ~ N(0, 2·I_d), so ‖x − y‖ ≈ √(2d) = 100; 0.99⁵⁰⁰ ≈ 0.007; the side is 0.01^(1/100) ≈ 0.955. But for d = 1000, ‖x‖ ≈ 31.6 ± 0.7; at d = 2500 a cosine of 0.1 is 5 standard deviations (the bound is 2·e^(−12.5) ≈ 0.000007); and at d = 10,000 the union bound guarantees e²⁵ ≈ 7·10¹⁰ directions."
                    },
                    ru: {
                        q: "Верно или неверно? Каждое утверждение проверяется формулой с предыдущих экранов и коротким вычислением.",
                        groups: ["Верно", "Неверно"],
                        items: [["Независимые x, y ~ N(0, I_d), d = 5000: расстояние ‖x − y‖ близко к 100", 0], ["x ~ N(0, I_d), d = 1000: P(‖x‖ ≤ 10) больше 0,5, ведь плотность максимальна в нуле", 1], ["Независимые u, v, равномерные на единичной сфере в R^d, d = 2500: P(|u·v| ≥ 0,1) больше 0,01", 1], ["У шара в R^500 больше 99% объёма лежит во внешнем слое толщиной 1% радиуса", 0], ["При d = 10 000 в R^d можно выбрать не больше 10 000 единичных векторов с попарными |cos| меньше 0,1", 1], ["У подкуба, содержащего 1% объёма куба [0; 1]^100, сторона длиннее 0,95", 0]],
                        why: "x − y ~ N(0, 2·I_d), поэтому ‖x − y‖ ≈ √(2d) = 100; 0,99⁵⁰⁰ ≈ 0,007; сторона равна 0,01^(1/100) ≈ 0,955. Но при d = 1000 ‖x‖ ≈ 31,6 ± 0,7; при d = 2500 косинус 0,1 — это 5 стандартных отклонений (оценка даёт 2·e^(−12,5) ≈ 0,000007); а при d = 10 000 оценка объединения гарантирует e²⁵ ≈ 7·10¹⁰ направлений."
                    }
                },
                {
                    type: "info", icon: "📏", mono: true,
                    en: {
                        title: "Johnson–Lindenstrauss: distances survive a random projection",
                        text: [
                            "Let A be a k × d matrix with independent N(0, 1/k) entries: a **random projection** from R^d to R^k. For a fixed x, the k coordinates of A·x are independent N(0, ‖x‖²/k). So ‖A·x‖²/‖x‖² is the mean of k squared standard normals: 1 on average, and close to 1 when k is large.",
                            "**Johnson–Lindenstrauss lemma**: for 0 < ε < 1 and any n points in R^d, if k satisfies the bound below, some linear map to R^k multiplies every squared distance between two of the points by a factor between 1 − ε and 1 + ε. The distances themselves then also change by a factor within 1 ± ε.",
                            "The original dimension d does not appear, and n enters only through ln n. The proof (your next task) shows that a random A works with probability at least 1/n. With 6 in place of 4 in the bound, one draw fails with probability below 1/n."
                        ],
                        example: ["for a fixed x and 0 < ε < 1:", "P(‖A·x‖² outside (1 ± ε)·‖x‖²) ≤ 2·exp(−(k/2)·(ε²/2 − ε³/3))", "enough for all pairs of n points at once: k ≥ 4·ln n / (ε²/2 − ε³/3)", "n = 1000, ε = 0.2: 4·6.9078 / 0.017333 = 1594.1, so k = 1595"]
                    },
                    ru: {
                        title: "Лемма Джонсона — Линденштрауса: расстояния переживают случайную проекцию",
                        text: [
                            "Пусть A — матрица k × d с независимыми элементами N(0, 1/k): **случайная проекция** (random projection) из R^d в R^k. Для фиксированного x координаты A·x — k независимых величин N(0, ‖x‖²/k). Значит, ‖A·x‖²/‖x‖² — среднее k квадратов стандартных нормальных величин: в среднем 1 и близко к 1 при большом k.",
                            "**Лемма Джонсона — Линденштрауса** (Johnson–Lindenstrauss): при 0 < ε < 1 для любых n точек в R^d, если k удовлетворяет оценке ниже, найдётся линейное отображение в R^k, которое умножает квадрат расстояния между любыми двумя из этих точек на число от 1 − ε до 1 + ε. Тогда и сами расстояния умножаются на числа в пределах 1 ± ε.",
                            "Исходная размерность d в оценку не входит, а n входит только через ln n. Доказательство (твоя следующая задача) показывает, что случайная A подходит с вероятностью не меньше 1/n. Если заменить в оценке 4 на 6, одна попытка не удаётся с вероятностью меньше 1/n."
                        ],
                        example: ["для фиксированного x и 0 < ε < 1:", "P(‖A·x‖² вне (1 ± ε)·‖x‖²) ≤ 2·exp(−(k/2)·(ε²/2 − ε³/3))", "достаточно сразу для всех пар из n точек: k ≥ 4·ln n / (ε²/2 − ε³/3)", "n = 1000, ε = 0,2: 4·6,9078 / 0,017333 = 1594,1, то есть k = 1595"]
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "A is a k × d matrix with independent N(0, 1/k) entries. Order the proof that, for k ≥ 4·ln n / (ε²/2 − ε³/3), it keeps all squared distances between n given points within a factor 1 ± ε with positive probability.",
                        items: ["For a fixed x, the coordinates of A·x are k independent N(0, ‖x‖²/k) variables", "So ‖A·x‖²/‖x‖² is the mean of k squared standard normals, whatever x and d are", "A Chernoff bound: that mean leaves [1 − ε, 1 + ε] with probability ≤ 2·exp(−(k/2)·(ε²/2 − ε³/3))", "Apply this bound to x = u − v for each of the n·(n − 1)/2 pairs: by the union bound the terms add up", "For the k of the question each term is ≤ 2/n² and the sum ≤ 1 − 1/n: A works with probability ≥ 1/n"],
                        hint: "Start with the line that needs nothing before it: the distribution of A·x for one fixed x.",
                        why: "Each line uses the one before: the law of A·x, the ratio as a mean of k squares, its tail bound, the union over pairs, the choice of k. With that k, exp(−(k/2)·(ε²/2 − ε³/3)) ≤ exp(−2·ln n) = 1/n², and n·(n − 1)/2 pairs times 2/n² is 1 − 1/n. Neither d nor the positions of the points entered anywhere."
                    },
                    ru: {
                        q: "A — матрица k × d с независимыми элементами N(0, 1/k). Расставь шаги доказательства: при k ≥ 4·ln n / (ε²/2 − ε³/3) она с положительной вероятностью умножает все квадраты расстояний между n точками на числа в пределах 1 ± ε.",
                        items: ["Для фиксированного x координаты A·x — k независимых величин N(0, ‖x‖²/k)", "Значит, ‖A·x‖²/‖x‖² — среднее k квадратов стандартных нормальных величин при любых x и d", "Оценка Чернова: это среднее вне [1 − ε; 1 + ε] с вероятностью ≤ 2·exp(−(k/2)·(ε²/2 − ε³/3))", "Применим эту оценку к x = u − v для каждой из n·(n − 1)/2 пар и сложим: это оценка объединения", "При k из условия каждое слагаемое ≤ 2/n², а сумма ≤ 1 − 1/n: A подходит с вероятностью ≥ 1/n"],
                        hint: "Начни со строки, которой ничего не нужно до неё: с распределения A·x для одного фиксированного x.",
                        why: "Каждая строка опирается на предыдущую: распределение A·x, отношение как среднее k квадратов, оценка его хвостов, объединение по парам, выбор k. При таком k exp(−(k/2)·(ε²/2 − ε³/3)) ≤ exp(−2·ln n) = 1/n², а n·(n − 1)/2 пар по 2/n² дают 1 − 1/n. Ни d, ни расположение точек нигде не понадобились."
                    }
                },
                {
                    type: "number", answer: 1536, tolerance: 2, card: "t4c",
                    en: {
                        q: "Johnson–Lindenstrauss: any n points in R^d can be mapped linearly to R^k so that every squared pairwise distance changes by a factor within 1 ± ε, if k ≥ 4·ln n / (ε²/2 − ε³/3). Smallest such k for n = 10⁶ and ε = 0.3?",
                        hint: "Compute the denominator ε²/2 − ε³/3 first, then 4·ln n. A dimension is rounded up.",
                        why: "ε²/2 − ε³/3 = 0.045 − 0.009 = 0.036 and 4·ln 10⁶ = 4·13.8155 = 55.262, so k ≥ 55.262/0.036 = 1535.1 and k = 1536, whatever d is. Squaring the number of points to 10¹² only doubles the bound, to 3071: n enters through ln n. The price of precision is 1/ε²."
                    },
                    ru: {
                        q: "Лемма Джонсона — Линденштрауса: любые n точек в R^d линейно отображаются в R^k так, что квадраты попарных расстояний умножаются на числа в пределах 1 ± ε, если k ≥ 4·ln n / (ε²/2 − ε³/3). Наименьшее такое k при n = 10⁶ и ε = 0,3?",
                        hint: "Сначала вычисли знаменатель ε²/2 − ε³/3, затем 4·ln n. Размерность округляют вверх.",
                        why: "ε²/2 − ε³/3 = 0,045 − 0,009 = 0,036 и 4·ln 10⁶ = 4·13,8155 = 55,262, поэтому k ≥ 55,262/0,036 = 1535,1, то есть k = 1536 при любом d. Если возвести число точек в квадрат, до 10¹², оценка лишь удвоится, до 3071: n входит через ln n. Цена точности — 1/ε²."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "For n = 1000 points in R^d, d = 10⁶, and ε = 0.2, the Johnson–Lindenstrauss bound is k ≥ 1595. Someone concludes: “So these points cannot be mapped to fewer than 1595 dimensions with distortion at most ε.” What is wrong?",
                        options: ["A sufficient k is not a necessary one: 1000 points always fit exactly into 999 dimensions", "The bound ignores d: coming from d = 10⁶ dimensions, the true requirement exceeds 1595", "The bound holds for random points only: these particular points may need more than 1595", "The bound needs ε below 0.1: at ε = 0.2 the term ε³/3 is too large for it to hold"],
                        hint: "Read the lemma again: in which direction does its “if” go?",
                        why: "The lemma is an “if”: k ≥ 1595 suffices. Here far less does: the differences x_i − x_1 span at most 999 dimensions, and the orthogonal projection onto their span keeps every distance exactly. The bound holds for any points, any d and all 0 < ε < 1; it is useful only when it is far below both n and d."
                    },
                    ru: {
                        q: "Для n = 1000 точек в R^d, d = 10⁶, и ε = 0,2 оценка Джонсона — Линденштрауса даёт k ≥ 1595. Отсюда делают вывод: «Значит, эти точки нельзя отобразить меньше чем в 1595 измерений с искажением не больше ε». В чём ошибка?",
                        options: ["Достаточное k — ещё не необходимое: 1000 точек всегда точно помещаются в 999 измерений", "Оценка не учитывает d: при переходе из d = 10⁶ измерений на самом деле нужно больше 1595", "Оценка верна лишь для случайных точек: этим конкретным точкам может понадобиться больше 1595", "Оценке нужно ε меньше 0,1: при ε = 0,2 слагаемое ε³/3 слишком велико, и она неверна"],
                        hint: "Перечитай лемму: в какую сторону направлено её «если»?",
                        why: "Лемма — это «если»: k ≥ 1595 достаточно. Здесь хватает куда меньшего: разности x_i − x_1 порождают подпространство размерности не больше 999, и ортогональная проекция на него сохраняет все расстояния точно. Оценка верна для любых точек, любого d и всех 0 < ε < 1; полезна она, лишь когда намного меньше и n, и d."
                    }
                },
                {
                    type: "info", icon: "📊", mono: true,
                    en: {
                        title: "Marchenko–Pastur: the spectrum of pure noise",
                        text: [
                            "X has n rows (samples) and p columns (features); its entries are independent and identically distributed, with mean 0 and variance 1. So the true covariance is the identity. The **sample covariance** is S = X^T·X/n. Each entry of S is within about 1/√n of the identity's, yet the eigenvalues of S are not near 1.",
                            "**Marchenko–Pastur law**: as n and p grow with p/n → γ in (0, 1], the histogram of the eigenvalues of S converges to a fixed density on the interval below. If the entries have a finite fourth moment, the smallest and the largest eigenvalue converge to its two ends.",
                            "The eigenvalues still average 1, but with variance γ: a spread made by sampling alone. Only γ → 0, many samples per feature, brings the identity back. At γ = 1 the lower end reaches 0: S is nearly singular, and whatever inverts S amplifies noise."
                        ],
                        example: ["γ = p/n, a = (1 − √γ)², b = (1 + √γ)²", "density on [a, b]: √((b − λ)·(λ − a)) / (2π·γ·λ)", "γ = 0.25: [0.25, 2.25]; γ = 1: [0, 4]", "singular values of X: from about √n − √p to about √n + √p"],
                        note: "So a largest eigenvalue of 2.2 in the sample covariance of 100 features with unit variance on 400 samples is no sign of structure: independent noise alone reaches 2.25."
                    },
                    ru: {
                        title: "Закон Марченко — Пастура: спектр чистого шума",
                        text: [
                            "В матрице X n строк (наблюдений) и p столбцов (признаков); элементы независимы и одинаково распределены, среднее 0, дисперсия 1. Значит, истинная ковариационная матрица единичная. **Выборочная ковариационная матрица** S = X^T·X/n поэлементно близка к ней (отличия порядка 1/√n), но её собственные значения не близки к 1.",
                            "**Закон Марченко — Пастура** (Marchenko–Pastur): когда n и p растут и p/n → γ из (0; 1], гистограмма собственных значений S сходится к фиксированной плотности на отрезке, указанном ниже. Если у элементов конечен четвёртый момент, наименьшее и наибольшее собственные значения сходятся к его концам.",
                            "Среднее собственных значений по-прежнему 1, но дисперсия равна γ: этот разброс создаёт сама выборка. Единичная матрица возвращается только при γ → 0, когда наблюдений на признак много. При γ = 1 нижний конец достигает 0: S почти вырождена, и всё, что обращает S, усиливает шум."
                        ],
                        example: ["γ = p/n, a = (1 − √γ)², b = (1 + √γ)²", "плотность на [a; b]: √((b − λ)·(λ − a)) / (2π·γ·λ)", "γ = 0,25: [0,25; 2,25]; γ = 1: [0; 4]", "сингулярные числа X: примерно от √n − √p до √n + √p"],
                        note: "Поэтому наибольшее собственное значение 2,2 у выборочной ковариационной матрицы 100 признаков с единичной дисперсией по 400 наблюдениям не говорит о структуре: независимый шум и без неё доходит до 2,25."
                    }
                },
                {
                    type: "number", answer: 16, card: "t4d",
                    en: {
                        q: "X has n rows and p = 0.36·n columns of independent N(0, 1) entries. As n grows, the eigenvalues of S = X^T·X/n fill [(1 − √γ)², (1 + √γ)²], γ = p/n (Marchenko–Pastur). What is the limiting ratio of the largest to the smallest?",
                        hint: "Find γ and √γ, then the two ends of the interval.",
                        why: "γ = 0.36 and √γ = 0.6, so the ends are 0.4² = 0.16 and 1.6² = 2.56, and the ratio is 2.56/0.16 = 16. The true covariance is the identity, with ratio 1: the spread is made by sampling alone. Even at 25 samples per feature (γ = 0.04) the ratio is 1.44/0.64 = 2.25, and at γ = 1 it is unbounded."
                    },
                    ru: {
                        q: "Матрица X: n строк и p = 0,36·n столбцов с независимыми элементами N(0, 1). С ростом n собственные значения S = X^T·X/n заполняют [(1 − √γ)²; (1 + √γ)²], γ = p/n (Марченко — Пастур). Предел отношения наибольшего к наименьшему?",
                        hint: "Найди γ и √γ, а затем оба конца отрезка.",
                        why: "γ = 0,36 и √γ = 0,6, поэтому концы отрезка — 0,4² = 0,16 и 1,6² = 2,56, а отношение равно 2,56/0,16 = 16. Истинная ковариационная матрица единичная, у неё отношение 1: разброс создаёт сама выборка. Даже при 25 наблюдениях на признак (γ = 0,04) отношение равно 1,44/0,64 = 2,25, а при γ = 1 оно не ограничено."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge, on paper. y = x·β + noise of variance σ², x ~ N(0, I_p); β̂ is the least-squares fit on n > p examples (rows of X). Express the excess risk on a new x by the eigenvalues of S = X^T·X/n. What happens as p → n?",
                        answer: [
                            "β̂ = (X^T·X)⁻¹·X^T·y = β + (X^T·X)⁻¹·X^T·e, where e holds the n noise values. A new x is independent of β̂ and has identity covariance, so the excess risk (the expected squared error on a new example, minus σ²) is E[(x·(β̂ − β))²] = E‖β̂ − β‖².",
                            "Average over e with E[e·e^T] = σ²·I: for a given X, E‖β̂ − β‖² = σ²·tr((X^T·X)⁻¹) = (σ²/n)·Σ_i 1/λ_i, where λ_i are the eigenvalues of S. Each direction receives noise in proportion to 1/λ_i: a direction in which the sample hardly varies is fitted on almost nothing.",
                            "Under the Marchenko–Pastur density the mean of 1/λ is 1/(1 − γ), so the risk tends to σ²·γ/(1 − γ): the smallest λ_i, near (1 − √γ)², go to 0 as p → n. For Gaussian features its mean is exactly σ²·p/(n − p − 1) if p < n − 1. This blow-up at p ≈ n is the peak of **double descent**: ill-conditioning, already in linear regression."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой, на бумаге. y = x·β + шум с дисперсией σ², x ~ N(0, I_p); β̂ — оценка наименьших квадратов по n > p примерам (строкам X). Вырази избыточный риск на новом x через спектр S = X^T·X/n. Что происходит при p → n?",
                        answer: [
                            "β̂ = (X^T·X)⁻¹·X^T·y = β + (X^T·X)⁻¹·X^T·e, где e — вектор из n значений шума. Новый x не зависит от β̂, и его ковариационная матрица единичная, поэтому избыточный риск (excess risk: ожидаемый квадрат ошибки на новом примере минус σ²) равен E[(x·(β̂ − β))²] = E‖β̂ − β‖².",
                            "Усредним по e, пользуясь E[e·e^T] = σ²·I: при данной X получаем E‖β̂ − β‖² = σ²·tr((X^T·X)⁻¹) = (σ²/n)·Σ_i 1/λ_i, где λ_i — собственные значения S. Каждое направление получает шум пропорционально 1/λ_i: направление, вдоль которого выборка почти не меняется, оценивается почти ни по чему.",
                            "Для плотности Марченко — Пастура среднее 1/λ равно 1/(1 − γ), и риск стремится к σ²·γ/(1 − γ): наименьшие λ_i ≈ (1 − √γ)² → 0 при p → n. Для гауссовых признаков среднее риска — ровно σ²·p/(n − p − 1) при p < n − 1. Взрыв при p ≈ n — пик **двойного спуска** (double descent): плохая обусловленность уже в линейной регрессии."
                        ]
                    }
                },
                {
                    type: "number", answer: 11,
                    en: {
                        q: "Least squares on n = 101 examples with features x ~ N(0, I_p) and noise variance σ² = 1: for p < n − 1 the expected excess risk is σ²·p/(n − p − 1). By what factor does it grow when p rises from 90 to 99?",
                        hint: "Compute the risk at p = 90 and at p = 99, then divide.",
                        why: "p = 90: 90/(101 − 90 − 1) = 90/10 = 9. p = 99: 99/1 = 99. The factor is 99/9 = 11, for 10% more features; at p = 50 the risk was 50/50 = 1. For p > n + 1 the minimum-norm interpolator has the noise term σ²·n/(p − n − 1), back to 101/100 = 1.01 at p = 202, plus a bias term. The peak sits at p ≈ n."
                    },
                    ru: {
                        q: "Метод наименьших квадратов, n = 101 пример, признаки x ~ N(0, I_p), дисперсия шума σ² = 1: при p < n − 1 ожидаемый избыточный риск равен σ²·p/(n − p − 1). Во сколько раз он вырастет, если увеличить p с 90 до 99?",
                        hint: "Вычисли риск при p = 90 и при p = 99, затем раздели.",
                        why: "p = 90: 90/(101 − 90 − 1) = 90/10 = 9. p = 99: 99/1 = 99. Рост в 99/9 = 11 раз, а признаков больше на 10%; при p = 50 риск был 50/50 = 1. При p > n + 1 у интерполирующего решения с минимальной нормой шумовое слагаемое равно σ²·n/(p − n − 1), при p = 202 это снова 101/100 = 1,01, и к нему добавляется смещение. Пик — при p ≈ n."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Thin shells: a ball in R^d keeps only `(1 − ε)^d` of its volume within a share 1 − ε of its radius, and for x ~ N(0, I_d) the length ‖x‖ is close to `√d`, with a standard deviation near `1/√2 ≈ 0.71` for every large d.",
                            "Two independent random unit vectors in R^d: their cosine has mean 0 and standard deviation `1/√d`, and `P(|cos| ≥ ε) ≤ 2·exp(−d·ε²/2)`. So `exp(d·ε²/4)` directions with all pairwise |cos| < ε exist: the room for superposition.",
                            "Johnson–Lindenstrauss: `k ≥ 4·ln n / (ε²/2 − ε³/3)` dimensions suffice for a linear map, found as a random projection, that keeps all squared distances between n points within a factor 1 ± ε. No d in the bound; it is sufficient, not necessary.",
                            "Marchenko–Pastur: for p/n → γ ≤ 1 the eigenvalues of the sample covariance of i.i.d. unit-variance noise fill `[(1 − √γ)², (1 + √γ)²]`. Least squares pays `σ²·p/(n − p − 1)` (Gaussian features, p < n − 1): the blow-up at p ≈ n is the peak of double descent."
                        ]
                    },
                    ru: {
                        points: [
                            "Тонкие слои: в пределах доли 1 − ε радиуса шара в R^d лежит лишь `(1 − ε)^d` его объёма, а у x ~ N(0, I_d) длина ‖x‖ близка к `√d`, и её стандартное отклонение близко к `1/√2 ≈ 0,71` при любом большом d.",
                            "Два независимых случайных единичных вектора в R^d: у их косинуса среднее 0 и стандартное отклонение `1/√d`, причём `P(|cos| ≥ ε) ≤ 2·exp(−d·ε²/2)`. Поэтому есть `exp(d·ε²/4)` направлений со всеми попарными |cos| < ε: место для суперпозиции.",
                            "Лемма Джонсона — Линденштрауса: `k ≥ 4·ln n / (ε²/2 − ε³/3)` измерений достаточно для линейного отображения (его находят как случайную проекцию), которое сохраняет все квадраты расстояний между n точками с точностью до множителя 1 ± ε. В оценке нет d; условие достаточное, а не необходимое.",
                            "Закон Марченко — Пастура: при p/n → γ ≤ 1 собственные значения выборочной ковариационной матрицы независимого одинаково распределённого шума с единичной дисперсией заполняют `[(1 − √γ)²; (1 + √γ)²]`. Метод наименьших квадратов платит `σ²·p/(n − p − 1)` (гауссовы признаки, p < n − 1): взрыв при p ≈ n — это пик двойного спуска."
                        ]
                    }
                }
            ]
        },

        /* ----- t5. Kernels and the infinite-width limit ----- */
        t5: {
            steps: [
                {
                    type: "info", icon: "📐", mono: true,
                    en: {
                        title: "A kernel is an inner product of features",
                        text: [
                            "A **kernel** is a function k(x, z) of two inputs that equals an inner product φ(x)·φ(z) for some **feature map** φ into a space with an inner product, possibly of infinite dimension. A method that needs the features only through inner products can then work with k alone and never compute φ.",
                            "For any points x_1 … x_n the **Gram matrix** K, with entries K_ij = k(x_i, x_j), is symmetric and positive semi-definite (second line below). Conversely, every symmetric function whose Gram matrices are all positive semi-definite is a kernel: a feature map for it exists (the Moore–Aronszajn theorem).",
                            "Example: the polynomial kernel (1 + x·z)² on R^d is the inner product of all monomials of degree at most 2, each with a fixed positive weight. That is (d + 1)·(d + 2)/2 features, yet one value of k costs a single dot product in R^d."
                        ],
                        example: ["k(x, z) = φ(x)·φ(z)", "c^T·K·c = ‖Σ_i c_i·φ(x_i)‖² ≥ 0 for every vector c", "(1 + x·z)² = 1 + 2·Σ_i x_i·z_i + Σ_i x_i²·z_i² + 2·Σ_(i<j) x_i·x_j·z_i·z_j", "φ(x) = (1, √2·x_i, x_i², √2·x_i·x_j for i < j)", "1 + d + d + d·(d − 1)/2 = (d + 1)·(d + 2)/2; d = 100: 5151 features"],
                        note: "The Gaussian kernel exp(−‖x − z‖²/(2·s²)) is the same idea with a feature space of infinite dimension: φ has infinitely many coordinates and can never be computed in full, and k is still one line of code."
                    },
                    ru: {
                        title: "Ядро — это скалярное произведение признаков",
                        text: [
                            "**Ядро** (kernel) — это функция k(x, z) двух входов, равная скалярному произведению φ(x)·φ(z) для некоторого **отображения признаков** (feature map) φ в пространство со скалярным произведением, возможно бесконечномерное. Методу, которому признаки нужны только через скалярные произведения, достаточно k: вычислять φ не нужно.",
                            "Для любых точек x_1 … x_n **матрица Грама** K с элементами K_ij = k(x_i, x_j) симметрична и неотрицательно определена (вторая строка ниже). Верно и обратное: любая симметричная функция, у которой все матрицы Грама неотрицательно определены, — ядро: для неё существует отображение признаков (теорема Мура — Ароншайна).",
                            "Пример: полиномиальное ядро (1 + x·z)² в R^d — это скалярное произведение всех мономов степени не выше 2, взятых с фиксированными положительными весами. Признаков (d + 1)·(d + 2)/2, а одно значение k стоит одного скалярного произведения в R^d."
                        ],
                        example: ["k(x, z) = φ(x)·φ(z)", "c^T·K·c = ‖Σ_i c_i·φ(x_i)‖² ≥ 0 для любого вектора c", "(1 + x·z)² = 1 + 2·Σ_i x_i·z_i + Σ_i x_i²·z_i² + 2·Σ_(i<j) x_i·x_j·z_i·z_j", "φ(x) = (1; √2·x_i; x_i²; √2·x_i·x_j при i < j)", "1 + d + d + d·(d − 1)/2 = (d + 1)·(d + 2)/2; d = 100: 5151 признак"],
                        note: "Гауссово ядро exp(−‖x − z‖²/(2·s²)) устроено так же, но его пространство признаков бесконечномерно: у φ бесконечно много координат, вычислить его целиком нельзя, а k по-прежнему считается в одну строку."
                    }
                },
                {
                    type: "number", answer: -0.25, tolerance: 0.005,
                    en: {
                        q: "A kernel k and five points x_1 … x_5 satisfy k(x_i, x_i) = 1 for every i and k(x_i, x_j) = ρ for every pair i ≠ j. What is the smallest value of ρ for which this is possible?",
                        hint: "The Gram matrix must be positive semi-definite: c^T·K·c ≥ 0 for every c. Which vector c makes this form smallest here?",
                        why: "For c = (1, 1, 1, 1, 1): c^T·K·c = 5 + 20·ρ = ‖φ(x_1) + … + φ(x_5)‖² ≥ 0, so ρ ≥ −5/20 = −0.25. This value is reached: K then has the eigenvalues 1 + 4·ρ = 0 and 1 − ρ = 1.25 (four times), so five such unit vectors exist: the vertices of a regular simplex in R⁴. For n points the limit is −1/(n − 1)."
                    },
                    ru: {
                        q: "Для ядра k и пяти точек x_1 … x_5 известно: k(x_i, x_i) = 1 при всех i и k(x_i, x_j) = ρ для каждой пары i ≠ j. При каком наименьшем ρ такое возможно?",
                        hint: "Матрица Грама должна быть неотрицательно определённой: c^T·K·c ≥ 0 для любого c. При каком векторе c эта форма здесь наименьшая?",
                        why: "При c = (1; 1; 1; 1; 1): c^T·K·c = 5 + 20·ρ = ‖φ(x_1) + … + φ(x_5)‖² ≥ 0, откуда ρ ≥ −5/20 = −0,25. Это значение достигается: тогда собственные значения K равны 1 + 4·ρ = 0 и 1 − ρ = 1,25 (четырежды), так что пять таких единичных векторов существуют: это вершины правильного симплекса в R⁴. Для n точек граница равна −1/(n − 1)."
                    }
                },
                {
                    type: "info", icon: "🎯", mono: true,
                    en: {
                        title: "The representer theorem and kernel ridge regression",
                        text: [
                            "Each kernel has its own function space H, the **reproducing kernel Hilbert space** (RKHS): the functions f(x) = w·φ(x), with the norm ‖f‖ equal to the smallest ‖w‖ that gives f. A small ‖f‖ means a function that is simple in the sense of this kernel.",
                            "**Representer theorem**: take any loss that depends on f only through f(x_1), …, f(x_n), and add λ·‖f‖² with λ > 0. Then every minimiser over H has the form f(x) = Σ_i α_i·k(x_i, x). A search in a space of any dimension reduces to n numbers.",
                            "With the squared loss this is **kernel ridge regression**. Substituting the form above gives the vector of fitted values f(X) = K·α and ‖f‖² = α^T·K·α, and setting the gradient to zero gives α in closed form (second line)."
                        ],
                        example: ["minimise Σ_i (f(x_i) − y_i)² + λ·‖f‖² over f in H", "f(x) = Σ_i α_i·k(x_i, x) with α = (K + λ·I)^(−1)·y", "fitted values K·α: along an eigenvector of K with eigenvalue s, the component of y is multiplied by s/(s + λ)", "λ → 0, K invertible: α → K^(−1)·y, the interpolant of smallest ‖f‖"],
                        note: "Proof of the theorem: split w = u + v, with u in the span of φ(x_1), …, φ(x_n) and v orthogonal to that span. No f(x_i) = w·φ(x_i) depends on v, while ‖w‖² = ‖u‖² + ‖v‖². So a non-zero v only adds to the penalty: at a minimiser v = 0."
                    },
                    ru: {
                        title: "Теорема о представителе и ядерная гребневая регрессия",
                        text: [
                            "У каждого ядра своё пространство функций H — **гильбертово пространство с воспроизводящим ядром** (RKHS): это функции f(x) = w·φ(x), а норма ‖f‖ — наименьшая ‖w‖, при которой получается f. Малая ‖f‖ означает, что функция проста с точки зрения этого ядра.",
                            "**Теорема о представителе** (representer theorem): возьмём любую функцию потерь, зависящую от f только через f(x_1), …, f(x_n), и прибавим λ·‖f‖² с λ > 0. Тогда любая точка минимума в H имеет вид f(x) = Σ_i α_i·k(x_i, x). Поиск в пространстве любой размерности сводится к n числам.",
                            "С квадратичной функцией потерь получается **ядерная гребневая регрессия** (kernel ridge regression). Подстановка этого вида даёт вектор предсказаний на обучающих точках f(X) = K·α и ‖f‖² = α^T·K·α, а равенство градиента нулю — явную формулу для α (вторая строка)."
                        ],
                        example: ["минимизируем Σ_i (f(x_i) − y_i)² + λ·‖f‖² по f из H", "f(x) = Σ_i α_i·k(x_i, x), где α = (K + λ·I)^(−1)·y", "предсказания K·α: вдоль собственного вектора K с собственным значением s компонента y умножается на s/(s + λ)", "λ → 0, K обратима: α → K^(−1)·y, интерполянт с наименьшей ‖f‖"],
                        note: "Доказательство теоремы: разложим w = u + v, где u лежит в линейной оболочке φ(x_1), …, φ(x_n), а v ей ортогонален. Ни одно f(x_i) = w·φ(x_i) от v не зависит, а ‖w‖² = ‖u‖² + ‖v‖². Значит, ненулевой v только увеличивает штраф: в точке минимума v = 0."
                    }
                },
                {
                    type: "number", answer: 0.625, tolerance: 0.0005, card: "t5a",
                    en: {
                        q: "Kernel ridge regression minimises Σ_i (f(x_i) − y_i)² + λ·‖f‖² and gives f(x) = Σ_i α_i·k(x_i, x), α = (K + λ·I)^(−1)·y, K_ij = k(x_i, x_j). Two points: K_11 = K_22 = 1, K_12 = K_21 = 0.5, y = (1, 0), λ = 0.5. What is f(x_1)?",
                        hint: "First solve (K + λ·I)·α = y, a 2 × 2 system. Then f(x_1) = α_1·K_11 + α_2·K_21.",
                        why: "K + λ·I has 1.5 on the diagonal and 0.5 off it, determinant 2, so α = (1.5·1 − 0.5·0, −0.5·1 + 1.5·0)/2 = (0.75, −0.25). Then f(x_1) = 0.75·1 − 0.25·0.5 = 0.625, and f(x_2) = 0.125: the components of y along (1, 1) and (1, −1) are multiplied by 0.75 and 0.5. With λ → 0, α = (4/3, −2/3) and the fit is exact: (1, 0)."
                    },
                    ru: {
                        q: "Ядерная гребневая регрессия минимизирует Σ_i (f(x_i) − y_i)² + λ·‖f‖² и даёт f(x) = Σ_i α_i·k(x_i, x), α = (K + λ·I)^(−1)·y, K_ij = k(x_i, x_j). Две точки: K_11 = K_22 = 1, K_12 = K_21 = 0,5, y = (1; 0), λ = 0,5. Найди f(x_1).",
                        hint: "Сначала реши систему (K + λ·I)·α = y размера 2 × 2. Затем f(x_1) = α_1·K_11 + α_2·K_21.",
                        why: "У K + λ·I на диагонали 1,5, вне её 0,5, определитель равен 2, поэтому α = (1,5·1 − 0,5·0; −0,5·1 + 1,5·0)/2 = (0,75; −0,25). Тогда f(x_1) = 0,75·1 − 0,25·0,5 = 0,625, а f(x_2) = 0,125: компоненты y вдоль (1; 1) и (1; −1) умножаются на 0,75 и 0,5. При λ → 0 получается α = (4/3; −2/3) и точная интерполяция: (1; 0)."
                    }
                },
                {
                    type: "info", icon: "📈", mono: true,
                    en: {
                        title: "From a network to a kernel: the tangent kernel",
                        text: [
                            "Take any model f(x; θ) that is differentiable in its parameters θ, and linearise it around a point θ_0 (first line). The linearised model is linear in θ, with the feature map φ(x) = ∇_θ f(x; θ_0). The kernel of these features is the **neural tangent kernel** (NTK), Θ (second line).",
                            "Train on L = ½·Σ_i (f(x_i) − y_i)² by **gradient flow**, dθ/dt = −∇_θ L: gradient descent in the limit of a vanishing learning rate. Then the vector of **residuals** r = f(X) − y obeys dr/dt = −Θ_t·r, where Θ_t is the Gram matrix of the NTK on the training inputs at the current θ(t). This is exact for any such model.",
                            "If Θ_t stayed equal to one matrix Θ, this would be a linear equation: along an eigenvector of Θ with eigenvalue λ_i the residual would decay as e^(−λ_i·t). Directions with large λ_i are fitted first; for common kernels they are smooth, low-frequency functions (**spectral bias**). In general Θ_t moves with θ."
                        ],
                        example: ["f_lin(x; θ) = f(x; θ_0) + ∇_θ f(x; θ_0)·(θ − θ_0)", "Θ(x, z) = ∇_θ f(x; θ)·∇_θ f(z; θ)", "f = a·b·x at (a, b) = (2, 1): ∇_θ f = (b·x, a·x) = (x, 2·x), Θ(x, z) = 5·x·z", "gradient flow: dr/dt = −Θ_t·r", "constant Θ: r(t) = exp(−Θ·t)·r(0); λ_i = 10 and 0.1 at t = 1: factors 0.000045 and 0.905", "1% along λ_i = 0.1 takes t = ln 100 / 0.1 ≈ 46.05"],
                        note: "A gradient-descent step of size η changes the output of the linearised model at any input z by exactly −η·Σ_i Θ(z, x_i)·r_i, with its own residuals r_i. For the model itself this is only the first-order term in η."
                    },
                    ru: {
                        title: "От сети к ядру: касательное ядро",
                        text: [
                            "Возьмём любую модель f(x; θ), дифференцируемую по параметрам θ, и линеаризуем её в окрестности точки θ_0 (первая строка). Линеаризованная модель линейна по θ, а её отображение признаков — φ(x) = ∇_θ f(x; θ_0). Ядро этих признаков — **нейронное касательное ядро** (NTK), Θ (вторая строка).",
                            "Обучаем на L = ½·Σ_i (f(x_i) − y_i)² **градиентным потоком** (gradient flow) dθ/dt = −∇_θ L: это градиентный спуск в пределе нулевой скорости обучения. Тогда вектор **невязок** (residuals) r = f(X) − y подчиняется dr/dt = −Θ_t·r, где Θ_t — матрица Грама NTK на обучающих входах при текущем θ(t). Это точно для любой такой модели.",
                            "Будь Θ_t постоянной матрицей Θ, уравнение было бы линейным: вдоль собственного вектора Θ с собственным значением λ_i невязка убывала бы как e^(−λ_i·t). Направления с большими λ_i подгоняются первыми; у типичных ядер это гладкие низкочастотные функции (**спектральное смещение**, spectral bias). В общем случае Θ_t меняется с θ."
                        ],
                        example: ["f_lin(x; θ) = f(x; θ_0) + ∇_θ f(x; θ_0)·(θ − θ_0)", "Θ(x, z) = ∇_θ f(x; θ)·∇_θ f(z; θ)", "f = a·b·x при (a; b) = (2; 1): ∇_θ f = (b·x; a·x) = (x; 2·x), Θ(x, z) = 5·x·z", "градиентный поток: dr/dt = −Θ_t·r", "постоянная Θ: r(t) = exp(−Θ·t)·r(0); при λ_i = 10 и 0,1 и t = 1 множители 0,000045 и 0,905", "до 1% вдоль λ_i = 0,1 нужно t = ln 100 / 0,1 ≈ 46,05"],
                        note: "Шаг градиентного спуска размера η меняет выход линеаризованной модели в любой точке z ровно на −η·Σ_i Θ(z, x_i)·r_i, где r_i — её собственные невязки. Для самой модели это лишь слагаемое первого порядка по η."
                    }
                },
                {
                    type: "number", answer: 0.04, tolerance: 0.0005,
                    en: {
                        q: "The model f(x) = a·b·x with parameters (a, b) = (2, 1) takes one gradient-descent step, η = 0.1, on ½·(f(1) − 3)². The NTK predicts the change of f(2) to first order in η. By how much does the true change exceed that prediction?",
                        hint: "Prediction: −η·Θ(2, 1)·r with r = f(1) − 3. True change: update a and b, then compute f(2) again.",
                        why: "r = 2 − 3 = −1 and Θ(2, 1) = (1² + 2²)·2·1 = 10, so the prediction is −0.1·10·(−1) = 1. The exact step: a = 2 + 0.1·1 = 2.1, b = 1 + 0.1·2 = 1.2, so f(2) = 2.1·1.2·2 = 5.04, a true change of 1.04. The excess 0.04 is the second-order term Δa·Δb·2: the kernel itself has moved, from 5·x·z to (1.2² + 2.1²)·x·z = 5.85·x·z."
                    },
                    ru: {
                        q: "Модель f(x) = a·b·x с параметрами (a; b) = (2; 1) делает один шаг градиентного спуска, η = 0,1, по ½·(f(1) − 3)². NTK предсказывает изменение f(2) в первом порядке по η. На сколько истинное изменение больше этого предсказания?",
                        hint: "Предсказание: −η·Θ(2, 1)·r, где r = f(1) − 3. Истинное изменение: обнови a и b и заново вычисли f(2).",
                        why: "r = 2 − 3 = −1 и Θ(2, 1) = (1² + 2²)·2·1 = 10, так что предсказание равно −0,1·10·(−1) = 1. Точный шаг: a = 2 + 0,1·1 = 2,1, b = 1 + 0,1·2 = 1,2, поэтому f(2) = 2,1·1,2·2 = 5,04 — истинное изменение 1,04. Разница 0,04 — слагаемое второго порядка Δa·Δb·2: ядро сдвинулось с 5·x·z до (1,2² + 2,1²)·x·z = 5,85·x·z."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "A differentiable model f(x; θ) is trained by gradient flow, dθ/dt = −∇_θ L, on L = ½·Σ_i r_i² with r_i = f(x_i) − y_i. Put the steps of the derivation of the residual dynamics in order.",
                        items: ["Differentiate the loss: ∇_θ L = Σ_i r_i·∇_θ f(x_i)", "So gradient flow moves the parameters by dθ/dt = −Σ_i r_i·∇_θ f(x_i)", "Chain rule: df(x_j)/dt = ∇_θ f(x_j)·dθ/dt = −Σ_i ∇_θ f(x_j)·∇_θ f(x_i)·r_i", "These dot products are Θ(x_j, x_i), and y is fixed, so dr/dt = −Θ_t·r", "Only if Θ_t stays equal to a constant matrix Θ: r(t) = exp(−Θ·t)·r(0)"],
                        hint: "Start from what is given: the loss. Each later line substitutes the result of the line before.",
                        why: "Lines 1 to 4 use only the chain rule, so dr/dt = −Θ_t·r is exact for every differentiable model, of any width. The one extra assumption enters in the last line: a kernel that does not change. Without it Θ_t depends on θ(t), and the equation for r is not closed."
                    },
                    ru: {
                        q: "Дифференцируемую модель f(x; θ) обучают градиентным потоком dθ/dt = −∇_θ L на L = ½·Σ_i r_i², где r_i = f(x_i) − y_i. Расставь шаги вывода уравнения для невязок по порядку.",
                        items: ["Дифференцируем функцию потерь: ∇_θ L = Σ_i r_i·∇_θ f(x_i)", "Значит, градиентный поток меняет параметры так: dθ/dt = −Σ_i r_i·∇_θ f(x_i)", "Цепное правило: df(x_j)/dt = ∇_θ f(x_j)·dθ/dt = −Σ_i ∇_θ f(x_j)·∇_θ f(x_i)·r_i", "Эти скалярные произведения равны Θ(x_j, x_i), а y постоянен: dr/dt = −Θ_t·r", "Только если Θ_t всё время равна постоянной матрице Θ: r(t) = exp(−Θ·t)·r(0)"],
                        hint: "Начни с того, что дано, — с функции потерь. Каждая следующая строка подставляет результат предыдущей.",
                        why: "Строки 1–4 используют только цепное правило, поэтому dr/dt = −Θ_t·r верно точно для любой дифференцируемой модели любой ширины. Единственное дополнительное предположение появляется в последней строке: ядро не меняется. Без него Θ_t зависит от θ(t), и уравнение для r не замкнуто."
                    }
                },
                {
                    type: "number", answer: 0.209, tolerance: 0.0005, card: "t5b",
                    en: {
                        q: "Gradient flow on ½·‖r‖² with a constant NTK matrix Θ gives dr/dt = −Θ·r for the residuals r = f(X) − y. Two training points: Θ_11 = Θ_22 = 1, Θ_12 = Θ_21 = 0.5, and r(0) = (1, 0). What is r_1 at t = 2? Three decimal places.",
                        hint: "Work in the eigenbasis of Θ: each eigen-component of r(0) decays as e^(−λ_i·t) with its own eigenvalue λ_i.",
                        why: "Eigenvalues: 1.5 for (1, 1) and 0.5 for (1, −1), and r(0) = ½·(1, 1) + ½·(1, −1). So r_1(t) = ½·e^(−1.5·t) + ½·e^(−0.5·t), and at t = 2: ½·(e^(−3) + e^(−1)) = ½·(0.0498 + 0.3679) = 0.209. Also r_2(2) = ½·(0.0498 − 0.3679) = −0.159: fitting point 1 moves the output at point 2, through Θ_12."
                    },
                    ru: {
                        q: "Градиентный поток на ½·‖r‖² при постоянной матрице NTK Θ даёт для невязок r = f(X) − y уравнение dr/dt = −Θ·r. Две точки: Θ_11 = Θ_22 = 1, Θ_12 = Θ_21 = 0,5, r(0) = (1; 0). Чему равно r_1 при t = 2? Три знака после запятой.",
                        hint: "Перейди в собственный базис Θ: каждая компонента r(0) в нём убывает как e^(−λ_i·t) со своим собственным значением λ_i.",
                        why: "Собственные значения: 1,5 для (1; 1) и 0,5 для (1; −1), а r(0) = ½·(1; 1) + ½·(1; −1). Поэтому r_1(t) = ½·e^(−1,5·t) + ½·e^(−0,5·t), и при t = 2: ½·(e^(−3) + e^(−1)) = ½·(0,0498 + 0,3679) = 0,209. При этом r_2(2) = ½·(0,0498 − 0,3679) = −0,159: подгонка точки 1 сдвигает выход в точке 2 через Θ_12."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Finite width, gradient flow on ½·‖r‖², r = f(X) − y, λ_min(Θ_0) = λ > 0. Find the flaw: (1) dr/dt = −Θ_t·r; (2) Θ_t is a Gram matrix, so ‖r‖ never grows; (3) so ‖r(t)‖ ≤ e^(−λ·t)·‖r(0)‖; (4) so the loss tends to 0.",
                        options: ["In (3): λ bounds the rate only at t = 0; later the smallest eigenvalue of Θ_t can fall below it", "In (1): the equation is exact only for infinite width; a finite network adds error terms", "In (2): Θ_t is a Gram matrix at t = 0 only; later it can have negative eigenvalues", "In the premise: Θ_0 cannot be positive definite when parameters outnumber training points"],
                        hint: "Differentiate ‖r‖² along the flow. Which matrix appears, and at which time?",
                        why: "d‖r‖²/dt = −2·r^T·Θ_t·r ≤ −2·λ_min(Θ_t)·‖r‖². So (1) and (2) hold at any width, but (3) needs λ_min(Θ_t) ≥ λ at all times. Example: f = a·b·x from (1, 1) with one example x_1 = 1, y_1 = −1: Θ_0 = 2, yet a = b shrinks to 0, Θ_t → 0, and r goes from 2 to 1, not to 0. Proofs for wide networks show that Θ_t stays close to Θ_0."
                    },
                    ru: {
                        q: "Конечная ширина, градиентный поток на ½·‖r‖², r = f(X) − y, λ_min(Θ_0) = λ > 0. Найди ошибку: (1) dr/dt = −Θ_t·r; (2) Θ_t — матрица Грама, поэтому ‖r‖ не растёт; (3) значит, ‖r(t)‖ ≤ e^(−λ·t)·‖r(0)‖; (4) и потери стремятся к 0.",
                        options: ["В (3): λ ограничивает скорость только при t = 0, позже наименьшее собственное значение Θ_t может упасть ниже", "В (1): уравнение точно лишь при бесконечной ширине, у конечной сети в нём есть поправки", "В (2): Θ_t — матрица Грама только при t = 0, позже у неё бывают отрицательные собственные значения", "В условии: Θ_0 не может быть положительно определённой, если параметров больше, чем обучающих точек"],
                        hint: "Продифференцируй ‖r‖² вдоль потока. Какая матрица появится и в какой момент времени?",
                        why: "d‖r‖²/dt = −2·r^T·Θ_t·r ≤ −2·λ_min(Θ_t)·‖r‖². Поэтому (1) и (2) верны при любой ширине, а для (3) нужно λ_min(Θ_t) ≥ λ при всех t. Пример: f = a·b·x из (1; 1) с одной парой x_1 = 1, y_1 = −1: Θ_0 = 2, но a = b убывает к 0, Θ_t → 0, и r меняется от 2 до 1, а не до 0. Для широких сетей доказывают, что Θ_t остаётся близкой к Θ_0."
                    }
                },
                {
                    type: "number", answer: 6, card: "t5c",
                    en: {
                        q: "The model f(x) = (1/√m)·Σ_j a_j·b_j·x has 2m parameters a_j, b_j, drawn independently from N(0, 1). Its tangent kernel is Θ(x, z) = ∇_θ f(x)·∇_θ f(z). To what number does Θ(1, 3) converge as the width m → ∞?",
                        hint: "Write ∂f/∂a_j and ∂f/∂b_j, form the dot product, and look at what kind of average over j appears.",
                        why: "∂f/∂a_j = b_j·x/√m and ∂f/∂b_j = a_j·x/√m, so Θ(x, z) = x·z·(1/m)·Σ_j (a_j² + b_j²). By the law of large numbers the average tends to E[a² + b²] = 2, so Θ(1, 3) → 2·1·3 = 6, with fluctuations of order 6/√m. The kernel becomes deterministic, while the output f(x) stays random: by the central limit theorem it tends to N(0, x²)."
                    },
                    ru: {
                        q: "Модель f(x) = (1/√m)·Σ_j a_j·b_j·x имеет 2m параметров a_j, b_j, взятых независимо из N(0, 1). Её касательное ядро — Θ(x, z) = ∇_θ f(x)·∇_θ f(z). К какому числу сходится Θ(1, 3) при ширине m → ∞?",
                        hint: "Выпиши ∂f/∂a_j и ∂f/∂b_j, составь скалярное произведение и посмотри, какое среднее по j в нём возникает.",
                        why: "∂f/∂a_j = b_j·x/√m и ∂f/∂b_j = a_j·x/√m, поэтому Θ(x, z) = x·z·(1/m)·Σ_j (a_j² + b_j²). По закону больших чисел среднее стремится к E[a² + b²] = 2, и Θ(1, 3) → 2·1·3 = 6 с флуктуациями порядка 6/√m. Ядро становится детерминированным, а выход f(x) остаётся случайным: по центральной предельной теореме он стремится к N(0, x²)."
                    }
                },
                {
                    type: "info", icon: "🔭", mono: true,
                    en: {
                        title: "The infinite-width limit, and what it leaves out",
                        text: [
                            "Let the width m of every hidden layer go to infinity in the **NTK parameterisation**: weights drawn from N(0, 1), and every sum over m units scaled by 1/√m. At initialisation the outputs on any finite set of inputs become jointly Gaussian, a **Gaussian process** (central limit theorem), and Θ_0 tends to a deterministic kernel.",
                            "The theorem (fully connected network; activation with bounded first and second derivatives; Θ_0 positive definite on the training set): in this limit, under gradient flow on the squared loss, Θ_t stays equal to Θ_0 throughout training. So the network equals its linearisation f_lin; the lines below follow from that.",
                            "The idea of the proof: a sum of m terms scaled by 1/√m can move by order 1 while each weight moves only a vanishing amount, too little to change ∇_θ f. This is the **lazy regime**, also called the kernel regime. Its price: the features never change, so it cannot describe representation learning or transfer."
                        ],
                        example: ["gradient flow: r(t) = exp(−Θ_0·t)·r(0)", "gradient descent, small enough η, same theorem: r = (I − η·Θ_0)^k·r(0) after k steps", "end of training, f_0 = the network at initialisation:", "f(x) = f_0(x) + Θ_0(x, X)·Θ_0(X, X)^(−1)·(y − f_0(X))", "this is f_0 plus kernel regression with λ → 0 on the targets y − f_0(X)"],
                        note: "In experiments, networks of practical width, trained with practical learning rates, usually leave this regime: Θ_t changes. Which regime a given setup is in, and a full theory of feature learning, are open questions."
                    },
                    ru: {
                        title: "Предел бесконечной ширины и что он упускает",
                        text: [
                            "Пусть в **NTK-параметризации** (веса из N(0, 1), суммы по m нейронам делятся на √m) ширина m скрытых слоёв растёт до бесконечности. При инициализации выходы на любом конечном наборе входов становятся совместно гауссовскими: это **гауссовский процесс** (центральная предельная теорема), а Θ_0 сходится к детерминированному ядру.",
                            "Теорема (полносвязная сеть; функция активации с ограниченными первой и второй производными; Θ_0 положительно определена на обучающей выборке): в этом пределе при градиентном потоке на квадратичных потерях Θ_t остаётся равной Θ_0 всё время обучения. Тогда сеть совпадает со своей линеаризацией f_lin; отсюда следуют строки ниже.",
                            "Идея доказательства: сумма m слагаемых с множителем 1/√m может измениться на величину порядка 1, когда каждый вес сдвигается исчезающе мало — слишком мало, чтобы изменить ∇_θ f. Это **ленивый режим** (lazy regime), он же ядерный. Его цена: признаки не меняются, и он не описывает ни обучение представлений, ни перенос обучения."
                        ],
                        example: ["градиентный поток: r(t) = exp(−Θ_0·t)·r(0)", "градиентный спуск с достаточно малым η, та же теорема: r = (I − η·Θ_0)^k·r(0) после k шагов", "конец обучения, f_0 — сеть при инициализации:", "f(x) = f_0(x) + Θ_0(x, X)·Θ_0(X, X)^(−1)·(y − f_0(X))", "это f_0 плюс ядерная регрессия при λ → 0 с целевыми значениями y − f_0(X)"],
                        note: "В экспериментах сети практической ширины при обычных скоростях обучения, как правило, выходят из этого режима: Θ_t меняется. В каком режиме находится конкретная постановка и как построить полную теорию обучения признаков — открытые вопросы."
                    }
                },
                {
                    type: "choice", card: "t5d",
                    en: {
                        q: "In the infinite-width NTK limit, a network trained by gradient flow on the squared loss keeps its tangent kernel at its initial value and predicts by kernel regression with it. Why can this limit not explain transfer learning?",
                        options: ["Its features never move from initialisation, so pretraining cannot improve them for a new task", "A fixed kernel cannot fit the pretraining set exactly, so nothing reliable is there to transfer", "Kernel regression is defined only on the training inputs and cannot predict on a new task", "The limit describes initialisation only: after the first step the kernel is a different one"],
                        hint: "What would have to change inside the network for pretraining to help later?",
                        why: "Transfer reuses hidden features that pretraining has shaped for the new task to build on. In this limit ∇_θ f, and with it Θ, stays as drawn at initialisation: a function is fitted on fixed features. The kernel does fit the training set (when Θ is positive definite there) and predicts at any input; it lacks learned features."
                    },
                    ru: {
                        q: "В NTK-пределе бесконечной ширины при градиентном потоке на квадратичных потерях касательное ядро сети не меняется, а предсказания даёт ядерная регрессия с ним. Почему этот предел не объясняет перенос обучения (transfer learning)?",
                        options: ["Признаки остаются такими же, как при инициализации: предобучение не улучшает их для новой задачи", "Фиксированное ядро не может точно подогнать выборку предобучения, так что переносить нечего", "Ядерная регрессия определена только на обучающих входах и не даёт предсказаний в новой задаче", "Предел описывает только инициализацию: уже после первого шага ядро становится другим"],
                        hint: "Что должно измениться внутри сети, чтобы предобучение помогло потом?",
                        why: "Перенос использует в новой задаче скрытые признаки, сформированные предобучением. В пределе ∇_θ f, а с ним и Θ, остаются как при инициализации: функция подгоняется на неизменных признаках. Обучающую выборку ядро подгоняет (если Θ на ней положительно определена) и предсказывает в любой точке; нет лишь выученных признаков."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge, on paper. Gradient flow on ½·(f(1) − y)² for f(x) = a·b·x, with the kernel Θ = Θ(1, 1) = a² + b². Find a conserved quantity, express Θ through p = a·b, and find Θ at the end of training from (a, b) = (2, 1) with y = 6.",
                        answer: [
                            "Gradient flow: da/dt = −r·b and db/dt = −r·a with r = a·b − y. So d(a²)/dt = d(b²)/dt = −2·r·a·b, and c = a² − b² is conserved. Then Θ² = (a² + b²)² = (a² − b²)² + 4·a²·b² = c² + 4·p², so Θ = √(c² + 4·p²): the kernel is tied to the output p = f(1).",
                            "From (2, 1): c = 3 and Θ = √(9 + 16) = 5. Since Θ ≥ 3 > 0, the equation dp/dt = −Θ·(p − y) drives p to y = 6, where Θ = √(9 + 144) = √153 ≈ 12.37. The kernel has grown about 2.5 times: nothing like a constant Θ, so this training is not in the kernel regime.",
                            "Start from (a, b) = (s, 0), so f = 0 at first, with y = 1: Θ goes from s² to √(s⁴ + 4), a factor √(1 + 4/s⁴): 2.24 for s = 1, but only 1.0002 for s = 10. A large parameter scale with an order-1 change of the output is the lazy regime. Width acts the same way: m terms scaled by 1/√m, and each weight needs to move only a little."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой, на бумаге. Градиентный поток на ½·(f(1) − y)² для f(x) = a·b·x, ядро Θ = Θ(1, 1) = a² + b². Найди сохраняющуюся величину, вырази Θ через p = a·b и найди Θ в конце обучения из (a; b) = (2; 1) при y = 6.",
                        answer: [
                            "Градиентный поток: da/dt = −r·b и db/dt = −r·a, где r = a·b − y. Поэтому d(a²)/dt = d(b²)/dt = −2·r·a·b, и c = a² − b² сохраняется. Тогда Θ² = (a² + b²)² = (a² − b²)² + 4·a²·b² = c² + 4·p², то есть Θ = √(c² + 4·p²): ядро жёстко связано с выходом p = f(1).",
                            "Из (2; 1): c = 3 и Θ = √(9 + 16) = 5. Так как Θ ≥ 3 > 0, уравнение dp/dt = −Θ·(p − y) приводит p к y = 6, где Θ = √(9 + 144) = √153 ≈ 12,37. Ядро выросло примерно в 2,5 раза: ничего похожего на постоянную Θ, так что это обучение идёт не в ядерном режиме.",
                            "Старт из (a; b) = (s; 0), где f = 0, при y = 1: Θ меняется от s² до √(s⁴ + 4), в √(1 + 4/s⁴) раз: в 2,24 раза при s = 1, но лишь в 1,0002 раза при s = 10. Большой масштаб параметров при изменении выхода порядка 1 — это ленивый режим. Ширина действует так же: m слагаемых с множителем 1/√m, и каждому весу хватает малого сдвига."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A kernel is an inner product of features, `k(x, z) = φ(x)·φ(z)`; equivalently, all its Gram matrices are symmetric and positive semi-definite. The features can be many, or infinitely many: (1 + x·z)² on R^100 stands for 5151 monomials and costs one dot product.",
                            "Representer theorem: a minimiser of a loss on f(x_1), …, f(x_n) plus λ·‖f‖², λ > 0, has the form Σ_i α_i·k(x_i, x). For the squared loss, `α = (K + λ·I)^(−1)·y`: in the fit K·α each eigen-component of y is multiplied by s/(s + λ), and λ → 0 with K invertible gives the interpolant of smallest norm.",
                            "The tangent kernel is `Θ(x, z) = ∇_θ f(x)·∇_θ f(z)`. Under gradient flow on the squared loss, `dr/dt = −Θ_t·r` exactly, at any width. Only if Θ_t is constant does r(t) = exp(−Θ·t)·r(0) follow: the mode with eigenvalue λ_i decays as e^(−λ_i·t), large eigenvalues first.",
                            "Infinite width, NTK parameterisation: a Gaussian process at initialisation, and a deterministic Θ_0 that stays constant under gradient flow on the squared loss: kernel regression with Θ_0. The features never move: no representation learning. Real networks usually leave this regime; a full theory of feature learning is open."
                        ]
                    },
                    ru: {
                        points: [
                            "Ядро — это скалярное произведение признаков, `k(x, z) = φ(x)·φ(z)`; эквивалентно, все его матрицы Грама симметричны и неотрицательно определены. Признаков может быть очень много и даже бесконечно много: (1 + x·z)² в R^100 заменяет 5151 моном и стоит одного скалярного произведения.",
                            "Теорема о представителе: точка минимума потерь на f(x_1), …, f(x_n) плюс λ·‖f‖², λ > 0, имеет вид Σ_i α_i·k(x_i, x). Для квадратичных потерь `α = (K + λ·I)^(−1)·y`: в предсказаниях K·α каждая собственная компонента y умножается на s/(s + λ), а λ → 0 при обратимой K даёт интерполянт с наименьшей нормой.",
                            "Касательное ядро — `Θ(x, z) = ∇_θ f(x)·∇_θ f(z)`. При градиентном потоке на квадратичных потерях `dr/dt = −Θ_t·r` точно, при любой ширине. Только при постоянной Θ_t отсюда следует r(t) = exp(−Θ·t)·r(0): мода с собственным значением λ_i убывает как e^(−λ_i·t), большие собственные значения — первыми.",
                            "Бесконечная ширина, NTK-параметризация: гауссовский процесс при инициализации, детерминированная Θ_0, постоянная при градиентном потоке на квадратичных потерях: ядерная регрессия с Θ_0. Признаки не меняются — обучения представлений нет. Реальные сети обычно покидают этот режим; полная теория обучения признаков — открытая задача."
                        ]
                    }
                }
            ]
        },

        /* ----- t6. Statistical decision theory: what “best estimator” means ----- */
        t6: {
            steps: [
                {
                    type: "info", icon: "⚖️", mono: true,
                    en: {
                        title: "Risk: an estimator is judged at every θ",
                        text: [
                            "An **estimator** δ turns the data X into a guess δ(X) of the parameter θ, and a **loss** L(θ, a) prices the guess a: here the squared error (a − θ)², unless stated. The **risk** R(θ, δ) is the loss averaged over the data at a fixed θ. It is a function of θ, not one number.",
                            "δ is **inadmissible** if another estimator has a risk that is no larger at every θ and smaller at some θ (it dominates δ); otherwise δ is **admissible**. Risk functions usually cross. Two summaries give one number: the **Bayes risk** averages R(θ, δ) over a prior π on θ, the **minimax** criterion takes the supremum over θ.",
                            "For the squared error, risk = bias² + variance. The classic trade: take an unbiased X̄ with variance v and shrink it towards 0 by a factor c (lines 2 to 4). The bias grows, the variance falls."
                        ],
                        example: ["R(θ, δ) = E_θ[(δ(X) − θ)²] = (E_θ[δ(X)] − θ)² + Var_θ(δ(X))", "δ_c = c·X̄ for a mean μ: R(μ, δ_c) = (1 − c)²·μ² + c²·v", "smallest at c* = μ²/(μ² + v), where the risk is c*·v", "μ = 1, v = 1: c* = 0.5 and risk 0.5, against 1 for X̄"],
                        note: "c* depends on the unknown μ, so c*·X̄ is not an estimator. The point is that a little bias can buy a lot of variance. The question from here on: when can the data themselves choose the shrinkage?"
                    },
                    ru: {
                        title: "Риск: оценку судят при каждом θ",
                        text: [
                            "**Оценка** (estimator) δ по данным X выдаёт значение δ(X) для параметра θ, а **функция потерь** L(θ, a) задаёт цену значения a: здесь это квадрат ошибки (a − θ)², если не сказано иное. **Риск** R(θ, δ) — потери, усреднённые по данным при фиксированном θ. Это функция от θ, а не одно число.",
                            "δ **недопустима**, если у другой оценки риск не больше при всех θ и меньше хотя бы при одном (та доминирует над δ); иначе δ **допустима** (admissible). Обычно функции риска пересекаются. К числу их сводят двояко: **байесовский риск** усредняет R(θ, δ) по априорному распределению π, **минимаксный** подход берёт супремум по θ.",
                            "Для квадрата ошибки риск = смещение² + дисперсия. Классический размен: возьмём несмещённую оценку X̄ с дисперсией v и сожмём её к нулю, умножив на c (строки 2–4). Смещение растёт, дисперсия падает."
                        ],
                        example: ["R(θ, δ) = E_θ[(δ(X) − θ)²] = (E_θ[δ(X)] − θ)² + Var_θ(δ(X))", "δ_c = c·X̄ для среднего μ: R(μ, δ_c) = (1 − c)²·μ² + c²·v", "минимум при c* = μ²/(μ² + v), и риск там равен c*·v", "μ = 1, v = 1: c* = 0,5 и риск 0,5 против 1 у X̄"],
                        note: "c* зависит от неизвестного μ, так что c*·X̄ — не оценка. Суть в другом: небольшое смещение может окупиться большим выигрышем в дисперсии. Дальше главный вопрос: когда степень сжатия можно выбрать по самим данным?"
                    }
                },
                {
                    type: "number", answer: 2, tolerance: 0.005, card: "t6a",
                    en: {
                        q: "X̄ is an unbiased estimator of a mean μ, with variance 1. The shrunk estimator 0.6·X̄ has a smaller risk (expected squared error) than X̄ exactly when |μ| < m. What is m?",
                        hint: "Risk = bias² + variance. Write the risk of 0.6·X̄ as a function of μ and compare it with the risk of X̄.",
                        why: "The bias of 0.6·X̄ is −0.4·μ and its variance is 0.6²·1 = 0.36. So its risk is 0.16·μ² + 0.36, against 1 for X̄: smaller exactly when μ² < 0.64/0.16 = 4, that is, |μ| < 2. The risk functions cross, so neither estimator dominates the other. In general c·X̄ wins exactly when μ² < v·(1 + c)/(1 − c)."
                    },
                    ru: {
                        q: "X̄ — несмещённая оценка среднего μ с дисперсией 1. У сжатой оценки 0,6·X̄ риск (средний квадрат ошибки) меньше, чем у X̄, тогда и только тогда, когда |μ| < m. Чему равно m?",
                        hint: "Риск = смещение² + дисперсия. Запиши риск оценки 0,6·X̄ как функцию от μ и сравни его с риском X̄.",
                        why: "Смещение 0,6·X̄ равно −0,4·μ, дисперсия — 0,6²·1 = 0,36. Значит, её риск равен 0,16·μ² + 0,36 против 1 у X̄: он меньше тогда и только тогда, когда μ² < 0,64/0,16 = 4, то есть |μ| < 2. Функции риска пересекаются, и ни одна из оценок не доминирует над другой. В общем случае c·X̄ выигрывает ровно при μ² < v·(1 + c)/(1 − c)."
                    }
                },
                {
                    type: "info", icon: "📐", mono: true,
                    en: {
                        title: "Fisher information and the Cramér–Rao bound",
                        text: [
                            "How precise can an unbiased estimator be? For a model f(x; θ) with a scalar θ, the **score** is s(x; θ) = ∂ ln f(x; θ)/∂θ. Under regularity conditions (the support does not depend on θ, and one may differentiate under the integral) E_θ[s] = 0, and the variance of the score is the **Fisher information** I(θ).",
                            "**Cramér–Rao bound**: under these conditions every unbiased estimator of θ from n independent observations drawn from this model has variance at least 1/(n·I(θ)). The proof in one line: an unbiased δ has covariance 1 with the total score, and the Cauchy–Schwarz inequality gives 1 ≤ Var(δ)·n·I(θ).",
                            "For a finite n the bound need not be attained. But under regularity conditions the maximum likelihood estimator θ_ML attains it in the limit: √n·(θ_ML − θ) converges in distribution to N(0, 1/I(θ))."
                        ],
                        example: ["I(θ) = E_θ[s²] = −E_θ[∂² ln f(X; θ)/∂θ²]", "unbiased δ, n independent observations: Var_θ(δ) ≥ 1/(n·I(θ))", "Bernoulli(p): s = (x − p)/(p·(1 − p)), I(p) = 1/(p·(1 − p))", "p = 0.2, n = 100: bound 0.16/100 = 0.0016, attained by the sample mean", "N(μ, σ²) with a known σ: I(μ) = 1/σ²"],
                        note: "For a vector θ, F = E_θ[s·s^T] is the Fisher matrix, and KL(p_θ ‖ p_(θ+Δ)) ≈ ½·Δ^T·F·Δ. The **natural gradient** step θ ← θ − η·F^(−1)·∇L is steepest descent in this KL geometry, so to first order it does not depend on the parameterisation. Adaptive optimisers are at best a loose diagonal analogue of it."
                    },
                    ru: {
                        title: "Информация Фишера и неравенство Рао — Крамера",
                        text: [
                            "Насколько точной может быть несмещённая оценка? Для модели f(x; θ) со скалярным θ **вклад** (score) — это s(x; θ) = ∂ ln f(x; θ)/∂θ. При условиях регулярности (носитель не зависит от θ, под интегралом можно дифференцировать) E_θ[s] = 0, а дисперсия вклада — это **информация Фишера** I(θ).",
                            "**Неравенство Рао — Крамера** (Cramér–Rao bound): при этих условиях дисперсия любой несмещённой оценки θ по n независимым наблюдениям из этой модели не меньше 1/(n·I(θ)). Доказательство в одну строку: ковариация несмещённой δ с суммарным вкладом равна 1, и неравенство Коши — Буняковского даёт 1 ≤ Var(δ)·n·I(θ).",
                            "При конечном n граница может и не достигаться. Но при условиях регулярности оценка максимального правдоподобия θ_ML достигает её в пределе: √n·(θ_ML − θ) сходится по распределению к N(0, 1/I(θ))."
                        ],
                        example: ["I(θ) = E_θ[s²] = −E_θ[∂² ln f(X; θ)/∂θ²]", "несмещённая δ, n независимых наблюдений: Var_θ(δ) ≥ 1/(n·I(θ))", "Бернулли(p): s = (x − p)/(p·(1 − p)), I(p) = 1/(p·(1 − p))", "p = 0,2, n = 100: граница 0,16/100 = 0,0016, достигается на выборочном среднем", "N(μ, σ²) с известным σ: I(μ) = 1/σ²"],
                        note: "Для векторного θ F = E_θ[s·s^T] — матрица Фишера, и KL(p_θ ‖ p_(θ+Δ)) ≈ ½·Δ^T·F·Δ. Шаг **натурального градиента** (natural gradient) θ ← θ − η·F^(−1)·∇L — наискорейший спуск в этой KL-геометрии, поэтому в первом порядке не зависит от параметризации. Адаптивные оптимизаторы — в лучшем случае его грубый диагональный аналог."
                    }
                },
                {
                    type: "number", answer: 0.08, tolerance: 0.0005, card: "t6b",
                    en: {
                        q: "X_1 … X_n are independent N(0, θ) with an unknown variance θ: ln f(x; θ) = −½·ln(2πθ) − x²/(2θ). With I(θ) = E[(∂ ln f/∂θ)²], compute the Cramér–Rao bound 1/(n·I(θ)) for unbiased estimators of θ at θ = 2, n = 100.",
                        hint: "Differentiate ln f in θ, not in x: the score is linear in x². For X ~ N(0, θ): E[X⁴] = 3θ².",
                        why: "Score: ∂ ln f/∂θ = −1/(2θ) + x²/(2θ²) = (x² − θ)/(2θ²). Since Var(X²) = 3θ² − θ² = 2θ², I(θ) = 2θ²/(4θ⁴) = 1/(2θ²) = 1/8. The bound: 2θ²/n = 8/100 = 0.08. The mean of the X_i² is unbiased with exactly this variance, so here the bound is attained. Taking I = 1/θ, the information about a mean, would give 0.02."
                    },
                    ru: {
                        q: "X_1 … X_n независимы, X_i ~ N(0, θ) с неизвестной дисперсией θ: ln f(x; θ) = −½·ln(2πθ) − x²/(2θ). Зная, что I(θ) = E[(∂ ln f/∂θ)²], найди границу Рао — Крамера 1/(n·I(θ)) для несмещённых оценок θ при θ = 2, n = 100.",
                        hint: "Дифференцируй ln f по θ, а не по x: вклад линеен по x². Для X ~ N(0, θ): E[X⁴] = 3θ².",
                        why: "Вклад: ∂ ln f/∂θ = −1/(2θ) + x²/(2θ²) = (x² − θ)/(2θ²). Так как Var(X²) = 3θ² − θ² = 2θ², получаем I(θ) = 2θ²/(4θ⁴) = 1/(2θ²) = 1/8. Граница: 2θ²/n = 8/100 = 0,08. Среднее величин X_i² — несмещённая оценка ровно с такой дисперсией, так что здесь граница достигается. С I = 1/θ (это информация о среднем) вышло бы 0,02."
                    }
                },
                {
                    type: "number", answer: 0.04, tolerance: 0.0005,
                    en: {
                        q: "Bernoulli model: p = σ(z), so dp/dz = p·(1 − p); loss L = −ln p. At p = 0.2 it takes one natural-gradient step z ← z − η·(∂L/∂z)/F(z), with F(z) the Fisher information in z and η = 0.05. To first order, what is Δp ≈ (dp/dz)·Δz?",
                        hint: "The score in z is the score in p times dp/dz. So F(z) = I(p)·(dp/dz)² with I(p) = 1/(p·(1 − p)); or compute E[(x − p)²] directly.",
                        why: "∂L/∂z = −(1 − p) = −0.8 and F(z) = I(p)·(dp/dz)² = p·(1 − p) = 0.16, so Δz = 0.05·0.8/0.16 = 0.25 and Δp ≈ 0.16·0.25 = 0.04. In the parameter p itself: ∂L/∂p = −5, F(p) = 6.25, Δp = 0.05·5/6.25 = 0.04, the same. Plain gradient steps disagree: 0.25 in p, about 0.0064 through z."
                    },
                    ru: {
                        q: "Модель Бернулли: p = σ(z), dp/dz = p·(1 − p); потери L = −ln p. При p = 0,2 делают шаг натурального градиента z ← z − η·(∂L/∂z)/F(z), где F(z) — информация Фишера по z, а η = 0,05. Чему в первом порядке равно Δp ≈ (dp/dz)·Δz?",
                        hint: "Вклад по z — это вклад по p, умноженный на dp/dz. Поэтому F(z) = I(p)·(dp/dz)², где I(p) = 1/(p·(1 − p)); или найди E[(x − p)²] напрямую.",
                        why: "∂L/∂z = −(1 − p) = −0,8 и F(z) = I(p)·(dp/dz)² = p·(1 − p) = 0,16, поэтому Δz = 0,05·0,8/0,16 = 0,25 и Δp ≈ 0,16·0,25 = 0,04. В самом параметре p: ∂L/∂p = −5, F(p) = 6,25, Δp = 0,05·5/6,25 = 0,04 — то же самое. А шаги обычного градиента расходятся: 0,25 по p и около 0,0064 через z."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "X ~ N(θ, I_d), loss ‖δ − θ‖². Which step does not follow? (1) X is unbiased, with risk d. (2) By the Cramér–Rao bound no unbiased estimator has a risk below d at any θ. (3) So no estimator has. (4) So X is admissible for every d.",
                        options: ["Step 3: the bound restricts unbiased estimators only; a biased one can have a smaller risk", "Step 2: the bound is asymptotic, so it says nothing about a single observation X", "Step 1: X is biased for d > 1, because E‖X‖² = ‖θ‖² + d is larger than ‖θ‖²", "Step 4: admissibility concerns the worst case over θ, which step 3 does not control"],
                        hint: "For d = 1, compare the risks of X and of 0.5·X at θ = 0.",
                        why: "Steps 1 and 2 are true: for an unbiased δ the matrix Cov(δ) − I_d is positive semi-definite, so the risk tr Cov(δ) is at least d. But 0.5·X has the risk 0.25·‖θ‖² + 0.25·d, below d whenever ‖θ‖² < 3d. Step 4 would follow from step 3. Its conclusion is true for d = 1 and 2 (by other proofs) and false for d ≥ 3: the next screen."
                    },
                    ru: {
                        q: "X ~ N(θ, I_d), потери ‖δ − θ‖². Какой шаг не обоснован? (1) X несмещённая, с риском d. (2) По неравенству Рао — Крамера риск несмещённой оценки нигде не меньше d. (3) Значит, и любой оценки. (4) Значит, X допустима при любом d.",
                        options: ["Шаг 3: неравенство ограничивает только несмещённые оценки, а у смещённой риск может быть меньше", "Шаг 2: неравенство асимптотическое и об одном наблюдении X ничего не говорит", "Шаг 1: при d > 1 оценка X смещена, ведь E‖X‖² = ‖θ‖² + d больше, чем ‖θ‖²", "Шаг 4: допустимость — свойство худшего случая по θ, а его шаг 3 не контролирует"],
                        hint: "При d = 1 сравни риски X и 0,5·X в точке θ = 0.",
                        why: "Шаги 1 и 2 верны: для несмещённой δ матрица Cov(δ) − I_d неотрицательно определена, поэтому риск tr Cov(δ) не меньше d. Но у 0,5·X риск равен 0,25·‖θ‖² + 0,25·d, и он меньше d при ‖θ‖² < 3d. Шаг 4 следовал бы из шага 3. Его вывод верен при d = 1 и 2 (доказывается иначе) и неверен при d ≥ 3: об этом следующий экран."
                    }
                },
                {
                    type: "info", icon: "🎯", mono: true,
                    en: {
                        title: "James–Stein: for d ≥ 3 the obvious estimator is inadmissible",
                        text: [
                            "Estimate a vector: X ~ N(θ, I_d), one observation, loss ‖δ − θ‖², the squared errors summed over the coordinates. X is the maximum likelihood estimator: unbiased, minimax, with risk d at every θ. For d = 1 and d = 2 it is admissible.",
                            "For d ≥ 3 it is not. The **James–Stein estimator** shrinks X towards the origin by a factor computed from ‖X‖², and its risk is below d at EVERY θ. The coordinates may be quantities that have nothing to do with each other: estimating them jointly still lowers the total risk.",
                            "The gain is largest at θ = 0 and vanishes as ‖θ‖ → ∞. It is a statement about the sum: the risk of a single coordinate can exceed 1. This estimator is not admissible either: the positive-part version, which replaces a negative factor by 0, dominates it."
                        ],
                        example: ["δ_JS(X) = (1 − (d − 2)/‖X‖²)·X, d ≥ 3", "R(θ, δ_JS) = d − (d − 2)²·E_θ[1/‖X‖²] < d = R(θ, X)", "θ = 0: E[1/‖X‖²] = 1/(d − 2), so the risk is d − (d − 2) = 2 for every d ≥ 3", "d = 5, ‖X‖² = 6: the factor is 1 − 3/6 = 0.5"],
                        note: "The proof rests on Stein's identity: for X ~ N(θ, I_d) and a weakly differentiable g with E|∂g_i/∂x_i| finite, E[(X_i − θ_i)·g_i(X)] = E[∂g_i/∂x_i(X)]. It is integration by parts against the Gaussian density."
                    },
                    ru: {
                        title: "Джеймс — Стейн: при d ≥ 3 очевидная оценка недопустима",
                        text: [
                            "Оценим вектор: X ~ N(θ, I_d), одно наблюдение, потери ‖δ − θ‖² — сумма квадратов ошибок по координатам. X — оценка максимального правдоподобия: несмещённая, минимаксная, с риском d при любом θ. При d = 1 и d = 2 она допустима.",
                            "При d ≥ 3 — нет. **Оценка Джеймса — Стейна** сжимает X к началу координат с множителем, вычисленным по ‖X‖², и её риск меньше d при КАЖДОМ θ. Координаты могут быть величинами, никак не связанными между собой: совместное оценивание всё равно снижает суммарный риск.",
                            "Выигрыш наибольший при θ = 0 и исчезает при ‖θ‖ → ∞. Это утверждение о сумме: риск отдельной координаты может превышать 1. Эта оценка тоже недопустима: над ней доминирует вариант с положительной частью (positive-part), где отрицательный множитель заменяют нулём."
                        ],
                        example: ["δ_JS(X) = (1 − (d − 2)/‖X‖²)·X, d ≥ 3", "R(θ, δ_JS) = d − (d − 2)²·E_θ[1/‖X‖²] < d = R(θ, X)", "θ = 0: E[1/‖X‖²] = 1/(d − 2), и риск равен d − (d − 2) = 2 при любом d ≥ 3", "d = 5, ‖X‖² = 6: множитель равен 1 − 3/6 = 0,5"],
                        note: "Доказательство опирается на тождество Стейна: для X ~ N(θ, I_d) и слабо дифференцируемой g с конечным E|∂g_i/∂x_i| верно E[(X_i − θ_i)·g_i(X)] = E[∂g_i/∂x_i(X)]. Это интегрирование по частям с гауссовой плотностью."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "X ~ N(θ, I_d), d ≥ 3, and δ(X) = X + g(X) with g(x) = −(d − 2)·x/‖x‖². Order the proof that the risk E‖δ(X) − θ‖² is below d at every θ. Stein's identity: E[(X_i − θ_i)·g_i(X)] = E[∂g_i/∂x_i(X)].",
                        items: ["Expand the square: risk = d + 2·E[(X − θ)·g(X)] + E‖g(X)‖²", "By Stein's identity, coordinate by coordinate, the second term equals 2·E[div g(X)]", "Here div g(x) = −(d − 2)²/‖x‖², so the second term is −2·(d − 2)²·E[1/‖X‖²]", "The third term is (d − 2)²·E[1/‖X‖²]; in total, risk = d − (d − 2)²·E[1/‖X‖²]", "For d ≥ 3 this expectation is finite and positive, so the risk is below d"],
                        hint: "Start with the line that is pure algebra. Each later line transforms the result of the line before it.",
                        why: "The cross term decides: Stein's identity turns it into E[div g], and div(x/‖x‖²) = (d − 2)/‖x‖² is positive only for d ≥ 3. Shrinking adds (d − 2)²/‖x‖² to the squared error but removes twice as much through its correlation with the noise X − θ. For d ≤ 2 the proof fails: E[1/‖X‖²] is infinite, and for d = 2 δ is X itself."
                    },
                    ru: {
                        q: "X ~ N(θ, I_d), d ≥ 3, и δ(X) = X + g(X), где g(x) = −(d − 2)·x/‖x‖². Расставь шаги доказательства того, что риск E‖δ(X) − θ‖² меньше d при любом θ. Тождество Стейна: E[(X_i − θ_i)·g_i(X)] = E[∂g_i/∂x_i(X)].",
                        items: ["Раскрываем квадрат: риск = d + 2·E[(X − θ)·g(X)] + E‖g(X)‖²", "По тождеству Стейна, применённому покоординатно, второе слагаемое равно 2·E[div g(X)]", "Здесь div g(x) = −(d − 2)²/‖x‖², так что второе слагаемое равно −2·(d − 2)²·E[1/‖X‖²]", "Третье слагаемое равно (d − 2)²·E[1/‖X‖²]; в сумме риск = d − (d − 2)²·E[1/‖X‖²]", "При d ≥ 3 это математическое ожидание конечно и положительно, поэтому риск меньше d"],
                        hint: "Начни со строки, в которой только алгебра. Каждая следующая строка преобразует результат предыдущей.",
                        why: "Решает перекрёстное слагаемое: тождество Стейна превращает его в E[div g], а div(x/‖x‖²) = (d − 2)/‖x‖² положительна лишь при d ≥ 3. Сжатие добавляет к квадрату ошибки (d − 2)²/‖x‖², но вдвое больше отнимает за счёт корреляции с шумом X − θ. При d ≤ 2 доказательство не проходит: E[1/‖X‖²] бесконечно, а при d = 2 δ совпадает с X."
                    }
                },
                {
                    type: "number", answer: 6, tolerance: 0.005, card: "t6c",
                    en: {
                        q: "X ~ N(θ, I_d), d = 10. The James–Stein estimator (1 − (d − 2)/‖X‖²)·X has the risk d − (d − 2)²·E[1/‖X‖²], against d for X. E‖X‖² = d + ‖θ‖². Which upper bound on its risk does Jensen's inequality for 1/‖X‖² give at ‖θ‖² = 6?",
                        hint: "Jensen: E[φ(Y)] ≥ φ(E[Y]) for a convex φ. In which direction does that bound E[1/‖X‖²], and hence the risk?",
                        why: "E‖X‖² = d + ‖θ‖² = 16. Since 1/y is convex, E[1/‖X‖²] ≥ 1/E‖X‖² = 1/16, so the risk is at most 10 − 64/16 = 6, against 10 for X. The exact risk here is about 5.14. The same argument gives d − (d − 2)²/(d + ‖θ‖²) < d at every θ: a loose bound (3.6 at θ = 0, where the exact risk is 2), but it shows a gain everywhere."
                    },
                    ru: {
                        q: "X ~ N(θ, I_d), d = 10. У оценки Джеймса — Стейна (1 − (d − 2)/‖X‖²)·X риск равен d − (d − 2)²·E[1/‖X‖²], а у X он равен d. E‖X‖² = d + ‖θ‖². Какую верхнюю границу её риска даёт неравенство Йенсена для 1/‖X‖² при ‖θ‖² = 6?",
                        hint: "Неравенство Йенсена: E[φ(Y)] ≥ φ(E[Y]) для выпуклой φ. В какую сторону оно оценивает E[1/‖X‖²], а значит, и риск?",
                        why: "E‖X‖² = d + ‖θ‖² = 16. Функция 1/y выпукла, поэтому E[1/‖X‖²] ≥ 1/E‖X‖² = 1/16, и риск не больше 10 − 64/16 = 6 против 10 у X. Точный риск здесь около 5,14. То же рассуждение даёт d − (d − 2)²/(d + ‖θ‖²) < d при любом θ: граница грубая (3,6 при θ = 0, где точный риск равен 2), но выигрыш она показывает всюду."
                    }
                },
                {
                    type: "info", icon: "🎲", mono: true,
                    en: {
                        title: "Bayes estimators, and how they lead to minimax ones",
                        text: [
                            "Put a prior π on θ. The **Bayes estimator** minimises the Bayes risk, and it can be found one data set at a time: for the observed x, take the action a that minimises the posterior expected loss E[L(θ, a) | x]. For the squared error this is the posterior mean; for the absolute error, a posterior median.",
                            "A conjugate example: a Beta(a, b) prior on a Bernoulli parameter p and k successes in n trials give the posterior Beta(a + k, b + n − k). Its mean lies between the prior mean a/(a + b) and k/n, with the weights a + b and n: the prior counts as a + b earlier observations.",
                            "Bayes estimators lead to minimax ones. If a Bayes estimator δ has the same risk c at every θ, it is minimax: for any estimator δ_2, sup_θ R(θ, δ_2) ≥ the average of R(θ, δ_2) over π ≥ the average of R(θ, δ) over π = c."
                        ],
                        example: ["posterior mean of p: (a + k)/(a + b + n)", "Beta(2, 2), 7 successes in 10 trials: Beta(9, 5), mean 9/14 = 0.643 (k/n = 0.7)", "δ is Bayes for π and R(θ, δ) = c for all θ, so δ is minimax", "k/n: risk p·(1 − p)/n, worst case 1/(4n) at p = 0.5"],
                        note: "A Bayes estimator that is unique for its prior is admissible: an estimator that dominated it would have a Bayes risk no larger, so it would be Bayes as well. The X of the previous screens is only a limit of Bayes estimators (normal priors with variance τ² → ∞), and for d ≥ 3 that is not enough."
                    },
                    ru: {
                        title: "Байесовские оценки и путь от них к минимаксным",
                        text: [
                            "Зададим на θ априорное распределение π. **Байесовская оценка** минимизирует байесовский риск, и искать её можно отдельно для каждой выборки: при наблюдённом x берём действие a, минимизирующее апостериорные ожидаемые потери E[L(θ, a) | x]. Для квадрата ошибки это апостериорное среднее, для модуля ошибки — апостериорная медиана.",
                            "Сопряжённый пример: априорное Beta(a, b) для параметра Бернулли p и k успехов в n испытаниях дают апостериорное Beta(a + k, b + n − k). Его среднее лежит между априорным средним a/(a + b) и k/n с весами a + b и n: априорное распределение работает как a + b прежних наблюдений.",
                            "От байесовских оценок недалеко до минимаксных. Если у байесовской оценки δ риск равен c при всех θ, она минимаксна: для любой оценки δ_2 верно sup_θ R(θ, δ_2) ≥ среднее R(θ, δ_2) по π ≥ среднее R(θ, δ) по π = c."
                        ],
                        example: ["апостериорное среднее p: (a + k)/(a + b + n)", "Beta(2, 2), 7 успехов в 10 испытаниях: Beta(9, 5), среднее 9/14 = 0,643 (k/n = 0,7)", "δ байесовская для π и R(θ, δ) = c при всех θ, значит, δ минимаксна", "k/n: риск p·(1 − p)/n, худший случай 1/(4n) при p = 0,5"],
                        note: "Байесовская оценка, единственная для своего априорного распределения, допустима: доминирующая над ней оценка имела бы не больший байесовский риск, то есть тоже была бы байесовской. А X с предыдущих экранов — лишь предел байесовских оценок (нормальные априорные распределения с дисперсией τ² → ∞), и при d ≥ 3 этого не хватает."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "A posterior puts probability 0.4 on θ = 0, 0.35 on θ = 1 and 0.25 on θ = 10. Match each loss L(θ, a) to its Bayes estimate: the a that minimises the posterior expected loss.",
                        pairs: [["(θ − a)²", "2.85"], ["|θ − a|", "1"], ["0 if a = θ, 1 otherwise", "0"], ["9·(θ − a) if a < θ, a − θ otherwise", "10"]],
                        why: "Squared error: the mean, 0.35 + 2.5 = 2.85. Absolute error: the median, 1, as P(θ ≤ 0) = 0.4 < 0.5 ≤ P(θ ≤ 1) = 0.75. The 0–1 loss: the mode, 0. An underestimate that costs 9 times more: the quantile of level 9/(9 + 1) = 0.9, which is 10, as P(θ ≤ 1) < 0.9. One posterior, four best answers: the loss is part of the problem."
                    },
                    ru: {
                        q: "Апостериорные вероятности: 0,4 для θ = 0; 0,35 для θ = 1; 0,25 для θ = 10. Соедини каждую функцию потерь L(θ, a) с её байесовской оценкой — значением a, минимизирующим апостериорные ожидаемые потери.",
                        pairs: [["(θ − a)²", "2,85"], ["|θ − a|", "1"], ["0 при a = θ, иначе 1", "0"], ["9·(θ − a) при a < θ, иначе a − θ", "10"]],
                        why: "Квадрат ошибки: среднее, 0,35 + 2,5 = 2,85. Модуль ошибки: медиана, 1, ведь P(θ ≤ 0) = 0,4 < 0,5 ≤ P(θ ≤ 1) = 0,75. Потери 0–1: мода, 0. Недооценка обходится в 9 раз дороже: квантиль уровня 9/(9 + 1) = 0,9, а это 10, ведь P(θ ≤ 1) < 0,9. Распределение одно, а лучших ответов четыре: функция потерь — часть постановки задачи."
                    }
                },
                {
                    type: "number", answer: 5, tolerance: 0.005, card: "t6d",
                    en: {
                        q: "k ~ Binomial(n, p) with n = 100, squared error. Under a Beta(a, a) prior the posterior mean is δ_a = (k + a)/(n + 2a). For which a > 0 is the risk of δ_a the same for every p (which makes δ_a minimax)?",
                        hint: "Write the risk as bias² + variance and collect the terms with p·(1 − p), using (1 − 2p)² = 1 − 4p·(1 − p).",
                        why: "Bias: a·(1 − 2p)/(n + 2a); variance: n·p·(1 − p)/(n + 2a)². Risk: (a² + (n − 4a²)·p·(1 − p))/(n + 2a)², free of p exactly when a = √n/2 = 5. Then δ = (k + 5)/110 has the risk 25/110² = 0.002066 at every p, below the worst case 1/(4n) = 0.0025 of k/n: k/n is not minimax. Yet k/n is the better one for p outside (0.29, 0.71)."
                    },
                    ru: {
                        q: "k ~ Binomial(n, p), n = 100, квадратичная функция потерь. При априорном Beta(a, a) апостериорное среднее равно δ_a = (k + a)/(n + 2a). При каком a > 0 риск δ_a один и тот же при всех p (и тогда δ_a минимаксна)?",
                        hint: "Запиши риск как смещение² + дисперсия и собери слагаемые с p·(1 − p), пользуясь тем, что (1 − 2p)² = 1 − 4p·(1 − p).",
                        why: "Смещение: a·(1 − 2p)/(n + 2a); дисперсия: n·p·(1 − p)/(n + 2a)². Риск: (a² + (n − 4a²)·p·(1 − p))/(n + 2a)², и он не зависит от p только при a = √n/2 = 5. Тогда у δ = (k + 5)/110 риск 25/110² = 0,002066 при любом p — меньше худшего случая 1/(4n) = 0,0025 у k/n: k/n не минимаксна. Зато при p вне (0,29; 0,71) оценка k/n лучше."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge, on paper. Where does d − 2 come from? Let θ ~ N(0, τ²·I_d) and X | θ ~ N(θ, I_d), d ≥ 3. Find the Bayes estimator for squared error. Then, with τ² unknown, find an unbiased estimate of its shrink factor from X alone.",
                        answer: [
                            "Each θ_i has the posterior N((1 − B)·X_i, 1 − B) with B = 1/(1 + τ²). So the Bayes estimator is (1 − B)·X, and its Bayes risk is d·(1 − B). How much it shrinks depends on the prior, and τ² is unknown.",
                            "But the data reveal B. Marginally X ~ N(0, (1 + τ²)·I_d), so B·‖X‖² has the χ² distribution with d degrees of freedom, and the mean of 1/χ² is 1/(d − 2) for d ≥ 3. Hence E[(d − 2)/‖X‖²] = B: the James–Stein estimator is the Bayes estimator with B replaced by an unbiased estimate. This is called **empirical Bayes**.",
                            "Estimating B costs little: averaged over this prior, the James–Stein risk is d − (d − 2)·B, only 2·B above the optimum d·(1 − B). For d = 10, τ² = 1: 10 for X, 6 for James–Stein, 5 for the Bayes estimator. And James–Stein beats X at every θ with no prior assumed: the d coordinates themselves supply the variance of the prior."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой, на бумаге. Откуда берётся d − 2? Пусть θ ~ N(0, τ²·I_d) и X | θ ~ N(θ, I_d), d ≥ 3. Найди байесовскую оценку для квадрата ошибки. Затем при неизвестном τ² найди по X несмещённую оценку её множителя сжатия.",
                        answer: [
                            "У каждой θ_i апостериорное распределение N((1 − B)·X_i, 1 − B), где B = 1/(1 + τ²). Значит, байесовская оценка — это (1 − B)·X, а её байесовский риск равен d·(1 − B). Степень сжатия зависит от априорного распределения, а τ² неизвестно.",
                            "Но B видно по данным. Маргинально X ~ N(0, (1 + τ²)·I_d), поэтому B·‖X‖² имеет распределение χ² с d степенями свободы, а среднее 1/χ² равно 1/(d − 2) при d ≥ 3. Отсюда E[(d − 2)/‖X‖²] = B: оценка Джеймса — Стейна — это байесовская оценка с несмещённой оценкой вместо B. Это **эмпирический байесовский подход** (empirical Bayes).",
                            "Плата за оценивание B мала: в среднем по этому априорному распределению риск такой оценки равен d − (d − 2)·B, всего на 2·B выше оптимума d·(1 − B). При d = 10, τ² = 1: 10 у X, 6 у неё, 5 у байесовской оценки. И оценка Джеймса — Стейна лучше X при каждом θ без априорных предположений: нужную дисперсию ей дают сами d координат."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Risk R(θ, δ) = E_θ[L(θ, δ(X))] is a function of θ. δ is inadmissible if another estimator is never worse and somewhere better; the Bayes risk averages R over a prior, minimax looks at the worst θ. For the squared error, risk = bias² + variance, and `c·X̄` has risk `(1 − c)²·μ² + c²·v`: a little bias can buy a lot of variance.",
                            "Fisher information: `I(θ) = E[(∂ ln f/∂θ)²]`. Cramér–Rao, for regular models: an unbiased estimator from n independent observations has variance at least `1/(n·I(θ))`; it does not bind biased ones. The natural gradient `θ ← θ − η·F^(−1)·∇L` measures steps by KL, so to first order it does not depend on the parameterisation.",
                            "James–Stein: for X ~ N(θ, I_d) with d ≥ 3, `(1 − (d − 2)/‖X‖²)·X` has the risk `d − (d − 2)²·E[1/‖X‖²]`: below d at every θ, and 2 at θ = 0. So X is inadmissible for d ≥ 3, though admissible for d = 1 and 2. The gain is in the total risk, not in every coordinate. It is empirical Bayes: the data estimate the shrinkage.",
                            "A Bayes estimate minimises the posterior expected loss: the posterior mean for squared error, a median for absolute error. Beta(a, b) with k successes in n trials gives the mean `(a + k)/(a + b + n)`. A Bayes estimator with constant risk is minimax: for a Bernoulli p it is `(k + √n/2)/(n + √n)`, with risk `1/(4·(√n + 1)²)`."
                        ]
                    },
                    ru: {
                        points: [
                            "Риск R(θ, δ) = E_θ[L(θ, δ(X))] — функция от θ. δ недопустима, если другая оценка нигде не хуже и где-то лучше; байесовский риск усредняет R по априорному распределению, минимакс берёт худшее θ. Для квадрата ошибки риск = смещение² + дисперсия; у `c·X̄` это `(1 − c)²·μ² + c²·v`: малое смещение может сильно снизить дисперсию.",
                            "Информация Фишера: `I(θ) = E[(∂ ln f/∂θ)²]`. Неравенство Рао — Крамера для регулярных моделей: дисперсия несмещённой оценки по n независимым наблюдениям не меньше `1/(n·I(θ))`; смещённые оценки оно не ограничивает. Натуральный градиент `θ ← θ − η·F^(−1)·∇L` измеряет шаги по KL и в первом порядке не зависит от параметризации.",
                            "Джеймс — Стейн: для X ~ N(θ, I_d) при d ≥ 3 у оценки `(1 − (d − 2)/‖X‖²)·X` риск `d − (d − 2)²·E[1/‖X‖²]`: меньше d при каждом θ и равен 2 при θ = 0. Значит, X недопустима при d ≥ 3, хотя допустима при d = 1 и 2. Выигрыш — в суммарном риске, не в каждой координате. Это эмпирический байесовский подход: сжатие оценивают по данным.",
                            "Байесовская оценка минимизирует апостериорные ожидаемые потери: апостериорное среднее для квадрата ошибки, медиана для модуля. Beta(a, b) и k успехов в n испытаниях дают среднее `(a + k)/(a + b + n)`. Байесовская оценка с постоянным риском минимаксна: для параметра Бернулли p это `(k + √n/2)/(n + √n)` с риском `1/(4·(√n + 1)²)`."
                        ]
                    }
                }
            ]
        },

        /* ----- t7. Diffusion as differential equations: scores, SDEs and ODEs ----- */
        t7: {
            steps: [
                {
                    type: "info", icon: "🧭", mono: true,
                    en: {
                        title: "The score of noised data",
                        text: [
                            "The **score** of a density p is ∇_x ln p(x): the direction in which ln p rises fastest. The normalising constant drops out of it. For N(m, s²·I) the score is −(x − m)/s², an arrow towards the mean (line 1).",
                            "A diffusion model noises data as x_t = α_t·x_0 + σ_t·ε with ε ~ N(0, I); for a discrete schedule α_t = √ᾱ_t and σ_t = √(1 − ᾱ_t). Given x_0, x_t is Gaussian with a known score (line 2). Sampling needs the score of the marginal p_t, a mixture over all the data: for real data it has no closed form.",
                            "Line 3 is the bridge: the marginal score is the posterior average of the conditional ones. A squared-error regression learns a conditional mean, so over all functions of x_t the loss of line 4 is minimised by ∇ ln p_t: **denoising score matching**. In terms of the noise predictor, s_θ = −ε_θ/σ_t."
                        ],
                        example: ["N(2, 4) at x = 0: ∇ ln p = −(0 − 2)/4 = 0.5", "∇ ln p(x_t | x_0) = −(x_t − α_t·x_0)/σ_t² = −ε/σ_t", "∇ ln p_t(x_t) = E[∇ ln p(x_t | x_0) | x_t] = −E[ε | x_t]/σ_t", "E‖s_θ(x_t, t) + ε/σ_t‖² = E‖s_θ(x_t, t) − ∇ ln p_t(x_t)‖² + C"],
                        note: "Proof of line 3: ∇p_t(x) = ∫ p(x_0)·∇p(x | x_0) dx_0 = ∫ p(x_0)·p(x | x_0)·∇ ln p(x | x_0) dx_0; divide by p_t(x) and use Bayes' rule. In line 4, C does not depend on θ: it is the spread of the target around its posterior mean, which no function of x_t can remove."
                    },
                    ru: {
                        title: "Скор зашумлённых данных",
                        text: [
                            "**Скор** (score) плотности p — это ∇_x ln p(x): направление, в котором ln p растёт быстрее всего. Нормировочная константа в него не входит. Для N(m, s²·I) скор равен −(x − m)/s²: это стрелка к среднему (строка 1).",
                            "Диффузионная модель зашумляет данные: x_t = α_t·x_0 + σ_t·ε, где ε ~ N(0, I); для дискретного расписания α_t = √ᾱ_t и σ_t = √(1 − ᾱ_t). При заданном x_0 величина x_t гауссова, и её скор известен (строка 2). А сэмплированию нужен скор маргинальной плотности p_t — смеси по всем данным: для реальных данных явной формулы нет.",
                            "Мост — строка 3: маргинальный скор равен апостериорному среднему условных. Регрессия с квадратичной ошибкой выучивает условное среднее, поэтому среди всех функций от x_t потери из строки 4 минимизирует ∇ ln p_t: это **сопоставление скоров с шумоподавлением** (denoising score matching). Через предсказанный шум: s_θ = −ε_θ/σ_t."
                        ],
                        example: ["N(2, 4) в точке x = 0: ∇ ln p = −(0 − 2)/4 = 0,5", "∇ ln p(x_t | x_0) = −(x_t − α_t·x_0)/σ_t² = −ε/σ_t", "∇ ln p_t(x_t) = E[∇ ln p(x_t | x_0) | x_t] = −E[ε | x_t]/σ_t", "E‖s_θ(x_t, t) + ε/σ_t‖² = E‖s_θ(x_t, t) − ∇ ln p_t(x_t)‖² + C"],
                        note: "Доказательство строки 3: ∇p_t(x) = ∫ p(x_0)·∇p(x | x_0) dx_0 = ∫ p(x_0)·p(x | x_0)·∇ ln p(x | x_0) dx_0; делим на p_t(x) и применяем формулу Байеса. В строке 4 константа C не зависит от θ: это разброс цели вокруг её апостериорного среднего, и никакая функция от x_t его не уберёт."
                    }
                },
                {
                    type: "number", answer: -0.2, tolerance: 0.05,
                    en: {
                        q: "The data are two points: x_0 = +1 or −1, with probability ½ each. At a noise level with α_t = 0.6 and σ_t = 0.8, what is the score ∇ ln p_t(x_t) of the noised data at x_t = 0.32? Round to one decimal place.",
                        hint: "Average the two conditional scores −(x_t − α_t·x_0)/σ_t² with the posterior probabilities of x_0 = ±1 given x_t. Bayes' rule needs the two Gaussian likelihoods.",
                        why: "Odds of x_0 = +1 against −1: exp(2·α_t·x_t/σ_t²) = exp(0.6) = 1.822, so P(+1 | x_t) = 1.822/2.822 = 0.6457. Conditional scores: 0.28/0.64 = 0.4375 and −0.92/0.64 = −1.4375. Average: 0.6457·0.4375 − 0.3543·1.4375 = −0.227 ≈ −0.2. It points away from the nearer centre 0.6: since 0.6 < σ_t, p_t has a single mode, at 0."
                    },
                    ru: {
                        q: "Данные — две точки: x_0 = +1 или −1 с вероятностью ½ каждая. При уровне шума α_t = 0,6 и σ_t = 0,8 найди скор ∇ ln p_t(x_t) зашумлённых данных в точке x_t = 0,32. Округли до одного знака после запятой.",
                        hint: "Усредни два условных скора −(x_t − α_t·x_0)/σ_t² с апостериорными вероятностями x_0 = ±1 при данном x_t. Для формулы Байеса нужны два гауссовых правдоподобия.",
                        why: "Отношение шансов x_0 = +1 к −1: exp(2·α_t·x_t/σ_t²) = exp(0,6) = 1,822, так что P(+1 | x_t) = 1,822/2,822 = 0,6457. Условные скоры: 0,28/0,64 = 0,4375 и −0,92/0,64 = −1,4375. Среднее: 0,6457·0,4375 − 0,3543·1,4375 = −0,227 ≈ −0,2. Скор направлен от ближнего центра 0,6: так как 0,6 < σ_t, у p_t одна мода, в нуле."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Take the conditional expectation given x_t of x_t = α_t·x_0 + σ_t·ε, and use ∇ ln p_t(x_t) = −E[ε | x_t]/σ_t. Which formula follows for the posterior mean E[x_0 | x_t], the output of an ideal denoiser?",
                        options: ["(x_t + σ_t²·∇ ln p_t(x_t))/α_t", "(x_t − σ_t²·∇ ln p_t(x_t))/α_t", "(x_t + σ_t·∇ ln p_t(x_t))/α_t", "x_t/α_t, because the noise ε has mean 0"],
                        hint: "Once you condition on x_t, x_t itself is known. What is E[ε | x_t] in terms of the score?",
                        why: "x_t = α_t·E[x_0 | x_t] + σ_t·E[ε | x_t] = α_t·E[x_0 | x_t] − σ_t²·∇ ln p_t(x_t); solve for the mean. This is **Tweedie's formula**: it holds for any data distribution, given Gaussian noise. E[ε] = 0, but E[ε | x_t] is not: a large x_t suggests a large ε. Example: α_t = 0.6, σ_t = 0.8, x_t = 1, score −0.5: (1 − 0.32)/0.6 = 1.133."
                    },
                    ru: {
                        q: "Возьми условное среднее при данном x_t от x_t = α_t·x_0 + σ_t·ε и подставь ∇ ln p_t(x_t) = −E[ε | x_t]/σ_t. Какая формула получается для апостериорного среднего E[x_0 | x_t] — выхода идеального денойзера (denoiser)?",
                        options: ["(x_t + σ_t²·∇ ln p_t(x_t))/α_t", "(x_t − σ_t²·∇ ln p_t(x_t))/α_t", "(x_t + σ_t·∇ ln p_t(x_t))/α_t", "x_t/α_t, ведь у шума ε нулевое среднее"],
                        hint: "При условии на x_t сама величина x_t известна. Чему равно E[ε | x_t], если выразить его через скор?",
                        why: "x_t = α_t·E[x_0 | x_t] + σ_t·E[ε | x_t] = α_t·E[x_0 | x_t] − σ_t²·∇ ln p_t(x_t); выражаем среднее. Это **формула Твиди** (Tweedie): верна при любом распределении данных и гауссовом шуме. E[ε] = 0, но E[ε | x_t] — нет: при большом x_t вероятнее большое ε. Пример: α_t = 0,6; σ_t = 0,8; x_t = 1; скор −0,5: (1 − 0,32)/0,6 = 1,133."
                    }
                },
                {
                    type: "number", answer: -1.25, tolerance: 0.005, card: "t7a",
                    en: {
                        q: "Tweedie's formula for x_t = α_t·x_0 + σ_t·ε, ε ~ N(0, I): E[x_0 | x_t] = (x_t + σ_t²·∇ ln p_t(x_t))/α_t. An ideal denoiser returns E[x_0 | x_t] = 0.5 at x_t = 1.1, where α_t = 0.6 and σ_t = 0.8. What is the score ∇ ln p_t(x_t)?",
                        hint: "Solve the formula for the score. Mind the square on σ_t.",
                        why: "Solve for the score: ∇ ln p_t(x_t) = (α_t·E[x_0 | x_t] − x_t)/σ_t² = (0.3 − 1.1)/0.64 = −1.25. The same output read as noise: E[ε | x_t] = −σ_t·(−1.25) = 1, and indeed 0.6·0.5 + 0.8·1 = 1.1. Denoiser, noise predictor and score are one function in three parameterisations."
                    },
                    ru: {
                        q: "Формула Твиди для x_t = α_t·x_0 + σ_t·ε, ε ~ N(0, I): E[x_0 | x_t] = (x_t + σ_t²·∇ ln p_t(x_t))/α_t. Идеальный денойзер выдаёт E[x_0 | x_t] = 0,5 в точке x_t = 1,1 при α_t = 0,6 и σ_t = 0,8. Чему равен скор ∇ ln p_t(x_t)?",
                        hint: "Вырази скор из формулы. Не забудь, что σ_t входит в квадрате.",
                        why: "Выражаем скор: ∇ ln p_t(x_t) = (α_t·E[x_0 | x_t] − x_t)/σ_t² = (0,3 − 1,1)/0,64 = −1,25. Тот же выход в виде шума: E[ε | x_t] = −σ_t·(−1,25) = 1, и действительно 0,6·0,5 + 0,8·1 = 1,1. Денойзер, предсказатель шума и скор — одна функция в трёх параметризациях."
                    }
                },
                {
                    type: "info", icon: "🌊", mono: true,
                    en: {
                        title: "One family of marginals, three equations",
                        text: [
                            "In continuous time, noising is a **stochastic differential equation** (SDE): a drift f plus noise of intensity g, where w is a Brownian motion. The **variance-preserving** (VP) choice of line 2 gives x_t = α_t·x_0 + σ_t·ε with α_t = exp(−½·∫_0^t β(s) ds) and σ_t² = 1 − α_t².",
                            "Under mild regularity conditions the same marginals p_t are produced by a **reverse-time SDE**, run from t = T down to 0 (w̄ is a Brownian motion in reverse time), and by a deterministic equation, the **probability-flow ODE**. Both depend on the data only through the score ∇ ln p_t.",
                            "A sampler draws x_T from N(0, I) ≈ p_T, puts s_θ = −ε_θ/σ_t in place of the score and integrates backwards in time. Started from p_T with the exact score, both equations pass through the same p_t at every t as the forward SDE; with a learned score, only approximately."
                        ],
                        example: ["forward SDE: dx = f(x, t)·dt + g(t)·dw", "VP: f = −½·β(t)·x, g = √β(t)", "reverse SDE: dx = [f − g²·∇ ln p_t(x)]·dt + g·dw̄", "ODE: dx/dt = f − ½·g²·∇ ln p_t(x)", "β = 2, x = 1, score −0.4: ODE drift −1 + 0.4 = −0.6; reverse-SDE drift −1 + 0.8 = −0.2"],
                        note: "Backwards in time dt is negative. An Euler step of the ODE from t to t − Δt is x ← x − Δt·[f − ½·g²·∇ ln p_t(x)]; the reverse SDE uses the full g² and adds g·√Δt·z with z ~ N(0, I)."
                    },
                    ru: {
                        title: "Одни и те же маргинальные распределения, три уравнения",
                        text: [
                            "В непрерывном времени зашумление — это **стохастическое дифференциальное уравнение** (СДУ): снос f плюс шум интенсивности g, где w — броуновское движение. Выбор из строки 2, **сохраняющий дисперсию** (variance-preserving, VP), даёт x_t = α_t·x_0 + σ_t·ε с α_t = exp(−½·∫_0^t β(s) ds) и σ_t² = 1 − α_t².",
                            "При мягких условиях регулярности те же маргинальные распределения (маргиналы) p_t дают ещё два уравнения: **СДУ в обратном времени**, от t = T к 0 (w̄ — броуновское движение в обратном времени), и детерминированное **ОДУ вероятностного потока** (probability flow ODE). От данных они зависят только через скор ∇ ln p_t.",
                            "Сэмплер берёт x_T из N(0, I) ≈ p_T, подставляет вместо скора s_θ = −ε_θ/σ_t и интегрирует назад по времени. Если стартовать из p_T с точным скором, оба уравнения при каждом t проходят через то же p_t, что и прямое СДУ; при выученном скоре — лишь приближённо."
                        ],
                        example: ["прямое СДУ: dx = f(x, t)·dt + g(t)·dw", "VP: f = −½·β(t)·x, g = √β(t)", "обратное СДУ: dx = [f − g²·∇ ln p_t(x)]·dt + g·dw̄", "ОДУ: dx/dt = f − ½·g²·∇ ln p_t(x)", "β = 2; x = 1; скор −0,4: снос ОДУ −1 + 0,4 = −0,6; снос обратного СДУ −1 + 0,8 = −0,2"],
                        note: "В обратном времени dt отрицательно. Шаг Эйлера для ОДУ от t к t − Δt: x ← x − Δt·[f − ½·g²·∇ ln p_t(x)]; в обратном СДУ стоит полное g² и добавляется g·√Δt·z, где z ~ N(0, I)."
                    }
                },
                {
                    type: "number", answer: -1.4, tolerance: 0.005, card: "t7b",
                    en: {
                        q: "A variance-preserving diffusion has f = −½·β·x and g² = β. Its probability-flow ODE is dx/dt = f − ½·g²·∇ ln p_t(x), and the score is −ε_θ/σ_t. At β = 4, x = 1.5 and σ_t = 0.5 the network predicts ε_θ = 0.4. What is dx/dt?",
                        hint: "Three steps: the score from ε_θ, then f, then the sum. Two minus signs meet in the last term.",
                        why: "Score: −0.4/0.5 = −0.8. Drift: f = −½·4·1.5 = −3. ODE: −3 − ½·4·(−0.8) = −3 + 1.6 = −1.4. The reverse SDE has the full g²: −3 + 3.2 = 0.2, plus noise. The same ODE reads dx/dt = α_t′·x̂_0 + σ_t′·ε_θ with x̂_0 = (x − σ_t·ε_θ)/α_t: sliding along the schedule with both predictions frozen, as deterministic DDIM-type samplers do."
                    },
                    ru: {
                        q: "У диффузии, сохраняющей дисперсию (VP), f = −½·β·x и g² = β. Её ОДУ вероятностного потока: dx/dt = f − ½·g²·∇ ln p_t(x), а скор равен −ε_θ/σ_t. При β = 4; x = 1,5; σ_t = 0,5 сеть предсказывает ε_θ = 0,4. Чему равно dx/dt?",
                        hint: "Три шага: скор по ε_θ, затем f, затем сумма. В последнем слагаемом встречаются два минуса.",
                        why: "Скор: −0,4/0,5 = −0,8. Снос: f = −½·4·1,5 = −3. ОДУ: −3 − ½·4·(−0,8) = −3 + 1,6 = −1,4. В обратном СДУ стоит полное g²: −3 + 3,2 = 0,2, плюс шум. То же ОДУ — это dx/dt = α_t′·x̂_0 + σ_t′·ε_θ, где x̂_0 = (x − σ_t·ε_θ)/α_t: движение вдоль расписания при замороженных предсказаниях, как в детерминированных сэмплерах типа DDIM."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "The density of dx = f·dt + g·dw obeys the Fokker–Planck equation ∂p_t/∂t = −∇·(f·p_t) + ½·g²·Δp_t (∇· is the divergence, Δ the Laplacian). Put the steps that derive the probability-flow ODE from it in order.",
                        items: ["Write the Laplacian as a divergence of a gradient: Δp_t = ∇·(∇p_t)", "Substitute ∇p_t = p_t·∇ ln p_t, which gives Δp_t = ∇·(p_t·∇ ln p_t)", "Merge the two divergences: ∂p_t/∂t = −∇·([f − ½·g²·∇ ln p_t]·p_t)", "Read this as a continuity equation ∂p_t/∂t = −∇·(u·p_t) with u = f − ½·g²·∇ ln p_t", "So points that move by dx/dt = u(x, t), started from p_0, have the density p_t at every t"],
                        hint: "Each line rewrites the result of the one before it. The diffusion term has to become a transport term.",
                        why: "The trick is ∇p = p·∇ ln p: it turns the diffusion term ½·g²·Δp into transport with velocity −½·g²·∇ ln p. Under enough regularity the continuity equation has one solution, so the ODE reproduces p_t. In reverse time, the drift f − ½·(g² + η²)·∇ ln p_t with noise η·dw̄ gives the same p_t: η = 0 is the ODE, η = g the reverse SDE."
                    },
                    ru: {
                        q: "Плотность процесса dx = f·dt + g·dw подчиняется уравнению Фоккера — Планка ∂p_t/∂t = −∇·(f·p_t) + ½·g²·Δp_t (∇· — дивергенция, Δ — лапласиан). Расставь по порядку шаги, которыми из него выводится ОДУ вероятностного потока.",
                        items: ["Записываем лапласиан как дивергенцию градиента: Δp_t = ∇·(∇p_t)", "Подставляем ∇p_t = p_t·∇ ln p_t и получаем Δp_t = ∇·(p_t·∇ ln p_t)", "Объединяем две дивергенции: ∂p_t/∂t = −∇·([f − ½·g²·∇ ln p_t]·p_t)", "Видим в этом уравнение непрерывности ∂p_t/∂t = −∇·(u·p_t) с u = f − ½·g²·∇ ln p_t", "Значит, у точек, движущихся по dx/dt = u(x, t) из p_0, плотность равна p_t при каждом t"],
                        hint: "Каждая строка преобразует результат предыдущей. Диффузионное слагаемое должно превратиться в слагаемое переноса.",
                        why: "Ключ — тождество ∇p = p·∇ ln p: оно превращает диффузионное слагаемое ½·g²·Δp в перенос со скоростью −½·g²·∇ ln p. При достаточной регулярности у уравнения непрерывности одно решение, поэтому ОДУ воспроизводит p_t. В обратном времени снос f − ½·(g² + η²)·∇ ln p_t с шумом η·dw̄ даёт те же p_t: η = 0 — ОДУ, η = g — обратное СДУ."
                    }
                },
                {
                    type: "choice", card: "t7c",
                    en: {
                        q: "With the exact score, which step fails? (1) The probability-flow ODE has the marginals p_t of the forward SDE. (2) So, run back from x_T ~ p_T, it yields x_0 ~ p_0. (3) So it recovers the x_0 that the SDE noised into x_T.",
                        options: ["Step 3: equal marginals do not fix which x_0 goes with which x_T", "Step 1: without the term g·dw the density cannot spread out as p_t does", "Step 2: a deterministic map can turn a Gaussian only into another Gaussian", "Step 2: p_0 is reached only if fresh noise is injected at every step"],
                        hint: "Fix one x_T. From how many different x_0 can the forward SDE have arrived there?",
                        why: "The forward SDE reaches one x_T from many x_0; the ODE pairs each x_T with one x_0: same marginals, different joint distributions. Steps 1 and 2 hold: the score term replaces the missing noise, and a nonlinear flow can map a Gaussian to a non-Gaussian density. To get the x_T that returns a given x_0, integrate the ODE forwards."
                    },
                    ru: {
                        q: "Скор точный. Какой шаг неверен? (1) У ОДУ вероятностного потока те же маргиналы p_t, что у прямого СДУ. (2) Значит, идя назад из x_T ~ p_T, оно даёт x_0 ~ p_0. (3) Значит, оно возвращает тот x_0, который СДУ зашумило в x_T.",
                        options: ["Шаг 3: равенство маргиналов не говорит, какой x_0 соответствует какому x_T", "Шаг 1: без слагаемого g·dw плотность не может расплываться так, как p_t", "Шаг 2: детерминированное отображение переводит гауссиану только в гауссиану", "Шаг 2: p_0 получится, только если на каждом шаге добавлять свежий шум"],
                        hint: "Зафиксируй один x_T. Из скольких разных x_0 прямое СДУ могло в него прийти?",
                        why: "Прямое СДУ приходит в один x_T из многих x_0, а ОДУ сопоставляет каждому x_T один x_0: маргиналы те же, совместные распределения разные. Шаги 1 и 2 верны: слагаемое со скором заменяет недостающий шум, а нелинейный поток может перевести гауссиану в негауссову плотность. Нужный x_T для данного x_0 даёт интегрирование ОДУ вперёд."
                    }
                },
                {
                    type: "info", icon: "📐", mono: true,
                    en: {
                        title: "What the ODE buys, and a case to check it on",
                        text: [
                            "The probability-flow ODE is an ordinary ODE. So higher-order solvers apply, and in practice they need far fewer network evaluations than SDE samplers. Its flow is invertible: integrating forwards from x_0 gives a unique **latent code** x_T. And densities follow the change-of-variables rule of lines 1 and 2.",
                            "With s_θ in place of the score and N(0, I) in place of p_T, line 2 is the exact log-density of the ODE sampler's own model, up to solver error. The SDE sampler built on the same network defines, in general, a different distribution, and for that one only a bound on the log-likelihood is available.",
                            "A case to check by hand: x_0 ~ N(0, v) in one dimension. Then p_t = N(0, V_t), and the score is linear in x (line 3). For v = 1 and a VP schedule, V_t = 1 at every t: the density is stationary, and the right-hand side of the ODE vanishes. Under the ODE no point moves, while under both SDEs every point keeps wandering."
                        ],
                        example: ["d ln p_t(x(t))/dt = −∇·u(x(t), t), u = f − ½·g²·∇ ln p_t", "ln p_0(x(0)) = ln p_T(x(T)) + ∫_0^T ∇·u(x(t), t) dt", "x_0 ~ N(0, v): V_t = α_t²·v + σ_t², ∇ ln p_t(x) = −x/V_t", "v = 1, VP: V_t = 1 and u = −½·β·x + ½·β·x = 0", "v = 4, α_t = 0.6, σ_t = 0.8: V_t = 0.36·4 + 0.64 = 2.08"],
                        note: "Line 1 holds along a trajectory x(t) of the ODE: d ln p_t(x(t))/dt = ∂ ln p_t/∂t + u·∇ ln p_t, and the continuity equation turns this into −∇·u. In high dimension the divergence is usually not computed exactly but estimated with random probe vectors."
                    },
                    ru: {
                        title: "Что даёт ОДУ, и пример, на котором всё можно проверить",
                        text: [
                            "ОДУ вероятностного потока — обычное ОДУ. К нему применимы методы высокого порядка, и на практике им нужно гораздо меньше вызовов сети, чем СДУ-сэмплерам. Его поток обратим: интегрирование вперёд от x_0 даёт единственный **латентный код** (latent code) x_T. А плотности меняются по формуле замены переменных (строки 1 и 2).",
                            "Если подставить s_θ вместо скора и N(0, I) вместо p_T, строка 2 — это точный логарифм плотности модели самого ОДУ-сэмплера, с точностью до ошибки численного метода. СДУ-сэмплер с той же сетью задаёт, вообще говоря, другое распределение, и для него есть лишь граница на логарифм правдоподобия.",
                            "Пример, где всё проверяется вручную: x_0 ~ N(0, v) в одномерном случае. Тогда p_t = N(0, V_t), а скор линеен по x (строка 3). При v = 1 и расписании VP получается V_t = 1 при всех t: плотность стационарна, и правая часть ОДУ равна нулю. В ОДУ ни одна точка не движется, а в обоих СДУ каждая точка продолжает блуждать."
                        ],
                        example: ["d ln p_t(x(t))/dt = −∇·u(x(t), t), u = f − ½·g²·∇ ln p_t", "ln p_0(x(0)) = ln p_T(x(T)) + ∫_0^T ∇·u(x(t), t) dt", "x_0 ~ N(0, v): V_t = α_t²·v + σ_t², ∇ ln p_t(x) = −x/V_t", "v = 1, VP: V_t = 1 и u = −½·β·x + ½·β·x = 0", "v = 4; α_t = 0,6; σ_t = 0,8: V_t = 0,36·4 + 0,64 = 2,08"],
                        note: "Строка 1 верна вдоль траектории x(t) ОДУ: d ln p_t(x(t))/dt = ∂ ln p_t/∂t + u·∇ ln p_t, а уравнение непрерывности превращает это в −∇·u. В высокой размерности дивергенцию обычно не вычисляют точно, а оценивают с помощью случайных пробных векторов."
                    }
                },
                {
                    type: "number", answer: -2.11, tolerance: 0.005,
                    en: {
                        q: "For data N(0, v) the probability-flow ODE in one dimension is linear: dx/dt = a(t)·x. Let ∫_0^T a(t) dt = −ln 2, p_T = N(0, 1). Along a trajectory d ln p_t(x(t))/dt = −a(t). What is ln p_0(x_0) at x_0 = 2, to two decimal places?",
                        hint: "First carry the point: where is x(T) if x(0) = 2? Then integrate the rule for the density from 0 to T, and mind the sign.",
                        why: "The flow multiplies x by exp(∫ a dt) = ½, so x(T) = 1 and ln p_T(1) = −½ − ½·ln(2π) = −1.4189. Integrating the rule: ln p_T(x(T)) − ln p_0(x_0) = −∫ a dt = ln 2, so ln p_0(2) = −1.4189 − 0.6931 = −2.1121 ≈ −2.11. Check: backwards the flow doubles x, so p_0 = N(0, 4), and ln N(2; 0, 4) = −½ − ½·ln(8π) = −2.1121."
                    },
                    ru: {
                        q: "Для данных N(0, v) одномерное ОДУ вероятностного потока линейно: dx/dt = a(t)·x. Пусть ∫_0^T a(t) dt = −ln 2, p_T = N(0, 1). Вдоль траектории d ln p_t(x(t))/dt = −a(t). Чему равен ln p_0(x_0) при x_0 = 2? Округли до сотых.",
                        hint: "Сначала перенеси точку: где окажется x(T), если x(0) = 2? Затем проинтегрируй правило для плотности от 0 до T и не перепутай знак.",
                        why: "Поток умножает x на exp(∫ a dt) = ½, поэтому x(T) = 1 и ln p_T(1) = −½ − ½·ln(2π) = −1,4189. Интегрируем правило: ln p_T(x(T)) − ln p_0(x_0) = −∫ a dt = ln 2, откуда ln p_0(2) = −1,4189 − 0,6931 = −2,1121 ≈ −2,11. Проверка: назад по времени поток удваивает x, значит, p_0 = N(0, 4), и ln N(2; 0, 4) = −½ − ½·ln(8π) = −2,1121."
                    }
                },
                {
                    type: "info", icon: "🎯", mono: true,
                    en: {
                        title: "Guidance is Bayes' rule on scores",
                        text: [
                            "To sample given a condition c (a class, a prompt), take the logarithm of Bayes' rule p_t(x | c) = p_t(x)·p_t(c | x)/p_t(c) and differentiate in x: p_t(c) drops out (line 1). Classifier guidance takes the last term from a classifier trained on noisy inputs.",
                            "Classifier-free guidance scales by w the difference s_c − s_u of a network's scores with and without c (line 2). w = 1 gives the exact conditional score; w > 1 gives the score of p_t(x)·p_t(c | x)^w at each t. In general these are not marginals of one noising process: samples follow neither p(x | c) nor exactly p(x)·p(c | x)^w.",
                            "Last, the weights in training. The usual loss ‖ε − ε_θ‖² treats all noise levels equally in ε-space; since s_θ = −ε_θ/σ_t, it is score matching with the weight σ_t² (line 3). The likelihood bound of the reverse-SDE model corresponds to the weight g(t)² in its place (line 4, stated here without proof)."
                        ],
                        example: ["∇ ln p_t(x | c) = ∇ ln p_t(x) + ∇ ln p_t(c | x)", "guided: s_u + w·(s_c − s_u) = ∇ ln p_t(x) + w·∇ ln p_t(c | x)", "‖ε − ε_θ‖² = σ_t²·‖s_θ + ε/σ_t‖²", "likelihood weight: g(t)²·‖s_θ + ε/σ_t‖² = (g(t)²/σ_t²)·‖ε − ε_θ‖²"],
                        note: "In terms of the noise, line 2 is ε_g = ε_u + w·(ε_c − ε_u): the rule that is applied at sampling time."
                    },
                    ru: {
                        title: "Наведение — это формула Байеса для скоров",
                        text: [
                            "Чтобы сэмплировать при условии c (класс, текстовый запрос), прологарифмируем формулу Байеса p_t(x | c) = p_t(x)·p_t(c | x)/p_t(c) и возьмём градиент по x: p_t(c) пропадает (строка 1). Наведение по классификатору (classifier guidance) берёт последнее слагаемое у классификатора, обученного на зашумлённых входах.",
                            "Наведение без классификатора (classifier-free) умножает на w разность s_c − s_u скоров сети с условием c и без него (строка 2). При w = 1 это точный условный скор, при w > 1 — скор p_t(x)·p_t(c | x)^w при всех t. Это в общем случае не маргиналы одного процесса зашумления: сэмплы не следуют ни p(x | c), ни точно p(x)·p(c | x)^w.",
                            "И о весах при обучении. Обычные потери ‖ε − ε_θ‖² учитывают все уровни шума одинаково в ε-пространстве; так как s_θ = −ε_θ/σ_t, это сопоставление скоров с весом σ_t² (строка 3). Границе правдоподобия модели с обратным СДУ соответствует вес g(t)² на его месте (строка 4, здесь без доказательства)."
                        ],
                        example: ["∇ ln p_t(x | c) = ∇ ln p_t(x) + ∇ ln p_t(c | x)", "с наведением: s_u + w·(s_c − s_u) = ∇ ln p_t(x) + w·∇ ln p_t(c | x)", "‖ε − ε_θ‖² = σ_t²·‖s_θ + ε/σ_t‖²", "вес для правдоподобия: g(t)²·‖s_θ + ε/σ_t‖² = (g(t)²/σ_t²)·‖ε − ε_θ‖²"],
                        note: "В терминах шума строка 2 — это ε_g = ε_u + w·(ε_c − ε_u): правило, которое применяют при сэмплировании."
                    }
                },
                {
                    type: "number", answer: 2.25, tolerance: 0.005, card: "t7d",
                    en: {
                        q: "Guidance in one dimension. The guided score is ∇ ln p_t(x) + w·∇ ln p_t(c | x). Here ∇ ln p_t(x) = −x, so p_t = N(0, 1), and the classifier term is ∇ ln p_t(c | x) = −(x − 3). For w = 3, at which x is the guided score zero?",
                        hint: "Write the guided score as one linear function of x and find its zero. For comparison, do the same for w = 1.",
                        why: "−x − 3·(x − 3) = 0 gives 4x = 9, so x = 2.25. For w = 1 the zero is at 1.5: the mean of the true conditional p_t(x | c) = N(1.5, 0.5). For w = 3 the guided score belongs to N(2.25, 0.25): nearer to what the classifier wants, and narrower. More fidelity to the condition, less variety, and no longer the conditional distribution."
                    },
                    ru: {
                        q: "Одномерный случай. Скор с наведением: ∇ ln p_t(x) + w·∇ ln p_t(c | x). Здесь ∇ ln p_t(x) = −x, то есть p_t = N(0, 1), а слагаемое классификатора ∇ ln p_t(c | x) = −(x − 3). При каком x скор с наведением равен нулю, если w = 3?",
                        hint: "Запиши скор с наведением как одну линейную функцию от x и найди её нуль. Для сравнения сделай то же при w = 1.",
                        why: "−x − 3·(x − 3) = 0 даёт 4x = 9, и x = 2,25. При w = 1 нуль в точке 1,5: это среднее истинного условного распределения p_t(x | c) = N(1,5; 0,5). При w = 3 такой скор у N(2,25; 0,25): оно ближе к тому, чего хочет классификатор, и более узкое. Условие соблюдается точнее, разнообразие падает, и это уже не условное распределение."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge, on paper. VP diffusion in one dimension, data x_0 ~ N(0, v), so p_t = N(0, V_t), V_t = α_t²·v + σ_t². Solve the probability-flow ODE: which x_0 does it assign to x_T? And what does the reverse SDE do with the same x_T?",
                        answer: [
                            "The score is −x/V_t, so the ODE reads dx/dt = −½·β·x + ½·β·x/V_t = ½·β·(1/V_t − 1)·x. From α_t′ = −½·β·α_t and σ_t² = 1 − α_t² one gets V_t′ = β·(1 − V_t), so dx/dt = (V_t′/(2·V_t))·x. That is d ln|x|/dt = ½·d ln V_t/dt: the ratio x_t/√V_t is constant along every trajectory.",
                            "So x_0 = x_T·√(v/V_T): the ODE only rescales, and each point keeps its number of standard deviations. For v = 4 and V_T ≈ 1, x_T = 1.5 goes to x_0 ≈ 3; for v = 1 nothing moves. The divergence is V_t′/(2·V_t), so the change of variables gives ln p_0(x_0) = ln p_T(x_T) + ½·ln(V_T/v): exactly the density of N(0, v).",
                            "The reverse SDE with the exact score has the path distribution of the forward SDE. So from the same x_T it returns a random x_0 ~ N(α_T·v·x_T/V_T, v·σ_T²/V_T), and as α_T → 0 this is N(0, v) whatever x_T was. The SDE forgets its starting point; the ODE turns it into a code. Same marginals, different couplings of noise and data."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой, на бумаге. Одномерная диффузия VP, данные x_0 ~ N(0, v), так что p_t = N(0, V_t), V_t = α_t²·v + σ_t². Реши ОДУ вероятностного потока: какой x_0 оно сопоставляет x_T? А что делает с тем же x_T обратное СДУ?",
                        answer: [
                            "Скор равен −x/V_t, поэтому ОДУ имеет вид dx/dt = −½·β·x + ½·β·x/V_t = ½·β·(1/V_t − 1)·x. Из α_t′ = −½·β·α_t и σ_t² = 1 − α_t² получаем V_t′ = β·(1 − V_t), так что dx/dt = (V_t′/(2·V_t))·x. Это значит, что d ln|x|/dt = ½·d ln V_t/dt: отношение x_t/√V_t постоянно вдоль каждой траектории.",
                            "Итак, x_0 = x_T·√(v/V_T): ОДУ лишь меняет масштаб, и каждая точка сохраняет своё число стандартных отклонений. При v = 4 и V_T ≈ 1 точка x_T = 1,5 переходит в x_0 ≈ 3; при v = 1 ничего не движется. Дивергенция равна V_t′/(2·V_t), и замена переменных даёт ln p_0(x_0) = ln p_T(x_T) + ½·ln(V_T/v): в точности плотность N(0, v).",
                            "У обратного СДУ с точным скором распределение траекторий такое же, как у прямого СДУ. Поэтому из того же x_T оно выдаёт случайный x_0 ~ N(α_T·v·x_T/V_T, v·σ_T²/V_T), а при α_T → 0 это N(0, v), каким бы ни был x_T. СДУ забывает начальную точку, а ОДУ превращает её в код. Маргиналы одни и те же, а связь шума с данными разная."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Score and denoiser: `∇ ln p_t(x_t) = −E[ε | x_t]/σ_t` for x_t = α_t·x_0 + σ_t·ε, so regression on the noise learns the score (denoising score matching, s_θ = −ε_θ/σ_t). Tweedie: `E[x_0 | x_t] = (x_t + σ_t²·∇ ln p_t(x_t))/α_t`, for any data distribution and Gaussian noise.",
                            "Forward SDE `dx = f·dt + g·dw`, reverse SDE `dx = [f − g²·∇ ln p_t]·dt + g·dw̄`, probability-flow ODE `dx/dt = f − ½·g²·∇ ln p_t`. With the exact score all three have the same marginals p_t (Fokker–Planck plus ∇p = p·∇ ln p). The two SDEs also share the joint law of x_0 and x_T; the ODE pairs them one to one.",
                            "The ODE is an ordinary ODE: higher-order solvers, an invertible latent code, and the exact log-density of its own model by `d ln p_t(x(t))/dt = −∇·u`. For data N(0, v), p_t = N(0, V_t) with V_t = α_t²·v + σ_t², and the ODE keeps x_t/√V_t constant.",
                            "Guidance is Bayes' rule on scores: `∇ ln p_t(x | c) = ∇ ln p_t(x) + ∇ ln p_t(c | x)`. Scaling the last term by w > 1 sharpens the result, but the samples then no longer follow p(x | c). The ε-loss is score matching with the weight σ_t²; the likelihood bound corresponds to the weight g(t)²."
                        ]
                    },
                    ru: {
                        points: [
                            "Скор и денойзер: `∇ ln p_t(x_t) = −E[ε | x_t]/σ_t` для x_t = α_t·x_0 + σ_t·ε, поэтому регрессия на шум выучивает скор (denoising score matching, s_θ = −ε_θ/σ_t). Формула Твиди: `E[x_0 | x_t] = (x_t + σ_t²·∇ ln p_t(x_t))/α_t` — для любого распределения данных при гауссовом шуме.",
                            "Прямое СДУ `dx = f·dt + g·dw`, обратное СДУ `dx = [f − g²·∇ ln p_t]·dt + g·dw̄`, ОДУ вероятностного потока `dx/dt = f − ½·g²·∇ ln p_t`. При точном скоре маргинальные распределения p_t у всех трёх общие (Фоккер — Планк и ∇p = p·∇ ln p). У двух СДУ общее и совместное распределение x_0 и x_T, а ОДУ связывает их взаимно однозначно.",
                            "ОДУ вероятностного потока — обычное ОДУ: методы высокого порядка, обратимый латентный код и точный логарифм плотности его собственной модели по правилу `d ln p_t(x(t))/dt = −∇·u`. Для данных N(0, v) верно p_t = N(0, V_t), где V_t = α_t²·v + σ_t², и оно сохраняет x_t/√V_t.",
                            "Наведение — формула Байеса для скоров: `∇ ln p_t(x | c) = ∇ ln p_t(x) + ∇ ln p_t(c | x)`. Умножение последнего слагаемого на w > 1 делает результат резче, но сэмплы тогда уже не следуют p(x | c). ε-потери — это сопоставление скоров с весом σ_t²; границе правдоподобия соответствует вес g(t)²."
                        ]
                    }
                }
            ]
        },

        /* ----- t8. Reinforcement learning theory: contractions, gradients and regret ----- */
        t8: {
            steps: [
                {
                    type: "info", icon: "📐", mono: true,
                    en: {
                        title: "The Bellman operator is a contraction",
                        text: [
                            "Setting: a finite Markov decision process (MDP) with rewards r(s, a), transition probabilities P(s′ | s, a) and a discount 0 ≤ γ < 1. The **Bellman optimality operator** T turns any function V on the states into a new one (line 1): one step of looking ahead, with V as the estimate of everything after it.",
                            "Measure such functions in the **maximum norm** ‖V‖_∞ = max_s |V(s)|. Theorem: T is a **γ-contraction** in this norm (line 2). One application of T shrinks the distance between any two functions at least by the factor γ.",
                            "By Banach's fixed-point theorem, T then has exactly one fixed point; it is the optimal value function V*, and V* = T·V* is the Bellman optimality equation. And **value iteration** V_(k+1) = T·V_k converges to V* from any V_0, with the error bound of line 3."
                        ],
                        example: ["(T·V)(s) = max_a [r(s, a) + γ·Σ_s′ P(s′ | s, a)·V(s′)]", "‖T·V − T·U‖_∞ ≤ γ·‖V − U‖_∞ for all V, U", "‖V_k − V*‖_∞ ≤ γ^k·‖V_0 − V*‖_∞", "rewards in [0, R_max]: 0 ≤ V^π(s) ≤ V*(s) ≤ R_max / (1 − γ)"],
                        note: "The operator T_π of a fixed policy π, with the average over a ~ π(· | s) in place of the maximum, is a γ-contraction too; its fixed point is V^π. Line 4: a return is a sum of rewards with the weights 1, γ, γ², …, and these weights add up to 1/(1 − γ)."
                    },
                    ru: {
                        title: "Оператор Беллмана — сжимающее отображение",
                        text: [
                            "Дано: конечный марковский процесс принятия решений (MDP) с наградами r(s, a), вероятностями переходов P(s′ | s, a) и коэффициентом дисконтирования 0 ≤ γ < 1. **Оператор оптимальности Беллмана** T превращает любую функцию V на состояниях в новую (строка 1): это один шаг просмотра вперёд, где V — оценка всего, что будет дальше.",
                            "Такие функции будем измерять в **равномерной норме** (норме максимума) ‖V‖_∞ = max_s |V(s)|. Теорема: в этой норме T — **сжатие с коэффициентом γ** (γ-contraction, строка 2). Одно применение T сокращает расстояние между любыми двумя функциями не меньше чем в 1/γ раз.",
                            "По теореме Банаха о неподвижной точке у T тогда ровно одна неподвижная точка; это оптимальная функция ценности V*, а V* = T·V* — уравнение оптимальности Беллмана. И **итерация по ценностям** (value iteration) V_(k+1) = T·V_k сходится к V* из любой V_0 с оценкой ошибки из строки 3."
                        ],
                        example: ["(T·V)(s) = max_a [r(s, a) + γ·Σ_s′ P(s′ | s, a)·V(s′)]", "‖T·V − T·U‖_∞ ≤ γ·‖V − U‖_∞ для всех V, U", "‖V_k − V*‖_∞ ≤ γ^k·‖V_0 − V*‖_∞", "награды в [0; R_max]: 0 ≤ V^π(s) ≤ V*(s) ≤ R_max / (1 − γ)"],
                        note: "Оператор T_π фиксированной политики π, в котором вместо максимума стоит среднее по a ~ π(· | s), тоже сжатие с коэффициентом γ; его неподвижная точка — V^π. Строка 4: отдача — это сумма наград с весами 1, γ, γ², …, а сумма этих весов равна 1/(1 − γ)."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Order the proof that T is a γ-contraction in the maximum norm, with its consequence for value iteration. For a fixed state s let f(a) = r(s, a) + γ·Σ_s′ P(s′ | s, a)·V(s′), and g(a) the same with U in place of V.",
                        items: ["|(T·V)(s) − (T·U)(s)| = |max_a f(a) − max_a g(a)| ≤ max_a |f(a) − g(a)|", "Inside this last maximum the rewards cancel: f(a) − g(a) = γ·Σ_s′ P(s′ | s, a)·(V(s′) − U(s′))", "That weighted average of differences is at most ‖V − U‖_∞ in size: |f(a) − g(a)| ≤ γ·‖V − U‖_∞", "So |(T·V)(s) − (T·U)(s)| ≤ γ·‖V − U‖_∞ in every state s; the maximum over s gives the claim", "With U = V* = T·V* and V = V_k the claim reads ‖V_(k+1) − V*‖_∞ ≤ γ·‖V_k − V*‖_∞"],
                        hint: "Start with the line that turns the two operators into f and g. After it, every line speaks about something that the line before has produced.",
                        why: "The proof rests on two facts: |max f − max g| ≤ max |f − g|, and an average never exceeds its largest term in size. The rewards cancel, so only γ times a difference of values remains. The norm matters: in the Euclidean norm, the one in which least squares works, T need not be a contraction."
                    },
                    ru: {
                        q: "Расставь шаги доказательства того, что T — сжатие с коэффициентом γ в равномерной норме, и следствия для итерации по ценностям. Для фиксированного s пусть f(a) = r(s, a) + γ·Σ_s′ P(s′ | s, a)·V(s′), а g(a) — то же с U вместо V.",
                        items: ["|(T·V)(s) − (T·U)(s)| = |max_a f(a) − max_a g(a)| ≤ max_a |f(a) − g(a)|", "Под этим последним максимумом награды сокращаются: f(a) − g(a) = γ·Σ_s′ P(s′ | s, a)·(V(s′) − U(s′))", "Это взвешенное среднее разностей по модулю не больше ‖V − U‖_∞: |f(a) − g(a)| ≤ γ·‖V − U‖_∞", "Итак, |(T·V)(s) − (T·U)(s)| ≤ γ·‖V − U‖_∞ в каждом s; максимум по s даёт утверждение теоремы", "При U = V* = T·V* и V = V_k это утверждение принимает вид ‖V_(k+1) − V*‖_∞ ≤ γ·‖V_k − V*‖_∞"],
                        hint: "Начни со строки, которая выражает оба оператора через f и g. После неё каждая строка говорит о том, что получено в предыдущей.",
                        why: "Доказательство держится на двух фактах: |max f − max g| ≤ max |f − g|, а среднее по модулю не превосходит наибольшего по модулю слагаемого. Награды сокращаются, и остаётся только γ, умноженное на разность ценностей. Норма важна: в евклидовой норме, в которой работает метод наименьших квадратов, T может не быть сжатием."
                    }
                },
                {
                    type: "number", answer: 66, tolerance: 0, card: "t8a",
                    en: {
                        q: "Value iteration V_(k+1) = T·V_k with the Bellman optimality operator T has ‖V_k − V*‖_∞ ≤ γ^k·‖V_0 − V*‖_∞. Rewards lie in [0, 1], γ = 0.9, V_0 = 0. What is the smallest k for which this guarantees ‖V_k − V*‖_∞ ≤ 0.01?",
                        hint: "First bound ‖V_0 − V*‖_∞: how large can a discounted sum of rewards from [0, 1] be? Then solve γ^k·(that bound) ≤ 0.01 with logarithms and round up.",
                        why: "Values lie in [0, 1/(1 − γ)] = [0, 10], so ‖V_0 − V*‖_∞ ≤ 10. Then 0.9^k·10 ≤ 0.01 means k ≥ ln 1000 / ln(1/0.9) = 6.9078/0.10536 = 65.56, so k = 66. Each further factor of 10 costs ln 10 / ln(1/γ) ≈ 22 iterations; for γ = 0.99 about 229: the count grows like the horizon 1/(1 − γ)."
                    },
                    ru: {
                        q: "Итерация по ценностям V_(k+1) = T·V_k с оператором оптимальности Беллмана T даёт ‖V_k − V*‖_∞ ≤ γ^k·‖V_0 − V*‖_∞. Награды лежат в [0; 1], γ = 0,9, V_0 = 0. При каком наименьшем k эта оценка гарантирует ‖V_k − V*‖_∞ ≤ 0,01?",
                        hint: "Сначала оцени ‖V_0 − V*‖_∞: какой наибольшей может быть дисконтированная сумма наград из [0; 1]? Затем реши γ^k·(эта оценка) ≤ 0,01 с помощью логарифмов и округли вверх.",
                        why: "Ценности лежат в [0; 1/(1 − γ)] = [0; 10], поэтому ‖V_0 − V*‖_∞ ≤ 10. Условие 0,9^k·10 ≤ 0,01 даёт k ≥ ln 1000 / ln(1/0,9) = 6,9078/0,10536 = 65,56, то есть k = 66. Каждый следующий множитель 10 стоит ln 10 / ln(1/γ) ≈ 22 итерации, а при γ = 0,99 — около 229: счёт растёт как горизонт 1/(1 − γ)."
                    }
                },
                {
                    type: "info", icon: "⚖️", mono: true,
                    en: {
                        title: "An approximate value function can cost more than its error",
                        text: [
                            "In practice V* is known only approximately: the iteration is stopped early, or values are estimated from samples or by a network. What matters is the policy read off from the approximation. A policy π is **greedy** for V if in every state it picks an action that maximises r(s, a) + γ·Σ_s′ P(s′ | s, a)·V(s′); then T_π·V = T·V.",
                            "Theorem: if ‖V − V*‖_∞ ≤ ε and π is greedy for V, then π loses at most 2·γ·ε/(1 − γ) in any state. Lines 1 to 4 are the proof; line 3 uses that T and T_π are γ-contractions. An error of ε in the values can cost up to 2·γ·ε at every step, and the horizon 1/(1 − γ) adds these losses up."
                        ],
                        example: ["V* − V^π = T·V* − T_π·V^π = (T·V* − T·V) + (T_π·V − T_π·V^π)", "‖V − V^π‖_∞ ≤ ‖V − V*‖_∞ + ‖V* − V^π‖_∞ ≤ ε + ‖V* − V^π‖_∞", "‖V* − V^π‖_∞ ≤ γ·ε + γ·(ε + ‖V* − V^π‖_∞)", "‖V* − V^π‖_∞ ≤ 2·γ·ε / (1 − γ)", "ε = 0.01, γ = 0.99: up to 1.98"],
                        note: "From samples: tabular Q-learning is a noisy, asynchronous value iteration for Q. It converges to Q* with probability 1 if every pair (s, a) is updated infinitely often and the step α_n of its n-th update satisfies Σ α_n = ∞, Σ α_n² < ∞: 1/n qualifies, a constant step does not. With function approximation this guarantee is lost."
                    },
                    ru: {
                        title: "Приближённая функция ценности может стоить дороже своей ошибки",
                        text: [
                            "На практике V* известна лишь приближённо: итерацию обрывают, ценности оценивают по выборке или нейросетью. Важна политика, которую строят по такому приближению. Политика π **жадная** (greedy) относительно V, если в каждом состоянии выбирает действие, максимизирующее r(s, a) + γ·Σ_s′ P(s′ | s, a)·V(s′); тогда T_π·V = T·V.",
                            "Теорема: если ‖V − V*‖_∞ ≤ ε, а π жадная относительно V, то π теряет не больше 2·γ·ε/(1 − γ) в любом состоянии. Строки 1–4 — доказательство; в строке 3 использовано, что T и T_π — сжатия с коэффициентом γ. Ошибка ε в ценностях может стоить до 2·γ·ε на каждом шаге, а горизонт 1/(1 − γ) эти потери суммирует."
                        ],
                        example: ["V* − V^π = T·V* − T_π·V^π = (T·V* − T·V) + (T_π·V − T_π·V^π)", "‖V − V^π‖_∞ ≤ ‖V − V*‖_∞ + ‖V* − V^π‖_∞ ≤ ε + ‖V* − V^π‖_∞", "‖V* − V^π‖_∞ ≤ γ·ε + γ·(ε + ‖V* − V^π‖_∞)", "‖V* − V^π‖_∞ ≤ 2·γ·ε / (1 − γ)", "ε = 0,01, γ = 0,99: до 1,98"],
                        note: "По выборке: табличное Q-обучение — зашумлённая асинхронная итерация по ценностям для Q. Оно сходится к Q* с вероятностью 1, если каждая пара (s, a) обновляется бесконечно часто, а шаг α_n на n-м её обновлении таков, что Σ α_n = ∞ и Σ α_n² < ∞: 1/n подходит, постоянный шаг — нет. С аппроксимацией функций эта гарантия пропадает."
                    }
                },
                {
                    type: "number", answer: 1.7, tolerance: 0.005, card: "t8b",
                    en: {
                        q: "γ = 0.9; the table defines a deterministic MDP. The estimate V(A) = 10.1, V(B) = 9.9 is within 0.1 of V* in both states. π is greedy for V: it takes the action with the largest r + γ·V(next state). What is V*(A) − V^π(A)?",
                        table: { head: ["State", "Action", "Reward r", "Next state"], rows: [["A", "go", "1", "B"], ["A", "stay", "0.83", "A"], ["B", "wait", "1", "B"]] },
                        hint: "Find V*(B) and V*(A) first. Then compare the two actions in A the way π does, with V in place of V*, and compute the value of the policy that results.",
                        why: "V*(B) = 1/(1 − 0.9) = 10 and V*(A) = 1 + 0.9·10 = 10 (go). Greedy for V in A: go 1 + 0.9·9.9 = 9.91, stay 0.83 + 0.9·10.1 = 9.92, so π stays for ever: V^π(A) = 0.83/0.1 = 8.3. An error of 0.1 costs 1.7. The general bound 2·γ·ε/(1 − γ) is 1.8 here; a reward of 0.82 and a tie broken towards “stay” attain it."
                    },
                    ru: {
                        q: "γ = 0,9; в таблице — детерминированный MDP. Оценка V(A) = 10,1, V(B) = 9,9 всюду отличается от V* не больше чем на 0,1. π жадная относительно V: берёт действие с наибольшим r + γ·V(следующее состояние). Чему равно V*(A) − V^π(A)?",
                        table: { head: ["Состояние", "Действие", "Награда r", "Следующее состояние"], rows: [["A", "идти", "1", "B"], ["A", "остаться", "0,83", "A"], ["B", "ждать", "1", "B"]] },
                        hint: "Сначала найди V*(B) и V*(A). Затем сравни два действия в A так, как это делает π, то есть с V вместо V*, и вычисли ценность получившейся политики.",
                        why: "V*(B) = 1/(1 − 0,9) = 10 и V*(A) = 1 + 0,9·10 = 10 (идти). Жадный выбор по V в A: идти — 1 + 0,9·9,9 = 9,91, остаться — 0,83 + 0,9·10,1 = 9,92, и π остаётся навсегда: V^π(A) = 0,83/0,1 = 8,3. Ошибка 0,1 стоит 1,7. Общая оценка 2·γ·ε/(1 − γ) здесь равна 1,8; она достигается при награде 0,82, если при равенстве выбрать «остаться»."
                    }
                },
                {
                    type: "number", answer: 60, tolerance: 0,
                    en: {
                        q: "Linear values v(s) = w·φ(s), φ(s_1) = 1, φ(s_2) = 2. Only the transition s_1 → s_2 (reward r = 0) is updated: w ← w + α·(r + γ·v(s_2) − v(s_1))·φ(s_1). γ = 0.9, α = 0.1, w = 1 at first. After how many updates does w exceed 100?",
                        hint: "Put v(s_1) = w and v(s_2) = 2·w into the update: it multiplies w by a constant factor. Then solve (factor)^n > 100.",
                        why: "This TD update is w ← (1 + α·(2γ − 1))·w = 1.08·w; 1.08^n > 100 once n > ln 100 / ln 1.08 = 59.8: 60 updates. With all rewards 0, w = 0 is exact, yet w diverges for any γ > ½. Bootstrapping (a target built from the estimate), function approximation and off-policy updates together, the “deadly triad”, can break convergence."
                    },
                    ru: {
                        q: "Оценка ценности v(s) = w·φ(s), φ(s_1) = 1, φ(s_2) = 2. Обновляют только переход s_1 → s_2 (награда r = 0): w ← w + α·(r + γ·v(s_2) − v(s_1))·φ(s_1). γ = 0,9, α = 0,1, вначале w = 1. После скольких обновлений w превысит 100?",
                        hint: "Подставь v(s_1) = w и v(s_2) = 2·w в правило: оно умножает w на постоянный множитель. Затем реши неравенство (множитель)^n > 100.",
                        why: "Правило TD: w ← (1 + α·(2γ − 1))·w = 1,08·w; 1,08^n > 100 при n > ln 100 / ln 1,08 = 59,8: 60 обновлений. При нулевых наградах точен w = 0, но w расходится при любом γ > ½. Бутстрэппинг (цель из оценки), аппроксимация функций и обновления вне политики вместе — «смертельная триада» (deadly triad) — могут нарушить сходимость."
                    }
                },
                {
                    type: "info", icon: "🎰", mono: true,
                    en: {
                        title: "Exploration has a price: regret",
                        text: [
                            "Q-learning's guarantee asks that every action be tried again and again; it does not say what that costs. The cleanest model of the cost is the **bandit** with K arms: pulling arm i gives an independent reward in [0, 1] with unknown mean μ_i. Over T rounds, **regret** is what is lost against always pulling the best arm (line 1).",
                            "With ε-greedy and a fixed ε, a uniformly random arm is pulled in a share ε of the rounds, for ever: the regret is linear in T (line 2). **UCB1** is optimistic instead: after one pull of each arm, it pulls the arm with the largest upper confidence bound (line 3). A bad arm is pulled only while its bound is still wide.",
                            "Lines 4 and 5 are the theorem for UCB1: for fixed gaps Δ_i its regret is logarithmic in T. Whatever the gaps, its regret is at most of the order of √(K·T·ln T), and no algorithm can guarantee less than the order of √(K·T) on every bandit."
                        ],
                        example: ["gap Δ_i = μ* − μ_i, μ* = max_i μ_i; regret R_T = T·μ* − E[sum of rewards] = Σ_i Δ_i·E[n_i]", "ε-greedy with a fixed ε: R_T ≥ ε·T·(Δ_1 + … + Δ_K) / K", "UCB1 index of arm i after t pulls in total: μ̂_i + √(2·ln t / n_i)", "UCB1: E[n_i] ≤ 8·ln T / Δ_i² + c for every arm with Δ_i > 0", "UCB1: R_T ≤ 8·Σ_(Δ_i > 0) ln T / Δ_i + c·Σ_i Δ_i, c = 1 + π²/3 ≈ 4.29"],
                        note: "n_i is the number of pulls of arm i so far (in lines 1 and 4: after all T rounds), μ̂_i the mean of its rewards; in c, π is the number 3.14… The radius comes from Hoeffding's inequality: a mean of n rewards in [0, 1] exceeds its expectation by u with probability at most exp(−2·n·u²), which is t^(−4) for u = √(2·ln t / n)."
                    },
                    ru: {
                        title: "У исследования есть цена: сожаление",
                        text: [
                            "Гарантия Q-обучения требует пробовать каждое действие снова и снова, но не говорит, чего это стоит. Простейшая модель — **многорукий бандит** с K ручками: ручка i выдаёт независимые награды из [0; 1] с неизвестным средним μ_i. **Сожаление** (regret) за T раундов — потеря по сравнению с игрой только на лучшей ручке (строка 1).",
                            "При ε-жадной стратегии с постоянным ε в доле ε раундов ручку выбирают равновероятно, и так всегда: сожаление линейно по T (строка 2). **UCB1** действует оптимистично: дёрнув каждую ручку по разу, он выбирает ручку с наибольшей верхней доверительной границей (строка 3). Плохую ручку он выбирает, лишь пока её граница широка.",
                            "Строки 4 и 5 — теорема для UCB1: при фиксированных разрывах Δ_i его сожаление логарифмическое по T. При любых разрывах оно не больше порядка √(K·T·ln T), и ни один алгоритм не может гарантировать на всех бандитах меньше, чем порядка √(K·T)."
                        ],
                        example: ["разрыв (gap) Δ_i = μ* − μ_i, μ* = max_i μ_i; сожаление R_T = T·μ* − E[сумма наград] = Σ_i Δ_i·E[n_i]", "ε-жадная стратегия с постоянным ε: R_T ≥ ε·T·(Δ_1 + … + Δ_K) / K", "индекс UCB1 ручки i после t выборов всего: μ̂_i + √(2·ln t / n_i)", "UCB1: E[n_i] ≤ 8·ln T / Δ_i² + c для каждой ручки с Δ_i > 0", "UCB1: R_T ≤ 8·Σ_(Δ_i > 0) ln T / Δ_i + c·Σ_i Δ_i, c = 1 + π²/3 ≈ 4,29"],
                        note: "n_i — сколько раз ручку i выбрали к данному моменту (в строках 1 и 4 — за все T раундов), μ̂_i — среднее её наград; в константе c стоит число π = 3,14… Радиус взят из неравенства Хёфдинга: среднее n наград из [0; 1] превышает своё ожидание на u с вероятностью не больше exp(−2·n·u²), а это t^(−4) при u = √(2·ln t / n)."
                    }
                },
                {
                    type: "number", answer: 1.46, tolerance: 0.005, card: "t8c",
                    en: {
                        q: "UCB1 pulls the arm with the largest index μ̂ + √(2·ln t / n), where μ̂ is the arm's mean reward so far, n its number of pulls and t the total number of pulls. Here t = 100. What is the index of the arm pulled next? Two decimals.",
                        table: { head: ["Arm", "Mean reward μ̂", "Pulls n"], rows: [["1", "0.8", "90"], ["2", "0.5", "10"]] },
                        hint: "Compute both indices, with ln 100 ≈ 4.605. The arm with fewer pulls gets the wider bonus.",
                        why: "Arm 1: 0.8 + √(2·4.605/90) = 0.8 + 0.32 = 1.12. Arm 2: 0.5 + √(2·4.605/10) = 0.5 + 0.96 = 1.46. UCB1 pulls arm 2, the one that looks worse: 10 pulls leave its mean uncertain. If it really is worse by Δ, each pull narrows its bonus, and about 8·ln T / Δ² pulls are enough to rule it out."
                    },
                    ru: {
                        q: "UCB1 выбирает ручку с наибольшим индексом μ̂ + √(2·ln t / n), где μ̂ — средняя награда ручки, n — число её выборов, t — общее число выборов. Сейчас t = 100. Чему равен индекс ручки, которую выберут следующей? Округли до сотых.",
                        table: { head: ["Ручка", "Средняя награда μ̂", "Выборов n"], rows: [["1", "0,8", "90"], ["2", "0,5", "10"]] },
                        hint: "Вычисли оба индекса, ln 100 ≈ 4,605. У ручки, которую выбирали реже, надбавка шире.",
                        why: "Ручка 1: 0,8 + √(2·4,605/90) = 0,8 + 0,32 = 1,12. Ручка 2: 0,5 + √(2·4,605/10) = 0,5 + 0,96 = 1,46. UCB1 выбирает ручку 2, которая выглядит хуже: после 10 выборов её среднее ещё ненадёжно. Если она действительно хуже на Δ, надбавка сужается с каждым выбором, и около 8·ln T / Δ² выборов хватает, чтобы её отсеять."
                    }
                },
                {
                    type: "number", answer: 858, tolerance: 2,
                    en: {
                        q: "Two arms with gap Δ, T = 10,000 rounds. UCB1's regret is at most Δ·T and at most about 8·ln T / Δ (the leading term of its bound). How large can the smaller of these two bounds get, over all gaps Δ? Round to a whole number.",
                        hint: "One bound grows with Δ, the other falls: their minimum is largest where they cross. Solve Δ·T = 8·ln T / Δ, then put that Δ back into either bound.",
                        why: "No pull loses more than Δ, hence Δ·T. The bounds cross at Δ² = 8·ln T / T = 8·9.2103/10000 = 0.007368, Δ = 0.0858, where both equal √(8·T·ln T) = 858. Small gaps cost little per pull, large ones are detected fast; gaps near √(ln T / T) are the hard ones. So over all gaps the guarantee grows like √(T·ln T), not like ln T."
                    },
                    ru: {
                        q: "Две ручки с разрывом Δ, T = 10 000 раундов. Сожаление UCB1 не больше Δ·T и не больше примерно 8·ln T / Δ (главный член его оценки). Каким наибольшим может быть меньшая из этих двух оценок по всем разрывам Δ? Округли до целого.",
                        hint: "Одна оценка растёт с Δ, другая убывает: их минимум наибольший там, где они пересекаются. Реши Δ·T = 8·ln T / Δ и подставь найденное Δ в любую из оценок.",
                        why: "Ни один выбор не теряет больше Δ, отсюда Δ·T. Оценки пересекаются при Δ² = 8·ln T / T = 8·9,2103/10 000 = 0,007368, Δ = 0,0858; там обе равны √(8·T·ln T) = 858. Малые разрывы дёшевы за один выбор, большие быстро обнаруживаются; трудны разрывы около √(ln T / T). Поэтому по всем Δ гарантия растёт как √(T·ln T), а не как ln T."
                    }
                },
                {
                    type: "info", icon: "🧭", mono: true,
                    en: {
                        title: "Comparing two policies exactly",
                        text: [
                            "Now the policy itself. Let J(π) be the expected return of π from a given distribution of the start state, and d^π the **discounted state distribution** of π (line 1): how often π is in s, with the weight γ^t on time t. As before, A^π(s, a) = Q^π(s, a) − V^π(s) is the advantage.",
                            "The **performance difference lemma** (line 2) is an identity for any two policies, not an approximation: the gain of π′ over π is the advantage A^π of the actions of π′, averaged over the states that π′ itself visits, times 1/(1 − γ).",
                            "But data and advantage estimates come from the states of π. Putting d^π in place of d^π′ gives a **surrogate** (line 3) that can be trusted only while π′ stays close to π: the reason for trust regions and for PPO's clipping. Line 4 is the **policy gradient theorem**: no derivative of d^π appears in it, although d^π depends on θ."
                        ],
                        example: ["d^π(s) = (1 − γ)·Σ_t γ^t·P(s_t = s | π), t = 0, 1, 2, …", "J(π′) − J(π) = (1/(1 − γ))·E[A^π(s, a)], s ~ d^π′, a ~ π′(· | s)", "surrogate: (1/(1 − γ))·E[A^π(s, a)], s ~ d^π, a ~ π′(· | s)", "∇_θ J(π_θ) = (1/(1 − γ))·E[∇_θ ln π_θ(a | s)·Q^π(s, a)], s ~ d^π, a ~ π_θ, π = π_θ"],
                        note: "Proof of the lemma: along a trajectory of π′, the sum over t of γ^t·(r_t + γ·V^π(s_(t+1)) − V^π(s_t)) telescopes to the return minus V^π(s_0). Take expectations: given s_t and a_t, the bracket has the mean A^π(s_t, a_t)."
                    },
                    ru: {
                        title: "Точное сравнение двух политик",
                        text: [
                            "Теперь о самой политике. Пусть J(π) — ожидаемая отдача политики π при заданном распределении начального состояния, а d^π — **дисконтированное распределение состояний** политики π (строка 1): как часто π оказывается в s, с весом γ^t для момента t. Как и раньше, A^π(s, a) = Q^π(s, a) − V^π(s) — преимущество.",
                            "**Лемма о разности качества политик** (performance difference lemma, строка 2) — тождество для любых двух политик, а не приближение: выигрыш π′ по сравнению с π — это преимущество A^π действий π′, усреднённое по состояниям, которые посещает сама π′, и умноженное на 1/(1 − γ).",
                            "Но данные и оценки преимуществ получены на состояниях π. Замена d^π′ на d^π даёт **суррогат** (surrogate, строка 3), которому можно доверять, лишь пока π′ близка к π: отсюда доверительные области (trust region) и обрезка в PPO. Строка 4 — **теорема о градиенте по политике**: производной d^π в ней нет, хотя d^π зависит от θ."
                        ],
                        example: ["d^π(s) = (1 − γ)·Σ_t γ^t·P(s_t = s | π), t = 0, 1, 2, …", "J(π′) − J(π) = (1/(1 − γ))·E[A^π(s, a)], s ~ d^π′, a ~ π′(· | s)", "суррогат: (1/(1 − γ))·E[A^π(s, a)], s ~ d^π, a ~ π′(· | s)", "∇_θ J(π_θ) = (1/(1 − γ))·E[∇_θ ln π_θ(a | s)·Q^π(s, a)], s ~ d^π, a ~ π_θ, π = π_θ"],
                        note: "Доказательство леммы: вдоль траектории политики π′ сумма по t от γ^t·(r_t + γ·V^π(s_(t+1)) − V^π(s_t)) телескопическая и равна отдаче минус V^π(s_0). Берём математическое ожидание: при данных s_t и a_t среднее скобки равно A^π(s_t, a_t)."
                    }
                },
                {
                    type: "number", answer: 2.5, tolerance: 0.03,
                    en: {
                        q: "γ = 0.8, the start state is A, and the table lists all transitions. π always stays in A. π′ moves with probability 0.5 each time it is in A, and stays otherwise. Use the performance difference lemma to find J(π′) − J(π).",
                        table: { head: ["State", "Action", "Reward r", "Next state"], rows: [["A", "stay", "1", "A"], ["A", "move", "0", "B"], ["B", "wait", "2", "B"]] },
                        hint: "Only state A counts: B has a single action, so its advantage is 0. Find A^π(A, move), then d^π′(A) = (1 − γ)·Σ_t γ^t·P(s_t = A), a geometric series.",
                        why: "V^π(A) = 5 and V^π(B) = 10, so A^π(A, move) = 0 + 0.8·10 − 5 = 3 and A^π(A, stay) = 0: the mean over a ~ π′ is 1.5. Under π′, P(s_t = A) = 0.5^t, so d^π′(A) = 0.2/(1 − 0.4) = 1/3. J(π′) − J(π) = 5·(1/3)·1.5 = 2.5 (directly: 7.5 − 5). The surrogate, with d^π(A) = 1, says 7.5, though no policy gains more than 3."
                    },
                    ru: {
                        q: "γ = 0,8, начальное состояние — A, в таблице все переходы. Политика π всегда остаётся в A, а π′ в состоянии A каждый раз уходит с вероятностью 0,5, иначе остаётся. Найди J(π′) − J(π) с помощью леммы о разности качества политик.",
                        table: { head: ["Состояние", "Действие", "Награда r", "Следующее состояние"], rows: [["A", "остаться", "1", "A"], ["A", "уйти", "0", "B"], ["B", "ждать", "2", "B"]] },
                        hint: "Важно только состояние A: в B действие одно, и его преимущество равно 0. Найди A^π(A, уйти), а затем d^π′(A) = (1 − γ)·Σ_t γ^t·P(s_t = A): это геометрическая прогрессия.",
                        why: "V^π(A) = 5 и V^π(B) = 10, поэтому A^π(A, уйти) = 0 + 0,8·10 − 5 = 3, а A^π(A, остаться) = 0: среднее по a ~ π′ равно 1,5. При π′ P(s_t = A) = 0,5^t, так что d^π′(A) = 0,2/(1 − 0,4) = 1/3. J(π′) − J(π) = 5·(1/3)·1,5 = 2,5 (напрямую: 7,5 − 5). Суррогат, где d^π(A) = 1, даёт 7,5, хотя ни одна политика не выигрывает больше 3."
                    }
                },
                {
                    type: "choice", card: "t8d",
                    en: {
                        q: "Lemma: J(π′) − J(π) = E[A^π(s, a)]/(1 − γ), with s from the states π′ visits and a ~ π′. Find the flaw: (1) on the states π visits, actions a ~ π′ have a positive mean A^π; (2) so the lemma's mean is positive; (3) so J(π′) > J(π).",
                        options: ["In (2): the lemma averages over the states that π′ visits, and π′ may leave the states of π", "In (2): the lemma needs actions drawn from π, the policy whose advantage A^π it uses", "In (1): A^π(s, a) is defined only for the actions that π itself can take in state s", "In (3): the lemma is a first-order approximation, so it holds only for π′ close to π"],
                        hint: "Set (1) beside the lemma: each averages A^π over some states and some actions. Are the two averages the same?",
                        why: "The lemma is exact for any two policies; A^π(s, a) = Q^π(s, a) − V^π(s) is defined for every action, and for a ~ π its mean is 0. The flaw is in (2): the states must come from π′. On the states of π the mean can be positive while π′ drifts to where it acts badly. Hence trust regions and PPO's clipping: both keep π′ near π."
                    },
                    ru: {
                        q: "Лемма: J(π′) − J(π) = E[A^π(s, a)]/(1 − γ), s — из состояний, посещаемых π′, a ~ π′. Где ошибка? (1) На состояниях, посещаемых π, среднее A^π при a ~ π′ положительно; (2) тогда и в лемме оно положительно; (3) тогда J(π′) > J(π).",
                        options: ["В (2): лемма усредняет по состояниям, которые посещает π′, а π′ может уйти от состояний π", "В (2): лемме нужны действия из π — той политики, чьё преимущество A^π в ней стоит", "В (1): A^π(s, a) определено только для действий, которые сама π может выбрать в s", "В (3): лемма — приближение первого порядка и верна только для π′, близких к π"],
                        hint: "Поставь (1) рядом с леммой: и там, и там A^π усредняется по каким-то состояниям и действиям. Одинаковы ли эти два усреднения?",
                        why: "Лемма точна для любых двух политик; A^π(s, a) = Q^π(s, a) − V^π(s) определено для любого действия, и при a ~ π его среднее равно 0. Ошибка в (2): состояния нужны от π′. На состояниях π среднее может быть положительным, а π′ уходит туда, где действует плохо. Отсюда доверительные области и обрезка в PPO: они держат π′ вблизи π."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge, on paper. Derive the policy gradient theorem from the performance difference lemma: take π = π_θ and π′ = π_(θ+δ), and let δ → 0. Why does no derivative of d^π appear, although the state distribution depends on θ?",
                        answer: [
                            "Write the lemma as J(θ + δ) − J(θ) = (1/(1 − γ))·Σ_s d_δ(s)·g_s(δ), where d_δ is the state distribution of π_(θ+δ) and g_s(δ) = Σ_a π_(θ+δ)(a | s)·A^π(s, a). The idea: g_s(0) = Σ_a π_θ(a | s)·A^π(s, a) = 0 in every state, because V^π is the average of Q^π over a ~ π.",
                            "So the product rule at δ = 0 gives ∇(d_δ·g_s) = ∇d_δ·g_s(0) + d^π(s)·∇g_s(0), and the first term vanishes: ∇J = (1/(1 − γ))·Σ_s d^π(s)·Σ_a ∇π_θ(a | s)·A^π(s, a). With ∇π_θ = π_θ·∇ ln π_θ this is the theorem with A^π in place of Q^π; the two agree because Σ_a ∇π_θ(a | s) = 0.",
                            "The same fact explains the surrogate: it differs from the lemma only by d^π in place of d_δ, so at δ = 0 it has the value 0 and the gradient ∇J. It agrees with J(π′) − J(π) to first order; the mismatch of the states enters only at second order, and a trust region keeps that term small."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой, на бумаге. Выведи теорему о градиенте по политике из леммы о разности качества политик: возьми π = π_θ, π′ = π_(θ+δ), δ → 0. Почему в ней нет производной d^π, хотя распределение состояний зависит от θ?",
                        answer: [
                            "Запишем лемму так: J(θ + δ) − J(θ) = (1/(1 − γ))·Σ_s d_δ(s)·g_s(δ), где d_δ — распределение состояний политики π_(θ+δ), а g_s(δ) = Σ_a π_(θ+δ)(a | s)·A^π(s, a). Идея: g_s(0) = Σ_a π_θ(a | s)·A^π(s, a) = 0 в каждом состоянии, ведь V^π — среднее Q^π по a ~ π.",
                            "Поэтому правило произведения при δ = 0 даёт ∇(d_δ·g_s) = ∇d_δ·g_s(0) + d^π(s)·∇g_s(0), и первое слагаемое исчезает: ∇J = (1/(1 − γ))·Σ_s d^π(s)·Σ_a ∇π_θ(a | s)·A^π(s, a). Так как ∇π_θ = π_θ·∇ ln π_θ, это теорема с A^π вместо Q^π; разницы нет, потому что Σ_a ∇π_θ(a | s) = 0.",
                            "Тот же факт объясняет суррогат: он отличается от леммы только тем, что вместо d_δ стоит d^π, поэтому при δ = 0 его значение равно 0, а градиент равен ∇J. С J(π′) − J(π) он совпадает в первом порядке; несовпадение состояний сказывается лишь во втором порядке, и доверительная область удерживает этот член малым."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "The Bellman optimality operator is a γ-contraction in the maximum norm: `‖T·V − T·U‖_∞ ≤ γ·‖V − U‖_∞`. So V* is its only fixed point, value iteration obeys `‖V_k − V*‖_∞ ≤ γ^k·‖V_0 − V*‖_∞`, and with rewards in [0, R_max] all values lie in [0, R_max/(1 − γ)].",
                            "The horizon multiplies errors: if ‖V − V*‖_∞ ≤ ε, a policy that is greedy for V can lose up to `2·γ·ε/(1 − γ)`. Tabular Q-learning converges if every pair is updated infinitely often and its steps satisfy Σα_n = ∞, Σα_n² < ∞; with bootstrapping, function approximation and off-policy updates together, the weights can diverge.",
                            "Bandits: regret `R_T = Σ_i Δ_i·E[n_i]`. ε-greedy with a fixed ε has linear regret. UCB1, with the index `μ̂_i + √(2·ln t / n_i)`, has regret of the order of Σ ln T / Δ_i and, whatever the gaps, at most of the order of √(K·T·ln T); no algorithm beats the order √(K·T) in the worst case.",
                            "Performance difference lemma: `J(π′) − J(π) = (1/(1 − γ))·E[A^π(s, a)]` with s ~ d^π′, a ~ π′, exactly. With the states of π it is a surrogate, right only to first order; its gradient at π′ = π is the policy gradient `(1/(1 − γ))·E[∇ ln π_θ(a | s)·Q^π(s, a)]`."
                        ]
                    },
                    ru: {
                        points: [
                            "Оператор оптимальности Беллмана — сжатие с коэффициентом γ в равномерной норме: `‖T·V − T·U‖_∞ ≤ γ·‖V − U‖_∞`. Поэтому V* — его единственная неподвижная точка, для итерации по ценностям `‖V_k − V*‖_∞ ≤ γ^k·‖V_0 − V*‖_∞`, а при наградах из [0; R_max] все ценности лежат в [0; R_max/(1 − γ)].",
                            "Горизонт умножает ошибки: если ‖V − V*‖_∞ ≤ ε, политика, жадная относительно V, может потерять до `2·γ·ε/(1 − γ)`. Табличное Q-обучение сходится, если каждая пара обновляется бесконечно часто и для её шагов Σα_n = ∞, Σα_n² < ∞; при бутстрэппинге, аппроксимации функций и обновлениях вне политики вместе веса могут расходиться.",
                            "Бандиты: сожаление `R_T = Σ_i Δ_i·E[n_i]`. У ε-жадной стратегии с постоянным ε оно линейное. У UCB1 с индексом `μ̂_i + √(2·ln t / n_i)` сожаление порядка Σ ln T / Δ_i и при любых разрывах не больше порядка √(K·T·ln T); в худшем случае ни один алгоритм не улучшит порядок √(K·T).",
                            "Лемма о разности качества политик: `J(π′) − J(π) = (1/(1 − γ))·E[A^π(s, a)]`, где s ~ d^π′, a ~ π′, — точное равенство. С состояниями π это суррогат, верный лишь в первом порядке; его градиент при π′ = π — градиент по политике `(1/(1 − γ))·E[∇ ln π_θ(a | s)·Q^π(s, a)]`."
                        ]
                    }
                }
            ]
        },

        /* ----- t9. Transformers in theory: what attention can and cannot compute ----- */
        t9: {
            steps: [
                {
                    type: "info", icon: "🔍", mono: true,
                    en: {
                        title: "Attention is kernel smoothing",
                        text: [
                            "For a query vector q, an attention head compares q with the keys k_1 … k_n and returns a weighted average of their values v_j (line 1). The weights are a softmax of the scores q·k_j divided by a **temperature** τ; the usual scaling by √d_k is the choice τ = √d_k.",
                            "Statistics knows this form as **kernel smoothing**, the Nadaraya–Watson estimator (line 2): predict at x by averaging the observed y_j with weights from a similarity kernel K. Here K is exp(q·k/τ). For keys of equal length, the weights are exactly those of a Gaussian kernel in the distance ‖q − k‖ with bandwidth √τ (line 3).",
                            "So τ sets the width of the smoother. As τ → 0, all weight goes to the key with the largest score (if there is only one such key): a lookup by key. As τ → ∞, every weight tends to 1/n: the plain mean of the values. A trained head works in between, and learns what to compare and what to return."
                        ],
                        example: ["out(q) = Σ_j w_j·v_j, w_j = exp(q·k_j / τ) / Σ_l exp(q·k_l / τ)", "Nadaraya–Watson: f(x) = Σ_j K(x, x_j)·y_j / Σ_l K(x, x_l)", "‖k_j‖ = c for all j: w_j = exp(−‖q − k_j‖² / (2τ)) / Σ_l exp(−‖q − k_l‖² / (2τ))", "scores (2, 0), values (10, 0), τ = 1: w = (0.881, 0.119), out = 8.81"],
                        note: "Line 3: q·k = (‖q‖² + ‖k‖² − ‖q − k‖²)/2. The factor exp(‖q‖²/(2τ)) is the same for every key and always cancels in the softmax; exp(‖k_j‖²/(2τ)) cancels only if the keys have equal length. Otherwise longer keys get extra weight."
                    },
                    ru: {
                        title: "Внимание — это ядерное сглаживание",
                        text: [
                            "Для вектора-запроса q голова внимания сравнивает q с ключами k_1 … k_n и выдаёт взвешенное среднее их значений v_j (строка 1). Веса — это softmax от оценок q·k_j, делённых на **температуру** τ; обычное деление на √d_k — это выбор τ = √d_k.",
                            "В статистике это **ядерное сглаживание** (kernel smoothing), или оценка Надарая — Ватсона (строка 2): прогноз в точке x — среднее наблюдений y_j с весами от ядра сходства K. Здесь K = exp(q·k/τ). Если все ключи одной длины, веса в точности те же, что у гауссова ядра от расстояния ‖q − k‖ с шириной окна √τ (строка 3).",
                            "Значит, τ задаёт ширину сглаживания. При τ → 0 весь вес уходит ключу с наибольшей оценкой (если такой ключ один): это поиск по ключу. При τ → ∞ каждый вес стремится к 1/n: получается обычное среднее значений. Обученная голова работает между этими крайностями и учится тому, что сравнивать и что выдавать."
                        ],
                        example: ["out(q) = Σ_j w_j·v_j, w_j = exp(q·k_j / τ) / Σ_l exp(q·k_l / τ)", "Надарая — Ватсон: f(x) = Σ_j K(x, x_j)·y_j / Σ_l K(x, x_l)", "‖k_j‖ = c при всех j: w_j = exp(−‖q − k_j‖² / (2τ)) / Σ_l exp(−‖q − k_l‖² / (2τ))", "оценки (2; 0), значения (10; 0), τ = 1: w = (0,881; 0,119), out = 8,81"],
                        note: "Строка 3: q·k = (‖q‖² + ‖k‖² − ‖q − k‖²)/2. Множитель exp(‖q‖²/(2τ)) одинаков для всех ключей и всегда сокращается в softmax, а exp(‖k_j‖²/(2τ)) сокращается, только если ключи одной длины. Иначе более длинные ключи получают дополнительный вес."
                    }
                },
                {
                    type: "number", answer: 2.46, tolerance: 0.005, card: "t9a",
                    en: {
                        q: "Attention returns Σ_j w_j·v_j with the weights w = softmax(q·k_j / τ). Query q = (1, 1); keys k_1 = (1, 1), k_2 = (1, −1); values v_1 = 3, v_2 = 1; temperature τ = 2. What is the output? Two decimal places.",
                        hint: "Three steps: the two dot products, their softmax after dividing by τ, then the weighted average of the values.",
                        why: "Scores: q·k_1 = 2 and q·k_2 = 0; divided by τ = 2: (1, 0). Weights: e/(e + 1) = 0.731 and 0.269. Output: 0.731·3 + 0.269·1 = 2.46. It lies between the lookup value 3 (τ → 0) and the plain mean 2 (τ → ∞): the temperature sets the bandwidth of the smoother."
                    },
                    ru: {
                        q: "Внимание выдаёт Σ_j w_j·v_j с весами w = softmax(q·k_j / τ). Запрос q = (1; 1); ключи k_1 = (1; 1), k_2 = (1; −1); значения v_1 = 3, v_2 = 1; температура τ = 2. Чему равен выход? Округли до сотых.",
                        hint: "Три шага: два скалярных произведения, softmax от них после деления на τ, затем взвешенное среднее значений.",
                        why: "Оценки: q·k_1 = 2 и q·k_2 = 0; после деления на τ = 2: (1; 0). Веса: e/(e + 1) = 0,731 и 0,269. Выход: 0,731·3 + 0,269·1 = 2,46. Он лежит между значением при поиске по ключу, 3 (τ → 0), и обычным средним, 2 (τ → ∞): температура задаёт ширину окна сглаживания."
                    }
                },
                {
                    type: "number", answer: 11.5, tolerance: 0.05,
                    en: {
                        q: "A context holds 1001 keys. One key has the score s with the query, and the other 1000 keys all have the score 0 (τ = 1). At what s does that one key get a softmax weight of exactly 0.99? One decimal place.",
                        hint: "Write the weight as e^s/(e^s + 1000), set it equal to 0.99 and solve for e^s first.",
                        why: "e^s/(e^s + 1000) = 0.99 gives e^s = 99·1000, so s = ln 99 + ln 1000 = 4.595 + 6.908 = 11.5. In general s = ln(n − 1) + ln(p/(1 − p)): the gap needed to focus on one key grows like ln n. If all scores lie in [−B, B], no key gets more than e^(2B)/n: in a long context such a head can only average."
                    },
                    ru: {
                        q: "В контексте 1001 ключ. У одного ключа оценка с запросом равна s, у остальных 1000 ключей она равна 0 (τ = 1). При каком s этот один ключ получит вес softmax ровно 0,99? Округли до десятых.",
                        hint: "Запиши вес как e^s/(e^s + 1000), приравняй к 0,99 и сначала найди e^s.",
                        why: "Из e^s/(e^s + 1000) = 0,99 следует e^s = 99·1000, и s = ln 99 + ln 1000 = 4,595 + 6,908 = 11,5. В общем случае s = ln(n − 1) + ln(p/(1 − p)): разрыв, нужный для одного ключа, растёт как ln n. Если все оценки лежат в [−B; B], ни один ключ не получит больше e^(2B)/n: в длинном контексте такая голова может только усреднять."
                    }
                },
                {
                    type: "info", icon: "🔀", mono: true,
                    en: {
                        title: "One layer as matrices: symmetry, rank, size",
                        text: [
                            "Put the n tokens into the rows of a matrix X (n × d). A head with the projections W_Q, W_K (each d × d_k) and W_V (d × d: the value projection times the output projection) computes all outputs at once (lines 1 and 2). The temperature is absorbed into A; there is no mask and no positional signal.",
                            "A map F is **permutation-equivariant** if F(P·X) = P·F(X) for every permutation matrix P: reordering the tokens only reorders the outputs. The attention of lines 1 and 2 has this symmetry (line 3), and so has any stack of such layers and per-token MLPs: it cannot see word order. Positional encodings break it on purpose.",
                            "Rank: S = (X·W_Q)·(X·W_K)^T is an n × d_k matrix times a d_k × n matrix, so rank S ≤ d_k however long the sequence is. Size: with h heads of size d_k = d/h, the query, key, value and output projections hold 4·d² weights together, whatever h is; an MLP of hidden width 4d adds 8·d² (line 4, biases and norms left out)."
                        ],
                        example: ["scores: S = X·A·X^T, A = W_Q·W_K^T (d × d, rank ≤ d_k)", "Att(X) = softmax(S)·X·W_V, softmax over each row", "Att(P·X) = P·Att(X) for every permutation matrix P", "one block: 4·d² + 2·(d·4d) = 12·d² weights; d = 1000: 12 million"],
                        note: "More heads at a fixed width d: the same number of weights, split into more score matrices, each of rank at most d/h."
                    },
                    ru: {
                        title: "Один слой в матрицах: симметрия, ранг, размер",
                        text: [
                            "Запишем n токенов в строки матрицы X (n × d). Голова с проекциями W_Q, W_K (каждая d × d_k) и W_V (d × d: произведение проекции значений и выходной проекции) вычисляет все выходы сразу (строки 1 и 2). Температура включена в A; ни маски, ни позиционного сигнала нет.",
                            "Отображение F **эквивариантно относительно перестановок** (permutation-equivariant), если F(P·X) = P·F(X) для любой матрицы перестановки P: выходы лишь переставляются. Таковы внимание из строк 1 и 2 (строка 3) и стек таких слоёв с потокенными MLP: порядка слов он не видит. Позиционные кодировки намеренно нарушают эту симметрию.",
                            "Ранг: S = (X·W_Q)·(X·W_K)^T — произведение матриц n × d_k и d_k × n, поэтому rank S ≤ d_k при любой длине входа. Размер: при h головах размера d_k = d/h проекции запросов, ключей, значений и выходная вместе содержат 4·d² весов при любом h; MLP со скрытой шириной 4d добавляет 8·d² (строка 4, без смещений и нормализаций)."
                        ],
                        example: ["оценки: S = X·A·X^T, A = W_Q·W_K^T (d × d, ранг ≤ d_k)", "Att(X) = softmax(S)·X·W_V, softmax по каждой строке", "Att(P·X) = P·Att(X) для любой матрицы перестановки P", "один блок: 4·d² + 2·(d·4d) = 12·d² весов; d = 1000: 12 миллионов"],
                        note: "Больше голов при той же ширине d: весов столько же, но они делятся на большее число матриц оценок, и ранг каждой не больше d/h."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Self-attention without masks and positions: Att(X) = softmax(S)·X·W_V with the scores S = X·A·X^T and the softmax over each row. Order the proof that Att(P·X) = P·Att(X) for every permutation matrix P.",
                        items: ["With P·X in place of X, the scores become (P·X)·A·(P·X)^T = P·S·P^T", "Row i of this new score matrix is a row of S with its entries reordered in the way the tokens were", "Softmax treats a row's entries alike, so this reordering passes through: softmax(P·S·P^T) = P·softmax(S)·P^T", "Multiply these weights by the new values P·X·W_V: Att(P·X) = P·softmax(S)·P^T·P·X·W_V", "P^T·P = I for a permutation matrix, so Att(P·X) = P·softmax(S)·X·W_V = P·Att(X)"],
                        hint: "Follow the data through the layer: scores first, then weights, then the output. Each line uses the expression that the line before has produced.",
                        why: "The proof rests on two facts: softmax acts on each row and does not care where in the row an entry stands, and P^T·P = I. Nothing else about softmax is used: any rule that turns a row of scores into weights and treats its entries alike passes the same proof, such as linear attention, whose weights are the scores themselves."
                    },
                    ru: {
                        q: "Внимание без масок и позиций: Att(X) = softmax(S)·X·W_V с оценками S = X·A·X^T, softmax берётся по каждой строке. Расставь шаги доказательства того, что Att(P·X) = P·Att(X) для любой матрицы перестановки P.",
                        items: ["Если вместо X взять P·X, оценки станут равны (P·X)·A·(P·X)^T = P·S·P^T", "Строка i этой новой матрицы оценок — строка S, элементы которой переставлены так же, как токены", "Softmax не различает мест в строке, и эта перестановка выносится: softmax(P·S·P^T) = P·softmax(S)·P^T", "Умножим эти веса на новые значения P·X·W_V: Att(P·X) = P·softmax(S)·P^T·P·X·W_V", "Для матрицы перестановки P^T·P = I, поэтому Att(P·X) = P·softmax(S)·X·W_V = P·Att(X)"],
                        hint: "Иди за данными через слой: сначала оценки, потом веса, потом выход. Каждая строка использует выражение, полученное в предыдущей.",
                        why: "Доказательство держится на двух фактах: softmax действует на каждую строку и не различает, на каком месте в строке стоит элемент, а P^T·P = I. Больше от softmax ничего не нужно: подойдёт любое правило, которое превращает строку оценок в веса и не различает мест, например линейное внимание, где весами служат сами оценки."
                    }
                },
                {
                    type: "choice", card: "t9b",
                    en: {
                        q: "A plain self-attention layer that gets token vectors without positional encodings is permutation-equivariant: permuting the input tokens permutes the outputs in the same way. Which of these additions breaks that?",
                        options: ["A causal mask: each token may attend only to itself and to the tokens that come before it", "Several heads and a residual connection: head outputs are added to each token's own vector", "An MLP and a normalisation after the attention, applied to every token vector separately", "Scores that are not symmetric: W_Q differs from W_K, so the score of (i, j) is not that of (j, i)"],
                        hint: "Ask of each addition: once the tokens are reordered, does the new layer still do the same thing to every token and to every pair of tokens?",
                        why: "A causal mask M is tied to places: with unmasked scores S, X gets S + M but P·X gets P·S·P^T + M, not P·(S + M)·P^T. So a causal model senses order without positional encodings. The others keep the symmetry: per-token maps commute with P, sums of equivariant maps are equivariant, and equivariance never needed symmetric scores."
                    },
                    ru: {
                        q: "Простой слой внимания, получающий векторы токенов без позиционных кодировок, эквивариантен относительно перестановок: перестановка входных токенов так же переставляет выходы. Какое из этих дополнений это нарушает?",
                        options: ["Каузальная маска: токен может смотреть только на себя и на токены, которые стоят перед ним", "Несколько голов и остаточная связь: выходы голов прибавляются к собственному вектору токена", "MLP и нормализация после внимания, которые применяются к вектору каждого токена отдельно", "Несимметричные оценки: W_Q отличается от W_K, и оценка пары (i, j) не равна оценке пары (j, i)"],
                        hint: "Про каждое дополнение спроси: если токены переставить, будет ли новый слой делать то же самое с каждым токеном и с каждой парой токенов?",
                        why: "Маска M привязана к местам: при оценках S без маски у X будет S + M, а у P·X — P·S·P^T + M, а не P·(S + M)·P^T. Так каузальная модель чувствует порядок без позиционных кодировок. Остальное симметрию сохраняет: потокенные отображения перестановочны с P, сумма эквивариантных эквивариантна, а симметричность оценок не нужна."
                    }
                },
                {
                    type: "number", answer: 338, tolerance: 0,
                    en: {
                        q: "A transformer has width d = 1000 and 24 blocks, each with attention and an MLP of hidden width 4d. One 50,000 × d embedding matrix serves input and output. Biases and norms are left out. How many million weights does it have?",
                        hint: "Count one block first: four d × d projections in the attention and two matrices of d·4d weights in the MLP.",
                        why: "Attention: 4·d² = 4 million. MLP: 2·d·4d = 8·d² = 8 million. One block: 12·d² = 12 million; 24 blocks: 288 million. Embeddings: 50,000·1000 = 50 million. Total: 338 million, 85% of it in the blocks, and two thirds of every block in its MLP. The blocks' count grows like d² and does not depend on the number of heads."
                    },
                    ru: {
                        q: "У трансформера ширина d = 1000 и 24 блока, в каждом — внимание и MLP со скрытой шириной 4d. Одна матрица эмбеддингов 50 000 × d служит и входу, и выходу. Смещения и нормализации не считаем. Сколько у него миллионов весов?",
                        hint: "Сначала посчитай один блок: четыре проекции d × d во внимании и две матрицы по d·4d весов в MLP.",
                        why: "Внимание: 4·d² = 4 миллиона. MLP: 2·d·4d = 8·d² = 8 миллионов. Один блок: 12·d² = 12 миллионов; 24 блока: 288 миллионов. Эмбеддинги: 50 000·1000 = 50 миллионов. Всего 338 миллионов: 85% из них в блоках, а в каждом блоке две трети — в MLP. Число весов в блоках растёт как d² и не зависит от числа голов."
                    }
                },
                {
                    type: "info", icon: "📉", mono: true,
                    en: {
                        title: "In-context learning as one gradient step",
                        text: [
                            "**In-context learning**: the context holds examples (x_i, y_i), and the model predicts y for a query x_q without any change of its weights. A reference point that can be computed exactly: fit a linear predictor w·x to the examples by gradient descent on the squared loss of line 1, starting from w = 0.",
                            "One step with the rate η gives w_1 = η·Σ y_i·x_i (line 2). The prediction for the query is then a sum over the examples, each y_i weighted by x_i·x_q (line 3). This is attention without the softmax, **linear attention**: keys x_i, query x_q, values η·y_i. Kernel smoothing again, with the linear kernel and no normalisation.",
                            "What is proved: weights exist with which one linear attention layer computes exactly this step (line 4). What is observed: small transformers trained on linear regression behave much like it. Neither is a claim about how large language models learn in context in general."
                        ],
                        example: ["loss(w) = ½·Σ_i (w·x_i − y_i)², ∇loss(0) = −Σ_i y_i·x_i", "w_1 = 0 − η·∇loss(0) = η·Σ_i y_i·x_i", "ŷ = w_1·x_q = η·Σ_i y_i·(x_i·x_q)", "tokens e_i = (x_i, y_i), e_q = (x_q, 0); score e_i^T·M·e_q = x_i·x_q with M = diag(I, 0); value of e_i: η·y_i"],
                        note: "In line 4, M keeps the x-part of a token and drops its last coordinate, and the value projection writes η·y_i into the last coordinate. The sum over the examples then puts ŷ into the empty last coordinate of the query token."
                    },
                    ru: {
                        title: "Обучение в контексте как один шаг градиентного спуска",
                        text: [
                            "**Обучение в контексте** (in-context learning): в контексте лежат примеры (x_i, y_i), и модель предсказывает y для запроса x_q, не меняя весов. Точка отсчёта, которую можно вычислить точно: линейный предиктор w·x подгоняют к примерам градиентным спуском по квадратичной функции потерь из строки 1, начиная с w = 0.",
                            "Один шаг со скоростью η даёт w_1 = η·Σ y_i·x_i (строка 2). Тогда прогноз для запроса — сумма по примерам, где y_i взвешен произведением x_i·x_q (строка 3). Это внимание без softmax, **линейное внимание** (linear attention): ключи x_i, запрос x_q, значения η·y_i. Снова ядерное сглаживание — с линейным ядром и без нормировки.",
                            "Что доказано: существуют веса, при которых один слой линейного внимания вычисляет в точности этот шаг (строка 4). Что наблюдалось: небольшие трансформеры, обученные на линейной регрессии, ведут себя очень похоже. Ни то ни другое не говорит о том, как большие языковые модели учатся в контексте в общем случае."
                        ],
                        example: ["loss(w) = ½·Σ_i (w·x_i − y_i)², ∇loss(0) = −Σ_i y_i·x_i", "w_1 = 0 − η·∇loss(0) = η·Σ_i y_i·x_i", "ŷ = w_1·x_q = η·Σ_i y_i·(x_i·x_q)", "токены e_i = (x_i, y_i), e_q = (x_q, 0); оценка e_i^T·M·e_q = x_i·x_q, где M = diag(I, 0); значение e_i: η·y_i"],
                        note: "В строке 4 матрица M оставляет от токена часть x и отбрасывает последнюю координату, а проекция значений записывает η·y_i в последнюю координату. Сумма по примерам кладёт ŷ в пустую последнюю координату токена-запроса."
                    }
                },
                {
                    type: "number", answer: 1.5, tolerance: 0.005, card: "t9c",
                    en: {
                        q: "Examples in a context: x_1 = (1, 0), y_1 = 2; x_2 = (0, 1), y_2 = −1; x_3 = (1, 1), y_3 = 1. Take one gradient step from w = 0 with the rate η = 0.5 on the loss ½·Σ_i (w·x_i − y_i)². What does the new w predict for x_q = (1, 2)?",
                        hint: "The gradient at w = 0 is −Σ_i y_i·x_i. Or skip w altogether: weight each y_i by the dot product x_i·x_q.",
                        why: "Σ y_i·x_i = 2·(1, 0) − (0, 1) + (1, 1) = (3, 0), so w_1 = 0.5·(3, 0) = (1.5, 0) and ŷ = 1.5·1 + 0·2 = 1.5. As attention: 0.5·(2·1 − 1·2 + 1·3) = 1.5, each y_i weighted by x_i·x_q. One step is not the fit: least squares gives w = (2, −1), which predicts 0 here."
                    },
                    ru: {
                        q: "Примеры в контексте: x_1 = (1; 0), y_1 = 2; x_2 = (0; 1), y_2 = −1; x_3 = (1; 1), y_3 = 1. Сделай один шаг градиентного спуска из w = 0 со скоростью η = 0,5 по функции ½·Σ_i (w·x_i − y_i)². Что новый w предскажет для x_q = (1; 2)?",
                        hint: "Градиент в точке w = 0 равен −Σ_i y_i·x_i. А можно обойтись и без w: взвесь каждый y_i скалярным произведением x_i·x_q.",
                        why: "Σ y_i·x_i = 2·(1; 0) − (0; 1) + (1; 1) = (3; 0), поэтому w_1 = 0,5·(3; 0) = (1,5; 0) и ŷ = 1,5·1 + 0·2 = 1,5. Как внимание: 0,5·(2·1 − 1·2 + 1·3) = 1,5 — каждый y_i взвешен произведением x_i·x_q. Один шаг — ещё не подгонка: метод наименьших квадратов даёт w = (2; −1) и прогноз 0."
                    }
                },
                {
                    type: "info", icon: "🚧", mono: true,
                    en: {
                        title: "Three statements about limits",
                        text: [
                            "Rank. The output layer turns a hidden vector h of size d into logits W·h, one per token (W: V × d). Over any N contexts the logit matrix has rank at most d, and the log-probability matrix at most d + 1 (lines 1 to 3). Next-token distributions whose ln P has a higher rank cannot be represented exactly: the **softmax bottleneck**.",
                            "Depth. Each position gets L blocks in sequence, at any input length. Theory on idealised models shows, under standard complexity assumptions, that some problems needing many sequential steps cannot be solved this way at every length. Written steps change that: each generated token adds a pass that builds on the earlier ones.",
                            "Universality. For a fixed sequence length, wide and deep enough transformers with positional encodings approximate any continuous sequence-to-sequence function on a compact domain to any accuracy (classically in an average, L^p sense). So such weights exist. Whether training finds them, and from how many examples, is not said."
                        ],
                        example: ["logits of N contexts: H·W^T, H is N × d, W is V × d: rank ≤ d", "ln P = H·W^T − z·1^T, z_c = ln Σ_v exp(h_c·w_v): rank ≤ d + 1", "d = 1024, V = 50,000: rank ≤ 1024 for the logits, ≤ 1025 for ln P"],
                        note: "The bound holds for logits and log-probabilities, not for probabilities: exp acts entry by entry and does not keep the rank. With d = 1 and W = (0, 1, 2), three contexts give probability rows proportional to (1, a, a²) with three different a = e^h: rank 3."
                    },
                    ru: {
                        title: "Три утверждения о пределах",
                        text: [
                            "Ранг. Выходной слой превращает скрытый вектор h размера d в логиты W·h, по одному на токен (W: V × d). Для N контекстов ранг матрицы логитов не больше d, а матрицы логарифмов вероятностей — не больше d + 1 (строки 1–3). Если ранг ln P выше, распределения точно не представить: это **узкое место softmax** (softmax bottleneck).",
                            "Глубина. Позиция проходит L блоков подряд при любой длине входа. Для идеализированных моделей при стандартных гипотезах теории сложности показано: некоторые задачи, требующие многих последовательных шагов, так не решить для всех длин входа. Запись шагов помогает: каждый новый токен — ещё один проход с опорой на предыдущие.",
                            "Универсальность. При данной длине входа достаточно широкие и глубокие трансформеры с позиционными кодировками с любой точностью приближают на компакте любую непрерывную функцию из последовательностей в последовательности (классически — в норме L^p). Такие веса существуют. Найдёт ли их обучение и по скольким примерам, не сказано."
                        ],
                        example: ["логиты N контекстов: H·W^T, H — N × d, W — V × d: ранг ≤ d", "ln P = H·W^T − z·1^T, z_c = ln Σ_v exp(h_c·w_v): ранг ≤ d + 1", "d = 1024, V = 50 000: ранг ≤ 1024 для логитов и ≤ 1025 для ln P"],
                        note: "Оценка верна для логитов и логарифмов вероятностей, но не для самих вероятностей: exp действует поэлементно и ранг не сохраняет. При d = 1 и W = (0; 1; 2) три контекста дают строки вероятностей, пропорциональные (1; a; a²) с тремя разными a = e^h: ранг 3."
                    }
                },
                {
                    type: "number", answer: 0.36, tolerance: 0.005,
                    en: {
                        q: "An output layer with hidden size d = 1 and no bias gives three tokens the logits (−h, 0, 3h), where h is the hidden value. What is the largest probability that the token with logit 0 can get, over all h? Two decimal places.",
                        hint: "Its probability is 1/(1 + e^(−h) + e^(3h)). Minimise e^(−h) + e^(3h): set the derivative to zero.",
                        why: "p = 1/(1 + g) with g(h) = e^(−h) + e^(3h). g′ = 0 gives e^(4h) = 1/3, so e^(−h) = 1.316 and e^(3h) = 0.439: g = 1.755 and p = 1/2.755 = 0.36. At that h the first token has 0.48. The logit 0 always lies between −h and 3h, so some other token is at least as likely: no context makes this token the single most likely one."
                    },
                    ru: {
                        q: "Выходной слой с размером скрытого состояния d = 1 и без смещений даёт трём токенам логиты (−h; 0; 3h), где h — скрытое значение. Какую наибольшую вероятность может получить токен с логитом 0 при всех возможных h? Округли до сотых.",
                        hint: "Его вероятность равна 1/(1 + e^(−h) + e^(3h)). Минимизируй e^(−h) + e^(3h): приравняй производную к нулю.",
                        why: "p = 1/(1 + g), где g(h) = e^(−h) + e^(3h). Из g′ = 0: e^(4h) = 1/3, откуда e^(−h) = 1,316 и e^(3h) = 0,439: g = 1,755 и p = 1/2,755 = 0,36. При этом h у первого токена 0,48. Логит 0 всегда лежит между −h и 3h, так что какой-то другой токен не менее вероятен: ни в одном контексте этот токен не станет единственным самым вероятным."
                    }
                },
                {
                    type: "choice", card: "t9d",
                    en: {
                        q: "Theorem: for a fixed sequence length, transformers with positional encodings, wide and deep enough, can approximate any continuous sequence-to-sequence function on a compact domain to any accuracy. What exactly does it guarantee?",
                        options: ["For each such function and each error ε > 0, some model size and some weights reach that error", "One fixed, large enough model size is enough for every such function and every accuracy", "Gradient descent finds approximating weights once the training set is large enough", "The same without positional encodings, because attention already reads all the tokens"],
                        hint: "Read the quantifiers: what is fixed first, the function and the error, or the model? And who picks the weights?",
                        why: "It is an existence statement: the size and the weights may depend on the function and on ε, and nothing says how to find them or how many examples that takes. A fixed size is not promised. Without positional encodings and masks the model is permutation-equivariant, so it can approach only functions with that symmetry."
                    },
                    ru: {
                        q: "Теорема: при данной длине входа трансформеры достаточной ширины и глубины с позиционными кодировками с любой точностью приближают на компакте любую непрерывную функцию «последовательность в последовательность». Что гарантировано?",
                        options: ["Для каждой такой функции и каждой ошибки ε > 0 найдутся размер модели и веса с такой ошибкой", "Одного фиксированного, достаточно большого размера хватит для любой такой функции и любой точности", "Градиентный спуск найдёт приближающие веса, как только обучающая выборка станет достаточно большой", "То же верно и без позиционных кодировок, ведь внимание и так читает все токены"],
                        hint: "Прочитай кванторы: что фиксируется сначала — функция и ошибка или модель? И кто выбирает веса?",
                        why: "Это утверждение о существовании: размер и веса могут зависеть от функции и от ε, и не сказано, как их найти и сколько для этого нужно примеров. Фиксированного размера теорема не обещает. Без позиционных кодировок и масок модель эквивариантна относительно перестановок и может приближать только функции с такой симметрией."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge. An attention head reads n tokens; its scores lie in [−B, B], its values have length at most 1. Show that replacing one token (not the query) moves the output by at most 2·e^(2B)/n. What follows for the parity of n bits?",
                        answer: [
                            "Let token j change; w and w′ are the weights before and after. Any weight is at most e^B/(e^B + (n − 1)·e^(−B)) ≤ e^(2B)/n. The other weights all change by one common factor, so their changes have one sign and add up to |w_j − w′_j|. Hence the output moves by at most |w_j − w′_j| + w_j + w′_j = 2·max(w_j, w′_j) ≤ 2·e^(2B)/n.",
                            "Parity, the XOR of n bits, flips when one bit flips. Yet the output, and any Lipschitz readout of it, moves by O(1/n). Inputs of opposite parity get arbitrarily close outputs as n grows: the margin vanishes (a correct answer at a given n is not ruled out). The same holds at any fixed depth with bounded scores and Lipschitz maps.",
                            "With written steps the model need not react to all n bits at once: token t writes p_t = p_(t−1) XOR x_t, a function of two tokens, the last written parity and the next bit. Each pass then has to focus on single tokens, which takes a score gap of order ln n (so B cannot stay fixed as n grows), and the last p_t is the answer."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой. Голова читает n токенов; её оценки лежат в [−B; B], длины значений не больше 1. Докажи, что замена одного токена (не запроса) сдвигает выход не больше чем на 2·e^(2B)/n. Что это значит для чётности n бит?",
                        answer: [
                            "Пусть меняется токен j; w и w′ — веса до и после. Любой вес не больше e^B/(e^B + (n − 1)·e^(−B)) ≤ e^(2B)/n. Остальные веса умножаются на один общий множитель, поэтому их изменения одного знака и в сумме дают |w_j − w′_j|. Значит, выход сдвигается не больше чем на |w_j − w′_j| + w_j + w′_j = 2·max(w_j, w′_j) ≤ 2·e^(2B)/n.",
                            "Чётность (XOR n бит) меняется с заменой любого бита. Но выход и любое липшицево считывание с него сдвигаются на O(1/n). С ростом n выходы на входах разной чётности сколь угодно сближаются: зазор (margin) исчезает (верный ответ при данном n не исключён). То же при любой фиксированной глубине (оценки ограничены, слои липшицевы).",
                            "С записью шагов модели не нужно реагировать на все n бит сразу: токен t записывает p_t = p_(t−1) XOR x_t — функцию двух токенов, последней записанной чётности и очередного бита. Проходу нужно выделять отдельные токены, а это требует разрыва оценок порядка ln n (значит, B должно расти вместе с n); ответ — последнее p_t."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Attention is kernel smoothing: `out(q) = Σ_j w_j·v_j` with w = softmax(q·k_j / τ), a Nadaraya–Watson average of the values. τ → 0 gives a lookup, τ → ∞ the plain mean. Giving one key the weight p against n − 1 equal scores takes a gap of ln(n − 1) + ln(p/(1 − p)): with bounded scores a long context can only be averaged.",
                            "Without positions and masks, `Att(P·X) = P·Att(X)`: self-attention is permutation-equivariant, and per-token layers keep that. Positional encodings and causal masks break it. One head's score matrix has rank at most d_k, and a block with an MLP of hidden width 4d holds 12·d² weights (biases and norms aside).",
                            "One gradient step from w = 0 on ½·Σ(w·x_i − y_i)² predicts `ŷ = η·Σ_i y_i·(x_i·x_q)`, and one linear attention layer can compute exactly that. This is a construction, and small transformers trained on linear regression behave much like it; it is not a claim about large language models in general.",
                            "Limits: the logits H·W^T have rank at most d (softmax bottleneck). A fixed depth gives a bounded number of sequential steps per token, and written steps add passes (results for idealised models). Universality says that weights exist, not that training finds them."
                        ]
                    },
                    ru: {
                        points: [
                            "Внимание — ядерное сглаживание: `out(q) = Σ_j w_j·v_j`, где w = softmax(q·k_j / τ) (оценка Надарая — Ватсона). При τ → 0 это поиск по ключу, при τ → ∞ — обычное среднее. Чтобы ключ получил вес p против n − 1 равных оценок, нужен разрыв ln(n − 1) + ln(p/(1 − p)): при ограниченных оценках длинный контекст можно только усреднять.",
                            "Без позиций и масок `Att(P·X) = P·Att(X)`: внимание эквивариантно относительно перестановок, и потокенные слои это сохраняют. Позиционные кодировки и каузальная маска эту симметрию нарушают. Ранг матрицы оценок одной головы не больше d_k, а в блоке с MLP скрытой ширины 4d — 12·d² весов (без смещений и нормализаций).",
                            "Один шаг градиентного спуска из w = 0 по ½·Σ(w·x_i − y_i)² даёт прогноз `ŷ = η·Σ_i y_i·(x_i·x_q)`, и один слой линейного внимания может вычислить в точности его. Это конструкция, и небольшие трансформеры, обученные на линейной регрессии, ведут себя очень похоже; это не утверждение о больших языковых моделях в общем случае.",
                            "Пределы: ранг логитов H·W^T не больше d (узкое место softmax). Фиксированная глубина даёт ограниченное число последовательных шагов на токен, а запись шагов добавляет проходы (результаты для идеализированных моделей). Универсальность говорит, что веса существуют, но не что обучение их найдёт."
                        ]
                    }
                }
            ]
        },

        /* ----- t10. Causality: from seeing to doing ----- */
        t10: {
            steps: [
                {
                    type: "info", icon: "🔧", mono: true,
                    en: {
                        title: "Seeing is not doing",
                        text: [
                            "A **structural causal model** (SCM) gives every variable its own equation V_i = f_i(pa_i, U_i): a function of its parents pa_i in a directed acyclic graph and of a noise U_i, with all noises independent. Hence the joint distribution factorises along the graph (line 1).",
                            "Conditioning, P(y | x), filters the data: it keeps the cases where X happened to equal x. The **intervention** do(X = x) changes the model: the equation of X is replaced by X = x, all others stay. In line 1 the factor of X disappears and the rest is taken at X = x (line 2): the **truncated factorisation**.",
                            "Lines 3 to 5 apply this to a graph in which Z is a common cause of X and Y, a **confounder**. Doing and seeing average the same P(y | x, z) with different weights: seeing X = x is evidence about Z, setting X = x is not."
                        ],
                        example: ["P(v_1, …, v_n) = Π_i P(v_i | pa_i)", "P(v_1, …, v_n | do(x)) = Π_(i: V_i ≠ X) P(v_i | pa_i), taken at X = x", "graph Z → X, Z → Y, X → Y: P(z, y | do(x)) = P(z)·P(y | x, z)", "doing: P(y | do(x)) = Σ_z P(y | x, z)·P(z)", "seeing: P(y | x) = Σ_z P(y | x, z)·P(z | x)"],
                        note: "P(y | do(x)) is a property of the model, not of the data alone: it is defined through the changed equations. The question of this unit is when it can be computed from the distribution of observations, and what has to be assumed for that."
                    },
                    ru: {
                        title: "Наблюдать — не значит вмешиваться",
                        text: [
                            "**Структурная причинная модель** (SCM) задаёт каждую переменную своим уравнением V_i = f_i(pa_i, U_i): это функция её родителей pa_i в ориентированном ациклическом графе и шума U_i, причём все шумы независимы. Поэтому совместное распределение факторизуется по графу (строка 1).",
                            "Условная вероятность P(y | x) фильтрует данные: остаются случаи, где значение X оказалось равно x. **Вмешательство** (intervention) do(X = x) меняет модель: уравнение для X заменяют на X = x, остальные не трогают. В строке 1 пропадает множитель для X, остальные берутся при X = x (строка 2): это **усечённая факторизация**.",
                            "В строках 3–5 это применено к графу, где Z — общая причина X и Y, **конфаундер** (confounder). Вмешательство и наблюдение усредняют одни и те же P(y | x, z), но с разными весами: наблюдение X = x несёт сведения о Z, а установка X = x — нет."
                        ],
                        example: ["P(v_1, …, v_n) = Π_i P(v_i | pa_i)", "P(v_1, …, v_n | do(x)) = Π_(i: V_i ≠ X) P(v_i | pa_i) при X = x", "граф Z → X, Z → Y, X → Y: P(z, y | do(x)) = P(z)·P(y | x, z)", "вмешательство: P(y | do(x)) = Σ_z P(y | x, z)·P(z)", "наблюдение: P(y | x) = Σ_z P(y | x, z)·P(z | x)"],
                        note: "P(y | do(x)) — свойство модели, а не одних только данных: оно определено через изменённые уравнения. Главный вопрос этого шага — когда его можно вычислить по распределению наблюдений и какие допущения для этого нужны."
                    }
                },
                {
                    type: "number", answer: -1, tolerance: 0.005,
                    en: {
                        q: "SCM with independent noises of mean 0 and variance 1: Z = U_Z, X = Z + U_X, Y = X − 4·Z + U_Y. Setting X raises Y: E[Y | do(X = x)] = x. What is the slope Cov(X, Y)/Var(X) of the regression of Y on X in observational data?",
                        hint: "Var(X) and Cov(X, Z) follow from X = Z + U_X. Then expand Cov(X, Y) = Cov(X, X − 4·Z + U_Y) term by term.",
                        why: "Var(X) = 1 + 1 = 2 and Cov(X, Z) = 1, so Cov(X, Y) = Var(X) − 4·Cov(X, Z) = 2 − 4 = −2 and the slope is −2/2 = −1. The effect is +1, the regression says −1: a large X is evidence of a large Z, and Z lowers Y. With Z as a second regressor, the coefficient of X is exactly 1."
                    },
                    ru: {
                        q: "SCM с независимыми шумами (среднее 0, дисперсия 1): Z = U_Z, X = Z + U_X, Y = X − 4·Z + U_Y. Установка X повышает Y: E[Y | do(X = x)] = x. Чему равен наклон Cov(X, Y)/Var(X) регрессии Y на X по данным наблюдений?",
                        hint: "Var(X) и Cov(X, Z) следуют из X = Z + U_X. Затем раскрой Cov(X, Y) = Cov(X, X − 4·Z + U_Y) по слагаемым.",
                        why: "Var(X) = 1 + 1 = 2 и Cov(X, Z) = 1, поэтому Cov(X, Y) = Var(X) − 4·Cov(X, Z) = 2 − 4 = −2, а наклон равен −2/2 = −1. Эффект равен +1, а регрессия даёт −1: большое X говорит о большом Z, а Z понижает Y. Если добавить Z вторым регрессором, коэффициент при X будет ровно 1."
                    }
                },
                {
                    type: "info", icon: "🔀", mono: true,
                    en: {
                        title: "Three junctions and d-separation",
                        text: [
                            "A **path** is a sequence of adjacent arrows, followed in any direction. Every inner variable of a path is one of three junctions (lines 1 to 3). A chain and a fork pass dependence on until their middle variable is conditioned on. A **collider** is the opposite: closed until it is conditioned on.",
                            "A set S **blocks** a path if the path has a chain or a fork whose middle variable is in S, or a collider that is not in S and has no descendant in S. X and Y are **d-separated** by S if S blocks every path between them. Theorem: then X and Y are independent given S in every distribution generated by an SCM with this graph.",
                            "The collider rule is the one that intuition gets wrong. Two independent causes of a common effect are in general dependent once the effect is known: learning that one cause is present can make the other less likely (**explaining away**). Selecting data on a common effect does the same: **selection bias**."
                        ],
                        example: ["chain X → M → Y: open; blocked when M is in S", "fork X ← Z → Y: open; blocked when Z is in S", "collider X → C ← Y: closed; opened when C or a descendant of C is in S"],
                        note: "The converse is not a theorem: variables joined by open paths can still be independent, for example when the effects along two paths cancel exactly. The assumption that this does not happen is called faithfulness; the theorem on d-separation does not need it."
                    },
                    ru: {
                        title: "Три типа узлов и d-разделение",
                        text: [
                            "**Путь** — последовательность смежных стрелок, проходимых в любом направлении. Каждая внутренняя переменная пути — узел одного из трёх типов (строки 1–3). Цепочка и вилка передают зависимость, пока по средней переменной не обусловили. **Коллайдер** (collider) устроен наоборот: закрыт, пока по нему не обусловили.",
                            "Множество S **блокирует** путь, если на нём есть цепочка или вилка со средней переменной из S либо коллайдер, который не входит в S и не имеет потомков в S. X и Y **d-разделены** множеством S, если S блокирует все пути между ними. Теорема: тогда X и Y независимы при данном S в любом распределении, порождённом SCM с этим графом.",
                            "Именно правило коллайдера противоречит интуиции. Две независимые причины общего следствия, вообще говоря, становятся зависимыми, когда следствие известно: известие об одной причине может сделать другую менее вероятной (**explaining away**). То же делает отбор данных по общему следствию: **смещение отбора** (selection bias)."
                        ],
                        example: ["цепочка X → M → Y: открыта; блокируется, если M входит в S", "вилка X ← Z → Y: открыта; блокируется, если Z входит в S", "коллайдер X → C ← Y: закрыт; открывается, если C или потомок C входит в S"],
                        note: "Обратное — не теорема: переменные, соединённые открытыми путями, могут оказаться независимыми, например когда эффекты вдоль двух путей в точности компенсируют друг друга. Допущение, что такого не бывает, называют верностью (faithfulness); теореме о d-разделении оно не нужно."
                    }
                },
                {
                    type: "number", answer: -0.5, tolerance: 0.005,
                    en: {
                        q: "X and Y are independent N(0, 1); X has no effect on Y. Their common effect is C = X + Y + U_C with an independent U_C ~ N(0, 1). With infinite data, what is the coefficient of X in the least-squares regression of Y on X and C?",
                        hint: "Given X and C, the sum Y + U_C = C − X is known. What is the expectation of one of two independent, identically distributed terms when their sum is known?",
                        why: "E[Y | X, C] = E[Y | Y + U_C = C − X] = (C − X)/2, since Y and U_C have the same distribution: the coefficient of X is −0.5 (and of C, +0.5). The normal equations with Var(X) = 1, Var(C) = 3, Cov(X, C) = Cov(Y, C) = 1 give the same. Without C the slope is 0: adjusting for the collider created the association."
                    },
                    ru: {
                        q: "X и Y независимы, каждая N(0, 1); X не влияет на Y. Их общее следствие — C = X + Y + U_C с независимым U_C ~ N(0, 1). Чему на бесконечной выборке равен коэффициент при X в регрессии Y на X и C по методу наименьших квадратов?",
                        hint: "При данных X и C известна сумма Y + U_C = C − X. Чему равно ожидание одного из двух независимых одинаково распределённых слагаемых, если известна их сумма?",
                        why: "E[Y | X, C] = E[Y | Y + U_C = C − X] = (C − X)/2, ведь Y и U_C распределены одинаково: коэффициент при X равен −0,5 (а при C — +0,5). Нормальные уравнения с Var(X) = 1, Var(C) = 3, Cov(X, C) = Cov(Y, C) = 1 дают то же. Без C наклон равен 0: связь создана поправкой на коллайдер."
                    }
                },
                {
                    type: "info", icon: "🚪", mono: true,
                    en: {
                        title: "The backdoor criterion",
                        text: [
                            "A **backdoor path** from X to Y is a path that begins with an arrow into X. Such a path can carry association that is not an effect of X. A set Z satisfies the **backdoor criterion** for (X, Y) if it contains no descendant of X and blocks every backdoor path from X to Y.",
                            "Theorem (**backdoor adjustment**): for such a Z, line 1 holds, provided P(x, z) > 0 for every z with P(z) > 0. The effect of an intervention is then computed from observational data alone. Compare line 2: plain conditioning weights the same strata by P(z | x).",
                            "Adjusting for more is not safer. A **mediator** (X → M → Y) carries part of the effect; conditioning on it removes that part. Conditioning on a collider, or on a descendant of one, can open a path that was blocked. In a **randomised** experiment a coin sets X: no arrow enters X, no backdoor path exists, and line 3 holds."
                        ],
                        example: ["P(y | do(x)) = Σ_z P(y | x, z)·P(z)", "P(y | x) = Σ_z P(y | x, z)·P(z | x)", "X randomised: P(y | do(x)) = P(y | x)", "linear SCM, Z a backdoor set: the effect of X on Y is the coefficient of X in the regression of Y on X and Z"],
                        note: "A variable measured before X is not automatically safe. In the graph X ← A → C ← B → Y the variable C is a collider: adjusting for C alone opens a backdoor path that was blocked."
                    },
                    ru: {
                        title: "Критерий чёрного хода",
                        text: [
                            "**Путь чёрного хода** (backdoor path) из X в Y — путь, который начинается со стрелки, входящей в X. Такой путь может переносить связь, которая не является эффектом X. Множество Z удовлетворяет **критерию чёрного хода** (backdoor criterion) для (X, Y), если в нём нет потомков X и оно блокирует все пути чёрного хода из X в Y.",
                            "Теорема (**формула поправки**, backdoor adjustment): для такого Z верна строка 1, если P(x, z) > 0 при всех z с P(z) > 0. Эффект вмешательства тогда вычисляется по одним лишь данным наблюдений. Сравни со строкой 2: обычная условная вероятность взвешивает те же страты по P(z | x).",
                            "Больше поправок — не значит лучше. **Посредник** (mediator, X → M → Y) переносит часть эффекта, а обусловливание по нему её убирает. Обусловливание по коллайдеру или его потомку может открыть заблокированный путь. При **рандомизации** X задаётся жребием: в X не входят стрелки, путей чёрного хода нет, и верна строка 3."
                        ],
                        example: ["P(y | do(x)) = Σ_z P(y | x, z)·P(z)", "P(y | x) = Σ_z P(y | x, z)·P(z | x)", "X рандомизирован: P(y | do(x)) = P(y | x)", "линейная SCM, Z удовлетворяет критерию: эффект X на Y — коэффициент при X в регрессии Y на X и Z"],
                        note: "Переменная, измеренная до X, не обязательно безопасна. В графе X ← A → C ← B → Y переменная C — коллайдер: поправка на одну лишь C открывает путь чёрного хода, который был заблокирован."
                    }
                },
                {
                    type: "number", answer: 0.75, tolerance: 0.005, card: "t10a",
                    en: {
                        q: "Backdoor adjustment: P(y | do(x)) = Σ_z P(y | x, z)·P(z). Severity Z is the only common cause of treatment and recovery. Half the patients got A, half B; 80% of group A and 20% of group B were severe. What is P(recovery | do(A))?",
                        table: { head: ["Severity", "Recovery rate on A", "Recovery rate on B"], rows: [["mild", "0.9", "0.8"], ["severe", "0.6", "0.5"]] },
                        hint: "The weights are P(z) in the whole population, not within group A. Find P(severe) first.",
                        why: "P(severe) = 0.5·0.8 + 0.5·0.2 = 0.5, so P(recovery | do(A)) = 0.5·0.9 + 0.5·0.6 = 0.75, and do(B) gives 0.5·0.8 + 0.5·0.5 = 0.65. The observed rates are 0.2·0.9 + 0.8·0.6 = 0.66 on A and 0.8·0.8 + 0.2·0.5 = 0.74 on B. B looks better, although A is better in each stratum: Simpson’s paradox."
                    },
                    ru: {
                        q: "Формула поправки: P(y | do(x)) = Σ_z P(y | x, z)·P(z). Тяжесть Z — единственная общая причина выбора лечения и исхода. Половине пациентов дали A, другой — B; тяжёлых в группе A 80%, в группе B 20%. Найди P(выздоровление | do(A)).",
                        table: { head: ["Тяжесть", "Доля выздоровевших при A", "Доля выздоровевших при B"], rows: [["лёгкая", "0,9", "0,8"], ["тяжёлая", "0,6", "0,5"]] },
                        hint: "Веса — это P(z) во всей популяции, а не в группе A. Сначала найди P(тяжёлая).",
                        why: "P(тяжёлая) = 0,5·0,8 + 0,5·0,2 = 0,5, поэтому P(выздоровление | do(A)) = 0,5·0,9 + 0,5·0,6 = 0,75, а do(B) даёт 0,5·0,8 + 0,5·0,5 = 0,65. Наблюдаемые доли: 0,2·0,9 + 0,8·0,6 = 0,66 при A и 0,8·0,8 + 0,2·0,5 = 0,74 при B. B выглядит лучше, хотя A лучше в каждой страте: это парадокс Симпсона."
                    }
                },
                {
                    type: "choice", card: "t10b",
                    en: {
                        q: "Causal graph: Z → X, Z → Y, X → M → Y, X → C ← Y, C → D. For which set of covariates S does the adjustment formula Σ_s P(y | x, s)·P(s) equal P(y | do(x)) in every SCM with this graph?",
                        options: ["Only Z: it blocks X ← Z → Y, and M, C and D are all descendants of X", "Z and M: with the mediator held fixed, what remains is the effect of X itself", "Z and D: D is neither a mediator nor a collider, and it correlates with X and Y", "Z, M, C and D: adjusting for every measured variable can only remove bias"],
                        hint: "For each variable other than Z, find its place on the paths between X and Y: what does conditioning on it block, and what does it open?",
                        why: "Z blocks the only backdoor path X ← Z → Y. M is a mediator: given M, the chain X → M → Y, here the whole effect, is blocked. D is a descendant of the collider C: conditioning on it opens X → C ← Y and adds a non-causal association. The place in the graph decides, not correlation with X and Y: “adjust for everything” is wrong."
                    },
                    ru: {
                        q: "Причинный граф: Z → X, Z → Y, X → M → Y, X → C ← Y, C → D. При каком наборе ковариат S формула поправки Σ_s P(y | x, s)·P(s) равна P(y | do(x)) в любой SCM с этим графом?",
                        options: ["Только Z: Z блокирует путь X ← Z → Y, а M, C и D — потомки X", "Z и M: при фиксированном посреднике остаётся эффект собственно X", "Z и D: D не посредник и не коллайдер, но коррелирует и с X, и с Y", "Z, M, C и D: поправка на все измеренные переменные может только убрать смещение"],
                        hint: "Для каждой переменной, кроме Z, найди её место на путях между X и Y: что обусловливание по ней блокирует и что открывает?",
                        why: "Z блокирует единственный путь чёрного хода X ← Z → Y. M — посредник: при данном M цепочка X → M → Y, здесь это весь эффект, заблокирована. D — потомок коллайдера C: обусловливание по D открывает путь X → C ← Y и добавляет непричинную связь. Важно место переменной в графе, а не корреляция с X и Y: «учитывать всё» — ошибка."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Linear SCM: Y = β·X + U; the hidden U also affects X, so no observed set meets the backdoor criterion. An instrument Z has Cov(Z, X) ≠ 0, no arrow into Y, and is independent of U. Order the derivation of β and of its weak point.",
                        items: ["Take the covariance of both sides of Y = β·X + U with Z: Cov(Z, Y) = β·Cov(Z, X) + Cov(Z, U)", "Z is independent of U, so the last term is 0, which leaves Cov(Z, Y) = β·Cov(Z, X)", "Cov(Z, X) ≠ 0, so both sides of that can be divided by it: β = Cov(Z, Y) / Cov(Z, X)", "Had Cov(Z, U) not been 0, this ratio would equal β + Cov(Z, U)/Cov(Z, X) instead", "So with Cov(Z, X) near 0, a weak instrument, even a tiny Cov(Z, U) gives a large error"],
                        hint: "Start with the line that brings in the covariances. After it, every line speaks about what the line before has produced.",
                        why: "Each assumption is used once: no arrow from Z into Y (exclusion) is why the equation of Y has no term in Z; independence removes Cov(Z, U); relevance allows the division. The same step with X in place of Z gives Cov(X, Y)/Var(X) = β + Cov(X, U)/Var(X): plain regression is biased, because X is correlated with U."
                    },
                    ru: {
                        q: "Линейная SCM: Y = β·X + U, скрытая переменная U влияет и на X, так что наблюдаемого набора для поправки нет. У инструмента Z: Cov(Z, X) ≠ 0, нет стрелки в Y, и он не зависит от U. Расставь шаги вывода β и его слабого места.",
                        items: ["Возьмём ковариацию обеих частей Y = β·X + U с Z: Cov(Z, Y) = β·Cov(Z, X) + Cov(Z, U)", "Z не зависит от U, поэтому последнее слагаемое равно 0 и остаётся Cov(Z, Y) = β·Cov(Z, X)", "Cov(Z, X) ≠ 0, поэтому обе части этого равенства можно на неё разделить: β = Cov(Z, Y) / Cov(Z, X)", "Будь Cov(Z, U) не равна 0, это отношение равнялось бы β + Cov(Z, U)/Cov(Z, X)", "Значит, при Cov(Z, X) около 0 (слабый инструмент) даже малая Cov(Z, U) даёт большую ошибку"],
                        hint: "Начни со строки, которая вводит ковариации. После неё каждая строка говорит о том, что получено в предыдущей.",
                        why: "Каждое допущение использовано один раз: стрелки из Z в Y нет (условие исключения), поэтому в уравнении для Y нет слагаемого с Z; независимость убирает Cov(Z, U); релевантность позволяет делить. Тот же шаг с X вместо Z даёт Cov(X, Y)/Var(X) = β + Cov(X, U)/Var(X): обычная регрессия смещена, ведь X коррелирует с U."
                    }
                },
                {
                    type: "number", answer: 0.5, tolerance: 0.005, card: "t10c",
                    en: {
                        q: "Y = β·X + U; the hidden U also affects X. An instrument Z affects Y only through X and is independent of U, so β = Cov(Z, Y)/Cov(Z, X). With the table’s values: by how much does the regression slope Cov(X, Y)/Var(X) exceed β?",
                        table: { head: ["Cov(Z, X)", "Cov(Z, Y)", "Var(X)", "Cov(X, Y)"], rows: [["0.3", "0.6", "2", "5"]] },
                        hint: "Compute the two numbers separately: the ratio with the instrument, and the ordinary slope. Their difference is Cov(X, U)/Var(X).",
                        why: "β = 0.6/0.3 = 2, while the regression slope is 5/2 = 2.5: it exceeds β by 0.5. That excess is Cov(X, U)/Var(X), so Cov(X, U) = 1: the instrument even measures the hidden confounding. From such covariances only Cov(Z, X) ≠ 0 can be checked; the other two assumptions about Z rest on knowledge of the mechanism."
                    },
                    ru: {
                        q: "Y = β·X + U, скрытая переменная U влияет и на X. Инструмент Z влияет на Y только через X и не зависит от U, поэтому β = Cov(Z, Y)/Cov(Z, X). По данным таблицы: на сколько наклон регрессии Cov(X, Y)/Var(X) больше β?",
                        table: { head: ["Cov(Z, X)", "Cov(Z, Y)", "Var(X)", "Cov(X, Y)"], rows: [["0,3", "0,6", "2", "5"]] },
                        hint: "Вычисли два числа по отдельности: отношение с инструментом и обычный наклон. Их разность — это Cov(X, U)/Var(X).",
                        why: "β = 0,6/0,3 = 2, а наклон регрессии равен 5/2 = 2,5: он больше β на 0,5. Этот избыток равен Cov(X, U)/Var(X), откуда Cov(X, U) = 1: инструмент измеряет и скрытое смешение (confounding). По таким ковариациям можно проверить только Cov(Z, X) ≠ 0; два других допущения о Z опираются на знание механизма."
                    }
                },
                {
                    type: "info", icon: "🔮", mono: true,
                    en: {
                        title: "Counterfactuals and the three levels",
                        text: [
                            "A **counterfactual** asks about one unit after the fact: given what was observed, what would Y have been, had X been x′? An SCM answers in three steps. **Abduction**: update the distribution of the noises U by the observation. **Action**: replace the equation of X by X = x′. **Prediction**: compute Y with the updated noises.",
                            "This gives three levels: association P(y | x), intervention P(y | do(x)), counterfactuals. Without causal assumptions, data of a lower level do not determine the answers of a higher one. Lines 3 to 5: two SCMs with exactly the same joint distribution of (X, Y) and different effects of setting X.",
                            "So a model trained only to predict learns at best P(y | x) of its training distribution, whatever its size. It may rely on correlations that break when someone intervenes or when the distribution shifts; no amount of data of the same kind tells model 1 from model 2."
                        ],
                        example: ["Y = 2·X + U; observed X = 1, Y = 3; had X been 2?", "abduction: U = 3 − 2·1 = 1; action: X = 2; prediction: Y = 2·2 + 1 = 5", "model 1 (X → Y): X ~ N(0, 1), Y = 0.6·X + U_Y, Gaussian U_Y with mean 0, variance 0.64", "model 2 (Y → X): Y ~ N(0, 1), X = 0.6·Y + U_X, Gaussian U_X with mean 0, variance 0.64", "both: means 0, variances 1, correlation 0.6; E[Y | do(X = x)] is 0.6·x in model 1 and 0 in model 2"]
                    },
                    ru: {
                        title: "Контрфактуалы и три уровня",
                        text: [
                            "**Контрфактуал** (counterfactual) — вопрос об одном объекте задним числом: при том, что наблюдалось, каким был бы Y, будь X равен x′? SCM отвечает в три шага. **Абдукция**: по наблюдению уточняем распределение шумов U. **Действие**: заменяем уравнение для X на X = x′. **Предсказание**: вычисляем Y с уточнёнными шумами.",
                            "Получается три уровня: ассоциация P(y | x), вмешательство P(y | do(x)), контрфактуалы. Без причинных допущений данные нижнего уровня не определяют ответы верхнего. Строки 3–5: две SCM, у которых совместное распределение (X, Y) в точности одинаково, а эффект установки X разный.",
                            "Поэтому модель, обученная только предсказывать, в лучшем случае выучивает P(y | x) своего обучающего распределения, каким бы ни был её размер. Она может опираться на корреляции, которые разрушаются при вмешательстве или сдвиге распределения; никакой объём таких же данных не отличит модель 1 от модели 2."
                        ],
                        example: ["Y = 2·X + U; наблюдалось X = 1, Y = 3; а будь X = 2?", "абдукция: U = 3 − 2·1 = 1; действие: X = 2; предсказание: Y = 2·2 + 1 = 5", "модель 1 (X → Y): X ~ N(0, 1), Y = 0,6·X + U_Y, гауссов шум U_Y со средним 0 и дисперсией 0,64", "модель 2 (Y → X): Y ~ N(0, 1), X = 0,6·Y + U_X, гауссов шум U_X со средним 0 и дисперсией 0,64", "обе: средние 0, дисперсии 1, корреляция 0,6; E[Y | do(X = x)] равно 0,6·x в модели 1 и 0 в модели 2"]
                    }
                },
                {
                    type: "number", answer: 0.67, tolerance: 0.005, card: "t10d",
                    en: {
                        q: "SCM with binary X: Y = max(X·U_1, U_2); U_1 ~ Bernoulli(0.5) and U_2 ~ Bernoulli(0.2) are independent of each other and of X. A unit has X = 1, Y = 1. With what probability would its Y have been 0, had X been 0? Two decimals.",
                        hint: "Abduction: which pairs (U_1, U_2) are compatible with X = 1, Y = 1, and what are their posterior probabilities? Action and prediction: with X = 0, Y equals U_2.",
                        why: "Abduction: X = 1, Y = 1 means U_1 = 1 or U_2 = 1, of probability 1 − 0.5·0.8 = 0.6. Action and prediction: with X = 0, Y = U_2, and of these pairs only (U_1, U_2) = (1, 0) has U_2 = 0; its probability is 0.5·0.8 = 0.4. Answer: 0.4/0.6 ≈ 0.67. The interventional P(Y = 0 | do(X = 0)) = 0.8 differs: it ignores the observation."
                    },
                    ru: {
                        q: "SCM с бинарным X: Y = max(X·U_1, U_2); U_1 ~ Bernoulli(0,5) и U_2 ~ Bernoulli(0,2) не зависят друг от друга и от X. У объекта X = 1, Y = 1. С какой вероятностью его Y был бы равен 0, будь X равен 0? Округли до сотых.",
                        hint: "Абдукция: какие пары (U_1; U_2) совместимы с X = 1, Y = 1 и каковы их апостериорные вероятности? Действие и предсказание: при X = 0 значение Y равно U_2.",
                        why: "Абдукция: X = 1, Y = 1 означает U_1 = 1 или U_2 = 1; вероятность 1 − 0,5·0,8 = 0,6. Действие и предсказание: при X = 0 будет Y = U_2, а из этих пар U_2 = 0 только у (U_1; U_2) = (1; 0); её вероятность 0,5·0,8 = 0,4. Ответ: 0,4/0,6 ≈ 0,67. Интервенционная P(Y = 0 | do(X = 0)) = 0,8 — иная величина: она не учитывает наблюдение."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Find the flaw. X and Y are binary. (1) A large randomised trial finds P(Y = 1 | do(X = 1)) = P(Y = 1 | do(X = 0)) = 0.5. (2) So X has no average effect on Y. (3) So X does not change Y for any unit.",
                        options: ["In (3): Y = U and Y = X xor U, U a fair coin, both give (1), yet in the second X flips every Y", "In (2): equal rates can hide an average effect, as a coin still leaves hidden confounders of X", "In (1): a trial estimates P(y | x), which differs from P(y | do(x)) even when a coin sets X", "In (3): only because a finite trial can never show that two rates are exactly equal"],
                        hint: "Steps (1) and (2) speak about distributions under interventions. What kind of statement is (3)?",
                        why: "(3) is a counterfactual claim about single units, and interventional distributions do not determine it. With a fair coin U, the SCMs Y = U and Y = X xor U both give P(Y = 1 | do(x)) = 0.5 for each x; in the first X never matters, in the second it flips every unit’s Y. Randomisation removes confounding, so (1) and (2) are sound."
                    },
                    ru: {
                        q: "Найди ошибку. X и Y бинарны. (1) Большое рандомизированное испытание даёт P(Y = 1 | do(X = 1)) = P(Y = 1 | do(X = 0)) = 0,5. (2) Значит, среднего эффекта X на Y нет. (3) Значит, X не меняет Y ни у одного объекта.",
                        options: ["В (3): Y = U и Y = X xor U (U — честная монета) обе дают (1), но во второй X меняет каждый Y", "В (2): равные доли могут скрывать средний эффект, ведь жребий не убирает скрытые общие причины", "В (1): испытание оценивает P(y | x), а она отличается от P(y | do(x)) даже при жребии", "В (3): только потому, что конечное испытание не может показать точное равенство двух долей"],
                        hint: "Шаги (1) и (2) говорят о распределениях при вмешательствах. К какому уровню относится утверждение (3)?",
                        why: "(3) — контрфактическое утверждение об отдельных объектах, а распределения при вмешательствах его не определяют. Для честной монеты U обе SCM, Y = U и Y = X xor U, дают P(Y = 1 | do(x)) = 0,5 при любом x; в первой X ни на что не влияет, во второй меняет Y каждого объекта. Рандомизация убирает смешение, поэтому (1) и (2) верны."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge, on paper. Graph: X → M → Y and X ← U → Y, where U is hidden and M is observed. No observed set satisfies the backdoor criterion for (X, Y). Show that P(y | do(x)) can still be computed from P(x, m, y).",
                        answer: [
                            "The idea: split the effect into two links and use the backdoor criterion on each. From X to M the only backdoor path is X ← U → Y ← M, and the collider Y blocks it with nothing conditioned on: the empty set works, so P(m | do(x)) = P(m | x).",
                            "From M to Y the backdoor path M ← X ← U → Y is blocked by X, which is not a descendant of M: P(y | do(m)) = Σ_x′ P(y | m, x′)·P(x′).",
                            "X acts on Y only through M, and under do(x) M is independent of U, so the links chain: P(y | do(x)) = Σ_m P(m | x)·Σ_x′ P(y | m, x′)·P(x′). This is the **front-door adjustment**; it needs P(x, m) > 0. A hidden common cause does not always prevent identification: the graph decides."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой, на бумаге. Граф: X → M → Y и X ← U → Y; U не наблюдается, M наблюдается. Наблюдаемого набора, подходящего под критерий чёрного хода для (X, Y), нет. Покажи, что P(y | do(x)) всё же вычисляется по P(x, m, y).",
                        answer: [
                            "Идея: разбить эффект на два звена и к каждому применить критерий чёрного хода. Из X в M единственный путь чёрного хода — X ← U → Y ← M, и коллайдер Y блокирует его без всякого обусловливания: подходит пустое множество, поэтому P(m | do(x)) = P(m | x).",
                            "Из M в Y путь чёрного хода M ← X ← U → Y блокируется переменной X, а она не потомок M: P(y | do(m)) = Σ_x′ P(y | m, x′)·P(x′).",
                            "X действует на Y только через M, а при do(x) переменная M не зависит от U, поэтому звенья соединяются: P(y | do(x)) = Σ_m P(m | x)·Σ_x′ P(y | m, x′)·P(x′). Это **поправка по парадному входу** (front-door adjustment); ей нужно P(x, m) > 0. Скрытая общая причина не всегда мешает идентификации: всё решает граф."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "`do(x)` replaces the equation of X in a structural causal model; conditioning only filters the data. With a common cause Z: `P(y | do(x)) = Σ_z P(y | x, z)·P(z)`, while `P(y | x)` weights the same strata by P(z | x). Randomising X makes the two equal.",
                            "d-separation: conditioning on its middle variable blocks a chain or a fork; a collider is closed until it or a descendant is conditioned on. A backdoor set blocks every backdoor path and holds no descendant of X, so never a mediator; a collider or its descendant in the set can open a path. “Adjust for everything” is wrong.",
                            "With a hidden common cause, structure can still identify the effect. In a linear model an instrument gives `β = Cov(Z, Y)/Cov(Z, X)`; its exclusion and Cov(Z, U) = 0 cannot be tested from data on (Z, X, Y). A mediator that carries the whole effect and is shielded from the hidden cause gives the front-door formula.",
                            "A counterfactual is abduction, action, prediction, with the unit’s own noises. Association, intervention, counterfactual: each level needs assumptions that the level below cannot supply. A model trained only to predict learns at best P(y | x) of its training distribution; under intervention or shift its predictions may fail."
                        ]
                    },
                    ru: {
                        points: [
                            "`do(x)` заменяет уравнение для X в структурной причинной модели, а условная вероятность лишь фильтрует данные. При общей причине Z: `P(y | do(x)) = Σ_z P(y | x, z)·P(z)`, тогда как `P(y | x)` взвешивает те же страты по P(z | x). Рандомизация X делает их равными.",
                            "d-разделение: цепочку и вилку блокирует обусловливание по средней переменной; коллайдер закрыт, пока не обусловили по нему или его потомку. Набор для поправки блокирует все пути чёрного хода и не содержит потомков X, а значит, и посредников; коллайдер или его потомок в наборе может открыть путь. «Учитывать всё» — ошибка.",
                            "При скрытой общей причине структура иногда всё же позволяет найти эффект. В линейной модели инструмент даёт `β = Cov(Z, Y)/Cov(Z, X)`; условие исключения и Cov(Z, U) = 0 по данным о (Z, X, Y) не проверить. Посредник, который переносит весь эффект и не зависит от скрытой причины напрямую, даёт формулу парадного входа.",
                            "Контрфактуал — абдукция, действие и предсказание с шумами самого объекта. Ассоциация, вмешательство, контрфактуал: каждому уровню нужны допущения, которых нижний не даёт. Модель, обученная только предсказывать, в лучшем случае выучивает P(y | x) обучающего распределения; при вмешательстве или сдвиге её прогнозы могут подвести."
                        ]
                    }
                }
            ]
        },

        /* ----- t11. Guarantees: differential privacy and certified robustness ----- */
        t11: {
            steps: [
                {
                    type: "info", icon: "🔒", mono: true,
                    en: {
                        title: "ε-differential privacy: a bound on what an output reveals",
                        text: [
                            "A statistic or a model computed from personal data can reveal who is in the data. A **mechanism** M is a randomised algorithm that maps a dataset D to an output. Two datasets are **neighbours** when they differ in the record of one person (here: one record is replaced, and the size n is public).",
                            "M is **ε-differentially private** (ε-DP) when, for all neighbours D, D′ and every set S of outputs, the probability of S changes by at most the factor e^ε. The probability is over the randomness of M only: nothing is assumed about the data, or about what an attacker knows or can compute.",
                            "Its meaning, by Bayes’ rule: for an attacker who hesitates between D and D′, the posterior odds are the prior odds times a likelihood ratio that lies between e^(−ε) and e^ε. Whatever the output is, it moves the odds between two versions of one person’s record by at most the factor e^ε."
                        ],
                        example: ["P(M(D) ∈ S) ≤ e^ε·P(M(D′) ∈ S) for all neighbours D, D′ and all S", "posterior odds of D against D′ ≤ e^ε · prior odds", "ε = 0.1: e^ε ≈ 1.105", "ε = 10: e^ε ≈ 22,026, almost no formal protection"],
                        note: "The definition is symmetric: D and D′ can be swapped. It is a property of the mechanism, not of one output, and it must hold for the worst pair of neighbours, not on average. A deterministic M that is not constant is not ε-DP for any ε: the noise is necessary."
                    },
                    ru: {
                        title: "ε-дифференциальная приватность: граница того, что выдаёт результат",
                        text: [
                            "Статистика или модель, вычисленные по персональным данным, могут выдать, кто есть в данных. **Механизм** M — рандомизированный алгоритм, который по набору данных D выдаёт результат. Два набора — **соседние**, если они различаются записью одного человека (здесь: одна запись заменена, а размер n известен всем).",
                            "M **ε-дифференциально приватен** (ε-DP), если для любых соседних D, D′ и любого множества результатов S вероятность S меняется не более чем в e^ε раз. Вероятность берётся только по случайности самого M: ничего не предполагается ни о данных, ни о том, что знает и что может вычислить атакующий.",
                            "Смысл — по формуле Байеса: если атакующий выбирает между D и D′, апостериорные шансы равны априорным, умноженным на отношение правдоподобия, а оно лежит между e^(−ε) и e^ε. Каким бы ни был результат, шансы между двумя вариантами записи одного человека он меняет не более чем в e^ε раз."
                        ],
                        example: ["P(M(D) ∈ S) ≤ e^ε·P(M(D′) ∈ S) для любых соседних D, D′ и любого S", "апостериорные шансы D против D′ ≤ e^ε · априорные шансы", "ε = 0,1: e^ε ≈ 1,105", "ε = 10: e^ε ≈ 22 026, формальной защиты почти нет"],
                        note: "Определение симметрично: D и D′ можно поменять местами. Это свойство механизма, а не отдельного результата, и выполняться оно обязано для худшей пары соседних наборов, а не в среднем. Детерминированный M, не равный константе, не будет ε-DP ни при каком ε: без шума не обойтись."
                    }
                },
                {
                    type: "number", answer: 1.1, tolerance: 0.005,
                    en: {
                        q: "Randomised response to a yes/no question: each person reports the true answer with probability 0.75 and the opposite one otherwise. For what smallest ε is the report an ε-DP function of the true answer? Two decimal places.",
                        hint: "The two possible true answers are the neighbours. For each possible report, compare its probability under one and under the other.",
                        why: "For the report “yes”: P(“yes” | truth “yes”)/P(“yes” | truth “no”) = 0.75/0.25 = 3, and likewise for “no”. So e^ε = 3 and ε = ln 3 ≈ 1.10. The price is noise: for a true share π the mean share of “yes” reports is π·0.75 + (1 − π)·0.25, so an observed share q gives the estimate (q − 0.25)/0.5; q = 0.4 gives 0.3."
                    },
                    ru: {
                        q: "Рандомизированный ответ (randomized response) на вопрос «да/нет»: человек сообщает правду с вероятностью 0,75, а иначе — противоположный ответ. При каком наименьшем ε сообщение — ε-DP функция истинного ответа? Округли до сотых.",
                        hint: "Соседние наборы здесь — два возможных истинных ответа. Для каждого возможного сообщения сравни его вероятности при одном и при другом.",
                        why: "Для сообщения «да»: P(«да» | правда «да»)/P(«да» | правда «нет») = 0,75/0,25 = 3, и так же для «нет». Значит, e^ε = 3 и ε = ln 3 ≈ 1,10. Плата — шум: при истинной доле π доля сообщений «да» в среднем равна π·0,75 + (1 − π)·0,25, поэтому по наблюдаемой доле q получают оценку (q − 0,25)/0,5; q = 0,4 даёт 0,3."
                    }
                },
                {
                    type: "number", answer: 0.25, tolerance: 0.005, card: "t11a",
                    en: {
                        q: "M is ε-DP with e^ε = 3: P(M(D) ∈ S) ≤ 3·P(M(D′) ∈ S) for all neighbouring datasets D, D′ and all sets S. An attacker knows the data are one of two neighbours, D or D′, with the prior P(D) = 0.1. At most what is P(D | output)?",
                        hint: "Work with odds: the prior odds of D against D′, times the largest possible likelihood ratio.",
                        why: "Prior odds: 0.1/0.9 = 1/9. The likelihood ratio P(output | D)/P(output | D′) is at most e^ε = 3, so the posterior odds are at most 3/9 = 1/3: a probability of (1/3)/(1 + 1/3) = 0.25. Randomised response with a truth probability of 0.75 reaches this bound: 0.1·0.75/(0.1·0.75 + 0.9·0.25) = 0.25."
                    },
                    ru: {
                        q: "M — ε-DP с e^ε = 3: P(M(D) ∈ S) ≤ 3·P(M(D′) ∈ S) для любых соседних наборов D, D′ и любого множества S. Атакующий знает, что данные — один из двух соседей, D или D′; априорно P(D) = 0,1. Каково наибольшее P(D | результат)?",
                        hint: "Считай в шансах: априорные шансы D против D′, умноженные на наибольшее возможное отношение правдоподобия.",
                        why: "Априорные шансы: 0,1/0,9 = 1/9. Отношение правдоподобия P(результат | D)/P(результат | D′) не больше e^ε = 3, поэтому апостериорные шансы не больше 3/9 = 1/3: это вероятность (1/3)/(1 + 1/3) = 0,25. Рандомизированный ответ с вероятностью правды 0,75 достигает этой границы: 0,1·0,75/(0,1·0,75 + 0,9·0,25) = 0,25."
                    }
                },
                {
                    type: "info", icon: "📏", mono: true,
                    en: {
                        title: "Sensitivity and the Laplace mechanism",
                        text: [
                            "The noise has to hide whatever one person can change in the answer. The **sensitivity** of a numeric query f is Δ = max |f(D) − f(D′)| over all neighbours D, D′. A count (how many records have some property) has Δ = 1. The mean of n values in [0, 1] has Δ = 1/n: replacing one value moves the sum by at most 1.",
                            "The **Laplace mechanism** releases f(D) + Z, where Z has the Laplace density exp(−|z|/b)/(2b) with the scale b = Δ/ε. It is ε-DP for every query with sensitivity Δ. The noise has mean 0 and standard deviation b·√2, and it depends only on Δ and ε, not on the data."
                        ],
                        example: ["M(D) = f(D) + Z, density of Z: exp(−|z|/b) / (2b), b = Δ/ε", "standard deviation of Z: b·√2; P(|Z| ≥ t) = exp(−t/b)", "count, ε = 0.5: b = 1/0.5 = 2, standard deviation 2.83", "mean of n = 1000 values in [0, 1], ε = 0.1: b = (1/1000)/0.1 = 0.01"],
                        note: "Sensitivity is a worst case over all possible datasets, not over the one at hand. A query on unbounded values, such as a mean income, has infinite sensitivity: the values are first clipped to a fixed range."
                    },
                    ru: {
                        title: "Чувствительность и механизм Лапласа",
                        text: [
                            "Шуму нужно скрыть всё, что один человек может изменить в ответе. **Чувствительность** (sensitivity) числового запроса f — это Δ = max |f(D) − f(D′)| по всем соседним D, D′. У подсчёта (сколько записей имеют некое свойство) Δ = 1. У среднего n значений из [0; 1] Δ = 1/n: замена одного значения сдвигает сумму не больше чем на 1.",
                            "**Механизм Лапласа** выдаёт f(D) + Z, где Z имеет плотность Лапласа exp(−|z|/b)/(2b) с масштабом b = Δ/ε. Он ε-DP для любого запроса с чувствительностью Δ. У шума среднее 0 и стандартное отклонение b·√2, и зависит он только от Δ и ε, но не от данных."
                        ],
                        example: ["M(D) = f(D) + Z, плотность Z: exp(−|z|/b) / (2b), b = Δ/ε", "стандартное отклонение Z: b·√2; P(|Z| ≥ t) = exp(−t/b)", "подсчёт, ε = 0,5: b = 1/0,5 = 2, стандартное отклонение 2,83", "среднее n = 1000 значений из [0; 1], ε = 0,1: b = (1/1000)/0,1 = 0,01"],
                        note: "Чувствительность — худший случай по всем возможным наборам данных, а не по тому набору, что есть сейчас. У запроса к неограниченным значениям, например среднего дохода, чувствительность бесконечна: значения сначала обрезают до фиксированного отрезка."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "The Laplace mechanism releases f(D) + Z. The noise Z has the density exp(−|u|/b)/(2b) at the point u, with b = Δ/ε, where Δ is the sensitivity of f. Put the steps of the proof that it is ε-DP in order.",
                        items: ["Under D the output z has the density p(z) = exp(−|z − f(D)|/b)/(2b); under D′ it is p′(z), with f(D′)", "So at every z the ratio is p(z)/p′(z) = exp((|z − f(D′)| − |z − f(D)|)/b)", "By the triangle inequality the exponent is at most |f(D) − f(D′)|/b", "That is at most Δ/b = ε, so p(z) ≤ e^ε·p′(z) at every z", "Integrating over any set S of outputs: P(M(D) ∈ S) ≤ e^ε·P(M(D′) ∈ S)"],
                        hint: "Each line uses what the line before it has just produced. Start from the two densities.",
                        why: "The proof bounds the ratio of the two densities at every point; integration does the rest. It needs one property of the noise: the logarithm of its density changes by at most |u − v|/b between u and v. The Laplace density has exactly this rate, hence the scale Δ/ε. For Gaussian noise the ratio is unbounded in z."
                    },
                    ru: {
                        q: "Механизм Лапласа выдаёт f(D) + Z. Шум Z имеет плотность exp(−|u|/b)/(2b) в точке u, где b = Δ/ε, а Δ — чувствительность f. Расставь по порядку шаги доказательства того, что он ε-DP.",
                        items: ["При D результат z имеет плотность p(z) = exp(−|z − f(D)|/b)/(2b); при D′ — плотность p′(z), с f(D′)", "Значит, в каждой точке z отношение p(z)/p′(z) = exp((|z − f(D′)| − |z − f(D)|)/b)", "По неравенству треугольника показатель экспоненты не больше |f(D) − f(D′)|/b", "А это не больше Δ/b = ε, поэтому p(z) ≤ e^ε·p′(z) в каждой точке z", "Интегрируем по любому множеству результатов S: P(M(D) ∈ S) ≤ e^ε·P(M(D′) ∈ S)"],
                        hint: "Каждая строка использует то, что только что дала предыдущая. Начни с двух плотностей.",
                        why: "Доказательство ограничивает отношение двух плотностей в каждой точке, остальное делает интегрирование. От шума нужно одно свойство: логарифм его плотности меняется между u и v не больше чем на |u − v|/b. У плотности Лапласа скорость ровно такая, отсюда масштаб Δ/ε. У гауссова шума это отношение не ограничено по z."
                    }
                },
                {
                    type: "number", answer: 1415, tolerance: 1, card: "t11b",
                    en: {
                        q: "The mean of n values in [0, 1] gets Laplace noise of scale b = Δ/ε (standard deviation b·√2); Δ is the largest change of the mean if one value is replaced. For ε = 0.1, what is the smallest n with noise standard deviation ≤ 0.01?",
                        hint: "Find Δ for a mean of n values first, then write the standard deviation as a function of n. Take √2 with at least four decimals.",
                        why: "Replacing one value moves the sum by at most 1, so Δ = 1/n and b = 1/(n·ε) = 10/n. The standard deviation 10·√2/n is at most 0.01 when n ≥ 1000·√2 = 1414.2, so n = 1415. Privacy noise falls as 1/n, while the sampling error of a mean falls only as 1/√n: on large datasets a small ε costs little accuracy."
                    },
                    ru: {
                        q: "Среднее n значений из [0; 1] публикуют с шумом Лапласа масштаба b = Δ/ε; Δ — наибольшее изменение среднего при замене одного значения. Стандартное отклонение шума — b·√2. При каком наименьшем n оно не больше 0,01, если ε = 0,1?",
                        hint: "Сначала найди Δ для среднего n значений, затем запиши стандартное отклонение как функцию n. Возьми √2 не меньше чем с четырьмя знаками после запятой.",
                        why: "Замена одного значения меняет сумму не больше чем на 1, поэтому Δ = 1/n и b = 1/(n·ε) = 10/n. Стандартное отклонение 10·√2/n не больше 0,01 при n ≥ 1000·√2 = 1414,2, то есть n = 1415. Шум приватности убывает как 1/n, а выборочная ошибка среднего — лишь как 1/√n: на больших данных малое ε почти не стоит точности."
                    }
                },
                {
                    type: "info", icon: "💰", mono: true,
                    en: {
                        title: "The budget: three rules, and a relaxation",
                        text: [
                            "Three rules follow from the definition. **Post-processing**: a function of an ε-DP output, computed without the data, is ε-DP. **Composition**: releases with ε_1 … ε_k are together (ε_1 + … + ε_k)-DP: ε is a **privacy budget** spent by every release. **Group privacy**: for datasets differing in k records the factor is e^(k·ε).",
                            "**(ε, δ)-DP** relaxes the definition by an additive δ, taken far below 1/n. It admits the **Gaussian mechanism**: noise N(0, σ²·I) calibrated to the L2 sensitivity Δ_2 = max ‖f(D) − f(D′)‖_2. Composition still adds up both the ε and the δ, and post-processing still costs nothing.",
                            "Private training (DP-SGD) combines these pieces. Clip each example’s gradient to a norm C: then one example changes the sum of the gradients by at most C when it is added or removed (2C when replaced). Add Gaussian noise to the sum. Account for the budget over all steps: the trained model is post-processing."
                        ],
                        example: ["post-processing: g(M(D)) is ε-DP for every g that does not use D", "composition: ε_1 + … + ε_k; a group of k records: k·ε", "(ε, δ)-DP: P(M(D) ∈ S) ≤ e^ε·P(M(D′) ∈ S) + δ", "Gaussian mechanism, classical bound for 0 < ε < 1:", "σ = Δ_2·√(2·ln(1.25/δ)) / ε gives (ε, δ)-DP"],
                        note: "Why δ must be tiny: publishing one record chosen at random satisfies the relaxed definition with ε = 0 and δ = 1/n. For many steps there are tighter accounting theorems than the plain sum: for a small ε per step the total ε grows roughly as √k, not k, at the price of a slightly larger δ."
                    },
                    ru: {
                        title: "Бюджет: три правила и одно ослабление",
                        text: [
                            "Три следствия определения. **Постобработка**: функция результата ε-DP механизма, вычисленная без данных, тоже ε-DP. **Композиция**: публикации с ε_1 … ε_k вместе дают (ε_1 + … + ε_k)-DP: ε — **бюджет приватности**, и его тратит каждая публикация. **Групповая приватность**: если наборы различаются k записями, множитель — e^(k·ε).",
                            "**(ε, δ)-DP** ослабляет определение на аддитивное δ, которое берут намного меньше 1/n. Оно допускает **гауссов механизм**: шум N(0, σ²·I), откалиброванный по L2-чувствительности Δ_2 = max ‖f(D) − f(D′)‖_2. Композиция по-прежнему складывает и ε, и δ, а постобработка по-прежнему ничего не стоит.",
                            "Приватное обучение (DP-SGD) собирает всё это вместе. Градиент каждого примера обрезают до нормы C: тогда один пример меняет сумму градиентов не больше чем на C при добавлении или удалении (на 2C при замене). К сумме добавляют гауссов шум. Бюджет учитывают по всем шагам: обученная модель — уже постобработка."
                        ],
                        example: ["постобработка (post-processing): g(M(D)) — ε-DP для любой g без доступа к D", "композиция: ε_1 + … + ε_k; группа из k записей: k·ε", "(ε, δ)-DP: P(M(D) ∈ S) ≤ e^ε·P(M(D′) ∈ S) + δ", "гауссов механизм, классическая оценка при 0 < ε < 1:", "σ = Δ_2·√(2·ln(1,25/δ)) / ε даёт (ε, δ)-DP"],
                        note: "Почему δ обязано быть крошечным: публикация одной случайно выбранной записи удовлетворяет ослабленному определению с ε = 0 и δ = 1/n. Для многих шагов есть более точные теоремы учёта, чем простая сумма: при малом ε на шаг общее ε растёт примерно как √k, а не k, ценой чуть большего δ."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "M is an ε-DP mechanism for a query f, and y = M(D) has been computed. Is what gets published still guaranteed to be ε-DP?",
                        groups: ["Still ε-DP", "Not guaranteed any more"],
                        items: [["y rounded to the nearest integer", 0], ["y together with a second output of M on D, with fresh noise", 1], ["y if it exceeds a threshold fixed in advance, otherwise the words “no answer”", 0], ["A new output of M, redrawn until it lies within 5 of the true f(D)", 1], ["A model trained on y and on public data only", 0], ["y together with the exact f(D) rounded to the nearest thousand", 1]],
                        why: "Rounding, a fixed threshold and training on y are functions of y alone: post-processing. A second output spends ε again: 2·ε by composition. Redrawing until the output is near f(D), and releasing a rounded f(D), look at the data again without calibrated noise: in the first case the very set of possible outputs depends on D."
                    },
                    ru: {
                        q: "M — ε-DP механизм для запроса f, и результат y = M(D) уже вычислен. Гарантирована ли по-прежнему ε-DP для того, что публикуют?",
                        groups: ["По-прежнему ε-DP", "Гарантии уже нет"],
                        items: [["y, округлённое до целого", 0], ["y вместе со вторым результатом M на D, с новым шумом", 1], ["y, если оно выше порога, заданного заранее, а иначе — слова «нет ответа»", 0], ["Новый результат M: его разыгрывают заново, пока он не попадёт в пределы 5 от истинного f(D)", 1], ["Модель, обученная только на y и на открытых данных", 0], ["y вместе с точным f(D), округлённым до тысяч", 1]],
                        why: "Округление, порог и обучение на y — функции одного лишь y: это постобработка. Второй результат тратит ε ещё раз: по композиции 2·ε. Повторный розыгрыш до попадания в окрестность f(D) и публикация округлённого f(D) снова смотрят в данные без откалиброванного шума: в первом случае от D зависит само множество возможных результатов."
                    }
                },
                {
                    type: "choice", card: "t11c",
                    en: {
                        q: "A count is asked 100 times; each answer gets fresh Laplace noise and is ε-DP on its own. The analyst publishes only the average and argues: averaging is post-processing, so the average is ε-DP. Where does the argument fail?",
                        options: ["Post-processing keeps the guarantee of the 100 answers taken together, and composition makes that 100·ε", "Averaging is not post-processing: it removes noise, and post-processing is only allowed to add noise", "It forgets that averaging divides the sensitivity by 100, so the true guarantee is the stronger ε/100", "Post-processing covers only one-to-one functions, and the 100 answers cannot be recovered from the average"],
                        hint: "Post-processing of what? Name the mechanism whose output the average is a function of.",
                        why: "The average is a function of the 100 answers, so it is post-processing (every function is), but of the vector of all answers, and that vector is 100·ε-DP by composition. The average still moves by 1 with the count; its noise is only 10 times smaller than one answer’s, while one answer with the budget 100·ε has 100 times less."
                    },
                    ru: {
                        q: "Подсчёт запрашивают 100 раз; каждый ответ получает новый шум Лапласа и по отдельности ε-DP. Аналитик публикует только среднее и рассуждает: усреднение — постобработка, значит, среднее тоже ε-DP. Где ошибка в рассуждении?",
                        options: ["Постобработка сохраняет гарантию всех 100 ответов, взятых вместе, а она по композиции равна 100·ε", "Усреднение — не постобработка: оно убирает шум, а постобработке разрешено только добавлять шум", "Не учтено, что усреднение делит чувствительность на 100: настоящая гарантия сильнее, ε/100", "Постобработка допускает только взаимно однозначные функции, а по среднему 100 ответов не восстановить"],
                        hint: "Постобработка чего именно? Назови механизм, функцией результата которого является среднее.",
                        why: "Среднее — функция 100 ответов, то есть постобработка (ею является любая функция), но постобработка вектора всех ответов, а он по композиции 100·ε-DP. Среднее по-прежнему сдвигается на 1 вместе с подсчётом, а шум у него лишь в 10 раз меньше, чем у одного ответа; у одного ответа с бюджетом 100·ε шум меньше в 100 раз."
                    }
                },
                {
                    type: "number", answer: 9.69, tolerance: 0.015,
                    en: {
                        q: "The Gaussian mechanism adds noise N(0, σ²) with σ = Δ_2·√(2·ln(1.25/δ))/ε; by the classical bound this gives (ε, δ)-DP for 0 < ε < 1. What σ does it prescribe for Δ_2 = 1, ε = 0.5 and δ = 10⁻⁵? Two decimal places.",
                        hint: "Start with 1.25/δ = 125,000 and work from the inside out. Keep three decimals on the way: the division by ε doubles every rounding error.",
                        why: "ln(1.25/10⁻⁵) = ln 125,000 = 11.736; 2·11.736 = 23.472; √23.472 = 4.845; σ = 4.845/0.5 = 9.69. For one number the Laplace mechanism needs less (b = 2, standard deviation 2.83, and δ = 0). Gaussian noise pays off for vectors such as gradients: if each of d coordinates changes by c, the L1 sensitivity is d·c, but Δ_2 is only √d·c."
                    },
                    ru: {
                        q: "Гауссов механизм добавляет шум N(0, σ²) с σ = Δ_2·√(2·ln(1,25/δ))/ε; по классической оценке это даёт (ε, δ)-DP при 0 < ε < 1. Какое σ получается при Δ_2 = 1, ε = 0,5 и δ = 10⁻⁵? Округли до сотых.",
                        hint: "Начни с 1,25/δ = 125 000 и двигайся изнутри наружу. Сохраняй по пути три знака после запятой: деление на ε удваивает каждую ошибку округления.",
                        why: "ln(1,25/10⁻⁵) = ln 125 000 = 11,736; 2·11,736 = 23,472; √23,472 = 4,845; σ = 4,845/0,5 = 9,69. Для одного числа механизму Лапласа нужно меньше (b = 2, стандартное отклонение 2,83, и δ = 0). Гауссов шум выигрывает на векторах (градиентах): если каждая из d координат меняется на c, L1-чувствительность равна d·c, а Δ_2 — лишь √d·c."
                    }
                },
                {
                    type: "info", icon: "🛡️", mono: true,
                    en: {
                        title: "Attacks, and a certificate against them",
                        text: [
                            "An **adversarial example** is an input x + δ with a small perturbation δ that changes the model’s answer. For a linear score w·x and a budget of ε per coordinate, the score can shift by up to ε·‖w‖_1, reached by δ = ε·sign(w). With many coordinates ‖w‖_1 is large, although every single change is tiny.",
                            "**Randomised smoothing** turns any base classifier f into a **smoothed classifier** g: g(x) is the class that f returns most often on x + noise, with noise ~ N(0, σ²·I). Theorem: if that class has probability at least p_A > ½, then g returns the same class at every x + δ with ‖δ‖_2 < R, the certified radius below.",
                            "The certificate holds against every attack and asks nothing of f. Its limits: it is about g, not f; it covers only the L2 norm, and only up to R; p_A is estimated from samples of the noise, so it holds with a chosen confidence; and a larger σ blurs the input, which costs accuracy."
                        ],
                        example: ["max of w·δ over all δ with |δ_i| ≤ ε: ε·‖w‖_1", "1000 weights of size 0.05, ε = 0.01: 0.01·50 = 0.5", "certified radius: R = σ·Φ⁻¹(p_A)", "σ = 0.5: p_A = 0.8413 → R = 0.5; p_A = 0.9772 → R = 1.0"],
                        note: "Letters: in this field ε is the attacker’s budget and δ a perturbation, not the ε and δ of privacy. Φ⁻¹ is the inverse of the standard normal distribution function: Φ⁻¹(0.8413) ≈ 1 and Φ⁻¹(0.9772) ≈ 2."
                    },
                    ru: {
                        title: "Атаки и сертификат против них",
                        text: [
                            "**Состязательный пример** (adversarial example) — вход x + δ с малым возмущением δ, которое меняет ответ модели. Для линейной оценки (score) w·x и бюджета атаки ε на координату оценку можно сдвинуть на величину до ε·‖w‖_1: это даёт δ = ε·sign(w). При большом числе координат ‖w‖_1 велика, хотя каждое изменение крошечное.",
                            "**Рандомизированное сглаживание** (randomized smoothing) строит по любому базовому классификатору f **сглаженный классификатор** g: g(x) — класс, который f чаще всего выдаёт на x + шум, шум ~ N(0, σ²·I). Теорема: если вероятность этого класса не меньше p_A > ½, то g выдаёт его же в каждой точке x + δ с ‖δ‖_2 < R (формула ниже).",
                            "Сертификат верен против любой атаки и ничего не требует от f. Его пределы: он относится к g, а не к f; покрывает только норму L2 и только до радиуса R; p_A оценивают по выборке шума, так что он верен с выбранной доверительной вероятностью; а большее σ размывает вход, и за это платят точностью."
                        ],
                        example: ["максимум w·δ по всем δ с |δ_i| ≤ ε: ε·‖w‖_1", "1000 весов величиной 0,05, ε = 0,01: 0,01·50 = 0,5", "сертифицированный радиус: R = σ·Φ⁻¹(p_A)", "σ = 0,5: p_A = 0,8413 → R = 0,5; p_A = 0,9772 → R = 1,0"],
                        note: "Об обозначениях: в этой области ε — бюджет атаки, а δ — возмущение, а не ε и δ приватности. Φ⁻¹ — функция, обратная функции стандартного нормального распределения: Φ⁻¹(0,8413) ≈ 1 и Φ⁻¹(0,9772) ≈ 2."
                    }
                },
                {
                    type: "number", answer: 0.018, tolerance: 0.0005, card: "t11d",
                    en: {
                        q: "Randomised smoothing, noise N(0, σ²·I): if the top class has probability ≥ p_A > ½, the prediction is fixed for ‖δ‖_2 < R = σ·Φ⁻¹(p_A). From the table: below what ε is every δ with all |δ_i| ≤ ε certified? Three decimals.",
                        table: { side: true, head: ["", "Value"], rows: [["σ", "0.5"], ["p_A", "0.9772"], ["Φ⁻¹(0.9772)", "≈ 2"], ["Coordinates of the input, d", "3072"]] },
                        hint: "First R. Then: how long, in the L2 norm, can a δ with all |δ_i| ≤ ε be?",
                        why: "R = 0.5·2 = 1. A δ with all |δ_i| ≤ ε has ‖δ‖_2 ≤ ε·√d, with equality when every |δ_i| = ε. So all of them are covered when ε·√3072 = 55.43·ε < 1, that is, when ε < 0.018. An L2 certificate of radius 1 covers only tiny changes per coordinate: the factor √d is the price of changing the norm."
                    },
                    ru: {
                        q: "Рандомизированное сглаживание, шум N(0, σ²·I): если вероятность класса-победителя ≥ p_A > ½, ответ не меняется при ‖δ‖_2 < R = σ·Φ⁻¹(p_A). По таблице: ниже какого ε сертифицировано любое δ со всеми |δ_i| ≤ ε? Округли до тысячных.",
                        table: { side: true, head: ["", "Значение"], rows: [["σ", "0,5"], ["p_A", "0,9772"], ["Φ⁻¹(0,9772)", "≈ 2"], ["Число координат входа d", "3072"]] },
                        hint: "Сначала R. Затем: какой наибольшей может быть норма L2 у δ со всеми |δ_i| ≤ ε?",
                        why: "R = 0,5·2 = 1. У δ со всеми |δ_i| ≤ ε норма ‖δ‖_2 ≤ ε·√d, и равенство достигается, когда все |δ_i| = ε. Значит, все такие δ покрыты, когда ε·√3072 = 55,43·ε < 1, то есть при ε < 0,018. Сертификат радиуса 1 в норме L2 покрывает лишь крошечные изменения каждой координаты: множитель √d — цена смены нормы."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge, on paper. The base classifier is a half-space: f(x) = A if w·x + b > 0, else B. For x with w·x + b > 0 and noise N(0, σ²·I), find p_A and R = σ·Φ⁻¹(p_A). Compare R with the distance from x to the boundary. What follows?",
                        answer: [
                            "Let m = (w·x + b)/‖w‖_2, the distance from x to the hyperplane. For noise n ~ N(0, σ²·I) the projection w·n is distributed as N(0, σ²·‖w‖_2²), so p_A = P(w·n > −(w·x + b)) = Φ(m/σ).",
                            "Then R = σ·Φ⁻¹(Φ(m/σ)) = m: the certified radius is exactly the distance to the boundary. And here g = f, because Φ(m/σ) > ½ exactly when m > 0. So at distance m the answer of g really changes: no theorem that uses only p_A and σ can give a larger radius.",
                            "The half-space is the worst case of the theorem: among all base classifiers with the same p_A at x, it loses probability fastest as x moves to its boundary (the Neyman–Pearson lemma, the core of the proof). And smoothing does not make a linear model more robust: it certifies the stability under noise that f already has."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой, на бумаге. Базовый классификатор — полупространство: f(x) = A при w·x + b > 0, иначе B. Для x с w·x + b > 0 и шума N(0, σ²·I) найди p_A и R = σ·Φ⁻¹(p_A). Сравни R с расстоянием от x до границы. Какой вывод?",
                        answer: [
                            "Пусть m = (w·x + b)/‖w‖_2 — расстояние от x до гиперплоскости. Для шума n ~ N(0, σ²·I) проекция w·n распределена как N(0, σ²·‖w‖_2²), поэтому p_A = P(w·n > −(w·x + b)) = Φ(m/σ).",
                            "Тогда R = σ·Φ⁻¹(Φ(m/σ)) = m: сертифицированный радиус в точности равен расстоянию до границы. При этом g = f, ведь Φ(m/σ) > ½ ровно тогда, когда m > 0. Значит, на расстоянии m ответ g действительно меняется: никакая теорема, использующая только p_A и σ, не даст большего радиуса.",
                            "Полупространство — худший случай теоремы: среди всех базовых классификаторов с тем же p_A в точке x оно быстрее всех теряет вероятность при сдвиге x к его границе (лемма Неймана — Пирсона, ядро доказательства). И сглаживание не делает линейную модель устойчивее: оно сертифицирует ту устойчивость к шуму, которая у f уже есть."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "ε-DP: `P(M(D) ∈ S) ≤ e^ε·P(M(D′) ∈ S)` for all neighbours D, D′ and all S. For every attacker, posterior odds ≤ e^ε · prior odds. Randomised response with a truth probability p > ½ has ε = ln(p/(1 − p)).",
                            "Laplace mechanism: noise of scale `b = Δ/ε` (standard deviation b·√2), where the sensitivity Δ is the largest change of the query between neighbours. A count has Δ = 1, a mean of n values in [0, 1] has Δ = 1/n. The proof is the triangle inequality applied to the densities.",
                            "Post-processing is free, composition adds up the ε of all releases, a group of k records gets k·ε. (ε, δ)-DP admits Gaussian noise: `σ = Δ_2·√(2·ln(1.25/δ))/ε` for 0 < ε < 1. DP-SGD is clipping of the gradients, Gaussian noise and accounting over the steps.",
                            "A linear score w·x shifts by up to ε·‖w‖_1 when every coordinate moves by at most ε. Randomised smoothing certifies the smoothed classifier within the L2 radius `R = σ·Φ⁻¹(p_A)`, which is exact for a half-space; coordinate-wise changes are covered only below R/√d."
                        ]
                    },
                    ru: {
                        points: [
                            "ε-DP: `P(M(D) ∈ S) ≤ e^ε·P(M(D′) ∈ S)` для любых соседних D, D′ и любого S. Для любого атакующего апостериорные шансы ≤ e^ε · априорные. У рандомизированного ответа с вероятностью правды p > ½ получается ε = ln(p/(1 − p)).",
                            "Механизм Лапласа: шум масштаба `b = Δ/ε` (стандартное отклонение b·√2), где чувствительность Δ — наибольшее изменение запроса между соседними наборами. У подсчёта Δ = 1, у среднего n значений из [0; 1] Δ = 1/n. Доказательство — неравенство треугольника для плотностей.",
                            "Постобработка бесплатна, композиция складывает ε всех публикаций, группа из k записей получает k·ε. (ε, δ)-DP допускает гауссов шум: `σ = Δ_2·√(2·ln(1,25/δ))/ε` при 0 < ε < 1. DP-SGD — это обрезка градиентов, гауссов шум и учёт бюджета по шагам.",
                            "Линейная оценка w·x сдвигается на величину до ε·‖w‖_1, если каждую координату менять не больше чем на ε. Рандомизированное сглаживание сертифицирует сглаженный классификатор в радиусе L2 `R = σ·Φ⁻¹(p_A)`, точном для полупространства; покоординатные изменения покрыты лишь ниже R/√d."
                        ]
                    }
                }
            ]
        },

        /* ----- t12. Limits: what cannot be learned, computed or proved ----- */
        t12: {
            steps: [
                {
                    type: "info", icon: "🎲", mono: true,
                    en: {
                        title: "No free lunch: data alone decide nothing",
                        text: [
                            "Take all binary functions on n-bit inputs: there are 2^(2^n) of them. Let the target f be any one of them with equal probability, and let a learner see the labels of m distinct inputs. Exactly 2^(2^n − m) functions fit this sample, and at any unseen input x exactly half of them say f(x) = 1.",
                            "So whatever the learner predicts at x, it is wrong with probability ½. This is the **no-free-lunch theorem**: averaged uniformly over all target functions, every learning algorithm has the same expected error on inputs outside its sample, ½ for binary labels.",
                            "The uniform average is the whole assumption: under it the unseen labels are independent of the seen ones. Real problems are not uniform over all functions. An **inductive bias**, a preference among hypotheses that fit the data equally well, is what lets a learner generalise: a necessity, not a defect."
                        ],
                        example: ["binary functions on n-bit inputs: 2^(2^n); n = 3: 2⁸ = 256", "fit m distinct labelled inputs: 2^(2^n − m); n = 3, m = 5: 2³ = 8", "of these, f(x) = 1 at a given unseen x: half, here 4", "error at an unseen x, averaged over targets: 1/2 for every learner"],
                        note: "The theorem also covers a randomised learner and a learner that chooses which inputs to have labelled: the labels it has not seen remain fair coins."
                    },
                    ru: {
                        title: "Бесплатных завтраков не бывает: одни данные ничего не решают",
                        text: [
                            "Возьмём все бинарные функции от n-битных входов: их 2^(2^n). Пусть целевой функцией f с равной вероятностью может оказаться любая из них, а алгоритм видит метки m различных входов. С этой выборкой согласуются ровно 2^(2^n − m) функций, и на любом новом входе x ровно половина из них даёт f(x) = 1.",
                            "Значит, что бы алгоритм ни предсказал в точке x, он ошибётся с вероятностью ½. Это **теорема об отсутствии бесплатных завтраков** (no free lunch): при равномерном усреднении по всем целевым функциям у любого алгоритма обучения одна и та же ожидаемая ошибка на входах вне выборки — ½ для бинарных меток.",
                            "Всё предположение — в равномерности усреднения: при нём метки новых входов не зависят от уже увиденных. Реальные задачи не равномерны по всем функциям. Обобщать позволяет **индуктивное смещение** (inductive bias) — предпочтение среди гипотез, одинаково хорошо согласующихся с данными: это необходимость, а не изъян."
                        ],
                        example: ["бинарных функций от n-битных входов: 2^(2^n); n = 3: 2⁸ = 256", "согласуются с m различными размеченными входами: 2^(2^n − m); n = 3, m = 5: 2³ = 8", "из них f(x) = 1 на данном новом входе x: половина, здесь 4", "ошибка на новом входе x в среднем по целевым функциям: 1/2 у любого алгоритма"],
                        note: "Теорема верна и для рандомизированного алгоритма, и для алгоритма, который самостоятельно выбирает, какие входы разметить: метки, которых он не видел, остаются бросками честной монеты."
                    }
                },
                {
                    type: "number", answer: 0.11, tolerance: 0.005, card: "t12a",
                    en: {
                        q: "Every binary function of 4-bit inputs is an equally likely target. A learner sees the labels of 10 distinct inputs and predicts those of the other 6. With what probability are at least 5 of the 6 predictions right? Two decimals.",
                        hint: "How many functions fit the sample? How many of them agree with the learner on all six unseen inputs, and how many on exactly five?",
                        why: "There are 2⁴ = 16 inputs, 6 of them unseen, and 2⁶ = 64 equally likely functions fit the sample. One agrees with all six predictions and 6 agree with exactly five: (1 + 6)/64 = 0.109 ≈ 0.11. It is the same for every learner: the unseen labels are fair coins, so the number of right predictions is Binomial(6, ½)."
                    },
                    ru: {
                        q: "Все бинарные функции от 4-битных входов равновероятны как целевые. Алгоритм видит метки 10 различных входов и предсказывает метки остальных 6. С какой вероятностью верны хотя бы 5 из 6 предсказаний? Округли до сотых.",
                        hint: "Сколько функций согласуется с выборкой? Сколько из них совпадает с предсказаниями на всех шести новых входах, а сколько — ровно на пяти?",
                        why: "Входов 2⁴ = 16, из них 6 новых, и с выборкой согласуются 2⁶ = 64 равновероятные функции. Одна совпадает со всеми шестью предсказаниями, 6 — ровно с пятью: (1 + 6)/64 = 0,109 ≈ 0,11. Так у любого алгоритма: метки новых входов — броски честной монеты, и число верных предсказаний имеет распределение Bin(6, ½)."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A model x = g(z) with z ~ N(0, I) in two dimensions reproduces the data distribution exactly. Its author concludes: “so z_1 and z_2 are the true independent factors behind the data.” Which fact breaks this step?",
                        options: ["For every rotation R, the model x = g(R·z) gives the same distribution of x from rotated factors", "The factors are fixed only up to their order and their signs, so their labels are arbitrary", "Independent z_1 and z_2 cannot produce dependent coordinates of x unless g is linear", "A Gaussian z is too simple a prior: no g can turn it into the distribution of real data"],
                        hint: "Which transformations of z leave the distribution N(0, I) unchanged? List all of them, not only the obvious ones.",
                        why: "If z ~ N(0, I), R·z ~ N(0, I) for every rotation R, so g(z) and g(R·z) have the same distribution, while their factors can differ by more than order and sign. No data can separate the two models: without an inductive bias “the true factors” are not identifiable. Nor do observational data alone, in general, fix causal structure."
                    },
                    ru: {
                        q: "Модель x = g(z) с z ~ N(0, I) в двух измерениях в точности воспроизводит распределение данных. Автор заключает: «значит, z_1 и z_2 — истинные независимые факторы, стоящие за данными». Какой факт разрушает этот шаг?",
                        options: ["При любом повороте R модель x = g(R·z) даёт то же распределение x из повёрнутых факторов", "Факторы определены лишь с точностью до порядка и знаков, так что их названия условны", "Независимые z_1 и z_2 не могут дать зависимые координаты x, если g не линейна", "Гауссов z — слишком простое априорное распределение: никакая g не превратит его в реальные данные"],
                        hint: "Какие преобразования z не меняют распределение N(0, I)? Перечисли все, а не только очевидные.",
                        why: "Если z ~ N(0, I), то и R·z ~ N(0, I) при любом повороте R, поэтому g(z) и g(R·z) распределены одинаково, а факторы могут отличаться не только порядком и знаками. Данные их не различат: без индуктивного смещения «истинные факторы» неидентифицируемы. С причинной структурой так же: одних наблюдательных данных в общем случае мало."
                    }
                },
                {
                    type: "info", icon: "🔐", mono: true,
                    en: {
                        title: "Parities: few examples, hard computation",
                        text: [
                            "A strong bias makes learning possible. A **parity** labels x by the XOR of an unknown subset S of its n bits: 2^n candidate targets instead of 2^(2^n). Each example is one linear equation mod 2 for S, so Gaussian elimination recovers S in polynomial time from about n random examples.",
                            "Now restrict the algorithm instead. A **statistical query** (SQ) algorithm never sees single examples: it picks φ(x, y) with values in [−1, 1] and receives E[φ(x, y)] up to an error τ (any value that close may come back). For uniform inputs, identifying the parity then takes more than (2^n − 1)·τ² queries in the worst case.",
                            "Gradient descent on an expected loss is of this kind when its gradients are averages known only up to τ. If every label is flipped independently with probability 0.1, elimination fails: the number of examples needed still grows only linearly in n, yet no polynomial-time algorithm is known, and some cryptography relies on that."
                        ],
                        example: ["y = XOR of the bits x_i over i in S, S unknown: 2^n parities", "a wrong parity fits one example (uniform input) with probability 1/2", "P(some wrong parity fits all m examples) ≤ (2^n − 1)·2^(−m)", "SQ with tolerance τ: more than (2^n − 1)·τ² queries"],
                        note: "Worst-case hardness is common: deciding whether a network of just three threshold units (two hidden, one output) can fit a given training set exactly is NP-complete. That training succeeds in practice shows that typical instances are not the worst ones."
                    },
                    ru: {
                        title: "Функции чётности: примеров мало, вычислений много",
                        text: [
                            "Сильное смещение делает обучение возможным. **Функция чётности** (parity) ставит входу x метку — XOR неизвестного подмножества S его n бит: кандидатов 2^n вместо 2^(2^n). Каждый пример — одно линейное уравнение по модулю 2 относительно S, и метод Гаусса находит S за полиномиальное время примерно по n случайным примерам.",
                            "Теперь ограничим алгоритм. Алгоритм на **статистических запросах** (statistical query, SQ) не видит отдельных примеров: он выбирает φ(x, y) со значениями в [−1; 1] и получает E[φ(x, y)] с точностью до τ (любое столь близкое число). При равномерных входах поиск чётности требует в худшем случае больше (2^n − 1)·τ² запросов.",
                            "Таков и градиентный спуск по ожидаемым потерям, если его градиенты — средние, известные лишь с точностью τ. А если каждую метку независимо инвертировать с вероятностью 0,1, метод Гаусса не работает: примеров по-прежнему нужно порядка n, но полиномиальный алгоритм неизвестен, и на этом держится часть криптографии."
                        ],
                        example: ["y = XOR битов x_i по i из S, S неизвестно: 2^n функций чётности", "неверная чётность согласуется с одним примером (вход равномерен) с вероятностью 1/2", "P(какая-то неверная чётность согласуется со всеми m примерами) ≤ (2^n − 1)·2^(−m)", "SQ с допуском τ: больше (2^n − 1)·τ² запросов"],
                        note: "Трудность в худшем случае — обычное дело: уже для сети всего из трёх пороговых нейронов (два скрытых, один выходной) задача «можно ли точно воспроизвести данную обучающую выборку» NP-полна. Раз обучение на практике удаётся, типичные задачи — не худшие."
                    }
                },
                {
                    type: "number", answer: 17,
                    en: {
                        q: "A parity of n = 10 bits is learned from m examples with uniform inputs and correct labels. P(some wrong parity fits all m examples) ≤ (2^n − 1)·2^(−m). What is the smallest m for which this bound is at most 0.01?",
                        hint: "Solve 1023·2^(−m) ≤ 0.01 for m with a base-2 logarithm. A number of examples is rounded up.",
                        why: "(2^10 − 1)·2^(−m) ≤ 0.01 means 2^m ≥ 1023·100, so m ≥ log₂ 1023 + log₂ 100 = 10.00 + 6.64 = 16.64 and m = 17: about n + log₂(1/δ) examples for a failure probability δ. Check: 1023/2¹⁷ = 0.0078, but 1023/2¹⁶ = 0.0156. Without the bias, 17 labels of distinct inputs still leave 2^1007 of the 2^1024 binary functions on 10 bits."
                    },
                    ru: {
                        q: "Чётность от n = 10 бит ищут по m примерам с равномерными входами и верными метками. P(какая-то неверная чётность согласуется со всеми m примерами) ≤ (2^n − 1)·2^(−m). При каком наименьшем m эта оценка не больше 0,01?",
                        hint: "Реши 1023·2^(−m) ≤ 0,01 относительно m через логарифм по основанию 2. Число примеров округляют вверх.",
                        why: "(2^10 − 1)·2^(−m) ≤ 0,01 означает 2^m ≥ 1023·100, то есть m ≥ log₂ 1023 + log₂ 100 = 10,00 + 6,64 = 16,64 и m = 17: примерно n + log₂(1/δ) примеров при вероятности неудачи δ. Проверка: 1023/2¹⁷ = 0,0078, а 1023/2¹⁶ = 0,0156. Без смещения 17 меток различных входов оставляют 2^1007 из 2^1024 бинарных функций от 10 бит."
                    }
                },
                {
                    type: "number", answer: 44, card: "t12b",
                    en: {
                        q: "With uniform inputs, finding a parity of n bits can take more than (2^n − 1)·τ² statistical queries, each an average E[φ(x, y)] returned only up to ±τ. For τ = 0.01, what is the smallest n at which this bound exceeds 10⁹ queries?",
                        hint: "Write the condition as an inequality for 2^n and take a base-2 logarithm.",
                        why: "(2^n − 1)·10^(−4) > 10⁹ means 2^n > 10¹³ + 1, so n > 13·log₂ 10 = 43.2 and n = 44: there the bound is 1.76·10⁹, at n = 43 only 0.88·10⁹. Gaussian elimination, which reads single examples, needs about n + log₂(1/δ) of them: 51 for δ = 0.01. Few examples are enough; a feasible number of averages is not."
                    },
                    ru: {
                        q: "При равномерных входах поиск чётности от n бит в худшем случае требует больше (2^n − 1)·τ² статистических запросов; каждый даёт среднее E[φ(x, y)] с точностью ±τ. При τ = 0,01 с какого наименьшего n оценка превышает 10⁹ запросов?",
                        hint: "Запиши условие как неравенство для 2^n и возьми логарифм по основанию 2.",
                        why: "(2^n − 1)·10^(−4) > 10⁹ означает 2^n > 10¹³ + 1, то есть n > 13·log₂ 10 = 43,2 и n = 44: там оценка равна 1,76·10⁹, а при n = 43 лишь 0,88·10⁹. Методу Гаусса, который читает отдельные примеры, хватает примерно n + log₂(1/δ) примеров: 51 при δ = 0,01. Примеров нужно мало, а средних — непосильно много."
                    }
                },
                {
                    type: "info", icon: "⛔",
                    en: {
                        title: "Undecidable: Rice's theorem",
                        text: [
                            "Some questions have no algorithm at all, whatever time is allowed. The classic one is the **halting problem**: no algorithm decides, for every program P and every input x, whether P eventually halts on x.",
                            "**Rice's theorem** extends this to every non-trivial **semantic property**: a property of the partial function a program computes (its input-output behaviour, not its code) that some programs have and others lack. No algorithm decides such a property for arbitrary programs.",
                            "So “verify that this system never does X” has no general algorithmic solution. What stays possible: restricted classes (finite-state systems; a fixed network evaluated once, which is a finite circuit), bounded questions (the first k steps of a run), and a proof written for one particular program."
                        ],
                        note: "Decidable is not the same as easy: verifying a ReLU network against linear constraints on its inputs and outputs is decidable but NP-hard in the worst case. And a system that runs a network in a loop with unbounded memory can be as general as an arbitrary program."
                    },
                    ru: {
                        title: "Неразрешимость: теорема Райса",
                        text: [
                            "У некоторых вопросов алгоритма нет вообще, сколько бы времени ни дали. Классический пример — **проблема остановки**: никакой алгоритм не определяет для любой программы P и любого входа x, остановится ли когда-нибудь P на x.",
                            "**Теорема Райса** распространяет это на любое нетривиальное **семантическое свойство** — свойство частичной функции, которую вычисляет программа (её поведения «вход — выход», а не кода), причём такое, что у одних программ оно есть, а у других нет. Никакой алгоритм не распознаёт такое свойство у произвольных программ.",
                            "Поэтому у задачи «проверить, что система никогда не сделает X» нет общего алгоритмического решения. Что остаётся: ограниченные классы (системы с конечным числом состояний; фиксированная сеть, вычисляемая один раз, — конечная схема), ограниченные вопросы (первые k шагов) и доказательство для одной конкретной программы."
                        ],
                        note: "Разрешимо — не значит легко: проверка ReLU-сети на соответствие линейным ограничениям на входы и выходы разрешима, но в худшем случае NP-трудна. А система, которая запускает сеть в цикле с неограниченной памятью, может быть столь же общей, как произвольная программа."
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Order the proof that no algorithm decides, for every program, whether it ever outputs the string X (on at least one input). The proof reduces the halting problem to this question.",
                        items: ["Suppose an algorithm D decides, for every program, whether it ever outputs the string X", "Give D this program Q, built from any P and x: on any input, run P on x, discarding its output, then output X", "Q outputs X exactly when P halts on x: if P runs forever, Q never reaches its last instruction", "So D's verdict on Q says whether P halts on x: D would yield an algorithm for the halting problem", "The halting problem is undecidable, so the assumed D cannot exist"],
                        hint: "A proof by contradiction opens with the assumption it will refute. Every later line uses something that the line before it introduced.",
                        why: "The proof assumes D, feeds it a program Q whose behaviour encodes “P halts on x”, and so turns D into a decider for halting: a contradiction. Rice's theorem repeats this construction for any non-trivial semantic property. Q is easy to write; what cannot be done is to predict in general what it does."
                    },
                    ru: {
                        q: "Расставь шаги доказательства того, что никакой алгоритм не определяет для любой программы, выведет ли она когда-нибудь строку X (хотя бы на одном входе). Доказательство сводит к этому вопросу проблему остановки.",
                        items: ["Пусть алгоритм D для любой программы определяет, выведет ли она когда-нибудь строку X", "Дадим D программу Q, построенную по любым P и x: на любом входе запустить P на x без вывода, затем вывести X", "Q выводит X ровно тогда, когда P останавливается на x: иначе Q не дойдёт до последней команды", "Значит, ответ D о программе Q говорит, остановится ли P на x: D решал бы проблему остановки", "Проблема остановки неразрешима, поэтому такого D не существует"],
                        hint: "Доказательство от противного начинается с предположения, которое будет опровергнуто. Каждая следующая строка использует то, что ввела предыдущая.",
                        why: "Доказательство предполагает D, даёт ему программу Q, поведение которой кодирует «P останавливается на x», и превращает D в алгоритм для проблемы остановки: противоречие. Теорема Райса повторяет эту конструкцию для любого нетривиального семантического свойства. Написать Q легко; предсказать её поведение в общем случае нельзя."
                    }
                },
                {
                    type: "choice", card: "t12c",
                    en: {
                        q: "Rice's theorem: no algorithm decides, for arbitrary programs, a non-trivial property of the partial function a program computes. Which of these questions about an arbitrary program P can an algorithm nevertheless always answer?",
                        options: ["Does P, started on a given input x, halt within 10⁹ steps?", "Does P halt on every input that is at most 100 bits long?", "Does P compute the same function as a given ten-line program R?", "Is there an input on which P outputs the string X?"],
                        hint: "For which question is there a procedure that is sure to finish with the answer?",
                        why: "Run P on x for 10⁹ steps and look: that always finishes. The other three are non-trivial properties of the function P computes, so Rice's theorem applies: a limit on the input length or on the size of R puts no limit on how long P may run. A step count is a property of the code, not of the function."
                    },
                    ru: {
                        q: "Теорема Райса: никакой алгоритм не распознаёт у произвольных программ нетривиальное свойство частичной функции, вычисляемой программой. На какой из этих вопросов о произвольной программе P алгоритм всё же может ответить всегда?",
                        options: ["Остановится ли P на данном входе x не более чем за 10⁹ шагов?", "Останавливается ли P на каждом входе длиной не более 100 бит?", "Вычисляет ли P ту же функцию, что и данная программа R из десяти строк?", "Существует ли вход, на котором P выводит строку X?"],
                        hint: "Для какого вопроса есть процедура, которая наверняка закончит работу и даст ответ?",
                        why: "Запустим P на x на 10⁹ шагов и посмотрим: это всегда заканчивается. Остальные три — нетривиальные свойства функции, которую вычисляет P, и к ним применима теорема Райса: ограничение на длину входа или на размер R не ограничивает время работы P. А число шагов — свойство кода, а не функции."
                    }
                },
                {
                    type: "info", icon: "📏", mono: true,
                    en: {
                        title: "A proved piece: implicit bias towards the largest margin",
                        text: [
                            "Not every theorem in this unit is a prohibition. Take data that a linear classifier separates: some w has y_i·w·x_i > 0 for all i, with labels y_i = ±1. Then the logistic loss Σ_i ln(1 + exp(−y_i·w·x_i)) has no minimiser: scaling such a w up always lowers it.",
                            "Theorem: gradient descent with a small enough constant step, from any start, sends the loss to 0 and ‖w‖ to infinity (as ln t), while the direction w/‖w‖ converges to the **maximum-margin** separator, the one a hard-margin SVM with no bias term finds. No regulariser asks for this: it is an **implicit bias** of the algorithm.",
                            "For deep non-linear networks only partial results of this kind exist. Around them lies what is observed and only partly explained: the generalisation of over-parameterised networks, double descent beyond linear models, grokking, the power laws of scaling, in-context learning in large models, the edge of stability."
                        ],
                        example: ["w* = argmin ‖w‖² subject to y_i·w·x_i ≥ 1 for all i", "w(t)/‖w(t)‖ → w*/‖w*‖", "margin of w: min_i y_i·w·x_i/‖w‖; for w* it equals 1/‖w*‖", "(1, 1) labelled +1, (−1, −1) labelled −1: w* = (0.5, 0.5)", "direction (1, 1)/√2, margin √2 ≈ 1.414"],
                        note: "Open: a predictive theory of feature learning, and guarantees for the behaviour of large trained systems. Open means unsolved, not impossible: no theorem says that these questions cannot be answered."
                    },
                    ru: {
                        title: "Доказанный фрагмент: неявное смещение к максимальному зазору",
                        text: [
                            "Не все теоремы этого шага — запреты. Возьмём данные, которые разделяет линейный классификатор: для некоторого w верно y_i·w·x_i > 0 при всех i, метки y_i = ±1. Тогда у логистической функции потерь Σ_i ln(1 + exp(−y_i·w·x_i)) нет точки минимума: умножение такого w на число больше 1 всегда её уменьшает.",
                            "Теорема: градиентный спуск с достаточно малым постоянным шагом из любой точки ведёт потери к 0 и ‖w‖ к бесконечности (как ln t), а направление w/‖w‖ сходится к разделителю с **максимальным зазором** — его находит SVM с жёстким зазором без свободного члена. Регуляризатора нет: это **неявное смещение** (implicit bias) алгоритма.",
                            "Для глубоких нелинейных сетей есть лишь частичные результаты такого рода. Вокруг — то, что наблюдается, но объяснено лишь отчасти: обобщение перепараметризованных сетей, двойной спуск за пределами линейных моделей, грокинг, степенные законы масштабирования, обучение в контексте у больших моделей, граница устойчивости."
                        ],
                        example: ["w* = argmin ‖w‖² при условии y_i·w·x_i ≥ 1 для всех i", "w(t)/‖w(t)‖ → w*/‖w*‖", "зазор для w: min_i y_i·w·x_i/‖w‖; для w* он равен 1/‖w*‖", "(1; 1) с меткой +1, (−1; −1) с меткой −1: w* = (0,5; 0,5)", "направление (1; 1)/√2, зазор √2 ≈ 1,414"],
                        note: "Открытые вопросы: предсказательная теория обучения признаков (feature learning) и гарантии поведения больших обученных систем. «Открыто» значит «не решено», а не «невозможно»: ни одна теорема не утверждает, что на эти вопросы нельзя ответить."
                    }
                },
                {
                    type: "number", answer: 0.89, tolerance: 0.005, card: "t12d",
                    en: {
                        q: "On separable data, gradient descent on the logistic loss sends w/‖w‖ to the maximum-margin unit vector u. Data: (2, 0) labelled +1, (0, −1) labelled −1; boundary w·x = 0. What is the limit margin, min_i y_i·u·x_i? Two decimals.",
                        hint: "Write the two numbers y_i·u·x_i for a unit vector u = (u₁, u₂). The smaller one is largest when the two are equal.",
                        why: "y_i·u·x_i is 2·u₁ for the first point, u₂ for the second. The smaller is largest when 2·u₁ = u₂ with u₁² + u₂² = 1: u = (1, 2)/√5, margin 2/√5 = 0.894 ≈ 0.89. The first step from w = 0 is along (2, 1), margin 0.45, and the turn is slow: in gradient flow from 0 on the exponential loss, w₂/w₁ is still 1.82 at t = 10⁶ (limit 2)."
                    },
                    ru: {
                        q: "На разделимых данных градиентный спуск по логистическим потерям ведёт w/‖w‖ к единичному вектору u с наибольшим зазором. Даны (2; 0) с меткой +1 и (0; −1) с меткой −1; граница w·x = 0. Найди его зазор min_i y_i·u·x_i (до сотых).",
                        hint: "Выпиши два числа y_i·u·x_i для единичного вектора u = (u₁; u₂). Меньшее из них максимально, когда они равны.",
                        why: "y_i·u·x_i равно 2·u₁ для первой точки и u₂ для второй. Меньшее из них максимально при 2·u₁ = u₂ и u₁² + u₂² = 1: u = (1; 2)/√5, зазор 2/√5 = 0,894 ≈ 0,89. Первый шаг из w = 0 идёт вдоль (2; 1) с зазором 0,45, а поворот медленный: в градиентном потоке из 0 для экспоненциальных потерь w₂/w₁ при t = 10⁶ всё ещё 1,82 (предел 2)."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "The last sorting of the path: what kind of statement is each of these results?",
                        groups: ["A guarantee: an upper bound under stated conditions", "A lower bound: no method of a class can do better", "An empirical regularity: observed, not proved"],
                        items: [["With probability ≥ 1 − δ, all h in a finite class H: |true − sample error| ≤ √((ln|H| + ln(2/δ))/(2n))", 0], ["No unbiased estimator from n independent observations has variance below 1/(n·I(θ))", 1], ["The loss of large language models falls roughly as a power law in compute, data and parameters", 2], ["Gradient descent with step 1/L on a convex L-smooth f: f(x_k) − f* ≤ L·‖x_0 − x*‖²/(2k)", 0], ["Whatever the algorithm, some K-armed bandit forces a regret of the order of √(K·T) in T rounds", 1], ["In full-batch training, the largest Hessian eigenvalue tends to rise to about 2/η and hover there", 2], ["Identifying an n-bit parity takes more than (2^n − 1)·τ² statistical queries of tolerance τ", 1]],
                        why: "A guarantee bounds an error from above under its conditions and says nothing outside them. A lower bound holds for every method of its class: unbiased estimators, bandit algorithms, SQ learners. An empirical regularity may end outside the measured range. A fourth kind, an exactly solvable model, is exact only for itself."
                    },
                    ru: {
                        q: "Последняя сортировка пути: к какому виду утверждений относится каждый из этих результатов?",
                        groups: ["Гарантия: верхняя оценка при оговорённых условиях", "Нижняя оценка: ни один метод из класса не сделает лучше", "Эмпирическая закономерность: наблюдается, но не доказана"],
                        items: [["С вероятностью ≥ 1 − δ для всех h из конечного H: |истинная − выборочная ошибка| ≤ √((ln|H| + ln(2/δ))/(2n))", 0], ["У любой несмещённой оценки по n независимым наблюдениям дисперсия не меньше 1/(n·I(θ))", 1], ["Потери больших языковых моделей убывают примерно по степенному закону от вычислений, данных и параметров", 2], ["Градиентный спуск с шагом 1/L для выпуклой L-гладкой f: f(x_k) − f* ≤ L·‖x_0 − x*‖²/(2k)", 0], ["Для любого алгоритма найдётся K-рукий бандит с сожалением порядка √(K·T) за T раундов", 1], ["При спуске по всей выборке наибольшее собственное значение гессиана растёт примерно до 2/η и держится там", 2], ["На поиск чётности от n бит уходит больше (2^n − 1)·τ² статистических запросов с допуском τ", 1]],
                        why: "Гарантия ограничивает ошибку сверху при своих условиях, а вне их молчит. Нижняя оценка верна для любого метода своего класса: несмещённых оценок, алгоритмов для бандитов, SQ-алгоритмов. Эмпирическая закономерность может нарушиться вне измеренного диапазона. Четвёртый вид, точно решаемая модель, точен лишь для неё самой."
                    }
                },
                {
                    type: "reveal", icon: "💡",
                    en: {
                        q: "Challenge. With bits and labels as ±1, a parity is χ_S(x) = Π_(i in S) x_i, x uniform. For a query φ, |φ| ≤ 1, find one reply within τ of E[φ(x, χ_S(x))] for all but fewer than 1/τ² sets S. Start from φ(x, y) = a(x) + y·b(x).",
                        answer: [
                            "Because y = ±1, φ(x, y) = a(x) + y·b(x) with a(x) = (φ(x, 1) + φ(x, −1))/2 and b(x) = (φ(x, 1) − φ(x, −1))/2, and |b| ≤ 1. So E[φ(x, χ_S(x))] = E[a] + E[b·χ_S]. The reply E[a] does not depend on S, and it is valid for every S with |E[b·χ_S]| ≤ τ.",
                            "The parities are orthonormal: χ_S·χ_T is the parity of the symmetric difference of S and T, with mean 0 unless S = T. So the numbers E[b·χ_S] are the coordinates of b in an orthonormal basis, and Σ_S E[b·χ_S]² = E[b²] ≤ 1 (Parseval). Hence fewer than 1/τ² sets S have |E[b·χ_S]| > τ.",
                            "After q such replies fewer than q/τ² parities are ruled out, so leaving a single one takes q > (2^n − 1)·τ². For gradient descent this means: averaged over the 2^n parities, the squared target-dependent part of a gradient coordinate scaled to [−1, 1] is at most 2^(−n). The signal exists, but it is exponentially small."
                        ]
                    },
                    ru: {
                        q: "Задача со звёздочкой. Биты и метки — ±1, чётность χ_S(x) = Π_(i из S) x_i, x равномерен. Для запроса φ, |φ| ≤ 1, найди один ответ в пределах τ от E[φ(x, χ_S(x))] при всех S, кроме менее чем 1/τ². Начни с φ(x, y) = a(x) + y·b(x).",
                        answer: [
                            "Так как y = ±1, φ(x, y) = a(x) + y·b(x), где a(x) = (φ(x, 1) + φ(x, −1))/2, b(x) = (φ(x, 1) − φ(x, −1))/2 и |b| ≤ 1. Поэтому E[φ(x, χ_S(x))] = E[a] + E[b·χ_S]. Ответ E[a] не зависит от S и допустим для каждого S, у которого |E[b·χ_S]| ≤ τ.",
                            "Чётности ортонормированы: χ_S·χ_T — чётность симметрической разности S и T, её среднее равно 0, если S ≠ T. Значит, числа E[b·χ_S] — координаты b в ортонормированном базисе, и Σ_S E[b·χ_S]² = E[b²] ≤ 1 (равенство Парсеваля). Поэтому множеств S с |E[b·χ_S]| > τ меньше 1/τ².",
                            "После q таких ответов исключено меньше q/τ² чётностей, так что оставить одну удастся лишь при q > (2^n − 1)·τ². Для градиентного спуска это значит: в среднем по 2^n чётностям квадрат той части координаты градиента (приведённой к [−1; 1]), которая зависит от целевой функции, не больше 2^(−n). Сигнал есть, но экспоненциально мал."
                        ]
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "No free lunch: averaged uniformly over all target functions, every learner has error ½ on inputs outside its sample (after m of the 2^n labels, `2^(2^n − m)` functions still fit). Data cannot choose between hypotheses that agree on everything observed: generalisation and identifiability both need an inductive bias.",
                            "Statistical and computational limits differ. A parity of n bits needs about `n + log₂(1/δ)` examples with Gaussian elimination, but more than `(2^n − 1)·τ²` statistical queries of tolerance τ; with noisy labels no polynomial-time algorithm is known.",
                            "Rice's theorem: no algorithm decides a non-trivial property of the function computed by an arbitrary program; bounded questions, restricted classes and proofs for one program remain possible. A positive theorem: on separable data, gradient descent on the logistic loss converges in direction to the maximum-margin separator.",
                            "Proved: the theorems of this stage, under their conditions. Observed, only partly explained: why huge networks generalise, double descent, grokking, scaling laws. Open, not impossible: a theory of feature learning, guarantees for large trained systems. Ask of every claim: guarantee, lower bound, solvable model or empirical law?"
                        ]
                    },
                    ru: {
                        points: [
                            "Бесплатных завтраков не бывает: при равномерном усреднении по всем целевым функциям у любого алгоритма ошибка на входах вне выборки равна ½ (m меток оставляют `2^(2^n − m)` подходящих функций). Данные не выбирают между гипотезами, совпадающими на всём наблюдаемом: и обобщению, и идентифицируемости нужно индуктивное смещение.",
                            "Статистические и вычислительные пределы — разные вещи. Для чётности от n бит методу Гаусса хватает примерно `n + log₂(1/δ)` примеров, но нужно больше `(2^n − 1)·τ²` статистических запросов с допуском τ; при шуме в метках полиномиальный алгоритм неизвестен.",
                            "Теорема Райса: нет алгоритма, распознающего нетривиальное свойство функции, вычисляемой произвольной программой; возможны ограниченные вопросы и классы, доказательства для одной программы. Иная теорема: на разделимых данных градиентный спуск по логистическим потерям сходится по направлению к разделителю с максимальным зазором.",
                            "Доказано: теоремы этого этапа, при их условиях. Наблюдается, объяснено отчасти: обобщение огромных сетей, двойной спуск, грокинг, законы масштабирования. Открыто, но не невозможно: теория обучения признаков, гарантии для больших систем. О любом утверждении спроси: гарантия, нижняя оценка, решаемая модель или эмпирический закон?"
                        ]
                    }
                }
            ]
        }
    }
});
