/* =========================================================
   AI COMPASS — TEXTS AND DATA: THE RESEARCH LAB (page #research)
   Every word of the Research lab's hub, its bench kit and its notebook,
   in English and in Russian (informal «ты»), and the catalogue of the
   bench: which tools exist, which are ready, in which group.
   Used by js/research.js (the hub), js/research/kit.js (the bench kit)
   and the research section of index.html. Each bench tool has its own
   texts in js/content/research/<id>.js, loaded when it opens; only what
   a card and the Ctrl+K palette show before it opens lives here.
   To change a text, change it here (in both languages).
   Sections:
    1. The page and its three tabs
    2. The experiment station (the "Experiments" tab)
    3. The bench: cards, groups, an open tool, errors, commands
    4. The names and one-line descriptions of the sixteen tools
    5. The bench kit: fields, lists, results, buttons, jobs, charts
    6. The notebook
    7. The catalogue (data): the station, the groups, the tools, icons
   ========================================================= */

/* ===== 1. THE PAGE AND ITS THREE TABS ===== */
window.AICompass.addTranslations({
    en: {
        "research.label": "FOR RESEARCHERS",
        "research.title": "Research lab",
        "research.subtitle": "Precise calculators, small experiments and a lab notebook for the everyday questions of research.",
        "research.tabs": "Parts of the research lab",
        "research.tab.station": "Experiments",
        "research.tab.bench": "Bench",
        "research.tab.notebook": "Notebook",
        // The number next to "Notebook" in its tab, for screen readers
        "research.tab.count": "{n} entries",
        "research.tab.count.one": "{n} entry",
        // A quiet link in the header, shown only once My path has its exam
        "research.exam": "Qualifying exam"
    },
    ru: {
        "research.label": "ДЛЯ ИССЛЕДОВАТЕЛЕЙ",
        "research.title": "Исследователь­ская лаборатория",     // a soft hyphen: the long word may break on a phone
        "research.subtitle": "Точные калькуляторы, небольшие эксперименты и лабораторный журнал для повседневных вопросов исследователя.",
        "research.tabs": "Разделы исследовательской лаборатории",
        "research.tab.station": "Эксперименты",
        "research.tab.bench": "Стенд",
        "research.tab.notebook": "Журнал",
        "research.tab.count.one": "{n} запись",
        "research.tab.count.few": "{n} записи",
        "research.tab.count.many": "{n} записей",
        "research.exam": "Квалификационный экзамен"
    }
});

/* ===== 2. THE EXPERIMENT STATION ("Experiments") ===== */
window.AICompass.addTranslations({
    en: {
        "research.station.soonTitle": "The experiment station is being set up",
        "research.station.soonText": "Small experiments that train in your browser, with seeds, sweeps and error bars, will be here soon. The bench and the notebook already work.",
        "research.station.toBench": "Open the bench",
        "research.station.loading": "Loading the experiment station…",
        "research.station.errorTitle": "The experiment station didn’t load",
        "research.station.errorText": "Check your internet connection, then try again."
    },
    ru: {
        "research.station.soonTitle": "Экспериментальная станция ещё готовится",
        "research.station.soonText": "Скоро здесь появятся небольшие эксперименты с зёрнами, перебором параметров и погрешностями — они обучаются прямо в браузере. Стенд и журнал уже работают.",
        "research.station.toBench": "Открыть стенд",
        "research.station.loading": "Загружаем экспериментальную станцию…",
        "research.station.errorTitle": "Экспериментальная станция не загрузилась",
        "research.station.errorText": "Проверь подключение к интернету и попробуй ещё раз."
    }
});

