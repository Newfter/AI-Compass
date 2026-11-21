/* =========================================================
   AI COMPASS — TEXTS: BENCH TOOL "seeds" (Comparing runs over seeds)
   Loaded by js/research.js when the tool opens, before js/research/seeds.js.
   Placeholders get numbers that the tool has already written the local
   way ({d}, {p}...), so they arrive as text. "Work" texts are the formulas
   with the numbers put in, shown under a result in the code font.
   "verdict.*" are the sentences of the verdict; the tool joins the ones
   that apply (the rules: verdictOf in js/research/seeds.js).
   Sections: 1. English  2. Russian
   ========================================================= */
window.AICompass.addTranslations({
    /* ===== 1. ENGLISH ===== */
    en: {
        "research.seeds.title": "Comparing runs over seeds",
        "research.seeds.question": "Model A scored a little higher than model B over a few training runs. Is that a real difference or seed luck?",

        // Inputs
        "research.seeds.a": "Model A: one result per run",
        "research.seeds.b": "Model B: one result per run",
        "research.seeds.paired": "The runs are paired (same seeds, same order)",
        "research.seeds.pairedHint": "Only when run i of A and run i of B used the same seed and the same data order. Offered when both lists have the same length.",
        "research.seeds.level": "Confidence level",
        "research.seeds.level.90": "90%",
        "research.seeds.level.95": "95%",
        "research.seeds.level.99": "99%",
        "research.seeds.better": "Your metric",
        "research.seeds.better.higher": "Higher is better",
        "research.seeds.better.lower": "Lower is better",
        "research.seeds.delta": "Difference to plan for Δ",
        "research.seeds.deltaHint": "For planning: the smallest difference worth finding, in the units of your results.",
        "research.seeds.seed": "Bootstrap seed",
        "research.seeds.seedHint": "The same seed gives the same bootstrap interval.",

        // Results: each list
        "research.seeds.headList": "Model {model}",
        "research.seeds.n": "Runs n",
        "research.seeds.mean": "Mean",
        "research.seeds.sd": "Standard deviation s",
        "research.seeds.se": "Standard error s/√n",
        "research.seeds.range": "Smallest and largest",
        "research.seeds.ci": "t interval for the mean",
        "research.seeds.meanWork": "{sum} / {n} = {mean}",
        "research.seeds.sdWork": "√(Σ(x − {mean})² / {m1}) = √({ss} / {m1}) = {sd}",
        "research.seeds.seWork": "{sd} / √{n} = {se}",
        "research.seeds.ciWork": "{level}: {mean} ± t({q}; {df})·{se} = {mean} ± {crit}·{se} = {mean} ± {half} = [{lo}, {hi}]",

        // Results: Welch's test
        "research.seeds.headWelch": "Welch’s test (unpaired)",
        "research.seeds.diff": "Difference of means d = A − B",
        "research.seeds.w.se": "Standard error of d",
        "research.seeds.w.df": "Degrees of freedom ν (Welch)",
        "research.seeds.t": "t statistic",
        "research.seeds.p": "p-value (two-sided)",
        "research.seeds.diffCi": "Interval for the difference",
        "research.seeds.diffWork": "{ma} − {mb} = {d}",
        "research.seeds.w.seWork": "√({sa}²/{na} + {sb}²/{nb}) = √({va} + {vb}) = {se}",
        "research.seeds.w.dfWork": "({va} + {vb})² / ({va}²/{na1} + {vb}²/{nb1}) = {df}",
        "research.seeds.tWork": "{d} / {se} = {t}",
        "research.seeds.pWork": "2·(1 − F_t({abst}; {df})) = {p}",
        "research.seeds.diffCiWork": "{level}: {d} ± t({q}; {df})·{se} = {d} ± {crit}·{se} = [{lo}, {hi}]",

        // Results: the paired test
        "research.seeds.headPaired": "Paired t-test",
        "research.seeds.p.diff": "Mean difference d̄",
        "research.seeds.p.sd": "Standard deviation of the differences s_d",
        "research.seeds.p.df": "Degrees of freedom ν = n − 1",
        "research.seeds.p.r": "Correlation of A and B (Pearson r)",
        "research.seeds.p.rHint": "Pairing helps only when the same seed moves both runs the same way (r above 0).",
        "research.seeds.p.diffWork": "the mean of dᵢ = aᵢ − bᵢ = {d}",
        "research.seeds.p.sdWork": "√(Σ(dᵢ − {d})² / {m1}) = {sd}",
        "research.seeds.p.dfWork": "{n} − 1 = {m1}",
        "research.seeds.p.tWork": "{d} / ({sd}/√{n}) = {d} / {se} = {t}",
        "research.seeds.p.ciWork": "{level}: {d} ± t({q}; {df})·{se} = {d} ± {crit}·{se} = [{lo}, {hi}]",
        "research.seeds.p.rWork": "Σ(a − ā)(b − b̄) / √(Σ(a − ā)²·Σ(b − b̄)²) = {r}",
        "research.seeds.p.rFlat": "one list does not change: the correlation is not defined",

        // Results: effect size
        "research.seeds.headEffect": "Effect size",
        "research.seeds.e.pooled": "Pooled standard deviation s_p",
        "research.seeds.e.d": "Cohen’s d",
        "research.seeds.e.g": "Hedges’ g",
        "research.seeds.e.sup": "Probability of superiority",
        "research.seeds.e.supHint": "An estimate from these runs of the chance that a random run of A scores above a random run of B (a tie counts half).",
        "research.seeds.e.pooledWork": "√(({na1}·{sa}² + {nb1}·{sb}²) / ({na} + {nb} − 2)) = {pooled}",
        "research.seeds.e.dWork": "{d} / {pooled} = {cohen}",
        "research.seeds.e.gWork": "{cohen}·(1 − 3/(4·({na} + {nb}) − 9)) = {cohen}·(1 − 3/{four}) = {g}",
        "research.seeds.e.supWork": "pairs with a > b: {wins} of {pairs} (a tie counts ½) = {sup}",

        // Results: the bootstrap
        "research.seeds.headBoot": "Bootstrap (a simulation)",
        "research.seeds.boot": "Percentile interval for A − B",
        "research.seeds.bootHint": "A simulation with 10,000 resamples. With fewer than about ten runs per list this interval is too narrow.",
        "research.seeds.bootWork": "{level}, seed {seed}, {reps} resamples, each list resampled on its own:\nthe {q1}% and {q2}% percentiles of mean(A*) − mean(B*) = [{lo}, {hi}]",
        "research.seeds.bootWorkPaired": "{level}, seed {seed}, {reps} resamples of the pairs:\nthe {q1}% and {q2}% percentiles of mean(A*) − mean(B*) = [{lo}, {hi}]",

        // Results: planning
        "research.seeds.headPlan": "Planning",
        "research.seeds.plan.observed": "Runs per model for the observed |d|",
        "research.seeds.plan.wanted": "Runs per model for your Δ",
        "research.seeds.unit.runs.one": "run",
        "research.seeds.unit.runs.many": "runs",
        "research.seeds.planWorkObserved": "Δ = |d| = {delta}: 2·({z} + {zp})²·{s}² / {delta}² + {z}²/4 = {exact}, so n = {n}",
        "research.seeds.planWork": "Δ = {delta}: 2·({z} + {zp})²·{s}² / {delta}² + {z}²/4 = {exact}, so n = {n}",
        "research.seeds.plan.never": "never: the two means are equal",
        "research.seeds.planFloor": "(at least 2: with one run per model there is no spread to test against)",
        "research.seeds.planRemark": "Planning is an approximation from the normal distribution with a small-sample correction (the z²/4), for a two-sided unpaired test at the chosen level and 80% power, with the pooled s of these runs taken as the true spread.",

        // The chart
        "research.seeds.chart": "Every run of A and B, with each mean and its interval",
        "research.seeds.axisY": "Result of a run",
        "research.seeds.series.runsA": "Runs of A",
        "research.seeds.series.runsB": "Runs of B",
        "research.seeds.series.mean": "Mean with its {level} t interval",
        "research.seeds.describe": "A: {na} runs, mean {ma}, interval [{la}, {ha}]. B: {nb} runs, mean {mb}, interval [{lb}, {hb}]. Level {level}.",

        // The verdict
        "research.seeds.verdict.one": "One run is not an experiment: nothing can be said about the difference. Give each model at least two runs.",
        "research.seeds.verdict.noSpread": "Every run in each list gave exactly the same number, so there is no seed noise to measure: no test can say how sure the difference of {d} is. Check that the seed really changes the run.",
        "research.seeds.verdict.noSpreadPaired": "The difference A − B is the same for every pair ({d}), so the paired test has no spread to work with and says nothing. Switch pairing off to use Welch’s test, or add runs.",
        "research.seeds.verdict.yes": "{winner} scored better: the difference A − B = {d} ({level} interval [{lo}, {hi}]) is larger than the noise between seeds explains at the {alpha} level (p = {p}).",
        "research.seeds.verdict.no": "The difference A − B = {d} cannot be told apart from seed noise at the {alpha} level (p = {p}). With these runs, differences smaller than about ±{half} are invisible.",
        "research.seeds.verdict.pairHelped": "Pairing helped: the runs move together (r = {r}), so the interval is ±{paired} instead of ±{welch} unpaired.",
        "research.seeds.verdict.pairWeak": "Pairing did not help: the runs move together only a little (r = {r}), not enough to make up for the fewer degrees of freedom (±{paired} paired against ±{welch} unpaired).",
        "research.seeds.verdict.pairNot": "Pairing does not help here: these runs do not move together (r = {r}), so the paired interval is no narrower (±{paired} paired against ±{welch} unpaired).",
        "research.seeds.verdict.pairFlat": "Pairing does not help here: one list does not change, so the runs cannot move together (±{paired} paired against ±{welch} unpaired).",
        "research.seeds.verdict.pairLengths": "The runs cannot be paired: the two lists have different lengths, so Welch’s unpaired test is used.",
        "research.seeds.verdict.few": "With fewer than {min} runs in a list, the spread itself is poorly known.",

        // The general formula and the source
        "research.seeds.formula": "each list:  x̄ = Σx/n,  s = √(Σ(x − x̄)²/(n − 1)),  SE = s/√n,  x̄ ± t(1 − α/2; n − 1)·SE\nWelch:     d = x̄_A − x̄_B,  SE = √(s_A²/n_A + s_B²/n_B),  t = d/SE\n           ν = (s_A²/n_A + s_B²/n_B)² / ((s_A²/n_A)²/(n_A − 1) + (s_B²/n_B)²/(n_B − 1))\n           p = 2·(1 − F_t(|t|; ν)),  interval d ± t(1 − α/2; ν)·SE\npaired:    dᵢ = aᵢ − bᵢ,  t = d̄/(s_d/√n),  ν = n − 1\neffect:    s_p = √(((n_A − 1)·s_A² + (n_B − 1)·s_B²)/(n_A + n_B − 2)),  d = (x̄_A − x̄_B)/s_p\n           g = d·(1 − 3/(4(n_A + n_B) − 9)),  superiority = share of pairs (a, b) with a > b, ties ½\nbootstrap: 10,000 resamples with replacement; the α/2 and 1 − α/2 quantiles of x̄_A* − x̄_B*\nplanning:  n = ⌈2·(z_(1−α/2) + z_0.8)²·s_p²/Δ² + z_(1−α/2)²/4⌉,  z_0.8 = 0.8416",
        "research.seeds.source": "Welch’s t-test; paired t-test; Cohen’s d and Hedges’ g; percentile bootstrap"
    },

    /* ===== 2. RUSSIAN ===== */
    ru: {
        "research.seeds.title": "Сравнение запусков с разными зёрнами",
        "research.seeds.question": "Модель A набрала чуть больше, чем модель B, на нескольких запусках обучения. Это настоящая разница или удачное зерно?",

        "research.seeds.a": "Модель A: по одному результату на запуск",
        "research.seeds.b": "Модель B: по одному результату на запуск",
        "research.seeds.paired": "Запуски парные (те же зёрна, тот же порядок)",
        "research.seeds.pairedHint": "Только если запуск i у A и запуск i у B шли с одним и тем же зерном и тем же порядком данных. Доступно, когда в списках поровну чисел.",
        "research.seeds.level": "Уровень доверия",
        "research.seeds.level.90": "90%",
        "research.seeds.level.95": "95%",
        "research.seeds.level.99": "99%",
        "research.seeds.better": "Твоя метрика",
        "research.seeds.better.higher": "Больше — лучше",
        "research.seeds.better.lower": "Меньше — лучше",
        "research.seeds.delta": "Разница для планирования Δ",
        "research.seeds.deltaHint": "Для планирования: самая маленькая разница, которую стоит найти, в единицах твоих результатов.",
        "research.seeds.seed": "Зерно бутстрэпа",
        "research.seeds.seedHint": "Одно и то же зерно даёт один и тот же интервал бутстрэпа.",

        "research.seeds.headList": "Модель {model}",
        "research.seeds.n": "Запусков n",
        "research.seeds.mean": "Среднее",
        "research.seeds.sd": "Стандартное отклонение s",
        "research.seeds.se": "Стандартная ошибка s/√n",
        "research.seeds.range": "Наименьшее и наибольшее",
        "research.seeds.ci": "t-интервал для среднего",
        "research.seeds.meanWork": "{sum} / {n} = {mean}",
        "research.seeds.sdWork": "√(Σ(x − {mean})² / {m1}) = √({ss} / {m1}) = {sd}",
        "research.seeds.seWork": "{sd} / √{n} = {se}",
        "research.seeds.ciWork": "{level}: {mean} ± t({q}; {df})·{se} = {mean} ± {crit}·{se} = {mean} ± {half} = [{lo}; {hi}]",

        "research.seeds.headWelch": "Тест Уэлча (непарный)",
        "research.seeds.diff": "Разность средних d = A − B",
        "research.seeds.w.se": "Стандартная ошибка d",
        "research.seeds.w.df": "Степени свободы ν (по Уэлчу)",
        "research.seeds.t": "Статистика t",
        "research.seeds.p": "p-значение (двустороннее)",
        "research.seeds.diffCi": "Интервал для разности",
        "research.seeds.diffWork": "{ma} − {mb} = {d}",
        "research.seeds.w.seWork": "√({sa}²/{na} + {sb}²/{nb}) = √({va} + {vb}) = {se}",
        "research.seeds.w.dfWork": "({va} + {vb})² / ({va}²/{na1} + {vb}²/{nb1}) = {df}",
        "research.seeds.tWork": "{d} / {se} = {t}",
        "research.seeds.pWork": "2·(1 − F_t({abst}; {df})) = {p}",
        "research.seeds.diffCiWork": "{level}: {d} ± t({q}; {df})·{se} = {d} ± {crit}·{se} = [{lo}; {hi}]",

        "research.seeds.headPaired": "Парный t-тест",
        "research.seeds.p.diff": "Средняя разность d̄",
        "research.seeds.p.sd": "Стандартное отклонение разностей s_d",
        "research.seeds.p.df": "Степени свободы ν = n − 1",
        "research.seeds.p.r": "Корреляция A и B (r Пирсона)",
        "research.seeds.p.rHint": "Парность помогает, только когда одно и то же зерно сдвигает оба запуска в одну сторону (r больше 0).",
        "research.seeds.p.diffWork": "среднее dᵢ = aᵢ − bᵢ = {d}",
        "research.seeds.p.sdWork": "√(Σ(dᵢ − {d})² / {m1}) = {sd}",
        "research.seeds.p.dfWork": "{n} − 1 = {m1}",
        "research.seeds.p.tWork": "{d} / ({sd}/√{n}) = {d} / {se} = {t}",
        "research.seeds.p.ciWork": "{level}: {d} ± t({q}; {df})·{se} = {d} ± {crit}·{se} = [{lo}; {hi}]",
        "research.seeds.p.rWork": "Σ(a − ā)(b − b̄) / √(Σ(a − ā)²·Σ(b − b̄)²) = {r}",
        "research.seeds.p.rFlat": "один список не меняется: корреляция не определена",

        "research.seeds.headEffect": "Размер эффекта",
        "research.seeds.e.pooled": "Объединённое стандартное отклонение s_p",
        "research.seeds.e.d": "d Коэна",
        "research.seeds.e.g": "g Хеджеса",
        "research.seeds.e.sup": "Вероятность превосходства",
        "research.seeds.e.supHint": "Оценка по этим запускам: шанс, что случайный запуск A даст больше, чем случайный запуск B (ничья считается за половину).",
        "research.seeds.e.pooledWork": "√(({na1}·{sa}² + {nb1}·{sb}²) / ({na} + {nb} − 2)) = {pooled}",
        "research.seeds.e.dWork": "{d} / {pooled} = {cohen}",
        "research.seeds.e.gWork": "{cohen}·(1 − 3/(4·({na} + {nb}) − 9)) = {cohen}·(1 − 3/{four}) = {g}",
        "research.seeds.e.supWork": "пар с a > b: {wins} из {pairs} (ничья считается за ½) = {sup}",

        "research.seeds.headBoot": "Бутстрэп (симуляция)",
        "research.seeds.boot": "Процентильный интервал для A − B",
        "research.seeds.bootHint": "Симуляция с 10 000 повторных выборок. Если в списке меньше примерно десяти запусков, этот интервал слишком узкий.",
        "research.seeds.bootWork": "{level}, зерно {seed}, повторных выборок: {reps}, каждый список отдельно:\nпроцентили {q1}% и {q2}% для mean(A*) − mean(B*) = [{lo}; {hi}]",
        "research.seeds.bootWorkPaired": "{level}, зерно {seed}, повторных выборок пар: {reps}:\nпроцентили {q1}% и {q2}% для mean(A*) − mean(B*) = [{lo}; {hi}]",

        "research.seeds.headPlan": "Планирование",
        "research.seeds.plan.observed": "Запусков на модель для наблюдаемой |d|",
        "research.seeds.plan.wanted": "Запусков на модель для твоей Δ",
        "research.seeds.unit.runs.one": "запуск",
        "research.seeds.unit.runs.few": "запуска",
        "research.seeds.unit.runs.many": "запусков",
        "research.seeds.planWorkObserved": "Δ = |d| = {delta}: 2·({z} + {zp})²·{s}² / {delta}² + {z}²/4 = {exact}, значит n = {n}",
        "research.seeds.planWork": "Δ = {delta}: 2·({z} + {zp})²·{s}² / {delta}² + {z}²/4 = {exact}, значит n = {n}",
        "research.seeds.plan.never": "никогда: средние равны",
        "research.seeds.planFloor": "(не меньше 2: по одному запуску на модель разброс не оценить, и сравнивать не с чем)",
        "research.seeds.planRemark": "Планирование — приближение по нормальному распределению с поправкой на малую выборку (слагаемое z²/4), для двустороннего непарного теста на выбранном уровне и мощности 80%; объединённое s этих запусков принято за истинный разброс.",

        "research.seeds.chart": "Каждый запуск A и B, их средние и интервалы",
        "research.seeds.axisY": "Результат запуска",
        "research.seeds.series.runsA": "Запуски A",
        "research.seeds.series.runsB": "Запуски B",
        "research.seeds.series.mean": "Среднее и его t-интервал {level}",
        "research.seeds.describe": "A: запусков — {na}, среднее {ma}, интервал [{la}; {ha}]. B: запусков — {nb}, среднее {mb}, интервал [{lb}; {hb}]. Уровень {level}.",

        "research.seeds.verdict.one": "Один запуск — ещё не эксперимент: о разнице ничего сказать нельзя. Дай каждой модели хотя бы два запуска.",
        "research.seeds.verdict.noSpread": "Все запуски в каждом списке дали ровно одно и то же число, так что шум зёрен измерить нельзя: никакой тест не скажет, насколько надёжна разница {d}. Проверь, что зерно правда меняет запуск.",
        "research.seeds.verdict.noSpreadPaired": "Разность A − B одинакова во всех парах ({d}), поэтому у парного теста нет разброса и он ничего не говорит. Выключи парность, чтобы работал тест Уэлча, или добавь запуски.",
        "research.seeds.verdict.yes": "У {winner} результат лучше: разность A − B = {d} (интервал {level}: [{lo}; {hi}]) больше, чем объясняет шум между зёрнами на уровне значимости {alpha} (p = {p}).",
        "research.seeds.verdict.no": "Разность A − B = {d} не отличить от шума зёрен на уровне значимости {alpha} (p = {p}). С такими запусками разницы меньше примерно ±{half} не видны.",
        "research.seeds.verdict.pairHelped": "Парность помогла: запуски движутся вместе (r = {r}), поэтому интервал ±{paired} вместо ±{welch} без пар.",
        "research.seeds.verdict.pairWeak": "Парность не помогла: запуски движутся вместе лишь немного (r = {r}), и это не окупает меньшее число степеней свободы (±{paired} с парами против ±{welch} без пар).",
        "research.seeds.verdict.pairNot": "Парность здесь не помогает: эти запуски не движутся вместе (r = {r}), так что парный интервал не становится уже (±{paired} с парами против ±{welch} без пар).",
        "research.seeds.verdict.pairFlat": "Парность здесь не помогает: один список не меняется, и запуски не могут двигаться вместе (±{paired} с парами против ±{welch} без пар).",
        "research.seeds.verdict.pairLengths": "Запуски нельзя составить в пары: в списках разное число результатов, поэтому используется непарный тест Уэлча.",
        "research.seeds.verdict.few": "Когда в списке меньше {min} запусков, даже величина разброса известна плохо.",

        "research.seeds.formula": "каждый список:  x̄ = Σx/n,  s = √(Σ(x − x̄)²/(n − 1)),  SE = s/√n,  x̄ ± t(1 − α/2; n − 1)·SE\nУэлч:      d = x̄_A − x̄_B,  SE = √(s_A²/n_A + s_B²/n_B),  t = d/SE\n           ν = (s_A²/n_A + s_B²/n_B)² / ((s_A²/n_A)²/(n_A − 1) + (s_B²/n_B)²/(n_B − 1))\n           p = 2·(1 − F_t(|t|; ν)),  интервал d ± t(1 − α/2; ν)·SE\nпарный:    dᵢ = aᵢ − bᵢ,  t = d̄/(s_d/√n),  ν = n − 1\nэффект:    s_p = √(((n_A − 1)·s_A² + (n_B − 1)·s_B²)/(n_A + n_B − 2)),  d = (x̄_A − x̄_B)/s_p\n           g = d·(1 − 3/(4(n_A + n_B) − 9)),  превосходство = доля пар (a, b) с a > b, ничья ½\nбутстрэп:  10 000 повторных выборок с возвращением; квантили уровней α/2 и 1 − α/2 для x̄_A* − x̄_B*\nпланирование:  n = ⌈2·(z_(1−α/2) + z_0,8)²·s_p²/Δ² + z_(1−α/2)²/4⌉,  z_0,8 = 0,8416",
        "research.seeds.source": "t-тест Уэлча; парный t-тест; d Коэна и g Хеджеса; процентильный бутстрэп"
    }
});
