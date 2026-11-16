/* =========================================================
   AI COMPASS — TEXTS AND DATA: "GROW A DECISION TREE" (js/lab/tree.js)
   Keys: lab.tree.*  The shared words (Play, Step, Reset...) are lab.kit.*
   in js/content/lab/kit.js. Plurals: "one|other" (English), "one|few|many"
   (Russian). The two tables of examples are at the end (lab.tree data).
   Its title, hook and big idea are in js/content/lab.js (section 3): the lab's picker shows
   them before this file is loaded.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- The two tables -----
        "lab.tree.data": "Examples",
        "lab.tree.dataAnimals": "Animals",
        "lab.tree.dataCycling": "Cycling days",
        "lab.tree.aboutAnimals": "16 animals to sort into mammals, birds, fish and insects. Watch out for the tricky ones: a bat flies, a penguin swims, a platypus lays eggs.",
        "lab.tree.aboutCycling": "24 days: did Sam go cycling? Sam mostly goes when it isn't raining and it's warm or a friend comes along, but people aren't perfectly predictable: on a few days Sam did something else for no reason in the table.",

        // ----- Classes -----
        "lab.tree.class.mammal": "Mammal",
        "lab.tree.class.bird": "Bird",
        "lab.tree.class.fish": "Fish",
        "lab.tree.class.insect": "Insect",
        "lab.tree.class.go": "Goes cycling",
        "lab.tree.class.stay": "Stays home",

        // ----- Questions (the features) -----
        "lab.tree.q.fur": "Does it have fur?",
        "lab.tree.q.feathers": "Does it have feathers?",
        "lab.tree.q.eggs": "Does it lay eggs?",
        "lab.tree.q.water": "Does it live in water?",
        "lab.tree.q.fly": "Can it fly?",
        "lab.tree.q.sixLegs": "Does it have six legs?",
        "lab.tree.q.rainy": "Is it raining?",
        "lab.tree.q.sunny": "Is it sunny?",
        "lab.tree.q.warm": "Is it warm?",
        "lab.tree.q.windy": "Is it windy?",
        "lab.tree.q.weekend": "Is it the weekend?",
        "lab.tree.q.friend": "Is a friend free to come?",
        "lab.tree.short.fur": "Fur",
        "lab.tree.short.feathers": "Feathers",
        "lab.tree.short.eggs": "Eggs",
        "lab.tree.short.water": "Water",
        "lab.tree.short.fly": "Flies",
        "lab.tree.short.sixLegs": "6 legs",
        "lab.tree.short.rainy": "Rain",
        "lab.tree.short.sunny": "Sun",
        "lab.tree.short.warm": "Warm",
        "lab.tree.short.windy": "Wind",
        "lab.tree.short.weekend": "Weekend",
        "lab.tree.short.friend": "Friend",

        // ----- The tree -----
        "lab.tree.treeTitle": "The tree",
        "lab.tree.treeHelp": "Pick a box, then pick a question for it on the right (below on a phone).",
        "lab.tree.yes": "Yes",
        "lab.tree.no": "No",
        "lab.tree.leafSays": "Says: {label}",
        "lab.tree.examples": "{n} example|{n} examples",
        "lab.tree.messiness": "Messiness {n}",
        "lab.tree.pure": "Tidy",
        "lab.tree.nodeLabel": "{path}: {n}, says {label}, messiness {gini}",
        "lab.tree.nodeSplitLabel": "{path}: asks “{question}”, {n}",
        "lab.tree.rootPath": "Start",
        "lab.tree.chosen": "Chosen box",

        // ----- Splitting -----
        "lab.tree.splitTitle": "Ask a question",
        "lab.tree.splitHelp": "The bar shows how messy the two new boxes would be together (shorter is tidier). Now: {now}.",
        "lab.tree.splitLeaf": "This box is already tidy: every example in it has the same answer.",
        "lab.tree.splitDone": "This box already asks a question. Remove it to try another one.",
        "lab.tree.splitAfter": "after: {n}",
        "lab.tree.splitUseless": "doesn't split",
        "lab.tree.best": "Let the computer choose",
        "lab.tree.remove": "Remove this question",
        "lab.tree.grow": "Grow the whole tree",
        "lab.tree.depth": "Deepest level",
        "lab.tree.depthHint": "How many questions in a row the computer may ask at most.",
        "lab.tree.clear": "Start again",

        // ----- Numbers -----
        "lab.tree.questions": "Questions",
        "lab.tree.levels": "Levels",
        "lab.tree.trainAcc": "Right on training",
        "lab.tree.testAcc": "Right on new examples",

        // ----- Tables -----
        "lab.tree.tableTrain": "Training examples ({n})",
        "lab.tree.tableTest": "New examples the tree has never seen ({n})",
        "lab.tree.colName": "Example",
        "lab.tree.colYes": "Yes to",
        "lab.tree.colAnswer": "Answer",
        "lab.tree.colGuess": "Tree says",
        "lab.tree.right": "right",
        "lab.tree.wrong": "wrong",
        "lab.tree.dayName": "Day {n}",

        // ----- What's happening? -----
        "lab.tree.step1": "Every box holds examples. Its <strong>messiness</strong> is the chance that two examples picked from it at random have different answers: 0 means all the same. The first box: <strong>{gini}</strong>.",
        "lab.tree.step2": "A good question splits a box into two tidier boxes. Your last question took the messiness from <strong>{before}</strong> down to <strong>{after}</strong>.",
        "lab.tree.step3": "To answer, the tree follows the questions down to a box and says its most common answer. Training: <strong>{train}</strong> right. New examples: <strong>{test}</strong> right.",
        "lab.tree.noteOverfit": "The tree is right about almost every training day, but worse on new days. The deep questions learned the odd days by heart, not the rule. This is called overfitting.",
        "lab.tree.noteAnimals": "Real biologists sort animals by their bodies and history, not by these six questions. This tree is a toy, but the way it is grown is the real thing.",
        "lab.tree.describe": "A decision tree with {q} questions and {levels} levels. Right on training: {train}. Right on new examples: {test}.",
        "lab.tree.saidSplit": "Split with “{question}”. Messiness {before} → {after}.",
        "lab.tree.saidGrow": "Grown: {q} questions, {test} right on new examples.",

        // ----- Try this -----
        "lab.tree.ch1": "Split the first box yourself with a question that makes it tidier.",
        "lab.tree.ch1Why": "A good question separates the answers. Measuring “tidier” with a number is how a computer picks questions without understanding them.",
        "lab.tree.ch2": "Animals: sort all 16 training animals correctly with 4 questions or fewer.",
        "lab.tree.ch2Why": "Short trees are easy for people to read and check. That's a big reason why decision trees are still used: you can see why it decided.",
        "lab.tree.ch3": "Cycling days: grow a tree 6 levels deep. Compare the two accuracies.",
        "lab.tree.ch3Why": "The big tree memorised every odd day, so it scores higher on training than on new days. Doing great on practice and worse on the real test is overfitting.",
        "lab.tree.ch4": "Cycling days: find a tree with 3 questions or fewer that is right on at least 75% of the new days.",
        "lab.tree.ch4Why": "A smaller tree that learned only the main rule often does better on new examples. Limiting the depth is one way to stop overfitting.",
        "lab.tree.ideaLine": "A chain of yes/no questions like this is called a",
        "lab.tree.term": "decision tree"
    },
    ru: {
        "lab.tree.data": "Примеры",
        "lab.tree.dataAnimals": "Животные",
        "lab.tree.dataCycling": "Дни для велопрогулки",
        "lab.tree.aboutAnimals": "16 животных: раздели их на млекопитающих, птиц, рыб и насекомых. Осторожно, есть хитрые: летучая мышь летает, пингвин плавает, а утконос откладывает яйца.",
        "lab.tree.aboutCycling": "24 дня: поехал ли Саша кататься на велосипеде? Обычно он едет, когда нет дождя и тепло или может пойти друг. Но люди не всегда предсказуемы: в несколько дней Саша поступил иначе без причины, видной в таблице.",

        "lab.tree.class.mammal": "Млекопитающее",
        "lab.tree.class.bird": "Птица",
        "lab.tree.class.fish": "Рыба",
        "lab.tree.class.insect": "Насекомое",
        "lab.tree.class.go": "Едет кататься",
        "lab.tree.class.stay": "Остаётся дома",

        "lab.tree.q.fur": "Есть ли у него шерсть?",
        "lab.tree.q.feathers": "Есть ли у него перья?",
        "lab.tree.q.eggs": "Откладывает ли оно яйца?",
        "lab.tree.q.water": "Живёт ли оно в воде?",
        "lab.tree.q.fly": "Умеет ли оно летать?",
        "lab.tree.q.sixLegs": "Шесть ли у него ног?",
        "lab.tree.q.rainy": "Идёт ли дождь?",
        "lab.tree.q.sunny": "Солнечно ли?",
        "lab.tree.q.warm": "Тепло ли?",
        "lab.tree.q.windy": "Ветрено ли?",
        "lab.tree.q.weekend": "Выходной ли сегодня?",
        "lab.tree.q.friend": "Свободен ли друг?",
        "lab.tree.short.fur": "Шерсть",
        "lab.tree.short.feathers": "Перья",
        "lab.tree.short.eggs": "Яйца",
        "lab.tree.short.water": "Вода",
        "lab.tree.short.fly": "Летает",
        "lab.tree.short.sixLegs": "6 ног",
        "lab.tree.short.rainy": "Дождь",
        "lab.tree.short.sunny": "Солнце",
        "lab.tree.short.warm": "Тепло",
        "lab.tree.short.windy": "Ветер",
        "lab.tree.short.weekend": "Выходной",
        "lab.tree.short.friend": "Друг",

        "lab.tree.treeTitle": "Дерево",
        "lab.tree.treeHelp": "Выбери коробку, а потом выбери для неё вопрос справа (на телефоне — ниже).",
        "lab.tree.yes": "Да",
        "lab.tree.no": "Нет",
        "lab.tree.leafSays": "Ответ: {label}",
        "lab.tree.examples": "{n} пример|{n} примера|{n} примеров",
        "lab.tree.messiness": "Беспорядок {n}",
        "lab.tree.pure": "Порядок",
        "lab.tree.nodeLabel": "{path}: {n}, ответ — {label}, беспорядок {gini}",
        "lab.tree.nodeSplitLabel": "{path}: вопрос «{question}», {n}",
        "lab.tree.rootPath": "Начало",
        "lab.tree.chosen": "Выбранная коробка",

        "lab.tree.splitTitle": "Задай вопрос",
        "lab.tree.splitHelp": "Полоска показывает, насколько беспорядочными будут две новые коробки вместе (короче — аккуратнее). Сейчас: {now}.",
        "lab.tree.splitLeaf": "В этой коробке уже порядок: у всех примеров одинаковый ответ.",
        "lab.tree.splitDone": "Эта коробка уже задаёт вопрос. Убери его, чтобы попробовать другой.",
        "lab.tree.splitAfter": "после: {n}",
        "lab.tree.splitUseless": "не делит",
        "lab.tree.best": "Пусть выберет компьютер",
        "lab.tree.remove": "Убрать этот вопрос",
        "lab.tree.grow": "Вырастить всё дерево",
        "lab.tree.depth": "Самый глубокий уровень",
        "lab.tree.depthHint": "Сколько вопросов подряд компьютер может задать самое большее.",
        "lab.tree.clear": "Начать заново",

        "lab.tree.questions": "Вопросы",
        "lab.tree.levels": "Уровни",
        "lab.tree.trainAcc": "Верно на обучающих",
        "lab.tree.testAcc": "Верно на новых",

        "lab.tree.tableTrain": "Обучающие примеры ({n})",
        "lab.tree.tableTest": "Новые примеры, которых дерево не видело ({n})",
        "lab.tree.colName": "Пример",
        "lab.tree.colYes": "«Да» на",
        "lab.tree.colAnswer": "Ответ",
        "lab.tree.colGuess": "Дерево говорит",
        "lab.tree.right": "верно",
        "lab.tree.wrong": "неверно",
        "lab.tree.dayName": "День {n}",

        "lab.tree.step1": "В каждой коробке лежат примеры. Её <strong>беспорядок</strong> — это шанс, что два случайно взятых из неё примера имеют разные ответы: 0 значит, что ответы у всех одинаковые. Первая коробка: <strong>{gini}</strong>.",
        "lab.tree.step2": "Хороший вопрос делит коробку на две более аккуратные. Твой последний вопрос снизил беспорядок с <strong>{before}</strong> до <strong>{after}</strong>.",
        "lab.tree.step3": "Чтобы ответить, дерево идёт по вопросам вниз до коробки и называет её самый частый ответ. Обучающие примеры: верно <strong>{train}</strong>. Новые примеры: верно <strong>{test}</strong>.",
        "lab.tree.noteOverfit": "Дерево угадывает почти все обучающие дни, но хуже — новые. Глубокие вопросы выучили наизусть странные дни, а не правило. Это называется переобучением.",
        "lab.tree.noteAnimals": "Настоящие биологи сортируют животных по строению тела и происхождению, а не по этим шести вопросам. Это дерево — игрушка, но растёт оно по-настоящему.",
        "lab.tree.describe": "Дерево решений: вопросов — {q}, уровней — {levels}. Верно на обучающих: {train}. Верно на новых: {test}.",
        "lab.tree.saidSplit": "Деление вопросом «{question}». Беспорядок {before} → {after}.",
        "lab.tree.saidGrow": "Дерево выросло: вопросов — {q}, на новых примерах верно {test}.",

        "lab.tree.ch1": "Сам раздели первую коробку вопросом, после которого станет аккуратнее.",
        "lab.tree.ch1Why": "Хороший вопрос разделяет ответы. Измеряя «аккуратность» числом, компьютер выбирает вопросы, не понимая их смысла.",
        "lab.tree.ch2": "Животные: правильно рассортируй всех 16 обучающих животных, задав не больше 4 вопросов.",
        "lab.tree.ch2Why": "Короткое дерево легко прочитать и проверить человеку. Во многом поэтому деревья решений до сих пор используют: видно, почему оно так решило.",
        "lab.tree.ch3": "Дни для велопрогулки: вырасти дерево глубиной 6 уровней. Сравни две точности.",
        "lab.tree.ch3Why": "Большое дерево запомнило каждый странный день, поэтому на обучающих оно лучше, чем на новых. Отлично на тренировке и хуже на настоящей проверке — это переобучение.",
        "lab.tree.ch4": "Дни для велопрогулки: найди дерево не больше чем с 3 вопросами, которое верно хотя бы на 75% новых дней.",
        "lab.tree.ch4Why": "Маленькое дерево, выучившее только главное правило, часто лучше справляется с новыми примерами. Ограничить глубину — один из способов бороться с переобучением.",
        "lab.tree.ideaLine": "Такая цепочка вопросов «да/нет» называется",
        "lab.tree.term": "дерево решений"
    }
});

// The examples. Each one: its name key (or a day number), its answers to the questions
// (1 = yes, 0 = no) in the order of "features", and its class.
// Animals: true facts, simplified to yes/no. (A dolphin has a few hairs at birth: "no fur" here.)
window.AICompass.content.set("lab.tree", {
    animals: {
        features: ["fur", "feathers", "eggs", "water", "fly", "sixLegs"],
        classes: ["mammal", "bird", "fish", "insect"],
        names: {
            en: {
                dog: "Dog", cat: "Cat", bat: "Bat", dolphin: "Dolphin", platypus: "Platypus", sparrow: "Sparrow",
                penguin: "Penguin", ostrich: "Ostrich", eagle: "Eagle", salmon: "Salmon", tuna: "Tuna",
                goldfish: "Goldfish", flyingFish: "Flying fish", bee: "Bee", ant: "Ant", beetle: "Diving beetle",
                horse: "Horse", whale: "Whale", duck: "Duck", parrot: "Parrot", trout: "Trout",
                butterfly: "Butterfly", seahorse: "Seahorse", hedgehog: "Hedgehog"
            },
            ru: {
                dog: "Собака", cat: "Кошка", bat: "Летучая мышь", dolphin: "Дельфин", platypus: "Утконос", sparrow: "Воробей",
                penguin: "Пингвин", ostrich: "Страус", eagle: "Орёл", salmon: "Лосось", tuna: "Тунец",
                goldfish: "Золотая рыбка", flyingFish: "Летучая рыба", bee: "Пчела", ant: "Муравей", beetle: "Жук-плавунец",
                horse: "Лошадь", whale: "Кит", duck: "Утка", parrot: "Попугай", trout: "Форель",
                butterfly: "Бабочка", seahorse: "Морской конёк", hedgehog: "Ёж"
            }
        },
        //            fur feathers eggs water fly sixLegs
        train: [
            ["dog",        [1, 0, 0, 0, 0, 0], "mammal"],
            ["cat",        [1, 0, 0, 0, 0, 0], "mammal"],
            ["bat",        [1, 0, 0, 0, 1, 0], "mammal"],
            ["dolphin",    [0, 0, 0, 1, 0, 0], "mammal"],
            ["platypus",   [1, 0, 1, 1, 0, 0], "mammal"],
            ["sparrow",    [0, 1, 1, 0, 1, 0], "bird"],
            ["penguin",    [0, 1, 1, 1, 0, 0], "bird"],
            ["ostrich",    [0, 1, 1, 0, 0, 0], "bird"],
            ["eagle",      [0, 1, 1, 0, 1, 0], "bird"],
            ["salmon",     [0, 0, 1, 1, 0, 0], "fish"],
            ["tuna",       [0, 0, 1, 1, 0, 0], "fish"],
            ["goldfish",   [0, 0, 1, 1, 0, 0], "fish"],
            ["flyingFish", [0, 0, 1, 1, 1, 0], "fish"],
            ["bee",        [0, 0, 1, 0, 1, 1], "insect"],
            ["ant",        [0, 0, 1, 0, 0, 1], "insect"],
            ["beetle",     [0, 0, 1, 1, 1, 1], "insect"]
        ],
        test: [
            ["horse",      [1, 0, 0, 0, 0, 0], "mammal"],
            ["whale",      [0, 0, 0, 1, 0, 0], "mammal"],
            ["duck",       [0, 1, 1, 1, 1, 0], "bird"],
            ["parrot",     [0, 1, 1, 0, 1, 0], "bird"],
            ["trout",      [0, 0, 1, 1, 0, 0], "fish"],
            ["butterfly",  [0, 0, 1, 0, 1, 1], "insect"],
            ["seahorse",   [0, 0, 1, 1, 0, 0], "fish"],
            ["hedgehog",   [1, 0, 0, 0, 0, 0], "mammal"]
        ]
    },
    // Cycling days are made by js/lab/tree.js from a fixed seed (section 2): the rule and
    // the share of "odd" days are its settings.
    cycling: {
        features: ["rainy", "sunny", "warm", "windy", "weekend", "friend"],
        classes: ["go", "stay"]
    }
});