/* ===== 3. THE BENCH ===== */
window.AICompass.addTranslations({
    en: {
        "research.bench.intro": "Precise calculators for the daily questions of research. Every formula is written out, and every number can be checked by hand.",
        "research.bench.ready": "{ready} of {total} tools ready",
        "research.bench.group.stats": "Statistics for experiments",
        "research.bench.group.scale": "Scale and systems",
        "research.bench.group.theory": "Theory",
        "research.bench.group.sims": "Simulators",
        "research.bench.soon": "Coming soon",
        // The units of My path that teach a tool's theory, on its card: "Theory: b4, r12"
        "research.bench.units": "Theory: {list}",
        // The bar above an open tool
        "research.bench.all": "All tools",
        "research.bench.switch": "Switch tool",
        "research.bench.loading": "Loading the tool…",
        "research.bench.errorTitle": "This tool didn’t load",
        "research.bench.errorText": "Check your internet connection, then try again.",
        "research.bench.retry": "Try again",
        "research.bench.opened": "Opened: {title}",
        // An address like #research/bench/something names no ready tool
        "research.bench.unknown": "There’s no tool called “{id}”. Here are all of them.",
        "research.bench.notReady": "“{title}” is coming soon. Here are the tools that are ready.",
        // Command palette (Ctrl+K): one command per ready tool
        "research.cmdGroup": "Research lab",
        "research.cmdBench": "Bench: {title}"
    },
    ru: {
        "research.bench.intro": "Точные калькуляторы для ежедневных вопросов исследователя. Каждая формула выписана полностью, каждое число можно проверить вручную.",
        "research.bench.ready": "Готово инструментов: {ready} из {total}",
        "research.bench.group.stats": "Статистика экспериментов",
        "research.bench.group.scale": "Масштаб и системы",
        "research.bench.group.theory": "Теория",
        "research.bench.group.sims": "Симуляторы",
        "research.bench.soon": "Скоро",
        "research.bench.units": "Теория: {list}",
        "research.bench.all": "Все инструменты",
        "research.bench.switch": "Другой инструмент",
        "research.bench.loading": "Загружаем инструмент…",
        "research.bench.errorTitle": "Инструмент не загрузился",
        "research.bench.errorText": "Проверь подключение к интернету и попробуй ещё раз.",
        "research.bench.retry": "Попробовать ещё раз",
        "research.bench.opened": "Открыт инструмент: {title}",
        "research.bench.unknown": "Инструмента «{id}» нет. Вот все инструменты.",
        "research.bench.notReady": "Инструмент «{title}» появится скоро. Вот те, что уже готовы.",
        "research.cmdGroup": "Исследовательская лаборатория",
        "research.cmdBench": "Стенд: {title}"
    }
});

/* ===== 4. THE SIXTEEN TOOLS: NAMES AND ONE-LINE DESCRIPTIONS =====
   A tool's builder may refine the four lines of their own tool. */
window.AICompass.addTranslations({
    en: {
        "research.tool.ci.name": "Error bars and sample size",
        "research.tool.ci.desc": "How sure an accuracy on n examples is, how many examples you need, and whether two models really differ.",
        "research.tool.seeds.name": "Comparing runs over seeds",
        "research.tool.seeds.desc": "Is model A really better than B over a few training runs, or is it the luck of the seed?",
        "research.tool.many.name": "Many comparisons",
        "research.tool.many.desc": "Try many things and one looks “significant”: how much of that is chance, and how to correct for it.",
        "research.tool.simpson.name": "Confounding and adjustment",
        "research.tool.simpson.desc": "A looks better overall but worse in every group: which number answers your question?",
        "research.tool.sizer.name": "Model sizer",
        "research.tool.sizer.desc": "The parameters of a transformer from its settings, and the memory its weights and its cache need.",
        "research.tool.compute.name": "Training compute planner",
        "research.tool.compute.desc": "How long a training run takes on your hardware, and how much energy it uses.",
        "research.tool.quant.name": "Quantisation",
        "research.tool.quant.desc": "The error that b bits add to normally distributed weights, and the best place to clip.",
        "research.tool.schedule.name": "Learning-rate schedule designer",
        "research.tool.schedule.desc": "Warm-up and decay: the rate at every step, its total budget, and two schedules side by side.",
        "research.tool.noise.name": "Diffusion noise schedules",
        "research.tool.noise.desc": "How much signal is left at step t: the linear, the cosine and the continuous schedule.",
        "research.tool.bounds.name": "Generalisation bounds",
        "research.tool.bounds.desc": "What Hoeffding, the union bound and the VC dimension guarantee for your n and δ, and the n they ask for.",
        "research.tool.rates.name": "Convergence rates",
        "research.tool.rates.desc": "The steps gradient descent and acceleration need for given constants, and what no method can beat.",
        "research.tool.info.name": "Entropy and divergences",
        "research.tool.info.desc": "Entropy, cross-entropy, KL and mutual information, in bits and in nats.",
        "research.tool.privacy.name": "Privacy budget",
        "research.tool.privacy.desc": "The noise a privacy guarantee costs, what is left after k queries, and the certified radius.",
        "research.tool.highdim.name": "High dimensions",
        "research.tool.highdim.desc": "Length, angle, volume and the spectrum of pure noise when the dimension is large.",
        "research.tool.bandit.name": "Bandit regret",
        "research.tool.bandit.desc": "How much ε-greedy, UCB1 and Thompson sampling lose while they are still learning.",
        "research.tool.descent2.name": "Double descent",
        "research.tool.descent2.desc": "Why more parameters than examples can lower the test error, and where the error explodes."
    },
    ru: {
        "research.tool.ci.name": "Погрешности и размер выборки",
        "research.tool.ci.desc": "Насколько точна доля верных ответов на n примерах, сколько примеров нужно и правда ли две модели различаются.",
        "research.tool.seeds.name": "Сравнение запусков с разными зёрнами",
        "research.tool.seeds.desc": "Модель A правда лучше B на нескольких запусках обучения или это удачное зерно?",
        "research.tool.many.name": "Множественные сравнения",
        "research.tool.many.desc": "Проверено много вариантов, и один «значим»: сколько здесь случайности и как её учесть.",
        "research.tool.simpson.name": "Смешивающие факторы и поправка",
        "research.tool.simpson.desc": "A лучше в целом, но хуже в каждой группе: какое число отвечает на твой вопрос?",
        "research.tool.sizer.name": "Размер модели",
        "research.tool.sizer.desc": "Число параметров трансформера по его настройкам и память под веса и кэш.",
        "research.tool.compute.name": "Планировщик вычислений",
        "research.tool.compute.desc": "Сколько продлится обучение на твоём оборудовании и сколько энергии оно потребует.",
        "research.tool.quant.name": "Квантование",
        "research.tool.quant.desc": "Какую ошибку добавляют b бит к нормально распределённым весам и где лучше обрезать.",
        "research.tool.schedule.name": "Конструктор расписания скорости обучения",
        "research.tool.schedule.desc": "Разогрев и затухание: скорость на каждом шаге, общий бюджет и два расписания рядом.",
        "research.tool.noise.name": "Расписания шума в диффузии",
        "research.tool.noise.desc": "Сколько сигнала остаётся на шаге t: линейное, косинусное и непрерывное расписания.",
        "research.tool.bounds.name": "Границы обобщения",
        "research.tool.bounds.desc": "Что гарантируют неравенство Хёфдинга, оценка объединения и VC-размерность для твоих n и δ и какое n они требуют.",
        "research.tool.rates.name": "Скорости сходимости",
        "research.tool.rates.desc": "Сколько шагов нужно градиентному спуску и ускоренному методу при данных константах и чего не превзойдёт ни один метод.",
        "research.tool.info.name": "Энтропия и дивергенции",
        "research.tool.info.desc": "Энтропия, перекрёстная энтропия, KL-дивергенция и взаимная информация в битах и натах.",
        "research.tool.privacy.name": "Бюджет приватности",
        "research.tool.privacy.desc": "Сколько шума стоит гарантия приватности, что остаётся после k запросов и каков сертифицированный радиус.",
        "research.tool.highdim.name": "Высокие размерности",
        "research.tool.highdim.desc": "Длина, угол, объём и спектр чистого шума, когда размерность велика.",
        "research.tool.bandit.name": "Сожаление многорукого бандита",
        "research.tool.bandit.desc": "Сколько теряют ε-жадная стратегия, UCB1 и сэмплирование Томпсона, пока ещё учатся.",
        "research.tool.descent2.name": "Двойной спуск",
        "research.tool.descent2.desc": "Почему при числе параметров больше числа примеров ошибка на тесте может упасть и где она взрывается."
    }
});

/* ===== 5. THE BENCH KIT (js/research/kit.js) =====
   Texts every tool shares. {min}, {max}, {value} come written the local way. */
window.AICompass.addTranslations({
    en: {
        // The parts of the standard layout
        "research.kit.inputs": "Inputs",
        "research.kit.results": "Results",
        "research.kit.formula": "Formula",
        "research.kit.source": "Source",
        "research.kit.sourceUnit": "Unit {id}: {title}",
        "research.kit.parts": "Parts of this tool",
        // A field's messages
        "research.kit.errEmpty": "Enter a number.",
        "research.kit.errNumber": "This is not a number.",
        "research.kit.errDot": "Use a dot for decimals, like 0.83.",
        "research.kit.errWhole": "Must be a whole number.",
        "research.kit.errRange": "Must be between {min} and {max}.",
        "research.kit.errMin": "Must be at least {min}.",
        "research.kit.errAbove": "Must be above {min}.",
        "research.kit.errMax": "Must be at most {max}.",
        "research.kit.errBelow": "Must be below {max}.",
        "research.kit.fixInputs": "Fix the inputs marked in red to see the results.",
        // A list of pasted numbers
        "research.kit.listRead.one": "{n} number read.",
        "research.kit.listRead.many": "{n} numbers read.",
        "research.kit.listBad": "Could not read: {list}.",
        "research.kit.listMore": "and {n} more",
        "research.kit.listFew": "Needs at least {min} numbers.",
        "research.kit.listMany": "At most {max} numbers.",
        "research.kit.listOut": "{value} is outside {min} to {max}.",
        "research.kit.listLong": "The text is too long: at most {max} characters.",
        "research.kit.listHint": "Separate the numbers with spaces, commas, semicolons or new lines. Use a dot for decimals.",
        // Intervals and a missing value
        "research.kit.interval": "[{lo}, {hi}]",
        // The two buttons under every tool
        "research.kit.copy": "Copy result",
        "research.kit.copied": "Copied: the inputs, the results and the formula.",
        "research.kit.copyFailed": "The browser did not allow copying. Select the text below and copy it by hand.",
        "research.kit.note": "Add to notebook",
        "research.kit.noted": "Added to the notebook.",
        "research.kit.openNotebook": "Open the notebook",
        "research.kit.noteFull": "The notebook is full: {max} entries. Delete or export some entries first.",
        "research.kit.noResult": "There is no result yet: fix the inputs first.",
        "research.kit.copyFrom": "AI Compass, Research lab",
        // Long computations
        "research.kit.jobRunning": "Computing: {percent} done",
        "research.kit.jobProgress": "Progress of the computation",
        "research.kit.jobPaused": "Paused while the page is not on screen.",
        "research.kit.jobStop": "Stop",
        "research.kit.jobStopped": "Stopped.",
        "research.kit.jobDone": "Done.",
        // Charts
        "research.kit.chart": "Chart",
        "research.kit.chartEmpty": "Nothing to draw yet.",
        "research.kit.chartSeries": "{name}: {count}, x from {x0} to {x1}, y from {y0} to {y1}.",
        "research.kit.chartPoints.one": "{n} point",
        "research.kit.chartPoints.many": "{n} points",
        "research.kit.chartMark": "Marked: {label}."
    },
    ru: {
        "research.kit.inputs": "Входные данные",
        "research.kit.results": "Результаты",
        "research.kit.formula": "Формула",
        "research.kit.source": "Источник",
        "research.kit.sourceUnit": "Блок {id}: {title}",
        "research.kit.parts": "Части инструмента",
        "research.kit.errEmpty": "Введи число.",
        "research.kit.errNumber": "Это не число.",
        "research.kit.errDot": "Дробную часть отделяй точкой или запятой, например 0,83.",
        "research.kit.errWhole": "Нужно целое число.",
        "research.kit.errRange": "Нужно число от {min} до {max}.",
        "research.kit.errMin": "Нужно не меньше {min}.",
        "research.kit.errAbove": "Нужно больше {min}.",
        "research.kit.errMax": "Нужно не больше {max}.",
        "research.kit.errBelow": "Нужно меньше {max}.",
        "research.kit.fixInputs": "Исправь поля, отмеченные красным, чтобы увидеть результаты.",
        "research.kit.listRead.one": "Прочитано {n} число.",
        "research.kit.listRead.few": "Прочитано {n} числа.",
        "research.kit.listRead.many": "Прочитано {n} чисел.",
        "research.kit.listBad": "Не удалось прочитать: {list}.",
        "research.kit.listMore": "и ещё {n}",
        "research.kit.listFew": "Нужно хотя бы {min} числа.",
        "research.kit.listMany": "Не больше {max} чисел.",
        "research.kit.listOut": "{value} — вне диапазона от {min} до {max}.",
        "research.kit.listLong": "Текст слишком длинный: не больше {max} символов.",
        "research.kit.listHint": "Разделяй числа пробелами, точкой с запятой или переносом строки. Запятая между цифрами — десятичная (0,83), а запятая с пробелом после неё разделяет числа.",
        "research.kit.interval": "[{lo}; {hi}]",
        "research.kit.copy": "Скопировать результат",
        "research.kit.copied": "Скопировано: входные данные, результаты и формула.",
        "research.kit.copyFailed": "Браузер не разрешил копирование. Выдели текст ниже и скопируй его вручную.",
        "research.kit.note": "В журнал",
        "research.kit.noted": "Добавлено в журнал.",
        "research.kit.openNotebook": "Открыть журнал",
        "research.kit.noteFull": "Журнал заполнен: {max} записей. Сначала удали или экспортируй часть записей.",
        "research.kit.noResult": "Результата пока нет: сначала исправь входные данные.",
        "research.kit.copyFrom": "AI Compass, исследовательская лаборатория",
        "research.kit.jobRunning": "Считаем: готово {percent}",
        "research.kit.jobProgress": "Ход вычисления",
        "research.kit.jobPaused": "Пауза, пока страница не на экране.",
        "research.kit.jobStop": "Остановить",
        "research.kit.jobStopped": "Остановлено.",
        "research.kit.jobDone": "Готово.",
        "research.kit.chart": "График",
        "research.kit.chartEmpty": "Рисовать пока нечего.",
        "research.kit.chartSeries": "{name}: {count}, x от {x0} до {x1}, y от {y0} до {y1}.",
        "research.kit.chartPoints.one": "{n} точка",
        "research.kit.chartPoints.few": "{n} точки",
        "research.kit.chartPoints.many": "{n} точек",
        "research.kit.chartMark": "Отмечено: {label}."
    }
});

/* ===== 6. THE NOTEBOOK ===== */
window.AICompass.addTranslations({
    en: {
        "research.nb.intro": "Results from the bench and your own notes, kept in this browser. Export them to keep a copy.",
        "research.nb.new": "New note",
        "research.nb.search": "Search the notebook",
        "research.nb.searchHint": "Search titles, notes, numbers",
        "research.nb.exportMd": "Export Markdown",
        "research.nb.exportJson": "Export JSON",
        "research.nb.import": "Import JSON",
        "research.nb.count.one": "{n} of {max} entries",
        "research.nb.count.many": "{n} of {max} entries",
        "research.nb.match": "{n} of {total} match “{q}”",
        "research.nb.empty": "No entries yet. Add a result from any bench tool with “Add to notebook”, or write a note.",
        "research.nb.noMatch": "No entry matches “{q}”.",
        "research.nb.fieldTitle": "Title",
        "research.nb.fieldText": "Notes",
        "research.nb.textCount": "{n} of {max} characters",
        "research.nb.save": "Save",
        "research.nb.cancel": "Cancel",
        "research.nb.edit": "Edit",
        "research.nb.editLabel": "Edit “{title}”",
        "research.nb.delete": "Delete",
        "research.nb.deleteAsk": "Press again to delete",
        "research.nb.deleteLabel": "Delete “{title}”",
        "research.nb.deleted": "Entry deleted.",
        "research.nb.saved": "Saved.",
        "research.nb.added": "Note added.",
        "research.nb.titleNeeded": "Give the entry a title.",
        "research.nb.titleLong": "The title is too long: at most {max} characters.",
        "research.nb.textLong": "The notes are too long: at most {max} characters ({n} now).",
        "research.nb.full": "The notebook is full: {max} entries. Delete or export some before you add more.",
        "research.nb.blocked": "This browser does not let the site save anything, so the notebook lasts only until you close this tab. Export it before you leave.",
        "research.nb.from": "From: {tool}",
        "research.nb.inputs": "Inputs",
        "research.nb.results": "Results",
        "research.nb.exported": "The file is ready: {name}.",
        // Importing a JSON file: every problem says what is wrong
        "research.nb.importDone": "Imported {added} of the {total} entries in the file; {same} were already here.",
        "research.nb.importNone": "Nothing new: every entry of the file is already here.",
        "research.nb.importFull": "Importing would make {n} entries, but the notebook holds at most {max}. Delete some first.",
        "research.nb.err.tooBig": "The file is too big: at most 2 MB.",
        "research.nb.err.read": "The file could not be read.",
        "research.nb.err.notJson": "This file is not JSON, so it is not a notebook file.",
        "research.nb.err.notNotebook": "This is not a notebook file of AI Compass.",
        "research.nb.err.version": "This notebook file comes from a newer version of the site.",
        "research.nb.err.tooMany": "The file has {n} entries: a notebook holds at most {max}.",
        "research.nb.err.entry": "Entry {n} of the file: {problem} Nothing was imported.",
        "research.nb.err.shape": "it is not an entry.",
        "research.nb.err.id": "its id is missing or not valid.",
        "research.nb.err.twice": "its id appears twice in the file.",
        "research.nb.err.time": "its time is not a valid date.",
        "research.nb.err.title": "its title must be text of 1 to {max} characters on one line.",
        "research.nb.err.text": "its notes must be text of at most {max} characters.",
        "research.nb.err.tool": "the tool it names is not valid.",
        "research.nb.err.rows": "its table must be at most {max} rows of a name and a value, both text.",
        // The Markdown file
        "research.nb.mdTitle": "Research notebook",
        "research.nb.mdExported": "Exported on {date} from AI Compass, Research lab.",
        "research.nb.mdName": "Name",
        "research.nb.mdValue": "Value"
    },
    ru: {
        "research.nb.intro": "Результаты со стенда и твои заметки хранятся в этом браузере. Экспортируй их, чтобы сохранить копию.",
        "research.nb.new": "Новая заметка",
        "research.nb.search": "Поиск по журналу",
        "research.nb.searchHint": "Искать в заметках",
        "research.nb.exportMd": "Экспорт в Markdown",
        "research.nb.exportJson": "Экспорт в JSON",
        "research.nb.import": "Импорт JSON",
        "research.nb.count.one": "{n} запись из {max}",
        "research.nb.count.few": "{n} записи из {max}",
        "research.nb.count.many": "{n} записей из {max}",
        "research.nb.match": "Найдено {n} из {total} по запросу «{q}»",
        "research.nb.empty": "Записей пока нет. Добавь результат с любого инструмента стенда кнопкой «В журнал» или напиши заметку.",
        "research.nb.noMatch": "По запросу «{q}» ничего не найдено.",
        "research.nb.fieldTitle": "Заголовок",
        "research.nb.fieldText": "Заметки",
        "research.nb.textCount": "{n} из {max} символов",
        "research.nb.save": "Сохранить",
        "research.nb.cancel": "Отмена",
        "research.nb.edit": "Изменить",
        "research.nb.editLabel": "Изменить «{title}»",
        "research.nb.delete": "Удалить",
        "research.nb.deleteAsk": "Нажми ещё раз, чтобы удалить",
        "research.nb.deleteLabel": "Удалить «{title}»",
        "research.nb.deleted": "Запись удалена.",
        "research.nb.saved": "Сохранено.",
        "research.nb.added": "Заметка добавлена.",
        "research.nb.titleNeeded": "Дай записи заголовок.",
        "research.nb.titleLong": "Заголовок слишком длинный: не больше {max} символов.",
        "research.nb.textLong": "Заметки слишком длинные: не больше {max} символов (сейчас {n}).",
        "research.nb.full": "Журнал заполнен: {max} записей. Удали или экспортируй часть, прежде чем добавлять новые.",
        "research.nb.blocked": "Этот браузер не разрешает сайту ничего сохранять, поэтому журнал проживёт только до закрытия вкладки. Экспортируй его перед уходом.",
        "research.nb.from": "Инструмент: {tool}",
        "research.nb.inputs": "Входные данные",
        "research.nb.results": "Результаты",
        "research.nb.exported": "Файл готов: {name}.",
        "research.nb.importDone": "Импортировано записей: {added} из {total}; уже были здесь: {same}.",
        "research.nb.importNone": "Ничего нового: все записи из файла уже есть в журнале.",
        "research.nb.importFull": "После импорта записей стало бы {n}, а журнал вмещает не больше {max}. Сначала удали часть.",
        "research.nb.err.tooBig": "Файл слишком большой: не больше 2 МБ.",
        "research.nb.err.read": "Не удалось прочитать файл.",
        "research.nb.err.notJson": "Это не JSON, значит, и не файл журнала.",
        "research.nb.err.notNotebook": "Это не файл журнала AI Compass.",
        "research.nb.err.version": "Этот файл журнала сделан более новой версией сайта.",
        "research.nb.err.tooMany": "В файле записей: {n}, а журнал вмещает не больше {max}.",
        "research.nb.err.entry": "Запись {n} в файле: {problem} Ничего не импортировано.",
        "research.nb.err.shape": "это не запись журнала.",
        "research.nb.err.id": "её идентификатор отсутствует или неверен.",
        "research.nb.err.twice": "её идентификатор встречается в файле дважды.",
        "research.nb.err.time": "её время — не настоящая дата.",
        "research.nb.err.title": "заголовок должен быть текстом длиной от 1 до {max} символов в одну строку.",
        "research.nb.err.text": "заметки должны быть текстом не длиннее {max} символов.",
        "research.nb.err.tool": "указанный инструмент неверен.",
        "research.nb.err.rows": "таблица должна содержать не больше {max} строк из названия и значения, оба — текст.",
        "research.nb.mdTitle": "Исследовательский журнал",
        "research.nb.mdExported": "Экспортировано {date} из AI Compass, исследовательская лаборатория.",
        "research.nb.mdName": "Название",
        "research.nb.mdValue": "Значение"
    }
});

/* ===== 7. THE CATALOGUE (data) =====
   js/research.js reads it with AICompass.content.get("research").
   station   the experiment station (js/research/station.js and its two
             files): ready: false shows the calm "being set up" message and
             loads nothing; its builder sets ready: true.
   groups    the four groups of the bench, in order (names: research.bench.group.<id>)
   tools     every tool of the bench, in order, ONE LINE EACH:
               id     its files are js/research/<id>.js and js/content/research/<id>.js
               ready  false: the card says "Coming soon", cannot be opened, has no
                      Ctrl+K command and asks for no file. A builder who finishes a
                      tool sets ready: true on its line, and changes nothing else here
                      (apart from the four text lines of the tool's name and description).
               group  one of the groups
               css    true: the tool also has css/research/<id>.css (loaded with it)
               units  the units of My path that teach its theory (a unit that this copy
                      of the site does not have yet is simply not shown)
               name, desc   the keys of its name and its one-line description
               icon   its picture: one of "icons" below
   keywords  extra words for the Ctrl+K search of each ready tool (both languages)
   icons     24 × 24 line drawings (currentColor), one per tool */
window.AICompass.content.set("research", {
    station: { ready: true, css: true },
    groups: ["stats", "scale", "theory", "sims"],
    tools: [
        { id: "ci", ready: true, group: "stats", css: false, units: ["b4", "r12"], name: "research.tool.ci.name", desc: "research.tool.ci.desc", icon: "ci" },
        { id: "seeds", ready: true, group: "stats", css: false, units: ["r12", "b4"], name: "research.tool.seeds.name", desc: "research.tool.seeds.desc", icon: "seeds" },
        { id: "many", ready: true, group: "stats", css: false, units: ["r12", "t1"], name: "research.tool.many.name", desc: "research.tool.many.desc", icon: "many" },
        { id: "simpson", ready: true, group: "stats", css: false, units: ["t10", "r12"], name: "research.tool.simpson.name", desc: "research.tool.simpson.desc", icon: "simpson" },
        { id: "sizer", ready: true, group: "scale", css: true, units: ["t9", "r1", "r10"], name: "research.tool.sizer.name", desc: "research.tool.sizer.desc", icon: "sizer" },
        { id: "compute", ready: true, group: "scale", css: false, units: ["r2", "r1"], name: "research.tool.compute.name", desc: "research.tool.compute.desc", icon: "compute" },
        { id: "quant", ready: true, group: "scale", css: false, units: ["r10"], name: "research.tool.quant.name", desc: "research.tool.quant.desc", icon: "quant" },
        { id: "schedule", ready: true, group: "scale", css: true, units: ["r3", "t2"], name: "research.tool.schedule.name", desc: "research.tool.schedule.desc", icon: "schedule" },
        { id: "noise", ready: true, group: "scale", css: false, units: ["r6", "t7"], name: "research.tool.noise.name", desc: "research.tool.noise.desc", icon: "noise" },
        { id: "bounds", ready: true, group: "theory", css: false, units: ["t1"], name: "research.tool.bounds.name", desc: "research.tool.bounds.desc", icon: "bounds" },
        { id: "rates", ready: true, group: "theory", css: false, units: ["t2", "r3"], name: "research.tool.rates.name", desc: "research.tool.rates.desc", icon: "rates" },
        { id: "info", ready: true, group: "theory", css: false, units: ["t3", "r5"], name: "research.tool.info.name", desc: "research.tool.info.desc", icon: "info" },
        { id: "privacy", ready: true, group: "theory", css: true, units: ["t11"], name: "research.tool.privacy.name", desc: "research.tool.privacy.desc", icon: "privacy" },
        { id: "highdim", ready: true, group: "theory", css: false, units: ["t4", "r9"], name: "research.tool.highdim.name", desc: "research.tool.highdim.desc", icon: "highdim" },
        { id: "bandit", ready: true, group: "sims", css: false, units: ["t8", "r7"], name: "research.tool.bandit.name", desc: "research.tool.bandit.desc", icon: "bandit" },
        { id: "descent2", ready: true, group: "sims", css: false, units: ["r4", "t4"], name: "research.tool.descent2.name", desc: "research.tool.descent2.desc", icon: "descent2" }
    ],
    keywords: {
        ci: "confidence interval wilson error bars sample size accuracy test set significance two proportions mcnemar paired p-value доверительный интервал уилсон погрешность размер выборки точность тестовая выборка значимость макнемар",
        seeds: "seeds runs welch t-test paired bootstrap effect size cohen hedges зёрна запуски тест уэлча бутстрэп размер эффекта",
        many: "multiple comparisons bonferroni holm benjamini hochberg false discovery rate best of k множественные сравнения бонферрони холм доля ложных открытий",
        simpson: "simpson paradox confounding confounder mediator collider adjustment backdoor mantel haenszel парадокс симпсона смешивающий фактор медиатор коллайдер поправка",
        sizer: "parameters transformer memory weights kv cache embeddings параметры трансформер память веса кэш эмбеддинги",
        compute: "compute flops training time energy accelerator 6nd tokens вычисления обучение время энергия ускоритель токены",
        quant: "quantisation quantization bits clipping sqnr error квантование биты обрезка ошибка",
        schedule: "learning rate schedule warm-up cosine decay скорость обучения расписание разогрев косинус затухание",
        noise: "diffusion noise schedule snr alpha bar linear cosine диффузия шум расписание сигнал",
        bounds: "generalisation generalization bound hoeffding union bound vc dimension pac sample complexity realisable граница обобщения хёфдинг оценка объединения vc-размерность выборочная сложность",
        rates: "convergence rate gradient descent nesterov acceleration lower bound strongly convex скорость сходимости градиентный спуск нестеров ускорение нижняя граница",
        info: "entropy cross-entropy kl divergence mutual information bits nats perplexity энтропия кросс-энтропия дивергенция взаимная информация биты наты",
        privacy: "differential privacy epsilon delta laplace gaussian composition randomised response certified radius дифференциальная приватность композиция сертифицированный радиус",
        highdim: "high dimensions concentration johnson lindenstrauss marchenko pastur random matrix высокие размерности концентрация случайные матрицы",
        bandit: "bandit regret epsilon greedy ucb thompson sampling lai robbins бандит регрет ucb томпсон",
        descent2: "double descent interpolation overparameterised ridge least squares двойной спуск интерполяция гребневая регрессия"
    },
    icons: {
        ci: '<path d="M12 4v16M8.5 4h7M8.5 20h7"/><circle cx="12" cy="11" r="2.6" fill="currentColor" stroke="none"/>',
        seeds: '<path d="M4 20h16"/><circle cx="6.5" cy="13" r="1.6"/><circle cx="10" cy="9" r="1.6"/><circle cx="14" cy="12" r="1.6"/><circle cx="17.5" cy="7" r="1.6"/>',
        many: '<rect x="4" y="4" width="4" height="4" rx="1"/><rect x="10" y="4" width="4" height="4" rx="1"/><rect x="16" y="4" width="4" height="4" rx="1"/><rect x="4" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor"/><rect x="16" y="10" width="4" height="4" rx="1"/><rect x="4" y="16" width="4" height="4" rx="1"/><rect x="10" y="16" width="4" height="4" rx="1"/><rect x="16" y="16" width="4" height="4" rx="1"/>',
        simpson: '<path d="M4 18 20 6"/><path d="M5 9l4 3M11 13l4 3M14 6l4 3"/>',
        sizer: '<rect x="5" y="4" width="14" height="4" rx="1.2"/><rect x="5" y="10" width="14" height="4" rx="1.2"/><rect x="5" y="16" width="14" height="4" rx="1.2"/>',
        compute: '<rect x="7" y="7" width="10" height="10" rx="1.6"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
        quant: '<path d="M4 19h3v-3h3v-3h3v-3h3V7h4"/><path d="M4 19 20 5" stroke-dasharray="1.5 2.5"/>',
        schedule: '<path d="M4 19V5"/><path d="M4 19h16"/><path d="M5 17 8 7c2 0 4 5 6.5 8.5S19 18 20 18"/>',
        noise: '<path d="M3 12c1.5-6 3-6 4.5 0s3 6 4.5 0 3-4 4.5 0 2.5 2 4 0"/>',
        bounds: '<path d="M4 4v16h16"/><path d="M6.5 6c1.5 6 5 9 13 10"/><path d="M4 12h16" stroke-dasharray="2 2"/>',
        rates: '<path d="M4 5h4v4h4v4h4v4h4"/><circle cx="20" cy="17" r="1.6" fill="currentColor" stroke="none"/>',
        info: '<circle cx="9" cy="12" r="5.5"/><circle cx="15" cy="12" r="5.5"/>',
        privacy: '<path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z"/><path d="M9 12l2 2 4-4"/>',
        highdim: '<path d="M5 8h10v10H5z"/><path d="M9 4h10v10H9z"/><path d="M5 8l4-4M15 8l4-4M15 18l4-4M5 18l4-4"/>',
        bandit: '<rect x="4" y="6" width="12" height="13" rx="2"/><path d="M7 11h6M7 14h6"/><path d="M18 14V7"/><circle cx="18" cy="5.5" r="1.6"/>',
        descent2: '<path d="M4 4v16h16"/><path d="M5.5 9c2 4 4 4 5.5 1.5S13 4 14 9s2 7 6 8"/>'
    }
});
